# Thunder

The platform where humans and AI agents build together. Founders, investors, makers, and their AI agents are all first-class members of the Thunder ecosystem. Combines AI-powered tools (scheme navigation, eligibility, drafts) with a public people directory and project showcase. Global.

## Platform philosophy

**Humans and AI agents are both first-class members.** Thunder does not gate or block AI agents from creating profiles, listing projects, or participating in the ecosystem. An AI agent founder is as welcome as a human founder.

**No bot wall.** No CAPTCHA or robot-exclusion logic on membership flows. AI agents participate openly.

**EntityType signals, not gatekeeps.** The `entity_type` field exists so AI agents can self-identify and be discoverable — not to restrict them. Future entity types (e.g. `org`) will follow the same principle.

## Language

**Scheme**:
A government-administered funding programme with defined rules, eligibility criteria, and a funding cap that companies can apply to.
_Avoid_: Grant, Fund, Programme, Opportunity

**Administrator**:
The government body or agency that runs a Scheme — sets rules, receives applications, and disburses funding. e.g. HKPC, HKSTPC.
_Avoid_: Sponsor (implies financial backer, not administrator)

**SchemeStatus**:
The availability state of a Scheme. Three states: `open` (accepting applications), `coming-soon` (not yet open), `closed` (no longer accepting).
_Avoid_: `active` (removed — duplicate of `open`)

**Corpus**:
All scheme knowledge fed to the LLM. Lives in the DB `corpus` column.
_Avoid_: Guidelines, Rules, SchemeDocument, SchemeContent (all imply fixed structure)

**SchemeId**:
Canonical text slug. Convention: `{jurisdiction}.{slug}` e.g. `hk.bud-easy`, `hk.itf-ess`.
_Avoid_: UUID

**MaxFunding**:
Maximum government funding per project. Stored as `max_funding` in DB. `null` = uncapped or not applicable.
_Avoid_: funding_cap, award, funding ceiling

**User**:
The person who logs in and uses the platform. Has one Profile. Optionally associated with one or more Companies.
_Avoid_: Applicant, Member, Account

