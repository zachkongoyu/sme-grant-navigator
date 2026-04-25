import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { CopyFundContext } from '@/components/CopyFundContext';
import { FundDetailActions } from '@/components/FundDetailActions';
import type { Scheme } from '@/types';
import { loadCorpus } from '@/lib/schemes/corpus';
import {
  getAllSchemesFromDatabase,
  getSchemeByIdFromDatabase,
} from '@/lib/schemes/db';

interface FundDetailPageProps {
  readonly params: Promise<{
    readonly schemeId: string;
  }>;
}

function formatFundingCap(fundingCap: number | null, currency: string | null) {
  if (fundingCap === null) return 'Varies';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? 'HKD',
    maximumFractionDigits: 0,
  }).format(fundingCap);
}

function statusStyle(status: Scheme['status']) {
  if (status === 'open' || status === 'active') return 'border-success/40 bg-success/10 text-success';
  if (status === 'coming-soon') return 'border-warning/40 text-warning';
  return 'border-border text-text-tertiary';
}

export async function generateStaticParams() {
  const schemes = await getAllSchemesFromDatabase();
  return schemes.map((scheme) => ({ schemeId: scheme.id }));
}

export async function generateMetadata({ params }: FundDetailPageProps): Promise<Metadata> {
  const { schemeId } = await params;
  const scheme = await getSchemeByIdFromDatabase(schemeId);
  if (!scheme) return { title: 'Fund Not Found | Thunder' };
  return {
    title: `${scheme.name} | Easy BUD 2026 Application — Thunder`,
    description: scheme.shortDescription,
  };
}

export default async function FundDetailPage({ params }: FundDetailPageProps) {
  const { schemeId } = await params;
  const scheme = await getSchemeByIdFromDatabase(schemeId);

  if (!scheme) notFound();

  const corpus = await loadCorpus(schemeId);

  return (
    <main className="min-h-screen bg-background text-text-primary">

      {/* ── Top bar ── */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/funds"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary transition hover:text-accent"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden="true">
              <path d="M10 13L5 8l5-5" />
            </svg>
            All schemes
          </Link>

          {scheme.status === 'open' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Open
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">

        {/* ── Hero ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${statusStyle(scheme.status)}`}>
                {scheme.status.replace('-', ' ')}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">{scheme.category}</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{scheme.name}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">{scheme.shortDescription}</p>
          </div>
        </div>

        {/* ── Key stats ── */}
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          <div className="bg-surface px-5 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">Max funding</dt>
            <dd className="mt-1.5 font-mono text-2xl font-medium text-text-primary">{formatFundingCap(scheme.fundingCap, scheme.currency)}</dd>
          </div>
          <div className="bg-surface px-5 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">Duration</dt>
            <dd className="mt-1.5 font-mono text-2xl font-medium text-text-primary">
              {scheme.durationMonths === null ? 'Varies' : `${scheme.durationMonths} mo`}
            </dd>
          </div>
          <div className="col-span-2 bg-surface px-5 py-4 sm:col-span-1">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">Sponsor</dt>
            <dd className="mt-1.5 text-sm leading-5 text-text-primary">{scheme.sponsor ?? 'See official portal'}</dd>
          </div>
        </dl>

        {/* ── Draft CTA ── */}
        {scheme.draftable ? (
          <div className="mt-8 rounded-xl border border-accent/25 bg-accent/5 p-5">
            <p className="text-sm font-medium text-text-primary">Ready to apply? Generate a complete draft in under a minute.</p>
            <p className="mt-1 text-xs text-text-secondary">Describe your company — Thunder fills in the rest with <code>[TODO]</code> markers where it needs your input.</p>
            <Link
              href={`/draft/${schemeId}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
            >
              Generate draft
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-medium text-text-primary">Drafter coming soon for {scheme.name}</p>
            <p className="mt-1 text-xs text-text-secondary">
              Get notified when the {scheme.name} drafter launches.{' '}
              <a href="mailto:hello@thunderhk.ai?subject=Notify+me" className="text-accent underline underline-offset-4">
                Notify me
              </a>
            </p>
          </div>
        )}

        {/* ── Corpus / content ── */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">

          <div>
            {corpus ? (
              <article className="prose prose-sm prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-accent prose-table:text-xs">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{corpus}</ReactMarkdown>
              </article>
            ) : (
              <p className="text-sm leading-6 text-text-secondary">
                Detailed guidance for this scheme is being prepared. Check back soon or visit the{' '}
                {scheme.links[0] ? (
                  <a href={scheme.links[0].url} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-4">
                    official portal
                  </a>
                ) : 'official portal'}.
              </p>
            )}
          </div>

          {/* Actions sidebar */}
          <aside className="space-y-3">
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">For your agent</p>
              <p className="mt-1.5 text-sm font-medium text-text-primary">Copy scheme context</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Paste into Claude, GPT, or any chat to get scheme-specific answers instantly.
              </p>
              <div className="mt-3">
                <CopyFundContext scheme={scheme} corpus={corpus} />
              </div>
            </div>

            {scheme.links.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Official portal</p>
                <ul className="mt-2 space-y-1.5">
                  {scheme.links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noreferrer"
                        className="text-sm text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <FundDetailActions schemeId={scheme.id} />
          </aside>
        </div>
      </div>
    </main>
  );
}

