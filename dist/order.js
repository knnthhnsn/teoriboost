// Ordering exercises: drag the steps into the right order (finger on the grip, mouse anywhere),
// or move them with the arrow buttons. Results stay on this device.
import { SEQUENCES, shuffled, gradeOrder } from './sequences.js';
import { CHAPTERS, SOURCES } from './content.js';
import { ico } from './ui-icons.js';

const KEY = 'teoriboost.order.v1';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function loadOrderResults(store = globalThis.localStorage) { try { return JSON.parse(store.getItem(KEY)) || {}; } catch { return {}; } }
function saveResult(id, all, store = globalThis.localStorage) { try { const r = loadOrderResults(store); r[id] = { done: (r[id]?.done || false) || all, at: Date.now() }; store.setItem(KEY, JSON.stringify(r)); } catch {} }
const sectionOf = id => CHAPTERS.flatMap(c => c.sections.map(s => ({ ...s, chapter: c.title }))).find(s => s.id === id);

export function renderOrderList() {
  const res = loadOrderResults();
  return `<section class="order-list" aria-labelledby="ol-title"><header class="screen-head"><a class="back-round" href="#practice" aria-label="Tilbage til Øv">${ico('up', { cls: 'rot-left' })}</a><h1 id="ol-title">Rækkefølge</h1></header>
    <p class="ord-intro">Procedurer skal sidde i den rigtige rækkefølge. Alle bygger på appens kildetjekkede regelkort.</p>
    <div class="row-list">${SEQUENCES.map(s => `<a class="row-card" href="#order:${s.id}"><span class="row-ico" style="--c:${res[s.id]?.done ? '#E6F8D2' : '#EEF1F4'}">${ico(res[s.id]?.done ? 'check' : 'list')}</span><div><strong>${esc(s.title)}</strong><small>${s.steps.length} trin · ${esc(sectionOf(s.sectionId)?.title || '')}</small></div><span class="row-go">${ico('down', { cls: 'rot-right' })}</span></a>`).join('')}</div></section>`;
}

export function renderOrder(id) {
  const seq = SEQUENCES.find(s => s.id === id); if (!seq) return renderOrderList();
  const i = SEQUENCES.indexOf(seq);
  return `<section class="order" data-order="${esc(seq.id)}" aria-labelledby="ord-title">
    <div class="exam-top"><a class="back-btn jp-close" href="#order" aria-label="Luk og gå til alle rækkefølger">${ico('x')}</a><span class="exam-count">${i + 1} / ${SEQUENCES.length}</span>
      <div class="exam-bar" aria-hidden="true"><i style="--p:${(i + 1) / SEQUENCES.length}"></i></div></div>
    <p class="eyebrow ord-kicker">SÆT I RÆKKEFØLGE · ${esc(seq.title.toUpperCase())}</p>
    <h1 id="ord-title" class="ord-title">${esc(seq.prompt)}</h1>
    <p class="ord-hint">Træk i ${ico('grip')} eller brug pilene. Det første trin øverst.</p>
    <ol class="ord-items" aria-label="Trin i den rækkefølge, du har valgt"></ol>
    <p class="sr-only" aria-live="polite" data-ord-live></p>
    <div class="ord-dock"><button type="button" class="big-btn" data-ord-check>Tjek rækkefølgen</button></div>
    <div class="ord-result" role="status" hidden></div>
  </section>`;
}

