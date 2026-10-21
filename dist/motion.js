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

/** Home road loop: the further you scroll, the later it gets. The sun sinks and warms to red, the sky
 *  goes through dusk to night, the moon rises with a softer glow, and the vehicle switches its lamps on.
 *  Everything is driven by CSS variables on the loop, so it follows the finger exactly, both ways. */
const ramp = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function mountDayNight(el) {
  if (!el) return () => {};
  let range = 1, raf = 0;
  const measure = () => {
    const top = el.getBoundingClientRect().top + scrollY, max = document.documentElement.scrollHeight - innerHeight;
    range = Math.max(1, Math.min(Math.max(220, top - innerHeight * .1), max)); // full night when the loop nears the top
  };
  const apply = () => {
    raf = 0; const n = Math.min(1, Math.max(0, scrollY / range));
    const set = (k, v) => el.style.setProperty(k, v.toFixed(3));
    set('--n', n); set('--sunset', ramp(0, .8, n)); set('--dusk', Math.max(0, 1 - Math.abs(n - .42) / .3));
    set('--dark', ramp(.3, .85, n)); set('--moon', ramp(.42, 1, n)); set('--lamps', ramp(.48, .8, n));
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
  const onResize = () => { measure(); onScroll(); };
  measure(); apply();
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onResize);
  return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onResize); cancelAnimationFrame(raf); };
}
