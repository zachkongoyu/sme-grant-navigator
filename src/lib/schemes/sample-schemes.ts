import type { Scheme } from '@/types';

function createSampleScheme(
  id: string,
  name: string,
  category: Scheme['category'],
  shortDescription: string,
  fundingCap: number | null,
  moreUrl: string,
  status: Scheme['status'] = 'coming-soon',
): Scheme {
  return {
    id,
    name,
    category,
    shortDescription,
    status,
    fundingCap,
    currency: 'HKD',
    durationMonths: null,
    eligibility: [],
    activityTypes: [],
    approvedMarkets: null,
    intakeFields: [],
    promptTemplateId: null,
    documentChecklist: [],
    links: [
      {
        label: 'SMELink scheme page',
        url: moreUrl,
      },
    ],
  };
}

export const sampleSchemes = [
  createSampleScheme(
    'sme-export-marketing-fund',
    'SME Export Marketing Fund',
    'Export',
    'Trade and Industry Department scheme supporting SMEs to join export promotion activities and expand outside Hong Kong.',
    1000000,
    'https://www.smelink.gov.hk/en/web/sme-portal/w/sme-export-marketing-fund.html',
  ),
  createSampleScheme(
    'dedicated-fund-bud',
    'Dedicated Fund on Branding, Upgrading and Domestic Sales (BUD Fund)',
    'BUD Fund',
    'HKPC-administered scheme funding non-listed Hong Kong enterprises to develop brands, upgrade operations, and promote sales in eligible markets.',
    7000000,
    'https://www.smelink.gov.hk/en/web/sme-portal/w/dedicated-fund-on-branding-upgrading-and-domestic-sales.html',
  ),
  createSampleScheme(
    'trade-and-industrial-organisation-support-fund',
    'Trade and Industrial Organisation Support Fund',
    'Organisation Support',
    'Trade and Industry Department fund supporting non-profit organisations to run projects that improve competitiveness of Hong Kong enterprises.',
    5000000,
    'https://www.smelink.gov.hk/en/web/sme-portal/w/trade-and-industrial-organisation-support-fund.html',
  ),
  createSampleScheme(
    'sme-financing-guarantee-scheme',
    'SME Financing Guarantee Scheme',
    'Financing',
    'HKMC Insurance scheme helping local SMEs and non-listed enterprises obtain lending support for business needs.',
    18000000,
    'https://www.smelink.gov.hk/en/web/sme-portal/w/sme-financing-guarantee-scheme.html',
  ),
  createSampleScheme(
    'enterprise-support-scheme',
    'Enterprise Support Scheme',
    'Innovation',
    'Innovation and Technology Commission support for local companies to conduct in-house R&D and increase private-sector innovation investment.',
    10000000,
    'https://www.smelink.gov.hk/en/web/sme-portal/w/enterprise-support-scheme.html',
  ),
  createSampleScheme(
    'arts-capacity-development-funding-scheme',
    'Arts Capacity Development Funding Scheme',
    'Creative',
    'Culture, Sports and Tourism Bureau scheme to strengthen Hong Kong cultural software and build capacity in the arts sector.',
    5500000,
    'https://www.smelink.gov.hk/en/web/sme-portal/w/arts-capacity-development-funding-scheme.html',
  ),
] as const satisfies ReadonlyArray<Scheme>;