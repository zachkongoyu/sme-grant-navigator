'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { beginNavigationProgress } from '@/components/NavigationProgress';
import { Composer } from '@/components/chat/Composer';
import type { Attachment } from '@/components/chat/types';
import { storePending } from '@/lib/pending-sessions';

const SUGGESTIONS = [
  'Series A SaaS, 12 staff',
  'Hardware R&D',
  'E-commerce cross-border expansion',
  'Match my pitch deck',
  'B2B logistics startup',
  'Non-dilutive capital',
  'R&D grant application',
  'SME branding grant',
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
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => applyChip(s)}
            className="inline-flex h-6 items-center rounded border border-border bg-surface-hover px-2.5 font-mono text-[11px] text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
