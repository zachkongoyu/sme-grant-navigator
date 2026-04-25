import { type NextRequest, NextResponse } from 'next/server';

import { getSupabase } from '@/lib/supabase';

const CHAT_ENABLED = process.env.ENABLE_CHAT === 'true';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!CHAT_ENABLED) return NextResponse.json(null, { status: 404 });

  const { id } = await params;

  const { data, error } = await getSupabase()
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(data);
}

