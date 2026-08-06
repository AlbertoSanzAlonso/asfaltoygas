export const HERO_SLIDES = [
  {
    id: 'cascos',
    titleLeft: 'Protección',
    titleRight: 'certificada',
    subtitle: 'Cascos homologados ECE 22.06',
    href: '/categoria/cascos',
    image: '/assets/images/hero-moto.jpg',
  },
  {
    id: 'equipaje',
    titleLeft: 'Equipaje',
    titleRight: 'para moto',
    subtitle: 'Alforjas, maletas y bolsas de las mejores marcas',
    href: '/categoria/equipaje',
    image: 'https://images.unsplash.com/photo-1628035514544-ebd32b766089?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'ofertas',
    titleLeft: 'Top marcas',
    titleRight: 'mejor precio',
    subtitle: 'HJC · AGV · Shoei · Nolan · Airoh',
    href: '/#novedades',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=2070&auto=format&fit=crop',
  },
] as const;

export const WIDGET_SLIDES = [
  {
    id: 'visitanos',
    eyebrow: 'Equipamiento para motorista',
    title: 'Visítanos',
    subtitle: 'Equipamiento para motorista',
    cta: 'Ver catálogo',
    href: '/categoria/cascos',
    image: '/assets/images/hero-moto.jpg',
  },
  {
    id: 'cascos',
    eyebrow: 'Protección certificada',
    title: 'Cascos ECE 22.06',
    subtitle: 'HJC · AGV · Shoei · Nolan · Airoh',
    cta: 'Ver cascos',
    href: '/categoria/cascos',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'equipaje',
    eyebrow: 'Para cada ruta',
    title: 'Equipaje completo',
    subtitle: 'Alforjas, maletas y bolsas de las mejores marcas',
    cta: 'Ver equipaje',
    href: '/categoria/equipaje',
    image: 'https://images.unsplash.com/photo-1628035514544-ebd32b766089?q=80&w=2070&auto=format&fit=crop',
  },
] as const;

export const HERO_WIDGET = {
  badge: 'Destacado',
  title: 'HJC RPHA 12',
  subtitle: 'Máxima protección en carretera',
  price: 'Desde 349 €',
  cta: 'Ver oferta',
  href: '/categoria/cascos',
  image: 'https://images.unsplash.com/photo-1611004060674-7e8864bcb4e4?q=80&w=1200&auto=format&fit=crop',
} as const;

export const PROMO_BANNERS = [
  {
    id: 'envio',
    title: 'Envío gratuito',
    subtitle: 'En pedidos superiores a 50 €',
    href: '/envios',
    image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'marcas',
    title: 'Marcas líderes',
    subtitle: 'HJC · AGV · Shoei · Nolan',
    href: '/#marcas',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=800&auto=format&fit=crop',
    solid: true,
  },
  {
    id: 'asesoramiento',
    title: 'Asesoramiento experto',
    subtitle: 'Te ayudamos a elegir tu casco',
    href: '/conocenos',
    image: 'https://images.unsplash.com/photo-1600497934947-23786a93f382?q=80&w=800&auto=format&fit=crop',
  },
] as const;

export const NAV_CATEGORIES = [
  { label: 'Cascos', href: '/categoria/cascos' },
  { label: 'Equipación', href: '/categoria/equipacion' },
  { label: 'Equipaje', href: '/categoria/equipaje' },
  { label: 'Aceites y lubricantes', href: '/categoria/aceites-y-lubricantes' },
  { label: 'Mantenimiento', href: '/categoria/mantenimiento' },
] as const;

export const HOME_CATEGORIES = [
  { label: 'Cascos', href: '/categoria/cascos', image: '/assets/images/categories/cascos.webp', objectPosition: 'center 28%' },
  { label: 'Equipación', href: '/categoria/equipacion', image: '/assets/images/categories/chaquetas.jpg', objectPosition: 'center 35%' },
  { label: 'Equipaje', href: '/categoria/equipaje', image: '/assets/images/categories/equipaje.webp', objectPosition: 'center 35%' },
  { label: 'Aceites y lubricantes', href: '/categoria/aceites-y-lubricantes', image: '/assets/images/categories/accesorios.jpg', objectPosition: 'center 45%' },
  { label: 'Mantenimiento', href: '/categoria/mantenimiento', image: '/assets/images/categories/mantenimiento.webp', objectPosition: 'center 45%' },
] as const;

