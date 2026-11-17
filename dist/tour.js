// Sneglen's tour. It really opens each main tab (same as tapping it), waits for the screen to render, dims the rest and rings the one
// thing to look at, while Sneglen slides over with a short line. Closing returns the learner to where they started (Færdig goes to Lær).
// Hooks elsewhere: app.js starts it from data-action="tour" (Profil / settings) and calls maybeStartTour() once after load.
import { renderCast } from './cast.js';

const KEY = 'teoriboost.tour.v1';
// route = the tab to open, ready = a selector that only exists once that screen has rendered, target = what to ring (first one that is visible wins).
const STEPS = [
  { id: 'laer', tab: 'home', route: '#home', ready: '.learn .pn-btn', target: ['.learn .pn-btn', '.learn .unit-banner'],
    title: 'Lær', text: 'Hej, jeg er Sneglen. Her tager du én lektion ad gangen. Start med det gule felt med 1.' },
  { id: 'oevelser', tab: 'practice', route: '#practice', ready: '.practice-page .practice-main-btn', target: ['.practice-page .practice-main-btn', '.practice-page .practice-hero'],
    title: 'Øvelser', text: 'Her træner du på situationer fra vejen. Det du er i tvivl om, kommer igen, så det sidder.' },
  { id: 'proeve', tab: 'exam', route: '#exam', gate: 'exam', ready: '.exam-start .big-btn, .exam-start .btn-primary', target: ['.exam-start .big-btn', '.exam-start .btn-primary', '.exam-start'],
    title: 'Prøve', text: 'Som den rigtige teoriprøve med 25 spørgsmål. Tryk her, når du føler dig klar.' },
  { id: 'minbil', tab: 'minbil', route: '#minbil', ready: '.mybil-road', target: ['.mybil-road'],
    title: 'Min bil', text: 'Her er din egen bil. Du gør den til din med det, du tjener.' },
  { id: 'boosters', tab: 'minbil', route: '#minbil', ready: '#booster-chip', target: ['#booster-chip'],
    title: 'Boosters', text: 'Hver gang du øver, tjener du Boosters. Dem bruger du på din bil.' },
  { id: 'chat', tab: 'chat', route: '#chat', ready: '#chat-input', target: ['#chat-input', '.chat-hero'],
    title: 'Spørg AI', text: 'Forstår du ikke noget? Skriv til mig her. Der er en daglig grænse, så brug den klogt.' },
];

const seen = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return true; } };
const markSeen = () => { try { localStorage.setItem(KEY, '1'); } catch { /* the tour just shows again next time */ } };
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('no-motion');
const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const frame = () => new Promise(r => requestAnimationFrame(() => r()));
const X_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

let active = null;

