// Start page and first-run intro. The hero is a "glow-up machine": each vehicle rolls in rusty,
// a scan line restores and repaints it, then its tuning parts pop on one by one.
import { ico } from './ui-icons.js';
import { renderCast } from './cast.js';
import { vehicleLayers, boosterIcon, BOOSTER_RATES, BASES, baseSrc } from './mybil.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = n => Number(n).toLocaleString('da-DK');
const still = () => document.body.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;

export const INTRO_KEY = 'teoriboost.intro.v1';
export function loadIntro(store = globalThis.localStorage) { try { return JSON.parse(store.getItem(INTRO_KEY)) || {}; } catch { return {}; } }
export function saveIntro(patch, store = globalThis.localStorage) { const v = { ...loadIntro(store), ...patch }; try { store.setItem(INTRO_KEY, JSON.stringify(v)); } catch {} return v; }

/** The "lækker" build of each vehicle, used by the hero loop and by "Se hvad den kan blive". */
export const DREAMS = {
  scooter: { from: 'Rusten scooter', to: 'Lækker scooter', equipped: { restore: 'restore', paint: 'paint-mask', stripe: 'stripe-racing', wheels: 'wheels-chrome', mirrors: 'mirrors-cat', charm: 'charm-heart', top: 'top-bow', plate: 'plate-blank' }, style: { paint: '#FF5FA2', stripe: '#FFFFFF', neon: '#B44CFF', neonOn: true, lowered: true, plate: 'LÆKKER' } },
  smallcar: { from: 'Slidt lille bil', to: 'Lækker lille bil', equipped: { paint: 'paint-mask', stripe: 'stripe-racing', windows: 'windows-mask', wheels: 'wheels-chrome', top: 'top-spoiler', lights: 'lights-fog', front: 'front-led', plate: 'plate-blank' }, style: { paint: '#14E0F0', stripe: '#111111', windows: '#2A2D3A', neon: '#FF2D9B', neonOn: true, lowered: true, plate: 'BOOST' } },
  bigcar: { from: 'Stor slidt bil', to: 'Lækker stor bil', equipped: { paint: 'paint-mask', stripe: 'stripe-side', windows: 'windows-mask', wheels: 'wheels-big', bar: 'bar-chrome', lights: 'lights-roofbar', exhaust: 'exhaust-4', plate: 'plate-blank' }, style: { paint: '#7B4DFF', stripe: '#FFD400', windows: '#1E2230', neon: '#14E0F0', neonOn: true, lowered: true, plate: 'TEORI 1' } },
  racecar: { from: 'Ødelagt racerbil', to: 'Lækker racerbil', equipped: { paint: 'paint-mask', stripe: 'stripe-racing', windows: 'windows-mask', wheels: 'wheels-sport', top: 'top-wing', kit: 'kit-street', exhaust: 'exhaust-6', plate: 'plate-blank' }, style: { paint: '#FFD400', stripe: '#111111', windows: '#202020', neon: '#39FF14', neonOn: true, lowered: true, plate: 'BESTÅET' } },
};
const ORDER = ['scooter', 'smallcar', 'bigcar', 'racecar'];
const garageFor = (base, dream) => ({ spent: 0, earnedSeen: 0, owned: [], bases: [base], active: base,
  equipped: { [base]: dream ? DREAMS[base].equipped : {} }, style: { [base]: dream ? { ...DREAMS[base].style, lowered: false } : {} } });

