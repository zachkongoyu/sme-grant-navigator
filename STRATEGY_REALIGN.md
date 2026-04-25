# Strategy Realignment — Implementation Brief

**Owner to implement:** another agent
**Author:** strategy review, 2026-04-25
**Launch target:** 2026-05-11

## Strategic shift

We are moving from a **HK$299-at-launch paid wedge** to a **free-first audience-building wedge**. The site goes open to the world. Easy BUD is the only scheme with a working drafter at launch. Monetization moves from the draft itself to PDF export (or stays free in v1). All other schemes appear as discovery/matching content but have no drafter yet.

Do **not** expand scope. Do **not** try to ship a complete HK funding directory. Cut, don't add.

## Product surface separation (architecture)

Two distinct surfaces with two distinct jobs. They share the scheme registry but nothing else:

1. **In-house agent (`/chat`)** — end-to-end **company-to-grant matching**. Discover, Qualify, recommend schemes. The agent's job is to take a fuzzy company description and return *which schemes are worth pursuing and why*. It is **not** a drafter. It does not specialise in any single scheme. It can talk about Easy BUD, BUD General, ITF, HKSTP, CreateSmart all the same way (using whatever data the scheme record carries).
2. **Per-scheme drafter (new — `src/app/draft/[schemeId]/...` + `src/lib/drafters/[schemeId]/...`)** — a scheme-specific drafting flow. This is where Easy BUD-specific intake, prompt template, eligibility checks, activity-type validation, and PDF export live. v1 ships only the Easy BUD drafter. Other schemes route to a "drafter coming soon" stub.

The agent at `/chat` can hand off to a drafter once a user picks a scheme that has one. The drafter can also be entered directly from `/funds/[schemeId]` (skip-the-matching path for users who already know what they want).

---

## What to change

### 1. Landing page — position the agent as a matcher, drafter as a separate surface

