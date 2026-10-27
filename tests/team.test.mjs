import test from 'node:test';
import assert from 'node:assert/strict';
import { points, rank, placeBoost, boostFor, fireOf, withBoost, correctToday, cleanName, cleanCode, validCode, makeCode, publicCar, carGarage, onRoad, spots,
  renderRace, renderTeamPage, createTeam, memoryFirestore, dayOf, BOOST_CAP } from '../dist/team.js';
import { balance, loadGarage, emptyGarage } from '../dist/mybil.js';
import { mergeGarage } from '../dist/cloud-merge.js';

const NOW = Date.parse('2026-10-27T12:00:00+01:00'), DAY = dayOf(NOW), YESTERDAY = dayOf(NOW - 864e5), OLD = dayOf(NOW - 3 * 864e5);
const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

test('points: 10 per correct answer today, 3 per streak day up to 30 days', () => {
  assert.equal(points({ correct: 4, streak: 2 }), 46);
  assert.equal(points({ correct: 0, streak: 90 }), 90);
  assert.equal(points({}), 0);
});

test('the ranking is today\'s: yesterday\'s answers count 0 and a lapsed streak is over', () => {
  const r = rank([
    { uid: 'a', name: 'A', day: YESTERDAY, correct: 50, streak: 5, at: 1 },
    { uid: 'b', name: 'B', day: DAY, correct: 3, streak: 1, at: 2 },
    { uid: 'c', name: 'C', day: OLD, correct: 50, streak: 30, at: 3 },
  ], NOW);
  assert.deepEqual(r.map(x => [x.uid, x.place, x.points]), [['b', 1, 33], ['a', 2, 15], ['c', 3, 0]]);
});

test('on a tie the one who got there first stays in front', () => {
  const r = rank([{ uid: 'late', name: 'Z', day: DAY, correct: 2, streak: 0, at: 9 }, { uid: 'early', name: 'Y', day: DAY, correct: 2, streak: 0, at: 3 }], NOW);
  assert.equal(r[0].uid, 'early');
});

test('boost: falls with the place, adds vehicle and tuning, is capped, and needs a rival and a correct answer today', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 30].map(placeBoost), [50, 35, 25, 15, 10, 5, 5]);
  const racecar = { active: 'racecar', equipped: { racecar: { paint: 'x', wheels: 'y', roof: 'z' } }, style: { racecar: { neonOn: true } } };
  assert.equal(boostFor({ place: 1, racers: 3, correct: 2, garage: racecar }).pct, 50 + 15 + 4);
  const full = { active: 'racecar', equipped: { racecar: Object.fromEntries(Array.from({ length: 14 }, (_, i) => ['s' + i, 'p' + i])) }, style: {} };
  assert.equal(boostFor({ place: 1, racers: 3, correct: 2, garage: full }).pct, BOOST_CAP);
  assert.equal(boostFor({ place: 1, racers: 1, correct: 5, garage: racecar }).pct, 0, 'alone on the team');
  assert.equal(boostFor({ place: 1, racers: 4, correct: 0, garage: racecar }).pct, 0, 'nothing answered today');
});

test('fire: the leader runs nitro, a 7-day streak burns, and both together go all out', () => {
  assert.equal(fireOf({ place: 1, streak: 0 }), 'nitro');
  assert.equal(fireOf({ place: 3, streak: 7 }), 'nitro');
  assert.equal(fireOf({ place: 1, streak: 12 }), 'mega');
  assert.equal(fireOf({ place: 2, streak: 6 }), '');
});

test('the boost lands on Boosters earned from now on, once, at the boost of the moment', () => {
  let g = withBoost(emptyGarage(), 8000, 50);
  assert.equal(g.bonus || 0, 0, 'nothing back in time');
  g = withBoost(g, 9000, 50); assert.equal(g.bonus, 500);
  g = withBoost(g, 9000, 50); assert.equal(g.bonus, 500, 'the same Boosters are not boosted twice');
  g = withBoost(g, 10500, 0); assert.equal(g.bonus, 500);
  g = withBoost(g, 11500, 200); assert.equal(g.bonus, 500 + 750, 'capped at +75 %');
  const progress = { journey: { events: [] }, history: [] };
  assert.equal(balance(progress, { ...g, earnedSeen: 11500, spent: 1000 }), 11500 + 1250 - 1000);
});

test('the bonus survives a reload and a merge with the account copy', () => {
  const store = memory();
  store.setItem('teoriboost.mybil.v1', JSON.stringify({ ...emptyGarage(), bonus: 1250, boostBase: 11500 }));
  const g = loadGarage(store);
  assert.equal(g.bonus, 1250); assert.equal(g.boostBase, 11500);
  const m = mergeGarage({ bonus: 2000, boostBase: 9000 }, g);
  assert.equal(m.bonus, 2000); assert.equal(m.boostBase, 11500);
});

test('correct answers today come from the once-a-day rewards', () => {
  assert.equal(correctToday({ rewards: [`q1:${DAY}`, `q2:${DAY}`, `q1:${YESTERDAY}`] }, NOW), 2);
  assert.equal(correctToday({}, NOW), 0);
});

