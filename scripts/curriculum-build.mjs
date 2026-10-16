import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CHAPTERS, QUESTIONS } from '../dist/content.js';
import { LESSONS } from '../dist/lessons.js';
import { GARAGE } from '../dist/garage-content.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..');
const pdfPath = join(root, 'reference', 'plan-b-v11-2026.pdf');
const jsonPath = join(root, 'authoring', 'curriculum-coverage.json');
const turnLessonMapPath = join(root, 'authoring', 'turn-lesson-map.json');
const markdownPath = join(root, 'docs', 'curriculum-coverage.md');
const officialPageUrl = 'https://www.fstyr.dk/publikationer/undervisningsplan-for-kategori-b';
const officialDownloadUrl = 'https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf';
const verifiedSha256 = '8f4160ce8e8f55625af8cbe178ab3d1ba67927809d9662834f150007a501f26c';

function findPdfToText() {
  const candidates = [
    process.env.PDFTOTEXT,
    'C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe',
    'C:\\Program Files\\Calibre2\\app\\bin\\pdftotext.exe',
    'pdftotext'
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (candidate === 'pdftotext' || existsSync(candidate)) return candidate;
  }
  throw new Error('pdftotext was not found. Set PDFTOTEXT to a Poppler-compatible executable.');
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function joinWrapped(previous, next) {
  const left = previous.trimEnd();
  const right = next.trim();
  if (!left) return right;
  if (left.endsWith('-') && /^[a-zæøå]/u.test(right) && !/^(og|eller)\b/u.test(right)) {
    return `${left.slice(0, -1)}${right}`;
  }
  return `${left} ${right}`;
}

function parseOfficialPlan() {
  const tool = findPdfToText();
  const raw = execFileSync(tool, ['-f', '20', '-layout', '-enc', 'UTF-8', pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  });
  const pages = raw.replace(/\r/g, '').split('\f');
  const sections = [];
  const objectives = [];
  let section = null;
  let objective = null;
  let outsideObjective = false;

  const flushObjective = () => {
    if (!objective || !section) return;
    objective.officialText = objective.officialText
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:])/g, '$1')
      .replace(/\s+Eleven skal\b.*?:$/u, '')
      .trim();
    objective.id = `${section.id}.${objective.number}`;
    objective.sectionId = section.id;
    objectives.push(objective);
    section.objectiveIds.push(objective.id);
    objective = null;
  };

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const pdfPage = 20 + pageIndex;
    const lines = pages[pageIndex].split('\n');
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex].trim();
      if (!line || /^Version 1\.1 maj 2026$/u.test(line) || /^\d{1,3}$/u.test(line)) continue;

      const detailedHeading = line.match(/^(\d+\.\d+\.\d+)\s+(.+)$/u);
      if (detailedHeading) {
        flushObjective();
        section = {
          id: detailedHeading[1],
          title: detailedHeading[2].trim(),
          pdfPageStart: pdfPage,
          pdfPageEnd: pdfPage,
          objectiveIds: []
        };
        sections.push(section);
        outsideObjective = false;
        continue;
      }

      if (/^(?:\d+\.\s+|\d+\.\d+\s+)\S/u.test(line)) {
        flushObjective();
        section = null;
        outsideObjective = false;
        continue;
      }
      if (!section) continue;
      section.pdfPageEnd = pdfPage;

      const numbered = line.match(/^(\d+)\)+\s+(.+)$/u);
      if (numbered) {
        flushObjective();
        objective = {
          number: Number(numbered[1]),
          officialText: numbered[2].trim(),
          pdfPage
        };
        outsideObjective = false;
        continue;
      }

      if (!objective) continue;

      if (/^Eleven skal\b/u.test(line)) {
        flushObjective();
        outsideObjective = true;
        continue;
      }
      if (/^[A-ZÆØÅ][^.!?:]{2,90}$/u.test(line)) {
        const next = lines.slice(lineIndex + 1).map(value => value.trim()).find(Boolean) || '';
        if (/^\d+\)+\s+/u.test(next) && /[.!?]$/u.test(objective.officialText.trim())) {
          flushObjective();
          outsideObjective = true;
          continue;
        }
      }
      if (!outsideObjective) objective.officialText = joinWrapped(objective.officialText, line);
    }
  }
  flushObjective();

  const uniqueSections = new Map();
  for (const item of sections) {
    if (!uniqueSections.has(item.id)) uniqueSections.set(item.id, item);
  }
  const uniqueObjectives = new Map();
  for (const item of objectives) {
    if (uniqueObjectives.has(item.id)) throw new Error(`Duplicate objective ${item.id}`);
    uniqueObjectives.set(item.id, item);
  }
  const dedupedSections = [...uniqueSections.values()];
  for (const item of dedupedSections) {
    item.objectiveIds = [...new Set(item.objectiveIds)];
    item.objectiveCount = item.objectiveIds.length;
    if (item.objectiveCount === 0) {
      item.extractionNote = 'The official detailed section has no numbered objective of its own; its text defers treatment to later manoeuvres.';
    }
  }
  return { sections: dedupedSections, objectives: [...uniqueObjectives.values()] };
}

