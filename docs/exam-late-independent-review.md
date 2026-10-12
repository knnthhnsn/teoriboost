# Independent pixel review — late traffic photographs

Date: 2026-10-12  
Scope: `q-040`, `q-042`, `q-043`, `q-044`, `q-051`, `q-052`, `q-056`, `q-060`–`q-065`, `q-067`, `q-071`–`q-078`, `q-081`–`q-083` (25 native PNGs).  
Authority: the Danish `context` stored for each asset in `authoring/exam-late-photo-manifest.json`.

## Method and limits

Every native PNG was opened at its original 1586 × 992 pixels and compared with its context. The review prioritised contradictions that change the traffic situation: left/right and front/rear orientation, normal right-hand traffic, road topology, sign direction/content, actor direction, and the named curb or road edge. It did not reject harmless cosmetic variation.

A still photograph cannot prove speed, elapsed time, flashing frequency, audio, measured metres, friction, GPS timing, or a road user's future action. Those facts may remain in the adjacent question text. An image marked accepted below means that its visible geometry does not contradict the context; it does not mean that the pixels independently certify every nonvisual fact or that a qualified driving instructor approved it. Browser integration, responsive cropping, and desktop/mobile rendering remain outside this review.

## Must fix

| ID | Direct pixel observation | Comparison with authoritative context | Result |
|---|---|---|---|
| `q-064` | A red octagonal sign faces the camera, but its face is blank: no white `STOP` legend appears. A stop line and the sight-blocking wall are otherwise clear. | The context explicitly names B 13 and a complete stop at its line. A blank red octagon does not depict the required sign. | **Fix.** Regenerate with a correctly facing, legible Danish B 13 `STOP` sign; retain the stop line, wall, and later viewing position before the crossroad. |
| `q-067` | The equal-looking small road from the right is visible and has no sign, yield teeth, or sidewalk crossing. A dark car is also emerging from that right-hand road. | Exact context: “Du kører ligeud på en lille vej. Fra din højre side munder en lige så lille vej ud. Der er ingen tavler, hajtænder, fortovsoverkørsel eller anden særlig regulering.” No other road user is stated. The added car changes a pure uncontrolled-road geometry into an active vehicle conflict. | **Fix.** Keep the equal right-hand T-road and remove the added car and all controls. |
| `q-072` | The car's front faces the camera. The marked right-edge practice bay lies beside and behind the car's forward direction. | The context says the learner must drive **forward** into the marked area along the right edge. In this orientation forward travel cannot enter the displayed bay. | **Fix.** Show a rear driver-side or overhead view with the car pointing toward the bay and instructor seated beside the learner. |
| `q-073` | The LHD car faces the camera. Its steering wheel is on viewer-right, confirming that viewer-right is the car's left side. The curb is also on viewer-right; therefore the wheels near the curb are the car's **left** wheels. | The context requires the car's **right** wheels to be 30 cm from the right edge after forward parking. | **Fix.** Use a rear three-quarter/overhead view with the car pointing away and its actual right wheels visibly parallel to the right edge. The 30 cm value remains textual rather than pixel-certified. |
| `q-075` | Two cyclists ride side by side ahead and a speed bump is clearly visible. No cycle-street sign is visible anywhere in the frame. | The context explicitly places the car in a **signed** cycle street. The road users and bump match, but the defining sign is absent. | **Fix recommended.** Add a correctly facing, mobile-readable Danish cycle-street sign without changing the cyclists or bump. |
| `q-082` | The LHD car faces the camera. Steering wheel placement confirms viewer-right is the car's left side. The viewer-right wheels are over the high curb while the actual right wheels on viewer-left remain on the asphalt. | The context requires the car's **right** wheels to have gone over the high edge. | **Fix.** Mirror the physical setup, preferably with a rear three-quarter view, so the actual right wheels are beyond the high edge; keep the closed facility and instructor. Speed remains a textual fact. |

## Accepted

