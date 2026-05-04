import { readErrorMessage, withOptionalSignal } from '@/lib/api/shared';
import { readSseDataStream } from '@/lib/api/streaming';
import type { TextStreamEvent } from '@/components/chat/stream-events';

export async function streamDraftGeneration(
  schemeId: string,
  body: {
    readonly userContext: string;
    readonly files?: ReadonlyArray<File>;
    readonly urls?: ReadonlyArray<string>;
    readonly history?: ReadonlyArray<{ role: 'user' | 'assistant'; content: string }>;
  },
  signal?: AbortSignal,
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const form = new FormData();
  form.append('userContext', body.userContext);
  (body.files ?? []).forEach((f) => form.append('files', f));
  (body.urls ?? []).forEach((u) => form.append('urls', u));
  if (body.history && body.history.length > 0) {
    form.append('history', JSON.stringify(body.history));
  }

  const response = await fetch(`/api/draft/${schemeId}`, {
    method: 'POST',
    body: form,
    ...withOptionalSignal(signal),
  });

  if (!response.ok || !response.body) {
    throw new Error(
      await readErrorMessage(
        response,
        'Thunder could not generate a draft right now. Please try again later.',
      ),
    );
  }

  return response.body.getReader();
}

export async function readDraftEventStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onToken: (token: string) => void,
): Promise<string> {
  let accumulatedText = '';

  await readSseDataStream<TextStreamEvent>(reader, (event) => {
    if (event.type === 'token') {
      accumulatedText += event.value;
      onToken(event.value);
      return;
    }

    return true;
  });

  return accumulatedText;
}

export async function downloadDraftPdf(
  schemeId: string,
  draftMarkdown: string,
  email: string,
): Promise<Blob> {
  const response = await fetch(`/api/draft/${schemeId}/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draftMarkdown, email }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'PDF export failed'));
  }

  return response.blob();
}