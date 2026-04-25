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
  readonly sessions?: ReadonlyArray<Session>;
  readonly seedMessage?: { text: string; attachments: ReadonlyArray<Attachment> };
}

export function ChatLayout({ sessionId, paid = false, sessions = [], seedMessage }: ChatLayoutProps) {
  const { messages, streamingText, isStreaming, sendMessage, stop } = useChat({
    sessionId,
    ...(seedMessage !== undefined && { seedMessage }),
  });
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="relative flex flex-1 overflow-hidden">
        {/* Session rail */}
        <aside
          className={`shrink-0 border-r border-border bg-background-elevated transition-all duration-200 ${
            sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'
          } hidden lg:block`}
        >
          {/* Sidebar header: wordmark + collapse button */}
          <div className="flex h-12 items-center justify-between border-b border-border px-3">
            <Link href="/" className={`${GeistPixelSquare.className} text-sm uppercase tracking-wider text-text-primary`}>
              THUNDER
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
              aria-label="Collapse sidebar"
            >
              <SidebarIcon />
            </button>
          </div>
          <div className="px-3 py-3 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">Sessions</p>
            <Link
              href="/chat"
              className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 font-mono text-[10px] text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
              title="New session"
            >
              <span>+</span><span>New</span>
            </Link>
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
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Re-open button — floats top-left, no layout space */}
          {!sidebarOpen && (
            <div className="absolute top-3 left-3 z-10 hidden lg:flex">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
                aria-label="Expand sidebar"
              >
                <SidebarIcon />
              </button>
            </div>
          )}
          <MessageList
            messages={messages}
            streaming={streamingText}
            isStreaming={isStreaming}
            onOpenArtifact={setActiveArtifact}
          />
          {/* Floating composer */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-gradient-to-t from-background via-background/90 to-transparent">
            <Composer onSend={sendMessage} isStreaming={isStreaming} onStop={stop} />
          </div>
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

function SidebarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="14" height="14" rx="2" />
      <line x1="5" y1="1" x2="5" y2="15" />
    </svg>
  );
}
