// Originalt dansk læringsindhold. Genereret fra authoring/garage-*.json.
export const GARAGE = {
  "checked": "2026-10-12",
  "sourceId": "plan-b-1-1",
  "scope": "Kildebaseret læringsindhold for kapitel 1. Tekstlig repræsentation og fysisk øveforberedelse; ingen kompetencegodkendelse.",
  "topics": [
    {
      "id": "betjeningsudstyr",
      "title": "Find betjeningsudstyret i bilen",
      "pointRef": "1.1.1",
      "zone": "cockpit",
      "lead": "Du skal kunne finde og navngive udstyret i netop den bil, du øver i.",
      "objectives": [
        {
          "ref": "1.1.1.1",
          "requirement": "udpege",
          "summary": "Lokalisere kontakter til ratlås, tænding, elektrisk starter, visker og vasker, horn, lygter, klima, el-bagrude og spejlindstilling."
        },
        {
          "ref": "1.1.1.2",
          "requirement": "udpege",
          "summary": "Lokalisere speeder, bremse og en eventuel koblingspedal."
        },
        {
          "ref": "1.1.1.3",
          "requirement": "udpege",
          "summary": "Lokalisere gearvælger og gearplaceringer, parkeringsbremse og rat."
        },
        {
          "ref": "1.1.1.4",
          "requirement": "udpege",
          "summary": "Lokalisere sikkerhedsselens lås og de steder, hvor selen er fastgjort."
        },
        {
          "ref": "1.1.1.5",
          "requirement": "udpege",
          "summary": "Lokalisere betjeningsanordninger til fronthjelm, motorhjelm og låge til brændstof eller opladning."
        },
        {
          "ref": "1.1.1.6",
          "requirement": "udpege",
          "summary": "Lokalisere påfyldning til sprinklervæske og bilens eventuelle olie-, køle- og servostyringsvæsker."
        }
      ],
      "cards": [
        {
          "title": "Knapperne omkring dig",
          "body": "Ratlås, tænding, elektrisk starter, lys, horn, visker, vasker, ventilation, elbagrude og spejlindstilling sidder forskelligt i hver bil. Du skal også finde knapperne til fronthjelm, motorhjelm og lågen til brændstof eller opladning. Hjelmene kan være to klapper, eller det kan være én og samme klap i din bil.",
          "refs": [
            "1.1.1.1",
            "1.1.1.5"
          ]
        },
        {
          "title": "Pedaler, gear og parkering",
          "body": "Pedalerne ligger altid i samme rækkefølge. Koblingspedalen findes kun i nogle biler. Gearvælgeren kan sidde mellem sæderne, ved rattet eller på instrumentbordet. Parkeringsbremsen kan være et håndtag, en pedal eller en kontakt. Du skal kunne pege på rattet uden at tøve.",
          "refs": [
            "1.1.1.2",
            "1.1.1.3"
          ]
        },
        {
          "title": "Sele og væskepåfyldning",
          "body": "Selen er ikke kun spændet. Du skal også kunne vise, hvor den er fastgjort. Under motorhjelmen skal du kende dækslet til sprinklervæske og de andre beholdere, bilen har. Nogle elbiler har ingen motorolie og ingen hydraulisk servoolie. Din undervisningsbil bestemmer listen.",
          "refs": [
            "1.1.1.4",
            "1.1.1.6"
          ]
        }
      ],
      "practical": [
        {
          "title": "Udpeg kontakter og låger i bilen",
          "action": "Stå stille i undervisningsbilen sammen med kørelæreren. Peg på hver kontakt én for én: ratlås, tænding, elektrisk starter, visker, vasker, horn, lygter, klima, elbagrude og spejlindstilling. Peg også på knapperne til fronthjelm, motorhjelm og låge til brændstof eller opladning, hvis de findes i bilen.",
          "refs": [
            "1.1.1.1",
            "1.1.1.5"
          ]
        },
        {
          "title": "Udpeg betjeningen ved førersædet",
          "action": "Vis med kørelæreren pedalerne, gearpositionerne, parkeringsbremsen, rattet, selelåsen og selens fastgørelsespunkter. Kørelæreren forklarer bilens særlige løsning, før du rører noget, der kan sætte bilen i bevægelse.",
          "refs": [
            "1.1.1.2",
            "1.1.1.3",
            "1.1.1.4"
          ]
        },
        {
          "title": "Udpeg væskedæksler",
          "action": "Med motoren slukket og efter kørelærerens anvisning peger du på sprinklervæske og de olie- eller væskepåfyldninger, der findes i undervisningsbilen. Åbn aldrig en varm eller tryksat beholder.",
          "refs": [
            "1.1.1.6"
          ]
        }
      ],
      "case": {
        "context": "I din undervisningsbil sidder gearvælgeren ved rattet, og parkeringsbremsen er en kontakt på midterkonsollen. Hvilken gruppe skal du kunne udpege under planpunkt 1.1.1.3?",
        "options": [
          {
            "id": "a",
            "text": "Gearvælgeren med gearpositionerne, parkeringsbremsen og rattet.",
            "correct": true,
            "why": "Punkt 1.1.1.3 dækker gearvælgeren, gearpositionerne, parkeringsbremsen og rattet.",
            "refs": [
              "1.1.1.3"
            ]
          },
          {
            "id": "b",
            "text": "Gearvælgeren med gearpositionerne, tændingskontakten og rattet.",
            "correct": false,
            "why": "Tændingskontakten skal du også kunne finde, men den hører til 1.1.1.1. Punkt 1.1.1.3 handler om parkeringsbremsen.",
            "refs": [
              "1.1.1.1",
              "1.1.1.3"
            ]
          },
          {
            "id": "c",
            "text": "Gearvælgeren, parkeringsbremsen og selens fastgørelsespunkter.",
            "correct": false,
            "why": "Selens fastgørelsespunkter hører til 1.1.1.4. Punkt 1.1.1.3 kræver gearpositionerne og rattet.",
            "refs": [
              "1.1.1.3",
              "1.1.1.4"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvordan viser du, at du kan finde betjeningen i din undervisningsbil?",
        "answer": "Du finder og peger på de krævede dele i bilen sammen med kørelæreren.",
        "refs": [
          "1.1.1.1",
          "1.1.1.2",
          "1.1.1.3",
          "1.1.1.4",
          "1.1.1.5",
          "1.1.1.6"
        ]
      }
    },
    {
      "id": "instrumenter-og-kontrollys",
      "title": "Læs målere og advarsler",
      "pointRef": "1.1.2",
      "zone": "cockpit",
      "lead": "Målere, lamper, beskeder og lyde skal forstås i din egen undervisningsbil.",
      "objectives": [
        {
          "ref": "1.1.2.1",
          "requirement": "aflæse og forstå",
          "summary": "Aflæse speedometer og eventuelle målere for omdrejninger og temperatur."
        },
        {
          "ref": "1.1.2.2",
          "requirement": "aflæse og forstå",
          "summary": "Forstå kontrollys for strøm, døre, lygter, blink, parkeringsbremse, ABS, ESC, motor, airbag, bremser og eventuelt olietryk."
        },
        {
          "ref": "1.1.2.3",
          "requirement": "aflæse og forstå",
          "summary": "Forstå øvrige relevante displayoplysninger og lydalarmer og vide, hvornår de kræver reaktion."
        }
      ],
      "cards": [
        {
          "title": "Målerne fortæller om bilen",
          "body": "Speedometeret viser farten. Bilen kan også have en omdrejningstæller og en temperaturmåler. Du skal kunne finde og aflæse de målere, som din undervisnings- og prøvebil har. Placering og udseende kan variere fra bil til bil.",
          "refs": [
            "1.1.2.1"
          ]
        },
        {
          "title": "Kontrollys er ikke pynt",
          "body": "Nogle kontrollys viser åbne døre, bilens elektriske system, lygter, blinklys og parkeringsbremsen. Andre viser ABS, ESC, motor, airbag, bremser og eventuelt olietryk. Du skal lære hvert relevante symbol at kende, og hvilken reaktion det kræver.",
          "refs": [
            "1.1.2.2"
          ]
        },
        {
          "title": "Beskeder og lyd kræver din vurdering",
          "body": "En besked eller alarmlyd kan handle om kørsel, miljø eller sikkerhed. Læs hele beskeden, find symbolet og reager efter bilens anvisning og kørelærerens instruktion. Et højt bip er ikke automatisk farligere end et stille symbol. Det er betydningen, du skal forstå.",
          "refs": [
            "1.1.2.3"
          ]
        }
      ],
      "practical": [
        {
          "title": "Aflæs målere og lamper i bilen",
          "action": "Stå stille i undervisningsbilen sammen med kørelæreren. Gennemgå speedometeret, eventuelle andre målere, kontrollys, beskeder og lydalarmer. Forklar, hvad hver enkelt betyder, og hvad du skal gøre.",
          "refs": [
            "1.1.2.1",
            "1.1.2.2",
            "1.1.2.3"
          ]
        }
      ],
      "case": {
        "context": "Kørelæreren beder dig skelne kontrollys fra punkt 1.1.2.2 fra målere i 1.1.2.1 og beskeder i 1.1.2.3. Hvilken gruppe består kun af kontrollys fra 1.1.2.2?",
        "options": [
          {
            "id": "a",
            "text": "Kontrollys for ABS, ESC og airbag.",
            "correct": true,
            "why": "ABS, ESC og airbag er alle nævnt i punkt 1.1.2.2.",
            "refs": [
              "1.1.2.2"
            ]
          },
          {
            "id": "b",
            "text": "Speedometer, temperaturmåler og motorlampen.",
            "correct": false,
            "why": "Motorlampen hører til 1.1.2.2. Speedometer og temperaturmåler er målere under 1.1.2.1.",
            "refs": [
              "1.1.2.1",
              "1.1.2.2"
            ]
          },
          {
            "id": "c",
            "text": "Omdrejningstælleren, dørlukningen og en relevant lydalarm.",
            "correct": false,
            "why": "Dørlukningen hører til 1.1.2.2. Omdrejningstælleren hører til 1.1.2.1, og lydalarmer hører til 1.1.2.3.",
            "refs": [
              "1.1.2.1",
              "1.1.2.2",
              "1.1.2.3"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvad er forskellen på at se et kontrollys og at forstå det?",
        "answer": "Du skal kunne knytte symbolet til dets betydning og vide, hvilken reaktion bilen kræver.",
        "refs": [
          "1.1.2.2",
          "1.1.2.3"
        ]
      }
    },
    {
      "id": "motor-taending-og-speeder",
      "title": "Fra energi til bevægelse",
      "pointRef": "1.1.3",
      "zone": "powertrain",
      "lead": "Lær den enkle kraftvej i en forbrændingsbil, en elbil og en hybrid. Du skal ikke være mekaniker.",
      "objectives": [
        {
          "ref": "1.1.3.1",
          "requirement": "viden",
          "summary": "Vide, at antændt luft og brændstof sætter stemplerne i bevægelse i en forbrændingsmotor."
        },
        {
          "ref": "1.1.3.2",
          "requirement": "viden",
          "summary": "Forstå, at stempelbevægelsen bliver til rotation, som føres gennem kobling og gear til hjulene."
        },
        {
          "ref": "1.1.3.3",
          "requirement": "viden",
          "summary": "Vide, at speederen regulerer forbrændingsmotorens omdrejninger."
        },
        {
          "ref": "1.1.3.4",
          "requirement": "viden",
          "summary": "Vide, at batteriet leverer strøm til startmotoren, når en forbrændingsmotor startes."
        },
        {
          "ref": "1.1.3.5",
          "requirement": "viden",
          "summary": "Vide, at nøgle eller startknap skal slippes straks efter motorstart for at skåne startmotoren."
        },
        {
          "ref": "1.1.3.6",
          "requirement": "viden",
          "summary": "Skelne mellem elbilens elmotor og hybridens kombination af el- og forbrændingsmotor."
        },
        {
          "ref": "1.1.3.7",
          "requirement": "viden",
          "summary": "Vide, at elbilens motor får sin energi fra batteriet."
        }
      ],
      "cards": [
        {
          "title": "Kraftvejen i en forbrændingsmotor",
          "body": "I en forbrændingsmotor antændes luft og brændstof. Det får stemplerne til at bevæge sig. Bevægelsen bliver til rotation i krumtappen, og rotationen føres videre gennem koblingen og gearet til hjulene. Speederen styrer motorens omdrejninger. Den styrer ikke direkte hjulenes fart.",
          "refs": [
            "1.1.3.1",
            "1.1.3.2",
            "1.1.3.3"
          ]
        },
        {
          "title": "Startmotoren får strøm fra batteriet",
          "body": "En forbrændingsmotor starter med hjælp fra en elektrisk startmotor. Den får strøm fra batteriet. Når motoren er i gang, skal du slippe nøglen eller startknappen med det samme. Ellers kører startmotoren for længe, og den kan tage skade.",
          "refs": [
            "1.1.3.4",
            "1.1.3.5"
          ]
        },
        {
          "title": "Elbil og hybrid er ikke det samme",
          "body": "En elbil kører på en elmotor, der får strøm fra batteriet. I en hybrid kan elmotoren arbejde sammen med en forbrændingsmotor. Du skal kunne skelne mellem ren elektrisk kørsel og en drivlinje med to motortyper.",
          "refs": [
            "1.1.3.6",
            "1.1.3.7"
          ]
        }
      ],
      "practical": [
        {
          "title": "Følg kraftvejen i tre biltyper",
          "action": "Peg på energikilden, og forklar med ord, hvordan kraften når hjulene. Gør det for en forbrændingsbil, en elbil og en hybrid. Start med biltypen, så du ikke overfører startmotor og kobling til alle biler.",
          "refs": [
            "1.1.3.1",
            "1.1.3.2",
            "1.1.3.4",
            "1.1.3.6",
            "1.1.3.7"
          ]
        }
      ],
      "case": {
        "context": "Både en forbrændingsbil og en elbil har et batteri, men batteriet har ikke samme rolle. Hvilken forklaring stemmer med Plan B?",
        "options": [
          {
            "id": "a",
            "text": "I forbrændingsbilen forsyner batteriet startmotoren. I elbilen forsyner det motoren, der driver bilen.",
            "correct": true,
            "why": "Planen beskriver batteristrøm til startmotoren i en forbrændingsbil og til elmotoren, der driver en elbil.",
            "refs": [
              "1.1.3.4",
              "1.1.3.6",
              "1.1.3.7"
            ]
          },
          {
            "id": "b",
            "text": "I forbrændingsbilen driver batteriet hjulene gennem gearet. I elbilen bruges batteriet kun, når motoren startes.",
            "correct": false,
            "why": "I en forbrændingsbil føres bevægelsen gennem koblingen og gearet. I en elbil leverer batteriet strøm til elmotoren under kørsel.",
            "refs": [
              "1.1.3.2",
              "1.1.3.4",
              "1.1.3.7"
            ]
          },
          {
            "id": "c",
            "text": "I forbrændingsbilen antænder batteriet brændstoffet. I elbilen drejer batteriet en startmotor, når bilen sættes i gang.",
            "correct": false,
            "why": "Planen knytter batteriet i forbrændingsbilen til startmotoren og batteriet i elbilen til den motor, der driver bilen.",
            "refs": [
              "1.1.3.1",
              "1.1.3.4",
              "1.1.3.6",
              "1.1.3.7"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvad sker der mellem stemplerne og hjulene i en forbrændingsbil?",
        "answer": "Stemplernes bevægelse bliver til rotation i krumtappen. Den føres videre gennem koblingen og gearet til hjulene.",
        "refs": [
          "1.1.3.2"
        ]
      }
    },
    {
      "id": "kobling",
      "title": "Koblingen forbinder og frigør",
      "pointRef": "1.1.4",
      "zone": "powertrain",
      "lead": "Koblingen styrer forbindelsen mellem motor og gearkasse i biler med koblingspedal.",
      "objectives": [
        {
          "ref": "1.1.4.1",
          "requirement": "viden",
          "summary": "Forstå, at koblingen kan forbinde og afbryde kraftvejen mellem motor og gearkasse."
        },
        {
          "ref": "1.1.4.2",
          "requirement": "viden",
          "summary": "Kende princippet, hvor en koblingsplade presses mod en roterende del og fører bevægelsen videre."
        },
        {
          "ref": "1.1.4.3",
          "requirement": "viden",
          "summary": "Vide, at forbindelsen til gearkassen afbrydes, når koblingspedalen trædes helt ned."
        },
        {
          "ref": "1.1.4.4",
          "requirement": "viden",
          "summary": "Vide, hvorfor koblingen kan trædes helt i bund ved motorstart og skal trædes helt i bund ved gearskift."
        },
        {
          "ref": "1.1.4.5",
          "requirement": "viden",
          "summary": "Forstå, at langsom opløftning af koblingspedalen giver en blød overførsel af motorkraften."
        },
        {
          "ref": "1.1.4.6",
          "requirement": "viden",
          "summary": "Vide, at væskeniveauet skal være tilstrækkeligt, hvis bilens kobling bruger hydraulik."
        },
        {
          "ref": "1.1.4.7",
          "requirement": "viden",
          "summary": "Vide, at biler med automatgear og elbiler ikke har en koblingspedal."
        }
      ],
      "cards": [
        {
          "title": "Koblingen kan åbne forbindelsen",
          "body": "Koblingen forbinder motor og gearkasse eller skiller dem ad. Grundideen er, at en plade presses mod en roterende del ved krumtappen. Så føres bevægelsen videre til gearkassen. Træder du koblingspedalen helt ned, bliver forbindelsen afbrudt.",
          "refs": [
            "1.1.4.1",
            "1.1.4.2",
            "1.1.4.3"
          ]
        },
        {
          "title": "Pedalen skåner og blødgør",
          "body": "I en bil med koblingspedal kan du træde pedalen helt i bund ved motorstart, så startmotoren skånes. Ved gearskift skal pedalen også helt i bund, så gearkassen ikke bliver beskadiget. Løfter du pedalen langsomt, føres kraften blødt videre til hjulene.",
          "refs": [
            "1.1.4.4",
            "1.1.4.5"
          ]
        },
        {
          "title": "Hydraulik og biltype",
          "body": "Nogle manuelle koblinger bruger hydraulik. Så skal væskeniveauet være tilstrækkeligt. Biler med automatgear og elbiler har ingen koblingspedal. Det betyder ikke, at alle gear er ens. Det betyder kun, at du ikke betjener en koblingspedal.",
          "refs": [
            "1.1.4.6",
            "1.1.4.7"
          ]
        }
      ],
      "practical": [
        {
          "title": "Forklar tre koblingsstillinger",
          "action": "Beskriv med ord, hvad der sker mellem motor og gearkasse, når pedalen er oppe, helt nede og løftes langsomt. Afslut med at forklare, hvorfor øvelsen ikke passer til en elbil eller en bil uden koblingspedal.",
          "refs": [
            "1.1.4.1",
            "1.1.4.3",
            "1.1.4.5",
            "1.1.4.7"
          ]
        }
      ],
      "case": {
        "context": "I en bil med koblingspedal skal du forklare, hvad der sker ved et gearskift. Hvilken rækkefølge følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Pedalen trædes i bund, forbindelsen afbrydes, gearet skiftes, og pedalen løftes langsomt, så kraften føres blødt videre.",
            "correct": true,
            "why": "Pedalen i bund afbryder forbindelsen til gearkassen. Løftes den langsomt, føres bevægelsen blødt videre efter skiftet.",
            "refs": [
              "1.1.4.3",
              "1.1.4.4",
              "1.1.4.5"
            ]
          },
          {
            "id": "b",
            "text": "Pedalen trædes halvt ned, forbindelsen bevares delvist, gearet skiftes, og pedalen løftes hurtigt, så kraften føres blødt videre.",
            "correct": false,
            "why": "Planen kræver pedalen helt i bund ved gearskift og langsom opløftning. Halv nedtrædning og hurtig opløftning passer ikke.",
            "refs": [
              "1.1.4.3",
              "1.1.4.4",
              "1.1.4.5"
            ]
          },
          {
            "id": "c",
            "text": "Pedalen trædes i bund, forbindelsen forstærkes, gearet skiftes, og pedalen holdes nede, så kraften føres blødt videre.",
            "correct": false,
            "why": "Nedtrædning afbryder forbindelsen og forstærker den ikke. Bevægelsen føres blødt videre først, når pedalen løftes langsomt.",
            "refs": [
              "1.1.4.1",
              "1.1.4.3",
              "1.1.4.5"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvorfor løfter du koblingspedalen langsomt efter et gearskift?",
        "answer": "Så motorens rotation føres blødt videre gennem gearkassen til hjulene.",
        "refs": [
          "1.1.4.5"
        ]
      }
    },
    {
      "id": "gear",
      "title": "Vælg gear til kraft, fart og bakning",
      "pointRef": "1.1.5",
      "zone": "powertrain",
      "lead": "Gearkassen tilpasser motorens rotation til den kraft og bevægelse, bilen har brug for.",
      "objectives": [
        {
          "ref": "1.1.5.1",
          "requirement": "viden",
          "summary": "Forstå, at gearkassen tilpasser overførsel og rotationshastighed fra motor til hjul."
        },
        {
          "ref": "1.1.5.2",
          "requirement": "viden",
          "summary": "Kende princippet med tandhjul i forskellige størrelser og forskellen på manuelt og automatisk gearskift."
        },
        {
          "ref": "1.1.5.3",
          "requirement": "viden",
          "summary": "Vide, at lave gear bruges ved behov for stor trækkraft eller lav hastighed."
        },
        {
          "ref": "1.1.5.4",
          "requirement": "viden",
          "summary": "Vide, at høje gear bruges ved højere fart for at skåne motoren og begrænse brændstofforbrug."
        },
        {
          "ref": "1.1.5.5",
          "requirement": "viden",
          "summary": "Vide, at bakgear er nødvendigt for at få bilen til at køre baglæns."
        }
      ],
      "cards": [
        {
          "title": "Gearkassen tilpasser rotationen",
          "body": "Gearkassen ændrer, hvordan motorens rotation føres til hjulene. I den enkle forklaring griber tandhjul i forskellig størrelse ind i hinanden. I en manuel bil vælger du gearet selv. I en automatisk bil vælger gearkassen det for dig.",
          "refs": [
            "1.1.5.1",
            "1.1.5.2"
          ]
        },
        {
          "title": "Lave gear giver trækkraft",
          "body": "Lave gear passer til igangsætning, acceleration, langsom kørsel og stejle bakker, hvor bilen har brug for stor trækkraft. Det gælder både op og ned ad bakke. Valget handler ikke kun om lav fart. Det handler om den kraft og kontrol, situationen kræver.",
          "refs": [
            "1.1.5.3"
          ]
        },
        {
          "title": "Høje gear og bakgear",
          "body": "Højere gear bruges ved højere fart. I en forbrændingsbil kan det skåne motoren og spare brændstof. Bakgearet kører bilen baglæns. Automatgear viser valgene på en anden måde, men du skal stadig kunne se forskellen på frem og bak.",
          "refs": [
            "1.1.5.4",
            "1.1.5.5"
          ]
        }
      ],
      "practical": [
        {
          "title": "Vælg gear til situationen",
          "action": "Sorter fem tænkte situationer efter, om de kræver lavt gear, højt gear eller bakgear. Situationerne er: igangsætning, stejl nedkørsel, rolig kørsel ved højere fart, langsom fremdrift og baglæns placering. Forklar valget ud fra trækkraft og kørselsretning.",
          "refs": [
            "1.1.5.3",
            "1.1.5.4",
            "1.1.5.5"
          ]
        }
      ],
      "case": {
        "context": "Du skal koble hver geartype til den anvendelse, Plan B beskriver. Hvilken kombination er korrekt?",
        "options": [
          {
            "id": "a",
            "text": "Lavt gear ved igangsætning og på stejle bakker, højt gear ved høj fart og bakgear for at køre baglæns.",
            "correct": true,
            "why": "Lave gear giver trækkraft, høje gear bruges ved høj fart, og bakgearet gør det muligt at køre baglæns.",
            "refs": [
              "1.1.5.3",
              "1.1.5.4",
              "1.1.5.5"
            ]
          },
          {
            "id": "b",
            "text": "Lavt gear ved igangsætning, højt gear på stejle bakker og bakgear for at køre baglæns.",
            "correct": false,
            "why": "Igangsætning og bakgear er rigtige. Men stejle bakker hører til lave gear, ikke høje.",
            "refs": [
              "1.1.5.3",
              "1.1.5.4",
              "1.1.5.5"
            ]
          },
          {
            "id": "c",
            "text": "Lavt gear på stejle bakker, højt gear ved lav hastighed og bakgear for at køre baglæns.",
            "correct": false,
            "why": "Stejle bakker og bakgear er rigtige. Men planen knytter høje gear til høj hastighed, ikke lav.",
            "refs": [
              "1.1.5.3",
              "1.1.5.4",
              "1.1.5.5"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvornår vælger du et lavere gear?",
        "answer": "Når bilen skal have stor trækkraft eller køre langsomt. For eksempel ved igangsætning, acceleration eller på en stejl bakke.",
        "refs": [
          "1.1.5.3"
        ]
      }
    },
    {
      "id": "foererassistentsystemer",
      "title": "Assistenter hjælper dig, men ansvaret er dit",
      "pointRef": "1.1.6",
      "zone": "cockpit",
      "lead": "Lær, hvad systemerne kan hjælpe med, hvordan de ser og mærker, og hvor deres grænser går.",
      "objectives": [
        {
          "ref": "1.1.6.1",
          "requirement": "viden",
          "summary": "Vide, at planen beskriver alle nyere biler som udstyret med systemer, der vejleder eller griber ind i faresituationer."
        },
        {
          "ref": "1.1.6.2",
          "requirement": "viden",
          "summary": "Vide, at planen beskriver kamera-, sensor- og radarteknik som fælles grundlag for overvågning og mulige indgreb via bremser eller styring."
        },
        {
          "ref": "1.1.6.3a",
          "requirement": "viden",
          "summary": "Kende adaptiv fartpilots mulighed for at tilpasse afstand og hastighed til et forankørende køretøj."
        },
        {
          "ref": "1.1.6.3b",
          "requirement": "viden",
          "summary": "Kende blindvinkelassistentens advarsler og mulige indgreb, når andre trafikanter registreres i blinde vinkler."
        },
        {
          "ref": "1.1.6.3c",
          "requirement": "viden",
          "summary": "Kende vognbaneassistentens advarsler og mulige indgreb ved utilsigtet afvigelse fra en markeret vognbane."
        },
        {
          "ref": "1.1.6.3d",
          "requirement": "viden",
          "summary": "Kende parkeringssensorers afstandsadvarsler og parkeringsassistenters mulighed for at udføre visse manøvrer automatisk."
        },
        {
          "ref": "1.1.6.3e",
          "requirement": "viden",
          "summary": "Kende frontalkollisions- og nødbremseassistentens varsler og mulighed for automatisk nødbremsning."
        },
        {
          "ref": "1.1.6.3f",
          "requirement": "viden",
          "summary": "Kende træthedsregistreringens mulige lyd-, lys- eller vibrationsadvarsel ved registreret træthed."
        },
        {
          "ref": "1.1.6.3g",
          "requirement": "viden",
          "summary": "Kende færdselstavleassistentens visning af tavler og dens mulige samspil med adaptiv fartpilot, som kan ændre hastigheden efter tavler."
        },
        {
          "ref": "1.1.6.3h",
          "requirement": "viden",
          "summary": "Kende lysassistentens mulighed for at aktivere og tilpasse nær- eller fjernlys efter forholdene."
        },
        {
          "ref": "1.1.6.4",
          "requirement": "viden",
          "summary": "Forstå, at assistenter kan fejle eller vise forkert, og at føreren fortsat har ansvaret."
        },
        {
          "ref": "1.1.6.5",
          "requirement": "viden",
          "summary": "Vide, at førerassistenter kan øge risikoen for uopmærksomhed."
        },
        {
          "ref": "1.1.6.6",
          "requirement": "aflæse og forstå",
          "summary": "Aflæse og forstå alle førerassistenter i den bil, der bruges til undervisning og praktisk prøve."
        }
      ],
      "cards": [
        {
          "title": "Bilen sanser med teknik",
          "body": "Planen siger, at alle nyere biler er udstyret med førerassistenter. De kan vejlede føreren eller gribe ind i farlige situationer. Kameraer, sensorer og radarer er fælles teknologier bag overvågningen. Hvert system bruger ikke alle tre. Indgreb sker via bremser eller styring.",
          "refs": [
            "1.1.6.1",
            "1.1.6.2"
          ]
        },
        {
          "title": "Afstand, blind vinkel og vognbane",
          "body": "Adaptiv fartpilot kan tilpasse afstand og hastighed til bilen foran. Blindvinkelassistenten kan advare om trafikanter ved siden af bilen. Vognbaneassistenten kan reagere, hvis bilen forlader en markeret vognbane. Advarslerne kan være lys, lyd eller vibration. Nogle systemer kan også gribe ind.",
          "refs": [
            "1.1.6.3a",
            "1.1.6.3b",
            "1.1.6.3c"
          ]
        },
        {
          "title": "Parkering og nødbremsning",
          "body": "Parkeringssensorer måler afstanden og advarer med lyd eller lys. Nogle biler har en parkeringsassistent, der kan styre visse parkeringsbevægelser. Frontalkollisionsassistenten og nødbremseassistenten advarer om sammenstødsrisiko. I en faresituation kan de bremse automatisk. Det gælder også ved visse parkerings- og bakkemanøvrer.",
          "refs": [
            "1.1.6.3d",
            "1.1.6.3e"
          ]
        },
        {
          "title": "Træthed, skilte og lys",
          "body": "Træthedsregistrering kan advare med lyd, lys eller vibration. Skiltegenkendelsen viser genkendte skilte. Sammen med adaptiv fartpilot kan den ændre farten efter skiltene. Lysassistenten kan skifte mellem nærlys og fjernlys. Systemer kan vise forkert. Du skal derfor fortsat observere og bevare ansvaret.",
          "refs": [
            "1.1.6.3f",
            "1.1.6.3g",
            "1.1.6.3h",
            "1.1.6.4"
          ]
        },
        {
          "title": "Du har stadig det fulde ansvar",
          "body": "Et system kan overse noget, misforstå omgivelserne eller vise noget forkert. Føreren har stadig ansvaret for kørslen, og føreren kan ikke give assistenten skylden for en forseelse eller et uheld. Det er let at blive uopmærksom, når bilen hjælper. Derfor skal du overvåge aktivt hele tiden.",
          "refs": [
            "1.1.6.4",
            "1.1.6.5"
          ]
        },
        {
          "title": "Lær den bil, du skal køre i",
          "body": "Navne, symboler, lyde, indstillinger og indgreb er forskellige fra bil til bil. Du skal kunne aflæse og forstå alle førerassistenter i din undervisnings- og prøvebil. Gennemgå status og de nødvendige reaktioner med kørelæreren i den bil.",
          "refs": [
            "1.1.6.6"
          ]
        }
      ],
      "practical": [
        {
          "title": "Gennemgå assistenterne i bilen",
          "action": "Stå stille i undervisningsbilen. Kørelæreren åbner bilens relevante visninger og gennemgår hvert førerassistentsystem, bilen har. Du aflæser symboler og status, forklarer advarslerne og beskriver, hvordan du skal reagere.",
          "refs": [
            "1.1.6.6"
          ]
        },
        {
          "title": "Find systemerne uden at køre",
          "action": "Med kørelæreren matcher du bilens egne symboler og indstillinger med de systemer, bilen faktisk har. Tal også om systemer, bilen ikke har, så du ikke forveksler fravær med fejl. Øvelsen laves uden at skabe farlige situationer.",
          "refs": [
            "1.1.6.3a",
            "1.1.6.3b",
            "1.1.6.3c",
            "1.1.6.3d",
            "1.1.6.3e",
            "1.1.6.3f",
            "1.1.6.3g",
            "1.1.6.3h",
            "1.1.6.6"
          ]
        }
      ],
      "case": {
        "context": "Skiltegenkendelsen viser en anden hastighed end det skilt, du lige har set. Hvilket udsagn om systemet og ansvaret følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Systemet kan vise forkert. Føreren vurderer skiltet og beholder ansvaret, også hvis farten ændres automatisk.",
            "correct": true,
            "why": "Skiltegenkendelsen kan koble sammen med adaptiv fartpilot. Fejlen kan stadig ske, og føreren bliver ikke fritaget for ansvar.",
            "refs": [
              "1.1.6.3g",
              "1.1.6.4"
            ]
          },
          {
            "id": "b",
            "text": "Systemet kan vise forkert. Føreren sænker farten, men fartpiloten overtager ansvaret for at fortolke skiltet.",
            "correct": false,
            "why": "At sænke farten kan være forsigtigt. Men ingen førerassistent overtager førerens ansvar for kørslen eller for at tolke skiltet.",
            "refs": [
              "1.1.6.3g",
              "1.1.6.4"
            ]
          },
          {
            "id": "c",
            "text": "Systemet kan vise forkert. Føreren slår funktionen fra, og så får det viste skilt forrang.",
            "correct": false,
            "why": "At slå funktionen fra kan være forsigtigt. Men skærmens oplysning får ikke forrang, og førerens ansvar består.",
            "refs": [
              "1.1.6.4"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Ændrer en aktiv førerassistent noget ved førerens ansvar?",
        "answer": "Ingenting. Føreren skal stadig observere, vurdere og handle, og ansvaret kan ikke overlades til systemet.",
        "refs": [
          "1.1.6.4",
          "1.1.6.5"
        ]
      }
    },
    {
      "id": "ansvar-for-bilens-stand",
      "title": "Hvem har ansvaret for bilens stand",
      "pointRef": "1.2.1",
      "zone": "documents",
      "lead": "Lovlighed og sikkerhed er to ansvar, der hænger sammen. Begge skal være afklaret før og under kørslen.",
      "objectives": [
        {
          "ref": "1.2.1.1",
          "requirement": "angive",
          "summary": "Skeln mellem ejerens ansvar for lovlig stand og førerens ansvar for sikker stand."
        },
        {
          "ref": "1.2.1.2",
          "requirement": "angive",
          "summary": "Føreren skal løbende holde øje med styring, bremser, lys og horn."
        },
        {
          "ref": "1.2.1.3",
          "requirement": "angive",
          "summary": "Føreren skal sikre en forsvarlig tilkobling af påhængskøretøj."
        },
        {
          "ref": "1.2.1.4",
          "requirement": "angive",
          "summary": "Føreren skal følge køretøjets støj og forureningsrelevante stand."
        }
      ],
      "cards": [
        {
          "title": "To slags ansvar",
          "body": "Ejeren eller den registrerede bruger har ansvaret for, at bilen er lovlig. Føreren har ansvaret for, at den er sikkerhedsmæssigt forsvarlig. Låner du en bil, flytter det ikke din pligt til at reagere på fejl, der kan gøre turen farlig.",
          "refs": [
            "1.2.1.1"
          ]
        },
        {
          "title": "Vær opmærksom hele turen",
          "body": "Dit ansvar stopper ikke, når bilen er startet. Styring, bremser, lygter og horn skal fungere sikkert og efter reglerne. En trailer skal være forsvarligt koblet på. Nye lyde, lamper eller en ændret opførsel undervejs kræver, at du vurderer det.",
          "refs": [
            "1.2.1.2",
            "1.2.1.3"
          ]
        },
        {
          "title": "Støj og udstødning tæller også",
          "body": "Du skal være opmærksom på unødig støj og på fejl ved motoren eller udstyr, der begrænser udledningen. Usædvanlig røg eller lyd er mere end bilens humør. Det kan være tegn på en ulovlig eller uforsvarlig stand.",
          "refs": [
            "1.2.1.4"
          ]
        }
      ],
      "practical": [
        {
          "title": "Ansvarsrunden",
          "action": "Gå rundt om bilen sammen med kørelæreren. Peg på de områder, føreren skal følge, og forklar, hvem der har ansvaret for hvad. Kørelæreren stiller spørgsmål om ejerens, brugerens og førerens ansvar i den bil.",
          "refs": [
            "1.2.1.1",
            "1.2.1.2",
            "1.2.1.3",
            "1.2.1.4"
          ]
        }
      ],
      "case": {
        "context": "Du låner en lovligt registreret bil med et påhængskøretøj. Hvilken ansvarsfordeling gengiver Plan B præcist?",
        "options": [
          {
            "id": "a",
            "text": "Ejeren eller brugeren svarer for, at bilen er lovlig. Føreren svarer for, at den er sikker, og for en forsvarlig trailerkobling.",
            "correct": true,
            "why": "Planen deler ansvaret præcis sådan. Føreren skal særskilt sikre en forsvarlig tilkobling, når der køres med påhængskøretøj.",
            "refs": [
              "1.2.1.1",
              "1.2.1.2",
              "1.2.1.3"
            ]
          },
          {
            "id": "b",
            "text": "Føreren svarer for både lovlig og sikker stand. Ejeren svarer kun for registreringsoplysningerne.",
            "correct": false,
            "why": "Planen lægger den lovlige stand hos ejeren eller brugeren. Føreren har ansvaret for, at bilen er sikker.",
            "refs": [
              "1.2.1.1",
              "1.2.1.2"
            ]
          },
          {
            "id": "c",
            "text": "Ejeren svarer for begge dele, indtil føreren under kørslen opdager en konkret fejl.",
            "correct": false,
            "why": "Førerens ansvar gælder ikke først, når en fejl opdages. Føreren skal hele tiden være opmærksom på bilens sikkerhed.",
            "refs": [
              "1.2.1.1",
              "1.2.1.2"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvem har ansvaret, hvis en lovlig bil får en sikkerhedsfejl undervejs?",
        "answer": "Føreren skal opdage og reagere, hvis bilen ikke længere er sikkerhedsmæssigt forsvarlig. Ejeren har stadig ansvaret for, at bilen er lovlig.",
        "refs": [
          "1.2.1.1",
          "1.2.1.2"
        ]
      }
    },
    {
      "id": "styreapparat",
      "title": "Styreapparatet",
      "pointRef": "1.2.2",
      "zone": "cockpit",
      "lead": "Styringen skal følge rattet præcist, uden unødig modstand, slør eller mislyde.",
      "objectives": [
        {
          "ref": "1.2.2.1",
          "requirement": "viden",
          "summary": "Rattets bevægelse overføres gennem forbindelser og led til forhjulene."
        },
        {
          "ref": "1.2.2.2",
          "requirement": "viden",
          "summary": "Styringen er normalt selvoprettende mod ligeudstilling under kørsel."
        },
        {
          "ref": "1.2.2.3",
          "requirement": "viden",
          "summary": "Servo letter styringen; svigt kan gøre fortsat kørsel uforsvarlig."
        },
        {
          "ref": "1.2.2.4",
          "requirement": "viden",
          "summary": "Nyere biler skal have ESC, som mindsker udskridning og væltning ved hjulvis bremsning."
        },
        {
          "ref": "1.2.2.5",
          "requirement": "angive",
          "summary": "Bilen skal kunne styres let, sikkert og hurtigt."
        },
        {
          "ref": "1.2.2.6",
          "requirement": "angive",
          "summary": "Styreapparatet må ikke have væsentligt slør."
        },
        {
          "ref": "1.2.2.7",
          "requirement": "angive",
          "summary": "Ved lav fart skal rattet bevæges let uden ujævn modstand eller mislyde."
        },
        {
          "ref": "1.2.2.8",
          "requirement": "kontrollere",
          "summary": "Kontrollér at hjulene straks følger rattet; aktivér servo ved servostyring."
        },
        {
          "ref": "1.2.2.9",
          "requirement": "kontrollere",
          "summary": "Kontrollér eventuel servovæske efter mærker eller kontrollampe og fabrikantens forskrift."
        },
        {
          "ref": "1.2.2.10",
          "requirement": "angive",
          "summary": "Tung styring kan skyldes servovæske, drivrem eller elektrisk servofejl."
        },
        {
          "ref": "1.2.2.11",
          "requirement": "angive",
          "summary": "Forsinket hjulreaktion kan vise slør i styreforbindelserne."
        },
        {
          "ref": "1.2.2.12",
          "requirement": "angive",
          "summary": "For lidt servovæske eller væsentligt ratslør kræver eftersyn."
        }
      ],
      "cards": [
        {
          "title": "Fra rat til forhjul",
          "body": "Når du drejer rattet, føres bevægelsen gennem styreapparatets forbindelser og led til forhjulene. Under kørsel søger styringen normalt tilbage mod ligeud, når du letter på rattet. Det hjælper bilen med at følge en stabil linje. Men du skal stadig have kontrollen.",
          "refs": [
            "1.2.2.1",
            "1.2.2.2"
          ]
        },
        {
          "title": "Servo og ESC har hver sin rolle",
          "body": "Hydraulisk eller elektrisk servo gør rattet lettere at dreje. Nyere biler skal have ESC. ESC kan bremse ét eller flere hjul, så bilen ikke udskrider eller vælter, især i sving. Svigter servoen, bliver styringen tung. Så kan det være uforsvarligt og ulovligt at køre videre.",
          "refs": [
            "1.2.2.3",
            "1.2.2.4"
          ]
        },
        {
          "title": "Lovkravet kan du mærke",
          "body": "Styreapparatet skal gøre bilen let, sikker og hurtig at styre. Der må ikke være væsentligt slør. Ved lav fart skal du kunne dreje rattet fra side til side uden ujævn modstand eller mislyde. Mislyde kan afsløre en fejl.",
          "refs": [
            "1.2.2.5",
            "1.2.2.6",
            "1.2.2.7"
          ]
        },
        {
          "title": "Ratslør og servovæske",
          "body": "Ved tjek skal hjulene straks følge rattets bevægelse. Har bilen servostyring, skal servoen være slået til. Har bilen en servobeholder, tjekkes den efter fabrikantens forskrift. Typisk tjekker du, at væsken står mellem min- og maxmærket, eller at kontrollampen ikke lyser.",
          "refs": [
            "1.2.2.8",
            "1.2.2.9"
          ]
        },
        {
          "title": "Fejlene fortæller noget",
          "body": "Tung styring kan skyldes for lidt servovæske, en slidt eller knækket drivrem eller fejl i den elektriske servo. Følger hjulene ikke rattet straks, kan der være slør. For lidt væske eller væsentligt ratslør kræver eftersyn.",
          "refs": [
            "1.2.2.10",
            "1.2.2.11",
            "1.2.2.12"
          ]
        }
      ],
      "practical": [
        {
          "title": "Tjek ratslør",
          "action": "I en bil, der står stille, efter kørelærerens anvisning: slå servoen til, hvis bilen har den. Bevæg rattet lidt, og se udefra, om forhjulene straks følger med.",
          "refs": [
            "1.2.2.8"
          ]
        },
        {
          "title": "Find servokontrollen",
          "action": "Find sammen med kørelæreren bilens servokontrol. Det kan være en væskebeholder med min- og maxmærke eller en kontrollampe, efter fabrikantens forskrift. Metoden afhænger af bilen, og den praktiske udførelse vurderes i bilen.",
          "refs": [
            "1.2.2.9"
          ]
        }
      ],
      "case": {
        "context": "I en bil med servo slået til følger forhjulene ikke straks en lille ratbevægelse. Hvilken vurdering gengiver Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Det kan være slør i styreforbindelserne. Ved væsentligt ratslør skal styreapparatet efterses.",
            "correct": true,
            "why": "Hjulene skal normalt følge rattet straks. Forsinket reaktion kan vise slør, og væsentligt ratslør kræver eftersyn.",
            "refs": [
              "1.2.2.8",
              "1.2.2.11",
              "1.2.2.12"
            ]
          },
          {
            "id": "b",
            "text": "Det er normalt med servostyring, hvis rattet ellers kan drejes uden mislyde ved lav fart.",
            "correct": false,
            "why": "Servoen skal være slået til for at tjekke ratslør. Let styring uden mislyde fjerner ikke kravet om, at hjulene straks følger rattet.",
            "refs": [
              "1.2.2.7",
              "1.2.2.8",
              "1.2.2.11"
            ]
          },
          {
            "id": "c",
            "text": "Det peger kun på for lidt servovæske. Styreforbindelserne behøver derfor ikke eftersyn.",
            "correct": false,
            "why": "For lidt servovæske kan give tung styring. Men forsinket hjulreaktion er et særskilt tegn på slør i styreforbindelserne.",
            "refs": [
              "1.2.2.9",
              "1.2.2.10",
              "1.2.2.11"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvordan tjekker du ratslør i en bil med servostyring?",
        "answer": "Med servoen slået til bevæger du rattet og ser, om forhjulene straks følger med.",
        "refs": [
          "1.2.2.8"
        ]
      }
    },
    {
      "id": "bremser",
      "title": "Bremser",
      "pointRef": "1.2.3",
      "zone": "cockpit",
      "lead": "Bremsernes funktion, lamper og tjek skal sammen afsløre fejl, før sikkerheden svigter.",
      "objectives": [
        {
          "ref": "1.2.3.1",
          "requirement": "viden",
          "summary": "Væsketryk presser belægninger mod skive eller tromle og bremser hjulet."
        },
        {
          "ref": "1.2.3.2",
          "requirement": "viden",
          "summary": "Pedal, hovedcylinder, rør, slanger og forstærker skaber og fører bremsetryk."
        },
        {
          "ref": "1.2.3.3",
          "requirement": "viden",
          "summary": "Tokredssystemet bevarer nødbremsevirkning ved svigt i én kreds."
        },
        {
          "ref": "1.2.3.4",
          "requirement": "viden",
          "summary": "ABS bruger hjulfølere og en styreboks til at modvirke blokering og bevare begrænset styremulighed."
        },
        {
          "ref": "1.2.3.5",
          "requirement": "viden",
          "summary": "Parkeringsbremsen virker på hjulbremser og kan være elektrisk."
        },
        {
          "ref": "1.2.3.6",
          "requirement": "viden",
          "summary": "Bremseassistent øger deceleration eller aktiverer ABS fuldt ved kraftig bremsning."
        },
        {
          "ref": "1.2.3.7",
          "requirement": "viden",
          "summary": "One-pedal kan ofte slås til og fra i elbiler og giver regeneration, men erstatter ikke altid bremsepedalen."
        },
        {
          "ref": "1.2.3.8",
          "requirement": "viden",
          "summary": "Elbilers bremser kræver særlig vedligeholdelsesopmærksomhed."
        },
        {
          "ref": "1.2.3.9",
          "requirement": "angive",
          "summary": "Driftsbremsen skal virke på alle hjul ved alle hastigheder og belastninger."
        },
        {
          "ref": "1.2.3.10",
          "requirement": "angive",
          "summary": "Parkeringsbremsen skal kunne holde bilen på en hældning."
        },
        {
          "ref": "1.2.3.11",
          "requirement": "viden",
          "summary": "Hydraulisk driftsbremse kan være vakuum- eller elektrisk forstærket."
        },
        {
          "ref": "1.2.3.12",
          "requirement": "viden",
          "summary": "Nødbremsen skal kunne bremse sikkert ved svigt af driftsbremsen."
        },
        {
          "ref": "1.2.3.13",
          "requirement": "kontrollere",
          "summary": "Pedalen må ikke kunne trædes i bund ved hårdt tryk."
        },
        {
          "ref": "1.2.3.14",
          "requirement": "kontrollere",
          "summary": "Pedalen må normalt ikke synke ved konstant tryk."
        },
        {
          "ref": "1.2.3.15",
          "requirement": "kontrollere",
          "summary": "Bremsevæsken skal stå korrekt eller kontrollampen være slukket."
        },
        {
          "ref": "1.2.3.16",
          "requirement": "angive",
          "summary": "Skævtrækning kan skyldes bremsefejl eller midlertidig fugt og snavs."
        },
        {
          "ref": "1.2.3.17",
          "requirement": "angive",
          "summary": "Ujævn bremsning eller hug kan skyldes tromler, skiver eller belægninger."
        },
        {
          "ref": "1.2.3.18",
          "requirement": "angive",
          "summary": "Pludseligt længere pedalvandring er tegn på en defekt bremsekreds."
        },
        {
          "ref": "1.2.3.19",
          "requirement": "angive",
          "summary": "Skævtrækning ved let bremsning på vandret vej er et fejltegn."
        },
        {
          "ref": "1.2.3.20",
          "requirement": "angive",
          "summary": "Ujævn bremsning eller hjulvise hug er fejltegn."
        },
        {
          "ref": "1.2.3.21",
          "requirement": "angive",
          "summary": "Væske-, lampe-, pedal- og retningsfejl kræver straks eftersyn."
        },
        {
          "ref": "1.2.3.22",
          "requirement": "angive",
          "summary": "Ved vedvarende ABS-lampe er kun kørsel til nærmeste værksted tilladt."
        },
        {
          "ref": "1.2.3.23",
          "requirement": "angive",
          "summary": "Konstant ESC-lampe kan vise fejl; følg fabrikantens anvisning."
        }
      ],
      "cards": [
        {
          "title": "Tryk bliver til bremsekraft",
          "body": "Når du træder på pedalen, skaber hovedcylinderen væsketryk. Trykket føres gennem rør og slanger til hjulbremserne. Her presses belægningerne mod skiverne eller tromlerne. En forstærker hjælper dig. Svigter den, kan det være uforsvarligt og ulovligt at køre videre.",
          "refs": [
            "1.2.3.1",
            "1.2.3.2"
          ]
        },
        {
          "title": "Kredse og nødbremse",
          "body": "Tokredsbremsen har to adskilte kredse. Bliver den ene utæt, kan den anden give nødbremsevirkning. Men så er det uforsvarligt og ulovligt at køre videre. Nødbremsen skal kunne bremse bilen sikkert, hvis driftsbremsen svigter under kørslen.",
          "refs": [
            "1.2.3.3",
            "1.2.3.12"
          ]
        },
        {
          "title": "ABS, bremseassistent og ESC",
          "body": "Hjulfølere sender hjulenes omdrejninger til en styreboks, der modvirker blokering. Du kan i en vis grad styre under bremsning. Bremseassistenten hjælper ved kraftig opbremsning. Slukker ABS-lampen ikke kort efter igangsætning, er der fejl. Planen begrænser en eventuel forsvarlig tur til nærmeste værksted, og bilen skal stadig være sikkerhedsmæssigt forsvarlig. Ved andre bremsefejl standser du sikkert og får hjælp. Lyser ESC-lampen konstant, følg fabrikantens anvisninger.",
          "refs": [
            "1.2.3.4",
            "1.2.3.6",
            "1.2.3.22",
            "1.2.3.23"
          ],
          "sourceIds": [
            "plan-b-1-1",
            "fl-2026"
          ],
          "sourceLocator": "Plan B v1.1 1.2.3, pkt.4,6 og21-23; færdselsloven §67, stk.3",
          "figmaIds": [
            "R1-15"
          ]
        },
        {
          "title": "Elbilens bremser er særlige",
          "body": "Én-pedal-funktionen findes på elbiler og kan ofte slås til og fra. Når du løfter speederen, aktiveres regenerativ bremsning, som samtidig lader batteriet. Er bremsevirkningen for svag, skal du bruge bremsepedalen. Elbilens bremser kræver mere vedligeholdelse, for at de virker effektivt.",
          "refs": [
            "1.2.3.7",
            "1.2.3.8"
          ]
        },
        {
          "title": "Tre krav til bremserne",
          "body": "Driftsbremsen skal virke på alle hjul. Den skal bremse sikkert, hurtigt og virksomt ved alle hastigheder og belastninger. Parkeringsbremsen skal holde bilen på en skråning og kan være elektrisk. En hydraulisk driftsbremse kan være forstærket med vakuum eller elektrisk.",
          "refs": [
            "1.2.3.5",
            "1.2.3.9",
            "1.2.3.10",
            "1.2.3.11"
          ]
        },
        {
          "title": "Pedal og bremsevæske",
          "body": "Når du tjekker i bilen, må bremsepedalen ikke gå i bund ved hårdt tryk. Den må heller ikke normalt synke, når du holder et konstant tryk. Bremsevæsken skal stå mellem min- og maxmærket, eller kontrollampen skal være slukket. Pedalvandringen er forskellig fra bil til bil.",
          "refs": [
            "1.2.3.13",
            "1.2.3.14",
            "1.2.3.15"
          ]
        },
        {
          "title": "Fejl kan mærkes i bilen",
          "body": "Bilen trækker skævt, når du let bremser på vandret vej. Den hugger eller bremser ujævnt. Pedalen kan pludselig gå længere ned. Det er fejltegn, der kræver eftersyn straks. Fugt efter vask kan kortvarigt påvirke bremsebelægningerne, men forsvinder ved kontrolleret bremsning. Vedvarer det, eller er bremsevirkningen usikker, skal bilen undersøges før videre kørsel. For lidt bremsevæske eller en tændt bremseadvarsel kræver også eftersyn med det samme.",
          "refs": [
            "1.2.3.16",
            "1.2.3.17",
            "1.2.3.18",
            "1.2.3.19",
            "1.2.3.20",
            "1.2.3.21"
          ],
          "sourceIds": [
            "plan-b-1-1",
            "fl-2026"
          ],
          "sourceLocator": "Plan B v1.1 1.2.3, pkt.16-21; færdselsloven §67, stk.3",
          "figmaIds": [
            "R1-14"
          ]
        }
      ],
      "practical": [
        {
          "title": "Tjek pedalvandring",
          "action": "I en bil, der står stille, efter kørelærerens anvisning: tryk hårdt på pedalen, og hold derefter et konstant tryk. Vurder, om pedalen går i bund, eller om den normalt synker under det konstante tryk.",
          "refs": [
            "1.2.3.13",
            "1.2.3.14"
          ]
        },
        {
          "title": "Tjek bremsevæsken",
          "action": "Find sammen med kørelæreren beholderens min- og maxmærker eller den relevante kontrollampe. Følg bilens løsning, uden værktøj. Den praktiske kontrol skal du lære og vurdere i den konkrete bil.",
          "refs": [
            "1.2.3.15"
          ]
        }
      ],
      "case": {
        "context": "ABS-lampen slukker ikke kort efter, du har sat i gang. Hvilken kørselsadgang angiver Plan B præcist for fejlen?",
        "options": [
          {
            "id": "a",
            "text": "Planen tillader kun kørsel direkte til nærmeste værksted, fordi bremseegenskaberne er ændret.",
            "correct": true,
            "why": "En ABS-lampe, der ikke slukker kort efter igangsætning, er tegn på fejl. Planen begrænser kørslen til nærmeste værksted.",
            "refs": [
              "1.2.3.4",
              "1.2.3.22"
            ]
          },
          {
            "id": "b",
            "text": "Planen forbyder al kørsel selv og kræver, at bilen transporteres direkte til et værksted.",
            "correct": false,
            "why": "Det er lovligt at lade bilen stå. Men udsagnet passer ikke med planen, der tillader kørsel til nærmeste værksted.",
            "refs": [
              "1.2.3.4",
              "1.2.3.22"
            ]
          },
          {
            "id": "c",
            "text": "Planen tillader forsigtige nødvendige ture, hvis du undgår hårde bremsninger og holder lav fart.",
            "correct": false,
            "why": "Planen giver ikke generel adgang til nødvendige ture. Den eneste fortsatte kørsel, den nævner, er til nærmeste værksted.",
            "refs": [
              "1.2.3.4",
              "1.2.3.22"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvad gør du, hvis bremsepedalen pludselig går længere ned end normalt?",
        "answer": "Det er tegn på en defekt bremsekreds. Få bremserne efterset med det samme. Så er det ikke forsvarligt at køre videre som normalt.",
        "refs": [
          "1.2.3.18",
          "1.2.3.21"
        ]
      }
    },
    {
      "id": "lygter-reflekser-horn",
      "title": "Lygter, reflekser og horn",
      "pointRef": "1.2.4",
      "zone": "exterior",
      "lead": "Lysene skal oplyse vejen og gøre bilen synlig uden at blænde andre.",
      "objectives": [
        {
          "ref": "1.2.4.1",
          "requirement": "angive",
          "summary": "Bilen må kun have påbudte eller tilladte lygter og reflekser."
        },
        {
          "ref": "1.2.4.2",
          "requirement": "angive",
          "summary": "Kend bilens obligatoriske lygter, blinklys og bagreflekser."
        },
        {
          "ref": "1.2.4.3",
          "requirement": "angive",
          "summary": "Kend rækkevidderne 100, 30 og 300 meter for forlygter og positionslys."
        },
        {
          "ref": "1.2.4.4",
          "requirement": "angive",
          "summary": "Lygter og reflekser skal være hele, rene og funktionsdygtige."
        },
        {
          "ref": "1.2.4.5",
          "requirement": "angive",
          "summary": "Forlygter skal lyse hvidt eller gulligt."
        },
        {
          "ref": "1.2.4.6",
          "requirement": "angive",
          "summary": "Pærer skal være korrekt monteret."
        },
        {
          "ref": "1.2.4.7",
          "requirement": "angive",
          "summary": "Lygter i et par skal have samme farve og styrke."
        },
        {
          "ref": "1.2.4.8",
          "requirement": "angive",
          "summary": "Baglygter skal lyse rødt."
        },
        {
          "ref": "1.2.4.9",
          "requirement": "angive",
          "summary": "Nummerpladelys skal gøre pladen læselig på mindst 20 meter."
        },
        {
          "ref": "1.2.4.10",
          "requirement": "angive",
          "summary": "Biler over 6 meter kræver gule sidereflekser og sidemarkeringslygter."
        },
        {
          "ref": "1.2.4.11",
          "requirement": "viden",
          "summary": "Kend hele listen over tilladte ekstra lygter samt hvide, gule og supplerende røde reflekser."
        },
        {
          "ref": "1.2.4.12",
          "requirement": "viden",
          "summary": "Pæremontering kan vurderes på lys-mørke-grænsen mod en væg."
        },
        {
          "ref": "1.2.4.13",
          "requirement": "viden",
          "summary": "Nærlysets lysgrænse skal falde 1 centimeter pr. meter."
        },
        {
          "ref": "1.2.4.14",
          "requirement": "kontrollere",
          "summary": "Kontrollér at alle lygter og reflekser er hele og rene."
        },
        {
          "ref": "1.2.4.15",
          "requirement": "kontrollere",
          "summary": "Kontrollér at stoplys er væsentligt kraftigere end baglys."
        },
        {
          "ref": "1.2.4.16",
          "requirement": "kontrollere",
          "summary": "Kontrollér gult blinklys, som er tydeligt i sollys."
        },
        {
          "ref": "1.2.4.17",
          "requirement": "kontrollere",
          "summary": "Kontrollér at havariblink tænder alle blinklygter samtidig."
        },
        {
          "ref": "1.2.4.18",
          "requirement": "kontrollere",
          "summary": "Kontrollér hvid belysning af den bageste nummerplade."
        },
        {
          "ref": "1.2.4.19",
          "requirement": "kontrollere",
          "summary": "Kontrollér at hornet giver en klar og konstant tone."
        },
        {
          "ref": "1.2.4.20",
          "requirement": "angive",
          "summary": "Hurtig blinkrytme viser normalt en defekt blinklygte."
        }
      ],
      "cards": [
        {
          "title": "Det lys, bilen skal have",
          "body": "Bilen skal have to fjernlys, to asymmetriske nærlys, to positionslys og to baglys. Normalt skal den have tre stoplys. Den skal også have mindst ét nummerpladelys og blinklys foran, bagpå og på siderne. Og to røde bagreflekser, godkendte, mærkede og ikke trekantede.",
          "refs": [
            "1.2.4.1",
            "1.2.4.2"
          ]
        },
        {
          "title": "Tre afstande og én nummerplade",
          "body": "Fjernlyset skal lyse mindst 100 meter frem. Nærlyset skal nå mindst 30 meter, uden at det blænder. Positionslyset skal kunne ses mindst 300 meter væk. Nummerpladelyset skal gøre den bageste nummerplade læselig mindst 20 meter bag bilen.",
          "refs": [
            "1.2.4.3",
            "1.2.4.9"
          ]
        },
        {
          "title": "Farver og par af lygter",
          "body": "Forlygterne skal lyse hvidt eller gulligt. Baglygterne skal lyse rødt. Pærerne skal sidde korrekt. Lygter i samme par skal have samme farve og styrke. Alle lygter og reflekser skal være hele, rene og virke.",
          "refs": [
            "1.2.4.4",
            "1.2.4.5",
            "1.2.4.6",
            "1.2.4.7",
            "1.2.4.8"
          ]
        },
        {
          "title": "Biler over 6 meter",
          "body": "En bil over 6 meter skal have godkendte og mærkede gule sidereflekser. Den skal også have sidemarkeringslygter fordelt på siderne. Kravet gælder på grund af bilens længde. Det må ikke forveksles med de supplerende reflekser, som kan være tilladt på andre biler.",
          "refs": [
            "1.2.4.10"
          ]
        },
        {
          "title": "Ekstra lygter og reflekser, der er tilladt",
          "body": "Disse ekstra lygter er tilladt: ekstra fjernlys, kørelys, ekstra stop- og baglygter, tågeforlygter, baklygter, tågebaglygter, søge- og arbejdslygter, afmærknings- og markeringslygter, parkeringslygter og overhalingsblink. Bilen må også have hvide reflekser foran, gule på siderne og supplerende røde bagpå. Udstyret følger særlige regler.",
          "refs": [
            "1.2.4.11"
          ]
        },
        {
          "title": "Nærlysets grænse",
          "body": "En forkert monteret pære kan give et forkert lysbillede. Mod en væg kan du se lys-mørke-grænsen. Nærlyset må ikke blænde. Overkanten af lysgrænsen skal falde 1 centimeter for hver meter væk fra bilen.",
          "refs": [
            "1.2.4.12",
            "1.2.4.13"
          ]
        },
        {
          "title": "Tjek rundt om bilen",
          "body": "Tjek, at lygter og reflekser er hele og rene. Stoplyset skal være kraftigere end baglyset. Det gule blinklys skal ses tydeligt. Havariblinket skal tænde alle blinklygter. Nummerpladelyset skal være hvidt, og hornet skal give en klar, konstant tone. Hurtig blinkrytme betyder normalt, at mindst én blinklygte ikke virker.",
          "refs": [
            "1.2.4.14",
            "1.2.4.15",
            "1.2.4.16",
            "1.2.4.17",
            "1.2.4.18",
            "1.2.4.19",
            "1.2.4.20"
          ]
        }
      ],
      "practical": [
        {
          "title": "Tjek lygter og reflekser",
          "action": "Sammen med kørelæreren i undervisningsbilen gør du dette. Først tjekker du, at alle lygter og reflekser er hele og rene. Dernæst sammenligner du stoplyset med baglyset, og du ser, at stoplyset er væsentligt kraftigere. Så tjekker du det gule blinklys, der skal ses tydeligt i sollys. Tænd havariblinket, og se at alle blinklygterne tænder samtidig. Til sidst tjekker du, at nummerpladelyset lyser den bageste nummerplade op med hvidt lys.",
          "refs": [
            "1.2.4.14",
            "1.2.4.15",
            "1.2.4.16",
            "1.2.4.17",
            "1.2.4.18"
          ]
        },
        {
          "title": "Hornet",
          "action": "Find et egnet sted, og følg kørelærerens anvisning. Giv et kort signal, og vurder, om tonen er klar og konstant. Brug hornet kun, når det er nødvendigt. Kontrollen skal laves i bilen.",
          "refs": [
            "1.2.4.19"
          ]
        }
      ],
      "case": {
        "context": "Blinklygterne blinker markant hurtigere end normalt. Hvad er det ifølge Plan B normalt et tegn på?",
        "options": [
          {
            "id": "a",
            "text": "Det er normalt et tegn på, at en eller flere blinklygter ikke virker.",
            "correct": true,
            "why": "Plan B knytter den hurtige blinkrytme til, at en eller flere blinklygter normalt er ude af funktion.",
            "refs": [
              "1.2.4.20"
            ]
          },
          {
            "id": "b",
            "text": "Det er normalt en selvtest, der viser, at alle blinklygter og havariblinket virker.",
            "correct": false,
            "why": "Planen nævner ikke en selvtest. Den hurtige rytme er normalt et tegn på en blinklygte, der ikke virker.",
            "refs": [
              "1.2.4.17",
              "1.2.4.20"
            ]
          },
          {
            "id": "c",
            "text": "Det viser normalt, at blinklygterne lyser for kraftigt, selv om de alle virker.",
            "correct": false,
            "why": "Lysstyrken tjekkes ved, at blinket ses tydeligt i sollys. Den hurtige rytme hører til en blinklygte, der ikke virker.",
            "refs": [
              "1.2.4.16",
              "1.2.4.20"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvilke afstande skal fjernlys, nærlys og positionslys nå?",
        "answer": "Fjernlyset mindst 100 meter. Nærlyset mindst 30 meter, uden at blænde. Positionslyset skal kunne ses på mindst 300 meter.",
        "refs": [
          "1.2.4.3"
        ]
      }
    },
    {
      "id": "motor-udstoedning-batteri",
      "title": "Motor, udstødning og batteri",
      "pointRef": "1.2.5",
      "zone": "powertrain",
      "lead": "Væske, støj, røg og ændret kraftoverførsel viser tidligt, at noget er galt i drivlinjen.",
      "objectives": [
        {
          "ref": "1.2.5.1",
          "requirement": "kontrollere",
          "summary": "Kontrollér tilstrækkelig motorolie efter pind, instrument eller instruktionsbog."
        },
        {
          "ref": "1.2.5.2",
          "requirement": "kontrollere",
          "summary": "Kontrollér kølervæske efter instruktionsbogens anvisning."
        },
        {
          "ref": "1.2.5.3",
          "requirement": "angive",
          "summary": "Utæt udstødning eller åben bagklap kan føre farlig kulilte ind."
        },
        {
          "ref": "1.2.5.4",
          "requirement": "angive",
          "summary": "For lidt olie eller kølervæske kan beskadige motoren."
        },
        {
          "ref": "1.2.5.5",
          "requirement": "angive",
          "summary": "Unormal udstødningsrøg viser dårlig forbrænding og fejl."
        },
        {
          "ref": "1.2.5.6",
          "requirement": "angive",
          "summary": "Unormal støj ved gasgivning viser mulig udstødningsfejl."
        },
        {
          "ref": "1.2.5.7",
          "requirement": "angive",
          "summary": "Stigende motoromdrejning uden højere fart viser mulig koblingsfejl."
        },
        {
          "ref": "1.2.5.8",
          "requirement": "angive",
          "summary": "Vanskeligt gearskift med kraftig mislyd viser gear- eller koblingsfejl."
        },
        {
          "ref": "1.2.5.9",
          "requirement": "angive",
          "summary": "Kryb i første gear med koblingen helt nede viser koblingsfejl."
        },
        {
          "ref": "1.2.5.10",
          "requirement": "viden",
          "summary": "Elbilbatteriers kapacitet og rækkevidde falder med alder og slid."
        },
        {
          "ref": "1.2.5.11",
          "requirement": "viden",
          "summary": "Fabrikantens instruktioner kan begrænse unødigt batterislid."
        },
        {
          "ref": "1.2.5.12",
          "requirement": "viden",
          "summary": "Forvarmning eller køling under opladning kan gavne rækkevidden."
        },
        {
          "ref": "1.2.5.13",
          "requirement": "angive",
          "summary": "Føreren skal følge støj, motor og emissionsbegrænsende udstyr."
        }
      ],
      "cards": [
        {
          "title": "Olie og kølervæske",
          "body": "Tjek, at der er nok motorolie. Det gør du med oliepinden mellem min- og maxmærket, med bilens målere eller efter instruktionsbogen. Kølervæsken tjekker du efter instruktionsbogen. For lidt olie eller kølervæske kan skade motoren alvorligt under kørsel.",
          "refs": [
            "1.2.5.1",
            "1.2.5.2",
            "1.2.5.4"
          ]
        },
        {
          "title": "Kulilte kan du ikke lugte",
          "body": "En utæt udstødning eller kørsel med åben bagklap kan lukke kulilte ind i bilen. Gassen er lugtfri og farlig, selv i små mængder. Så lugt er ingen sikker test. Fejl skal forebygges, og forkert brug skal undgås.",
          "refs": [
            "1.2.5.3"
          ]
        },
        {
          "title": "Røg, støj og kraftoverførsel",
          "body": "Usædvanlig udstødningsrøg tyder på dårlig forbrænding. Usædvanlig støj, når du giver gas, tyder på en udstødningsfejl. Stiger omdrejningerne uden, at farten stiger, kan koblingen glide. Kraftige mislyde ved gearskift er også fejltegn. Det samme gælder, hvis bilen kryber frem, mens koblingen er helt nede.",
          "refs": [
            "1.2.5.5",
            "1.2.5.6",
            "1.2.5.7",
            "1.2.5.8",
            "1.2.5.9"
          ]
        },
        {
          "title": "Elbilens batteri ændrer sig",
          "body": "Et højvoltsbatteri mister normalt kapacitet med alder og slid. Så bliver rækkevidden kortere. Følg fabrikantens råd for at begrænse unødigt slid. Varme eller afkøling af kabine og batteri, mens bilen lader, kan forbedre rækkevidden.",
          "refs": [
            "1.2.5.10",
            "1.2.5.11",
            "1.2.5.12"
          ]
        },
        {
          "title": "Lovlig stand undervejs",
          "body": "Du skal løbende være opmærksom på unødig støj og på fejl ved motoren eller udstyr, der påvirker udledningen. En ny lyd eller røgsky skal du ikke gemme til næste olieskift. Vurder den med det samme.",
          "refs": [
            "1.2.5.13"
          ]
        }
      ],
      "practical": [
        {
          "title": "Tjek motorolien",
          "action": "Kørelæreren viser den rigtige metode i din bil: oliepind, instrumentvisning eller instruktionsbog. Lav tjekket uden værktøj efter fabrikantens anvisning. Forklar, hvordan du ser, at oliemængden er tilstrækkelig.",
          "refs": [
            "1.2.5.1"
          ]
        },
        {
          "title": "Tjek kølervæsken",
          "action": "Find beholderen eller den relevante visning sammen med kørelæreren, og følg instruktionsbogen. Åbn aldrig et varmt system alene. Det praktiske tjek skal du lave og vurdere i bilen.",
          "refs": [
            "1.2.5.2"
          ]
        }
      ],
      "case": {
        "context": "Motoren får flere omdrejninger uden højere fart, og gearskiftet er svært med kraftige mislyde. Hvilken fejlkobling følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Omdrejningerne uden fart tyder på koblingsfejl. Mislydene ved svært gearskift tyder på fejl i gearet eller koblingen.",
            "correct": true,
            "why": "Planen beskriver præcis de to tegn. Det første hører til koblingen, og det andet hører til gear eller kobling.",
            "refs": [
              "1.2.5.7",
              "1.2.5.8"
            ]
          },
          {
            "id": "b",
            "text": "Begge tegn skyldes normalt for lidt kølervæske, så de skal vurderes som en motorfejl.",
            "correct": false,
            "why": "For lidt kølervæske kan skade motoren. Men planen knytter ikke de to tegn til kølesystemet.",
            "refs": [
              "1.2.5.2",
              "1.2.5.4",
              "1.2.5.7",
              "1.2.5.8"
            ]
          },
          {
            "id": "c",
            "text": "Omdrejningerne uden fart viser en udstødningsfejl. Mislydene viser, at batteriets kapacitet er for lav.",
            "correct": false,
            "why": "Udstødningsfejl hører til støj, når du giver gas. Batterikapacitet hører til rækkevidde. Ingen af dem passer til tegnene.",
            "refs": [
              "1.2.5.6",
              "1.2.5.7",
              "1.2.5.8",
              "1.2.5.10"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvorfor kan du ikke bruge lugtesansen til at finde kulilte i bilen?",
        "answer": "Kulilte er lugtfri og farlig, selv i små mængder. En utæt udstødning eller åben bagklap kan lukke den ind i bilen.",
        "refs": [
          "1.2.5.3"
        ]
      }
    },
    {
      "id": "energi-og-miljo",
      "title": "Kør energi- og miljørigtigt",
      "pointRef": "1.2.6",
      "zone": "powertrain",
      "lead": "Tænk frem og kør jævnt. Så bruger du mindre energi og laver mindre støj og udledning.",
      "objectives": [
        {
          "ref": "1.2.6.1",
          "requirement": "angive",
          "summary": "Start først motoren umiddelbart før afgang."
        },
        {
          "ref": "1.2.6.2",
          "requirement": "angive",
          "summary": "Undgå længere tomgang for at begrænse støj og luftforurening."
        },
        {
          "ref": "1.2.6.3",
          "requirement": "angive",
          "summary": "Køremåden har stor betydning for energiforbruget."
        },
        {
          "ref": "1.2.6.4",
          "requirement": "angive",
          "summary": "Automatisk motorstop ved korte standsninger sparer energi."
        },
        {
          "ref": "1.2.6.5",
          "requirement": "angive",
          "summary": "Sluk motoren ved længere standsning for at spare energi."
        },
        {
          "ref": "1.2.6.6",
          "requirement": "angive",
          "summary": "Undgå unødige og gentagne hastighedsændringer."
        },
        {
          "ref": "1.2.6.7",
          "requirement": "angive",
          "summary": "Slip speederen og undgå så vidt muligt udkobling ved fartreduktion."
        },
        {
          "ref": "1.2.6.8",
          "requirement": "angive",
          "summary": "Vælg så højt gear som muligt for lavere energiforbrug."
        },
        {
          "ref": "1.2.6.9",
          "requirement": "angive",
          "summary": "Accelerér kvikt med cirka halv speeder og vælg tidligt et højt gear, eventuelt ved at springe gear over."
        },
        {
          "ref": "1.2.6.10",
          "requirement": "angive",
          "summary": "Unødig vægt øger energiforbruget."
        },
        {
          "ref": "1.2.6.11",
          "requirement": "angive",
          "summary": "Brug bilens eventuelle energiforbrugsvisning."
        },
        {
          "ref": "1.2.6.12",
          "requirement": "angive",
          "summary": "For lavt dæktryk øger energiforbruget."
        },
        {
          "ref": "1.2.6.13",
          "requirement": "angive",
          "summary": "Tagboks og lignende øger energiforbruget."
        },
        {
          "ref": "1.2.6.14",
          "requirement": "angive",
          "summary": "Aircondition og andet elektrisk udstyr øger energiforbruget."
        },
        {
          "ref": "1.2.6.15",
          "requirement": "angive",
          "summary": "Høj fart og aggressiv acceleration øger forbruget markant."
        },
        {
          "ref": "1.2.6.16",
          "requirement": "angive",
          "summary": "Forudse signalstop og sænk farten tidligt frem for sen hård bremsning."
        },
        {
          "ref": "1.2.6.17",
          "requirement": "angive",
          "summary": "Undgå korte og unødvendige køreture."
        },
        {
          "ref": "1.2.6.18",
          "requirement": "viden",
          "summary": "Kørsel uden for myldretid kan skåne miljøet."
        },
        {
          "ref": "1.2.6.19",
          "requirement": "viden",
          "summary": "Planlæg samkørsel, når det er muligt."
        },
        {
          "ref": "1.2.6.20",
          "requirement": "viden",
          "summary": "Vælg om muligt det mest energieffektive og mindst forurenende køretøj."
        },
        {
          "ref": "1.2.6.21",
          "requirement": "viden",
          "summary": "Hybrid og plug-in-hybrid kombinerer forbrændingsmotor og elmotor."
        },
        {
          "ref": "1.2.6.22",
          "requirement": "viden",
          "summary": "Plug-in-hybridens fordel kræver, at opladningsmuligheden bruges mest muligt."
        },
        {
          "ref": "1.2.6.23",
          "requirement": "viden",
          "summary": "Elkøretøjer udnytter generelt energien bedre end fossilkøretøjer."
        },
        {
          "ref": "1.2.6.24",
          "requirement": "viden",
          "summary": "Elbilens rækkevidde afhænger af køremåde og årstid."
        },
        {
          "ref": "1.2.6.25",
          "requirement": "viden",
          "summary": "Lange elbilture kræver omhyggelig rute- og ladeplanlægning."
        },
        {
          "ref": "1.2.6.26",
          "requirement": "viden",
          "summary": "Mest mulig regeneration kan øge elbilens rækkevidde."
        },
        {
          "ref": "1.2.6.27",
          "requirement": "angive",
          "summary": "Betjen bilen uden unødig støj, røg eller gasudvikling."
        },
        {
          "ref": "1.2.6.28",
          "requirement": "angive",
          "summary": "Undgå unødig forstyrrende kørsel ved bebyggelse og begræns gene."
        },
        {
          "ref": "1.2.6.29",
          "requirement": "angive",
          "summary": "Lokale regler kan begrænse tomgangstiden."
        }
      ],
      "cards": [
        {
          "title": "Start motoren, når du skal af sted",
          "body": "Start forbrændingsmotoren lige før afgang. Undgå at lade den gå i tomgang længe. Brug automatisk motorstop ved korte standsninger, hvis bilen har det. Ved længere ventetid kan du slukke motoren. Det sparer energi og begrænser støj og luftforurening.",
          "refs": [
            "1.2.6.1",
            "1.2.6.2",
            "1.2.6.3",
            "1.2.6.4",
            "1.2.6.5"
          ]
        },
        {
          "title": "Jævn kørsel og rigtigt gearvalg",
          "body": "Undgå at skifte fart hele tiden. Når du sænker farten, slipper du speederen helt. I en bil med kobling undgår du så vidt muligt at koble ud. I en manuel bil kan du for eksempel skifte fra 2. til 4. gear, eller fra 3. til 5. gear, tidligt efter en kvik acceleration med cirka halv speeder.",
          "refs": [
            "1.2.6.6",
            "1.2.6.7",
            "1.2.6.8",
            "1.2.6.9"
          ]
        },
        {
          "title": "Modstand koster energi",
          "body": "Unødig vægt, for lavt dæktryk og en tagboks gør, at bilen bruger mere energi. Aircondition og andet elektrisk udstyr bruger også energi. Har bilen en forbrugsvisning, kan du se effekten og ændre dine vaner.",
          "refs": [
            "1.2.6.10",
            "1.2.6.11",
            "1.2.6.12",
            "1.2.6.13",
            "1.2.6.14"
          ]
        },
        {
          "title": "Se rødt lys tidligt",
          "body": "Høj fart og hård acceleration øger forbruget. Når du nærmer dig et signal, bør du forudse et muligt stop. Sænk farten i god tid, i stedet for at køre hurtigt og bremse hårdt til sidst. Energirigtig kørsel kan normalt spare 5 til 10 procent brændstof, og i mange tilfælde op til 25 procent.",
          "refs": [
            "1.2.6.15",
            "1.2.6.16"
          ]
        },
        {
          "title": "Planlæg før du kører",
          "body": "Undgå korte, unødvendige ture. Hvis det er muligt, kan du køre uden for myldretiden, dele turen med andre eller tage et køretøj, der er mere energieffektivt og forurener mindre. Den bedste sparemanøvre kan være at planlægge turen anderledes.",
          "refs": [
            "1.2.6.17",
            "1.2.6.18",
            "1.2.6.19",
            "1.2.6.20"
          ]
        },
        {
          "title": "Plug-in-hybrid kræver opladning",
          "body": "Hybrid- og plug-in-hybridbiler kombinerer en forbrændingsmotor og en elmotor, så energiforbruget bliver lavest muligt. En plug-in-hybrid er kun miljøvenlig og energieffektiv, når du lader den mest muligt ved en ladestander. Den faktiske opladning er derfor afgørende for, at du får den tilsigtede energi- og miljøgevinst.",
          "refs": [
            "1.2.6.21",
            "1.2.6.22"
          ]
        },
        {
          "title": "Elbilens rækkevidde",
          "body": "Elbiler udnytter generelt energien bedre end fossilbiler. Rækkevidden påvirkes af din køremåde og af årstiden. Lange ture kræver, at du planlægger ruten og ladestoppene omhyggeligt, gerne med relevante apps. Brug regenerering mest muligt, når forholdene tillader det.",
          "refs": [
            "1.2.6.23",
            "1.2.6.24",
            "1.2.6.25",
            "1.2.6.26"
          ]
        },
        {
          "title": "Støj og røg er ikke gratis",
          "body": "Betjen bilen uden unødig støj, røg og gas. Undgå forstyrrende kørsel ved bebyggelse, eller lav den med mindst mulig gene. Lokale regler kan også sætte en konkret grænse for, hvor længe bilen må gå i tomgang.",
          "refs": [
            "1.2.6.27",
            "1.2.6.28",
            "1.2.6.29"
          ]
        }
      ],
      "practical": [
        {
          "title": "Læs forbrugsvisningen",
          "action": "I undervisningsbilen viser kørelæreren energivisningen, hvis bilen har en. Aflæs den ved rolige og ujævne fartændringer, mens I øver lovligt. Forklar, hvordan din køremåde påvirker visningen.",
          "refs": [
            "1.2.6.3",
            "1.2.6.11",
            "1.2.6.15"
          ]
        },
        {
          "title": "Tjek biltypen",
          "action": "Afgør sammen med kørelæreren, om bilen er en forbrændingsbil, hybrid, plug-in-hybrid eller elbil. Peg på de stop-, lade- eller regenerationsfunktioner, der er relevante. De afhænger af bilen.",
          "refs": [
            "1.2.6.4",
            "1.2.6.21",
            "1.2.6.22",
            "1.2.6.26"
          ]
        }
      ],
      "case": {
        "context": "Hvilken beskrivelse gengiver Plan B præcist for energirigtig teknik i en manuelt gearet forbrændingsbil?",
        "options": [
          {
            "id": "a",
            "text": "Start lige før afgang, undgå længere tomgang, giv kvik gas med cirka halv speeder, skift tidligt til et højt gear, og tilpas farten før signalet.",
            "correct": true,
            "why": "Hvert led følger planens råd om starttidspunkt, tomgang, acceleration, gearvalg og tilpasning af farten før signalet i kryds.",
            "refs": [
              "1.2.6.1",
              "1.2.6.2",
              "1.2.6.8",
              "1.2.6.9",
              "1.2.6.16"
            ]
          },
          {
            "id": "b",
            "text": "Start tidligt, og varm motoren op i tomgang. Giv derefter forsigtigt gas i lave gear, og koble ud, når du sænker farten.",
            "correct": false,
            "why": "Planen fraråder lang tomgang og anbefaler højt gear. Den siger også, at du så vidt muligt bør undgå at koble ud, når du sænker farten.",
            "refs": [
              "1.2.6.1",
              "1.2.6.2",
              "1.2.6.7",
              "1.2.6.8",
              "1.2.6.9"
            ]
          },
          {
            "id": "c",
            "text": "Start lige før afgang, og hold lave gear for trækkraft. Hold normal fart mod signalet, og brems jævnt til sidst.",
            "correct": false,
            "why": "Starttidspunktet passer. Men lave gear og sen tilpasning af farten strider mod planens råd om højt gear og tidlig tilpasning før signalet.",
            "refs": [
              "1.2.6.1",
              "1.2.6.8",
              "1.2.6.16"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvorfor er en plug-in-hybrid ikke automatisk energi- og miljørigtig?",
        "answer": "Den skal lades mest muligt. Og køremåde, tomgang, vægt og turplanlægning betyder stadig noget.",
        "refs": [
          "1.2.6.2",
          "1.2.6.3",
          "1.2.6.22"
        ]
      }
    },
    {
      "id": "daek-faelge-baerende-dele",
      "title": "Dæk, fælge og bærende dele",
      "pointRef": "1.2.7",
      "zone": "exterior",
      "lead": "Dækkene og hjulene skal passe sammen og sidde rigtigt. Slid, lyd og styring viser, hvis noget er galt.",
      "objectives": [
        {
          "ref": "1.2.7.1",
          "requirement": "angive",
          "summary": "Dæk, fælge og hjullejer skal være ubeskadigede."
        },
        {
          "ref": "1.2.7.2",
          "requirement": "angive",
          "summary": "Dæk på samme aksel skal have samme dimension og type, bortset fra nødhjul."
        },
        {
          "ref": "1.2.7.3",
          "requirement": "angive",
          "summary": "Dæktrykket skal følge fabrikantens forskrift."
        },
        {
          "ref": "1.2.7.4",
          "requirement": "angive",
          "summary": "Køretøjet må ikke have åbenbart uegnede dæk."
        },
        {
          "ref": "1.2.7.5",
          "requirement": "viden",
          "summary": "Kend almindelige dæk, vinterdæk og helårsdæk samt deres temperaturformål."
        },
        {
          "ref": "1.2.7.6",
          "requirement": "viden",
          "summary": "Bjerg-snefnug med M+S viser vinterdæk; M+S alene kan være helårsdæk."
        },
        {
          "ref": "1.2.7.7",
          "requirement": "viden",
          "summary": "Pigdæk må bruges 1. november til 15. april og skal sidde på alle hjul."
        },
        {
          "ref": "1.2.7.8",
          "requirement": "viden",
          "summary": "El- og hybridbiler har ofte større dækslid på grund af vægt og regeneration."
        },
        {
          "ref": "1.2.7.9",
          "requirement": "kontrollere",
          "summary": "Kontrollér mindst 1,6 millimeter hovedmønster på alle hjul."
        },
        {
          "ref": "1.2.7.10",
          "requirement": "kontrollere",
          "summary": "Kontrollér at dæk og fælge er ubeskadigede."
        },
        {
          "ref": "1.2.7.11",
          "requirement": "kontrollere",
          "summary": "Kontrollér korrekt omløbsretning på retningsbestemte dæk."
        },
        {
          "ref": "1.2.7.12",
          "requirement": "angive",
          "summary": "Ujævnt eller skævt dækslid viser fejl."
        },
        {
          "ref": "1.2.7.13",
          "requirement": "angive",
          "summary": "Over- eller understyring og sidevindsfølsomhed kan vise forkert dæktryk."
        },
        {
          "ref": "1.2.7.14",
          "requirement": "angive",
          "summary": "Knirkelyde kan vise fejl i fjedre, støddæmpere eller hjulophæng."
        },
        {
          "ref": "1.2.7.15",
          "requirement": "angive",
          "summary": "Skævt slid kan skyldes dæktryk, hjulindstilling, bremser eller støddæmpere."
        },
        {
          "ref": "1.2.7.16",
          "requirement": "angive",
          "summary": "Unormal støj eller vibration kan vise fejl i hjulleje eller ophæng."
        },
        {
          "ref": "1.2.7.17",
          "requirement": "angive",
          "summary": "Fejl bag ujævnt dækslid skal straks afhjælpes."
        },
        {
          "ref": "1.2.7.18",
          "requirement": "angive",
          "summary": "Tegn på forkert dæktryk skal straks afhjælpes."
        }
      ],
      "cards": [
        {
          "title": "Hjulene skal passe sammen",
          "body": "Dæk, fælge og hjullejer skal være ubeskadigede. På samme aksel skal dækkene have samme dimension og type. Undtagelsen er et nødhjul til midlertidig brug. Dæktrykket skal følge fabrikantens forskrift. Åbenbart uegnede dæk må du ikke bruge.",
          "refs": [
            "1.2.7.1",
            "1.2.7.2",
            "1.2.7.3",
            "1.2.7.4"
          ]
        },
        {
          "title": "Læs, hvilken type dæk du har",
          "body": "Almindelige dæk er lavet til højere temperaturer end vinterdæk. M plus S betyder, at dækket er typegodkendt som vinterdæk. Snefnugmærket med tre bjergtinder viser, at dækket også egner sig til krævende sne. Helårsdæk er en markedsføringsbetegnelse, og de kan også have de mærker. Læs derfor mærkerne og egenskaberne. Gæt ikke dæktypen ud fra mønstret alene.",
          "refs": [
            "1.2.7.5",
            "1.2.7.6"
          ],
          "sourceIds": [
            "plan-b-1-1",
            "dfk-1484",
            "fstyr-daek"
          ],
          "sourceLocator": "DfK1484 bilag1 pkt.8.02.002(6); Færdselsstyrelsen Vejledning om dæk, mærkning; Plan B v1.1 1.2.7, pkt.5-6",
          "figmaIds": [
            "R1-27"
          ]
        },
        {
          "title": "Pigdæk og tunge biler",
          "body": "På en bil og et registreringspligtigt påhængskøretøj må pigdæk kun bruges fra 1. november til 15. april, og kun når alle hjul på køretøjet eller vogntoget har pigdæk. Tvillingehjul kan dog have pigdæk på kun det ene hjul, hvis der er symmetri om køretøjets længdeakse. Antallet af pigge skal være cirka ens. El- og hybridbiler slides ofte mere på grund af vægt og regeneration.",
          "refs": [
            "1.2.7.7",
            "1.2.7.8"
          ],
          "sourceIds": [
            "plan-b-1-1",
            "dfk-1484"
          ],
          "sourceLocator": "DfK1484 §18, stk.1 og3; Plan B v1.1 1.2.7, pkt.7-8",
          "figmaIds": [
            "R1-27"
          ]
        },
        {
          "title": "Tre konkrete tjek",
          "body": "Hovedmønstret skal være mindst 1,6 millimeter på alle hjul. Du kan vurdere det med slidindikatorerne. Dæk og fælge skal være uden skader. Et retningsbestemt dæk skal sidde med korrekt omløbsretning efter markeringen på siden.",
          "refs": [
            "1.2.7.9",
            "1.2.7.10",
            "1.2.7.11"
          ]
        },
        {
          "title": "Slid peger videre",
          "body": "Ujævnt eller skævt slid kan skyldes forkert dæktryk, et fejlende hjul, hjulindstilling, bremser eller støddæmpere. Over- eller understyring og større følsomhed over for sidevind kan også pege på dæktrykket. Find årsagen med det samme, og ret den.",
          "refs": [
            "1.2.7.12",
            "1.2.7.13",
            "1.2.7.15",
            "1.2.7.17",
            "1.2.7.18"
          ]
        },
        {
          "title": "Lyt til ophænget",
          "body": "Knirk under kørsel kan komme fra hjulophæng, fjedre eller støddæmpere. Unormal støj eller vibration fra hjullejet eller ophænget kan også være tegn på fejl. Lyden er et signal om at undersøge bilen. Den er ikke noget, du skal vænne dig til.",
          "refs": [
            "1.2.7.14",
            "1.2.7.16"
          ]
        }
      ],
      "practical": [
        {
          "title": "Tjek mønster og skader",
          "action": "Kørelæreren viser hovedmønstret og eventuelle slidindikatorer på alle hjul i bilen. Tjek, at hovedmønstret er mindst 1,6 millimeter, og tjek for synlige skader på dæk og fælge.",
          "refs": [
            "1.2.7.9",
            "1.2.7.10"
          ]
        },
        {
          "title": "Omløbsretning",
          "action": "Find pilen eller anden retningsmarkering på et retningsbestemt dæk sammen med kørelæreren. Tjek den mod hjulets rotation fremad. Kravet gælder kun, når dækket er retningsbestemt.",
          "refs": [
            "1.2.7.11"
          ]
        }
      ],
      "case": {
        "context": "Dækkene har lovlig mønsterdybde, men ét dæk er skævt slidt, og bilen er usædvanligt følsom over for sidevind. Hvilken vurdering følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Skævt slid tyder på fejl. Sidevindsfølsomhed kan pege på forkert dæktryk. Forholdene skal rettes med det samme.",
            "correct": true,
            "why": "Planen gør både skævt slid og unormal styring til fejltegn. Årsagen skal rettes med det samme.",
            "refs": [
              "1.2.7.12",
              "1.2.7.13",
              "1.2.7.15",
              "1.2.7.17",
              "1.2.7.18"
            ]
          },
          {
            "id": "b",
            "text": "Lovlig mønsterdybde betyder, at skævt slid og sidevindsfølsomhed kan vente til næste almindelige service.",
            "correct": false,
            "why": "Mindstekravet til mønsterdybde fjerner ikke de andre fejltegn. Planen siger, at fejlene skal rettes med det samme.",
            "refs": [
              "1.2.7.9",
              "1.2.7.12",
              "1.2.7.13",
              "1.2.7.17",
              "1.2.7.18"
            ]
          },
          {
            "id": "c",
            "text": "Skævt slid løses kun ved at skifte dæk på akslen. Dæktrykket og andre mulige fejl er uden betydning.",
            "correct": false,
            "why": "Planen nævner flere mulige årsager, blandt andet dæktryk, hjulindstilling, bremser og støddæmpere. At skifte dæk løser ikke årsagen alene.",
            "refs": [
              "1.2.7.3",
              "1.2.7.12",
              "1.2.7.15",
              "1.2.7.17"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvad gør du ved skævt slid, selv om mønsterdybden stadig er lovlig?",
        "answer": "Få årsagen undersøgt og rettet med det samme. Den kan være dæktryk, hjulindstilling, bremser, støddæmpere eller andre hjulfejl.",
        "refs": [
          "1.2.7.12",
          "1.2.7.15",
          "1.2.7.17"
        ]
      }
    },
    {
      "id": "karrosseri",
      "title": "Karrosseriet skal være sikkert",
      "pointRef": "1.2.8",
      "zone": "exterior",
      "lead": "Tag, sider, skærme, klapper, døre og vognbund må ikke skabe fare.",
      "objectives": [
        {
          "ref": "1.2.8.1",
          "requirement": "viden",
          "summary": "Vide, at karrosseriet ikke må have skarpe kanter eller fremspring, der unødigt kan skade andre trafikanter."
        },
        {
          "ref": "1.2.8.2",
          "requirement": "viden",
          "summary": "Vide, at skade eller rust ikke må have et omfang, der bringer færdselssikkerheden i fare."
        },
        {
          "ref": "1.2.8.3",
          "requirement": "viden",
          "summary": "Vide, at døre, front- eller motorhjelm og bagageklap skal kunne holdes lukkede med låse under kørsel."
        }
      ],
      "cards": [
        {
          "title": "Ingen farlige kanter",
          "body": "Karrosseriet består blandt andet af tag, sider, skærme, front- eller motorhjelm, bagageklap, døre og vognbund. Delene må ikke have skarpe kanter eller stikke ud. Så skaber de unødig fare for cyklister, gående og andre trafikanter.",
          "refs": [
            "1.2.8.1"
          ]
        },
        {
          "title": "Skade og rust vurderes efter fare",
          "body": "En bule eller en rustplet er ikke i sig selv det afgørende. Spørgsmålet er, om skaden eller rusten er så stor, at karrosseriet er en fare for trafikken. Det er faren, der tæller, ikke hvilken del skaden sidder på.",
          "refs": [
            "1.2.8.2"
          ]
        },
        {
          "title": "Låsene skal holde under kørsel",
          "body": "Døre, front- eller motorhjelm og bagageklap skal have låse, der holder dem lukkede, mens bilen kører. En klap, der ser lukket ud, men ikke bliver fastholdt, kan åbne sig. Så kan den skabe fare eller spærre dit udsyn.",
          "refs": [
            "1.2.8.3"
          ]
        }
      ],
      "practical": [
        {
          "title": "Vurder et tænkt problem med karrosseriet",
          "action": "Ved hvert eksempel afgør du, hvilket krav der er berørt. Eksemplerne er: en skarp, løs pynteliste, en rustskade, der er farlig, og en bagageklap, der ikke kan låses. Forklar den mulige fare i stedet for at stille en diagnose af reparationen.",
          "refs": [
            "1.2.8.1",
            "1.2.8.2",
            "1.2.8.3"
          ]
        }
      ],
      "case": {
        "context": "En bil har en løs, skarp pynteliste, en farlig rustskade og en bagageklap, hvis lås ikke holder. Hvilken observation hører specifikt til låsekravet i punkt 1.2.8.3?",
        "options": [
          {
            "id": "a",
            "text": "Bagageklappens lås kan ikke holde klappen lukket under kørsel.",
            "correct": true,
            "why": "Punkt 1.2.8.3 kræver låse, der kan holde døre, fronthjelm og bagageklap lukkede under kørsel.",
            "refs": [
              "1.2.8.3"
            ]
          },
          {
            "id": "b",
            "text": "Den løse pynteliste har en skarp kant, der kan skade andre trafikanter.",
            "correct": false,
            "why": "Udsagnet beskriver et reelt problem. Men det hører til kravet om skarpe kanter i punkt 1.2.8.1.",
            "refs": [
              "1.2.8.1"
            ]
          },
          {
            "id": "c",
            "text": "Rustskaden er så stor, at den er farlig for færdselssikkerheden.",
            "correct": false,
            "why": "Udsagnet beskriver et reelt problem. Men det hører til kravet om skade og rust i punkt 1.2.8.2.",
            "refs": [
              "1.2.8.2"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvilke tre hovedtyper af karrosserikrav skal du kende?",
        "answer": "Ingen farlige kanter eller fremspring. Ingen skade eller rust, der er farlig. Og låse, der holder døre og klapper lukkede.",
        "refs": [
          "1.2.8.1",
          "1.2.8.2",
          "1.2.8.3"
        ]
      }
    },
    {
      "id": "sikkerhedsseler-udsyn-udstyr",
      "title": "Seler, udsyn og særligt udstyr",
      "pointRef": "1.2.9",
      "zone": "exterior",
      "lead": "Seler, ruder, viskere og spejle skal beskytte dig og give dig udsyn i din bil.",
      "objectives": [
        {
          "ref": "1.2.9.1",
          "requirement": "angive",
          "summary": "Bilen skal normalt have sikkerhedssele på alle siddepladser."
        },
        {
          "ref": "1.2.9.2",
          "requirement": "angive",
          "summary": "Sikkerhedsseler skal være ubeskadigede."
        },
        {
          "ref": "1.2.9.3",
          "requirement": "angive",
          "summary": "Påbudte nakkestøtter må ikke fjernes fra benyttede pladser."
        },
        {
          "ref": "1.2.9.4",
          "requirement": "angive",
          "summary": "Forruden skal normalt være hel og kunne holdes ren med visker og vasker."
        },
        {
          "ref": "1.2.9.5",
          "requirement": "angive",
          "summary": "Bilen skal have indvendigt førerspejl og udvendigt spejl i hver side."
        },
        {
          "ref": "1.2.9.6",
          "requirement": "angive",
          "summary": "Spejle skal være rene og ubeskadigede."
        },
        {
          "ref": "1.2.9.7",
          "requirement": "angive",
          "summary": "Spejle kan erstattes af kamera- og monitorløsning."
        },
        {
          "ref": "1.2.9.8",
          "requirement": "angive",
          "summary": "Medbring en godkendt advarselstrekant til situationer, hvor den skal opstilles."
        },
        {
          "ref": "1.2.9.9",
          "requirement": "angive",
          "summary": "En rude, der ikke kan holdes ren, viser fejl ved visker eller vasker."
        },
        {
          "ref": "1.2.9.10",
          "requirement": "kontrollere",
          "summary": "Kontrollér at der er tilstrækkelig sprinklervæske."
        },
        {
          "ref": "1.2.9.11",
          "requirement": "kontrollere",
          "summary": "Kontrollér at viskerne kan holde forruden ren."
        },
        {
          "ref": "1.2.9.12",
          "requirement": "kontrollere",
          "summary": "Kontrollér korrekt indstillede, rene og hele spejle."
        },
        {
          "ref": "1.2.9.13",
          "requirement": "viden",
          "summary": "Indvendig film på ruder og spejle kan ødelægge udsynet i modlys."
        }
      ],
      "cards": [
        {
          "title": "Sele og nakkestøtte",
          "body": "Bilen skal normalt have sikkerhedssele på alle siddepladser, og selerne skal være uden skader. Påbudte nakkestøtter må ikke fjernes, når pladsen bruges. Beskyttelsen begynder allerede før kørslen. Udstyret skal være til stede og intakt.",
          "refs": [
            "1.2.9.1",
            "1.2.9.2",
            "1.2.9.3"
          ]
        },
        {
          "title": "Ruden skal kunne holdes ren",
          "body": "Forruden skal som hovedregel være hel og uden skader. Viskerne og vaskeren skal kunne holde den ren. Lykkes det ikke, er der fejl i et af systemerne. Det gælder også, selv om udsynet virker fint i tørvejr.",
          "refs": [
            "1.2.9.4",
            "1.2.9.9"
          ]
        },
        {
          "title": "Spejle eller kamera",
          "body": "M1-biler skal have indvendigt og udvendigt førerspejl i hver side. Indvendigt spejl kræves ikke, hvis bilen intet udsyn giver bagud. Højre sidespejl kan undværes på biler registreret før 1. juli 2025, når venstre og indvendigt spejl giver udsyn, bagrude og bageste sideruder har mindst 70 procent lysgennemgang, og bilen ikke er højrestyret. Spejle skal være rene og hele. Et godkendt og mærket kamera med skærm kan erstatte spejlene. Det skal vise de krævede synsfelter uden indstilling og må ikke mindske det direkte udsyn gennem forruden og de forreste sideruder.",
          "refs": [
            "1.2.9.5",
            "1.2.9.6",
            "1.2.9.7"
          ],
          "sourceIds": [
            "plan-b-1-1",
            "dfk-1484"
          ],
          "sourceLocator": "DfK1484 bilag1 pkt.1.01.006,10.03.006(10)a-c og10.03.021(1)a-b, inklusive før01.07.25-forbeholdet; Plan B v1.1 1.2.9, pkt.5-7",
          "figmaIds": [
            "R1-28"
          ]
        },
        {
          "title": "Trekanten skal være ved hånden",
          "body": "Du bør medbringe en godkendt advarselstrekant, så du kan opstille den, når du har pligt til det. Den hjælper ikke, hvis den ligger hjemme i garagen, mens bilen står havareret et andet sted.",
          "refs": [
            "1.2.9.8"
          ]
        },
        {
          "title": "Udsynets skjulte film",
          "body": "Der skal være nok sprinklervæske. Viskerne skal kunne rense ruden, og spejlene skal være hele, rene og rigtigt indstillet. En tynd indvendig film kan være næsten usynlig i gråvejr. Men den kan gøre udsynet meget dårligt ved lav sol eller blændende lygter.",
          "refs": [
            "1.2.9.10",
            "1.2.9.11",
            "1.2.9.12",
            "1.2.9.13"
          ]
        }
      ],
      "practical": [
        {
          "title": "Tjek sprinkler og viskere",
          "action": "Sammen med kørelæreren i undervisningsbilen tjekker du væskemængden efter bilens løsning og instruktionsbogen. Aktiver vaskeren og viskerne, og vurder, om viskerne kan holde forruden ren.",
          "refs": [
            "1.2.9.10",
            "1.2.9.11"
          ]
        },
        {
          "title": "Tjek spejlene",
          "action": "Indstil siddestillingen først. Tjek derefter sammen med kørelæreren, at spejlene eller monitorerne er rene, hele og rigtigt indstillet til din bil. Det praktiske vurderes i bilen.",
          "refs": [
            "1.2.9.12"
          ]
        }
      ],
      "case": {
        "context": "Forruden har en indvendig film, sprinklervæsken er næsten tom, og viskerne bevæger sig. Hvilken vurdering følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Der skal være nok sprinklervæske, viskerne skal kunne holde ruden ren, og filmen bør fjernes, fordi den kan gøre udsynet dårligt i modlys.",
            "correct": true,
            "why": "Planen kræver nok sprinklervæske og fungerende viskere. Den beskriver også, at en indvendig film kan gøre udsynet umuligt i modlys.",
            "refs": [
              "1.2.9.4",
              "1.2.9.9",
              "1.2.9.10",
              "1.2.9.11",
              "1.2.9.13"
            ]
          },
          {
            "id": "b",
            "text": "Viskernes bevægelse er nok alene. Sprinklervæsken kan vente, hvis der ikke er regn i sigte.",
            "correct": false,
            "why": "Kontrollen gælder både nok sprinklervæske og, at viskerne faktisk kan holde forruden ren. Vejret ændrer ikke det.",
            "refs": [
              "1.2.9.4",
              "1.2.9.9",
              "1.2.9.10",
              "1.2.9.11"
            ]
          },
          {
            "id": "c",
            "text": "Den indvendige film er kun relevant ved skader på ruden. Rene spejle kan erstatte en ren forrude.",
            "correct": false,
            "why": "Planen ser filmen som en selvstændig risiko for udsynet i modlys. Spejlkravene erstatter ikke kravet om en forrude, der kan holdes ren.",
            "refs": [
              "1.2.9.4",
              "1.2.9.5",
              "1.2.9.6",
              "1.2.9.13"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvorfor skal du gøre ruden ren indvendigt, selv når den ser fin ud i gråvejr?",
        "answer": "En tynd film kan gøre udsynet meget dårligt ved lav sol eller blændende lygter. I værste fald gør den udsynet umuligt.",
        "refs": [
          "1.2.9.13"
        ]
      }
    },
    {
      "id": "saerlige-koeretoejer",
      "title": "Særlige køretøjer",
      "pointRef": "1.2.10",
      "zone": "documents",
      "lead": "Kategori B dækker flere køretøjstyper. Hver type kan have sine egne krav til indretning og udstyr.",
      "objectives": [
        {
          "ref": "1.2.10.1",
          "requirement": "viden",
          "summary": "Kend at flere B-køretøjer har særregler om mål, vægt, udstyr og tilkobling."
        }
      ],
      "cards": [
        {
          "title": "Flere typer under kategori B",
          "body": "Der kan gælde særregler for varebiler, påhængskøretøjer til person- og varebiler, quadricykler, trehjulede motorcykler, ATV'er, store knallerter, traktorer og motorredskaber. Det gælder, selv om du må køre dem med kategori B. Førerretten gør dem ikke ens.",
          "refs": [
            "1.2.10.1"
          ]
        },
        {
          "title": "Mål og vægt varierer",
          "body": "Reglerne handler især om længde, bredde, tilladt last og tilladt totalvægt. Du kan derfor ikke bruge personbilens grænser. Og du kan ikke gå ud fra, at et køretøj må lastes, fordi der ser ud til at være plads.",
          "refs": [
            "1.2.10.1"
          ]
        },
        {
          "title": "Udstyr følger køretøjet",
          "body": "Bremser, lygter, dæk og spejle kan have særlige regler. For nogle typer gælder krav om styrthjelm, og for påhængskøretøjer gælder særlige krav til tilkobling. Kravene findes i reglerne for den konkrete køretøjstype. Dokumenterne kan støtte dig, når de har relevante oplysninger.",
          "refs": [
            "1.2.10.1"
          ]
        }
      ],
      "practical": [
        {
          "title": "Find typen og dens særkrav",
          "action": "Gennemgå med kørelæreren typen af et konkret køretøj, de relevante dokumenter og reglerne for typen. Peg på krav til mål, vægt, bremser, lygter, dæk, spejle, hjelm eller tilkobling, hvor de er relevante.",
          "refs": [
            "1.2.10.1"
          ]
        }
      ],
      "case": {
        "context": "En bestemt ATV kan føres med kategori B. Hvilken konklusion om indretning og udstyr følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "ATV-typen kan have særregler om blandt andet mål, vægt, bremser, lygter, dæk, spejle og styrthjelm.",
            "correct": true,
            "why": "Planen siger tydeligt, at de nævnte køretøjer kan være omfattet af særlige regler om disse forhold.",
            "refs": [
              "1.2.10.1"
            ]
          },
          {
            "id": "b",
            "text": "ATV-typen følger personbilens udstyrskrav. Den kan dog have en særregel om styrthjelm, hvis den er åben.",
            "correct": false,
            "why": "Særreglerne er ikke begrænset til styrthjelm. De kan også handle om mål, vægt, bremser, lygter, dæk og spejle.",
            "refs": [
              "1.2.10.1"
            ]
          },
          {
            "id": "c",
            "text": "Kategori B betyder, at særregler ophører, når ATV'en er registreret, og dens tilladte totalvægt er kendt.",
            "correct": false,
            "why": "Førerretten og registreringen fjerner ikke typens særlige regler om indretning, udstyr og eventuelt førerudstyr.",
            "refs": [
              "1.2.10.1"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvorfor er kategori B alene ikke nok til at vide, hvilket udstyr et særligt køretøj skal have?",
        "answer": "Køretøjstypen kan have egne regler. Det gælder blandt andet mål, vægt, bremser, lys, dæk, spejle, hjelm og tilkobling.",
        "refs": [
          "1.2.10.1"
        ]
      }
    },
    {
      "id": "registreringsattest",
      "title": "Registreringsattesten viser, hvad bilen må",
      "pointRef": "1.3.1",
      "zone": "documents",
      "lead": "Attesten viser registreringen og de vigtige vægte. Du bruger den til at vurdere bil og påhængskøretøj.",
      "objectives": [
        {
          "ref": "1.3.1.1",
          "requirement": "angive",
          "summary": "Vide, at bilen skal være registreret og have en registreringsattest, samt at mange lande kræver originalen medbragt."
        },
        {
          "ref": "1.3.1.2",
          "requirement": "angive",
          "summary": "Kunne finde egenvægt eller køreklar vægt, tilladt totalvægt, tilladt påhængsvægt og eventuel vogntogsvægt på attesten."
        },
        {
          "ref": "1.3.1.3",
          "requirement": "angive",
          "summary": "Forstå, at registreringsattester bruges til at afgøre, om bil og påhængskøretøj må sammenkobles."
        },
        {
          "ref": "1.3.1.4",
          "requirement": "angive",
          "summary": "Vide, hvilke attester der skal med ved kørsel med påhængskøretøj, og hvilke dokumenter der kræves i udlandet."
        },
        {
          "ref": "1.3.1.5",
          "requirement": "angive",
          "summary": "Vide, at kopier af registreringsattester kan medbringes ved kørsel i Danmark."
        },
        {
          "ref": "1.3.1.6",
          "requirement": "viden",
          "summary": "Vide, at elkøretøjer ofte har lavere lasteevne, fordi deres egenvægt er højere."
        }
      ],
      "cards": [
        {
          "title": "Registrering og dokument",
          "body": "En bil, der bruges efter færdselsloven, skal være registreret og have en registreringsattest. Når du kører i mange andre lande, skal du have originalen med. Før en tur over grænsen skal du derfor tjekke dokumentkravet for de lande, rejsen går gennem.",
          "refs": [
            "1.3.1.1"
          ]
        },
        {
          "title": "Vægtene står på attesten",
          "body": "Registreringsattesten viser bilens egenvægt eller køreklar vægt og den tilladte totalvægt. Den kan også vise, hvor tungt et påhængskøretøj bilen må trække, og den største tilladte vogntogsvægt, hvis der er en. Brug felterne samlet, ikke som løse gæt.",
          "refs": [
            "1.3.1.2"
          ]
        },
        {
          "title": "To køretøjer, to attester",
          "body": "Registreringsattesterne viser, om bilen og påhængskøretøjet må kobles sammen. Ved synsfri sammenkobling skal du have del 1 af begge køretøjers attester med. I Danmark kan kopier bruges. I udlandet skal du have originalerne af del 1 eller en officiel genpart fra Motorstyrelsen. En privat fotokopi tæller ikke. Det betyder ikke, at både del 1 og del 2 skal med. Motorstyrelsen fraråder at have begge dele i bilen, fordi del 2 har kontroloplysninger til omregistrering.",
          "refs": [
            "1.3.1.3",
            "1.3.1.4",
            "1.3.1.5"
          ],
          "sourceIds": [
            "plan-b-1-1",
            "motor-registration"
          ],
          "sourceLocator": "Plan B v1.1 1.3.1, pkt.1 og4-5; Motorstyrelsen Registreringsattest, Hvornår skal du have registreringsattesten med?",
          "figmaIds": [
            "R1-30"
          ]
        },
        {
          "title": "Elbilens vægt påvirker lasten",
          "body": "Elkøretøjer har ofte højere egenvægt og derfor lavere lasteevne. Men det er ikke en regel om, at enhver elbil kan laste mindre end enhver anden bil. Registreringsattesten viser de vægte, der gælder for netop dit køretøj.",
          "refs": [
            "1.3.1.6"
          ]
        }
      ],
      "practical": [
        {
          "title": "Læs en øvelsesattest",
          "action": "Brug en anonymiseret øvelsesattest til at finde egenvægt eller køreklar vægt, tilladt totalvægt, tilladt påhængsvægt og eventuel vogntogsvægt. Forklar derefter, hvilke to attester du skal sammenholde ved en tænkt sammenkobling.",
          "refs": [
            "1.3.1.2",
            "1.3.1.3"
          ]
        },
        {
          "title": "Vælg dokumenter til turen",
          "action": "Sammenlign en tur i Danmark med en tur til udlandet med påhængskøretøj. Peg for hver tur på, hvilke registreringsattester du skal have med, og om du skal have en kopi, originalen eller en genpart fra Motorstyrelsen.",
          "refs": [
            "1.3.1.1",
            "1.3.1.4",
            "1.3.1.5"
          ]
        }
      ],
      "case": {
        "context": "Du planlægger en tur i Danmark og en tur til udlandet med påhængskøretøj. Hvilken sammenligning af registreringsattester følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "I Danmark kan kopier af begge attester medbringes. I udlandet kræves originaler eller en genpart fra Motorstyrelsen.",
            "correct": true,
            "why": "Begge attester skal med ved kørsel med påhængskøretøj. Danmark tillader kopier, mens udlandet kræver originaler eller en officiel genpart.",
            "refs": [
              "1.3.1.4",
              "1.3.1.5"
            ]
          },
          {
            "id": "b",
            "text": "I Danmark er en kopi af bilens attest nok. I udlandet er påhængskøretøjets originale attest alene nok.",
            "correct": false,
            "why": "Ved begge ture skal attesterne for både det trækkende køretøj og påhængskøretøjet med.",
            "refs": [
              "1.3.1.4",
              "1.3.1.5"
            ]
          },
          {
            "id": "c",
            "text": "I Danmark kan kopier af begge attester medbringes. I udlandet er almindelige kopier af begge nok.",
            "correct": false,
            "why": "Danmark tillader kopier. Men i udlandet kræver planen originaler eller en genpart fra Motorstyrelsen.",
            "refs": [
              "1.3.1.4",
              "1.3.1.5"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvilke vægte skal du kunne finde på en registreringsattest?",
        "answer": "Egenvægt eller køreklar vægt, tilladt totalvægt, tilladt vægt for et påhængskøretøj og eventuel største vogntogsvægt.",
        "refs": [
          "1.3.1.2"
        ]
      }
    }
  ]
};
