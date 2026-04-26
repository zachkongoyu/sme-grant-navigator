import type { ResolvedScheme } from '@/lib/schemes/db';
import {
  getAllSchemesFromDatabase,
  getSchemeByIdFromDatabase,
} from '@/lib/schemes/db';
import { loadCorpus } from '@/lib/schemes/corpus';

export interface ResolvedSchemeDocument {
  readonly scheme: ResolvedScheme;
  readonly corpus: string | null;
}

export async function getAllSchemes(): Promise<ReadonlyArray<ResolvedScheme>> {
  return getAllSchemesFromDatabase();
}

export async function getSchemeById(
  schemeId: string,
): Promise<ResolvedScheme | undefined> {
  return getSchemeByIdFromDatabase(schemeId);
}

export async function getSchemeDocument(
  schemeId: string,
): Promise<ResolvedSchemeDocument | undefined> {
  const scheme = await getSchemeByIdFromDatabase(schemeId);
  if (!scheme) return undefined;

  const corpus = await loadCorpus(schemeId);
  return { scheme, corpus };
}