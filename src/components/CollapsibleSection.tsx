'use client';

import { useState } from 'react';

interface CollapsibleSectionProps {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly defaultOpen?: boolean;
  readonly hasNumbers?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  hasNumbers = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left transition hover:opacity-80"
      >
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">
          {title}
          {hasNumbers && (
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
              (foldable)
            </span>
          )}
        </h2>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-6">
          {children}
        </div>
      )}
    </div>
  );
}
