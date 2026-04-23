import type { Metadata } from 'next';
import Link from 'next/link';

import { getAllSchemesFromDatabase } from '@/lib/schemes/db';

export const metadata: Metadata = {
  title: 'Funding Schemes | Thunder',
  description: 'Browse all funding schemes and open detailed pages for each one.',
};

function formatFundingCap(fundingCap: number | null): string {
  if (fundingCap === null) {
    return 'Varies by programme call';
  }

  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0,
  }).format(fundingCap);
}

export default async function FundsPage() {
  const schemes = await getAllSchemesFromDatabase();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <header className="mb-6 border-b border-border pb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
          Funding Schemes
        </p>
        <h1 className="mt-2 text-3xl tracking-[-0.03em] sm:text-4xl">Fund Details Directory</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
          Open any scheme to see detailed objectives, contacts, references, and integration status.
        </p>
        <Link
          href="/#schemes"
          className="mt-4 inline-flex rounded-lg border border-border bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-primary transition hover:border-accent hover:text-accent"
        >
          Back to Home Browser
        </Link>
      </header>

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="hidden border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary md:grid md:grid-cols-[60px_minmax(0,1fr)_220px_140px]">
          <div>#</div>
          <div>Scheme</div>
          <div>Funding Cap</div>
          <div>Status</div>
        </div>

        {schemes.map((scheme, index) => (
          <Link
            key={scheme.id}
            href={`/funds/${scheme.id}`}
            className="grid border-b border-border px-4 py-4 transition hover:bg-surface-hover md:grid-cols-[60px_minmax(0,1fr)_220px_140px]"
          >
            <div className="hidden font-mono text-xs text-text-tertiary md:block">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div>
              <p className="font-semibold text-text-primary">{scheme.name}</p>
              <p className="mt-1 text-sm text-text-secondary">{scheme.shortDescription}</p>
            </div>
            <div className="mt-2 font-mono text-sm text-text-primary md:mt-0">
              {formatFundingCap(scheme.fundingCap)}
            </div>
            <div className="mt-2 md:mt-0">
              <span className="inline-flex rounded-full border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
                {scheme.status.replace('-', ' ')}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}