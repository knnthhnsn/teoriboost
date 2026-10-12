# Claude voice review closure

2026-10-12. Claude received one actual desktop screenshot and a text description of our QA. No audio was supplied, and Claude did not use the app. The original critique is retained in `claude-voice-review.txt`; the reviewed screenshot is retained locally as `evidence/voice-question-desktop-before-polish.jpg`.

| Finding | Decision and evidence |
|---|---|
| P2: sticky panel obscures the scenario | Fixed. The panel is static at all widths, 75.6px high on the tested desktop and 113.2px at 390px. Four 44px controls fit one mobile row; no horizontal overflow. Final screenshots and geometry are saved. |
| Full transcript duplicates the task text | Fixed visually. The transcript remains available to assistive technology; the visible compact bar shows identity, AI label, status and controls. |
| Hypothesis: following four spoken statements may be hard | Added current-row cues. Actual playback marked the currently spoken question row, and the game marked both its corresponding textual option and scene hotspot. Stop, grading and next-question cleanup were observed. This does not establish a learning improvement. |
| Duplicate pause controls | Both are retained deliberately: the compact panel provides transport controls, while the local Lyt trigger remains reachable after the static panel scrolls out of view. They control the same guarded engine. Whether this is confusing requires actual user testing. |
| Hypothesis: default 1.15× may be too fast | The screenshot showed a QA-selected speed. The actual default is 1×, verified after reload. Four optional speeds remain. |
| Human Danish listening sample | Pending. Full file decoding is complete, but not a professional pronunciation or listening approval. The user chose the first sample; that preference does not certify every recording. |

Jev received only our reported QA text, no images/audio and no executable browser work. The new raw result is retained in `jev-voice-triage.json`; it favours remaining curriculum and real human pronunciation/transfer review. Its probabilities are synthetic classification, not an audio test or market outcome.
