import { CHAPTERS, QUESTIONS, SOURCES } from './content.js';
import { LESSONS } from './lessons.js';
import { renderQuestionVisual, mountQuestionVisual } from './exam-photo-view.js';
import { renderArt } from './art.js';
import { createVoiceCue } from './voice-cues.js';
import {
  questionVoiceParts, questionFeedbackParts, lessonVoiceParts, lessonCaseVoiceParts,
  lessonAnswerVoiceParts, lessonRecallPromptParts, lessonRecallAnswerParts
} from './voice-texts.js';
import {
  createJourneySession, restoreJourneySession, transitionJourneySession,
  getJourneyStep, nextJourneyActionId, JOURNEY_ACTIONS
} from './journey-session.js';

const CONTENT = { questions: QUESTIONS, lessons: LESSONS };
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const STAGES = ['understand', 'apply', 'transfer', 'recall', 'checkpoint'];
const LABELS = ['Forstå', 'Vælg', 'Brug', 'Genkald', 'Prøv igen'];
const response = value => Array.from({length:4}, (_, i) => typeof value?.[i] === 'boolean' ? value[i] : null);
const voice = (kind, label) => `<button class="audio-btn voice-read" type="button" data-journey-voice="${kind}">${label}</button>`;
const refs = (ids, locator = '') => `<div class="lesson-references">${(ids || []).map(id => SOURCES.find(s => s.id === id)).filter(Boolean).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label.split(':')[0])} ↗</a>`).join('')}<span>${esc(locator)}</span></div>`;

/** Page-local controller. Factual content stays in the existing source-reviewed bank. */
export function createJourneyPlayer({ host, getState, persist, onAssess, onComplete, narrator, notify = () => {} }) {
  let session = null, ui = null, visual = null, disposed = false, section = null, lastView = null;
  const state = () => getState();
  const save = () => {
    if (!session || disposed) return;
    state().journeySessions ||= {};
    state().journeySessions[session.sectionId] = { session, ui, updatedAt:Date.now() };
    persist();
  };
  const step = () => getJourneyStep(session, CONTENT);
  function currentQuestion() {
    if (ui?.feedback) {
      const q = QUESTIONS.find(item => item.id === ui.feedback.questionId);
      if (!q) return null;
      return ui.feedback.order ? { ...q, statements:ui.feedback.order.map(i => q.statements[i]) } : q;
    }
    return step()?.question || null;
  }
  function action(type, fields = {}) {
    narrator.stop();
    const result = transitionJourneySession(session, { type, actionId:nextJourneyActionId(session, type), at:Date.now(), ...fields }, CONTENT);
    if (!result.outcome.accepted) { notify('Dette trin er ikke klar endnu.'); return null; }
    session = result.session;
    return result.outcome;
  }
  function shell(body) {
    const shownStage = ui?.feedback?.stage || session.stage;
    const stages=session.kind === 'review' ? ['apply','understand','transfer','recall','checkpoint'] : STAGES;
    const labels=session.kind === 'review' ? ['Genkald','Forstå','Brug','Forklar','Prøv igen'] : LABELS;
    const index = Math.min(4, stages.indexOf(shownStage) < 0 ? 4 : stages.indexOf(shownStage));
    return `<article class="journey-player" data-journey-session="${esc(session.sessionId)}">
      <header class="journey-player-head"><a class="back-btn" href="#home" aria-label="Gem lektionen og gå til din rute">←</a><div><span class="journey-kicker">${session.kind === 'review' ? 'EN REGEL. EN NY GENKALDELSE.' : 'EN REGEL. FEM SMÅ TRIN.'}</span><h1>${esc(section.title)}</h1></div><span class="journey-player-count">${index + 1 + ' / 5'}</span></header>
      <ol class="journey-stage-track" aria-label="Lektionens trin">${labels.map((label, i) => `<li class="${i < index || shownStage === 'done' ? 'done' : i === index ? 'current' : ''}" ${i === index ? 'aria-current="step"' : ''}><span>${i + 1}</span>${label}</li>`).join('')}</ol>
      <div class="journey-player-body">${body}</div></article>`;
  }
  function exercise(q) {
    const answers = ui.answers;
    return `<div class="journey-assessment question-layout"><header class="journey-exercise-context"><div class="eyebrow">${session.kind === 'review' && session.stage === 'apply' ? 'GENKALD REGLEN FØR DU LÆSER KORTENE.' : 'SE SITUATIONEN. TAG STILLING.'}</div><h2>${esc(q.prompt)}</h2><p class="question-context">${esc(q.context)}</p>${voice('question', 'Læs situationen op')}</header>${renderQuestionVisual(q)}
      <section class="question-panel">
      <p class="answer-note">Vurdér alle fire udsagn. Flere kan være korrekte.</p><div class="statements">${q.statements.map((s, i) => `<div class="statement"><span class="statement-index">0${i + 1}</span><span class="statement-text">${esc(s.text)}</span><div class="yes-no" role="group" aria-label="Udsagn ${i + 1}: ${esc(s.text)}">${[[true,'JA'],[false,'NEJ']].map(([value,label]) => `<button type="button" class="choice-btn ${answers[i] === value ? 'selected' : ''}" data-journey-choice="${i}" data-value="${value}" aria-pressed="${answers[i] === value}" aria-label="Udsagn ${i + 1}, ${label.toLowerCase()}">${label}</button>`).join('')}</div></div>`).join('')}</div>
      <div class="question-actions"><span id="journey-answer-count" class="small">${answers.filter(v => v !== null).length}/4 vurderet</span><button class="btn btn-primary" type="button" data-journey-submit ${answers.some(v => v === null) ? 'disabled' : ''}>Tjek min vurdering →</button></div></section></div>`;
  }
  function feedback() {
    const q = currentQuestion(), f = ui.feedback;
    return `<section class="journey-feedback ${f.correct ? 'journey-feedback--correct' : 'journey-feedback--repair'}" role="status"><span class="journey-kicker">${f.correct ? 'GODT SET' : 'HER ER DET AFGØRENDE'}</span><h2>${f.correct ? 'Reglen er med i dit valg.' : 'Find reglen. Prøv den igen.'}</h2><p>${esc(q.explanation)}</p>${refs(q.sourceIds)}
      <div class="journey-answer-review">${q.statements.map((s, i) => `<div class="${f.answers[i] === s.correct ? 'right' : 'wrong'}"><span>${f.answers[i] === s.correct ? '✓' : '↻'}</span><p>${esc(s.text)}</p><b>${s.correct ? 'JA' : 'NEJ'}</b></div>`).join('')}</div>${voice('feedback', 'Lyt til forklaringen')}
      ${state().settings.humor ? `<div class="journey-hook">${renderArt(f.correct ? 'koerelys-brain' : 'omkamp-cone', {variant:'reaction', humorOnly:true})}<p>${esc(q.gag)}</p></div>` : ''}
      <button class="btn btn-primary" data-journey-continue-feedback type="button">${f.correct ? 'Videre →' : 'Prøv vurderingen igen ↻'}</button></section>`;
  }
  function render() {
    if (disposed || !session) return;
    visual?.dispose(); visual = null; narrator.stop();
    const s = step(), lesson = LESSONS[session.sectionId];
    if (!s) { host.innerHTML = '<p>Lektionen kunne ikke gendannes. <a href="#home">Til din rute</a></p>'; return; }
    let body;
    if (ui.feedback) body = feedback();
    else if (s.stage === 'understand') {
      body = `<div class="journey-lead"><h2>Reglen i tre små bidder.</h2><p>${esc(lesson.lead)}</p>${voice('lesson', 'Lyt til hele forklaringen')}</div><div class="lesson-cards journey-rule-cards">${s.cards.map((card, i) => `<section class="lesson-card ${s.cardsRead[i] ? 'journey-card-read' : ''}"><span class="lesson-number">0${i + 1}</span><div><h2>${esc(card.title)}</h2><p>${esc(card.body)}</p>${refs(card.sourceIds, card.sourceLocator)}<button type="button" class="btn btn-secondary" data-journey-card="${i}" ${s.cardsRead[i] ? 'disabled' : ''}>${s.cardsRead[i] ? 'Læst ✓' : 'Kortet er læst →'}</button></div></section>`).join('')}</div><p class="journey-learning-note">${session.kind === 'review' ? 'Du har prøvet at genkalde reglen. Nu ser du forklaringen, før du bruger den i en ny case.' : 'Når de tre kort er læst, prøver du reglen i en situation.'}</p>`;
    } else if (s.stage === 'apply' || s.stage === 'checkpoint') {
      body = (s.stage === 'checkpoint' ? `<p class="recall-banner">${s.reordered ? 'Samme situation, ny rækkefølge. Øv reglen igen. Dette emne har endnu kun ét prøvebillede.' : 'Et andet spørgsmål fra samme emne. Brug reglen igen.'}</p>` : '') + exercise(s.question);
    } else if (s.stage === 'transfer') {
      body = `<section class="journey-open-step"><span class="journey-kicker">BRUG REGLEN I EN NY CASE</span><h2>Hvad ville du gøre?</h2><p class="journey-case-context">${esc(s.case.context)}</p>${voice('case', 'Lyt til situationen')}
      ${s.answer === null ? `<label for="journey-open-answer">Dit næste træk og hvorfor</label><textarea id="journey-open-answer" maxlength="5000" rows="4" placeholder="Forklar det med dine egne ord.">${esc(ui.transferDraft)}</textarea><button type="button" class="btn btn-primary" data-journey-open-submit ${!ui.transferDraft.trim() ? 'disabled' : ''}>Sammenlign med reglen →</button>` : `<div class="journey-own-answer"><span>DIT FORSLAG</span><p>${esc(s.answer)}</p></div><div class="journey-model-answer"><h3>Handlingen</h3><p>${esc(s.modelAnswer.action)}</p><h3>Derfor</h3><p>${esc(s.modelAnswer.why)}</p>${voice('answer', 'Lyt til handlingen')}${refs(s.case.sourceIds, s.case.sourceLocator)}</div><p class="journey-learning-note">Læs efter, om både handling og begrundelse var med. Dit frie svar bedømmes ikke automatisk.</p><button class="btn btn-primary" type="button" data-journey-transfer-next>Til genkaldelse →</button>`}</section>`;
    } else if (s.stage === 'recall') {
      body = `<section class="journey-open-step"><span class="journey-kicker">HENT REGLEN FREM</span><h2>${esc(s.prompt)}</h2>${voice('recall', 'Lyt til spørgsmålet')}
      ${s.answer === null ? `<label for="journey-open-answer">Forklar reglen uden at kigge i kortene</label><textarea id="journey-open-answer" maxlength="5000" rows="4" placeholder="Hvad husker du?">${esc(ui.recallDraft)}</textarea><button class="btn btn-primary" type="button" data-journey-open-submit ${!ui.recallDraft.trim() ? 'disabled' : ''}>Se forklaringen →</button>` : `<div class="journey-own-answer"><span>DIN GENKALDELSE</span><p>${esc(s.answer)}</p></div><div class="journey-model-answer"><p>${esc(s.modelAnswer)}</p>${voice('recall-answer', 'Lyt til svaret')}</div><p class="journey-learning-note">Sammenlign selv. Der er ingen automatisk bedømmelse af dine ord.</p><div class="journey-self-check"><button class="btn btn-primary" type="button" data-journey-self-check="remembered">Jeg havde det centrale med →</button><button class="btn btn-secondary" type="button" data-journey-self-check="needs-review">Jeg vil genkalde den igen →</button></div>`}</section>`;
    } else {
      const evidence = s.evidence;
      const repaired=evidence.apply.hadWrong || evidence.checkpoint.hadWrong;
      body = `<section class="journey-lesson-done"><div class="journey-done-art">${renderArt(repaired ? 'omkamp-cone' : 'koerelys-brain', {variant:'result', humorOnly:true})}</div><span class="journey-kicker">LEKTION GENNEMFØRT</span><h2>${repaired ? 'Du fandt reglen bag fejlen.' : 'Et godt skridt på ruten.'}</h2><p>Du har læst, vurderet og genkaldt reglen. Den kommer tilbage senere. Lektionen er øvet; gentagelse over tid viser mere.</p>${lesson.practicalNote ? `<aside class="journey-model-answer"><h3>Tag det med til kørelæreren</h3><p>${esc(lesson.practicalNote)}</p></aside>` : ''}${session.finalizedAt ? '<a class="btn btn-primary" href="#home">Til min rute →</a>' : '<button class="btn btn-primary" type="button" data-journey-finish>Gem min lektion →</button>'}<a class="btn btn-secondary" href="#theory">Åbn teoriatlaset</a></section>`;
    }
    host.innerHTML = shell(body);
    const q = currentQuestion(), photo = host.querySelector('.scene-photo');
    if (photo && q) visual = mountQuestionVisual(photo, q, {onOpen:() => narrator.stop()});
    const focus = host.querySelector('h2') || host.querySelector('h1');
    focus?.setAttribute('tabindex','-1'); focus?.focus({preventScroll:true});
    const nextView=ui.feedback ? 'feedback:'+ui.feedback.stage+':'+ui.feedback.correct : s.stage+':'+(s.answer === null ? 'entry' : 'compare');
    if(lastView !== null && nextView !== lastView) window.scrollTo({top:0,behavior:'instant'});
    lastView=nextView;
  }
  function read(button) {
    const kind = button.dataset.journeyVoice, lesson = LESSONS[session.sectionId], q = currentQuestion();
    const getters = {question:() => questionVoiceParts(q), feedback:() => questionFeedbackParts(q,{humor:state().settings.humor}), lesson:() => lessonVoiceParts(lesson), case:() => lessonCaseVoiceParts(lesson), answer:() => lessonAnswerVoiceParts(lesson), recall:() => lessonRecallPromptParts(lesson), 'recall-answer':() => lessonRecallAnswerParts(lesson)};
    const parts = getters[kind]?.() || [];
    const rows = kind === 'question' ? [[host.querySelector('.journey-exercise-context h2'),host.querySelector('.journey-exercise-context .question-context')], ...[...host.querySelectorAll('.statement')].flatMap(row => [row,row])] : [host.querySelector('.journey-player-body')];
    if (parts.length) void narrator.read(parts,{label:button.textContent.trim(),trigger:button,onPart:createVoiceCue(rows)});
  }
  function click(event) {
    if (disposed || !session) return;
    const b = event.target.closest('button'); if (!b || !host.contains(b)) return;
    if (b.hasAttribute('data-journey-voice')) { read(b); return; }
    if (b.hasAttribute('data-journey-choice') && !ui.feedback) {
      const i = Number(b.dataset.journeyChoice); if (!Number.isInteger(i) || i < 0 || i > 3) return;
      ui.answers[i] = b.dataset.value === 'true'; save();
      b.closest('.yes-no').querySelectorAll('button').forEach(item => {const selected=item === b;item.classList.toggle('selected',selected);item.setAttribute('aria-pressed',String(selected));});
      host.querySelector('#journey-answer-count').textContent = ui.answers.filter(v => v !== null).length + '/4 vurderet';
      host.querySelector('[data-journey-submit]').disabled = ui.answers.some(v => v === null); return;
    }
    if (b.hasAttribute('data-journey-card')) {
      if (action(JOURNEY_ACTIONS.READ_CARD,{index:Number(b.dataset.journeyCard)})) {save();render();} return;
    }
    if (b.hasAttribute('data-journey-submit') && !ui.feedback) {
      const s = step(); if (!['apply','checkpoint'].includes(s?.stage) || ui.answers.some(v => v === null)) return;
      b.disabled = true;
      const q = s.question, answers = [...ui.answers], which = s.stage;
      const result = action(which === 'apply' ? JOURNEY_ACTIONS.SUBMIT_APPLY : JOURNEY_ACTIONS.SUBMIT_CHECKPOINT,{answers});
      if (!result) return;
      ui.feedback = {questionId:q.id,order:which === 'checkpoint' ? [...session.checkpoint.order] : null,answers,correct:result.correct,stage:which};
      onAssess(q,answers); save(); render(); return;
    }
    if (b.hasAttribute('data-journey-continue-feedback') && ui.feedback) {
      const finished = ui.feedback.correct && session.stage === 'done';
      ui.feedback = null; ui.answers = [null,null,null,null];
      if (finished) {
        const final = action(JOURNEY_ACTIONS.FINALIZE);
        if (final?.evidence) onComplete(final.evidence,session);
      }
      save();render();return;
    }
    if (b.hasAttribute('data-journey-open-submit')) {
      const s = step(), answer = s.stage === 'transfer' ? ui.transferDraft : ui.recallDraft;
      if (action(s.stage === 'transfer' ? JOURNEY_ACTIONS.SUBMIT_TRANSFER : JOURNEY_ACTIONS.SUBMIT_RECALL,{answer})) {save();render();}return;
    }
    if (b.hasAttribute('data-journey-transfer-next')) {
      if (action(JOURNEY_ACTIONS.CONTINUE_TRANSFER)) {save();render();}return;
    }
    if (b.hasAttribute('data-journey-self-check')) {
      if (action(JOURNEY_ACTIONS.SELF_CHECK_RECALL,{selfCheck:b.dataset.journeySelfCheck})) {save();render();}return;
    }
    if (b.hasAttribute('data-journey-finish')) {
      const final=action(JOURNEY_ACTIONS.FINALIZE);
      if (final?.evidence) onComplete(final.evidence,session);
      save();render();return;
    }
  }
  function input(event) {
    if (event.target.id !== 'journey-open-answer') return;
    const s = step(); if (!['transfer','recall'].includes(s?.stage)) return;
    const value = event.target.value.slice(0,5000);
    if (s.stage === 'transfer') ui.transferDraft = value; else ui.recallDraft = value;
    host.querySelector('[data-journey-open-submit]').disabled = !value.trim(); save();
  }
  host.addEventListener('click',click); host.addEventListener('input',input);
  return {
    mount(sectionId) {
      section = CHAPTERS.flatMap(c => c.sections).find(s => s.id === sectionId);
      if (!section || !LESSONS[sectionId]) {host.innerHTML='<p>Lektionen findes ikke. <a href="#home">Til din rute</a></p>';return;}
      const stored = state().journeySessions?.[sectionId], restored = restoreJourneySession(stored?.session,CONTENT);
      const resume=!!restored && (restored.stage !== 'done' || !restored.finalizedAt);
      if (resume) session = restored;
      else {
        const completed = state().journey?.events?.filter(e => e.sectionId === sectionId) || [];
        const candidates = QUESTIONS.filter(q => q.sectionId === sectionId);
        if (!candidates.length) {host.innerHTML='<p>Denne regel har ingen øvesituation endnu. <a href="#theory">Åbn teorien</a></p>';return;}
        session = createJourneySession({sessionId:'journey-'+(globalThis.crypto?.randomUUID?.() || Date.now().toString(36)),kind:completed.length ? 'review' : 'lesson',question:candidates[completed.length % candidates.length],lesson:LESSONS[sectionId],questions:QUESTIONS,startedAt:Date.now()});
        if (stored && !restored) notify('Den gemte lektion kunne ikke genoptages. Din øvrige fremgang er bevaret.');
      }
      const sourceUi = resume ? stored.ui : null;
      ui = {answers:response(sourceUi?.answers),transferDraft:typeof sourceUi?.transferDraft === 'string' ? sourceUi.transferDraft.slice(0,5000) : '',recallDraft:typeof sourceUi?.recallDraft === 'string' ? sourceUi.recallDraft.slice(0,5000) : '',feedback:null};
      if (sourceUi?.feedback && resume) {
        const f=sourceUi.feedback, attempts=f.stage === 'apply' ? session.apply.attempts : session.checkpoint.attempts, last=attempts.at(-1);
        const validStage=f.stage === 'apply' ? (session.stage === 'apply' || session.stage === (session.kind === 'review' ? 'understand' : 'transfer')) : ['checkpoint','done'].includes(session.stage);
        const lastEvent=session.events.at(-1), expected=f.stage === 'apply' ? JOURNEY_ACTIONS.SUBMIT_APPLY : JOURNEY_ACTIONS.SUBMIT_CHECKPOINT;
        if (validStage && lastEvent?.type === expected && last && last.correct === f.correct && JSON.stringify(last.answers) === JSON.stringify(f.answers)) ui.feedback={questionId:f.stage === 'apply' ? session.questionId : session.checkpoint.questionId,order:f.stage === 'checkpoint' ? session.checkpoint.order : null,answers:[...last.answers],correct:last.correct,stage:f.stage};
      }
      save();render();
    },
    flush:save,
    dispose(){if(disposed)return;save();disposed=true;narrator.stop();visual?.dispose();host.removeEventListener('click',click);host.removeEventListener('input',input);}
  };
}
