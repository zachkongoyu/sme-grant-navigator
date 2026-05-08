'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

import { ProjectCard } from '@/components/ProjectCard';
import type { Project } from '@/types';
import { PROJECT_SEEKING, PROJECT_STAGES, PROJECT_PLATFORMS, PROJECT_SECTORS } from '@/types';

type Tab = 'seeking' | 'launched' | 'all';

interface Props {
  allProjects: Project[];
  makerNames: Record<string, string>;
  isAuthenticated: boolean;
}

export function ShowcaseClient({ allProjects, makerNames, isAuthenticated }: Props) {
  const [tab, setTab] = useState<Tab>('seeking');
  const [filterStage, setFilterStage] = useState<string[]>([]);
  const [filterSector, setFilterSector] = useState<string[]>([]);
  const [filterPlatform, setFilterPlatform] = useState<string[]>([]);
  const [filterSeeking, setFilterSeeking] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const projects = useMemo(() => {
    let result = allProjects;

    if (tab === 'launched') {
      result = result.filter((p) => p.stage === 'launched');
    } else if (tab === 'seeking') {
      if (filterSeeking.length > 0) {
        result = result.filter((p) => filterSeeking.some((s) => p.seeking?.includes(s)));
      } else {
        result = result.filter((p) => p.seeking && p.seeking.length > 0);
      }
    }

    if (tab === 'all') {
      if (filterStage.length > 0) result = result.filter((p) => filterStage.includes(p.stage));
      if (filterSector.length > 0) result = result.filter((p) => filterSector.some((s) => p.sector?.includes(s)));
      if (filterPlatform.length > 0) result = result.filter((p) => filterPlatform.some((s) => p.platform?.includes(s)));
      if (filterSeeking.length > 0) result = result.filter((p) => filterSeeking.some((s) => p.seeking?.includes(s)));
    }

    return result;
  }, [allProjects, tab, filterStage, filterSector, filterPlatform, filterSeeking]);

  function toggleFilter(
    key: 'stage' | 'sector' | 'platform' | 'seeking',
    value: string,
  ) {
    const setters = {
      stage: setFilterStage,
      sector: setFilterSector,
      platform: setFilterPlatform,
      seeking: setFilterSeeking,
    };
    setters[key]((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function switchTab(t: Tab) {
    setTab(t);
    setFilterStage([]);
    setFilterSector([]);
    setFilterPlatform([]);
    setFilterSeeking([]);
    setIsExpanded(false);
  }

  const hasActiveFilters =
    filterStage.length > 0 ||
    filterSector.length > 0 ||
    filterPlatform.length > 0 ||
    filterSeeking.length > 0;
  const activeFilterCount =
    filterStage.length + filterSector.length + filterPlatform.length + filterSeeking.length;

  const featured = projects[0] ?? null;
  const rest = projects.slice(1);

  return (
    <div className="space-y-8">
      {/* ── Tabs + filter toggle ── */}
      <div className="flex items-end gap-3 border-b border-white/10">
        <div className="flex gap-0">
          {(['seeking', 'launched', 'all'] as Tab[]).map((t) => {
            const labels: Record<Tab, string> = { seeking: 'Needs help', launched: 'New today', all: 'All' };
            return (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`-mb-px border-b-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] transition ${
                  tab === t
                    ? 'border-accent text-accent'
                    : 'border-transparent text-white/35 hover:text-white/60'
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>
        {tab === 'all' && (
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className={`mb-1 flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
              isExpanded || hasActiveFilters
                ? 'border-accent/50 bg-accent/8 text-accent'
                : 'border-white/15 text-white/45 hover:border-white/30 hover:text-white/70'
            }`}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3" aria-hidden="true">
              <path d="M2 4h12M4 8h8M6 12h4" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ── Expanded filter panel (All tab only) ── */}
      {tab === 'all' && isExpanded && (
        <div className="space-y-4 border border-white/8 p-4">
          {[
            { label: 'Stage', key: 'stage' as const, options: PROJECT_STAGES, active: filterStage },
            { label: 'Sector', key: 'sector' as const, options: PROJECT_SECTORS, active: filterSector },
            { label: 'Platform', key: 'platform' as const, options: PROJECT_PLATFORMS, active: filterPlatform },
            { label: 'Seeking', key: 'seeking' as const, options: PROJECT_SEEKING, active: filterSeeking },
          ].map(({ label, key, options, active }) => (
            <div key={key} className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">{label}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleFilter(key, s)}
                    className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                      active.includes(s)
                        ? 'border-accent/60 bg-accent/10 text-accent'
                        : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Seeking sub-chips ── */}
      {tab === 'seeking' && (
        <div className="flex flex-wrap gap-2">
          {PROJECT_SEEKING.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleFilter('seeking', s)}
              className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                filterSeeking.includes(s)
                  ? 'border-accent/60 bg-accent/10 text-accent'
                  : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
            {tab === 'all' ? '// no projects yet' : '// no results'}
          </p>
          <p className="text-base text-white/50">
            {tab === 'all'
              ? 'Nothing here yet. Be the first to share what you’re building.'
              : 'Nothing here yet. Try a different filter.'}
          </p>
          <Link
            href={isAuthenticated ? '/showcase/new' : '/auth/signin?next=/showcase/new'}
            className="mt-2 border border-accent/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-accent/70 transition hover:border-accent hover:bg-accent/5 hover:text-accent"
          >
            + deploy yours
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {featured && <ProjectCard project={featured} makerNames={makerNames} featured />}
          {rest.length > 0 && (
            <div className="divide-y divide-white/6 rounded border border-white/10">
              {rest.map((project) => (
                <ProjectCard key={project.id} project={project} makerNames={makerNames} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
