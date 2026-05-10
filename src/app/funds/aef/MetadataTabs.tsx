'use client';

import React, { useState } from 'react';

const tabs = [
  { id: 'grid', label: '網格卡片' },
  { id: 'row', label: '橫向排列' },
  { id: 'accent', label: '強調卡片' },
] as const;

const data = [
  { label: '劃類型', value: '初創' },
  { label: '基金位置', value: '香港' },
  { label: '行業重點', value: '任何類型' },
  { label: '適合階段', value: '已經有成品/專利' },
];

export default function MetadataTabs() {
  const [active, setActive] = useState<(typeof tabs)[number]['id']>('grid');

  return (
    <div className="mt-10">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2 text-xs font-medium tracking-wide transition rounded-t-lg ${
              active === tab.id
                ? 'text-text-primary border-b-2'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
            style={
              active === tab.id
                ? { borderBottomColor: 'var(--accent)' }
                : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Layer 1: Grid Cards */}
      {active === 'grid' && (
        <div className="grid grid-cols-2 gap-4">
          {data.map((tag) => (
            <div
              key={tag.label}
              className="flex flex-col justify-center rounded-xl border border-border bg-surface px-5 py-6 transition hover:border-accent/30"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
                {tag.label}
              </span>
              <span className="mt-2 text-lg font-semibold text-text-primary">
                {tag.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Layer 2: Horizontal Row */}
      {active === 'row' && (
        <div className="grid grid-cols-4 gap-3">
          {data.map((tag) => (
            <div
              key={tag.label}
              className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-3 py-5 text-center transition hover:border-accent/30"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
                {tag.label}
              </span>
              <span className="mt-1.5 text-sm font-semibold text-text-primary">
                {tag.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Layer 3: Accent Feature Cards */}
      {active === 'accent' && (
        <div className="grid grid-cols-2 gap-4">
          {data.map((tag, i) => (
            <div
              key={tag.label}
              className="relative flex flex-col justify-center rounded-xl border border-border bg-surface px-6 py-7 overflow-hidden transition hover:border-accent/30"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{
                  backgroundColor: [
                    'var(--accent)',
                    'var(--accent)',
                    'var(--accent)',
                    'var(--accent)',
                  ][i],
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
      )}
    </div>
  );
}
