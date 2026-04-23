# MVP ??Remaining Work

**Launch target:** May 11, 2026
**Status as of:** April 24, 2026
**LLM provider:** OpenRouter

## What the MVP is

Thunder is a generic grant application drafting agent. The user describes their company (or drops in documents), the agent identifies relevant schemes from the catalog, asks focused questions, and produces a complete, ready-to-review application draft for whichever scheme they choose.

---

## Done ??

**Infrastructure**
- Supabase project live, schema run, smoke test passed
- `.env.local` fully populated (Supabase URL + keys, OpenRouter API key)
- Supabase SSR helpers (`src/utils/supabase/server.ts`, `client.ts`, `middleware.ts`)
- `src/lib/supabase.ts` ??service role client for internal API routes

**Backend**
- `src/lib/llm.ts` ??OpenRouter streaming + non-streaming client
- `src/app/api/chat/route.ts` ??real LLM streaming, session history in/out of Supabase, artifact emission
- `src/app/api/sessions/` ??Supabase-backed (no longer in-memory)
- `src/app/api/uploads/route.ts` ??text extraction working; Storage upload disabled for MVP (`storage_path` is null)
- `supabase/migrations/001_initial_schema.sql` ??`sessions` + `attachments` tables with RLS

**Agent**
- `src/lib/prompts/system.ts` ??generic system prompt, builds live scheme catalog from registry, Discover ??Qualify ??Draft loop

**Frontend**
- Chat surface (`/chat`, `/chat/[sessionId]`), composer as landing hero, suggestion chips
- `ArtifactPanel.tsx` ??shortlist, draft (sections + disclaimer), checklist (now/later) renderers
- Scheme browser (`/funds`) + fund detail pages (`/funds/[schemeId]`)
- Vercel/Geist visual system, theme toggle

---

## Remaining ??this weekend (Apr 26??7)

### 1. Scheme data quality

The agent tells users "verify against the official form" for 5 of 6 schemes because the document checklists are empty. Filling them in directly improves draft quality with no other code changes.

| Scheme file | Status |
|---|---|
| `easy-bud.ts` | ??Full document checklist + eligibility rules |
| `bud-general.ts` | ??Empty |
| `bud-ecommerce-easy.ts` | ??Empty |
| `itf.ts` | ??Empty |
| `hkstp.ts` | ??Empty |
| `createsmart.ts` | ??Empty |

For each stub: add `documentChecklist`, `eligibility` rules, and `activityTypes` from the official guidance pages.

### 2. Optional: PDF/DOCX attachment extraction

`pdf-parse` and `mammoth` are not installed ??plain text and CSV work without them.

```
npm install pdf-parse mammoth
npm install --save-dev @types/pdf-parse @types/mammoth
```

---

## Remaining ??second weekend (May 9??0)

### 3. Auth

- NextAuth.js magic-link email. No passwords.
- Wire `sessions.user_id` to the authenticated user.
- Anonymous sessions still work; payment requires sign-in.
- Replace service_role RLS policies with user-scoped `using (user_id = auth.uid())`.

### 4. Stripe payment gate

- Sections 1?? of a draft free; rest requires a one-time payment.
- Stripe Checkout ??webhook ??flip `paid = true` on the session/application.
- Gate in `DraftContent` renderer in `ArtifactPanel.tsx`.

### 5. PDF export

- `@react-pdf/renderer` template for the draft artifact.
- Generated server-side at `/api/applications/[id]/pdf`.
- Disclaimer footer on every page.

### 6. Landing SEO

- Meta title/description in `layout.tsx` targeting scheme names users search for.
- `robots.txt`, `sitemap.xml`, OG image.
- Sub-2s LCP on cold load.

---

## Out of scope for MVP

- Traditional Chinese support
- Accountant-reviewed tier
- Pro subscription
- Government portal submission integration
- Re-enabling Supabase Storage for file downloads (deferred ??`storage_path` column stays nullable)


## What the MVP is

Thunder is a generic grant application drafting agent. The user describes their company (or drops in documents), the agent identifies relevant schemes from the catalog, asks focused questions, and produces a complete, ready-to-review application draft for whichever scheme they choose. No scheme is hardcoded ??all logic is driven by the scheme registry and the LLM.
