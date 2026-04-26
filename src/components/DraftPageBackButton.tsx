'use client';

import Link from 'next/link';

interface DraftPageBackButtonProps {
  readonly schemeId: string;
}

export function DraftPageBackButton({ schemeId }: DraftPageBackButtonProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border p-1 shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm"
      style={{
        borderColor: 'color-mix(in srgb, var(--border) 72%, var(--accent) 12%)',
        backgroundColor: 'color-mix(in srgb, var(--background-elevated) 82%, transparent)',
      }}
    >
      <Link
        href={`/funds/${schemeId}`}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary transition duration-200 hover:-translate-y-px hover:text-text-primary"
        style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 88%, transparent)' }}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden="true">
          <path d="M10 13L5 8l5-5" />
        </svg>
        Back
      </Link>
      <Link
        href="/"
        aria-label="Home"
        className="inline-flex items-center rounded-full px-2 py-1.5 text-text-secondary transition duration-200 hover:-translate-y-px hover:text-text-primary"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden="true">
          <path d="M2.5 7.25 8 2.75l5.5 4.5" />
          <path d="M4.25 6.5v6.75h7.5V6.5" />
        </svg>
      </Link>
    </div>
  );
}
