// Renders the website's glow-up frames from the app itself: each vehicle as a wreck, restored, and then one more
// part at a time until the full "lækker" build (start.js DREAMS) with neon, plate and lowered body. The frames are
// cumulative, so blending (tints multiply with the body) is exactly as in the app. Writes
// site/assets/glowup/{vehicle}-{nn}.webp and site/assets/glowup/frames.json (part names per frame).
// Needs the app served on 127.0.0.1:4178. Run: G=$(npm root -g) node tools/site-glowup.mjs
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const req = createRequire(join(process.env.G || '', 'x.js'));
const { chromium } = req('playwright');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'site', 'assets', 'glowup');
const PY = process.env.PY || join(process.env.LOCALAPPDATA || '', 'natkoersel-gen', 'venv', 'Scripts', 'python.exe');
const SIZE = 720;
const PLATE_FIX = {}; // the catalog's plate boxes now come from each plate's white face (build_layers.py plate_face)
const NAMES = { restore: 'Restaurering', paint: 'Lakering', stripe: 'Striber', windows: 'Tonede ruder', wheels: 'Fælge', mirrors: 'Spejle',
  charm: 'Pynt', top: 'Tag', plate: 'Nummerplade', lights: 'Lygter', front: 'Front', bar: 'Kofangerbøjle', exhaust: 'Udstødning', kit: 'Bodykit', neon: 'Neon' };

mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:4178/?r#home'); await p.waitForTimeout(800);
const plan = await p.evaluate(async size => {
  const { vehicleLayers } = await import('/mybil.js');
  const { DREAMS } = await import('/start.js');
  // only the vehicle's own CSS (redesign.css: layers, tints, neon, plate, the Rubik font); the page's textured backgrounds go
  document.querySelectorAll('link[rel="stylesheet"]').forEach(l => { if (!/redesign\.css/.test(l.href)) l.remove(); });
  document.querySelectorAll('style').forEach(s => s.remove());
  document.documentElement.removeAttribute('data-theme');
  document.body.className = ''; document.body.innerHTML = '';
  await document.fonts.load('800 40px Rubik');
  const css = document.createElement('style');
  css.textContent = `*{animation:none!important;transition:none!important}html,body,html[data-theme] body,html[data-theme] body.journey-surface{background:none!important}
    html::before,html::after,body::before,body::after{display:none!important}
    .shot{position:fixed;left:0;top:0;width:${size}px;height:${size}px}.shot img{position:absolute;inset:0;width:100%;height:100%}`;
  document.head.append(css);
  const out = {};
  for (const [base, d] of Object.entries(DREAMS)) {
    const steps = []; const keys = Object.keys(d.equipped);
    const first = keys.filter(k => k === 'restore' || k === 'paint'), rest = keys.filter(k => !first.includes(k));
    const garage = (equipped, extra = {}) => ({ spent: 0, earnedSeen: 0, owned: [], bases: [base], active: base, equipped: { [base]: equipped },
      style: { [base]: { ...d.style, neonOn: false, lowered: false, ...extra } } });
    const pick = ks => Object.fromEntries(ks.map(k => [k, d.equipped[k]]));
    steps.push({ part: 'wreck', html: vehicleLayers(garage({})) });
    steps.push({ part: first.includes('restore') ? 'restore' : 'paint', html: vehicleLayers(garage(pick(first))) });
    rest.forEach((k, i) => steps.push({ part: k, html: vehicleLayers(garage(pick([...first, ...rest.slice(0, i + 1)]))) }));
    steps.push({ part: 'neon', html: vehicleLayers(garage(d.equipped, { neonOn: true, lowered: true })) });
    out[base] = steps;
  }
  window.__plan = out;
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.map(s => s.part)]));
}, SIZE);

const manifest = {};
for (const [base, parts] of Object.entries(plan)) {
  manifest[base] = [];
  for (let i = 0; i < parts.length; i++) {
    await p.evaluate(([base, i]) => { document.body.innerHTML = `<div class="shot">${window.__plan[base][i].html}</div>`; }, [base, i]);
    await p.evaluate(() => Promise.all([...document.images].map(im => im.decode().catch(() => {}))));
    // the scooter's plate box in the app's catalog starts 5 % to the right of its drawn plate; use the drawn plate.
    // Then the plate text shrinks until it fits inside it (wide letters like Æ overflowed the app's sizing).
    await p.evaluate(fix => {
      const t = document.querySelector('.mybil-plate b'); if (!t) return;
      if (fix) Object.assign(t.parentElement.style, { left: `${fix[0] * 100}%`, top: `${fix[1] * 100}%`, width: `${(fix[2] - fix[0]) * 100}%`, height: `${(fix[3] - fix[1]) * 100}%` });
      let fs = parseFloat(getComputedStyle(t).fontSize);
      while (t.offsetWidth > t.parentElement.clientWidth * .9 && fs > 4) { fs -= .25; t.style.fontSize = `${fs}px`; }
    }, PLATE_FIX[base] || null);
    await p.waitForTimeout(80);
    const png = join(OUT, `${base}-${String(i).padStart(2, '0')}.png`);
    await p.locator('.shot').screenshot({ path: png, omitBackground: true });
    manifest[base].push({ part: parts[i], name: NAMES[parts[i]] || (parts[i] === 'wreck' ? 'Som du får den' : parts[i]) });
  }
}
await b.close();
// png -> webp: every frame of a vehicle is cropped to the same box (the union of what is drawn, so the frames
// still stack exactly), scaled to at most 640 px wide, and the pngs are dropped
execFileSync(PY, ['-c', `
import glob, os
from PIL import Image
out = r'''${OUT}'''
for v in ${JSON.stringify(Object.keys(plan))}:
    fs = sorted(glob.glob(os.path.join(out, v + '-*.png')))
    box = None
    for f in fs:
        b = Image.open(f).getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    box = (max(0, box[0] - 8), max(0, box[1] - 8), min(${SIZE}, box[2] + 8), min(${SIZE}, box[3] + 8))
    for f in fs:
        im = Image.open(f).crop(box)
        if im.width > 640: im = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
        im.save(f[:-4] + '.webp', 'WEBP', quality=80, method=6); os.remove(f)
    print(v, 'box', box, 'size', im.size)
`], { stdio: 'inherit' });
writeFileSync(join(OUT, 'frames.json'), JSON.stringify(manifest, null, 1));
// teoriboost.dk keeps /assets in the browser's cache for a week, so frames that change get a new address: a hash
// of all frames goes into every reference (site/index.html) and into site.js (FRAMES_V)
const hash = createHash('sha1'); for (const f of readdirSync(OUT).filter(f => f.endsWith('.webp')).sort()) hash.update(readFileSync(join(OUT, f)));
const V = hash.digest('hex').slice(0, 8);
const SITE = join(ROOT, 'site');
const html = readFileSync(join(SITE, 'index.html'), 'utf8').replace(/(assets\/glowup\/[a-z]+-\d\d\.webp)(\?v=[0-9a-f]+)?/g, `$1?v=${V}`);
writeFileSync(join(SITE, 'index.html'), html);
const js = readFileSync(join(SITE, 'site.js'), 'utf8').replace(/const FRAMES_V = '[0-9a-f]*'/, `const FRAMES_V = '${V}'`);
if (!js.includes(`FRAMES_V = '${V}'`)) throw new Error('site.js has no FRAMES_V');
writeFileSync(join(SITE, 'site.js'), js);
console.log('frames version', V);
console.log(Object.fromEntries(Object.entries(manifest).map(([k, v]) => [k, v.map(s => s.part).join(' > ')])));
