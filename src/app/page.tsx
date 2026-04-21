import type { Metadata } from 'next';
import { GeistPixelSquare } from 'geist/font/pixel';

import { QuickStats } from '@/components/QuickStats';
import { SchemeBrowser } from '@/components/SchemeBrowser';
import { getFundContentBySchemeId } from '@/lib/schemes/content';
import { getAllSchemes } from '@/lib/schemes/registry';

export const metadata: Metadata = {
  title: 'Thunder | AI Application Drafts for SME Funding',
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
        <section className="relative z-0 mb-4 pt-4">
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

        <section className="relative z-20 grid gap-2 pb-1 xl:grid-cols-[minmax(0,1fr)_250px] xl:items-stretch">
          <div className="relative h-full p-2 sm:p-3">
            <div className="relative z-10 mt-1.5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between lg:gap-3">
              <div>
                <h1
                  className={`${GeistPixelSquare.className} max-w-4xl text-3xl uppercase leading-[0.9] tracking-[-0.04em] text-status-success sm:text-4xl lg:text-[4rem]`}
                >
                  THUNDER
                </h1>
                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-text-secondary sm:text-sm sm:leading-5">
                  This is an open-source project to unlock funding constraints by centralizing scattered grant
                  information in one place. We provide MCP, API, and agentic matching, draft application support,
                  and eligibility checking.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                  <span className="relative inline-flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-danger opacity-70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-danger" />
                  </span>
                  Live Update
                </div>
              </div>
            </div>
          </div>

          <div className="h-full">
            <QuickStats
              className="h-full p-3"
              stats={[
                { label: 'Funding Schemes', value: String(schemes.length) },
                { label: 'Live Schemes', value: String(activeSchemes.length) },
                { label: 'Coming Soon', value: String(comingSoonSchemes.length) },
                { label: 'Last Updated', value: 'Apr 20, 2026' },
              ]}
            />
          </div>
        </section>

        <section id="schemes" className="mt-2 scroll-mt-16">
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
            <a
              href="#schemes"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-text-primary transition hover:border-accent hover:text-accent"
            >
              Start with Easy BUD
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}