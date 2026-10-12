# Bounded korrekthedsreview: øveprøve og lagring

**Kontroldato:** 12. oktober 2026  
**Omfang:** Statisk læsning af `dist/app.js` og `dist/core.js`, suppleret med små direkte funktionsprober af `gradeQuestion()` og `validateExam()`. `index.html` blev kun læst for at bekræfte, at `main` kan fokuseres, og at dialog/toast har grundlæggende ARIA-markering. Ingen browserkørsel er udført; fund om event-rækkefølge og fokus er derfor kodebevis eller reproduktionsforslag, ikke browserbevis.

## Fund, der bør rettes før release

### P1 — Fristen håndhæves af intervallet, ikke af brugerhandlingerne

**Sted:** `app.js:83-96` (`tick`, `confirmExam`, `finishExam` og den globale click-handler).

**Fejl:** Det gemte wall-clock-tidspunkt er en god basis og forhindrer, at reload eller en skjult fane nulstiller tiden. Men kun `tick()` sammenligner `Date.now()` med `deadline`. Valg, hop, markering, “næste”, åbning af afleveringsdialogen og `confirm-submit` kontrollerer ikke fristen. `finishExam(false)` genberegner heller ikke, om fristen allerede er passeret. Der findes derfor et kort vindue efter deadline og før næste intervalkald, hvor et svar kan ændres eller prøven kan afleveres som ikke-udløbet. Browserens throttling af timere i skjulte faner kan gøre rækkefølgen mindre forudsigelig.

**Reproduktion:** Start en prøve med en deadline få sekunder fremme, vælg et svar eller bekræft aflevering umiddelbart efter deadline men før næste `tick()`. Alternativt: skjul fanen omkring deadline, vis den igen og forsøg et valg, før det forsinkede interval er kørt. Sidste variant er ikke browserafprøvet her.

**Konsekvens:** Svar efter tidsudløb kan komme med i resultatet, og resultatet kan mangle markeringen “TIDEN UDLØB”.

**Rettelse:** Indfør én central guard, der kaldes først i **alle** eksamensmutationer:

```js
function ensureExamOpen(now = Date.now()) {
  if (!exam || exam.result) return false;
  if (now >= exam.deadline) { finishExam(true); return false; }
  return true;
}
```

Brug den før svarvalg, hop, flag, forrige/næste, submit og confirm. Lad desuden `finishExam()` altid beregne `expired = expired || Date.now() >= exam.deadline`. Kontrollér fristen på `visibilitychange`, `pageshow` og ved enhver route til prøven. Lås eksamen i en terminal status før bedømmelse og logning.

### P1 — Shallow storage-validering kan crashe prøven eller godkende et ufuldstændigt svar

**Sted:** `core.js:18, 22-24, 73-76`; `app.js:80-84, 93-96`.

**Fejl:** `validateExam()` validerer ID-listen, men sender `responses` og `flagged` næsten urørt videre. Et sandt objekt som `flagged: {}` overlever og får senere `exam.flagged.includes(...)` til at fejle. Et svar som streng, objekt eller array med forkert længde kan tilsvarende give fejl ved tildeling eller misvisende “besvaret”-status.

Der er også en selvstændig hul-array-fejl: `gradeQuestion()` bruger `Array.prototype.every()`. `every()` springer tomme pladser over. En array med `length === 4`, men kun svar på indeks 0 og 3, kan derfor blive vurderet korrekt, hvis de to tilstedeværende svar matcher. En direkte probe gav:

```text
sparseIndexes [ '0', '3' ] grade true
flaggedType object responsesQ1 string
```

En sådan array kan opstå efter genoptagelse af korrupt/ældre storage, fx `[true]`, hvis brugeren derefter svarer på udsagn 4 før udsagn 2 og 3.

**Konsekvens:** Resume kan crashe, “besvaret” kan blive vist forkert, og i værste fald kan et delvist svar tælle som korrekt.

