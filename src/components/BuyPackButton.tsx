'use client';

import { useState } from 'react';

import { BILLING, formatPrice, type PackId } from '@/config/billing';

export function BuyPackButton({ pack, popular }: { pack: (typeof BILLING.packs)[number]; popular?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id as PackId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  const draftsEquiv = Math.floor(pack.credits / BILLING.creditCost.draft);
  const pricePerCredit = (pack.priceMinorUnits / pack.credits / 100).toFixed(1);

  return (
    <button
      type="button"
      onClick={handleBuy}
      disabled={loading}
      className={`group relative w-full overflow-hidden rounded-2xl border bg-surface px-6 py-5 text-left transition-all duration-150 hover:bg-surface-hover disabled:opacity-50 ${popular ? 'border-accent/60' : 'border-border hover:border-border-strong'}`}
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-accent/[0.04] via-transparent to-transparent" />

      <div className="flex items-center justify-between gap-4">

        {/* Left — credits + breakdown */}
        <div className="flex items-center gap-5">
          <div className="shrink-0">
            <span className="text-4xl font-bold tabular-nums leading-none tracking-tighter">{pack.credits}</span>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-text-tertiary">credits</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold tracking-tight text-text-primary">{pack.label}</p>
              {popular && <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Popular</span>}
            </div>
            <p className="mt-0.5 text-xs text-text-tertiary">
              {pack.credits} checks · {draftsEquiv} drafts
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-text-tertiary">HKD {pricePerCredit} / credit</p>
          </div>
        </div>

        {/* Right — price + CTA */}
        <div className="shrink-0 text-right">
          <p className="font-mono text-base font-semibold tabular-nums">{formatPrice(pack.priceMinorUnits)}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-tertiary group-hover:text-text-secondary transition-colors">
            {loading ? 'Loading…' : 'Buy →'}
          </p>
        </div>

      </div>
    </button>
  );
}
