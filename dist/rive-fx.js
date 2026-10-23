// Rive animations (assets/rive/teoriboost.riv, built by tools/rive/build-teoriboost.mjs; glowup-<base>.riv by build-glowup.mjs;
// brand.riv by build-brand.mjs).
// Any element with data-rive="<name>[:<state>]" gets a Rive canvas on top of its own content, which stays as the
// fallback: it shows while Rive loads, if it fails, and always when motion is off. The runtime (~2.6 MB) is
// fetched only the first time such an element appears.
//   feedback:right | feedback:wrong   disc pops in, a check or cross draws itself
//   flame:lit | flame:out | flame:boost   the streak flame; boost flares it once
//   celebrate                         badge, ring burst and confetti
//   confetti                          the burst without the badge, around a character
//   gauge:<0-100>                     a speedometer; the needle swings to the number
//   traffic                           a traffic light running the Danish sequence (waiting)
//   bolt | bolt:earn                  the Booster bolt; glints now and then, jumps on earn
//   target:open | target:met          today's goal; a dart lands when it is met
//   glowup:<base>                     the dream-build show for scooter | smallcar | bigcar | racecar
//   hero:<base>                       the start page's glow-up: drives in, transforms, drives off (riveSwap for the next)
//   pass:<base>                       a passed practice test: the dream build crosses the finish line, fireworks
//   logo                              the logo intro: lane markings race in and click into place as ///
//   streak:3 | streak:7 | streak:30   a streak milestone: a wheel of fire and a bronze, silver or gold medal
//   lessondone                        a lesson is done: green light, the road rolls out, stars fill a bar
//   cta                               the intro's start button: bool "hover" lights it, trigger "press" launches it
// The element gets a bubbling 'rive-on' event when its animation is running, 'rive-off' when it will not run.
const BASE = 'assets/rive/';
const BOARDS = {
  feedback: { artboard: 'Feedback', machine: 'Feedback' },
  flame: { artboard: 'Flame', machine: 'Flame' },
  celebrate: { artboard: 'Celebrate', machine: 'Celebrate' },
  confetti: { artboard: 'Confetti', machine: 'Confetti' },
  gauge: { artboard: 'Gauge', machine: 'Gauge' },
  traffic: { artboard: 'TrafficLight', machine: 'TrafficLight' },
  bolt: { artboard: 'Bolt', machine: 'Bolt' },
  target: { artboard: 'Target', machine: 'Target' },
  glowup: { artboard: 'GlowUp', machine: 'GlowUp', file: base => `glowup-${base}.riv`, states: ['scooter', 'smallcar', 'bigcar', 'racecar'] },
  hero: { artboard: 'Hero', machine: 'Hero', file: base => `glowup-${base}.riv`, states: ['scooter', 'smallcar', 'bigcar', 'racecar'] },
  pass: { artboard: 'Pass', machine: 'Pass', file: base => `glowup-${base}.riv`, states: ['scooter', 'smallcar', 'bigcar', 'racecar'] },
  logo: { artboard: 'Logo', machine: 'Logo', file: () => 'brand.riv' },
  streak: { artboard: days => 'Streak' + days, machine: 'Streak', file: () => 'brand.riv', states: ['3', '7', '30'] },
  lessondone: { artboard: 'LessonDone', machine: 'LessonDone', file: () => 'brand.riv' },
  cta: { artboard: 'Cta', machine: 'Cta', file: () => 'brand.riv', fit: 'Fill' }, // the canvas is laid over the button exactly
};
let runtime = null; const files = new Map(); // file name -> its bytes
const live = new Map(); // element -> Rive instance

const still = () => document.body.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;

function loadRuntime() {
  runtime ||= new Promise((resolve, reject) => {
    if (globalThis.rive) return resolve(globalThis.rive);
    const s = document.createElement('script'); s.src = BASE + 'rive.js'; s.async = true;
    s.onload = () => {
      const r = globalThis.rive;
      r.RuntimeLoader.setWasmUrl(new URL(BASE + 'rive.wasm', location.href).href);
      r.RuntimeLoader.setWasmFallbackUrl(new URL(BASE + 'rive_fallback.wasm', location.href).href);
      r.Rive.suppressDeprecationWarnings = ['state-machine-inputs'];
      resolve(r);
    };
    s.onerror = () => reject(new Error('rive.js did not load'));
    document.head.append(s);
  });
  return runtime;
}
// each file's bytes are fetched once; each animation parses its own copy. A shared RiveFile is released
// by the runtime when the last animation using it is cleaned up, which breaks the next page.
function loadFile(name) {
  if (!files.has(name)) files.set(name, fetch(BASE + name).then(res => { if (!res.ok) throw new Error(name + ' ' + res.status); return res.arrayBuffer(); }));
  return files.get(name);
}
const signal = (el, type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));

