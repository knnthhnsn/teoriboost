import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CHAPTERS, QUESTIONS, SOURCES } from './dist/content.js';
import { LESSONS } from './dist/lessons.js';
import { questionDiagram } from './dist/diagrams.js';
import { GARAGE } from './dist/garage-content.js';
import { validateGarage } from './garage-data.mjs';
import { VOICE_PACK } from './dist/voice-pack.js';
import { validateVoicePack } from './voice-validation.mjs';
import { buildVoiceCatalog } from './scripts/build-voice-catalog.mjs';
import { ART_ASSETS } from './dist/art.js';
import { CAST } from './dist/cast.js';
import { BASES as CAR_BASES } from './dist/mybil-catalog.js';
import { createHash } from 'node:crypto';
import {EXAM_PHOTOS} from './dist/exam-photos.js';
import {validateExamVisuals} from './visual-validation.mjs';
import {execFileSync} from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const errors = [];
errors.push(...validateGarage(GARAGE));
const savedVoiceCatalog = JSON.parse(fs.readFileSync(path.join(root, 'authoring/voice-catalog.json'), 'utf8'));
const currentVoiceCatalog = buildVoiceCatalog();
if (JSON.stringify(savedVoiceCatalog.entries) !== JSON.stringify(currentVoiceCatalog.entries)) errors.push('voice: kataloget matcher ikke de aktuelle læringstekster');
const voice = validateVoicePack({
  dist,
  catalogue: savedVoiceCatalog,
  production: JSON.parse(fs.readFileSync(path.join(root, 'authoring/voice-production.json'), 'utf8')),
  pack: VOICE_PACK
});
errors.push(...voice.errors);
const checkedAssets = new Set();

const allowedSourceHosts = new Set([
  'fstyr.dk',
  'www.fstyr.dk',
  'cdn.fstyr.dk',
  'retsinformation.dk',
  'www.retsinformation.dk'
]);
const allowedScenes = new Set(['yield', 'stop', 'pedestrian', 'right', 'bike', 'speed', 'parking', 'motorway', 'night', 'car', 'emergency', 'weather']);

function check(condition, message) {
  if (!condition) errors.push(message);
}

function checkUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) errors.push(`${label}: dublet-id "${value}"`);
    seen.add(value);
  }
}

function checkId(value, label) {
  check(typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), `${label}: ugyldigt id "${value}"`);
}

check(Array.isArray(SOURCES) && SOURCES.length > 0, 'SOURCES skal være en ikke-tom liste');
check(Array.isArray(CHAPTERS) && CHAPTERS.length === 10, `forventede 10 kapitler, fandt ${CHAPTERS?.length ?? 0}`);
check(Array.isArray(QUESTIONS) && QUESTIONS.length >= 50, `spørgsmålsbank under baseline: ${QUESTIONS?.length ?? 0}/50`);

checkUnique(SOURCES.map(source => source.id), 'kilde');
checkUnique(CHAPTERS.map(chapter => chapter.id), 'kapitel');
checkUnique(QUESTIONS.map(question => question.id), 'spørgsmål');

const sourceIds = new Set(SOURCES.map(source => source.id));
for (const source of SOURCES) {
  checkId(source.id, 'kilde');
  check(typeof source.label === 'string' && source.label.trim().length > 5, `kilde ${source.id}: mangler label`);
  check(source.checked === '2026-10-12', `kilde ${source.id}: checked skal være 2026-10-12`);
  try {
    const url = new URL(source.url);
    check(url.protocol === 'https:', `kilde ${source.id}: kun HTTPS er tilladt`);
    check(allowedSourceHosts.has(url.hostname), `kilde ${source.id}: ikke-tilladt værtsnavn ${url.hostname}`);
  } catch {
    errors.push(`kilde ${source.id}: ugyldig URL`);
  }
}

