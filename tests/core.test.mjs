import test from 'node:test';
import assert from 'node:assert/strict';

import { CHAPTERS, QUESTIONS } from '../dist/content.js';
import {
  VERSION,
  blankState,
  restoreState,
  gradeQuestion,
  recordAnswer,
  isMastered,
  reviewQueue,
  makeExam,
  gradeExam,
  validateExam,
  isCompleteResponse,
  questionSignature,
  completeExam,
  restoreExamResult
} from '../dist/core.js';

const correctAnswers = question => question.statements.map(statement => statement.correct);
const wrongAnswers = question => correctAnswers(question).map(value => !value);

function seededRandom(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function completeResponses(exam) {
  return Object.fromEntries(exam.map(question => [question.id, correctAnswers(question)]));
}

function signaturesFor(exam) {
  return Object.fromEntries(exam.map(question => [question.id, questionSignature(question)]));
}

test('øveprøven består ved 5 fejl og dumper ved 6 fejl', () => {
  const exam = QUESTIONS.slice(0, 25);
  const fiveWrong = completeResponses(exam);
  for (const question of exam.slice(0, 5)) fiveWrong[question.id] = wrongAnswers(question);

  const pass = gradeExam(exam, fiveWrong);
  assert.equal(pass.errors, 5);
  assert.equal(pass.correct, 20);
  assert.equal(pass.withinLimit, true);
  assert.equal(pass.unanswered, 0);

  const sixWrong = structuredClone(fiveWrong);
  sixWrong[exam[5].id] = wrongAnswers(exam[5]);
  const fail = gradeExam(exam, sixWrong);
  assert.equal(fail.errors, 6);
  assert.equal(fail.withinLimit, false);
});

test('helt og delvist ubesvarede situationer tæller begge som fejl', () => {
  const exam = QUESTIONS.slice(0, 25);
  const responses = completeResponses(exam);
  delete responses[exam[0].id];
  responses[exam[1].id] = [true, false, null, true];

  const result = gradeExam(exam, responses);
  assert.equal(result.errors, 2);
  assert.equal(result.unanswered, 2);
  assert.equal(result.details.find(item => item.id === exam[0].id).answered, false);
  assert.equal(result.details.find(item => item.id === exam[1].id).answered, false);
});

test('alle fire vurderinger skal matche facit', () => {
  const question = QUESTIONS[0];
  const exact = correctAnswers(question);
  assert.equal(gradeQuestion(question, exact), true);

  for (let index = 0; index < 4; index += 1) {
    const oneMistake = [...exact];
    oneMistake[index] = !oneMistake[index];
    assert.equal(gradeQuestion(question, oneMistake), false, `udsagn ${index + 1} må ikke ignoreres`);
  }

  assert.equal(gradeQuestion(question, exact.slice(0, 3)), false);
  const sparse = new Array(4);
  sparse[0] = exact[0];
  sparse[3] = exact[3];
  assert.equal(isCompleteResponse(sparse), false);
  assert.equal(gradeQuestion(question, sparse), false);
});

test('øveprøven er deterministisk med seed, unik og blandet på tværs af emner', () => {
  const first = makeExam(QUESTIONS, seededRandom(20261012));
  const again = makeExam(QUESTIONS, seededRandom(20261012));

  assert.deepEqual(first.map(question => question.id), again.map(question => question.id));
  assert.equal(first.length, 25);
  assert.equal(new Set(first.map(question => question.id)).size, 25);
  assert.equal(new Set(first.map(question => question.chapterId)).size, CHAPTERS.length);
});

test('korrupt lagerdata og ukendt version giver en ren tilstand', () => {
  assert.deepEqual(restoreState('{det her er ikke json'), blankState());
  assert.deepEqual(restoreState(JSON.stringify({ version: VERSION + 1, xp: 9999 })), blankState());
  assert.deepEqual(restoreState(null), blankState());
});

test('mastery kræver mindst tre korrekte i træk fordelt over to københavnske kalenderdage', () => {
  const state = blankState();
  const question = QUESTIONS[0];
  const answers = correctAnswers(question);
  const dayOneMorning = Date.UTC(2026, 9, 12, 8);
  const dayOneEvening = Date.UTC(2026, 9, 12, 18);
  const dayTwo = Date.UTC(2026, 9, 13, 8);

  assert.equal(recordAnswer(state, question, answers, dayOneMorning).mastered, false);
  assert.equal(recordAnswer(state, question, answers, dayOneEvening).mastered, false);
  assert.equal(state.records[question.sectionId].streak, 2);
  assert.equal(state.records[question.sectionId].days.length, 1);

  const third = recordAnswer(state, question, answers, dayTwo);
  assert.equal(third.mastered, true);
  assert.equal(state.records[question.sectionId].streak, 3);
  assert.equal(state.records[question.sectionId].days.length, 2);
});

test('en fejl nulstiller streak og går forrest i review-køen', () => {
  const state = blankState();
  const failedQuestion = QUESTIONS[0];
  const otherQuestion = QUESTIONS.find(question => question.sectionId !== failedQuestion.sectionId);
  const base = Date.UTC(2026, 9, 12, 8);

  recordAnswer(state, failedQuestion, correctAnswers(failedQuestion), base);
  recordAnswer(state, failedQuestion, correctAnswers(failedQuestion), base + 86400000);
  recordAnswer(state, failedQuestion, correctAnswers(failedQuestion), base + 86400000 + 1000);
  assert.equal(isMastered(state.records[failedQuestion.sectionId]), true);

  const failed = recordAnswer(state, failedQuestion, wrongAnswers(failedQuestion), base + 2 * 86400000);
  assert.equal(failed.correct, false);
  assert.equal(failed.mastered, false);
  assert.equal(state.records[failedQuestion.sectionId].streak, 0);

  const queue = reviewQueue(state, [otherQuestion, failedQuestion], base + 2 * 86400000);
  assert.equal(queue[0].id, failedQuestion.id);
});

test('samme korrekte spørgsmål på samme danske dato kan ikke farme XP', () => {
  const state = blankState();
  const question = QUESTIONS[0];
  const answers = correctAnswers(question);
  const early = Date.UTC(2026, 0, 15, 1);
  const late = Date.UTC(2026, 0, 15, 21);

  recordAnswer(state, question, answers, early);
  recordAnswer(state, question, answers, late);

  assert.equal(state.xp, 15);
  assert.equal(state.rewards.length, 1);
  assert.equal(state.records[question.sectionId].attempts, 2);
});

test('en gemt prøve gendannes kun med 25 unikke id’er fra den aktuelle bank', () => {
  const ids = QUESTIONS.slice(0, 25).map(question => question.id);
  const stored = restoreState(JSON.stringify({
    ...blankState(),
    savedExam: { ids, index: 7, responses: {}, deadline: Date.now() + 60000 }
  }));
  const restored = validateExam(stored.savedExam, QUESTIONS);
  assert.equal(restored.questions.length, 25);
  assert.equal(restored.index, 7);
  assert.equal(restored.deadline, stored.savedExam.deadline, 'reload må ikke give ekstra prøvetid');
  assert.deepEqual(restored.questions.map(question => question.id), ids);

  assert.equal(validateExam({ ...stored.savedExam, ids: [...ids.slice(0, 24), ids[0]] }, QUESTIONS), null);
  assert.equal(validateExam({ ...stored.savedExam, ids: [...ids.slice(0, 24), 'findes-ikke'] }, QUESTIONS), null);
  assert.equal(validateExam({ ...stored.savedExam, ids: ids.slice(0, 24) }, QUESTIONS), null);
});

test('samme id med ændret ordlyd eller rækkefølge kan ikke genfortolke gemte svar', () => {
  const questions = QUESTIONS.slice(0, 25);
  const ids = questions.map(question => question.id);
  const saved = {
    ids,
    signatures: signaturesFor(questions),
    responses: completeResponses(questions),
    deadline: 1791763200000
  };
  assert.ok(validateExam(saved, questions, { requireSignatures: true }));

  const reworded = structuredClone(questions);
  reworded[0].statements[0].text += ' Ændret.';
  assert.equal(validateExam(saved, reworded, { requireSignatures: true }), null);

  const reordered = structuredClone(questions);
  [reordered[0].statements[0], reordered[0].statements[1]] = [reordered[0].statements[1], reordered[0].statements[0]];
  assert.equal(validateExam(saved, reordered, { requireSignatures: true }), null);

  const missing = structuredClone(saved);
  delete missing.signatures[ids[0]];
  assert.equal(validateExam(missing, questions), null, 'en leveret signaturtabel skal dække alle kendte id’er');
  assert.equal(validateExam({ ...saved, signatures: undefined }, questions), null, 'en eksplicit ugyldig signaturtabel må ikke behandles som legacy');
  const legacy = { ...saved };
  delete legacy.signatures;
  assert.ok(validateExam(legacy, questions), 'legacy kan gendannes uden strict migration');
  assert.equal(validateExam(legacy, questions, { requireSignatures: true }), null);
});

test('et nyt uvedkommende spørgsmål ændrer ikke signaturen for den valgte prøve', () => {
  const questions = QUESTIONS.slice(0, 25);
  const saved = {
    ids: questions.map(question => question.id),
    signatures: signaturesFor(questions),
    responses: completeResponses(questions),
    deadline: 1791763200000
  };
  const unrelated = structuredClone(QUESTIONS[25]);
  unrelated.id = 'q-unrelated-signature-test';
  unrelated.context = 'Dette spørgsmål er ikke valgt til prøven.';
  const restored = validateExam(saved, [...questions, unrelated], { requireSignatures: true });
  assert.ok(restored);
  assert.deepEqual(restored.questions.map(question => question.id), saved.ids);
  assert.deepEqual(restored.signatures, saved.signatures);
});

test('gemte svar og markeringer saniteres uden sparse arrays eller fremmede id’er', () => {
  const ids = QUESTIONS.slice(0, 25).map(question => question.id);
  const sparse = new Array(4);
  sparse[0] = true;
  sparse[3] = false;
  const restored = validateExam({
    ids,
    responses: { [ids[0]]: sparse, [ids[1]]: ['ja', false, true, {}] },
    flagged: [ids[0], ids[0], { id: ids[1] }, 'findes-ikke'],
    deadline: 123456789
  }, QUESTIONS);

  assert.deepEqual(restored.responses[ids[0]], [true, null, null, false]);
  assert.deepEqual(restored.responses[ids[1]], [null, false, true, null]);
  assert.deepEqual(restored.flagged, [ids[0]]);
  assert.match(restored.id, /^exam-/);
});

test('et afleveret resultat gemmes med detaljer og kan gendannes efter reload', () => {
  const questions = QUESTIONS.slice(0, 25);
  const state = blankState();
  const exam = {id:'exam-test-20261012',questions,responses:completeResponses(questions)};
  exam.responses[questions[0].id] = wrongAnswers(questions[0]);
  const first = completeExam(state, exam, 1791763200000, false);

  assert.equal(first.duplicate, false);
  assert.equal(first.result.errors, 1);
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].ids.length, 25);
  assert.deepEqual(state.history[0].signatures, signaturesFor(questions));
  assert.equal(state.history[0].details.length, 25);

  const persisted = restoreState(JSON.stringify(state));
  const recovered = restoreExamResult(persisted.history[0], QUESTIONS);
  assert.equal(recovered.id, exam.id);
  assert.equal(recovered.result.errors, 1);
  assert.deepEqual(recovered.questions.map(question => question.id), questions.map(question => question.id));
});

