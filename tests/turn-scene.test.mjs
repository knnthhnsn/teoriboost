import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TURN_LANES,
  TURN_VARIANTS,
  createTurnScene,
  sampleTurnReplay
} from '../dist/turn-scene.js';

const VARIANTS = Object.keys(TURN_VARIANTS);

// Ground-plane extents from the rendered meshes: the car includes its mirrors
// and lamps; the cyclist includes wheels, handlebars, hands, and wheel tyres.
const FOOTPRINTS = Object.freeze({
  car: Object.freeze({ width: 2.31, length: 4.24 }),
  cyclist: Object.freeze({ width: 0.61, length: 1.99 })
});

function corners(pose, { width, length }) {
  const forward = { x: -Math.sin(pose.heading), z: -Math.cos(pose.heading) };
  const right = { x: Math.cos(pose.heading), z: -Math.sin(pose.heading) };
  return [[-1, -1], [-1, 1], [1, 1], [1, -1]].map(([side, end]) => ({
    x: pose.x + right.x * side * width / 2 + forward.x * end * length / 2,
    z: pose.z + right.z * side * width / 2 + forward.z * end * length / 2
  }));
}

function projection(polygon, axis) {
  const values = polygon.map(point => point.x * axis.x + point.z * axis.z);
  return [Math.min(...values), Math.max(...values)];
}

function polygonsIntersect(first, second) {
  for (const polygon of [first, second]) {
    for (let index = 0; index < polygon.length; index += 1) {
      const next = polygon[(index + 1) % polygon.length];
      const edge = { x: next.x - polygon[index].x, z: next.z - polygon[index].z };
      const axis = { x: -edge.z, z: edge.x };
      const [firstMin, firstMax] = projection(first, axis);
      const [secondMin, secondMax] = projection(second, axis);
      if (firstMax < secondMin || secondMax < firstMin) return false;
    }
  }
  return true;
}

function bodiesIntersect(sample) {
  return polygonsIntersect(
    corners(sample.car, FOOTPRINTS.car),
    corners(sample.cyclist, FOOTPRINTS.cyclist)
  );
}

function closestCornerDistance(sample) {
  const car = corners(sample.car, FOOTPRINTS.car);
  const cyclist = corners(sample.cyclist, FOOTPRINTS.cyclist);
  return Math.min(...car.flatMap(a => cyclist.map(b => Math.hypot(a.x - b.x, a.z - b.z))));
}

function fallbackCanvas(cyclistRect) {
  const attributes = new Map();
  const cyclistNode = { getBoundingClientRect: () => cyclistRect };
  const svg = {
    style: {},
    setAttribute(name, value) { attributes.set(name, String(value)); },
    querySelector(selector) { return selector === '[data-turn-risk="cycle"]' ? cyclistNode : null; },
    remove() { this.removed = true; },
    set innerHTML(value) { this.markup = value; }
  };
  const canvas = {
    style: {},
    nextSibling: null,
    ownerDocument: { createElementNS: () => svg },
    parentElement: { style: {}, insertBefore() {} },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 375, height: 520 })
  };
  return { canvas, svg, attributes };
}

test('all variants begin northbound in separate right-side car and cycle lanes', () => {
  for (const variant of VARIANTS) {
    const sample = sampleTurnReplay(variant, 'wait', 0);
    const lanes = TURN_LANES[variant];
    const carBody = corners(sample.car, FOOTPRINTS.car);
    const cyclistBody = corners(sample.cyclist, FOOTPRINTS.cyclist);

    assert.ok(Math.abs(sample.car.heading) < Number.EPSILON, `${variant}: car points north`);
    assert.ok(Math.abs(sample.cyclist.heading) < Number.EPSILON, `${variant}: cyclist points north`);
    assert.equal(sample.car.x, lanes.northbound.centreX, `${variant}: car is centred in its lane`);
    assert.equal(sample.cyclist.x, lanes.cycleTrack.centreX, `${variant}: cyclist is centred on the track`);
    assert.ok(Math.max(...carBody.map(point => point.x)) < lanes.cycleTrack.bounds[0], `${variant}: complete car body starts west of cycle track`);
    assert.ok(Math.min(...cyclistBody.map(point => point.x)) >= lanes.cycleTrack.bounds[0], `${variant}: cyclist body stays inside west track edge`);
    assert.ok(Math.max(...cyclistBody.map(point => point.x)) <= lanes.cycleTrack.bounds[1], `${variant}: cyclist body stays inside east track edge`);
  }
});

test('safe replay holds the car, clears the cyclist, then crosses the cycle track without intersection', () => {
  for (const variant of VARIANTS) {
    const lanes = TURN_LANES[variant];
    const held = sampleTurnReplay(variant, 'wait', 0.28);
    const released = sampleTurnReplay(variant, 'wait', 0.66);
    assert.deepEqual(released.car, held.car, `${variant}: car remains geometrically stationary while yielding`);

    let enteredCycleTrack = false;
    let minimumClearance = Infinity;
    for (let step = 0; step <= 2000; step += 1) {
      const sample = sampleTurnReplay(variant, 'wait', step / 2000);
      assert.equal(bodiesIntersect(sample), false, `${variant}: bodies intersect at replay step ${step}`);
      minimumClearance = Math.min(minimumClearance, closestCornerDistance(sample));
      if (sample.car.x >= lanes.cycleTrack.bounds[0] && sample.car.x <= lanes.cycleTrack.bounds[1]) enteredCycleTrack = true;
    }

    const completed = sampleTurnReplay(variant, 'wait', 1);
    assert.ok(enteredCycleTrack, `${variant}: turning path enters the cycle track`);
    assert.ok(completed.car.x > lanes.cycleTrack.bounds[1], `${variant}: car finishes east of the cycle track`);
    assert.ok(completed.cyclist.z < TURN_VARIANTS[variant].conflict[1], `${variant}: cyclist clears north past the conflict`);
    assert.ok(minimumClearance > 0, `${variant}: rendered footprints retain positive clearance`);
  }
});

