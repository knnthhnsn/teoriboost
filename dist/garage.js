import { GARAGE } from './garage-content.js';
import { SOURCES } from './content.js';
import {createVoiceCue} from './voice-cues.js';
import {renderArt} from './art.js';
import {garageCaseVoiceParts,garageExplainVoiceParts,garageFeedbackVoiceParts,garageRecallPromptParts,garageRecallAnswerParts,garagePracticalVoiceParts} from './voice-texts.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const source = SOURCES.find(item => item.id === 'plan-b-1-1');
const zones = [
  { id: 'cockpit', title: 'Fra førersædet', caption: 'Betjening, instrumenter og hjælpere', number: '1' },
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
  return `<div class="garage-refs"><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">Undervisningsplanen ↗</a><span>${refs.map(ref => esc(ref)).join(' · ')}</span></div>`;
}

function vehicleGraphic(zone = '') {
  return `<div class="garage-vehicle" data-zone="${esc(zone)}">
    <div class="garage-vehicle-top"><span class="mono">BILENS INDERSIDE / KATEGORI B</span><span class="garage-live">SKEMATISK</span></div>
    <svg class="garage-car" viewBox="0 0 640 465" role="img" aria-labelledby="garage-car-title garage-car-desc">
      <title id="garage-car-title">En bil set oppefra, med en synlig drivlinje under karrosseriet</title>
      <desc id="garage-car-desc">Forenden er øverst. Motor og gear er foran kabinen, bremser sidder ved hjulene. Illustrationen viser en forenklet bil med manuel gearkasse; andre biltyper kan være indrettet anderledes.</desc>
      <defs>
        <linearGradient id="garage-body-paint" x1="0" x2="1"><stop stop-color="#3a76a5"/><stop offset=".48" stop-color="#7aaecb"/><stop offset="1" stop-color="#235778"/></linearGradient>
        <linearGradient id="garage-glass-paint" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#244351"/><stop offset="1" stop-color="#101e27"/></linearGradient>
        <pattern id="garage-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#54666a" stroke-width=".5"/></pattern>
        <clipPath id="garage-body-window"><rect id="garage-body-mask" x="185" y="38" width="220" height="416"/></clipPath>
      </defs>
      <rect x="0" y="0" width="640" height="465" fill="url(#garage-grid)" opacity=".24"/>
      <path d="M167 44v380m260-380v380M157 56h20m-20 354h20m240-354h20m-20 354h20" fill="none" stroke="#78908e" stroke-width="1" stroke-dasharray="4 7"/>
      <text class="garage-graphic-decoration" x="139" y="240" transform="rotate(-90 139 240)" fill="#94a8a6" font-family="monospace" font-size="11" letter-spacing="3">FORSTÅ FØR DU KØRER</text>
      <ellipse cx="299" cy="283" rx="126" ry="164" fill="#060c10" opacity=".35"/>
      <g class="garage-chassis"><path d="M235 70Q295 42 355 70L374 111V381Q295 422 216 381V111Z" fill="#192e34" stroke="#5d777a" stroke-width="2"/>
        <path d="M295 155V364M214 125H376M214 363H376" stroke="#91a5a6" stroke-width="11"/>
        <path d="M295 155V364" stroke="#1f3038" stroke-width="5"/>
        <g class="garage-part garage-part-powertrain"><rect x="255" y="90" width="80" height="58" rx="10" fill="#f7a759" stroke="#ffd3a0" stroke-width="2"/>
          <path d="M269 102v34m13-34v34m13-34v34m13-34v34m13-34v34" stroke="#ac622c" stroke-width="3"/>
          <circle cx="295" cy="157" r="13" fill="#e9d497" stroke="#fff0c7" stroke-width="2"/>
          <rect x="280" y="174" width="30" height="42" rx="5" fill="#75cdb2" stroke="#a5f2d9" stroke-width="2"/>
          <path class="garage-power-flow" d="M295 225V333" fill="none" stroke="#ffa665" stroke-width="3" stroke-dasharray="6 12"/>
        </g>
        <g fill="#101619" stroke="#718386" stroke-width="2"><rect x="194" y="100" width="25" height="54" rx="7"/><rect x="371" y="100" width="25" height="54" rx="7"/><rect x="194" y="337" width="25" height="54" rx="7"/><rect x="371" y="337" width="25" height="54" rx="7"/></g>
        <g class="garage-part garage-part-exterior" fill="#e59b78"><rect x="217" y="111" width="9" height="33" rx="4"/><rect x="364" y="111" width="9" height="33" rx="4"/><rect x="217" y="348" width="9" height="33" rx="4"/><rect x="364" y="348" width="9" height="33" rx="4"/></g>
      </g>
      <g class="garage-body" clip-path="url(#garage-body-window)">
        <path d="M232 61Q295 38 358 61L379 111V379Q367 404 344 411H246Q223 404 211 379V111Z" fill="url(#garage-body-paint)" stroke="#aac9d8" stroke-width="2"/>
        <path d="M232 165L250 184H340L358 165L344 118H246Z" fill="url(#garage-glass-paint)" stroke="#a4bfcb" stroke-width="1.5"/>
        <path d="M250 208H340L352 300H238Z" fill="#6194ae" stroke="#a6c0cb" stroke-width="1.5"/>
        <path d="M238 324L250 350H340L352 324Z" fill="url(#garage-glass-paint)" stroke="#a4bfcb" stroke-width="1.5"/>
        <path d="M225 171v134l10-22V198Zm140 0v134l-10-22V198Z" fill="#192f3b"/>
        <path d="M241 76H349M233 378H357" stroke="#aacbd8" stroke-width="2" opacity=".6"/>
        <path d="M219 164l-22 7v12l20-2m154-17 22 7v12l-20-2" fill="#4f87a2" stroke="#aacbd8"/>
        <path d="M228 79h32m70 0h32" stroke="#ffecd0" stroke-width="7" stroke-linecap="round"/>
        <path d="M224 389h24m94 0h24" stroke="#eb7969" stroke-width="6" stroke-linecap="round"/>
      </g>
      <g class="garage-part garage-part-cockpit"><circle cx="269" cy="198" r="13" fill="#172c37" stroke="#dae5dc" stroke-width="2.5"/><path d="m256 198 13 5 13-5m-13 5v7" stroke="#dae5dc" stroke-width="2" fill="none"/></g>
      <g class="garage-part garage-part-documents" transform="translate(451 267) rotate(7)"><rect width="104" height="129" rx="4" fill="#e0dbc9" stroke="#fff3d4"/><rect x="12" y="14" width="29" height="18" fill="#164451"/><path d="M13 47h77m-77 15h64m-64 15h77m-77 15h48m-48 16h77" stroke="#8e998e" stroke-width="3"/><text x="85" y="32" text-anchor="end" fill="#214b52" font-family="monospace" font-size="18">B</text></g>
      <g fill="none" stroke-width="1.4" class="garage-callouts">
        <path d="M269 198H115L90 166" stroke="#9bbfff"/><path d="M295 123H464L489 89" stroke="#ffb675"/><path d="M384 363H417L438 427" stroke="#79d5b5"/><path d="M503 295H574V244" stroke="#d8cc98"/>
      </g>
      <g class="garage-callout-labels" font-family="monospace" font-size="14" font-weight="bold"><text x="30" y="153" fill="#bad3ff">1 / COCKPIT</text><text x="457" y="73" fill="#ffcc9b">2 / DRIVLINJE</text><text x="430" y="449" fill="#a4ead1">3 / YDERSIDE</text><text x="480" y="227" fill="#eee0ad">4 / PAPIRER</text></g>
      <path d="M295 22V9m-6 6 6-6 6 6" fill="none" stroke="#cad3ca" stroke-width="1.5"/><text x="315" y="20" fill="#a6b4ad" font-size="10" font-family="monospace">FORAN</text>
    </svg>
    <label class="garage-xray"><span><strong>Karrosseri → røntgen</strong><output id="garage-xray-value">0%</output></span><input id="garage-xray" type="range" min="0" max="100" value="0" aria-label="Røntgenvisning af bilens drivlinje" aria-valuetext="Karrosseriet er synligt"></label>
    <p class="garage-graphic-note">Skematisk bil med manuel gearkasse. Placering og udstyr varierer—find delene i din bil med kørelæreren.</p>
  </div>`;
}

