// Builds dist/assets/rive/teoriboost.riv: the app's Rive animations, written from code (tools/rive/riv.mjs).
//   Feedback  - state machine "Feedback", triggers right / wrong: a disc pops in and a check (or cross) draws itself
//   Flame     - state machine "Flame", bool lit + trigger boost: the streak flame burns, goes grey at 0, flares up
//   Celebrate - state machine "Celebrate", trigger play (also plays on load): badge, ring burst and confetti
//   Confetti  - the same burst without the badge, to play around a character
//   Gauge (number pct), TrafficLight, Bolt (trigger earn), Target (bool met): see boards-more.mjs
// Colours are the app's palette. Run: node tools/rive/build-teoriboost.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Artboard, writeRiv } from './riv.mjs';
import { gauge, trafficLight, bolt, target } from './boards-more.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../dist/assets/rive/teoriboost.riv');
const C = { lime: '#FFD60A', limeEdge: '#B38F00', green: '#58CC02', red: '#FF4B4B', ink: '#1A1605', white: '#FFFFFF', blue: '#38BDF8', orange: '#FF9600', yellow: '#FFC800', grey: '#A3ADB6', greyLight: '#D9DEE3' };
const OUT_BACK = [0.34, 1.56, 0.64, 1];   // overshoot, then settle
const OUT_SOFT = [0.22, 1, 0.36, 1];      // fast out, slow in
const IN_OUT = [0.45, 0, 0.55, 1];
const TAU = Math.PI * 2;

/** a path through points, stroked: returns { shape, stroke, trim } */
function strokePath(ab, parent, name, pts, color, thickness) {
  const shape = ab.add('Shape', { parent, name });
  const path = ab.add('PointsPath', { parent: shape, isClosed: false });
  for (const [x, y] of pts) ab.add('StraightVertex', { parent: path, x, y, radius: 0 });
  const stroke = ab.add('Stroke', { parent: shape, thickness, cap: 1, join: 1 });
  ab.add('SolidColor', { parent: stroke, color });
  const trim = ab.add('TrimPath', { parent: stroke, trimStart: 0, trimEnd: 1, trimOffset: 0, trimMode: 1 });
  return { shape, stroke, trim };
}
function disc(ab, parent, name, size, color) {
  const shape = ab.add('Shape', { parent, name });
  ab.add('Ellipse', { parent: shape, width: size, height: size });
  const fill = ab.add('Fill', { parent: shape });
  const solid = ab.add('SolidColor', { parent: fill, color });
  return { shape, solid };
}
function ring(ab, parent, name, size, color, thickness) {
  const shape = ab.add('Shape', { parent, name });
  ab.add('Ellipse', { parent: shape, width: size, height: size });
  const stroke = ab.add('Stroke', { parent: shape, thickness });
  ab.add('SolidColor', { parent: stroke, color });
  return shape;
}
/** a closed flame: tip at (0,-h), base at (0,0) */
function flame(ab, parent, name, w, h, color) {
  const shape = ab.add('Shape', { parent, name });
  const path = ab.add('PointsPath', { parent: shape, isClosed: true });
  ab.add('StraightVertex', { parent: path, x: 0, y: -h, radius: 0 });
  ab.add('CubicMirroredVertex', { parent: path, x: w, y: -h * 0.34, rotation: Math.PI / 2 + 0.25, distance: h * 0.22 });
  ab.add('CubicMirroredVertex', { parent: path, x: 0, y: 0, rotation: Math.PI, distance: w * 0.62 });
  ab.add('CubicMirroredVertex', { parent: path, x: -w, y: -h * 0.34, rotation: -Math.PI / 2 - 0.25, distance: h * 0.22 });
  const fill = ab.add('Fill', { parent: shape });
  const solid = ab.add('SolidColor', { parent: fill, color });
  return { shape, solid };
}

