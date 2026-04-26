import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { getAllSchemes } from '@/lib/schemes/repository';
import {
  formatFundingAmount,
  getSchemeStatusBadgeStyle,
  getSchemeStatusText,
} from '@/lib/schemes/presentation';

export const metadata: Metadata = {
  title: 'Scheme Catalogue | Thunder',
  description: 'All funding schemes in the catalogue. Browse manually, or let the agent do it for you.',
};

export default async function FundsPage() {
  const schemes = await getAllSchemes();

  return (
    <main className="min-h-screen bg-background text-text-primary">

      {/* ── Top bar ── */}
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
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{schemes.length} schemes</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

        {/* ── Header ── */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-tertiary">Scheme Catalogue</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Funding Schemes</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Structured data for every scheme — readable by humans and agents alike.
            </p>
          </div>

          {/* Agent CTA — hidden until chat is released */}
        </div>

        {/* ── Access mode hint ── */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { label: 'In-house agent', href: '#', active: false, soon: true },
            { label: 'REST API', href: '#', active: false, soon: true },
            { label: 'MCP server', href: '#', active: false, soon: true },
            { label: 'Browse UI', href: '/funds', active: true },
          ].map((mode) => (
            <span
              key={mode.label}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]"
              style={mode.active ? {
                borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                color: 'var(--accent)',
              } : { borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
            >
              {mode.active && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />}
              {mode.label}
              {mode.soon && <span className="text-[8px] opacity-60"> soon</span>}
            </span>
          ))}
        </div>

        {/* ── Scheme list ── */}
        <div className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {/* Header */}
          <div className="hidden bg-surface px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary md:grid md:grid-cols-[minmax(0,1fr)_160px_120px_100px]">
            <div>Scheme</div>
            <div>Category</div>
            <div>Max funding</div>
            <div>Status</div>
          </div>

          {schemes.map((scheme) => (
            <Link
              key={scheme.id}
              href={`/funds/${scheme.id}`}
              className="group flex flex-col gap-1 px-5 py-4 transition hover:bg-surface md:grid md:grid-cols-[minmax(0,1fr)_160px_120px_100px] md:items-center"
            >
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{scheme.name}</p>
                <p className="mt-0.5 text-xs text-text-tertiary line-clamp-1">{scheme.shortDescription}</p>
              </div>
              <div className="font-mono text-xs text-text-tertiary">{scheme.category}</div>
              <div className="font-mono text-sm text-text-primary">{formatFundingAmount(scheme.fundingCap, scheme.currency)}</div>
              <div>
                <span
                  className="inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]"
                  style={getSchemeStatusBadgeStyle(scheme.status)}
                >
                  {getSchemeStatusText(scheme.status)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Footer nudge ── */}
        <p className="mt-8 text-center text-xs text-text-tertiary">
          {schemes.length} schemes tracked. More soon.
        </p>
      </div>
    </main>
  );
}
