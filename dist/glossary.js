// Svære ord: under et spørgsmål vises de fagord, der står i det, som små knapper. Et tryk åbner en kort
// forklaring på dansk og ordet på engelsk. Det hjælper elever, der læser dansk langsomt, og alle, der
// støder på et ord fra loven, de ikke kender. Øveprøven får ingen hjælp, ligesom den rigtige prøve.
//
// Ordene er valgt ud fra, hvor ofte de står i appens spørgsmål. Forklaringerne følger appens regelkort.

// Et ord tæller kun som et helt ord. JavaScripts \b kender ikke æ, ø og å, så vi bruger bogstavklassen \p{L}.
const word = stem => new RegExp(`(?<!\\p{L})(?:${stem})(?!\\p{L})`, 'iu');

export const TERMS = Object.freeze([
  { id: 'ubetinget', label: 'ubetinget vigepligt', re: word('ubetinget vigepligt|ubetinget vigepligten'), en: 'give way to all traffic',
    da: 'Du skal holde tilbage for al trafik på den vej, du kører ind på, fra begge sider. Det vises med hajtænder og en trekantet tavle med rød kant.' },
  { id: 'hoejre', label: 'højre vigepligt', re: word('højre vigepligt|højre vigepligten'), en: 'give way to traffic from the right',
    da: 'I et kryds uden tavler eller hajtænder skal du holde tilbage for trafik, der kommer fra højre.' },
  { id: 'vigepligt', label: 'vigepligt', re: word('vigepligt|vigepligten'), en: 'duty to give way (yield)',
    da: 'Du skal lade den anden køre først og vise det i god tid, fx ved at sænke farten. Den anden skal ikke ændre fart eller retning for din skyld.' },
  { id: 'hajtaender', label: 'hajtænder', re: word('hajtand|hajtanden|hajtænder|hajtænderne'), en: 'give-way line ("shark teeth")',
    da: 'Hvide trekanter på tværs af vejen. De viser, at du har ubetinget vigepligt, og at du skal holde tilbage ved dem.' },
  { id: 'stoplinje', label: 'stoplinje', re: word('stoplinje|stoplinjen'), en: 'stop line',
    da: 'En hvid streg på tværs af vejen. Ved en STOP-tavle eller rødt lys skal du standse helt før stregen.' },
  { id: 'vognbane', label: 'vognbane', re: word('vognbane|vognbanen|vognbaner|vognbanerne'), en: 'lane',
    da: 'En del af kørebanen til én række køretøjer, typisk afmærket med striber.' },
  { id: 'koerebane', label: 'kørebane', re: word('kørebane|kørebanen|kørebaner'), en: 'carriageway (the road surface for vehicles)',
    da: 'Den del af vejen, der er til kørende trafik. Cykelsti, fortov og rabat hører ikke med.' },
  { id: 'standsning', label: 'standsning', re: word('standsning|standsningen'), en: 'stopping (a short stop)',
    da: 'Når bilen holder stille et kort øjeblik for at lade nogen stige ind eller ud eller for at læsse af og på. Andre ophold er parkering.' },
  { id: 'parkering', label: 'parkering', re: word('parkering|parkeringen|parkere|parkerer|parkeret'), en: 'parking',
    da: 'Når bilen holder stille af andre grunde end at lade nogen stige ind eller ud eller læsse varer. Det gælder, også selv om du bliver i bilen.' },
  { id: 'overhaling', label: 'overhaling', re: word('overhaling|overhalingen|overhale|overhaler'), en: 'overtaking',
    da: 'At køre forbi et køretøj, der kører i samme retning som dig. Som udgangspunkt sker det til venstre.' },
  { id: 'fletning', label: 'fletning', re: word('fletning|fletningen|sammenfletning|sammenfletningen|flette|fletter'), en: 'merging (zip merge)',
    da: 'Når to vognbaner bliver til én, skiftes bilerne til at køre ind, én fra hver bane.' },
  { id: 'cykelsti', label: 'cykelsti', re: word('cykelsti|cykelstien|cykelstier'), en: 'cycle track',
    da: 'En sti langs vejen til cykler og små knallerter, adskilt fra kørebanen med en kant.' },
  { id: 'fodgaengerfelt', label: 'fodgængerfelt', re: word('fodgængerfelt|fodgængerfeltet'), en: 'pedestrian crossing',
    da: 'Et felt med hvide striber, hvor fodgængere krydser vejen. Du skal holde tilbage for fodgængere, der er på vej ud i feltet eller går i det.' },
  { id: 'helle', label: 'helle', re: word('helle|hellen|heller'), en: 'traffic island',
    da: 'En hævet ø på vejen, der deler trafikken eller giver fodgængere et sted at stå, mens de krydser.' },
  { id: 'rabat', label: 'rabat', re: word('rabat|rabatten'), en: 'verge (road shoulder)',
    da: 'Kanten ved siden af kørebanen, ofte græs eller grus. Den hører ikke til kørebanen.' },
  { id: 'spaerrelinje', label: 'spærrelinje', re: word('spærrelinje|spærrelinjen'), en: 'solid line (do not cross)',
    da: 'En fuldt optrukket hvid linje. Du må hverken køre over den eller på den.' },
  { id: 'naerlys', label: 'nærlys', re: word('nærlys|nærlyset'), en: 'dipped headlights (low beam)',
    da: 'Det lys, du normalt kører med. Det lyser vejen op uden at blænde dem, du møder.' },
  { id: 'fjernlys', label: 'fjernlys', re: word('fjernlys|fjernlyset'), en: 'high beam',
    da: 'Det lange lys. Du skal skifte til nærlys, når du møder andre, eller når du kører tæt bag nogen, så du ikke blænder dem.' },
  { id: 'positionslys', label: 'positionslys', re: word('positionslys|positionslyset'), en: 'position lights',
    da: 'Små lygter, der viser, hvor bred bilen er. Du må ikke køre med dem alene.' },
  { id: 'frakendelse', label: 'frakendelse', re: word('frakendelse|frakendelsen|frakendt|frakende'), en: 'licence disqualification',
    da: 'Når retten til at køre bil bliver taget fra dig, betinget eller ubetinget, fx efter alt for høj fart eller spirituskørsel.' },
  { id: 'promille', label: 'promille', re: word('promille|promillen|promillegrænse|promillegrænsen'), en: 'blood alcohol level (per mille)',
    da: 'Hvor meget alkohol der er i blodet. Grænsen er 0,5 promille, men du kan være påvirket, selv om du er under den.' },
  { id: 'reaktionstid', label: 'reaktionstid', re: word('reaktionstid|reaktionstiden'), en: 'reaction time',
    da: 'Tiden fra du ser en fare, til du begynder at bremse. Imens kører bilen videre med samme fart.' },
  { id: 'bremselaengde', label: 'bremselængde', re: word('bremselængde|bremselængden'), en: 'braking distance',
    da: 'Den strækning, bilen kører, fra du træder på bremsen, til den holder stille.' },
  { id: 'standselaengde', label: 'standselængde', re: word('standselængde|standselængden'), en: 'stopping distance',
    da: 'Hele strækningen fra du ser faren, til bilen holder: den strækning, du kører i reaktionstiden, plus bremselængden.' },
  { id: 'blindvinkel', label: 'blind vinkel', re: word('blind vinkel|blinde vinkel|blinde vinkler|døde vinkel'), en: 'blind spot',
    da: 'Et område ved bilen, du ikke kan se i spejlene. Du skal dreje hovedet og kigge.' },
  { id: 'totalvaegt', label: 'tilladt totalvægt', re: word('tilladt totalvægt|tilladte totalvægt|totalvægt|totalvægten'), en: 'permitted maximum weight',
    da: 'Det mest, bilen må veje med passagerer og last. Det står i registreringsattesten. Med kørekort til bil (B) må den højst være 3.500 kg.' },
  { id: 'paahaeng', label: 'påhængskøretøj', re: word('påhængskøretøj|påhængskøretøjet|påhængskøretøjer'), en: 'trailer',
    da: 'Noget, der kobles efter bilen, fx en trailer eller en campingvogn.' },
  { id: 'motorvej', label: 'motorvej', re: word('motorvej|motorvejen|motorveje'), en: 'motorway',
    da: 'En vej kun for motorkøretøjer, der kan og må køre mindst 40 km/t. Der er ingen kryds i samme niveau.' },
  { id: 'noedspor', label: 'nødspor', re: word('nødspor|nødsporet'), en: 'hard shoulder',
    da: 'Sporet yderst til højre på motorvejen. Du må kun bruge det i en nødsituation, fx hvis bilen går i stå.' },
  { id: 'jernbane', label: 'jernbaneoverkørsel', re: word('jernbaneoverkørsel|jernbaneoverkørslen'), en: 'level crossing',
    da: 'Et sted, hvor vejen krydser jernbanen. Du må ikke køre ind, når det røde lys blinker, eller bommene er på vej ned.' },
  { id: 'ensrettet', label: 'ensrettet', re: word('ensrettet|ensrettede'), en: 'one-way',
    da: 'Vejen må kun køres i én retning.' },
  { id: 'paabudt', label: 'påbudt', re: word('påbudt|påbudte|påbud'), en: 'mandatory',
    da: 'Noget, du skal gøre, fx køre i en bestemt retning. Påbud vises på runde, blå tavler.' }
]);

