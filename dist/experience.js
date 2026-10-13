// Small, original earcons. All synthesis starts after a trusted user gesture.
export const CUES = Object.freeze({
  select: [[440, 0, .065, .026, 'sine']],
  node: [[392, 0, .09, .036, 'sine'], [587.33, .06, .11, .032, 'sine']],
  'card-advance': [[493.88, 0, .085, .025, 'sine'], [659.25, .065, .09, .026, 'sine']],
  step: [[523.25, 0, .12, .036, 'triangle'], [659.25, .075, .14, .03, 'sine']],
  correct: [[523.25, 0, .15, .045, 'triangle'], [659.25, .065, .17, .038, 'sine'], [783.99, .13, .23, .034, 'sine']],
  repair: [[349.23, 0, .15, .036, 'sine'], [329.63, .11, .17, .03, 'sine']],
  complete: [[523.25, 0, .19, .041, 'triangle'], [659.25, .095, .2, .035, 'sine'], [783.99, .19, .22, .032, 'sine'], [1046.5, .34, .38, .026, 'sine']],
  milestone: [[523.25, 0, .2, .037, 'sine'], [659.25, .08, .2, .033, 'sine'], [783.99, .16, .22, .03, 'sine'], [1046.5, .3, .4, .028, 'triangle']]
});

/** No autoplay, no queued sound after mute/navigation, and no piling up voices. */
export function createExperienceAudio({
  createContext = () => new (globalThis.AudioContext || globalThis.webkitAudioContext)(),
  enabled = () => true,
  suppressed = () => false,
  now = () => Date.now(),
  onPlay = () => {}
} = {}) {
  let context = null, disposed = false, generation = 0, lastAt = -Infinity, lastCue = '';
  const voices = new Set();
  function stop() {
    generation++;
    for (const voice of voices) {
      try { voice.gain.gain.cancelScheduledValues(context.currentTime); voice.gain.gain.setValueAtTime(0, context.currentTime); voice.osc.stop(); } catch {}
      voice.osc.disconnect(); voice.gain.disconnect();
    }
    voices.clear();
  }
  function arm() {
    if (disposed || !enabled() || suppressed()) return;
    try {
      context ||= createContext();
      if (context.state !== 'running') void context.resume().catch(() => {});
    } catch { context = null; }
  }
  async function play(cue) {
    const notes = CUES[cue];
    if (disposed || !context || !notes || !enabled() || suppressed()) return false;
    const stamp = now();
    if (cue === lastCue && stamp - lastAt < 85) return false;
    stop();
    const ticket = generation;
    try {
      if (context.state !== 'running') await context.resume();
      if (disposed || ticket !== generation || !enabled() || suppressed()) return false;
      const start = context.currentTime + .008;
      for (const [frequency, delay, duration, volume, type] of notes) {
        const osc = context.createOscillator(), gain = context.createGain();
        const voice = { osc, gain }; voices.add(voice);
        osc.type = type; osc.frequency.setValueAtTime(frequency, start + delay);
        gain.gain.setValueAtTime(0, start + delay);
        gain.gain.linearRampToValueAtTime(volume, start + delay + .008);
        gain.gain.exponentialRampToValueAtTime(.0001, start + delay + duration);
        osc.connect(gain); gain.connect(context.destination);
        osc.onended = () => { voices.delete(voice); osc.disconnect(); gain.disconnect(); };
        osc.start(start + delay); osc.stop(start + delay + duration + .02);
      }
      lastAt = stamp; lastCue = cue; onPlay(cue);
      return true;
    } catch { stop(); return false; }
  }
  return {
    arm, play, stop,
    dispose() { if (disposed) return; stop(); disposed = true; void context?.close()?.catch(() => {}); }
  };
}
