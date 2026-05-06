import { getSupabase } from '.';

export interface SchemeRow {
  readonly id: string;              // text slug e.g. 'hk.bud-easy'
  readonly name: string;
  readonly administrator: string | null;
  readonly jurisdiction: string;
  readonly status: string | null;
  readonly currency: string | null;
  readonly max_funding: number | null;
  readonly next_deadline: string | null;
  readonly corpus: string | null;
  readonly version: number;
  readonly last_updated: string | null;
  readonly source_url: string | null;
}

export async function fetchSchemeRows(): Promise<ReadonlyArray<SchemeRow> | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('schemes')
      .select(
        'id, name, administrator, jurisdiction, status, currency, max_funding, next_deadline, corpus, version, last_updated, source_url',
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
