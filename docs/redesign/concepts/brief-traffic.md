# Codex image brief: the TeoriBoost traffic light

Use your image generation tool (image_gen.imagegen). Attached: `docs/redesign/concepts/ref-traffic.jpg`, a flat
poster illustration of a traffic light (three-quarter view from below, chunky hooded visors over each lamp, the
housing mounted on an arm that comes in from the right). Make OUR traffic light in that same flat poster style:
flat colour planes with one hard light side and one hard shadow side, crisp edges, no gradients, no texture, no
outline strokes, no text, no logos.

Our colours instead of the reference's brown and blue:
- housing, visors and arm: signal yellow `#FFD60A`, the shadow sides `#C9A200`, the deepest shadows and the inside
  of the visors asphalt `#1F2328`, a thin light edge `#FFE45C` on the lit side
- lamps when OFF: dark tinted glass, red off `#4A1F1F`, yellow off `#4A4127`, green off `#1F3A1F`
- lamps when ON: red `#FF4B4B`, amber `#FFB000` for the yellow lamp (so it stands out from the yellow housing),
  green `#58CC02`; a lit lamp has a lighter flat highlight plane `#FFFFFF` at 35 % on its
  upper left, like the reference's red lamp

Make FOUR images that are pixel-for-pixel identical except for which lamp is lit (same framing, same size, same
pose; generate the off version first and edit it for the others):
1. `docs/redesign/concepts/tl-off.png` - all three lamps off
2. `docs/redesign/concepts/tl-red.png` - only the top lamp lit red
3. `docs/redesign/concepts/tl-yellow.png` - only the middle lamp lit amber
4. `docs/redesign/concepts/tl-green.png` - only the bottom lamp lit green

Square 1536 x 1536, the whole traffic light visible (all three lamps and a short piece of the arm), about 85 %
of the image height, on a perfectly flat plain background `#FF00FF` (magenta), nothing else.
Do not modify any other files.
