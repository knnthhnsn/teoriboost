# Øveprøvens situationsbilleder — 12. oktober 2026

Den nye billedviser er implementeret og lokalt browserkontrolleret. Alle konkrete fund fra den særskilte tavlegennemgang er lukket ved kontrol af de endelige native pixels, inklusive q-052-v4 og q-068-v4. Den konkrete private udgivelses status gemmes i `evidence/`; dette dokument er ikke en kørelærergodkendelse.

## Leverance

Alle 83 aktuelle spørgsmål bindes til 81 originale fotorealistiske AI-illustrationer. q-032/q-059 deler det samme kompatible tomme STOP-kryds; q-034/q-066 deler den samtidige cyklist ved siden af bilen. De øvrige billeder er forskellige. Statiske fotos bevarer hele motivet og har tydelig AI-mærkning, neutrale titler og kun tekstligt givne måle-/tidsfakta. Bevægelse, blinkfrekvens, præcise afstande og tidligere observationer kommer fra situationens tekst.

Prøve- og missionsvisningen anvender `exam-photo-view.js`; de tidligere diagrammer og de eksperimentelle 3D-spørgsmål er ikke den aktuelle spørgevisning. Eksperimenterne er bevaret i `authoring/prototypes/`. De separate 3D-spilcases er fortsat deres egen aktivitet.

“Større billede” åbner hele billedet, 2×/4× zoom og rulning. Escape/luk returnerer billedet og fokus. Oplæsning stopper ved åbning. Indlæsning venter på billedets fulde afkodning og to malingsframes før “ready”. Manglende billeder har en tydelig tekstbesked og genindlæsning. Valgte prøvesvar har en neutral ramme med forklaring om, at facit kommer efter aflevering.

## Faktisk lokal kontrol

Endelig lokal kontrol efter de sidste v4-billeder: `npm.cmd test` 46/46 bestået, `npm.cmd run build` bestået med uafhængig native/runtime-afkodning af alle 81 billeder, begge runtime-modulers syntaks og scoped diff-check bestået. Der er 81 WebP-filer i produktionsmappen og ingen QA-HTML i `dist/`. Den oprindelige Claude-HTML har fortsat SHA-256 `D15C00FD1840FC928EF627CE6105A86861AA20552866621EAEF6CD92539D5C97`.

- 83/83 spørgsmålsbilleder er gennemgået i browserens lokale galleri; 28 skærmbilleder læst af en separat agent. De senere rettelser genkontrolleres særskilt og opdaterer samme galleri-evidens.
- En prøve med 25 forskellige situationer er navigeret i den faktiske app. Gemte fire valg og markering blev kontrolleret efter reload. Testdata er agentens QA, ikke elevresultater.
- Billedviser ved 320/390 pixels: 44 px kontroller, fuldt udsnit, 2×/4× zoom, faktisk PageDown-rulning og Escape/fokus-/billedgendannelse. Dette er viewport-emulering, ikke fysisk telefon/Safari-QA.
- Dansk lyd gik til `readyState=4` og afspillede; billedåbning stoppede den og ryddede kilden. Ingen svar blev valgt af lyd-/billedkontrollerne.
- En manglende billedfil blev udløst fra en lokal QA-knap. Fallback skjulte billedet og deaktiverede zoom; “Hent billedet igen” gav fuldt afkodet billede og fungerende zoom igen.
- Neutrale valgs farver/rammer og 44 px højde er læst fra den faktiske app; de fire gemte valg blev bevaret. Ingen konsolfejl fundet i appfanen. Galleri-fejltesten forventer én manglende fil.

Evidens er gemt lokalt i `evidence/exam-photo-gallery-browser.json`, `exam-photo-navigation.json`, `exam-photo-error-retry.json`, `exam-photo-mobile-zoom.json` samt de tilhørende faktiske skærmbilleder. Den endelige 83-id-kontrol har nul manglende/halvt viste billeder og alle forstørrelsesknapper mindst44px. Endelige q-010/q-025/q-027/q-035/q-040/q-052/q-068/q-074/q-075 rettelser er særskilt genkontrolleret i rendererens faktiske galleri. QA-galleriet flyttes ud af `dist/` før pakning.

## Kvalitet og kildegrænse

Claude kritiserede to faktiske UI-billeder, ikke hele banken eller browseradfærden. Det førte til fjernelse af en opdigtet afstandstavle i q-010, neutral billedtitel og neutrale svarvalg. Den særskilte tavlegennemgang kontrollerede native pixels mod gældende BEK 425/426 og deres relevante ændringer. Fund og efterfølgende pixelkontrol står i `exam-photo-signage-review.md`; rå Claude-kritik står i `research/claude-exam-visual-review.txt`.

Jevs ene nye kørsel (`playground_1b9f0dfd62f50d046cbb77cb3d8ac1c5eff`, jev-1.13.0, 955/120 tokens) klassificerede rapporten med åbne tavlefund og pegede på at lukke dem og verificere før udgivelse. Den modtog nul billeder/lydfiler og udførte nul browserhandlinger. Rå input/resultat er gemt i `research/jev-exam-visual-triage.json`. Eksisterende adgang blev brugt; intet køb, topup, API-nøgle eller nyt abonnement. Modelscorer er syntetisk tekstklassifikation.

Originale PNG'er bevares under den lokale, ignorerede `reference/exam-native/` og på billedværktøjets oprindelige gemmesti. Lossless WebP er uafhængigt afkodet og sammenlignet med native RGB-pixels; metadata indeholder aktuelle dimensioner, kilde-/runtime-SHA og byteantal. De81 udvalgte originaler fylder207.890.838bytes; de81 runtimebilleder137.781.612bytes, altså70.109.226bytes mindre med identiske RGB-pixels. Billedgaten afviser manglende/ændrede/eksterne filer, ændrede spørgsmål, opfundne pixelhashes og overskydende produktionsbilleder. En ren Git-klon indeholder ikke de ignorerede originaler og kan derfor ikke køre den lokale native-probe uden dem.

Fuld undervisningsbog, alle detaljerede delmål, kvalificeret tekst-/billedgodkendelse, subjektiv lytning til alle klip, menneskelig læringsgevinst, markedsplacering og fysisk device-kampagne udestår. Billederne er agentkontrolleret prototypekunst; de dokumenterer ingen officiel teoriprøve eller real-world hastighed/afstand.
