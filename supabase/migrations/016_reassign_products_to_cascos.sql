-- Reasignar productos que quedaron sin categoría (category_id = NULL)
-- tras la migración de taxonomía.
--
-- La mayoría de productos son cascos. Se asignan a Cascos (id=1).
-- Se intenta inferir la subcategoría a partir del nombre del producto.

BEGIN;

-- 1. Asignar todos los productos sin categoría a Cascos (id=1)
UPDATE products
SET category_id = 1
WHERE category_id IS NULL;

-- 2. Inferir subcategoría por nombre del producto (case-insensitive)
-- Integral
UPDATE products
SET subcategory_id = (SELECT id FROM subcategories WHERE name = 'Integral' AND category_id = 1 LIMIT 1)
WHERE subcategory_id IS NULL
  AND category_id = 1
  AND (name ILIKE '%integral%');

-- Modular
UPDATE products
SET subcategory_id = (SELECT id FROM subcategories WHERE name = 'Modular' AND category_id = 1 LIMIT 1)
WHERE subcategory_id IS NULL
  AND category_id = 1
  AND (name ILIKE '%modular%');

-- Jet
UPDATE products
SET subcategory_id = (SELECT id FROM subcategories WHERE name = 'Jet' AND category_id = 1 LIMIT 1)
WHERE subcategory_id IS NULL
  AND category_id = 1
  AND (name ILIKE '%jet%');

COMMIT;