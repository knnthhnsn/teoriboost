import {setBrandText} from './ui-stripes.js';
import {mountWildlife} from './wildlife-ui.js';
import { SOURCES } from './content.js';
import { createJudgeWorld } from './judge-world.js';
import {createVoiceCue} from './voice-cues.js';
import {judgeVoiceParts,JUDGE_INTRO_VOICE} from './voice-texts.js';
import { ico } from './ui-icons.js';

const SOURCE_BY_ID = new Map(SOURCES.map(source => [source.id, source]));
const SHORT_SOURCE = Object.freeze({
  'afmaerkning': 'Vejafmærkningsbekendtgørelsen',
  'fl-2026': 'Færdselsloven',
  'plan-b-1-1': 'Undervisningsplan kategori B',
});

const CASES = Object.freeze([
  {
    id: 'judge-stop', sectionId: 'stop', scene: 'stop', short: 'STOP',
    title: 'Den rullende STOP-linje',
    setup: 'Bilen nærmer sig B 13 i lav fart. Sidevejen er tom, men føreren ruller over stoplinjen.',
    clipLabel: 'Bilen ruller over linjen uden fuldt stop',
    excuse: '“Jeg lavede et administrativt stop. Stop & Søn kalder det flydende papirarbejde.”',
    issuePrompt: 'Peg på det afgørende problem i klippet.',
    issue: [
      { id:'stop-line', label:'Stoplinjen', world:[2,.1,4.15], offset:[-.11,-.03], fallback:[47,66], correct:true },
      { id:'empty-road', label:'Vognbanens placering', world:[2,.1,6.6], offset:[-.16,-.14], fallback:[68,29], correct:false },
      { id:'streetlamp', label:'Bilens kørselsretning', anchor:'own', offset:[.22,-.15], fallback:[18,25], correct:false },
    ],
    rulePrompt: 'Hvilken regel skal føreren bruge?',
    rules: [
      { id:'full-stop', label:'Fuld standsning ved linjen. Derefter orientering og ubetinget vigepligt.', correct:true },
      { id:'slow-enough', label:'Langsom passage ved linjen. Et overskueligt kryds kræver kun orientering.', correct:false },
      { id:'traffic-only', label:'Fuld standsning, hvis der er trafik. Ellers orientering og langsom passage.', correct:false },
    ],
    placePrompt: 'Placér bilen, hvor det pligtige stop skal ske.',
    places: [
      { id:'before-line', label:'Helt før stoplinjen', world:[2,.1,6.1], fallback:[49,72], correct:true },
      { id:'on-crossing', label:'Midt i krydset', world:[2,.1,0], fallback:[49,45], correct:false },
      { id:'after-line', label:'Efter stoplinjen', world:[2,.1,3.2], fallback:[49,57], correct:false },
    ],
    explanation: 'B 13 betyder fuldt stop ved stoplinjen. Et tomt kryds ophæver ikke stoppligten; efter stoppet gælder den ubetingede vigepligt stadig.',
    sourceIds: ['afmaerkning','fl-2026','plan-b-1-1'],
  },
  {
    id: 'judge-yield', sectionId: 'ubetinget', scene: 'yield', short: 'B 11',
    title: 'Hajtænder med tværtrafik',
    setup: 'Bilen nærmer sig B 11 og hajtænder. En anden bil kommer fra venstre på den vej, der skal krydses.',
    clipLabel: 'Bilen fortsætter over hajtænderne mod tværtrafikken',
    excuse: '“Jeg så hajtænderne. Jeg troede bare, de var kommunens tandlægeregning.”',
    issuePrompt: 'Peg på det vigtigste problem i klippet.',
    issue: [
      { id:'yield-line', label:'Hajtænderne', world:[2,.1,4.05], offset:[-.12,-.03], fallback:[48,66], correct:true },
      { id:'other-headlamp', label:'Tværbilens vognbane', anchor:'other', offset:[-.12,-.06], fallback:[24,42], correct:false },
      { id:'road-edge', label:'Egen bils placering', anchor:'own', offset:[.15,.02], fallback:[78,77], correct:false },
    ],
    rulePrompt: 'Hvilken regel beskriver situationen?',
    rules: [
      { id:'unconditional', label:'Hold tilbage for tværtrafikken. Den må ikke tvinges til at ændre fart eller placering.', correct:true },
      { id:'right-only', label:'Hold tilbage for trafik fra højre. Trafik fra venstre må afvente din passage.', correct:false },
      { id:'signal-priority', label:'Vis retningen med blinklys i god tid. Derefter får du ret til at køre først.', correct:false },
    ],
    placePrompt: 'Placér bilen, mens tværtrafikken passerer.',
    places: [
      { id:'behind-teeth', label:'Bag hajtænderne', world:[2,.1,6], fallback:[49,74], correct:true },
      { id:'across-path', label:'På tværtrafikkens bane', world:[2,.1,1.7], fallback:[49,46], correct:false },
      { id:'past-teeth', label:'Forbi hajtænderne', world:[2,.1,3], fallback:[49,58], correct:false },
    ],
    explanation: 'Ved B 11 og hajtænder har føreren ubetinget vigepligt. Bilen skal vente, så den krydsende trafik kan fortsætte uden at ændre fart eller placering.',
    sourceIds: ['afmaerkning','fl-2026','plan-b-1-1'],
  },
  {
    id: 'judge-bike', sectionId: 'sving-cykel', scene: 'bike', short: 'HØJRESVING',
    title: 'Cyklisten langs højre side',
    setup: 'Bilen vil dreje til højre over en cykelsti. Cyklisten fortsætter ligeud og er nået op langs bilens højre side.',
    clipLabel: 'Bilen begynder svinget, mens cyklisten fortsætter',
    excuse: '“Jeg blinkede, så jeg antog, at universet havde accepteret min reservation.”',
    issuePrompt: 'Peg på det vigtigste problem i klippet.',
    issue: [
      { id:'cyclist-side', label:'Cyklisten', anchor:'cyclist', offset:[.12,-.07], fallback:[65,60], correct:true },
      { id:'turn-arrow', label:'Bilens vognbane', anchor:'own', offset:[-.13,.03], fallback:[43,64], correct:false },
      { id:'far-lane', label:'Vejkantens placering', world:[4,.1,-2], offset:[.12,0], fallback:[77,31], correct:false },
    ],
    rulePrompt: 'Hvad kræver højresvinget?',
    rules: [
      { id:'yield-bike', label:'Orientér dig igen, og vent før svinget, til den ligeudkørende cyklist er passeret.', correct:true },
      { id:'first-look', label:'Brug det første spejlkig, og drej roligt, når cyklisten tidligere var bag bilen.', correct:false },
      { id:'indicator-right', label:'Blink i god tid, og begynd svinget roligt, så cyklisten ved, at bilen kører først.', correct:false },
    ],
    placePrompt: 'Placér bilen, mens cyklisten passerer ligeud.',
    places: [
      { id:'before-cycleway', label:'Før cykelstien', world:[2,.1,5.9], fallback:[46,71], correct:true },
      { id:'across-cycleway', label:'På cykelstien', world:[5.2,.1,3.5], fallback:[57,55], correct:false },
      { id:'inside-turn', label:'Inde i højresvinget', world:[4,.1,1.8], fallback:[67,44], correct:false },
    ],
    explanation: 'Ved højresving skal føreren orientere sig helt frem til svinget og holde tilbage for cyklister, der fortsætter ligeud. Blinklyset ændrer ikke vigepligten.',
    sourceIds: ['fl-2026','plan-b-1-1'],
  },
  {
    id: 'judge-pedestrian', sectionId: 'fodgaenger-rund', scene: 'pedestrian', short: 'FODGÆNGERFELT',
    title: 'Den gående ved feltet',
    setup: 'Bilen nærmer sig et ureguleret fodgængerfelt. En gående står ved kanten og er tydeligt på vej ud i feltet.',
    clipLabel: 'Bilen fortsætter mod feltet, mens den gående træder frem',
    excuse: '“Jeg regnede med, at zebrastriberne var nattøj til asfalten.”',
    issuePrompt: 'Peg på det afgørende tegn i situationen.',
    issue: [
      { id:'walker-intent', label:'Den gående', anchor:'walker', offset:[.12,-.04], fallback:[67,39], correct:true },
      { id:'zebra-paint', label:'Feltets afmærkning', world:[2,.1,1.1], offset:[-.12,-.06], fallback:[49,54], correct:false },
      { id:'lamp-pool', label:'Bilens vognbane', anchor:'own', offset:[-.12,.03], fallback:[20,31], correct:false },
    ],
    rulePrompt: 'Hvordan skal føreren reagere?',
    rules: [
      { id:'adapt-stop', label:'Tilpas farten og stands om nødvendigt. Den gående skal kunne passere uden fare eller ulempe.', correct:true },
      { id:'middle-only', label:'Fortsæt med lav fart forbi kanten. Stands først, når den gående er midt i feltet.', correct:false },
      { id:'horn', label:'Giv et kort hornsignal ved feltet. Det fortæller den gående, at bilen kører først.', correct:false },
    ],
    placePrompt: 'Placér bilen, mens den gående går ud i feltet.',
    places: [
      { id:'before-crossing', label:'Før fodgængerfeltet', world:[2,.1,4.5], fallback:[49,72], correct:true },
      { id:'on-crossing', label:'På fodgængerfeltet', world:[2,.1,1.1], fallback:[49,53], correct:false },
      { id:'after-crossing', label:'Efter fodgængerfeltet', world:[2,.1,-2], fallback:[49,35], correct:false },
    ],
    explanation: 'Ved et ureguleret fodgængerfelt skal føreren tilpasse farten og om nødvendigt standse for en gående, der er på vej ud, så personen ikke udsættes for fare eller ulempe.',
    sourceIds: ['fl-2026','plan-b-1-1'],
  },
]);
export { CASES as JUDGE_CASES };

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
}

