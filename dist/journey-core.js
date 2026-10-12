// Pure learning-journey state. This module deliberately owns no storage and awards no XP.
export const JOURNEY_VERSION = 1;

const COPENHAGEN = 'Europe/Copenhagen';
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{2,119}$/;
const MAX_EVENTS = 20000;
const REVIEW_DELAY_MS = 20 * 60 * 1000;

const finiteTime = value => Number.isFinite(value) && value >= 0 && value <= 8640000000000000;

export function copenhagenDay(now = Date.now()) {
  if (!finiteTime(now)) throw new TypeError('now skal være et gyldigt tidspunkt');
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: COPENHAGEN,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(now));
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function addCalendarDays(day, amount) {
  if (!DAY_PATTERN.test(day) || !Number.isInteger(amount)) return null;
  const [year, month, date] = day.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, date + amount));
  return shifted.toISOString().slice(0, 10);
}

function compareEvents(a, b) {
  return a.completedAt - b.completedAt || a.sessionId.localeCompare(b.sessionId);
}

function normalizeGoal(value) {
  return value === 2 || value === 3 ? value : 1;
}

export function emptyJourney({ dailyGoal = 1 } = {}) {
  return {
    version: JOURNEY_VERSION,
    dailyGoal: normalizeGoal(dailyGoal),
    events: []
  };
}

function normalizeSectionIds(sectionIds) {
  if (sectionIds == null) return null;
  const ids = sectionIds instanceof Set ? sectionIds : new Set(sectionIds);
  return new Set([...ids].filter(id => typeof id === 'string'));
}

function sanitizeEvent(value, allowedSections) {
  if (!value || typeof value !== 'object') return null;
  const sessionId = typeof value.sessionId === 'string' && ID_PATTERN.test(value.sessionId)
    ? value.sessionId
    : null;
  const sectionId = typeof value.sectionId === 'string' && ID_PATTERN.test(value.sectionId)
    ? value.sectionId
    : null;
  if (!sessionId || !sectionId || (allowedSections && !allowedSections.has(sectionId))) return null;
  if (!finiteTime(value.completedAt)) return null;
  if (value.kind !== undefined && value.kind !== 'lesson' && value.kind !== 'review') return null;

  const startedAt = finiteTime(value.startedAt) && value.startedAt <= value.completedAt
    ? value.startedAt
    : value.completedAt;
  const event = {
    sessionId,
    sectionId,
    kind: value.kind === 'review' ? 'review' : 'lesson',
    startedAt,
    completedAt: value.completedAt,
    day: copenhagenDay(value.completedAt),
    hadWrong: value.hadWrong === true,
    repaired: value.hadWrong === true && value.repaired === true,
    checkpointQuestionId: typeof value.checkpointQuestionId === 'string' && ID_PATTERN.test(value.checkpointQuestionId)
      ? value.checkpointQuestionId
      : null
  };
  return event;
}

function resolveEventConflict(left, right) {
  if (left.sectionId !== right.sectionId) {
    return compareEvents(left, right) <= 0 ? left : right;
  }
  const first = compareEvents(left, right) <= 0 ? left : right;
  return {
    ...first,
    hadWrong: left.hadWrong || right.hadWrong,
    repaired: (left.hadWrong || right.hadWrong) && left.repaired && right.repaired
  };
}

function sanitizeEvents(values, allowedSections) {
  const bySession = new Map();
  if (!Array.isArray(values)) return [];
  for (const value of values.slice(-MAX_EVENTS * 2)) {
    const event = sanitizeEvent(value, allowedSections);
    if (!event) continue;
    const previous = bySession.get(event.sessionId);
    bySession.set(event.sessionId, previous ? resolveEventConflict(previous, event) : event);
  }
  return [...bySession.values()].sort(compareEvents).slice(-MAX_EVENTS);
}

