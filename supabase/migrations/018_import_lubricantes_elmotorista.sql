-- Migration: Importar lubricantes desde El Motorista
-- Precios con +20% de margen sobre precio del proveedor
-- Categoría: Aceites y lubricantes (ID=3)
-- Subcategorías: Motores 2T, Motores 4T, Aceite de transmisión

-- 1. Insertar marcas nuevas
INSERT INTO brands (name, slug) VALUES ('Repsol', 'repsol') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (name, slug) VALUES ('Motorex', 'motorex') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (name, slug) VALUES ('Motul', 'motul') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (name, slug) VALUES ('Castrol', 'castrol') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (name, slug) VALUES ('BRP / Bombardier', 'brp---bombardier') ON CONFLICT (name) DO NOTHING;

-- 2. Insertar productos

-- Product 1: Repsol Aceite Rp Moto Racing 2t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Rp Moto Racing 2t 1l',
    'Marca:RepsolEn StockRef:RP145P51',
    35.72,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/504706474art/repsol/aceite-rp-moto-racing-2t-1l-382663_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/504706474art/repsol/aceite-rp-moto-racing-2t-1l-382663_800.webp', 0, true, 'Repsol Aceite Rp Moto Racing 2t 1l');

END $$;

-- Product 2: Repsol Rp Moto Racing 4t 10w60 Cp-1
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Rp Moto Racing 4t 10w60 Cp-1',
    'Marca:RepsolEn StockRef:RP160G51',
    19.02,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/504706457art/repsol/rp-moto-racing-4t-10w60-cp-1-397489_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/504706457art/repsol/rp-moto-racing-4t-10w60-cp-1-397489_800.webp', 0, true, 'Repsol Rp Moto Racing 4t 10w60 Cp-1');

END $$;

-- Product 3: Motorex Aceite Motor 4t Racing Pro 4t 15w/50 1 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t Racing Pro 4t 15w/50 1 L.',
    'Marca:MotorexEn StockRef:MT019H004T',
    35.84,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503700019art/motorex/aceite-motor-4t-racing-pro-4t-15w-50-1-l-499738_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503700019art/motorex/aceite-motor-4t-racing-pro-4t-15w-50-1-l-499738_800.webp', 0, true, 'Motorex Aceite Motor 4t Racing Pro 4t 15w/50 1 L.');

END $$;

-- Product 4: Repsol Aceite Racing 4t 10w50 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Racing 4t 10w50 4l',
    'Marca:RepsolEn StockRef:RPP2000NGB',
    74.3,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029913art/repsol/aceite-racing-4t-10w50-4l-398457_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029913art/repsol/aceite-racing-4t-10w50-4l-398457_800.webp', 0, true, 'Repsol Aceite Racing 4t 10w50 4l');

END $$;

-- Product 5: Motul Aceite Motul Ngen 7 15w50 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 7 15w50 4t 1l',
    'Marca:MotulEn StockRef:111824',
    23.3,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505485671art/motul/aceite-motul-ngen-7-15w50-4t-1l-445797_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505485671art/motul/aceite-motul-ngen-7-15w50-4t-1l-445797_800.webp', 0, true, 'Motul Aceite Motul Ngen 7 15w50 4t 1l');

END $$;

-- Product 6: Repsol Rp Moto Off Road 2t Cp-1
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Rp Moto Off Road 2t Cp-1',
    'Marca:RepsolEn StockRef:RP147Z51',
    24.25,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/504706476art/repsol/rp-moto-off-road-2t-cp-1-382678_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/504706476art/repsol/rp-moto-off-road-2t-cp-1-382678_800.webp', 0, true, 'Repsol Rp Moto Off Road 2t Cp-1');

END $$;

-- Product 7: Motul Aceite Motul Ngen 5 10w50 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 5 10w50 4t 1l',
    'Marca:MotulEn StockRef:111831',
    18.94,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505399307art/motul/aceite-motul-ngen-5-10w50-4t-1l-434205_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505399307art/motul/aceite-motul-ngen-5-10w50-4t-1l-434205_800.webp', 0, true, 'Motul Aceite Motul Ngen 5 10w50 4t 1l');

END $$;

-- Product 8: Motul Aceite Motul Kart Grand Prix 2t
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Kart Grand Prix 2t',
    'Marca:MotulEn StockRef:105884',
    40.78,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503796749art/motul/aceite-motul-kart-grand-prix-2t-348228_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503796749art/motul/aceite-motul-kart-grand-prix-2t-348228_800.webp', 0, true, 'Motul Aceite Motul Kart Grand Prix 2t');

END $$;

-- Product 9: Repsol Aceite Repsol Moto Racing 4t 15w50 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Repsol Moto Racing 4t 15w50 1l',
    'Marca:RepsolEn StockRef:RPP2000RHC',
    19.9,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029680art/repsol/aceite-repsol-moto-racing-4t-15w50-1l-398459_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029680art/repsol/aceite-repsol-moto-racing-4t-15w50-1l-398459_800.webp', 0, true, 'Repsol Aceite Repsol Moto Racing 4t 15w50 1l');

END $$;

-- Product 10: Motorex Aceite Motor Scooter 4t 10w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Scooter 4t 10w40 1l',
    'Marca:MotorexEn StockRef:MT050H004T',
    16.43,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190096art/motorex/aceite-motor-scooter-4t-10w40-1l-387170_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190096art/motorex/aceite-motor-scooter-4t-10w40-1l-387170_800.webp', 0, true, 'Motorex Aceite Motor Scooter 4t 10w40 1l');

END $$;

-- Product 11: Repsol Aceite Repsol Moto Off Road 4t 10w40 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Repsol Moto Off Road 4t 10w40 4l',
    'Marca:RepsolEn StockRef:RPP2006MGB',
    71.64,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029683art/repsol/aceite-repsol-moto-off-road-4t-10w40-4l-385697_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029683art/repsol/aceite-repsol-moto-off-road-4t-10w40-4l-385697_800.webp', 0, true, 'Repsol Aceite Repsol Moto Off Road 4t 10w40 4l');

END $$;

-- Product 12: Motul Aceite Motul Ngen 5 10w30 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 5 10w30 4t 1l',
    'Marca:MotulEn StockRef:111817',
    18.94,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505399303art/motul/aceite-motul-ngen-5-10w30-4t-1l-434201_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505399303art/motul/aceite-motul-ngen-5-10w30-4t-1l-434201_800.webp', 0, true, 'Motul Aceite Motul Ngen 5 10w30 4t 1l');

END $$;

-- Product 13: Motorex Aceite Motor 4t Top Speed 4t  5w/40 4 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t Top Speed 4t  5w/40 4 L.',
    'Marca:MotorexEn StockRef:MT016I004T',
    68.44,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503699986art/motorex/aceite-motor-4t-top-speed-4t-5w-40-4-l-499742_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503699986art/motorex/aceite-motor-4t-top-speed-4t-5w-40-4-l-499742_800.webp', 0, true, 'Motorex Aceite Motor 4t Top Speed 4t  5w/40 4 L.');

END $$;

-- Product 14: Motul Aceite Motul Ngen 5 10w50 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 5 10w50 4t 4l',
    'Marca:MotulEn StockRef:111832',
    64.08,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505399309art/motul/aceite-motul-ngen-5-10w50-4t-4l-434212_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505399309art/motul/aceite-motul-ngen-5-10w50-4t-4l-434212_800.webp', 0, true, 'Motul Aceite Motul Ngen 5 10w50 4t 4l');

END $$;

-- Product 15: Repsol Aceite Smarter Scooter 2t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Smarter Scooter 2t 1l',
    'Marca:RepsolEn StockRef:RPP2121ZHC',
    24.82,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029940art/repsol/aceite-smarter-scooter-2t-1l-398616_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029940art/repsol/aceite-smarter-scooter-2t-1l-398616_800.webp', 0, true, 'Repsol Aceite Smarter Scooter 2t 1l');

END $$;

-- Product 16: Castrol Aceite Castrol Power 1 Ultimate 4t 10w50 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Castrol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Castrol Aceite Castrol Power 1 Ultimate 4t 10w50 1l',
    'Marca:CastrolEn StockRef:15FFAE',
    16.33,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/castrol/505759606art/castrol/aceite-castrol-power-1-ultimate-4t-10w50-1l-530794_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/castrol/505759606art/castrol/aceite-castrol-power-1-ultimate-4t-10w50-1l-530794_800.webp', 0, true, 'Castrol Aceite Castrol Power 1 Ultimate 4t 10w50 1l');

