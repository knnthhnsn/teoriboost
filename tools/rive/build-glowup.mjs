// The vehicle shows, one .riv per vehicle (dist/assets/rive/glowup-<base>.riv), three artboards sharing its images.
// The vehicle art is the app's own (rendered by glowup-render.mjs, packed by glowup-pack.py into glowup-art/).
//
// GlowUp ("Sådan kan den blive" in Min bil), on a dark stage:
//   0.0s  the stage light flickers on, the wreck drops in and lands with a squash, dust and a camera shake
//   1.2s  it coughs: the body shakes and smoke puffs out at the back
//   2.0s  a lime scanner beam sweeps across while the camera pushes in; behind it the wreck becomes the repaint
//   3.4s  the beam flares: flash, rings, confetti, light rays, the car jumps and lands lowered with tyre smoke
//   4.0s  the tuning parts slam on one by one, each with a spark, the plate flips in
//   5.6s  the underglow flickers on, light glints on the roof line; then idle: rays turn, the suspension bobs
// Hero (the start page): the same show without the stage, at the app's own vehicle position over the garage
//   scene; the wreck drives in instead of dropping and the build drives off at the end, so the page can swap
//   to the next vehicle.
// Pass (a passed practice test): the dream build races across the finish line at night and brakes; fireworks,
//   confetti cannons and a waving chequered flag.
//
// State machines: "GlowUp" and "Pass" play on load and go to an idle loop; trigger "play" runs them again (also
// halfway through). "Hero" plays once.
// Remember: Rive draws the first drawable on top, so the top layer is added first.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Artboard, writeRiv, BLEND } from './riv.mjs';
import { OUT_BACK, OUT, IN_OUT, IN, FALL, SPRING, TAU, LIME, WHITE, CONFETTI, reseed, rnd, shape, solid, gradient, alpha, glow, rect, scale, shake, merge, repeat, replayable } from './helpers.mjs';

const ART = new URL('./glowup-art/', import.meta.url);
const META = JSON.parse(readFileSync(new URL('meta.json', ART)));
const NEON = { scooter: '#B44CFF', smallcar: '#FF2D9B', bigcar: '#14E0F0', racecar: '#39FF14' }; // DREAMS[base].style.neon in start.js
const FIREWORK = ['#FFD400', '#14E0F0', '#FF5FA2', '#D5FF62', '#B44CFF'];

// image assets in every file: 0 wreck wheels, 1 wreck body, 2 dream wheels, 3 dream body, 4.. the parts in meta order
const ASSET = { wreckWheels: 0, wreckBody: 1, dreamWheels: 2, dreamBody: 3, part: i => 4 + i };

/**
 * The vehicle: car (position) > rig (squash, shake) > wheels and a body node (suspension) holding the body and parts.
 * dream: also the dream build; wreck: also the wreck. Parts get a node each so they can fly on.
 */
function vehicle(ab, parent, m, { s, x, y, wreck = true, dream = true, clips = {} }) {
  const H = m.h * s;
  const car = ab.add('Node', { parent, name: 'car', x, y });
  const rig = ab.add('Node', { parent: car, name: 'rig' });
  const bodies = [], parts = [];
  const layer = (state, clip) => {
    const group = ab.add('Node', { parent: rig, name: state });
    if (clip != null) ab.add('ClippingShape', { parent: group, sourceId: clip, fillRule: 0, isVisible: true });
    ab.add('Image', { parent: group, name: state + '-wheels', assetId: state === 'dream' ? ASSET.dreamWheels : ASSET.wreckWheels, y: -H / 2, scaleX: s, scaleY: s });
    const body = ab.add('Node', { parent: group, name: state + '-body' }); bodies.push(body);
    if (state === 'dream') {
      // later parts stack on top, so they are added first
      [...m.parts].map((p, i) => [p, i]).reverse().forEach(([p, i]) => {
        const node = ab.add('Node', { parent: body, name: 'part-' + p.id, x: p.x * s, y: -H / 2 + p.y * s });
        ab.add('Image', { parent: node, name: p.id, assetId: ASSET.part(i), scaleX: s, scaleY: s });
        parts[i] = { node, x: p.x * s, y: -H / 2 + p.y * s, id: p.id };
      });
    }
    ab.add('Image', { parent: body, name: state + '-body-img', assetId: state === 'dream' ? ASSET.dreamBody : ASSET.wreckBody, y: -H / 2, scaleX: s, scaleY: s });
  };
  if (dream) layer('dream', clips.dream);
  if (wreck) layer('wreck', clips.wreck);
  return { car, rig, bodies, parts, H, W: m.w * s };
}

