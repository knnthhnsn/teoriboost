# Tordis – karakterspec

Tordis er en tordensten: et 66 millioner år gammelt hjertesøpindsvin af flint fra Stevns Klint, der er vågnet op. Kroppen er en klippe, og krisen kører i øjnene. Hun hører ikke til trafik, skole eller køretøjer på nogen måde.

Filer: `hero.svg`, `idle.svg`, `thinking.svg`, `correct.svg`, `wrong.svg`, `nervous.svg`, `passed.svg` (viewBox 400×400, transparent baggrund) og `sheet.png` (kontaktark med lys og mørk baggrund, silhuet og 32/64 px).

Alle syv filer er bygget fra den samme parametriske rig, så konstruktion, proportioner og farver er identiske. Kun pose, udtryk og effekter skifter.

---

## 1. Konstruktion

**Enhed:** kropsbredde = 110. Origo ligger på jorden under kroppens midte, og y peger nedad. I SVG'en er 1 enhed = 1,95 px (samme skala i alle filer). Jordlinjen ligger på y = 356 px. Kun `passed` har jordlinjen på 372 px, fordi hun hopper og sender lynet opad.

| Del | Primær form | Mål (enheder) |
|---|---|---|
| Krop | Lavt kuppel-brød. Flad bund, kant der svajer ud, rund top (aldrig spids) | Bredde 110 ved kanten (±55,2 i y −14,6), 90 høj (bund y −10, top y −100). Siderne er næsten lodrette (±52,6) fra y −40 til −24 |
| Hjertehak | Hjerteform skåret ind i fronten forneden | 18 bredt, centrum (0, −31). Indvendig skygge forskudt (1,1 / 1,9) |
| Mund | Indridset streg i hakket, forskudt mod venstre | Standard: skævt smil fra x −7 til +2,9 med et lille knæk i højre mundvig |
| Øjne | Mørke ovaler med ét lysglimt | 12×15, centrum (±22, −50), dvs. lavtsiddende cirka 55 % nede fra toppen. Glimt r 1,8 øverst til venstre |
| Øjenlåg | Tungt låg i kropsfarve med mørk kant | Dækker 35 % som standard. Låget kan vippes (lidTilt) og bøje (sag). Der er også et nedre låg til det selvtilfredse blik |
| Bryn | Flade kridtplader | 16×6, centrum (±22, −62,5). Rotation og løft er uafhængige pr. side |
| Krone | 5 bladformede plader, alle hængslet i toppunktet (0, −96) | Hver 45 lang, rod 11–12, bredest 16 på midten, afrundet spids |
| Riller | 5 riller mellem pladerne | Planvinkler 36°, −36°, 115°, −115° og 180°. De løber fra radius 5 til 36 på kuplen |
| Arme | Flintpigge i en rund kridtknop | Knop Ø14 midt på siden (y −48). Piggen er 85 lang (overarm 38 + underarm 47) og spidser til fra 10 til 3 med afrundet spids (r 1,5) |
| Fødder | Korte, brede stumper under kanten | 24 brede, 10 høje fra kanten til jorden, x ±28 |

**Silhuet:** et bundtungt brød på stumper med to skrå streger og en tulipankrone. I solid sort læses den som en kuppel med en krone og to streger (se silhuetrækken på `sheet.png`).

**Kronens mekanik.** Al bevægelse er rotation om toppunktet. Åbningsvinklen bliver omsat til en projiceret elevation:

| Åbning | 0° (lukket) | 8° | 15° (hvile) | 30° (halvåben) | 50° | 70° (tulipan) |
|---|---|---|---|---|---|---|
| Elevation | −34° (ligger på kuplen) | −12° | 8° | 36° | 46° | 53° |

- Under 30° bliver pladens rygrad blandet med en rygrad, der ligger på kuplens overflade. Derfor lægger kronen sig ned over kuplen som en knop og breder sig aldrig fladt ud som en stjerne.
- Fra 30° til 70° drejer sidepladerne ud mod silhuetten (planvinkel 72° → 88°), mens bagpladerne fylder hullet imellem dem (158° → 142°). Spidserne krummer let ind og op, så formen bliver en tulipan i stedet for en vifte.
- Frontpladen er enten en pandelok, der ligger ned over panden mellem øjnene (spidsen sidder i overfladeradius 34–46), eller en kort plade, der står op mod beskueren (−24 til −26), når tulipanen er åben. I Rive er det én skalering i højden.
- Hver plade har en køl og 2×5 små porer. Det er søpindsvinets petaloide ambulakrer, og de gør, at pladerne læses som fossil og ikke som blade eller en ananastop.

