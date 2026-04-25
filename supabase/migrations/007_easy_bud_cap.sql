-- Fix Easy BUD funding cap to HK$150,000 (2026-27 Budget enhancement, effective April 23 2026).
-- Add slug column for stable URL routing (uuid primary keys are bad for SEO).
-- Safe to re-run.

alter table schemes add column if not exists slug text;

create unique index if not exists schemes_slug_key on schemes(slug) where slug is not null;

-- Populate slugs by name for all current seeded schemes.
update schemes set slug = 'easy-bud'           where name = 'Easy BUD'                       and slug is null;
update schemes set slug = 'bud-general'        where name = 'BUD Fund (General Application)' and slug is null;
update schemes set slug = 'bud-ecommerce-easy' where name = 'BUD Fund (E-commerce Easy)'     and slug is null;
update schemes set slug = 'itf'                where name = 'Innovation and Technology Fund'  and slug is null;
update schemes set slug = 'hkstp'              where name = 'HKSTP Incubation Programmes'     and slug is null;
update schemes set slug = 'createsmart'        where name = 'CreateSmart Initiative'          and slug is null;

-- Fix the funding cap (was HK$100,000 in the original seed).
update schemes
set    funding_cap = 150000,
       updated_at  = now()
where  slug = 'easy-bud';
