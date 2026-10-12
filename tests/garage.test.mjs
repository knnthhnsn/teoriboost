import test from 'node:test';
import assert from 'node:assert/strict';
import { GARAGE } from '../dist/garage-content.js';
import { validateGarage, PHYSICAL_REQUIREMENTS } from '../garage-data.mjs';
import { gradeGarageChoice, renderGarage, searchGarage } from '../dist/garage.js';

test('Garage content matches every numbered chapter-1 objective, with valid teaching and physical references', () => {
  assert.deepEqual(validateGarage(GARAGE), []);
  assert.equal(GARAGE.topics.flatMap(topic => topic.objectives).length, 183);
});

test('Missing curriculum targets and missing practical preparation fail validation', () => {
  const content = structuredClone(GARAGE);
  const topic = content.topics.find(topic => topic.objectives.some(item => PHYSICAL_REQUIREMENTS.includes(item.requirement)));
  topic.practical = [];
  assert.ok(validateGarage(content).some(error => error.includes('fysisk krav')));
  content.topics.pop();
  assert.ok(validateGarage(content).some(error => error.includes('underområde mangler')));
});

test('Every original garage decision has one correct option and rejects unknown answers', () => {
  for (const topic of GARAGE.topics) {
    assert.equal(topic.case.options.filter(option => gradeGarageChoice(topic, option.id)?.correct).length, 1);
    assert.equal(gradeGarageChoice(topic, 'not-an-option'), null);
  }
  assert.equal(gradeGarageChoice(null, 'a'), null);
});

test('Garage route errors are explicit, and physical checklist cannot award or certify success', () => {
  assert.match(renderGarage('nonexistent-topic'), /Det system findes ikke/);
  const html = renderGarage('checklist');
  assert.match(html, /registrerer eller godkender ingen praktisk færdighed/);
  assert.doesNotMatch(html, /type="checkbox"|data-action="check"|[0-9]+ XP/);
});

test('Search finds control words buried in objectives, supports plan refs and respects car areas', () => {
  assert.ok(searchGarage('RATSLØR').some(topic => topic.pointRef === '1.2.2'));
  assert.equal(searchGarage('1.1.4').some(topic => topic.id === 'kobling'), true);
  assert.equal(searchGarage('ratslør', 'documents').length, 0);
  assert.equal(searchGarage('a-nonsense-word-that-is-not-in-the-curriculum').length, 0);
});
