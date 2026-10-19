# Knur – karakterspec

Knur er en stiliseret rød knurhane (*Chelidonichthys lucerna*) fra Kattegat. Han har et ansigt som en streng hovmester og en krop som en romantiker. Ansigtet benægter alt, men de to vifte-vinger afslører alt, og komikken kommer altid fra kontrasten mellem ansigt og vinger. Intet i figuren handler om trafik, køretøjer, skilte, lygter, rat, kort eller skole.

Filer i mappen:

| Fil | Indhold |
|---|---|
| `hero.svg` | Præsentationsposen: hovmester på tæerne med den ene vinge sneget halvt op |
| `idle.svg`, `thinking.svg`, `correct.svg`, `wrong.svg`, `nervous.svg`, `passed.svg` | De seks tilstande i appen |
| `icon.svg` | Ekstra fil: ikonvarianten med viften helt åben og uden fingre, kam og krop |
| `sheet.png` | Kontaktark med lys og mørk baggrund, sort silhuet og test i 32 og 64 px |
| `src/` | Den parametriske model, som alle SVG-filerne er bygget ud fra (se sidst) |

Alle SVG-filer har `viewBox="0 0 400 400"`, ingen width/height og gennemsigtig baggrund. Alle id'er har præfikset `knur-<pose>-`. Filerne bruger kun `path`, `circle`, `ellipse`, `g`, `clipPath` og ét `feGaussianBlur`-filter til jordskyggen. Der er ingen tekst, billeder, CSS eller scripts.

---

## 1. Konstruktion

Enheden er hovedbredden **W = 1,0**. I modellen er W = 112 enheder, og hele figuren skaleres med 1,12, så hovedet er ca. 125 px bredt i 400-boksen. Skalaen er den samme i alle seks poser, så figuren ikke hopper i størrelse mellem tilstandene. Kun `icon.svg` er skaleret anderledes (1,04).

Vinklen er låst: næsten frontal, drejet ca. 15° mod beskuerens højre. Den nære side er beskuerens venstre. Kroppen og halen anes bag hovedet og krøller op i venstre side.