| ID | Direct pixel observation | Inference or nonvisual limit | Result |
|---|---|---|---|
| `q-040` | Car is fully in the motorway shoulder, hazards are visible, live lanes remain separate, and the adult stands beyond the barrier. A distant interchange/exit is visible ahead. | The puncture itself and distance to the exit are not measurable from pixels. | **Accept.** |
| `q-042` | Driver view remains on a straight, dry approach while hedges and trees hide the road through the bend. | “Faster than normal” and good grip cannot be measured in a still. | **Accept.** |
| `q-043` | Wet road, long view, substantial gap to the nearest car, and a queue with brake lights farther ahead are all visible. | Brake-assistant equipment and exact following distance are not visible facts. | **Accept.** |
| `q-044` | A large patch of loose leaves occupies the entry to a sharp right bend and is visible well before the curve. | The road behind the ego car is outside the frame. | **Accept.** |
| `q-051` | Car is parked along the curb on the approach side of an urban T-junction; no bay or special sign is shown. Its front is plausibly about the stated distance before the nearest edge of the crossing carriageway. | Six metres cannot be certified from perspective alone. The relevant reference is the nearest edge of the cross street, not the far edge. | **Accept.** |
| `q-052` | Rear view shows a correctly oriented car stopped at the right curb shortly before the near edge of a zebra crossing; an adult is at the curb-side passenger door. No bay or permission sign appears. | Three metres cannot be certified from pixels, but the image uses the correct near edge and is visibly inside five metres. | **Accept.** |
| `q-056` | Rear view shows normal traffic orientation. The right-side wheels are on the pavement and the car also occupies part of the red cycle track; no bay or permissive sign appears. | None material. | **Accept.** |
| `q-060` | Proper circular red-border `60` sign faces the driver; road is wet and visibility is shortened by rain/mist. | Actual vehicle speed is not shown. | **Accept.** |
| `q-061` | D 15 sign has one white arrow pointing diagonally down-left. The open lane passes to the **left** of the island; the right side is not presented as the route. | None material. | **Accept.** |
| `q-062` | Temporary yellow lines curve traffic left. Old white lines continue straight toward barriers, excavation, equipment, and workers. | Temporary-line priority is supplied by the question text, while the topology itself is visible. | **Accept.** |
| `q-063` | Heavy daytime rain and poor sight are visible. Front lamps of oncoming vehicles are on; the rear of the depicted moving car shows no illuminated tail lamps. | A single exposure cannot prove the ego car's switch mode or continuous light state. | **Accept.** |
| `q-065` | Yield teeth face the ego lane. A cyclist comes from the right on the crossing road and is oriented to continue straight across. | Motion is inferred from pose. | **Accept.** |
| `q-071` | View originates inside a private farm entrance, crosses an uninterrupted pavement, and meets a public road. One cyclist and one car approach on that road. | Their exact speed and arrival order are not measurable. | **Accept.** |
| `q-074` | E 51-style blue sign faces the driver, a child plays with a ball on the driving area, and no marked parking bays appear. | The legal zone status relies on the sign and context; no further rule is added by the image. | **Accept.** |
| `q-076` | Ego lane shows a left-turn arrow and a normal green circular signal without a green arrow. A car ahead partly blocks the view; an oncoming motorcycle travels straight toward the junction in its correct lane. | Signal phase duration and road-user speed are not shown. | **Accept.** |
| `q-077` | From the finishing-left-turn viewpoint, a pedestrian crosses the destination roadway. A cyclist approaches from the right on a separate path with a dashed centre line that visibly denotes two-way operation. | The fact that earlier oncoming traffic has already passed is temporal and remains in text. | **Accept.** |
| `q-078` | Red signal faces the ego direction, rails cross the lane, and a tram approaches on the track. The roadway beyond is open and no green arrow is displayed. | Available space beyond is visually plausible rather than measured. | **Accept.** |
| `q-081` | Dense multilane traffic, an active navigation map, a learner driver, and an observing instructor are visible. | “Late” route guidance, unsafe timing, and final-lesson status are temporal/textual facts. | **Accept.** |
| `q-083` | Empty public-looking country road has a high, abrupt right shoulder edge and no instructor, cones, or closure. | The learner's intention to practise after reading cannot be photographed. | **Accept.** |

## Disposition

Nineteen images are visually compatible with their contexts. Six need correction or a deliberate product decision: `q-064`, `q-067`, `q-072`, `q-073`, `q-075`, and `q-082`. The three left/right orientation failures (`q-072`, `q-073`, `q-082`) should use rear three-quarter or overhead compositions in their replacements to remove front-view mirroring ambiguity.

## Reviewed correction artifacts

The six replacements below were generated after the audit, opened at full resolution, and checked against the required correction. Their v1 files remain preserved as rejected history. Registry selection is outside this review.

| ID | Replacement observation | SHA-256 | Result |
|---|---|---|---|
| `q-064` | Driver is at the stop line; camera-facing red octagon now has a large legible white `STOP`; stone wall blocks the line-of-sight from the line. | `C21FA14126DEFB61ED3FC0164C86139289B181FBE6D14CC09E1817CA3C57CEC7` | **v2 accepted** |
| `q-067` | Empty equal-looking road joins from the right; no vehicle, sign, signal, yield teeth, stop line, or sidewalk crossing has been added. | `BB8ED79CB032E9BD31BE7A09E768B4183840325E1DABB83C65C3679C93809493` | **v2 accepted** |
| `q-072` | Rear view makes forward direction explicit; marked bay is ahead on image-right and two front-seat occupants are visible. | `76D61F3054B76FCAE42C837C8D2E4656C04BEB5DE01397DCF5AEBD416FDE920B` | **v2 accepted** |
| `q-073` | Rear view points away; actual right wheels are image-right, parallel to the right edge with a narrow uniform gap. Exact 30 cm remains textual. | `922120E06FA2F0A93FF115A92AB607FBBB5F7D5B564A6681ECDE79ECAC7CFF51` | **v2 accepted** |
| `q-075` | Camera-facing blue E 47-style sign clearly shows a white bicycle plus `CYKELGADE` and `ZONE`; two cyclists and the bump remain clear. This matches the sign description in [Vejdirektoratet's official cycle-street note](https://www.vejdirektoratet.dk/sites/default/files/2025-04/Notat_Erfaringsopsamling%20Cykelgader_FINAL%20140423.pdf). | `5571D0C4B5A8E918F59CE19E9CF3AA119E87237685EBCBDBC1EB3F0F12848DB9` | **v2 accepted** |
| `q-082` | Rear view points away; both actual right wheels on image-right are below the high asphalt edge on gravel, while left wheels stay on wet facility asphalt. | `47A3868788A7D47C1D82818B634647E673324DF0DAD1DF5AB312D5684786C501` | **v2 accepted** |

`authoring/exam-photo-corrections.json` records each v2 native path, preserved generation source, dimensions, byte count, SHA-256, full prompt, and the v1 rejection reason.
