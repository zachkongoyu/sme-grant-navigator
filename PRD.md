# PRD: SME Grant Navigator (HK) — v1

**Status:** Draft  
**Owner:** Zach  
**Created:** 2026-04-20  
**Launch Target:** May 11, 2026  
**Hard Deadline Driver:** Easy BUD scheme launches April 23, 2026

> **⚠ Strategy revised 2026-04-25: free-first launch, Easy BUD only, monetization moved to PDF export. Original HK$299 freemium gate plan deferred.** Sections marked *[SUPERSEDED]* reflect the prior plan and are kept for reference only. See `STRATEGY_REALIGN.md` for the full rationale.

---

## How the BUD Fund Works (Scheme Mechanics)

Understanding the scheme is prerequisite to building the product correctly. These mechanics must inform both the draft generator logic and the user experience design.

**It is a reimbursement scheme, not upfront cash.** The government pays back 25% of eligible costs *after* project completion and external audit. Enterprises must fund 100% of project costs upfront. This is the single biggest source of user confusion and the most common reason SMEs abandon applications after learning the details.

**Three tracks:**

| Track | Cap per project | Concurrent cap* | Cumulative cap | Duration | Processing |
|---|---|---|---|---|---|
| Easy BUD | HK$150,000 | HK$800,000 | HK$7,000,000 (max 70 projects) | 12 months, no extensions | ~30 working days |
| General Application | HK$800,000 | HK$800,000 | HK$7,000,000 | 24 months | ~60+ working days |
| E-commerce Easy | HK$800,000 | HK$800,000 | HK$7,000,000 | 24 months | ~60+ working days |

*Total approved funding across all on-going BUD projects (of any type) cannot exceed HK$800,000 at any one time.

**Eligible activities — Easy BUD (Type ii, self-implemented only):**

All activities must directly relate to developing the applicant's business in target markets (Mainland China or approved FTA/IPPA economies). Activities must be implemented by the HK entity itself — not by an entity in the target market.

| # | Activity | Notes / Caps |
|---|---|---|
| 4.1 | Advertisements in target market | Management fee fundable ≤ 6 months |
| 4.2 | Exhibition participation in target market | Booth rental, design, construction, transport of exhibits, travel & accommodation for HK staff |
| 4.3 | Patent / trademark / design / utility model / copyright registration in target market | Only registration authority fees + external agent fees. Cumulative cap: HK$600,000 per enterprise across all BUD projects |
| 4.4 | Testing and certification services (in HK or target market) | Only fees for engaging external agents |
| 4.5 | Mobile app development or enhancement for target market | — |
| 4.6 | Company website development or enhancement for target market sales | Enhancement of existing site capped at HK$100,000 per application |
| 4.7 | Design and production of promotional materials (flyers, posters, catalogues, photos, videos) | Only external agent fees |
| 4.8 | Establishment of online sales platform for target market | Management fee fundable ≤ 6 months |
| 4.9 | Combination of any of the above | — |
| 4.10 | External audit fee | Capped at HK$5,000, subject to 1:3 matching ratio, counts toward HK$100K ceiling |

**What kills applications:**
- Vague scope: "do marketing in China" is rejected; "run 3 Xiaohongshu ad campaigns targeting Shanghai consumers in Q3, generating 10,000 impressions" passes
- Activities implemented by the enterprise's own entity in the target market (must be run from HK)
- Requesting an extension beyond 12 months (none permitted under Easy BUD)
- Targeting markets outside Mainland China or the FTA/IPPA approved list
- Applying to circumvent funding limits (e.g. splitting one project into multiple Easy BUD applications)

**Post-completion reimbursement claim requirements:** Final project report + final audited accounts (from external auditor, audit fee up to HK$5,000). No payment is released until both are accepted by the Programme Management Committee. The application draft is step one — the final claim is where most friction occurs for first-time applicants.

**Easy BUD frequency limit:** One application per enterprise every **3 months** (not 6 — the README had this wrong). Applications are open all year round and processed on a continual basis.

---

## Problem Statement

Hong Kong's 340,000+ registered SMEs have access to meaningful government grants — particularly the BUD Fund — but the application process is a practical barrier. Forms take 20–40 hours to complete properly, and traditional consultants charge HK$5,000–30,000+ per application with opaque, success-fee structures that make them inaccessible to early-stage or budget-constrained businesses. HKPC's free advisory service (SME ReachOut) doesn't scale: it offers guidance but not a draft, and slots are limited. The result is that many SMEs with fundable projects simply abandon applications. With Easy BUD launching April 23, 2026 — a simplified HK$150,000 track with 30-day processing — there is a narrow category-creation window for an AI-powered drafting tool, and no such tool currently exists in the market.

