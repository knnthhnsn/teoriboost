import {CHAPTERS} from './content.js';
import {SEQUENCES} from './sequences.js';
import {renderMirrorHero, mountMirrorHero} from './mirror-hero.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storageKey = 'teoriboost.practice.tab';
const tabs = [
  {id:'recommended', title:'Anbefalet', heading:'Anbefalet til dig'},
  {id:'topics', title:'Emner', heading:'Emner'},
  {id:'order', title:'Rækkefølger', heading:'Rækkefølger'},
  {id:'games', title:'Spil', heading:'Spil'}
];
const games = [
  ['judge', 'Du er kørelæreren', 'Find fejlen i en elevs kørsel.'],
  ['trafiklab', 'Trafiklab', 'Øv vigepligt og orientering.'],
  ['drive', 'Gas og bremse', 'Øv gas og bremse i tre situationer.']
];
const subtitles = {
  stop: 'Fuldt stop ved stoptavlen',
  'sving-cykel': 'Se efter cyklister, før du svinger',
  ubetinget: 'Ved hajtænder holder du tilbage'
};
const sections = CHAPTERS.flatMap(chapter => chapter.sections.map(section => ({...section, chapterTitle:chapter.title})));

function card(href, title, description) {
  return `<li><a class="practice-card" href="#${esc(href)}"><strong>${esc(title)}</strong><small>${esc(description)}</small></a></li>`;
}

const signsCard = card('skilte', 'Skilte', 'Alle skiltene, forklaret og øvet');
function cards(type) {
  if (type === 'topics') return signsCard + sections.map(section => card(`mission:${section.id}`, section.title, subtitles[section.id] || section.chapterTitle)).join('');
  if (type === 'order') return SEQUENCES.map(sequence => card(`order:${sequence.id}`, sequence.title, `${sequence.steps.length} trin`)).join('');
  if (type === 'games') return games.map(([href, title, description]) => card(href, title, description)).join('');
  return signsCard + ['stop', 'sving-cykel', 'ubetinget']
    .map(id => sections.find(section => section.id === id))
    .filter(Boolean)
    .map(section => card(`mission:${section.id}`, section.title, subtitles[section.id])).join('');
}

/** The live practice screen; tab state is restored when mounted. */
export function renderPracticeTabs({vm = {}, ready = {}, weak = []} = {}) {
  const daily = vm.daily || {}, count = Array.isArray(weak) ? weak.length : 0;
  const status = count >= 5 ? 'red' : count ? 'yellow' : 'green';
  const title = count ? `${count} ${count === 1 ? 'regel skal gentages' : 'regler skal gentages'}` : 'Hold reglerne varme';
  const detail = count ? 'Start med det, der trænger til lidt mere øvelse.' : 'Tre blandede situationer. Tag dem i dit eget tempo.';
  const action = count ? 'Øv dem nu' :'Tag 3 blandede situationer';
  const mirror = renderMirrorHero({streak:daily.currentStreak, goal:daily.dailyGoal, today:daily.completedSessions, pct:ready.pct, days:null, showCopy:false});
  return `<section class="practice practice-page" aria-labelledby="practice-title">
    <header class="screen-head practice-title"><h1 id="practice-title">Øvelser</h1></header>
    
    <section class="practice-hero" aria-labelledby="practice-hero-title">
      <div class="practice-hero-top"><span>DAGENS TRÆNING</span><span class="practice-status"><img src="assets/nav/light-${status}.webp" alt="">${count ? 'Klar til at øve igen' : 'Klar til at øve'}</span></div>
      ${mirror}
      <div class="practice-primary"><h2 id="practice-hero-title">${esc(title)}</h2><p>${esc(detail)}</p><a class="btn btn-primary practice-main-btn" href="#review">${esc(action)}</a></div>
    </section>
    <section class="practice-choose" aria-labelledby="practice-choose-title">
      <p class="list-label">DIN TRÆNING</p><h2 id="practice-choose-title" class="practice-choose-title">Vælg din træning</h2><p>Nye regler får du i Lær, trin for trin. Her i Øvelser øver du dem, du har lært.</p>
      <div class="practice-tabs" role="tablist" aria-label="Vælg træning" data-practice-tabs>${tabs.map(({id,title}, index) => `<button type="button" role="tab" id="practice-tab-${id}" aria-controls="practice-panel-${id}" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}" data-practice-tab="${id}">${esc(title)}</button>`).join('')}</div>
      ${tabs.map(({id,heading}, index) => `<section class="practice-panel" role="tabpanel" id="practice-panel-${id}" aria-labelledby="practice-tab-${id}" tabindex="0" data-practice-panel="${id}"${index === 0 ? '' : ' hidden'}><h3>${esc(heading)}</h3><ul class="practice-grid">${cards(id)}</ul></section>`).join('')}
    </section>
  </section>`;
}

/** Connect the mirror and accessible, session-persistent tab controls. */
export function mountPracticeTabs(root, {sound = () => {}} = {}) {
  const tablist = root?.querySelector('[data-practice-tabs]');
  if (!tablist) return () => {};
  const buttons = Array.from(tablist.querySelectorAll('[data-practice-tab]'));
  const panels = Array.from(root.querySelectorAll('[data-practice-panel]'));
  const disposeMirror = mountMirrorHero(root.querySelector('.practice-hero .mh'), {sound});
  let active = 'recommended';

  function select(id, {focus = false, persist = true} = {}) {
    if (!buttons.some(button => button.dataset.practiceTab === id)) return;
    active = id;
    for (const button of buttons) {
      const selected = button.dataset.practiceTab === id;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    }
    for (const panel of panels) panel.hidden = panel.dataset.practicePanel !== id;
    if (persist) try { globalThis.sessionStorage?.setItem(storageKey, id); } catch {}
  }

  function onClick(event) {
    const button = event.target.closest('[data-practice-tab]');
    if (button && tablist.contains(button)) select(button.dataset.practiceTab);
  }
  function onKeydown(event) {
    const button = event.target.closest('[data-practice-tab]');
    if (!button || !tablist.contains(button)) return;
    const index = buttons.indexOf(button);
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    select(buttons[next].dataset.practiceTab, {focus:true});
  }

  try { active = globalThis.sessionStorage?.getItem(storageKey) || active; } catch {}
  if (!buttons.some(button => button.dataset.practiceTab === active)) active = 'recommended';
  select(active, {persist:false});
  tablist.addEventListener('click', onClick);
  tablist.addEventListener('keydown', onKeydown);
  return () => {tablist.removeEventListener('click', onClick); tablist.removeEventListener('keydown', onKeydown); disposeMirror();};
}
