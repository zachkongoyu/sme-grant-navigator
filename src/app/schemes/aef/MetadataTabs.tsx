'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { SchemeMetadata } from '@/lib/supabase/scheme-details';

interface MetadataTabsProps {
  metadata: ReadonlyArray<SchemeMetadata>;
}

export default function MetadataTabs({ metadata }: MetadataTabsProps) {
  const t = useTranslations();

  const cards = metadata
    .filter((m) => m.field_key !== 'difficulty') // difficulty shown in hero, not cards
    .map((m) => ({
      label: t(`filters.${m.field_key === 'investment_stage' ? 'stage' : m.field_key === 'fund_type' ? 'type' : m.field_key}` as any),
      value: t(`${m.field_key === 'investment_stage' ? 'filters' : 'fundType'}.${m.value}` as any),
    }));

  if (cards.length === 0) return null;

  return (
    <div className="mt-10 grid grid-cols-2 gap-4">
      {cards.map((tag, i) => (
        <div
          key={tag.label}
          className="relative flex flex-col justify-center rounded-xl border border-border bg-surface px-6 py-7 overflow-hidden transition hover:border-accent/30"
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{
              backgroundColor: 'var(--accent)',
              opacity: 0.6 + i * 0.1,
            }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
            {tag.label}
          </span>
          <span className="mt-2 text-xl font-semibold text-text-primary">
            {tag.value}
          </span>
        </div>
      ))}
    </div>
  );
}
