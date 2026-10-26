// Brand moments, all drawn in code (no images): dist/assets/rive/brand.riv
//   Logo         the app opens: three lane markings race down a dark road and click into place as /// in the lime box
//   Streak3/7/30 a streak milestone: a flame grows into a spinning wheel of fire, a bronze/silver/gold medal drops in
//   LessonDone   a lesson is finished: the light turns green, the road rolls out to a tick, stars fly into a bar
//   Cta          the start page's "Kom i gang" button: lights on hover (bool "hover"), engine and exhaust on "press"
// Remember: Rive draws the first drawable on top, so the top layer is added first.
import { writeFileSync, mkdirSync } from 'node:fs';
import { Artboard, writeRiv, BLEND } from './riv.mjs';
import { OUT_BACK, OUT, IN_OUT, IN, SPRING, TAU, LIME, WHITE, INK, CONFETTI, reseed, rnd, shape, solid, stroke, gradient, alpha, glow, rect, ellipse, poly, star, scale, shake, merge, repeat, replayable } from './helpers.mjs';

/* ======================= Logo ======================= */
// the brand mark: a 64-unit lime box (corner 15) with three slanted stripes, as in the app's SVG
// (M9.8 46.8h6.8l16-29.6h-6.8z, then the same 10.8 and 21.6 units further right)
function logoBoard() {
  const S = 360, C = S / 2, u = 3, ab = new Artboard('Logo', S, S);
  const tracks = [], T = (o, p, k) => tracks.push({ object: o, prop: p, keys: k });
  const LAND = [30, 37, 44], END = 100;

  // click sparks where each stripe lands, a ring when the last one is in
  LAND.forEach((t0, i) => {
    const sx = C + ([9.8, 20.6, 31.4][i] + 19.4 - 32) * u, sy = C - 14.8 * u; // the stripe's top end
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + (k - 2) * .45, d = 26 + rnd() * 18;
      const sp = ellipse(ab, 0, `click${i}-${k}`, { d: 5, x: sx, y: sy, color: k % 2 ? WHITE : LIME, props: { opacity: 0, blendModeValue: BLEND.screen } });
      T(sp, 'opacity', [[0, 0, 'hold'], [t0, 1, 'hold'], [t0 + 8, 1], [t0 + 16, 0]]);
      T(sp, 'x', [[0, sx, 'hold'], [t0, sx, OUT], [t0 + 16, sx + Math.cos(a) * d]]);
      T(sp, 'y', [[0, sy, 'hold'], [t0, sy, OUT], [t0 + 16, sy + Math.sin(a) * d]]);
    }
  });
  const ring = ellipse(ab, 0, 'ring', { d: 64 * u, x: C, y: C, props: { opacity: 0 } }); stroke(ab, ring, LIME, 5);
  T(ring, 'opacity', [[0, 0, 'hold'], [LAND[2] + 2, 1], [LAND[2] + 30, 0]]);
  tracks.push(...scale(ring, [[0, 1.42, 'hold'], [LAND[2] + 2, 1.42, OUT], [LAND[2] + 30, 1.82]])); // from just outside the box's corners to just inside the canvas

  // the mark: stripes over the box, a glint clipped to the box
  const logo = ab.add('Node', { parent: 0, name: 'logo', x: C, y: C });
  const glint = ab.add('Node', { parent: logo, name: 'glint', x: -150, rotation: .45 });
  const boxClip = shape(ab, logo, 'box-clip'); ab.add('Rectangle', { parent: boxClip, width: 64 * u, height: 64 * u, cornerRadiusTL: 15 * u, linkCornerRadius: true });
  ab.add('ClippingShape', { parent: glint, sourceId: boxClip, fillRule: 0, isVisible: true });
  const band = rect(ab, glint, 'glint-band', { w: 46, h: 320, props: { blendModeValue: BLEND.screen } });
  gradient(ab, band, 'linear', [-23, 0, 23, 0], [[alpha(WHITE, 0), 0], [alpha(WHITE, .85), .5], [alpha(WHITE, 0), 1]]);
  T(glint, 'x', [[0, -150, 'hold'], [58, -150, IN_OUT], [92, 150]]);
  [9.8, 20.6, 31.4].forEach((x0, i) => {
    const cx = (x0 + 11.4 - 32) * u, t1 = LAND[i], t0 = t1 - 18;
    const n = ab.add('Node', { parent: logo, name: 'stripe' + i, x: cx, y: 0, opacity: 0 });
    const sh = poly(ab, n, 'stripe-shape' + i, [[-11.4 * u, 14.8 * u], [-4.6 * u, 14.8 * u], [11.4 * u, -14.8 * u], [4.6 * u, -14.8 * u]]);
    // a glowing lane marking on the way down; it turns ink as it lands on the lime box
    T(solid(ab, sh, INK), 'color', [[0, WHITE, 'hold'], [t0, WHITE], [t1 - 6, LIME, 'hold'], [t1, INK]]);
    // from the far end of the road (small, high up) racing towards the camera, then a snap into its slot
    T(n, 'opacity', [[0, 0, 'hold'], [t0, 0, OUT], [t0 + 4, 1, 'hold']]);
    T(n, 'x', [[0, 0, 'hold'], [t0, 0, IN], [t1, cx]]);
    T(n, 'y', [[0, -150, 'hold'], [t0, -150, IN], [t1, 0]]);
    tracks.push(...scale(n, [[0, .12, 'hold'], [t0, .12, IN], [t1, 1.22, SPRING], [t1 + 22, 1]]));
  });
  const box = rect(ab, logo, 'box', { w: 64 * u, h: 64 * u, r: 15 * u, color: LIME });
  const shadow = ellipse(ab, 0, 'shadow', { w: 64 * u * 1.1, h: 26, x: C, y: C + 32 * u + 14, props: { opacity: 0 } });
  gradient(ab, shadow, 'radial', [0, 0, 64 * u * .55, 0], [['#00000080', 0], ['#00000000', 1]]);
  T(shadow, 'opacity', [[0, 0, 'hold'], [LAND[0] - 8, 0, OUT], [LAND[0] + 8, 1]]);
  const bump = LAND.flatMap(t => [[t, 1, OUT], [t + 3, 1.06, SPRING], [t + 16, 1]]);
  tracks.push(...scale(box, merge([[0, 0, 'hold'], [LAND[0] - 8, 0, OUT_BACK], [LAND[0] + 6, 1, 'hold']], bump.filter(([t]) => t > LAND[0] + 6))));
  T(box, 'rotation', [[0, -.6, 'hold'], [LAND[0] - 8, -.6, OUT_BACK], [LAND[0] + 6, 0]]);

  // speed lines streaming out from the centre as the box lands
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * TAU + rnd() * .2, r0 = 120 + rnd() * 20, r1 = r0 + 40 + rnd() * 60;
    const line = shape(ab, 0, 'speed' + i, { x: C, y: C, opacity: 0, blendModeValue: BLEND.screen });
    const p = ab.add('PointsPath', { parent: line, isClosed: false });
    ab.add('StraightVertex', { parent: p, x: Math.cos(a) * r0, y: Math.sin(a) * r0 });
    ab.add('StraightVertex', { parent: p, x: Math.cos(a) * r1, y: Math.sin(a) * r1 });
    const st = stroke(ab, line, i % 3 ? LIME : WHITE, 2.5 + rnd() * 2);
    const trim = ab.add('TrimPath', { parent: st, trimStart: 0, trimEnd: 0, trimMode: 1 });
    const t0 = 18 + Math.round(rnd() * 26);
    T(line, 'opacity', [[0, 0, 'hold'], [t0, 1, 'hold'], [t0 + 22, 0, 'hold']]);
    T(trim, 'trimEnd', [[0, 0, 'hold'], [t0, 0, OUT], [t0 + 12, 1]]);
    T(trim, 'trimStart', [[0, 0, 'hold'], [t0 + 4, 0, OUT], [t0 + 22, 1]]);
  }
  // the road the stripes come down, fading once the box is in
  const road = poly(ab, 0, 'road', [[C - 8, 20], [C + 8, 20], [C + 150, S], [C - 150, S]], { props: { opacity: 0 } });
  gradient(ab, road, 'linear', [0, 20, 0, S], [[alpha('#2A3048', 0), 0], [alpha('#2A3048', 1), .55], [alpha('#2A3048', 0), 1]]);
  T(road, 'opacity', [[0, 0], [8, 1, 'hold'], [44, 1, OUT], [60, 0]]);
  const bloom = glow(ab, 0, 'bloom', { d: 340, color: LIME, a: .45, x: C, y: C, props: { opacity: 0 } });
  T(bloom, 'opacity', [[0, 0, 'hold'], [LAND[2], 0, OUT], [LAND[2] + 10, 1], [END, .5]]);

  const show = ab.animation('show', { duration: END, tracks });
  ab.stateMachine('Logo', { inputs: [{ name: 'play', type: 'trigger' }], layers: [{ name: 'Main', states: [{ name: 'show', animation: show }, { name: 'again', animation: show }],
    transitions: [{ from: 'entry', to: 'show' }, { from: 'show', to: 'again', when: [{ input: 'play' }] }, { from: 'again', to: 'show', when: [{ input: 'play' }] }] }] });
  return ab;
}

