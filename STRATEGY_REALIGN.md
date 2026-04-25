# Strategy Realignment — Implementation Brief

**Owner to implement:** another agent
**Author:** strategy review, 2026-04-25
**Launch target:** 2026-05-11

## Strategic shift

We are moving from a **HK$299-at-launch paid wedge** to a **free-first audience-building wedge**. The site goes open to the world. Easy BUD is the only thing the product does at launch. Monetization moves from the draft itself to PDF export (or stays free in v1). All other schemes appear as discovery content but have no drafter yet.

**The bigger shift:** the v1 product is **not a chat app**. It is a **standalone asset-generator** — same UX pattern as Midjourney, v0, Lovable, ChatGPT Canvas. One composer, one artifact (the draft), a refinement rail for follow-ups. No conversation panel, no Discover/Qualify dialogue, no matcher. The user describes their company once, the agent produces a complete Easy BUD draft, the user iterates on the artifact. The conversational matcher and any chat-style endpoints are **hidden** at launch — code stays in the repo, routes return 404 or redirect.

Do **not** expand scope. Do **not** try to ship a complete HK funding directory. Do **not** ship the matcher. Cut, don't add.

## Product surface — single surface, asset-generator pattern

One surface. One job. The drafter.

- **`/draft` (new — the entire product at launch)** — composer + artifact + refinement rail. User lands, types/pastes their company context, hits generate, gets a streamed Easy BUD draft as an artifact. Refinement happens by editing the intake or by issuing follow-ups against the artifact ("make section 3 more concrete," "shorten the executive summary"). It looks and feels like v0/Lovable, not like ChatGPT.
- **`/funds/[schemeId]` (existing)** — public scheme detail pages rendered from corpus markdown. Top-of-funnel SEO. Easy BUD's page has a "Draft this" CTA that launches `/draft`. Other schemes' pages show "Drafter coming soon" + waitlist.
- **`/reimbursement` (new)** — standalone explainer page (cross-cutting concept; see section 7).

Hidden at v1:
- `/chat`, `/chat/[sessionId]` — return 404 or redirect to `/draft`.
- `/api/chat/*` — keep code, gate behind a feature flag (`ENABLE_CHAT=false` in production env). The matcher is a post-launch feature; we don't delete it but we don't expose it.
- REST API and MCP — coming-soon waitlist pages, endpoints return 503 (see section 1a).

**Why a single surface:** asset generators win on first-impression clarity. "Type your company → get a draft" is a 5-second pitch. Adding a matcher in the same launch dilutes the message and doubles the surface area we have to make good in 16 days. The matcher is a great post-launch chapter once the drafter is loved.

---

## What to change

### 1. Landing page — composer is the product, not a directory

