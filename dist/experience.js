// TeoriBoost sound set. Every cue is designed and mastered in docs/redesign/sound/synth.py
// and shipped as a small mono MP3. Nothing is fetched or played before a trusted user gesture.

/** cue -> priority. A new cue fades out voices of the same or lower priority, so a tap never
 *  cuts off a celebration, but two celebrations never pile up. */
export const CUES = Object.freeze({
  select: 1, nav: 1, node: 1, 'card-advance': 1, 'toggle-on': 1, 'toggle-off': 1, color: 1,
  step: 2, correct: 2, repair: 2, 'exam-fail': 2,
  paint: 2, part: 2, wheels: 2, neon: 2, lower: 2, plate: 2,
  'rev-scooter': 2, 'rev-smallcar': 2, 'rev-bigcar': 2, 'rev-racecar': 2,
  booster: 3, buy: 3, complete: 3, milestone: 3, 'exam-pass': 3
});
/** Taps get a hair of random pitch so repeated presses sound played, not machine-gunned. */
const HUMANIZE = new Set(['select', 'nav', 'node', 'card-advance', 'toggle-on', 'toggle-off', 'part', 'paint', 'plate']);
/** Fetched right after the first gesture; everything else loads on first use. */
const WARM = ['select', 'nav', 'correct', 'repair', 'step', 'node', 'card-advance', 'complete'];
export const cueUrl = cue => `assets/sfx/${cue}.mp3`;

export function createExperienceAudio({
  createContext = () => new (globalThis.AudioContext || globalThis.webkitAudioContext)(),
  fetchCue = cue => fetch(cueUrl(cue)).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }),
  enabled = () => true,
  suppressed = () => false,
  now = () => Date.now(),
  random = Math.random,
  onPlay = () => {}
} = {}) {
  let context = null, out = null, disposed = false, generation = 0, lastAt = -Infinity, lastCue = '';
  const voices = new Set(), buffers = new Map();

  function load(cue) {
    if (!buffers.has(cue)) {
      buffers.set(cue, Promise.resolve().then(() => fetchCue(cue))
        .then(data => new Promise((resolve, reject) => {
          const p = context.decodeAudioData(data, resolve, reject); // callback form for older Safari
          if (p?.then) p.then(resolve, reject);
        }))
        .catch(() => { buffers.delete(cue); return null; }));
    }
    return buffers.get(cue);
  }
  function release(voice, at = 0) {
    voices.delete(voice);
    try {
      const t = context.currentTime;
      voice.gain.gain.cancelScheduledValues(t);
      voice.gain.gain.setValueAtTime(voice.gain.gain.value ?? 1, t);
      voice.gain.gain.linearRampToValueAtTime(0, t + at);
      voice.source.stop(t + at + .01);
    } catch {}
  }
  function stop() {
    generation++;
    for (const voice of [...voices]) release(voice, .03);
  }
  function arm() {
    if (disposed || !enabled() || suppressed()) return;
    try {
      if (!context) {
        context = createContext();
        // master bus: a gentle glue compressor that also catches overlapping cues before they clip
        out = context.createGain(); out.gain.value = .9;
        const limiter = context.createDynamicsCompressor?.();
        if (limiter) {
          limiter.threshold.value = -10; limiter.knee.value = 6; limiter.ratio.value = 8;
          limiter.attack.value = .003; limiter.release.value = .12;
          out.connect(limiter); limiter.connect(context.destination);
        } else out.connect(context.destination);
        for (const cue of WARM) void load(cue);
      }
      if (context.state !== 'running') void context.resume().catch(() => {});
    } catch { context = null; }
  }
  async function play(cue, { rate = 1, delay = 0, gain = 1 } = {}) {
    const priority = CUES[cue];
    if (disposed || !context || !priority || !enabled() || suppressed()) return false;
    const stamp = now();
    if (cue === lastCue && stamp - lastAt < 85) return false;
    lastAt = stamp; lastCue = cue;
    for (const voice of [...voices]) if (voice.priority <= priority) release(voice, .04);
    const ticket = generation; // only stop() (mute, navigation, voice-over) cancels a pending cue
    try {
      if (context.state !== 'running') await context.resume();
      const buffer = await load(cue);
      if (!buffer || disposed || ticket !== generation || !enabled() || suppressed()) return false;
      const source = context.createBufferSource(), level = context.createGain();
      source.buffer = buffer;
      source.playbackRate.value = rate * (HUMANIZE.has(cue) ? 1 + (random() - .5) * .05 : 1);
      level.gain.value = gain;
      source.connect(level); level.connect(out);
      const voice = { source, gain: level, priority }; voices.add(voice);
      source.onended = () => { voices.delete(voice); try { source.disconnect(); level.disconnect(); } catch {} };
      source.start(context.currentTime + .005 + delay);
      onPlay(cue);
      return true;
    } catch { return false; }
  }
  return {
    arm, play, stop,
    dispose() { if (disposed) return; stop(); disposed = true; void context?.close()?.catch(() => {}); }
  };
}
