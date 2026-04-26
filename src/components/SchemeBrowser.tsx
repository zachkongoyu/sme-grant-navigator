'use client';

import { useDeferredValue, useMemo, useState } from 'react';

import type { Scheme, SchemeCategory } from '@/types';
import { filterSchemes } from '@/lib/schemes/filter';

import {
  SchemeCategorySidebar,
  type CategoryOption,
} from './SchemeCategorySidebar';
import { SchemeRow } from './SchemeRow';

interface SchemeBrowserProps {
  readonly schemes: ReadonlyArray<Scheme>;
}

type SchemeFilter = 'All' | SchemeCategory;

export function SchemeBrowser({ schemes }: SchemeBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<SchemeFilter>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const categories = useMemo<ReadonlyArray<CategoryOption>>(() => {
    const counts = schemes.reduce<Map<SchemeCategory, number>>((accumulator, scheme) => {
      const currentCount = accumulator.get(scheme.category) ?? 0;
      accumulator.set(scheme.category, currentCount + 1);
      return accumulator;
    }, new Map<SchemeCategory, number>());

    return [
      { label: 'All', count: schemes.length },
      ...Array.from(counts.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([label, count]) => ({ label, count })),
    ];
  }, [schemes]);

  const filteredSchemes = useMemo(() => {
    return filterSchemes(schemes, deferredSearchTerm, selectedCategory);
  }, [deferredSearchTerm, schemes, selectedCategory]);

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
      <SchemeCategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <section>
        <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-tertiary">
              Find Schemes
            </p>
          </div>

          <label className="flex w-full items-center gap-3 rounded-lg border border-border bg-background-elevated px-4 py-3 focus-within:border-accent transition-colors md:max-w-md">
            <span className="inline-flex items-center text-text-tertiary" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                className="h-4.5 w-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <span className="sr-only">
              Search
            </span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search all schemes"
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
            />
          </label>
        </div>

        <div className="mt-5 overflow-hidden border-y border-border bg-transparent">
          <div className="hidden border-b border-border px-3 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-tertiary md:grid md:grid-cols-[60px_minmax(0,1fr)_150px]">
            <div>#</div>
            <div>Funding Schemes</div>
            <div>Funding Cap</div>
          </div>

          {filteredSchemes.map((scheme, index) => (
            <SchemeRow key={scheme.id} index={index} scheme={scheme} />
          ))}

          {filteredSchemes.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-text-secondary">
              No schemes match that search yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}