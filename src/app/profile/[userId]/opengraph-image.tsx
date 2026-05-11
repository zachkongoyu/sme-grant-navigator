import { ImageResponse } from 'next/og';

import { createClient } from '@/lib/supabase/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function ProfileOGImage({ params }: Props) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, headline, bio, roles, location, links')
    .eq('id', userId)
    .eq('is_public', true)
    .single();

  const displayName = profile?.display_name ?? 'Thunder User';
  const headline = profile?.headline ?? null;
  const bio = profile?.bio ?? null;
  const roles: string[] = profile?.roles ?? [];
  const location = profile?.location ?? null;
  const links = (profile?.links ?? {}) as { linkedin?: string; x?: string; website?: string };
  const initial = displayName.trim()[0]?.toUpperCase() ?? '?';
  const linkLabels = [
    links.linkedin && 'LinkedIn',
    links.x && 'X',
    links.website && 'Website',
  ].filter(Boolean) as string[];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          background: '#000000',
          color: '#ededed',
          padding: '40px',
          fontFamily: 'sans-serif',
          alignItems: 'stretch',
          position: 'relative',
        }}
      >
        {/* Ambient gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.05), transparent 24%)',
          }}
        />

        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '28px',
            padding: '56px',
            background: '#111111',
            position: 'relative',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Top: avatar + name + headline */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px' }}>
            {/* Avatar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '96px',
                height: '96px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: 44,
                fontWeight: 700,
                color: '#ededed',
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  color: '#ededed',
                }}
              >
                {displayName}
              </div>
              {headline && (
                <div style={{ fontSize: 26, color: '#717171', letterSpacing: '-0.01em' }}>
                  {headline}
                </div>
              )}
            </div>
          </div>

          {/* Middle: roles + location + bio + links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {roles.slice(0, 5).map((role) => (
                  <div
                    key={role}
                    style={{
                      display: 'flex',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '999px',
                      padding: '6px 14px',
                      fontSize: 16,
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      color: '#999999',
                    }}
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}
            {location && (
              <div style={{ fontSize: 22, color: '#555555' }}>{location}</div>
            )}
            {bio && (
              <div style={{ fontSize: 20, color: '#666666', lineHeight: 1.5, marginTop: '4px' }}>
                {bio.length > 160 ? bio.slice(0, 160) + '…' : bio}
              </div>
            )}
            {linkLabels.length > 0 && (
              <div style={{ display: 'flex', gap: '16px' }}>
                {linkLabels.map((label) => (
                  <div
                    key={label}
                    style={{
                      fontSize: 14,
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      color: '#555555',
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    ),
    { ...size },
  );
}
