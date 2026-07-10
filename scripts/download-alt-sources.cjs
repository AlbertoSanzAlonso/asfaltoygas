const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const https = require('https');
const path = require('path');

// --- Config ---
const ENV_PATH = path.join(__dirname, '..', '.env');
const env = fs.readFileSync(ENV_PATH, 'utf-8');
const vars = {};
for (const line of env.split('\n')) {
  if (line && !line.startsWith('#')) {
    const [k, ...v] = line.split('=');
    vars[k.trim()] = v.join('=').trim();
  }
}
const SUPABASE_URL = vars.VITE_SUPABASE_URL;
const SUPABASE_KEY = vars.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Helpers ---
function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|--*/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function downloadUrl(url) {
  return new Promise((resolve) => {
    const agent = new https.Agent({ rejectUnauthorized: false });
    https.get(url, {
      agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/png,image/jpeg,*/*',
        'Referer': 'https://www.amazon.es/',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      const ct = res.headers['content-type'] || '';
      if (!ct.startsWith('image/')) { resolve(null); return; }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: ct }));
    }).on('error', () => resolve(null));
  });
}

// --- Fetch products that still use external URLs ---
async function getExternalProducts() {
  const { data: images } = await supabase
    .from('product_images')
    .select('id, product_id, image_url')
    .not('image_url', 'ilike', '%supabase.co%');

  if (!images || images.length === 0) return [];

  const ids = [...new Set(images.map(i => i.product_id))];
  const { data: products } = await supabase
    .from('products')
    .select('product_id, name, category_id, subcategory_id')
    .in('product_id', ids);

  const prodMap = {};
  if (products) for (const p of products) prodMap[p.product_id] = p;

  const { data: subcats } = await supabase.from('subcategories').select('id, name');
  const subcatMap = {};
  if (subcats) for (const s of subcats) subcatMap[s.id] = slugify(s.name);

  const catMap = { 3: 'aceites-y-lubricantes', 4: 'mantenimiento' };

  return images.map(img => {
    const p = prodMap[img.product_id];
    if (!p) return null;
    return {
      imageRowId: img.id,
      productId: p.product_id,
      name: p.name,
      categorySlug: catMap[p.category_id] || 'otros',
      subcategorySlug: subcatMap[p.subcategory_id] || 'sin-subcategoria',
      externalUrl: img.image_url,
      brand: p.name.split(' ')[0].toLowerCase(),
    };
  }).filter(Boolean);
}

// --- Upload to Supabase Storage and update DB ---
async function uploadAndUpdate(product, buffer) {
  const nameSlug = slugify(product.name.replace(/\.$/, ''));

  const basePath = `products/${product.categorySlug}/${product.subcategorySlug}`;
  const brandPath = `${basePath}/${product.brand}/${nameSlug}.webp`;
  const noBrandPath = `${basePath}/${nameSlug}.webp`;

  // Try with brand folder first
  let { error: uploadErr } = await supabase.storage
    .from('products')
    .upload(brandPath, buffer, { contentType: 'image/webp', upsert: true });

  let storagePath = brandPath;
  if (uploadErr && uploadErr.message.includes('bucket') === false) {
    // Try without brand
    const r2 = await supabase.storage
      .from('products')
      .upload(noBrandPath, buffer, { contentType: 'image/webp', upsert: true });
    if (!r2.error) storagePath = noBrandPath;
    else { console.error(`  Upload fail: ${r2.error.message}`); return false; }
  } else if (uploadErr) {
    console.error(`  Upload fail: ${uploadErr.message}`);
    // Might be a bucket issue, try without brand
    const r2 = await supabase.storage
      .from('products')
      .upload(noBrandPath, buffer, { contentType: 'image/webp', upsert: true });
    if (!r2.error) storagePath = noBrandPath;
    else return false;
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`;

  const { error: dbError } = await supabase
    .from('product_images')
    .update({ image_url: publicUrl })
    .eq('id', product.imageRowId);

  if (dbError) { console.error(`  DB update fail: ${dbError.message}`); return false; }
  return true;
}

// --- Build smarter Amazon search query ---
function buildSearchQuery(name) {
  // Remove common prefixes like "Aceite Motul" or "Aceite Repsol"
  let q = name
    .replace(/^Aceite\s+(Motul|Repsol|Motorex|Castrol)\s+/i, '')
    .replace(/^Motul\s+Aceite\s+/i, '')
    .replace(/^Repsol\s+Aceite\s+/i, '')
    .replace(/\.$/, '')
    .trim();

  // Handle specific product types
  if (/transoil|transmis/i.test(q)) return `Motul ${q}`;
  if (/scooter\s+power|scooter\s+expert/i.test(q)) return `Motul ${q}`;
  if (/multi\s+atf|atf\s+236/i.test(q)) return `Motul Multi ATF 1L`;
  if (/smarter\s+commuter/i.test(q)) return `Repsol Smarter Commuter 0W30`;
  if (/gear\s+oil\s+hypoid/i.test(q)) return `Motorex Gear Oil Hypoid 80W90`;
  if (/scooter\s+forza/i.test(q)) return `Motorex Scooter Forza 4T`;
  if (/scooter\s+4t\s+5w/i.test(q)) return `Motorex Aceite Scooter 4T 5W40`;

  // For most products, just use brand + viscosity + volume
  const brand = name.split(' ')[0];
  const viscMatch = q.match(/\d+w[\d/]+/i);
  const volMatch = q.match(/\d+\s*[Ll]/);
  const parts = [brand];
  if (viscMatch) parts.push(viscMatch[0]);
  if (volMatch) parts.push(volMatch[0].replace(/\s+/g, ''));
  return parts.join(' ');
}

// --- Main ---
async function main() {
  const products = await getExternalProducts();
  console.log(`\nProducts needing images: ${products.length}\n`);
  if (products.length === 0) { console.log('All done!'); return; }

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  let success = 0, fail = 0;
  const failedProducts = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const searchTerm = buildSearchQuery(product.name);
    console.log(`\n[${i + 1}/${products.length}] ${product.name}`);
    console.log(`  Search: "${searchTerm}"`);

    let downloaded = null;
    let attempts = 0;

    // Try up to 3 different search queries
    const queries = [
      searchTerm,
      product.name.replace(/\.$/, '').trim(),
      product.brand + ' ' + product.name.split(' ').slice(1).filter(w => !/aceite/i.test(w)).join(' ').substring(0, 60),
    ];

    for (const q of queries) {
      if (downloaded) break;
      attempts++;
      if (attempts > 2) break;

      try {
        await page.goto(`https://www.amazon.es/s?k=${encodeURIComponent(q)}`, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });

        // Accept cookies if shown
        try { await page.click('#sp-cc-accept', { timeout: 2000 }); } catch {}
        await page.waitForTimeout(2000);

        // Get all product results with images
        const results = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('[data-asin]'))
            .filter(el => el.getAttribute('data-asin') && el.getAttribute('data-asin') !== '');
          
          return items.slice(0, 8).map(item => {
            const img = item.querySelector('img');
            const title = item.querySelector('h2')?.textContent?.trim() || '';
            return {
              asin: item.getAttribute('data-asin'),
              title: title.substring(0, 100),
              imgSrc: img ? img.src || img.getAttribute('src') || '' : '',
            };
          });
        });

        // Find first valid product image (not AddVehicle, not empty)
        for (const r of results) {
          if (r.imgSrc && !r.imgSrc.includes('AddVehicle') && !r.imgSrc.includes('nav2') && r.imgSrc.length > 40) {
            // Upgrade resolution
            const hq = r.imgSrc.replace('_AC_UL320_', '_AC_SX679_').replace('_AC_SR160,134', '_AC_SX679_');
            console.log(`  Found: ${r.title.substring(0, 50)}`);
            console.log(`  URL: ${hq.substring(0, 100)}`);
            downloaded = await downloadUrl(hq);
            if (!downloaded || downloaded.buffer.length < 5000) {
              // Try original
              downloaded = await downloadUrl(r.imgSrc);
            }
            if (downloaded && downloaded.buffer.length >= 5000) break;
            downloaded = null;
          }
        }
      } catch (e) {
        console.log(`  Attempt error: ${e.message.substring(0, 60)}`);
        await page.waitForTimeout(1000);
      }
    }

    if (!downloaded || downloaded.buffer.length < 4000) {
      console.log('  FAILED - no image found');
      fail++;
      failedProducts.push(product.name);
      continue;
    }

    console.log(`  Downloaded: ${(downloaded.buffer.length / 1024).toFixed(1)}KB`);

    // Convert to webp inline (playwright can do this better but let's keep it simple)
    const ok = await uploadAndUpdate(product, downloaded.buffer);
    if (ok) {
      console.log('  OK');
      success++;
    } else {
      console.log('  FAILED - upload/DB');
      fail++;
      failedProducts.push(product.name);
    }

    // Delay between requests to avoid rate limiting
    if (i < products.length - 1) {
      const delay = 2000 + Math.random() * 3000;
      console.log(`  Waiting ${Math.round(delay / 1000)}s...`);
      await page.waitForTimeout(delay);
    }
  }

  await browser.close();
  console.log(`\n=== Done: ${success} OK, ${fail} FAIL ===`);
  if (failedProducts.length > 0) {
    console.log('\nFailed products:');
    for (const fp of failedProducts) console.log(`  - ${fp}`);
  }
}

main().catch(console.error);