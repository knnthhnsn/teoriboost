import test from 'node:test';
import assert from 'node:assert/strict';
import {blankState,restoreState,recordAnswer,isMastered} from '../dist/core.js';
import {QUESTIONS} from '../dist/content.js';
import {mergeJourneyProfile,mergeAssessmentRecords} from '../dist/journey-profile.js';
import {readProtectedProfile,writeProtectedProfile} from '../dist/profile-store.js';
const legacyKey='learning.v1',protectedKey='learning.v1.protected-v1';
const merge=(a,b)=>({...b,...mergeJourneyProfile(a,b),records:mergeAssessmentRecords(a.records,b.records),xp:Math.max(a.xp,b.xp)});
const keys={legacyKey,protectedKey,merge};
const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),values};};
const time=Date.UTC(2026,9,12,8),question=QUESTIONS[0];
function withJourney(){const state=blankState();state.xp=45;state.settings.humor=false;state.journey.events=[{sessionId:'protected-lesson',sectionId:question.sectionId,kind:'lesson',startedAt:time,completedAt:time+100,day:'2026-10-12',hadWrong:false,repaired:false,checkpointQuestionId:question.id}];return state;}

test('closing a pre-journey tab cannot erase the protected completed lesson',()=>{
  const disk=storage(), current=withJourney();writeProtectedProfile(disk,current,keys);
  const oldBuild=JSON.parse(disk.getItem(legacyKey));delete oldBuild.journey;delete oldBuild.journeySessions;delete oldBuild.journeyGoalAt;
  disk.setItem(legacyKey,JSON.stringify(oldBuild));
  const restored=readProtectedProfile(disk,keys);assert.equal(restored.journey.events.length,1);assert.equal(restored.journey.events[0].sessionId,'protected-lesson');assert.equal(restored.xp,45);
});

test('missing or corrupt protected copy preserves original preferences',()=>{
  const disk=storage(), old=blankState();old.settings={humor:false,motion:false,sound:true};disk.setItem(legacyKey,JSON.stringify(old));
  assert.deepEqual(readProtectedProfile(disk,keys).settings,old.settings);
  disk.setItem(protectedKey,'{broken');assert.deepEqual(readProtectedProfile(disk,keys).settings,old.settings);
});

test('protected first write survives failure of the later compatibility write',()=>{
  const disk=storage(), state=withJourney();const calls=[];
  const fragile={getItem:disk.getItem,setItem:(key,value)=>{calls.push(key);if(key===legacyKey)throw new Error('quota');disk.setItem(key,value);}};
  assert.throws(()=>writeProtectedProfile(fragile,state,keys),/quota/);assert.deepEqual(calls,[protectedKey,legacyKey]);
  assert.equal(readProtectedProfile(disk,keys).journey.events.length,1);
});

test('failed protection never overwrites the only existing legacy copy',()=>{
  const disk=storage(), old=blankState();old.xp=30;disk.setItem(legacyKey,JSON.stringify(old));
  const fragile={getItem:disk.getItem,setItem:()=>{throw new Error('quota');}};
  assert.throws(()=>writeProtectedProfile(fragile,withJourney(),keys),/quota/);assert.equal(JSON.parse(disk.getItem(legacyKey)).xp,30);
});

test('later unknown old-build assessment retains prior demonstrated recall but remains neutral',()=>{
  const proven=blankState(), answers=question.statements.map(s=>s.correct);
  recordAnswer(proven,question,answers,time);recordAnswer(proven,question,answers,time+1);recordAnswer(proven,question,answers,time+86400000);
  const old=restoreState(JSON.stringify(proven));old.records[question.sectionId]={...old.records[question.sectionId],last:time+86400010,lastAssessment:'unknown',lastCorrect:false,streak:0,due:time+86400010};
  const combined=merge(old,proven);assert.equal(isMastered(combined.records[question.sectionId]),true);assert.equal(combined.records[question.sectionId].lastAssessment,'unknown');assert.equal(combined.records[question.sectionId].due,time+86400010);
  old.records[question.sectionId].lastAssessment='complete';assert.equal(isMastered(merge(old,proven).records[question.sectionId]),false);
});
