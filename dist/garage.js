import { ico } from './ui-icons.js';
import { GARAGE } from './garage-content.js';
import { SOURCES } from './content.js';
import {createVoiceCue} from './voice-cues.js';
import {renderArt} from './art.js';
import {garageCaseVoiceParts,garageExplainVoiceParts,garageFeedbackVoiceParts,garageRecallPromptParts,garageRecallAnswerParts,garagePracticalVoiceParts} from './voice-texts.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const source = SOURCES.find(item => item.id === 'plan-b-1-1');
const zones = [
  { id: 'cockpit', title: 'Fra førersædet', caption: 'Knapper, målere og hjælpere', number: '1' },
  { id: 'powertrain', title: 'Under overfladen', caption: 'Motor, kobling, gear og energi', number: '2' },
  { id: 'exterior', title: 'Rundt om bilen', caption: 'Styring, bremser, lys og udstyr', number: '3' },
  { id: 'documents', title: 'Ansvar og papirer', caption: 'Hvem har ansvaret? Hvad står i attesten?', number: '4' }
];
const answers = new Map();
const orders = new Map();
const hooks = {
  'betjeningsudstyr': 'Bilen er ikke et escape room. Find knapperne, før plottet begynder.',
  'instrumenter-og-kontrollys': 'Advarselslampen har skrevet i gruppechatten. Læs beskeden.',
  'motor-taending-og-speeder': 'Motoren leverer kraft. Din selvtillid er ikke et brændstof.',
  'kobling': 'Motor og hjul kan holde pause fra hinanden. Koblingen styrer relationen.',
  'gear': 'Gearkassen har en plan. “Jeg vibeser bare” er ikke et gear.',
  'foererassistentsystemer': 'Du kan få hjælp fra bilen. Du kan ikke give ansvaret til en NPC.',
  'ansvar-for-bilens-stand': 'Lånt bil. Du har stadig et føreransvar. Gruppechatten tager ikke din køretime.',
  'styreapparat': 'Rattet skal styre bilen. Din tro på mirakler er ikke en reservedel.',
  'bremser': 'Bremsepedalen skal være en bremsepedal. Ikke en elevator mod gulvet.',
  'lygter-reflekser-horn': 'Juletræ vibes er ikke en lygtegodkendelse.',
  'motor-udstoedning-batteri': 'Bilens mystiske røg er ikke en atmosfærisk feature.',
  'energi-og-miljo': 'Forudseenhed: et energihack uden rabatkode.',
  'daek-faelge-baerende-dele': 'Dækket er din kontakt med virkeligheden. Bogstaveligt talt.',
  'karrosseri': 'Bilen må godt have personlighed. Skarpe kanter er ikke en personlighed.',
  'sikkerhedsseler-udsyn-udstyr': 'Udsyn er en feature. En fedtet forrude er et nerf.',
  'saerlige-koeretoejer': 'Kategori B er ikke et “jeg kører alt”-abonnement.',
  'registreringsattest': 'Papirerne kender bilens grænser. Din optimisme gør ikke.'
};
const DONE_KEY = 'teoriboost.garage.done';
const done = new Set();
try { JSON.parse(globalThis.localStorage?.getItem(DONE_KEY) || '[]').forEach(id => done.add(id)); } catch {}
const markDone = id => { done.add(id); try { globalThis.localStorage?.setItem(DONE_KEY, JSON.stringify([...done])); } catch {} };
if (typeof document !== 'undefined' && !document.getElementById('garage-x-css')) {
  const link = document.createElement('link');
  link.id = 'garage-x-css'; link.rel = 'stylesheet'; link.href = 'garage-x.css';
  document.head.append(link);
}
const physical = objective => ['udpege', 'aflæse og forstå', 'kontrollere'].includes(objective.requirement);
export { hooks as GARAGE_HOOKS };
const topicMap = new Map(GARAGE.topics.map(topic => [topic.id, topic]));
export const garageSummary = { topics: GARAGE.topics.length, objectives: GARAGE.topics.reduce((sum, topic) => sum + topic.objectives.length, 0) };

