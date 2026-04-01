create table if not exists public.app_snapshots (
  user_id uuid primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_app_snapshots_updated_at
  on public.app_snapshots (updated_at desc);

alter table public.app_snapshots enable row level security;

grant select, insert, update on public.app_snapshots to anon, authenticated, service_role;

drop policy if exists "app_snapshots_select_own" on public.app_snapshots;
create policy "app_snapshots_select_own"
  on public.app_snapshots
  for select
  to anon, authenticated
  using (
    user_id::text = coalesce(current_setting('request.headers', true)::json ->> 'x-auth-user', '')
  );

drop policy if exists "app_snapshots_insert_own" on public.app_snapshots;
create policy "app_snapshots_insert_own"
  on public.app_snapshots
  for insert
  to anon, authenticated
  with check (
    user_id::text = coalesce(current_setting('request.headers', true)::json ->> 'x-auth-user', '')
  );

drop policy if exists "app_snapshots_update_own" on public.app_snapshots;
create policy "app_snapshots_update_own"
  on public.app_snapshots
  for update
  to anon, authenticated
  using (
    user_id::text = coalesce(current_setting('request.headers', true)::json ->> 'x-auth-user', '')
  )
  with check (
    user_id::text = coalesce(current_setting('request.headers', true)::json ->> 'x-auth-user', '')
  );
