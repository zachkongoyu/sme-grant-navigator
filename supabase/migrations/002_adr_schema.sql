-- Launch schema for live HK fund catalog.
-- Run AFTER 001_initial_schema.sql.
-- Safe to re-run: uses IF NOT EXISTS and guarded policy creation.

create extension if not exists pgcrypto;

-- ── Schemes (fund catalog) ──────────────────────────────────────────────────
create table if not exists schemes (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  sponsor             text,
  category            text not null,
  status              text not null,               -- 'open', 'coming_soon', 'closed', 'rolling'
  funding_cap         numeric,
  currency            text not null default 'HKD',
  duration_months     int,
  short_description   text not null,
  guidance_md         text not null,
  source_url          text,
  updated_at          timestamptz not null default now()
);

-- If `schemes` existed before this migration, ensure `id` still auto-generates.
do $$
declare
  id_type text;
begin
  select data_type into id_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'schemes' and column_name = 'id';

  if id_type = 'uuid' then
    execute 'alter table schemes alter column id set default gen_random_uuid()';
  elsif id_type = 'text' then
    execute 'alter table schemes alter column id set default gen_random_uuid()::text';
  end if;
end
$$;

-- If an older ADR migration already created `schemes`, make this shape additive.
alter table schemes add column if not exists category text not null default 'General';
alter table schemes add column if not exists funding_cap numeric;
alter table schemes add column if not exists duration_months int;
alter table schemes add column if not exists short_description text not null default '';
alter table schemes add column if not exists guidance_md text not null default '';
alter table schemes add column if not exists updated_at timestamptz not null default now();

-- Remove legacy slug if present.
drop index if exists schemes_slug_idx;
alter table schemes drop constraint if exists schemes_slug_key;
alter table schemes drop column if exists slug;

-- Migrate legacy numeric field when present.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'schemes' and column_name = 'max_funding_amount'
  ) then
    execute 'update schemes set funding_cap = coalesce(funding_cap, max_funding_amount)';
  end if;
end
$$;

create index if not exists schemes_status_idx   on schemes(status);
create index if not exists schemes_category_idx on schemes(category);
create unique index if not exists schemes_name_key on schemes(name);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table schemes enable row level security;

do $$
begin
  -- Public read for catalog browsing.
  if not exists (
    select 1 from pg_policies where tablename = 'schemes' and policyname = 'schemes_public_read'
  ) then
    execute 'create policy schemes_public_read on schemes for select using (true)';
  end if;

  -- Internal API routes use service role for writes.
  if not exists (
    select 1 from pg_policies where tablename = 'schemes' and policyname = 'service_role_all'
  ) then
    execute 'create policy service_role_all on schemes for all to service_role using (true)';
  end if;
end
$$;
