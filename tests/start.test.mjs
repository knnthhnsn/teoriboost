import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeTry } from '../dist/start.js';
import { QUESTIONS } from '../dist/content.js';

test('the start-page sample question is graded statement by statement', () => {
  const q = QUESTIONS.find(x => x.id === 'q-031');
  assert.ok(q, 'the sample question exists');
  const perfect = gradeTry(q, q.statements.map(s => s.correct));
  assert.equal(perfect.all, true); assert.equal(perfect.right, 4);
  const flipped = gradeTry(q, q.statements.map((s, i) => i === 0 ? !s.correct : s.correct));
  assert.equal(flipped.all, false); assert.equal(flipped.right, 3); assert.deepEqual(flipped.rows, [false, true, true, true]);
  assert.equal(gradeTry(q, [null, null, null, null]).right, 0, 'unanswered never counts as right');
});
