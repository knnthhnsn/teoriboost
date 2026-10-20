// Catalog v5 (new art style) + Codex briefs per vehicle.
// Colour choices are free: paint, stripes and window tint are generated as MASKS (pure white + one flat grey
// shade) that the app tints in any colour. Everything else is a separate add-on layer.
// Run: node docs/redesign/garage-v5/make_v5.mjs
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const old = JSON.parse(fs.readFileSync(path.join(DIR, '..', 'garage-build', 'catalog.json'), 'utf8'));
const V1 = {
  'decal-hearts': 'add only a few small pink heart decals along the side',
  'decal-flames': 'add only orange and yellow flame decals along the side',
  'wheels-pastel': 'replace only the wheels with cute white rims with pastel pink centres',
  'wheels-sport': 'replace only the wheels with sporty dark five-spoke alloy rims',
  'wheels-chrome': 'replace only the wheels with shiny chrome rims',
  'top-spoiler': 'add only a sporty rear spoiler (for the scooter: a sporty rear top box)',
  'top-bow': 'add only a big cute pink gift-wrap bow on the roof (for the scooter: on the front panel)',
  'front-lashes': 'add only cute long black eyelashes on top of the front headlights',
  'front-led': 'add only sharp, cool angled LED light strips like stern eyebrows above the headlights',
};
const MASKS = [
  { id: 'paint-mask', slot: 'paint', name: 'Lakering', price: 6000, tint: 'paint', edit: 'repair all rust, dents and damage and repaint ALL body panels in pure flat white (#FFFFFF) with exactly one flat light-grey shadow tone (#C9C9C9) where the style shades; keep every outline, window, light, tyre, rim and trim piece exactly as it is' },
  { id: 'stripe-racing', slot: 'stripe', name: 'Racerstriber', price: 3000, tint: 'stripe', edit: 'add only two bold pure white (#FFFFFF) racing stripes running over the bonnet, roof and boot, with black outlines like the style' },
  { id: 'stripe-side', slot: 'stripe', name: 'Sidestribe', price: 3000, tint: 'stripe', edit: 'add only one bold pure white (#FFFFFF) stripe along the whole side of the body, with black outlines like the style' },
  { id: 'windows-mask', slot: 'windows', name: 'Tonede ruder', price: 4000, tint: 'windows', bases: ['smallcar', 'bigcar', 'racecar'], edit: 'fill only the window glass areas with pure flat white (#FFFFFF), no reflections; keep the window frames and outlines exactly' },
];
const DROP = new Set(['paint-mint', 'paint-pink', 'paint-black', 'paint-red', 'paint-purple', 'paint-pearl', 'paint-yellow', 'decal-stripes', 'stripe-black', 'stripe-pink', 'stripe-neon', 'windows-tint']);
const parts = [...MASKS, ...old.parts.filter(p => !DROP.has(p.id)).map(p => ({ ...p, edit: p.edit || V1[p.id] }))];
const catalog = { note: 'v5: new art style; tint = colour chosen in the app', slots: old.slots, parts, split: old.split };
fs.writeFileSync(path.join(DIR, 'catalog.json'), JSON.stringify(catalog, null, 2));

const STYLE = `TARGET ART STYLE (see style-reference.png and smallcar-style.png): thick confident black outlines, completely flat
saturated colours with no gradients and at most one flat shadow tone, bold simple shapes, street / tuner-culture energy.
No people, no smoking, no weapons, no silhouettes of people, no brand names, no text except a licence plate if asked.`;
for (const base of ['scooter', 'smallcar', 'bigcar', 'racecar']) {
  const out = `docs/redesign/garage-v5/${base}`;
  fs.mkdirSync(path.join(DIR, base), { recursive: true });
  const jobs = parts.filter(p => !p.bases || p.bases.includes(base));
  const first = base === 'smallcar'
    ? '1. `base.png` already exists (the worn small car in the new style). Do NOT regenerate it.'
    : `1. \`base.png\` — redraw the attached old-base.png vehicle (same vehicle, same design, same worn state, same 3/4 view facing right, same size and position on a 1024×1024 canvas) in the TARGET ART STYLE on a PURE WHITE background. No face.`;
  const brief = `# Codex image brief: ${base} in the new art style (${jobs.length + 2} images)

Use your image generation tool (image_gen.imagegen). Attached: style-reference.png (style only), smallcar-style.png
(our small car already drawn in the style) and old-base.png (this vehicle in the old style, for design and pose).
${STYLE}
Save every image in \`${out}/\` at 1024×1024 on a PURE WHITE background. Do not modify any other files.

${first}
2. \`nowheels.png\` — EDIT base.png: ${old.split.edit}.
${jobs.map((p, i) => `${i + 3}. \`${p.id}.png\` — EDIT base.png (use it as the input image): ${p.edit}.`).join('\n')}

For every EDIT step keep the vehicle exactly where it is (same position, size, angle, outline, colours, background);
only the described change may differ. Faces use the concept face: flat white oval eyes, solid black pupils, flat
dark-green brows and mustache, drawn large on the front, with black outlines in the style; no arms or hands.
Skip a step only if its file already exists. When done, list the saved files.
`;
  fs.writeFileSync(path.join(DIR, `brief-${base}.md`), brief);
  console.log(base, jobs.length + 2, 'images');
}
