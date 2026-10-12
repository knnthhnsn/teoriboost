# Kildegennemgang: garage-controls

Kontrolleret 12. oktober 2026 mod **Plan B**: Færdselsstyrelsens *Undervisningsplan for køreuddannelsen til kategori B (almindelig bil), version 1.1, maj 2026*.

Primær kilde: https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf

## Verificeret i kilden

- Præstationskravenes betydning blev læst og visuelt kontrolleret på de trykte sider 11-12. `udpege`, `aflæse og forstå` og `kontrollere` er praktiske krav. `angive` er et udvælgelses- og forklaringskrav, mens planens formulering `have kendskab til` er gemt som `viden` i JSON-filen.
- Alle mål i 1.1.1-1.1.6 blev læst og visuelt kontrolleret på de trykte sider 19-21. Det omfatter 1.1.6.3 a-h som otte særskilte mål og 1.1.6.6 som bilspecifik aflæsning af samtlige assistentsystemer i undervisnings- og prøvebilen.
- Alle tre mål i 1.2.8 blev læst og visuelt kontrolleret på trykt side 28.
- Alle seks mål i 1.3.1 blev læst og visuelt kontrolleret på trykt side 30. Punkt 1-5 er gemt som `angive`; punkt 6 om elkøretøjers ofte lavere lasteevne er gemt som `viden`.
- Den eksisterende `vehicle-detailed-gap-audit.md` blev kun brugt som orientering om kendte dækningshuller. Selve målteksten og præstationskravene blev verificeret direkte i den officielle PDF.

## Dækning i leverancen

JSON-filen har otte emner og 50 unikke objective-referencer:

| Underafsnit | Antal mål | Præstationskrav i data |
|---|---:|---|
| 1.1.1 | 6 | udpege |
| 1.1.2 | 3 | aflæse og forstå |
| 1.1.3 | 7 | viden |
| 1.1.4 | 7 | viden |
| 1.1.5 | 5 | viden |
| 1.1.6 | 13 | viden; aflæse og forstå |
| 1.2.8 | 3 | viden |
| 1.3.1 | 6 | angive; viden |

Alle mål er parafraseret kort og er knyttet til mindst ét kort eller en aktivitet. Hvert emne har tre svarmuligheder i sin case og præcis ét korrekt svar. Kortteksterne er kontrolleret til 30-65 ord.

## Praktisk grænse

Udpegning i 1.1.1, aflæsning i 1.1.2 og bilspecifik aflæsning i 1.1.6.6 er omsat til øvelser, der udtrykkeligt kræver undervisningsbilen og kørelæreren. Appen kan forberede rækkefølge, begreber og reaktioner, men den kan ikke godkende eller dokumentere elevens fysiske præstation.

Cases i disse emner spørger derfor til sikker handling og forståelse. De påstår ikke, at eleven har bestået en virkelig udpegning eller aflæsning.

## Biltyper og afgrænsninger

- Manuel bil, automatgear, elbil og hybrid er skilt ad, hvor planen gør forskel. Koblingspedal og startmotor er ikke fremstillet som universelle for alle biltyper.
- 1.1.1 beskriver kun væskepåfyldninger, der faktisk findes i den konkrete bil; især elbilens opbygning kan afvige.
- 1.3.1 gengiver ikke opdigtede vægttal. Den konkrete registreringsattest er afgørende.
- Der er ikke indført fartgrænser, tekniske tolerancer eller andre lovtal fra hukommelsen.

## Usikkerheder og kontrollens rækkevidde

Der er ingen uløste huller i de 50 krævede mål. Førerassistentsystemers navne, symboler og funktioner varierer mellem bilmodeller; derfor kan kun kørelæreren gennemgå den faktiske undervisnings- og prøvebil. Dokumentet er en kilde- og strukturkontrol, ikke fysisk køretøjskontrol, kørelærergodkendelse eller dokumentation for praktisk prøvefærdighed.

## Maskinel validering

- JSON parsing: bestået.
- Emner: 8; unikke id'er: 8; scope-punkter: 8.
- Objectives: 50; unikke refs: 50.
- Alle refs på kort, aktiviteter, cases og recall matcher et objective.
- Alle objectives er dækket af mindst ét kort eller en aktivitet.
- Cases: 3 muligheder pr. emne og præcis 1 korrekt mulighed pr. case.
- Kort: 3-6 pr. emne; alle body-tekster er 30-65 ord.
