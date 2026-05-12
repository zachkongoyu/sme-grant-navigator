'use client';

import React from 'react';

const data = [
  { label: '基金位置', value: '香港' },
  { label: '行業重點', value: '任何類型' },
];

export default function MetadataTabs() {
  return (
    <div className="mt-10 grid grid-cols-2 gap-4">
      {data.map((tag, i) => (
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
