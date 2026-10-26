import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolveTheme, themePref, setThemePref } from '../dist/theme.js';
import { darkColor, lightColor, contrast, YELLOW } from '../tools/theme/build-dark.mjs';

const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

test('the theme follows the device unless a choice is made', () => {
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  const store = memory();
  assert.equal(themePref(store), 'system', 'nothing chosen yet');
  store.setItem('teoriboost.theme', 'nonsense'); assert.equal(themePref(store), 'system');
});

test('dark colours: light surfaces go graphite, dark text goes light, the yellow stays', () => {
  const l = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * .2126 + ((n >> 8) & 255) * .7152 + (n & 255) * .0722) / 255; };
  assert.ok(l(darkColor('#ffffff', 'bg')) < .15, 'white card becomes dark');
  assert.ok(l(darkColor('#1F2328', 'fg')) > .75, 'ink becomes light');
  assert.equal(darkColor('#FFD60A', 'bg'), '#FFD60A', 'yellow fill stays');
  assert.equal(darkColor('#ffffff', 'fg'), '#ffffff', 'white text stays');
  assert.match(darkColor('rgba(255,255,255,.9)', 'bg'), /rgba\(\d+,\d+,\d+,0\.9\)/, 'alpha is kept');
});

test('light colours: white goes yellow, the yellow buttons go white, text reads on yellow', () => {
  assert.equal(lightColor('#ffffff', 'bg'), YELLOW.card, 'white card becomes light yellow');
  assert.equal(lightColor('#E3E5E8', 'bg'), YELLOW.line, 'grey line becomes a yellow line');
  assert.equal(lightColor('#FFD60A', 'bg'), '#FFFFFF', 'the yellow button becomes white');
  assert.equal(lightColor('#58CC02', 'bg'), '#58CC02', 'signal green stays');
  for (const c of ['#5F656D', '#0A7BBF', '#D42F2F', '#3B8A00']) assert.ok(contrast(lightColor(c, 'fg'), YELLOW.page) >= 4.5, c + ' reads on yellow');
  assert.equal(lightColor('#ffffff', 'fg'), '#ffffff', 'white text stays');
});

test('dark-gen.css and light-gen.css match the stylesheets', () => {
  execFileSync(process.execPath, ['tools/theme/build-dark.mjs', '--check'], { stdio: 'pipe' });
});
