import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

const SECTOR_HEX: Record<string, string> = {
  ai:         '#7c3aed',
  fintech:    '#2563eb',
  healthtech: '#059669',
  proptech:   '#ea580c',
  edtech:     '#0891b2',
  b2b:        '#64748b',
  b2c:        '#db2777',
  deeptech:   '#4338ca',
};

function sectorHex(sectors: string[]): string {
  for (const s of sectors) { const c = SECTOR_HEX[s]; if (c) return c; }
  return '#3b82f6';
}

const STAGE_DOT: Record<string, { dot: string; label: string }> = {
  idea:     { dot: 'rgba(255,255,255,0.25)', label: 'Idea'     },
  building: { dot: '#fbbf24',               label: 'Building' },
  launched: { dot: '#34d399',               label: 'Launched' },
};

export default async function ProjectOGImage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('projects')
    .select('name, tagline, sector, platform, stage, status')
    .eq('slug', slug)
    .single();

  const name    = data?.name    ?? 'Project';
  const tagline = data?.tagline ?? null;
  const sectors: string[] = data?.sector   ?? [];
  const stage:   string | null = data?.stage ?? null;
  const color   = sectorHex(sectors);
  const stageMeta = stage ? (STAGE_DOT[stage] ?? STAGE_DOT.idea) : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          background: '#080808',
          color: '#ededed',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Sector color bar — left edge */}
        <div style={{ width: 12, background: color, flexShrink: 0 }} />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            padding: '56px 64px',
          }}
        >
          {/* Top: Thunder Showcase label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 999,
              padding: '6px 16px',
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#555',
            }}>
              Thunder Showcase
            </div>
            {stageMeta && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stageMeta.dot }} />
                <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#666' }}>
                  {stageMeta.label}
                </span>
              </div>
            )}
          </div>

          {/* Middle: name + tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: '#ededed' }}>
              {name}
            </div>
            {tagline && (
              <div style={{ fontSize: 30, color: '#888', lineHeight: 1.3, maxWidth: 760 }}>
                {tagline}
              </div>
            )}
          </div>

          {/* Bottom: sector chips */}
          {sectors.length > 0 && (
            <div style={{ display: 'flex', gap: 10 }}>
              {sectors.slice(0, 3).map((s) => (
                <div key={s} style={{
                  background: `${color}22`,
                  border: `1px solid ${color}55`,
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color,
                }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    size
  );
}
