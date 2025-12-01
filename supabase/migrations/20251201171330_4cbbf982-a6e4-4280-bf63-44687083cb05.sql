create table public.featured_highlights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text not null,
  button_text text not null,
  button_link text not null,
  order_position integer not null,
  gradient_color text not null,
  status text not null default 'published',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.featured_highlights enable row level security;