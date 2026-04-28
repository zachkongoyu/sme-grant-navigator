import vm from 'node:vm';

import { type NextRequest } from 'next/server';

import {
  runAgentLoop,
  structureOutput,
  type AgentEvent,
  type JsonSchemaResponseFormat,
  type ToolDefinition,
  validateLlmConfiguration,
} from '@/lib/llm';
import { getSchemeDocument } from '@/lib/schemes/repository';
import { buildEligibilityAnalysisPrompt, buildEligibilityUserMessage } from '@/lib/prompts/eligibility';
import type { EligibilityCheckResult } from '@/lib/api/eligibility-client';

const MAX_CONTEXT_CHARS = 10_000;

const ELIGIBILITY_SCHEMA: JsonSchemaResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'eligibility_check_result',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        verdict: { type: 'string', enum: ['eligible', 'likely_eligible', 'ineligible', 'incomplete'] },
        summary: { type: 'string' },
        criteria: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              id: { type: 'string' },
              description: { type: 'string' },
              status: { type: 'string', enum: ['pass', 'fail', 'unclear', 'missing'] },
              detail: { type: 'string' },
              user_input_used: { type: ['string', 'null'] },
              source_rule: { type: 'string' },
              followup_question: { type: ['string', 'null'] },
            },
            required: ['id', 'description', 'status', 'detail', 'user_input_used', 'source_rule', 'followup_question'],
          },
        },
        blockers: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              criterion_id: { type: 'string' },
              reason: { type: 'string' },
            },
            required: ['criterion_id', 'reason'],
          },
        },
        tips: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              area: { type: 'string' },
              advice: { type: 'string' },
            },
            required: ['area', 'advice'],
          },
        },
      },
      required: ['verdict', 'summary', 'criteria', 'blockers', 'tips'],
    },
  },
};


function createLoopLogger(loopId: string) {
  return (stage: string, details?: Record<string, unknown>) => {
    if (details) {
      console.log(`[eligibility:${loopId}] ${stage}`, details);
      return;
    }
    console.log(`[eligibility:${loopId}] ${stage}`);
  };
}

// ── run_code sandbox ──────────────────────────────────────────────────────
// Runs untrusted LLM-generated JavaScript in a Node vm with no access to
// require, process, or the filesystem. Used only for numeric comparisons.

const RUN_CODE_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'run_code',
    description:
      'Run JavaScript to perform any deterministic eligibility check: thresholds, amounts, ratios, durations, date windows, named-list membership. ' +
      'Do not use for qualitative reasoning or summarisation. Full JS standard library; no require, no network.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'JavaScript that prints each result via console.log(). Batch related checks into one script.',
        },
      },
      required: ['code'],
    },
  },
};

