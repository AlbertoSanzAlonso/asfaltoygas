/** Identidad de marca — Asfalto y Gas */
export const BRAND = {
  name: 'Asfalto y Gas',
  shortName: 'Asfalto y Gas',
  tagline: 'Equipamiento para motorista',
  description:
    'Tienda online especializada en cascos de moto, equipación y accesorios. Marcas líderes como HJC, AGV, Shoei y más. Envío rápido en toda España.',
  email: 'asfaltoygasatclient@gmail.com',
  phone: '+34 642 181 821',
  phoneDisplay: '642 181 821',
  whatsapp: '34642181821',
  url: 'https://www.asfaltoygas.es',
  /** Datos LSSI / RGPD (titular autónomo) */
  legal: {
    holderName: 'Manuel Jiménez Medrano',
    taxId: '77238951Y',
    taxIdLabel: 'DNI',
    contactEmail: 'asfaltoygasatclient@gmail.com',
  },
  address: {
    street: 'Calle Las Flores, 20',
    city: 'Benalmádena',
    region: 'Málaga',
    postalCode: '29631',
    country: 'ES',
  },
  social: {
    instagram: 'https://www.instagram.com/asfaltoygas/',
    tiktok: 'https://www.tiktok.com/@asfaltoygas',
    facebook: 'https://www.facebook.com/profile.php?id=61585035781061',
  },
  categories: {
    cascos: { slug: 'cascos', label: 'Cascos' },
    equipaje: { slug: 'equipaje', label: 'Equipaje' },
    'aceites-y-lubricantes': { slug: 'aceites-y-lubricantes', label: 'Aceites y lubricantes' },
    mantenimiento: { slug: 'mantenimiento', label: 'Mantenimiento' },
    merchandising: { slug: 'merchandising', label: 'Merchandising' },
    equipacion: { slug: 'equipacion', label: 'Equipación' },
  },
  helmetBrands: [
    'HJC', 'AGV', 'Shoei', 'Nolan', 'X-Lite', 'Airoh',
    'Bell', 'Scorpion', 'MT Helmets', 'Caberg', 'Shark',
  ],
} as const;
