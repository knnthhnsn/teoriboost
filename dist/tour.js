// A skippable guided tour: Sneglen walks the learner through the five tabs. A spotlight glides from tab to tab, the card springs in,
// words appear one by one, and the end bursts into confetti. Shown once; replay from Indstillinger. Respects reduced motion.
import { renderCast } from './cast.js';

const KEY = 'teoriboost.tour.v1';
const STEPS = [
  { title: 'Hej, jeg er Sneglen', text: 'Jeg viser dig rundt på under et minut. Du kan springe over, når du vil.' },
  { tab: 'home', title: 'Lær', text: 'Små lektioner, én regel ad gangen. Start altid her.' },
  { tab: 'practice', title: 'Øvelser', text: 'Her træner du reglerne på situationer fra vejen. Det du er i tvivl om, kommer igen, så det sidder.' },
  { tab: 'exam', title: 'Prøve', text: 'Som den rigtige teoriprøve med 25 spørgsmål. Tag den, når du føler dig klar.' },
  { tab: 'minbil', title: 'Min bil', text: 'De Boosters du tjener, bruger du på din egen bil. Gør den helt din.' },
  { tab: 'chat', title: 'Spørg AI', text: 'Forstår du ikke et spørgsmål? Spørg mig. Der er en daglig grænse, så brug det klogt.' },
  { title: 'Klar!', text: 'Så er du kørende. Tag din første lektion, og tag den i dit eget tempo.', last: true },
];
const seen = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return true; } };
const markSeen = () => { try { localStorage.setItem(KEY, '1'); } catch { /* the tour just shows again next time */ } };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const words = (t, base) => t.split(' ').map((w, i) => `<span class="tour__w" style="--d:${base + i * 32}ms">${esc(w)}</span>`).join(' ');

let active = null;

export function startTour() {
  if (active) return;
  const prevFocus = document.activeElement;
  const root = document.createElement('div');
  root.className = 'tour';
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Rundvisning med Sneglen');
  root.innerHTML = `<div class="tour__spot" aria-hidden="true"></div>
    <div class="tour__card"><div class="tour__snail" aria-hidden="true">${renderCast('sneglen', { size: 'md', priority: true })}</div>
      <div class="tour__body"><div class="tour__dots" aria-hidden="true"></div><h2 class="tour__title"></h2><p class="tour__text" aria-live="polite"></p>
        <div class="tour__actions"><button type="button" class="tour__skip">Spring over</button><button type="button" class="tour__back">Tilbage</button><button type="button" class="tour__next btn btn-primary"></button></div></div></div>
    <div class="tour__confetti" aria-hidden="true"></div>`;
  document.body.append(root);
  document.body.classList.add('tour-open');
  const spot = root.querySelector('.tour__spot'), card = root.querySelector('.tour__card'), next = root.querySelector('.tour__next'),
    back = root.querySelector('.tour__back'), dots = root.querySelector('.tour__dots'), snail = root.querySelector('.tour__snail');
  let i = 0;

  const targetFor = tab => { for (const id of ['mobile-nav', 'desktop-nav']) { const el = document.querySelector(`#${id} [data-tab="${tab}"]`); if (el && el.getClientRects().length) return el; } return null; };
  const place = () => {
    const s = STEPS[i], el = s.tab && targetFor(s.tab);
    if (el) {
      const r = el.getBoundingClientRect(), pad = 8;
      Object.assign(spot.style, { top: `${r.top - pad}px`, left: `${r.left - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px`, borderRadius: '20px' }); spot.classList.remove('is-empty');
      if (innerWidth >= 900 && r.right < 320) { card.dataset.at = 'side'; card.style.left = `${r.right + 28}px`; card.style.top = `${Math.max(16, Math.min(innerHeight - 230, r.top - 40))}px`; }
      else { card.dataset.at = r.top + r.height / 2 > innerHeight / 2 ? 'top' : 'bottom'; card.style.left = card.style.top = ''; }
    } else {
      Object.assign(spot.style, { top: `${innerHeight / 2}px`, left: `${innerWidth / 2}px`, width: '0px', height: '0px', borderRadius: '50%' }); spot.classList.add('is-empty');
      card.dataset.at = 'center'; card.style.left = card.style.top = '';
    }
  };
  const confetti = () => {
    if (reduced()) return;
    const c = root.querySelector('.tour__confetti'); c.innerHTML = '';
    const colours = ['#FFD60A', '#58CC02', '#FFFFFF', '#FF6B35', '#4DA3FF'];
    for (let n = 0; n < 40; n++) {
      const p = document.createElement('i'), a = (n / 40) * Math.PI * 2, v = 120 + Math.random() * 220;
      p.style.cssText = `--x:${Math.cos(a) * v}px;--y:${Math.sin(a) * v - 120}px;--r:${(Math.random() * 720 - 360) | 0}deg;--c:${colours[n % 5]};--d:${(Math.random() * 120) | 0}ms`;
      c.append(p);
    }
  };
  const render = () => {
    const s = STEPS[i];
    root.querySelector('.tour__title').innerHTML = words(s.title, 0);
    root.querySelector('.tour__text').innerHTML = words(s.text, 120);
    next.textContent = s.last ? 'Start første lektion' : i === 0 ? 'Vis mig rundt' : 'Næste';
    back.hidden = i === 0; root.querySelector('.tour__skip').hidden = !!s.last;
    dots.innerHTML = STEPS.map((_, n) => `<i class="${n < i ? 'done' : n === i ? 'now' : ''}"></i>`).join('');
    card.classList.remove('is-in'); snail.classList.remove('hop'); void card.offsetWidth; card.classList.add('is-in'); snail.classList.add('hop');
    place();
    if (s.last) confetti();
  };
  const close = go => {
    markSeen(); active = null; document.body.classList.remove('tour-open');
    window.removeEventListener('resize', place); document.removeEventListener('keydown', onKey, true);
    root.classList.add('is-out'); setTimeout(() => root.remove(), reduced() ? 0 : 320);
    if (go) location.hash = '#home';
    try { prevFocus?.focus?.(); } catch { /* element is gone */ }
  };
  const step = d => { const n = i + d; if (n < 0) return; if (n >= STEPS.length) return close(true); i = n; render(); };
  const onKey = e => {
    if (e.key === 'Escape') { e.preventDefault(); close(false); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Tab') { const f = [...root.querySelectorAll('button:not([hidden])')], k = f.indexOf(document.activeElement); e.preventDefault(); f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length]?.focus(); }
  };
  next.addEventListener('click', () => step(1));
  back.addEventListener('click', () => step(-1));
  root.querySelector('.tour__skip').addEventListener('click', () => close(false));
  window.addEventListener('resize', place); document.addEventListener('keydown', onKey, true);
  active = { close };
  requestAnimationFrame(() => { root.classList.add('is-on'); render(); next.focus(); });
}

// Show once, after the start screens are out of the way and nothing else is open.
export function maybeStartTour() {
  if (seen()) return;
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    const ready = !document.body.classList.contains('start-mode') && !document.querySelector('dialog[open]') && /^(#?|#home|#practice)$/.test(location.hash) && document.querySelector('#mobile-nav [data-tab], #desktop-nav [data-tab]');
    if (ready) { clearInterval(timer); startTour(); } else if (tries > 40) clearInterval(timer);
  }, 1500);
}
