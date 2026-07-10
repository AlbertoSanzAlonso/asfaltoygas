import 'dotenv/config';
import { scrapeListingUrls, scrapeProductUrl } from './scrape/scrape-product.js';
import { getServiceSupabase, uploadImagesToStorage } from './scrape/images.js';

const DEFAULT_LISTING_URL =
  'https://www.elmotorista.es/shop-motos/maletas-equipaje/categoria-maleta-equipaje-moto';
const STOPWORDS = new Set(['de', 'la', 'el', 'los', 'las', 'y', 'en', 'con', 'para', 'sin', 'del']);

function cleanText(value: string | null | undefined): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildEquipajeDescription(
  name: string,
  brand: string | null | undefined,
  sizes: string[],
  colors: string[]
): string {
  const productName = cleanText(name) || 'Producto';
  const lowerName = productName.toLowerCase();
  let typeLabel = 'articulo de equipaje para moto';

  if (lowerName.includes('alforja')) typeLabel = 'alforjas para moto';
  else if (lowerName.includes('maleta') || lowerName.includes('baul'))
    typeLabel = 'maleta o baul para moto';
  else if (lowerName.includes('bolsa')) typeLabel = 'bolsa para moto';
  else if (lowerName.includes('fijacion') || lowerName.includes('soporte'))
    typeLabel = 'sistema de fijacion para equipaje';

  const brandText = cleanText(brand) ? ` de ${cleanText(brand)}` : '';
  const sizesText = sizes.length ? sizes.join(', ') : 'No aplica';
  const colorsText = colors.length ? colors.join(', ') : 'Consultar variantes';

  return [
    'INFORMACION DEL PRODUCTO',
    `${productName}. ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}${brandText} pensado para mejorar capacidad de carga, practicidad y resistencia en uso diario o en viaje.`,
    '',
    'Caracteristicas principales:',
    '- Diseno orientado a funcionalidad y durabilidad en moto.',
    '- Materiales preparados para uso frecuente y condiciones reales de ruta.',
    '- Acabados robustos y montaje practico segun el tipo de pieza.',
    '- Compatibilidad y ajuste segun modelo/soporte del fabricante.',
    `- Tallas/medidas: ${sizesText}.`,
    `- Colores/variantes: ${colorsText}.`,
    '',
    'Categoria: Equipaje.',
  ].join('\n');
}

async function resolveExistingProductIdByName(name: string): Promise<string | null> {
  const supabase = getServiceSupabase();
  const canonical = cleanText(name);
  const { data, error } = await supabase
    .from('products')
    .select('product_id')
    .ilike('name', canonical)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.product_id ?? null;
}

type CatalogCandidate = {
  product_id: string;
  name: string;
  slug: string | null;
  tokens: Set<string>;
};

