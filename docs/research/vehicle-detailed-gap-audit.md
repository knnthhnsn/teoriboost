# Detaljeret gap-audit: hovedafsnit 1

Kontrolleret 12. oktober 2026 mod [Færdselsstyrelsens undervisningsplan for kategori B, version 1.1, maj 2026](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf), hovedafsnit 1 på side 19-30 og præstationskravene på side 11-12. Den eksisterende dækning er læst i den aktuelle `dist/content.js` samt `lesson-depth-a.json` og `lesson-depth-b.json`. Filerne er kun brugt som read-only evidens.

Auditten har ét element for hvert af planens 17 nummererede underområder: seks i 1.1, ti i 1.2 og ét i 1.3. `represented` ville alene betyde, at appteksten faktisk indeholder hele det sammenfattede mål. Det ville stadig ikke dokumentere, at eleven kan udpege, aflæse eller kontrollere noget i en bil. `partial` betyder, at relevant tekst findes, men at væsentlige planpunkter eller præstationskrav mangler. `missing` betyder, at underområdets egentlige mål ikke findes i den nuværende bank.

## Dækningskort

| Planpunkt | Præstationskrav | Faktisk tekstlig dækning | Vurdering | Næste konkrete indhold |
|---|---|---|---|---|
| 1.1.1, pkt. 1-6 | Udpege i bilen | `cockpit`, `start-stop` omtaler enkelte betjeningsdele og sikker indstilling. | partial | Komplet køretøjsspecifik udpegningsliste for kontakter, pedaler, gear, bremse, rat, sele, hætter og væskedæksler; fysisk lokalisering med kørelærer. |
| 1.1.2, pkt. 1-3 | Aflæse og forstå i bilen | `cockpit`, `motor-dokumenter` omtaler instrumenter og ukendte advarsler, men ikke den krævede gruppe af målere, lys og alarmer. | partial | Mærkeuafhængig symboloversigt plus konkret aflæsning af undervisningsbilens instrumenter, display og akustiske alarmer. |
| 1.1.3, pkt. 1-7 | Viden | Motorfejl omtales, men motorens kraftvej, startmotor, speeder samt el- og hybridprincipper forklares ikke. | missing | Ny funktionslektion om forbrændingsmotor, start, kraftoverførsel og el- eller hybriddrift. |
| 1.1.4, pkt. 1-7 | Viden | En practical note nævner koblingspunkt, men koblingens funktion og biltyper uden koblingspedal forklares ikke. | missing | Ny teori om sammenkobling, pedalbrug, blød kraftoverførsel, hydraulik, automatgear og elbil. |
| 1.1.5, pkt. 1-5 | Viden | Ingen banktekst forklarer gearkassens funktion, lave og høje gear eller bakgear som samlet delmål. | missing | Ny gearlektion om kraft, hastighed, trækkraft, forbrug, transmissionstyper og bakgear. |
| 1.1.6, pkt. 1-6, herunder 3 a-h | Viden og aflæse i bilen | `assistenter` dækker fejlmulighed, ansvar, sensorer og enkelte systemer. Den fulde systemliste og bilspecifik aflæsning mangler. | partial | Tilføj de otte systemtyper fra planen og en sikker tjekliste for alle systemer i undervisnings- og prøvebilen. |
| 1.2.1, pkt. 1-4 | Angive regel | `bremser`, `lys-daek`, `motor-dokumenter`, `laes-trailer` lærer handling ved visse fejl. Ansvarsdelingen og hele regelpakken er ikke samlet. | partial | Forklar ejerens eller brugerens ansvar mod førerens ansvar samt styring, bremser, lys, horn, trailer, støj og emissioner. |
| 1.2.2, pkt. 1-12 | Viden, angive og kontrollere i bilen | `bremser` nævner styretøjsfejl generelt; funktion, lovkrav, ratslør, servo og fysisk kontrol mangler. | partial | Selvstændigt styreapparatforløb med kontrol af ratslør og servo samt fejltegn og korrekt reaktion. |
| 1.2.3, pkt. 1-23 | Viden, angive og kontrollere i bilen | `bremser` dækker pedal, skævtrækning og standsning; `fart-energi` nævner ABS. Flere systemer, væske og kontrolkrav mangler. | partial | Tilføj drifts-, nød- og parkeringsbremse, ABS, ESC, bremseassistent, one-pedal, bremsevæske og fysisk kontrol. |
| 1.2.4, pkt. 1-20 | Viden, angive og kontrollere i bilen | `lys-daek` dækker helhed, renhed og hurtigt blink. Inventar, farver, rækkevidder, stoplys, havariblink, nummerpladelys og horn mangler. | partial | Komplet lygte- og hornoversigt samt praktisk rundt-om-bilen-kontrol; medtag 100, 30 og 300 meter og lysgrænse. |
| 1.2.5, pkt. 1-13 | Kontrollere i bilen, angive og viden | `motor-dokumenter` dækker advarsler, røg, støj og generel olie- og kølervæskeomtale. Detaljer om kontrol, kulilte, kobling, gear og elbil mangler. | partial | Tilføj fysisk væskekontrol, udstødningsrisici, konkrete koblings- og gearfejl og batteri- eller rækkeviddeforhold. |
| 1.2.6, pkt. 1-29 | Angive og viden | `energi-miljoe` dækker forudseenhed, jævn fart, dæktryk, last, tagudstyr og sikkerhed. Store dele af planens 29 punkter mangler. | partial | Udvid med tomgang, gear, korte ture, samkørsel, el- og hybridforhold, regeneration, ladeplanlægning og regler om støj og røg. |
| 1.2.7, pkt. 1-18 | Viden, angive og kontrollere i bilen | `lys-daek` dækker 1,6 mm og skader; `energi-miljoe` dækker dæktryk som energifaktor. Dæktyper, akselkrav, pigdæk, omløbsretning og fejltegn mangler. | partial | Udvid til hele dæk-, fælg-, hjulleje- og hjulophængskontrollen samt konkrete fejltegn og krav til afhjælpning. |
| 1.2.8, pkt. 1-3 | Viden | Ingen aktuel sektion dækker karrosserikravene. | missing | Nyt kort om skarpe eller udragende dele, sikkerhedsfarlig skade eller rust og fungerende låse på døre og klapper. |
| 1.2.9, pkt. 1-13 | Viden, angive og kontrollere i bilen | `cockpit` dækker sele, spejle og udsyn; `lys-daek` berører ydre kontrol. Visker, vasker, sprinklervæske, rude og advarselstrekant er utilstrækkeligt dækket. | partial | Samlet særligt-udstyr-checkliste og fysisk kontrol af sprinklervæske, viskere, spejle og rude. |
| 1.2.10, pkt. 1 | Viden | `laes-trailer` og `motor-dokumenter` dækker trailer og vægte. De øvrige køretøjstyper og særlige udstyrskrav mangler. | partial | Overblik over varebil, trailer, quadricykel, trehjulet motorcykel, ATV, stor knallert, traktor og motorredskab. |
| 1.3.1, pkt. 1-6 | Angive og viden | `motor-dokumenter` og `laes-trailer` dækker vægte, sammenkobling og førerret. Registrering, medbringelse, kopier, udland og elbilens lasteevne mangler. | partial | Realistisk attestudsnit med aflæsning af vægte samt regler om dansk kopi, original eller genpart i udlandet og elbilers ofte lavere lasteevne. |

