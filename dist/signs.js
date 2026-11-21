// Skilte: explains the Danish road signs per group and drills them. Data lives in signs-data.js.
// Routes: #skilte (groups), #skilte:<group> (explanation), #skilte:<group>:ovelse (exercise), #skilte:bland:ovelse (all groups mixed).
// Results stay on this device. Loaded lazily by app.js (see the SIGNS part there).
import { GROUPS, GROUP_BY_ID, MAIN_GROUPS, SIGN_BY_CODE, SIGN_SOURCE, signFile } from './signs-data.js';
import { ico } from './ui-icons.js';

const KEY = 'teoriboost.signs.v1';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const THUMB = { forbud: 'C 51', advarsel: 'A 22', vigepligt: 'B 13', paabud: 'D 12', oplysning: 'E 42', undertavler: 'U 3', lyssignaler: 'X 11', afmaerkning: 'S 11' };
const SESSION_SIZE = 8, MIX_SIZE = 12;

/** The stylesheet is injected here so index.html stays untouched. `ready` resolves when it has loaded. */
export const ready = new Promise(resolve => {
  const have = document.querySelector('link[data-signs-css]');
  if (have) return resolve();
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: 'signs.css' });
  link.dataset.signsCss = '';
  link.onload = link.onerror = () => resolve();
  document.head.append(link);
});

export function loadSigns(store = globalThis.localStorage) { try { return JSON.parse(store.getItem(KEY)) || {}; } catch { return {}; } }
function saveSigns(data, store = globalThis.localStorage) { try { store.setItem(KEY, JSON.stringify(data)); } catch { /* no storage: practise without saving */ } }