/* ---------------- Feedback ---------------- */
function feedback() {
  const ab = new Artboard('Feedback', 120, 120);
  const root = ab.add('Node', { name: 'root', x: 60, y: 60 });
  // Rive draws the first drawable on top, so the marks come first and the burst last
  const check = strokePath(ab, root, 'check', [[-17, 1], [-5, 13], [18, -12]], C.white, 8);
  const crossA = strokePath(ab, root, 'crossA', [[-13, -13], [13, 13]], C.white, 8);
  const crossB = strokePath(ab, root, 'crossB', [[13, -13], [-13, 13]], C.white, 8);
  const d = disc(ab, root, 'disc', 76, C.green);
  const burst = ring(ab, root, 'ring', 74, C.lime, 5);
  const sparks = [];
  for (let i = 0; i < 6; i++) {
    const arm = ab.add('Node', { parent: root, name: 'spark' + i, rotation: i * TAU / 6 + 0.3 });
    const s = ab.add('Shape', { parent: arm, name: 'sparkShape' + i, x: 36 });
    ab.add('Rectangle', { parent: s, width: 10, height: 5, cornerRadiusTL: 2.5, linkCornerRadius: true });
    const f = ab.add('Fill', { parent: s }); ab.add('SolidColor', { parent: f, color: i % 2 ? C.lime : C.green });
    sparks.push(s);
  }

  const hidden = [
    { object: root, prop: 'opacity', keys: [[0, 0, 'hold']] },
  ];
  const idle = ab.animation('idle', { duration: 1, loop: 'loop', tracks: hidden });
  const right = ab.animation('right', { duration: 48, tracks: [
    { object: root, prop: 'opacity', keys: [[0, 1, 'hold']] },
    { object: root, prop: 'x', keys: [[0, 60, 'hold']] },
    { object: d.shape, prop: 'scaleX', keys: [[0, 0, OUT_BACK], [16, 1]] },
    { object: d.shape, prop: 'scaleY', keys: [[0, 0, OUT_BACK], [16, 1]] },
    { object: d.solid, prop: 'color', keys: [[0, C.green, 'hold']] },
    { object: check.shape, prop: 'opacity', keys: [[0, 1, 'hold']] },
    { object: check.trim, prop: 'trimEnd', keys: [[0, 0, 'hold'], [8, 0, OUT_SOFT], [24, 1]] },
    { object: crossA.shape, prop: 'opacity', keys: [[0, 0, 'hold']] },
    { object: crossB.shape, prop: 'opacity', keys: [[0, 0, 'hold']] },
    { object: burst, prop: 'opacity', keys: [[0, 0, 'hold'], [6, .9, OUT_SOFT], [34, 0]] },
    { object: burst, prop: 'scaleX', keys: [[0, 1, 'hold'], [6, 1, OUT_SOFT], [34, 1.65]] },
    { object: burst, prop: 'scaleY', keys: [[0, 1, 'hold'], [6, 1, OUT_SOFT], [34, 1.65]] },
    ...sparks.flatMap(s => [
      { object: s, prop: 'x', keys: [[0, 30, 'hold'], [8, 30, OUT_SOFT], [32, 56]] },
      { object: s, prop: 'opacity', keys: [[0, 0, 'hold'], [8, 1, 'hold'], [18, 1, IN_OUT], [32, 0]] },
    ]),
  ] });
  const wrong = ab.animation('wrong', { duration: 44, tracks: [
    { object: root, prop: 'opacity', keys: [[0, 1, 'hold']] },
    { object: d.shape, prop: 'scaleX', keys: [[0, 0, OUT_BACK], [14, 1]] },
    { object: d.shape, prop: 'scaleY', keys: [[0, 0, OUT_BACK], [14, 1]] },
    { object: d.solid, prop: 'color', keys: [[0, C.red, 'hold']] },
    { object: check.shape, prop: 'opacity', keys: [[0, 0, 'hold']] },
    { object: crossA.shape, prop: 'opacity', keys: [[0, 1, 'hold']] },
    { object: crossB.shape, prop: 'opacity', keys: [[0, 1, 'hold']] },
    { object: crossA.trim, prop: 'trimEnd', keys: [[0, 0, 'hold'], [8, 0, OUT_SOFT], [18, 1]] },
    { object: crossB.trim, prop: 'trimEnd', keys: [[0, 0, 'hold'], [14, 0, OUT_SOFT], [24, 1]] },
    { object: root, prop: 'x', keys: [[0, 60, 'hold'], [24, 60], [28, 53], [32, 66], [36, 56], [40, 62], [44, 60]] },
    { object: burst, prop: 'opacity', keys: [[0, 0, 'hold']] },
    ...sparks.map(s => ({ object: s, prop: 'opacity', keys: [[0, 0, 'hold']] })),
  ] });
  ab.stateMachine('Feedback', {
    inputs: [{ name: 'right', type: 'trigger' }, { name: 'wrong', type: 'trigger' }],
    layers: [{ name: 'Main', states: [{ name: 'idle', animation: idle }, { name: 'right', animation: right }, { name: 'wrong', animation: wrong }],
      transitions: [{ from: 'entry', to: 'idle' }, { from: 'any', to: 'right', when: [{ input: 'right' }] }, { from: 'any', to: 'wrong', when: [{ input: 'wrong' }] }] }],
  });
  return ab;
}

