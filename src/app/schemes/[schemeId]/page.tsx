import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { CopySchemeContext } from '@/components/CopySchemeContext';
import { SchemeDetailActions } from '@/components/SchemeDetailActions';
import { SchemesSidebar } from '@/components/SchemesSidebar';
import {
  listSchemes,
  getSchemeContext,
} from '@/lib/schemes';
import {
  formatFundingAmount,
} from '@/lib/schemes/presentation';

interface SchemeDetailPageProps {
  readonly params: Promise<{
    readonly schemeId: string;
  }>;
}

export async function generateStaticParams() {
  const schemes = await listSchemes();
  return schemes.map((scheme) => ({ schemeId: scheme.id }));
}

export async function generateMetadata({ params }: SchemeDetailPageProps): Promise<Metadata> {
  const { schemeId } = await params;
  const document = await getSchemeContext(schemeId);
  if (!document) return { title: 'Scheme Not Found | Thunder' };
  return {
    title: `${document.name} | Thunder`,
    description: document.shortDescription,
  };
}

export default async function SchemeDetailPage({ params }: SchemeDetailPageProps) {
  const { schemeId } = await params;
  const [document, allSchemes] = await Promise.all([
    getSchemeContext(schemeId),
    listSchemes(),
  ]);

  if (!document) notFound();

  const scheme = document;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-text-primary">
      {/* ── Body: sidebar + content, full height ── */}
      <SchemesSidebar schemes={allSchemes} activeId={schemeId}>
        <div className="mx-auto max-w-2xl px-6 py-12">

          {/* ── Hero ── */}
          <div className="border-b border-border pb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">{scheme.category}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] leading-tight">{scheme.name}</h1>
            <p className="mt-4 text-base leading-7 text-text-secondary max-w-xl">{scheme.shortDescription}</p>

            {/* ── Key stats inline ── */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">Max funding</p>
                <p className="mt-1 font-mono text-xl font-semibold text-text-primary">{formatFundingAmount(scheme.fundingCap, scheme.currency)}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">Duration</p>
                <p className="mt-1 font-mono text-xl font-semibold text-text-primary">
                  {scheme.durationMonths === null ? 'Varies' : `${scheme.durationMonths} mo`}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">Administrator</p>
                <p className="mt-1 text-sm text-text-primary">{scheme.administrator ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* ── Draft + Eligibility CTAs ── */}
          <div className="py-8 border-b border-border space-y-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-text-primary">Generate a draft application</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary max-w-sm">
                  Describe your company. Thunder writes the draft and marks gaps with <code className="rounded bg-surface px-1 py-0.5 font-mono text-[10px]">[TODO]</code>.
                </p>
              </div>
              <Link
                href={`/draft?scheme=${schemeId}`}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
                Draft application
              </Link>
            </div>

            {/* Eligibility check CTA */}
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-text-primary">Check your eligibility</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary max-w-sm">
                  Not sure if you qualify? Describe your company and get an instant AI assessment.
                </p>
              </div>
              <Link
                href={`/eligibility?scheme=${schemeId}`}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Check eligibility
              </Link>
            </div>
          </div>

          {/* ── Right-rail: actions + links ── */}
          <div className="py-8 border-b border-border grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Copy context */}
            <div className="rounded-xl border p-4" style={{
              borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--accent) 4%, transparent)',
            }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>For your agent</p>
              <p className="mt-1.5 text-sm font-medium text-text-primary">Copy scheme context</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Paste into Claude or GPT for scheme-specific answers.</p>
              <div className="mt-3">
                <CopySchemeContext scheme={scheme} corpus={scheme.corpus} />
              </div>
            </div>

            {/* Official links */}
            {scheme.links.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Official portal</p>
                <ul className="mt-3 space-y-2">
                  {scheme.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm underline underline-offset-4 transition"
                        style={{ color: 'var(--accent)' }}
                      >
                        {link.label}
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-2.5 w-2.5 shrink-0 opacity-60">
                          <path d="M2 10L10 2M5 2h5v5" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <SchemeDetailActions schemeId={scheme.id} />
          </div>

          {/* ── Corpus / guidance ── */}
          {scheme.corpus ? (
            <article className="mt-8 prose prose-sm prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-sm prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-text-secondary prose-p:leading-7
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-table:text-xs prose-th:text-text-tertiary prose-th:font-mono prose-th:uppercase prose-th:tracking-wider
              prose-td:text-text-secondary
              prose-code:rounded prose-code:bg-surface prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-[11px]
              prose-hr:border-border">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{scheme.corpus}</ReactMarkdown>
            </article>
          ) : (
            <p className="mt-8 text-sm leading-6 text-text-secondary">
              Guidance is being prepared. Visit the{' '}
              {scheme.links[0] ? (
                <a href={scheme.links[0].url} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-4">
                  official portal
                </a>
              ) : 'official portal'}.
            </p>
          )}

        </div>
      </SchemesSidebar>
    </div>
  );
}
