import type { Product, ProductImage } from '@/types';

const HIGH_QUALITY_PREFIX = 'products/cascos/';

function isHighQuality(url: string): boolean {
  return url.includes(HIGH_QUALITY_PREFIX);
}

/** Agrupa filas de product_images por color_id. Solo incluye imágenes de alta calidad (products/cascos/). */
export function buildImagesByColor(rows: ProductImage[]): Record<number | null, string[]> {
  const buckets = new Map<number | null, ProductImage[]>();

  for (const row of rows) {
    const list = buckets.get(row.color_id ?? null) ?? [];
    list.push(row);
    buckets.set(row.color_id ?? null, list);
  }

  const out: Record<number | null, string[]> = {};
  for (const [colorId, list] of buckets) {
    const highQuality = list.filter((r) => isHighQuality(r.image_url));
    const sorted = highQuality.length > 0 ? highQuality : list;
    sorted.sort((a, b) => {
      if (a.is_main !== b.is_main) return a.is_main ? -1 : 1;
      return (a.orden ?? 0) - (b.orden ?? 0);
    });
    out[colorId] = sorted.map((r) => r.image_url);
  }
  return out;
}

/** Galería visible según color seleccionado (fallback a imágenes generales). */
export function getImagesForColor(
  product: Pick<Product, 'images' | 'imagesByColor'>,
  colorId: number | null | undefined
): string[] {
  if (colorId != null && product.imagesByColor?.[colorId]?.length) {
    return product.imagesByColor[colorId];
  }
  const first = Object.values(product.imagesByColor ?? {})[0];
  if (first?.length) return first;
  return product.images?.length ? product.images : [];
}
