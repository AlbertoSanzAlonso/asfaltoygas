/** Identidad de marca — Asfalto y Gas */
export const BRAND = {
  name: 'Asfalto y Gas',
  shortName: 'Asfalto y Gas',
  tagline: 'Equipamiento para motorista',
  description:
    'Tienda online especializada en cascos de moto, equipación y accesorios. Marcas líderes como HJC, AGV, Shoei y más. Envío rápido en toda España.',
  email: 'info@asfaltoygas.es',
  phone: '+34 685 011 494',
  phoneDisplay: '685 011 494',
  whatsapp: '34685011494',
  url: 'https://www.asfaltoygas.es',
  address: {
    street: 'Calle Aragón, 2, Local 2',
    city: 'Benalmádena',
    region: 'Málaga',
    postalCode: '29631',
    country: 'ES',
  },
  social: {
    instagram: 'https://www.instagram.com/asfaltoygas',
    tiktok: 'https://www.tiktok.com/@asfaltoygas',
    facebook: 'https://www.facebook.com/asfaltoygas',
  },
  categories: {
    cascos: { slug: 'cascos', label: 'Cascos' },
    equipaje: { slug: 'equipaje', label: 'Equipaje' },
    'aceites-y-lubricantes': { slug: 'aceites-y-lubricantes', label: 'Aceites y lubricantes' },
    mantenimiento: { slug: 'mantenimiento', label: 'Mantenimiento' },
  },
  helmetBrands: [
    'HJC', 'AGV', 'Shoei', 'Nolan', 'X-Lite', 'Airoh',
    'Bell', 'Scorpion', 'MT Helmets', 'Caberg', 'Shark',
  ],
} as const;
