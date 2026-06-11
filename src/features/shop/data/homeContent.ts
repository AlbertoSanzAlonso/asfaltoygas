export const HERO_SLIDES = [
  {
    id: 'visit',
    title: 'Visítanos',
    subtitle: 'Equipamiento para motorista',
    cta: 'Ver catálogo',
    href: '/categoria/cascos',
    image: '/assets/images/hero-moto.jpg',
  },
  {
    id: 'cascos',
    title: 'Cascos homologados',
    subtitle: 'Integrales, modulares y off-road',
    cta: 'Explorar cascos',
    href: '/categoria/cascos',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'equipacion',
    title: 'Equipación premium',
    subtitle: 'Protección certificada para cada ruta',
    cta: 'Ver equipación',
    href: '/categoria/equipacion',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
  },
] as const;

export const HERO_WIDGET = {
  badge: 'Destacado',
  title: 'HJC RPHA 12',
  subtitle: 'Máxima protección en carretera',
  price: 'Desde 349 €',
  cta: 'Ver oferta',
  href: '/categoria/cascos',
  image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=800&auto=format&fit=crop',
};

export const PROMO_BANNERS = [
  {
    id: 'envio',
    title: 'Envío gratuito',
    subtitle: 'En pedidos superiores a 50 €',
    href: '/envios',
    image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=1200&auto=format&fit=crop',
    accent: 'bg-primary',
  },
  {
    id: 'marcas',
    title: 'Marcas líderes',
    subtitle: 'HJC · AGV · Shoei · Nolan',
    href: '/#marcas',
    image: 'https://images.unsplash.com/photo-1558980664-769d59551b3d?q=80&w=1200&auto=format&fit=crop',
    accent: 'bg-secondary',
  },
  {
    id: 'asesoramiento',
    title: 'Asesoramiento experto',
    subtitle: 'Te ayudamos a elegir tu casco',
    href: '/conocenos',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop',
    accent: 'bg-secondary-light',
  },
] as const;

export const HOME_CATEGORIES = [
  {
    label: 'Cascos',
    href: '/categoria/cascos',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=800&auto=format&fit=crop',
  },
  {
    label: 'Chaquetas',
    href: '/categoria/equipacion',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
  },
  {
    label: 'Calzado',
    href: '/categoria/equipacion',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop',
  },
  {
    label: 'Guantes',
    href: '/categoria/equipacion',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
  },
  {
    label: 'Accesorios',
    href: '/categoria/accesorios',
    image: 'https://images.unsplash.com/photo-1558980664-769d59551b3d?q=80&w=800&auto=format&fit=crop',
  },
] as const;

export const BRAND_CAROUSEL = [
  { name: 'HJC', image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=600&auto=format&fit=crop' },
  { name: 'AGV', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28dc?q=80&w=600&auto=format&fit=crop' },
  { name: 'Shoei', image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=600&auto=format&fit=crop' },
  { name: 'Nolan', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop' },
  { name: 'Airoh', image: 'https://images.unsplash.com/photo-1558980664-769d59551b3d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Rev\'it!', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop' },
] as const;

export const TESTIMONIALS = [
  {
    name: 'Carlos M.',
    location: 'Málaga',
    text: 'Excelente asesoramiento para elegir mi casco integral. Envío rápido y producto impecable.',
    rating: 5,
  },
  {
    name: 'Laura R.',
    location: 'Sevilla',
    text: 'Gran variedad de marcas y precios competitivos. La chaqueta llegó en 48 h, tal como prometían.',
    rating: 5,
  },
  {
    name: 'Miguel A.',
    location: 'Córdoba',
    text: 'Tienda seria y profesional. Me ayudaron por WhatsApp a acertar con la talla del casco.',
    rating: 5,
  },
  {
    name: 'Elena P.',
    location: 'Granada',
    text: 'Repetiré sin duda. Equipación de calidad y atención al cliente de primer nivel.',
    rating: 5,
  },
] as const;
