import { gradeQuestion, isCompleteResponse, questionSignature } from './core.js';

export const JOURNEY_SESSION_VERSION = 1;
export const JOURNEY_STAGES = Object.freeze([
  'understand',
  'apply',
  'transfer',
  'recall',
  'checkpoint',
  'done'
]);

export const JOURNEY_ACTIONS = Object.freeze({
  READ_CARD: 'read-card',
  SUBMIT_APPLY: 'submit-apply',
  COMMIT_TRANSFER_MENTAL: 'commit-transfer-mental',
  REVEAL_TRANSFER: 'reveal-transfer',
  SUBMIT_TRANSFER: 'submit-transfer',
  CONTINUE_TRANSFER: 'continue-transfer',
  COMMIT_RECALL_MENTAL: 'commit-recall-mental',
  REVEAL_RECALL: 'reveal-recall',
  SUBMIT_RECALL: 'submit-recall',
  SELF_CHECK_RECALL: 'self-check-recall',
  SUBMIT_CHECKPOINT: 'submit-checkpoint',
  FINALIZE: 'finalize'
});

const SESSION_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{2,119}$/;
const ACTION_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,239}$/;
const IDENTITY_ORDER = Object.freeze([0, 1, 2, 3]);
const FALLBACK_ORDER = Object.freeze([1, 2, 3, 0]);
const MAX_OPEN_ANSWER_LENGTH = 5000;

function hashText(text, prefix) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    hash ^= BigInt(code & 0xff);
    hash = (hash * prime) & mask;
    hash ^= BigInt(code >>> 8);
    hash = (hash * prime) & mask;
  }
  return `${prefix}-${hash.toString(16).padStart(16, '0')}`;
}

function lessonProjection(lesson) {
  if (!lesson || typeof lesson.sectionId !== 'string' || typeof lesson.chapterId !== 'string') return null;
  if (typeof lesson.lead !== 'string' || !Array.isArray(lesson.cards) || lesson.cards.length !== 3) return null;
  const cards = lesson.cards.map(card => {
    if (!card || typeof card.title !== 'string' || typeof card.body !== 'string') return null;
    if (!Array.isArray(card.sourceIds) || !card.sourceIds.every(id => typeof id === 'string')) return null;
    if (typeof card.sourceLocator !== 'string') return null;
    return [card.title, card.body, [...card.sourceIds], card.sourceLocator];
  });
  if (cards.some(card => card === null)) return null;
  const lessonCase = lesson.case;
  if (!lessonCase || !['context', 'action', 'why', 'sourceLocator'].every(key => typeof lessonCase[key] === 'string')) return null;
  if (!Array.isArray(lessonCase.sourceIds) || !lessonCase.sourceIds.every(id => typeof id === 'string')) return null;
  if (!lesson.recall || typeof lesson.recall.prompt !== 'string' || typeof lesson.recall.answer !== 'string') return null;
  if (lesson.practicalNote !== null && typeof lesson.practicalNote !== 'string') return null;
  return [
    lesson.sectionId,
    lesson.chapterId,
    lesson.lead,
    cards,
    [lessonCase.context, lessonCase.action, lessonCase.why, [...lessonCase.sourceIds], lessonCase.sourceLocator],
    [lesson.recall.prompt, lesson.recall.answer],
    lesson.practicalNote
  ];
}

export function lessonSignature(lesson) {
  const projection = lessonProjection(lesson);
  return projection ? hashText(JSON.stringify(projection), 'ls1') : null;
}

function questionContentSignature(question) {
  const answerSignature = questionSignature(question);
  if (!answerSignature || typeof question.prompt !== 'string' || typeof question.explanation !== 'string') return null;
  if (!Array.isArray(question.sourceIds) || !question.sourceIds.every(id => typeof id === 'string')) return null;
  const projection = [
    answerSignature,
    question.prompt,
    question.explanation,
    [...question.sourceIds],
    typeof question.scene === 'string' ? question.scene : null,
    typeof question.gag === 'string' ? question.gag : null
  ];
  return hashText(JSON.stringify(projection), 'qc1');
}

function safeSessionId(value) {
  return typeof value === 'string' && SESSION_ID_PATTERN.test(value);
}

function safeActionId(value) {
  return typeof value === 'string' && ACTION_ID_PATTERN.test(value);
}

