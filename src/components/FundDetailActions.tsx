'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { createClient } from '@/utils/supabase/client';

interface FundDetailActionsProps {
  readonly schemeId: string;
}

export function FundDetailActions({ schemeId }: FundDetailActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  // null = loading, string = signed in, false = anonymous
  const [userId, setUserId] = useState<string | null | false>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? false;
      setUserId(uid);

      if (uid) {
        fetch('/api/bookmarks')
          .then((r) => r.json())
          .then((ids: string[]) => setIsBookmarked(ids.includes(schemeId)))
          .catch(() => {});
      }
    });
  }, [schemeId]);

  async function handleBookmarkClick() {
    if (!userId) return;

    const next = !isBookmarked;
    setIsBookmarked(next);

    await fetch('/api/bookmarks', {
      method: next ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemeId }),
    });
  }

  // Still loading auth state — render nothing to avoid layout shift
  if (userId === null) return null;

  // Anonymous user — prompt to sign in
  if (userId === false) {
    return (
      <Link
        href={`/auth/signin?next=${encodeURIComponent(`/funds/${schemeId}`)}`}
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

