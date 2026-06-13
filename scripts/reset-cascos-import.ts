/**
 * Borra productos de la categoría Cascos para reimportar con colores.
 * Uso: npx tsx scripts/reset-cascos-import.ts
 */
import 'dotenv/config';
import { getServiceSupabase } from './scrape/images.js';

async function main() {
  const supabase = getServiceSupabase();

  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', 'Cascos')
    .maybeSingle();

  if (!cat) {
    console.log('No hay categoría Cascos.');
    return;
  }

  const { data: products, error: listErr } = await supabase
    .from('products')
    .select('product_id, name')
    .eq('category_id', cat.id);

  if (listErr) throw listErr;
  if (!products?.length) {
    console.log('No hay productos en Cascos.');
    return;
  }

  const ids = products.map((p) => p.product_id);
  console.log(`Borrando ${ids.length} productos de Cascos…`);

  const { error: delErr } = await supabase.from('products').delete().eq('category_id', cat.id);
  if (delErr) throw delErr;

  const { count: colorCount } = await supabase
    .from('colors')
    .select('*', { count: 'exact', head: true })
    .neq('name', 'Neutro');

  if (colorCount && colorCount > 0) {
    const { error: colorErr } = await supabase.from('colors').delete().neq('name', 'Neutro');
    if (colorErr) console.warn('No se pudieron limpiar colores huérfanos:', colorErr.message);
    else console.log(`Colores extra eliminados (se mantiene Neutro).`);
  }

  console.log(`✓ ${ids.length} productos eliminados. Listo para reimportar.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
