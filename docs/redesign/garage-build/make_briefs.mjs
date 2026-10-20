// Writes one Codex brief per base vehicle: the base itself plus 14 part edits of that base.
// Run: node docs/redesign/garage-build/make_briefs.mjs
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const STYLE = `Modern flat 2D vector mascot illustration, bold clean shapes, flat colours with one level of cel shading,
consistent deep indigo outline (#1E1B36), same style as the attached cast reference. PURE WHITE background
(#FFFFFF), no ground shadow, no text, no logos, no license plate text. 1024×1024, vehicle centred, side 3/4
view facing right, whole vehicle visible with generous margin.`;

const BASES = {
  scooter: { reuse: false, base: 'a broken, worn little moped scooter (original design, not a real brand): faded dull cream-grey paint, rust spots, a cracked front panel, duct tape on the torn seat, one bent mirror, plain small wheels, no face' },
  smallcar: { reuse: true, base: 'the small worn hatchback in base.png' },
  bigcar: { reuse: false, base: 'a big, worn old station wagon (original design, not a real brand): faded dull brown-beige paint, rust patches, a dented rear door, a cracked tail light, plain steel wheels, no face' },
  racecar: { reuse: false, base: 'a wrecked old race car (original design, not a real brand): low and wide, faded scratched grey paint, a missing side panel, dented nose, a crooked broken rear wing stub, plain worn racing wheels, no face, no sponsor text, no numbers' },
};
const PARTS = [
  ['paint-mint', 'repair all rust, dents and damage and repaint the whole body in fresh glossy mint green (#7FE0B0)'],
  ['paint-pink', 'repair all rust, dents and damage and repaint the whole body in fresh glossy pastel pink (#FFB3D1)'],
  ['paint-black', 'repair all rust, dents and damage and repaint the whole body in fresh matte black (#2B2D33)'],
  ['paint-red', 'repair all rust, dents and damage and repaint the whole body in fresh glossy racing red (#E8343C)'],
  ['wheels-sport', 'replace only the wheels with sporty dark five-spoke alloy rims'],
  ['wheels-chrome', 'replace only the wheels with shiny chrome rims'],
  ['wheels-pastel', 'replace only the wheels with cute white rims with pastel pink centres'],
  ['front-lashes', 'add only cute long black eyelashes on top of the front headlights'],
  ['front-led', 'add only sharp, cool angled LED light strips like stern eyebrows above the headlights'],
  ['top-spoiler', 'add only a sporty rear spoiler (for the scooter: a sporty rear top box)'],
  ['top-bow', 'add only a big cute pink gift-wrap bow on the roof (for the scooter: on the front panel)'],
  ['decal-flames', 'add only orange and yellow flame decals along the side'],
  ['decal-stripes', 'add only two bold white racing stripes'],
  ['decal-hearts', 'add only a few small pink heart decals along the side'],
];

for (const [slug, b] of Object.entries(BASES)) {
  const out = `docs/redesign/garage-build/${slug}`;
  const steps = [];
  if (b.reuse) steps.push(`1. \`base.png\` already exists in \`${out}/\` (copied there for you). Do NOT regenerate it.`);
  else steps.push(`1. \`base.png\` — generate ${b.base}. This is the BASE every part must line up with.`);
  PARTS.forEach(([name, what], i) => steps.push(`${i + 2}. \`${name}.png\` — EDIT \`base.png\` (use it as the input image): ${what}. Keep EVERYTHING else identical: same position, size, angle, outline, interior, background.`));
  const brief = `# Codex image brief: ${slug} base + 14 customisation parts

Use your image generation tool (image_gen.imagegen). Save all PNGs in \`${out}/\`. Do not modify any other files.
When done, list the saved file paths.

## Style
${STYLE}

## Steps
${steps.join('\n')}

Always edit \`base.png\` itself for steps 2–15; never redraw the vehicle. Each part image must differ from the
base ONLY in the described part.
`;
  fs.mkdirSync(path.join(DIR, slug), { recursive: true });
  fs.writeFileSync(path.join(DIR, `brief-${slug}.md`), brief);
  console.log('brief', slug);
}