---

## Goals

**User goals:**
1. An SME owner can go from zero to a reviewable Easy BUD application draft in under 30 minutes (vs. 20–40 hours today).
2. Users feel confident enough in the output to either submit it themselves or hand it to an accountant — reducing the perceived need for a HK$10K+ consultant.
3. Users understand which grant schemes they are eligible for without needing to read 20+ government information pages.

**Business goals:**
4. ~~Achieve 10 paying users by end of May 2026, validating the HK$299/application price point.~~ *[SUPERSEDED — 2026-04-25: monetization deferred. v1 goal is email list growth and organic traffic. PDF export gated behind email capture, optionally HK$99.]*
5. Establish SEO presence for "Easy BUD 2026 application" before competing content fills the search results.
6. **[NEW]** Build an audience: maximise signups (email capture at PDF export) as the leading v1 metric. The email list is the data-vault asset that funds later monetization.

---

## Non-Goals

- **TVP (Technology Voucher Programme)**: Closed to new applications December 31, 2024. Not in scope.
- **EMF (Enterprise Marketing Fund)**: Consolidating into BUD by June 30, 2026; not a separate scheme to support.
- **Full submission automation**: The tool generates a *draft for human review*, not a system that submits to the government portal directly. Liability concerns and the government's own submission process make this out of scope for v1 (and likely v2).
- **Multi-language support (Traditional Chinese)**: Important for the full TAM but deferred to post-launch. v1 ships in English only to reduce content scope.
- **Accountant-reviewed tier at launch**: The HK$1,499 partner-accountant review upsell requires accountant partnerships to be operational. Outreach begins Week 3; this tier targets post-launch.

---

## User Stories

### SME Owner (primary persona)

- As an SME owner, I want to understand how BUD funding actually works (reimbursement, not upfront cash) before I invest time in an application, so I'm not surprised when I find out I need to spend the money first.
- As an SME owner, I want to enter my company's basic information once and have the tool tell me which grants I likely qualify for, so I don't have to read through 20 government scheme pages to find out if it's even worth applying.
- As an SME owner, I want a pre-filled Easy BUD application draft generated from my business profile and planned activities, so I can spend time reviewing and refining rather than writing from scratch.
- As an SME owner, I want the draft to include specific deliverables and KPIs for each activity (not just "do marketing"), so my application doesn't get rejected for being too vague.
- As an SME owner, I want to know exactly which documents I need to gather before submitting, so I'm not caught off guard after the draft is done.
- As an SME owner, I want to see a preview of the first two sections of my draft before paying, so I can assess the quality of the output before committing HK$299.
- As an SME owner, I want to export my completed draft as a PDF, so I can share it with my accountant or attach it to my submission.
- As an SME owner, I want clear disclaimers that this is a draft for review (not a guaranteed-approval document), so I understand my responsibilities before submitting.

### Accountant / Grant Consultant (referral persona, post-launch)

- As an accountant, I want to be able to prepare BUD Fund drafts for multiple clients per month using the Pro tier, so I can serve more clients without proportionally more time.
- As an accountant, I want to refer my SME clients to the tool and earn a 20% referral commission, so I can generate additional revenue from clients I can't serve at scale.

### First-time applicant (edge case persona)

- As a first-time grant applicant, I want to understand what "BUD Fund" and "Easy BUD" actually mean before I start, so I don't waste time applying for a scheme I'm ineligible for.
- As a first-time applicant, I want to know what documents I'll need to gather before starting the draft, so I can prepare before beginning the intake form.

---

## Requirements

### Must-Have — P0 (v1 launch, May 11, 2026)

**Business profile intake form**

The intake form must collect enough information to generate a draft with concrete deliverables and budget line items — not just company metadata. Required fields:

*Company profile:* Company name, HK Business Registration number, industry/sector, number of employees, annual turnover (to verify SME thresholds), confirmation of non-listed status, confirmation of substantive HK operations.

*Project details:* Target market(s) — multi-select from approved list (Mainland China, ASEAN-10, UK, Japan, South Korea, UAE, Australia, etc.); planned activity types — multi-select from the 8 eligible Easy BUD activity types (advertisements, exhibitions, IP registration, testing/certification, mobile app, website, promotional materials, online sales platform); estimated total project budget; intended project duration in months (must be ≤ 12, no extensions allowed); brief description of the business goal (e.g. "enter the Guangdong market with our skincare brand"). For exhibition activity: target exhibition name/location and dates if known. For IP registration: which type (patent/trademark/design/copyright) and target market.

