# Architecture — Funding Navigator

**Status:** Active
**Date:** 2026-04-21
**Owner:** Zach

> This document reframes the product from a single-scheme draft generator ("SME Grant Navigator") into a general **funding opportunity → application artifact** engine. BUD remains the commercial wedge for launch; the architecture supports adding ITF, HKSTP, Cyberport, R&D tax credits, accelerators, etc. as content — not engineering — work.

---

## 1. Context

### 1.1 Why reframe now

The v1 system design treats "Easy BUD" as a hard-coded scheme: prompt templates, eligibility rules, intake fields, and UI copy are all BUD-shaped. That works for a 10-paying-user launch, but every P1 item on the roadmap (BUD General, E-commerce Easy, multi-scheme scorer, ITF, HKSTP) requires duplicating code paths. Within three schemes that approach is unmaintainable.

The deeper insight: **funding schemes are too heterogeneous to normalize into a relational schema.** One scheme cares about employee count, another about patent filings, another about founder citizenship, another about university co-investigators. Forcing them into a shared rules table loses fidelity and forces an engineering change for every new scheme.

### 1.2 Forces at play

- **Commercial**: Easy BUD launch window (April 23, 2026) is the go-to-market wedge. Don't dilute the landing page.
- **Product**: Users want scheme breadth post-launch — SMEs also care about ITF, HKSTP, tax incentives; tech founders care about accelerators and R&D credits.
- **Engineering**: LLMs are already the runtime reasoning engine. If Claude evaluates eligibility at draft time, pre-structuring those rules is redundant.
- **Cost/latency**: LLM-evaluating every scheme for every user at discovery time doesn't scale. A pre-filter is required.
- **Trust**: Users acting on AI-generated eligibility verdicts need consistent, explainable, citation-backed outputs.

### 1.3 Scope of this ADR

In scope: the data model, the reasoning pipeline, and the separation of scheme-agnostic vs. scheme-specific concerns.
Out of scope: auth/accounts (still deferred to v2), payment flows (unchanged from v1), Traditional Chinese support (post-launch).

---

## 2. Decision

Adopt a **hybrid data model**: thin structured facets on each scheme for fast filtering + a rich unstructured corpus per scheme for LLM reasoning + a two-stage match pipeline (rules pre-filter → LLM re-rank). Schemes become *data*, not code. The draft generator, eligibility checker, and matcher become scheme-agnostic and parameterize over `scheme_id`.

Commercially, launch remains Easy BUD–only. Architecturally, the system supports any scheme from day one.

---

## 3. Mental model: three nouns, three verbs

Three nouns are the entire domain:

| Noun | What it is | Examples |
|------|------------|----------|
| **Applicant** | An entity seeking funding | SME, startup, solo founder, research team |
| **Scheme** | A funding opportunity with rules and a form | BUD Easy, ITF ESS, HKSTP Incubation, R&D tax credit, YC application, pitch competition |
| **Application** | The matched artifact: this applicant applying to this scheme | A generated draft + budget + verdict + artifacts |

Three verbs the user moves through:

1. **Discover** — Which schemes fit me?
2. **Draft** — Generate the application artifact.
3. **Track** — Eligibility gaps, required docs, submission status, reimbursement claims.

v1 implements only Draft, and only for Easy BUD. The new architecture makes Discover scheme-agnostic and prepares for Track.

---

## 4. Options considered

### Option A — Keep v1 shape, duplicate per scheme

Add an `easy_bud.ts`, `bud_general.ts`, `itf.ts`, each with its own prompt template, its own eligibility function, its own intake form.

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low initially, grows linearly per scheme |
| Cost | High engineering cost per added scheme |
| Scalability | Poor — O(schemes) code paths |
| Team familiarity | High — matches v1 |
| Flexibility for rule changes | Poor — requires code deploy |

**Pros:** Zero refactor. Fastest path to BUD General.
**Cons:** By scheme #4 the codebase is unmaintainable. Every rule tweak is a deploy. Intake form logic fragments.

### Option B — Fully normalized rules engine

A relational schema: `eligibility_rules (scheme_id, field, operator, value)`, `funding_caps`, `activity_types`, `matching_ratios`, etc. Drive everything from structured data.

| Dimension | Assessment |
|-----------|------------|
| Complexity | High — rules engine, DSL, validators |
| Cost | High upfront, lower per-scheme |
| Scalability | Good in theory, brittle in practice |
| Team familiarity | Low — no one's built this before |
| Flexibility | Poor — rule DSL never covers every case |

**Pros:** Deterministic, explainable, cacheable.
**Cons:** Every scheme eventually has a rule the DSL can't express. The DSL grows into a second programming language. Enormous modeling tax for limited benefit when the LLM can already reason over the source text.

### Option C — Hybrid: structured facets + unstructured corpus + JIT LLM (recommended)

