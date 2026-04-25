# MVP Remaining Work

**Launch target:** May 11, 2026
**Status as of:** April 25, 2026 (revised)
**LLM provider:** OpenRouter

> **Strategy revised 2026-04-25:** Free-first, Easy BUD only. Auth and Stripe full billing deferred. PDF export gated behind email capture only. See `STRATEGY_REALIGN.md` for full rationale.

---

## What the MVP is

Thunder is an Easy BUD grant application drafting agent. Users describe their company, the agent qualifies them against Easy BUD criteria, and produces a complete, ready-to-review draft — for free. The only gate is an email address to download the PDF.

---

## Done ✅

**Infrastructure**
- Supabase project live, schema run, smoke test passed
- `.env.local` fully populated (Supabase URL + keys, OpenRouter API key)
- Supabase SSR helpers (`src/utils/supabase/server.ts`, `client.ts`, `middleware.ts`)
- `src/lib/supabase.ts` — service role client for internal API routes

**Backend**
- `src/lib/llm.ts` — OpenRouter streaming + non-streaming client
- `src/app/api/chat/route.ts` — real LLM streaming, session history in/out of Supabase, artifact emission
- `src/app/api/sessions/` — Supabase-backed (no longer in-memory)
- `src/app/api/uploads/route.ts` — text extraction working; Storage upload disabled for MVP (`storage_path` is null)
- `supabase/migrations/001_initial_schema.sql` — `sessions` + `attachments` tables with RLS

**Agent**
- `src/lib/prompts/system.ts` — system prompt, scheme catalog, Discover → Qualify → Draft loop

**Frontend**
- Chat surface (`/chat`, `/chat/[sessionId]`), composer as landing hero, suggestion chips
- `ArtifactPanel.tsx` — shortlist, draft (sections + disclaimer), checklist (now/later) renderers
- Scheme browser (`/funds`) + fund detail pages (`/funds/[schemeId]`)
- Vercel/Geist visual system, theme toggle

---

## Weekend 1 — Apr 26–27 (scheme content + core UX)

### 1. Easy BUD scheme content — make it best-in-class ⚡ highest leverage

File: `src/lib/schemes/easy-bud.ts`

This is the single deepest scheme file. Pull from `PRD.md` (Easy BUD Scheme Mechanics + Appendix) and `hk_funding_schemes.md`.

Required additions:
- `documentChecklist` — categorized as "needed now" vs "needed for reimbursement claim"
- `eligibility` — employee count ≤ 100, non-listed, HK-registered, substantive HK ops, 3-month cooldown, HK$800K concurrent cap, HK$7M cumulative cap
- `activityTypes` — all 10 types (4.1–4.10) with caps and notes
- `whatKillsApplications` array — vague scope, outsourcing to target market entity, extension requests, out-of-list markets, cap circumvention

### 2. Replace placeholder schemes in index.ts

File: `src/lib/schemes/index.ts`

The static fallback has fake schemes ("Innovation Grant", "Startup Incubator Programme", "Digital Transformation Subsidy"). Replace with the six real HK schemes:
- Easy BUD: full content (from step 1)
- bud-general, bud-ecommerce-easy, itf, hkstp, createsmart: set `status: 'coming-soon'` with stub data only

Option B: delete the fallback entirely and fail loudly if DB is unreachable.

### 3. Rewrite landing page

File: `src/app/page.tsx`

- Replace tagline with: `"Draft your Easy BUD application this weekend."`
- Replace subline with: `"Hong Kong's HK$100,000 grant for SMEs. Free draft. No HK$10,000 consultant."`
- Rewrite `metadata.title` (under 60 chars) and `metadata.description` (under 155 chars) targeting "Easy BUD 2026 application"
- Remove or de-emphasize REST API / MCP access-mode cards (move to `/developers` or delete)
- Add above-the-fold link: `"How does BUD reimbursement work?"` → `/reimbursement`

### 4. Bias system prompt toward Easy BUD + add cooldown check

File: `src/lib/prompts/system.ts`

- In "How to behave": unless user explicitly asks about another scheme, default to Easy BUD eligibility and drafting
- Tighten qualification step: surface **3-month BUD cooldown** check upfront ("have you submitted any BUD application in the last 3 months?")
- Add inline flag: if user describes activities implying outsourcing in target market, flag that Easy BUD requires self-implementation by the HK entity

### 5. Remove the hard paywall from ArtifactPanel

