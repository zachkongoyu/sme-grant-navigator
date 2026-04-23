import { describe, expect, it } from 'vitest';

import { easyBudScheme } from './easy-bud';
import { mergeSchemesWithDatabaseRows, type SchemeRow } from './db';

describe('mergeSchemesWithDatabaseRows', () => {
  it('overrides display fields from the database while preserving static metadata', () => {
    const rows: ReadonlyArray<SchemeRow> = [
      {
        id: 'db-easy-bud',
        name: easyBudScheme.name,
        sponsor: 'Hong Kong Productivity Council',
        category: 'Export',
        status: 'closed',
        funding_cap: 123456,
        currency: 'HKD',
        duration_months: 18,
        short_description: 'Live description from Supabase.',
        guidance_md: 'Live guidance',
        source_url: 'https://example.com/easy-bud',
        updated_at: '2026-04-24T00:00:00.000Z',
      },
    ];

    const [scheme] = mergeSchemesWithDatabaseRows(rows);

    expect(scheme).toBeDefined();
    expect(scheme?.id).toBe(easyBudScheme.id);
    expect(scheme?.name).toBe(easyBudScheme.name);
    expect(scheme?.shortDescription).toBe('Live description from Supabase.');
    expect(scheme?.category).toBe('Export');
    expect(scheme?.status).toBe('closed');
    expect(scheme?.fundingCap).toBe(123456);
    expect(scheme?.durationMonths).toBe(18);
    expect(scheme?.documentChecklist).toEqual(easyBudScheme.documentChecklist);
    expect(scheme?.links).toEqual([
      {
        label: 'https://example.com/easy-bud',
        url: 'https://example.com/easy-bud',
      },
    ]);
  });
});