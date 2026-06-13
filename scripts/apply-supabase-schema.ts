/**
 * Aplica el esquema base y las migraciones SQL al proyecto Supabase configurado en .env
 *
 * Uso: npx tsx scripts/apply-supabase-schema.ts
 */
import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error('Falta DATABASE_URL en .env');
  process.exit(1);
}

const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
const migrationFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 1,
  connect_timeout: 30,
});

async function runFile(file: string) {
  const path = join(migrationsDir, file);
  const contents = readFileSync(path, 'utf8');
  console.log(`→ ${file}`);
  await sql.unsafe(contents);
}

async function ensureProductsBucket() {
  const url = process.env.VITE_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.warn('Sin VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY: omitiendo bucket Storage');
    return;
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === 'products');
  if (exists) {
    console.log('→ bucket Storage "products" ya existe');
    return;
  }

  const { error } = await supabase.storage.createBucket('products', {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
  });

  if (error) {
    console.warn('No se pudo crear bucket "products":', error.message);
    return;
  }
  console.log('→ bucket Storage "products" creado (público)');
}

async function main() {
  console.log('Aplicando migraciones en Supabase...\n');

  for (const file of migrationFiles) {
    await runFile(file);
  }

  await ensureProductsBucket();

  const tables = await sql<{ table_name: string }[]>`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
    order by table_name
  `;

  const categories = await sql<{ name: string }[]>`
    select name from categories order by id
  `;

  console.log('\n✓ Esquema aplicado');
  console.log(`  Tablas: ${tables.map((t) => t.table_name).join(', ')}`);
  console.log(`  Categorías: ${categories.map((c) => c.name).join(', ')}`);
  console.log('\nSiguiente paso: crear admin con');
  console.log('  npx tsx scripts/create-admin-user.ts tu@email.com "TuContraseña"');
}

main()
  .catch((err) => {
    console.error('\nError aplicando esquema:', err);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
  });
