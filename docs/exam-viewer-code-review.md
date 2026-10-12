# Independent final image-viewer code review

Date: 2026-10-12  
Scope: `dist/exam-photo-view.js`, `dist/exam-visual.css`, the viewer integration in `dist/app.js`, and `visual-validation.mjs`. This is a static code review; it is not browser, device, or visual proof.

## Verdict

- P1: none found.
- P2: none open; the one finding below is closed.

## Finding

### P2 — The release gate accepted an unverified decoded-pixel hash — CLOSED

`visual-validation.mjs:14` only checks that `decodedRgbSha256` looks like 64 lowercase hexadecimal characters. Lines 15–18 verify the encoded WebP byte hash, lossless container marker, and dimensions, but the validator never decodes the WebP, never reads the retained native file, and never compares `nativeSha256`. An in-memory mutation replacing both `decodedRgbSha256` and `nativeSha256` with different, syntactically valid dummy hashes still returned `errors: []`, `images: 81`, and `bindings: 83`.

This does not show that the current images differ. `scripts/prepare-exam-photos.py:33-44` decoded both files and asserted RGB equality when the current manifest was produced. It does mean that `npm run build` does not independently substantiate the manifest's decoded-RGB/native-preservation claim, so a later valid-looking metadata drift can pass the release gate.

Closure: `scripts/probe-exam-pixels.py:13-20` now independently opens each runtime WebP and retained native PNG, rejects unexpected transparency, compares decoded RGB dimensions and hashes, and reports actual runtime/native byte hashes and native size. `validate.mjs:242-243` runs that probe freshly during `npm run build`; `visual-validation.mjs:15` requires its actual decoded hash, native hash/bytes, runtime hash, and dimensions to match the declared record. `tests/visual-validation.test.mjs:11` proves that syntactically valid invented native and decoded hashes are rejected.

Status: **CLOSED 2026-10-12**.

## Reviewed paths with no P1/P2 finding

- Lifecycle and stale callbacks: `dist/app.js:81`, `dist/app.js:85-87`, and `dist/app.js:117` dispose the mounted viewer before route or mission DOM replacement; `dist/exam-photo-view.js:25-29` guards callbacks after disposal and removes image/control listeners.
- Close and restoration: `dist/exam-photo-view.js:12-19` resets zoom styles and scroll, returns the image to its original stage, and restores the prior connected focus target. Resize recalculates zoomed dimensions at line 22.
- Narration: `dist/app.js:141` passes `narrator.stop()` to the viewer, and `dist/exam-photo-view.js:21` invokes it before opening.
- Retry/error handling: `dist/exam-photo-view.js:25-28` has explicit ready, fallback, and cache-busting retry states. A disposed instance cannot update the replacement page.
- Grading isolation: viewer controls have local listeners only. The integration does not write answers, responses, scores, leases, or exam progression.
- Mobile layout: `dist/exam-visual.css:26-27` supplies a fixed responsive stage height for narrow screens. Actual short-viewport, orientation, scroll, and touch behavior remains part of the planned browser/mobile QA.
- Binding gate: `visual-validation.mjs:5-13` checks completed-review status, one binding per current question, exact question signature/context, constrained local paths, and matching display metadata; lines 15-20 verify encoded bytes, dimensions, lossless WebP structure, and reject extra packaged images.

## Checks run

- `npm run build`: passed with 83 questions and 120 local runtime files.
- `node --test tests/visual-validation.test.mjs`: 5/5 passed after the fix, including rejection of invented valid-looking hashes.
- `npm test`: 46/46 passed after the final image correction.
- Fresh probe/build evidence: 81 runtime images matched retained native RGB pixels; runtime bytes 137,778,970 versus 208,312,632 native bytes.

## Closure log

- 2026-10-12: Review completed; P2 remains open pending a root-owned validator fix and regression check.
- 2026-10-12: Root fix independently rechecked. P2 closed after fresh probe integration, 5/5 image-gate tests, `npm run build`, and 46/46 full tests passed. No P1 or P2 remains from this review.

## Final decode/readiness lifecycle re-review

Static re-review on 2026-10-12 found no actionable P1 or P2 in the final `dist/exam-photo-view.js` patch.

- Cached completion plus a later `load` callback is safe: every `ready()` invocation takes a new generation and captures the current `src` at line 25. Only the latest generation can reveal/enable the image; earlier decode or paint continuations return without changing state.
- Readiness is gated on actual decode and presentation: the image starts hidden at line 5, line 25 awaits `media.decode()`, changes the state to `painting`, waits two animation frames, rechecks generation/source/disposal, and only then sets `ready` and enables expansion.
- Error and retry invalidate pending work: lines 26–27 increment the generation before fallback or a new cache-busted source. Decode rejection for the current generation enters the same fallback path; stale rejection is ignored.
- Disposal invalidates pending decode/animation-frame continuations and removes listeners at line 29. If the dialog is open, `close()` first resets zoom/scroll, closes it, returns the image to its original stage, and restores the connected focus target (lines 12–19).
- `open()` requires `visualStatus === 'ready'` at line 21, so the image cannot be moved into the dialog during decode or the two-frame paint wait.

Focused evidence: `node --check dist/exam-photo-view.js` passed. This remains static lifecycle evidence; cached-load scheduling, paint timing, retry, orientation, and dialog/focus behavior still require the separate browser/device QA for runtime proof.

## Known local-build dependency

The fresh release gate requires the retained PNG sources under `reference/exam-native`. Those files are ignored source assets, so a plain clone without that retained local directory cannot run the image probe or complete `npm run build`. This is a known packaging/reproducibility limitation, not a remaining viewer correctness finding.
