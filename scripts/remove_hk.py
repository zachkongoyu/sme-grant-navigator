"""Remove all HK-specific content from the src/ directory."""
import pathlib, re

ROOT = pathlib.Path('/Users/ngoyuko/projects/sme-grant-navigator')


def write(rel: str, content: str):
    p = ROOT / rel
    p.write_text(content)
    print(f'  wrote {rel} ({len(p.read_text().splitlines())} lines)')


# ── 1. src/lib/schemes/content.ts ─────────────────────────────────────────────
write('src/lib/schemes/content.ts', """\
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
""")


# ── 2. src/types/index.ts  ─────────────────────────────────────────────────────
p = ROOT / 'src/types/index.ts'
text = p.read_text()
text = text.replace("  | 'BUD Fund'\n", "  | 'Trade Support'\n")
p.write_text(text)
print(f'  patched src/types/index.ts')


# ── 3. src/lib/schemes/db.ts ──────────────────────────────────────────────────
p = ROOT / 'src/lib/schemes/db.ts'
text = p.read_text()
text = text.replace("  'BUD Fund',\n", "  'Trade Support',\n")
p.write_text(text)
print(f'  patched src/lib/schemes/db.ts')


# ── 4. src/lib/prompts/system.ts ─────────────────────────────────────────────
p = ROOT / 'src/lib/prompts/system.ts'
text = p.read_text()
# Replace `up to HK$${s.fundingCap.toLocaleString()}` with currency-neutral format
text = text.replace(
    '`, up to HK$${s.fundingCap.toLocaleString()}`',
    '`, up to ${s.fundingCap.toLocaleString()} ${s.currency ?? \'\'}`',
)
p.write_text(text)
print(f'  patched src/lib/prompts/system.ts')


# ── 5. src/components/McpConversation.tsx ─────────────────────────────────────
p = ROOT / 'src/components/McpConversation.tsx'
text = p.read_text()
text = text.replace(
    "{ role: 'user',      text: 'What grants can a 12-person logistics startup apply for?' },",
    "{ role: 'user',      text: 'What grants can a 15-person SaaS startup apply for?' },",
)
text = text.replace(
    "{ role: 'call',      text: 'match_schemes({ industry: \"logistics\", employees: 12, ownership: 1.0 })' },",
    "{ role: 'call',      text: 'match_schemes({ industry: \"software\", employees: 15, ownership: 1.0 })' },",
)
text = text.replace(
    "{ role: 'return',    text: '3 matches — Easy BUD ▲▲▲  ITF ▲▲  CreateSmart ▲' },",
    "{ role: 'return',    text: '3 matches — Innovation Grant ▲▲▲  Export Support ▲▲  Digital Transform ▲' },",
)
text = text.replace(
    "{ role: 'assistant', text: \"Your strongest match is Easy BUD — up to HK$700k for market promotion and product development. Here's why you qualify and what to prepare…\" },",
    "{ role: 'assistant', text: \"Your strongest match is the Innovation Grant — up to $250k for R&D and product development. Here's why you qualify and what to prepare…\" },",
)
p.write_text(text)
print(f'  patched src/components/McpConversation.tsx')


# ── 6. src/components/chat/HeroComposer.tsx ───────────────────────────────────
p = ROOT / 'src/components/chat/HeroComposer.tsx'
text = p.read_text()
text = text.replace("  'TVP application',\n", "  'R&D grant application',\n")
text = text.replace("  'SME branding grant',\n", "  'SME branding grant',\n")  # keep as-is, it's generic
p.write_text(text)
print(f'  patched src/components/chat/HeroComposer.tsx')


# ── 7. src/components/QuickStartBlock.tsx ─────────────────────────────────────
p = ROOT / 'src/components/QuickStartBlock.tsx'
text = p.read_text()
text = text.replace('easy-bud', 'innovation-fund')
p.write_text(text)
print(f'  patched src/components/QuickStartBlock.tsx')


# ── 8. src/lib/bookmarks.test.ts ─────────────────────────────────────────────
p = ROOT / 'src/lib/bookmarks.test.ts'
text = p.read_text()
text = text.replace("'easy-bud'", "'innovation-fund'")
text = text.replace("'itf'", "'export-support'")
p.write_text(text)
print(f'  patched src/lib/bookmarks.test.ts')


# ── 9. src/lib/schemes/registry.test.ts ──────────────────────────────────────
p = ROOT / 'src/lib/schemes/registry.test.ts'
text = p.read_text()
text = text.replace(
    "expect(getActiveSchemes().map((scheme) => scheme.id)).toEqual(['easy-bud']);",
    "expect(getActiveSchemes().map((scheme) => scheme.id)).toEqual(['innovation-fund']);",
)
text = text.replace(
    "  it('looks up Easy BUD with the expected funding metadata', () => {\n    const scheme = getSchemeById('easy-bud');",
    "  it('looks up the Innovation Grant with the expected funding metadata', () => {\n    const scheme = getSchemeById('innovation-fund');",
)
text = text.replace(
    "    expect(scheme?.name).toBe('Easy BUD');",
    "    expect(scheme?.name).toBe('Innovation Grant');",
)
text = text.replace(
    "    expect(scheme?.fundingCap).toBe(100000);",
    "    expect(scheme?.fundingCap).toBe(250000);",
)
text = text.replace(
    "    expect(scheme?.durationMonths).toBe(12);",
    "    expect(scheme?.durationMonths).toBe(18);",
)
p.write_text(text)
print(f'  patched src/lib/schemes/registry.test.ts')


print('\nDone.')
