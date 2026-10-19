// Renders a character folder of SVGs into one contact sheet (sheet.png) for review:
// every pose on light + dark, black silhouettes, and 32/64 px size tests.
// Usage: node docs/redesign/tools/render-sheet.cjs <character-dir>
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

function loadPlaywright() {
  try { return require('playwright'); } catch {}
  const root = execSync(process.platform === 'win32' ? 'npm.cmd root -g' : 'npm root -g', { shell: true }).toString().trim();
  return require(path.join(root, 'playwright'));
}

const dir = path.resolve(process.argv[2] || '.');
const order = ['hero', 'idle', 'thinking', 'correct', 'wrong', 'nervous', 'passed'];
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'))
  .sort((a, b) => (order.indexOf(a.replace('.svg', '')) + 99) % 99 - (order.indexOf(b.replace('.svg', '')) + 99) % 99 || a.localeCompare(b));
if (!files.length) { console.error('No .svg files in', dir); process.exit(1); }

const uri = f => 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64');
const cell = (f, cls, size) => `<figure class="${cls}"><img src="${uri(f)}" style="width:${size}px;height:${size}px"><figcaption>${f.replace('.svg', '')}</figcaption></figure>`;
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;font:600 13px system-ui,sans-serif;background:#fff;color:#333}
h2{font-size:14px;margin:18px 20px 8px;letter-spacing:.06em;text-transform:uppercase;color:#777}
.row{display:flex;flex-wrap:wrap;gap:10px;padding:0 20px}
figure{margin:0;padding:10px;border-radius:14px;text-align:center}
figcaption{margin-top:4px}
.light{background:#F6F3EE}.dark{background:#16142B;color:#ccc}
.sil img{filter:brightness(0)}
.small{background:#F6F3EE;display:flex;align-items:center;gap:12px;padding:10px 14px}
img{display:block;object-fit:contain}
</style>
<h2>Light</h2><div class="row">${files.map(f => cell(f, 'light', 220)).join('')}</div>
<h2>Dark</h2><div class="row">${files.map(f => cell(f, 'dark', 220)).join('')}</div>
<h2>Silhouette</h2><div class="row">${files.map(f => cell(f, 'light sil', 120)).join('')}</div>
<h2>Small sizes (32 / 64 px)</h2><div class="row">${files.map(f => `<div class="small"><img src="${uri(f)}" style="width:32px;height:32px"><img src="${uri(f)}" style="width:64px;height:64px"><span>${f.replace('.svg', '')}</span></div>`).join('')}</div>
<div style="height:20px"></div>`;

(async () => {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.waitForTimeout(300);
  const broken = [...new Set(await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth)
    .map(i => i.closest('figure, .small')?.textContent.trim())))];
  const out = path.join(dir, 'sheet.png');
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log(`Rendered ${files.length} SVGs -> ${out}${broken.length ? `\nERROR: invalid SVG, failed to decode: ${broken.join(', ')}` : ''}`);
  if (broken.length) process.exitCode = 2;
})();
