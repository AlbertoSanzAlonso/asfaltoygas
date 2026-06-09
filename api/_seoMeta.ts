import { createClient } from '@supabase/supabase-js';
import { getCanonicalSiteUrl } from './_siteUrl.js';

const SITE_URL = getCanonicalSiteUrl();
const SITE_NAME = 'Modas Me lo Merezco';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_TITLE = `${SITE_NAME} | Tienda online de moda para mujer`;
const DEFAULT_DESCRIPTION =
  'Tienda online de moda para mujer. Ropa, vestidos, bolsos y complementos de tendencia. Descubre colecciones exclusivas en Modas Me lo Merezco.';

export type SeoPageMeta = {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  noindex: boolean;
  type: 'website' | 'product';
};

const STATIC_PAGES: Record<string, { title?: string; description: string }> = {
  '/': { description: DEFAULT_DESCRIPTION },
  '/categoria/ropa': {
    title: 'Ropa de mujer',
    description:
      'Colección de ropa de mujer: vestidos, blusas, pantalones y más. Moda actual con envío gratuito desde 50 € en Modas Me lo Merezco.',
  },
  '/categoria/complementos': {
    title: 'Complementos de moda',
    description:
      'Complementos y accesorios de moda para mujer. Descubre piezas únicas con envío gratuito desde 50 €.',
  },
  '/categoria/bolsos': {
    title: 'Bolsos y accesorios',
    description:
      'Bolsos y accesorios de mujer. Estilo y calidad en Modas Me lo Merezco. Envío gratuito desde 50 €.',
  },
  '/conocenos': {
    title: 'Conócenos',
    description:
      'Conoce Modas Me lo Merezco: moda para la mujer real, con piezas seleccionadas con mimo y las últimas tendencias.',
  },
  '/envios': {
    title: 'Envíos',
    description:
      'Información de envíos de Modas Me lo Merezco. Envío gratuito en pedidos superiores a 50 €. Entrega en 48 h.',
  },
  '/devoluciones': {
    title: 'Devoluciones y cambios',
    description:
      'Política de devoluciones y cambios de Modas Me lo Merezco. 14 días naturales desde la recepción del pedido.',
  },
  '/condiciones-venta': {
    title: 'Condiciones de venta',
    description: 'Condiciones generales de compra en la tienda online Modas Me lo Merezco.',
  },
  '/aviso-legal': {
    title: 'Aviso legal',
    description: 'Aviso legal e información del titular del sitio web Modas Me lo Merezco.',
  },
  '/politica-de-privacidad': {
    title: 'Política de privacidad',
    description: 'Política de privacidad y protección de datos de Modas Me lo Merezco.',
  },
  '/cookies': {
    title: 'Política de cookies',
    description: 'Información sobre el uso de cookies en modasmelomerezco.es.',
  },
};

const NOINDEX_PATHS = [
  '/checkout',
  '/confirmar-suscripcion',
  '/desuscribir',
  '/favoritos',
  '/login',
  '/registro',
  '/recuperar-password',
  '/reset-password',
  '/admin',
  '/cuenta',
];

function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return DEFAULT_TITLE;
  return `${pageTitle} | ${SITE_NAME}`;
}

function truncateDescription(text: string, maxLength = 155): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}

function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getProductMeta(productId: string): Promise<SeoPageMeta | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: product } = await supabase
    .from('products')
    .select('product_id, name, description, price, is_published, product_images(image_url)')
    .eq('product_id', productId)
    .eq('is_published', true)
    .maybeSingle();

  if (!product) return null;

  const name = (product.name || '').toLowerCase();
  if (name.includes('test') || name.includes('prueba')) return null;

  const images = (product.product_images as { image_url?: string }[] | null) ?? [];
  const firstImage = images[0]?.image_url;
  const ogImage = firstImage
    ? firstImage.startsWith('http')
      ? firstImage
      : absoluteUrl(firstImage)
    : DEFAULT_OG_IMAGE;

  const description = truncateDescription(
    product.description ||
      `${product.name}. Precio ${Number(product.price).toFixed(2)} €. Compra online en Modas Me lo Merezco.`,
  );

  const path = `/producto/${product.product_id}`;

  return {
    title: buildTitle(product.name),
    description,
    canonical: absoluteUrl(path),
    ogImage,
    noindex: false,
    type: 'product',
  };
}

async function getCategoryMeta(slug: string): Promise<SeoPageMeta | null> {
  const path = `/categoria/${slug}`;
  const page = STATIC_PAGES[path];
  if (!page) return null;

  return {
    title: buildTitle(page.title),
    description: page.description,
    canonical: absoluteUrl(path),
    ogImage: DEFAULT_OG_IMAGE,
    noindex: false,
    type: 'website',
  };
}

/** Resuelve meta SEO para una ruta pública de la tienda (usado por middleware). */
export async function getSeoMetaForPath(pathname: string): Promise<SeoPageMeta | null> {
  const path = pathname.split('?')[0] || '/';

  if (NOINDEX_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonical: absoluteUrl(path),
      ogImage: DEFAULT_OG_IMAGE,
      noindex: true,
      type: 'website',
    };
  }

  const productMatch = path.match(/^\/producto\/([^/]+)$/);
  if (productMatch) {
    return getProductMeta(productMatch[1]);
  }

  const categoryMatch = path.match(/^\/categoria\/([^/]+)$/);
  if (categoryMatch) {
    return getCategoryMeta(categoryMatch[1]);
  }

  const staticPage = STATIC_PAGES[path];
  if (staticPage) {
    return {
      title: buildTitle(staticPage.title),
      description: staticPage.description,
      canonical: absoluteUrl(path),
      ogImage: DEFAULT_OG_IMAGE,
      noindex: false,
      type: 'website',
    };
  }

  return null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}
