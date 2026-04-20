# 💰 SME Grant Navigator (HK)

AI-powered tool that helps Hong Kong SMEs generate pre-filled government grant application drafts — targeting the **Easy BUD** launch wave (April 23, 2026).

**Enter your business profile → Get a ready-for-review application draft in minutes, not weeks.**

## Why Now

- **Easy BUD launches April 23, 2026** — simplified applications up to HK$100,000, 30-day processing. A category-creation window for a first-mover AI tool.
- **EMF consolidates into BUD in July 2026**, plus new "General Application" and "E-commerce Easy" tracks — SMEs will be searching for guidance as rules shift.
- **No AI drafter exists in this market yet.** Only traditional consultants (FundFluent, Arrow Achieve, HKEasyFund, Autus, BUD-HK) and free 1:1 HKPC advisory — none of which scale.
- **TVP closed to new applications on 31 December 2024.** BUD Fund (general + Easy BUD) is the live market.

## The Problem

HK government runs 20+ SME funding schemes. For the live ones:
- Application forms take 20–40 hours to complete properly
- Consultants charge deliberately opaque fees (industry estimates: low thousands to ~HK$30,000 per project, plus success-fee variants)
- HKPC's free SME ReachOut doesn't scale — limited advisory slots
- SMEs with a valid project but no budget for a consultant typically abandon the application

## The Solution

1. **Easy BUD Draft Generator** (primary): Business profile → pre-filled Easy BUD application draft
2. **BUD Fund (General) Drafter**: Full BUD Fund applications for HK$100K–HK$2M projects
3. **Eligibility Scorer**: Quick checks across BUD tracks + other active schemes (ITF, HKSTP, CreateSmart)
4. **Checklist + Document Tracker**: Deadlines, required docs, submission flow
5. **(Optional) Accountant-Reviewed Upsell**: Partner accountant signs off on the AI draft before submission

## Target Users

- HK SME owners (340,000+ registered SMEs) who can't afford HK$5K–30K consultants
- Startup founders applying for ITF / HKSTP funding
- Accountants who want to prepare more applications per month with AI leverage (referral channel)

## Pricing

Verified against competitor research (2026-04-20). Consultants 10–100× our price; no AI drafter exists yet.

- **Free**: Easy BUD eligibility check + preview of draft (first 2 sections)
- **Per-application: HK$299** (one-time, any track)
- **Pro: HK$499 / month** (unlimited drafts, multi-scheme, PDF export)
- **Accountant-Reviewed: HK$1,499 / draft** (partner accountant sanity-checks before submission)
- **Referral commission to accountants: 20%**

## Competitive Positioning

| Alternative | Price | Scales? | Our edge |
|---|---|---|---|
| Traditional consultants (FundFluent, Arrow Achieve, HKEasyFund, Autus, BUD-HK) | ~HK$5K–30K+ per project, opaque | No (human-bound) | 10–100× cheaper, instant |
| HKPC SME ReachOut | Free | No (advisory, not draft) | Generates the actual draft |
| HKPC workshops | Free | No (scheduled, generic) | Tailored to your business profile |
| DIY from official guidelines | Free | No (20–40 hours) | Cuts to minutes |

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS
- **AI**: Anthropic Claude API (draft generation, eligibility scoring)
- **Data**: Structured grant rule database (BUD primary, expanded over time)
- **Auth**: NextAuth.js
- **DB**: Supabase
- **Payments**: Stripe
- **PDF Export**: react-pdf or similar

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page ("Apply for Easy BUD 2026")
│   ├── match/page.tsx              # Eligibility + grant match
│   ├── draft/[grantId]/page.tsx    # Application drafting
│   └── api/
│       ├── match/route.ts          # Eligibility scoring endpoint
│       └── draft/route.ts          # Draft generation endpoint
├── components/
│   ├── BusinessProfileForm.tsx     # Company info input
│   ├── GrantCard.tsx               # Grant result display
│   ├── EligibilityScore.tsx        # Visual score indicator
│   └── ApplicationDraft.tsx        # Draft viewer/editor
├── lib/
│   ├── grants/
│   │   ├── database.ts             # Grant schemes data
│   │   ├── easy-bud.ts             # Easy BUD (PRIMARY — launch Apr 23, 2026)
│   │   ├── bud-general.ts          # BUD Fund general track
│   │   ├── bud-ecommerce-easy.ts   # E-commerce Easy track
│   │   ├── itf.ts                  # Innovation & Technology Fund
│   │   └── _deprecated/
│   │       └── tvp.ts              # Historical reference (closed 2024-12-31)
│   ├── prompts/
│   │   ├── matcher.ts              # Eligibility scoring prompts
│   │   └── drafter.ts              # Application drafting prompts
│   └── claude.ts                   # Anthropic API wrapper
└── types/
    └── index.ts
```

## HK Government Grant Schemes Covered

Priority order (build sequence):

- [ ] **Easy BUD** (up to HK$100,000, simplified, 30-day processing) — **v1 launch target**
- [ ] **BUD Fund (General)** (up to HK$7M total)
- [ ] **E-commerce Easy** (simplified e-commerce track, part of BUD consolidation)
- [ ] **ITF** — Innovation & Technology Fund
- [ ] **HKSTP Incu programmes**
- [ ] **SME Financing Guarantee Scheme**
- [ ] **CreateSmart Initiative**

Not covered:
- ~~TVP — Technology Voucher Programme~~ (closed to new applications 2024-12-31)
- ~~EMF — Enterprise Marketing Fund~~ (consolidating into BUD in July 2026)

## Roadmap

**Pre-build (Apr 20–23, 2026):**
- Attend/watch HKPC Easy BUD launch event on April 23
- Capture application form, assessment criteria, rubric

**Weekend 1 (Apr 25–26):** Easy BUD draft generator + business-profile intake + basic UI

**Weekend 2 (May 2–3):** BUD Fund general + E-commerce Easy support + PDF export + eligibility checker

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
