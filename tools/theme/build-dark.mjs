// Builds dist/dark-gen.css: a dark counterpart of every light surface, line and dark text colour
// in the app's stylesheets, in the same order and with the same selectors (prefixed with
// html[data-theme="dark"]). Illustrations keep their own colours. Hand-made tweaks live in dist/dark.css.
// It also builds dist/light-gen.css the same way for the yellow light theme (html[data-theme="light"]): white turns
// yellow, the yellow buttons turn white and text darkens until it reads on yellow. Hand-made tweaks: dist/light.css.
// Run: node tools/theme/build-dark.mjs   (npm run build does it; --check only verifies)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');
const DARK = 'html[data-theme="dark"]', LIGHT = 'html[data-theme="light"]';

// scenes and art that are drawn, not UI, keep their colours in both themes;
// so does the start page, a poster with dark type on its own bright colours
const KEEP = /\.(start-|step-|plan-|tw\b|road-|judge__(hotspot|clip-label|replay|legend|intro)|turn-scene-tag|mh-(glass|scene|sun|hills|ground|road|hud|stat|ring|sheen|glint|cast|led|mount|dots|ico)|gu\b|gu-|sc-|sc\b|start-hero|start-show|start-ticker|dn-|cast-art|kw\b|kw-|kl\b|fx-|confetti|brand-mark|stop-sign|world|scene-photo-stage|exam-art|night-)|#city|#question-scene/;

const BG_PROPS = /^(background(-color|-image)?|border(-(top|right|bottom|left))?(-color)?|outline(-color)?|box-shadow|column-rule(-color)?)$/;
const FG_PROPS = /^(color|fill|stroke|caret-color|text-decoration(-color)?|-webkit-text-fill-color)$/;
const NAMED = { white: '#ffffff', black: '#000000' };

