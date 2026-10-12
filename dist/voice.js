import { normalizeVoiceText, voiceKey } from './voice-key.js';

export const VOICE_RATES = Object.freeze([0.9, 1, 1.15, 1.25]);

const noop = () => {};

function isLocalVoiceSource(src) {
  if (typeof src !== 'string') return false;
  const clean = src.trim().replace(/\\/g, '/');
  return /^(?:\.\/)?assets\/voice\/[A-Za-z0-9][A-Za-z0-9._/-]*\.mp3(?:[?#][A-Za-z0-9._~!$&'()*+,;=:@/?%-]*)?$/.test(clean)
    && !clean.split(/[?#]/, 1)[0].split('/').includes('..');
}

/** Validate a complete request before playback, preserving duplicates and order. */
export function resolveVoiceQueue(parts, pack) {
  const values = typeof parts === 'string' ? [parts] : Array.isArray(parts) ? parts : null;
  if (!values || values.some(value => typeof value !== 'string')) {
    return { ok: false, queue: [], texts: [], reason: 'invalid-input' };
  }

  const texts = values.map(normalizeVoiceText).filter(Boolean);
  if (!texts.length) return { ok: false, queue: [], texts, reason: 'empty' };

  const clips = pack?.clips;
  if (!clips || typeof clips !== 'object') {
    return { ok: false, queue: [], texts, reason: 'invalid-pack' };
  }

  const queue = [];
  for (const text of texts) {
    const key = voiceKey(text);
    const clip = clips[key];
    const manifestText = normalizeVoiceText(clip?.text);
    const valid = clip
      && manifestText === text
      && voiceKey(manifestText) === key
      && isLocalVoiceSource(clip.src);

    if (!valid) return { ok: false, queue: [], texts, reason: 'missing-or-stale', key, text };
    queue.push({ key, text, src: clip.src.trim().replace(/\\/g, '/') });
  }

  return { ok: true, queue, texts };
}

function sourceMatches(audio, expected) {
  const attribute = audio.getAttribute?.('src');
  if (attribute != null) return attribute === expected;
  const actual = String(audio.src || '');
  return actual === expected || actual.endsWith(`/${expected.replace(/^\.\//, '')}`);
}

/** DOM-free playback state machine. Exported for deterministic Node tests. */
export function createPlaybackEngine({ audio, onChange = noop, notify = noop } = {}) {
  if (!audio || typeof audio.play !== 'function' || typeof audio.pause !== 'function') {
    throw new TypeError('createPlaybackEngine kræver et audio-lignende objekt');
  }

  let queue = [];
  let index = -1;
  let session = 0;
  let clipGeneration = 0;
  let playAttempt = 0;
  let paused = false;
  let disposed = false;
  let rate = 1;
  let label = '';
  let phase = 'idle';
  let settle = null;
  let unbind = noop;
  let onPart = noop;
  let partActive = false;

  const snapshot = () => ({
    phase,
    index,
    total: queue.length,
    text: queue[index]?.text || '',
    label,
    rate,
    paused
  });
  const emit = () => onChange(snapshot());

  function finish(value) {
    const done = settle;
    settle = null;
    done?.(value);
  }

  function notifyPart(value, callback = onPart) {
    if (typeof callback !== 'function') return;
    try { callback(value); } catch { /* A cue observer must not strand playback. */ }
  }

  function detach() {
    unbind();
    unbind = noop;
  }

  function invalidateMedia({ clearSource = false } = {}) {
    const previousOnPart = onPart;
    onPart = noop;
    if (partActive) notifyPart(null, previousOnPart);
    partActive = false;
    session += 1;
    clipGeneration += 1;
    playAttempt += 1;
    detach();
    audio.pause();
    if (clearSource) {
      if (typeof audio.removeAttribute === 'function') audio.removeAttribute('src');
      else audio.src = '';
      audio.load?.();
    }
  }

  function fail(message) {
    invalidateMedia();
    paused = false;
    phase = 'error';
    emit();
    notify(message);
    finish(false);
  }

  function startClip(sessionAtStart) {
    if (disposed || sessionAtStart !== session) return;
    if (index >= queue.length) {
      detach();
      if (partActive) notifyPart(null);
      partActive = false;
      phase = 'complete';
      paused = false;
      emit();
      finish(true);
      return;
    }

    const clip = queue[index];
    const generation = ++clipGeneration;
    detach();
    audio.pause();
    audio.src = clip.src;
    audio.playbackRate = rate;
    audio.load?.();

    const stillCurrent = () => !disposed
      && sessionAtStart === session
      && generation === clipGeneration
      && sourceMatches(audio, clip.src);

    if (stillCurrent()) {
      partActive = true;
      notifyPart(index);
    }
    if (!stillCurrent()) return;

    const onEnded = () => {
      if (!stillCurrent() || paused) return;
      if ('ended' in audio && audio.ended === false) return;
      detach();
      index += 1;
      phase = 'loading';
      emit();
      startClip(sessionAtStart);
    };
    const onError = () => {
      if (!stillCurrent()) return;
      if ('error' in audio && audio.error == null) return;
      fail('Oplæsningen kunne ikke afspilles. Teksten står stadig på skærmen.');
    };
    audio.addEventListener?.('ended', onEnded);
    audio.addEventListener?.('error', onError);
    unbind = () => {
      audio.removeEventListener?.('ended', onEnded);
      audio.removeEventListener?.('error', onError);
    };

    phase = paused ? 'paused' : 'loading';
    emit();
    if (paused) return;

    const attempt = ++playAttempt;
    let result;
    try {
      result = audio.play();
    } catch {
      if (stillCurrent()) fail('Oplæsningen kunne ikke starte. Teksten står stadig på skærmen.');
      return;
    }
    Promise.resolve(result).then(() => {
      if (!stillCurrent() || attempt !== playAttempt || paused) return;
      phase = 'playing';
      emit();
    }, () => {
      if (!stillCurrent() || attempt !== playAttempt) return;
      fail('Oplæsningen kunne ikke starte. Teksten står stadig på skærmen.');
    });
  }

  function play(nextQueue, options = {}) {
    if (disposed || !Array.isArray(nextQueue) || !nextQueue.length) return Promise.resolve(false);
    invalidateMedia();
    finish(false);
    queue = nextQueue.map(clip => ({ ...clip }));
    onPart = typeof options.onPart === 'function' ? options.onPart : noop;
    index = 0;
    label = typeof options.label === 'string' ? options.label : '';
    paused = false;
    phase = 'loading';
    const ownSession = session;
    const completion = new Promise(resolve => { settle = resolve; });
    startClip(ownSession);
    return completion;
  }

  function pause() {
    if (disposed || paused || !['loading', 'playing'].includes(phase)) return false;
    paused = true;
    playAttempt += 1;
    audio.pause();
    phase = 'paused';
    emit();
    return true;
  }

  function resume() {
    if (disposed || !paused || !queue[index]) return false;
    paused = false;
    audio.playbackRate = rate;
    phase = 'loading';
    emit();
    const ownSession = session;
    const ownGeneration = clipGeneration;
    const attempt = ++playAttempt;
    let result;
    try {
      result = audio.play();
    } catch {
      fail('Oplæsningen kunne ikke fortsætte. Teksten står stadig på skærmen.');
      return false;
    }
    Promise.resolve(result).then(() => {
      if (disposed || ownSession !== session || ownGeneration !== clipGeneration || attempt !== playAttempt || paused) return;
      phase = 'playing';
      emit();
    }, () => {
      if (disposed || ownSession !== session || ownGeneration !== clipGeneration || attempt !== playAttempt) return;
      fail('Oplæsningen kunne ikke fortsætte. Teksten står stadig på skærmen.');
    });
    return true;
  }

  function restart() {
    if (disposed || !queue.length || (!settle && phase !== 'complete')) return false;
    const restartOnPart = onPart;
    invalidateMedia();
    onPart = restartOnPart;
    index = 0;
    paused = false;
    phase = 'loading';
    const ownSession = session;
    startClip(ownSession);
    return true;
  }

  function stop() {
    if (disposed) return false;
    const wasActive = Boolean(settle) || !['idle', 'stopped'].includes(phase);
    invalidateMedia({ clearSource: true });
    queue = [];
    index = -1;
    paused = false;
    phase = 'stopped';
    emit();
    finish(false);
    return wasActive;
  }

  function setRate(nextRate) {
    const parsed = Number(nextRate);
    if (!VOICE_RATES.includes(parsed)) return false;
    rate = parsed;
    audio.playbackRate = rate;
    emit();
    return true;
  }

  function dispose() {
    if (disposed) return;
    stop();
    disposed = true;
    detach();
  }

  return { play, pause, resume, restart, stop, setRate, dispose, snapshot };
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  return element;
}

function setButton(button, { text, label, pressed } = {}) {
  if (text != null) button.textContent = text;
  if (label != null) button.setAttribute('aria-label', label);
  if (pressed != null) button.setAttribute('aria-pressed', String(pressed));
}

/** Preserve the exact trigger children while presenting local pause/resume state. */
export function createTriggerController(controlsId) {
  let lease = null;

  function restoreAttribute(trigger, name, value) {
    if (value == null) trigger.removeAttribute(name);
    else trigger.setAttribute(name, value);
  }

  function release() {
    if (!lease) return;
    const { trigger, nodes, attributes } = lease;
    trigger.replaceChildren(...nodes);
    for (const [name, value] of Object.entries(attributes)) restoreAttribute(trigger, name, value);
    lease = null;
  }

  function claim(trigger) {
    if (lease?.trigger === trigger) return true;
    release();
    if (!trigger || typeof trigger.replaceChildren !== 'function' || typeof trigger.setAttribute !== 'function') return false;
    lease = {
      trigger,
      nodes: [...trigger.childNodes],
      attributes: {
        'aria-label': trigger.getAttribute('aria-label'),
        'aria-pressed': trigger.getAttribute('aria-pressed'),
        'aria-controls': trigger.getAttribute('aria-controls')
      }
    };
    trigger.replaceChildren();
    trigger.setAttribute('aria-pressed', 'true');
    trigger.setAttribute('aria-controls', controlsId);
    return true;
  }

  function update(phase) {
    if (!lease) return;
    if (['complete', 'error', 'stopped'].includes(phase)) {
      release();
      return;
    }
    if (!['loading', 'playing', 'paused'].includes(phase)) return;
    const paused = phase === 'paused';
    const label = paused ? 'Fortsæt oplæsning' : 'Pause oplæsning';
    lease.trigger.textContent = label;
    lease.trigger.setAttribute('aria-label', label);
  }

  return {
    claim,
    update,
    release,
    isActive: trigger => Boolean(lease && lease.trigger === trigger)
  };
}

/** Returns undefined when the click should start a new narration. */
export function toggleActiveNarration(engine, triggers, trigger) {
  if (!trigger || !triggers?.isActive(trigger)) return undefined;
  const phase = engine.snapshot().phase;
  if (phase === 'loading' || phase === 'playing') return engine.pause();
  if (phase === 'paused') return engine.resume();
  return undefined;
}

/** Build the visible player. Calling this function never starts audio. */
export function createNarrator({ host, audio, pack, notify = noop } = {}) {
  if (!host || !audio) throw new TypeError('createNarrator kræver host og audio');
  const safeNotify = message => {
    try { notify(message); } catch { /* A toast failure must not strand playback state. */ }
  };

  host.replaceChildren();
  host.classList.add('voice-player');
  host.hidden = true;
  host.setAttribute('aria-label', 'Dansk oplæsning');
  if (!host.id) host.id = 'voice-panel';

  const head = makeElement('div', 'voice-head');
  const identity = makeElement('div', 'voice-identity');
  const titleRow = makeElement('div', 'voice-title-row');
  titleRow.append(makeElement('strong', 'voice-title', pack?.label || 'Dansk AI-stemme'));
  titleRow.append(makeElement('span', 'voice-ai-badge', 'AI-STEMME'));
  identity.append(titleRow, makeElement('span', 'voice-speaker', pack?.speaker || 'Dansk oplæser'));
  const status = makeElement('p', 'voice-status', 'Klar');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  head.append(identity, status);

  const transcript = makeElement('p', 'voice-transcript');
  transcript.setAttribute('aria-label', 'Tekst til oplæsning');

  const controls = makeElement('div', 'voice-controls');
  const toggle = makeElement('button', 'voice-control voice-control-primary', 'Pause');
  toggle.type = 'button';
  setButton(toggle, { label: 'Sæt oplæsning på pause', pressed: false });
  const restart = makeElement('button', 'voice-control', 'Start forfra');
  restart.type = 'button';
  const stopButton = makeElement('button', 'voice-control', 'Stop');
  stopButton.type = 'button';
  const rateLabel = makeElement('label', 'voice-rate-label');
  rateLabel.append(makeElement('span', 'voice-rate-caption', 'HASTIGHED'));
  const rateSelect = makeElement('select', 'voice-rate');
  rateSelect.setAttribute('aria-label', 'Oplæsningshastighed');
  for (const value of VOICE_RATES) {
    const option = makeElement('option', '', `${String(value).replace('.', ',')}×`);
    option.value = String(value);
    if (value === 1) option.selected = true;
    rateSelect.append(option);
  }
  rateLabel.append(rateSelect);
  controls.append(toggle, restart, stopButton, rateLabel);
  host.append(head, transcript, controls);

  let lastQueue = [];
  let lastTrigger = null;
  const triggers = createTriggerController(host.id);

  const statusText = state => {
    if (state.phase === 'loading') return `Gør klar · ${state.index + 1} af ${state.total}`;
    if (state.phase === 'playing') return `Afspiller · ${state.index + 1} af ${state.total}`;
    if (state.phase === 'paused') return `På pause · ${state.index + 1} af ${state.total}`;
    if (state.phase === 'complete') return 'Oplæsning færdig';
    if (state.phase === 'error') return 'Oplæsning ikke tilgængelig';
    if (state.phase === 'stopped') return 'Oplæsning stoppet';
    return 'Klar';
  };

  const engine = createPlaybackEngine({
    audio,
    notify: safeNotify,
    onChange(state) {
      status.textContent = statusText(state);
      host.setAttribute('aria-busy', String(state.phase === 'loading'));
      const isPaused = state.phase === 'paused';
      setButton(toggle, {
        text: isPaused ? 'Fortsæt' : 'Pause',
        label: isPaused ? 'Fortsæt oplæsning' : 'Sæt oplæsning på pause',
        pressed: isPaused
      });
      toggle.disabled = !['loading', 'playing', 'paused'].includes(state.phase);
      restart.disabled = !lastQueue.length || ['error', 'stopped'].includes(state.phase);
      triggers.update(state.phase);
    }
  });

  toggle.addEventListener('click', () => {
    if (engine.snapshot().phase === 'paused') engine.resume();
    else engine.pause();
  });
  restart.addEventListener('click', () => {
    if (engine.snapshot().phase !== 'complete' || !lastQueue.length) return;
    const claimed = lastTrigger ? triggers.claim(lastTrigger) : false;
    const restarted = engine.restart();
    if (restarted) triggers.update(engine.snapshot().phase);
    else if (claimed) triggers.release();
  });
  stopButton.addEventListener('click', () => stop());
  rateSelect.addEventListener('change', () => engine.setRate(Number(rateSelect.value)));

  async function read(parts, options = {}) {
    const toggled = toggleActiveNarration(engine, triggers, options?.trigger);
    if (toggled !== undefined) return toggled;

    const result = resolveVoiceQueue(parts, pack);
    const requestedLabel = normalizeVoiceText(options?.label || '');
    transcript.textContent = result.texts.join(' ');
    host.hidden = false;

    if (!result.ok) {
      lastQueue = [];
      lastTrigger = null;
      engine.stop();
      restart.disabled = true;
      triggers.release();
      status.textContent = result.reason === 'empty' ? 'Ingen tekst at læse op' : 'Oplæsning ikke tilgængelig';
      if (result.reason !== 'empty') safeNotify('Oplæsningen findes ikke til denne tekst endnu. Teksten står stadig på skærmen.');
      return false;
    }

    lastQueue = result.queue;
    lastTrigger = options?.trigger || null;
    triggers.claim(options?.trigger);
    return engine.play(result.queue, {
      label: requestedLabel,
      onPart: options?.onPart
    });
  }

  function stop() {
    const stopped = engine.stop();
    triggers.release();
    lastQueue = [];
    lastTrigger = null;
    host.hidden = true;
    return stopped;
  }

  function dispose() {
    engine.dispose();
    triggers.release();
    host.replaceChildren();
    host.hidden = true;
    host.classList.remove('voice-player');
  }

  return { read, stop, dispose };
}