export function restoreJourney(raw, { sectionIds } = {}) {
  const allowedSections = normalizeSectionIds(sectionIds);
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== 'object') return emptyJourney();

    // Early prototypes used `completions`; accepting it keeps reloads safe without
    // trusting any cached counters or streaks from that shape.
    const values = Array.isArray(parsed.events)
      ? parsed.events
      : Array.isArray(parsed.completions) ? parsed.completions : [];
    return {
      version: JOURNEY_VERSION,
      dailyGoal: normalizeGoal(parsed.dailyGoal),
      events: sanitizeEvents(values, allowedSections)
    };
  } catch {
    return emptyJourney();
  }
}

export function mergeJourney(left, right, { sectionIds } = {}) {
  const a = restoreJourney(left, { sectionIds });
  const b = restoreJourney(right, { sectionIds });
  return {
    version: JOURNEY_VERSION,
    // A goal increase is preserved across stale tabs. Decreasing it should use
    // setDailyGoal on the freshly merged state.
    dailyGoal: Math.max(a.dailyGoal, b.dailyGoal),
    events: sanitizeEvents([...a.events, ...b.events], normalizeSectionIds(sectionIds))
  };
}

export function setDailyGoal(journey, dailyGoal) {
  const state = restoreJourney(journey);
  return { ...state, dailyGoal: normalizeGoal(dailyGoal) };
}

function hasCompletedCards(completion) {
  if (Number.isInteger(completion.cardsCompleted)) return completion.cardsCompleted >= 3;
  if (Array.isArray(completion.cardsCompleted)) return completion.cardsCompleted.length >= 3;
  return false;
}

function objectiveEvidence(completion) {
  const apply = completion?.apply;
  const recall = completion?.recall;
  const checkpoint = completion?.checkpoint;
  return completion?.objectiveComplete === true
    && hasCompletedCards(completion)
    && apply?.graded === true
    && apply?.correct === true
    && (!apply.hadWrong || apply.repaired === true)
    && recall?.selfChecked === true
    && checkpoint?.graded === true
    && (!checkpoint.hadWrong || checkpoint.repaired === true)
    && checkpoint?.correct === true;
}

export function completeLesson(journey, completion, now = Date.now()) {
  const state = restoreJourney(journey);
  if (!finiteTime(now)) return { state, accepted: false, reason: 'invalid-time' };
  if (!completion || !objectiveEvidence(completion)) {
    return { state, accepted: false, reason: 'incomplete-objective-evidence' };
  }

  const applyHadWrong = completion.apply?.hadWrong === true;
  const checkpointHadWrong = completion.checkpoint?.hadWrong === true;
  const rawEvent = {
    sessionId: completion.sessionId,
    sectionId: completion.sectionId,
    kind: completion.kind,
    startedAt: completion.startedAt,
    completedAt: now,
    hadWrong: applyHadWrong || checkpointHadWrong,
    repaired: (!applyHadWrong || completion.apply?.repaired === true)
      && (!checkpointHadWrong || completion.checkpoint?.repaired === true),
    checkpointQuestionId: completion.checkpoint?.questionId
  };
  const event = sanitizeEvent(rawEvent, null);
  if (!event) return { state, accepted: false, reason: 'invalid-completion' };
  if (state.events.some(item => item.sessionId === event.sessionId)) {
    return { state, accepted: false, duplicate: true, reason: 'duplicate-session' };
  }

  const priorSectionEvents = state.events.filter(item => item.sectionId === event.sectionId);
  const previous = priorSectionEvents.at(-1) || null;
  const delayedReview = event.kind === 'review'
    && previous != null
    && event.completedAt - previous.completedAt >= REVIEW_DELAY_MS;
  const dailyCounted = !state.events.some(item => item.sectionId === event.sectionId && item.day === event.day);
  const nextState = {
    ...state,
    events: [...state.events, event].sort(compareEvents).slice(-MAX_EVENTS)
  };
  return {
    state: nextState,
    accepted: true,
    duplicate: false,
    dailyCounted,
    rewardKey: dailyCounted ? `journey:${event.sectionId}:${event.day}` : null,
    delayedReview
  };
}