/* ---------------- Flame ---------------- */
function flameBoard() {
  const ab = new Artboard('Flame', 64, 64);
  const root = ab.add('Node', { name: 'root', x: 32, y: 58 });
  const coreNode = ab.add('Node', { parent: root, name: 'core', y: -2 });
  const inner = flame(ab, coreNode, 'inner', 9, 28, C.yellow);
  const outer = flame(ab, root, 'outer', 17, 50, C.orange);
  const lit = [
    { object: outer.solid, prop: 'color', keys: [[0, C.orange, 'hold']] },
    { object: inner.solid, prop: 'color', keys: [[0, C.yellow, 'hold']] },
  ];
  const burn = ab.animation('burn', { duration: 90, loop: 'loop', tracks: [...lit,
    { object: root, prop: 'scaleY', keys: [[0, 1, IN_OUT], [30, 1.07, IN_OUT], [60, .96, IN_OUT], [90, 1]] },
    { object: root, prop: 'scaleX', keys: [[0, 1, IN_OUT], [30, .96, IN_OUT], [60, 1.03, IN_OUT], [90, 1]] },
    { object: root, prop: 'rotation', keys: [[0, 0, IN_OUT], [24, .05, IN_OUT], [54, -.045, IN_OUT], [90, 0]] },
    { object: coreNode, prop: 'scaleY', keys: [[0, 1, IN_OUT], [20, 1.14, IN_OUT], [50, .92, IN_OUT], [90, 1]] },
    { object: coreNode, prop: 'x', keys: [[0, 0, IN_OUT], [36, 1.5, IN_OUT], [70, -1.2, IN_OUT], [90, 0]] },
  ] });
  const out = ab.animation('out', { duration: 120, loop: 'loop', tracks: [
    { object: outer.solid, prop: 'color', keys: [[0, C.grey, 'hold']] },
    { object: inner.solid, prop: 'color', keys: [[0, C.greyLight, 'hold']] },
    { object: root, prop: 'scaleY', keys: [[0, .86, IN_OUT], [60, .9, IN_OUT], [120, .86]] },
    { object: root, prop: 'scaleX', keys: [[0, .9, 'hold']] },
    { object: root, prop: 'rotation', keys: [[0, 0, 'hold']] },
    { object: coreNode, prop: 'scaleY', keys: [[0, .9, 'hold']] },
    { object: coreNode, prop: 'x', keys: [[0, 0, 'hold']] },
  ] });
  const boost = ab.animation('boost', { duration: 40, tracks: [...lit,
    { object: root, prop: 'scaleY', keys: [[0, 1, OUT_BACK], [14, 1.38, IN_OUT], [40, 1]] },
    { object: root, prop: 'scaleX', keys: [[0, 1, OUT_BACK], [14, 1.22, IN_OUT], [40, 1]] },
    { object: root, prop: 'rotation', keys: [[0, 0, 'hold']] },
    { object: coreNode, prop: 'scaleY', keys: [[0, 1, OUT_BACK], [16, 1.3, IN_OUT], [40, 1]] },
  ] });
  ab.stateMachine('Flame', {
    inputs: [{ name: 'lit', type: 'bool', value: true }, { name: 'boost', type: 'trigger' }],
    layers: [{ name: 'Main', states: [{ name: 'burn', animation: burn }, { name: 'out', animation: out }, { name: 'boost', animation: boost }],
      transitions: [
        { from: 'entry', to: 'burn', when: [{ input: 'lit', value: true }] }, { from: 'entry', to: 'out', when: [{ input: 'lit', value: false }] },
        { from: 'burn', to: 'out', duration: 300, when: [{ input: 'lit', value: false }] }, { from: 'out', to: 'burn', duration: 200, when: [{ input: 'lit', value: true }] },
        { from: 'any', to: 'boost', when: [{ input: 'boost' }] }, { from: 'boost', to: 'burn', exitTime: 660 },
      ] }],
  });
  return ab;
}

