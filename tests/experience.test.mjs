import test from 'node:test';
import assert from 'node:assert/strict';
import { CUES, createExperienceAudio } from '../dist/experience.js';
import { blankState, restoreState } from '../dist/core.js';

function audioFixture() {
  const oscillators = [], gains = [];
  const parameter = () => ({ calls: [], setValueAtTime(...args) { this.calls.push(['set', ...args]); }, linearRampToValueAtTime(...args) { this.calls.push(['linear', ...args]); }, exponentialRampToValueAtTime(...args) { this.calls.push(['exponential', ...args]); }, cancelScheduledValues(...args) { this.calls.push(['cancel', ...args]); } });
  const context = {
    state: 'running', currentTime: 5, destination: {}, closed: false,
    resume: async () => {}, close: async () => { context.closed = true; },
    createOscillator() { const osc = { frequency: parameter(), starts: [], stops: [], connect() {}, disconnect() { this.disconnected = true; }, start(at) { this.starts.push(at); }, stop(at) { this.stops.push(at); } }; oscillators.push(osc); return osc; },
    createGain() { const gain = { gain: parameter(), connect() {}, disconnect() { this.disconnected = true; } }; gains.push(gain); return gain; }
  };
  return { context, oscillators, gains };
}

test('fresh profile enables earcons; explicit saved mute and motion preferences survive', () => {
  assert.equal(blankState().settings.sound, true);
  const saved = { ...blankState(), settings: { sound: false, motion: false, humor: false } };
  assert.deepEqual(restoreState(saved).settings, saved.settings);
});

test('mount and play requests cannot create audio before an explicit arm', async () => {
  let created = 0; const fixture = audioFixture();
  const sound = createExperienceAudio({ createContext: () => { created++; return fixture.context; } });
  assert.equal(await sound.play('complete'), false);
  assert.equal(created, 0); assert.equal(fixture.oscillators.length, 0);
  sound.arm(); assert.equal(created, 1);
  assert.equal(await sound.play('select'), true);
  assert.equal(fixture.oscillators.length, 1);
});

test('mute and active-exam suppression prevent arming and synthesis', async () => {
  let muted = true, exam = false, created = 0; const fixture = audioFixture();
  const sound = createExperienceAudio({ enabled: () => !muted, suppressed: () => exam, createContext: () => { created++; return fixture.context; } });
  sound.arm(); assert.equal(created, 0);
  muted = false; exam = true; sound.arm(); assert.equal(created, 0);
  exam = false; sound.arm(); assert.equal(created, 1);
  exam = true; assert.equal(await sound.play('correct'), false);
  exam = false; muted = true; assert.equal(await sound.play('complete'), false);
  assert.equal(fixture.oscillators.length, 0);
});

test('pending context resume cannot queue a cue after stop or mute', async () => {
  const fixture = audioFixture(); let settle;
  fixture.context.state = 'suspended';
  fixture.context.resume = () => new Promise(resolve => { settle = resolve; });
  const sound = createExperienceAudio({ createContext: () => fixture.context });
  sound.arm(); const pending = sound.play('complete');
  sound.stop(); settle();
  assert.equal(await pending, false); assert.equal(fixture.oscillators.length, 0);
});

test('fast duplicate presses are coalesced and new cues stop earlier voices', async () => {
  const fixture = audioFixture(); let stamp = 100;
  const sound = createExperienceAudio({ createContext: () => fixture.context, now: () => stamp });
  sound.arm(); assert.equal(await sound.play('select'), true);
  assert.equal(await sound.play('select'), false); assert.equal(fixture.oscillators.length, 1);
  stamp += 100; assert.equal(await sound.play('correct'), true);
  assert.equal(fixture.oscillators[0].stops.length, 2);
  assert.equal(fixture.oscillators[0].disconnected, true);
  assert.equal(fixture.oscillators.length, 4);
});

test('all earcons are bounded, gain-envelope synthesis ends, and dispose is final', async () => {
  for (const notes of Object.values(CUES)) for (const [hz, delay, duration, gain] of notes) {
    assert.ok(hz >= 300 && hz <= 1100); assert.ok(delay + duration < .8);
    assert.ok(gain > 0 && gain <= .05);
  }
  const fixture = audioFixture(); const sound = createExperienceAudio({ createContext: () => fixture.context });
  sound.arm(); assert.equal(await sound.play('complete'), true);
  assert.equal(fixture.oscillators.length, 4);
  for (const oscillator of fixture.oscillators) assert.ok(oscillator.stops[0] > oscillator.starts[0]);
  sound.dispose(); sound.dispose(); sound.arm();
  assert.equal(await sound.play('select'), false); assert.equal(fixture.context.closed, true);
  assert.ok(fixture.gains.every(gain => gain.gain.calls.some(call => call[0] === 'cancel')));
});
