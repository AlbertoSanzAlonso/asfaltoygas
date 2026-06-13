import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ProviderConfig, ScrapedProduct } from './types.js';
import { fetchPage } from './fetch-page.js';
import { extractFromJsonLd } from './extract-jsonld.js';
import { extractFromHtml, extractProductLinks, detectMaxListingPage, extractElmotoristaColors, extractElmotoristaColorLinks, extractImagesFromHtml } from './extract-html.js';
import { extractHelmetTypeFromHtml } from './helmet-types.js';
import { resolveScrapedBrand } from './brands.js';

const CONFIG_PATH = join(process.cwd(), 'scripts', 'scrape', 'providers.config.json');

export function loadProviders(): ProviderConfig[] {
  if (!existsSync(CONFIG_PATH)) return [];
  const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as {
    providers?: ProviderConfig[];
  };
  return raw.providers ?? [];
}

export function getProvider(id?: string): ProviderConfig | undefined {
  if (!id) return undefined;
  return loadProviders().find((p) => p.id === id);
}

function mergeScraped(primary: ScrapedProduct, fallback: ScrapedProduct): ScrapedProduct {
  const images =
    fallback.images.length > primary.images.length ? fallback.images : primary.images;

  let variants = primary.variants?.length ? primary.variants : fallback.variants;
  const fallbackSizes = (fallback.variants || [])
    .map((v) => v.size)
    .filter((s) => s && !/^sku\s/i.test(s));
  const primaryLooksLikeSku = variants?.every((v) => /^sku\s/i.test(v.size));
  if (primaryLooksLikeSku && fallbackSizes.length) {
    const stock = variants?.[0]?.stock ?? 0;
    variants = fallbackSizes.map((size) => ({
      size,
      color: null,
      stock,
    }));
  }

  return {
    sourceUrl: primary.sourceUrl,
    name: primary.name || fallback.name,
    description: primary.description || fallback.description,
    price: primary.price > 0 ? primary.price : fallback.price,
    brand: primary.brand || fallback.brand,
    sku: primary.sku || fallback.sku,
    images,
    variants: variants ?? [{ size: 'Única', color: null, stock: 0 }],
  };
}

