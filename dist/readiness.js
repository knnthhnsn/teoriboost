// "Er jeg klar?": Sneglen's honest read of the answers already stored in state.records (one record per topic).
// Pure and client side. Never shows a percentage: it shows counts ("4 af 5 rigtige") and plain words.
import { renderCast } from './cast.js';
import { getJourneyRecommendations } from './journey-core.js';
import { contentAccess } from './entitlements.js';

const DAY = 86400000;
/** Tunable limits, all in one place so the wording below stays true. */
export const LIMITS = Object.freeze({
  minAnswers: 3,        // fewer finished answers in a topic: "for lidt data"
  readyAccuracy: 0.8,   // share right for "Klar"
  weakAccuracy: 0.6,    // below this share right: "Øv mere"
  readyStreak: 2,       // right in a row, newest last
  staleDays: 21,        // an old "Klar" drops to "Næsten"
  minTopicsForVerdict: 6, // topics with enough data before Sneglen gives a verdict at all
  coverage: 0.7,        // share of topics with enough data before "Næsten" or "Klar" can be said
  readyShare: 0.8,      // share of all topics that must be "Klar" for the overall "Klar"
  examLimit: 5
});

export const STATUS = Object.freeze({
  klar: { label: 'Klar', rank: 3 },
  naesten: { label: 'Næsten', rank: 2 },
  oev: { label: 'Øv mere', rank: 1 },
  lidt: { label: 'Øv lidt mere først', rank: 0 }
});

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** "i dag", "i går", "for 3 dage siden", "for 2 uger siden". */
export function ago(at, now = Date.now()) {
  if (!Number.isFinite(at) || at <= 0) return '';
  const days = Math.floor((now - at) / DAY);
  if (days <= 0) return 'i dag';
  if (days === 1) return 'i går';
  if (days < 14) return `for ${days} dage siden`;
  if (days < 60) return `for ${Math.floor(days / 7)} uger siden`;
  return `for ${Math.floor(days / 30)} måneder siden`;
}

/** Status of one topic from its record, or "lidt" when the record is too thin to judge. */
export function topicStatus(record, now = Date.now()) {
  const n = record?.assessments ?? 0;
  if (!record || n < LIMITS.minAnswers) return { status: 'lidt', n, right: record?.correct ?? 0, last: record?.last ?? 0 };
  const right = Math.min(n, record.correct ?? 0);
  const accuracy = right / n;
  const last = record.last ?? 0;
  const stale = last > 0 && now - last > LIMITS.staleDays * DAY;
  let status;
  if (accuracy < LIMITS.weakAccuracy) status = 'oev';
  else if (accuracy >= LIMITS.readyAccuracy && record.lastCorrect && (record.streak ?? 0) >= LIMITS.readyStreak && !stale) status = 'klar';
  else status = 'naesten';
  return { status, n, right, last, stale, accuracy };
}

/**
 * @param state       the stored profile ({records, history, journey})
 * @param chapters    CHAPTERS
 * @param lessons     LESSONS
 * @param questions   QUESTIONS
 */
