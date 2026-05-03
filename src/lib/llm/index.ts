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

export function defaultModel(): string {
  return process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4';
}

export function defaultCheapModel(): string {
  return process.env.OPENROUTER_CHEAP_MODEL ?? 'anthropic/claude-haiku-4-5';
}

export function maxTokens(): number {
  const raw = process.env.OPENROUTER_MAX_TOKENS;
  if (!raw) return DEFAULT_MAX_TOKENS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_TOKENS;
}

// ── SSE parsing ───────────────────────────────────────────────────────────

export function extractSseEvents(buffer: string): { events: string[]; remaining: string } {
  const normalized = buffer.replace(/\r\n/g, '\n');
  const parts = normalized.split('\n\n');
  const remaining = parts.pop() ?? '';
  return { events: parts, remaining };
}

export function parseSseEvent(block: string): string | null {
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
