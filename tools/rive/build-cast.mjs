// Builds dist/assets/rive/cast.riv: the cast (Common Side Effects style, docs/redesign/cse/blink, cut by
// tools/cse-assets.py into tools/rive/cast-art) brought to life. One artboard per character, "Cast-<name>",
// each with the state machine "Cast":
//   idle  a loop of its own: it breathes (a soft squash and stretch from the feet), moves the way it moves (the cone
//         wobbles on its base, the cars bob on their springs, the tyre rocks, the snail stretches its neck, the
//         ladybird bobs) and blinks now and then (a double blink every other time)
//   hop   trigger "hop" (a tap): it crouches, jumps, lands with a squash and settles
// Run: node tools/rive/build-cast.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { Artboard, writeRiv } from './riv.mjs';

const ART = new URL('cast-art/', import.meta.url);
const OUT_DIR = new URL('../../dist/assets/rive/', import.meta.url);
const CAST = ['sneglen', 'kegle', 'blink', 'bobbel', 'krabbe', 'daek'];
const S = 100, PX = S / 512; // the artboard is 100 units; the drawings are 512 px with the figure standing at 95 %
const IN_OUT = [0.45, 0, 0.55, 1], OUT_SOFT = [0.22, 1, 0.36, 1], FALL = [0.5, 0, 1, 0.7];
const ease = pts => pts.map(([f, v], i) => i < pts.length - 1 ? [f, v, IN_OUT] : [f, v]);
// how each one moves while idle: breath (squash amount), sway (radians), bob (units), period (frames)
const MOVES = {
  sneglen: { breath: .025, sway: .03, bob: 0, period: 240, stretch: .05 },
  kegle: { breath: .02, sway: .07, bob: 0, period: 150 },
  blink: { breath: .03, sway: .025, bob: 1.6, period: 120 },
  bobbel: { breath: .035, sway: .02, bob: 1.4, period: 70 },
  krabbe: { breath: .03, sway: .025, bob: 1.2, period: 80 },
  daek: { breath: .02, sway: .06, bob: .8, period: 110 },
};

function castBoard(name, assets) {
  const ab = new Artboard(`Cast-${name}`, S, S);
  const root = ab.add('Node', { name: 'root', x: S / 2, y: S * .95 }); // the feet: everything squashes and sways from here
  const body = ab.add('Node', { parent: root, name: 'body' });
  const img = id => ab.add('Image', { parent: body, name: id, assetId: assets.indexOf(id), x: 0, y: -S * .45, scaleX: PX, scaleY: PX });
  const idle = img(`${name}-idle`);
  const hasBlink = assets.includes(`${name}-blink`);
  const shut = hasBlink ? img(`${name}-blink`) : null;
  const m = MOVES[name], P = m.period, L = P * 4; // four breaths per loop; the blink lands in the first and the third
  const breath = [];
  for (let k = 0; k <= 4; k++) breath.push([k * P, 1], [k * P + P / 2, 1 + m.breath]);
  breath.pop();
  const tracks = [
    { object: body, prop: 'scaleY', keys: ease(breath.map(([f, v]) => [f, v + (m.stretch && f % (2 * P) === P / 2 ? m.stretch : 0)])) },
    { object: body, prop: 'scaleX', keys: ease(breath.map(([f, v]) => [f, 2 - v])) },
    { object: body, prop: 'rotation', keys: ease([[0, 0], [L * .25, m.sway], [L * .5, 0], [L * .75, -m.sway], [L, 0]]) },
    { object: body, prop: 'y', keys: m.bob ? ease(Array.from({ length: 9 }, (_, k) => [k * L / 8, k % 2 ? -m.bob : 0])) : [[0, 0, 'hold'], [L, 0]] },
  ];
  if (shut) {
    const blinkAt = [P * .8, P * 2.8, P * 2.8 + 14];
    const on = [[0, 0, 'hold']]; for (const t of blinkAt) on.push([Math.round(t), 1, 'hold'], [Math.round(t) + 7, 0, 'hold']); on.push([L, 0]);
    tracks.push({ object: shut, prop: 'opacity', keys: on }, { object: idle, prop: 'opacity', keys: on.map(([f, v, e]) => [f, 1 - v, e].filter(x => x !== undefined)) });
  }
  const idleAnim = ab.animation('idle', { duration: L, loop: 'loop', tracks });
  const hop = ab.animation('hop', { duration: 54, tracks: [
    { object: body, prop: 'scaleY', keys: ease([[0, 1], [8, .82], [18, 1.12], [30, .9], [40, 1.04], [54, 1]]) },
    { object: body, prop: 'scaleX', keys: ease([[0, 1], [8, 1.14], [18, .92], [30, 1.08], [40, .98], [54, 1]]) },
    { object: body, prop: 'y', keys: [[0, 0, 'hold'], [8, 0, OUT_SOFT], [19, -9, FALL], [30, 0, 'hold'], [54, 0]] },
    { object: body, prop: 'rotation', keys: ease([[0, 0], [19, 0], [30, .06], [40, -.04], [54, 0]]) },
    ...(shut ? [{ object: shut, prop: 'opacity', keys: [[0, 0, 'hold'], [54, 0]] }, { object: idle, prop: 'opacity', keys: [[0, 1, 'hold'], [54, 1]] }] : []),
  ] });
  ab.stateMachine('Cast', { inputs: [{ name: 'hop', type: 'trigger' }],
    layers: [{ name: 'Main', states: [{ name: 'idle', animation: idleAnim }, { name: 'hop', animation: hop }],
      transitions: [{ from: 'entry', to: 'idle' }, { from: 'any', to: 'hop', when: [{ input: 'hop' }] }, { from: 'hop', to: 'idle', exitTime: 900 }] }] });
  return ab;
}

const names = CAST.flatMap(n => [`${n}-idle`, `${n}-blink`]).filter(n => existsSync(new URL(`${n}.webp`, ART)));
const assets = names.map(n => ({ name: 'cast-' + n, width: 512, height: 512, bytes: readFileSync(new URL(`${n}.webp`, ART)) }));
mkdirSync(OUT_DIR, { recursive: true });
const bytes = writeRiv(CAST.map(n => castBoard(n, names)), { fileId: 6, assets });
writeFileSync(new URL('cast.riv', OUT_DIR), bytes);
console.log('cast.riv', bytes.length, 'bytes,', names.length, 'images');