/** Wires one exercise. Returns a dispose function. */
export function mountOrder(root, { sound = () => {} } = {}) {
  const seq = SEQUENCES.find(s => s.id === root.dataset.order); if (!seq) return () => {};
  const list = root.querySelector('.ord-items'), live = root.querySelector('[data-ord-live]'), result = root.querySelector('.ord-result'), check = root.querySelector('[data-ord-check]');
  let locked = false, drag = null;
  const still = () => document.body.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  function build() {
    locked = false; result.hidden = true; check.hidden = false;
    list.innerHTML = shuffled(seq.steps.length).map(k => `<li class="ord-item" data-step="${k}"><span class="ord-n"></span><span class="ord-text">${esc(seq.steps[k])}</span>
      <span class="ord-move"><button type="button" data-ord-up aria-label="Flyt op">${ico('up')}</button><button type="button" data-ord-down aria-label="Flyt ned">${ico('down')}</button></span>
      <span class="ord-grip" aria-hidden="true">${ico('grip')}</span></li>`).join('');
    number();
  }
  const items = () => [...list.children];
  function number() { items().forEach((li, i) => { li.querySelector('.ord-n').textContent = i + 1; li.setAttribute('aria-label', `Plads ${i + 1}: ${seq.steps[li.dataset.step]}`); }); }
  /** FLIP: let the items that moved glide to their new place. */
  function animateFrom(before) {
    if (still()) return;
    for (const li of items()) { const b = before.get(li); if (b == null || li === drag?.item) continue; const d = b - li.getBoundingClientRect().top; if (!d) continue;
      li.style.transition = 'none'; li.style.translate = `0 ${d}px`; requestAnimationFrame(() => { li.style.transition = ''; li.style.translate = ''; }); }
  }
  const tops = () => new Map(items().map(li => [li, li.getBoundingClientRect().top]));
  function move(li, dir) {
    const sib = dir < 0 ? li.previousElementSibling : li.nextElementSibling; if (!sib) return false;
    const before = tops(); dir < 0 ? list.insertBefore(li, sib) : list.insertBefore(sib, li); animateFrom(before); number();
    live.textContent = `Flyttet til plads ${items().indexOf(li) + 1} af ${seq.steps.length}`; sound('nav'); return true;
  }

  const onDown = e => {
    if (locked) return; const li = e.target.closest('.ord-item'); if (!li || e.target.closest('button')) return;
    if (e.pointerType !== 'mouse' && !e.target.closest('.ord-grip')) return; // on touch, only the grip drags; the rest scrolls the page
    e.preventDefault(); try { li.setPointerCapture(e.pointerId); } catch {}
    drag = { item: li, startY: e.clientY, id: e.pointerId }; li.classList.add('is-drag'); list.classList.add('is-sorting'); sound('select');
  };
  const onMove = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const li = drag.item; li.style.translate = `0 ${e.clientY - drag.startY}px`;
    const mid = li.getBoundingClientRect().top + li.offsetHeight / 2, gap = parseFloat(getComputedStyle(list).rowGap) || 10;
    const next = li.nextElementSibling, prev = li.previousElementSibling;
    if (next && mid > next.getBoundingClientRect().top + next.offsetHeight / 2) { const before = tops(); list.insertBefore(next, li); drag.startY += next.offsetHeight + gap; li.style.translate = `0 ${e.clientY - drag.startY}px`; animateFrom(before); number(); sound('nav'); }
    else if (prev && mid < prev.getBoundingClientRect().top + prev.offsetHeight / 2) { const before = tops(); list.insertBefore(li, prev); drag.startY -= prev.offsetHeight + gap; li.style.translate = `0 ${e.clientY - drag.startY}px`; animateFrom(before); number(); sound('nav'); }
  };
  const onUp = e => {
    if (!drag || e.pointerId !== drag.id) return; const li = drag.item; drag = null;
    li.classList.remove('is-drag'); list.classList.remove('is-sorting'); li.style.translate = '';
    live.textContent = `Lagt på plads ${items().indexOf(li) + 1} af ${seq.steps.length}`;
  };
  const onClick = e => {
    const up = e.target.closest('[data-ord-up]'), down = e.target.closest('[data-ord-down]');
    if ((up || down) && !locked) { const li = e.target.closest('.ord-item'); move(li, up ? -1 : 1); (up ? li.querySelector('[data-ord-up]') : li.querySelector('[data-ord-down]')).focus(); return; }
    if (e.target.closest('[data-ord-check]')) {
      const order = items().map(li => Number(li.dataset.step)); const g = gradeOrder(order); locked = true;
      items().forEach((li, pos) => { const ok = g.rows[pos]; li.classList.add(ok ? 'is-right' : 'is-wrong');
        li.querySelector('.ord-move').innerHTML = ok ? `<span class="ord-mark">${ico('check')}</span>` : `<span class="ord-should">Skal være nr. ${Number(li.dataset.step) + 1}</span>`;
        li.querySelectorAll('button').forEach(b => b.disabled = true); });
      const sec = sectionOf(seq.sectionId), src = (sec?.sourceIds || []).map(id => SOURCES.find(s => s.id === id)).filter(Boolean)[0];
      const next = SEQUENCES[SEQUENCES.indexOf(seq) + 1];
      result.className = 'ord-result ' + (g.all ? 'is-right' : 'is-near'); result.hidden = false; check.hidden = true;
      result.innerHTML = `<strong>${g.all ? 'Helt rigtig rækkefølge!' : `${g.right} af ${seq.steps.length} på rette plads`}</strong>
        ${g.all ? '' : `<ol class="ord-answer">${seq.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`}
        <p>${esc(seq.explanation)}</p>
        ${src ? `<a class="ord-src" href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.label.split(':')[0])} ↗</a>` : ''}
        <div class="ord-actions">${g.all ? (next ? `<a class="big-btn" href="#order:${next.id}">Næste rækkefølge</a>` : '<a class="big-btn" href="#order">Alle rækkefølger</a>') : '<button type="button" class="big-btn" data-ord-retry>Prøv igen</button>'}
          <a class="big-btn big-btn--ghost" href="#journey:${esc(seq.sectionId)}">Læs reglen</a></div>`;
      saveResult(seq.id, g.all); sound(g.all ? 'correct' : 'repair'); result.scrollIntoView({ block: 'nearest', behavior: still() ? 'auto' : 'smooth' });
      return;
    }
    if (e.target.closest('[data-ord-retry]')) { build(); sound('step'); list.scrollIntoView({ block: 'center', behavior: still() ? 'auto' : 'smooth' }); }
  };
  build();
  list.addEventListener('pointerdown', onDown); list.addEventListener('pointermove', onMove); list.addEventListener('pointerup', onUp); list.addEventListener('pointercancel', onUp); root.addEventListener('click', onClick);
  return () => { list.removeEventListener('pointerdown', onDown); list.removeEventListener('pointermove', onMove); list.removeEventListener('pointerup', onUp); list.removeEventListener('pointercancel', onUp); root.removeEventListener('click', onClick); };
}
