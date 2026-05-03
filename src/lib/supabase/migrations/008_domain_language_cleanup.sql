-- Domain language cleanup for schemes.
-- Run AFTER 007_easy_bud_cap.sql.
-- Safe to re-run.

-- Rename `sponsor` -> `administrator`.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'schemes' and column_name = 'sponsor'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'schemes' and column_name = 'administrator'
  ) then
    execute 'alter table schemes rename column sponsor to administrator';
  end if;
end
$$;

-- Rename `guidance_md` -> `corpus`.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'schemes' and column_name = 'guidance_md'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'schemes' and column_name = 'corpus'
  ) then
    execute 'alter table schemes rename column guidance_md to corpus';
  end if;
end
$$;

-- Normalize persisted status values to domain vocabulary.
update schemes
set
  status = case
    when lower(replace(status, '_', '-')) = 'active' then 'open'
    when lower(replace(status, '_', '-')) = 'coming-soon' then 'coming-soon'
    when lower(replace(status, '_', '-')) = 'closed' then 'closed'
    when lower(replace(status, '_', '-')) = 'open' then 'open'
    else status
  end,
  updated_at = now()
where lower(replace(status, '_', '-')) in ('active', 'coming-soon', 'closed', 'open')
  and status <> case
    when lower(replace(status, '_', '-')) = 'active' then 'open'
    when lower(replace(status, '_', '-')) = 'coming-soon' then 'coming-soon'
    when lower(replace(status, '_', '-')) = 'closed' then 'closed'
    when lower(replace(status, '_', '-')) = 'open' then 'open'
    else status
  end;

comment on column schemes.administrator is 'Government body or agency that runs the Scheme.';
comment on column schemes.corpus is 'Flat markdown corpus for Scheme reasoning and drafting.';
comment on column schemes.status is 'Canonical SchemeStatus values: open, coming-soon, closed.';

-- Future migration, not done here:
-- 1. add `version` to schemes for cache invalidation
-- 2. split v2 tables: applicants, applications, assessments
-- 3. use `insufficient_info` when assessments/verdicts persist in DB