import Link from 'next/link';

import { getFundContentBySchemeId } from '@/lib/schemes/content';
import type { Scheme } from '@/types';

interface SchemeRowProps {
  readonly index: number;
  readonly scheme: Scheme;
}

function formatFundingCap(fundingCap: number | null) {
  if (fundingCap === null) {
    return 'Varies';
  }

  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0,
  }).format(fundingCap);
}

function statusClasses(status: Scheme['status']) {
  if (status === 'active') {
    return 'border-success/40 bg-success/10 text-success';
  }

  if (status === 'coming-soon') {
    return 'border-warning/40 text-warning';
  }

  return 'border-border text-text-tertiary';
}

function bodyAcronym(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 3);

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function SchemeRow({ index, scheme }: SchemeRowProps) {
  const fundContent = getFundContentBySchemeId(scheme.id);

  return (
    <Link
      href={`/funds/${scheme.id}`}
      className="grid border-b border-border transition hover:bg-surface-hover md:grid-cols-[60px_minmax(0,1fr)_150px_140px]"
    >
      <div className="hidden px-3 py-4 font-mono text-xs text-text-tertiary md:block">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="px-3 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden">
            {
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">
                {fundContent ? bodyAcronym(fundContent.administeringBody) : 'SG'}
              </span>
            }
          </span>

          <span className="font-semibold text-text-primary transition hover:text-accent">
            {scheme.name}
          </span>
        </div>
      </div>
      <div className="hidden px-3 py-4 font-mono text-sm text-text-primary md:block">
        {formatFundingCap(scheme.fundingCap)}
      </div>
      <div className="px-3 py-4">
        <span
          className={`inline-flex rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${statusClasses(
            scheme.status,
          )}`}
        >
          {scheme.status.replace('-', ' ')}
        </span>
      </div>
    </Link>
  );
}