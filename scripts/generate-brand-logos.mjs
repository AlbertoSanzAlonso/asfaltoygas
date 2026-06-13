import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'assets', 'brands');
mkdirSync(outDir, { recursive: true });

const brands = [
  ['HJC', 'hjc', '#ffffff', '#cc0000'],
  ['AGV', 'agv', '#ffffff', '#0a0a0a'],
  ['SHOEI', 'shoei', '#ffffff', '#003399'],
  ['NOLAN', 'nolan', '#ffffff', '#e2231a'],
  ['X-LITE', 'x-lite', '#ffd700', '#0a0a0a'],
  ['AIROH', 'airoh', '#ffffff', '#00a650'],
  ['BELL', 'bell', '#ffffff', '#003da5'],
  ['SCORPION', 'scorpion', '#ffcc00', '#0a0a0a'],
  ['MT-HELMETS', 'mt-helmets', '#ffffff', '#e30613'],
  ['CABERG', 'caberg', '#ffffff', '#1a1a1a'],
  ['SHARK', 'shark', '#ffffff', '#333333'],
  ['AXXIS', 'axxis', '#000000', '#ffcc00'],
  ['LS2', 'ls2', '#ffffff', '#ff6600'],
  ['SUOMY', 'suomy', '#ffffff', '#000000'],
  ['DEXTER', 'dexter', '#ffffff', '#666666'],
  ['ACERBIS', 'acerbis', '#ffffff', '#339900'],
  ['LS2-HELMETS', 'ls2-helmets', '#ffffff', '#ff6600'],
  ['KYT', 'kyt', '#ffffff', '#cc0000'],
  ['UNIK-RACING', 'unik-racing', '#ffffff', '#cc3366'],
  ['BRP', 'brp', '#ffffff', '#e60000'],
  ['PIAGGIO', 'piaggio', '#ffffff', '#003399'],
  ['GAS-GAS', 'gas-gas', '#ffffff', '#ee0000'],
  ['HUSQVARNA', 'husqvarna', '#ffffff', '#0055aa'],
  ['ARAI', 'arai', '#ffffff', '#1a1a1a'],
];

function generate(name, slug, textColor, bgColor) {
  const isLong = name.length > 5;
  const isTwoLine = name.includes('-');
  const fontSize = isLong ? (name.length > 8 ? 16 : 20) : (name.length > 3 ? 28 : 36);
  const letterSpacing = isLong ? 0.5 : 1.5;
  const displayName = name.replace('-', '\n');

  let textContent;
  if (isTwoLine) {
    const parts = displayName.split('\n');
    textContent = `<text x="100" y="24" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="${fontSize}" fill="${textColor}" letter-spacing="${letterSpacing}">${parts[0]}</text>
  <text x="100" y="46" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="${fontSize}" fill="${textColor}" letter-spacing="${letterSpacing}">${parts[1]}</text>`;
  } else {
    textContent = `<text x="100" y="41" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="${fontSize}" fill="${textColor}" letter-spacing="${letterSpacing}">${displayName}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
  <rect width="200" height="60" rx="8" fill="${bgColor}"/>
  ${textContent}
</svg>
`;

  writeFileSync(join(outDir, `${slug}.svg`), svg);
  console.log(`  ✓ ${slug}.svg`);
}

console.log('Generando logos de marcas...');
for (const [name, slug, text, bg] of brands) {
  generate(name, slug, text, bg);
}
console.log(`  → ${brands.length} logos en ${outDir}`);
