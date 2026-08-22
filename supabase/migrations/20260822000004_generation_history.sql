create table if not exists public.generation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.product_assets(id) on delete set null,
  product_name text,
  generation_type text not null check (generation_type in ('analysis','sales_content','creative')),
  language text,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists generation_history_user_id_idx on public.generation_history(user_id);
create index if not exists generation_history_created_at_idx on public.generation_history(created_at desc);
alter table public.generation_history enable row level security;
drop policy if exists "Users can view own generation history" on public.generation_history;
create policy "Users can view own generation history" on public.generation_history for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can insert own generation history" on public.generation_history;
create policy "Users can insert own generation history" on public.generation_history for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own generation history" on public.generation_history;
create policy "Users can update own generation history" on public.generation_history for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own generation history" on public.generation_history;
create policy "Users can delete own generation history" on public.generation_history for delete to authenticated using ((select auth.uid()) = user_id);
