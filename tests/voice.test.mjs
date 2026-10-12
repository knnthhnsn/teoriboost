import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeVoiceText, voiceKey } from '../dist/voice-key.js';
import { createPlaybackEngine, createTriggerController, resolveVoiceQueue, toggleActiveNarration } from '../dist/voice.js';

class FakeAudio {
  constructor() {
    this.src = '';
    this.playbackRate = 1;
    this.ended = false;
    this.error = null;
    this.played = [];
    this.pauses = 0;
    this.listeners = new Map();
    this.pending = [];
  }
  addEventListener(name, listener) {
    const listeners = this.listeners.get(name) || new Set();
    listeners.add(listener);
    this.listeners.set(name, listeners);
  }
  removeEventListener(name, listener) { this.listeners.get(name)?.delete(listener); }
  getAttribute(name) { return name === 'src' ? this.src : null; }
  removeAttribute(name) { if (name === 'src') this.src = ''; }
  load() { this.ended = false; this.error = null; }
  pause() { this.pauses += 1; }
  play() {
    this.played.push(this.src);
    return new Promise((resolve, reject) => this.pending.push({ resolve, reject }));
  }
  resolvePlay(position = 0) { this.pending.splice(position, 1)[0]?.resolve(); }
  listenersFor(name) { return [...(this.listeners.get(name) || [])]; }
  emit(name) { for (const listener of this.listenersFor(name)) listener({ type: name, target: this }); }
}

const tick = () => new Promise(resolve => setImmediate(resolve));
const clip = (id, text = id) => ({ key: id, text, src: `assets/voice/${id}.mp3` });

