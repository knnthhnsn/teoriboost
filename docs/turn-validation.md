# Trafiklab: validering, 16. oktober 2026

“Et blink. To baner.” er et fungerende, afgrænset kvalitetsforløb til højresving over en cykelsti. Åbn `#trafiklab`. Det skal afprøves fagligt og med elever, før samme løsning udbredes til hele appen. Cirka tre minutter er en designmålsætning; faktisk elevtid og læring er ikke målt.

## Hvad der er ændret

Eleven undersøger højresiden, udpeger cyklisten i billedet eller vælger et tilgængeligt tekstalternativ, beslutter en handling og ser konsekvensen. En usikker handling fryses før kontakt og udløser målrettet genøvelse. Derefter følger en indkørsel over en gennemgående cykelsti og en kontrast, hvor cyklisten er forbi: Eleven skal også kunne vælge at køre efter fornyet orientering, når svinget er frit. Et eget formuleret svar vises først sammen med reglen efter elevens handling. Selvtjek er tydeligt mærket som selvrapport; ingen AI bedømmer det.

Første svar, udpegningsmetode, svarlatenstid, rettelser og gennemførelse gemmes særskilt. Svarlatenstid er ikke et mål for øjenbevægelser. En ny T-krydsvariant åbner syv dage efter den oprindelige gennemførelse. Appens gennemførelse og selvtjek udløser ingen påstand om beherskelse eller prøveparathed. Den eksisterende transparente hjernemaskot bruges ved afslutning med humor slået til; trafikscenen holdes fri for den. Jeppe oplæser efter elevens tryk, og bevægelse kan slås fra.

## Fagligt grundlag og indholdsdækning

Den officielle kategori B-plan, version 1.1 maj 2026, er kontrolleret byte for byte mod myndighedens aktuelle PDF. Scenens syv præcise ankre findes i `authoring/turn-lesson-map.json`. Færdselslovens §26 stk.6, 2. og 5. pkt., jf. §17 stk.1 og §16 stk.2, understøtter indkørselsvarianten. Kildekontrol er foretaget; kvalificeret kørelærergennemgang og juridisk fagpersonsgodkendelse er ikke foretaget.

`authoring/curriculum-coverage.json` inventerer 1.902 nummererede mål i 206 detaljerede afsnit. 318 har en præcis referencekandidat, 729 en mulig sproglig delkobling, 764 kun en bred afsnitskobling, og 91 ingen kortlagt kandidat. Hvert mål har kilde, forklarings-, scenarie-, facit- og valideringsfelter eller eksplicit manglende værdi. **Tallene er kandidater til gennemgang, ikke verificeret pensumdækning.** Praktiske mål kan ikke opfyldes af appen alene. Genberegning: `node scripts/curriculum-build.mjs`.

## Kontroller og fund