- File: `src/app/page.tsx`
- Replace tagline `"Fund applications, done by an agent."` with copy that frames the drafter as a generator. Suggested H1: `"Generate your Easy BUD application."` Subline: `"Describe your company. Get a complete HK$150,000 Easy BUD draft in under a minute. Free."`
- The hero **is** the composer. A textarea + "Generate draft" button, prominent above the fold. Submitting it routes into `/draft` with the input pre-filled (or `/draft` directly hosts the composer and the homepage is `/draft` styled differently — implementer's call). Treat the composer as the single primary CTA on the page.
- Drop the four-card "access modes" grid. It frames Thunder as a directory of surfaces; we want it framed as a tool. If the cards must stay for now, replace them with: (a) "Draft your Easy BUD" — primary, links to composer. (b) "Browse HK schemes" — secondary, links to `/funds`. (c) "How reimbursement works" — tertiary, links to `/reimbursement`. No "In-house agent" card. No "REST API" card. No "MCP server" card on the landing — those move to a footer "Developers" link.
- `metadata.title` and `metadata.description`: rewrite to target `"Easy BUD 2026 application"` and `"HK SME grant draft"` SEO. Title under 60 chars, description under 155.
- Below the composer, a thin row of social proof / scheme detail teasers: "Built on the April 23 HKPC enhancement" + link to `/funds/easy-bud` + link to `/reimbursement`.

### 1a. API, MCP, and chat routes — keep code, hide endpoints

- Files: `src/app/api/...` (REST API), `src/app/mcp/...` (MCP server route), `src/app/chat/...`, `src/app/api/chat/...`, and any related lib code.
- **Do not delete the implementation files.** The matcher and the platform thesis are real for week-12+; we want the code to keep compiling and tests to keep running.
- `src/app/chat/page.tsx` and `src/app/chat/[sessionId]/page.tsx` — make them return `notFound()` (404) or redirect to `/draft`. Add a `// HIDDEN AT LAUNCH — see STRATEGY_REALIGN.md` comment at the top so the next person doesn't accidentally re-expose them.
- `src/app/api/chat/route.ts` — gate behind a server-side feature flag. Read `process.env.ENABLE_CHAT`. Default `false` in production. Return `404` when disabled. Same for `/api/sessions/*` and any other chat-supporting endpoints (uploads stay live if the drafter uses them; otherwise gate them too).
- For each public-facing route under `src/app/rest-api/page.tsx` and `src/app/mcp/page.tsx`: render a "Coming soon" page describing what the endpoint will do, with an email-capture waitlist. No live functionality.
- For external-facing API endpoints (those that would be called by third parties): return `503 Service Unavailable` with a JSON body `{ "status": "coming_soon", "available": "post-launch" }`. Do not 404 — that loses crawler discoverability and waitlist signups.

### 2. System prompt — drafter only, no Discover/Qualify

- File: `src/lib/prompts/system.ts`
- The current prompt is a Discover → Qualify → Draft conversational agent. Rewrite as a **drafter-only** asset generator.
- Identity: "You are Thunder, a drafting agent for Hong Kong government grant applications. Your sole output is a complete, well-structured draft of the application identified in the user's request, ready for human review."
- Behaviour: produce the draft on the first turn. Do not ask clarifying questions unless the input is so sparse that drafting would be guesswork (no company name, no products, no markets). When information is missing, **fill the gaps with `[TODO: <what's needed>]` markers inside the draft** rather than stopping to ask.
- Cooldown / eligibility / activity-type rules live in the scheme corpus, not the system prompt. The drafter reads `scheme.corpus` JIT (see section 9) and respects it.
- Refinement turns: when the user issues a follow-up ("shorten section 3," "the company name is X"), edit the existing artifact rather than starting over. The route handler should pass the prior draft as part of the context.
- Remove all language about "Discover," "Qualify," shortlists, recommendations, comparing schemes. That's the matcher's job, and the matcher is hidden.

### 3. Schemes are facets + corpus + JIT LLM reasoning — NOT structured eligibility/activity fields

**Architecture clarification:** Supabase is now the source of truth for scheme data. Each scheme record carries:

- **Structured facets** (the small set of values needed for filtering, badges, and stat cards): `id`, `name`, `sponsor`, `status`, `category`, `funding_cap`, `currency`, `duration_months`, `source_url`, `short_description`, `links[]`, optionally `draftable` boolean and `compared_to[]` ids.
- **Unstructured corpus** (one or more markdown columns): the full guidance content for the scheme — eligibility rules, activity types, document checklists, what kills applications, caps, cooldowns, official form structure, examples. Curated as prose, not schema.

**Do NOT** introduce structured fields like `eligibleActivities[]`, `whatKillsApplications[]`, `documentChecklist`, `eligibility`, `cooldownRule`, `caps`, `activityTypes`. They're a maintenance liability and they constrain what the LLM can reason about. Instead, write the equivalent information as markdown sections inside the corpus and let the LLM (drafter, public detail page) read it just-in-time.

**Why this matters:**
- New scheme = new corpus markdown. No code changes, no schema migration, no field-mapping decisions.
- The same corpus serves two consumers at launch: the drafter (prompt context) and the public scheme detail page (rendered as markdown). Post-launch the matcher becomes a third consumer — same corpus, no work to add it.
- The corpus IS the moat. Curating high-quality, comprehensive, well-structured prose per scheme is the actual work — not designing TypeScript types.

### 4. Static TS files in `src/lib/schemes/` — treat as legacy / minimal fallback

- The DB is now source of truth (verify the schema against `supabase/migrations/001_initial_schema.sql`). The static files (`easy-bud.ts`, `bud-general.ts`, etc.) and `src/lib/schemes/index.ts` are no longer where content lives.
- Action: keep the files only as a thin fallback for DB outages. The fallback should mirror the DB schema (facets + corpus markdown), not the old structured fields. If maintaining a fallback is more work than it's worth, delete the static array entirely and have `getAllSchemesFromDatabase` throw loudly when the DB is unreachable — better to error than to serve placeholder "Innovation Grant" data.
- All scheme content work for the next two weeks happens **in the database**, via Supabase dashboard or a migration script — not in TypeScript files.

### 5. Defer non-Easy-BUD schemes from launch

- Files: `src/lib/schemes/bud-general.ts`, `bud-ecommerce-easy.ts`, `itf.ts`, `hkstp.ts`, `createsmart.ts`
- Do **not** spend time filling these in for May 11. Set `status: 'coming-soon'` on each.
- In the scheme browser (`/funds`), render `coming-soon` schemes with a visible badge and a disabled "Generate draft" button. Replace with `"Notify me when ready"` email capture.

### 6. SEO depth lives on the dynamic scheme detail page rendering the corpus markdown

**Architectural correction**: schemes are facets + corpus. The dynamic route `src/app/funds/[schemeId]/page.tsx` already renders any scheme by id. Do **not** create hardcoded `/easy-bud-guide` or `/easy-bud-vs-general` routes — that would special-case the registry. Do **not** introduce a structured long-form content shape (no `whatItIs`, `eligibleActivities`, etc. fields).

Instead:

- The scheme record's `corpus` (or whatever the column ends up being named — e.g. `guidance_md`) carries everything: what it is, who qualifies, eligible activities with caps, what kills applications, document checklist, cooldown rule, concurrent + cumulative caps, comparison notes against other schemes.
- File: `src/app/funds/[schemeId]/page.tsx` — render the corpus markdown to HTML. Schemes with rich corpus (Easy BUD) automatically get a deep page; schemes with thin corpus stay thin. Add JSON-LD `Article` / `GovernmentService` schema.org markup for SEO.
- File: `src/app/funds/[schemeId]/page.tsx` — `generateMetadata` already exists. Title and description pull from the structured facets (`name`, `short_description`) so SEO targets like `/funds/easy-bud` work natively. Optionally extract H1/first-paragraph from the corpus for richer descriptions.
- Add a primary CTA on the Easy BUD page (and only on draftable schemes): a button that launches the drafter at `/draft` pre-loaded with the scheme context.
- For "Easy BUD vs General" — write the comparison as a markdown section *inside* Easy BUD's corpus (and/or BUD General's corpus). The renderer just shows it. No new field, no new route.

