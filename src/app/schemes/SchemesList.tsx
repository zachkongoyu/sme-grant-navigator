'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Scheme, SchemeStatus } from '@/types';
import { formatFundingAmount } from '@/lib/schemes/presentation';

type EnrichedScheme = Scheme & {
  stage?: string;
  type?: string;
  industry?: string;
  difficulty?: number;
};

type SortKey = 'default' | 'deadline-asc' | 'deadline-desc' | 'amount-asc' | 'amount-desc';

interface SchemesListProps {
  schemes: ReadonlyArray<EnrichedScheme>;
}

export default function SchemesList({ schemes }: SchemesListProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('default');

  const statusStyles: Record<SchemeStatus, string> = {
    open: 'border-green-500/30 bg-green-500/10 text-green-600',
    'coming-soon': 'border-amber-500/30 bg-amber-500/10 text-amber-600',
    closed: 'border-red-500/30 bg-red-500/10 text-red-600',
  };

  const filterOptions = {
    stage: [t('filters.all'), t('filters.early'), t('filters.growth'), t('filters.mature')],
    type: [t('filters.all'), t('filters.idea'), t('filters.startup'), t('filters.sme')],
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'default', label: t('filters.sortDefault') },
    { key: 'deadline-asc', label: t('filters.sortDeadlineAsc') },
    { key: 'deadline-desc', label: t('filters.sortDeadlineDesc') },
    { key: 'amount-asc', label: t('filters.sortAmountAsc') },
    { key: 'amount-desc', label: t('filters.sortAmountDesc') },
  ];

  function deadlineSortValue(s: EnrichedScheme): number {
    if (!s.nextDeadline) return Infinity;
    return new Date(s.nextDeadline).getTime();
  }

  function amountSortValue(s: EnrichedScheme): number {
    return s.maxFunding ?? 0;
  }

  const processedSchemes = useMemo(() => {
    let result = [...schemes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.administrator ?? '').toLowerCase().includes(q) ||
          s.jurisdiction.toLowerCase().includes(q) ||
          (s.stage ?? '').toLowerCase().includes(q) ||
          (s.type ?? '').toLowerCase().includes(q) ||
          (s.industry ?? '').toLowerCase().includes(q) ||
          (s.nextDeadline ?? '').toLowerCase().includes(q) ||
          (s.maxFunding?.toString() ?? '').includes(q)
      );
    }

    switch (sortBy) {
      case 'deadline-asc':
        result.sort((a, b) => {
          const av = deadlineSortValue(a);
          const bv = deadlineSortValue(b);
          if (av === Infinity) return 1;
          if (bv === Infinity) return -1;
          return av - bv;
        });
        break;
      case 'deadline-desc':
        result.sort((a, b) => {
          const av = deadlineSortValue(a);
          const bv = deadlineSortValue(b);
          if (av === Infinity) return 1;
          if (bv === Infinity) return -1;
          return bv - av;
        });
        break;
      case 'amount-asc':
        result.sort((a, b) => amountSortValue(a) - amountSortValue(b));
        break;
      case 'amount-desc':
        result.sort((a, b) => amountSortValue(b) - amountSortValue(a));
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, sortBy, schemes]);

  return (
    <>
      {/* Search */}
      <div className="pt-6">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t('schemes.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary transition focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Filters + Sort */}
      <div className="py-6 border-b border-border">
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{t('filters.stage')}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {filterOptions.stage.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                    opt === t('filters.all')
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border bg-surface text-text-secondary hover:border-accent'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{t('filters.type')}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {filterOptions.type.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                    opt === t('filters.all')
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border bg-surface text-text-secondary hover:border-accent'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{t('filters.sort')}</span>
            <div className="mt-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-primary focus:border-accent focus:outline-none"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Scheme List */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {processedSchemes.map((scheme) => {
          const deadlineLabel = scheme.nextDeadline
            ? new Date(scheme.nextDeadline).toLocaleDateString('zh-HK')
            : t('schemes.rolling');
          const isRolling = !scheme.nextDeadline;

          return (
            <Link
              key={scheme.id}
              href={`/schemes/${scheme.id}`}
              className="group relative rounded-xl border border-border bg-surface p-5 transition hover:border-accent"
            >
              {/* Status badge */}
              <span
                className={`absolute right-4 top-4 rounded-md border px-2 py-0.5 text-[10px] font-medium ${statusStyles[scheme.status]}`}
              >
                {t(`schemes.${scheme.status === 'open' ? 'open' : scheme.status === 'coming-soon' ? 'comingSoon' : 'closed'}`)}
              </span>

              <div className="flex items-start justify-between pr-16">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
                    {scheme.administrator ?? scheme.jurisdiction}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-text-primary group-hover:text-accent transition">
                    {scheme.name}
                  </h3>
                </div>
              </div>

              {/* Meta tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {scheme.stage && (
                  <span className="inline-flex items-center rounded-md border border-border px-2 py-1 text-[10px] text-text-secondary">
                    {scheme.stage}
                  </span>
                )}
                {scheme.type && (
                  <span className="inline-flex items-center rounded-md border border-border px-2 py-1 text-[10px] text-text-secondary">
                    {scheme.type}
                  </span>
                )}
                {scheme.industry && (
                  <span className="inline-flex items-center rounded-md border border-border px-2 py-1 text-[10px] text-text-secondary">
                    {scheme.industry}
                  </span>
                )}
                <span className="inline-flex items-center rounded-md border border-border px-2 py-1 text-[10px] text-text-secondary">
                  {scheme.jurisdiction}
                </span>
              </div>

              {/* Deadline & Amount */}
              <div className="mt-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3.5 w-3.5 text-text-tertiary"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="text-text-secondary">
                    {t('schemes.deadline')}：
                    <span className={isRolling ? 'font-medium text-green-600' : 'font-medium text-text-primary'}>
                      {deadlineLabel}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3.5 w-3.5 text-text-tertiary"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span className="text-text-secondary">
                    {t('schemes.amount')}：
                    <span className="font-medium text-text-primary">
                      {formatFundingAmount(scheme.maxFunding, scheme.currency)}
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        {processedSchemes.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-text-tertiary">
            {t('schemes.noResults')}
          </div>
        )}
      </div>
    </>
  );
}