**Rettelse:** Normalisér ved `validateExam()`:

- `flagged` skal være et deduplikeret array af ID'er, der indgår i den aktuelle prøve.
- `responses` skal være et almindeligt objekt med kun de 25 prøve-ID'er.
- Hvert svar skal altid blive en tæt array på præcis fire værdier; behold kun bogstavelig `true`/`false`, og erstat alt andet med `null`.
- Brug én fælles `isCompleteResponse()` med en eksplicit løkke over indeks 0-3 til jump-status, afleveringsoversigt og grading.
- Omskriv `gradeQuestion()` til en indeksløkke eller `Array.from({length: 4}, ...)`, så huller aldrig springes over.

Tilføj tests for `flagged: {}`, ukendte flag-ID'er, svar som streng/objekt, arrays med 0-3 eller 5 elementer, `null`, sparse arrays og ukendte response-nøgler.

### P1 — To faner kan overskrive eller genoplive en prøve og dens resultat

**Sted:** `app.js:7, 44, 81, 85, 102`.

**Fejl:** Hele `state` læses én gang ved opstart og skrives derefter som ét localStorage-dokument. Der er ingen `storage`-listener, revision eller prøve-ID. En anden fane kan derfor gemme en gammel kopi oven i nyere data.

**Reproduktion A:** Åbn to faner. Start prøve i fane A. Skift en indstilling i den allerede åbne fane B. B kan skrive sin gamle `savedExam: null` og dermed fjerne A's gemte prøve, indtil A gemmer igen.

**Reproduktion B:** Lad begge faner have samme genoptagne prøve. Aflever i A. Når B senere kører `pagehide`, kalder den `stashExam()` og kan overskrive A's registrerede historik/fremgang samt genoplive den afsluttede prøve.

**Konsekvens:** Tabte svar, tabt resultat/fremgang eller en afsluttet prøve, der dukker op igen. Den nuværende `exam.result`-guard beskytter kun mod dobbeltlogning i samme JavaScript-instans.

**Rettelse:** Giv hver prøve et tilfældigt `examId` og en monoton `revision`. Gem aktiv prøve adskilt fra læringsfremgang, lyt på `storage`, og stop en fane, hvis en nyere revision eller en completion-tombstone for samme `examId` findes. Ved afslutning gemmes et idempotent completion-record; `recordAnswer` og history må kun anvendes én gang pr. `examId`. En enklere release-løsning er en aktiv-fane-lease og en tydelig skrivebeskyttet besked i sekundære faner.

### P2 — Det detaljerede resultat forsvinder ved reload

**Sted:** `app.js:85-87, 102-105`.

**Fejl:** `finishExam()` gemmer kun en kort history-række og nulstiller `savedExam`. `exam.result`, de 25 svar og `expired` findes kun i hukommelsen. Reload på `#exam-result` giver derfor `exam === null`, hvorefter `examResult()` returnerer prøveintroen. Brugeren mister den lovede gennemgang af hvert svar.

**Reproduktion:** Aflever en prøve, åbn et par forklaringer på resultatsiden, og genindlæs siden. Den detaljerede resultatside er væk; kun den korte history-række kan senere ses under fremgang.

**Rettelse:** Gem et sanitiseret `lastExamResult` med `examId`, completion-tidspunkt, de 25 ID'er, fire normaliserede svar pr. ID, resultat og `expired`. Rekonstruér kun mod aktuelle kendte spørgsmål. Alternativt skal UI tydeligt sige, at gennemgangen er midlertidig, og reload/tilbage-navigation skal gå til historikken frem for en tom `#exam-result`.

### P2 — `#exam-result` kan skjule en aktiv prøve og gøre overskrivning for let

**Sted:** `app.js:53-55, 79-80, 86, 96`.