### 7. The reimbursement explainer — stays standalone

- New file: `src/app/reimbursement/page.tsx`
- This **is** worth a dedicated page because reimbursement-flow is a cross-cutting concept — it applies to Easy BUD, BUD General, E-commerce Easy, and any future BUD-style scheme. It's not scheme-specific content, so it doesn't fit cleanly into the scheme record.
- Public, indexable, no gate. Top-of-funnel SEO target ("how does HK BUD reimbursement work").
- Content: 25% post-completion, enterprise funds 100% upfront, external audit fee up to HK$5,000, final project report + audited accounts required, no payment until both accepted.
- Visual: simple flow diagram (project starts → enterprise pays → project ends → audit → claim → reimbursement received).
- Link to it from each BUD-track scheme detail page automatically — add a `relatedConcepts` array on the scheme record that the renderer uses.

### 9. Drafter UX — composer + artifact + refinement rail

The drafter is the **whole product** at v1. Build it as an asset generator, not a chatbot.

**Layout (suggested, single page at `/draft`):**
- Left rail (or top, on mobile): the **intake composer**. A single big textarea pre-labeled "Tell us about your company and what you want funded" + a small structured strip below it (company name, employee count, target market, planned activities, budget, timeline) — these populate the prompt but the user can leave any of them blank. A primary "Generate draft" button. After the first generation, this rail becomes the place where the user edits inputs and re-generates.
- Right pane (or below, on mobile): the **artifact** — the streamed draft, rendered as structured markdown with the application's section headings (Executive Summary, Project Description, Activities, Budget, Timeline, etc.). Streams in section by section. A small toolbar on top: copy, download PDF (gated, see §10), regenerate.
- Below the artifact: the **refinement rail** — a single follow-up textbox, "Refine this draft." Submitting issues a refinement turn against the existing artifact. No threaded conversation, no chat bubbles, no avatars. The artifact updates in place; old versions are accessible via a small history dropdown if implementer wants (nice-to-have, not launch-blocking).

