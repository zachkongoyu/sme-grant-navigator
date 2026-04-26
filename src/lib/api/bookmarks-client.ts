import { readErrorMessage } from '@/lib/api/shared';

export async function fetchBookmarks(): Promise<ReadonlyArray<string>> {
  const response = await fetch('/api/bookmarks');
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not load bookmarks'));
  }

  return (await response.json()) as ReadonlyArray<string>;
}

export async function updateBookmark(
  schemeId: string,
  bookmarked: boolean,
): Promise<void> {
  const response = await fetch('/api/bookmarks', {
    method: bookmarked ? 'POST' : 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schemeId }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not update bookmark'));
  }
}