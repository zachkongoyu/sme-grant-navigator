import { useEffect, useRef } from 'react';

import type { Artifact, ChatMessage } from './types';
import { Message } from './Message';

interface MessageListProps {
  readonly messages: ReadonlyArray<ChatMessage>;
  readonly streaming: string;
  readonly isStreaming: boolean;
  readonly onOpenArtifact: (artifact: Artifact) => void;
}

export function MessageList({ messages, streaming, isStreaming, onOpenArtifact }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-6 pb-40">
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
        {isStreaming && !streaming && (
          <div className="flex items-center gap-1 py-2 pl-1">
            <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
