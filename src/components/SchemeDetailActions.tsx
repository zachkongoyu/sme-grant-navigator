'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { fetchBookmarks, updateBookmark } from '@/lib/api/bookmarks-client';
import { useAuth } from './useAuth';

interface SchemeDetailActionsProps {
  readonly schemeId: string;
}

export function SchemeDetailActions({ schemeId }: SchemeDetailActionsProps) {
  const user = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchBookmarks()
      .then((ids) => setIsBookmarked(ids.includes(schemeId)))
      .catch(() => {});
  }, [schemeId, user]);

  async function handleBookmarkClick() {
    if (!user) return;

    const next = !isBookmarked;
    setIsBookmarked(next);

    await updateBookmark(schemeId, next);
  }

  // Still loading auth state — render nothing to avoid layout shift
  if (user === undefined) return null;

  // Anonymous user — prompt to sign in
  if (user === null) {
    return (
      <Link
        href={`/auth/signin?next=${encodeURIComponent(`/schemes/${schemeId}`)}`}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-secondary transition hover:border-accent hover:text-accent"
      >
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
        <span>Sign in to save</span>
      </Link>
    );
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
