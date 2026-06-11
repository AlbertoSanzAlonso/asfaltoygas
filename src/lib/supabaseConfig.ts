/** Proyecto Supabase de la tienda anterior — no usar. */
export const LEGACY_SUPABASE_HOST = 'aoyafhjpgmxcygqnklvl.supabase.co';

const PLACEHOLDER_URLS = [
  'your-project-id.supabase.co',
  'placeholder-project.supabase.co',
];

function readSupabaseUrl(): string {
  return (import.meta.env.VITE_SUPABASE_URL || '').trim();
}

function readSupabaseAnonKey(): string {
  return (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
}

/** true solo si hay credenciales válidas y no apuntan al proyecto legacy. */
export function isSupabaseConfigured(): boolean {
  const url = readSupabaseUrl();
  const key = readSupabaseAnonKey();
  if (!url || !key) return false;
  if (url.includes(LEGACY_SUPABASE_HOST)) return false;
  if (PLACEHOLDER_URLS.some((p) => url.includes(p))) return false;
  return true;
}

/** Oculta imágenes alojadas en el Supabase de la web anterior. */
export function isBlockedImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.includes(LEGACY_SUPABASE_HOST);
}

export function filterAllowedImageUrls(urls: string[]): string[] {
  return urls.filter((u) => u && !isBlockedImageUrl(u));
}
