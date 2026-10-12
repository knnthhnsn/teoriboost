# Uafhængigt fagligt review af lesson-depth-b

**Kontrolleret:** 2026-10-12  
**Omfang:** Afgrænset tekst- og kildereview af de 32 lektioner i `lesson-depth-b.json`. Reviewet prioriterer vigepligt, sving og bløde trafikanter, overhaling og motorvej, standsning/parkering, uheld og sele, 17-årige, alkoholgrænser samt prøve og undervisningsforløb. Det er ikke kørelærergodkendelse, praktisk færdighedsvurdering eller visuel QA.

## Findings

### P1 — forkert lovhenvisning ved den skærpede alkoholgrænse for nye bilister

**Sted:** `nybilist` → card **“Treårsperioden”** og lektionens case.

**Problem:** Reglen er gengivet korrekt, men begge `sourceLocator` peger på **Færdselsloven § 54**. § 54 handler om påvirkning af narkotika, sygdom, søvnmangel m.v. Den særlige alkoholgrænse i de første tre år efter førstegangserhvervelse af kategori B står i **§ 53, stk. 2**. En bruger, der følger henvisningen, lander derfor ved en anden forseelse end den beskrevne.

**Præcis rettelse:** Bevar brødtekstens grænser, men erstat locator begge steder med:

> `Færdselsloven § 53, stk. 2; Plan B 5.4.3`

