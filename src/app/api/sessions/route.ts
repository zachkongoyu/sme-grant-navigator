import { type NextRequest } from 'next/server';

import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await getSupabase()
    .from('sessions')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('GET /api/sessions error:', error);
    return Response.json({ error: 'Failed to load sessions' }, { status: 500 });
  }

  return Response.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { id: string; title?: string };
  const { id, title } = body;

  const { data, error } = await getSupabase()
    .from('sessions')
    .insert({ id, title: title ?? 'New session' })
    .select()
    .single();

  if (error) {
    console.error('POST /api/sessions error:', error);
    return Response.json({ error: 'Failed to create session' }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}

