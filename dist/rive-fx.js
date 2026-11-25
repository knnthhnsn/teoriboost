// Rive animations (assets/rive/teoriboost.riv, built by tools/rive/build-teoriboost.mjs; glowup-<base>.riv by build-glowup.mjs;
// brand.riv by build-brand.mjs; flame.riv by build-flame.mjs; signal.riv by build-signal.mjs; road.riv by build-road.mjs; cast.riv by build-cast.mjs).
// Any element with data-rive="<name>[:<state>]" gets a Rive canvas on top of its own content, which stays as the
// fallback: it shows while Rive loads, if it fails, and always when motion is off. The runtime (~2.6 MB) is
// fetched only the first time such an element appears.
//   feedback:right | feedback:wrong   disc pops in, a check or cross draws itself
//   flame:<0-5>[:up|:boost]           the streak flame, a dancing character at its level (0 is smoke); :up plays the
//                                     level-up from the level below, :boost a jump of joy (so does a tap)
//   celebrate                         badge, ring burst and confetti
//   confetti                          the burst without the badge, around a character
//   gauge:<0-100>                     a speedometer; the needle swings to the number
//   traffic                           a traffic light running the Danish sequence (waiting)
//   signal:<0-4> | signal:cycle       the poster traffic light: off, red, red and amber, green, amber, or the sequence
//   road                              the Prøve poster's yellow road: the four vehicles from above, both ways
//   cast:<name>                       a cast character, breathing, moving its own way and blinking; a tap makes it hop
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
import {afterFirstScreen} from './first-screen.js';
const BASE = 'assets/rive/';
const BOARDS = {
  feedback: { artboard: 'Feedback', machine: 'Feedback' },
  flame: { artboard: 'Flame', machine: 'Flame', file: () => 'flame.riv' },
  signal: { artboard: 'Signal', machine: 'Signal', file: () => 'signal.riv' },
  road: { artboard: 'Road', machine: 'Road', file: () => 'road.riv', fit: 'Cover' },
  cast: { artboard: name => 'Cast-' + name, machine: 'Cast', file: () => 'cast.riv', states: ['sneglen', 'kegle', 'blink', 'bobbel', 'krabbe', 'daek'] },
  roadcast: { artboard: name => 'RoadCast-' + name, machine: 'Cast', file: () => 'road-cast.riv', states: ['sneglen', 'krabbe'] },
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

/* ---------- gamle telefoner: hver animation tegner hvert billede, og det kan en gammel telefon ikke følge med til.
   Et par sekunder efter den første animation starter, måler vi billedfrekvensen. Under cirka 38 billeder i sekundet
   stopper alle animationer, hvor de er, og der starter ingen nye resten af besøget (elementets eget billede vises i
   stedet). Datasparetilstand og en forbindelse, browseren kalder 2G eller 3G, springer dem over fra start, fordi
   runtime alene fylder cirka 1 MB. ---------- */
const LITE_KEY = 'teoriboost.riveLite';
let lite = (() => { const c = globalThis.navigator?.connection, save = c?.saveData === true || ['slow-2g', '2g', '3g'].includes(c?.effectiveType); try { return save || sessionStorage.getItem(LITE_KEY) === '1'; } catch { return save; } })();
const instances = new Set(); // every running Rive, whichever module made it
// measured when an animation has started drawing (its onLoad), at most three times a visit
let probing = false, probes = 0;
function watchFrames() {
  if (probing || lite || probes >= 3) return;
  probing = true; setTimeout(sample, 2500);
}
function sample() {
  if (document.hidden) { setTimeout(sample, 2500); return; }
  if (!instances.size) { probing = false; return; } // measured with the next animation instead
  const gaps = []; let first = 0, last = 0;
  const step = t => {
    if (last) gaps.push(t - last); else first = t;
    last = t;
    if (t - first < 2000) { requestAnimationFrame(step); return; }
    probing = false; probes++;
    gaps.sort((a, b) => a - b);
    if ((gaps[gaps.length >> 1] || 0) > 26) goLite();
  };
  requestAnimationFrame(step);
}
function goLite() {
  lite = true;
  try { sessionStorage.setItem(LITE_KEY, '1'); } catch {}
  for (const inst of instances) { try { inst.pause(); } catch {} }
}
/** The runtime (about 1 MB sent) waits until the first screen and its pictures are there and the browser has a quiet
 *  moment, so the app's own first screen does not share the connection and the processor with it. */
const afterStart = afterFirstScreen;
let prepared = null;
function prepare(r) {
  if (prepared) return prepared;
  r.RuntimeLoader.setWasmUrl(new URL(BASE + 'rive.wasm', location.href).href);
  r.RuntimeLoader.setWasmFallbackUrl(new URL(BASE + 'rive_fallback.wasm', location.href).href);
  r.Rive.suppressDeprecationWarnings = ['state-machine-inputs'];
  // every instance is registered, so a slow phone can pause the ones other modules made too. The runtime's own
  // exports are read-only, so the modules get a view of it with a registering Rive and everything else unchanged
  const Base = r.Rive;
  class Rive extends Base {
    constructor(options) {
      const onLoad = options?.onLoad;
      super({ ...options, onLoad: (...args) => { watchFrames(); return onLoad?.(...args); } });
      instances.add(this);
    }
    cleanup() { instances.delete(this); return super.cleanup(); }
  }
  prepared = Object.create(r, { Rive: { value: Rive } });
  return prepared;
}

export function loadRiveRuntime() {
  if (lite) return Promise.reject(new Error('animations are off on this device'));
  if (runtime) return runtime;
  const pending = afterStart().then(() => new Promise((resolve, reject) => {
    if (lite) return reject(new Error('animations are off on this device'));
    if (globalThis.rive) return resolve(prepare(globalThis.rive));
    const s = document.createElement('script'); s.src = BASE + 'rive.js'; s.async = true;
    s.onload = () => resolve(prepare(globalThis.rive));
    s.onerror = () => reject(new Error('rive.js did not load'));
    document.head.append(s);
  }));
  runtime = pending;
  pending.catch(() => { if (runtime === pending) runtime = null; });
  return pending;
}
// each file's bytes are fetched once; each animation parses its own copy. A shared RiveFile is released
// by the runtime when the last animation using it is cleaned up, which breaks the next page.
export function loadRiveFile(name) {
  if (!files.has(name)) {
    const pending = fetch(BASE + name).then(res => { if (!res.ok) throw new Error(name + ' ' + res.status); return res.arrayBuffer(); });
    files.set(name, pending);
    // A temporary offline or loading error must not poison every later visit.
    pending.catch(() => { if (files.get(name) === pending) files.delete(name); });
  }
  return files.get(name);
}
/** Size the drawing surface from the canvas's layout box (offsetWidth/Height), not its on-screen box: inside a rotated
 *  or tilted parent (the Prøve poster's road, the mirror) the on-screen box is wider than the canvas, which stretched
 *  the drawing. */
function fit(inst) {
  // at most twice the CSS size: a 3x screen draws 2.25 times the pixels for a difference you cannot see in motion
  const c = inst.canvas, dpr = Math.min(2, globalThis.devicePixelRatio || 1);
  if (!c?.offsetWidth) return;
  c.width = Math.round(c.offsetWidth * dpr); c.height = Math.round(c.offsetHeight * dpr); inst.resizeToCanvas();
}
const signal = (el, type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));

