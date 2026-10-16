import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const coverage = JSON.parse(readFileSync(new URL('../authoring/curriculum-coverage.json', import.meta.url)));
const turnMap = JSON.parse(readFileSync(new URL('../authoring/turn-lesson-map.json', import.meta.url)));

const requiredTraceFields = ['source', 'explanation', 'scenario', 'facit', 'validation', 'qualifiedReview', 'humanEvidence', 'adequacyClaim'];
const expectedTurnObjectives = ['7.13.3.5', '7.13.3.11', '7.13.3.12', '7.13.3.19', '7.13.3.21', '7.13.4.10', '7.13.4.11'];

test('every official objective has explicit traceability fields', () => {
  assert.equal(coverage.objectives.length, coverage.summary.numberedObjectives);
  for (const objective of coverage.objectives) {
    for (const field of requiredTraceFields) assert.ok(field in objective.traceability, `${objective.id} missing ${field}`);
    assert.equal(objective.traceability.source.objectiveId, objective.id);
    assert.equal(objective.traceability.source.officialText, objective.officialText);
    for (const kind of ['explanation', 'scenario', 'facit', 'validation']) {
      const entry = objective.traceability[kind];
      assert.ok(['candidate', 'missing'].includes(entry.status), `${objective.id} invalid ${kind} status`);
      assert.ok(entry.refs === null || Array.isArray(entry.refs), `${objective.id} invalid ${kind} refs`);
      if (entry.status === 'missing') assert.equal(entry.refs, null, `${objective.id} missing ${kind} must be null`);
      if (entry.status === 'candidate') assert.ok(entry.refs?.length, `${objective.id} candidate ${kind} needs refs`);
    }
    assert.equal(objective.traceability.qualifiedReview, 'pending');
    assert.equal(objective.traceability.humanEvidence, null);
    assert.equal(objective.traceability.adequacyClaim, 'none');
  }
});

test('flagship map links exactly seven objectives without claiming review or human evidence', () => {
  assert.equal(turnMap.status, 'runtime-implemented-pending-qualified-review');
  assert.deepEqual(turnMap.objectives.map(item => item.objectiveId), expectedTurnObjectives);
  assert.equal(turnMap.source.trafficAct, 'Færdselsloven, LBK nr. 118 af 12. januar 2026, § 26, stk. 6, 2. og 5. pkt.; jf. § 17, stk. 1, og § 16, stk. 2');
  for (const stage of ['risk', 'decision', 'consequence', 'transfer', 'contrast', 'recall', 'completion']) assert.ok(turnMap.runtime.stageContract[stage]);
  assert.ok(turnMap.runtime.browserEvidence.some(item => item.includes('evidence/turn-phone-risk.jpg')));
  assert.ok(turnMap.runtime.browserEvidence.some(item => item.includes('evidence/turn-phone-transfer.jpg')));
  assert.ok(turnMap.runtime.browserEvidence.some(item => item.includes('evidence/turn-phone-contrast.jpg')));
  assert.ok(turnMap.runtime.browserEvidence.some(item => item.includes('evidence/turn-phone-done.jpg')));
  assert.ok(turnMap.runtime.browserEvidence.some(item => item.includes('typed recall survives reload')));
  assert.ok(turnMap.runtime.browserEvidence.some(item => item.includes('pending: qualified review')));
  for (const item of turnMap.objectives) {
    for (const field of ['ruleAction', 'explanationRefs', 'scenarioRefs', 'facitRefs', 'validationRefs']) {
      assert.ok(Array.isArray(item[field]) ? item[field].length : item[field], `${item.objectiveId} missing ${field}`);
    }
    assert.equal(item.qualifiedReview, 'pending');
    assert.equal(item.humanEvidence, 'none');
  }
});

test('candidate traceability remains separate from qualified curriculum claims', () => {
  assert.equal(coverage.claimBoundary.includes('No objective mapping has been verified'), true);
  assert.equal(coverage.reviewState.qualifiedDrivingInstructorReview, 'not-performed');
  assert.equal(coverage.reviewState.legalReview, 'not-performed');
  assert.equal(coverage.exemplar.sourceLabelAudit.current.includes('7.13.4, pkt. 10-11'), true);
  assert.equal(coverage.exemplar.sourceLabelAudit.current.includes('pkt. 11–14'), false);
});
