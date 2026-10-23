import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Artboard, writeRiv, color } from '../tools/rive/riv.mjs';

const ascii = bytes => Buffer.from(bytes).toString('latin1');

test('the .riv writer produces a version 7 runtime file', () => {
  const ab = new Artboard('Test', 10, 10);
  const shape = ab.add('Shape', { name: 's' }); ab.add('Ellipse', { parent: shape, width: 4, height: 4 });
  const a = ab.animation('pulse', { duration: 10, tracks: [{ object: shape, prop: 'scaleX', keys: [[0, 1, [.3, 1.5, .5, 1]], [10, 2]] }] });
  ab.stateMachine('SM', { inputs: [{ name: 'go', type: 'trigger' }], layers: [{ states: [{ name: 'p', animation: a }], transitions: [{ from: 'entry', to: 'p' }, { from: 'any', to: 'p', when: [{ input: 'go' }] }] }] });
  const bytes = writeRiv([ab]);
  assert.equal(ascii(bytes.slice(0, 4)), 'RIVE');
  assert.equal(bytes[4], 7, 'major version 7');
  assert.equal(bytes[5], 4, 'minor version 4');
  for (const name of ['Test', 'pulse', 'SM', 'go']) assert.ok(ascii(bytes).includes(name), name);
  assert.throws(() => { const b = new Artboard('X', 1, 1); b.add('Nope'); writeRiv([b]); }, /unknown type/);
  assert.equal(color('#D5FF62'), 0xFFD5FF62);
});

test('teoriboost.riv has all the artboards and their inputs', () => {
  const text = ascii(readFileSync(new URL('../dist/assets/rive/teoriboost.riv', import.meta.url)));
  assert.ok(text.startsWith('RIVE'));
  for (const name of ['Feedback', 'Flame', 'Celebrate', 'Confetti', 'Gauge', 'TrafficLight', 'Bolt', 'Target', 'right', 'wrong', 'lit', 'boost', 'play', 'pct', 'earn', 'met']) assert.ok(text.includes(name), name);
});
