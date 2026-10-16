# First exemplar: the second look

Recorded before implementation, 2026-10-16. Baseline source e4464be, inspected locally in a browser.

## Observed problem and hypothesis

`#journey:sving-cykel` opens with three prose cards. The first browser render shows no traffic situation and asks only for “Næste kort”. Existing static images cannot demonstrate a cyclist moving from behind to alongside a turning vehicle. Hypothesis: a situation-first lesson can make repeated orientation and yielding understandable with less reading. This is not a measured learner result.

## Scope and acceptance criteria

- One approximately three-minute self-paced lesson, no compulsory timer: observe, inspect the right side, decide, see a consequence, explain, solve a different road layout, retrieve the rule.
- First decisions remain recorded after repairs. An incorrect response receives specific corrective practice, never a false first-attempt pass.
- Scene model places a northbound car to the left of a same-direction cycle track. A right turn crosses the cycle track. Safe playback yields; unsafe playback stops before contact. Explanation paths appear only after a decision.
- A second layout crosses a continuous cycle track into an access road, rather than merely reordering the same answers. A third layout is reserved for a seven-day return. No claim that these alone measure broad transfer or real-world driving.
- Source identifiers, applicable rule text and curriculum anchors accompany the explanation. Unqualified source review is labelled separately from instructor sign-off.
- Local Danish Jeppe voice, existing gesture-gated sound effects, motion controls, keyboard operation, phone layout without horizontal overflow or covered controls. Muting and route exit stop playback. Static mode preserves the instructional consequence.
- Save/resume and older-tab merges retain first responses and completion; a completion and delayed review have distinct evidence. No new exam score, XP-based mastery or claim of exam readiness.
- Preserve existing lessons, exam semantics, protected profile data and private audience.

## Independent learner evaluation prepared, not performed

Use an active comparison with the existing sving-cykel lesson. Counterbalance lesson order with equivalent but separate test sets; where practicable randomly allocate independent groups to avoid crossover learning. Record prior experience. Do not reuse training pictures in the outcome set.

Primary outcome: serious rule/observation errors on unseen scenarios after seven days. Also record immediate unseen-scenario correctness, rationale, time at comparable accuracy, delayed free recall, and confidence versus correctness. Measure enjoyment/voluntary return separately. Define serious errors with a qualified instructor before testing, and freeze scoring without knowledge of group assignment. Use a usability pilot to diagnose failures; choose an efficacy sample from pilot variance and the smallest worthwhile improvement, not a convenient small participant count.

Prepare consent/instructions, source/scene review sheet, anonymised answer sheet and result template. Qualified instructor review and real participants are not yet available. No fabricated results, efficacy or crash-reduction claims.

## Evidence to collect

Deterministic state/merge and geometry checks; actual 390px and 320px renders at important stages; completed good and repair paths; reload mid-lesson; audio playback; reduced-motion/mute; actual baseline and new interaction timings; raw Claude critique and bounded Jev synthetic triage. Broader rollout waits until this exemplar has passed its applicable checks and remaining human gates are stated.
