import type { ScrapedProduct, ScrapedVariant } from './types.js';

type JsonLd = Record<string, unknown>;

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parsePrice(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const n = parseFloat(raw.replace(/[^\d.,]/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function collectJsonLdBlocks(html: string): JsonLd[] {
  const blocks: JsonLd[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      /* ignorar JSON-LD inválido */
    }
  }
  return blocks;
}

function flattenGraph(nodes: JsonLd[]): JsonLd[] {
  const out: JsonLd[] = [];
  for (const node of nodes) {
    out.push(node);
    const graph = node['@graph'];
    if (Array.isArray(graph)) out.push(...(graph as JsonLd[]));
  }
  return out;
}

function isProductType(type: unknown): boolean {
  const types = asArray(type).map(String);
  return types.some((t) => t.toLowerCase().includes('product'));
}

function extractImages(node: JsonLd): string[] {
  const imgs = asArray(node.image).flatMap((img) => {
    if (typeof img === 'string') return [img];
    if (img && typeof img === 'object' && 'url' in img) return [String((img as { url: string }).url)];
    return [];
  });
  return [...new Set(imgs.filter(Boolean))];
}

function extractOfferPrice(node: JsonLd): number | null {
  const offers = node.offers;
  for (const offer of asArray(offers as JsonLd | JsonLd[])) {
    if (!offer || typeof offer !== 'object') continue;
    const o = offer as JsonLd;
    const low = parsePrice(o.lowPrice);
    const high = parsePrice(o.highPrice);
    const price = parsePrice(o.price);
    if (price != null) return price;
    if (low != null && high != null) return (low + high) / 2;
    if (low != null) return low;
    if (high != null) return high;
  }
  return parsePrice(node.price);
}

function extractVariantsFromOffers(node: JsonLd, defaultStock: number): ScrapedVariant[] {
  const variants: ScrapedVariant[] = [];
  for (const offer of asArray(node.offers as JsonLd | JsonLd[])) {
    if (!offer || typeof offer !== 'object') continue;
    const o = offer as JsonLd;
    const sku = o.sku ? String(o.sku) : undefined;
    const size =
      (o.size as string) ||
      (o.name as string) ||
      (sku ? `SKU ${sku}` : 'Única');
    const price = parsePrice(o.price);
    variants.push({
      size: String(size).trim() || 'Única',
      stock: defaultStock,
      sku,
      color: null,
    });
    void price;
  }
  return variants;
}

export function extractFromJsonLd(
  html: string,
  sourceUrl: string,
  defaultStock = 0
): ScrapedProduct | null {
  const nodes = flattenGraph(collectJsonLdBlocks(html));
  const productNode = nodes.find((n) => isProductType(n['@type']));
  if (!productNode) return null;

  const name = String(productNode.name || '').trim();
  if (!name) return null;

  const price = extractOfferPrice(productNode);
  const images = extractImages(productNode);
  const description = String(productNode.description || '').trim();
  const brand =
    typeof productNode.brand === 'object' && productNode.brand !== null
      ? String((productNode.brand as { name?: string }).name || '')
      : String(productNode.brand || '');

  let variants = extractVariantsFromOffers(productNode, defaultStock);
  if (variants.length === 0) {
    variants = [{ size: 'Única', color: null, stock: defaultStock }];
  }

  return {
    sourceUrl,
    name,
    description,
    price: price ?? 0,
    brand: brand || undefined,
    sku: productNode.sku ? String(productNode.sku) : undefined,
    images,
    variants,
  };
}
