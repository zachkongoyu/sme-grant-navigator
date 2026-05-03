-- Seed schemes table with launch catalog.
-- Run AFTER 002_adr_schema.sql.
-- Safe to re-run: ON CONFLICT DO UPDATE refreshes edited rows.

insert into schemes (
  name,
  sponsor,
  category,
  status,
  funding_cap,
  currency,
  duration_months,
  short_description,
  guidance_md,
  source_url
)
values
(
  'Easy BUD',
  'HKPC / Trade and Industry Department',
  'BUD Fund',
  'open',
  100000,
  'HKD',
  12,
  'Simplified BUD track for self-implemented export and market-development projects into approved markets.',
  'Easy BUD is a reimbursement scheme. Government reimburses 25% of eligible project costs after project completion and external audit acceptance. The enterprise funds 100% upfront. Project ceiling is HK$100,000 total cost, with max HK$25,000 government reimbursement. Typical duration is up to 12 months and activities must be self-implemented by the Hong Kong entity. Core required application docs include BR certificate, certificate of incorporation, proof of substantive HK operations, and vendor quotations.',
  'https://www.bud.hkpc.org/'
),
(
  'BUD Fund (General Application)',
  'HKPC / Trade and Industry Department',
  'BUD Fund',
  'coming_soon',
  800000,
  'HKD',
  24,
  'Full BUD track for larger market-expansion projects with deeper documentation requirements.',
  'BUD General covers broader and larger-scope market expansion projects than Easy BUD. It retains the reimbursement model and matching ratio principles used in BUD family schemes, while requiring more detailed project design, execution plan, and supporting evidence. Applicants should verify latest limits and required forms from the official portal before submission.',
  'https://www.bud.hkpc.org/'
),
(
  'BUD Fund (E-commerce Easy)',
  'HKPC / Trade and Industry Department',
  'BUD Fund',
  'coming_soon',
  800000,
  'HKD',
  24,
  'Streamlined BUD e-commerce track for online sales channel buildout into target markets.',
  'BUD E-commerce Easy is designed for SMEs building or enhancing online sales channels for approved export markets. It follows BUD reimbursement mechanics and requires concrete e-commerce deliverables, measurable KPIs, and compliant budget evidence. Applicants should confirm current limits, approved activities, and required declarations from official guidance.',
  'https://www.bud.hkpc.org/'
),
(
  'Innovation and Technology Fund',
  'Innovation and Technology Commission',
  'Innovation',
  'coming_soon',
  null,
  'HKD',
  null,
  'Innovation funding programmes for R&D-led SMEs, prototypes, and commercialization workstreams.',
  'The Innovation and Technology Fund (ITF) includes multiple sub-schemes supporting R&D projects, technology adoption, and commercialization. Funding limits, co-funding requirements, and review criteria differ by sub-scheme. Applicants should select the relevant ITF stream first, then align technical novelty, deliverables, team capability, and commercialization path to that stream''s requirements.',
  'https://www.itf.gov.hk/'
),
(
  'HKSTP Incubation Programmes',
  'Hong Kong Science and Technology Parks Corporation',
  'Incubation',
  'coming_soon',
  null,
  'HKD',
  null,
  'Incubation pathways for Hong Kong startups needing structured support, grants, and commercialization guidance.',
  'HKSTP incubation and acceleration programmes provide startup support including mentorship, workspace, network access, and selected funding support. Assessment typically focuses on technology differentiation, execution capability, and growth potential. Applicants should prepare evidence of innovation, team strength, and commercialization readiness based on the target programme.',
  'https://www.hkstp.org/'
),
(
  'CreateSmart Initiative',
  'CreateHK / Commerce and Economic Development Bureau',
  'Creative',
  'coming_soon',
  null,
  'HKD',
  null,
  'Creative-industry support for projects that grow Hong Kong design, branding, and cultural business capabilities.',
  'CreateSmart supports projects that strengthen Hong Kong''s creative industries, including design, branding, and cultural commerce. Evaluation typically considers public/industry value, execution feasibility, sector development impact, and deliverable quality. Applicants should verify the active funding call scope, eligibility, and form requirements on the official site.',
  'https://www.createhk.gov.hk/'
)
on conflict (name) do update set
  name = excluded.name,
  sponsor = excluded.sponsor,
  category = excluded.category,
  status = excluded.status,
  funding_cap = excluded.funding_cap,
  currency = excluded.currency,
  duration_months = excluded.duration_months,
  short_description = excluded.short_description,
  guidance_md = excluded.guidance_md,
  source_url = excluded.source_url,
  updated_at = now();
