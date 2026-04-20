'use client';

import { useEffect, useState } from 'react';

import {
  getBookmarkCount,
  isSchemeBookmarked,
  toggleSchemeBookmark,
} from '@/lib/bookmarks';

interface FundDetailActionsProps {
  readonly schemeId: string;
}

interface BackendPlaceholder {
  readonly id: string;
  readonly endpoint: string;
  readonly note: string;
}

const DUMMY_AUTH_STORAGE_KEY = 'sme-grant-navigator.dummy-authenticated';

const backendPlaceholders: ReadonlyArray<BackendPlaceholder> = [
  {
    id: 'match',
    endpoint: 'POST /api/match',
    note: 'Eligibility scoring endpoint placeholder.',
  },
  {
    id: 'draft',
    endpoint: 'POST /api/draft',
    note: 'Draft generation endpoint placeholder.',
  },
  {
    id: 'checkout',
    endpoint: 'POST /api/checkout',
    note: 'Stripe checkout session endpoint placeholder.',
  },
];

export function FundDetailActions({ schemeId }: FundDetailActionsProps) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const nextLoggedIn =
      window.localStorage.getItem(DUMMY_AUTH_STORAGE_KEY) === 'true';

    setIsLoggedIn(nextLoggedIn);
    setIsBookmarked(isSchemeBookmarked(schemeId));
    setBookmarkCount(getBookmarkCount());
    setIsReady(true);
  }, [schemeId]);

  function handleBookmarkClick() {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const result = toggleSchemeBookmark(schemeId);
    setIsBookmarked(result.isBookmarked);
    setBookmarkCount(result.count);
  }

  function handleDummyLogin() {
    window.localStorage.setItem(DUMMY_AUTH_STORAGE_KEY, 'true');
    setIsLoggedIn(true);
    setShowLoginModal(false);
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">Saved</p>
          <p className="mt-1 text-2xl text-text-primary">{isReady ? bookmarkCount : '--'}</p>
        </div>

        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">Mock Auth</p>
          <p className="mt-1 text-2xl text-text-primary">{isLoggedIn ? 'On' : 'Off'}</p>
        </div>

        <button
          type="button"
          onClick={handleBookmarkClick}
          className={`rounded-xl border px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] transition ${
            isBookmarked
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-border bg-surface text-text-primary hover:border-accent hover:text-accent'
          }`}
        >
          <span className="flex items-center gap-2 text-xl normal-case tracking-normal">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M6 4.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 4.5V21l-6-3-6 3V4.5Z" />
            </svg>
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </span>
        </button>
      </div>

      <section className="rounded-xl border border-border bg-surface/80 p-4">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
          Backend Integration
        </h2>
        <ul className="mt-3 space-y-2">
          {backendPlaceholders.map((placeholder) => (
            <li
              key={placeholder.id}
              className="rounded-lg border border-border bg-background/60 px-3 py-2"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-primary">
                {placeholder.endpoint}
              </p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{placeholder.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {showLoginModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl">
            <h2 className="text-lg tracking-[-0.02em] text-text-primary">Mock log in required</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Placeholder auth is enabled for demo-only bookmark behavior.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="inline-flex rounded-xl border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary transition hover:text-text-primary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDummyLogin}
                className="inline-flex rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-accent transition hover:bg-accent/20"
              >
                Enable Mock Login
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
