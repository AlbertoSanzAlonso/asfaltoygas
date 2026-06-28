/**
 * Sugiere y asigna etiquetas de estilo (racing, ciudad, off-road, sport, touring)
 * usando señales de:
 * - name + description
 * - category + subcategory (si existen)
 *
 * Uso:
 *   npx tsx scripts/assign-style-tags.ts
 *   npx tsx scripts/assign-style-tags.ts --apply
 *   npx tsx scripts/assign-style-tags.ts --apply --min-score=4 --min-margin=2
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

type StyleSlug = 'racing' | 'ciudad' | 'off-road' | 'sport' | 'touring';

type StyleRule = {
  slug: StyleSlug;
  name: string;
  nameKeywords: string[];
  descriptionKeywords: string[];
  categoryKeywords: string[];
  subcategoryKeywords: string[];
};

type ProductRow = {
  product_id: string;
  name: string | null;
  description: string | null;
  categories?: { name?: string | null } | null;
  subcategories?: { name?: string | null } | null;
};

type ScoreBreakdown = {
  score: number;
  textScore: number;
  taxonomyScore: number;
  nameHits: string[];
  descriptionHits: string[];
  categoryHits: string[];
  subcategoryHits: string[];
};

type ProductSuggestion = {
  product_id: string;
  name: string;
  categoryName: string | null;
  subcategoryName: string | null;
  excludedByCategory: boolean;
  suggestedStyle: StyleSlug | null;
  score: number;
  secondScore: number;
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
};

const DEFAULT_MIN_SCORE = 3;
const DEFAULT_MIN_MARGIN = 1;
const NON_STYLE_DRIVEN_CATEGORIES = ['aceites y lubricantes', 'mantenimiento'];

const STYLE_RULES: StyleRule[] = [
  {
    slug: 'racing',
    name: 'Racing',
    nameKeywords: ['racing', 'circuito', 'competition', 'competicion', 'race', 'gp'],
    descriptionKeywords: [
      'circuito',
      'competicion',
      'competition',
      'pista',
      'sliders',
      'rodilla',
      'alta velocidad',
      'racing fit',
    ],
    categoryKeywords: ['cascos'],
    subcategoryKeywords: ['integral'],
  },
  {
    slug: 'ciudad',
    name: 'Ciudad',
    nameKeywords: ['urbano', 'ciudad', 'city', 'commuter', 'scooter'],
    descriptionKeywords: [
      'urbano',
      'ciudad',
      'uso diario',
      'trayectos cortos',
      'commuter',
      'scooter',
      'movilidad urbana',
    ],
    categoryKeywords: ['cascos'],
    subcategoryKeywords: ['jet'],
  },
  {
    slug: 'off-road',
    name: 'Off-road',
    nameKeywords: ['off-road', 'off road', 'enduro', 'cross', 'motocross', 'trail'],
    descriptionKeywords: [
      'off-road',
      'off road',
      'enduro',
      'cross',
      'motocross',
      'tierra',
      'campo',
      'trail',
      'aventura',
    ],
    categoryKeywords: ['cascos'],
    subcategoryKeywords: ['cross', 'enduro', 'trail'],
  },
  {
    slug: 'sport',
    name: 'Sport',
    nameKeywords: ['sport', 'deportivo', 'sport-touring'],
    descriptionKeywords: [
      'deportivo',
      'sport',
      'carretera',
      'prestaciones',
      'aerodinamico',
      'agresivo',
      'sport touring',
    ],
    categoryKeywords: ['cascos'],
    subcategoryKeywords: ['integral'],
  },
  {
    slug: 'touring',
    name: 'Touring',
    nameKeywords: ['touring', 'viaje', 'tourer', 'adventure touring'],
    descriptionKeywords: [
      'touring',
      'viaje',
      'larga distancia',
      'confort',
      '4 estaciones',
      'cuatro estaciones',
      'proteccion climatica',
      'ruta larga',
    ],
    categoryKeywords: ['equipaje', 'cascos'],
    subcategoryKeywords: [
      'modular',
      'alforjas',
      'bolsas sobredeposito',
      'maletas laterales',
      'maletas superiores',
      'fijaciones',
      'accesorios y recambios maletas',
    ],
  },
];

const argv = process.argv.slice(2);
const shouldApply = argv.includes('--apply');
const minScore = readNumericFlag('--min-score', DEFAULT_MIN_SCORE);
const minMargin = readNumericFlag('--min-margin', DEFAULT_MIN_MARGIN);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function readNumericFlag(flag: string, fallback: number): number {
  const hit = argv.find((arg) => arg.startsWith(`${flag}=`));
  if (!hit) return fallback;
  const value = Number(hit.split('=')[1]);
  return Number.isFinite(value) ? value : fallback;
}

function normalizeText(input: string | null | undefined): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectHits(text: string, keywords: string[]): string[] {
  return keywords.filter((kw) => text.includes(normalizeText(kw)));
}

function scoreProductByStyle(product: ProductRow): Record<StyleSlug, ScoreBreakdown> {
  const nameText = normalizeText(product.name);
  const descriptionText = normalizeText(product.description);
  const categoryText = normalizeText(product.categories?.name);
  const subcategoryText = normalizeText(product.subcategories?.name);
  const scores = {} as Record<StyleSlug, ScoreBreakdown>;

  for (const style of STYLE_RULES) {
    const nameHits = collectHits(nameText, style.nameKeywords);
    const descriptionHits = collectHits(descriptionText, style.descriptionKeywords);
    const categoryHits = collectHits(categoryText, style.categoryKeywords);
    const subcategoryHits = collectHits(subcategoryText, style.subcategoryKeywords);
    const textScore = nameHits.length * 3 + descriptionHits.length;
    const taxonomyScore = categoryHits.length + subcategoryHits.length * 3;
    const score = textScore + taxonomyScore;
    scores[style.slug] = {
      score,
      textScore,
      taxonomyScore,
      nameHits,
      descriptionHits,
      categoryHits,
      subcategoryHits,
    };
  }

  return scores;
}

function buildSuggestion(product: ProductRow): ProductSuggestion {
  const byStyle = scoreProductByStyle(product);
  const ranking = Object.entries(byStyle)
    .map(([slug, data]) => ({ slug: slug as StyleSlug, ...data }))
    .sort((a, b) => b.score - a.score);

  const best = ranking[0];
  const second = ranking[1];
  const margin = best.score - second.score;
  const categoryName = product.categories?.name || null;
  const subcategoryName = product.subcategories?.name || null;
  const categorySlug = normalizeText(categoryName);
  const excludedByCategory = NON_STYLE_DRIVEN_CATEGORIES.includes(categorySlug);
  const reasons = [
    ...(best.nameHits.length > 0 ? [`name: ${best.nameHits.join(', ')}`] : []),
    ...(best.descriptionHits.length > 0 ? [`description: ${best.descriptionHits.join(', ')}`] : []),
    ...(best.categoryHits.length > 0 ? [`category: ${best.categoryHits.join(', ')}`] : []),
    ...(best.subcategoryHits.length > 0 ? [`subcategory: ${best.subcategoryHits.join(', ')}`] : []),
  ];

  let confidence: ProductSuggestion['confidence'] =
    best.score >= minScore + 2 && margin >= minMargin + 1
      ? 'high'
      : best.score >= minScore && margin >= minMargin
        ? 'medium'
        : 'low';

  if (excludedByCategory) {
    confidence = 'low';
    reasons.push('excluded: categoría sin estilo');
  } else if (best.textScore < minScore + 1 && best.taxonomyScore > 0) {
    confidence = 'low';
    reasons.push('downgraded: poca señal textual');
  }

  return {
    product_id: product.product_id,
    name: product.name || '(sin nombre)',
    categoryName,
    subcategoryName,
    excludedByCategory,
    suggestedStyle: confidence === 'low' ? null : best.slug,
    score: best.score,
    secondScore: second.score,
    confidence,
    reasons,
  };
}

async function getStyleLabels(ensureExists: boolean): Promise<Map<StyleSlug, number>> {
  if (ensureExists) {
    const labelRows = STYLE_RULES.map((s) => ({ name: s.name, slug: s.slug }));
    const { error: upsertError } = await supabase
      .from('labels')
      .upsert(labelRows, { onConflict: 'slug' });
    if (upsertError) {
      throw new Error(`No se pudieron crear/actualizar etiquetas de estilo: ${upsertError.message}`);
    }
  }

  const { data, error } = await supabase
    .from('labels')
    .select('id, slug')
    .in('slug', STYLE_RULES.map((s) => s.slug));

  if (error || !data) {
    throw new Error(`No se pudieron leer etiquetas de estilo: ${error?.message || 'sin datos'}`);
  }

  const map = new Map<StyleSlug, number>();
  for (const row of data) {
    map.set(row.slug as StyleSlug, row.id as number);
  }

  if (ensureExists) {
    for (const slug of STYLE_RULES.map((s) => s.slug)) {
      if (!map.has(slug)) throw new Error(`Falta etiqueta de estilo: ${slug}`);
    }
  }
  return map;
}

async function fetchProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select('product_id, name, description, categories(name), subcategories(name)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`No se pudieron cargar productos: ${error.message}`);
  return (data || []) as ProductRow[];
}

async function applySuggestions(
  suggestions: ProductSuggestion[],
  labelIds: Map<StyleSlug, number>
): Promise<void> {
  const styleLabelIds = [...labelIds.values()];
  const confident = suggestions.filter((s) => s.suggestedStyle && !s.excludedByCategory);
  const excludedProductIds = suggestions
    .filter((s) => s.excludedByCategory)
    .map((s) => s.product_id);

  if (excludedProductIds.length > 0) {
    const { error: purgeExcludedError } = await supabase
      .from('product_labels')
      .delete()
      .in('product_id', excludedProductIds)
      .in('label_id', styleLabelIds);

    if (purgeExcludedError) {
      throw new Error(
        `No se pudieron limpiar estilos en categorías excluidas: ${purgeExcludedError.message}`
      );
    }
  }

  for (const s of confident) {
    const targetLabelId = labelIds.get(s.suggestedStyle as StyleSlug);
    if (!targetLabelId) continue;

    const { error: deleteError } = await supabase
      .from('product_labels')
      .delete()
      .eq('product_id', s.product_id)
      .in('label_id', styleLabelIds);

    if (deleteError) {
      throw new Error(`No se pudo limpiar estilo previo (${s.product_id}): ${deleteError.message}`);
    }

    const { error: insertError } = await supabase.from('product_labels').insert({
      product_id: s.product_id,
      label_id: targetLabelId,
    });

    if (insertError) {
      throw new Error(`No se pudo asignar estilo (${s.product_id}): ${insertError.message}`);
    }
  }
}

function printSummary(suggestions: ProductSuggestion[]): void {
  const high = suggestions.filter((s) => s.confidence === 'high').length;
  const medium = suggestions.filter((s) => s.confidence === 'medium').length;
  const low = suggestions.filter((s) => s.confidence === 'low').length;
  const total = suggestions.length;
  const excluded = suggestions.filter((s) => s.excludedByCategory).length;

  const byStyle = STYLE_RULES.map((style) => {
    const count = suggestions.filter((s) => s.suggestedStyle === style.slug).length;
    return `${style.slug}: ${count}`;
  }).join(' | ');

  console.log('\nResumen de sugerencias');
  console.log(`- Total productos: ${total}`);
  console.log(`- Excluidos por categoría: ${excluded}`);
  console.log(`- Alta confianza: ${high}`);
  console.log(`- Media confianza: ${medium}`);
  console.log(`- Baja confianza (sin asignar): ${low}`);
  console.log(`- Distribución: ${byStyle}`);
}

function writeReport(suggestions: ProductSuggestion[]): void {
  const reportPath = 'scripts/style-tag-suggestions.json';
  writeFileSync(reportPath, JSON.stringify(suggestions, null, 2), 'utf8');
  console.log(`\nReporte generado: ${reportPath}`);
}

async function main() {
  console.log('Analizando productos para sugerir estilos...');
  console.log(`Modo: ${shouldApply ? 'APLICAR CAMBIOS' : 'SOLO SUGERENCIAS (dry-run)'}`);
  console.log(`Criterio: min-score=${minScore}, min-margin=${minMargin}`);

  const labelIds = await getStyleLabels(shouldApply);
  const products = await fetchProducts();
  const suggestions = products.map(buildSuggestion);

  printSummary(suggestions);
  writeReport(suggestions);

  if (!shouldApply) {
    console.log('\nNo se ha escrito nada en product_labels (usa --apply para aplicar).');
    return;
  }

  await applySuggestions(suggestions, labelIds);
  console.log('\nEtiquetas de estilo aplicadas correctamente.');
}

main().catch((error) => {
  console.error('\nError:', error instanceof Error ? error.message : error);
  process.exit(1);
});
