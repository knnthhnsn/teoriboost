// More TeoriBoost Rive artboards (built into teoriboost.riv by build-teoriboost.mjs).
// Remember: Rive draws the first drawable on top, so every board adds its top layer first.
import { Artboard } from './riv.mjs';

const C = { lime: '#FFD60A', limeEdge: '#B38F00', green: '#58CC02', red: '#FF4B4B', yellow: '#FFC800', ink: '#1F2328', inkDeep: '#1A1605',
  white: '#FFFFFF', pink: '#FF8FB1', sky: '#BFE9FF', lamp: '#FFE58A', grey: '#D3D6DB', greyDark: '#3A414A', hub: '#E3E5E8', spoke: '#9AA3AD' };
const OUT_BACK = [0.34, 1.56, 0.64, 1], OUT_SOFT = [0.22, 1, 0.36, 1], IN_OUT = [0.45, 0, 0.55, 1], IN = [0.55, 0, 1, 0.45];
const SPRING = { elastic: 'out', amplitude: 1, period: .32 };
const TAU = Math.PI * 2;

/* small shape helpers: each returns { shape, solid?, strokeSolid? } */
function rect(ab, parent, name, { w, h, x = 0, y = 0, r = 0, fill, stroke, sw = 3, ox, oy, rotation }) {
  const shape = ab.add('Shape', { parent, name, x, y, rotation });
  ab.add('Rectangle', { parent: shape, width: w, height: h, cornerRadiusTL: r, linkCornerRadius: true, originX: ox, originY: oy });
  return paint(ab, shape, fill, stroke, sw);
}
function circle(ab, parent, name, { d, x = 0, y = 0, fill, stroke, sw = 3 }) {
  const shape = ab.add('Shape', { parent, name, x, y });
  ab.add('Ellipse', { parent: shape, width: d, height: d });
  return paint(ab, shape, fill, stroke, sw);
}
function poly(ab, parent, name, pts, { fill, stroke, sw = 3, closed = true, x = 0, y = 0 }) {
  const shape = ab.add('Shape', { parent, name, x, y });
  const path = ab.add('PointsPath', { parent: shape, isClosed: closed });
  for (const [px, py, radius = 0] of pts) ab.add('StraightVertex', { parent: path, x: px, y: py, radius });
  return paint(ab, shape, fill, stroke, sw);
}
function paint(ab, shape, fill, stroke, sw) {
  const out = { shape };
  // the stroke is added first so it draws over the fill
  if (stroke) { const s = ab.add('Stroke', { parent: shape, thickness: sw, cap: 1, join: 1 }); out.strokeSolid = ab.add('SolidColor', { parent: s, color: stroke }); out.stroke = s; }
  if (fill) { const f = ab.add('Fill', { parent: shape }); out.solid = ab.add('SolidColor', { parent: f, color: fill }); }
  return out;
}
/** an arc (part of a circle) drawn as a trimmed ellipse stroke */
function arc(ab, parent, name, { d, sw, color, from = 0, to = 1, offset = 0 }) {
  const shape = ab.add('Shape', { parent, name });
  ab.add('Ellipse', { parent: shape, width: d, height: d });
  const s = ab.add('Stroke', { parent: shape, thickness: sw, cap: 1, join: 1 });
  ab.add('SolidColor', { parent: s, color });
  const trim = ab.add('TrimPath', { parent: s, trimStart: from, trimEnd: to, trimOffset: offset, trimMode: 1 });
  return { shape, trim };
}

