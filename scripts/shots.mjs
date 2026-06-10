import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const stops = [0, 0.35, 0.55, 0.75, 1];
for (const p of stops) {
  await page.evaluate((prog) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * prog, behavior: 'instant' });
  }, p);
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `/tmp/shot-${Math.round(p * 100)}.png` });
}

console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
await browser.close();