**What this is NOT:**
- Not a chat panel with an agent persona.
- Not a multi-step Discover → Qualify → Draft wizard.
- Not a form-per-question intake. The composer is one big freeform field with optional structured hints.

**Reuse from existing chat code:** the streaming infrastructure (OpenRouter SSE, message parsing, artifact panel) is already in `src/components/ArtifactPanel.tsx` and the chat route. Copy/lift it into a `/draft` UI rather than rebuilding from scratch. Strip out the conversation list, the bubble chrome, and any "Discover/Qualify" UI affordances.

**Engine — one generic flow, corpus-as-context.** Per-scheme drafting is **just prompt assembly**. The scheme record's corpus carries every rule the LLM needs. The drafter is one generic function:

```
src/lib/drafter.ts           # buildDraftPrompt(scheme, userContext, priorDraft?) + generateDraft(schemeId, userContext, priorDraft?)
```

`buildDraftPrompt` reads `scheme.name`, `scheme.short_description`, and `scheme.corpus`, then composes a prompt that says: "Here is the scheme guidance. Here is the user context. [If priorDraft: here is the current draft and the refinement instruction.] Produce an application draft that respects every rule in the guidance. Use [TODO: ...] markers wherever the user context is insufficient." That's the whole engine.

**New routes:**
- `src/app/draft/page.tsx` — the v1 surface. Defaults to Easy BUD because it's the only draftable scheme. Renders the composer + artifact + refinement rail.
- `src/app/draft/[schemeId]/page.tsx` — same UI, scheme bound. Easy BUD lives at `/draft/easy-bud`. Other schemes render "Drafter for {scheme.name} is coming soon" + waitlist email capture.
- `src/app/api/draft/[schemeId]/route.ts` — server endpoint that wraps `generateDraft` for streaming. Accepts `userContext` and optional `priorDraft` + `refinementInstruction`.

**Whether a scheme is draftable is a content question.**
- Either store a `draftable` boolean on the scheme record, or derive it from corpus length / quality threshold.
- Easy BUD is the only draftable scheme at v1 because its corpus is the only one filled in deeply enough. Adding ITF later = write ITF corpus, flip `draftable: true`. No code change.

**Eligibility judgement is JIT.** Let the LLM read the corpus and reason against the user context. Do not write code that validates "employee_count <= 100" or "duration_months <= 12" — let the LLM check the user's context against the corpus and call out violations inline (e.g. "[NOTE: this proposed budget exceeds the HK$150,000 cap]").

**Risks to mitigate:**
- *Vague inputs produce vague drafts.* Mitigation: the system prompt instructs the model to fill gaps with `[TODO: <what's needed>]` markers, and the UI surfaces a count of TODOs at the top of the artifact ("12 items need your input") so the user can't miss them.
- *Refinement turns balloon token cost.* Mitigation: refinement passes only the current draft + the user's refinement instruction back to the model, not the full conversation history. Cap iterations soft (no hard limit at v1; instrument and watch).

**No paywall on the rendered draft.** Gate only the PDF export (see §10).

### 10. PDF export with email gate — the only monetization surface in v1

- New file: `src/app/api/draft/[schemeId]/pdf/route.ts` (or `src/app/api/applications/[id]/pdf/route.ts` if keyed by application).
- Server-side render via `@react-pdf/renderer`. Disclaimer footer on every page. AI-generated-draft notice at top.
- Gate on email submission. No password, no magic link. Capture email → store on the application/session record → return signed URL or stream the PDF.
- Optional small one-time fee (suggest HK$99 not HK$299) — Stripe Checkout flow only on this endpoint, not on the draft itself. Free in v1 is also defensible if the goal is purely audience-building.
- Defer full NextAuth magic-link auth from MVP_TODO Weekend 2. Anonymous sessions stay supported.

