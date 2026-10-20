// Screenshot every route at mobile widths (viewport-sized shots, top of page + one scroll) for visual review.
// Usage: node docs/redesign/all-routes.mjs <base-url> <out-dir> [width]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const require = createRequire(process.env.NODE_PATH + '/');
const { chromium } = require('playwright');
const [BASE = 'http://127.0.0.1:4178/', OUT = 'routes', W = '390'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const ROUTES = ['home', 'missions', 'theory', 'chapter:bil', 'garage', 'progress', 'review', 'judge', 'trafiklab', 'drive', 'journey:cockpit', 'exam', 'mission:stop'];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +W, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(String(e)));
for (const r of ROUTES) {
  errors.length = 0;
  await page.goto(BASE + '#' + r); await page.waitForTimeout(1500);
  const name = r.replace(':', '_');
  await page.screenshot({ path: join(OUT, `${name}-a.png`) });
  await page.evaluate(() => scrollBy(0, innerHeight * .85)); await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, `${name}-b.png`) });
  const ovf = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(r.padEnd(16), 'overflowX', ovf, errors.length ? 'ERR ' + errors.join(' | ').slice(0, 150) : '');
}
await browser.close();