/* ---------- colour maths ---------- */
function parseColor(str) {
  let s = str.toLowerCase();
  if (NAMED[s]) s = NAMED[s];
  if (s[0] === '#') {
    let h = s.slice(1); if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
    const n = i => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(v => v.endsWith('%') ? parseFloat(v) * 2.55 : parseFloat(v));
  return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
}
function toHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min, s = l > .5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}
function fromHsl({ h, s, l }, a) {
  const k = n => (n + h / 30) % 12, q = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 * (l - q * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  const hex = [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('');
  return a >= .999 ? '#' + hex : `rgba(${f(0)},${f(8)},${f(4)},${+a.toFixed(3)})`;
}
/** light surfaces/lines become graphite (keeping a hint of their hue); dark text becomes light */
export function darkColor(str, role) {
  const c = parseColor(str); if (!c || c.a === 0) return str;
  const hsl = toHsl(c);
  if (role === 'bg') {
    if (hsl.l <= .7) return str;                         // vivid or dark fills (lime, signals) stay
    const s = Math.min(hsl.s, .42) * (hsl.l > .97 ? .35 : 1);
    return fromHsl({ h: hsl.h, s, l: .115 + (1 - hsl.l) * .85 }, c.a);
  }
  if (hsl.l >= .55) return str;                          // already light text stays
  return fromHsl({ h: hsl.h, s: Math.min(hsl.s, .75), l: .93 - hsl.l * .55 }, c.a);
}
// the yellow light theme: page, cards, wells inside cards, lines
export const YELLOW = { page: '#FFD60A', card: '#FFEB85', well: '#FFE45C', line: '#E8BC00', lineStrong: '#D9AE00' };
const lum = ({ r, g, b }) => { const f = v => (v /= 255) <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
export const contrast = (a, b) => { const [x, y] = [lum(parseColor(a)), lum(parseColor(b))].sort((p, q) => q - p); return (x + .05) / (y + .05); };
const withAlpha = (hex, a) => a >= .999 ? hex : fromHsl(toHsl(parseColor(hex)), a);
/** neutral light surfaces/lines become yellow, the yellow brand fill and its pale tints become white,
 *  dark text darkens until it reads on the yellow page */
export function lightColor(str, role) {
  const c = parseColor(str); if (!c || c.a === 0) return str;
  const hsl = toHsl(c), yellowish = hsl.h >= 40 && hsl.h <= 60 && hsl.s > .5;
  if (role === 'bg') {
    if (yellowish && ((hsl.l > .5 && hsl.l < .56) || hsl.l >= .85)) return withAlpha('#FFFFFF', c.a);
    if (hsl.l < .8 || (hsl.s > .3 && hsl.l < .975)) return str;  // dark, vivid and tinted fills stay
    return withAlpha(hsl.l >= .975 ? YELLOW.card : hsl.l >= .93 ? YELLOW.well : hsl.l >= .87 ? YELLOW.line : YELLOW.lineStrong, c.a);
  }
  if (hsl.l >= .6 || c.a < .5) return str;                     // light text sits on dark or vivid fills
  const out = { ...hsl }; let hex = str;
  while (contrast(hex = fromHsl(out, 1), YELLOW.page) < 4.5 && out.l > .04) out.l -= .02;
  return c.a >= .999 ? hex : fromHsl(out, c.a);
}
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b|\bblack\b/g;
function mapValue(value, role, colorFn) {
  if (/url\(/i.test(value)) return value;               // images: leave alone
  return value.replace(COLOR_RE, m => colorFn(m, role));
}

/* ---------- a small CSS reader (rules, @media/@supports, skips keyframes/font-face) ---------- */
function blocks(css) {
  const out = []; let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i); if (open < 0) break;
    const prelude = css.slice(i, open).trim(); let depth = 1, j = open + 1;
    while (j < css.length && depth) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
    out.push({ prelude, body: css.slice(open + 1, j - 1) }); i = j;
  }
  return out;
}
function decls(body) {
  const out = []; let depth = 0, cur = '';
  for (const ch of body) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ';' && !depth) { out.push(cur); cur = ''; } else cur += ch; }
  if (cur.trim()) out.push(cur);
  return out.map(d => { const k = d.indexOf(':'); return k < 0 ? null : { prop: d.slice(0, k).trim().toLowerCase(), value: d.slice(k + 1).trim() }; }).filter(Boolean);
}
function prefixSelector(sel, prefix) {
  sel = sel.trim();
  if (!sel || /^:root\b/.test(sel) || /\[data-theme/.test(sel) || KEEP.test(sel)) return null;
  if (/^html\b/.test(sel)) return sel.replace(/^html/, prefix);
  return `${prefix} ${sel}`;
}
// selectors that sit on a vivid fill (yellow, signal colours): their text keeps its colour
const VIVID_VAR = /var\(--(accent|acid|good|bad|blue|orange|purple|poster)/;
function isVivid(value) {
  if (VIVID_VAR.test(value)) return true;
  return (value.match(COLOR_RE) || []).some(m => { const c = parseColor(m); if (!c || c.a < .5) return false; const { s, l } = toHsl(c); return s > .55 && l > .4 && l <= .8; });
}
const onVivid = new Set();
function collectVivid(css) {
  for (const { prelude, body } of blocks(css.replace(/\/\*[\s\S]*?\*\//g, ''))) {
    if (prelude.startsWith('@')) { if (/^@(media|supports)/.test(prelude)) collectVivid(body); continue; }
    if (decls(body).some(d => /^background(-color)?$/.test(d.prop) && isVivid(d.value)))
      for (const sel of prelude.split(/,(?![^(]*\))/)) onVivid.add(sel.trim());
  }
}
function transform(css, prefix, colorFn) {
  let out = '';
  for (const { prelude, body } of blocks(css.replace(/\/\*[\s\S]*?\*\//g, ''))) {
    if (prelude.startsWith('@')) {
      if (/^@(media|supports)/.test(prelude)) { const inner = transform(body, prefix, colorFn); if (inner) out += `${prelude}{\n${inner}}\n`; }
      continue;
    }
    const raw = prelude.split(/,(?![^(]*\))/).map(x => x.trim());
    const sels = raw.map(x => prefixSelector(x, prefix)).filter(Boolean);
    if (!sels.length) continue;
    const vivid = raw.some(x => onVivid.has(x) || onVivid.has(x.replace(/:(hover|focus|focus-visible|active)/g, '')));
    // every colour declaration is repeated (changed or not), so the themed rules keep the base cascade order;
    // text on a vivid fill is repeated unchanged
    const repeated = [];
    for (const { prop, value } of decls(body)) {
      const role = BG_PROPS.test(prop) ? 'bg' : FG_PROPS.test(prop) ? 'fg' : null; if (!role) continue;
      repeated.push(`${prop}:${role === 'fg' && vivid ? value : mapValue(value, role, colorFn)}`);
    }
    if (repeated.length) out += `${sels.join(',')}{${repeated.join(';')}}\n`;
  }
  return out;
}

const THEMES = { dark: [DARK, darkColor], light: [LIGHT, lightColor] };
/** builds dark-gen.css (theme 'dark') or light-gen.css (theme 'light') from the base stylesheets */
export function buildTheme(theme = 'dark') {
  const [prefix, colorFn] = THEMES[theme];
  const html = readFileSync(join(DIST, 'index.html'), 'utf8');
  const files = [...html.matchAll(/<link rel="stylesheet" href="([^"]+\.css)">/g)].map(m => m[1]).filter(f => !/^(dark|light)/.test(f));
  onVivid.clear();
  for (const f of files) collectVivid(readFileSync(join(DIST, f), 'utf8'));
  let gen = `/* GENERATED by tools/theme/build-dark.mjs from the stylesheets below. Do not edit; tweak dist/${theme}.css. */\n`;
  for (const f of files) { const t = transform(readFileSync(join(DIST, f), 'utf8'), prefix, colorFn); if (t) gen += `\n/* ${f} */\n${t}`; }
  return { gen, files };
}
export const buildDark = () => buildTheme('dark');

// only when run as a script (the tests import darkColor without writing anything)
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  for (const theme of ['dark', 'light']) {
    const { gen, files } = buildTheme(theme), name = `${theme}-gen.css`;
    if (process.argv.includes('--check')) {
      // used by the tests: fails when a stylesheet changed but the generated file was not rebuilt
      const now = readFileSync(join(DIST, name), 'utf8');
      if (now !== gen) { console.error(`${name} is out of date: run node tools/theme/build-dark.mjs`); process.exit(1); }
      console.log(name, 'is up to date');
    } else {
      writeFileSync(join(DIST, name), gen);
      console.log(name, (gen.length / 1024).toFixed(1) + ' KB from', files.length, 'stylesheets');
    }
  }
}