const shuffle = list => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const kindOf = code => SIGN_BY_CODE[code].kind || GROUP_BY_ID[SIGN_BY_CODE[code].group].kind;
const img = (code, alt = '', cls = '') => `<img class="sk-img ${/^[QRS] /.test(code) ? 'is-road' : ''} ${cls}" src="${signFile(code)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;

/* ---------- screens ---------- */

function overview() {
  const saved = loadSigns();
  const rows = GROUPS.map(g => {
    const best = saved.groups?.[g.id];
    const status = best ? `Bedst: ${best.best} af ${best.total}` : 'Ikke øvet endnu';
    return `<li><a class="sk-row" href="#skilte:${g.id}">${img(THUMB[g.id], '', 'sk-row-img')}<span class="sk-row-text"><strong>${esc(g.title)}</strong><span>${esc(g.look)} ${esc(g.says)}</span></span><span class="sk-status">${g.signs.length} tavler<br>${esc(status)}</span></a></li>`;
  }).join('');
  return `<section class="skilte" aria-labelledby="sk-title">
    <header class="sk-head"><p class="eyebrow">Teori</p><h1 id="sk-title">Skilte</h1>
    <p class="sk-lead">Lær tavlerne gruppe for gruppe. Formen og farven fortæller dig det meste, før du læser tegnet.</p></header>
    <ul class="sk-rows">${rows}</ul>
    <div class="sk-dock"><a class="big-btn" href="#skilte:bland:ovelse">Øv alle grupper blandet</a></div>
    <p class="sk-src">Kilde: <a href="${SIGN_SOURCE.url}" target="_blank" rel="noopener noreferrer">${esc(SIGN_SOURCE.label)}</a>.</p>
  </section>`;
}

function groupPage(g) {
  const items = g.signs.map(sign => `<li class="sk-sign${sign.wide ? ' is-wide' : ''}">
      <div class="sk-sign-art">${img(sign.code, `${sign.code} ${sign.name}`)}</div>
      <div class="sk-sign-text"><h3><span class="sk-code">${esc(sign.code)}</span> ${esc(sign.name)}</h3>
        <p>${esc(sign.short)}</p>
        <p class="sk-trap"><b>Faldgrube</b> ${esc(sign.trap)}</p></div>
    </li>`).join('');
  return `<section class="skilte" aria-labelledby="sk-title">
    <header class="sk-head"><a class="sk-back" href="#skilte" aria-label="Tilbage til alle skilte">${ico('up', { cls: 'rot-left' })}<span>Skilte</span></a>
    <h1 id="sk-title">${esc(g.title)}</h1></header>
    <div class="sk-rule"><p class="sk-rule-look">${esc(g.look)}</p><p class="sk-rule-says">${esc(g.says)}</p></div>
    <p class="sk-lead">${esc(g.lead)}</p>
    <div class="sk-dock"><a class="big-btn" href="#skilte:${g.id}:ovelse">Øv ${esc(g.title.toLowerCase())}</a></div>
    <ul class="sk-signs">${items}</ul>
    <p class="sk-src">Kilde: <a href="${SIGN_SOURCE.url}" target="_blank" rel="noopener noreferrer">${esc(SIGN_SOURCE.label)}</a>, ${esc(g.source.para)}.</p>
  </section>`;
}

function exerciseShell(id) {
  const title = id === 'bland' ? 'Alle skilte blandet' : GROUP_BY_ID[id].title;
  return `<section class="skilte sk-ex" data-ex="${esc(id)}" aria-labelledby="sk-ex-title">
    <div class="exam-top"><a class="back-btn jp-close" href="#skilte${id === 'bland' ? '' : ':' + id}" aria-label="Stop øvelsen">${ico('x')}</a>
      <span class="exam-count" data-sk-count></span><div class="exam-bar" aria-hidden="true"><i data-sk-bar style="--p:0"></i></div></div>
    <p class="eyebrow sk-ex-kicker">${esc(title)}</p>
    <div class="sk-stage" data-sk-stage aria-live="polite"></div>
    <h1 id="sk-ex-title" class="sr-only">Øvelse: ${esc(title)}</h1>
  </section>`;
}

export function renderSigns(hash = location.hash) {
  const [, gid, mode] = hash.slice(1).split(':');
  if (gid === 'bland') return mode === 'ovelse' ? exerciseShell('bland') : overview();
  const g = GROUP_BY_ID[gid];
  if (!g) return overview();
  return mode === 'ovelse' ? exerciseShell(g.id) : groupPage(g);
}

/* ---------- questions ---------- */

const opt = (extra, correct) => ({ ...extra, correct });

function nameQuestion(sign, pool) {
  const others = shuffle(pool.filter(o => o.code !== sign.code && o.name !== sign.name)).slice(0, 3);
  return { type: 'name', code: sign.code, prompt: 'Hvad betyder tavlen?', media: sign.code,
    options: shuffle([opt({ label: sign.name }, true), ...others.map(o => opt({ label: o.name }, false))]) };
}
function imageQuestion(sign, pool) {
  const others = shuffle(pool.filter(o => o.code !== sign.code && !o.wide)).slice(0, 3);
  return { type: 'image', code: sign.code, prompt: `Hvilken tavle hedder „${sign.name}“?`,
    options: shuffle([opt({ code: sign.code }, true), ...others.map(o => opt({ code: o.code }, false))]) };
}
function situationQuestion(item) {
  return { type: 'situation', code: item.answer, prompt: item.text,
    options: shuffle([opt({ code: item.answer }, true), ...item.others.map(c => opt({ code: c }, false))]) };
}
function factQuestion(f) {
  // show the sign when the question names exactly one sign we have a picture of
  const named = [...new Set(f.q.match(/\b[A-Z]{1,2} \d+(?:,\d+)?\b/g) || [])];
  const media = named.length === 1 && SIGN_BY_CODE[named[0]] && !SIGN_BY_CODE[named[0]].wide ? named[0] : undefined;
  return { type: 'fact', prompt: f.q, explain: f.explain, media,
    options: f.options.map((label, i) => opt({ label }, i === f.answer)) };
}
function sortQuestion(sign) {
  const kinds = shuffle([...new Set(GROUPS.map(g => g.kind))].filter(k => k !== kindOf(sign.code))).slice(0, 3);
  return { type: 'sort', code: sign.code, prompt: 'Hvilken slags skilt er det?', media: sign.code,
    options: shuffle([opt({ label: kindOf(sign.code) }, true), ...kinds.map(k => opt({ label: k }, false))]) };
}

/** Signs the learner got wrong before come up a little more often. */
function weighted(signs, wrong) {
  return signs.map(s => [s, Math.random() + (wrong[s.code] || 0) * 0.35]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
}

export function buildSession(id, wrong = {}) {
  if (id === 'bland') {
    const all = GROUPS.flatMap(g => g.signs.map(s => ({ ...s, group: g.id })));
    const picks = weighted(all, wrong);
    const q = [];
    const used = new Set();
    const take = n => picks.filter(s => !used.has(s.code)).slice(0, n).map(s => (used.add(s.code), s));
    take(5).forEach(s => q.push(nameQuestion(s, GROUP_BY_ID[s.group].signs)));
    take(4).forEach(s => q.push(sortQuestion(s)));
    shuffle(GROUPS).filter(g => g.situations.length).slice(0, 2).forEach(g => q.push(situationQuestion(shuffle(g.situations)[0])));
    shuffle(GROUPS).filter(g => g.facts.length).slice(0, 2).forEach(g => q.push(factQuestion(shuffle(g.facts)[0])));
    return shuffle(q).slice(0, MIX_SIZE);
  }
  const g = GROUP_BY_ID[id];
  const q = [];
  const used = new Set();
  shuffle(g.situations).slice(0, 2).forEach(it => { q.push(situationQuestion(it)); used.add(it.answer); });
  shuffle(g.facts).slice(0, 2).forEach(f => q.push(factQuestion(f)));
  const rest = weighted(g.signs, wrong).filter(s => !used.has(s.code));
  const imageSign = rest.find(s => !s.wide);
  if (imageSign && SESSION_SIZE - q.length > 3) { q.push(imageQuestion(imageSign, g.signs)); used.add(imageSign.code); }
  for (const s of rest) { if (q.length >= SESSION_SIZE) break; if (!used.has(s.code)) { q.push(nameQuestion(s, g.signs)); used.add(s.code); } }
  return shuffle(q).slice(0, SESSION_SIZE);
}

/* ---------- exercise controller ---------- */

function optionHtml(o, i) {
  return o.code
    ? `<button type="button" class="sk-opt sk-opt-img" data-i="${i}" aria-label="Tavle ${i + 1}">${img(o.code)}<span class="sk-mark" aria-hidden="true"></span></button>`
    : `<button type="button" class="sk-opt" data-i="${i}"><span class="sk-opt-text">${esc(o.label)}</span><span class="sk-mark" aria-hidden="true"></span></button>`;
}

function feedbackHtml(q, ok) {
  const sign = q.code ? SIGN_BY_CODE[q.code] : null;
  const head = `<strong class="sk-fb-head" tabindex="-1">${ok ? 'Rigtigt' : 'Ikke helt'}</strong>`;
  if (q.type === 'fact') return `${head}<p>${esc(q.explain)}</p>`;
  if (q.type === 'sort') return `${head}<p><b>${esc(sign.code)} ${esc(sign.name)}</b> er en ${esc(kindOf(q.code).toLowerCase())}.</p>`;
  return `${head}<p><b>${esc(sign.code)} ${esc(sign.name)}</b></p><p>${esc(sign.short)}</p><p class="sk-trap"><b>Faldgrube</b> ${esc(sign.trap)}</p>`;
}

export function mountSigns(root, { sound = () => {} } = {}) {
  if (!root?.dataset.ex) return () => {};
  const id = root.dataset.ex;
  const stage = root.querySelector('[data-sk-stage]'), count = root.querySelector('[data-sk-count]'), bar = root.querySelector('[data-sk-bar]');
  document.body.classList.add('focus-mode');
  let questions = [], index = 0, score = 0, wrongNow = [], locked = false;

  const progress = () => {
    count.textContent = `${Math.min(index + 1, questions.length)} / ${questions.length}`;
    bar.style.setProperty('--p', String(index / questions.length));
  };

  function start() {
    questions = buildSession(id, loadSigns().wrong || {});
    index = 0; score = 0; wrongNow = [];
    show();
  }

  function show() {
    locked = false;
    if (index >= questions.length) return finish();
    const q = questions[index];
    progress();
    const media = q.media ? `<div class="sk-q-art">${img(q.media, 'Færdselstavle')}</div>` : '';
    stage.innerHTML = `<h2 class="sk-q" tabindex="-1">${esc(q.prompt)}</h2>${media}
      <div class="sk-opts${q.options.some(o => o.code) ? ' is-grid' : ''}" role="group" aria-label="Svarmuligheder">${q.options.map(optionHtml).join('')}</div>
      <div class="sk-fb" role="status" hidden></div>`;
    stage.querySelector('.sk-q').focus?.();
  }

  function answer(i) {
    if (locked) return;
    locked = true;
    const q = questions[index], chosen = q.options[i], ok = chosen.correct;
    if (ok) score++; else wrongNow.push(q);
    const data = loadSigns();
    if (q.code) { data.wrong ||= {}; data.wrong[q.code] = Math.max(0, (data.wrong[q.code] || 0) + (ok ? -1 : 1)); saveSigns(data); }
    sound(ok ? 'correct' : 'repair');
    stage.querySelectorAll('.sk-opt').forEach((b, k) => {
      b.disabled = true;
      const o = q.options[k];
      if (o.correct) { b.classList.add('is-right'); b.querySelector('.sk-mark').textContent = 'Rigtigt'; }
      else if (k === i) { b.classList.add('is-wrong'); b.querySelector('.sk-mark').textContent = 'Dit svar'; }
    });
    const fb = stage.querySelector('.sk-fb');
    fb.className = `sk-fb ${ok ? 'is-right' : 'is-wrong'}`;
    fb.innerHTML = `${feedbackHtml(q, ok)}<button type="button" class="big-btn" data-next>${index + 1 >= questions.length ? 'Se resultat' : 'Næste'}</button>`;
    fb.hidden = false;
    fb.querySelector('.sk-fb-head').focus({ preventScroll: true });
    fb.scrollIntoView?.({ block: 'nearest', behavior: document.body.classList.contains('no-motion') ? 'auto' : 'smooth' });
  }

  function finish() {
    index = questions.length; progress();
    const total = questions.length;
    const data = loadSigns();
    data.groups ||= {};
    const prev = data.groups[id];
    if (!prev || score >= prev.best) data.groups[id] = { best: score, total, at: Date.now() };
    saveSigns(data);
    sound('complete');
    const seen = new Set(), misses = wrongNow.filter(q => q.code && !seen.has(q.code) && seen.add(q.code));
    const list = misses.length ? `<h2 class="sk-miss-title">Det skal du lige øve igen</h2><ul class="sk-miss">${misses.slice(0, 6).map(q => `<li>${img(q.code, '', 'sk-miss-img')}<span><b>${esc(q.code)}</b> ${esc(SIGN_BY_CODE[q.code].name)}</span></li>`).join('')}</ul>` : '';
    const back = id === 'bland' ? '#skilte' : `#skilte:${id}`;
    stage.innerHTML = `<div class="sk-result"><p class="sk-score"><span>${score}</span> af ${total} rigtige</p>
      <p class="sk-lead">${score === total ? 'Alle rigtige. Prøv en anden gruppe, eller bland dem.' : score >= total * 0.75 ? 'Rigtig godt. Tag de sidste fejl en gang til.' : 'Gennemgå tavlerne, og prøv igen.'}</p>${list}
      <div class="sk-actions"><button type="button" class="big-btn" data-again>Øv igen</button><a class="sk-link" href="${back}">${id === 'bland' ? 'Tilbage til alle skilte' : 'Tilbage til ' + esc(GROUP_BY_ID[id].title.toLowerCase())}</a></div></div>`;
    stage.querySelector('[data-again]').focus({ preventScroll: true });
  }

  const onClick = e => {
    const o = e.target.closest('.sk-opt');
    if (o && stage.contains(o)) return answer(Number(o.dataset.i));
    if (e.target.closest('[data-next]')) { index++; show(); }
    else if (e.target.closest('[data-again]')) start();
  };
  stage.addEventListener('click', onClick);
  start();
  return () => { stage.removeEventListener('click', onClick); document.body.classList.remove('focus-mode'); };
}
