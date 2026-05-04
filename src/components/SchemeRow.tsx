import React from 'react';
import Link from 'next/link';

import type { Scheme } from '@/types';
import { formatFundingAmount } from '@/lib/schemes/presentation';

interface SchemeRowProps {
  readonly index: number;
  readonly scheme: Scheme;
}

function bodyAcronym(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 3);

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function SchemeRow({ index, scheme }: SchemeRowProps) {

  return (
    <Link
      href={`/schemes/${scheme.id}`}
      className="grid border-b border-border transition hover:bg-surface-hover md:grid-cols-[60px_minmax(0,1fr)_150px]"
    >
      <div className="hidden px-3 py-4 font-mono text-xs text-text-tertiary md:block">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="px-3 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden">
            {
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">
                {bodyAcronym(scheme.name)}
              </span>
            }
          </span>

          <span className="font-semibold text-text-primary transition hover:text-accent">
            {scheme.name}
          </span>
        </div>
      </div>
      <div className="hidden px-3 py-4 font-mono text-sm text-text-primary md:block">
        {formatFundingAmount(scheme.fundingCap, scheme.currency)}
      </div>
    </Link>
  );
}