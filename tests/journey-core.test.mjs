import test from 'node:test';
import assert from 'node:assert/strict';

import { CHAPTERS, QUESTIONS } from '../dist/content.js';
import { LESSONS } from '../dist/lessons.js';
import {
  JOURNEY_VERSION,
  copenhagenDay,
  emptyJourney,
  restoreJourney,
  mergeJourney,
  setDailyGoal,
  completeLesson,
  getDailySummary,
  getRouteUnits,
  getJourneyRecommendations
} from '../dist/journey-core.js';

function completion(sectionId, sessionId, overrides = {}) {
  return {
    sessionId,
    sectionId,
    kind: 'lesson',
    objectiveComplete: true,
    cardsCompleted: 3,
    apply: { graded: true, correct: true, hadWrong: false, repaired: false },
    recall: { selfChecked: true },
    checkpoint: {
      graded: true,
      hadWrong: false,
      repaired: false,
      correct: true,
      questionId: QUESTIONS.find(q => q.sectionId === sectionId)?.id
    },
    ...overrides
  };
}

function accept(state, evidence, now) {
  const result = completeLesson(state, evidence, now);
  assert.equal(result.accepted, true, result.reason);
  return result;
}

test('ruten dækker alle 58 kildecheckede lektioner og alle 83 spørgsmål', () => {
  const units = getRouteUnits({
    chapters: CHAPTERS,
    lessons: LESSONS,
    questions: QUESTIONS,
    journey: emptyJourney(),
    records: {},
    now: Date.UTC(2026, 9, 12)
  });
  const nodes = units.flatMap(unit => unit.nodes);

  assert.equal(units.length, 10);
  assert.equal(nodes.length, 58);
  assert.equal(nodes.reduce((sum, node) => sum + node.questionIds.length, 0), 83);
  assert.equal(nodes.reduce((sum, node) => sum + node.questionCount, 0), 83);
  assert.ok(nodes.every(node => node.questionCount === node.questionIds.length));
  assert.equal(new Set(nodes.map(node => node.sectionId)).size, 58);
  assert.ok(nodes.every(node => node.lessonAvailable));
  assert.ok(nodes.every(node => node.officialQualification === false));
  for (const lesson of Object.values(LESSONS)) {
    assert.equal(lesson.cards.length, 3);
    assert.ok(lesson.case?.context && lesson.case?.action && lesson.case?.why);
    assert.ok(lesson.recall?.prompt && lesson.recall?.answer);
    assert.ok(Object.hasOwn(lesson, 'practicalNote'));
  }
});

test('objektiv completion kræver kort, bedømt og repareret apply, self-check og korrekt checkpoint', () => {
  const base = emptyJourney();
  const now = Date.parse('2026-10-12T12:00:00+02:00');
  const invalid = [
    completion('cockpit', 'session-missing-cards', { cardsCompleted: 2 }),
    completion('cockpit', 'session-ungraded', { apply: { graded: false, correct: true } }),
    completion('cockpit', 'session-unrepaired', { apply: { graded: true, correct: true, hadWrong: true, repaired: false } }),
    completion('cockpit', 'session-selfcheck', { recall: { selfChecked: false } }),
    completion('cockpit', 'session-checkpoint', { checkpoint: { graded: true, correct: false } }),
    completion('cockpit', 'session-flag', { objectiveComplete: false })
  ];

  for (const evidence of invalid) {
    const result = completeLesson(base, evidence, now);
    assert.equal(result.accepted, false, evidence.sessionId);
    assert.equal(result.state.events.length, 0);
  }
  assert.equal(accept(base, completion('cockpit', 'session-valid'), now).state.events.length, 1);
});

test('samme session og samme afsnit på samme dag kan ikke farme daily count eller belønning', () => {
  const morning = Date.parse('2026-10-12T08:00:00+02:00');
  const evening = Date.parse('2026-10-12T20:00:00+02:00');
  const first = accept(emptyJourney(), completion('cockpit', 'session-cockpit-1'), morning);
  assert.equal(first.dailyCounted, true);
  assert.equal(first.rewardKey, 'journey:cockpit:2026-10-12');

  const duplicate = completeLesson(first.state, completion('cockpit', 'session-cockpit-1'), evening);
  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.state.events.length, 1);

  const repeatedSection = accept(first.state, completion('cockpit', 'session-cockpit-2'), evening);
  assert.equal(repeatedSection.dailyCounted, false);
  assert.equal(repeatedSection.rewardKey, null);
  assert.equal(getDailySummary(repeatedSection.state, evening).completedSessions, 1);
});

