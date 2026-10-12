# Materialer og licenser

Appens danske tekst, quizscenarier, SVG-diagrammer, figurer og natteby er originale materialer skrevet og tegnet til dette projekt. Konceptet bygger videre på brugerens oprindelige Claude-HTML. Der er ikke valgt en offentlig open-source-licens for projektets egne materialer.

Følgende tredjepartsmaterialer er medleveret med deres licenstekster:

| Materiale | Anvendelse | Licensfil |
|---|---|---|
| Three.js r128 | 3D-rendering | `dist/assets/THREE-LICENSE.txt` — MIT |
| Barlow Condensed Bold | Overskrifter | `dist/assets/fonts/barlow-OFL.txt` — SIL Open Font License 1.1 |
| DM Sans Regular/Bold | Brødtekst | `dist/assets/fonts/dm-sans-OFL.txt` — SIL Open Font License 1.1 |
| IBM Plex Mono | Små metadata | `dist/assets/fonts/plex-OFL.txt` — SIL Open Font License 1.1 |

Licenserne skal bevares ved distribution af de relevante filer. Fontfilerne leveres uændrede; appens CSS bruger lokale familienavne til visning.

Myndighedskilderne er links og kildehenvisninger. Spørgsmålene og forklaringerne er selvstændige formuleringer. Konkurrentanalysen bygger på offentlige produktsider; ingen konkurrenters betalte spørgsmål, prøvebilleder, logoer eller appkode indgår i produktet.

## Dansk oplæsning

De medleverede MP3-filer bruger appens egne tekster med udtaleforklaringer af bl.a. km/t, ABS, ESC, promille og B13. De er produceret med Microsoft `da-DK-JeppeNeural` gennem det anonyme online-produktionsværktøj [edge-tts](https://github.com/rany2/edge-tts); der er ikke brugt API-nøgler, betaling eller top-ups. Appen kalder ikke dette værktøj eller en ekstern TTS-tjeneste. Værktøjets GPL-licens er ikke dokumentation for kommercielle rettigheder til Microsofts stemmeoutput. De rettigheder er endnu ikke afklaret; den aktuelle visning er fortsat ejerprivat.

En separat lokal prøve bruger Piper med `da_DK-talesyntese-medium`. Dens [modelkort](https://huggingface.co/rhasspy/piper-voices/raw/main/da/da_DK/talesyntese/medium/MODEL_CARD) beskriver et CC0-datasæt. Det er ikke den valgte stemme og hverken Piper-kode eller modelvægt indgår i `dist/`. Der er ikke valgt en offentlig licens til projektets lydfiler.

## Native cutout-billeder

De fem dekorative PNG-filer i `dist/assets/illustrations/` er originale AI-genererede materialer til dette projekt, produceret med det indbyggede imagegen-værktøj. Ingen konkurrenters figurer eller billeder er brugt som indsatser. Hele promptsættet og native SHA-256/alpha-proveniens er gemt i `authoring/art-prompts.json` og `authoring/art-manifest.json`. Der er fortsat ikke valgt en offentlig open-source-licens til projektets egne materialer.
