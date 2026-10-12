import test from 'node:test';
import assert from 'node:assert/strict';
import {blankState,restoreState,recordAnswer,isMastered,reviewQueue} from '../dist/core.js';
import {CHAPTERS,QUESTIONS} from '../dist/content.js';
import {LESSONS} from '../dist/lessons.js';
import {getRouteUnits,setDailyGoal} from '../dist/journey-core.js';
import {mergeJourneyProfile} from '../dist/journey-profile.js';
import {createJourneySession,transitionJourneySession,nextJourneyActionId,restoreJourneySession,JOURNEY_ACTIONS} from '../dist/journey-session.js';
const content={questions:QUESTIONS,lessons:LESSONS};
const question=QUESTIONS[0], time=Date.UTC(2026,9,12,8);
const make=()=>createJourneySession({sessionId:'journey-profile-test',kind:'lesson',question,lesson:LESSONS[question.sectionId],questions:QUESTIONS,startedAt:time});

test('new journey and resumed lesson survive profile restore without losing old progress',()=>{
  const profile=blankState();recordAnswer(profile,question,question.statements.map(s=>s.correct),time);
  profile.settings.humor=false;profile.sessions=5;profile.history=[{at:time,errors:3,unanswered:0}];
  profile.journey=setDailyGoal(profile.journey,2);profile.journeyGoalAt=time;
  const session=make();profile.journeySessions[question.sectionId]={session,updatedAt:time,ui:{answers:[true,null,null,null],transferDraft:'Min kladde',recallDraft:'',feedback:null}};
  const result=restoreState(JSON.stringify(profile));
  assert.equal(result.xp,15);assert.equal(result.sessions,5);assert.equal(result.history[0].errors,3);assert.equal(result.settings.humor,false);
  assert.equal(result.journey.dailyGoal,2);assert.equal(result.journeyGoalAt,time);
  const saved=result.journeySessions[question.sectionId];assert.ok(restoreJourneySession(saved.session,content));
  assert.equal(saved.ui.transferDraft,'Min kladde');assert.deepEqual(saved.ui.answers,[true,null,null,null]);
});

test('explicit daily goal can decrease and stale tabs cannot raise it again',()=>{
  const old=blankState();old.journey=setDailyGoal(old.journey,3);old.journeyGoalAt=time;
  const next=blankState();next.journey=setDailyGoal(next.journey,1);next.journeyGoalAt=time+1;
  const merged=mergeJourneyProfile(old,next);assert.equal(merged.journey.dailyGoal,1);
  assert.equal(mergeJourneyProfile(merged,old).journey.dailyGoal,1);
});

test('a stale lesson snapshot cannot overwrite later transitions in the same session',()=>{
  const initial=make();const progressed=transitionJourneySession(initial,{type:JOURNEY_ACTIONS.READ_CARD,index:0,actionId:nextJourneyActionId(initial,JOURNEY_ACTIONS.READ_CARD),at:time+10},content).session;
  const a=blankState(),b=blankState();a.journeySessions[question.sectionId]={session:progressed,ui:{},updatedAt:time+10};b.journeySessions[question.sectionId]={session:initial,ui:{},updatedAt:time+20};
  assert.equal(mergeJourneyProfile(a,b).journeySessions[question.sectionId].session.events.length,1);
});

test('unanswered exam provenance and legacy records never invent an observed mistake',()=>{
  const profile=blankState();recordAnswer(profile,question,[null,null,null,null],time);
  assert.equal(profile.records[question.sectionId].lastAssessment,'unanswered');
  recordAnswer(profile,question,[true,null,false,null],time+1);assert.equal(profile.records[question.sectionId].lastAssessment,'partial');
  const restored=restoreState({...profile,records:{[question.sectionId]:{...profile.records[question.sectionId],lastAssessment:undefined}}});
  assert.equal(restored.records[question.sectionId].lastAssessment,'unknown');
  const node=getRouteUnits({chapters:CHAPTERS,lessons:LESSONS,questions:QUESTIONS,journey:restored.journey,records:restored.records,now:time+2}).flatMap(unit=>unit.nodes).find(n=>n.sectionId===question.sectionId);
  assert.notEqual(node.status,'needs-repair');assert.equal(node.longTermMastery.hasError,false);
  recordAnswer(profile,question,question.statements.map(s=>!s.correct),time+3);assert.equal(profile.records[question.sectionId].lastAssessment,'complete');
});

test('invalid transient sessions are bounded and do not reset the core profile',()=>{
  const source=blankState();source.xp=90;source.journeySessions={bad:{session:{sectionId:'bad',events:new Array(201).fill({})},ui:{},updatedAt:time}};
  const restored=restoreState(source);assert.equal(restored.xp,90);assert.deepEqual(restored.journeySessions,{});
});

test('unanswered exam preserves previously demonstrated recall and is a neutral due review',()=>{
  const profile=blankState(), answers=question.statements.map(s=>s.correct);
  recordAnswer(profile,question,answers,time);recordAnswer(profile,question,answers,time+1);recordAnswer(profile,question,answers,time+86400000);
  assert.equal(isMastered(profile.records[question.sectionId]),true);
  recordAnswer(profile,question,[null,null,null,null],time+86400001);
  assert.equal(profile.records[question.sectionId].lastAssessment,'unanswered');assert.equal(profile.records[question.sectionId].streak,3);
  assert.equal(isMastered(profile.records[question.sectionId]),true);assert.equal(profile.records[question.sectionId].assessments,3);
  const wrong=QUESTIONS.find(q=>q.sectionId!==question.sectionId);recordAnswer(profile,wrong,wrong.statements.map(s=>!s.correct),time+86400002);
  assert.equal(reviewQueue(profile,[question,wrong],time+86400003)[0].id,wrong.id);
});

test('stale previous lesson cannot overwrite a newer review generation',()=>{
  const old=blankState(), fresh=blankState();
  const first=make(), second=createJourneySession({sessionId:'journey-profile-new-review',kind:'review',question,lesson:LESSONS[question.sectionId],questions:QUESTIONS,startedAt:time+20});
  old.journeySessions[question.sectionId]={session:first,ui:{},updatedAt:time+1000};fresh.journeySessions[question.sectionId]={session:second,ui:{},updatedAt:time+21};
  assert.equal(mergeJourneyProfile(fresh,old).journeySessions[question.sectionId].session.sessionId,second.sessionId);
  assert.equal(mergeJourneyProfile(old,fresh).journeySessions[question.sectionId].session.sessionId,second.sessionId);
});
