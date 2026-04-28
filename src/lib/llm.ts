import { chatCompletions } from './openrouter';

export { validateLlmConfiguration } from './openrouter';

const DEFAULT_MAX_TOKENS = 4_096;

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface JsonSchemaResponseFormat {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
}

function defaultModel(): string {
  return process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4';
}

function defaultCheapModel(): string {
  return process.env.OPENROUTER_CHEAP_MODEL ?? 'anthropic/claude-haiku-4-5';
}

function maxTokens(): number {
  const raw = process.env.OPENROUTER_MAX_TOKENS;
  if (!raw) return DEFAULT_MAX_TOKENS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_TOKENS;
}

// ── SSE parsing ───────────────────────────────────────────────────────────

function extractSseEvents(buffer: string): { events: string[]; remaining: string } {
  const normalized = buffer.replace(/\r\n/g, '\n');
  const parts = normalized.split('\n\n');
  const remaining = parts.pop() ?? '';
  return { events: parts, remaining };
}

function parseSseEvent(block: string): string | null {
  const dataLines = block
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart());

  if (dataLines.length === 0) return null;
  return dataLines.join('\n').trim();
}

// ── Streaming chat ────────────────────────────────────────────────────────

export async function* streamChat(
  messages: LlmMessage[],
  model = defaultModel(),
  signal?: AbortSignal | null,
): AsyncGenerator<string> {
  const response = await chatCompletions(
    { model, messages, stream: true, max_tokens: maxTokens() },
    signal,
  );

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const { events, remaining } = extractSseEvents(buffer);
    buffer = remaining;

    for (const rawEvent of events) {
      const data = parseSseEvent(rawEvent);
      if (!data) continue;
      if (data === '[DONE]') return;

      try {
        const chunk = JSON.parse(data) as { choices: [{ delta: { content?: string } }] };
        const token = chunk.choices[0]?.delta?.content;
        if (token) yield token;
      } catch {
        // Ignore malformed chunks.
      }
    }
  }
}

// ── Structured output ─────────────────────────────────────────────────────

/**
 * Converts a free-form analysis string into a typed structured result.
 * Uses a cheap model with response_format enforcement — safe here because
 * there are no tool calls, so the JSON constraint does not conflict.
 * Generic: pass any schema to reuse across different features.
 */
export async function structureOutput<T>(
  analysis: string,
  schema: JsonSchemaResponseFormat,
  model = defaultCheapModel(),
): Promise<T> {
  const response = await chatCompletions({
    model,
    messages: [
      {
        role: 'system',
        content: 'Convert the analysis into the required JSON format. Extract information as stated — do not add, infer, or modify facts.',
      },
      { role: 'user', content: analysis },
    ],
    stream: false,
    max_tokens: maxTokens(),
    response_format: schema,
  });

  const data = (await response.json()) as { choices: [{ message: { content: string } }] };
  return JSON.parse(data.choices[0].message.content) as T;
}

// ── Agentic loop ──────────────────────────────────────────────────────────

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export type AgentEvent =
  | { type: 'reasoning'; token: string }
  | { type: 'content'; token: string }
  | { type: 'tool_call'; name: string }
  | { type: 'tool_result'; name: string; output: string };

interface AssistantToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

type ApiMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: AssistantToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string };

type StreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string | null;
      reasoning?: string | null;
      tool_calls?: Array<{
        index?: number;
        id?: string;
        function?: { name?: string; arguments?: string };
      }>;
    };
    finish_reason?: string | null;
  }>;
};

type StreamingToolCall = { id: string; name: string; arguments: string };

/**
 * Agentic loop: streams responses, executes tool calls, iterates until the
 * model stops calling tools or maxIterations is reached.
 * Fires onEvent at each step for real-time progress forwarding.
 * Returns the final free-form text — pass through structureOutput to get typed JSON.
 */
export async function runAgentLoop(
  messages: LlmMessage[],
  tools: ToolDefinition[],
  executeTool: (name: string, args: Record<string, unknown>) => string,
  onEvent: (event: AgentEvent) => void | Promise<void>,
  { model = defaultModel(), maxIterations = 8 }: { model?: string; maxIterations?: number } = {},
): Promise<string> {
  const apiMessages: ApiMessage[] = [...messages];

  for (let i = 0; i < maxIterations; i++) {
    let assistantContent = '';
    let finishReason: string | null = null;
    const pendingToolCalls = new Map<number, StreamingToolCall>();

    const response = await chatCompletions({
      model,
      messages: apiMessages,
      tools,
      stream: true,
      max_tokens: maxTokens(),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;

    while (!done) {
      const chunk = await reader.read();
      if (chunk.done) break;

      buffer += decoder.decode(chunk.value, { stream: true });
      const { events, remaining } = extractSseEvents(buffer);
      buffer = remaining;

      for (const rawEvent of events) {
        const data = parseSseEvent(rawEvent);
        if (!data) continue;
        if (data === '[DONE]') { done = true; break; }

        const parsed = JSON.parse(data) as StreamChunk;
        const choice = parsed.choices?.[0];
        if (!choice) continue;

        if (choice.finish_reason) finishReason = choice.finish_reason;

        const reasoning = choice.delta?.reasoning;
        if (reasoning) await onEvent({ type: 'reasoning', token: reasoning });

        const content = choice.delta?.content;
        if (content) {
          assistantContent += content;
          await onEvent({ type: 'content', token: content });
        }

        for (const tc of choice.delta?.tool_calls ?? []) {
          const index = tc.index ?? 0;
          const current = pendingToolCalls.get(index) ?? { id: '', name: '', arguments: '' };
          if (tc.id) current.id = tc.id;
          if (tc.function?.name) {
            if (current.name === '') await onEvent({ type: 'tool_call', name: tc.function.name });
            current.name += tc.function.name;
          }
          if (tc.function?.arguments) current.arguments += tc.function.arguments;
          pendingToolCalls.set(index, current);
        }
      }
    }

    const resolvedToolCalls: AssistantToolCall[] = [...pendingToolCalls.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, tc]) => ({ id: tc.id, type: 'function', function: { name: tc.name, arguments: tc.arguments } }));

    if (finishReason !== 'tool_calls' || resolvedToolCalls.length === 0) {
      return assistantContent;
    }

    apiMessages.push({ role: 'assistant', content: assistantContent || null, tool_calls: resolvedToolCalls });

    for (const tc of resolvedToolCalls) {
      let args: Record<string, unknown>;
      try { args = JSON.parse(tc.function.arguments) as Record<string, unknown>; }
      catch { args = {}; }

      let result: string;
      try { result = executeTool(tc.function.name, args); }
      catch (err) { result = `Error: ${(err as Error).message}`; }

      await onEvent({ type: 'tool_result', name: tc.function.name, output: result });
      apiMessages.push({ role: 'tool', tool_call_id: tc.id, content: result });
    }
  }

  throw new Error('Agent loop exceeded maximum iterations without finishing');
}
