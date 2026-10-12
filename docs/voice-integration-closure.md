# Voice integration closure

Dato: 2026-10-12

## P2 lukket i voice-komponenten

Mobilpanelet er nu almindeligt indhold (`position: static`) under 700 px. Transcriptet er begrænset til to linjer, typografien er 12–13 px, og pause, start forfra, stop og hastighed ligger i én række ved 390 px med mindst 44 px høje kontroller. Hastighedsteksten er visuelt skjult på mobil, mens selectens `aria-label` er bevaret.

Den lokale LYT-knap fungerer nu også som pause/fortsæt: et nyt klik på samme aktive trigger pauser en afspilning i `loading` eller `playing` og fortsætter fra `paused`. Et klik på en anden trigger starter fortsat en ny, valideret kø. Under aktiv afspilning viser triggeren `Pause oplæsning` eller `Fortsæt oplæsning`. Ved afslutning, fejl, stop eller triggerskift sættes de oprindelige DOM-noder og ARIA-attributter tilbage uden at ændre triggerens dataset eller eventbindinger.

Node-testene dækker toggle-adfærden, en fremmed trigger og præcis restaurering af node-identiteter, attributter og dataset. Dette er kode- og testverifikation; Root ejer den efterfølgende browserkontrol.

## P1 lukket af Root

`validate.mjs` genberegner kataloget fra de aktuelle læringstekster og kræver komplet status i både manifest og produktionsrapport. `voice-validation.mjs` afviser kataloghuller, ekstra klip, forældet tekst, ukorrekte eller eksterne stier, links, manglende filer, forkert størrelse/hash/varighed og ufærdige produktionsfiler. Seks målrettede releasegatetests består. Den komplette pakke på 1.235 klip består gaten. Alle klip er desuden probet og fuldt afkodet med FFmpeg uden fejl; dette dokumenterer filintegritet og ikke menneskelig lytning.
