// Prøvedagen: en tjekliste til den rigtige teoriprøve og en opvarmning med to situationer, der ikke tæller.
// Opvarmningen rører hverken øveprøven, fremgangen, historikken eller den gratis kvote. Den lever kun i dialogen.
//
// Tjeklisten bygger på FDM, "Sådan bliver du klar til teoriprøven" (5. marts 2026), og borger.dk, tjekket 25. nov. 2026.

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const CHECKLIST = Object.freeze([
  'Mød op senest 15 minutter før. Døren lukkes, når prøven starter, og kommer du for sent, skal du betale for en ny prøve.',
  'Tag pas med. Har du ikke pas, så tag fødsels- eller dåbsattest og billedlegitimation med.',
  'Tag den underskrevne plan fra din køreskole og din godkendte ansøgning om kørekort med.',
  'Du logger ind på prøven med MitID. Bagefter lægger du telefonen og dine ting væk.',
  '25 situationer på 25 minutter, og du må have højst 5 fejl. Du kan gå frem og tilbage, og et ubesvaret spørgsmål tæller som en fejl.'
]);

export function examDayHtml() {
  return `<details class="fine-details exam-day"><summary>Til prøvedagen</summary>
    <ul class="exam-day-list">${CHECKLIST.map(line => `<li>${esc(line)}</li>`).join('')}</ul>
    <p class="exam-day-note">Tjekket 25. nov. 2026 hos <a href="https://fdm.dk/guides/regler/saadan-bliver-du-klar-til-teoriproeven" target="_blank" rel="noopener">FDM</a> og <a href="https://www.borger.dk/transport-trafik-rejser/biler-og-koerekort/koerekort/koereproeve-og-koereundervisning" target="_blank" rel="noopener">borger.dk</a>. Spørg din kørelærer, hvis du er i tvivl.</p>
    <button type="button" class="btn btn-secondary" data-action="exam-warmup">Varm op med 2 situationer</button>
  </details>`;
}

/** To situationer fra hver sit kapitel, trukket tilfældigt. */
export function pickWarmup(questions, random = Math.random) {
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const first = pool[0], second = pool.find(q => q.chapterId !== first?.chapterId) || pool[1];
  return [first, second].filter(Boolean);
}

/** Viser opvarmningen i appens dialog. Svarene gemmes ingen steder. */
export function startWarmup(questions) {
  const modal = document.getElementById('modal'), body = document.getElementById('modal-content');
  if (!modal || !body) return;
  const run = { list: pickWarmup(questions), index: 0, answers: [null, null, null, null], checked: false };

  const draw = () => {
    const q = run.list[run.index], last = run.index === run.list.length - 1;
    const rows = q.statements.map((s, i) => {
      const a = run.answers[i], mark = run.checked ? (a === s.correct ? ' is-right' : ' is-wrong') : '';
      return `<li class="warm-st${mark}"><span>${esc(s.text)}</span><span class="warm-yn">
        <button type="button" class="choice-btn${a === true ? ' selected' : ''}" data-warm="${i}:1" aria-pressed="${a === true}" ${run.checked ? 'disabled' : ''}>JA</button>
        <button type="button" class="choice-btn${a === false ? ' selected' : ''}" data-warm="${i}:0" aria-pressed="${a === false}" ${run.checked ? 'disabled' : ''}>NEJ</button></span>
        ${run.checked && a !== s.correct ? `<small>Rigtigt svar: ${s.correct ? 'JA' : 'NEJ'}</small>` : ''}</li>`;
    }).join('');
    const done = run.answers.every(a => a !== null);
    body.innerHTML = `<div class="modal-header"><h2 id="modal-title">Opvarmning ${run.index + 1} af ${run.list.length}</h2><button class="icon-btn" data-action="close-modal" aria-label="Luk dialog"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <div class="modal-body warm"><p class="warm-note">Den tæller ikke. Den er bare til at komme i gang.</p>
      <h3>${esc(q.prompt)}</h3><p>${esc(q.context)}</p><ol class="warm-list">${rows}</ol>
      ${run.checked ? `<p class="warm-why">${esc(q.explanation)}</p>` : ''}
      <button type="button" class="btn btn-primary" data-warm="${run.checked ? (last ? 'done' : 'next') : 'check'}" ${!run.checked && !done ? 'disabled' : ''}>${run.checked ? (last ? 'Klar til øveprøven' : 'Næste situation') : 'Tjek svarene'}</button></div>`;
  };

  body.onclick = e => {
    const b = e.target.closest?.('[data-warm]'); if (!b) return;
    const v = b.dataset.warm;
    if (v === 'check') run.checked = true;
    else if (v === 'next') { run.index++; run.answers = [null, null, null, null]; run.checked = false; }
    else if (v === 'done') { body.onclick = null; modal.close(); return; }
    else { const [i, yes] = v.split(':'); run.answers[+i] = yes === '1'; }
    draw();
  };
  modal.addEventListener('close', () => { body.onclick = null; }, { once: true });
  draw();
  if (!modal.open) modal.showModal();
}
