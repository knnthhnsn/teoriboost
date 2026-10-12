# Lukning af findings i lesson-depth-b

**Dato:** 2026-10-12  
**Omfang:** Rettelse af de 2 P1- og 4 P2-findings fra `lesson-depth-b-independent-review.md` samt tre angivne sprogfejl. Der er ikke ændret i `dist` eller i den oprindelige reviewfil.

## Lukkede findings

- **P1 — `nybilist`:** Begge locators for den skærpede alkoholgrænse i de første tre år peger nu på **Færdselsloven § 53, stk. 2** og Plan B 5.4.3. Den fejlagtige henvisning til § 54 er fjernet.
- **P1 — `sele-ansvar`:** Kravet om sikkerhedsudstyr til børn under 135 cm og førerens ansvar peger nu på **§ 80 a, stk. 1 og 6**. Kortet om ansvar for passagerer under 15 år skelner desuden mellem **§ 80, stk. 4** om sele og **§ 80 a, stk. 6** om børneudstyr.
- **P2 — `motorvej` / “Tilkørsel”:** Kortet beskriver nu både den indkørendes pligt til at tilpasse hastigheden og målbane-trafikkens pligt til om nødvendigt at sænke hastigheden. Det præciserer samtidig, at reglen ikke kræver et pludseligt eller uforsvarligt vognbaneskift. Locator er **Færdselsloven § 18, stk. 3; Plan B 7.16.4**.
- **P2 — `stop` / “Stop løser ikke vigepligten”:** B13-reglens ubetingede vigepligt er nu udtrykkeligt knyttet til kørende fra begge sider. Kontrollen af gående er beskrevet særskilt med henvisning til pligterne ved svingning og fodgængerfelt. Kilderne er udvidet med BEK 425 B13 og Færdselsloven §§ 3, 26 og 27.
- **P2 — `udrykning` / “Se hele situationen”:** “Blå blink og sirene” er erstattet af det korrekte **særligt lyd- eller lyssignal**, og locator er præciseret til Færdselsloven § 7, stk. 2.
- **P2 — `forloeb` / “Minimumslektioner”:** Minimumstallene peger nu præcist på **BEK 731 § 9, stk. 2**. Den uvedkommende henvisning til § 24 er fjernet. Casen om selvstudium peger nu på § 25.

## Sproglig lukning

- `stop`, card 3: “Standse igen” er rettet til “Stands igen”.
- `stop`, case: “spærrre” er rettet til “spærre”.
- `stop`, card 2: Den uklare formulering om “opholdet” er erstattet med, at der skal være plads til fremkørsel, uden at andre påvirkes.

## Kontrol

- JSON kan parses uden fejl.
- Banken indeholder fortsat **32 lektioner med 32 unikke sectionId**.
- Banken indeholder **96 cards**, og alle ligger mellem **30 og 55 ord** ved en enkel ordoptælling.
- De seks gamle fejlstrenge/locators (`§ 54`, `§§ 9 og 24`, upræcist `§ 7`, “spærrre”, “Standse igen” og “opholdet er stort”) forekommer ikke længere.
- Alle ændrede `sourceIds` findes i den nuværende `SOURCES`-bank.

## Afgrænsning

Lukningen dokumenterer de konkrete tekst- og kildeændringer. Den er ikke en påstand om fuld pensumdækning, praktisk færdighed, kørelærergodkendelse eller myndighedsgodkendelse. Praktiske manøvrer og kompetencer kræver fortsat fysisk undervisning og vurdering i det lovpligtige forløb.

## Root-opfølgning

Efter direkte kontrol i den offentlige Plan B version 1.1 er de to `nybilist`-locators korrigeret fra den ikke-eksisterende henvisning 5.4.3 til **Plan B 4.4.1, pkt. 5** (PDF-side 50, linje 1568-1569). Henvisningen til **Færdselsloven § 53, stk. 2** er bevaret.
