import { NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/types';
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

export async function POST(req: NextRequest) {
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

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return Response.json({ error: 'name is required' }, { status: 422 });
  }

  // Slug: use provided or generate from name; ensure uniqueness
  let slug = typeof body.slug === 'string' ? slugify(body.slug) : slugify(name);
  if (!slug) {
    return Response.json({ error: 'Could not derive slug from name' }, { status: 422 });
  }

  // Check uniqueness; append suffix if taken
  const { count } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug);

  if ((count ?? 0) > 0) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const stage = typeof body.stage === 'string' && ALLOWED_STAGES.has(body.stage) ? body.stage : null;

  const payload: Omit<Project, 'id' | 'created_at' | 'updated_at'> = {
    slug,
    created_by: user.id,
    makers: [user.id],
    name,
    tagline: typeof body.tagline === 'string' ? body.tagline.trim() || null : null,
    description: typeof body.description === 'string' ? body.description.trim() || null : null,
    web_url: safeUrl(body.web_url),
    app_store_url: safeUrl(body.app_store_url),
    play_store_url: safeUrl(body.play_store_url),
    media_url: safeUrl(body.media_url),
    thumbnail_url: safeUrl(body.thumbnail_url),
    stage: stage as Project['stage'],
    status: 'draft',
    platform: filterArray(body.platform, ALLOWED_PLATFORMS),
    sector: filterArray(body.sector, ALLOWED_SECTORS),
    seeking: filterArray(body.seeking, ALLOWED_SEEKING),
    traction: typeof body.traction === 'string' ? body.traction.trim() || null : null,
    contact_url: safeUrl(body.contact_url),
  };

  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select(PROJECT_SELECT)
    .single();

  if (error) {
    console.error('POST /api/projects error:', error);
    return Response.json({ error: 'Insert failed', detail: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
