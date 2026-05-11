import type { ProfileLinks } from '@/types';
import { CopyProfileLink } from '@/components/CopyProfileLink';

interface ProfileCardProps {
  displayName: string;
  headline?: string | null;
  bio?: string | null;
  roles?: string[];
  location?: string | null;
  links?: ProfileLinks;
  userId?: string;
}

export function ProfileCard({
  displayName,
  headline,
  bio,
  roles,
  location,
  links,
  userId,
}: ProfileCardProps) {
  const initial = displayName.trim()[0]?.toUpperCase() ?? '?';
  const hasLinks = links && (links.linkedin || links.x || links.website);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10"
      style={{
        background: 'rgba(10, 10, 18, 0.45)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.07) inset, 0 32px 64px -12px rgba(0,0,0,0.6), 0 8px 24px -4px rgba(0,0,0,0.4)',
        transform: 'translateY(-2px)',
      }}
    >
      {/* Copy icon — top right */}
      {userId && (
        <div className="absolute top-4 right-4 z-10">
          <CopyProfileLink userId={userId} />
        </div>
      )}
      {/* Diagonal noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* Large blurred glow — top-left */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      {/* Gloss highlight — top curved reflection */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.10), transparent)',
        }}
      />

      {/* Shiny top border */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.35) 70%, transparent 100%)',
        }}
      />

      {/* Hero band */}
      <div
        className="relative px-8 pt-8 pb-7"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-accent tracking-tight select-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              {initial}
            </div>
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-accent border-2 border-surface" />
          </div>

          <div className="min-w-0 pt-1 space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight leading-tight">{displayName}</h2>
            {headline ? (
              <p className="text-sm text-text-secondary leading-snug">{headline}</p>
            ) : (
              <p className="text-sm text-text-tertiary italic">No headline yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Roles */}
        {roles && roles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center rounded-full border border-border bg-surface-hover px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-text-secondary"
              >
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Location */}
        {location && (
          <p className="flex items-center gap-1.5 text-sm text-text-tertiary">
            <span className="text-[11px]">◎</span>
            {location}
          </p>
        )}

        {/* Bio */}
        {bio && (
          <div className="border-t border-border pt-5">
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{bio}</p>
          </div>
        )}

        {/* Links */}
        {hasLinks && (
          <div className={`flex flex-wrap gap-5 ${!bio ? 'border-t border-border pt-5' : ''}`}>
            {links.linkedin && (
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
              >
                LinkedIn
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
              </a>
            )}
            {links.x && (
              <a
                href={links.x}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
              >
                X
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
              </a>
            )}
            {links.website && (
              <a
                href={links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
              >
                Website
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
              </a>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
