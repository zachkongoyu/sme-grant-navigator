import { describe, expect, it } from 'vitest';

import { schemesFromRows } from '.';
import type { SchemeRow } from '@/lib/supabase/schemes';

describe('schemesFromRows', () => {
  it('maps database rows to resolved schemes', () => {
    const rows: ReadonlyArray<SchemeRow> = [
      {
        id: 'hk.bud-easy',
        name: 'Innovation Grant',
        administrator: 'Innovation Agency',
        jurisdiction: 'HK',
        status: 'closed',
        max_funding: 123456,
        currency: 'USD',
        next_deadline: null,
        corpus: 'Live guidance',
        version: 1,
        last_updated: '2026-04-24T00:00:00.000Z',
        source_url: 'https://example.com/easy-bud',
      },
    ];

    const [scheme] = schemesFromRows(rows);

    expect(scheme).toBeDefined();
    expect(scheme?.id).toBe('hk.bud-easy');
    expect(scheme?.name).toBe('Innovation Grant');
    expect(scheme?.status).toBe('closed');
    expect(scheme?.maxFunding).toBe(123456);
    expect(scheme?.jurisdiction).toBe('HK');
    expect(scheme?.corpus).toBe('Live guidance');
    expect(scheme?.links).toEqual([
      {
        label: 'Official programme page',
        url: 'https://example.com/easy-bud',
      },
    ]);
  });
});