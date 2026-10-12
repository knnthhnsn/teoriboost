# Illustration integration review

Read-only source review of the current `renderArt` placements and `dist/illustration-layout.css`. No browser or device claim is made here.

## Findings

- **No blocking overlap found in the intended layout.** The receipt was removed from the featured mission cards, which keeps the 390px card composition focused. The remaining card art is bounded by `.card-art .art-asset` (84px desktop, 72px mobile). The mobile hero art is bounded to 135px and the scene sticker is hidden when `.hero-art` exists, reducing the main known collision risk.
- **Small visual risk to watch:** the hero cutout is absolutely positioned at the upper right on mobile while the hero copy remains in the same panel. The current width cap and pointer blocking make this a layout risk rather than a touch risk; a viewport review should confirm the longest heading does not visually meet the cutout.
- **No pre-answer answer hint found.** Reaction art is inserted only in checked feedback, and result art is selected after the mission result is known. Garage Mads art appears in the intro or after an answer in the hook. The judge brain is an intro mascot, not an answer-specific cue, and has empty alt text.
- **Calm semantics are consistent.** Humor-only art is hidden by `.calm` (including the garage hook, brain intro mascot, joke reactions, and result cone/brain slot); the result symbol fallback remains available. `applySettings()` also uses the existing `calm` class for the text/humor behavior.
- **Motion-off semantics are preserved.** The art module freezes animation while keeping images visible in `.no-motion`; the container hover rule is overridden for reduced-motion and motion-off, so an inert image cannot trigger interaction and hover cannot re-enable motion.
- **Mobile touch interference is covered.** Art images use `pointer-events: none`; the hero art wrapper also does, and interactive links/buttons remain outside the image markup. The route art is adjacent to its CTA rather than wrapping it.

## Follow-up

Do one visual viewport pass at 390px and 320px after the PNGs are present, focusing on the hero heading, garage hook text, and the 56px reaction art. This is a visual QA recommendation, not an implementation blocker from source inspection.

