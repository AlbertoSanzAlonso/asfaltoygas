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
        description: scraped.description || scraped.name,
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
