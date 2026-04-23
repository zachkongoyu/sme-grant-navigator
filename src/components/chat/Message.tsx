import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

import { ArtifactCard } from './ArtifactCard';
import type { Artifact, ChatMessage } from './types';

interface MessageProps {
  readonly message: ChatMessage;
  readonly onOpenArtifact: (artifact: Artifact) => void;
}

export function Message({ message, onOpenArtifact }: MessageProps) {
  if (message.role === 'system') {
    return (
      <div className="py-1 text-center font-mono text-xs text-text-tertiary">
        {message.text}
      </div>
    );
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end py-1">
        <div className="max-w-[75%] rounded-lg bg-surface px-4 py-3">
          {message.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {message.attachments.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex h-6 items-center rounded-md border border-border bg-surface-hover px-2 font-mono text-xs text-text-tertiary"
                >
                  {a.kind === 'file' ? a.name : a.url}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm leading-6 text-text-primary whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  }

  // assistant
  return (
    <div className="py-1">
      <div className="max-w-[85%]">
        <div className="prose prose-sm dark:prose-invert max-w-none text-text-primary [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        {message.artifacts.map((artifact) => (
          <ArtifactCard key={artifact.id} artifact={artifact} onOpen={onOpenArtifact} />
        ))}
      </div>
    </div>
  );
}