*Prior BUD history:* Has the company received BUD funding before? If yes, approximate total received (flags proximity to HK$7M cumulative cap) and whether any projects are currently on-going (flags proximity to HK$800K concurrent cap).

- Acceptance criteria: A user can complete the intake form in under 10 minutes. Required fields are validated before proceeding. Form state is preserved if the user refreshes. Selecting an activity type not eligible under Easy BUD surfaces an inline warning.

**Easy BUD eligibility check**
- Score the user's profile against Easy BUD eligibility criteria (employee count ≤ 100, not a listed company, Hong Kong registered).
- Show a clear pass/fail or confidence score with a brief explanation of any flags.
- Acceptance criteria: The eligibility result is shown before the user is asked to pay. A user who is clearly ineligible is told why and not pushed toward payment.

**Easy BUD draft generator**

Use Claude API to generate a pre-filled application draft using the intake form data as input and the Easy BUD application structure as the prompt template.

The draft must:
- Cover all required Easy BUD sections: company background, project description, objectives, implementation plan with timeline, expected outcomes, and budget breakdown
- Write each activity with **specific deliverables, KPIs, and timelines** — not generic language (this is the primary rejection risk)
- Include a budget table mapping each cost item to an activity, with a note that 2 vendor quotations are required per line item
- Target only approved markets based on what the user selected in intake
- Avoid language that implies outsourcing project execution (Easy BUD requires self-implementation)
- Be written in a tone consistent with formal HK government application submissions

- Acceptance criteria: Generated draft references the user's specific business profile and selected activities (not generic filler). Every activity section includes at least one measurable KPI and a specific timeline. Budget table is present and populated. Generation completes in under 60 seconds.

**Freemium gate** *[SUPERSEDED — 2026-04-25]*
- ~~Show sections 1–2 of the draft (company background + project description) for free.~~
- ~~Gate remaining sections behind a one-time HK$299 payment via Stripe.~~
- **New spec:** All draft sections rendered free. Gate only the **PDF export** behind email capture (and optionally HK$99). Full Stripe subscription billing deferred. See `STRATEGY_REALIGN.md` §9–10.

**PDF export**
- Allow users to download the completed draft as a formatted PDF, gated behind **email capture** (not payment) in v1.
- Acceptance criteria: PDF is readable, sections are clearly labeled, and the document can be opened in standard PDF readers. File is generated within 10 seconds of request. User must provide email before download link is shown.

**Reimbursement model education screen**

Before the user begins the intake form, display a one-screen explainer covering: (1) BUD is a 25% reimbursement on eligible costs paid *after* project completion, not upfront funding; (2) the user must finance 100% of costs themselves during the project; (3) a final audit report from an external accountant is required to claim reimbursement. Include a "I understand" confirmation before proceeding.

This is not a legal disclaimer — it is user education. Many SMEs discover the reimbursement model mid-application and abandon. Surfacing it upfront reduces wasted sessions and builds trust.

- Acceptance criteria: The screen appears before the intake form on first visit. It cannot be skipped without clicking confirmation. The language is plain English (no jargon). It does not feel like a warning or deterrent — it should be framed as "here's how the money flows."

**Required documents checklist**

After eligibility check, before payment, show the user a checklist of documents they will need to submit with their application and (separately) to make their final reimbursement claim. This sets expectations and reduces abandonment after payment.

Application documents: Business Registration Certificate, Certificate of Incorporation, proof of HK operations (MPF records, bank statements, or invoices), minimum 2 vendor quotations per budget item, probity/non-collusion declaration forms.

Reimbursement claim documents (informational only — not needed at application stage): invoices, receipts, payment proofs, delivery evidence, external auditor report.

- Acceptance criteria: Checklist is visible before the payment gate. Items are categorized as "needed now" vs. "needed later (for reimbursement claim)." User can download the checklist as a PDF.

**Prominent draft disclaimer**
- Display a disclaimer on the draft view and in the PDF footer stating this is an AI-generated draft for human review and not a guarantee of approval.
- Acceptance criteria: Disclaimer is visible without scrolling on the draft view. It appears in the PDF footer on every page.

**Landing page**
- A single landing page optimized for "Easy BUD 2026 application" and related search terms.
- Communicates the value proposition, pricing, and a clear CTA to start the eligibility check.
- Acceptance criteria: Page loads in under 2 seconds. CTA is above the fold. Meta title and description are set.

---

### Nice-to-Have — P1 (fast follows, weeks 2–4 post-launch)

