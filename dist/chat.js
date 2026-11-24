// "Spørg Sneglen": the chat screen. Streams answers from /api/chat (Server-Sent Events) and renders the
// agent's actions (rule cards, quizzes, next steps) as cards. History stays on this device only.
import { renderCast } from './cast.js';
import { QUESTIONS } from './content.js';
import { LESSONS } from './lessons.js';
import { AI_CONFIG, aiResetAt } from './ai-config.js';
import { createAiUsage, randomAiId } from './ai-usage.js';

const KEY = 'teoriboost.chat.v1';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ICON = {
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
};
const SUGGEST = ['Hvornår har jeg ubetinget vigepligt?', 'Forklar hajtænder på 20 sekunder', 'Hvad skal jeg øve mere på?',
  'Hvor mange fejl må jeg have til teoriprøven?', 'Test mig i rundkørsler', 'Hvorfor bremser bilen længere på våd vej?'];

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
    if (list) { out.push(`<ul class="chat-prose-list" role="list">${list.join('')}</ul>`); list = null; }
    if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push(`<ul class="chat-prose-list" role="list">${list.join('')}</ul>`);
  return out.join('');
}

const avatar = () => `<span class="chat-ava" aria-hidden="true"><img src="assets/cast/sneglen-face.webp" alt="" width="40" height="40"></span>`;

function actionHtml(a, i) {
  if (a.type === 'rule') return `<article class="chat-rule"><span class="chat-kicker">${esc(a.chapter)}</span><h3>${esc(a.title)}</h3>
    <ul>${(a.facts || []).map(f => `<li>${ICON.check}<span>${esc(f)}</span></li>`).join('')}</ul>
    <div class="chat-rule-foot">${(a.sources || []).slice(0, 1).map(s => `<a class="chat-src" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label.split(':')[0])}</a>`).join('')}<a class="chat-step" href="${esc(a.route)}">Tag lektionen</a></div></article>`;
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
    ${m.offline ? '<span class="chat-mode">Sneglen svarer lige nu fra regelkortene. AI er ikke slået til endnu.</span>' : ''}
    ${m.content ? `<div class="chat-bubble">${md(m.content)}</div>` : ''}
    ${(m.actions || []).map(actionHtml).join('')}
    ${m.sources?.length ? `<div class="chat-sources"><span>Kilder</span>${m.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label).slice(0, 48)}</a>`).join('')}</div>` : ''}
    ${m.error ? `<div class="chat-bubble chat-bubble--err">${esc(m.error)}</div>` : ''}
  </div></div>`;
}

export function renderChat({ history }) {
  const empty = `<div class="chat-empty">
    <div class="chat-hero chat-xray" aria-hidden="true"><img class="xr-a" src="assets/cast/sneglen-xray-a.webp" alt="" width="427" height="520" fetchpriority="high"><img class="xr-b" src="assets/cast/sneglen-xray-b.webp" alt="" width="427" height="520"></div>
    <h1 class="chat-hello">Hej, jeg er Sneglen.</h1>
    <p class="chat-sub">Spørg mig om alt i køreteori. Jeg svarer fra regelkortene, tjekker Færdselsstyrelsens kilder og tester dig med en quiz.</p>
    <div class="chat-suggest">${SUGGEST.map((t, i) => `<button type="button" class="chat-chip" style="--i:${i}" data-chat-suggest="${esc(t)}">${esc(t)}</button>`).join('')}</div>
  </div>`;
  return `<section class="chat" aria-label="Spørg Sneglen">
    <header class="chat-top"><a class="chat-x" href="#home" aria-label="Luk samtalen">${ICON.close}</a>
      <div class="chat-who">${avatar()}<div><strong>Sneglen</strong><small>Kender alle ${Object.keys(LESSONS).length} regelkort</small></div></div>
      <button type="button" class="chat-fresh" data-chat-new aria-label="Start en ny samtale">Ny samtale</button></header>
    <div class="chat-log" role="log" aria-live="polite" aria-relevant="additions">${history.length ? history.map(messageHtml).join('') : empty}</div>
    <div class="chat-dock">
      <div class="chat-quota" id="chat-quota" data-ai-remaining aria-live="polite"></div>
      <p class="chat-validation" id="chat-validation" data-chat-validation role="status"></p>
      <form class="chat-form" data-chat-form><label class="sr-only" for="chat-input">Skriv dit spørgsmål</label>
        <textarea id="chat-input" rows="1" maxlength="1500" placeholder="Spørg om alt i køreteori…" enterkeyhint="send" aria-describedby="chat-quota chat-validation"></textarea>
        <button type="submit" class="chat-send" aria-label="Send">Send</button></form>
      <p class="chat-note">AI (Claude) svarer ud fra appens regelkort og officielle kilder. Svar kan være forkerte. Skriv ikke personlige oplysninger.</p>
    </div>
  </section>`;
}

