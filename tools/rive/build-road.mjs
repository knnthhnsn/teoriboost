// Builds dist/assets/rive/road.riv: traffic on the Prøve poster's yellow road (the four vehicles from above, drawn
// by Codex, cut by tools/cse-assets.py into tools/rive/road-art).
//   Road - state machine "Road" with one looping animation "traffic": the road is a tall strip (the page tilts it);
//   up the right lane drive the small car and, much faster, the race car; down the left lane, turned round, come
//   the estate car and the scooter. Each sways a hair in its lane. 8 s loop, so a car passes about every 2 s.
// Run: node tools/rive/build-road.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Artboard, writeRiv } from './riv.mjs';

const ART = new URL('road-art/', import.meta.url);
const OUT_DIR = new URL('../../dist/assets/rive/', import.meta.url);
const META = JSON.parse(readFileSync(new URL('meta.json', ART))); // { name: { w, h } }
const CARS = ['scooter', 'smallcar', 'bigcar', 'racecar'];
const W = 100, H = 450, LOOP = 480; // the strip, in units; 8 s at 60 fps
// the page shows only the middle of the strip (it overhangs the poster by 40 % at each end): cars drive that part
const SEEN = [H * .21, H * .79];
const IN_OUT = [0.45, 0, 0.55, 1];
// longest car (the estate) is 86 units long; the others keep their relative sizes
const UNIT = 86 / Math.max(...CARS.map(c => META[c].h));

function roadBoard() {
  const ab = new Artboard('Road', W, H);
  const cars = Object.fromEntries(CARS.map((c, i) => {
    const node = ab.add('Node', { name: c, x: -200, y: -200 });
    ab.add('Image', { parent: node, name: `${c}-img`, assetId: i, scaleX: UNIT, scaleY: UNIT });
    return [c, node];
  }));
  // [car, lane x, direction (1 up, -1 down), start frame, frames to cross]
  const TRIPS = [['smallcar', 72, 1, 0, 200], ['bigcar', 28, -1, 90, 230], ['racecar', 72, 1, 250, 95], ['scooter', 28, -1, 300, 180]];
  const tracks = TRIPS.flatMap(([c, x, dir, t0, life]) => {
    const len = META[c].h * UNIT * .6, from = dir > 0 ? SEEN[1] + len : SEEN[0] - len, to = dir > 0 ? SEEN[0] - len : SEEN[1] + len;
    const t1 = Math.min(t0 + life, LOOP);
    const yKeys = [[0, from, 'hold'], ...(t0 ? [[t0, from]] : []), [t1, t1 === t0 + life ? to : from + (to - from) * (t1 - t0) / life, 'hold'], [LOOP, from]];
    const sway = [0, .6, -.5, .4, -.6, 0].map((v, k) => [t0 + Math.round(k * life / 5), x + v, IN_OUT]).filter(([f]) => f < LOOP);
    return [
      { object: cars[c], prop: 'y', keys: yKeys },
      { object: cars[c], prop: 'x', keys: [[0, x, 'hold'], ...sway.filter(([f]) => f > 0), [LOOP, x]] },
      { object: cars[c], prop: 'rotation', keys: [[0, dir > 0 ? 0 : Math.PI, 'hold'], [LOOP, dir > 0 ? 0 : Math.PI]] },
    ];
  });
  const traffic = ab.animation('traffic', { duration: LOOP, loop: 'loop', tracks });
  ab.stateMachine('Road', { inputs: [], layers: [{ name: 'Main', states: [{ name: 'traffic', animation: traffic }], transitions: [{ from: 'entry', to: 'traffic' }] }] });
  return ab;
}

mkdirSync(OUT_DIR, { recursive: true });
const assets = CARS.map(c => ({ name: 'road-' + c, width: META[c].w, height: META[c].h, bytes: readFileSync(new URL(`${c}.webp`, ART)) }));
const bytes = writeRiv([roadBoard()], { fileId: 5, assets });
writeFileSync(new URL('road.riv', OUT_DIR), bytes);
console.log('road.riv', bytes.length, 'bytes');
