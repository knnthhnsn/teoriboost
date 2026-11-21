import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, QUESTIONS } from '../dist/content.js';
import { LESSONS } from '../dist/lessons.js';
import { emptyJourney, completeLesson, getRouteUnits, getDailySummary, getJourneyRecommendations } from '../dist/journey-core.js';
import { renderJourneyHome } from '../dist/journey-view.js';

const time=Date.UTC(2026,9,13,10);
const active=html=>html.match(/href="#journey:([^"]+)"[^>]*aria-current="step"/)?.[1];

test('chapter choice exposes one real next action without a nested main landmark',()=>{
  const input={chapters:CHAPTERS,lessons:LESSONS,questions:QUESTIONS,journey:emptyJourney(),records:{},now:time};
  const html=renderJourneyHome({units:getRouteUnits(input),daily:getDailySummary(input.journey,time),recommendations:getJourneyRecommendations(input),activeUnitId:'bil'});
  assert.equal(active(html),'cockpit');assert.ok(!html.includes('<main'));
  assert.equal((html.match(/<option /g)||[]).length,10);
  assert.ok(html.includes('0/5 lektioner gennemført'));
});

test('switching chapter does not turn a just repaired lesson into an immediate review',()=>{
  const evidence={sessionId:'view-repaired-session',sectionId:'cockpit',kind:'lesson',objectiveComplete:true,cardsCompleted:3,apply:{graded:true,correct:true,hadWrong:true,repaired:true},recall:{selfChecked:true},checkpoint:{graded:true,correct:true,hadWrong:false,repaired:false,questionId:QUESTIONS.find(q=>q.sectionId==='cockpit').id}};
  const completed=completeLesson(emptyJourney(),evidence,time);assert.equal(completed.accepted,true);
  const records={cockpit:{assessments:2,correct:1,streak:1,days:['2026-10-13'],lastAssessment:'complete',lastCorrect:true,last:time,due:time+20*60000},stop:{assessments:1,correct:0,streak:0,days:[],lastAssessment:'complete',lastCorrect:false,last:time,due:time}};
  const model=now=>{const input={chapters:CHAPTERS,lessons:LESSONS,questions:QUESTIONS,journey:completed.state,records,now};return {units:getRouteUnits(input),daily:getDailySummary(input.journey,now),recommendations:getJourneyRecommendations(input),activeUnitId:'bil'};};
  assert.equal(model(time+1000).recommendations.recommended.sectionId,'stop');
  assert.equal(active(renderJourneyHome(model(time+1000))),'assistenter');
  assert.equal(active(renderJourneyHome(model(time+20*60000+1))),'cockpit');
});
