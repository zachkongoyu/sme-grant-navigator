# HK SME Grant Schemes — Layered Schema Decomposition

> Compiled: 2026-04-26. Reflects the 2026-27 HK Budget (delivered 26 Feb 2026), the 14 March 2025 BUD/EMF enhancement package, the 23 April 2026 HKPC briefing on the enhanced BUD tracks, and the EMF consolidation scheduled for 30 June 2026.
> Layers under test: (1) Identity, (2) Quantitative facets, (3) Eligibility, (4) Section-tagged corpus, (5) Relations, (6) Free-form.
> Citations are inline. Where official 2026 data was unavailable I have explicitly marked `UNKNOWN — could not verify` rather than guessed.

---

## 1. Easy BUD (BUD Fund — Simplified / Fast-track Application Track)

### Layer 1 — Identity & display facets
- **id**: `bud_easy`
- **name**: BUD Fund — Easy BUD (簡易版)
- **sponsor**: Trade and Industry Department (TID), HKSAR Government
- **administering_body**: Hong Kong Productivity Council (HKPC) as Implementer; TID is policy owner
- **status**: Open / Rolling (post-enhancement track relaunched at HKPC briefing on 23 April 2026) (https://www.info.gov.hk/gia/general/202604/01/P2026040100529.htm)
- **category/track**: Branding, Upgrading & Domestic Sales — Simplified Track
- **source_url**: https://www.bud.hkpc.org/en
- **official_references[]**:
  - Press release on 14-Mar-2025 enhancements (https://www.info.gov.hk/gia/general/202503/13/P2025031300415.htm)
  - 2026-27 Budget Speech para. 132 (Easy BUD ceiling raise) (https://www.budget.gov.hk/2026/eng/budget18.html)
  - LCQ18 reply, 1 April 2026 (statistics + ceiling confirmation) (https://www.info.gov.hk/gia/general/202604/01/P2026040100529.htm)
  - LCQ2 reply, 15 October 2025 (https://www.cedb.gov.hk/en/legco-business/questions/2025/pr15102025a.html)
- **short_description**: Fast-track simplified application track for non-listed HK enterprises seeking small grants for marketing, branding, e-commerce setup or business-entity establishment in eligible markets. 30-working-day vetting pledge; reimbursement basis.
- **last_verified_at**: 2026-04-26

### Layer 2 — Common quantitative facets
| Field | Value | Source |
|---|---|---|
| funding_cap_hkd (per project) | **HK$150,000** (raised from HK$100,000 by 2026-27 Budget) | Budget para. 132 (https://www.budget.gov.hk/2026/eng/budget18.html); LCQ18 (https://www.info.gov.hk/gia/general/202604/01/P2026040100529.htm) |
| funding_cap_cumulative_hkd | HK$7,000,000 across all BUD tracks combined per enterprise | LCQ18 (https://www.info.gov.hk/gia/general/202604/01/P2026040100529.htm) |
| funding_cap_concurrent_count | Effectively 1 active Easy BUD at a time; concurrent project sub-cap of HK$800K applies across BUD tracks | (https://www.fundfluent.io/resources/bud-fund-hong-kong-guide) — secondary; not contradicted by official sources |
| funding_ratio | scheme_share=0.25, applicant_share=0.75 (1:3 since 14-Mar-2025) | (https://www.info.gov.hk/gia/general/202503/13/P2025031300415.htm) |
| disbursement_model | reimbursement (Easy BUD does not offer the 20% upfront option that General BUD does) | (https://www.fundfluent.io/resources/bud-fund-hong-kong-guide) — secondary |
| duration_months_cap | 12 months | (https://www.fundfluent.io/resources/bud-fund-hong-kong-guide) — secondary; consistent with HKPC briefing material |
| cooldown_months | **3 months** between Easy BUD applications (relaxed from 6 on 14-Mar-2025) | (https://www.info.gov.hk/gia/general/202503/13/P2025031300415.htm) |
| audit_threshold_hkd | UNKNOWN — could not verify whether the BUD audit-fee cap of HK$10,000 applies to Easy BUD specifically; Easy BUD's small ticket size suggests final report only without independent audit, but no official source confirms |
| decision_sla_days | **30 working days** vetting pledge | (https://www.tid.gov.hk/en/our_work/support_for_trade_industry/bud.html) |

### Layer 3 — Eligibility dimensions
- **entity_types[]**: non-listed HK enterprise registered under the Business Registration Ordinance
- **min_years_in_operation**: 1 year (https://www.info.gov.hk/gia/general/202410/30/P2024103000453.htm)
- **max_employees**: none (BUD is not employee-capped — distinguishes it from TVP and EMF historically)
- **max_annual_revenue_hkd**: none (no revenue ceiling)
- **hk_substantive_operations_required**: true — assessed on bundle of factors (HK employee count, HK customers, HK-tax-assessable profits) (https://www.info.gov.hk/gia/general/202410/30/P2024103000453.htm)
- **industry_inclusions[]**: any (cross-industry)
- **industry_exclusions[]**: none formally; listed companies and shell entities excluded
- **director_residency_required**: null (no director-residency rule; substantive-operations rule operates at company level)
- **eligibility_notes_md**: Listing status disqualifies an applicant — even subsidiaries of listed groups are scrutinised. "Substantive operations" is the most-litigated eligibility dimension; HKPC requires payroll records, financial records and HK-customer evidence. The cumulative HK$7M cap is shared across General + Easy + E-commerce Easy; an enterprise that has used $6.9M cumulatively cannot get a fresh $150K Easy BUD.

### Layer 4 — Section-tagged corpus
- **objective_md**: Provide non-listed HK SMEs with a fast, low-friction matching grant for small branding, upgrading or market-expansion projects in 40+ eligible economies. Designed as the "starter" entry point into the BUD ladder; deliberately self-implemented with limited change-request flexibility.
- **eligible_costs_md**: Marketing/advertising, trade-fair participation, promotional collateral, **online sales platform set-up** (added 14-Mar-2025), **professional fees for establishing a new business entity in an eligible market** (added 14-Mar-2025), brand design (https://www.info.gov.hk/gia/general/202503/13/P2025031300415.htm). Targeted AI-application costs are flagged for additional support per Budget 2026-27 para. 132 — exact eligible AI items not yet published.
- **ineligible_costs_md**: Recurrent operating expenses, wages of existing staff, capital expenditures unrelated to the project, expenses incurred outside the agreed project period, items already funded by another government source.
- **application_process_md**: Online application via https://apply.bud.hkpc.org. Applicant submits proposal + eligibility evidence + cost breakdown. HKPC vets within 30 working days. Successful applicants sign undertaking, execute project (max 12 months self-implemented), submit final report and reimbursement claim with receipts.
- **required_documents_md**: BR certificate; certificate of incorporation; latest annual return; HK substantive-operations evidence (employee records, MPF records, sample customer invoices, audited accounts or tax returns); proposal and budget; quotations for major items.
- **evaluation_criteria_md**: Deliverability of the small project, reasonableness of cost, eligibility of market(s), benefit to HK operations, applicant's track record on prior BUD projects (if any). LCQ18 reports a 60% Easy BUD approval rate in 2025 (https://www.info.gov.hk/gia/general/202604/01/P2026040100529.htm).
- **disbursement_md**: Pure reimbursement — applicant must front 100% of cash, then claim 25% back after final-report acceptance. No 20% upfront option.
- **reporting_md**: Final report only (because duration ≤ 12 months — annual progress reports kick in only above 18 months per BUD general rule). Receipts, bank statements, photos/screenshots of deliverables.
- **common_violations_md**: Spending outside the project period; vendor-relationship conflicts of interest; failure to evidence HK-substantive operations at audit; mismatched receipts; double-funding with TVP or another scheme.
- **comparison_md**: Easy BUD is the "Tier 0" of BUD — smallest cap, fastest SLA, narrowest scope. If a project needs >HK$150K or includes a large e-commerce build, route to E-commerce Easy or General BUD instead. Easy BUD overlaps heavily with the soon-to-sunset EMF (export-marketing exhibition spend) and is the official replacement vehicle for EMF after 30-Jun-2026 (https://www.info.gov.hk/gia/general/202503/13/P2025031300415.htm).

### Layer 5 — Relations
- **related[]**: `bud_general`, `bud_ecommerce_easy`, `emf` (EMF is being absorbed)
- **supersedes**: partially supersedes EMF after 2026-06-30
- **superseded_by**: none
- **exclusive_with[]**: cannot double-fund the same expenditure with TVP, EMF, ITF programmes, or a separate BUD project; cumulative cap binds across all BUD variants

### Layer 6 — Free-form
- **examples_md**: Average approved Easy BUD ticket in 2025 was ~HK$72,000 (LCQ18) — well below the cap, suggesting most applicants use it for a single trade-fair or e-commerce store launch in a single FTA market. Typical use: setting up a Lazada/Shopee storefront for one ASEAN market with creative + onboarding cost.
- **faq_md**: Q: Can I run two Easy BUD projects in parallel? A: No — one active Easy BUD application/project at a time, and the next can only be submitted 3 months after the last (https://www.info.gov.hk/gia/general/202503/13/P2025031300415.htm). Q: Does the new HK$150K cap apply retroactively? A: No — applies to applications received after the implementation date of the 2026-27 Budget enhancement (HKPC briefing 23-Apr-2026; exact implementation date not pinned in cited sources).
- **internal_notes_md**: I could not reach the official BUD application portal pages (404s on `bud.hkpc.org/en` paths through WebFetch) — relied on TID's official BUD page, two LegCo replies, the Budget speech, and the 14-Mar-2025 GIS press release. The HK$150K Easy BUD cap is well-documented across both Budget and LCQ18, so I'm confident on it. The audit-fee mechanics for Easy BUD specifically are not officially confirmed; I'd recommend the Thunder schema treat `audit_threshold_hkd` as nullable rather than coerce a value.

---

## 2. BUD General Programme

### Layer 1 — Identity & display facets
- **id**: `bud_general`
- **name**: BUD Fund — General Application (一般申請)
- **sponsor**: Trade and Industry Department (TID)
- **administering_body**: Hong Kong Productivity Council (HKPC)
- **status**: Open / Batch processing (current batch cut-off 30 June 2026 23:59 HKT) (https://www.bud.hkpc.org/index.php/en)
- **category/track**: Branding, Upgrading & Domestic Sales — General Track
- **source_url**: https://www.bud.hkpc.org/en
- **official_references[]**:
  - TID BUD page (https://www.tid.gov.hk/en/our_work/support_for_trade_industry/bud.html)
  - 14-Mar-2025 enhancement press release (https://www.info.gov.hk/gia/general/202503/13/P2025031300415.htm)
  - LCQ18 reply 1-Apr-2026 (https://www.info.gov.hk/gia/general/202604/01/P2026040100529.htm)
  - LCQ2 reply 15-Oct-2025 (https://www.cedb.gov.hk/en/legco-business/questions/2025/pr15102025a.html)
- **short_description**: Standard BUD application track for non-listed HK enterprises pursuing branding / business upgrading / domestic-sales projects in 40+ FTA/IPPA economies. Larger ticket size, deeper documentation, batch-processed.
- **last_verified_at**: 2026-04-26

### Layer 2 — Common quantitative facets
| Field | Value | Source |
|---|---|---|
| funding_cap_hkd (per project) | HK$800,000 per General application | TID page (https://www.tid.gov.hk/en/our_work/support_for_trade_industry/bud.html) |
| funding_cap_cumulative_hkd | HK$7,000,000 per enterprise across all BUD tracks (up to ~70 projects) | LCQ18 (https://www.info.gov.hk/gia/general/202604/01/P2026040100529.htm) |
| funding_cap_concurrent_count | Concurrent project value sub-cap; the concurrent-count limit itself UNKNOWN — could not verify a hard count cap, only that approvals respect total concurrent value |
| funding_ratio | 0.25 : 0.75 (since 14-Mar-2025; was 50:50 before) | (https://www.info.gov.hk/gia/general/202503/13/P2025031300415.htm) |
| disbursement_model | mixed — reimbursement is default, with optional 20% upfront on the government share against bank guarantee/proof | secondary (https://www.fundfluent.io/resources/bud-fund-hong-kong-guide) |
| duration_months_cap | 24 months (https://www.fundfluent.io/resources/bud-fund-hong-kong-guide) — secondary, consistent with HKPC FAQ language about 18+ month projects requiring annual progress reports |
| cooldown_months | none formally — concurrency limited by project-value rules, not time |
| audit_threshold_hkd | Independent audit mandatory at project completion; audit-fee component capped at HK$10,000 reimbursable (https://www.fundfluent.io/resources/bud-fund-hong-kong-guide) |
| decision_sla_days | 60 working days vetting pledge (https://www.tid.gov.hk/en/our_work/support_for_trade_industry/bud.html) |

### Layer 3 — Eligibility dimensions
- **entity_types[]**: non-listed HK enterprise (BR-registered)
- **min_years_in_operation**: 1 year (https://www.info.gov.hk/gia/general/202410/30/P2024103000453.htm)
- **max_employees**: none
- **max_annual_revenue_hkd**: none
- **hk_substantive_operations_required**: true
- **industry_inclusions[]**: any
- **industry_exclusions[]**: listed companies excluded
- **director_residency_required**: null
- **eligibility_notes_md**: Same eligibility floor as Easy BUD — the difference is what HKPC will fund, not who can apply. AI-targeted projects get "more targeted funding support" per 2026-27 Budget para. 132 (https://www.budget.gov.hk/2026/eng/budget18.html) — implementation details pending.

### Layer 4 — Section-tagged corpus
- **objective_md**: Help non-listed HK enterprises develop brands, upgrade/restructure operations, or promote domestic sales in 40+ FTA/IPPA-covered economies, including the post-2025 expansion to 8 additional Belt-and-Road economies (https://www.cedb.gov.hk/en/legco-business/questions/2025/pr15102025a.html).
- **eligible_costs_md**: Branding (logo, packaging, brand strategy consultancy, IP registration in target market), upgrading (machinery, ERP, automation, certifications), domestic-sales/market-expansion (channel development, B2B platforms, distributor onboarding, target-market staff costs, professional fees for new entity establishment as added 14-Mar-2025).
- **ineligible_costs_md**: Operating expenses unrelated to the project, costs already funded by another scheme, capital that doesn't tie to the funded project, costs incurred outside the project period, items used outside HK that don't link to the eligible-market expansion.
- **application_process_md**: Online application; HKPC pre-vetting; 60-working-day decision pledge; if approved, sign undertaking; project execution up to 24 months; interim progress report (if >18 months); final report + audited account.
- **required_documents_md**: BR + incorporation; annual return; substantive-operations evidence; full proposal with milestones; 3+ vendor quotations for material items; budget breakdown; financial statements; market-expansion plan.
- **evaluation_criteria_md**: Project rationale + alignment with one of B/U/D pillars, deliverability, reasonableness of cost (compared to vendor quotations), benefit to HK operations, applicant track record. 2025 approval rate ~52% across all BUD applications (2,776 approved / 5,347 received per LCQ18).
- **disbursement_md**: Default reimbursement against receipts; optional 20% advance of the government's share, balance reimbursed after final-report acceptance.
- **reporting_md**: Final report mandatory; for projects >18 months, annual progress report + annual audited account also required. Final independent audit by HKICPA-registered CPA; audit fee up to HK$10,000 fundable under the 1:3 ratio.
- **common_violations_md**: Diversion of project funds to non-project use; failure to retain receipts in HK currency-conversion form; using staff already on payroll without segregating their project time; double-counting overheads; missed reporting deadlines.
- **comparison_md**: General BUD is the "core" track — broader scope than Easy BUD (which is capped at HK$150K and excludes capex like machinery), bigger than E-commerce Easy's project cap of $800K but with full freedom over project type. Where ITF-ESS funds R&D, BUD funds market expansion + non-R&D upgrading.

### Layer 5 — Relations
- **related[]**: `bud_easy`, `bud_ecommerce_easy`, `emf`
- **supersedes**: none directly; absorbs EMF as part of consolidation 2026-06-30
- **superseded_by**: none
- **exclusive_with[]**: cannot double-fund same expense with TVP, ITF, EMF; same cumulative cap

### Layer 6 — Free-form
- **examples_md**: 2025 average approved General BUD project: HK$719,000 (LCQ18). Typical project: expanding from HK to Vietnam — set up local entity (legal + accounting fees), localize packaging, attend two trade fairs, hire one in-market BD person for 12 months, build Vietnamese-language B2B portal.
- **faq_md**: Q: Is the 25% government share calculated on actual or budgeted cost? A: actual, capped at the budgeted amount. Q: Are AI-application projects fundable today? A: yes, but the targeted "AI" enhancement from Budget 2026-27 implies a future channel with possibly different terms.
- **internal_notes_md**: The shift from 50:50 to 25:75 matching on 14-Mar-2025 is a major regression for applicants and is the single biggest BUD parameter change since launch — Thunder copy needs to handle the cohort that knew the old ratio. The "duration_months_cap=24" is well-supported by HKPC FAQ implications but I did not find an official guide page that lists "24 months" verbatim, so this should be treated as high-confidence-but-secondary in the schema.

---

## 3. BUD E-commerce Easy (BUD-EE)

### Layer 1 — Identity & display facets
- **id**: `bud_ecommerce_easy`
- **name**: BUD Fund — E-commerce Easy (電商易)
- **sponsor**: Trade and Industry Department (TID)
- **administering_body**: Hong Kong Productivity Council (HKPC)
- **status**: Open (refreshed at 23-Apr-2026 HKPC briefing) (https://bee.hkpc.org/)
- **category/track**: BUD specialist sub-track for e-commerce projects in Mainland China + 10 ASEAN markets
- **source_url**: https://www.bud.hkpc.org/en
- **official_references[]**:
  - HKPC press release on E-commerce Easy launch (https://www.hkpc.org/en/about-us/media-centre/press-releases/2024/bud-fund-e-commerce-easy)
  - LCQ18 reply 1-Apr-2026 (https://www.info.gov.hk/gia/general/202604/01/P2026040100529.htm)
  - LCQ2 reply 15-Oct-2025 (https://www.cedb.gov.hk/en/legco-business/questions/2025/pr15102025a.html)
- **short_description**: Specialist BUD sub-track for e-commerce projects (storefront builds, marketplace onboarding, livestream commerce, KOL marketing) in Mainland China and the 10 ASEAN economies. Carve-out cumulative cap of HK$1M sits inside the overall HK$7M BUD ceiling.
- **last_verified_at**: 2026-04-26

### Layer 2 — Common quantitative facets
| Field | Value | Source |
|---|---|---|
| funding_cap_hkd (per project) | HK$800,000 per E-commerce Easy project | TID page (https://www.tid.gov.hk/en/our_work/support_for_trade_industry/bud.html) |
| funding_cap_cumulative_hkd | **HK$1,000,000 e-commerce-specific carve-out**, sitting within the overall HK$7,000,000 BUD lifetime cap | TID page (https://www.tid.gov.hk/en/our_work/support_for_trade_industry/bud.html) |
| funding_cap_concurrent_count | UNKNOWN — could not verify a published hard cap on concurrent E-commerce Easy projects |
| funding_ratio | 0.25 : 0.75 since 14-Mar-2025 | (https://www.info.gov.hk/gia/general/202503/13/P2025031300415.htm) |
| disbursement_model | mixed (similar to General BUD; 20% advance available) — UNKNOWN whether E-commerce Easy explicitly offers the 20% advance, secondary sources imply yes |
| duration_months_cap | 24 months (assumed from General BUD parity; not confirmed in primary source) — UNKNOWN |
| cooldown_months | UNKNOWN — Easy BUD has the 3-month rule, but no equivalent published rule for E-commerce Easy |
| audit_threshold_hkd | Same audit regime as General BUD; audit-fee cap HK$10,000 |
| decision_sla_days | Treated as a General-class application — 60 working days, not the 30-day Easy BUD pledge | TID page |

### Layer 3 — Eligibility dimensions
- **entity_types[]**: non-listed HK enterprise (BR-registered)
- **min_years_in_operation**: 1 year
- **max_employees**: none
- **max_annual_revenue_hkd**: none
- **hk_substantive_operations_required**: true
- **industry_inclusions[]**: any (cross-industry, but project must be e-commerce-shaped)
- **industry_exclusions[]**: pure offline retail with no online channel; listed companies
- **director_residency_required**: null
- **eligibility_notes_md**: Eligibility is identical to BUD generally — the bite is on what counts as an "e-commerce project". HKPC has been explicit that the project must build/operate online sales channels (own-site or marketplace) in Mainland China or one of the 10 ASEAN markets. 2025 approval rate was 41% (LCQ18) — the lowest of the three BUD tracks, suggesting tighter scrutiny on commercial credibility of e-commerce plans (https://www.info.gov.hk/gia/general/202604/01/P2026040100529.htm).

### Layer 4 — Section-tagged corpus
- **objective_md**: Help HK SMEs build sustainable e-commerce presence in Mainland China + 10 ASEAN markets — covering platform onboarding (Tmall, JD, Lazada, Shopee), independent storefronts, payment integration, livestream/short-video marketing, KOL collaboration, and operations.
- **eligible_costs_md**: Storefront design and build, platform onboarding fees and security deposits, ad spend on the targeted platforms, KOL/livestream campaign fees, content production, in-market e-commerce operations team, training, ERP/OMS integration to handle cross-border fulfilment.
- **ineligible_costs_md**: Pure offline marketing, products themselves (inventory), capex unrelated to e-commerce (e.g., factory machinery), platform expenses outside the 10 ASEAN + Mainland scope.
- **application_process_md**: Online via HKPC; pre-vetting; 60-day decision; sign undertaking; execute up to 24 months; final report + audit.
- **required_documents_md**: BR + incorporation + annual return; substantive-operations evidence; e-commerce project plan with platform-by-platform breakdown; vendor quotations (3+ for material items); MOA/draft contract with platform/KOL agencies; financial statements.
- **evaluation_criteria_md**: Commercial credibility of the e-commerce plan, fit between applicant's product and the target platform's category, reasonableness of marketing spend, deliverability, HK substantive-operations evidence. The 41% approval rate suggests evaluators are sceptical of "we'll set up a Lazada store and spend $500K on ads" applications without prior e-commerce track record.
- **disbursement_md**: Reimbursement default; 20% advance per General BUD rules (assumed by parity).
- **reporting_md**: Final report + audited accounts; annual progress report if duration >18 months. Audit-fee cap HK$10,000.
- **common_violations_md**: Spending the budget on inventory rather than enablement; marketing spend on platforms outside the eligible-market scope; vendor concentration with related parties; mismatched cost categorisation between proposal and claim.
- **comparison_md**: BUD-EE is the only BUD track with an explicit channel/market scope (e-commerce; Mainland + 10 ASEAN). It is also the only BUD track with a sub-ceiling (HK$1M) inside the overall HK$7M cap — meaning a heavy e-commerce user can exhaust the e-commerce budget while still having BUD General room left.

### Layer 5 — Relations
- **related[]**: `bud_general`, `bud_easy`, `emf`
- **supersedes**: none
- **superseded_by**: none
- **exclusive_with[]**: same cumulative-cap exclusivity as other BUD tracks

### Layer 6 — Free-form
- **examples_md**: 2025 average approved BUD-EE project: HK$566,000 (LCQ18) — close to the HK$800K cap, suggesting users tend to ask for the maximum on this track. Typical project: TMall flagship store launch — platform deposit, store design, 6-month KOL push, livestream studio rental in Shenzhen, two e-commerce ops staff cross-charged for 12 months.
- **faq_md**: Q: Can I run BUD-EE concurrently with General BUD on different markets? A: yes, subject to overall concurrent project value rules. Q: Does the HK$1M cumulative apply if I haven't started General BUD? A: yes — it's a carve-out, not an addition; the $1M cumulative ceiling for e-commerce projects sits inside the $7M overall.
- **internal_notes_md**: BUD-EE has the trickiest layer-2 modelling because it has TWO cumulative caps: a track-specific $1M, and the global $7M. A flat `funding_cap_cumulative_hkd` field cannot capture this — see Schema Collision Report below.

---

## 4. Innovation and Technology Fund — Enterprise Support Scheme (ITF ESS)

### Layer 1 — Identity & display facets
- **id**: `itf_ess`
- **name**: Innovation and Technology Fund — Enterprise Support Scheme (ESS)
- **sponsor**: Innovation and Technology Bureau / Innovation, Technology and Industry Bureau (ITIB), HKSAR
- **administering_body**: Innovation and Technology Commission (ITC); ESS Secretariat
- **status**: Open / Rolling — applications accepted year-round via ITCFAS (https://www.itf.gov.hk/en/funding-programmes/supporting-research/ess/index.html)
- **category/track**: Supporting research — downstream R&D commercialisation by individual companies
- **source_url**: https://www.itf.gov.hk/en/funding-programmes/supporting-research/ess/index.html
- **official_references[]**:
  - ESS Funding & Administrative Guidelines for Successful Applicants (Feb 2023) (https://www.itf.gov.hk/filemanager/en/content_30/ess-success_2023_02.pdf)
  - ESS FAQ (Mar 2023) (https://www.itf.gov.hk/filemanager/en/content_30/FAQ-EN_20230324.pdf)
  - 2020 ITC press release on ESS enhanced funding (https://www.info.gov.hk/gia/general/202001/31/P2020012900573.htm)
- **short_description**: Dollar-for-dollar matching grant of up to HK$10M per project for HK-incorporated companies conducting in-house downstream R&D. Recipient retains IP. Half-yearly milestone-based disbursement, mandatory CPA-audited project accounts, 24-month default duration.
- **last_verified_at**: 2026-04-26

### Layer 2 — Common quantitative facets
| Field | Value | Source |
|---|---|---|
| funding_cap_hkd (per project) | HK$10,000,000 per approved project | ITF ESS page (https://www.itf.gov.hk/en/funding-programmes/supporting-research/ess/index.html) |
| funding_cap_cumulative_hkd | UNKNOWN — could not verify a per-enterprise lifetime ceiling; ESS does not publish one |
| funding_cap_concurrent_count | UNKNOWN — multiple concurrent ESS projects allowed if non-overlapping; no published hard count |
| funding_ratio | 0.50 : 0.50 (1:1 dollar-for-dollar) — applicant share **must be cash** (https://www.itf.gov.hk/filemanager/en/content_30/ess-success_2023_02.pdf §4.1.2) |
| disbursement_model | **milestone (half-yearly instalments)** with optional advance up to 50% of the first 6-month matching fund or HK$500,000 (whichever lower); 10% retention at last instalment until final audited accounts accepted (§4.1.1, §4.1.3, §4.1.6) |
| duration_months_cap | 24 months in general | ITF ESS page |
| cooldown_months | none formally |
| audit_threshold_hkd | Independent CPA audit mandatory regardless of project size; max external audit fees scale by project cost (e.g. final audit max HK$8K if project <HK$1M, HK$20K if >HK$5M) (§2.5.5) |
| decision_sla_days | ~60 days vetting (~2 months from complete submission) per ITF ESS page |

### Layer 3 — Eligibility dimensions
- **entity_types[]**: company **incorporated in Hong Kong** (note: BUD requires "registered under the BR Ordinance" which is broader; ESS requires actual HK incorporation)
- **min_years_in_operation**: none formally — but evaluators look at track record
- **max_employees**: none for the main scheme; an SME-track exists with <100 employees + project ≤HK$2.8M for streamlined handling (https://www.itf.gov.hk/en/funding-programmes/supporting-research/ess/) — but no hard cap on the main scheme
- **max_annual_revenue_hkd**: none
- **hk_substantive_operations_required**: implicit (R&D work must be conducted in HK; up to 50% of total project cost can be incurred outside HK with prior CIT approval per §3.1.3)
- **industry_inclusions[]**: any, but project must have a meaningful innovation-and-technology component (25% weight in evaluation)
- **industry_exclusions[]**: government-subvented organisations and their subsidiaries excluded
- **director_residency_required**: null
- **eligibility_notes_md**: Listing status is not a disqualifier (unlike BUD). Listed HK-incorporated companies CAN apply to ESS — this is a meaningful schema difference vs BUD. Restricted Persons (associates, family members of directors, related-party suppliers) cannot be project staff or vendors without prior CIT approval (§6.1.1, §6.2.2).

### Layer 4 — Section-tagged corpus
- **objective_md**: Encourage HK companies to conduct in-house R&D, especially downstream / commercialisation-oriented R&D that produces commercially viable deliverables. Government recoupment is NOT required and benefit-sharing is NOT mandatory — recipient keeps IP.
- **eligible_costs_md**: (a) Manpower for HK-based technical R&D staff including MPF (b) New equipment procured for the project (title held by company in HK) (c) Other direct costs: outsourcing to third-party tech vendors, consumables, sample/prototype production (e.g. IC tape-out, PCB), industrial standards/compliance testing (UL/CE/FCC), industrial design, pre-clinical/clinical trial, **patent registration up to HK$250K**, audit fees per the §2.5.5 schedule, market research at CIT discretion. Up to 50% of total project cost can be incurred outside HK with prior approval (§3.1.3).
- **ineligible_costs_md**: Building rates/rental/renovation/utilities, equipment repair/maintenance, association/consortium set-up costs, transport including shuttle/commute, video conferencing/conference call costs, general admin/office expenses, staff training and fringe benefits, entertainment, advertisement, trade-mission organisation/participation, non-R&D services (accounting/legal/security/cleaning) provided in-house, prior-period adjustments, capital financing (mortgage/loan interest). Director/shareholder remuneration generally disallowed without CIT pre-approval and conflict-of-interest declaration.
- **application_process_md**: Submit Application Form via ITCFAS (https://itcfas.itf.gov.hk) plus one signed/stamped hard copy. ESS Assessment Panel reviews; on recommendation, applicant has 3 months to address comments and finalise budget/milestones. Sign Fund Agreement. Open Designated Bank Account. Project commences on agreed date.
- **required_documents_md**: Certificate of Incorporation, current Business Registration, latest Annual Return, change-of-director/secretary notices, name-change notices (if applicable), organisational chart, project proposal with milestones + cashflow + budget, vendor quotations (≥2 for procurement >HK$5K-$50K, ≥5 for >HK$50K-$1.4M, open tender for >HK$1.4M; threshold raised to HK$1,350,000 for items procured from 1-Jan-2026 per the ITF ESS page).
- **evaluation_criteria_md**: (i) Innovation and Technology Component — 25%; (ii) Technical and Management Capability — 20%; (iii) Reasonableness of Project Cost — 15%; (iv) Commercial Viability of Project Deliverables — 30%; (v) Relevance to Community Interest or Government Policies — 10%. (https://www.itf.gov.hk/en/funding-programmes/supporting-research/ess/index.html)
- **disbursement_md**: Half-yearly instalments based on approved cashflow. First instalment paid on Fund Agreement signing + opening of Designated Bank Account; subsequent instalments require evidence of company matching contribution from previous period. Optional advance payment up to 50% of first 6-month ITF matching fund or HK$500K (whichever lower). At least 10% of government share retained until final report + final audited project accounts accepted by CIT. Mis-spent amounts plus interest are clawback-able.
- **reporting_md**: Progress reports per Reporting Schedule in the Fund Agreement; final report due within 2 months of project completion. Interim audited project accounts: first interim within 1 month of cutoff date; for projects >18 months, second interim covering first 12 months; final audited accounts within 3 months (or 1 month if project cost <HK$1M). Project books retained 7 years post-completion. Audited by HKICPA-registered CPA per ITC's Notes for Auditors (§2.5).
- **common_violations_md**: Hiring related parties without disclosure; charging shareholder/director remuneration without pre-approval; paying for ineligible items (entertainment, training, office utilities); equipment depreciation (only actual purchase, no depreciation); double-funding with another ITF project; failing to maintain Designated Bank Account discipline; failing to follow procurement quotation thresholds; budget virement >30% within equipment or other-direct-costs categories without CIT approval (§2.6.3).
- **comparison_md**: ESS is the only one of the four schemes that funds R&D itself (vs. BUD's brand/upgrade/sales focus). It is also the only one with a proper milestone disbursement model, mandatory CPA audit regardless of size, and a Designated Bank Account requirement. ESS does NOT exclude listed companies (BUD does). ESS allows in-kind only via salary of dedicated R&D staff — applicant share must be cash, unlike (e.g.) some Mainland R&D grants where in-kind labour qualifies.

### Layer 5 — Relations
- **related[]**: ITSP-Platform/Seed, ITSP-Collaborative, ITF Public Sector Trial Scheme (PSTS-TC) — ESS recipients can apply PSTS-TC to trial the deliverables
- **supersedes**: none
- **superseded_by**: none
- **exclusive_with[]**: cannot double-fund the same item with any other ITF programme, government-subvented body project, or university project (§3.1.1); cannot pay an ITF-already-funded staffer's salary from ESS

### Layer 6 — Free-form
- **examples_md**: A medtech start-up developing an AI-based diagnostic device — 24-month project, HK$8M total, $4M ITF + $4M company match. Costs: 3 R&D engineers (HK-based) + 1 part-time clinical advisor + IC tape-out + clinical trial subcontract to a HK university partner + UL testing + patent registration in HK, US, EU.
- **faq_md**: Q: Does the company keep IP? A: Yes — recipient retains IP, benefit-sharing not mandatory, no government recoupment. Q: Can the founder draw a salary from ESS? A: Generally no — shareholders/directors cannot draw remuneration from Project Funds without CIT pre-approval and conflict-of-interest mitigation; if approved, must be at fair-market salary, not equity-equivalent (§6.2.2).
- **internal_notes_md**: ESS's official guidelines PDF (Feb 2023) is the authoritative source — I successfully extracted detailed text from it. The ESS web page is shallow; the PDF is where the schema-relevant detail lives. The 1:1 matching is **strict cash** on the applicant side; the schema's `funding_ratio` field is therefore correct only if interpreted as cash share. Note ITF "ESS" terminology distinct from "Easy BUD's Easy" — separate schemes; do not collapse.

---

## Schema Collision Report

This is the schema-design audit. Where the layered model fails, I name it.

### 1. Layer 2 (quantitative facets) — what generalised, what didn't

**Worked across all four:** `funding_cap_hkd` (per project), `funding_ratio`, `decision_sla_days` (with caveats), `disbursement_model` (treated as enum), `duration_months_cap`. The per-project cap is the one Layer-2 field that exists for every scheme.

**Worked for some, failed for others:**
- `funding_cap_cumulative_hkd` — clean for BUD ($7M lifetime); for ESS, no published lifetime cap exists, so `null` is genuinely correct rather than "unknown". Two different reasons for null collapse into the same field, which is information-losing. **Recommend splitting** into `funding_cap_cumulative_hkd` (number or null) plus `cumulative_cap_basis` enum: `per_enterprise_lifetime | per_year | none_published | unknown`.
- `cooldown_months` — only Easy BUD has a real cooldown (3 months). For the others it's "none formally". The structured field is honest if defaulted to null/0, but a flag like `has_cooldown_rule` would be more useful for downstream UX.
- `audit_threshold_hkd` — fundamentally broken as a single number. ESS audits *every* project regardless of size, with audit-fee caps that *scale with project cost in a 3x3 grid* (interim 1/2/final × <$1M / $1-5M / >$5M). BUD General has a flat HK$10K audit-fee cap. Easy BUD has no published audit requirement at all. The single `audit_threshold_hkd` field cannot model "audit always required, with a fee schedule" vs "audit required above $X" vs "no audit". **Recommend dropping `audit_threshold_hkd` and replacing** with `audit_required` enum (`always | above_threshold | none`) plus `audit_fee_schedule_md` (free text or structured nested object).

**Fundamentally awkward:**
- `funding_cap_concurrent_count` — for BUD, the concurrent limit is a *value* cap (HK$800K of in-flight commitments), not a *count* cap. For ESS, there's no published rule. The field as designed assumes a count, which is wrong for the most important user (BUD).
- BUD-EE has a **track-specific cumulative cap of HK$1M nested inside the global HK$7M BUD cap**. There is no field for "carve-out cumulative cap inside another scheme's cumulative cap". This nests across the scheme/track boundary and breaks any single-table model.
- ESS's disbursement model is genuinely "milestone with optional 50% advance and 10% retention" — the enum (reimbursement | milestone | upfront | mixed) is too coarse. ESS picks "milestone" but loses the advance-payment and retention nuance. Either expand the enum or add a `disbursement_notes_md` field.

### 2. Layer 3 (eligibility) — what generalised cleanly

**Cleanly generalised:** `entity_types[]`, `hk_substantive_operations_required`, `industry_exclusions[]` (all four are "any industry, listed-company exclusion or none"), `director_residency_required` (all four: null).

**Misleading when structured:**
- `min_years_in_operation` — BUD requires 1 year; ESS has none formally but evaluators consider track record. A null on ESS reads as "no requirement" but evaluation reality is more nuanced. The field is technically correct, semantically misleading.
- `max_employees` — only meaningful for ESS's optional SME track (<100 employees → streamlined). For BUD, the field is irrelevant. For ESS itself, it's a *track selector*, not a *gate*. Forcing it into a single eligibility dimension misrepresents how it operates.
- `entity_types[]` — BUD requires "non-listed HK enterprise (BR-registered)" but ESS requires "incorporated in Hong Kong" — these are different legal tests (BR registration is broader than incorporation). The structured enum needs to distinguish "BR-registered" from "HK-incorporated" rather than collapsing both into "HK enterprise".

### 3. Layer 4 (section-tagged corpus) — vocabulary fit

**Sections that fit all four:** `objective_md`, `eligible_costs_md`, `ineligible_costs_md`, `application_process_md`, `required_documents_md`, `evaluation_criteria_md`, `disbursement_md`, `reporting_md`, `common_violations_md`, `comparison_md`. All produced meaningful content.

**Sections that needed to flex:**
- `evaluation_criteria_md` — for ESS this is a precise five-component weighted rubric (25/20/15/30/10), for BUD it's prose about "deliverability + reasonableness + benefit". Treating both as the same `evaluation_criteria_md` is fine for an LLM consumer, but a structured `evaluation_rubric[]` array of `{name, weight}` would surface for ESS. Recommend keeping `evaluation_criteria_md` AND adding optional `evaluation_rubric[]` for schemes that publish weights.
- `reporting_md` and `disbursement_md` — for ESS these have so much detail (Designated Bank Account discipline, 7-year retention, three audit interim cutoffs, advance payment cap formula) that the two sections together exceed what any other scheme needs. Not a schema bug, but the LLM context for ESS will be 3x the volume of BUD-EE — worth budgeting for.
- `common_violations_md` — only meaningful where there's enforcement history. ESS has rich content (procurement breaches, related-party hiring, double-funding); BUD-EE has thinner content. Acceptable to leave thinner sections thin.

**Sections missing from the model:**
- **Approval-statistics / approval-rate section** — LCQ18 publishes per-track approval rates (60% Easy BUD, 41% E-commerce Easy, ~52% General) which materially changes how a drafter LLM should pitch to the user. There's no native section for this; it ended up shoehorned into `evaluation_criteria_md` or `examples_md`. **Recommend adding** `track_record_md` (or structured `approval_stats {applications, approvals, rejections, withdrawals, period}`).
- **Recent-changes / patch-notes section** — the 14-Mar-2025 enhancements and 2026-27 Budget changes are crucial to drafting accurate applications today. There's no section for "recent changes a drafter must know about". I bled this into `internal_notes_md`. **Recommend adding** `recent_changes_md` with date-stamped entries.

**Sections that risk being empty:**
- `comparison_md` works only because the schemes form an ecosystem. For an isolated scheme like CPPP or SFDF (in the broader HK fund universe), this section is harder to write and may be empty. Acceptable.

### 4. Recommended FINAL schema

**Keep, unmodified:** `id`, `name`, `sponsor`, `administering_body`, `status`, `category/track`, `source_url`, `official_references[]`, `short_description`, `last_verified_at`, `funding_cap_hkd`, `funding_ratio`, `duration_months_cap`, `cooldown_months`, `decision_sla_days`, `entity_types[]`, `hk_substantive_operations_required`, `industry_inclusions[]`, `industry_exclusions[]`, `director_residency_required`, `eligibility_notes_md`, all of Layer 4 corpus sections, all of Layer 5 relations, all of Layer 6.

**Modify:**
- `funding_cap_cumulative_hkd` → split into `cumulative_cap_hkd` + `cumulative_cap_basis` enum + optional nested `track_specific_caps[]` for cases like BUD-EE's $1M-inside-$7M.
- `funding_ratio` → add `applicant_share_form` enum: `cash_only | cash_or_in_kind | mixed_with_pre_approval` to capture ESS's strict-cash rule vs. schemes that count salary as in-kind.
- `disbursement_model` → keep enum but require companion `disbursement_notes_md` field for milestone schemes that have advance-payment caps and retention rules (ESS).
- `audit_threshold_hkd` → drop. Replace with `audit_required` enum (`always | above_threshold | none`) + `audit_fee_schedule_md`.
- `funding_cap_concurrent_count` → rename to `concurrent_limit` with type `{kind: count|value, amount: number}` to capture BUD's value-based concurrency.
- `min_years_in_operation` → keep, but add `track_record_evaluated` boolean for schemes (ESS) where prior performance is a soft factor.

**Drop:**
- `max_employees` and `max_annual_revenue_hkd` — for these four schemes, both are essentially always null. They will matter for some HK schemes (e.g., the old EMF SME definition, TVP's SME criteria), so don't remove from the schema entirely — but flag them as "scheme-specific, frequently null" rather than core.

**Add:**
- `track_record_md` (or structured `approval_stats`) — populate from LegCo replies and HKPC press releases.
- `recent_changes_md` — date-stamped material changes (Budget enhancements, ratio shifts, scope expansions).
- `evaluation_rubric[]` (optional) — `{criterion, weight_pct}` for schemes that publish weighted criteria.

### 5. Specific things that broke the model

- **ESS's 1:1 matching is strict cash, not "1:1 of any kind".** The schema's `funding_ratio` field treats applicant_share=0.5 as a flat number. It does not capture that the applicant cannot meet that 0.5 with in-kind director time, equity grants, or third-party loans. For BUD the same ratio also implies cash, but for, e.g., some Mainland HK GBA grants you can co-fund partially in-kind. → Need `applicant_share_form` discriminator.
- **BUD-EE's nested cumulative cap** (HK$1M e-commerce sub-cap inside HK$7M overall) is the single hardest thing to model. A flat scalar cumulative-cap field cannot represent it. Either nested struct, or denormalise BUD-EE as its own scheme but with a foreign key to BUD General sharing a parent ceiling.
- **ESS's milestone disbursement with advance + retention** is not capturable by a single enum value. "milestone" loses 80% of the operational reality.
- **ESS audit fees scale with project cost in a 3x3 grid.** The Layer-2 `audit_threshold_hkd` field assumes a single threshold. Replacing with a markdown blob (`audit_fee_schedule_md`) is a confession that we can't structure this — but it's the right confession.
- **HKPC-vs-TID administrative split.** The `administering_body` field collapses "TID is policy owner; HKPC is implementer" to a single value. For a drafter LLM, this matters: enquiries go to HKPC, but appeal/policy questions go to TID. Recommend splitting into `policy_owner` + `implementer` (both nullable).
- **EMF consolidation as of 2026-06-30** is a hybrid lifecycle event — EMF doesn't strictly disappear; its scope flows into Easy BUD. Layer 5's `superseded_by` only partially captures this. A scheme can have a "successor" without being fully replaced if the successor only absorbs *part* of its scope. Recommend `partial_supersession[]` with scope notes, not just `supersedes/superseded_by`.
- **The "AI-targeted enhancement" from Budget 2026-27 para. 132** does not yet have an implementing rule book — Easy BUD applicants today benefit from "more targeted funding support for enterprises in AI application" but without a published mechanism. The schema currently has no place for "scheme-pending sub-track" status. Tolerable in the short term; flag for revisit when HKPC publishes guidance.

---

## Sources

- 2026-27 Hong Kong Budget Speech: https://www.budget.gov.hk/2026/eng/budget18.html
- LCQ18 reply on BUD Fund (1 April 2026): https://www.info.gov.hk/gia/general/202604/01/P2026040100529.htm
- LCQ2 reply on BUD Fund (15 October 2025): https://www.cedb.gov.hk/en/legco-business/questions/2025/pr15102025a.html
- LCQ6 reply on BUD Fund (30 October 2024): https://www.info.gov.hk/gia/general/202410/30/P2024103000453.htm
- 14-Mar-2025 BUD/EMF enhancement press release: https://www.info.gov.hk/gia/general/202503/13/P2025031300415.htm
- TID BUD Fund page: https://www.tid.gov.hk/en/our_work/support_for_trade_industry/bud.html
- BUD Fund portal: https://www.bud.hkpc.org/en
- HKPC BEE portal: https://bee.hkpc.org/
- HKPC press release on E-commerce Easy: https://www.hkpc.org/en/about-us/media-centre/press-releases/2024/bud-fund-e-commerce-easy
- ITF ESS scheme page: https://www.itf.gov.hk/en/funding-programmes/supporting-research/ess/index.html
- ITF ESS Funding & Administrative Guidelines for Successful Applicants (Feb 2023): https://www.itf.gov.hk/filemanager/en/content_30/ess-success_2023_02.pdf
- ITF ESS FAQ (Mar 2023): https://www.itf.gov.hk/filemanager/en/content_30/FAQ-EN_20230324.pdf
- 2020 ITC press release on ESS enhanced funding: https://www.info.gov.hk/gia/general/202001/31/P2020012900573.htm
- SME Link BUD page: https://www.smelink.gov.hk/en/web/sme-portal/w/dedicated-fund-on-branding-upgrading-and-domestic-sales.html
- SME Link ESS page: https://www.smelink.gov.hk/en/web/sme-portal/w/enterprise-support-scheme.html
- EMF latest enhancements: https://www.smefund.tid.gov.hk/english/emf/emf_update.html
- Secondary (used where official source incomplete): https://www.fundfluent.io/resources/bud-fund-hong-kong-guide
