import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

const PROJECT_SELECT =
  'id, slug, created_by, makers, name, tagline, description, web_url, app_store_url, play_store_url, media_url, thumbnail_url, stage, status, platform, sector, seeking, traction, contact_url, created_at, updated_at';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('projects')
    .select('name, tagline, status')
    .eq('slug', slug)
    .single();

  if (!data || data.status !== 'published') return { title: 'Project | Thunder' };

  return {
    title: `${data.name} | Thunder Showcase`,
    description: data.tagline ?? undefined,
    openGraph: {
      title: `${data.name} | Thunder Showcase`,
      description: data.tagline ?? undefined,
    },
  };
}

const STAGE_DOT: Record<string, { color: string; label: string }> = {
  idea:     { color: 'bg-white/25',    label: 'Idea'     },
  building: { color: 'bg-amber-400',   label: 'Building' },
  launched: { color: 'bg-emerald-400', label: 'Launched' },
};

const SECTOR_COLOR: Record<string, string> = {
  ai:         'bg-violet-600',
  fintech:    'bg-blue-600',
  healthtech: 'bg-emerald-600',
  proptech:   'bg-orange-500',
  edtech:     'bg-cyan-600',
  b2b:        'bg-slate-500',
  b2c:        'bg-pink-600',
  deeptech:   'bg-indigo-600',
};

