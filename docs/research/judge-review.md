# Afsluttende kilde- og korrekthedsreview: `judge.js`

**Kontroltidspunkt:** 12. oktober 2026  
**Omfang:** De fire cases i `outputs/natkoersel/dist/judge.js`, deres samspil med teoriindholdet og den kodede 3D-geometri. Reviewet er en statisk kode- og kildekontrol. Det er ikke pixel-QA i en browser og ikke en faglig myndighedsgodkendelse.

## Status

**NO-GO før de to P1-fund er rettet.** Selve regelteksten og facit i alle fire cases stemmer med de kontrollerede officielle regler. B11-scenens hajtænder vender imidlertid den juridiske betydning mod den forkerte side i den kodede geometri, og den viste afmærkningskilde er ophævet.

## Actionable fund

### P1 — S11-hajtændernes spidser vender væk fra den vigepligtige bil

- **Sted:** `judge.js` linje 272-273 sammenholdt med 282 og 294-296.
- **Kodebevis:** Egen bil starter ved `z=8.2` og kører mod faldende `z`. Trekanterne har spids ved lokal `y=+0.55`; rotationen `m.rotation.x=-Math.PI/2` omsætter spidsen til faldende verdens-`z`, altså ind mod krydset og væk fra bilen på tilgangssiden.
- **Regel:** Gældende vejafmærkningsbekendtgørelse § 59 siger, at S11 angiver ubetinget vigepligt for kørende fra den side, som trekanternes spids vender mod. I denne scene skal spidserne derfor vende mod bilens tilgangsside ved stigende `z`.
- **Betydning:** B11-tavlen siger én ting, mens vejmarkeringens retning juridisk peger vigepligten mod den modsatte side. Det er en reel visuel facitmodsigelse i en opgave, hvor eleven skal udpege hajtænderne.
- **Rettelse:** Vend trekantsgeometrien, fx ved at lægge spidsen på lokal `y=-0.55` eller bruge en ækvivalent 180° vending. Bevar basen ved krydssiden. Verificér derefter i faktisk desktop- og mobilrender, at spidserne peger mod egen bil.
- **Kilde:** [BEK nr. 425 af 13. april 2023, § 59, S11](https://www.retsinformation.dk/eli/lta/2023/425/pdf), PDF side 33, tekstlinje 1467-1473 i den maskinlæsbare udgave.

### P1 — `afmaerkning` linker til en ophævet bekendtgørelse

- **Sted:** `judge.js` linje 5 og kildebrug linje 36 og 63; den faktiske URL kommer fra `content.js` linje 15.
- **Kodebevis:** Kilde-ID'et peger på BEK nr. 2511 af 9. december 2021. Den blev ophævet af BEK nr. 425 af 13. april 2023. `content.js` mærker samtidig den historiske kilde som kontrolleret 12. oktober 2026.
- **Betydning:** STOP- og B11-casene viser en historisk retsforskrift som aktuel faglig kilde. Regelindholdet om B11, B13, S11 og S13 er fortsat korrekt i BEK 425, men kildebeviset er ikke aktuelt.
- **Rettelse:** Udskift `afmaerkning` med BEK nr. 425 af 13. april 2023 og opdatér label/URL. Genbrug gerne samme ID for at undgå ændringer i casebanken, men lad label og link angive den gældende bekendtgørelse.
- **Kilder:** [Gældende tekst, BEK nr. 425](https://www.retsinformation.dk/eli/lta/2023/425/pdf), især § 16 og § 59; [historisk BEK nr. 2511](https://www.retsinformation.dk/eli/lta/2021/2511).

### P2 — B11-trinnet spørger efter et konfliktpunkt, men facit er en regulering

- **Sted:** `judge.js` linje 44-48.
- **Kodebevis:** Prompten er »Peg på det afgørende konfliktpunkt«, mens det korrekte hotspot hedder »Hajtænder og vigepligt« og ligger ved vigelinjen. Vigelinjen er stedet, hvor vigepligten er markeret; den er ikke konfliktpunktet mellem de to køretøjers baner.
- **Betydning:** Eleven kan forstå trafikgeometrien korrekt og pege på banernes skæring, men blive afvist, fordi opgaven reelt spørger efter den afgørende markering.
- **Rettelse:** Skift prompten til fx »Peg på markeringen, der afgør din vigepligt.« Hvis målet faktisk er konfliktpunktet, skal korrekt hotspot og label i stedet flyttes til banernes skæring.

### P2 — Hotspots er faste skærmprocenter, mens kameraets projektion ændres med formatet

- **Sted:** Casekoordinater linje 18-33, 44-60, 71-87 og 98-114; kamera linje 194-196 og resize linje 326-328; rendering af hotspots linje 397-399.
- **Kodebevis:** Hotspots gemmes som faste `x/y`-procenter. Det ortografiske kameras venstre/højre grænser beregnes på ny ud fra canvas-aspektet. Når formatet ændres, flytter projektionen af et verdenspunkt sig vandret, mens hotspotprocenten står stille. CSS skifter desuden scenens format fra 16:9 til 390:280 under 640 px.
- **Betydning:** Den korrekte klikmarkør kan drive væk fra stoplinje, hajtænder, cyklist eller gående på mobil. Det er et kodefund om koordinatsystemerne; den faktiske afstand er ikke pixelmålt i dette review.
- **Rettelse:** Knyt hotspots til verdenskoordinater og projekter dem gennem kameraet efter hver resize, eller vedligehold særskilte, renderkontrollerede koordinater pr. breakpoint. Kør pixel-QA ved mindst 390×280 og 16:9 før frigivelse.

## Casekontrol

| Case | Regel/facit | 3D-kodefund og afgrænsning |
|---|---|---|
| **STOP / B13** (`judge-stop`, linje 12-36) | **Korrekt.** B13 kræver stop; S13 angiver stedet. Efter stoppet består den ubetingede vigepligt. Et tomt kryds ophæver ikke stoppligten. Placeringen ved `z=5.9` holder bilens front umiddelbart før linjen ved `z=4.15`. | Den kodede bil kører fra `z=8.2` til `z=2.85` og passerer linjen, så fejlklippets grundidé holder. Det er ikke visuelt bekræftet, om linje, skilt og hotspots fremstår entydigt i alle formater. |
| **B11 / hajtænder** (`judge-yield`, linje 39-63) | **Korrekt i tekst og facit.** Ubetinget vigepligt gælder trafik fra begge sider; føreren skal vise vigepligten ved at nedsætte farten eller standse og må kun fortsætte uden fare eller ulempe. B11 kræver ikke altid fuldt stop. Her passerer tværtrafik, så ventepositionen bag hajtænderne er korrekt. Teorien i `content.js` linje 195 og q-058 afgrænser korrekt oversigtsstoppet. | **P1:** S11-trekanterne vender forkert. Den anden bil bevæger sig fra venstre mod krydset; reviewet har ikke pixelmålt, om konfliktforløbet fremstår tydeligt ved klippets slutposition. |
| **Højresving / cyklist** (`judge-bike`, linje 66-90) | **Korrekt.** Færdselsloven § 26, stk. 6 kræver, at den højresvingende ikke er til ulempe for ligeudkørende cyklister. Planens 7.13 kræver gentagen orientering, blindvinkeltjek og at holde tilbage. Teoriens `sving-cykel`, q-034 og q-066 er konsistent. | Egen bil bevæges frem og mod højre, mens cyklisten fortsætter ligeud på den parallelle cykelsti. Det understøtter teksten på kodeniveau. Om afstande og cyklistens synlighed er tydelige kræver pixel-QA. |
| **Ureguleret fodgængerfelt** (`judge-pedestrian`, linje 93-117) | **Korrekt.** Færdselsloven § 27, stk. 7 kræver tilpasset hastighed uden fare eller ulempe for gående i eller på vej ud i feltet samt standsning om nødvendigt. Case, facit og teoriens q-068 bruger samme præcise afgrænsning. | Feltets striber ligger parallelt med vejretningen, bilen kører ind mod feltet, og den gående flyttes ind i feltet. Det er kodekonsistent; hotspotplaceringens pixels er ikke visuelt godkendt her. |

## Officiel evidens

- [Færdselsloven, LBK nr. 118 af 12. januar 2026](https://www.retsinformation.dk/eli/lta/2026/118/dan/pdf): § 26, stk. 2, 5 og 6 om ubetinget vigepligt og højresving; § 27, stk. 7 om ureguleret fodgængerfelt.
- [Bekendtgørelse om vejafmærkning, BEK nr. 425 af 13. april 2023](https://www.retsinformation.dk/eli/lta/2023/425/pdf): § 16 om B11 og B13; § 59 om S11, S13 og S17. Bekendtgørelsen ophævede BEK nr. 2511.
- [Færdselsstyrelsens undervisningsplan kategori B, version 1.1, maj 2026](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf): 7.11 om fremkørsel mod kryds, 7.13 om højresving og cyklister samt 7.6/7.13 om gående ved fodgængerfelt.

## Releaseafgrænsning

Efter rettelse af hajtændernes retning og det historiske kildelink er der ingen fundet faglig facitfejl i de fire cases. Pixelplacering, læsbarhed, overlap og faktisk oplevet bevægelsesretning skal fortsat prøves i den renderede UI; den del er ikke dokumenteret af denne statiske review.
