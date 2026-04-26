import type { Metadata } from 'next';
import Link from 'next/link';

import { BackNavigation } from '@/components/navigation/BackNavigation/index';
import { Drafter } from '@/components/Drafter';
import { SchemeCombobox } from '@/components/SchemeCombobox';
import { getAllSchemes } from '@/lib/schemes/repository';

export const metadata: Metadata = {
  title: 'Drafter | Thunder',
  description: 'Pick a funding scheme and start drafting an AI-generated application.',
};

interface DraftPageProps {
  readonly searchParams?: Promise<{ scheme?: string }>;
}

export default async function DraftPage({ searchParams }: DraftPageProps) {
  const schemes = await getAllSchemes();
  const draftableSchemes = schemes.filter((scheme) => scheme.draftable);
  const params = searchParams ? await searchParams : undefined;
  const requestedSchemeId = params?.scheme;
  const selectedScheme =
    schemes.find((scheme) => scheme.id === requestedSchemeId)
    ?? draftableSchemes[0]
    ?? schemes[0];

  if (!selectedScheme) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 text-text-primary sm:px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-tertiary">AI Drafter</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">No draftable schemes yet</h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Thunder does not have a live drafter for any fund yet.
          </p>
        </div>
      </main>
    );
  }

  const combobox = (
    <SchemeCombobox
      schemes={schemes.map((s) => ({ id: s.id, name: s.name, category: s.category, draftable: s.draftable }))}
      selectedId={selectedScheme.id}
    />
  );

  return (
    <main className="min-h-screen bg-background text-text-primary">
      {selectedScheme.draftable ? (
        <Drafter scheme={selectedScheme} backHref="/funds" headerControls={combobox} />
      ) : (
        <div className="relative px-4 py-16 sm:px-6">
          <div className="absolute top-6 left-6">
            <BackNavigation fallbackHref="/funds" />
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex justify-center">
              {combobox}
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
                  Coming soon
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {selectedScheme.name}
              </h1>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                This scheme is in Thunder already, but the AI drafter for it is not live yet.
              </p>

              <div className="mt-6 flex justify-center">
                <Link
                  href={`/funds/${selectedScheme.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
                >
                  View scheme details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