- File: `src/app/page.tsx`
- Replace tagline `"Fund applications, done by an agent."` with copy that distinguishes the two surfaces. Suggested H1: `"Find the right HK grant. Then draft it."`
- Subline: `"Thunder matches your company to the schemes you qualify for. Easy BUD drafts available now — more schemes coming."`
- `metadata.title` and `metadata.description` (lines 9–14): rewrite to target `"Hong Kong SME grants 2026"` and `"Easy BUD 2026 application"` SEO. Title under 60 chars, description under 155.
- The four access-mode cards stay but with revised tags:
  - **In-house agent** — keep enabled, retag to `"Find your scheme"` (not "Get a draft"). The agent is matcher-first.
  - **REST API** — keep the card, badge it `"Coming soon"`. Link target stays `/rest-api` (see #1a).
  - **MCP server** — keep the card, badge it `"Coming soon"`. Link target stays `/mcp` (see #1a).
  - **Browse manually** — keep enabled.
- Add a small link above the fold: `"How does BUD reimbursement work?"` linking to `/reimbursement` (see #7).

### 1a. API and MCP routes — keep code, hide endpoints

- Files: `src/app/api/...` (REST API), `src/app/mcp/...` (MCP server route), and any related lib code.
- **Do not delete the implementation files.** The platform thesis is real for week-12+; we want the code to keep compiling.
- For each public-facing route under `src/app/rest-api/page.tsx` and `src/app/mcp/page.tsx`: render a "Coming soon" page describing what the endpoint will do, with an email-capture waitlist. No live functionality.
- For each internal API endpoint (e.g. routes that would be called by external clients): return `503 Service Unavailable` with a JSON body `{ "status": "coming_soon", "available": "post-launch" }`. Do not 404 — that loses the discoverability for crawlers and waitlist signups.
- `src/app/api/chat/route.ts` and `src/app/api/sessions/...` and `src/app/api/uploads/route.ts` stay live — they power the in-house agent.

### 2. Agent system prompt — keep general, do NOT bias to Easy BUD

- File: `src/lib/prompts/system.ts`
- The agent stays general. Its job is matching, not drafting. Do **not** hard-bias to Easy BUD.
- Keep the current Discover → Qualify loop. **Remove "Draft" from the agent's responsibilities.** The agent recommends schemes and qualifies the user; when the user picks a scheme, the UI hands them off to the per-scheme drafter at `/draft/[schemeId]`.
- Update the system prompt's three-phase description from "Discover → Qualify → Draft" to "Discover → Qualify → Hand off." Explicit instruction: "When the user is ready to draft, present a button/link to the drafter for their chosen scheme. Do not produce the draft yourself."
- Add a 3-month BUD cooldown question to the qualification phase for any BUD-track scheme (Easy BUD, BUD General, E-commerce Easy).
- Add: when activity descriptions imply outsourcing in the target market (relevant for Easy BUD), flag inline.
- The artifact panel that currently shows draft sections in chat should be repurposed for shortlists, eligibility readouts, and checklists only — not drafts.

### 3. Easy BUD scheme content — make it best-in-class

- File: `src/lib/schemes/easy-bud.ts`
- This must be the single deepest scheme file in the registry. Pull verbatim from `PRD.md` (Easy BUD Scheme Mechanics section + Appendix) and `hk_funding_schemes.md`.
- Required fields: `documentChecklist` (categorized as "needed now" vs "needed for reimbursement claim"), `eligibility` (employee count ≤ 100, non-listed, HK-registered, substantive HK ops, 3-month cooldown, HK$800K concurrent cap, HK$7M cumulative cap), `activityTypes` (all 10 from PRD section 4.1–4.10 with caps and notes).
- Add `whatKillsApplications` array — the bullet list from PRD ("Vague scope," "Activities run from target market," etc.).

### 4. Cut placeholder schemes from the static fallback

- File: `src/lib/schemes/index.ts`
- The current static fallback contains generic placeholder schemes ("Innovation Grant", "Startup Incubator Programme", "Digital Transformation Subsidy") that are NOT real HK schemes. This is embarrassing if the DB ever fails over.
- Replace the entire array with the six real HK schemes (Easy BUD deep, the others as stubs with `status: 'coming-soon'`). Or delete the fallback entirely and let the DB be the only source — fail loudly if unreachable.

### 5. Defer non-Easy-BUD schemes from launch

- Files: `src/lib/schemes/bud-general.ts`, `bud-ecommerce-easy.ts`, `itf.ts`, `hkstp.ts`, `createsmart.ts`
- Do **not** spend time filling these in for May 11. Set `status: 'coming-soon'` on each.
- In the scheme browser (`/funds`), render `coming-soon` schemes with a visible badge and a disabled "Start draft" button. Replace with `"Notify me when ready"` email capture.

### 6. SEO depth lives on the dynamic scheme detail page, NOT in hardcoded routes

**Architectural correction**: schemes are data. The dynamic route `src/app/funds/[schemeId]/page.tsx` already renders any scheme by id. Do **not** create hardcoded `/easy-bud-guide` or `/easy-bud-vs-general` routes — that would special-case the scheme registry and break the schemes-as-data invariant.

Instead, do the SEO work by deepening the **scheme record** and the **generic detail renderer**:

- File: `src/lib/schemes/easy-bud.ts` and `src/lib/schemes/content.ts` — extend the scheme content shape so it can carry long-form sections: `whatItIs`, `whoQualifies`, `eligibleActivities[]` (with caps), `whatKillsApplications[]`, `documentChecklist` (now/later), `cooldownRule`, `caps` (concurrent + cumulative), `comparedTo` (array of `{ schemeId, differences[] }` for cross-scheme comparison rendering).
- File: `src/app/funds/[schemeId]/page.tsx` — render whichever long-form sections the scheme record provides. Schemes with rich content (Easy BUD) automatically get a deep page; schemes with thin content stay thin. The generic renderer should already JSON-LD `Article` / `GovernmentService` schema.org markup for SEO.
- File: `src/app/funds/[schemeId]/page.tsx` — `generateMetadata` already exists. Make the title and description pull from the rich scheme content (e.g. `${scheme.name}: Eligibility, Activities, and How to Apply (2026)`) so the SEO target lives at `/funds/easy-bud` natively.
- For "Easy BUD vs General" comparisons: render a dynamic comparison block on the scheme detail page when `scheme.comparedTo` is populated. Optionally add a thin `src/app/funds/[schemeId]/vs/[otherId]/page.tsx` route later if you want comparison-pair SEO slugs — but only after Easy BUD's own page is shipping.

### 7. The reimbursement explainer — stays standalone

- New file: `src/app/reimbursement/page.tsx`
- This **is** worth a dedicated page because reimbursement-flow is a cross-cutting concept — it applies to Easy BUD, BUD General, E-commerce Easy, and any future BUD-style scheme. It's not scheme-specific content, so it doesn't fit cleanly into the scheme record.
- Public, indexable, no gate. Top-of-funnel SEO target ("how does HK BUD reimbursement work").
- Content: 25% post-completion, enterprise funds 100% upfront, external audit fee up to HK$5,000, final project report + audited accounts required, no payment until both accepted.
- Visual: simple flow diagram (project starts → enterprise pays → project ends → audit → claim → reimbursement received).
- Link to it from each BUD-track scheme detail page automatically — add a `relatedConcepts` array on the scheme record that the renderer uses.

### 9. Drafter — one generic flow, scheme-as-data

Per-scheme drafting is **just prompt assembly**. The scheme record already carries the eligibility rules, activity types, document checklist, what-kills-applications, caps, and form structure. The drafter is one generic function that injects the scheme record + the user's context into a prompt template and streams the result. No per-scheme module, no per-scheme intake.ts / prompt.ts / validate.ts.

**New lib (single file, generic):**
```
src/lib/drafter.ts           # buildDraftPrompt(scheme, userContext) + generateDraft(schemeId, userContext)
```

That's it. No `src/lib/drafters/easy-bud/` folder. No drafter registry. No DrafterModule interface.

**New routes:**
- `src/app/draft/[schemeId]/page.tsx` — reads the scheme record, renders an intake area, calls `generateDraft` and streams the result.
- `src/app/api/draft/[schemeId]/route.ts` — server endpoint that wraps `generateDraft` for streaming.

**Whether a scheme is "draftable" is a content question, not an engineering question.**
- Add a `draftable` boolean (or compute it: a scheme is draftable iff its record has the required rich-content fields — `eligibleActivities`, `documentChecklist`, `whatKillsApplications`, official form structure if available — populated above a quality threshold).
- Easy BUD is the only draftable scheme at v1 because it's the only scheme record filled in deeply enough. Adding ITF later is a content task — populate the scheme record, set `draftable: true`. No code change.
- `/draft/[schemeId]` for a non-draftable scheme renders "Drafter for {scheme.name} is coming soon" with email capture.

**Intake.** The user context fed into the prompt comes from the chat session (handed off from `/chat`) or from a small generic intake form on `/draft/[schemeId]/page.tsx` that asks for the universal fields (company name, employee count, target market, planned activities, budget, timeline). Anything scheme-specific the prompt needs is read from the scheme record itself; the user doesn't fill different forms for different schemes unless that becomes necessary later.

**No paywall on the rendered draft.** Gate only the PDF export (see #10).

**Entry points:** from `/chat` after qualification (with handoff carrying the conversation context), or directly from `/funds/easy-bud` for users skipping the matching step.

### 10. PDF export with email gate — the only monetization surface in v1

- New file: `src/app/api/draft/[schemeId]/pdf/route.ts` (or `src/app/api/applications/[id]/pdf/route.ts` if keyed by application).
- Server-side render via `@react-pdf/renderer`. Disclaimer footer on every page. AI-generated-draft notice at top.
- Gate on email submission. No password, no magic link. Capture email → store on the application/session record → return signed URL or stream the PDF.
- Optional small one-time fee (suggest HK$99 not HK$299) — Stripe Checkout flow only on this endpoint, not on the draft itself. Free in v1 is also defensible if the goal is purely audience-building.
- Defer full NextAuth magic-link auth from MVP_TODO Weekend 2. Anonymous sessions stay supported.

### 11. PDPO compliance — minimum viable

- New file: `src/app/privacy/page.tsx` — privacy notice covering: what data collected, retention period (suggest 90 days for chat sessions, indefinite for accounts), deletion-on-request flow, no sale/sharing, contact email.
- Add a footer link to `/privacy` on every page (likely `src/app/layout.tsx`).
- Add a one-line consent at the chat composer: `"By submitting you agree to our privacy notice"` with link.

### 12. ToS for liability

- New file: `src/app/terms/page.tsx`
- Minimum clauses: tool generates a draft for human review, not professional advisory services; user is responsible for accuracy of submission; no guarantee of approval; service provided as-is.
- Footer link on every page.
- Note: a HK lawyer should review this before public launch. Flag in `MVP_TODO.md` as a launch blocker.

### 13. Update PRD and MVP_TODO to reflect the shift

- File: `PRD.md` — add a header note: `"Strategy revised 2026-04-25: free-first launch, Easy BUD only, monetization moved to PDF export. Original HK$299 freemium gate plan deferred."` Don't delete the original sections; mark them as superseded.
- File: `MVP_TODO.md` — re-order: scheme content (Easy BUD only) → landing rewrite → 3 SEO pages → PDF export with email gate → privacy/ToS → ship. Drop auth, drop other scheme content, drop Stripe full integration.
- File: `README.md` — update the tagline (currently `"Conversational agent for SMEs..."`) to match the new landing copy.

---

## What NOT to do

- Do **not** add ITF, HKSTP, CreateSmart, BUD General, or E-commerce Easy content beyond status stubs.
- Do **not** build the four-surface platform (Thunder Filings, Firms, API). Brief sequences these to weeks 4–8 post-launch.
- Do **not** add full Stripe subscription billing. PDF export checkout only, if at all.
- Do **not** add Traditional Chinese support.
- Do **not** add multi-scheme eligibility scoring.
- Do **not** invest in MCP server or REST API surfaces for v1.

---

## Order of operations (suggested)

1. Extend the scheme content schema (`src/lib/schemes/content.ts`) to carry long-form fields (`whatItIs`, `eligibleActivities`, `whatKillsApplications`, `documentChecklist`, `cooldownRule`, `caps`, `comparedTo`, `relatedConcepts`).
2. Fill `easy-bud.ts` deeply against the new schema.
3. Replace placeholder schemes in `src/lib/schemes/index.ts` with real HK schemes (Easy BUD deep, others as `coming-soon` stubs).
4. Update `src/app/funds/[schemeId]/page.tsx` to render the new long-form fields and richer `generateMetadata`.
5. Update `src/lib/prompts/system.ts`: agent stays general matcher, drop "Draft" phase, add "Hand off" phase, add cooldown question for BUD-track schemes.
6. Build the generic drafter: `src/lib/drafter.ts` (`buildDraftPrompt` + `generateDraft`) and the routes `src/app/draft/[schemeId]/page.tsx` + `src/app/api/draft/[schemeId]/route.ts`. One implementation, scheme-parameterised. Add a `draftable` check that returns false for any scheme without the required rich-content fields.
7. Iterate the Easy BUD scheme record + the generic prompt template until Easy BUD drafts are good. The "Easy BUD drafter" is not a thing you build; it's the result of (rich Easy BUD record) × (generic drafter).
8. Rewrite `src/app/page.tsx` landing copy and tag REST API / MCP cards as "Coming soon."
9. Make `src/app/rest-api/page.tsx` and `src/app/mcp/page.tsx` render coming-soon pages with waitlist capture; gate any external-facing API endpoints with `503` + JSON body.
10. Build `/reimbursement` page.
11. Remove any draft-rendering from `ArtifactPanel.tsx`; repurpose for shortlists / eligibility / checklists only.
12. PDF export endpoint with email gate at `src/app/api/draft/[schemeId]/pdf/route.ts`.
13. `/privacy` and `/terms` pages + layout footer.
14. Update `PRD.md`, `MVP_TODO.md`, `README.md` to reflect the surface separation and new strategy.
15. Status badges + waitlist email capture on coming-soon scheme cards in the scheme browser.

---

## Acceptance check

When done, a user landing on the homepage cold should:
1. See a headline that frames Thunder as a matcher, with Easy BUD called out as the first available drafter.
2. Be able to read the Easy BUD scheme detail page (`/funds/easy-bud`) and the reimbursement explainer (`/reimbursement`) without signing up.
3. Be able to chat with the in-house agent for free and receive a recommendation of which schemes to pursue. The agent never produces a full draft itself — it hands off.
4. Be able to enter the Easy BUD drafter (`/draft/easy-bud`) directly or via the agent's hand-off button, complete intake, and receive a complete Easy BUD draft for free.
5. Only be asked for an email to download the PDF.
6. See "Coming soon" badges on REST API, MCP, and every scheme that is not Easy BUD.
7. See clear privacy and terms links in the footer.
