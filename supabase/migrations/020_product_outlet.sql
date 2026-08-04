-- Flag outlet en productos (mutuamente excluyente con is_new)

alter table products
  add column if not exists is_outlet boolean not null default false;

alter table products
  drop constraint if exists products_novedad_outlet_exclusive;

alter table products
  add constraint products_novedad_outlet_exclusive
  check (not (is_new and is_outlet));

create index if not exists products_is_new_idx
  on products (created_at desc)
  where is_new = true;

create index if not exists products_is_outlet_idx
  on products (created_at desc)
  where is_outlet = true;

-- Incluir is_outlet (y slug) en búsqueda semántica del chat
drop function if exists public.match_products(vector, double precision, integer);

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
  is_outlet boolean,
  slug text,
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
    coalesce(p.is_outlet, false) as is_outlet,
    p.slug,
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

grant execute on function public.match_products(vector, double precision, integer) to anon, authenticated, service_role;
