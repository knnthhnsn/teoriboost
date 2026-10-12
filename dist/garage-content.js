// Originalt dansk læringsindhold. Genereret fra authoring/garage-*.json.
export const GARAGE = {
  "checked": "2026-10-12",
  "sourceId": "plan-b-1-1",
  "scope": "Kildebaseret læringsindhold for kapitel 1. Tekstlig repræsentation og fysisk øveforberedelse; ingen kompetencegodkendelse.",
  "topics": [
    {
      "id": "betjeningsudstyr",
      "title": "Find bilens betjeningsudstyr",
      "pointRef": "1.1.1",
      "zone": "cockpit",
      "lead": "Du skal kende navnet på udstyret og kunne finde det i netop den bil, du undervises i.",
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
          "title": "Kontakterne omkring dig",
          "body": "Ratlås, tænding, elektrisk starter, lys, horn, visker, vasker, ventilation, el-bagrude og spejlindstilling kan være samlet eller placeret forskelligt. Du skal også finde anordninger til fronthjelm, motorhjelm og lågen til bilens drivmiddel. Hjelmbetegnelserne kan dække samme klap eller forskellige klapper i den konkrete bil.",
          "refs": [
            "1.1.1.1",
            "1.1.1.5"
          ]
        },
        {
          "title": "Fødder, hænder og parkering",
          "body": "Pedalerne ligger i fast rækkefølge, men koblingspedalen findes kun i relevante biler. Gearvælgeren kan være mellem sæderne, ved rattet eller på instrumentbordet. Parkeringsbremsen kan være et håndtag, en pedal eller en kontakt. Rattet skal også kunne udpeges uden tøven.",
          "refs": [
            "1.1.1.2",
            "1.1.1.3"
          ]
        },
        {
          "title": "Sele og væskesteder",
          "body": "Selen består ikke kun af spændet: du skal også kunne vise dens fastgørelsespunkter. Under hjelmen skal du kende dækslet til sprinklervæske og de øvrige relevante beholdere i bilen. Nogle elbiler har ikke motorolie eller hydraulisk servostyringsolie, så undervisningsbilen afgør listen.",
          "refs": [
            "1.1.1.4",
            "1.1.1.6"
          ]
        }
      ],
      "practical": [
        {
          "title": "Udpeg kontakter og åbninger i undervisningsbilen",
          "action": "Sammen med kørelæreren og i den standsede undervisningsbil udpeger du én for én ratlås, tænding, elektrisk starter, visker og vasker, horn, lygter, klima, el-bagrude og spejlindstilling. Udpeg også hver betjeningsanordning til fronthjelm, motorhjelm og låge til drivmiddel, som findes i bilen.",
          "refs": [
            "1.1.1.1",
            "1.1.1.5"
          ]
        },
        {
          "title": "Udpeg førerpladsens betjening",
          "action": "Med kørelæreren viser du i undervisningsbilen pedaler, gearplaceringer, parkeringsbremse, rat, selelås og fastgørelsespunkter. Kørelæreren forklarer bilens særlige løsning, før du rører udstyr, der kan sætte bilen i bevægelse.",
          "refs": [
            "1.1.1.2",
            "1.1.1.3",
            "1.1.1.4"
          ]
        },
        {
          "title": "Udpeg relevante væskedæksler",
          "action": "Med motoren slukket og efter kørelærerens anvisning udpeger du sprinklervæske og de olie- eller væskepåfyldninger, som faktisk findes i undervisningsbilen. Åbn ikke varme eller tryksatte beholdere.",
          "refs": [
            "1.1.1.6"
          ]
        }
      ],
      "case": {
        "context": "I undervisningsbilen sidder gearvælgeren ved rattet, og parkeringsbremsen er en kontakt på midterkonsollen. Hvilken gruppe skal du kunne udpege under planpunkt 1.1.1.3?",
        "options": [
          {
            "id": "a",
            "text": "Gearvælger med gearenes placering, parkeringsbremsens betjening og rattet.",
            "correct": true,
            "why": "Punkt 1.1.1.3 samler netop gearvælger og gearplaceringer, parkeringsbremsens betjening og rat.",
            "refs": [
              "1.1.1.3"
            ]
          },
          {
            "id": "b",
            "text": "Gearvælger med gearenes placering, tændingskontakten og rattet.",
            "correct": false,
            "why": "Tændingskontakten skal også udpeges, men den hører til 1.1.1.1; 1.1.1.3 kræver parkeringsbremsens betjening.",
            "refs": [
              "1.1.1.1",
              "1.1.1.3"
            ]
          },
          {
            "id": "c",
            "text": "Gearvælgeren, parkeringsbremsens betjening og sikkerhedsselens fastgørelsespunkter.",
            "correct": false,
            "why": "Sikkerhedsselens fastgørelsespunkter hører til 1.1.1.4, mens 1.1.1.3 også kræver gearplaceringerne og rattet.",
            "refs": [
              "1.1.1.3",
              "1.1.1.4"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvordan viser du, at du kan udpege betjeningsudstyret i undervisningsbilen?",
        "answer": "Du lokaliserer og udpeger de krævede dele i den konkrete bil sammen med kørelæreren.",
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
      "title": "Læs instrumenter og advarsler",
      "pointRef": "1.1.2",
      "zone": "cockpit",
      "lead": "Instrumenter, lamper, displaybeskeder og lyde skal forstås i den konkrete undervisningsbil.",
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
          "title": "Målere fortæller om bilen",
          "body": "Speedometeret viser kørehastigheden. Bilen kan desuden have en omdrejningstæller og en temperaturmåler. Du skal kunne finde, aflæse og forstå de instrumenter, der findes i den konkrete undervisnings- og prøvebil, fordi deres placering og udformning kan variere mellem biler.",
          "refs": [
            "1.1.2.1"
          ]
        },
        {
          "title": "Kontrollys er ikke pynt",
          "body": "Kontrollys kan gælde åbne døre, bilens elektriske system, lygter, blinklys og parkeringsbremse. Andre varsler gælder ABS, ESC, motor, airbag, bremsesystem og eventuelt olietryk. I undervisningsbilen skal du lære hvert relevant symbols betydning og den reaktion, som situationen kræver.",
          "refs": [
            "1.1.2.2"
          ]
        },
        {
          "title": "Display og lyd kræver vurdering",
          "body": "En besked eller alarmlyd kan handle om kørsel, miljø eller sikkerhed. Læs hele beskeden, find det tilhørende symbol og reager efter bilens anvisning og kørelærerens instruktion. Et højt bip er ikke automatisk farligere end et stille symbol; betydningen skal forstås.",
          "refs": [
            "1.1.2.3"
          ]
        }
      ],
      "practical": [
        {
          "title": "Aflæs undervisningsbilens instrumenter",
          "action": "I den standsede undervisningsbil gennemgår du sammen med kørelæreren speedometer, eventuelle øvrige målere samt de kontrollys, displaybeskeder og lydalarmer, bilen kan vise. Du forklarer betydning og nødvendig reaktion.",
          "refs": [
            "1.1.2.1",
            "1.1.2.2",
            "1.1.2.3"
          ]
        }
      ],
      "case": {
        "context": "Kørelæreren beder dig skelne kontrollys i 1.1.2.2 fra målere i 1.1.2.1 og øvrige displayoplysninger i 1.1.2.3. Hvilken gruppe består kun af kontrollys fra 1.1.2.2?",
        "options": [
          {
            "id": "a",
            "text": "Kontrollys for ABS, ESC og airbag.",
            "correct": true,
            "why": "ABS, ESC og airbag er alle udtrykkeligt med i kontrolområderne under 1.1.2.2.",
            "refs": [
              "1.1.2.2"
            ]
          },
          {
            "id": "b",
            "text": "Speedometer, temperaturmåler og kontrollys for motor.",
            "correct": false,
            "why": "Motorlampen hører til 1.1.2.2, men speedometer og temperaturmåler er instrumenter under 1.1.2.1.",
            "refs": [
              "1.1.2.1",
              "1.1.2.2"
            ]
          },
          {
            "id": "c",
            "text": "Omdrejningstæller, dørlukning og en relevant akustisk alarm.",
            "correct": false,
            "why": "Dørlukning hører til 1.1.2.2, men omdrejningstælleren ligger i 1.1.2.1 og akustiske alarmer i 1.1.2.3.",
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
        "answer": "Du skal kunne forbinde symbolet med dets betydning og vide, hvilken reaktion der er nødvendig i den konkrete bil.",
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
      "lead": "Forstå den enkle kraftvej i forbrændingsbil, elbil og hybrid uden at gøre dig til mekaniker.",
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
          "title": "Forbrændingsmotorens kraftvej",
          "body": "I en forbrændingsmotor antændes en blanding af luft og brændstof. Det bevæger stemplerne. Deres bevægelse omdannes til rotation i krumtappen, og rotationen føres videre gennem kobling og gear til hjulene. Speederen regulerer motorens omdrejninger, ikke direkte hjulenes fart.",
          "refs": [
            "1.1.3.1",
            "1.1.3.2",
            "1.1.3.3"
          ]
        },
        {
          "title": "Startmotoren låner strøm",
          "body": "En forbrændingsmotor kommer i gang med hjælp fra en elektrisk startmotor, som får strøm fra batteriet. Når motoren er startet, skal nøgle eller startknap slippes med det samme. Ellers fortsætter startmotoren unødigt og kan tage skade.",
          "refs": [
            "1.1.3.4",
            "1.1.3.5"
          ]
        },
        {
          "title": "Elbil og hybrid er forskellige",
          "body": "En elbil drives af en elmotor, der får strøm fra bilens batteri. I en hybrid kan elmotoren være kombineret med en forbrændingsmotor. Derfor skal du skelne mellem ren elektrisk drift og en drivlinje, hvor to motortyper indgår.",
          "refs": [
            "1.1.3.6",
            "1.1.3.7"
          ]
        }
      ],
      "practical": [
        {
          "title": "Følg kraftvejen på en skitse",
          "action": "Peg på energikilden og forklar mundtligt vejen frem mod hjulene for henholdsvis en forbrændingsbil, en elbil og en hybrid. Brug biltype som første spørgsmål, så startmotor og kobling ikke fejlagtigt overføres til alle biler.",
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
        "context": "Både en forbrændingsbil og en elbil har et batteri, men batteriets rolle er ikke den samme. Hvilken forklaring stemmer med Plan B?",
        "options": [
          {
            "id": "a",
            "text": "I forbrændingsbilen forsyner batteriet startmotoren; i elbilen forsyner batteriet den motor, der driver bilen.",
            "correct": true,
            "why": "Planen beskriver batteristrøm til forbrændingsmotorens startmotor og batteristrøm til elbilens drivende elmotor.",
            "refs": [
              "1.1.3.4",
              "1.1.3.6",
              "1.1.3.7"
            ]
          },
          {
            "id": "b",
            "text": "I forbrændingsbilen driver batteriet hjulene gennem gear; i elbilen bruges batteriet kun under motorstart.",
            "correct": false,
            "why": "Forbrændingsmotorens bevægelse føres gennem kobling og gear, mens elbilens batteri leverer strøm til elmotoren under drift.",
            "refs": [
              "1.1.3.2",
              "1.1.3.4",
              "1.1.3.7"
            ]
          },
          {
            "id": "c",
            "text": "I forbrændingsbilen antænder batteriet brændstoffet direkte; i elbilen drejer batteriet en startmotor ved igangsætning.",
            "correct": false,
            "why": "Planen knytter forbrændingsbilens batteri til den elektriske startmotor og elbilens batteri til den drivende elmotor.",
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
        "prompt": "Hvad sker der mellem stemplernes bevægelse og hjulenes bevægelse i en forbrændingsbil?",
        "answer": "Stempelbevægelsen bliver til rotation i krumtappen, som føres videre gennem kobling og gear til hjulene.",
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
      "lead": "Koblingen styrer forbindelsen mellem motor og gearkasse i biler med manuel koblingspedal.",
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
          "title": "Forbindelsen kan åbnes",
          "body": "Koblingen forbinder motor og gearkasse eller skiller dem ad. Grundideen er, at en plade kan presses mod en roterende del ved krumtappen, så bevægelsen går videre til gearkassen. Når koblingspedalen trædes helt ned, afbrydes forbindelsen.",
          "refs": [
            "1.1.4.1",
            "1.1.4.2",
            "1.1.4.3"
          ]
        },
        {
          "title": "Pedalen beskytter og blødgør",
          "body": "I en bil med koblingspedal kan pedalen trædes helt i bund under motorstart for at skåne startmotoren. Ved gearskift skal den helt i bund, så gearkassen ikke beskadiges. Når pedalen løftes langsomt, føres motorkraften blødt videre til hjulene.",
          "refs": [
            "1.1.4.4",
            "1.1.4.5"
          ]
        },
        {
          "title": "Hydraulik og biltype",
          "body": "Nogle manuelle koblinger bruger hydraulik, og så skal væskeniveauet være tilstrækkeligt. Biler med automatgear og elbiler har ingen koblingspedal. Det betyder ikke, at alle transmissioner er ens; kun at føreren ikke betjener en særskilt koblingspedal.",
          "refs": [
            "1.1.4.6",
            "1.1.4.7"
          ]
        }
      ],
      "practical": [
        {
          "title": "Forklar tre koblingstilstande",
          "action": "Beskriv med ord, hvad der sker mellem motor og gearkasse, når koblingspedalen er oppe, helt nede og løftes langsomt. Afslut med at forklare, hvorfor øvelsen ikke passer til en elbil eller en bil uden koblingspedal.",
          "refs": [
            "1.1.4.1",
            "1.1.4.3",
            "1.1.4.5",
            "1.1.4.7"
          ]
        }
      ],
      "case": {
        "context": "I en bil med koblingspedal skal du forklare, hvad der sker under et gearskift. Hvilken rækkefølge følger koblingens funktion i Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Pedalen trædes i bund, forbindelsen afbrydes, gearet skiftes, og pedalen løftes langsomt for blød overførsel.",
            "correct": true,
            "why": "Fuld nedtrædning afbryder forbindelsen til gearkassen, og langsom opløftning overfører bevægelsen blødt efter skiftet.",
            "refs": [
              "1.1.4.3",
              "1.1.4.4",
              "1.1.4.5"
            ]
          },
          {
            "id": "b",
            "text": "Pedalen trædes halvt ned, forbindelsen bevares delvist, gearet skiftes, og pedalen løftes hurtigt for blød overførsel.",
            "correct": false,
            "why": "Planen kræver pedalen i bund under gearskift og langsom opløftning; halv nedtrædning og hurtig opløftning matcher ikke funktionen.",
            "refs": [
              "1.1.4.3",
              "1.1.4.4",
              "1.1.4.5"
            ]
          },
          {
            "id": "c",
            "text": "Pedalen trædes i bund, forbindelsen forstærkes, gearet skiftes, og pedalen holdes nede for blød overførsel.",
            "correct": false,
            "why": "Nedtrædning afbryder forbindelsen i stedet for at forstærke den, og bevægelsen overføres først blødt, når pedalen løftes langsomt.",
            "refs": [
              "1.1.4.1",
              "1.1.4.3",
              "1.1.4.5"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvorfor løftes koblingspedalen langsomt efter et gearskift?",
        "answer": "For at føre motorens roterende bevægelse blødt videre gennem gearkassen til hjulene.",
        "refs": [
          "1.1.4.5"
        ]
      }
    },
    {
      "id": "gear",
      "title": "Gear til kraft, fart og bakning",
      "pointRef": "1.1.5",
      "zone": "powertrain",
      "lead": "Gearkassen tilpasser motorens rotation til den trækkraft og bevægelse, bilen har brug for.",
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
          "body": "Gearkassen ændrer, hvordan motorens roterende bevægelse overføres til hjulene. I den enkle forklaring griber tandhjul i forskellige størrelser ind i hinanden. Føreren vælger gear i en manuel bil, mens en automatisk transmission foretager valget automatisk.",
          "refs": [
            "1.1.5.1",
            "1.1.5.2"
          ]
        },
        {
          "title": "Lave gear giver trækkraft",
          "body": "Lave gear passer til igangsætning, acceleration, langsom kørsel og stejle bakker, hvor bilen har brug for stor trækkraft. Det gælder både opad og nedad. Valget handler altså ikke kun om lav fart, men om den kraft og kontrol situationen kræver.",
          "refs": [
            "1.1.5.3"
          ]
        },
        {
          "title": "Høje gear og bakgear",
          "body": "Højere gear bruges ved højere fart og kan skåne motoren samt begrænse brændstofforbruget i en forbrændingsbil. Bakgear sørger for bevægelse baglæns. Automatgear kan vise valgene på en anden måde, men føreren skal stadig forstå forskellen på fremad og bak.",
          "refs": [
            "1.1.5.4",
            "1.1.5.5"
          ]
        }
      ],
      "practical": [
        {
          "title": "Vælg gearidé til situationen",
          "action": "Sorter fem tænkte situationer i behov for lavt gear, højt gear eller bakgear: igangsætning, stejl nedkørsel, rolig kørsel ved højere fart, langsom fremdrift og baglæns placering. Forklar valget ud fra trækkraft og bevægelsesretning.",
          "refs": [
            "1.1.5.3",
            "1.1.5.4",
            "1.1.5.5"
          ]
        }
      ],
      "case": {
        "context": "Du skal koble hver geartype til den anvendelse, som Plan B beskriver. Hvilken samlet kobling er korrekt?",
        "options": [
          {
            "id": "a",
            "text": "Lavt gear ved igangsætning og stejle bakker, højt gear ved høj fart og bakgear baglæns.",
            "correct": true,
            "why": "Lave gear giver den ønskede trækkraft, høje gear bruges ved høj fart, og bakgear muliggør baglæns kørsel.",
            "refs": [
              "1.1.5.3",
              "1.1.5.4",
              "1.1.5.5"
            ]
          },
          {
            "id": "b",
            "text": "Lavt gear ved igangsætning, højt gear på stejle bakker og bakgear ved kørsel baglæns.",
            "correct": false,
            "why": "Igangsætning og bakgear er parret rigtigt, men en stejl bakke hører til anvendelserne for lave gear, ikke høje.",
            "refs": [
              "1.1.5.3",
              "1.1.5.4",
              "1.1.5.5"
            ]
          },
          {
            "id": "c",
            "text": "Lavt gear på stejle bakker, højt gear ved lav hastighed og bakgear ved kørsel baglæns.",
            "correct": false,
            "why": "Stejl bakke og bakgear er parret rigtigt, men planen knytter høje gear til høj hastighed, ikke lav hastighed.",
            "refs": [
              "1.1.5.3",
              "1.1.5.4",
              "1.1.5.5"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvornår er et lavere gear typisk relevant?",
        "answer": "Når bilen skal have stor trækkraft eller køre langsomt, eksempelvis ved igangsætning, acceleration eller en stejl bakke.",
        "refs": [
          "1.1.5.3"
        ]
      }
    },
    {
      "id": "foererassistentsystemer",
      "title": "Assistenter hjælper, men overtager ikke ansvaret",
      "pointRef": "1.1.6",
      "zone": "cockpit",
      "lead": "Lær systemernes typiske hjælp, deres sanser og grænser samt bilens konkrete signaler.",
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
          "title": "Bilen sanser gennem teknik",
          "body": "Planen beskriver alle nyere biler som udstyret med førerassistenter, der kan vejlede eller gribe ind i faresituationer. Den beskriver kameraer, sensorer og radarer som fælles teknologier bag overvågningen. Det betyder ikke, at hvert system bruger alle tre samtidigt; mulige indgreb sker via bremser eller styring.",
          "refs": [
            "1.1.6.1",
            "1.1.6.2"
          ]
        },
        {
          "title": "Afstand, blind vinkel og vognbane",
          "body": "Adaptiv fartpilot kan tilpasse afstand og hastighed til forankørende. Blindvinkelassistent kan advare om trafikanter ved siden af bilen, og vognbaneassistent kan reagere, hvis bilen forlader en markeret bane. Advarsler kan være lys, lyd eller vibration; visse systemer kan også gribe ind.",
          "refs": [
            "1.1.6.3a",
            "1.1.6.3b",
            "1.1.6.3c"
          ]
        },
        {
          "title": "Parkering og nødbremsning",
          "body": "Parkeringssensorer vurderer afstand og advarer med lyd eller lys. En parkeringsassistent kan i nogle biler udføre bestemte parkeringsbevægelser. Frontalkollisions- og nødbremseassistent kan advare om sammenstødsrisiko og i faresituationer bremse automatisk, også ved visse parkerings- eller bakkemanøvrer.",
          "refs": [
            "1.1.6.3d",
            "1.1.6.3e"
          ]
        },
        {
          "title": "Træthed, tavler og lys",
          "body": "Træthedsregistrering kan advare med lyd, lys eller vibration. En tavleassistent kan vise genkendte tavler og sammen med adaptiv fartpilot ændre hastigheden efter dem. Lysassistenten kan tilpasse nær- og fjernlys. Systemer kan vise forkert, så føreren skal fortsat observere og bevare ansvaret.",
          "refs": [
            "1.1.6.3f",
            "1.1.6.3g",
            "1.1.6.3h",
            "1.1.6.4"
          ]
        },
        {
          "title": "Kritisk fører, fuldt ansvar",
          "body": "Et system kan overse noget, misforstå omgivelserne eller give en misvisende oplysning. Føreren har stadig ansvaret for kørslen og kan ikke henvise til assistenten efter en forseelse eller et uheld. Bekvemmeligheden kan desuden øge uopmærksomheden, så aktiv overvågning er nødvendig.",
          "refs": [
            "1.1.6.4",
            "1.1.6.5"
          ]
        },
        {
          "title": "Lær præcis den bil, du skal køre",
          "body": "Systemnavne, symboler, lyde, indstillinger og indgreb varierer mellem biler. Du skal derfor kunne aflæse og forstå samtlige førerassistenter i undervisnings- og prøvebilen. Gennemgå både systemernes status og de nødvendige reaktioner med kørelæreren i den konkrete bil.",
          "refs": [
            "1.1.6.6"
          ]
        }
      ],
      "practical": [
        {
          "title": "Gennemgå undervisningsbilens assistenter",
          "action": "I den standsede undervisningsbil åbner kørelæreren bilens relevante visninger og gennemgår hvert installeret førerassistentsystem. Du aflæser symboler og status, forklarer advarsler og beskriver, hvordan føreren skal reagere.",
          "refs": [
            "1.1.6.6"
          ]
        },
        {
          "title": "Kobl signal til system uden at aktivere kørsel",
          "action": "Med kørelæreren matcher du bilens egne symboler og indstillinger til de systemtyper, bilen faktisk har. I taler også om systemer, bilen ikke har, så fravær ikke forveksles med fejl. Øvelsen udføres uden at fremkalde farlige situationer.",
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
        "context": "Tavleassistenten viser en anden hastighed end den tavle, føreren netop har observeret. Hvilket udsagn om systemet og ansvaret følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Systemet kan vise forkert; føreren vurderer tavlen og beholder ansvaret, også ved automatisk hastighedsændring.",
            "correct": true,
            "why": "Tavleassistenten kan kobles med adaptiv fartpilot, men fejlmuligheden består, og føreren fritages ikke for ansvar.",
            "refs": [
              "1.1.6.3g",
              "1.1.6.4"
            ]
          },
          {
            "id": "b",
            "text": "Systemet kan vise forkert; føreren sænker farten, men fartpiloten overtager ansvaret for tavlefortolkningen.",
            "correct": false,
            "why": "At sænke farten kan være forsigtigt, men ingen førerassistent overtager førerens ansvar for kørslen eller tavlefortolkningen.",
            "refs": [
              "1.1.6.3g",
              "1.1.6.4"
            ]
          },
          {
            "id": "c",
            "text": "Systemet kan vise forkert; føreren afbryder funktionen, hvorefter den viste tavleinformation får forrang.",
            "correct": false,
            "why": "Afbrydelse kan være en forsigtig handling, men displayets oplysning får ikke forrang, og førerens ansvar består fortsat.",
            "refs": [
              "1.1.6.4"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvad ændrer en aktiv førerassistent ved førerens ansvar?",
        "answer": "Ingenting: føreren skal fortsat observere, vurdere og handle og kan ikke overlade ansvaret til systemet.",
        "refs": [
          "1.1.6.4",
          "1.1.6.5"
        ]
      }
    },
    {
      "id": "ansvar-for-bilens-stand",
      "title": "Ansvar for bilens stand",
      "pointRef": "1.2.1",
      "zone": "documents",
      "lead": "Lovlighed og sikkerhed er to nært beslægtede ansvar, som skal være afklaret før og under kørslen.",
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
          "body": "Ejeren eller den registrerede bruger har ansvaret for, at bilen er lovlig. Føreren har ansvaret for, at den er sikkerhedsmæssigt forsvarlig. En lånt bil flytter derfor ikke førerens pligt til at reagere på fejl, som kan gøre turen farlig.",
          "refs": [
            "1.2.1.1"
          ]
        },
        {
          "title": "Opmærksom hele turen",
          "body": "Førerens kontrol slutter ikke, når bilen starter. Styring, bremser, lygter og horn skal fungere sikkert og efter reglerne, og en trailer skal være forsvarligt koblet. Nye lyde, lamper eller ændret adfærd undervejs kræver en konkret vurdering.",
          "refs": [
            "1.2.1.2",
            "1.2.1.3"
          ]
        },
        {
          "title": "Støj og udledning tæller også",
          "body": "Føreren skal være opmærksom på unødig støj og på fejl ved motor eller forureningsbegrænsende udstyr, som påvirker udledningen. Usædvanlig røg eller lyd er derfor ikke blot bilens humør; det kan være et tegn på ulovlig eller uforsvarlig stand.",
          "refs": [
            "1.2.1.4"
          ]
        }
      ],
      "practical": [
        {
          "title": "Ansvarsrunden",
          "action": "Gå bilen rundt sammen med kørelæreren, peg på de områder føreren skal følge, og forklar ansvarsdelingen. Kørelæreren stiller spørgsmål til ejerens, brugerens og førerens ansvar ved den konkrete bil.",
          "refs": [
            "1.2.1.1",
            "1.2.1.2",
            "1.2.1.3",
            "1.2.1.4"
          ]
        }
      ],
      "case": {
        "context": "En lovligt registreret bil lånes med påhængskøretøj. Hvilken ansvarsfordeling gengiver Plan B præcist?",
        "options": [
          {
            "id": "a",
            "text": "Ejeren eller brugeren svarer for lovlig stand; føreren svarer for sikker stand og forsvarlig trailerkobling.",
            "correct": true,
            "why": "Planen deler ansvaret netop sådan og pålægger føreren særskilt at sikre en forsvarlig tilkobling ved kørsel med påhængskøretøj.",
            "refs": [
              "1.2.1.1",
              "1.2.1.2",
              "1.2.1.3"
            ]
          },
          {
            "id": "b",
            "text": "Føreren svarer for både lovlig og sikker stand; ejeren svarer kun for bilens registreringsoplysninger.",
            "correct": false,
            "why": "Planen lægger den lovlige stand hos ejeren eller den registrerede bruger, mens føreren har ansvaret for den sikkerhedsmæssigt forsvarlige stand.",
            "refs": [
              "1.2.1.1",
              "1.2.1.2"
            ]
          },
          {
            "id": "c",
            "text": "Ejeren svarer for begge forhold, indtil føreren under kørslen bliver opmærksom på en konkret fejl.",
            "correct": false,
            "why": "Førerens ansvar gælder ikke først efter en opdaget fejl; føreren skal hele tiden være opmærksom på bilens sikkerhedsmæssige stand.",
            "refs": [
              "1.2.1.1",
              "1.2.1.2"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvem har ansvaret, når en lovlig bil udvikler en sikkerhedsrelevant fejl under kørslen?",
        "answer": "Føreren skal opdage og reagere på, at bilen ikke længere er sikkerhedsmæssigt forsvarlig, selv om ejeren har ansvaret for den lovlige stand.",
        "refs": [
          "1.2.1.1",
          "1.2.1.2"
        ]
      }
    },
    {
      "id": "styreapparat",
      "title": "Styreapparat",
      "pointRef": "1.2.2",
      "zone": "cockpit",
      "lead": "Styringen skal overføre rattets bevægelser præcist og uden unødig modstand, slør eller mislyde.",
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
          "body": "Når rattet drejes, føres bevægelsen gennem styreapparatets forbindelser og led til forhjulene. Under kørsel søger styringen normalt tilbage mod ligeud, når grebet lettes. Funktionen hjælper bilen med at følge en stabil linje, men føreren skal bevare kontrollen.",
          "refs": [
            "1.2.2.1",
            "1.2.2.2"
          ]
        },
        {
          "title": "Servo og ESC har forskellige roller",
          "body": "Hydraulisk eller elektrisk servo gør rattet lettere at dreje. Nyere biler skal have ESC, som kan bremse ét eller flere hjul for at mindske udskridning eller væltning, især i sving. Et servosvigt gør styringen tungere; fortsat kørsel kan være uforsvarlig og ulovlig.",
          "refs": [
            "1.2.2.3",
            "1.2.2.4"
          ]
        },
        {
          "title": "Lovkravet kan mærkes",
          "body": "Styreapparatet skal gøre bilen let, sikker og hurtig at styre. Der må ikke være væsentligt slør. Ved lav fart skal rattet kunne drejes fra side til side uden ujævn modstand eller mislyde, som kan afsløre en fejl.",
          "refs": [
            "1.2.2.5",
            "1.2.2.6",
            "1.2.2.7"
          ]
        },
        {
          "title": "Ratslør og servovæske",
          "body": "Ved kontrol skal hjulene straks følge rattets bevægelse. Har bilen servostyring, skal servoen være aktiveret. En eventuel servobeholder kontrolleres efter fabrikantens forskrift, typisk mellem min- og maxmærket eller ved at sikre, at den relevante kontrollampe ikke lyser.",
          "refs": [
            "1.2.2.8",
            "1.2.2.9"
          ]
        },
        {
          "title": "Fejlene fortæller en historie",
          "body": "Tung styring kan skyldes for lidt servovæske, en slidt eller knækket drivrem eller fejl i elektrisk servo. Følger hjulene ikke rattet straks, kan der være slør. For lidt væske eller væsentligt ratslør kræver eftersyn.",
          "refs": [
            "1.2.2.10",
            "1.2.2.11",
            "1.2.2.12"
          ]
        }
      ],
      "practical": [
        {
          "title": "Kontrollér ratslør",
          "action": "På en holdende bil og efter kørelærerens anvisning: aktivér eventuel servo, bevæg rattet lidt, og se udefra om forhjulene straks følger rattets bevægelse.",
          "refs": [
            "1.2.2.8"
          ]
        },
        {
          "title": "Kontrollér servosystemet",
          "action": "Find med kørelæreren bilens relevante servokontrol: væskebeholder med min- og maxmærke eller kontrollampe efter fabrikantens forskrift. Metoden afhænger af bilen, og den fysiske udførelse vurderes ved bilen.",
          "refs": [
            "1.2.2.9"
          ]
        }
      ],
      "case": {
        "context": "På en bil med aktiveret servo følger forhjulene ikke straks en lille ratbevægelse. Hvilken vurdering gengiver Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Det kan være slør i styreforbindelserne; ved væsentligt ratslør skal styreapparatet efterses.",
            "correct": true,
            "why": "Hjulene skal normalt følge rattets bevægelse straks. Forsinket reaktion kan vise slør, og væsentligt ratslør udløser krav om eftersyn.",
            "refs": [
              "1.2.2.8",
              "1.2.2.11",
              "1.2.2.12"
            ]
          },
          {
            "id": "b",
            "text": "Det er normalt ved servostyring, hvis rattet ellers kan drejes uden mislyde ved lav fart.",
            "correct": false,
            "why": "Aktiveret servo er netop forudsætningen for ratslørskontrollen. Let styring uden mislyd ophæver ikke kravet om, at hjulene straks følger rattet.",
            "refs": [
              "1.2.2.7",
              "1.2.2.8",
              "1.2.2.11"
            ]
          },
          {
            "id": "c",
            "text": "Det peger alene på for lidt servovæske; styreforbindelserne kræver derfor ikke nærmere eftersyn.",
            "correct": false,
            "why": "For lidt servovæske kan give tung styring, men forsinket hjulreaktion er særskilt tegn på slør i styreforbindelserne.",
            "refs": [
              "1.2.2.9",
              "1.2.2.10",
              "1.2.2.11"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvordan kontrolleres ratslør i en bil med servostyring?",
        "answer": "Med servoen aktiveret bevæges rattet, mens man ser, om forhjulene straks følger rattets bevægelse.",
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
      "lead": "Bremsernes funktion, kontrollamper og fysiske kontrol skal tilsammen afsløre fejl, før sikkerheden svigter.",
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
          "body": "Når pedalen trædes ned, skaber hovedcylinderen væsketryk, som føres gennem rør og slanger til hjulbremserne. Belægninger presses mod skiver eller tromler. En forstærker hjælper føreren; svigter den, kan fortsat kørsel være uforsvarlig og ulovlig.",
          "refs": [
            "1.2.3.1",
            "1.2.3.2"
          ]
        },
        {
          "title": "Kredse og nødbremse",
          "body": "Tokredsbremsen har to adskilte kredse. Hvis én bliver utæt, kan den anden yde nødbremsevirkning, men fortsat kørsel er uforsvarlig og ulovlig. Nødbremsen skal kunne bremse bilen sikkert, hvis driftsbremsen svigter under kørslen.",
          "refs": [
            "1.2.3.3",
            "1.2.3.12"
          ]
        },
        {
          "title": "ABS, assistent og ESC",
          "body": "Hjulfølere sender hjulenes omdrejninger til en elektronisk styreboks, som regulerer bremsetrykket og modvirker blokering. Reguleringen giver vibrationer i pedalen og muliggør i en vis udstrækning styring under bremsning. Bremseassistent hjælper ved kraftig opbremsning. Vedvarende ABS-lampe tillader kun kørsel til nærmeste værksted; konstant ESC-lampe kræver fabrikantens anvisning.",
          "refs": [
            "1.2.3.4",
            "1.2.3.6",
            "1.2.3.22",
            "1.2.3.23"
          ]
        },
        {
          "title": "Elbilens særlige bremser",
          "body": "One-pedal-funktion findes på elbiler og kan ofte slås til og fra. Når speederen løftes, aktiveres regenerativ bremsning, som samtidig lader batteriet. Er virkningen utilstrækkelig, skal bremsepedalen bruges. Elbilens bremser kræver mere vedligeholdelsesopmærksomhed for at bevare en effektiv funktion.",
          "refs": [
            "1.2.3.7",
            "1.2.3.8"
          ]
        },
        {
          "title": "Tre bremsekrav",
          "body": "Driftsbremsen skal virke på alle hjul og bremse sikkert, hurtigt og virksomt ved alle hastigheder og belastninger. Parkeringsbremsen skal holde bilen på hældende vej og kan være elektrisk. En hydraulisk driftsbremse kan være vakuum- eller elektrisk forstærket.",
          "refs": [
            "1.2.3.5",
            "1.2.3.9",
            "1.2.3.10",
            "1.2.3.11"
          ]
        },
        {
          "title": "Pedal og væske",
          "body": "Ved fysisk kontrol må bremsepedalen ikke gå i bund ved hårdt tryk eller normalt synke under et konstant tryk. Bremsevæsken skal stå mellem min- og maxmærket, eller den tilhørende kontrollampe skal være slukket. Pedalvandringen varierer mellem biler.",
          "refs": [
            "1.2.3.13",
            "1.2.3.14",
            "1.2.3.15"
          ]
        },
        {
          "title": "Fejl mærkes i bilen",
          "body": "Skævtrækning, hug, ujævn bremsning eller pludseligt længere pedalvandring er fejltegn. Fugt efter bilvask kan kortvarigt påvirke belægningerne, men vedvarende afvigelser, for lidt væske eller en tændt bremselampe kræver straks eftersyn.",
          "refs": [
            "1.2.3.16",
            "1.2.3.17",
            "1.2.3.18",
            "1.2.3.19",
            "1.2.3.20",
            "1.2.3.21"
          ]
        }
      ],
      "practical": [
        {
          "title": "Kontrollér pedalvandring",
          "action": "I den holdende bil og efter kørelærerens anvisning: tryk hårdt på pedalen og hold derefter et konstant tryk. Vurder, om pedalen går i bund eller normalt synker under det konstante tryk.",
          "refs": [
            "1.2.3.13",
            "1.2.3.14"
          ]
        },
        {
          "title": "Kontrollér bremsevæske",
          "action": "Find med kørelæreren beholderens min- og maxmærker eller den relevante kontrollampe. Følg bilens løsning uden værktøj; den fysiske kontrol skal læres og vurderes på den konkrete bil.",
          "refs": [
            "1.2.3.15"
          ]
        }
      ],
      "case": {
        "context": "ABS-lampen slukker ikke kort efter igangsætning. Hvilken kørselsadgang angiver Plan B præcist for denne fejl?",
        "options": [
          {
            "id": "a",
            "text": "Planen tillader kun kørsel direkte til nærmeste værksted, fordi bilens bremseegenskaber er ændret.",
            "correct": true,
            "why": "En ABS-lampe, der ikke slukker kort efter igangsætning, er tegn på fejl; Plan B afgrænser kørslen til nærmeste værksted.",
            "refs": [
              "1.2.3.4",
              "1.2.3.22"
            ]
          },
          {
            "id": "b",
            "text": "Planen forbyder al egen kørsel og kræver transport af bilen direkte til et værksted.",
            "correct": false,
            "why": "Det er lovligt at lade bilen stå, men udsagnet gengiver ikke planen: den tillader den snævert afgrænsede kørsel til nærmeste værksted.",
            "refs": [
              "1.2.3.4",
              "1.2.3.22"
            ]
          },
          {
            "id": "c",
            "text": "Planen tillader forsigtige nødvendige ture, hvis føreren undgår hårde opbremsninger og holder lav hastighed.",
            "correct": false,
            "why": "Planen giver ikke en generel adgang til nødvendige ture; den eneste angivne fortsatte kørsel er til nærmeste værksted.",
            "refs": [
              "1.2.3.4",
              "1.2.3.22"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvad gør du, hvis bremsepedalen pludselig kan trædes længere ned end sædvanligt?",
        "answer": "Det er tegn på en defekt bremsekreds. Bremserne skal straks efterses, og normal videre kørsel er ikke forsvarlig.",
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
      "lead": "Bilens lys skal både oplyse vejen og gøre køretøjet tydeligt uden at blænde andre.",
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
          "title": "Det obligatoriske lyssæt",
          "body": "Bilen skal have to fjernlys, to asymmetriske nærlys, to positionslys, to baglys, normalt tre stoplys, mindst ét nummerpladelys, blinklys foran, bagpå og på siderne samt to røde, godkendte, mærkede og ikke-trekantede bagreflekser.",
          "refs": [
            "1.2.4.1",
            "1.2.4.2"
          ]
        },
        {
          "title": "Tre afstande og én plade",
          "body": "Fjernlys skal oplyse mindst 100 meter frem. Nærlys skal nå mindst 30 meter uden at blænde. Positionslys skal kunne ses mindst 300 meter væk. Nummerpladelyset skal gøre den bageste plade læselig mindst 20 meter bag bilen.",
          "refs": [
            "1.2.4.3",
            "1.2.4.9"
          ]
        },
        {
          "title": "Farver og par",
          "body": "Forlygter skal lyse hvidt eller gulligt, mens baglygter skal lyse rødt. Pærer skal sidde korrekt, og lygter i samme par skal have ens farve og lysstyrke. Alle lygter og reflekser skal være hele, rene og funktionsdygtige.",
          "refs": [
            "1.2.4.4",
            "1.2.4.5",
            "1.2.4.6",
            "1.2.4.7",
            "1.2.4.8"
          ]
        },
        {
          "title": "Lange biler",
          "body": "En bil over 6 meter skal have godkendte og mærkede gule sidereflekser samt sidemarkeringslygter fordelt på siderne. Kravet er knyttet til bilens længde og skal ikke forveksles med de supplerende reflekser, som kan være tilladt på andre biler.",
          "refs": [
            "1.2.4.10"
          ]
        },
        {
          "title": "Tilladte ekstra lygter og reflekser",
          "body": "Tilladt ekstraudstyr omfatter ekstra fjernlys, kørelys, ekstra stop- og baglygter, tågeforlygter, baklygter, tågebaglygter, søge- og arbejdslygter, afmærknings- og markeringslygter, parkeringslygter og overhalingsblink. Desuden må bilen have hvide reflekser foran, gule på siderne og supplerende røde bagpå. Udstyret følger særlige regler.",
          "refs": [
            "1.2.4.11"
          ]
        },
        {
          "title": "Nærlysets grænse",
          "body": "En forkert monteret pære kan give et forkert lysbillede. Mod en væg kan lys-mørke-grænsen vurderes. Nærlyset må ikke blænde, og overkanten af lysgrænsen skal falde 1 centimeter for hver meter væk fra bilen.",
          "refs": [
            "1.2.4.12",
            "1.2.4.13"
          ]
        },
        {
          "title": "Rundt om bilen",
          "body": "Kontrollen omfatter hele og rene lygter og reflekser, kraftigere stoplys end baglys, synligt gult blinklys, samlet havariblink, hvidt nummerpladelys og et horn med klar, konstant tone. Hurtig blinkrytme betyder normalt, at mindst én blinklygte ikke virker.",
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
          "title": "Lygter og reflekser",
          "action": "Sammen med kørelæreren i undervisningsbilen: 1) kontrollér at alle lygter og reflekser er hele og rene, 2) sammenlign stoplys med baglys og se at stoplyset er væsentligt kraftigere, 3) kontrollér gult blinklys, som ses tydeligt i sollys, 4) tænd havariblink og se at alle blinklygter tænder samtidig, og 5) kontrollér at nummerpladelyset belyser den bageste nummerplade med hvidt lys.",
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
          "action": "På et egnet sted og efter kørelærerens anvisning: giv et kort signal og vurder, om tonen er klar og konstant. Undgå unødig brug; kontrollen skal udføres på bilen.",
          "refs": [
            "1.2.4.19"
          ]
        }
      ],
      "case": {
        "context": "Blinklygterne blinker væsentligt hurtigere end sædvanligt. Hvad er dette normalt tegn på ifølge Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Det er normalt tegn på, at én eller flere af bilens blinklygter ikke virker.",
            "correct": true,
            "why": "Plan B knytter den væsentligt hurtigere blinkrytme direkte til, at én eller flere blinklygter normalt er ude af funktion.",
            "refs": [
              "1.2.4.20"
            ]
          },
          {
            "id": "b",
            "text": "Det er normalt en selvtest, som viser, at alle blinklygter og havariblink virker korrekt.",
            "correct": false,
            "why": "Planen beskriver ikke den hurtige rytme som en selvtest; den er normalt et tegn på en ikke-fungerende blinklygte.",
            "refs": [
              "1.2.4.17",
              "1.2.4.20"
            ]
          },
          {
            "id": "c",
            "text": "Det viser normalt, at blinklygterne lyser for kraftigt, selv om alle fortsat virker.",
            "correct": false,
            "why": "Lysstyrken kontrolleres ved tydelig synlighed i sollys, mens den hurtige rytme knyttes til manglende funktion i en blinklygte.",
            "refs": [
              "1.2.4.16",
              "1.2.4.20"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvilke tre afstande knytter sig til fjernlys, nærlys og positionslys?",
        "answer": "Fjernlys mindst 100 meter, nærlys mindst 30 meter uden at blænde og positionslys synligt på mindst 300 meter.",
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
      "lead": "Væsker, støj, røg og ændret kraftoverførsel giver tidlige tegn på fejl i drivlinjen.",
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
          "body": "Motorolie kontrolleres i tilstrækkelig mængde mellem min- og maxmærker på oliepinden, via bilens instrumenter eller efter instruktionsbogen. Kølervæske kontrolleres efter instruktionsbogen. For lidt olie eller kølervæske kan skade motoren alvorligt under kørsel.",
          "refs": [
            "1.2.5.1",
            "1.2.5.2",
            "1.2.5.4"
          ]
        },
        {
          "title": "Kulilte kan ikke lugtes",
          "body": "En utæt udstødning eller kørsel med åben bagklap kan føre kulilte ind i bilen. Gassen er lugtfri og farlig selv i små mængder. Lugt er derfor ingen sikker test; fejl og uhensigtsmæssig brug skal forebygges.",
          "refs": [
            "1.2.5.3"
          ]
        },
        {
          "title": "Røg, støj og kraftoverførsel",
          "body": "Unormal udstødningsrøg peger på dårlig forbrænding, og usædvanlig støj ved gasgivning på udstødningsfejl. Stiger motorens omdrejninger uden tilsvarende fart, kan koblingen glide. Kraftige mislyde ved gearskift eller kryb med koblingen nede er også fejltegn.",
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
          "body": "Et højvoltsbatteri mister normalt kapacitet med alder og slid, så rækkevidden bliver kortere. Følg fabrikantens råd for at begrænse unødigt slid. Opvarmning eller køling af kabine og batteri, mens bilen stadig lader, kan forbedre rækkevidden.",
          "refs": [
            "1.2.5.10",
            "1.2.5.11",
            "1.2.5.12"
          ]
        },
        {
          "title": "Lovlig stand undervejs",
          "body": "Føreren skal løbende være opmærksom på unødig støj og på fejl ved motor eller forureningsbegrænsende udstyr, der påvirker udledningen. En ny lyd eller røgsky er ikke noget, man gemmer til næste olieskift uden vurdering.",
          "refs": [
            "1.2.5.13"
          ]
        }
      ],
      "practical": [
        {
          "title": "Kontrollér motorolie",
          "action": "På den konkrete bil viser kørelæreren den korrekte metode: oliepind, instrumentvisning eller instruktionsbog. Udfør kontrollen uden værktøj efter fabrikantens anvisning, og forklar hvordan du afgør, om oliemængden er tilstrækkelig.",
          "refs": [
            "1.2.5.1"
          ]
        },
        {
          "title": "Kontrollér kølervæske",
          "action": "Find beholder eller relevant visning med kørelæreren, og følg instruktionsbogen. Åbn aldrig et varmt system på egen hånd. Den praktiske kontrol skal udføres og vurderes ved bilen.",
          "refs": [
            "1.2.5.2"
          ]
        }
      ],
      "case": {
        "context": "Motoren tager omdrejninger uden tilsvarende fart, og gearskiftet er vanskeligt med kraftige mislyde. Hvilken fejlkobling følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Opspeedningen tyder på koblingsfejl; mislydene ved vanskelig gearskiftning tyder på fejl i gear eller kobling.",
            "correct": true,
            "why": "Plan B beskriver præcis de to tegn og knytter dem henholdsvis til koblingen og til gear eller kobling.",
            "refs": [
              "1.2.5.7",
              "1.2.5.8"
            ]
          },
          {
            "id": "b",
            "text": "Begge tegn skyldes normalt for lidt kølervæske og skal derfor vurderes som en motorfejl.",
            "correct": false,
            "why": "For lidt kølervæske kan skade motoren, men planen knytter ikke disse to konkrete symptomer til kølesystemet.",
            "refs": [
              "1.2.5.2",
              "1.2.5.4",
              "1.2.5.7",
              "1.2.5.8"
            ]
          },
          {
            "id": "c",
            "text": "Opspeedningen viser udstødningsfejl, mens mislydene viser, at batteriets kapacitet er blevet for lav.",
            "correct": false,
            "why": "Udstødningsfejl forbindes med unormal støj ved gasgivning, og batterikapacitet med rækkevidde; ingen af dem matcher de beskrevne tegn.",
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
        "prompt": "Hvorfor kan man ikke bruge lugtesansen til at afgøre, om der er kulilte i bilen?",
        "answer": "Kulilte er lugtfri og farlig selv i små mængder; en utæt udstødning eller åben bagklap kan føre den ind i kabinen.",
        "refs": [
          "1.2.5.3"
        ]
      }
    },
    {
      "id": "energi-og-miljo",
      "title": "Energi- og miljørigtig kørsel",
      "pointRef": "1.2.6",
      "zone": "powertrain",
      "lead": "Forudseenhed, jævn fart og bevidst brug af biltypen reducerer energi, støj og unødige udledninger.",
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
          "title": "Start, når turen starter",
          "body": "Start først forbrændingsmotoren umiddelbart før afgang. Undgå længere tomgang, og brug automatisk stop ved korte standsninger, hvis bilen har funktionen. Ved længere ventetid kan motoren slukkes. Det begrænser både energi, støj og luftforurening.",
          "refs": [
            "1.2.6.1",
            "1.2.6.2",
            "1.2.6.3",
            "1.2.6.4",
            "1.2.6.5"
          ]
        },
        {
          "title": "Jævnhed og gearvalg",
          "body": "Undgå gentagne fartændringer. Ved fartreduktion slippes speederen helt, og i en bil med kobling undgås udkobling så vidt muligt. I en relevant manuelt gearet bil kan korrekt, tidligt gearvalg eksempelvis være skift fra 2. til 4. eller fra 3. til 5. gear efter kvik acceleration med cirka halv speeder.",
          "refs": [
            "1.2.6.6",
            "1.2.6.7",
            "1.2.6.8",
            "1.2.6.9"
          ]
        },
        {
          "title": "Modstand koster energi",
          "body": "Unødig vægt, for lavt dæktryk og en tagboks øger energiforbruget. Aircondition, klimaanlæg og andet elektrisk udstyr bruger også energi. Bilens eventuelle forbrugsvisning kan gøre virkningen synlig, så føreren kan justere sine vaner.",
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
          "body": "Høj fart og aggressiv acceleration øger forbruget. Frem mod et signal bør føreren forudse et muligt stop og sænke farten tidligt i stedet for at fortsætte hurtigt og bremse hårdt. Energiøkonomisk teknik kan normalt spare 5-10 procent og i mange tilfælde op til 25 procent brændstof.",
          "refs": [
            "1.2.6.15",
            "1.2.6.16"
          ]
        },
        {
          "title": "Planlæg før du kører",
          "body": "Undgå korte, unødvendige ture. Når det er muligt, kan turen flyttes uden for myldretiden, deles med andre eller gennemføres i et mere energieffektivt og mindre forurenende køretøj. Den bedste sparemanøvre kan være at planlægge anderledes.",
          "refs": [
            "1.2.6.17",
            "1.2.6.18",
            "1.2.6.19",
            "1.2.6.20"
          ]
        },
        {
          "title": "Hybrid kræver opladning",
          "body": "Hybrid- og plug-in-hybridbiler kombinerer forbrændingsmotor og elmotor for at forbedre energiforbruget mest muligt. Plug-in-modellen er kun miljøvenlig og energieffektiv, når opladningsmuligheden gennem en ladestander udnyttes mest muligt. Den faktiske opladning er derfor afgørende for den tilsigtede energi- og miljøfordel.",
          "refs": [
            "1.2.6.21",
            "1.2.6.22"
          ]
        },
        {
          "title": "Elbilens rækkevidde",
          "body": "Elbiler udnytter generelt energien bedre end fossilbiler. Rækkevidden påvirkes af køremåde og årstid. På lange ture skal rute og ladestop planlægges omhyggeligt, gerne med relevante apps, og regeneration bør udnyttes mest muligt, når forholdene tillader det.",
          "refs": [
            "1.2.6.23",
            "1.2.6.24",
            "1.2.6.25",
            "1.2.6.26"
          ]
        },
        {
          "title": "Støj og røg er ikke gratis",
          "body": "Bilen skal betjenes uden unødig støj eller unødige mængder røg og gas. Forstyrrende kørsel ved bebyggelse skal undgås eller udføres med mindst mulig gene. Lokale bestemmelser kan desuden sætte en konkret grænse for tomgang.",
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
          "action": "I undervisningsbilen viser kørelæreren den eventuelle energivisning. Aflæs den før og efter rolige og ujævne hastighedsændringer under lovlig undervisning, og forklar hvordan køremåden påvirker visningen.",
          "refs": [
            "1.2.6.3",
            "1.2.6.11",
            "1.2.6.15"
          ]
        },
        {
          "title": "Biltypecheck",
          "action": "Afgør sammen med kørelæreren, om bilen er forbrændingsbil, hybrid, plug-in-hybrid eller elbil, og peg på de relevante stop-, lade- eller regenerationsfunktioner. Funktionerne afhænger af bilen.",
          "refs": [
            "1.2.6.4",
            "1.2.6.21",
            "1.2.6.22",
            "1.2.6.26"
          ]
        }
      ],
      "case": {
        "context": "Hvilken beskrivelse gengiver Plan B's energirigtige teknik for en relevant manuelt gearet forbrændingsbil præcist?",
        "options": [
          {
            "id": "a",
            "text": "Start umiddelbart før afgang, undgå længere tomgang, accelerér kvikt med cirka halv speeder, skift tidligt højt og tilpas farten før signalet.",
            "correct": true,
            "why": "Alle led følger planens konkrete råd om starttidspunkt, tomgang, acceleration, gearvalg og forudseende farttilpasning ved signalregulerede kryds.",
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
            "text": "Start tidligt og varm motoren roligt i tomgang; accelerér derefter forsigtigt i lave gear og koble ud ved fartreduktion.",
            "correct": false,
            "why": "Planen fraråder længere tomgang, anbefaler højt gear og siger, at udkobling så vidt muligt bør undgås ved fartreduktion.",
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
            "text": "Start ved afgang og behold lave gear for trækkraft; hold normal fart mod signalet, før der bremses jævnt.",
            "correct": false,
            "why": "Starttidspunktet passer, men de lave gear og den sene farttilpasning strider mod rådene om højt gear og tidlig tilpasning før signalet.",
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
        "answer": "Fordi dens opladningsmulighed skal udnyttes mest muligt; køremåde, tomgang, vægt og turplanlægning har stadig betydning.",
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
      "lead": "Dæk og hjul skal passe sammen, være korrekt monteret og afsløre fejl gennem slid, lyd og styreadfærd.",
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
          "body": "Dæk, fælge og hjullejer skal være ubeskadigede. På samme aksel skal dækkene have samme dimension og type, bortset fra et nødhjul til midlertidig brug. Dæktrykket skal følge fabrikantens forskrift, og åbenbart uegnede dæk må ikke anvendes.",
          "refs": [
            "1.2.7.1",
            "1.2.7.2",
            "1.2.7.3",
            "1.2.7.4"
          ]
        },
        {
          "title": "Læs dækkets type",
          "body": "Almindelige dæk er beregnet til højere temperaturer end vinterdæk. M+S sammen med bjerg- og snefnugsymbol viser et vinterdæk; M+S alene kan være et helårsdæk. Symbolet skal læses, ikke gættes ud fra mønsterets dramatiske udseende.",
          "refs": [
            "1.2.7.5",
            "1.2.7.6"
          ]
        },
        {
          "title": "Pigdæk og tunge biler",
          "body": "Pigdæk må bruges fra 1. november til 15. april og skal sidde på alle hjul, også på en eventuel tilkoblet påhængsvogn. El- og hybridbiler har ofte større dækslid på grund af højere vægt og regenerationsfunktion.",
          "refs": [
            "1.2.7.7",
            "1.2.7.8"
          ]
        },
        {
          "title": "Tre konkrete kontroller",
          "body": "Hovedmønstret skal være mindst 1,6 millimeter på alle hjul og kan vurderes ved slidindikatorer. Dæk og fælge skal være uden skader. Et retningsbestemt dæk skal vende i korrekt omløbsretning efter markeringen på siden.",
          "refs": [
            "1.2.7.9",
            "1.2.7.10",
            "1.2.7.11"
          ]
        },
        {
          "title": "Slid peger videre",
          "body": "Ujævnt eller skævt slid kan skyldes forkert dæktryk, hjul, hjulindstilling, bremser eller støddæmpere. Over- eller understyring og større sidevindsfølsomhed kan også pege på dæktrykket. Årsagen skal straks findes og afhjælpes.",
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
          "body": "Knirk under kørsel kan komme fra hjulophæng, fjedre eller støddæmpere. Unormal støj eller vibration fra hjulleje eller ophæng kan også være tegn på fejl. Lyden er et signal om undersøgelse, ikke et soundtrack bilen selv har valgt.",
          "refs": [
            "1.2.7.14",
            "1.2.7.16"
          ]
        }
      ],
      "practical": [
        {
          "title": "Mønster og skader",
          "action": "På samtlige hjul på den konkrete bil viser kørelæreren hovedmønster og eventuelle slidindikatorer. Kontrollér mindst 1,6 millimeter i hovedmønstret samt synlige skader på dæk og fælge.",
          "refs": [
            "1.2.7.9",
            "1.2.7.10"
          ]
        },
        {
          "title": "Omløbsretning",
          "action": "Find pil eller anden retningsmarkering på et retningsbestemt dæk sammen med kørelæreren, og kontrollér den mod hjulets fremadgående rotation. Kravet gælder kun, når dækket er retningsbestemt.",
          "refs": [
            "1.2.7.11"
          ]
        }
      ],
      "case": {
        "context": "Dækkene har lovlig mønsterdybde, men ét er skævt slidt, og bilen er usædvanligt sidevindsfølsom. Hvilken vurdering følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Skævt slid tyder på fejl, sidevindsfølsomhed kan pege på forkert dæktryk, og forholdene skal straks afhjælpes.",
            "correct": true,
            "why": "Planen gør både skævt slid og den unormale styreadfærd til fejltegn og kræver umiddelbar afhjælpning af årsagen.",
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
            "text": "Lovlig mønsterdybde betyder, at skævslid og sidevindsfølsomhed kan afvente det næste almindelige serviceeftersyn.",
            "correct": false,
            "why": "Mindstekravet til mønsterdybde ophæver ikke de øvrige fejltegn; planen siger, at disse fejl skal afhjælpes umiddelbart.",
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
            "text": "Skævslid kræver kun dækombytning på akslen; fabrikantens dæktryk og øvrige mulige fejl er uden betydning.",
            "correct": false,
            "why": "Planen peger på flere mulige årsager, blandt andet dæktryk, hjulindstilling, bremser og støddæmpere; dækombytning alene løser ikke årsagen.",
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
        "prompt": "Hvad skal du gøre ved ujævnt eller skævt dækslid, selv om mønsterdybden stadig er lovlig?",
        "answer": "Få årsagen undersøgt og straks afhjulpet; den kan være dæktryk, hjulindstilling, bremser, støddæmpere eller andre hjulfejl.",
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
      "lead": "Tag, sider, skærme, hætter, klapper, døre og vognbund må ikke skabe fare.",
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
          "body": "Karrosseriet omfatter blandt andet tag, sider, skærme, front- eller motorhjelm, bagageklap, døre og vognbund. Delene må ikke have skarpe kanter eller stikke ud på en måde, der skaber unødig fare for cyklister, gående eller andre trafikanter.",
          "refs": [
            "1.2.8.1"
          ]
        },
        {
          "title": "Skade og rust vurderes efter fare",
          "body": "En bule eller en rustplet er ikke i sig selv den afgørende vurdering. Spørgsmålet er, om skade eller rust har et sådant omfang, at karrosseriet er til fare for færdselssikkerheden. Kriteriet er faren, ikke om skaden sidder i en bestemt type del.",
          "refs": [
            "1.2.8.2"
          ]
        },
        {
          "title": "Låse skal holde under kørslen",
          "body": "Døre, front- eller motorhjelm og bagageklap skal have låse, der kan holde dem lukkede, mens bilen kører. En klap, der ser lukket ud, men ikke fastholdes, kan åbne og skabe fare eller spærre førerens udsyn.",
          "refs": [
            "1.2.8.3"
          ]
        }
      ],
      "practical": [
        {
          "title": "Vurder et tænkt karrosseriproblem",
          "action": "For hvert eksempel afgør du, hvilket princip der er berørt: en skarp løs pynteliste, en rustskade af sikkerhedsfarligt omfang eller en bagageklap, som ikke kan låses. Forklar den mulige fare frem for at diagnosticere en reparation.",
          "refs": [
            "1.2.8.1",
            "1.2.8.2",
            "1.2.8.3"
          ]
        }
      ],
      "case": {
        "context": "En bil har en løs skarp pynteliste, en sikkerhedsfarlig rustskade og en bagageklap, hvis lås ikke holder. Hvilken observation hører specifikt til låsekravet i 1.2.8.3?",
        "options": [
          {
            "id": "a",
            "text": "Bagageklappens lås kan ikke holde klappen lukket under kørslen.",
            "correct": true,
            "why": "Punkt 1.2.8.3 kræver låse, som kan holde døre, fronthjelm og bagageklap lukkede under kørsel.",
            "refs": [
              "1.2.8.3"
            ]
          },
          {
            "id": "b",
            "text": "Den løse pynteliste har en skarp kant, som kan skade andre trafikanter.",
            "correct": false,
            "why": "Udsagnet beskriver et reelt problem, men det hører til kravet om skarpe eller udragende dele i 1.2.8.1.",
            "refs": [
              "1.2.8.1"
            ]
          },
          {
            "id": "c",
            "text": "Rustskaden har et sådant omfang, at den er farlig for færdselssikkerheden.",
            "correct": false,
            "why": "Udsagnet beskriver et reelt problem, men det hører til skade- og rustkravet i 1.2.8.2.",
            "refs": [
              "1.2.8.2"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvilke tre hovedtyper af karrosserikrav skal du kende?",
        "answer": "Ingen farlige kanter eller fremspring, ingen sikkerhedsfarlig skade eller rust og låse, der holder døre og klapper lukkede.",
        "refs": [
          "1.2.8.1",
          "1.2.8.2",
          "1.2.8.3"
        ]
      }
    },
    {
      "id": "sikkerhedsseler-udsyn-udstyr",
      "title": "Sikkerhedsseler, udsyn og særligt udstyr",
      "pointRef": "1.2.9",
      "zone": "exterior",
      "lead": "Seler, ruder, viskere og spejle skal give beskyttelse og udsyn i den konkrete bil.",
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
          "body": "Bilen skal normalt have sikkerhedssele på alle siddepladser, og selerne skal være uden skader. Påbudte nakkestøtter må ikke fjernes, når pladsen bruges. Beskyttelsen begynder altså før kørslen med udstyr, der er til stede og intakt.",
          "refs": [
            "1.2.9.1",
            "1.2.9.2",
            "1.2.9.3"
          ]
        },
        {
          "title": "Ruden skal kunne holdes ren",
          "body": "Forruden skal som hovedregel være hel og uden skader. Visker og vasker skal kunne holde den ren. Hvis det ikke lykkes, er det tegn på fejl i et af systemerne, også selv om udsynet virker acceptabelt i tørvejr.",
          "refs": [
            "1.2.9.4",
            "1.2.9.9"
          ]
        },
        {
          "title": "Spejle eller kamera",
          "body": "Bilen skal have et indvendigt førerspejl og et udvendigt førerspejl på hver side. Spejlene skal være rene og ubeskadigede. De kan erstattes af en kamera- og monitorløsning. Find derfor først ud af, hvilken løsning den konkrete bil er udstyret med.",
          "refs": [
            "1.2.9.5",
            "1.2.9.6",
            "1.2.9.7"
          ]
        },
        {
          "title": "Trekanten skal være ved hånden",
          "body": "En godkendt advarselstrekant bør medbringes, så den kan opstilles i de situationer, hvor der er pligt til det. Den hjælper ikke meget hjemme i garagen, når bilen står havareret et andet sted.",
          "refs": [
            "1.2.9.8"
          ]
        },
        {
          "title": "Udsynets skjulte film",
          "body": "Sprinklervæske skal være tilstrækkelig, viskerne skal rense ruden, og spejlene skal være hele, rene og korrekt indstillede. En tynd indvendig film kan være næsten usynlig i gråvejr, men gøre udsynet meget dårligt ved lav sol eller blændende lygter.",
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
          "title": "Sprinkler og viskere",
          "action": "I undervisningsbilen og sammen med kørelæreren: kontrollér væskemængden efter bilens løsning og instruktionsbog, aktivér vasker og viskere, og vurder om viskerne kan holde forruden ren.",
          "refs": [
            "1.2.9.10",
            "1.2.9.11"
          ]
        },
        {
          "title": "Spejlkontrol",
          "action": "Indstil siddestillingen først. Kontrollér derefter med kørelæreren, at spejle eller monitorer er rene, hele og korrekt indstillet for den konkrete bil. Den fysiske præstation vurderes ved bilen.",
          "refs": [
            "1.2.9.12"
          ]
        }
      ],
      "case": {
        "context": "Forruden har indvendig film, sprinklervæsken er næsten tom, og viskerne bevæger sig. Hvilken kontrol og vurdering følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "Sprinklervæsken skal være tilstrækkelig, viskerne skal kunne holde ruden ren, og filmen bør fjernes på grund af modlys.",
            "correct": true,
            "why": "Planen kræver tilstrækkelig sprinklervæske og fungerende viskere og beskriver, at indvendig film kan gøre udsynet umuligt i modlys.",
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
            "text": "Viskernes bevægelse opfylder kontrollen alene; sprinklervæsken kan vente, hvis der ikke forventes regn.",
            "correct": false,
            "why": "Kontrollen gælder både tilstrækkelig sprinklervæske og viskernes evne til faktisk at holde forruden ren, uanset vejrudsigten.",
            "refs": [
              "1.2.9.4",
              "1.2.9.9",
              "1.2.9.10",
              "1.2.9.11"
            ]
          },
          {
            "id": "c",
            "text": "Den indvendige film er kun relevant ved rudeskade; rene spejle kan ellers erstatte en ren forrude.",
            "correct": false,
            "why": "Planen behandler filmen som en selvstændig udsynsrisiko i modlys, og spejlkravene erstatter ikke kravet om en forrude, der kan holdes ren.",
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
        "prompt": "Hvorfor skal ruder rengøres indvendigt, selv når de ser acceptable ud i gråvejr?",
        "answer": "En tynd film kan blive stærkt synshæmmende ved lav sol eller blændende lygter og i værste fald gøre udsynet umuligt.",
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
      "lead": "Kategori B kan omfatte flere køretøjstyper, men hver type kan have særlige krav til indretning og udstyr.",
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
          "body": "Særregler kan gælde for varebil, påhængskøretøj til person- og varebil, quadricykel, trehjulet motorcykel, ATV, stor knallert, traktor og motorredskab, selv når køretøjet kan føres med kategori B. Førerretten gør dem ikke teknisk ens.",
          "refs": [
            "1.2.10.1"
          ]
        },
        {
          "title": "Mål og vægt varierer",
          "body": "Reglerne vedrører især længde, bredde, tilladt last og tilladt totalvægt. Derfor kan man ikke overføre personbilens grænser eller antage, at et køretøj må lastes ud fra den plads, der ser ledig ud.",
          "refs": [
            "1.2.10.1"
          ]
        },
        {
          "title": "Udstyr følger køretøjet",
          "body": "Bremser, lygter, dæk og spejle kan være reguleret særligt. For nogle typer er styrthjelm relevant, og for påhængskøretøj gælder særlige tilkoblingskrav. Kravene findes i reglerne for den konkrete køretøjstype; dokumenterne bruges som støtte, når de indeholder relevante oplysninger.",
          "refs": [
            "1.2.10.1"
          ]
        }
      ],
      "practical": [
        {
          "title": "Type og særkrav",
          "action": "Gennemgå med kørelæreren et konkret køretøjs type, relevante dokumenter og de regler, der gælder for typen. Peg på krav til mål, vægt, bremser, lygter, dæk, spejle, hjelm eller tilkobling, hvor de er relevante.",
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
            "why": "Planen siger udtrykkeligt, at de nævnte kategori B-køretøjer kan være omfattet af særlige regler om disse forhold.",
            "refs": [
              "1.2.10.1"
            ]
          },
          {
            "id": "b",
            "text": "ATV-typen følger personbilens udstyrskrav, men kan have en særregel om styrthjelm, hvis den er åben.",
            "correct": false,
            "why": "Planens særregler er ikke begrænset til styrthjelm; de kan også vedrøre mål, vægt, bremser, lygter, dæk og spejle.",
            "refs": [
              "1.2.10.1"
            ]
          },
          {
            "id": "c",
            "text": "Kategori B betyder, at særregler bortfalder, når ATV'en er registreret og dens tilladte totalvægt er kendt.",
            "correct": false,
            "why": "Førerretten og registreringen fjerner ikke køretøjstypens særlige regler om indretning, udstyr og eventuelt førerudstyr.",
            "refs": [
              "1.2.10.1"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvorfor er kategori B alene ikke nok til at afgøre et særligt køretøjs udstyrskrav?",
        "answer": "Fordi køretøjstypen kan have egne regler om blandt andet mål, vægt, bremser, lys, dæk, spejle, hjelm og tilkobling.",
        "refs": [
          "1.2.10.1"
        ]
      }
    },
    {
      "id": "registreringsattest",
      "title": "Registreringsattesten fortæller, hvad bilen må",
      "pointRef": "1.3.1",
      "zone": "documents",
      "lead": "Attesten dokumenterer registrering og centrale vægte og bruges ved vurdering af bil og påhængskøretøj.",
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
          "body": "En bil, der bruges på færdselslovens område, skal være registreret og have en registreringsattest. Ved kørsel i mange andre lande skal originalen medbringes. Inden en tur over grænsen må du derfor undersøge dokumentkravet for de lande, rejsen går gennem.",
          "refs": [
            "1.3.1.1"
          ]
        },
        {
          "title": "Vægtene står på attesten",
          "body": "Registreringsattesten oplyser bilens egenvægt eller køreklar vægt og dens tilladte totalvægt. Den kan også vise, hvor tungt et påhængskøretøj bilen må kobles med, samt en eventuel største tilladt vogntogsvægt. Felterne bruges samlet, ikke som løse gæt.",
          "refs": [
            "1.3.1.2"
          ]
        },
        {
          "title": "To køretøjer, to attester",
          "body": "Bilens og påhængskøretøjets registreringsattester bruges til at vurdere, om de må sammenkobles. Under kørsel med påhængskøretøj skal begge attester med. I udlandet kræves originalerne eller en genpart udstedt af Motorstyrelsen, mens kopier kan medbringes i Danmark.",
          "refs": [
            "1.3.1.3",
            "1.3.1.4",
            "1.3.1.5"
          ]
        },
        {
          "title": "Elbilens vægt påvirker lasten",
          "body": "Elkøretøjer har ofte højere egenvægt og derfor lavere lasteevne. Det er ikke en regel om, at enhver elbil kan laste mindre end enhver anden bil; den konkrete registreringsattest viser de relevante vægte for netop køretøjet.",
          "refs": [
            "1.3.1.6"
          ]
        }
      ],
      "practical": [
        {
          "title": "Læs en øvelsesattest",
          "action": "Brug en anonymiseret øvelsesattest til at finde egenvægt eller køreklar vægt, tilladt totalvægt, tilladt påhængsvægt og eventuel vogntogsvægt. Forklar derefter, hvilke to attester der skal sammenholdes ved en tænkt sammenkobling.",
          "refs": [
            "1.3.1.2",
            "1.3.1.3"
          ]
        },
        {
          "title": "Vælg dokumenter til turen",
          "action": "Sammenlign en tur i Danmark med en tur til udlandet med påhængskøretøj. Udpeg for hver tur, hvilke registreringsattester der skal med, og om kopi, original eller en genpart fra Motorstyrelsen er relevant.",
          "refs": [
            "1.3.1.1",
            "1.3.1.4",
            "1.3.1.5"
          ]
        }
      ],
      "case": {
        "context": "En fører planlægger én tur i Danmark og én tur til udlandet med påhængskøretøj. Hvilken sammenligning af registreringsattester følger Plan B?",
        "options": [
          {
            "id": "a",
            "text": "I Danmark kan kopier af begge attester medbringes; i udlandet kræves originaler eller Motorstyrelsens genpart.",
            "correct": true,
            "why": "Begge attester skal med ved kørsel med påhængskøretøj; Danmark tillader kopier, mens udlandet kræver originaler eller officiel genpart.",
            "refs": [
              "1.3.1.4",
              "1.3.1.5"
            ]
          },
          {
            "id": "b",
            "text": "I Danmark er bilens kopi nok; i udlandet er påhængskøretøjets originale attest alene tilstrækkelig.",
            "correct": false,
            "why": "Ved begge ture skal attesterne for både det trækkende køretøj og påhængskøretøjet medbringes.",
            "refs": [
              "1.3.1.4",
              "1.3.1.5"
            ]
          },
          {
            "id": "c",
            "text": "I Danmark kan kopier af begge attester medbringes; i udlandet er almindelige kopier af begge tilstrækkelige.",
            "correct": false,
            "why": "Danmark tillader kopier, men ved kørsel i udlandet kræver planen originaler eller en genpart udstedt af Motorstyrelsen.",
            "refs": [
              "1.3.1.4",
              "1.3.1.5"
            ]
          }
        ]
      },
      "recall": {
        "prompt": "Hvilke vægtoplysninger skal du kunne finde på en registreringsattest?",
        "answer": "Egenvægt eller køreklar vægt, tilladt totalvægt, tilladt vægt for et eventuelt påhængskøretøj og eventuel største vogntogsvægt.",
        "refs": [
          "1.3.1.2"
        ]
      }
    }
  ]
};
