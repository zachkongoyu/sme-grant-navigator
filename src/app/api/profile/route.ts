import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('credits_balance, free_checks_used')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    console.error('GET /api/profile error:', error);
    return Response.json({ error: 'Profile not found', detail: error?.message }, { status: 404 });
  }

  return Response.json(profile);
}
