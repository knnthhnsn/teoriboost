// The Lær / Øvelser / Prøve switcher on Lær and Øvelser: three tabs with the menu icons, and one line saying what the current tab is for.
const TABS = [
  ['learn', 'Lær', 'wheel', 'Lektioner. Du lærer reglen, trin for trin.', '#home'],
  ['practice', 'Øvelser', 'light', 'Situationer. Du træner reglen.', '#practice'],
  ['exam', 'Prøve', 'exam', 'Samme form som den rigtige teoriprøve.', '#exam'],
];
export const tabExplain = active => `<nav class="tab-explain" aria-label="Lær, Øvelser eller Prøve"><div class="tab-explain__bar">${TABS.map(([id, name, ico, , href]) =>
  `<a class="tab-explain__card${id === active ? ' is-here' : ''}" href="${href}"${id === active ? ' aria-current="page"' : ''}><img src="assets/nav/${ico}.webp" alt="" width="24" height="24"><strong>${name}</strong></a>`).join('')}</div>${(TABS.find(tab => tab[0] === active) || [])[3] ? `<p class="tab-explain__line">${TABS.find(tab => tab[0] === active)[3]}</p>` : ''}</nav>`;