test('dagligt mål er 1, 2 eller 3 unikke gennemførte afsnit', () => {
  const now = Date.parse('2026-10-12T12:00:00+02:00');
  let state = setDailyGoal(emptyJourney(), 3);
  state = accept(state, completion('cockpit', 'session-goal-a'), now).state;
  state = accept(state, completion('assistenter', 'session-goal-b'), now + 1000).state;
  assert.equal(getDailySummary(state, now).goalMet, false);
  state = accept(state, completion('bremser', 'session-goal-c'), now + 2000).state;
  assert.equal(getDailySummary(state, now).goalMet, true);
  assert.equal(setDailyGoal(state, 99).dailyGoal, 1);
});

test('København-dato, DST, månedsskifte og mandag-søndag-kalender beregnes som kalenderdage', () => {
  assert.equal(copenhagenDay(Date.parse('2026-03-28T23:30:00Z')), '2026-03-29');
  assert.equal(copenhagenDay(Date.parse('2026-10-24T22:30:00Z')), '2026-10-25');

  const times = [
    Date.parse('2026-03-28T12:00:00+01:00'),
    Date.parse('2026-03-29T12:00:00+02:00'),
    Date.parse('2026-03-30T12:00:00+02:00'),
    Date.parse('2026-03-31T12:00:00+02:00'),
    Date.parse('2026-04-01T12:00:00+02:00')
  ];
  const sections = ['cockpit', 'assistenter', 'bremser', 'lys-daek', 'motor-dokumenter'];
  let state = emptyJourney();
  for (let index = 0; index < times.length; index += 1) {
    state = accept(state, completion(sections[index], `session-streak-${index}`), times[index]).state;
  }
  const summary = getDailySummary(state, times.at(-1));
  assert.equal(summary.currentStreak, 5);
  assert.equal(summary.longestStreak, 5);
  assert.deepEqual(summary.week.map(day => day.day), [
    '2026-03-30', '2026-03-31', '2026-04-01', '2026-04-02',
    '2026-04-03', '2026-04-04', '2026-04-05'
  ]);
});

test('streak lever til dagen efter, men brydes efter en tom kalenderdag', () => {
  const monday = Date.parse('2026-10-12T12:00:00+02:00');
  const state = accept(emptyJourney(), completion('cockpit', 'session-one-day'), monday).state;
  assert.equal(getDailySummary(state, monday).currentStreak, 1);
  assert.equal(getDailySummary(state, monday + 86400000).currentStreak, 1);
  assert.equal(getDailySummary(state, monday + 2 * 86400000).currentStreak, 0);
});

test('quests bygger på hændelser: lektion, reel repair og tidsforskudt review', () => {
  const baseTime = Date.parse('2026-10-12T08:00:00+02:00');
  const repaired = completion('cockpit', 'session-repair', {
    apply: { graded: true, correct: true, hadWrong: true, repaired: true }
  });
  let state = accept(emptyJourney(), repaired, baseTime).state;
  let summary = getDailySummary(state, baseTime);
  assert.equal(summary.quests.lesson.complete, true);
  assert.equal(summary.quests.repair.complete, true);
  assert.equal(summary.quests.delayedReview.complete, false);

  state = accept(state, completion('cockpit', 'session-immediate-review', { kind: 'review' }), baseTime + 5 * 60000).state;
  assert.equal(getDailySummary(state, baseTime + 5 * 60000).quests.delayedReview.complete, false);

  state = accept(state, completion('cockpit', 'session-delayed-review', { kind: 'review' }), baseTime + 30 * 60000).state;
  summary = getDailySummary(state, baseTime + 30 * 60000);
  assert.equal(summary.quests.delayedReview.complete, true);
  assert.equal(summary.completedSessions, 1, 'samme afsnit tæller stadig kun én gang i dagsmålet');
});

test('restore saniterer legacy, ukendte afsnit, afledte tællere og ugyldige hændelser', () => {
  const time = Date.parse('2026-10-12T12:00:00+02:00');
  const legacy = {
    dailyGoal: 2,
    streak: 999,
    completedSessions: 999,
    completions: [
      { sessionId: 'session-legacy-good', sectionId: 'cockpit', completedAt: time, day: '2099-01-01' },
      { sessionId: 'x', sectionId: 'cockpit', completedAt: time },
      { sessionId: 'session-unknown-section', sectionId: 'hacket-afsnit', completedAt: time },
      { sessionId: 'session-invalid-time', sectionId: 'cockpit', completedAt: Infinity }
    ]
  };
  const state = restoreJourney(JSON.stringify(legacy), { sectionIds: ['cockpit'] });
  assert.equal(state.version, JOURNEY_VERSION);
  assert.equal(state.dailyGoal, 2);
  assert.equal(state.events.length, 1);
  assert.equal(state.events[0].day, '2026-10-12');
  assert.equal(getDailySummary(state, time).completedSessions, 1);
  assert.deepEqual(restoreJourney('{broken'), emptyJourney());
});

