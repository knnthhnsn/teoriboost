import test from 'node:test';
import assert from 'node:assert/strict';
import {WEEK,addTurnEvent,restoreTurnProfile,mergeTurnProfile,turnCurrent,turnSummary} from '../dist/turn-learning.js';
import {restoreState} from '../dist/core.js';
import {mergeJourneyProfile} from '../dist/journey-profile.js';
function run(first='wait',transfer='yield',recall='repeat',at=10000,mode='lesson',contrast='proceed'){
  let p=restoreTurnProfile(null),counter=0; const id=`attempt-${at}`;
  const act=(type,value='')=>p=addTurnEvent(p,{id:`event-${at}-${String(++counter).padStart(3,'0')}`,attemptId:id,type,value,at:at+counter});
  act('start',mode);if(mode==='lesson'){act('view','shoulder');act('next');act('answer','cycle');act('next');act('answer',first);act('next');act('next');if(first!=='wait')act('answer','wait');}
  act('answer',transfer);if(transfer!=='yield'){act('retry');act('answer','yield');}act('next');
  act('answer',contrast);if(contrast!=='proceed'){act('retry');act('answer','proceed');}act('next');
  act('commit','Mit eget svar om spejle, blind vinkel og at holde tilbage.');act('answer',recall);if(recall!=='repeat'){act('retry');act('commit','Mit nye svar');act('answer','repeat');}act('next');
  return p;
}
test('no skipped observation, no completion merely from opening',()=>{
 let p=addTurnEvent(null,{id:'event-001',attemptId:'attempt-001',type:'start',value:'lesson',at:1});
 p=addTurnEvent(p,{id:'event-002',attemptId:'attempt-001',type:'next',value:'',at:2});
 assert.equal(turnCurrent(p).stage,'observe');assert.equal(turnSummary(p).completed,0);
});
test('correct sequence records bounded evidence and a real seven-day due time',()=>{
 const p=run();const s=turnSummary(p);assert.equal(s.completed,1);assert.equal(s.firstActionsCorrect,true);assert.equal(s.latest.stage,'done');
 assert.equal(s.dueAt,s.first.completedAt+WEEK);assert.equal(turnSummary(p,s.dueAt-1).reviewDue,false);assert.equal(turnSummary(p,s.dueAt).reviewDue,true);
});
test('repairs never overwrite first answers',()=>{
 const s=turnSummary(run('turn','signal','once'));assert.equal(s.completed,1);assert.equal(s.firstActionsCorrect,false);
 assert.equal(s.first.firstDecision,'turn');assert.equal(s.first.firstTransfer,'signal');assert.equal(s.first.firstRecall,'once');
 assert.equal(s.first.decision,'wait');assert.equal(s.first.transfer,'yield');assert.equal(s.first.recall,'repeat');
});
test('reload and older-tab merge preserve all evidence idempotently',()=>{
 const p=run('horn');const old={events:p.events.slice(0,3)};
 const merged=mergeTurnProfile(p,old);assert.deepEqual(merged,mergeTurnProfile(old,p));assert.deepEqual(merged,mergeTurnProfile(merged,p));
 assert.equal(turnCurrent(restoreTurnProfile(JSON.parse(JSON.stringify(merged)))).stage,'done');
 const profile=mergeJourneyProfile({turnLab:p},{turnLab:old});
 assert.equal(turnSummary(restoreState({version:1,...profile}).turnLab).completed,1);
});
test('early retries cannot be counted as delayed evidence',()=>{
 const lesson=run();const due=turnSummary(lesson).dueAt;
 const early=mergeTurnProfile(lesson,run('wait','yield','repeat',20000,'review'));
 assert.equal(turnSummary(early,due).delayed,undefined);assert.equal(turnSummary(early,due).reviewDue,true);
 const delayed=mergeTurnProfile(early,run('wait','yield','repeat',due+1,'review'));
 assert.equal(turnSummary(delayed,due+100).reviewDue,false);assert.ok(turnSummary(delayed,due+100).delayed);
});
test('malformed data and invalid actions cannot manufacture a pass',()=>{
 const p=restoreTurnProfile({events:[{id:'bad',attemptId:'attempt-001',type:'complete',value:'',at:3},{id:'event-001',attemptId:'attempt-001',type:'start',value:'lesson',at:1},{id:'event-002',attemptId:'attempt-001',type:'answer',value:'wait',at:2},{id:'event-003',attemptId:'attempt-001',type:'view',value:'overhead',at:3}]});
 assert.equal(turnSummary(p).completed,0);assert.equal(turnCurrent(p).stage,'observe');assert.deepEqual(turnCurrent(p).viewed,[]);
});
test('logical clock preserves causality even when wall-clock timestamps are equal',()=>{
 let p=null;const send=(id,type,value)=>p=addTurnEvent(p,{id,attemptId:'equal-time-attempt',type,value,at:100});
 send('z-start','start','lesson');send('y-view','view','shoulder');send('x-next','next','');send('w-answer','answer','cycle');send('v-next','next','');
 assert.equal(turnCurrent(p).stage,'decision');assert.ok(p.events.every((e,i)=>i===0||e.at>p.events[i-1].at));
 assert.deepEqual(mergeTurnProfile(p,{events:p.events.slice(0,2)}),p);
});
test('large older-tab merges are commutative and keep original completion and newest attempt',()=>{
 const old={events:Array.from({length:3300},(_,i)=>({id:`history-event-${i}`,attemptId:`history-attempt-${Math.floor(i/3)}`,at:i,type:i%3===0?'start':i%3===1?'view':'next',value:i%3===0?'lesson':i%3===1?'shoulder':''}))};
 const completed=run();const latest=run('turn','signal','once',20000);
 const a=mergeTurnProfile(mergeTurnProfile(old,completed),latest),b=mergeTurnProfile(latest,mergeTurnProfile(completed,old));
 assert.deepEqual(a,b);assert.equal(turnCurrent(a).id,'attempt-20000');assert.equal(turnSummary(a).first.id,'attempt-10000');
});
test('one oversized attempt is compacted without losing its first answer or final stage',()=>{
 const id='oversized-attempt',events=[];let at=1,n=0;
 const add=(type,value='')=>events.push({id:`oversized-event-${String(++n).padStart(5,'0')}`,attemptId:id,type,value,at:at++});
 add('start','lesson');add('view','shoulder');add('next');
 for(let i=0;i<1600;i++){add('answer','road');add('retry');}
 add('answer','cycle');add('next');
 const restored=restoreTurnProfile({events}),current=turnCurrent(restored);
 assert.ok(restored.events.length<=3000);assert.equal(current.firstRisk,'road');assert.equal(current.risk,'cycle');assert.equal(current.stage,'decision');
});
test('pruning is commutative and retains the completed delayed review plus newest attempt',()=>{
 const lesson=run(),due=turnSummary(lesson).dueAt,review=run('wait','yield','repeat',due+1,'review');
 const noise=[];let at=due+1000;
 for(let i=0;i<1100;i++){
  const attemptId=`noise-attempt-${String(i).padStart(4,'0')}`;
  noise.push({id:`noise-start-${String(i).padStart(4,'0')}`,attemptId,type:'start',value:'lesson',at:at++});
  noise.push({id:`noise-view-${String(i).padStart(4,'0')}`,attemptId,type:'view',value:'shoulder',at:at++});
  noise.push({id:`noise-next-${String(i).padStart(4,'0')}`,attemptId,type:'next',value:'',at:at++});
 }
 const remote={events:[...lesson.events,...noise.filter((_,i)=>i%2===0)]},local={events:[...review.events,...noise.filter((_,i)=>i%2===1)]};
 const a=mergeTurnProfile(remote,local),b=mergeTurnProfile(local,remote),summary=turnSummary(a,at);
 assert.deepEqual(a,b);assert.ok(a.events.length<=3000);assert.equal(summary.first.id,'attempt-10000');
 assert.equal(summary.delayed.id,`attempt-${due+1}`);assert.equal(summary.reviewDue,false);assert.equal(summary.latest.id,'noise-attempt-1099');
});
test('free recall self-check never becomes independently scored evidence',()=>{
 const s=turnSummary(run());assert.equal(s.recallIndependentlyScored,false);assert.equal(typeof s.first.firstRecallText,'string');
});
test('contrast prevents a wait-always answer from completing the lesson and keeps first error',()=>{
 const s=turnSummary(run('wait','yield','repeat',10000,'lesson','always-wait'));
 assert.equal(s.completed,1);assert.equal(s.first.firstContrast,'always-wait');assert.equal(s.first.contrast,'proceed');assert.equal(s.firstActionsCorrect,false);
});
test('image selection records modality and response latency separately from text answers',()=>{
 let p=null;const send=(id,type,value)=>p=addTurnEvent(p,{id,attemptId:'point-attempt',type,value,at:100,latencyMs:789});
 send('point-start','start','lesson');send('point-view','view','shoulder');send('point-next','next','');send('point-hit','point','cycle');
 assert.equal(turnCurrent(p).stage,'risk-feedback');assert.equal(turnCurrent(p).firstRiskMethod,'image');assert.equal(p.events.at(-1).latencyMs,789);
});
