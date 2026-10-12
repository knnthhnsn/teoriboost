import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { normalizeVoiceText, voiceKey } from './dist/voice-key.js';

/** Fail closed before packaging: catalogue, manifest and actual assets must agree. */
export function validateVoicePack({ dist, catalogue, pack, production }) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(`voice: ${message}`); };
  check(pack?.status === 'complete', 'den offentlige lydpakke er ikke komplet');
  check(production?.status === 'complete', 'produktionsrapporten er ikke komplet');
  check(Array.isArray(production?.errors) && production.errors.length === 0, 'produktionsrapporten har fejl');
  const entries = catalogue?.entries;
  if (!Array.isArray(entries) || entries.length === 0) return { errors: [...errors, 'voice: tomt katalog'], clips: 0, bytes: 0, seconds: 0 };
  const speakerId = pack?.speakerId;
  if (typeof speakerId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(speakerId)) return { errors: [...errors, 'voice: ugyldigt speakerId'], clips: entries.length, bytes: 0, seconds: 0 };
  check(production?.speakerId === speakerId, 'manifest og rapport bruger forskellige stemmer');
  check(production?.completed === entries.length && production?.catalogueEntries === entries.length, 'forkert produktionsantal');
  const expected = new Set(entries.map(entry => entry.key));
  check(expected.size === entries.length, 'dubletnøgler i kataloget');
  for (const [name, clips] of [['manifest', pack?.clips], ['rapport', production?.clips]]) {
    check(clips && typeof clips === 'object' && !Array.isArray(clips), `${name} mangler klip`);
    for (const key of Object.keys(clips ?? {})) check(expected.has(key), `${name} har ukendt klip ${key}`);
    check(Object.keys(clips ?? {}).length === entries.length, `${name} dækker ikke hele kataloget`);
  }
  let bytes = 0;
  let seconds = 0;
  for (const entry of entries) {
    const key = entry.key;
    const text = normalizeVoiceText(entry.text);
    if (!/^v1-[0-9a-f]{16}$/.test(key) || !text || text !== entry.text || voiceKey(text) !== key) {
      errors.push(`voice: ugyldig katalogtekst/nøgle ${key}`);
      continue;
    }
    const clip = pack?.clips?.[key];
    const metadata = production?.clips?.[key];
    if (!clip || !metadata) {
      errors.push(`voice: manglende klip ${key}`);
      continue;
    }
    check(clip.text === text && metadata.text === text, `${key}: lydteksten er forældet`);
    check(typeof metadata.spokenText === 'string' && metadata.spokenText.trim().length > 0, `${key}: mangler udtaletekst`);
    const expectedSource = `assets/voice/${speakerId}/${key}.mp3`;
    if (clip.src !== expectedSource || metadata.src !== expectedSource) {
      errors.push(`voice: ${key}: forkert eller ekstern lydsti`);
      continue;
    }
    const file = path.resolve(dist, expectedSource);
    try {
      const stat = fs.lstatSync(file);
      // Reject linked files or linked parent directories, including links within dist.
      check(stat.isFile() && !stat.isSymbolicLink() && fs.realpathSync(file).toLowerCase() === file.toLowerCase(), `${key}: lydfilen er ikke en almindelig lokal fil`);
      check(stat.size > 256 && metadata.bytes === stat.size, `${key}: tom lydfil eller forkert størrelse`);
      check(Number.isFinite(metadata.duration) && metadata.duration > 0.1, `${key}: ugyldig varighed`);
      const hash = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      check(/^[0-9a-f]{64}$/.test(metadata.sha256 ?? '') && hash === metadata.sha256, `${key}: lydfilens hash matcher ikke`);
      bytes += stat.size;
      seconds += Number.isFinite(metadata.duration) ? metadata.duration : 0;
    } catch {
      errors.push(`voice: ${key}: lydfilen mangler eller kan ikke læses`);
    }
  }
  const voiceRoot = path.resolve(dist, 'assets/voice');
  const inspect = directory => {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isSymbolicLink()) errors.push(`voice: link i lydmappen ${path.relative(dist, file)}`);
      else if (item.isDirectory()) inspect(file);
      else if (/\.(?:raw\.(?:mp3|wav)|encoding\.mp3|tmp)$/.test(item.name)) errors.push(`voice: ufærdig produktionsfil ${path.relative(dist, file)}`);
      else if (item.name.endsWith('.mp3')) {
        const relative = path.relative(dist, file).split(path.sep).join('/');
        const key = path.basename(file, '.mp3');
        check(expected.has(key) && relative === `assets/voice/${speakerId}/${key}.mp3`, `uventet MP3-fil ${relative}`);
      }
    }
  };
  if (fs.existsSync(voiceRoot)) {
    if (fs.lstatSync(voiceRoot).isSymbolicLink() || fs.realpathSync(voiceRoot).toLowerCase() !== voiceRoot.toLowerCase()) errors.push('voice: lydmappen er et link');
    else inspect(voiceRoot);
  }
  return { errors, clips: entries.length, bytes, seconds };
}