function walk(value, visit, path = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, [...path, index]));
  } else if (value && typeof value === 'object') {
    visit(value, path);
    Object.entries(value).forEach(([key, item]) => walk(item, visit, [...path, key]));
  }
}

function objectText(value) {
  const strings = [];
  walk(value, item => {
    for (const [key, child] of Object.entries(item)) {
      if (typeof child === 'string' && !['sourceLocator', 'sourceIds', 'id', 'sectionId', 'chapterId', 'ref', 'pointRef'].includes(key)) {
        strings.push(child);
      }
    }
  });
  return strings.join(' ');
}

function tuple(text) {
  return text.split('.').map(Number);
}

function compareRefs(left, right) {
  const a = tuple(left);
  const b = tuple(right);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const delta = (a[index] || 0) - (b[index] || 0);
    if (delta) return delta;
  }
  return 0;
}

function scopeTerms(text) {
  const beforeModule = (text || '').split('·')[0].replace(/\bv\d+\.\d+\b/giu, '');
  return [...beforeModule.matchAll(/(\d+(?:\.\d+){1,2})(?:-(\d+(?:\.\d+){1,2}))?/gu)]
    .map(match => ({ start: match[1], end: match[2] || null }));
}

function scopeCoversDetail(term, detailId) {
  const detail = tuple(detailId);
  const start = tuple(term.start);
  if (!term.end) {
    return start.length === 2
      ? detail[0] === start[0] && detail[1] === start[1]
      : detailId === term.start;
  }
  const end = tuple(term.end);
  const depth = start.length;
  const projected = detail.slice(0, depth).join('.');
  return compareRefs(projected, term.start) >= 0 && compareRefs(projected, term.end) <= 0;
}

function parsePointNumbers(fragment) {
  const result = new Set();
  for (const match of fragment.matchAll(/(\d+)(?:\s*-\s*(\d+))?/gu)) {
    const start = Number(match[1]);
    const end = Number(match[2] || start);
    if (start < 1 || end > 100 || end < start) continue;
    for (let value = start; value <= end; value += 1) result.add(value);
  }
  return [...result];
}

function explicitObjectiveRefs(locator) {
  const refs = new Set();
  const text = locator || '';
  const details = [...text.matchAll(/\b(\d+\.\d+\.\d+)\b/gu)];
  for (let index = 0; index < details.length; index += 1) {
    const detail = details[index][1];
    const start = details[index].index + details[index][0].length;
    const end = details[index + 1]?.index ?? text.length;
    const tail = text.slice(start, end).split(';')[0];
    const pointMatch = tail.match(/(?:pkt\.?|punkt(?:er)?)\s*([^;]+)/iu);
    if (!pointMatch) continue;
    for (const point of parsePointNumbers(pointMatch[1])) refs.add(`${detail}.${point}`);
  }
  return refs;
}

const stopWords = new Set('af alle alene andre at blive bliver blev bør da de den der det dette dig din disse dog du eller en end er et efter for fordi fra før gennem have hele her hos hun hvad hvor hvordan hvis i ikke ind ingen jeg kan kunne man med mellem men mod når og om op over på skal som til under ud uden ved være været vi vil'.split(' '));

function tokens(text) {
  return new Set((text || '')
    .toLocaleLowerCase('da-DK')
    .normalize('NFKD')
    .replace(/[^a-zæøå0-9 ]/gu, ' ')
    .split(/\s+/u)
    .filter(token => token.length >= 4 && !stopWords.has(token) && !/^\d+$/u.test(token)));
}

function lexicalMatch(left, right) {
  const a = tokens(left);
  const b = tokens(right);
  const shared = [...a].filter(token => b.has(token));
  return { shared, ratio: a.size ? shared.length / a.size : 0 };
}

