import test from 'node:test';
import assert from 'node:assert/strict';
import { boostersEarned, emptyGarage, buyBase, buyOrEquipPart, balance, withEarnings, loadGarage, saveGarage, BOOSTER_RATES } from '../dist/mybil.js';

const lesson = (sectionId, day) => ({ kind: 'lesson', sectionId, day });
const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

test('Boosters come only from lessons, daily goals and passed exams', () => {
  const progress = {
    journey: { dailyGoal: 1, events: [lesson('stop', '2026-10-20'), lesson('stop', '2026-10-20'), lesson('cockpit', '2026-10-21')] },
    history: [{ id: 'e1', errors: 3 }, { id: 'e2', errors: 9 }, { id: 'e1', errors: 3 }],
  };
  // 2 distinct lesson/day pairs, 2 days with the goal met, 1 distinct passed exam
  assert.equal(boostersEarned(progress), 2 * BOOSTER_RATES.lesson + 2 * BOOSTER_RATES.dailyGoal + 1 * BOOSTER_RATES.examPass);
  assert.equal(boostersEarned({}), 0);
});

test('buying needs enough Boosters and spends exactly the price', () => {
  const rich = { journey: { dailyGoal: 1, events: [] }, history: Array.from({ length: 6 }, (_, i) => ({ id: 'x' + i, errors: 0 })) }; // 30.000
  const poor = { journey: { events: [] }, history: [] };
  assert.equal(buyBase(emptyGarage(), poor, 'smallcar').ok, false);
  const bought = buyBase(emptyGarage(), rich, 'smallcar');
  assert.equal(bought.ok, true);
  assert.equal(bought.garage.active, 'smallcar');
  assert.equal(balance(rich, bought.garage), 30000 - 25000);
  const part = buyOrEquipPart(bought.garage, rich, 'top-spoiler');
  assert.equal(part.ok, true);
  assert.equal(part.garage.equipped.smallcar.top, 'top-spoiler');
  // toggling an owned part unequips it without charging again
  const off = buyOrEquipPart(part.garage, rich, 'top-spoiler');
  assert.equal(off.garage.spent, part.garage.spent);
  assert.equal(off.garage.equipped.smallcar.top, undefined);
});

test('earnings never drop when the app trims old exam history', () => {
  const before = { journey: { events: [] }, history: [{ id: 'a', errors: 0 }] };
  const garage = withEarnings(emptyGarage(), before);
  const after = { journey: { events: [] }, history: [] };
  assert.equal(balance(after, garage), BOOSTER_RATES.examPass);
});

test('garage survives a storage round trip and ignores junk', () => {
  const store = memory();
  const g = { ...emptyGarage(), spent: 1234, bases: ['scooter', 'bigcar', 'nope'], active: 'bigcar' };
  saveGarage(g, store);
  const back = loadGarage(store);
  assert.deepEqual(back.bases, ['scooter', 'bigcar']);
  assert.equal(back.active, 'bigcar');
  assert.equal(back.spent, 1234);
  store.setItem('teoriboost.mybil.v1', '{broken');
  assert.deepEqual(loadGarage(store), emptyGarage());
});
