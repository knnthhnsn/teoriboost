# Codex image brief: layered car customisation, alignment test

Use your image generation tool (image_gen.imagegen). This is a test of whether customisation parts can be
added as layers that line up exactly with a base vehicle. Save PNGs in `docs/redesign/garage-build/test/`.
Do not modify any other files. When done, list the saved file paths and say for each step whether you
generated from scratch or edited the previous image.

## Style (same as the existing cast in docs/redesign/characters-v4/*/hero-2d.png)
Modern flat 2D vector mascot illustration, bold clean shapes, flat colours with one level of cel shading,
consistent deep indigo outline (#1E1B36). PURE WHITE background (#FFFFFF), no ground shadow, no text,
no logos, no license plate text. 1024×1024, vehicle centred, side 3/4 view facing right, the whole
vehicle visible with generous margin.

## Steps
1. `base.png` — a small, worn, slightly sad old hatchback (original design, not a real brand):
   faded dull blue paint, a few rust patches, a dented door, plain steel wheels, dim cloudy headlights,
   no face. This is the BASE every part must line up with.
2. `part-paint.png` — EDIT `base.png`: repaint the body in fresh glossy mint green (#7FE0B0) with the rust
   and dent repaired. Keep EVERYTHING else identical: same position, size, angle, wheels, windows, outline.
3. `part-wheels.png` — EDIT `base.png`: replace only the wheels with sporty five-spoke alloy rims.
   Keep everything else pixel-identical: same body, paint, rust, position, size and angle.
4. `part-spoiler.png` — EDIT `base.png`: add only a small rear roof spoiler. Keep everything else
   pixel-identical.

For steps 2–4 always edit `base.png` itself (use it as the input image), never redraw the car.
