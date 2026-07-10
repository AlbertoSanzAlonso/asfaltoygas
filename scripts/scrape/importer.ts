import type { SupabaseClient } from '@supabase/supabase-js';
import type { ImportOptions, ImportResult, ScrapedProduct } from './types.js';
import {
  buildDbVariants,
  getServiceSupabase,
  productExistsByName,
  uploadImagesToStorage,
  resolveColorId,
} from './images.js';
import { slugifyBrand } from './brands.js';

function slugifyProductName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80);
}

async function resolveUniqueProductSlug(
  supabase: SupabaseClient,
  name: string
): Promise<string> {
  const baseSlug = slugifyProductName(name) || 'producto';
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('product_id')
      .eq('slug', candidate)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`No se pudo validar slug "${candidate}": ${error.message}`);
    }
    if (!data) return candidate;

    candidate = `${baseSlug}-${suffix}`;
    suffix++;
  }
}

function buildProductDescription(scraped: ScrapedProduct, category: string): string {
  const raw = (scraped.description || '').replace(/\s+/g, ' ').trim();
  const lowQualitySource =
    raw.length < 120 ||
    /^comprar\s+/i.test(raw) ||
    /en el motorista/i.test(raw) ||
    /\bahorro\b/i.test(raw);
  if (!lowQualitySource) return raw;

  const brand = scraped.brand?.trim();
  const baseName = scraped.name.trim();
  const lowerName = baseName.toLowerCase();
  const lowerSubcategory = (scraped.subcategory || '').toLowerCase();

  let typeLabel = 'equipación para motorista';
  if (lowerName.includes('chaqueta') || lowerSubcategory.includes('chaqueta')) {
    typeLabel = 'chaqueta de moto';
  } else if (lowerName.includes('guante') || lowerSubcategory.includes('guante')) {
    typeLabel = 'guantes de moto';
  } else if (lowerName.includes('pantal') || lowerSubcategory.includes('pantal')) {
    typeLabel = 'pantalón de moto';
  } else if (lowerName.includes('bota') || lowerSubcategory.includes('bota')) {
    typeLabel = 'botas de moto';
  }

  const sizes = [...new Set((scraped.variants || []).map((v) => (v.size || '').trim()).filter(Boolean))];
  const colors = [...new Set((scraped.variants || []).map((v) => (v.color || '').trim()).filter(Boolean))];
  const sizeText = sizes.length ? sizes.join(', ') : 'Consultar disponibilidad';
  const colorText = colors.length ? colors.join(', ') : 'Consultar disponibilidad';

  const brandText = brand ? ` de ${brand}` : '';

  return [
    `INFORMACION DEL PRODUCTO`,
    `${baseName}. ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}${brandText} pensada para ofrecer comodidad, proteccion y buen rendimiento en el uso diario o en ruta.`,
    ``,
    `Caracteristicas principales:`,
    `- Diseno tecnico orientado a una conduccion segura y confortable.`,
    `- Materiales seleccionados para un uso intensivo en moto.`,
    `- Ajuste ergonomico para mayor libertad de movimiento.`,
    `- Acabados y construccion enfocados en durabilidad.`,
    `- Tallas disponibles: ${sizeText}.`,
    `- Colores disponibles: ${colorText}.`,
    ``,
    `Categoria: ${category}.`,
  ].join('\n');
}

async function resolveCategoryId(
  supabase: SupabaseClient,
  name: string
): Promise<number> {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', name)
    .maybeSingle();
  if (error || !data) {
    throw new Error(`Categoría no encontrada: "${name}". Créala en Supabase primero.`);
  }
  return data.id;
}

async function resolveSubcategoryId(
  supabase: SupabaseClient,
  name: string | undefined,
  categoryId: number
): Promise<number | undefined> {
  if (!name?.trim()) return undefined;
  const { data, error } = await supabase
    .from('subcategories')
    .select('id')
    .ilike('name', name.trim())
    .eq('category_id', categoryId)
    .maybeSingle();
  if (error || !data) {
    throw new Error(
      `Subcategoría "${name}" no encontrada en la categoría id=${categoryId}`
    );
  }
  return data.id;
}

async function resolveBrandId(
  supabase: SupabaseClient,
  name: string | undefined
): Promise<number | undefined> {
  if (!name?.trim()) return undefined;

  const canonical = name.trim();
  const slug = slugifyBrand(canonical);

  const { data: byName } = await supabase
    .from('brands')
    .select('id')
    .ilike('name', canonical)
    .maybeSingle();
  if (byName) return byName.id;

  const { data: bySlug } = await supabase
    .from('brands')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (bySlug) return bySlug.id;

  const { data: created, error } = await supabase
    .from('brands')
    .insert([{ name: canonical, slug }])
    .select('id')
    .single();

  if (error || !created) {
    throw new Error(`No se pudo crear la marca "${canonical}": ${error?.message || 'error'}`);
  }
  return created.id;
}

