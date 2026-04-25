import type { Scheme } from '@/types';

// Minimal static fallback used when the database is unreachable.
export const schemes: ReadonlyArray<Scheme> = [
  {
    id: 'innovation-fund',
    name: 'Innovation Grant',
    shortDescription:
      'Funding for R&D-led SMEs developing new products, processes, or services with commercial potential.',
    category: 'Innovation',
    status: 'active',
    fundingCap: 250000,
    currency: 'USD',
    durationMonths: 18,
    links: [{ label: 'Programme overview', url: '#' }],
  },
  {
    id: 'export-support',
    name: 'Export Development Fund',
    shortDescription:
      'Supports SMEs expanding into new international markets through market development and promotional activities.',
    category: 'Export',
    status: 'coming-soon',
    fundingCap: 100000,
    currency: 'USD',
    durationMonths: 12,
    links: [{ label: 'Programme overview', url: '#' }],
  },
  {
    id: 'startup-incubator',
    name: 'Startup Incubator Programme',
    shortDescription:
      'Structured support for early-stage startups including mentorship, co-working space, and seed funding.',
    category: 'Incubation',
    status: 'coming-soon',
    fundingCap: null,
    currency: null,
    durationMonths: 12,
    links: [{ label: 'Programme overview', url: '#' }],
  },
  {
    id: 'digital-transform',
    name: 'Digital Transformation Subsidy',
    shortDescription:
      'Subsidises adoption of digital tools and platforms that improve SME operational efficiency.',
    category: 'Innovation',
    status: 'coming-soon',
    fundingCap: 50000,
    currency: 'USD',
    durationMonths: 6,
    links: [{ label: 'Programme overview', url: '#' }],
  },
  {
    id: 'creative-fund',
    name: 'Creative Industries Fund',
    shortDescription:
      'Supports businesses in design, media, arts, and cultural sectors to develop commercially viable projects.',
    category: 'Creative',
    status: 'coming-soon',
    fundingCap: 75000,
    currency: 'USD',
    durationMonths: 12,
    links: [{ label: 'Programme overview', url: '#' }],
  },
  {
    id: 'trade-support',
    name: 'Trade Support Scheme',
    shortDescription:
      'Broad-based funding for market access, brand development, and sales promotion activities targeting new regions.',
    category: 'Trade Support',
    status: 'coming-soon',
    fundingCap: 200000,
    currency: 'USD',
    durationMonths: 24,
    links: [{ label: 'Programme overview', url: '#' }],
  },
];
