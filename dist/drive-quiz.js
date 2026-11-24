// The practice question(s) a player answers after a fault in the driving lesson.
// One question per broken rule, from a reviewed list: these read correctly without a picture,
// and most of the "stop" section is about traffic lights, so never pick at random from a section.
// No picture here: the situation is the one the player just drove, and a fixed picture is what
// learners end up memorising. Each pool holds several situations, so a repeat fault gets a new one.
// Not counted against the free practice quota (teoriboost.practiceQuota.v1), because the lesson asks
// them and the player did not choose them. Revisit that when payments open.
import { recordAnswer, gradeQuestion, isCompleteResponse } from './core.js';
import { readProtectedProfile, writeProtectedProfile } from './profile-store.js';
import { readSeen, markSeen, pickFresh, statementOrder } from './question-rotation.js';

export const QUIZ_POOLS = Object.freeze({
  yield: Object.freeze(['q-065', 'q-300', 'q-257', 'q-266']),
  stop: Object.freeze(['q-032', 'q-064', 'q-267', 'q-270']),
  ped: Object.freeze(['q-068', 'q-470', 'q-556', 'q-559', 'q-563']),
  speed: Object.freeze(['q-090', 'q-414', 'q-415', 'q-419']),
  look: Object.freeze(['q-256', 'q-302', 'q-520']),
  right: Object.freeze(['q-033', 'q-067', 'q-287', 'q-291']),
  left: Object.freeze(['q-297', 'q-312', 'q-313', 'q-315', 'q-318']),
  rightTurn: Object.freeze(['q-305', 'q-307', 'q-308']),
  blink: Object.freeze(['q-214', 'q-120', 'q-218', 'q-311']),
  meet: Object.freeze(['q-038', 'q-486', 'q-108', 'q-472']),
  moped: Object.freeze(['q-400', 'q-395']),
  child: Object.freeze(['q-016', 'q-518', 'q-557', 'q-024']),
  phone: Object.freeze(['q-017', 'q-522', 'q-524', 'q-583']),
  lane: Object.freeze(['q-084', 'q-472', 'q-318']),
  kerb: Object.freeze(['q-006', 'q-595', 'q-596', 'q-597', 'q-598']),
  follow: Object.freeze(['q-402', 'q-521', 'q-085']),
  park: Object.freeze(['q-177', 'q-183', 'q-184', 'q-188', 'q-189']),
  bike: Object.freeze(['q-406', 'q-565', 'q-407', 'q-408']),
});

const LEGACY = 'natkoersel.learning.v1', PROTECTED = LEGACY + '.protected-v1';

// The bank is about 1 MB, so it loads after the traffic.
export async function loadQuizQuestionBank() {
  const { QUESTIONS } = await import('./content.js');
  return QUESTIONS;
}

// What the player actually did wrong in this one incident.
export function mistakeTags({ kind, speedMs = 0, collision = false, stoppedFirst = false, twoWheeler = false, limitMs = 50 / 3.6 }) {
  // "Stoppet var fint": a proper stop followed by pulling out is a give-way mistake.
  const primary = kind === 'stop' && stoppedFirst ? 'yield' : kind;
  const tags = [primary];
  if (twoWheeler) tags.push('moped');
  if (speedMs > limitMs) tags.push('speed');
  if (collision) tags.push('look');
  return [...new Set(tags)].filter(tag => QUIZ_POOLS[tag]);
}

// A rule is asked once per run. Within the rule, the situation seen longest ago comes next, across runs.
export function pickQuizQuestions(tags, questions, run, { seen = {}, random = Math.random } = {}) {
  const byId = new Map(questions.map(q => [q.id, q]));
  const picked = [];
  for (const tag of tags) {
    if (run.tags.has(tag)) continue;
    const question = pickFresh(QUIZ_POOLS[tag].map(id => byId.get(id)).filter(q => q && !run.ids.has(q.id)), seen, random);
    if (!question) continue;
    run.tags.add(tag);
    run.ids.add(question.id);
    picked.push({ tag, question });
  }
  return picked;
}

export const newQuizRun = () => ({ tags: new Set(), ids: new Set(), asked: 0, right: 0 });

// Read, change and write in one go, so the answer also counts in the app's weak rules.
// The app merges this copy with its own when it next saves, so an open app tab keeps the answer.
export function saveQuizAnswer(storage, question, answers) {
  const state = readProtectedProfile(storage, { legacyKey: LEGACY, protectedKey: PROTECTED, merge: (legacy, current) => current });
  recordAnswer(state, question, answers);
  writeProtectedProfile(storage, state, { legacyKey: LEGACY, protectedKey: PROTECTED });
}