## 2. Palet og farveplacering

| Farve | Hex | Bruges til |
|---|---|---|
| Flintgrøn | `#5F7D72` | Krop, krone og pigge (grundtone) |
| Kridt | `#EFE6D2` | Skorpepletter, brynplader og armknopper. Også kridtstøv i `wrong`/`passed` |
| Lynlime | `#CFF24A` | KUN gløden i de fem riller, gnister og lyn (`nervous`, `passed`). Aldrig gul og aldrig en stråle ud fra figuren |
| Fiskeler | `#8A4B3A` | Den tynde bundstribe (y −17 til −14) og tungen i `passed` |
| Natflint | `#1F2226` | Øjne, mund, låg-kant, lukkede øjne og små bevægelsesstreger |

Afledte toner, der bruges til lys og skygge (de er ikke selvstændige farver):

- `#4A6359` er den store skyggeform. I praksis er det et lag `#2B3C34` med 42 % dækning, så den samme maske også kan mørkne kridtpletterne.
- `#7C988D` er lyse brudflader, den belyste side af kronpladerne og lyskanten oppe til venstre.
- `#557064` og `#3B4F47` er bagplader, fødder og rillernes bund.
- `#CDC1A6` og `#A99D84` er kridt i skygge, og `#FFFDF6` er lysglimt.

**Lys og skygge:** flad vektor uden gradienter og uden konturstreg. Lyset kommer oppefra til venstre. Skyggeformen er kroppen minus en kopi af kroppen forskudt (−15, −9), så den ligger i højre side og forneden. Lyskanten er kroppen minus en kopi forskudt (2,2 / 2,8), dvs. oppe til venstre.

**Overflade:**
- 7 uregelmæssige kridtpletter, 5 af dem i hendes venstre side (beskuerens højre).
- 3 muslingeformede brudflader med koncentriske ringe: to på den belyste side og én lille til højre.
- Fiskeler-striben langs bundkanten.

**Linjebehandling:** ingen ydre konturer i nogen fil. Mørke streger findes kun inde i formen (låg-kant, mund, lukkede øjne og kronpladernes køl).

**Spidser foran kroppen:** de kaster en kort skygge (overlay, forskudt 1,8 / 2,8), der kun ligger på kuplen og på en pig, de krydser.

## 3. Rive-dele

Hver fil har navngivne grupper med præfikset `tordis-<pose>-`, så de importeres som lag:

| Gruppe-id (efter præfiks) | Rive-del | Bone / constraint |
|---|---|---|
| `body-group` → `torso` | Krop med overflade, stribe og riller | Squash/stretch-bone med pivot i jordpunktet (0, −10). Tilt og sx/sy |
| `grooves` | Gnistlag i rillerne | Trim path 0–100 % = input `ladning` |
| `crown-back`, `crown` → `plate-side-L/R`, `plate-back-L/R` | 4 kronplader | Én rotations-bone pr. plade, alle med pivot i toppunktet (0, −96) |
| `plate-front` | Frontplade (pandelok) | Rotation i toppunktet og skalering i højden (lok ↔ stående) |
| `sparks` | Ekstra gnister (hero, correct) | Synlighed, og trim path i takt med `ladning` |
| `face` → `brow-L/R` | 2 kridtbrynplader | Translate og rotation |
| `face` → `eye-L/R` | Øjne med separat øvre låg (og nedre låg i `correct`) | Lågets højde 0–1, tilt og sag. Glimtet følger blikretningen |
| `notch` → `mouth` | Hjertehak og mund | 6 mundformer: skævt smil (smirk), flad (flat), rolig (calm), selvtilfreds (smug), blød (soft) og skæv til siden (side). Desuden "oh" og et åbent grin (grin) |
| `arm-L/R`, `knob-L/R` | 2 pigge-arme | 2 bones: skulder (knop) 38 og albue 47. IK-target på spidsen. En lige stok kan bruge én bone |
| `feet` → `foot-L/R` | 2 fødder | Translate (tuck i hop og synk) |
| `fx` | Lyn, kridtstøv, spinner og tik-streger | Pr. pose |
| `ground-shadow` | Jordskygge | Skalering og opacity efter hopets højde |
| (ikke tegnet) | Lag til den forstenede tilstand | Se nedenfor |

**State machine-input `ladning` (0–100):**
- I hvile styrer den kronens åbning (0 → 15°, 100 → 30°) og rillernes glød (trim path + halo).
- Over 80 springer en gnist mellem to riller.
- `correct` og `passed` sætter `ladning` til 100.

