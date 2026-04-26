'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/utils/supabase/client';

function getNext() {
  if (typeof window === 'undefined') return '/';
  return new URLSearchParams(window.location.search).get('next') ?? '/';
}

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(getNext())}`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(getNext())}`,
      },
    });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute top-6 left-6 inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3L5 8l5 5" />
        </svg>
        Back
      </button>
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold text-text-primary">Sign in / Sign up</h1>

        {sent ? (
          <div className="rounded-lg border border-success/30 bg-success/5 px-4 py-3">
            <p className="text-sm text-text-primary">
              We sent a sign-in link to <span className="font-medium">{email}</span>.
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Click the link in the email to continue — it expires in 10 minutes.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-surface-hover disabled:opacity-60"
            >
              {googleLoading ? (
                <svg className="h-4 w-4 animate-spin text-text-tertiary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <GoogleIcon />
              )}
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm text-text-secondary">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                />
              </div>

              {error && (
                <p className="text-xs text-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                {loading ? 'Sending…' : 'Send sign-in link'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

