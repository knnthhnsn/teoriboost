# Natkørsel: lighter learning experience, 13 October 2026

The previous screen spent attention on a poster and multiple controls before the learner reached the route. Lessons stacked text, required writing, and gave little response between steps. The new experience centres on one next action, one readable card or statement, immediate feedback, and an honest record of completed practice.

## Implemented

- Compact navy route, raised lime active node, a curved road connecting actual rendered node centres, and existing original transparent art. Calendar and goal controls open on request.
- One complete authored card at a time. Duplicate introductory copy is removed from the default view; full narration still exposes the introduction and all three cards. Card text and source references remain intact. On phones the card uses the full width, and its primary action is in normal layout flow.
- One statement at a time with 220 ms auto-advance, 120/240 ms directional transitions, back/revisit controls, stable photo/zoom and grading only after all four answers. Feedback preserves progress, supports free repair and retains authored humor after grading.
- Mental commit/reveal for transfer and recall, with optional writing. The learner explicitly compares their own answer. The app does not infer or grade an unobserved mental answer.
- Real daily completion and streak in the result, a visible return action and an optional next lesson. No duplicate success toast covering the action. Completion is deduplicated; existing question and exam progress remains separate from guided lesson progress.
- Original short local earcons for selection, card advance, success, repair and completion. Audio starts after a trusted gesture, can be muted, avoids narration overlap and is suppressed in an active exam. Saved explicit mute preferences remain valid; new profiles enable feedback sounds.
- User and system reduced-motion settings, 44 px learning controls, stage-change focus/scroll, and saved statement position, writing mode and drafts.

## Local evidence

- 92 automated tests passed. Build validation passed: 12 sources, 10 chapters, 58 sections/lessons, 83 questions, 17 garage areas, 1,235 verified local narration files and 131 runtime files.
- All 58 lesson bindings completed a canonical mental-flow simulation with 696 action restores. Duplicate finalizations counted zero extra sessions. This is a DOM-free simulation using a fixed test time.
- Actual local browser: complete cockpit lesson with a deliberately wrong set, explanation, repair, mental transfer, optional written recall, checkpoint reload and completion. A second complete assistant lesson used mental transfer and mental recall.
- Mental commit, written draft, four pending answers and graded checkpoint feedback survived actual reloads. Local daily counts changed from zero to one, then two after distinct completions, and survived reloads.
- Browser measurements observed running AudioContext synthesis, the 120/240 ms statement transitions and intermediate animation frames. The photo DOM node was retained across a statement transition. Correct/completion notes were scheduled at their authored frequencies.
- Muted/no-motion card advance produced zero oscillator nodes, zero WAAPI calls and zero active animations. An emulated system reduced-motion preference overrode the enabled app motion setting; the temporary override was reset.
- Direct 320 px checks: no horizontal overflow after the control fix, full card text ends before the primary action, and the completion primary action ends at about 622 px in a 715 px viewport. Debug measurement hooks were removed by reloading the test page.
- Jeppe narration played the authored case to its end (7.344 seconds). The bank, factual wording, facit, photo files and voice pack were not changed in this iteration.

Saved local evidence is in `evidence/experience-*.jpg` and `evidence/experience-*-probe.json` (ignored test artifacts).

## Independent feedback and limits

Claude reviewed two real 390 px screenshots. Its layout findings prompted the removal of duplicate intro copy, full-width phone cards, normal-flow primary action and an explicit “Næste” action inside the active route node. Its reading-burden/interleaving suggestion remains a hypothesis requiring real timing and comprehension tests; full factual card text was retained. See `research/claude-experience-review.md`.

One text-only Jev classification used the existing account allowance. It received zero pixels/audio and performed zero app actions. It prioritised real learner timing and delayed knowledge testing, and did not establish causal retention improvement. Its numeric output is synthetic, not a human survey or a measured percentage lift. See `research/jev-experience-triage.json`.

These checks do not establish full curriculum coverage, instructor approval, human learning efficacy, market leadership, every browser/device combination or a public release. Some sections still have one question; explicitly labelled reordered repetition does not prove unseen-scene transfer. The 20-minute review delay is a starting heuristic.

## Publication handoff

The existing owner-private Sites project is reused. Publication and final hosted UI checks occur after the frozen source is pushed and packaged. Their authoritative result is saved separately in ignored `evidence/experience-site-published.json` and `evidence/experience-hosted-qa.json`; this preparation document does not claim a deployment before it succeeds.
