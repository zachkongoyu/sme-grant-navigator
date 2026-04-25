import type { Metadata } from 'next';
import Link from 'next/link';

import { ApiExplorer } from '@/components/ApiExplorer';

export const metadata: Metadata = {
  title: 'REST API | Thunder',
  description:
    'Programmatic access to grant scheme data — eligibility rules, funding caps, contacts — via the Thunder REST API.',
};




export default function RestApiPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary">

      {/* ── Nav ── */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary transition hover:text-accent"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden="true">
              <path d="M10 13L5 8l5-5" />
            </svg>
            Home
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/mcp" className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary transition hover:text-text-primary">
              MCP server →
            </Link>
            <span className="inline-flex items-center rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
              Coming soon
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-tertiary">Developer Access</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Your stack speaks HTTP.
            <br />
            <span className="text-accent">So does Thunder.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">
            Query grant schemes, check eligibility, and trigger application drafts from any language, any framework.
            One key, one base URL, structured JSON back.
          </p>

          {/* Base URL chip */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="font-mono text-[11px] text-text-tertiary">Base URL</span>
            <span className="h-3.5 w-px bg-border" />
            <code className="font-mono text-sm text-text-primary">https://api.thunder.app/v1</code>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">

        {/* ── API Explorer ── */}
        <section className="mb-14">
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">API reference</h2>
          <p className="mb-5 text-sm text-text-secondary">
            Select an endpoint to see its request and response. Switch languages with the tabs.
          </p>
          <ApiExplorer />
        </section>
        {/* ── Auth ── */}
        <section className="mb-14">
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">Authentication</h2>
          <p className="mb-5 text-sm text-text-secondary">
            Pass your key as a Bearer token. All endpoints are HTTPS-only.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface-hover p-5">
            <pre className="font-mono text-xs leading-6 text-text-primary">{`Authorization: Bearer YOUR_API_KEY`}</pre>
          </div>
        </section>

        {/* ── Tiers ── */}
        <section className="mb-14">
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">Rate Limits</h2>
          <p className="mb-5 text-sm text-text-secondary">Generous free tier. Scale up when you need to.</p>
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
            {[
              { tier: 'Free', limit: '100 req / day', note: 'Read-only · no key required' },
              { tier: 'Pro', limit: '10,000 req / day', note: '/match and /draft included' },
              { tier: 'Enterprise', limit: 'Unlimited', note: 'SLA + dedicated support' },
            ].map((t, i) => (
              <div key={t.tier} className={`bg-surface px-5 py-5 ${i === 1 ? 'border-x border-border' : ''}`}>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{t.tier}</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-text-primary">{t.limit}</p>
                <p className="mt-1 text-xs text-text-secondary">{t.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-accent/20 bg-accent/5 px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-text-primary">Join the early access list</p>
            <p className="mt-1 text-sm text-text-secondary">
              We're onboarding developer teams before public launch. Tell us what you're building.
            </p>
          </div>
          <a
            href="mailto:api@thunder.app?subject=API%20Early%20Access"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Request access →
          </a>
        </section>
      </div>
    </main>
  );
}
