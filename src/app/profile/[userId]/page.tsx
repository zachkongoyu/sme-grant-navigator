import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { ProfileCard } from '@/components/ProfileCard';

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('display_name, headline')
    .eq('id', userId)
    .eq('is_public', true)
    .single();

  if (!data?.display_name) {
    return { title: 'Profile | Thunder' };
  }

  return {
    title: `${data.display_name} | Thunder`,
    description: data.headline ?? undefined,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { userId } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, headline, bio, roles, location, links')
      .eq('id', userId)
      .eq('is_public', true)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!profile || !profile.display_name) {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-background px-4 py-20 text-text-primary sm:px-6">
      {/* Ambient glow centred on name */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-125 w-225 -translate-x-1/2 rounded-full bg-accent/2.5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-xl space-y-12">
        {/* Hero name */}
        <div className="space-y-2 text-center">
          <h1 className="text-5xl font-semibold tracking-tight">{profile.display_name}</h1>
          {profile.headline && (
            <p className="text-base text-text-secondary">{profile.headline}</p>
          )}
        </div>

        {/* Card */}
        <ProfileCard
          displayName={profile.display_name}
          headline={profile.headline}
          bio={profile.bio}
          roles={profile.roles ?? []}
          location={profile.location}
          links={profile.links ?? {}}
          userId={userId}
        />

        {/* CTA — only for signed-out visitors */}
        {!user && (
          <div className="text-center space-y-2">
            <p className="text-xs text-text-tertiary">Ready to change the world?</p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
            >
              Create your profile →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