export function glowUp(bases = ORDER, { loop = true, label = true } = {}) {
  return `<div class="gu" data-glowup="${bases.join(',')}" data-loop="${loop ? 1 : 0}" role="img" aria-label="${esc(DREAMS[bases[0]].from)} bliver til ${esc(DREAMS[bases[0]].to)}, del for del">
    <svg class="gu-scene" viewBox="0 0 400 400" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <rect class="sc-open" x="46" y="34" width="308" height="250" rx="22"/>
      <path class="sc-door" d="M46 56a22 22 0 0 1 22-22h264a22 22 0 0 1 22 22v62H46Z"/>
      <path class="sc-slat" d="M46 74h308M46 94h308"/>
      <path class="sc-road" d="M176 246h48l176 154H0Z"/>
      <g class="sc-dashes"><path d="M197 258h6l2 16h-10Z"/><path d="M194 292h12l4 30h-20Z"/><path d="M188 348h24l7 52h-38Z"/></g>
    </svg>
    <span class="gu-rays" aria-hidden="true"></span><span class="gu-ring" aria-hidden="true"></span>
    <div class="gu-stage" aria-hidden="true"></div>
    ${label ? '<div class="gu-label" aria-hidden="true"><span class="gu-from"></span><b class="gu-arrow">→</b><span class="gu-to"></span></div>' : ''}
  </div>`;
}

/** Runs the glow-up timeline in a host made by glowUp(). Returns a dispose function. */
export function mountGlowUp(host, { sound = () => {}, onDone = () => {} } = {}) {
  const root = host.querySelector('.gu') || host; const stage = root.querySelector('.gu-stage'); if (!stage) return () => {};
  const bases = (root.dataset.glowup || 'scooter').split(','), loop = root.dataset.loop === '1';
  let timers = [], index = 0, dead = false;
  const at = (ms, fn) => timers.push(setTimeout(() => { if (!dead) fn(); }, ms));
  const from = root.querySelector('.gu-from'), to = root.querySelector('.gu-to');
  function show(base) {
    const d = DREAMS[base];
    root.dataset.active = base; // the poster colour behind the machine follows the vehicle
    stage.innerHTML = `<div class="gu-car" data-base="${base}"><div class="gu-before">${vehicleLayers(garageFor(base, false))}</div><div class="gu-after">${vehicleLayers(garageFor(base, true))}</div><i class="gu-scan"></i></div>`;
    if (from) { from.textContent = d.from; to.textContent = d.to; root.classList.remove('is-done'); }
    const after = stage.querySelector('.gu-after'), car = stage.querySelector('.gu-car');
    const parts = [...after.querySelectorAll('[data-layer]')].filter(el => !['restore', 'paint-mask'].includes(el.dataset.layer));
    const hide = el => { el.classList.add('gu-hidden'); if (el.classList.contains('mybil-tint')) el.nextElementSibling?.classList.add('gu-hidden'); };
    parts.forEach(hide); after.querySelector('.mybil-plate')?.classList.add('gu-hidden'); after.querySelector('.mybil-neon')?.classList.add('gu-hidden');
    if (still()) { // no motion: show the finished build straight away
      car.classList.add('is-restored'); after.querySelectorAll('.gu-hidden').forEach(el => el.classList.remove('gu-hidden'));
      after.querySelector('.mybil-body')?.classList.add('is-lowered'); root.classList.add('is-done'); onDone(); return;
    }
    car.classList.add('is-in');
    at(650, () => { car.classList.add('is-cough'); puffs(car); sound('rev-' + base); });
    at(1500, () => { car.classList.add('is-restoring'); sound('paint'); });
    at(2450, () => { car.classList.add('is-restored'); root.classList.add('is-done'); });
    let t = 2550;
    for (const el of parts) {
      at(t, () => { el.classList.remove('gu-hidden'); el.nextElementSibling?.classList.remove('gu-hidden'); el.classList.add('gu-pop'); sparks(car, 7); if (el.dataset.layer === 'plate-blank') after.querySelector('.mybil-plate')?.classList.remove('gu-hidden'); });
      t += 260;
    }
    at(2550 + 120, () => sound('part'));
    at(t + 50, () => { after.querySelector('.mybil-neon')?.classList.remove('gu-hidden'); sound('neon'); });
    at(t + 450, () => { after.querySelector('.mybil-body')?.classList.add('is-lowered'); car.classList.add('is-landed'); sound('lower'); });
    at(t + 700, () => { sparks(car, 18); sound('booster'); });
    if (loop) at(t + 2900, () => { car.classList.add('is-out'); });
    at(t + (loop ? 3400 : 900), () => { if (loop) { index = (index + 1) % bases.length; show(bases[index]); } else onDone(); });
  }
  show(bases[0]);
  return () => { dead = true; timers.forEach(clearTimeout); timers = []; };
}

