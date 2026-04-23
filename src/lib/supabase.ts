import { createClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase client with the service role key.
 * Called at request time — not at module load — so missing env vars only throw
 * when an API route actually runs, not during the Next.js build.
 *
 * The service role key bypasses Row Level Security. Never import this from a
 * client component.
 */
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. ' +
        'Copy .env.example to .env.local and fill in your Supabase project credentials.',
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
