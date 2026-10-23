// Step 1 of the GlowUp art: renders each vehicle's wreck and dream build (body and wheels apart) with the app's own
// vehicleLayers, as transparent PNGs. Needs the dev server (npm run dev) and Playwright.
// G=$(npm root -g) node tools/rive/glowup-render.mjs <out dir>; then python tools/rive/glowup-pack.py <out dir>; node tools/rive/build-glowup.mjs
import { createRequire } from 'node:module'; const req = createRequire(process.env.G + '/x.js'); const { chromium } = req('playwright');
const out = process.argv[2];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 900 } });
await p.goto('http://127.0.0.1:4178/?r#home'); await p.waitForTimeout(1500);
const info = {};
for (const base of ['scooter', 'smallcar', 'bigcar', 'racecar']) {
  for (const state of ['wreck', 'dream']) {
    const neon = await p.evaluate(async ({ base, state }) => {
      const { vehicleLayers } = await import('/mybil.js'); const { DREAMS } = await import('/start.js');
      const d = DREAMS[base], dream = state === 'dream';
      const g = { spent: 0, earnedSeen: 0, owned: [], bases: [base], active: base, equipped: { [base]: dream ? d.equipped : {} }, style: { [base]: dream ? { ...d.style } : {} } };
      document.querySelector('#rv')?.remove();
      document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent';
      for (const el of document.body.children) el.style.visibility = 'hidden';
      const box = document.createElement('div'); box.id = 'rv';
      box.style.cssText = 'position:fixed;left:0;top:0;width:768px;height:768px;z-index:99999;visibility:visible';
      box.innerHTML = vehicleLayers(g); document.body.append(box);
      box.querySelector('.mybil-neon')?.remove();
      await Promise.all([...box.querySelectorAll('img')].map(i => i.decode().catch(() => {})));
      await document.fonts.ready; await new Promise(r => setTimeout(r, 300));
      return d.style.neon;
    }, { base, state });
    info[base] = { neon };
    for (const part of ['body', 'wheels']) {
      await p.evaluate(part => { const box = document.querySelector('#rv'); box.querySelector('.mybil-body').style.visibility = part === 'body' ? 'visible' : 'hidden'; box.querySelector('.mybil-wheels').style.visibility = part === 'wheels' ? 'visible' : 'hidden'; }, part);
      await p.locator('#rv').screenshot({ path: `${out}/${base}-${state}-${part}.png`, omitBackground: true });
    }
  }
}
console.log(JSON.stringify(info)); await b.close();
