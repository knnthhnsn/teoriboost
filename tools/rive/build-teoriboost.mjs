// Builds dist/assets/rive/teoriboost.riv: the app's Rive animations, written from code (tools/rive/riv.mjs).
//   Feedback  - state machine "Feedback", triggers right / wrong: a disc pops in and a check (or cross) draws itself
//   Flame     - state machine "Flame", bool lit + trigger boost: a layered flame with sparks burns; at 0 a grey ember smokes; boost flares it
//   Celebrate - state machine "Celebrate", trigger play (also plays on load): badge, ring burst and confetti
//   Confetti  - the same burst without the badge, to play around a character
//   Gauge (number pct), TrafficLight, Bolt (trigger earn), Target (bool met): see boards-more.mjs
// Colours are the app's palette. Run: node tools/rive/build-teoriboost.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Artboard, writeRiv } from './riv.mjs';
import { gauge, trafficLight, bolt, target } from './boards-more.mjs';
import { gradient, solid, glow, ellipse } from './helpers.mjs';
import { BLEND } from './riv.mjs';

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
/** a flame tongue with a gradient from its base (0,0) to its tip (0,-h); the shape is the node to animate */
function tongue(ab, parent, name, { w, h, x = 0, y = 0, rotation = 0, stops, color }) {
  const shape = ab.add('Shape', { parent, name, x, y, rotation });
  const path = ab.add('PointsPath', { parent: shape, isClosed: true });
  ab.add('StraightVertex', { parent: path, x: 0, y: -h, radius: 0 });
  ab.add('CubicMirroredVertex', { parent: path, x: w, y: -h * 0.32, rotation: Math.PI / 2 + 0.3, distance: h * 0.24 });
  ab.add('CubicMirroredVertex', { parent: path, x: 0, y: 0, rotation: Math.PI, distance: w * 0.64 });
  ab.add('CubicMirroredVertex', { parent: path, x: -w, y: -h * 0.32, rotation: -Math.PI / 2 - 0.3, distance: h * 0.24 });
  if (stops) gradient(ab, shape, 'linear', [0, 0, 0, -h], stops); else solid(ab, shape, color);
  return shape;
}
/** keys for something that rises: still until t0, then moves from -> to over life frames */
const rise = (t0, life, from, to) => [...(t0 ? [[0, from, 'hold']] : []), [t0, from, IN_OUT], [t0 + life, to]];
/** keys for something that flashes in and fades out over life frames from t0 */
const blink = (t0, life, peak) => [...(t0 ? [[0, 0, 'hold']] : []), [t0, 0, OUT_SOFT], [Math.round(t0 + life * .2), peak, IN_OUT], [t0 + life, 0]];
function flameBoard() {
  const ab = new Artboard('Flame', 64, 64);
  const root = ab.add('Node', { name: 'root', x: 32, y: 58 });
  // lit: a white-hot core, a yellow heart, an orange-red body with two side tongues, sparks and a warm glow.
  // The first drawable draws on top, so the sparks and the core come first and the glow last.
  const lit = ab.add('Node', { parent: root, name: 'lit' });
  const sparks = [[-5, 0], [6, 28], [-1, 54]].map(([x, t0], i) => {
    const node = ellipse(ab, lit, `spark${i}`, { d: 3.6, x, color: '#FFE45C' }); return { node, t0, x };
  });
  const fire = ab.add('Node', { parent: lit, name: 'fire' });
  const core = tongue(ab, fire, 'core', { w: 4.2, h: 15, y: -1, color: '#FFF7D6' });
  const heart = tongue(ab, fire, 'heart', { w: 8.5, h: 30, stops: [['#FFB000', 0], ['#FFE45C', 1]] });
  const body = tongue(ab, fire, 'body', { w: 15, h: 47, stops: [['#FF3B1F', 0], ['#FF7A00', .5], ['#FFB81A', 1]] });
  const left = tongue(ab, fire, 'left', { w: 8, h: 27, x: -7, y: -1, rotation: -.5, stops: [['#FF3B1F', 0], ['#FF9A1A', 1]] });
  const right = tongue(ab, fire, 'right', { w: 7, h: 23, x: 7, y: -1, rotation: .55, stops: [['#FF3B1F', 0], ['#FF9A1A', 1]] });
  const halo = glow(ab, lit, 'glow', { d: 60, color: '#FF8A00', a: .42, y: -20, blend: BLEND.srcOver });
  // out: a grey ember with smoke curling up
  const out = ab.add('Node', { parent: root, name: 'out' });
  const smoke = [0, 60].map((t0, i) => ({ t0, node: glow(ab, out, `smoke${i}`, { d: 16, color: '#AEB8C2', a: .9, blend: BLEND.srcOver }) }));
  const ash = ab.add('Node', { parent: out, name: 'ash' });
  tongue(ab, ash, 'ash-core', { w: 4.5, h: 13, y: -1, color: '#E6EAEE' });
  tongue(ab, ash, 'ash-body', { w: 13, h: 36, stops: [['#7E8893', 0], ['#B7C0C9', 1]] });

  const show = litOn => [{ object: lit, prop: 'opacity', keys: [[0, litOn ? 1 : 0, 'hold']] }, { object: out, prop: 'opacity', keys: [[0, litOn ? 0 : 1, 'hold']] }];
  const burn = ab.animation('burn', { duration: 90, loop: 'loop', tracks: [...show(true),
    { object: fire, prop: 'scaleY', keys: [[0, 1, 'hold']] },
    { object: fire, prop: 'scaleX', keys: [[0, 1, 'hold']] },
    { object: body, prop: 'scaleY', keys: [[0, 1, IN_OUT], [22, 1.07, IN_OUT], [46, .95, IN_OUT], [68, 1.04, IN_OUT], [90, 1]] },
    { object: body, prop: 'scaleX', keys: [[0, 1, IN_OUT], [22, .96, IN_OUT], [46, 1.04, IN_OUT], [68, .98, IN_OUT], [90, 1]] },
    { object: body, prop: 'rotation', keys: [[0, 0, IN_OUT], [26, .05, IN_OUT], [58, -.05, IN_OUT], [90, 0]] },
    { object: heart, prop: 'scaleY', keys: [[0, 1, IN_OUT], [18, 1.16, IN_OUT], [48, .9, IN_OUT], [72, 1.08, IN_OUT], [90, 1]] },
    { object: heart, prop: 'x', keys: [[0, 0, IN_OUT], [34, 1.2, IN_OUT], [66, -1, IN_OUT], [90, 0]] },
    { object: core, prop: 'scaleY', keys: [[0, 1, IN_OUT], [14, 1.2, IN_OUT], [40, .88, IN_OUT], [64, 1.12, IN_OUT], [90, 1]] },
    { object: left, prop: 'rotation', keys: [[0, -.5, IN_OUT], [30, -.66, IN_OUT], [60, -.4, IN_OUT], [90, -.5]] },
    { object: left, prop: 'scaleY', keys: [[0, 1, IN_OUT], [26, .82, IN_OUT], [56, 1.1, IN_OUT], [90, 1]] },
    { object: right, prop: 'rotation', keys: [[0, .55, IN_OUT], [36, .4, IN_OUT], [66, .7, IN_OUT], [90, .55]] },
    { object: right, prop: 'scaleY', keys: [[0, 1, IN_OUT], [32, 1.12, IN_OUT], [62, .84, IN_OUT], [90, 1]] },
    { object: halo, prop: 'opacity', keys: [[0, .8, IN_OUT], [45, 1, IN_OUT], [90, .8]] },
    { object: halo, prop: 'scaleX', keys: [[0, 1, IN_OUT], [45, 1.08, IN_OUT], [90, 1]] },
    { object: halo, prop: 'scaleY', keys: [[0, 1, IN_OUT], [45, 1.08, IN_OUT], [90, 1]] },
    ...sparks.flatMap(({ node, t0, x }) => [
      { object: node, prop: 'y', keys: rise(t0, 34, -16, -58) },
      { object: node, prop: 'x', keys: rise(t0, 34, x, x + (x < 0 ? -5 : 5)) },
      { object: node, prop: 'opacity', keys: blink(t0, 34, 1) },
    ]),
  ] });
  const outAnim = ab.animation('out', { duration: 120, loop: 'loop', tracks: [...show(false),
    { object: ash, prop: 'scaleY', keys: [[0, .94, IN_OUT], [60, 1, IN_OUT], [120, .94]] },
    ...smoke.flatMap(({ node, t0 }) => [
      { object: node, prop: 'y', keys: rise(t0, 60, -30, -62) },
      { object: node, prop: 'x', keys: [...(t0 ? [[0, 0, 'hold']] : []), [t0, 0, IN_OUT], [t0 + 30, 4, IN_OUT], [t0 + 60, -2]] },
      { object: node, prop: 'scaleX', keys: rise(t0, 60, .5, 1.5) },
      { object: node, prop: 'scaleY', keys: rise(t0, 60, .5, 1.5) },
      { object: node, prop: 'opacity', keys: blink(t0, 60, .55) },
    ]),
  ] });
  const boost = ab.animation('boost', { duration: 40, tracks: [...show(true),
    { object: fire, prop: 'scaleY', keys: [[0, 1, OUT_BACK], [14, 1.36, IN_OUT], [40, 1]] },
    { object: fire, prop: 'scaleX', keys: [[0, 1, OUT_BACK], [14, 1.18, IN_OUT], [40, 1]] },
    { object: halo, prop: 'scaleX', keys: [[0, 1, OUT_BACK], [14, 1.4, IN_OUT], [40, 1]] },
    { object: halo, prop: 'scaleY', keys: [[0, 1, OUT_BACK], [14, 1.4, IN_OUT], [40, 1]] },
    { object: halo, prop: 'opacity', keys: [[0, .8], [14, 1, IN_OUT], [40, .8]] },
  ] });
  ab.stateMachine('Flame', {
    inputs: [{ name: 'lit', type: 'bool', value: true }, { name: 'boost', type: 'trigger' }],
    layers: [{ name: 'Main', states: [{ name: 'burn', animation: burn }, { name: 'out', animation: outAnim }, { name: 'boost', animation: boost }],
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
