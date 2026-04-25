import type { Scheme, SchemeCategory, SchemeStatus } from '@/types';

import { hasCorpus } from '@/lib/schemes/corpus';
import { getSupabase } from '@/lib/supabase';

const schemeCategories = [
  'BUD Fund',
  'Trade Support',
  'Innovation',
  'Incubation',
  'Creative',
  'Financing',
  'Organisation Support',
  'Export',
  'Sustainability',
] as const satisfies ReadonlyArray<SchemeCategory>;

const schemeStatuses = ['open', 'active', 'coming-soon', 'closed'] as const satisfies ReadonlyArray<SchemeStatus>;

export interface SchemeRow {
  readonly id: string;
  readonly slug: string | null;
  readonly name: string;
  readonly sponsor: string | null;
  readonly category: string | null;
  readonly status: string | null;
  readonly funding_cap: number | null;
  readonly currency: string | null;
  readonly duration_months: number | null;
  readonly short_description: string | null;
  readonly guidance_md: string | null;
  readonly source_url: string | null;
  readonly updated_at: string | null;
}

export interface ResolvedScheme extends Scheme {
  readonly databaseId: string | null;
  readonly guidanceMarkdown: string | null;
  readonly sourceUrl: string | null;
  readonly sponsor: string | null;
  readonly updatedAt: string | null;
}

function isSchemeCategory(value: string): value is SchemeCategory {
  return (schemeCategories as ReadonlyArray<string>).includes(value);
}

function isSchemeStatus(value: string): value is SchemeStatus {
  return (schemeStatuses as ReadonlyArray<string>).includes(value);
}

function rowToResolvedScheme(row: SchemeRow): ResolvedScheme {
  const slug = row.slug ?? row.id;
  const status = row.status && isSchemeStatus(row.status) ? row.status : 'coming-soon';
  return {
    id: slug,
    name: row.name,
    shortDescription: row.short_description ?? 'Funding scheme details are being expanded.',
    category: row.category && isSchemeCategory(row.category) ? row.category : 'Innovation',
    status,
    fundingCap: row.funding_cap,
    currency: row.currency,
    durationMonths: row.duration_months,
    links: row.source_url ? [{ label: 'Official programme page', url: row.source_url }] : [],
    draftable: status === 'open' && hasCorpus(slug),
    databaseId: row.id,
    guidanceMarkdown: row.guidance_md,
    sourceUrl: row.source_url,
    sponsor: row.sponsor,
    updatedAt: row.updated_at,
  };
}

export function schemesFromRows(rows: ReadonlyArray<SchemeRow>): ReadonlyArray<ResolvedScheme> {
  return rows.map(rowToResolvedScheme);
}

async function fetchSchemeRows(): Promise<ReadonlyArray<SchemeRow> | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('schemes')
      .select(
        'id, slug, name, sponsor, category, status, funding_cap, currency, duration_months, short_description, guidance_md, source_url, updated_at',
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

export async function getAllSchemesFromDatabase(): Promise<ReadonlyArray<ResolvedScheme>> {
  const rows = await fetchSchemeRows();

  if (!rows) {
    return [];
  }

  return schemesFromRows(rows);
}

export async function getSchemeByIdFromDatabase(
  schemeId: string,
): Promise<ResolvedScheme | undefined> {
  const schemes = await getAllSchemesFromDatabase();
  return schemes.find((scheme) => scheme.id === schemeId);
}
