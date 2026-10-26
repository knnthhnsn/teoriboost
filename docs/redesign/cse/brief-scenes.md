# Codex image brief: the Din bil road scene and the mirror view, in the Common Side Effects style

Use your image generation tool (image_gen.imagegen). Attached: `docs/redesign/cse/biler.png` and
`docs/redesign/cse/sneglen-og-keglen.png`, the STYLE (the animated series Common Side Effects: fine, slightly
irregular dark ink outlines, flat muted cel colours with one sharply edged shadow tone, tactile and grounded; palette
smoky teal, dusty olive, faded mustard, rust-orange, warm cream, charcoal). A Danish countryside: gentle rolling
fields, hedgerows, a red farmhouse, a white church, a couple of wind turbines, birch and beech trees. No people, no
vehicles, no text, no logos, no signs with words.

The road scene is made of layers that scroll sideways behind a car, so each layer is a WIDE strip on a real
TRANSPARENT background (no sky colour, no backdrop, no checkerboard), its bottom edge running straight along the
whole width, and its left and right ends designed so they can be joined (the land at the left edge continues the
land at the right edge, same height and colour):
1. `docs/redesign/cse/scenes/loop-far.png` (3072 x 512): far rolling hills in muted dusty olive and smoky teal-green,
   fields with a few hedgerow lines, the farmhouse, the church and two wind turbines small in the distance. The
   hills fill the lower 55 % and the upper part is transparent.
2. `docs/redesign/cse/scenes/loop-near.png` (3072 x 384): the roadside verge close up: tufts of grass, a low wooden
   fence, a few birch and beech trees at irregular spacing (some cut by the top edge is fine), a red-white roadside
   post. Transparent above and between the trees.
3. `docs/redesign/cse/scenes/loop-clouds.png` (3072 x 384): five or six flat cream-white cel clouds with a light grey
   underside, spread over the width, transparent around them.

And the view in a car's rear-view mirror, one opaque image:
4. `docs/redesign/cse/scenes/mirror.png` (1536 x 512): a wide view of the Danish countryside at golden hour behind
   the car: a warm mustard-to-rust sky with a big low sun sitting on the horizon in the middle, the horizon at 58 %
   of the height, dark teal hills and fields, a line of trees, the farm and a wind turbine small on each side. LEAVE
   THE MIDDLE OF THE GROUND EMPTY (plain field) from the sun down to the bottom edge, because an animated road is
   laid on top there. Flat cel shading, no lens effects.
Do not modify any other files.