test('names and codes are cleaned', () => {
  assert.equal(cleanName('  Sofie_K!! '), 'Sofie_K');
  assert.equal(cleanName('<b>x</b>'), 'bxb');
  assert.equal(cleanName('a'), '');
  assert.equal(cleanName('nazi99'), '');
  assert.equal(cleanName('Lærke.B'), 'Lærke.B');
  assert.equal(cleanCode(' k7m-2qx '), 'K7M2QX');
  assert.ok(validCode('K7M2QX')); assert.ok(!validCode('K7M2Q0')); assert.ok(!validCode('ABC'));
  assert.ok(validCode(makeCode()));
});

test('only catalogue values travel: a car from the network cannot inject styles', () => {
  const car = publicCar({ active: 'smallcar', equipped: { smallcar: { paint: 'not-a-part' } }, style: { smallcar: { paint: 'red;background:url(https://x)', stripe: '#ffffff', plate: '<script>' } } });
  assert.deepEqual(car, { base: 'smallcar', equipped: {}, style: { stripe: '#FFFFFF', plate: 'SCRIPT' } });
  const g = carGarage('{"base":"tank","style":{"neon":"#123456\\" onload=\\"x"}}');
  assert.equal(g.active, 'scooter');
  assert.equal(carGarage('not json').active, 'scooter');
});

test('the road shows the leader, you and those around you, front first', () => {
  const ranked = Array.from({ length: 9 }, (_, i) => ({ uid: 'u' + i, place: i + 1 }));
  assert.deepEqual(onRoad(ranked, 'u6', 4).map(r => r.uid), ['u0', 'u5', 'u6', 'u7']);
  assert.deepEqual(onRoad(ranked, 'u0', 3).map(r => r.uid), ['u0', 'u1', 'u2']);
  const at = spots(4);
  assert.ok(at[0].x > at[3].x, 'the leader furthest ahead');
  assert.deepEqual(at.map(s => s.lane), [0, 1, 0, 1]);
});

test('the race draws names escaped, places, and fire on the leader', () => {
  const ranked = rank([
    { uid: 'me', name: 'Kenneth', day: DAY, correct: 1, streak: 0, car: '{"base":"scooter"}', at: 2 },
    { uid: 'x', name: '<img src=x>', day: DAY, correct: 5, streak: 9, car: '{"base":"racecar"}', at: 1 },
  ], NOW);
  const html = renderRace({ ranked, me: 'me', team: { name: 'Hold 3' } });
  assert.ok(!html.includes('<img src=x>')); assert.ok(html.includes('&lt;img src=x&gt;'));
  assert.ok(html.includes('race-fire--mega'), 'leader with a hot streak');
  assert.ok(html.includes('Nr. 2 af 2'));
  assert.ok(html.includes('Kenneth (dig)'));
});

test('the team page asks you to log in, then for a name, then shows join and create', () => {
  assert.match(renderTeamPage({ view: { status: 'signedout' }, account: { state: 'anon' }, ranked: [] }), /Log ind først/);
  const out = renderTeamPage({ view: { status: 'out' }, account: { state: 'user' }, ranked: [], name: '' });
  assert.match(out, /Dit brugernavn/); assert.match(out, /Opret holdet<\/button>/); assert.match(out, /disabled/);
});

test('create, join, publish and leave a team (on a stand-in for Firestore)', async () => {
  const shared = memoryFirestore('anna');
  const anna = createTeam({ db: async () => shared, store: memory(), random: () => .1 });
  await anna.load(); assert.equal(anna.view().status, 'out');
  await anna.create('Hold 3', 'skole');
  const code = anna.view().team.code;
  assert.ok(validCode(code)); assert.deepEqual(anna.view().team.members, ['anna']);
  await anna.publish({ name: 'Anna', correct: 3, streak: 2, garage: emptyGarage(), boost: 50 });
  const bo = createTeam({ db: async () => ({ ...shared, uid: 'bo' }), store: memory() });
  await bo.load(); await bo.join('nope'); assert.match(bo.view().error, /6 tegn/);
  await bo.join(code.toLowerCase());
  assert.equal(bo.view().status, 'in'); assert.deepEqual(bo.view().team.members, ['anna', 'bo']);
  await bo.publish({ name: 'Bo', correct: 1, streak: 0, garage: emptyGarage(), boost: 35 });
  assert.deepEqual(anna.view().racers.map(r => r.name).sort(), ['Anna', 'Bo'], 'live updates reach the others');
  await bo.leave();
  assert.equal(bo.view().team, null);
  assert.deepEqual(anna.view().racers.map(r => r.name), ['Anna']);
  assert.deepEqual(shared.docs.get('teams/' + code).members, ['anna']);
});

test('signed out there is no team', async () => {
  const t = createTeam({ db: async () => null, store: memory() });
  await t.load(); assert.equal(t.view().status, 'signedout');
});
