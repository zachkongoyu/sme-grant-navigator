import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.05), transparent 24%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '28px',
            padding: '40px',
            background: '#111111',
            position: 'relative',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '32px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '760px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '999px',
                    padding: '9px 14px',
                    fontSize: 16,
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    color: '#717171',
                  }}
                >
                  AI grant drafting platform
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.28)',
                    background: 'rgba(34, 197, 94, 0.08)',
                    borderRadius: '999px',
                    padding: '8px 12px',
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    color: '#22c55e',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '999px',
                      background: '#22c55e',
                    }}
                  />
                  Live
                </div>
              </div>
              <div style={{ fontSize: 74, lineHeight: 1.02, fontWeight: 700, letterSpacing: '-0.05em' }}>
                Your grant application, drafted by AI.
              </div>
              <div style={{ fontSize: 28, lineHeight: 1.35, color: '#a1a1a1', maxWidth: '720px' }}>
                Tell Thunder about your business and get a grant-ready draft in under a minute. Launching with Easy BUD in Hong Kong.
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  marginTop: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px',
                    background: '#ededed',
                    color: '#000000',
                    padding: '16px 24px',
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  Start at /draft
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#a1a1a1',
                    padding: '16px 22px',
                    fontSize: 22,
                  }}
                >
                  /funds/easy-bud
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                minWidth: '300px',
                maxWidth: '300px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '22px',
                  padding: '22px',
                  background: '#0a0a0a',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: 16, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#717171' }}>
                      Trending
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1, color: '#ededed' }}>
                      Easy BUD
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '18px',
                      padding: '12px 14px',
                      minWidth: '92px',
                      background: '#111111',
                    }}
                  >
                    <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#717171' }}>
                      Max grant
                    </div>
                    <div style={{ marginTop: '4px', fontSize: 28, fontWeight: 700, color: '#ededed' }}>
                      HK$150K
                    </div>
                    <div style={{ fontSize: 12, color: '#717171' }}>50% match</div>
                  </div>
                </div>

                <div style={{ fontSize: 19, lineHeight: 1.45, color: '#a1a1a1' }}>
                  Hong Kong&apos;s streamlined SME grant for market expansion and promotion projects.
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 16,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#717171',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: '#717171' }} />
                Reimbursement guide
                <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: '#717171' }} />
                Scheme browser
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ededed' }}>Thunder</div>
              <div style={{ fontSize: 18, color: '#717171' }}>AI grant drafting platform</div>
            </div>
            <div style={{ fontSize: 18, color: '#717171' }}>
              Starts with Easy BUD. Expands beyond one scheme or market.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}