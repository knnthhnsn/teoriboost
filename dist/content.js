// NATKØRSEL — originalt, kildebelagt øveindhold til kategori B.
// Illustrationer er kun støtte: afgørende vilkår står altid i spørgsmålets tekst.

export const SOURCES = [
  { id: 'plan-b-1-1', label: 'Færdselsstyrelsen: Undervisningsplan for kategori B, version 1.1, maj 2026', url: 'https://cdn.fstyr.dk/faerdselsstyrelsen/Media/639159124710541258/undervisningsplan-kategori-b-almindelig-bil-version-11-maj-2026_pdf290526.pdf', checked: '2026-10-12' },
  { id: 'fl-2026', label: 'Retsinformation: Færdselsloven, LBK nr. 118 af 12. januar 2026', url: 'https://www.retsinformation.dk/eli/lta/2026/118', checked: '2026-10-12' },
  { id: 'udd-731', label: 'Retsinformation: Bekendtgørelse nr. 731 af 20. august 2026 om køreuddannelser og køreprøver', url: 'https://www.retsinformation.dk/eli/lta/2026/731', checked: '2026-10-12' },
  { id: 'kort-718', label: 'Retsinformation: Kørekortbekendtgørelsen, BEK nr. 718 af 19. august 2026', url: 'https://www.retsinformation.dk/eli/lta/2026/718', checked: '2026-10-12' },
  { id: 'prove-fstyr', label: 'Færdselsstyrelsen: Køreprøve', url: 'https://www.fstyr.dk/privat/koerekort/proever/koereproeve', checked: '2026-10-12' },
  { id: 'digital-fstyr', label: 'Færdselsstyrelsen: Digitale teoriprøver', url: 'https://www.fstyr.dk/erhverv/koereskoler-og-koerelaerere/digitale-teoriproever', checked: '2026-10-12' },
  { id: '17-fstyr', label: 'Færdselsstyrelsen: Kørekort til bil som 17-årig', url: 'https://www.fstyr.dk/privat/koerekort/dit-foerste-koerekort/koerekort-til-17-aarige', checked: '2026-10-12' },
  { id: 'kort-bil-fstyr', label: 'Færdselsstyrelsen: Kørekort til bil', url: 'https://www.fstyr.dk/privat/koerekort/dit-foerste-koerekort/koerekort-til-bil', checked: '2026-10-12' },
  { id: 'modern-fstyr', label: 'Færdselsstyrelsen: Moderniseret køreuddannelse', url: 'https://www.fstyr.dk/erhverv/koereskoler-og-koerelaerere/moderniseret-koereuddannelse', checked: '2026-10-12' },
  { id: 'test-fstyr', label: 'Færdselsstyrelsen: Opdateret bedømmelsesskema og test-teoriprøve', url: 'https://www.fstyr.dk/nyheder/2026/apr/opdateret-bedoemmelsesskema-og-forbedring-af-test-teoriproeven', checked: '2026-10-12' },
  { id: 'afmaerkning', label: 'Retsinformation: Bekendtgørelse om vejafmærkning, BEK nr. 425 af 13. april 2023', url: 'https://www.retsinformation.dk/eli/lta/2023/425', checked: '2026-10-12' },
  { id: 'handicapkort', label: 'Retsinformation: Bekendtgørelse nr. 99 af 30. januar 2024 om parkeringskort', url: 'https://www.retsinformation.dk/eli/lta/2024/99', checked: '2026-10-12' }
];

const s = (id, title, facts, sourceIds, curriculumRef) => ({ id, title, facts, sourceIds, curriculumRef, review: 'source-checked' });

