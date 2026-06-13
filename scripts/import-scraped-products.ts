/**
 * Importa productos desde páginas de proveedores a Supabase.
 *
 * Uso:
 *   npx tsx scripts/import-scraped-products.ts --url "https://proveedor.com/producto" \
 *     --category Cascos --subcategory Integral --stock 2
 *
 *   npx tsx scripts/import-scraped-products.ts --listing "https://proveedor.com/cascos" \
 *     --provider ejemplo-listado --category Cascos --limit 5
 *
 *   npx tsx scripts/import-scraped-products.ts --file productos.json --category Equipación
 *
 * Flags:
 *   --dry-run          Solo muestra qué se importaría
 *   --publish          Publicar en tienda (por defecto: borrador)
 *   --multiplier 1.0   Sin margen (por defecto +20% = 1.2)
 *   --provider ID      Perfil en scripts/scrape/providers.config.json
 */
import 'dotenv/config';
import { readFileSync, existsSync } from 'node:fs';
import type { ImportOptions, ScrapedProduct } from './scrape/types.js';
import { scrapeProductUrl, scrapeListingUrls, loadProviders } from './scrape/scrape-product.js';
import { importScrapedProduct } from './scrape/importer.js';

function printHelp() {
  console.log(`
Importador de productos desde proveedores → Supabase

Opciones:
  --url URL              Ficha de un producto
  --listing URL          Listado; requiere --provider con productLinks
  --file PATH            JSON con array de ScrapedProduct o { url, category, ... }
  --category NAME        Cascos | Equipación | Accesorios (obligatorio)
  --subcategory NAME     Integral, Chaquetas, etc.
  --stock N              Stock por variante (default: 0)
  --provider ID          Perfil en scripts/scrape/providers.config.json
  --limit N              Máx. productos a importar (default: 10)
  --pages N              Máx. páginas del listado a recorrer (auto si se omite)
  --match TEXTO          Solo URLs que contengan este texto (ej. casco)
  --multiplier N         Factor de precio (default: 1.2 = +20%)
  --skip-existing        Omite productos cuyo nombre ya está en BD
  --delay MS             Pausa entre fichas (default: 800)
  --publish              is_published=true
  --dry-run              No escribe en BD

Proveedores configurados:
${loadProviders().map((p) => `  - ${p.id}: ${p.name}`).join('\n') || '  (ninguno — copia providers.config.json)'}

Configura selectores CSS en scripts/scrape/providers.config.json
`);
}

function parseArgs(argv: string[]) {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const has = (flag: string) => argv.includes(flag);

  return {
    url: get('--url'),
    listing: get('--listing'),
    file: get('--file'),
    category: get('--category'),
    subcategory: get('--subcategory'),
    stock: parseInt(get('--stock') || '0', 10),
    provider: get('--provider'),
    limit: parseInt(get('--limit') || '10', 10),
    pages: get('--pages') ? parseInt(get('--pages')!, 10) : undefined,
    match: get('--match'),
    multiplier: parseFloat(get('--multiplier') || '1.2'),
    skipExisting: has('--skip-existing'),
    delayMs: parseInt(get('--delay') || '800', 10),
    publish: has('--publish'),
    dryRun: has('--dry-run'),
    help: has('--help') || has('-h'),
  };
}

type FileEntry =
  | ScrapedProduct
  | { url: string; category: string; subcategory?: string; stock?: number };