const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mark = right => right
  ? '<svg class="quiz-mark" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  : '<svg class="quiz-mark" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

// Runs a list of picked questions in the card and calls onDone when the last one is answered.
export function createDriveQuiz({ veil, card, storage, run, onDone }) {
  let list = [], index = 0, answers = [], checked = false, order = [0, 1, 2, 3];
  function render() {
    const { question: q } = list[index];
    const complete = isCompleteResponse(answers), right = checked && gradeQuestion(q, answers), last = index === list.length - 1;
    const rows = order.map((i, shown) => {
      const s = q.statements[i], correct = checked && answers[i] === s.correct;
      const choice = value => `<button type="button" class="quiz-choice" data-statement="${i}" data-value="${value}" aria-pressed="${answers[i] === value}"${checked ? ' disabled' : ''}>${value ? 'Ja' : 'Nej'}</button>`;
      return `<li class="quiz-row${checked ? (correct ? ' is-right' : ' is-wrong') : ''}"><span class="quiz-text" id="quiz-statement-${shown}">${esc(s.text)}</span><span class="quiz-choices" role="group" aria-labelledby="quiz-statement-${shown}">${choice(true)}${choice(false)}</span>${checked ? `<span class="quiz-outcome">${mark(correct)}${correct ? 'Rigtigt' : `Forkert, svaret er ${s.correct ? 'ja' : 'nej'}`}</span>` : ''}</li>`;
    }).join('');
    card.innerHTML = `<div class="quiz-side">
        <span class="label">${list.length > 1 ? `Spørgsmål ${index + 1} af ${list.length}` : 'Spørgsmål om din fejl'}</span>
        <h2 id="quiz-title">${esc(q.prompt)}</h2>
        <p class="lede">${esc(q.context)}</p>
        ${checked ? `<div class="quiz-feedback ${right ? 'is-right' : 'is-wrong'}" role="status"><strong>${mark(right)}${right ? 'Rigtigt.' : 'Se reglen igen.'}</strong><p>${esc(q.explanation)}</p></div>` : ''}
      </div>
      <div class="quiz-main">
        ${checked ? '' : '<p class="quiz-hint">Svar ja eller nej til alle fire udsagn.</p>'}
        <ol class="quiz-rows">${rows}</ol>
        <button class="go" type="button" id="quiz-next"${!checked && !complete ? ' disabled' : ''}>${!checked ? 'Tjek svar' : last ? 'Kør videre' : 'Næste spørgsmål'}</button>
      </div>`;
  }
  function start(position) {
    index = position; answers = [null, null, null, null]; checked = false;
    order = statementOrder(`${Date.now()}:${Math.random()}:${list[index].question.id}`);
    render();
    veil.hidden = false; card.scrollTop = 0; veil.scrollTop = 0;
    card.querySelector('.quiz-choice')?.focus({ preventScroll: true });
  }
  card.addEventListener('click', event => {
    const choice = event.target.closest('.quiz-choice');
    if (choice && !checked) {
      answers[Number(choice.dataset.statement)] = choice.dataset.value === 'true';
      const scroll = card.scrollTop, key = `[data-statement="${choice.dataset.statement}"][data-value="${choice.dataset.value}"]`;
      render();
      card.scrollTop = scroll;
      card.querySelector(key)?.focus({ preventScroll: true });
      return;
    }
    if (!event.target.closest('#quiz-next')) return;
    if (!checked) {
      if (!isCompleteResponse(answers)) return;
      const { question } = list[index];
      checked = true; run.asked++;
      if (gradeQuestion(question, answers)) run.right++;
      try { saveQuizAnswer(storage, question, answers); } catch { /* the lesson goes on if the browser refuses to store it */ }
      markSeen(question.id, { storage });
      render();
      const next = card.querySelector('#quiz-next');
      next?.focus({ preventScroll: true });
      next?.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (index < list.length - 1) { start(index + 1); return; }
    veil.hidden = true; list = []; onDone();
  });
  // Tab stays inside the question while the lesson is paused.
  veil.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = [...card.querySelectorAll('button:not([disabled])')];
    if (!items.length) return;
    const first = items[0], end = items[items.length - 1], active = veil.ownerDocument.activeElement;
    if (event.shiftKey && active === first) { event.preventDefault(); end.focus(); }
    else if (!event.shiftKey && active === end) { event.preventDefault(); first.focus(); }
  });
  return {
    open(picked) { list = picked; start(0); },
    close() { veil.hidden = true; list = []; },
    seen: () => readSeen(storage),
  };
}
