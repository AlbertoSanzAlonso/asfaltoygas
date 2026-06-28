import sharp from 'sharp';
import toIco from 'to-ico';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const logoDir = join(root, 'public/assets/logo');
const mainLogoPng = join(logoDir, 'logo-asfaltoygas-main.png');

async function pngToPng(inputPath, outPath, width, height) {
  await sharp(inputPath)
    .resize(width, height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outPath);
  console.log(`✓ ${outPath} (${width}x${height})`);
}

async function pngToBuffer(inputPath, size) {
  return sharp(inputPath)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

function writeEmbeddedLogoSvg(outPath, width, height) {
  const base64Png = readFileSync(mainLogoPng).toString('base64');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">
  <image
    href="data:image/png;base64,${base64Png}"
    x="0"
    y="0"
    width="${width}"
    height="${height}"
    preserveAspectRatio="xMidYMid meet"
  />
</svg>
`;
  writeFileSync(outPath, svg);
  console.log(`✓ ${outPath} (svg embebido ${width}x${height})`);
}

async function main() {
  if (!existsSync(mainLogoPng)) {
    throw new Error(`Logo principal no encontrado: ${mainLogoPng}`);
  }

  // Regenerar SVGs de marca como assets auto-contenidos (sin referencias externas).
  writeEmbeddedLogoSvg(join(logoDir, 'logo-asfaltoygas-blanco.svg'), 520, 140);
  writeEmbeddedLogoSvg(join(logoDir, 'logo-asfaltoygas-negro.svg'), 520, 140);
  writeEmbeddedLogoSvg(join(logoDir, 'logo-asfaltoygas-icon.svg'), 100, 100);
  writeEmbeddedLogoSvg(join(logoDir, 'logo-asfaltoygas-square.svg'), 500, 500);
  writeEmbeddedLogoSvg(join(logoDir, 'logo-asfaltoygas-og.svg'), 1200, 630);

  // Imagen OG desde el PNG principal.
  await pngToPng(mainLogoPng, join(root, 'public/og-image.png'), 1200, 630);

  // Favicons desde el icono de casco
  await pngToPng(mainLogoPng, join(root, 'public/favicon.png'), 32, 32);
  await pngToPng(mainLogoPng, join(root, 'public/favicon-48x48.png'), 48, 48);
  await pngToPng(mainLogoPng, join(root, 'public/favicon-96x96.png'), 96, 96);
  await pngToPng(mainLogoPng, join(root, 'public/favicon-192x192.png'), 192, 192);
  await pngToPng(mainLogoPng, join(root, 'public/apple-touch-icon.png'), 180, 180);

  // favicon.ico real (multi-resolución 16/32/48)
  const [png16, png32, png48] = await Promise.all([
    pngToBuffer(mainLogoPng, 16),
    pngToBuffer(mainLogoPng, 32),
    pngToBuffer(mainLogoPng, 48),
  ]);
  const ico = await toIco([png16, png32, png48]);
  writeFileSync(join(root, 'public/favicon.ico'), ico);
  console.log('✓ public/favicon.ico (16/32/48 ICO)');

  // Favicon SVG auto-contenido.
  const faviconSvg = readFileSync(join(logoDir, 'logo-asfaltoygas-icon.svg'));
  writeFileSync(join(root, 'public/favicon.svg'), faviconSvg);
  console.log('✓ public/favicon.svg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