function collectAppEvidence(officialSections) {
  const sectionRecords = CHAPTERS.flatMap(chapter => chapter.sections.map(section => ({
    ...section,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    scope: scopeTerms(section.curriculumRef),
    questions: QUESTIONS.filter(question => question.sectionId === section.id),
    lesson: LESSONS[section.id] || null
  })));
  const garageTopics = GARAGE.topics.map(topic => ({ ...topic, text: objectText(topic) }));
  const direct = new Map();
  const lessonLocators = [];

  const addDirect = (ref, kind, label) => {
    if (!direct.has(ref)) direct.set(ref, { lessons: new Set(), garage: new Set() });
    direct.get(ref)[kind].add(label);
  };

  for (const [sectionId, lesson] of Object.entries(LESSONS)) {
    walk(lesson, item => {
      if (!item.sourceLocator) return;
      const label = `${sectionId}: ${item.title || item.context || item.prompt || 'lesson item'}`;
      lessonLocators.push({ sectionId, locator: item.sourceLocator, label });
      for (const ref of explicitObjectiveRefs(item.sourceLocator)) addDirect(ref, 'lessons', label);
    });
  }

  for (const topic of garageTopics) {
    walk(topic, item => {
      const refs = [...(item.refs || []), ...(item.ref ? [item.ref] : [])];
      for (const ref of refs.filter(value => /^\d+\.\d+\.\d+\.\d+$/u.test(value))) {
        addDirect(ref, 'garage', `${topic.id}: ${item.title || item.summary || item.prompt || 'garage item'}`);
      }
    });
  }

  const byDetail = new Map();
  for (const detail of officialSections) {
    const sections = sectionRecords.filter(item => item.scope.some(term => scopeCoversDetail(term, detail.id)));
    const locatorLessons = lessonLocators.filter(item => scopeTerms(item.locator).some(term => scopeCoversDetail(term, detail.id)));
    const garage = garageTopics.filter(topic => topic.pointRef === detail.id);
    const questions = sections.flatMap(item => item.questions);
    const evidenceText = [
      ...sections.map(item => objectText(item)),
      ...locatorLessons.map(item => item.label),
      ...questions.map(item => objectText(item)),
      ...garage.map(item => item.text)
    ].join(' ');
    byDetail.set(detail.id, { sections, locatorLessons, garage, questions, evidenceText });
  }
  return { direct, byDetail };
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'da'));
}

