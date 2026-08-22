create table if not exists public.product_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  image_path text not null,
  image_url text,
  mime_type text not null,
  file_size bigint not null,
  status text not null default 'uploaded' check (status in ('uploading','uploaded','processing','ready','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_assets_user_id_idx on public.product_assets(user_id);

alter table public.product_assets enable row level security;

drop policy if exists "Users can view own product assets" on public.product_assets;
create policy "Users can view own product assets" on public.product_assets
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own product assets" on public.product_assets;
create policy "Users can insert own product assets" on public.product_assets
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own product assets" on public.product_assets;
create policy "Users can update own product assets" on public.product_assets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own product assets" on public.product_assets;
create policy "Users can delete own product assets" on public.product_assets
  for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Users can upload product images" on storage.objects;
create policy "Users can upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Users can view product images" on storage.objects;
create policy "Users can view product images" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Users can update product images" on storage.objects;
create policy "Users can update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid()::text))
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Users can delete product images" on storage.objects;
create policy "Users can delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid()::text));