/* ---------------- Gauge: a speedometer whose needle follows the number input "pct" (0-100) ---------------- */
export function gauge() {
  const ab = new Artboard('Gauge', 120, 120);
  const pivot = ab.add('Node', { name: 'pivot', x: 60, y: 57 }); // high enough to leave the bottom gap for the number
  const SWEEP = 2 / 3, START = 1 - SWEEP / 2; // 240 degrees around 12 o'clock: a Rive ellipse path starts at 12 o'clock and runs clockwise
  const ANG = SWEEP * Math.PI;                         // needle swing each side of straight up
  circle(ab, pivot, 'hubDot', { d: 6, fill: C.inkDeep });
  circle(ab, pivot, 'hub', { d: 14, fill: C.lime });
  const needleNode = ab.add('Node', { parent: pivot, name: 'needle' });
  rect(ab, needleNode, 'needleBar', { w: 4, h: 32, y: -13, r: 2, fill: C.white });
  const progress = arc(ab, pivot, 'progress', { d: 86, sw: 8, color: C.lime, from: 0, to: 0, offset: START });
  arc(ab, pivot, 'track', { d: 86, sw: 8, color: '#FFFFFF2E', from: 0, to: SWEEP, offset: START });
  for (let i = 0; i <= 6; i++) {
    const arm = ab.add('Node', { parent: pivot, name: 'tick' + i, rotation: -ANG + (2 * ANG * i) / 6 });
    rect(ab, arm, 'tickBar' + i, { w: 2.5, h: i % 3 === 0 ? 8 : 5, y: -29, r: 1, fill: '#FFFFFF73' });
  }
  const p0 = ab.animation('p0', { duration: 1, loop: 'loop', tracks: [
    { object: needleNode, prop: 'rotation', keys: [[0, -ANG]] }, { object: progress.trim, prop: 'trimEnd', keys: [[0, 0]] } ] });
  const p100 = ab.animation('p100', { duration: 1, loop: 'loop', tracks: [
    { object: needleNode, prop: 'rotation', keys: [[0, ANG]] }, { object: progress.trim, prop: 'trimEnd', keys: [[0, SWEEP]] } ] });
  ab.stateMachine('Gauge', { inputs: [{ name: 'pct', type: 'number', value: 0 }],
    layers: [{ name: 'Dial', states: [{ name: 'dial', blend: { input: 'pct', animations: [{ animation: p0, value: 0 }, { animation: p100, value: 100 }] } }],
      transitions: [{ from: 'entry', to: 'dial' }] }] });
  return ab;
}

/* ---------------- TrafficLight: the Danish sequence red, red+yellow, green, yellow, red ---------------- */
export function trafficLight() {
  const ab = new Artboard('TrafficLight', 48, 112);
  const root = ab.add('Node', { name: 'root', x: 24, y: 56 });
  const lamps = [['red', -32, C.red], ['yellow', 0, C.yellow], ['green', 32, C.green]].map(([name, y, on]) => {
    const lamp = circle(ab, root, name, { d: 22, y, fill: C.greyDark });
    const glow = circle(ab, root, name + 'Glow', { d: 34, y, fill: on });
    return { name, lamp, glow, on };
  });
  rect(ab, root, 'housing', { w: 38, h: 104, r: 13, fill: C.ink });
  // when each lamp is lit, in frames of a 3 s loop (60 fps)
  const lit = { red: [[0, 66], [156, 180]], yellow: [[48, 66], [132, 156]], green: [[66, 132]] };
  const tracks = lamps.flatMap(({ name, lamp, glow, on }) => {
    const ck = [], ok = [];
    const isOn = f => lit[name].some(([a, b]) => f >= a && f < b);
    const edges = [...new Set([0, ...lit[name].flat(), 180])].sort((a, b) => a - b);
    for (const f of edges) {
      const v = isOn(f) && f < 180;
      ck.push([f, v ? on : C.greyDark, 'hold']); ok.push([f, v ? .32 : 0, 'hold']);
    }
    return [{ object: lamp.solid, prop: 'color', keys: ck }, { object: glow.shape, prop: 'opacity', keys: ok }];
  });
  const cycle = ab.animation('cycle', { duration: 180, loop: 'loop', tracks });
  ab.stateMachine('TrafficLight', { inputs: [], layers: [{ name: 'Main', states: [{ name: 'cycle', animation: cycle }], transitions: [{ from: 'entry', to: 'cycle' }] }] });
  return ab;
}