END $$;

-- Product 17: Repsol Rp Moto Transmissions Trial 75w Cp-1
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Aceite de transmisión';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Rp Moto Transmissions Trial 75w Cp-1',
    'Marca:RepsolEn StockRef:RP173T51',
    20.52,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/504706483art/repsol/rp-moto-transmissions-trial-75w-cp-1-399232_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/504706483art/repsol/rp-moto-transmissions-trial-75w-cp-1-399232_800.webp', 0, true, 'Repsol Rp Moto Transmissions Trial 75w Cp-1');

END $$;

-- Product 18: Motul Aceite Motul Ngen 5 15w50 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 5 15w50 4t 4l',
    'Marca:MotulEn StockRef:111834',
    64.08,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505399311art/motul/aceite-motul-ngen-5-15w50-4t-4l-434307_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505399311art/motul/aceite-motul-ngen-5-15w50-4t-4l-434307_800.webp', 0, true, 'Motul Aceite Motul Ngen 5 15w50 4t 4l');

END $$;

-- Product 19: Motul Aceite Motul Ngen 7 10w50 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 7 10w50 4t 1l',
    'Marca:MotulEn StockRef:111822',
    23.3,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505485644art/motul/aceite-motul-ngen-7-10w50-4t-1l-445795_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505485644art/motul/aceite-motul-ngen-7-10w50-4t-1l-445795_800.webp', 0, true, 'Motul Aceite Motul Ngen 7 10w50 4t 1l');

END $$;

-- Product 20: Motul Aceite Motul Ngen 7 10w50 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 7 10w50 4t 4l',
    'Marca:MotulEn StockRef:111823',
    81.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505485645art/motul/aceite-motul-ngen-7-10w50-4t-4l-445796_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505485645art/motul/aceite-motul-ngen-7-10w50-4t-4l-445796_800.webp', 0, true, 'Motul Aceite Motul Ngen 7 10w50 4t 4l');

END $$;

-- Product 21: Motul Aceite Motul Ngen 7 15w50 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 7 15w50 4t 4l',
    'Marca:MotulEn StockRef:111825',
    81.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505485646art/motul/aceite-motul-ngen-7-15w50-4t-4l-445798_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505485646art/motul/aceite-motul-ngen-7-15w50-4t-4l-445798_800.webp', 0, true, 'Motul Aceite Motul Ngen 7 15w50 4t 4l');

END $$;

-- Product 22: Motorex Aceite Motorex Scooter Forza 4t 5w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motorex Scooter Forza 4t 5w40 1l',
    'Marca:MotorexEn StockRef:MT020H004T',
    23.9,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/504424352art/motorex/aceite-motorex-scooter-forza-4t-5w40-1l-318628_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/504424352art/motorex/aceite-motorex-scooter-forza-4t-5w40-1l-318628_800.webp', 0, true, 'Motorex Aceite Motorex Scooter Forza 4t 5w40 1l');

END $$;

-- Product 23: Motorex Aceite Scooter 4t 5w/40 1l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Scooter 4t 5w/40 1l.',
    'Marca:MotorexEn StockRef:MT140H004T',
    17.89,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/504706370art/motorex/aceite-scooter-4t-5w-40-1l-499747_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/504706370art/motorex/aceite-scooter-4t-5w-40-1l-499747_800.webp', 0, true, 'Motorex Aceite Scooter 4t 5w/40 1l.');

END $$;

-- Product 24: Motorex Aceite Motor Legend 4t 20w50 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Legend 4t 20w50 1l',
    'Marca:MotorexEn StockRef:MT057H004T',
    18.14,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190136art/motorex/aceite-motor-legend-4t-20w50-1l-388401_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190136art/motorex/aceite-motor-legend-4t-20w50-1l-388401_800.webp', 0, true, 'Motorex Aceite Motor Legend 4t 20w50 1l');

END $$;

-- Product 25: Repsol Aceite Repsol Turbo Elite Life 0w30 5l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Repsol Turbo Elite Life 0w30 5l',
    'Marca:RepsolEn StockRef:RPP0063EFB',
    82.07,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505056294art/repsol/aceite-repsol-turbo-elite-life-0w30-5l-389905_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505056294art/repsol/aceite-repsol-turbo-elite-life-0w30-5l-389905_800.webp', 0, true, 'Repsol Aceite Repsol Turbo Elite Life 0w30 5l');

END $$;

-- Product 26: Motul Aceite Motul Ngen 5 15w50 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 5 15w50 4t 1l',
    'Marca:MotulEn StockRef:111833',
    18.94,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505399310art/motul/aceite-motul-ngen-5-15w50-4t-1l-434306_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505399310art/motul/aceite-motul-ngen-5-15w50-4t-1l-434306_800.webp', 0, true, 'Motul Aceite Motul Ngen 5 15w50 4t 1l');

END $$;

-- Product 27: Motul Aceite Motul Ngen 7 5w40 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 7 5w40 4t 4l',
    'Marca:MotulEn StockRef:111827',
    81.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505485641art/motul/aceite-motul-ngen-7-5w40-4t-4l-445799_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505485641art/motul/aceite-motul-ngen-7-5w40-4t-4l-445799_800.webp', 0, true, 'Motul Aceite Motul Ngen 7 5w40 4t 4l');

END $$;

-- Product 28: Repsol Rp Moto Racing 4t 10w40 Cp-4
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Rp Moto Racing 4t 10w40 Cp-4',
    'Marca:RepsolEn StockRef:RP160N54',
    66.08,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/504706461art/repsol/rp-moto-racing-4t-10w40-cp-4-423395_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/504706461art/repsol/rp-moto-racing-4t-10w40-cp-4-423395_800.webp', 0, true, 'Repsol Rp Moto Racing 4t 10w40 Cp-4');

END $$;

-- Product 29: Motul Aceite Motul Ngen 5 10w40 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 5 10w40 4t 1l',
    'Marca:MotulEn StockRef:111829',
    18.94,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505399305art/motul/aceite-motul-ngen-5-10w40-4t-1l-434203_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505399305art/motul/aceite-motul-ngen-5-10w40-4t-1l-434203_800.webp', 0, true, 'Motul Aceite Motul Ngen 5 10w40 4t 1l');

END $$;

-- Product 30: Motul Aceite Motul Ngen 7 10w40 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 7 10w40 4t 1l',
    'Marca:MotulEn StockRef:111835',
    23.3,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505485642art/motul/aceite-motul-ngen-7-10w40-4t-1l-445793_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505485642art/motul/aceite-motul-ngen-7-10w40-4t-1l-445793_800.webp', 0, true, 'Motul Aceite Motul Ngen 7 10w40 4t 1l');

END $$;

-- Product 31: Motul Aceite Motul Ngen 5 10w40 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 5 10w40 4t 4l',
    'Marca:MotulEn StockRef:111830',
    64.08,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505399306art/motul/aceite-motul-ngen-5-10w40-4t-4l-434204_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505399306art/motul/aceite-motul-ngen-5-10w40-4t-4l-434204_800.webp', 0, true, 'Motul Aceite Motul Ngen 5 10w40 4t 4l');

END $$;

-- Product 32: Motorex Aceite Ktm Racing 20w60 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Ktm Racing 20w60 4t 1l',
    'Marca:MotorexEn StockRef:MT011H004T',
    30.19,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501797972art/motorex/aceite-ktm-racing-20w60-4t-1l-388238_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501797972art/motorex/aceite-ktm-racing-20w60-4t-1l-388238_800.webp', 0, true, 'Motorex Aceite Ktm Racing 20w60 4t 1l');

END $$;

-- Product 33: Repsol Aceite Repsol Moto V-Twin Custom 4t 20w50 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Repsol Moto V-Twin Custom 4t 20w50 1l',
    'Marca:RepsolEn StockRef:RPP2067THC',
    19.21,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029684art/repsol/aceite-repsol-moto-v-twin-custom-4t-20w50-1l-385680_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029684art/repsol/aceite-repsol-moto-v-twin-custom-4t-20w50-1l-385680_800.webp', 0, true, 'Repsol Aceite Repsol Moto V-Twin Custom 4t 20w50 1l');

END $$;