**BUD Fund General + E-commerce Easy support**
- Extend the draft generator to support the BUD Fund General track (up to HK$7M) and the E-commerce Easy track (part of July 2026 consolidation).
- These tracks have more complex requirements; the intake form will need additional fields for larger project scopes.

**Multi-scheme eligibility scorer**
- After intake, score the user across BUD (all tracks), ITF, HKSTP, and CreateSmart simultaneously and present a ranked list of recommended schemes.

**Pro tier (HK$499/month)**
- Unlimited drafts, multi-scheme access, and PDF export for accountants or repeat users.
- Stripe subscription billing, upgrade/downgrade flows.

**Checklist and document tracker**
- Per-scheme checklist of required supporting documents (audited financials, business registration, quotations, etc.) with deadline reminders.

**User accounts and draft history**
- Save drafts to a user account so they can return to edit or regenerate.
- Required for the Pro tier to be useful.

---

### Future Considerations — P2 (post-launch, weeks 5–8+)

**Accountant-reviewed tier (HK$1,499)**
- Partner accountant reviews and signs off on the AI draft before submission.
- Requires accountant partnership agreements, review workflow, and turnaround SLA.
- Designing the draft export format with accountant review in mind is an architectural consideration for v1 (structured sections, clean handoff format).

**Traditional Chinese language support**
- The majority of HK SME owners operate primarily in Chinese. This is a significant TAM expansion but requires full content translation and prompt engineering in Traditional Chinese.

**ITF and HKSTP deep support**
- ITF and HKSTP have distinct application structures and review criteria. Supporting them well requires separate prompt templates and potentially separate intake flows.

**Government portal submission integration**
- If HKPC opens an API or standardized submission format, direct submission from the tool would be a significant differentiator. Monitor developments post-launch.

---

## Success Metrics

### Leading indicators (evaluate at 2 weeks post-launch)

- **Draft completion rate**: % of users who start a chat and receive a full Easy BUD draft. Target: ≥ 60%.
- **Email capture rate**: % of users who complete a draft and submit their email to download the PDF. Target: ≥ 30%. *[Replaces freemium-to-paid conversion as the primary funnel metric — 2026-04-25]*
- **Time-to-draft**: Median time from first message to draft displayed. Target: ≤ 20 minutes.
- **Draft generation error rate**: % of API calls that fail or return an unusable draft. Target: < 2%.

### Lagging indicators (evaluate at 4–8 weeks post-launch)

- ~~**Paying users by end of May 2026**: Target: 10. Stretch: 25.~~ *[SUPERSEDED — 2026-04-25: payment deferred]*
- ~~**Revenue by end of May 2026**: Target: HK$2,990 (10 × HK$299). Stretch: HK$7,500.~~ *[SUPERSEDED]*
- **Email subscribers by end of May 2026**: Target: 100. Stretch: 300. *(New primary lagging metric)*
- **Organic search traffic**: Target: 500 unique visitors/month from "Easy BUD 2026" and related terms by end of May.
- **User-reported submission rate**: % of users who report they submitted or intend to submit the draft. Target: ≥ 40% (measured via optional post-PDF survey).

---

## Open Questions

- **[Zach — blocking]** What does the actual Easy BUD application form look like? The April 23 HKPC launch event should surface the official form, assessment criteria, and rubric. The draft generator prompt template cannot be finalized until this is captured. Plan: Attend/watch the launch event on April 23 and extract the form structure before Weekend 1 build starts.

- **[Zach — blocking]** What is the exact eligibility threshold for Easy BUD? Research confirms "non-listed, HK-registered, substantive HK operations" — but the official guidance notes may specify employee count limits or excluded industries. Verify against the Easy BUD Guidance Notes PDF available on the BUD portal before finalizing the eligibility checker logic.

- **[Zach — blocking]** Which FTA/Investment Agreement economies are on the approved list? The guidance notes confirm Mainland China + FTA/IPPA markets but do not list them exhaustively in this document. The full approved list (confirmed as of November 2024 update per the main Guide to Application) includes ASEAN-10, UK, Japan, South Korea, UAE, Australia, and 30+ others. Pull the complete list from the main Guide to Application PDF on the BUD portal before finalizing the intake form country multi-select.

- **[Product — non-blocking]** Easy BUD requires self-implementation (no outsourcing). The intake form asks users to describe their project — but users may describe activities that sound like they'd require a vendor (e.g. "hire an agency to run our WeChat ads"). Should the tool flag this conflict before generating the draft, or handle it in the draft language itself? Recommendation: flag it with an inline warning at intake, and also write the draft language to frame activities as self-executed.