// Når "ubetinget vigepligt" eller "højre vigepligt" står i teksten, viser vi ikke også det løse ord "vigepligt".
const COVERED_BY = { vigepligt: ['ubetinget', 'hoejre'] };
const MAX_CHIPS = 3;

/** De fagord, der står i en tekst, i den rækkefølge de står i listen. Højst tre, så det ikke bliver en mur af knapper. */
export function termsIn(text) {
  const found = TERMS.filter(t => t.re.test(text || ''));
  const ids = new Set(found.map(t => t.id));
  return found.filter(t => !(COVERED_BY[t.id] || []).some(id => ids.has(id))).slice(0, MAX_CHIPS);
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const chipsHtml = terms => terms.length ? `<div class="term-row" data-terms><span class="term-row-label">Svære ord</span>${terms.map(t => `<button type="button" class="term-chip" data-term="${t.id}">${esc(t.label)}</button>`).join('')}</div>` : '';

// Spørgsmålene i Øv (".question-panel") og i lektionerne (".journey-assessment"). Teksten læses fra siden,
// så modulet ikke skal kende appens indhold. Knapperne lægges under konteksten, ikke inde i udsagnene, så et
// tryk aldrig bliver opfattet som et svar.
function decorate(view) {
  if (/^#exam/.test(location.hash) || document.body.classList.contains('exam-active')) return;
  for (const panel of view.querySelectorAll('.question-panel, .journey-assessment')) {
    if (panel.closest('[data-exam-mode]') || panel.querySelector('.exam-selection-note')) continue;
    const anchor = panel.querySelector('.question-context') || panel.querySelector('.journey-exercise-context');
    if (!anchor) continue;
    const text = panel.textContent || '', terms = termsIn(text), key = terms.map(t => t.id).join(',');
    const old = panel.querySelector('[data-terms]');
    if (old?.dataset.key === key) continue;
    old?.remove();
    if (!terms.length) continue;
    anchor.insertAdjacentHTML('afterend', chipsHtml(terms));
    panel.querySelector('[data-terms]').dataset.key = key;
  }
}

function open(id) {
  const t = TERMS.find(x => x.id === id), modal = document.getElementById('modal'), body = document.getElementById('modal-content');
  if (!t || !modal || !body) return;
  body.innerHTML = `<div class="modal-header"><h2 id="modal-title">${esc(t.label)}</h2><button class="icon-btn" data-action="close-modal" aria-label="Luk dialog"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="modal-body term-body"><p>${esc(t.da)}</p><p class="term-en"><span>På engelsk</span> ${esc(t.en)}</p></div>`;
  if (!modal.open) modal.showModal();
}

/** Starter én gang: holder øje med skærmen og pynter nye spørgsmål. */
export function watchGlossary(view = document.getElementById('view')) {
  if (!view || view.dataset.glossary) return;
  view.dataset.glossary = '1';
  let queued = false;
  const run = () => { queued = false; try { decorate(view); } catch { /* ordene er en hjælp, ikke en del af spørgsmålet */ } };
  new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(run); } }).observe(view, { childList: true, subtree: true });
  document.addEventListener('click', e => { const chip = e.target.closest?.('.term-chip'); if (chip) { e.preventDefault(); open(chip.dataset.term); } });
  run();
}
