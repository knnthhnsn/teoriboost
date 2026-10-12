import { emptyJourney, restoreJourney, mergeJourney, setDailyGoal } from './journey-core.js';

const validTime = value => Number.isFinite(value) && value >= 0 && value <= 8640000000000000;
const response = value => Array.from({length:4}, (_, i) => typeof value?.[i] === 'boolean' ? value[i] : null);

// Content-aware replay belongs to the player; this boundary only bounds persisted data.
export function restoreJourneySessions(raw) {
  const sessions = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return sessions;
  for (const [id, value] of Object.entries(raw).slice(0,70)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 80 || !value?.session || typeof value.session !== 'object' || !validTime(value.updatedAt)) continue;
    try {
      const json = JSON.stringify(value.session);
      if (json.length > 200000 || !Array.isArray(value.session.events) || value.session.events.length > 200) continue;
      const session = JSON.parse(json);
      if (session.sectionId !== id || !validTime(session.startedAt) || typeof session.sessionId !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{2,119}$/.test(session.sessionId)) continue;
      const original = value.ui;
      const ui = {
        answers:response(original?.answers),
        transferDraft:typeof original?.transferDraft === 'string' ? original.transferDraft.slice(0,5000) : '',
        recallDraft:typeof original?.recallDraft === 'string' ? original.recallDraft.slice(0,5000) : '',
        feedback:null
      };
      const f=original?.feedback;
      if (f && ['apply','checkpoint'].includes(f.stage) && typeof f.correct === 'boolean' && typeof f.questionId === 'string') {
        ui.feedback={questionId:f.questionId,order:Array.isArray(f.order) && f.order.length === 4 ? f.order.slice(0,4) : null,answers:response(f.answers),correct:f.correct,stage:f.stage};
      }
      sessions[id]={session,ui,updatedAt:value.updatedAt};
    } catch { /* Only the invalid transient session is dropped. */ }
  }
  return sessions;
}

export function restoreJourneyProfile(raw) {
  return {
    journey:restoreJourney(raw?.journey || emptyJourney()),
    journeyGoalAt:validTime(raw?.journeyGoalAt) ? raw.journeyGoalAt : 0,
    journeySessions:restoreJourneySessions(raw?.journeySessions)
  };
}

export function mergeJourneyProfile(remote, local) {
  const a=restoreJourneyProfile(remote), b=restoreJourneyProfile(local);
  const newestGoal=a.journeyGoalAt > b.journeyGoalAt ? a : b;
  let journey=mergeJourney(a.journey,b.journey);
  if (newestGoal.journeyGoalAt) journey=setDailyGoal(journey,newestGoal.journey.dailyGoal);
  const journeySessions={...a.journeySessions};
  for (const [id,value] of Object.entries(b.journeySessions)) {
    const old=journeySessions[id];
    const same=old?.session.sessionId === value.session.sessionId;
    const newer=same ? value.session.events.length > old.session.events.length || (value.session.events.length === old.session.events.length && value.updatedAt >= old.updatedAt) : !old || value.session.startedAt > old.session.startedAt || (value.session.startedAt === old.session.startedAt && value.session.sessionId > old.session.sessionId);
    if (newer) journeySessions[id]=value;
  }
  return {journey,journeyGoalAt:newestGoal.journeyGoalAt,journeySessions};
}

// A later non-assessment is no evidence against an earlier demonstrated answer.
export function mergeAssessmentRecords(remote = {}, local = {}) {
  const records={...remote,...local};
  const union=(a,b)=>[...new Set([...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])])];
  for(const id of new Set([...Object.keys(remote),...Object.keys(local)])){
    const a=remote[id], b=local[id];
    if(!a || !b)continue;
    const next=(a.last||0)>(b.last||0)?a:b, prior=next===a?b:a;
    const combined={...next,attempts:Math.max(a.attempts||0,b.attempts||0),assessments:Math.max(a.assessments||0,b.assessments||0),correct:Math.max(a.correct||0,b.correct||0),days:union(a.days,b.days),questions:union(a.questions,b.questions)};
    if(next.lastAssessment!=='complete'){
      combined.streak=Math.max(prior.streak||0,next.streak||0);
      combined.lastCorrect=prior.lastCorrect===true || next.lastCorrect===true;
      combined.due=Math.min(prior.due,next.due);
    }
    records[id]=combined;
  }
  return records;
}
