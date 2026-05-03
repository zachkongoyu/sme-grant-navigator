import type { Metadata } from 'next';

import { EligibilityChecker } from '@/components/EligibilityChecker';
import { SchemeCombobox } from '@/components/SchemeCombobox';
import { StatusChip } from '@/components/StatusChip';
import { listSchemes } from '@/lib/schemes';

export const metadata: Metadata = {
  title: 'Eligibility Check | Thunder',
  description: 'Find out if your company qualifies for a grant scheme before applying.',
};

interface EligibilityPageProps {
  readonly searchParams?: Promise<{ scheme?: string }>;
}

export default async function EligibilityPage({ searchParams }: EligibilityPageProps) {
  const schemes = await listSchemes();
  const params = searchParams ? await searchParams : undefined;
  const requestedSchemeId = params?.scheme;

  // Prefer open schemes for the default selection
  const liveSchemes = schemes.filter((s) => s.status === 'open');
  const selectedScheme =
    schemes.find((s) => s.id === requestedSchemeId) ??
    liveSchemes[0] ??
    schemes[0];

  if (!selectedScheme) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 text-text-primary sm:px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-tertiary">
              Eligibility Check
            </p>
            <StatusChip variant="beta" compact />
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">No schemes available</h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Thunder does not have any schemes loaded yet.
          </p>
        </div>
      </main>
    );
  }

  const combobox = (
    <SchemeCombobox
      schemes={schemes.map((s) => ({ id: s.id, name: s.name, category: s.category }))}
      selectedId={selectedScheme.id}
      basePath="/eligibility"
      label="Checking eligibility for"
    />
  );

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <EligibilityChecker
        scheme={selectedScheme}
        backHref="/funds"
        headerControls={combobox}
      />
    </main>
  );
}
