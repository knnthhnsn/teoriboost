import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTERS,QUESTIONS} from '../dist/content.js';
import {LESSONS} from '../dist/lessons.js';
import {createJourneySession,transitionJourneySession,restoreJourneySession,getJourneyStep,nextJourneyActionId,JOURNEY_ACTIONS} from '../dist/journey-session.js';
import {emptyJourney,completeLesson,getRouteUnits} from '../dist/journey-core.js';

test('all58 live lesson bindings complete and restore with their own cases and actual checkpoints',()=>{
  const content={questions:QUESTIONS,lessons:LESSONS}, sections=CHAPTERS.flatMap(c=>c.sections);
  let journey=emptyJourney(), now=Date.UTC(2026,9,12,8);
  for(const section of sections){
    const question=QUESTIONS.find(q=>q.sectionId===section.id),lesson=LESSONS[section.id];
    assert.ok(question,section.id+' needs an assessment');assert.ok(lesson,section.id+' needs a lesson');
    let session=createJourneySession({sessionId:'bank-'+section.id,kind:'lesson',question,lesson,questions:QUESTIONS,startedAt:now});
    const act=(type,fields={})=>{
      const result=transitionJourneySession(session,{type,actionId:nextJourneyActionId(session,type),at:++now,...fields},content);
      assert.equal(result.outcome.accepted,true,section.id+' '+type);session=result.session;
      assert.ok(restoreJourneySession(JSON.stringify(session),content),section.id+' replay '+type);return result.outcome;
    };
    for(let index=0;index<3;index++)act(JOURNEY_ACTIONS.READ_CARD,{index});
    act(JOURNEY_ACTIONS.SUBMIT_APPLY,{answers:question.statements.map(s=>s.correct)});
    assert.deepEqual(getJourneyStep(session,content).case,lesson.case,section.id+' must use its own authored case');
    act(JOURNEY_ACTIONS.SUBMIT_TRANSFER,{answer:'Et lokalt testsvar; ingen automatisk sproglig bedømmelse.'});
    act(JOURNEY_ACTIONS.CONTINUE_TRANSFER);act(JOURNEY_ACTIONS.SUBMIT_RECALL,{answer:'Et lokalt genkaldelsesforsøg.'});
    act(JOURNEY_ACTIONS.SELF_CHECK_RECALL,{selfCheck:'remembered'});
    const checkpoint=getJourneyStep(session,content).question;
    assert.equal(checkpoint.sectionId,section.id);act(JOURNEY_ACTIONS.SUBMIT_CHECKPOINT,{answers:checkpoint.statements.map(s=>s.correct)});
    const result=completeLesson(journey,act(JOURNEY_ACTIONS.FINALIZE).evidence,++now);
    assert.equal(result.accepted,true,section.id+' completion');journey=result.state;
  }
  assert.equal(journey.events.length,58);
  const nodes=getRouteUnits({chapters:CHAPTERS,lessons:LESSONS,questions:QUESTIONS,journey,records:{},now}).flatMap(u=>u.nodes);
  assert.equal(nodes.filter(n=>n.lessonComplete).length,58);assert.ok(nodes.every(n=>n.officialQualification===false));
});
