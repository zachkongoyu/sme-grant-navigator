export async function readTextStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk?: (chunk: string) => void,
): Promise<string> {
  const decoder = new TextDecoder();
  let accumulatedText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    accumulatedText += chunk;
    onChunk?.(chunk);
  }

  return accumulatedText;
}

export async function readSseDataStream<TEvent>(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (event: TEvent) => boolean | void,
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      buffer += decoder.decode();
      const shouldStop = flushSseBuffer(buffer, onEvent);
      if (shouldStop) return;
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;

      const shouldStop = onEvent(JSON.parse(raw) as TEvent);
      if (shouldStop === true) {
        return;
      }
    }
  }
}

function flushSseBuffer<TEvent>(
  buffer: string,
  onEvent: (event: TEvent) => boolean | void,
): boolean {
  const line = buffer.trim();
  if (!line.startsWith('data: ')) return false;

  const raw = line.slice(6).trim();
  if (!raw) return false;

  return onEvent(JSON.parse(raw) as TEvent) === true;
}