// Min bil v6: the same tuning catalog as v5, redrawn in the Common Side Effects style of the chosen vehicle sheet
// (docs/redesign/cse/biler.png). The worn bases are cut from that sheet and placed where the v5 bases were
// (<base>/base.png), so the app's layout and plate positions keep working; Codex draws every part as an EDIT of
// that base, and build_layers.py turns the edits into layers.
// Run: node docs/redesign/garage-v6/make_v6.mjs
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const v5 = JSON.parse(fs.readFileSync(path.join(DIR, '..', 'garage-v5', 'catalog.json'), 'utf8'));
fs.writeFileSync(path.join(DIR, 'catalog.json'), JSON.stringify({ ...v5, note: 'v6: Common Side Effects style; tint = colour chosen in the app' }, null, 2));

const STYLE = `TARGET ART STYLE (see style-reference.png, the vehicle sheet we chose, and restored-ref.png, this very vehicle
restored): the animated series Common Side Effects. Fine, confident, slightly irregular dark ink outlines, sparse
interior lines, broad SOLID flat colour areas with just one sharply edged shadow tone per surface, simple wheels and
metal, muted palette (smoky teal, dusty olive, faded mustard, rust-orange, warm cream, charcoal). A flat cartoon prop
from a 2D television episode: no gradients, no airbrush, no photographic highlights, no painterly texture, no glow.
No people, no faces, no smoking, no weapons, no brand names, no text except a licence plate if asked.`;
for (const base of ['scooter', 'smallcar', 'bigcar', 'racecar']) {
  const out = `docs/redesign/garage-v6/${base}`;
  const jobs = v5.parts.filter(p => !p.bases || p.bases.includes(base));
  const brief = `# Codex image brief: ${base} tuning parts in the Common Side Effects style (${jobs.length + 1} images)

Use your image generation tool (image_gen.imagegen). Attached: style-reference.png (the style), ${base}/restored-ref.png
(this vehicle restored, in the style) and ${base}/base.png (THE vehicle: the worn ${base}, already in the style).
${STYLE}
Save every image in \`${out}/\` at 1024×1024 on a PURE WHITE background. \`base.png\` already exists: do NOT
regenerate or change it. Do not modify any other files.

1. \`nowheels.png\` — EDIT base.png: ${v5.split.edit}.
${jobs.map((p, i) => `${i + 2}. \`${p.id}.png\` — EDIT base.png (use it as the input image): ${p.edit}.`).join('\n')}

For EVERY step use base.png itself as the input image and keep the vehicle exactly where it is: same position, size,
angle, outline, colours, wear and white background, pixel for pixel; only the described change may differ, drawn in
the same ink line and flat cel shading as the vehicle. If an edit comes back moved, rescaled or redrawn, do it again.
Skip a step only if its file already exists. When done, list the saved files.
`;
  fs.writeFileSync(path.join(DIR, `brief-${base}.md`), brief);
  console.log(base, jobs.length + 1, 'images');
}
