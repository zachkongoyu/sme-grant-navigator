import type { Metadata } from 'next';
import Link from 'next/link';

import { QuickStats } from '@/components/QuickStats';
import { SchemeBrowser } from '@/components/SchemeBrowser';
import { getFundContentBySchemeId } from '@/lib/schemes/content';
import { getAllSchemes } from '@/lib/schemes/registry';

export const metadata: Metadata = {
  title: 'HK Grant Navigator - AI Application Drafts for SME Funding',
  description:
    'Explore Easy BUD and upcoming Hong Kong SME funding schemes. Check fit fast and generate AI-assisted Easy BUD 2026 application drafts.',
};

function bodyAcronym(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 3);

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export default function HomePage() {
  const schemes = getAllSchemes();
  const activeSchemes = schemes.filter((scheme) => scheme.status === 'active');
  const comingSoonSchemes = schemes.filter(
    (scheme) => scheme.status === 'coming-soon',
  );
  const tickerSchemes = [...schemes, ...schemes];

  return (
    <main className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 -mx-4 mb-3 border-b border-border bg-background/80 px-4 py-1 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-text-tertiary">
                SME Grant Navigator
              </p>
            </div>
            <nav className="hidden items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-text-secondary sm:flex">
              <Link href="#schemes">Schemes</Link>
              <a href="#pricing">Pricing</a>
            </nav>
          </div>
        </header>

        <section className="mb-4">
          <div className="px-1 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Funding Schemes Inspired From
          </div>
          <div className="marquee-region marquee-fade overflow-hidden whitespace-nowrap py-2">
            <div className="marquee-track gap-8 px-1 font-mono text-xs text-text-secondary">
              {tickerSchemes.map((scheme, index) => (
                <span key={`${scheme.id}-${index}`} className="inline-flex items-center gap-3">
                  <span className="text-accent">{String(index + 1).padStart(2, '0')}</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden">
                    {(() => {
                      const fundContent = getFundContentBySchemeId(scheme.id);

                      if (fundContent?.administeringBodyLogoUrl) {
                        return (
                          <img
                            src={fundContent.administeringBodyLogoUrl}
                            alt={fundContent.administeringBodyLogoAlt ?? `${fundContent.administeringBody} logo`}
                            className="h-6 w-6 object-contain"
                          />
                        );
                      }

                      return (
                        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-text-secondary">
                          {fundContent ? bodyAcronym(fundContent.administeringBody) : 'SG'}
                        </span>
                      );
                    })()}
                  </span>
                  <span>{scheme.name}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-2 pb-1 xl:grid-cols-[minmax(0,1fr)_250px] xl:items-start">
          <div className="relative overflow-hidden p-2 sm:p-3">
            <div className="relative z-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-tertiary">
                Hong Kong Funding Index
              </p>
            </div>
            <div className="relative z-10 mt-1.5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between lg:gap-3">
              <div>
                <h1 className="max-w-4xl font-mono text-xl uppercase leading-[0.9] tracking-[-0.08em] text-text-primary sm:text-2xl lg:text-[2.15rem]">
                  SME GRANT <span className="text-accent">NAVIGATOR</span>
                </h1>
                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-text-secondary sm:text-sm sm:leading-5">
                  Searchable long-list of Hong Kong funding schemes, with Easy BUD live first.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:items-end">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-tertiary">
                  Last updated • Apr 20, 2026
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 xl:grid-cols-1 xl:grid-rows-[1fr_auto]">
            <QuickStats
              className="h-full p-3"
              stats={[
                { label: 'Funding Schemes', value: String(schemes.length) },
                { label: 'Live Schemes', value: String(activeSchemes.length) },
                { label: 'Coming Soon', value: String(comingSoonSchemes.length) },
                { label: 'Last Updated', value: 'Apr 20, 2026' },
              ]}
            />

            <section className="rounded-lg border border-border bg-surface/80 p-2.5 xl:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
                Live Now
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span className="text-sm text-text-primary">Easy BUD</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                  HK$100K
                </span>
              </div>
            </section>
          </div>
        </section>

        <section id="schemes" className="mt-3 scroll-mt-16">
          <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
                Find Schemes
              </p>
              <h2 className="mt-1 text-xl tracking-[-0.04em] text-text-primary sm:text-2xl">
                Funding schemes
              </h2>
            </div>
            <p className="max-w-2xl text-xs leading-5 text-text-secondary sm:text-sm">
              Searchable, filterable, and dense enough to browse immediately.
            </p>
          </div>

          <div className="mt-4">
            <SchemeBrowser schemes={schemes} />
          </div>
        </section>

        <section id="pricing" className="mt-16 rounded-lg border border-border bg-surface/70 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-text-tertiary">
            Pricing Snapshot
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg text-text-primary">Free eligibility preview. HK$299 to unlock the full draft.</p>
            <Link
              href="#schemes"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-text-primary transition hover:border-accent hover:text-accent"
            >
              Start with Easy BUD
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}