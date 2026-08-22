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