const sections = [];
const sectionKeys = new Set();
for (const chapter of CHAPTERS) {
  checkId(chapter.id, 'kapitel');
  check(typeof chapter.title === 'string' && chapter.title.trim(), `kapitel ${chapter.id}: mangler titel`);
  check(typeof chapter.tagline === 'string' && chapter.tagline.trim(), `kapitel ${chapter.id}: mangler tagline`);
  check(typeof chapter.color === 'string' && /^#[0-9a-f]{6}$/i.test(chapter.color), `kapitel ${chapter.id}: ugyldig farve`);
  check(typeof chapter.icon === 'string' && chapter.icon.trim(), `kapitel ${chapter.id}: mangler ikon`);
  check(Array.isArray(chapter.sections) && chapter.sections.length > 0, `kapitel ${chapter.id}: mangler sektioner`);
  checkUnique(chapter.sections.map(section => section.id), `sektion i ${chapter.id}`);

  for (const section of chapter.sections) {
    checkId(section.id, `sektion i ${chapter.id}`);
    const key = `${chapter.id}/${section.id}`;
    check(!sectionKeys.has(key), `dublet-sektion ${key}`);
    sectionKeys.add(key);
    sections.push(section);
    check(typeof section.title === 'string' && section.title.trim(), `${key}: mangler titel`);
    check(Array.isArray(section.facts) && section.facts.length >= 3 && section.facts.length <= 5, `${key}: kræver 3-5 fakta`);
    check(section.facts?.every(fact => typeof fact === 'string' && fact.trim().length >= 20), `${key}: tomt eller for kort faktum`);
    check(Array.isArray(section.sourceIds) && section.sourceIds.length > 0, `${key}: mangler kilder`);
    for (const sourceId of section.sourceIds ?? []) check(sourceIds.has(sourceId), `${key}: ukendt kilde ${sourceId}`);
    check(typeof section.curriculumRef === 'string' && section.curriculumRef.trim(), `${key}: mangler curriculumRef`);
    check(section.review === 'source-checked', `${key}: review skal være source-checked`);
  }
}
check(sections.length >= 50, `sektionsbank under baseline: ${sections.length}/50`);
checkUnique(sections.map(section => section.id), 'global sektion');

const questionsPerSection = new Map();
for (const question of QUESTIONS) {
  checkId(question.id, 'spørgsmål');
  const key = `${question.chapterId}/${question.sectionId}`;
  check(sectionKeys.has(key), `${question.id}: ukendt kapitel/sektion ${key}`);
  questionsPerSection.set(key, (questionsPerSection.get(key) ?? 0) + 1);
  check(typeof question.prompt === 'string' && question.prompt.trim().length >= 8, `${question.id}: prompt mangler`);
  check(typeof question.context === 'string' && question.context.trim().length >= 30, `${question.id}: kontekst er for kort`);
  check(Array.isArray(question.statements) && question.statements.length === 4, `${question.id}: skal have præcis 4 udsagn`);
  if (Array.isArray(question.statements)) {
    const trueCount = question.statements.filter(statement => statement?.correct === true).length;
    check(question.statements.every(statement => typeof statement?.text === 'string' && statement.text.trim().length > 0), `${question.id}: et udsagn mangler tekst`);
    check(question.statements.every(statement => typeof statement?.correct === 'boolean'), `${question.id}: correct skal være boolean i alle udsagn`);
    check(trueCount >= 1 && trueCount <= 3, `${question.id}: kræver 1-3 korrekte udsagn, fandt ${trueCount}`);
  }
  check(typeof question.explanation === 'string' && question.explanation.trim().length >= 20, `${question.id}: forklaring er for kort`);
  check(typeof question.gag === 'string' && question.gag.trim().length > 0, `${question.id}: gag mangler`);
  check(Array.isArray(question.sourceIds) && question.sourceIds.length > 0, `${question.id}: mangler kilder`);
  for (const sourceId of question.sourceIds ?? []) check(sourceIds.has(sourceId), `${question.id}: ukendt kilde ${sourceId}`);
  check(allowedScenes.has(question.scene), `${question.id}: ukendt scene ${question.scene}`);
}

for (const key of sectionKeys) check((questionsPerSection.get(key) ?? 0) > 0, `${key}: ingen spørgsmål i banken`);

const svgIds = new Set();
for (const question of QUESTIONS) {
  const svg = questionDiagram(question);
  check(svg.startsWith('<svg ') && svg.endsWith('</svg>') && svg.includes('viewBox="0 0 640 360"'), `${question.id}: ugyldigt diagramformat`);
  check(svg.includes(`data-question="${question.id}"`) && svg.includes(`Støtteillustration til ${question.id}`), `${question.id}: diagram har forkert identitet`);
  check(!svg.includes('data-diagram="neutral-context"'), `${question.id}: mangler spørgsmålsspecifikt diagram`);
  check(!svg.includes('undefined') && !svg.includes('NaN'), `${question.id}: uafsluttet diagramdata`);
  for (const match of svg.matchAll(/\bid="([^"]+)"/g)) {
    check(!svgIds.has(match[1]), `${question.id}: duplikeret SVG-id ${match[1]}`);
    svgIds.add(match[1]);
  }
}

