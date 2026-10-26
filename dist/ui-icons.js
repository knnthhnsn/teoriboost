// The app's own line icons (24×24, round caps, currentColor). Used everywhere an emoji might have been tempting.
const P = {
  flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.2 2.2-5.3 3.6-7 .4 1.7 1.3 2.9 2.4 3.5C11.3 8 12.4 5 15 3c-.1 2.6 1 4.4 2.3 6 1 1.3 1.7 2.9 1.7 4.9C19 18.2 16.1 21 12 21Z"/><path d="M12 21c-1.7 0-2.8-1.2-2.8-2.8 0-1.7 1.3-2.7 2.3-3.9.3 1.1 1 1.7 1.8 2 .5.2 1.5.9 1.5 2.1 0 1.5-1.2 2.6-2.8 2.6Z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M14 14h2M8 17h2"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  trend: '<path d="M3.5 17.5 9 12l3.5 3.5 7-7.5"/><path d="M15 8h4.5v4.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  stop: '<path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3Z"/><path d="M8 12h8"/>',
  bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16 9.5 8.5h5L18 16M9.5 8.5 12 16h-6M14.5 8.5 13 5.5h-2"/>',
  yield: '<path d="M4 5.5h16L12 19.5Z"/><path d="M8.2 8.2h7.6L12 15Z"/>',
  car: '<path d="M4 16v-3.4l1.7-4.4A2 2 0 0 1 7.6 7h8.8a2 2 0 0 1 1.9 1.2l1.7 4.4V16"/><path d="M3 16h18v2.5H3Z"/><circle cx="7.5" cy="18.5" r="1.8"/><circle cx="16.5" cy="18.5" r="1.8"/><path d="M5.5 12.5h13"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="2.5"/><path d="M9 4.5h6v3H9Z"/><path d="m8.8 14 2.2 2.2 4.4-4.6"/>',
  light: '<rect x="8" y="2.8" width="8" height="18.4" rx="3.5"/><circle cx="12" cy="7.2" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="16.8" r="1.5"/>',
  gauge: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4-5.5"/><path d="M6.5 13h1M12 8.5v1M17.5 13h-1"/>',
  sparkle: '<path d="M12 3.5 13.7 9 19 10.7 13.7 12.4 12 18 10.3 12.4 5 10.7 10.3 9Z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M7 7l10 10M17 7 7 17"/>',
  repeat: '<path d="M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4"/>',
  bolt: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6Z"/>',
  up: '<path d="m6 14 6-6 6 6"/>',
  down: '<path d="m6 10 6 6 6-6"/>',
  grip: '<circle cx="9" cy="6.5" r="1.2" fill="currentColor"/><circle cx="15" cy="6.5" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="17.5" r="1.2" fill="currentColor"/><circle cx="15" cy="17.5" r="1.2" fill="currentColor"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><path d="M4.5 5.5h1v2M4.3 11h1.6l-1.6 2h1.6M4.3 16.5h1.5l-.8 1 .8 1H4.3"/>',
};
/** Inline SVG icon. Decorative by default (aria-hidden); pass a label to make it meaningful. */
export function ico(name, { cls = '', label = '' } = {}) {
  const body = P[name]; if (!body) return '';
  return `<svg class="ui-ico ${cls}" viewBox="0 0 24 24" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${body}</svg>`;
}
export const ICON_NAMES = Object.keys(P);

