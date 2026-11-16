// Light / dark / follow the device. The choice lives on this device only.
// index.html sets data-theme before the first paint; this module keeps it in step afterwards.
const KEY = 'teoriboost.theme';
const CHOICES = ['system', 'light', 'dark'];
const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)');

export function themePref(store = globalThis.localStorage) {
  try { const v = store.getItem(KEY); return CHOICES.includes(v) ? v : 'dark'; } catch { return 'dark'; }
}
export function resolveTheme(pref, systemDark = !!media?.matches) {
  return pref === 'dark' || (pref === 'system' && systemDark) ? 'dark' : 'light';
}
export function applyTheme(pref = themePref()) {
  const theme = resolveTheme(pref), root = document.documentElement;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0F1215' : '#FFD60A');
  return theme;
}
export function setThemePref(pref, store = globalThis.localStorage) {
  if (!CHOICES.includes(pref)) return applyTheme();
  try { store.setItem(KEY, pref); } catch {}
  return applyTheme(pref);
}
/** Follows the device while the choice is "system". */
export function watchSystemTheme() {
  const on = () => { if (themePref() === 'system') applyTheme('system'); };
  media?.addEventListener?.('change', on);
  return () => media?.removeEventListener?.('change', on);
}
export const THEME_CHOICES = [['system', 'Følg enheden'], ['light', 'Lys'], ['dark', 'Mørk']];
