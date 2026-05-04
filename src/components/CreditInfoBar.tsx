import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { BILLING } from '@/config/billing';

export async function CreditInfoBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance, free_checks_used')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  const freeRemaining = Math.max(0, BILLING.freeChecks - profile.free_checks_used);
  const hasCredits = freeRemaining > 0 || profile.credits_balance > 0;

  if (!hasCredits) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/8 px-4 py-2">
        <span className="font-mono text-[11px] text-red-400">No credits remaining.</span>
        <Link href="/billing" className="font-mono text-[11px] font-semibold text-accent underline underline-offset-2">
          Top up →
        </Link>
      </div>
    );
  }

  const balanceLabel = freeRemaining > 0
    ? `${profile.credits_balance + freeRemaining} credit${profile.credits_balance + freeRemaining !== 1 ? 's' : ''}`
    : `${profile.credits_balance} credit${profile.credits_balance !== 1 ? 's' : ''}`;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-2">
      <span className="font-mono text-[11px] text-text-secondary">{balanceLabel}</span>
      <Link href="/billing" className="font-mono text-[10px] text-text-tertiary hover:text-accent transition-colors">
        Top up
      </Link>
    </div>
  );
}