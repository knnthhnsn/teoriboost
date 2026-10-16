# Claude review of the first exemplar

Source: https://claude.ai/chat/094259e6-67fa-4b02-8a52-378de4a17ee3

One actual 390x844 opening screenshot plus implementation description. Claude did not operate the app, hear audio, or test learners. Model training was disabled with explicit user approval. Raw visible response follows.

Hvad jeg faktisk kan se i billedet: Fanerne “Forrude / Højreside” med Højreside aktiv. Statusmærke “DU HOLDER STILLE”. Stillbillede af cyklist på rød cykelsti. Billedtekst: “Illustreret øvesituation, billedet viser ikke en officiel teoriprøve”. Overskrift “ET BLINK. TO BANER.” Instruktion: “Undersøg højresiden, før du vælger dit næste træk.” En grøn boks, der allerede siger: “Du har undersøgt højresiden. Klar til at vælge?” Knap: “Jeg er klar til at vælge”. Resten (konsekvens, regelformulering, selvvurdering, 7-dages variant) kan jeg ikke se; det er beskrivelse, ikke evidens.

1. Skærmen afslører risikoen, før eleven har fundet den (design)
Set: cyklisten er det eneste tydelige objekt, centreret og belyst, og teksten erklærer allerede “du har undersøgt højresiden”. Det er også en uforholdsmæssig bekræftelse: eleven har blot trykket på en fane.
Hypotese: eleven lærer “tryk på fanen, så er jeg færdig” frem for at scanne. Den senere “udpeg risikoområde” bliver så en ren genkendelse af det åbenlyse.
Rettelse: fjern bekræftelsesboksen indtil eleven har udpeget noget. Gør scenen mere realistisk (cyklist delvist skjult af mørke/lygtepæl, evt. også et andet mindre mærkbart element), og lad udpegningen være en handling i billedet.
Test: A/B i kørelærerreview og små elevforsøg: andel der finder cyklisten, og tid til første udpegning, med og uden bekræftelsesboks. Kontrolspørgsmål bagefter med en ny scene uden pointer.

2. Måling: “selvvurdering uden AI-bedømmelse” måler tryghed, ikke kompetence (måling)
Ikke set, men følger af beskrivelsen: selvvurdering er ofte overskattet hos dem, der kan mindst, og en “bevaret første fejl” kan blive en trøstende historie frem for data.
Rettelse: log adfærd, ikke tro: udpegning korrekt/forkert, første valg, latenstid, regelformulering mod en afkrydsningsliste (fx vigepligt over for ligeudkørende cykler på gennemgående sti), transfer-scenen. Vis selvvurdering ved siden af disse som kalibrering (“du var sikker, men valgte forkert”).
Test: sammenlign selvvurdering mod transferresultat; hvis sammenhængen er svag, må den ikke bruges som læringsindikator.

3. Transfer og kildekobling er ubevist (fagligt)
Hypotese: sikkerhedsvarianten (hold tilbage, cyklist passerer) kan lære “vent altid”, ikke “vig for ligeudkørende på cykelstien”. Den nye geometri over gennemgående cykelsti ændrer måske blot overfladen. Samtidig er §26 stk. 6 “uden for kryds” nævnt som kilde; hvis scenen er i et kryds, skal eleven ikke få indtryk af, at samme regel gælder uændret. Det kræver kørelærerafklaring, og kilderne bør kun vises, når de er verificeret mod den konkrete situation.
Rettelse: lad kørelærere kortlægge hver scene mod præcis regel og lav mindst én kontrasttest hvor korrekt handling er at køre.
Test: elever får to scener, hvor kun cyklistens position/vigepligt ændres; mål overkorrekt tøven. Uden denne gennemgang og uden elevdata kan der ikke påstås noget om læring.

## Closure mapping — 16. oktober 2026

Claude’s review was a bounded critique, not a validation run. It used **Claude Sonnet 5.5 Medium**, free, with training disabled per user setting. Claude received one 390×844 screenshot and an implementation description only; it did not operate the app, hear audio, inspect the actual image-point interaction, or test learners.

- **Risk discovery:** The new lesson uses an actual cyclist image-point selection with an accessible text alternative. The browser evidence records the method in `evidence/turn-phone-risk.jpg`; the image remains legible. The suggestion to hide the cyclist in artificial darkness was rejected because it would reduce instructional readability. Any harder visibility scaling requires qualified instructor review and human learner testing.
- **First answers and repairs:** Wrong risk/decision/transfer paths are recorded, repaired, and preserved in the final evidence table. Response latency is retained as bounded interaction evidence, not a learning score.
- **Recall boundary:** Typed recall survives reload and is shown as an explicit learner self-report. It is not independently scored by the app and is not evidence of mastery.
- **Transfer contrast:** The later contrast distinguishes a cleared cyclist followed by a renewed check and correct proceed from “always wait” and skip-check answers. This addresses Claude’s concern that the lesson might teach unconditional waiting. Evidence: `evidence/turn-phone-transfer.jpg`, `evidence/turn-phone-contrast.jpg`, and `evidence/turn-phone-done.jpg`.
- **Legal source:** Claude’s uncertainty about the driveway rule was not accepted as a factual conclusion. The primary current source was checked independently: Færdselsloven LBK nr. 118 af 12. januar 2026, § 26, stk. 6, 2. og 5. pkt., with § 17, stk. 1 and § 16, stk. 2. Qualified driving-instructor review remains pending.

The closure evidence supports bounded UI and interaction claims only. It does not establish pronunciation quality, curriculum approval, human learning efficacy, transfer, or real-world safety outcomes.