- 115 automatiske tests består. Den fulde bygkontrol verificerer 1.252 lydfiler og 135 lokale runtime-filer; ingen nye eksterne runtime-afhængigheder. `node --test --test-reporter=dot tests/*.test.mjs` og `npm.cmd run build`.
- Geometrien kontrolleres med orienterede kropsrektangler, ikke kun afstand mellem centre. Denne kontrol fandt overlap i en tidligere usikker slutpose; frysepunktet blev flyttet tidligere. Syv scenetests dækker kontaktfri baner, kameraramme, statisk tilstand, fallback og replay-API.
- Faktisk browsergennemgang i Chromium med telefonbredder 390 og 320 px: billedudpegning, tekstvalg med Enter, korrekt vej, alle fejl/genøvelser, indkørselsvariant, fri-bane-kontrast, genkaldelse, resultat og genindlæsning. Bredden oversteg ikke skærmen i de kontrollerede trin. En skrevet kladde overlevede genindlæsning, og første fejl forblev synlige efter rettelse.
- Mobilgennemgangen fandt en bil uden for overblikskameraet. Kameraet indrammer nu bil, cyklist og konfliktsted samlet; det viste resultat er kontrolleret efter rettelsen. Kameraskift kunne også nulstille replay. Samme værdi er nu en reel ingen-ændring i begge renderere, og et faktisk kameraskift under replay sluttede med aktiv Næste-knap.
- To faner er afprøvet: En gammel handling afvises efter et nyt forsøg i den anden fane. Historiktests bevarer oprindelig gennemførelse, seneste gyldige uge-test og aktuelt forsøg ved store merges. Overflødige hændelser komprimeres kun, hvis det fulde foldede resultat er identisk; den teoretiske undtagelse for tre irreducible forsøg over grænsen er dokumenteret i koden.
- De 17 aktuelle Trafiklab-klip har verificerede hashes og fuld MP3-afkodning. Et faktisk 6,888-sekunders klip afsluttede naturligt i browseren. Genstart, global lydafbrydelse og navigation blev kontrolleret. Rolig tilstand viser den undervisende slutpose straks. Hele kataloget er ikke lyttet igennem af et menneske.
- Uge-testen er gennemført med syntetiske datoer på en separat localhost-origin; oprindelig lagring blev gendannet bagefter. Den åbnede den nye variant og viste “Afprøvet i appen” efter gennemførelse. Det dokumenterer dato-/UI-mekanik, ikke menneskelig hukommelse efter en uge.

De 14 browserchecks og rå målinger findes i [turn-browser-qa.json](research/turn-browser-qa.json). Et firesekunders replay med kameraskift gav 19,4 ms til to animation frames, 7,0 ms p95-frameinterval og ingen observerede intervaller over 50 ms. Den eksisterende lektions Næste-kort gav 36,4 ms i én tilsvarende observation. Det er enkeltsamples på denne Windows-computer med emuleret mobilbredde og skærmens opdateringsfrekvens; ingen statistisk hastighedsgevinst, fysisk telefonmåling eller feltmålt INP påstås.

## Ekstern kritik og uafhængig efterprøvning

Teoriklar og britiske Safe Driving for Life blev gennemgået i faktiske gratis forløb; observationsgrænser og links findes i [konkurrentnotatet](competitor-flow-observations.md). Ingen konkurrentbilleder eller spørgsmål er kopieret.

Claude modtog ét faktisk telefonbillede og en beskrivelse. Kritikken førte til neutral bekræftelse af åbnet visning, reel billedudpegning, tydeligt selvrapporteret genkaldelse og fri-bane-kontrast. Forslag om at skjule cyklisten i mørke blev ikke indført uden faglig/elevmæssig begrundelse. Lovankeret er efterprøvet selvstændigt. [Rå kritik og closure](research/claude-turn-review.md).

Jev modtog ét billede og klassificerede bl.a. cyklistens læsbarhed til 0,98 og synlig primær handling til 0,91. Det var jev-1.13.0 og brugte eksisterende saldo. Det er afgrænset syntetisk billedtriage af den daværende åbning, ikke menneskelig accept, faglig godkendelse, lydreview eller dokumenteret læring. [Rå resultat](research/jev-turn-visual-triage.json).

## Udestående menneskelig validering

Den [forberedte elevprotokol](learner-pilot.md) sammenligner med den eksisterende sving-cykel-lektion. Samtykke, aktive kontrolgrupper, ukendte testsituationer, alvorlige misforståelser, tid ved sammenlignelig korrekthed, blind scoring og syvdages genkaldelse er beskrevet. Resultatarket er tomt. Kørelæreren skal først godkende facit, scener og rubric. Engagement registreres særskilt. Der foreligger ingen faktiske elevresultater, markedsplacering, ulykkesreduktion eller dokumentation for “Danmarks bedste”. Fysisk telefon, Safari, hjælpemiddelforløb med rigtige brugere og dansk udtalereview mangler også.

## Levering

Eksisterende ejerprivate Site og adgang bevares. Den præcise udgivelse og efterfølgende hostingkontrol rapporteres i leveringsnotatet; lokale checks ovenfor er ikke hostingbevis.