test('cross-tab merge forener sessioner, deduplikerer og vælger konservativt ved konflikt', () => {
  const time = Date.parse('2026-10-12T12:00:00+02:00');
  const a = {
    version: JOURNEY_VERSION,
    dailyGoal: 1,
    events: [
      { sessionId: 'session-shared', sectionId: 'cockpit', completedAt: time, hadWrong: false, repaired: true },
      { sessionId: 'session-tab-a', sectionId: 'assistenter', completedAt: time + 1000 }
    ]
  };
  const b = {
    version: JOURNEY_VERSION,
    dailyGoal: 3,
    events: [
      { sessionId: 'session-shared', sectionId: 'cockpit', completedAt: time, hadWrong: true, repaired: false },
      { sessionId: 'session-tab-b', sectionId: 'bremser', completedAt: time + 2000 }
    ]
  };
  const merged = mergeJourney(a, b, { sectionIds: ['cockpit', 'assistenter', 'bremser'] });
  assert.equal(merged.dailyGoal, 3);
  assert.equal(merged.events.length, 3);
  assert.equal(merged.events.find(event => event.sessionId === 'session-shared').hadWrong, true);
  assert.equal(merged.events.find(event => event.sessionId === 'session-shared').repaired, false);
  assert.equal(getDailySummary(merged, time).completedSessions, 3);
});

test('anbefaling prioriterer fejl før forfalden træning og næste nye node', () => {
  const now = Date.parse('2026-10-12T12:00:00+02:00');
  const state = accept(emptyJourney(), completion('cockpit', 'session-route-done'), now - 86400000).state;
  const records = {
    cockpit: { attempts: 2, streak: 0, days: [], lastCorrect: false, lastAssessment: 'complete', due: now - 1 },
    assistenter: { attempts: 2, streak: 2, days: ['2026-10-10'], lastCorrect: true, lastAssessment: 'complete', due: now - 1 }
  };
  const input = { chapters: CHAPTERS, lessons: LESSONS, questions: QUESTIONS, journey: state, records, now };
  const result = getJourneyRecommendations(input);
  assert.equal(result.recommended.sectionId, 'cockpit');
  assert.equal(result.errorPractice[0].sectionId, 'cockpit');
  assert.equal(result.duePractice[0].sectionId, 'assistenter');
  assert.equal(result.next.sectionId, 'assistenter');

  const route = getRouteUnits(input).flatMap(unit => unit.nodes);
  const cockpit = route.find(node => node.sectionId === 'cockpit');
  assert.equal(cockpit.lessonComplete, true);
  assert.equal(cockpit.longTermMastery.durable, false);
  assert.equal(cockpit.status, 'needs-repair');
});

test('durable mastery er separat fra gennemført lektion og officiel kvalifikation', () => {
  const now = Date.parse('2026-10-12T12:00:00+02:00');
  const route = getRouteUnits({
    chapters: CHAPTERS,
    lessons: LESSONS,
    questions: QUESTIONS,
    journey: emptyJourney(),
    records: { cockpit: { attempts: 3, streak: 3, days: ['2026-10-10', '2026-10-12'], lastCorrect: true, due: now + 1 } },
    now
  }).flatMap(unit => unit.nodes);
  const node = route.find(item => item.sectionId === 'cockpit');
  assert.equal(node.lessonComplete, false);
  assert.equal(node.longTermMastery.durable, true);
  assert.equal(node.officialQualification, false);
});

