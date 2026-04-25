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
  'innovation-fund': {
    objective:
      'Support SMEs undertaking R&D and innovation activities that lead to new or significantly improved products, processes, or services.',
    targetRecipients: [
      'Registered SMEs with fewer than 250 employees.',
      'Applicants must demonstrate a clear commercialisation pathway.',
    ],
    administeringBody: 'Innovation Agency',
    contact: {
      email: 'grants@innovationagency.example',
      website: '#',
    },
  },
  'export-support': {
    objective:
      'Help SMEs develop international market presence through market research, trade missions, exhibition participation, and promotional campaigns.',
    targetRecipients: [
      'Registered SMEs with an existing product or service ready for export.',
    ],
    administeringBody: 'Trade Development Agency',
    contact: {
      email: 'export@tradeagency.example',
      website: '#',
    },
  },
  'startup-incubator': {
    objective:
      'Provide structured mentoring, co-working space, and seed funding to help early-stage startups reach product-market fit.',
    targetRecipients: [
      'Pre-revenue or early-revenue startups founded within the last two years.',
    ],
    administeringBody: 'Startup Development Office',
    contact: {
      email: 'apply@startupoffice.example',
      website: '#',
    },
  },
  'digital-transform': {
    objective:
      'Subsidise the adoption of digital tools and platforms that measurably improve productivity, customer reach, or operational efficiency.',
    targetRecipients: [
      'SMEs with fewer than 100 employees seeking to digitalise core business processes.',
    ],
    administeringBody: 'Digital Economy Bureau',
    contact: {
      email: 'digitalfund@deb.example',
      website: '#',
    },
  },
  'creative-fund': {
    objective:
      'Fund commercially viable creative projects in design, media, performing arts, and cultural industries.',
    targetRecipients: [
      'Registered creative businesses with a demonstrable track record of commercial activity.',
    ],
    administeringBody: 'Creative Industries Council',
    contact: {
      email: 'apply@creativeindustries.example',
      website: '#',
    },
  },
  'trade-support': {
    objective:
      'Provide broad-based funding for SMEs targeting new export markets through branding, market research, and sales promotion activities.',
    targetRecipients: [
      'SMEs registered for at least one year with substantive business operations.',
    ],
    administeringBody: 'Trade Support Agency',
    contact: {
      email: 'apply@tradesupport.example',
      website: '#',
    },
  },
};

export function getFundContentBySchemeId(id: string): FundContent | undefined {
  return schemeContentById[id];
}
