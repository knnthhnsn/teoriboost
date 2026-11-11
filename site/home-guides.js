// The guide row uses native horizontal scrolling; the page's vertical scroll engine is untouched.
(() => {
  const section = document.querySelector('[data-home-guides]');
  const track = section?.querySelector('[data-guide-track]');
  const position = section?.querySelector('[data-guide-position]');
  const cards = [...(track?.querySelectorAll('[data-guide-card]') || [])];
  if (!track || !position || !cards.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const count = document.createElement('span'); count.className = 'home-guides-count'; count.setAttribute('aria-hidden', 'true');
  const current = document.createElement('b'); current.textContent = '1';
  count.append(current, ` / ${cards.length}`);
  const dots = document.createElement('div'); dots.className = 'home-guides-dots';
  let offsets = [], active = -1, frame = 0;
  const show = index => {
    if (active === index) return;
    active = index; current.textContent = String(index + 1);
    buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
  };
  const go = index => track.scrollTo({ left: offsets[index] || 0, behavior: reduce.matches ? 'instant' : 'smooth' });
  const buttons = cards.map((card, index) => {
    const button = document.createElement('button'); button.type = 'button';
    button.setAttribute('aria-label', `Vis guide ${index + 1}: ${card.querySelector('h3').textContent}`);
    button.setAttribute('aria-controls', track.id); button.addEventListener('click', () => go(index)); dots.append(button); return button;
  });
  const update = () => {
    frame = 0;
    let nearest = 0;
    for (let i = 1; i < offsets.length; i++) if (Math.abs(offsets[i] - track.scrollLeft) < Math.abs(offsets[nearest] - track.scrollLeft)) nearest = i;
    show(nearest);
  };
  const measure = () => {
    const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    offsets = cards.map(card => Math.max(0, card.offsetLeft - padding)); update();
  };
  track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.target !== track || track.scrollWidth <= track.clientWidth + 2 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : Math.min(cards.length - 1, Math.max(0, active + (event.key === 'ArrowRight' ? 1 : -1))));
  });
  position.append(count, dots); position.hidden = false;
  new ResizeObserver(measure).observe(track);
  document.fonts?.ready.then(measure);
  reduce.addEventListener?.('change', () => { track.scrollTo({ left: track.scrollLeft, behavior: 'instant' }); });
  measure();
})();
