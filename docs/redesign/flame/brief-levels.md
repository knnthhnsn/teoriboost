# Codex image brief: the streak flame levels up

Use your image generation tool (image_gen.imagegen). Attached:
1. `docs/redesign/flame/flame-happy.png` - our flame character, level 2. Keep its face style, flat colour, single
   white shine, scalloped bottom and proportions EXACTLY; every level must clearly be the same character.
2. `docs/redesign/flame/flame-joy.png` - its joy expression.
3. `docs/redesign/flame/reference.jpg` - the style reference sheet.

The flame shows how many days in a row a student has practised for the Danish driving-theory test. It grows
and levels up with the streak. Each level must read at 24 px and look great at 200 px. Flat colours, no
outline, no drop shadow, no glow, no sparks, no background elements, no text.

## The levels
- Level 1 "Gnist" (1-2 days): a baby flame. Smaller and rounder than level 2, one small soft tip on top,
  slightly bigger eyes for its size, flat `#FFA53A` body.
- Level 2 "Flamme" (3-6 days): the attached character as it is, `#FF8A1F`.
- Level 3 "Baal" (7-13 days): bigger and taller than level 2, four tips, the middle one tall and curling,
  a flat lighter-orange inner flame shape `#FFB347` in the lower body behind the face, body `#FF7A1A`.
- Level 4 "Turbo" (14-29 days): hotter: body `#FF6A1A`, inner flame `#FFC93D`, tips swept back as if
  moving fast, and a pair of small racing goggles (`#1F2328` strap, light blue lenses `#9FD8FF`) pushed up
  on its forehead.
- Level 5 "Legende" (30+ days): the biggest, golden: body `#FFB800`, inner flame `#FFE45C`, five tips, and a
  small tilted gold crown `#FFD60A` with a `#C9A200` edge on its top tip. Proud, happy smile.

## Three expressions for every level (the same pose and size, only the face changes)
- `idle`: content, small smile, eyes open looking at the viewer (like the attached happy).
- `blink`: the same, eyes closed as gentle downward arcs, same smile.
- `joy`: thrilled, eyes squeezed into happy arcs, wide open smiling mouth (like the attached joy), tips flared a
  little taller.

## Output
Square 1024 x 1024 images, the character standing on the same baseline near the bottom, centred, on a
perfectly flat plain background `#D6ECFF` with nothing else on it. Keep the scale between levels: level 1
about 40 % of the image height, level 2 about 60 %, level 3 about 66 %, level 4 about 70 %, level 5 about 74 %.
Save as `docs/redesign/flame/levels/L<level>-<expression>.png`, for example `L1-idle.png`, `L1-blink.png`,
`L1-joy.png` ... `L5-joy.png`. For level 2 only make `L2-blink.png` (copy the attached happy and joy files to
`L2-idle.png` and `L2-joy.png` unchanged).

Then make one overview `docs/redesign/flame/levels/sheet.png` (1536 x 1024, white background) with the five
idle images in a row, smallest to biggest, and the level names under them in small grey text.
Do not modify any other files.
