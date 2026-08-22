-- SCommerce legacy schema, kept idempotent for fresh installs and migration replays.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  store_name text,
  avatar_url text,
  language text not null default 'en' check (language in ('en','bn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists store_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists language text not null default 'en';
alter table public.profiles add column if not exists workspace_name text not null default 'My SCommerce Workspace';
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, slug text not null, description text, price numeric(12,2) not null default 0 check (price >= 0),
  compare_at_price numeric(12,2), currency text not null default 'BDT', image_url text, images jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb, ai_content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, slug)
);

create table if not exists public.product_pages (
  id uuid primary key default gen_random_uuid(), product_id uuid not null unique references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, slug text not null unique,
  theme jsonb not null default '{"primary":"#2F4156","teal":"#567C8D","sky":"#C8D9E6","beige":"#F5EFEB","white":"#FFFFFF"}'::jsonb,
  sections jsonb not null default '[]'::jsonb, checkout_settings jsonb not null default '{"enabled":true,"payment_method":"cod","delivery_charge":0}'::jsonb,
  is_published boolean not null default false, published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete restrict,
  seller_id uuid not null references auth.users(id) on delete cascade, order_number bigint generated always as identity unique,
  customer_name text not null, phone text not null, email text, address text not null, district text, area text,
  quantity integer not null default 1 check (quantity > 0), unit_price numeric(12,2) not null check (unit_price >= 0),
  delivery_charge numeric(12,2) not null default 0 check (delivery_charge >= 0),
  total numeric(12,2) generated always as ((quantity * unit_price) + delivery_charge) stored,
  payment_method text not null default 'cod', transaction_id text, notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists products_user_id_idx on public.products(user_id);
create index if not exists products_status_idx on public.products(status);
create index if not exists product_pages_slug_idx on public.product_pages(slug);
create index if not exists orders_seller_id_idx on public.orders(seller_id);
create index if not exists orders_product_id_idx on public.orders(product_id);
create index if not exists orders_status_idx on public.orders(status);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name','')) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
drop trigger if exists product_pages_updated_at on public.product_pages;
create trigger product_pages_updated_at before update on public.product_pages for each row execute procedure public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_pages enable row level security;
alter table public.orders enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "products_select_own" on public.products;
create policy "products_select_own" on public.products for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "products_insert_own" on public.products;
create policy "products_insert_own" on public.products for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "products_update_own" on public.products;
create policy "products_update_own" on public.products for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "products_delete_own" on public.products;
create policy "products_delete_own" on public.products for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "products_public_published" on public.products;
create policy "products_public_published" on public.products for select to anon, authenticated using (status = 'published');

drop policy if exists "pages_select_own" on public.product_pages;
create policy "pages_select_own" on public.product_pages for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "pages_insert_own" on public.product_pages;
create policy "pages_insert_own" on public.product_pages for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "pages_update_own" on public.product_pages;
create policy "pages_update_own" on public.product_pages for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "pages_delete_own" on public.product_pages;
create policy "pages_delete_own" on public.product_pages for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "pages_public_published" on public.product_pages;
create policy "pages_public_published" on public.product_pages for select to anon, authenticated using (is_published = true);

drop policy if exists "orders_seller_select" on public.orders;
create policy "orders_seller_select" on public.orders for select to authenticated using ((select auth.uid()) = seller_id);
drop policy if exists "orders_seller_update" on public.orders;
create policy "orders_seller_update" on public.orders for update to authenticated using ((select auth.uid()) = seller_id) with check ((select auth.uid()) = seller_id);
drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert" on public.orders for insert to anon, authenticated with check (exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.user_id = seller_id));
