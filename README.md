# NATKØRSEL

Et originalt dansk kategori B-koncept til unge og voksne: se førerens fejl, find reglen, placér bilen og se et korrekt forløb. Den første version er en privat prototype til afprøvning. Den registrerer ikke lovpligtig undervisning og lover ikke prøveklarhed eller en beståelse.

## Det findes i appen

- Fire interaktive 3D-cases om STOP, ubetinget vigepligt, højresving ved cykelsti og ureguleret fodgængerfelt. Korrekt genafspilning viser tilgang, ventetid og fri passage.
- Originale figurer og absurde undskyldninger, en animeret Stop & Søn-kvittering og en rolig tilstand med samme faglige tekst.
- 10 emner, 58 regelkort, 190 faktapunkter og 83 originale situationer med i alt 332 ja/nej-udsagn.
- 58 mikrolektioner med 174 forklaringskort, 58 nye anvendelsescases og 58 åbne genkaldelsesøvelser. Kilder og konkrete plan-/paragrafhenvisninger står ved forklaringen.
- Garagen: en original bilillustration med røntgenskyder, fire områdevalg, 17 detaljerede bilområder, 183 kildehenviste delmålsposter og 77 forklaringskort. 17 beslutningscases kommer før forklaringen, efterfulgt af en åben genkaldelse. Møtrik-Mads giver en valgfri huskekrog efter svaret. Den samlede biltjekliste forbereder fysisk undervisning uden flueben eller XP.
- Korte blandede missioner, feedback efter svaret, et nyt spørgsmål fra samme emne og en personlig gentagelseskø. XP gives for korrekte svar med daglig begrænsning; fart giver ingen point.
- En 25-situations øveprøve med gemte svar, markeringer, fast tidsfrist, historik og gennemgang. Appens egen fejlberegning er tydeligt beskrevet.
- Alle 83 spørgsmål har et stort originalt situationsbillede: 81 fotorealistiske AI-illustrationer, fuldt udsnit og en billedviser med 2×/4× zoom og rulning. Valg i prøven vises med en neutral ramme; facit kommer efter aflevering. Se [billedkontrol og afgrænsninger](docs/exam-visual-status.md).
- Den viderebearbejdede oprindelige gas- og bremsesimulation som særskilt timing-demo. Bilen holder selv banen; den tester ikke orientering.
- Fem native billeder med gennemsigtig baggrund: Møtrik-Mads, en mintbil, hjerne med kørelys, kvittering og omkampskegle. Små entréer/hoverreaktioner med rolig og reduceret-bevægelse-visning. Se [billedstatus og promptsæt](docs/art-status.md).
- Dansk oplæsning med den valgte Jeppe-neuralstemme: 1.235 lokale MP3-klip til spørgsmål, forklaringer, mikrolektioner, garage og spilinstruktioner. Lyt-knappen pauser og fortsætter; afspilleren har stop, start forfra og fire hastigheder. Oplæsningen følger de viste blandede svarmuligheder. Den starter på brugerens klik, og navigation stopper den.

Appens egne svar og indstillinger gemmes i browserens localStorage. Der er ingen konto, betaling eller analyseintegration i appkoden. Skrifttyper, Three.js og lydfiler leveres lokalt. Lydpakken fylder 84,1 MB samlet, men de enkelte klip hentes, når de afspilles; ingen TTS-tjeneste kaldes fra appen. WebGL og en moderne browser er nødvendige for de animerede scener.

## Kør og redigér

Brug Node.js. Projektet har ingen pakkeafhængigheder, der skal installeres for at køre.

```text
npm run dev
npm test
npm run build
npm run content:lessons
npm run content:garage
```

På Windows kan kommandoerne køres med `npm.cmd`. Den lokale visning åbnes på `http://127.0.0.1:4178`. `build` validerer indhold, kilde-id'er, lektionernes mapping og lokale runtime-filer. Den afviser også delvise lydpakker, ændret læringstekst, manglende MP3-filer, forkert tekst/hash/størrelse og ufærdige produktionsfiler. `content:lessons` samler de redigerbare JSON-filer i `authoring/` til den modulfil, som appen anvender.

`dist/` er den færdige statiske app og er direkte redigerbar. Spil, situationsbilleder, 3D-verden, indhold, oplæsning og øveprøvelogik er adskilte moduler. `tests/` indeholder 46 checks: 16 core-, fem garage-, 14 afspiller-, seks lydudgivelses- og fem billedudgivelseschecks. `content:garage` samler de to redigerbare garagebatches i `authoring/`. Hostingkonfigurationen i `.openai/hosting.json` tilhører den allerede oprettede ejerprivate Site.

