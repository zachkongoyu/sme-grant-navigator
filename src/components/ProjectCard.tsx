import Link from 'next/link';

import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  editable?: boolean;
  makerNames?: Record<string, string>;
  featured?: boolean;
}

const STAGE_DOT: Record<string, { color: string; label: string }> = {
  idea:     { color: 'bg-stone-400',   label: 'Idea'     },
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

// Platform icons — inline SVG, 12×12
function PlatformIcon({ platform }: { platform: string }) {
  const cls = 'h-3 w-3 shrink-0';
  switch (platform) {
    case 'web':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="Web">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
        </svg>
      );
    case 'ios':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-label="iOS">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      );
    case 'android':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-label="Android">
          <path d="M17.523 15.341A5.97 5.97 0 0 0 18 12.968V12a6 6 0 0 0-12 0v.968a5.97 5.97 0 0 0 .477 2.373l-1.563 2.707a.75.75 0 0 0 1.299.75L7.64 16.5h8.72l1.427 2.298a.75.75 0 1 0 1.299-.75l-1.563-2.707zM9.75 11.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm4.5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM8.5 6.5l-1.5-2.598M15.5 6.5l1.5-2.598"/>
        </svg>
      );
    case 'chrome-extension':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="Chrome Extension">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 8h8.93M4.93 12.5 9.27 5M9.27 19l4.66-8" />
        </svg>
      );
    case 'desktop':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="Desktop">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case 'api':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="API">
          <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M14 6l-4 12" />
        </svg>
      );
    default:
      return <span className="font-mono text-[9px] uppercase">{platform}</span>;
  }
}

function blockColor(sectors: string[]): string {
  for (const s of sectors) {
    const c = SECTOR_COLOR[s];
    if (c) return c;
  }
  return 'bg-white/15';
}

export function ProjectCard({ project, editable, makerNames = {}, featured }: ProjectCardProps) {
  const color = blockColor(project.sector);
  const stage = project.stage ? (STAGE_DOT[project.stage] ?? STAGE_DOT.idea) : null;

  const makerList = project.makers
    .map((uid) => makerNames[uid])
    .filter(Boolean) as string[];

  const content = (
    <div className={`group flex items-start gap-3 transition ${featured ? 'p-5' : 'px-4 py-4'}`}>
      {/* Sector-colored vertical bar */}
      <div className={`min-h-12 w-1 shrink-0 rounded-full ${color}`} />

      {/* Body */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {featured && (
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-accent/70">Featured</p>
        )}

        {/* Row 1: name + stage */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary transition-colors group-hover:text-accent">
            {project.name}
          </span>
          {stage && (
            <span className="flex shrink-0 items-center gap-1">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${stage.color}`} />
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">{stage.label}</span>
            </span>
          )}
        </div>

        {/* Row 2: tagline */}
        {project.tagline && (
          <p className="text-sm leading-snug text-white/60">{project.tagline}</p>
        )}

        {/* Row 3: traction · @makers */}
        {(project.traction || makerList.length > 0) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            {project.traction && (
              <span className="font-medium text-white/80">{project.traction}</span>
            )}
            {makerList.map((n) => (
              <span key={n} className="text-white/35">@{(n.split(' ')[0] ?? n).toLowerCase()}</span>
            ))}
          </div>
        )}

        {/* Row 4: sector chips */}
        {project.sector.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.sector.map((s) => (
              <span key={s} className="rounded bg-white/6 px-2 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-white/50">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Row 5: seeking */}
        {project.seeking.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-white/35">Seeking</span>
            {project.seeking.map((s) => (
              <span key={s} className="rounded border border-white/15 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right: platforms + visit/edit + envelope */}
      <div className="flex shrink-0 flex-col items-end gap-2 self-stretch pt-0.5">
        {/* Platform chips */}
        <div className="flex items-center gap-1.5">
          {project.platform.map((p) => (
            <span key={p} title={p} className="inline-flex items-center rounded border border-white/15 px-1.5 py-px text-white/45">
              <PlatformIcon platform={p} />
            </span>
          ))}
        </div>
        {/* Visit / Edit */}
        {featured && (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35 transition group-hover:text-accent">
            Visit →
          </span>
        )}
        {editable && (
          <Link
            href={`/showcase/${project.slug}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/38 transition hover:text-accent"
          >
            Edit
          </Link>
        )}
        {/* Envelope — bottom right */}
        {project.contact_url && (
          <span
            title="Contactable"
            aria-label="Contactable"
            className="mt-auto text-white/30 transition group-hover:text-white/50"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
              <rect x="1.5" y="3.5" width="13" height="9" rx="1" />
              <path d="M1.5 4.5 8 9.5l6.5-5" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );

  if (featured) {
    return (
      <Link
        href={`/showcase/${project.slug}`}
        className="block rounded-xl border border-accent/35 bg-accent/4 transition hover:border-accent/55 hover:bg-accent/6"
      >
        {content}
      </Link>
    );
  }

  return (
    <Link href={`/showcase/${project.slug}`} className="block hover:bg-white/2">
      {content}
    </Link>
  );
}
