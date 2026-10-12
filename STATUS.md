# NATKØRSEL — status 12. oktober 2026

Den leverede milepæl er en fungerende privat prototype med et spil først, en kildebelagt teoriindgang og en rigtig lokal øveprøvelogik. Det overordnede mål om fuld teori, dokumenteret hurtig læring og national førsteplads er stadig aktivt.

## Implementeret og afgrænset

| Område | Aktuel leverance | Evidens og grænse |
|---|---|---|
| Spillet | Fire cases, fire trin, fri omkamp, fysisk bilplacering og korrekt vent→fortsæt-forløb | Alle fire er gennemført i den faktiske browser efter sidste adfærdsændring. Layoutets sidste tilpasning er særskilt kontrolleret på STOP og overgang til næste case. |
| Visuelt | Lokal 3D-natteby, tydeligere asfalt/kantsten, lodrette tavler, blå rettet bil/grå fejlbil, scenelegend, karakterer og kvittering | Faktiske skærmbilleder læst af agent og Claude. Det er ikke en komplet visuel godkendelse af alle 83 diagrammer. |
| Indhold | 10 kapitler, 58 sektioner, 190 fakta, 83 spørgsmål, 332 udsagn | Aktuelle id'er, format og kilder maskinelt valideret. Detaljerede delmål og alle trafikvariationer er ikke fuldt dækket. |
| Mikrolektioner | 58 lektioner, 174 forklaringskort, 58 cases, 58 åbne recalls | To separate forfatterbatches og et separat tekst-/kildereview. 2 P1 og 13 P2 fra reviews er rettet; yderligere nummererede henvisninger er rettet ved root-kontrol. 232 kort-/case-locators kontrolleret for eksisterende planoverskrifter. Dette kontrollerer ikke automatisk hvert udsagns sandhed eller hvert pkt.-nummer. |
| Gentagelser | Nye/svage emner, planlagte gentagelser, XP uden fartbelønning, begrænsning pr. spørgsmål/dag | 16 core-checks består. En faktisk mission med tre emner og en meningsfuldt ny STOP-genkaldelse er gennemført. |
| Øveprøve | 25 forskellige situationer, 25-minuttersfrist, flag, navigation, lagrede svar/historik | Efter blandet udsagnsrækkefølge: 20/25, præcis 5 bevidste app-fejl og 0 ubesvarede. Svar/flag/tid og resultat efter reload kontrolleret. Et tidligere rigtigt 25-minutters tidsudløb er også observeret. |
| Lagringssikkerhed | Spørgsmålsfingeraftryk beskytter genoptagelse mod ændret ordlyd/facit/rækkefølge; resultater afsluttes kun én gang | Core-test af ændrede samme-id-spørgsmål, tilføjelse af andre spørgsmål og gamle/mismatchede resultater. To friske faner er kontrolleret, men faneklonsession og samtidige atomiske leases er ikke fuldt afprøvet. |
| Mobil | 390×844 og 360×800, separate læsbare valg, 44px+ knapper, korrekt-position-billede, humor/bevægelse kan slås fra | Faktisk browser med viewport-emulering. Udvalgte sider uden vandret overflow. Fysisk iPhone/Android, Safari, oplæsning og fuld tastaturkampagne udestår. |
| Timing-demo | Oprindeligt gas/bremse-koncept uden tids-score/XP; STOP kræver simuleret nulhastighed ved linjens nærzone | Start/gas/bremse og en hel tur med tre bevidste fejl er kontrolleret; resultatet var 0/3 rene situationer og 3 regler at øve. En tidlig standsning ved 4 m blev ikke anerkendt; nulhastighed tæt ved linjen blev anerkendt. Det efterfølgende forsøg på passage blev afvist for fortsat vigepligt. En kontrolleret fri passage efter STOP er stadig ikke verificeret. Demoen er ikke en prøve eller orienteringstest. |

De originale synkroniserede projektkilder og det eksisterende Knold-projekt er bevaret. Den lokale originale Claude-HTML er bevaret med registreret hash. Der er ikke indbygget betaling, konto eller ekstern svartelemetri i appen.

## Research og værktøjernes rolle