test('historik med ændret spørgsmålsindhold giver ingen misvisende gennemgang', () => {
  const questions = QUESTIONS.slice(0, 25);
  const state = blankState();
  const exam = {id:'exam-signature-history',questions,responses:completeResponses(questions)};
  completeExam(state, exam, 1791763200000, false);
  const attempts = Object.values(state.records).reduce((sum,record)=>sum+record.attempts,0);
  const changed = structuredClone(questions);
  changed[0].context += ' Ændret efter aflevering.';

  assert.equal(restoreExamResult(state.history[0], changed), null);
  const duplicate = completeExam(state, {...exam,questions:changed}, 1791763201000, false);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.result, null);
  assert.equal(state.history.length, 1);
  assert.equal(Object.values(state.records).reduce((sum,record)=>sum+record.attempts,0), attempts);

  const persisted = restoreState(JSON.stringify(state));
  assert.deepEqual(persisted.history[0].signatures, state.history[0].signatures);
  assert.equal(restoreExamResult(persisted.history[0], changed, { requireSignatures: true }), null);
});

test('samme prøve-id kan ikke dobbeltlogge resultat eller læringsforsøg', () => {
  const questions = QUESTIONS.slice(0, 25);
  const state = blankState();
  const exam = {id:'exam-idempotent-1',questions,responses:completeResponses(questions)};
  completeExam(state, exam, 1791763200000, false);
  const attempts = Object.values(state.records).reduce((sum,record)=>sum+record.attempts,0);
  const again = completeExam(state, exam, 1791763201000, true);

  assert.equal(again.duplicate, true);
  assert.equal(state.history.length, 1);
  assert.equal(Object.values(state.records).reduce((sum,record)=>sum+record.attempts,0), attempts);
});

test('manipulerede historikfelter kan ikke blive til et gendanneligt resultat', () => {
  const ids = QUESTIONS.slice(0, 25).map(question => question.id);
  const state = restoreState(JSON.stringify({
    ...blankState(),
    history: [
      {id:'x',at:1,errors:-1,unanswered:0,ids,responses:{}},
      {id:'exam-valid-shape',at:2,errors:3,unanswered:99,ids:[...ids.slice(0,24),ids[0]],responses:{}}
    ]
  }));
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].unanswered, 0);
  assert.equal(restoreExamResult(state.history[0], QUESTIONS), null);
});
