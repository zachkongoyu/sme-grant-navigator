import type { Scheme } from '@/types';

// Minimal static fallback used when Supabase is unreachable.
// Scheme rules, eligibility, and document requirements are fetched JIT by the agent at runtime.
export const schemes: ReadonlyArray<Scheme> = [
  {
    id: 'easy-bud',
    name: 'Easy BUD',
    shortDescription:
      'Simplified BUD Fund track for self-implemented export and market-development projects into approved markets.',
    category: 'BUD Fund',
    status: 'active',
    fundingCap: 100000,
    currency: 'HKD',
    durationMonths: 12,
    links: [{ label: 'BUD Fund official portal', url: 'https://www.bud.hkpc.org/' }],
  },
  {
    id: 'bud-general',
    name: 'BUD Fund (General Application)',
    shortDescription:
      'Full BUD track for larger market-expansion projects with longer timelines and deeper supporting documents.',
    category: 'BUD Fund',
    status: 'coming-soon',
    fundingCap: 800000,
    currency: 'HKD',
    durationMonths: 24,
    links: [{ label: 'BUD Fund official portal', url: 'https://www.bud.hkpc.org/' }],
  },
  {
    id: 'bud-ecommerce-easy',
    name: 'BUD Fund (E-commerce Easy)',
    shortDescription:
      'Streamlined BUD e-commerce track for online sales channel buildout into target markets.',
    category: 'BUD Fund',
    status: 'coming-soon',
    fundingCap: 800000,
    currency: 'HKD',
    durationMonths: 24,
    links: [{ label: 'BUD Fund official portal', url: 'https://www.bud.hkpc.org/' }],
  },
  {
    id: 'itf',
    name: 'Innovation and Technology Fund',
    shortDescription:
      'Innovation funding programmes for R&D-led SMEs, prototypes, and commercialisation workstreams.',
    category: 'Innovation',
    status: 'coming-soon',
    fundingCap: null,
    currency: 'HKD',
    durationMonths: null,
    links: [{ label: 'ITF official site', url: 'https://www.itf.gov.hk/' }],
  },
  {
    id: 'hkstp',
    name: 'HKSTP Incubation Programmes',
    shortDescription:
      'Incubation pathways for Hong Kong startups needing structured support, grants, and commercialisation guidance.',
    category: 'Incubation',
    status: 'coming-soon',
    fundingCap: null,
    currency: 'HKD',
    durationMonths: null,
    links: [{ label: 'HKSTP official site', url: 'https://www.hkstp.org/' }],
  },
  {
    id: 'createsmart',
    name: 'CreateSmart Initiative',
    shortDescription:
      'Creative-industry support for projects that grow Hong Kong design, branding, and cultural business capabilities.',
    category: 'Creative',
    status: 'coming-soon',
    fundingCap: null,
    currency: 'HKD',
    durationMonths: null,
    links: [{ label: 'CreateHK official site', url: 'https://www.createhk.gov.hk/' }],
  },
];
