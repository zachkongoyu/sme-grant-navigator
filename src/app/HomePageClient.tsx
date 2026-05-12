'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Scheme } from '@/types';
import { StatusChip } from '@/components/StatusChip';

interface HomePageClientProps {
  humanCount: number;
  projectCount: number;
  aiCount: number;
  schemeCount: number;
  schemes: ReadonlyArray<Scheme>;
}

export default function HomePageClient({
  humanCount,
  projectCount,
  aiCount,
  schemeCount,
  schemes,
}: HomePageClientProps) {
  const t = useTranslations('landing');

  return (
    <main className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">

        {/* Above-the-fold */}
        <section className="mb-12 grid items-center gap-8 lg:grid-cols-[1fr_1fr]">

          {/* Left — live ecosystem counts */}
          <div className="space-y-8">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-tertiary">{t('live')}</p>
            </div>
            <div className="space-y-6">
              {/* Hero stat — founders */}
              <Link href="/directory" className="group block">
                <p className="font-[family-name:var(--font-geist-pixel-square)] text-[7rem] leading-none">{humanCount}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary mt-2 transition-colors group-hover:text-accent">{t('founders')}</p>
              </Link>

              {/* Secondary stats */}
              <div className="flex items-center gap-8 border-t border-border pt-5">
                <Link href="/showcase" className="group space-y-1">
                  <p className="font-[family-name:var(--font-geist-pixel-square)] text-3xl leading-none">{projectCount}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-tertiary transition-colors group-hover:text-accent">{t('projects')}</p>
                </Link>
                <Link href="/directory" className="group space-y-1">
                  <p className="font-[family-name:var(--font-geist-pixel-square)] text-3xl leading-none">{aiCount}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-tertiary transition-colors group-hover:text-accent">{t('aiAgents')}</p>
                </Link>
                <Link href="/schemes" className="group space-y-1">
                  <p className="font-[family-name:var(--font-geist-pixel-square)] text-3xl leading-none">{schemeCount}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-tertiary transition-colors group-hover:text-accent">{t('schemes')}</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Right — headline */}
          <div className="flex flex-col justify-center lg:pl-4">
            <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
              {t('badge')}
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {t('headlinePrefix')}{' '}
              <span className="text-text-secondary">{t('headlineSuffix')}</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-text-secondary">
              {t('description')}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/showcase"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                {t('ctaShowcase')}
              </Link>
              <Link
                href="/schemes"
                className="inline-flex items-center rounded-xl border border-border px-5 py-2.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
              >
                {t('ctaSchemes')}
              </Link>
            </div>
          </div>
        </section>

        {/* Marquee strip */}
        <div className="marquee-region marquee-fade -mx-4 mb-12 overflow-hidden border-y border-border py-3 sm:-mx-6 lg:-mx-8">
          <div className="marquee-track gap-6" aria-hidden="true">
            {[...schemes, ...schemes].map((s, i) => (
              <span
                key={i}
                className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary"
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 50%, transparent)' }}
                />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <section>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-text-tertiary">
            {t('featuresTitle')}
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
              <p className="mt-3 text-sm font-medium text-text-primary">{t('drafter')}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{t('drafterDesc')}</p>
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
              <p className="mt-3 text-sm font-medium text-text-primary">{t('eligibility')}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{t('eligibilityDesc')}</p>
            </Link>

            {/* Showcase */}
            <Link href="/showcase" className="group rounded-xl border border-border bg-surface p-5 transition hover:border-accent/40">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover text-text-secondary group-hover:text-accent" style={{ transition: 'color 0.15s' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </span>
                <StatusChip variant="beta" compact />
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">{t('showcase')}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{t('showcaseDesc')}</p>
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
              <p className="mt-3 text-sm font-medium text-text-primary">{t('agent')}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{t('agentDesc')}</p>
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
              <p className="mt-3 text-sm font-medium text-text-primary">{t('restApi')}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{t('restApiDesc')}</p>
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
              <p className="mt-3 text-sm font-medium text-text-primary">{t('mcp')}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{t('mcpDesc')}</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
