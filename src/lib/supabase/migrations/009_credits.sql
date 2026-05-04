-- ── Profiles table ───────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  credits_balance  int  not null default 0 check (credits_balance >= 0),
  free_checks_used int  not null default 0 check (free_checks_used >= 0),
  created_at       timestamptz not null default now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── Auto-create profile on sign-up ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, credits_balance, free_checks_used)
  values (new.id, 0, 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Backfill existing users ───────────────────────────────────────────────────
insert into public.profiles (id, credits_balance, free_checks_used)
select id, 0, 0 from auth.users
on conflict (id) do nothing;

-- ── Atomic eligibility check consumer ────────────────────────────────────────
-- Returns: 'free' | 'credit' | 'insufficient'
create or replace function public.consume_eligibility_check(p_user_id uuid)
returns text as $$
declare
  v_free_checks_used  int;
  v_credits_balance   int;
  v_updated           int;
begin
  select free_checks_used, credits_balance
    into v_free_checks_used, v_credits_balance
    from public.profiles
   where id = p_user_id
   for update;

  if not found then
    return 'insufficient';
  end if;

  -- Use free check if allowance remains (hardcoded 3 — matches BILLING.freeChecks)
  if v_free_checks_used < 3 then
    update public.profiles
       set free_checks_used = free_checks_used + 1
     where id = p_user_id;
    return 'free';
  end if;

  -- Deduct 1 credit (hardcoded — matches BILLING.creditCost.eligibilityCheck)
  if v_credits_balance >= 1 then
    update public.profiles
       set credits_balance = credits_balance - 1
     where id = p_user_id;
    return 'credit';
  end if;

  return 'insufficient';
end;
$$ language plpgsql security definer;

-- ── Atomic credit addition (called by Stripe webhook via service_role) ────────
create or replace function public.add_credits(p_user_id uuid, p_amount int)
returns void as $$
begin
  update public.profiles
     set credits_balance = credits_balance + p_amount
   where id = p_user_id;
end;
$$ language plpgsql security definer;

-- ── Atomic credit deduction (drafter + future features) ──────────────────────
-- Returns true if deducted, false if insufficient balance
create or replace function public.deduct_credit(p_user_id uuid, p_amount int)
returns boolean as $$
declare
  v_updated int;
begin
  update public.profiles
     set credits_balance = credits_balance - p_amount
   where id = p_user_id
     and credits_balance >= p_amount;

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$ language plpgsql security definer;
