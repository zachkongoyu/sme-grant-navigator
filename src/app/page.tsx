import type { Metadata } from 'next';
import { GeistPixelSquare } from 'geist/font/pixel';

import { HeroComposer } from '@/components/chat/HeroComposer';
import { SchemeBrowser } from '@/components/SchemeBrowser';
import { getAllSchemesFromDatabase } from '@/lib/schemes/db';
import { getFundContentBySchemeId } from '@/lib/schemes/content';

export const metadata: Metadata = {
  title: 'Thunder | AI Application Drafts for SME Funding',
  description:
    'Explore Easy BUD and upcoming Hong Kong SME funding schemes. Drop in your context — the agent finds matching schemes and drafts the application.',
};

function bodyAcronym(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 3);

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export default async function HomePage() {
  const schemes = await getAllSchemesFromDatabase();
  const tickerSchemes = [...schemes, ...schemes];

  return (
    <main className="relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">

        {/* Hero — composer as the primary interactive element */}
        <section className="flex flex-col items-center justify-center pb-16 pt-24 text-center">
          <h1
            className={`${GeistPixelSquare.className} text-4xl uppercase leading-none tracking-[-0.04em] text-accent sm:text-5xl lg:text-[5.5rem]`}
          >
            THUNDER
          </h1>
          <p className="mt-4 text-xl tracking-[-0.02em] text-text-primary sm:text-2xl">
            Fund applications, done by an agent.
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Drop in your context. Get a draft.
          </p>
          <div className="mt-8 w-full max-w-2xl">
            <HeroComposer />
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-border" />
          <span className="font-mono text-xs text-text-tertiary">{schemes.length} schemes</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Marquee */}
        <section className="relative z-0 my-4">
          <div className="px-1 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Funding Schemes Inspired From
          </div>
          <div className="marquee-region marquee-fade overflow-hidden whitespace-nowrap py-2">
            <div className="marquee-track gap-8 px-1 font-mono text-xs text-text-secondary">
              {tickerSchemes.map((scheme, index) => (
                <span key={`${scheme.id}-${index}`} className="inline-flex items-center gap-3">
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

        {/* Fund list */}
        <section id="schemes" className="scroll-mt-16">
          <div className="mt-4">
            <SchemeBrowser schemes={schemes} />
          </div>
        </section>
      </div>
    </main>
  );
}
