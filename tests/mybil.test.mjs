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

test('colours are free once unlocked, plates are filtered, extras toggle without paying twice', async () => {
  const { setColor, cleanPlate, setPlate, buyOrToggleExtra, EXTRAS } = await import('../dist/mybil.js');
  const g = emptyGarage();
  assert.equal(setColor(g, 'paint', '#14e0f0').garage.style.scooter.paint, '#14E0F0');
  assert.equal(setColor(g, 'paint', 'red').ok, false);
  assert.equal(cleanPlate(' boost-42! '), 'BOOST42');
  assert.equal(cleanPlate('ÆBLE ØL'), 'ÆBLE ØL');
  assert.equal(setPlate(g, 'fuck').ok, false);
  const rich = { journey: { events: [] }, history: [{ id: 'a', errors: 0 }] }; // 5.000
  const bought = buyOrToggleExtra(g, rich, 'neon');
  assert.equal(bought.ok, true);
  assert.equal(bought.garage.spent, EXTRAS.neon.price);
  const off = buyOrToggleExtra(bought.garage, rich, 'neon');
  assert.equal(off.garage.spent, EXTRAS.neon.price);
  assert.equal(off.garage.style.scooter.neonOn, false);
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

test('any tuning can be taken off again, one part or all of it, without losing what you own', async () => {
  const { unequipSlot, unequipAll } = await import('../dist/mybil.js');
  const rich = { journey: { events: [] }, history: Array.from({ length: 6 }, (_, i) => ({ id: 'u' + i, errors: 0 })) };
  let g = buyOrEquipPart(emptyGarage(), rich, 'paint-mask').garage;
  g = buyOrEquipPart(g, rich, 'wheels-chrome').garage;
  const spent = g.spent;
  const one = unequipSlot(g, 'wheels');
  assert.equal(one.garage.equipped.scooter.wheels, undefined);
  assert.equal(one.garage.equipped.scooter.paint, 'paint-mask');
  assert.equal(one.garage.spent, spent);
  assert.ok(one.garage.owned.includes('scooter:wheels-chrome'));
  const all = unequipAll({ ...one.garage, style: { scooter: { neonOn: true, lowered: true, paint: '#FF5FA2' } } });
  assert.deepEqual(all.garage.equipped.scooter, {});
  assert.equal(all.garage.style.scooter.neonOn, false);
  assert.equal(all.garage.style.scooter.lowered, false);
  assert.equal(all.garage.style.scooter.paint, '#FF5FA2', 'colours are kept');
  assert.equal(buyOrEquipPart(all.garage, { journey: { events: [] }, history: [] }, 'wheels-chrome').garage.equipped.scooter.wheels, 'wheels-chrome', 'putting it back is free');
});

test('try-on shows a part or an extra on the car without buying or saving anything', async () => {
  const { withTryOn, vehicleLayers } = await import('../dist/mybil.js');
  const g = emptyGarage();
  const tried = withTryOn(g, { base: 'scooter', part: 'top-spoiler' });
  assert.equal(tried.equipped.scooter.top, 'top-spoiler');
  assert.equal(tried.spent, 0);
  assert.deepEqual(tried.owned, []);
  assert.deepEqual(g.equipped, {}, 'the real garage is untouched');
  assert.match(vehicleLayers(tried), /data-layer="top-spoiler"/);
  assert.equal(withTryOn(g, { base: 'scooter', extra: 'neon' }).style.scooter.neonOn, true);
  assert.equal(withTryOn(g, { base: 'smallcar', part: 'top-spoiler' }), g, 'a try-on for another vehicle is ignored');
  assert.equal(withTryOn(g, null), g);
});

test('the shuffle is bought once, then rolls a new look from what you own only', async () => {
  const { buyShuffle, shuffleLook, SHUFFLE } = await import('../dist/mybil.js');
  const rich = { journey: { events: [] }, history: Array.from({ length: 6 }, (_, i) => ({ id: 'x' + i, errors: 0 })) };
  const poor = { journey: { events: [] }, history: [] };
  let g = emptyGarage();
  assert.equal(shuffleLook(g).ok, false, 'locked until bought');
  assert.equal(buyShuffle(g, poor).ok, false);
  g = buyShuffle(g, rich).garage;
  assert.equal(g.spent, SHUFFLE.price);
  assert.equal(buyShuffle(g, rich).garage.spent, SHUFFLE.price, 'never charged twice');
  assert.equal(shuffleLook(g).ok, false, 'needs something to shuffle');
  for (const id of ['top-spoiler', 'wheels-chrome', 'wheels-sport']) g = buyOrEquipPart(g, rich, id).garage;
  const spent = g.spent;
  let seq = 0; const random = () => [0.1, 0.5, 0.95, 0.3][seq++ % 4];
  const r = shuffleLook(g, random);
  assert.equal(r.ok, true);
  assert.equal(r.garage.spent, spent, 'shuffling is free');
  for (const id of Object.values(r.garage.equipped.scooter)) assert.ok(r.garage.owned.includes('scooter:' + id), id + ' is owned');
});

test('the profile picture is one of the three, remembered, and also the menu icon', async () => {
  const { avatarPref, setAvatarPref, navIcon } = await import('../dist/ui-icons.js');
  const m = new Map(), store = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
  assert.equal(avatarPref(store), 'key', 'the key by default');
  assert.equal(setAvatarPref('helmet', store), true);
  assert.equal(avatarPref(store), 'helmet');
  assert.equal(setAvatarPref('nonsense', store), false);
  assert.equal(avatarPref(store), 'helmet');
  m.set('teoriboost.avatar', 'junk'); assert.equal(avatarPref(store), 'key');
  assert.match(navIcon('wheel'), /assets\/nav\/wheel\.webp/);
});