// Duotone icons for the menu and chips: a soft filled shape (.d) behind a clean outline (.s).
// The fill takes the same colour at low opacity, so an icon reads as one shape in any tint, and as
// white-on-colour when its tile is active.
const DUO = {
  book: { d: '<path d="M2.8 5.6c3.4-1 6.4-.6 9.2 1.4V20c-2.8-1.9-5.8-2.4-9.2-1.4Z"/><path d="M21.2 5.6c-3.4-1-6.4-.6-9.2 1.4V20c2.8-1.9 5.8-2.4 9.2-1.4Z"/>',
          s: '<path d="M2.8 5.6c3.4-1 6.4-.6 9.2 1.4 2.8-2 5.8-2.4 9.2-1.4v13c-3.4-1-6.4-.5-9.2 1.4-2.8-1.9-5.8-2.4-9.2-1.4Z"/><path d="M12 7v13"/><path d="M15.6 5.5v5.2l1.7-1.2 1.7 1.2V5.3"/>' },
  wheel: { d: '<circle cx="12" cy="12" r="9"/>',
           s: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.6"/><path d="M3.3 10.6c2.9.9 5.8 1.4 8.7 1.4s5.8-.5 8.7-1.4"/><path d="M12 14.6v6.3"/>' },
  exam: { d: '<rect x="4.5" y="4" width="15" height="17.5" rx="3"/>',
          s: '<rect x="4.5" y="4" width="15" height="17.5" rx="3"/><path d="M9 2.8h6a1 1 0 0 1 1 1V6H8V3.8a1 1 0 0 1 1-1Z"/><path d="m8.4 13.4 2.4 2.4 4.8-5"/>' },
  car: { d: '<path d="M3.5 12.6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v4.6h-17Z"/>',
         s: '<path d="M5.2 10.6 7 6.4A2.2 2.2 0 0 1 9 5h6a2.2 2.2 0 0 1 2 1.4l1.8 4.2"/><path d="M3.5 12.6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v4.6h-17Z"/><path d="M6 17.2v2.3M18 17.2v2.3"/><circle cx="7.6" cy="13.9" r="1.2"/><circle cx="16.4" cy="13.9" r="1.2"/>' },
  ai: { d: '<path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-5.5L7 20.6V17a3 3 0 0 1-3-3Z"/>',
        s: '<path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-5.5L7 20.6V17a3 3 0 0 1-3-3Z"/><path d="M12 7.2 13 9.7l2.5 1-2.5 1L12 14.2l-1-2.5-2.5-1 2.5-1Z"/>' },
  profile: { d: '<circle cx="12" cy="8.2" r="4"/><path d="M4.5 20.2a7.5 7.5 0 0 1 15 0Z"/>',
             s: '<circle cx="12" cy="8.2" r="4"/><path d="M4.5 20.2a7.5 7.5 0 0 1 15 0"/>' },
  flame: { d: '<path d="M12 21.2c-4 0-6.7-2.7-6.7-6.3 0-3.3 2.3-5.5 3.7-7.2.4 1.8 1.3 3 2.5 3.6C11.5 7.9 12.6 4.8 15.3 2.8c-.1 2.7 1 4.6 2.4 6.2 1 1.3 1.8 3 1.8 5.1 0 4.3-3.1 7.1-7.5 7.1Z"/>',
           s: '<path d="M12 21.2c-4 0-6.7-2.7-6.7-6.3 0-3.3 2.3-5.5 3.7-7.2.4 1.8 1.3 3 2.5 3.6C11.5 7.9 12.6 4.8 15.3 2.8c-.1 2.7 1 4.6 2.4 6.2 1 1.3 1.8 3 1.8 5.1 0 4.3-3.1 7.1-7.5 7.1Z"/><path d="M12 21.2c-1.8 0-3-1.2-3-2.9 0-1.8 1.4-2.8 2.4-4 .3 1.1 1 1.8 1.9 2.1.6.3 1.6 1 1.6 2.2 0 1.5-1.2 2.6-2.9 2.6Z"/>' },
  target: { d: '<circle cx="12" cy="12" r="9"/>',
            s: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3"/>' },
  trend: { d: '<path d="M3.5 18.5 9 12.5l3.5 3.5 7-7.5v10Z"/>',
           s: '<path d="M3.5 17.5 9 12l3.5 3.5 7-7.5"/><path d="M15 8h4.5v4.5"/>' },
  calendar: { d: '<path d="M3.5 8a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v2h-17Z"/>',
              s: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M14 14h2M8 17h2"/>' },
};
/** Duotone icon (menu, chips). */
export function duo(name, { cls = '' } = {}) {
  const i = DUO[name]; if (!i) return '';
  return `<svg class="duo ${cls}" viewBox="0 0 24 24" aria-hidden="true"><g class="d">${i.d}</g><g class="s">${i.s}</g></svg>`;
}
export const DUO_NAMES = Object.keys(DUO);
/** The streak flame's level: 0 burnt out (no streak), 1 first days, 2 from 3 days, 3 from a week, 4 from 30 days (the
 *  streak medals' steps); 5 is the comeback flame, shown when a broken streak starts again (see mirror-hero.js). */
export const flameLevel = streak => streak >= 30 ? 4 : streak >= 7 ? 3 : streak >= 3 ? 2 : streak >= 1 ? 1 : 0;
/** The streak flame's drawing for a level (assets/flame; the dancing version is flame.riv). Shown until Rive takes
 *  over, and instead of it with reduced motion. */
export function flameArt(level = 2) {
  return `<img class="flame-art" src="assets/flame/L${level}-idle.webp" alt="" decoding="async">`;
}
