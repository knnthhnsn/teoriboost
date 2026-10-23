// Drawing and keyframe helpers shared by the Rive builders (build-glowup.mjs, build-brand.mjs).
import { BLEND } from './riv.mjs';

export const OUT_BACK = [0.34, 1.56, 0.64, 1], OUT = [0.22, 1, 0.36, 1], IN_OUT = [0.45, 0, 0.55, 1], IN = [0.55, 0, 1, 0.45], FALL = [0.5, 0, 1, 0.7];
export const SPRING = { elastic: 'out', amplitude: 1, period: .35 };
export const TAU = Math.PI * 2;
export const LIME = '#D5FF62', WHITE = '#FFFFFF', INK = '#101614';
export const CONFETTI = ['#D5FF62', '#FFD400', '#14E0F0', '#FF5FA2', '#B44CFF', '#58CC02', '#FFFFFF'];

// a seeded random, so every build of a file is the same
let seed = 7;
export const reseed = (n = 7) => { seed = n; };
export const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

export function shape(ab, parent, name, props = {}) { return ab.add('Shape', { parent, name, ...props }); }
export function solid(ab, s, color) { const f = ab.add('Fill', { parent: s }); return ab.add('SolidColor', { parent: f, color }); }
export function stroke(ab, s, color, thickness, { cap = 1, join = 1 } = {}) { const st = ab.add('Stroke', { parent: s, thickness, cap, join }); ab.add('SolidColor', { parent: st, color }); return st; }
/** gradient fill: kind 'linear' | 'radial', from/to in the shape's own space, stops [[color, position]] */
export function gradient(ab, s, kind, [sx, sy, ex, ey], stops) {
  const f = ab.add('Fill', { parent: s });
  const g = ab.add(kind === 'radial' ? 'RadialGradient' : 'LinearGradient', { parent: f, startX: sx, startY: sy, endX: ex, endY: ey });
  for (const [color, position] of stops) ab.add('GradientStop', { parent: g, color, position });
  return f;
}
const hex2 = a => Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
/** '#RRGGBB' with an alpha 0..1 -> '#RRGGBBAA' */
export const alpha = (c, a) => c + hex2(a);
/** a soft glow: a circle whose radial gradient fades from colour to nothing */
export function glow(ab, parent, name, { d, color, a = 1, x = 0, y = 0, blend = BLEND.screen, props = {} }) {
  const s = shape(ab, parent, name, { x, y, blendModeValue: blend, ...props });
  ab.add('Ellipse', { parent: s, width: d, height: d });
  gradient(ab, s, 'radial', [0, 0, d / 2, 0], [[alpha(color, a), 0], [alpha(color, a * .35), .45], [alpha(color, 0), 1]]);
  return s;
}
export function rect(ab, parent, name, { w, h, x = 0, y = 0, r = 0, color, ox, oy, props = {} }) {
  const s = shape(ab, parent, name, { x, y, ...props });
  ab.add('Rectangle', { parent: s, width: w, height: h, cornerRadiusTL: r, linkCornerRadius: true, originX: ox, originY: oy });
  if (color) solid(ab, s, color);
  return s;
}
export function ellipse(ab, parent, name, { d, w = d, h = d, x = 0, y = 0, color, props = {} }) {
  const s = shape(ab, parent, name, { x, y, ...props });
  ab.add('Ellipse', { parent: s, width: w, height: h });
  if (color) solid(ab, s, color);
  return s;
}
/** a closed path through points [[x, y, cornerRadius?]] */
export function poly(ab, parent, name, pts, { x = 0, y = 0, color, closed = true, props = {} } = {}) {
  const s = shape(ab, parent, name, { x, y, ...props });
  const path = ab.add('PointsPath', { parent: s, isClosed: closed });
  for (const [px, py, radius = 0] of pts) ab.add('StraightVertex', { parent: path, x: px, y: py, radius });
  if (color) solid(ab, s, color);
  return s;
}
export function star(ab, parent, name, { d, points = 5, inner = .45, x = 0, y = 0, color, props = {} }) {
  const s = shape(ab, parent, name, { x, y, ...props });
  ab.add('Star', { parent: s, width: d, height: d, points, innerRadius: inner });
  if (color) solid(ab, s, color);
  return s;
}
/** both scale axes keyed alike */
export const scale = (object, keys) => [{ object, prop: 'scaleX', keys }, { object, prop: 'scaleY', keys }];
/** a shake: values alternate around base and die out, as keyframes from t0 */
export function shake(t0, frames, amp, step = 3, base = 0) {
  const keys = [[t0, base]];
  for (let t = t0 + step, k = 0; t < t0 + frames; t += step, k++) keys.push([t, base + (k % 2 ? -1 : 1) * amp * (1 - (t - t0) / frames)]);
  keys.push([t0 + frames, base]); return keys;
}
/** merges keyframe lists of the same property into one, in frame order */
export const merge = (...lists) => lists.flat().sort((a, b) => a[0] - b[0]).filter((k, i, all) => i === 0 || k[0] !== all[i - 1][0]);
/** repeats a cycle of keys ([0..period]) n times; only the last copy keeps the closing key */
export const repeat = (keys, period, times) => Array.from({ length: times }, (_, k) => keys.filter(([t]) => k === times - 1 || t < period).map(([t, v, e]) => [t + k * period, v, e])).flat();

/** entry -> show -> idle; trigger "play" runs the show again. Rive will not move a state into itself, so a replay
 *  during the show goes through a twin state ("again"). One layer only: a second layer stopped the show playing. */
export function replayable(ab, name, show, idle, frames) {
  const exitTime = Math.round(frames / 60 * 1000);
  ab.stateMachine(name, { inputs: [{ name: 'play', type: 'trigger' }],
    layers: [{ name: 'Main', states: [{ name: 'show', animation: show }, { name: 'again', animation: show }, { name: 'idle', animation: idle }],
      transitions: [{ from: 'entry', to: 'show' }, { from: 'show', to: 'idle', exitTime }, { from: 'again', to: 'idle', exitTime },
        { from: 'idle', to: 'show', when: [{ input: 'play' }] }, { from: 'show', to: 'again', when: [{ input: 'play' }] }, { from: 'again', to: 'show', when: [{ input: 'play' }] }] }] });
}
