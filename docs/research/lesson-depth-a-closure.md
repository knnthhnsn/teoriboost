# Lukning af fund i `lesson-depth-a.json`

Kontrolleret og rettet 12. oktober 2026. Denne note lukker de ni P2-fund i `lesson-depth-a-independent-review.md`; reviewhistorikken er bevaret uændret.

## Lukkede fund

1. **`assistenter` — afprøvning var overdrevet som fysisk krav.** Den endelige practical note er: »Eleven skal kunne aflæse og forstå systemerne i undervisningsbilen. En eventuel demonstration skal følge kørelærerens og fabrikantens anvisninger og må aldrig fremprovokeres ved at skabe en faresituation.« Locator for de tilhørende assistentkort er fortsat **Undervisningsplan kategori B v1.1, 1.1.6**, navnlig pkt. 4-6.

2. **`bremser` — forkert locator og løst fragment.** »Pedalen giver information« peger nu på **Undervisningsplan kategori B v1.1, 1.2.3, pkt. 13-15 og 18-21**. Kort 3 slutter nu: »Sammenhold signalet med bilens betjeningsvejledning, og undlad videre kørsel, hvis bremsesikkerheden ikke kan fastslås før turen.« Dets locator er **1.2.3 og 1.3.1**; pedalcasen peger alene på **1.2.3**.

3. **`motor-dokumenter` og `laes-trailer` — ikke-eksisterende 1.3.2 og forkert hjemmel.** Dokumentkortet peger nu på **1.3.1, pkt. 2-5; 6.1.3, pkt. 2-3**. Motorcasen peger på **1.1.2, 1.2.5 og 1.3.1, pkt. 2-5; 6.1.3, pkt. 2-3**. Trailerens endelige kontroltekst er: »Kontrollér registreringsoplysningerne for bil og trailer før afgang. Bilens tilladte påhængsvægt, trailerens tilladte totalvægt, den faktiske belastning og din førerret skal passe sammen; én tilladt værdi afgør ikke hele kombinationen. Selve koblingen og udstyret kontrolleres efter fabrikantens anvisninger.« Locator: **1.2.10, 1.3.1, pkt. 2-5; 6.1.3, pkt. 2-3**. Den relaterede case er afgrænset til fastgørelse, registreringsoplysninger, førerret og faktisk belastning med locator **1.3.1, pkt. 2-5; 6.1.3, pkt. 2-3; Færdselsloven § 82**.

4. **`laes-trailer` — praktisk trailerundervisning blev fremstillet som gennemført B-krav.** Den endelige practical note er: »Hvis føreren senere skal bruge en trailer, bør kobling, kontrol og kørsel læres på den konkrete kombination. Denne mikrolektion dokumenterer ikke sådan praktisk instruktion og er ikke et gennemført kategori B-krav.« Afgrænsningen følger **Undervisningsplan kategori B v1.1, 3.2.3 og moduloversigten 0.3**.

5. **`distraktion` — rødt lys og kø var kun beskrevet som usikkert.** Den endelige tekst er: »Hvis navigation, en besked eller en genstand kræver opmærksomhed, så find et lovligt sted og afslut kørslen, før udstyret betjenes håndholdt. Håndholdt brug er også ulovlig, mens du holder for rødt eller i kø, fordi du stadig anses for kørende.« Locator: **Undervisningsplan kategori B v1.1, 4.1.5-4.1.7; Færdselsloven § 55 a; Nordjyllands Politi, dom af 10. januar 2025, omtalt 14. januar 2025**.

6. **`alkohol-stoffer` — aktuelle talgrænser manglede.** Den endelige tekst er: »Den almindelige grænse er overskredet, når alkoholkoncentrationen er over 0,50 promille i blodet eller over 0,25 milligram pr. liter udåndingsluft. I de første tre år efter førstegangserhvervelse af retten til kategori B gælder over 0,20 promille eller over 0,10 milligram pr. liter. Spirituskørsel kan også straffes under talgrænsen, hvis alkoholen hindrer betryggende kørsel.« Locator: **Færdselsloven § 53, stk. 1-3; Undervisningsplan kategori B v1.1, 4.4.1, pkt. 3-6**. Tallene og treårsforudsætningen er genkontrolleret direkte i den gældende lovbekendtgørelse.

