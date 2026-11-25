// Append-only evidence for the source-bound exemplar. Completion is not mastery.
export const TURN_VERSION = 1;
export const WEEK = 7 * 86400000;
export const TURN_SOURCE = 'https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf';
export const TURN_ANCHOR = 'Undervisningsplan B, version 1.1 (maj 2026), 7.13.3, pkt. 5, 11–12, 19 og 21; 7.13.4, pkt. 10–11';
export const TURN_LEGAL_SOURCE = 'https://www.retsinformation.dk/eli/lta/2026/118';
export const TURN_LEGAL_ANCHOR = 'Færdselsloven § 26, stk. 6, 2. og 5. pkt.; jf. § 17, stk. 1, og § 16, stk. 2';
const types = new Set(['start','view','next','answer','retry','commit','draft','point']);
const validId = v => typeof v === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{2,119}$/.test(v);
const choices = { risk:['cycle','exit','road'],decision:['wait','turn','horn'], repair:['wait','turn','horn'], transfer:['yield','green','signal'], contrast:['proceed','always-wait','skip-check'], 'recall-check':['repeat','once','signal'], recall:['repeat','once','signal'] }; /* 24 Nov 2026: recall is a choice like the other steps, no typed answer */
export const TURN_VOICE = Object.freeze({
  observe:'Du vil dreje til højre. Bilen står stille. Tjek højre side, før du vælger, hvad du gør.',
  risk:'Hvad skal du blive ved med at tjekke, mens du gør dig klar til at dreje? Tænk på, hvor bilen skal hen, og hvem der kan komme i vejen for svinget.',
  riskExplain:'Følg den bane, du vil krydse. En cyklist kan nå fra bag bilen og over til siden. En tom vej foran bilen betyder ikke, at cykelstien er fri.',
  decision:'Cyklisten kommer bagfra og kører ligeud. Hvad gør du, før du drejer til højre?',
  safe:'Du holder tilbage, og cyklisten passerer først. Orientér dig igen, og drej, når det er frit.',
  unsafe:'Jeres baner krydser hinanden. Blinklyset giver dig ikke ret til at køre foran cyklisten. Hold tilbage, orientér dig igen, og lad cyklisten passere.',
  explain:'Kig tidligt i spejle og blind vinkel, før du placerer bilen. Gentag kontrollen lige før svinget. Når du drejer til højre, må du ikke skabe fare eller ulempe for cyklister, der kører ligeud.',
  transfer:'Ny situation. Du skal ind ad en indkørsel over en gennemgående cykelsti. En cyklist kommer bagfra. Hvad afgør, om du kan dreje?',
  review:'Ny situation efter en uge. Du vil dreje til højre i et T-kryds. Cyklisten på højre side kører ligeud. Hvad afgør, om du kan dreje?',
  transferExplain:'Bilen skal over cyklistens bane. Fri vej eller et tændt blinklys giver ikke forrang over cyklisten. Orientér dig, hold tilbage, og drej, når det er frit.',
  contrast:'Cyklisten er allerede forbi svingstedet. Der er ingen andre trafikanter i nærheden. Du står stille og har frit udsyn. Hvad gør du nu?',
  contrastExplain:'Du skal give plads, når der er nogen at give plads til. Når du har orienteret dig igen, og svinget er frit, kan du dreje. Reglen betyder ikke, at du altid skal vente.',
  recall:'Prøv selv uden hjælp. Du har kigget i spejlet i god tid. Hvad skal du gøre lige før højresvinget? Vælg det svar, der passer.',
  recallCheck:'Sammenlign med dit eget svar. Første punkt: Gentag orienteringen i spejle og blind vinkel lige før svinget. Andet punkt: Hold tilbage for cyklisten, og drej først, når det er frit. Vurder selv, om begge punkter var med. Ingen AI bedømmer dit svar.',
  recallSaved:'Dit selvtjek er gemt. En cyklist kan nå fra bag bilen og over til siden, mens du nærmer dig svinget. Se tidligt i spejle og blind vinkel, og gentag orienteringen lige før svinget. Gem dit forløb nu.',
  recallRepair:'Tag handlingen én gang til. En cyklist kan nå fra bag bilen og over til siden, mens du nærmer dig svinget. Se tidligt i spejle og blind vinkel, og gentag orienteringen lige før svinget. Prøv dit eget svar igen.',
  done:'Du har gennemført situationen. En ny variant og et tjek efter en uge kan vise mere om, hvad der er blevet hængende.'
});
export function restoreTurnProfile(raw) {
  const events = Array.isArray(raw?.events) ? raw.events : [];
  const unique = new Map();
  for (const e of events) {
    if (!validId(e?.id) || !validId(e.attemptId) || !types.has(e.type) || !Number.isFinite(e.at) || e.at < 0 || e.at > 8640000000000000 || typeof e.value !== 'string' || e.value.length > (['commit','draft'].includes(e.type)?600:50)) continue;
    const clean = {id:e.id,attemptId:e.attemptId,type:e.type,at:e.at,value:e.value,seq:Number.isSafeInteger(e.seq)&&e.seq>0?e.seq:0};
    if(Number.isFinite(e.latencyMs)&&e.latencyMs>=0&&e.latencyMs<=3600000)clean.latencyMs=Math.round(e.latencyMs);
    // Same event ID is immutable; deterministic choice also handles corrupt conflicts.
    const old = unique.get(e.id); if (!old || JSON.stringify(clean) < JSON.stringify(old)) unique.set(e.id,clean);
  }
  let sorted=[...unique.values()].sort((a,b)=>a.at-b.at || a.seq-b.seq || a.id.localeCompare(b.id));
  if(sorted.length>3000)sorted=pruneTurnEvents(sorted,3000);
  return {version:TURN_VERSION,events:sorted};
}
export function mergeTurnProfile(a,b) { return restoreTurnProfile({events:[...(a?.events||[]),...(b?.events||[])]}); }
function foldAttempt(events,start) {
  const review = start.value === 'review';
  const state={id:start.attemptId,startedAt:start.at,updatedAt:start.at,review,stage:review?'transfer':'observe',view:'driver',viewed:[],risk:null,firstRisk:null,firstRiskMethod:null,decision:null,firstDecision:null,transfer:null,firstTransfer:null,contrast:null,firstContrast:null,recall:null,firstRecall:null,recallText:'',firstRecallText:null,completedAt:null};
  for (const e of events) {
    if (e.attemptId!==state.id || e.type==='start' || e.at<start.at || state.completedAt) continue;
    const stage=state.stage;
    if (e.type==='view' && ['driver','shoulder','overhead'].includes(e.value)) {
      if (e.value==='overhead' && !['consequence','explain','repair','transfer-feedback','contrast','contrast-feedback'].includes(stage)) continue;
      state.view=e.value; state.viewed=[...new Set([...state.viewed,e.value])];
    } else if(e.type==='answer' && choices[stage]?.includes(e.value)) {
      if(stage==='risk'){state.risk=e.value;if(state.firstRisk===null){state.firstRisk=e.value;state.firstRiskMethod='text';}state.stage='risk-feedback';}
      if(stage==='decision'){state.decision=e.value;state.firstDecision??=e.value;state.stage='consequence';}
      if(stage==='repair'){state.decision=e.value;if(e.value==='wait')state.stage='transfer';}
      if(stage==='transfer'){state.transfer=e.value;state.firstTransfer??=e.value;state.stage='transfer-feedback';}
      if(stage==='contrast'){state.contrast=e.value;state.firstContrast??=e.value;state.stage='contrast-feedback';}
      if(stage==='recall-check'||stage==='recall'){state.recall=e.value;state.firstRecall??=e.value;state.stage='recall-feedback';}
    } else if(e.type==='point' && stage==='risk' && ['cycle','other'].includes(e.value)) {
      state.risk=e.value==='cycle'?'cycle':'road';if(state.firstRisk===null){state.firstRisk=state.risk;state.firstRiskMethod='image';}state.stage='risk-feedback';
    } else if(e.type==='draft' && stage==='recall') {state.recallText=e.value;
    } else if(e.type==='commit' && stage==='recall') {state.recallText=e.value;state.firstRecallText??=e.value;state.stage='recall-check';
    } else if(e.type==='retry') {
      if(stage==='risk-feedback' && state.risk!=='cycle')state.stage='risk';
      if(stage==='contrast-feedback' && state.contrast!=='proceed')state.stage='contrast';
      if(stage==='transfer-feedback' && state.transfer!=='yield')state.stage='transfer';
      if(stage==='recall-feedback' && state.recall!=='repeat')state.stage='recall';
    } else if(e.type==='next') {
      if(stage==='observe' && state.viewed.includes('shoulder'))state.stage='risk';
      else if(stage==='risk-feedback' && state.risk==='cycle')state.stage='decision';
      else if(stage==='consequence')state.stage='explain';
      else if(stage==='explain')state.stage=state.decision==='wait'?'transfer':'repair';
      else if(stage==='transfer-feedback' && state.transfer==='yield')state.stage='contrast';
      else if(stage==='contrast-feedback' && state.contrast==='proceed')state.stage='recall';
      else if(stage==='recall-feedback' && state.recall==='repeat'){state.stage='done';state.completedAt=e.at;}
    }
    if(state.stage!==stage)state.view= ['consequence','explain','repair','contrast','contrast-feedback'].includes(state.stage)?'overhead':state.stage==='risk'?'shoulder':'driver';
    state.updatedAt=Math.max(state.updatedAt,e.at);
  }
  return state;
}
function compactAttempt(group,start) {
  const target=JSON.stringify(foldAttempt(group,start));
  const kept=[...group];
  // Remove only events whose absence leaves the complete folded evidence identical.
  // This coalesces repeated views, drafts and retry loops while retaining first answers.
  for(let i=0;i<kept.length;){
    if(kept[i]===start){i++;continue;}
    const candidate=[...kept.slice(0,i),...kept.slice(i+1)];
    if(JSON.stringify(foldAttempt(candidate,start))===target)kept.splice(i,1);else i++;
  }
  return kept;
}
function pruneTurnEvents(sorted,limit) {
  const groups=new Map();
  for(const e of sorted){if(!groups.has(e.attemptId))groups.set(e.attemptId,[]);groups.get(e.attemptId).push(e);}
  const attempts=[...groups].map(([id,group])=>{
    const start=group.find(e=>e.type==='start'&&['lesson','review'].includes(e.value));
    return start?{id,group,start,state:foldAttempt(group,start)}:null;
  }).filter(Boolean);
  const completed=attempts.filter(a=>a.state.completedAt).sort((a,b)=>a.state.completedAt-b.state.completedAt||a.id.localeCompare(b.id));
  const first=completed.find(a=>!a.state.review);
  const dueAt=first?first.state.completedAt+WEEK:null;
  const delayed=completed.filter(a=>a.state.review&&dueAt&&a.state.startedAt>=dueAt).at(-1);
  const newest=[...attempts].sort((a,b)=>b.state.startedAt-a.state.startedAt||b.id.localeCompare(a.id));
  const compacted=new Map();
  const compact=attempt=>{if(!compacted.has(attempt.id))compacted.set(attempt.id,compactAttempt(attempt.group,attempt.start));return compacted.get(attempt.id);};
  const retained=new Map();
  for(const attempt of [first,delayed,newest[0]])if(attempt&&!retained.has(attempt.id))retained.set(attempt.id,compact(attempt));
  let size=[...retained.values()].reduce((n,group)=>n+group.length,0);
  for(const attempt of newest){
    if(retained.has(attempt.id))continue;
    const group=size+attempt.group.length<=limit?attempt.group:compact(attempt);
    if(size+group.length<=limit){retained.set(attempt.id,group);size+=group.length;}
  }
  // The three required evidence attempts are semantically irreducible. Their compacted
  // union is the only documented case allowed to exceed the storage limit.
  return [...retained.values()].flat().sort((a,b)=>a.at-b.at||a.seq-b.seq||a.id.localeCompare(b.id));
}
export function turnAttempts(profile) {
  const {events}=restoreTurnProfile(profile); const starts=new Map();
  for(const e of events)if(e.type==='start' && ['lesson','review'].includes(e.value) && !starts.has(e.attemptId))starts.set(e.attemptId,e);
  return [...starts.values()].map(start=>foldAttempt(events,start)).sort((a,b)=>a.startedAt-b.startedAt||a.id.localeCompare(b.id));
}
export function turnCurrent(profile) { return turnAttempts(profile).at(-1)||null; }
export function addTurnEvent(profile,{id,attemptId,type,value,at=Date.now(),latencyMs}) {
  const prior=restoreTurnProfile(profile).events;
  const seq=1+Math.max(0,...prior.filter(e=>e.attemptId===attemptId).map(e=>e.seq));
  const logicalAt=Math.max(at,...prior.map(e=>e.at+1));
  return restoreTurnProfile({events:[...prior,{id,attemptId,type,value,at:logicalAt,seq,latencyMs}]});
}
export function turnSummary(profile,now=Date.now()) {
  const attempts=turnAttempts(profile), completed=attempts.filter(a=>a.completedAt), first=completed.filter(a=>!a.review).sort((a,b)=>a.completedAt-b.completedAt||a.id.localeCompare(b.id))[0], dueAt=first?first.completedAt+WEEK:null;
  const delayed=completed.filter(a=>a.review && dueAt && a.startedAt>=dueAt).at(-1);
  return {attempts:attempts.length,completed:completed.length,first,latest:attempts.at(-1)||null,dueAt,reviewDue:!!dueAt && now>=dueAt&&!delayed,delayed,
    firstActionsCorrect:first?first.firstRisk==='cycle'&&first.firstDecision==='wait'&&first.firstTransfer==='yield'&&first.firstContrast==='proceed':false,recallIndependentlyScored:false};
}
