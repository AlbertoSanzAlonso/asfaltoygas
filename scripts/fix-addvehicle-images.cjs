const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const https = require('https');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');
const env = fs.readFileSync(ENV_PATH, 'utf-8');
const vars = {};
for (const line of env.split('\n')) {
  if (line && !line.startsWith('#')) {
    const [k, ...v] = line.split('=');
    vars[k.trim()] = v.join('=').trim();
  }
}
const supabase = createClient(vars.VITE_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);
const SUPABASE_URL = vars.VITE_SUPABASE_URL;

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

// The 16 products that need fixing with specific search queries
const subcatSlugs = { 70: 'motores-2t', 71: 'motores-4t', 72: 'aceite-de-transmision' };
const products = [
  { id: 8658, pid: 'fc4ae9b1-1584-4683-a7e6-2d4554ed0c89', name: 'Motorex Aceite Scooter 4t 5w/40 1l.', search: 'Motorex Scooter 4T 5W40 1L', subcat: 71, brand: 'motorex' },
  { id: 8703, pid: 'c64f66a6-976a-4629-81de-405b559ab50f', name: 'Motul Aceite Motul 5100 15w50 4t 1l', search: 'Motul 5100 15W50 4T 1L', subcat: 71, brand: 'motul' },
  { id: 8677, pid: 'd5dfe492-6ddc-436f-9f98-bf7ed1a07979', name: 'Motul Aceite Motul 7100 10w60 4t 1l', search: 'Motul 7100 10W60 4T 1L', subcat: 71, brand: 'motul' },
  { id: 8683, pid: 'c1973e88-f1cf-4d37-a821-8e9613213838', name: 'Motul Aceite Motul Multi Atf 1l', search: 'Motul Multi ATF 1L', subcat: 71, brand: 'motul' },
  { id: 8688, pid: 'b9c8e114-72b1-4255-81ea-bad1f129cbda', name: 'Repsol Aceite Repsol Smarter Commuter 0w30 60l', search: 'Repsol Smarter Commuter 0W30', subcat: 71, brand: 'repsol' },
  { id: 8696, pid: '092563e7-5f1a-47ea-8078-858442a9709c', name: 'Motul Aceite Motul Scooter Power 2t 1l', search: 'Motul Scooter Power 2T 1L', subcat: 70, brand: 'motul' },
  { id: 8707, pid: '84660afc-683a-4060-93b5-61e376731e01', name: 'Motul Aceite Motul Scooter Expert 2t 1l', search: 'Motul Scooter Expert 2T 1L', subcat: 70, brand: 'motul' },
  { id: 8728, pid: '7b704e01-204e-44b7-8f30-316eb9aa8da1', name: 'Motul Aceite Motul 7100 10w50 4t 1l', search: 'Motul 7100 10W50 4T 1L', subcat: 71, brand: 'motul' },
  { id: 8764, pid: '7c195856-edba-4e18-8dac-ba19ceba8b8c', name: 'Motul Aceite Motul 7100 5w40 4t 1l', search: 'Motul 7100 5W40 4T 1L', subcat: 71, brand: 'motul' },
  { id: 8767, pid: '86cffe1b-de0d-4134-b0cc-e248c3cf4496', name: 'Motul Aceite Motul 510 2t 1l', search: 'Motul 510 2T 1L', subcat: 70, brand: 'motul' },
  { id: 8774, pid: '0f95e055-dbc3-4c01-ba64-f704d63f3f1c', name: 'Motul Aceite Motul 5100 10w40 4t 1l', search: 'Motul 5100 10W40 4T 1L', subcat: 71, brand: 'motul' },
  { id: 8754, pid: '3a627f57-5cda-443b-ae96-1cadadafc8c5', name: 'Motorex Aceite Cambio Gear Oil Hypoid 80w90 1l', search: 'Motorex Gear Oil Hypoid 80W90', subcat: 71, brand: 'motorex' },
  { id: 8695, pid: 'e9ee4a5b-ac19-4044-8e16-4ea374b721a5', name: 'Motorex Aceite Scooter Forza 4t 0w/30 1l.', search: 'Motorex Scooter Forza 4T 0W30', subcat: 71, brand: 'motorex' },
  { id: 8699, pid: 'c4e2ecad-5dc0-4135-984a-5db6a4a29d83', name: 'Motul Aceite Motul Transoil Expert 10w40 1l', search: 'Motul Transoil Expert 10W40', subcat: 71, brand: 'motul' },
  { id: 8773, pid: '00b0145e-5da3-4665-a477-cb92c42acb49', name: 'Motul Aceite Motul 5100 10w30 4t 4l', search: 'Motul 5100 10W30 4T 4L', subcat: 71, brand: 'motul' },
  { id: 8770, pid: '6bdb2a2c-fbe1-494e-bc80-faeb560253b2', name: 'Motul Aceite Motul Scooter Power 4t 10w30 Mb 1l', search: 'Motul Scooter Power 4T 10W30', subcat: 71, brand: 'motul' },
];

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  let ok = 0, fail = 0;

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${prod.name}`);
    console.log(`  Search: "${prod.search}"`);

    let downloaded = null;

    // Try up to 3 search queries
    const queries = [prod.search, prod.search.replace(/\d+[Ll]/g, '').trim()];
    if (prod.brand === 'repsol') queries.push('Repsol Smarter Commuter 0W30');

    for (const term of queries) {
        try {
          await page.goto(`https://www.amazon.es/s?k=${encodeURIComponent(term)}`, {
            waitUntil: 'domcontentloaded',
            timeout: 15000,
          });

          try { await page.click('#sp-cc-accept', { timeout: 2000 }); } catch {}
          await page.waitForTimeout(2500);

          const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('[data-asin]'))
              .filter(el => el.getAttribute('data-asin') && el.getAttribute('data-asin') !== '');
            return items.slice(0, 8).map(item => {
              const img = item.querySelector('img');
              return {
                imgSrc: img ? (img.src || img.getAttribute('src') || '') : '',
              };
            });
          });

          for (const r of results) {
            if (r.imgSrc && !r.imgSrc.includes('AddVehicle') && !r.imgSrc.includes('nav2') && r.imgSrc.length > 50) {
              const hqUrl = r.imgSrc
                .replace('_AC_UL320_', '_AC_SX679_')
                .replace('_AC_SR160,134', '_AC_SX679_')
                .replace('_SR160,134_', '_SX679_');
              
              downloaded = await downloadUrl(hqUrl);
              if (!downloaded || downloaded.buffer.length < 5000) {
                downloaded = await downloadUrl(r.imgSrc);
              }
              if (downloaded && downloaded.buffer.length >= 5000) break;
              downloaded = null;
            }
          }
        } catch (e) {
          console.log(`  Amazon error (${term.substring(0, 30)}): ${e.message.substring(0, 50)}`);
        }
        if (downloaded) break;
        if (term !== queries[queries.length - 1]) await page.waitForTimeout(1500);
      }

    if (!downloaded || downloaded.buffer.length < 4000) {
      console.log('  FAILED: no suitable image');
      fail++;
      continue;
    }

    console.log(`  Got: ${(downloaded.buffer.length / 1024).toFixed(1)}KB`);

    // Store the new image
    const nameSlug = prod.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '').substring(0, 100);

    const folder = subcatSlugs[prod.subcat] || 'motores-4t';
    const storagePath = `products/aceites-y-lubricantes/${folder}/${prod.brand}/${nameSlug}.webp`;
    const { error: uploadErr } = await supabase.storage
      .from('products')
      .upload(storagePath, downloaded.buffer, { contentType: 'image/webp', upsert: true });

    if (uploadErr) {
      console.log(`  Upload fail: ${uploadErr.message}`);
      fail++;
      continue;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`;

    const { error: dbErr } = await supabase
      .from('product_images')
      .update({ image_url: publicUrl })
      .eq('id', prod.id);

    if (dbErr) {
      console.log(`  DB fail: ${dbErr.message}`);
      fail++;
      continue;
    }

    console.log('  OK');
    ok++;

    if (i < products.length - 1) {
      await page.waitForTimeout(2000 + Math.random() * 2000);
    }
  }

  await browser.close();
  console.log(`\n=== Done: ${ok} OK, ${fail} FAIL ===`);
}

main().catch(console.error);