'use client';

import { useRouter } from 'next/navigation';

export function DraftBackButton({ fallbackHref }: { readonly fallbackHref: string }) {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary transition-colors hover:text-text-primary"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden="true">
        <path d="M10 13L5 8l5-5" />
      </svg>
      Back
    </button>
  );
}
