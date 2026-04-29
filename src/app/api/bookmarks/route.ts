import { type NextRequest } from 'next/server';

import { getSupabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

// GET /api/bookmarks — returns scheme IDs bookmarked by the current user
export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return Response.json([]);
  }

  const { data, error } = await getSupabase()
    .from('bookmarks')
    .select('scheme_id')
    .eq('user_id', user.id);

  if (error) {
    console.error('GET /api/bookmarks error:', error);
    return Response.json({ error: 'Failed to load bookmarks' }, { status: 500 });
  }

  return Response.json((data ?? []).map((row) => row.scheme_id));
}

// POST /api/bookmarks — add a bookmark
export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { schemeId } = (await request.json()) as { schemeId: string };

  if (!schemeId) {
    return Response.json({ error: 'schemeId is required' }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from('bookmarks')
    .upsert({ user_id: user.id, scheme_id: schemeId });

  if (error) {
    console.error('POST /api/bookmarks error:', error);
    return Response.json({ error: 'Failed to save bookmark' }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}

// DELETE /api/bookmarks — remove a bookmark
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { schemeId } = (await request.json()) as { schemeId: string };

  if (!schemeId) {
    return Response.json({ error: 'schemeId is required' }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from('bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('scheme_id', schemeId);

  if (error) {
    console.error('DELETE /api/bookmarks error:', error);
    return Response.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