| Del | Primærform | Mål (W) | Noter |
|---|---|---|---|
| Hoved | Stumpt trapez/kile med afskårne pandehjørner (skrånende pande) | 1,0 bred foroven, ca. 0,78 ved mundlinjen, ca. 0,9 høj | Hårde, lige sider. Bunden er to runde knopper med et lille hak: den todelte snudespids. Ingen runde blob-former. |
| Facetter | 3 plane skygger i #B8402B | – | (1) Fjern kind: en bred mørk flade langs højre side med en diagonal kindlinje ned mod mundvigen. (2) Nær kindlinje: en smal diagonal streg under venstre øje. (3) Kæbens underside under munden. |
| Brynplader | Flad, tung plade med afrundede hjørner (#B8402B og en mørkere underkant) | ca. 0,46 × 0,16 (nær), 0,41 × 0,16 (fjern) | Dækker som standard øjets øverste halvdel. Pladerne kan vippe og løftes hver for sig. Det er dem, der bærer skuespillet. |
| Øjne | Ellipse i lys creme med blækpupil og et lille lyspunkt | ca. 0,23 (nær), 0,21 bred (fjern, forkortet af drejningen) | Højt på kilen, i en mørkerød øjenhule. Aldrig store Pixar-øjne. Plade og øjenlåg lægger en varm skygge på øjeæblet. |
| Mund | Én blækstreg, 4 enheder tyk | ca. 0,58 bred | Ligger i hovedets nederste kant og er en anelse nedadvendt. Den højre mundvig kan krølle op (`smile` 0–1). Det fulde, åbne smil bruges kun i `passed`. |
| Krop | Tilspidset dråbe langs en kubisk kurve | bredde 0,75 → 0,14, synlig længde ca. 0,9 | Kommer frem bag hovedets venstre side og krøller op. Fersken bug på ydersiden og en mørk rygside på indersiden giver volumen. |
| Hale | Lille kløvet halefinne med to runde lobber og et V-hak | ca. 0,27 | Sidder for enden af krøllen. Øverste lobe er lys, nederste skygget, med to stråler pr. lobe. |
| Kam | 7 korte, afrundede pigge i én række: 4 på hovedet og 3 på ryggen, forbundet med en finne | 0,11–0,14 | Foldet: 32 % højde og vippet 46° bagud. Rejst: fuld højde. |
| Vinger | Halvcirkel-vifte med 9 stråler | radius 1,2 W helt åben | Strålelængden aftager mod de nederste stråler. Kanten er takket og blå, og der er en klynge på 5 blå prikker ved roden. Den fjerne vinge er presset til 92 % i bredden på grund af drejningen. |
| Foldet vinge | Lukket vifte: strålerne samlet til et smalt blad | samme radius | I `idle` og `hero` krydses de under hagen som korslagte arme og tegnes foran hovedet. |
| Fingre | 3 + 3 buttede stumper med runde spidser og ingen led | 0,14 (0,15 på tæer) | Sidder under hovedet. Den midterste i hver gruppe er mørk rød, fordi den står bagved. |

**Silhuet:** Et stumpt, trekantet hoved sat ind i en bred, takket vifte, med en kløvet halekrølle i venstre side som andet kendetegn. Viften gør figuren genkendelig ved 32 px. Ikonvarianten (`icon.svg`) er kun hoved og vifte.

## 2. Palet og placering

| Farve | Hex | Bruges til |
|---|---|---|
| Knurrød | `#E2553A` | Hoved, krop, hale, kam, fingre og øjenlåg |
| Skyggerød | `#B8402B` (+ `#9A3324` til pladekanter og halestråler) | Hovedets 3 facetter, brynplader, øjenhuler, kroppens rygside og den nederste halelobe |
| Vingeturkis | `#1A9483` (+ lysere `#3AB39D` til strålebånd) | Viftefeltet. De lysere, overlappende strålebånd giver gennemskinnelighed. |
| Elektrisk blå | `#4F7CFF` (+ `#B4C8FF` til glimt) | Den takkede viftekant, rodprikkerne, knurre-bobler, tappestreger og vibrationsbuer |
| Bugfersken | `#FFD2B3` (+ sand `#EFB28A`) | Bug, lille kindglans, skaller og sandskyer |
| Dybblæk | `#1E1B36` | Pupiller, mund, glade øjenbuer og strålelinjer i vingerne (50 % over turkis). Jordskyggen er blæk med 20 % opacitet. |

Undgå: øjepletter med ring på vingerne, blå krop og lyserøde finner.

## 3. Lys og skygge

- Flad vektor uden gradienter. Lyset kommer oppefra til venstre.
- Hovedet er "hårdt": skyggen ligger kun som skarpe, plane facetter i #B8402B, og der er ingen glans. Den eneste lyse plet er den lille ferskenfarvede kindglans.
- Vingerne er "bløde": lysere, overlappende strålebånd og tynde blækstråler. Der, hvor den nære vinge dækker kroppen, har vingen effektivt 85 % opacitet, fordi kroppen er tegnet med 15 % oven på vingen inden for vingens omrids.
- Line treatment: Ingen konturer. Streger bruges kun til features (mund, glade øjne, strålelinjer, bobler og fx).
- Jordskyggen er en sløret ellipse. Den kan næsten ikke ses på mørk indigo, og det er bevidst.

## 4. Rive-rig

Navnene svarer til id'erne i SVG-filerne (`knur-<pose>-…`), så filerne kan importeres og bones lægges direkte på grupperne.

| Del | SVG-id | Bones / styring |
|---|---|---|
| Rod | `character` | Root bone ved fodpunktet (0, 58): lean, lift og hop |
| Jordskygge | `shadow` | Skaleres med lift |
| Hoved | `head` (indeholder `skull`, `facets`, `jaw`, `crest`, øjne, plader og mund) | 1 bone, pivot i halsen (0, 30). `pitch` løfter features og blotter mere af kæbens underside, når hagen løftes. |
| Kæbe/mund | `jaw`, `mouth` | Mund som morph: linje → mundvig op (smile 0–1) → åbent smil (separat form i `passed`) |
| Øjne ×2 | `eye-L`, `eye-R` | Pupil-translation inden for clip |
| Øjenlåg ×2 | `lid-L`, `lid-R` | Skaleres i y (0–1). Blink og halvt lukket. |
| Brynplader ×2 | `brow-L`, `brow-R` | 1 bone hver: rotation ±14° og løft −6…+4. Hovedværktøjet til skuespil. |
| Kam | `crest` (hoved) og ryggens pigge i `body` | Ét fold-bone (0 = foldet, 1 = rejst) og en lille fjeder pr. pig |
| Krop | `body` | Kæde med 3–4 bones langs kurven, så krøllen kan strammes og løsnes |
| Hale | `tail` | 1 bone for enden af kæden (tailRot) |
| Vinge V/H | `wing-L`, `wing-R` | Rod-bone med 9 stråle-bones og kantpunkterne vægtet til nærmeste stråler. Spredningen (a0→a1) styrer foldet/åben. |
| Fingre ×6 | `finger-1` … `finger-6` | 1 bone hver: lift og rotation til trommen |
| Knurre-boble | (fx-grupper i `idle`, `nervous`) | Partikel: stiger, wobbler og popper |

**Tegnerækkefølge (draw order) skifter mellem tilstande:**

| Tilstand | Rækkefølge |
|---|---|
| Normal | fjern vinge → krop/hale → nær vinge (85 % over kroppen) → fingre → hoved |
| Korslagt (`idle`, venstre vinge i `hero`) | vingerne tegnes efter hovedet |
| Tæppe (`nervous`) | vingerne tegnes efter hovedet |

I Rive løses det med en draw-order-nøgle pr. tilstand.

## 5. Poser – hvad ændrer sig

Alle poser bruger samme model og samme 15°-vinkel. Kun pose og udtryk ændrer sig.

| Pose | Krop og holdning | Vinger (signatur) | Ansigt | Kam og fingre | FX |
|---|---|---|---|---|---|
| **hero** | På tæerne, læner 8° bagud, hagen hævet (pitch 4), halekrøllen spændt op | Venstre: foldet og krydset under hagen som en korslagt arm. Højre: sneget halvt op og dirrer. | Plader halvt nede, blikket ned langs næsen, munden en lige streg | Kam halvt rejst, fingre 0,15 | Vibrationsbuer ved højre viftes kant |
| **idle** | Sat ned og afslappet, krøllen blød | Begge foldet stramt og krydset under hagen. En vingespids trækker sig. | Øjne halvt lukkede, venstre mundvig næsten oppe (0,3) | Kam foldet, én finger trommer | 3 knurre-bobler, tappestreger og en lille bue ved vingespidsen |
| **thinking** | Læner 5° mod spørgsmålet (højre), hovedet på skrå, halen krøller som et spørgsmålstegn | Halvåbne og i forskellige højder, som en vægt der vipper | Venstre plade sænket, højre løftet, blikket op og til højre, munden skubbet til siden | Kam halvt rejst, to fingre trommer efter hinanden | Tappestreger |
| **correct** | Rejser sig på tæerne, halen spændt op (gemt bag viften) | Helt åbne ca. 176°-vifter med et glimt langs den blå kant | Knivskarpt deadpan, højre mundvig taber kampen mod smilet (0,9) | Kam helt oppe, fingre 0,15 | Gnister ved viftekanten |
| **wrong** | Læner 4° mod det rigtige svar, hovedet blødt på skrå | Højre strækker sig ud som en arm og peger. Venstre er foldet ned i et roligt skuldertræk. Farverne bliver aldrig matte. | Plader bløde og vippede (indre ender løftet), blikket mod svaret, et lille opmuntrende smil | Kam halvt nede, to fingre klapper ("igen") | Tappestreger ×2 |
| **nervous** | Sunket lidt ned, halen krøllet tæt | Svøbt foran ham som et tæppe, så kun øjnene kigger frem over den blå kant | Plader løftet og bekymrede, små pupiller, munden presset sammen (skjult) | Kam helt foldet, fingre tapper hurtigt | Knurre-bobler stiger op |
| **passed** | Løftet fri af bunden, læner 12° i et svømmetag | Spredt i et asymmetrisk tag: den ene op, den anden nedad | Første ægte, fulde smil, glade øjenbuer, pladerne højt oppe | Kam helt oppe, fingre spredt | Loop-spor af sandskyer, og skallerne vælter ud fra vingefolderne (én pr. lektion) |

Efter `passed` lander han og tørrer ansigtet tilbage til deadpan: "Det ku' ha' været værre. Meget værre." Det er bare `correct`-ansigtet med vingerne foldet.

## 6. Kendte svagheder og næste skridt

- Hovedet er bevidst et blødt trapez, men i frontale poser kan det stadig læses som en "kasse med ansigt". Næste skridt er at prøve en lidt stærkere tilspidsning mod snuden eller en tydeligere pandeflade og teste det på brugere.
- Skalaen er låst til den helt åbne vifte. Derfor fylder de kompakte poser (`idle`, `nervous`) kun ca. 40 % af boksen og bliver små ved 32 px. Ved 32 px er det viftepositionerne og `icon.svg`, der bærer genkendeligheden.
- Den foldede vinge kan læses som en fjer eller pind, når den står alene (`hero`). Den virker bedst krydset (`idle`).
- Halen er skjult i `correct` og `passed`, og kroppen anes kun gennem den nære vinge.
- Jordskyggen forsvinder på mørk baggrund.

## 7. Kilde

Filerne er skrevet af en lille parametrisk model i `src/`. Den samme hoved-, vinge-, krops- og fingergeometri bruges i alle poser, og kun posetabellen ændrer sig. Det sikrer, at figuren er on-model.

```
node docs/redesign/characters-v2/knur/src/gen-knur.cjs docs/redesign/characters-v2/knur
node docs/redesign/tools/render-sheet.cjs docs/redesign/characters-v2/knur
```

Proportioner og farver ændres i `gen-knur.cjs`, og poser ændres i `poses.cjs`.