function zoneLinks(active = '') {
  return `<nav class="garage-zones" aria-label="Områder i bilen">${zones.map(zone => `<a class="garage-zone ${active === zone.id ? 'selected' : ''}" href="#garage-zone:${zone.id}" ${active === zone.id ? 'aria-current="page"' : ''}><span>${zone.number}</span><div><strong>${zone.title}</strong><small>${zone.caption}</small></div><b aria-hidden="true">↗</b></a>`).join('')}</nav>`;
}

function topicLinks(topics) {
  return `<div class="garage-topics">${topics.map(topic => `<a href="#garage:${esc(topic.id)}" class="garage-topic-link"><span class="mono">${esc(topic.pointRef)}</span><div><strong>${esc(topic.title)}</strong><small>${topic.objectives.length} delmål${topic.objectives.some(physical) ? ' · opgave i bilen' : ''}</small></div><b aria-hidden="true">↗</b></a>`).join('')}</div>`;
}

function overview(zoneId = '') {
  const zone = zones.find(item => item.id === zoneId);
  const topics = zone ? GARAGE.topics.filter(topic => topic.zone === zone.id) : GARAGE.topics;
  return `<section class="garage-page">
    <div class="screen-head"><a class="back-btn" href="#theory" aria-label="Tilbage til teoriatlaset">←</a><div><div class="eyebrow">BILEN FØR TUREN / VÆRKSTED 1</div><h1>GARAGEN.</h1></div><a class="garage-quick-start" href="#garage:kobling">Prøv kobling →</a></div>
    <div class="garage-overview"><div class="garage-overview-art">${vehicleGraphic(zone?.id)}${zoneLinks(zone?.id)}</div>
      <div class="garage-overview-content"><div class="garage-intro art-note"><div class="art-scene">${renderArt('mads-nut',{variant:'garage',humorOnly:true})}</div><span class="mono acid">INDERSIDEN ER OGSÅ PENSUM</span><h2>En bil har ingen<br>“det går nok”-knap.</h2><p>Tag en beslutning. Se systemet bag. Genkald det, før du tager reglen med til den rigtige bil.</p><div class="garage-inventory"><strong>${GARAGE.topics.length}</strong><span>UNDEROMRÅDER FRA<br>UNDERVISNINGSPLANENS KAPITEL 1</span></div></div>
        <div class="garage-list-head"><h2>${zone ? esc(zone.title) : 'Vælg dit næste system'}</h2>${zone ? '<a href="#garage" class="text-link">Se alle 17 ↗</a>' : ''}</div>
        <label class="garage-search"><span class="sr-only">Søg i garagens emner og delmål</span><input id="garage-search" type="search" placeholder="Søg fx kobling, dæk eller ratslør" autocomplete="off"></label>
        <div id="garage-topic-results" data-zone="${esc(zone?.id || '')}">${topicLinks(topics)}</div>
        <div class="garage-physical-summary"><span aria-hidden="true">↗</span><div><strong>Kontrollen skal med ud i bilen.</strong><p>Udpegning, aflæsning og kontrol forberedes her og udføres med kørelæreren.</p><a href="#garage:checklist" class="text-link">Åbn den samlede biltjekliste ↗</a></div></div>
      </div>
    </div>
  </section>`;
}

