// Search over the app's own rule cards, lessons and questions. Small, dependency-free, Danish-aware.
import { KB } from './_kb.mjs';

// a few words learners use that the cards phrase differently
const SYNONYMS = {
  hajtaender: ['ubetinget', 'vigepligt'], hajtand: ['ubetinget', 'vigepligt'], hajtænder: ['ubetinget', 'vigepligt'],
  promille: ['alkohol', 'spiritus'], sprut: ['alkohol'], fart: ['hastighed'], speed: ['hastighed'], fartgrænse: ['hastighed'],
  højrevigepligt: ['højre', 'vigepligt'], rundkoersel: ['rundkørsel'], blinklys: ['tegn', 'retningsviser'], mobil: ['telefon'],
  glat: ['glat', 'føre', 'vinter'], bremselængde: ['bremse', 'standselængde'], overhale: ['overhaling'], parkere: ['parkering'],
  hurtigt: ['hastighed'], hurtig: ['hastighed'], byen: ['byzone', 'tættere', 'bebyggelse'], by: ['byzone'], km: ['hastighed'], nærlys: ['lys', 'lygter'], lygter: ['lys'],
};
const STOP = new Set('og i på at er en et det den til af for med som du har jeg kan skal man ikke om hvad hvornår hvordan hvorfor må når der de eller fra sig så hvis min mit mine vil være'.split(' '));
export const normalize = s => String(s || '').toLocaleLowerCase('da-DK').normalize('NFC').replace(/[^a-zæøå0-9 ]+/g, ' ');
export const stem = w => w.length > 5 ? w.replace(/(erne|ende|ene|er|en|et|e|s)$/, '') : w;
export const tokens = s => normalize(s).split(/\s+/).filter(w => w && !STOP.has(w)).flatMap(w => [w, ...(SYNONYMS[w] || [])]).map(stem);

const DOCS = KB.sections.map(s => ({
  id: s.id,
  title: tokens(s.title + ' ' + s.chapter),
  body: tokens([s.lead, ...s.facts, ...s.cards.map(c => c.title + ' ' + c.body), ...KB.questions.filter(q => q.sectionId === s.id).map(q => q.prompt + ' ' + q.explanation)].join(' ')),
}));

// rarer words count more: "køre" is everywhere, "promille" is not
const DF = new Map();
for (const d of DOCS) for (const t of new Set([...d.title, ...d.body])) DF.set(t, (DF.get(t) || 0) + 1);
const idf = t => { let df = 0; for (const [k, v] of DF) if (k === t || (t.length > 3 && k.startsWith(t)) || (k.length >= 5 && t.startsWith(k))) df = Math.max(df, v); return df ? Math.log(1 + DOCS.length / df) : 0; };

/** Best matching rule cards for a query, with their facts, lesson lead and sources. */
export function searchRules(query, limit = 4) {
  const q = [...new Set(tokens(query))];
  if (!q.length) return [];
  const scored = DOCS.map(d => {
    let score = 0;
    for (const t of q) {
      // exact, prefix ("vigep" → "vigepligt") or compound ("promillegrænsen" starts with "promille")
      const hit = x => x === t || (t.length > 3 && x.startsWith(t)) || (x.length >= 5 && t.startsWith(x));
      const inTitle = d.title.filter(hit).length;
      const inBody = d.body.filter(hit).length;
      score += idf(t) * (inTitle * 4 + Math.min(inBody, 6));
    }
    return { id: d.id, score: Math.round(score * 10) / 10 };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  return scored.map(({ id, score }) => sectionCard(id, score));
}
export function sectionCard(id, score) {
  const s = KB.sections.find(x => x.id === id);
  if (!s) return null;
  return { sectionId: s.id, title: s.title, chapter: s.chapter, lead: s.lead, facts: s.facts, cards: s.cards, curriculum: s.ref, score,
    sources: s.sources.map(sid => KB.sources[sid]).filter(Boolean).map(x => ({ label: x.label, url: x.url })) };
}
/** A practice question for a topic (the client renders it; the model never sees the answers). */
export function practiceQuestion(sectionId, exclude = []) {
  const pool = KB.questions.filter(q => (!sectionId || q.sectionId === sectionId) && !exclude.includes(q.id));
  const q = pool[Math.floor(Math.random() * pool.length)];
  return q ? { questionId: q.id, sectionId: q.sectionId, prompt: q.prompt } : null;
}
export const questionById = id => KB.questions.find(q => q.id === id) || null;

/** Routes the assistant may link to. Anything else is dropped. */
const ROUTES = [/^#journey:[a-z0-9-]+$/, /^#mission:[a-z0-9-]+$/, /^#chapter:[a-z0-9-]+$/, /^#(review|exam|practice|home|minbil|profil|theory)$/];
export const safeRoute = r => typeof r === 'string' && ROUTES.some(rx => rx.test(r)) ? r : null;
