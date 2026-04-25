import { type NextRequest, NextResponse } from 'next/server';

import { streamChat, type LlmMessage } from '@/lib/llm';
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

  const stream = new ReadableStream({
    async start(controller) {
      const signal = request.signal;
      try {
        for await (const token of streamChat(messages, undefined, signal)) {
          controller.enqueue(encoder.encode(token));
        }
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          controller.error(err);
          return;
        }
      } finally {
        controller.close();
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
