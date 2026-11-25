import test from 'node:test';
import assert from 'node:assert/strict';
import { createHaptics, PATTERNS } from '../dist/haptics.js';
import { CUES } from '../dist/experience.js';
import { blankState, restoreState } from '../dist/core.js';

test('hver lyd har en vibration, og et forkert svar vibrerer blødere end et rigtigt', () => {
  for (const cue of Object.keys(CUES)) assert.ok(PATTERNS[cue], `mangler vibration til ${cue}`);
  const total = p => [].concat(p).filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
  assert.ok(total(PATTERNS.repair) < total(PATTERNS.correct));
});

test('vibrationen kan slås fra, er stille i øveprøven og bliver ikke til to tryk lige efter hinanden', () => {
  const calls = [], nav = { vibrate: p => { calls.push(p); return true; } };
  const on = createHaptics({ nav, doc: {} });
  assert.equal(on.buzz('correct'), true);
  assert.deepEqual(calls[0], PATTERNS.correct);
  assert.equal(on.buzz('correct'), false);
  assert.equal(createHaptics({ nav, enabled: () => false }).buzz('select'), false);
  assert.equal(createHaptics({ nav, suppressed: () => true }).buzz('select'), false);
  assert.equal(createHaptics({ nav }).buzz('ukendt'), false);
});

test('valget om vibration gemmes, og en ny profil har den slået til', () => {
  assert.equal(blankState().settings.haptics, undefined); // undefined betyder slået til
  assert.equal(restoreState({ ...blankState(), settings: { humor: true, sound: true, motion: true, haptics: false } }).settings.haptics, false);
});
