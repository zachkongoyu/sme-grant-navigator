import { type NextRequest } from 'next/server';

import { getAuthUser } from '@/lib/auth';
import { validateLlmConfiguration } from '@/lib/llm';
import { getSchemeContext } from '@/lib/schemes';
import { runEligibilityCheck } from '@/lib/eligibility/pipeline';
import type { EligibilityCheckResult, EligibilityProgressEvent } from '@/lib/api/eligibility-client';
import { extractFiles, fetchUrls, extractUrlsFromText } from '@/lib/attachments/extract';
import { createClient } from '@/lib/supabase/server';

const MAX_CONTEXT_CHARS = 10_000;

type StreamEvent =
  | EligibilityProgressEvent
  | { type: 'result'; result: EligibilityCheckResult; warnings: string[]; at: number }
  | { type: 'error'; message: string; at: number };

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schemeId: string }> },
) {
  const user = await getAuthUser();
  if (!user) {
    return new Response(
      JSON.stringify({ type: 'error', message: 'Unauthorized' }) + '\n',
      { status: 401, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }

  const { schemeId } = await params;

  // Credit gate — deduct before AI call
  const supabase = await createClient();
  const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_eligibility_check', { p_user_id: user.id });
  if (consumeError) {
    return new Response(
      JSON.stringify({ type: 'error', message: 'Failed to verify credit balance' }) + '\n',
      { status: 500, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }
  if (consumeResult === 'insufficient') {
    return new Response(
      JSON.stringify({ type: 'error', message: 'Insufficient credits. Top up to continue.' }) + '\n',
      { status: 402, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }

  const document = await getSchemeContext(schemeId);
  if (!document) {
    return new Response(
      JSON.stringify({ type: 'error', message: 'Scheme not found' }) + '\n',
      { status: 404, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }

  const scheme = document;
  const formData = await request.formData();
  const userContextRaw = formData.get('userContext');
  const fileEntries = formData.getAll('files');
  const urlEntries = formData.getAll('urls');

  const userContext = typeof userContextRaw === 'string' ? userContextRaw : '';
  const files = fileEntries.filter((e): e is File => e instanceof File);
  const urls = urlEntries.filter((e): e is string => typeof e === 'string');

  if (!userContext.trim() && files.length === 0 && urls.length === 0) {
    return new Response(
      JSON.stringify({ type: 'error', message: 'userContext or at least one attachment is required' }) + '\n',
      { status: 400, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }

  try {
    validateLlmConfiguration();
  } catch {
    return new Response(
      JSON.stringify({ type: 'error', message: 'LLM not configured' }) + '\n',
      { status: 503, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }

  const safeContext = userContext.slice(0, MAX_CONTEXT_CHARS);

  const inlineUrls = extractUrlsFromText(safeContext);
  const allUrls = [...new Set([...inlineUrls, ...urls])];

  const { results: extractedFiles, warnings: fileWarnings } = await extractFiles(files);
  const { results: fetchedUrls, warnings: urlWarnings } = await fetchUrls(allUrls);

  const warnings = [
    ...fileWarnings.map((w) => `${w.source}: ${w.message}`),
    ...urlWarnings.map((w) => `${w.source}: ${w.message}`),
  ];

  const contextParts: string[] = [];
  if (safeContext) contextParts.push(safeContext);
  for (const ef of extractedFiles) {
    if (ef.text) contextParts.push(`--- ${ef.name} ---\n${ef.text}`);
  }
  for (const fu of fetchedUrls) {
    if (fu.text) contextParts.push(`--- Link: ${fu.url} ---\n${fu.text}`);
  }
  const enrichedContext = contextParts.join('\n\n');

  const encoder = new TextEncoder();
  const timeNow = () => Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = (event: StreamEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        } catch {
          closed = true;
        }
      };

      const close = () => {
        if (closed) return;
        closed = true;
        try { controller.close(); } catch { /* stream already closed */ }
      };

      try {
        const result = await runEligibilityCheck(
          scheme,
          scheme.corpus,
          enrichedContext,
          (event) => send(event),
        );
        send({ type: 'result', result, warnings, at: timeNow() });
      } catch (err) {
        console.error('Eligibility assessment error:', err);
        send({ type: 'error', message: 'Assessment failed. Please try again.', at: timeNow() });
      }

      close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson', 'X-Accel-Buffering': 'no' },
  });
}