### 11. PDPO compliance — minimum viable

- New file: `src/app/privacy/page.tsx` — privacy notice covering: what data collected, retention period (suggest 90 days for draft sessions, indefinite for accounts), deletion-on-request flow, no sale/sharing, contact email.
- Add a footer link to `/privacy` on every page (likely `src/app/layout.tsx`).
- Add a one-line consent at the drafter composer: `"By generating you agree to our privacy notice"` with link.

### 12. ToS for liability

- New file: `src/app/terms/page.tsx`
- Minimum clauses: tool generates a draft for human review, not professional advisory services; user is responsible for accuracy of submission; no guarantee of approval; service provided as-is.
- Footer link on every page.
- Note: a HK lawyer should review this before public launch. Flag in `MVP_TODO.md` as a launch blocker.

### 13. Update PRD and MVP_TODO to reflect the shift

- File: `PRD.md` — add a header note: `"Strategy revised 2026-04-25: free-first launch, Easy BUD-only asset-generator, conversational matcher hidden, monetization moved to PDF export. Original HK$299 freemium gate plan deferred."` Don't delete the original sections; mark them as superseded. Also fix two data errors: Easy BUD cap is **HK$150,000** (per 2026-27 Budget enhancement), and EMF consolidates into BUD on **June 30, 2026** (not July).
- File: `MVP_TODO.md` — re-order: scheme content (Easy BUD only) → drafter UX build → landing rewrite → scheme detail page rendering → reimbursement page → PDF export with email gate → privacy/ToS → ship. Drop auth, drop other scheme content, drop Stripe full integration, drop chat surface work.
- File: `README.md` — update the tagline (currently `"Conversational agent for SMEs..."`) to match the new asset-generator framing.

---

## What NOT to do

- Do **not** ship the conversational matcher (`/chat`) at launch. Hide it. Code stays.
- Do **not** add ITF, HKSTP, CreateSmart, BUD General, or E-commerce Easy content beyond status stubs.
- Do **not** build the four-surface platform (Thunder Filings, Firms, API). Brief sequences these to weeks 4–8 post-launch.
- Do **not** add full Stripe subscription billing. PDF export checkout only, if at all.
- Do **not** add Traditional Chinese support.
- Do **not** add multi-scheme eligibility scoring.
- Do **not** invest in MCP server or REST API surfaces for v1.
- Do **not** rebuild the streaming/artifact infrastructure from scratch. Lift it from the existing chat code.

---

## Order of operations (suggested)

