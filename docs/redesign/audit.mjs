// Baseline audit: screenshots per route/breakpoint, overflow, console errors, axe at 390px.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const require = createRequire(process.env.NODE_PATH + '/');
const { chromium } = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const BASE = process.argv[2] || 'http://127.0.0.1:4178/';
const OUT = process.argv[3];
mkdirSync(OUT, { recursive: true });
const WIDTHS = [320, 390, 768, 1024, 1440];
const ROUTES = ['home', 'missions', 'theory', 'garage', 'exam', 'progress', 'trafiklab', 'judge', 'drive', 'review', 'pitstop'];
const FLOWS = {
  'exam-question': async p => { await p.goto(BASE + '#exam'); await p.waitForTimeout(800); await p.click('[data-action="start-exam"]'); await p.waitForTimeout(1500); },
  'mission-question': async p => { await p.goto(BASE + '#missions'); await p.waitForTimeout(800); const a = p.locator('a[href^="#mission"], [data-mission], [data-start]').first(); if (await a.count()) await a.click(); await p.waitForTimeout(1500); },
  'lesson': async p => { await p.goto(BASE + '#home'); await p.waitForTimeout(800); const a = p.locator('a[href^="#lesson"]').first(); if (await a.count()) await a.click(); await p.waitForTimeout(1500); },
};

const report = [];
const browser = await chromium.launch();
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 844 : 900 }, deviceScaleFactor: 1, colorScheme: 'dark' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  const shots = [...ROUTES.map(r => [r, async p => { await p.goto(BASE + '#' + r); await p.waitForTimeout(1500); }]), ...Object.entries(FLOWS)];
  for (const [name, go] of shots) {
    errors.length = 0;
    try { await go(page); } catch (e) { errors.push('NAV: ' + e.message); }
    const m = await page.evaluate(() => ({
      url: location.hash,
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      height: document.documentElement.scrollHeight,
      smallTargets: [...document.querySelectorAll('button, a, input, select, [role=button]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24); }).length,
      fonts: [...new Set([...document.querySelectorAll('h1,h2,h3,p,button')].slice(0, 80).map(el => getComputedStyle(el).fontFamily.split(',')[0]))],
      minFont: Math.min(...[...document.querySelectorAll('p, span, li, button, label, a')].filter(el => el.offsetParent && el.textContent.trim()).map(el => parseFloat(getComputedStyle(el).fontSize))),
    }));
    const file = `${name}-${w}.png`;
    await page.screenshot({ path: join(OUT, file), fullPage: true });
    let axe = null;
    if (w === 390) {
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(async () => await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] }));
      axe = res.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
    }
    report.push({ name, width: w, file, ...m, consoleErrors: [...errors], axe });
    console.log(name, w, 'overflowX', m.overflowX, 'errors', errors.length, axe ? 'axe ' + axe.length : '');
  }
  await ctx.close();
}
await browser.close();
writeFileSync(join(OUT, 'audit.json'), JSON.stringify(report, null, 2));
