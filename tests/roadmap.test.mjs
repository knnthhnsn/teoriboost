import test from 'node:test';
import assert from 'node:assert/strict';
import { afsnitOf, firstSections, hardAfsnitStatus } from '../dist/afsnit.js';
import { termsIn } from '../dist/glossary.js';
import { pickWarmup } from '../dist/examday.js';
import { copenhagenTime, mayDriveAlone } from '../dist/sytten.js';
import { reviewQueue, blankState } from '../dist/core.js';
import { CHAPTERS, QUESTIONS } from '../dist/content.js';

test('afsnit læses ud af undervisningsplanens henvisning', () => {
  assert.deepEqual(afsnitOf('Kategori B v1.1: 4.4.3 og 8 · modul 1'), [4, 8]);
  assert.deepEqual(afsnitOf('Kategori B v1.1: 1.2.5-1.3 · modul 2'), [1]);
  assert.deepEqual(afsnitOf('Kategori B v1.1: 0.3 og BEK nr. 731 §§ 9'), []);
  const first = firstSections(CHAPTERS);
  assert.ok(first.has('cockpit') && first.has('alkohol-stoffer'));
  const status = hardAfsnitStatus(CHAPTERS, { cockpit: { lastCorrect: true, assessments: 1 } }, r => r.lastCorrect && r.assessments > 0);
  assert.equal(status[0].nr, 1); assert.equal(status[0].ok, 1); assert.ok(status[0].total >= 5);
});

test('Øv tager de prioriterede emner først, når intet andet haster, og uden prioritet er rækkefølgen den gamle', () => {
  const plain = reviewQueue(blankState(), QUESTIONS, Date.now()).map(q => q.id);
  const prio = reviewQueue(blankState(), QUESTIONS, Date.now(), { priority: new Set(['alkohol-stoffer']) });
  assert.equal(prio[0].sectionId, 'alkohol-stoffer');
  assert.deepEqual(reviewQueue(blankState(), QUESTIONS, Date.now(), {}).map(q => q.id), plain);
});

test('svære ord kender bøjninger og æøå, og højst tre vises', () => {
  assert.deepEqual(termsIn('Du kører mod hajtænderne og har ubetinget vigepligt.').map(t => t.id), ['ubetinget', 'hajtaender']);
  assert.deepEqual(termsIn('Parkeret bil ved fortovet').map(t => t.id), ['parkering']);
  assert.equal(termsIn('motorvej, vognbane, overhaling, fjernlys, promille').length, 3);
  assert.deepEqual(termsIn('hjælper'), []);
});

test('opvarmningen tager to situationer fra hver sit kapitel', () => {
  const two = pickWarmup(QUESTIONS, () => 0.42);
  assert.equal(two.length, 2); assert.notEqual(two[0].chapterId, two[1].chapterId);
});

test('17-årige må køre alene fra kl. 05 til 20 dansk tid', () => {
  assert.equal(mayDriveAlone({ h: 4 }), false); assert.equal(mayDriveAlone({ h: 5 }), true);
  assert.equal(mayDriveAlone({ h: 19 }), true); assert.equal(mayDriveAlone({ h: 20 }), false);
  assert.deepEqual(copenhagenTime(new Date('2026-07-01T18:30:00Z')), { h: 20, m: 30 }); // sommertid: UTC+2
  assert.deepEqual(copenhagenTime(new Date('2026-12-01T04:00:00Z')), { h: 5, m: 0 }); // vintertid: UTC+1
});
