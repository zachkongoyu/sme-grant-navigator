import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CopyFundContext } from '@/components/CopyFundContext';
import { FundDetailActions } from '@/components/FundDetailActions';
import type { Scheme } from '@/types';
import { getFundContentBySchemeId } from '@/lib/schemes/content';
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
  if (status === 'active') return 'border-success/40 bg-success/10 text-success';
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
    title: `${scheme.name} | Thunder`,
    description: scheme.shortDescription,
  };
}

export default async function FundDetailPage({ params }: FundDetailPageProps) {
  const { schemeId } = await params;
  const scheme = await getSchemeByIdFromDatabase(schemeId);
  const fundContent = getFundContentBySchemeId(schemeId);

  if (!scheme) notFound();

  return (
    <main className="min-h-screen bg-background text-text-primary">

      {/* ── Top bar ── */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/#schemes"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary transition hover:text-accent"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden="true">
              <path d="M10 13L5 8l5-5" />
            </svg>
            All schemes
          </Link>

          {/* Agent-ready badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Agent-ready
          </span>
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
          {fundContent && (
            <div className="col-span-2 bg-surface px-5 py-4 sm:col-span-1">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">Administered by</dt>
              <dd className="mt-1.5 text-sm leading-5 text-text-primary">{fundContent.administeringBody}</dd>
            </div>
          )}
        </dl>

        {/* ── Content ── */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">

          {/* Fund details */}
          <div className="space-y-8">
            {fundContent ? (
              <>
                <section>
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Objective</h2>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{fundContent.objective}</p>
                </section>

                <section>
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Who can apply</h2>
                  <ul className="mt-3 space-y-2">
                    {fundContent.targetRecipients.map((r) => (
                      <li key={r} className="flex items-start gap-2.5 text-sm leading-6 text-text-secondary">
                        <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </section>

                {fundContent.notes && fundContent.notes.length > 0 && (
                  <section>
                    <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Notes</h2>
                    <ul className="mt-3 space-y-2">
                      {fundContent.notes.map((note) => (
                        <li key={note} className="flex items-start gap-2.5 text-sm leading-6 text-text-secondary">
                          <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-text-tertiary/60" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {(fundContent.contact.tel || fundContent.contact.email || fundContent.contact.website) && (
                  <section>
                    <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Contact</h2>
                    <ul className="mt-3 space-y-1 text-sm leading-6 text-text-secondary">
                      {fundContent.contact.tel && <li>Tel: {fundContent.contact.tel}</li>}
                      {fundContent.contact.email && <li>Email: {fundContent.contact.email}</li>}
                      {fundContent.contact.website && (
                        <li>
                          <a href={fundContent.contact.website} target="_blank" rel="noreferrer"
                            className="text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent">
                            {fundContent.contact.website}
                          </a>
                        </li>
                      )}
                    </ul>
                  </section>
                )}

                {scheme.links.length > 0 && (
                  <section>
                    <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Official references</h2>
                    <ul className="mt-3 space-y-1.5">
                      {scheme.links.map((link) => (
                        <li key={link.url}>
                          <a href={link.url} target="_blank" rel="noreferrer"
                            className="text-sm text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent">
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            ) : (
              <p className="text-sm leading-6 text-text-secondary">
                Detailed content for this scheme is being expanded.
              </p>
            )}
          </div>

          {/* Actions sidebar */}
          <aside className="space-y-3 lg:pt-0">

            {/* Agent callout */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">For your agent</p>
              <p className="mt-1.5 text-sm font-medium text-text-primary">Give your agent everything it needs</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Paste into Claude, GPT, Cursor, or any chat to get scheme-specific answers instantly.
              </p>
              <div className="mt-3">
                <CopyFundContext scheme={scheme} fundContent={fundContent ?? null} />
              </div>
            </div>

            {/* Ask Thunder */}
            <Link
              href="/chat"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4M22 5h-4" />
              </svg>
              Ask Thunder
            </Link>

            {/* Save */}
            <FundDetailActions schemeId={scheme.id} />
          </aside>
        </div>
      </div>
    </main>
  );
}
