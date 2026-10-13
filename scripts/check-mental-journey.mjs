import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { CHAPTERS, QUESTIONS } from '../dist/content.js';
import { LESSONS } from '../dist/lessons.js';
import { createJourneySession, transitionJourneySession, getJourneyStep, nextJourneyActionId, restoreJourneySession, serializeJourneySession, JOURNEY_ACTIONS as A } from '../dist/journey-session.js';
import { emptyJourney, completeLesson, getDailySummary } from '../dist/journey-core.js';

const content={questions:QUESTIONS,lessons:LESSONS};
let at=Date.UTC(2026,9,13,10), restoredActions=0, journey=emptyJourney(), count=0;
for(const section of CHAPTERS.flatMap(chapter=>chapter.sections)){
  const question=QUESTIONS.find(item=>item.sectionId===section.id);
  assert.ok(question && LESSONS[section.id]);
  let session=createJourneySession({sessionId:`qa-mental-${section.id}`,kind:'lesson',question,lesson:LESSONS[section.id],questions:QUESTIONS,startedAt:at++});
  const action=(type,payload={})=>{
    const result=transitionJourneySession(session,{type,...payload,at:at++,actionId:nextJourneyActionId(session,type)},content);
    assert.equal(result.outcome.accepted,true,`${section.id}: ${type}`);
    session=result.session;
    assert.deepEqual(restoreJourneySession(serializeJourneySession(session),content),session,`${section.id}: replay ${type}`);
    restoredActions++; return result.outcome;
  };
  for(let index=0;index<3;index++)action(A.READ_CARD,{index});
  action(A.SUBMIT_APPLY,{answers:getJourneyStep(session,content).question.statements.map(statement=>statement.correct)});
  action(A.COMMIT_TRANSFER_MENTAL);
  assert.equal(getJourneyStep(session,content).modelAnswer,null);
  action(A.REVEAL_TRANSFER); action(A.CONTINUE_TRANSFER);
  action(A.COMMIT_RECALL_MENTAL);
  assert.equal(getJourneyStep(session,content).modelAnswer,null);
  action(A.REVEAL_RECALL); action(A.SELF_CHECK_RECALL,{selfCheck:'remembered'});
  action(A.SUBMIT_CHECKPOINT,{answers:getJourneyStep(session,content).question.statements.map(statement=>statement.correct)});
  const finished=action(A.FINALIZE);
  const completion=completeLesson(journey,finished.evidence,at++);
  assert.equal(completion.accepted,true); journey=completion.state;
  assert.equal(completeLesson(journey,finished.evidence,at++).duplicate,true);
  count++;
}
assert.equal(count,58); assert.equal(getDailySummary(journey,at).completedSessions,58);
const report={checked:new Date().toISOString(),lessons:count,restoredActions,distinctRecorded:getDailySummary(journey,at).completedSessions,duplicateCounted:0,scope:'DOM-free canonical mental-flow simulation using fixed test time. No browser rendering, human learning, timing or retention evidence.'};
await writeFile(new URL('../evidence/experience-all-lessons.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