check(Object.keys(LESSONS).length === sections.length, 'Mikrolektionerne skal matche alle regelkort');
for (const chapter of CHAPTERS) for (const section of chapter.sections) {
  const lesson = LESSONS[section.id];
  check(!!lesson, `${section.id}: mangler mikrolektion`);
  if (!lesson) continue;
  check(lesson.sectionId === section.id && lesson.chapterId === chapter.id, `${section.id}: forkert lektionsmapping`);
  check(typeof lesson.lead === 'string' && lesson.lead.trim().length > 15, `${section.id}: mangler indledning`);
  check(Array.isArray(lesson.cards) && lesson.cards.length === 3, `${section.id}: kræver tre forklaringskort`);
  for (const [i, card] of (lesson.cards ?? []).entries()) {
    check(typeof card.title === 'string' && card.title.trim(), `${section.id}/kort ${i + 1}: mangler titel`);
    check(typeof card.body === 'string' && card.body.trim().length > 40, `${section.id}/kort ${i + 1}: mangler forklaring`);
  }
  check(['context', 'action', 'why'].every(key => typeof lesson.case?.[key] === 'string' && lesson.case[key].trim().length > 10), `${section.id}: ufuldstændig transfer-case`);
  check(typeof lesson.recall?.prompt === 'string' && lesson.recall.prompt.trim().length > 10 && typeof lesson.recall?.answer === 'string' && lesson.recall.answer.trim().length > 20, `${section.id}: mangler genkaldelse`);
  for (const card of [...(lesson.cards ?? []), lesson.case].filter(Boolean)) {
    check(Array.isArray(card.sourceIds) && card.sourceIds.length > 0, `${section.id}: forklaring uden kilde`);
    check((card.sourceIds ?? []).every(id => sourceIds.has(id)), `${section.id}: forklaring med ukendt kilde`);
    check(typeof card.sourceLocator === 'string' && card.sourceLocator.trim().length > 5, `${section.id}: mangler kildeplacering`);
  }
  check(lesson.practicalNote === null || typeof lesson.practicalNote === 'string', `${section.id}: ugyldig praktisk afgrænsning`);
}

