import { notFound, redirect } from 'next/navigation';

import { getScheme } from '@/lib/schemes';

interface DraftSchemePageProps {
  readonly params: Promise<{ schemeId: string }>;
}

export default async function DraftSchemePage({ params }: DraftSchemePageProps) {
  const { schemeId } = await params;
  const scheme = await getScheme(schemeId);

  if (!scheme) notFound();

  redirect(`/draft?scheme=${scheme.id}`);
}
