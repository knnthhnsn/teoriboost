import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { CUES, cueUrl, createExperienceAudio } from '../dist/experience.js';
import { blankState, restoreState } from '../dist/core.js';

function audioFixture() {
  const sources = [], fetched = [];
  const parameter = (value = 1) => ({ value, calls: [], setValueAtTime(...a) { this.calls.push(['set', ...a]); }, linearRampToValueAtTime(...a) { this.calls.push(['linear', ...a]); }, cancelScheduledValues(...a) { this.calls.push(['cancel', ...a]); } });
  const node = extra => ({ connect() {}, disconnect() { this.disconnected = true; }, ...extra });
  const context = {
    state: 'running', currentTime: 5, destination: {}, closed: false,
    resume: async () => {}, close: async () => { context.closed = true; },
    decodeAudioData: async data => ({ duration: 0.5, data }),
    createGain: () => node({ gain: parameter() }),
    createDynamicsCompressor: () => node({ threshold: parameter(), knee: parameter(), ratio: parameter(), attack: parameter(), release: parameter() }),
    createBufferSource() { const s = node({ playbackRate: parameter(), starts: [], stops: [], start(at) { this.starts.push(at); }, stop(at) { this.stops.push(at); } }); sources.push(s); return s; }
  };
  const fetchCue = async cue => { fetched.push(cue); return { cue }; };
  return { context, sources, fetched, fetchCue };
}

test('fresh profile enables sounds; explicit saved mute and motion preferences survive', () => {
  assert.equal(blankState().settings.sound, true);
  const saved = { ...blankState(), settings: { sound: false, motion: false, humor: false } };
  assert.deepEqual(restoreState(saved).settings, saved.settings);
});

test('nothing is created or fetched before an explicit arm', async () => {
  let created = 0; const f = audioFixture();
  const sound = createExperienceAudio({ createContext: () => { created++; return f.context; }, fetchCue: f.fetchCue });
  assert.equal(await sound.play('complete'), false);
  assert.equal(created, 0); assert.equal(f.fetched.length, 0);
  sound.arm(); assert.equal(created, 1);
  assert.equal(await sound.play('select'), true);
  assert.equal(f.sources.length, 1);
});

test('mute and active-exam suppression prevent arming and playback', async () => {
  let muted = true, exam = false, created = 0; const f = audioFixture();
  const sound = createExperienceAudio({ enabled: () => !muted, suppressed: () => exam, createContext: () => { created++; return f.context; }, fetchCue: f.fetchCue });
  sound.arm(); assert.equal(created, 0);
  muted = false; exam = true; sound.arm(); assert.equal(created, 0);
  exam = false; sound.arm(); assert.equal(created, 1);
  exam = true; assert.equal(await sound.play('correct'), false);
  exam = false; muted = true; assert.equal(await sound.play('complete'), false);
  assert.equal(f.sources.length, 0);
});

test('a pending load cannot play after stop', async () => {
  const f = audioFixture(); let settle;
  const sound = createExperienceAudio({ createContext: () => f.context, fetchCue: () => new Promise(r => { settle = r; }) });
  sound.arm(); const pending = sound.play('milestone');
  sound.stop(); await new Promise(r => setTimeout(r, 5)); settle({});
  assert.equal(await pending, false); assert.equal(f.sources.length, 0);
});

test('duplicate presses coalesce; taps never cut a celebration, celebrations replace taps', async () => {
  const f = audioFixture(); let stamp = 100;
  const sound = createExperienceAudio({ createContext: () => f.context, fetchCue: f.fetchCue, now: () => stamp });
  sound.arm();
  assert.equal(await sound.play('select'), true);
  assert.equal(await sound.play('select'), false);
  stamp += 100; assert.equal(await sound.play('complete'), true);
  assert.equal(f.sources[0].stops.length, 1, 'the tap fades out under the celebration');
  stamp += 100; assert.equal(await sound.play('select'), true);
  assert.equal(f.sources[1].stops.length, 0, 'a tap leaves the celebration ringing');
});

test('every cue ships as a small mastered file, and dispose is final', async () => {
  for (const [cue, priority] of Object.entries(CUES)) {
    const file = new URL('../dist/' + cueUrl(cue), import.meta.url);
    assert.ok(existsSync(file), cue + ' is missing');
    assert.ok(statSync(file).size > 1000 && statSync(file).size < 40000, cue + ' size');
    assert.ok([1, 2, 3].includes(priority));
  }
  const f = audioFixture(); const sound = createExperienceAudio({ createContext: () => f.context, fetchCue: f.fetchCue });
  sound.arm(); assert.equal(await sound.play('complete'), true);
  sound.dispose(); sound.dispose(); sound.arm();
  assert.equal(await sound.play('select'), false); assert.equal(f.context.closed, true);
});
