import vm from 'node:vm';

import { structureOutput, type JsonSchemaResponseFormat } from '@/lib/llm';
import { runAgentLoop, type AgentEvent, type ToolDefinition } from '@/lib/agent';
import type { Scheme } from '@/types';
import { buildEligibilityAnalysisPrompt, buildEligibilityUserMessage } from '@/lib/prompts/eligibility';
import type { EligibilityCheckResult, EligibilityProgressEvent } from '@/lib/api/eligibility-client';

// ── JSON schema for structured output ────────────────────────────────────────

const ELIGIBILITY_SCHEMA: JsonSchemaResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'eligibility_check_result',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        verdict: { type: 'string', enum: ['eligible', 'likely_eligible', 'ineligible', 'insufficient_info'] },
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
      required: ['verdict', 'summary', 'criteria', 'tips'],
    },
  },
};

// ── run_code sandbox ──────────────────────────────────────────────────────────
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
    Math, Number, Boolean, String, Array, Object, Function,
    JSON, RegExp, Date, Error,
    Map, Set, WeakMap, WeakSet,
    Promise, Symbol,
    parseFloat, parseInt, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent,
    Uint8Array, Int32Array, Float64Array, ArrayBuffer,
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

function toProgressEvent(event: AgentEvent): EligibilityProgressEvent | null {
  const at = Date.now();
  if (event.type === 'reasoning')   return { type: 'reasoning',   token: event.token,   at };
  if (event.type === 'content')     return { type: 'content',     token: event.token,   at };
  if (event.type === 'tool_call')   return { type: 'tool_call',   name: event.name,     at };
  if (event.type === 'tool_result') return { type: 'tool_result', output: event.output, at };
  return null;
}

// ── Public interface ──────────────────────────────────────────────────────────

/**
 * Run a full EligibilityCheck for a Company against a Scheme.
 * Emits progress events via onProgress as the agent reasons through criteria.
 * Returns a structured EligibilityCheckResult.
 */
export async function runEligibilityCheck(
  scheme: Scheme,
  corpus: string | null,
  userContext: string,
  onProgress: (event: EligibilityProgressEvent) => void,
): Promise<EligibilityCheckResult> {
  const raw = await runAgentLoop(
    [
      { role: 'system', content: buildEligibilityAnalysisPrompt() },
      { role: 'user', content: buildEligibilityUserMessage(scheme, corpus, userContext) },
    ],
    [RUN_CODE_TOOL],
    executeTool,
    (event) => {
      const progress = toProgressEvent(event);
      if (progress) onProgress(progress);
    },
  );

  return structureOutput<EligibilityCheckResult>(raw, ELIGIBILITY_SCHEMA);
}
