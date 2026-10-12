# Uafhængigt kildereview: garage-roadworthy

## P1 - Bremsekredsfejl er gjort usikker

**Placering:** Topic `1.2.3 bremser`; objective `1.2.3.18`; card `Fejl mærkes i bilen`; recall `Hvad gør du, hvis bremsepedalen pludselig kan trædes længere ned end sædvanligt?`

**Problem:** Objective siger, at længere pedalvandring *muligvis* viser en defekt kreds, og recall svarer, at det *kan være* et tegn. Det svækker Plan B's entydige fejltegn.

**Plan B:** Pludseligt længere pedalvandring er tegn på, at den ene bremsekreds er defekt (`1.2.3.18`). Bremserne skal straks efterses ved længere pedalvandring (`1.2.3.21`).

**Rettelse:** Skriv objective og recall entydigt: "Pludseligt længere pedalvandring er tegn på en defekt bremsekreds; bremserne skal straks efterses." Bevar begge refs.

## P1 - Tilladte ekstra lygter og reflekser er ikke fuldt dækket

**Placering:** Topic `1.2.4 lygter-reflekser-horn`; objective `1.2.4.11`; card `Lange biler og ekstra lys`.

**Problem:** Kortet nævner kun ekstra fjernlys, tåge- og baklygter, arbejdslys og en vag restkategori. Det udelader kørelys, ekstra stop- og baglygter, tågebaglygter, søgelygter, afmærknings- og markeringslygter, parkeringslygter, overhalingsblink samt de tilladte refleksfarver.

**Plan B:** Punktet oplister alle disse lygter og hvide reflekser foran, gule på siderne og supplerende røde bagpå (`1.2.4.11a`). JSON bruger parent-ref `1.2.4.11`.

**Rettelse:** Udvid objective og card med hele listen, eller del kortet i to. Brug eventuelt `1.2.4.11a` som den præcise objective-ref, hvis datastrukturen tillader bogstavpunktet; ellers behold parent-ref og dæk hele underpunktet.

## P1 - Praktisk lygtekontrol mangler konkrete godkendelseskriterier

**Placering:** Topic `1.2.4 lygter-reflekser-horn`; practical `Lygter og reflekser`; refs `1.2.4.14`-`1.2.4.18`.

**Problem:** Handlingen siger generelt "helhed, renhed, farve og funktion". Den kræver ikke udtrykkeligt, at stoplys sammenlignes med baglys, blink ses som gult i sollys, alle blink tændes samtidigt med havariblink, eller nummerpladen belyses hvidt. Ref-listen lover mere, end handlingen faktisk instruerer.

**Plan B:** Den fysiske kontrol skal omfatte hele og rene lygter/reflekser (`1.2.4.14`), stoplys væsentligt kraftigere end baglys (`1.2.4.15`), gult blink synligt i sollys (`1.2.4.16`), alle blink samtidigt ved havariblink (`1.2.4.17`) og hvid nummerpladebelysning (`1.2.4.18`).

**Rettelse:** Omskriv practical til en nummereret rundt-om-bilen-sekvens med hvert kriterium ordret kortparafraseret. Bevar undervisningsbil, kørelærer og appens ikke-certificerende grænse.

## P2 - ABS-forklaringen taber to centrale funktionselementer

**Placering:** Topic `1.2.3 bremser`; objective `1.2.3.4`; card `ABS, assistent og ESC`.

**Problem:** Teksten forklarer trykregulering, blokering og pedalvibration, men udelader, at ABS i en vis udstrækning gør styring under bremsning mulig, og at hjulfølere sender omdrejningsdata til en elektronisk styreboks.

**Plan B:** ABS modvirker blokering, muliggør til en vis grad samtidig styring og bremsning og regulerer trykket ud fra signaler fra hjulfølere (`1.2.3.4`).

**Rettelse:** Udvid objective og card med den begrænsede styremulighed og sensor-styreboks-kæden. Skift samtidig "giver ofte vibrationer" til den kildepræcise pointe, at reguleringen mærkes som vibrationer i pedalen.

## P2 - ESC-kravet for nyere biler mangler

**Placering:** Topic `1.2.2 styreapparat`; objective `1.2.2.4`; card `Servo og ESC har forskellige roller`.

