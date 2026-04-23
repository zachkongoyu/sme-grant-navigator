import type { Attachment } from '@/components/chat/types';

export interface PendingMessage {
  readonly text: string;
  readonly attachments: ReadonlyArray<Attachment>;
}

// Module-level Map: survives client-side navigations, reset on page reload.
// Used as a one-shot handoff from the landing-page composer to /chat/[sessionId].
const pending = new Map<string, PendingMessage>();

export function storePending(sessionId: string, message: PendingMessage): void {
  pending.set(sessionId, message);
}

export function consumePending(sessionId: string): PendingMessage | undefined {
  const message = pending.get(sessionId);
  if (message) pending.delete(sessionId);
  return message;
}
