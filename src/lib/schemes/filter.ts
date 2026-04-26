import type { Scheme, SchemeCategory } from '@/types';

export type SchemeFilter = 'All' | SchemeCategory;

export function filterSchemes(
  schemes: ReadonlyArray<Scheme>,
  query: string,
  selectedCategory: SchemeFilter = 'All',
): ReadonlyArray<Scheme> {
  const normalizedQuery = query.trim().toLowerCase();

  return schemes.filter((scheme) => {
    const matchesCategory =
      selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      scheme.name.toLowerCase().includes(normalizedQuery) ||
      scheme.shortDescription.toLowerCase().includes(normalizedQuery) ||
      scheme.category.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });
}

export function groupSchemesByCategory(
  schemes: ReadonlyArray<Scheme>,
): ReadonlyArray<readonly [SchemeCategory, ReadonlyArray<Scheme>]> {
  const grouped = new Map<SchemeCategory, Scheme[]>();

  for (const scheme of schemes) {
    const items = grouped.get(scheme.category) ?? [];
    items.push(scheme);
    grouped.set(scheme.category, items);
  }

  return Array.from(grouped.entries()).sort(([left], [right]) => left.localeCompare(right));
}