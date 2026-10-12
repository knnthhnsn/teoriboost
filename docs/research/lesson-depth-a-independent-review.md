# Uafhængigt fagligt review af `lesson-depth-a.json`

Kontrolleret 12. oktober 2026. Alle 26 lektioner, 78 kort, 26 cases, recalls og praktiske noter er læst. Regler med tal eller sikkerhedskritisk handling er sammenholdt med [Undervisningsplan kategori B v1.1, maj 2026](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf) og [Færdselsloven, LBK nr. 118 af 12. januar 2026](https://www.retsinformation.dk/eli/lta/2026/118/pdf). Der blev ikke fundet et P1-fund, som direkte lærer eleven at udføre en akut farlig manøvre. Nedenstående P2-fund bør rettes før indholdet bruges i appen.

## P2-fund

### 1. `assistenter` — `practicalNote` gør afprøvning af indgreb til et krav

**Tekst:** »Førerassistenter skal afprøves under fysisk undervisning, så deres indgreb og begrænsninger opleves sikkert« (JSON linje 101).

**Problem:** Planens 1.1.6, pkt. 4-6 kræver kritisk forståelse samt aflæsning og forståelse af systemerne i undervisnings- og prøvebilen. Den siger ikke, at eleven skal fremprovokere eller fysisk afprøve fx nødbremse- eller vognbaneindgreb. Formuleringen kan både overdrive pensumkravet og invitere til en risikabel demonstration.

**Rettelse:** Skriv fx: »Eleven skal kunne aflæse og forstå systemerne i undervisningsbilen. En eventuel demonstration følger kørelærerens og fabrikantens anvisninger og må ikke fremprovokeres ved at skabe en faresituation.« Kilde: plan 1.1.6, pkt. 4-6.

### 2. `bremser` — kortet »Pedalen giver information« peger på styreapparatet

**Tekst:** Kortet om synkende bremsepedal har locator »1.2.2« (linje 114).

**Problem:** 1.2.2 er styreapparat. De beskrevne bremsekrav findes i 1.2.3: pkt. 13-15 om pedalvandring og konstant tryk samt pkt. 18-21 om længere pedalvandring, skævtrækning og eftersyn. Selve rådet er forsigtigt, men den angivne kilde dækker det ikke.

**Rettelse:** Skift locator til »Undervisningsplan kategori B v1.1, 1.2.3, pkt. 13-15 og 18-21«. Fjern samtidig det løse tekstfragment »på vejen.« i kortet »Reagér før turen« (linje 126).

### 3. `motor-dokumenter` og `laes-trailer` — ikke-eksisterende planpunkt og manglende hjemmel til førerret

**Tekster:** `motor-dokumenter` kort 3 og case bruger »1.3.2« (linje 220 og 230); `laes-trailer` kort 3 gør det samme (linje 730).

**Problem:** Plan v1.1 har kun 1.3.1 under afsnit 1.3. Registreringsattestens vægte og sammenkobling dækkes af 1.3.1, pkt. 2-5. Førerretten til trailer dækkes af 6.1.3, pkt. 2-3, ikke 6.2.7. De detaljerede kontrolord »kobling, sikkerhedsforbindelse, lygter, dæk« dækkes heller ikke samlet af de nuværende locators.

**Rettelse:** Brug 1.3.1, pkt. 2-5 for registreringsdata og sammenkobling samt 6.1.3, pkt. 2-3 for kategori B's vægtgrænser. Tilføj en særskilt, præcis primærkilde til trailerens tekniske kontrol eller begræns kortet til de forhold, planens 1.2.10 og 1.3.1 faktisk beskriver.

### 4. `laes-trailer` — praktisk trailerkørsel fremstilles som del af almindelig B-undervisning

**Tekst:** »Kobling, kontrol og kørsel med trailer kræver praktisk instruktion på den konkrete kombination« (linje 747).

**Problem:** Kategori B-planens 3.2.3 lærer eleven om andre biler med påhængskøretøj og kræver, at eleven kan reagere på deres fart-, styre- og orienteringsforhold i trafikken. Den kræver ikke, at B-eleven kobler eller fører en konkret trailer. Noten kan derfor læses som et lovpligtigt praktisk B-krav, som planen ikke opstiller.

**Rettelse:** Skriv fx: »Hvis føreren senere skal bruge en trailer, bør kobling, kontrol og kørsel læres på den konkrete kombination. Denne mikrolektion dokumenterer ikke sådan instruktion.« Undlad at kalde det et gennemført eller obligatorisk element i kategori B-forløbet. Kilde: plan 3.2.3 og moduloversigten 0.3.

### 5. `distraktion` — rødt lys og kø beskrives kun som usikkert, selv om håndholdt brug fortsat er ulovlig

**Tekst:** »Et rødt lys eller en langsom kø gør ikke en håndholdt opgave til en sikker del af kørslen« (linje 820).

**Problem:** Det er korrekt, men for svagt i et kort med lovlocator. Færdselslovens § 55 a gælder »under kørsel«, og en fører, der holder for rødt eller i kø, anses fortsat som kørende. Den nuværende formulering kan læses som et sikkerhedsråd frem for et fortsat forbud. Det er også bekræftet i [Nordjyllands Politis omtale af dommen 10. januar 2025](https://politi.dk/nordjyllands-politi/nyhedsliste/taxichauffoer-doemt-for-mobilbrug-ved-roedt-lys/2025/01/14).

**Rettelse:** Tilføj: »Håndholdt brug er også ulovlig, mens du holder for rødt eller i kø. Hold lovligt ind og afslut kørslen, før udstyret betjenes håndholdt.« Bevar rådet om at fortsætte efter skiltning frem for at række efter telefonen.

### 6. `alkohol-stoffer` — kortet med overskriften »Lovgrænsen« udelader begge aktuelle grænser

**Tekst:** Kort 2 siger kun, at loven »fastsætter grænser og forbud« (linje 908-914).

**Problem:** Udsagnet er ikke forkert, men det er materielt ufuldstændigt i den sektion, hvor eleven forventer lovreglen. Færdselslovens § 53 skelner mellem over 0,50 promille/0,25 mg pr. liter udåndingsluft generelt og over 0,20 promille/0,10 mg pr. liter i de første tre år efter førstegangserhvervelse af kategori B. Udeladelsen kan fastholde den forældede forestilling om én universel 0,5-grænse.

**Rettelse:** Angiv begge grænser og treårsforudsætningen ordret præcist, og behold pointen om, at påvirkning kan gøre kørslen strafbar og uforsvarlig under talgrænsen. Kilde: færdselsloven § 53, stk. 1-3; plan 4.4.1, pkt. 3-6.

### 7. `sigt` — fysisk krav udvides fra mørke til al nedsat sigt

**Tekst:** »Kørsel i mørke og nedsat sigt skal trænes fysisk« (linje 1082).

**Problem:** Modul 4 kræver én praktisk lektion i mørke, og 7.19 fastlægger tid og vejtyper for den. Planen opstiller ikke et særskilt krav om, at eleven fysisk skal køre i tåge, kraftig regn eller anden tilfældig nedsat sigt. Den brede formulering kan give et falsk indtryk af, hvad der er gennemført eller lovpligtigt.

**Rettelse:** Skriv: »Kørsel i mørke trænes i den obligatoriske mørkelektion. Tåge, regn, blænding og anden nedsat sigt indgår som risikoforhold; appen dokumenterer ingen praktisk erfaring med disse forhold.« Kilde: plan 0.3, modul 4, og 7.19.

### 8. `tunnel-jernbane` — tunnellys, jernbanelocator og fysisk krav skal skilles ad

**Tekster:** Kort 1 siger blot »Tænd krævet lys« (linje 1186); jernbanekort og case henviser til 7.20 (linje 1207 og 1218); noten siger, at både tunnel og jernbaneoverkørsel »skal trænes i trafik« (linje 1224).

**Problem:** Plan 7.20.4, pkt. 3 kræver den konkrete kontrol, at nærlys og dermed baglys er tændt før tunnelen; »krævet lys« skjuler forskellen fra særligt kørelys uden baglys. Jernbaneoverkørsler behandles i 7.3.3-7.3.4 og færdselslovens § 5, mens 7.20 alene er tunnel. Praktisk tunnelkørsel er kun obligatorisk, når en lektion på mindst 45 minutter tillader turen til, gennem og tilbage fra en af de angivne tunneler; ellers undervises de praktiske færdigheder i teorilokalet. Planen opstiller ikke i denne sektion et særskilt krav om faktisk passage af en jernbaneoverkørsel.

**Rettelse:** Skriv »Sikr før tunnelen, at nærlyset og dermed baglyset er tændt.« Skift jernbanelocator til plan 7.3.3-7.3.4 og færdselsloven § 5. Erstat practical note med den præcise 45-minuttersbetingelse og teori-alternativet fra planens indledning til 7.20; undlad at attestere gennemført jernbanepassage.

### 9. Seks redaktionelle restfragmenter gør sikkerhedstekst tvetydig

Fjern de løsrevne slutfragmenter i `bremser` kort 3 (linje 126: »på vejen.«), `doer-aabning` kort 3 (linje 447: »i trafikken.«), `tunge` kort 3 (linje 587: »og handlemuligheder.«), `cykler-smaa` kort 2 (linje 671: »fra førerpladsen.«), `laes-trailer` kort 3 (linje 726: »før turen.«) og `vejmiljoe` kort 1 (linje 1139: »eller kører frem.«). De ændrer ikke facit, men de gør instruktionerne sværere at afkode hurtigt.

## Kontrollerede områder uden yderligere fund

- Dækkenes mindste mønsterdybde på 1,6 mm svarer til plan 1.2.7, pkt. 9.
- Øvelsesmålet med højre hjulpar højst 20 cm fra kanten er korrekt afgrænset til øvelsespladsens forlæns parkering i plan 2.7.1.
- Bremsepedal, skævtrækning og handlingen »lad bilen stå« stemmer med plan 1.2.3; fejlen er locatoren i kort 1 og det redaktionelle restfragment.
- Rådene om træthed og medicin er forsigtige og stemmer med færdselslovens § 54, stk. 1-2, og plan 4.4.2-4.4.3.
- Jernbanecasen anbefaler korrekt at blive før sporet, indtil hele passagen kan gennemføres uden unødigt ophold; rettelsen gælder dens planreference og påstanden om praktisk gennemførelse.

## Afgrænsning

Dette er et afgrænset tekst- og primærkildereview af JSON-snapshotet. Det er ikke en godkendelse fra en kørelærer eller Færdselsstyrelsen, ikke en påstand om fuldt pensum og ikke visuel eller browserbaseret QA. Reviewet dokumenterer heller ikke, at praktiske færdigheder er gennemført.
