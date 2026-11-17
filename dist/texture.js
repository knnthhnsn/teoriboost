// Every flat container (cards, panels, tiles, tab strips, modals) gets the same grain as the page and the buttons.
// Rather than listing 140 classes, we find boxes that are a solid colour with no image and mark them; texture.css paints the grain.
const MIN_W = 120, MIN_H = 44;
const CONTROL = 'button,[role="button"],[role="tab"],a.btn,a.chip,.chip,summary,.booster-chip,.gx-back,.topic-cards,.ask-fab';
let queued = false, queue = () => {};
const KINDS = ['asphalt', 'cel', 'paper', 'fine']; // the same class always gets the same kind, so the app stays consistent but not uniform
const hash = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

function solid(cs) {
  const m = /rgba?\(([^)]+)\)/.exec(cs.backgroundColor);
  if (!m) return false;
  const p = m[1].split(',').map(Number);
  return p.length < 4 || p[3] >= 0.6;
}

// Inside a yellow box, text that sits directly on the yellow gets dark ink. Anything that paints its own background (a dark pill, a white label)
// keeps its colours, so we never end up with black on black or white on yellow.
const painted = el => {
  const cs = getComputedStyle(el), m = /rgba?\(([^)]+)\)/.exec(cs.backgroundColor);
  return cs.backgroundImage !== 'none' || (m && (m[1].split(',').map(Number)[3] ?? 1) > 0.3);
};
function inkWalk(node) {
  for (const k of node.children) {
    if (k.dataset.inkDark === undefined && painted(k)) continue;
    k.dataset.inkDark = '';
    inkWalk(k);
  }
}

export function textureScan(root = document) {
  const list = root.querySelectorAll('#view *, dialog *, .topbar .booster-chip, .topbar .icon-btn, .ask-fab');
  for (const el of list) {
    if (el.dataset.grain !== undefined || el.closest('svg,canvas,img,.tour')) continue;
    const r = el.getBoundingClientRect();
    // buttons and chips of any size get the grain too: their states (hover, selected) rewrite `background:` and used to wipe it
    const control = el.matches(CONTROL) && r.width >= 28 && r.height >= 28;
    if (!control && (r.width < MIN_W || r.height < MIN_H)) continue;
    const cs = getComputedStyle(el);
    if (!control && parseFloat(cs.borderTopLeftRadius) < 6 && el.tagName !== 'DIALOG') continue;
    if (!solid(cs)) continue;
    const c = /rgba?\(([^)]+)\)/.exec(cs.backgroundColor)[1].split(',').map(Number);
    if (el.getAnimations().some(a => a.transitionProperty === 'background-color')) { setTimeout(queue, 200); continue; } // mid-fade colour is not the real colour: look again when it has settled
    if (c[0] > 225 && c[1] > 175 && c[2] < 90) { el.dataset.yellow = ''; if (r.height >= 110) el.dataset.big = ''; inkWalk(el); }
    el.dataset.tone = toneOf(c);
    if (cs.backgroundImage !== 'none' && !/feTurbulence/.test(cs.backgroundImage)) { el.style.setProperty('--bg-prev', cs.backgroundImage); el.style.setProperty('--bg-size', cs.backgroundSize); el.style.setProperty('--bg-pos', cs.backgroundPosition); el.style.setProperty('--bg-rep', cs.backgroundRepeat); }
    el.dataset.grain = c[0] > 225 && c[1] > 175 && c[2] < 90 ? 'cel' : KINDS[hash(String(el.className)) % KINDS.length];
  }
}

// A box can change state (a tab turns yellow, a card is chosen). Its marks are then stale, so they are cleared and the box is looked at again.
function unmark(el) {
  if (el.dataset.grain === undefined && el.dataset.yellow === undefined) return;
  for (const k of ['grain', 'yellow', 'big', 'tone']) delete el.dataset[k];
  for (const v of ['--bg-prev', '--bg-size', '--bg-pos', '--bg-rep']) el.style.removeProperty(v);
  el.querySelectorAll('[data-ink-dark]').forEach(k => delete k.dataset.inkDark);
}

const isYellow = el => { const m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(el).backgroundColor); if (!m) return false; const c = m[1].split(',').map(Number); return c[0] > 225 && c[1] > 175 && c[2] < 90; };
// dark / light / yellow surface: the grain is chosen by the surface it sits on, not by the page theme (the garage chips are dark in both themes)
function toneOf(c) { if (c[0] > 225 && c[1] > 175 && c[2] < 90) return 'yellow'; return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] < 120 ? 'dark' : 'light'; }
const toneNow = el => { const m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(el).backgroundColor); return m ? toneOf(m[1].split(',').map(Number)) : ''; };

export function initTexture() {
  const run = () => { queued = false; try { document.querySelectorAll('[data-grain]').forEach(el => { if (!el.getAnimations().some(a => a.transitionProperty === 'background-color') && (isYellow(el) !== (el.dataset.yellow !== undefined) || toneNow(el) !== el.dataset.tone)) unmark(el); }); textureScan(); document.querySelectorAll('[data-yellow]').forEach(inkWalk); } catch { /* texture is decoration only */ } };
  queue = () => { if (!queued) { queued = true; setTimeout(run, 120); } };
  document.addEventListener('transitionend', e => { if (e.propertyName === 'background-color') queue(); }, true); // a chip that fades yellow <-> dark is judged after the fade, not during it
  new MutationObserver(muts => {
    for (const m of muts) if (m.type === 'attributes' && m.target.dataset && (m.target.dataset.grain !== undefined || m.target.dataset.yellow !== undefined)) unmark(m.target);
    queue();
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-selected', 'aria-current', 'aria-pressed'] });
  new MutationObserver(queue).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); // theme switch: dark boxes turn light and the other way
  document.addEventListener('click', () => setTimeout(queue, 250), true);
  queue();
}