test('unsafe replay freezes immediately before body contact in every variant', () => {
  for (const variant of VARIANTS) {
    const frozen = sampleTurnReplay(variant, 'turn', 1);
    assert.equal(frozen.phase, 'conflict');
    assert.equal(bodiesIntersect(frozen), false, `${variant}: unsafe replay must freeze before contact`);
    assert.ok(closestCornerDistance(frozen) < 0.75, `${variant}: freeze should visibly demonstrate the near conflict`);

    for (let step = 0; step <= 1000; step += 1) {
      assert.equal(bodiesIntersect(sampleTurnReplay(variant, 'turn', step / 1000)), false, `${variant}: contact occurs before freeze at step ${step}`);
    }
  }
});

test('cleared-cyclist contrast keeps the car static and places the complete cyclist beyond the conflict', () => {
  const scene = createTurnScene(null, { variant: 'driveway', motion: false });
  const initial = scene.snapshot();
  assert.equal(scene.setCyclistCleared(true), true);
  const cleared = scene.snapshot();

  assert.equal(cleared.variant, 'driveway');
  assert.equal(cleared.cyclistCleared, true);
  assert.equal(cleared.explanation, false, 'contrast does not reveal answer-path overlays');
  assert.deepEqual(cleared.car, initial.car, 'car remains in its initial static pose');
  assert.equal(cleared.progress.car, 0);
  assert.equal(cleared.progress.cyclist, 0.73);
  const clearedCyclist = corners(cleared.cyclist, FOOTPRINTS.cyclist);
  assert.ok(Math.max(...clearedCyclist.map(point => point.z)) < TURN_VARIANTS.driveway.conflict[1], 'rear of cyclist is fully north of the crossing path');
  scene.setCyclistCleared(true);
  assert.deepEqual(scene.snapshot(), cleared, 'setting the same contrast twice is a complete no-op');

  scene.reset();
  assert.equal(scene.snapshot().cyclistCleared, false, 'reset removes the static contrast');
  assert.deepEqual(scene.snapshot().cyclist, initial.cyclist);
  scene.setCyclistCleared(true);
  scene.replay('wait');
  assert.equal(scene.snapshot().cyclistCleared, false, 'replay starts from its own timeline instead of teleporting');
  const completedReplay = scene.snapshot();
  scene.setCyclistCleared(false);
  assert.deepEqual(scene.snapshot(), completedReplay, 'same-false render calls do not cancel or rewind the replay state');
  scene.setCyclistCleared(true);
  scene.setVariant('junction');
  assert.equal(scene.snapshot().cyclistCleared, false, 'variant change removes the static contrast');
});

test('fallback risk picking provides a 44px cyclist target and cleared cyclist remains in the phone view', () => {
  const { canvas, svg, attributes } = fallbackCanvas({ left: 100, top: 80, right: 110, bottom: 92, width: 10, height: 12 });
  const scene = createTurnScene(canvas, { variant: 'driveway' });

  assert.equal(scene.pickRisk(83, 64), 'cycle', 'minimum padded target includes its 44px edge');
  assert.equal(scene.pickRisk(82.9, 63.9), 'other');
  scene.setView('shoulder');
  scene.setCyclistCleared(true);
  const viewBox = attributes.get('viewBox').split(' ').map(Number);
  const cyclistBody = corners(scene.snapshot().cyclist, FOOTPRINTS.cyclist);
  const [left, top, width, height] = viewBox;
  assert.ok(cyclistBody.every(point => point.x >= left && point.x <= left + width && point.z >= top && point.z <= top + height), 'cleared cyclist body remains inside the 375px shoulder view');
  assert.match(svg.markup, /data-turn-risk="cycle"/);

  scene.dispose();
  assert.equal(scene.pickRisk(105, 86), 'other');
});

test('overhead fallback frame contains the complete car before and after the unsafe replay', () => {
  const { canvas, attributes } = fallbackCanvas({ left: 0, top: 0, width: 44, height: 44 });
  const scene = createTurnScene(canvas, { variant: 'driveway', motion: false });
  scene.setView('overhead');
  const containsCar = snapshot => {
    const [left, top, width, height] = attributes.get('viewBox').split(' ').map(Number);
    return corners(snapshot.car, FOOTPRINTS.car).every(point => point.x >= left && point.x <= left + width && point.z >= top && point.z <= top + height);
  };

  assert.equal(containsCar(scene.snapshot()), true, 'initial car is in the overview frame');
  scene.replay('turn');
  assert.equal(containsCar(scene.snapshot()), true, 'pre-contact frozen car is in the overview frame');
  assert.equal(bodiesIntersect(scene.snapshot()), false, 'unsafe replay still freezes without body contact');
});

test('DOM-free fallback completes one callback per replay and stays quiet after disposal', () => {
  let callbacks = 0;
  const scene = createTurnScene(null, { motion: false, onReplayEnd: () => { callbacks += 1; } });
  assert.equal(scene.snapshot().renderer, 'svg-fallback');

  scene.replay('wait');
  assert.equal(callbacks, 1);
  assert.equal(scene.snapshot().phase, 'complete');

  scene.replay('turn');
  assert.equal(callbacks, 2);
  assert.equal(scene.snapshot().phase, 'conflict');

  scene.dispose();
  scene.dispose();
  scene.replay('wait');
  assert.equal(callbacks, 2);
});
