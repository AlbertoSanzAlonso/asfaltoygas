/**
 * Asigna subcategorías (Jet, Integral, Modular) a productos de Cascos
 * basándose en patrones de nombre y datos de El Motorista.
 *
 * Estrategia:
 * 1. Scrapear TODAS las páginas de cada tipo en El Motorista
 * 2. Hacer fuzzy match contra productos en BD
 * 3. Asignar subcategoría
 *
 * Uso: npx tsx scripts/assign-subcategories.ts [--dry-run]
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { fetchPage } from './scrape/fetch-page.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY_RUN = process.argv.includes('--dry-run');

const LISTING_URLS: { type: string; subcategory: string; url: string }[] = [
  {
    type: 'Jet',
    subcategory: 'Jet',
    url: 'https://www.elmotorista.es/shop-motos/casco-moto/categoria-cascos-moto/familia-cascos-jet?page=',
  },
  {
    type: 'Integral',
    subcategory: 'Integral',
    url: 'https://www.elmotorista.es/shop-motos/casco-moto/categoria-cascos-moto/familia-cascos-integrales?page=',
  },
  {
    type: 'Modular',
    subcategory: 'Modular',
    url: 'https://www.elmotorista.es/shop-motos/casco-moto/categoria-cascos-moto/familia-cascos-modulares?page=',
  },
];

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractProductNames(html: string): string[] {
  const $ = cheerio.load(html);
  const names: string[] = [];

  $('a[href*="/product/"], a[href*="/producto/"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 200) {
      names.push(text);
    }
  });

  $('.product-name, .product-title, .product-name a, h2.product-name, h3.product-name, .item-title, .product-card__name').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 200) {
      names.push(text);
    }
  });

  // JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '');
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type'] === 'ItemList' || item['@type'] === 'ProductList') {
          const elements = item.itemListElement || [item];
          for (const p of elements) {
            if (p.name) names.push(p.name);
          }
        }
        if (item['@graph']) {
          for (const g of item['@graph']) {
            if (g.name) names.push(g.name);
          }
        }
      }
    } catch {}
  });

  return [...new Set(names)];
}

function extractMaxPage(html: string): number {
  const $ = cheerio.load(html);
  let max = 1;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(/[?&]page=(\d+)/i) || href.match(/\/page\/(\d+)/i);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return max;
}

function matchScore(scrapedName: string, dbName: string): number {
  const a = normalize(scrapedName);
  const b = normalize(dbName);
  if (!a || !b) return 0;
  if (a === b) return 1;

  // One contains the other
  if (a.includes(b) || b.includes(a)) return 0.85;

  // Token overlap (exclude common words)
  const stopWords = new Set(['casco', 'de', 'la', 'el', 'en', 'con', 'para', 'y', 'a']);
  const tokensA = a.split(' ').filter((t) => t.length > 2 && !stopWords.has(t));
  const tokensB = b.split(' ').filter((t) => t.length > 2 && !stopWords.has(t));
  if (!tokensA.length || !tokensB.length) return 0;
  const overlap = tokensA.filter((t) => tokensB.includes(t)).length;
  return overlap / Math.max(tokensA.length, tokensB.length);
}

async function main() {
  console.log(`\n=== Asignar subcategorías por scraping de El Motorista ===\n`);
  if (DRY_RUN) console.log('[DRY-RUN] No se escribirá en la BD\n');

  const { data: catData } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', 'Cascos')
    .maybeSingle();
  const cascossId = catData?.id;
  if (!cascossId) {
    console.error('No se encontró la categoría Cascos');
    process.exit(1);
  }

  const { data: subcats } = await supabase
    .from('subcategories')
    .select('id, name')
    .eq('category_id', cascossId);

  const subcatMap = new Map<string, number>();
  for (const s of subcats || []) {
    subcatMap.set(s.name, s.id);
  }

  const { data: products } = await supabase
    .from('products')
    .select('product_id, name')
    .eq('category_id', cascossId);

  if (!products?.length) {
    console.log('No hay productos en Cascos.');
    return;
  }
  console.log(`Productos en Cascos: ${products.length}\n`);

  const assigned = new Map<string, { subcategoryId: number; subcategoryName: string; matchedName: string }>();
  const allScrapedNames = new Map<string, Set<string>>(); // type -> Set<name>

  for (const listing of LISTING_URLS) {
    console.log(`Scrapeando ${listing.type}...`);

    // First page to detect pagination
    let html: string;
    try {
      html = await fetchPage(listing.url + '1');
    } catch (err) {
      console.error(`  Error: ${(err as Error).message}`);
      continue;
    }

    const maxPage = extractMaxPage(html);
    console.log(`  Detectadas ${maxPage} páginas`);

    const typeNames = new Set<string>();
    let pageNames = extractProductNames(html);
    pageNames.forEach((n) => typeNames.add(n));

    // Scrape remaining pages
    for (let p = 2; p <= maxPage; p++) {
      try {
        await new Promise((r) => setTimeout(r, 800)); // rate limit
        html = await fetchPage(listing.url + p);
        pageNames = extractProductNames(html);
        pageNames.forEach((n) => typeNames.add(n));
        process.stdout.write(`  Página ${p}: +${pageNames.length} nombres\r`);
      } catch {
        break; // Stop if page fails
      }
    }
    console.log(`  Total nombres únicos: ${typeNames.size}`);

    allScrapedNames.set(listing.type, typeNames);

    const subcategoryId = subcatMap.get(listing.subcategory);
    if (!subcategoryId) {
      console.error(`  Subcategoría "${listing.subcategory}" no encontrada`);
      continue;
    }

    // Match products
    for (const product of products) {
      if (assigned.has(product.product_id)) continue;

      let bestScore = 0;
      for (const scrapedName of typeNames) {
        const score = matchScore(scrapedName, product.name);
        if (score > bestScore) bestScore = score;
      }

      if (bestScore >= 0.45) {
        assigned.set(product.product_id, {
          subcategoryId,
          subcategoryName: listing.subcategory,
          matchedName: product.name,
        });
      }
    }

    const count = [...assigned.values()].filter((a) => a.subcategoryName === listing.subcategory).length;
    console.log(`  Asignados a ${listing.subcategory}: ${count}\n`);
  }

  console.log(`=== Resumen ===`);
  console.log(`Total asignados: ${assigned.size} de ${products.length} productos`);
  const bySub = new Map<string, number>();
  for (const [, v] of assigned) {
    bySub.set(v.subcategoryName, (bySub.get(v.subcategoryName) || 0) + 1);
  }
  for (const [sub, count] of bySub) {
    console.log(`  ${sub}: ${count}`);
  }

  const unassigned = products.filter((p) => !assigned.has(p.product_id));
  console.log(`Sin asignar: ${unassigned.length}`);

  if (DRY_RUN) {
    console.log(`\n[DRY-RUN] No se actualizaron productos.`);
    return;
  }

  let updated = 0;
  for (const [productId, info] of assigned) {
    const { error } = await supabase
      .from('products')
      .update({ subcategory_id: info.subcategoryId })
      .eq('product_id', productId);
    if (error) {
      console.error(`  Error: ${info.matchedName}:`, error.message);
    } else {
      updated++;
    }
  }

  console.log(`\n✓ ${updated} productos actualizados con subcategoría.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});