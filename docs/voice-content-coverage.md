# Voice content coverage review

Read-only review performed 2026-10-12 against `dist/voice-texts.js`, `scripts/build-voice-catalog.mjs`, `dist/app.js`, `dist/garage.js`, `dist/judge.js`, `authoring/voice-catalog.json`, and the complete `dist/voice-pack.js`. No runtime or generator files were changed.

## Evidence

- Catalog and pack match exactly: `1235` catalog entries, `1235` generated clips, `0` missing keys, `0` extra keys, `0` text mismatches, `0` missing sources. Pack status is `complete`.
- Catalog integrity: `1235` unique keys and texts, `0` empty entries, `1883` uses.
- Question ordering: all `83 × 24 = 1992` statement permutations were exercised. Every result had one combined prompt/context block followed by four separate `Udsagn N.` labels and their four statement texts; `0` failures.
- Garage ordering: all `17 × 6 = 102` three-option permutations were exercised for case and feedback output; `0` failures. Case narration contains context and ordered options only; feedback contains the ordered option text, correct/incorrect phrase, and why.
- Judge ordering: all four cases and all relevant permutations were exercised: phases 1–3 with six orders each plus phase 4, `76` cases total; `0` failures. Phase 1 never included setup or explanation, while phases 2–3 included setup as intended.
- Pre-answer leak check: question initial narration contained no correctness metadata or verdict text (`0` detected leaks). Garage case narration uses `garageCaseVoiceParts`, which excludes `correct` and `why`; judge phase 1 uses issue prompt/labels only.
- Reproducible checks used Node ESM imports of the actual app modules and the generated pack; the permutation harness tested helper output rather than reimplementing ordering logic.

## Concrete caveat

`judgeVoiceParts` supports an optional humorous excuse in phase 4, and the catalog contains the humor variant. The current `judge.js` read handler passes humor only for phase 2 (`humor: phase===2&&humor`), so a phase-4 excuse clip is generated but not selected by that UI path. This does not expose a correct answer before phase 4, but it is unused generated coverage and should be an explicit release choice.

