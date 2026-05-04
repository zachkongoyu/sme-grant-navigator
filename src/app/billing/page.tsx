import type { Metadata } from 'next';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { BILLING } from '@/config/billing';
import { BuyPackButton } from '@/components/BuyPackButton';
import { BackNavigation } from '@/components/navigation';

export const metadata: Metadata = {
  title: 'Credits | Thunder',
  description: 'Purchase credits to use AI eligibility checks and draft generation.',
};

interface BillingPageProps {
  readonly searchParams?: Promise<{ success?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const params = searchParams ? await searchParams : undefined;
  const didPurchase = params?.success === 'true';

  let creditsBalance = 0;
  let freeChecksUsed = 0;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance, free_checks_used')
      .eq('id', user.id)
      .single();

    if (profile) {
      creditsBalance = profile.credits_balance;
      freeChecksUsed = profile.free_checks_used;
    }
  }

  const freeRemaining = Math.max(0, BILLING.freeChecks - freeChecksUsed);
  const totalCredits = creditsBalance + freeRemaining;

  return (
    <main className="relative min-h-screen bg-background px-4 py-16 text-text-primary sm:px-6">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.025] blur-3xl" />
      </div>

      <div className="absolute top-6 left-6 z-10">
        <BackNavigation fallbackHref="/" />
      </div>

      <div className="mx-auto max-w-md space-y-10">

        {/* Header */}
        <div className="pt-6 space-y-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-tertiary">Credits</p>
          <h1 className="text-3xl font-semibold tracking-tight">Power your work</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Eligibility checks and grant drafts on demand.<br />No subscription — pay as you go.
          </p>
        </div>

        {/* Purchase success banner */}
        {didPurchase && (
          <div className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 flex items-center gap-2.5">
            <span className="text-success text-sm">✓</span>
            <p className="text-sm text-success">Credits added — your balance is updated.</p>
          </div>
        )}

        {/* Not signed in */}
        {!user && (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-tight">3 free credits</p>
              <p className="mt-1.5 text-sm text-text-secondary">Every new account gets 3 credits — no card required.</p>
            </div>
            <Link
              href="/auth/signin?next=/billing"
              className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
            >
              Sign in to claim →
            </Link>
          </div>
        )}

        {/* Balance card */}
        {user && (
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-7">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.05] via-transparent to-transparent" />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-tertiary">Balance</p>
            <div className="mt-3 flex items-end gap-2.5">
              <span className="text-7xl font-bold tabular-nums leading-none tracking-tighter">{totalCredits}</span>
              <span className="mb-2 text-sm text-text-tertiary">credits</span>
            </div>
            {freeRemaining > 0 && (
              <p className="mt-4 text-xs text-text-secondary border-t border-border pt-3">
                {freeRemaining} complimentary credit{freeRemaining !== 1 ? 's' : ''} on us — start exploring
              </p>
            )}
          </div>
        )}

        {/* Top up packs */}
        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-tertiary">Top up</p>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-2.5">
              {BILLING.packs.map((pack) => (
                <BuyPackButton key={pack.id} pack={pack} popular={pack.id === 'value'} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
