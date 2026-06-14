-- Nueva taxonomía de categorías y subcategorías para Asfalto y Gas
-- Reemplaza las categorías anteriores (Cascos, Equipación, Accesorios + subcats)
-- por la nueva estructura: Cascos, Equipaje, Aceites y lubricantes, Mantenimiento

BEGIN;

-- 1. Desvincular productos de subcategorías que van a desaparecer
UPDATE products SET subcategory_id = NULL
WHERE subcategory_id IS NOT NULL;

-- 2. Desvincular productos de categorías que van a desaparecer
UPDATE products SET category_id = NULL
WHERE category_id IS NOT NULL;

-- 3. Desvincular códigos de descuento de subcategorías viejas
DELETE FROM subcategory_discount_codes;

-- 4. Borrar subcategorías viejas (cascade ya borra las FK)
DELETE FROM subcategories;

-- 5. Borrar categorías viejas
DELETE FROM categories;

-- 6. Insertar nuevas categorías
INSERT INTO categories (id, name) VALUES
  (1, 'Cascos'),
  (2, 'Equipaje'),
  (3, 'Aceites y lubricantes'),
  (4, 'Mantenimiento')
ON CONFLICT (name) DO NOTHING;

-- 7. Insertar nuevas subcategorías
INSERT INTO subcategories (name, category_id) VALUES
  -- Cascos
  ('Jet', 1),
  ('Modular', 1),
  ('Integral', 1),
  -- Equipaje
  ('Alforjas', 2),
  ('Bolsas sobredepósito', 2),
  ('Maletas laterales', 2),
  ('Maletas superiores', 2),
  ('Fijaciones', 2),
  ('Accesorios y recambios maletas', 2),
  -- Aceites y lubricantes
  ('Aceites y lubricantes', 3),
  ('Aceite de motor', 3),
  ('Motores 2T', 3),
  ('Motores 4T', 3),
  ('Aceite de horquilla', 3),
  ('Aceite de transmisión', 3),
  ('Aceite amortiguadores', 3),
  ('Aceite de filtro de aire', 3),
  ('Otros lubricantes', 3),
  -- Mantenimiento
  ('Aditivos', 4),
  ('Líquido de freno', 4),
  ('Anticongelantes y líquido de embrague', 4)
ON CONFLICT (name, category_id) DO NOTHING;

-- 8. Resetear la secuencia de IDs para que los próximos INSERTs no coincidan
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
SELECT setval('subcategories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM subcategories));

COMMIT;