-- Product 34: Repsol Aceite Repsol Moto Sintetico 2t 125ml
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Repsol Moto Sintetico 2t 125ml',
    'Marca:RepsolEn StockRef:REP2TSINT125',
    2.63,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/503206946art/repsol/aceite-repsol-moto-sintetico-2t-125ml-497322_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/503206946art/repsol/aceite-repsol-moto-sintetico-2t-125ml-497322_800.webp', 0, true, 'Repsol Aceite Repsol Moto Sintetico 2t 125ml');

END $$;

-- Product 35: Motorex Aceite Motor 4t 4 Stroke 15w/50 1 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t 4 Stroke 15w/50 1 L.',
    'Marca:MotorexEn StockRef:MT049H004T',
    13.44,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503699993art/motorex/aceite-motor-4t-4-stroke-15w-50-1-l-498844_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503699993art/motorex/aceite-motor-4t-4-stroke-15w-50-1-l-498844_800.webp', 0, true, 'Motorex Aceite Motor 4t 4 Stroke 15w/50 1 L.');

END $$;

-- Product 36: Motorex Aceite Motor 4t Cross Power 4t 5w/40 1 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t Cross Power 4t 5w/40 1 L.',
    'Marca:MotorexEn StockRef:MT069H004T',
    24.98,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503699975art/motorex/aceite-motor-4t-cross-power-4t-5w-40-1-l-388390_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503699975art/motorex/aceite-motor-4t-cross-power-4t-5w-40-1-l-388390_800.webp', 0, true, 'Motorex Aceite Motor 4t Cross Power 4t 5w/40 1 L.');

END $$;

-- Product 37: Motul Aceite Motul 710 2t 125ml
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 710 2t 125ml',
    'Marca:MotulEn StockRef:104413',
    2.33,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502806550art/motul/aceite-motul-710-2t-125ml-430542_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502806550art/motul/aceite-motul-710-2t-125ml-430542_800.webp', 0, true, 'Motul Aceite Motul 710 2t 125ml');

END $$;

-- Product 38: Motul Aceite Motul 300v Factory Line  Road  Racing  15w50 . 4 Litros
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 300v Factory Line  Road  Racing  15w50 . 4 Litros',
    'Marca:MotulEn StockRef:104129',
    104.87,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898708art/motul/aceite-motul-300v-fl-road-racing-15w50-4l-533407_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898708art/motul/aceite-motul-300v-fl-road-racing-15w50-4l-533407_800.webp', 0, true, 'Motul Aceite Motul 300v Factory Line  Road  Racing  15w50 . 4 Litros');

END $$;

-- Product 39: Repsol Aceite Racing 4t 10w60 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Racing 4t 10w60 1l',
    'Marca:RepsolEn StockRef:RPP2000PHC',
    20.54,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029914art/repsol/aceite-racing-4t-10w60-1l-385678_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029914art/repsol/aceite-racing-4t-10w60-1l-385678_800.webp', 0, true, 'Repsol Aceite Racing 4t 10w60 1l');

END $$;

-- Product 40: Repsol Aceite Repsol Moto Matic Sintetico Mb 10w30 4t 20l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Repsol Moto Matic Sintetico Mb 10w30 4t 20l',
    'Marca:Repsol¡Últimas Unidades!Ref:RP182B16',
    241.74,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/504351004art/repsol/aceite-repsol-moto-matic-sintetico-mb-10w30-4t-20l-284229_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/504351004art/repsol/aceite-repsol-moto-matic-sintetico-mb-10w30-4t-20l-284229_800.webp', 0, true, 'Repsol Aceite Repsol Moto Matic Sintetico Mb 10w30 4t 20l');

END $$;

-- Product 41: Motorex Aceite Motorex Racing Pro 4t 10w40 Cross 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motorex Racing Pro 4t 10w40 Cross 4l',
    'Marca:MotorexEn StockRef:MT024I004T',
    86.66,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/504394331art/motorex/aceite-motorex-racing-pro-4t-10w40-cross-4l-388499_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/504394331art/motorex/aceite-motorex-racing-pro-4t-10w40-cross-4l-388499_800.webp', 0, true, 'Motorex Aceite Motorex Racing Pro 4t 10w40 Cross 4l');

END $$;

-- Product 42: Motul Aceite Motul 7100 10w60 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 10w60 4t 1l',
    'Marca:MotulEn StockRef:104100',
    23.3,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503198936art/motul/aceite-motul-7100-10w60-4t-1l-533393_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503198936art/motul/aceite-motul-7100-10w60-4t-1l-533393_800.webp', 0, true, 'Motul Aceite Motul 7100 10w60 4t 1l');

END $$;

-- Product 43: Repsol Rp Moto Town 4t 20w50 Cp-1
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Rp Moto Town 4t 20w50 Cp-1',
    'Marca:RepsolEn StockRef:RP169Q51',
    11.94,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/504706472art/repsol/rp-moto-town-4t-20w50-cp-1-397488_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/504706472art/repsol/rp-moto-town-4t-20w50-cp-1-397488_800.webp', 0, true, 'Repsol Rp Moto Town 4t 20w50 Cp-1');

END $$;

-- Product 44: Motul Aceite Motul 300v Fl Road Racing 5w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 300v Fl Road Racing 5w40 1l',
    'Marca:MotulEn StockRef:104112',
    29.12,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898595art/motul/aceite-motul-300v-fl-road-racing-5w40-1l-499528_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898595art/motul/aceite-motul-300v-fl-road-racing-5w40-1l-499528_800.webp', 0, true, 'Motul Aceite Motul 300v Fl Road Racing 5w40 1l');

END $$;

-- Product 45: Motul Aceite Motul Ngen 7 10w40 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 7 10w40 4t 4l',
    'Marca:MotulEn StockRef:111836',
    81.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505485643art/motul/aceite-motul-ngen-7-10w40-4t-4l-445794_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505485643art/motul/aceite-motul-ngen-7-10w40-4t-4l-445794_800.webp', 0, true, 'Motul Aceite Motul Ngen 7 10w40 4t 4l');

END $$;

-- Product 46: Motul Aceite Motul 7100 10w30 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 10w30 4t 1l',
    'Marca:MotulEn StockRef:104089',
    17.76,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898671art/motul/aceite-motul-7100-10w30-4t-1l-533384_800.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898671art/motul/aceite-motul-7100-10w30-4t-1l-533384_800.webp', 0, true, 'Motul Aceite Motul 7100 10w30 4t 1l');

END $$;

-- Product 47: Motul Aceite Motul 300v Fl Off Road 15w60 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 300v Fl Off Road 15w60 4l',
    '',
    104.87,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503641520art/motul/aceite-motul-300v-fl-off-road-15w60-4l-348149_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503641520art/motul/aceite-motul-300v-fl-off-road-15w60-4l-348149_320.webp', 0, true, 'Motul Aceite Motul 300v Fl Off Road 15w60 4l');

END $$;

-- Product 48: Motul Aceite Motul Multi Atf 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Multi Atf 1l',
    '',
    17.51,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503452230art/motul/aceite-motul-multi-atf-1l-533406_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503452230art/motul/aceite-motul-multi-atf-1l-533406_320.webp', 0, true, 'Motul Aceite Motul Multi Atf 1l');

END $$;

-- Product 49: Motul Aceite Motul 7100 20w50 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 20w50 4t 1l',
    '',
    23.3,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898730art/motul/aceite-motul-7100-20w50-4t-1l-533399_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898730art/motul/aceite-motul-7100-20w50-4t-1l-533399_320.webp', 0, true, 'Motul Aceite Motul 7100 20w50 4t 1l');

END $$;

-- Product 50: Motul Aceite Motul Ngen 5 10w30 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Ngen 5 10w30 4t 4l',
    '',
    64.08,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505399304art/motul/aceite-motul-ngen-5-10w30-4t-4l-434202_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505399304art/motul/aceite-motul-ngen-5-10w30-4t-4l-434202_320.webp', 0, true, 'Motul Aceite Motul Ngen 5 10w30 4t 4l');

END $$;

-- Product 51: Motul Aceite Motul 300v R.K.O 2376h 0w30 5l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 300v R.K.O 2376h 0w30 5l',
    '',
    160.2,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/504664236art/motul/aceite-motul-300v-r-k-o-2376h-0w30-5l-352282_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/504664236art/motul/aceite-motul-300v-r-k-o-2376h-0w30-5l-352282_320.webp', 0, true, 'Motul Aceite Motul 300v R.K.O 2376h 0w30 5l');

