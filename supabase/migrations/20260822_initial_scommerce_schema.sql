-- SCommerce initial schema
-- Apply this migration to Supabase project rtooucklshficdmmbgxu

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  store_name text,
  avatar_url text,
  language text not null default 'en' check (language in ('en','bn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, slug text not null, description text, price numeric(12,2) not null default 0 check (price >= 0),
  compare_at_price numeric(12,2), currency text not null default 'BDT', image_url text, images jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb, ai_content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, slug)
);

create table public.product_pages (
  id uuid primary key default gen_random_uuid(), product_id uuid not null unique references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, slug text not null unique,
  theme jsonb not null default '{"primary":"#2F4156","teal":"#567C8D","sky":"#C8D9E6","beige":"#F5EFEB","white":"#FFFFFF"}'::jsonb,
  sections jsonb not null default '[]'::jsonb, checkout_settings jsonb not null default '{"enabled":true,"payment_method":"cod","delivery_charge":0}'::jsonb,
  is_published boolean not null default false, published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.orders (
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

create index products_user_id_idx on public.products(user_id);
create index products_status_idx on public.products(status);
create index product_pages_slug_idx on public.product_pages(slug);
create index orders_seller_id_idx on public.orders(seller_id);
create index orders_product_id_idx on public.orders(product_id);
create index orders_status_idx on public.orders(status);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name','')) on conflict (id) do nothing; return new; end; $$;
create or replace trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger product_pages_updated_at before update on public.product_pages for each row execute procedure public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_pages enable row level security;
alter table public.orders enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "products_select_own" on public.products for select using (auth.uid() = user_id);
create policy "products_insert_own" on public.products for insert with check (auth.uid() = user_id);
create policy "products_update_own" on public.products for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "products_delete_own" on public.products for delete using (auth.uid() = user_id);
create policy "products_public_published" on public.products for select using (status = 'published');
create policy "pages_select_own" on public.product_pages for select using (auth.uid() = user_id);
create policy "pages_insert_own" on public.product_pages for insert with check (auth.uid() = user_id);
create policy "pages_update_own" on public.product_pages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pages_delete_own" on public.product_pages for delete using (auth.uid() = user_id);
create policy "pages_public_published" on public.product_pages for select using (is_published = true);
create policy "orders_seller_select" on public.orders for select using (auth.uid() = seller_id);
create policy "orders_seller_update" on public.orders for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "orders_public_insert" on public.orders for insert with check (exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.user_id = seller_id));

create or replace function public.create_public_order(p_product_id uuid,p_customer_name text,p_phone text,p_email text default null,p_address text default '',p_district text default null,p_area text default null,p_quantity integer default 1,p_payment_method text default 'cod',p_transaction_id text default null,p_notes text default null)
returns public.orders language plpgsql security definer set search_path = public as $$
declare v_product public.products; v_order public.orders;
begin
 select * into v_product from public.products where id = p_product_id and status = 'published';
 if not found then raise exception 'Product not available'; end if;
 insert into public.orders(product_id,seller_id,customer_name,phone,email,address,district,area,quantity,unit_price,payment_method,transaction_id,notes)
 values(v_product.id,v_product.user_id,p_customer_name,p_phone,p_email,p_address,p_district,p_area,p_quantity,payment_method,p_transaction_id,p_notes) returning * into v_order;
 return v_order;
end; $$;