- **[Engineering — non-blocking]** Should draft generation be synchronous (user waits up to 60 seconds) or async (user gets a "your draft is ready" email/notification)? Synchronous is simpler for v1 but may feel slow. Recommendation: synchronous with a progress indicator for v1; revisit if p99 generation time exceeds 45 seconds in production.

- **[Product — non-blocking]** Should the free preview be a hard gate (sections 1–2 only) or a soft gate (full draft blurred/watermarked)? The blurred approach may increase conversion by showing the user more value before payment. Worth A/B testing post-launch.

- **[Legal — non-blocking]** Are there any regulatory concerns with generating grant application drafts for a fee in HK? Traditional consultants do this without apparent licensing requirements, but confirm there is no professional services regulation that applies. Add a ToS clause that the user is responsible for the accuracy of the submitted application and that the tool does not constitute professional advisory services.

---

## Timeline Considerations

| Date | Milestone |
|---|---|
| April 23, 2026 | Easy BUD scheme launches — capture official application form and rubric from HKPC event |
| April 25–26, 2026 | Weekend 1: Easy BUD scheme content depth + landing rewrite + system prompt bias + remove paywall |
| May 2–3, 2026 | Weekend 2: `/reimbursement`, `/easy-bud-guide`, `/easy-bud-vs-general` SEO pages + PDF export with email gate |
| May 9–10, 2026 | Weekend 3: `/privacy` + `/terms` + coming-soon badges on other schemes + final QA |
| **May 11, 2026** | **Public launch** |
| End of May 2026 | 10 paying users checkpoint |
| Weeks 4–8 post-launch | ITF + HKSTP support, accountant-reviewed tier, content/SEO expansion |

**Hard dependency**: The Easy BUD draft generator cannot be finalized without the official application form structure. The April 23 event is the critical input to Weekend 1. If HKPC delays or changes the Easy BUD format, Weekend 1 scope shifts to scaffolding + intake form only, with draft generation following in Weekend 2.

---

## Appendix: Easy BUD Scheme Reference

*Source: Guidance Notes for Applications on Easy BUD, Version 11/2025, HKPC*

### Key numbers at a glance

| Parameter | Value |
|---|---|
| Funding ceiling per project | HK$150,000 |
| Government : Enterprise matching ratio | 1 : 3 (25% government, 75% enterprise in cash) |
| Audit fee cap (counts toward ceiling) | HK$5,000 |
| Project duration | 12 months max, no extensions |
| Concurrent BUD funding cap | HK$800,000 across all on-going projects |
| Cumulative enterprise cap | HK$7,000,000 / 70 approved projects |
| Application frequency | Once every 3 months per enterprise |
| Processing time | 30 clear working days from complete application |
| Payment method | Reimbursement only — no initial payment |
| Application channel | Online e-form only (www.bud.hkpc.org) |

### What triggers the 3-month cooldown

The 3-month restriction applies regardless of outcome — approved, withdrawn, or rejected. If a user submits and gets rejected, they still need to wait 3 months before reapplying. The product should surface this during eligibility check if the user indicates they've recently submitted.

### Eligible supporting documents (for substantive HK operations)
- Latest audited accounts (required)
- PLUS one of: MPF records of employees OR sales invoices/receipts

### Post-completion claim requirements
Both must be accepted by the Programme Management Committee before any payment is released:
1. Final project report
2. Final audited accounts (from an external auditor, fee up to HK$5,000 also claimable at 1:3 ratio)

### Easy BUD vs. General Application — key differences relevant to the product

| Aspect | Easy BUD | General Application |
|---|---|---|
| Type | Type (ii) only (self-implemented specific measures) | Type (i) or Type (ii) |
| Funding ceiling | HK$150,000 | HK$800,000 |
| Duration | 12 months, no extensions | 24 months |
| Initial payment | None (reimbursement only) | 20% upfront option available |
| Implementation | HK entity only, must be self-run | Can engage external service providers |
| Processing | 30 working days | Longer |

---

## Appendix: Competitive Context

| Alternative | Price | Scales? | Our edge |
|---|---|---|---|
| Traditional consultants (FundFluent, Arrow Achieve, HKEasyFund, Autus, BUD-HK) | HK$5K–30K+ per project, opaque | No | 10–100× cheaper, instant |
| HKPC SME ReachOut | Free | No (advisory, not draft) | Generates the actual draft |
| HKPC workshops | Free | No (scheduled, generic) | Tailored to your business profile |
| DIY | Free | No (20–40 hours) | Cuts to under 30 minutes |
