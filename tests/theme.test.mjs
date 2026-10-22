import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolveTheme, themePref, setThemePref } from '../dist/theme.js';
import { darkColor } from '../tools/theme/build-dark.mjs';

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

test('dark colours: light surfaces go graphite, dark text goes light, the lime stays', () => {
  const l = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * .2126 + ((n >> 8) & 255) * .7152 + (n & 255) * .0722) / 255; };
  assert.ok(l(darkColor('#ffffff', 'bg')) < .15, 'white card becomes dark');
  assert.ok(l(darkColor('#1F2328', 'fg')) > .75, 'ink becomes light');
  assert.equal(darkColor('#D5FF62', 'bg'), '#D5FF62', 'lime fill stays');
  assert.equal(darkColor('#ffffff', 'fg'), '#ffffff', 'white text stays');
  assert.match(darkColor('rgba(255,255,255,.9)', 'bg'), /rgba\(\d+,\d+,\d+,0\.9\)/, 'alpha is kept');
});

test('dark-gen.css matches the stylesheets', () => {
  execFileSync(process.execPath, ['tools/theme/build-dark.mjs', '--check'], { stdio: 'pipe' });
});
