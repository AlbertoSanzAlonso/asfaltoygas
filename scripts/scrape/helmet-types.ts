import * as cheerio from 'cheerio';

/** Slug familia-cascos-* de El Motorista → nombre en subcategories */
export const HELMET_TYPE_MAP: Record<string, string> = {
  'cascos-jet': 'Jet',
  'cascos-integrales': 'Integral',
  'cascos-modulares': 'Modular',
  // Slugs antiguos compatibles con el Motorista
  jet: 'Jet',
  integrales: 'Integral',
  modulares: 'Modular',
  deportivo: 'Jet',
  cross: 'Jet',
  infantiles: 'Jet',
  'urbano-scooters': 'Jet',
  vintage: 'Jet',
  'trail-adventure': 'Jet',
};

const KNOWN_SLUGS = new Set(Object.keys(HELMET_TYPE_MAP));

/** Extrae tipo de casco desde enlaces familia-cascos-* (El Motorista y similares). */
export function extractHelmetTypeFromHtml(html: string): string | null {
  const $ = cheerio.load(html);
  const slugs: string[] = [];

  $('a[href*="familia-cascos-"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(/familia-cascos-([a-z0-9-]+)/i);
    if (m) slugs.push(m[1].toLowerCase());
  });

  for (const slug of slugs) {
    if (KNOWN_SLUGS.has(slug)) {
      return HELMET_TYPE_MAP[slug];
    }
  }

  // Breadcrumbs / texto visible
  const text = $('a')
    .map((_, el) => $(el).text().trim().toLowerCase())
    .get();
  for (const [slug, label] of Object.entries(HELMET_TYPE_MAP)) {
    if (text.some((t) => t === label.toLowerCase() || t === slug.replace(/-/g, ' '))) {
      return label;
    }
  }

  return null;
}

export function mapHelmetSlug(slug: string): string | null {
  return HELMET_TYPE_MAP[slug.toLowerCase()] ?? null;
}