export function sparks(host, n) {
  const box = document.createElement('div'); box.className = 'fx-sparks'; box.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'), a = Math.PI * 2 * i / n + Math.random() * .5, d = 40 + Math.random() * 90;
    s.style.setProperty('--dx', (Math.cos(a) * d).toFixed(1) + 'px'); s.style.setProperty('--dy', (Math.sin(a) * d * .7 - 20).toFixed(1) + 'px');
    s.style.setProperty('--h', ['#D5FF62', '#FFD400', '#14E0F0', '#FF5FA2', '#B44CFF'][i % 5]); s.style.animationDelay = (Math.random() * .08).toFixed(2) + 's';
    box.append(s);
  }
  host.append(box); setTimeout(() => box.remove(), 1100);
}
function puffs(host) {
  const box = document.createElement('div'); box.className = 'fx-puffs'; box.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 5; i++) { const s = document.createElement('i'); s.style.animationDelay = (i * .12) + 's'; s.style.setProperty('--s', (.6 + Math.random() * .7).toFixed(2)); box.append(s); }
  host.append(box); setTimeout(() => box.remove(), 1700);
}

/** Confetti that falls with a little air resistance. Canvas, one burst, then it cleans up. */
export function confetti({ count = 140, origin = { x: .5, y: .35 } } = {}) {
  if (still()) return;
  const c = document.createElement('canvas'); c.className = 'fx-confetti'; c.setAttribute('aria-hidden', 'true');
  const dpr = Math.min(2, devicePixelRatio || 1); c.width = innerWidth * dpr; c.height = innerHeight * dpr; document.body.append(c);
  const g = c.getContext('2d'); g.scale(dpr, dpr);
  const colors = ['#D5FF62', '#58CC02', '#FFD400', '#14E0F0', '#FF5FA2', '#7B4DFF', '#FF8A00'];
  const ps = Array.from({ length: count }, () => {
    const a = -Math.PI / 2 + (Math.random() - .5) * 1.9, v = 7 + Math.random() * 9;
    return { x: origin.x * innerWidth, y: origin.y * innerHeight, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6.28, vr: (Math.random() - .5) * .4,
      w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, c: colors[(Math.random() * colors.length) | 0], round: Math.random() < .3 };
  });
  const t0 = performance.now();
  (function frame(t) {
    const k = (t - t0) / 1000; g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of ps) {
      p.vx *= .985; p.vy = p.vy * .985 + .32; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - Math.max(0, k - 1.6) / .6); g.fillStyle = p.c;
      if (p.round) { g.beginPath(); g.arc(0, 0, p.w / 2, 0, 6.28); g.fill(); } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 1);
      g.restore();
    }
    if (k < 2.2) requestAnimationFrame(frame); else c.remove();
  })(t0);
}

const TOPICS = ['Vigepligt', 'Rundkørsel', 'Hastighed', 'Mørkekørsel', 'Overhaling', 'Motorvej', 'Glat føre', 'Skilte', 'Bremselængde', 'Cyklister', 'Parkering', 'Lys', 'Alkohol', 'Vejafmærkning'];
const ticker = () => { const row = TOPICS.map(t => `<span>${t}</span>`).join(''); return `<div class="start-ticker" aria-hidden="true"><div>${row}${row}</div></div>`; };
const words = (text, cls = '') => text.split(' ').map((w, i) => `<span class="kw ${cls}" style="--w:${i}">${w}</span>`).join(' ');

