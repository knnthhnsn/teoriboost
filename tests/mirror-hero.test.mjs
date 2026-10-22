import test from 'node:test';
import assert from 'node:assert/strict';
import { heroCopy, renderMirrorHero } from '../dist/mirror-hero.js';

test('hero copy follows where the learner is', () => {
  assert.equal(heroCopy({}).title, 'Spejlet er stillet. Klar til første tur?');
  assert.equal(heroCopy({ goal: 3, today: 3 }).title, 'Dagens mål er nået. Flot kørt.');
  assert.equal(heroCopy({ streak: 4, pct: 30, goal: 3, today: 1 }).title, '4 dage i træk. Hold farten.');
  assert.equal(heroCopy({ streak: 1, pct: 42, goal: 3, today: 1 }).title, 'Du er 42 % klar til prøven.');
  assert.equal(heroCopy({ pct: 90, goal: 2 }).title, 'Du er næsten klar til prøven.');
  assert.equal(heroCopy({ days: 1, goal: 3, today: 2 }).text, '1 lektion mere i dag, så er du på sporet til prøven om 1 dag.');
  assert.equal(heroCopy({ days: 0 }).eyebrow, 'PRØVEN ER I DAG');
  assert.equal(heroCopy({ days: 12 }).eyebrow, '12 DAGE TIL PRØVEN');
});

test('the mirror shows streak, goal and readiness', () => {
  const html = renderMirrorHero({ streak: 4, goal: 3, today: 2, pct: 40 });
  assert.match(html, /data-count="4"/);
  assert.match(html, /<b>2\/3<\/b>/);
  assert.equal((html.match(/class="on"/g) || []).length, 2);
  assert.match(html, /--p:40/);
  assert.match(html, /aria-label="Du er 40 procent klar/);
  assert.doesNotMatch(html, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
});