END $$;

-- Product 52: Repsol Aceite Repsol Moto Racing Off Road 4t 10w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Repsol Moto Racing Off Road 4t 10w40 1l',
    '',
    19.22,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029682art/repsol/aceite-repsol-moto-racing-off-road-4t-10w40-1l-385681_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029682art/repsol/aceite-repsol-moto-racing-off-road-4t-10w40-1l-385681_320.webp', 0, true, 'Repsol Aceite Repsol Moto Racing Off Road 4t 10w40 1l');

END $$;

-- Product 53: Repsol Aceite Repsol Smarter Commuter 0w30 60l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Repsol Smarter Commuter 0w30 60l',
    '',
    1105.38,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505056166art/repsol/aceite-repsol-smarter-commuter-0w30-60l-513627_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505056166art/repsol/aceite-repsol-smarter-commuter-0w30-60l-513627_320.webp', 0, true, 'Repsol Aceite Repsol Smarter Commuter 0w30 60l');

END $$;

-- Product 54: Motul Aceite Motul 5100 10w50 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 5100 10w50 4t 1l',
    '',
    18.94,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503239486art/motul/aceite-motul-5100-10w50-4t-1l-533417_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503239486art/motul/aceite-motul-5100-10w50-4t-1l-533417_320.webp', 0, true, 'Motul Aceite Motul 5100 10w50 4t 1l');

END $$;

-- Product 55: Motorex Aceite Ktm Racing 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Ktm Racing 4t 4l',
    '',
    118.07,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501797973art/motorex/aceite-ktm-racing-4t-4l-388256_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501797973art/motorex/aceite-ktm-racing-4t-4l-388256_320.webp', 0, true, 'Motorex Aceite Ktm Racing 4t 4l');

END $$;

-- Product 56: Motul Aceite Motul 300v Fl Road Racing 5w30 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 300v Fl Road Racing 5w30 1l',
    '',
    24.43,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898814art/motul/aceite-motul-300v-fl-road-racing-5w30-1l-299666_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898814art/motul/aceite-motul-300v-fl-road-racing-5w30-1l-299666_320.webp', 0, true, 'Motul Aceite Motul 300v Fl Road Racing 5w30 1l');

END $$;

-- Product 57: Motul Aceite Ngen Matic Atf Vi D38 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Ngen Matic Atf Vi D38 1l',
    '',
    14.65,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/505692061art/motul/aceite-ngen-matic-atf-vi-d38-1l-524375_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/505692061art/motul/aceite-ngen-matic-atf-vi-d38-1l-524375_320.webp', 0, true, 'Motul Aceite Ngen Matic Atf Vi D38 1l');

END $$;

-- Product 58: Motul Aceite Motul 7100 10w60 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 10w60 4t 4l',
    '',
    81.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503641512art/motul/aceite-motul-7100-10w60-4t-4l-533401_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503641512art/motul/aceite-motul-7100-10w60-4t-4l-533401_320.webp', 0, true, 'Motul Aceite Motul 7100 10w60 4t 4l');

END $$;

-- Product 59: Brp/bombardier atv Aceite 4 Tiempos Bombardier
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'BRP / Bombardier';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Brp/bombardier atv Aceite 4 Tiempos Bombardier',
    '',
    17.92,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/brp/bombardier atv/502895434art/brp-bombardier-atv/aceite-4-tiempos-bombardier-256818_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/brp/bombardier atv/502895434art/brp-bombardier-atv/aceite-4-tiempos-bombardier-256818_320.webp', 0, true, 'Brp/bombardier atv Aceite 4 Tiempos Bombardier');

END $$;

-- Product 60: Motorex Aceite Scooter Forza 4t 0w/30 1l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Scooter Forza 4t 0w/30 1l.',
    '',
    30.52,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/504706369art/motorex/aceite-scooter-forza-4t-0w-30-1l-388392_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/504706369art/motorex/aceite-scooter-forza-4t-0w-30-1l-388392_320.webp', 0, true, 'Motorex Aceite Scooter Forza 4t 0w/30 1l.');

END $$;

-- Product 61: Motul Aceite Motul Scooter Power 2t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Scooter Power 2t 1l',
    '',
    17.47,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898508art/motul/aceite-motul-scooter-power-2t-1l-533414_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898508art/motul/aceite-motul-scooter-power-2t-1l-533414_320.webp', 0, true, 'Motul Aceite Motul Scooter Power 2t 1l');

END $$;

-- Product 62: Motul Aceite Motul 7100 20w50 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 20w50 4t 4l',
    '',
    81.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898631art/motul/aceite-motul-7100-20w50-4t-4l-533395_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898631art/motul/aceite-motul-7100-20w50-4t-4l-533395_320.webp', 0, true, 'Motul Aceite Motul 7100 20w50 4t 4l');

END $$;

-- Product 63: Motul Aceite Motul 300v Off Road 15w60 1l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 300v Off Road 15w60 1l.',
    '',
    29.12,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503198935art/motul/aceite-motul-300v-off-road-15w60-1l-499529_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503198935art/motul/aceite-motul-300v-off-road-15w60-1l-499529_320.webp', 0, true, 'Motul Aceite Motul 300v Off Road 15w60 1l.');

END $$;

-- Product 64: Motul Aceite Motul Transoil Expert 10w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Transoil Expert 10w40 1l',
    '',
    15.84,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503796743art/motul/aceite-motul-transoil-expert-10w40-1l-533388_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503796743art/motul/aceite-motul-transoil-expert-10w40-1l-533388_320.webp', 0, true, 'Motul Aceite Motul Transoil Expert 10w40 1l');

END $$;

-- Product 65: Motul Aceite Motul 5100 10w30 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 5100 10w30 4t 1l',
    '',
    18.94,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503239484art/motul/aceite-motul-5100-10w30-4t-1l-533390_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503239484art/motul/aceite-motul-5100-10w30-4t-1l-533390_320.webp', 0, true, 'Motul Aceite Motul 5100 10w30 4t 1l');

END $$;

-- Product 66: Motul Aceite Motul 800 2t Fl Racing 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 800 2t Fl Racing 1l',
    '',
    32.04,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502897979art/motul/aceite-motul-800-2t-fl-road-racing-1l-498729_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502897979art/motul/aceite-motul-800-2t-fl-road-racing-1l-498729_320.webp', 0, true, 'Motul Aceite Motul 800 2t Fl Racing 1l');

END $$;

-- Product 67: Motul Aceite Motul 7100 10w40 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 10w40 4t 1l',
    '',
    23.3,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898499art/motul/aceite-motul-7100-10w40-4t-1l-522272_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898499art/motul/aceite-motul-7100-10w40-4t-1l-522272_320.webp', 0, true, 'Motul Aceite Motul 7100 10w40 4t 1l');

END $$;

-- Product 68: Motul Aceite Motul 5100 15w50 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 5100 15w50 4t 1l',
    '',
    18.94,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503239487art/motul/aceite-motul-5100-15w50-4t-1l-533389_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503239487art/motul/aceite-motul-5100-15w50-4t-1l-533389_320.webp', 0, true, 'Motul Aceite Motul 5100 15w50 4t 1l');

END $$;

-- Product 69: Motorex Aceite Atv-Quad Racing 4t 10w50 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Atv-Quad Racing 4t 10w50 1l',
    '',
    22.33,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501797951art/motorex/aceite-atv-quad-racing-4t-10w50-1l-387135_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501797951art/motorex/aceite-atv-quad-racing-4t-10w50-1l-387135_320.webp', 0, true, 'Motorex Aceite Atv-Quad Racing 4t 10w50 1l');

END $$;

-- Product 70: Motorex Aceite Motor Formula 4t 10w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Formula 4t 10w40 1l',
    '',
    16.06,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190126art/motorex/aceite-motor-formula-4t-10w40-1l-387134_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190126art/motorex/aceite-motor-formula-4t-10w40-1l-387134_320.webp', 0, true, 'Motorex Aceite Motor Formula 4t 10w40 1l');

END $$;