async function mount(el) {
  const [name, state = ''] = el.dataset.rive.split(':'); const spec = BOARDS[name];
  if (!spec || (spec.states && !spec.states.includes(state))) { el.dataset.riveOn = 'off'; signal(el, 'rive-off'); return; }
  el.dataset.riveOn = 'loading';
  try {
    const r = await loadRuntime(); const bytes = await loadFile(spec.file ? spec.file(state) : 'teoriboost.riv');
    if (!el.isConnected || still()) { delete el.dataset.riveOn; signal(el, 'rive-off'); return; }
    const canvas = document.createElement('canvas'); canvas.className = 'rive-canvas'; canvas.setAttribute('aria-hidden', 'true');
    el.append(canvas);
    const inst = new r.Rive({
      buffer: bytes.slice(0), canvas, artboard: typeof spec.artboard === 'function' ? spec.artboard(state) : spec.artboard, stateMachine: spec.machine, autoplay: true,
      layout: new r.Layout({ fit: r.Fit[spec.fit || 'Contain'], alignment: r.Alignment.Center }),
      onLoad: () => {
        inst.resizeDrawingSurfaceToCanvas(); el.dataset.riveOn = 'on'; signal(el, 'rive-on');
        requestAnimationFrame(() => inst.resizeDrawingSurfaceToCanvas()); // 'on' styles can change the element's size
        const inputs = inst.stateMachineInputs(spec.machine) || [];
        const input = n => inputs.find(i => i.name === n);
        if (name === 'feedback' && input(state)) setTimeout(() => input(state)?.fire(), 60);
        if (name === 'flame') { if (input('lit')) input('lit').value = state !== 'out'; if (state === 'boost') setTimeout(() => input('boost')?.fire(), 250); }
        if (name === 'gauge' && input('pct')) swing(input('pct'), Math.max(0, Math.min(100, Number(state) || 0)));
        if (name === 'target' && state === 'met') setTimeout(() => { if (input('met')) input('met').value = true; }, 350);
        if (name === 'bolt' && state === 'earn') setTimeout(() => input('earn')?.fire(), 450);
      },
    });
    live.set(el, inst);
  } catch (e) {
    el.dataset.riveOn = 'off'; signal(el, 'rive-off'); console.warn('rive-fx:', e?.message || e); // the element's own icon stays
  }
}

/** the needle swings up to the value with a little overshoot, like a real gauge settling */
function swing(input, to) {
  const t0 = performance.now(), dur = 1300;
  const tick = t => {
    const k = Math.min(1, (t - t0) / dur), settle = 1 - Math.pow(1 - k, 3);
    input.value = to * settle + Math.sin(k * Math.PI * 3) * (1 - k) * Math.min(10, to * .25 + 3);
    if (k < 1) requestAnimationFrame(tick); else input.value = to;
  };
  requestAnimationFrame(tick);
}

function sweep() {
  for (const [el, inst] of live) if (!el.isConnected) { inst.cleanup(); live.delete(el); }
  if (still()) return;
  document.querySelectorAll('[data-rive]:not([data-rive-on])').forEach(el => void mount(el));
}

/** Sets a bool or number input on a running element. */
export function riveSet(el, input, value) {
  const inst = live.get(el); if (!inst) return;
  const i = inst.stateMachineInputs(BOARDS[el.dataset.rive.split(':')[0]].machine)?.find(x => x.name === input); if (i) i.value = value;
}

/** Points an element at another board/state (data-rive value) and mounts it again. */
export function riveSwap(el, value) {
  const inst = live.get(el); if (inst) { inst.cleanup(); live.delete(el); }
  el.querySelector('canvas.rive-canvas')?.remove(); el.dataset.rive = value; delete el.dataset.riveOn;
  if (!still()) void mount(el);
}
/** Starts fetching the file behind a data-rive value, so a later swap to it is quick. */
export function rivePreload(value) {
  const [name, state = ''] = value.split(':'); const spec = BOARDS[name];
  if (spec && !still()) loadFile(spec.file ? spec.file(state) : 'teoriboost.riv').catch(() => {});
}

/** Replays a feedback/celebrate element in place (for content that is reused, not re-rendered). */
export function riveFire(el, input) {
  const inst = live.get(el); if (!inst) return;
  inst.stateMachineInputs(BOARDS[el.dataset.rive.split(':')[0]].machine)?.find(i => i.name === input)?.fire();
}

let queued = 0;
export function initRiveFx() {
  const schedule = () => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; sweep(); }); };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  addEventListener('resize', () => { for (const inst of live.values()) inst.resizeDrawingSurfaceToCanvas(); });
  schedule();
}
