import test from 'node:test';
import assert from 'node:assert/strict';

import { QUESTIONS } from '../dist/content.js';
import { LESSONS } from '../dist/lessons.js';
import {
  JOURNEY_ACTIONS,
  createJourneySession,
  getJourneyCompletionEvidence,
  getJourneyStep,
  isJourneyComplete,
  nextJourneyActionId,
  restoreJourneySession,
  serializeJourneySession,
  transitionJourneySession
} from '../dist/journey-session.js';

const content = { questions: QUESTIONS, lessons: LESSONS };
const correctAnswers = question => question.statements.map(statement => statement.correct);
const wrongAnswers = question => correctAnswers(question).map(value => !value);

function create(question = QUESTIONS[0], overrides = {}) {
  return createJourneySession({
    sessionId: `journey-test-${question.id}`,
    kind: 'lesson',
    question,
    lesson: LESSONS[question.sectionId],
    questions: QUESTIONS,
    startedAt: 1000,
    ...overrides
  });
}

function dispatch(session, type, fields = {}) {
  const result = transitionJourneySession(session, {
    type,
    actionId: nextJourneyActionId(session, type),
    at: 1000 + session.events.length + 1,
    ...fields
  }, content);
  assert.equal(result.outcome.accepted, true, result.outcome.reason);
  return result;
}

function readAllCards(session) {
  for (const index of [0, 1, 2]) session = dispatch(session, JOURNEY_ACTIONS.READ_CARD, { index }).session;
  return session;
}

function reachCheckpoint(session, applyAnswers) {
  if (session.kind === 'review') {
    session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_APPLY, { answers: applyAnswers }).session;
    session = readAllCards(session);
  } else {
    session = readAllCards(session);
    session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_APPLY, { answers: applyAnswers }).session;
  }
  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_TRANSFER, { answer: 'Jeg vil først skabe overblik og handle roligt.' }).session;
  session = dispatch(session, JOURNEY_ACTIONS.CONTINUE_TRANSFER).session;
  const recalled = dispatch(session, JOURNEY_ACTIONS.SUBMIT_RECALL, { answer: 'Jeg forklarer reglen med mine egne ord.' });
  assert.equal(recalled.outcome.autoAssessed, false);
  session = recalled.session;
  return dispatch(session, JOURNEY_ACTIONS.SELF_CHECK_RECALL, { selfCheck: 'needs-review' }).session;
}

test('hele femtrinsløbet kræver tre kort, fire faktiske svar, selvcheck og korrekt checkpoint', () => {
  const question = QUESTIONS[0];
  let session = create(question);
  assert.equal(session.stage, 'understand');
  assert.equal(getJourneyCompletionEvidence(session), null);

  session = readAllCards(session);
  assert.equal(session.stage, 'apply');

  const partial = transitionJourneySession(session, {
    type: JOURNEY_ACTIONS.SUBMIT_APPLY,
    actionId: 'partial-apply',
    at: 1004,
    answers: [true, false, null, true]
  }, content);
  assert.equal(partial.outcome.accepted, false);
  assert.equal(partial.outcome.reason, 'four-boolean-answer-required');
  assert.equal(partial.session.events.length, session.events.length);

  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_APPLY, { answers: wrongAnswers(question) }).session;
  assert.equal(session.stage, 'apply', 'en forkert vurdering repareres straks i samme trin');
  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_APPLY, { answers: correctAnswers(question) }).session;
  assert.equal(session.stage, 'transfer');
  assert.deepEqual(session.apply.attempts.map(attempt => attempt.correct), [false, true], 'den første fejl må ikke overskrives');

  const transferred = dispatch(session, JOURNEY_ACTIONS.SUBMIT_TRANSFER, { answer: 'Jeg indstiller sædet før spejlene.' });
  assert.equal(transferred.outcome.modelAnswer.action, LESSONS[question.sectionId].case.action);
  session = transferred.session;
  assert.equal(session.stage, 'transfer', 'modelsvar vises før eleven går videre');
  session = dispatch(session, JOURNEY_ACTIONS.CONTINUE_TRANSFER).session;

  const recalled = dispatch(session, JOURNEY_ACTIONS.SUBMIT_RECALL, { answer: 'Sædet ændrer min synsvinkel.' });
  assert.equal(recalled.outcome.autoAssessed, false);
  assert.equal(recalled.outcome.modelAnswer, LESSONS[question.sectionId].recall.answer);
  session = recalled.session;
  assert.equal(session.stage, 'recall');
  session = dispatch(session, JOURNEY_ACTIONS.SELF_CHECK_RECALL, { selfCheck: 'remembered' }).session;
  assert.equal(session.stage, 'checkpoint');

  const checkpointStep = getJourneyStep(session, content);
  assert.equal(checkpointStep.reordered, true);
  assert.match(checkpointStep.notice, /omordnet/);
  assert.equal(checkpointStep.question.id, question.id);
  assert.notDeepEqual(checkpointStep.question.statements.map(statement => statement.text), question.statements.map(statement => statement.text));

  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_CHECKPOINT, { answers: wrongAnswers(checkpointStep.question) }).session;
  assert.equal(session.stage, 'checkpoint');
  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_CHECKPOINT, { answers: correctAnswers(checkpointStep.question) }).session;
  assert.equal(session.stage, 'done');
  assert.equal(isJourneyComplete(session), true);

  const evidence = getJourneyCompletionEvidence(session);
  assert.deepEqual(evidence, {
    sessionId: session.sessionId,
    sectionId: question.sectionId,
    kind: 'lesson',
    objectiveComplete: true,
    cardsCompleted: 3,
    apply: { graded: true, hadWrong: true, repaired: true, correct: true },
    recall: { selfChecked: true },
    checkpoint: { graded: true, hadWrong: true, repaired: true, correct: true, questionId: question.id },
    startedAt: 1000,
    completedAt: session.completedAt
  });
  assert.deepEqual(session.checkpoint.attempts.map(attempt => attempt.correct), [false, true]);
});

