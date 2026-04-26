'use client';

import Link from 'next/link';

interface DraftPageBackButtonProps {
  readonly schemeId: string;
}

export function DraftPageBackButton({ schemeId }: DraftPageBackButtonProps) {
  return (
    <Link
      href={`/funds/${schemeId}`}
      className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary transition hover:text-accent"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden="true">
        <path d="M10 13L5 8l5-5" />
      </svg>
      Back
    </Link>
  );
}