/* ---------------- Bolt: the Booster bolt; glints now and then, jumps when you earn ---------------- */
export function bolt() {
  const ab = new Artboard('Bolt', 56, 56);
  const root = ab.add('Node', { name: 'root', x: 28, y: 28 });
  const sparks = [];
  for (let i = 0; i < 5; i++) {
    const arm = ab.add('Node', { parent: root, name: 'spark' + i, rotation: -Math.PI / 2 + (i - 2) * 0.62 });
    sparks.push(rect(ab, arm, 'sparkBar' + i, { w: 7, h: 3.5, x: 18, r: 1.75, fill: i % 2 ? C.lime : C.green }).shape);
  }
  const boltNode = ab.add('Node', { parent: root, name: 'bolt' });
  poly(ab, boltNode, 'boltShape', [[3, -12], [-7, 2], [-1, 2], [-3, 12], [7, -2], [1, -2]], { fill: C.inkDeep });
  const discNode = ab.add('Node', { parent: root, name: 'discNode' });
  circle(ab, discNode, 'disc', { d: 34, fill: C.lime, stroke: C.limeEdge, sw: 2 });
  const ring = circle(ab, root, 'ring', { d: 34, stroke: C.lime, sw: 3 }).shape;

  const quiet = [
    { object: ring, prop: 'opacity', keys: [[0, 0, 'hold']] },
    ...sparks.map(s => ({ object: s, prop: 'opacity', keys: [[0, 0, 'hold']] })),
  ];
  const idle = ab.animation('idle', { duration: 240, loop: 'loop', tracks: [...quiet.slice(1),
    { object: boltNode, prop: 'rotation', keys: [[0, 0, 'hold'], [170, 0, IN_OUT], [180, -.22, IN_OUT], [190, .16, IN_OUT], [200, -.06, IN_OUT], [210, 0]] },
    { object: boltNode, prop: 'scaleX', keys: [[0, 1, 'hold'], [170, 1, OUT_BACK], [182, 1.12, IN_OUT], [200, 1]] },
    { object: boltNode, prop: 'scaleY', keys: [[0, 1, 'hold'], [170, 1, OUT_BACK], [182, 1.12, IN_OUT], [200, 1]] },
    { object: ring, prop: 'opacity', keys: [[0, 0, 'hold'], [176, .7, OUT_SOFT], [226, 0]] },
    { object: ring, prop: 'scaleX', keys: [[0, 1, 'hold'], [176, 1, OUT_SOFT], [226, 1.55]] },
    { object: ring, prop: 'scaleY', keys: [[0, 1, 'hold'], [176, 1, OUT_SOFT], [226, 1.55]] },
    { object: discNode, prop: 'scaleX', keys: [[0, 1, 'hold']] }, { object: discNode, prop: 'scaleY', keys: [[0, 1, 'hold']] },
  ] });
  const earn = ab.animation('earn', { duration: 54, tracks: [
    { object: discNode, prop: 'scaleX', keys: [[0, 1, OUT_SOFT], [8, 1.32, SPRING], [44, 1]] },
    { object: discNode, prop: 'scaleY', keys: [[0, 1, OUT_SOFT], [8, 1.32, SPRING], [44, 1]] },
    { object: boltNode, prop: 'rotation', keys: [[0, 0, OUT_SOFT], [8, -.45, SPRING], [44, 0]] },
    { object: boltNode, prop: 'scaleX', keys: [[0, 1, OUT_SOFT], [8, 1.3, SPRING], [44, 1]] },
    { object: boltNode, prop: 'scaleY', keys: [[0, 1, OUT_SOFT], [8, 1.3, SPRING], [44, 1]] },
    { object: ring, prop: 'opacity', keys: [[0, .9, OUT_SOFT], [36, 0]] },
    { object: ring, prop: 'scaleX', keys: [[0, 1, OUT_SOFT], [36, 1.9]] },
    { object: ring, prop: 'scaleY', keys: [[0, 1, OUT_SOFT], [36, 1.9]] },
    ...sparks.flatMap(s => [
      { object: s, prop: 'x', keys: [[0, 16, OUT_SOFT], [30, 30]] },
      { object: s, prop: 'opacity', keys: [[0, 1, 'hold'], [14, 1, IN_OUT], [30, 0]] },
    ]),
  ] });
  ab.stateMachine('Bolt', { inputs: [{ name: 'earn', type: 'trigger' }],
    layers: [{ name: 'Main', states: [{ name: 'idle', animation: idle }, { name: 'earn', animation: earn }],
      transitions: [{ from: 'entry', to: 'idle' }, { from: 'any', to: 'earn', when: [{ input: 'earn' }] }, { from: 'earn', to: 'idle', exitTime: 900 }] }] });
  return ab;
}

