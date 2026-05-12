import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

interface SectionUpdate {
  readonly id?: string;
  readonly scheme_id: string;
  readonly locale: string;
  readonly section_key: string;
  readonly title: string;
  readonly content: string;
  readonly display_order: number;
  readonly is_list: boolean;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schemeId: string }> },
) {
  const { schemeId } = await params;

  let body: { sections: SectionUpdate[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { sections } = body;
  if (!Array.isArray(sections) || sections.length === 0) {
    return NextResponse.json({ error: 'sections array required' }, { status: 400 });
  }

  // Validate all sections belong to the schemeId in the URL
  for (const s of sections) {
    if (s.scheme_id !== schemeId) {
      return NextResponse.json(
        { error: `Section scheme_id mismatch: ${s.scheme_id} !== ${schemeId}` },
        { status: 400 },
      );
    }
  }

  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('scheme_sections')
      .upsert(sections, { onConflict: 'scheme_id,locale,section_key' });

    if (error) {
      console.error('Failed to upsert sections:', error);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, updated: sections.length });
  } catch (error) {
    console.error('Unexpected section update failure:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