function safeTime(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function cleanOpenAnswer(value) {
  if (typeof value !== 'string') return null;
  const answer = value.trim();
  return answer.length > 0 && answer.length <= MAX_OPEN_ANSWER_LENGTH ? answer : null;
}

function questionMap(questions) {
  return new Map(Array.isArray(questions) ? questions.map(question => [question?.id, question]) : []);
}

function lessonMap(lessons) {
  if (Array.isArray(lessons)) return new Map(lessons.map(lesson => [lesson?.sectionId, lesson]));
  if (lessons && typeof lessons === 'object') return new Map(Object.entries(lessons));
  return new Map();
}

function selectCheckpoint(question, questions) {
  const alternative = [...questions]
    .filter(candidate => candidate?.sectionId === question.sectionId
      && candidate.id !== question.id
      && questionSignature(candidate)
      && questionContentSignature(candidate))
    .sort((left, right) => left.id.localeCompare(right.id))[0];
  if (alternative) {
    return {
      questionId: alternative.id,
      signature: questionSignature(alternative),
      contentSignature: questionContentSignature(alternative),
      reordered: false,
      order: [...IDENTITY_ORDER]
    };
  }
  return {
    questionId: question.id,
    signature: questionSignature(question),
    contentSignature: questionContentSignature(question),
    reordered: true,
    order: [...FALLBACK_ORDER]
  };
}

function makeBase({ sessionId, kind, question, lesson, checkpoint, startedAt }) {
  return {
    version: JOURNEY_SESSION_VERSION,
    sessionId,
    kind,
    // A review starts with cold retrieval. Showing the cards first would turn
    // the graded attempt into recognition immediately after rereading.
    stage: kind === 'review' ? 'apply' : 'understand',
    sectionId: question.sectionId,
    questionId: question.id,
    questionSignature: questionSignature(question),
    questionContentSignature: questionContentSignature(question),
    lessonSignature: lessonSignature(lesson),
    startedAt,
    completedAt: null,
    finalizedAt: null,
    cardsRead: [false, false, false],
    apply: { attempts: [] },
    transfer: { answer: null, submittedAt: null, continuedAt: null },
    recall: { answer: null, submittedAt: null, selfChecked: false, selfCheck: null, selfCheckedAt: null },
    checkpoint: { ...checkpoint, order: [...checkpoint.order], attempts: [] },
    events: []
  };
}

export function createJourneySession({
  sessionId,
  kind = 'lesson',
  question,
  lesson,
  questions = [],
  startedAt
} = {}) {
  const qSignature = questionSignature(question);
  const qContentSignature = questionContentSignature(question);
  const lSignature = lessonSignature(lesson);
  if (!qSignature || !qContentSignature || !lSignature || lesson.sectionId !== question.sectionId) {
    throw new Error('A journey requires one valid question and its three-card lesson');
  }
  if (!['lesson', 'review'].includes(kind)) throw new Error('Journey kind must be lesson or review');
  if (!safeTime(startedAt)) throw new Error('Journey startedAt must be a non-negative integer');
  const resolvedId = sessionId ?? `journey-${startedAt.toString(36)}-${qSignature.slice(4, 12)}`;
  if (!safeSessionId(resolvedId)) throw new Error('Journey sessionId is invalid');
  const catalog = [...questions];
  if (!catalog.some(candidate => candidate?.id === question.id)) catalog.push(question);
  const checkpoint = selectCheckpoint(question, catalog);
  if (!checkpoint.signature || !checkpoint.contentSignature) throw new Error('Journey checkpoint question is invalid');
  return makeBase({ sessionId: resolvedId, kind, question, lesson, checkpoint, startedAt });
}

function orderedQuestion(question, order) {
  return {
    ...question,
    statements: order.map(index => ({ ...question.statements[index] }))
  };
}

function contentFor(session, content) {
  const questions = questionMap(content?.questions);
  const lessons = lessonMap(content?.lessons);
  const question = questions.get(session.questionId);
  const lesson = lessons.get(session.sectionId);
  const checkpointQuestion = questions.get(session.checkpoint?.questionId);
  if (!question || !lesson || !checkpointQuestion) return null;
  if (question.sectionId !== session.sectionId || lesson.sectionId !== session.sectionId) return null;
  if (checkpointQuestion.sectionId !== session.sectionId) return null;
  if (questionSignature(question) !== session.questionSignature) return null;
  if (questionContentSignature(question) !== session.questionContentSignature) return null;
  if (questionSignature(checkpointQuestion) !== session.checkpoint.signature) return null;
  if (questionContentSignature(checkpointQuestion) !== session.checkpoint.contentSignature) return null;
  if (lessonSignature(lesson) !== session.lessonSignature) return null;
  if (typeof session.checkpoint.reordered !== 'boolean') return null;
  const order = session.checkpoint.order;
  if (!Array.isArray(order) || order.length !== 4 || new Set(order).size !== 4) return null;
  if (!order.every(index => Number.isInteger(index) && index >= 0 && index < 4)) return null;
  if (session.checkpoint.reordered) {
    if (checkpointQuestion.id !== question.id || order.every((value, index) => value === index)) return null;
  } else if (checkpointQuestion.id === question.id || !order.every((value, index) => value === index)) {
    return null;
  }
  return { question, lesson, checkpointQuestion, checkpointView: orderedQuestion(checkpointQuestion, order) };
}

function appendEvent(session, action, details = {}) {
  const event = {
    seq: session.events.length + 1,
    id: action.actionId,
    type: action.type,
    at: action.at,
    ...details
  };
  return { ...session, events: [...session.events, event] };
}

function outcome(session, accepted, extra = {}) {
  return { session, outcome: { accepted, ...extra } };
}

function validActionEnvelope(session, action) {
  if (!action || typeof action.type !== 'string' || !safeActionId(action.actionId) || !safeTime(action.at)) return false;
  if (action.at < session.startedAt) return false;
  const last = session.events.at(-1);
  return !last || action.at >= last.at;
}

function performAction(session, action, resolved) {
  if (!validActionEnvelope(session, action)) return outcome(session, false, { reason: 'invalid-action' });
  if (session.events.some(event => event.id === action.actionId)) {
    return outcome(session, false, {
      duplicate: true,
      reason: 'duplicate-action',
      evidence: session.stage === 'done' ? getJourneyCompletionEvidence(session) : null
    });
  }

  if (action.type === JOURNEY_ACTIONS.READ_CARD) {
    if (session.stage !== 'understand' || !Number.isInteger(action.index) || action.index < 0 || action.index >= 3) {
      return outcome(session, false, { reason: 'wrong-stage-or-card' });
    }
    if (session.cardsRead[action.index]) return outcome(session, false, { duplicate: true, reason: 'card-already-read' });
    const cardsRead = [...session.cardsRead];
    cardsRead[action.index] = true;
    let next = appendEvent({ ...session, cardsRead }, action, { cardIndex: action.index });
    if (cardsRead.every(Boolean)) next = { ...next, stage: session.kind === 'review' ? 'transfer' : 'apply' };
    return outcome(next, true, { stage: next.stage });
  }

  if (action.type === JOURNEY_ACTIONS.SUBMIT_APPLY) {
    if (session.stage !== 'apply' || !isCompleteResponse(action.answers)) {
      return outcome(session, false, { reason: 'four-boolean-answer-required' });
    }
    const answers = [...action.answers];
    const correct = gradeQuestion(resolved.question, answers);
    const attempt = { actionId: action.actionId, at: action.at, answers, correct };
    let next = appendEvent({ ...session, apply: { attempts: [...session.apply.attempts, attempt] } }, action, { answers, correct });
    if (correct) next = { ...next, stage: session.kind === 'review' ? 'understand' : 'transfer' };
    return outcome(next, true, { correct, immediateFeedback: true, explanation: resolved.question.explanation ?? '' });
  }

  if (action.type === JOURNEY_ACTIONS.SUBMIT_TRANSFER) {
    const answer = cleanOpenAnswer(action.answer);
    if (session.stage !== 'transfer' || session.transfer.answer !== null
      || session.transfer.mode !== undefined || answer === null) {
      return outcome(session, false, { reason: 'open-transfer-answer-required' });
    }
    const transfer = { answer, submittedAt: action.at, continuedAt: null };
    const next = appendEvent({ ...session, transfer }, action, { answer });
    return outcome(next, true, {
      modelAnswer: { action: resolved.lesson.case.action, why: resolved.lesson.case.why }
    });
  }

  if (action.type === JOURNEY_ACTIONS.COMMIT_TRANSFER_MENTAL) {
    if (session.stage !== 'transfer' || session.transfer.answer !== null || session.transfer.mode === 'mental') {
      return outcome(session, false, { reason: 'transfer-response-already-committed' });
    }
    const transfer = {
      ...session.transfer,
      mode: 'mental',
      committedAt: action.at,
      revealedAt: null
    };
    const next = appendEvent({ ...session, transfer }, action, { responseMode: 'mental' });
    return outcome(next, true, { responseMode: 'mental', modelAnswer: null });
  }

  if (action.type === JOURNEY_ACTIONS.REVEAL_TRANSFER) {
    if (session.stage !== 'transfer' || session.transfer.mode !== 'mental'
      || !safeTime(session.transfer.committedAt) || session.transfer.revealedAt !== null) {
      return outcome(session, false, { reason: 'mental-transfer-commit-required' });
    }
    const transfer = { ...session.transfer, revealedAt: action.at };
    const next = appendEvent({ ...session, transfer }, action, { responseMode: 'mental' });
    return outcome(next, true, {
      responseMode: 'mental',
      modelAnswer: { action: resolved.lesson.case.action, why: resolved.lesson.case.why }
    });
  }

  if (action.type === JOURNEY_ACTIONS.CONTINUE_TRANSFER) {
    const writtenResponse = session.transfer.answer !== null;
    const revealedMentalResponse = session.transfer.mode === 'mental' && safeTime(session.transfer.revealedAt);
    if (session.stage !== 'transfer' || (!writtenResponse && !revealedMentalResponse)
      || session.transfer.continuedAt !== null) {
      return outcome(session, false, { reason: 'transfer-answer-required' });
    }
    const transfer = { ...session.transfer, continuedAt: action.at };
    const next = appendEvent({ ...session, stage: 'recall', transfer }, action);
    return outcome(next, true, { stage: 'recall' });
  }

  if (action.type === JOURNEY_ACTIONS.SUBMIT_RECALL) {
    const answer = cleanOpenAnswer(action.answer);
    if (session.stage !== 'recall' || session.recall.answer !== null
      || session.recall.mode !== undefined || answer === null) {
      return outcome(session, false, { reason: 'open-recall-answer-required' });
    }
    const recall = { ...session.recall, answer, submittedAt: action.at };
    const next = appendEvent({ ...session, recall }, action, { answer });
    return outcome(next, true, { modelAnswer: resolved.lesson.recall.answer, autoAssessed: false });
  }

  if (action.type === JOURNEY_ACTIONS.COMMIT_RECALL_MENTAL) {
    if (session.stage !== 'recall' || session.recall.answer !== null || session.recall.mode === 'mental') {
      return outcome(session, false, { reason: 'recall-response-already-committed' });
    }
    const recall = {
      ...session.recall,
      mode: 'mental',
      committedAt: action.at,
      revealedAt: null
    };
    const next = appendEvent({ ...session, recall }, action, { responseMode: 'mental' });
    return outcome(next, true, { responseMode: 'mental', modelAnswer: null, autoAssessed: false });
  }

  if (action.type === JOURNEY_ACTIONS.REVEAL_RECALL) {
    if (session.stage !== 'recall' || session.recall.mode !== 'mental'
      || !safeTime(session.recall.committedAt) || session.recall.revealedAt !== null) {
      return outcome(session, false, { reason: 'mental-recall-commit-required' });
    }
    const recall = { ...session.recall, revealedAt: action.at };
    const next = appendEvent({ ...session, recall }, action, { responseMode: 'mental' });
    return outcome(next, true, {
      responseMode: 'mental',
      modelAnswer: resolved.lesson.recall.answer,
      autoAssessed: false
    });
  }

  if (action.type === JOURNEY_ACTIONS.SELF_CHECK_RECALL) {
    const selfCheck = action.selfCheck;
    const writtenResponse = session.recall.answer !== null;
    const revealedMentalResponse = session.recall.mode === 'mental' && safeTime(session.recall.revealedAt);
    if (session.stage !== 'recall' || (!writtenResponse && !revealedMentalResponse) || session.recall.selfChecked) {
      return outcome(session, false, { reason: 'recall-answer-required' });
    }
    if (!['remembered', 'needs-review'].includes(selfCheck)) {
      return outcome(session, false, { reason: 'explicit-self-check-required' });
    }
    const recall = { ...session.recall, selfChecked: true, selfCheck, selfCheckedAt: action.at };
    const next = appendEvent({ ...session, stage: 'checkpoint', recall }, action, { selfCheck });
    return outcome(next, true, { stage: 'checkpoint', autoAssessed: false });
  }

  if (action.type === JOURNEY_ACTIONS.SUBMIT_CHECKPOINT) {
    if (session.stage !== 'checkpoint' || !isCompleteResponse(action.answers)) {
      return outcome(session, false, { reason: 'four-boolean-answer-required' });
    }
    const answers = [...action.answers];
    const correct = gradeQuestion(resolved.checkpointView, answers);
    const attempt = { actionId: action.actionId, at: action.at, answers, correct };
    const checkpoint = { ...session.checkpoint, attempts: [...session.checkpoint.attempts, attempt] };
    let next = appendEvent({ ...session, checkpoint }, action, { answers, correct });
    if (correct) next = { ...next, stage: 'done', completedAt: action.at };
    return outcome(next, true, {
      correct,
      immediateFeedback: true,
      explanation: resolved.checkpointQuestion.explanation ?? '',
      evidence: correct ? getJourneyCompletionEvidence(next) : null
    });
  }

  if (action.type === JOURNEY_ACTIONS.FINALIZE) {
    if (session.stage !== 'done') return outcome(session, false, { reason: 'objective-incomplete' });
    if (session.finalizedAt !== null) {
      return outcome(session, false, { duplicate: true, reason: 'already-finalized', evidence: getJourneyCompletionEvidence(session) });
    }
    const next = appendEvent({ ...session, finalizedAt: action.at }, action);
    return outcome(next, true, { evidence: getJourneyCompletionEvidence(next) });
  }

  return outcome(session, false, { reason: 'unknown-action' });
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function eventAsAction(event) {
  const action = { type: event.type, actionId: event.id, at: event.at };
  if (event.type === JOURNEY_ACTIONS.READ_CARD) action.index = event.cardIndex;
  if (event.type === JOURNEY_ACTIONS.SUBMIT_APPLY || event.type === JOURNEY_ACTIONS.SUBMIT_CHECKPOINT) action.answers = event.answers;
  if (event.type === JOURNEY_ACTIONS.SUBMIT_TRANSFER || event.type === JOURNEY_ACTIONS.SUBMIT_RECALL) action.answer = event.answer;
  if (event.type === JOURNEY_ACTIONS.SELF_CHECK_RECALL) action.selfCheck = event.selfCheck;
  return action;
}

export function restoreJourneySession(raw, content) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || parsed.version !== JOURNEY_SESSION_VERSION) return null;
    if (!safeSessionId(parsed.sessionId) || !['lesson', 'review'].includes(parsed.kind) || !safeTime(parsed.startedAt)) return null;
    if (typeof parsed.sectionId !== 'string' || typeof parsed.questionId !== 'string') return null;
    if (typeof parsed.questionSignature !== 'string' || typeof parsed.questionContentSignature !== 'string') return null;
    if (typeof parsed.lessonSignature !== 'string') return null;
    if (!parsed.checkpoint || !Array.isArray(parsed.events) || parsed.events.length > 200) return null;
    const resolved = contentFor(parsed, content);
    if (!resolved) return null;
    const checkpoint = {
      questionId: parsed.checkpoint.questionId,
      signature: parsed.checkpoint.signature,
      contentSignature: parsed.checkpoint.contentSignature,
      reordered: parsed.checkpoint.reordered,
      order: [...parsed.checkpoint.order]
    };
    let rebuilt = makeBase({
      sessionId: parsed.sessionId,
      kind: parsed.kind,
      question: resolved.question,
      lesson: resolved.lesson,
      checkpoint,
      startedAt: parsed.startedAt
    });
    for (let index = 0; index < parsed.events.length; index += 1) {
      const event = parsed.events[index];
      if (!event || event.seq !== index + 1 || !safeActionId(event.id) || event.type === undefined) return null;
      const result = performAction(rebuilt, eventAsAction(event), resolved);
      if (!result.outcome.accepted) return null;
      rebuilt = result.session;
    }
    return canonicalJson(rebuilt) === canonicalJson(parsed) ? rebuilt : null;
  } catch {
    return null;
  }
}