function driverBadge(id){
  const people={
    'judge-stop':['Rune Rulle','Fører · allergisk over for kvitteringer','#efc27c'],
    'judge-yield':['Tand-Torsten','Hajtandstyrelsen','#9bd7d1'],
    'judge-bike':['Blink-Bent','Universets reservationskontor','#d6a7e6'],
    'judge-pedestrian':['Zebra-Zoe','Afdelingen for asfaltpyjamas','#ffb19d'],
  };
  const [name,office,color]=people[id];
  const glasses=id==='judge-stop'?'<g fill="none" stroke="#10202a" stroke-width="3"><circle cx="27" cy="29" r="7"/><circle cx="45" cy="29" r="7"/><path d="M34 29h4"/></g>':'<path d="M23 27l8 2m10 0l8-2" fill="none" stroke="#10202a" stroke-width="3"/>';
  return `<div class="judge__driver"><svg viewBox="0 0 72 72" aria-hidden="true"><rect width="72" height="72" rx="12" fill="#0e1821"/><path d="M9 72v-11q27-21 54 0v11" fill="${color}"/><circle cx="36" cy="29" r="21" fill="#ecc8a7"/><path d="M15 25q0-23 24-19q22-1 18 21l-8-12-13 5-13-3" fill="#24323e"/>${glasses}<path d="M28 40q8 8 16-1" fill="none" stroke="#10202a" stroke-width="3" stroke-linecap="round"/><path d="M16 66l42-12M13 59l39-12" stroke="#0e1821" stroke-width="4"/></svg><div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(office).replaceAll(' · ',' <span class="tb-stripes" aria-hidden="true"></span> ')}</span></div></div>`;
}

