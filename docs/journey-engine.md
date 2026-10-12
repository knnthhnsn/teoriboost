# NATKØRSEL learning-journey engine

The journey engine turns the existing, source-reviewed content into a short learning loop. It does not change question ids, wording, answer keys, sources, or lesson content. It does not claim that a completed lesson is durable mastery, an official test result, or permission to drive.

The design follows the useful control loop in `duolingo-evidence.md`: orient, attempt, explain, vary, schedule, and measure. It borrows mechanics such as a visible path, short sessions, error repair, spaced review, daily goals, streaks, and quests. It does not copy a brand, use hearts or paid lockouts, invent classmates, award points for speed, or claim that Duolingo's language-learning model is calibrated for Danish driving theory.

## Content and route

`getRouteUnits` constructs the route from the live `CHAPTERS`, `LESSONS`, and `QUESTIONS` exports. It currently covers all 10 chapters, 58 sections, 58 three-card lessons, and 83 unchanged questions. A route node exposes:

- `lessonComplete`: an objective guided session has been completed for the section;
- `longTermMastery`: a separate view of the existing question record, including error and due-review status;
- `officialQualification: false`: an explicit boundary for UI copy and analytics;
- the existing question ids, so the UI can load the unchanged factual bank.

`getJourneyRecommendations` returns four views. `recommended` prioritises an unresolved error, then a due review, then the next unfinished route node. `next` is the next unfinished route node. `errorPractice` and `duePractice` remain available as separate practice entry points. Review is never locked because of a mistake or payment state.

An unanswered or partially answered exam item is not evidence that the learner chose a wrong answer. Immediate error practice therefore requires `lastAssessment === 'complete'` with an unresolved incorrect result. A completed guided-session event that records a wrong Apply or Checkpoint attempt followed by a correct repair keeps a `needs-practice` badge, but is not recommended immediately: it enters due practice 20 minutes after the completed session. `unanswered`, `partial`, and `unknown` records may receive neutral due review, but are never labelled as demonstrated mistakes. For legacy records, a prior correct result remains a complete assessment; a prior `lastCorrect: false` without assessment provenance becomes `unknown` so old progress is preserved without inventing an error.

## Guided session

`journey-session.js` is a pure state machine. A new lesson uses the five learning stages below plus a terminal state:

1. **Understand:** finish all three authored lesson cards.
2. **Apply:** judge all four statements of an actual question. A wrong attempt stays in the event history and must be repaired.
3. **Transfer:** answer the authored case in free text, then compare with the authored action and reason.
4. **Recall:** answer the authored recall prompt in the learner's own words, reveal the authored answer, and explicitly self-check. The engine never auto-grades this prose.
5. **Checkpoint:** answer a different question from the same section when one exists. If the bank has only one question for that section, the engine reorders the same four statements and labels that fallback clearly; it is not presented as an unseen scenario.
6. **Done:** only reached after the cards, a complete four-answer apply assessment and any repair, the open transfer and recall steps, and a correct checkpoint.

A review deliberately changes the first two stages to **Apply → Understand → Transfer → Recall → Checkpoint**. It opens on a complete, unanswered four-statement assessment before showing any card. A wrong cold attempt stays in Apply for authored feedback and repair; the first correct attempt then opens all three cards. Only after the learner explicitly finishes those cards does the review move to Transfer. This makes the first review attempt a retrieval observation rather than recognition immediately after rereading. Existing saved review sessions from the earlier card-first order fail canonical replay and may be discarded without changing profile or journey progress.

Self-checking prose cannot itself complete a lesson or create mastery. An immediate retry is repair feedback, not delayed recall. Complete wrong attempts in both Apply and Checkpoint are retained after a later correct answer, and completion evidence marks each repaired stage separately. Unanswered or partial submissions are rejected before grading and never become mistake evidence. This lets analytics and the repair quest distinguish first-pass accuracy from eventual repair.