export function serializeJourneySession(session) {
  return JSON.stringify(session);
}

export function transitionJourneySession(session, action, content) {
  const restored = restoreJourneySession(session, content);
  if (!restored) return outcome(null, false, { reason: 'invalid-session' });
  return performAction(restored, action, contentFor(restored, content));
}

export const applyJourneyAction = transitionJourneySession;

export function nextJourneyActionId(session, type = 'action') {
  const safeType = String(type).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').slice(0, 40) || 'action';
  return `${session.sessionId}:${session.events.length + 1}:${safeType}`;
}

export function getJourneyStep(session, content) {
  const restored = restoreJourneySession(session, content);
  if (!restored) return null;
  const resolved = contentFor(restored, content);
  if (restored.stage === 'understand') {
    return { stage: 'understand', cards: resolved.lesson.cards, cardsRead: [...restored.cardsRead] };
  }
  if (restored.stage === 'apply') return { stage: 'apply', question: resolved.question, attempts: restored.apply.attempts.length };
  if (restored.stage === 'transfer') {
    const responseMode = restored.transfer.mode === 'mental'
      ? 'mental'
      : (restored.transfer.answer === null ? null : 'written');
    const revealed = responseMode === 'written'
      || (responseMode === 'mental' && safeTime(restored.transfer.revealedAt));
    return {
      stage: 'transfer',
      case: resolved.lesson.case,
      answer: restored.transfer.answer,
      responseMode,
      committed: responseMode !== null,
      revealed,
      modelAnswer: revealed ? { action: resolved.lesson.case.action, why: resolved.lesson.case.why } : null
    };
  }
  if (restored.stage === 'recall') {
    const responseMode = restored.recall.mode === 'mental'
      ? 'mental'
      : (restored.recall.answer === null ? null : 'written');
    const revealed = responseMode === 'written'
      || (responseMode === 'mental' && safeTime(restored.recall.revealedAt));
    return {
      stage: 'recall',
      prompt: resolved.lesson.recall.prompt,
      answer: restored.recall.answer,
      responseMode,
      committed: responseMode !== null,
      revealed,
      modelAnswer: revealed ? resolved.lesson.recall.answer : null,
      selfChecked: restored.recall.selfChecked,
      selfCheck: restored.recall.selfCheck,
      autoAssessed: false
    };
  }
  if (restored.stage === 'checkpoint') {
    return {
      stage: 'checkpoint',
      question: resolved.checkpointView,
      reordered: restored.checkpoint.reordered,
      notice: restored.checkpoint.reordered
        ? 'Brug reglen én gang til i situationen.'
        : 'Nyt spørgsmål fra samme emne.',
      attempts: restored.checkpoint.attempts.length
    };
  }
  return { stage: 'done', evidence: getJourneyCompletionEvidence(restored), finalized: restored.finalizedAt !== null };
}

