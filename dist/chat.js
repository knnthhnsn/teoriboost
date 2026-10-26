// "Spørg Sneglen": the chat screen. Streams answers from /api/chat (Server-Sent Events) and renders the
// agent's actions (rule cards, quizzes, next steps) as cards. History stays on this device only.
import { renderCast } from './cast.js';
import { QUESTIONS } from './content.js';

const KEY = 'teoriboost.chat.v1';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ICON = {
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
  fresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
};
const SUGGEST = ['Hvornår har jeg ubetinget vigepligt?', 'Forklar hajtænder på 20 sekunder', 'Hvad skal jeg øve mere på?',
  'Hvor mange fejl må jeg have til teoriprøven?', 'Quiz mig i rundkørsler', 'Hvorfor bremser bilen længere på våd vej?'];

export function loadChat(store = globalThis.localStorage) { try { const v = JSON.parse(store.getItem(KEY)); return Array.isArray(v) ? v : []; } catch { return []; } }
export function saveChat(list, store = globalThis.localStorage) { try { store.setItem(KEY, JSON.stringify(list.slice(-30))); } catch {} }

/** Tiny, safe markdown: **bold**, lists, paragraphs, and http(s) links only. Everything else is escaped. */
export function md(text) {
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, t, u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`);
  const out = []; let list = null;
  for (const line of String(text || '').split('\n')) {
    const item = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
    if (item) { (list ||= []).push(`<li>${inline(item[1])}</li>`); continue; }
    if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; }
    if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push(`<ul>${list.join('')}</ul>`);
  return out.join('');
}

const avatar = () => `<span class="chat-ava" aria-hidden="true"><img src="assets/cast/sneglen-face.webp" alt="" width="40" height="40"></span>`;

function actionHtml(a, i) {
  if (a.type === 'rule') return `<article class="chat-rule"><span class="chat-kicker">${esc(a.chapter)}</span><h3>${esc(a.title)}</h3>
    <ul>${(a.facts || []).map(f => `<li>${ICON.check}<span>${esc(f)}</span></li>`).join('')}</ul>
    <div class="chat-rule-foot">${(a.sources || []).slice(0, 1).map(s => `<a class="chat-src" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label.split(':')[0])} ↗</a>`).join('')}<a class="chat-step" href="${esc(a.route)}">Tag lektionen</a></div></article>`;
  if (a.type === 'step') return `<a class="chat-step chat-step--solo" href="${esc(a.route)}">${esc(a.label)}</a>`;
  if (a.type === 'quiz') {
    const q = QUESTIONS.find(x => x.id === a.questionId); if (!q) return '';
    return `<article class="chat-quiz" data-quiz="${esc(q.id)}"><span class="chat-kicker">QUIZ · VURDÉR ALLE FIRE</span><h3>${esc(q.prompt)}</h3><p class="chat-ctx">${esc(q.context)}</p>
      ${q.statements.map((s, k) => `<div class="chat-st" data-st="${k}"><span>${esc(s.text)}</span><div class="chat-yn" role="group" aria-label="Udsagn ${k + 1}"><button type="button" data-qv="true" aria-pressed="false">Ja</button><button type="button" data-qv="false" aria-pressed="false">Nej</button></div></div>`).join('')}
      <button type="button" class="chat-quiz-check" data-quiz-check disabled>Tjek svar</button><div class="chat-quiz-res" role="status" hidden></div></article>`;
  }
  return '';
}
function messageHtml(m) {
  if (m.role === 'user') return `<div class="chat-msg chat-msg--me"><div class="chat-bubble">${esc(m.content)}</div></div>`;
  return `<div class="chat-msg chat-msg--ai">${avatar()}<div class="chat-col">
    ${m.offline ? '<span class="chat-mode">AI er ikke slået til endnu · svarer fra regelkortene</span>' : ''}
    ${m.content ? `<div class="chat-bubble">${md(m.content)}</div>` : ''}
    ${(m.actions || []).map(actionHtml).join('')}
    ${m.sources?.length ? `<div class="chat-sources"><span>Kilder</span>${m.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label).slice(0, 48)} ↗</a>`).join('')}</div>` : ''}
    ${m.error ? `<div class="chat-bubble chat-bubble--err">${esc(m.error)}</div>` : ''}
  </div></div>`;
}

