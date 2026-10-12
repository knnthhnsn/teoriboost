# Closure: garage-roadworthy independent review

Kontrolleret 12. oktober 2026 mod Færdselsstyrelsens officielle [Undervisningsplan for kategori B, version 1.1, maj 2026](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf), især side 22-29 samt præstationskravene på side 11-13. Alle 14 findings i `garage-roadworthy-independent-review.md` er adresseret. Ingen findings er afvist.

## Findings og disposition

| Nr. | Prioritet | Finding | Disposition i `garage-roadworthy.json` |
|---:|:---:|---|---|
| 1 | P1 | Defekt bremsekreds var gjort usikker | **Rettet.** Objective `1.2.3.18` og recall siger nu entydigt, at pludseligt længere pedalvandring er tegn på en defekt bremsekreds, og `1.2.3.21` fastholder straks-eftersyn. |
| 2 | P1 | Tilladte ekstra lygter/reflekser var ufuldstændige | **Rettet.** Objective `1.2.4.11` er præciseret, og et nyt selvstændigt kort oplister ekstra fjernlys, kørelys, ekstra stop- og baglygter, tågeforlygter, baklygter, tågebaglygter, søge- og arbejdslygter, afmærknings- og markeringslygter, parkeringslygter, overhalingsblink samt de tre tilladte refleksplaceringer/farver. Parent-ref `1.2.4.11` er bevaret, fordi objective-sættet følger de nummererede mål. |
| 3 | P1 | Lygtepractical manglede konkrete kriterier | **Rettet.** Practical `Lygter og reflekser` er nu en femleddet kontrol med helhed/renhed, stoplys mod baglys, gult blink synligt i sollys, samlet havariblink og hvid nummerpladebelysning. |
| 4 | P2 | ABS manglede styremulighed og sensor-styreboks-kæde | **Rettet.** Objective og kort beskriver hjulfølere, elektronisk styreboks, trykregulering, pedalvibration og begrænset mulighed for samtidig styring og bremsning. |
| 5 | P2 | Kravet om ESC i nyere biler manglede | **Rettet.** Objective `1.2.2.4` og kortet om servo/ESC siger nu, at nyere biler skal have ESC, og beskriver det hjulvise indgreb især i sving. |
| 6 | P2 | One-pedal manglede mulighed for til-/frakobling | **Rettet.** Objective og kort siger nu, at funktionen på elbiler ofte kan slås til og fra, samt at utilstrækkelig regeneration kræver bremsepedalen. |
| 7 | P2 | Årsag til elbilers bremsevedligeholdelse var uden kildestøtte | **Rettet.** Forklaringen om mindre brug af mekaniske bremser er slettet. Kortet holder sig til planens krav om øget vedligeholdelsesopmærksomhed for effektiv funktion. |
| 8 | P2 | Eksempler på gears spring var udeladt | **Rettet.** Objective `1.2.6.9` og gearkortet medtager skift 2.-4. og 3.-5. som eksempler, afgrænset til en relevant manuelt gearet bil. |
| 9 | P2 | Plug-in-hybridkort havde udokumenteret vægtforklaring | **Rettet.** Sætningen om ekstra teknik og vægt er slettet; kortet beskriver kun kombinationen af motorer og betydningen af faktisk opladning. |
| 10 | P2 | Dækpractical indsnævrede alle hjul til fire | **Rettet.** Handlingen bruger nu "samtlige hjul på den konkrete bil" og bevarer 1,6 mm i hovedmønstret samt kontrol af dæk og fælge. |
| 11 | P2 | Dækcase brugte "ophæng" uden bærende refs | **Rettet.** Den korrekte option og begrundelse bruger nu dæktryk, hjulindstilling, bremser og støddæmpere, som bæres af `1.2.7.12`, `.13`, `.15`, `.17` og `.18`. |
| 12 | P2 | Særkrav blev gjort afhængige af dokumenter alene | **Rettet.** Kort og practical henviser nu til reglerne for den konkrete køretøjstype; dokumenter er kun støtte, hvor de faktisk indeholder relevante oplysninger. |
| 13 | P2 | Kamera/monitor-kort havde udokumenterede godkendelses- og funktionskrav | **Rettet.** Ordene "godkendte" og "brugbart udsyn" er fjernet. Kortet holder sig til `1.2.9.5`-`.7`: spejlkrav, renhed/skader og muligheden for kamera/monitor-erstatning. |
| 14 | P2 | Kildeidentitet manglede i metadata | **Rettet.** Topniveau har nu `"sourceRef": "Plan B"`. |

## Fysisk undervisningsgrænse

De gentagne sætninger om, at appen ikke kan godkende eller certificere, er fjernet fra de små practical-kort. Practical-teksterne er nu konkrete handlinger ved en bil med kørelærer og, hvor metoden afhænger af bilen, instruktionsbog eller fabrikantens anvisning. Sikkerhedsformuleringen om ikke at åbne et varmt kølesystem er bevaret.

JSON-filen indeholder ingen tick-, XP- eller bestået-status for fysisk kontrol. Den markerer de officielle mål med `requirement: "kontrollere"` og giver tilhørende praktiske instruktioner. Den prominente UI-etiket **Skal vises i bilen** og den endelige rendererintegration ejes og verificeres af root; dette closure-review er ikke browser-QA eller kørelærergodkendelse.

## Afsluttende validering

- JSON parser korrekt.
- 9 unikke topics og 133 objectives er bevaret.
- Alle objective-refs er unikke i deres topic og bruges af mindst ét læringselement.
- Alle refs fra cards, practical, case og recall findes blandt topicets objectives.
- 49 cards; hvert topic har 3-10 cards, og alle card-bodies er 30-65 ord.
- Alle 9 cases har tre muligheder og præcis ét korrekt svar.
- De rettede caseoptioner er fortsat omtrent længdebalancerede, og alle begrundelser er mindst 15 ord.
- `sourceRef` er `Plan B`; `checked` er fortsat `2026-10-12`.

Afgrænsningen er fortsat de ni underafsnit 1.2.1-1.2.7, 1.2.9 og 1.2.10. Der er ikke tilføjet nye objectives, og de øvrige authoring- eller researchfiler er ikke ændret.
