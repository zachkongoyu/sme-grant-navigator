import type { Scheme, SchemeStatus } from '@/types';

import { fetchSchemeRows, type SchemeRow } from '@/lib/supabase/schemes';

export type { SchemeRow };

const schemeStatuses = ['open', 'coming-soon', 'closed'] as const satisfies ReadonlyArray<SchemeStatus>;

function isSchemeStatus(value: string): value is SchemeStatus {
  return (schemeStatuses as ReadonlyArray<string>).includes(value);
}

function rowToScheme(row: SchemeRow): Scheme {
  const status = row.status && isSchemeStatus(row.status) ? row.status : 'coming-soon';
  return {
    id: row.id,
    name: row.name,
    status,
    maxFunding: row.max_funding,
    currency: row.currency,
    links: row.source_url ? [{ label: 'Official programme page', url: row.source_url }] : [],
    corpus: row.corpus,
    sourceUrl: row.source_url,
    administrator: row.administrator,
    updatedAt: row.last_updated,
    jurisdiction: row.jurisdiction,
    nextDeadline: row.next_deadline,
    version: row.version,
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
