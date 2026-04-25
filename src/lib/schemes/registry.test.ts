import { describe, expect, it } from 'vitest';

import { getActiveSchemes, getAllSchemes, getSchemeById } from './registry';

describe('scheme registry', () => {
  it('returns the full registered scheme list', () => {
    expect(getAllSchemes()).toHaveLength(6);
  });

  it('returns only active schemes', () => {
    expect(getActiveSchemes().map((scheme) => scheme.id)).toEqual(['easy-bud']);
  });

  it('looks up Easy BUD with the expected funding metadata', () => {
    const scheme = getSchemeById('easy-bud');

    expect(scheme).toBeDefined();
    expect(scheme?.name).toBe('Easy BUD');
    expect(scheme?.fundingCap).toBe(100000);
    expect(scheme?.durationMonths).toBe(12);
    expect(scheme?.status).toBe('active');
  });
});