# Duolingo-principper anvendt i NATKØRSEL

12. oktober 2026. Denne iteration ændrer læringsforløbet i den eksisterende private app. Kildegrundlaget, de 83 spørgsmåls ordlyd/facit, 81 situationsbilleder, 58 forfattede cases og den valgte danske Jeppe-neuralstemme er bevaret.

## Første principper

Eleven skal opdage en relevant betingelse, vælge en lovlig handling, forstå begrundelsen og kunne hente reglen frem senere. En færdig skærm, flere point eller en lang streak dokumenterer ikke det samme. Duolingos offentlige produktbeskrivelser og forskningspapirer er derfor brugt som mekaniske idéer, ikke som bevis for køreteoretisk læring.

| Princip | Implementeret adfærd |
|---|---|
| Mindre startbesvær | Forsiden anbefaler én konkret regel med en begrundelse. Alle 10 emner findes i en navngivet vælger; alle 58 lektioner er åbne. |
| Synlig rute | Regelknuder viser faktisk gennemført guidet træning, fejl der skal repareres, og senere gentagelse. Det tidligere 3D-spil er tilgængeligt som Beslutningskørsel. |
| Små læringsbidder | En første lektion følger Forstå → Vælg → Brug → Genkald → Prøv igen. Tre korte forfattede kort fører til en konkret billedsituation. Ingen belønning for hurtige svar. |
| Retrieval før hjælp | En gentagelse starter med fire vurderinger før regelkortene vises. Derefter følger kortene, en forfattet case, egen forklaring og et sidste spørgsmål. Kort markeres aldrig automatisk læst. |
| Konkret feedback | Efter aflevering vises den forfattede forklaring og facit til hver vurdering. Fejl kan repareres uden hjerter, betaling eller låste emner. |
| Variation | Et andet spørgsmål fra samme regel anvendes når banken har det. Ellers mærkes gentagelsen tydeligt som samme situation i ny rækkefølge og ét prøvebillede; dette tæller ikke som dokumenteret transfer til en uset scene. |
| Gentagelse med afstand | En repareret regel prioriteres til senere genkaldelse efter en 20-minutters startheuristik. Korrekte vurderinger kan give længere intervaller. Det er ikke et kalibreret Half-Life Regression-system. |
| En holdbar øverytme | Frivilligt dagsmål på 1/2/3 gennemførte forløb; Københavnsk kalender, streak og tre lokale øveopgaver. Gentagelse af samme emne samme dag øger ikke dagsmålets tæller igen. |
| Følelser og bevægelse | Originale alpha-maskotter og forfattede jokes optræder efter svar eller som dekor. Rolig tilstand skjuler jokes; bevægelse kan slås fra, og enhedens reduceret-bevægelse-valg har forrang. |
| Billedet skal forstås korrekt | På mobil vises den afgørende forfattede betingelse før billedet. Billedviser og dansk oplæsning er bevaret; åbning af større billede standser stemmen. |
| Ærlig fremgang | En ubesvaret eller delvist besvaret prøveopgave er neutral øveinformation og sletter ikke tidligere korrekt genkaldelse. Gamle falske resultater uden vurderingsproveniens bliver ikke opfundne misforståelser. |
| Lokal kontinuitet | Kort, svar, kladder og feedback gemmes pr. emne. Canonical replay afviser ændret indhold eller umulige trin uden at nulstille øvrig fremgang. Nyere forløb kan ikke overskrives af en gammel fanes senere gemning. |

## Hvad er faktisk undersøgt?

Primære Duolingo-kilder, datoer og begrænsninger står i [forskningsnotatet](duolingo-evidence.md). Den offentlige startside og sprogvalg blev observeret direkte. Den videre gæstevelkomst fejlede med `Failed to fetch` i browseren; derfor påstås ingen gennemført Duolingo-lektion, privat algoritmeadgang eller fuld reverse engineering af den aktuelle mobilapp.

Claude modtog to faktiske skærmbilleder fra den lokale app. Det førte til betingelse-før-billede på mobil, en tydelig emnevælger og større hjælpetekst. En omordnet gentagelse kaldes nu Prøv igen og er mærket med sin begrænsede billedvariation. Originalartifacten i Claude er bevaret.

Jev klassificerede én tekstlig beskrivelse via eksisterende almindelig Playground-adgang. [Den præcise forespørgsel og modelrespons](research/jev-journey-triage.json) er gemt. Jev så nul billeder, udførte nul apphandlinger og repræsenterer nul virkelige elever. Responsen peger på varierede opgaver og rigtige læringstests som næste produktprioritet; procentscorer er ikke menneskelige læringsresultater eller præferencebevis.

## Teknisk og visuel kontrol

- 76/76 automatiske checks passer, inklusive alle 58 live lektioners egne cases, checkpoints, serialisering og afslutning.
- Buildkontrollen verificerer 12 kilder, 10 kapitler, 58 sektioner, 83 spørgsmål, 17 garageområder og 1.235 lokale stemmefiler.
- Faktisk lokal browser: komplet første lektion med bevidst fejl og reparation; læst kort, valg, kladde og korrekt checkpoint-feedback efter reload; korrekt afslutning; komplet senere gentagelse med vurdering før kort; browserens tilbagefunktion; senere-gentagelsesopgave; dagsmål uden genafspilningsbonus.
- Faktisk 320/390-pixelskontrol: ingen vandret overflow i den rettede visning, alle ti emner tilgængelige, centrale kontroller mindst 44 px; betingelse står før billede; rolig tilstand skjuler maskotter; bevægelse fra stopper ruteanimationer.
- Dansk neural lyd afspillet i det nye forløb; billedviseren standser lyd og returnerer til opgaven ved Escape.

Skærmbilleder og den detaljerede kontroljournal ligger lokalt under `evidence/`. Det er afgrænset browser- og kildeverifikation, ikke en undersøgelse af virkelige elevers læring. Udgivet versionsidentitet og efterfølgende hosted kontrol gemmes separat i samme journal.

## Næste læringsbevis

Før appen kan kaldes komplet eller markedsledende, mangler fuld mapping af hele undervisningsplanen, review af tekst/billeder ved en godkendt kørelærer samt undersøgelser med rigtige teens og voksne. Disse er ikke gennemført af denne iteration.

En lille pilot bør sammenligne første korrekte vurdering, begrundelse og tid til forståelse; senere blandet genkaldelse efter mindst en dag; valg i en ændret, hidtil uset billedsituation; og oplevet humor/distraktion. Flere varierede originale billedopgaver er særligt nødvendige i emner med kun ét prøvebillede. XP, streak og gennemførelsesrate må rapporteres som engagement, adskilt fra lærings- og sikkerhedsresultater.
