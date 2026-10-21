import test from 'node:test';
import assert from 'node:assert/strict';
import { SEQUENCES, shuffled, gradeOrder, sequenceFor } from '../dist/sequences.js';
import { CHAPTERS } from '../dist/content.js';

const sections = new Map(CHAPTERS.flatMap(c => c.sections.map(s => [s.id, s])));

test('every ordering exercise points at a real, sourced rule card', () => {
  assert.ok(SEQUENCES.length >= 8);
  for (const s of SEQUENCES) {
    const sec = sections.get(s.sectionId);
    assert.ok(sec, `${s.id}: unknown section ${s.sectionId}`);
    assert.ok(sec.sourceIds?.length, `${s.id}: section has no sources`);
    assert.ok(s.steps.length >= 3 && s.steps.length <= 5, `${s.id}: 3–5 steps`);
    assert.equal(new Set(s.steps).size, s.steps.length, `${s.id}: steps are distinct`);
  }
  assert.equal(new Set(SEQUENCES.map(s => s.id)).size, SEQUENCES.length);
  assert.equal(sequenceFor('uheld').id, 'uheld');
  assert.equal(sequenceFor('nope'), null);
});

test('the starting order is shuffled and never already correct', () => {
  for (const n of [3, 4, 5]) for (let i = 0; i < 300; i++) {
    const o = shuffled(n);
    assert.deepEqual([...o].sort(), [...Array(n).keys()]);
    assert.ok(o.some((v, k) => v !== k), 'not the solved order');
  }
});

test('grading marks each position', () => {
  assert.deepEqual(gradeOrder([0, 1, 2, 3]), { rows: [true, true, true, true], right: 4, all: true });
  assert.deepEqual(gradeOrder([1, 0, 2]), { rows: [false, false, true], right: 1, all: false });
});
