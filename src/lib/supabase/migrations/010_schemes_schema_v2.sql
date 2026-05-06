-- Redesign schemes table to canonical domain schema.
-- Changes:
--   id:             uuid → text slug ('{jurisdiction}.{slug}', e.g. 'hk.bud-easy')
--   administrator:  now NOT NULL
--   jurisdiction:   new column (text not null, default 'HK' for existing rows)
--   max_funding:    renamed from funding_cap
--   next_deadline:  new column (replaces duration_months for time-bound schemes)
--   version:        new column for corpus cache invalidation
--   last_updated:   renamed from updated_at
--   DROPPED:        category, duration_months, short_description
-- Run AFTER 009_credits.sql.

-- ── Step 1: Assign text slugs to existing rows ────────────────────────────────

alter table schemes add column if not exists _slug text;

update schemes set _slug = case name
  when 'Easy BUD'                        then 'hk.bud-easy'
  when 'BUD Fund (General Application)'  then 'hk.bud-general'
  when 'BUD Fund (E-commerce Easy)'      then 'hk.bud-ecommerce'
  when 'Innovation and Technology Fund'  then 'hk.itf'
  when 'HKSTP Incubation Programmes'     then 'hk.hkstp-incu'
  when 'CreateSmart Initiative'          then 'hk.createsmart'
  else 'hk.' || lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
end
where _slug is null;

-- ── Step 2: Migrate bookmarks to slug-based scheme_id ─────────────────────────
-- bookmarks.scheme_id is text with no FK — safe to update in place.

update bookmarks b
set scheme_id = s._slug
from schemes s
where b.scheme_id = s.id::text
  and s._slug is not null;

-- ── Step 3: Create target table ───────────────────────────────────────────────

create table schemes_v2 (
  -- Convention: {jurisdiction}.{slug} e.g. 'hk.bud-easy', 'hk.itf-ess'
  id            text primary key,

  name          text not null,
  administrator text not null,         -- e.g. 'HKPC', 'ITC', 'HKSTP'
  jurisdiction  text not null,         -- e.g. 'HK', 'SG', 'global'
  status        text not null,         -- 'open', 'coming_soon', 'closed'
  currency      text not null default 'HKD',
  max_funding   numeric,               -- null = uncapped or not applicable
  next_deadline timestamptz,           -- null = rolling

  corpus        text not null,

  -- Bump on every corpus change to invalidate cached assessments
  version       int not null default 1,

  last_updated  timestamptz not null default now(),
  source_url    text
);

-- ── Step 4: Migrate data ──────────────────────────────────────────────────────

insert into schemes_v2 (
  id, name, administrator, jurisdiction, status,
  currency, max_funding, next_deadline, corpus,
  version, last_updated, source_url
)
select
  _slug,
  name,
  coalesce(nullif(administrator, ''), 'Unknown'),
  'HK',
  status,
  currency,
  funding_cap,
  null,
  corpus,
  1,
  updated_at,
  source_url
from schemes
where _slug is not null;

-- ── Step 5: Swap tables ───────────────────────────────────────────────────────

drop table schemes;
alter table schemes_v2 rename to schemes;

-- ── Step 6: Indexes ───────────────────────────────────────────────────────────

create index schemes_status_idx       on schemes(status);
create index schemes_jurisdiction_idx on schemes(jurisdiction);
create unique index schemes_name_key  on schemes(name);

-- ── Step 7: RLS ──────────────────────────────────────────────────────────────

alter table schemes enable row level security;

create policy schemes_public_read on schemes
  for select using (true);

create policy service_role_all on schemes
  for all to service_role using (true);
