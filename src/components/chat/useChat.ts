'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { readChatEventStream, streamChatResponse } from '@/lib/api/chat-client';
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
        const { reader } = await streamChatResponse(sessionId, text, attachments, controller.signal);
        const artifacts: Artifact[] = [];
        let currentText = '';
        const accText = await readChatEventStream(
          reader,
          (token) => {
            currentText += token;
            setStreamingText(currentText);
          },
          (artifact) => {
            artifacts.push(artifact);
          },
        );

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