function rewardedEvents(events) {
  const keys = new Set();
  const result = [];
  for (const event of [...events].sort(compareEvents)) {
    const key = `${event.sectionId}:${event.day}`;
    if (keys.has(key)) continue;
    keys.add(key);
    result.push(event);
  }
  return result;
}

function eventDays(events) {
  return [...new Set(rewardedEvents(events).map(event => event.day))].sort();
}

function streaks(days, today) {
  const daySet = new Set(days);
  let anchor = daySet.has(today) ? today : addCalendarDays(today, -1);
  let current = 0;
  while (anchor && daySet.has(anchor)) {
    current += 1;
    anchor = addCalendarDays(anchor, -1);
  }

  let longest = 0;
  let run = 0;
  let previous = null;
  for (const day of days) {
    run = previous && addCalendarDays(previous, 1) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }
  return { current, longest };
}

function startOfWeek(day) {
  const [year, month, date] = day.split('-').map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, date)).getUTCDay();
  return addCalendarDays(day, -(weekday === 0 ? 6 : weekday - 1));
}

function isDelayedReview(event, allEvents) {
  if (event.kind !== 'review') return false;
  const previous = allEvents
    .filter(item => item.sectionId === event.sectionId && compareEvents(item, event) < 0)
    .at(-1);
  return !!previous && event.completedAt - previous.completedAt >= REVIEW_DELAY_MS;
}

export function getDailySummary(journey, now = Date.now()) {
  const state = restoreJourney(journey);
  const today = copenhagenDay(now);
  const counted = rewardedEvents(state.events);
  const todayEvents = counted.filter(event => event.day === today);
  const allTodayEvents = state.events.filter(event => event.day === today);
  const lessonSections = new Set(allTodayEvents.filter(event => event.kind === 'lesson').map(event => event.sectionId));
  const repairedSections = new Set(allTodayEvents
    .filter(event => event.hadWrong && event.repaired)
    .map(event => event.sectionId));
  const days = eventDays(state.events);
  const { current, longest } = streaks(days, today);
  const monday = startOfWeek(today);
  const calendar = Array.from({ length: 7 }, (_, index) => {
    const day = addCalendarDays(monday, index);
    return { day, completed: days.includes(day), today: day === today };
  });

  return {
    day: today,
    dailyGoal: state.dailyGoal,
    completedSessions: todayEvents.length,
    goalMet: todayEvents.length >= state.dailyGoal,
    currentStreak: current,
    longestStreak: longest,
    week: calendar,
    quests: {
      lesson: {
        complete: lessonSections.size > 0,
        progress: lessonSections.size,
        target: 1
      },
      delayedReview: {
        complete: allTodayEvents.some(event => isDelayedReview(event, state.events)),
        progress: allTodayEvents.some(event => isDelayedReview(event, state.events)) ? 1 : 0,
        target: 1
      },
      repair: {
        complete: repairedSections.size > 0,
        progress: repairedSections.size,
        target: 1
      }
    }
  };
}

