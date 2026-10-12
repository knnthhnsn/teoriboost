# Review af mikrolektioner B

Kontrolleret 12. oktober 2026. Leverancen omfatter 32 sektioner i `grundregler`, `kryds`, `vejmanoevrer`, `risiko-teknik` og `koerekort`: 96 kort, 32 cases og 32 forståelsesspørgsmål.

## Kildegrundlag

- [Undervisningsplan for kategori B, version 1.1, maj 2026](https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf): læringsmål, handlinger, risikoforståelse og praktiske øvelser.
- [Færdselsloven, LBK nr. 118 af 12. januar 2026](https://www.retsinformation.dk/eli/lta/2026/118): blandt andet grundregel, uheld, standsning/parkering, sele og alkohol.
- [BEK nr. 731 af 20. august 2026](https://www.retsinformation.dk/eli/lta/2026/731): modulforløb, minimumslektioner og rammer for selvstudie.
- [Kørekortbekendtgørelsen, BEK nr. 718 af 19. august 2026](https://www.retsinformation.dk/eli/lta/2026/718): 17-årsordningen.
- [Bekendtgørelse om vejafmærkning, BEK nr. 425 af 13. april 2023](https://www.retsinformation.dk/eli/lta/2023/425): B 11, B 13, E 51, letbaneafmærkning og signaler.
- Færdselsstyrelsens aktuelle sider om [køreprøven](https://www.fstyr.dk/privat/koerekort/proever/koereproeve), [kørekort til bil](https://www.fstyr.dk/privat/koerekort/dit-foerste-koerekort/koerekort-til-bil), [17-årige](https://www.fstyr.dk/privat/koerekort/dit-foerste-koerekort/koerekort-til-17-aarige) og [moderniseret køreuddannelse](https://www.fstyr.dk/erhverv/koereskoler-og-koerelaerere/moderniseret-koereuddannelse).

## Særlige kontrolpunkter

| Emne | Kontrolleret formulering |
|---|---|
| B 11 og B 13 | B 11/hajtænder kræver ikke i sig selv fuldt stop. B 13 kræver fuld standsning ved stoplinjen, hvorefter den ubetingede vigepligt stadig gælder. |
| Parkering | Skellet mellem standsning og parkering er forklaret; 10 meter fra vejkryds og 5 meter før fodgængerfelt bruges kun med konkret locator til plan 7.18.5 og færdselslovens §§ 28-29. |
| Letbane | Togets bundne spor og lange bremselængde, særskilte X 19-signaler og planens betingelse for fysisk letbaneundervisning er skilt ad. |
| 17-årige | Solo i Danmark kl. 05.00-20.00; ledsager kl. 20.00-05.00; ledsager mindst 24 år med mindst fem års gyldigt dansk/færøsk B-kørekort og uden frakendelse de seneste fem år. |
| Nye bilister | Den lave alkoholgrænse gælder de første tre år efter første kategori B-kørekort uanset alder: over 0,20 promille eller over 0,10 mg/l udåndingsluft. Praktisk råd er ingen alkohol før kørsel. |
| Forløb og prøve | Mindst 30 teori- og 24 praktiske lektioner; selvstudie tæller kun inden for bekendtgørelsens rammer. Teoriprøven beskrives som fysisk fremmøde, 25 situationer, fire udsagn, 25 minutter og højst fem fejl. |

## Maskinel kontrol

- JSON kan parses.
- Præcis 32 unikke `sectionId`-værdier matcher alle aktuelle sektioner i de fem kapitler i `dist/content.js`; ingen mangler eller ekstra id'er.
- Hver lektion har præcis tre kort. Alle 96 korttekster er 30-55 ord, og alle cases er 40-65 ord målt som blanktegnsadskilte ord.
- Alle `sourceIds` findes i den aktuelle `SOURCES`-liste. Alle kort og cases har en konkret `sourceLocator`.

## Afgrænsning

Materialet uddyber de 32 eksisterende sektioner, men dokumenterer ikke fuld dækning af hele undervisningsplanen og gør ikke en elev prøve- eller køreklar. Praktiske noter markerer områder, hvor fysisk undervisning med kørelærer, på manøvrebane eller på køreteknisk anlæg er nødvendig. Regler og myndighedssider bør genkontrolleres ved lovændringer og efter overgangsperioden for den moderniserede uddannelse. Der er ikke udført visuel, browser- eller elevtest af denne researchleverance.
