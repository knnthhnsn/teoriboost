# Procedural exam traffic scenes

`dist/exam-traffic-scenes.js` supplies static Three.js situation scenes for the road-based exam questions. It exports `TRAFFIC_SCENE_IDS` and `buildTrafficScene(THREE, question)`. Unsupported IDs return `null` so the detail-illustration layer can handle them.

## Coordinate and camera convention

- The ego vehicle travels toward negative `z` in the right lane at `x = 2`.
- Oncoming vehicles use a heading of `Math.PI`; actors approaching from the right on a cross street use `Math.PI / 2`.
- Road signs on the ego approach face positive `z`.
- Driver, rear-oblique, side-oblique, and overhead views are named in `viewLabel`. Driver views place the camera at the ego driver's position near the decision and hide the exterior ego mesh. Overhead views automatically frame the critical actors and are reserved for geometry that must be unambiguous, such as blind spots, cross-traffic, lane position, roundabouts, and measured parking situations.
- Crossroads are constructed with open road mouths: curbs, pavements, edge lines, and lane separators stop before the conflict area rather than crossing it.
- `facts` only repeat visible conditions from `question.context`; they do not reveal the correct response.

## Coverage

The module owns these 60 IDs:

`q-002`, `q-006`, `q-007`, `q-008`, `q-009`, `q-010`, `q-011`, `q-012`, `q-013`, `q-014`, `q-016`, `q-020`, `q-021`, `q-022`, `q-023`, `q-024`, `q-025`, `q-026`, `q-027`, `q-028`, `q-029`, `q-030`, `q-031`, `q-032`, `q-033`, `q-034`, `q-035`, `q-036`, `q-037`, `q-038`, `q-039`, `q-040`, `q-042`, `q-043`, `q-044`, `q-051`, `q-052`, `q-056`, `q-058`, `q-059`, `q-060`, `q-061`, `q-062`, `q-063`, `q-064`, `q-065`, `q-066`, `q-067`, `q-068`, `q-071`, `q-072`, `q-073`, `q-074`, `q-075`, `q-076`, `q-077`, `q-078`, `q-081`, `q-082`, `q-083`.

Every ID has a dedicated builder. Shared meshes cover shaped car and van bodies, truck, tractor, ambulance, tram, motorcycle, bicycle and rider, adults and children, Scandinavian street buildings, hedges, trees, curbs, pavements, lane markings, guardrails, motorway shoulders, railway track, crossings, roadworks, wet roads, rain, frost and darkness.

## Sign and factual checks

- `q-002`: temporary speed sign uses a yellow temporary face with red circular border and `50`.
- `q-032`, `q-059`, `q-064`: B 13 uses an octagonal red STOP face and a separate stop line.
- `q-058`: B 11 uses an inverted white triangle with red border; S 11 yield triangles point toward the approaching ego vehicle.
- `q-060`: C 55 uses a white circular `60` face with red border.
- `q-061`: D 15 is a blue circular sign with a white down-left arrow on a raised island.
- `q-074`: E 51 is represented as a blue rectangular play-street sign at the entrance.
- `q-075`: the cycle-street entry is represented by a blue rectangular bicycle sign, with two cyclists and a raised bump in the street.
- `q-025` and `q-078`: railway and light-rail tracks cross the ego route at right angles; queued vehicles or the approaching tram are placed on the far side/from the left as stated.
- `q-031`, `q-033`, `q-065`, `q-067`, `q-071`, and `q-077`: right-side actors travel toward the conflict point, not away from it.

The question text remains authoritative. Scenes intentionally omit rule verdicts, recommended actions, and answer-state colors.