Offentlige primærkilder blev sammenlignet for Teoriklar, TeoriTjek, KørekortKlar, iKörkort, UK Driving Theory Test 4 in 1, Teoritentamen, Fahren Lernen og Zutobi. Det gav mønstre som tydelig progression, forklaring efter svar, gentagelser, risikoarbejde og separate prøveforløb. Leverandørpåstande er ikke behandlet som målte læringsresultater, og der er ikke foretaget hands-on i betalte konkurrentprodukter.

REA-repositoriets offentlige README blev undersøgt. Det blev ikke installeret: de offentlige produktflows og selvstændige originale aktiver gav allerede grundlaget for denne iteration. En REA-installation eller kopiering af andre apps er ikke nødvendig evidens for, at dette produkt lærer nogen noget.

Claude blev brugt som kritisk sparringspartner på egne faktiske skærmbilleder. Konkret feedback førte til mindre svarlæk, mere ligeværdige valg, læsbar natteby, korrekt replay, klarere mobilfeedback og færre overflødige kontrolfelter. Claude har ikke selv kørt appen eller givet faglig kørelærergodkendelse.

Jev-resultaterne er syntetisk tekstklassifikation. Den tidlige konceptmåling anvendte seks fiktive persona-reaktioner skrevet af agenten, så den er også påvirket af vores eget inputvalg. Det afsluttende QA-spørgsmål gav ved en tvetydig rolleformulering `imageEvidence=0.67`, selv om Jev ikke havde fået billeder. Det rå fund er bevaret. En efterfølgende entydig kalibrering gav 0.07 for modtagne billeder, 0.06 for browserhandlinger, 0.99 for agentens billedlæsning og 0.02 for udført menneskelig test. Kalibreringen viser følsomhed for formulering; den gør ikke klassifikationen til et testbevis.

Den afsluttende Jev-triage pegede på privat QA og derefter faglig/menneskelig afprøvning. Den gav lave scorer for fuld teori, læringsgevinst, kørelærergodkendelse og national førsteplads. Confidence er klassifikationssikkerhed inden for de valgte svarmuligheder, ikke sandsynlighed for markedssucces. Kun den eksisterende månedlige saldo blev brugt; ingen opladning eller køb blev foretaget. Et utilsigtet gentaget gammelt UI-input er eksplicit gemt og udelukket fra den nye versions vurdering.

## Næste arbejde under det aktive mål

1. **Færdig indholdsdybde:** Kortlæg alle detaljerede delmål, ikke kun de 57 brede underafsnit. Udbyg især køretøjskontrol, landevej, overhaling/møde, motorvej, mørke/tunnel og lovlig standsning/parkering med forskellige præmisser og orienteringskrav. De 58 nye mikrolektioner er ikke allerede bedømt som fuld delmålsdækning i den brede matrix.
2. **Faglig gennemgang:** En godkendt kørelærer gennemgår hvert facit, begrundelse, lovhenvisning og afgørende billedforhold. Praktiske områder vurderes særskilt; quizresultater må ikke registreres som lovpligtige praktiske færdigheder.
3. **Afprøvning med mennesker:** Start med et lille voksenpanel af reelle kategori B-elever. Mål om de kan finde problemet uden hjælp, forklare reglen, løse en ny trafikvariation og genkalde den efter en forsinkelse. Et lille pilotpanel er retningsgivende og kan ikke dokumentere national overlegenhed. Ingen deltagere er kontaktet eller data indsamlet endnu.
4. **Bred browser/device-QA:** Timing-demoens kontrollerede positive trafikforløb, fysisk mobil, Safari, oplæsning, tastatur/fokus, gentagelser over rigtige dage og parallelle faners kanttilfælde. Test de endelige spørgsmål og billeder samlet efter alle indholdsrettelser. Browserprotokollen bevarer et ikke-opfyldt forventet rent STOP-forløb; observationen var en vigepligtsafvisning efter et anerkendt stop, ikke en dokumenteret fri passage.
5. **Marked efter dokumenteret værdi:** Først når faktiske elever og fagreview støtter produktet, testes onboarding, fastholdelse og betalingsvilje. Nationale påstande kræver markedsdata; der er intet grundlag for at annoncere Danmarks nr. 1 nu.

De rå reviewfiler i `docs/research/` er historiske kontrolpunkter. Dette dokument beskriver den aktuelle samlede status. Gamle `PENDING`-noter eller banktal i de tidligere snapshots må ikke læses som den seneste tilstand; de relevante closures og efterfølgende browserkontroller angiver, hvad der er lukket.
