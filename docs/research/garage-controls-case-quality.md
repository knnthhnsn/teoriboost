# Case-kvalitet: garage-controls

Kontrolleret 12. oktober 2026 mod Færdselsstyrelsens *Undervisningsplan for køreuddannelsen til kategori B, version 1.1, maj 2026*, trykte sider 19-21, 28 og 30.

Primær kilde: https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf

Ændringsomfanget er afgrænset til de otte `case`-objekter i `garage-controls.json`. Objectives, cards, practical og recall er ikke redigeret i denne runde.

## Før og efter

| Planpunkt | Problem før | Greb efter | Kildegrundlag |
|---|---|---|---|
| 1.1.1 | Kun den korrekte mulighed bad eleven standse op og spørge kørelæreren; distraktorerne var åbenlyst uforsigtige. | Spørgsmålet beder nu om den præcise udstyrsgruppe i 1.1.1.3. Distraktorerne bruger virkelige dele fra 1.1.1.1 og 1.1.1.4, men samler den forkerte gruppe. | Gearvælger med gearplaceringer, parkeringsbremsens betjening og rat hører til 1.1.1.3. |
| 1.1.2 | Kun den korrekte mulighed foreslog at afklare et ukendt symbol; de andre skjulte eller ignorerede advarslen. | Alle muligheder er nu faglige grupper. Kun én består udelukkende af kontrolområder fra 1.1.2.2; de andre blander målere og øvrige alarmer ind. | 1.1.2.1 er målere, 1.1.2.2 er den opregnede kontrollysgruppe, og 1.1.2.3 omfatter øvrigt display og akustiske alarmer. |
| 1.1.3 | Distraktorerne gav batteriet åbenlyst usandsynlige eneopgaver. | Alle tre muligheder forklarer en mulig energivej med samme længde. Kun én skelner korrekt mellem batteriet til forbrændingsmotorens startmotor og batteriet til elbilens drivmotor. | 1.1.3.4, 1.1.3.6 og 1.1.3.7. |
| 1.1.4 | Forkerte svar påstod permanent frakobling eller gjorde speederen til kobling; de var lette at frasortere. | Alle muligheder beskriver en komplet gearskiftesekvens. Den korrekte kræver pedalen i bund, midlertidig afbrydelse og langsom opløftning. | 1.1.4.3-1.1.4.5. |
| 1.1.5 | Casen kunne løses ved at vælge det eneste svar, der lød som forsigtig brug af lavt gear på en bakke. | Alle tre muligheder kobler lave gear, høje gear og bakgear til konkrete anvendelser. To har kun én forkert kobling. | 1.1.5.3-1.1.5.5. |
| 1.1.6 | Den korrekte mulighed var den eneste, der bad føreren stole på egne observationer; distraktorerne gav systemet blind autoritet eller kasserede alt. | Alle muligheder anerkender nu, at systemet kan vise forkert og indeholder en forsigtig handling. Kun én fastholder føreransvaret uden at give systemet eller displayet forrang. | Tavleassistentens mulige automatiske hastighedsændring i 1.1.6.3g og fejl-/ansvarsgrænsen i 1.1.6.4. |
| 1.2.8 | To distraktorer benægtede helt tydeligt låsekravet. | Alle tre muligheder beskriver reelle fejl. Spørgsmålet afgrænser sig til låsekravet, så kun bagageklappens svigt svarer på 1.2.8.3; de øvrige hører til 1.2.8.1 og 1.2.8.2. | 1.2.8.1-1.2.8.3. |
| 1.3.1 | Den korrekte mulighed var den eneste, der medbragte begge attester; distraktorerne foreslog åbenlyst kun én. | Alle tre muligheder sammenligner nu Danmark og udlandet. Kun én kombinerer begge attester med kopier i Danmark og originaler eller Motorstyrelsen-genpart i udlandet. | 1.3.1.4-1.3.1.5. |

## Kvalitetskontrol

- Alle otte cases har tre muligheder og præcis ét felt med `correct: true`.
- Mulighedernes længdespredning er 0-3 ord inden for hver case.
- Mekaniske emner bruger tre faglige forklaringer eller koblinger frem for én forsigtig handling mod to karikaturer.
- Handlingsnære ADAS-svar er alle forsigtigt formuleret; kun ansvarsoverdragelsen eller informationsprioriteten gør to svar forkerte.
- Forkerte svar under 1.1.1, 1.1.2 og 1.2.8 bruger bevidst sande oplysninger fra et andet nummereret planpunkt. Begrundelsen forklarer den præcise fejlplacering, så en sand oplysning ikke kaldes falsk.
- Der er ikke gjort en ekstra forsigtig handling som standsning ulovlig eller forkert. Cases spørger om præcis faglig forklaring, punktgruppe eller dokumentregel.

## Usikkerheder og afgrænsning

- 1.3.1-casen gengiver Plan B's generelle dokumentregel. Reelle udlandsrejser kan kræve kontrol af det enkelte lands aktuelle dokumentkrav; casen er ikke rejserådgivning.
- 1.1.6-casen tester planens ansvarspunkt. Den angiver ikke en bestemt hastighed og anbefaler ikke, at tavleassistentens automatiske ændring accepteres uden førerens vurdering.
- 1.1.1 og 1.1.2 forbereder bilspecifik udpegning og aflæsning. En korrekt casebesvarelse dokumenterer ikke den fysiske præstation i undervisningsbilen.
