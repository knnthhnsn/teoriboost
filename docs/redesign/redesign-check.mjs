// Redesign check: screenshots of the redesigned screens at 320–1440 px, overflow, console errors, axe.
// Usage: node docs/redesign/redesign-check.mjs <base-url> <out-dir>   (NODE_PATH = npm root -g)
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const require = createRequire(process.env.NODE_PATH + '/');
const { chromium } = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const [BASE = 'http://127.0.0.1:4178/', OUT = 'redesign-shots'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });

const answerAll = async (p, value) => {
  for (let i = 0; i < 4; i++) {
    const b = p.locator(`[data-choice="${i}"][data-value="${value}"]`).first();
    if (await b.count()) await b.click();
  }
};
const SCREENS = {
  home: async p => { await p.goto(BASE + '#home'); },
  missions: async p => { await p.goto(BASE + '#missions'); },
  'mission-wrong': async p => { await p.goto(BASE + '#mission:stop'); await p.waitForTimeout(900); await answerAll(p, 'true'); await p.click('[data-action="check"]'); },
  'mission-right': async p => {
    await p.goto(BASE + '#mission:stop'); await p.waitForTimeout(900);
    // Answer from the rendered statements' correctness exposed after a wrong check: use the app's own data instead.
    const truth = await p.evaluate(async () => {
      const { QUESTIONS } = await import('./content.js');
      const prompt = document.querySelector('.question-panel h2')?.textContent;
      const q = QUESTIONS.find(x => x.prompt === prompt);
      const texts = [...document.querySelectorAll('.statement-text')].map(e => e.textContent);
      return texts.map(t => q.statements.find(s => s.text === t)?.correct);
    });
    for (const [i, v] of truth.entries()) await p.locator(`[data-choice="${i}"][data-value="${v}"]`).first().click();
    await p.click('[data-action="check"]');
  },
  'exam-intro': async p => { await p.goto(BASE + '#exam'); },
  'exam-question': async p => { await p.goto(BASE + '#exam'); await p.waitForTimeout(600); await p.click('[data-action="start-exam"]'); },
};

const report = [];
const browser = await chromium.launch();
for (const w of [320, 390, 768, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 844 : 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  for (const [name, go] of Object.entries(SCREENS)) {
    errors.length = 0;
    try { await go(page); await page.waitForTimeout(1200); } catch (e) { errors.push('FLOW: ' + e.message.split('\n')[0]); }
    const m = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth - innerWidth,
      castShown: [...document.querySelectorAll('.cast-img')].filter(i => i.complete && i.naturalWidth).length,
      castBroken: [...document.querySelectorAll('.cast-img')].filter(i => i.complete && !i.naturalWidth).length,
      minFont: Math.min(...[...document.querySelectorAll('p,span,li,button,label,a,small,strong')].filter(e => e.offsetParent && e.textContent.trim() && e.children.length === 0).map(e => parseFloat(getComputedStyle(e).fontSize))),
      fonts: [...new Set([...document.querySelectorAll('h1,h2,p,button')].slice(0, 60).map(e => getComputedStyle(e).fontFamily.split(',')[0]))],
    }));
    await page.screenshot({ path: join(OUT, `${name}-${w}.png`), fullPage: true });
    let axe = null;
    if (w === 390) {
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(async () => await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] }));
      axe = res.violations.map(v => `${v.id}(${v.impact},${v.nodes.length}): ${v.nodes[0]?.target?.join(' ')}`);
    }
    report.push({ name, w, ...m, errors: [...errors], axe });
    console.log(name.padEnd(14), w, 'ovf', m.overflowX, 'cast', m.castShown, m.castBroken ? `BROKEN ${m.castBroken}` : '', 'minFont', m.minFont, m.fonts.join('/'), errors.length ? 'ERR ' + errors.join(' | ').slice(0, 160) : '', axe ? 'axe ' + JSON.stringify(axe) : '');
  }
  await ctx.close();
}
await browser.close();
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