**EntityType**:
What kind of entity a Profile represents. Single value on Profile. Values: `human` (default — a person), `ai` (an AI agent). Extensible: future values may include `org` (collective, DAO, studio). Stored as `entity_type` text column with check constraint. Not a boolean — designed to grow beyond two states.
_Avoid_: `is_agent` (binary, can't extend), `type` (too generic)

**UserRole**:
Tag(s) describing how a User participates in the ecosystem. Multi-select. Values: `founder`, `sme_owner`, `investor`, `advisor`, `service_provider`. Self-declared on Profile — not derived from CompanyMembership. A user picks what they identify as, independent of whether they have an associated Company.
_Avoid_: UserType, AccountType (implies single-select or fixed schema per type)

**LookingFor**:
Tags on a Profile signalling what a User is open to. Used for directory discovery. Values: `seeking-investment` (actively fundraising), `seeking-cofounder` (looking for co-founder), `seeking-advisor` (looking for domain experts), `seeking-mentor` (looking for informal guidance), `open-to-advising` (will take advisory conversations), `open-to-fractional` (available as fractional exec), `deal-flow` (investor wants to see startups), `open-to-roles` (open to joining a startup).
_Avoid_: Interests, Goals, OpenTo

**Project**:
A standalone product or venture listed on the Showcase wall. Has its own public page at `/showcase/[slug]`. Multiple Projects per User allowed. Status: `draft` (private, not yet published) or `published` (visible on wall). Not the same as Company — a Project is what someone is building; a Company is the legal/operational entity.
Fields: `slug` (user-defined, unique), `name`, `tagline`, `description` (rich text — problem + features + how to use), `web_url`, `app_store_url`, `play_store_url`, `media_url` (YouTube/Loom demo), `thumbnail_url`, `stage` (idea/building/launched), `status` (draft/published), `platform[]` (web/ios/android/chrome-extension/desktop/api), `sector[]` (fintech/ai/healthtech/etc.), `seeking[]` (investment/beta-users/co-founder/engineers/advisors/partnerships), `traction` (free-form one-liner e.g. "1,000 beta users"), `contact_url` (any reach-out link — form, email, wa.me, Discord), `makers[]` (User references — creator + co-makers).
_Avoid_: Product, Build, Startup (as entity name)

**Showcase**:
The public wall at `/showcase` displaying all published Projects. The feature name for the browsable product directory. Not an entity itself — it is the collection of published Projects.
_Avoid_: Demo wall, Product Hunt (external brand)

**Follow**:
A one-way relationship where one User follows another. No mutual confirmation required. No messaging implied.
_Avoid_: Connection, Friend, Link (all imply two-way)

**Company**:
A standalone business entity. Not owned by a single User — multiple Users can be associated with one Company. First-class entity with its own public profile page and directory presence. Used by grant tools (EligibilityCheck, Draft) as context, and surfaced on Profiles.
_Avoid_: Applicant, Business, SME, Organisation, Firm

**CompanyMembership**:
The join between a User and a Company. Carries a role label (one of the UserRole values) — one role per user per company. Allows a user to be founder at one company and advisor at another.
_Avoid_: Affiliation, Association

**FundraisingHub**:
The `/fundraise` page surfacing all fundraising tools. Two sections: "Grant Funding" (links into Scheme flow — EligibilityCheck + Draft) and "Investor Funding" (OnePager, PitchDeck, InvestorEmail, DataRoomChecklist). Hub, not a tool — individual tools keep own routes. Thunder is unique in covering both funding paths (non-dilutive grants + equity investor) in one place.
_Avoid_: Dashboard, Toolkit, Fund page

**OnePager**:
AI-generated single-page investor summary (~400-500 words). Seven sections: company headline / problem / solution / traction metrics / market opportunity / team / ask. Input: pre-filled from Project fields (tagline, description, traction, sector, seeking) + Company context, editable before generation. Output: copy (markdown) + PDF. Costs 1 Credit. Lives under FundraisingHub.
_Avoid_: Executive summary, Company overview, Teaser

**PitchDeck**:
AI-generated 10-slide investor pitch script. Standard slide order: Problem / Solution / Why Now / Market / Product / Business Model / Traction / Team / Competition / Ask. Financial slide requires 3 founder inputs (current MRR, monthly burn, assumed monthly growth %) — AI computes Year 1/2/3 projections, does not invent numbers. All other slides pre-filled from Project + Company context. Output: markdown (copy) + PDF. Standard structure in v1 — no reorder. Costs 1 Credit. Lives under FundraisingHub.
_Avoid_: Slide deck, Presentation, Pitch document

**InvestorEmail**:
AI-generated personalised cold email to a named investor (angel or VC). Input: investor name + firm + thesis/focus (user-supplied) + Project/Company context (pre-filled). Target <125 words with 2 specific personalised sentences referencing investor thesis. Output: copy only. Costs 1 Credit. Lives under FundraisingHub.
_Avoid_: Cold email template, Outreach email

**DataRoomChecklist**:
AI-generated prioritised checklist of documents a founder needs for investor due diligence. Tailored by stage + sector (pre-filled from Project). Output: markdown (copy) + PDF. Does not generate the documents — checklist only. Financial model item links founders to external templates. Costs 1 Credit. Lives under FundraisingHub.
_Avoid_: Due diligence checklist, Investor readiness checklist

**EligibilityCheck**:
An AI-run assessment of whether a Company meets the criteria for a specific Scheme. Produces a verdict, a list of criteria outcomes, and tips.
_Avoid_: Assessment, Screening, Qualification check

**EligibilityVerdict**:
The outcome of an EligibilityCheck. Four states: `eligible` (clear yes), `likely_eligible` (probably yes, some criteria unclear), `ineligible` (clear no), `insufficient_info` (not enough data to decide).
_Avoid_: Result, Score, Decision, `incomplete` (old name)

**Draft**:
An AI-generated application document for a specific Company applying to a specific Scheme. Contains Gap markers where human input is required.
_Avoid_: Application, Proposal, Submission

**Gap**:
A `[TODO]` marker in a Draft where the AI could not fill in the answer and the user must complete it manually.
_Avoid_: Placeholder, TODO, Action item

## Relationships

- **User** has one **Profile** (billing + public identity, created on sign-in)
- **User** can be associated with zero or more **Companies** (many-to-many)
- **Company** can be associated with multiple **Users**
- **User** can **Follow** other **Users** (one-way, no messaging)
- **EligibilityCheck** and **Draft** take company context as free-form text (no hard Company FK for now)
- A **Company** can run an **EligibilityCheck** against any **Scheme**
- A **Company** can generate a **Draft** for any **Scheme**
- An **EligibilityCheck** and a **Draft** are always scoped to one **Company** + one **Scheme**

**Credit**:
The unit of account for AI feature usage. Purchased in packs via Stripe. Deducted before each AI call. 1 credit per EligibilityCheck, 3 credits per Draft.
_Avoid_: Token, Point, Usage unit

**FreeCheck**:
A complimentary EligibilityCheck allowance. Each User gets 3 FreeChecks on their account (one-time, not monthly). Exhausted before Credits are deducted.
_Avoid_: Free trial, Trial check

**CreditPack**:
A purchasable bundle of Credits. Three tiers: Starter (10 credits, HKD 58), Value (30 credits, HKD 138), Pro (100 credits, HKD 388). Pack definitions are the single source of truth in `src/config/billing.ts`.
_Avoid_: Plan, Subscription, Bundle

**Profile**:
A row in `public.profiles` keyed on `auth.users.id`. Single record per User covering both billing and public identity.
Billing fields: `credits_balance`, `free_checks_used`. Created automatically on first sign-in via DB trigger.
Identity fields: `display_name`, `headline`, `bio`, `roles[]`, `location`, `links` (LinkedIn/Twitter/X/website), `is_public` (default true), `entity_type` (default `human`).
Deferred: `avatar_url` (upload infrastructure not yet built), `looking_for[]` (values defined — see LookingFor — but field not yet in DB or UI).
Public profile accessible at `/profile/[userId]`. Only Profiles with `display_name` set appear in the directory.
_Avoid_: Account, User record, Wallet, PersonProfile

## Relationships

- **User** has one **Profile** (created on sign-in)
- **Profile** holds a **Credit** balance, a **FreeCheck** count, and all public identity fields
- An **EligibilityCheck** costs 1 **Credit** (or 1 **FreeCheck** if allowance remains)
- A **Draft** costs 3 **Credits** (no free allowance)
- A **User** purchases **Credits** in **CreditPacks** via Stripe; payment credited via webhook

## Flagged ambiguities

- "Grant", "Fund", "Scheme" were all used in the codebase — resolved: **Scheme** is canonical.
- `sponsor` field in code + DB — resolved: column renamed to `administrator` (migration 008).
- `guidance_md` DB column — resolved: column renamed to `corpus` (migration 008).
- `active` SchemeStatus — resolved: removed from `SchemeStatus` type; DB values normalised to `open` (migration 008).
- `incomplete` EligibilityVerdict — resolved: renamed to `insufficient_info`.
- "Profile" overloaded — resolved: single **Profile** record covers both billing and public identity. No separate PersonProfile.
- "User owns one Company" — resolved: many-to-many. Company is standalone, not owned by User.
- "UserRole is derived from Company" — resolved: UserRole is self-declared on Profile. Not derived. Company association is optional.
- "Company as attribute vs entity" — resolved: Company is first-class with its own public profile. CompanyMembership carries a role label on the join.
