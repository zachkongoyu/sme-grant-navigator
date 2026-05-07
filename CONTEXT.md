# Thunder

The goto platform for founders, SME owners, investors, and advisors in the HK startup ecosystem. Combines AI-powered tools (scheme navigation, eligibility, drafts) with a public people directory.

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

**UserRole**:
Tag(s) describing how a User participates in the ecosystem. Multi-select. Values: `founder`, `sme_owner`, `investor`, `advisor`, `service_provider`. Self-declared on Profile — not derived from CompanyMembership. A user picks what they identify as, independent of whether they have an associated Company.
_Avoid_: UserType, AccountType (implies single-select or fixed schema per type)

**LookingFor**:
Tags on a Profile signalling what a User is open to. Used for directory discovery. Values TBD (e.g. `seeking-investment`, `seeking-cofounder`, `open-to-advising`).
_Avoid_: Interests, Goals, OpenTo

**Follow**:
A one-way relationship where one User follows another. No mutual confirmation required. No messaging implied.
_Avoid_: Connection, Friend, Link (all imply two-way)

**Company**:
A standalone business entity. Not owned by a single User — multiple Users can be associated with one Company. First-class entity with its own public profile page and directory presence. Used by grant tools (EligibilityCheck, Draft) as context, and surfaced on Profiles.
_Avoid_: Applicant, Business, SME, Organisation, Firm

**CompanyMembership**:
The join between a User and a Company. Carries a role label (one of the UserRole values) — one role per user per company. Allows a user to be founder at one company and advisor at another.
_Avoid_: Affiliation, Association

**EligibilityCheck**:
An AI-run assessment of whether a Company meets the criteria for a specific Scheme. Produces a verdict, a list of criteria outcomes, blockers, and tips.
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
Identity fields: `display_name`, `headline`, `bio`, `roles[]`, `location`, `links` (LinkedIn/Twitter/X/website), `is_public` (default true).
Deferred: `avatar_url` (upload infrastructure not yet built), `looking_for[]` (values TBD).
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