/** Wires the chat screen. Returns a dispose function. */
export function mountChat(root, { context = () => ({}), sound = () => {}, initial = '', accessHeaders = async () => ({}),
  identity = () => ({}), subscribeIdentity = () => () => {}, onGuestLimit = () => { location.hash = '#profil'; },
  onPremiumLimit = () => { location.hash = '#profil'; }, fetcher = globalThis.fetch, usage = createAiUsage() } = {}) {
  const log = root.querySelector('.chat-log'), form = root.querySelector('[data-chat-form]'), input = root.querySelector('#chat-input'), send = root.querySelector('.chat-send');
  const quotaNote = root.querySelector('[data-ai-remaining]'), validation = root.querySelector('[data-chat-validation]');
  let history = loadChat(), ctrl = null, dead = false, resetTimer, initialTimer;
  const scroll = () => requestAnimationFrame(() => log.lastElementChild?.scrollIntoView({ block: 'end', behavior: document.body.classList.contains('no-motion') ? 'auto' : 'smooth' }));
  const grow = () => { input.style.height = 'auto'; input.style.height = Math.min(140, input.scrollHeight) + 'px'; };
  const currentIdentity = () => { const value = identity() || {}; return { uid: value.uid || null, premium: value.premium === true, paymentsEnabled: value.paymentsEnabled === true }; };
  const sameIdentity = (a, b) => (a.uid || null) === (b.uid || null) && !!a.premium === !!b.premium;
  function refreshQuota() {
    if (dead) return;
    const who = currentIdentity(), quota = usage.view(who);
    let html = '';
    if (quota.remaining === 0) {
      if (quota.tier === 'guest') html = `<span>Log ind, så kan du stille ${AI_CONFIG.dailyLimits.free} spørgsmål om dagen</span><button type="button" data-chat-login>Log ind</button>`;
      else if (quota.tier === 'free' && who.paymentsEnabled) html = `<span>Dagens ${quota.limit} spørgsmål er brugt. Med Premium får du ${AI_CONFIG.dailyLimits.premium} om dagen.</span><button type="button" data-chat-premium>Se Premium</button>`;
      else html = `<span>Dagens ${quota.limit} spørgsmål er brugt. Kom igen i morgen.</span>`;
    } else if (quota.remaining <= 2) html = `<span>${quota.remaining} spørgsmål tilbage i dag</span>`;
    if (quotaNote.innerHTML !== html) quotaNote.innerHTML = html;
    send.disabled = !ctrl && quota.remaining === 0;
  }
  const busy = on => { send.textContent = on ? 'Stop' : 'Send'; send.setAttribute('aria-label', on ? 'Stop svaret' : 'Send'); send.classList.toggle('is-stop', on); refreshQuota(); };
  function scheduleReset() {
    clearTimeout(resetTimer);
    const delay = Math.max(50, Date.parse(aiResetAt(Date.now())) - Date.now() + 50);
    resetTimer = setTimeout(() => { refreshQuota(); scheduleReset(); }, delay);
  }
  const onVisibility = () => { refreshQuota(); scheduleReset(); };
  const offUsage = usage.subscribe(refreshQuota), offIdentity = subscribeIdentity(refreshQuota);
  window.addEventListener('focus', onVisibility); document.addEventListener('visibilitychange', onVisibility);
  refreshQuota(); scheduleReset();

  async function ask(text) {
    text = String(text || '').trim(); if (!text || ctrl || dead) return;
    if (text.length > 1500) { validation.textContent = 'Spørgsmålet er for langt. Hold det på højst 1.500 tegn.'; return; }
    validation.textContent = '';
    ctrl = new AbortController(); const signal = ctrl.signal; busy(true);
    let live, userNode, ai, paint, response;
    try {
      let headers, who, stable = false;
      // Token retrieval is asynchronous: never associate one account's token with
      // a different account's local quota after a login or logout during the await.
      for (let attempt = 0; attempt < 2; attempt++) {
        const before = currentIdentity();
        headers = new Headers(await accessHeaders());
        if (signal.aborted || dead) return;
        who = currentIdentity();
        if (sameIdentity(before, who)) { stable = true; break; }
      }
      if (!stable) throw Object.assign(new Error('Account changed'), { userMessage: 'Din konto skiftede undervejs. Prøv igen.' });
      if (who.uid && !headers.get('Authorization')) throw Object.assign(new Error('Missing account token'), { userMessage: 'Log ind igen for at fortsætte.' });
      const result = await usage.request(who, async () => {
        if (!sameIdentity(who, currentIdentity())) throw Object.assign(new Error('Account changed'), { userMessage: 'Din konto skiftede undervejs. Prøv igen.' });
        log.querySelector('.chat-empty')?.remove();
        history.push({ role: 'user', content: text });
        ai = { role: 'assistant', content: '', actions: [], sources: [] }; history.push(ai);
        log.insertAdjacentHTML('beforeend', messageHtml(history[history.length - 2])); userNode = log.lastElementChild;
        log.insertAdjacentHTML('beforeend', `<div class="chat-msg chat-msg--ai is-live">${avatar()}<div class="chat-col"><span class="chat-status"><i aria-hidden="true"></i><b>Tænker …</b></span></div></div>`);
        live = log.lastElementChild; const col = live.querySelector('.chat-col');
        paint = statusText => { col.innerHTML = (ai.offline ? '<span class="chat-mode">Sneglen svarer lige nu fra regelkortene. AI er ikke slået til endnu.</span>' : '') + (ai.content ? `<div class="chat-bubble">${md(ai.content)}<i class="chat-caret" aria-hidden="true"></i></div>` : '') + ai.actions.map(actionHtml).join('') + (statusText ? `<span class="chat-status"><i aria-hidden="true"></i><b>${esc(statusText)}</b></span>` : ''); scroll(); };
        if (input.value.trim() === text) input.value = '';
        grow(); scroll(); sound('select');
        headers.set('content-type', 'application/json');
        headers.set('X-TeoriBoost-Request', randomAiId());
        headers.set('X-TeoriBoost-Device', usage.deviceId());
        return fetcher('/api/chat', { method: 'POST', headers, signal,
          body: JSON.stringify({ messages: history.slice(0, -1).filter(m => m.content).map(m => ({ role: m.role, content: m.content })), context: context() }) });
      }, { signal });
      if (result.blocked) { if (!input.value) input.value = text; grow(); refreshQuota(); return; }
      response = result.response;
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        if (data.error?.code === 'AI_LIMIT_REACHED') {
          userNode?.remove(); live?.remove(); history.splice(-2); ai = null;
          if (!input.value) input.value = text;
          grow(); refreshQuota(); return;
        }
        throw Object.assign(new Error(String(response.status)), { userMessage: data.error?.message });
      }
      const reader = response.body.getReader(), dec = new TextDecoder(); let buf = '', status = 'Tænker …';
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
      if (e.name !== 'AbortError') {
        const message = e.userMessage || 'Vi kunne ikke få svar fra Sneglen lige nu. Tjek din forbindelse, og prøv igen.';
        if (ai) ai.error = message; else validation.textContent = message;
      }
    } finally {
      ctrl = null; busy(false);
      if (!dead && ai && live) { live.outerHTML = messageHtml(ai); saveChat(history); sound(ai.error ? 'repair' : 'node'); scroll(); }
    }
  }

  const onSubmit = e => { e.preventDefault(); if (ctrl) { if (e.submitter === send) ctrl.abort(); return; } void ask(input.value); };
  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); onSubmit(e); } };
  const onClick = e => {
    if (e.target.closest('[data-chat-login]')) { onGuestLimit(); return; }
    if (e.target.closest('[data-chat-premium]')) { onPremiumLimit(); return; }
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
      res.innerHTML = `<strong>${right === 4 ? 'Alle fire rigtige!' : `${right} af 4 rigtige`}</strong><p>${esc(q.explanation)}</p>${right < 4 ? `<button type="button" class="chat-step chat-step--solo" data-chat-suggest="${esc(`Jeg fik ${right} af 4 rigtige på "${q.prompt}". Forklar kort, hvad jeg tog fejl i: ${wrong.join(' / ')}`)}">Forklar mine fejl</button>` : ''}`;
      sound(right === 4 ? 'correct' : 'repair'); scroll();
    }
  };
  const onInput = () => { validation.textContent = ''; grow(); };
  form.addEventListener('submit', onSubmit); input.addEventListener('keydown', onKey); input.addEventListener('input', onInput); root.addEventListener('click', onClick);
  if (history.length) scroll();
  if (initial) initialTimer = setTimeout(() => void ask(initial), 250); else if (matchMedia('(hover:hover)').matches) input.focus({ preventScroll: true });
  return () => { dead = true; ctrl?.abort(); clearTimeout(resetTimer); clearTimeout(initialTimer); offUsage?.(); offIdentity?.(); usage.dispose();
    window.removeEventListener('focus', onVisibility); document.removeEventListener('visibilitychange', onVisibility);
    form.removeEventListener('submit', onSubmit); input.removeEventListener('keydown', onKey); input.removeEventListener('input', onInput); root.removeEventListener('click', onClick); };
}
