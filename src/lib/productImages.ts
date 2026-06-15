import type { Product, ProductImage } from '@/types';

/** Agrupa filas de product_images por color_id. Solo devuelve la mejor imagen por color. */
export function buildImagesByColor(rows: ProductImage[]): Record<number | null, string[]> {
  const buckets = new Map<number | null, ProductImage[]>();

  for (const row of rows) {
    const list = buckets.get(row.color_id ?? null) ?? [];
    list.push(row);
    buckets.set(row.color_id ?? null, list);
  }

  const out: Record<number | null, string[]> = {};
  for (const [colorId, list] of buckets) {
    const sorted = list.sort((a, b) => {
      if (a.is_main !== b.is_main) return a.is_main ? -1 : 1;
      return (a.orden ?? 0) - (b.orden ?? 0);
    });
    out[colorId] = [sorted[0].image_url];
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
  if (colorId == null && product.imagesByColor) {
    if (product.imagesByColor[null]?.length) return product.imagesByColor[null];
    const first = Object.values(product.imagesByColor)[0];
    if (first?.length) return first;
  }
  return product.images?.length ? product.images : [];
}
