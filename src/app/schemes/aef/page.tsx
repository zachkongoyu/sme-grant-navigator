import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getScheme } from '@/lib/schemes';
import { fetchSchemeDetail } from '@/lib/supabase/scheme-details';
import FundDetailClient from './FundDetailClient';

export const metadata: Metadata = {
  title: '阿里巴巴創業者基金 | Thunder',
  description: '阿里巴巴創業者基金（AEF）是阿里巴巴集團於 2015 年創立的非營利項目，旨在向創業家和年輕人提供企業資本及策略指導。',
};

export default async function FundDetailPage() {
  const schemeId = 'hk.aef';
  const locale = 'zh'; // Default to zh for now; client-side i18n can override UI labels

  const [scheme, detail] = await Promise.all([
    getScheme(schemeId),
    fetchSchemeDetail(schemeId, locale),
  ]);

  if (!scheme) notFound();

  return (
    <FundDetailClient
      scheme={scheme}
      sections={detail.sections}
      metadata={detail.metadata}
      fieldTranslations={detail.fieldTranslations}
    />
  );
}
