import { describe, expect, it } from 'vitest';

import { getActiveSchemes, getAllSchemes, getSchemeById } from './registry';

describe('scheme registry', () => {
  it('returns the full registered scheme list', () => {
    expect(getAllSchemes()).toHaveLength(6);
  });

  it('returns only active schemes', () => {
    expect(getActiveSchemes().map((scheme) => scheme.id)).toEqual(['innovation-fund']);
  });

  it('looks up the Innovation Grant with the expected funding metadata', () => {
    const scheme = getSchemeById('innovation-fund');

    expect(scheme).toBeDefined();
    expect(scheme?.name).toBe('Innovation Grant');
    expect(scheme?.fundingCap).toBe(250000);
    expect(scheme?.durationMonths).toBe(18);
    expect(scheme?.status).toBe('active');
  });
});