export function startTour() {
  if (active) return;
  const startHash = location.hash || '#home';
  const prevFocus = document.activeElement;
  let steps = STEPS.slice(), i = 0, token = 0, closed = false, trackId = 0;

  const root = document.createElement('div');
  root.className = 'tour';
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'tour-title');
  root.innerHTML = `<div class="tour__spot is-empty" aria-hidden="true"></div>
    <div class="tour__card" data-side="above">
      <div class="tour__snail" aria-hidden="true">${renderCast('sneglen', { size: 'md', priority: true })}</div>
      <div class="tour__bubble">
        <button type="button" class="tour__close" aria-label="Luk">${X_ICON}</button>
        <div class="tour__dots" aria-hidden="true"></div>
        <h2 class="tour__title" id="tour-title"></h2>
        <p class="tour__text"></p>
        <div class="tour__actions"><button type="button" class="tour__back">Tilbage</button><button type="button" class="tour__next btn btn-primary">Næste</button></div>
      </div>
    </div>
    <p class="tour__sr" role="status" aria-live="polite"></p>`;
  document.body.append(root);
  document.body.classList.add('tour-open');
  const $ = s => root.querySelector(s);
  const spot = $('.tour__spot'), card = $('.tour__card'), next = $('.tour__next'), back = $('.tour__back'), dots = $('.tour__dots'),
    snail = $('.tour__snail'), live = $('.tour__sr'), title = $('.tour__title'), text = $('.tour__text');

  // ---- finding and framing the thing to ring ----
  // A tab behind login or payment is never opened: Sneglen points at its tab and the learner stays where they are.
  const gated = s => {
    if (!s.gate) return false;
    let g = null; try { g = window.__tourGate?.(s.gate); } catch { /* no gate info: treat as open */ }
    if (!g) return false;
    if (g.login) return true;
    const c = g.config;
    if (!c) return true; // billing config not loaded: the app would show the paywall
    if (c.enabled === true && !g.premium) {
      let used = 0; try { const ids = JSON.parse(localStorage.getItem('teoriboost.freeExams.v1.' + (g.uid || 'device')) || '[]'); used = Array.isArray(ids) ? ids.length : 0; } catch { /* count as unused */ }
      return !(used < (Number(c.free?.fullExams) || 0));
    }
    return false;
  };
  const targetsOf = s => s.peek ? [`#mobile-nav a[data-tab="${s.tab}"]`, `#desktop-nav a[data-tab="${s.tab}"]`] : s.target;
  const findTarget = s => { for (const sel of targetsOf(s)) { const el = document.querySelector(sel); if (visible(el)) return el; } return null; };
  const topBar = () => { const h = document.querySelector('header, .topbar, .app-header'); const r = h && visible(h) ? h.getBoundingClientRect() : null; return r && r.top <= 0 && r.height < 140 ? r.bottom : 0; };
  const bottomBar = () => { const n = document.getElementById('mobile-nav'); const r = n && visible(n) ? n.getBoundingClientRect() : null; return r && r.top > innerHeight / 2 ? r.top : innerHeight; };

  // Place the spotlight and the card. The card goes on the side of the target with more room and never covers it.
  const place = () => {
    if (closed) return;
    const s = steps[i], el = s && findTarget(s);
    const vw = innerWidth, vh = innerHeight, gap = 14, edge = 12;
    const cw = card.offsetWidth, ch = card.offsetHeight;
    if (!el) {
      spot.classList.add('is-empty');
      Object.assign(spot.style, { top: `${vh / 2}px`, left: `${vw / 2}px`, width: '0px', height: '0px' });
      card.dataset.side = 'above'; card.style.setProperty('--tail', '50%');
      card.style.setProperty('--x', `${Math.round((vw - cw) / 2)}px`); card.style.setProperty('--y', `${Math.round((vh - ch) / 2)}px`);
      return;
    }
    let r = el.getBoundingClientRect();
    const pad = r.height > 200 || r.width > 320 ? 6 : 8;
    const lo = Math.max(edge, topBar() + 6), hi = Math.min(vh - edge, bottomBar() - 6);
    let x = r.left - pad, y = r.top - pad, w = r.width + pad * 2, h = r.height + pad * 2;
    x = Math.max(6, x); w = Math.min(w, vw - 12 - x + 6);
    // room above / below the ring
    const roomAbove = y - lo - gap, roomBelow = hi - (y + h) - gap;
    let side;
    if (roomBelow >= ch) side = 'below';
    else if (roomAbove >= ch) side = 'above';
    else {
      // Neither side fits (tall target): ring only the top part of it and put the card underneath.
      side = roomBelow >= roomAbove ? 'below' : 'above';
      if (side === 'below') h = Math.max(64, hi - ch - gap * 2 - y); else { const bottom = y + h; y = Math.min(bottom - 64, lo + ch + gap * 2); h = bottom - y; }
    }
    Object.assign(spot.style, { top: `${y}px`, left: `${x}px`, width: `${w}px`, height: `${h}px` });
    spot.style.borderRadius = `${Math.min(22, Math.max(12, Math.min(w, h) / 2.5))}px`;
    spot.classList.remove('is-empty');
    const cx = Math.max(edge, Math.min(vw - edge - cw, x + w / 2 - cw / 2));
    const cy = side === 'below' ? y + h + gap : y - gap - ch;
    card.dataset.side = side;
    card.style.setProperty('--x', `${Math.round(cx)}px`);
    card.style.setProperty('--y', `${Math.round(Math.max(lo - 2, Math.min(vh - ch - edge, cy)))}px`);
    const tail = Math.max(88, Math.min(cw - 28, x + w / 2 - cx));
    card.style.setProperty('--tail', `${Math.round(tail)}px`);
  };
  // Layout can still move for a moment after a screen renders (reveal animations, fonts). Keep the ring glued to the target.
  const track = () => {
    const id = ++trackId, until = performance.now() + 1400;
    const loop = () => { if (closed || id !== trackId) return; place(); if (performance.now() < until) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  };

  // ---- opening the tab for a step ----
  const blocked = () => !!document.querySelector('[data-login-gate]') || [...document.querySelectorAll('dialog[open]')].some(d => d.id !== 'modal');
  const openTab = s => {
    if (location.hash === s.route) return;
    const a = document.querySelector(`#mobile-nav a[data-tab="${s.tab}"], #desktop-nav a[data-tab="${s.tab}"]`);
    if (a) a.click(); // same as the learner tapping the tab
    if (location.hash !== s.route) location.hash = s.route;
  };
  // Resolves true when the screen is ready and settled, false when it never shows up (or the app blocked it with a login or paywall).
  const arrive = async (s, my) => {
    s.peek = gated(s);
    if (!s.peek) openTab(s);
    const t0 = performance.now();
    while (performance.now() - t0 < 7000) {
      if (my !== token || closed) return null;
      if (blocked()) {
        // The login screen remembers where to send the learner after sign-in. That memory came from us, so drop it again.
        if (document.querySelector('[data-login-gate]')) { try { localStorage.removeItem('teoriboost.loginReturn.v1'); } catch { /* nothing stored */ } }
        document.querySelectorAll('dialog[open]').forEach(d => { if (d.id !== 'modal') d.close(); });
        return false;
      }
      if ((s.peek || (location.hash === s.route && document.querySelector(s.ready))) && findTarget(s)) { await sleep(120); await frame(); return my === token; }
      await sleep(80);
    }
    return false;
  };

  // ---- drawing a step ----
  const draw = (animateCard = true) => {
    const s = steps[i], last = i === steps.length - 1;
    title.textContent = s.title; text.textContent = s.text;
    next.textContent = last ? 'Færdig' : 'Næste';
    back.hidden = i === 0;
    dots.innerHTML = steps.map((_, n) => `<i class="${n < i ? 'done' : n === i ? 'now' : ''}"></i>`).join('');
    live.textContent = `Trin ${i + 1} af ${steps.length}. ${s.title}. ${s.text}`;
    if (animateCard) { card.classList.remove('is-in'); snail.classList.remove('hop'); void card.offsetWidth; card.classList.add('is-in'); snail.classList.add('hop'); }
  };
  const show = async (dir = 1) => {
    const my = ++token;
    root.classList.add('is-loading'); next.disabled = back.disabled = true;
    while (i >= 0 && i < steps.length) {
      const s = steps[i];
      const ok = await arrive(s, my);
      if (ok === null) return; // a newer step took over, or the tour closed
      if (ok) {
        const el = findTarget(s);
        if (el) { const r = el.getBoundingClientRect(), lo = topBar() + 8, hi = bottomBar() - 8; if (r.top < lo || r.bottom > hi) { el.scrollIntoView({ block: 'center', behavior: 'instant' }); await frame(); } }
        draw(); await frame();
        if (!root.dataset.placed) { root.classList.add('is-still'); place(); root.dataset.placed = '1'; await frame(); root.classList.remove('is-still'); } // first step: appear in place, do not slide in from the corner
        place(); track();
        root.classList.remove('is-loading'); next.disabled = back.disabled = false;
        if (!root.contains(document.activeElement) || document.activeElement.disabled) next.focus({ preventScroll: true });
        return;
      }
      // This target is not available here (not rendered, or the app asked for a login or payment). Skip it quietly.
      console.info(`[tour] skipped "${s.id}"`);
      steps.splice(i, 1);
      if (dir < 0 && i > 0) i--;
      if (i >= steps.length) { if (dir > 0) return close(true); i = steps.length - 1; }
    }
    if (!steps.length) close(false);
  };

  // ---- leaving ----
  const close = finished => {
    if (closed) return;
    closed = true; token++; markSeen(); active = null;
    window.removeEventListener('resize', onResize); document.removeEventListener('keydown', onKey, true);
    root.classList.add('is-out');
    document.body.classList.remove('tour-open');
    const dest = finished ? '#home' : startHash;
    if (location.hash !== dest) location.hash = dest;
    setTimeout(() => root.remove(), still() ? 0 : 280);
    try { (prevFocus && prevFocus.isConnected ? prevFocus : document.getElementById('main'))?.focus?.({ preventScroll: true }); } catch { /* element is gone */ }
  };
  const go = d => {
    if (closed || next.disabled) return;
    const n = i + d;
    if (n < 0) return;
    if (n >= steps.length) return close(true);
    i = n; show(d);
  };
  const onResize = () => { place(); track(); };
  const onKey = e => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(false); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Tab') {
      const f = [...root.querySelectorAll('button:not([hidden]):not([disabled])')];
      if (!f.length) { e.preventDefault(); return; }
      const k = f.indexOf(document.activeElement);
      if (e.shiftKey && k <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (k === -1 || k === f.length - 1)) { e.preventDefault(); f[0].focus(); }
    }
  };
  next.addEventListener('click', () => go(1));
  back.addEventListener('click', () => go(-1));
  $('.tour__close').addEventListener('click', () => close(false));
  // Swipe left = next, right = back (phones). A mostly vertical drag is left alone.
  let sx = 0, sy = 0, st = 0;
  root.addEventListener('touchstart', e => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
  root.addEventListener('touchend', e => { const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; if (Date.now() - st < 700 && Math.abs(dx) > 48 && Math.abs(dy) < Math.abs(dx) * 0.6) go(dx < 0 ? 1 : -1); }, { passive: true });
  window.addEventListener('resize', onResize); document.addEventListener('keydown', onKey, true);
  active = { close };
  requestAnimationFrame(() => { root.classList.add('is-on'); show(1); });
}

// Show once, after the start screens are out of the way and nothing else is open.
export function maybeStartTour() {
  if (seen()) return;
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    const ready = !document.body.classList.contains('start-mode') && !document.querySelector('dialog[open]') && !document.querySelector('[data-login-gate]') && /^(#?|#home|#practice)$/.test(location.hash) && document.querySelector('#mobile-nav [data-tab], #desktop-nav [data-tab]');
    if (ready) { clearInterval(timer); startTour(); } else if (tries > 40) clearInterval(timer);
  }, 1500);
}
