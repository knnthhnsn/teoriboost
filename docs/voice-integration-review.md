# Voice integration review

Dato: 2026-10-12  
Scope: read-only kodegennemgang af voice-integrationen i `dist/app.js`, `dist/index.html`, `dist/judge.js`, `dist/garage.js`, `dist/lesson-view.js`, `dist/voice*.js` og relevante styles. Ingen kode blev ændret som del af reviewet.

## Findings

### P1 — Builden kan godkende en delvis voice-pakke til udgivelse

Ved review-snapshot var produktionen stadig korrekt markeret `partial` (`444/1235` registrerede klip; produktionen kørte fortsat). Det er forventet under produktionen, men den nuværende buildgate opdager det ikke: `validate.mjs:167-202` følger kun statiske HTML/CSS/import-referencer og undersøger hverken `VOICE_PACK.status`, katalogdækning eller MP3-filerne i manifestet. `package.json:6` lader derfor `npm run build` lykkes, selv om en delvis `dist/voice-pack.js` er importeret af appen. I en publiceret build vil nogle knapper virke, mens andre fail-closer som manglende lyd.

Præcis rettelse: tilføj en obligatorisk releasekontrol i `validate.mjs` eller et særskilt script, som `build` kalder. Den skal kræve `VOICE_PACK.status === "complete"`, samme nøglesæt og normaliserede tekst som alle 1235 poster i `authoring/voice-catalog.json`, samt en eksisterende, ikke-tom lokal MP3 for hver `src`. Brug gerne `authoring/voice-production.json` til at kontrollere SHA-256 og kræv `completed === catalogueEntries` uden fejl. En `partial` pakke må fortsat skrives atomisk under produktionen, men må ikke kunne passere releasegaten.

### P2 — Den fuldt udfoldede afspiller kan dække en stor del af mobilens arbejdsområde

`dist/voice.css:1-4` gør hele panelet sticky med `z-index:6`. Under 700 px beholder det sticky-positionen, viser et transcript på op til `6.6em` og lægger betjeningerne i to rækker. Ved 390 px bliver panelet statisk set omtrent 260–310 px højt; efter at det har sat sig under topbaren, ruller quiz- og valgknapper bag det. Det er en reel risiko for, at fokuserede eller nyligt opdaterede svar ligger skjult under voice-widgetten, selv om kontrollerne selv opfylder 44 px-målet.

Præcis rettelse: sæt `.voice-player { position: static; }` i mobil-breakpointet, eller gør kun en kompakt statuslinje sticky og lad transcript/kontroller blive i dokumentflowet. Verificér derefter ved 390 px, at et fokuseret svar, `<summary>` og næste-knap kan bringes helt fri af både voice-panelet og den faste bundnavigation.

## Kontroller uden findings

- Facitgrænserne er bevaret. Spørgsmålsforklaring kræver besvaret mission eller resultatvisning (`dist/app.js:113,139`); lektionsfacit ligger inde i lukkede `details` (`dist/lesson-view.js:22-23`); garagefeedback og huskekrog kræver et registreret svar, og recall-svaret ligger i sit eget `details` (`dist/garage.js:146-157,195-210`). Judge-forklaringen kan først læses i fase 4 (`dist/judge.js:290-338`).
- Den oplæste rækkefølge følger den viste rækkefølge. Spørgsmål bruger det aktuelt renderede `q.statements`; Garage genbruger `optionOrder(topic)` og sender de samme id'er til voice-helperen (`dist/garage.js:49-58,141-145,201-205`); Judge genbruger `orderedChoices(...)` i alle tre valgfaser og siger `Mulighed N` (`dist/judge.js:221-229,260-274,332-338`).
- Navigation og humor-/indstillingsændringer stopper lyd via `teardown()` og `applySettings()` (`dist/app.js:77-85,145,148`). Judge kalder desuden stop ved hvert nyt `paint()` og ved korrekt replay (`dist/judge.js:290-330`).
- Den globale klikhandler returnerer efter en voice-knap, før quizvalgslogikken nås (`dist/app.js:139`). Garage- og Judge-knapper bruger separate attributter og handlers, så et lytteklik ændrer ikke et quizvalg.
- Der er ingen autoplay ved initialisering. Afspilning starter kun fra de eksplicitte lyttehandlers.

## Evidensgrænse

Root rapporterede Brave-QA med introklip på 13,824 sekunder samt fungerende start efter klik, pause, genoptagelse, hastighed 1,25, start forfra og stop ved navigation. Det er medtaget som overleveret evidens og er ikke genkørt i dette review. Reviewet indeholder ingen browseraudit og ingen påstand om subjektiv gennemlytning eller stemmekvalitet. Den delvise produktionspakke må ikke publiceres, før den er komplet og releasekontrollen ovenfor består.
