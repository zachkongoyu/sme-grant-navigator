'use client';

import { useState } from 'react';

interface CopyButtonProps {
  /** Text to copy to clipboard. */
  value: string;
  /** Button label. Defaults to "Copy". */
  label?: string;
  /** `default` = border/ghost (secondary action). `primary` = filled accent (main CTA). */
  variant?: 'default' | 'primary';
  /** `default` = rounded-xl px-5 py-2.5 text-sm. `compact` = rounded-lg px-3 py-1.5 font-mono text-xs. */
  size?: 'default' | 'compact';
  className?: string;
}

export function CopyButton({
  value,
  label = 'Copy',
  variant = 'default',
  size = 'default',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sizeClasses =
    size === 'compact'
      ? 'rounded-lg px-3 py-1.5 font-mono text-xs'
      : 'rounded-xl px-5 py-2.5 text-sm';

  const variantClasses =
    variant === 'primary'
      ? copied
        ? 'border border-success/40 bg-success/10 text-success'
        : 'border border-accent/40 bg-(--accent) text-(--accent-foreground) hover:opacity-90'
      : copied
        ? 'border border-success/40 text-success'
        : 'border border-border text-text-secondary hover:border-accent hover:text-accent';

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={['flex items-center gap-2 transition', sizeClasses, variantClasses, className ?? ''].join(' ')}
    >
      {copied ? (
        <>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
            <rect x="6" y="6" width="8" height="8" rx="1.5" />
            <path d="M4 10H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" strokeLinecap="round" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
