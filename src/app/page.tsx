import type { Metadata } from 'next';
import Link from 'next/link';

import { StatusChip } from '@/components/StatusChip';
import { listSchemes } from '@/lib/schemes';

export const metadata: Metadata = {
  title: 'Thunder | AI Grant Drafting Platform',
  description:
    'Thunder turns company context into grant-ready drafts. It launches with Easy BUD in Hong Kong and expands into broader grant workflows from there.',
};

export default async function HomePage() {
  const schemes = await listSchemes();
  const featuredScheme = schemes.find((s) => s.id === 'easy-bud');

  return (
    <main className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">

        {/* ── Above-the-fold: featured card left, headline right ── */}
        <section className="mb-12 grid items-center gap-8 lg:grid-cols-[1fr_1fr]">

          {/* Left — trending featured scheme */}
          {featuredScheme && (
            <div className="overflow-hidden rounded-2xl bg-surface">
              <div className="p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="badge-rainbow inline-flex rounded-full">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary"
                    >
                      Trending
                    </span>
                  </span>
                  <StatusChip variant="live" compact />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
                    {featuredScheme.category}
                  </span>
                </div>

                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                      {featuredScheme.name}
                    </h2>
                    <p className="mt-1.5 text-sm leading-6 text-text-secondary">
                      {featuredScheme.shortDescription}
                    </p>
                  </div>
                  {featuredScheme.fundingCap && (
                    <div className="min-w-25 shrink-0 rounded-xl border border-border bg-background px-4 py-3 text-center">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-text-tertiary">Max grant</p>
                      <p className="mt-0.5 text-xl font-semibold tracking-tight text-text-primary">
                        HK${(featuredScheme.fundingCap / 1000).toFixed(0)}K
                      </p>
                      <p className="font-mono text-[9px] text-text-tertiary">50% match</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/draft?scheme=${featuredScheme.id}`}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden="true">
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                    </svg>
                    Draft application
                  </Link>
                  <Link
                    href={`/schemes/${featuredScheme.id}`}
                    className="inline-flex items-center rounded-xl border border-border px-5 py-2.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
                  >
                    Scheme details
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Right — Thunder headline */}
          <div className="flex flex-col justify-center lg:pl-4">
            <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3 shrink-0" aria-hidden="true">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
              AI grant drafting platform
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Your grant application,{' '}
              <span className="text-text-secondary">drafted by AI.</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-text-secondary">
              Tell Thunder about your business and get a grant-ready draft in under a minute. Easy BUD in Hong Kong is the first step, not the limit.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.14em]">
              <Link
                href="/schemes/easy-bud"
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] text-accent transition hover:opacity-80"
                style={{
                  border: '1px solid color-mix(in srgb, var(--accent) 18%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                }}
              >
                Browse all schemes
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M4 10h12" />
                  <path d="m11 6 4 4-4 4" />
                </svg>
              </Link>
              <Link href="/reimbursement" className="text-[11px] text-text-tertiary transition hover:text-text-secondary">Reimbursement guide</Link>
            </div>
          </div>
        </section>

        {/* ── Marquee strip ── */}
        <div className="marquee-region marquee-fade -mx-4 mb-12 overflow-hidden border-y border-border py-3 sm:-mx-6 lg:-mx-8">
          <div className="marquee-track gap-6" aria-hidden="true">
            {[...schemes, ...schemes].map((s, i) => (
              <span key={i} className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 50%, transparent)' }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* ── Coming soon features ── */}
        <section>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-text-tertiary">
            More ways to work with Thunder
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* Drafter */}
            <Link href="/draft" className="group rounded-xl border bg-surface p-5 transition" style={{ borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)' }}>
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  </svg>
                </span>
                <StatusChip variant="beta" compact />
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">Drafter</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Pick a scheme, then let Thunder draft the application with the right scheme already loaded.</p>
            </Link>

            {/* Eligibility Check */}
            <Link href="/eligibility" className="group rounded-xl border border-border bg-surface p-5 transition hover:border-accent/40">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover text-text-secondary group-hover:text-accent" style={{ transition: 'color 0.15s' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
                <StatusChip variant="beta" compact />
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">Eligibility Check</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Describe your company and get an instant AI assessment of whether you qualify before writing a word.</p>
            </Link>

            {/* In-house agent */}
            <div className="rounded-xl border border-border bg-surface p-5 opacity-60">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover text-text-tertiary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <StatusChip variant="soon" compact />
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">In-house agent</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Chat with Thunder. Describe your business, get matched schemes and a draft application.</p>
            </div>

            {/* REST API */}
            <div className="rounded-xl border border-border bg-surface p-5 opacity-60">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover text-text-tertiary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </span>
                <StatusChip variant="soon" compact />
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">REST API</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Query scheme data, eligibility rules, and funding caps programmatically from your own stack.</p>
            </div>

            {/* MCP */}
            <div className="rounded-xl border border-border bg-surface p-5 opacity-60">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover text-text-tertiary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </span>
                <StatusChip variant="soon" compact />
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">MCP server</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Connect Claude, Cursor, or any MCP-compatible agent directly to Thunder&apos;s scheme database.</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

