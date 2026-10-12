import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { validateVoicePack } from '../voice-validation.mjs';
import { voiceKey } from '../dist/voice-key.js';

function fixture(t) {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'natkoersel-voice-gate-'));
  t.after(() => fs.rmSync(dist, { recursive: true, force: true }));
  const text = 'Du skal standse helt ved stoplinjen.';
  const key = voiceKey(text);
  const src = `assets/voice/test-v1/${key}.mp3`;
  const file = path.join(dist, src);
  const data = Buffer.alloc(512, 0x42);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  const clip = { src, text };
  const metadata = { ...clip, spokenText: text, bytes: data.length, duration: 1, sha256: createHash('sha256').update(data).digest('hex') };
  return { dist, file, key, catalogue: { entries: [{ key, text }] }, pack: { status: 'complete', speakerId: 'test-v1', clips: { [key]: clip } }, production: { status: 'complete', errors: [], speakerId: 'test-v1', catalogueEntries: 1, completed: 1, clips: { [key]: metadata } } };
}

test('voice release gate accepts matching catalogue, metadata and local asset', t => {
  const result = validateVoicePack(fixture(t));
  assert.deepEqual(result.errors, []);
  assert.equal(result.clips, 1);
});
test('voice release gate rejects a partial pack even when all current files exist', t => {
  const value = fixture(t);
  value.pack.status = 'partial';
  assert.match(validateVoicePack(value).errors.join('\n'), /ikke komplet/);
});
test('voice release gate rejects missing files and catalogue gaps', t => {
  const value = fixture(t);
  fs.unlinkSync(value.file);
  assert.match(validateVoicePack(value).errors.join('\n'), /lydfilen mangler/);
  delete value.pack.clips[value.key];
  assert.match(validateVoicePack(value).errors.join('\n'), /hele kataloget|manglende klip/);
});
test('voice release gate rejects text drift, changed bytes and corrupt duration', t => {
  const value = fixture(t);
  value.pack.clips[value.key].text = 'Gammelt facit';
  value.production.clips[value.key].duration = NaN;
  fs.writeFileSync(value.file, Buffer.alloc(512, 0x43));
  const errors = validateVoicePack(value).errors.join('\n');
  assert.match(errors, /forældet/);
  assert.match(errors, /varighed/);
  assert.match(errors, /hash matcher ikke/);
});
test('voice release gate rejects external/traversing sources and surplus clips', t => {
  const value = fixture(t);
  for (const src of ['https://example.org/audio.mp3', '../private.mp3']) {
    value.pack.clips[value.key].src = src;
    assert.match(validateVoicePack(value).errors.join('\n'), /lydsti/);
  }
  value.pack.clips.extra = { text: 'Ekstra', src: 'extra.mp3' };
  assert.match(validateVoicePack(value).errors.join('\n'), /ukendt klip/);
});
test('voice release gate rejects left-over production files', t => {
  const value = fixture(t);
  fs.writeFileSync(value.file.replace('.mp3', '.raw.mp3'), 'unfinished');
  assert.match(validateVoicePack(value).errors.join('\n'), /ufærdig produktionsfil/);
});