async function importOne(
  scraped: ScrapedProduct,
  base: Omit<ImportOptions, 'category' | 'subcategory'>,
  category: string,
  subcategory?: string
) {
  const options: ImportOptions = {
    ...base,
    category,
    subcategory,
  };
  console.log(`\n→ ${scraped.name} (${scraped.sourceUrl})`);
  return importScrapedProduct(scraped, options);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const importBase: Omit<ImportOptions, 'category' | 'subcategory'> = {
    defaultStock: args.stock,
    isPublished: args.publish,
    isNew: true,
    dryRun: args.dryRun,
    skipExisting: args.skipExisting,
    priceMultiplier: args.multiplier,
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const results = [];

  if (args.file) {
    if (!existsSync(args.file)) {
      console.error('Archivo no encontrado:', args.file);
      process.exit(1);
    }
    const entries = JSON.parse(readFileSync(args.file, 'utf8')) as FileEntry[];
    for (const entry of entries) {
      if ('sourceUrl' in entry && entry.name) {
        const r = await importOne(entry, importBase, args.category || 'Accesorios', args.subcategory);
        results.push(r);
      } else if ('url' in entry) {
        const scraped = await scrapeProductUrl(entry.url, {
          providerId: args.provider,
          defaultStock: entry.stock ?? args.stock,
        });
        const r = await importOne(
          scraped,
          importBase,
          entry.category || args.category || 'Accesorios',
          entry.subcategory ?? args.subcategory
        );
        results.push(r);
      }
    }
  } else if (args.listing) {
    if (!args.category) {
      console.error('Falta --category');
      process.exit(1);
    }
    const urls = await scrapeListingUrls(
      args.listing,
      args.provider,
      args.limit,
      args.match,
      args.pages
    );
    console.log(`Encontradas ${urls.length} fichas en el listado`);
    let i = 0;
    for (const url of urls) {
      i++;
      console.log(`\n[${i}/${urls.length}]`);
      try {
        const scraped = await scrapeProductUrl(url, {
          providerId: args.provider,
          defaultStock: args.stock,
        });
        const r = await importOne(scraped, importBase, args.category, args.subcategory);
        results.push(r);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`  ✗ ${url}:`, msg);
        results.push({
          name: url,
          sourceUrl: url,
          imageCount: 0,
          variantCount: 0,
          dryRun: false,
          error: msg,
        });
      }
      if (i < urls.length && args.delayMs > 0) await sleep(args.delayMs);
    }
  } else if (args.url) {
    if (!args.category) {
      console.error('Falta --category');
      process.exit(1);
    }
    if (/proveedor\.com\/producto|example\.com/i.test(args.url)) {
      console.error(
        'Esa URL es solo un ejemplo de la ayuda. Sustitúyela por la ficha real de tu proveedor, por ejemplo:\n' +
          '  --url "https://www.elmotorista.es/product/casco-hjc-..." --provider elmotorista'
      );
      process.exit(1);
    }
    const scraped = await scrapeProductUrl(args.url, {
      providerId: args.provider,
      defaultStock: args.stock,
    });
    const r = await importOne(scraped, importBase, args.category, args.subcategory);
    results.push(r);
  } else {
    printHelp();
    process.exit(1);
  }

  console.log('\n--- Resumen ---');
  const imported = results.filter((r) => !r.dryRun && !r.skipped && !r.error && r.productId);
  const skipped = results.filter((r) => r.skipped);
  const failed = results.filter((r) => r.error);
  console.log(`Importados: ${imported.length}`);
  console.log(`Omitidos (ya existían): ${skipped.length}`);
  console.log(`Fallidos: ${failed.length}`);
  console.log(`Dry-run: ${results.filter((r) => r.dryRun).length}`);
  for (const r of results.filter((r) => !r.error)) {
    const sub = r.subcategory ? ` · ${r.subcategory}` : '';
    const brand = r.brand ? ` · ${r.brand}` : '';
    const tag = r.dryRun ? '[preview]' : r.skipped ? '[omitido]' : '✓';
    console.log(`  ${tag} ${r.name}${sub}${brand} (${r.imageCount} img, ${r.variantCount} var)`);
  }
  if (failed.length) {
    console.log('\nErrores:');
    for (const r of failed.slice(0, 20)) {
      console.log(`  ✗ ${r.sourceUrl}: ${r.error}`);
    }
    if (failed.length > 20) console.log(`  … y ${failed.length - 20} más`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
