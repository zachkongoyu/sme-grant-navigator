import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getScheme } from '@/lib/schemes';
import { fetchSchemeDetail } from '@/lib/supabase/scheme-details';
import type { SchemeSection, SchemeFieldTranslation } from '@/lib/supabase/scheme-details';
import FundDetailClient from './FundDetailClient';

interface SchemeDetailPageProps {
  readonly params: Promise<{
    readonly schemeId: string;
  }>;
}

export async function generateMetadata({ params }: SchemeDetailPageProps): Promise<Metadata> {
  const { schemeId } = await params;
  const scheme = await getScheme(schemeId);
  if (!scheme) return { title: 'Scheme Not Found | Thunder' };
  return {
    title: `${scheme.name} | Thunder`,
    description: scheme.name,
  };
}

export default async function SchemeDetailPage({ params }: SchemeDetailPageProps) {
  const { schemeId } = await params;

  const [scheme, detailZh, detailEn] = await Promise.all([
    getScheme(schemeId),
    fetchSchemeDetail(schemeId, 'zh'),
    fetchSchemeDetail(schemeId, 'en'),
  ]);

  if (!scheme) {
    notFound();
  }

  const sectionsByLocale: Record<string, ReadonlyArray<SchemeSection>> = {
    zh: detailZh.sections,
    en: detailEn.sections,
  };

  const fieldTranslationsByLocale: Record<string, ReadonlyArray<SchemeFieldTranslation>> = {
    zh: detailZh.fieldTranslations,
    en: detailEn.fieldTranslations,
  };

  return (
    <FundDetailClient
      scheme={scheme}
      sectionsByLocale={sectionsByLocale}
      metadata={detailZh.metadata}
      fieldTranslationsByLocale={fieldTranslationsByLocale}
    />
  );
}