/* ======================= GlowUp and Hero ======================= */
function showBoard(base, kind) {
  const hero = kind === 'hero', m = META[base], neon = NEON[base], SIZE = 400;
  // GlowUp fits the car on its stage; Hero puts it exactly where the app's vehicle stage draws it (768px frame in 400)
  let s, cx, ground;
  if (hero) { const k = SIZE / 768; s = (m.box[2] - m.box[0]) * k / m.w; cx = (m.box[0] + m.box[2]) / 2 * k; ground = m.box[3] * k; }
  else { s = Math.min(330 / m.w, 212 / m.h); cx = SIZE / 2; ground = 304; }
  const W = m.w * s, H = m.h * s, CY = ground - H / 2;
  const n = m.parts.length;
  // the timeline, in frames at 60 fps
  const LAND = 28, COUGH = 72, BEAM = 116, SCAN0 = 126, SCAN1 = 204, POP = 206, JL = POP + 24, PARTS0 = JL + 10, GAP = 17;
  const NEONT = PARTS0 + n * GAP + 12, END = NEONT + 70, EXIT = END - 6, HEND = EXIT + 34;
  const ab = new Artboard(hero ? 'Hero' : 'GlowUp', SIZE, SIZE);
  const tracks = [], idle = [];
  const T = (object, prop, keys) => tracks.push({ object, prop, keys });
  const I = (object, prop, keys) => idle.push({ object, prop, keys });
  const fadeOut = hero ? [[EXIT, 1, IN], [EXIT + 12, 0]] : []; // Hero: things that do not leave with the car fade

  /* ---- flash, outside the camera ---- */
  const flash = shape(ab, 0, 'flash', { x: SIZE / 2, y: SIZE / 2, opacity: 0, blendModeValue: BLEND.screen });
  ab.add('Rectangle', { parent: flash, width: SIZE, height: SIZE });
  gradient(ab, flash, 'radial', [cx - SIZE / 2, CY - SIZE / 2, cx - SIZE / 2 + (hero ? 220 : 300), CY - SIZE / 2],
    [[alpha(WHITE, 1), 0], [alpha(WHITE, .7), .35], [alpha(LIME, .35), .7], [alpha(LIME, 0), 1]]);
  T(flash, 'opacity', [[0, 0, 'hold'], [POP, 0, OUT], [POP + 4, hero ? .8 : 1, OUT], [POP + 34, 0]]);

  /* ---- camera: everything else hangs under it, pivoting on the car ---- */
  const cam = ab.add('Node', { parent: 0, name: 'camera', x: cx, y: CY });
  const world = ab.add('Node', { parent: cam, name: 'world', x: -cx, y: -CY });
  const camZoom = [[0, 1, 'hold'], [SCAN0, 1, IN_OUT], [SCAN1, 1.07, OUT], [POP + 5, 1.14, SPRING], [POP + 50, 1]];
  tracks.push(...scale(cam, camZoom));
  const camX = merge(shake(LAND, 18, 5), shake(POP, 22, 6, 2), shake(JL, 12, 3), ...m.parts.map((_, i) => shake(PARTS0 + i * GAP + 12, 8, 2, 2)));
  const camY = merge(shake(LAND, 18, 6, 3), shake(POP, 22, 5, 2), shake(JL, 12, 4), ...m.parts.map((_, i) => shake(PARTS0 + i * GAP + 12, 8, 2.5, 2)));
  T(cam, 'x', merge([[0, cx, 'hold']], camX.map(([t, v]) => [t, cx + v])));
  T(cam, 'y', merge([[0, CY, 'hold']], camY.map(([t, v]) => [t, CY + v])));

  /* ---- glints: light catching the roof line ---- */
  m.glints.forEach(([gx, gy], i) => {
    const g = ab.add('Node', { parent: world, name: 'glint' + i, x: cx + gx * s, y: CY + gy * s, scaleX: 0, scaleY: 0 });
    const star = shape(ab, g, 'star' + i, { blendModeValue: BLEND.screen });
    ab.add('Star', { parent: star, width: 46, height: 46, points: 4, innerRadius: .14 });
    solid(ab, star, WHITE);
    glow(ab, g, 'halo' + i, { d: 40, color: WHITE, a: .9 });
    const t0 = NEONT + 8 + i * 9;
    tracks.push(...scale(g, [[0, 0, 'hold'], [t0, 0, OUT_BACK], [t0 + 10, 1.2, IN], [t0 + 26, 0]]));
    T(g, 'rotation', [[0, 0, 'hold'], [t0, 0], [t0 + 26, Math.PI / 2]]);
    const k0 = 20 + i * 70; // twinkle once per idle loop, one after another
    idle.push(...scale(g, [[0, 0, 'hold'], [k0, 0, OUT_BACK], [k0 + 9, .9, IN], [k0 + 24, 0]]));
    I(g, 'rotation', [[0, 0, 'hold'], [k0, 0], [k0 + 24, Math.PI / 2]]);
  });

  /* ---- part impacts: a white pop and a few sparks where each part lands ---- */
  m.parts.forEach((p, i) => {
    const t0 = PARTS0 + i * GAP + 12, px = cx + p.x * s, py = CY + p.y * s;
    const hit = ab.add('Node', { parent: world, name: 'hit' + i, x: px, y: py, opacity: 0 });
    glow(ab, hit, 'hit-glow' + i, { d: 70, color: WHITE, a: .95 });
    T(hit, 'opacity', [[0, 0, 'hold'], [t0, 1, OUT], [t0 + 16, 0]]);
    tracks.push(...scale(hit, [[0, .3, 'hold'], [t0, .3, OUT], [t0 + 16, 1.5]]));
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * TAU + rnd() * .5, d = 26 + rnd() * 26;
      const sp = shape(ab, world, `hit${i}-spark${k}`, { x: px, y: py, opacity: 0, blendModeValue: BLEND.screen });
      ab.add('Ellipse', { parent: sp, width: 4, height: 4 }); solid(ab, sp, [LIME, WHITE, '#FFE58A'][k % 3]);
      T(sp, 'opacity', [[0, 0, 'hold'], [t0, 1, 'hold'], [t0 + 10, 1], [t0 + 20, 0]]);
      T(sp, 'x', [[0, px, 'hold'], [t0, px, OUT], [t0 + 20, px + Math.cos(a) * d]]);
      T(sp, 'y', [[0, py, 'hold'], [t0, py, OUT], [t0 + 20, py + Math.sin(a) * d * .8 + 8]]);
    }
  });

  /* ---- scanner beam ---- */
  const BH = H + 70, X0 = cx - W / 2 - 6, X1 = cx + W / 2 + 6;
  const beam = ab.add('Node', { parent: world, name: 'beam', x: X0, y: CY, opacity: 0 });
  for (let i = 0; i < 16; i++) { // sparks fly off behind the beam
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
  rect(ab, beam, 'core', { w: 3, h: BH, r: 1.5, color: WHITE });
  for (const end of [-1, 1]) glow(ab, beam, 'head' + end, { d: 26, color: WHITE, a: 1, y: end * BH / 2 });
  const band = rect(ab, beam, 'band', { w: 64, h: BH, props: { blendModeValue: BLEND.screen } });
  gradient(ab, band, 'linear', [-32, 0, 32, 0], [[alpha(LIME, 0), 0], [alpha(LIME, .95), .5], [alpha(LIME, 0), 1]]);
  // a soft oval of light around the beam (a circle squashed by its node, so the glow has no hard ends)
  const haze = ab.add('Node', { parent: beam, name: 'haze', scaleX: .55, scaleY: (BH + 60) / 200 });
  glow(ab, haze, 'haze-light', { d: 200, color: LIME, a: .38 });
  T(beam, 'opacity', [[0, 0, 'hold'], [BEAM, 0, OUT], [BEAM + 10, 1, 'hold'], [SCAN1, 1, OUT], [POP + 9, 0]]);
  T(beam, 'scaleY', [[0, 0, 'hold'], [BEAM, 0, OUT_BACK], [BEAM + 12, 1, 'hold'], [SCAN1, 1, OUT], [POP + 14, 1.6]]);
  T(beam, 'scaleX', [[0, 1, 'hold'], [SCAN1, 1, OUT], [POP + 14, 4]]);
  T(beam, 'x', [[0, X0, 'hold'], [SCAN0, X0, IN_OUT], [SCAN1, X1]]);

  /* ---- smoke (the cough), dust (landing) and tyre smoke (the lowered landing) ---- */
  const rearX = cx - W / 2 + Math.min(26, W * .1), rearY = ground - Math.min(34, H * .22);
  for (let i = 0; i < 6; i++) {
    const p = shape(ab, world, 'smoke' + i, { x: rearX, y: rearY, opacity: 0 });
    const d = 26 + rnd() * 14; ab.add('Ellipse', { parent: p, width: d, height: d });
    gradient(ab, p, 'radial', [0, 0, d / 2, 0], [['#B8BCC6E6', 0], ['#8A909C99', .6], ['#8A909C00', 1]]);
    const t0 = COUGH + 4 + i * 7, life = 44;
    T(p, 'opacity', [[0, 0, 'hold'], [t0, 0, OUT], [t0 + 6, .85], [t0 + life, 0]]);
    T(p, 'x', [[0, rearX, 'hold'], [t0, rearX, OUT], [t0 + life, rearX - 30 - rnd() * 30]]);
    T(p, 'y', [[0, rearY, 'hold'], [t0, rearY, OUT], [t0 + life, rearY - 40 - rnd() * 40]]);
    tracks.push(...scale(p, [[0, .3, 'hold'], [t0, .3, OUT], [t0 + life, 1.7 + rnd() * .5]]));
  }
  [-1, 1].forEach(side => [0, 1, 2].forEach(j => {
    const x0 = cx + side * W * .34, y0 = ground - 6;
    const p = shape(ab, world, `dust${side}${j}`, { x: x0, y: y0, opacity: 0 });
    ab.add('Ellipse', { parent: p, width: 34, height: 22 });
    gradient(ab, p, 'radial', [0, 0, 17, 0], [['#E3DACBD9', 0], ['#E3DACB00', 1]]);
    const dir = side * (1 - j * .3);
    const burst = (t0, big) => [[t0, x0, OUT], [t0 + 34, x0 + dir * (big ? 70 : 46)]];
    T(p, 'opacity', [[0, 0, 'hold'], [LAND + j * 3, .9, OUT], [LAND + j * 3 + 34, 0, 'hold'], [JL + j * 3, .95, OUT], [JL + j * 3 + 40, 0]]);
    T(p, 'x', [[0, x0, 'hold'], ...burst(LAND + j * 3, false), [JL + j * 3 - 1, x0, 'hold'], ...burst(JL + j * 3, true)]);
    T(p, 'y', [[0, y0, 'hold'], [LAND + j * 3, y0, OUT], [LAND + j * 3 + 34, y0 - 12 - j * 8, 'hold'], [JL + j * 3, y0, OUT], [JL + j * 3 + 40, y0 - 18 - j * 10]]);
    tracks.push(...scale(p, [[0, .4, 'hold'], [LAND + j * 3, .4, OUT], [LAND + j * 3 + 34, 1.8, 'hold'], [JL + j * 3, .5, OUT], [JL + j * 3 + 40, 2.4]]));
  }));

  /* ---- the car: the repaint revealed left of the beam, the wreck right of it ---- */
  const dreamClip = shape(ab, world, 'dreamClip', { x: 0, y: SIZE / 2 }); ab.add('Rectangle', { parent: dreamClip, width: 0, height: SIZE * 3, originX: 0, originY: .5 });
  const wreckClip = shape(ab, world, 'wreckClip', { x: 0, y: SIZE / 2 }); ab.add('Rectangle', { parent: wreckClip, width: SIZE * 3, height: SIZE * 3, originX: 0, originY: .5 });
  const v = vehicle(ab, world, m, { s, x: cx, y: ground, clips: { dream: dreamClip, wreck: wreckClip } });
  T(dreamClip + 1, 'width', [[0, 0, 'hold'], [SCAN0, X0, IN_OUT], [SCAN1, X1, 'hold'], [SCAN1 + 1, SIZE * 3]]);
  T(wreckClip, 'x', [[0, -SIZE, 'hold'], [SCAN0 - 1, -SIZE, 'hold'], [SCAN0, X0, IN_OUT], [SCAN1, X1, 'hold'], [SCAN1 + 1, SIZE * 3]]);

  // arrival: GlowUp drops it in, Hero drives it in from the left and it nods as it brakes
  if (hero) {
    T(v.car, 'x', [[0, cx - 430, OUT], [LAND, cx, 'hold'], ...(hero ? [[EXIT, cx, IN], [HEND, cx + 470]] : [])]);
    T(v.car, 'y', [[0, ground, 'hold'], [POP, ground, OUT], [POP + 11, ground - 26, IN], [POP + 24, ground]]);
  } else T(v.car, 'y', [[0, ground - 430, FALL], [LAND, ground, 'hold'], [POP, ground, OUT], [POP + 11, ground - 30, IN], [POP + 24, ground]]);
  const squashX = hero ? [[0, 1, 'hold'], [LAND, 1, SPRING], [LAND + 30, 1, 'hold']] : [[0, .94, 'hold'], [LAND - 1, .94], [LAND + 3, 1.1, SPRING], [LAND + 34, 1, 'hold']];
  const squashY = hero ? [[0, 1, 'hold'], [LAND, 1, SPRING], [LAND + 30, 1, 'hold']] : [[0, 1.08, 'hold'], [LAND - 1, 1.08], [LAND + 3, .8, SPRING], [LAND + 34, 1, 'hold']];
  T(v.rig, 'scaleX', [...squashX, [POP, 1, OUT], [POP + 10, .95, IN], [POP + 24, 1.08, SPRING], [POP + 56, 1]]);
  T(v.rig, 'scaleY', [...squashY, [POP, 1, OUT], [POP + 10, 1.08, IN], [POP + 24, .86, SPRING], [POP + 56, 1]]);
  const lean = hero ? [[0, .05, 'hold'], [LAND - 4, .05, IN], [LAND + 2, -.06, SPRING], [LAND + 36, 0]] : [[0, 0, 'hold']];
  const exitLean = hero ? [[EXIT, 0, OUT], [EXIT + 10, .07]] : [];
  T(v.rig, 'rotation', merge(lean, shake(COUGH, 44, .035), exitLean));
  T(v.rig, 'x', merge([[0, 0, 'hold']], shake(COUGH, 44, 2.5)));
  const bodyShake = shake(COUGH, 44, 3);
  for (const b of v.bodies) {
    T(b, 'y', merge([[0, 0, 'hold']], bodyShake, [[SCAN0, 0, IN_OUT], [(SCAN0 + SCAN1) / 2, -4, IN_OUT], [SCAN1, 0]]));
    I(b, 'y', [[0, 0, IN_OUT], [60, -2.5, IN_OUT], [120, 0, IN_OUT], [180, -2.5, IN_OUT], [240, 0]]);
  }
  // the parts: hidden until their turn, then they slam on (stripes slide in, the plate flips)
  v.parts.forEach((p, i) => {
    const t0 = PARTS0 + i * GAP, hit = t0 + 12;
    const big = m.parts[i].w * m.parts[i].h > m.w * m.h * .2 && !p.id.startsWith('stripe') && !p.id.startsWith('plate');
    if (!big) T(p.node, 'opacity', [[0, 0, 'hold'], [t0, 1, 'hold']]);
    if (p.id.startsWith('stripe')) {
      T(p.node, 'x', [[0, p.x - 300, 'hold'], [t0, p.x - 300, OUT], [hit, p.x]]);
      T(p.node, 'scaleX', [[0, 1.4, 'hold'], [t0, 1.4, OUT], [hit + 6, 1]]);
    } else if (p.id.startsWith('plate')) {
      T(p.node, 'scaleX', [[0, 0, 'hold'], [t0, 0, OUT_BACK], [hit + 4, 1]]);
      T(p.node, 'rotation', [[0, -.6, 'hold'], [t0, -.6, OUT_BACK], [hit + 4, 0]]);
    } else if (big) {
      // a big part (a body kit) would look like flying debris, so it settles into place instead
      T(p.node, 'opacity', [[0, 0, 'hold'], [t0, 0, OUT], [hit, 1]]);
      tracks.push(...scale(p.node, [[0, 1.25, 'hold'], [t0, 1.25, OUT_BACK], [hit + 6, 1]]));
    } else {
      const side = i % 2 ? 1 : -1;
      T(p.node, 'y', [[0, p.y - 240, 'hold'], [t0, p.y - 240, IN], [hit, p.y]]);
      T(p.node, 'rotation', [[0, side * .7, 'hold'], [t0, side * .7, IN], [hit, 0]]);
      tracks.push(...scale(p.node, [[0, 1.5, 'hold'], [t0, 1.5, IN], [hit, .85, OUT_BACK], [hit + 12, 1]]));
    }
  });

  /* ---- confetti, bursting out from behind the car ---- */
  const burst = ab.add('Node', { parent: world, name: 'burst', x: cx, y: CY });
  for (let i = 0; i < 30; i++) {
    const a = -Math.PI / 2 + (rnd() - .5) * 2.8, vel = 120 + rnd() * 120, w = 8 + rnd() * 5, h = 13 + rnd() * 8;
    const piece = shape(ab, burst, 'confetti' + i, { opacity: 0 });
    if (i % 4 === 3) ab.add('Ellipse', { parent: piece, width: w + 1, height: w + 1 });
    else ab.add('Rectangle', { parent: piece, width: w, height: h, cornerRadiusTL: 1.5, linkCornerRadius: true });
    solid(ab, piece, CONFETTI[i % CONFETTI.length]);
    const dx = Math.cos(a) * vel, up = Math.sin(a) * vel * .9, t0 = POP + 2 + Math.round(rnd() * 4), life = 62 + Math.round(rnd() * 22);
    T(piece, 'opacity', [[0, 0, 'hold'], [t0, 1, 'hold'], [t0 + life - 16, 1], [t0 + life, 0]]);
    T(piece, 'x', [[0, 0, 'hold'], [t0, 0, OUT], [t0 + life, dx * 1.25]]);
    T(piece, 'y', [[0, 0, 'hold'], [t0, 0, OUT], [t0 + 24, up, IN], [t0 + life, up + 150 + rnd() * 60]]);
    T(piece, 'rotation', [[0, 0, 'hold'], [t0, rnd() * TAU], [t0 + life, rnd() * TAU + (rnd() < .5 ? -1 : 1) * TAU * 1.5]]);
    T(piece, 'scaleX', [[0, 1, 'hold'], [t0, 1, IN_OUT], [t0 + 14, -.4, IN_OUT], [t0 + 28, 1, IN_OUT], [t0 + 42, -.4, IN_OUT], [t0 + 56, 1]]);
  }

  /* ---- rings, behind the car ---- */
  [[LIME, 0, 7], [WHITE, 7, 4]].forEach(([color, delay, sw], i) => {
    const r = shape(ab, world, 'ring' + i, { x: cx, y: CY, opacity: 0 });
    ab.add('Ellipse', { parent: r, width: 120, height: 120 });
    const st = ab.add('Stroke', { parent: r, thickness: sw }); ab.add('SolidColor', { parent: st, color });
    const t0 = POP + delay;
    T(r, 'opacity', [[0, 0, 'hold'], [t0, 1], [t0 + 40, 0]]);
    tracks.push(...scale(r, [[0, .2, 'hold'], [t0, .2, OUT], [t0 + 40, 3.6]]));
    T(st, 'thickness', [[0, sw, 'hold'], [t0, sw * 1.6, OUT], [t0 + 40, .5]]);
  });

  /* ---- underglow, in the build's neon colour: it flickers on after the last part ---- */
  const under = ab.add('Node', { parent: world, name: 'underglow', x: cx, y: ground - 2, scaleY: .14, opacity: 0 });
  glow(ab, under, 'underglow-light', { d: W * 1.05, color: neon, a: 1 });
  T(under, 'opacity', [[0, 0, 'hold'], [NEONT, 1, 'hold'], [NEONT + 4, .15, 'hold'], [NEONT + 8, 1, 'hold'], [NEONT + 11, .3, 'hold'], [NEONT + 14, 1, 'hold'], ...fadeOut]);
  T(under, 'scaleX', [[0, .6, 'hold'], [NEONT, .6, OUT_BACK], [NEONT + 26, 1]]);
  I(under, 'opacity', [[0, 1, IN_OUT], [120, .6, IN_OUT], [240, 1]]);
  I(under, 'scaleX', [[0, 1, IN_OUT], [120, .92, IN_OUT], [240, 1]]);

  /* ---- shadow ---- */
  const shadow = ab.add('Node', { parent: world, name: 'shadow', x: cx, y: ground, scaleY: .12 });
  const sh = shape(ab, shadow, 'shadow-shape'); ab.add('Ellipse', { parent: sh, width: W * 1.08, height: W * 1.08 });
  gradient(ab, sh, 'radial', [0, 0, W * .54, 0], [[hero ? '#00000059' : '#000000B3', 0], [hero ? '#00000026' : '#00000066', .6], ['#00000000', 1]]);
  if (hero) { T(shadow, 'x', [[0, cx - 430, OUT], [LAND, cx, 'hold'], [EXIT, cx, IN], [HEND, cx + 470]]); }
  else { T(shadow, 'scaleX', [[0, .35, FALL], [LAND, 1]]); T(shadow, 'opacity', [[0, .2, FALL], [LAND, 1]]); }

  /* ---- light rays behind the car ---- */
  const rays = ab.add('Node', { parent: world, name: 'rays', x: cx, y: CY, opacity: 0 });
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, w = i % 2 ? .07 : .12, R = 320;
    const ray = shape(ab, rays, 'ray' + i, { blendModeValue: BLEND.screen });
    const path = ab.add('PointsPath', { parent: ray, isClosed: true });
    for (const [px, py] of [[0, 0], [Math.cos(a - w) * R, Math.sin(a - w) * R], [Math.cos(a + w) * R, Math.sin(a + w) * R]]) ab.add('StraightVertex', { parent: path, x: px, y: py });
    gradient(ab, ray, 'radial', [0, 0, R * .8, 0], [[alpha(WHITE, hero ? .45 : .34), 0], [alpha(hero ? WHITE : neon, .2), .4], [alpha(hero ? WHITE : neon, 0), 1]]);
  }
  T(rays, 'opacity', [[0, 0, 'hold'], [POP + 2, 0, OUT], [POP + 30, 1], ...fadeOut]);
  tracks.push(...scale(rays, [[0, .4, 'hold'], [POP + 2, .4, OUT], [POP + 40, 1]]));
  T(rays, 'rotation', [[0, -.35, 'hold'], [POP + 2, -.35], [END, 0]]);
  I(rays, 'rotation', [[0, 0], [240, TAU / 12]]); // 12 rays: a twelfth of a turn loops seamlessly

  if (!hero) {
    /* ---- stage: spotlight cone, floor pool, floor, colour bloom, backdrop (oversized for the camera) ---- */
    const cone = shape(ab, world, 'spot', { opacity: 0, blendModeValue: BLEND.screen });
    const cp = ab.add('PointsPath', { parent: cone, isClosed: true });
    for (const [px, py] of [[cx - 24, -40], [cx + 24, -40], [cx + W * .62 + 20, ground + 6], [cx - W * .62 - 20, ground + 6]]) ab.add('StraightVertex', { parent: cp, x: px, y: py });
    gradient(ab, cone, 'linear', [0, 0, 0, ground], [[alpha(WHITE, .02), 0], [alpha(WHITE, .1), .75], [alpha(WHITE, .16), 1]]);
    const pool = ab.add('Node', { parent: world, name: 'pool', x: cx, y: ground + 4, scaleY: .18, opacity: 0 });
    glow(ab, pool, 'pool-light', { d: W * 1.5, color: WHITE, a: .32 });
    T(cone, 'opacity', [[0, 0], [4, 1, 'hold'], [7, .3, 'hold'], [10, 1]]); // the light flickers on
    T(pool, 'opacity', [[0, 0], [4, 1, 'hold'], [7, .3, 'hold'], [10, 1]]);
    const floor = rect(ab, world, 'floor', { w: SIZE * 1.6, h: SIZE - ground + 80, x: cx, y: ground - 1, oy: 0 });
    gradient(ab, floor, 'linear', [0, 0, 0, SIZE - ground], [['#1E2236', 0], ['#0B0D15', 1]]);
    const bloom = rect(ab, world, 'bloom', { w: SIZE * 2, h: SIZE * 2, x: cx, y: CY, props: { opacity: 0, blendModeValue: BLEND.screen } });
    gradient(ab, bloom, 'radial', [0, 0, 260, 0], [[alpha(neon, .5), 0], [alpha(neon, .14), .55], [alpha(neon, 0), 1]]);
    T(bloom, 'opacity', [[0, 0, 'hold'], [POP, 0, OUT], [POP + 30, .55, 'hold'], [NEONT + 14, .55, OUT], [NEONT + 40, 1]]);
    I(bloom, 'opacity', [[0, 1, IN_OUT], [120, .75, IN_OUT], [240, 1]]);
    const back = rect(ab, world, 'backdrop', { w: SIZE * 1.6, h: SIZE * 1.6, x: cx, y: SIZE / 2 });
    gradient(ab, back, 'radial', [0, CY - SIZE / 2 - 10, 300, CY - SIZE / 2 - 10], [['#2B3050', 0], ['#151827', .6], ['#0A0C14', 1]]);
  }

  const show = ab.animation('show', { duration: hero ? HEND : END, tracks });
  if (hero) {
    ab.stateMachine('Hero', { inputs: [{ name: 'play', type: 'trigger' }],
      layers: [{ name: 'Main', states: [{ name: 'show', animation: show }, { name: 'again', animation: show }],
        transitions: [{ from: 'entry', to: 'show' }, { from: 'show', to: 'again', when: [{ input: 'play' }] }, { from: 'again', to: 'show', when: [{ input: 'play' }] }] }] });
  } else {
    const loop = ab.animation('idle', { duration: 240, loop: 'loop', tracks: idle });
    replayable(ab, 'GlowUp', show, loop, END);
  }
  return { ab, ms: Math.round((hero ? HEND : END) / 60 * 1000) };
}

