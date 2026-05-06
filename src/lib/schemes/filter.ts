import type { Scheme } from '@/types';

export function filterSchemes(
  schemes: ReadonlyArray<Scheme>,
  query: string,
): ReadonlyArray<Scheme> {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) return schemes;

  return schemes.filter((scheme) =>
    scheme.name.toLowerCase().includes(normalizedQuery) ||
    (scheme.administrator ?? '').toLowerCase().includes(normalizedQuery),
  );
}

export function groupSchemesByJurisdiction(
  schemes: ReadonlyArray<Scheme>,
): ReadonlyArray<readonly [string, ReadonlyArray<Scheme>]> {
  const grouped = new Map<string, Scheme[]>();

  for (const scheme of schemes) {
    const items = grouped.get(scheme.jurisdiction) ?? [];
    items.push(scheme);
    grouped.set(scheme.jurisdiction, items);
  }

  return Array.from(grouped.entries()).sort(([left], [right]) => left.localeCompare(right));
}