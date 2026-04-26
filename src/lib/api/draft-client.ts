import { readErrorMessage, withOptionalSignal } from '@/lib/api/shared';
import { readSseDataStream } from '@/lib/api/streaming';
import type { TextStreamEvent } from '@/lib/stream-events';

export interface DraftInlineAttachment {
  readonly name: string;
  readonly text: string;
}

export interface ExtractedAttachment {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly mime: string;
  readonly text: string;
}

export async function uploadDraftAttachments(
  files: ReadonlyArray<File>,
): Promise<ReadonlyArray<ExtractedAttachment>> {
  const form = new FormData();
  files.forEach((file) => form.append('files', file));

  const response = await fetch('/api/extract', {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'File upload failed'));
  }

  return (await response.json()) as ReadonlyArray<ExtractedAttachment>;
}

export async function streamDraftGeneration(
  schemeId: string,
  body: {
    readonly userContext: string;
    readonly inlineAttachments?: ReadonlyArray<DraftInlineAttachment>;
    readonly links?: ReadonlyArray<string>;
    readonly history?: ReadonlyArray<{ role: 'user' | 'assistant'; content: string }>;
  },
  signal?: AbortSignal,
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const response = await fetch(`/api/draft/${schemeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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