function recordMastery(record, now, journeyEvents = []) {
  const latestJourneyEvent = journeyEvents.at(-1) || null;
  const journeyRepair = latestJourneyEvent?.hadWrong === true && latestJourneyEvent.repaired === true;
  const lastAssessment = ['complete', 'partial', 'unanswered', 'unknown'].includes(record?.lastAssessment)
    ? record.lastAssessment
    : record?.lastCorrect === true ? 'complete' : 'unknown';
  const durable = record?.streak >= 3 && Array.isArray(record?.days) && new Set(record.days).size >= 2;
  const assessmentError = lastAssessment === 'complete'
    && record?.lastCorrect === false
    && Number(record?.attempts) > 0;
  const recordDueAt = finiteTime(record?.due) ? record.due : null;
  // A repaired error deserves another retrieval, but an immediate retry is not
  // delayed recall. The transparent initial schedule is therefore 20 minutes.
  const dueAt = journeyRepair
    ? latestJourneyEvent.completedAt + REVIEW_DELAY_MS
    : recordDueAt;
  const due = !assessmentError && dueAt !== null && dueAt <= now;
  const status = assessmentError
    ? 'needs-repair'
    : journeyRepair ? 'needs-practice'
      : due ? 'review-due'
        : durable ? 'durable'
          : !record ? 'not-started'
            : lastAssessment === 'complete' ? 'developing' : 'unproven';
  return {
    status,
    durable,
    due,
    dueAt,
    hasError: assessmentError,
    errorSource: assessmentError ? 'assessment' : null,
    practiceSource: journeyRepair ? 'journey-repair' : null,
    lastAssessment
  };
}

function routeInput(input) {
  if (!input || !Array.isArray(input.chapters) || !input.lessons || !Array.isArray(input.questions)) {
    throw new TypeError('chapters, lessons og questions er påkrævet');
  }
  const now = finiteTime(input.now) ? input.now : Date.now();
  const sectionIds = input.chapters.flatMap(chapter => chapter.sections || []).map(section => section.id);
  return {
    ...input,
    now,
    sectionIds,
    journey: restoreJourney(input.journey, { sectionIds }),
    records: input.records && typeof input.records === 'object' ? input.records : {}
  };
}

export function getRouteUnits(input) {
  const data = routeInput(input);
  const completedSections = new Set(data.journey.events.map(event => event.sectionId));
  let routeIndex = 0;
  return data.chapters.map((chapter, chapterIndex) => ({
    id: chapter.id,
    title: chapter.title,
    tagline: chapter.tagline,
    chapterIndex,
    nodes: (chapter.sections || []).map(section => {
      const lesson = data.lessons[section.id];
      const sectionQuestions = data.questions.filter(question => question.sectionId === section.id);
      const sectionEvents = data.journey.events.filter(event => event.sectionId === section.id);
      const mastery = recordMastery(data.records[section.id], data.now, sectionEvents);
      const node = {
        id: section.id,
        sectionId: section.id,
        chapterId: chapter.id,
        title: section.title,
        routeIndex,
        lessonComplete: completedSections.has(section.id),
        longTermMastery: mastery,
        officialQualification: false,
        lessonAvailable: !!lesson && Array.isArray(lesson.cards) && lesson.cards.length === 3,
        questionIds: sectionQuestions.map(question => question.id),
        questionCount: sectionQuestions.length,
        status: mastery.hasError
          ? 'needs-repair'
          : mastery.practiceSource === 'journey-repair' ? 'needs-practice'
          : mastery.due ? 'review-due'
            : completedSections.has(section.id) ? 'lesson-complete' : 'ready'
      };
      routeIndex += 1;
      return node;
    })
  }));
}

export function getJourneyRecommendations(input) {
  const data = routeInput(input);
  const units = getRouteUnits(data);
  const nodes = units.flatMap(unit => unit.nodes);
  const byIndex = (a, b) => a.routeIndex - b.routeIndex;
  const errorPractice = nodes.filter(node => node.longTermMastery.hasError).sort(byIndex);
  const duePractice = nodes.filter(node => node.longTermMastery.due).sort((a, b) => {
    return (a.longTermMastery.dueAt || 0) - (b.longTermMastery.dueAt || 0) || byIndex(a, b);
  });
  const next = nodes.find(node => !node.lessonComplete && node.lessonAvailable && node.questionIds.length > 0)
    || duePractice[0]
    || errorPractice[0]
    || null;
  return {
    next,
    recommended: errorPractice[0] || duePractice[0] || next,
    errorPractice,
    duePractice
  };
}