export function computeReadiness({ state, chapters, lessons, questions, now = Date.now(), open = () => true }) {
  const records = state?.records || {};
  const topics = chapters.flatMap((chapter, chapterIndex) => chapter.sections.map(section => ({
    id: section.id, title: section.title, chapterTitle: chapter.title, open: open(chapterIndex + 1),
    ...topicStatus(records[section.id], now)
  })));
  const counts = { klar: 0, naesten: 0, oev: 0, lidt: 0 };
  for (const topic of topics) counts[topic.status] += 1;
  const total = topics.length, judged = total - counts.lidt;

  // weakest first: "Øv mere" by lowest accuracy, then "Næsten" (old or low first)
  const weak = topics.filter(t => t.status === 'oev' || t.status === 'naesten')
    .sort((a, b) => STATUS[a.status].rank - STATUS[b.status].rank || a.accuracy - b.accuracy || a.last - b.last);

  const recent = (state?.history || []).slice(-3);
  const examsInLimit = recent.filter(h => h.errors <= LIMITS.examLimit).length;
  const examOk = recent.length > 0 && examsInLimit >= Math.min(2, recent.length) && recent.at(-1).errors <= LIMITS.examLimit;

  let level;
  if (judged < LIMITS.minTopicsForVerdict) level = 'lidt';
  else if (judged < Math.ceil(total * LIMITS.coverage)) level = 'oev';
  else if (counts.oev === 0 && counts.klar >= Math.ceil(total * LIMITS.readyShare) && examOk) level = 'klar';
  else if (counts.oev === 0 || counts.oev <= Math.ceil(judged * 0.15)) level = 'naesten';
  else level = 'oev';

  // one next step
  let next;
  if (weak.length) {
    const t = weak[0];
    next = { kind: 'topic', id: t.id, title: t.title, href: `#mission:${t.id}`, lessonHref: t.open ? `#lesson:${t.id}` : '', label: `Øv »${t.title}«`, topic: t };
  } else if (topics.some(x => x.status === 'lidt' && x.open)) {
    const rec = getJourneyRecommendations({ chapters, lessons, questions, journey: state?.journey, records, now }).recommended;
    const t = (rec && topics.find(x => x.id === rec.sectionId && x.status === 'lidt' && x.open)) || topics.find(x => x.status === 'lidt' && x.open);
    next = { kind: 'new', id: t.id, title: t.title, href: `#journey:${t.id}`, label: `Start »${t.title}«`, topic: t };
  } else {
    next = { kind: 'exam', label: 'Tag en øveprøve' };
  }
  const lastOk = recent.length > 0 && recent.at(-1).errors <= LIMITS.examLimit;
  return { topics, counts, total, judged, level, weak, next, examOk, lastOk, exams: recent.length, examsInLimit };
}

const LEVEL = {
  klar: { label: 'Klar til prøven', tone: 'klar' },
  naesten: { label: 'Næsten klar', tone: 'naesten' },
  oev: { label: 'Ikke klar endnu', tone: 'oev' },
  lidt: { label: 'Øv lidt mere først', tone: 'lidt' }
};

/** Sneglen's line: one or two short sentences, built only from numbers that are on the screen. */
export function sneglenLine(vm) {
  const { level, counts, next, examOk, exams, lastOk } = vm;
  const t = next.title ? `»${next.title}«` : '';
  const good = lastOk && level !== 'klar'; // the exam signal above this card says "Klar" after one good exam; say why this card still waits
  if (level === 'lidt') return good ? 'Din seneste øveprøve gik godt, men jeg kender dig ikke nok endnu til at sige, om du er klar.' : 'Jeg kender dig ikke nok endnu. Øv nogle flere emner, så kan jeg sige noget, der holder.';
  if (level === 'klar') return 'Dine svar og dine prøver peger samme vej. Det er en øvning og ingen garanti, så hold reglerne varme.';
  if (level === 'naesten') {
    if (next.kind === 'topic') return `${good ? 'Din seneste øveprøve gik godt, men du er ikke helt der endnu.' : 'Du er tæt på.'} Tag ${t} en gang til${exams && !examOk && !good ? ', og prøv så en øveprøve' : ''}.`;
    return exams ? 'Du er tæt på. Lav en øveprøve mere, så ser vi, om det holder.' : 'Du er tæt på. Tag en øveprøve, så ser vi, hvor du står.';
  }
  const lead = good ? 'Din seneste øveprøve gik godt, men ' : '';
  if (!counts.oev) return `${good ? lead + `der mangler stadig svar i ${counts.lidt} emner.` : `Der mangler stadig svar i ${counts.lidt} emner, så jeg kan ikke sige, at du er klar.`}`;
  const n = counts.oev === 1 ? 'ét emne skal' : `${counts.oev} emner skal`;
  return `${good ? lead + n : n[0].toUpperCase() + n.slice(1)} sidde bedre. Start med ${t}, så tager vi resten bagefter.`;
}