## Største konkrete huller

- **Motor, kobling og gear mangler som funktionsviden.** Banken træner især faresignaler og praktiske situationer, men planens 1.1.3-1.1.5 kræver særskilt forståelse af komponenternes funktion.
- **Karrosseri er ikke repræsenteret.** De tre korte krav i 1.2.8 kan tilføjes uden at udvide til en generel bilreparationslektion.
- **Fysisk kontrol er den gennemgående kompetenceforskel.** Ratslør, pedal og væske, lygter, dæk, visker, sprinkler og spejle skal kontrolleres på en bil uden værktøj. Tekst kan forberede rækkefølgen, men kan ikke dokumentere præstationskravet.
- **De eksisterende brede sektioner skjuler underemner.** `bremser`, `lys-daek` og `motor-dokumenter` har gode kerner, men hver rummer flere officielle underområder med forskellige præstationsverber. Næste indhold bør opdeles som konkrete tjeklister med punktlocatorer.
- **Dokument- og køretøjsvarianten er for smal.** Registreringsatteststoffet fokuserer på trailer, og særlige køretøjer fokuserer næsten kun på trailer. Planen kræver også dokumentmedbringelse, elbilers lasteevne og kendskab til flere køretøjstyper.

## Produkt- og QA-krav

- Vis præstationskravet ved hvert læringsmål: `viden`, `angive`, `udpege`, `aflæse og forstå` eller `kontrollere`.
- Lad kun tekstlige mål få en appstatus. Udpegning, aflæsning og kontrol i bil skal have en tydelig fysisk undervisningsmarkering og må ikke afsluttes af en quizscore.
- Bind hvert nyt kort eller tjekpunkt til det præcise planpunkt, ikke kun til intervallet `1.1` eller `1.2`.
- Test, at alle 17 `pointRef`-områder findes én gang, at `coverage` kun bruger `missing`, `partial` eller `represented`, og at alle `matchedSectionIds` findes i den aktuelle bank.
- Ved næste indholdsrevision bør auditten køres igen mod den faktiske tekst. En kildehenvisning eller sektionsoverskrift alene må ikke ændre `coverage`.

## Afgrænsning

Dette er et kilde- og tekstdækningskort. Det er ikke en fuldpensumvurdering, en kørelærergodkendelse eller dokumentation for elevens praktiske kompetence. Der er ikke udført fysisk køretøjskontrol, browser-QA eller prøvevalidering.
