// Kørekort som 17-årig: reglerne efter bestået køreprøve, et ur, der viser, om du må køre alene lige nu,
// og et tjek af ledsageren, som eleven selv krydser af. Intet af det gemmes.
//
// Reglerne er tjekket 25. nov. 2026 hos borger.dk ("Kørekort til bil som 17-årig") og FDM ("Kørekort til
// 17-årige: Sådan er kravene", 18. nov. 2025). Siden 1. juli 2025 må 17-årige køre alene fra kl. 05 til 20.

const SOLO_FROM = 5, SOLO_TO = 20; // hele timer, dansk tid

/** Timer og minutter i dansk tid, uanset hvor telefonen tror, den er. */
export function copenhagenTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat('da-DK', { timeZone: 'Europe/Copenhagen', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const get = type => Number(parts.find(p => p.type === type)?.value);
  return { h: get('hour'), m: get('minute') };
}
/** Kl. 20.00 præcis skal ledsageren være med. Kl. 05.00 præcis må du køre alene igen. */
export const mayDriveAlone = ({ h }) => h >= SOLO_FROM && h < SOLO_TO;

export const COMPANION = Object.freeze([
  'Ledsageren er fyldt 24 år.',
  'Ledsageren har haft kørekort til bil i de seneste 5 år, taget og udstedt i Danmark eller på Færøerne.',
  'Ledsageren har ikke fået frakendt kørekortet, betinget eller ubetinget, i de seneste 5 år.',
  'Ledsageren sidder på forsædet ved siden af dig.',
  'Ledsageren har sit kørekort med.',
  'I har udfyldt og underskrevet ledsagerblanketten, og den er med i bilen.'
]);

const pad = n => String(n).padStart(2, '0');
function clockHtml(now = new Date()) {
  const t = copenhagenTime(now), solo = mayDriveAlone(t);
  return `<div class="sytten-clock ${solo ? 'is-solo' : 'is-companion'}" data-sytten-clock><b>${pad(t.h)}.${pad(t.m)}</b><span>${solo
    ? 'Du må køre alene lige nu. Fra kl. 20 skal du have en ledsager med.'
    : 'Nu skal du have en ledsager med. Fra kl. 05 må du køre alene igen.'}</span></div>`;
}

export function renderSytten() {
  return `<section class="sytten" data-sytten>
    <div class="screen-head"><a class="back-btn" href="#profil" aria-label="Tilbage til profilen"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></a><div><div class="eyebrow">EFTER KØREPRØVEN</div><h1>Kørekort som 17-årig</h1></div></div>
    <p class="sytten-lead">Har du bestået køreprøven, før du fylder 18, gælder der særlige regler, indtil du fylder 18.</p>
    ${clockHtml()}
    <div class="panel"><h2>Reglerne</h2><ul class="sytten-rules">
      <li>Fra kl. 05 til kl. 20 må du køre alene.</li>
      <li>Fra kl. 20 til kl. 05 skal du have en ledsager med.</li>
      <li>Du må kun køre i Danmark.</li>
      <li>Kører du uden ledsager, når du skal have en, er bøden mindst 3.000 kr., og det er dig, der får den.</li>
      <li>Det er dig, der skal fortælle ledsageren om kravene.</li>
    </ul></div>
    <div class="panel"><h2>Tjek din ledsager</h2><p class="sytten-small">Kryds af, før I kører. Det er dit eget tjek, ikke en godkendelse, og vi gemmer ingenting.</p>
      <ul class="sytten-check">${COMPANION.map((line, i) => `<li><label><input type="checkbox" data-sytten-check="${i}"><span>${line}</span></label></li>`).join('')}</ul>
      <p class="sytten-result" data-sytten-result aria-live="polite">${COMPANION.length} punkter mangler.</p>
      <p class="sytten-small"><a href="https://www.borger.dk/transport-trafik-rejser/Biler-og-koerekort/koerekort/typer-af-koerekort/koerekort-til-bil-som-17-aarig" target="_blank" rel="noopener">Find ledsagerblanketten og hele reglen på borger.dk</a></p>
    </div>
    <a class="set-row set-row--link" href="#learn:sytten"><span>Øv reglerne for 17-årige</span></a>
    <p class="sytten-small">Tjekket 25. nov. 2026 hos borger.dk og FDM. Reglerne kan ændre sig, så spørg din kørelærer, hvis du er i tvivl.</p>
  </section>`;
}

/** Uret tikker, og tjekket tæller, mens skærmen er åben. Begge stopper, når eleven går videre. */
export function mountSytten(view) {
  const box = view.querySelector('[data-sytten]');
  if (!box) return;
  const timer = setInterval(() => {
    if (!box.isConnected) { clearInterval(timer); return; }
    box.querySelector('[data-sytten-clock]')?.replaceWith(Object.assign(document.createElement('div'), { innerHTML: clockHtml() }).firstElementChild);
  }, 30000);
  box.addEventListener('change', () => {
    const left = COMPANION.length - box.querySelectorAll('[data-sytten-check]:checked').length;
    box.querySelector('[data-sytten-result]').textContent = left === 0 ? 'Alt er tjekket. God tur.' : `${left} ${left === 1 ? 'punkt mangler' : 'punkter mangler'}.`;
  });
}
