-- Esquema base Asfalto y Gas (compatible con melomerezco)
-- Ejecutar una sola vez en un proyecto Supabase vacío.

create extension if not exists "pgcrypto";
create extension if not exists vector;

-- Catálogo
create table if not exists categories (
  id serial primary key,
  name text not null unique
);

create table if not exists subcategories (
  id serial primary key,
  name text not null,
  category_id integer not null references categories(id) on delete cascade,
  unique (name, category_id)
);

create table if not exists colors (
  id serial primary key,
  name text not null unique,
  hex text not null default '#CCCCCC'
);

create table if not exists products (
  product_id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  category_id integer references categories(id) on delete set null,
  subcategory_id integer references subcategories(id) on delete set null,
  stock integer not null default 0,
  is_new boolean not null default false,
  is_published boolean not null default true,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists product_variants (
  variant_id serial primary key,
  product_id uuid not null references products(product_id) on delete cascade,
  size text not null,
  color text,
  color_id integer references colors(id) on delete restrict,
  stock integer not null default 0 check (stock >= 0)
);

create table if not exists product_images (
  id serial primary key,
  product_id uuid not null references products(product_id) on delete cascade,
  image_url text not null,
  orden integer not null default 0,
  is_main boolean not null default false,
  alt_text text
);

create table if not exists product_colors (
  product_id uuid not null references products(product_id) on delete cascade,
  color_id integer not null references colors(id) on delete cascade,
  primary key (product_id, color_id)
);

-- Clientes y direcciones
create table if not exists customers (
  customer_id uuid primary key default gen_random_uuid(),
  auth_id uuid unique,
  email text not null unique,
  name text not null default '',
  surname text default '',
  phone text default '',
  created_at timestamptz not null default now()
);

create table if not exists shipping_addresses (
  shipping_address_id serial primary key,
  customer_id uuid not null references customers(customer_id) on delete cascade,
  address_type text not null default 'Principal',
  street text not null,
  floor text,
  door text,
  stair text,
  province text not null,
  city text not null,
  zip text not null,
  location_id integer,
  is_default boolean not null default false
);

create table if not exists customer_favorites (
  customer_id uuid not null references customers(customer_id) on delete cascade,
  product_id uuid not null references products(product_id) on delete cascade,
  primary key (customer_id, product_id)
);

create table if not exists payment_methods (
  id serial primary key,
  customer_id uuid not null references customers(customer_id) on delete cascade,
  provider text not null,
  provider_token text not null default '',
  type text not null default 'card',
  last4 text,
  brand text,
  exp_month integer,
  exp_year integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Pedidos
create table if not exists orders (
  order_id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(customer_id) on delete set null,
  order_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  subtotal numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  shipping_cost numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  discount_code text,
  order_status text not null default 'Pending',
  payment_status text not null default 'pending',
  payment_method text,
  payment_method_id integer,
  shipping_method text,
  shipping_address_id integer,
  shipping_city text,
  shipping_province text,
  shipping_zip text,
  shipping_street text,
  shipping_floor text,
  shipping_door text,
  shipping_stair text,
  tracking_number text,
  carrier text,
  shipped_date timestamptz,
  delivery_date timestamptz,
  customer_email text,
  guest_name text,
  guest_surname text,
  guest_phone text,
  items jsonb not null default '[]'::jsonb
);

create table if not exists order_items (
  id serial primary key,
  order_id uuid not null references orders(order_id) on delete cascade,
  product_id uuid,
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  price numeric(10, 2) not null default 0,
  unit_price_original numeric(10, 2),
  line_discount numeric(10, 2) default 0,
  size text,
  color text,
  variant_id integer references product_variants(variant_id) on delete set null,
  image_url text
);

-- Admin, newsletter, ubicaciones
create table if not exists admins (
  admin_id uuid primary key,
  username text not null,
  email text not null unique,
  password text,
  name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id serial primary key,
  user_id uuid,
  email text not null,
  status text not null default 'pending',
  subscribed_at timestamptz not null default now(),
  confirmation_token text,
  unique (email)
);

create table if not exists spanish_locations (
  id serial primary key,
  zip_code text not null,
  municipality text not null,
  province text not null
);

create index if not exists idx_spanish_locations_zip on spanish_locations(zip_code);

-- Embeddings (chat IA)
create table if not exists product_embeddings (
  product_id uuid primary key references products(product_id) on delete cascade,
  content text not null default '',
  embedding vector(1536) not null
);

create index if not exists idx_product_embeddings_vector
  on product_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Índices útiles
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_subcategory on products(subcategory_id);
create index if not exists idx_products_published on products(is_published);
create index if not exists idx_product_variants_product on product_variants(product_id);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_date on orders(order_date desc);
create index if not exists idx_order_items_order on order_items(order_id);

-- Sincronizar order_items desde orders.items (JSON)
create or replace function public.sync_order_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from order_items where order_id = new.order_id;

  if new.items is not null and jsonb_typeof(new.items) = 'array' then
    insert into order_items (
      order_id,
      product_id,
      name,
      quantity,
      price,
      unit_price_original,
      line_discount,
      size,
      color,
      variant_id,
      image_url
    )
    select
      new.order_id,
      nullif(item->>'product_id', '')::uuid,
      coalesce(item->>'name', 'Producto'),
      coalesce((item->>'quantity')::integer, 1),
      coalesce((item->>'price')::numeric, 0),
      nullif(item->>'unit_price_original', '')::numeric,
      coalesce(nullif(item->>'line_discount', '')::numeric, 0),
      nullif(item->>'size', ''),
      nullif(item->>'color', ''),
      nullif(item->>'variant_id', '')::integer,
      nullif(item->>'image_url', '')
    from jsonb_array_elements(new.items) as item;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_order_items on orders;
create trigger trg_sync_order_items
after insert or update of items on orders
for each row
execute function public.sync_order_items();

-- Descontar stock tras pago (webhook Redsys)
create or replace function public.decrement_stock(p_variant_id integer, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update product_variants
  set stock = greatest(0, stock - coalesce(p_quantity, 0))
  where variant_id = p_variant_id;
end;
$$;

-- Búsqueda semántica para el chat
create or replace function public.match_products(
  query_embedding vector(1536),
  match_threshold float default 0.35,
  match_count int default 12
)
returns table (
  product_id uuid,
  name text,
  description text,
  price numeric,
  is_new boolean,
  variants jsonb
)
language sql
stable
set search_path = public
as $$
  select
    p.product_id,
    p.name,
    p.description,
    p.price,
    coalesce(p.is_new, false) as is_new,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'size', pv.size,
            'color', c.name,
            'stock', pv.stock
          )
        )
        from product_variants pv
        left join colors c on c.id = pv.color_id
        where pv.product_id = p.product_id
      ),
      '[]'::jsonb
    ) as variants
  from product_embeddings pe
  join products p on p.product_id = pe.product_id
  where p.is_published = true
    and (1 - (pe.embedding <=> query_embedding)) > match_threshold
  order by pe.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

