# NATKØRSEL — indholdsdækning og kildegrænser

**Status:** 12. oktober 2026

**Grundlag:** Færdselsstyrelsens undervisningsplan for kategori B, version 1.1 (maj 2026), gældende færdselslov og de aktuelle myndighedssider om køreuddannelse, kørekort og teoriprøve.

**Leverance:** `outputs/natkoersel/dist/content.js`

## Bankens omfang

- 10 kapitler, der tilsammen berører undervisningsplanens 10 hovedafsnit.
- 52 sektioner og 160 korte fakta.
- 71 originale trafikale situationer med præcis fire ja/nej-vurderinger i hver, i alt 284 udsagn.
- Hvert spørgsmål har mindst ét korrekt og mindst ét forkert udsagn, en regelbegrundelse, kilde-ID'er og en særskilt humorlinje efter svaret.
- Alle afgørende vilkår står i teksten. `scene` er støtte til en illustration og er ikke en del af facit.
- 21 nye situationer uddyber især parkering, tavler og signaler. Ni af dem giver aktiv genkaldelse af kendte regler i en ny kontekst, blandt andet STOP, vigepligt, cyklister, fodgængere, lys og 17-årsreglen.

## Dækning mod plan v1.1

| Planens hovedafsnit | NATKØRSEL-kapitel | Sektioner | Spørgsmål | Dækket i denne bank |
|---|---|---:|---:|---|
| 1. Køretøjets indretning, udstyr, betjening og dokumenter | Bilen før turen | 5 | 5 | Indstilling, assistenter, styring/bremser, lys/dæk, motor/miljø/dokumenter |
| 2. Manøvrer på lukket øvelsesplads | Grundmanøvrer | 5 | 5 | Start/stop, rat og blik, bakning, døråbning og vending |
| 3. Køretøjers manøvreegenskaber | Køretøjer omkring dig | 5 | 5 | Blindzoner, tunge køretøjer, tohjulede, cykler/små køretøjer, belæsning/påhæng |
| 4. Trafikantadfærd | Mennesket bag rattet | 5 | 5 | Reaktion, distraktion, træthed/medicin, alkohol/stoffer, holdning/risikoblindhed |
| 5. Vejforhold | Vej, vejr og udsyn | 5 | 6 | Glat vej, dårlig sigt og lys, kurver/bakker, risikomiljøer, tunnel/jernbane |
| 6. Grundregler for færdsel | Grundregler og anvisninger | 6 | 10 | Anvisningshierarki, hensyn, signaler, udrykning, uheld samt B 11, B 13, C 55, D 15 og gul vejarbejdsafmærkning |
| 7. Manøvrer på vej | Kryds og sårbare trafikanter + Manøvrer på vej | 11 | 23 | Vigepligt, STOP, sving, rundkørsel, fart, bane, møde, overhaling, motorvej og syv parkeringscases |
| 8. Særlige risikoforhold | Risiko, miljø og køreteknik + Mennesket bag rattet | 3 tværgående | 3 direkte + tværgående | Fart, sele, rusmidler, adfærd og ansvar |
| 9. Manøvrer på køreteknisk anlæg | Risiko, miljø og køreteknik | 3 direkte | 3 | Bevægelsesenergi, vejgreb, bremsning, undvigelse og udskridning |
| 10. Regler og retningslinjer for kørekort | Kørekort og prøve | 5 | 7 | Modulforløb, prøveformat, NATKØRSEL-bedømmelse, 17-årige og nybilistregler |

Tabellen viser tematisk dækning. Den er ikke en påstand om, at alle officielle delmål, alle tavler eller alle praktiske færdigheder er dækket.

## Modulreferencer

`curriculumRef` bruger eksakte modullister fra planens afsnit 0.3. Et emne, der fx forekommer i modul 1, 3 og 4, vises som netop disse tre moduler og ikke som et sammenhængende interval.

| Modul | Indhold, som banken berører | Kildegrænse |
|---|---|---|
| 1. Grundlæggende trafikforståelse | Manøvreegenskaber, adfærd, vejforhold og udvalgte grundregler | Udvalgte cases, ikke en komplet delmålsbank |
| 2. Forberedende teori og kørsel | Bilens udstyr, betjening, vejforhold og grundmanøvrer | Tekst kan ikke dokumentere praktisk beherskelse på øvelsesplads |
| 3. Grundlæggende kørsel på vej | Start/stop, placering, fart, møde og kryds i mindre krævende miljøer | Scenerne har endnu ikke flere visuelle sværhedsgrader |
| 4. Udvidet kørsel på vej | Bane/flet, overhaling, parkering, motorvej, mørke, tunnel, risiko og prøve | Letbane og flere kombinationer af tavler/afmærkning er kun summarisk dækket |
| 5. Afsluttende kørsel og køreteknik | Vejgreb, energi, bremsning, undvigelse og udskridning | Forklarende teori kan ikke erstatte træning på køreteknisk anlæg |

