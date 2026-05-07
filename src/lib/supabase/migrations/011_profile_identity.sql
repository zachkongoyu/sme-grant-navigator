-- Add identity fields to profiles table for public profile feature.

alter table public.profiles
  add column if not exists display_name   text,
  add column if not exists headline       text,
  add column if not exists bio            text,
  add column if not exists roles          text[]  not null default '{}',
  add column if not exists location       text,
  add column if not exists links          jsonb   not null default '{}',
  add column if not exists is_public      boolean not null default true;

-- Allow anon reads on the profiles table (for public profile pages).
grant select on public.profiles to anon;

-- Anyone can read a public profile.
create policy "Public profiles readable by all"
  on public.profiles for select
  to anon, authenticated
  using (is_public = true);
