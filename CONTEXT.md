# SME Grant Navigator

An AI-powered tool that helps SME owners assess eligibility and generate application drafts for government funding schemes.

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
The flat markdown string containing all assembled knowledge about a Scheme — may include eligibility rules, guidelines, activity types, key facts, or any combination. Structure varies per Scheme intentionally; "Corpus" signals mixed assembly, not a fixed schema. Lives in the DB — column should be named `corpus` (currently `guidance_md`, pending rename + migration); file-based corpus files are a migration source only.
_Avoid_: Guidelines, Rules, SchemeDocument, SchemeContent (all imply fixed structure)

**User**:
The person who logs in and uses the platform. Owns one Company (for now).
_Avoid_: Applicant, Member, Account

**Company**:
The business entity being assessed or drafted for. Belongs to a User. Holds the company's profile information used across all Scheme interactions.
_Avoid_: Applicant, Business, SME, Organisation, Firm

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

- A **User** owns one **Company**
- A **Company** can run an **EligibilityCheck** against any **Scheme**
- A **Company** can generate a **Draft** for any **Scheme**
- An **EligibilityCheck** and a **Draft** are always scoped to one **Company** + one **Scheme**

## Flagged ambiguities

- "Grant", "Fund", "Scheme" were all used in the codebase — resolved: **Scheme** is canonical.
- `sponsor` field in code + DB — resolved: canonical term is **Administrator**, pending rename.
- `guidance_md` DB column — resolved: should be renamed to `corpus`, pending migration.
- `active` SchemeStatus — resolved: duplicate of `open`, to be removed.
- `incomplete` EligibilityVerdict — resolved: renamed to `insufficient_info`.
