import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import handler from '../dist/api/chat.mjs';
import { searchRules, safeRoute } from '../dist/api/_search.mjs';
import { KB } from '../dist/api/_kb.mjs';
import { CHAPTERS, QUESTIONS } from '../dist/content.js';

function call(body) {
  const req = Readable.from([JSON.stringify(body)]); req.method = 'POST';
  const events = []; let status = 0;
  const res = { statusCode: 200, setHeader() {}, write(s) { for (const block of s.split('\n\n').filter(Boolean)) { const ev = block.match(/^event: (.+)$/m)?.[1]; const data = JSON.parse(block.match(/^data: (.+)$/m)?.[1] || '{}'); events.push({ ev, data }); } }, end() { status = this.statusCode; } };
  return handler(req, res).then(() => ({ events, status: res.statusCode }));
}
const sse = events => new Response(new ReadableStream({ start(c) { for (const e of events) c.enqueue(new TextEncoder().encode(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`)); c.close(); } }), { status: 200 });
const toolTurn = (id, name, input) => sse([
  { type: 'message_start' }, { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id, name, input: {} } },
  { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: JSON.stringify(input) } },
  { type: 'content_block_stop', index: 0 }, { type: 'message_delta', delta: { stop_reason: 'tool_use' } }, { type: 'message_stop' }]);
const textTurn = text => sse([
  { type: 'message_start' }, { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
  { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } }, { type: 'content_block_stop', index: 0 },
  { type: 'message_delta', delta: { stop_reason: 'end_turn' } }, { type: 'message_stop' }]);

test('the chat knowledge base matches the app content', () => {
  assert.equal(KB.sections.length, CHAPTERS.flatMap(c => c.sections).length);
  assert.equal(KB.questions.length, QUESTIONS.length);
});

test('search finds the right rule card for everyday wording', () => {
  assert.equal(searchRules('Hvornår har jeg ubetinget vigepligt ved hajtænder?')[0].sectionId, 'ubetinget');
  assert.equal(searchRules('bremselængde på glat føre')[0].title, 'Våd og glat vej');
  assert.ok(searchRules('promillegrænsen').some(r => /Alkohol/.test(r.title)));
  assert.deepEqual(searchRules('og i på'), []);
});

test('only whitelisted app routes can become buttons', () => {
  assert.equal(safeRoute('#journey:ubetinget'), '#journey:ubetinget');
  assert.equal(safeRoute('#exam'), '#exam');
  for (const bad of ['https://evil.example', 'javascript:alert(1)', '#journey:../x', '#settings']) assert.equal(safeRoute(bad), null);
});

test('without a key it answers honestly from the rule cards', async () => {
  delete process.env.ANTHROPIC_API_KEY;
  const { events } = await call({ messages: [{ role: 'user', content: 'Hvad betyder hajtænder?' }] });
  assert.deepEqual(events[0], { ev: 'mode', data: { ai: false } });
  assert.match(events.find(e => e.ev === 'text').data.t, /AI-svar er ikke slået til endnu/);
  assert.ok(events.some(e => e.ev === 'action' && e.data.type === 'rule' && e.data.sectionId === 'ubetinget'));
  assert.equal(events.at(-1).ev, 'done');
});

test('with a key it runs the agent loop: search, show a card, answer, and rejects unsafe routes', async () => {
  process.env.ANTHROPIC_API_KEY = 'test-key-not-real';
  const sent = []; const turns = [
    toolTurn('t1', 'search_rules', { query: 'ubetinget vigepligt' }),
    toolTurn('t2', 'show_rule_card', { sectionId: 'ubetinget' }),
    toolTurn('t3', 'suggest_next_step', { label: 'Hack', route: 'https://evil.example' }),
    textTurn('Ved hajtænder holder du tilbage for **alle** på vejen.'),
  ];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => { sent.push(JSON.parse(opts.body)); return turns.shift(); };
  try {
    const { events } = await call({ messages: [{ role: 'user', content: 'Forklar hajtænder' }], context: { readiness: 40, weak: ['Højre vigepligt'], questionId: 'q-031' } });
    assert.deepEqual(events[0], { ev: 'mode', data: { ai: true } });
    assert.equal(sent.length, 4, 'four model rounds');
    assert.match(sent[0].system, /Svage regler lige nu: Højre vigepligt/);
    assert.match(sent[0].system, /Hvornår kan du køre\?/, 'the lesson question is in context');
    const firstResult = JSON.parse(sent[1].messages.at(-1).content[0].content);
    assert.equal(firstResult[0].sectionId, 'ubetinget', 'search results go back to the model');
    assert.ok(events.some(e => e.ev === 'action' && e.data.type === 'rule' && e.data.sectionId === 'ubetinget'));
    assert.ok(!events.some(e => e.ev === 'action' && e.data.type === 'step'), 'unsafe route never reaches the app');
    assert.match(JSON.parse(sent[3].messages.at(-1).content[0].content).error, /ikke tilladt/);
    assert.equal(events.filter(e => e.ev === 'text').map(e => e.data.t).join(''), 'Ved hajtænder holder du tilbage for **alle** på vejen.');
    assert.equal(sent[0].tools.find(t => t.name === 'web_search').allowed_domains.includes('fstyr.dk'), true);
  } finally { globalThis.fetch = realFetch; delete process.env.ANTHROPIC_API_KEY; }
});

test('bad requests are refused and history is trimmed', async () => {
  assert.equal((await call({ messages: [] })).status, 400);
  assert.equal((await call({ messages: [{ role: 'assistant', content: 'hej' }] })).status, 400);
});