**Problem:** Objective og card beskriver kun ESC's virkning. De udelader, at Plan B også siger, at nyere biler skal være udstyret med ESC.

**Plan B:** Nyere biler skal have ESC; systemet mindsker risikoen for væltning og udskridning ved at bremse et eller flere hjul, især i sving (`1.2.2.4`).

**Rettelse:** Tilføj kravet om ESC i nyere biler til objective og card. Hold dette adskilt fra kontrollampen i `1.2.3.23`.

## P2 - One-pedal-funktionen mangler til- og frakobling

**Placering:** Topic `1.2.3 bremser`; objective `1.2.3.7`; card `Elbilens særlige bremser`.

**Problem:** Teksten beskriver regeneration og behovet for bremsepedal, men udelader, at funktionen ofte kan slås til og fra. Det er en bilspecifik egenskab, som er vigtig for ikke at fremstille one-pedal som permanent eller ens i alle elbiler.

**Plan B:** One-pedal findes på elbiler, kan ofte kobles til og fra, aktiverer regeneration når speederen løftes og erstatter ikke bremsepedalen, hvis virkningen er utilstrækkelig (`1.2.3.7`).

**Rettelse:** Tilføj "kan ofte slås til og fra" i objective og card, og behold formuleringen som en mulighed i relevante elbiler.

## P2 - Årsagen til elbilers bremsevedligeholdelse er tilføjet uden kildestøtte

**Placering:** Topic `1.2.3 bremser`; card `Elbilens særlige bremser`, sidste sætning; ref `1.2.3.8`.

**Problem:** Kortet forklarer det større vedligeholdelsesbehov med, at regeneration kan give mindre almindelig brug af de mekaniske bremser. Den årsagsforklaring står ikke i Plan B og bæres derfor ikke af den angivne ref.

**Plan B:** Elbilers bremser kræver mere opmærksomhed ved vedligeholdelse for at bevare effektiv funktion (`1.2.3.8`).

**Rettelse:** Fjern årsagsleddet, eller tilføj en særskilt autoritativ kilde og markér forklaringen som supplerende. Med `sourceRef: Plan B` bør kortet nøjes med planens vedligeholdelsespointe.

## P2 - Officielle eksempler på spring i gear er udeladt

**Placering:** Topic `1.2.6 energi-og-miljo`; objective `1.2.6.9`; card `Jævnhed og gearvalg`.

**Problem:** Objective og card siger kun "skift tidligt korrekt". Planens konkrete eksempler på at springe gear over er ikke dækket, selv om de står i selve det nummererede mål.

**Plan B:** Kvikt tråd med cirka halv speeder og korrekt gearvalg reducerer forbrug; korrekt valg kan eksempelvis være skift fra 2. til 4. eller 3. til 5. gear (`1.2.6.9`).

**Rettelse:** Tilføj de to eksempler som eksempler, ikke som et ubetinget krav i enhver bil. Afgræns rådet til biler med relevante manuelle gear.

## P2 - Plug-in-hybridkortet tilføjer en udokumenteret vægtforklaring

**Placering:** Topic `1.2.6 energi-og-miljo`; card `Hybrid kræver opladning`, sidste sætning; refs `1.2.6.21`, `1.2.6.22`.

**Problem:** Sætningen om at køre rundt med "ekstra teknik og vægt" uden at bruge idéen findes ikke i de to kildepunkter. Den giver en teknisk årsagsforklaring, som refs ikke bærer.

**Plan B:** Hybrid og plug-in-hybrid kombinerer forbrændings- og elmotor (`1.2.6.21`), og plug-in-typen er kun miljøvenlig/energieffektiv, når opladningsmuligheden udnyttes mest muligt (`1.2.6.22`).

**Rettelse:** Fjern sidste sætning og slut med den kildepræcise betydning af faktisk opladning. Hvis vægtpåstanden ønskes, kræver den særskilt kilde og en mere præcis afgrænsning.

## P2 - Dækkontrollen indsnævrer "alle hjul" til fire

**Placering:** Topic `1.2.7 daek-faelge-baerende-dele`; practical `Mønster og skader`; ref `1.2.7.9`.