-- Product 71: Repsol Rp Moto Sintetico 4t 10w40 4l Prom Qr
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Rp Moto Sintetico 4t 10w40 4l Prom Qr',
    '',
    57.47,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505078729art/repsol/rp-moto-sintetico-4t-10w40-4l-prom-qr-399158_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505078729art/repsol/rp-moto-sintetico-4t-10w40-4l-prom-qr-399158_320.webp', 0, true, 'Repsol Rp Moto Sintetico 4t 10w40 4l Prom Qr');

END $$;

-- Product 72: Motul Aceite Motul Scooter Expert 2t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Scooter Expert 2t 1l',
    '',
    11.64,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898551art/motul/aceite-motul-scooter-expert-2t-1l-533416_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898551art/motul/aceite-motul-scooter-expert-2t-1l-533416_320.webp', 0, true, 'Motul Aceite Motul Scooter Expert 2t 1l');

END $$;

-- Product 73: Motul Aceite Motul Multi Cvtf 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Multi Cvtf 1l',
    '',
    19.34,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503452228art/motul/aceite-motul-multi-cvtf-1l-348501_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503452228art/motul/aceite-motul-multi-cvtf-1l-348501_320.webp', 0, true, 'Motul Aceite Motul Multi Cvtf 1l');

END $$;

-- Product 74: Motul Aceite Motul Transoil 10w30 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Transoil 10w30 1l',
    '',
    13.2,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503239497art/motul/aceite-motul-transoil-10w30-1l-533391_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503239497art/motul/aceite-motul-transoil-10w30-1l-533391_320.webp', 0, true, 'Motul Aceite Motul Transoil 10w30 1l');

END $$;

-- Product 75: Motul Aceite Motul 300v Fl Road Racing 10w40 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 300v Fl Road Racing 10w40 4l',
    '',
    104.87,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898591art/motul/aceite-motul-300v-fl-road-racing-10w40-4l-348140_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898591art/motul/aceite-motul-300v-fl-road-racing-10w40-4l-348140_320.webp', 0, true, 'Motul Aceite Motul 300v Fl Road Racing 10w40 4l');

END $$;

-- Product 76: Motorex Aceite Motor 4t Cross Power 4t 5w/40 4 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t Cross Power 4t 5w/40 4 L.',
    '',
    94.02,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503699976art/motorex/aceite-motor-4t-cross-power-4t-5w-40-4-l-388376_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503699976art/motorex/aceite-motor-4t-cross-power-4t-5w-40-4-l-388376_320.webp', 0, true, 'Motorex Aceite Motor 4t Cross Power 4t 5w/40 4 L.');

END $$;

-- Product 77: Motul Aceite Motul 5000 10w40 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 5000 10w40 4t 1l',
    '',
    14.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503239488art/motul/aceite-motul-5000-10w40-4t-1l-533409_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503239488art/motul/aceite-motul-5000-10w40-4t-1l-533409_320.webp', 0, true, 'Motul Aceite Motul 5000 10w40 4t 1l');

END $$;

-- Product 78: Motorex Aceite Motor 4t 4 Stroke 10w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t 4 Stroke 10w40 1l',
    '',
    13.8,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503686757art/motorex/aceite-motor-4t-4-stroke-10w40-1l-498521_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503686757art/motorex/aceite-motor-4t-4-stroke-10w40-1l-498521_320.webp', 0, true, 'Motorex Aceite Motor 4t 4 Stroke 10w40 1l');

END $$;

-- Product 79: Repsol Aceite Racing 4t 10w40 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Racing 4t 10w40 4l',
    '',
    71.68,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029911art/repsol/aceite-racing-4t-10w40-4l-385643_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029911art/repsol/aceite-racing-4t-10w40-4l-385643_320.webp', 0, true, 'Repsol Aceite Racing 4t 10w40 4l');

END $$;

-- Product 80: Motul Aceite Motul 7100 5w40 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 5w40 4t 1l',
    '',
    23.3,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503641504art/motul/aceite-motul-7100-5w40-4t-1l-533403_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503641504art/motul/aceite-motul-7100-5w40-4t-1l-533403_320.webp', 0, true, 'Motul Aceite Motul 7100 5w40 4t 1l');

END $$;

-- Product 81: Motul Aceite Motul 7100 5w40 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 5w40 4t 4l',
    '',
    81.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503641505art/motul/aceite-motul-7100-5w40-4t-4l-533398_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503641505art/motul/aceite-motul-7100-5w40-4t-4l-533398_320.webp', 0, true, 'Motul Aceite Motul 7100 5w40 4t 4l');

END $$;

-- Product 82: Motul Aceite Motul 800 2t Fl Off Road 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 800 2t Fl Off Road 1l',
    '',
    32.04,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898687art/motul/aceite-motul-800-2t-fl-off-road-1l-498741_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898687art/motul/aceite-motul-800-2t-fl-off-road-1l-498741_320.webp', 0, true, 'Motul Aceite Motul 800 2t Fl Off Road 1l');

END $$;

-- Product 83: Motul Aceite Motul 510 2t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 510 2t 1l',
    '',
    11.64,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503239491art/motul/aceite-motul-510-2t-1l-533379_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503239491art/motul/aceite-motul-510-2t-1l-533379_320.webp', 0, true, 'Motul Aceite Motul 510 2t 1l');

END $$;

-- Product 84: Motul Aceite Motul Scooter Power 4t 5w40 Ma 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Scooter Power 4t 5w40 Ma 1l',
    '',
    17.47,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503796728art/motul/aceite-motul-scooter-power-4t-5w40-ma-1l-533383_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503796728art/motul/aceite-motul-scooter-power-4t-5w40-ma-1l-533383_320.webp', 0, true, 'Motul Aceite Motul Scooter Power 4t 5w40 Ma 1l');

END $$;

-- Product 85: Motul Aceite Motul 7100 15w50 4t 4l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 15w50 4t 4l.',
    '',
    81.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503641525art/motul/aceite-motul-7100-15w50-4t-4l-533402_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503641525art/motul/aceite-motul-7100-15w50-4t-4l-533402_320.webp', 0, true, 'Motul Aceite Motul 7100 15w50 4t 4l.');

END $$;

-- Product 86: Motul Aceite Motul Scooter Power 4t 10w30 Mb 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Scooter Power 4t 10w30 Mb 1l',
    '',
    17.47,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503796800art/motul/aceite-motul-scooter-power-4t-10w30-mb-1l-533380_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503796800art/motul/aceite-motul-scooter-power-4t-10w30-mb-1l-533380_320.webp', 0, true, 'Motul Aceite Motul Scooter Power 4t 10w30 Mb 1l');

END $$;

-- Product 87: Motul Aceite Motul 7100 10w30 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 10w30 4t 4l',
    '',
    81.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503641507art/motul/aceite-motul-7100-10w30-4t-4l-498156_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503641507art/motul/aceite-motul-7100-10w30-4t-4l-498156_320.webp', 0, true, 'Motul Aceite Motul 7100 10w30 4t 4l');

END $$;

-- Product 88: Motul Aceite Motul Scooter Expert 4t 10w40 Ma 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Scooter Expert 4t 10w40 Ma 1l',
    '',
    16.02,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503796734art/motul/aceite-motul-scooter-expert-4t-10w40-ma-1l-533385_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503796734art/motul/aceite-motul-scooter-expert-4t-10w40-ma-1l-533385_320.webp', 0, true, 'Motul Aceite Motul Scooter Expert 4t 10w40 Ma 1l');

END $$;

-- Product 89: Motul Aceite Motul 5100 10w30 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 5100 10w30 4t 4l',
    '',
    64.08,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898661art/motul/aceite-motul-5100-10w30-4t-4l-533411_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898661art/motul/aceite-motul-5100-10w30-4t-4l-533411_320.webp', 0, true, 'Motul Aceite Motul 5100 10w30 4t 4l');

END $$;

-- Product 90: Motul Aceite Motul 5100 10w40 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 5100 10w40 4t 1l',
    '',
    18.94,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503239485art/motul/aceite-motul-5100-10w40-4t-1l-533377_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503239485art/motul/aceite-motul-5100-10w40-4t-1l-533377_320.webp', 0, true, 'Motul Aceite Motul 5100 10w40 4t 1l');

END $$;

-- Product 91: Motul Aceite Motul 5100 10w40 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 5100 10w40 4t 4l',
    '',
    64.08,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/502898652art/motul/aceite-motul-5100-10w40-4t-4l-533397_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/502898652art/motul/aceite-motul-5100-10w40-4t-4l-533397_320.webp', 0, true, 'Motul Aceite Motul 5100 10w40 4t 4l');