export function getJourneyCompletionEvidence(session) {
  if (!session || session.stage !== 'done') return null;
  const applyAttempts = session.apply?.attempts ?? [];
  const checkpointAttempts = session.checkpoint?.attempts ?? [];
  const applyHadWrong = applyAttempts.some(attempt => attempt.correct === false);
  const applyCorrectIndex = applyAttempts.findIndex(attempt => attempt.correct === true);
  const checkpointHadWrong = checkpointAttempts.some(attempt => attempt.correct === false);
  const checkpointCorrectIndex = checkpointAttempts.findIndex(attempt => attempt.correct === true);
  const transferResponded = session.transfer?.answer !== null || session.transfer?.mode === 'mental';
  const transferRevealed = session.transfer?.answer !== null || safeTime(session.transfer?.revealedAt);
  const recallResponded = session.recall?.answer !== null || session.recall?.mode === 'mental';
  const recallRevealed = session.recall?.answer !== null || safeTime(session.recall?.revealedAt);
  return {
    sessionId: session.sessionId,
    sectionId: session.sectionId,
    kind: session.kind,
    objectiveComplete: session.cardsRead?.every(Boolean) === true
      && applyCorrectIndex >= 0
      && transferResponded
      && transferRevealed
      && recallResponded
      && recallRevealed
      && session.recall?.selfChecked === true
      && checkpointAttempts.at(-1)?.correct === true,
    cardsCompleted: session.cardsRead?.filter(Boolean).length ?? 0,
    apply: {
      graded: applyAttempts.length > 0,
      hadWrong: applyHadWrong,
      repaired: applyHadWrong && applyCorrectIndex > 0,
      correct: applyAttempts.at(-1)?.correct === true
    },
    transfer: {
      responded: transferResponded,
      revealed: transferRevealed
    },
    recall: {
      responded: recallResponded,
      revealed: recallRevealed,
      selfChecked: session.recall?.selfChecked === true
    },
    checkpoint: {
      graded: checkpointAttempts.length > 0,
      hadWrong: checkpointHadWrong,
      repaired: checkpointHadWrong && checkpointCorrectIndex > 0,
      correct: checkpointAttempts.at(-1)?.correct === true,
      questionId: session.checkpoint?.questionId ?? null
    },
    startedAt: session.startedAt,
    completedAt: session.completedAt
  };
}

export function isJourneyComplete(session) {
  return getJourneyCompletionEvidence(session)?.objectiveComplete === true;
}