async function mount(el) {
  const requested = el.dataset.rive;
  const [name, state = ''] = requested.split(':'); const spec = BOARDS[name];
  if (!spec || (spec.states && !spec.states.includes(state)) || lite) { el.dataset.riveOn = 'off'; signal(el, 'rive-off'); return; }
  el.dataset.riveOn = 'loading';
  try {
    const r = await loadRiveRuntime(); const bytes = await loadRiveFile(spec.file ? spec.file(state) : 'teoriboost.riv');
    // The view may have moved off screen or changed while the file loaded.
    // Do not resurrect a stale animation over a newer requested state.
    if (el.dataset.rive !== requested) return;
    if (!el.isConnected || still()) { delete el.dataset.riveOn; signal(el, 'rive-off'); return; }
    const canvas = document.createElement('canvas'); canvas.className = 'rive-canvas'; canvas.setAttribute('aria-hidden', 'true');
    el.append(canvas);
    const inst = new r.Rive({
      buffer: bytes.slice(0), canvas, artboard: typeof spec.artboard === 'function' ? spec.artboard(state) : spec.artboard, stateMachine: spec.machine, autoplay: true,
      layout: new r.Layout({ fit: r.Fit[spec.fit || 'Contain'], alignment: r.Alignment.Center }),
      onLoad: () => {
        fit(inst); el.dataset.riveOn = 'on'; signal(el, 'rive-on');
        requestAnimationFrame(() => fit(inst)); // 'on' styles can change the element's size
        const inputs = inst.stateMachineInputs(spec.machine) || [];
        const input = n => inputs.find(i => i.name === n);
        if (name === 'feedback' && input(state)) setTimeout(() => input(state)?.fire(), 60);
        if (name === 'cast') el.addEventListener('click', () => input('hop')?.fire()); // a tap makes the character hop
        if (name === 'signal') { if (input('cycle')) input('cycle').value = state === 'cycle'; if (input('light')) input('light').value = Number(state) || 0; }
        if (name === 'flame') flame(el, input, Math.max(0, Math.min(5, Number(state) || 0)), el.dataset.rive.split(':')[2]);
        if (name === 'gauge' && input('pct')) swing(input('pct'), Math.max(0, Math.min(100, Number(state) || 0)));
        if (name === 'target' && state === 'met') setTimeout(() => { if (input('met')) input('met').value = true; }, 350);
        if (name === 'bolt' && state === 'earn') setTimeout(() => input('earn')?.fire(), 450);
      },
    });
    live.set(el, inst);
  } catch (e) {
    if (!el.isConnected || el.dataset.rive !== requested) return;
    el.dataset.riveOn = 'off'; signal(el, 'rive-off'); console.warn('rive-fx:', e?.message || e); // the element's own icon stays
  }
}

