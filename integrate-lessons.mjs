import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS, SOURCES } from './dist/content.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const research = path.join(root, 'authoring');
const sourceIds = new Set(SOURCES.map(source => source.id));
const sectionMap = new Map(CHAPTERS.flatMap(chapter => chapter.sections.map(section => [section.id, chapter.id])));
const batches = ['a', 'b'].map(batch => JSON.parse(fs.readFileSync(path.join(research, `lesson-depth-${batch}.json`), 'utf8')));
const lessons = batches.flatMap(batch => batch.lessons);
const seen = new Set();
const check = (condition, message) => { if (!condition) throw new Error(message); };
for (const lesson of lessons) {
  check(!seen.has(lesson.sectionId), `Duplicate section ${lesson.sectionId}`);
  seen.add(lesson.sectionId);
  check(sectionMap.get(lesson.sectionId) === lesson.chapterId, `Wrong chapter for ${lesson.sectionId}`);
  check(typeof lesson.lead === 'string' && lesson.lead.length > 15, `Missing lead ${lesson.sectionId}`);
  check(Array.isArray(lesson.cards) && lesson.cards.length === 3, `Missing cards ${lesson.sectionId}`);
  for (const card of [...lesson.cards, lesson.case]) {
    check(card.sourceIds?.length > 0 && card.sourceIds.every(id => sourceIds.has(id)), `Unknown source ${lesson.sectionId}`);
    check(typeof card.sourceLocator === 'string' && card.sourceLocator.length > 5, `Missing source locator ${lesson.sectionId}`);
  }
  check(lesson.cards.every(card => card.title?.length && card.body?.length > 40), `Empty card ${lesson.sectionId}`);
  check(['context', 'action', 'why'].every(key => lesson.case[key]?.length > 10), `Incomplete case ${lesson.sectionId}`);
  check(lesson.recall?.prompt?.length > 10 && lesson.recall?.answer?.length > 20, `Incomplete recall ${lesson.sectionId}`);
}
check(seen.size === sectionMap.size && [...sectionMap.keys()].every(id => seen.has(id)), 'Lesson section coverage mismatch');
const mapped = Object.fromEntries(lessons.map(lesson => [lesson.sectionId, lesson]));
fs.writeFileSync(path.join(root, 'dist', 'lessons.js'), `// Original Danish micro-lessons. Source checked 2026-10-12; see research reviews.\nexport const LESSONS = ${JSON.stringify(mapped, null, 2)};\n`);
console.log(`Integrated ${lessons.length} lessons, ${lessons.length * 3} explanation cards, ${lessons.length} cases and recalls.`);