Bemærk: SVG'erne er statiske nøgleposer. Rillernes og pladernes rækkefølge (z-order) skifter med vinklen, hvilket også skal håndteres i Rive med draw order-keys.

## 4. Poser

| Pose | Krop | Krone | Ansigt | Pigge | Effekter |
|---|---|---|---|---|---|
| **hero** | 3/4-vinkel (yaw −24°), lænet 8° over på stokken | Halvåben 30°, pandelok | Venstre bryn højt op (+15°), øjne mod beskueren, skævt smil | Højre pig er en lige stok i jorden foran hende. Venstre peger op som en dirigent midt i en pointe | En lime-gnist hopper mellem to riller |
| **idle** | Sidder tungt (sx 1,03 / sy 0,97) og læner 4° mod stokken | 15° og ligger næsten ned over kuplen. Ånder ±5° over 6 s | Halvt lukkede låg (50 %), blikket skævt op mod en loading-spinner. Højre bryn er hævet, og venstre er sænket mistænksomt | Venstre er en stok. Højre er "hånd i siden" | UI-spinner (kridtprikker med mørk kant) og to små rykkestreger ved brynet |
| **thinking** | Kuplen tippet 15° til siden | 26°, drejet ét hak (18°) som en kodelås | Blikket op til venstre, det ene bryn højt, munden skubbet ud til siden | Spidsen banker på kronen, og den anden er en stok | Tre tik-streger ved spidsen ("klik-klik") |
| **correct** | Retter sig 8 % op (sy 1,08), hagen op | Fuld tulipan 70°, frontpladen står op | Selvtilfreds: øvre og nedre låg halvt lukket, bryn let hævet, smug-mund | Krydset foran kroppen under hjertehakket ("naturligvis") | Lime-knitter langs rillerne |
| **wrong** | Trækker på skuldrene (knopperne +5) og synker (sx 1,05 / sy 0,94) | Synket ned til 8° og ligger på kuplen | Bløde, lave bryn med indersiden lidt op (aldrig skuffede), bløde låg, blødt smil | Den ene klapper jorden ved siden af hende ("Sæt dig. Vi tager den igen."). Den anden viser et "tja" med åben håndflade | Bankestreger ved jorden og et lille stykke kridt, der drysser af siden. Hun revner aldrig |
| **nervous** | Er sunket 9 ned i jorden ("spiller fossil"), og fødderne er væk | 24° og ånder 4 s ind og 6 s ud | Øjnene er roligt lukkede, munden rolig ("Jeg tager lynet.") | Begge pigge er plantet skråt i jorden som lynafledere | Et takket lime-lyn fra kronen langs kuplens kant, ned gennem piggene og ned i jorden med små jordgnister |
| **passed** | Stamp-hop 12 op, strakt (sy 1,06), fødderne trukket op | 74°, tulipanen springer op | Lukkede glade øjne, bryn højt, åbent grin med fiskeler-tunge | Strakt i et V | Lime-lyn lodret OP fra toppen (aldrig fremad), kridtstøv-pust ved fødderne og kridt- og flintkonfetti |

**Animationsnoter (fra briefet, ikke synlige i en enkelt ramme):**
- `correct` starter med et øjebliks panik (store øjne og begge bryn højt), før hun spiller kold.
- I `nervous` er første fase, at kronen klapper i, kroppen skrumper 10 %, og hun synker. Først derefter planter hun piggene.
- I `passed` popper pladerne op én efter én.
- Kile og Ragna (bifigurer) er ikke med i disse filer.

**Ekstra tilstand "forstenet" (ingen fil):**
- Kronen er helt lukket (0°), og frontpladen ligger som en pandelok.
- Alle farver blandes 20 % mod grå (`#8C8C8C`), og der ligger et let kridtstøv-lag på pladerne.
- Øjnene er lukkede med flade låg, og `ladning` er 0.
- Hun er hverken død eller i stykker. Én øvelse giver et lille knitter i én rille, og så ruller `ladning` op.

## 5. Afvigelser fra briefet (bevidste)

- Kronpladerne er 11–12 brede ved roden i stedet for 14. Med 14 klumpede fem rødder sammen til en klat i toppunktet.
- Porerne på pladerne er tilføjet for at undgå, at kronen læses som blade/ananas.
- Brynpladerne er 16×6 i stedet for 16×5, så de kan læses ved 64 px.
- `nervous` viser begge faser i én ramme: hun er halvt sunket og plantet som lynafleder.