`scripts/prepare-exam-photos.py` samler billedregistrene og pakker de originale PNG-pixels som lossless WebP. Billedkontrollen kræver Python/Pillow og de bevarede originaler i den lokale, ignorerede `reference/exam-native/`; en ren Git-klon har ikke disse originaler. `build` afkoder original og runtime-fil uafhængigt og kontrollerer aktuelle spørgsmålssignaturer, indhold, størrelse, SHA-256 og pixelidentitet. Selve appens billedviser kræver almindelig billedunderstøttelse i browseren.

Ved tekstændringer skal `scripts/build-voice-catalog.mjs` køres, berørte lydklip gendannes med `scripts/generate-voice.py`, og `scripts/verify-voice.py` kontrollerer fuld afkodning af alle klip. Produktionsværktøjerne kræver et separat Python-miljø samt FFmpeg; de er ikke runtime-afhængigheder. Se [oplæsningens status](docs/voice-status.md).

Den private adresse er [NATKØRSEL](https://natkoersel-teori.knnthhnsn.chatgpt.site). Adgangen er fortsat ejerprivat. Native udgivelsesmetadata og faktisk browserkontrol af den konkrete udgivelse gemmes lokalt i `evidence/`; billediterationens aktuelle evidens er beskrevet i [billedstatus](docs/exam-visual-status.md).

Den bevarede originale Claude-HTML ligger kun lokalt i `reference/claude-original.html`, SHA-256 `D15C00FD1840FC928EF627CE6105A86861AA20552866621EAEF6CD92539D5C97`. `prepare-driving.mjs` kræver denne reference for at regenerere timing-demoen; den færdige `dist/driving.html` kan redigeres selvstændigt. Originalen og projektets synkroniserede `sources/` er ikke ændret.

## Hvad der er kontrolleret

Se [status og evidens](STATUS.md), [browserkontrol](docs/browser-qa.json), [konkurrentanalyse](docs/research/competitors.md), [dansk kildegrundlag](docs/research/danish-theory.md), [pensummatrix](docs/research/curriculum-matrix.json) og [licenser](LICENSES.md).

Faktisk browserarbejde har kontrolleret alle fire spilcases og deres korrekt-forløb, en hel blandet 25-situations prøve med fem planlagte fejl, genindlæsning, tidsudløb, gentagelsesflow samt udvalgte mobil- og lektionsvisninger. Det er afgrænset desktopbrowser-QA med viewport-emulering, ikke en kampagne på rigtige telefoner eller alle browsere.

Alle 17 reviderede garagecases er kørt gennem forkert svar, forklaring, omkamp og korrekt svar ved 390×844. Søgning fra atlas og garage, områdevalg, tjekliste, røntgenskyderens tastaturbetjening og rolig tilstand er særskilt kontrolleret. Se [garagens browserkontrol](docs/garage-browser-qa.json) og [afgrænsninger](docs/garage-status.md).

Claude har kritiseret egne faktiske skærmbilleder. Jev har klassificeret vores tekstlige beskrivelser og syntetiske personaer. Jev har hverken fået billedfiler eller udført browserarbejdet. De rå resultater, en fejlagtig rolletilskrivning og en efterfølgende kalibrering er bevaret i `docs/research/`.

## Det, der skal ske før en offentlig faglig lancering

Den brede matrix berører alle 57 nummererede underafsnit, men dokumenterer ikke hvert detaljeret delmål. De nye mikrolektioner er heller ikke en komplet bog. Der skal tilføjes flere meningsfuldt forskellige situationer, laves en detaljeret delmålsmapping og gennemføres en samlet tekst-/billedgennemgang med en godkendt kørelærer.

Garagen indeholder nu en tekstlig repræsentation af de 17 underområder i planens kapitel 1 med 183 delmålsposter, herunder de otte ADAS-eksempler. Andre underpunkters opregninger er samlet under deres nummererede mål. Dette inventar og én case pr. område dokumenterer ikke elevens beherskelse af samtlige krav. De øvrige kapitlers tilsvarende detaljerede mapping mangler stadig.

Reelle elever skal derefter afprøve forståelse, nye trafikvariationer og genkaldelse efter en forsinkelse. Nationale markedsandele, menneskelig læringsgevinst og Danmarks nr. 1-status er endnu ikke dokumenteret. Næste produktion og validering er beskrevet i [STATUS.md](STATUS.md).
