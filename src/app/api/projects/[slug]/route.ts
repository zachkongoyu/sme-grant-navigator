import { NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { PROJECT_STAGES, PROJECT_PLATFORMS, PROJECT_SECTORS, PROJECT_SEEKING } from '@/types';

const PROJECT_SELECT =
  'id, slug, created_by, makers, name, tagline, description, web_url, app_store_url, play_store_url, media_url, thumbnail_url, stage, status, platform, sector, seeking, traction, contact_url, created_at, updated_at';

const ALLOWED_STAGES = new Set(PROJECT_STAGES as readonly string[]);
const ALLOWED_PLATFORMS = new Set(PROJECT_PLATFORMS as readonly string[]);
const ALLOWED_SECTORS = new Set(PROJECT_SECTORS as readonly string[]);
const ALLOWED_SEEKING = new Set(PROJECT_SEEKING as readonly string[]);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function filterArray(arr: unknown, allowed: Set<string>): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((v): v is string => typeof v === 'string' && allowed.has(v));
}

function safeUrl(val: unknown): string | null {
  if (typeof val !== 'string' || !val) return null;
  try {
    const u = new URL(val);
    if (u.protocol !== 'https:' && u.protocol !== 'http:' && u.protocol !== 'mailto:') return null;
    return val;
  } catch {
    return null;
  }
}

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(data);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Build update — only include keys that are present in body
  const update: Record<string, unknown> = {};

  if ('name' in body) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return Response.json({ error: 'name cannot be empty' }, { status: 422 });
    update.name = name;
  }

  if ('slug' in body) {
    const newSlug = typeof body.slug === 'string' ? slugify(body.slug) : '';
    if (!newSlug) return Response.json({ error: 'invalid slug' }, { status: 422 });
    if (newSlug !== slug) {
      const { count } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('slug', newSlug);
      if ((count ?? 0) > 0) {
        return Response.json({ error: 'slug already taken' }, { status: 409 });
      }
    }
    update.slug = newSlug;
  }

  if ('tagline' in body) update.tagline = typeof body.tagline === 'string' ? body.tagline.trim() || null : null;
  if ('description' in body) update.description = typeof body.description === 'string' ? body.description.trim() || null : null;
  if ('web_url' in body) update.web_url = safeUrl(body.web_url);
  if ('app_store_url' in body) update.app_store_url = safeUrl(body.app_store_url);
  if ('play_store_url' in body) update.play_store_url = safeUrl(body.play_store_url);
  if ('media_url' in body) update.media_url = safeUrl(body.media_url);
  if ('thumbnail_url' in body) update.thumbnail_url = safeUrl(body.thumbnail_url);
  if ('traction' in body) update.traction = typeof body.traction === 'string' ? body.traction.trim() || null : null;
  if ('contact_url' in body) update.contact_url = safeUrl(body.contact_url);

  if ('stage' in body) {
    update.stage = typeof body.stage === 'string' && ALLOWED_STAGES.has(body.stage) ? body.stage : null;
  }
  if ('status' in body) {
    if (body.status !== 'draft' && body.status !== 'published') {
      return Response.json({ error: 'invalid status' }, { status: 422 });
    }
    update.status = body.status;
  }
  if ('platform' in body) update.platform = filterArray(body.platform, ALLOWED_PLATFORMS);
  if ('sector' in body) update.sector = filterArray(body.sector, ALLOWED_SECTORS);
  if ('seeking' in body) update.seeking = filterArray(body.seeking, ALLOWED_SEEKING);

  if (Object.keys(update).length === 0) {
    return Response.json({ error: 'No valid fields provided' }, { status: 422 });
  }

  // RLS enforces created_by = auth.uid()
  const { data, error } = await supabase
    .from('projects')
    .update(update)
    .eq('slug', slug)
    .select(PROJECT_SELECT)
    .single();

  if (error) {
    console.error('PATCH /api/projects/[slug] error:', error);
    return Response.json({ error: 'Update failed', detail: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: 'Not found or forbidden' }, { status: 404 });
  }

  return Response.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RLS enforces created_by = auth.uid()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.error('DELETE /api/projects/[slug] error:', error);
    return Response.json({ error: 'Delete failed', detail: error.message }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
