import { type NextRequest } from 'next/server';

import { getAuthUser } from '@/lib/auth';
import { validateLlmConfiguration } from '@/lib/llm';
import { getSchemeContext } from '@/lib/schemes';
import { runEligibilityCheck } from '@/lib/eligibility/pipeline';
import type { EligibilityCheckResult, EligibilityProgressEvent } from '@/lib/api/eligibility-client';

const MAX_CONTEXT_CHARS = 10_000;

type StreamEvent =
  | EligibilityProgressEvent
  | { type: 'result'; result: EligibilityCheckResult; at: number }
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

  const document = await getSchemeContext(schemeId);
  if (!document) {
    return new Response(
      JSON.stringify({ type: 'error', message: 'Scheme not found' }) + '\n',
      { status: 404, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }

  const scheme = document;
  const body = (await request.json()) as { userContext?: string };
  const { userContext } = body;

  if (!userContext || typeof userContext !== 'string' || !userContext.trim()) {
    return new Response(
      JSON.stringify({ type: 'error', message: 'userContext is required' }) + '\n',
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
          safeContext,
          (event) => send(event),
        );
        send({ type: 'result', result, at: timeNow() });
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
