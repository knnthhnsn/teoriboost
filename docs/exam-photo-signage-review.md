# Focused sign and road-marking review

Date: 2026-10-12

## Scope and method

This is a bounded static review of visible Danish signs, signals and road markings in the native PNG exam images. The question `context` in `authoring/exam-visual-manifest.json` was treated as authoritative. Reviewers opened the native pixels at full resolution and compared concrete sign/marking details with current primary material from Retsinformation. This is not browser proof, legal advice, a complete scene audit or approval by a qualified driving instructor.

Direct native-pixel coverage in this pass and its attached early split: q-002, q-006-q-014, q-016, q-020-q-041, q-051-q-052, q-054-q-062, q-064-q-068, q-071-q-078 and q-081-q-083. Old q-010-v1 was excluded; q-010-v2 was opened and reviewed after replacement. Detail-only questions without relevant road controls and unrelated road-weather scenes were not re-audited.

## Final correction verdict

| Status | ID and reviewed source | Pixel observation | Authority and limit |
| --- | --- | --- | --- |
| Closed at source-pixel review | q-052 v4, `exec-e202e7e0-fa35-4b49-98d0-e1f27a2d3744.png` | The elevated oblique view shows the complete car footprint. Its front is before the crossing with a short visible road gap; the adult is at the open right-side door. Both E 17 pole bases sit at the approach-side curb corners and both faces address approaching traffic. | This resolves the sign placement and whole-scenario contradiction in earlier revisions under [BEK 426 § 119, printed/PDF p. 11](https://www.retsinformation.dk/eli/lta/2023/426/pdf). The still supports “before the crossing” qualitatively; the question text remains authoritative for the exact 3 m distance. |
| Closed at source-pixel review | q-068 v4, `exec-96cef370-b549-44eb-afbc-97756be2ae2a.png` | In the wider driver-eye view, both E 17 boards face the driver and both pole bases are now on the camera/approach side of the crossing's near edge. The corrected left base projects at roughly y=628 versus the near edge around y=620; the right remains correctly placed. The pedestrian is entering from the right. | This resolves the remaining left-pole issue under the same § 119 source. |

No P1 or P2 sign/marking finding remains open in the reviewed v4 source pixels. Packaging, manifest registration and runtime decoded-pixel equality remain separate release checks owned by the integrating reviewer.

## Verified replacements and accepted controls

- q-002-v2: the already-passed temporary sign appears only as a grey back in the right mirror; no front-facing 50 sign remains. The 80 display is coherent with the context.
- q-010-v2: no green `5 km` board, poles or other invented sign remain. The visible motorway lane and edge markings are coherent.
- q-027-v2: the signals facing the camera show green and the queue blocks the far side. Its pedestrian crossing is signal-regulated, so the unregulated-crossing rule in § 119 does not create the E 17 issue found in q-035/q-052/q-068.
- q-025-v2: both rail signals now use a downward-pointing dark-blue triangle, white reflective band, narrow red outer edge and one centered unlit dark-red optic. The raised booms and non-glowing optics remain coherent with the context. This resolves the fabricated three-lens boards in v1. [BEK 425, Z 72,2, printed/PDF p. 41](https://www.retsinformation.dk/eli/lta/2023/425/pdf) and [BEK 426 § 24(7-8)](https://www.retsinformation.dk/eli/lta/2023/426).
- q-035-v2: E 17 boards now stand at both approach-side endpoints of the crossing from the car's curved exit direction and face the approaching driver. This resolves the missing-board finding in v1.
- q-040-v2: the invented blue marker is replaced by a red N 43 board with three centered white upward-pointing chevrons at the gore tip. This resolves the v1 finding. [BEK 425 § 48, N 43 drawing, printed/PDF p. 30](https://www.retsinformation.dk/eli/lta/2023/425/pdf) and [BEK 426 § 164](https://www.retsinformation.dk/eli/lta/2023/426).
- q-074-v2: E 51 faces the camera at the entrance to one continuous flat paved area. No raised sidewalk or carriageway divide remains; the child and ball occupy the shared surface. This resolves the prior geometry conflict with [BEK 426 § 135(2)](https://www.retsinformation.dk/eli/lta/2023/426).
- q-075-v3: the E 47 board now has a plain white `Kørsel tilladt` undertavle, spelled correctly and readable. This resolves the missing permission for the pictured car. [BEK 425, E 47, printed/PDF p. 17](https://www.retsinformation.dk/eli/lta/2023/425/pdf).

No further concrete sign, signal or marking contradiction was found in: q-006-q-009, q-011-q-014, q-016, q-020-q-024, q-026, q-028-q-034, q-036-q-039, q-041, q-051, q-054-q-067, q-071-q-073, q-076-q-078 and q-081-q-083. This acceptance is limited to the visible sign/marking focus; it does not certify speed, blink frequency, timing or exact measured distance that a still image cannot prove.

## Source status

Retsinformation marked [BEK 425 af 13/04/2023](https://www.retsinformation.dk/eli/lta/2023/425) and [BEK 426 af 13/04/2023](https://www.retsinformation.dk/eli/lta/2023/426) as `GÆLDENDE` when checked on 2026-10-12. The listed later amendment to BEK 425, [BEK 1501 af 06/12/2023](https://www.retsinformation.dk/eli/lta/2023/1501), changes § 55 and does not alter the cited E 47, N 43 or Z 72,2 material. The listed later amendments to BEK 426, [BEK 972 af 22/08/2023](https://www.retsinformation.dk/eli/lta/2023/972) and [BEK 626 af 19/05/2025](https://www.retsinformation.dk/eli/lta/2025/626), do not alter the cited §§ 24, 119, 135 or 164.

For reproducibility during this review, the official PDFs were downloaded read-only to `%TEMP%\bek-425-2023.pdf` and `%TEMP%\bek-426-2023.pdf`; the directly inspected page renders were `%TEMP%\bek425-page30.png`, `%TEMP%\bek425-page41.png` and `%TEMP%\bek426-page11.png`.