function caseMarkup(topic) {
  const selected = answers.get(topic.id);
  const answered = selected !== undefined;
  return `<section class="garage-case" aria-labelledby="garage-case-title"><span class="garage-section-label">1 / TAG STILLING FØRST</span><h2 id="garage-case-title">Hvilket svar passer?</h2><p>${esc(topic.case.context)}</p><button class="voice-read" type="button" data-garage-voice="case" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til situationen og mulighederne</button>
    <div class="garage-case-options">${optionOrder(topic).map((option, index) => `<button type="button" class="garage-option ${answered && option.correct ? 'correct' : ''} ${answered && selected === option.id && !option.correct ? 'incorrect' : ''}" data-garage-answer="${esc(option.id)}" data-garage-topic="${esc(topic.id)}" ${answered ? 'disabled' : ''}><span>${answered && option.correct ? '✓' : String(index + 1)}</span><strong>${esc(option.text)}</strong>${answered ? `<small>${esc(option.why)}</small>` : ''}</button>`).join('')}</div>
    <div id="garage-case-feedback" role="status" aria-live="polite">${answered ? `<div class="garage-case-result"><strong>${gradeGarageChoice(topic, selected).correct ? 'Den beslutning passer til situationen.' : 'Se, hvad der ændrer beslutningen.'}</strong><p>Forstå forklaringen, og genkald den bagefter. Dette er en vidensøvelse; den godkender ingen fysisk kontrol.</p>${references([...new Set(topic.case.options.flatMap(option => option.refs))])}<button class="voice-read" type="button" data-garage-voice="feedback" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til vurderingerne</button></div>${hooks[topic.id] ? `<aside class="garage-joke art-scene">${renderArt('mads-nut',{variant:'reaction',humorOnly:true})}<div><span class="mono">MØTRIK-MADS / EN HUSKEKROG</span><p>${esc(hooks[topic.id])}</p><button class="voice-read" type="button" data-garage-voice="hook" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til huskekrogen</button></div></aside>` : ''}<button class="btn btn-secondary garage-retry" data-garage-retry="${esc(topic.id)}">Prøv beslutningen igen ↻</button>` : '<p class="garage-case-note">Et svar åbner forklaringen. Du kan også vælge at læse den først.</p>'}</div>
  </section>`;
}

