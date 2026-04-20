import type {
  ActivityType,
  IntakeFieldConfig,
  IntakeFieldOption,
  Scheme,
} from '@/types';

const easyBudMarkets = [
  'Mainland China',
  'Singapore',
  'Malaysia',
  'Thailand',
  'Indonesia',
  'Vietnam',
  'Philippines',
  'Japan',
  'South Korea',
  'United Kingdom',
  'United Arab Emirates',
  'Australia',
] as const;

const activityOptions: ReadonlyArray<IntakeFieldOption> = [
  { label: 'Advertisements in target market', value: 'advertisements' },
  { label: 'Exhibition participation', value: 'exhibitions' },
  { label: 'IP registration in target market', value: 'ip-registration' },
  { label: 'Testing and certification', value: 'testing-certification' },
  { label: 'Mobile app development', value: 'mobile-app' },
  { label: 'Website development or enhancement', value: 'website' },
  { label: 'Promotional materials', value: 'promotional-materials' },
  { label: 'Online sales platform', value: 'online-sales-platform' },
] as const;

const marketOptions: ReadonlyArray<IntakeFieldOption> = easyBudMarkets.map((market) => ({
  label: market,
  value: market,
}));

const intakeFields: ReadonlyArray<IntakeFieldConfig> = [
  {
    id: 'companyName',
    label: 'Company name',
    type: 'text',
    required: true,
    placeholder: 'Acme Trading (HK) Limited',
  },
  {
    id: 'businessRegistrationNumber',
    label: 'Business Registration number',
    type: 'text',
    required: true,
    placeholder: '12345678-000',
  },
  {
    id: 'industry',
    label: 'Industry / sector',
    type: 'text',
    required: true,
    placeholder: 'Consumer goods, manufacturing, retail, SaaS',
  },
  {
    id: 'employeeCount',
    label: 'Number of employees',
    type: 'number',
    required: true,
  },
  {
    id: 'annualTurnover',
    label: 'Annual turnover (HKD)',
    type: 'number',
    required: true,
  },
  {
    id: 'isListedCompany',
    label: 'Is the company listed?',
    type: 'checkbox',
    required: true,
    description: 'Easy BUD is only open to non-listed enterprises.',
  },
  {
    id: 'hasSubstantiveOperationsInHongKong',
    label: 'Does the business have substantive operations in Hong Kong?',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'targetMarkets',
    label: 'Target markets',
    type: 'multiselect',
    required: true,
    options: marketOptions,
  },
  {
    id: 'plannedActivities',
    label: 'Planned Easy BUD activities',
    type: 'multiselect',
    required: true,
    options: activityOptions,
  },
  {
    id: 'estimatedProjectBudget',
    label: 'Estimated total project budget (HKD)',
    type: 'number',
    required: true,
  },
  {
    id: 'projectDurationMonths',
    label: 'Project duration (months)',
    type: 'number',
    required: true,
    description: 'Easy BUD projects must finish within 12 months. No extensions.',
  },
  {
    id: 'businessGoal',
    label: 'Business goal',
    type: 'textarea',
    required: true,
    placeholder: 'Enter the Guangdong market with our skincare brand.',
  },
  {
    id: 'hasPriorBudFunding',
    label: 'Has the company received BUD funding before?',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'currentBudProjectsFunding',
    label: 'Current on-going BUD funding (HKD)',
    type: 'number',
    required: false,
    description: 'Used to flag proximity to the HK$800K concurrent cap.',
  },
  {
    id: 'cumulativeBudFundingReceived',
    label: 'Approximate cumulative BUD funding received (HKD)',
    type: 'number',
    required: false,
    description: 'Used to flag proximity to the HK$7M lifetime cap.',
  },
] as const;

const easyBudActivities: ReadonlyArray<ActivityType> = activityOptions.map(
  (option) => option.value as ActivityType,
);

export const easyBudScheme: Scheme = {
  id: 'easy-bud',
  name: 'Easy BUD',
  shortDescription:
    'Simplified BUD Fund track for self-implemented export and market-development projects into approved markets.',
  category: 'BUD Fund',
  status: 'active',
  fundingCap: 100000,
  currency: 'HKD',
  durationMonths: 12,
  eligibility: [
    {
      field: 'employeeCount',
      operator: 'lte',
      value: 100,
      message: 'Easy BUD is limited to enterprises with 100 or fewer employees.',
    },
    {
      field: 'isListedCompany',
      operator: 'eq',
      value: false,
      message: 'Listed companies are not eligible for Easy BUD.',
    },
    {
      field: 'hasSubstantiveOperationsInHongKong',
      operator: 'eq',
      value: true,
      message: 'Applicants must show substantive operations in Hong Kong.',
    },
    {
      field: 'projectDurationMonths',
      operator: 'lte',
      value: 12,
      message: 'Easy BUD projects must complete within 12 months.',
    },
  ],
  activityTypes: easyBudActivities,
  approvedMarkets: easyBudMarkets,
  intakeFields,
  promptTemplateId: 'easy-bud',
  documentChecklist: [
    {
      id: 'business-registration-certificate',
      label: 'Business Registration Certificate',
      stage: 'application',
    },
    {
      id: 'certificate-of-incorporation',
      label: 'Certificate of Incorporation',
      stage: 'application',
    },
    {
      id: 'proof-of-hk-operations',
      label: 'Proof of Hong Kong operations',
      stage: 'application',
      note: 'Examples: MPF records, bank statements, invoices.',
    },
    {
      id: 'vendor-quotations',
      label: 'At least two vendor quotations per budget line item',
      stage: 'application',
    },
    {
      id: 'probity-declaration',
      label: 'Probity and non-collusion declarations',
      stage: 'application',
    },
    {
      id: 'invoices-and-receipts',
      label: 'Invoices, receipts, and payment proofs',
      stage: 'reimbursement',
    },
    {
      id: 'delivery-evidence',
      label: 'Delivery evidence for completed project work',
      stage: 'reimbursement',
    },
    {
      id: 'external-audit-report',
      label: 'External auditor report for reimbursement claim',
      stage: 'reimbursement',
      note: 'Audit fee support is capped at HK$5,000.',
    },
  ],
  links: [
    {
      label: 'BUD Fund official portal',
      url: 'https://www.bud.hkpc.org/',
    },
  ],
};