function normalizeForTokens(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeForTokens(value)
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function sourceTokensFromUrl(sourceUrl: string): string[] {
  try {
    const slug = sourceUrl.split('/product/')[1] || sourceUrl;
    const decoded = decodeURIComponent(slug)
      .replace(/\?.*$/, '')
      .replace(/[-_]/g, ' ')
      .trim();
    const tokens = tokenize(decoded);
    // El proveedor suele añadir referencias técnicas al final (ej. lk304, x0sl041).
    return tokens.filter((t, idx) => !(idx === tokens.length - 1 && /[a-z]*\d{2,}[a-z\d]*/i.test(t)));
  } catch {
    return tokenize(sourceUrl);
  }
}

function fuzzyMatchProductId(
  sourceUrl: string,
  scrapedName: string,
  candidates: CatalogCandidate[]
): string | null {
  const a = new Set<string>([...sourceTokensFromUrl(sourceUrl), ...tokenize(scrapedName)]);
  if (!a.size) return null;

  let best: { id: string; score: number; overlap: number } | null = null;
  for (const c of candidates) {
    let overlap = 0;
    for (const t of a) if (c.tokens.has(t)) overlap++;
    if (overlap < 2) continue;

    const score = (2 * overlap) / (a.size + c.tokens.size);
    if (!best || score > best.score) {
      best = { id: c.product_id, score, overlap };
    }
  }

  if (!best) return null;
  return best.score >= 0.42 ? best.id : null;
}

async function refreshProduct(productId: string, sourceUrl: string) {
  const supabase = getServiceSupabase();
  const scraped = await scrapeProductUrl(sourceUrl, { providerId: 'elmotorista', defaultStock: 0 });

  const sizes = [...new Set((scraped.variants || []).map((v) => cleanText(v.size)).filter(Boolean))];
  const colors = [...new Set((scraped.variants || []).map((v) => cleanText(v.color || '')).filter(Boolean))];

  const uploadedUrls = await uploadImagesToStorage(
    supabase,
    scraped.name,
    scraped.images,
    scraped.sourceUrl
  );

  const cleanedScrapedDescription = cleanText(scraped.description);
  const useProviderDescription =
    cleanedScrapedDescription.length >= 60 &&
    !/^comprar\s+/i.test(cleanedScrapedDescription);

  const description = useProviderDescription
    ? scraped.description
    : buildEquipajeDescription(
        scraped.name,
        scraped.brand || null,
        sizes.filter((s) => s.toLowerCase() !== 'unica' && s.toLowerCase() !== 'única'),
        colors
      );

  const { error: deleteErr } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId);
  if (deleteErr) throw deleteErr;

  const imageRows = uploadedUrls.map((imageUrl, index) => ({
    product_id: productId,
    image_url: imageUrl,
    orden: index,
    is_main: index === 0,
    color_id: null as number | null,
  }));
  const { error: insertImgErr } = await supabase.from('product_images').insert(imageRows);
  if (insertImgErr) throw insertImgErr;

  const { error: updateProductErr } = await supabase
    .from('products')
    .update({
      images: uploadedUrls,
      description,
    })
    .eq('product_id', productId);
  if (updateProductErr) throw updateProductErr;
}

async function main() {
  const listingUrl = process.argv[2] || DEFAULT_LISTING_URL;
  const limit = Number(process.argv[3] || 500);
  const supabase = getServiceSupabase();

  const { data: equipajeCategory, error: catErr } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', 'Equipaje')
    .maybeSingle();
  if (catErr || !equipajeCategory) {
    throw catErr ?? new Error('Categoría Equipaje no encontrada');
  }

  const { data: catalogRows, error: catalogErr } = await supabase
    .from('products')
    .select('product_id,name,slug')
    .eq('category_id', equipajeCategory.id);
  if (catalogErr) throw catalogErr;

  const candidates: CatalogCandidate[] = (catalogRows || []).map((row) => {
    const fromName = tokenize(row.name || '');
    const fromSlug = tokenize(row.slug || '');
    return {
      product_id: row.product_id,
      name: row.name || '',
      slug: row.slug || null,
      tokens: new Set([...fromName, ...fromSlug]),
    };
  });

  console.log(`Listado: ${listingUrl}`);
  const urls = await scrapeListingUrls(listingUrl, 'elmotorista', limit);
  console.log(`Fichas detectadas: ${urls.length}`);

  let updated = 0;
  let skippedNotFound = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i++) {
    const sourceUrl = urls[i];
    console.log(`\n[${i + 1}/${urls.length}] ${sourceUrl}`);
    try {
      const scraped = await scrapeProductUrl(sourceUrl, {
        providerId: 'elmotorista',
        defaultStock: 0,
      });
      let productId = await resolveExistingProductIdByName(scraped.name);
      if (!productId) {
        productId = fuzzyMatchProductId(sourceUrl, scraped.name, candidates);
      }
      if (!productId) {
        console.log(`  ⊘ No existe en BD, se deja sin tocar`);
        skippedNotFound++;
        continue;
      }
      await refreshProduct(productId, sourceUrl);
      console.log(`  ✓ Actualizado`);
      updated++;
    } catch (err) {
      failed++;
      console.log(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log('\n--- Resumen refresco equipaje ---');
  console.log(`Actualizados: ${updated}`);
  console.log(`No encontrados en BD: ${skippedNotFound}`);
  console.log(`Fallidos: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

