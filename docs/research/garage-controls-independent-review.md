# Uafhængigt review af garage-controls.json

## [P1] Betjeningsudstyr 1.1.1.1 reducerer tre krævede kontakter til generisk "start"

- **Topic/element:** `betjeningsudstyr` - objective `1.1.1.1`, kortet **Kontakterne omkring dig** og practical **Udpeg kontakter og åbninger i undervisningsbilen**.
- **Problem:** Objective-summaryen nævner kun "kontakter til start", kortet skriver "Start", og practical bruger igen "start". Dermed forsvinder planens særskilte udpegning af kontakt til ratlås, tænding og elektrisk starter. Et samlet startord dokumenterer ikke, at eleven kan lokalisere alle tre funktioner i den konkrete bil.
- **Korrekt primæroplysning:** Plan B 1.1.1.1 kræver udpegning af kontakt til **ratlås, tænding og elektrisk starter** samt de øvrige opregnede kontakter.
- **Konkret rettelse:** Skriv alle tre funktioner eksplicit i objective-summary, kort og practical. Bevar bilforbeholdet ved at lade kørelæreren vise, hvordan funktionerne er samlet eller adskilt i undervisningsbilen.

## [P1] Betjeningsudstyr 1.1.1.5 ændrer "og" til "eller" og skjuler to forskellige hætter

- **Topic/element:** `betjeningsudstyr` - objective `1.1.1.5`, kortet **Kontakterne omkring dig** og practical **Udpeg kontakter og åbninger i undervisningsbilen**.
- **Problem:** Summaryen siger "front- eller motorhjelm", og læringsteksten omtaler kun en generisk "hjelm". Det kan få eleven til kun at lede efter én åbning, selv om planen udtrykkeligt opregner fronthjelm, motorhjelm og låge til drivmiddel.
- **Korrekt primæroplysning:** Plan B 1.1.1.5 kræver udpegning af betjeningsanordning til åbning af **fronthjelm, motorhjelm og låge til drivmiddel**.
- **Konkret rettelse:** Erstat "front- eller motorhjelm" med den fulde opregning, og lad practical bede eleven udpege hver anordning, der findes på den konkrete bil. Forklar, at fronthjelm og motorhjelm kan være samme eller forskellige fysiske klapper afhængigt af bilens indretning, uden at slette nogen af planens betegnelser.

## [P2] En fysisk udpegningsopgave mangler den tydelige vurderingsgrænse

- **Topic/element:** `betjeningsudstyr` - practical **Udpeg førerpladsens betjening**.
- **Problem:** Opgaven lader eleven fysisk vise pedaler, gear, parkeringsbremse, rat og seledele med kørelæreren, men siger ikke som de to nabopracticals, at appen ikke kan godkende præstationen. Som selvstændigt UI-kort kan et appflueben derfor læses som afsluttet fysisk færdighed.
- **Korrekt primæroplysning:** Præstationskravet `udpege` betyder efter Plan B side 11-13, at eleven i praksis skal lokalisere køretøjsdelene; det anvendes også ved den praktiske prøve.
- **Konkret rettelse:** Tilføj samme grænse som i de øvrige fysiske opgaver: appen forbereder listen, mens kørelæreren skal se og vurdere udpegningen i undervisningsbilen.

## [P2] Instrumentkortet tilføjer ikke-kildedækkede displayregler

- **Topic/element:** `instrumenter-og-kontrollys` - kortene **Målere fortæller om bilen** og **Kontrollys er ikke pynt**.
- **Problem:** Første kort hævder, at visse oplysninger vises "først ved behov". Andet kort hævder, at betydningen afhænger af, om en lampe lyser kort ved start eller bliver ved. Begge kan være rigtige i en konkret bil, men ingen af påstandene bæres af refs `1.1.2.1` eller `1.1.2.2` i Plan B.
- **Korrekt primæroplysning:** Plan B 1.1.2.1 kræver aflæsning af speedometer og eventuel omdrejnings- og temperaturmåler. Punkt 1.1.2.2 opregner de krævede kontrolområder. Den bilspecifikke betydning og reaktion skal læres i undervisnings- og prøvebilen under det overordnede præstationskrav `aflæse og forstå`.
- **Konkret rettelse:** Fjern de to generelle diagnosticeringspåstande, eller mærk dem som bilspecifikke og bind dem til bilens instruktionsbog/kørelærer i practical. Lad Plan B-kortene nøjes med den officielle instrument- og kontrolliste.

## [P2] Elbilkortet giver speederen en funktion, som de angivne refs ikke beskriver

- **Topic/element:** `motor-taending-og-speeder` - kortet **Elbil og hybrid er forskellige**, sidste sætning.
- **Problem:** Sætningen "speederen stadig bruges til at styre fremdriften" henviser kun til `1.1.3.6` og `1.1.3.7`. De punkter beskriver elmotor/hybrid og batteriet som energikilde. Planens speederpunkt `1.1.3.3` gælder udtrykkeligt regulering af **forbrændingsmotorens omdrejninger** og bærer derfor heller ikke denne elbilspåstand.
- **Korrekt primæroplysning:** Plan B 1.1.3.6 siger, at elbilen har elmotor som drivkraft, eventuelt kombineret med forbrændingsmotor i en hybrid; 1.1.3.7 siger, at elmotoren får strøm fra batteriet.
- **Konkret rettelse:** Slet den sidste sætning fra kortet. Hvis elbilens speederfunktion ønskes forklaret, skal den have en særskilt, relevant primær kilde og en ref, som faktisk bærer påstanden.