class FakeTrigger {
  constructor(nodes, attributes = {}) {
    this.childNodes = [...nodes];
    this.attributes = new Map(Object.entries(attributes));
    this.dataset = { voiceKind: 'lesson' };
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  replaceChildren(...nodes) { this.childNodes = [...nodes]; }
  set textContent(value) { this.childNodes = [String(value)]; }
  get textContent() { return this.childNodes.map(node => typeof node === 'string' ? node : node.text).join(''); }
}

test('oprettelse alene afspiller aldrig lyd', () => {
  const audio = new FakeAudio();
  const engine = createPlaybackEngine({ audio });
  assert.deepEqual(audio.played, []);
  assert.equal(engine.snapshot().phase, 'idle');
  engine.dispose();
});

test('lokal LYT-trigger toggler pause og fortsæt, mens en anden trigger starter nyt', () => {
  const first = new FakeTrigger(['Lyt']);
  const second = new FakeTrigger(['Lyt til noget andet']);
  const triggers = createTriggerController('voice-panel');
  const calls = [];
  let phase = 'playing';
  const engine = {
    snapshot: () => ({ phase }),
    pause: () => { calls.push('pause'); phase = 'paused'; triggers.update(phase); return true; },
    resume: () => { calls.push('resume'); phase = 'playing'; triggers.update(phase); return true; }
  };

  triggers.claim(first);
  triggers.update(phase);
  assert.equal(first.textContent, 'Pause oplæsning');
  assert.equal(toggleActiveNarration(engine, triggers, first), true);
  assert.equal(first.textContent, 'Fortsæt oplæsning');
  assert.equal(toggleActiveNarration(engine, triggers, first), true);
  assert.equal(toggleActiveNarration(engine, triggers, second), undefined);
  assert.deepEqual(calls, ['pause', 'resume']);
});

test('triggerskift og stop gendanner de oprindelige noder, attributter og dataset', () => {
  const icon = { text: 'ikon' };
  const label = { text: 'Læs situationen op' };
  const first = new FakeTrigger([icon, label], { 'aria-label': 'Original label', 'aria-pressed': 'false' });
  const secondNode = { text: 'Lyt til svaret' };
  const second = new FakeTrigger([secondNode]);
  const triggers = createTriggerController('voice-panel');

  triggers.claim(first);
  triggers.update('playing');
  triggers.claim(second);
  assert.deepEqual(first.childNodes, [icon, label], 'de samme node-identiteter sættes tilbage');
  assert.equal(first.getAttribute('aria-label'), 'Original label');
  assert.equal(first.getAttribute('aria-pressed'), 'false');
  assert.equal(first.getAttribute('aria-controls'), null);
  assert.equal(first.dataset.voiceKind, 'lesson');

  triggers.update('stopped');
  assert.deepEqual(second.childNodes, [secondNode]);
  assert.equal(second.getAttribute('aria-label'), null);
  assert.equal(second.getAttribute('aria-pressed'), null);
  assert.equal(second.getAttribute('aria-controls'), null);
});

test('normalisering bruger NFC og samler al whitespace før stabil FNV64-nøgle', () => {
  assert.equal(normalizeVoiceText('  Bla\u030A\n\t bil  '), 'Blå bil');
  assert.equal(voiceKey('  Bla\u030A\n\t bil  '), voiceKey('Blå bil'));
  assert.match(voiceKey('Blå bil'), /^v1-[0-9a-f]{16}$/);
  assert.equal(voiceKey(''), 'v1-cbf29ce484222325');
});

test('manifest valideres med både nøgle, tekst og lokal mp3-kilde', () => {
  const text = 'Hold tilbage for cyklisten.';
  const key = voiceKey(text);
  const validPack = { clips: { [key]: { src: `assets/voice/${key}.mp3`, text } } };
  assert.deepEqual(resolveVoiceQueue([text], validPack).queue.map(item => item.text), [text]);

  assert.equal(resolveVoiceQueue(text, { clips: { [key]: { src: `assets/voice/${key}.mp3`, text: 'Kør videre.' } } }).ok, false);
  assert.equal(resolveVoiceQueue(text, { clips: { [key]: { src: 'https://example.test/voice.mp3', text } } }).ok, false);
  assert.equal(resolveVoiceQueue(text, { clips: { [key]: { src: 'assets/voice/../other.mp3', text } } }).ok, false);
});

test('køen springer tomme dele over og bevarer præcis rækkefølge og dubletter', () => {
  const texts = ['Først.', 'Dernæst.', 'Først.'];
  const clips = Object.fromEntries([...new Set(texts)].map(text => {
    const key = voiceKey(text);
    return [key, { src: `assets/voice/${key}.mp3`, text }];
  }));
  const result = resolveVoiceQueue([' ', texts[0], '\n', texts[1], texts[2]], { clips });
  assert.equal(result.ok, true);
  assert.deepEqual(result.queue.map(item => item.text), texts);
});

test('stop under ventende play gør både løfte og senere play-resultat uskadeligt', async () => {
  const audio = new FakeAudio();
  const states = [];
  const engine = createPlaybackEngine({ audio, onChange: state => states.push(state.phase) });
  const completion = engine.play([clip('a')]);
  engine.stop();
  audio.resolvePlay();
  await tick();
  assert.equal(await completion, false);
  assert.equal(engine.snapshot().phase, 'stopped');
  assert.equal(audio.src, '');
  assert.equal(states.at(-1), 'stopped');
});

test('ended og error fra en gammel session kan ikke ændre en nyere session', async () => {
  const audio = new FakeAudio();
  const notices = [];
  const engine = createPlaybackEngine({ audio, notify: text => notices.push(text) });
  const oldCompletion = engine.play([clip('old')]);
  const oldEnded = audio.listenersFor('ended')[0];
  const oldError = audio.listenersFor('error')[0];
  const newCompletion = engine.play([clip('new')]);
  oldEnded();
  audio.error = new Error('gammel fejl');
  oldError();
  audio.resolvePlay(0);
  audio.resolvePlay(0);
  await tick();
  assert.equal(await oldCompletion, false);
  assert.equal(engine.snapshot().text, 'new');
  assert.notEqual(engine.snapshot().phase, 'error');
  assert.deepEqual(notices, []);
  engine.stop();
  assert.equal(await newCompletion, false);
});

test('pause under overgang til næste klip forhindrer pending play i at genoptage', async () => {
  const audio = new FakeAudio();
  const engine = createPlaybackEngine({ audio });
  const completion = engine.play([clip('a'), clip('b')]);
  audio.resolvePlay();
  await tick();
  audio.ended = true;
  audio.emit('ended');
  assert.equal(audio.src, 'assets/voice/b.mp3');
  assert.equal(engine.pause(), true);
  audio.resolvePlay();
  await tick();
  assert.equal(engine.snapshot().phase, 'paused');
  assert.equal(engine.resume(), true);
  audio.resolvePlay();
  await tick();
  assert.equal(engine.snapshot().phase, 'playing');
  engine.stop();
  assert.equal(await completion, false);
});

test('afspilning følger køen og afslutter først efter sidste ended', async () => {
  const audio = new FakeAudio();
  const engine = createPlaybackEngine({ audio });
  const completion = engine.play([clip('en'), clip('to'), clip('tre')]);
  for (const expected of ['en', 'to', 'tre']) {
    assert.equal(audio.src, `assets/voice/${expected}.mp3`);
    audio.resolvePlay();
    await tick();
    audio.ended = true;
    audio.emit('ended');
  }
  assert.deepEqual(audio.played, ['assets/voice/en.mp3', 'assets/voice/to.mp3', 'assets/voice/tre.mp3']);
  assert.equal(await completion, true);
  assert.equal(engine.snapshot().phase, 'complete');
});

test('onPart følger cue-rækkefølgen og rydder callback ved afslutning', async () => {
  const audio = new FakeAudio();
  const cues = [];
  const engine = createPlaybackEngine({ audio });
  const completion = engine.play([clip('en'), clip('to')], { onPart: value => cues.push(value) });
  assert.deepEqual(cues, [0]);
  audio.resolvePlay();
  await tick();
  audio.ended = true;
  audio.emit('ended');
  assert.deepEqual(cues, [0, 1]);
  audio.resolvePlay();
  await tick();
  audio.ended = true;
  audio.emit('ended');
  assert.deepEqual(cues, [0, 1, null]);
  assert.equal(await completion, true);
  engine.dispose();
});

test('completed kø kan startes forfra med samme cue og trigger lease', async () => {
  const audio = new FakeAudio();
  const trigger = new FakeTrigger(['Læs situationen op']);
  const triggers = createTriggerController('voice-panel');
  const cues = [];
  const engine = createPlaybackEngine({
    audio,
    onChange: state => triggers.update(state.phase)
  });
  triggers.claim(trigger);
  const completion = engine.play([clip('færdig')], { onPart: value => cues.push(value) });
  audio.resolvePlay();
  await tick();
  audio.ended = true;
  audio.emit('ended');
  assert.equal(await completion, true);
  assert.equal(engine.snapshot().phase, 'complete');
  assert.equal(engine.restart(), true);
  triggers.claim(trigger);
  triggers.update(engine.snapshot().phase);
  assert.deepEqual(cues, [0, null, 0]);
  assert.equal(triggers.isActive(trigger), true);
  engine.stop();
  assert.equal(engine.restart(), false);
});

test('stale session kan kun rydde sin egen callback og aldrig fremhæve den nye', async () => {
  const audio = new FakeAudio();
  const oldCues = [];
  const newCues = [];
  const engine = createPlaybackEngine({ audio });
  const oldCompletion = engine.play([clip('old')], { onPart: value => oldCues.push(value) });
  const oldEnded = audio.listenersFor('ended')[0];
  const newCompletion = engine.play([clip('new')], { onPart: value => newCues.push(value) });
  assert.deepEqual(oldCues, [0, null]);
  assert.deepEqual(newCues, [0]);
  oldEnded();
  audio.resolvePlay(0);
  audio.resolvePlay(0);
  await tick();
  assert.deepEqual(oldCues, [0, null]);
  assert.deepEqual(newCues, [0]);
  engine.stop();
  assert.deepEqual(newCues, [0, null]);
  assert.equal(await oldCompletion, false);
  assert.equal(await newCompletion, false);
});

test('kun de fire tilladte hastigheder anvendes på aktiv og kommende lyd', () => {
  const audio = new FakeAudio();
  const engine = createPlaybackEngine({ audio });
  assert.equal(engine.setRate(1.15), true);
  assert.equal(audio.playbackRate, 1.15);
  engine.play([clip('a')]);
  assert.equal(audio.playbackRate, 1.15);
  assert.equal(engine.setRate(2), false);
  assert.equal(audio.playbackRate, 1.15);
  engine.stop();
});
