# Faglig review af pensumudvidelse q-072–q-083

**Kontrolleret 12. oktober 2026.** Reviewet omfatter de seks nye sektioner for 2.7, 7.10, 7.14, 7.21, 7.22 og 9.5 samt alle fire udsagn, facit og forklaringer i q-072–q-083. Primær reference er [Færdselsstyrelsens undervisningsplan for kategori B, version 1.1, maj 2026](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf). Lov- og afmærkningshenvisninger følger de officielle Retsinformation-kilder, som allerede er registreret i `content.js`.

## Rettede fund

| Prioritet | Sted | Fund og betydning | Rettelse |
|---|---|---|---|
| P1 | `trafiksanering`, q-074 | Teksten sagde “normalt højst 15 km/t”. Planens 7.10.3 siger **normalt under 15 km/t** for opholds- og legeområde. Den tidligere formulering gjorde 15 km/t til et korrekt normalt valg. | Fakta, svarudsagn og forklaring bruger nu “normalt under 15 km/t”. |
| P1 | `trafiksanering`, q-074 | Fortsættelsesbetingelsen nævnte kun farlig nærhed. Planens 7.10.5 kræver også, at personer, som opholder sig eller leger på vejen, har set bilen og givet plads. | Facit og forklaring kræver nu alle tre forhold: set bilen, givet plads og ingen farlig nærhed. |
| P2 | `trafiksanering`, `letbane`, `sammensat-koersel` | Pensumreferencerne sluttede ved henholdsvis 7.10.3, 7.21.3 og 7.22.1, selv om fakta også dækkede 7.10.4–5, 7.21.4 og 7.22.2–3. | Referencerne er udvidet til de faktiske spænd: 7.10.1–5, 7.21.1–4 og 7.22.1–3. |
| P2 | q-072–q-083 | Alle korrekte udsagn stod først (`TTFF` eller `TTTF`). Det gjorde mønstergenkendelse mulig uden faglig vurdering. | Udsagnene er blandet uden at ændre betydning eller facit. De 12 mønstre er nu `TFTT`, `FTFT`, `FTTF`, `TFFT`, `TFTF`, `TFFT`, `FTFT`, `TFTF`, `FTTF`, `TFFT`, `FTTT`, `TFTF`. |
| P2 | `hoej-vejkant` | Titlen “Højt vejkantspor” var uklar og afveg fra planens begreb. | Titlen er ændret til “Høj vejkant”. |
| P1 | Alle seks nye sektioner | Hver sektion havde 6–7 faktalinjer, mens appens validerede indholdskontrakt tillader 3–5. Det blokerede buildet. | Overlappende fakta er samlet til fem pr. sektion uden at fjerne sikkerhedsgrænser eller den praktiske undervisningsgrænse. |

## Kontrol pr. område

- **2.7, q-072–q-073:** Forlæns parkering ved højre vejkant, progression fra rigelig til begrænset plads, parallel slutstilling og højst 20 cm er i overensstemmelse med 2.7.1. Appen siger korrekt, at praktisk færdighed kræver øvelsesplads og kørelærer.
- **7.10, q-074–q-075:** Efter rettelserne stemmer opholds- og legeområde, parkering og cykelgade med 7.10.2–7.10.5. Banken mangler stadig gågade, udkørsel med ubetinget vigepligt og genkendelse af flere tavler/afmærkninger.
- **7.14, q-076–q-077:** Facit om modkørende, grønt lys uden venstrepil, dækket udsyn, gående og dobbeltrettet cykelsti stemmer med 7.14.2–7.14.4. Scenarierne dækker kun en del af placering, signal, rømning og krydstyper.
- **7.21, q-078–q-079:** Eget signal, togets lange bremselængde og 45-minuttersbetingelsen med teoriundervisning som alternativ stemmer med planens 7.21. Banken mangler stadig konkret genkendelse af V 43, UB 11,3 og X 19 samt flere manøvresituationer.
- **7.22, q-080–q-081:** Fælles mål, opfølgning/refleksion, GPS/førerassistenter og selvstændig vurdering stemmer med 7.22.1–7.22.3. Teksten markerer korrekt, at appen hverken gennemfører eller dokumenterer den praktiske lektion.
- **9.5, q-082–q-083:** Stabil kurs langs kanten, forsigtig bremsning og tilbageføring først ved lav fart stemmer med 9.5.1. Selvtræning på offentlig vej afvises, og appen fremstilles ikke som praktisk træning.

## Dækningsvurdering

De seks områder er flyttet fra `missing` til `brief` i `curriculum-matrix.json`, med direkte mapping til de nye sektioner og q-ID'er. Ingen er flyttet til `partial`: to scenarier pr. område dækker ikke bredden i de officielle delmål, og praktiske færdigheder kan ikke opfyldes i appen. Matrixens snapshot er nu 10 kapitler, 58 sektioner og 83 spørgsmål; samlet status er 35 `brief`, 22 `partial`, 0 `missing`.

## QA og begrænsning

Maskinel kontrol bekræfter fire eksplicitte boolean-værdier pr. spørgsmål, mindst ét sandt og ét falsk udsagn, gyldige sektions- og kilde-ID'er, 83 unikke spørgsmål samt gyldige matrixhenvisninger. `npm.cmd run build` består med 12 kilder, 10 kapitler, 58 sektioner, 83 spørgsmål og 15 offline-filer; `npm.cmd test` består med 13 af 13 tests. Dette er kilde- og datakontrol. Illustrationerne i `diagrams.js` var under separat arbejde og er ikke pixel- eller browserkontrolleret her; især venstresving, dobbeltrettet cykelsti, letbanesignal og høj vejkant skal fortsat visuelt matche konteksten før release.
