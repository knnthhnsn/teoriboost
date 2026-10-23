// Step 1 of the GlowUp art: renders each vehicle with the app's own vehicleLayers, as transparent 768px PNGs:
//   <base>-wreck-body / -wreck-wheels    the rusty start
//   <base>-dream-body / -dream-wheels    the restored, repainted build without its add-on parts
//   <base>-part-<id>                     each add-on part on its own (stripes, spoiler, lights, plate ...), in place
// Needs the dev server (npm run dev) and Playwright.
// G=$(npm root -g) node tools/rive/glowup-render.mjs <out dir>; then python tools/rive/glowup-pack.py <out dir>; node tools/rive/build-glowup.mjs
import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const req = createRequire(process.env.G + '/x.js'); const { chromium } = req('playwright');
const out = process.argv[2];
// parts that stay in the repaint itself; every other equipped part flies on afterwards
const BUILT_IN = /^(restore|paint-mask|windows-mask|wheels-)/;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 900 } });
await p.goto('http://127.0.0.1:4178/?r#home'); await p.waitForTimeout(1500);
const info = {};
const shot = name => p.locator('#rv').screenshot({ path: `${out}/${name}.png`, omitBackground: true });
// show: 'body' | 'wheels' | 'part:<id>'; hide: part ids to leave out of the body
const show = (what, hide = []) => p.evaluate(({ what, hide }) => {
  const box = document.querySelector('#rv'), body = box.querySelector('.mybil-body'), wheels = box.querySelector('.mybil-wheels');
  const all = [...box.querySelectorAll('.mybil-body > *, .mybil-wheels > *')];
  const of = id => { const el = box.querySelector(`[data-layer="${id}"]`); if (!el) return []; const els = [el]; if (el.classList.contains('mybil-tint')) els.push(el.nextElementSibling); if (id === 'plate-blank') els.push(box.querySelector('.mybil-plate')); return els.filter(Boolean); };
  all.forEach(el => { el.style.visibility = ''; });
  body.style.visibility = what === 'wheels' ? 'hidden' : 'visible'; wheels.style.visibility = what === 'wheels' ? 'visible' : 'hidden';
  if (what.startsWith('part:')) { const keep = new Set(of(what.slice(5))); all.forEach(el => { el.style.visibility = keep.has(el) ? 'visible' : 'hidden'; }); }
  else hide.forEach(id => of(id).forEach(el => { el.style.visibility = 'hidden'; }));
}, { what, hide });
for (const base of ['scooter', 'smallcar', 'bigcar', 'racecar']) {
  for (const state of ['wreck', 'dream']) {
    const parts = await p.evaluate(async ({ base, state }) => {
      const { vehicleLayers } = await import('/mybil.js'); const { DREAMS } = await import('/start.js');
      const d = DREAMS[base], dream = state === 'dream';
      const g = { spent: 0, earnedSeen: 0, owned: [], bases: [base], active: base, equipped: { [base]: dream ? d.equipped : {} }, style: { [base]: dream ? { ...d.style } : {} } };
      document.querySelector('#rv')?.remove();
      document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent';
      for (const el of document.body.children) el.style.visibility = 'hidden';
      const box = document.createElement('div'); box.id = 'rv';
      box.style.cssText = 'position:fixed;left:0;top:0;width:768px;height:768px;z-index:99999;visibility:visible';
      box.innerHTML = vehicleLayers(g); document.body.append(box);
      // the layers stack like they do inside the app's vehicle stages
      if (!document.querySelector('#rv-style')) document.head.insertAdjacentHTML('beforeend', '<style id="rv-style">#rv img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}</style>');
      box.querySelector('.mybil-neon')?.remove();
      await Promise.all([...box.querySelectorAll('img')].map(i => i.decode().catch(() => {})));
      await document.fonts.ready; await new Promise(r => setTimeout(r, 300));
      // equipped parts actually drawn, in the order the slots stack them
      return [...box.querySelectorAll('[data-layer]')].map(el => el.dataset.layer);
    }, { base, state });
    const fly = state === 'dream' ? parts.filter(id => !BUILT_IN.test(id)) : [];
    if (state === 'dream') info[base] = { parts: fly };
    await show('body', fly); await shot(`${base}-${state}-body`);
    await show('wheels'); await shot(`${base}-${state}-wheels`);
    for (const id of fly) { await show('part:' + id); await shot(`${base}-part-${id}`); }
  }
}
writeFileSync(`${out}/parts.json`, JSON.stringify(info, null, 1));
console.log(JSON.stringify(info)); await b.close();
