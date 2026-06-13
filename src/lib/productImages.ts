import type { Product, ProductImage } from '@/types';

/** Agrupa filas de product_images por color_id. */
export function buildImagesByColor(rows: ProductImage[]): Record<number, string[]> {
  const buckets = new Map<number, ProductImage[]>();

  for (const row of rows) {
    if (row.color_id == null) continue;
    const list = buckets.get(row.color_id) ?? [];
    list.push(row);
    buckets.set(row.color_id, list);
  }

  const out: Record<number, string[]> = {};
  for (const [colorId, list] of buckets) {
    out[colorId] = list
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((r) => r.image_url);
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
    const first = Object.values(product.imagesByColor)[0];
    if (first?.length) return first;
  }
  return product.images?.length ? product.images : [];
}