function topicView(topic) {
  const index = GARAGE.topics.indexOf(topic);
  const next = GARAGE.topics[(index + 1) % GARAGE.topics.length];
  const needsCar = topic.objectives.some(physical);
  return `<article class="garage-page garage-detail">
    <div class="screen-head"><a class="back-btn" href="#garage" aria-label="Tilbage til garagen">←</a><div><div class="eyebrow">GARAGEN / PLANPUNKT ${esc(topic.pointRef)}</div><h1>${esc(topic.title)}</h1></div></div>
    <div class="garage-detail-grid"><div class="garage-detail-main"><div id="garage-current-case">${caseMarkup(topic)}</div>
      <details class="garage-explanation" id="garage-explanation" ${answers.has(topic.id) ? 'open' : ''}><summary><span class="garage-section-label">2 / FORSTÅ SYSTEMET</span><strong>Se forklaringen</strong><span aria-hidden="true">＋</span></summary><div class="garage-explanation-body"><p class="garage-topic-lead">${esc(topic.lead)}</p><button class="voice-read" type="button" data-garage-voice="explanation" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til forklaringen</button>${topic.cards.map(card => `<section class="garage-knowledge-card"><h3>${esc(card.title)}</h3><p>${esc(card.body)}</p>${references(card.refs)}</section>`).join('')}<section class="garage-recall"><span class="garage-section-label">3 / GENKALD UDEN HJÆLP</span><h3>${esc(topic.recall.prompt)}</h3><button class="voice-read" type="button" data-garage-voice="recall" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til spørgsmålet</button><details><summary>Se forklaringen, når du har tænkt</summary><p>${esc(topic.recall.answer)}</p>${references(topic.recall.refs)}<button class="voice-read" type="button" data-garage-voice="recall-answer" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til svaret</button></details><p class="garage-case-note">Forklar med dine egne ord. Dit svar bliver ikke automatisk vurderet.</p></section></div></details>
      <details class="garage-objectives"><summary>Se alle ${topic.objectives.length} delmål og deres krav</summary><ul>${topic.objectives.map(objective => `<li><div><span class="mono">${esc(objective.ref)}</span><span class="garage-requirement ${physical(objective) ? 'physical' : ''}">${esc(objective.requirement)}${physical(objective) ? ' · i bilen' : ''}</span></div><p>${esc(objective.summary)}</p></li>`).join('')}</ul>${references([topic.pointRef])}</details>
    </div><aside class="garage-detail-side">${vehicleGraphic(topic.zone)}
      <section class="garage-practical"><span class="garage-section-label">TAG DET MED TIL BILEN</span><h2>${needsCar ? 'Skal vises i bilen.' : 'Tag forståelsen med.'}</h2><p class="garage-practical-intro">${needsCar ? 'Appen forbereder dig. Udpegning, aflæsning og kontrol trænes med kørelæreren i undervisningsbilen.' : 'Afprøv forståelsen sammen med kørelæreren. Placering og betjening afhænger af bilen.'}</p>${topic.practical.length ? `<ol>${topic.practical.map(step => `<li><strong>${esc(step.title)}</strong><p>${esc(step.action)}</p>${references(step.refs)}</li>`).join('')}</ol>` : ''}<button class="voice-read" type="button" data-garage-voice="practical" data-garage-topic="${esc(topic.id)}" aria-pressed="false">Lyt til opgaven i bilen</button><a class="text-link" href="#garage:checklist">Se den samlede biltjekliste ↗</a></section>
    </aside></div>
    <div class="garage-next"><a class="btn btn-primary" href="#garage:${esc(next.id)}">Næste system: ${esc(next.title)} →</a><a class="text-link" href="#garage">Tilbage til garagen ↗</a></div>
  </article>`;
}

