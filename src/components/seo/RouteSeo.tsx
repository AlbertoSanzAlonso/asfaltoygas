import { useLocation } from 'react-router-dom';
import { SeoHelmet } from './SeoHelmet';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_LOGO,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo/constants';
import { BRAND } from '@/lib/brand';

const STATIC_PAGES: Record<
  string,
  { title?: string; description: string }
> = {
  '/': {
    description: DEFAULT_DESCRIPTION,
  },
  '/categoria/cascos': {
    title: 'Cascos de moto',
    description:
      'Cascos integrales, modulares, jet y off-road de HJC, AGV, Shoei, Nolan y más. Homologados ECE 22.06 con envío gratuito desde 50 €.',
  },
  '/categoria/equipacion': {
    title: 'Equipación motera',
    description:
      'Chaquetas, guantes, botas y pantalones para moto. Equipación de carretera y off-road con envío gratuito desde 50 €.',
  },
  '/categoria/accesorios': {
    title: 'Accesorios para moto',
    description:
      'Accesorios y complementos para tu moto: intercomunicadores, mochilas, protecciones y más en Asfalto y Gas.',
  },
  '/conocenos': {
    title: 'Conócenos',
    description:
      'Conoce Asfalto y Gas: Equipamiento para motorista con asesoramiento experto.',
  },
  '/envios': {
    title: 'Envíos',
    description:
      'Información de envíos de Asfalto y Gas. Envío gratuito en pedidos superiores a 50 €. Entrega en 48 h.',
  },
  '/devoluciones': {
    title: 'Devoluciones y cambios',
    description:
      'Política de devoluciones y cambios de Asfalto y Gas. 14 días naturales desde la recepción del pedido.',
  },
  '/condiciones-venta': {
    title: 'Condiciones de venta',
    description: 'Condiciones generales de compra en la tienda online Asfalto y Gas.',
  },
  '/aviso-legal': {
    title: 'Aviso legal',
    description: 'Aviso legal e información del titular del sitio web Asfalto y Gas.',
  },
  '/politica-de-privacidad': {
    title: 'Política de privacidad',
    description: 'Política de privacidad y protección de datos de Asfalto y Gas.',
  },
  '/cookies': {
    title: 'Política de cookies',
    description: 'Información sobre el uso de cookies en asfaltoygas.es.',
  },
};

const NOINDEX_PATHS = [
  '/checkout',
  '/confirmar-suscripcion',
  '/desuscribir',
  '/favoritos',
];

const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: SITE_NAME,
  url: SITE_URL,
  logo: SITE_LOGO,
  image: DEFAULT_OG_IMAGE,
  description: DEFAULT_DESCRIPTION,
  priceRange: '€€',
  telephone: BRAND.phone,
  email: BRAND.email,
  sameAs: [
    BRAND.social.instagram,
    BRAND.social.tiktok,
    BRAND.social.facebook,
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: BRAND.address.street,
    addressLocality: BRAND.address.city,
    addressRegion: BRAND.address.region,
    postalCode: BRAND.address.postalCode,
    addressCountry: BRAND.address.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 36.5961,
    longitude: -4.5708,
  },
};

/** SEO por ruta para páginas estáticas de la tienda (producto y categoría lo gestionan sus páginas). */
export function RouteSeo() {
  const { pathname } = useLocation();

  if (pathname.startsWith('/producto/') || pathname.startsWith('/categoria/')) {
    return null;
  }

  const noindex = NOINDEX_PATHS.some((p) => pathname.startsWith(p));
  const page = STATIC_PAGES[pathname];

  return (
    <SeoHelmet
      path={pathname}
      title={page?.title}
      description={page?.description}
      noindex={noindex}
      jsonLd={pathname === '/' ? HOME_JSON_LD : undefined}
    />
  );
}