## Kilde- og reviewgrænser

1. `source-checked` betyder kontrol mod de angivne primære kilder på kontroldatoen. Det betyder ikke myndighedsgodkendelse eller kørelærerens samlede vurdering af tekst og billede.
2. `curriculumRef` peger på det officielle afsnit og dets modulplacering. Det er ikke en linje-for-linje-attest for samtlige præstationskrav i den 151 sider lange plan.
3. Parkeringsbanken dækker nu 10 m ved kryds, 5 m før fodgængerfelt, forskellen mellem standsning og parkering, aktiv af-/påstigning, tidsbegrænset parkering, handicapbås samt fortov/cykelsti. Andre afstande, lokale bekendtgørelser, private parkeringsvilkår og alle kombinationer af undertavler er ikke fuldt dækket.
4. Tavlebanken har cases for B 11, B 13, C 55 og D 15 samt midlertidig gul afmærkning. Den er ikke et komplet tavlekatalog.
5. Sammenfletning og vognbaneskift kræver billeder, hvor afmærkningen entydigt viser, hvilken regel der gælder.
6. Letbane, tunnelberedskab, førstehjælp, påhængsvægte, detaljerede lygtekrav, medicin og helbred kræver mere faglig dybde end denne bank giver.
7. Billeder kan ændre facit, hvis de introducerer en ekstra tavle, vejstribe, trafikant eller afstand. Den endelige tekst og den konkrete illustration skal derfor læses som én samlet situation ved fagligt review.
8. Regler kan ændres efter kontroldatoen. `checked: '2026-10-12'` dokumenterer kontrollen denne dato og er ikke bevis for fremtidig gyldighed.

## NATKØRSEL-bedømmelse

Færdselsstyrelsen oplyser 25 situationer, fire svarmuligheder, 25 minutter og højst fem fejl. De offentlige sider beskriver ikke den præcise aggregering af flere forkerte eller manglende valg i samme situation.

NATKØRSEL bruger derfor sin egen tydeligt navngivne øvebedømmelse: Et scenarie tæller som én app-fejl, hvis ét eller flere af de fire valg er forkerte eller mangler. Denne metode må ikke beskrives som dokumenteret identisk med myndighedens interne optælling.

## Billedforudsætninger

- Trafikretning, vognbaner, vejstriber, tavler og signaler skal være læselige og indbyrdes forenelige.
- Placering, afstand, udsyn, lys og vejr skal støtte teksten uden at tilføje et nyt afgørende vilkår.
- Parkeringsscener skal vise den beskrevne afstand, fraværet eller tilstedeværelsen af en bås og den præcise tavle/undertavle.
- B 11 og B 13 må ikke forveksles; D 15-pilen og midlertidig gul afmærkning skal være tydelig.
- Cykler, motorcykler, gående og børn skal være synlige, når de nævnes, og situationen skal have dækkende tekstalternativ.
- `night`, `weather` og `emergency` må ikke kommunikere afgørende information alene med farve, blink eller lyd.
- Illustrationer skal være egne aktiver. Officielle prøvebilleder og prøvebankformuleringer er ikke genbrugt.

## Kilder kontrolleret 12.10.2026

- Færdselsstyrelsen, *Undervisningsplan for kategori B, version 1.1, maj 2026*.
- Retsinformation, færdselsloven LBK nr. 118 af 12.01.2026.
- Retsinformation, BEK nr. 731 af 20.08.2026 om køreuddannelser og køreprøver.
- Retsinformation, BEK nr. 718 af 19.08.2026 (kørekortbekendtgørelsen).
- Retsinformation, bekendtgørelse om vejafmærkning, BEK nr. 2511 af 09.12.2021.
- Retsinformation, BEK nr. 99 af 30.01.2024 om parkeringskort.
- Færdselsstyrelsens aktuelle sider om køreprøven, digitale teoriprøver, kørekort til bil, 17-årige og moderniseret køreuddannelse.
