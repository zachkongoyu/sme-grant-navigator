import type { Artifact, Attachment } from '@/components/chat/types';

import { readErrorMessage, withOptionalSignal } from '@/lib/api/shared';
import { readSseDataStream } from '@/lib/api/streaming';
import type { ChatStreamEvent } from '@/lib/stream-events';

export interface ChatStreamResult {
  readonly reader: ReadableStreamDefaultReader<Uint8Array>;
}

export async function streamChatResponse(
  sessionId: string,
  text: string,
  attachments: ReadonlyArray<Attachment>,
  signal?: AbortSignal,
): Promise<ChatStreamResult> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      message: {
        text,
        links: attachments
          .filter((attachment) => attachment.kind === 'link')
          .map((attachment) => (attachment as { url: string }).url),
        attachmentIds: attachments
          .filter((attachment) => attachment.kind === 'file')
          .map((attachment) => attachment.id),
      },
    }),
    ...withOptionalSignal(signal),
  });

  if (!response.body) {
    throw new Error(await readErrorMessage(response, 'No response body'));
  }

  return { reader: response.body.getReader() };
}

export async function readChatEventStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onToken: (token: string) => void,
  onArtifact: (artifact: Artifact) => void,
): Promise<string> {
  let accumulatedText = '';

  await readSseDataStream<ChatStreamEvent>(reader, (event) => {
    if (event.type === 'token') {
      accumulatedText += event.value;
      onToken(event.value);
      return;
    }

    if (event.type === 'artifact') {
      onArtifact(event.value);
      return;
    }

    return true;
  });

  return accumulatedText;
}