function runCodeSandbox(code: string): string {
  const logs: string[] = [];
  const consoleLike = {
    log:   (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    info:  (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    warn:  (...args: unknown[]) => logs.push('[warn] ' + args.map(String).join(' ')),
    error: (...args: unknown[]) => logs.push('[error] ' + args.map(String).join(' ')),
  };

  const sandbox = {
    console: consoleLike,
    // Core globals
    Math, Number, Boolean, String, Array, Object, Function,
    JSON, RegExp, Date, Error,
    Map, Set, WeakMap, WeakSet,
    Promise,
    Symbol,
    // Type utilities
    parseFloat, parseInt, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent,
    // Typed arrays / numeric utilities
    Uint8Array, Int32Array, Float64Array, ArrayBuffer,
    // Convenience
    undefined, null: null, Infinity, NaN,
  };

  try {
    vm.runInNewContext(code, sandbox, { timeout: 10_000 });
    return logs.join('\n') || '(no output)';
  } catch (err) {
    return `Error: ${(err as Error).message}`;
  }
}

function executeTool(name: string, args: Record<string, unknown>): string {
  if (name === 'run_code' && typeof args.code === 'string') {
    return runCodeSandbox(args.code);
  }
  return `Unknown tool: ${name}`;
}

// ── Route ─────────────────────────────────────────────────────────────────

// ── NDJSON helpers ────────────────────────────────────────────────────────

type StreamEvent =
  | { type: 'reasoning'; token: string; at: number }
  | { type: 'content'; token: string; at: number }
  | { type: 'tool_call'; name: string; at: number }
  | { type: 'tool_result'; output: string; at: number }
  | { type: 'result'; result: EligibilityCheckResult; at: number }
  | { type: 'error'; message: string; at: number };

function toStreamEvent(event: AgentEvent): StreamEvent | null {
  if (event.type === 'reasoning') return { type: 'reasoning', token: event.token, at: Date.now() };
  if (event.type === 'content')   return { type: 'content',   token: event.token, at: Date.now() };
  if (event.type === 'tool_call') return { type: 'tool_call', name: event.name,   at: Date.now() };
  if (event.type === 'tool_result') return { type: 'tool_result', output: event.output, at: Date.now() };
  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schemeId: string }> },
) {
  const { schemeId } = await params;
  const loopId = `${schemeId}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;
  const log = createLoopLogger(loopId);

  log('request:start', { schemeId });

  const document = await getSchemeDocument(schemeId);
  if (!document) {
    log('request:scheme_not_found');
    return new Response(
      JSON.stringify({ type: 'error', message: 'Scheme not found' }) + '\n',
      { status: 404, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }

  const { scheme, corpus } = document;

  const body = (await request.json()) as { userContext?: string };
  const { userContext } = body;

  log('request:body_received', {
    contextChars: typeof userContext === 'string' ? userContext.length : 0,
  });

  if (!userContext || typeof userContext !== 'string' || userContext.trim().length === 0) {
    log('request:invalid_context');
    return new Response(
      JSON.stringify({ type: 'error', message: 'userContext is required' }) + '\n',
      { status: 400, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }

  try {
    validateLlmConfiguration();
  } catch {
    log('request:llm_not_configured');
    return new Response(
      JSON.stringify({ type: 'error', message: 'LLM not configured' }) + '\n',
      { status: 503, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }

  const safeContext = userContext.slice(0, MAX_CONTEXT_CHARS);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let streamClosed = false;

      const send = (event: StreamEvent) => {
        if (streamClosed) return;

        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        } catch (err) {
          streamClosed = true;
          log('stream:enqueue_after_close', {
            eventType: event.type,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      };

      const closeStream = () => {
        if (streamClosed) return;
        streamClosed = true;

        try {
          controller.close();
        } catch (err) {
          log('stream:close_after_close', {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      };

      log('stream:start', {
        safeContextChars: safeContext.length,
        schemeName: scheme.name,
      });

      const timeNow = () => Date.now();

      let raw: string;
      try {
        raw = await runAgentLoop(
          [
            { role: 'system', content: buildEligibilityAnalysisPrompt() },
            { role: 'user', content: buildEligibilityUserMessage(scheme, corpus, safeContext) },
          ],
          [RUN_CODE_TOOL],
          (name, args) => {
            if (name === 'run_code' && typeof args.code === 'string') {
              log('tool:execute', { name, codeChars: args.code.length });
            } else {
              log('tool:execute', { name, args });
            }
            const result = executeTool(name, args);
            log('tool:result', { name, outputPreview: result.slice(0, 500) });
            return result;
          },
          (event) => {
            log(`agent:${event.type}`, event.type === 'tool_result'
              ? { name: event.name, outputPreview: event.output.slice(0, 500) }
              : event,
            );
            const se = toStreamEvent(event);
            if (se) send(se);
          },
          {},
        );
      } catch (err) {
        log('agent:error', {
          error: err instanceof Error ? err.message : String(err),
        });
        console.error('Eligibility agent error:', err);
        send({ type: 'error', message: 'Assessment failed. Please try again.', at: timeNow() });
        closeStream();
        return;
      }

      log('agent:analysis', { chars: raw.length, preview: raw.slice(0, 500) });

      let result: EligibilityCheckResult;
      try {
        result = await structureOutput<EligibilityCheckResult>(raw, ELIGIBILITY_SCHEMA);
      } catch (err) {
        log('agent:structure_error', { error: err instanceof Error ? err.message : String(err) });
        send({ type: 'error', message: 'Assessment could not be structured. Please try again.', at: timeNow() });
        closeStream();
        return;
      }

      log('agent:result', {
        verdict: result.verdict,
        criteriaCount: result.criteria.length,
        blockersCount: result.blockers.length,
        tipsCount: result.tips.length,
      });

      send({ type: 'result', result, at: timeNow() });
      closeStream();
      log('stream:complete');
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson', 'X-Accel-Buffering': 'no' },
  });
}