export function getJudgeCases() {
  return CASES.map(item => ({
    id:item.id, sectionId:item.sectionId, scene:item.scene, title:item.title,
    setup:item.setup, explanation:item.explanation, ruleSourceIds:[...item.sourceIds],
    steps:{
      issue:item.issue.map(x=>({id:x.id,label:x.label,correct:x.correct,world:x.world?[...x.world]:undefined,anchor:x.anchor,offset:x.offset?[...x.offset]:undefined})),
      rules:item.rules.map(x=>({id:x.id,label:x.label,correct:x.correct})),
      places:item.places.map(x=>({id:x.id,label:x.label,correct:x.correct,world:x.world?[...x.world]:undefined,anchor:x.anchor})),
    },
  }));
}

export function renderJudge() {
  return `<section class="judge" data-judge-root aria-labelledby="judge-title">
    <div class="game-top"><a class="game-close" href="#practice" aria-label="Luk spillet og gå til Øv">${ico('x')}</a>
      <div class="game-cases" aria-hidden="true">${CASES.map(() => '<i></i>').join('')}</div>
      <span class="game-count" data-judge-progress>Du er kørelæreren</span></div>
    <header class="judge__header">
      <div class="judge__heading"><p class="judge__eyebrow" data-judge-eyebrow>DU ER KØRELÆREREN</p><h1 class="judge__title" id="judge-title" data-judge-title>Du er kørelæreren</h1></div>
      <div class="judge__welcome-mascot" aria-hidden="true"><img src="assets/cast/sneglen.webp" width="80" height="80" alt=""></div>
      <div class="judge__toggles" data-judge-toggles aria-label="Visning" hidden>
        <button class="judge__toggle" type="button" data-judge-humor aria-pressed="true">Humor</button>
        <button class="judge__toggle" type="button" data-judge-motion aria-pressed="true">Bevægelse</button>
      </div>
    </header>
    <div class="judge__meta" data-judge-meta hidden><span data-judge-progress>Case 1 af 4</span><span data-judge-score>Førstevalg: 0/4</span></div>
    <div class="judge__stage" data-judge-stage>
      <canvas class="judge__canvas" data-judge-canvas aria-label="3D-trafikscene set som diorama"></canvas>
      <div class="judge__fallback" data-judge-fallback hidden></div>
      <div class="judge__intro" data-judge-intro>
        <p>Se førerens fejlklip. Find problemet, vælg reglen, og placér bilen korrekt.</p>
        <button class="judge__start" type="button" data-judge-start>Start første fejlklip</button>
        <button class="judge__voice" type="button" data-judge-read-intro aria-pressed="false">Lyt til startguiden</button>
      </div>
      <div class="judge__hotspots" data-judge-hotspots></div>
      <button class="judge__replay" type="button" data-judge-replay hidden>Afspil igen</button>
      <div class="judge__clip-label" data-judge-clip></div>
      <div class="judge__legend" data-judge-legend hidden><span><i class="judge__legend-blue"></i>Din rettelse</span><span><i class="judge__legend-gray"></i>Fejlklippet</span></div>
    </div>
    <div class="judge__workspace" data-judge-workspace hidden>
      <div class="judge__step"><span class="sr-only" data-judge-step>Trin 1 af 4</span><ol class="judge__track" aria-hidden="true">${['Find', 'Regel', 'Placér', 'Feedback'].map(t => `<li>${t}</li>`).join('')}</ol><i data-judge-stepbar hidden></i></div>
      <p class="judge__mobile-legend" data-judge-mobile-legend hidden>Blå: din rettelse. Grå: fejlklippet.</p>
      <p class="judge__setup" data-judge-setup></p>
      <div class="judge__ask"><h3 class="judge__prompt" data-judge-prompt tabindex="-1"></h3>
      <button class="judge__voice judge__voice--icon" type="button" data-judge-read aria-pressed="false" aria-label="Lyt til instruktionen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg><span>Lyt</span></button></div>
      <div class="judge__answers" data-judge-answers></div>
      <p class="judge__status" data-judge-status role="status" aria-live="polite"></p>
      <blockquote class="judge__excuse" data-judge-excuse hidden></blockquote>
      <div class="judge__feedback" data-judge-feedback hidden></div>
      <details class="judge__description" data-judge-description><summary>Beskriv klippet med tekst</summary><p data-judge-description-text></p></details>
    </div>
  </section>`;
}

