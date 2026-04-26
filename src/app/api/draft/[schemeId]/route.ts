import { type NextRequest, NextResponse } from 'next/server';

import {
  LlmHttpError,
  openChatStream,
  type LlmMessage,
  validateLlmConfiguration,
} from '@/lib/llm';
import { loadCorpus } from '@/lib/schemes/corpus';
import { getSchemeByIdFromDatabase } from '@/lib/schemes/db';
import { buildDrafterSystemPrompt } from '@/lib/prompts/system';

const MAX_CONTEXT_CHARS = 20_000;
const MAX_ATTACHMENT_CHARS = 30_000;
const MAX_LINK_RESPONSE_BYTES = 50_000;
const LINK_FETCH_TIMEOUT_MS = 5_000;
const MAX_LINKS = 5;

const encoder = new TextEncoder();

interface InlineAttachment {
  name: string;
  text: string;
}

interface DraftRequestBody {
  userContext: string;
  inlineAttachments?: InlineAttachment[];
  links?: string[];
  history?: ReadonlyArray<{ role: 'user' | 'assistant'; content: string }>;
}

function toDraftErrorMessage(error: unknown): string {
  if (error instanceof LlmHttpError && error.status === 403) {
    return 'Thunder cannot generate a draft for this scheme right now. Please try again later.';
  }

  return 'Thunder could not generate a draft right now. Please try again later.';
}

function toDraftErrorStatus(error: unknown): number {
  if (error instanceof LlmHttpError) {
    return error.status;
  }

  return 500;
}

/**
 * Guard against SSRF: rejects localhost, loopback, link-local, and RFC-1918 addresses.
 * Returns true if the URL should be blocked.
 */
function isPrivateUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '::1' || host === '[::1]') return true;
    const parts = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (parts) {
      const [a, b] = [Number(parts[1]), Number(parts[2])];
      if (a === 10) return true;
      if (a === 127) return true;
      if (a === 169 && b === 254) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
      if (a === 0) return true;
    }
    return false;
  } catch {
    return true;
  }
}

async function fetchLinkText(url: string): Promise<string> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), LINK_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Thunder-Grant-Drafter/1.0' },
    });
    if (!res.ok) return '';
    const raw = await res.arrayBuffer();
    const text = new TextDecoder('utf-8', { fatal: false }).decode(
      raw.slice(0, MAX_LINK_RESPONSE_BYTES),
    );
    // Strip HTML tags for HTML pages
    if (res.headers.get('content-type')?.includes('text/html')) {
      return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return text;
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schemeId: string }> },
) {
  const { schemeId } = await params;

  const scheme = await getSchemeByIdFromDatabase(schemeId);
  if (!scheme) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });

  const body = (await request.json()) as DraftRequestBody;
  const { userContext, inlineAttachments = [], links = [], history = [] } = body;

  if (!userContext || typeof userContext !== 'string' || userContext.trim().length === 0) {
    return NextResponse.json({ error: 'userContext is required' }, { status: 400 });
  }

  const safeContext = userContext.slice(0, MAX_CONTEXT_CHARS);

  // Build attachment context block from inline file texts and fetched links.
  const contextParts: string[] = [];

  if (inlineAttachments.length > 0) {
    let raw = inlineAttachments
      .filter((a) => a.text)
      .map((a) => `--- ${a.name} ---\n${a.text}`)
      .join('\n\n');
    if (raw.length > MAX_ATTACHMENT_CHARS) {
      raw = raw.slice(0, MAX_ATTACHMENT_CHARS) + '\n[Attachment content truncated]';
    }
    if (raw) contextParts.push(raw);
  }

  if (links.length > 0) {
    const validLinks = links.slice(0, MAX_LINKS).filter((url) => !isPrivateUrl(url));
    for (const url of validLinks) {
      const text = await fetchLinkText(url);
      if (text) contextParts.push(`--- Link: ${url} ---\n${text}`);
    }
  }

  const attachmentContext = contextParts.join('\n\n');
  const userContent = attachmentContext
    ? `${safeContext}\n\n<attachments>\n${attachmentContext}\n</attachments>`
    : safeContext;

  const corpus = await loadCorpus(schemeId);
  const systemPrompt = buildDrafterSystemPrompt(scheme, corpus);

  const messages: LlmMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userContent },
  ];

  try {
    validateLlmConfiguration();
  } catch (error) {
    return NextResponse.json({ error: toDraftErrorMessage(error) }, { status: 500 });
  }

  let upstreamReader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    upstreamReader = await openChatStream(messages, undefined, request.signal);
  } catch (error) {
    return NextResponse.json(
      { error: toDraftErrorMessage(error) },
      { status: toDraftErrorStatus(error) },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      let buffer = '';
      let isClosed = false;

      try {
        while (true) {
          const { done, value } = await upstreamReader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              controller.close();
              isClosed = true;
              return;
            }

            try {
              const chunk = JSON.parse(data) as {
                choices: [{ delta: { content?: string } }];
              };
              const token = chunk.choices[0]?.delta?.content;
              if (token) {
                controller.enqueue(encoder.encode(token));
              }
            } catch {
              // Ignore individual chunk parse errors; move to the next line.
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          console.error('Draft stream error:', err);
          controller.enqueue(encoder.encode(toDraftErrorMessage(err)));
        }
      } finally {
        upstreamReader.releaseLock();
        if (!isClosed) {
          controller.close();
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
