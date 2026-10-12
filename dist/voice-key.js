const FNV_OFFSET_64 = 0xcbf29ce484222325n;
const FNV_PRIME_64 = 0x100000001b3n;
const UINT64_MASK = 0xffffffffffffffffn;

/** Normalise exactly as the voice pack generator does. */
export function normalizeVoiceText(value) {
  if (typeof value !== 'string') return '';
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ');
}

/**
 * Stable FNV-1a 64-bit key over JavaScript UTF-16 code units.
 * The v1 prefix makes future hashing changes explicit.
 */
export function voiceKey(value) {
  const text = normalizeVoiceText(value);
  let hash = FNV_OFFSET_64;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= BigInt(text.charCodeAt(index));
    hash = (hash * FNV_PRIME_64) & UINT64_MASK;
  }
  return `v1-${hash.toString(16).padStart(16, '0')}`;
}