Each scheme has a small structured core (jurisdiction, type, size, stage tags, status, deadline) for filtering, plus a rich markdown corpus (guidance notes, rubric, form template, common rejections) that the LLM consumes at request time. Applicant has the same shape: structured facets + free-form description.

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium — simple schema, clear LLM prompts |
| Cost | Medium per-draft (Sonnet), low per-match (Haiku + pre-filter) |
| Scalability | Good — O(1) code, content scales independently |
| Team familiarity | High — extends current pattern |
| Flexibility | Excellent — new scheme = new markdown file + row |

**Pros:** Preserves fidelity of source material. Adding a scheme is a content task. LLM reasoning is source-faithful. Structured facets keep filtering fast and deterministic.
**Cons:** LLM call on every eligibility check unless cached. Requires versioning discipline on schemes. Draft quality sensitive to corpus quality.

---

## 5. Trade-off analysis

Option A is the shortest path but creates a linearly-growing maintenance tax. Option B over-indexes on determinism and underestimates the long tail of scheme-specific rules. Option C accepts that the LLM is the right interpreter for unstructured legal/regulatory text and leans into it, while using structured facets exactly where they earn their keep (filtering, sorting, caching, invalidation).

The central trade-off is **consistency vs. fidelity**. Option B is most consistent but loses fidelity. Option C preserves fidelity and closes the consistency gap via caching keyed on `(applicant_version, scheme_version)`.

---

## 6. Data model

### 6.1 Tables

```sql
-- Funding opportunities (the catalog). Scheme-specific content lives here.
create table schemes (
  id              text primary key,           -- 'hk.bud.easy', 'hk.itf.ess'
  jurisdiction    text not null,              -- 'HK', 'SG', 'global'
  scheme_type     text not null,              -- 'grant', 'tax_credit', 'accelerator', 'soft_loan', 'prize'
  name            text not null,
  sponsor         text,
  max_funding_amount numeric,
  currency        text,
  target_stages   text[],                     -- ['seed', 'growth', ...]
  target_sectors  text[],                     -- ['ict', 'biotech', ...]
  status          text not null,              -- 'open', 'closed', 'rolling'
  next_deadline   timestamptz,
  corpus          jsonb not null,             -- { guidance_md, rubric_md, form_template_md, samples[], common_rejections_md }
  version         int not null default 1,
  last_updated    timestamptz not null default now(),
  source_url      text
);

-- Whoever is applying. Session-based for v1; upgrade to user accounts in v2.
create table applicants (
  id              uuid primary key default gen_random_uuid(),
  session_token   text not null,
  profile         jsonb not null,             -- structured facets + free-form description
  created_at      timestamptz not null default now()
);
create index applicants_session_token_idx on applicants(session_token);

-- The matched artifact: applicant + scheme + generated content.
create table applications (
  id              uuid primary key default gen_random_uuid(),
  applicant_id    uuid not null references applicants(id),
  scheme_id       text not null references schemes(id),
  state           text not null default 'draft',  -- 'draft', 'paid', 'exported', 'submitted'
  sections        jsonb not null default '[]'::jsonb,  -- [{title, body, version}]
  budget          jsonb not null default '[]'::jsonb,  -- [{activity, item, amount, notes}]
  stripe_payment_intent_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index applications_applicant_idx on applications(applicant_id);
create index applications_stripe_pi_idx on applications(stripe_payment_intent_id);

-- Derived LLM outputs: eligibility verdicts, risk flags, suggestions. Cached by scheme version.
create table assessments (
  id              uuid primary key default gen_random_uuid(),
  applicant_id    uuid not null references applicants(id),
  scheme_id       text not null references schemes(id),
  scheme_version  int not null,              -- for cache invalidation
  verdict         text not null,             -- 'likely_eligible', 'borderline', 'ineligible'
  reasoning_md    text not null,
  citations       jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  unique (applicant_id, scheme_id, scheme_version)
);

-- RLS: no public policies. All access via service role from API routes.
alter table schemes      enable row level security;
alter table applicants   enable row level security;
alter table applications enable row level security;
alter table assessments  enable row level security;
```

### 6.2 What the structured vs. unstructured split gives us

**Structured facets on schemes** power:
- Fast pre-filter at Discover ("HK-jurisdiction grants for early-stage ICT under HK$1M")
- Deadline reminders and "closing soon" UI
- Catalog search and faceted browse

**Unstructured corpus** powers:
- Eligibility reasoning (LLM reads guidance_md, not a rules table)
- Draft generation (LLM has the real form template + sample applications)
- Rejection-risk analysis (LLM has the common_rejections list)
- Citations back to source language

**Structured applicant facets** power:
- Pre-filtering the catalog
- Validation (employee count ≤ 100 for SME thresholds)

**Unstructured applicant description** powers:
- Everything the LLM needs to write concrete, non-generic draft content.

---

## 7. The reasoning pipeline

### 7.1 Discover (two-stage match)

