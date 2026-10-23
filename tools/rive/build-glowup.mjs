// GlowUp: the "Sådan kan den blive" show in Min bil, one .riv per vehicle (dist/assets/rive/glowup-<base>.riv).
// The vehicle art is the app's own (rendered by glowup-render.mjs, packed by glowup-pack.py into glowup-art/).
//
//   0.0s  the stage lights come on, the wreck drops in and lands with a squash and dust
//   1.2s  it coughs: the body shakes and smoke puffs out at the back
//   2.0s  a lime scanner beam sweeps across; behind it the wreck becomes the dream build, sparks fly off the beam
//   3.4s  the beam flares: flash, rings, confetti, the car jumps and lands lowered, underglow and light rays come on
//   4.8s  idle: rays turn, the underglow breathes, the suspension bobs, light glints on the roof line
//
// State machine "GlowUp": plays the show on load; trigger "play" runs it again.
// Remember: Rive draws the first drawable on top, so the top layer is added first.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Artboard, writeRiv, BLEND } from './riv.mjs';

const ART = new URL('./glowup-art/', import.meta.url);
const META = JSON.parse(readFileSync(new URL('meta.json', ART)));
const NEON = { scooter: '#B44CFF', smallcar: '#FF2D9B', bigcar: '#14E0F0', racecar: '#39FF14' }; // DREAMS[base].style.neon in start.js
const LIME = '#D5FF62', WHITE = '#FFFFFF';
const CONFETTI = ['#D5FF62', '#FFD400', '#14E0F0', '#FF5FA2', '#B44CFF', '#58CC02', '#FFFFFF'];

const OUT_BACK = [0.34, 1.56, 0.64, 1], OUT = [0.22, 1, 0.36, 1], IN_OUT = [0.45, 0, 0.55, 1], IN = [0.55, 0, 1, 0.45], FALL = [0.5, 0, 1, 0.7];
const SPRING = { elastic: 'out', amplitude: 1, period: .35 };
const TAU = Math.PI * 2;

const SIZE = 400, GROUND = 304;
// the timeline, in frames at 60 fps
const LAND = 28, COUGH = 72, BEAM = 116, SCAN0 = 126, SCAN1 = 204, POP = 206, END = 292, IDLE = 240;

// a seeded random, so every build of the file is the same
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const lerp = (a, b, t) => a + (b - a) * t;

function shape(ab, parent, name, props = {}) { return ab.add('Shape', { parent, name, ...props }); }
function solid(ab, s, color) { const f = ab.add('Fill', { parent: s }); return ab.add('SolidColor', { parent: f, color }); }
/** gradient fill: kind 'linear' | 'radial', from/to in the shape's own space, stops [[color, position]] */
function gradient(ab, s, kind, [sx, sy, ex, ey], stops) {
  const f = ab.add('Fill', { parent: s });
  const g = ab.add(kind === 'radial' ? 'RadialGradient' : 'LinearGradient', { parent: f, startX: sx, startY: sy, endX: ex, endY: ey });
  for (const [color, position] of stops) ab.add('GradientStop', { parent: g, color, position });
  return f;
}
const hex2 = a => Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
const alpha = (c, a) => c + hex2(a);
/** a soft glow: a circle whose radial gradient fades from colour to nothing */
function glow(ab, parent, name, { d, color, a = 1, x = 0, y = 0, blend = BLEND.screen }) {
  const s = shape(ab, parent, name, { x, y, blendModeValue: blend });
  ab.add('Ellipse', { parent: s, width: d, height: d });
  gradient(ab, s, 'radial', [0, 0, d / 2, 0], [[alpha(color, a), 0], [alpha(color, a * .35), .45], [alpha(color, 0), 1]]);
  return s;
}
/** both scale axes keyed alike */
const scale = (object, keys) => [{ object, prop: 'scaleX', keys }, { object, prop: 'scaleY', keys }];

