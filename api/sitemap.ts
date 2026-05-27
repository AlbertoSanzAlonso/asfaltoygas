import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getCanonicalSiteUrl } from './_siteUrl';

const SITE_URL = getCanonicalSiteUrl();

type SitemapEntry = {
  loc: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
};

const STATIC_PAGES: SitemapEntry[] = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/categoria/ropa', changefreq: 'daily', priority: '0.9' },
  { loc: '/categoria/complementos', changefreq: 'daily', priority: '0.9' },
  { loc: '/categoria/bolsos', changefreq: 'daily', priority: '0.9' },
  { loc: '/conocenos', changefreq: 'monthly', priority: '0.6' },
  { loc: '/envios', changefreq: 'monthly', priority: '0.5' },
  { loc: '/devoluciones', changefreq: 'monthly', priority: '0.5' },
  { loc: '/condiciones-venta', changefreq: 'yearly', priority: '0.3' },
  { loc: '/aviso-legal', changefreq: 'yearly', priority: '0.3' },
  { loc: '/politica-de-privacidad', changefreq: 'yearly', priority: '0.3' },
  { loc: '/cookies', changefreq: 'yearly', priority: '0.3' },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const parts = [
        '  <url>',
        `    <loc>${escapeXml(`${SITE_URL}${entry.loc}`)}</loc>`,
      ];
      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
      parts.push('  </url>');
      return parts.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

function toLastmod(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const entries: SitemapEntry[] = [...STATIC_PAGES];

  if (supabaseUrl && serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey);
      const { data: products } = await supabase
        .from('products')
        .select('product_id, created_at, name')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      for (const product of products ?? []) {
        const name = (product.name || '').toLowerCase();
        if (name.includes('test') || name.includes('prueba')) continue;

        entries.push({
          loc: `/producto/${product.product_id}`,
          changefreq: 'weekly',
          priority: '0.8',
          lastmod: toLastmod(product.created_at),
        });
      }
    } catch (error) {
      console.error('[sitemap] Error fetching products:', error);
    }
  }

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(buildSitemapXml(entries));
}
