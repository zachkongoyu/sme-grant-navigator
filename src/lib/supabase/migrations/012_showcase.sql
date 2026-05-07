-- Migration 012: Showcase / Projects table

create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  created_by      uuid not null references auth.users(id) on delete cascade,
  makers          uuid[] not null default '{}',
  name            text not null,
  tagline         text,
  description     text,
  web_url         text,
  app_store_url   text,
  play_store_url  text,
  media_url       text,
  thumbnail_url   text,
  stage           text check (stage in ('idea','building','launched')),
  status          text not null default 'draft' check (status in ('draft','published')),
  platform        text[] not null default '{}',
  sector          text[] not null default '{}',
  seeking         text[] not null default '{}',
  traction        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- RLS
alter table public.projects enable row level security;

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;

-- Anyone can read published projects
create policy "Published projects readable by all"
  on public.projects for select
  to anon, authenticated
  using (status = 'published');

-- Creators can read their own drafts
create policy "Creators can read own projects"
  on public.projects for select
  to authenticated
  using (created_by = auth.uid());

-- Creators can insert
create policy "Creators can insert projects"
  on public.projects for insert
  to authenticated
  with check (created_by = auth.uid());

-- Creators can update own projects
create policy "Creators can update own projects"
  on public.projects for update
  to authenticated
  using (created_by = auth.uid());

-- Creators can delete own projects
create policy "Creators can delete own projects"
  on public.projects for delete
  to authenticated
  using (created_by = auth.uid());

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();