export async function importScrapedProduct(
  scraped: ScrapedProduct,
  options: ImportOptions
): Promise<ImportResult> {
  const supabase = getServiceSupabase();
  const multiplier = options.priceMultiplier ?? 1.2;
  const price = Math.round(scraped.price * multiplier * 100) / 100;
  const categoryId = await resolveCategoryId(supabase, options.category);
  const subcategoryName = options.subcategory ?? scraped.subcategory;
  const subcategoryId = await resolveSubcategoryId(
    supabase,
    subcategoryName,
    categoryId
  );
  const brandName = options.brand ?? scraped.brand;
  const brandId = await resolveBrandId(supabase, brandName);
  const productSlug = await resolveUniqueProductSlug(supabase, scraped.name);

  if (!options.dryRun) {
    const exists = await productExistsByName(supabase, scraped.name);
    if (exists) {
      if (options.skipExisting) {
        console.log(`  ⊘ Ya existe, omitido`);
        return {
          name: scraped.name,
          sourceUrl: scraped.sourceUrl,
          imageCount: scraped.images.length,
          variantCount: scraped.variants?.length ?? 0,
          subcategory: subcategoryName,
          brand: brandName,
          dryRun: false,
          skipped: true,
        };
      }
      throw new Error(`Ya existe un producto con nombre "${scraped.name}"`);
    }
  }

  const { variants, colorIds } = await buildDbVariants(supabase, scraped);
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);

  if (options.dryRun) {
    console.log('\n[DRY-RUN] Producto que se importaría:');
    console.log('  Nombre:', scraped.name);
    console.log('  Precio:', price, '€');
    console.log('  Imágenes:', scraped.images.length);
    console.log('  Variantes:', variants.length);
    console.log('  Categoría:', options.category, subcategoryName || '(sin subcategoría)');
    console.log('  Marca:', brandName || '(sin marca)');
    return {
      name: scraped.name,
      sourceUrl: scraped.sourceUrl,
      imageCount: scraped.images.length,
      variantCount: variants.length,
      subcategory: subcategoryName,
      brand: brandName,
      dryRun: true,
    };
  }

  console.log('  Subiendo imágenes...');
  let imageUrls: string[] = [];
  const imageRecords: {
    product_id: string;
    image_url: string;
    orden: number;
    is_main: boolean;
    color_id: number | null;
  }[] = [];

  if (scraped.imagesByColor?.length) {
    for (const group of scraped.imagesByColor) {
      const colorId = (await resolveColorId(supabase, group.color)) ?? null;
      const uploaded = await uploadImagesToStorage(
        supabase,
        `${scraped.name}-${group.color}`,
        group.images,
        scraped.sourceUrl
      );
      uploaded.forEach((url, index) => {
        imageRecords.push({
          product_id: '', // filled after product insert
          image_url: url,
          orden: index,
          is_main: imageRecords.length === 0 && index === 0,
          color_id: colorId,
        });
      });
      if (!imageUrls.length) imageUrls = uploaded;
    }
  } else {
    imageUrls = await uploadImagesToStorage(
      supabase,
      scraped.name,
      scraped.images,
      scraped.sourceUrl
    );
  }

  if (!imageUrls.length) {
    throw new Error('No se pudo subir ninguna imagen a Supabase Storage');
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert([
      {
        name: scraped.name,
        slug: productSlug,
        description: buildProductDescription(scraped, options.category),
        price,
        category_id: categoryId,
        subcategory_id: subcategoryId ?? null,
        brand_id: brandId ?? null,
        stock: totalStock,
        is_published: options.isPublished ?? false,
        is_new: options.isNew ?? true,
        images: imageUrls,
      },
    ])
    .select('product_id')
    .single();

  if (productError || !product) {
    throw productError ?? new Error('No se creó el producto');
  }

  const productId = product.product_id as string;

  if (variants.length) {
    const { error } = await supabase.from('product_variants').insert(
      variants.map((v) => ({
        product_id: productId,
        size: v.size,
        color_id: v.color_id,
        stock: v.stock,
      }))
    );
    if (error) throw error;
  }

  const pendingImageRecords = imageRecords;

  const finalImageRecords = pendingImageRecords.length
    ? pendingImageRecords.map((r) => ({ ...r, product_id: productId }))
    : imageUrls.map((url, index) => ({
        product_id: productId,
        image_url: url,
        orden: index,
        is_main: index === 0,
        color_id: null as number | null,
      }));
  const { error: imgErr } = await supabase.from('product_images').insert(finalImageRecords);
  if (imgErr) throw imgErr;

  if (colorIds.length) {
    const { error: colErr } = await supabase.from('product_colors').insert(
      colorIds.map((color_id) => ({ product_id: productId, color_id }))
    );
    if (colErr) throw colErr;
  }

  console.log(`  ✓ Producto creado: ${productId}`);

  return {
    productId,
    name: scraped.name,
    sourceUrl: scraped.sourceUrl,
    imageCount: imageUrls.length,
    variantCount: variants.length,
    subcategory: subcategoryName,
    brand: brandName,
    dryRun: false,
  };
}
