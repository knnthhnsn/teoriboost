// Convert the app's hard-coded dark-theme colours to a white, neutral light theme.
// Context-aware: a colour is mapped by the property it sits in.
//   surfaces (background, border, outline): dark -> light neutral grey, tint removed
//   text (color, fill, stroke, caret):       light -> graphite ink; mid accents -> darker, readable on white
//   shadows (box-/text-shadow, drop-shadow): kept dark, alpha halved
// Usage: node docs/redesign/tools/to-light.mjs dist/*.css   (skips redesign.css)
import fs from 'node:fs';

const hexRe = /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
const rgbRe = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/gi;

function parseHex(h) {
  h = h.slice(1);
  if (h.length <= 4) h = [...h].map(c => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1];
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function hslToRgb(h, s, l) {
  if (!s) return [l, l, l].map(v => Math.round(v * 255));
  const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(v * 255));
}
const out = (rgb, a) => a >= 1 ? '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('') : `rgba(${rgb.join(',')},${+a.toFixed(3)})`;

function mapColor([r, g, b, a], kind) {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (kind === 'shadow') return out([r, g, b], a * 0.5);
  if (kind === 'surface') {
    if (l >= 0.5) return out([r, g, b], a);                       // already light (accent fills)
    return out(hslToRgb(h, s * 0.25, 1 - l * 0.55), a);           // dark panel -> light neutral
  }
  // text-like
  if (l > 0.72 && s < 0.35) return out(hslToRgb(h, s * 0.3, 0.1 + (1 - l) * 0.4), a); // white-ish text -> ink
  if (l > 0.35) return out(hslToRgb(h, Math.min(1, s), 0.3), a);  // bright accent text -> darker for white bg
  return out([r, g, b], a);                                        // already dark
}
function kindOf(prop) {
  if (/shadow/.test(prop)) return 'shadow';
  if (/^(color|fill|stroke|caret-color|-webkit-text-fill-color|text-decoration-color|accent-color)$/.test(prop)) return 'text';
  if (/^(background|background-color|background-image|border|border-.*|outline|outline-color|--.*)$/.test(prop)) return 'surface';
  return null;
}
function convertValue(prop, value) {
  const kind = kindOf(prop);
  if (!kind) return value;
  // drop-shadow() inside filter is handled as shadow even under other properties
  return value
    .replace(hexRe, m => mapColor(parseHex(m), kind))
    .replace(rgbRe, (m, r, g, b, a) => mapColor([+r, +g, +b, a === undefined ? 1 : a.endsWith('%') ? parseFloat(a) / 100 : +a], kind));
}

let total = 0;
for (const file of process.argv.slice(2)) {
  if (/redesign\.css$/.test(file)) continue;
  const css = fs.readFileSync(file, 'utf8');
  let n = 0;
  // Declarations: prop:value up to ; or } (skips selectors, keeps @media structure intact).
  const next = css.replace(/([{;]\s*)([-a-z]+)\s*:\s*([^;{}]+)/gi, (m, pre, prop, value) => {
    const v = convertValue(prop.toLowerCase(), value);
    if (v !== value) n++;
    return `${pre}${prop}:${v}`;
  });
  if (n) fs.writeFileSync(file, next);
  total += n;
  console.log(`${file}: ${n} declarations converted`);
}
console.log('total', total);
