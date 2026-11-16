// One small guide shown on Lær and Øvelser: what each of the three study tabs is for, with the same icons as the menu.
const TABS = [
  ['learn', 'Lær', 'wheel', 'Lektioner. Du lærer reglen.', '#home'],
  ['practice', 'Øvelser', 'light', 'Situationer. Du træner reglen.', '#practice'],
  ['exam', 'Prøve', 'exam', 'Som den rigtige teoriprøve.', '#exam'],
];
export const tabExplain = active => `<nav class="tab-explain" aria-label="Hvad de tre faner er til">${TABS.map(([id, name, ico, line, href]) =>
  `<a class="tab-explain__card${id === active ? ' is-here' : ''}" href="${href}"${id === active ? ' aria-current="page"' : ''}><img src="assets/nav/${ico}.webp" alt="" width="40" height="40"><strong>${name}</strong><small>${line}</small></a>`).join('')}</nav>`;