END $$;

-- Product 92: Repsol Aceite Transmision Qualifier Transmission 10w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Aceite de transmisión';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Transmision Qualifier Transmission 10w40 1l',
    '',
    18.8,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029948art/repsol/aceite-transmision-qualifier-transmission-10w40-1l-398609_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029948art/repsol/aceite-transmision-qualifier-transmission-10w40-1l-398609_320.webp', 0, true, 'Repsol Aceite Transmision Qualifier Transmission 10w40 1l');

END $$;

-- Product 93: Motul Aceite Motul Atf 236.14 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul Atf 236.14 1l',
    '',
    28.34,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503641484art/motul/aceite-motul-atf-236-14-1l-348509_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503641484art/motul/aceite-motul-atf-236-14-1l-348509_320.webp', 0, true, 'Motul Aceite Motul Atf 236.14 1l');

END $$;

-- Product 94: Motorex Aceite Motor 4t 4 Stroke 15w/50 4 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t 4 Stroke 15w/50 4 L.',
    '',
    52.26,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503699994art/motorex/aceite-motor-4t-4-stroke-15w-50-4-l-498522_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503699994art/motorex/aceite-motor-4t-4-stroke-15w-50-4-l-498522_320.webp', 0, true, 'Motorex Aceite Motor 4t 4 Stroke 15w/50 4 L.');

END $$;

-- Product 95: Repsol Aceite Racing 4t 10w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Racing 4t 10w40 1l',
    '',
    19.22,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029910art/repsol/aceite-racing-4t-10w40-1l-385642_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029910art/repsol/aceite-racing-4t-10w40-1l-385642_320.webp', 0, true, 'Repsol Aceite Racing 4t 10w40 1l');

END $$;

-- Product 96: Motorex Aceite Motor 4t 4 Stroke 10w/40 4 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t 4 Stroke 10w/40 4 L.',
    '',
    52.26,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503699991art/motorex/aceite-motor-4t-4-stroke-10w-40-4-l-498777_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503699991art/motorex/aceite-motor-4t-4-stroke-10w-40-4-l-498777_320.webp', 0, true, 'Motorex Aceite Motor 4t 4 Stroke 10w/40 4 L.');

END $$;

-- Product 97: Repsol Aceite Repsol Moto Racing 4t 15w50 60l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Repsol Moto Racing 4t 15w50 60l',
    '',
    983.22,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029681art/repsol/aceite-repsol-moto-racing-4t-15w50-60l-398460_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029681art/repsol/aceite-repsol-moto-racing-4t-15w50-60l-398460_320.webp', 0, true, 'Repsol Aceite Repsol Moto Racing 4t 15w50 60l');

END $$;

-- Product 98: Repsol Aceite Smarter Sport 4t 15w50 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Smarter Sport 4t 15w50 1l',
    '',
    15.44,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029924art/repsol/aceite-smarter-sport-4t-15w50-1l-385799_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029924art/repsol/aceite-smarter-sport-4t-15w50-1l-385799_320.webp', 0, true, 'Repsol Aceite Smarter Sport 4t 15w50 1l');

END $$;

-- Product 99: Motorex Aceite Motor 4t Boxer 4t 15w/50 1 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t Boxer 4t 15w/50 1 L.',
    '',
    19.52,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503699970art/motorex/aceite-motor-4t-boxer-4t-15w-50-1-l-388237_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503699970art/motorex/aceite-motor-4t-boxer-4t-15w-50-1-l-388237_320.webp', 0, true, 'Motorex Aceite Motor 4t Boxer 4t 15w/50 1 L.');

END $$;

-- Product 100: Repsol Aceite Smarter Synthetic 2t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Smarter Synthetic 2t 1l',
    '',
    20.28,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029939art/repsol/aceite-smarter-synthetic-2t-1l-385929_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029939art/repsol/aceite-smarter-synthetic-2t-1l-385929_320.webp', 0, true, 'Repsol Aceite Smarter Synthetic 2t 1l');

END $$;

-- Product 101: Motorex Aceite Cambio Scooter Zx 80w90  130ml.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Cambio Scooter Zx 80w90  130ml.',
    '',
    11.46,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190155art/motorex/aceite-cambio-scooter-zx-80w90-130ml-498575_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190155art/motorex/aceite-cambio-scooter-zx-80w90-130ml-498575_320.webp', 0, true, 'Motorex Aceite Cambio Scooter Zx 80w90  130ml.');

END $$;

-- Product 102: Repsol Aceite Repsol Moto Hmeoc 4t 10w30 Cp-4 4l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Repsol Moto Hmeoc 4t 10w30 Cp-4 4l.',
    '',
    69.68,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/504991118art/repsol/aceite-repsol-moto-hmeoc-4t-10w30-cp-4-4l-378418_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/504991118art/repsol/aceite-repsol-moto-hmeoc-4t-10w30-cp-4-4l-378418_320.webp', 0, true, 'Repsol Aceite Repsol Moto Hmeoc 4t 10w30 Cp-4 4l.');

END $$;

-- Product 103: Repsol Aceite Racing 4t 10w50 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Racing 4t 10w50 1l',
    '',
    19.88,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029912art/repsol/aceite-racing-4t-10w50-1l-385644_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029912art/repsol/aceite-racing-4t-10w50-1l-385644_320.webp', 0, true, 'Repsol Aceite Racing 4t 10w50 1l');

END $$;

-- Product 104: Repsol Aceite Racing Atv 4t 10w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Aceite Racing Atv 4t 10w40 1l',
    '',
    19.54,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029915art/repsol/aceite-racing-atv-4t-10w40-1l-385696_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029915art/repsol/aceite-racing-atv-4t-10w40-1l-385696_320.webp', 0, true, 'Repsol Aceite Racing Atv 4t 10w40 1l');

END $$;

-- Product 105: Repsol Rp Moto Scooter Mb 4t 10w-40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Rp Moto Scooter Mb 4t 10w-40 1l',
    '',
    17.08,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/505029876art/repsol/rp-moto-scooter-mb-4t-10w-40-1l-385710_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/505029876art/repsol/rp-moto-scooter-mb-4t-10w-40-1l-385710_320.webp', 0, true, 'Repsol Rp Moto Scooter Mb 4t 10w-40 1l');

END $$;

-- Product 106: Repsol Rp Moto Town 2t B-20
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Repsol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Repsol Rp Moto Town 2t B-20',
    '',
    212.48,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/repsol/503209027art/repsol/rp-moto-town-2t-b-20-70743_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/repsol/503209027art/repsol/rp-moto-town-2t-b-20-70743_320.webp', 0, true, 'Repsol Rp Moto Town 2t B-20');

END $$;

-- Product 107: Motorex Aceite Cross Power 4t 10w/60 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Cross Power 4t 10w/60 1l',
    '',
    24.98,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/502862999art/motorex/aceite-cross-power-4t-10w-60-1l-380302_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/502862999art/motorex/aceite-cross-power-4t-10w-60-1l-380302_320.webp', 0, true, 'Motorex Aceite Cross Power 4t 10w/60 1l');

END $$;

-- Product 108: Motorex Aceite Motor 4t Boxer 4t 5w40 4 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t Boxer 4t 5w40 4 L.',
    '',
    73.08,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503699966art/motorex/aceite-motor-4t-boxer-4t-5w40-4-l-498548_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503699966art/motorex/aceite-motor-4t-boxer-4t-5w40-4-l-498548_320.webp', 0, true, 'Motorex Aceite Motor 4t Boxer 4t 5w40 4 L.');

END $$;

-- Product 109: Motul Aceite Motul 7100 10w50 4t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 10w50 4t 4l',
    '',
    81.58,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503641510art/motul/aceite-motul-7100-10w50-4t-4l-536008_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503641510art/motul/aceite-motul-7100-10w50-4t-4l-536008_320.webp', 0, true, 'Motul Aceite Motul 7100 10w50 4t 4l');

END $$;

-- Product 110: Castrol Aceite Castrol Power 1 Ultimate 2t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Castrol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Castrol Aceite Castrol Power 1 Ultimate 2t 1l',
    '',
    18.53,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/castrol/505636177art/castrol/aceite-castrol-power-1-ultimate-2t-1l-530854_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/castrol/505636177art/castrol/aceite-castrol-power-1-ultimate-2t-1l-530854_320.webp', 0, true, 'Castrol Aceite Castrol Power 1 Ultimate 2t 1l');

