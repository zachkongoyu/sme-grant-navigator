'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-text-tertiary truncate max-w-[140px]">
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
    >
      Sign in
    </Link>
  );
}
