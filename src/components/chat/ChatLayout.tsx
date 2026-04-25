'use client';

import { GeistPixelSquare } from 'geist/font/pixel';
import Link from 'next/link';
import { useState } from 'react';

import { ArtifactPanel } from './ArtifactPanel';
import { Composer } from './Composer';
import { MessageList } from './MessageList';
import type { Artifact, Attachment, ChatMessage } from './types';
import { useChat } from './useChat';

interface Session {
  readonly id: string;
  readonly title: string;
}

interface ChatLayoutProps {
  readonly sessionId: string;
  readonly paid?: boolean;
  readonly initialMessages?: ReadonlyArray<ChatMessage>;
  readonly sessions?: ReadonlyArray<Session>;
  readonly seedMessage?: { text: string; attachments: ReadonlyArray<Attachment> };
}

export function ChatLayout({ sessionId, paid = false, initialMessages, sessions = [], seedMessage }: ChatLayoutProps) {
  const { messages, streamingText, isStreaming, sendMessage, stop } = useChat({
    sessionId,
    initialMessages: initialMessages ?? [],
    ...(seedMessage !== undefined && { seedMessage }),
  });
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </button>
          <Link href="/" className={`${GeistPixelSquare.className} text-sm uppercase tracking-wider text-text-primary`}>
            THUNDER
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="inline-flex h-7 items-center rounded-md border border-border px-3 font-mono text-xs text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors"
          >
            New session
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Session rail */}
        <aside
          className={`shrink-0 border-r border-border bg-background-elevated transition-all duration-200 ${
            sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'
          } hidden lg:block`}
        >
          <div className="px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">Sessions</p>
          </div>
          <ul className="px-2">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/chat/${s.id}`}
                  className={`block truncate rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface-hover ${
                    s.id === sessionId ? 'text-text-primary bg-surface' : 'text-text-secondary'
                  }`}
                >
                  {s.title}
                </Link>
              </li>
            ))}
            {sessions.length === 0 && (
              <li className="px-3 py-2 font-mono text-xs text-text-tertiary">No sessions yet</li>
            )}
          </ul>
        </aside>

        {/* Main: thread + composer */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <MessageList
            messages={messages}
            streaming={streamingText}
            onOpenArtifact={setActiveArtifact}
          />
          <Composer onSend={sendMessage} isStreaming={isStreaming} onStop={stop} />
        </div>

        {/* Artifact panel — split-pane on lg+ */}
        {activeArtifact && (
          <div className="hidden w-96 shrink-0 lg:block">
            <ArtifactPanel artifact={activeArtifact} sessionId={sessionId} paid={paid} onClose={() => setActiveArtifact(null)} />
          </div>
        )}

        {/* Artifact panel — slide-over on mobile */}
        {activeArtifact && (
          <div className="fixed inset-0 z-40 flex justify-end lg:hidden">
            <div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setActiveArtifact(null)}
            />
            <div className="relative w-full max-w-sm bg-surface">
              <ArtifactPanel artifact={activeArtifact} sessionId={sessionId} paid={paid} onClose={() => setActiveArtifact(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 4h12M2 8h12M2 12h12" />
    </svg>
  );
}
