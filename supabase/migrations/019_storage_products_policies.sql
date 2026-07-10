-- Políticas RLS para el bucket público `products`.
-- Sin estas políticas, RLS en storage.objects bloquea INSERT/UPDATE/DELETE
-- aunque el bucket sea público (solo lectura pública funciona).

drop policy if exists "products public read" on storage.objects;
create policy "products public read"
  on storage.objects for select
  to public
  using (bucket_id = 'products');

drop policy if exists "products admin insert" on storage.objects;
create policy "products admin insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'products'
    and exists (
      select 1 from public.admins a where a.admin_id = (select auth.uid())
    )
  );

drop policy if exists "products admin update" on storage.objects;
create policy "products admin update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'products'
    and exists (
      select 1 from public.admins a where a.admin_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'products'
    and exists (
      select 1 from public.admins a where a.admin_id = (select auth.uid())
    )
  );

drop policy if exists "products admin delete" on storage.objects;
create policy "products admin delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'products'
    and exists (
      select 1 from public.admins a where a.admin_id = (select auth.uid())
    )
  );