function board(base) {
  const m = META[base], neon = NEON[base];
  const s = Math.min(330 / m.w, 212 / m.h); // fit the car in the stage
  const W = m.w * s, H = m.h * s, CY = GROUND - H / 2; // car centre
  const ab = new Artboard('GlowUp', SIZE, SIZE);
  const tracks = [], idle = [];
  const T = (object, prop, keys) => tracks.push({ object, prop, keys });
  const I = (object, prop, keys) => idle.push({ object, prop, keys });

  /* ---- flash ---- */
  const flash = shape(ab, 0, 'flash', { x: SIZE / 2, y: SIZE / 2, opacity: 0, blendModeValue: BLEND.screen });
  ab.add('Rectangle', { parent: flash, width: SIZE, height: SIZE });
  gradient(ab, flash, 'radial', [0, CY - SIZE / 2, 300, CY - SIZE / 2], [[alpha(WHITE, 1), 0], [alpha(WHITE, .7), .35], [alpha(LIME, .35), .7], [alpha(LIME, 0), 1]]);
  T(flash, 'opacity', [[0, 0, 'hold'], [POP, 0, OUT], [POP + 4, 1, OUT], [POP + 34, 0]]);

  /* ---- glints: light catching the roof line ---- */
  m.glints.forEach(([gx, gy], i) => {
    const g = ab.add('Node', { parent: 0, name: 'glint' + i, x: SIZE / 2 + gx * s, y: CY + gy * s, scaleX: 0, scaleY: 0 });
    const star = shape(ab, g, 'star' + i, { blendModeValue: BLEND.screen });
    ab.add('Star', { parent: star, width: 46, height: 46, points: 4, innerRadius: .14 });
    solid(ab, star, WHITE);
    glow(ab, g, 'halo' + i, { d: 40, color: WHITE, a: .9 });
    const t0 = POP + 16 + i * 9;
    tracks.push(...scale(g, [[0, 0, 'hold'], [t0, 0, OUT_BACK], [t0 + 10, 1.15, IN], [t0 + 26, 0]]));
    T(g, 'rotation', [[0, 0, 'hold'], [t0, 0], [t0 + 26, Math.PI / 2]]);
    const k0 = 20 + i * 70; // twinkle once per idle loop, one after another
    idle.push(...scale(g, [[0, 0, 'hold'], [k0, 0, OUT_BACK], [k0 + 9, .9, IN], [k0 + 24, 0]]));
    I(g, 'rotation', [[0, 0, 'hold'], [k0, 0], [k0 + 24, Math.PI / 2]]);
  });

  /* ---- scanner beam ---- */
  const BH = H + 70, X0 = SIZE / 2 - W / 2 - 6, X1 = SIZE / 2 + W / 2 + 6;
  const beam = ab.add('Node', { parent: 0, name: 'beam', x: X0, y: CY, opacity: 0 });
  // sparks fly off behind the beam
  for (let i = 0; i < 14; i++) {
    const sp = shape(ab, beam, 'spark' + i, { opacity: 0, blendModeValue: BLEND.screen });
    const d = 2.5 + rnd() * 3; ab.add('Ellipse', { parent: sp, width: d, height: d });
    solid(ab, sp, [WHITE, LIME, '#FFE58A'][i % 3]);
    const keysX = [[0, 0, 'hold']], keysY = [[0, 0, 'hold']], keysO = [[0, 0, 'hold']];
    for (let t = SCAN0 + Math.round(rnd() * 14), life = 0; t < SCAN1 - 6; t += life + 2 + Math.round(rnd() * 5)) {
      const y0 = (rnd() - .5) * H * .9; life = 14 + Math.round(rnd() * 6);
      keysX.push([t, 0, OUT], [t + life, -(14 + rnd() * 34), 'hold']);
      keysY.push([t, y0, OUT], [t + life, y0 + (rnd() - .3) * 26, 'hold']);
      keysO.push([t, 1], [t + life, 0, 'hold']);
    }
    T(sp, 'x', keysX); T(sp, 'y', keysY); T(sp, 'opacity', keysO);
  }
  const core = shape(ab, beam, 'core'); ab.add('Rectangle', { parent: core, width: 3, height: BH, cornerRadiusTL: 1.5, linkCornerRadius: true }); solid(ab, core, WHITE);
  for (const end of [-1, 1]) glow(ab, beam, 'head' + end, { d: 26, color: WHITE, a: 1, y: end * BH / 2 });
  const band = shape(ab, beam, 'band', { blendModeValue: BLEND.screen }); ab.add('Rectangle', { parent: band, width: 64, height: BH });
  gradient(ab, band, 'linear', [-32, 0, 32, 0], [[alpha(LIME, 0), 0], [alpha(LIME, .95), .5], [alpha(LIME, 0), 1]]);
  // a soft oval of light around the beam (a circle squashed by its node, so the glow has no hard ends)
  const haze = ab.add('Node', { parent: beam, name: 'haze', scaleX: .55, scaleY: (BH + 60) / 200 });
  glow(ab, haze, 'haze-light', { d: 200, color: LIME, a: .38 });
  T(beam, 'opacity', [[0, 0, 'hold'], [BEAM, 0, OUT], [BEAM + 10, 1, 'hold'], [SCAN1, 1, OUT], [POP + 9, 0]]);
  T(beam, 'scaleY', [[0, 0, 'hold'], [BEAM, 0, OUT_BACK], [BEAM + 12, 1, 'hold'], [SCAN1, 1, OUT], [POP + 14, 1.6]]);
  T(beam, 'scaleX', [[0, 1, 'hold'], [SCAN1, 1, OUT], [POP + 14, 4]]);
  T(beam, 'x', [[0, X0, 'hold'], [SCAN0, X0, IN_OUT], [SCAN1, X1]]);

  /* ---- smoke (the cough) and dust (the landing) ---- */
  const rearX = SIZE / 2 - W / 2 + Math.min(26, W * .1), rearY = GROUND - Math.min(34, H * .22);
  for (let i = 0; i < 6; i++) {
    const p = shape(ab, 0, 'smoke' + i, { x: rearX, y: rearY, opacity: 0 });
    const d = 26 + rnd() * 14; ab.add('Ellipse', { parent: p, width: d, height: d });
    gradient(ab, p, 'radial', [0, 0, d / 2, 0], [['#B8BCC6E6', 0], ['#8A909C99', .6], ['#8A909C00', 1]]);
    const t0 = COUGH + 4 + i * 7, life = 44;
    T(p, 'opacity', [[0, 0, 'hold'], [t0, 0, OUT], [t0 + 6, .85], [t0 + life, 0]]);
    T(p, 'x', [[0, rearX, 'hold'], [t0, rearX, OUT], [t0 + life, rearX - 30 - rnd() * 30]]);
    T(p, 'y', [[0, rearY, 'hold'], [t0, rearY, OUT], [t0 + life, rearY - 40 - rnd() * 40]]);
    tracks.push(...scale(p, [[0, .3, 'hold'], [t0, .3, OUT], [t0 + life, 1.7 + rnd() * .5]]));
  }
  [-1, 1].forEach(side => [0, 1].forEach(j => {
    const x0 = SIZE / 2 + side * W * .34;
    const p = shape(ab, 0, `dust${side}${j}`, { x: x0, y: GROUND - 6, opacity: 0 });
    ab.add('Ellipse', { parent: p, width: 30, height: 18 });
    gradient(ab, p, 'radial', [0, 0, 15, 0], [['#D9CCB4CC', 0], ['#D9CCB400', 1]]);
    const t0 = LAND + j * 3, dir = side * (j ? .6 : 1);
    T(p, 'opacity', [[0, 0, 'hold'], [t0, .9, OUT], [t0 + 34, 0]]);
    T(p, 'x', [[0, x0, 'hold'], [t0, x0, OUT], [t0 + 34, x0 + dir * 46]]);
    T(p, 'y', [[0, GROUND - 6, 'hold'], [t0, GROUND - 6, OUT], [t0 + 34, GROUND - 16 - j * 8]]);
    tracks.push(...scale(p, [[0, .4, 'hold'], [t0, .4, OUT], [t0 + 34, 1.8]]));
  }));

  /* ---- the car: dream build revealed left of the beam, wreck right of it ---- */
  const car = ab.add('Node', { parent: 0, name: 'car', x: SIZE / 2, y: GROUND });
  const rig = ab.add('Node', { parent: car, name: 'rig' });
  const bodies = [];
  const layer = (state, clipSource) => {
    const group = ab.add('Node', { parent: rig, name: state });
    ab.add('ClippingShape', { parent: group, sourceId: clipSource, fillRule: 0, isVisible: true });
    ab.add('Image', { parent: group, name: state + '-wheels', assetId: state === 'dream' ? 2 : 0, y: -H / 2, scaleX: s, scaleY: s });
    const body = ab.add('Node', { parent: group, name: state + '-body' }); bodies.push(body);
    ab.add('Image', { parent: body, name: state + '-body-img', assetId: state === 'dream' ? 3 : 1, y: -H / 2, scaleX: s, scaleY: s });
  };
  // clip sources: two rectangles that meet where the beam is
  const dreamClip = shape(ab, 0, 'dreamClip', { x: 0, y: SIZE / 2 }); ab.add('Rectangle', { parent: dreamClip, width: 0, height: SIZE * 2, originX: 0, originY: .5 });
  const wreckClip = shape(ab, 0, 'wreckClip', { x: 0, y: SIZE / 2 }); ab.add('Rectangle', { parent: wreckClip, width: SIZE, height: SIZE * 2, originX: 0, originY: .5 });
  const dreamRect = dreamClip + 1;
  layer('dream', dreamClip); layer('wreck', wreckClip);
  T(dreamRect, 'width', [[0, 0, 'hold'], [SCAN0, X0, IN_OUT], [SCAN1, X1, 'hold'], [SCAN1 + 1, SIZE]]);
  T(wreckClip, 'x', [[0, 0, 'hold'], [SCAN0, X0, IN_OUT], [SCAN1, X1, 'hold'], [SCAN1 + 1, SIZE]]);

  // drop, squash, cough, jump at the pop, land lowered
  T(car, 'y', [[0, GROUND - 430, FALL], [LAND, GROUND, 'hold'], [POP, GROUND, OUT], [POP + 11, GROUND - 30, IN], [POP + 24, GROUND]]);
  T(rig, 'scaleX', [[0, .94, 'hold'], [LAND - 1, .94], [LAND + 3, 1.1, SPRING], [LAND + 34, 1, 'hold'], [POP, 1, OUT], [POP + 10, .95, IN], [POP + 24, 1.08, SPRING], [POP + 56, 1]]);
  T(rig, 'scaleY', [[0, 1.08, 'hold'], [LAND - 1, 1.08], [LAND + 3, .8, SPRING], [LAND + 34, 1, 'hold'], [POP, 1, OUT], [POP + 10, 1.08, IN], [POP + 24, .88, SPRING], [POP + 56, 1]]);
  const shakeRot = [[0, 0, 'hold'], [COUGH, 0]], shakeX = [[0, 0, 'hold'], [COUGH, 0]], shakeY = [[0, 0, 'hold'], [COUGH, 0]];
  for (let t = COUGH + 3, k = 0; t <= COUGH + 40; t += 3, k++) {
    const f = 1 - (t - COUGH) / 44;
    shakeRot.push([t, (k % 2 ? 1 : -1) * .035 * f]); shakeX.push([t, (k % 2 ? -1 : 1) * 2.5 * f]); shakeY.push([t, -(k % 2) * 3 * f]);
  }
  shakeRot.push([COUGH + 44, 0]); shakeX.push([COUGH + 44, 0]); shakeY.push([COUGH + 44, 0]);
  T(rig, 'rotation', shakeRot); T(rig, 'x', shakeX);
  for (const b of bodies) {
    T(b, 'y', [...shakeY, [SCAN0, 0, IN_OUT], [(SCAN0 + SCAN1) / 2, -4, IN_OUT], [SCAN1, 0]]);
    I(b, 'y', [[0, 0, IN_OUT], [60, -2.5, IN_OUT], [120, 0, IN_OUT], [180, -2.5, IN_OUT], [240, 0]]);
  }

  /* ---- confetti, bursting out from behind the car ---- */
  const burst = ab.add('Node', { parent: 0, name: 'burst', x: SIZE / 2, y: CY });
  for (let i = 0; i < 30; i++) {
    const a = -Math.PI / 2 + (rnd() - .5) * 2.8, v = 120 + rnd() * 120, w = 8 + rnd() * 5, h = 13 + rnd() * 8;
    const piece = shape(ab, burst, 'confetti' + i, { opacity: 0 });
    if (i % 4 === 3) ab.add('Ellipse', { parent: piece, width: w + 1, height: w + 1 });
    else ab.add('Rectangle', { parent: piece, width: w, height: h, cornerRadiusTL: 1.5, linkCornerRadius: true });
    solid(ab, piece, CONFETTI[i % CONFETTI.length]);
    const dx = Math.cos(a) * v, up = Math.sin(a) * v * .9, t0 = POP + 2 + Math.round(rnd() * 4), life = 62 + Math.round(rnd() * 22);
    T(piece, 'opacity', [[0, 0, 'hold'], [t0, 1, 'hold'], [t0 + life - 16, 1], [t0 + life, 0]]);
    T(piece, 'x', [[0, 0, 'hold'], [t0, 0, OUT], [t0 + life, dx * 1.25]]);
    T(piece, 'y', [[0, 0, 'hold'], [t0, 0, OUT], [t0 + 24, up, IN], [t0 + life, up + 150 + rnd() * 60]]);
    T(piece, 'rotation', [[0, 0, 'hold'], [t0, rnd() * TAU], [t0 + life, rnd() * TAU + (rnd() < .5 ? -1 : 1) * TAU * 1.5]]);
    T(piece, 'scaleX', [[0, 1, 'hold'], [t0, 1, IN_OUT], [t0 + 14, -.4, IN_OUT], [t0 + 28, 1, IN_OUT], [t0 + 42, -.4, IN_OUT], [t0 + 56, 1]]);
  }

  /* ---- rings, behind the car ---- */
  [[LIME, 0, 7], [WHITE, 7, 4]].forEach(([color, delay, sw], i) => {
    const r = shape(ab, 0, 'ring' + i, { x: SIZE / 2, y: CY, opacity: 0 });
    ab.add('Ellipse', { parent: r, width: 120, height: 120 });
    const st = ab.add('Stroke', { parent: r, thickness: sw }); ab.add('SolidColor', { parent: st, color });
    const t0 = POP + delay;
    T(r, 'opacity', [[0, 0, 'hold'], [t0, 1], [t0 + 40, 0]]);
    tracks.push(...scale(r, [[0, .2, 'hold'], [t0, .2, OUT], [t0 + 40, 3.6]]));
    T(st, 'thickness', [[0, sw, 'hold'], [t0, sw * 1.6, OUT], [t0 + 40, .5]]);
  });

  /* ---- underglow, in the build's neon colour ---- */
  const under = ab.add('Node', { parent: 0, name: 'underglow', x: SIZE / 2, y: GROUND - 2, scaleY: .14, opacity: 0 });
  glow(ab, under, 'underglow-light', { d: W * 1.05, color: neon, a: 1 });
  T(under, 'opacity', [[0, 0, 'hold'], [POP + 18, 0, OUT], [POP + 40, 1]]);
  T(under, 'scaleX', [[0, .2, 'hold'], [POP + 18, .2, OUT_BACK], [POP + 44, 1]]);
  I(under, 'opacity', [[0, 1, IN_OUT], [120, .6, IN_OUT], [240, 1]]);
  I(under, 'scaleX', [[0, 1, IN_OUT], [120, .92, IN_OUT], [240, 1]]);

  /* ---- shadow ---- */
  const shadow = ab.add('Node', { parent: 0, name: 'shadow', x: SIZE / 2, y: GROUND, scaleY: .12 });
  const sh = shape(ab, shadow, 'shadow-shape'); ab.add('Ellipse', { parent: sh, width: W * 1.08, height: W * 1.08 });
  gradient(ab, sh, 'radial', [0, 0, W * .54, 0], [['#000000B3', 0], ['#00000066', .6], ['#00000000', 1]]);
  T(shadow, 'scaleX', [[0, .35, FALL], [LAND, 1]]);
  T(shadow, 'opacity', [[0, .2, FALL], [LAND, 1]]);

  /* ---- light rays behind the car ---- */
  const rays = ab.add('Node', { parent: 0, name: 'rays', x: SIZE / 2, y: CY, opacity: 0 });
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, w = i % 2 ? .07 : .12, R = 320;
    const ray = shape(ab, rays, 'ray' + i, { blendModeValue: BLEND.screen });
    const path = ab.add('PointsPath', { parent: ray, isClosed: true });
    for (const [px, py] of [[0, 0], [Math.cos(a - w) * R, Math.sin(a - w) * R], [Math.cos(a + w) * R, Math.sin(a + w) * R]]) ab.add('StraightVertex', { parent: path, x: px, y: py });
    gradient(ab, ray, 'radial', [0, 0, R * .8, 0], [[alpha(WHITE, .34), 0], [alpha(neon, .2), .4], [alpha(neon, 0), 1]]);
  }
  T(rays, 'opacity', [[0, 0, 'hold'], [POP + 2, 0, OUT], [POP + 30, 1]]);
  tracks.push(...scale(rays, [[0, .4, 'hold'], [POP + 2, .4, OUT], [POP + 40, 1]]));
  T(rays, 'rotation', [[0, -.35, 'hold'], [POP + 2, -.35, OUT], [END, 0]]);
  I(rays, 'rotation', [[0, 0], [IDLE, TAU / 12]]); // 12 rays: a twelfth of a turn loops seamlessly

  /* ---- stage: spotlight cone, floor pool, floor, colour bloom, backdrop ---- */
  const cone = shape(ab, 0, 'spot', { opacity: 0, blendModeValue: BLEND.screen });
  const cp = ab.add('PointsPath', { parent: cone, isClosed: true });
  for (const [px, py] of [[SIZE / 2 - 24, -10], [SIZE / 2 + 24, -10], [SIZE / 2 + W * .62 + 20, GROUND + 6], [SIZE / 2 - W * .62 - 20, GROUND + 6]]) ab.add('StraightVertex', { parent: cp, x: px, y: py });
  gradient(ab, cone, 'linear', [0, 0, 0, GROUND], [[alpha(WHITE, .02), 0], [alpha(WHITE, .1), .75], [alpha(WHITE, .16), 1]]);
  const pool = ab.add('Node', { parent: 0, name: 'pool', x: SIZE / 2, y: GROUND + 4, scaleY: .18, opacity: 0 });
  glow(ab, pool, 'pool-light', { d: W * 1.5, color: WHITE, a: .32 });
  T(cone, 'opacity', [[0, 0], [4, 1, 'hold'], [7, .3, 'hold'], [10, 1]]); // the light flickers on
  T(pool, 'opacity', [[0, 0], [4, 1, 'hold'], [7, .3, 'hold'], [10, 1]]);

  const floor = shape(ab, 0, 'floor', { x: SIZE / 2, y: (GROUND + SIZE) / 2 + 1 });
  ab.add('Rectangle', { parent: floor, width: SIZE, height: SIZE - GROUND + 2 });
  gradient(ab, floor, 'linear', [0, -(SIZE - GROUND) / 2, 0, (SIZE - GROUND) / 2], [['#1E2236', 0], ['#0B0D15', 1]]);
  const bloom = shape(ab, 0, 'bloom', { x: SIZE / 2, y: CY, opacity: 0, blendModeValue: BLEND.screen });
  ab.add('Rectangle', { parent: bloom, width: SIZE * 2, height: SIZE * 2 });
  gradient(ab, bloom, 'radial', [0, 0, 260, 0], [[alpha(neon, .5), 0], [alpha(neon, .14), .55], [alpha(neon, 0), 1]]);
  T(bloom, 'opacity', [[0, 0, 'hold'], [POP, 0, OUT], [POP + 30, 1]]);
  I(bloom, 'opacity', [[0, 1, IN_OUT], [120, .75, IN_OUT], [240, 1]]);
  const back = shape(ab, 0, 'backdrop', { x: SIZE / 2, y: SIZE / 2 });
  ab.add('Rectangle', { parent: back, width: SIZE, height: SIZE });
  gradient(ab, back, 'radial', [0, CY - SIZE / 2 - 10, 300, CY - SIZE / 2 - 10], [['#2B3050', 0], ['#151827', .6], ['#0A0C14', 1]]);

  const show = ab.animation('show', { duration: END, tracks });
  const loop = ab.animation('idle', { duration: IDLE, loop: 'loop', tracks: idle });
  ab.stateMachine('GlowUp', {
    inputs: [{ name: 'play', type: 'trigger' }],
    layers: [{ name: 'Main', states: [{ name: 'show', animation: show }, { name: 'idle', animation: loop }],
      transitions: [{ from: 'entry', to: 'show' }, { from: 'show', to: 'idle', exitTime: Math.round(END / 60 * 1000) },
        { from: 'any', to: 'show', when: [{ input: 'play' }] }] }],
  });
  return ab;
}

const OUT_DIR = new URL('../../dist/assets/rive/', import.meta.url);
mkdirSync(OUT_DIR, { recursive: true });
for (const base of Object.keys(NEON)) {
  seed = 7;
  const m = META[base];
  const asset = k => ({ name: `${base}-${k}`, width: m.w, height: m.h, bytes: readFileSync(new URL(`${base}-${k}.webp`, ART)) });
  // asset order is what the Images refer to: 0 wreck wheels, 1 wreck body, 2 dream wheels, 3 dream body
  const bytes = writeRiv([board(base)], { fileId: 2, assets: ['wreck-wheels', 'wreck-body', 'dream-wheels', 'dream-body'].map(asset) });
  writeFileSync(new URL(`glowup-${base}.riv`, OUT_DIR), bytes);
  console.log(`glowup-${base}.riv`, bytes.length, 'bytes');
}
