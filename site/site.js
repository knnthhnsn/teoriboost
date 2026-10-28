// All copy remains readable without JavaScript. Enhancements only reveal working controls.
const answers = document.querySelector('.sample-answers');
const feedback = document.querySelector('.sample-feedback');
const result = document.getElementById('sample-result');
if (answers && feedback && result) {
  answers.hidden = false;
  for (const button of answers.querySelectorAll('[data-answer]')) {
    button.addEventListener('click', () => {
      result.textContent = button.dataset.answer === 'yes' ? 'Ja, lige præcis.' : 'Her er svaret ja.';
      feedback.hidden = false;
      answers.hidden = true;
      // The status region announces the explanation; put the next action in keyboard reach.
      feedback.querySelector('button')?.focus({ preventScroll: true });
    });
  }
  feedback.querySelector('button')?.addEventListener('click', () => {
    feedback.hidden = true;
    answers.hidden = false;
    answers.querySelector('button')?.focus({ preventScroll: true });
  });
}
const compare = document.querySelector('.compare');
const range = document.getElementById('compare-range');
if (range && compare) {
  range.hidden = false;
  const choices = document.querySelector('.vehicle-pick');
  if (choices) choices.hidden = false;
  const caption = document.querySelector('.garage-number');
  if (caption) caption.textContent = 'Vælg. Træk. Se forskellen.';
}
range?.addEventListener('input', () => {
  compare?.style.setProperty('--pos', `${range.value}%`);
  range.setAttribute('aria-valuetext', `${range.value} procent før restaurering`);
});
const names = { scooter: 'Scooteren', smallcar: 'Den lille bil', bigcar: 'Den store bil', racecar: 'Racerbilen' };
for (const button of document.querySelectorAll('[data-vehicle]')) {
  button.addEventListener('click', () => {
    if (!compare) return;
    const vehicle = button.dataset.vehicle;
    if (!Object.hasOwn(names, vehicle)) return;
    for (const other of document.querySelectorAll('[data-vehicle]')) {
      other.classList.toggle('is-on', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    }
    const dream = compare.querySelector('[data-compare="dream"]');
    const wreck = compare.querySelector('[data-compare="wreck"]');
    if (dream) { dream.src = `assets/cars/${vehicle}-dream.webp`; dream.alt = `${names[vehicle]} sat i stand`; }
    if (wreck) { wreck.src = `assets/cars/${vehicle}-wreck.webp`; wreck.alt = `${names[vehicle]} før restaurering`; }
  });
}