File: `src/components/chat/ArtifactPanel.tsx` (DraftContent renderer)

- Render **all draft sections free** — no blur, no Stripe gate
- Gate only the PDF export behind email capture (step 7)

### 6. Coming-soon badges on non-Easy-BUD schemes

Files: scheme browser (`/funds`), scheme files listed in step 2

- Render `coming-soon` schemes with a visible badge
- Disable "Start draft" button on coming-soon schemes
- Replace with a `"Notify me when ready"` email capture field

---

## Weekend 2 — May 2–3 (SEO pages + PDF export)

### 7. PDF export with email gate

Files: `src/app/api/applications/[id]/pdf/route.ts` (new), `@react-pdf/renderer`

- Generate draft as formatted PDF server-side
- Require email submission before download link is returned (no magic link, no password)
- Disclaimer footer on every page
- Target: file generated within 10 seconds of request

### 8. New page: `/reimbursement`

File: `src/app/reimbursement/page.tsx` (new)

- Public, indexable, no gate
- Content: how BUD reimbursement works — 25% post-completion, enterprise funds 100% upfront, external audit fee up to HK$5,000, final project report + audited accounts required
- Visual: simple flow diagram (project starts → enterprise pays → project ends → audit → claim → reimbursement received)

### 9. New page: `/easy-bud-guide`

File: `src/app/easy-bud-guide/page.tsx` (new)

- Long-form Easy BUD explainer (pull from PRD Appendix + activity table 4.1–4.10)
- Sections: what it is, who qualifies, eligible activities (10 types with caps), what kills applications, document checklist, 3-month cooldown, HK$800K and HK$7M caps
- CTA at end: "Start your Easy BUD draft" → `/chat`

### 10. New page: `/easy-bud-vs-general`

File: `src/app/easy-bud-vs-general/page.tsx` (new)

- Comparison table (pull from PRD Appendix "Easy BUD vs General Application")
- High-intent SEO target; clean table + ~200 words of context

---

## Weekend 3 — May 9–10 (compliance + launch polish)

### 11. Privacy notice page

File: `src/app/privacy/page.tsx` (new)

- Public, indexable
- Covers: data collected, retention (suggest 90 days for chat sessions), deletion-on-request, no sale/sharing, contact email
- Add footer link in `src/app/layout.tsx`
- Add one-line consent at chat composer: `"By submitting you agree to our privacy notice"` with link

### 12. Terms of service page

File: `src/app/terms/page.tsx` (new)

- Minimum clauses: draft is for human review, not professional advisory; user responsible for accuracy; no approval guarantee; service as-is
- **🚨 Launch blocker: have a HK lawyer review before May 11**
- Add footer link in `src/app/layout.tsx`

### 13. Landing SEO hygiene

- `robots.txt`, `sitemap.xml` (include `/reimbursement`, `/easy-bud-guide`, `/easy-bud-vs-general`)
- OG image
- Sub-2s LCP on cold load

### 14. Optional: PDF/DOCX attachment extraction

`pdf-parse` and `mammoth` are not installed — plain text and CSV work without them. Install only if time permits:

```
npm install pdf-parse mammoth
npm install --save-dev @types/pdf-parse @types/mammoth
```

---

## Deferred — do NOT build for launch

- ~~Full NextAuth magic-link auth~~ — anonymous sessions are fine; email only needed at PDF export
- ~~HK$299 Stripe payment gate on draft sections~~ — free draft is the v1 model
- ~~Full Stripe subscription billing / Pro tier~~ — post-launch
- ~~BUD General / E-commerce Easy / ITF / HKSTP / CreateSmart content~~ — stubs + coming-soon only
- ~~Multi-scheme eligibility scoring~~ — Easy BUD only for v1
- ~~REST API / MCP server surfaces~~ — post-launch
- ~~Traditional Chinese support~~ — post-launch
- ~~Accountant-reviewed tier (HK$1,499)~~ — post-launch
- ~~Re-enabling Supabase Storage for file downloads~~ — `storage_path` stays nullable

---

## Acceptance check (launch gate)

A user landing cold should:
1. See "Easy BUD" in the headline
2. Read the full Easy BUD guide and reimbursement explainer without signing up
3. Start a chat and receive a **complete** Easy BUD draft for free
4. Only be asked for an email to download the PDF
5. See privacy and terms links in the footer
6. See "coming soon" badges on every scheme that is not Easy BUD
