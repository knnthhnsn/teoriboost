# Closure af Claudes øveprøvekritik

Claude fik to konkrete lokale screenshots: desktopprøven og billedviseren ved390px. Den havde ikke adgang til de øvrige 81 billeder, browserinteraktion eller lyd. Rå svaret er bevaret i `claude-exam-visual-review.txt`.

- Den opdigtede grønne “5 km”-tavle i q-010 er fjernet med billedværktøjet. Den nye native foto-version har ingen sådan tavle; den tekstligt givne tidligere afkørsel og næste afstand er bevaret i spørgsmålet. Billedtitlen er nu “Motorvejen foran bilen”. Der er ikke en påstand om, at et øjebliksbillede beviser en tidligere hændelse.
- Valgte prøvesvar har en neutral grå ramme/fyld og teksten “Rammen viser dit valg. Facit kommer efter aflevering.” Fire valg er kontrolleret i den faktiske browser med samme neutrale farve, ikke resultatfarve. Markering/bedømmelse styres stadig af den eksisterende prøvekerne.
- Agentens særskilte kilde-/tavlereview afdækkede yderligere fejl og gav konkrete rettelser. Alle konkrete fund er lukket på endelige native pixels, inklusive q-052-v4 og q-068-v4. Det er ikke en udvidelse af, hvad Claude selv så. Runtime-/udgivelseskontrol følges i `../exam-visual-status.md` og `../exam-photo-signage-review.md`.

Ingen original Claude-artifact er omskrevet af denne reviewrunde. Der er ikke indhentet menneskelig eller kørelærer-godkendelse.
