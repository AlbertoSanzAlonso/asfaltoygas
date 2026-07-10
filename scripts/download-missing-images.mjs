import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import https from 'https';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || (() => {
  const env = fs.readFileSync('.env', 'utf-8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k.trim() === 'VITE_SUPABASE_URL') return v.join('=').trim();
  }
  return null;
})();

const SUPABASE_KEY = (() => {
  const env = fs.readFileSync('.env', 'utf-8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k.trim() === 'SUPABASE_SERVICE_ROLE_KEY') return v.join('=').trim();
  }
  return null;
})();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getProductsToFix() {
  const { data: images } = await supabase
    .from('product_images')
    .select('product_id, image_url, id, is_main')
    .not('image_url', 'ilike', '%supabase.co%');

  const ids = [...new Set(images.map(i => i.product_id))];
  const { data: products } = await supabase
    .from('products')
    .select('product_id, name')
    .in('product_id', ids);

  const prodMap = {};
  for (const p of products) prodMap[p.product_id] = p;

  const result = [];
  for (const img of images) {
    const p = prodMap[img.product_id];
    if (!p) continue;
    const match = img.image_url.match(/(\d+)art\//);
    result.push({
      productId: p.product_id,
      name: p.name,
      externalUrl: img.image_url,
      pageId: match ? match[1] : null,
      imageRowId: img.id,
    });
  }
  return result;
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

async function captureListingImages(page, capturedMap) {
  // Get all product images from the current listing page
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img[src*="prod_images"]'))
      .map(i => ({ src: i.src, alt: i.alt, width: i.naturalWidth }));
  });
  
  for (const img of imgs) {
    if (!capturedMap[img.src]) {
      capturedMap[img.src] = { url: img.src };
    }
  }
}

async function downloadAndUpload(page, url, storagePath) {
  // Download from within page context
  const result = await page.evaluate(async (url) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const buffer = await blob.arrayBuffer();
      return { status: resp.status, size: buffer.byteLength, type: blob.type, data: Array.from(new Uint8Array(buffer)) };
    } catch(e) {
      return { error: e.message };
    }
  }, url);
  
  if (result.error || result.status !== 200) return null;
  
  const buffer = Buffer.from(result.data);
  
  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from('products')
    .upload(storagePath, buffer, {
      contentType: result.type || 'image/webp',
      upsert: true,
    });
  
  if (error) { console.error(`  Upload error: ${error.message}`); return null; }
  
  const { data: urlData } = supabase.storage.from('products').getPublicUrl(storagePath);
  return urlData.publicUrl;
}

async function downloadDirect(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', () => resolve(null));
  });
}

async function main() {
  console.log('Getting products to fix...');
  const products = await getProductsToFix();
  console.log(`Found ${products.length} products\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  // Listen for product image responses
  const capturedImages = {}; // url -> buffer
  page.on('response', async (r) => {
    if (r.url().includes('prod_images/') && r.status() === 200) {
      const ct = r.headers()['content-type'] || '';
      if (ct.startsWith('image/')) {
        try {
          capturedImages[r.url()] = await r.body();
        } catch {}
      }
    }
  });

  // Visit listing pages and scroll through them
  const listingUrls = [
    'https://www.elmotorista.es/shop-motos/lubricante-moto/categoria-moto-4-tiempos',
    'https://www.elmotorista.es/shop-motos/lubricante-moto/categoria-moto-2-tiempos',
    'https://www.elmotorista.es/shop-motos/lubricante-moto/categoria-aceite-transmisiones',
  ];

  for (const listingUrl of listingUrls) {
    console.log(`\nListing: ${listingUrl.split('/').pop()}`);
    
    // Try up to 5 pages
    for (let pageNum = 1; pageNum <= 5; pageNum++) {
      const url = pageNum === 1 ? listingUrl : `${listingUrl}/pag-${pageNum}`;
      console.log(`  Page ${pageNum}...`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        
        // Accept cookies on first load
        if (pageNum === 1) {
          try {
            const btn = page.locator('button:has-text("Aceptar")');
            if (await btn.isVisible()) { await btn.click(); await page.waitForTimeout(1000); }
          } catch {}
        }
        
        // Scroll to trigger lazy loading
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(1000);
        
      } catch (err) {
        console.log(`  Page ${pageNum} failed: ${err.message}`);
        break;
      }
    }
  }

  console.log(`\nCaptured ${Object.keys(capturedImages).length} unique product images from listing pages`);

  // Match captured images to our products
  let uploaded = 0;
  let notFound = 0;
  
  for (const prod of products) {
    // Extract the filename from the external URL
    const externalFilename = prod.externalUrl.split('/').pop().replace('_320.webp', '');
    
    // Try to find a matching captured image
    let matchedUrl = null;
    for (const [url, buffer] of Object.entries(capturedImages)) {
      if (url.includes(externalFilename) || url.includes(prod.pageId)) {
        matchedUrl = url;
        break;
      }
    }
    
    if (!matchedUrl) {
      // Try direct download with _200 resolution (lower quality but might work from listing page)
      const lowerResUrl = prod.externalUrl.replace('_320.webp', '_200.webp');
      const buffer = await downloadDirect(lowerResUrl);
      if (buffer && buffer.length > 1000) {
        capturedImages[lowerResUrl] = buffer;
        matchedUrl = lowerResUrl;
      }
    }
    
    if (!matchedUrl) {
      console.log(`  NOT FOUND: ${prod.name}`);
      notFound++;
      continue;
    }
    
    // Upload to Storage
    const buffer = capturedImages[matchedUrl];
    const storagePath = `products/aceites-y-lubricantes/${slugify(prod.name)}.webp`;
    
    const { data, error } = await supabase.storage
      .from('products')
      .upload(storagePath, buffer, {
        contentType: 'image/webp',
        upsert: true,
      });
    
    if (error) {
      console.log(`  UPLOAD FAIL: ${prod.name} - ${error.message}`);
      continue;
    }
    
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;
    
    // Update database
    const { error: dbError } = await supabase
      .from('product_images')
      .update({ image_url: publicUrl })
      .eq('id', prod.imageRowId);
    
    if (dbError) {
      console.log(`  DB FAIL: ${prod.name} - ${dbError.message}`);
    } else {
      console.log(`  OK: ${prod.name}`);
      uploaded++;
    }
  }

  console.log(`\n=== Done: ${uploaded} uploaded, ${notFound} not found ===`);
  await browser.close();
}

main().catch(console.error);