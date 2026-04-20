import type { Scheme } from '@/types';

export const budGeneralScheme: Scheme = {
  id: 'bud-general',
  name: 'BUD Fund (General Application)',
  shortDescription:
    'Full BUD track for larger market-expansion projects with longer timelines and deeper supporting documents.',
  category: 'BUD Fund',
  status: 'coming-soon',
  fundingCap: 800000,
  currency: 'HKD',
  durationMonths: 24,
  eligibility: [],
  activityTypes: [],
  approvedMarkets: null,
  intakeFields: [],
  promptTemplateId: null,
  documentChecklist: [],
  links: [
    {
      label: 'BUD Fund official portal',
      url: 'https://www.bud.hkpc.org/',
    },
  ],
};