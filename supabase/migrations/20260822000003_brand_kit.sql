create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_name text default '',
  logo_url text,
  whatsapp text,
  facebook_url text,
  contact_phone text,
  currency text not null default 'BDT',
  inside_dhaka_delivery numeric(12,2) not null default 80,
  outside_dhaka_delivery numeric(12,2) not null default 120,
  default_language text not null default 'both',
  cod_enabled boolean not null default true,
  primary_color text not null default '#2F4156',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_settings
  add column if not exists brand_name text,
  add column if not exists secondary_color text default '#C8D9E6',
  add column if not exists brand_font text default 'Inter',
  add column if not exists default_cta text default 'Order Now',
  add column if not exists default_tone text default 'sales',
  add column if not exists brand_tagline text;

update public.store_settings
set brand_name = coalesce(brand_name, store_name),
    primary_color = coalesce(primary_color, '#2F4156'),
    secondary_color = coalesce(secondary_color, '#C8D9E6'),
    brand_font = coalesce(brand_font, 'Inter'),
    default_cta = coalesce(default_cta, 'Order Now'),
    default_tone = coalesce(default_tone, 'sales')
where true;

alter table public.store_settings enable row level security;
drop policy if exists "Users can view own store settings" on public.store_settings;
create policy "Users can view own store settings" on public.store_settings for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can insert own store settings" on public.store_settings;
create policy "Users can insert own store settings" on public.store_settings for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own store settings" on public.store_settings;
create policy "Users can update own store settings" on public.store_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own store settings" on public.store_settings;
create policy "Users can delete own store settings" on public.store_settings for delete to authenticated using ((select auth.uid()) = user_id);
