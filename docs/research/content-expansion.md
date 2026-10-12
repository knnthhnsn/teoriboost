# Indholdsudvidelse: seks tidligere manglende delafsnit

Kontrolpunkt: 2026-10-12. Udvidelsen tager udgangspunkt i Færdselsstyrelsens **Undervisningsplan for kategori B, version 1.1, maj 2026** og de aktuelle primærkilder i `SOURCES`. Den løfter snapshotsbanken fra 52 til 58 sektioner og fra 71 til 83 spørgsmål. Det er bedre emnedækning, ikke dokumentation for fuld undervisning eller praktisk færdighed.

## Tilføjet dækning

| Planpunkt | Ny sektion | Nye scenarier | Afgrænsning |
|---|---|---|---|
| 2.7 | `parkering-manovre` | q-072, q-073 | Forlæns parkering ved højre kant, lav fart, orientering, parallel slutstilling og højst 20 cm. Praktisk øvelse på lukket øvelsesplads er stadig påkrævet. |
| 7.10 | `trafiksanering` | q-074, q-075 | Opholds- og legeområde, gående/børn, parkering på markerede pladser, cykelgade og fartdæmper. |
| 7.14 | `venstresving` | q-076, q-077 | Modkørende motorcykel, skjult udsyn, gående og dobbeltrettet cykelsti på den vej, der svinges ind på. |
| 7.21 | `letbane` | q-078, q-079 | Eget røde signal, tog på bundet spor samt planens alternativ med undervisning i teorilokalet, når relevant praktisk kørsel ikke kan nås i lektionen. |
| 7.22 | `sammensat-koersel` | q-080, q-081 | Fælles læringsmål, refleksion, navigation, førerstøtte og selvstændig tilpasning til trafikken. Afsluttende praktisk kørsel med kørelærer er stadig påkrævet. |
| 9.5 | `hoej-vejkant` | q-082, q-083 | Stabil retning langs kanten, forsigtig fartreduktion og kontrolleret tilbageføring. Fysisk træning hører til på godkendt køreteknisk anlæg med kørelærer. |

Hver sektion har 5 konkrete fakta. Hvert scenarie har fire selvstændige ja/nej-udsagn med mindst ét korrekt og mindst ét forkert svar. Facitpositionerne er blandet på tværs af q-072 til q-083. De afgørende vilkår står i konteksten; SVG'en er kun støtte.

## Diagrammer

`dist/diagrams.js` har 12 særskilte typer for q-072 til q-083. De viser henholdsvis lukket parkeringsområde, mål på 30 cm, E 51-område med barn, cykelgade med to cyklister og bump, to forskellige venstresving, letbanekryds, undervisningsalternativ, mål/refleksion, sen GPS-anvisning, høj vejkant på anlæg og den foreslåede offentlige selvtræning. Ingen af de 12 nye spørgsmål falder tilbage til den neutrale standardillustration.

Statisk kontrol: alle 12 diagrammer returnerer et afsluttet inline-SVG med `viewBox="0 0 640 360"`, unik `data-diagram`, spørgsmålsspecifik `aria-label`, ingen `undefined`-tekst og ingen dublerede SVG-id'er i batchen. Dette er kilde- og kodekontrol; pixelkontrol i den integrerede app og vurdering af illustrationernes læsbarhed på mobil og desktop udestår.

## Kilder og reviewgrænser

- Færdselsstyrelsen, undervisningsplan kategori B v1.1, maj 2026 (`plan-b-1-1`).
- Færdselsloven, LBK nr. 118 af 12. januar 2026 (`fl-2026`).
- Bekendtgørelse om køreuddannelser og køreprøver, nr. 731 af 20. august 2026 (`udd-731`).
- Bekendtgørelse om vejafmærkning, BEK nr. 425 af 13. april 2023 (`afmaerkning`). Kildens rettede nummer og URL er bevaret.

En kørelærer bør stadig gennemgå den samlede progression, præstationskravene og sammenhængen mellem teori og de obligatoriske praktiske øvelser. `curriculum-matrix.json` beskriver det ældre 52/71-snapshot og skal regenereres særskilt, før den bruges som aktuel dækningsrapport. Udvidelsen kan ikke i sig selv dokumentere, at eleven har gennemført delafsnit 2.7, 7.22 eller 9.5.
