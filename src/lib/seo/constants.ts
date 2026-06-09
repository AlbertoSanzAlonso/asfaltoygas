export const SITE_URL = 'https://www.modasmelomerezco.es';
export const SITE_NAME = 'Modas Me lo Merezco';
export const SITE_LOGO = `${SITE_URL}/logo.png`;
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

/**
 * Detalles de envío para los datos estructurados de Offer (merchant listings).
 * Refleja la política real: 5,50 € por pedido, solo península, entrega en 24-48 h laborables.
 */
export const OFFER_SHIPPING_DETAILS = {
  '@type': 'OfferShippingDetails',
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: 5.5,
    currency: 'EUR',
  },
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'ES',
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: {
      '@type': 'QuantitativeValue',
      minValue: 0,
      maxValue: 1,
      unitCode: 'DAY',
    },
    transitTime: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 2,
      unitCode: 'DAY',
    },
  },
} as const;

/**
 * Política de devoluciones para los datos estructurados de Offer (merchant listings).
 * Refleja la política real: 14 días naturales, gastos de devolución a cargo del cliente.
 */
export const MERCHANT_RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'ES',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 14,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/ReturnShippingFees',
} as const;
