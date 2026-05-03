import { describe, expect, it } from 'vitest';

import { schemesFromRows } from '.';
import type { SchemeRow } from '@/lib/supabase/schemes';

describe('schemesFromRows', () => {
  it('maps database rows to resolved schemes', () => {
    const rows: ReadonlyArray<SchemeRow> = [
      {
        id: 'db-easy-bud',
        slug: null,
        name: 'Innovation Grant',
        administrator: 'Innovation Agency',
        category: 'Export',
        status: 'closed',
        funding_cap: 123456,
        currency: 'USD',
        duration_months: 18,
        short_description: 'Live description from Supabase.',
        corpus: 'Live guidance',
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
    expect(scheme?.corpus).toBe('Live guidance');
    expect(scheme?.links).toEqual([
      {
        label: 'Official programme page',
        url: 'https://example.com/easy-bud',
      },
    ]);
  });
});