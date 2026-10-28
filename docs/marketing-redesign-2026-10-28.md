# TeoriBoost public website · 28 October 2026

The standalone `site/` homepage uses a quiet light palette, editorial typography,
and a real exercise before introducing the vehicle rewards. The application in
`dist/` is a separate deployment and is outside this redesign.

The sample comes from `q-014` in `dist/content.js`, with its matching illustration
in `dist/exam-photos.js`. The context, selected assertion, answer and explanation
come from the existing exercise. The photograph-like image is an illustration;
it is labelled accordingly. Website derivatives are encoded at 640 and 1280 px;
the original application image is unchanged.

Content counts checked against the local application: 58 rule cards, 10 topics,
83 scenarios, and 25 scenarios per practice exam. Example leaderboard entries
are labelled as examples. Beta scope is stated on the page and in the FAQ.

## Validation

- `node scripts/validate-marketing.mjs`: local references, fonts and CSS assets,
  IDs, same-page anchors, application links and JavaScript syntax.
- Browser layout checked at 320, 390, 768, 1024 and 1440 px. No document-level
  horizontal overflow or broken loaded images. Independent visual review at
  desktop and 390 px; minor readability and answer-choice issues corrected.
- Both sample answers, explanation and reset; all four vehicle choices; keyboard
  range control; native FAQ; return-to-top and 404 return links checked.
- Without JavaScript, the sample explanation remains readable and unimplemented
  controls are hidden. Page content and the native FAQ remain available.
- Reduced-motion mode checked. Computed text contrast was checked and the two
  low-contrast numeric labels were darkened. This is bounded browser QA, not a
  complete accessibility audit or testing on physical mobile devices.

Preview: `node scripts/preview-marketing.mjs` (loopback port 4182).
Production target: existing Vercel project `teoriboost-site`, domain
`https://teoriboost.dk/`. Publish only the `site/` directory.
