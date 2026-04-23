'use client';

import { useState } from 'react';

import { isSchemeBookmarked, toggleSchemeBookmark } from '@/lib/bookmarks';

interface FundDetailActionsProps {
  readonly schemeId: string;
}

export function FundDetailActions({ schemeId }: FundDetailActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isSchemeBookmarked(schemeId);
  });

  function handleBookmarkClick() {
    const result = toggleSchemeBookmark(schemeId);
    setIsBookmarked(result.isBookmarked);
  }

  return (
    <button
      type="button"
      onClick={handleBookmarkClick}
      className={`w-full rounded-lg border px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] transition ${
        isBookmarked
          ? 'border-accent/40 bg-accent/10 text-accent'
          : 'border-border bg-surface text-text-primary hover:border-accent hover:text-accent'
      }`}
    >
      <span className="flex items-center gap-2 text-base normal-case tracking-normal">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M6 4.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 4.5V21l-6-3-6 3V4.5Z" />
        </svg>
        <span>{isBookmarked ? 'Saved' : 'Save scheme'}</span>
      </span>
    </button>
  );
}
