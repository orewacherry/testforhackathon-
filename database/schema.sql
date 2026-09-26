-- ---------------------------------------------------------------------------
-- ProofWork database schema
--
-- How to use this file:
--   1. Open your project on https://supabase.com
--   2. Click "SQL Editor" in the left sidebar
--   3. Click "New query"
--   4. Paste everything below and press "Run"
--
-- You only need to run it once.
-- ---------------------------------------------------------------------------

-- The one table this app needs.
create table if not exists public.proofs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  claim text not null,
  evidence_url text not null,
  created_at timestamptz not null default now(),

  -- Database-level limits, so long text cannot sneak in even if the API
  -- validation is changed later.
  constraint name_length check (char_length(name) between 1 and 60),
  constraint claim_length check (char_length(claim) between 1 and 120),
  constraint evidence_url_length check (char_length(evidence_url) between 1 and 500),
  constraint evidence_url_format check (evidence_url ~* '^https?://')
);

-- Row Level Security (RLS) is a Supabase safety net: by default it blocks
-- everything unless you write a rule that allows it.
--
-- Turn it ON, then allow only what we actually want.
alter table public.proofs enable row level security;

-- RULE 1: everybody may READ proofs.
-- A proof wall is meant to be public, so this is on purpose.
drop policy if exists "Public can read proofs" on public.proofs;
create policy "Public can read proofs"
  on public.proofs
  for select
  to anon, authenticated
  using (true);

-- RULE 2: writing.
-- Notice there is NO insert/update/delete policy here, and that is
-- deliberate. With RLS on and no write policy, the public anon key cannot
-- add or change anything.
--
-- So who can write? Only the backend, because it uses the service_role key,
-- which bypasses RLS. All writes therefore go through our own validation.
--
-- ⚠️ This means the service_role key is the keys to the kingdom. Never put
--    it in the frontend, never commit it, never paste it in a screenshot.
