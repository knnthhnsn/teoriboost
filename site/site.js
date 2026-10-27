// teoriboost.dk: sections slide in as they scroll into view, and the before/after slider in "Min bil".
document.documentElement.classList.add('js');

const seen = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 70}ms`; seen.observe(el); });

// before and after: drag across the vehicle, or pick another one
const compare = document.querySelector('.compare'), range = document.getElementById('compare-range');
range?.addEventListener('input', () => compare.style.setProperty('--pos', range.value + '%'));
const NAMES = { scooter: 'Scooteren', smallcar: 'Den lille bil', bigcar: 'Den store bil', racecar: 'Racerbilen' };
for (const b of document.querySelectorAll('[data-vehicle]')) {
  b.addEventListener('click', () => {
    const v = b.dataset.vehicle;
    for (const o of document.querySelectorAll('[data-vehicle]')) { o.classList.toggle('is-on', o === b); o.setAttribute('aria-pressed', String(o === b)); }
    const dream = compare.querySelector('[data-compare="dream"]'), wreck = compare.querySelector('[data-compare="wreck"]');
    dream.src = `assets/cars/${v}-dream.webp`; dream.alt = `${NAMES[v]} sat i stand`;
    wreck.src = `assets/cars/${v}-wreck.webp`; wreck.alt = `${NAMES[v]} som rustbunke`;
  });
}
