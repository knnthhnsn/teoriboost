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
  for (const name of ['Feedback', 'Celebrate', 'Confetti', 'Gauge', 'TrafficLight', 'Bolt', 'Target', 'right', 'wrong', 'play', 'pct', 'earn', 'met']) assert.ok(text.includes(name), name);
});

test('flame.riv holds the streak flame: six levels (burnt out to comeback), each with its faces, and its inputs', () => {
  const text = ascii(readFileSync(new URL('../dist/assets/rive/flame.riv', import.meta.url)));
  assert.ok(text.startsWith('RIVE'));
  for (const name of ['Flame', 'level', 'boost', 'up', 'dance', 'smoke', 'hop', 'levelup', 'flame-L0-idle', 'flame-L1-idle', 'flame-L5-joy']) assert.ok(text.includes(name), name);
  assert.equal(text.split('WEBPVP8').length - 1, 6 * 3, 'idle, blink and joy for each of the six levels');
});

test('signal.riv holds the poster traffic light: the light, its three lamps and the Signal inputs', () => {
  const text = ascii(readFileSync(new URL('../dist/assets/rive/signal.riv', import.meta.url)));
  assert.ok(text.startsWith('RIVE'));
  for (const name of ['Signal', 'light', 'cycle', 'light-2', 'sway', 'signal-base', 'signal-red', 'signal-green']) assert.ok(text.includes(name), name);
  assert.equal(text.split('WEBPVP8').length - 1, 4, 'the light plus one image per lamp');
});

test('each glowup-<base>.riv holds the GlowUp, Hero and Pass shows and the vehicle images', () => {
  const meta = JSON.parse(readFileSync(new URL('../tools/rive/glowup-art/meta.json', import.meta.url)));
  for (const base of ['scooter', 'smallcar', 'bigcar', 'racecar']) {
    const text = ascii(readFileSync(new URL(`../dist/assets/rive/glowup-${base}.riv`, import.meta.url)));
    assert.ok(text.startsWith('RIVE'), base);
    for (const name of ['GlowUp', 'Hero', 'Pass', 'show', 'idle', 'play', `${base}-wreck-body`, `${base}-dream-body`]) assert.ok(text.includes(name), `${base}: ${name}`);
    assert.equal(text.split('WEBPVP8').length - 1, 4 + meta[base].parts.length, `${base}: four layers plus one image per part`);
  }
});

test('brand.riv holds the logo intro, the streak medals, the lesson finish and the start button', () => {
  const text = ascii(readFileSync(new URL('../dist/assets/rive/brand.riv', import.meta.url)));
  assert.ok(text.startsWith('RIVE'));
  for (const name of ['Logo', 'Streak3', 'Streak7', 'Streak30', 'Streak', 'LessonDone', 'Cta', 'hover', 'press', 'play']) assert.ok(text.includes(name), name);
});