function localReference(fromFile, reference) {
  const clean = reference.trim().split(/[?#]/, 1)[0];
  if (!clean || reference.startsWith('#') || /^(?:data:|mailto:|tel:)/i.test(reference)) return null;
  if (/^https?:/i.test(reference)) {
    errors.push(`${path.relative(root, fromFile)}: ekstern runtime-afhængighed ${reference}`);
    return null;
  }
  const resolved = path.resolve(path.dirname(fromFile), clean);
  if (resolved !== dist && !resolved.startsWith(`${dist}${path.sep}`)) {
    errors.push(`${path.relative(root, fromFile)}: reference forlader dist: ${reference}`);
    return null;
  }
  return resolved;
}

function inspectAsset(file) {
  const normalized = path.resolve(file);
  if (checkedAssets.has(normalized)) return;
  checkedAssets.add(normalized);
  const relative = path.relative(root, normalized);
  if (!fs.existsSync(normalized)) {
    errors.push(`manglende offline-fil: ${relative}`);
    return;
  }
  const stat = fs.statSync(normalized);
  if (!stat.isFile() || stat.size === 0) {
    errors.push(`tom eller ugyldig offline-fil: ${relative}`);
    return;
  }
  const extension = path.extname(normalized).toLowerCase();
  if (!['.html', '.css', '.js', '.mjs'].includes(extension)) return;
  const text = fs.readFileSync(normalized, 'utf8');
  const references = [];
  if (extension === '.html') {
    for (const match of text.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) references.push(match[1]);
  }
  if (extension === '.css' || extension === '.html') {
    for (const match of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) references.push(match[1]);
  }
  if (extension === '.js' || extension === '.mjs') {
    for (const match of text.matchAll(/\b(?:import|export)\s+(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g)) references.push(match[1]);
    for (const match of text.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)) references.push(match[1]);
  }
  for (const reference of references) {
    const resolved = localReference(normalized, reference);
    if (resolved) inspectAsset(resolved);
  }
}

for (const required of ['index.html', 'styles.css', 'app.js', 'core.js', 'content.js', 'scene.js', 'judge.css', 'driving.html', 'lessons.css', 'garage.css', 'garage.js', 'garage-content.js', 'assets/three.min.js', 'assets/icon.svg']) {
  inspectAsset(path.join(dist, required));
}

const artManifest = JSON.parse(fs.readFileSync(path.join(root, 'authoring/art-manifest.json'), 'utf8'));
check(artManifest.nativePixelsPreserved === true, 'illustrationer: native pixel-proveniens mangler');
check(artManifest.assets.length === Object.keys(ART_ASSETS).length, 'illustrationer: manifestantal matcher ikke');
checkUnique(artManifest.assets.map(asset => asset.id), 'illustration');
for (const [id, asset] of Object.entries(ART_ASSETS)) {
  const record = artManifest.assets.find(item => item.id === id);
  check(!!record && record.src === asset.src, `${id}: billedmanifest mangler eller har forkert sti`);
  const file = path.join(dist, asset.src);
  inspectAsset(file);
  if (!record || !fs.existsSync(file)) continue;
  const buffer = fs.readFileSync(file);
  check(buffer.length >= 33 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), `${id}: filen er ikke PNG`);
  if (buffer.length < 33) continue;
  check(buffer.readUInt32BE(16) === asset.width && buffer.readUInt32BE(20) === asset.height && record.width === asset.width && record.height === asset.height, `${id}: forkert native dimension`);
  check(buffer[25] === 6 && record.mode === 'RGBA' && record.alphaMin === 0 && record.alphaMax === 255, `${id}: mangler ægte RGBA-transparens`);
  check(record.transparentPixels > record.width * record.height / 4 && record.corners?.length === 4 && record.corners.every(alpha => alpha <= 15), `${id}: mangler fri transparent baggrund`);
  check(record.bytes === buffer.length && createHash('sha256').update(buffer).digest('hex') === record.sha256, `${id}: billedfilen er ændret siden alpha/decode-kontrollen`);
}

for (const [id, member] of Object.entries(CAST)) {
  const file = path.join(dist, member.src);
  inspectAsset(file);
  if (!fs.existsSync(file)) continue;
  const head = fs.readFileSync(file).subarray(0, 16);
  check(head.subarray(0, 4).toString('ascii') === 'RIFF' && head.subarray(8, 12).toString('ascii') === 'WEBP', `${id}: castfilen er ikke WebP`);
}

// Min bil: every base, split layer and approved part in the catalog must exist as a WebP.
for (const base of CAR_BASES) {
  const files = ['base', ...(base.split ? ['body', 'wheels'] : []), ...base.parts];
  for (const name of files) inspectAsset(path.join(dist, 'assets', 'mybil', base.id, `${name}.webp`));
}

const pixelProbes=JSON.parse(execFileSync('python',['-X','utf8',path.join(root,'scripts/probe-exam-pixels.py')],{encoding:'utf8',maxBuffer:2e6}));
const examVisuals=validateExamVisuals({questions:QUESTIONS,photos:EXAM_PHOTOS,manifest:JSON.parse(fs.readFileSync(path.join(root,'authoring/exam-visual-manifest.json'),'utf8')),readAsset:src=>fs.readFileSync(path.join(dist,src)),readPixelProbe:src=>pixelProbes[src],files:fs.readdirSync(path.join(dist,'assets/exam'))});
errors.push(...examVisuals.errors);
for(const photo of Object.values(EXAM_PHOTOS))inspectAsset(path.join(dist,photo.src));
if (errors.length) {
  console.error(`NATKØRSEL-validering fejlede med ${errors.length} problem(er):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`NATKØRSEL OK: ${SOURCES.length} kilder, ${CHAPTERS.length} kapitler, ${sections.length} sektioner, ${QUESTIONS.length} spørgsmål, ${Object.keys(LESSONS).length} mikrolektioner, ${GARAGE.topics.length} garageområder, ${voice.clips} verificerede lydfiler (${(voice.bytes / 1e6).toFixed(1)} MB), ${checkedAssets.size} lokale runtime-filer.`);
}
