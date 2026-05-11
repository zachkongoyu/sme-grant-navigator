-- Migration 013: add contact field to projects
alter table public.projects
  add column if not exists contact_url text;