/* ======================= Pass ======================= */
function passBoard(base) {
  const m = META[base], neon = NEON[base], SW = 400, SH = 300, GROUND = 262, LINE = 74;
  const s = Math.min(230 / m.w, 132 / m.h), W = m.w * s, H = m.h * s, STOP = 236, CY = GROUND - H / 2;
  const ARRIVE = 40, END = 180; // END: three flag cycles
  const ab = new Artboard('Pass', SW, SH);
  const tracks = [], idle = [], wave = [];
  const T = (object, prop, keys) => tracks.push({ object, prop, keys });
  const I = (object, prop, keys) => idle.push({ object, prop, keys });

  /* ---- confetti cannons from both bottom corners ---- */
  [-1, 1].forEach(side => {
    const gun = ab.add('Node', { parent: 0, name: 'cannon' + side, x: side < 0 ? 0 : SW, y: SH });
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI / 2 - side * (.2 + rnd() * .5), vel = 190 + rnd() * 140, w = 6 + rnd() * 4, h = 10 + rnd() * 7;
      const piece = shape(ab, gun, `c${side}-${i}`, { opacity: 0 });
      ab.add('Rectangle', { parent: piece, width: w, height: h, cornerRadiusTL: 1.5, linkCornerRadius: true });
      solid(ab, piece, CONFETTI[(i + (side > 0 ? 3 : 0)) % CONFETTI.length]);
      const t0 = ARRIVE + 2 + Math.round(rnd() * 6), life = 70 + Math.round(rnd() * 24), dx = Math.cos(a) * vel, up = Math.sin(a) * vel;
      T(piece, 'opacity', [[0, 0, 'hold'], [t0, 1, 'hold'], [t0 + life - 14, 1], [t0 + life, 0]]);
      T(piece, 'x', [[0, 0, 'hold'], [t0, 0, OUT], [t0 + life, dx * 1.2]]);
      T(piece, 'y', [[0, 0, 'hold'], [t0, 0, OUT], [t0 + 26, up, IN], [t0 + life, up + 120 + rnd() * 60]]);
      T(piece, 'rotation', [[0, 0, 'hold'], [t0, rnd() * TAU], [t0 + life, rnd() * TAU + side * TAU * 1.5]]);
      T(piece, 'scaleX', [[0, 1, 'hold'], [t0, 1, IN_OUT], [t0 + 12, -.4, IN_OUT], [t0 + 24, 1, IN_OUT], [t0 + 36, -.4, IN_OUT], [t0 + 48, 1]]);
    }
  });

  /* ---- glints on the parked car ---- */
  m.glints.forEach(([gx, gy], i) => {
    const g = ab.add('Node', { parent: 0, name: 'glint' + i, x: STOP + gx * s, y: CY + gy * s, scaleX: 0, scaleY: 0 });
    const star = shape(ab, g, 'star' + i, { blendModeValue: BLEND.screen });
    ab.add('Star', { parent: star, width: 36, height: 36, points: 4, innerRadius: .14 }); solid(ab, star, WHITE);
    glow(ab, g, 'halo' + i, { d: 32, color: WHITE, a: .9 });
    const t0 = ARRIVE + 30 + i * 9;
    tracks.push(...scale(g, [[0, 0, 'hold'], [t0, 0, OUT_BACK], [t0 + 10, 1.1, IN], [t0 + 26, 0]]));
    T(g, 'rotation', [[0, 0, 'hold'], [t0, 0], [t0 + 26, Math.PI / 2]]);
    const k0 = 50 + i * 60;
    idle.push(...scale(g, [[0, 0, 'hold'], [k0, 0, OUT_BACK], [k0 + 9, .9, IN], [k0 + 24, 0]]));
    I(g, 'rotation', [[0, 0, 'hold'], [k0, 0], [k0 + 24, Math.PI / 2]]);
  });

  /* ---- the car with speed lines streaming off it ---- */
  const v = vehicle(ab, 0, m, { s, x: STOP, y: GROUND, wreck: false });
  for (let i = 0; i < 9; i++) {
    const y = -H * (.15 + rnd() * .75), len = 50 + rnd() * 70;
    const line = rect(ab, v.car, 'speed' + i, { w: len, h: 2.5 + rnd() * 2, r: 2, x: -W / 2 - 20, y, ox: 1, props: { opacity: 0 } });
    gradient(ab, line, 'linear', [-len, 0, 0, 0], [[alpha(WHITE, 0), 0], [alpha(WHITE, .85), 1]]);
    const keys = [[0, -W / 2 - 10]], ops = [[0, 0]];
    for (let t = 1 + Math.round(rnd() * 6); t + 8 < ARRIVE; t += 9) { keys.push([t, -W / 2 - 10, OUT], [t + 8, -W / 2 - 60 - rnd() * 60, 'hold']); ops.push([t, .95], [t + 8, 0, 'hold']); }
    ops.push([ARRIVE, 0, 'hold']);
    T(line, 'x', keys); T(line, 'opacity', ops);
  }
  T(v.car, 'x', [[0, -W, OUT], [ARRIVE, STOP]]);
  T(v.rig, 'rotation', [[0, .04, 'hold'], [ARRIVE - 8, .04, IN], [ARRIVE, -.07, SPRING], [ARRIVE + 40, 0]]);
  T(v.rig, 'scaleX', [[0, 1.06, 'hold'], [ARRIVE - 6, 1.06, IN], [ARRIVE, .96, SPRING], [ARRIVE + 34, 1]]);
  for (const b of v.bodies) I(b, 'y', [[0, 0, IN_OUT], [60, -2, IN_OUT], [120, 0, IN_OUT], [180, -2, IN_OUT], [240, 0]]);

  /* ---- underglow and shadow ---- */
  const under = ab.add('Node', { parent: 0, name: 'underglow', x: STOP, y: GROUND - 2, scaleY: .14, opacity: 0 });
  glow(ab, under, 'underglow-light', { d: W * 1.1, color: neon, a: 1 });
  T(under, 'opacity', [[0, 0, 'hold'], [ARRIVE + 4, 0, OUT], [ARRIVE + 24, 1]]);
  T(under, 'x', [[0, STOP, 'hold']]);
  I(under, 'opacity', [[0, 1, IN_OUT], [120, .6, IN_OUT], [240, 1]]);
  const shadow = ab.add('Node', { parent: 0, name: 'shadow', x: STOP, y: GROUND, scaleY: .12 });
  const sh = shape(ab, shadow, 'shadow-shape'); ab.add('Ellipse', { parent: sh, width: W * 1.1, height: W * 1.1 });
  gradient(ab, sh, 'radial', [0, 0, W * .55, 0], [['#000000B3', 0], ['#00000059', .6], ['#00000000', 1]]);
  T(shadow, 'x', [[0, -W, OUT], [ARRIVE, STOP]]);

  /* ---- the finish: a flash as the car crosses, a chequered flag waving on its pole ---- */
  const cross = Math.round(ARRIVE * .42); // about when the nose passes the line
  const crossGlow = ab.add('Node', { parent: 0, name: 'cross', x: LINE, y: GROUND - 50, opacity: 0, scaleX: .5, scaleY: 1.6 });
  glow(ab, crossGlow, 'cross-glow', { d: 120, color: WHITE, a: .9 });
  T(crossGlow, 'opacity', [[0, 0, 'hold'], [cross, 1, OUT], [cross + 24, 0]]);
  const flag = ab.add('Node', { parent: 0, name: 'flag', x: LINE + 3, y: GROUND - 132 });
  const COLS = 7, ROWS = 4, Q = 10;
  for (let c = 0; c < COLS; c++) {
    const col = ab.add('Node', { parent: flag, name: 'col' + c, x: c * Q });
    for (let r = 0; r < ROWS; r++) rect(ab, col, `q${c}-${r}`, { w: Q + .6, h: Q + .6, x: Q / 2, y: r * Q + Q / 2, color: (c + r) % 2 ? '#14161C' : '#F4F6FA' });
    const amp = 1.2 + c * .9, ph = c * .85;
    wave.push({ object: col, prop: 'y', keys: [0, 1, 2, 3, 4].map(k => [k * 15, Math.sin(k / 4 * TAU + ph) * amp, IN_OUT]) });
    wave.push({ object: col, prop: 'scaleY', keys: [0, 1, 2, 3, 4].map(k => [k * 15, 1 - Math.cos(k / 4 * TAU + ph) * .04 * (c / COLS), IN_OUT]) });
  }
  rect(ab, 0, 'pole', { w: 4, h: 136, x: LINE, y: GROUND, oy: 1, r: 2, color: '#C9CED8' });
  glow(ab, 0, 'pole-top', { d: 14, color: WHITE, a: 1, x: LINE, y: GROUND - 136 });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) rect(ab, 0, `line${r}-${c}`, { w: 7, h: 9.5, x: LINE - 3.5 + c * 7, y: GROUND + 4.75 + r * 9.5, color: (r + c) % 2 ? '#14161C' : '#E9ECF2' });

  /* ---- fireworks: streaks shoot out from a point (trimmed lines), sparkles fall from the tips ---- */
  const shows = [[96, 70, 0, ARRIVE + 4], [300, 58, 1, ARRIVE + 18], [200, 40, 2, ARRIVE + 34]];
  const reprise = [[318, 84, 30], [84, 52, 110], [210, 66, 180]]; // idle: they go off again elsewhere
  shows.forEach(([x, y, ci, t0], f) => {
    const color = FIREWORK[(ci + (Object.keys(NEON).indexOf(base))) % FIREWORK.length], R = 62 + f * 8;
    const fw = ab.add('Node', { parent: 0, name: 'firework' + f, x, y });
    const rocket = ab.add('Node', { parent: 0, name: 'rocket' + f, x, y: GROUND, opacity: 0 });
    glow(ab, rocket, 'rocket-glow' + f, { d: 16, color: '#FFE58A', a: 1 });
    const fx = (keysFor, at, px, py) => {
      keysFor(rocket, 'opacity', [[0, 0, 'hold'], [at - 18, 1, 'hold'], [at, 0, 'hold']]);
      keysFor(rocket, 'x', [[0, px, 'hold']]);
      keysFor(rocket, 'y', [[0, GROUND, 'hold'], [at - 18, GROUND, OUT], [at, py]]);
      keysFor(fw, 'x', [[0, px, 'hold']]); keysFor(fw, 'y', [[0, py, 'hold'], [at, py, OUT], [at + 40, py + 10]]);
    };
    const rays = [], tips = [];
    for (let k = 0; k < 14; k++) {
      const a = k / 14 * TAU;
      const ray = shape(ab, fw, `fw${f}-ray${k}`, { opacity: 0, blendModeValue: BLEND.screen });
      const path = ab.add('PointsPath', { parent: ray, isClosed: false });
      ab.add('StraightVertex', { parent: path, x: Math.cos(a) * 6, y: Math.sin(a) * 6 });
      ab.add('StraightVertex', { parent: path, x: Math.cos(a) * R, y: Math.sin(a) * R });
      const st = ab.add('Stroke', { parent: ray, thickness: 4, cap: 1 }); ab.add('SolidColor', { parent: st, color: k % 3 ? color : WHITE });
      const trim = ab.add('TrimPath', { parent: st, trimStart: 0, trimEnd: 0, trimMode: 1 });
      rays.push({ ray, trim });
      const tip = shape(ab, fw, `fw${f}-tip${k}`, { x: Math.cos(a) * R * 1.06, y: Math.sin(a) * R * 1.06, opacity: 0, blendModeValue: BLEND.screen });
      ab.add('Ellipse', { parent: tip, width: 5, height: 5 }); solid(ab, tip, k % 2 ? WHITE : color);
      tips.push({ tip, y: Math.sin(a) * R * 1.06 });
    }
    const core = ab.add('Node', { parent: fw, name: 'fw-core' + f, opacity: 0 });
    glow(ab, core, 'fw-flash' + f, { d: 110, color: WHITE, a: 1 });
    const pop = (keysFor, at) => {
      keysFor(core, 'opacity', [[0, 0, 'hold'], [at, 1, OUT], [at + 18, 0]]);
      for (const { ray, trim } of rays) {
        keysFor(ray, 'opacity', [[0, 0, 'hold'], [at, 1, 'hold'], [at + 30, 1], [at + 34, 0, 'hold']]);
        keysFor(trim, 'trimEnd', [[0, 0, 'hold'], [at, 0, OUT], [at + 16, 1]]);
        keysFor(trim, 'trimStart', [[0, 0, 'hold'], [at + 10, 0, OUT], [at + 34, 1]]);
      }
      tips.forEach(({ tip, y: ty }, k) => {
        keysFor(tip, 'opacity', [[0, 0, 'hold'], [at + 14, 1, 'hold'], [at + 22 + (k % 3) * 4, .3, 'hold'], [at + 26 + (k % 3) * 4, 1], [at + 56, 0]]);
        keysFor(tip, 'y', [[0, ty, 'hold'], [at + 14, ty, IN], [at + 56, ty + 22]]);
      });
    };
    fx(T, t0, x, y); pop(T, t0);
    const [rx, ry, rt] = reprise[f]; fx(I, rt, rx, ry); pop(I, rt);
  });

  /* ---- road, horizon glow, stars, sky ---- */
  rect(ab, 0, 'road-edge', { w: SW, h: 2, x: SW / 2, y: GROUND + 1, color: '#3A3F55' });
  const road = rect(ab, 0, 'road', { w: SW, h: SH - GROUND, x: SW / 2, y: GROUND, oy: 0 });
  gradient(ab, road, 'linear', [0, 0, 0, SH - GROUND], [['#20243A', 0], ['#0C0E17', 1]]);
  for (let i = 0; i < 5; i++) rect(ab, 0, 'dash' + i, { w: 34, h: 3, x: 40 + i * 84, y: GROUND + 20, r: 1.5, color: '#4A5070' });
  const horizon = ab.add('Node', { parent: 0, name: 'horizon', x: SW / 2, y: GROUND, scaleY: .45 }); // a squashed glow: no hard edge
  glow(ab, horizon, 'horizon-light', { d: 620, color: neon, a: .6 });
  for (let i = 0; i < 22; i++) {
    const star = shape(ab, 0, 'sky-star' + i, { x: 10 + rnd() * (SW - 20), y: 8 + rnd() * (GROUND - 120), opacity: .3 + rnd() * .6 });
    const d = 1.4 + rnd() * 1.8; ab.add('Ellipse', { parent: star, width: d, height: d }); solid(ab, star, WHITE);
    const t = 1 + Math.round(rnd() * 48), base0 = .25 + rnd() * .3;
    wave.push({ object: star, prop: 'opacity', keys: [[0, base0], [t, base0, IN_OUT], [t + 5, 1, IN_OUT], [t + 10, base0]] });
  }
  const sky = rect(ab, 0, 'sky', { w: SW, h: SH, x: SW / 2, y: SH / 2 });
  gradient(ab, sky, 'linear', [0, -SH / 2, 0, SH / 2], [['#080A1C', 0], ['#191A44', .55], ['#2E1F55', 1]]);

  // the flag and the stars run through both animations (a second state-machine layer stopped the show playing),
  // so their 60-frame cycle is repeated: 3 times in the show, 4 times in the idle loop, and the hand-over is seamless
  for (const w of wave) { tracks.push({ ...w, keys: repeat(w.keys, 60, 3) }); idle.push({ ...w, keys: repeat(w.keys, 60, 4) }); }
  const show = ab.animation('show', { duration: END, tracks });
  const loop = ab.animation('idle', { duration: 240, loop: 'loop', tracks: idle });
  replayable(ab, 'Pass', show, loop, END);
  return { ab, ms: Math.round(END / 60 * 1000) };
}

const OUT_DIR = new URL('../../dist/assets/rive/', import.meta.url);
mkdirSync(OUT_DIR, { recursive: true });
const timings = {};
for (const base of Object.keys(NEON)) {
  reseed(7);
  const m = META[base];
  const img = (k, w = m.w, h = m.h) => ({ name: `${base}-${k}`, width: w, height: h, bytes: readFileSync(new URL(`${base}-${k}.webp`, ART)) });
  const assets = [img('wreck-wheels'), img('wreck-body'), img('dream-wheels'), img('dream-body'), ...m.parts.map(p => img('part-' + p.id, p.w, p.h))];
  const glowup = showBoard(base, 'glowup'), hero = showBoard(base, 'hero'), pass = passBoard(base);
  const bytes = writeRiv([glowup.ab, hero.ab, pass.ab], { fileId: 2, assets });
  writeFileSync(new URL(`glowup-${base}.riv`, OUT_DIR), bytes);
  timings[base] = { glowup: glowup.ms, hero: hero.ms, pass: pass.ms };
  console.log(`glowup-${base}.riv`, bytes.length, 'bytes', JSON.stringify(timings[base]));
}
