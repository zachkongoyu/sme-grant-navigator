import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import { ProjectForm } from '@/components/ProjectForm';
import type { Project } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

const PROJECT_SELECT =
  'id, slug, created_by, makers, name, tagline, description, web_url, app_store_url, play_store_url, media_url, thumbnail_url, stage, status, platform, sector, seeking, traction, created_at, updated_at';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit ${slug} | Thunder Showcase` };
}

export default async function EditProjectPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/signin?next=/showcase/${slug}/edit`);
  }

  const { data: project } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('slug', slug)
    .single();

  if (!project) notFound();
  if ((project as Project).created_by !== user.id) notFound();

  return (
    <main className="relative min-h-screen bg-background px-4 py-20 text-text-primary sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-[600px] -translate-x-1/2 rounded-full bg-accent/3 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Showcase</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Edit project</h1>
        </div>

        <ProjectForm initialProject={project as Project} currentUserId={user.id} />
      </div>
    </main>
  );
}
