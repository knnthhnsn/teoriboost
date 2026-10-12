# Kilde- og kvalitetsreview: garage-roadworthy

Kontrolleret 12. oktober 2026 mod Færdselsstyrelsens officielle [Undervisningsplan for kategori B, version 1.1, maj 2026](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf). De nummererede delmål er læst på planens side 22-29, med afsnitsrammen på side 21-22 og det efterfølgende skift til 1.3 på side 29-30. Præstationskravene er kontrolleret på side 11-12. Den eksisterende `vehicle-detailed-gap-audit.md` er kun brugt som orientering; den officielle plan er facit for tekst, tal og præstationsverber.

## Leverancens omfang

`garage-roadworthy.json` dækker præcis disse ni underafsnit: 1.2.1-1.2.7, 1.2.9 og 1.2.10. Afsnit 1.2.8 er bevidst ikke med, fordi en anden worker ejer det. Filen indeholder ni unikke topics, 133 nummererede objectives og 48 læringskort.

| Underafsnit | Nummererede mål | Præstationsgrupper verificeret i planen |
|---|---:|---|
| 1.2.1 | 4 | 1-4 `angive` |
| 1.2.2 | 12 | 1-4 `viden`; 5-7 `angive`; 8-9 `kontrollere`; 10-12 `angive` |
| 1.2.3 | 23 | 1-8 `viden`; 9-10 `angive`; 11-12 `viden`; 13-15 `kontrollere`; 16-23 `angive` |
| 1.2.4 | 20 | 1-10 `angive`; 11-13 `viden`; 14-19 `kontrollere`; 20 `angive` |
| 1.2.5 | 13 | 1-2 `kontrollere`; 3-9 `angive`; 10-12 `viden`; 13 `angive` |
| 1.2.6 | 29 | 1-17 `angive`; 18-26 `viden`; 27-29 `angive` |
| 1.2.7 | 18 | 1-4 `angive`; 5-8 `viden`; 9-11 `kontrollere`; 12-18 `angive` |
| 1.2.9 | 13 | 1-9 `angive`; 10-12 `kontrollere`; 13 `viden` |
| 1.2.10 | 1 | 1 `viden` |

`viden` er den aftalte JSON-værdi for planens formulering "have kendskab til". `angive` samler planens varianter "angive indholdet", "angive årsager" og "angive betydningen". Ingen af de ni underafsnit har præstationskravene `udpege` eller `aflæse og forstå`; de værdier er derfor ikke opfundet i objectives.

## Verificerede tal og afgrænsninger

- 1.2.4 beholder de obligatoriske antal lygter og reflekser, inklusive normalt tre stoplygter, hvor ældre biler kan nøjes med to, mindst én nummerpladelygte og de ikke-trekantede bagreflekser.
- Lyskravene er gengivet som mindst 100 meter for fjernlys, mindst 30 meter for nærlys uden blænding, mindst 300 meters synlighed for positionslys og mindst 20 meters læsbarhed for bageste nummerplade. Kravet til nærlysets overkant er 1 centimeter fald pr. meter. Særkravet for biler over 6 meter er bevaret.
- Bremsekontrollen beholder forskellen mellem bilens normale pedalvandring og fejltegnene: pedalen må ikke gå i bund ved hårdt tryk, normalt ikke synke ved konstant tryk, og væsken skal stå mellem min- og maxmærket eller have slukket kontrollampe.
- ABS er beskrevet som et system, der modvirker blokering. En lampe, som ikke slukker kort efter igangsætning, betyder, at kun kørsel til nærmeste værksted er tilladt. One-pedal er kun beskrevet for elbiler og erstatter ikke bremsepedalen, når regenerationen ikke er tilstrækkelig.
- Olie- og servovæskekontrol bevarer planens alternative bilspecifikke metoder: fysisk min/max-aflæsning, instrument/kontrollampe eller instruktionsbogens anvisning. Der er derfor ikke skrevet én universel motorrumsprocedure.
- Energiangivelserne 5-10 procent og i mange tilfælde op til 25 procent brændstofbesparelse er beholdt med planens kvalificerende ord. De er ikke gjort til en garanti for en bestemt tur eller bil.
- Dækkenes minimum er 1,6 millimeter i hovedmønstret på alle hjul. Pigdækperioden er 1. november til 15. april, og pigdæk skal sidde på alle hjul, også på en eventuel tilkoblet påhængsvogn.
- M+S sammen med bjerg- og snefnugsymbol er gengivet som vinterdæk. M+S alene er forsigtigt formuleret som noget, der kan være et helårsdæk, svarende til planens ordvalg.
- 1.2.10 er ét nummereret mål. Listen over køretøjstyper og emner er derfor samlet under ref `1.2.10.1` og ikke opdelt i opdigtede underreferencer.

