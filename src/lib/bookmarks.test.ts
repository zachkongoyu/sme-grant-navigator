import { describe, expect, it } from 'vitest';

import {
  getBookmarkedSchemeIds,
  getBookmarkCount,
  isSchemeBookmarked,
  toggleSchemeBookmark,
  type StorageLike,
} from './bookmarks';

class MemoryStorage implements StorageLike {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('bookmarks', () => {
  it('starts empty when no data exists', () => {
    const storage = new MemoryStorage();

    expect(getBookmarkedSchemeIds(storage)).toEqual([]);
    expect(getBookmarkCount(storage)).toBe(0);
  });

  it('adds and removes scheme bookmark with accurate count', () => {
    const storage = new MemoryStorage();

    const firstToggle = toggleSchemeBookmark('easy-bud', storage);
    expect(firstToggle.isBookmarked).toBe(true);
    expect(firstToggle.count).toBe(1);
    expect(isSchemeBookmarked('easy-bud', storage)).toBe(true);

    const secondToggle = toggleSchemeBookmark('easy-bud', storage);
    expect(secondToggle.isBookmarked).toBe(false);
    expect(secondToggle.count).toBe(0);
    expect(isSchemeBookmarked('easy-bud', storage)).toBe(false);
  });

  it('deduplicates malformed duplicated stored values', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      'sme-grant-navigator.bookmarks',
      JSON.stringify(['easy-bud', 'easy-bud', 'itf']),
    );

    expect(getBookmarkedSchemeIds(storage)).toEqual(['easy-bud', 'itf']);
    expect(getBookmarkCount(storage)).toBe(2);
  });

  it('returns empty list for invalid json payload', () => {
    const storage = new MemoryStorage();
    storage.setItem('sme-grant-navigator.bookmarks', 'not-json');

    expect(getBookmarkedSchemeIds(storage)).toEqual([]);
  });
});