/* ======================= Streak milestones ======================= */
const TIERS = { 3: { metal: '#E39B5B', dark: '#8E4E1F', light: '#FFD7B0' }, 7: { metal: '#C7D2E2', dark: '#6E7B92', light: '#FFFFFF' }, 30: { metal: '#FFD400', dark: '#A87E00', light: '#FFF6B0' } };
function streakBoard(days) {
  const t = TIERS[days], S = 360, C = 172, ab = new Artboard('Streak' + days, S, S);
  const tracks = [], idle = [], T = (o, p, k) => tracks.push({ object: o, prop: p, keys: k }), I = (o, p, k) => idle.push({ object: o, prop: p, keys: k });
  const IGNITE = 8, DROP = 34, LANDED = 50, END = 120;

  // sparkles for the landing
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * TAU, d = 110 + rnd() * 50;
    const s = star(ab, 0, 'spark' + k, { d: 14, points: 4, inner: .2, x: S / 2, y: C, color: k % 2 ? WHITE : t.light, props: { opacity: 0, blendModeValue: BLEND.screen } });
    T(s, 'opacity', [[0, 0, 'hold'], [LANDED, 1, 'hold'], [LANDED + 20, 1], [LANDED + 34, 0]]);
    T(s, 'x', [[0, S / 2, 'hold'], [LANDED, S / 2, OUT], [LANDED + 34, S / 2 + Math.cos(a) * d]]);
    T(s, 'y', [[0, C, 'hold'], [LANDED, C, OUT], [LANDED + 34, C + Math.sin(a) * d]]);
    T(s, 'rotation', [[0, 0, 'hold'], [LANDED, 0], [LANDED + 34, Math.PI]]);
  }
  // the medal: ribbon tails, rim, face, star; a shine clipped to it; it drops in and spins like a coin
  const medal = ab.add('Node', { parent: 0, name: 'medal', x: S / 2, y: C, opacity: 0 });
  const coin = ab.add('Node', { parent: medal, name: 'coin' });
  const shine = ab.add('Node', { parent: coin, name: 'shine', x: -90, rotation: .5 });
  const clip = shape(ab, coin, 'coin-clip'); ab.add('Ellipse', { parent: clip, width: 124, height: 124 });
  ab.add('ClippingShape', { parent: shine, sourceId: clip, fillRule: 0, isVisible: true });
  const sb = rect(ab, shine, 'shine-band', { w: 30, h: 200, props: { blendModeValue: BLEND.screen } });
  gradient(ab, sb, 'linear', [-15, 0, 15, 0], [[alpha(WHITE, 0), 0], [alpha(WHITE, .9), .5], [alpha(WHITE, 0), 1]]);
  const st = star(ab, coin, 'medal-star', { d: 62, inner: .48 }); stroke(ab, st, t.dark, 3);
  gradient(ab, st, 'linear', [0, -31, 0, 31], [[WHITE, 0], [t.light, 1]]);
  const face = ellipse(ab, coin, 'face', { d: 96 });
  gradient(ab, face, 'radial', [-18, -22, 70, 0], [[t.light, 0], [t.metal, .6], [t.dark, 1]]);
  const rim = ellipse(ab, coin, 'rim', { d: 124 }); stroke(ab, rim, t.dark, 5); solid(ab, rim, t.metal);
  for (const side of [-1, 1]) poly(ab, medal, 'tail' + side, [[side * 8, 30], [side * 44, 30], [side * 56, 112], [side * 38, 98], [side * 24, 116]], { color: side < 0 ? '#FF4B4B' : LIME });
  T(medal, 'opacity', [[0, 0, 'hold'], [DROP, 1, 'hold']]);
  T(medal, 'y', [[0, C - 240, 'hold'], [DROP, C - 240, IN], [LANDED - 4, C, SPRING], [LANDED + 26, C]]);
  T(coin, 'scaleX', [[0, 1, 'hold'], [LANDED, 1, IN_OUT], [LANDED + 7, .05, IN_OUT], [LANDED + 14, 1, IN_OUT], [LANDED + 21, .05, IN_OUT], [LANDED + 28, 1]]);
  T(shine, 'x', [[0, -90, 'hold'], [LANDED + 34, -90, IN_OUT], [LANDED + 58, 90]]);
  I(shine, 'x', [[0, -90, 'hold'], [80, -90, IN_OUT], [104, 90, 'hold']]);
  const ring = ellipse(ab, 0, 'ring', { d: 130, x: S / 2, y: C, props: { opacity: 0 } }); stroke(ab, ring, t.light, 6);
  T(ring, 'opacity', [[0, 0, 'hold'], [LANDED - 4, 1], [LANDED + 30, 0]]);
  tracks.push(...scale(ring, [[0, 1, 'hold'], [LANDED - 4, 1, OUT], [LANDED + 30, 2.4]]));

  // the wheel of fire: 14 tongues around the medal, each flickering; it spins up from a single flame
  const wheel = ab.add('Node', { parent: 0, name: 'wheel', x: S / 2, y: C });
  const N = 14, R = 84;
  for (let i = 0; i < N; i++) {
    const arm = ab.add('Node', { parent: wheel, name: 'arm' + i, rotation: i / N * TAU });
    const tongue = ab.add('Node', { parent: arm, name: 'tongue' + i, y: -R });
    const f = poly(ab, tongue, 'flame' + i, [[0, -46, 3], [16, 0, 14], [0, 14, 10], [-16, 0, 14]], { props: { blendModeValue: BLEND.screen } });
    gradient(ab, f, 'linear', [0, 14, 0, -46], [['#FF3D00', 0], ['#FF8A00', .35], ['#FFD400', .75], ['#FFF3B0', 1]]);
    const flick = [[[0, 1], [8, 1.22], [16, .88], [24, 1.1], [30, 1]], [[0, 1.1], [7, .9], [15, 1.25], [22, .95], [30, 1.1]], [[0, .92], [10, 1.15], [18, 1], [25, 1.2], [30, .92]]][i % 3].map(([k, v]) => [k, v, IN_OUT]);
    tracks.push({ object: tongue, prop: 'scaleY', keys: repeat(flick, 30, 4) });
    idle.push({ object: tongue, prop: 'scaleY', keys: repeat(flick, 30, 4) });
    T(tongue, 'y', [[0, -10, 'hold'], [IGNITE, -10, OUT_BACK], [IGNITE + 24 + i, -R]]);
  }
  tracks.push(...scale(wheel, [[0, .2, 'hold'], [IGNITE, .2, OUT_BACK], [IGNITE + 26, 1]]));
  T(wheel, 'rotation', [[0, -1.8, 'hold'], [IGNITE, -1.8, OUT], [END, 0]]);
  I(wheel, 'rotation', [[0, 0], [120, TAU / N]]);
  // embers flying out
  for (let k = 0; k < 18; k++) {
    const a = rnd() * TAU, r0 = 60 + rnd() * 20, r1 = 150 + rnd() * 40, ph = Math.round(rnd() * 60);
    const e = ellipse(ab, 0, 'ember' + k, { d: 3 + rnd() * 3, x: S / 2, y: C, color: ['#FFD400', '#FF8A00', '#FFF3B0'][k % 3], props: { opacity: 0, blendModeValue: BLEND.screen } });
    for (const [list, start] of [[tracks, IGNITE + 20], [idle, 0]]) for (let c = 0; c < 2; c++) {
      const o = start + ph % 20 + c * 60;
      list.push({ object: e, prop: 'opacity', keys: [[0, 0, 'hold'], [o, 1], [o + 40, 0, 'hold']], _merge: true });
      list.push({ object: e, prop: 'x', keys: [[0, S / 2, 'hold'], [o, S / 2 + Math.cos(a) * r0, OUT], [o + 40, S / 2 + Math.cos(a) * r1, 'hold']], _merge: true });
      list.push({ object: e, prop: 'y', keys: [[0, C, 'hold'], [o, C + Math.sin(a) * r0, OUT], [o + 40, C + Math.sin(a) * r1 - 20, 'hold']], _merge: true });
    }
  }
  const core = glow(ab, 0, 'core', { d: 300, color: '#FF8A00', a: .75, x: S / 2, y: C, props: { opacity: 0 } });
  T(core, 'opacity', [[0, 0, 'hold'], [IGNITE, .3, OUT], [IGNITE + 20, 1]]);
  I(core, 'opacity', [[0, 1, IN_OUT], [60, .75, IN_OUT], [120, 1]]);

  const show = ab.animation('show', { duration: END, tracks: combine(tracks) });
  const loop = ab.animation('idle', { duration: 120, loop: 'loop', tracks: combine(idle) });
  replayable(ab, 'Streak', show, loop, END);
  return ab;
}
/** tracks flagged _merge for the same object and property become one track */
function combine(list) {
  const out = [], seen = new Map();
  for (const tr of list) {
    if (!tr._merge) { out.push(tr); continue; }
    const k = tr.object + ':' + tr.prop;
    if (!seen.has(k)) { const t = { object: tr.object, prop: tr.prop, keys: [] }; seen.set(k, t); out.push(t); }
    seen.get(k).keys = merge(seen.get(k).keys, tr.keys);
  }
  return out;
}