/** Sube resolución de miniaturas conocidas (máx. 320 en estaticos.elmotorista.es) y elimina duplicados. */
export function normalizeImageUrls(urls: string[]): string[] {
  const upgraded = urls.map((url) => {
    if (url.includes('estaticos.elmotorista.es')) {
      return url
        .replace(/_60\.webp$/i, '_320.webp')
        .replace(/_200\.webp$/i, '_320.webp')
        .replace(/_800\.webp$/i, '_320.webp');
    }
    return url
      .replace(/_60\.webp$/i, '_800.webp')
      .replace(/_200\.webp$/i, '_800.webp')
      .replace(/_320\.webp$/i, '_800.webp');
  });

  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of upgraded) {
    const key = url.replace(/_\d+\.(webp|jpe?g|png)$/i, '.$1');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

export async function scrapeProductUrl(
  url: string,
  opts: {
    providerId?: string;
    defaultStock?: number;
  } = {}
): Promise<ScrapedProduct> {
  const provider = getProvider(opts.providerId);
  const html = await fetchPage(url);
  const defaultStock = opts.defaultStock ?? 0;

  const fromLd = extractFromJsonLd(html, url, defaultStock);
  const fromHtml = extractFromHtml(
    html,
    url,
    provider?.selectors,
    provider?.defaultSizes,
    defaultStock
  );

  let scraped: ScrapedProduct | null = null;
  if (fromLd && fromHtml) scraped = mergeScraped(fromLd, fromHtml);
  else scraped = fromLd ?? fromHtml;

  if (!scraped) {
    throw new Error(
      `No se pudo extraer producto de ${url}. Prueba otro proveedor o añade selectores en scripts/scrape/providers.config.json`
    );
  }

  if (!scraped.images.length) {
    const hint =
      /proveedor\.com|example\.com|tu-proveedor/i.test(url)
        ? ' Parece una URL de ejemplo de la documentación — usa la ficha real de tu distribuidor.'
        : ' Añade o ajusta selectores en scripts/scrape/providers.config.json o pásame el enlace.';
    throw new Error(`Sin imágenes en ${url}.${hint}`);
  }

  scraped.images = normalizeImageUrls(scraped.images);

  if (opts.providerId === 'elmotorista' || url.includes('elmotorista.es')) {
    const helmetType = extractHelmetTypeFromHtml(html);
    if (helmetType) scraped.subcategory = helmetType;

    const pageColors = extractElmotoristaColors(html, url);
    if (pageColors.length && scraped.variants?.length) {
      const sizes = [...new Set(scraped.variants.map((v) => v.size).filter(Boolean))];
      const stock = scraped.variants[0]?.stock ?? defaultStock;
      scraped.variants = sizes.flatMap((size) =>
        pageColors.map((color) => ({ size, color, stock }))
      );
    }

    const colorLinks = extractElmotoristaColorLinks(html, url);
    if (colorLinks.length) {
      const imagesByColor: { color: string; images: string[] }[] = [];
      for (const { name, url: colorUrl } of colorLinks) {
        const colorHtml = colorUrl === url ? html : await fetchPage(colorUrl);
        const rawImages = extractImagesFromHtml(
          colorHtml,
          colorUrl,
          provider?.selectors ?? {}
        );
        const images = normalizeImageUrls(rawImages);
        if (images.length) imagesByColor.push({ color: name, images });
      }
      if (imagesByColor.length) {
        scraped.imagesByColor = imagesByColor;
        scraped.images = imagesByColor[0].images;
      }
    }
  }

  const brand = resolveScrapedBrand(html, scraped.name, scraped.brand);
  if (brand) scraped.brand = brand;

  if (scraped.price <= 0) {
    console.warn(`[scrape] Precio 0 en ${url} — revisa en admin antes de publicar.`);
  }

  return scraped;
}

function listingUrlForPage(listingUrl: string, page: number): string {
  const u = new URL(listingUrl);
  if (page <= 1) u.searchParams.delete('page');
  else u.searchParams.set('page', String(page));
  return u.href;
}

function normalizeProductUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    return u.origin + u.pathname;
  } catch {
    return url.split('?')[0];
  }
}

export async function scrapeListingUrls(
  listingUrl: string,
  providerId?: string,
  limit = 20,
  urlMatch?: string,
  maxPages?: number
): Promise<string[]> {
  const provider = getProvider(providerId);
  const selector = provider?.selectors?.productLinks;
  if (!selector) {
    throw new Error(
      'El proveedor no define selectors.productLinks para listados. Configúralo en providers.config.json'
    );
  }

  const collected = new Map<string, string>();
  let page = 1;
  let lastPage = maxPages ?? 1;
  let emptyStreak = 0;

  while (collected.size < limit && page <= lastPage) {
    const pageUrl = listingUrlForPage(listingUrl, page);
    console.log(`  Listado página ${page}…`);
    const html = await fetchPage(pageUrl);

    if (page === 1 && maxPages == null) {
      lastPage = detectMaxListingPage(html);
      console.log(`  Paginación detectada: ${lastPage} páginas`);
    }

    let links = extractProductLinks(html, pageUrl, selector);
    if (urlMatch) {
      const needle = urlMatch.toLowerCase();
      links = links.filter((u) => u.toLowerCase().includes(needle));
    }

    const before = collected.size;
    for (const link of links) {
      if (collected.size >= limit) break;
      const key = normalizeProductUrl(link);
      if (!collected.has(key)) collected.set(key, link);
    }

    if (collected.size === before) emptyStreak++;
    else emptyStreak = 0;

    if (emptyStreak >= 2) break;
    page++;
  }

  return [...collected.values()].slice(0, limit);
}
