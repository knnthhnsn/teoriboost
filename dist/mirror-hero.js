// Lær hero: a rear-view mirror that gets adjusted into place. The road behind you is in the glass,
// and the mirror's own display shows the streak, today's goal and how ready you are.
import { duo, flameArt, flameLevel } from './ui-icons.js';

const plural = (n, one, many) => (n === 1 ? one : many);

/** the flame's level, with :up when it reached a new level and :boost when the streak grew since the hero was last
 *  shown on this device */
function flameState(streak, store = globalThis.localStorage) {
  let seen = streak;
  try { seen = Number(store.getItem('teoriboost.streakSeen') ?? streak); store.setItem('teoriboost.streakSeen', String(streak)); } catch {}
  const level = flameLevel(streak);
  return level > flameLevel(seen) ? `${level}:up` : streak > seen ? `${level}:boost` : String(level);
}

/** Headline and line under it, from where the learner is right now. */
export function heroCopy({ streak = 0, days = null, goal = 1, today = 0, pct = 0 }) {
  const left = Math.max(0, goal - today);
  const eyebrow = days === null ? 'DIN KØRETEORI' : days <= 0 ? 'PRØVEN ER I DAG' : `${days} ${plural(days, 'DAG', 'DAGE')} TIL PRØVEN`;
  const title = today >= goal ? 'Dagens mål er nået. Flot kørt.'
    : pct === 0 && streak === 0 && today === 0 ? 'Spejlet er stillet. Klar til første tur?'
    : pct >= 85 ? 'Du er næsten klar til prøven.'
    : streak >= 2 ? `${streak} dage i træk. Hold farten.`
    : `Du er ${pct} % klar til prøven.`;
  const text = today >= goal ? 'Kom igen i morgen, så holder du kursen.'
    : days !== null && days > 0 ? `${left} ${plural(left, 'lektion', 'lektioner')} mere i dag, så er du på sporet til prøven om ${days} ${plural(days, 'dag', 'dage')}.`
    : `${left} ${plural(left, 'lektion', 'lektioner')} mere i dag. Hver tager cirka 5 minutter.`;
  return { eyebrow, title, text };
}

export function renderMirrorHero({ streak = 0, days = null, goal = 1, today = 0, pct = 0 }) {
  const c = heroCopy({ streak, days, goal, today, pct }), got = Math.min(today, goal);
  return `<section class="mh" aria-labelledby="mh-title">
  <div class="mh-rig">
    <span class="mh-mount" aria-hidden="true"></span>
    <div class="mh-mirror">
      <div class="mh-glass" role="group" aria-label="Din status">
        <div class="mh-scene" aria-hidden="true"><i class="mh-sun"></i><i class="mh-hills"></i><div class="mh-ground"><div class="mh-road"><i></i></div></div></div>
        <div class="mh-hud">
          <div class="mh-stats">
            <p class="mh-stat mh-stat--streak${streak ? '' : ' is-zero'}"><span class="mh-ico" data-rive="flame:${flameState(streak)}">${flameArt(flameLevel(streak))}</span><span><b data-count="${streak}">${streak}</b><small>${plural(streak, 'dag', 'dage')} i træk</small></span></p>
            <p class="mh-stat mh-stat--goal"><span class="mh-ico" data-rive="target:${got >= goal ? 'met' : 'open'}">${duo('target')}</span><span><b>${got}/${goal}</b><small>i dag <span class="mh-dots" aria-hidden="true">${Array.from({ length: Math.min(goal, 6) }, (_, k) => `<i class="${k < got ? 'on' : ''}" style="--k:${k}"></i>`).join('')}</span></small></span></p>
          </div>
          <a class="mh-ring${pct ? '' : ' is-zero'}" href="#profil" style="--p:${pct}" data-rive="gauge:${pct}" aria-label="Du er ${pct} procent klar. Se hvordan vi regner">
            <svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="mh-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD84A"/><stop offset="1" stop-color="#58CC02"/></linearGradient></defs>
              <circle class="mh-track" cx="32" cy="32" r="26" pathLength="100"/><circle class="mh-val" cx="32" cy="32" r="26" pathLength="100"/></svg>
            <span class="rive-keep mh-ring-num"><b data-count="${pct}">${pct}</b><small>% klar</small></span></a>
        </div>
        <i class="mh-sheen" aria-hidden="true"></i><i class="mh-glint" aria-hidden="true"></i>
      </div>
      <i class="mh-led" aria-hidden="true"></i>
    </div>
    <i class="mh-cast" aria-hidden="true"></i>
  </div>
  <div class="mh-copy"><p class="mh-eyebrow">${c.eyebrow}</p><h2 id="mh-title" class="mh-title">${c.title}</h2><p class="mh-text">${c.text}</p></div>
</section>`;
}

/** Adjusts the mirror into place, counts the numbers up and lets it follow the pointer. Returns dispose. */
export function mountMirrorHero(root, { sound = () => {} } = {}) {
  if (!root) return () => {};
  const still = document.body.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) { root.classList.add('is-set'); return () => {}; }
  const timers = [], frames = [];
  const adjust = () => {
    root.classList.remove('is-set', 'is-adjusting'); void root.offsetWidth; root.classList.add('is-adjusting');
    timers.push(setTimeout(() => { root.classList.remove('is-adjusting'); root.classList.add('is-set'); }, 1700));
  };
  const countUp = () => root.querySelectorAll('[data-count]').forEach(b => {
    const to = Number(b.dataset.count) || 0; if (!to) return; const t0 = performance.now() + 450;
    const step = now => { const k = Math.min(1, Math.max(0, (now - t0) / 900)); b.textContent = Math.round(to * (1 - (1 - k) ** 3)); if (k < 1) frames.push(requestAnimationFrame(step)); };
    b.textContent = '0'; frames.push(requestAnimationFrame(step));
  });
  adjust(); countUp();

  // the mirror leans a little toward the pointer, and the light in the glass moves with it
  let raf = 0, dx = 0, dy = 0;
  const paint = () => { raf = 0; root.style.setProperty('--dx', dx.toFixed(3)); root.style.setProperty('--dy', dy.toFixed(3)); };
  const onMove = e => { if (e.pointerType !== 'mouse') return; const r = root.getBoundingClientRect();
    dx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)); dy = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1)); if (!raf) raf = requestAnimationFrame(paint); };
  const onLeave = () => { dx = 0; dy = 0; if (!raf) raf = requestAnimationFrame(paint); };
  // tap the glass (not the ring) to set the mirror again
  const glass = root.querySelector('.mh-glass');
  const onTap = e => { if (e.target.closest('a')) return; adjust(); sound('select'); };
  root.addEventListener('pointermove', onMove); root.addEventListener('pointerleave', onLeave); glass?.addEventListener('click', onTap);
  return () => { timers.forEach(clearTimeout); frames.forEach(cancelAnimationFrame); cancelAnimationFrame(raf);
    root.removeEventListener('pointermove', onMove); root.removeEventListener('pointerleave', onLeave); glass?.removeEventListener('click', onTap); };
}
