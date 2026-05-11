import React from 'react';
import type { Metadata } from 'next';
import { listSchemes } from '@/lib/schemes';
import type { Scheme } from '@/types';
import SchemesList from './SchemesList';

// Extra fields we attach for the fund-style display
interface EnrichedScheme extends Scheme {
  stage?: string;
  type?: string;
  industry?: string;
  difficulty?: number;
}

// Hard-coded enrichment for known schemes
const schemeEnrichment: Record<string, Partial<EnrichedScheme>> = {
  'hk.bud-easy': {
    stage: '成熟期',
    type: '中小企',
    industry: '任何類型',
    difficulty: 3,
  },
  'hk.itf-ess': {
    stage: '成熟期',
    type: '想法',
    industry: '科技',
    difficulty: 4,
  },
};

// AEF is a private fund, not a government scheme — add it as a hybrid entry
const aefScheme: EnrichedScheme = {
  id: 'aef',
  name: '阿里巴巴創業者基金',
  status: 'open',
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
  nextDeadline: null, // 全年開放
  version: 1,
  stage: '成長期',
  type: '初創',
  industry: '任何類型',
  difficulty: 4,
};

export const metadata: Metadata = {
  title: '資助計劃一覽 | Thunder',
  description: '瀏覽適合初創企業及中小企的資助計劃、投資方案及創業支援。',
};

export default async function SchemesPage() {
  const dbSchemes = await listSchemes();

  // Enrich DB schemes with custom fields
  const enrichedDbSchemes: EnrichedScheme[] = dbSchemes.map((s) => ({
    ...s,
    ...schemeEnrichment[s.id],
  }));

  // Combine DB schemes + AEF
  const allSchemes: EnrichedScheme[] = [...enrichedDbSchemes, aefScheme];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* ── Header ── */}
        <div className="border-b border-border pb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            資助計劃一覽
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            瀏覽適合初創企業及中小企的資助計劃、投資方案及創業支援
          </p>
        </div>

        <SchemesList schemes={allSchemes} />
      </div>
    </div>
  );
}
