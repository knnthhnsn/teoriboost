# Independent review: early traffic photos

Scope: read-only pixel review of all 31 entries in `authoring/exam-traffic-photo-manifest.json`, compared with the supplied authoritative contexts in `dist/content.js`. Every listed PNG was opened with `view_image` at high detail.

This is an independent visual geometry check. It is not qualified instructor approval. A static frame can show relative placement and visible conditions, but cannot prove motion, indicator cadence, recognition-system state, intention, exact speed, or physical distance.

| ID | Review |
|---|---|
| q-002 | ACCEPT. Clear road, dashboard shows 80, and the recently passed 50 roadworks sign is visible in the right mirror. Static image cannot prove the temporal act of passing. |
| q-006 | ACCEPT. Car is parked at the right curb, cyclist is behind it, and the left indicator is visibly illuminated. Indicator cadence and cyclist speed remain unproven. |
| q-007 | ACCEPT. Closed cone practice area, left bend, and cone close to the car’s right-front/passenger-side corner are visible. Gaze and speed are not provable. |
| q-008 | ACCEPT. Car is reversing from a driveway over the pavement; a child is partly hidden by the hedge at the right. The frame cannot prove movement or the child’s awareness. |
| q-009 | ACCEPT. Right passenger door is open toward the raised separate cycle path; cyclist approaches from behind on that path. Door-opening timing and cyclist speed are not provable. |
| q-010 | ACCEPT. Missed exit is visible in the right mirror and a clear “5 km” sign marks the next opportunity. |
| q-011 | ACCEPT. Motorcycle is slightly behind and to the left of the car in the multi-lane city road. Exact blind-spot extent is a static-image limitation. |
| q-012 | ACCEPT. Long truck is positioned left before a tight right bend, with right indicator visible. Indicator state is visible only in this frame. |
| q-013 | ACCEPT. Night road has a slower car ahead and one distant oncoming motorcycle headlamp. Exact distance and speed are not certified. |
| q-014 | ACCEPT WITH STATIC LIMIT. Car is beginning a right turn across the raised separate cycle path and the e-bike is behind on that path. The image supports the stated geometry, while turn timing and movement remain inferred. |
| q-016 | ACCEPT. Ball is in the residential street between parked cars and no child is visible. Absence outside the frame cannot be proven. |
| q-020 | ACCEPT. Close following car fills the rear-view mirror on a narrow wet country road. Relative closeness is visible; following speed and time gap are not. |
| q-021 | ACCEPT. Frosty scene has a dry approach and a visibly thin icy sheen on the shaded bridge deck before the bend. Ice thickness/grip cannot be measured from pixels. |
| q-022 | ACCEPT. Hard rain, short visibility, spray and slow traffic are clearly visible. Exact speed and visibility distance are not measurable. |
| q-023 | ACCEPT. Tractor is immediately before the blind crest on a narrow country road, blocking the forward view. Exact separation distance is not certified. |
| q-024 | ACCEPT. School frontage, right-curb parked cars, obscured pavement and an adult at an open passenger-side door are visible. Child movement and intent are not provable. |
| q-025 | ACCEPT. Railway barriers are raised and lights are off; the queue beyond leaves no visible clearance over the tracks. Static frame cannot establish signal change timing. |
| q-026 | ACCEPT. Green traffic signal and uniformed officer’s clear palm-out stop signal are both visible. The image contains no conflicting extra stop control. |
| q-027 | ACCEPT. Green signal is visible, while the ego lane is queued immediately beyond the otherwise open intersection. No extra STOP control is visible; queue blockage is the relevant condition. |
| q-028 | ACCEPT WITH STATIC LIMIT. Car is stopped at the right-side road mouth and its own right indicator is visibly lit; driver face is hidden. The indicator cannot promise that the car will actually turn. |
| q-029 | ACCEPT. Ego is stopped at red, ambulance with blue lights is visible behind in the mirror, and pedestrians cross ahead. Emergency vehicle distance and priority timing are not certified. |
| q-030 | ACCEPT. Fresh non-graphic night crash is shown with car partly on the road and a person in the ditch. Injury severity and event timing are outside what the image can establish. |
| q-031 | ACCEPT. Car exits the petrol station across the pavement and raised cycle path; traffic is visible to the left and cyclist to the right. Exact gaps and speed are not measurable. |
| q-033 | ACCEPT. Equal uncontrolled intersection is shown with one car travelling right-to-left across the ego path. The frame supports relative geometry without certifying the legal outcome. |
| q-035 | ACCEPT. Roundabout exit, pedestrian stepping onto the exit crossing, and cyclist continuing on the outer cycle track are spatially coherent in the elevated view. Movement and exact priority timing remain inferred. |
| q-036 | ACCEPT. 80 sign, hard rain, short sight and standing water in the wheel tracks are all visible. The sign is a limit, not proof of a safe speed; water depth cannot be measured. |
| q-037 | ACCEPT. Car in the left lane is slightly behind the ego car in the right lane; relative rear placement supports the stated side-by-side geometry. Motion is inferred. |
| q-038 | ACCEPT. Rear-facing van is parked on its own right side and an oncoming car approaches beside the narrowing. Exact road width and right-of-way are not certified. |
| q-039 | ACCEPT. Overtaking car is already pulled into the oncoming lane to the ego’s left/rear, with a slower car ahead. Overtaking motion is inferred from placement. |
| q-058 | ACCEPT. Yield sign and yield teeth face the ego at an otherwise empty intersection. The visible frame cannot establish traffic outside the field of view. |
| q-068 | ACCEPT. One pedestrian is visibly stepping from the right into the unsignalized zebra crossing. Intention and speed are inferred from pose. |

## Summary

All 31 assets pass this bounded visual geometry review with no obvious contradiction requiring regeneration or metadata correction. The strongest caution cases are q-014 (turn motion inferred), q-027 (green signal does not override the blocked exit), q-028 (indicator does not promise an actual turn), q-035 (roundabout exit participants are coherent but timing is static), q-036 (wet-road conditions are visible but safe speed is not certified), and q-039 (overtaking is inferred from relative placement).