/* ---------------- Target: today's goal; a dart lands in the centre when the goal is met ---------------- */
export function target() {
  const ab = new Artboard('Target', 56, 56);
  const root = ab.add('Node', { name: 'root', x: 28, y: 28 });
  const dart = ab.add('Node', { parent: root, name: 'dart', rotation: -0.72 });
  // the dart points at its tip (0,0) and trails off to +x
  poly(ab, dart, 'head', [[0, 0], [8, -3.6], [8, 3.6]], { fill: C.inkDeep });
  rect(ab, dart, 'shaft', { w: 18, h: 2.6, x: 15, r: 1.3, fill: C.inkDeep });
  poly(ab, dart, 'flightA', [[20, 0], [26, -5.5], [28, -5.5], [24, 0]], { fill: C.lime });
  poly(ab, dart, 'flightB', [[20, 0], [26, 5.5], [28, 5.5], [24, 0]], { fill: C.lime });
  const board = ab.add('Node', { parent: root, name: 'board' });
  circle(ab, board, 'r5', { d: 8, fill: C.pink });
  circle(ab, board, 'r4', { d: 16, fill: C.white });
  circle(ab, board, 'r3', { d: 24, fill: C.pink });
  circle(ab, board, 'r2', { d: 32, fill: C.white });
  circle(ab, board, 'r1', { d: 40, fill: C.pink });
  const ring = circle(ab, root, 'ring', { d: 40, stroke: C.pink, sw: 3 }).shape;

  const open = ab.animation('open', { duration: 1, loop: 'loop', tracks: [
    { object: dart, prop: 'opacity', keys: [[0, 0, 'hold']] }, { object: ring, prop: 'opacity', keys: [[0, 0, 'hold']] },
    { object: board, prop: 'scaleX', keys: [[0, 1, 'hold']] }, { object: board, prop: 'scaleY', keys: [[0, 1, 'hold']] } ] });
  const hit = ab.animation('hit', { duration: 60, tracks: [
    { object: dart, prop: 'opacity', keys: [[0, 0, 'hold'], [4, 1, 'hold']] },
    { object: dart, prop: 'x', keys: [[0, 34, IN], [16, 0]] },
    { object: dart, prop: 'y', keys: [[0, -30, IN], [16, 0]] },
    { object: dart, prop: 'rotation', keys: [[0, -0.72, 'hold'], [16, -0.72, SPRING], [17, -0.6, SPRING], [56, -0.72]] },
    { object: board, prop: 'scaleX', keys: [[0, 1, 'hold'], [16, .84, SPRING], [50, 1]] },
    { object: board, prop: 'scaleY', keys: [[0, 1, 'hold'], [16, .84, SPRING], [50, 1]] },
    { object: ring, prop: 'opacity', keys: [[0, 0, 'hold'], [16, .9, OUT_SOFT], [48, 0]] },
    { object: ring, prop: 'scaleX', keys: [[0, 1, 'hold'], [16, 1, OUT_SOFT], [48, 1.6]] },
    { object: ring, prop: 'scaleY', keys: [[0, 1, 'hold'], [16, 1, OUT_SOFT], [48, 1.6]] },
  ] });
  ab.stateMachine('Target', { inputs: [{ name: 'met', type: 'bool', value: false }],
    layers: [{ name: 'Main', states: [{ name: 'open', animation: open }, { name: 'hit', animation: hit }],
      transitions: [{ from: 'entry', to: 'open' }, { from: 'open', to: 'hit', when: [{ input: 'met', value: true }] }, { from: 'hit', to: 'open', when: [{ input: 'met', value: false }] }] }] });
  return ab;
}
