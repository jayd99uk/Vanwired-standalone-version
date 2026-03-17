import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const pages = [
  { name: 'Dashboard', path: '/' },
  { name: 'CableConverter', path: '/CableConverter' },
  { name: 'OhmsLaw', path: '/OhmsLaw' },
  { name: 'SolarBattery', path: '/SolarBattery' },
  { name: 'CableSystem', path: '/CableSystem' },
  { name: 'WattsTriangle', path: '/WattsTriangle' },
  { name: 'Checklists', path: '/Checklists' },
  { name: 'Resources', path: '/Resources' },
];

const OUTPUT_DIR = './builds/screenshots/tablet-10inch';
mkdirSync(OUTPUT_DIR, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// 9:16 10-inch tablet viewport — 1600x2560
await page.setViewport({ width: 1600, height: 2560, deviceScaleFactor: 1 });

// Handle disclaimer modal — set localStorage to skip it
await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
await page.evaluate(() => {
  localStorage.setItem('vanwired_disclaimer_accepted', 'true');
});
await new Promise(r => setTimeout(r, 500));

for (const { name, path } of pages) {
  await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const file = `${OUTPUT_DIR}/${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✓ ${name} → ${file}`);
}

await browser.close();
console.log('\nAll screenshots saved to', OUTPUT_DIR);