/* ---------------- Celebrate ---------------- */
/** withBadge false = Confetti: only the burst, to play around one of the app's characters */
function celebrate(withBadge = true) {
  const ab = new Artboard(withBadge ? 'Celebrate' : 'Confetti', 220, 220);
  const root = ab.add('Node', { name: 'root', x: 110, y: 104 });
  const badge = ab.add('Node', { parent: root, name: 'badge', opacity: withBadge ? 1 : 0 });
  const starShape = ab.add('Shape', { parent: badge, name: 'star' });
  ab.add('Star', { parent: starShape, width: 52, height: 52, points: 5, innerRadius: .5, cornerRadius: 3 });
  const sf = ab.add('Fill', { parent: starShape }); ab.add('SolidColor', { parent: sf, color: C.ink });
  const face = disc(ab, badge, 'face', 92, C.lime);
  const rim = disc(ab, badge, 'rim', 104, C.limeEdge);
  // confetti is drawn below the badge, so it shoots out from behind it
  const colors = [C.lime, C.green, C.blue, C.orange, C.lime, C.yellow, C.green, C.blue, C.orange, C.lime, C.green, C.blue];
  const shards = colors.map((color, i) => {
    const n = ab.add('Node', { parent: root, name: 'shard' + i });
    const s = ab.add('Shape', { parent: n, name: 'shardShape' + i, rotation: i });
    ab.add('Rectangle', { parent: s, width: i % 3 ? 9 : 12, height: i % 3 ? 15 : 7, cornerRadiusTL: 2, linkCornerRadius: true });
    const f = ab.add('Fill', { parent: s }); ab.add('SolidColor', { parent: f, color });
    return { n, s, a: -Math.PI / 2 + (i - 5.5) * 0.36 + (i % 2 ? .12 : -.08), d: 78 + (i * 23) % 34 };
  });
  const burst = ring(ab, root, 'ring', 110, C.lime, 7);

  const idle = ab.animation('idle', { duration: 1, loop: 'loop', tracks: [{ object: root, prop: 'opacity', keys: [[0, 0, 'hold']] }] });
  const shardTracks = shards.flatMap(({ n, s, a, d }) => {
    const pts = [0, .25, .5, .75, 1].map(t => { const r = 34 + (d - 34) * Math.min(1, t * 1.6); return [Math.round(10 + t * 70), Math.cos(a) * r, Math.sin(a) * r + 120 * t * t]; });
    return [
      { object: n, prop: 'x', keys: [[0, 0, 'hold'], ...pts.map(([f, x], k) => [f, x, k === 0 ? OUT_SOFT : undefined])] },
      { object: n, prop: 'y', keys: [[0, 0, 'hold'], ...pts.map(([f, , y]) => [f, y])] },
      { object: n, prop: 'opacity', keys: [[0, 0, 'hold'], [10, 1, 'hold'], [52, 1, IN_OUT], [80, 0]] },
      { object: s, prop: 'rotation', keys: [[0, 0], [80, (a > -Math.PI / 2 ? 1 : -1) * 7]] },
    ];
  });
  const play = ab.animation('play', { duration: 84, tracks: [
    { object: root, prop: 'opacity', keys: [[0, 1, 'hold']] },
    { object: badge, prop: 'scaleX', keys: [[0, 0, OUT_BACK], [20, 1]] },
    { object: badge, prop: 'scaleY', keys: [[0, 0, OUT_BACK], [20, 1]] },
    { object: badge, prop: 'rotation', keys: [[0, -.5, OUT_BACK], [22, 0]] },
    { object: starShape, prop: 'scaleX', keys: [[0, 0, 'hold'], [10, 0, OUT_BACK], [28, 1]] },
    { object: starShape, prop: 'scaleY', keys: [[0, 0, 'hold'], [10, 0, OUT_BACK], [28, 1]] },
    { object: starShape, prop: 'rotation', keys: [[0, -1.2, 'hold'], [10, -1.2, OUT_SOFT], [34, 0]] },
    { object: burst, prop: 'opacity', keys: [[0, 0, 'hold'], [8, 1, OUT_SOFT], [40, 0]] },
    { object: burst, prop: 'scaleX', keys: [[0, 1, 'hold'], [8, 1, OUT_SOFT], [40, 1.9]] },
    { object: burst, prop: 'scaleY', keys: [[0, 1, 'hold'], [8, 1, OUT_SOFT], [40, 1.9]] },
    ...shardTracks,
  ] });
  ab.stateMachine(withBadge ? 'Celebrate' : 'Confetti', {
    inputs: [{ name: 'play', type: 'trigger' }],
    layers: [{ name: 'Main', states: [{ name: 'idle', animation: idle }, { name: 'play', animation: play }],
      transitions: [{ from: 'entry', to: 'play' }, { from: 'any', to: 'play', when: [{ input: 'play' }] }] }],
  });
  void rim; void face;
  return ab;
}

mkdirSync(dirname(OUT), { recursive: true });
const bytes = writeRiv([feedback(), flameBoard(), celebrate(), celebrate(false), gauge(), trafficLight(), bolt(), target()], { fileId: 1 });
writeFileSync(OUT, bytes);
console.log('teoriboost.riv', bytes.length, 'bytes');
