# Natkørsel — billeder uden baggrund

Fem originale billeder er genereret med det indbyggede imagegen-værktøj og `transparent_background: true`. Alle fem endelige PNG-filer er 1254×1254 RGBA, samlet 6.737.755 bytes. De gemte native pixels er bevaret uden beskæring, omskalering, omfarvning eller håndtegnet erstatning.

| Fil i dist/assets/illustrations/ | Rolle i appen |
|---|---|
| mads-nut.png | Møtrik-Mads i garagens introduktion og huskekrog efter svaret |
| natmobil.png | Mintgrøn bil ved indgangen til kørselsdemoen |
| koerelys-brain.png | Hjerne med kørelys i startkortets overskrift, missioner, fremgang og rene resultater |
| stop-receipt.png | Kvitteringsfigur efter et korrekt STOP-svar |
| omkamp-cone.png | Opmuntrende omkampsfigur ved fejl og blandede resultater |

De faktiske gemte appstier er `C:/Users/kenne/.codex/.chatgpt-projects/g-p-6acc308524108191851ab90d7b7cdefa/outputs/natkoersel/dist/assets/illustrations/` efterfulgt af filnavnet ovenfor. Hele promptsættet findes i `authoring/art-prompts.json`; native mål, alpha, filstørrelser og SHA-256 findes i `authoring/art-manifest.json`.

Billederne er dekorative med tom alt-tekst og uden klikfunktion. De har en kort entré og et lille hover-nik. Bevægelse fra og reduceret bevægelse fryser dem; brainrot fra skjuler de valgfrie figurer og bevarer faglig tekst og scores. Bilen er stadig synlig i rolig visning. Figurerne bruges ikke som afgørende trafikdiagrammer eller i aktive prøveopgaver.

## Faktisk kontrol

- Alle fem originale filer er fuldt afkodet med Pillow og kopieret med uændrede pixels. PNG/RGBA, dimensionsmetadata, hashes, alpha 0–255 og transparent område er kontrolleret. Svag native alpha langs kanter er bevaret; den er ikke thresholdet eller beskåret.
- Browseren viste alle fem på mørk, lys og ternet baggrund ved 180px og 48px. Ingen opaque baggrundsrektangler blev observeret.
- Faktisk lokal Brave-QA kontrollerede startknapper på 390×844, 360×800 og 320×720, figuren uden for vejscenen og skjult under spillet, garage før/efter svar, huskekrogens danske lyd, motion-off, rolig visning og reduceret bevægelse.
- En hel mission blev gennemført med svar fra vores egen bank: tre korrekte og én planlagt fejl, inklusive genkaldelse. Ingen PNG før de fire besvarelser; kvittering, kegle og hjerne viste de forventede feedbackroller. Resultatet var 3/4. Rolig tilstand bevarede scores og tekst.
- Claude modtog to faktiske skærmbilleder og fandt to P2-problemer. Hjernen er flyttet fra vejen til overskriften; omkampen er nu en 14px knap med mindst 44px højde, og kildehenvisninger er forstørret. Et lille overlap ved 320px blev også rettet og målt igen. Første korts ekstra kvitteringsfigur blev fjernet, fordi den pressede mobilkortets layout.
- 41 eksisterende automatiske tests består; indholds-/assetgaten kontrollerer 37 lokale runtimefiler plus 1.235 lydfiler. Billedgaten kræver det aktuelle native manifest og matchende reelle PNG-filer.

De rå browserobservationer står i `art-browser-qa.json`. Mislykkede/stale viewportoptagelser er ikke brugt som godkendelsesbevis; den endelige mobiloptagelse bruger et eksplicit viewport-klip. Billedfilerne selv er aldrig redigeret.

Jev har kun klassificeret vores QA-tekst, modtog nul billeder og udførte nul browserhandlinger. `docs/research/jev-art-triage.json` bevarer model 1.13.0, request `playground_1b9d79667f210f6469999a8621b38d60efa`, 945 input-/124 outputtokens. Scorerne var 0,11 for modtagne pixels, 0,90 for rapporteret fil/browser-QA og 0,03 for menneskelig lærings-/toneevidens. Valget var videre pensum og reel elevafprøvning, confidence 1 inden for de valgte alternativer. Det er syntetisk triage, ikke visuel eller menneskelig godkendelse. Kun eksisterende saldo blev brugt; intet køb eller top-up.

Fysisk telefon, Safari, autentificeret hosted visning og menneskelig vurdering af figurerne er endnu ikke kontrolleret. Den overordnede pensum-/faglige status er uændret.
