import type { Scheme, SchemeCategory, SchemeStatus } from '@/types';

import { fetchSchemeRows, type SchemeRow } from '@/lib/supabase/schemes';

export type { SchemeRow };

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

const schemeStatuses = ['open', 'coming-soon', 'closed'] as const satisfies ReadonlyArray<SchemeStatus>;

function isSchemeCategory(value: string): value is SchemeCategory {
  return (schemeCategories as ReadonlyArray<string>).includes(value);
}

function isSchemeStatus(value: string): value is SchemeStatus {
  return (schemeStatuses as ReadonlyArray<string>).includes(value);
}

function rowToScheme(row: SchemeRow): Scheme {
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
    draftable: status === 'open' && Boolean(row.corpus?.trim()),
    databaseId: row.id,
    corpus: row.corpus,
    sourceUrl: row.source_url,
    administrator: row.administrator,
    updatedAt: row.updated_at,
  };
}

export function schemesFromRows(rows: ReadonlyArray<SchemeRow>): ReadonlyArray<Scheme> {
  return rows.map((row) => rowToScheme(row));
}

export async function listSchemes(): Promise<ReadonlyArray<Scheme>> {
  const rows = await fetchSchemeRows();
  if (!rows) return [];
  return schemesFromRows(rows);
}

export async function getScheme(schemeId: string): Promise<Scheme | undefined> {
  const schemes = await listSchemes();
  return schemes.find((s) => s.id === schemeId);
}

export async function getSchemeContext(schemeId: string): Promise<Scheme | undefined> {
  return getScheme(schemeId);
}
