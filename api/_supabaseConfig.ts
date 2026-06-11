/** Proyecto Supabase de la tienda anterior — no usar. */
export const LEGACY_SUPABASE_HOST = 'aoyafhjpgmxcygqnklvl.supabase.co';

const PLACEHOLDER_URLS = [
  'your-project-id.supabase.co',
  'placeholder-project.supabase.co',
];

export function isSupabaseConfigured(): boolean {
  const url = (process.env.VITE_SUPABASE_URL || '').trim();
  const key = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return false;
  if (url.includes(LEGACY_SUPABASE_HOST)) return false;
  if (PLACEHOLDER_URLS.some((p) => url.includes(p))) return false;
  return true;
}

export function getSupabaseUrl(): string | null {
  if (!isSupabaseConfigured()) return null;
  return (process.env.VITE_SUPABASE_URL || '').trim();
}