-- RLS (políticas permisivas; ajustar en producción si hace falta)
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'subcategories', 'colors', 'products', 'product_variants',
    'product_images', 'product_colors', 'customers', 'shipping_addresses',
    'customer_favorites', 'payment_methods', 'orders', 'order_items',
    'admins', 'subscriptions', 'spanish_locations', 'product_embeddings'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public all" on %I', t);
    execute format(
      'create policy "public all" on %I for all using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- Datos iniciales moto
insert into colors (name, hex)
values ('Neutro', '#9CA3AF')
on conflict (name) do nothing;

insert into categories (name) values
  ('Cascos'),
  ('Equipación'),
  ('Accesorios')
on conflict (name) do nothing;

insert into subcategories (name, category_id)
select v.name, c.id
from (values
  ('Integral', 'Cascos'),
  ('Modular', 'Cascos'),
  ('Jet', 'Cascos'),
  ('Cross', 'Cascos'),
  ('Deportivo', 'Cascos'),
  ('Infantil', 'Cascos'),
  ('Urbano', 'Cascos'),
  ('Vintage', 'Cascos'),
  ('Trail', 'Cascos'),
  ('Chaquetas', 'Equipación'),
  ('Pantalones', 'Equipación'),
  ('Guantes', 'Equipación'),
  ('Botas', 'Equipación'),
  ('Intercoms', 'Accesorios'),
  ('Maletas', 'Accesorios'),
  ('Outlet', 'Accesorios')
) as v(name, category)
join categories c on c.name = v.category
on conflict (name, category_id) do nothing;
