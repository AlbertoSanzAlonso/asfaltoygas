import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './supabaseConfig';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL?.trim() || 'https://placeholder-project.supabase.co';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || 'placeholder-key';
    client = createClient(url, key);
  }
  return client;
}

/** Cliente Supabase; las consultas deben comprobar `isSupabaseConfigured()` antes. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop);
  },
});

export { isSupabaseConfigured };
