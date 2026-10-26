// Builds dist/assets/rive/flame.riv: the streak flame, a drawn character that levels up with the streak
// (the Common Side Effects flames in docs/redesign/cse/flames, cut out to tools/rive/flame-art by flame-cut.py).
//   Flame - state machine "Flame": number level (0 smoke, 1 first days, 2 three days, 3 a week, 4 thirty days,
//           5 comeback: back after a break),
//           trigger boost (a jump of joy: the streak grew, or a tap), trigger up (a level-up pop).
//   Two layers:
//     Motion  dance   a dance in two beats: it sways right and left, crouches, hops and lands with a squash
//             smoke   level 0: the burnt-out flame sways, perks up for a breath and sighs
//             hop     boost: it crouches, jumps up stretched, lands and wiggles
//             levelup up: it squashes flat, pops up big with a ring of light and settles (the page sets the new
//                     level just after firing up, so the new drawing appears while it is squashed)
//     Look    look-N  shows level N's drawing and blinks now and then (a double blink every other time)
//             joy-N   boost: level N's joy face for the length of the hop
// Run: node tools/rive/build-flame.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Artboard, writeRiv } from './riv.mjs';
import { stroke } from './helpers.mjs';

const ART = new URL('flame-art/', import.meta.url);
const OUT_DIR = new URL('../../dist/assets/rive/', import.meta.url);
const META = JSON.parse(readFileSync(new URL('meta.json', ART))); // { name: { w, h } } of each cut-out
const LEVELS = [0, 1, 2, 3, 4, 5], EXPR = ['idle', 'blink', 'joy'];
const NAMES = LEVELS.flatMap(l => EXPR.map(e => `L${l}-${e}`));
const ASSET = Object.fromEntries(NAMES.map((n, i) => [n, i]));
const PX = 1 / 6; // the drawings are cut at 6 px per unit
const OUT_SOFT = [0.22, 1, 0.36, 1], IN_OUT = [0.45, 0, 0.55, 1], FALL = [0.5, 0, 1, 0.7], OUT_BACK = [0.34, 1.56, 0.64, 1];
const ease = pts => pts.map(([f, v], i) => i < pts.length - 1 ? [f, v, IN_OUT] : [f, v]);
const EQ = 0, GT = 5;

