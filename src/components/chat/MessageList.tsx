import { useEffect, useRef } from 'react';

import type { Artifact, ChatMessage } from './types';
import { Message } from './Message';

interface MessageListProps {
  readonly messages: ReadonlyArray<ChatMessage>;
  readonly streaming: string;
  readonly onOpenArtifact: (artifact: Artifact) => void;
}

export function MessageList({ messages, streaming, onOpenArtifact }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-2">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} onOpenArtifact={onOpenArtifact} />
        ))}
        {streaming && (
          <div className="py-1">
            <p className="max-w-[85%] text-sm leading-6 text-text-primary whitespace-pre-wrap">
              {streaming}
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
