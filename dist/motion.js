// Motion helpers. The look lives in motion.css; this only decides when things arrive.
const still = () => document.body.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Content arrives in a short cascade, top to bottom. Only what is on screen takes part. */
const REVEAL = ['.page-head', '.home-hello', '.road-loop', '.journey-unit', '.mission-card', '.chapter-card', '.progress-card', '.route-strip',
  '.learning-note', '.result-hero', '.badge', '.mybil-head', '.mybil-tabs', '.mybil-base', '.exam-cast', '.home-cta', '.card-grid > *'].join(',');
export function revealView(root) {
  if (still() || !root) return;
  let i = 0; const h = innerHeight;
  for (const el of root.querySelectorAll(REVEAL)) {
    if (el.closest('.reveal') && el.closest('.reveal') !== el) continue;
    if (el.getBoundingClientRect().top > h) continue;
    el.style.setProperty('--i', String(Math.min(i++, 10)));
    el.classList.add('reveal');
    el.addEventListener('animationend', () => el.classList.remove('reveal'), { once: true });
  }
}

/** Page swaps glide where the browser supports view transitions; elsewhere they just swap. */
export function withTransition(update) {
  if (still() || !document.startViewTransition) return update();
  try { document.startViewTransition(update); } catch { update(); }
}

/** No loops while nobody is looking. */
export function initMotion() {
  const sync = () => document.documentElement.classList.toggle('is-hidden', document.hidden);
  document.addEventListener('visibilitychange', sync); sync();
}
