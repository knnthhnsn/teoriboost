// Briefs for catalog v2: every part with an "edit" that applies to the base, plus the wheel-removal
// split image (for lowering) and any redo ids passed on the command line as base:part.
// Run: node docs/redesign/garage-build/make_briefs_v2.mjs [smallcar:top-bow ...]
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const catalog = JSON.parse(fs.readFileSync(path.join(DIR, 'catalog.json'), 'utf8'));
const v1 = Object.fromEntries((await import('node:fs')).readFileSync(path.join(DIR, 'make_briefs.mjs'), 'utf8')
  .match(/\['([a-z-]+)', '([^']+)'\]/g).map(m => m.match(/\['([a-z-]+)', '([^']+)'\]/).slice(1)));
const redo = process.argv.slice(2).map(s => s.split(':'));

for (const base of ['scooter', 'smallcar', 'bigcar', 'racecar']) {
  const jobs = [];
  for (const [b, id] of redo) if (b === base) jobs.push([id, catalog.parts.find(p => p.id === id)?.edit || v1[id]]);
  jobs.push([catalog.split.id, catalog.split.edit]);
  for (const p of catalog.parts) if (p.edit && (!p.bases || p.bases.includes(base))) jobs.push([p.id, p.edit]);
  const out = `docs/redesign/garage-build/${base}`;
  const brief = `# Codex image brief: ${base} — catalog v2 (${jobs.length} edits)

Use your image generation tool (image_gen.imagegen). The base vehicle is \`${out}/base.png\`.
For EVERY step below, EDIT \`base.png\` itself (use it as the input image) and save the result as
\`${out}/<name>.png\`. Never redraw or move the vehicle: same position, size, angle, outline, colours,
interior and white background. Only the described change may differ. If a result shifts or redraws the
vehicle, discard it and edit again. Skip a step only if its file already exists. Do not modify any other
files. When done, list the saved files.

Style for any added element: modern flat 2D vector, bold clean shapes, flat colours with one level of cel
shading, deep indigo outline (#1E1B36), matching the vehicle. No text, logos or numbers anywhere.

## Steps
${jobs.map(([id, edit], i) => `${i + 1}. \`${id}.png\` — ${edit}.`).join('\n')}
`;
  fs.writeFileSync(path.join(DIR, `brief-v2-${base}.md`), brief);
  console.log(base, jobs.length, 'edits');
}
