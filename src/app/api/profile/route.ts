import { NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

const PROFILE_SELECT =
  'id, credits_balance, free_checks_used, display_name, headline, bio, roles, location, links, is_public, entity_type';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    console.error('GET /api/profile error:', error);
    return Response.json({ error: 'Profile not found', detail: error?.message }, { status: 404 });
  }

  return Response.json(profile);
}

const IDENTITY_FIELDS = [
  'display_name',
  'headline',
  'bio',
  'roles',
  'location',
  'links',
  'is_public',
  'entity_type',
] as const;

type IdentityField = (typeof IDENTITY_FIELDS)[number];

export async function PATCH(req: NextRequest) {
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

  const update: Partial<Record<IdentityField, unknown>> = {};
  for (const field of IDENTITY_FIELDS) {
    if (field in body) {
      update[field] = body[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)
    .select(PROFILE_SELECT)
    .single();

  if (error || !profile) {
    console.error('PATCH /api/profile error:', error);
    return Response.json({ error: 'Update failed', detail: error?.message }, { status: 500 });
  }

  return Response.json(profile);
}
