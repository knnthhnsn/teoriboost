# Kvalitetsgennemgang af cases i `garage-roadworthy.json`

Kontrolleret: 2026-10-12  
Primærkilde: Færdselsstyrelsens *Undervisningsplan for køreuddannelsen til kategori B*, version 1.1, maj 2026, punkt 1.2.1-1.2.7 og 1.2.9-1.2.10, side 22-29.  
Kilde: <https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf>

## Afgrænsning

Kun de ni `case`-objekter er ændret. `objectives`, `cards`, `practical`, `recall` og øvrige topic-felter er bevaret. Formålet var at fjerne den genvej, hvor eleven kunne vælge det eneste tydeligt forsigtige svar uden at kende undervisningsplanens præcise krav.

## Før og efter

| Topic | Problem før | Afgrænset forbedring | Kontrolleret mod |
|---|---|---|---|
| 1.2.1 | Handlingsvalget kunne afgøres ved at undgå de åbenlyst uforsvarlige muligheder. | Casen spørger nu til planens præcise fordeling: ejer/registreret bruger svarer for lovlig stand, føreren for sikker stand og forsvarlig tilkobling. Distraktorerne flytter ansvaret på plausible, men forkerte måder. | 1.2.1.1-1.2.1.3 |
| 1.2.2 | Det korrekte svar var det eneste forsigtige svar om at standse, så forsigtighed kunne erstatte viden om styreapparatet. | Casen spørger nu konkret til hjulenes forsinkede reaktion med aktiveret servo. Det korrekte svar kobler tegnet til muligt slør og kravet om eftersyn ved væsentligt ratslør. | 1.2.2.7-1.2.2.12 |
| 1.2.3 | De forkerte muligheder var risikable fortsættelser, mens sikker standsning let blev den moralske genvej. | Casen spørger nu om den kørsel, planen tillader ved en ABS-lampe, der ikke slukker: kun til nærmeste værksted. En frivillig parkering kaldes udtrykkeligt lovlig; den gøres ikke til et forkert sikkerhedsvalg. | 1.2.3.4 og 1.2.3.22 |
| 1.2.4 | Handlingsalternativerne kunne sorteres efter almindelig forsigtighed frem for lyskravet. | Casen tester nu den bestemte diagnoseoplysning: væsentligt hurtigere blink er normalt tegn på, at en eller flere blinklygter ikke virker. | 1.2.4.16-1.2.4.20 |
| 1.2.5 | Reparation var let at vælge over åbenlyst uvedkommende handlinger. | Casen tester nu de to kildespecifikke symptomkoblinger: stigende omdrejninger uden tilsvarende fart peger på koblingsfejl, og vanskeligt gearskifte med kraftige mislyde peger på gear eller kobling. | 1.2.5.7-1.2.5.8 |
| 1.2.6 | Den rigtige fremgangsmåde stod over for karikeret energispild og kunne genkendes uden alle delkrav. | Casen samler fem konkrete råd for en relevant manuelt gearet forbrændingsbil. Distraktorerne indeholder også korrekte dele, men bryder bestemte krav om tomgang, gear, udkobling eller tidlig farttilpasning. | 1.2.6.1-1.2.6.2, 1.2.6.7-1.2.6.9 og 1.2.6.16 |
| 1.2.7 | Umiddelbar afhjælpning var det eneste klart sikre valg. | Casen spørger nu, hvad lovlig mønsterdybde betyder sammen med skævslid og sidevindsfølsomhed. Det korrekte svar kræver viden om fejltegn, mulig forkert dæktryk og umiddelbar afhjælpning. | 1.2.7.3, 1.2.7.9, 1.2.7.12-1.2.7.18 |
| 1.2.9 | Det var nok at vælge rengøring og påfyldning frem for tydeligt uforsvarlige alternativer. | Casen skelner nu mellem, at viskerne blot bevæger sig, og at de faktisk kan holde ruden ren. Den tester samtidig tilstrækkelig sprinklervæske og planens konkrete oplysning om indvendig film i modlys. | 1.2.9.4-1.2.9.6, 1.2.9.9-1.2.9.11 og 1.2.9.13 |
| 1.2.10 | Et generelt svar om at undersøge reglerne var let at foretrække frem for brede antagelser. | Casen spørger nu til planens udtrykkelige rækkevidde: et kategori B-køretøj som en ATV kan være omfattet af særregler om blandt andet mål, vægt, bremser, lygter, dæk, spejle og styrthjelm. | 1.2.10.1 |

## Kildepræcision og usikkerheder

- Modaliteten er bevaret. Planens formuleringer som „kan være tegn på”, ”tyder på” og ”er normalt tegn på” er ikke omskrevet til sikre diagnoser.
- ABS-casen tester den adgang til fortsat kørsel, som planen angiver. Den påstår ikke, at eleven er forpligtet til at køre bilen, eller at det er forkert at lade den stå.
- Energisparecasen er udtrykkeligt afgrænset til en relevant manuelt gearet forbrændingsbil. Rådene overføres derfor ikke til automatgear eller elbil.
- Punkt 1.2.10.1 siger, at særregler *kan* gælde. Casen hævder ikke, at samtlige oplistede regler gælder for enhver ATV.
- Flytning af `lead` i visningen og mobilrendering ligger hos root og er ikke afprøvet i denne afgrænsede indholdsændring.

## Validering

- JSON parser uden fejl.
- 9 topics, 133 objectives og 49 cards er bevaret.
- Alle ni cases har præcis tre svar og præcis ét korrekt svar.
- Alle case-referencer findes blandt JSON-filens objectives.
- Svarmulighederne er længdebalancerede inden for hver case: forskellen mellem korteste og længste svar er 1-5 ord.
- Projektionen af alt indhold uden `case` blev sammenlignet før og efter ændringen og var uændret; redigeringen omfattede kun de ni `case`-blokke.
