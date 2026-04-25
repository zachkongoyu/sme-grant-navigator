'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  if (!user) {
    return (
      <Link
        href={`/auth/signin?next=${encodeURIComponent(pathname)}`}
        className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const initial = (user.email?.[0] ?? '?').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent font-mono text-xs font-semibold hover:bg-accent/25 transition-colors"
        aria-label="Account menu"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-[180px] rounded-lg border border-border bg-surface shadow-lg py-1">
          <p className="px-3 py-2 font-mono text-[10px] text-text-tertiary truncate border-b border-border">
            {user.email}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
