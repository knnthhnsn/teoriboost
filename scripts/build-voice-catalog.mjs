import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS, QUESTIONS } from '../dist/content.js';
import { LESSONS } from '../dist/lessons.js';
import { GARAGE } from '../dist/garage-content.js';
import { GARAGE_HOOKS } from '../dist/garage.js';
import { JUDGE_CASES } from '../dist/judge.js';
import { TURN_VOICE } from '../dist/turn-learning.js';
import { voiceKey, normalizeVoiceText } from '../dist/voice-key.js';
import {
  JUDGE_INTRO_VOICE,
  questionVoiceParts, questionFeedbackParts, sectionVoiceParts,
  lessonVoiceParts, lessonCaseVoiceParts, lessonAnswerVoiceParts,
  lessonRecallPromptParts, lessonRecallAnswerParts, lessonPracticalVoiceParts,
  garageCaseVoiceParts, garageExplainVoiceParts, garageFeedbackVoiceParts,
  garageRecallPromptParts, garageRecallAnswerParts, garagePracticalVoiceParts,
  judgeVoiceParts,
} from '../dist/voice-texts.js';

export function buildVoiceCatalog() {
const entries = new Map();
const add = (value, uses) => {
  const normalized = normalizeVoiceText(value);
  if (!normalized) return;
  const key = voiceKey(normalized);
  const current = entries.get(key);
  if (current && current.text !== normalized) throw new Error(`voiceKey collision: ${key}`);
  if (current) current.uses = [...new Set([...current.uses, ...uses])];
  else entries.set(key, { key, text: normalized, uses: [...new Set(uses)] });
};
const addParts = (parts, use) => parts.forEach((part, index) => add(part, [`${use}:${index + 1}`]));

add(JUDGE_INTRO_VOICE, ['judge:intro']);
for(const [stage,text] of Object.entries(TURN_VOICE))add(text,[`turn-lab:${stage}`]);
for (const q of QUESTIONS) {
  addParts(questionVoiceParts(q), `question:${q.id}:initial`);
  addParts(questionFeedbackParts(q), `question:${q.id}:feedback`);
  addParts(questionFeedbackParts(q, { humor: true }), `question:${q.id}:feedback-humor`);
}
for (const chapter of CHAPTERS) for (const section of chapter.sections || []) addParts(sectionVoiceParts(section), `section:${section.id}`);
for (const [id, lesson] of Object.entries(LESSONS)) {
  addParts(lessonVoiceParts(lesson), `lesson:${id}:initial`);
  addParts(lessonCaseVoiceParts(lesson), `lesson:${id}:case`);
  addParts(lessonAnswerVoiceParts(lesson), `lesson:${id}:answer`);
  addParts(lessonRecallPromptParts(lesson), `lesson:${id}:recall-prompt`);
  addParts(lessonRecallAnswerParts(lesson), `lesson:${id}:recall-answer`);
  addParts(lessonPracticalVoiceParts(lesson), `lesson:${id}:practical`);
}
for (const topic of GARAGE.topics || []) {
  const hook = Array.isArray(GARAGE_HOOKS) ? GARAGE_HOOKS.find(item => item?.id === topic.id) : GARAGE_HOOKS?.[topic.id];
  if (hook) addParts(Array.isArray(hook) ? hook : [hook.text || hook], `garage:${topic.id}:hook`);
  const optionIds = topic.case?.options?.map(option => option.id) || [];
  addParts(garageCaseVoiceParts(topic, optionIds), `garage:${topic.id}:case`);
  addParts(garageExplainVoiceParts(topic), `garage:${topic.id}:initial`);
  addParts(garageFeedbackVoiceParts(topic, optionIds), `garage:${topic.id}:feedback`);
  addParts(garageRecallPromptParts(topic), `garage:${topic.id}:recall-prompt`);
  addParts(garageRecallAnswerParts(topic), `garage:${topic.id}:recall-answer`);
  addParts(garagePracticalVoiceParts(topic), `garage:${topic.id}:practical`);
}
for (const c of JUDGE_CASES) {
  const ruleIds = c.steps?.rules?.map(item => item.id) || c.rules?.map(item => item.id) || [];
  const placeIds = c.steps?.places?.map(item => item.id) || c.places?.map(item => item.id) || [];
  for (const phase of [1, 2, 3, 4]) {
    addParts(judgeVoiceParts(c, phase, { ruleIds, placeIds }), `judge:${c.id}:phase${phase}`);
    if (phase === 2) addParts(judgeVoiceParts(c, phase, { humor: true, ruleIds, placeIds }), `judge:${c.id}:phase${phase}-humor`);
    if (phase === 4) addParts(judgeVoiceParts(c, phase, { humor: true, ruleIds, placeIds }), `judge:${c.id}:phase${phase}-humor`);
  }
}

const catalog = { checked: new Date().toISOString().slice(0, 10), entries: [...entries.values()].sort((a, b) => a.key.localeCompare(b.key)) };
return catalog;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
const catalog = buildVoiceCatalog();
const outputPath = resolve(fileURLToPath(new URL('.', import.meta.url)), '../authoring/voice-catalog.json');
writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
process.stdout.write(`voice catalog: ${catalog.entries.length} entries -> ${outputPath}\n`);
}

