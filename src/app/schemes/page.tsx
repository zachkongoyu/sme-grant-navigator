'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import SchemesList from './SchemesList';

// We'll pass schemes from a server component wrapper or fetch client-side
// For now, keep static data here to avoid async boundary issues
const staticSchemes = [
  {
    id: 'aef',
    name: '阿里巴巴創業者基金',
    status: 'open' as const,
    maxFunding: 1_000_000_000,
    currency: 'HKD',
    links: [
      { label: 'Alibaba Entrepreneurs Fund', url: 'https://www.alibabafund.com' },
      { label: 'JUMPSTARTER 競賽', url: 'https://www.jumpstarter.hk' },
    ],
    corpus: null,
    sourceUrl: 'https://www.alibabafund.com',
    administrator: '阿里巴巴集團',
    updatedAt: null,
    jurisdiction: '香港 / 台灣',
    nextDeadline: null,
    version: 1,
    stage: '成長期',
    type: '初創',
    industry: '任何類型',
    difficulty: 4,
  },
];

export default function SchemesPage() {
  const t = useTranslations();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* Header */}
        <div className="border-b border-border pb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t('schemes.title')}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {t('schemes.subtitle')}
          </p>
        </div>

        <SchemesList schemes={staticSchemes} />
      </div>
    </div>
  );
}
