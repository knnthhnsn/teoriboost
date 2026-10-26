// Builds dist/assets/rive/signal.riv: the poster traffic light (drawn by Codex, cut by traffic-cut.py into
// tools/rive/traffic-art: the light with every lamp off, and each lit lamp on its own).
//   Signal - state machine "Signal": number light (0 off, 1 red, 2 red and amber, 3 green, 4 amber), bool cycle (runs
//            the Danish sequence: red, red and amber, green, amber).
//   Two layers:
//     Lamps  one state per light, crossfading in 0.15 s; a lit lamp's glow breathes a little
//     Sway   the light sways a hair on its arm, as if in the wind
// Run: node tools/rive/build-signal.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Artboard, writeRiv } from './riv.mjs';
import { gradient } from './helpers.mjs';

const ART = new URL('traffic-art/', import.meta.url);
const OUT_DIR = new URL('../../dist/assets/rive/', import.meta.url);
const META = JSON.parse(readFileSync(new URL('meta.json', ART))); // { layer: { w, h, dx, dy } }, dx/dy from the base's centre
const LAMPS = ['red', 'yellow', 'green'], GLOW = { red: '#FF4B4B', yellow: '#FFB000', green: '#58CC02' };
const NAMES = ['base', ...LAMPS];
const PX = 100 / META.base.h; // the light is 100 units tall
const IN_OUT = [0.45, 0, 0.55, 1];
const ease = pts => pts.map(([f, v], i) => i < pts.length - 1 ? [f, v, IN_OUT] : [f, v]);
// which lamps each light shows
const LIGHTS = [[], ['red'], ['red', 'yellow'], ['green'], ['yellow']];

function signalBoard() {
  const W = Math.ceil(META.base.w * PX) + 16, H = 112;
  const ab = new Artboard('Signal', W, H);
  // the arm is on the right, so the light sways around a point up and right of its centre
  const pivot = ab.add('Node', { name: 'pivot', x: W / 2 + 18, y: 6 });
  const body = ab.add('Node', { parent: pivot, name: 'body', x: -18, y: H / 2 - 6 });
  const img = (name, props = {}) => ab.add('Image', { parent: body, name, assetId: NAMES.indexOf(name), x: META[name].dx * PX, y: META[name].dy * PX, scaleX: PX, scaleY: PX, ...props });
  // the first drawable draws on top: lit lamps, then their glows, then the light itself
  const lamp = Object.fromEntries(LAMPS.map(l => [l, img(l, { opacity: 0 })]));
  const glow = Object.fromEntries(LAMPS.map(l => {
    const d = Math.max(META[l].w, META[l].h) * PX * 1.7;
    const s = ab.add('Shape', { parent: body, name: `${l}-glow`, x: META[l].dx * PX, y: META[l].dy * PX, opacity: 0 });
    ab.add('Ellipse', { parent: s, width: d, height: d });
    gradient(ab, s, 'radial', [0, 0, d / 2, 0], [[GLOW[l] + '73', 0], [GLOW[l] + '00', 1]]);
    return [l, s];
  }));
  img('base');

  const show = on => LAMPS.flatMap(l => [
    { object: lamp[l], prop: 'opacity', keys: [[0, on.includes(l) ? 1 : 0, 'hold']] },
    { object: glow[l], prop: 'opacity', keys: on.includes(l) ? ease([[0, .8], [60, 1], [120, .8]]) : [[0, 0, 'hold']] },
  ]);
  const light = LIGHTS.map((on, i) => ab.animation(`light-${i}`, { duration: 120, loop: 'loop', tracks: show(on) }));
  // the Danish sequence, 6 s: red 2 s, red and amber 1 s, green 2 s, amber 1 s, with a quick fade at each change
  const seq = [[0, 'red'], [120, 'red yellow'], [180, 'green'], [300, 'yellow'], [360, 'red']];
  const at = (l, t) => seq.filter(([f]) => f <= t).at(-1)[1].split(' ').includes(l) ? 1 : 0;
  const cycle = ab.animation('cycle', { duration: 360, loop: 'loop', tracks: LAMPS.flatMap(l => {
    const keys = []; let prev = null;
    for (const [f] of seq) { const v = at(l, f); if (prev === null) keys.push([0, v, 'hold']); else if (v !== prev) { keys.push([Math.max(0, f - 8), prev, IN_OUT]); keys.push([f, v, 'hold']); } prev = v; }
    keys.push([360, at(l, 360)]);
    return [{ object: lamp[l], prop: 'opacity', keys }, { object: glow[l], prop: 'opacity', keys }];
  }) });
  const sway = ab.animation('sway', { duration: 300, loop: 'loop', tracks: [{ object: pivot, prop: 'rotation', keys: ease([[0, -.012], [150, .012], [300, -.012]]) }] });

  const states = ['off', 'red', 'redamber', 'green', 'amber'];
  const is = (i, cycleOn = false) => [{ input: 'light', value: i }, { input: 'cycle', value: cycleOn }];
  const names = [...states, 'cycle'];
  ab.stateMachine('Signal', {
    inputs: [{ name: 'light', type: 'number', value: 0 }, { name: 'cycle', type: 'bool', value: false }],
    layers: [
      { name: 'Lamps', states: [...states.map((n, i) => ({ name: n, animation: light[i] })), { name: 'cycle', animation: cycle }],
        transitions: [
          ...states.map((n, i) => ({ from: 'entry', to: n, when: is(i) })),
          { from: 'entry', to: 'cycle', when: [{ input: 'cycle', value: true }] },
          ...names.flatMap(a => states.filter(b => b !== a).map(b => ({ from: a, to: b, duration: 150, when: is(states.indexOf(b)) }))),
          ...states.map(a => ({ from: a, to: 'cycle', duration: 150, when: [{ input: 'cycle', value: true }] })),
        ] },
      { name: 'Sway', states: [{ name: 'sway', animation: sway }], transitions: [{ from: 'entry', to: 'sway' }] },
    ],
  });
  return ab;
}

mkdirSync(OUT_DIR, { recursive: true });
const assets = NAMES.map(n => ({ name: 'signal-' + n, width: META[n].w, height: META[n].h, bytes: readFileSync(new URL(`${n}.webp`, ART)) }));
const bytes = writeRiv([signalBoard()], { fileId: 4, assets });
writeFileSync(new URL('signal.riv', OUT_DIR), bytes);
console.log('signal.riv', bytes.length, 'bytes');
