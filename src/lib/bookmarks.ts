const BOOKMARKS_STORAGE_KEY = 'sme-grant-navigator.bookmarks';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function parseStoredBookmarks(rawValue: string | null): ReadonlyArray<string> {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const ids = parsed.filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );

    return Array.from(new Set(ids));
  } catch {
    return [];
  }
}

function resolveStorage(storage?: StorageLike): StorageLike | null {
  if (storage) {
    return storage;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function getBookmarkedSchemeIds(storage?: StorageLike): ReadonlyArray<string> {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) {
    return [];
  }

  return parseStoredBookmarks(resolvedStorage.getItem(BOOKMARKS_STORAGE_KEY));
}

export function getBookmarkCount(storage?: StorageLike): number {
  return getBookmarkedSchemeIds(storage).length;
}

export function isSchemeBookmarked(
  schemeId: string,
  storage?: StorageLike,
): boolean {
  return getBookmarkedSchemeIds(storage).includes(schemeId);
}

export interface ToggleBookmarkResult {
  readonly isBookmarked: boolean;
  readonly count: number;
  readonly ids: ReadonlyArray<string>;
}

export function toggleSchemeBookmark(
  schemeId: string,
  storage?: StorageLike,
): ToggleBookmarkResult {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) {
    return {
      isBookmarked: false,
      count: 0,
      ids: [],
    };
  }

  const currentIds = getBookmarkedSchemeIds(resolvedStorage);
  const currentSet = new Set(currentIds);
  const shouldAdd = !currentSet.has(schemeId);

  if (shouldAdd) {
    currentSet.add(schemeId);
  } else {
    currentSet.delete(schemeId);
  }

  const nextIds = Array.from(currentSet);
  resolvedStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(nextIds));

  return {
    isBookmarked: shouldAdd,
    count: nextIds.length,
    ids: nextIds,
  };
}
