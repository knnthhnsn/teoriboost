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
- Spørg Sneglen: the app's chat as it looks, playing as you scroll (the question is typed, Sneglen looks through the
  58 rule cards, answers word by word with its sources and a joke, then offers a quiz you can take). The answers
  are labelled as examples and written from the app's exercises and sources (`dist/content.js` q-065, q-058,
  q-059, q-047, q-036; the quiz is q-035). Chips let you ask the other questions. Sneglen crawls along the
  bottom and leaves a wet trail; when you scroll faster than a snail it says "Vent på mig!".
- Smooth scroll: a mouse wheel or touchpad glides with a little follow-through, and so do links within the page.
  Touch, keys and the scrollbar stay native; it is off with reduced motion, and the chat keeps its own wheel.

## Phones and tablets

- Nothing is pinned on touch screens or short screens: the hero scrolls away with your finger and the walk over
  the crossing follows it (`.is-flow`); the stops are swiped; the garage and the chat play as you scroll past.
  What is pinned is decided in CSS; `site.js` reads it (`position: sticky`) so both always agree.
- On phones the hero stacks the copy above the crossing (they cannot overlap at any height), and landscape phones
  get a hero as tall as its copy, so the button is never pushed off the screen.
- The chat has a fixed height on phones (just enough for the quiz), fills from the top and scrolls itself, so the
  page never grows under your finger and a swipe over it moves the page.
- Hover effects only on devices that hover; quiz buttons 44 px for thumbs; no label under 12 px on phones.
- Performance: scroll work only for sections near the screen, no layout reads in the frame loop, Sneglen's path
  sampled once, endless CSS loops paused off screen, garage frames decoded ahead. Measured on an emulated phone
  with a 4x slower CPU: 60 fps in every section except brief dips at the garage's part steps.
- Scroll-driven animations: where the browser has scroll timelines (Chrome 115+, Safari 26+), the CSS moves the
  continuous effects with the scroll itself (the walk over the crossing and its fades, the ticker, the photo, the
  race, the finish line, the stops' road); `site.js` does the same only without them, and for reduced motion.
  The view timelines use `view-timeline-inset: 0`, or the page's scroll-padding (for anchor links) would shift them.
- The hajtand text's lines are set by `site.js`: every word measured in the page's font, each line as wide as the
  triangle at its foot, justified, soft hyphens kept. Safari breaks lines around `shape-outside` differently (on an
  iPhone the text ran out of the triangle); the CSS shape stays as the fallback without JavaScript.
- The garage frames have versioned addresses (`?v=` + a hash, written by `tools/site-glowup.mjs`), because
  `/assets` is cached for a week: a phone showed week-old frames with the scooter's plate text in the old place.
- The streak flame starts as smoke (0 days) and grows at 1, 3, 7 and 30 days, as in the app.
- Tested in Chromium and in WebKit (Playwright 27.2). That WebKit build for Windows draws no 3D perspective and no
  variable font weights, so the crossing and the heavy type are judged in Chromium and on a real iPhone; the line
  setting, the scroll timelines and the interactions are checked in both.

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
