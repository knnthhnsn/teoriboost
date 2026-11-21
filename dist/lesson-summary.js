// Lesson summary (end of a lesson) and the "Hvorfor er det rigtigt?" control (after any answer).
// Client side only: it reads the finished journey session and the question's own explanation.
import { renderCast } from './cast.js';
import { QUESTIONS, SOURCES } from './content.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sourceLinks = ids => (ids || []).map(id => SOURCES.find(s => s.id === id)).filter(Boolean)
  .map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label.split(':')[0])}</a>`).join('');

const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor"/><path d="m8 12.5 2.8 2.8L16.5 9.5" fill="none" stroke="var(--ls-on,#fff)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const RING = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>';

/**
 * "Hvorfor er det rigtigt?": opens the explanation the question already has.
 * Without one it falls back to the existing Spørg Sneglen chat, with the question prefilled (app.js reads data-chat-*).
 * @param question  a question object (statements may be reordered by the caller)
 * @param answers   the learner's four answers as booleans, in the order of question.statements
 * @param label     summary text; the wording follows the verdict
 * @param ask       false when the caller already shows its own Spørg Sneglen link (ignored when there is no explanation)
 */
export function renderWhy(question, { answers = [], focus = null, label = 'Hvorfor er det rigtigt?', open = false, ask: withAsk = true } = {}) {
  if (!question) return '';
  const coded = answers.map(a => (a === true ? 1 : a === false ? 0 : '_')).join('');
  const ask = `<a class="why-ask" href="#chat" data-chat-ask="${esc(question.id)}"${focus === null ? '' : ` data-chat-focus="${focus}"`} data-chat-answers="${esc(coded)}">Spørg Sneglen om det</a>`;
  const text = String(question.explanation || '').trim();
  if (!text) return `<div class="why why--ask">${ask}</div>`;
  const src = sourceLinks(question.sourceIds);
  return `<details class="why"${open ? ' open' : ''}><summary>${esc(label)}</summary><div class="why-body"><p>${esc(text)}</p>${src ? `<div class="why-src">${src}</div>` : ''}${withAsk ? ask : ''}</div></details>`;
}

const questionById = id => QUESTIONS.find(q => q.id === id);
const rightCount = (answers, statements) => statements.filter((s, i) => answers?.[i] === s.correct).length;

/** What the learner got right and wrong on the first try, from the finished session only. */
export function summariseSession(session) {
  const out = { rows: [], repeat: [], recall: session?.recall?.selfCheck || null };
  const apply = session?.apply?.attempts?.[0];
  const applyQ = questionById(session?.questionId);
  if (apply && applyQ) {
    out.rows.push({ label: 'Første situation', right: rightCount(apply.answers, applyQ.statements), of: 4 });
    applyQ.statements.forEach((s, i) => { if (apply.answers[i] !== s.correct) out.repeat.push({ question: applyQ, statement: s, index: i, answers: apply.answers, given: apply.answers[i] }); });
  }
  const check = session?.checkpoint?.attempts?.[0];
  const checkQ = questionById(session?.checkpoint?.questionId);
  const order = session?.checkpoint?.order;
  if (check && checkQ && Array.isArray(order)) {
    // answers were given in the shown (shuffled) order; map them back to the question's own order
    const own = [null, null, null, null];
    order.forEach((original, shown) => { own[original] = check.answers[shown]; });
    out.rows.push({ label: 'Ny situation', right: rightCount(own, checkQ.statements), of: 4 });
    checkQ.statements.forEach((s, i) => {
      if (own[i] === s.correct) return;
      if (out.repeat.some(r => r.statement.text === s.text)) return;
      out.repeat.push({ question: checkQ, statement: s, index: i, answers: own, given: own[i] });
    });
  }
  return out;
}

function line(sum) {
  const n = sum.repeat.length, again = sum.recall === 'needs-review';
  if (!n && !again) return 'Det sad godt i første forsøg. Reglen kommer tilbage som gentagelse, så den bliver siddende.';
  if (!n) return 'Du svarede rigtigt, men valgte selv at øve forklaringen igen. Den kommer tilbage som gentagelse.';
  return `${n === 1 ? 'Ét udsagn' : `${n} udsagn`} skal du have med dig. De kommer tilbage som gentagelse om lidt.`;
}

/** The block shown on the "Lektion klaret" screen. Returns '' when the session has nothing to summarise. */
export function renderLessonSummary({ session, section }) {
  const sum = summariseSession(session);
  if (!sum.rows.length) return '';
  const rows = sum.rows.map(r => `<li class="ls-row ${r.right === r.of ? 'is-all' : 'is-part'}"><span class="ls-mark">${r.right === r.of ? TICK : RING}</span><span><b>${esc(r.label)}</b> ${r.right} af ${r.of} udsagn rigtige i første forsøg</span></li>`).join('')
    + (sum.recall ? `<li class="ls-row ${sum.recall === 'remembered' ? 'is-all' : 'is-part'}"><span class="ls-mark">${sum.recall === 'remembered' ? TICK : RING}</span><span><b>Med egne ord</b> ${sum.recall === 'remembered' ? 'Du fik det vigtigste med' : 'Du vil øve den igen senere'}</span></li>` : '');
  const repeat = sum.repeat.length
    ? `<h4 class="ls-sub">Det skal du gentage</h4><ol class="ls-repeat">${sum.repeat.map(r => `<li><p class="ls-statement">${esc(r.statement.text)}</p><small>Du svarede ${r.given ? 'JA' : 'NEJ'}. Rigtigt er ${r.statement.correct ? 'JA' : 'NEJ'}.</small>${renderWhy(r.question, { answers: r.answers, focus: r.index, label: 'Hvorfor?' })}</li>`).join('')}</ol><a class="ls-cards" href="#lesson:${esc(section.id)}">Se de tre kort igen</a>`
    : '<p class="ls-none">Ingen udsagn at gentage.</p>';
  return `<section class="ls" aria-labelledby="ls-title"><h3 class="ls-title" id="ls-title">Sådan gik det</h3><ul class="ls-rows">${rows}</ul>${repeat}<div class="ls-talk">${renderCast('sneglen', { size: 'sm' })}<p class="talk-bubble"><span class="cast-name">Sneglen</span>${esc(line(sum))}</p></div></section>`;
}

/** The tray shows answers in the shown order; the chat prefill wants the question's own order. */
export function toOwnOrder(answers = [], order = null) {
  if (!Array.isArray(order) || order.length !== 4) return answers;
  const own = [null, null, null, null];
  order.forEach((original, shown) => { own[original] = answers[shown]; });
  return own;
}
