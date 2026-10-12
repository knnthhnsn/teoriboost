# Faglig review af `content.js`

**Kontroldato:** 12. oktober 2026  
**Omfang:** Alle 50 scenarier er læst og kontrolleret: 50 kontekster, 200 svarmarkeringer og 50 forklaringer. Desuden er alle 150 fakta i de 10 kapitler gennemgået, altså mere end den krævede stikprøve på tre fakta pr. kapitel. `core.js` er kun læst for at fastslå prototypens bedømmelse; appen er ikke ændret.

Kontrollen er holdt op mod Færdselsstyrelsens undervisningsplan kategori B, version 1.1 (maj 2026), gældende færdselslov, gældende bekendtgørelse om køreuddannelser og køreprøver samt Færdselsstyrelsens aktuelle prøve- og uddannelsessider. Jeg fandt ingen omvendte ja/nej-markeringer blandt de øvrige scenarier, men nedenstående formuleringer, kildehenvisninger og dækningshuller skal rettes.

## Release blockers

| Prioritet | ID | Problem og betydning | Konkret rettelse | Officiel støtte |
|---|---|---|---|---|
| **Blokerer** | **q-035** | Konteksten siger, at en gående er *på vej ud i fodgængerfeltet*, men det korrekte udsagn kræver kun, at føreren er “klar til at holde tilbage”. Det kan læres som en valgfri beredskabshandling, selv om føreren skal afpasse hastigheden, undgå fare/ulempe og om nødvendigt standse. Ved udkørsel af rundkørsel skal eleven også holde tilbage for cyklisten efter samme logik som ved højresving. | Erstat udsagnet med: **“Holder tilbage for den gående og standser om nødvendigt før fodgængerfeltet.”** Behold et særskilt korrekt udsagn om orientering efter cyklisten. Forklaring: **“Ved udkørslen skal du holde tilbage for cyklisten og for gående, der krydser eller er på vej ud i feltet; stands om nødvendigt.”** | Færdselsloven § 27, stk. 6-7; plan 7.15.4, pkt. 9-10 og 14 samt 7.15.3. [Færdselsloven](https://www.retsinformation.dk/eli/lta/2026/118) · [Plan v1.1](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf) |
| **Blokerer ved påstand om officiel simulation** | **q-047, q-048 og prøve-resultatet** | Færdselsstyrelsen bekræfter 25 scenarier, fire svarmuligheder, 25 minutter og højst fem fejl. Prototypen kræver derimod et helt korrekt sæt af fire booleske svar og tæller enhver afvigelse som præcis én scenariefejl; et ubesvaret scenarie tælles også som én fejl. Den præcise aggregeringsregel er ikke udtrykkeligt dokumenteret på den aktuelle offentlige myndighedsside. Q-048 fremstiller “ubesvaret tæller som fejl” som en direkte myndighedsoplysning uden en kilde, der siger det. | Vis en fast note ved start og resultat: **“NATKØRSEL-bedømmelse: Et scenarie tæller som én app-fejl, hvis ét eller flere af de fire valg er forkerte eller mangler. Færdselsstyrelsen oplyser højst fem fejl for bestået, men den offentlige side beskriver ikke den præcise optælling af flere fejlvalg i samme scenarie.”** Skift q-048-forklaringen til app-specifik ordlyd, indtil en aktuel officiel prøvevejledning dokumenterer blanke svar og aggregering. Undgå “samme bedømmelse som den officielle prøve”. | FST oplyser 25 scenarier, fire svarmuligheder og højst fem fejl samt 25 minutter; testafsnittet beskriver bedømmelsesskema pr. billede, men ikke den fulde beregningsregel. [FST: Køreprøve](https://www.fstyr.dk/privat/koerekort/proever/koereproeve?categorizations=6bc72fbe-2bc4-4770-9212-d1fc44e7ec5e) |
| **Blokerer hvis modulreferencer vises som officielle** | **31 sektioner / q-008–q-045, se matrix nedenfor** | Mange `curriculumRef`-felter bruger brede intervaller som “modul 1-5”. Planen placerer bestemte afsnit i bestemte moduler; et interval betyder derfor fejlagtigt, at emnet indgår i alle mellemliggende moduler. Det undergraver studieplan, progression og påstanden `source-checked`. | Erstat intervallerne med eksakte lister fra planens afsnit 0.3. Brug fx “modul 1, 3 og 4”, ikke “modul 1-4”. Generér og QA-kontrollér fremover referencer fra én afsnit→modul-tabel. | Plan v1.1, afsnit 0.3, især siderne med modul 1-5. [Plan v1.1](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf) |
| **Blokerer ved påstand om fuld pensumdækning** | **q-009** | Sektionen hedder “Parkering som manøvre” og henviser til plan 7.18, men scenariet prøver kun døråbning ved en cykelsti. Ingen af de 50 scenarier prøver centrale standsnings- og parkeringsregler som 10 m ved kryds, 5 m før fodgængerfelt eller forskellen på standsning og parkering. | Erstat q-009 eller tilføj et separat scenarie med en entydig parkeringssituation. Eksempel: en bil står 6 m fra den nærmeste kant af den tværgående kørebane uden afmærket bås; korrekt svar er, at både standsning og parkering er forbudt, fordi grænsen er 10 m. Flyt døråbning til et andet relevant scenarie. Markedsfør indtil da banken som et udvalg, ikke fuld pensumdækning. | Færdselsloven §§ 28-29; plan 7.18.3-7.18.5. [Færdselsloven](https://www.retsinformation.dk/eli/lta/2026/118) · [Plan v1.1](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf) |

## Øvrige nødvendige rettelser

| Prioritet | ID | Problem og betydning | Konkret rettelse | Officiel støtte |
|---|---|---|---|---|
| **Høj** | **q-006 / fakta “start-stop”** | Fakta siger, at man giver tegn “når det er relevant”. Ved igangsætning fra vejkant, som scenariet beskriver, skal der **altid** gives tegn. Facittet har kun blink i et forkert kombinationsudsagn (“blinker og kører straks”), så eleven får aldrig lov at vælge den påbudte tegngivning som korrekt handling. | Skift faktum til: **“Ved igangsætning fra vejkant skal der altid gives tegn i god tid; tegnet giver ikke fortrinsret.”** Erstat ét korrekt udsagn med **“Giver tegn i god tid, men venter stadig på cyklisten.”** | Færdselsloven § 32, stk. 2 og 5; plan 6.2.3 samt 7.1.4-7.1.5. [Færdselsloven](https://www.retsinformation.dk/eli/lta/2026/118) · [Plan v1.1](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf) |
| **Høj** | **q-050 og fakta “nybilist”** | Facit er sikkert, men eleven lærer aldrig tallet bag “den lave grænse”, og `prove-fstyr` er ikke den relevante kilde. Den juridiske tærskel er *over* 0,20 promille i blod eller *over* 0,10 mg/l udåndingsluft i de første tre år efter førstegangserhvervelse af B, uanset alder. FST formidler det praktisk som 0,2 promille = ingen alkohol. | Skriv i forklaringen: **“I de første tre år efter dit første kategori B-kørekort straffes kørsel over 0,20 ‰ i blod eller over 0,10 mg/l udåndingsluft som spirituskørsel, uanset alder. Færdselsstyrelsens praktiske råd er ingen alkohol før kørsel.”** Tilføj den aktuelle FST-side som kilde og fjern `prove-fstyr` fra q-050. | Færdselsloven § 53, stk. 2; plan 4.4.1, pkt. 3-6; [FST: Kørekort til bil](https://www.fstyr.dk/privat/koerekort/dit-foerste-koerekort/koerekort-til-bil). |
| **Høj ved skolebrug** | **q-046 / fakta “forløb”** | Konklusionen om, at et hjemmebadge ikke dokumenterer et formelt forløb, er rigtig. Formuleringen “en øveapp kan supplere” udelader dog den nye, snævre mulighed for, at digitalt materiale kan indgå som **formelt selvstudium**, når kørelæreren beslutter, planlægger, følger op og registrerer det. Udeladelsen kan give en forkert B2B- eller skolepåstand. | Tilføj: **“Egen brug tæller ikke automatisk som undervisning. En godkendt kørelærer kan planlægge og registrere højst syv selvstudielektioner for B i egnede dele af afsnit 1, 3, 6, 9 og 10; afsnit 10 i modul 1 er undtaget. Appens badge er ikke dokumentation.”** | FST beskriver kørelærerens beslutning, maksimum syv lektioner, de tilladte afsnit og registrering i modulplanen. [FST: Moderniseret køreuddannelse](https://www.fstyr.dk/erhverv/koereskoler-og-koerelaerere/moderniseret-koereuddannelse) · [FST: gældende BEK nr. 731 af 20. august 2026](https://www.fstyr.dk/love-og-regler/bekendtgoerelse-om-koereuddannelser-og-koereproever) |
| **Mellem** | **q-003 / fakta “bremser”** | “Bremsepedalen skal føles fast og må ikke synke” er mere absolut end planen. Pedalvandringen afhænger af bilfabrikatet, og planen siger, at pedalen **normalt** ikke må synke ved konstant tryk. Selve q-003-situationen, hvor pedalen synker langsomt mod gulvet, er fortsat et korrekt faresignal. | Skift faktum til: **“Bremsepedalen må ikke kunne trædes i bund ved hårdt tryk og må normalt ikke synke, når den holdes nede med konstant tryk; pedalvandringen afhænger af bilfabrikatet.”** | Plan 1.2.3, pkt. 13-15. [Plan v1.1](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf) |
| **Mellem** | **q-045** | “Et barn” er ikke nok til at afgøre, hvilket særligt udstyr loven kræver. Planen bruger 135 cm som hovedgrænse og nævner undtagelser. Den nuværende kontekst gør “passende udstyr” cirkulært og lærer ikke tærsklen. | Angiv fx: **“Barnet er 120 cm højt, og den godkendte barnestol, der passer til barn og bil, står i en anden bil.”** Forklar, at børn under 135 cm som hovedregel skal bruge godkendt udstyr tilpasset højde og vægt, og at føreren er ansvarlig for passagerer under 15 år. | Plan 6.2.7, pkt. 2-5. [Plan v1.1](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf) |

## Korrektionsmatrix for modulhenvisninger

Nedenstående er de eksakte modulplaceringer, som de viste plan-afsnit giver. Når et scenarie blander flere plan-afsnit, skal listen vise de relevante moduler enkeltvis.

| Q-ID / sektion | Nuværende visning | Ret til |
|---|---|---|
| q-008, q-009, q-010 | modul 2-4 | **modul 2 og 4** |
| q-011, q-012, q-013 | modul 1-4 | **modul 1** |
| q-014 | modul 1-4 | **modul 1, 3 og 4** |
| q-015 | modul 1-5 | **modul 1, 2 og 5**; tilføj 6.2.7 som reference for sikring af gods |
| q-016, q-017 | modul 1-4 | **modul 1** |
| q-018, q-019, q-020 | modul 1-5 | **modul 1 og 4** |
| q-021 | modul 1-5 | **modul 2 og 5** |
| q-022 | modul 1-4 | **modul 2 og 4** |
| q-023 | modul 1-4 | **modul 2, 3 og 4** |
| q-024 | modul 1-4 | **modul 2** |
| q-025 | “grundregler · modul 1-4” | Erstat “grundregler” med den konkrete kilde **Færdselsloven § 5** for jernbaneoverkørslen; angiv moduler pr. faktisk plan-afsnit i stedet for intervallet |
| q-026 | modul 1-4 | **modul 1, 3 og 4** |
| q-027 | modul 1-5 | Tilføj 7.11 til scenariereferencen og vis **modul 1, 3 og 4** |
| q-028 | modul 1-4 | **modul 2** |
| q-029 | modul 1-4 | **modul 2, 3 og 4** |
| q-030 | modul 1-4 | **modul 1 og 2** |
| q-031, q-033 | modul 1-4 | **modul 3 og 4** |
| q-032 | modul 1-4 | **modul 1, 3 og 4** |
| q-036 | modul 3-4 | **modul 3** |
| q-037 | modul 4 | **modul 3 og 4** |
| q-038 | modul 3-4 | **modul 3** |
| q-041 | modul 2-5 | **modul 2**; tilføj kun modul 5, hvis 7.22 eller 9 faktisk føjes til indholdet |
| q-045 | modul 1-5 | **modul 2 og 4** |

Q-034, q-035, q-039, q-040 og q-042-q-044 har modulangivelser, der stemmer med de viste plan-afsnit. Q-046-q-050 mangler egentlig modulangivelse; hvis samme metadataformat skal gælde hele banken, er q-047-q-048 knyttet til modul 4 (10.2), mens q-049-q-050 spænder over modul 1 og 4 afhængigt af de anførte underafsnit.

## QA-krav efter rettelse

1. Kør en maskinel kontrol af, at alle 50 spørgsmål fortsat har præcis fire booleske udsagn, mindst ét korrekt udsagn og kilde-ID'er, der findes i `SOURCES`.
2. Tilføj en indholdstest, der sammenholder hvert plan-afsnit i `curriculumRef` med en fast afsnit→modul-tabel fra planens 0.3. Testen skal afvise brede intervaller, hvis et mellemliggende modul ikke indeholder afsnittet.
3. Lad en fagperson genlæse q-006, q-009, q-035, q-045-q-050 i den faktiske UI, så rettet tekst, facitmarkering og resultatforklaring ses samlet.
4. Gør prøvebedømmelsesnoten synlig både før øveprøven og på resultatet. Et link i en kildeliste alene er ikke tilstrækkeligt til at afgrænse en påstand om officiel lighed.
5. Gentag kildetjek ved ændring af undervisningsplan, Færdselsloven, BEK nr. 731 eller FST's prøveside; `checked: 2026-10-12` er dokumentation for denne kontrol, ikke fremtidig gyldighed.

## Afgrænsning

Dette er en faglig kilde- og facitkontrol af tekstbanken, ikke en officiel godkendelse fra Færdselsstyrelsen og ikke en browserprøve af illustrationernes overensstemmelse med konteksten. De aktuelle offentlige kilder dokumenterer ikke den fulde interne fejlberegning i myndighedens prøve; derfor kan prototypens scenarieoptælling kun beskrives som NATKØRSEL-bedømmelse, indtil præcis officiel dokumentation foreligger.