function loadTurnLessonMap() {
  const map = JSON.parse(readFileSync(turnLessonMapPath, 'utf8'));
  const expected = ['7.13.3.5', '7.13.3.11', '7.13.3.12', '7.13.3.19', '7.13.3.21', '7.13.4.10', '7.13.4.11'];
  const actual = map.objectives?.map(item => item.objectiveId) || [];
  if (map.status !== 'runtime-implemented-pending-qualified-review') throw new Error('Turn lesson map must remain pending qualified review.');
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Turn lesson map objectives must be exactly ${expected.join(', ')}.`);
  const stages = ['risk', 'decision', 'consequence', 'transfer', 'contrast', 'recall', 'completion'];
  for (const stage of stages) if (!map.runtime.stageContract?.[stage]) throw new Error(`Turn lesson map is missing the ${stage} stage contract.`);
  if (!map.runtime.browserEvidence?.some(item => item.startsWith('verified-bounded: evidence/turn-phone-risk.jpg'))) throw new Error('Turn lesson map must record bounded risk browser evidence.');
  if (!map.runtime.browserEvidence?.some(item => item.startsWith('pending: qualified review'))) throw new Error('Turn lesson map must retain pending review boundaries.');
  for (const item of map.objectives) {
    for (const field of ['ruleAction', 'explanationRefs', 'scenarioRefs', 'facitRefs', 'validationRefs', 'qualifiedReview', 'humanEvidence']) {
      if (!(field in item)) throw new Error(`Turn lesson map ${item.objectiveId} is missing ${field}.`);
    }
    if (item.qualifiedReview !== 'pending' || item.humanEvidence !== 'none') throw new Error(`Turn lesson map ${item.objectiveId} makes an unsupported review or human-evidence claim.`);
  }
  return map;
}

function mapCoverage(parsed, turnLessonMap) {
  const app = collectAppEvidence(parsed.sections);
  for (const objective of parsed.objectives) {
    const direct = app.direct.get(objective.id);
    const candidates = app.byDetail.get(objective.sectionId);
    const lessonDirect = direct ? [...direct.lessons] : [];
    const garageDirect = direct ? [...direct.garage] : [];
    const sectionIds = candidates.sections.map(item => item.id);
    const questionIds = candidates.questions.map(item => item.id);
    const lessonItems = candidates.locatorLessons.map(item => item.label);
    const garageItems = candidates.garage.map(item => item.id);
    const hasCandidates = sectionIds.length || questionIds.length || lessonItems.length || garageItems.length;
    const match = lexicalMatch(objective.officialText, candidates.evidenceText);

    if (lessonDirect.length || garageDirect.length) {
      objective.status = 'direct';
      objective.statusBasis = 'metadata-exact-reference-candidate';
      objective.reason = 'An app lesson or Garage item carries an explicit metadata reference to this exact numbered objective. This is a candidate touchpoint for manual review, not verification that the objective is taught completely or correctly.';
    } else if (hasCandidates && (match.shared.length >= 3 || (match.shared.length >= 2 && match.ratio >= 0.2))) {
      objective.status = 'partial';
      objective.statusBasis = 'automated-lexical-candidate';
      objective.reason = `Automated matching found content in the same detailed section and shared terms (${match.shared.slice(0, 6).join(', ')}), but no app item cites this exact point. Manual subject-matter review is required.`;
    } else if (hasCandidates) {
      objective.status = 'needs-review';
      objective.statusBasis = 'broad-section-candidate';
      objective.reason = 'The app points broadly to the same detailed section, but the current metadata does not establish that this numbered objective is taught or assessed.';
    } else {
      objective.status = 'missing';
      objective.statusBasis = 'no-mapped-candidate';
      objective.reason = 'No app section, question, lesson locator, or Garage topic maps to this detailed official section. This records a metadata gap, not proof that no related wording exists anywhere in the app.';
    }

    objective.evidence = {
      exactReferences: {
        lessons: uniqueSorted(lessonDirect),
        garage: uniqueSorted(garageDirect)
      },
      candidates: {
        sections: uniqueSorted(sectionIds),
        questions: uniqueSorted(questionIds),
        lessons: uniqueSorted(lessonItems),
        garage: uniqueSorted(garageItems)
      }
    };
    objective.match = {
      sharedTerms: match.shared.slice(0, 12),
      exactReference: lessonDirect.length > 0 || garageDirect.length > 0
    };
    const candidateExplanationRefs = uniqueSorted([...lessonDirect, ...garageDirect]);
    const candidateScenarioRefs = uniqueSorted([...questionIds, ...lessonItems]);
    const candidateFacitRefs = uniqueSorted(questionIds);
    objective.traceability = {
      source: {
        officialPlan: 'Undervisningsplan for kategori B, version 1.1 (maj 2026)',
        objectiveId: objective.id,
        sectionId: objective.sectionId,
        pdfPage: objective.pdfPage,
        officialText: objective.officialText
      },
      explanation: {
        refs: candidateExplanationRefs.length ? candidateExplanationRefs : null,
        status: candidateExplanationRefs.length ? 'candidate' : 'missing'
      },
      scenario: {
        refs: candidateScenarioRefs.length ? candidateScenarioRefs : null,
        status: candidateScenarioRefs.length ? 'candidate' : 'missing'
      },
      facit: {
        refs: candidateFacitRefs.length ? candidateFacitRefs : null,
        status: candidateFacitRefs.length ? 'candidate' : 'missing'
      },
      validation: {
        refs: null,
        status: 'missing'
      },
      qualifiedReview: 'pending',
      humanEvidence: null,
      adequacyClaim: 'none'
    };
  }
  return parsed;
}

function appHashes() {
  return ['dist/content.js', 'dist/lessons.js', 'dist/garage-content.js'].map(relativePath => ({
    path: relativePath,
    sha256: sha256(join(root, ...relativePath.split('/')))
  }));
}

function statusCounts(objectives) {
  const counts = { direct: 0, partial: 0, missing: 0, 'needs-review': 0 };
  for (const objective of objectives) counts[objective.status] += 1;
  return counts;
}

function chapterCounts(objectives) {
  const counts = {};
  for (const objective of objectives) {
    const chapter = objective.id.split('.')[0];
    if (!counts[chapter]) counts[chapter] = { total: 0, direct: 0, partial: 0, missing: 0, 'needs-review': 0 };
    counts[chapter].total += 1;
    counts[chapter][objective.status] += 1;
  }
  return counts;
}

function compactEvidence(evidence) {
  const parts = [];
  if (evidence.exactReferences.lessons.length) parts.push(`exact lesson refs ${evidence.exactReferences.lessons.join('; ')}`);
  if (evidence.exactReferences.garage.length) parts.push(`exact Garage refs ${evidence.exactReferences.garage.join('; ')}`);
  if (evidence.candidates.sections.length) parts.push(`candidate sections ${evidence.candidates.sections.join(', ')}`);
  if (evidence.candidates.questions.length) parts.push(`candidate questions ${evidence.candidates.questions.join(', ')}`);
  if (evidence.candidates.lessons.length) parts.push(`candidate lessons ${evidence.candidates.lessons.join('; ')}`);
  if (evidence.candidates.garage.length) parts.push(`candidate Garage ${evidence.candidates.garage.join('; ')}`);
  return parts.join(' | ') || 'None';
}

function compactTraceability(traceability) {
  const format = entry => entry.status === 'missing' ? 'missing (null)' : `${entry.status}: ${(entry.refs || []).join(', ')}`;
  return `explanation=${format(traceability.explanation)}; scenario=${format(traceability.scenario)}; facit=${format(traceability.facit)}; validation=${format(traceability.validation)}`;
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function buildMarkdown(inventory) {
  const lines = [
    '# Curriculum coverage inventory - Danish category B',
    '',
    '> Audit boundary: this is a machine-assisted objective-level candidate inventory for the current app snapshot. Statuses describe metadata and lexical signals for manual review. None has been verified by a qualified driving instructor, and no status shows full teaching, practical competence, legal approval, or complete curriculum coverage.',
    '',
    '## Source verification',
    '',
    `- Authority page: ${inventory.officialPlan.landingPage}`,
    `- Official PDF: ${inventory.officialPlan.downloadUrl}`,
    `- Authority page states effective from **${inventory.officialPlan.effectiveFrom}**.`,
    `- Local and live official PDF were byte-identical on ${inventory.officialPlan.liveComparison.checked}: ${inventory.officialPlan.localFile.bytes} bytes; SHA-256 \`${inventory.officialPlan.localFile.sha256}\`.`,
    `- Extraction covers ${inventory.summary.detailedSections} detailed sections and ${inventory.summary.numberedObjectives} numbered objectives from 1.1.1 through 10.3.2.`,
    '',
    '## Status model',
    '',
    '| Status | Meaning |',
    '|---|---|',
    '| `direct` | **Exact-reference candidate:** a lesson or Garage item explicitly cites the exact numbered objective. The content itself has not been instructor-verified against the objective. |',
    '| `partial` | **Automated lexical candidate:** content in the same detailed section shares terms with the objective but lacks an exact objective reference. |',
    '| `needs-review` | **Broad-section candidate:** only section-level metadata exists; objective-level equivalence requires manual subject-matter review. |',
    '| `missing` | **No mapped candidate:** current metadata has no item mapped to the detailed official section; this does not prove that no related prose exists elsewhere. |',
    '',
    '## Candidate mapping counts',
    '',
    '| Chapter | Objectives | Exact-reference candidates | Lexical candidates | Broad-section candidates | No mapped candidate |',
    '|---:|---:|---:|---:|---:|---:|'
  ];
  for (const [chapter, counts] of Object.entries(inventory.summary.byChapter)) {
    lines.push(`| ${chapter} | ${counts.total} | ${counts.direct} | ${counts.partial} | ${counts['needs-review']} | ${counts.missing} |`);
  }
  const totals = inventory.summary.statusCounts;
  lines.push(`| **All** | **${inventory.summary.numberedObjectives}** | **${totals.direct}** | **${totals.partial}** | **${totals['needs-review']}** | **${totals.missing}** |`);
  lines.push(
    '',
    '## New authoring exemplar: hidden cyclist at a right turn',
    '',
    `Status: **${inventory.exemplar.status}**. The runtime lesson exists in ${inventory.exemplar.runtime.files.map(file => `\`${file}\``).join(' and ')}, but its curriculum/legal interpretation still awaits qualified review.`,
    '',
    `Official anchors: ${inventory.exemplar.objectiveRefs.map(ref => `\`${ref}\``).join(', ')}.`,
    '',
    `Anchor roles: ${Object.entries(inventory.exemplar.anchorRoles).map(([role, refs]) => `${role}: ${refs.map(ref => `\`${ref}\``).join(', ')}`).join('; ')}.`,
    '',
    `Current runtime label: \`${inventory.exemplar.sourceLabelAudit.current}\`.`,
    '',
    `Previous label (retired): \`${inventory.exemplar.sourceLabelAudit.previous}\``,
    '',
    `Source-label finding: ${inventory.exemplar.sourceLabelAudit.finding}`,
    '',
    `Transfer-case boundary: ${inventory.exemplar.sourceLabelAudit.transferScenario}`,
    '',
    '### Primary legal source for the driveway transfer',
    '',
    `- Current act: [${inventory.currentTrafficAct.title}](${inventory.currentTrafficAct.url}) (${inventory.currentTrafficAct.status}; checked ${inventory.currentTrafficAct.checked}).`,
    `- Exact anchor: \`${inventory.exemplar.sourceLabelAudit.transferLegalAnchor}\``,
    `- Section 26(6), relevant text: “${inventory.currentTrafficAct.sections['26.6'].relevantText}”`,
    `- Companion general rule: Section 17(1) extends section 16(1)-(3) outside junctions; section 16(2) requires the manoeuvre to be possible without danger or unnecessary inconvenience to others travelling in the same direction.`,
    `- Application: ${inventory.currentTrafficAct.application}`,
    `- Boundary: ${inventory.currentTrafficAct.boundary}`,
    '',
    'The runtime-file mapping above was reviewed manually and is not included in the automated status counts.',
    '',
    `**Lead:** ${inventory.exemplar.lesson.lead}`,
    '',
    ...inventory.exemplar.lesson.cards.map(card => `- **${card.title}:** ${card.body}`),
    '',
    `**Case:** ${inventory.exemplar.lesson.case.context} **Action:** ${inventory.exemplar.lesson.case.action} **Why:** ${inventory.exemplar.lesson.case.why}`,
    '',
    `**Recall:** ${inventory.exemplar.lesson.recall.prompt} ${inventory.exemplar.lesson.recall.answer}`,
    '',
    `Existing related app evidence: ${inventory.exemplar.existingEvidence.join('; ')}.`,
    '',
    '## Traceability boundary',
    '',
    'Every official objective row includes explicit source, explanation, scenario, facit, and validation fields. `candidate` means a linked app artifact exists; it does not claim that the artifact teaches or assesses the objective adequately. `missing` and `null` identify an absent artifact. Qualified review and human evidence remain pending.',
    '',
    `Flagship lesson map: \`authoring/turn-lesson-map.json\` with ${inventory.exemplar.traceability.objectives.length} explicitly linked objectives and bounded browser evidence for risk, repair, transfer, contrast, recall, reload, and final evidence; all seven remain pending qualified review and human efficacy.`,
    '',
    '## Extraction and interpretation limits',
    '',
    '- The inventory treats each numbered bullet inside detailed sections 1.1.1-10.3.2 as an objective. It does not split unnumbered main goals, explanatory prose, or cross-references into extra rows.',
    '- Five detailed sections have no numbered objective in the PDF because the plan defers those subjects to later manoeuvres: 7.2.1, 7.2.2, 7.4.1, 7.10.1, and 7.11.1.',
    '- Official text is extracted from the PDF with line-wrap dehyphenation. The JSON retains page and section locators so any questionable wording can be checked against the source.',
    '- Every status is a candidate classification. `direct` is based only on an exact metadata reference; `partial` is automated lexical matching; `needs-review` is broad section metadata; `missing` is absence from the mapped metadata set.',
    '- No objective row has received qualified driving-instructor verification. Statuses are review queues, not claims of factual correctness, teaching completeness, or curriculum approval.',
    '- Practical objectives cannot be completed or certified by this app. The inventory records only digital content touchpoints.',
    '',
    '## Full objective inventory',
    ''
  );

  const sectionsByChapter = new Map();
  for (const section of inventory.sections) {
    const chapter = section.id.split('.')[0];
    if (!sectionsByChapter.has(chapter)) sectionsByChapter.set(chapter, []);
    sectionsByChapter.get(chapter).push(section);
  }
  const objectiveMap = new Map(inventory.objectives.map(item => [item.id, item]));
  for (const [chapter, sections] of sectionsByChapter) {
    lines.push(`## Chapter ${chapter}`, '');
    for (const section of sections) {
      lines.push(`### ${section.id} ${section.title}`, '');
      if (!section.objectiveCount) {
        lines.push(`_${section.extractionNote}_`, '');
        continue;
      }
       lines.push('| Objective | Official objective text | Status | App evidence | Traceability | Reason |', '|---|---|---|---|---|---|');
      for (const objectiveId of section.objectiveIds) {
        const objective = objectiveMap.get(objectiveId);
         lines.push(`| ${objective.id} | ${escapeCell(objective.officialText)} | \`${objective.status}\` | ${escapeCell(compactEvidence(objective.evidence))} | ${escapeCell(compactTraceability(objective.traceability))} | ${escapeCell(objective.reason)} |`);
      }
      lines.push('');
    }
  }
  return `${lines.join('\n')}\n`;
}

