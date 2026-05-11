import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import { ProjectForm } from '@/components/ProjectForm';

export const metadata: Metadata = {
  title: 'Add Project | Thunder Showcase',
};

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin?next=/showcase/new');
  }

  return (
    <main className="relative min-h-screen bg-background px-4 py-20 text-text-primary sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-[600px] -translate-x-1/2 rounded-full bg-accent/3 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Showcase</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Add your project</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Publish to the Showcase wall to share what you&apos;re building.
          </p>
        </div>

        <ProjectForm currentUserId={user.id} />
      </div>
    </main>
  );
}
