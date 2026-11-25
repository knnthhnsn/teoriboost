// Undervisningsplanens hovedafsnit for hvert emne i appen.
// Hvert regelkort har en curriculumRef som "Kategori B v1.1: 4.4.3 og 8 · modul 1". Tallene før "·" er
// planens punkter, og det første tal i hvert punkt er afsnittet. Et emne kan høre til flere afsnit.

/** De tre afsnit, flest svarer forkert i ved den digitale teoriprøve (andel rigtige svar).
 *  Kilde: Færdselsstyrelsen, tal fra januar 2024 på 15 prøvesteder, offentliggjort 29. april 2025. */
export const HARD_AFSNIT = Object.freeze([
  { nr: 1, name: 'Bilens indretning, udstyr, betjening og dokumenter', correct: 53 },
  { nr: 8, name: 'Særlige risikoforhold i trafikken', correct: 64 },
  { nr: 6, name: 'Grundregler for bilkørsel', correct: 76 }
]);
/** Afsnit, som Øv tager først, når eleven ikke har andet, der haster. */
export const FIRST_AFSNIT = Object.freeze([1, 8]);

/** "Kategori B v1.1: 4.4.3 og 8 · modul 1" -> [4, 8]. Henvisninger til BEK og andet efter "samt" tæller ikke. */
export function afsnitOf(ref) {
  const plan = String(ref || '').split('·')[0].split(/samt|BEK/)[0];
  const points = plan.includes(':') ? plan.slice(plan.indexOf(':') + 1) : plan;
  return [...new Set((points.match(/\d+(?:\.\d+)*/g) || []).map(n => parseInt(n, 10)).filter(n => n > 0))];
}

/** afsnit -> emnernes id'er, fx 1 -> ['cockpit', 'assistenter', ...] */
export function sectionsByAfsnit(chapters) {
  const map = new Map();
  for (const chapter of chapters) for (const section of chapter.sections) {
    for (const nr of afsnitOf(section.curriculumRef)) { if (!map.has(nr)) map.set(nr, []); map.get(nr).push(section.id); }
  }
  return map;
}

/** Emnerne i de afsnit, Øv skal tage først. */
export function firstSections(chapters, afsnit = FIRST_AFSNIT) {
  const map = sectionsByAfsnit(chapters);
  return new Set(afsnit.flatMap(nr => map.get(nr) || []));
}

/** Hvor mange regelkort der sidder i hvert af de svære afsnit. "Sidder" betyder det samme som i "Hvor klar er du?". */
export function hardAfsnitStatus(chapters, records, sits) {
  const map = sectionsByAfsnit(chapters);
  return HARD_AFSNIT.map(a => {
    const ids = map.get(a.nr) || [];
    return { ...a, total: ids.length, ok: ids.filter(id => records[id] && sits(records[id])).length };
  });
}
