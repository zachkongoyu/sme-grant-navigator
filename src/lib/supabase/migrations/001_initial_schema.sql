-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE.

-- ── Sessions ────────────────────────────────────────────────────────────────
-- Stores the full message history for each chat session.
-- auth.user_id is nullable — anonymous sessions are supported for MVP.
create table if not exists sessions (
  id          text primary key,
  title       text not null default 'New session',
  messages    jsonb not null default '[]'::jsonb,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists sessions_updated_at_idx on sessions(updated_at desc);

-- ── Attachments ─────────────────────────────────────────────────────────────
-- Metadata + extracted text for files uploaded by users.
-- Actual bytes live in Supabase Storage bucket "attachments".
create table if not exists attachments (
  id              text primary key,
  session_id      text not null references sessions(id) on delete cascade,
  name            text not null,
  mime            text not null,
  size            int  not null,
  storage_path    text,                    -- null for MVP; populated when Storage upload is enabled
  extracted_text  text,
  created_at      timestamptz not null default now()
);

create index if not exists attachments_session_id_idx on attachments(session_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- All access goes through the service role key from API routes, which bypasses
-- RLS. Enable RLS now as a safety net; permissive policies added when auth ships.
alter table sessions    enable row level security;
alter table attachments enable row level security;

-- Temporary: allow service role full access (already implicit, but explicit is clearer).
-- Replace with user-scoped policies when NextAuth is wired in Week 3.
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'sessions' and policyname = 'service_role_all'
  ) then
    execute 'create policy service_role_all on sessions for all to service_role using (true)';
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'attachments' and policyname = 'service_role_all'
  ) then
    execute 'create policy service_role_all on attachments for all to service_role using (true)';
  end if;
end
$$;

-- ── Storage bucket ───────────────────────────────────────────────────────────
-- Create via Supabase Dashboard → Storage → New bucket:
--   Name: attachments
--   Public: NO (signed URLs only)
-- Or uncomment and run via service role:
-- insert into storage.buckets (id, name, public)
-- values ('attachments', 'attachments', false)
-- on conflict (id) do nothing;
