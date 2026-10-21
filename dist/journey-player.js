import { sequenceFor } from './sequences.js';
import { ico } from './ui-icons.js';
import { CHAPTERS, QUESTIONS, SOURCES } from './content.js';
import { BOOSTER_RATES } from './mybil.js';
import { LESSONS } from './lessons.js';
import { renderQuestionVisual, mountQuestionVisual } from './exam-photo-view.js';
import { renderArt } from './art.js';
import { renderCast, castLine } from './cast.js';
import { createVoiceCue } from './voice-cues.js';
import {
  questionVoiceParts, questionFeedbackParts, lessonVoiceParts, lessonCaseVoiceParts,
  lessonAnswerVoiceParts, lessonRecallPromptParts, lessonRecallAnswerParts
} from './voice-texts.js';
import {
  createJourneySession, restoreJourneySession, transitionJourneySession,
  getJourneyStep, nextJourneyActionId, JOURNEY_ACTIONS
} from './journey-session.js';
import { getDailySummary, getJourneyRecommendations } from './journey-core.js';

const CONTENT = { questions: QUESTIONS, lessons: LESSONS };
const LESSON_STAGES = ['understand', 'apply', 'transfer', 'recall', 'checkpoint'];
const REVIEW_STAGES = ['apply', 'understand', 'transfer', 'recall', 'checkpoint'];
const STAGE_LABELS = {
  understand: 'Forstå', apply: 'Vælg', transfer: 'Brug', recall: 'Genkald', checkpoint: 'Prøv igen', done: 'Færdig'
};
const RESPONSE_LIMIT = 5000;
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
const response = value => Array.from({ length: 4 }, (_, index) => (
  typeof value?.[index] === 'boolean' ? value[index] : null
));
const voiceButton = (kind, label) => (
  `<button class="audio-btn voice-read" type="button" data-journey-voice="${kind}">${label}</button>`
);
const refs = (ids, locator = '') => `<div class="lesson-references">${(ids || [])
  .map(id => SOURCES.find(source => source.id === id))
  .filter(Boolean)
  .map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label.split(':')[0])} ↗</a>`)
  .join('')}<span>${esc(locator)}</span></div>`;

function firstUnanswered(answers) {
  const index = answers.findIndex(value => value === null);
  return index < 0 ? 3 : index;
}

/** Page-local controller. Factual content stays in the existing source-reviewed bank. */
export function createJourneyPlayer({
  host, getState, persist, onAssess, onComplete, onExperience = () => {}, narrator, notify = () => {}
}) {
  let session = null;
  let ui = null;
  let section = null;
  let visual = null;
  let disposed = false;
  let transitionTimer = null;
  let transitionGeneration = 0;
  let activeAnimation = null;
  let choiceLocked = false;
  let lastProgressPercent = null;
  let lastRenderedStage = null;

  const state = () => getState();
  const step = () => getJourneyStep(session, CONTENT);
  const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    || state()?.settings?.motion === false;

  function experience(event, details = {}) {
    try {
      onExperience(event, {
        sessionId: session?.sessionId ?? null,
        sectionId: session?.sectionId ?? null,
        kind: session?.kind ?? null,
        stage: session?.stage ?? null,
        ...details
      });
    } catch {
      // Optional effects must never interrupt learning state.
    }
  }

  function save() {
    if (!session || disposed) return;
    state().journeySessions ||= {};
    state().journeySessions[session.sectionId] = { session, ui, updatedAt: Date.now() };
    persist();
  }

  function cancelTransition() {
    transitionGeneration += 1;
    choiceLocked = false;
    if (transitionTimer !== null) clearTimeout(transitionTimer);
    transitionTimer = null;
    activeAnimation?.cancel();
    activeAnimation = null;
  }

  function currentQuestion() {
    if (ui?.feedback) {
      const question = QUESTIONS.find(item => item.id === ui.feedback.questionId);
      if (!question) return null;
      return ui.feedback.order
        ? { ...question, statements: ui.feedback.order.map(index => question.statements[index]) }
        : question;
    }
    return step()?.question ?? null;
  }

  function runAction(type, fields = {}) {
    narrator?.stop();
    const previousStage = session.stage;
    const result = transitionJourneySession(session, {
      type,
      actionId: nextJourneyActionId(session, type),
      at: Date.now(),
      ...fields
    }, CONTENT);
    if (!result.outcome.accepted) {
      notify('Dette trin er ikke klar endnu.');
      return null;
    }
    session = result.session;
    if (session.stage !== previousStage) experience('step', { from: previousStage, to: session.stage });
    return result.outcome;
  }

  function stageProgress(shownStage) {
    const stages = session.kind === 'review' ? REVIEW_STAGES : LESSON_STAGES;
    const stageIndex = shownStage === 'done' ? stages.length : Math.max(0, stages.indexOf(shownStage));
    let withinStage = 0;
    if (shownStage === 'understand') withinStage = session.cardsRead.filter(Boolean).length / 3;
    if (['apply', 'checkpoint'].includes(shownStage)) {
      withinStage = ui.feedback ? 1 : ui.answers.filter(value => value !== null).length / 4;
    }
    return {
      label: shownStage === 'done' ? 'Færdig' : STAGE_LABELS[shownStage],
      count: `${Math.min(stageIndex + 1, 5)} / 5`,
      percent: Math.min(100, ((stageIndex + withinStage) / stages.length) * 100)
    };
  }

  function shell(body) {
    const shownStage = ui?.feedback?.stage || session.stage;
    const progress = stageProgress(shownStage);
    return `<article class="journey-player" data-journey-session="${esc(session.sessionId)}">
      <header class="journey-player-head jp-top">
        <a class="back-btn jp-close" href="#home" aria-label="Gem lektionen og gå til din rute"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></a>
        <div class="journey-progress" role="progressbar" aria-label="Lektionens fremskridt" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress.percent)}"><i style="--journey-progress:${progress.percent}%"></i></div>
        <span class="journey-player-count">${progress.count}</span>
      </header>
      <div class="journey-player-title jp-title"><span>${session.kind === 'review' ? 'GENTAGELSE' : 'LEKTION'} · ${esc(progress.label)}</span><h1>${esc(section.title)}</h1></div>
      <div class="journey-player-body">${body}</div>
    </article>`;
  }

  function cardView(currentStep, lesson) {
    const currentIndex = Math.max(0, currentStep.cardsRead.findIndex(read => !read));
    const card = currentStep.cards[currentIndex] ?? currentStep.cards[2];
    const audioView = ui.audioCards
      ? `<div class="journey-audio-cards" aria-label="Alle tre kort, som oplæsningen dækker"><p>${esc(lesson.lead)}</p><p>Oplæsningen dækker alle tre kort:</p>${currentStep.cards.map((item, index) => `<article class="${index === currentIndex ? 'current' : ''}"><span>${index + 1}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p></div></article>`).join('')}</div>`
      : '';
    return `<section class="journey-card-step">
      <div class="journey-step-intro journey-step-intro--compact"><span class="journey-kicker">KORT ${currentIndex + 1} AF 3</span>${voiceButton('lesson', 'Lyt til alle tre kort')}</div>
      ${audioView}
      <article class="journey-focus-card"><span class="lesson-number">${currentIndex + 1}</span><div><h2>${esc(card.title)}</h2><p>${esc(card.body)}</p>${refs(card.sourceIds, card.sourceLocator)}</div></article>
      <div class="journey-control-dock"><p>${session.kind === 'review' ? 'Læs forklaringen efter dit kolde forsøg.' : 'Ét kort ad gangen.'}</p><button class="btn btn-primary" type="button" data-journey-card="${currentIndex}">${currentIndex === 2 ? 'Brug reglen →' : 'Næste kort →'}</button></div>
    </section>`;
  }

  function statementMarkup(question, index, { disabled = false } = {}) {
    const statement = question.statements[index];
    const answer = ui.answers[index];
    return `<article class="journey-statement" data-statement-index="${index}">
      <span class="statement-index">${index + 1}</span><p>${esc(statement.text)}</p>
      <div class="journey-choice-pair" role="group" aria-label="Udsagn ${index + 1}: ${esc(statement.text)}">
        <button type="button" class="journey-tactile-choice journey-yes ${answer === true ? 'selected' : ''}" data-journey-choice="${index}" data-value="true" aria-pressed="${answer === true}" ${disabled ? 'disabled' : ''}>JA</button>
        <button type="button" class="journey-tactile-choice journey-no ${answer === false ? 'selected' : ''}" data-journey-choice="${index}" data-value="false" aria-pressed="${answer === false}" ${disabled ? 'disabled' : ''}>NEJ</button>
      </div>
    </article>`;
  }

  function assessmentDock() {
    const completed = ui.answers.every(value => value !== null);
    return `<div class="journey-control-dock journey-assessment-dock">
      <button class="journey-back-statement" aria-label="Tilbage til forrige udsagn" type="button" data-journey-statement-prev ${ui.statementIndex === 0 ? 'disabled' : ''}>← Tilbage</button>
      <div class="journey-statement-dots" aria-label="Fire udsagn">${ui.answers.map((answer, index) => `<button type="button" data-journey-statement="${index}" class="${index === ui.statementIndex ? 'current' : ''} ${answer !== null ? 'answered' : ''}" aria-label="Gå til udsagn ${index + 1}" ${index === ui.statementIndex ? 'aria-current="step"' : ''}>${index + 1}</button>`).join('')}</div>
      <button class="btn btn-primary" type="button" data-journey-submit ${completed ? '' : 'disabled'}>${completed ? 'Tjek alle fire →' : `${ui.answers.filter(value => value !== null).length}/4 vurderet`}</button>
    </div>`;
  }

  function feedbackTray(question) {
    const feedback = ui.feedback;
    const repair = !feedback.correct;
    return `<aside class="journey-feedback-tray ${repair ? 'repair' : 'correct'}" role="status">
      <div class="feedback-cast">${renderCast(repair ? 'kegle' : 'blink', { size: 'sm', mood: repair ? 'wrong' : 'correct', line: castLine(repair ? 'wrong' : 'correct', question.id) })}</div>
      <div class="journey-feedback-summary"><span aria-hidden="true">${repair ? ico('repeat') : ico('check')}</span><div><strong>${repair ? 'Næsten!' : 'Godt set!'}</strong><p>${repair ? 'Se det afgørende, og vurdér de fire udsagn igen.' : 'Alle fire udsagn er vurderet korrekt.'}</p></div></div>
      ${state()?.settings?.humor === true && question.gag ? `<p class="journey-feedback-gag">${esc(question.gag)}</p>` : ''}
      <details><summary>Se reglen og alle fire svar</summary><p>${esc(question.explanation)}</p>
        <div class="journey-answer-review">${question.statements.map((statement, index) => `<div class="${feedback.answers[index] === statement.correct ? 'right' : 'wrong'}"><span>${feedback.answers[index] === statement.correct ? ico('check') : ico('repeat')}</span><p>${esc(statement.text)}</p><b>${statement.correct ? 'JA' : 'NEJ'}</b></div>`).join('')}</div>
        ${refs(question.sourceIds)}${voiceButton('feedback', 'Lyt til forklaringen')}
      </details>
      <a class="jp-ask" href="#chat" data-chat-ask="${esc(question.id)}">Spørg Sneglen om det her</a>
      <button class="btn btn-primary jp-feedback-go" data-journey-continue-feedback type="button">${repair ? 'Prøv igen' : 'Videre'}</button>
    </aside>`;
  }

  function assessmentView(currentStep) {
    const question = currentQuestion() ?? currentStep.question;
    const feedback = ui.feedback;
    const notice = currentStep.stage === 'checkpoint' || feedback?.stage === 'checkpoint'
      ? `<p class="journey-checkpoint-note">${currentStep.notice || (session.checkpoint.reordered ? 'Samme situation med omordnede udsagn.' : 'Et andet spørgsmål fra samme emne.')}</p>`
      : '';
    return `<section class="journey-assessment">
      ${notice}
      <header class="journey-exercise-context"><span class="journey-kicker">${session.kind === 'review' && (currentStep.stage === 'apply' || feedback?.stage === 'apply') ? 'KOLD GENKALDELSE · FØR KORTENE' : 'VURDÉR FIRE UDSAGN'}</span><h2>${esc(question.prompt)}</h2><p class="question-context">${esc(question.context)}</p>${voiceButton('question', 'Læs situationen op')}</header>
      ${renderQuestionVisual(question)}
      <section class="journey-statement-panel"><div class="journey-statement-head"><span>UDSAGN</span><b><span data-journey-statement-count aria-hidden="true">${ui.statementIndex + 1} / 4</span><span class="journey-sr-only" data-journey-statement-announcement aria-live="polite" aria-atomic="true">Udsagn ${ui.statementIndex + 1} af 4</span></b></div><div class="journey-statement-stage">${statementMarkup(question, ui.statementIndex, { disabled: Boolean(feedback) })}</div></section>
      ${feedback ? feedbackTray(question) : assessmentDock()}
    </section>`;
  }

  function writingForm(stage, label, placeholder) {
    const draft = stage === 'transfer' ? ui.transferDraft : ui.recallDraft;
    return `<div class="journey-writing-form"><label for="journey-open-answer">${label}</label><textarea id="journey-open-answer" maxlength="${RESPONSE_LIMIT}" rows="4" placeholder="${esc(placeholder)}">${esc(draft)}</textarea><div class="journey-writing-actions"><button type="button" class="btn btn-secondary" data-journey-cancel-writing>Tilbage til mentalt bud</button><button type="button" class="btn btn-primary" data-journey-open-submit ${draft.trim() ? '' : 'disabled'}>Sammenlign →</button></div></div>`;
  }

  function responseDock(stage, currentStep) {
    if (currentStep.revealed) {
      if (stage === 'recall') {
        return `<div class="journey-control-dock journey-self-check"><p>Vurdér selv. Dine ord er ikke automatisk bedømt.</p><button class="btn btn-secondary" type="button" data-journey-self-check="needs-review">Genkald igen senere</button><button class="btn btn-primary" type="button" data-journey-self-check="remembered">Jeg havde det centrale med →</button></div>`;
      }
      return `<div class="journey-control-dock"><p>Sammenlign handling og begrundelse.</p><button class="btn btn-primary" type="button" data-journey-transfer-next>Til genkaldelse →</button></div>`;
    }
    if (currentStep.committed) {
      return `<div class="journey-control-dock"><p>Dit mentale bud er registreret. Det er ikke automatisk bedømt.</p><button class="btn btn-primary" type="button" data-journey-reveal="${stage}">Vis svaret →</button></div>`;
    }
    return `<div class="journey-control-dock journey-response-choice"><p>Svar mentalt, eller skriv med egne ord.</p><button class="btn btn-secondary" type="button" data-journey-write="${stage}">Skriv mit bud</button><button class="btn btn-primary" type="button" data-journey-mental="${stage}">Jeg har et bud →</button></div>`;
  }

  function openStepView(currentStep) {
    const isTransfer = currentStep.stage === 'transfer';
    const stage = isTransfer ? 'transfer' : 'recall';
    const voiceKind = isTransfer ? 'case' : 'recall';
    const answer = currentStep.answer;
    const ownAnswer = currentStep.responseMode === 'written'
      ? `<div class="journey-own-answer"><span>DIT SKRIFTLIGE BUD</span><p>${esc(answer)}</p></div>`
      : currentStep.committed ? '<div class="journey-mental-note">Mentalt bud gemt · sammenlign selv, når svaret vises</div>' : '';
    const modelAnswer = currentStep.revealed
      ? (isTransfer
        ? `<div class="journey-model-answer"><h3>Handlingen</h3><p>${esc(currentStep.modelAnswer.action)}</p><h3>Derfor</h3><p>${esc(currentStep.modelAnswer.why)}</p>${voiceButton('answer', 'Lyt til handlingen')}${refs(currentStep.case.sourceIds, currentStep.case.sourceLocator)}</div>`
        : `<div class="journey-model-answer"><h3>Sammenlign med forklaringen</h3><p>${esc(currentStep.modelAnswer)}</p>${voiceButton('recall-answer', 'Lyt til svaret')}</div>`)
      : '';
    const writing = ui.writingStage === stage && !currentStep.committed
      ? writingForm(stage, isTransfer ? 'Dit næste træk og hvorfor' : 'Forklar reglen uden at kigge i kortene', isTransfer ? 'Hvad ville du gøre?' : 'Hvad husker du?')
      : '';
    return `<section class="journey-open-step">
      <span class="journey-kicker">${isTransfer ? 'BRUG REGLEN I EN NY CASE' : 'HENT REGLEN FREM'}</span>
      <h2>${isTransfer ? 'Hvad ville du gøre?' : esc(currentStep.prompt)}</h2>
      ${isTransfer ? `<p class="journey-case-context">${esc(currentStep.case.context)}</p>` : ''}
      ${voiceButton(voiceKind, isTransfer ? 'Lyt til casen' : 'Lyt til spørgsmålet')}
      ${writing}${ownAnswer}${modelAnswer}${ui.writingStage === stage && !currentStep.committed ? '' : responseDock(stage, currentStep)}
    </section>`;
  }

  function doneView(currentStep, lesson) {
    const evidence = currentStep.evidence;
    const repaired = evidence.apply.hadWrong || evidence.checkpoint.hadWrong;
    const now = Date.now();
    const currentState = state();
    const daily = getDailySummary(currentState.journey, now);
    const recommendations = getJourneyRecommendations({
      chapters: CHAPTERS,
      lessons: LESSONS,
      questions: QUESTIONS,
      journey: currentState.journey,
      records: currentState.records,
      now
    });
    const next = recommendations.recommended;
    const nextLink = next ? `#journey:${esc(next.sectionId)}` : '#home';
    const nextLabel = next ? `Næste: ${esc(next.title)} →` : 'Til min rute →';
    const streak = daily.currentStreak > 0 ? `<span>${daily.currentStreak} ${daily.currentStreak === 1 ? 'dag' : 'dage'} i træk</span>` : '';
    const completionActions = session.finalizedAt
      ? (daily.goalMet
        ? `<a class="btn btn-secondary" href="${nextLink}">${next ? nextLabel : 'Åbn min rute'}</a><a class="btn btn-primary" href="#home">Til min rute →</a>`
        : `<a class="btn btn-secondary" href="#home">Til min rute</a><a class="btn btn-primary" href="${nextLink}">${nextLabel}</a>`)
      : '<button class="btn btn-primary" type="button" data-journey-finish>Gem lektionen →</button>';
    // Boosters come once per lesson per day: before saving, this lesson earns them if it has no event today yet
    const todays = (currentState.journey?.events || []).filter(e => e.kind === 'lesson' && e.sectionId === section.id && e.day === daily.day).length;
    const earns = session.finalizedAt ? todays === 1 : todays === 0;
    const firstTry = [evidence.apply, evidence.checkpoint].filter(x => x && !x.hadWrong).length;
    return `<section class="journey-lesson-done ${session.finalizedAt ? 'is-finalized' : ''}">
      <div class="journey-celebration" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="journey-done-art">${renderCast(repaired ? 'kegle' : 'bobbel', { size: 'md', mood: 'correct', priority: true })}</div>
      <h2 class="jp-done-title">${repaired ? 'Repareret og klaret!' : 'Lektion klaret!'}</h2>
      <p class="jp-done-lead">${esc(section.title)} sidder nu. ${repaired ? 'Du fandt fejlen og rettede den, og det er sådan, det sætter sig.' : 'Den kommer tilbage som gentagelse, så den bliver siddende.'}</p>
      <div class="jp-done-stats"><div><small>BOOSTERS</small><strong>${ico('bolt')} ${earns ? `+${BOOSTER_RATES.lesson.toLocaleString('da-DK')}` : '0'}</strong>${earns ? '' : '<em>Tjent i dag allerede</em>'}</div><div><small>FØRSTE FORSØG</small><strong>${firstTry}/2</strong></div></div>
      ${sequenceFor(section.id) ? `<a class="jp-order" href="#order:${esc(sequenceFor(section.id).id)}">${ico('list')}<span><strong>Sæt det i rækkefølge</strong><small>${esc(sequenceFor(section.id).title)} · ${sequenceFor(section.id).steps.length} trin</small></span></a>` : ''}
      <div class="jp-done-goal ${daily.goalMet ? 'is-met' : ''}">${ico('target')} ${daily.goalMet ? `Dagens mål nået · +${BOOSTER_RATES.dailyGoal.toLocaleString('da-DK')}` : `Dagens mål: ${daily.completedSessions}/${daily.dailyGoal}`}${streak ? ` · ${streak}` : ''}</div>
      ${lesson.practicalNote ? `<details class="journey-practical-note"><summary>Tag det med til kørelæreren</summary><p>${esc(lesson.practicalNote)}</p></details>` : ''}
      <div class="journey-control-dock">${completionActions}</div>
    </section>`;
  }

  function mountVisual() {
    const question = currentQuestion();
    const photo = host.querySelector('.scene-photo');
    if (photo && question) visual = mountQuestionVisual(photo, question, { onOpen: () => narrator?.stop() });
  }

  function setProgress(percent, { animate = true } = {}) {
    const progress = host.querySelector('.journey-progress');
    const fill = progress?.querySelector('i');
    if (!progress || !fill) return;
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    progress.setAttribute('aria-valuenow', String(Math.round(safePercent)));
    fill.style.setProperty('--journey-progress', `${safePercent}%`);
    if (!animate || reducedMotion()) fill.style.transition = 'none';
    else fill.style.removeProperty('transition');
    lastProgressPercent = safePercent;
  }

  function render({ focus = true, direction = 0 } = {}) {
    if (disposed || !session) return;
    const mountedProgress = Number(host.querySelector('.journey-progress')?.getAttribute('aria-valuenow'));
    const previousProgress = lastProgressPercent ?? (Number.isFinite(mountedProgress) ? mountedProgress : null);
    cancelTransition();
    const renderGeneration = transitionGeneration;
    visual?.dispose();
    visual = null;
    narrator?.stop();
    const currentStep = step();
    const lesson = LESSONS[session.sectionId];
    if (!currentStep) {
      host.innerHTML = '<p>Lektionen kunne ikke gendannes. <a href="#home">Til din rute</a></p>';
      return;
    }
    let body;
    if (currentStep.stage === 'understand') body = cardView(currentStep, lesson);
    else if (['apply', 'checkpoint'].includes(currentStep.stage) || ui.feedback) body = assessmentView(currentStep);
    else if (['transfer', 'recall'].includes(currentStep.stage)) body = openStepView(currentStep);
    else body = doneView(currentStep, lesson);
    const shownStage = ui.feedback?.stage || currentStep.stage;
    const stageChanged = lastRenderedStage !== null && shownStage !== lastRenderedStage;
    host.innerHTML = shell(body);
    const targetProgress = Number(host.querySelector('.journey-progress')?.getAttribute('aria-valuenow')) || 0;
    if (previousProgress === null) setProgress(targetProgress, { animate: false });
    else {
      setProgress(previousProgress, { animate: false });
      const fill = host.querySelector('.journey-progress i');
      if (fill) void fill.offsetWidth;
      if (reducedMotion()) setProgress(targetProgress, { animate: false });
      else requestAnimationFrame(() => {
        if (!disposed && renderGeneration === transitionGeneration) setProgress(targetProgress, { animate: true });
      });
    }
    mountVisual();
    if (stageChanged) globalThis.scrollTo?.({ top: 0, behavior: 'instant' });
    lastRenderedStage = shownStage;
    const directionalCard = direction && host.querySelector('.journey-focus-card');
    if (directionalCard?.animate && !reducedMotion()) {
      activeAnimation = directionalCard.animate([
        { opacity: 0, transform: `translateX(${direction * 28}px)` },
        { opacity: 1, transform: 'translateX(0)' }
      ], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    if (focus) {
      const heading = host.querySelector('.journey-player-body h2') || host.querySelector('h1');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }
  }

  function updateAssessmentControls() {
    const dock = host.querySelector('.journey-assessment-dock');
    if (dock) dock.outerHTML = assessmentDock();
    const count = host.querySelector('[data-journey-statement-count]');
    if (count) count.textContent = `${ui.statementIndex + 1} / 4`;
    const announcement = host.querySelector('[data-journey-statement-announcement]');
    if (announcement) announcement.textContent = `Udsagn ${ui.statementIndex + 1} af 4`;
    setProgress(stageProgress(session.stage).percent);
  }

  function showStatement(index, direction = 1) {
    if (disposed || ui.feedback || !Number.isInteger(index) || index < 0 || index > 3) return;
    const question = currentQuestion();
    const stage = host.querySelector('.journey-statement-stage');
    if (!question || !stage) return;
    const replace = () => {
      if (disposed || !stage.isConnected) return;
      ui.statementIndex = index;
      stage.innerHTML = statementMarkup(question, index);
      updateAssessmentControls();
      save();
      const card = stage.firstElementChild;
      const statementText = card?.querySelector('p');
      statementText?.setAttribute('tabindex', '-1');
      statementText?.focus({ preventScroll: true });
      if (!reducedMotion() && card?.animate) {
        activeAnimation = card.animate([
          { opacity: 0, transform: `translateX(${direction * 22}px)` },
          { opacity: 1, transform: 'translateX(0)' }
        ], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    };
    if (!reducedMotion() && stage.firstElementChild?.animate) {
      activeAnimation?.cancel();
      activeAnimation = stage.firstElementChild.animate([
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: `translateX(${-direction * 16}px)` }
      ], { duration: 120, easing: 'ease-in', fill: 'forwards' });
      activeAnimation.finished.then(replace).catch(() => {});
    } else replace();
  }

  function scheduleNextStatement(index) {
    const generation = ++transitionGeneration;
    choiceLocked = true;
    transitionTimer = setTimeout(() => {
      transitionTimer = null;
      if (disposed || generation !== transitionGeneration) return;
      choiceLocked = false;
      showStatement(index + 1, 1);
    }, reducedMotion() ? 0 : 220);
  }

  function read(button) {
    const kind = button.dataset.journeyVoice;
    const lesson = LESSONS[session.sectionId];
    const question = currentQuestion();
    if (kind === 'lesson' && !ui.audioCards) {
      ui.audioCards = true;
      save();
      render({ focus: false });
      button = host.querySelector('[data-journey-voice="lesson"]');
    }
    const getters = {
      question: () => questionVoiceParts(question),
      feedback: () => questionFeedbackParts(question, { humor: state()?.settings?.humor === true }),
      lesson: () => lessonVoiceParts(lesson),
      case: () => lessonCaseVoiceParts(lesson),
      answer: () => lessonAnswerVoiceParts(lesson),
      recall: () => lessonRecallPromptParts(lesson),
      'recall-answer': () => lessonRecallAnswerParts(lesson)
    };
    const parts = getters[kind]?.() || [];
    const rows = kind === 'question'
      ? [[host.querySelector('.journey-exercise-context h2'), host.querySelector('.journey-exercise-context .question-context')], host.querySelector('.journey-statement-stage')]
      : [host.querySelector('.journey-player-body')];
    if (parts.length && button) void narrator?.read(parts, { label: button.textContent.trim(), trigger: button, onPart: createVoiceCue(rows) });
  }

  function submitAssessment(button) {
    const currentStep = step();
    if (!['apply', 'checkpoint'].includes(currentStep?.stage) || ui.answers.some(value => value === null)) return;
    button.disabled = true;
    const question = currentStep.question;
    const answers = [...ui.answers];
    const stage = currentStep.stage;
    const type = stage === 'apply' ? JOURNEY_ACTIONS.SUBMIT_APPLY : JOURNEY_ACTIONS.SUBMIT_CHECKPOINT;
    const result = runAction(type, { answers });
    if (!result) return;
    ui.feedback = {
      questionId: question.id,
      order: stage === 'checkpoint' ? [...session.checkpoint.order] : null,
      answers,
      correct: result.correct,
      stage
    };
    onAssess?.(question, answers);
    const attempts = stage === 'apply' ? session.apply.attempts : session.checkpoint.attempts;
    const hadWrong = attempts.slice(0, -1).some(attempt => attempt.correct === false);
    experience(result.correct ? 'correct' : 'repair', { assessment: stage, hadWrong });
    save();
    render();
  }

  function finalize() {
    const result = runAction(JOURNEY_ACTIONS.FINALIZE);
    if (!result?.evidence) return false;
    experience('complete', { evidence: result.evidence });
    onComplete?.(result.evidence, session);
    return true;
  }

  function click(event) {
    if (disposed || !session) return;
    const button = event.target.closest('button');
    if (!button || !host.contains(button)) return;
    if (button.hasAttribute('data-journey-voice')) { read(button); return; }
    if (button.hasAttribute('data-journey-choice') && !ui.feedback) {
      if (choiceLocked) return;
      const index = Number(button.dataset.journeyChoice);
      if (!Number.isInteger(index) || index !== ui.statementIndex || index < 0 || index > 3) return;
      const value = button.dataset.value === 'true';
      ui.answers[index] = value;
      button.closest('.journey-choice-pair')?.querySelectorAll('button').forEach(choice => {
        const selected = choice === button;
        choice.classList.toggle('selected', selected);
        choice.setAttribute('aria-pressed', String(selected));
      });
      experience('selection', { assessment: session.stage, statementIndex: index, value });
      save();
      updateAssessmentControls();
      if (index < 3) scheduleNextStatement(index);
      return;
    }
    if (button.hasAttribute('data-journey-statement-prev')) {
      cancelTransition();
      showStatement(ui.statementIndex - 1, -1);
      save();
      return;
    }
    if (button.hasAttribute('data-journey-statement')) {
      const index = Number(button.dataset.journeyStatement);
      const direction = index < ui.statementIndex ? -1 : 1;
      cancelTransition();
      showStatement(index, direction);
      save();
      return;
    }
    if (button.hasAttribute('data-journey-card')) {
      const index = Number(button.dataset.journeyCard);
      if (runAction(JOURNEY_ACTIONS.READ_CARD, { index })) {
        experience('card-advance', { cardIndex: index, cardsRead: session.cardsRead.filter(Boolean).length });
        ui.audioCards = false;
        save();
        render({ direction: 1 });
      }
      return;
    }
    if (button.hasAttribute('data-journey-submit') && !ui.feedback) { submitAssessment(button); return; }
    if (button.hasAttribute('data-journey-continue-feedback') && ui.feedback) {
      const finished = ui.feedback.correct && session.stage === 'done';
      ui.feedback = null;
      ui.answers = [null, null, null, null];
      ui.statementIndex = 0;
      if (finished) finalize();
      save();
      render();
      return;
    }
    if (button.hasAttribute('data-journey-write')) {
      ui.writingStage = button.dataset.journeyWrite;
      save();
      render();
      return;
    }
    if (button.hasAttribute('data-journey-cancel-writing')) {
      ui.writingStage = null;
      save();
      render();
      return;
    }
    if (button.hasAttribute('data-journey-open-submit')) {
      const currentStep = step();
      const isTransfer = currentStep.stage === 'transfer';
      const answer = isTransfer ? ui.transferDraft : ui.recallDraft;
      const type = isTransfer ? JOURNEY_ACTIONS.SUBMIT_TRANSFER : JOURNEY_ACTIONS.SUBMIT_RECALL;
      if (runAction(type, { answer })) {
        ui.writingStage = null;
        save();
        render();
      }
      return;
    }
    if (button.hasAttribute('data-journey-mental')) {
      const type = button.dataset.journeyMental === 'transfer' ? JOURNEY_ACTIONS.COMMIT_TRANSFER_MENTAL : JOURNEY_ACTIONS.COMMIT_RECALL_MENTAL;
      if (runAction(type)) { save(); render(); }
      return;
    }
    if (button.hasAttribute('data-journey-reveal')) {
      const type = button.dataset.journeyReveal === 'transfer' ? JOURNEY_ACTIONS.REVEAL_TRANSFER : JOURNEY_ACTIONS.REVEAL_RECALL;
      if (runAction(type)) { save(); render(); }
      return;
    }
    if (button.hasAttribute('data-journey-transfer-next')) {
      if (runAction(JOURNEY_ACTIONS.CONTINUE_TRANSFER)) { save(); render(); }
      return;
    }
    if (button.hasAttribute('data-journey-self-check')) {
      if (runAction(JOURNEY_ACTIONS.SELF_CHECK_RECALL, { selfCheck: button.dataset.journeySelfCheck })) { save(); render(); }
      return;
    }
    if (button.hasAttribute('data-journey-finish') && finalize()) { save(); render(); }
  }

  function input(event) {
    if (event.target.id !== 'journey-open-answer') return;
    const currentStep = step();
    if (!['transfer', 'recall'].includes(currentStep?.stage)) return;
    const value = event.target.value.slice(0, RESPONSE_LIMIT);
    if (currentStep.stage === 'transfer') ui.transferDraft = value;
    else ui.recallDraft = value;
    const submit = host.querySelector('[data-journey-open-submit]');
    if (submit) submit.disabled = !value.trim();
    save();
  }

  host.addEventListener('click', click);
  host.addEventListener('input', input);

  return {
    mount(sectionId) {
      section = CHAPTERS.flatMap(chapter => chapter.sections).find(item => item.id === sectionId);
      if (!section || !LESSONS[sectionId]) {
        host.innerHTML = '<p>Lektionen findes ikke. <a href="#home">Til din rute</a></p>';
        return;
      }
      const stored = state().journeySessions?.[sectionId];
      const restored = restoreJourneySession(stored?.session, CONTENT);
      const resume = Boolean(restored) && (restored.stage !== 'done' || !restored.finalizedAt);
      if (resume) session = restored;
      else {
        const completed = state().journey?.events?.filter(event => event.sectionId === sectionId) || [];
        const candidates = QUESTIONS.filter(question => question.sectionId === sectionId);
        if (!candidates.length) {
          host.innerHTML = '<p>Denne regel har ingen øvesituation endnu. <a href="#theory">Åbn teorien</a></p>';
          return;
        }
        session = createJourneySession({
          sessionId: `journey-${globalThis.crypto?.randomUUID?.() || Date.now().toString(36)}`,
          kind: completed.length ? 'review' : 'lesson',
          question: candidates[completed.length % candidates.length],
          lesson: LESSONS[sectionId], questions: QUESTIONS, startedAt: Date.now()
        });
        if (stored && !restored) notify('Den gemte lektion kunne ikke genoptages. Din øvrige fremgang er bevaret.');
      }

      const sourceUi = resume ? stored.ui : null;
      const answers = response(sourceUi?.answers);
      ui = {
        answers,
        statementIndex: Number.isInteger(sourceUi?.statementIndex) && sourceUi.statementIndex >= 0 && sourceUi.statementIndex < 4 ? sourceUi.statementIndex : firstUnanswered(answers),
        transferDraft: typeof sourceUi?.transferDraft === 'string' ? sourceUi.transferDraft.slice(0, RESPONSE_LIMIT) : '',
        recallDraft: typeof sourceUi?.recallDraft === 'string' ? sourceUi.recallDraft.slice(0, RESPONSE_LIMIT) : '',
        writingStage: ['transfer', 'recall'].includes(sourceUi?.writingStage) ? sourceUi.writingStage : null,
        audioCards: false,
        feedback: null
      };

      if (sourceUi?.feedback && resume) {
        const feedback = sourceUi.feedback;
        const attempts = feedback.stage === 'apply' ? session.apply.attempts : session.checkpoint.attempts;
        const lastAttempt = attempts.at(-1);
        const validStage = feedback.stage === 'apply'
          ? (session.stage === 'apply' || session.stage === (session.kind === 'review' ? 'understand' : 'transfer'))
          : ['checkpoint', 'done'].includes(session.stage);
        const lastEvent = session.events.at(-1);
        const expectedType = feedback.stage === 'apply' ? JOURNEY_ACTIONS.SUBMIT_APPLY : JOURNEY_ACTIONS.SUBMIT_CHECKPOINT;
        if (validStage && lastEvent?.type === expectedType && lastAttempt
          && lastAttempt.correct === feedback.correct
          && JSON.stringify(lastAttempt.answers) === JSON.stringify(feedback.answers)) {
          ui.feedback = {
            questionId: feedback.stage === 'apply' ? session.questionId : session.checkpoint.questionId,
            order: feedback.stage === 'checkpoint' ? [...session.checkpoint.order] : null,
            answers: [...lastAttempt.answers], correct: lastAttempt.correct, stage: feedback.stage
          };
          ui.answers = [...lastAttempt.answers];
          ui.statementIndex = 3;
        }
      }
      save();
      render();
    },
    flush: save,
    refresh() { render({ focus: false }); },
    dispose() {
      if (disposed) return;
      save();
      disposed = true;
      cancelTransition();
      narrator?.stop();
      visual?.dispose();
      host.removeEventListener('click', click);
      host.removeEventListener('input', input);
    }
  };
}