7. **`sigt` — fysisk krav omfattede fejlagtigt al nedsat sigt.** Den endelige practical note er: »Kørsel i mørke trænes i den obligatoriske mørkelektion. Tåge, regn, blænding og anden nedsat sigt indgår som risikoforhold; mikrolektionen dokumenterer ingen praktisk erfaring med disse forhold.« Locator: **Undervisningsplan kategori B v1.1, modul 4 og 7.19**.

8. **`tunnel-jernbane` — lys, jernbanereference og praktisk krav var blandet sammen.** Tunnelteksten siger nu: »Sikr før indkørslen, at nærlyset og dermed baglyset er tændt« og peger på **7.20.2, pkt. 2-3; 7.20.4, pkt. 1, 3 og 6**. Jernbanekort og case peger på **7.3.3, pkt. 59; 7.3.4, pkt. 13-15; Færdselsloven § 5**. Den endelige practical note er: »Praktisk tunnelkørsel er kun obligatorisk, når en lektion på mindst 45 minutter tillader turen til, gennem og tilbage fra en angivet tunnel; ellers undervises færdighederne i teorilokalet. Her dokumenteres heller ingen praktisk passage af jernbaneoverkørsel.«

9. **Seks redaktionelle restfragmenter er fjernet.** De berørte kort slutter nu med fulde sætninger: `bremser`: »… fastslås før turen« (**1.2.3 og 1.3.1**); `doer-aabning`: »… åbne døren sikkert i trafikken« (**7.18.3-7.18.5**); `tunge`: »… opdage i lastbilens spejle« (**3.2.2 og 6.2.3**); `cykler-smaa`: »… en cykelsti eller et fortov« (**3.1.3, 3.2.7-3.2.8 og 7.13**); `laes-trailer`: »… efter fabrikantens anvisninger« (**1.2.10, 1.3.1, pkt. 2-5; 6.1.3, pkt. 2-3**); `vejmiljoe`: »… bevæger sig ind i din bane« (**5.2.2 og 5.2.5**).

## Kontrol

- JSON kan parses uden fejl.
- Filen indeholder præcis 26 unikke sektioner og 78 kort; sektions-ID'er og chapterId-scope matcher de 26 aktuelle sektioner i `dist/content.js` for kapitlerne `bil`, `grundmanoevrer`, `koeretoejer`, `foereren` og `vej-vejr`.
- Hver sektion har tre kort, og alle 78 kort ligger på 30-55 ord.
- Alle anvendte `sourceIds` findes i `dist/content.js`' `SOURCES`.
- De seks kendte restfragmenter og referencen `1.3.2` forekommer ikke længere.
- `opfattelse` samt tekster om opmærksomhed, reaktion og praktiske krav er genlæst. Der blev ikke fundet yderligere konkrete rettelser inden for dette snapshot.

## Primærkilder

- [Færdselsstyrelsen: Undervisningsplan for kategori B, version 1.1, maj 2026](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf)
- [Retsinformation: Færdselsloven, LBK nr. 118 af 12. januar 2026](https://www.retsinformation.dk/eli/lta/2026/118/pdf)
- [Nordjyllands Politi: Taxichauffør dømt for mobilbrug ved rødt lys, 14. januar 2025](https://politi.dk/nordjyllands-politi/nyhedsliste/taxichauffoer-doemt-for-mobilbrug-ved-roedt-lys/2025/01/14)

## Begrænsninger

Lukningen er et afgrænset tekst-, struktur- og primærkildetjek af JSON-snapshotet. Den er ikke en godkendelse fra en kørelærer eller Færdselsstyrelsen, dokumenterer ikke praktisk undervisning og er ikke en påstand om fuldt pensum. Der er ikke udført browser-, visuel- eller elevforståelsestest af denne JSON.

## Root-opfølgning: nummererede planhenvisninger

En direkte sammenligning med indholdsfortegnelsen i den officielle PDF fandt tre cockpit-henvisninger til 2.1.2, som ikke findes i v1.1. Kort 1, kort 2 og casen peger nu på 2.1.1; kort 2 bevarer desuden 1.1.2. Indholdsfortegnelsen har kun 2.1.1 under forberedelse til kørsel. Alle 232 kort-/case-locators er bagefter kontrolleret for eksistens af de anførte nummererede planoverskrifter. Dette kontrollerer henvisningernes eksistens, ikke alle udsagn eller pkt.-numre semantisk.
