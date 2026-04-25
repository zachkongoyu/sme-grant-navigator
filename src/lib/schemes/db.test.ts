import { describe, expect, it } from 'vitest';

import { schemesFromRows, type SchemeRow } from './db';

describe('schemesFromRows', () => {
  it('maps database rows to resolved schemes', () => {
    const rows: ReadonlyArray<SchemeRow> = [
      {
        id: 'db-easy-bud',
        name: 'Innovation Grant',
        sponsor: 'Innovation Agency',
        category: 'Export',
        status: 'closed',
        funding_cap: 123456,
        currency: 'USD',
        duration_months: 18,
        short_description: 'Live description from Supabase.',
        guidance_md: 'Live guidance',
        source_url: 'https://example.com/easy-bud',
        updated_at: '2026-04-24T00:00:00.000Z',
      },
    ];

    const [scheme] = schemesFromRows(rows);

    expect(scheme).toBeDefined();
    expect(scheme?.id).toBe('db-easy-bud');
    expect(scheme?.name).toBe('Innovation Grant');
    expect(scheme?.shortDescription).toBe('Live description from Supabase.');
    expect(scheme?.category).toBe('Export');
    expect(scheme?.status).toBe('closed');
    expect(scheme?.fundingCap).toBe(123456);
    expect(scheme?.durationMonths).toBe(18);
    expect(scheme?.guidanceMarkdown).toBe('Live guidance');
    expect(scheme?.links).toEqual([
      {
        label: 'https://example.com/easy-bud',
        url: 'https://example.com/easy-bud',
      },
    ]);
  });
});