**Primær dokumentation:** [Færdselsloven, § 53, stk. 2](https://www.retsinformation.dk/eli/lta/2026/118) og [Undervisningsplan kategori B, version 1.1, pkt. 5.4.3](https://www.fstyr.dk/Media/638922240246076913/Undervisningsplan%20B%20-%20Version%201.1.pdf).

### P1 — barnesikringsregler henvises til den forkerte bestemmelse

**Sted:** `sele-ansvar` → cards **“Børn under 135 cm”**, **“Førerens ansvar”** og lektionens case.

**Problem:** Kravet om godkendt sikkerhedsudstyr til børn under 135 cm og førerens ansvar for dette står i **§ 80 a**, ikke alene i § 80. § 80 regulerer sikkerhedssele og førerens ansvar for, at passagerer under 15 år bruger sele; § 80 a regulerer det særlige børneudstyr. De nuværende locators gør to forskellige pligter til én.

**Præcis rettelse:**  
- “Børn under 135 cm” og casen: `Færdselsloven § 80 a, stk. 1 og stk. 6; Plan B 6.2.7`.  
- “Førerens ansvar”: `Færdselsloven § 80, stk. 4, og § 80 a, stk. 6; Plan B 6.2.7`.

**Primær dokumentation:** [Færdselsloven, §§ 80 og 80 a](https://www.retsinformation.dk/eli/lta/2026/118) og [Undervisningsplan kategori B, version 1.1, pkt. 6.2.7](https://www.fstyr.dk/Media/638922240246076913/Undervisningsplan%20B%20-%20Version%201.1.pdf).

### P2 — motorvejstilkørsel beskriver kun den indkørendes pligt

**Sted:** `motorvej` → card **“Tilkørsel”**.

**Problem:** Sætningen “Trafikken på motorvejen har ikke pligt til at skabe plads gennem et pludseligt baneskift” er isoleret set rimelig, men udelader den udtrykkelige pligt for trafikken i den bane, der køres ind i: Den skal om nødvendigt nedsætte hastigheden for at lette udkørslen fra accelerationsbanen. Kortet kan derfor læses som om motorvejstrafikken slet ikke har en medvirkende pligt.

**Præcis rettelse:** Erstat de to sidste sætninger med:

> “Tilpas hastigheden i accelerationsbanen, og kør kun ind uden fare eller unødig ulempe. Trafikken i den bane, du kører ind i, skal om nødvendigt sænke hastigheden for at lette indkørslen; reglen kræver ikke et pludseligt eller uforsvarligt vognbaneskift.”

**Locator:** `Færdselsloven § 18, stk. 3; Plan B 7.16.4`.

**Primær dokumentation:** [Færdselsloven, § 18, stk. 3](https://www.retsinformation.dk/eli/lta/2026/118).

### P2 — B13-kortet sammenblander den ubetingede vigepligt med pligter over for gående

**Sted:** `stop` → card **“Stop løser ikke vigepligten”**.

**Problem:** B13 indebærer efter standsningen ubetinget vigepligt for **kørende færdsel fra begge sider**. Kortet nævner cyklister, knallerter og gående i samme opremsning, så det kan fremstå som om alle følger af selve B13-reglen. Hensynet og vigepligten over for gående følger af de konkrete manøvrer og Færdselslovens §§ 3, 26 og 27.

**Præcis rettelse:** Erstat kortets hovedregel med:

> “Efter fuldt stop har du stadig ubetinget vigepligt for kørende fra begge sider. Orientér efter biler, cyklister og knallerter, før du kører frem. Kontrollér særskilt gående og overhold de pligter, der følger af din svingning og eventuelle fodgængerfelter.”

**Locator:** `BEK 425, B13; Færdselsloven §§ 3, 26 og 27; Plan B 7.4.3`.

**Primær dokumentation:** [Bekendtgørelse om vejafmærkning, B13](https://www.retsinformation.dk/eli/lta/2023/425) og [Færdselsloven, §§ 26-27](https://www.retsinformation.dk/eli/lta/2026/118).

### P2 — udrykningssignaler beskrives fejlagtigt som en samtidig kombination

**Sted:** `udrykning` → card **“Se hele situationen”**.

**Problem:** “Når blå blink og sirene nærmer sig” gør begge signaler til en betingelse. Færdselsloven kræver, at trafikanter giver fri bane ved særligt **lyd- eller lyssignal**; ét af signalerne kan altså være nok.

**Præcis rettelse:** Skift indledningen til:

> “Når et udrykningskøretøj nærmer sig med særligt lyd- eller lyssignal, skal du give fri bane uden at skabe en ny fare.”

**Locator:** `Færdselsloven § 7, stk. 2; Plan B 4.3.1`.

**Primær dokumentation:** [Færdselsloven, § 7, stk. 2](https://www.retsinformation.dk/eli/lta/2026/118).

### P2 — locator for minimumslektioner medtager en bestemmelse, der ikke bærer talangivelsen

**Sted:** `forloeb` → card **“Minimumslektioner”**.

**Problem:** Oplysningen om mindst 30 teorilektioner og 24 praktiske lektioner for kategori B støttes af BEK 731 § 9, stk. 2. Den nuværende locator `§§ 9 og 24` gør § 24 til medbelæg for minimumstallene, selv om den ikke er den relevante hjemmel for netop disse tal.

**Præcis rettelse:** Skift locator til:

> `BEK 731 § 9, stk. 2; Plan B 1.1`

**Primær dokumentation:** [Bekendtgørelse om kørekort, BEK nr. 731 af 20. juni 2026, § 9, stk. 2](https://www.retsinformation.dk/eli/lta/2026/731).

## Prioriterede områder uden yderligere findings

Det afgrænsede review fandt ikke yderligere konkrete regelbrud i følgende højrisikoområder:

- B11, B13 og højre vigepligt: fuldt stop ved B13, fortsat ubetinget vigepligt efter stoppet, og højre vigepligt hvor der ikke er pålagt ubetinget vigepligt, er gengivet i overensstemmelse med BEK 425 og Plan B 7.4.
- Sving, cyklister og gående: højresving, venstresving, dobbeltrettet cykelsti, fodgængerfelt og rundkørsel er handlingsmæssigt forsvarligt beskrevet i forhold til Færdselsloven §§ 26-27 og Plan B 7.13-7.15.
- Overhaling: afstand, udsyn, forbudssituationer og tilbagekørsel, når det overhalede køretøj kan ses i det indvendige spejl, stemmer med Færdselsloven §§ 21-23 og Plan B 7.9.
- Standsning og parkering: definitionen af parkering, 10 meter ved vejkryds, 5 meter før fodgængerfelt samt cykelsti/fortov er korrekt afgrænset efter Færdselsloven §§ 2, 28 og 29.
- Uheld: stop, hjælp, sikring, identitetsoplysninger og polititilkald er i den gennemgåede tekst forenelige med Færdselsloven § 9.
- 17-årige: tidsrummene 05.00-20.00 og 20.00-05.00, ledsagerkravene og begrænsningen til kørsel i Danmark svarer til Færdselsstyrelsens aktuelle vejledning.
- Teoriprøven og digital prøve: 25 scenarier, højst fem fejl, fire svarmuligheder, 25 minutter, MitID og mulighed for at markere spørgsmål til senere er i tråd med Færdselsstyrelsens aktuelle prøvesider.
- Selvstudium: højst syv lektioner i bestemte teoriafsnit og kørelærerens planlægning/kontrol er korrekt afgrænset efter BEK 731 § 25.

**Reviewgrænse:** Konklusionerne bygger på den leverede tekst og de nævnte primærkilder pr. 2026-10-12. De dokumenterer ikke, at lektionerne alene dækker hele undervisningsplanen, at praktiske færdigheder er opnået, eller at materialet er godkendt af en kørelærer eller myndighed.
