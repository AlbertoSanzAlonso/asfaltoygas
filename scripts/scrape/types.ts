/** Producto extraído de una página de proveedor (antes de subir a Supabase). */
export interface ScrapedVariant {
  size: string;
  color?: string | null;
  colorHex?: string | null;
  stock?: number;
  sku?: string;
}

export interface ScrapedProduct {
  sourceUrl: string;
  name: string;
  description: string;
  price: number;
  brand?: string;
  sku?: string;
  /** URLs absolutas de imágenes remotas */
  images: string[];
  variants?: ScrapedVariant[];
  /** Subcategoría detectada (ej. Integral, Deportivo, Infantil) */
  subcategory?: string;
  /** Fabricante (ej. AGV, HJC) */
  brand?: string;
}

export interface ProviderSelectors {
  title?: string;
  price?: string;
  description?: string;
  /** Selector CSS; usa @src o @href para atributo */
  images?: string;
  /** Enlaces a fichas de producto en listados */
  productLinks?: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl?: string;
  selectors?: ProviderSelectors;
  /** Tallas por defecto si la página no las expone (cascos, ropa, etc.) */
  defaultSizes?: string[];
}

export interface ImportOptions {
  category: string;
  subcategory?: string;
  brand?: string;
  defaultStock?: number;
  isPublished?: boolean;
  isNew?: boolean;
  dryRun?: boolean;
  /** Si true, omite productos cuyo nombre ya existe en BD */
  skipExisting?: boolean;
  /** Margen sobre PVP proveedor (ej. 1.15 = +15%) */
  priceMultiplier?: number;
}

export interface ImportResult {
  productId?: string;
  name: string;
  sourceUrl: string;
  imageCount: number;
  variantCount: number;
  subcategory?: string;
  brand?: string;
  dryRun: boolean;
  skipped?: boolean;
  error?: string;
}
