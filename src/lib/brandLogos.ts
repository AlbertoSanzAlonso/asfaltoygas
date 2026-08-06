/** Escalas relativas de logos de marca (filtro de catálogo y carrusel home). */
export const BRAND_SCALES: Record<string, number> = {
  acerbis: 2.15,
  airoh: 1.3,
  alpinestars: 2.05,
  five: 2.35,
  givi: 0.7,
  hjc: 1.3,
  husqvarna: 1.55,
  ixon: 1.55,
  ktm: 1.55,
  ls2: 1.3,
  motul: 0.7,
  'mt-helmets': 1.3,
  nolan: 1.3,
  piaggio: 1.65,
  repsol: 1.55,
  revit: 0.7,
  shoei: 1.3,
  suomy: 1.3,
  thor: 0.7,
  'tucano-urbano': 1.55,
  arai: 0.5,
  caberg: 0.55,
  'gas-gas': 0.75,
  'unik-racing': 0.65,
};

export function getBrandLogoSize(
  slug: string,
  size: 'sm' | 'md' = 'sm',
  multiplier = 1,
): { height: number; maxWidth: number } {
  const baseHeight = size === 'sm' ? 34 : 50;
  const baseMaxWidth = size === 'sm' ? 110 : 160;
  const scale = (BRAND_SCALES[slug] ?? 1) * multiplier;
  return {
    height: Math.round(baseHeight * scale),
    maxWidth: Math.round(baseMaxWidth * scale),
  };
}
