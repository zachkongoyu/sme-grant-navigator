'use client';

import { useEffect, useRef } from 'react';

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function buildBolt(
  x1: number, y1: number,
  x2: number, y2: number,
  roughness: number,
  depth: number,
  segs: [number, number, number, number, number][],
  alpha = 1,
) {
  if (depth === 0) {
    segs.push([x1, y1, x2, y2, alpha]);
    return;
  }
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny =  dx / len;
  const disp = rand(-roughness, roughness) * len;
  const jx = mx + nx * disp;
  const jy = my + ny * disp;

  buildBolt(x1, y1, jx, jy, roughness * 0.58, depth - 1, segs, alpha);
  buildBolt(jx, jy, x2, y2, roughness * 0.58, depth - 1, segs, alpha);

  if (depth >= 3 && Math.random() < 0.42) {
    const branchAngle = rand(18, 55) * (Math.random() < 0.5 ? 1 : -1);
    const rad = (branchAngle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const blen = len * rand(0.35, 0.7);
    const bdx = (dx / len) * cos - (dy / len) * sin;
    const bdy = (dx / len) * sin + (dy / len) * cos;
    buildBolt(jx, jy, jx + bdx * blen, jy + bdy * blen, roughness * 0.45, depth - 2, segs, alpha * 0.5);
  }
}

function drawBolt(ctx: CanvasRenderingContext2D, w: number, h: number, intensity = 1.0): { sx: number; sy: number } {
  const segs: [number, number, number, number, number][] = [];
  // Allow bolts to originate from top, sides, or even mid-screen
  const originFromSide = Math.random() < 0.25;
  let sx: number, sy: number, ex: number, ey: number;
  if (originFromSide) {
    const fromLeft = Math.random() < 0.5;
    sx = fromLeft ? rand(-20, w * 0.15) : rand(w * 0.85, w + 20);
    sy = rand(0, h * 0.5);
    ex = rand(w * 0.2, w * 0.8);
    ey = rand(sy + h * 0.2, Math.min(sy + h * 0.7, h));
  } else {
    sx = rand(w * 0.08, w * 0.92);
    sy = rand(-20, h * 0.1);
    ex = sx + rand(-w * 0.22, w * 0.22);
    ey = rand(h * 0.35, h * 0.98);
  }
  buildBolt(sx, sy, ex, ey, 0.30, 8, segs);

  const i = intensity;
  const passes: [string, number, number][] = [
    [`rgba(120,170,255,${0.15 * i})`, Math.max(1, 12 * i), Math.max(4, 22 * i)],
    [`rgba(180,210,255,${0.45 * i})`, Math.max(1,  3 * i), Math.max(2, 12 * i)],
    [`rgba(230,240,255,${0.75 * i})`, Math.max(1,  1.5 * i), Math.max(1, 5 * i)],
    [`rgba(255,255,255,${0.90 * i})`, Math.max(1,  0.8 * i), Math.max(1, 2 * i)],
  ];

  for (const [color, lw, blur] of passes) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur  = blur;
    for (const [x1, y1, x2, y2, alpha] of segs) {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  return { sx, sy };
}

// Mist: layers of drifting perlin-like noise painted as large blurred gradients
function drawMist(
  mistCtx: CanvasRenderingContext2D,
  w: number, h: number,
  layers: { x: number; y: number; r: number; alpha: number; drift: number }[],
) {
  mistCtx.clearRect(0, 0, w, h);
  for (const l of layers) {
    const grad = mistCtx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    grad.addColorStop(0,   `rgba(80,100,140,${l.alpha})`);
    grad.addColorStop(0.5, `rgba(60, 80,120,${l.alpha * 0.4})`);
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    mistCtx.fillStyle = grad;
    mistCtx.beginPath();
    mistCtx.ellipse(l.x, l.y, l.r * 1.6, l.r * 0.9, 0, 0, Math.PI * 2);
    mistCtx.fill();
  }
}

export function LightningEffect() {
  const boltRef    = useRef<HTMLCanvasElement>(null);
  const mistRef    = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boltCanvas = boltRef.current;
    const mistCanvas = mistRef.current;
    const overlay    = overlayRef.current;
    if (!boltCanvas || !mistCanvas || !overlay) return;

    const bctx = boltCanvas.getContext('2d')!;
    const mctx = mistCanvas.getContext('2d')!;
    if (!bctx || !mctx) return;

    let rafId: number;
    let strikeTimeout: ReturnType<typeof setTimeout>;

    // Capture non-nullable locals for use inside nested functions
    const ov = overlay;
    const bc = boltCanvas;

    function resize() {
      const bc = boltRef.current;
      const mc = mistRef.current;
      if (!bc || !mc) return;
      bc.width  = mc.width  = window.innerWidth;
      bc.height = mc.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Mist layer state ─────────────────────────────────────────────────────
    const w = () => boltCanvas.width;
    const h = () => boltCanvas.height;

    const mistLayers = Array.from({ length: 14 }, () => ({
      x:     rand(0, window.innerWidth),
      y:     rand(0, window.innerHeight),
      r:     rand(180, 420),
      alpha: rand(0.04, 0.11),
      drift: rand(0.12, 0.38) * (Math.random() < 0.5 ? 1 : -1),
      vy:    rand(-0.08, 0.08),
    }));

    let mistFrame = 0;
    function animateMist() {
      rafId = requestAnimationFrame(animateMist);
      mistFrame++;
      if (mistFrame % 3 !== 0) return; // 20fps is plenty for mist
      for (const l of mistLayers) {
        l.x += l.drift;
        l.y += l.vy;
        if (l.x >  w() + l.r) l.x = -l.r;
        if (l.x < -l.r)       l.x = w() + l.r;
        if (l.y >  h() + l.r) l.y = -l.r;
        if (l.y < -l.r)       l.y = h() + l.r;
      }
      drawMist(mctx, w(), h(), mistLayers);
    }
    animateMist();

    // ── Lightning strike logic ────────────────────────────────────────────────
    function flash(op: number, fade = false, ox?: number, oy?: number) {
      if (ox !== undefined && oy !== undefined && op > 0) {
        // Clamp to viewport bounds so gradient centre is never off-screen
        const px = Math.max(5, Math.min(95, (ox / w()) * 100)).toFixed(1);
        const py = Math.max(0, Math.min(60, (oy / h()) * 100)).toFixed(1);
        ov.style.background = `radial-gradient(ellipse 70% 55% at ${px}% ${py}%, rgba(200,225,255,1) 0%, rgba(140,180,255,0.6) 45%, transparent 100%)`;
      }
      ov.style.transition = fade ? 'opacity 0.4s ease' : 'none';
      ov.style.opacity    = String(op);
    }

    function strike() {
      const count = Math.random() < 0.3 ? 2 : 1; // 30% chance of double strike
      bctx.clearRect(0, 0, w(), h());

      let ox = w() / 2, oy = 0; // primary bolt origin for cloud flash
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        const intensity = r < 0.2 ? rand(0.15, 0.35) : r < 0.7 ? rand(0.45, 0.75) : rand(0.85, 1.0);
        const origin = drawBolt(bctx, w(), h(), intensity);
        if (i === 0) { ox = origin.sx; oy = origin.sy; }
      }
      flash(0.22, false, ox, oy);

      setTimeout(() => {
        bctx.clearRect(0, 0, w(), h());
        flash(0.06, false, ox, oy);
      }, 60);

      setTimeout(() => {
        for (let i = 0; i < count; i++) {
          const r = Math.random();
          const intensity = r < 0.2 ? rand(0.15, 0.35) : r < 0.7 ? rand(0.45, 0.75) : rand(0.85, 1.0);
          const origin = drawBolt(bctx, w(), h(), intensity);
          if (i === 0) { ox = origin.sx; oy = origin.sy; }
        }
        flash(0.16, false, ox, oy);
      }, 100);

      // Afterglow: fade bolt canvas out rather than snap-clearing
      setTimeout(() => {
        bc.style.transition = 'opacity 80ms ease-out';
        bc.style.opacity = '0';
        flash(0, true);
      }, 190);

      setTimeout(() => {
        bctx.clearRect(0, 0, w(), h());
        bc.style.transition = 'none';
        bc.style.opacity = '1';
        strikeTimeout = setTimeout(strike, rand(300, 2200));
      }, 285);
    }

    strikeTimeout = setTimeout(strike, rand(0, 400));

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(strikeTimeout);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {/* Mist layer — always visible, slowly drifting */}
      <canvas
        ref={mistRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      {/* Lightning bolts */}
      <canvas
        ref={boltRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      {/* Cloud flash — on top so it's not occluded by the bolt canvas */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
