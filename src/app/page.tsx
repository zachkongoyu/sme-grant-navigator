import type { Metadata } from 'next';
import Link from 'next/link';
import { GeistPixelSquare } from 'geist/font/pixel';

import { HeroComposer } from '@/components/chat/HeroComposer';
import { SchemeBrowser } from '@/components/SchemeBrowser';
import { getAllSchemesFromDatabase } from '@/lib/schemes/db';

export const metadata: Metadata = {
  title: 'Thunder | AI Application Drafts for SME Funding',
  description:
    'Drop in your business context. Thunder finds matching grant schemes and drafts the application — faster than any spreadsheet.',

};

export default async function HomePage() {
  const schemes = await getAllSchemesFromDatabase();

  return (
    <main className="relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
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

        {/* ── Marquee strip ── */}
        <div className="marquee-region marquee-fade -mx-4 mb-16 overflow-hidden border-y border-border py-3 sm:-mx-6 lg:-mx-8">
          <div className="marquee-track gap-6" aria-hidden="true">
            {[...schemes, ...schemes].map((s, i) => (
              <span key={i} className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
                <span className="h-1 w-1 rounded-full bg-accent/50" />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* ── Access modes ── */}
        <section className="mb-20">
          <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-text-tertiary">
            However you prefer to work
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* Agent */}
            <Link href="/chat" className="group rounded-xl border border-border bg-surface p-5 transition hover:border-accent">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent">Recommended</span>
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">In-house agent</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Chat with Thunder. Describe your business, get matched schemes and a draft application.</p>
            </Link>

            {/* API */}
            <Link href="/rest-api" className="group rounded-xl border border-border bg-surface p-5 transition hover:border-accent/60">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover text-text-tertiary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-tertiary">Soon</span>
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">REST API</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Query scheme data, eligibility rules, and funding caps programmatically from your own stack.</p>
            </Link>

            {/* MCP */}
            <Link href="/mcp" className="group rounded-xl border border-border bg-surface p-5 transition hover:border-accent/60">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover text-text-tertiary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-tertiary">Soon</span>
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">MCP server</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Connect Claude, Cursor, or any MCP-compatible agent directly to Thunder's scheme database.</p>
            </Link>

            {/* UI */}
            <Link href="/funds" className="group rounded-xl border border-border bg-surface p-5 transition hover:border-border/80">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover text-text-tertiary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">Browse manually</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">All {schemes.length} schemes in a searchable table. For when you really want to read every page.</p>
            </Link>
          </div>
        </section>

        {/* ── Scheme browser ── */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">{schemes.length} schemes</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <section id="schemes" className="scroll-mt-16">
          <SchemeBrowser schemes={schemes} />
        </section>
      </div>
    </main>
  );
}