function flameBoard() {
  const ab = new Artboard('Flame', 64, 64);
  const root = ab.add('Node', { name: 'root', x: 32, y: 62 }); // bottom centre: the flame leans, hops and squashes from here
  const img = (parent, name) => ab.add('Image', { parent, name, assetId: ASSET[name], originX: .5, originY: 1, scaleX: PX, scaleY: PX });
  // the first drawable draws on top: the drawings, then the level-up ring behind them
  const lit = ab.add('Node', { parent: root, name: 'lit' });
  const dancer = ab.add('Node', { parent: lit, name: 'dancer' }); // leans and hops
  const fire = ab.add('Node', { parent: dancer, name: 'fire' });  // squashes and stretches
  const level = {}, face = {};
  for (const l of LEVELS) {
    level[l] = ab.add('Node', { parent: fire, name: `L${l}` });
    for (const e of EXPR) face[`${l}-${e}`] = img(level[l], `L${l}-${e}`);
  }
  const ringShape = ab.add('Shape', { parent: root, name: 'ring', y: -27, opacity: 0 });
  ab.add('Ellipse', { parent: ringShape, width: 40, height: 40 });
  stroke(ab, ringShape, '#FFD60A', 3);

  /* ---- Motion ---- */
  const show = () => [{ object: lit, prop: 'opacity', keys: [[0, 1, 'hold']] }];
  const dance = ab.animation('dance', { duration: 96, loop: 'loop', tracks: [...show(),
    { object: dancer, prop: 'rotation', keys: ease([[0, 0], [12, .09], [30, -.07], [48, 0], [62, .04], [78, -.04], [96, 0]]) },
    { object: dancer, prop: 'y', keys: [[0, 0, 'hold'], [50, 0, OUT_SOFT], [61, -4, FALL], [71, 0, 'hold'], [96, 0]] },
    { object: fire, prop: 'scaleY', keys: ease([[0, 1], [10, 1.04], [24, .96], [36, 1.03], [48, .9], [57, 1.08], [67, 1], [73, .91], [84, 1.03], [96, 1]]) },
    { object: fire, prop: 'scaleX', keys: ease([[0, 1], [10, .97], [24, 1.03], [36, .98], [48, 1.08], [57, .93], [67, 1], [73, 1.07], [84, .98], [96, 1]]) },
  ] });
  const smoke = ab.animation('smoke', { duration: 180, loop: 'loop', tracks: [...show(),
    { object: dancer, prop: 'rotation', keys: ease([[0, .05], [60, -.02], [84, -.02], [124, .07], [180, .05]]) },
    { object: dancer, prop: 'y', keys: ease([[0, 0], [60, -1.5], [84, -1.5], [124, .3], [180, 0]]) },
    { object: fire, prop: 'scaleY', keys: ease([[0, 1], [60, 1.05], [84, 1.05], [124, .94], [180, 1]]) },
    { object: fire, prop: 'scaleX', keys: ease([[0, 1], [60, .98], [84, .98], [124, 1.04], [180, 1]]) },
  ] });
  const hop = ab.animation('hop', { duration: 60, tracks: [...show(),
    { object: fire, prop: 'scaleY', keys: ease([[0, 1], [8, .8], [18, 1.14], [30, .93], [40, 1.05], [50, .99], [60, 1]]) },
    { object: fire, prop: 'scaleX', keys: ease([[0, 1], [8, 1.16], [18, .9], [30, 1.06], [40, .97], [60, 1]]) },
    { object: dancer, prop: 'y', keys: [[0, 0, 'hold'], [8, 0, OUT_SOFT], [20, -6, FALL], [32, 0, 'hold'], [60, 0]] },
    { object: dancer, prop: 'rotation', keys: ease([[0, 0], [20, 0], [30, .1], [40, -.08], [50, .04], [60, 0]]) },
  ] });
  const levelup = ab.animation('levelup', { duration: 72, tracks: [...show(),
    { object: fire, prop: 'scaleY', keys: [[0, 1, IN_OUT], [10, .62, OUT_BACK], [26, 1.18, IN_OUT], [38, .94, IN_OUT], [50, 1.03, IN_OUT], [72, 1]] },
    { object: fire, prop: 'scaleX', keys: [[0, 1, IN_OUT], [10, 1.3, OUT_BACK], [26, .9, IN_OUT], [38, 1.05, IN_OUT], [50, .99, IN_OUT], [72, 1]] },
    { object: dancer, prop: 'y', keys: [[0, 0, 'hold'], [10, 0, OUT_SOFT], [24, -5, FALL], [36, 0, 'hold'], [72, 0]] },
    { object: dancer, prop: 'rotation', keys: [[0, 0, 'hold'], [72, 0]] },
    { object: ringShape, prop: 'opacity', keys: [[0, 0, 'hold'], [12, 0, OUT_SOFT], [16, 1, IN_OUT], [48, 0]] },
    { object: ringShape, prop: 'scaleX', keys: [[0, .3, 'hold'], [12, .3, OUT_SOFT], [48, 1.25]] },
    { object: ringShape, prop: 'scaleY', keys: [[0, .3, 'hold'], [12, .3, OUT_SOFT], [48, 1.25]] },
  ] });

  /* ---- Look ---- */
  const visible = (lv, expr) => [
    ...LEVELS.map(l => ({ object: level[l], prop: 'opacity', keys: [[0, l === lv ? 1 : 0, 'hold']] })),
    ...LEVELS.flatMap(l => EXPR.map(e => ({ object: face[`${l}-${e}`], prop: 'opacity', keys: [[0, e === expr ? 1 : 0, 'hold']] }))),
  ];
  // one blink at 2.5 s, a double blink at 5.5 s; the idle face is shown in between
  const blinkKeys = (l, e) => { const on = e === 'blink';
    return [[0, on ? 0 : 1, 'hold'], [150, on ? 1 : 0, 'hold'], [158, on ? 0 : 1, 'hold'], [330, on ? 1 : 0, 'hold'], [336, on ? 0 : 1, 'hold'], [344, on ? 1 : 0, 'hold'], [350, on ? 0 : 1, 'hold'], [360, on ? 0 : 1]]; };
  const look = {}, joy = {};
  for (const l of LEVELS) {
    look[l] = ab.animation(`look-${l}`, { duration: 360, loop: 'loop', tracks: [...visible(l, 'idle').filter(t => t.object !== face[`${l}-idle`] && t.object !== face[`${l}-blink`]),
      { object: face[`${l}-idle`], prop: 'opacity', keys: blinkKeys(l, 'idle') }, { object: face[`${l}-blink`], prop: 'opacity', keys: blinkKeys(l, 'blink') }] });
    joy[l] = ab.animation(`joy-${l}`, { duration: 60, tracks: visible(l, 'joy') });
  }

  const lv = (op, value) => [{ input: 'level', op, value }];
  const all = LEVELS;
  ab.stateMachine('Flame', {
    inputs: [{ name: 'level', type: 'number', value: 2 }, { name: 'boost', type: 'trigger' }, { name: 'up', type: 'trigger' }],
    layers: [
      { name: 'Motion', states: [{ name: 'dance', animation: dance }, { name: 'smoke', animation: smoke }, { name: 'hop', animation: hop }, { name: 'levelup', animation: levelup }],
        transitions: [
          { from: 'entry', to: 'dance', when: lv(GT, 0) }, { from: 'entry', to: 'smoke', when: lv(EQ, 0) },
          { from: 'dance', to: 'smoke', duration: 300, when: lv(EQ, 0) }, { from: 'smoke', to: 'dance', duration: 200, when: lv(GT, 0) },
          { from: 'dance', to: 'hop', when: [{ input: 'boost' }] }, { from: 'hop', to: 'dance', exitTime: 1000 },
          { from: 'dance', to: 'levelup', when: [{ input: 'up' }] }, { from: 'smoke', to: 'levelup', when: [{ input: 'up' }] }, { from: 'hop', to: 'levelup', when: [{ input: 'up' }] },
          { from: 'levelup', to: 'dance', exitTime: 1200, when: lv(GT, 0) }, { from: 'levelup', to: 'smoke', exitTime: 1200, when: lv(EQ, 0) },
        ] },
      { name: 'Look', states: [...all.map(l => ({ name: `look-${l}`, animation: look[l] })), ...LEVELS.filter(l => l).map(l => ({ name: `joy-${l}`, animation: joy[l] }))],
        transitions: [
          ...all.map(l => ({ from: 'entry', to: `look-${l}`, when: lv(EQ, l) })),
          ...all.flatMap(a => all.filter(b => b !== a).map(b => ({ from: `look-${a}`, to: `look-${b}`, when: lv(EQ, b) }))),
          ...LEVELS.filter(l => l).flatMap(l => [{ from: `look-${l}`, to: `joy-${l}`, when: [{ input: 'boost' }] }, { from: `joy-${l}`, to: `look-${l}`, exitTime: 1000 }]),
        ] },
    ],
  });
  return ab;
}

mkdirSync(OUT_DIR, { recursive: true });
const assets = NAMES.map(n => ({ name: 'flame-' + n, width: META[n].w, height: META[n].h, bytes: readFileSync(new URL(`${n}.webp`, ART)) }));
const bytes = writeRiv([flameBoard()], { fileId: 3, assets });
writeFileSync(new URL('flame.riv', OUT_DIR), bytes);
console.log('flame.riv', bytes.length, 'bytes');
