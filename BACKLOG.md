# Backlog — Post-Drafter Launch Items

> Drafter (Phases 1–7 of STRATEGY_REALIGN.md) is complete and working.
> The items below are the remaining planned phases. None are blocking Thunder's first live drafting surface from being used.

---

## Phase 6 — Coming-soon surfaces

- [ ] `src/app/rest-api/page.tsx` — replace live page with coming-soon + waitlist email capture
- [ ] `src/app/mcp/page.tsx` — same: MCP tool descriptions + waitlist
- [ ] `src/components/SchemeRow.tsx` / `SchemeBrowser.tsx` — add "Coming soon" badge on `status='coming-soon'` schemes; disable "Generate draft" button; add inline "Notify me when ready" email capture

---

## Phase 7 — Supporting content + legal

- [ ] `src/app/reimbursement/page.tsx` — public, no auth. Content: 25% post-completion reimbursement flow, enterprise 100% upfront, HK$5K audit fee cap, final report + audited accounts required. Include simple flow diagram.
- [ ] `src/app/privacy/page.tsx` — PDPO-aligned: data collected, 90-day draft session retention, deletion-on-request, no sale/sharing.
- [ ] `src/app/terms/page.tsx` — AI draft for human review (not professional advisory), user responsible for accuracy, no guarantee of approval. **Requires HK lawyer review before public launch.**
- [ ] `src/app/layout.tsx` — add minimal footer with Privacy / Terms / Reimbursement / Developers links + one-line consent at composer: "By generating you agree to our privacy notice"

---

## Phase 8 — PDF export with email gate

- [ ] `supabase/migrations/008_pdf_exports.sql` — new table `pdf_exports(id, email, scheme_id, created_at)`
- [ ] `src/app/api/draft/[schemeId]/pdf/route.ts` — POST `{ draftMarkdown, email, schemeId }`, validate email, log to DB, render PDF via `@react-pdf/renderer` with AI disclaimer header + footer, return `application/pdf` stream
- [ ] Wire "Download PDF" button in `Drafter.tsx` done-state toolbar — show email input modal before download
- [ ] No Stripe in v1. Stripe HK$99 toggle is post-launch.

---

## Phase 9 — Documentation

- [ ] `PRD.md` — add header note about April 25 strategy revision; fix Easy BUD cap (HK$150K); fix EMF consolidation date (June 30, 2026); mark superseded sections
- [ ] `MVP_TODO.md` — reorder to match Phases 1→9; drop NextAuth magic-link, full Stripe subscription, non–Easy-BUD scheme content, chat surface polish
- [ ] `README.md` — update tagline from "Conversational agent for SMEs…" to match asset-generator framing

---

## Acceptance checklist (from STRATEGY_REALIGN.md)

- [x] Cold landing: H1 + composer framing as "type your company → get an Easy BUD draft"
- [x] User can enter the drafter from homepage or `/funds/easy-bud` "Generate draft" CTA
- [x] Easy BUD draft streams as markdown artifact with `[TODO: ...]` markers
- [x] Refinement via single follow-up box (no threaded chat)
- [x] `/funds/easy-bud` public, no signup required
- [x] `/chat`, `/chat/*` → redirect to `/draft`
- [x] `/api/chat`, `/api/sessions/*` → 404 when `ENABLE_CHAT` unset
- [ ] Email asked only at PDF download
- [ ] Coming-soon badge on every non–Easy-BUD scheme
- [ ] `/reimbursement` public page live
- [ ] Footer on every page links to Privacy + Terms
- [ ] `npm run build` passes; `npm test` passes