1. Inspect the current Supabase schema (`supabase/migrations/001_initial_schema.sql`) and `src/lib/schemes/db.ts`. Confirm the scheme record carries a corpus column (markdown). If not, add one via migration. Drop or ignore any structured eligibility/activities/checklist columns — those become corpus content.
2. Curate Easy BUD corpus deeply in the DB (Supabase dashboard or migration). Pull from `PRD.md` Easy BUD Scheme Mechanics + Appendix and the April 23 HKPC materials. Update the funding cap to **HK$150,000** (2026-27 Budget enhancement, not HK$100K). Note the EMF consolidation date is **June 30, 2026** (not July).
3. Add stub corpus content for BUD General and BUD E-commerce Easy — enough for the public detail page to render. No drafter for these in v1.
4. Mark ITF, HKSTP, CreateSmart, EMF as `coming-soon` or remove them depending on whether they belong in the launch directory (see "Scheme focus" section below).
5. Update `src/app/funds/[schemeId]/page.tsx` to render the corpus markdown + JSON-LD schema.org markup. Add a primary "Generate draft" CTA on draftable schemes (Easy BUD only at v1).
6. Hide the matcher: make `src/app/chat/*` return 404 / redirect to `/draft`; gate `src/app/api/chat/*` and `src/app/api/sessions/*` behind `ENABLE_CHAT` env flag (default false in production). Keep all source files in place with a hidden-at-launch comment header.
7. Rewrite `src/lib/prompts/system.ts` as a drafter-only system prompt. Drop Discover/Qualify language. Add the `[TODO: ...]` gap-marker behaviour.
8. Build the generic drafter engine: `src/lib/drafter.ts` (`buildDraftPrompt(scheme, userContext, priorDraft?)` + `generateDraft(schemeId, userContext, priorDraft?)`). Reads `scheme.corpus` from the DB; LLM does the reasoning JIT.
9. Build the asset-generator UI: `src/app/draft/page.tsx` (defaults to Easy BUD) + `src/app/draft/[schemeId]/page.tsx`. Composer on left, artifact on right, refinement rail below. Lift streaming/artifact rendering from the existing chat code.
10. Build the streaming endpoint `src/app/api/draft/[schemeId]/route.ts`.
11. Iterate Easy BUD corpus + generic prompt template until Easy BUD drafts are reliably good. The corpus is the lever — when drafts go wrong, fix the corpus, not the code.
12. Rewrite `src/app/page.tsx` landing copy: composer is the hero, scheme directory and reimbursement explainer are secondary links. Drop the four-card access grid (or replace with three simple links). Tag any remaining REST API / MCP cards as "Coming soon."
13. Make `src/app/rest-api/page.tsx` and `src/app/mcp/page.tsx` render coming-soon pages with waitlist capture. Gate any external-facing API endpoints with `503` + JSON body.
14. Build `/reimbursement` page.
15. PDF export endpoint with email gate at `src/app/api/draft/[schemeId]/pdf/route.ts`.
16. `/privacy` and `/terms` pages + layout footer.
17. Update `PRD.md` (HK$150K cap, June 30 EMF date, single-surface architecture, hidden matcher, new strategy), `MVP_TODO.md`, `README.md`.
18. Status badges + waitlist email capture on coming-soon scheme cards in the scheme browser.

## Scheme focus for May 11

Based on web search confirmation (April 25, 2026):

**Tier 1 — drafter ready, corpus deep:**
- Easy BUD (HK$150,000 cap per 2026-27 Budget; one application every 3 months; April 23 enhancement live)

**Tier 2 — directory only, scheme detail page renders, no drafter:**
- BUD General (HK$800K cap, 24 months, can engage external service providers)
- BUD E-commerce Easy (HK$800K cap, e-commerce specific)

**Tier 3 — corpus stub only, no SEO investment:**
- ITF Enterprise Support Scheme (HK$10M, 1:1 match, R&D-heavy)

**Drop from launch entirely:**
- TVP — closed Dec 31, 2024. Don't list as active anywhere.
- EMF — folding into BUD on June 30, 2026. Don't build drafting; redirect to BUD.
- HKSTP / Cyberport incubation — admissions process, not grant application. Different category. Remove from registry or move to a separate "incubators" section with a clear "this is not a grant application" caveat.
- CreateSmart — niche to creative industries, low volume. Skip.

---

## Acceptance check

When done, a user landing on the homepage cold should:
1. See a headline + composer that frames Thunder as a "type your company → get an Easy BUD draft" generator. No chat persona, no matcher CTA.
2. Be able to enter the Easy BUD drafter directly from the homepage composer or via the `/funds/easy-bud` "Generate draft" CTA.
3. Receive a complete, streamed Easy BUD draft as an artifact, with `[TODO: ...]` markers for missing inputs and a TODO count surfaced at the top.
4. Be able to refine the draft via a single follow-up box (no threaded chat).
5. Be able to read the Easy BUD scheme detail page (`/funds/easy-bud`) and the reimbursement explainer (`/reimbursement`) without signing up.
6. Only be asked for an email to download the PDF.
7. See "Coming soon" badges on every scheme that is not Easy BUD.
8. Hit a 404 (or redirect to `/draft`) on `/chat` and `/chat/*`.
9. Hit a 503 with `{"status":"coming_soon"}` on REST API endpoints; see waitlist pages at `/rest-api` and `/mcp`.
10. See clear privacy and terms links in the footer.
