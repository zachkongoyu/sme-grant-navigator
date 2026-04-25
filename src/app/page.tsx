import type { Metadata } from 'next';
import Link from 'next/link';

import { SchemeBrowser } from '@/components/SchemeBrowser';
import { getAllSchemesFromDatabase } from '@/lib/schemes/db';

export const metadata: Metadata = {
  title: 'Thunder | Easy BUD 2026 Application Generator',
  description:
    'Describe your company. Thunder drafts your full Easy BUD application — with [TODO] markers so you know exactly what to fill in.',
};

export default async function HomePage() {
  const schemes = await getAllSchemesFromDatabase();

  return (
    <main className="relative overflow-hidden">
      <div className="relative mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
        <section className="flex flex-col items-center justify-center pb-12 pt-20 text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Easy BUD open · apply by 31 May 2026
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Generate your Easy&nbsp;BUD<br className="hidden sm:block" /> application.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-text-secondary">
            Describe your company and activities. Thunder drafts the full application with{' '}
            <code className="rounded bg-border px-1 py-0.5 text-sm">[TODO]</code>{' '}
            markers where it needs your input.
          </p>

          <Link
            href="/draft/easy-bud"
            className="mt-8 inline-flex items-center gap-2.5 rounded-xl bg-accent px-7 py-3.5 text-base font-medium text-background transition hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              <path d="M20 3v4M22 5h-4" />
            </svg>
            Start drafting
          </Link>

          {/* Secondary links */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary">
            <Link href="/funds" className="transition hover:text-accent">Browse all schemes</Link>
            <span className="text-border">·</span>
            <Link href="/funds/easy-bud" className="transition hover:text-accent">Easy BUD overview</Link>
            <span className="text-border">·</span>
            <Link href="/reimbursement" className="transition hover:text-accent">Reimbursement guide</Link>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mb-16 grid gap-3 sm:grid-cols-3">
          {[
            {
              step: '01',
              heading: 'Describe your project',
              body: 'Tell Thunder your company, the activities you want funded, and your rough budget.',
            },
            {
              step: '02',
              heading: 'Get a complete draft',
              body: 'Thunder generates every section with real figures — [TODO] markers flag what you still need to add.',
            },
            {
              step: '03',
              heading: 'Submit with confidence',
              body: 'Review, fill the TODOs, and submit via the HKPC online portal. No surprises.',
            },
          ].map(({ step, heading, body }) => (
            <div key={step} className="rounded-xl border border-border bg-surface p-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">{step}</span>
              <p className="mt-2 text-sm font-medium text-text-primary">{heading}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{body}</p>
            </div>
          ))}
        </section>

        {/* ── Scheme browser ── */}
        <div className="mb-6 flex items-center gap-4">
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

