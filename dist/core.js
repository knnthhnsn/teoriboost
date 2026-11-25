import { restoreJourneyProfile } from './journey-profile.js';

export const VERSION = 1;
export const blankState = () => ({version:VERSION,xp:0,rewards:[],records:{},history:[],sessions:0,settings:{humor:true,sound:true,motion:true},savedExam:null,...restoreJourneyProfile(null)});

export function normalizeResponse(value) {
  const answer=[null,null,null,null];
  if(!Array.isArray(value))return answer;
  for(let i=0;i<4;i++)if(typeof value[i]==='boolean')answer[i]=value[i];
  return answer;
}

export function isCompleteResponse(value) {
  if(!Array.isArray(value)||value.length!==4)return false;
  for(let i=0;i<4;i++)if(typeof value[i]!=='boolean')return false;
  return true;
}

export function questionSignature(question) {
  if(!question||typeof question.id!=='string'||typeof question.context!=='string'||!Array.isArray(question.statements)||question.statements.length!==4)return null;
  const statements=[];
  for(let i=0;i<4;i++){
    const statement=question.statements[i];
    if(!statement||typeof statement.text!=='string'||typeof statement.correct!=='boolean')return null;
    statements.push([statement.text,statement.correct]);
  }
  const canonical=JSON.stringify([question.id,question.context,statements]);
  let hash=0xcbf29ce484222325n;
  const prime=0x100000001b3n,mask=0xffffffffffffffffn;
  for(let i=0;i<canonical.length;i++){
    const code=canonical.charCodeAt(i);
    hash^=BigInt(code&0xff);hash=(hash*prime)&mask;
    hash^=BigInt(code>>>8);hash=(hash*prime)&mask;
  }
  return `qs1-${hash.toString(16).padStart(16,'0')}`;
}

function signatureMap(questions){
  const signatures={};
  for(const question of questions){const signature=questionSignature(question);if(!signature)return null;signatures[question.id]=signature;}
  return signatures;
}

function signaturesMatch(value,questions,requireSignatures=false){
  const provided=!!value&&Object.prototype.hasOwnProperty.call(value,'signatures');
  if(!provided)return !requireSignatures;
  if(!value.signatures||typeof value.signatures!=='object'||Array.isArray(value.signatures))return false;
  for(const question of questions){const expected=questionSignature(question);if(!expected||value.signatures[question.id]!==expected)return false;}
  return true;
}

function stableExamId(ids,deadline) {
  let hash=2166136261;
  for(const char of `${Math.trunc(deadline)}|${ids.join('|')}`){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}
  return `exam-${Math.trunc(deadline).toString(36)}-${(hash>>>0).toString(36)}`;
}

function safeExamId(value,ids,deadline) {
  return typeof value==='string'&&/^[a-zA-Z0-9_-]{8,120}$/.test(value)?value:stableExamId(ids,deadline);
}

function sanitizeHistoryEntry(value) {
  if(!value||!Number.isFinite(value.at)||!Number.isInteger(value.errors)||value.errors<0||value.errors>25)return null;
  const item={at:value.at,errors:value.errors,unanswered:Number.isInteger(value.unanswered)&&value.unanswered>=0&&value.unanswered<=25?value.unanswered:0};
  if(typeof value.id==='string'&&/^[a-zA-Z0-9_-]{8,120}$/.test(value.id))item.id=value.id;
  item.expired=value.expired===true;
  if(Array.isArray(value.ids)&&value.ids.length===25&&new Set(value.ids).size===25&&value.ids.every(id=>typeof id==='string')){
    item.ids=[...value.ids];
    item.responses={};
    for(const id of item.ids)item.responses[id]=normalizeResponse(value.responses?.[id]);
    if(Object.prototype.hasOwnProperty.call(value,'signatures')){
      item.signatures={};
      if(value.signatures&&typeof value.signatures==='object'&&!Array.isArray(value.signatures))for(const id of item.ids){const signature=value.signatures[id];if(typeof signature==='string'&&/^qs1-[0-9a-f]{16}$/.test(signature))item.signatures[id]=signature;}
    }
    if(Array.isArray(value.details)&&value.details.length===25){
      item.details=item.ids.map(id=>{const detail=value.details.find(d=>d?.id===id);return {id,correct:detail?.correct===true,answered:detail?.answered===true};});
    }
  }
  return item;
}