function sectorColor(sectors: string[]): string {
  for (const s of sectors) { const c = SECTOR_COLOR[s]; if (c) return c; }
  return 'bg-white/15';
}

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const loom = url.match(/loom\.com\/share\/([\w]+)/);
  if (loom) return `https://www.loom.com/embed/${loom[1]}`;
  return null;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: { user } }] = await Promise.all([
    supabase.from('projects').select(PROJECT_SELECT).eq('slug', slug).single(),
    supabase.auth.getUser(),
  ]);

  if (!project) notFound();
  const isCreator = user?.id === (project as Project).created_by;
  if ((project as Project).status !== 'published' && !isCreator) notFound();

  const p = project as Project;

  // Fetch maker profiles (with headline for mini cards)
  let makerProfiles: { id: string; display_name: string | null; headline: string | null }[] = [];
  if (p.makers.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, headline')
      .in('id', p.makers);
    makerProfiles = data ?? [];
  }

  const mediaEmbed = p.media_url ? embedUrl(p.media_url) : null;
  const barColor = sectorColor(p.sector);
  const stage = p.stage ? (STAGE_DOT[p.stage] ?? STAGE_DOT.idea) : null;

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-text-primary sm:px-6">
      <div className="mx-auto max-w-2xl space-y-8">

        {/* Back */}
        <Link
          href="/showcase"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 transition hover:text-accent"
        >
          ← Back to Showcase
        </Link>

        {/* Draft banner */}
        {p.status === 'draft' && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 font-mono text-xs text-amber-400">
            Draft — only visible to you.
          </div>
        )}

        {/* Hero row */}
        <div className="flex items-start gap-4">
          {/* Sector bar */}
          <div className={`mt-1 min-h-14 w-1 shrink-0 rounded-full ${barColor}`} />

          {/* Name + tagline + chips */}
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{p.name}</h1>
            {p.tagline && <p className="text-base text-white/60">{p.tagline}</p>}
            {/* platform chips */}
            {p.platform.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {p.platform.map((pl) => (
                  <span key={pl} className="rounded border border-white/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    {pl}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stage dot */}
          {stage && (
            <div className="flex shrink-0 items-center gap-1.5 pt-1">
              <span className={`inline-block h-2 w-2 rounded-full ${stage.color}`} />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/45">{stage.label}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {(p.web_url || p.app_store_url || p.play_store_url || (p.media_url && !mediaEmbed)) && (
          <div className="flex flex-wrap gap-2">
            {p.web_url && (
              <a href={p.web_url} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white/60 transition hover:border-accent/50 hover:text-accent">
                Visit ↗
              </a>
            )}
            {p.app_store_url && (
              <a href={p.app_store_url} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white/60 transition hover:border-accent/50 hover:text-accent">
                App Store ↗
              </a>
            )}
            {p.play_store_url && (
              <a href={p.play_store_url} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white/60 transition hover:border-accent/50 hover:text-accent">
                Play Store ↗
              </a>
            )}
            {p.media_url && !mediaEmbed && (
              <a href={p.media_url} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white/60 transition hover:border-accent/50 hover:text-accent">
                Demo ↗
              </a>
            )}
            {isCreator && (
              <Link href={`/showcase/${p.slug}/edit`}
                className="rounded-full border border-white/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white/35 transition hover:border-white/25 hover:text-white/60">
                Edit
              </Link>
            )}
          </div>
        )}

        <hr className="border-white/8" />

        {/* About */}
        {p.description && (
          <>
            <div className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">About</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/65">{p.description}</p>
            </div>
            <hr className="border-white/8" />
          </>
        )}

        {/* Media embed */}
        {mediaEmbed && (
          <>
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              <iframe
                src={mediaEmbed}
                title={`${p.name} demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <hr className="border-white/8" />
          </>
        )}

        {/* Traction + Seeking */}
        {(p.traction || p.seeking.length > 0) && (
          <>
            <div className="space-y-5">
              {p.traction && (
                <div className="space-y-1">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Traction</p>
                  <p className="text-xl font-semibold text-white/90">{p.traction}</p>
                </div>
              )}
              {p.seeking.length > 0 && (
                <div className="space-y-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Seeking</p>
                  <div className="flex flex-wrap gap-2">
                    {p.seeking.map((s) => (
                      <Link key={s} href={`/showcase?tab=seeking&seeking=${s}`}
                        className="rounded-full border border-white/20 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/55 transition hover:border-accent/40 hover:text-accent">
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <hr className="border-white/8" />
          </>
        )}

        {/* Connect */}
        {p.contact_url && (
          <>
            <div className="space-y-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Connect</p>
              <div className="flex justify-end">
                <a
                  href={p.contact_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/25 px-8 py-4 font-mono text-sm text-white/70 transition hover:border-accent/60 hover:text-accent"
                >
                  Get in touch →
                </a>
              </div>
            </div>
            <hr className="border-white/8" />
          </>
        )}

        {/* Built by — mini profile cards */}
        {makerProfiles.length > 0 && (
          <>
            <div className="space-y-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Built by</p>
              <div className="flex flex-wrap gap-3">
                {makerProfiles.map((mp) => {
                  const initials = mp.display_name?.trim()[0]?.toUpperCase() ?? '?';
                  const handle = mp.display_name
                    ? '@' + mp.display_name.trim().toLowerCase().replace(/\s+/g, '')
                    : '?';
                  return (
                    <Link key={mp.id} href={`/profile/${mp.id}`}
                      className="group flex flex-col gap-1.5 rounded-xl border border-white/10 p-4 transition hover:border-white/20 hover:bg-white/2"
                      style={{ minWidth: '140px' }}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 font-mono text-sm font-bold text-white/60">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{handle}</p>
                        {mp.headline && (
                          <p className="mt-0.5 text-xs text-white/40 line-clamp-2">{mp.headline}</p>
                        )}
                      </div>
                      <span className="mt-auto font-mono text-[9px] uppercase tracking-[0.14em] text-white/30 transition group-hover:text-accent">
                        View →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <hr className="border-white/8" />
          </>
        )}

        {/* Acquisition CTA */}
        {!user && (
          <div className="flex flex-col items-start gap-3 py-2">
            <p className="text-sm text-white/45">Add your own project to the Showcase.</p>
            <Link href="/auth/signin?next=/showcase/new"
              className="rounded-full border border-accent/40 bg-accent/8 px-5 py-2.5 text-sm font-medium text-accent transition hover:bg-accent/15">
              Join Thunder →
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
