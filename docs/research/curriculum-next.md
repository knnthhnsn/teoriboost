# Næste pensumdækning

Status pr. 12. oktober 2026. Prioriteringen bygger på [Færdselsstyrelsens undervisningsplan for kategori B, version 1.1, maj 2026](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf) og den maskinlæsbare mapping i `curriculum-matrix.json`.

## Ærlig baseline

Den nuværende bank har 10 kapitler, 52 app-sektioner og 71 spørgsmål. De er mappet til alle planens 57 nummererede underafsnit på niveau 1.1–10.3:

- 22 er `partial`: flere centrale dele findes, men væsentlige delmål eller variationer mangler.
- 29 er `brief`: kun få fakta eller et smalt scenarie berører emnet.
- 6 er `missing`: 2.7, 7.10, 7.14, 7.21, 7.22 og 9.5.

Det er en indholdsmapping, ikke en beståelses- eller dækningsprocent. Planens detaljerede delmål har forskellige præstationskrav, blandt andet at eleven skal kunne udpege, kontrollere, genkende, bedømme og udføre manøvrer. En faktalinje eller ét multiple-choice-scenarie opfylder derfor ikke et helt underafsnit.

## Prioriteret produktionsrækkefølge

| Batch | Officielle områder | Konkret leverance | Færdig når |
|---|---|---|---|
| 1. Akutte huller på vej | 7.10, 7.14, 7.21 | Tre nye sektioner om trafiksanerede områder, venstresving og letbane. Mindst tre varierede situationer pr. sektion med orientering, risikoforhold, handling og relevant regel. | Hvert område har forklaring, visuel situation og spørgsmål, som tester forskellige delmål; alle udsagn er kildebelagt og fagligt reviewet. |
| 2. Landevejspakke | 4.3, 5.1–5.2, 7.2–7.3, 7.6–7.9 | 10–12 sammenhængende scenarier om vejforløb, hastighed, placering, møde, afstand, holdende køretøjer og overhaling på smal/bred, lige/kurvet og bakket landevej. | Scenarierne kræver aktiv bedømmelse af udsyn, afstand, modkørende, vejkant og afbrydelse af manøvren; de genbruger ikke samme facit med kosmetiske ændringer. |
| 3. Motorvej og motortrafikvej | 7.4, 7.8–7.9, 7.16–7.17 | 6–8 scenarier fra tilkørsel til frakørsel: acceleration, sammenfletning, banevalg, sikker afstand, overhaling, kø, motorstop og særlige forskelle på motortrafikvej. | Hele kørselsforløbet er repræsenteret, og mindst ét scenarie tester hvert af tilkørsel, løbende kørsel, frakørsel og nødsituation. |
| 4. Parkering og standsning | 2.7 og 7.18 | Manøvreserie for parkering ved vejkant plus lovcases om standsning/parkering med afstande, skiltning, udsyn, døre og sikring af bilen. | Den praktiske sekvens viser orientering og placering; teoridelen varierer lovlige og ulovlige steder uden at antyde, at appen erstatter øvelsespladsen. |
| 5. Mørke, tunnel og bane | 5.2, 7.19–7.21 | 8–10 scenarier om lygteføring, synlighed, blænding, hastighed, tunnelafstand/nødsituation, jernbaneoverkørsel og letbane. | Cases skelner mellem mørke, nedsat sigt, tunnel, jernbane og letbane og tester både tegn, risiko og handling. |
| 6. Køretøj og lovpligtig kontrol | 1.1–1.3 | Systematisk kontrolspor for styretøj, bremser, lygter/reflekser/horn, motor/udstødning/batteri, bærende dele, karrosseri, særligt udstyr, førerassistenter og dokumenter. | Hvert kontrolpunkt forklarer hvad eleven skal kontrollere, hvordan det kontrolleres, og korrekt reaktion på en fejl. Praktiske kontrolkrav markeres som noget, der også skal udføres ved bilen. |
| 7. Ulykker og sikker afvikling | 6.2 og 8.1 | Cases om ulykkessted, hjælp og oplysningspligt, motorstop, slæbning, fri passage, personer/gods, forsikring samt alkohol, narkotika, fart og sele som ulykkes-/skadesfaktorer. | Spørgsmålene skelner mellem forebyggelse, handling på stedet og efterfølgende pligter; handlingsråd er kontrolleret mod gældende primær kilde. |
| 8. Køreteknik | 9.1–9.5 | Forklarings- og refleksionsforløb om vejgreb/belæsning, fart/energi, kurve, bremsning, undvigelse, udskridning og høj vejkant. | 9.5 er ikke længere `missing`, og hvert emne kobler årsag til korrekt førerhandling. Appen beskriver tydeligt, at færdigheden opnås på køreteknisk anlæg. |
| 9. Forløb og prøve | 10.1–10.3 | Opdateret forløbskort for undervisning, indstilling, teori- og praktisk prøve, gyldighed samt inddragelse/frakendelse/generhvervelse. | Alle tal, aldersregler, frister og prøvepåstande har dato og officiel kilde; ændringer kan opdateres uden at omskrive scenarier. |

## Tværgående indholdskrav

Hver ny sektion bør som minimum have én kort forklaring, én aktiv genkaldelsesopgave og mindst to situationsspørgsmål med forskellige billeder eller præmisser. Spørgsmålene skal tilsammen variere regel, risiko, orientering og handling. Et nyt spørgsmål tæller kun som bredere dækning, hvis det prøver et andet delmål eller en meningsfuld ny trafikvariation.

Alle lov-, alders-, promille-, afstands-, udstyrs- og prøvepåstande skal have en specifik primær kilde og en kontrol-dato. Faglig QA skal kontrollere både facit, begrundelse, illustrationens trafikgeometri og at alle fire udsagn kan bedømmes uafhængigt.

De praktiske hovedafsnit 2, 7 og 9 kræver fysisk undervisning, øvelseskørsel eller køreteknisk anlæg. Appen kan forberede, forklare og støtte refleksion, men må ikke mærke disse områder som gennemført på baggrund af quizresultater. Afsnit 7.22 kan højst få støttende, sammensatte refleksionscases i appen; den afsluttende øvelseskørsel skal stadig ske med kørelærer.

## Opdateringsregel for matrixen

Flyt kun `missing` til `brief`, når der findes direkte og korrekt indhold for området. Flyt kun `brief` til `partial`, når flere centrale delmål og relevante variationer er repræsenteret. Behold praktiske områder på højst `partial`, medmindre matrixen senere udvides med særskilt dokumentation for den lovpligtige praktiske undervisning uden for appen.
