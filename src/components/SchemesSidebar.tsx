'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';

import { BackNavigation } from '@/components/navigation/BackNavigation/index';
import { filterSchemes, groupSchemesByCategory } from '@/lib/schemes/filter';
import {
  getSchemeStatusBadgeStyle,
  getSchemeStatusDotColor,
  getSchemeStatusText,
} from '@/lib/schemes/presentation';
import type { Scheme } from '@/types';

interface SchemesSidebarProps {
  readonly schemes: ReadonlyArray<Scheme>;
  readonly activeId: string;
  readonly children: React.ReactNode;
}

function SidebarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="14" height="14" rx="2" />
      <line x1="5" y1="1" x2="5" y2="15" />
    </svg>
  );
}

export function SchemesSidebar({ schemes, activeId, children }: SchemesSidebarProps) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState('');
  const deferred = useDeferredValue(search);

  const filtered = useMemo(() => filterSchemes(schemes, deferred), [schemes, deferred]);
  const grouped = useMemo(() => groupSchemesByCategory(filtered), [filtered]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`shrink-0 border-r border-border bg-background-elevated transition-all duration-200 ${
          open ? 'w-64' : 'w-0 overflow-hidden'
        } hidden lg:flex lg:flex-col`}
      >
        {/* Top: back nav */}
        <div className="flex items-center justify-between px-4 py-4">
          <BackNavigation fallbackHref="/funds" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            aria-label="Collapse sidebar"
          >
            <SidebarIcon />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-accent transition-colors">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3 shrink-0 text-text-tertiary" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" />
              <path d="m13 13-2.5-2.5" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes…"
              className="w-full bg-transparent text-xs text-text-primary outline-none placeholder:text-text-tertiary"
            />
          </label>
        </div>

        {/* Scheme list grouped by category */}
        <nav className="flex-1 overflow-y-auto pb-4">
          {grouped.map(([category, items]) => (
            <div key={category} className="mb-1">
              <p className="px-4 pb-1 pt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
                {category}
              </p>
              {items.map((scheme) => {
                const isActive = scheme.id === activeId;
                return (
                  <Link
                    key={scheme.id}
                    href={`/funds/${scheme.id}`}
                    className="group flex items-start gap-2.5 rounded-lg mx-2 px-2.5 py-2 transition"
                    style={isActive ? { backgroundColor: 'var(--surface)' } : undefined}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: getSchemeStatusDotColor(scheme.status) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate text-xs leading-5"
                        style={{
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {scheme.name}
                      </p>
                      {!isActive && (
                        <p
                          className="text-[10px] leading-4"
                          style={{ color: getSchemeStatusBadgeStyle(scheme.status).color }}
                        >
                          {getSchemeStatusText(scheme.status)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-text-tertiary">No schemes match.</p>
          )}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Re-open toggle */}
        {!open && (
          <div className="absolute left-3 top-3 z-10 hidden lg:flex">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-label="Expand sidebar"
            >
              <SidebarIcon />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
