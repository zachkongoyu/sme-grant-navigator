import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { BackNavigation } from '@/components/navigation';
import { ProfileForm } from '@/components/ProfileForm';
import type { Profile } from '@/types';

export const metadata: Metadata = {
  title: 'Profile | Thunder',
  description: 'Manage your public profile.',
};

export default async function SettingsProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin?next=/settings/profile');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, credits_balance, free_checks_used, display_name, headline, bio, roles, location, links, is_public, entity_type')
    .eq('id', user.id)
    .single();

  const safeProfile: Profile = {
    id: user.id,
    display_name: profile?.display_name ?? null,
    headline: profile?.headline ?? null,
    bio: profile?.bio ?? null,
    roles: profile?.roles ?? [],
    location: profile?.location ?? null,
    links: profile?.links ?? {},
    is_public: profile?.is_public ?? true,
    credits_balance: profile?.credits_balance ?? 0,
    free_checks_used: profile?.free_checks_used ?? 0,
    entity_type: profile?.entity_type ?? null,
  };

  return (
    <main className="relative min-h-screen bg-background px-4 py-16 text-text-primary sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-125 w-225 -translate-x-1/2 rounded-full bg-accent/2.5 blur-3xl" />
      </div>

      <div className="absolute top-6 left-6 z-10">
        <BackNavigation fallbackHref="/" />
      </div>

      <div className="mx-auto max-w-3xl space-y-10">
        <div className="pt-6 space-y-1.5 pb-8 border-b border-border">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-tertiary">Settings</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Share your background with the startup community.
          </p>
        </div>

        <ProfileForm initialProfile={safeProfile} />
      </div>
    </main>
  );
}
