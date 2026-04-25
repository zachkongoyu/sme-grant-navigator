'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Artifact, AssistantMessage, Attachment, ChatMessage, SystemMessage, UserMessage } from './types';

interface UseChatOptions {
  readonly sessionId: string;
  readonly seedMessage?: { text: string; attachments: ReadonlyArray<Attachment> };
}

export function useChat({ sessionId, seedMessage }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const hasSentSeedRef = useRef(false);

  const sendMessage = useCallback(
    async (text: string, attachments: ReadonlyArray<Attachment>) => {
      const userMsg: UserMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text,
        attachments,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingText('');

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: {
              text,
              links: attachments.filter((a) => a.kind === 'link').map((a) => (a as { url: string }).url),
              attachmentIds: attachments.filter((a) => a.kind === 'file').map((a) => a.id),
            },
          }),
          signal: controller.signal,
        });

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accText = '';
        const artifacts: Artifact[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            const event = JSON.parse(raw) as
              | { type: 'token'; value: string }
              | { type: 'artifact'; value: Artifact }
              | { type: 'done' };

            if (event.type === 'token') {
              accText += event.value;
              setStreamingText(accText);
            } else if (event.type === 'artifact') {
              artifacts.push(event.value);
            } else if (event.type === 'done') {
              break;
            }
          }
        }

        const assistantMsg: AssistantMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: accText,
          artifacts,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;

        const errorMsg: SystemMessage = {
          id: crypto.randomUUID(),
          role: 'system',
          text: 'Failed to get a response. Please try again.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setStreamingText('');
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [sessionId],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Auto-submit the seed message once on mount (used when navigating from the landing page).
  useEffect(() => {
    if (seedMessage && !hasSentSeedRef.current) {
      hasSentSeedRef.current = true;
      sendMessage(seedMessage.text, seedMessage.attachments ?? []);
    }
  // sendMessage is stable (useCallback with [sessionId]).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedMessage]);

  return { messages, streamingText, isStreaming, sendMessage, stop };
}
