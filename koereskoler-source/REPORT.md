# Køreskoler: kort og SEO-sektion til teoriboost.dk

Status 11. nov. 2026. Intet er deployet, committet eller sendt. Sektionen er klar til gennemsyn, ikke til udgivelse.

## Hvad der er bygget
- `node build.mjs` genererer hele `site/koereskoler/` (117 sider). Før: `node scripts/prepare-data.mjs` (bygger `data/schools.json` fra cachede råfiler, henter intet).
- Kortside `/koereskoler/` (MapLibre + OpenFreeMap, indlæses først efter tryk/interaktion, clusters, liste synkroniseret med kort, "find nær mig" først ved tryk, liste uden JS).
- 101 kommuner: 14 indekserbare områdesider, 87 `noindex` (kun OSM-/CVR-navne, ingen verificeret skole).
- 16 skolesider (alle indekserbare). `sitemap.xml` har 31 URL'er (kort + 14 områder + 16 skoler).

## Tal
| Emne | Antal |
|---|---|
| OSM-objekter (amenity=driving_school, DK) | 157 |
| Udeladt (unavngivet, bane/akademi, mulig lukning) | 16 |
| Dubletter slået sammen (CVR) | 1 |
| Skoler i data | 140 |
| Med skolens egen adresse, tlf, hjemmeside, kategorier (verificeret) | 17 |
| Med egen side | 16 (Renés Køreskole, Esbjerg, mangler side: adressen gav intet geokodningstræk) |
| Skoler med kommune og region | 140 |
| Datakonflikter markeret | 6 |

**Dækning: 140 skoler er et OSM-udsnit, ikke alle danske køreskoler.** Siden siger det selv. CVR 855300 kræver Datafordeler-nøgle (ikke brugt). DAWA er lukket 1. okt. 2026.

## Gennemgang af Codex' arbejde
- Beholdt: datamodel (kilde + dato pr. felt), indsamling, `build.mjs`, `check.mjs`, designcheck, tekster. Tonen er ærlig og konkret.
- Fundet og rettet: (1) `schools.json` var forældet: 9 verificerede skoler havde ingen side og 62 ingen kommune. Kørsel af `prepare-data.mjs` på de cachede filer rettede det (8 til 16 sider, 0 ukendte kommuner). (2) Slugs `aarhu`, `rander`, `norddjur`, `taarnby` (afskåret s). (3) Kortet var 0 px højt (MapLibres CSS overstyrede positionen), så det blev aldrig tegnet. (4) Overflow ved 320 px (353 px). (5) MapLibre-CSS havde farver uden for manualen (66 fund), nu omfarvet. (6) `build.mjs` rydder nu `site/koereskoler` først.
- Stikprøve (27 skoler): alle 17 verificerede kontrolleret mod gemt tekst fra skolens egen side: adresse, telefon og CVR findes for alle; fuldt navn står ordret på siden for 15 (Amager Køreskole og Dinesen Trafikskole staves anderledes på siden) (`qa/evidence-audit.json`). Desuden 10 OSM-only skoler kontrolleret mod rå OSM-data: navn, koordinater og CVR stemmer, og vi påstår intet andet (`qa/osm-sample-audit.json`).
- Licenser: OSM/ODbL (attribution på siden, `schools.json` kan hentes), OpenFreeMap-fliser (ingen nøgle), Nominatim (cachet, 1 kald/sek, 17 opslag). Skolernes egne sider: kun forretningsfakta, al tekst nyskrevet. Færdselsstyrelsen: kun faktapunkter (prøvested) i egne ord med kildelink, ingen generel genbrugslicens fundet.
- Persondata: kun navn, adresse, telefon, hjemmeside, kategorier, CVR som skolen selv offentliggør. Stavtrup m.fl. angiver et nummer, der er mærket Mobil, fordi skolen selv bruger det som kontakt. Se beslutning 2.

## Kontroller (`qa/`)
- `static-check.json`: PASS, 0 fejl, 46 advarsler, alle "under 35 ord unikt indhold": 32 noindex-områdesider og 14 af de 16 skolesider. Skolesiderne er ~370 ord i alt, men det meste er skabelon og spørgsmål. Det unikke er få linjer fra skolens egen side. Det er tyndt, 0 næsten-dubletter. Kolding/Vejle ligner hinanden (0,83), begge `noindex`.
- `design-check.json`: PASS (ingen emojis, pile, nullede ordenstal, sidestriber eller farver uden for manualen).
- `final/`: skærmbilleder ved 320/390/768/1440 px af kortside, Aarhus, Silkeborg, Esbjerg, Kvik Trafik, Pers, Stavtrup og Jakobs. Intet horisontalt overflow, ingen sidefejl, kortet tegner.
- Tap-mål: kun logoet i fælles header er under 44 px (28/34 px, samme som live-sitet).

