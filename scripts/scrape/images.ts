import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import type { ScrapedProduct } from './types.js';
import { resolveUrl } from './fetch-page.js';

const BUCKET = 'products';

function extFromContentType(ct: string | null, url: string): string {
  if (ct?.includes('png')) return 'png';
  if (ct?.includes('webp')) return 'webp';
  if (ct?.includes('gif')) return 'gif';
  if (ct?.includes('jpeg') || ct?.includes('jpg')) return 'jpg';
  const m = url.match(/\.(jpe?g|png|webp|gif)(\?|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export async function downloadImage(url: string, referer?: string): Promise<{ buffer: Buffer; contentType: string }> {
  const sizeMatch = url.match(/_(\d+)\.(webp|jpe?g|png)(\?|$)/i);
  const candidates: string[] = [];
  if (sizeMatch) {
    const suffix = sizeMatch[0];
    const ext = sizeMatch[2];
    const tail = suffix.slice((`_${sizeMatch[1]}.${ext}`).length); // keeps optional query or end marker
    const preferredSizes = [1080, 800, 640, 480, 320, 200, 120, 80, 60];
    for (const size of preferredSizes) {
      candidates.push(url.replace(/_(\d+)\.(webp|jpe?g|png)(\?|$)/i, `_${size}.${ext}${tail}`));
    }
  }
  candidates.push(url);

  const seen = new Set<string>();
  const uniqueCandidates = candidates.filter((candidate) => {
    if (seen.has(candidate)) return false;
    seen.add(candidate);
    return true;
  });

  let lastError: Error | null = null;
  for (const candidate of uniqueCandidates) {
    try {
      const res = await fetch(candidate, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          ...(referer ? { Referer: referer } : {}),
        },
        redirect: 'follow',
      });
      if (!res.ok) {
        lastError = new Error(`Imagen HTTP ${res.status}: ${candidate}`);
        continue;
      }
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 500) {
        lastError = new Error(`Imagen demasiado pequeña: ${candidate}`);
        continue;
      }
      return { buffer, contentType };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error(`No se pudo descargar imagen: ${url}`);
}

export async function uploadImagesToStorage(
  supabase: SupabaseClient,
  productName: string,
  imageUrls: string[],
  sourceUrl?: string
): Promise<string[]> {
  const slug = slugify(productName) || 'producto';
  const uploaded: string[] = [];
  const base = sourceUrl || imageUrls[0] || '';

  for (let i = 0; i < imageUrls.length; i++) {
    const remoteUrl = imageUrls[i].startsWith('http')
      ? imageUrls[i]
      : resolveUrl(base, imageUrls[i]);
    try {
      const { buffer, contentType } = await downloadImage(remoteUrl, sourceUrl || base);
      const ext = extFromContentType(contentType, remoteUrl);
      const filePath = `import/${slug}-${randomBytes(4).toString('hex')}-${i + 1}.${ext}`;

      const { error } = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
        contentType,
        upsert: true,
        cacheControl: '3600',
      });
      if (error) throw error;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      uploaded.push(data.publicUrl);
      console.log(`  ✓ imagen ${i + 1}/${imageUrls.length}`);
    } catch (err) {
      console.warn(`  ✗ imagen ${i + 1}:`, err instanceof Error ? err.message : err);
    }
  }

  if (!uploaded.length) {
    throw new Error('No se pudo subir ninguna imagen a Supabase Storage');
  }

  return uploaded;
}

export function getServiceSupabase(): SupabaseClient {
  const url = process.env.VITE_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function productExistsByName(
  supabase: SupabaseClient,
  name: string
): Promise<boolean> {
  const { data } = await supabase
    .from('products')
    .select('product_id')
    .ilike('name', name)
    .maybeSingle();
  return !!data;
}

export type DbVariantRow = {
  size: string;
  color_id: number | null;
  stock: number;
};

export async function resolveColorId(
  supabase: SupabaseClient,
  colorName: string | null | undefined,
  hex?: string | null
): Promise<number | null> {
  if (!colorName?.trim()) return null;
  const name = colorName.trim();
  const { data: existing } = await supabase
    .from('colors')
    .select('id')
    .ilike('name', name)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('colors')
    .insert([{ name, hex: hex || '#6B7280' }])
    .select('id')
    .single();
  if (error) {
    if (error.code === '23505') {
      const { data: again } = await supabase.from('colors').select('id').ilike('name', name).maybeSingle();
      return again?.id ?? null;
    }
    throw error;
  }
  return created.id;
}

export async function buildDbVariants(
  supabase: SupabaseClient,
  scraped: ScrapedProduct
): Promise<{ variants: DbVariantRow[]; colorIds: number[] }> {
  const rows = scraped.variants?.length
    ? scraped.variants
    : [{ size: 'Única', color: null, stock: 0 }];

  const variants: DbVariantRow[] = [];
  const colorIds = new Set<number>();

  for (const v of rows) {
    const colorId = await resolveColorId(supabase, v.color, v.colorHex);
    if (colorId != null) colorIds.add(colorId);
    variants.push({
      size: v.size?.trim() || 'Única',
      color_id: colorId,
      stock: Math.max(0, v.stock ?? 0),
    });
  }

  return { variants, colorIds: [...colorIds] };
}