/* ======================= Lesson done ======================= */
function lessonBoard() {
  const W = 400, H = 240, ab = new Artboard('LessonDone', W, H);
  const tracks = [], idle = [], T = (o, p, k) => tracks.push({ object: o, prop: p, keys: k }), I = (o, p, k) => idle.push({ object: o, prop: p, keys: k });
  const LX = 52, ROADY = 196, RX0 = 84, RX1 = 352, GOAL = 362, BAR = { x: 104, y: 44, w: 252, h: 16 };
  const AMBER = 26, GREEN = 44, ROLL0 = 50, ROLL1 = 92, TICK = 96, STARS = 110, END = 200;

  // stars: out of the tick, along an arc, into the bar
  const fillAt = i => BAR.x + BAR.w * (i + 1) / 5;
  for (let i = 0; i < 5; i++) {
    const t0 = STARS + i * 9, t1 = t0 + 26, tx = fillAt(i) - 6, ty = BAR.y + BAR.h / 2;
    const s = star(ab, 0, 'star' + i, { d: 32, inner: .46, x: GOAL, y: ROADY - 20, props: { opacity: 0 } }); stroke(ab, s, INK, 2.5); solid(ab, s, '#FFD400');
    T(s, 'opacity', [[0, 0, 'hold'], [t0, 1, 'hold'], [t1, 0, 'hold']]);
    T(s, 'x', [[0, GOAL, 'hold'], [t0, GOAL, IN_OUT], [t1, tx]]);
    T(s, 'y', [[0, ROADY - 20, 'hold'], [t0, ROADY - 20, OUT], [t0 + 12, ROADY - 120 - i * 6, IN], [t1, ty]]);
    T(s, 'rotation', [[0, 0, 'hold'], [t0, 0], [t1, TAU]]);
    tracks.push(...scale(s, [[0, 0, 'hold'], [t0, 0, OUT_BACK], [t0 + 8, 1.25], [t1, .6]]));
    const pop = glow(ab, 0, 'bar-pop' + i, { d: 46, color: WHITE, a: 1, x: tx, y: ty, props: { opacity: 0 } });
    T(pop, 'opacity', [[0, 0, 'hold'], [t1, 1, OUT], [t1 + 16, 0]]);
  }
  // confetti out of the tick
  for (let i = 0; i < 22; i++) {
    const a = -Math.PI / 2 + (rnd() - .5) * 2.6, v = 90 + rnd() * 90, t0 = TICK + 2 + Math.round(rnd() * 4), life = 50 + Math.round(rnd() * 20);
    const piece = rect(ab, 0, 'confetti' + i, { w: 6 + rnd() * 3, h: 9 + rnd() * 5, r: 1.5, x: GOAL, y: ROADY - 20, color: CONFETTI[i % CONFETTI.length], props: { opacity: 0 } });
    T(piece, 'opacity', [[0, 0, 'hold'], [t0, 1, 'hold'], [t0 + life - 12, 1], [t0 + life, 0]]);
    T(piece, 'x', [[0, GOAL, 'hold'], [t0, GOAL, OUT], [t0 + life, GOAL + Math.cos(a) * v * 1.2]]);
    T(piece, 'y', [[0, ROADY - 20, 'hold'], [t0, ROADY - 20, OUT], [t0 + 20, ROADY - 20 + Math.sin(a) * v, IN], [t0 + life, ROADY + 30 + Math.sin(a) * v * .2]]);
    T(piece, 'rotation', [[0, 0, 'hold'], [t0, rnd() * TAU], [t0 + life, rnd() * TAU + TAU * 1.5]]);
  }
  // the bar: a track, a fill that grows with each star, and a glint that runs along it at the end
  const fill = rect(ab, 0, 'bar-fill', { w: 0, h: BAR.h, x: BAR.x, y: BAR.y + BAR.h / 2, r: BAR.h / 2, ox: 0, props: { opacity: 0 } }); stroke(ab, fill, INK, 2.5); solid(ab, fill, LIME);
  const steps = [[0, 0, 'hold']];
  for (let i = 0; i < 5; i++) { const t1 = STARS + i * 9 + 26; steps.push([t1, BAR.w * i / 5, OUT_BACK], [t1 + 8, BAR.w * (i + 1) / 5, 'hold']); }
  T(fill + 1, 'width', steps);
  T(fill, 'opacity', [[0, 0, 'hold'], [STARS + 26, 1, 'hold']]); // no sliver of outline before the first star
  rect(ab, 0, 'bar-track', { w: BAR.w, h: BAR.h, x: BAR.x, y: BAR.y + BAR.h / 2, r: BAR.h / 2, ox: 0, color: alpha('#8A93A8', .28) });
  const barGlow = ab.add('Node', { parent: 0, name: 'bar-glow', x: BAR.x + BAR.w / 2, y: BAR.y + BAR.h / 2, scaleY: .18, opacity: 0 });
  glow(ab, barGlow, 'bar-glow-light', { d: BAR.w * 1.2, color: LIME, a: .9 });
  T(barGlow, 'opacity', [[0, 0, 'hold'], [STARS + 4 * 9 + 34, 0, OUT], [STARS + 4 * 9 + 50, 1], [END, .4]]);
  I(barGlow, 'opacity', [[0, .4, IN_OUT], [60, .8, IN_OUT], [120, .4]]);

  // the tick at the end of the road
  const goal = ab.add('Node', { parent: 0, name: 'goal', x: GOAL, y: ROADY - 20, scaleX: 0, scaleY: 0 });
  const tick = shape(ab, goal, 'tick'); const tp = ab.add('PointsPath', { parent: tick, isClosed: false });
  for (const [x, y] of [[-11, 1], [-3, 9], [12, -8]]) ab.add('StraightVertex', { parent: tp, x, y });
  const tst = stroke(ab, tick, INK, 5); const ttrim = ab.add('TrimPath', { parent: tst, trimStart: 0, trimEnd: 0, trimMode: 1 });
  const disc = ellipse(ab, goal, 'goal-disc', { d: 48 }); stroke(ab, disc, INK, 3); solid(ab, disc, LIME);
  tracks.push(...scale(goal, [[0, 0, 'hold'], [ROLL1 - 4, 0, OUT_BACK], [TICK + 4, 1]]));
  T(ttrim, 'trimEnd', [[0, 0, 'hold'], [TICK, 0, OUT], [TICK + 14, 1]]);
  idle.push(...scale(goal, [[0, 1, IN_OUT], [60, 1.06, IN_OUT], [120, 1]]));
  const goalRing = ellipse(ab, 0, 'goal-ring', { d: 48, x: GOAL, y: ROADY - 20, props: { opacity: 0 } }); stroke(ab, goalRing, LIME, 5);
  T(goalRing, 'opacity', [[0, 0, 'hold'], [TICK + 2, 1], [TICK + 30, 0]]);
  tracks.push(...scale(goalRing, [[0, 1, 'hold'], [TICK + 2, 1, OUT], [TICK + 30, 2.6]]));

  // a glowing pulse rides the front of the road as it rolls out, with a trail
  const pulse = ab.add('Node', { parent: 0, name: 'pulse', x: RX0, y: ROADY, opacity: 0 });
  glow(ab, pulse, 'pulse-glow', { d: 70, color: LIME, a: 1 });
  ellipse(ab, pulse, 'pulse-dot', { d: 12, color: WHITE });
  const trail = rect(ab, pulse, 'pulse-trail', { w: 90, h: 6, r: 3, ox: 1, props: { blendModeValue: BLEND.screen } });
  gradient(ab, trail, 'linear', [-90, 0, 0, 0], [[alpha(LIME, 0), 0], [alpha(LIME, .9), 1]]);
  T(pulse, 'x', [[0, RX0, 'hold'], [ROLL0, RX0, OUT], [ROLL1, RX1]]);
  T(pulse, 'opacity', [[0, 0, 'hold'], [ROLL0, 1, 'hold'], [ROLL1, 1, OUT], [ROLL1 + 10, 0]]);
  // the road rolling out, dashes appearing as it passes
  for (let i = 0; i < 6; i++) {
    const x = RX0 + 26 + i * 42, tAt = ROLL0 + (ROLL1 - ROLL0) * ((x - RX0) / (RX1 - RX0));
    const d = rect(ab, 0, 'dash' + i, { w: 22, h: 4, r: 2, x, y: ROADY, color: WHITE, props: { scaleX: 0 } });
    T(d, 'scaleX', [[0, 0, 'hold'], [Math.round(tAt), 0, OUT_BACK], [Math.round(tAt) + 10, 1]]);
  }
  const road = rect(ab, 0, 'road', { w: 0, h: 30, x: RX0, y: ROADY, r: 6, ox: 0 }); stroke(ab, road, '#454C63', 2); solid(ab, road, '#2B3040');
  T(road + 1, 'width', [[0, 0, 'hold'], [ROLL0, 0, OUT], [ROLL1, RX1 - RX0]]);

  // the traffic light: red, red and amber, green (with a flare)
  const lamps = [['#FF4B4B', '#4A2525', 62], ['#FFC800', '#4A3E1C', 96], ['#58CC02', '#1E3A22', 130]];
  const on = lamps.map(([c, , y], i) => {
    const n = ab.add('Node', { parent: 0, name: 'lamp-on' + i, x: LX, y, opacity: 0 });
    glow(ab, n, 'lamp-glow' + i, { d: i === 2 ? 110 : 64, color: c, a: .9 });
    ellipse(ab, n, 'lamp' + i, { d: 26, color: c });
    return n;
  });
  T(on[0], 'opacity', [[0, 0], [4, 1, 'hold'], [GREEN, 0, 'hold']]);
  T(on[1], 'opacity', [[0, 0, 'hold'], [AMBER, 1, 'hold'], [GREEN, 0, 'hold']]);
  T(on[2], 'opacity', [[0, 0, 'hold'], [GREEN, 1, 'hold']]);
  tracks.push(...scale(on[2], [[0, 1, 'hold'], [GREEN, 1.5, OUT_BACK], [GREEN + 14, 1]]));
  I(on[2], 'opacity', [[0, 1, IN_OUT], [60, .8, IN_OUT], [120, 1]]);
  lamps.forEach(([, off, y], i) => ellipse(ab, 0, 'lamp-off' + i, { d: 26, x: LX, y, color: off }));
  const housing = rect(ab, 0, 'housing', { w: 46, h: 112, r: 14, x: LX, y: 96 }); stroke(ab, housing, '#454C63', 2); solid(ab, housing, '#1F2328');
  rect(ab, 0, 'pole', { w: 8, h: 80, x: LX, y: 140, oy: 0, color: '#8A93A8' });

  const show = ab.animation('show', { duration: END, tracks });
  const loop = ab.animation('idle', { duration: 120, loop: 'loop', tracks: idle });
  replayable(ab, 'LessonDone', show, loop, END);
  return ab;
}