**Fejl:** Hvis URL'en bliver `#exam-result`, mens `exam` findes uden `result` (fx browserhistorik eller direkte hash-navigation), returnerer `examResult()` prøveintroen. Introen viser både “Start øveprøve” og eventuelt “Fortsæt gemt prøve”. “Start” kalder `startExam(false)` og overskriver den aktive/gemte prøve uden advarsel. Den samme tavse kassering kan ske fra den normale intro, når en gemt prøve findes.

**Konsekvens:** Brugeren kan tro, at der ikke er en aktiv prøve, og miste svar ved at starte en ny.

**Rettelse:** Route en aktiv, uafsluttet prøve fra `#exam-result` tilbage til `#exam` eller vis en pauseside med “Fortsæt” og “Kassér prøve”. “Start ny” skal kræve en eksplicit kassering, når `state.savedExam` findes. Den normale `new-exam`-knap fra et færdigt resultat fungerer ellers korrekt i den læste kode.

### P2 — Fokus og navigation annoncerer ikke spørgsmåls- og resultatskift tydeligt

**Sted:** `app.js:50, 53-55, 68, 82-86`.

**Fejl:** Efter hvert hashskift fokuseres hele `<main>`. Det er fokusérbart, men har ikke et navn, og den aktuelle spørgsmålsoverskrift får ikke fokus eller live-annoncering. For en tastatur-/skærmlæserbruger kan “Næste situation” derfor ende ved main-landmarken, hvorefter tab-rækkefølgen starter ved tilbageknappen og scenehandlingen før svarene. Der gives heller ingen målrettet hørlig besked ved kritisk tid eller automatisk aflevering. `setNav()` mapper heller ikke `exam-result` til `exam`, så resultatsiden mangler `aria-current`, og dokumenttitlen falder tilbage til “Træning”.

**Konsekvens:** Det er svært at opdage, hvilket spørgsmål der nu er aktivt, at tiden udløb, og hvor resultatsiden hører hjemme i navigationen.

**Rettelse:** Giv den aktuelle spørgsmålstitel `id` og `tabindex="-1"`, og fokusér den efter forrige/næste/jump. Fokusér resultatets `h1` efter automatisk eller manuel aflevering. Annoncér kun meningsfulde tærskler, fx to minutter og “tiden udløb”, i en separat `aria-live="assertive"` region; lad ikke sekundnedtællingen være live. Map `exam-result` til `exam` i navigation og titel. Bevar native dialogens fokusfælde, men afprøv retur-fokus ved manuel lukning og timeout i browser.

## Kontrolleret uden fund af samme-fane-dobbeltlogning

`finishExam()` sætter `exam.result` før de 25 `recordAnswer()`-kald og history-push. Timer og manuel aflevering kan derfor ikke begge logge resultatet i den samme kørende fane; det andet kald returnerer tidligt. Startup-forløbet for en udløbet gemt prøve kan route to gange, men samme guard forhindrer en ny logning. Denne beskyttelse dækker ikke stale state fra flere faner, og der mangler et vedvarende `examId`, som kan bevise exactly-once efter fanekonflikt eller fremtidige ændringer.

## Minimums-QA efter rettelser

1. En deterministisk clock-test for valg og submit én millisekund før, præcis ved og én millisekund efter deadline.
2. Tests for skjult fane, `visibilitychange`, navigation væk/tilbage, reload før/efter deadline og reload på `#exam-result`.
3. Storage-fuzzing af `savedExam`, inklusive alle typer og længder nævnt i P1-fundet.
4. En to-fane-test, hvor start, svar, settings-save, aflevering og `pagehide` krydses i begge rækkefølger.
5. Tastatur- og skærmlæserkontrol af næste/forrige/jump, modal, automatisk timeout, resultat og “Prøv igen”.

Den eksisterende server på `127.0.0.1:4178` er ikke brugt i dette review. Ovenstående reproduktioner bør derfor køres som browser-QA efter implementering; rapporten påstår ikke observeret browseradfærd.