export function renderChat({ history }) {
  const empty = `<div class="chat-empty">
    <div class="chat-hero">${renderCast('sneglen', { size: 'md', priority: true })}</div>
    <h1 class="chat-hello">Hej! Jeg er Sneglen.</h1>
    <p class="chat-sub">Spørg mig om alt i køreteori. Jeg svarer ud fra appens regelkort, tjekker Færdselsstyrelsen og kan quizze dig.</p>
    <div class="chat-suggest">${SUGGEST.map((t, i) => `<button type="button" class="chat-chip" style="--i:${i}" data-chat-suggest="${esc(t)}">${esc(t)}</button>`).join('')}</div>
  </div>`;
  return `<section class="chat" aria-label="Spørg Sneglen">
    <header class="chat-top"><a class="chat-x" href="#home" aria-label="Luk chatten">${ICON.close}</a>
      <div class="chat-who">${avatar()}<div><strong>Sneglen</strong><small><i class="chat-dot" aria-hidden="true"></i>Kender alle 58 regelkort</small></div></div>
      <button type="button" class="chat-fresh" data-chat-new aria-label="Start en ny samtale">${ICON.fresh}</button></header>
    <div class="chat-log" role="log" aria-live="polite" aria-relevant="additions">${history.length ? history.map(messageHtml).join('') : empty}</div>
    <div class="chat-dock">
      <form class="chat-form" data-chat-form><label class="sr-only" for="chat-input">Skriv dit spørgsmål</label>
        <textarea id="chat-input" rows="1" maxlength="1500" placeholder="Spørg om alt i køreteori…" enterkeyhint="send"></textarea>
        <button type="submit" class="chat-send" aria-label="Send">${ICON.send}</button></form>
      <p class="chat-note">Svar laves af AI (Claude) ud fra appens regelkort og officielle kilder og kan tage fejl. Skriv ikke personlige oplysninger.</p>
    </div>
  </section>`;
}