export function mountJudge(container, options={}) {
  const host = typeof container === 'string' ? document.querySelector(container) : container;
  if (!host) throw new Error('mountJudge kræver en gyldig container.');
  host.innerHTML = renderJudge();
  const root=host.querySelector('[data-judge-root]');
  const $=selector=>root.querySelector(selector);
  const els={
    title:$('[data-judge-title]'), progress:$('[data-judge-progress]'), score:$('[data-judge-score]'),
    meta:$('[data-judge-meta]'), toggles:$('[data-judge-toggles]'), intro:$('[data-judge-intro]'), start:$('[data-judge-start]'), workspace:$('[data-judge-workspace]'),
    stage:$('[data-judge-stage]'), canvas:$('[data-judge-canvas]'), fallback:$('[data-judge-fallback]'),
    hotspots:$('[data-judge-hotspots]'), replay:$('[data-judge-replay]'), clip:$('[data-judge-clip]'),
    legend:$('[data-judge-legend]'), mobileLegend:$('[data-judge-mobile-legend]'),
    step:$('[data-judge-step]'), stepbar:$('[data-judge-stepbar]'), setup:$('[data-judge-setup]'), description:$('[data-judge-description]'), descriptionText:$('[data-judge-description-text]'),
    excuse:$('[data-judge-excuse]'), prompt:$('[data-judge-prompt]'), answers:$('[data-judge-answers]'),
    status:$('[data-judge-status]'), feedback:$('[data-judge-feedback]'),
    humor:$('[data-judge-humor]'), motion:$('[data-judge-motion]'),
    read:$('[data-judge-read]'), readIntro:$('[data-judge-read-intro]'),
  };
  let humor=options.humor!==false, motion=options.motion!==false, caseIndex=0, phase=1, caseFirstTry=true;
  let correctFirst=0, finishedCalled=false, disposed=false, started=false, transitioning=false, advancing=false, wildlife=null;
  const completed=new Set();
  const choiceOrders=new Map();
  const world=createJudgeWorld(els.canvas,els.fallback,motion,currentCase());
  const replayObserver=new MutationObserver(()=>{
    const p=els.canvas.dataset.replayPhase;if(phase!==4||!p)return;
    const waitText={stop:'0 KM/T · FULDT STOP',yield:'Vent på tværtrafikken',bike:'Lad cyklisten passere',pedestrian:'Lad den gående passere'}[currentCase().scene];
    const text=p==='waiting'?waitText:p==='continue'?'Passagen er fri · fortsæt sikkert':'Korrekt forløb · tilpas farten';
    if(els.clip.dataset.brandText!==text){setBrandText(els.clip,text);els.clip.dataset.brandText=text;}
  });
  replayObserver.observe(els.canvas,{attributes:true,attributeFilter:['data-replay-phase']});

  function currentCase(){return CASES[caseIndex];}
  function orderedChoices(items){
    const key=`${currentCase().id}:${phase}`;
    if(!choiceOrders.has(key)){
      const shuffled=[...items];
      for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
      choiceOrders.set(key,shuffled);
    }
    return choiceOrders.get(key);
  }
  function sourceLinks(c){
    return c.sourceIds.map(id=>SOURCE_BY_ID.get(id)).filter(Boolean).map(source=>
      `<a class="judge__source" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer" aria-label="Kilde: ${escapeHtml(source.label)}">${escapeHtml(SHORT_SOURCE[source.id]||source.label)}</a>`
    ).join('');
  }
  function receipt(c){
    if(!humor)return '';
    const wheelLine={
      'judge-stop':'HJUL: 0 KM/T VED LINJEN',
      'judge-yield':'HAJTÆNDER: RESPEKTERET',
      'judge-bike':'CYKLIST: SET IGEN',
      'judge-pedestrian':'FELT: GJORT FRIT',
    }[c.id];
    return `<aside class="judge__receipt" aria-label="Stop og Søn kvittering"><div class="judge__receipt-head"><strong>STOP &amp; SØN</strong><span>KVITTERING</span></div><p>UNDSKYLDNING: AFVIST</p><p>${escapeHtml(wheelLine)}</p><p>MANØVRE: RETTET <span class="tb-stripes" aria-hidden="true"></span> PRIS: 0 KR</p><small>Ingen bøde. Bare en bedre beslutning.</small></aside>`;
  }
  function mark(id,cls){root.querySelectorAll(`[data-choice="${CSS.escape(id)}"]`).forEach(b=>{b.classList.remove('is-wrong','is-right');void b.offsetWidth;b.classList.add(cls);if(cls==='is-wrong')b.setAttribute('aria-disabled','true');});}
  function calmWrong(id){
    caseFirstTry=false;mark(id,'is-wrong');options.onSound?.('repair');
    els.status.dataset.tone='retry';
    wildlife?.dispose();els.status.textContent=phase===2?'Ikke helt. Vælg den regel, der passer til situationen i klippet, og prøv igen.':phase===3?'Ikke helt. Se på klippet igen, og prøv en anden placering.':'Ikke helt. Se på den trafikant eller markering, som direkte ændrer førerens pligt, og prøv igen.';
    // the deer sits in the hint line, so the answer rows never change height
    if(humor)wildlife=mountWildlife(els.status,{animal:'deer',state:'shock',reducedMotion:!motion});
  }
  function choose(list,id){
    if(transitioning)return;
    const choice=list.find(item=>item.id===id);if(!choice)return;
    if(!choice.correct){calmWrong(id);return;}
    transitioning=true;mark(id,'is-right');options.onSound?.('correct');
    els.status.dataset.tone='ok';els.status.textContent='Korrekt set. Næste trin er klar.';
    const placementDelay=phase===3?world.place(choice.id):0;
    phase=Math.min(4,phase+1);window.setTimeout(()=>{transitioning=false;if(!disposed)paint();},Math.max(650,placementDelay+80));
  }
  function makeHotspots(items,kind){
    items=orderedChoices(items);
    if(kind==='place')items=items.map((item,index)=>({...item,offset:[index===1?.15:-.13,index===2?-.07:0]}));
    els.hotspots.innerHTML=items.map((item,index)=>`<button type="button" class="judge__hotspot judge__hotspot--${kind}" aria-label="${escapeHtml(item.label)}" data-order="${index+1}" style="--x:${item.fallback?.[0]??50}%;--y:${item.fallback?.[1]??50}%" data-choice="${escapeHtml(item.id)}"><span>${escapeHtml(item.label)}</span></button>`).join('');
    const buttons=[...els.hotspots.querySelectorAll('[data-choice]')];
    buttons.forEach(button=>button.addEventListener('click',()=>choose(kind==='issue'?currentCase().issue:currentCase().places,button.dataset.choice)));
    world.bindHotspots(items,buttons);
    els.answers.classList.add('judge__answers--spatial');
    els.answers.innerHTML=items.map((item,index)=>`<button type="button" class="judge__answer" aria-label="Valg ${index+1}: ${escapeHtml(item.label)}" data-choice="${escapeHtml(item.id)}"><b>${index+1}</b><span>${escapeHtml(item.label)}</span></button>`).join('');
    // pointing at a row lights up its marker in the scene, and the other way round
    const pair=id=>root.querySelectorAll(`[data-choice="${CSS.escape(id)}"]`);
    root.querySelectorAll('.judge__answer[data-choice], .judge__hotspot[data-choice]').forEach(el=>{const on=v=>()=>pair(el.dataset.choice).forEach(x=>x.classList.toggle('is-hot',v));el.addEventListener('pointerenter',on(true));el.addEventListener('pointerleave',on(false));el.addEventListener('focus',on(true));el.addEventListener('blur',on(false));});
    els.answers.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>choose(kind==='issue'?currentCase().issue:currentCase().places,button.dataset.choice)));
  }
  function makeRuleButtons(items){
    items=orderedChoices(items);
    els.answers.innerHTML=items.map((item,index)=>`<button type="button" class="judge__answer judge__answer--rule" data-choice="${escapeHtml(item.id)}"><b>${'ABC'[index]}</b><span>${escapeHtml(item.label)}</span></button>`).join('');
    els.answers.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>choose(currentCase().rules,button.dataset.choice)));
  }
  function completeCase(){
    if(advancing)return;
    advancing=true;
    const c=currentCase();
    if(!completed.has(c.id)){
      completed.add(c.id);if(caseFirstTry)correctFirst++;
      if(typeof options.onCaseComplete==='function') options.onCaseComplete({caseId:c.id,sectionId:c.sectionId,firstTry:caseFirstTry,ruleSourceIds:[...c.sourceIds],explanation:c.explanation});
    }
    // BILLING HOOK: record the completed case before checking access to the next.
    if(caseIndex<CASES.length-1 && options.beforeNextCase?.(caseIndex+2)===false){advancing=false;return;}
    if(caseIndex<CASES.length-1){caseIndex++;phase=1;caseFirstTry=true;options.onSound?.('step');world.setCase(currentCase());paint();advancing=false;root.scrollIntoView({block:'start',behavior:'instant'});return;}
    if(!finishedCalled){finishedCalled=true;if(typeof options.onFinished==='function')options.onFinished({correctFirst,total:CASES.length});}
    els.hotspots.innerHTML='';els.answers.innerHTML='';els.prompt.textContent='Vagten er slut. Godt kørt.';options.onSound?.('complete');root.classList.add('judge--done');
    root.querySelectorAll('.game-cases i').forEach(seg=>{seg.className='is-done';seg.style.setProperty('--p',1);});root.querySelectorAll('.judge__track li').forEach(li=>li.className='is-done');
    els.feedback.hidden=false;els.feedback.innerHTML=`<div class="rive-hero" data-rive="celebrate" aria-hidden="true"></div><div class="judge__done is-first"><span class="judge__done-ico">${ico('check')}</span><div><strong>${correctFirst} af ${CASES.length} i første forsøg</strong><small>Alle fire fejlklip er rettet.</small></div></div><div class="judge__actions"><a class="big-btn big-btn--ghost" href="#practice">Tilbage til Øvelser</a><button type="button" class="big-btn" data-judge-again>Spil igen</button></div>`;
    els.feedback.querySelector('[data-judge-again]').addEventListener('click',()=>{location.hash='judge';window.dispatchEvent(new HashChangeEvent('hashchange'));});
    els.status.textContent='';els.step.textContent='Færdig';els.stepbar.style.setProperty('--judge-step-ratio','1');els.score.textContent=`Førstevalg: ${correctFirst}/${CASES.length}`;
  }
  function paint(){
    wildlife?.dispose();wildlife=null;
    options.onNarrationStop?.();
    const c=currentCase();
    root.classList.toggle('judge--feedback',phase===4);root.dataset.phase=String(phase);
    els.title.textContent=phase===1?['Et kryds i byen','En vej med tværtrafik','Et sving i byen','En tur forbi feltet'][caseIndex]:c.title;
    els.progress.textContent=`${caseIndex+1} / ${CASES.length}`;
    setBrandText(root.querySelector('[data-judge-eyebrow]'),`FEJLKLIP ${caseIndex+1} · ${c.short}`);
    root.querySelectorAll('.game-cases i').forEach((seg,i)=>{seg.className=i<caseIndex||completed.has(CASES[i].id)?'is-done':i===caseIndex?'is-now':'';seg.style.setProperty('--p',i===caseIndex?(phase-1)/4:i<caseIndex?1:0);});
    root.querySelectorAll('.judge__track li').forEach((li,i)=>{li.className=i<phase-1?'is-done':i===phase-1?'is-now':'';});
    els.score.hidden=completed.size===0;
    els.score.textContent=`Første forsøg: ${correctFirst}/${completed.size} gennemgået`;
    setBrandText(els.clip,phase===4?'Din rettede placering':`Fejlklip ${caseIndex+1} · se efter`);
    els.legend.hidden=phase!==4;els.mobileLegend.hidden=phase!==4;
    els.replay.textContent=phase===4?'Se korrekt forløb':'Afspil igen';
    els.canvas.setAttribute('aria-label',phase===1?`Trafikklip ${caseIndex+1}. En tekstbeskrivelse kan åbnes under scenen.`:`3D-fejlklip: ${c.setup}`);
    els.step.textContent=`Trin ${phase} af 4`;els.stepbar.style.setProperty('--judge-step-ratio',String(phase/4));els.setup.textContent=c.setup;els.setup.hidden=phase===1;
    els.description.hidden=phase!==1&&phase!==4;els.description.open=false;els.descriptionText.textContent=c.setup;
    els.status.textContent='';delete els.status.dataset.tone;els.answers.innerHTML='';els.answers.classList.remove('judge__answers--spatial');world.clearHotspots();els.hotspots.innerHTML='';els.feedback.hidden=true;els.feedback.innerHTML='';
    els.excuse.hidden=!(humor&&phase===2);els.excuse.innerHTML=humor&&phase===2?`${driverBadge(c.id)}<p>${escapeHtml(c.excuse)}</p>`:'';
    if(phase===1){els.prompt.textContent=c.issuePrompt;makeHotspots(c.issue,'issue');}
    else if(phase===2){els.prompt.textContent=c.rulePrompt;makeRuleButtons(c.rules);}
    else if(phase===3){els.prompt.textContent=c.placePrompt;makeHotspots(c.places,'place');}
    else {
      els.prompt.textContent='Kørelærerens feedback';
      els.feedback.hidden=false;
      const picture=world.snapshot(),placeLabel=c.places.find(x=>x.correct)?.label||'Korrekt placering';
      const thumb=picture?`<figure class="judge__correct-thumb"><img src="${escapeHtml(picture)}" alt="Din rettede bilplacering: ${escapeHtml(placeLabel)}"><figcaption>${escapeHtml(placeLabel)}</figcaption></figure>`:'';
      els.feedback.innerHTML=`<div class="judge__done${caseFirstTry?' is-first':''}"><span class="judge__done-ico judge__done-ico--cast" data-rive="cast:blink" aria-hidden="true"><img src="assets/cast/blink.webp" alt="" width="64" height="64"></span><div><strong>${caseFirstTry?'Klaret i første forsøg':'Klaret'}</strong><small>Du har rettet ${escapeHtml(c.short==='STOP'?'STOP-fejlen':'fejlen')}. Her er reglen.</small></div></div><p class="judge__rule"><span>REGEL</span>${escapeHtml(c.explanation)}</p><div class="judge__actions"><button type="button" class="big-btn big-btn--ghost judge__compare" data-judge-corrected>Se det korrekte forløb</button><button type="button" class="big-btn judge__confirm" data-judge-confirm>${caseIndex===CASES.length-1?'Afslut forløbet':'Næste case'}</button></div>${thumb}<div class="judge__sources">${sourceLinks(c)}</div>${receipt(c)}`;
      if(humor)wildlife=mountWildlife(els.feedback.querySelector('.judge__done'),{animal:'hare',state:'smug',reducedMotion:!motion});
      els.feedback.querySelector('[data-judge-corrected]').addEventListener('click',correctedReplay);
      els.feedback.querySelector('[data-judge-confirm]').addEventListener('click',completeCase);
    }
    window.requestAnimationFrame(()=>{
      if(disposed||!started)return;
      // the whole game from the top bar down: progress and close stay on screen, the scene shows the replay
      root.scrollIntoView({block:'start',behavior:'instant'});
      const focusTarget=phase===1||phase===3?els.hotspots.querySelector('button'):phase===2?els.answers.querySelector('button'):els.prompt;
      focusTarget?.focus({preventScroll:true});
    });
  }
  function setHumor(value){humor=!!value;els.humor.setAttribute('aria-pressed',String(humor));if(started&&!finishedCalled)paint();}
  function setMotion(value){wildlife?.dispose();wildlife=null;motion=!!value;els.motion.setAttribute('aria-pressed',String(motion));world.setMotion(motion);if(!started)world.setCase(currentCase(),false);}
  function correctedReplay(){options.onNarrationStop?.();world.replayCorrected();setBrandText(els.clip,'Korrekt forløb · se forskellen');els.stage.scrollIntoView({block:'start',behavior:'instant'});}
  els.readIntro.addEventListener('click',()=>options.onNarrate?.([JUDGE_INTRO_VOICE],{label:'Startguiden',trigger:els.readIntro}));
  els.read.addEventListener('click',()=>{
    const c=currentCase();
    const issueIds=phase===1?orderedChoices(c.issue).map(item=>item.id):[];
    const ruleIds=phase===2?orderedChoices(c.rules).map(item=>item.id):[];
    const placeIds=phase===3?orderedChoices(c.places).map(item=>item.id):[];
    const parts=judgeVoiceParts(c,phase,{humor:phase===2&&humor,issueIds,ruleIds,placeIds});
    const answerRows=[...els.answers.querySelectorAll('button')];
    const hotspots=[...els.hotspots.querySelectorAll('button')];
    const rows=phase===2?answerRows:answerRows.map((row,index)=>[row,hotspots[index]]);
    const cueRows=phase===1?[els.prompt,...rows.flatMap(row=>[row,row])]:phase===2||phase===3?[els.setup,els.prompt,...rows.flatMap(row=>[row,row])]:[els.feedback.querySelector('.judge__rule')];
    if(parts.length)options.onNarrate?.(parts,{label:phase===4?'Kørelærerens forklaring':'Instruktionen til dette trin',trigger:els.read,onPart:createVoiceCue(cueRows)});
  });
  els.replay.addEventListener('click',()=>phase===4?correctedReplay():world.replay());
  els.start.addEventListener('click',()=>{
    if(started)return;started=true;root.classList.add('judge--started');root.querySelector('.judge__welcome-mascot')?.remove();els.intro.hidden=true;els.meta.hidden=false;els.toggles.hidden=true;els.replay.hidden=false;els.workspace.hidden=false;world.replay();paint();
  });
  els.humor.addEventListener('click',()=>{setHumor(!humor);options.onSettingChange?.('humor',humor);});
  els.motion.addEventListener('click',()=>{setMotion(!motion);options.onSettingChange?.('motion',motion);});
  els.humor.setAttribute('aria-pressed',String(humor));els.motion.setAttribute('aria-pressed',String(motion));
  world.setCase(currentCase(),false);
  return { dispose(){if(disposed)return;disposed=true;wildlife?.dispose();replayObserver.disconnect();world.dispose();host.innerHTML='';}, setHumor, setMotion };
}

