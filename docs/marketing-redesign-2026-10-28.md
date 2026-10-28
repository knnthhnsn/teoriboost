# TeoriBoost public website · 28 October 2026

The standalone `site/` homepage is built around a road theme: asphalt, white road paint and signal yellow, with
the app's own art. The application in `dist/` is a separate deployment and is outside this redesign.

- The hero is a zebra crossing in perspective (our logo is a crossing): one word of the headline per stripe,
  in tall road lettering, and scrolling walks you over it. The headline itself is a real `h1` for screen readers.
- A hajtand (yield marking) with words driving round it; hovering or focusing it brings them to a stop.
- A text block set as a hajtand, painted on word by word as you scroll; `site.js` sizes the triangle so the
  words always end in its point.
- The four stops (Lær, Øv, Prøve, Spørg) run sideways while you scroll down on desktop (pinned), and swipe on
  phones. A real exercise follows: `q-014` from `dist/content.js` with its illustration, labelled as such.
- The garage is built part by part as you scroll. The frames in `site/assets/glowup/` are rendered from the app
  itself by `tools/site-glowup.mjs` (the app on 127.0.0.1:4178), so tints and parts match the app exactly.
  Part names, Booster prices and earning rates are the app's (`dist/mybil-catalog.js`, `BOOSTER_RATES`).
- The cast lines come from `dist/cast.js`; the streak flame changes at 1, 3, 7 and 30 days (`flameLevel`).

Content counts checked against the local application: 58 rule cards, 10 topics, 83 scenarios, and 25 scenarios
per practice exam. The race and leaderboard are labelled as examples. Beta scope is stated on the page and in
the FAQ. The 404 page uses the same road language.

## Validation

- `node scripts/validate-marketing.mjs`: local references, IDs, same-page anchors, app links, JavaScript syntax.
- Chromium (Playwright) scroll tours at 320, 390, 768, 1024 and 1440 px: no horizontal overflow, no console
  errors. Reduced motion: nothing hidden, no pinned sections. Keyboard: visible focus on light and dark.
  First load about 213 KB; the garage frames (1.4 MB) load only when the garage is near.
- Not tested: Safari and Firefox, and physical phones. CSS 3D, container queries and `shape-outside` are
  supported there, but the crossing and the hajtand text have only been seen in Chromium.

Preview: `node scripts/preview-marketing.mjs` (loopback port 4182).
Production target: existing Vercel project `teoriboost-site`, domain `https://teoriboost.dk/`. Publish only
the `site/` directory, from a copy outside the git repository.
