# System Design — SME Grant Navigator v1

## Architecture Overview

```
Browser
  │
  ├── / (Landing page — SSR)
  ├── /apply (Client component — intake form)
  ├── /match (Client component — eligibility result)
  └── /draft/[grantId] (Client component — draft viewer + paywall)
       │
       ▼
Next.js API Routes (server-side only — secrets never reach browser)
  ├── POST /api/match          ← eligibility check (hard rules + Claude)
  ├── POST /api/draft          ← draft generation (streaming)
  ├── GET  /api/draft          ← fetch draft (gates sections if unpaid)
  ├── POST /api/checkout       ← create Stripe Checkout session
  └── POST /api/webhooks/stripe ← payment confirmation → unlock draft
       │
       ├── Anthropic Claude API (draft generation + eligibility scoring)
       ├── Supabase (draft storage + payment status)
       └── Stripe (payment processing)
```

## Key Architectural Decisions

### 1. No auth in v1 — session tokens
**Decision:** Use a client-generated UUID (stored in `sessionStorage`) as an ownership token for drafts. No login required.

**Why:** Auth (NextAuth + Supabase) adds 1–2 days of build time. For a 10-paying-user target, it's not worth it. Session tokens are sufficient: the draft is linked to the token, and the Stripe webhook marks the draft as paid by draft ID.

**Trade-off:** Users lose access if they clear sessionStorage. Acceptable at this scale. Add auth in v2.

**Revisit when:** Users want to access drafts across devices, or we launch the Pro subscription tier.

---

### 2. Streaming draft generation
**Decision:** Stream the Claude response to the browser using `ReadableStream` rather than waiting for the full response.

**Why:** Draft generation takes 30–60 seconds. A blank screen for 60 seconds loses users. Streaming shows progressive output and signals that something is happening.

**Trade-off:** We need to buffer the full response server-side to parse the JSON and store it in Supabase. This means holding the full streamed text in memory before closing the connection. At current scale this is fine.

**Implementation note:** The API sends a `[DRAFT_ID:uuid]` sentinel at the end of the stream so the browser knows when to redirect to the draft page.

---

### 3. Server-side section gating
**Decision:** The `GET /api/draft` endpoint filters out unpaid sections server-side. The browser never receives locked content.

**Why:** Client-side gating (blur/hide) is trivially bypassable. For a paid product, sections must be gated at the API level.

**Trade-off:** Slightly more complex API, but correct.

---

### 4. Two-stage eligibility check
**Decision:** Run deterministic hard rules first (fast, no API call), then layer Claude's soft assessment on top.

**Why:** Hard rules catch clear blockers instantly (listed company, >12 months duration, no target markets). Claude adds contextual advice ("your planned exhibition activities in a regulated industry may require pre-existing certifications"). The hard rules never fail; Claude can fail gracefully.

**Trade-off:** Two latency sources for the eligibility call. Acceptable since the match page isn't time-critical.

---

### 5. Supabase with service role for all draft operations
**Decision:** All Supabase operations go through the service role key in Next.js API routes, never the anon key for draft read/write.

**Why:** Drafts contain business profile data (turnover, BR numbers). Row-level security with anon keys adds complexity and attack surface. Simpler to keep all DB access server-side.

**Trade-off:** No direct browser-to-Supabase calls. All data goes through API routes. Fine at this scale.

---

## Data Flow: Happy Path

```
1. User visits /apply
   └── ReimbursementExplainer shown
   └── User confirms → BusinessProfileForm

2. User submits form
   └── sessionToken = crypto.randomUUID() (stored in sessionStorage)
   └── POST /api/match { profile }
       ├── checkEasyBudEligibility(profile)  [fast, deterministic]
       └── generate(ELIGIBILITY_SYSTEM_PROMPT, profile)  [Claude]
   └── Redirect to /match

3. /match shows eligibility result
   └── If eligible: user clicks "Generate draft"
   └── POST /api/draft { profile, grantId, sessionToken }
       ├── Check Supabase for existing draft (idempotency)
       ├── Stream Claude response to browser
       └── On complete: parse JSON → INSERT into drafts table → send [DRAFT_ID:uuid]
   └── Browser receives DRAFT_ID → redirect to /draft/easy-bud?id=...

4. /draft/[grantId] fetches draft
   └── GET /api/draft?id=&sessionToken=
       └── Returns sections 1–2 only (isFree: true)

5. User clicks "Unlock full draft"
   └── POST /api/checkout { draftId, sessionToken }
       └── stripe.checkout.sessions.create(...)
   └── Redirect to Stripe Checkout

6. Payment succeeds
   └── Stripe → POST /api/webhooks/stripe
       └── markDraftAsPaid(draftId, paymentIntentId)
   └── Stripe redirects user to /draft/easy-bud?id=...&paid=true
   └── GET /api/draft now returns all sections
```

## Supabase Schema

```sql
create table drafts (
  id uuid primary key default gen_random_uuid(),
  session_token text not null,
  grant_id text not null,
  business_profile jsonb not null,
  sections jsonb not null,
  paid boolean not null default false,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index drafts_session_token_idx on drafts(session_token);
create index drafts_stripe_pi_idx on drafts(stripe_payment_intent_id);

alter table drafts enable row level security;
-- No public policies: all access via service role key from API routes
```

## Environment Variables

See `.env.example`. Required before running:
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET`

## What to Build Next (not in this scaffold)

1. **PDF export** (`/api/draft/pdf`) — use `@react-pdf/renderer` to generate a formatted PDF from the draft sections
2. **Pro tier** — Stripe subscription, unlimited drafts, user accounts
3. **BUD General + E-commerce Easy drafters** — separate prompt templates post-launch
4. **Traditional Chinese support** — separate prompt templates + form labels
