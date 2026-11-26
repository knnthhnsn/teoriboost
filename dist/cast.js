import {APPROVED_CAST_ART} from './approved-cast.js';
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
  home: ['Én regel ad gangen, så sidder den.', 'Roligt nu. Vi tager næste stræk sammen.', '5 minutter i dag slår en hel aften før prøven.'],
  comeback: ['Nå, du er tilbage. Jeg er lige flyttet ind igen.', 'Velkommen tilbage. Vi starter, hvor du slap.'],
  correct: ['Du blinkede i god tid. Præcis rigtigt.', 'Sådan, den sidder.', 'Du så det, før det blev farligt.'],
  wrong: ['Det var ikke helt rigtigt. Kig på reglen, så prøver du igen.', 'Tæt på. Kig på reglen, så tager vi den igen.', 'Den her regel er værd at øve før prøven.'],
  missions: ['Korte runder. Regler, der sidder.'],
  exam: ['25 situationer, én ad gangen. Du må gerne gå tilbage og ændre svar.'],
  pass: ['Inden for grænsen. Det er godt kørt.'],
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
  const upright=id==='sneglen', asset=upright?{src:member.src,width:512,height:512}:APPROVED_CAST_ART[id];
  const animation=upright?'':` data-approved-cast="${escape(id)}" data-approved-state="${mood==='correct'||mood==='wrong'?'react':'idle'}"`;
  return `<figure class="cast cast--${safeSize}${mood ? ` cast--${escape(mood)}` : ''}" data-cast="${escape(id)}"><span class="cast-art"${animation}><img class="cast-img"${upright?' style="animation:none!important;transform:none!important"':''} src="${escape(asset?.display||asset?.src||member.src)}" width="${asset?.width||CAST_SIZE}" height="${asset?.height||CAST_SIZE}" alt="" decoding="async"${loading}></span>${bubble}</figure>`;
}
