'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { beginNavigationProgress } from '@/components/NavigationProgress';
import { Composer } from '@/components/chat/Composer';
import type { Attachment } from '@/components/chat/types';
import { storePending } from '@/lib/pending-sessions';

const SUGGESTIONS = [
  'Series A SaaS company, 12 employees',
  'Hardware R&D project',
  'E-commerce expansion into new markets',
  'Upload my pitch deck — find matching schemes',
] as const;

export function HeroComposer() {
  const router = useRouter();
  const [prefill, setPrefill] = useState<{ text: string; seq: number }>({ text: '', seq: 0 });

  function handleSend(text: string, attachments: ReadonlyArray<Attachment>) {
    const sessionId = crypto.randomUUID();
    storePending(sessionId, { text, attachments });
    beginNavigationProgress();
    router.push(`/chat/${sessionId}`);
  }

  function applyChip(suggestion: string) {
    setPrefill((prev) => ({ text: suggestion, seq: prev.seq + 1 }));
  }

  return (
    <div className="w-full">
      <Composer
        onSend={handleSend}
        isStreaming={false}
        onStop={() => {}}
        variant="hero"
        prefill={prefill}
      />
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => applyChip(s)}
            className="inline-flex h-7 items-center rounded-md border border-border bg-surface-hover px-3 font-mono text-xs text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