/** the streak flame at its level; a level-up starts one level below and switches while the flame is squashed */
function flame(el, input, level, event) {
  const lv = input('level'); if (!lv) return;
  lv.value = event === 'up' ? level - 1 : level;
  if (event === 'up') setTimeout(() => { input('up')?.fire(); setTimeout(() => { lv.value = level; }, 170); }, 400);
  if (event === 'boost') setTimeout(() => input('boost')?.fire(), 250);
  el.addEventListener('click', () => { if (lv.value > 0) input('boost')?.fire(); }); // a tap makes a lit flame jump
}

/** the needle swings up to the value with a little overshoot, like a real gauge settling */
function swing(input, to) {
  const t0 = performance.now(), dur = 1300;
  const tick = t => {
    const k = Math.min(1, (t - t0) / dur), settle = 1 - Math.pow(1 - k, 3);
    try { input.value = k < 1 ? to * settle + Math.sin(k * Math.PI * 3) * (1 - k) * Math.min(10, to * .25 + 3) : to; }
    catch { return; } // the page changed and the animation is gone
    if (k < 1) requestAnimationFrame(tick);
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
  if (spec && !still() && !lite) afterStart().then(() => lite || loadRiveFile(spec.file ? spec.file(state) : 'teoriboost.riv')).catch(() => {});
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
  addEventListener('resize', () => { for (const inst of live.values()) fit(inst); });
  schedule();
}
