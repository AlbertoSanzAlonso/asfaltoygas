export const SITE_URL = 'https://www.modasmelomerezco.es';
export const SITE_NAME = 'Modas Me lo Merezco';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const GOOGLE_SITE_VERIFICATION =
  import.meta.env.VITE_GOOGLE_SITE_VERIFICATION?.trim() || '';

export const DEFAULT_TITLE = `${SITE_NAME} | Tienda online de moda para mujer`;
export const DEFAULT_DESCRIPTION =
  'Tienda online de moda para mujer. Ropa, vestidos, bolsos y complementos de tendencia. Descubre colecciones exclusivas en Modas Me lo Merezco.';

export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return DEFAULT_TITLE;
  return `${pageTitle} | ${SITE_NAME}`;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function truncateDescription(text: string, maxLength = 155): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}
