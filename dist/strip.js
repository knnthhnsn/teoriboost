// Horizontal chip rows (Min bil tuning tabs) that scroll: show fading edges and arrow buttons where there is more, scroll the chosen chip into view,
// and replace the native scrollbar, which looked like a stray yellow line and told nobody anything.
const SELECTOR = '.mybil-tabs';

function enhance(strip) {
  if (strip.dataset.strip) return;
  strip.dataset.strip = '1';
  const wrap = document.createElement('div');
  wrap.className = 'strip-wrap';
  strip.replaceWith(wrap);
  wrap.append(strip);
  const mk = dir => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = `strip-arrow strip-arrow--${dir}`; b.tabIndex = -1;
    b.setAttribute('aria-label', dir === 'left' ? 'Se flere til venstre' : 'Se flere til højre');
    b.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="${dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    b.addEventListener('click', () => strip.scrollBy({ left: (dir === 'left' ? -1 : 1) * strip.clientWidth * 0.7, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    wrap.append(b);
  };
  mk('left'); mk('right');
  const update = () => {
    wrap.dataset.left = strip.scrollLeft > 4 ? '1' : '0';
    wrap.dataset.right = strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 4 ? '1' : '0';
  };
  strip.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(strip);
  const active = strip.querySelector('.is-active,[aria-selected="true"]');
  if (active) { const left = active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2; strip.scrollTo({ left: Math.max(0, left) }); }
  update();
}

export function initStrips() {
  const run = () => document.querySelectorAll(SELECTOR).forEach(enhance);
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  run();
}
