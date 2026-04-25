-- Bookmarks table.
-- Run AFTER 005_auth_and_payments.sql.

create table if not exists bookmarks (
  user_id    uuid not null references auth.users(id) on delete cascade,
  scheme_id  text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, scheme_id)
);

create index if not exists bookmarks_user_id_idx on bookmarks(user_id);

alter table bookmarks enable row level security;

-- Service role full access (API routes).
create policy service_role_all on bookmarks
  for all to service_role using (true);

-- Users manage only their own bookmarks.
create policy user_own_bookmarks on bookmarks
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