export function searchGarage(value, zone = '') {
  const term = String(value || '').trim().toLocaleLowerCase('da-DK');
  return GARAGE.topics.filter(topic => (!zone || topic.zone === zone) && [topic.title, topic.lead, topic.pointRef, ...topic.objectives.map(objective => objective.summary), ...topic.cards.map(card => card.body)].join(' ').toLocaleLowerCase('da-DK').includes(term));
}

export function gradeGarageChoice(topic, id) {
  const option = topic?.case?.options.find(item => item.id === id);
  return option ? { correct: option.correct, why: option.why, refs: option.refs } : null;
}

function optionOrder(topic) {
  if (!orders.has(topic.id)) {
    const ids = topic.case.options.map(option => option.id);
    for (let index = ids.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [ids[index], ids[other]] = [ids[other], ids[index]];
    }
    orders.set(topic.id, ids);
  }
  return orders.get(topic.id).map(id => topic.case.options.find(option => option.id === id));
}

function references(refs) {
  return `<div class="garage-refs"><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">Undervisningsplanen</a><span>${refs.map(ref => esc(ref)).join(' <span class="tb-stripes" aria-hidden="true"></span> ')}</span></div>`;
}

const chev = dir => `<svg class="gx-chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${dir === 'left' ? 'M14.5 6 8.5 12l6 6' : 'M9.5 6l6 6-6 6'}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const topicsOf = zoneId => GARAGE.topics.filter(topic => topic.zone === zoneId);
const doneIn = list => list.filter(topic => done.has(topic.id)).length;
const nextTopic = () => GARAGE.topics.find(topic => !done.has(topic.id)) || null;
const firstOpenZone = () => (zones.find(zone => topicsOf(zone.id).some(topic => !done.has(topic.id))) || zones[0]).id;

/* Pin positions in percent of the stage: [x, y] on the drawn car, [x, y] on the blueprint. */
const PINS = {
  cockpit: { out: [56, 39, 'r'], bp: [40, 42, 'r'] },
  powertrain: { out: [71, 49, 'b'], bp: [45, 22, 'r'] },
  exterior: { out: [53, 64, 'r'], bp: [63, 84, 'l'] },
  documents: { out: [19, 79, 'r'], bp: [87, 76, 'l'] }
};

function pinSet(view, active) {
  return `<div class="gx-pins" data-pins="${view}" ${view === 'bp' ? 'hidden' : ''}>${zones.map(zone => {
    const [x, y, place] = PINS[zone.id][view];
    return `<button type="button" class="gx-pin gx-pin--${place}" style="left:${x}%;top:${y}%" data-gx-zone="${zone.id}" aria-pressed="${active === zone.id}" aria-label="${esc(zone.title)}, område ${zone.number}"><span class="gx-pin-dot">${zone.number}</span><span class="gx-pin-label">${esc(zone.title)}</span></button>`;
  }).join('')}</div>`;
}

function blueprint() {
  return `<svg class="gx-bp" viewBox="70 30 500 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Bilen set oppefra med motor, gear og drivaksel synlig. Forenden er øverst.">
    <defs><pattern id="gx-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#3A434C" stroke-width=".7"/></pattern></defs>
    <rect x="70" y="30" width="500" height="400" fill="url(#gx-grid)"/>
    <path d="M167 44v380m260-380v380M157 56h20m-20 354h20m240-354h20m-20 354h20" fill="none" stroke="#5F656D" stroke-width="1.2" stroke-dasharray="4 7"/>
    <ellipse cx="299" cy="283" rx="130" ry="168" fill="#0F1215" opacity=".5"/>
    <g class="gx-chassis"><path d="M235 70Q295 42 355 70L374 111V381Q295 422 216 381V111Z" class="gx-chassis-fill"/>
      <path d="M295 155V364M214 125H376M214 363H376" stroke="#C2CCD6" stroke-width="10" fill="none"/>
      <g class="gx-wheels"><rect x="194" y="100" width="25" height="54" rx="7"/><rect x="371" y="100" width="25" height="54" rx="7"/><rect x="194" y="337" width="25" height="54" rx="7"/><rect x="371" y="337" width="25" height="54" rx="7"/></g>
      <g class="gx-part gx-part-exterior"><rect x="217" y="111" width="9" height="33" rx="4"/><rect x="364" y="111" width="9" height="33" rx="4"/><rect x="217" y="348" width="9" height="33" rx="4"/><rect x="364" y="348" width="9" height="33" rx="4"/></g>
      <g class="gx-part gx-part-powertrain"><rect x="255" y="90" width="80" height="58" rx="10"/><path d="M269 102v34m13-34v34m13-34v34m13-34v34m13-34v34" class="gx-detail"/><circle cx="295" cy="157" r="13"/><rect x="280" y="174" width="30" height="42" rx="5"/><path class="gx-power-flow" d="M295 225V333" fill="none" stroke-width="4" stroke-dasharray="6 12"/></g>
    </g>
    <path class="gx-shell" d="M232 61Q295 38 358 61L379 111V379Q367 404 344 411H246Q223 404 211 379V111Z"/>
    <path class="gx-glass" d="M232 165L250 184H340L358 165L344 118H246ZM238 324L250 350H340L352 324Z"/>
    <g class="gx-part gx-part-cockpit"><circle cx="269" cy="198" r="14"/><path d="m256 198 13 5 13-5m-13 5v8" fill="none" class="gx-detail"/></g>
    <g class="gx-part gx-part-documents" transform="translate(451 267) rotate(7)"><rect width="104" height="129" rx="6"/><rect x="12" y="14" width="29" height="18" class="gx-detail-fill"/><path d="M13 47h77m-77 15h64m-64 15h77m-77 15h48m-48 16h77" class="gx-detail"/></g>
  </svg>`;
}

/* The stage: the drawn car outside, the blueprint inside, and a slider that wipes between them. */
function stage(active, { interactive = true } = {}) {
  return `<div class="gx-stage" data-zone="${esc(active)}" style="--reveal:0%">
    <div class="gx-floor" aria-hidden="true"></div>
    <div class="gx-layer gx-layer-out"><img class="gx-car" src="assets/garage/nordic.webp" width="1280" height="853" alt="Bilen set skråt udefra. Tallene 1 til 4 viser områderne i bilen." decoding="async"><svg class="gx-paper gx-part gx-part-documents" viewBox="0 0 104 129" aria-hidden="true"><rect width="104" height="129" rx="6"/><rect x="12" y="14" width="29" height="18" class="gx-detail-fill"/><path d="M13 47h77m-77 15h64m-64 15h77m-77 15h48m-48 16h77" class="gx-detail"/></svg><div class="gx-focus" aria-hidden="true"></div></div>
    ${interactive ? `<div class="gx-layer gx-layer-in">${blueprint()}</div><div class="gx-wipe" aria-hidden="true"></div>` : ''}
    ${pinSet('out', active)}${interactive ? pinSet('bp', active) : ''}
  </div>`;
}

function xrayControl() {
  return `<div class="gx-xray"><div class="gx-seg" role="group" aria-label="Vis bilen udefra eller indefra"><button type="button" class="gx-seg-btn" data-gx-view="0" aria-pressed="true">Udefra</button><button type="button" class="gx-seg-btn" data-gx-view="100" aria-pressed="false">Indeni</button></div>
    <label class="gx-slider"><span class="sr-only">Træk for at se ind under karrosseriet</span><input id="garage-xray" type="range" min="0" max="100" value="0" aria-valuetext="Bilen set udefra"></label></div>`;
}

function topicRow(topic) {
  const isDone = done.has(topic.id);
  return `<a href="#garage:${esc(topic.id)}" class="gx-row ${isDone ? 'is-done' : ''}"><span class="gx-row-mark" aria-hidden="true">${isDone ? ico('check') : esc(topic.pointRef)}</span><span class="gx-row-text"><strong>${esc(topic.title)}</strong><small>${topic.objectives.length} delmål${topic.objectives.some(physical) ? ' · øves i bilen' : ''}${isDone ? ' · gennemgået' : ''}</small></span><span class="gx-go" aria-hidden="true">${chev('right')}</span></a>`;
}

function panel(zoneId) {
  const zone = zones.find(item => item.id === zoneId) || zones[0];
  const list = topicsOf(zone.id), count = doneIn(list), pct = Math.round(count / list.length * 100);
  return `<span class="gx-eyebrow">OMRÅDE ${zone.number} AF ${zones.length}</span><h2 class="gx-panel-title">${esc(zone.title)}</h2><p class="gx-panel-lead">${esc(zone.caption)}</p>
    <div class="gx-progress" role="img" aria-label="${count} af ${list.length} systemer gennemgået"><span style="width:${pct}%"></span></div><p class="gx-progress-note">${count} af ${list.length} gennemgået</p>
    <div class="gx-rows">${list.map(topicRow).join('')}</div>`;
}

function zoneTabs(active) {
  return `<div class="gx-tabs" role="group" aria-label="Områder i bilen">${zones.map(zone => {
    const list = topicsOf(zone.id);
    return `<button type="button" class="gx-tab" data-gx-zone="${zone.id}" aria-pressed="${active === zone.id}"><span class="gx-tab-n">${zone.number}</span><span class="gx-tab-text"><strong>${esc(zone.title)}</strong><small>${doneIn(list)} af ${list.length}</small></span></button>`;
  }).join('')}</div>`;
}

function topicCard(topic) {
  const isDone = done.has(topic.id);
  return `<a href="#garage:${esc(topic.id)}" class="gx-card ${isDone ? 'is-done' : ''}"><span class="gx-card-ref">${esc(topic.pointRef)}</span><strong>${esc(topic.title)}</strong><small>${topic.objectives.length} delmål${topic.objectives.some(physical) ? ' · øves i bilen' : ''}</small><span class="gx-card-state">${isDone ? `${ico('check')}Gennemgået` : 'Ikke startet'}</span></a>`;
}

function topicLinks(topics) {
  return `<div class="gx-cards">${topics.map(topicCard).join('')}</div>`;
}

function head(backHref, backLabel, eyebrow, title, extra = '') {
  return `<header class="gx-head"><a class="gx-back" href="${backHref}" aria-label="${esc(backLabel)}">${chev('left')}</a><div class="gx-head-text"><div class="gx-eyebrow">${eyebrow}</div><h1>${title}</h1></div>${extra}</header>`;
}

function overview(zoneId = '') {
  const active = zones.some(zone => zone.id === zoneId) ? zoneId : firstOpenZone();
  const total = GARAGE.topics.length, finished = doneIn(GARAGE.topics), next = nextTopic();
  const score = `<div class="gx-score" role="img" aria-label="${finished} af ${total} systemer gennemgået"><strong>${finished}</strong><span>af ${total}<br>gennemgået</span></div>`;
  return `<section class="garage-page gx-page" data-active="${active}">
    ${head('#theory', 'Tilbage til teorien', 'BILEN FØR TUREN', 'GARAGEN', score)}
    <div class="gx-hero">
      <div class="gx-hero-left">${stage(active)}${xrayControl()}${zoneTabs(active)}</div>
      <div class="gx-panel" id="gx-panel" aria-live="polite">${panel(active)}</div>
    </div>
    <div class="gx-next ${next ? '' : 'is-all'}">
      <div class="gx-next-text"><span class="gx-eyebrow">${next ? 'DIT NÆSTE SYSTEM' : 'ALT GENNEMGÅET'}</span><h2>${next ? esc(next.title) : 'Du er klar til biltjeklisten'}</h2><p>${next ? esc(next.lead) : 'Hele bilen er gennemgået. Næste skridt er biltjeklisten sammen med kørelæreren.'}</p>
        <a class="gx-btn" href="${next ? `#garage:${esc(next.id)}` : '#garage:checklist'}">${next ? 'Start systemet' : 'Åbn biltjeklisten'}<span class="gx-go" aria-hidden="true">${chev('right')}</span></a></div>
      <img class="gx-next-daek" src="assets/cast/daek.webp" alt="" aria-hidden="true" width="512" height="512" loading="lazy" decoding="async">
    </div>
    <div class="gx-list-head"><h2>Alle ${total} systemer</h2></div>
    <label class="gx-search"><span class="sr-only">Søg i garagens emner og delmål</span><input id="garage-search" type="search" placeholder="Søg fx kobling, dæk eller ratslør" autocomplete="off"></label>
    <div id="garage-topic-results" data-zone="">${topicLinks(GARAGE.topics)}</div>
    <a class="gx-check" href="#garage:checklist"><span class="gx-check-ico" aria-hidden="true">${ico('clipboard')}</span><span><strong>Kontrollen skal med ud i bilen</strong><small>Øv udpegning, aflæsning og kontrol her. Den rigtige kontrol laver du med kørelæreren.</small></span><span class="gx-go" aria-hidden="true">${chev('right')}</span></a>
  </section>`;
}

function steps(topic) {
  const answered = answers.has(topic.id);
  return `<ol class="gx-steps" aria-label="Sådan gennemgår du systemet"><li class="${answered ? 'is-done' : 'is-now'}"><span>${answered ? ico('check') : '1'}</span>Tag stilling</li><li class="${answered ? 'is-now' : ''}"><span>2</span>Forstå systemet</li><li><span>3</span>Hvad husker du?</li></ol>`;
}

function miniCar(topic) {
  const zone = zones.find(item => item.id === topic.zone);
  return `<div class="gx-mini"><div class="gx-mini-top"><span class="gx-eyebrow">HER SIDDER DET</span><strong>${esc(zone?.title || '')}</strong></div>${stage(topic.zone, { interactive: false })}</div>`;
}

function caseMarkup(topic) {
  const selected = answers.get(topic.id);
  const answered = selected !== undefined;
  return `<section class="garage-case" aria-labelledby="garage-case-title"><span class="garage-section-label">1 / TAG STILLING FØRST</span><h2 id="garage-case-title">Hvilket svar passer?</h2><p>${esc(topic.case.context)}</p><button class="voice-read" type="button" data-garage-voice="case" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til situationen og mulighederne</button>
    <div class="garage-case-options">${optionOrder(topic).map((option, index) => `<button type="button" class="garage-option ${answered && option.correct ? 'correct' : ''} ${answered && selected === option.id && !option.correct ? 'incorrect' : ''}" data-garage-answer="${esc(option.id)}" data-garage-topic="${esc(topic.id)}" ${answered ? 'disabled' : ''}><span>${answered && option.correct ? ico('check') : String(index + 1)}</span><strong>${esc(option.text)}</strong>${answered ? `<small>${esc(option.why)}</small>` : ''}</button>`).join('')}</div>
    <div id="garage-case-feedback" role="status" aria-live="polite">${answered ? `<div class="garage-case-result"><strong>${gradeGarageChoice(topic, selected).correct ? 'Godt valgt! Det passer til situationen.' : 'Ikke helt. Læs, hvad der ændrer svaret.'}</strong><p>Læs forklaringen, og prøv at huske den bagefter. Det her øver viden, ikke en fysisk kontrol.</p>${references([...new Set(topic.case.options.flatMap(option => option.refs))])}<button class="voice-read" type="button" data-garage-voice="feedback" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til vurderingerne</button></div>${hooks[topic.id] ? `<aside class="garage-joke art-scene">${renderArt('daek',{variant:'reaction',humorOnly:true})}<div><span class="mono">DÆK / EN HUSKEKROG</span><p>${esc(hooks[topic.id])}</p><button class="voice-read" type="button" data-garage-voice="hook" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til huskekrogen</button></div></aside>` : ''}<button class="btn btn-secondary garage-retry" data-garage-retry="${esc(topic.id)}">Prøv igen</button>` : '<p class="garage-case-note">Svar, så åbner forklaringen. Du kan også læse den først.</p>'}</div>
  </section>`;
}

function topicView(topic) {
  const index = GARAGE.topics.indexOf(topic);
  const next = GARAGE.topics[(index + 1) % GARAGE.topics.length];
  const needsCar = topic.objectives.some(physical);
  return `<article class="garage-page gx-page garage-detail">
    ${head('#garage', 'Tilbage til garagen', `GARAGEN / PLANPUNKT ${esc(topic.pointRef)}`, esc(topic.title))}${steps(topic)}
    <div class="garage-detail-grid"><div class="garage-detail-main"><div id="garage-current-case">${caseMarkup(topic)}</div>
      <details class="garage-explanation" id="garage-explanation" ${answers.has(topic.id) ? 'open' : ''}><summary><span class="garage-section-label">2 / FORSTÅ SYSTEMET</span><strong>Se forklaringen</strong><span aria-hidden="true">＋</span></summary><div class="garage-explanation-body"><p class="garage-topic-lead">${esc(topic.lead)}</p><button class="voice-read" type="button" data-garage-voice="explanation" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til forklaringen</button>${topic.cards.map(card => `<section class="garage-knowledge-card"><h3>${esc(card.title)}</h3><p>${esc(card.body)}</p>${references(card.refs)}</section>`).join('')}<section class="garage-recall"><span class="garage-section-label">3 / HVAD HUSKER DU?</span><h3>${esc(topic.recall.prompt)}</h3><button class="voice-read" type="button" data-garage-voice="recall" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til spørgsmålet</button><details><summary>Se svaret, når du har prøvet</summary><p>${esc(topic.recall.answer)}</p>${references(topic.recall.refs)}<button class="voice-read" type="button" data-garage-voice="recall-answer" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til svaret</button></details><p class="garage-case-note">Sig det med dine egne ord. Appen vurderer ikke svaret.</p></section></div></details>
      <details class="garage-objectives"><summary>Se alle ${topic.objectives.length} delmål og deres krav</summary><ul>${topic.objectives.map(objective => `<li><div><span class="mono">${esc(objective.ref)}</span><span class="garage-requirement ${physical(objective) ? 'physical' : ''}">${esc(objective.requirement)}${physical(objective) ? ' <span class="tb-stripes" aria-hidden="true"></span> i bilen' : ''}</span></div><p>${esc(objective.summary)}</p></li>`).join('')}</ul>${references([topic.pointRef])}</details>
    </div><aside class="garage-detail-side">${miniCar(topic)}
      <section class="garage-practical"><span class="garage-section-label">TAG DET MED I BILEN</span><h2>${needsCar ? 'Skal vises i bilen' : 'Tag forståelsen med dig'}</h2><p class="garage-practical-intro">${needsCar ? 'Appen gør dig klar. Øvelsen i bilen laver du med kørelæreren.' : 'Øv det sammen med kørelæreren. Placering og betjening afhænger af bilen.'}</p>${topic.practical.length ? `<ol>${topic.practical.map(step => `<li><strong>${esc(step.title)}</strong><p>${esc(step.action)}</p>${references(step.refs)}</li>`).join('')}</ol>` : ''}<button class="voice-read" type="button" data-garage-voice="practical" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til opgaven i bilen</button><a class="text-link" href="#garage:checklist">Se den samlede biltjekliste</a></section>
    </aside></div>
    <div class="garage-next"><a class="btn btn-primary" href="#garage:${esc(next.id)}">Næste system: ${esc(next.title)}</a><a class="text-link" href="#garage">Tilbage til garagen</a></div>
  </article>`;
}

function checklistView() {
  const topics = GARAGE.topics.filter(topic => topic.practical.length && topic.objectives.some(physical));
  return `<article class="garage-page gx-page garage-checklist">${head('#garage', 'Tilbage til garagen', 'GARAGEN / TIL NÆSTE KØRETIME', 'Kontrollen<br>med i bilen')}<p class="garage-topic-lead">En huskeliste til dig og kørelæreren. Lav kontrollen i bilen, som bilens egne anvisninger beskriver. Listen registrerer eller godkender ingen praktisk færdighed.</p><div class="garage-checklist-list">${topics.map(topic => `<section><div class="garage-list-head"><h2>${esc(topic.title)}</h2><a href="#garage:${esc(topic.id)}" class="text-link">Forstå systemet</a></div><ol>${topic.practical.map(step => `<li><strong>${esc(step.title)}</strong><p>${esc(step.action)}</p>${references(step.refs)}</li>`).join('')}</ol></section>`).join('')}</div><a href="#garage" class="btn btn-secondary">Til garagen</a></article>`;
}

export function renderGarage(id = '', zone = '') {
  if (id === 'checklist') return checklistView();
  if (id) {
    const topic = topicMap.get(id);
    return topic ? topicView(topic) : '<div class="empty-state"><h1>Vi kunne ikke finde systemet lige nu.</h1><a href="#garage" class="btn btn-primary">Åbn garagen</a></div>';
  }
  return overview(zone);
}

let car3d = [];
export function mountGarage(root, { onAnswer = () => {}, onNarrate = () => {} } = {}) {
  car3d.forEach(handle => handle.dispose()); car3d = [];
  let main3d = null;
  import('./garage-3d.js').then(async ({ mountCar3d }) => {
    for (const el of root.querySelectorAll('.gx-stage')) {
      const mini = !!el.closest('.gx-mini');
      const handle = await mountCar3d(el, { interactive: !mini, zone: mini ? (el.dataset.zone || '') : '' });
      if (!handle) continue;
      if (!root.isConnected) { handle.dispose(); continue; }
      car3d.push(handle); if (!mini) main3d = handle;
    }
  }).catch(() => {});
  // name pills stay inside the card and off other dots, also when the 3D car does not load (the flat drawing)
  import('./garage-labels.js').then(({ placeLabels }) => { const labels = placeLabels(root); if (root.isConnected) car3d.push(labels); else labels.dispose(); }).catch(() => {});
  const stageEl = root.querySelector('.gx-stage');
  const input = root.querySelector('#garage-xray');
  const reduced = () => document.body.classList.contains('no-motion') || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const setReveal = value => {
    if (!stageEl) return;
    stageEl.style.setProperty('--reveal', `${value}%`);
    const inside = value >= 50;
    if (main3d) { main3d.setXray(value / 100); stageEl.toggleAttribute('data-mid', false); root.querySelectorAll('[data-gx-view]').forEach(btn => btn.setAttribute('aria-pressed', String((Number(btn.dataset.gxView) >= 50) === inside))); if (input) { input.value = String(value); input.setAttribute('aria-valuetext', value >= 100 ? 'Bilen set indefra' : value <= 0 ? 'Bilen set udefra' : `${value}% indefra`); } return; }
    stageEl.dataset.view = inside ? 'in' : 'out';
    stageEl.toggleAttribute('data-mid', value > 0 && value < 100);
    root.querySelector('[data-pins="out"]')?.toggleAttribute('hidden', inside);
    root.querySelector('[data-pins="bp"]')?.toggleAttribute('hidden', !inside);
    root.querySelectorAll('[data-gx-view]').forEach(btn => btn.setAttribute('aria-pressed', String((Number(btn.dataset.gxView) >= 50) === inside)));
    if (input) { input.value = String(value); input.setAttribute('aria-valuetext', value >= 100 ? 'Bilen set indefra' : value <= 0 ? 'Bilen set udefra' : `${value}% indefra`); }
  };
  let tween = 0;
  const glideTo = target => {
    cancelAnimationFrame(tween);
    const from = Number(input?.value || 0);
    if (reduced() || from === target) { setReveal(target); return; }
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / 420), eased = 1 - Math.pow(1 - k, 3);
      setReveal(Math.round(from + (target - from) * eased));
      if (k < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  };
  input?.addEventListener('input', () => { cancelAnimationFrame(tween); setReveal(Number(input.value)); });
  const selectZone = zoneId => {
    if (!stageEl) return;
    stageEl.dataset.zone = zoneId; stageEl.dataset.touched = '1';
    root.querySelector('.gx-page')?.setAttribute('data-active', zoneId);
    root.querySelectorAll('[data-gx-zone]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.gxZone === zoneId)));
    if (main3d) { main3d.setZone(zoneId, { withXray: false }); const want = zoneId === 'powertrain' ? 100 : zoneId === 'cockpit' ? 60 : 0; glideTo(want); }
    const target = root.querySelector('#gx-panel');
    target.innerHTML = panel(zoneId);
    target.classList.remove('gx-swap'); void target.offsetWidth; target.classList.add('gx-swap');
  };
  root.addEventListener('click', event => {
    const pin = event.target.closest('[data-gx-zone]');
    if (pin && stageEl) { selectZone(pin.dataset.gxZone); return; }
    const view = event.target.closest('[data-gx-view]');
    if (view) glideTo(Number(view.dataset.gxView));
  });
  root.querySelector('#garage-search')?.addEventListener('input', event => {
    const term = event.target.value.trim().toLocaleLowerCase('da-DK');
    const output = root.querySelector('#garage-topic-results');
    const matches = searchGarage(term, output.dataset.zone);
    output.innerHTML = matches.length ? topicLinks(matches) : '<p class="garage-empty" role="status">Ingen emner passer til din søgning. Prøv et andet ord.</p>';
  });
  root.addEventListener('click', event => {
    const read = event.target.closest('[data-garage-voice]');
    if (read) {
      if (read.closest('details:not([open])') || read.closest('[hidden]') || !read.getClientRects().length) return;
      const topic = topicMap.get(read.dataset.garageTopic);
      if (!topic) return;
      const kind = read.dataset.garageVoice, ids = optionOrder(topic).map(option => option.id);
      let parts = [];
      if (kind === 'case') parts = garageCaseVoiceParts(topic, ids);
      else if (kind === 'explanation') parts = garageExplainVoiceParts(topic);
      else if (kind === 'feedback' && answers.has(topic.id)) parts = garageFeedbackVoiceParts(topic, ids);
      else if (kind === 'recall') parts = garageRecallPromptParts(topic);
      else if (kind === 'recall-answer') parts = garageRecallAnswerParts(topic);
      else if (kind === 'practical') parts = garagePracticalVoiceParts(topic);
      else if (kind === 'hook' && answers.has(topic.id) && !document.body.classList.contains('calm')) parts = [hooks[topic.id]];
      const optionRows = [...root.querySelectorAll('.garage-option')];
      const cueRows = kind === 'case' ? [root.querySelector('.garage-case>p'), ...optionRows.flatMap(row => [row, row])]
        : kind === 'feedback' ? optionRows.flatMap(row => [row, row, row, row]) : [];
      if (parts.length) onNarrate(parts, { label: read.textContent.trim(), trigger: read, onPart: createVoiceCue(cueRows) });
      return;
    }
    const button = event.target.closest('[data-garage-answer]');
    if (button) {
      const topic = topicMap.get(button.dataset.garageTopic);
      const grade = gradeGarageChoice(topic, button.dataset.garageAnswer);
      if (!grade || answers.has(topic.id)) return;
      answers.set(topic.id, button.dataset.garageAnswer);
      markDone(topic.id);
      const rail = root.querySelector('.gx-steps');
      if (rail) rail.outerHTML = steps(topic);
      root.querySelector('#garage-current-case').innerHTML = caseMarkup(topic);
      root.querySelector('#garage-explanation').open = true;
      onAnswer(grade.correct);
      root.querySelector('#garage-case-feedback').setAttribute('tabindex', '-1');
      root.querySelector('#garage-case-feedback').focus({ preventScroll: true });
      return;
    }
    const retry = event.target.closest('[data-garage-retry]');
    if (retry) {
      const topic = topicMap.get(retry.dataset.garageRetry);
      if (!topic) return;
      answers.delete(topic.id);
      orders.delete(topic.id);
      root.querySelector('#garage-current-case').innerHTML = caseMarkup(topic);
      root.querySelector('#garage-explanation').open = false;
      root.querySelector('.garage-option')?.focus({ preventScroll: true });
    }
  });
}