test('checkpoint bruger et andet spørgsmål fra samme afsnit, når et findes', () => {
  const question = QUESTIONS.find(candidate => candidate.id === 'q-022');
  let session = create(question, { kind: 'review' });
  session = reachCheckpoint(session, correctAnswers(question));

  const step = getJourneyStep(session, content);
  assert.equal(step.reordered, false);
  assert.notEqual(step.question.id, question.id);
  assert.equal(step.question.sectionId, question.sectionId);
  assert.match(step.notice, /Nyt spørgsmål/);

  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_CHECKPOINT, { answers: correctAnswers(step.question) }).session;
  const evidence = getJourneyCompletionEvidence(session);
  assert.equal(evidence.kind, 'review');
  assert.equal(evidence.checkpoint.questionId, step.question.id);
  assert.equal(evidence.checkpoint.hadWrong, false);
  assert.equal(evidence.checkpoint.repaired, false);
  assert.equal(evidence.apply.hadWrong, false);
  assert.equal(evidence.apply.repaired, false);
});

test('review starter med kold Apply før nogen regelkort afsløres', () => {
  const question = QUESTIONS[0];
  let session = create(question, { kind: 'review' });

  assert.equal(session.stage, 'apply');
  assert.deepEqual(session.cardsRead, [false, false, false]);
  const step = getJourneyStep(session, content);
  assert.equal(step.stage, 'apply');
  assert.equal(step.question.id, question.id);
  assert.equal(Object.hasOwn(step, 'cards'), false);

  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_APPLY, { answers: correctAnswers(question) }).session;
  assert.equal(session.stage, 'understand');
  assert.deepEqual(session.cardsRead, [false, false, false], 'kold retrieval må ikke fabrikere læste kort');
  session = readAllCards(session);
  assert.equal(session.stage, 'transfer');
});

test('forkert kold review-vurdering repareres før kortene og bevarer første fejl', () => {
  const question = QUESTIONS[0];
  let session = create(question, { kind: 'review', sessionId: 'journey-review-repair' });

  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_APPLY, { answers: wrongAnswers(question) }).session;
  assert.equal(session.stage, 'apply');
  assert.deepEqual(session.cardsRead, [false, false, false]);
  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_APPLY, { answers: correctAnswers(question) }).session;
  assert.equal(session.stage, 'understand');
  assert.deepEqual(session.apply.attempts.map(attempt => attempt.correct), [false, true]);

  session = readAllCards(session);
  assert.equal(session.stage, 'transfer');
  assert.ok(restoreJourneySession(serializeJourneySession(session), content), 'review-rækkefølgen kan gendannes ved canonical replay');
});

test('genindlæsning afviser korrupt, forfalsket, transient og ændret indhold', () => {
  let session = readAllCards(create());
  assert.ok(restoreJourneySession(serializeJourneySession(session), content));
  assert.equal(restoreJourneySession('{ikke json', content), null);
  assert.equal(restoreJourneySession({ ...session, stage: 'done', completedAt: 9999 }, content), null);
  assert.equal(restoreJourneySession({ ...session, draftAnswers: [true, false, true, false] }, content), null);
  assert.equal(restoreJourneySession({
    ...session,
    checkpoint: { ...session.checkpoint, reordered: 'yes' }
  }, content), null);

  const forged = structuredClone(session);
  forged.apply.attempts.push({ actionId: 'made-up', at: 1004, answers: correctAnswers(QUESTIONS[0]), correct: true });
  assert.equal(restoreJourneySession(forged, content), null);

  const changedQuestions = structuredClone(QUESTIONS);
  changedQuestions.find(question => question.id === session.questionId).statements[0].text += ' ændret';
  assert.equal(restoreJourneySession(session, { questions: changedQuestions, lessons: LESSONS }), null);

  const changedPrompt = structuredClone(QUESTIONS);
  changedPrompt.find(question => question.id === session.questionId).prompt += ' ændret';
  assert.equal(restoreJourneySession(session, { questions: changedPrompt, lessons: LESSONS }), null);

  const changedExplanation = structuredClone(QUESTIONS);
  changedExplanation.find(question => question.id === session.questionId).explanation += ' ændret';
  assert.equal(restoreJourneySession(session, { questions: changedExplanation, lessons: LESSONS }), null);

  const changedLessons = structuredClone(LESSONS);
  changedLessons[session.sectionId].case.action += ' ændret';
  assert.equal(restoreJourneySession(session, { questions: QUESTIONS, lessons: changedLessons }), null);
});

