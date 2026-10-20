/**
 * TeoriBoost cast: six original 2D characters (generated with Codex image_gen from our own briefs,
 * see docs/redesign/characters-v4). Each character has one job in the learning loop, and its
 * line always supports the explanation; it never replaces it.
 */
const ROOT = 'assets/cast/';

export const CAST = Object.freeze({
  sneglen: Object.freeze({ name: 'Sneglen', role: 'Din rolige guide', src: `${ROOT}sneglen.webp` }),
  kegle: Object.freeze({ name: 'Kegle', role: 'Vakler, men vælter aldrig', src: `${ROOT}kegle.webp` }),
  blink: Object.freeze({ name: 'Blink', role: 'Lyser op, når du ser det rigtige', src: `${ROOT}blink.webp` }),
  bobbel: Object.freeze({ name: 'Bobbel', role: 'Fejrer de store øjeblikke', src: `${ROOT}bobbel.webp` }),
  krabbe: Object.freeze({ name: 'Krabbe', role: 'Byder dig velkommen tilbage', src: `${ROOT}krabbe.webp` }),
  daek: Object.freeze({ name: 'Dæk', role: 'Din træner til øveprøven', src: `${ROOT}daek.webp` }),
});
export const CAST_SIZE = 512;

const LINES = Object.freeze({
  home: ['Hastighed er ikke en personlighed. Én regel ad gangen.', 'Roligt nu. Vi tager næste stræk sammen.', 'Fem minutter i dag slår en hel aften før prøven.'],
  comeback: ['Nå, du er tilbage! Jeg er lige flyttet ind igen.', 'Velkommen tilbage. Vi starter, hvor du slap.'],
  correct: ['Blinket i god tid. Præcis rigtigt.', 'Sådan. Den sidder.', 'Du så det, før det blev farligt.'],
  wrong: ['Jeg vakler også. Men vi vælter ikke.', 'Tæt på! Kig på reglen, så tager vi den igen.', 'En fejl her er en fejl mindre til prøven.'],
  missions: ['Korte runder. Lange eftervirkninger.'],
  exam: ['25 situationer, én ad gangen. Du må gerne gå tilbage og ændre svar.'],
  pass: ['Inden for grænsen! Jeg hopper på baghjulene.'],
  fail: ['Vi kører en tur mere. Forklaringerne viser vejen.'],
});

/** Pick a stable line for a moment, so re-renders don't shuffle the text under the reader. */
export function castLine(moment, seed = '') {
  const lines = LINES[moment] || LINES.home;
  let hash = 0;
  for (const character of String(seed)) hash = (hash * 31 + character.codePointAt(0)) >>> 0;
  return lines[hash % lines.length];
}

const SIZES = new Set(['xs', 'sm', 'md', 'lg']);
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

/**
 * A character with an optional speech bubble. The image is decorative (empty alt); the line is real
 * text, so screen readers get the words without a description of a cartoon.
 */
export function renderCast(id, { size = 'md', line = '', mood = '', priority = false } = {}) {
  const member = Object.hasOwn(CAST, id) ? CAST[id] : null;
  if (!member) return '';
  const safeSize = SIZES.has(size) ? size : 'md';
  const loading = priority ? ' fetchpriority="high"' : ' loading="lazy"';
  const bubble = line ? `<p class="cast-bubble"><span class="cast-name">${escape(member.name)}</span>${escape(line)}</p>` : '';
  return `<figure class="cast cast--${safeSize}${mood ? ` cast--${escape(mood)}` : ''}" data-cast="${escape(id)}"><img class="cast-img" src="${escape(member.src)}" width="${CAST_SIZE}" height="${CAST_SIZE}" alt="" decoding="async"${loading}>${bubble}</figure>`;
}
