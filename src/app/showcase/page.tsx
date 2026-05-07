import type { Metadata } from 'next';
import type React from 'react';
import Link from 'next/link';
import { GeistPixelLine } from 'geist/font/pixel';

import { createClient } from '@/lib/supabase/server';
import { ProjectCard } from '@/components/ProjectCard';
import { BackNavigation } from '@/components/navigation';
import type { Project } from '@/types';
import { PROJECT_SEEKING, PROJECT_STAGES, PROJECT_PLATFORMS, PROJECT_SECTORS } from '@/types';

export const metadata: Metadata = {
  title: 'Showcase | Thunder',
  description: 'Discover projects built by founders and makers in the startup community.',
  openGraph: {
    title: 'Showcase | Thunder',
    description: 'Discover projects built by founders and makers in the startup community.',
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function asString(v: string | string[] | undefined): string {
  if (!v) return '';
  return Array.isArray(v) ? (v[0] ?? '') : v;
}

export default async function ShowcasePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const tab = asString(sp.tab) || 'seeking'; // 'seeking' | 'launched' | 'all'
  const filterSeeking  = asArray(sp.seeking);
  const filterStage    = asArray(sp.stage);
  const filterSector   = asArray(sp.sector);
  const filterPlatform = asArray(sp.platform);
  const isExpanded     = asString(sp.expand) === 'filters';

  const supabase = await createClient();

  // Fetch published projects
  let query = supabase
    .from('projects')
    .select('id, slug, created_by, makers, name, tagline, thumbnail_url, stage, status, platform, sector, seeking, traction, contact_url, created_at, updated_at, description, web_url, app_store_url, play_store_url, media_url')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (tab === 'launched') query = query.eq('stage', 'launched');
  if (filterStage.length > 0) query = query.in('stage', filterStage);
  if (filterSector.length > 0) query = query.overlaps('sector', filterSector);
  if (filterPlatform.length > 0) query = query.overlaps('platform', filterPlatform);
  // seeking tab: any project that has at least one seeking entry
  if (tab === 'seeking' && filterSeeking.length === 0) {
    query = query.overlaps('seeking', [...PROJECT_SEEKING]);
  }
  if (filterSeeking.length > 0) query = query.overlaps('seeking', filterSeeking);

  const { data: projects } = await query;

  // Collect all maker IDs → fetch display names
  const allMakerIds = [...new Set((projects ?? []).flatMap((p: Project) => p.makers))];
  let makerNames: Record<string, string> = {};
  if (allMakerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', allMakerIds);
    if (profiles) {
      makerNames = Object.fromEntries(
        profiles
          .filter((p: { id: string; display_name: string | null }) => p.display_name)
          .map((p: { id: string; display_name: string | null }) => [p.id, p.display_name!])
      );
    }
  }

  // Auth state for CTA
  const { data: { user } } = await supabase.auth.getUser();

  const projectCount = (projects ?? []).length;
  const featured = (projects as Project[])[0] ?? null;
  const rest = (projects as Project[]).slice(1);

  // URL helpers for filter chips
  function toggleChip(key: string, value: string): string {
    const p = new URLSearchParams();
    p.set('tab', 'all');
    filterStage.forEach((v) => p.append('stage', v));
    filterSector.forEach((v) => p.append('sector', v));
    filterPlatform.forEach((v) => p.append('platform', v));
    filterSeeking.forEach((v) => p.append('seeking', v));
    p.set('expand', 'filters');
    const vals = p.getAll(key);
    if (vals.includes(value)) {
      p.delete(key);
      vals.filter((v) => v !== value).forEach((v) => p.append(key, v));
    } else {
      p.append(key, value);
    }
    return `/showcase?${p.toString()}`;
  }

  function expandToggleHref(): string {
    const p = new URLSearchParams();
    p.set('tab', 'all');
    filterStage.forEach((v) => p.append('stage', v));
    filterSector.forEach((v) => p.append('sector', v));
    filterPlatform.forEach((v) => p.append('platform', v));
    filterSeeking.forEach((v) => p.append('seeking', v));
    if (!isExpanded) p.set('expand', 'filters');
    return `/showcase?${p.toString()}`;
  }

  const hasActiveFilters = filterStage.length > 0 || filterSector.length > 0 || filterPlatform.length > 0 || filterSeeking.length > 0;
  const activeFilterCount = filterStage.length + filterSector.length + filterPlatform.length + filterSeeking.length;

  return (
    <main
      className="relative min-h-screen bg-background px-4 py-16 text-text-primary sm:px-6"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      <div className="absolute top-6 left-6 z-10">
        <BackNavigation fallbackHref="/" />
      </div>

      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className={`text-5xl font-bold uppercase leading-none tracking-tight sm:text-6xl ${GeistPixelLine.className}`}>
                Showcase
              </h1>
              <p className="mt-1 text-base text-white/50">Idea, side project, or shipped — all welcome.</p>
            </div>
            <Link
              href={user ? '/showcase/new' : '/auth/signin?next=/showcase/new'}
              className="mt-1 shrink-0 border border-accent/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-accent/70 transition hover:border-accent hover:bg-accent/5 hover:text-accent"
            >
              + share what you&apos;re building
            </Link>
          </div>
        </div>

        {/* ── Tabs + filter toggle ── */}
        <div className="flex items-end gap-3 border-b border-white/10">
          <div className="flex gap-0">
            <TabLink href="/showcase" active={tab === 'seeking'}>Needs help</TabLink>
            <TabLink href="/showcase?tab=launched" active={tab === 'launched'}>New today</TabLink>
            <TabLink href="/showcase?tab=all" active={tab === 'all'}>All</TabLink>
          </div>
          {tab === 'all' && (
            <Link
              href={expandToggleHref()}
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
            </Link>
          )}
        </div>

        {/* ── Expanded filter panel (All tab only) ── */}
        {tab === 'all' && isExpanded && (
          <div className="space-y-4 border border-white/8 p-4">
            <div className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">Stage</p>
              <div className="flex flex-wrap gap-2">
                {PROJECT_STAGES.map((s) => {
                  const active = filterStage.includes(s);
                  return (
                    <Link key={s} href={toggleChip('stage', s)}
                      className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                        active ? 'border-accent/60 bg-accent/10 text-accent' : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'
                      }`}>
                      {s}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">Sector</p>
              <div className="flex flex-wrap gap-2">
                {PROJECT_SECTORS.map((s) => {
                  const active = filterSector.includes(s);
                  return (
                    <Link key={s} href={toggleChip('sector', s)}
                      className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                        active ? 'border-accent/60 bg-accent/10 text-accent' : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'
                      }`}>
                      {s}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">Platform</p>
              <div className="flex flex-wrap gap-2">
                {PROJECT_PLATFORMS.map((s) => {
                  const active = filterPlatform.includes(s);
                  return (
                    <Link key={s} href={toggleChip('platform', s)}
                      className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                        active ? 'border-accent/60 bg-accent/10 text-accent' : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'
                      }`}>
                      {s}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">Seeking</p>
              <div className="flex flex-wrap gap-2">
                {PROJECT_SEEKING.map((s) => {
                  const active = filterSeeking.includes(s);
                  return (
                    <Link key={s} href={toggleChip('seeking', s)}
                      className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                        active ? 'border-accent/60 bg-accent/10 text-accent' : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'
                      }`}>
                      {s}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Seeking sub-chips ── */}
        {tab === 'seeking' && (
          <div className="flex flex-wrap gap-2">
            {PROJECT_SEEKING.map((s) => {
              const active = filterSeeking.includes(s);
              const next = active
                ? filterSeeking.filter((v) => v !== s)
                : [...filterSeeking, s];
              const params = new URLSearchParams();
              next.forEach((v) => params.append('seeking', v));
              const qs = params.toString();
              return (
                <Link
                  key={s}
                  href={qs ? `/showcase?${qs}` : '/showcase'}
                  className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                    active
                      ? 'border-accent/60 bg-accent/10 text-accent'
                      : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'
                  }`}
                >
                  {s}
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Content ── */}
        {projectCount === 0 ? (
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
              href={user ? '/showcase/new' : '/auth/signin?next=/showcase/new'}
              className="mt-2 border border-accent/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-accent/70 transition hover:border-accent hover:bg-accent/5 hover:text-accent"
            >
              + deploy yours
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured — most recent */}
            {featured && (
              <ProjectCard project={featured} makerNames={makerNames} featured />
            )}

            {/* List */}
            {rest.length > 0 && (
              <>
                <div className="divide-y divide-white/6 rounded border border-white/10">
                {rest.map((project) => (
                  <ProjectCard key={project.id} project={project} makerNames={makerNames} />
                ))}
              </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ── Tab link ─────────────────────────────────────────────────────────────────

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] transition ${
        active ? 'border-accent text-accent' : 'border-transparent text-white/35 hover:text-white/60'
      }`}
    >
      {children}
    </Link>
  );
}
