import { type NextRequest, NextResponse } from 'next/server';

import { getSupabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

const CHAT_ENABLED = process.env.ENABLE_CHAT === 'true';

export async function GET() {
  if (!CHAT_ENABLED) return NextResponse.json(null, { status: 404 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = getSupabase()
    .from('sessions')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    // Anonymous: return empty list — sessions are accessible by direct URL only
    return Response.json([]);
  }

  const { data, error } = await query;

  if (error) {
    console.error('GET /api/sessions error:', error);
    return Response.json({ error: 'Failed to load sessions' }, { status: 500 });
  }

  return Response.json(data ?? []);
}

export async function POST(request: NextRequest) {
  if (!CHAT_ENABLED) return NextResponse.json(null, { status: 404 });
  const body = (await request.json()) as { id: string; title?: string };
  const { id, title } = body;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await getSupabase()
    .from('sessions')
    .insert({ id, title: title ?? 'New session', user_id: user?.id ?? null })
    .select()
    .single();

  if (error) {
    console.error('POST /api/sessions error:', error);
    return Response.json({ error: 'Failed to create session' }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}