export function restoreState(raw) {
  try {
    const parsed=typeof raw==='string'?JSON.parse(raw):raw;
    if(!parsed||parsed.version!==VERSION)return blankState();
    const s={...blankState(),...restoreJourneyProfile(parsed)};
    s.xp=Number.isSafeInteger(parsed.xp)&&parsed.xp>=0?parsed.xp:0;
    s.sessions=Number.isSafeInteger(parsed.sessions)&&parsed.sessions>=0?parsed.sessions:0;
    s.rewards=Array.isArray(parsed.rewards)?parsed.rewards.filter(v=>typeof v==='string').slice(-10000):[];
    s.history=Array.isArray(parsed.history)?parsed.history.map(sanitizeHistoryEntry).filter(Boolean).slice(-30):[];
    for(const [id,r] of Object.entries(parsed.records||{})){
      if(!r||!Number.isInteger(r.attempts)||r.attempts<0||!Number.isFinite(r.due))continue;
      s.records[id]={attempts:r.attempts,assessments:Math.max(0,Number.isInteger(r.assessments)?r.assessments:Number.isInteger(r.correct)?r.correct:0),correct:Math.max(0,Number.isInteger(r.correct)?r.correct:0),streak:Math.max(0,Number.isInteger(r.streak)?r.streak:0),due:r.due,last:Number.isFinite(r.last)?r.last:0,lastCorrect:!!r.lastCorrect,lastAssessment:['complete','partial','unanswered','unknown'].includes(r.lastAssessment)?r.lastAssessment:r.lastCorrect?'complete':'unknown',days:Array.isArray(r.days)?r.days.filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)):[],questions:Array.isArray(r.questions)?r.questions.filter(q=>typeof q==='string'):[]};
    }
    for(const key of ['humor','sound','motion','haptics'])if(typeof parsed.settings?.[key]==='boolean')s.settings[key]=parsed.settings[key];
    if(parsed.savedExam&&Array.isArray(parsed.savedExam.ids)&&parsed.savedExam.ids.length===25&&Number.isFinite(parsed.savedExam.deadline))s.savedExam=parsed.savedExam;
    return s;
  }catch{return blankState();}
}

// Et spørgsmål tæller kun som rigtigt, når alle fire udsagn er vurderet rigtigt.
export function gradeQuestion(question,answers) {
  if(!Array.isArray(question.statements)||question.statements.length!==4)throw new Error('Spørgsmål kræver fire udsagn');
  if(!isCompleteResponse(answers))return false;
  for(let i=0;i<4;i++)if(answers[i]!==question.statements[i].correct)return false;
  return true;
}

export function recordAnswer(state,question,answers,now=Date.now()) {
  const correct=gradeQuestion(question,answers),id=question.sectionId;
  const r=state.records[id]||{attempts:0,assessments:0,correct:0,streak:0,due:0,last:0,lastCorrect:false,days:[],questions:[]};
  const response=normalizeResponse(answers);
  const complete=isCompleteResponse(answers);
  r.attempts++;r.last=now;r.lastAssessment=complete?'complete':response.some(v=>v!==null)?'partial':'unanswered';
  if(complete){r.assessments=(r.assessments||0)+1;r.lastCorrect=correct;r.streak=correct?r.streak+1:0;}
  if(correct){
    r.correct++;
    const day=new Date(now).toLocaleDateString('sv-SE',{timeZone:'Europe/Copenhagen'});
    if(!r.days.includes(day))r.days.push(day);
    if(!r.questions.includes(question.id))r.questions.push(question.id);
    const key=question.id+':'+day;
    if(!state.rewards.includes(key)){state.rewards.push(key);state.xp+=15;}
  }
  const intervals=[0,20*60000,86400000,3*86400000,7*86400000];
  r.due=correct?now+intervals[Math.min(4,r.streak)]:now;state.records[id]=r;
  return {correct,mastered:isMastered(r),nextDue:r.due};
}

