import { type NextRequest, NextResponse } from 'next/server';

import {
  type LlmMessage,
  streamChat,
  validateLlmConfiguration,
} from '@/lib/llm';
import { getSchemeContext } from '@/lib/schemes';
import { buildDrafterSystemPrompt } from '@/lib/prompts/drafter';
import {
  createDoneEvent,
  createTokenEvent,
  encodeSseEvent,
} from '@/components/chat/stream-events';
import { getAuthUser } from '@/lib/auth';
import { extractFiles, fetchUrls, extractUrlsFromText } from '@/lib/attachments/extract';
import { createClient } from '@/lib/supabase/server';
import { BILLING } from '@/config/billing';

const MAX_CONTEXT_CHARS    = 20_000;
const MAX_ATTACHMENT_CHARS = 30_000;

function toDraftErrorMessage(): string {
  return 'Thunder could not generate a draft right now. Please try again later.';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schemeId: string }> },
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { schemeId } = await params;

  // Credit gate — deduct before AI call
  const supabase = await createClient();
  const { data: deducted, error: deductError } = await supabase.rpc('deduct_credit', {
    p_user_id: user.id,
    p_amount: BILLING.creditCost.draft,
  });
  if (deductError) {
    return NextResponse.json({ error: 'Failed to verify credit balance' }, { status: 500 });
  }
  if (!deducted) {
    return NextResponse.json({ error: 'Insufficient credits. Top up to continue.' }, { status: 402 });
  }

  const document = await getSchemeContext(schemeId);
  if (!document) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });

  const scheme = document;

  const formData = await request.formData();
  const userContextRaw = formData.get('userContext');
  const fileEntries = formData.getAll('files');
  const urlEntries = formData.getAll('urls');
  const historyRaw = formData.get('history');

  const userContext = typeof userContextRaw === 'string' ? userContextRaw : '';
  const files = fileEntries.filter((e): e is File => e instanceof File);
  const urls = urlEntries.filter((e): e is string => typeof e === 'string');
  const history = historyRaw
    ? (JSON.parse(historyRaw as string) as ReadonlyArray<{ role: 'user' | 'assistant'; content: string }>)
    : [];

  if (!userContext || typeof userContext !== 'string' || userContext.trim().length === 0) {
    return NextResponse.json({ error: 'userContext is required' }, { status: 400 });
  }

  const safeContext = userContext.slice(0, MAX_CONTEXT_CHARS);

  const inlineUrls = extractUrlsFromText(safeContext);
  const allUrls = [...new Set([...inlineUrls, ...urls])];

  const { results: extractedFiles } = await extractFiles(files);
  const { results: fetchedUrls } = await fetchUrls(allUrls);

  const contextParts: string[] = [];
  for (const ef of extractedFiles) {
    if (ef.text) contextParts.push(`--- ${ef.name} ---\n${ef.text}`);
  }
  for (const fu of fetchedUrls) {
    if (fu.text) contextParts.push(`--- Link: ${fu.url} ---\n${fu.text}`);
  }

  let attachmentRaw = contextParts.join('\n\n');
  if (attachmentRaw.length > MAX_ATTACHMENT_CHARS) {
    attachmentRaw = attachmentRaw.slice(0, MAX_ATTACHMENT_CHARS) + '\n[Attachment content truncated]';
  }

  const userContent = attachmentRaw
    ? `${safeContext}\n\n<attachments>\n${attachmentRaw}\n</attachments>`
    : safeContext;

  const systemPrompt = buildDrafterSystemPrompt(scheme, scheme.corpus);

  const messages: LlmMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userContent },
  ];

  try {
    validateLlmConfiguration();
  } catch {
    return NextResponse.json({ error: toDraftErrorMessage() }, { status: 500 });
  }

  const stream = new ReadableStream({
    async start(controller) {
        let shouldClose = false;

      try {
        for await (const token of streamChat(messages, undefined, request.signal)) {
          controller.enqueue(encodeSseEvent(createTokenEvent(token)));
        }
        controller.enqueue(encodeSseEvent(createDoneEvent()));
          shouldClose = true;
      } catch (err) {
          if ((err as Error)?.name === 'AbortError') {
            shouldClose = true;
            return;
        }

          console.error('Draft stream error:', err);
          controller.error(new Error(toDraftErrorMessage()));
          return;
      } finally {
          if (shouldClose) {
            try {
              controller.close();
            } catch {
              // The stream may already be closed or canceled by the client.
            }
          }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
