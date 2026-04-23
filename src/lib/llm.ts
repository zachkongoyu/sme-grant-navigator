/**
 * Thin wrapper around OpenRouter's OpenAI-compatible chat completions API.
 * Uses plain fetch — no extra SDK dependency.
 * Docs: https://openrouter.ai/docs
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function getHeaders(): Record<string, string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Add it to .env.local — get a key at https://openrouter.ai/keys',
    );
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    // OpenRouter requires these for attribution and rate-limit tracking.
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    'X-Title': 'SME Grant Navigator',
  };
}

function defaultModel(): string {
  return process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4';
}

/**
 * Stream a chat completion. Yields text tokens as they arrive.
 * Pass an AbortSignal to cancel mid-stream (e.g. when the client disconnects).
 */
export async function* streamChat(
  messages: LlmMessage[],
  model = defaultModel(),
  signal?: AbortSignal | null,
): AsyncGenerator<string> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ model, messages, stream: true }),
    signal: signal ?? null,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${text}`);
  }

  if (!response.body) throw new Error('OpenRouter returned no response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;

      try {
        const chunk = JSON.parse(data) as {
          choices: [{ delta: { content?: string } }];
        };
        const token = chunk.choices[0]?.delta?.content;
        if (token) yield token;
      } catch {
        // Ignore individual chunk parse errors; move to the next line.
      }
    }
  }
}

/**
 * Non-streaming chat completion. Returns the full response text.
 * Use for structured/JSON calls where you don't need token-by-token output.
 */
export async function chat(messages: LlmMessage[], model = defaultModel()): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    choices: [{ message: { content: string } }];
  };

  return data.choices[0].message.content;
}
