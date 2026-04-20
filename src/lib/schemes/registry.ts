import type { Scheme, SchemeCategory, SchemeId } from '@/types';

import { schemes } from './index';

const schemeMap = new Map<SchemeId, Scheme>(
  schemes.map((scheme) => [scheme.id, scheme]),
);

export function getAllSchemes(): ReadonlyArray<Scheme> {
  return schemes;
}

export function getSchemeById(id: SchemeId): Scheme | undefined {
  return schemeMap.get(id);
}

export function getSchemesByCategory(
  category: SchemeCategory,
): ReadonlyArray<Scheme> {
  return schemes.filter((scheme) => scheme.category === category);
}

export function getActiveSchemes(): ReadonlyArray<Scheme> {
  return schemes.filter((scheme) => scheme.status === 'active');
}