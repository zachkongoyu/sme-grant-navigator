'use client';

import React from 'react';
import type { SchemeMetadata } from '@/lib/supabase/scheme-details';

interface MetadataTabsProps {
  metadata: ReadonlyArray<SchemeMetadata>;
}

// Map field_key to display label
const fieldLabels: Record<string, string> = {
  investment_stage: '投資階段',
  fund_type: '基金類型',
  difficulty: '申請難度',
};

// Map enum value to display value
const valueLabels: Record<string, string> = {
  development: '開發階段',
  growth: '成長期',
  mature: '成熟期',
  government: '政府',
  corporate: '企業',
  university: '大學',
};

export default function MetadataTabs({ metadata }: MetadataTabsProps) {
  const cards = metadata
    .filter((m) => m.field_key !== 'difficulty') // difficulty shown in hero, not cards
    .map((m) => ({
      label: fieldLabels[m.field_key] ?? m.field_key,
      value: valueLabels[m.value] ?? m.value,
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
