import sharp from 'sharp';
import toIco from 'to-ico';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const logoDir = join(root, 'public/assets/logo');
const iconSvg = join(logoDir, 'logo-asfaltoygas-icon.svg');
const mainLogoPng = join(logoDir, 'logo-asfaltoygas-main.png');

async function svgToPng(svgPath, outPath, width, height) {
  const svg = readFileSync(svgPath);
  await sharp(svg).resize(width, height).png().toFile(outPath);
  console.log(`✓ ${outPath} (${width}x${height})`);
}

async function svgToBuffer(svgPath, size) {
  const svg = readFileSync(svgPath);
  return sharp(svg).resize(size, size).png().toBuffer();
}

async function main() {
  if (!existsSync(mainLogoPng)) {
    throw new Error(`Logo principal no encontrado: ${mainLogoPng}`);
  }
  await svgToPng(join(logoDir, 'logo-asfaltoygas-og.svg'), join(root, 'public/og-image.png'), 1200, 630);

  // Favicons desde el icono de casco
  await svgToPng(iconSvg, join(root, 'public/favicon.png'), 32, 32);
  await svgToPng(iconSvg, join(root, 'public/favicon-48x48.png'), 48, 48);
  await svgToPng(iconSvg, join(root, 'public/favicon-96x96.png'), 96, 96);
  await svgToPng(iconSvg, join(root, 'public/favicon-192x192.png'), 192, 192);
  await svgToPng(iconSvg, join(root, 'public/apple-touch-icon.png'), 180, 180);

  // favicon.ico real (multi-resolución 16/32/48)
  const [png16, png32, png48] = await Promise.all([
    svgToBuffer(iconSvg, 16),
    svgToBuffer(iconSvg, 32),
    svgToBuffer(iconSvg, 48),
  ]);
  const ico = await toIco([png16, png32, png48]);
  writeFileSync(join(root, 'public/favicon.ico'), ico);
  console.log('✓ public/favicon.ico (16/32/48 ICO)');

  // Copiar SVG como favicon vectorial
  const iconSvgContent = readFileSync(iconSvg);
  writeFileSync(join(root, 'public/favicon.svg'), iconSvgContent);
  console.log('✓ public/favicon.svg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
