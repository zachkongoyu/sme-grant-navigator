import { getSupabase } from '.';

export interface SchemeRow {
  readonly id: string;
  readonly slug: string | null;
  readonly name: string;
  readonly administrator: string | null;
  readonly category: string | null;
  readonly status: string | null;
  readonly funding_cap: number | null;
  readonly currency: string | null;
  readonly duration_months: number | null;
  readonly short_description: string | null;
  readonly corpus: string | null;
  readonly source_url: string | null;
  readonly updated_at: string | null;
}

export async function fetchSchemeRows(): Promise<ReadonlyArray<SchemeRow> | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('schemes')
      .select(
        'id, slug, name, administrator, category, status, funding_cap, currency, duration_months, short_description, corpus, source_url, updated_at',
      )
      .order('name');

    if (error) {
      console.error('Failed to load schemes from Supabase:', error);
      return null;
    }

    return (data ?? []) as ReadonlyArray<SchemeRow>;
  } catch (error) {
    console.error('Unexpected scheme catalog load failure:', error);
    return null;
  }
}
