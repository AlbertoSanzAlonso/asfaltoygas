-- Marcas / fabricantes de producto (AGV, HJC, Shoei…)
create table if not exists brands (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table products
  add column if not exists brand_id integer references brands(id) on delete set null;

create index if not exists idx_products_brand on products(brand_id);

alter table brands enable row level security;
drop policy if exists "brands public all" on brands;
create policy "brands public all" on brands for all using (true) with check (true);

-- Catálogo inicial moto
insert into brands (name, slug) values
  ('HJC', 'hjc'),
  ('AGV', 'agv'),
  ('Shoei', 'shoei'),
  ('Nolan', 'nolan'),
  ('X-Lite', 'x-lite'),
  ('Airoh', 'airoh'),
  ('Bell', 'bell'),
  ('Scorpion', 'scorpion'),
  ('MT Helmets', 'mt-helmets'),
  ('Caberg', 'caberg'),
  ('Shark', 'shark'),
  ('Axxis', 'axxis'),
  ('LS2', 'ls2'),
  ('Suomy', 'suomy'),
  ('Dexter', 'dexter')
on conflict (name) do nothing;