END $$;

-- Product 111: Motul Aceite Motul 7100 10w50 4t 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motul';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motul Aceite Motul 7100 10w50 4t 1l',
    '',
    23.3,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motul/503641509art/motul/aceite-motul-7100-10w50-4t-1l-533387_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motul/503641509art/motul/aceite-motul-7100-10w50-4t-1l-533387_320.webp', 0, true, 'Motul Aceite Motul 7100 10w50 4t 1l');

END $$;

-- Product 112: Motorex Aceite Motor Formula 4t 15w50 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Formula 4t 15w50 1l',
    '',
    16.96,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190131art/motorex/aceite-motor-formula-4t-15w50-1l-357295_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190131art/motorex/aceite-motor-formula-4t-15w50-1l-357295_320.webp', 0, true, 'Motorex Aceite Motor Formula 4t 15w50 1l');

END $$;

-- Product 113: Motorex Aceite Motor Top Speed Mc 4t 10w40 1l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Top Speed Mc 4t 10w40 1l.',
    '',
    19.42,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190116art/motorex/aceite-motor-top-speed-mc-4t-10w40-1l-387133_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190116art/motorex/aceite-motor-top-speed-mc-4t-10w40-1l-387133_320.webp', 0, true, 'Motorex Aceite Motor Top Speed Mc 4t 10w40 1l.');

END $$;

-- Product 114: Motorex Aceite Motor Top Speed Mc 4t 10w40 4l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Top Speed Mc 4t 10w40 4l.',
    '',
    69.85,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190117art/motorex/aceite-motor-top-speed-mc-4t-10w40-4l-239139_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190117art/motorex/aceite-motor-top-speed-mc-4t-10w40-4l-239139_320.webp', 0, true, 'Motorex Aceite Motor Top Speed Mc 4t 10w40 4l.');

END $$;

-- Product 115: Motorex Aceite Motor Power Synt 4t 10w60 1l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Power Synt 4t 10w60 1l.',
    '',
    24.67,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190111art/motorex/aceite-motor-power-synt-4t-10w60-1l-387132_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190111art/motorex/aceite-motor-power-synt-4t-10w60-1l-387132_320.webp', 0, true, 'Motorex Aceite Motor Power Synt 4t 10w60 1l.');

END $$;

-- Product 116: Motorex Aceite Motor Power Synt 4t 5w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Power Synt 4t 5w40 1l',
    '',
    23.86,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190101art/motorex/aceite-motor-power-synt-4t-5w40-1l-387180_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190101art/motorex/aceite-motor-power-synt-4t-5w40-1l-387180_320.webp', 0, true, 'Motorex Aceite Motor Power Synt 4t 5w40 1l');

END $$;

-- Product 117: Motorex Aceite Cross Power 4t 10w/60 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Cross Power 4t 10w/60 4l',
    '',
    94.02,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/502863000art/motorex/aceite-cross-power-4t-10w-60-4l-356921_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/502863000art/motorex/aceite-cross-power-4t-10w-60-4l-356921_320.webp', 0, true, 'Motorex Aceite Cross Power 4t 10w/60 4l');

END $$;

-- Product 118: Motorex Aceite Motorex Power Synt 4t 10w50 20l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motorex Power Synt 4t 10w50 20l',
    '',
    440.64,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/504394333art/motorex/aceite-motorex-power-synt-4t-10w50-20l-388494_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/504394333art/motorex/aceite-motorex-power-synt-4t-10w50-20l-388494_320.webp', 0, true, 'Motorex Aceite Motorex Power Synt 4t 10w50 20l');

END $$;

-- Product 119: Motorex Aceite Motor Formula 4t 15w50 4l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Formula 4t 15w50 4l.',
    '',
    62.06,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190132art/motorex/aceite-motor-formula-4t-15w50-4l-357296_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190132art/motorex/aceite-motor-formula-4t-15w50-4l-357296_320.webp', 0, true, 'Motorex Aceite Motor Formula 4t 15w50 4l.');

END $$;

-- Product 120: Motorex Aceite Motor Top Speed Mc 4t 15w50 4l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Top Speed Mc 4t 15w50 4l.',
    '',
    71.93,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190122art/motorex/aceite-motor-top-speed-mc-4t-15w50-4l-388217_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190122art/motorex/aceite-motor-top-speed-mc-4t-15w50-4l-388217_320.webp', 0, true, 'Motorex Aceite Motor Top Speed Mc 4t 15w50 4l.');

END $$;

-- Product 121: Motorex Aceite Cambio Racing Gear Oil  10w/40 1 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Cambio Racing Gear Oil  10w/40 1 L.',
    '',
    25.63,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503699999art/motorex/aceite-cambio-racing-gear-oil-10w-40-1-l-388232_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503699999art/motorex/aceite-cambio-racing-gear-oil-10w-40-1-l-388232_320.webp', 0, true, 'Motorex Aceite Cambio Racing Gear Oil  10w/40 1 L.');

END $$;

-- Product 122: Motorex Aceite Motor Power Synt 4t 10w60 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Power Synt 4t 10w60 4l',
    '',
    92.78,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190112art/motorex/aceite-motor-power-synt-4t-10w60-4l-356919_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190112art/motorex/aceite-motor-power-synt-4t-10w60-4l-356919_320.webp', 0, true, 'Motorex Aceite Motor Power Synt 4t 10w60 4l');

END $$;

-- Product 123: Motorex Aceite Mezcla Cross Power 2t 1l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Mezcla Cross Power 2t 1l.',
    '',
    25.94,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190066art/motorex/aceite-mezcla-cross-power-2t-1l-430568_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190066art/motorex/aceite-mezcla-cross-power-2t-1l-430568_320.webp', 0, true, 'Motorex Aceite Mezcla Cross Power 2t 1l.');

END $$;

-- Product 124: Motorex Aceite Motor 4t Boxer 4t 15w/50 4 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t Boxer 4t 15w/50 4 L.',
    '',
    67.5,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503699971art/motorex/aceite-motor-4t-boxer-4t-15w-50-4-l-356920_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503699971art/motorex/aceite-motor-4t-boxer-4t-15w-50-4-l-356920_320.webp', 0, true, 'Motorex Aceite Motor 4t Boxer 4t 15w/50 4 L.');

END $$;

-- Product 125: Motorex Aceite Motor Power Synt 4t 5w40 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Power Synt 4t 5w40 4l',
    '',
    89.57,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190102art/motorex/aceite-motor-power-synt-4t-5w40-4l-388254_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190102art/motorex/aceite-motor-power-synt-4t-5w40-4l-388254_320.webp', 0, true, 'Motorex Aceite Motor Power Synt 4t 5w40 4l');

END $$;

-- Product 126: Motorex Aceite Motor Formula 4t 10w40 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Formula 4t 10w40 4l',
    '',
    58.63,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190127art/motorex/aceite-motor-formula-4t-10w40-4l-387136_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190127art/motorex/aceite-motor-formula-4t-10w40-4l-387136_320.webp', 0, true, 'Motorex Aceite Motor Formula 4t 10w40 4l');

END $$;

-- Product 127: Motorex Aceite Cross Power 4t Fs 10w/50 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Cross Power 4t Fs 10w/50 1l',
    '',
    24.98,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501442464art/motorex/aceite-cross-power-4t-fs-10w-50-1l-392864_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501442464art/motorex/aceite-cross-power-4t-fs-10w-50-1l-392864_320.webp', 0, true, 'Motorex Aceite Cross Power 4t Fs 10w/50 1l');

END $$;

-- Product 128: Motorex Aceite Cambio Gear Oil Sint. 10w30 1l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Cambio Gear Oil Sint. 10w30 1l.',
    '',
    18.67,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190146art/motorex/aceite-cambio-gear-oil-sint-10w30-1l-357207_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190146art/motorex/aceite-cambio-gear-oil-sint-10w30-1l-357207_320.webp', 0, true, 'Motorex Aceite Cambio Gear Oil Sint. 10w30 1l.');

END $$;

