import * as cheerio from 'cheerio';
import { HELMET_TYPE_MAP } from './helmet-types.js';

const TYPE_SLUGS = new Set(Object.keys(HELMET_TYPE_MAP));

/** Nombres canónicos de fabricantes moto */
export const KNOWN_BRANDS: Record<string, string> = {
  hjc: 'HJC',
  agv: 'AGV',
  shoei: 'Shoei',
  nolan: 'Nolan',
  'x-lite': 'X-Lite',
  xlite: 'X-Lite',
  airoh: 'Airoh',
  bell: 'Bell',
  scorpion: 'Scorpion',
  mt: 'MT Helmets',
  'mt-helmets': 'MT Helmets',
  caberg: 'Caberg',
  shark: 'Shark',
  axxis: 'Axxis',
  ls2: 'LS2',
  suomy: 'Suomy',
  dexter: 'Dexter',
  hebo: 'Hebo',
  alpinestars: 'Alpinestars',
  dainese: 'Dainese',
  acerbis: 'Acerbis',
  eteres: 'Eteres',
};

function slugifyBrand(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizeBrandName(raw: string): string {
  const key = raw.trim().toLowerCase();
  return KNOWN_BRANDS[key] ?? raw.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

// Marca desde enlaces familia-cascos-…/marca en El Motorista.
export function extractBrandFromHtml(html: string): string | null {
  const $ = cheerio.load(html);

  for (const el of $('a[href*="familia-cascos-"]').toArray()) {
    const href = $(el).attr('href') || '';
    const segments = href.split('/').filter(Boolean);
    const familiaIdx = segments.findIndex((s) => s.startsWith('familia-cascos-'));
    if (familiaIdx === -1) continue;
    const afterType = segments[familiaIdx + 1];
    if (afterType && !TYPE_SLUGS.has(afterType.toLowerCase())) {
      return normalizeBrandName(afterType);
    }
  }

  // /shop-motos/agv
  const shopBrand = $('a[href^="/shop-motos/"]')
    .map((_, el) => $(el).attr('href') || '')
    .get()
    .map((h) => h.replace(/^\/shop-motos\//, '').split('/')[0])
    .find((s) => s && KNOWN_BRANDS[s.toLowerCase()]);

  if (shopBrand) return normalizeBrandName(shopBrand);

  return null;
}

/** Marca desde nombre del producto: "Casco Agv K7 Genisys" → AGV */
export function extractBrandFromName(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [slug, label] of Object.entries(KNOWN_BRANDS)) {
    const re = new RegExp(`\\b${slug.replace(/-/g, '[\\s-]?')}\\b`, 'i');
    if (re.test(lower)) return label;
  }

  const m = name.match(/^Casco\s+([A-Za-z0-9][A-Za-z0-9-]*)/i);
  if (m) {
    const candidate = normalizeBrandName(m[1]);
    if (candidate.length >= 2 && candidate.length <= 20) return candidate;
  }

  return null;
}

export function resolveScrapedBrand(
  html: string,
  name: string,
  jsonLdBrand?: string
): string | null {
  return (
    extractBrandFromHtml(html) ||
    (jsonLdBrand ? normalizeBrandName(jsonLdBrand) : null) ||
    extractBrandFromName(name)
  );
}

export { slugifyBrand };
