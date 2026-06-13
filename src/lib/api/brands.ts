
import { supabase } from '../supabase';
import { isSupabaseConfigured } from '../supabaseConfig';

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export const brands = {
  getAll: async (): Promise<Brand[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('brands')
      .select('id, name, slug')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /** Marcas con al menos un producto publicado en la categoría (opcionalmente subcategoría). */
  getByCategory: async (
    categoryId: number,
    subcategoryId?: number
  ): Promise<Brand[]> => {
    if (!isSupabaseConfigured()) return [];

    let query = supabase
      .from('products')
      .select('brand_id, brands(id, name, slug)')
      .eq('category_id', categoryId)
      .eq('is_published', true)
      .not('brand_id', 'is', null);

    if (subcategoryId) query = query.eq('subcategory_id', subcategoryId);

    const { data, error } = await query;

    if (!error) {
      const byId = new Map<number, Brand>();
      for (const row of data || []) {
        const b = row.brands as Brand | null;
        if (b?.id) byId.set(b.id, b);
      }
      return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }

    const msg = `${error.message || ''}`.toLowerCase();
    const brandsJoinMissing =
      error.code === 'PGRST205' ||
      error.code === '42P01' ||
      msg.includes('brands') ||
      msg.includes('does not exist');

    if (!brandsJoinMissing) throw error;

    let idQuery = supabase
      .from('products')
      .select('brand_id')
      .eq('category_id', categoryId)
      .eq('is_published', true)
      .not('brand_id', 'is', null);

    if (subcategoryId) idQuery = idQuery.eq('subcategory_id', subcategoryId);

    const { data: idRows, error: idError } = await idQuery;
    if (idError) throw idError;

    const brandIds = [...new Set((idRows || []).map((r) => r.brand_id).filter(Boolean))] as number[];
    if (brandIds.length === 0) return [];

    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, slug')
      .in('id', brandIds)
      .order('name');

    if (brandsError) throw brandsError;
    return brands || [];
  },
};
