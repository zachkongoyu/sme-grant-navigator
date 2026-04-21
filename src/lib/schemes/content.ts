interface FundContact {
  readonly tel?: string;
  readonly email?: string;
  readonly website?: string;
}

export interface FundContent {
  readonly objective: string;
  readonly targetRecipients: ReadonlyArray<string>;
  readonly administeringBody: string;
  readonly contact: FundContact;
  readonly notes?: ReadonlyArray<string>;
}

const schemeContentById: Readonly<Record<string, FundContent>> = {
  'easy-bud': {
    objective:
      'Provide a simplified BUD application route for eligible Hong Kong enterprises to complete self-implemented projects for market expansion and business development in approved markets.',
    targetRecipients: [
      'Non-listed Hong Kong enterprises with substantive business operations in Hong Kong.',
    ],
    administeringBody: 'Hong Kong Productivity Council',
    contact: {
      tel: '2788 6088',
      email: 'bud_sec@hkpc.org',
      website: 'https://www.bud.hkpc.org/en',
    },
    notes: [
      'Easy BUD is a streamlined track under the broader BUD Fund framework.',
    ],
  },
  'bud-general': {
    objective:
      'Support larger and more comprehensive branding, upgrading and sales-promotion projects under the BUD Fund general application track.',
    targetRecipients: [
      'Non-listed Hong Kong enterprises with substantive business operations in Hong Kong.',
    ],
    administeringBody: 'Hong Kong Productivity Council',
    contact: {
      tel: '2788 6088',
      email: 'bud_sec@hkpc.org',
      website: 'https://www.bud.hkpc.org/en',
    },
  },
  'bud-ecommerce-easy': {
    objective:
      'Support eligible enterprises to accelerate digital and e-commerce focused expansion activities under the simplified BUD framework.',
    targetRecipients: [
      'Non-listed Hong Kong enterprises with substantive business operations in Hong Kong.',
    ],
    administeringBody: 'Hong Kong Productivity Council',
    contact: {
      tel: '2788 6088',
      email: 'bud_sec@hkpc.org',
      website: 'https://www.bud.hkpc.org/en',
    },
  },
  itf: {
    objective:
      'Provide funding support for innovation and technology projects, including applied research, talent and technology adoption programmes across multiple tracks.',
    targetRecipients: [
      'Eligible local companies, R&D centres, public research institutions and organisations under respective ITF programmes.',
    ],
    administeringBody: 'Innovation and Technology Commission',
    contact: {
      tel: '3655 5678',
      email: 'enquiry@itf.gov.hk',
      website: 'https://www.itf.gov.hk/en/',
    },
  },
  hkstp: {
    objective:
      'Provide startup incubation, acceleration and venture support programmes to help technology companies scale through R&D and commercialisation.',
    targetRecipients: [
      'Technology startups and innovation companies that meet HKSTP programme requirements.',
    ],
    administeringBody: 'Hong Kong Science and Technology Parks Corporation',
    contact: {
      tel: '2629 6872 / 2629 6873',
      email: 'enquiry.marketing@hkstp.org',
      website: 'https://www.hkstp.org/en/programmes/',
    },
  },
  createsmart: {
    objective:
      'Support projects that contribute to the development of creative industries in Hong Kong through targeted financial assistance.',
    targetRecipients: [
      'Locally registered institutions and organisations, including academic institutions, trade associations, professional bodies, research institutes and companies.',
    ],
    administeringBody: 'Cultural and Creative Industries Development Agency',
    contact: {
      tel: '2294 2774 / 2294 2786',
      email: 'createsmart@ccidahk.gov.hk',
      website: 'https://csi.ccidahk.gov.hk/en/index.html',
    },
  },
  'sme-export-marketing-fund': {
    objective:
      'Encourage SMEs to expand markets outside Hong Kong by providing financial assistance for participation in export promotion activities.',
    targetRecipients: [
      'Non-listed Hong Kong enterprises with substantive business operation in Hong Kong.',
    ],
    administeringBody: 'Trade and Industry Department',
    contact: {
      tel: '2398 5127',
      email: 'emf_enquiry@tid.gov.hk',
      website: 'https://www.smefund.tid.gov.hk/emf/eng',
    },
    notes: [
      'Effective from 30 April 2021 until 30 June 2026, EMF scope includes certain large-scale local exhibitions and selected online exhibitions with relaxed eligibility covering non-SMEs.',
    ],
  },
  'dedicated-fund-bud': {
    objective:
      'Support non-listed Hong Kong enterprises to enhance competitiveness and develop business in the Mainland and other FTA/IPPA economies through branding, upgrading and restructuring operations, and sales promotion.',
    targetRecipients: [
      'Non-listed Hong Kong enterprises with substantive business operations in Hong Kong.',
    ],
    administeringBody: 'Hong Kong Productivity Council',
    contact: {
      tel: '2788 6088',
      email: 'bud_sec@hkpc.org',
      website: 'https://www.bud.hkpc.org/en',
    },
    notes: [
      'The scheme currently covers the Chinese Mainland and other economies where Hong Kong has signed FTAs and/or IPPAs.',
    ],
  },
  'trade-and-industrial-organisation-support-fund': {
    objective:
      'Provide financial support to non-profit-distributing organisations to implement projects that enhance the competitiveness of non-listed Hong Kong enterprises in general or specific sectors.',
    targetRecipients: [
      'Non-profit-distributing organisations, such as trade and industrial organisations, professional bodies, or research institutes.',
    ],
    administeringBody: 'Trade and Industry Department',
    contact: {
      tel: '2398 5128',
      email: 'tsf_enquiry@tid.gov.hk',
      website: 'https://www.smefund.tid.gov.hk/tsf/eng',
    },
  },
  'sme-financing-guarantee-scheme': {
    objective:
      'Help SMEs and non-listed enterprises obtain financing from participating lenders for meeting business needs.',
    targetRecipients: [
      'Enterprises registered in Hong Kong, excluding listed companies, lending institutions and affiliates of lending institutions.',
      'For some guarantee products, enterprises must have been in operation in Hong Kong for at least one year.',
    ],
    administeringBody: 'HKMC Insurance Limited',
    contact: {
      tel: '2536 0392',
      email: 'sfgs_enquiry@hkmci.hk',
      website:
        'https://www.hkmc.com.hk/eng/our_business/sme_financing_guarantee_scheme.html',
    },
    notes: [
      'SME definition in this context: fewer than 100 employees for manufacturing and fewer than 50 employees for non-manufacturing enterprises.',
    ],
  },
  'enterprise-support-scheme': {
    objective:
      'Support local companies to conduct in-house R&D work and encourage private-sector investment in research and development.',
    targetRecipients: ['Locally incorporated and registered companies.'],
    administeringBody: 'Innovation and Technology Commission',
    contact: {
      tel: '3422 3700',
      email: 'ess@itc.gov.hk',
      website: 'https://www.itf.gov.hk/en/funding-programmes/supporting-research/ess/',
    },
  },
  'arts-capacity-development-funding-scheme': {
    objective:
      "Strengthen Hong Kong's cultural software and build the capacity of the arts sector.",
    targetRecipients: [
      'Locally incorporated companies, charitable institutions or trusts of a public character.',
    ],
    administeringBody: 'Culture, Sports and Tourism Bureau',
    contact: {
      tel: '3102 2934 / 3102 2935',
      email: 'acdfs@cstb.gov.hk',
      website: 'https://www.cstb.gov.hk/en/acdfs.html',
    },
  },
};

export function getFundContentBySchemeId(
  schemeId: string,
): FundContent | undefined {
  return schemeContentById[schemeId];
}