export function isMastered(r){return !!r&&r.streak>=3&&r.days.length>=2;}
export function reviewQueue(state,questions,now=Date.now(),{seen=null,random=Math.random}={}){
  // Sections keep their order; inside a section the question seen longest ago comes first, ties at random.
  const sectionStart=new Map(),tie=new Map();
  if(seen)for(const q of questions){const start=sectionStart.get(q.sectionId);if(start===undefined||q.id.localeCompare(start)<0)sectionStart.set(q.sectionId,q.id);tie.set(q.id,random());}
  const order=seen?(a,b)=>sectionStart.get(a.sectionId).localeCompare(sectionStart.get(b.sectionId))||(Number(seen[a.id])||0)-(Number(seen[b.id])||0)||tie.get(a.id)-tie.get(b.id):(a,b)=>a.id.localeCompare(b.id);
  return [...questions].sort((a,b)=>{const x=state.records[a.sectionId],y=state.records[b.sectionId];const rank=r=>!r?2:r.lastAssessment==='complete'&&!r.lastCorrect?0:r.due<=now?1:3;return rank(x)-rank(y)||(x?.last||0)-(y?.last||0)||order(a,b);});
}
export function chooseMission(state,questions,now=Date.now(),size=3,options={}){
  const queue=reviewQueue(state,questions,now,options),chosen=[];
  for(const q of queue)if(!chosen.some(c=>c.sectionId===q.sectionId)){chosen.push(q);if(chosen.length===size)return chosen;}
  return chosen;
}
export function makeExam(questions,random=Math.random){
  if(questions.length<25)throw new Error('Der skal være mindst 25 forskellige scenarier');
  const shuffled=[...questions];
  for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  const selected=[],chapters=new Set();
  for(const q of shuffled)if(!chapters.has(q.chapterId)){selected.push(q);chapters.add(q.chapterId);}
  for(const q of shuffled)if(!selected.some(s=>s.id===q.id)){selected.push(q);if(selected.length===25)break;}
  return selected.slice(0,25);
}
export function gradeExam(questions,responses={}){
  if(questions.length!==25)throw new Error('Øveprøven kræver 25 scenarier');
  const details=questions.map(q=>({id:q.id,correct:gradeQuestion(q,responses[q.id]),answered:isCompleteResponse(responses[q.id])}));
  const errors=details.filter(d=>!d.correct).length;
  return {errors,correct:25-errors,withinLimit:errors<=5,unanswered:details.filter(d=>!d.answered).length,details};
}

export function validateExam(saved,questions,{requireSignatures=false}={}){
  if(!saved||!Array.isArray(saved.ids)||saved.ids.length!==25||new Set(saved.ids).size!==25||!Number.isFinite(saved.deadline))return null;
  const byId=new Map(questions.map(q=>[q.id,q]));
  if(!saved.ids.every(id=>byId.has(id)))return null;
  const selected=saved.ids.map(id=>byId.get(id));
  if(!signaturesMatch(saved,selected,requireSignatures))return null;
  const signatures=signatureMap(selected);
  if(!signatures)return null;
  const responses={};
  for(const id of saved.ids)responses[id]=normalizeResponse(saved.responses?.[id]);
  const flagged=Array.isArray(saved.flagged)?[...new Set(saved.flagged.filter(id=>typeof id==='string'&&saved.ids.includes(id)))]:[];
  const deadline=saved.deadline;
  return {id:safeExamId(saved.id,saved.ids,deadline),createdAt:Number.isFinite(saved.createdAt)&&saved.createdAt<=deadline?saved.createdAt:deadline-25*60000,index:Math.min(24,Math.max(0,Number.isInteger(saved.index)?saved.index:0)),responses,flagged,deadline,questions:selected,signatures,result:null};
}

export function restoreExamResult(entry,questions,{requireSignatures=false}={}){
  if(!entry?.id||!Array.isArray(entry.ids)||entry.ids.length!==25||new Set(entry.ids).size!==25)return null;
  const byId=new Map(questions.map(q=>[q.id,q]));
  if(!entry.ids.every(id=>byId.has(id)))return null;
  const selected=entry.ids.map(id=>byId.get(id));
  if(!signaturesMatch(entry,selected,requireSignatures))return null;
  const signatures=signatureMap(selected);
  if(!signatures)return null;
  const responses={};
  for(const id of entry.ids)responses[id]=normalizeResponse(entry.responses?.[id]);
  const result=gradeExam(selected,responses);
  return {id:entry.id,questions:selected,responses,index:0,flagged:[],deadline:Number.isFinite(entry.at)?entry.at:0,createdAt:0,signatures,result,expired:entry.expired===true,completedAt:entry.at};
}

export function completeExam(state,exam,now=Date.now(),expired=false){
  if(!exam?.id||!Array.isArray(exam.questions)||exam.questions.length!==25)throw new Error('Ugyldig øveprøve');
  const existing=state.history.find(item=>item.id===exam.id);
  if(existing){const recovered=restoreExamResult(existing,exam.questions);return {duplicate:true,entry:existing,result:recovered?.result||null};}
  const signatures=signatureMap(exam.questions);
  if(!signatures)throw new Error('Ugyldige spørgsmål i øveprøven');
  const responses={};
  for(const q of exam.questions)responses[q.id]=normalizeResponse(exam.responses?.[q.id]);
  const result=gradeExam(exam.questions,responses);
  for(const q of exam.questions)recordAnswer(state,q,responses[q.id],now);
  const entry={id:exam.id,at:now,errors:result.errors,unanswered:result.unanswered,expired:expired===true,ids:exam.questions.map(q=>q.id),signatures,responses,details:result.details.map(d=>({...d}))};
  state.history.push(entry);state.history=state.history.slice(-30);state.savedExam=null;
  return {duplicate:false,entry,result};
}
