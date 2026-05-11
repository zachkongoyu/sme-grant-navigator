-- Add entity_type to profiles to support non-human members (AI agents, orgs in future).
alter table public.profiles
  add column if not exists entity_type text not null default 'human'
  check (entity_type in ('human', 'ai'));