test('kun et fuldt besvaret forkert svar bliver til en påstået fejl', () => {
  const now = Date.parse('2026-10-12T12:00:00+02:00');
  const records = {
    cockpit: { attempts: 1, streak: 0, days: [], lastCorrect: false, lastAssessment: 'complete', due: now },
    assistenter: { attempts: 1, streak: 0, days: [], lastCorrect: false, lastAssessment: 'unanswered', due: now },
    bremser: { attempts: 1, streak: 0, days: [], lastCorrect: false, lastAssessment: 'partial', due: now + 60000 },
    'lys-daek': { attempts: 1, streak: 0, days: [], lastCorrect: false, lastAssessment: 'unknown', due: now },
    'motor-dokumenter': { attempts: 4, streak: 0, days: [], lastCorrect: false, due: now },
    'start-stop': { attempts: 3, streak: 3, days: ['2026-10-10', '2026-10-12'], lastCorrect: true, due: now + 60000 }
  };
  const input = { chapters: CHAPTERS, lessons: LESSONS, questions: QUESTIONS, journey: emptyJourney(), records, now };
  const route = getRouteUnits(input).flatMap(unit => unit.nodes);
  const byId = id => route.find(node => node.sectionId === id).longTermMastery;

  assert.equal(byId('cockpit').hasError, true);
  assert.equal(byId('cockpit').errorSource, 'assessment');
  for (const id of ['assistenter', 'bremser', 'lys-daek', 'motor-dokumenter']) {
    assert.equal(byId(id).hasError, false, `${id} er ikke et dokumenteret forkert svar`);
  }
  assert.equal(byId('assistenter').due, true);
  assert.equal(byId('assistenter').status, 'review-due');
  assert.equal(byId('bremser').status, 'unproven');
  assert.equal(byId('motor-dokumenter').lastAssessment, 'unknown', 'legacy false migreres neutralt');
  assert.equal(byId('motor-dokumenter').status, 'review-due');
  assert.equal(byId('start-stop').durable, true, 'legacy korrekt fremgang bevares');

  const recommendations = getJourneyRecommendations(input);
  assert.deepEqual(recommendations.errorPractice.map(node => node.sectionId), ['cockpit']);
  assert.ok(recommendations.duePractice.some(node => node.sectionId === 'assistenter'));
  assert.ok(recommendations.duePractice.some(node => node.sectionId === 'lys-daek'));
  assert.ok(recommendations.duePractice.some(node => node.sectionId === 'motor-dokumenter'));
});

test('en verificeret wrong-then-repair-session kan udløse fejltræning uden at forfalske records', () => {
  const now = Date.parse('2026-10-12T12:00:00+02:00');
  const repaired = completion('cockpit', 'session-verified-repair', {
    apply: { graded: true, correct: true, hadWrong: true, repaired: true }
  });
  const journey = accept(emptyJourney(), repaired, now).state;
  const freshInput = { chapters: CHAPTERS, lessons: LESSONS, questions: QUESTIONS, journey, records: {}, now };
  const node = getRouteUnits(freshInput).flatMap(unit => unit.nodes).find(item => item.sectionId === 'cockpit');

  assert.equal(node.longTermMastery.hasError, false, 'den dokumenterede fejl er allerede repareret');
  assert.equal(node.longTermMastery.practiceSource, 'journey-repair');
  assert.equal(node.longTermMastery.due, false);
  assert.equal(node.longTermMastery.dueAt, now + 20 * 60000);
  assert.equal(node.status, 'needs-practice');
  const freshRecommendations = getJourneyRecommendations(freshInput);
  assert.equal(freshRecommendations.errorPractice.length, 0);
  assert.notEqual(freshRecommendations.recommended.sectionId, 'cockpit', 'frisk repair må ikke udløse øjeblikkelig gentagelse');

  const dueInput = { ...freshInput, now: now + 20 * 60000 };
  const dueRecommendations = getJourneyRecommendations(dueInput);
  assert.equal(dueRecommendations.duePractice[0].sectionId, 'cockpit');
  assert.equal(dueRecommendations.recommended.sectionId, 'cockpit');
});

test('checkpoint-only fejl og efterfølgende korrekt svar tæller som repair-quest', () => {
  const now = Date.parse('2026-10-12T12:00:00+02:00');
  const checkpointRepair = completion('cockpit', 'session-checkpoint-repair', {
    checkpoint: {
      graded: true,
      hadWrong: true,
      repaired: true,
      correct: true,
      questionId: QUESTIONS.find(question => question.sectionId === 'cockpit').id
    }
  });
  const result = completeLesson(emptyJourney(), checkpointRepair, now);

  assert.equal(result.accepted, true);
  assert.equal(result.state.events[0].hadWrong, true);
  assert.equal(result.state.events[0].repaired, true);
  assert.equal(getDailySummary(result.state, now).quests.repair.complete, true);

  const unrepaired = structuredClone(checkpointRepair);
  unrepaired.sessionId = 'session-checkpoint-unrepaired';
  unrepaired.checkpoint.repaired = false;
  assert.equal(completeLesson(emptyJourney(), unrepaired, now).accepted, false);
});
