# Closure: garage-controls independent review

Kontrolleret 12. oktober 2026 mod Færdselsstyrelsens *Undervisningsplan for køreuddannelsen til kategori B, version 1.1, maj 2026*, trykte sider 19-21 og 28 samt præstationskravene på side 11-12.

Primær kilde: https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf

## Lukning af de 10 findings

1. **P1 - 1.1.1.1: accepteret og rettet.** Objective, kort og practical nævner nu ratlås, tænding og elektrisk starter særskilt. Practical lader eleven udpege dem i den standsede undervisningsbil med kørelæreren.
2. **P1 - 1.1.1.5: accepteret og rettet.** Objective, kort og practical bevarer fronthjelm, motorhjelm og låge til drivmiddel. Kortet forklarer, at de to hjelm-betegnelser kan dække samme fysiske klap eller forskellige klapper i den konkrete bil.
3. **P2 - gentaget appvurderingsgrænse: forslag om ekstra advarsel afvist.** Rendereren viser altid det prominente panel "Skal vises i bilen" og giver hverken flueben, XP eller fysisk godkendelse. En gentaget certificeringsadvarsel i hver practical ville derfor være støj og skabe uens formulering. I stedet er sådanne app-sætninger fjernet fra alle practicals. De fysiske handlinger kræver fortsat udtrykkeligt undervisningsbil og kørelærer.
4. **P2 - 1.1.2.1 og 1.1.2.2: accepteret og rettet.** Påstandene om visning "først ved behov" og om kort eller vedvarende lys ved start er fjernet. Kortene holder sig nu til de officielle instrumenter og kontrolområder og henviser den bilspecifikke betydning og reaktion til gennemgangen i bilen.
5. **P2 - elbilens speeder: accepteret og rettet.** Den ikke-kildedækkede sætning om speederens styring af elbilens fremdrift er fjernet. Kortet forklarer kun elmotor, batteri og hybridkombination under `1.1.3.6`-`1.1.3.7`.
6. **P2 - 1.1.4.4: accepteret og rettet.** Objective og kort siger nu "helt i bund" både ved mulig motorstart og ved påkrævet gearskift og afgrænser stoffet til en bil med koblingspedal.
7. **P2 - 1.1.5.5: accepteret og rettet.** Objective siger nu kun, at bakgear er nødvendigt for baglæns kørsel. Den udokumenterede mekanisme om ændret kraftoverførsel er fjernet.
8. **P2 - 1.1.6.1 og 1.1.6.2: accepteret med kildeindramning.** Objectives og introduktionskort gengiver universalerne som det, undervisningsplanen beskriver. Kameraer, sensorer og radarer omtales som fælles teknologier uden at påstå, at hvert system bruger alle tre samtidigt.
9. **P1 - 1.1.6.3g: accepteret og rettet.** Objective og kort indeholder nu tavleassistentens mulige samspil med adaptiv fartpilot og den deraf mulige hastighedsændring efter tavler. Kortet følger straks op med fejlmulighed, egen observation og fortsat føreransvar fra `1.1.6.4`.
10. **P2 - 1.2.8.2: accepteret og rettet.** Objective, kort og practical bruger nu sikkerhedsfarligt omfang som kriterium. Krav om strukturel svækkelse eller placering i en bærende del er fjernet.

## Verifikation

- JSON parsing: bestået.
- Skema bevaret: 8 topics, 50 objectives og 50 unikke objective-refs.
- Referencer: ingen ukendte refs; alle objectives er dækket af mindst ét kort eller en aktivitet.
- Cards: 3-6 pr. topic; alle body-tekster er 30-65 ord.
- Cases: 3 muligheder pr. topic og præcis 1 korrekt mulighed i hver case.
- Praktisk grænse: alle `udpege`- og `aflæse og forstå`-opgaver, der kræver handling i bilen, angiver undervisningsbil og kørelærer. Advarslen mod at åbne varme eller tryksatte beholdere er bevaret.
- Der er ikke foretaget fysisk køretøjskontrol eller kørelærergodkendelse.
