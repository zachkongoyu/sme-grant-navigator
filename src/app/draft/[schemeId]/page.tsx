import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Drafter } from '@/components/Drafter';
import { getSchemeByIdFromDatabase, getAllSchemesFromDatabase } from '@/lib/schemes/db';

interface DraftSchemePageProps {
  readonly params: Promise<{ schemeId: string }>;
}

export async function generateStaticParams() {
  const schemes = await getAllSchemesFromDatabase();
  return schemes.filter((s) => s.draftable).map((s) => ({ schemeId: s.id }));
}

export async function generateMetadata({ params }: DraftSchemePageProps): Promise<Metadata> {
  const { schemeId } = await params;
  const scheme = await getSchemeByIdFromDatabase(schemeId);
  if (!scheme) return { title: 'Not Found | Thunder' };
  return {
    title: `${scheme.name} Draft Generator | Thunder`,
    description: `Generate a complete ${scheme.name} application draft in minutes.`,
  };
}

export default async function DraftSchemePage({ params }: DraftSchemePageProps) {
  const { schemeId } = await params;
  const scheme = await getSchemeByIdFromDatabase(schemeId);

  if (!scheme || !scheme.draftable) notFound();

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <Link
            href={`/funds/${schemeId}`}
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary transition hover:text-accent"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden="true">
              <path d="M10 13L5 8l5-5" />
            </svg>
            Scheme details
          </Link>
        </div>
      </div>
      <Drafter scheme={scheme} />
    </main>
  );
}
