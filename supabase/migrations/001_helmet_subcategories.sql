-- Subcategorías de casco para importación desde proveedores
insert into subcategories (name, category_id)
select v.name, c.id
from (values
  ('Deportivo', 'Cascos'),
  ('Infantil', 'Cascos'),
  ('Urbano', 'Cascos'),
  ('Vintage', 'Cascos'),
  ('Trail', 'Cascos')
) as v(name, category)
join categories c on c.name = v.category
on conflict (name, category_id) do nothing;
