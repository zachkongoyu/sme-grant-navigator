import type { Artifact } from '@/components/chat/types';

export interface StreamTokenEvent {
  readonly type: 'token';
  readonly value: string;
}

export interface StreamArtifactEvent<TValue> {
  readonly type: 'artifact';
  readonly value: TValue;
}

export interface StreamDoneEvent {
  readonly type: 'done';
}

export type TextStreamEvent = StreamTokenEvent | StreamDoneEvent;
export type ChatStreamEvent = StreamTokenEvent | StreamArtifactEvent<Artifact> | StreamDoneEvent;

export function createTokenEvent(value: string): StreamTokenEvent {
  return { type: 'token', value };
}

export function createArtifactEvent(value: Artifact): StreamArtifactEvent<Artifact> {
  return { type: 'artifact', value };
}

export function createDoneEvent(): StreamDoneEvent {
  return { type: 'done' };
}

export function encodeSseEvent(event: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}