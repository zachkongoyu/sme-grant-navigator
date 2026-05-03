-- Auth + payments migration.
-- Run AFTER 004_grant_schemes_access.sql.

-- ── Add paid flag to sessions ────────────────────────────────────────────────
alter table sessions add column if not exists paid boolean not null default false;

-- ── RLS: replace service_role-only policies with user-scoped ones ────────────
-- Users can access their own sessions.
-- Anonymous sessions (user_id IS NULL) are accessible only via the service role
-- (i.e. through API routes that use the service role key).

drop policy if exists service_role_all on sessions;
drop policy if exists service_role_all on attachments;

-- Service role retains full access (API routes).
create policy service_role_all on sessions
  for all to service_role using (true);

create policy service_role_all on attachments
  for all to service_role using (true);

-- Authenticated users can read/write their own sessions.
create policy user_own_sessions on sessions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy user_own_attachments on attachments
  for all to authenticated
  using (
    session_id in (
      select id from sessions where user_id = auth.uid()
    )
  );