const glyph = tone => ({
  klar: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor"/><path d="m8 12.5 2.8 2.8L16.5 9.5" fill="none" stroke="var(--rd-on,#fff)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  naesten: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 3.8a8.2 8.2 0 0 1 0 16.4z" fill="currentColor"/></svg>',
  oev: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
  lidt: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="3.2 3.2"/></svg>'
}[tone]);

const pill = status => `<span class="rd-pill rd-pill--${status}">${glyph(status)}${STATUS[status].label}</span>`;

function detail(t, now) {
  if (t.status === 'lidt') return t.n ? `Kun ${t.n} af ${LIMITS.minAnswers} svar` : 'Ikke øvet endnu';
  const when = ago(t.last, now);
  return `${t.right} af ${t.n} rigtige${when ? `, sidst ${when}` : ''}${t.stale ? ' (længe siden)' : ''}`;
}

const row = (t, now) => `<li class="rd-row"><a href="#mission:${esc(t.id)}"><span class="rd-row-main"><strong>${esc(t.title)}</strong><small>${esc(detail(t, now))}</small></span>${pill(t.status)}</a></li>`;

/** The card. Everything inside is plain HTML, native <details> for the full list, no script needed. */
export function renderReadiness(vm, now = Date.now()) {
  const { counts, total, judged, level, weak, next } = vm;
  const lv = LEVEL[level];
  const chips = ['klar', 'naesten', 'oev', 'lidt'].map(key => `<li class="rd-count rd-count--${key}"><b>${counts[key]}</b><span>${STATUS[key].label}</span></li>`).join('');
  const showRows = weak.slice(0, 3);
  const cta = next.kind === 'exam'
    ? '<button class="btn btn-primary rd-cta" type="button" data-action="start-exam">Tag en øveprøve</button>'
    : `<a class="btn btn-primary rd-cta" href="${esc(next.href)}">${esc(next.label)}</a>${next.lessonHref ? `<a class="rd-lesson" href="${esc(next.lessonHref)}">Læs reglen først</a>` : ''}`;
  const listOrder = { oev: 0, naesten: 1, klar: 2, lidt: 3 };
  const byChapter = vm.topics.slice().sort((a, b) => listOrder[a.status] - listOrder[b.status]);
  return `<section class="rd" aria-labelledby="rd-title" data-readiness="${level}">
    <h2 class="list-label" id="rd-title">ER DU KLAR?</h2>
    <div class="exam-talk rd-talk">${renderCast('sneglen', { size: 'sm' })}<p class="talk-bubble"><span class="cast-name">Sneglen</span>${esc(sneglenLine(vm))}</p></div>
    <div class="rd-verdict rd-verdict--${lv.tone}"><span class="rd-verdict-mark">${glyph(lv.tone)}</span><div><strong>${lv.label}</strong><small>${judged} af ${total} emner har nok svar${vm.exams > 1 ? `. ${vm.examsInLimit} af dine seneste ${vm.exams} øveprøver blev bestået` : vm.exams ? `. Din seneste øveprøve ${vm.examsInLimit ? 'blev bestået' : 'blev ikke bestået'}` : '. Ingen øveprøver endnu'}</small></div></div>
    <ul class="rd-counts" aria-label="Emner fordelt på status">${chips}</ul>
    ${showRows.length ? `<h3 class="rd-sub">Her skal du bruge mest tid</h3><ol class="rd-list">${showRows.map(t => row(t, now)).join('')}</ol>` : ''}
    <div class="rd-actions">${cta}</div>
    <details class="fine-details rd-all"><summary>Se alle ${total} emner</summary><ol class="rd-list rd-list--all">${byChapter.map(t => row(t, now)).join('')}</ol></details>
    <p class="rd-note small">Sådan regner jeg: et emne tæller først, når du har svaret på mindst ${LIMITS.minAnswers} situationer. »Klar« kræver, at du har ret i mindst 4 ud af 5, har svaret rigtigt de sidste to gange og har øvet inden for ${LIMITS.staleDays} dage. Det er dine egne svar, ikke en garanti for den rigtige prøve.</p>
  </section>`;
}

/** Hook for app.js: put the card under the start button, above "DINE PRØVER". Falls back to the end. */
export function injectReadiness(examHtml, args) {
  let card = '';
  try {
    const { premium, ...rest } = args;
    // chapters the free plan cannot open are not offered as the next step (reading the config only, no paywall side effects)
    const open = n => { try { return contentAccess(premium?.config?.(), premium?.client?.view?.().premium, 'chapter', n); } catch { return true; } };
    card = renderReadiness(computeReadiness({ ...rest, open }), args.now);
  } catch { return examHtml; }
  const marker = '<h2 class="list-label">DINE PRØVER</h2>';
  return examHtml.includes(marker) ? examHtml.replace(marker, `${card}${marker}`) : examHtml + card;
}
