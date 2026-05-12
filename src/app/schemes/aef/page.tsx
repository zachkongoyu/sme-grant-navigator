import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getScheme } from '@/lib/schemes';
import { fetchSchemeDetail } from '@/lib/supabase/scheme-details';
import type { SchemeSection, SchemeFieldTranslation } from '@/lib/supabase/scheme-details';
import FundDetailClient from './FundDetailClient';

export const metadata: Metadata = {
  title: '阿里巴巴創業者基金 | Thunder',
  description: '阿里巴巴創業者基金（AEF）是阿里巴巴集團於 2015 年創立的非營利項目，旨在向創業家和年輕人提供企業資本及策略指導。',
};

export default async function FundDetailPage() {
  const schemeId = 'hk.aef';

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
