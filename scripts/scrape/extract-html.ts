import * as cheerio from 'cheerio';
import type { ProviderSelectors, ScrapedProduct, ScrapedVariant } from './types.js';
import { resolveUrl } from './fetch-page.js';

function parseSelectorAttr(selector: string): { css: string; attr?: string } {
  const at = selector.lastIndexOf('@');
  if (at === -1) return { css: selector };
  return { css: selector.slice(0, at), attr: selector.slice(at + 1) };
}

function parsePriceText(text: string): number {
  const cleaned = text.replace(/\s/g, '').replace(/[^\d,.-]/g, '');
  const normalized = cleaned.includes(',') && cleaned.includes('.')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned.replace(',', '.');
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

function pickText($: cheerio.CheerioAPI, selector?: string): string {
  if (!selector) return '';
  return $(selector).first().text().replace(/\s+/g, ' ').trim();
}

function pickImages($: cheerio.CheerioAPI, baseUrl: string, selector?: string): string[] {
  if (!selector) return [];
  const { css, attr = 'src' } = parseSelectorAttr(selector);
  const urls: string[] = [];
  $(css).each((_, el) => {
    const raw =
      $(el).attr(attr) ||
      $(el).attr('data-src') ||
      $(el).attr('data-lazy-src') ||
      $(el).attr('href');
    if (!raw || raw.startsWith('data:')) return;
    urls.push(resolveUrl(baseUrl, raw));
  });
  return [...new Set(urls)];
}

function extractOg($: cheerio.CheerioAPI, baseUrl: string) {
  const og = (prop: string) => $(`meta[property="${prop}"]`).attr('content')?.trim() || '';
  const images = [
    og('og:image'),
    og('og:image:secure_url'),
    ...$('meta[property="og:image"]').map((_, el) => $(el).attr('content')).get(),
  ].filter(Boolean) as string[];

  return {
    title: og('og:title') || $('title').first().text().trim(),
    description: og('og:description') || $('meta[name="description"]').attr('content')?.trim() || '',
    images: [...new Set(images.map((u) => resolveUrl(baseUrl, u)))],
  };
}

function guessSizes($: cheerio.CheerioAPI): string[] {
  const sizes: string[] = [];
  const selectors = [
    'select[name*="size"] option',
    'select[name*="talla"] option',
    '[data-size]',
    '.size-option',
    '.product-size',
    'input[name*="size"]',
  ];
  for (const sel of selectors) {
    $(sel).each((_, el) => {
      const val =
        $(el).attr('value') ||
        $(el).attr('data-size') ||
        $(el).text().trim();
      if (val && val.length < 12 && !/elige|selecciona|talla/i.test(val)) {
        sizes.push(val);
      }
    });
    if (sizes.length) break;
  }
  return [...new Set(sizes)];
}

function guessColors($: cheerio.CheerioAPI): string[] {
  const colors: string[] = [];
  const selectors = [
    'select[name*="color"] option',
    '[data-color]',
    '.color-option',
    '.swatch',
  ];
  for (const sel of selectors) {
    $(sel).each((_, el) => {
      const val =
        $(el).attr('data-color') ||
        $(el).attr('title') ||
        $(el).attr('aria-label') ||
        $(el).text().trim();
      if (val && val.length < 40) colors.push(val);
    });
    if (colors.length) break;
  }
  return [...new Set(colors)];
}

function buildVariants(
  sizes: string[],
  colors: string[],
  defaultSizes: string[] | undefined,
  defaultStock: number
): ScrapedVariant[] {
  const sizeList = sizes.length ? sizes : defaultSizes?.length ? defaultSizes : ['Única'];
  const colorList = colors.length ? colors : [null];

  const variants: ScrapedVariant[] = [];
  for (const size of sizeList) {
    for (const color of colorList) {
      variants.push({
        size,
        color,
        stock: defaultStock,
      });
    }
  }
  return variants;
}

export function extractFromHtml(
  html: string,
  sourceUrl: string,
  selectors: ProviderSelectors = {},
  defaultSizes?: string[],
  defaultStock = 0
): ScrapedProduct | null {
  const $ = cheerio.load(html);
  const baseUrl = sourceUrl;
  const og = extractOg($, baseUrl);

  const name = pickText($, selectors.title) || og.title;
  if (!name) return null;

  const priceText = pickText($, selectors.price);
  const price = priceText ? parsePriceText(priceText) : 0;
  const description = pickText($, selectors.description) || og.description;

  let images = pickImages($, baseUrl, selectors.images);
  if (!images.length) images = og.images;

  const sizes = guessSizes($);
  const colors = guessColors($);
  const variants = buildVariants(sizes, colors, defaultSizes, defaultStock);

  return {
    sourceUrl,
    name,
    description,
    price,
    images,
    variants,
  };
}

export function extractProductLinks(
  html: string,
  pageUrl: string,
  selector?: string
): string[] {
  if (!selector) return [];
  const $ = cheerio.load(html);
  const { css, attr = 'href' } = parseSelectorAttr(selector);
  const links: string[] = [];
  $(css).each((_, el) => {
    const href = $(el).attr(attr);
    if (href) links.push(resolveUrl(pageUrl, href));
  });
  return [...new Set(links)];
}

/** Detecta la última página del listado (?page=N, /page/N, etc.). */
export function detectMaxListingPage(html: string): number {
  const $ = cheerio.load(html);
  let max = 1;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m =
      href.match(/[?&]page=(\d+)/i) ||
      href.match(/\/page\/(\d+)/i) ||
      href.match(/[?&]p=(\d+)/i);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return max;
}