test('samme grading eller finalize-action kan ikke udføres to gange efter reload', () => {
  const question = QUESTIONS[0];
  let session = readAllCards(create(question));
  const grading = {
    type: JOURNEY_ACTIONS.SUBMIT_APPLY,
    actionId: 'apply-once',
    at: 1004,
    answers: wrongAnswers(question)
  };
  session = transitionJourneySession(session, grading, content).session;
  session = restoreJourneySession(serializeJourneySession(session), content);
  const duplicateGrade = transitionJourneySession(session, grading, content);
  assert.equal(duplicateGrade.outcome.duplicate, true);
  assert.equal(duplicateGrade.session.apply.attempts.length, 1);

  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_APPLY, { answers: correctAnswers(question) }).session;
  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_TRANSFER, { answer: 'Mit åbne svar.' }).session;
  session = dispatch(session, JOURNEY_ACTIONS.CONTINUE_TRANSFER).session;
  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_RECALL, { answer: 'Mine egne ord.' }).session;
  session = dispatch(session, JOURNEY_ACTIONS.SELF_CHECK_RECALL, { selfCheck: 'remembered' }).session;
  const checkpoint = getJourneyStep(session, content).question;
  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_CHECKPOINT, { answers: correctAnswers(checkpoint) }).session;

  const finalize = {
    type: JOURNEY_ACTIONS.FINALIZE,
    actionId: 'finalize-once',
    at: 1010
  };
  const finalized = transitionJourneySession(session, finalize, content);
  assert.equal(finalized.outcome.accepted, true);
  session = restoreJourneySession(serializeJourneySession(finalized.session), content);
  const duplicateFinalize = transitionJourneySession(session, finalize, content);
  assert.equal(duplicateFinalize.outcome.duplicate, true);
  assert.equal(duplicateFinalize.session.events.filter(event => event.type === JOURNEY_ACTIONS.FINALIZE).length, 1);

  const secondFinalizeId = transitionJourneySession(session, {
    ...finalize,
    actionId: 'finalize-again',
    at: 1011
  }, content);
  assert.equal(secondFinalizeId.outcome.duplicate, true);
  assert.equal(secondFinalizeId.outcome.reason, 'already-finalized');
  assert.equal(secondFinalizeId.session.events.length, session.events.length);
});

test('forkert checkpoint kan ikke omgå completion-gaten', () => {
  const question = QUESTIONS[0];
  let session = reachCheckpoint(create(question), correctAnswers(question));
  const checkpoint = getJourneyStep(session, content).question;
  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_CHECKPOINT, { answers: wrongAnswers(checkpoint) }).session;

  assert.equal(session.stage, 'checkpoint');
  assert.equal(isJourneyComplete(session), false);
  assert.equal(getJourneyCompletionEvidence(session), null);
  const finalize = transitionJourneySession(session, {
    type: JOURNEY_ACTIONS.FINALIZE,
    actionId: 'too-soon',
    at: 1010
  }, content);
  assert.equal(finalize.outcome.accepted, false);
  assert.equal(finalize.outcome.reason, 'objective-incomplete');
});

test('checkpoint-fejl efterfulgt af korrekt svar registreres som en virkelig repair', () => {
  const question = QUESTIONS[0];
  let session = reachCheckpoint(create(question), correctAnswers(question));
  const checkpoint = getJourneyStep(session, content).question;

  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_CHECKPOINT, { answers: wrongAnswers(checkpoint) }).session;
  session = dispatch(session, JOURNEY_ACTIONS.SUBMIT_CHECKPOINT, { answers: correctAnswers(checkpoint) }).session;

  const evidence = getJourneyCompletionEvidence(session);
  assert.equal(evidence.apply.hadWrong, false);
  assert.equal(evidence.apply.repaired, false);
  assert.equal(evidence.checkpoint.hadWrong, true);
  assert.equal(evidence.checkpoint.repaired, true);
  assert.equal(evidence.objectiveComplete, true);
  assert.deepEqual(session.checkpoint.attempts.map(attempt => attempt.correct), [false, true]);
  assert.ok(restoreJourneySession(serializeJourneySession(session), content), 'canonical replay bevarer repair-evidensen');
});