const turnLessonMap = loadTurnLessonMap();
const parsed = mapCoverage(parseOfficialPlan(), turnLessonMap);
const localHash = sha256(pdfPath);
if (localHash !== verifiedSha256) {
  throw new Error(`Local PDF hash ${localHash} does not match the live official PDF hash verified on 2026-10-16.`);
}

const counts = statusCounts(parsed.objectives);
const inventory = {
  schemaVersion: 2,
  auditDate: '2026-10-16',
  auditKind: 'Machine-assisted objective-level curriculum candidate inventory',
  claimBoundary: 'This machine-assisted file records candidate content touchpoints. No objective mapping has been verified by a qualified driving instructor. It does not certify complete curriculum coverage, practical competence, teaching quality, instructor approval, legal approval, or exam readiness.',
  reviewState: {
    mappingNature: 'machine-assisted authoring inventory',
    qualifiedDrivingInstructorReview: 'not-performed',
    legalReview: 'not-performed',
    primaryLegalSourceCheck: 'current statutory text verified; no legal-professional review',
    statusInterpretation: 'candidate classifications for manual review'
  },
  officialPlan: {
    title: 'Undervisningsplan for kategori B (almindelig bil), version 1.1, maj 2026',
    landingPage: officialPageUrl,
    downloadUrl: officialDownloadUrl,
    effectiveFrom: '2026-07-01',
    localFile: {
      path: 'reference/plan-b-v11-2026.pdf',
      pages: 151,
      bytes: readFileSync(pdfPath).length,
      sha256: localHash
    },
    liveComparison: {
      checked: '2026-10-16',
      method: 'Downloaded the authority page PDF target and compared byte length and SHA-256 with the local file.',
      liveBytes: 7131928,
      liveSha256: verifiedSha256,
      byteIdentical: true
    },
    extraction: {
      tool: 'pdftotext -layout -enc UTF-8',
      pages: 'PDF pages 20-151',
      included: 'Every numbered bullet under detailed sections 1.1.1-10.3.2.',
      excluded: 'Unnumbered main goals, explanatory prose, chapter introductions, and section 0 methodology are not represented as separate objectives.'
    }
  },
  currentTrafficAct: {
    title: 'Bekendtgørelse af færdselsloven, LBK nr. 118 af 12. januar 2026',
    status: 'Gældende',
    checked: '2026-10-16',
    url: 'https://www.retsinformation.dk/eli/lta/2026/118',
    pdfUrl: 'https://www.retsinformation.dk/eli/lta/2026/118/pdf',
    sections: {
      '26.6': {
        anchor: '§ 26, stk. 6, 2. og 5. pkt.',
        relevantText: 'Ved svingning til højre må den kørende ikke være til ulempe for cyklister og knallertkørere, der kører lige ud. Tilsvarende regler gælder ved kørsel over eller bort fra kørebanen uden for vejkryds.'
      },
      '17.1': {
        anchor: '§ 17, stk. 1',
        text: '§ 16, stk. 1-3, gælder også ved kørsel over eller bort fra kørebanen uden for vejkryds.'
      },
      '16.2': {
        anchor: '§ 16, stk. 2',
        text: 'Kørende, som i vejkryds ønsker at ændre færdselsretning, skal før forberedelsen og udførelsen af manøvren sikre sig, at denne kan foretages uden fare eller unødig ulempe for andre, som færdes i samme retning.'
      }
    },
    application: 'For a right turn from the roadway into a property driveway outside a junction, across a parallel continuous cycle track, section 26(6) applies expressly through its final sentence. The driver must not inconvenience a same-direction cyclist continuing straight.',
    boundary: 'This conclusion assumes “indkørsel” means a property driveway reached by leaving the roadway. If it is actually a side road forming a junction, the ordinary right-turn sentence in section 26(6) still applies. Section 26(3) concerns traffic coming out from property or similar areas and is not the anchor for entering the property.'
  },
  appSnapshot: {
    chapters: CHAPTERS.length,
    sections: CHAPTERS.flatMap(chapter => chapter.sections).length,
    questions: QUESTIONS.length,
    lessons: Object.keys(LESSONS).length,
    garageTopics: GARAGE.topics.length,
    sourceFiles: appHashes()
  },
  statusDefinitions: {
    direct: 'Exact-reference candidate: an app lesson or Garage item explicitly cites the exact numbered objective. The content itself has not been instructor-verified.',
    partial: 'Automated lexical candidate: content in the same detailed section shares terms with the objective, but no app item cites the exact objective.',
    'needs-review': 'Broad-section candidate: only section-level metadata exists; objective-level equivalence requires manual review.',
    missing: 'No mapped candidate: current metadata contains no item mapped to the detailed section; related prose may still exist elsewhere.'
  },
  summary: {
    interpretation: 'Counts are candidate mappings for manual review; none is qualified-instructor verification.',
    detailedSections: parsed.sections.length,
    detailedSectionsWithoutNumberedObjectives: parsed.sections.filter(section => section.objectiveCount === 0).map(section => section.id),
    numberedObjectives: parsed.objectives.length,
    statusCounts: counts,
    byChapter: chapterCounts(parsed.objectives)
  },
  exemplar: {
    id: 'right-turn-hidden-cyclist',
    status: 'runtime-implemented-pending-qualified-review',
    objectiveRefs: ['7.13.3.5', '7.13.3.11', '7.13.3.12', '7.13.3.19', '7.13.3.21', '7.13.4.10', '7.13.4.11'],
    anchorRoles: {
      'hidden rear-right cyclist hazard': ['7.13.3.5'],
      'right-turn conditions and cyclist placement': ['7.13.3.11'],
      'mirror and blind-angle checks before positioning': ['7.13.3.12'],
      'repeat rearward and blind-angle checks before turning': ['7.13.3.19', '7.13.3.21'],
      'yield to straight-ahead cyclists': ['7.13.4.10', '7.13.4.11']
    },
    rationale: 'The official plan explicitly requires repeated mirror and blind-angle checks for cyclists and holding back so a straight-ahead cyclist is not forced to slow or stop.',
    existingEvidence: ['section sving-cykel', 'question q-014', 'lesson case in sving-cykel', 'runtime lesson “Et blink. To baner.”'],
    runtime: {
      files: ['dist/turn-learning.js', 'dist/turn-lesson.js'],
      ids: ['TURN_ANCHOR', 'TURN_LESSON', 'createTurnLesson', '#trafiklab']
    },
    sourceLabelAudit: {
      current: 'Undervisningsplan for kategori B, version 1.1 (maj 2026), afsnit 7.13.3, pkt. 5, 11-12, 19 og 21, samt 7.13.4, pkt. 10-11.',
      previous: 'Plan B 7.13.3, pkt. 11–14 og 19–21',
      recommended: 'Undervisningsplan for kategori B, version 1.1 (maj 2026), afsnit 7.13.3, pkt. 5, 11-12, 19 og 21, samt 7.13.4, pkt. 10-11.',
      verifiedAgainstLocalPdfPages: [104, 106],
      finding: 'The retired label omitted 7.13.4 points 10-11, which support yielding to straight-ahead cyclists, and included 7.13.3 points 13-14 and 20, which are not directly demonstrated by the main hidden-cyclist decision. The current label is corrected; runtime/browser synchronization remains an evidence item.',
      transferScenario: 'The right-of-way instruction is directly supported by current Færdselsloven § 26, stk. 6, 2. og 5. pkt.: the same-direction cyclist rule expressly also applies when driving across or leaving the roadway outside a junction. As curriculum taxonomy, the driveway remains a transfer case beyond the intersection wording of Plan B 7.13.',
      transferLegalAnchor: 'Færdselsloven, LBK nr. 118 af 12. januar 2026, § 26, stk. 6, 2. og 5. pkt. (jf. § 17, stk. 1, og § 16, stk. 2)'
    },
    traceability: turnLessonMap,
    lesson: {
      lead: 'A cyclist who disappears behind a van or into the car’s blind angle has not disappeared from the conflict path.',
      cards: [
        { title: 'Find the cyclist again', body: 'Check mirrors early, then repeat the direct blind-angle check immediately before crossing the cycle path. Do not infer a free path from a missing reflection.' },
        { title: 'The obstacle changes sight, not priority', body: 'A parked van can hide movement toward the junction. Wait until the cyclist is seen again or the entire expected path can be established as clear.' },
        { title: 'Hold back before the turn', body: 'If the cyclist is beside the car or can reach the conflict point, remain behind and turn only when the cyclist has continued straight and the path is free.' }
      ],
      case: {
        context: 'You are waiting to turn right. A cyclist you saw behind the car becomes hidden first by a parked van and then at the car’s right rear corner.',
        action: 'Stay stopped, repeat mirror and direct blind-angle checks, and turn only after locating the cyclist and confirming the cycle path is free.',
        why: 'The cyclist may continue toward the same conflict point and must not be forced to slow or stop because of the turn.'
      },
      recall: {
        prompt: 'What does it mean when a cyclist disappears from the mirror before a right turn?',
        answer: 'It is a reason to search again, not evidence that the cyclist is gone.'
      },
      practicalNote: 'Mirror use, head movement, positioning, and turning speed must be practised in real traffic with a driving instructor.'
    }
  },
  extractionLimits: [
    'Numbered bullets are the unit of inventory; unnumbered goals and prose are not split into additional objectives.',
    'Five detailed sections contain no numbered bullet and explicitly defer treatment to later manoeuvres.',
    'Line-wrap dehyphenation is mechanical; page and section locators are retained for source checking.',
    'All status results are candidate classifications: direct uses exact metadata references, partial uses automated lexical triage, needs-review uses broad section metadata, and missing means no candidate in the mapped metadata.',
    'No objective mapping has been verified by a qualified driving instructor or legal reviewer.',
    'Digital content cannot fulfil or certify practical performance objectives.'
  ],
  sections: parsed.sections,
  objectives: parsed.objectives
};

writeFileSync(jsonPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');
writeFileSync(markdownPath, buildMarkdown(inventory), 'utf8');
console.log(JSON.stringify({ jsonPath, markdownPath, summary: inventory.summary }, null, 2));
