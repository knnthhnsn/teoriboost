# Review af lesson-depth-a

## Omfang

- Dækker præcis de 26 aktuelle sektioner i kapitlerne `bil`, `grundmanoevrer`, `koeretoejer`, `foereren` og `vej-vejr`.
- Hver sektion har én indledning, tre mikrokort, én ny anvendelsescase, ét forståelsesspørgsmål og enten en praktisk afgrænsning eller `null`.
- Teksten forklarer sammenhængen mellem observation, risiko og handling. Den markerer ikke pensum, undervisning eller praktisk kompetence som gennemført.

## Kontrollerede primærkilder

- Færdselsstyrelsen, *Undervisningsplan for køreuddannelsen til almindelig bil (kategori B), version 1.1, maj 2026*: https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf
- Retsinformation, *Bekendtgørelse af færdselsloven*, LBK nr. 118 af 12. januar 2026: https://www.retsinformation.dk/eli/lta/2026/118
- Numeriske udsagn er begrænset til planens kontrollerede krav om mindst 1,6 mm dækmønster og parkeringsøvelsens højst 20 cm fra kanten. Lovhenvisninger er kontrolleret mod den aktuelle lovtekst, herunder §§ 3-5, 18, 23, 26-27, 32-33, 41, 46, 53-55 a og 82.

## Afgrænsning og tvivl

- Køretøjsspecifikke symboler, førerassistenter, kobling af trailer og kontrolprocedurer varierer. De skal sammenholdes med det konkrete køretøjs vejledning og demonstreres af kørelærer.
- Mikrolektionerne giver ingen individuel medicinsk vurdering. Afsnittene om træthed, medicin, alkohol og stoffer holder sig til undervisningsplanens risikoforståelse og Færdselslovens krav om fuldt betryggende kørsel.
- Praktiske manøvrer, mørkekørsel og køretekniske færdigheder kræver fortsat fysisk undervisning og observation; tekstens cases er transferøvelser, ikke dokumentation for udført træning.

## Maskinel kontrol

JSON er valideret mod den aktuelle `dist/content.js`: 26 unikke sektions-ID'er, korrekt kapiteltilknytning, 78 kort, tre kort pr. sektion, 30-55 ord pr. kort og 40-65 ord samlet pr. case. Alle `sourceIds` findes i bankens `SOURCES`.
