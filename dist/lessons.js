// Original Danish micro-lessons. Source checked 2026-10-12; see research reviews.
export const LESSONS = {
  "cockpit": {
    "sectionId": "cockpit",
    "chapterId": "bil",
    "lead": "En sikker kørestilling gør betjeningen rolig og udsynet pålideligt, før bilen bevæger sig.",
    "cards": [
      {
        "title": "Byg fra sædet",
        "body": "Indstil først sæde og ryglæn, så pedaler og rat kan betjenes uden at strække kroppen. Indstil derefter spejlene fra den færdige siddestilling. Flytter du sædet bagefter, ændrer du også det udsnit, spejlene viser.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.1.1"
      },
      {
        "title": "Udsyn er et system",
        "body": "Forrude, sideruder og spejle supplerer hinanden, men de fjerner ikke alle skjulte områder. Brug spejlene som tidlig information, og supplér med direkte orientering, når en manøvre kan bringe cyklister, gående eller andre tæt på bilen.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.1.2 og 2.1.1"
      },
      {
        "title": "Kabinen skal tåle en opbremsning",
        "body": "En løs telefon eller flaske kan flytte sig ved en pludselig opbremsning og forstyrre både fører og pedaler. Placér genstande stabilt, spænd sikkerhedsselen korrekt, og lær betjeningsgrebene, mens bilen holder stille.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.1.1-1.1.5 og 2.1.1"
      }
    ],
    "case": {
      "context": "Du overtager en delebil, hvor sædet står langt tilbage, og sidespejlene viser mest af bilens egne sider.",
      "action": "Bliv holdende, indstil sæde og ryglæn, og indstil derefter spejlene fra din endelige position.",
      "why": "Så kan du nå betjeningen sikkert og stole på, at spejlbilledet passer til den stilling, du faktisk kører i.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 2.1.1"
    },
    "recall": {
      "prompt": "Hvorfor skal sædet indstilles før spejlene?",
      "answer": "Fordi en ændret siddestilling også ændrer synsvinklen i spejlene og kan gøre den tidligere indstilling misvisende."
    },
    "practicalNote": "Korrekt indstilling og orientering skal øves fysisk i undervisningsbilen med en kørelærer."
  },
  "assistenter": {
    "sectionId": "assistenter",
    "chapterId": "bil",
    "lead": "Førerassistenter kan varsle og støtte, men føreren skal stadig forstå situationen og vælge den sikre handling.",
    "cards": [
      {
        "title": "Støtte er ikke overtagelse",
        "body": "En assistent reagerer på de oplysninger, dens sensorer og data kan registrere. Afmærkning, vejarbejde, snavs eller usædvanlige forløb kan begrænse hjælpen. Hold derfor selv øje med vej, færdsel og tegn, også når systemet er aktivt.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.1.6"
      },
      {
        "title": "Kontrollér signalet",
        "body": "En advarsel er en anledning til at undersøge situationen, ikke til en automatisk bevægelse med rat eller pedaler. Se, hvad der udløste signalet, orientér dig omkring bilen, og reagér kun på en måde, der passer til den faktiske trafik.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.1.6 og 4.1.5"
      },
      {
        "title": "Når vej og skærm er uenige",
        "body": "Et kort eller en hastighedsvisning kan være forældet eller have aflæst et tegn forkert. Synlig, gældende regulering og de aktuelle forhold skal styre kørslen. Usikkerhed bør føre til mere observation og en forsigtig tilpasning.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.1.6; Færdselsloven § 4"
      }
    ],
    "case": {
      "context": "Bilens skærm viser en højere tilladt hastighed end et tydeligt midlertidigt skilt ved et vejarbejde.",
      "action": "Følg skiltningen, sænk hastigheden i god tid, og hold øje med arbejdere og ændrede baneforløb.",
      "why": "Assistentens data kan være uaktuelle, mens skiltning og den konkrete risiko på stedet gælder for din kørsel.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 1.1.6; Færdselsloven §§ 3-4"
    },
    "recall": {
      "prompt": "Hvad gør du først, hvis en assistent advarer, men årsagen ikke er tydelig?",
      "answer": "Bevar kontrollen, orientér dig i den virkelige trafik og tilpas kørslen efter det, du kan se og sikkert vurdere."
    },
    "practicalNote": "Eleven skal kunne aflæse og forstå systemerne i undervisningsbilen. En eventuel demonstration skal følge kørelærerens og fabrikantens anvisninger og må aldrig fremprovokeres ved at skabe en faresituation."
  },
  "bremser": {
    "sectionId": "bremser",
    "chapterId": "bil",
    "lead": "Bremsekontrollen skal opdage afvigelser, før de bliver til manglende kontrol i trafikken.",
    "cards": [
      {
        "title": "Pedalen giver information",
        "body": "Bremsepedalens modstand og vandring skal opleves som normal for bilen. En pedal, der synker ved vedvarende tryk eller føles markant anderledes, kan varsle en fejl. Undersøg afvigelsen, før bilen bruges i trafik.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.3, pkt. 13-15 og 18-21"
      },
      {
        "title": "Retning under bremsning",
        "body": "Ved en forsigtig bremseprøve på et egnet sted skal bilen bevare en stabil retning. Trækker den tydeligt til en side, er bremsekraften muligvis ujævn. Det øger risikoen for at forlade sporet ved hårdere bremsning.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.2-1.2.3"
      },
      {
        "title": "Reagér før turen",
        "body": "En kontrollampe, unormal lyd eller ændret bremsevirkning skal ikke normaliseres, fordi bilen stadig kan standse. Sammenhold signalet med bilens betjeningsvejledning, og undlad videre kørsel, hvis bremsesikkerheden ikke kan fastslås før turen.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.3 og 1.3.1"
      }
    ],
    "case": {
      "context": "Før afgang holder du et jævnt tryk på bremsepedalen, men pedalen fortsætter langsomt længere ned end normalt.",
      "action": "Lad bilen stå, og få bremsesystemets tilstand afklaret, før du kører ud.",
      "why": "Den ændrede pedalvandring kan være tegn på en fejl; en prøve i trafikken udsætter både dig og andre for en unødig risiko.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.3"
    },
    "recall": {
      "prompt": "Hvorfor er det utilstrækkeligt kun at kontrollere, om bilen kan standse ved lav fart?",
      "answer": "Fordi pedaladfærd, retningsstabilitet og advarsler kan afsløre fejl, som bliver kritiske ved en kraftigere eller gentagen bremsning."
    },
    "practicalNote": "Bremsekontrol og bremseprøve skal demonstreres og øves fysisk med kørelærer på et egnet sted."
  },
  "lys-daek": {
    "sectionId": "lys-daek",
    "chapterId": "bil",
    "lead": "Lys og dæk forbinder førerens hensigt med vejgreb, synlighed og mulighed for at blive forstået af andre.",
    "cards": [
      {
        "title": "Lys skal både ses og vise",
        "body": "Lygter hjælper dig med at se, men gør også bilen læsbar for andre. Kontrollér derfor funktion, renhed og synlige skader. En lygte, der lyser, kan stadig være utilstrækkelig, hvis den er dækket eller beskadiget.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.4 og 6.2.5"
      },
      {
        "title": "Mønsteret leder vand væk",
        "body": "Dækmønster og dækkenes tilstand har betydning for kontakten med våd vej. Den lovlige mindste mønsterdybde er 1,6 mm, men føreren skal også reagere på skader, forkert tryk og forhold, der svækker vejgrebet.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.7, punkt om mindst 1,6 mm mønsterdybde"
      },
      {
        "title": "Blinkrytmen kan afsløre en fejl",
        "body": "En usædvanligt hurtig blinkrytme kan pege på, at en blinklygte ikke virker som forventet. Gå rundt om bilen og kontrollér alle relevante lygter i stedet for at antage, at lampen i instrumenthuset beviser funktionen udenfor.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.4"
      }
    ],
    "case": {
      "context": "Efter kraftig regn opdager du en skade i et fordæk, samtidig med at blinklyset slår hurtigere end normalt.",
      "action": "Bliv holdende, kontrollér dækket og de udvendige blinklygter, og få fejlene bragt i orden før turen.",
      "why": "Dækket påvirker vejgrebet, og et svigtende blinksignal kan gøre dine manøvrer uklare for andre trafikanter.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.4 og 1.2.7"
    },
    "recall": {
      "prompt": "Hvorfor er et tændt kontrolsymbol for blinklys ikke i sig selv en fuld funktionskontrol?",
      "answer": "Fordi den udvendige lygte stadig kan være defekt eller skjult; den faktiske funktion skal kontrolleres på bilen."
    },
    "practicalNote": "Lygte- og dækkontrol skal udføres på en rigtig bil; teksten kan ikke erstatte den praktiske demonstration."
  },
  "motor-dokumenter": {
    "sectionId": "motor-dokumenter",
    "chapterId": "bil",
    "lead": "Advarsler og registreringsoplysninger hjælper føreren med at afgøre, om bilen passer til turen og må bruges sikkert.",
    "cards": [
      {
        "title": "Advarsler kræver fortolkning",
        "body": "En kontrollampe fortæller, at et system kræver opmærksomhed, men farve og symbol har forskellig betydning fra bil til bil. Brug bilens vejledning, og skeln mellem information, snarlig kontrol og forhold, der kræver øjeblikkelig standsning.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.1.5, 1.2.5 og 1.3.1"
      },
      {
        "title": "Lyd, lugt og røg er også signaler",
        "body": "Motorens tilstand aflæses ikke kun i instrumenthuset. Ny mekanisk støj, brændt lugt eller røg kan pege på en fejl, selv uden en lampe. Stands sikkert og undersøg situationen frem for at vente på et tydeligere svigt.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.5 og 1.3.1"
      },
      {
        "title": "Dokumentet sætter rammer",
        "body": "Registreringsattesten indeholder oplysninger om køretøjet, som er relevante ved blandt andet trailer og belastning. Sammenhold bilens og påhængskøretøjets data med opgaven og førerretten; udseendet alene fortæller ikke, hvad kombinationen må.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.3.1, pkt. 2-5; 6.1.3, pkt. 2-3"
      }
    ],
    "case": {
      "context": "Du låner en bil til at trække en trailer og ser samtidig en ukendt advarselslampe ved start.",
      "action": "Slå lampen op, afklar bilens tilstand, og sammenhold registreringsoplysningerne for bil, trailer og førerret før afgang.",
      "why": "Så undgår du både at overse en teknisk fejl og at vælge en kombination, som bilen eller din førerret ikke dækker.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 1.1.2, 1.2.5 og 1.3.1, pkt. 2-5; 6.1.3, pkt. 2-3"
    },
    "recall": {
      "prompt": "Hvorfor bør registreringsoplysninger kontrolleres, selv når bilen ser stor nok ud til traileren?",
      "answer": "Fordi tilladte vægte og kombinationer følger registrerede oplysninger og førerret, ikke et visuelt skøn."
    },
    "practicalNote": "Kontrollamper og dokumenter varierer mellem biler og skal gennemgås på det konkrete køretøj."
  },
  "start-stop": {
    "sectionId": "start-stop",
    "chapterId": "grundmanoevrer",
    "lead": "Igangsætning og standsning bliver sikre, når observation, tydelig kommunikation og præcis betjening sker i den rigtige rækkefølge.",
    "cards": [
      {
        "title": "Skab et hul før du bevæger bilen",
        "body": "Orientér dig fremad, i spejle og direkte mod skjulte områder, før du sætter i gang. Vurder ikke kun, om vejen er tom nu, men også om en cyklist eller bil kan nå frem, mens bilen forlader kanten.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.2 og 7.1; Færdselsloven § 3"
      },
      {
        "title": "Blinklyset fortæller, det giver ikke plads",
        "body": "Giv tegn i god tid, når andre har nytte af det, men vent stadig på et sikkert hul. Et blinklys oplyser om din hensigt; det ændrer ikke andre trafikanters fart, placering eller ret til at fortsætte.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 7.1; Færdselsloven § 32"
      },
      {
        "title": "Standsningen planlægges bagfra",
        "body": "Se tidligt efter et lovligt og overskueligt sted, kontrollér trafikken bagved, og sænk farten jævnt. Den sidste placering ved kanten bliver lettere, når du har skabt tid til styre- og bremsekorrektioner.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.2 og 7.18"
      }
    ],
    "case": {
      "context": "Du holder ved kantstenen og vil sætte i gang, mens en cyklist nærmer sig bagfra langs bilens højre side.",
      "action": "Bliv holdende, orientér dig igen, og sæt først i gang, når cyklisten er passeret og der er et sikkert hul.",
      "why": "Cyklisten kan ligge uden for spejlets dækkede område, og dit blinklys giver ikke ret til at skære ind i cyklistens bane.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 7.1; Færdselsloven §§ 3 og 32"
    },
    "recall": {
      "prompt": "Hvad skal du vurdere ud over, om vejen ser fri ud i selve øjeblikket?",
      "answer": "Om en trafikant kan nå ind i din planlagte bane, mens igangsætningen gennemføres."
    },
    "practicalNote": "Rækkefølge, koblingspunkt og jævn betjening kræver fysisk øvelse med kørelærer."
  },
  "rat-blik": {
    "sectionId": "rat-blik",
    "chapterId": "grundmanoevrer",
    "lead": "Blik og ratføring skal arbejde sammen, så bilen følger den valgte linje uden sene, store korrektioner.",
    "cards": [
      {
        "title": "Se mod den vej, du vil følge",
        "body": "Et blik tæt foran motorhjelmen opdager afvigelser sent og fremkalder mange små ratbevægelser. Flyt blikket længere frem langs den ønskede bane, og brug korte kontrolblik nær bilen, når afstand til kant eller forhindring skal vurderes.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.3-2.4"
      },
      {
        "title": "Rattet skal kunne korrigeres",
        "body": "Hold rattet, så begge hænder kan styre præcist og hurtigt uden at spænde kroppen. Lad hænderne samarbejde gennem svinget, og ret op i takt med bilens bevægelse frem for at slippe kontrollen brat.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.3-2.4"
      },
      {
        "title": "Lav fart giver læringstid",
        "body": "Ved grundmanøvrer skal farten være så lav, at du kan standse ved usikkerhed og nå at se virkningen af en ratbevægelse. Højere fart forstørrer en forkert kurs og reducerer tiden til at rette den.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.3-2.6"
      }
    ],
    "case": {
      "context": "På øvelsespladsen ser du konstant på kantlinjen tæt ved forhjulet, og bilen slingrer trods mange små rettelser.",
      "action": "Sænk farten, ret blikket længere frem på den ønskede linje, og brug korte kontrolblik til siden.",
      "why": "Det længere blik afslører kursændringen tidligere, så ratbevægelserne kan blive mindre og bilen mere stabil.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 2.3-2.4"
    },
    "recall": {
      "prompt": "Hvorfor giver et fast blik lige foran bilen ofte mere slingren?",
      "answer": "Fordi kursafvigelser opdages sent, så føreren reagerer med hyppige og større korrektioner."
    },
    "practicalNote": "Blikføring, ratgreb og samspil mellem hænderne skal trænes fysisk på lukket øvelsesplads."
  },
  "bakning": {
    "sectionId": "bakning",
    "chapterId": "grundmanoevrer",
    "lead": "Bakning kræver lav fart og gentagen orientering, fordi bilens bevægelse og skjulte områder ændrer sig under hele manøvren.",
    "cards": [
      {
        "title": "Bagenden bestemmer pladsbehovet",
        "body": "Når du bakker og drejer, flytter bilens bagende sig mod den valgte side, mens fronten kan svinge ud modsat. Kontrollér derfor både området bag bilen og pladsen ved forhjørnerne; ét spejl kan ikke dække hele bevægelsen.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.5 og 7.5"
      },
      {
        "title": "Orienteringen skal gentages",
        "body": "En fri rute ved manøvrens begyndelse er ikke en garanti for resten. Gående, cyklister eller køretøjer kan komme ind bag bilen. Bak så langsomt, at du kan standse straks, når udsynet ændres eller bliver utilstrækkeligt.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.5 og 7.5; Færdselsloven § 3"
      },
      {
        "title": "Kameraet er kun ét udsnit",
        "body": "Et bakkamera kan vise lave genstande bag bilen, men billedet kan forvrænge afstand og udelade siderne. Kombinér kamera, spejle og direkte orientering, og stands ved tvivl i stedet for at udfylde et uset område med en antagelse.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.1.6, 2.5 og 7.5"
      }
    ],
    "case": {
      "context": "Du bakker ud fra en indkørsel; kameraet viser fri vej, men en hæk skjuler fortovet i højre side.",
      "action": "Bak i meget lav fart, stands før fortovet, og skab nyt udsyn med direkte orientering til begge sider.",
      "why": "En gående kan nærme sig uden for kameraets felt, og først den nye position giver et tilstrækkeligt beslutningsgrundlag.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 7.5; Færdselsloven § 3"
    },
    "recall": {
      "prompt": "Hvorfor skal bilens forhjørner kontrolleres, selv om bilen bevæger sig baglæns?",
      "answer": "Fordi fronten svinger ud til siden under drejningen og kan ramme noget, som ikke ligger bag bilen."
    },
    "practicalNote": "Bakningens styrevirkning, udsyn og standsninger skal øves fysisk på lukket øvelsesplads og senere i trafik."
  },
  "parkering-manovre": {
    "sectionId": "parkering-manovre",
    "chapterId": "grundmanoevrer",
    "lead": "En parkeringsmanøvre bliver overskuelig, når den deles i langsomme observationer, referencepunkter og kontrollerede korrektioner.",
    "cards": [
      {
        "title": "Vælg plads før du styrer",
        "body": "Vurder pladsens længde, bredde, adgang og trafikken omkring den, før manøvren begynder. Et lovligt felt er ikke nødvendigvis let at nå sikkert. Vælg en anden plads, hvis udsyn eller arbejdsrum ikke passer til dine færdigheder.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.7.1 og 7.18"
      },
      {
        "title": "Brug referencepunkter som kontrol",
        "body": "Et spejlpunkt eller en linje i ruden kan hjælpe med afstand, men virker kun fra en fast siddestilling og for den konkrete bil. Bekræft placeringen ved at se flere steder og korrigér, hvis virkeligheden ikke passer til referencepunktet.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.7.1"
      },
      {
        "title": "Slutplaceringen skal være brugbar",
        "body": "På øvelsespladsen skal bilen blandt andet kunne placeres parallelt med kanten med højre hjulpar højst 20 cm fra den. Målet træner præcision, men føreren skal samtidig bevare observation og mulighed for at standse.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.7.1, præstationskrav om højst 20 cm"
      }
    ],
    "case": {
      "context": "Du har påbegyndt en parkering, men kan ikke længere se den lave pullert ved bilens højre forhjørne.",
      "action": "Stands, orientér dig på ny, og korrigér eller afbryd manøvren, før bilen flyttes videre.",
      "why": "Referencepunktet kan ikke erstatte synlig kontrol; når en forhindring forsvinder, er dens afstand blevet usikker.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 2.7.1"
    },
    "recall": {
      "prompt": "Hvornår bør du opgive en indlært parkeringsreference og standse?",
      "answer": "Når udsyn, siddestilling eller bil ikke svarer til forudsætningen, så referencepunktet ikke længere kan bekræftes."
    },
    "practicalNote": "Parkeringsfærdigheden er et fysisk præstationskrav og skal trænes med kørelærer; mikrolektionen gennemfører ikke øvelsen."
  },
  "doer-aabning": {
    "sectionId": "doer-aabning",
    "chapterId": "grundmanoevrer",
    "lead": "En sikker afslutning på turen fortsætter, til døren er åbnet uden at skabe fare for forbipasserende.",
    "cards": [
      {
        "title": "Dørzonen er en trafikzone",
        "body": "En cyklist kan være tættere på og hurtigere fremme, end spejlbilledet antyder. Kontrollér spejl og direkte bagud, før døren løsnes, og åbn først en smal sprække, så ny trafik stadig kan opdages.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 7.18.3-7.18.5; Færdselsloven § 3"
      },
      {
        "title": "Passagerer skal inddrages",
        "body": "Føreren kan se forhold, som en passager overser, og bør sikre, at alle åbner mod et frit område. Giv en tydelig besked, især ved cykelsti eller kørebane, og vent med oplåsning, hvis nogen ellers åbner straks.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 7.18.3-7.18.5"
      },
      {
        "title": "Sikr bilen før opmærksomheden flyttes",
        "body": "Når bilen er standset, skal den sikres mod at bevæge sig, før føreren samler ting eller hjælper passagerer. En korrekt afslutningsrækkefølge frigør opmærksomhed til den sidste orientering og til at åbne døren sikkert i trafikken.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 7.18.3-7.18.5"
      }
    ],
    "case": {
      "context": "Du holder langs en cykelsti, og passageren rækker straks efter dørhåndtaget, mens en cyklist nærmer sig bagfra.",
      "action": "Bed passageren vente, kontrollér trafikken bagud, og åbn først, når cyklisten er passeret og området er frit.",
      "why": "En pludselig dør i cyklistens linje efterlader meget lidt mulighed for at undvige og kan skabe alvorlig fare.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 7.18.3-7.18.5; Færdselsloven § 3"
    },
    "recall": {
      "prompt": "Hvorfor er et spejlblik alene utilstrækkeligt før døråbning?",
      "answer": "Fordi en cyklist kan være i et skjult område eller nå frem, mens døren åbnes; direkte kontrol og langsom åbning giver ny information."
    },
    "practicalNote": "Afslutningsrækkefølge og direkte orientering bør indøves i den konkrete undervisningsbil."
  },
  "vending": {
    "sectionId": "vending",
    "chapterId": "grundmanoevrer",
    "lead": "En vending er først forsvarlig, når sted, udsyn, trafik og manøvrens mange bevægelser kan kontrolleres samlet.",
    "cards": [
      {
        "title": "Vælg stedet kritisk",
        "body": "Vending kræver plads og udsyn i flere retninger gennem hele manøvren. Undgå steder, hvor bakke, sving, tæt trafik eller skjulte trafikanter kan gøre en del af forløbet uoverskueligt. Kør videre til et bedre sted ved tvivl.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.9, 7.5 og 7.16"
      },
      {
        "title": "Hver del kræver ny orientering",
        "body": "En trepunktsvending består af flere igangsætninger, standsninger og retningsskift. Trafikbilledet kan ændre sig mellem dem. Gentag derfor orienteringen før hver bevægelse i stedet for at behandle hele vendingen som én beslutning.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 2.9 og 7.5; Færdselsloven § 3"
      },
      {
        "title": "Nogle veje udelukker manøvren",
        "body": "På motorvej må føreren ikke vende eller bakke. Fejlkørsel skal derfor løses ved at fortsætte til en lovlig afkørsel. En sen ruteændring er aldrig grund til en manøvre, der bryder vejens sikre trafikretning.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 7.16.5; Færdselsloven § 46, stk. 2"
      }
    ],
    "case": {
      "context": "Du opdager en forkert rute på en smal vej lige før en uoverskuelig bakketop og overvejer at vende straks.",
      "action": "Fortsæt til et sted med tilstrækkeligt udsyn og plads, og gennemfør kun vendingen efter ny orientering før hver bevægelse.",
      "why": "Ved bakketoppen kan en trafikant dukke op sent, mens bilen spærrer flere retninger under vendingen.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 2.9 og 7.5; Færdselsloven § 3"
    },
    "recall": {
      "prompt": "Hvorfor skal du orientere dig igen mellem vendingens enkelte bevægelser?",
      "answer": "Fordi andre trafikanter kan komme ind i området, mens bilen skifter retning og holder stille."
    },
    "practicalNote": "Vending er en praktisk manøvre og skal øves på lukket øvelsesplads og i relevante trafiksituationer med kørelærer."
  },
  "blindzoner": {
    "sectionId": "blindzoner",
    "chapterId": "koeretoejer",
    "lead": "Blindzoner er skiftende områder uden sikkert udsyn, som kræver placering, direkte orientering og forudseenhed.",
    "cards": [
      {
        "title": "Spejlene overlapper, men dækker ikke alt",
        "body": "Sidespejl og bakspejl giver forskellige udsnit, og en trafikant kan bevæge sig fra ét udsnit til et skjult område. Følg trafikanter over tid, og supplér med direkte orientering før sideværts bevægelse.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.1.3 og 3.2.1"
      },
      {
        "title": "Blindzonen flytter sig",
        "body": "Når din bil eller den anden trafikant ændrer fart og retning, ændres det skjulte område også. En cyklist, du så for et øjeblik siden, skal derfor genfindes visuelt, før du krydser den forventede bane.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.1.3 og 3.2.7"
      },
      {
        "title": "Placering kan skabe tid",
        "body": "Undgå at blive liggende tæt ved siden af et stort køretøj, hvor føreren kan have svært ved at se dig. Skab afstand, og passér kun, når forløbet er tydeligt og kan afsluttes uden at blive fanget ved et sving.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.2 og 3.2.7"
      }
    ],
    "case": {
      "context": "En cyklist, som du så i højre spejl, forsvinder fra spejlet kort før dit planlagte højresving.",
      "action": "Vent med svinget, orientér dig direkte mod højre, og genfind cyklisten eller fastslå sikkert, hvor personen er.",
      "why": "At cyklisten ikke længere ses, betyder ikke, at banen er fri; cyklisten kan være flyttet ind i bilens skjulte område.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 3.1.3, 3.2.7 og 7.13; Færdselsloven § 3"
    },
    "recall": {
      "prompt": "Hvad betyder det, når en trafikant, du fulgte i spejlet, pludselig ikke længere kan ses?",
      "answer": "Det skaber usikkerhed om placeringen og kræver ny orientering; det er ikke bevis for, at området er frit."
    },
    "practicalNote": "Egen bils blinde områder skal findes og øves fysisk fra den faktiske førerplads."
  },
  "tunge": {
    "sectionId": "tunge",
    "chapterId": "koeretoejer",
    "lead": "Tunge køretøjers størrelse og bevægelse kræver ekstra plads, tid og forståelse for deres svingforløb.",
    "cards": [
      {
        "title": "Baghjulene følger en snævrere linje",
        "body": "Når et langt køretøj drejer, kan baghjulene skære tættere om hjørnet end førerhuset. Hold dig væk fra indersiden af svinget, også hvis der først ser ud til at være plads ved siden af køretøjet.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.2"
      },
      {
        "title": "Langsom acceleration ændrer hullet",
        "body": "Et tungt køretøj kan bruge længere tid på at sætte i gang og komme gennem et kryds. Pres ikke ind i den plads, føreren har valgt. Hullet kan være nødvendigt for både længde, svingradius og udsyn.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.2 og 4.3.2"
      },
      {
        "title": "Afstand giver gensidigt udsyn",
        "body": "Meget tæt kørsel bag en lastbil skjuler vej, tegn og trafik længere fremme. Øget afstand giver dig tidligere information og flere handlemuligheder og gør samtidig din bil lettere at opdage i lastbilens spejle.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.2 og 6.2.3"
      }
    ],
    "case": {
      "context": "En lastbil foran dig trækker mod venstre før et højresving, og der åbner sig kortvarigt plads langs dens højre side.",
      "action": "Bliv bag lastbilen og uden for svingområdet, indtil køretøjet har afsluttet manøvren.",
      "why": "Pladsen kan være nødvendig for lastbilens sving, mens baghjulene bevæger sig ind over området på højre side.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.2; Færdselsloven § 3"
    },
    "recall": {
      "prompt": "Hvorfor kan en lastbil først trække væk fra den side, den bagefter drejer imod?",
      "answer": "Den kan have brug for et bredere indledende forløb, fordi køretøjet er langt og baghjulene skærer tættere gennem svinget."
    },
    "practicalNote": null
  },
  "tohjulede": {
    "sectionId": "tohjulede",
    "chapterId": "koeretoejer",
    "lead": "Tohjulede kan være svære at bedømme, fordi deres smalle profil skjuler fart, afstand og placering.",
    "cards": [
      {
        "title": "Smal profil giver usikker afstand",
        "body": "En motorcykel fylder lidt i synsfeltet, så ændringen i størrelse kan være sværere at aflæse end for en bil. Se flere gange med mellemrum, og vurder bevægelsen i forhold til faste punkter i omgivelserne.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.5-3.2.6 og 4.1.2"
      },
      {
        "title": "Hele kørebanen kan blive brugt",
        "body": "En motorcyklist kan ændre placering i banen for udsyn, vejgreb eller afstand til farer. Planlæg derfor ikke en passage ud fra, at motorcyklen bliver ved kantlinjen eller holder samme sideplacering.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.5-3.2.6"
      },
      {
        "title": "Genfind før du krydser banen",
        "body": "Ved venstresving skal en modkørende motorcykels fart og afstand vurderes med ekstra forsigtighed. Hvis observationerne ikke giver et sikkert hul, vent. En fejlvurdering placerer bilen direkte på tværs af motorcyklens kurs.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.5-3.2.6 og 7.14"
      }
    ],
    "case": {
      "context": "Du vil dreje til venstre, men en modkørende motorcykel ses kortvarigt mellem biler, og dens fart er vanskelig at bedømme.",
      "action": "Bliv holdende, følg motorcyklens bevægelse over flere observationer, og drej kun ved et tydeligt sikkert hul.",
      "why": "Den smalle profil kan få afstand og fart til at virke mindre kritiske, end de faktisk er.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.5-3.2.6 og 7.14; Færdselsloven § 3"
    },
    "recall": {
      "prompt": "Hvordan kan faste punkter i omgivelserne hjælpe ved vurdering af en motorcykel?",
      "answer": "De gør det muligt at se, hvor hurtigt motorcyklens placering ændrer sig, i stedet for kun at vurdere dens lille silhuet."
    },
    "practicalNote": null
  },
  "cykler-smaa": {
    "sectionId": "cykler-smaa",
    "chapterId": "koeretoejer",
    "lead": "Cykler og små køretøjer kræver gentagen observation, fordi de let skjules og hurtigt kan nå et konfliktpunkt.",
    "cards": [
      {
        "title": "Vurder ankomst, ikke kun afstand",
        "body": "En cyklist kan se langt væk ud, men nå krydset, mens du gennemfører et sving. Følg udviklingen og sammenlign jeres forventede ankomst til samme punkt. Et enkelt afstandsblik er ikke nok.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.7-3.2.8 og 7.13"
      },
      {
        "title": "Små trafikanter forsvinder bag små ting",
        "body": "En stolpe, parkeret bil eller spejlramme kan dække en cyklist eller knallert i flere sekunder. Bevæg hovedet, skift synsvinkel og søg igen fra førerpladsen, især før du krydser en cykelsti eller et fortov.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.1.3, 3.2.7-3.2.8 og 7.13"
      },
      {
        "title": "Gentag kontrollen efter standsning",
        "body": "Mens du holder for andre, fortsætter cyklister og små køretøjer med at flytte sig. Orientér dig derfor igen umiddelbart før igangsætning eller sving, selv om området var frit, da bilen standsede.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.7-3.2.8 og 7.13"
      }
    ],
    "case": {
      "context": "Ved højresving har du set en cyklist bagude, men cyklisten forsvinder bag en parkeret varebil, mens du venter.",
      "action": "Bliv holdende, søg cyklisten igen fra en bedre synsvinkel, og sving først, når den forventede bane er fri.",
      "why": "Cyklisten kan fortsat bevæge sig mod krydset bag varebilen og nå højresvingsområdet, før bilen er gennem svinget.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.7 og 7.13; Færdselsloven §§ 3 og 26"
    },
    "recall": {
      "prompt": "Hvorfor skal du søge igen efter en cyklist, der kortvarigt forsvinder bag en forhindring?",
      "answer": "Fordi skjul ikke stopper cyklistens bevægelse; personen kan være nået tættere på konfliktpunktet uden at være synlig."
    },
    "practicalNote": "Orientering ved sving og krydsning af cykelsti skal trænes i rigtig trafik med kørelærer."
  },
  "laes-trailer": {
    "sectionId": "laes-trailer",
    "chapterId": "koeretoejer",
    "lead": "Læs og trailer ændrer bilens bevægelse, udsyn og lovlige rammer, før kombinationen overhovedet sættes i gang.",
    "cards": [
      {
        "title": "Last skal blive, hvor den er placeret",
        "body": "Last, der kan forskyde sig ved sving eller bremsning, ændrer bilens balance og kan ramme personer eller vej. Fordel og fastgør lasten efter dens vægt og form, og kontrollér sikringen igen under en længere tur.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.3 og 6.2.7; Færdselsloven § 82"
      },
      {
        "title": "Traileren følger en anden kurve",
        "body": "I et sving følger trailerens hjul ofte en snævrere linje end bilens. Giv ekstra plads ved hjørner og kantsten, og kontrollér spejlene gennem svinget, så du opdager en afvigelse, før den bliver fastlåst.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 3.2.3 og 9.1"
      },
      {
        "title": "Kombinationen skal passe sammen",
        "body": "Kontrollér registreringsoplysningerne for bil og trailer før afgang. Bilens tilladte påhængsvægt, trailerens tilladte totalvægt, den faktiske belastning og din førerret skal passe sammen; én tilladt værdi afgør ikke hele kombinationen. Selve koblingen og udstyret kontrolleres efter fabrikantens anvisninger.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.10, 1.3.1, pkt. 2-5; 6.1.3, pkt. 2-3"
      }
    ],
    "case": {
      "context": "Efter læsning hænger traileren korrekt på bilen, men en tung genstand kan glide frit på ladet ved opbremsning.",
      "action": "Undlad at køre, placér og fastgør genstanden forsvarligt, og kontrollér, at registreringsoplysninger, førerret og faktisk belastning passer sammen.",
      "why": "En korrekt kobling forhindrer ikke løs last i at forskyde balancen eller skabe fare under turen.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 1.3.1, pkt. 2-5; 6.1.3, pkt. 2-3; Færdselsloven § 82"
    },
    "recall": {
      "prompt": "Hvorfor er trailerens tilladte totalvægt ikke det eneste, der skal kontrolleres?",
      "answer": "Fordi bilens trækevne, faktisk belastning, kobling, registreringsdata og førerens kørekortret også indgår i den lovlige og sikre kombination."
    },
    "practicalNote": "Hvis føreren senere skal bruge en trailer, bør kobling, kontrol og kørsel læres på den konkrete kombination. Denne mikrolektion dokumenterer ikke sådan praktisk instruktion og er ikke et gennemført kategori B-krav."
  },
  "opfattelse": {
    "sectionId": "opfattelse",
    "chapterId": "foereren",
    "lead": "Sikker kørsel kræver, at føreren opdager, forstår og handler på tegn, før situationen bliver akut.",
    "cards": [
      {
        "title": "At se er ikke det samme som at opdage",
        "body": "Øjnene kan være rettet mod vejen, uden at den relevante fare bliver bearbejdet. Søg systematisk efter ændringer, kanter, sideveje og mennesker, og spørg dig selv, hvad der kan bevæge sig ind i din bane.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.1.1-4.1.4"
      },
      {
        "title": "Fart forkorter beslutningen",
        "body": "Når farten stiger, tilbagelægges mere vej, mens føreren opdager, vurderer og reagerer. Tilpas derfor farten før komplekse steder, så observationerne kan omsættes til en rolig handling frem for en sen nødbeslutning.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.1.2-4.1.4; Færdselsloven § 3"
      },
      {
        "title": "Forudseenhed bygger på tegn",
        "body": "En bold ved vejkanten, et åbent bildørshåndtag eller hjul, der drejer, kan varsle næste bevægelse. Brug sådanne tegn til at skabe plads og bremseberedskab, uden at antage at den varslede handling med sikkerhed sker.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.1.3-4.1.4 og 4.2"
      }
    ],
    "case": {
      "context": "En bold ruller ud fra en række parkerede biler, men der er endnu ingen person synlig.",
      "action": "Sænk straks farten, skab sideafstand og vær klar til at standse, mens du søger efter et barn bag bilerne.",
      "why": "Bolden er et tidligt tegn på mulig bevægelse; handling før barnet bliver synligt giver mere plads og reaktionstid.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 4.1.3-4.1.4 og 4.2; Færdselsloven § 3"
    },
    "recall": {
      "prompt": "Hvordan adskiller forudseenhed sig fra at gætte?",
      "answer": "Forudseenhed kobler synlige tegn til mulige risici og skaber sikkerhedsmargin, men behandler ikke muligheden som et sikkert faktum."
    },
    "practicalNote": null
  },
  "distraktion": {
    "sectionId": "distraktion",
    "chapterId": "foereren",
    "lead": "Distraktion kan flytte blik, hænder eller tanker væk fra den opgave, som trafiksituationen kræver nu.",
    "cards": [
      {
        "title": "Opmærksomhed kan være væk med øjnene fremme",
        "body": "En samtale eller besked kan optage den mentale bearbejdning, selv når blikket peger mod vejen. Tegn kan blive set uden at blive forstået. Reducér sekundære opgaver, før trafikken bliver kompleks.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.1.5-4.1.7"
      },
      {
        "title": "Håndholdt udstyr er forbudt under kørsel",
        "body": "Færdselsloven forbyder føreren at benytte håndholdt teleudstyr og andre håndholdte kommunikationsapparater under kørsel. Håndfri betjening gør ikke automatisk enhver brug forsvarlig; den generelle pligt til opmærksom og hensynsfuld kørsel gælder stadig.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.1.5-4.1.7; Færdselsloven §§ 3 og 55 a"
      },
      {
        "title": "Planlæg et sikkert stop",
        "body": "Hvis navigation, en besked eller en genstand kræver opmærksomhed, så find et lovligt sted og afslut kørslen, før udstyret betjenes håndholdt. Håndholdt brug er også ulovlig, mens du holder for rødt eller i kø, fordi du stadig anses for kørende.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.1.5-4.1.7; Færdselsloven § 55 a; Nordjyllands Politi, dom af 10. januar 2025, omtalt 14. januar 2025"
      }
    ],
    "case": {
      "context": "Navigationen mister ruten lige før et kompliceret kryds, og telefonen ligger løst på passagersædet.",
      "action": "Fortsæt efter skiltning uden at række efter telefonen, og find senere et lovligt sted at standse og ændre ruten.",
      "why": "Krydset kræver observation og valg; en håndholdt opgave fjerner blik og tanke netop dér, hvor situationen udvikler sig hurtigt.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 4.1.5-4.1.7; Færdselsloven §§ 3 og 55 a"
    },
    "recall": {
      "prompt": "Hvorfor kan håndfri betjening stadig være distraherende?",
      "answer": "Fordi samtalen eller opgaven kan beslaglægge forståelse og beslutningskapacitet, selv om begge hænder er på rattet."
    },
    "practicalNote": null
  },
  "traet-medicin": {
    "sectionId": "traet-medicin",
    "chapterId": "foereren",
    "lead": "Føreren skal afstå fra kørsel, når træthed, sygdom eller påvirkende midler gør fuldt betryggende kørsel usikker.",
    "cards": [
      {
        "title": "Selvvurderingen skal ske før afgang",
        "body": "Gentagne koncentrationssvigt, oversete tegn eller vanskelighed ved at holde opmærksomheden er relevante advarsler, ikke noget der skal afprøves i trafik. Vurder køreevnen ærligt før turen og på ny, hvis tilstanden ændrer sig.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.4.3 og 8.1; Færdselsloven § 54"
      },
      {
        "title": "Medicin kan ændre køreevnen",
        "body": "Et lægemiddel kan påvirke opmærksomhed, reaktion eller dømmekraft, og virkningen kan variere. Følg præparatets advarsler og den faglige information, du har fået; kør ikke, hvis du ikke kan føre bilen på fuldt betryggende måde.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.4.3 og 8.1; Færdselsloven § 54"
      },
      {
        "title": "En pause er en beslutning, ikke et bevis",
        "body": "At standse kan give mulighed for at revurdere tilstanden, men en kort pause garanterer ikke, at køreevnen er genoprettet. Fortsæt kun, hvis du reelt kan køre fuldt betryggende; ellers skal turen ikke fortsætte.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.4.3 og 8.1; Færdselsloven § 54"
      }
    ],
    "case": {
      "context": "På en aftentur opdager du, at du har overset to vejvisninger og har svært ved at fastholde opmærksomheden.",
      "action": "Find et sikkert og lovligt sted at standse, og fortsæt ikke, medmindre du igen kan køre fuldt betryggende.",
      "why": "De gentagne svigt viser, at vigtig information ikke bliver bearbejdet; at presse videre kan gøre næste oversete forhold farligt.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 4.4.3 og 8.1; Færdselsloven § 54"
    },
    "recall": {
      "prompt": "Hvorfor er det utilstrækkeligt at vurdere træthed ud fra, om du stadig kan holde bilen på vejen?",
      "answer": "Fordi sikker kørsel også kræver, at tegn, risici og ændringer opdages og bearbejdes i tide."
    },
    "practicalNote": null
  },
  "alkohol-stoffer": {
    "sectionId": "alkohol-stoffer",
    "chapterId": "foereren",
    "lead": "Alkohol og andre påvirkende stoffer svækker netop de evner, føreren bruger til at vurdere sin egen sikkerhed.",
    "cards": [
      {
        "title": "Påvirkning og selvvurdering hænger dårligt sammen",
        "body": "Alkohol kan forringe opmærksomhed, reaktion og dømmekraft, samtidig med at føreren føler sig mere sikker. Planlæg derfor transporten før indtagelse i stedet for at lade en senere følelse afgøre, om bilen bruges.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.4.1-4.4.2 og 8.1; Færdselsloven § 53"
      },
      {
        "title": "Lovgrænsen er ikke et personligt mål",
        "body": "Den almindelige grænse er overskredet, når alkoholkoncentrationen er over 0,50 promille i blodet eller over 0,25 milligram pr. liter udåndingsluft. I de første tre år efter førstegangserhvervelse af retten til kategori B gælder over 0,20 promille eller over 0,10 milligram pr. liter. Spirituskørsel kan også straffes under talgrænsen, hvis alkoholen hindrer betryggende kørsel.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Færdselsloven § 53, stk. 1-3; Undervisningsplan kategori B v1.1, 4.4.1, pkt. 3-6"
      },
      {
        "title": "Andre stoffer kan også udelukke kørsel",
        "body": "Euforiserende stoffer og andre påvirkende midler kan gøre kørsel ulovlig eller uforsvarlig. Kombinationer og eftervirkning er ikke en situation, som bør testes bag rattet; vælg en transportform uden egen kørsel.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.4 og 8.1; Færdselsloven § 54"
      }
    ],
    "case": {
      "context": "Efter en fest siger en ven, at du virker upåvirket, og foreslår, at du kører den korte vej hjem.",
      "action": "Lad bilen stå og brug den transportløsning, der blev planlagt uden egen kørsel.",
      "why": "Vennens indtryk og turens længde siger ikke, om opmærksomhed og reaktion er sikre eller lovens krav er opfyldt.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 4.4 og 8.1; Færdselsloven §§ 53-54"
    },
    "recall": {
      "prompt": "Hvorfor er følelsen af at være upåvirket et usikkert beslutningsgrundlag?",
      "answer": "Fordi påvirkningen kan svække både køreevnen og evnen til at bedømme denne svækkelse."
    },
    "practicalNote": null
  },
  "holdning": {
    "sectionId": "holdning",
    "chapterId": "foereren",
    "lead": "Førerens holdning viser sig i de sikkerhedsmargener, der vælges, når tidspres, irritation eller gruppepres opstår.",
    "cards": [
      {
        "title": "Normalisering flytter grænsen",
        "body": "Når en risikofyldt vane gentages uden uheld, kan den begynde at føles sikker. Fravær af en konsekvens er ikke bevis for god kørsel. Vurder handlingen efter risiko og regler, ikke efter tidligere held.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.7 og 8.2"
      },
      {
        "title": "Tidspres skal løses uden fartpres",
        "body": "Forsinkelse kan få en fører til at forkorte afstande og acceptere usikre huller. Anerkend presset, bevar den nødvendige margin, og lad ankomsttiden ændre sig frem for at flytte risikoen over på andre.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.7 og 8.2; Færdselsloven § 3"
      },
      {
        "title": "Defensiv kørsel giver plads til andres fejl",
        "body": "Du kan følge reglerne og stadig møde en trafikant, der overser dig. Afstand, moderat fart og tydelig kommunikation skaber handlemuligheder, når andre handler uventet, uden at du behøver afgøre skyld i øjeblikket.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.7 og 8.2"
      }
    ],
    "case": {
      "context": "En utålmodig passager presser dig til at tage et lille hul i tæt trafik, fordi I er sent på den.",
      "action": "Vent på et tydeligt sikkert hul og accepter forsinkelsen uden at diskutere beslutningen midt i manøvren.",
      "why": "Passagerens tidspres ændrer ikke trafikkens bevægelser; sikkerhedsmarginen giver mulighed for at håndtere en andens uventede handling.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 4.7 og 8.2; Færdselsloven § 3"
    },
    "recall": {
      "prompt": "Hvordan kan mange ture uden uheld gøre en dårlig vane mere risikabel?",
      "answer": "De kan få føreren til at forveksle held med sikkerhed og gradvist acceptere mindre margin."
    },
    "practicalNote": null
  },
  "vaadt-glat": {
    "sectionId": "vaadt-glat",
    "chapterId": "vej-vejr",
    "lead": "Våd eller glat vej reducerer den samlede reserve til at bremse, styre og ændre fart på samme tid.",
    "cards": [
      {
        "title": "Vejgrebet er et fælles budget",
        "body": "Dækkene bruger vejgreb til både sideføring og bremsning. Kraftig opbremsning midt i et sving kræver begge dele samtidig. Sænk derfor farten før kurven, og udfør styring og fartændring så roligt som forholdene kræver.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2.1-5.2.4 og 9.1"
      },
      {
        "title": "Tilpas før den glatte del",
        "body": "Broer, skyggepartier, blade, vand eller skiftende belægning kan ændre vejgrebet lokalt. Opdag tegnene tidligt, sænk farten og øg afstanden, mens bilen stadig har stabilt greb, frem for at reagere brat på området.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2.3-5.2.4 og 9.1"
      },
      {
        "title": "Dækkene kan ikke ophæve forholdene",
        "body": "Korrekt dæktryk og tilstrækkeligt mønster støtter kontakten med vejen, men fjerner ikke risikoen ved vand, sne eller is. Føreren skal stadig tilpasse fart, afstand og bevægelser til den friktion, der faktisk er til rådighed.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 1.2.7, 5.2 og 9.1; Færdselsloven § 41"
      }
    ],
    "case": {
      "context": "Regnen tiltager før en kurve, og vand samler sig i sporene, mens bilen foran sænker farten.",
      "action": "Slip speederen roligt, øg afstanden og vælg en fart før kurven, der mindsker behovet for kraftig bremsning under svinget.",
      "why": "Vand kan reducere dækkenes kontakt, og samtidige store styre- og bremsekrav bruger mere af det begrænsede vejgreb.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2 og 9.1; Færdselsloven § 41"
    },
    "recall": {
      "prompt": "Hvorfor er det bedre at reducere farten før en glat kurve end midt i den?",
      "answer": "Fordi dækkene så ikke samtidig skal levere en stor bremsekraft og den sidekraft, der holder bilen i kurven."
    },
    "practicalNote": "Vejgreb og korrekt reaktion på glat føre skal opleves under fysisk køreundervisning, herunder på køreteknisk anlæg."
  },
  "sigt": {
    "sectionId": "sigt",
    "chapterId": "vej-vejr",
    "lead": "Begrænset sigt ændrer, hvor tidligt føreren kan opdage en fare, og dermed hvilken fart og afstand der er forsvarlig.",
    "cards": [
      {
        "title": "Du skal kunne reagere inden for det synlige",
        "body": "Tåge, mørke, regn eller blænding forkorter den strækning, du kan overskue. Tilpas farten, så ny information kan nå at føre til en sikker reaktion, og øg afstanden til den forankørende.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2.4 og 7.19; Færdselsloven §§ 3 og 41"
      },
      {
        "title": "Lysvalg påvirker både dig og andre",
        "body": "Brug den belysning, som forholdene kræver, og skift i tide, så andre ikke blændes. Mere lys er ikke altid bedre: tåge og nedbør kan sende lyset tilbage og gøre kontraster sværere at se.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 6.2.5 og 7.19; Færdselsloven § 33"
      },
      {
        "title": "Efter blænding kræves ny sikkerhedsmargin",
        "body": "Når en modkørendes lys kortvarigt forringer synet, skal blikket søge vejens højre begrænsning uden at låse sig fast i lyset. Sænk farten efter behov, fordi synet ikke straks giver samme detaljer som før.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2.4, 6.2.5 og 7.19"
      }
    ],
    "case": {
      "context": "I tæt tåge kan du kun se få vejmarkeringer frem, selv om bilen foran fortsætter med uændret fart.",
      "action": "Sænk farten jævnt, øg afstanden, brug korrekt lys og undgå at følge den forankørendes tempo som målestok.",
      "why": "Den anden førers valg udvider ikke dit udsyn; din fart skal give mulighed for at reagere på det, du selv kan opdage.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2.4, 6.2.5 og 7.19; Færdselsloven §§ 3 og 41"
    },
    "recall": {
      "prompt": "Hvorfor kan det være farligt blot at følge baglygterne foran i tåge?",
      "answer": "Fordi den forankørende kan køre for hurtigt, og lysene kan trække dit blik væk fra farer i dit eget synlige område."
    },
    "practicalNote": "Kørsel i mørke trænes i den obligatoriske mørkelektion. Tåge, regn, blænding og anden nedsat sigt indgår som risikoforhold; mikrolektionen dokumenterer ingen praktisk erfaring med disse forhold."
  },
  "kurver-bakker": {
    "sectionId": "kurver-bakker",
    "chapterId": "vej-vejr",
    "lead": "Kurver og bakker skjuler det næste vejstykke, så farten skal vælges ud fra det, der kan ses, ikke det man håber er frit.",
    "cards": [
      {
        "title": "Den skjulte del kan allerede være optaget",
        "body": "Bag en kurve eller bakketop kan der stå et køretøj, være kø eller ligge en forhindring. Kør ind med en fart og placering, der giver handlemulighed inden for den synlige frie strækning.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2.4, 7.3 og 7.9; Færdselsloven § 3"
      },
      {
        "title": "Farten vælges før kurven",
        "body": "Tidlig farttilpasning giver ro til at se gennem kurven og styre stabilt. En sen kraftig opbremsning kan flytte opmærksomheden fra vejforløbet og kræve mere vejgreb, netop mens bilen også skal dreje.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2.4 og 7.9"
      },
      {
        "title": "Overhaling kræver dokumenteret udsyn",
        "body": "Før en overhaling skal hele den nødvendige strækning kunne overskues. Ved bakketop eller uoverskuelig kurve kan modkørende være skjult, og en kort tilsyneladende fri strækning er derfor ikke et sikkert hul.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 7.9 og 7.11; Færdselsloven § 23"
      }
    ],
    "case": {
      "context": "En langsom traktor kører foran dig lige før en bakketop, og der er ingen synlig modkørende.",
      "action": "Bliv bag traktoren med afstand, og vent med overhaling, til den nødvendige modgående strækning kan overskues.",
      "why": "Fravær af en synlig bil er ikke fri bane, når bakketoppen skjuler den del af vejen, som overhalingen kræver.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 7.9 og 7.11; Færdselsloven § 23"
    },
    "recall": {
      "prompt": "Hvad er forskellen på en vejstrækning, der ser tom ud, og en strækning, der kan overskues som fri?",
      "answer": "Den første kan indeholde skjult trafik; den anden er synlig langt nok til, at den planlagte manøvre kan afsluttes sikkert."
    },
    "practicalNote": "Valg af fart, placering og gear gennem kurver og bakker skal øves på vej med kørelærer."
  },
  "vejmiljoe": {
    "sectionId": "vejmiljoe",
    "chapterId": "vej-vejr",
    "lead": "Vejens omgivelser giver spor om, hvem der kan dukke op, og hvilken fejlmargin situationen kræver.",
    "cards": [
      {
        "title": "Miljøet ændrer forventningen",
        "body": "Skole, butikker, boliger, busstoppested eller parkerede biler peger på forskellige bevægelser. Brug omgivelserne til at lede efter relevante trafikanter og mulige skjul, før nogen træder ud, kører ud eller på anden måde bevæger sig ind i din bane.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2.2 og 5.2.5"
      },
      {
        "title": "Parkerede biler skaber flere risici",
        "body": "En parkeret bil kan skjule gående, begynde at køre eller åbne en dør. Skab sideafstand, se efter personer, lys og hjulretning, og tilpas farten, så du kan reagere på en begyndende bevægelse.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 4.2, 5.2.2 og 5.2.5"
      },
      {
        "title": "Vejens udformning er ikke hele reglen",
        "body": "Bred belægning kan føles som invitation til høj fart, selv hvor sideveje og mennesker gør situationen kompleks. Lad risiko, udsyn og gældende regulering styre farten frem for vejens visuelle rummelighed alene.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2.2 og 5.2.5; Færdselsloven §§ 3 og 41"
      }
    ],
    "case": {
      "context": "Du kører på en bred bygade ved et busstoppested, hvor en bus skjuler fortovet og flere passagerer er steget af.",
      "action": "Sænk farten, skab afstand til bussen og vær klar til at standse for en person, der kommer frem foran den.",
      "why": "Den brede vej ændrer ikke, at bussen skjuler gående, som kan nå kørebanen med meget kort varsel.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 5.2.2 og 5.2.5; Færdselsloven §§ 3 og 27"
    },
    "recall": {
      "prompt": "Hvordan kan et busstoppested ændre din kørsel, selv når ingen person står i kørebanen?",
      "answer": "Det gør gående og skjult bevægelse mere sandsynlig, så søgningen, farten og bremseberedskabet bør tilpasses før en konflikt opstår."
    },
    "practicalNote": null
  },
  "tunnel-jernbane": {
    "sectionId": "tunnel-jernbane",
    "chapterId": "vej-vejr",
    "lead": "Tunnel og jernbaneoverkørsel kræver tidlig observation, fri udvej og respekt for særlige signaler og begrænset plads.",
    "cards": [
      {
        "title": "Lys og afstand ændres ved tunnelmundingen",
        "body": "Overgangen mellem dagslys og tunnel kan midlertidigt reducere detaljesynet. Sikr før indkørslen, at nærlyset og dermed baglyset er tændt, øg opmærksomheden og hold længere afstand, så en langsommere kø ikke først opdages inde i det mørkere rum.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 7.20.2, pkt. 2-3; 7.20.4, pkt. 1, 3 og 6"
      },
      {
        "title": "Tunnelen begrænser flugtveje",
        "body": "Standsning, vending og bakning i en tunnel kan skabe særlig fare, fordi plads, udsyn og adgang for hjælp er begrænset. Følg signaler og anvisninger, og hold den afstand, der giver mulighed for kontrolleret standsning.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 7.20"
      },
      {
        "title": "Kør kun over sporet med fri udgang",
        "body": "Ved jernbaneoverkørsel skal du udvise særlig forsigtighed og sikre, at passagen kan gennemføres uden unødigt ophold. Kør ikke ind, hvis køen foran kan efterlade bilen på sporet, selv om bommen er oppe.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Undervisningsplan kategori B v1.1, 7.3.3, pkt. 59; 7.3.4, pkt. 13-15; Færdselsloven § 5"
      }
    ],
    "case": {
      "context": "Bommen er oppe, men bilkøen efter jernbaneoverkørslen står så tæt, at der ikke er plads til din bil på den anden side.",
      "action": "Bliv før sporet, og kør først frem, når der er fri plads til at passere hele overkørslen uden ophold.",
      "why": "Et åbent signal fjerner ikke risikoen ved at blive fanget på sporet; fri udgang skal være sikret før indkørsel.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Undervisningsplan kategori B v1.1, 7.3.3, pkt. 59; 7.3.4, pkt. 13-15; Færdselsloven § 5"
    },
    "recall": {
      "prompt": "Hvorfor er en åben bom ikke alene nok til at begynde passage af en jernbaneoverkørsel?",
      "answer": "Fordi der også skal være plads til at komme helt fri af sporet uden unødigt ophold."
    },
    "practicalNote": "Praktisk tunnelkørsel er kun obligatorisk, når en lektion på mindst 45 minutter tillader turen til, gennem og tilbage fra en angivet tunnel; ellers undervises færdighederne i teorilokalet. Her dokumenteres heller ingen praktisk passage af jernbaneoverkørsel."
  },
  "anvisninger": {
    "sectionId": "anvisninger",
    "chapterId": "grundregler",
    "lead": "Når anvisninger strider mod hinanden, skal du først afgøre, hvilken der står højest.",
    "cards": [
      {
        "title": "Rækkefølgen",
        "body": "En politibetjents anvisning går foran signaler, tavler, vejafmærkning og almindelige regler. Et fungerende lyssignal går foran modstridende vigepligtstavler. Rækkefølgen forhindrer i praksis, at to samtidige beskeder styrer samme bevægelse forskelligt.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Plan B 6.1.2 og 7.11.3, pkt. 37-41"
      },
      {
        "title": "Når signalet svigter",
        "body": "Et slukket eller tydeligt defekt lyssignal giver ikke fri bane. Se efter tavler og hajtænder; findes ingen vigepligtsafmærkning, bruges de almindelige regler, typisk højre vigepligt. Sænk farten, fordi andre kan være i tvivl.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.11.3, pkt. 41 og 46-47"
      },
      {
        "title": "Grønt er betinget",
        "body": "Grønt betyder kør, hvis vejen er fri. Du må ikke køre ind, hvis køen forhindrer dig i at komme ud før tværtrafikken får grønt. Signalet løser altså vigepligten, men ikke risikoen for at blokere krydset.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.11.3, pkt. 37 b"
      }
    ],
    "case": {
      "context": "Lyset i et kryds er mørkt. Du ser B 11 og hajtænder foran din bane, mens en bil nærmer sig på den tværgående vej.",
      "action": "Sænk farten og hold tilbage efter den synlige vigepligtsafmærkning.",
      "why": "Det defekte signal ophæver ikke B 11; tværtrafikken må ikke tvinges til at bremse.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.11.3, pkt. 41"
    },
    "recall": {
      "prompt": "Hvad gør du først, når et lyssignal er ude af drift?",
      "answer": "Finder den gældende tavle eller vejafmærkning; uden sådan regulering følger du de almindelige vigepligtsregler."
    },
    "practicalNote": null
  },
  "hensyn": {
    "sectionId": "hensyn",
    "chapterId": "grundregler",
    "lead": "Færdselsregler sætter rammer, men agtpågivenhed afgør, om handlingen faktisk er sikker.",
    "cards": [
      {
        "title": "Fare og ulempe",
        "body": "Alle skal optræde hensynsfuldt og agtpågivende, så der ikke opstår fare eller skade, og så andre ikke unødigt hindres eller forstyrres. En lovlig placering kan derfor stadig være forkert, hvis den presser en sårbar trafikant.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Færdselsloven § 3; Plan B 6.2.1-6.2.2"
      },
      {
        "title": "Ret er ikke fripas",
        "body": "At en anden har vigepligt, giver ikke ret til at fremtvinge passage. Tegn på fejl, usikkerhed eller manglende opmærksomhed skal udløse mere afstand og lavere fart. Målet er at undgå sammenstødet, ikke at bevise reglen.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 6.2.1-6.2.2 og 7.11.2"
      },
      {
        "title": "Sikkerhedsmargin",
        "body": "Planlæg med plads til, at andre kan reagere sent eller forkert. En sikkerhedsmargin består af tid, afstand og en mulig flugtvej. Jo dårligere udsyn eller vejgreb, desto større margin bør du skabe før manøvren.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 4.7.1-4.7.4 og 6.2.2"
      }
    ],
    "case": {
      "context": "Du har forkørselsret, men en ældre cyklist fra sidevejen ser ikke mod dig og ruller frem.",
      "action": "Slip speederen, øg afstanden og vær klar til at standse.",
      "why": "Din ret ændrer ikke pligten til at forebygge fare, når fejlen er synlig, og den lave fart giver dig tid til at undgå sammenstødet.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Færdselsloven § 3; Plan B 6.2.2"
    },
    "recall": {
      "prompt": "Hvorfor kan en regelmæssigt korrekt manøvre stadig være forkert?",
      "answer": "Fordi den konkrete udførelse kan skabe fare eller unødig ulempe, som grundreglen kræver, at du undgår."
    },
    "practicalNote": null
  },
  "tegn": {
    "sectionId": "tegn",
    "chapterId": "grundregler",
    "lead": "Tegn skal gøre din hensigt forståelig uden at love, at manøvren allerede kan gennemføres.",
    "cards": [
      {
        "title": "Tegn før handling",
        "body": "Blink i passende afstand, så andre kan forstå og bruge informationen. Et meget sent tegn giver ingen planlægningstid; et for tidligt tegn kan forveksles med en anden vej. Kontroller stadig spejle og blind vinkel før retningen ændres.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Plan B 6.2.4 og 7.4.4"
      },
      {
        "title": "Blink giver ingen ret",
        "body": "Blinklyset fortæller om en hensigt, men flytter ikke vigepligten. Ved vognbaneskift skal du stadig sikre, at manøvren kan ske uden fare eller unødig ulempe. Vent, hvis trafikken i den nye bane ikke giver plads.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 6.2.4 og 7.4.5"
      },
      {
        "title": "Signal kun ved behov",
        "body": "Horn og blink med forlygterne er advarselssignaler, ikke middel til at kræve plads eller udtrykke irritation. Brug signalet kort, når det er nødvendigt for at afværge fare; kombiner det med fartnedsættelse og sikker placering.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Plan B 6.2.3-6.2.5"
      }
    ],
    "case": {
      "context": "Du blinker for at skifte bane, men en bil ligger stadig tæt ved siden af dig.",
      "action": "Behold banen, afbryd om nødvendigt tegnet og vent på et sikkert ophold.",
      "why": "Blinket oplyser om hensigten; det pålægger ikke den anden bil at give plads.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.4.4-7.4.5"
    },
    "recall": {
      "prompt": "Hvilke to ting skal fortsat være opfyldt efter dit blink?",
      "answer": "Du skal have orienteret dig, og manøvren skal kunne ske uden fare eller unødig ulempe."
    },
    "practicalNote": null
  },
  "udrykning": {
    "sectionId": "udrykning",
    "chapterId": "grundregler",
    "lead": "Fri passage skabes med rolig koordinering, ikke ved at erstatte én nødsituation med en anden.",
    "cards": [
      {
        "title": "Se hele situationen",
        "body": "Når et udrykningskøretøj nærmer sig med særligt lyd- eller lyssignal, skal du først lokalisere det og se, hvad andre gør. Sæt farten ned og skab plads tydeligt uden at skabe en ny fare. Pludselig opbremsning eller et uvarslet sideskift kan blokere mere end det hjælper.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Færdselsloven § 7, stk. 2; Plan B 6.2.6"
      },
      {
        "title": "Rødt er stadig rødt",
        "body": "Et udrykningskøretøj bag dig ændrer ikke dit røde signal til grønt. Flyt kun bilen, hvis det kan ske lovligt og sikkert; ellers bliv forudsigeligt holdende, så udrykningsføreren kan vælge en anden passage.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 6.2.6 og 7.11.3, pkt. 37"
      },
      {
        "title": "Efter passagen",
        "body": "Når udrykningen er forbi, skal du kontrollere spejle, blinde vinkler og øvrig trafik før du vender tilbage til normal placering. Flere udrykningskøretøjer kan følge efter, og andre trafikanter kan have flyttet sig uventet.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 6.2.6 og 7.4.3-7.4.4"
      }
    ],
    "case": {
      "context": "Du holder for rødt i højre bane, og en ambulance nærmer sig bagfra med fri passage i venstre bane.",
      "action": "Bliv roligt holdende og undgå at køre over stoplinjen.",
      "why": "Ambulancen har allerede en sikker vej; en ulovlig fremkørsel kan skabe krydsende fare.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Plan B 6.2.6 og 7.11.3"
    },
    "recall": {
      "prompt": "Hvad er målet, når du giver fri passage?",
      "answer": "At skabe en tydelig, sikker vej for udrykningen uden at bringe andre eller dig selv i ny fare."
    },
    "practicalNote": "Placering ved udrykning skal trænes og drøftes med kørelæreren i virkelige, lovlige trafiksituationer."
  },
  "uheld": {
    "sectionId": "uheld",
    "chapterId": "grundregler",
    "lead": "Ved uheld kommer menneskers sikkerhed før trafikafvikling og materielle skader.",
    "cards": [
      {
        "title": "Stands og skab overblik",
        "body": "En trafikant, der bliver indblandet i et færdselsuheld, skal standse. Vurder først fare fra trafik, brand og ustabile køretøjer. Sikr stedet så langt det kan ske uden at udsætte dig selv eller andre for yderligere risiko.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Færdselsloven § 9; Plan B 6.2.9"
      },
      {
        "title": "Hjælp og oplysninger",
        "body": "Hjælp personer, der kan være kommet til skade, og tilkald den nødvendige hjælp. De involverede skal kunne udveksle relevante identitets- og køretøjsoplysninger. Forlad ikke stedet, før dine pligter er håndteret forsvarligt.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Færdselsloven § 9; Plan B 6.2.9"
      },
      {
        "title": "Havari er en ny risiko",
        "body": "Ved motorstop eller havari skal bilen så vidt muligt væk fra den kørende trafik. Advar andre, søg et sikkert opholdssted og vurder, om professionel hjælp er nødvendig. Reparation tæt ved hurtig trafik kan være farligere end selve fejlen.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 6.2.8"
      }
    ],
    "case": {
      "context": "Efter et mindre sammenstød holder begge biler midt i en mørk landevej, og ingen virker skadet.",
      "action": "Stands, skab overblik, advar trafikken og flyt kun bilerne, hvis det er sikkert og pligterne kan opfyldes.",
      "why": "Et lille uheld må ikke udvikle sig til en påkørsel.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Plan B 6.2.8-6.2.9; Færdselsloven § 9"
    },
    "recall": {
      "prompt": "Hvilken rækkefølge styrer de første handlinger ved et uheld?",
      "answer": "Stands, vurder og begræns ny fare, hjælp tilskadekomne, tilkald hjælp og opfyld oplysningspligterne."
    },
    "practicalNote": null
  },
  "tavler-signaler": {
    "sectionId": "tavler-signaler",
    "chapterId": "grundregler",
    "lead": "Afmærkning fortæller både, hvad du skal gøre, og hvor tidligt du skal begynde at gøre det.",
    "cards": [
      {
        "title": "B 11 og B 13",
        "body": "B 11 og hajtænder betyder ubetinget vigepligt, men ikke automatisk fuldt stop. B 13 STOP kræver derimod fuld standsning ved stoplinjen; bagefter består den ubetingede vigepligt, så udsyn og trafik skal vurderes på ny.",
        "sourceIds": [
          "plan-b-1-1",
          "afmaerkning"
        ],
        "sourceLocator": "Plan B 7.11.3, pkt. 19, 32 og 36; BEK 425 bilag 1, B 11/B 13"
      },
      {
        "title": "Påbud og hastighed",
        "body": "En påbudstavle viser en handling eller retning, som skal følges. En hastighedstavle angiver den højst tilladte fart, men giver aldrig krav på at køre så hurtigt. Udsyn, føre og trafik kan kræve væsentligt lavere hastighed.",
        "sourceIds": [
          "plan-b-1-1",
          "afmaerkning"
        ],
        "sourceLocator": "Plan B 7.2-7.3 og 7.11.3, pkt. 29; BEK 425 bilag 1, C 55/D 15"
      },
      {
        "title": "Gul afmærkning",
        "body": "Midlertidig gul vejafmærkning bruges blandt andet ved vejarbejde og går foran modstridende hvid afmærkning. Følg den gule linjeføring tidligt, sænk farten og forvent smallere baner, flyttede svingpunkter og arbejdere tæt på kørearealet.",
        "sourceIds": [
          "plan-b-1-1",
          "afmaerkning"
        ],
        "sourceLocator": "Plan B 6.1.2 og 7.2; BEK 425 regler om midlertidig afmærkning"
      }
    ],
    "case": {
      "context": "Ved vejarbejde peger gule banestriber mod venstre, mens de gamle hvide striber fortsætter ligeud.",
      "action": "Følg den gule linjeføring med lavere fart og kontroller nabobanen.",
      "why": "Midlertidig gul afmærkning styrer over den modstridende permanente hvide afmærkning, mens den lavere fart giver tid til at opdage flyttede baner og arbejdere.",
      "sourceIds": [
        "plan-b-1-1",
        "afmaerkning"
      ],
      "sourceLocator": "Plan B 6.1.2; BEK 425 om midlertidig afmærkning"
    },
    "recall": {
      "prompt": "Hvad er forskellen på B 11 og B 13 før vigepligten vurderes?",
      "answer": "B 13 kræver fuld standsning ved stoplinjen; B 11 kræver kun standsning, når trafikken eller udsynet gør det nødvendigt."
    },
    "practicalNote": null
  },
  "ubetinget": {
    "sectionId": "ubetinget",
    "chapterId": "kryds",
    "lead": "Ubetinget vigepligt handler om virkningen på den trafik, du vil ind på eller krydse.",
    "cards": [
      {
        "title": "Hvem holdes der tilbage for?",
        "body": "Ved hajtænder eller B 11 skal du holde tilbage for al kørende trafik på den vej, du kører ind på eller over. Vælg et ophold, så de ikke tvinges til at bremse, undvige eller ændre placering.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.11.3, pkt. 15, 19 og 32"
      },
      {
        "title": "Vigepligt uden tavle",
        "body": "Ubetinget vigepligt kan følge af vejens udformning: udkørsel fra ejendom, parkeringsplads, tankstation, markvej eller over fortov, cykelsti eller hævet rabat. Se derfor på belægning og forløb, ikke kun efter en tavle.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.11.3, pkt. 42-45"
      },
      {
        "title": "Fremkørsel i trin",
        "body": "Dårligt udsyn kan kræve langsom fremkørsel i flere trin. Vis tydeligt, at du vil holde tilbage, og stands om nødvendigt først ved hajtænderne og derefter igen nærmere skæringen, uden at spærre den trafik du skal vige for.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.11.4, pkt. 1 og 5-8"
      }
    ],
    "case": {
      "context": "Du kører fra en tankstation over et fortov. Ingen hajtænder eller tavle er synlige, og en cyklist kommer fra venstre.",
      "action": "Hold tilbage før du krydser fortov og cykelareal.",
      "why": "Udkørsel fra et område uden for vejen giver ubetinget vigepligt uden særskilt tavle.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.11.3, pkt. 42 og 44"
    },
    "recall": {
      "prompt": "Hvordan ved du, at et ophold er stort nok?",
      "answer": "Når du kan gennemføre uden at tvinge den trafik, du viger for, til at sænke farten eller ændre placering."
    },
    "practicalNote": "Fremkørsel og udsyn ved forskellige typer sideveje skal trænes med kørelæreren på vej."
  },
  "stop": {
    "sectionId": "stop",
    "chapterId": "kryds",
    "lead": "STOP består af to beslutninger: først fuld standsning, derefter sikker vigepligtsvurdering.",
    "cards": [
      {
        "title": "Fuld standsning",
        "body": "B 13 kræver, at bilen står helt stille ved stoplinjen. Findes ingen stoplinje, standses før indkørsel i krydset. En meget langsom rullende bevægelse er ikke stop, selv når vejen ser tom ud.",
        "sourceIds": [
          "plan-b-1-1",
          "afmaerkning"
        ],
        "sourceLocator": "Plan B 7.11.3, pkt. 23 og 36; BEK 425 bilag 1, B 13/S 13"
      },
      {
        "title": "Stop løser ikke vigepligten",
        "body": "Efter fuldt stop har du stadig ubetinget vigepligt for kørende fra begge sider. Orienter dig efter biler, cyklister og knallerter. Kontrollér særskilt gående, og overhold pligterne ved svingning og fodgængerfelt. Kør kun frem, når der er plads, uden at andre påvirkes.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026",
          "afmaerkning"
        ],
        "sourceLocator": "BEK 425 bilag 1, B 13; Færdselsloven §§ 3, 26 og 27; Plan B 7.4.3 og 7.11.3-7.11.4"
      },
      {
        "title": "Et ekstra stop kan kræves",
        "body": "Hvis stoplinjen ligger før et sted med frit udsyn, standser du først ved linjen og kører derefter langsomt frem. Stands igen, hvis det er nødvendigt for at orientere dig, men undgå at placere bilen i tværtrafikkens bane.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.11.4, manøvrefærdigheder ved stoplinje"
      }
    ],
    "case": {
      "context": "Du stopper korrekt ved linjen, men en hæk skjuler trafikken fra højre. En meter fremme kan du se uden at spærre.",
      "action": "Kør langsomt frem og stands igen, før du kommer ind i tværtrafikkens bane.",
      "why": "Stoppligten er opfyldt, men vigepligten kræver fortsat sikkert udsyn.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.11.4"
    },
    "recall": {
      "prompt": "Hvorfor kan ét stop ved B 13 være utilstrækkeligt?",
      "answer": "Fordi stoplinjen opfylder stopkravet, men udsynet kan kræve en ny standsning for at overholde den fortsatte vigepligt."
    },
    "practicalNote": "Præcis standsning og trinvis fremkørsel skal øves med kørelærer i kryds med forskelligt udsyn."
  },
  "hoejre": {
    "sectionId": "hoejre",
    "chapterId": "kryds",
    "lead": "Højre vigepligt gælder, når ingen anden regulering fordeler vigepligten i krydset.",
    "cards": [
      {
        "title": "Udgangspunktet",
        "body": "Hvor ingen af parterne har ubetinget vigepligt, skal du som udgangspunkt holde tilbage for kørende fra højre. Kig efter tavler, hajtænder, belægningsskift og overkørsler først; de kan vise, at en anden regel gælder.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.11.3, pkt. 42-47"
      },
      {
        "title": "Sne skjuler ikke reglen",
        "body": "Når vejafmærkningen er skjult af sne, bruges højre vigepligt, hvis ingen anden regulering kan genkendes. Sænk farten ekstra, fordi andre kan tolke krydset anderledes, og fordi bremselængden samtidig kan være større.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.11.3, pkt. 47 og 5.2"
      },
      {
        "title": "Ikke ved baneskift",
        "body": "Højre vigepligt erstatter ikke reglerne om vognbaneskift eller sammenfletning. En bil i højre bane får ikke automatisk forrang, når baner føres sammen; afmærkningen og manøvrens art afgør, hvem der skal tilpasse sig.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.4.5 og 7.11.3, pkt. 46"
      }
    ],
    "case": {
      "context": "To små veje krydser uden tavler eller hajtænder. En bil nærmer sig fra din højre side med samme fart.",
      "action": "Sænk farten og hold tilbage, så den kan passere uden at ændre kurs eller fart.",
      "why": "Uden anden regulering gælder højre vigepligt.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.11.3, pkt. 46"
    },
    "recall": {
      "prompt": "Hvilket spørgsmål skal du stille før du bruger højre vigepligt?",
      "answer": "Om tavler, afmærkning eller vejens udformning allerede giver en af parterne ubetinget vigepligt."
    },
    "practicalNote": "Kryds uden tydelig regulering skal øves med kørelærer, fordi vejens udformning skal aflæses i bevægelse."
  },
  "sving-cykel": {
    "sectionId": "sving-cykel",
    "chapterId": "kryds",
    "lead": "Ved sving krydser din bil ofte den linje, som cyklister og knallerter fortsætter i.",
    "cards": [
      {
        "title": "Orientering i flere tempi",
        "body": "Se tidligt i spejle og blind vinkel før placering, og gentag kontrollen lige før svinget. En cyklist kan nå fra bag bilen til siden på få sekunder. Ét skulderblik langt fra krydset er derfor ikke nok.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.13.3, pkt. 11-14 og 19-21"
      },
      {
        "title": "Placering uden fælde",
        "body": "Placér bilen tydeligt til højre før højresving, når forholdene tillader det, så der ikke skabes en farlig smal åbning. Er en cyklist allerede ved siden af, bliver du bagved og lader cyklisten fortsætte først.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.13.4, pkt. 1-5 og 10-12"
      },
      {
        "title": "Dobbeltrettet cykelsti",
        "body": "En dobbeltrettet cykelsti kan sende cyklister mod din forventede retning. Se efter undertavle og kontroller begge retninger ved ind- og udkørsel. Hold tilbage, hvis svinget ellers tvinger cyklisten til at bremse eller standse.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.13.3, pkt. 1, 7 og 21"
      }
    ],
    "case": {
      "context": "Du vil svinge til højre. En cyklist ligger skjult ved bilens højre baghjørne, mens cykelstien fortsætter ligeud.",
      "action": "Bliv bag cyklisten og fuldfør først svinget, når stien er fri.",
      "why": "Den ligeudkørende cyklist må ikke tvinges til at bremse af dit sving.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.13.4, pkt. 10-12"
    },
    "recall": {
      "prompt": "Hvorfor skal orienteringen gentages lige før højresvinget?",
      "answer": "Fordi en cyklist kan være kommet frem i blind vinkel siden den første kontrol."
    },
    "practicalNote": "Spejl, blindvinkelkontrol, placering og lav svingfart skal samles i fysisk krydstræning med kørelærer."
  },
  "venstresving": {
    "sectionId": "venstresving",
    "chapterId": "kryds",
    "lead": "Et sikkert venstresving kræver, at du fordeler opmærksomheden mellem modkørende, sideveje og udkørslen.",
    "cards": [
      {
        "title": "Placering og bagfrakommende",
        "body": "Giv tegn i passende afstand, kontroller spejle og blind vinkel til venstre, og placér bilen i venstre del af egen kørselsretning eller anvist svingbane. Bagfrakommende motorcyklister kan forsøge at overhale netop dér.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.14.3, pkt. 1 og 11; 7.14.4, pkt. 1-2"
      },
      {
        "title": "Modkørende bestemmer opholdet",
        "body": "Hold tilbage for modkørende, der fortsætter ligeud eller svinger til højre. Bedøm både afstand og hastighed, især for små hurtige køretøjer. Et grønt hovedsignal uden grøn venstrepil betyder ikke fri bane gennem de modkørende.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.14.2, pkt. 4 og 9; 7.14.3, pkt. 5-7 og 18-21"
      },
      {
        "title": "Se udgangen før du kører",
        "body": "Vent, hvis en modkørende venstresvinger skjuler trafikken bag sig. Før afslutningen skal du også se efter gående og cyklister ved den vej, du svinger ind på, og sikre plads i den valgte bane.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.14.3, pkt. 7-10 og 14-17; 7.14.4, pkt. 4-10"
      }
    ],
    "case": {
      "context": "Du har grønt, men ingen venstrepil. En varebil modsat venter også på venstresving og skjuler en motorcykel bag sig.",
      "action": "Vent med at fuldføre svinget, til udsynet og opholdet er sikkert.",
      "why": "Grønt ophæver ikke pligten over for modkørende, og varebilen skjuler en væsentlig risiko.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.14.3, pkt. 7 og 18-21"
    },
    "recall": {
      "prompt": "Hvilke tre retninger skal din opmærksomhed dække i et venstresving?",
      "answer": "Bagud til venstre, mod modkørende og tværgående trafik samt frem mod gående, cyklister og plads på den nye vej."
    },
    "practicalNote": "Venteposition, udsyn og rømning ved signalskift skal øves i flere krydstyper med kørelærer."
  },
  "fodgaenger-rund": {
    "sectionId": "fodgaenger-rund",
    "chapterId": "kryds",
    "lead": "I rundkørsler flytter risikoen sig fra indkørslen til siden og udkørslen.",
    "cards": [
      {
        "title": "Frem mod feltet",
        "body": "Nærm dig et fodgængerfelt med en fart, der gør det muligt at standse. Se efter personer, som er på vej ud i feltet, ikke kun dem der allerede går der. Bagfrakommende trafik ændrer ikke dette ansvar.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.6 og 7.15.3, pkt. 5"
      },
      {
        "title": "Ind i rundkørslen",
        "body": "Læs vognbaner, signaler og vigepligt før indkørslen. Bedøm især cyklister og knallerter fra venstre, som let undervurderes. Lavere fart giver tid til at kontrollere både rundkørslen og eventuelle krydsende stier.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.15.2 og 7.15.3, pkt. 2 og 6-10"
      },
      {
        "title": "Udkørslen",
        "body": "Giv tegn til højre før udkørslen, men brug ikke blinket som erstatning for orientering. Kontroller bagud til højre og frem mod gående, cyklister og knallerter, der krydser udkørslen. Hold tilbage, hvis din vej skærer deres.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.15.2, pkt. 5; 7.15.4 om udkørsel"
      }
    ],
    "case": {
      "context": "Du er på vej ud af rundkørslen. En gående nærmer sig feltet, og en cyklist fortsætter på stien rundt om rundkørslen.",
      "action": "Sænk farten og hold tilbage før deres krydsning.",
      "why": "Udkørslen skærer deres linjer, og blinket ændrer ikke din pligt til sikker passage.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.15.3-7.15.4"
    },
    "recall": {
      "prompt": "Hvorfor er højre blink alene utilstrækkeligt ved udkørsel?",
      "answer": "Det viser kun hensigten; du skal stadig opdage og holde tilbage for trafikanter, hvis linje du krydser."
    },
    "practicalNote": "Indplacering, orientering og udkørsel skal øves i rundkørsler med forskellig størrelse og cykelføring."
  },
  "placering-fart": {
    "sectionId": "placering-fart",
    "chapterId": "vejmanoevrer",
    "lead": "Placering og fart skal give udsyn, plads og mulighed for at standse før det forventelige.",
    "cards": [
      {
        "title": "Hold til højre med mening",
        "body": "Hold normalt så langt til højre, som vej, føre og øvrig trafik tillader. Kør ikke så tæt på kant, parkerede biler eller cyklister, at sikkerhedsmarginen forsvinder. Placeringen skal også give udsyn gennem kurver og over bakker.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.2.2-7.2.4"
      },
      {
        "title": "Maksimum er ikke målfart",
        "body": "Den skiltede grænse er et loft under gode forhold. Mørke, regn, børn ved vejen, en skarp kurve eller begrænset udsyn kan kræve lavere fart. Tilpasningen skal ske før risikoen, ikke midt i den.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Plan B 7.3.2-7.3.5"
      },
      {
        "title": "Stands på den synlige strækning",
        "body": "Vælg fart, så du kan standse for en hindring, der med rimelighed kan forventes. Når udsynet halveres af tåge eller bakketop, skal din mulige standsestrækning også passe til den kortere synlige vej.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 5.2 og 7.3.3-7.3.4"
      }
    ],
    "case": {
      "context": "På en 80-vej skjuler en bakketop kørebanen foran, og der kan være en langsom traktor på den anden side.",
      "action": "Sænk farten før toppen og behold en placering med afstand til midten.",
      "why": "Du skal kunne reagere inden for den vejstrækning, du faktisk kan overskue.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 5.2.4 og 7.3"
    },
    "recall": {
      "prompt": "Hvad bestemmer den sikre fart ud over tavlen?",
      "answer": "Udsyn, vejgreb, vejforløb, trafik og den afstand du behøver for at opdage, reagere og standse."
    },
    "practicalNote": "Farttilpasning og placering skal opleves og korrigeres under øvelseskørsel på by- og landevej."
  },
  "bane-flet": {
    "sectionId": "bane-flet",
    "chapterId": "vejmanoevrer",
    "lead": "Baneskift og sammenfletning ligner hinanden, men fordeler ansvaret forskelligt.",
    "cards": [
      {
        "title": "Ved vognbaneskift",
        "body": "Den, der skifter vognbane, skal sikre, at det sker uden fare eller unødig ulempe. Brug spejle, blindvinkelkontrol og tegn, og bedøm både afstand og hastighed. Et blink skaber ikke et sikkert ophold.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.4.3-7.4.5, vognbaneskift"
      },
      {
        "title": "Ved sammenfletning",
        "body": "Når vognbaner uden vigepligtsmarkering løber sammen til én, skal trafikanterne gensidigt tilpasse fart og placering. Se langt frem, vælg et ophold tidligt og undgå at konkurrere om samme punkt på vejen.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.4.3-7.4.5, sammenfletning"
      },
      {
        "title": "Læs afmærkningen",
        "body": "En punkteret linje mellem baner peger ofte på vognbaneskift; ophører linjen, kan der være sammenfletning. Hajtænder eller vigepligtstavle ændrer situationen igen. Afgør derfor manøvren ud fra den konkrete afmærkning, ikke vane.",
        "sourceIds": [
          "plan-b-1-1",
          "afmaerkning"
        ],
        "sourceLocator": "Plan B 7.4.5 og 7.11.3, pkt. 13-20"
      }
    ],
    "case": {
      "context": "Din bane fortsætter gennem en punkteret linje ind i nabobanen; den forsvinder ikke som ved sammenfletning.",
      "action": "Behandl det som vognbaneskift og vent på et sikkert ophold.",
      "why": "Du krydser en vognbanelinje og har ansvaret for ikke at genere trafikken i banen.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.4.5"
    },
    "recall": {
      "prompt": "Hvad er den centrale forskel i ansvar?",
      "answer": "Ved vognbaneskift har den skiftende fører ansvaret; ved reel sammenfletning skal begge strømme tilpasse sig gensidigt."
    },
    "practicalNote": "Afmærkning, spejlsekvens og valg af ophold skal trænes i virkelige bane- og fletteforløb med kørelærer."
  },
  "afstand-moede": {
    "sectionId": "afstand-moede",
    "chapterId": "vejmanoevrer",
    "lead": "Afstand køber tid, mens lav fart og tydelig placering gør et vanskeligt møde løseligt.",
    "cards": [
      {
        "title": "Afstand til forankørende",
        "body": "Hold så stor afstand, at du kan reagere, hvis den forankørende bremser pludseligt. Afstanden skal øges ved glat vej, dårlig sigt, tung last eller distraktionsrisiko, fordi både opdagelse og standsning kan tage længere tid.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.8.2-7.8.5"
      },
      {
        "title": "Møde på smal vej",
        "body": "Se tidligt efter indsnævringer, parkerede biler og bløde rabatter. Sænk farten før mødet og aftal forløbet gennem tydelig placering. Har du hindringen på din side, må du ofte vente, men sikkerheden gælder uanset retten.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.7.2-7.7.5"
      },
      {
        "title": "Store køretøjer",
        "body": "Busser og lastbiler kræver mere plads i sving og kan skabe lufttryk ved møde. Øg sideafstand og sænk farten, især på smal landevej. Undgå at bruge rabatten, hvis bæreevne eller høj kant er usikker.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 3.2.2 og 7.7"
      }
    ],
    "case": {
      "context": "En parkeret varebil spærrer din side af en smal vej, mens en bus nærmer sig modsat.",
      "action": "Sænk farten og vent bag varebilen, hvor bussen har fri passage.",
      "why": "Hindringen er på din side, og et samtidigt møde ville fjerne sikker sideafstand.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.7.4-7.7.5"
    },
    "recall": {
      "prompt": "Hvornår skal afstanden til den forankørende øges?",
      "answer": "Når udsyn, vejgreb, last, fart eller opmærksomhed gør reaktion og standsning mere krævende."
    },
    "practicalNote": "Afstandsbedømmelse og møde skal trænes ved forskellige hastigheder og vejbredder med kørelærer."
  },
  "overhaling": {
    "sectionId": "overhaling",
    "chapterId": "vejmanoevrer",
    "lead": "En overhaling er kun sikker, når hele forløbet og en mulig afbrydelse er planlagt på forhånd.",
    "cards": [
      {
        "title": "Før beslutningen",
        "body": "Kontroller forbud, vejforløb, modkørende, bagfrakommende og pladsen foran den, du vil overhale. Øg afstanden til et stort køretøj for bedre udsyn længere fremad. Begynd ikke, hvis nogen bagfra allerede overhaler.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.9.2-7.9.4, før overhaling"
      },
      {
        "title": "Under overhalingen",
        "body": "Hold tilstrækkelig sideafstand og gennemfør effektivt uden at overskride hastighedsgrænsen. Bevar overblik fremad og bagud. Hvis en skjult hindring eller modkørende gør pladsen tvivlsom, afbryd tidligt i stedet for at håbe.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.9.3-7.9.4, pkt. 7-13"
      },
      {
        "title": "Sikker tilbagevenden",
        "body": "Træk først ind, når den overhalede er synlig i det indvendige spejl, medmindre et tidligere indtræk er nødvendigt for at afværge fare. Sørg for afstand både foran og bag den overhalede efter manøvren.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.9.4, pkt. 13-15"
      }
    ],
    "case": {
      "context": "Du er ved at overhale en traktor, da en cyklist bliver synlig længere fremme i din tilbagevendingsbane.",
      "action": "Afbryd tidligt og træk sikkert tilbage bag traktoren, hvis opholdet stadig er åbent.",
      "why": "Den planlagte afslutning har mistet nødvendig plads og sideafstand, og en fortsættelse kan presse cyklisten eller møde modkørende uden en sikker flugtvej.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.9.4, pkt. 8 og 12"
    },
    "recall": {
      "prompt": "Hvilken mulighed skal være planlagt før en overhaling begynder?",
      "answer": "En sikker tilbagevenden eller afbrydelse, hvis udsyn, modkørende eller en ny hindring ændrer situationen."
    },
    "practicalNote": "Overhalingsbedømmelse skal udvikles gradvist med kørelærer; appen kan ikke træne reel afstand og hastighed."
  },
  "trafiksanering": {
    "sectionId": "trafiksanering",
    "chapterId": "vejmanoevrer",
    "lead": "I trafiksanerede områder er bilen gæst, og den laveste relevante fart kan være langt under tavlens tal.",
    "cards": [
      {
        "title": "Ophold og leg",
        "body": "I opholds- og legeområde er kørende færdsel underordnet. Kør normalt under 15 km/t, hold tilbage for gående, og fortsæt først når de har set bilen, givet plads og ingen kan komme farligt nær den.",
        "sourceIds": [
          "plan-b-1-1",
          "afmaerkning"
        ],
        "sourceLocator": "Plan B 7.10.3, pkt. 10 og 7.10.5, pkt. 1; BEK 425, E 51"
      },
      {
        "title": "Gågade og cykelgade",
        "body": "I gågade skal tilladt bilkørsel ske med særlig hensyn til gående og meget lav fart. I cykelgade skal bilisten tilpasse sig cyklisterne og må ikke unødigt hindre andre kørende. Undertavlen afgør, om bilkørsel er tilladt.",
        "sourceIds": [
          "plan-b-1-1",
          "afmaerkning"
        ],
        "sourceLocator": "Plan B 7.10.3, pkt. 6-9 og 7.10.5, pkt. 2-3; BEK 425, E 47/E 49"
      },
      {
        "title": "Udgang og parkering",
        "body": "Parkering i gågade, cykelgade og opholds- og legeområde må ikke ske uden for afmærkede pladser. Ved udkørsel fra områderne har den kørende ubetinget vigepligt. Se derfor efter cyklister og gående før vejens øvrige trafik.",
        "sourceIds": [
          "plan-b-1-1",
          "afmaerkning"
        ],
        "sourceLocator": "Plan B 7.10.3, pkt. 6-11 og 7.11.3, pkt. 43"
      }
    ],
    "case": {
      "context": "Et barn leger foran bilen i et E 51-område og har endnu ikke set dig, selv om der er plads ved siden af.",
      "action": "Bliv holdende, til barnet har set bilen, givet plads og ikke kan komme farligt nær.",
      "why": "Lav fart alene opfylder ikke kravet til passage.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.10.5, pkt. 1"
    },
    "recall": {
      "prompt": "Hvilke tre betingelser skal være opfyldt før du passerer legende børn?",
      "answer": "De skal have set bilen, have givet plads, og ingen må kunne komme farligt nær bilen."
    },
    "practicalNote": "Fart og samspil i trafiksanerede områder skal trænes med kørelærer under respekt for lokale adgangsregler."
  },
  "motorvej": {
    "sectionId": "motorvej",
    "chapterId": "vejmanoevrer",
    "lead": "På motorvej gør den høje fart tidlig planlægning vigtigere end hurtige korrektioner.",
    "cards": [
      {
        "title": "Tilkørsel",
        "body": "Tilpas hastigheden i accelerationsbanen, og kør kun ind uden fare eller unødig ulempe. Orienter tidligt og gentaget. Trafikken i den bane, du kører ind i, skal om nødvendigt sænke hastigheden for at lette indkørslen; reglen kræver ikke et pludseligt eller uforsvarligt vognbaneskift.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Færdselsloven § 18, stk. 3; Plan B 7.16.4"
      },
      {
        "title": "Løbende kørsel",
        "body": "Hold til højre, vælg lang sikkerhedsafstand og se langt frem efter kø eller bremselys. Baneskift kræver fuld orientering; høj fart gør små fejlbedømmelser store. Overhaling skal afsluttes med sikker afstand før tilbagevenden.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.16.2-7.16.5"
      },
      {
        "title": "Havari og forbud",
        "body": "Bakning, vending, standsning og parkering er forbudt uden for anviste steder, bortset fra nødsituationer. Ved havari søges så langt væk fra kørebanen som muligt, andre advares, og personer placerer sig sikkert væk fra trafikken.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Plan B 7.16.5, motorvejsregler og 6.2.8"
      }
    ],
    "case": {
      "context": "Du opdager sent, at din frakørsel begynder nu, men en bil ligger i blind vinkel til højre.",
      "action": "Fortsæt til næste frakørsel i stedet for at presse et sent baneskift igennem.",
      "why": "Ruteomvejen er ufarlig; et brat sideskift ved høj fart er ikke.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.4 og 7.16.4"
    },
    "recall": {
      "prompt": "Hvad er accelerationsbanens vigtigste funktion?",
      "answer": "At give plads til farttilpasning, orientering og valg af et sikkert ophold før indkørsel."
    },
    "practicalNote": "Til- og frakørsel, afstand og baneskift skal gennemføres fysisk med kørelærer på motorvej eller relevant motortrafikvej."
  },
  "letbane": {
    "sectionId": "letbane",
    "chapterId": "vejmanoevrer",
    "lead": "Letbanetog følger et bundet spor og kan ikke undvige din fejlplacering.",
    "cards": [
      {
        "title": "Lang bremselængde",
        "body": "Letbanetog har lang bremselængde og kan ikke styre uden om bilen. Kontroller tog, spor og sporets fortsatte forløb før krydsning, sving eller forbikørsel. Gå aldrig ud fra, at toget kan løse konflikten.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.21.2, pkt. 3 og 7.21.3, pkt. 3-4"
      },
      {
        "title": "Læs det rigtige signal",
        "body": "Følg hovedsignal og tavler for din egen kørselsretning. X 19 med hvide lys gælder for busser i rutekørsel, letbanekøretøjer og nulemissionsbiler, ikke automatisk din bil. V 43 markerer en bane for letbanekøretøjer.",
        "sourceIds": [
          "plan-b-1-1",
          "afmaerkning"
        ],
        "sourceLocator": "Plan B 7.21.3, pkt. 5-7; BEK 425, V 43/UB 11,3/X 19"
      },
      {
        "title": "Undervisningsformen",
        "body": "Praktisk kørsel ved letbane er obligatorisk, når en lektion på mindst 45 minutter tillader turen til, ved og tilbage fra letbanen. Ellers skal de praktiske færdigheder undervises i teorilokalet; emnet må ikke blot udelades.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.21, hovedmål før 7.21.1"
      }
    ],
    "case": {
      "context": "Dit bilsignal viser rødt, mens et hvidt X 19-signal giver letbanetoget passage.",
      "action": "Stands ved din stoplinje og vent på signalet for bilens retning.",
      "why": "Det særskilte hvide signal gælder ikke automatisk din bil, og toget kan ikke undvige sporet eller bremse som en personbil, hvis du kører frem.",
      "sourceIds": [
        "plan-b-1-1",
        "afmaerkning"
      ],
      "sourceLocator": "Plan B 7.21.3, pkt. 7"
    },
    "recall": {
      "prompt": "Hvorfor må du ikke handle efter letbanens hvide signal?",
      "answer": "Fordi signalet gælder bestemte køretøjer; du skal følge signalet og afmærkningen for din egen kørselsretning."
    },
    "practicalNote": "Kørsel ved letbane er fysisk undervisning, når 45-minuttersbetingelsen kan opfyldes; ellers underviser kørelæreren i færdighederne i teorilokalet."
  },
  "standsning-parkering": {
    "sectionId": "standsning-parkering",
    "chapterId": "vejmanoevrer",
    "lead": "Parkering starter med at skelne mellem opholdets formål og stedets konkrete forbud.",
    "cards": [
      {
        "title": "Standsning eller parkering",
        "body": "Parkering er enhver hensætning, men standsning under tre minutter samt nødvendig af- og påstigning eller aktiv af- og pålæsning regnes ikke som parkering. Et standsningsforbud er derfor bredere og rammer også korte frivillige ophold.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Plan B 7.18.5, definitioner; Færdselsloven § 2"
      },
      {
        "title": "Kryds og fodgængerfelt",
        "body": "Uden afmærket bås må du hverken standse eller parkere i et kryds eller nærmere end 10 meter fra den tværgående kørebanes nærmeste kant. Ved fodgængerfelt gælder forbuddet i feltet og 5 meter foran.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Plan B 7.18.5; Færdselsloven § 29"
      },
      {
        "title": "Sti, fortov og reserveret plads",
        "body": "Standsning og parkering er forbudt på cykelsti og gangsti og som hovedregel på fortov. En handicapbås kræver gyldigt parkeringskort. Læs altid undertavlens tidsrum og pile; en lovlig plads kan være reserveret eller tidsbegrænset.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026",
          "afmaerkning",
          "handicapkort"
        ],
        "sourceLocator": "Plan B 7.18.5; Færdselsloven § 28-29; BEK 99/2024"
      }
    ],
    "case": {
      "context": "Du vil sætte en passager af fire meter før et fodgængerfelt og regner med at holde under ét minut.",
      "action": "Find et andet sted mindst fem meter før feltet eller efter det, hvis øvrige regler tillader det.",
      "why": "Det er standsning, og standsningsforbuddet gælder uanset varigheden.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Plan B 7.18.5; Færdselsloven § 29"
    },
    "recall": {
      "prompt": "Hvorfor gør et ophold under tre minutter ikke altid stedet lovligt?",
      "answer": "Fordi det kun skelner standsning fra parkering; steder med standsningsforbud er stadig ulovlige."
    },
    "practicalNote": "Lovlig placering, orientering og sikring af bilen skal øves fysisk med kørelærer; afstande skal bedømmes på stedet."
  },
  "energi-miljoe": {
    "sectionId": "energi-miljoe",
    "chapterId": "risiko-teknik",
    "lead": "Energirigtig kørsel virker bedst, når den bygger på forudseenhed og aldrig reducerer sikkerhedsmarginen.",
    "cards": [
      {
        "title": "Se langt frem",
        "body": "Forudseende kørsel begrænser unødvendig acceleration og bremsning. Hold afstand, slip speederen tidligt og bevar en jævn fart, når trafikken tillader det. Det sænker forbruget og giver samtidig mere tid til at reagere.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 1.2.6"
      },
      {
        "title": "Bilens modstand",
        "body": "For lavt dæktryk, unødig last og tagudstyr øger rulle- eller luftmodstanden. Kontroller dæktryk efter bilens anvisning og fjern udstyr, der ikke bruges. Energibesparelsen må ikke ske ved ulovligt eller usikkert dæktryk.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 1.2.6 og 9.1.2"
      },
      {
        "title": "Sikkerhed først",
        "body": "Undlad aldrig nødvendig acceleration ved indkørsel eller kraftig bremsning i fare for at spare energi. Miljøkørsel handler om at undgå unødige ændringer, ikke om at gøre nødvendige manøvrer langsomme eller tøvende.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 1.2.6, energi- og miljørigtig kørsel under hensyn til sikkerhed"
      }
    ],
    "case": {
      "context": "Du nærmer dig rødt lys med god afstand og ingen bagvedkørende tæt på.",
      "action": "Slip speederen tidligt og brems jævnt frem mod en kontrolleret standsning.",
      "why": "Du undgår unødig energiomsætning og bevarer overblik uden at ofre sikkerhed; hvis signalet skifter, vurderer du stadig situationen frem for at accelerere automatisk.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 1.2.6"
    },
    "recall": {
      "prompt": "Hvad adskiller energirigtig kørsel fra langsom tøven?",
      "answer": "Den forudser trafikken og undgår unødige ændringer, men udfører nødvendige accelerationer og bremsninger sikkert og beslutsomt."
    },
    "practicalNote": null
  },
  "fart-energi": {
    "sectionId": "fart-energi",
    "chapterId": "risiko-teknik",
    "lead": "Mere fart giver både mindre tid til at reagere og langt mere energi, der skal bremses væk.",
    "cards": [
      {
        "title": "To strækninger",
        "body": "Standselængden består af reaktionsstrækning og bremselængde. Højere fart øger begge dele væsentligt: bilen kører længere, mens føreren reagerer, og bremserne skal fjerne mere bevægelsesenergi. Distraktion forlænger den første del yderligere.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 4.1.2 og 9.2.3, pkt. 1 og 10"
      },
      {
        "title": "Firedoblet bremselængde",
        "body": "Når hastigheden fordobles under sammenlignelige forhold, bliver bremselængden omtrent firedoblet. Sammenhængen forklarer, hvorfor en beskeden fartreduktion før en kurve eller synlig risiko kan give en stor ekstra sikkerhedsmargin i praksis.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 8.1.3 og 9.2.1-9.2.3, pkt. 5"
      },
      {
        "title": "Føre og bakke",
        "body": "Våd asfalt, grus, sne, is og nedkørsel øger bremselængden. Tilpas farten før underlaget eller bakken, og skab større afstand. ABS hjælper med hjulenes rotation, men ophæver ikke den begrænsede friktion.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 9.2.3, pkt. 6-10 og 9.2.4"
      }
    ],
    "case": {
      "context": "Regnen begynder på en nedadgående landevej, mens du ligger tættere på bilen foran end før.",
      "action": "Slip speederen, øg afstanden gradvist og undgå en brat korrektion.",
      "why": "Både vådt føre og nedkørsel kan forlænge bremsningen, mens større afstand giver tid til en jævn reaktion, hvis bilen foran pludselig sænker farten.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 9.2.3, pkt. 6-10"
    },
    "recall": {
      "prompt": "Hvorfor bliver en lille fartreduktion mere værdifuld end tallet antyder?",
      "answer": "Fordi bremselængde og bevægelsesenergi vokser kraftigere end hastigheden; ved fordobling bliver bremselængden omtrent fire gange så stor."
    },
    "practicalNote": null
  },
  "bremse-greb": {
    "sectionId": "bremse-greb",
    "chapterId": "risiko-teknik",
    "lead": "Dækkenes vejgreb er en begrænset ressource, som bremsning og styring skal dele.",
    "cards": [
      {
        "title": "Friktionens budget",
        "body": "Dækket kan kun overføre en begrænset samlet kraft. Hård bremsning samtidig med kraftig styring kan overskride grebet, især på glat vej. Reducer derfor fart før kurven og gør styringen jævn.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 9.1.1 og 9.2.4"
      },
      {
        "title": "ABS ved hård bremsning",
        "body": "I en bil med ABS skal bremsepedalen ved maksimal bremsning trædes helt ned og holdes nede. Vibrationer i pedalen kan være systemets regulering. ABS hjælper med styrbarhed, men skaber ikke bedre vejgreb.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 9.2.4, pkt. 4-5 og 11-14"
      },
      {
        "title": "Dæk og belæsning",
        "body": "Dæktype, dæktryk, slid og belæsning påvirker vejgreb og bilens reaktion. Tung eller højt placeret last ændrer stabiliteten. Kontroller bilen og sænk hastigheden, før du forventer, at elektroniske systemer retter en fysisk ubalance.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 9.1.1-9.1.2"
      }
    ],
    "case": {
      "context": "Du kommer for hurtigt ind i en våd kurve og overvejer både at dreje kraftigt og bremse hårdt.",
      "action": "Reducer kravene til dækkene med rolig styring og kontrolleret fartreduktion.",
      "why": "Samtidig maksimal styring og bremsning kan overskride det begrænsede vejgreb, især på den våde overflade; lavere fart før kurven ville have bevaret mere reserve.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 9.2.4"
    },
    "recall": {
      "prompt": "Hvad betyder det, at bremsning og styring deler vejgrebet?",
      "answer": "Jo mere kraft dækkene bruger i én retning, desto mindre reserve er der til den anden."
    },
    "practicalNote": "Maksimal bremsning og forskelle i vejgreb skal erfares på godkendt køreteknisk anlæg med kørelærer."
  },
  "udskridning": {
    "sectionId": "udskridning",
    "chapterId": "risiko-teknik",
    "lead": "Den vigtigste udskridningsmanøvre sker før udskridningen: korrekt fart før kurven eller hindringen.",
    "cards": [
      {
        "title": "Forebyg først",
        "body": "For høj indgangsfart, brat styring og glat føre øger risikoen for tab af vejgreb. Sænk farten på den lige strækning før kurven. Når bilen allerede skrider, er handlemulighederne mindre og mere følsomme.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 9.4.1"
      },
      {
        "title": "Undvigelse kræver ro",
        "body": "Ved en pludselig hindring kan både bremsning og undvigelse være nødvendig. Se mod den sikre vej, undgå unødigt voldsomme ratbevægelser og tilpas handlingen til grebet. En panikbevægelse kan skabe en ny udskridning.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 9.3.2-9.3.3"
      },
      {
        "title": "Erfaring kan ikke læses",
        "body": "Planen kræver øvelser på almindeligt og glat underlag, så eleven mærker forskellen i fart, bremsning og styring. En forklaring kan forberede rækkefølgen, men kan ikke give den fysiske erfaring med bilens reaktion.",
        "sourceIds": [
          "plan-b-1-1",
          "udd-731"
        ],
        "sourceLocator": "Plan B 9.2.4 og 9.3-9.4; BEK 731 om køreteknisk anlæg"
      }
    ],
    "case": {
      "context": "På køreteknisk anlæg mærker du, at bilen begynder at skride ud i en glat kurve.",
      "action": "Følg kørelærerens instruktion, undgå panikbevægelser og søg roligt at genvinde vejgreb og kurs.",
      "why": "Bratte input kan bruge det sidste greb og forværre udskridningen. Øvelsen skal netop give fysisk erfaring under kontrollerede forhold, som en tekstforklaring ikke kan erstatte.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 9.4.1"
    },
    "recall": {
      "prompt": "Hvorfor er farttilpasning før kurven vigtigere end en redningsmanøvre i kurven?",
      "answer": "Fordi lavere indgangsfart bevarer vejgreb og handlemuligheder, mens en aktiv udskridning giver meget mindre reserve."
    },
    "practicalNote": "Udskridning og undvigelse må kun trænes som den lovpligtige fysiske undervisning på køreteknisk anlæg med kørelærer."
  },
  "hoej-vejkant": {
    "sectionId": "hoej-vejkant",
    "chapterId": "risiko-teknik",
    "lead": "Når hjulene er kommet ud over en høj kant, er en langsom genopretning sikrere end et hurtigt ryk tilbage.",
    "cards": [
      {
        "title": "Den farlige refleks",
        "body": "Et kraftigt ratudslag tilbage mod vejen ved høj fart kan få hjulene til pludseligt at gribe kanten og sende bilen ukontrolleret over kørebanen. Modstå derfor refleksen til straks at tvinge bilen op.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 9.5.1, pkt. 1-2"
      },
      {
        "title": "Stabiliser og sænk farten",
        "body": "Styr roligt lige frem langs kanten og brems forsigtigt. Målet er først at stabilisere bilen og reducere hastigheden, ikke at komme tilbage øjeblikkeligt. Kontroller samtidig den øvrige trafik, hvis situationen sker i virkeligheden.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 9.5.1, pkt. 4"
      },
      {
        "title": "Tilbage ved lav fart",
        "body": "Styr først kontrolleret op over kanten, når hastigheden er så lav, at det kan ske uden risiko. Planen lader eleven erfare forløbet flere gange og om muligt med kanten i både højre og venstre side.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 9.5.1, pkt. 3-6"
      }
    ],
    "case": {
      "context": "På anlægget kommer højre hjul over kanten ved for høj fart til en sikker tilbageføring.",
      "action": "Hold retningen langs kanten, brems forsigtigt og styr først tilbage ved lav fart efter instruktion.",
      "why": "Et brat ratudslag kan udløse tab af kontrol på tværs af banen.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 9.5.1, pkt. 3-5"
    },
    "recall": {
      "prompt": "Hvad skal være opnået, før du styrer tilbage over kanten?",
      "answer": "Bilen skal være stabil, og hastigheden så lav, at tilbageføringen kan ske kontrolleret uden risiko."
    },
    "practicalNote": "Øvelsen kræver fysisk instruktion på køreteknisk anlæg og må ikke selvafprøves på offentlig vej."
  },
  "sele-ansvar": {
    "sectionId": "sele-ansvar",
    "chapterId": "risiko-teknik",
    "lead": "Selen virker på alle ture, og førerens ansvar bliver skærpet, når passageren er et barn.",
    "cards": [
      {
        "title": "Kort tur, samme kræfter",
        "body": "Sikkerhedssele begrænser kroppens bevægelse ved opbremsning og sammenstød. Lav fart eller kort afstand gør ikke kroppen vægtløs. Brug selen korrekt, og sørg for at den ligger tæt uden vrid over kroppens stærke områder.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 8.1.4"
      },
      {
        "title": "Børn under 135 cm",
        "body": "Børn under 135 centimeter skal som hovedregel bruge godkendt sikkerhedsudstyr, der passer til højde og vægt. Udstyret skal monteres efter anvisningen; en løs eller forkert placeret sele kan ikke erstattes af en voksens hånd.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Færdselsloven § 80 a, stk. 1 og 6; Plan B 6.2.7"
      },
      {
        "title": "Førerens ansvar",
        "body": "Føreren er ansvarlig for, at passagerer under 15 år bruger sele eller andet krævet sikkerhedsudstyr. Kontrollen skal ske før bilen kører. En ældre passagers eget ansvar fjerner ikke værdien af at sikre alle.",
        "sourceIds": [
          "plan-b-1-1",
          "fl-2026"
        ],
        "sourceLocator": "Færdselsloven § 80, stk. 4, og § 80 a, stk. 6; Plan B 6.2.7 og 8.1.4"
      }
    ],
    "case": {
      "context": "Et barn på 128 cm sidder med voksenbæltet løst over halsen, fordi selepuden ligger i bagagerummet.",
      "action": "Kør ikke, før passende godkendt udstyr er monteret korrekt.",
      "why": "Højden udløser som hovedregel krav om tilpasset sikkerhedsudstyr, og føreren har ansvaret. En løs sele over halsen giver ikke den beskyttelse, korrekt montering skal skabe.",
      "sourceIds": [
        "plan-b-1-1",
        "fl-2026"
      ],
      "sourceLocator": "Færdselsloven § 80 a, stk. 1 og 6; Plan B 6.2.7"
    },
    "recall": {
      "prompt": "Hvem har ansvaret for en 14-årigs selebrug under kørslen?",
      "answer": "Føreren har ansvaret for passagerer under 15 år."
    },
    "practicalNote": null
  },
  "sammensat-koersel": {
    "sectionId": "sammensat-koersel",
    "chapterId": "koerekort",
    "lead": "Den afsluttende kørsel samler færdigheder og refleksion i et fysisk forløb med kørelæreren.",
    "cards": [
      {
        "title": "Fælles mål",
        "body": "Kørelærer og elev opstiller gennem dialog fælles mål for hver lektion og følger op med refleksion. Målet kan handle om en svaghed, en vejtype eller selvstændig planlægning. Det gør turen læringsstyret frem for blot gennemkørt.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.22, hovedmål"
      },
      {
        "title": "Bil og hjælpemidler",
        "body": "Eleven videreudvikler kontrol af bilens stand, forståelse af førerassistentsystemer og energi- og miljørigtig kørsel. GPS og assistenter kan indgå i ruteplanen, men eleven skal stadig orientere sig og prioritere den faktiske trafik.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.22.1, pkt. 1-3"
      },
      {
        "title": "Mennesker og vej",
        "body": "Forløbet skal udvikle indsigt i egne styrker og svagheder, samarbejde med især sårbare trafikanter og forståelse af skiftende vejrisici. Refleksionen skal føre til en mere selvstændig, hensynsfuld og ansvarlig køremåde.",
        "sourceIds": [
          "plan-b-1-1"
        ],
        "sourceLocator": "Plan B 7.22.2-7.22.3"
      }
    ],
    "case": {
      "context": "GPS’en foreslår et sent baneskift, som tæt trafik gør usikkert under den afsluttende lektion.",
      "action": "Fortsæt sikkert og lad ruten blive beregnet om; drøft bagefter beslutningen med kørelæreren.",
      "why": "Navigation er et hjælpemiddel, mens selvstændig sikker vurdering er læringsmålet. En omvej er acceptabel; et presset baneskift skaber unødig risiko for trafikken omkring bilen.",
      "sourceIds": [
        "plan-b-1-1"
      ],
      "sourceLocator": "Plan B 7.22.1-7.22.3"
    },
    "recall": {
      "prompt": "Hvad gør den afsluttende kørsel til mere end en lang køretur?",
      "answer": "Fælles mål, kombination af tidligere færdigheder og efterfølgende refleksion over elevens konkrete valg."
    },
    "practicalNote": "Afsnit 7.22 er afsluttende fysisk øvelseskørsel med kørelærer; appen kan kun forberede og støtte refleksion."
  },
  "forloeb": {
    "sectionId": "forloeb",
    "chapterId": "koerekort",
    "lead": "Kategori B-forløbet er modulopbygget, så teori og praksis udvikles i en fast læringsmæssig rækkefølge.",
    "cards": [
      {
        "title": "Fem moduler",
        "body": "Den moderniserede uddannelse er opdelt i fem moduler, hvor teori og praksis hænger sammen. Teorien til en praktisk øvelse gennemgås før øvelsen, og eleven bevæger sig fra lettere til mere krævende situationer.",
        "sourceIds": [
          "plan-b-1-1",
          "modern-fstyr"
        ],
        "sourceLocator": "Plan B 0.3; Færdselsstyrelsen »Moderniseret køreuddannelse«"
      },
      {
        "title": "Minimumslektioner",
        "body": "For kategori B omfatter minimumsforløbet 30 teorilektioner og 24 praktiske lektioner af mindst 45 minutter. Tallene er minimum; kørelæreren skal tilrettelægge yderligere undervisning, hvis eleven ikke har nået de krævede mål.",
        "sourceIds": [
          "udd-731",
          "kort-bil-fstyr"
        ],
        "sourceLocator": "BEK 731 § 9, stk. 2; Plan B 1.1; Færdselsstyrelsen »Kørekort til bil«, afsnit »Find en køreskole«"
      },
      {
        "title": "Selvstudie er styret",
        "body": "Hjemmearbejde tæller ikke automatisk som lovpligtig undervisning. Kørelæreren kan planlægge og registrere højst syv selvstudielektioner i egnede dele af afsnit 1, 3, 6, 9 og 10, med de begrænsninger bekendtgørelsen angiver.",
        "sourceIds": [
          "udd-731"
        ],
        "sourceLocator": "BEK 731 § 25"
      }
    ],
    "case": {
      "context": "En elev har set mange appvideoer hjemme og vil springe de sidste registrerede lektioner over.",
      "action": "Følg kørelærerens modul- og lektionsplan og brug kun selvstudie, når det er planlagt og registreret efter reglerne.",
      "why": "Frivillig appbrug erstatter ikke lovpligtig undervisning. Kun selvstudie, som kørelæreren har planlagt, kontrolleret og registreret inden for de tilladte dele, kan tælle i forløbet.",
      "sourceIds": [
        "udd-731",
        "plan-b-1-1"
      ],
      "sourceLocator": "BEK 731 § 25; Plan B 0.3"
    },
    "recall": {
      "prompt": "Hvorfor er 30 teori- og 24 praktiklektioner ikke en automatisk færdigmelding?",
      "answer": "De er minimum; alle læringsmål skal stadig nås, og kørelæreren kan kræve mere undervisning."
    },
    "practicalNote": "De praktiske lektioner, manøvrebane og køreteknisk anlæg gennemføres fysisk og registreres i uddannelsesforløbet."
  },
  "teoriproeve": {
    "sectionId": "teoriproeve",
    "chapterId": "koerekort",
    "lead": "Den officielle teoriprøve tester anvendt regel- og risikoforståelse i 25 trafikale scenarier.",
    "cards": [
      {
        "title": "Formatet",
        "body": "Kategori B-prøven viser 25 forskellige scenarier med fire svarmuligheder til hvert. Der er mindst ét korrekt svar og kan være flere. Opgaven er derfor at vurdere hvert udsagn selvstændigt, ikke at finde ét samlet svar.",
        "sourceIds": [
          "prove-fstyr",
          "test-fstyr"
        ],
        "sourceLocator": "Færdselsstyrelsen »Køreprøve«, afsnit »Teoriprøven« og »Test dig selv«"
      },
      {
        "title": "Tid og fejlgrænse",
        "body": "Både digital og analog kategori B-prøve varer 25 minutter, og højst fem fejl giver bestået. Brug tiden på fuld vurdering af alle udsagn; et ubesvaret valg kan ikke forventes at blive vurderet som korrekt.",
        "sourceIds": [
          "prove-fstyr"
        ],
        "sourceLocator": "Færdselsstyrelsen »Køreprøve«, afsnit »Fælles for begge prøvetyper«"
      },
      {
        "title": "Prøven er én del",
        "body": "Køreprøven består af teori og en praktisk prøve. En bestået teoriprøve er gyldig i 18 måneder, men giver ikke i sig selv førerret. Uddannelsens praktiske mål og den praktiske prøve skal også gennemføres.",
        "sourceIds": [
          "prove-fstyr",
          "kort-bil-fstyr"
        ],
        "sourceLocator": "Færdselsstyrelsen »Køreprøve«, afsnit »Teoriprøven«; »Kørekort til bil«, afsnit »Din køreprøve består af to dele«"
      }
    ],
    "case": {
      "context": "Du er i tvivl om udsagn tre, men sikker på udsagn et og to i et scenarie med fire svarmuligheder.",
      "action": "Vurder også udsagn tre og fire ud fra situationen i stedet for at stoppe ved det første korrekte.",
      "why": "Der kan være flere korrekte svar i samme scenarie.",
      "sourceIds": [
        "prove-fstyr"
      ],
      "sourceLocator": "Færdselsstyrelsen »Køreprøve«, afsnit »Test dig selv«"
    },
    "recall": {
      "prompt": "Hvorfor kan du ikke behandle prøven som klassisk ét-svar-multiple-choice?",
      "answer": "Fordi hvert scenarie har fire udsagn, mindst ét er korrekt, og flere kan være korrekte."
    },
    "practicalNote": null
  },
  "digital-proeve": {
    "sectionId": "digital-proeve",
    "chapterId": "koerekort",
    "lead": "Den digitale prøve giver navigation og markering, men afholdes stadig fysisk på et prøvested.",
    "cards": [
      {
        "title": "Fysisk fremmøde",
        "body": "Den digitale teoriprøve foregår online på en prøvelokation og kræver fysisk fremmøde. Den er ikke en hjemmeprøve. MitID skal medbringes til den digitale teoriprøve sammen med den øvrige krævede dokumentation.",
        "sourceIds": [
          "prove-fstyr",
          "digital-fstyr"
        ],
        "sourceLocator": "Færdselsstyrelsen »Køreprøve«, afsnit »Teoriprøven« og »Dette skal du have med«"
      },
      {
        "title": "Navigation",
        "body": "I den digitale prøve kan kandidaten gå frem og tilbage, ændre valg og markere spørgsmål til senere. Brug markeringen til reel tvivl, men efterlad tid til at kontrollere, at alle fire udsagn er vurderet.",
        "sourceIds": [
          "prove-fstyr",
          "digital-fstyr"
        ],
        "sourceLocator": "Færdselsstyrelsen »Køreprøve«, afsnit »Digital teoriprøve«"
      },
      {
        "title": "Appens resultat er eget",
        "body": "NATKØRSEL bruger sin egen øvebedømmelse og egne scenarier. Den må forklare format og træne arbejdsgangen, men må ikke fremstille sin fejloptælling som myndighedens dokumenterede beregning eller et resultat som garanti for beståelse.",
        "sourceIds": [
          "prove-fstyr",
          "digital-fstyr"
        ],
        "sourceLocator": "Færdselsstyrelsen »Køreprøve«, afsnit »Digital teoriprøve« og »Fælles for begge prøvetyper«"
      }
    ],
    "case": {
      "context": "Du har markeret fire spørgsmål og har tre minutter tilbage efter sidste scenarie.",
      "action": "Gå tilbage til markeringerne og kontroller alle fire udsagn i hver, før du afslutter.",
      "why": "Den digitale navigation giver mulighed for revision, men ikke ekstra tid efter prøvens afslutning.",
      "sourceIds": [
        "prove-fstyr"
      ],
      "sourceLocator": "Færdselsstyrelsen »Køreprøve«, afsnit »Digital teoriprøve«"
    },
    "recall": {
      "prompt": "Hvilke to ting adskiller digital prøveadfærd fra en hjemmequiz?",
      "answer": "Prøven kræver fysisk fremmøde, og navigationen foregår inden for den officielle prøve og dens tidsramme."
    },
    "practicalNote": null
  },
  "sytten": {
    "sectionId": "sytten",
    "chapterId": "koerekort",
    "lead": "Et kørekort som 17-årig giver førerret med særlige tids-, ledsager- og landegrænser indtil 18 år.",
    "cards": [
      {
        "title": "Dag og nat",
        "body": "En 17-årig med kørekort må køre alene i Danmark mellem klokken 05.00 og 20.00. Fra 20.00 til 05.00 skal en ledsager være med, indtil føreren fylder 18 år. Ansvaret for reglen ligger hos føreren.",
        "sourceIds": [
          "17-fstyr",
          "kort-718"
        ],
        "sourceLocator": "Færdselsstyrelsen »Kørekort til bil som 17-årig«, afsnit »Når du har bestået køreprøven«"
      },
      {
        "title": "Ledsagerens krav",
        "body": "Ledsageren skal blandt andet være mindst 24 år, have haft gyldigt dansk eller færøsk kørekort i mindst fem år, ikke have været frakendt førerretten de seneste fem år og sidde foran med kørekortet tilgængeligt.",
        "sourceIds": [
          "17-fstyr",
          "kort-718"
        ],
        "sourceLocator": "Færdselsstyrelsen »Kørekort til bil som 17-årig«, afsnit »Din ledsager«"
      },
      {
        "title": "Kun Danmark",
        "body": "Indtil 18-årsdagen må den 17-årige kun køre i Danmark. Det gælder også i timer, hvor solokørsel er tilladt. Et dansk plastikkørekort eller en ledsager udvider ikke ordningen til kørsel i udlandet.",
        "sourceIds": [
          "17-fstyr",
          "kort-718"
        ],
        "sourceLocator": "Færdselsstyrelsen »Kørekort til bil som 17-årig«, afsnit »Når du har bestået køreprøven«"
      }
    ],
    "case": {
      "context": "En 17-årig vil køre alene hjem klokken 19.40, men turen forventes først afsluttet klokken 20.10.",
      "action": "Planlæg ledsager eller anden transport for hele perioden efter klokken 20.00.",
      "why": "Solokørsel er kun tilladt til klokken 20.00, ikke efter turens starttidspunkt. Hele den del af turen, der ligger efter grænsen, kræver en egnet ledsager.",
      "sourceIds": [
        "17-fstyr"
      ],
      "sourceLocator": "Færdselsstyrelsen »Kørekort til bil som 17-årig«, afsnit »Når du har bestået køreprøven«"
    },
    "recall": {
      "prompt": "Må en 17-årig køre alene i Sverige klokken 12?",
      "answer": "Nej. Indtil 18 år gælder ordningen kun i Danmark, selv i tidsrummet for solokørsel."
    },
    "practicalNote": null
  },
  "nybilist": {
    "sectionId": "nybilist",
    "chapterId": "koerekort",
    "lead": "De første tre år efter det første B-kørekort gælder en lav alkoholgrænse uanset førerens alder.",
    "cards": [
      {
        "title": "Treårsperioden",
        "body": "I de første tre år efter førstegangserhvervelse af kategori B er den juridiske grænse over 0,20 promille i blodet eller over 0,10 milligram alkohol pr. liter udåndingsluft. Perioden knytter sig til første B-kørekort, ikke fødselsalderen.",
        "sourceIds": [
          "fl-2026",
          "kort-bil-fstyr"
        ],
        "sourceLocator": "Færdselsloven § 53, stk. 2; Plan B 4.4.1, pkt. 5; Færdselsstyrelsen »Kørekort til bil«, afsnit »Husk: promillegrænsen er 0,2«"
      },
      {
        "title": "Praktisk råd: nul alkohol",
        "body": "Færdselsstyrelsen beskriver 0,2-grænsen som i praksis nul alkohol før kørsel. Individuel forbrænding og forsinket promillestigning gør egen beregning usikker. Den robuste handling er at lade være med at drikke, når du skal køre.",
        "sourceIds": [
          "kort-bil-fstyr",
          "plan-b-1-1"
        ],
        "sourceLocator": "Færdselsstyrelsen »Kørekort til bil«, afsnit »Husk: promillegrænsen er 0,2«; Plan B 4.4.1"
      },
      {
        "title": "Teori er ikke førerret",
        "body": "En bestået teoriprøve er gyldig i 18 måneder. Den giver ikke ret til at køre alene og er ikke et kørekort. Førerretten kræver, at hele processen, herunder praktisk prøve og øvrige betingelser, er opfyldt.",
        "sourceIds": [
          "prove-fstyr",
          "kort-bil-fstyr"
        ],
        "sourceLocator": "Færdselsstyrelsen »Køreprøve«, afsnit »Teoriprøven«; »Kørekort til bil«, afsnit »Din køreprøve består af to dele«"
      }
    ],
    "case": {
      "context": "En 32-årig fik sit første B-kørekort for ét år siden og mener, at 0,2-reglen kun gælder unge.",
      "action": "Kør uden alkohol og anvend den lave grænse i hele treårsperioden.",
      "why": "Reglen følger tiden siden første B-kørekort, ikke førerens alder. Færdselsstyrelsen formidler derfor den robuste praktiske regel som ingen alkohol, når en ny bilist skal køre.",
      "sourceIds": [
        "fl-2026",
        "kort-bil-fstyr"
      ],
      "sourceLocator": "Færdselsloven § 53, stk. 2; Plan B 4.4.1, pkt. 5; Færdselsstyrelsen »Kørekort til bil«"
    },
    "recall": {
      "prompt": "Hvornår begynder og slutter den lave promillegrænse?",
      "answer": "Den gælder fra første kategori B-kørekort og gennem de første tre år, uanset hvor gammel føreren er."
    },
    "practicalNote": null
  }
};
