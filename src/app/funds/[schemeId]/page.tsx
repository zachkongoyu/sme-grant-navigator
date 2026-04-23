import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

function formatFundingCap(fundingCap: number | null) {
  if (fundingCap === null) {
    return 'Varies by programme call';
  }

  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0,
  }).format(fundingCap);
}

function statusStyle(status: Scheme['status']) {
  if (status === 'active') {
    return 'border-accent/40 text-accent';
  }

  if (status === 'coming-soon') {
    return 'border-warning/40 text-warning';
  }

  return 'border-border text-text-tertiary';
}

function bodyAcronym(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 3);

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export async function generateStaticParams() {
  const schemes = await getAllSchemesFromDatabase();

  return schemes.map((scheme) => ({
    schemeId: scheme.id,
  }));
}

export async function generateMetadata({ params }: FundDetailPageProps): Promise<Metadata> {
  const { schemeId } = await params;
  const scheme = await getSchemeByIdFromDatabase(schemeId);

  if (!scheme) {
    return {
      title: 'Fund Not Found | Thunder',
    };
  }

  return {
    title: `${scheme.name} | Thunder`,
    description: scheme.shortDescription,
  };
}

export default async function FundDetailPage({ params }: FundDetailPageProps) {
  const { schemeId } = await params;
  const scheme = await getSchemeByIdFromDatabase(schemeId);
  const fundContent = getFundContentBySchemeId(schemeId);

  if (!scheme) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-border pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/#schemes"
              className="font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary transition hover:text-accent"
            >
              Back to Schemes
            </Link>
            <span
              className={`inline-flex rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${statusStyle(
                scheme.status,
              )}`}
            >
              {scheme.status.replace('-', ' ')}
            </span>
          </div>
          <Link
            href={`/chat?scheme=${scheme.id}`}
            className="inline-flex h-9 items-center rounded-lg bg-accent px-4 font-mono text-xs uppercase tracking-[0.12em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Use this in chat
          </Link>
        </div>

        <div className="mt-5">
          <h1 className="flex flex-wrap items-center gap-2 text-3xl font-semibold tracking-[-0.03em] text-text-primary sm:text-5xl">
            <span className="inline-flex h-[1em] w-[1em] shrink-0 items-center justify-center overflow-hidden align-middle text-accent">
              {fundContent ? (
                <span className="font-mono text-[0.22em] uppercase tracking-[0.08em] leading-none text-text-secondary">
                  {bodyAcronym(fundContent.administeringBody)}
                </span>
              ) : (
                <span className="font-mono text-[0.22em] uppercase tracking-[0.08em] leading-none text-text-secondary">
                  SG
                </span>
              )}
            </span>
            <span>{scheme.name}</span>
          </h1>
        </div>

        <p className="mt-3 max-w-3xl text-xl leading-8 text-text-secondary">
          {scheme.shortDescription}
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-lg border border-border bg-surface p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-tertiary">
            Usage
          </p>

          <div className="mt-5 rounded-lg border border-border bg-background-elevated p-4">
            <div className="rounded-lg border border-border bg-surface px-4 py-4 font-mono text-lg text-text-primary">
              npx thunder open {scheme.id}
            </div>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              View this funding scheme, save it, and return to it instantly from your bookmark list.
            </p>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background-elevated p-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
                Maximum Funding
              </dt>
              <dd className="mt-2 font-mono text-lg text-text-primary">
                {formatFundingCap(scheme.fundingCap)}
              </dd>
            </div>

            <div className="rounded-lg border border-border bg-background-elevated p-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
                Project Duration
              </dt>
              <dd className="mt-2 font-mono text-lg text-text-primary">
              {scheme.durationMonths === null
                ? 'Depends on scheme'
                : `${scheme.durationMonths} months`}
              </dd>
            </div>
          </dl>

          <section className="mt-6 rounded-lg border border-border bg-background-elevated p-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
              Fund Content
            </h2>

            {fundContent ? (
              <div className="mt-3 space-y-4">
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                    Objective
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {fundContent.objective}
                  </p>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                    Target Recipients
                  </h3>
                  <ul className="mt-1 space-y-1 text-sm leading-6 text-text-secondary">
                    {fundContent.targetRecipients.map((recipient) => (
                      <li key={recipient}>- {recipient}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                    Administering Body
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {fundContent.administeringBody}
                  </p>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                    Contact
                  </h3>
                  <ul className="mt-1 space-y-1 text-sm leading-6 text-text-secondary">
                    {fundContent.contact.tel ? <li>Tel: {fundContent.contact.tel}</li> : null}
                    {fundContent.contact.email ? <li>Email: {fundContent.contact.email}</li> : null}
                    {fundContent.contact.website ? (
                      <li>
                        Website:{' '}
                        <a
                          href={fundContent.contact.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent"
                        >
                          {fundContent.contact.website}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </div>

                {fundContent.notes && fundContent.notes.length > 0 ? (
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                      Notes
                    </h3>
                    <ul className="mt-1 space-y-1 text-sm leading-6 text-text-secondary">
                      {fundContent.notes.map((note) => (
                        <li key={note}>- {note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Detailed fund content for this scheme is being expanded. Official references are listed on the right.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="grid gap-3">
            <FundDetailActions schemeId={scheme.id} />
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
                {scheme.category}
              </p>
              <span className="inline-flex rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                Sample Data
              </span>
            </div>

            <h2 className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
              Official References
            </h2>
            {scheme.links.length === 0 ? (
              <p className="mt-3 text-sm text-text-secondary">
                Official links will be added as this scheme record is expanded.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {scheme.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}