## Praktiske præstationskrav

Alle mål med `kontrollere` er gjort til fysiske trin med den konkrete bil og en kørelærer: ratslør og servosystem, bremsepedal og bremsevæske, lygter/reflekser/horn, motorolie og kølervæske, dæk/fælge/omløbsretning samt sprinklervæske/viskere/spejle. Teksten siger udtrykkeligt, at appen kan forberede rækkefølgen, men ikke godkende eller certificere en fysisk præstation.

Cases tester viden og valg. De hævder ikke, at et korrekt svar dokumenterer en bestået fysisk kontrol. Hver case har tre plausible muligheder, præcis ét korrekt svar og en begrundelse med objective-referencer. ABS, one-pedal, servovæske, oliekontrol, regeneration og kamera/monitor er skrevet med biltype- eller udstyrsforbehold.

## Maskinel validering

JSON-filen er indlæst med PowerShells JSON-parser med dybde 100. Følgende kontroller er udført:

- `topics.length === 9`, og alle topic-id'er er unikke.
- Objective-antallet er 133 og svarer til 4 + 12 + 23 + 20 + 13 + 29 + 18 + 13 + 1.
- Alle refs i cards, practical, case og recall findes i det pågældende topics objectives.
- Hvert objective-ref bruges mindst ét sted i læringsindholdet.
- Hvert topic har 3-10 cards; samlet 48 cards.
- Hver card-body er 30-65 ord.
- Hver case har tre muligheder og præcis én med `correct: true`.

## Usikkerheder og redaktionelle valg

Der er ingen uafklarede kildehuller i de 133 delmål. Følgende er bevidste redaktionelle valg, ikke nye regler:

- Planens underlister 1.2.4.2 a-h og 1.2.4.11 a er holdt under deres nummererede mål, fordi opgaven kræver alle nummererede mål og ikke kunstige referencer til bogstavpunkter.
- Planen gentager skævtrækning og ujævn bremsning i 1.2.3.16-20 med lidt forskellige forklaringsniveauer. Alle fem refs er bevaret, mens kortteksten grupperer dem naturligt.
- Fugt efter bilvask kan ifølge planen forsvinde efter kortvarig bremsning. Indholdet bruger ikke dette som en generel tilladelse til at ignorere vedvarende skævtrækning.
- Den praktiske kølervæsketekst tilføjer en almindelig sikkerhedsformulering om ikke selv at åbne et varmt system. Selve målkravet er fortsat fabrikantens/instruktionsbogens metode; der er ikke tilføjet et nyt prøvekrav.
- Udtrykket "ældre biler kan nøjes med to stoplygter" er bevaret i kortet som "normalt tre stoplys" og i dette review. Det er ikke gjort til en selvstændig objective-ref, fordi kilden placerer det i 1.2.4.2.

Reviewet dokumenterer kilde- og strukturkontrol af forfattet læringsindhold. Det er ikke browser-QA, fysisk køretøjskontrol eller kørelærergodkendelse.