## Ikke verificeret
- HTML er ikke valideret med Nu/W3C, JSON-LD kun for syntaks og type-navne, ikke Googles rich-result-test.
- Ingen ekstern link-tjek, ingen kontrast-måling pr. element, kun visuelt gennemset.
- Mobilvisning og kortets tegning er set i headless Chromium med softwarerender, ikke på rigtig telefon.
- Åbningstider, priser, sprog, kvalitet er bevidst ikke med.
- 123 skoler har ingen verificeret adresse. "Odense Manøvrebane" og "Citybane" ligner baner, ikke skoler, og bør vurderes. Kategori- og sprogfiltre er ikke bygget, fordi dækningen er 17 af 140.
- Photon (komoot) bruges til adresseforslag ved tryk på Søg; vilkår for produktion er ikke afklaret.

## Beslutninger til Kenneth
1. Kontaktadresse til rettelser: Besluttet: kontakt@teoriboost.dk (indsat 11. nov.).
2. Skal enkeltmandsskoler have egen side, og må telefonnumre, der ser ud som mobilnumre, vises? Nu: ja, når skolen selv offentliggør dem som kontakt. Jeg har ikke talt hvor mange der er mobil.
3. Indeksér de 16 skolesider nu, eller sæt dem på `noindex`, til de har mere eget indhold?
4. Skal uverificerede skoler vises som præcist OSM-punkt? Enkeltmandsskoler kan ligge på en privat bolig. Alternativ: kun by-niveau.
5. Udgivelse: vil du udgive som "foreløbigt udsnit" (140 skoler) eller først udvide dækningen (kræver CVR-nøgle eller anden kilde)?
6. Photon eller kun lokale forslag.

## Genbyg
```
node scripts/prepare-data.mjs
node build.mjs
node serve.mjs            # http://127.0.0.1:4197/koereskoler/
node scripts/check.mjs
node scripts/audit-evidence.mjs > qa/evidence-audit.json
node scripts/visual-qa.mjs
```
Udgiv aldrig `data/raw/` og `data/review/`. `site/` kræver også sitets egne rod-filer (serve.mjs læser dem fra referencekopien).

## Tillæg 11. nov.: CVR-udtræk (branche 855300), nu bygget ind
Hentet med Kenneths Datafordeler-API-nøgle (læst fra miljøvariablen, aldrig gemt) via `scripts/fetch-cvr.mjs` mod `CVR/v2`. Licens CC BY 4.0, kreditering "Det Centrale Virksomhedsregister (CVR)" står i kildepanelet og på områdesider. Råfiler: `data/raw/cvr-*.json`. Normalisering: `scripts/prepare-cvr.mjs` giver `data/cvr-units.json`. Geokodning: `scripts/geocode-cvr.mjs` (Nominatim, cachet).

Privatlivsregel (Kenneths valg 11. nov.): fuld adresse og kortprik kun for aktive selskaber (ApS, A/S, I/S, K/S, IVS, a.m.b.a. m.fl.), der IKKE er reklamebeskyttede. Alle andre (reklamebeskyttede, enkeltmandsvirksomheder) vises kun med navn og kommune, uden vej og uden prik. Tilføjelsen "v/ <personnavn>" er fjernet fra navne.

| Emne | Antal |
|---|---|
| Enheder med branche 855300 | 4.437 |
| Aktive virksomheder, unikke CVR (efter fravalg af FDM, myndigheder m.fl. ved navn) | 2.170 |
| Reklamebeskyttede i aktive (før navnefilter) | 1.426 |
| Aktive selskaber uden reklamebeskyttelse = fuld adresse | 137 |
| Af dem allerede i OSM-data | 0 (23 OSM-skoler matcher et CVR-nr. i øvrigt) |
| Fuld adresse geokodet og nu med prik på kortet | 137 af 137 |
| Kun navn og kommune, vist på kommuneside | 2.010 |
| Kort-poster i alt (OSM + CVR) | 277 |
| Kommunesider i alt | 101 (14 af dem indekserbare) |

Viser i listen/kortet som "Adresse fra CVR". Kommunesider har et afsnit "Flere registrerede virksomheder" med navneliste.
Alle nye CVR-kommunesider er `noindex`. De indekseres først, når Kenneth beslutter det.

Ikke verificeret og opmærksomhedspunkter:
- 2.170 er ikke "antal køreskoler": branchekoden rummer også enheder, der ikke underviser (fx baner, firmaer med flere formål). CVR siger intet om kategorier, telefon, hjemmeside.
- Mange navne uden selskabsform er personnavne (enkeltmandsvirksomheder, fx "John A. Aarup"). Kenneth har valgt navn og kommune. Overvej "kun antal pr. kommune" i stedet, hvis det virker for tæt på persondata.
- Geokodningen er ét Nominatim-træf pr. adresse og ikke manuelt kontrolleret (alle ligger i Danmark).
- Kun vejadresse og postnummer fra CVR bruges; "beliggenhedsadresse" kan stadig være en privat adresse for et selskab uden reklamebeskyttelse.
- DAWA er lukket; adressesøgning på siden bruger stadig Photon (beslutning 6).

