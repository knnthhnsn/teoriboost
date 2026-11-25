// Vibrationer, der følger appens lyde: et let tryk ved valg, et dobbelt tryk ved rigtigt svar,
// et blødt tryk ved forkert svar og en længere rytme ved fejringer. Fejl må aldrig føles som straf,
// så det forkerte svar får den roligste vibration af dem alle.
//
// Android og andre browsere med navigator.vibrate får hele mønstret. Safari på iPhone kan ikke vibrere
// fra en webside, men fra iOS 18 giver en kontakt (<input type="checkbox" switch>) systemets eget lille
// tryk, når den skifter. Det bruger vi som et enkelt tryk, og kun når eleven selv har trykket.

/** cue -> mønster i millisekunder: vibrér, pause, vibrér ... Navnene er de samme som lydene i experience.js. */
export const PATTERNS = Object.freeze({
  select: 8, spin: 8, nav: 8, node: 8, 'card-advance': 8, 'toggle-on': 10, 'toggle-off': 6, color: 8,
  step: 12, correct: [14, 45, 18], repair: 22, 'exam-fail': 30,
  paint: 14, part: 14, wheels: [12, 40, 12], neon: [10, 30, 10, 30, 10], lower: 24, plate: 14,
  'rev-scooter': [16, 30, 22], 'rev-smallcar': [18, 30, 26], 'rev-bigcar': [22, 30, 34], 'rev-racecar': [20, 25, 30, 25, 44],
  booster: [14, 40, 24], buy: [18, 50, 36], complete: [16, 40, 16, 40, 60], milestone: [24, 50, 24, 50, 90],
  'exam-pass': [30, 60, 30, 60, 120]
});

export function createHaptics({ enabled = () => true, suppressed = () => false, nav = globalThis.navigator, doc = globalThis.document } = {}) {
  let last = 0, iosSwitch = null;
  const canVibrate = typeof nav?.vibrate === 'function';

  // iPhone: en skjult kontakt, som vi slår til og fra. Den har ingen navn eller data-felter, så appens
  // egne lyttere på 'change' ignorerer den.
  function iosTap() {
    try {
      if (!iosSwitch) {
        const label = doc.createElement('label'), input = doc.createElement('input');
        input.type = 'checkbox'; input.setAttribute('switch', ''); input.tabIndex = -1;
        label.setAttribute('aria-hidden', 'true');
        label.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
        label.append(input); doc.body.append(label); iosSwitch = label;
      }
      iosSwitch.click();
    } catch { /* en browser uden kontakten gør bare ingenting */ }
  }

  function buzz(cue) {
    const pattern = PATTERNS[cue];
    if (!pattern || !enabled() || suppressed()) return false;
    const now = Date.now();
    if (now - last < 60) return false; // to tryk lige efter hinanden bliver til én vibration
    last = now;
    if (canVibrate) { try { return nav.vibrate(pattern); } catch { return false; } }
    if (typeof doc?.createElement === 'function' && /iPhone|iPad|iPod/.test(nav?.userAgent || '')) { iosTap(); return true; }
    return false;
  }
  return { buzz, PATTERNS };
}