**Problem:** Handlingen siger "på alle fire hjul". Plan B siger "på alle hjul". Fire er typisk for en personbil, men formuleringen er en unødvendig og potentielt forkert indsnævring.

**Plan B:** Hovedmønstret skal have mindst 1,6 mm dybde på alle hjul og kan bedømmes ved slidindikatorer (`1.2.7.9`).

**Rettelse:** Erstat "alle fire hjul" med "samtlige hjul på den konkrete bil" og bevar kørelærerens fysiske gennemgang.

## P2 - Dækcasens ref bærer ikke ordet "ophæng"

**Placering:** Topic `1.2.7 daek-faelge-baerende-dele`; case option `b` og dens `why`; refs `1.2.7.12`, `.13`, `.15`, `.17`, `.18`.

**Problem:** Den korrekte mulighed anbefaler undersøgelse af "ophæng", men de angivne refs knytter skævt slid til dæktryk, hjul/hjulindstilling, bremser og støddæmpere. Hjulophæng står i `1.2.7.14` og `1.2.7.16`, som ikke er angivet.

**Plan B:** Skævt slid kan skyldes dæktryk, hjul eller hjulindstilling, bremser eller støddæmpere (`1.2.7.15`). Knirk, støj eller rystelser kan pege på hjulophæng (`1.2.7.14`, `1.2.7.16`).

**Rettelse:** Erstat "ophæng" med "hjulindstilling eller støddæmpere" i option og why. Alternativt tilføj kun `.14`/`.16`, hvis casens kontekst også indeholder det lyd- eller vibrationssymptom, de faktisk beskriver.

## P2 - Særlige udstyrskrav kan ikke udledes af dokumenterne alene

**Placering:** Topic `1.2.10 saerlige-koeretoejer`; card `Udstyr følger køretøjet`, sidste sætning; practical `Type og særkrav`.

**Problem:** Teksten siger, at køretøjstypen og dokumenterne afgør, hvilke krav der skal undersøges. Planpunktet siger, at særlige regler gælder; en registreringsattest dokumenterer ikke nødvendigvis alle regler om bremser, lygter, dæk, spejle, hjelm og førerudstyr.

**Plan B:** De nævnte kategori B-køretøjstyper er omfattet af særlige regler om blandt andet mål, vægt, bremser, lygter, dæk, spejle, hjelm og tilkobling (`1.2.10.1`).

**Rettelse:** Skriv, at kravene findes i reglerne for den konkrete køretøjstype, med dokumenterne som støtte hvor relevante oplysninger faktisk fremgår. Practical bør bruge kørelærerens regelgennemgang og ikke love, at dokumenterne indeholder hele svaret.

## P2 - Kamera/monitor-kortet tilføjer krav, som den angivne ref ikke bærer

**Placering:** Topic `1.2.9 sikkerhedsseler-udsyn-udstyr`; card `Spejle eller kamera`; ref `1.2.9.7`.

**Problem:** Kortet tilføjer både "godkendte" løsninger og et krav om "brugbart udsyn". Begge dele er fornuftige, men de står ikke i det nummererede Plan B-punkt, som ref-listen peger på.

**Plan B:** Spejlene kan erstattes af en kamera/monitor-løsning (`1.2.9.7`). De konkrete praktiske krav i dette underafsnit er, at spejle er korrekt indstillede, rene og hele (`1.2.9.12`).

**Rettelse:** Begræns kortet til Plan B's formulering, eller tilføj en autoritativ særkilde for godkendelse og funktionskrav. Undgå at lade `1.2.9.12` fremstå som direkte kontrolkrav for monitorer, medmindre det underbygges særskilt.

## P2 - Kildeidentiteten mangler i JSON-metadata

**Placering:** Topniveau i `garage-roadworthy.json`.

**Problem:** Filen har `checked`, `scope` og `topics`, men intet `sourceRef`. Det gør kildeproveniens sværere at kontrollere maskinelt, selv om indholdet er skrevet mod Plan B.

**Plan B:** Den kontrollerede primærkilde er Færdselsstyrelsens undervisningsplan for kategori B, version 1.1, maj 2026.

**Rettelse:** Tilføj `"sourceRef": "Plan B"` på topniveau, hvis den fælles authoring-kontrakt tillader feltet.
