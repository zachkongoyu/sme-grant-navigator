import type { Metadata } from 'next';
import Link from 'next/link';
import { GeistPixelLine } from 'geist/font/pixel';

import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/types';
import { ShowcaseClient } from './ShowcaseClient';

export const metadata: Metadata = {
  title: 'Showcase | Thunder',
  description: 'Discover projects built by founders and makers in the startup community.',
  openGraph: {
    title: 'Showcase | Thunder',
    description: 'Discover projects built by founders and makers in the startup community.',
  },
};

export default async function ShowcasePage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('id, slug, created_by, makers, name, tagline, thumbnail_url, stage, status, platform, sector, seeking, traction, contact_url, created_at, updated_at, description, web_url, app_store_url, play_store_url, media_url')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const allProjects = (projects ?? []) as Project[];

  const allMakerIds = [...new Set(allProjects.flatMap((p) => p.makers))];
  let makerNames: Record<string, string> = {};
  if (allMakerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', allMakerIds);
    if (profiles) {
      makerNames = Object.fromEntries(
        profiles
          .filter((p: { id: string; display_name: string | null }) => p.display_name)
          .map((p: { id: string; display_name: string | null }) => [p.id, p.display_name!]),
      );
    }
  }

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main
      className="relative min-h-screen bg-background px-4 py-16 text-text-primary sm:px-6"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className={`text-5xl font-bold uppercase leading-none tracking-tight sm:text-6xl ${GeistPixelLine.className}`}>
                Showcase
              </h1>
              <p className="mt-1 text-base text-white/50">Idea, side project, or shipped — all welcome.</p>
            </div>
            <Link
              href={user ? '/showcase/new' : '/auth/signin?next=/showcase/new'}
              className="mt-1 shrink-0 border border-accent/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-accent/70 transition hover:border-accent hover:bg-accent/5 hover:text-accent"
            >
              + share what you&apos;re building
            </Link>
          </div>
        </div>

        <ShowcaseClient
          allProjects={allProjects}
          makerNames={makerNames}
          isAuthenticated={!!user}
        />
      </div>
    </main>
  );
}