export const CHAPTERS = [
  {
    id: 'bil', title: 'Bilen før turen', tagline: 'Cockpit, kontrol og ting der helst ikke falder af', color: '#36D399', icon: 'car', sections: [
      s('cockpit', 'Indstilling og udsyn', [
        'Sæde, rat og spejle indstilles før kørslen, så føreren kan styre sikkert og orientere sig effektivt.',
        'Nakkestøtten skal passe til førerens højde og mindske risikoen for nakkeskade.',
        'Løse genstande kan flyve frem ved en hård opbremsning og bør sikres.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 1.1 og 2.1 · modul 2'),
      s('assistenter', 'Førerassistenter', [
        'Førerassistenter kan advare eller gribe ind, men føreren har fortsat ansvaret for kørslen.',
        'Kameraer og sensorer kan fejle eller give misvisende oplysninger.',
        'Adaptiv fartpilot fjerner ikke behovet for at holde øje med vej, afstand og hastighed.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 1.1.6 · modul 2'),
      s('bremser', 'Styring og bremser', [
        'Bremsepedalen må ikke kunne trædes i bund ved hårdt tryk og må normalt ikke synke ved konstant tryk; pedalvandringen afhænger af bilfabrikatet.',
        'Bilen må ikke trække tydeligt til siden ved en normal opbremsning på jævn vej.',
        'Fejl i styretøj eller bremser skal undersøges, før bilen bruges videre.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 1.2.2-1.2.3 · modul 2'),
      s('lys-daek', 'Lys, horn og dæk', [
        'Lygter og reflekser skal være hele og rene, så bilen kan ses og signalerne forstås.',
        'Dæk skal have mindst 1,6 mm mønsterdybde i hovedmønstret og være ubeskadigede.',
        'Et blinklys, der blinker usædvanligt hurtigt, kan være tegn på en defekt blinklygte.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 1.2.4 og 1.2.7 · modul 2'),
      s('motor-dokumenter', 'Motor, miljø og papirer', [
        'Olie og kølervæske kontrolleres efter bilens anvisninger; advarsler må ikke bare ignoreres.',
        'Unormal røg eller støj kan være tegn på fejl, der kræver kontrol.',
        'Registreringsattesten beskriver bilen og er vigtig ved blandt andet ejerskifte og kørsel med påhæng.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 1.2.5-1.3 · modul 2')
    ]
  },
  {
    id: 'grundmanoevrer', title: 'Grundmanøvrer', tagline: 'Langsomt er også en hastighed', color: '#60A5FA', icon: 'parking', sections: [
      s('start-stop', 'Start og standsning', [
        'Ved igangsætning fra vejkant skal der altid gives tegn i god tid; tegnet giver ikke fortrinsret.',
        'Hastigheden ved igangsætning skal være så lav, at bilen hele tiden kan kontrolleres.',
        'Standsning bør ske roligt og på et sted, hvor bilen ikke skaber fare eller unødig ulempe.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 2.2 og 7.1 · modul 2 og 3'),
      s('rat-blik', 'Rat og blik', [
        'Bilen søger ofte i den retning, føreren ser, så blikket skal flyttes mod den ønskede kørebane.',
        'Hænderne bør give et sikkert greb og mulighed for jævn ratbetjening.',
        'Ved lav fart kan store ratudslag være nødvendige, men omgivelserne skal stadig kontrolleres.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 2.3-2.6 · modul 2'),
      s('bakning', 'Bakning', [
        'Bakning må kun ske, når det kan udføres uden fare eller ulempe for andre.',
        'Føreren skal orientere sig hele vejen rundt og være særlig opmærksom på lave og små trafikanter.',
        'Bakkamera og sensorer er hjælpemidler og erstatter ikke direkte orientering.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 2.5 og 7.5 · modul 2 og 4'),
      s('parkering-manovre', 'Forlæns parkering ved vejkant', [
        'Øvelsen i afsnit 2.7 trænes praktisk på lukket øvelsesplads med kørelærer; appen kan kun forberede observationer og rækkefølge.',
        'Ved forlæns parkering ved højre vejkant skal farten være så lav, at føreren kan bedømme bilens bredde og hjulenes placering.',
        'Blik og orientering skal fordeles mellem pladsen, bilens hjørner og trafikanter omkring manøvren.',
        'På øvelsespladsen trænes først med god plads til korrektion og derefter på et mere begrænset område.',
        'Slutstillingen skal være parallel med kanten og med højre hjul højst 20 cm fra kanten; et korrekt appsvar gennemfører ikke den praktiske færdighed.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 2.7.1 · modul 2 · praktisk øvelse på lukket øvelsesplads'),
      s('doer-aabning', 'Døre og udstigning', [
        'Før en dør åbnes, skal fører og passagerer sikre sig, at ingen cyklist eller anden trafik udsættes for fare.',
        'Åbning af vogndøre samt af- og påstigning skal ske uden fare eller unødig ulempe.',
        'Efter parkering skal bilen sikres mod at sætte i gang og mod uberettiget brug.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.18.3-7.18.5 · modul 4'),
      s('vending', 'Vending', [
        'En vending kræver tilstrækkeligt udsyn og plads samt løbende orientering.',
        'Manøvren skal afbrydes, hvis en trafikant pludselig kommer ind i området.',
        'På motorvej og til- eller frakørselsvej er vending og bakning forbudt.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 2.9, 7.5 og 7.16 · modul 2 og 4')
    ]
  },
  {
    id: 'koeretoejer', title: 'Køretøjer omkring dig', tagline: 'Blind vinkel, stor røv, lang reaktion', color: '#A78BFA', icon: 'car', sections: [
      s('blindzoner', 'Blindzoner', [
        'Spejle viser ikke nødvendigvis hele området ved siden af og bag bilen.',
        'Et kort skulderblik kan være nødvendigt før vognbaneskift eller sving.',
        'Store køretøjer har store områder, hvor føreren kan have svært ved at se andre.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 3.1.3 og 3.2 · modul 1'),
      s('tunge', 'Lastbiler og busser', [
        'Et langt køretøj kan bruge ekstra plads ved sving og kan komme tæt på kantstenen.',
        'Tunge køretøjer kan accelerere langsommere og kræver længere plads til visse manøvrer.',
        'Man bør undgå at opholde sig unødigt i områder, hvor den tunge fører kan have blindzone.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 3.2.2 · modul 1'),
      s('tohjulede', 'Motorcykler og knallerter', [
        'Tohjulede kan være svære at bedømme korrekt på afstand, især i mørke.',
        'Motorcyklister kan ændre placering for at få udsyn eller undgå ujævnheder.',
        'En lille silhuet betyder ikke nødvendigvis lav hastighed.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 3.2.5-3.2.6 · modul 1'),
      s('cykler-smaa', 'Cykler og små køretøjer', [
        'Cykler, elcykler og små motoriserede køretøjer kan nærme sig hurtigere end forventet.',
        'De kan være skjult af parkerede biler, stolper og bilens egne spejle.',
        'Ved sving skal føreren orientere sig efter cyklister både før og under manøvren.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 3.2.7-3.2.8 og 7.13 · modul 1, 3 og 4'),
      s('laes-trailer', 'Belæsning og påhæng', [
        'Last skal placeres og sikres, så den ikke forskyder sig eller falder af.',
        'Belæsning ændrer bilens styre-, bremse- og stabilitetsegenskaber.',
        'En påhængsvogn ændrer vogntogets længde og kræver mere omtanke ved sving og bakning.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 3.2.3, 6.2.7 og 9.1 · modul 1, 2 og 5')
    ]
  },
  {
    id: 'foereren', title: 'Mennesket bag rattet', tagline: 'Hjernen har også en advarselslampe', color: '#FB7185', icon: 'car', sections: [
      s('opfattelse', 'Opfattelse og reaktion', [
        'Reaktionstid begynder, når en fare kan opfattes, og slutter, når føreren begynder at reagere.',
        'En sikker og rigtig reaktion er vigtigere end en hurtig, men forkert reaktion.',
        'Højere fart betyder længere strækning, før en reaktion overhovedet får virkning.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 4.1.1-4.1.4 · modul 1'),
      s('distraktion', 'Telefon og distraktion', [
        'Håndholdt teleudstyr må ikke bruges under kørsel.',
        'Også håndfri samtaler, skærme, passagerer og stærke følelser kan stjæle opmærksomhed.',
        'Hvis noget kræver betjening, er den sikre løsning ofte at holde lovligt ind først.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 4.1.5-4.1.7 · modul 1'),
      s('traet-medicin', 'Træthed, sygdom og medicin', [
        'Træthed kan give langsommere reaktion og korte perioder uden reel opmærksomhed.',
        'Sygdom og medicin kan gøre kørsel uforsvarlig, også selv om medicinen er lovligt udleveret.',
        'Kaffe eller et åbent vindue gør ikke en udmattet fører køreklar.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 4.4.3 og 8 · modul 1 og 4'),
      s('alkohol-stoffer', 'Alkohol og stoffer', [
        'Alkohol forringer blandt andet dømmekraft, opmærksomhed og reaktion.',
        'Ulovlige stoffer og visse lægemidler kan gøre føreren ude af stand til at køre sikkert.',
        'Planlæg hjemtransport før festen; vurderingsevnen er et dårligt måleinstrument efter alkohol.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 4.4 og 8.1 · modul 1 og 4'),
      s('holdning', 'Holdning og risikoblindhed', [
        'Rutine kan give overdreven tro på egne evner og gøre farer mindre synlige for føreren.',
        'Tidspres er ikke en grund til at presse andre eller reducere sikkerhedsmarginen.',
        'En ansvarlig fører retter sin kørsel efter egne begrænsninger og andres mulige fejl.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 4.7 og 8.2 · modul 1 og 4')
    ]
  },
  {
    id: 'vej-vejr', title: 'Vej, vejr og udsyn', tagline: 'Asfalt har humør', color: '#22D3EE', icon: 'weather', sections: [
      s('vaadt-glat', 'Våd og glat vej', [
        'Regn, sne, is, grus og fedtet belægning kan reducere vejgrebet.',
        'Hastighed og afstand skal tilpasses, før grebet bliver kritisk.',
        'Pludselige rat- eller pedalbevægelser kan lettere udløse tab af vejgreb.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 5.2 og 9.1 · modul 2 og 5'),
      s('sigt', 'Tåge, regn og sol', [
        'Dårligt udsyn kræver lavere hastighed og større mulighed for at standse inden for det overskuelige område.',
        'Nærlys er normalt lys ved dårlig sigt; særligt kørelys er ikke nok i lygtetændingstiden.',
        'Fjernlys kan blænde og kan gøre udsynet dårligere i tæt nedbør eller tåge.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 5.2.4, 6.2.5 og 7.19 · modul 2 og 4'),
      s('kurver-bakker', 'Kurver og bakker', [
        'Bakketoppe og skarpe kurver begrænser udsynet og kræver hastighedstilpasning før stedet.',
        'Man må ikke bygge en overhaling på gæt om, at vejen er fri bag toppen eller kurven.',
        'Lavt vejgreb øger risikoen, fordi både styring og bremsning bruger af det samme greb.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 5.2.4, 7.3 og 7.9 · modul 2, 3 og 4'),
      s('vejmiljoe', 'Skoler, butikker og stoppesteder', [
        'Vejens omgivelser kan varsle børn, ældre eller gående, der handler uventet.',
        'Parkerede biler kan skjule personer, der er på vej ud på kørebanen.',
        'Ved stoppesteder og butikker bør føreren forvente krydsende og distraherede trafikanter.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 5.2.2 og 5.2.5 · modul 2'),
      s('tunnel-jernbane', 'Tunnel og jernbane', [
        'Ved indkørsel i tunnel kan øjnene bruge tid på at vænne sig til lysforskellen.',
        'I tunnel bør føreren kende flugtveje og følge tavler, signaler og personalets anvisninger.',
        'Ved jernbaneoverkørsel må man aldrig køre ind, hvis der ikke er plads til at komme helt fri.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 5.2.4 og 7.20 samt færdselsloven § 5 · modul 2 og 4')
    ]
  },
  {
    id: 'grundregler', title: 'Grundregler og anvisninger', tagline: 'Politibetjenten slår algoritmen', color: '#F59E0B', icon: 'stop', sections: [
      s('anvisninger', 'Hvem bestemmer?', [
        'En politibetjents anvisning går foran lyssignaler, tavler og almindelige regler.',
        'Lyssignaler går foran modstridende vigepligtsafmærkning, når signalet virker.',
        'Hvis et lyssignal er ude af drift, følges synlig vigepligtsafmærkning og ellers de almindelige regler.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 6.1 og 7.11 · modul 1, 3 og 4'),
      s('hensyn', 'Fare, ulempe og hensyn', [
        'Alle trafikanter skal optræde hensynsfuldt og agtpågivende.',
        'Man må ikke skabe fare eller unødig ulempe for andre.',
        'Regler giver ikke ret til at fremtvinge en manøvre, hvis situationen er farlig.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 6.2.1-6.2.2 og 7.11 · modul 1, 3 og 4'),
      s('tegn', 'Blink, horn og lys', [
        'Tegngivning skal gives tydeligt og i god tid, når andre har gavn af den.',
        'Blinklys giver information; det giver ikke i sig selv ret til at køre først.',
        'Horn og lyssignal bruges som nødvendig advarsel, ikke som følelsesmæssig anmeldelse.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 6.2.3-6.2.5 · modul 2'),
      s('udrykning', 'Udrykning og fri passage', [
        'Trafikanter skal give fri passage for køretøjer under udrykning.',
        'Man skal handle roligt, orientere sig og undgå at skabe en ny farlig situation.',
        'Et rødt signal bliver ikke automatisk grønt, fordi en ambulance kommer bagfra.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 6.2.6 og 7.11 · modul 2, 3 og 4'),
      s('uheld', 'Uheld og havari', [
        'Ved færdselsuheld skal man standse og hjælpe personer, der kan være kommet til skade.',
        'Stedet skal sikres uden at udsætte hjælperen eller andre for ny fare.',
        'Ved havari skal bilen så vidt muligt væk fra kørebanen og andre trafikanter advares.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 6.2.8-6.2.9 · modul 1 og 2'),
      s('tavler-signaler', 'Tavler, signaler og vejarbejde', [
        'B 11 Ubetinget vigepligt kræver, at man holder tilbage; fuldt stop kræves kun, hvis situationen kræver det.',
        'B 13 Stop kræver fuld standsning ved stoplinjen og derefter ubetinget vigepligt.',
        'C 55 angiver den højest tilladte hastighed fra tavlen, men forholdene kan kræve lavere fart.',
        'D 15 Påbudt passage viser med pilen, hvilken side tavlen skal passeres på.',
        'Ved vejarbejde gælder midlertidig gul afmærkning frem for modstridende hvid afmærkning.'
      ], ['plan-b-1-1', 'fl-2026', 'afmaerkning'], 'Kategori B v1.1: 6.1, 7.2-7.3 og 7.11 · modul 1, 3 og 4')
    ]
  },
  {
    id: 'kryds', title: 'Kryds og sårbare trafikanter', tagline: 'Se igen. Cyklisten er stadig der.', color: '#F97316', icon: 'yield', sections: [
      s('ubetinget', 'Ubetinget vigepligt', [
        'Hajtænder og tavlen for ubetinget vigepligt kræver, at man holder tilbage for trafikken på den vej, man kører ind på.',
        'Man har også ubetinget vigepligt ved blandt andet udkørsel fra ejendom, parkeringsplads eller tankstation.',
        'Man skal vælge et ophold, så andre ikke tvinges til at bremse eller ændre placering.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.11-7.12 · modul 3 og 4'),
      s('stop', 'STOP betyder stop', [
        'Ved STOP skal bilen standses helt ved stoplinjen; uden stoplinje standses før krydset, og om nødvendigt standses igen for at få udsyn.',
        'Efter standsning gælder den ubetingede vigepligt stadig.',
        'En rullende næsten-standsning opfylder ikke stopkravet.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 6.1 og 7.11 · modul 1, 3 og 4'),
      s('hoejre', 'Højre vigepligt', [
        'Hvor ingen har ubetinget vigepligt, skal man som udgangspunkt holde tilbage for kørende fra højre.',
        'Højre vigepligt kræver også kontrol af, om andre faktisk overholder deres pligt.',
        'Reglen gælder ikke som erstatning for reglerne om vognbaneskift og sammenfletning.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.11-7.12 · modul 3 og 4'),
      s('sving-cykel', 'Sving og cyklister', [
        'Ved højresving skal man holde tilbage for cyklister og andre, der fortsætter ligeud langs vejen.',
        'Orientering skal ske tidligt og gentages lige før svinget, fordi en cyklist kan være kommet frem.',
        'Placering og lav hastighed skal gøre hensigten tydelig og give tid til at standse.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.13-7.14 · modul 3 og 4'),
      s('venstresving', 'Venstresving i kryds', [
        'Før venstresving skal føreren orientere sig bagud til venstre og efter modkørende, tværgående trafik og trafikanter på den vej, der svinges ind på.',
        'Tegn til venstre skal gives i god tid, og bilen placeres i den venstre del af egen kørselsretning eller i den anviste svingbane.',
        'Den venstresvingende skal holde tilbage for modkørende, der fortsætter ligeud eller svinger til højre.',
        'Svinget må ikke fuldføres, mens en foranholdende venstresvinger spærrer udsynet; efter frit udsyn og et tilstrækkeligt ophold afsluttes svinget uden unødigt ophold.',
        'Fodgængere samt cyklister og knallertkørere på den vej, der svinges ind på, skal om nødvendigt have plads først, og bilen føres ind i den korrekte bane.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.14.1-7.14.4 · modul 3 og 4'),
      s('fodgaenger-rund', 'Fodgængere og rundkørsler', [
        'Ved fodgængerfelt skal føreren nærme sig med en hastighed, der gør det muligt at holde tilbage.',
        'Ved ind- og udkørsel af rundkørsel kræver cyklister og gående særlig orientering.',
        'Blink ud af rundkørslen fortæller om hensigten, men ophæver ikke pligten til at holde tilbage.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.6 og 7.15 · modul 3 og 4')
    ]
  },
  {
    id: 'vejmanoevrer', title: 'Manøvrer på vej', tagline: 'Spejl, plan, plads — og nul hovedpersonenergi', color: '#4ADE80', icon: 'right', sections: [
      s('placering-fart', 'Placering og fart', [
        'Man skal normalt holde så langt til højre som forholdene tillader.',
        'Den skiltede hastighed er en øvre grænse, ikke et mål under alle forhold.',
        'Hastigheden skal give mulighed for at standse for en påregnelig hindring.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.2-7.3 · modul 3'),
      s('bane-flet', 'Vognbaneskift og sammenfletning', [
        'Ved vognbaneskift har den skiftende fører ansvaret for, at manøvren kan ske uden fare eller unødig ulempe.',
        'Spejle, skulderblik og tydeligt tegn bruges før et vognbaneskift.',
        'Ved sammenfletning skal trafikanterne tilpasse sig gensidigt til den fælles bane.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.4 · modul 3 og 4'),
      s('afstand-moede', 'Afstand og møde', [
        'Afstanden til forankørende skal give tid og plads til at reagere, hvis den bremser.',
        'Afstanden skal øges, når vejgreb, udsyn eller opmærksomhed er dårligere.',
        'Ved møde på smal vej skal hastigheden sænkes, og den med hindringen på sin side må ofte vente.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.7-7.8 · modul 3'),
      s('overhaling', 'Overhaling', [
        'Overhaling kræver frit udsyn, tilstrækkelig plads og sikker tilbagevenden.',
        'Man må ikke begynde, hvis en bagvedkørende allerede er ved at overhale.',
        'Hvis forholdene ændrer sig, skal man kunne afbryde uden at presse andre.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.9 · modul 4'),
      s('trafiksanering', 'Trafiksanerede områder', [
        'I opholds- og legeområder kan gående og legende børn færdes på hele vejarealet, og motorkørsel sker på deres betingelser.',
        'Hastigheden skal normalt være under 15 km/t; føreren holder tilbage og fortsætter først, når de gående har set bilen og givet plads, og ingen kan komme farligt nær den.',
        'Parkering i opholds- og legeområde må kun ske på særligt afmærkede pladser.',
        'I gågade kræves særlig hensyn til gående; i cykelgade skal motorkørende vise særlig agtpågivenhed og må ikke unødigt hindre andre kørende.',
        'Bump, forsætninger og andre fartdæmpere kan kræve lavere fart end områdets angivne maksimum.'
      ], ['plan-b-1-1', 'fl-2026', 'afmaerkning'], 'Kategori B v1.1: 7.10.1-7.10.5 · modul 4'),
      s('motorvej', 'Motorvej og tæt trafik', [
        'På motorvej bruges accelerationsbanen til at tilpasse hastigheden og finde et sikkert ophold.',
        'Bakning, vending, standsning og parkering er forbudt uden for anviste steder, bortset fra nødsituationer.',
        'Ved kø skal man holde afstand, følge trafikken og være forberedt på pludselige opbremsninger.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 7.16-7.17 · modul 4'),
      s('letbane', 'Kørsel ved letbane', [
        'Letbanespor og tog kræver skærpet opmærksomhed, fordi et letbanetog har lang bremselængde og ikke kan undvige sporet.',
        'Føreren skal følge de signaler og tavler, der gælder for bilens kørselsretning, og må ikke forveksle dem med signaler for letbanen.',
        'Ved passage og sving over spor skal føreren kontrollere togets placering og sporets fortsatte forløb.',
        'Andre trafikanter kan overse biler, fordi deres opmærksomhed er rettet mod letbanen; hastighed og afstand skal tilpasses dette.',
        'Praktisk letbanekørsel indgår, når en lektion på mindst 45 minutter tillader kørsel til, ved og tilbage fra letbanen; ellers undervises de praktiske færdigheder i teorilokalet.'
      ], ['plan-b-1-1', 'fl-2026', 'afmaerkning'], 'Kategori B v1.1: 7.21.1-7.21.4 · modul 4'),
      s('standsning-parkering', 'Standsning og parkering', [
        'Standsning kortere end tre minutter er ikke parkering; af- og påstigning samt aktiv af- og pålæsning regnes heller ikke som parkering.',
        'Uden afmærket bås må man hverken standse eller parkere i et kryds eller nærmere end 10 m fra den tværgående kørebanes nærmeste kant.',
        'Man må hverken standse eller parkere på et fodgængerfelt eller nærmere end 5 m foran feltet.',
        'Standsning og parkering er forbudt på cykelsti, gangsti og som hovedregel fortov; den begrænsede fortovsundtagelse uden for tættere bebygget område gælder ikke cykelsti.',
        'P-tavler, undertavlers tidsrum og reserverede båse skal følges; en handicapbås kræver gyldigt parkeringskort.'
      ], ['plan-b-1-1', 'fl-2026', 'afmaerkning', 'handicapkort'], 'Kategori B v1.1: 7.18 · modul 4')
    ]
  },
  {
    id: 'risiko-teknik', title: 'Risiko, miljø og køreteknik', tagline: 'Fysik er ligeglad med din streak', color: '#E879F9', icon: 'speed', sections: [
      s('energi-miljoe', 'Energi- og miljørigtig kørsel', [
        'Jævn kørsel og færre unødvendige hastighedsændringer reducerer energiforbruget.',
        'For lavt dæktryk, unødig vægt og tagboks kan øge energiforbruget.',
        'Miljøhensyn må aldrig føre til, at sikker acceleration eller bremsning undlades.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 1.2.6 · modul 2'),
      s('fart-energi', 'Hastighed og bevægelsesenergi', [
        'Når hastigheden stiger, vokser både reaktionsstrækning og bremselængde.',
        'Bevægelsesenergien vokser kraftigt med hastigheden, så et sammenstød bliver mere alvorligt.',
        'En lille hastighedsnedsættelse kan give en stor sikkerhedsgevinst.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 8.1.3 og 9.2 · modul 4 og 5'),
      s('bremse-greb', 'Bremsning og vejgreb', [
        'Dæk kan kun overføre begrænsede kræfter til vejen.',
        'Hård bremsning og kraftig styring samtidig kan overskride vejgrebet.',
        'Elektroniske systemer hjælper, men kan ikke skabe greb på en glat vej.'
      ], ['plan-b-1-1'], 'Kategori B v1.1: 9.1-9.3 · modul 5'),
      s('udskridning', 'Udskridning og undvigelse', [
        'Tidlig hastighedstilpasning er den vigtigste måde at undgå kritiske manøvrer på.',
        'Ved tab af vejgreb skal føreren undgå panikbevægelser og søge at genvinde kontrol.',
        'Praktisk træning i udskridning og undvigelse hører til på køreteknisk anlæg.'
      ], ['plan-b-1-1', 'udd-731'], 'Kategori B v1.1: 9.3-9.5 · modul 5'),
      s('hoej-vejkant', 'Høj vejkant', [
        'Hvis hjulene kommer ud over en høj vejkant, kan en brat tilbageføring ved høj fart få føreren til at miste kontrollen.',
        'Føreren skal først holde rattet roligt og styre bilen langs kanten uden pludselige bevægelser.',
        'Hastigheden reduceres forsigtigt, mens bilen holdes stabil langs kanten.',
        'Bilen styres først tilbage over kanten, når hastigheden er så lav, at manøvren kan gennemføres kontrolleret.',
        'Situationen kan opstå ved både højre og venstre vejkant; øvelsen trænes på køreteknisk anlæg med kørelærer og må ikke selvafprøves på offentlig vej.'
      ], ['plan-b-1-1', 'udd-731'], 'Kategori B v1.1: 9.5.1 · modul 5 · praktisk øvelse på køreteknisk anlæg'),
      s('sele-ansvar', 'Sele, børn og ansvar', [
        'Sikkerhedssele reducerer risikoen for alvorlig skade og skal bruges på korte ture også.',
        'Børn under 135 cm skal som hovedregel bruge godkendt sikkerhedsudstyr tilpasset barnets højde og vægt.',
        'Føreren er ansvarlig for, at passagerer under 15 år bruger sele eller andet godkendt sikkerhedsudstyr.'
      ], ['plan-b-1-1', 'fl-2026'], 'Kategori B v1.1: 6.2.7 og 8.1.4 · modul 2 og 4')
    ]
  },
  {
    id: 'koerekort', title: 'Kørekort og prøve', tagline: 'Papirarbejde: den endelige boss', color: '#FACC15', icon: 'car', sections: [
      s('sammensat-koersel', 'Afsluttende sammensat kørsel', [
        'Afsnit 7.22 er afsluttende praktisk kørsel i skiftende situationer; kørelærer og elev fastlægger fælles mål og følger op med refleksion.',
        'Eleven skal øve selvstændig, hensynsfuld, ansvarlig og energi- og miljørigtig kørsel.',
        'Et samlet forløb kan omfatte kontrol af bilen, brug af førerstøttesystemer, ruteplanlægning eller GPS og tidligere vejmanøvrer.',
        'Førerstøtte og navigation er hjælpemidler; eleven skal fortsat orientere sig og reagere på den faktiske trafik.',
        'Appens scenarier kan forberede refleksion, men kan ikke gennemføre eller dokumentere den praktiske lektion med kørelærer.'
      ], ['plan-b-1-1', 'udd-731'], 'Kategori B v1.1: 7.22.1-7.22.3 · modul 5 · afsluttende praktisk kørsel med kørelærer'),
      s('forloeb', 'De fem moduler', [
        'Den moderniserede kategori B-uddannelse er bygget op i fem moduler.',
        'Minimumsforløbet omfatter 30 teorilektioner og 24 praktiske lektioner på mindst 45 minutter.',
        'Egen hjemmebrug tæller ikke automatisk som undervisning; kørelæreren kan planlægge og registrere højst syv selvstudielektioner i egnede dele af afsnit 1, 3, 6, 9 og 10, dog ikke afsnit 10 i modul 1.'
      ], ['udd-731', 'plan-b-1-1', 'modern-fstyr'], 'Kategori B v1.1: 0.3 og BEK nr. 731 §§ 9, 24-25 · modul 1, 2, 3, 4 og 5'),
      s('teoriproeve', 'Teoriprøvens format', [
        'Kategori B-prøven viser 25 trafikale situationer med fire udsagn til hver.',
        'Der er altid mindst ét korrekt udsagn, og der kan være flere.',
        'Prøven varer 25 minutter, og højst fem fejl giver bestået.'
      ], ['prove-fstyr', 'digital-fstyr', 'test-fstyr'], 'Kategori B v1.1: 10.2.2 · modul 4'),
      s('digital-proeve', 'Digital prøveadfærd', [
        'Den digitale teoriprøve afholdes på et prøvested og kræver fysisk fremmøde.',
        'Kandidaten kan gå tilbage, ændre svar og markere spørgsmål til senere.',
        'I NATKØRSEL tæller et scenarie som én app-fejl, hvis et eller flere valg er forkerte eller mangler; dette må ikke kaldes dokumenteret identisk med myndighedens optælling.'
      ], ['prove-fstyr', 'digital-fstyr'], 'Kategori B v1.1: 10.2.2 · modul 4'),
      s('sytten', '17-årige bilister', [
        'En 17-årig må køre alene i Danmark kl. 05.00-20.00.',
        'Kl. 20.00-05.00 kræves en ledsager, indtil føreren fylder 18 år.',
        'Den danske 17-årsordning giver ikke automatisk ret til at køre i udlandet.'
      ], ['17-fstyr', 'kort-718'], 'Kategori B v1.1: 10.3 · modul 4'),
      s('nybilist', 'Nye bilister og gyldighed', [
        'I de første tre år efter første B-kørekort er den juridiske tærskel over 0,20 ‰ i blodet eller over 0,10 mg alkohol pr. liter udåndingsluft, uanset alder.',
        'Myndighedernes praktiske råd til nye bilister er at lade være med at drikke alkohol før kørsel.',
        'En bestået teoriprøve er gyldig i 18 måneder, men er ikke i sig selv et kørekort.'
      ], ['fl-2026', 'kort-bil-fstyr'], 'Kategori B v1.1: 4.4, 8.1 og 10.3 · modul 1 og 4')
    ]
  }
];

function statementOrder(id,statements){
  const ordered=statements.map(([text,correct])=>({text,correct}));
  let seed=Math.imul(Number(id.slice(2))||1,2654435761)>>>0;
  for(let i=ordered.length-1;i>0;i--){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const j=Math.floor((seed>>>0)/4294967296*(i+1));[ordered[i],ordered[j]]=[ordered[j],ordered[i]];}
  return ordered;
}
// Fixed per ID, so reloads keep the same order without a guessable JA/JA/NEJ/NEJ pattern.
const q = (id, chapterId, sectionId, prompt, context, statements, explanation, sourceIds, scene, gag) => ({
  id, chapterId, sectionId, prompt, context,
  statements: statementOrder(id,statements),
  explanation, sourceIds, scene, gag
});

export const QUESTIONS = [
  q('q-001', 'bil', 'cockpit', 'Hvad gør du før afgang?', 'Du har lånt en bil. Sædet står langt tilbage, sidespejlet viser mest himmel, og en metalflaske ligger løs på hattehylden.', [['Indstiller sæde og spejle før jeg kører.', true], ['Sikrer den løse flaske.', true], ['Venter med indstilling, til jeg er ude af parkeringspladsen.', false], ['Regner med bakspejlet alene.', false]], 'Korrekt indstilling giver kontrol og udsyn. Løse genstande kan blive farlige ved hård opbremsning.', ['plan-b-1-1'], 'car', 'Hattehylden er ikke business class for termoflasker.'),
  q('q-002', 'bil', 'assistenter', 'Hvad er korrekt om assistenten?', 'På en klar vej viser bilens skiltegenkendelse 80, men du har netop passeret et tydeligt midlertidigt skilt med 50 ved vejarbejde.', [['Følger det aktuelle, synlige skilt.', true], ['Holder selv øje med vejen.', true], ['Lader bilen vælge, fordi kameraet aldrig tager fejl.', false], ['Er fritaget for ansvar, når assistenten er tændt.', false]], 'Førerassistenter kan fejle. Føreren skal følge aktuelle anvisninger og har fortsat ansvaret.', ['plan-b-1-1', 'fl-2026'], 'speed', 'Kameraet har ingen juridisk embedseksamen.'),
  q('q-003', 'bil', 'bremser', 'Hvordan reagerer du?', 'Før turen synker bremsepedalen langsomt mod gulvet, mens du holder et fast, konstant tryk. Bilen står stadig parkeret.', [['Undlader at køre, før fejlen er undersøgt.', true], ['Betragter det som et muligt tegn på bremsefejl.', true], ['Kører forsigtigt, fordi håndbremsen findes.', false], ['Pumper pedalen og erklærer bilen rask uden kontrol.', false]], 'Pedalvandringen afhænger af bilfabrikatet, men pedalen må normalt ikke synke ved konstant tryk og må ikke kunne trædes i bund ved hårdt tryk. En tydelig afvigelse skal undersøges.', ['plan-b-1-1'], 'car', 'Håndbremsen er ikke bilens reserve-faldskærm.'),
  q('q-004', 'bil', 'lys-daek', 'Hvilke vurderinger er rigtige?', 'På morgenkontrollen ser du et dæk med tydelig skade i siden og måler 1,3 mm i hovedmønstret. Højre blinklys blinker meget hurtigere end normalt.', [['Dækket opfylder ikke kravet til mønsterdybde.', true], ['Dækskaden kræver handling før kørsel.', true], ['Det hurtige blink kan varsle en defekt blinklygte.', true], ['Dækket er lovligt, når vejen er tør.', false]], 'Dæk skal have mindst 1,6 mm i hovedmønstret og være ubeskadigede. Hurtigt blink kan tyde på lygtefejl.', ['plan-b-1-1'], 'car', 'Dækket har afleveret sin opsigelse skriftligt.'),
  q('q-005', 'bil', 'motor-dokumenter', 'Hvad bør du gøre?', 'Under kørsel tænder en rød advarselslampe for olietryk, og motoren begynder at lyde usædvanligt. Du kan straks holde sikkert ind.', [['Standser sikkert og undersøger problemet.', true], ['Slukker motoren, når det kan ske sikkert.', true], ['Fortsætter til næste by, fordi røde lamper er vejledende.', false], ['Skruer musikken op, så mislyden ikke distraherer.', false]], 'Rød advarsel og unormal motorlyd kan varsle en alvorlig fejl. Fortsat kørsel kan være farlig og skade motoren.', ['plan-b-1-1'], 'car', 'Spotify er ikke et godkendt diagnoseværktøj.'),

  q('q-006', 'grundmanoevrer', 'start-stop', 'Hvordan sætter du i gang?', 'Du holder ved kantstenen. En cyklist kommer bagfra, og der er fri bane bag cyklisten.', [['Giver tegn i god tid, men venter stadig på cyklisten.', true], ['Orienterer mig igen lige før igangsætning.', true], ['Kører straks ud, fordi blinklyset giver fortrinsret.', false], ['Lader cyklisten bremse for bilen.', false]], 'Fra vejkant skal du altid give tegn i god tid. Du skal stadig orientere dig og holde tilbage, fordi tegnet ikke giver fortrinsret.', ['plan-b-1-1', 'fl-2026'], 'bike', 'Blinklyset har sendt en kalenderinvitation, ikke en tvangsordre.'),
  q('q-007', 'grundmanoevrer', 'rat-blik', 'Hvad hjælper i svinget?', 'På lukket øvelsesplads kører du langsomt gennem et skarpt sving. Du stirrer på keglen ved bilens højre hjørne og driver hen imod den.', [['Flytter blikket frem mod den ønskede kurs.', true], ['Holder farten lav og styrer jævnt.', true], ['Fikserer blikket endnu hårdere på keglen.', false], ['Accelererer for at komme hurtigere forbi fejlen.', false]], 'Blikretning påvirker styringen. Lav fart og et blik mod den ønskede kurs giver bedre kontrol.', ['plan-b-1-1'], 'parking', 'Keglen vandt stirrekonkurrencen.'),
  q('q-008', 'grundmanoevrer', 'bakning', 'Hvad er sikkert?', 'Du vil bakke ud fra en indkørsel over et fortov. Et barn leger ved hækken, og bakkameraet viser kun området lige bag bilen.', [['Stiger om nødvendigt ud og skaber overblik.', true], ['Bakker kun, når manøvren kan ske uden fare.', true], ['Stoler alene på kameraet.', false], ['Bakker hurtigt, så fortovet er spærret kortere tid.', false]], 'Ved bakning kræves fuld orientering. Kameraet kan have blinde områder, og gående på fortovet skal beskyttes.', ['plan-b-1-1', 'fl-2026'], 'pedestrian', 'Bakkameraet er en hjælper, ikke en synsk professor.'),
  q('q-009', 'grundmanoevrer', 'doer-aabning', 'Hvad gør du efter parkeringen?', 'Du holder lovligt langs en cykelsti. En cyklist nærmer sig bagfra, og din passager vil åbne døren mod cykelstien.', [['Beder passageren vente.', true], ['Kontrollerer bagud før døren åbnes.', true], ['Åbner hurtigt, fordi bilen holder stille.', false], ['Forventer, at cyklisten kører udenom døren.', false]], 'Åbning af vogndøre samt af- og påstigning skal ske uden fare eller unødig ulempe. Kontroller cykeltrafikken og vent.', ['plan-b-1-1', 'fl-2026'], 'bike', 'Bildøren skal ikke debutere som svingbom.'),
  q('q-010', 'grundmanoevrer', 'vending', 'Må du vende her?', 'Du har misset en afkørsel på motorvejen. Næste afkørsel er fem kilometer væk, og nødsporet er tomt.', [['Fortsætter til næste lovlige afkørsel.', true], ['Accepterer omvejen.', true], ['Bakker i nødsporet.', false], ['Vender gennem en åbning i midterrabatten.', false]], 'Bakning og vending er forbudt på motorvej og dens til- og frakørsler. Kør videre til næste afkørsel.', ['fl-2026', 'plan-b-1-1'], 'motorway', 'Fem kilometer er billigere end en actionfilm i nødsporet.'),

  q('q-011', 'koeretoejer', 'blindzoner', 'Hvordan skifter du bane?', 'På en firesporet byvej viser spejlene fri bane. En motorcykel kan have placeret sig i din venstre blinde vinkel.', [['Kontrollerer den blinde vinkel før skiftet.', true], ['Giver tydeligt tegn i god tid.', true], ['Skifter straks, fordi spejlene er fri.', false], ['Regner med, at motorcyklen dytter.', false]], 'Spejle dækker ikke alle områder. Orientering, tegn og kontrol af blind vinkel skal ske før vognbaneskift.', ['plan-b-1-1'], 'car', 'Blind vinkel er et område, ikke en personlighedstype.'),
  q('q-012', 'koeretoejer', 'tunge', 'Hvad forudser du?', 'En lang lastbil foran dig blinker til højre ved et snævert hjørne og ligger lidt mod venstre for at få plads.', [['Holder afstand og giver lastbilen plads.', true], ['Forventer, at baghjulene kan komme tæt på hjørnet.', true], ['Kører op på lastbilens højre side.', false], ['Antager, at blinket er glemt, fordi lastbilen ligger mod venstre.', false]], 'Lange køretøjer kan trække ud før et snævert sving og har blinde zoner. Giv plads og undgå indersiden.', ['plan-b-1-1'], 'right', 'Lastbilen danser ikke; den har bare en meget lang krop.'),
  q('q-013', 'koeretoejer', 'tohjulede', 'Hvordan bedømmer du situationen?', 'I mørke ser du ét forlys fra en modkørende motorcykel langt fremme. Du overvejer at overhale en langsom bil.', [['Afventer, hvis jeg ikke sikkert kan bedømme afstand og hastighed.', true], ['Bevarer en sikker plads bag den langsomme bil.', true], ['Antager, at ét lys altid betyder lav fart.', false], ['Starter overhalingen og vurderer senere.', false]], 'En motorcykels lille lyssilhuet gør afstand og fart sværere at bedømme. Usikkerhed skal føre til sikkerhedsmargin.', ['plan-b-1-1'], 'night', 'Ét lys kan stadig komme med hele fysikkens regelsæt.'),
  q('q-014', 'koeretoejer', 'cykler-smaa', 'Hvad gør du før højresving?', 'Du kører langs en cykelsti og vil dreje til højre. En hurtig elcyklist er bag dig og kan nå op på siden før svinget.', [['Orienterer mig igen lige før svinget.', true], ['Holder lav fart og er klar til at standse.', true], ['Svinger, fordi cyklisten var bag bilen ved første spejlkig.', false], ['Regner med, at elcyklen har lav fart som en gående.', false]], 'Cyklisten kan flytte sig hurtigt. Gentag orienteringen og hold tilbage for ligeudkørende cykeltrafik.', ['plan-b-1-1', 'fl-2026'], 'bike', 'Elcyklen har ikke læst dit første spejlkig som en kontrakt.'),
  q('q-015', 'koeretoejer', 'laes-trailer', 'Hvad er korrekt om lasten?', 'Bagagerummet er fyldt. En tung værktøjskasse står løst øverst, og bilen føles tungere end normalt.', [['Sikrer værktøjskassen mod at flytte sig.', true], ['Tilpasser kørsel og afstand til den ændrede vægt.', true], ['Lader kassen stå løs, fordi bagklappen er lukket.', false], ['Forventer uændrede bremseegenskaber.', false]], 'Last skal sikres. Vægt og placering påvirker bilens stabilitet og bremsning.', ['plan-b-1-1', 'fl-2026'], 'car', 'Bagklappen er ikke en juridisk spændestrop.'),

  q('q-016', 'foereren', 'opfattelse', 'Hvad vælger du?', 'En bold triller ud mellem parkerede biler foran dig. Du kan ikke se, hvem der har sparket den.', [['Sænker straks farten og er klar til at standse.', true], ['Forventer, at et barn kan følge efter bolden.', true], ['Fortsætter uændret, til jeg ser et menneske.', false], ['Dytter og antager derefter fri bane.', false]], 'Bolden er et faretegn. Forudseenhed og lavere hastighed giver tid til en rigtig reaktion.', ['plan-b-1-1'], 'pedestrian', 'Bolden er trailer for næste scene.'),
  q('q-017', 'foereren', 'distraktion', 'Hvordan håndterer du telefonen?', 'Telefonen vibrerer i din håndholder med en vigtig besked. Du kører i tæt trafik og skal trykke flere gange for at læse den.', [['Lader beskeden vente.', true], ['Holder lovligt ind, hvis den virkelig skal håndteres.', true], ['Tager telefonen i hånden ved rødt og fortsætter med at skrive, når trafikken sætter i gang.', false], ['Læser hurtigt, fordi telefonen sidder i en holder.', false]], 'Håndholdt brug er forbudt, og også fastgjorte skærme kan distrahere. Betjening må ikke fjerne opmærksomheden fra trafikken.', ['plan-b-1-1', 'fl-2026'], 'car', 'Beskeden overlever. Det bør alle andre også.'),
  q('q-018', 'foereren', 'traet-medicin', 'Er du køreklar?', 'Efter en nat uden søvn gaber du konstant og mister kortvarigt fokus. Du skal køre en ven til lufthavnen.', [['Lader en udhvilet person køre eller vælger anden transport.', true], ['Anerkender, at træthed kan gøre kørslen uforsvarlig.', true], ['Drikker kaffe og kører straks, fordi kaffe fjerner søvnbehovet.', false], ['Åbner vinduet og regner problemet for løst.', false]], 'Træthed kan ikke repareres sikkert med små tricks. Undlad at køre, når du ikke kan gøre det forsvarligt.', ['plan-b-1-1', 'fl-2026'], 'night', 'Kold luft er vejr, ikke søvn.'),
  q('q-019', 'foereren', 'alkohol-stoffer', 'Hvad er den sikre plan?', 'Du er ny bilist og skal til fest. Du har bilen med og ved endnu ikke, om du vil drikke.', [['Aftaler hjemtransport uden bil på forhånd.', true], ['Lader bilen stå, hvis jeg drikker.', true], ['Vurderer min køreevne efter festen.', false], ['Drikker lidt og kører ekstra langsomt.', false]], 'Alkohol svækker netop den dømmekraft, man skulle bruge til at vurdere sig selv. Planlæg nul alkohol før kørsel.', ['plan-b-1-1', 'fl-2026'], 'car', 'Promille og improvisation er et elendigt makkerpar.'),
  q('q-020', 'foereren', 'holdning', 'Hvordan reagerer du på presset?', 'En bilist ligger tæt bag dig på en smal, våd landevej. Du kører efter forholdene og under den skiltede maksimumshastighed.', [['Bevarer en sikker fart efter forholdene.', true], ['Finder et sikkert sted at lade den utålmodige passere, hvis det er hensigtsmæssigt.', true], ['Sætter farten op over det forsvarlige.', false], ['Bremsetester den bagvedkørende.', false]], 'Pres bagfra ændrer ikke vejgreb eller udsyn. Kør forudsigeligt og giv eventuelt plads på en sikker måde.', ['plan-b-1-1', 'fl-2026'], 'weather', 'Bagkofangeren er ikke din personlige træner.'),

  q('q-021', 'vej-vejr', 'vaadt-glat', 'Hvordan kører du på den glatte vej?', 'Det fryser. Vejen ser mest tør ud, men en skyggefuld bro kan være glat, og du nærmer dig et sving.', [['Sænker farten før broen og svinget.', true], ['Undgår pludselige styre- og pedalbevægelser.', true], ['Bremser hårdt midt i svinget for at teste grebet.', false], ['Holder samme fart, fordi asfalten ser sort ud.', false]], 'Broer og skygge kan være glatte. Tilpas fart tidligt og brug jævne bevægelser.', ['plan-b-1-1'], 'weather', 'Sort asfalt kan stadig have hemmelig vinterjakke på.'),
  q('q-022', 'vej-vejr', 'sigt', 'Hvilke valg er rigtige?', 'I tæt regn om dagen er sigten kort. Bilens automatiske kørelys tænder kun lys foran, og trafikken bevæger sig langsommere.', [['Tænder nærlys, så også baglygterne er tændt.', true], ['Sænker farten og øger afstanden.', true], ['Bruger kun positionslys under kørslen.', false], ['Tænder fjernlys mod de forankørende.', false]], 'Dårlig sigt kræver korrekt lys, lavere fart og større afstand. Særligt kørelys er ikke nok i lygtetændingstiden.', ['plan-b-1-1', 'fl-2026'], 'weather', 'Auto-lys er ikke en regn-orakel.'),
  q('q-023', 'vej-vejr', 'kurver-bakker', 'Kan du overhale?', 'Du ligger bag en traktor på en tosporet landevej. Kort fremme begynder en bakketop, og du kan ikke se vejforløbet bag den.', [['Bliver bag traktoren.', true], ['Venter på frit udsyn og tilstrækkelig plads.', true], ['Overhaler, fordi traktoren er langsom.', false], ['Regner med, at modkørende kan bremse.', false]], 'Begrænset udsyn gør det umuligt at sikre fri overhalingsstrækning. Vent.', ['plan-b-1-1', 'fl-2026'], 'speed', 'Traktoren er langsom; beslutningen behøver ikke være det.'),
  q('q-024', 'vej-vejr', 'vejmiljoe', 'Hvad forventer du?', 'Du kører forbi en skole ved fyraften. Parkerede biler skjuler fortovet, og en forælder står med en åben bildør.', [['Sænker farten og søger efter børn mellem bilerne.', true], ['Holder ekstra afstand til de parkerede biler.', true], ['Kører tæt forbi, fordi der ikke står nogen på kørebanen endnu.', false], ['Antager, at alle børn venter på en voksen.', false]], 'Omgivelserne varsler uforudsigelige gående. Skab udsyn, plads og standsemulighed.', ['plan-b-1-1'], 'pedestrian', 'Skoleklokken ringer også for din risikovurdering.'),
  q('q-025', 'vej-vejr', 'tunnel-jernbane', 'Må du køre ind?', 'Bommen ved en jernbaneoverkørsel er oppe, men trafikken holder stille på den anden side, og din bil kan ikke komme helt fri af sporet.', [['Venter før overkørslen.', true], ['Kører først, når der er plads til hele bilen på den anden side.', true], ['Kører ind, fordi bommen er oppe.', false], ['Holder på sporet og regner med, at køen flytter sig.', false]], 'Man må ikke køre ind på sporet uden sikker plads til at komme helt over.', ['plan-b-1-1', 'fl-2026'], 'stop', 'Toget accepterer ikke “køen flyttede sig ikke” som returpolitik.'),

  q('q-026', 'grundregler', 'anvisninger', 'Hvem følger du?', 'Lyset viser grønt, men en uniformeret politibetjent står i krydset og giver dig tydeligt tegn til at standse.', [['Standser for politiets anvisning.', true], ['Afventer nyt tegn fra betjenten.', true], ['Kører på grønt, fordi signalet er elektronisk.', false], ['Følger bilen foran uden selv at se tegnet.', false]], 'Politiets anvisning går foran lyssignal og almindelige regler.', ['plan-b-1-1', 'fl-2026'], 'stop', 'Grønt lys blev lige mellemleder.'),
  q('q-027', 'grundregler', 'hensyn', 'Har du ret til at køre?', 'Du har grønt lys, men krydset er blokeret af kø. Hvis du kører frem, vil bilen stå midt i krydset, når tværtrafikken får grønt.', [['Venter før krydset.', true], ['Kører først, når der er plads på den anden side.', true], ['Kører ind, fordi grønt altid giver ubetinget ret.', false], ['Blokerer krydset og tænder havariblink.', false]], 'Man må ikke fremtvinge passage eller blokere krydset. Grønt lys ophæver ikke pligten til hensyn.', ['plan-b-1-1', 'fl-2026'], 'stop', 'Havariblink er ikke et “jeg må godt”-filter.'),
  q('q-028', 'grundregler', 'tegn', 'Hvad betyder blinklyset?', 'En bil holder ved en sidevej og blinker til højre. Dens hjul står stille, og du kan ikke se førerens ansigt.', [['Forventer mulig igangsætning, men søger bekræftelse.', true], ['Bevarer mulighed for at reagere.', true], ['Antager, at bilen helt sikkert drejer nu.', false], ['Kører tæt forbi, fordi blinklyset binder føreren juridisk.', false]], 'Tegnet viser en hensigt, men kan være glemt eller ændret. Bedøm hele situationen.', ['plan-b-1-1'], 'right', 'Blinklyset er et signal, ikke en notar.'),
  q('q-029', 'grundregler', 'udrykning', 'Hvordan giver du plads?', 'Du holder for rødt i højre bane. En ambulance med blå blink og sirene nærmer sig bagfra. Der er fodgængere i krydset.', [['Orienterer mig og skaber plads uden at udsætte fodgængerne for fare.', true], ['Følger eventuelle anvisninger fra politi eller redningspersonale.', true], ['Kører blindt over for rødt ind mellem fodgængerne.', false], ['Bliver stående uden at undersøge sikre muligheder for at give plads.', false]], 'Fri passage skal skabes roligt og sikkert. Udrykning ophæver ikke behovet for at beskytte andre.', ['plan-b-1-1', 'fl-2026'], 'emergency', 'Blå blink kræver hjerne, ikke stuntkørsel.'),
  q('q-030', 'grundregler', 'uheld', 'Hvad gør du først?', 'Du ankommer til et frisk uheld på en mørk landevej. En person sidder i grøften, og en bil står delvist på kørebanen.', [['Standser sikkert og sikrer stedet.', true], ['Tilkald hjælp og hjælper tilskadekomne efter evne.', true], ['Kører videre, hvis andre allerede filmer.', false], ['Stiller mig midt på kørebanen uden synlighed.', false]], 'Ved uheld skal man standse, hjælpe og forebygge nye uheld. Egen sikkerhed og synlig sikring er en del af hjælpen.', ['plan-b-1-1', 'fl-2026'], 'emergency', 'Kommentarfeltet kan ikke lægge en forbinding.'),

  q('q-031', 'kryds', 'ubetinget', 'Hvornår kan du køre?', 'Du kommer fra en tankstation over et fortov og vil ud på vejen. Der er biler fra venstre og en cyklist fra højre på cykelstien.', [['Holder tilbage for både biler og cyklist.', true], ['Kører først, når ingen tvinges til at ændre fart eller placering.', true], ['Har kun vigepligt for trafikken fra venstre.', false], ['Har fortrinsret, fordi tankstationen har en bred udkørsel.', false]], 'Udkørsel fra område uden for vejen giver ubetinget vigepligt over for trafikken på vejen.', ['plan-b-1-1', 'fl-2026'], 'yield', 'Bred asfalt er stadig ikke et diplomatpas.'),
  q('q-032', 'kryds', 'stop', 'Hvad kræver tavlen?', 'Du møder STOP og en tydelig stoplinje. Der er frit udsyn, og ingen anden trafik kan ses.', [['Standser bilen helt ved stoplinjen.', true], ['Orienterer mig og kører først derefter, når vejen er fri.', true], ['Ruller langsomt over linjen uden stop.', false], ['Springer standsningen over, fordi vejen ser tom ud.', false]], 'STOP kræver fuld standsning, også når vejen ser fri ud. Derefter gælder vigepligten fortsat.', ['plan-b-1-1', 'fl-2026'], 'stop', 'STOP har ingen “men det var søndag”-undtagelse.'),
  q('q-033', 'kryds', 'hoejre', 'Hvem holder du tilbage for?', 'To små veje mødes uden signal, tavler, hajtænder eller særlig vejudformning. En bil kommer fra din højre side.', [['Holder tilbage for bilen fra højre.', true], ['Kontrollerer samtidig, om føreren faktisk ser mig.', true], ['Kører først, fordi min vej ser lidt bredere ud.', false], ['Antager, at ligeudkørsel altid giver fortrinsret.', false]], 'Uden anden regulering gælder højre vigepligt. Man skal stadig være klar på, at andre kan tage fejl.', ['plan-b-1-1', 'fl-2026'], 'right', 'Vejens selvtillid måles ikke i centimeter.'),
  q('q-034', 'kryds', 'sving-cykel', 'Hvordan gennemfører du svinget?', 'Du vil dreje til højre over en cykelsti. En cyklist fortsætter ligeud ved siden af dig, og der er fri vej foran.', [['Holder tilbage for cyklisten.', true], ['Svinger først, når cykelstien er fri.', true], ['Svinger foran, fordi bilen allerede blinker.', false], ['Dytter for at flytte vigepligten til cyklisten.', false]], 'Den højresvingende skal holde tilbage for den ligeudkørende cyklist langs vejen.', ['plan-b-1-1', 'fl-2026'], 'bike', 'Hornet kan lave lyd, ikke lovgivning.'),
  q('q-035', 'kryds', 'fodgaenger-rund', 'Hvad gør du ved udkørslen?', 'Du forlader en rundkørsel. En gående er på vej ud i fodgængerfeltet umiddelbart efter udkørslen, og en cyklist fortsætter langs rundkørslen.', [['Holder tilbage for den gående og standser om nødvendigt før fodgængerfeltet.', true], ['Orienterer mig efter cyklisten og holder tilbage for den, før jeg krydser dens bane.', true], ['Ser kun mod bilerne bagfra.', false], ['Accelererer gennem feltet, fordi jeg allerede er i rundkørslen.', false]], 'Ved udkørslen skal du holde tilbage for cyklisten og for gående, der krydser eller er på vej ud i feltet; stands om nødvendigt.', ['plan-b-1-1', 'fl-2026'], 'pedestrian', 'Rundkørslen er rund; dit ansvar er stadig helt.'),

  q('q-036', 'vejmanoevrer', 'placering-fart', 'Er maksimum også målet?', 'Tavlen viser 80. Det regner kraftigt, sigten er kort, og vand samler sig i hjulsporene.', [['Kører langsommere end 80 efter forholdene.', true], ['Vælger en fart, hvor jeg kan reagere inden for det overskuelige område.', true], ['Holder præcis 80, fordi tavlen kræver det.', false], ['Kører hurtigere for at være kortere tid i regnen.', false]], 'Hastighedsgrænsen er et maksimum. Vej, vejr og sigt kan kræve væsentligt lavere fart.', ['plan-b-1-1', 'fl-2026'], 'weather', 'Tavlen er et loft, ikke en KPI.'),
  q('q-037', 'vejmanoevrer', 'bane-flet', 'Hvordan skifter du vognbane?', 'Du vil fra højre til venstre bane. En bil ligger lidt bag dig i venstre bane, og der er ingen sammenfletningstavle eller ophørende striber.', [['Venter, til vognbaneskiftet kan ske uden at genere bilen.', true], ['Orienterer mig og giver tegn før skiftet.', true], ['Forventer, at bilen i venstre bane altid skal lukke mig ind.', false], ['Skifter, fordi jeg har blinket tre gange.', false]], 'Ved vognbaneskift har den skiftende fører pligt til at sikre, at manøvren kan ske sikkert.', ['plan-b-1-1', 'fl-2026'], 'right', 'Tre blink er stadig bare tre blink.'),
  q('q-038', 'vejmanoevrer', 'afstand-moede', 'Hvordan skaber du plads?', 'På en smal vej står en varebil parkeret i din side. En modkørende er allerede tæt på indsnævringen.', [['Sænker farten og venter før varebilen.', true], ['Lader den modkørende passere.', true], ['Kører først, fordi hindringen er midlertidig.', false], ['Presser igennem med hornet aktiveret.', false]], 'Når hindringen er på din side, må du ikke presse modkørende. Tilpas fart og vent på plads.', ['plan-b-1-1', 'fl-2026'], 'car', 'Hornet gør ikke vejen bredere.'),
  q('q-039', 'vejmanoevrer', 'overhaling', 'Kan du begynde overhalingen?', 'Du vil overhale på landevej med frit udsyn. I venstre spejl ser du en bil bagfra, som allerede har trukket ud for at overhale dig.', [['Bliver i min bane.', true], ['Lader den bagvedkørende gennemføre først.', true], ['Trækker ud foran bilen, fordi jeg blinkede først.', false], ['Sætter farten op for at konkurrere om pladsen.', false]], 'Man må ikke begynde en overhaling, når en bagvedkørende allerede overhaler. Undgå konkurrence og konflikt.', ['plan-b-1-1', 'fl-2026'], 'speed', 'Overhaling er ikke Battle Royale.'),
  q('q-040', 'vejmanoevrer', 'motorvej', 'Hvad gør du ved punkteringen?', 'Et dæk punkterer på motorvejen. Du kan styre bilen ud i nødsporet, og der er en frakørsel langt væk.', [['Fører bilen så langt væk fra kørebanen som muligt.', true], ['Advarer andre og søger sikkerhed væk fra trafikken.', true], ['Skifter straks dæk helt op ad den kørende bane.', false], ['Bakker i nødsporet til sidste frakørsel.', false]], 'Ved tvungen standsning skal bilen væk fra kørebanen, andre advares, og personer beskyttes. Bakning er forbudt.', ['fl-2026', 'plan-b-1-1'], 'motorway', 'Nødsporet er en nødløsning, ikke et værksted med motorvejsudsigt.'),

  q('q-041', 'risiko-teknik', 'energi-miljoe', 'Hvad sparer energi sikkert?', 'Du kører på en jævn vej med god oversigt. Tagboksen er tom, dækkene mangler luft, og du accelererer og bremser gentagne gange uden grund.', [['Fjerner den tomme tagboks, når den ikke skal bruges.', true], ['Korrigerer dæktrykket efter bilens anvisning.', true], ['Kører mere jævnt og forudseende.', true], ['Slukker motoren, mens bilen ruller, for maksimal besparelse.', false]], 'Unødig luftmodstand, lavt dæktryk og ujævn kørsel øger forbruget. Sikker kontrol går altid først.', ['plan-b-1-1'], 'car', 'Tom tagboks: dyr hat, nul personlighed.'),
  q('q-042', 'risiko-teknik', 'fart-energi', 'Hvorfor sænke farten?', 'Du nærmer dig et uoverskueligt vejsving hurtigere end normalt, men er endnu på den lige strækning med godt vejgreb.', [['Sænker farten før svinget.', true], ['Skaber større mulighed for at reagere på noget skjult.', true], ['Venter med al bremsning til midt i svinget.', false], ['Regner med, at dobbelt fart kun giver dobbelt risiko.', false]], 'Tidlig farttilpasning forbedrer udsyn, reaktion og greb. Bevægelsesenergien stiger kraftigt med hastigheden.', ['plan-b-1-1'], 'speed', 'Fysik tilbyder ingen premium-undtagelse.'),
  q('q-043', 'risiko-teknik', 'bremse-greb', 'Hvordan bremser du bedst her?', 'På våd vej opdager du tidligt en kø langt fremme. Bilen har moderne bremseassistenter, og der er god afstand.', [['Slipper speederen og bremser kontrolleret i god tid.', true], ['Bevarer plads til bilen foran.', true], ['Venter og lader nødbremsesystemet klare det.', false], ['Laver store ratudslag under hård bremsning uden behov.', false]], 'Assistenter supplerer føreren. Tidlig, kontrolleret opbremsning bruger vejgrebet bedre og gør kørslen forudsigelig.', ['plan-b-1-1'], 'weather', 'Nødbremsen er brandalarmen, ikke køkkenuret.'),
  q('q-044', 'risiko-teknik', 'udskridning', 'Hvad forebygger udskridning?', 'Der ligger løse blade i et skarpt sving. Du kan se dem i god tid og har fri bane bag dig.', [['Sænker farten før bladene og svinget.', true], ['Styrer og bremser jævnt.', true], ['Accelererer ind i svinget for at øge vejgrebet.', false], ['Venter på udskridningen og improviserer.', false]], 'Forebyggelse er sikrest: lav fart før det glatte område og undgå pludselige kraftpåvirkninger.', ['plan-b-1-1'], 'weather', 'Blade er naturens meget billige drift-mode.'),
  q('q-045', 'risiko-teknik', 'sele-ansvar', 'Hvem skal sikres?', 'Du skal køre en kort tur med et barn på 120 cm. Den godkendte barnestol, som passer til barnets højde og vægt og til bilen, står i en anden bil.', [['Udsætter turen eller skaffer passende sikkerhedsudstyr.', true], ['Sørger som fører for, at barnet er korrekt sikret.', true], ['Kører langsomt uden udstyr, fordi turen er kort.', false], ['Lader barnet holde fast i en voksen.', false]], 'Børn under 135 cm skal som hovedregel bruge godkendt udstyr tilpasset højde og vægt. Føreren er ansvarlig for, at passagerer under 15 år er korrekt sikret.', ['plan-b-1-1', 'fl-2026'], 'car', '“Det er kun rundt om hjørnet” spænder ingen sele.'),

  q('q-046', 'koerekort', 'forloeb', 'Hvad kan appen dokumentere?', 'Du har gennemført alle NATKØRSEL-kapitler hjemme på eget initiativ. En kørelærer har ikke planlagt eller registreret det som selvstudium.', [['Bruger resultatet som frivillig træning.', true], ['Regner ikke hjemmebrugen som automatisk gennemført undervisning.', true], ['Betragter appen som erstatning for de praktiske lektioner.', false], ['Møder til prøve og bruger appens badge som officiel attest.', false]], 'Egen hjemmebrug tæller ikke automatisk som formel undervisning. En godkendt kørelærer kan planlægge, følge op på og registrere højst syv selvstudielektioner i egnede dele af afsnit 1, 3, 6, 9 og 10; afsnit 10 i modul 1 er undtaget. Appens badge er ikke dokumentation.', ['udd-731', 'modern-fstyr'], 'car', 'Et badge kan være flot uden at være et myndighedsdokument.'),
  q('q-047', 'koerekort', 'teoriproeve', 'Hvilke prøveoplysninger er rigtige?', 'Du forbereder en fuld digital øveprøve til kategori B efter Færdselsstyrelsens aktuelle offentlige format.', [['Den bør bestå af 25 situationer.', true], ['Hver situation skal have fire udsagn, hvor mindst ét er korrekt.', true], ['Seks fejl er bestået.', false], ['Prøvetiden er valgfri, hvis den kaldes officiel simulation.', false]], 'Det aktuelle format er 25 situationer, fire udsagn, mindst ét korrekt, 25 minutter og højst fem fejl.', ['prove-fstyr', 'digital-fstyr', 'test-fstyr'], 'car', '25-25-5. Den eneste trio uden comeback-turné.'),
  q('q-048', 'koerekort', 'digital-proeve', 'Hvordan bruger du øveprøven?', 'I NATKØRSEL-øveprøven er du i tvivl om situation 8. Der er tid tilbage, og prøvefladen giver mulighed for markering og navigation.', [['Markere spørgsmålet og vende tilbage senere.', true], ['Besvare alle fire ja/nej-valg, fordi et manglende valg tæller som app-fejl.', true], ['Antage, at NATKØRSEL-optællingen er dokumenteret identisk med myndighedens.', false], ['Tro, at et gemt spørgsmål automatisk er korrekt.', false]], 'NATKØRSEL-bedømmelse: Et scenarie tæller som én app-fejl, hvis ét eller flere af de fire valg er forkerte eller mangler. Færdselsstyrelsen oplyser højst fem fejl for bestået, men den offentlige side beskriver ikke den præcise optælling af flere fejlvalg i samme scenarie.', ['prove-fstyr', 'digital-fstyr'], 'car', 'Bogmærket er en huskeseddel, ikke en tryllestav.'),
  q('q-049', 'koerekort', 'sytten', 'Må den 17-årige køre?', 'En 17-årig med gyldigt dansk B-kørekort vil køre alene i Danmark kl. 19.45 og forventer at være hjemme kl. 20.10. Der er ingen ledsager med.', [['Må køre alene kl. 19.45.', true], ['Skal have en egnet ledsager fra kl. 20.00.', true], ['Må fortsætte alene efter kl. 20.00, fordi turen begyndte før.', false], ['Kan bruge samme solo-regel automatisk i udlandet.', false]], 'Solo-kørsel er tilladt i Danmark kl. 05.00-20.00. Fra kl. 20.00 kræves ledsager, uanset starttidspunkt.', ['17-fstyr', 'kort-718'], 'night', 'Klokken 20.00 laver reglen et hårdt sceneskift.'),
  q('q-050', 'koerekort', 'nybilist', 'Hvad gælder for den nye bilist?', 'En 32-årig fik sit første B-kørekort for ét år siden og skal til middag. Personen mener, at den lave alkoholgrænse kun gælder 17-årige.', [['Den lave grænse gælder også denne nye bilist.', true], ['Den sikre plan er ingen alkohol før kørsel.', true], ['Alder over 18 fritager i de første tre år.', false], ['En bestået teoriprøve alene giver ret til at køre.', false]], 'I de første tre år efter dit første kategori B-kørekort straffes kørsel over 0,20 ‰ i blod eller over 0,10 mg/l udåndingsluft som spirituskørsel, uanset alder. Færdselsstyrelsens praktiske råd er ingen alkohol før kørsel.', ['fl-2026', 'kort-bil-fstyr'], 'car', 'Første kørekort har ingen aldersrabatkode.'),

  q('q-051', 'vejmanoevrer', 'standsning-parkering', 'Må du holde seks meter fra krydset?', 'I en by holder du langs kantstenen 6 m fra den nærmeste kant af den tværgående kørebane. Der er ingen afmærket parkeringsbås og ingen anden særregel.', [['Både standsning og parkering er forbudt her.', true], ['Flytter bilen uden for 10-meterområdet eller til en lovlig afmærket bås.', true], ['Må holde her i under tre minutter.', false], ['Måler de 10 m fra krydsets midte.', false]], 'Uden en afmærket bås må du hverken standse eller parkere i et kryds eller nærmere end 10 m fra den tværgående kørebanes nærmeste kant.', ['fl-2026', 'plan-b-1-1'], 'parking', 'Krydset måles fra kanten, ikke fra dets følelsesmæssige centrum.'),
  q('q-052', 'vejmanoevrer', 'standsning-parkering', 'Må du standse før feltet?', 'Du vil standse 3 m før et fodgængerfelt for at sætte en voksen passager af. Der er ingen afmærket bås eller anden særlig tilladelse.', [['Finder et andet lovligt sted.', true], ['Både standsning og parkering er forbudt på stedet.', true], ['Må standse, fordi afsætningen tager under tre minutter.', false], ['Må standse med havariblinket tændt.', false]], 'Fem-meterreglen før fodgængerfeltet er et standsningsforbud. Kort varighed, afstigning og havariblink ophæver ikke et standsningsforbud.', ['fl-2026', 'plan-b-1-1'], 'pedestrian', 'Havariblink er lys, ikke diplomatisk immunitet.'),
  q('q-053', 'vejmanoevrer', 'standsning-parkering', 'Er det parkering?', 'På en lovlig vejkant uden tavler eller andre forbud bliver du siddende i bilen og venter i to minutter på en passager. Du skaber ikke fare eller ulempe.', [['Det regnes som standsning, ikke parkering.', true], ['De almindelige hensynsregler gælder stadig.', true], ['Det er altid parkering, når motoren er slukket.', false], ['Under tre minutter er tilladt selv på et sted med standsningsforbud.', false]], 'En hensætning under tre minutter regnes ikke som parkering. Den er stadig en standsning og skal derfor overholde alle standsningsforbud og hensynsregler.', ['fl-2026', 'plan-b-1-1'], 'parking', 'Stopuret kan skelne ordene, men det kan ikke flytte bilen.'),
  q('q-054', 'vejmanoevrer', 'standsning-parkering', 'Må påstigningen tage over tre minutter?', 'Ved en C 62-tavle er parkering forbudt, men standsning er tilladt. En gangbesværet passager bruger fire minutter på en sammenhængende påstigning, og bilen er ikke til fare eller ulempe.', [['Påstigningen regnes ikke som parkering.', true], ['Jeg må gennemføre påstigningen hensynsfuldt.', true], ['Efter præcis tre minutter bliver aktiv påstigning automatisk parkering.', false], ['C 62 betyder også, at enhver standsning er forbudt.', false]], 'Af- og påstigning regnes ikke som parkering, også når den konkrete handling varer over tre minutter. C 62 forbyder parkering, mens C 61 forbyder standsning.', ['fl-2026', 'plan-b-1-1', 'afmaerkning'], 'parking', 'Passageren er et menneske, ikke en pitstoprekord.'),
  q('q-055', 'vejmanoevrer', 'standsning-parkering', 'Hvad kræver tidsbegrænsningen?', 'Det er onsdag kl. 10.00. En E 33-tavle med undertavle siger “2 timer, P-skive, hverdage 8-18”. Der er en fri almindelig bås, og ingen anden regel forbyder parkering.', [['Indstiller parkeringsskiven korrekt.', true], ['Forlader pladsen senest efter den angivne parkeringstid.', true], ['Tidsgrænsen gælder først efter kl. 18.', false], ['E 33 uden videre giver ubegrænset parkering.', false]], 'E 33 tillader parkering, men undertavlens vilkår og tidsrum begrænser tilladelsen. Påbudt parkeringsskive skal anvendes.', ['plan-b-1-1', 'afmaerkning'], 'parking', 'P-skiven er den ene kollega, der faktisk logger tiden.'),
  q('q-056', 'vejmanoevrer', 'standsning-parkering', 'Må bilen stå på fortov og cykelsti?', 'I tættere bebygget område vil du stille en almindelig personbil med højre hjul på fortovet og delvist på cykelstien. Der er ingen bås eller tavle, som tillader det.', [['Finder et sted helt uden for fortov og cykelsti.', true], ['Regner ikke med fortovsundtagelsen uden for tættere bebygget område.', true], ['Må holde delvist på cykelstien, når bilen vejer under 3.500 kg.', false], ['Må bruge fortovet, hvis der stadig er lidt plads til gående.', false]], 'Standsning og parkering er forbudt på cykelsti og som hovedregel fortov. Den begrænsede fortovsundtagelse for visse køretøjer uden for tættere bebygget område gælder ikke her og aldrig på cykelstien.', ['fl-2026', 'plan-b-1-1'], 'bike', 'Cykelstien er infrastruktur, ikke bilens fodskammel.'),
  q('q-057', 'vejmanoevrer', 'standsning-parkering', 'Må du bruge handicapbåsen kort?', 'En bås er afmærket med E 33 og handicapsymbol. Du har ikke et gyldigt parkeringskort og vil holde i to minutter for at hente kaffe.', [['Finder en almindelig lovlig plads.', true], ['Lader båsen være fri til et køretøj med gyldig tilladelse.', true], ['Må standse i båsen, fordi det varer under tre minutter.', false], ['Må bruge båsen med havariblink.', false]], 'E 33 med handicapsymbol reserverer arealet til køretøjer med den krævede tilladelse. Kort varighed og havariblink giver ingen adgang.', ['afmaerkning', 'handicapkort'], 'parking', 'Kaffetørst står ikke på parkeringskortet.'),

  q('q-058', 'grundregler', 'tavler-signaler', 'Hvad kræver B 11?', 'Du møder B 11 Ubetinget vigepligt og hajtænder ved et overskueligt kryds. Der er ingen trafik på den vej, du vil køre ind på.', [['Sænker farten og sikrer mig, at vejen er fri.', true], ['Kører uden at tvinge nogen til at ændre fart eller placering.', true], ['Skal altid standse helt, selv når vigepligten kan overholdes uden stop.', false], ['Har kun vigepligt for trafik fra venstre.', false]], 'B 11 og hajtænder betyder ubetinget vigepligt. Fuldt stop kræves ikke i sig selv; det kræves ved B 13 eller når situationen gør standsning nødvendig.', ['plan-b-1-1', 'afmaerkning'], 'yield', 'Trekanten kræver respekt, ikke teaterpause.'),
  q('q-059', 'grundregler', 'tavler-signaler', 'Hvad kræver B 13?', 'Du møder B 13 Stop og en stoplinje. Krydset ser tomt ud, og der er godt udsyn fra linjen.', [['Standser bilen helt ved stoplinjen.', true], ['Kører derefter først, når vigepligten kan overholdes.', true], ['Ruller langsomt videre, fordi udsynet er godt.', false], ['Behandler tavlen som B 11 uden stoppligt.', false]], 'B 13 kræver fuld standsning ved stoplinjen og derefter ubetinget vigepligt.', ['plan-b-1-1', 'afmaerkning', 'fl-2026'], 'stop', 'STOP er usædvanligt tydelig kommunikation.'),
  q('q-060', 'grundregler', 'tavler-signaler', 'Hvad betyder C 55 med 60?', 'En C 55-tavle viser 60. Vejen er våd, og sigten er kortere end normalt.', [['60 km/t er den højest tilladte hastighed fra tavlen.', true], ['Kører langsommere, hvis vej og sigt kræver det.', true], ['Skal holde præcis 60 km/t.', false], ['Må overskride 60, når vejen er tom.', false]], 'C 55 fastsætter en maksimal hastighed. Den konkrete sikre fart kan være lavere på grund af vejr, udsyn og trafik.', ['plan-b-1-1', 'afmaerkning', 'fl-2026'], 'speed', '60 er et loft, ikke et abonnement.'),
  q('q-061', 'grundregler', 'tavler-signaler', 'Hvilken side vælger du?', 'Ved en helle viser D 15 Påbudt passage en hvid pil skråt ned mod venstre. Kørebanen til venstre for tavlen er åben.', [['Passerer tavlen på venstre side.', true], ['Tilpasser fart og placering før hellen.', true], ['Vælger frit højre side, fordi der ikke kommer modkørende.', false], ['Kører over hellen, hvis det sparer tid.', false]], 'D 15 angiver, at tavlen skal passeres på den side, pilen peger.', ['plan-b-1-1', 'afmaerkning'], 'right', 'Pilen er ikke en kreativ skriveøvelse.'),
  q('q-062', 'grundregler', 'tavler-signaler', 'Hvilke linjer følger du?', 'Ved et vejarbejde leder midlertidige gule linjer trafikken mod venstre, mens de gamle hvide linjer fortsætter ligeud mod et afspærret område med vejarbejdere.', [['Følger den gule midlertidige afmærkning.', true], ['Sænker farten og holder god afstand til arbejderne.', true], ['Følger de hvide linjer, fordi de er permanente.', false], ['Kører mellem gul og hvid linje efter eget valg.', false]], 'Midlertidig gul regulering ved vejarbejde skal respekteres frem for modstridende hvid afmærkning. Farten skal tilpasses de arbejdende og den ændrede vejføring.', ['plan-b-1-1', 'fl-2026'], 'right', 'Gul er midlertidig, ikke valgfri.'),
  q('q-063', 'vej-vejr', 'sigt', 'Hvilket lys bruger du i regnen?', 'Det er dag, men kraftig regn gør sigten dårlig. Bilens kørelys tænder kun forlygter foran, mens baglygterne er slukket.', [['Tænder nærlys, så bilen også er tydelig bagfra.', true], ['Tilpasser farten til den korte sigt.', true], ['Kører kun med positionslys.', false], ['Beholder forreste kørelys alene, fordi det er dag.', false]], 'Kraftig regn kan være lygtetændingstid. Brug mindst nærlys; særligt kørelys alene opfylder ikke kravet, når bagenden ikke er tilstrækkeligt belyst.', ['plan-b-1-1', 'fl-2026'], 'weather', 'Baglygterne kan ikke arbejde hjemmefra.'),

  q('q-064', 'kryds', 'stop', 'Er ét stop altid nok?', 'Ved B 13 standser du helt ved stoplinjen. En mur spærrer udsynet derfra, men du kan derefter køre langsomt frem til et sted før krydset, hvor der er udsyn.', [['Standser først ved stoplinjen.', true], ['Kører forsigtigt frem og standser igen, hvis det er nødvendigt for at orientere mig.', true], ['Springer stoplinjen over og standser kun ved udsynet.', false], ['Kører direkte ud, fordi første stop ophæver vigepligten.', false]], 'Stoppligten opfyldes ved stoplinjen. Hvis der ikke er udsyn, må du derefter liste frem og om nødvendigt standse igen, mens den ubetingede vigepligt fortsat gælder.', ['plan-b-1-1', 'fl-2026'], 'stop', 'Første stop var loven; næste kan være sund fornuft.'),
  q('q-065', 'kryds', 'ubetinget', 'Hvem holder du tilbage for ved hajtænderne?', 'Du vil lige over et kryds med hajtænder. En cyklist kommer fra højre på den vej, du skal krydse, og vil fortsætte ligeud.', [['Holder tilbage for cyklisten.', true], ['Venter, så cyklisten ikke skal ændre fart eller placering.', true], ['Kører først, fordi en cykel ikke tæller som kørende færdsel.', false], ['Har kun vigepligt for biler.', false]], 'Hajtænder giver ubetinget vigepligt for al kørende færdsel på den vej, du kører ind på eller over, også cyklister.', ['plan-b-1-1', 'fl-2026'], 'yield', 'Hajtænderne spiser ikke cyklister ud af reglen.'),
  q('q-066', 'kryds', 'sving-cykel', 'Hvad gør du med cyklisten bagfra?', 'Du vil højresvinge over en cykelsti. Ved første spejlkig er cyklisten bag bilen, men før svinget er cyklisten nået op langs din højre side.', [['Orienterer mig igen lige før svinget.', true], ['Holder tilbage og lader cyklisten fortsætte.', true], ['Svinger, fordi cyklisten var bagved ved første blik.', false], ['Bruger blinklyset som fortrinsret.', false]], 'Orienteringen skal gentages, fordi cyklister kan nå frem under forberedelsen. Den højresvingende skal holde tilbage for den ligeudkørende cyklist.', ['plan-b-1-1', 'fl-2026'], 'bike', 'Første spejlkig har ingen udløbsgaranti.'),
  q('q-067', 'kryds', 'hoejre', 'Gælder højre vigepligt i T-krydset?', 'Du kører ligeud på en lille vej. Fra din højre side munder en lige så lille vej ud. Der er ingen tavler, hajtænder, fortovsoverkørsel eller anden særlig regulering.', [['Holder tilbage for en bil fra højre.', true], ['Kontrollerer, at den anden fører faktisk overholder sine pligter.', true], ['Har automatisk fortrinsret, fordi jeg kører ligeud.', false], ['Har automatisk fortrinsret, fordi min vej fortsætter visuelt.', false]], 'Når ingen har ubetinget vigepligt, gælder højre vigepligt også i et T-kryds. Vejens visuelle forløb ændrer ikke reglen alene.', ['plan-b-1-1', 'fl-2026'], 'right', 'T-formen er geometri, ikke fortrinsret.'),
  q('q-068', 'kryds', 'fodgaenger-rund', 'Hvad gør du ved det uregulerede felt?', 'Du nærmer dig et ureguleret fodgængerfelt. En gående står ved kanten og er tydeligt på vej ud i feltet.', [['Sænker farten og standser om nødvendigt.', true], ['Lader den gående passere uden fare eller ulempe.', true], ['Fortsætter, fordi personen endnu ikke står midt i feltet.', false], ['Dytter for at få personen til at vente.', false]], 'Ved et ureguleret felt skal hastigheden tilpasses, så gående i eller på vej ud i feltet ikke udsættes for fare eller ulempe; stands om nødvendigt.', ['fl-2026', 'plan-b-1-1'], 'pedestrian', 'Fodgængerfeltet er ikke et modspil i sten-saks-papir.'),
  q('q-069', 'koerekort', 'sytten', 'Hvad gælder præcis kl. 05.00?', 'En 17-årig har gyldigt dansk B-kørekort og befinder sig i Danmark. Klokken skifter fra 04.59 til 05.00, og der er ingen ledsager i bilen.', [['Må begynde at køre alene kl. 05.00.', true], ['Skal fortsat følge alle almindelige førerpligter.', true], ['Skal vente til kl. 05.01.', false], ['Må allerede køre alene kl. 04.59.', false]], 'I Danmark må en 17-årig køre uden ledsager fra og med kl. 05.00 til kl. 20.00.', ['17-fstyr', 'kort-718'], 'night', 'Klokken 05.00 trykker reglen på start.'),
  q('q-070', 'koerekort', 'sytten', 'Hvad gælder præcis kl. 20.00?', 'En 17-årig kører alene i Danmark og holder lovligt ind kl. 19.59. Personen vil fortsætte kl. 20.00 uden ledsager.', [['Lader bilen stå eller får en egnet ledsager med.', true], ['Regner kravet fra det aktuelle klokkeslæt, ikke turens start.', true], ['Må fortsætte alene, fordi turen begyndte før kl. 20.00.', false], ['Må fortsætte alene til kl. 20.59.', false]], 'Fra og med kl. 20.00 til kl. 05.00 kræver 17-årsordningen en egnet ledsager, indtil føreren fylder 18 år.', ['17-fstyr', 'kort-718'], 'night', 'Klokken 20.00 lukker solo-vinduet uden rulletekster.'),
  q('q-071', 'kryds', 'ubetinget', 'Har du vigepligt fra gården?', 'Du kører ud fra en privat gård, krydser et fortov og vil ind på vejen. En cyklist og en bil nærmer sig på vejen.', [['Holder tilbage for både cyklist og bil.', true], ['Kører først, når ingen tvinges til at ændre fart eller placering.', true], ['Bruger højre vigepligt og kører foran bilen fra venstre.', false], ['Har fortrinsret, fordi der ikke er hajtænder.', false]], 'Udkørsel fra ejendom og passage over fortov giver ubetinget vigepligt, også uden hajtænder.', ['plan-b-1-1', 'fl-2026'], 'yield', 'Indkørslen har adresse, ikke fortrinsret.'),

  q('q-072', 'grundmanoevrer', 'parkering-manovre', 'Hvordan begynder du parkeringen?', 'På lukket øvelsesplads skal du forlæns ind i et afmærket område langs højre kant. Der er god plads til den første øvelse, og kørelæreren sidder ved siden af.', [['Kører så langsomt, at jeg kan bedømme hjul og bilens hjørner.', true], ['Ser kun på højre forskærm og ignorerer resten af området.', false], ['Orienterer mig omkring bilen under hele manøvren.', true], ['Bruger pladsen til rolige korrektioner.', true]], 'Afsnit 2.7 begynder med god plads til korrektion. Lav fart og fordelt orientering gør det muligt at bedømme bilens bredde og hjulplacering. Det skal øves praktisk med kørelærer.', ['plan-b-1-1'], 'parking', 'Keglerne tager ikke skade af langsom beslutningskraft.'),
  q('q-073', 'grundmanoevrer', 'parkering-manovre', 'Er slutstillingen godkendt?', 'Efter forlæns parkering på lukket øvelsesplads står bilen parallelt med højre vejkant. Højre hjul er 30 cm fra kanten. Kørelæreren beder dig vurdere resultatet.', [['Betragter et korrekt appsvar som gennemført praktisk øvelse.', false], ['Korrigerer placeringen roligt, når området er frit.', true], ['Accepterer 30 cm, fordi bilen allerede står parallelt.', false], ['Sigter mod højst 20 cm mellem højre hjul og kanten.', true]], 'Slutstillingen i planens øvelse er parallel med kanten og højst 20 cm fra højre hjul til kanten. Færdigheden kræver fysisk træning på øvelsesplads.', ['plan-b-1-1'], 'parking', 'Parallel er godt; parallel i nabopostnummeret er stadig for langt væk.'),

  q('q-074', 'vejmanoevrer', 'trafiksanering', 'Hvordan kører du i området?', 'Du passerer E 51 og kører ind i et opholds- og legeområde. Et barn leger på kørearealet, og der er ingen særligt afmærkede parkeringspladser.', [['Parkerer langs husmuren, fordi der ikke er en forbudstavle.', false], ['Bliver holdende, til barnet har set bilen, givet plads og ikke kan komme farligt nær den.', true], ['Kører med meget lav fart og normalt under 15 km/t.', true], ['Forventer, at barnet straks forlader vejarealet.', false]], 'I et opholds- og legeområde sker motorkørsel på de gåendes betingelser og normalt med hastighed under 15 km/t. Føreren fortsætter først, når barnet har set bilen og givet plads, og ingen kan komme farligt nær den. Parkering må kun ske på særligt afmærkede pladser.', ['plan-b-1-1', 'fl-2026', 'afmaerkning'], 'pedestrian', 'Her er bilen gæst. Barnet har tydeligvis booket hele gulvet.'),
  q('q-075', 'vejmanoevrer', 'trafiksanering', 'Hvad kræver cykelgaden?', 'Du kører bil i en skiltet cykelgade. To cyklister kører foran side om side, og et fartdæmpende bump ligger længere fremme. Ingen kan sikkert passere lige nu.', [['Bliver bag cyklisterne uden at presse dem.', true], ['Dytter gentagne gange, så cyklisterne flytter sig.', false], ['Overhaler tæt, fordi bilen er hurtigere.', false], ['Sænker farten yderligere før bumpet.', true]], 'I cykelgade skal motorkørende vise særlig agtpågivenhed og må ikke unødigt hindre eller presse cyklister. Et bump kan kræve yderligere fartnedsættelse.', ['plan-b-1-1', 'fl-2026', 'afmaerkning'], 'bike', 'Cykelgaden har ikke bestilt en bilbaseret trommesolo.'),

  q('q-076', 'kryds', 'venstresving', 'Hvornår fuldfører du svinget?', 'Du vil svinge til venstre i et signalreguleret kryds med grønt lys, men uden grøn venstrepil. En modkørende motorcykel fortsætter ligeud, og en bil foran dig spærrer kortvarigt noget af udsynet.', [['Venter på motorcyklen.', true], ['Følger tæt efter bilen foran uden selv at kontrollere modkørende.', false], ['Venter med at fuldføre svinget, til udsynet er tilstrækkeligt.', true], ['Regner grønt lys som fortrinsret over modkørende.', false]], 'Grønt lys uden særlig venstrepil ophæver ikke pligten til at holde tilbage for modkørende. Den enkelte fører skal selv sikre frit udsyn og et tilstrækkeligt stort ophold.', ['plan-b-1-1', 'fl-2026'], 'right', 'Grønt lys er adgang til vurderingen, ikke VIP-armbånd gennem motorcyklen.'),
  q('q-077', 'kryds', 'venstresving', 'Hvem skal du holde tilbage for?', 'Efter at de modkørende er passeret, vil du afslutte venstresvinget. På den vej, du drejer ind på, krydser en gående kørebanen, og en cyklist nærmer sig fra højre på en tydeligt afmærket dobbeltrettet cykelsti.', [['Holder tilbage for den gående.', true], ['Ser kun efter biler, fordi de modkørende allerede er passeret.', false], ['Svinger foran cyklisten, fordi cyklisten kommer fra højre på den nye vej.', false], ['Kontrollerer begge retninger på cykelstien og holder tilbage for cyklisten.', true]], 'Ved venstresving skal føreren også beskytte gående og cyklister på den vej, der svinges ind på. En dobbeltrettet cykelsti kræver orientering i begge retninger.', ['plan-b-1-1', 'fl-2026'], 'pedestrian', 'Svinget er først færdigt, når hele rollelisten er set.'),

  q('q-078', 'vejmanoevrer', 'letbane', 'Må du krydse sporet nu?', 'Du nærmer dig et kryds over letbanespor. Signalet for din kørselsretning viser rødt, og et letbanetog nærmer sig på sporet. Der er plads på den anden side, men ingen grøn pil eller anden tilladelse.', [['Kører over, fordi toget ser ud til at være langt væk.', false], ['Standser før stoplinjen.', true], ['Følger et særskilt signal, der kun gælder letbanen.', false], ['Venter på signal for min kørselsretning og kontrollerer toget igen.', true]], 'Du skal følge signalet for din egen kørselsretning. Togets lange bremselængde og bundne spor kræver skærpet kontrol, også når der senere bliver grønt.', ['plan-b-1-1', 'fl-2026', 'afmaerkning'], 'stop', 'Letbanen kan ikke swipe til en anden vognbane.'),
  q('q-079', 'vejmanoevrer', 'letbane', 'Hvordan dækkes undervisningen?', 'Køreskolens placering gør det umuligt at nå et letbaneområde, køre relevant dér og vende tilbage inden for en praktisk lektion på mindst 45 minutter. Kørelæreren planlægger derfor afsnit 7.21.', [['Gennemgår de praktiske færdigheder ved letbane i teorilokalet.', true], ['Udelader hele emnet, fordi praktisk kørsel ikke kan nås.', false], ['Arbejder med signaler, sporforløb, risici og korrekt handling.', true], ['Lader en frivillig appsession erstatte kørelærerens undervisning.', false]], 'Planen kræver praktisk letbanekørsel, når en lektion på mindst 45 minutter gør den mulig. Ellers skal de praktiske færdigheder ved letbane undervises i teorilokalet.', ['plan-b-1-1'], 'car', 'Letbanen kommer ikke til køreskolen, men undervisningen gør.'),

  q('q-080', 'koerekort', 'sammensat-koersel', 'Hvad skal ske før og efter turen?', 'Du skal have en afsluttende praktisk lektion i afsnit 7.22. Kørelæreren og du har valgt rute, men har endnu ikke aftalt et konkret læringsmål eller planlagt opfølgning.', [['Måler kun turens kvalitet på, hvor hurtigt ruten blev kørt.', false], ['Aftaler et konkret mål for lektionen sammen.', true], ['Følger efter turen op med refleksion og feedback.', true], ['Lader appens samlede score erstatte kørelærerens vurdering.', false]], 'Afsnit 7.22 er praktisk kørsel med fælles mål, opfølgning og refleksion. Appen kan forberede samtalen, men gennemfører eller dokumenterer ikke lektionen.', ['plan-b-1-1', 'udd-731'], 'car', 'Ruten må gerne have et mål, der ikke er “hurtigst til bageren”.'),
  q('q-081', 'koerekort', 'sammensat-koersel', 'Hvordan bruger du hjælpesystemerne?', 'Under den afsluttende praktiske lektion følger du en planlagt GPS-rute. Systemet foreslår en sen vognbanemanøvre, mens tæt trafik gør manøvren usikker. Kørelæreren observerer din selvstændige kørsel.', [['Fortsætter sikkert og lader om nødvendigt GPS-ruten blive beregnet om.', true], ['Skifter bane straks, fordi GPS-instruktionen indgår i lektionen.', false], ['Betragter navigation som erstatning for egen orientering.', false], ['Orienterer mig og følger den faktiske trafik frem for en sen instruktion.', true]], 'Ruteplanlægning og førerstøtte kan indgå i sammensat kørsel, men er hjælpemidler. Eleven skal fortsat køre selvstændigt og ansvarligt efter de faktiske forhold.', ['plan-b-1-1'], 'car', 'GPS’en kan genberegne. Det kan skærmen ikke gøre med et sidespejl.'),

  q('q-082', 'risiko-teknik', 'hoej-vejkant', 'Hvordan genvinder du kontrollen?', 'På et godkendt køreteknisk anlæg under instruktion kommer bilens højre hjul ud over en høj vejkant. Bilen har stadig for høj fart til sikkert at styre hjulene direkte op over kanten.', [['River straks rattet kraftigt til venstre.', false], ['Holder retningen roligt langs kanten.', true], ['Bremser forsigtigt og reducerer farten.', true], ['Styrer først tilbage over kanten, når farten er lav nok.', true]], 'En brat tilbageføring over en høj kant ved for høj fart kan udløse tab af kontrol. På anlægget trænes rolig styring langs kanten, forsigtig fartreduktion og først derefter kontrolleret tilbageføring.', ['plan-b-1-1', 'udd-731'], 'weather', 'Kanten skal forhandles med ro, ikke udfordres til rat-duel.'),
  q('q-083', 'risiko-teknik', 'hoej-vejkant', 'Hvor må du øve dette?', 'Efter at have læst om høje vejkanter vil du selv træne manøvren på en tom offentlig landevej. Vejen har en høj rabatkant, og der er ingen kørelærer eller afspærring.', [['Undlader forsøget på offentlig vej.', true], ['Bruger appteksten som tilladelse til selvtræning.', false], ['Træner kun øvelsen på godkendt køreteknisk anlæg med kørelærer.', true], ['Vælger høj fart, så øvelsen ligner planens risikosituation.', false]], 'Afsnit 9.5 er en praktisk øvelse på køreteknisk anlæg under kørelærerens ledelse. Appen forbereder regelforståelsen, men gennemfører ikke den fysiske træning.', ['plan-b-1-1', 'udd-731'], 'car', '“Tom vej” er ikke et gør-det-selv køreteknisk anlæg.')
];
