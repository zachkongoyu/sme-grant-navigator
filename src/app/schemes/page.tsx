'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

type SortKey = 'default' | 'deadline-asc' | 'deadline-desc' | 'amount-asc' | 'amount-desc';

interface Fund {
  id: string;
  name: string;
  org: string;
  location: string;
  stage: string;
  type: string;
  industry: string;
  deadline: string;
  deadlineSort: number;
  amount: string;
  amountSort: number;
}

const funds: Fund[] = [
  {
    id: 'aef',
    name: '阿里巴巴創業者基金',
    org: '阿里巴巴集團',
    location: '香港 / 台灣',
    stage: '成長期',
    type: '初創',
    industry: '任何類型',
    deadline: '全年開放',
    deadlineSort: Infinity,
    amount: 'HK$1B',
    amountSort: 1_000_000_000,
  },
  {
    id: 'tsssu',
    name: '大學科技初創企業資助計劃',
    org: '創新科技署',
    location: '香港',
    stage: '早期',
    type: '初創',
    industry: '科技',
    deadline: '2025-12-31',
    deadlineSort: new Date('2025-12-31').getTime(),
    amount: 'HK$100K',
    amountSort: 100_000,
  },
  {
    id: 'itf',
    name: '創新及科技基金',
    org: '創新科技署',
    location: '香港',
    stage: '成熟期',
    type: '想法',
    industry: '科技',
    deadline: '2025-06-30',
    deadlineSort: new Date('2025-06-30').getTime(),
    amount: 'HK$50K',
    amountSort: 50_000,
  },
  {
    id: 'bud',
    name: 'BUD 專項基金',
    org: '工業貿易署',
    location: '香港',
    stage: '成熟期',
    type: '中小企',
    industry: '任何類型',
    deadline: '全年開放',
    deadlineSort: Infinity,
    amount: 'HK$600K',
    amountSort: 600_000,
  },
];

const filterOptions = {
  stage: ['全部', '早期', '成長期', '成熟期'],
  type: ['全部', '想法', '初創', '中小企'],
};

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'default', label: '預設排序' },
  { key: 'deadline-asc', label: '申請限期：由近至遠' },
  { key: 'deadline-desc', label: '申請限期：由遠至近' },
  { key: 'amount-asc', label: '資助金額：由低至高' },
  { key: 'amount-desc', label: '資助金額：由高至低' },
];

export default function SchemesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('default');

  const processedFunds = useMemo(() => {
    let result = [...funds];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.org.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q) ||
          f.stage.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q) ||
          f.industry.toLowerCase().includes(q) ||
          f.deadline.toLowerCase().includes(q) ||
          f.amount.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'deadline-asc':
        result.sort((a, b) => {
          if (a.deadlineSort === Infinity) return 1;
          if (b.deadlineSort === Infinity) return -1;
          return a.deadlineSort - b.deadlineSort;
        });
        break;
      case 'deadline-desc':
        result.sort((a, b) => {
          if (a.deadlineSort === Infinity) return 1;
          if (b.deadlineSort === Infinity) return -1;
          return b.deadlineSort - a.deadlineSort;
        });
        break;
      case 'amount-asc':
        result.sort((a, b) => a.amountSort - b.amountSort);
        break;
      case 'amount-desc':
        result.sort((a, b) => b.amountSort - a.amountSort);
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, sortBy]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* ── Header ── */}
        <div className="border-b border-border pb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            資助基金一覽
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            瀏覽適合初創企業及中小企的資助基金、投資計劃及創業支援方案
          </p>
        </div>

        {/* ── Search ── */}
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
              placeholder="搜尋基金名稱、機構、階段、類型、申請限期或資助金額…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary transition focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* ── Filters + Sort ── */}
        <div className="py-6 border-b border-border">
          <div className="flex flex-wrap items-start gap-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">投資階段</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {filterOptions.stage.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      opt === '全部'
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
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">計劃類型</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {filterOptions.type.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      opt === '全部'
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
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">排序</span>
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

        {/* ── Fund List ── */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {processedFunds.map((fund) => (
            <Link
              key={fund.id}
              href={`/schemes/${fund.id}`}
              className="group rounded-xl border border-border bg-surface p-5 transition hover:border-accent"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
                    {fund.org}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-text-primary group-hover:text-accent transition">
                    {fund.name}
                  </h3>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5 text-text-tertiary transition group-hover:text-accent"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>

              {/* Meta tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md border border-border px-2 py-1 text-[10px] text-text-secondary">
                  {fund.stage}
                </span>
                <span className="inline-flex items-center rounded-md border border-border px-2 py-1 text-[10px] text-text-secondary">
                  {fund.type}
                </span>
                <span className="inline-flex items-center rounded-md border border-border px-2 py-1 text-[10px] text-text-secondary">
                  {fund.industry}
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
                    申請限期：
                    <span className={fund.deadline === '全年開放' ? 'font-medium text-green-600' : 'font-medium text-text-primary'}>
                      {fund.deadline}
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
                    資助金額：
                    <span className="font-medium text-text-primary">{fund.amount}</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {processedFunds.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-text-tertiary">
              沒有符合搜尋條件的基金
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