/** Wires the chat screen. Returns a dispose function. */
export function mountChat(root, { context = () => ({}), sound = () => {}, initial = '' } = {}) {
  const log = root.querySelector('.chat-log'), form = root.querySelector('[data-chat-form]'), input = root.querySelector('#chat-input'), send = root.querySelector('.chat-send');
  let history = loadChat(), ctrl = null, dead = false;
  const scroll = () => requestAnimationFrame(() => log.lastElementChild?.scrollIntoView({ block: 'end', behavior: document.body.classList.contains('no-motion') ? 'auto' : 'smooth' }));
  const grow = () => { input.style.height = 'auto'; input.style.height = Math.min(140, input.scrollHeight) + 'px'; };
  const busy = on => { send.innerHTML = on ? ICON.stop : ICON.send; send.setAttribute('aria-label', on ? 'Stop svaret' : 'Send'); send.classList.toggle('is-stop', on); };

  async function ask(text) {
    text = text.trim(); if (!text || ctrl) return;
    log.querySelector('.chat-empty')?.remove();
    history.push({ role: 'user', content: text });
    const ai = { role: 'assistant', content: '', actions: [], sources: [] }; history.push(ai);
    log.insertAdjacentHTML('beforeend', messageHtml(history[history.length - 2]));
    log.insertAdjacentHTML('beforeend', `<div class="chat-msg chat-msg--ai is-live">${avatar()}<div class="chat-col"><span class="chat-status"><i data-rive="traffic"></i><b>Tænker</b></span></div></div>`);
    const live = log.lastElementChild, col = live.querySelector('.chat-col');
    const paint = (statusText) => { col.innerHTML = (ai.offline ? '<span class="chat-mode">AI er ikke slået til endnu · svarer fra regelkortene</span>' : '') + (ai.content ? `<div class="chat-bubble">${md(ai.content)}<i class="chat-caret" aria-hidden="true"></i></div>` : '') + ai.actions.map(actionHtml).join('') + (statusText ? `<span class="chat-status"><i></i><b>${esc(statusText)}</b></span>` : ''); scroll(); };
    input.value = ''; grow(); scroll(); sound('select'); busy(true);
    ctrl = new AbortController();
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctrl.signal,
        body: JSON.stringify({ messages: history.slice(0, -1).filter(m => m.content).map(m => ({ role: m.role, content: m.content })), context: context() }) });
      if (!r.ok || !r.body) throw new Error(String(r.status));
      const reader = r.body.getReader(), dec = new TextDecoder(); let buf = '', status = 'Tænker';
      for (;;) {
        const { value, done } = await reader.read(); if (done || dead) break;
        buf += dec.decode(value, { stream: true }); let i;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
          const ev = chunk.match(/^event: (.+)$/m)?.[1]; let data = {}; try { data = JSON.parse(chunk.match(/^data: (.+)$/m)?.[1] || '{}'); } catch {}
          if (ev === 'mode') ai.offline = data.ai === false;
          else if (ev === 'status') status = data.text;
          else if (ev === 'text') { ai.content += data.t; status = ''; }
          else if (ev === 'action') ai.actions.push(data);
          else if (ev === 'sources') ai.sources.push(...(data.items || []).filter(s => !ai.sources.some(x => x.url === s.url)));
          else if (ev === 'error') ai.error = data.text;
          paint(status);
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') ai.error = 'Sneglen kunne ikke svare lige nu. Tjek din forbindelse og prøv igen.';
    }
    ctrl = null; busy(false);
    if (dead) return;
    live.outerHTML = messageHtml(ai); saveChat(history); sound(ai.error ? 'repair' : 'node'); scroll();
  }

  const onSubmit = e => { e.preventDefault(); if (ctrl) { ctrl.abort(); return; } ask(input.value); };
  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); onSubmit(e); } };
  const onClick = e => {
    const s = e.target.closest('[data-chat-suggest]'); if (s) { ask(s.dataset.chatSuggest); return; }
    if (e.target.closest('[data-chat-new]')) { if (ctrl) ctrl.abort(); history = []; saveChat(history); log.innerHTML = renderChat({ history: [] }).match(/<div class="chat-log"[^>]*>([\s\S]*)<\/div>\s*<div class="chat-dock">/)[1]; sound('toggle-off'); return; }
    const v = e.target.closest('[data-qv]');
    if (v) { const row = v.closest('[data-st]'); for (const b of row.querySelectorAll('[data-qv]')) { b.classList.toggle('on', b === v); b.setAttribute('aria-pressed', String(b === v)); }
      const card = v.closest('[data-quiz]'); card.querySelector('[data-quiz-check]').disabled = card.querySelectorAll('[data-qv].on').length < 4; sound('select'); return; }
    const check = e.target.closest('[data-quiz-check]');
    if (check) {
      const card = check.closest('[data-quiz]'), q = QUESTIONS.find(x => x.id === card.dataset.quiz); let right = 0; const wrong = [];
      q.statements.forEach((st, k) => { const row = card.querySelector(`[data-st="${k}"]`); const on = row.querySelector('[data-qv].on'); const ok = on && (on.dataset.qv === 'true') === st.correct; if (ok) right++; else wrong.push(st.text);
        row.classList.add(ok ? 'is-right' : 'is-wrong'); row.querySelectorAll('button').forEach(b => b.disabled = true); });
      const res = card.querySelector('.chat-quiz-res'); res.hidden = false; check.hidden = true;
      res.innerHTML = `<strong>${right === 4 ? 'Alle fire rigtige!' : `${right} af 4 rigtige`}</strong><p>${esc(q.explanation)}</p>${right < 4 ? `<button type="button" class="chat-step chat-step--solo" data-chat-suggest="${esc(`Jeg fik ${right} af 4 rigtige på "${q.prompt}". Forklar kort det, jeg tog fejl i: ${wrong.join(' / ')}`)}">Forklar mine fejl</button>` : ''}`;
      sound(right === 4 ? 'correct' : 'repair'); scroll();
    }
  };
  form.addEventListener('submit', onSubmit); input.addEventListener('keydown', onKey); input.addEventListener('input', grow); root.addEventListener('click', onClick);
  if (history.length) scroll();
  if (initial) setTimeout(() => ask(initial), 250); else if (matchMedia('(hover:hover)').matches) input.focus({ preventScroll: true });
  return () => { dead = true; ctrl?.abort(); form.removeEventListener('submit', onSubmit); root.removeEventListener('click', onClick); };
}
