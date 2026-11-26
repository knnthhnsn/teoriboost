const text = value => typeof value === 'string' ? value : '';

const sentenceEnd = /[.!?…;:]$/u;
const joinVoiceParts = parts => parts.map(text).map(value => value.trim().replace(/\s+/gu, ' ')).filter(Boolean)
  .reduce((result, value) => result ? `${result}${sentenceEnd.test(result) ? ' ' : '. '}${value}` : value, '');

const ordered = (items, ids) => {
  const list = Array.isArray(items) ? items : [];
  if (!Array.isArray(ids) || !ids.length) return list;
  const byId = new Map(list.map(item => [item?.id, item]));
  const picked = ids.map(id => byId.get(id)).filter(Boolean);
  const pickedIds = new Set(picked.map(item => item.id));
  return [...picked, ...list.filter(item => !pickedIds.has(item?.id))];
};

export function questionVoiceParts(q) {
  if (!q) return [];
  return [joinVoiceParts([q.prompt, q.context]), ...(q.statements || []).flatMap((statement, index) => [`Udsagn ${index + 1}.`, text(statement?.text)])].filter(Boolean);
}

export function questionGagFits(q, correct) {
  if (!q?.gag || !['sneglen','kegle','daek'].includes(q.speaker)) return false;
  // Rødt lys i tone of voice: ingen jokes efter et forkert svar
  if (!correct) return false;
  return q.gagWhen === 'always' || q.gagWhen === 'correct';
}

export function questionFeedbackParts(q, { humor = false, correct } = {}) {
  if (!q) return [];
  return [text(q.explanation), humor && (typeof correct === 'boolean' ? questionGagFits(q, correct) : !!q.gag && ['sneglen','kegle','daek'].includes(q.speaker)) ? text(q.gag) : ''].filter(Boolean);
}

export function sectionVoiceParts(s) {
  if (!s) return [];
  return [joinVoiceParts([s.title, ...(s.facts || [])])].filter(Boolean);
}

export function lessonVoiceParts(l) {
  if (!l) return [];
  return [joinVoiceParts([l.lead, ...(l.cards || []).flatMap(card => [card?.title, card?.body])])].filter(Boolean);
}

export function lessonCaseVoiceParts(l) {
  return l?.case ? [text(l.case.context)].filter(Boolean) : [];
}

export function lessonAnswerVoiceParts(l) {
  return l?.case ? [joinVoiceParts([l.case.action, l.case.why])].filter(Boolean) : [];
}

export function lessonRecallPromptParts(l) {
  return l?.recall ? [text(l.recall.prompt)].filter(Boolean) : [];
}

export function lessonRecallAnswerParts(l) {
  return l?.recall ? [text(l.recall.answer)].filter(Boolean) : [];
}

export function lessonPracticalVoiceParts(l) {
  return l?.practicalNote ? [text(l.practicalNote)].filter(Boolean) : [];
}

export function garageCaseVoiceParts(t, optionIds) {
  if (!t?.case) return [];
  return [text(t.case.context), ...ordered(t.case.options, optionIds).flatMap((option, index) => [`Mulighed ${index + 1}.`, text(option?.text)])].filter(Boolean);
}

export function garageExplainVoiceParts(t) {
  if (!t) return [];
  return [joinVoiceParts([t.lead, ...(t.cards || []).flatMap(card => [card?.title, card?.body])])].filter(Boolean);
}

export function garageFeedbackVoiceParts(t, optionIds) {
  if (!t?.case) return [];
  return ordered(t.case.options, optionIds).flatMap((option, index) => [
    `Mulighed ${index + 1}.`,
    text(option?.text),
    option?.correct ? 'Denne mulighed passer her.' : 'Denne mulighed passer ikke her.',
    text(option?.why),
  ]).filter(Boolean);
}

export function garageRecallPromptParts(t) {
  return t?.recall ? [text(t.recall.prompt)].filter(Boolean) : [];
}

export function garageRecallAnswerParts(t) {
  return t?.recall ? [text(t.recall.answer)].filter(Boolean) : [];
}

export function garagePracticalVoiceParts(t) {
  return t?.practical?.length ? [joinVoiceParts(t.practical.flatMap(item => [item?.title, item?.action]))].filter(Boolean) : [];
}

export function judgeVoiceParts(c, phase, { humor = false, issueIds = [], ruleIds = [], placeIds = [] } = {}) {
  if (!c) return [];
  if (phase === 1) return [text(c.issuePrompt), ...ordered(c.issue,issueIds).flatMap((item,index)=>[`Mulighed ${index+1}.`,text(item?.label)])].filter(Boolean);
  if (phase === 2) return [text(c.setup), text(c.rulePrompt), ...ordered(c.rules,ruleIds).flatMap((item,index)=>[`Mulighed ${index+1}.`,text(item?.label)]), humor ? text(c.excuse) : ''].filter(Boolean);
  if (phase === 3) return [text(c.setup), text(c.placePrompt), ...ordered(c.places,placeIds).flatMap((item,index)=>[`Mulighed ${index+1}.`,text(item?.label)])].filter(Boolean);
  if (phase === 4) return [text(c.explanation), humor ? text(c.excuse) : ''].filter(Boolean);
  return [];
}

export const JUDGE_INTRO_VOICE = 'Velkommen til Natkørsel. Se klippet. Find problemet, vælg reglen og placér bilen. Til sidst ser du et korrekt forløb. Du kan altid prøve igen.';

