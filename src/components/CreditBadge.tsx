'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useAuth } from './useAuth';

interface ProfileData {
  credits_balance: number;
  free_checks_used: number;
}

export function CreditBadge() {
  const user = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!user) return;

    fetch('/api/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setProfile(data ?? null))
      .catch(() => setProfile(null));
  }, [user]);

  if (!user || profile === null) return null;

  const freeRemaining = Math.max(0, 3 - profile.free_checks_used);
  const total = profile.credits_balance + freeRemaining;
  const display = `${total} Credits`;

  return (
    <Link
      href="/billing"
      className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary hover:text-accent transition-colors"
      title="View credits & top up"
    >
      {display}
    </Link>
  );
}