function hero({ counts }) {
  const smile = `<span class="kw kw-smile" style="--w:4">smil.<svg viewBox="0 0 120 24" aria-hidden="true"><path d="M4 14 C 30 26, 80 26, 116 8"/></svg></span>`;
  return `<section class="start-hero" aria-labelledby="start-title">
    <header class="start-top"><a class="brand start-brand" href="#home" data-start-skip aria-label="TeoriBoost, spring introen over"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64" focusable="false"><path d="M9.8 46.8h6.8l16-29.6h-6.8zM20.6 46.8h6.8l16-29.6h-6.8zM31.4 46.8h6.8l16-29.6h-6.8z"/></svg></span><span>TeoriBoost</span></a>
      <a class="start-skip" href="#home" data-start-skip>Spring over</a></header>
    
    <div class="start-show">
      ${glowUp(ORDER, { loop: true, label: false })}
      <div class="start-cast" aria-hidden="true"><span class="sc sc--kegle">${renderCast('kegle', { size: 'sm', priority: true })}</span></div>
    </div>
    <div class="start-copy">
      <h1 id="start-title" class="start-title"><span class="kl">${words('Bestå teoriprøven.')}</span><span class="kl">${words('Med et', 'kw-b')} ${smile}</span></h1>
      <p class="start-lead">5 minutter om dagen. Byg din bil op, mens du lærer.</p>
      ${ticker()}
      <div class="start-actions"><span class="cta-rive" data-rive="cta"><a class="start-cta rive-keep" href="#start:1" data-start-go>Kom i gang · gratis</a></span></div>
    </div>
  </section>`;
}

const WHEN = [['2w', 'Inden for 2 uger', 'Turbo-plan'], ['1m', 'Om ca. 1 måned', 'Rolig plan'], ['3m', 'Om 2–3 måneder', 'God tid'], ['?', 'Ved ikke endnu', 'Vi starter blødt']];
const GOALS = [[1, '1 lektion', 'ca. 5 min · Afslappet'], [2, '2 lektioner', 'ca. 10 min · Fast vane'], [3, '3 lektioner', 'ca. 15 min · Seriøs']];