```
1. Pre-filter (deterministic, <10ms)
   SELECT * FROM schemes
   WHERE status = 'open'
     AND jurisdiction = applicant.jurisdiction
     AND applicant.stage = ANY(target_stages)
     AND applicant.sector = ANY(target_sectors)
   → returns ~10–20 candidate schemes

2. LLM re-rank (Haiku, batched, single call)
   Input: applicant profile + candidate schemes' structured + lite corpus excerpt
   Output: ranked list with per-scheme verdict + one-sentence reason
   → cached in `assessments` keyed on (applicant_id, scheme_id, scheme_version)
```

This keeps Discover bounded in cost: O(1) LLM call per Discover request, not O(catalog size).

### 7.2 Draft (single scheme, deep)

```
1. Load scheme.corpus (full guidance + rubric + form template + samples)
2. Load applicant.profile
3. Claude Sonnet streams section-by-section using:
   - System prompt: scheme.corpus.form_template_md + rubric_md
   - User context: applicant.profile + scheme.corpus.common_rejections_md
4. Persist to applications.sections on stream completion
5. Gate free vs. paid sections server-side (unchanged from v1)
```

### 7.3 Track (post-draft)

Applications carry state transitions: `draft → paid → exported → submitted`. Post-submission tracking (reimbursement claim checklist, audit requirements) is a scheme-specific overlay driven off `scheme_type` — for example, reimbursement-model schemes show the claim checklist; accelerator schemes show pitch-day readiness.

---

## 8. Where the JIT-LLM pattern breaks (and mitigations)

| Failure mode | Mitigation |
|--------------|------------|
| Cost of LLM-eval per scheme at Discover scale | Two-stage match: structured pre-filter to ~20 candidates, then one batched LLM call |
| Run-to-run inconsistency on eligibility | Cache `assessments` keyed on `(applicant_id, scheme_id, scheme_version)`; invalidate on version bump |
| Hallucinated eligibility reasons | Require LLM to emit `citations[]` referencing spans in `guidance_md`; store alongside verdict |
| Per-draft token cost at volume | Split corpus into `always_include` (rules, rubric, form template) vs. `optional` (samples); only include samples when beneficial |
| Scheme content drifts out of date | `schemes.version` + `last_updated`; quarterly content review cadence; version change invalidates caches |
| Draft quality sensitive to corpus quality | Corpus authoring checklist: guidance must be canonical text; samples must be real-world-grade; rubric must reflect actual assessor criteria |

---

## 9. Scheme-specific vs. scheme-agnostic surfaces

Don't try to fully generalize the UI before you have three schemes in production — premature abstraction is the other failure mode. The split:

**Scheme-agnostic (generalize now):**
- `/api/match`, `/api/draft`, `/api/applications/:id`
- Intake form's base facets (jurisdiction, entity type, sector, stage, size)
- Draft viewer frame and paywall
- PDF export pipeline

**Scheme-specific (keep as overrides, drive off `scheme_type` + `scheme_id`):**
- Reimbursement-model explainer (BUD-family only)
- Activity-type selectors (Easy BUD's 8 activity categories)
- Required-documents checklist (per-scheme)
- Copy and microcontent on scheme pages

When scheme #3 lands, refactor what's duplicated. Not before.

---

## 10. Strategic boundary for v2

The architecture supports any funding scheme, but the product should pick a lane. Three plausible v2 scopes:

1. **HK non-dilutive funding** — BUD + ITF + HKSTP + Cyberport + R&D tax credits. Deep, vertical, local moat. Best SEO play. Matches existing content and BUD wedge.
2. **APAC SME & startup grants** — broader geography, same persona, harder content sourcing.
3. **Global non-dilutive + accelerator applications** — largest TAM, most diluted positioning, hardest to out-rank on search.

**Recommendation:** Commit to (1) through Q3 2026. Revisit after 50 paying users.

---

## 11. Consequences

**What becomes easier**
- Adding a new scheme: write corpus markdown + insert a `schemes` row. No new API routes, no new prompts, no code deploy.
- Updating a scheme's rules: bump `version`, update `corpus`. Caches invalidate automatically.
- Multi-scheme matching (P1): falls out of Discover for free.
- A/B testing draft quality: swap corpus variants per scheme and compare.
- Supporting scheme types beyond grants (tax credits, accelerators, prizes): same pipeline, different corpus shape.

**What becomes harder**
- Debugging a specific eligibility verdict: requires inspecting the cached `assessment` + its citations, not stepping through code.
- Determinism guarantees: even with caching, prompts evolve. Need an eval harness (sample applicants × schemes, expected verdicts) before each prompt change.
- Corpus quality becomes the product: bad guidance_md = bad draft. Need an authoring workflow and review cadence.

**What we'll need to revisit**
- Auth and user accounts when Discover/Track need to persist across devices (v2).
- Model selection per verb (Haiku for Discover, Sonnet for Draft) as pricing and model quality shift.
- Whether to move corpus storage out of Postgres (jsonb) into object storage if it grows past a few MB per scheme.

---

## 12. References

- `PRD.md` — product requirements, Easy BUD launch context, success metrics
- `CONTEXT.md` — domain language and bounded context
- Easy BUD Guidance Notes, Version 11/2025 (HKPC) — canonical source for Easy BUD corpus