export const RIDING_STYLES = [
  { label: 'Racing', href: '/categoria/todas?tag=racing', image: 'https://images.unsplash.com/photo-1611004060674-7e8864bcb4e4?q=80&w=600&auto=format&fit=crop' },
  { label: 'Ciudad', href: '/categoria/todas?tag=ciudad', image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=600&auto=format&fit=crop' },
  { label: 'Off-road', href: '/categoria/todas?tag=off-road', image: 'https://images.unsplash.com/photo-1628035514544-ebd32b766089?q=80&w=600&auto=format&fit=crop' },
  { label: 'Sport', href: '/categoria/todas?tag=sport', image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=600&auto=format&fit=crop' },
  { label: 'Touring', href: '/categoria/todas?tag=touring', image: 'https://images.unsplash.com/photo-1600497934947-23786a93f382?q=80&w=600&auto=format&fit=crop' },
] as const;

export const ACCESSORY_HIGHLIGHTS = [
  { title: 'Alforjas', discount: '-15%', href: '/categoria/equipaje', image: 'https://images.unsplash.com/photo-1628035514544-ebd32b766089?q=80&w=800&auto=format&fit=crop' },
  { title: 'Maletas laterales', discount: '-20%', href: '/categoria/equipaje', image: '/assets/images/categories/maletas.jpg' },
  { title: 'Aceite de motor', discount: '-10%', href: '/categoria/aceites-y-lubricantes', image: '/assets/images/categories/accesorios.jpg' },
  { title: 'Líquido de freno', discount: '-20%', href: '/categoria/mantenimiento', image: '/assets/images/categories/guantes.jpg' },
] as const;

export const SERVICES = [
  { title: 'Seguimiento de pedido', href: '/cuenta/pedidos' },
  { title: 'Consulta de stock', href: '/conocenos' },
  { title: 'Cambio de talla', href: '/devoluciones' },
  { title: 'Programa de fidelidad', href: '/cuenta' },
] as const;

export const BRAND_LOGOS = [
  { name: 'HJC', slug: 'hjc', logo: '/assets/brands/hjc.png' },
  { name: 'AGV', slug: 'agv', logo: '/assets/brands/agv.png' },
  { name: 'Shoei', slug: 'shoei', logo: '/assets/brands/shoei.png' },
  { name: 'Nolan', slug: 'nolan', logo: '/assets/brands/nolan.png' },
  { name: 'Airoh', slug: 'airoh', logo: '/assets/brands/airoh.png' },
  { name: 'Shark', slug: 'shark', logo: '/assets/brands/shark.png' },
  { name: 'MT Helmets', slug: 'mt-helmets', logo: '/assets/brands/mt-helmets.png' },
  { name: 'Caberg', slug: 'caberg', logo: '/assets/brands/caberg.png' },
  { name: 'LS2', slug: 'ls2', logo: '/assets/brands/ls2.png' },
  { name: 'Arai', slug: 'arai', logo: '/assets/brands/arai.png' },
  { name: 'Alpinestars', slug: 'alpinestars', logo: '/assets/brands/alpinestars.png' },
  { name: 'Dainese', slug: 'dainese', logo: '/assets/brands/dainese.png' },
  { name: 'Five', slug: 'five', logo: '/assets/brands/five.png' },
  { name: 'Ixon', slug: 'ixon', logo: '/assets/brands/ixon.png' },
  { name: 'KTM', slug: 'ktm', logo: '/assets/brands/ktm.png' },
  { name: "Rev'it!", slug: 'revit', logo: '/assets/brands/revit.png' },
  { name: 'Seventy', slug: 'seventy', logo: '/assets/brands/seventy.png' },
  { name: 'Spidi', slug: 'spidi', logo: '/assets/brands/spidi.png' },
  { name: 'Thor', slug: 'thor', logo: '/assets/brands/thor.png' },
  { name: 'Tucano Urbano', slug: 'tucano-urbano', logo: '/assets/brands/tucano-urbano.png' },
  { name: 'Acerbis', slug: 'acerbis', logo: '/assets/brands/acerbis.png' },
  { name: 'Husqvarna', slug: 'husqvarna', logo: '/assets/brands/husqvarna.png' },
  { name: 'Oxford', slug: 'oxford', logo: '/assets/brands/oxford.png' },
  { name: 'Givi', slug: 'givi', logo: '/assets/brands/givi.png' },
  { name: 'GPR', slug: 'gpr', logo: '/assets/brands/gpr.png' },
  { name: 'Puig', slug: 'puig', logo: '/assets/brands/puig.png' },
  { name: 'Shad', slug: 'shad', logo: '/assets/brands/shad.png' },
  { name: 'SW-Motech', slug: 'sw-motech', logo: '/assets/brands/sw-motech.png' },
  { name: 'Castrol', slug: 'castrol', logo: '/assets/brands/castrol.png' },
  { name: 'Motorex', slug: 'motorex', logo: '/assets/brands/motorex.png' },
  { name: 'Motul', slug: 'motul', logo: '/assets/brands/motul.png' },
  { name: 'Repsol', slug: 'repsol', logo: '/assets/brands/repsol.png' },
  { name: 'Ferodo', slug: 'ferodo', logo: '/assets/brands/ferodo.png' },
  { name: 'Ipone', slug: 'ipone', logo: '/assets/brands/ipone.png' },
  { name: 'Xeramic', slug: 'xeramic', logo: '/assets/brands/xeramic.png' },
  { name: 'Suomy', slug: 'suomy', logo: '/assets/brands/suomy.png' },
  { name: 'Bell', slug: 'bell', logo: '/assets/brands/bell.png' },
  { name: 'Axxis', slug: 'axxis', logo: '/assets/brands/axxis.png' },
  { name: 'Unik Racing', slug: 'unik-racing', logo: '/assets/brands/unik-racing.png' },
  { name: 'Piaggio', slug: 'piaggio', logo: '/assets/brands/piaggio.png' },
] as const;

export const INFO_BAR_ITEMS = [
  'Envío gratuito desde 50 €',
  'Cascos homologados ECE 22.06',
  'Pago seguro con tarjeta o Bizum',
  'Devolución en 14 días',
] as const;
