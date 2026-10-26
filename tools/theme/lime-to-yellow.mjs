// One-off: the brand colour moves from lime (#D5FF62) to yellow. Swaps the lime family (fills, pressed edges,
// pale tints, dark ink on lime, lime text) for yellow counterparts in dist/ and the Rive builders.
// Signal greens (right answers, "good") stay green. Car paint presets in mybil.js keep their lime.
// Run: node tools/theme/lime-to-yellow.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const YELLOW = '#FFD60A';
const MAP = {
  // fills
  D5FF62: 'FFD60A', D8FF62: 'FFD60A', CFFF5A: 'FFD60A', CAFF47: 'FFCF00', C6F36B: 'FFD84A',
  // pressed edges and darker fills
  '9BC42A': 'C9A200', '8DB423': 'B38F00', B5DD50: 'E6BE1F',
  // pale tints
  F3FFD6: 'FFF5CC', F1FFD6: 'FFF5CC', F1FFD0: 'FFF3C2', F1FFC9: 'FFF1B8', ECFFC2: 'FFEFAD', EDFFB0: 'FFEE9E',
  E4FF9B: 'FFE98A', E7FF99: 'FFE98A', EEF4DD: 'F7F2DD', DCE5C4: 'E8DFBF', F1F4E8: 'F4F2E8',
  // dark ink on the brand fill, and the brand colour as text
  '141A0A': '1A1605', '709900': '7A6000', '739900': '7A6000', B6E86A: 'FFE066',
};
const RGB = [['213,255,98', '255,214,10'], ['213, 255, 98', '255, 214, 10']];

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (/node_modules|\.vercel|[\\/]assets[\\/](rive|fonts|photos|img|art|audio)/.test(p)) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(css|js|mjs|html|svg)$/.test(f) && !/dark-gen\.css|lime-to-yellow/.test(f)) files.push(p);
  }
})(join(ROOT, 'dist'));
for (const f of readdirSync(join(ROOT, 'tools/rive'))) if (f.endsWith('.mjs')) files.push(join(ROOT, 'tools/rive', f));

let changed = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  let out = src.replace(/#([0-9a-fA-F]{6})(?![0-9a-fA-F])/g, (m, h) => {
    const to = MAP[h.toUpperCase()]; if (!to) return m;
    return '#' + (h === h.toLowerCase() ? to.toLowerCase() : to);
  });
  for (const [a, b] of RGB) out = out.split(a).join(b);
  // car paint: the lime preset stays a paint choice
  if (/mybil\.js$/.test(f)) out = out.replace("'#FF3CC8', '#14E0F0', '#FFD60A'", "'#FF3CC8', '#14E0F0', '#D5FF62'");
  if (out !== src) { writeFileSync(f, out); changed++; console.log('  ', f.slice(ROOT.length + 1)); }
}
console.log(changed, 'files changed');