/* ======================= Kom i gang button ======================= */
// The artboard is the button with a margin around it: the button itself sits at x 60..420, y 41..99 (HTML, on top),
// the canvas is stretched over it (fit Fill), so this board only draws what is around and behind the button.
function ctaBoard() {
  const W = 480, H = 140, BX0 = 60, BX1 = 420, BY = 70, ab = new Artboard('Cta', W, H);
  const idleT = [], hoverT = [], pressT = [];
  const all = (o, p, idleK, hoverK, pressK) => { idleT.push({ object: o, prop: p, keys: idleK }); hoverT.push({ object: o, prop: p, keys: hoverK }); pressT.push({ object: o, prop: p, keys: pressK }); };

  // exhaust: puffs and a flame out of the left end, speed lines streaming back
  const puffs = [];
  for (let i = 0; i < 7; i++) {
    const p = ellipse(ab, 0, 'puff' + i, { d: 26 + rnd() * 16, x: BX0 + 8, y: BY + 14, props: { opacity: 0 } });
    gradient(ab, p, 'radial', [0, 0, 20, 0], [['#6E7482E6', 0], ['#8A909C99', .6], ['#8A909C00', 1]]);
    puffs.push(p);
  }
  puffs.forEach((p, i) => {
    const t0 = 4 + i * 4, x1 = BX0 - 30 - rnd() * 40, y1 = BY + 4 - rnd() * 30;
    all(p, 'opacity', [[0, 0]], [[0, 0]], [[0, 0, 'hold'], [t0, .9, OUT], [t0 + 30, 0]]);
    all(p, 'x', [[0, BX0 + 8]], [[0, BX0 + 8]], [[0, BX0 + 8, 'hold'], [t0, BX0 + 8, OUT], [t0 + 30, x1]]);
    all(p, 'y', [[0, BY + 14]], [[0, BY + 14]], [[0, BY + 14, 'hold'], [t0, BY + 14, OUT], [t0 + 30, y1]]);
    const sk = [[0, .3, 'hold'], [t0, .3, OUT], [t0 + 30, 1.8]];
    all(p, 'scaleX', [[0, .3]], [[0, .3]], sk); all(p, 'scaleY', [[0, .3]], [[0, .3]], sk);
  });
  const flame = ab.add('Node', { parent: 0, name: 'flame', x: BX0 - 4, y: BY + 14, opacity: 0, scaleY: .5 });
  glow(ab, flame, 'flame-glow', { d: 60, color: '#FF8A00', a: 1, blend: BLEND.srcOver });
  poly(ab, flame, 'flame-shape', [[4, -7, 4], [-30, 0, 2], [4, 7, 4]], { color: '#FFD400' });
  all(flame, 'opacity', [[0, 0]], [[0, 0]], [[0, 0, 'hold'], [2, 1, 'hold'], [6, .4, 'hold'], [9, 1, 'hold'], [22, 0]]);
  all(flame, 'scaleX', [[0, 1]], [[0, 1]], [[0, .4, 'hold'], [2, .4, OUT_BACK], [10, 1.4], [22, .6]]);
  // speed lines drawn across the button's path as the button (HTML) shoots off to the right, then fading
  for (let i = 0; i < 6; i++) {
    const y = BY - 20 + i * 8, t0 = 6 + i % 3 * 2, color = i % 2 ? INK : '#B38F00';
    const l = rect(ab, 0, 'streak' + i, { w: 0, h: 3, r: 1.5, x: BX0 + 10, y, ox: 0, props: { opacity: 0 } });
    gradient(ab, l, 'linear', [0, 0, BX1 - BX0 + 40, 0], [[alpha(color, 0), 0], [alpha(color, .75), .6], [alpha(color, 0), 1]]);
    all(l, 'opacity', [[0, 0]], [[0, 0]], [[0, 0, 'hold'], [t0, 1, 'hold'], [t0 + 22, 1], [t0 + 40, 0]]);
    all(l + 1, 'width', [[0, 0]], [[0, 0]], [[0, 0, 'hold'], [t0, 0, IN], [t0 + 20, BX1 - BX0 + 40]]);
  }
  // headlights: two beams out of the right end, on while pointed at
  const beams = ab.add('Node', { parent: 0, name: 'beams', x: BX1 - 6, y: BY, opacity: 0 });
  for (const dy of [-12, 12]) {
    const b = poly(ab, beams, 'beam' + dy, [[0, dy - 4], [66, dy - 18], [66, dy + 18], [0, dy + 4]]);
    gradient(ab, b, 'linear', [0, 0, 66, 0], [[alpha('#FFD400', .85), 0], [alpha('#FFD400', 0), 1]]);
  }
  all(beams, 'opacity', [[0, 0]], [[0, 0, 'hold'], [3, 1, 'hold'], [6, .3, 'hold'], [9, 1]], [[0, 1, OUT], [10, 0]]);
  // the halo (normal blend, so it shows on the light page): a soft lime glow around the button, breathing when idle, bright when pointed at
  const halo = ab.add('Node', { parent: 0, name: 'halo', x: (BX0 + BX1) / 2, y: BY, scaleX: 1, scaleY: .3 });
  glow(ab, halo, 'halo-light', { d: (BX1 - BX0) * 1.25, color: '#B8E04A', a: .9, blend: BLEND.srcOver }); // normal blend: screen vanishes on the light intro
  all(halo, 'opacity', [[0, .25, IN_OUT], [60, .5, IN_OUT], [120, .25]], [[0, 1]], [[0, 1, OUT], [24, 0]]);
  // engine idle on hover: the halo trembles a little
  all(halo, 'x', [[0, 240]], merge([[0, 240]], shake(0, 30, 1.5, 2, 240), [[30, 240]]), [[0, 240]]);

  const idle = ab.animation('idle', { duration: 120, loop: 'loop', tracks: idleT });
  const hover = ab.animation('hover', { duration: 30, loop: 'loop', tracks: hoverT });
  const press = ab.animation('press', { duration: 60, tracks: pressT });
  ab.stateMachine('Cta', { inputs: [{ name: 'hover', type: 'bool' }, { name: 'press', type: 'trigger' }],
    layers: [{ name: 'Main', states: [{ name: 'idle', animation: idle }, { name: 'hover', animation: hover }, { name: 'press', animation: press }],
      transitions: [{ from: 'entry', to: 'idle' },
        { from: 'idle', to: 'hover', duration: 120, when: [{ input: 'hover', value: true }] }, { from: 'hover', to: 'idle', duration: 200, when: [{ input: 'hover', value: false }] },
        { from: 'idle', to: 'press', when: [{ input: 'press' }] }, { from: 'hover', to: 'press', when: [{ input: 'press' }] }] }] });
  return ab;
}

const OUT_FILE = new URL('../../dist/assets/rive/brand.riv', import.meta.url);
mkdirSync(new URL('./', OUT_FILE), { recursive: true });
reseed(11);
const bytes = writeRiv([logoBoard(), streakBoard(3), streakBoard(7), streakBoard(30), lessonBoard(), ctaBoard()], { fileId: 3 });
writeFileSync(OUT_FILE, bytes);
console.log('brand.riv', bytes.length, 'bytes');