Session state contains content signatures. `restoreJourneySession` checks the current lesson and questions and returns `null` on content or signature drift, an invalid stage order, or an obsolete review event order. The caller should then discard only the transient session value; it must retain the user's journey, core records, preferences, and other profile fields. Grading and finalisation use stable action ids/terminal state so reloads and repeated clicks cannot grade or finish the same transition twice.

## Journey persistence

`journey-core.js` owns a small, storage-agnostic structure:

```js
{
  version: 1,
  dailyGoal: 1, // 1, 2, or 3
  events: [
    {
      sessionId,
      sectionId,
      kind: 'lesson' | 'review',
      startedAt,
      completedAt,
      day, // recalculated in Europe/Copenhagen
      hadWrong,
      repaired,
      checkpointQuestionId
    }
  ]
}
```

Only source events are persisted. Daily counts, rewards, streaks, calendar cells, and quests are derived again on every read. This prevents cached counters from becoming authoritative after reload or cross-tab races.

`restoreJourney` accepts JSON or an object, sanitises every event, recalculates Copenhagen dates, removes duplicate session ids, ignores unknown sections when `sectionIds` is supplied, and safely imports the early `completions` array shape. Invalid input becomes an empty journey. `mergeJourney` unions events by session id and resolves conflicts conservatively; it allows two tabs to complete different sessions without one overwriting the other.

`completeLesson` accepts only an objectively complete session result. It validates that three cards were completed, Apply was graded and correct (with repair if any answer was previously wrong), Recall was self-checked, and Checkpoint was graded correct. It then records one event. Replaying a session id is rejected. A second session for the same section on the same Copenhagen day remains useful practice, but returns no new reward key and does not advance the daily count.

The module deliberately awards no XP and never calls `core.recordAnswer`. The UI should continue to call `recordAnswer` exactly once for each real four-answer assessment. Its existing question/day guard remains the only XP source.

## Daily loop

`getDailySummary` reports progress toward a goal of 1, 2, or 3 objectively completed sessions. The count uses unique section/day pairs, so repeating an easy section cannot farm a goal. Dates use `Europe/Copenhagen`; streaks and the Monday-through-Sunday calendar use calendar-day arithmetic, including DST and month boundaries.

The three solo quests come from completed events:

- finish one new lesson;
- finish a review at least 20 minutes after a previous completed session for that section;
- repair an Apply error and still pass the objective completion gate.

The 20-minute rule is a transparent initial heuristic, not a calibrated Half-Life Regression model or evidence of durable memory. Product evaluation should focus on first-pass accuracy, delayed mixed review, transfer to changed situations, and error patterns. Streak length and lesson completion are engagement/progress signals only.

## Integration outline

On load, the application should restore its existing core profile as it does today, then restore `profile.journey` separately with the current 58 section ids. A session result can be applied like this:

```js
const result = completeLesson(journey, sessionCompletion, Date.now());
if (result.accepted) {
  journey = result.state;
  saveJourney(journey);
}
```

Before saving from a tab, merge the last stored value with the tab's current journey. Storage events should do the same in memory. A rejected session restore should clear only `profile.activeJourneySession`.

When rendering labels, use wording such as “lesson completed”, “review due”, and “developing”. Reserve “mastered” for the existing multi-day record rule, and always keep it separate from official qualification or practical driving ability.

## Pure exports

`journey-core.js` exports `JOURNEY_VERSION`, `copenhagenDay`, `emptyJourney`, `restoreJourney`, `mergeJourney`, `setDailyGoal`, `completeLesson`, `getDailySummary`, `getRouteUnits`, and `getJourneyRecommendations`.

`journey-session.js` exports the session constructor, reducer/transition function, restore/serialize helpers, current-step view, and completion check. Both modules accept their dependencies as arguments and do not access DOM, local storage, network APIs, timers, audio, or `core.js` directly.
