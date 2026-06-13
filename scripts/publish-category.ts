/**
 * Publica todos los productos de una categoría (por defecto Cascos).
 * Uso: npx tsx scripts/publish-category.ts [Cascos]
 */
import 'dotenv/config';
import { getServiceSupabase } from './scrape/images.js';

async function main() {
  const categoryName = process.argv[2] || 'Cascos';
  const supabase = getServiceSupabase();

  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', categoryName)
    .maybeSingle();

  if (!cat) {
    console.error(`Categoría no encontrada: ${categoryName}`);
    process.exit(1);
  }

  const { data, error } = await supabase
    .from('products')
    .update({ is_published: true })
    .eq('category_id', cat.id)
    .eq('is_published', false)
    .select('product_id');

  if (error) throw error;
  console.log(`✓ ${data?.length ?? 0} productos publicados en "${categoryName}"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
