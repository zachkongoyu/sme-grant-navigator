import { notFound, redirect } from 'next/navigation';

import { getSchemeById } from '@/lib/schemes/db';

interface DraftSchemePageProps {
  readonly params: Promise<{ schemeId: string }>;
}

export default async function DraftSchemePage({ params }: DraftSchemePageProps) {
  const { schemeId } = await params;
  const scheme = await getSchemeById(schemeId);

  if (!scheme) notFound();

  redirect(`/draft?scheme=${scheme.id}`);
}