-- Product 129: Motorex Aceite Motor Top Speed Mc 4t 15w50 1l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Top Speed Mc 4t 15w50 1l.',
    '',
    19.39,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190121art/motorex/aceite-motor-top-speed-mc-4t-15w50-1l-418500_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190121art/motorex/aceite-motor-top-speed-mc-4t-15w50-1l-418500_320.webp', 0, true, 'Motorex Aceite Motor Top Speed Mc 4t 15w50 1l.');

END $$;

-- Product 130: Castrol Aceite Castrol Power 1 Ultimate 2t 125mm
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Castrol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Castrol Aceite Castrol Power 1 Ultimate 2t 125mm',
    '',
    3.48,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/castrol/505676707art/castrol/aceite-castrol-power-1-ultimate-2t-125mm-507381_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/castrol/505676707art/castrol/aceite-castrol-power-1-ultimate-2t-125mm-507381_320.webp', 0, true, 'Castrol Aceite Castrol Power 1 Ultimate 2t 125mm');

END $$;

-- Product 131: Motorex Lubricante Wet Lube 300ml
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Lubricante Wet Lube 300ml',
    '',
    10.02,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/502863016art/motorex/lubricante-wet-lube-300ml-41386_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/502863016art/motorex/lubricante-wet-lube-300ml-41386_320.webp', 0, true, 'Motorex Lubricante Wet Lube 300ml');

END $$;

-- Product 132: Castrol Aceite Castrol Power 1 Ultimate 4t 5w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Castrol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Castrol Aceite Castrol Power 1 Ultimate 4t 5w40 1l',
    '',
    20.21,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/castrol/505697092art/castrol/aceite-castrol-power-1-ultimate-4t-5w40-1l-524197_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/castrol/505697092art/castrol/aceite-castrol-power-1-ultimate-4t-5w40-1l-524197_320.webp', 0, true, 'Castrol Aceite Castrol Power 1 Ultimate 4t 5w40 1l');

END $$;

-- Product 133: Motorex Aceite Motor 4t Racing Pro 4t 0w/40 4 L.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor 4t Racing Pro 4t 0w/40 4 L.',
    '',
    136.19,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/503700017art/motorex/aceite-motor-4t-racing-pro-4t-0w-40-4-l-388500_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/503700017art/motorex/aceite-motor-4t-racing-pro-4t-0w-40-4-l-388500_320.webp', 0, true, 'Motorex Aceite Motor 4t Racing Pro 4t 0w/40 4 L.');

END $$;

-- Product 134: Motorex Aceite Mezcla Cross Power 2t 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 2T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Mezcla Cross Power 2t 4l',
    '',
    96.01,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190067art/motorex/aceite-mezcla-cross-power-2t-4l-498806_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190067art/motorex/aceite-mezcla-cross-power-2t-4l-498806_320.webp', 0, true, 'Motorex Aceite Mezcla Cross Power 2t 4l');

END $$;

-- Product 135: Motorex Aceite Cross Power 4t Fs 10w/50 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Cross Power 4t Fs 10w/50 4l',
    '',
    94.02,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501442465art/motorex/aceite-cross-power-4t-fs-10w-50-4l-296884_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501442465art/motorex/aceite-cross-power-4t-fs-10w-50-4l-296884_320.webp', 0, true, 'Motorex Aceite Cross Power 4t Fs 10w/50 4l');

END $$;

-- Product 136: Motorex Aceite Motor Oil 4- Stroke 10w/40 58l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motor Oil 4- Stroke 10w/40 58l.',
    '',
    574.0,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/502863010art/motorex/aceite-motor-oil-4-stroke-10w-40-58l-41618_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/502863010art/motorex/aceite-motor-oil-4-stroke-10w-40-58l-41618_320.webp', 0, true, 'Motorex Aceite Motor Oil 4- Stroke 10w/40 58l.');

END $$;

-- Product 137: Motorex Aceite Cambio Gear Oil Hypoid  80w90 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Cambio Gear Oil Hypoid  80w90 1l',
    '',
    19.96,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/501190151art/motorex/aceite-cambio-gear-oil-hypoid-80w90-1l-354369_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/501190151art/motorex/aceite-cambio-gear-oil-hypoid-80w90-1l-354369_320.webp', 0, true, 'Motorex Aceite Cambio Gear Oil Hypoid  80w90 1l');

END $$;

-- Product 138: Motorex Aceite Motorex Racing Pro 4t 5w30 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Motorex';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Motorex Aceite Motorex Racing Pro 4t 5w30 1l',
    '',
    33.4,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/motorex/504400050art/motorex/aceite-motorex-racing-pro-4t-5w30-1l-304661_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/motorex/504400050art/motorex/aceite-motorex-racing-pro-4t-5w30-1l-304661_320.webp', 0, true, 'Motorex Aceite Motorex Racing Pro 4t 5w30 1l');

END $$;

-- Product 139: Castrol Aceite Castrol Power 1 Ultimate 4t 10w50 4l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Castrol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Castrol Aceite Castrol Power 1 Ultimate 4t 10w50 4l',
    '',
    52.27,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/castrol/505697096art/castrol/aceite-castrol-power-1-ultimate-4t-10w50-4l-521712_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/castrol/505697096art/castrol/aceite-castrol-power-1-ultimate-4t-10w50-4l-521712_320.webp', 0, true, 'Castrol Aceite Castrol Power 1 Ultimate 4t 10w50 4l');

END $$;

-- Product 140: Castrol Aceite Castrol Power 1 Scooter 4t 0w30 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Castrol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Castrol Aceite Castrol Power 1 Scooter 4t 0w30 1l',
    '',
    21.52,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/castrol/505636835art/castrol/aceite-castrol-power-1-scooter-4t-0w30-1l-497271_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/castrol/505636835art/castrol/aceite-castrol-power-1-scooter-4t-0w30-1l-497271_320.webp', 0, true, 'Castrol Aceite Castrol Power 1 Scooter 4t 0w30 1l');

END $$;

-- Product 141: Castrol Aceite Castrol Power 1 4t 10w40 1l
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Castrol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Castrol Aceite Castrol Power 1 4t 10w40 1l',
    '',
    15.47,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/castrol/505636387art/castrol/aceite-castrol-power-1-4t-10w40-1l-497296_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/castrol/505636387art/castrol/aceite-castrol-power-1-4t-10w40-1l-497296_320.webp', 0, true, 'Castrol Aceite Castrol Power 1 4t 10w40 1l');

END $$;

-- Product 142: Brp/bombardier atv Aceite Brp Sintético 5w40 Blend 1 L
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'BRP / Bombardier';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Brp/bombardier atv Aceite Brp Sintético 5w40 Blend 1 L',
    '',
    29.26,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/brp/bombardier atv/504489558art/brp-bombardier-atv/aceite-brp-sintetico-5w40-blend-1-l-430541_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/brp/bombardier atv/504489558art/brp-bombardier-atv/aceite-brp-sintetico-5w40-blend-1-l-430541_320.webp', 0, true, 'Brp/bombardier atv Aceite Brp Sintético 5w40 Blend 1 L');

END $$;

-- Product 143: Castrol Aceite Castrol Power 1 4t 15w50 1l.
DO $$
DECLARE
  v_product_id uuid;
  v_brand_id integer;
  v_subcategory_id integer;
BEGIN
  SELECT id INTO v_brand_id FROM brands WHERE name = 'Castrol';
  SELECT id INTO v_subcategory_id FROM subcategories WHERE name = 'Motores 4T';

  INSERT INTO products (name, description, price, category_id, subcategory_id, brand_id, stock, is_published, images)
  VALUES (
    'Castrol Aceite Castrol Power 1 4t 15w50 1l.',
    '',
    16.73,
    3,
    v_subcategory_id,
    v_brand_id,
    0,
    true,
    jsonb_build_array('https://estaticos.elmotorista.es/prod_images/castrol/503446100art/castrol/aceite-castrol-power-1-4t-15w50-1l-269234_320.webp')
  )
  RETURNING product_id INTO v_product_id;

  INSERT INTO product_variants (product_id, size, color_id, stock)
  VALUES (v_product_id, 'Unitario', null, 0);

  INSERT INTO product_images (product_id, image_url, orden, is_main, alt_text)
  VALUES (v_product_id, 'https://estaticos.elmotorista.es/prod_images/castrol/503446100art/castrol/aceite-castrol-power-1-4t-15w50-1l-269234_320.webp', 0, true, 'Castrol Aceite Castrol Power 1 4t 15w50 1l.');

END $$;


-- Total: 143 productos importados