## [P2] Koblingsstoffet mister "i bund" ved motorstart

- **Topic/element:** `kobling` - objective `1.1.4.4` og kortet **Pedalen beskytter og blødgør**.
- **Problem:** Summary og kort siger blot, at koblingen "kan trædes ned" under start. Planen angiver specifikt, at koblingspedalen kan trædes **i bund** under start for at skåne startmotoren. Gearskiftdelen er korrekt gengivet som helt i bund.
- **Korrekt primæroplysning:** Plan B 1.1.4.4: Koblingspedalen **kan trædes i bund under start af motoren** for at skåne startmotoren og **skal trædes i bund under gearskift** for ikke at ødelægge gearkassen. Plan B 1.1.4.7 afgrænser samtidig koblingspedalen fra automatgear og elbiler.
- **Konkret rettelse:** Indsæt "i bund" i både summary og kortets startsætning, og behold tydeligt, at dette gælder en bil med koblingspedal; automatgear og elbiler har ingen koblingspedal.

## [P2] Bakgear-objectivet påstår en mekanisme, kilden ikke angiver

- **Topic/element:** `gear` - objective `1.1.5.5`.
- **Problem:** Summaryen siger, at bakgear "ændrer kraftoverførslen". Planpunktet beskriver ikke, hvordan bakgear teknisk ændrer kraftvejen; det siger kun, at bakgear er nødvendigt for baglæns kørsel. Den ekstra mekanisme er derfor ikke dækket af refen.
- **Korrekt primæroplysning:** Plan B 1.1.5.5: Et bakgear er nødvendigt for at få bilen til at køre baglæns.
- **Konkret rettelse:** Erstat summaryen med en kort parafrase af netop dette. Behold tandhjulsprincippet under `1.1.5.2`, hvor det hører hjemme.

## [P2] ADAS-introduktionen svækker planens to generelle udsagn

- **Topic/element:** `foererassistentsystemer` - objectives `1.1.6.1` og `1.1.6.2` samt kortet **Bilen sanser gennem teknik**.
- **Problem:** Objective 1 siger, at nyere biler "kan have" assistenter, mens planen siger, at alle nyere biler er forsynet med dem. Kortet siger, at systemer "typisk" bruger kameraer, sensorer og radarer, mens planen kalder dette fælles for alle førerassistentsystemer. Det er en kildeafvigelse i begge retninger, selv om den forsigtige formulering kan være teknisk forståelig.
- **Korrekt primæroplysning:** Plan B 1.1.6.1 siger, at **alle nyere biler** er forsynet med systemer, der assisterer/vejleder eller griber ind ved fare. Punkt 1.1.6.2 siger, at det er **fælles for alle førerassistentsystemer**, at de bruger kameraer, sensorer og radarer til overvågning og mulig påvirkning af bremser eller styring.
- **Konkret rettelse:** Gengiv udsagnene som planens egne formuleringer, fx "Undervisningsplanen beskriver, at ...", så kildepræcisionen bevares uden at gøre en udokumenteret teknisk universalitet til appens selvstændige faktapåstand.

## [P1] Færdselstavleassistenten mangler sin vigtigste koblede funktion

- **Topic/element:** `foererassistentsystemer` - objective `1.1.6.3g` og kortet **Træthed, tavler og lys**.
- **Problem:** Begge nævner, at tavleassistenten kan arbejde sammen med adaptiv fartpilot, men udelader planens fortsættelse: koblingen kan selvstændigt ændre hastigheden i forhold til tavlerne. Det er en konkret funktion i bogstavpunkt g og er ikke dækket andetsteds.
- **Korrekt primæroplysning:** Plan B 1.1.6.3 g: Systemet kan genkende og vise færdselstavler og kan sammen med adaptiv fartpilot **selvstændigt ændre hastigheden i forhold til tavler**. Punkt 1.1.6.4 fastholder, at systemer kan fejle, og at føreren fortsat har ansvaret.
- **Konkret rettelse:** Tilføj den mulige automatiske hastighedsændring i summary og kort, og følg straks op med ansvar/fejlforbeholdet fra `1.1.6.4`, så funktionen ikke fremstilles som en myndig hastighedsafgørelse.

## [P2] Karrosseriets rustkrav indsnævres fejlagtigt til strukturel svækkelse

- **Topic/element:** `karrosseri` - objective `1.2.8.2`, kortet **Skade og rust vurderes efter fare** og practical **Vurder et tænkt karrosseriproblem**.
- **Problem:** Objective-summaryen kræver, at skaden eller rusten "svækker karrosseriet", og practical bruger "rust i en bærende del af vognbunden". Kilden opstiller ikke strukturel svækkelse eller en bærende del som nødvendige betingelser; kriteriet er, om skade eller rust har et omfang, der er til fare for færdselssikkerheden.
- **Korrekt primæroplysning:** Plan B 1.2.8.2: Karrosseriet må ikke være beskadiget eller tæret af rust i en sådan grad, at det er til fare for færdselssikkerheden. Dette adskiller sig fra 1.2.8.1's fare for andre ved skarpe/udragende dele og 1.2.8.3's låsekrav.
- **Konkret rettelse:** Fjern "svækker" og "bærende del" som tærskler. Skriv i stedet "sikkerhedsfarlig skade eller rust" og lad eksemplet handle om rust/skade i et omfang, der skaber færdselssikkerhedsfare.