function checklistView() {
  const topics = GARAGE.topics.filter(topic => topic.practical.length && topic.objectives.some(physical));
  return `<article class="garage-page garage-checklist"><div class="screen-head"><a class="back-btn" href="#garage" aria-label="Tilbage til garagen">←</a><div><div class="eyebrow">GARAGEN / TIL NÆSTE KØRETIME</div><h1>Tag kontrollen<br>med til bilen.</h1></div></div><p class="garage-topic-lead">En fælles huskeliste til dig og kørelæreren. Udfør kontrollen i undervisningsbilen efter dens anvisninger. Listen registrerer eller godkender ingen praktisk færdighed.</p><div class="garage-checklist-list">${topics.map(topic => `<section><div class="garage-list-head"><h2>${esc(topic.title)}</h2><a href="#garage:${esc(topic.id)}" class="text-link">Forstå systemet ↗</a></div><ol>${topic.practical.map(step => `<li><strong>${esc(step.title)}</strong><p>${esc(step.action)}</p>${references(step.refs)}</li>`).join('')}</ol></section>`).join('')}</div><a href="#garage" class="btn btn-secondary">Til garagen →</a></article>`;
}

export function renderGarage(id = '', zone = '') {
  if (id === 'checklist') return checklistView();
  if (id) {
    const topic = topicMap.get(id);
    return topic ? topicView(topic) : '<div class="empty-state"><h1>Det system findes ikke.</h1><a href="#garage" class="btn btn-primary">Åbn garagen →</a></div>';
  }
  return overview(zone);
}

export function mountGarage(root, { onAnswer = () => {}, onNarrate = () => {} } = {}) {
  const input = root.querySelector('#garage-xray');
  input?.addEventListener('input', () => {
    const value = Number(input.value);
    root.querySelector('#garage-body-mask').setAttribute('width', String(220 * (1 - value / 100)));
    root.querySelector('#garage-xray-value').textContent = `${value}%`;
    input.setAttribute('aria-valuetext', `${value}% røntgenvisning`);
    root.querySelector('.garage-vehicle').classList.toggle('xray-active', value > 25);
  });
  root.querySelector('#garage-search')?.addEventListener('input', event => {
    const term = event.target.value.trim().toLocaleLowerCase('da-DK');
    const output = root.querySelector('#garage-topic-results');
    const matches = searchGarage(term, output.dataset.zone);
    output.innerHTML = matches.length ? topicLinks(matches) : '<p class="garage-empty" role="status">Ingen emner passer til søgningen. Prøv et andet ord.</p>';
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
