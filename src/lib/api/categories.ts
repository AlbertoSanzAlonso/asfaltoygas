
import { supabase } from '../supabase';
import { isSupabaseConfigured } from '../supabaseConfig';
import type { Category, Subcategory } from '@/types';

/** Slugs de URL → nombre en BD */
const CATEGORY_SLUGS: Record<string, string> = {
  cascos: 'Cascos',
  equipacion: 'Equipación',
  accesorios: 'Accesorios',
};

function resolveCategoryName(input: string): string {
  const key = input.trim().toLowerCase();
  return CATEGORY_SLUGS[key] ?? input.trim();
}

export const categories = {
  getAll: async (): Promise<Category[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getByName: async (name: string): Promise<Category | null> => {
    if (!isSupabaseConfigured()) return null;

    const canonical = resolveCategoryName(name);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .ilike('name', canonical)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  },

  getSubcategories: async (categoryId?: number): Promise<Subcategory[]> => {
    if (!isSupabaseConfigured()) return [];

    let query = supabase
      .from('subcategories')
      .select('*')
      .order('id', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  createCategory: async (name: string): Promise<Category> => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  createSubcategory: async (name: string, category_id: number): Promise<Subcategory> => {
    const { data, error } = await supabase
      .from('subcategories')
      .insert([{ name, category_id }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