function shell(step, body, cta, { ctaAttr = 'data-start-next', ctaHref = `#start:${step + 1}` } = {}) {
  return `<section class="start-step" data-step="${step}" aria-labelledby="step-title">
    <header class="step-top"><a class="step-back" href="${step === 1 ? '#start' : `#start:${step - 1}`}" aria-label="Tilbage">←</a>
      <span class="step-bar" role="progressbar" aria-label="Intro" aria-valuemin="1" aria-valuemax="4" aria-valuenow="${step}"><i style="--from:${(step - 1) / 4};--to:${step / 4}"></i></span>
      <a class="step-skip" href="#home" data-start-skip>Spring over</a></header>
    <div class="step-body">${body}</div>
    <footer class="step-foot"><a class="start-cta" href="${ctaHref}" ${ctaAttr}>${cta}</a></footer>
  </section>`;
}
const talk = (who, line) => `<div class="step-talk">${renderCast(who, { size: 'sm', priority: true })}<p class="step-bubble"><span class="cast-name">${esc(who === 'sneglen' ? 'Sneglen' : who === 'blink' ? 'Blink' : who === 'bobbel' ? 'Bobbel' : 'Kegle')}</span><span class="sr-only">${esc(line)}</span><span class="tw" aria-hidden="true" data-type="${esc(line)}"></span></p></div>`;

function options(name, list, chosen) {
  return `<div class="step-options" role="radiogroup" aria-labelledby="step-title">${list.map(([v, a, b], i) =>
    `<button type="button" role="radio" class="step-option ${String(v) === String(chosen) ? 'is-on' : ''}" style="--i:${i}" data-start-pick="${name}" data-value="${v}" aria-checked="${String(v) === String(chosen)}"><strong>${a}</strong><small>${b}</small><i aria-hidden="true"></i></button>`).join('')}</div>`;
}

export function renderStart(step, ctx) {
  const { intro, counts, plan } = ctx;
  if (!step) return hero({ counts });
  if (step === 1) return shell(1, `<h1 id="step-title" class="sr-only">Hvornår skal du til teoriprøve?</h1>${talk('sneglen', 'Hej! Hvornår skal du til teoriprøve?')}${options('when', WHEN, intro.when || '1m')}`, 'Fortsæt');
  if (step === 2) return shell(2, `<h1 id="step-title" class="sr-only">Hvor meget vil du øve om dagen?</h1>${talk('blink', 'Hvor meget vil du øve om dagen?')}${options('goal', GOALS, intro.goal || 2)}<p class="step-note">Du kan altid ændre det. Ingen straf, hvis du springer en dag over.</p>`, 'Fortsæt');
  if (step === 3) return shell(3, `<p class="eyebrow step-eyebrow">DIT MÅL</p><h1 id="step-title" class="step-title">Start med en rusten scooter. <span>Byg dig op til racerbilen.</span></h1>
      <div class="step-garage">${glowUp(['bigcar', 'racecar'], { loop: true, label: true })}</div>
      <div class="step-first"><img src="${baseSrc('scooter')}" alt="" width="64" height="64"><div><strong>Din første: Rusten scooter</strong><small>Den er din fra start. Alt andet tjener du dig til.</small></div></div>
      <div class="step-earn"><span class="step-earn-icon">${boosterIcon(28)}</span><div><strong>Tjen Boosters ved at lære</strong><small>${fmt(BOOSTER_RATES.lesson)} pr. lektion · ${fmt(BOOSTER_RATES.dailyGoal)} for dagens mål · ${fmt(BOOSTER_RATES.examPass)} for en bestået øveprøve</small></div></div>
      <p class="step-note">Restaurér den, lakér den, giv den fælge og neon. Eller spar op til en rigtig bil.</p>`, 'Den er min!', { ctaAttr: 'data-start-claim' });
  const whenText = { '2w': 'Teoriprøve inden for 2 uger', '1m': 'Teoriprøve om ca. 1 måned', '3m': 'Teoriprøve om 2–3 måneder', '?': 'Ingen dato endnu' }[intro.when || '1m'];
  const goal = Number(intro.goal || 2);
  return shell(4, `<div class="plan-hero">${renderCast('bobbel', { size: 'md', priority: true, mood: 'correct' })}<h1 id="step-title" class="step-title plan-title">Din plan er klar</h1></div>
    <ol class="plan-list">
      <li style="--i:0"><span class="plan-ico">${ico('calendar')}</span><div><strong>${esc(whenText)}</strong><small>${counts.lessons} lektioner · med ${goal} om dagen er du igennem på ca. ${Math.ceil(counts.lessons / goal)} dage</small></div><svg class="plan-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
      <li style="--i:1"><span class="plan-ico">${ico('clock')}</span><div><strong>${goal} ${goal === 1 ? 'lektion' : 'lektioner'} om dagen</strong><small>${goal * 5} minutter · dagens mål giver ${fmt(BOOSTER_RATES.dailyGoal)} Boosters</small></div><svg class="plan-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
      <li style="--i:2"><span class="plan-ico">${ico('target')}</span><div><strong>Første lektion: ${esc(plan.firstTitle)}</strong><small>Du svarer på dit første rigtige spørgsmål om 30 sekunder</small></div><svg class="plan-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
    </ol>`, 'Start første lektion', { ctaAttr: 'data-start-finish', ctaHref: plan.firstHref });
}

/** Typewriter for cast bubbles (the full line is in an sr-only span for screen readers). */
export function typeBubbles(root) {
  for (const el of root.querySelectorAll('[data-type]')) {
    const text = el.dataset.type;
    if (still()) { el.textContent = text; continue; }
    let i = 0; const tick = () => { el.textContent = text.slice(0, ++i); if (i < text.length) el._t = setTimeout(tick, 22 + (/[,.!?]/.test(text[i - 1]) ? 120 : 0)); };
    el._t = setTimeout(tick, 380);
  }
}
/** Numbers in the hero count up from zero. */
export function countUps(root) {
  if (still()) return;
  for (const el of root.querySelectorAll('[data-count]')) {
    const to = Number(el.dataset.count), t0 = performance.now() + 700;
    const tick = t => { const k = Math.max(0, Math.min(1, (t - t0) / 1100)), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
}
export { ORDER as START_ORDER, BASES };

