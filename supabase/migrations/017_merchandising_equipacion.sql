-- Añadir categorías Merchandising y Equipación con sus subcategorías

BEGIN;

-- 1. Insertar nuevas categorías
INSERT INTO categories (name) VALUES
  ('Merchandising'),
  ('Equipación')
ON CONFLICT (name) DO NOTHING;

-- 2. Insertar subcategorías de Equipación
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
  ('Chaqueta hombre', 'Equipación'),
  ('Chaqueta mujer', 'Equipación'),
  ('Pantalón hombre', 'Equipación'),
  ('Pantalón mujer', 'Equipación'),
  ('Guantes', 'Equipación'),
  ('Botas', 'Equipación')
) AS v(name, categoria)
JOIN categories c ON c.name = v.categoria
ON CONFLICT (name, category_id) DO NOTHING;

COMMIT;
