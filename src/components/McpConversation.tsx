'use client';

import { useState } from 'react';

interface Turn {
  role: 'user' | 'call' | 'return' | 'assistant';
  text: string;
}

const TURNS: Turn[] = [
  { role: 'user',      text: 'What grants can a 15-person SaaS startup apply for?' },
  { role: 'call',      text: 'match_schemes({ industry: "software", employees: 15, ownership: 1.0 })' },
  { role: 'return',    text: '3 matches — Innovation Grant ▲▲▲  Export Support ▲▲  Digital Transform ▲' },
  { role: 'assistant', text: "Your strongest match is the Innovation Grant — up to $250k for R&D and product development. Here's why you qualify and what to prepare…" },
];

const ROLE_STYLES: Record<Turn['role'], string> = {
  user:      'bg-surface text-text-primary',
  call:      'bg-accent/5 font-mono text-xs text-accent',
  return:    'bg-success/5 font-mono text-xs text-success',
  assistant: 'bg-surface text-text-secondary',
};

const ROLE_LABEL: Record<Turn['role'], string> = {
  user:      'user',
  call:      'call',
  return:    'return',
  assistant: 'assistant',
};

export function McpConversation() {
  const [revealed, setRevealed] = useState(1);

  const canAdvance = revealed < TURNS.length;
  const isComplete = revealed === TURNS.length;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {TURNS.slice(0, revealed).map((turn, i) => (
        <div
          key={i}
          className={`flex gap-4 px-5 py-3.5 ${i < revealed - 1 ? 'border-b border-border' : ''} ${ROLE_STYLES[turn.role]}`}
          style={{ animation: 'fadeSlideIn 0.25s ease both' }}
        >
          <span className="mt-0.5 w-16 shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-text-tertiary">
            {ROLE_LABEL[turn.role]}
          </span>
          <p className="text-sm leading-6">{turn.text}</p>
        </div>
      ))}

      {/* Controls */}
      <div className={`flex items-center justify-between border-t border-border bg-surface-hover px-5 py-3 ${revealed > 1 ? '' : ''}`}>
        <div className="flex gap-1">
          {TURNS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i < revealed ? 'bg-accent' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {revealed > 1 && (
            <button
              onClick={() => setRevealed(1)}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary transition hover:text-text-primary"
            >
              Reset
            </button>
          )}
          {canAdvance ? (
            <button
              onClick={() => setRevealed((r) => r + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent-foreground)] transition hover:opacity-90"
            >
              Next step
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-success">
              ✓ Complete
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
