/**
 * Thin HTTP client for OpenRouter's OpenAI-compatible chat completions API.
 * Uses plain fetch — no extra SDK dependency.
 * Docs: https://openrouter.ai/docs
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export function getHeaders(): Record<string, string> {
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

export function validateLlmConfiguration(): void {
  getHeaders();
}

/**
 * POST to /chat/completions. Set stream:true or stream:false in the body.
 * Throws on non-2xx. Callers read the response body as SSE or JSON.
 */
export async function chatCompletions(
  body: Record<string, unknown>,
  signal?: AbortSignal | null,
): Promise<Response> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
    signal: signal ?? null,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${text}`);
  }

  return response;
}
