import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

function corpusPath(slug: string): string {
  return path.join(process.cwd(), 'src/lib/schemes/corpus', `${slug}.md`);
}

export function hasCorpus(slug: string): boolean {
  return existsSync(corpusPath(slug));
}

export async function loadCorpus(slug: string): Promise<string | null> {
  try {
    return await readFile(corpusPath(slug), 'utf-8');
  } catch {
    return null;
  }
}
