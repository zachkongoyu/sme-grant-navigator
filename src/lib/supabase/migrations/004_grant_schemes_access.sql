-- Ensure roles used by the app can read the live scheme catalog.
-- Safe to re-run.

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.schemes to anon, authenticated, service_role;
grant insert, update, delete on table public.schemes to service_role;