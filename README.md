# SME Grant Navigator — Thunder

AI grant drafting agent for Hong Kong SMEs. Describe your company, drop in documents, and get a complete ready-to-review application draft for the scheme that fits.

**Launch target: May 11, 2026**

## What it does

Thunder is a conversational agent. The user describes their business (or uploads documents), the agent identifies relevant schemes from the catalog, asks focused qualifying questions, and produces a complete application draft — sections, checklists, and supporting text — ready to review and submit.

Flow: **Discover → Qualify → Draft**

## Schemes covered

| Scheme | Status |
|---|---|
| Easy BUD (up to HK$100,000, simplified) | Full eligibility rules + document checklist |
| BUD Fund — General (up to HK$7M) | Stub — needs checklist |
| BUD E-commerce Easy | Stub — needs checklist |
| ITF — Innovation & Technology Fund | Stub — needs checklist |
| HKSTP Incu programmes | Stub — needs checklist |
| CreateSmart Initiative | Stub — needs checklist |

## Tech stack

- **Frontend**: Next.js 15 + Tailwind CSS (Geist design system)
- **AI**: OpenRouter (streaming)
- **DB**: Supabase (sessions, attachments, RLS)
- **Auth**: planned — NextAuth.js magic-link
- **Payments**: planned — Stripe

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in SUPABASE_URL, SUPABASE_ANON_KEY, OPENROUTER_API_KEY
npm run dev
```

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Hero composer (landing)
│   ├── chat/[sessionId]/page.tsx   # Chat + artifact panel
│   ├── funds/page.tsx              # Scheme browser
│   ├── funds/[schemeId]/page.tsx   # Scheme detail
│   └── api/
│       ├── chat/route.ts           # LLM streaming, session history
│       ├── sessions/               # Supabase-backed session CRUD
│       └── uploads/route.ts        # Attachment text extraction
├── components/
│   └── chat/
│       ├── ArtifactPanel.tsx       # Shortlist / draft / checklist renderers
│       ├── ChatLayout.tsx
│       └── Composer.tsx
└── lib/
    ├── llm.ts                      # OpenRouter client
    ├── prompts/system.ts           # Agent system prompt
    └── schemes/                    # Scheme catalog (registry + per-scheme files)
```

**Weekend 3 (May 9–10):** Auth + Stripe + landing page ("Apply for Easy BUD 2026") + first accountant partnership outreach

**Launch: May 11, 2026.** Target: 10 paying users by end of May.

**Post-launch (weeks 4–8):** ITF + HKSTP support, accountant-reviewed tier, content/SEO expansion.

## Distribution Plan

1. **SEO**: "How to apply for Easy BUD 2026" blog post live before mid-May — capture the launch demand wave
2. **Accountant partnerships**: 2–3 firms with 20% referral commission (reviews = trust signal)
3. **HK SME Facebook groups** (50,000+ members combined)
4. **LIHKG business forums**
5. **Cold email**: HKTDC SME Centre contacts, chamber of commerce member lists
6. **LinkedIn**: HK startup founders + SME owners
7. **Threads build-in-public**: cross-audience leverage from existing AI-focused following

## Risks and Mitigations

- **Liability from rejected applications** → Frame output as "draft for human review," add prominent disclaimers, surface the Accountant-Reviewed tier for risk-averse buyers
- **HKPC releases their own AI tool** → Low probability in next 12–18 months (their pattern is portals, not generative tools). Monitor announcements.
- **Rule changes** → Easy BUD is structurally simpler and more stable than TVP was. Maintain a single source-of-truth rules file per scheme.

## License

MIT
