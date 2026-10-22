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
    const sys = sent[0].system.map(b => b.text).join('\n');
    assert.match(sys, /Svage regler lige nu: Højre vigepligt/);
    assert.match(sys, /Hvornår kan du køre\?/, 'the lesson question is in context');
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

const thinkingToolTurn = (id, name, input) => sse([
  { type: 'message_start' }, { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '', signature: '' } },
  { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'sig-abc' } }, { type: 'content_block_stop', index: 0 },
  { type: 'content_block_start', index: 1, content_block: { type: 'tool_use', id, name, input: {} } },
  { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: JSON.stringify(input) } },
  { type: 'content_block_stop', index: 1 }, { type: 'message_delta', delta: { stop_reason: 'tool_use' } }, { type: 'message_stop' }]);

test('Haiku settings: effort, caching, thinking blocks go back whole, no sampling params', async () => {
  process.env.ANTHROPIC_API_KEY = 'test-key-not-real';
  const sent = [], turns = [thinkingToolTurn('t1', 'search_rules', { query: 'promille' }), textTurn('Grænsen er **0,5**.')];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => { sent.push(JSON.parse(opts.body)); return turns.shift(); };
  try {
    const { events } = await call({ messages: [{ role: 'user', content: 'Hvad er promillegrænsen?' }] });
    assert.equal(sent[0].model, 'claude-haiku-5-5');
    assert.deepEqual(sent[0].output_config, { effort: 'medium' });
    assert.deepEqual(sent[0].cache_control, { type: 'ephemeral' });
    assert.deepEqual(sent[0].system[0].cache_control, { type: 'ephemeral' }, 'tools + fixed prompt are cached');
    assert.ok(!sent[0].system[0].text.includes('ELEVEN'), 'nothing per-learner in the cached part');
    assert.equal(sent[0].temperature, undefined); assert.equal(sent[0].thinking, undefined);
    assert.ok(sent[0].max_tokens >= 2000, 'room for thinking');
    const thought = sent[1].messages.at(-2).content[0];
    assert.equal(thought.type, 'thinking'); assert.equal(thought.signature, 'sig-abc', 'signature is kept for the next round');
    assert.equal(JSON.stringify(sent[0].system), JSON.stringify(sent[1].system), 'same prefix every round');
    assert.ok(events.some(e => e.ev === 'status' && e.data.text === 'Tænker…'));
  } finally { globalThis.fetch = realFetch; delete process.env.ANTHROPIC_API_KEY; }
});

test('a refusal or an empty turn still gives the learner a reply', async () => {
  process.env.ANTHROPIC_API_KEY = 'test-key-not-real';
  const realFetch = globalThis.fetch;
  const refusal = () => sse([{ type: 'message_start' }, { type: 'message_delta', delta: { stop_reason: 'refusal' } }, { type: 'message_stop' }]);
  const empty = () => sse([{ type: 'message_start' }, { type: 'message_delta', delta: { stop_reason: 'max_tokens' } }, { type: 'message_stop' }]);
  try {
    globalThis.fetch = async () => refusal();
    let { events } = await call({ messages: [{ role: 'user', content: 'noget' }] });
    assert.match(events.filter(e => e.ev === 'text').map(e => e.data.t).join(''), /kan jeg ikke hjælpe med/);
    globalThis.fetch = async () => empty();
    ({ events } = await call({ messages: [{ role: 'user', content: 'noget' }] }));
    assert.match(events.filter(e => e.ev === 'text').map(e => e.data.t).join(''), /nåede ikke frem/);
  } finally { globalThis.fetch = realFetch; delete process.env.ANTHROPIC_API_KEY; }
});

test('if this web search version is refused, it answers from the rule cards instead', async () => {
  process.env.ANTHROPIC_API_KEY = 'test-key-not-real';
  const sent = [], realFetch = globalThis.fetch;
  const bad = new Response(JSON.stringify({ type: 'error', error: { type: 'invalid_request_error', message: 'tools.6: web_search_20250305 is not supported on this model' } }), { status: 400 });
  const turns = [bad, textTurn('Svar fra regelkortene.')];
  globalThis.fetch = async (url, opts) => { sent.push(JSON.parse(opts.body)); return turns.shift(); };
  try {
    const { events } = await call({ messages: [{ role: 'user', content: 'Hvad koster en fartbøde?' }] });
    assert.equal(sent.length, 2); assert.ok(!sent[1].tools.some(t => t.name === 'web_search'));
    assert.equal(events.filter(e => e.ev === 'text').map(e => e.data.t).join(''), 'Svar fra regelkortene.');
  } finally { globalThis.fetch = realFetch; delete process.env.ANTHROPIC_API_KEY; }
});
