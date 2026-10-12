# Dansk oplæsning — 12. oktober 2026

Brugeren valgte den første prøvestemme, Microsoft `da-DK-JeppeNeural`. Appen har nu 1.235 deduplikerede danske AI-klip med 1.883 anvendelser i den aktuelle indholdsbank. Stemmen er forproduceret; appen henter kun lokale MP3-filer og sender ikke elevens svar eller tekst til en TTS-tjeneste.

## Adfærd

Oplæsningen starter på et klik på Lyt. Den samme aktive knap pauser og fortsætter. En anden knap starter en ny valideret kø. Den statiske kompakte bar har stop, start forfra og hastighederne 0,9×, 1×, 1,15× og 1,25×; standarden er 1×. Hele afskriften er visuelt skjult og tilgængelig for hjælpemidler. Den aktuelle synlige svarrække markeres, når dens klip læses. Navigation, spilsideskift, missionens vurdering og garagesvar stopper den gamle lyd. Oplæsning giver ingen XP eller automatisk besvarelse.

Spørgsmål og garagevalg oplæses i den rækkefølge, der faktisk vises. Facit og forklaringer har særskilte knapper, som først er tilgængelige ved åbnet forklaring eller efter besvarelse. Spillets fase 4 læser kun den faglige forklaring; den genererede humorvariant anvendes bevidst ikke dér, da den indeholder førerens tidligere fejlagtige undskyldning.

## Verifikation

- Den komplette pakke har 1.235 filer, 84.136.407 bytes og 13.914,672 sekunders samlet klipvarighed. Varigheden beskriver kataloget, ikke en elevs nødvendige tidsforbrug.
- Alle hashes, størrelser, streamformater (MP3, 24 kHz, mono), varigheder og fuld afkodning med FFmpeg `-xerror` er kontrolleret uden fejl. Rå rapport: `evidence/voice-media-qa.json`.
- `build` kræver komplet manifest og produktionsrapport, en aktuel katalogberegning og de tilsvarende reelle filer. Seks målrettede releasegatetests afviser bl.a. delvis pakke, manglende filer, tekstdrift, korrupte bytes, eksterne stier og produktionsrester. 14 afspillerchecks dækker bl.a. køovergange, forældede async-resultater, pause, stop, triggerrestaurering og hastighed.
- Separat read-only review har afprøvet 1.992 spørgsmålspermutationer, 102 garagepermutationer og 76 spilfase-/rækkefølgecases uden kataloghuller eller registreret facitlæk i før-svar-teksten. Se `voice-content-coverage.md`.
- Lokal Brave-browser har faktisk afspillet startguiden, garageforklaring og genkaldelse. Syv-klips garage- og ni-klips spørgsmålskøer er afsluttet naturligt; deres observerede filanmodninger matcher de synlige blandede valg. Samme Lyt-knaps pause/fortsæt, navigation, anden trigger, garagesvar, missionens vurdering og næste spørgsmål er kontrolleret. Spillets tekstvalg og hotspot samt et aktuelt spørgsmålsudsagn er markeret under afspilningen. Genstart efter naturlig afslutning er særskilt kontrolleret. 20 browserchecks består, med de rå metodeafgrænsninger i `voice-browser-qa.json`. Mobilpanelet ved 390×844 er statisk og 113,2px højt med fire 44px-kontroller i én række uden vandret overflow; desktopbaren er 75,6px og dækker ikke diagrammet.

## Afgrænsning og produktion

Filintegritet er ikke subjektiv stemmekvalitet. Ikke alle optagelser er lyttet igennem af et menneske, og ingen syntetisk Jev-klassifikation kan høre eller fagligt godkende dem. Fysisk telefon, Safari, danske udtalepræferencer og forståelse med faktiske elever udestår. Den ejerprivate hosting har endnu ikke browser-QA, fordi ejerens passkey kræves.

Claude modtog ét faktisk desktopbillede og fandt panel-overlap. Det er rettet og efterfølgende kontrolleret; kritik og closure er bevaret i `docs/research/`. Jev modtog kun vores tekst, nul billeder og nul lydfiler. Kørsel `playground_1b942d18469d6e3457491c82b03e2a3767b` (jev-1.13.0, 851 input-/148 outputtokens) gav 0,05 for modtaget lyd, 0,12 for direkte visuelt arbejde, 0,95 for rapporteret browserlyd og 0,05 for menneskelig stemme-/læringsevidens. Valget var videre pensum og menneskelig udtale-/transferreview med klassifikationsconfidence 1. Det rå input beskrev de daværende 40 tests; den efterfølgende genstartsrettelse løftede den faktiske suite til 41. Kun eksisterende månedlig saldo blev brugt.

Produktionen brugte `edge-tts` uden API-nøgle, betaling eller top-up. Det er en online produktionstjeneste; elevens app bruger den ikke. Kommercielle rettigheder til Microsoft-stemmeoutput er endnu ikke afklaret; se `LICENSES.md`. Den lokale Piper-prøve er bevaret som alternativ, men indgår ikke i den valgte pakke.

Katalog og originale tekster findes i `authoring/voice-catalog.json`; filmetadata og udtaletekster i `authoring/voice-production.json`. Genoptagelse bevarer verificerede cacheklip i manifestet og invaliderer dem ved ændret tekst, udtaletekst eller stemmeidentitet. Der er ingen system-/engelsk fallback. Manglende eller forældet lyd giver en synlig besked, mens den almindelige læsning fortsat er tilgængelig.
