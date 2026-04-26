interface ErrorPayload {
  readonly error?: string;
}

export function withOptionalSignal(
  signal?: AbortSignal,
): Pick<RequestInit, 'signal'> | Record<string, never> {
  return signal ? { signal } : {};
}

export async function readErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = (await response.json()) as ErrorPayload;
    if (typeof data.error === 'string' && data.error.trim().length > 0) {
      return data.error;
    }
  } catch {
    // Fall back to the provided generic message.
  }

  return fallbackMessage;
}