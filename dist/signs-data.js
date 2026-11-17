// Skilte: the Danish road signs, grouped as in Bekendtgørelse om vejafmærkning (BEK nr. 425 af 13. april 2023).
// Names are the official names from the BEK text; "short", "trap" and the exercises are our own plain Danish.
// Artwork: one SVG per sign in assets/signs/ (file name = code, "A 41,1" -> a41-1.svg). Most are public-domain Wikimedia Commons
// drawings, checked against the BEK pictures; light signals, road markings, E 19 and E 33 are drawn by us after the BEK pictures.
// Sources per file: outputs/teoriboost-signs-20261117/REPORT.md. Nothing here is guessed: a sign without a clear BEK sentence is left out.

export const SIGN_SOURCE = Object.freeze({
  id: 'afmaerkning',
  label: 'Bekendtgørelse om vejafmærkning, BEK nr. 425 af 13. april 2023',
  url: 'https://www.retsinformation.dk/eli/lta/2023/425',
  checked: '2026-11-17'
});

export const signFile = code => `assets/signs/${code.toLowerCase().replace(/ /g, '').replace(',', '-')}.svg`;

// sign: [code, official name, what it means (short), typical exam trap, extra]
const s = (code, name, short, trap, extra = {}) => ({ code, name, short, trap, ...extra });

export const GROUPS = [
  {
    id: 'forbud', title: 'Forbudstavler', letter: 'C', kind: 'Forbudstavle',
    look: 'Rund. Rød kant.', says: 'Du må ikke.',
    lead: 'Forbudstavler er runde med rød kant og sort tegn. Tegnet viser, hvad du ikke må. Ophørstavlerne er grå med sorte streger.',
    source: { para: '§ 17-19', note: 'BEK 425/2023 § 17-19 (forbudstavler C). Gyldighed: § 18 stk. 2.' },
    signs: [
      s('C 11,1', 'Højresving forbudt', 'Du må ikke dreje til højre.', 'Gælder kun i krydset eller indkørslen, hvor tavlen står, medmindre en undertavle siger andet.'),
      s('C 11,2', 'Venstresving forbudt', 'Du må ikke dreje til venstre.', 'Forbud mod venstresving forbyder også at vende.'),
      s('C 12', 'Vending forbudt', 'Du må ikke vende.', 'Gælder kun i krydset eller indkørslen, hvor tavlen står.'),
      s('C 19', 'Indkørsel forbudt', 'Du må ikke køre ind på vejen fra denne side.', 'Gælder ethvert køretøj fra den side, tavlen står. Den gør ikke i sig selv vejen ensrettet.'),
      s('C 21', 'Kørsel i begge retninger forbudt', 'Ingen køretøjer må køre her fra nogen af siderne.', 'Forveksles med C 19, der kun forbyder indkørsel fra den ene side.'),
      s('C 22,1', 'Motorkøretøj, stor knallert, traktor og motorredskab forbudt', 'Motorkøretøjer, store knallerter, traktorer og motorredskaber må ikke køre her.', 'Lille knallert er kun forbudt, hvis en undertavle siger det.'),
      s('C 23,1', 'Lastbil forbudt', 'Lastbiler må ikke køre her.', 'Kan begrænses med en vægt på undertavlen, så gælder forbuddet kun for tungere lastbiler.'),
      s('C 23,3', 'Kørsel med farligt gods forbudt', 'Køretøjer med farligt gods må ikke køre her.', 'En undertavle kan angive tidsrum og hvilke slags farligt gods, der er omfattet.'),
      s('C 26,2', 'Fodgængere forbudt', 'Gående må ikke færdes her.', 'Flere forbud kan stå på én tavle: så er alle de viste symboler forbudt.'),
      s('C 31', 'Totalvægt', 'Køretøjer, der vejer mere end tallet, må ikke køre her.', 'Det er den faktiske vægt med læs. Ved vogntog gælder tallet for hvert køretøj for sig.'),
      s('C 42', 'Køretøjshøjde', 'Køretøjer, der er højere end tallet, må ikke køre her.', 'Højden regnes med læs.'),
      s('C 51', 'Overhaling forbudt', 'Du må ikke overhale her.', 'Du må godt overhale en tohjulet cykel og en tohjulet lille knallert. Forbuddet gælder, til en ophørstavle eller en afstand på undertavlen ophæver det.'),
      s('C 53', 'Ophør af overhaling forbudt', 'Overhalingsforbuddet er slut.', 'Den ophæver kun overhalingsforbuddet, ikke andre forbudstavler.'),
      s('C 55', 'Lokal hastighedsbegrænsning', 'Du må højst køre det antal km/t, tallet viser.', 'Gælder, til en ophørstavle, en ny hastighed eller en afstand på undertavlen ophæver den. Ikke bare til næste kryds.'),
      s('C 56', 'Ophør af lokal hastighedsbegrænsning', 'Den lokale hastighedsgrænse er slut.', 'Tavlen siger ikke selv, hvor hurtigt du må køre bagefter. Den almindelige grænse gælder igen.'),
      s('C 59', 'Ophør af forbud', 'Alle forbudstavler på strækningen før den er ophævet.', 'Undtagen standsnings- og parkeringsforbud.'),
      s('C 61', 'Standsning forbudt', 'Du må ikke standse på kørebanen, medmindre hensyn til den øvrige færdsel kræver det.', 'Gælder kun i den side af vejen, hvor tavlen står, frem til næste kryds. Kryds = standsning.'),
      s('C 62', 'Parkering forbudt', 'Du må ikke parkere på kørebanen.', 'Standsning er stadig tilladt. Ét skråstreg = parkering, kryds = standsning.')
    ],
    situations: [
      { text: 'Du holder foran en vej og må ikke køre ind fra din side. Hvilken tavle står der?', answer: 'C 19', others: ['C 21', 'C 12', 'C 59'] },
      { text: 'Du må hverken dreje til venstre eller vende i krydset. Hvilken tavle forbyder det?', answer: 'C 11,2', others: ['C 11,1', 'C 12', 'C 19'] },
      { text: 'Du sidder bag en traktor og må ikke overhale her. Hvilken tavle står der?', answer: 'C 51', others: ['C 53', 'C 55', 'C 59'] },
      { text: 'Din varevogn er 3,8 m høj med læs. Hvilken tavle forbyder dig at køre ind?', answer: 'C 42', others: ['C 31', 'C 21', 'C 55'] },
      { text: 'Du må sætte en passager af, men ikke parkere. Hvilken tavle passer?', answer: 'C 62', others: ['C 61', 'C 59', 'C 21'] },
      { text: 'Du må ikke standse på kørebanen, kun hvis hensynet til trafikken kræver det. Hvilken tavle?', answer: 'C 61', others: ['C 62', 'C 21', 'C 59'] },
      { text: 'Hvilken tavle fastsætter den fart, du højst må køre på strækningen?', answer: 'C 55', others: ['C 56', 'C 31', 'C 42'] }
    ],
    facts: [
      { q: 'Du ser C 59 Ophør af forbud. Hvad er ophævet?', options: ['Alle forbudstavler på strækningen før, undtagen standsnings- og parkeringsforbud', 'Alle forbudstavler, også parkeringsforbud', 'Kun hastighedsforbuddet', 'Kun overhalingsforbuddet'], answer: 0, explain: 'C 59 ophæver alle forbudstavler på strækningen før, men aldrig standsnings- og parkeringsforbud (§ 19).' },
      { q: 'Hvor længe gælder C 51 Overhaling forbudt?', options: ['Til næste kryds', 'Til en ophørstavle eller en afstand på undertavlen ophæver det', 'I 500 meter', 'Kun for lastbiler'], answer: 1, explain: 'Overhalingsforbuddet gælder, til det ophæves af en ophørstavle eller en afstand på undertavle (§ 19).' },
      { q: 'C 61 Standsning forbudt står i højre side af vejen. Hvor gælder den?', options: ['På begge sider af vejen', 'I den side, hvor tavlen står, frem til næste kryds', 'Kun lige ved tavlen', 'Kun i svinget bagved'], answer: 1, explain: 'Standsnings- og parkeringsforbud gælder i den vejside, hvor tavlen står, i køreretningen frem til næste kryds (§ 19).' },
      { q: 'Må du overhale en tohjulet cykel, når C 51 står opsat?', options: ['Ja, forbuddet gælder ikke tohjulet cykel', 'Nej, aldrig', 'Kun hvis der er frit udsyn', 'Kun uden for by'], answer: 0, explain: 'C 51 gælder ikke ved overhaling af tohjulet cykel og tohjulet lille knallert (§ 19).' },
      { q: 'C 31 viser 5 t. Hvilken vægt tæller?', options: ['Den tilladte totalvægt i registreringsbeviset', 'Den faktiske vægt med læs', 'Kun vægten uden læs', 'Kun akseltrykket'], answer: 1, explain: 'C 31 forbyder køretøjer, hvis faktiske totalvægt er større end tallet (§ 19).' }
    ]
  },
  {
    id: 'advarsel', title: 'Advarselstavler', letter: 'A', kind: 'Advarselstavle',
    look: 'Trekant, spids opad. Rød kant.', says: 'Pas på, der er fare.',
    lead: 'Advarselstavler er trekantede med spidsen opad, rød kant og et sort tegn, der viser farens art. De står normalt kun, hvor faren er svær at se på forhånd.',
    source: { para: '§ 10-13', note: 'BEK 425/2023 § 10-13 (advarselstavler A). Afstand: § 12.' },
    signs: [
      s('A 11', 'Farligt vejkryds, hvor den krydsende trafik har ubetinget vigepligt', 'Farligt kryds. Trafikken fra siderne skal vige for dig.', 'Du har fortrinsret, men krydset er stadig farligt. Hold farten nede.'),
      s('A 16', 'Rundkørsel', 'Du nærmer dig en rundkørsel.', 'Tavlen advarer kun. Vigepligten viser B 11 og vigelinjen.'),
      s('A 17', 'Fodgængerfelt', 'Fodgængerfelt forude.', 'Med undertavlen "Gågade" betyder den en krydsende gågade.'),
      s('A 18', 'Modkørende færdsel', 'Du får modkørende færdsel på vejen.', 'Står også ved begyndelsen af en strækning med modkørende færdsel.'),
      s('A 19', 'Lyssignal', 'Lyssignal forude.', 'Står, hvor du ellers har svært ved at se signalet i god tid.'),
      s('A 21', 'Cyklister', 'Cyklister og lille knallert kører ud på kørebanen eller krydser den.', 'Ikke det samme som D 21 Cykelsti, der er et påbud.'),
      s('A 22', 'Børn', 'Børn færdes på eller ved vejen.', 'Med undertavlen "Skole" viser den, at en skolepatrulje arbejder.'),
      s('A 23', 'Ridende', 'Ridende færdes på eller ved vejen.', 'Giv god plads og sænk farten.'),
      s('A 31', 'Glat vej', 'Kørebanen kan være usædvanlig glat.', 'Årsagen står på en undertavle, fx "Glat i vådt føre".'),
      s('A 36', 'Bump', 'Hastighedsdæmpende bump på vejen.', 'Sænk farten før bumpet, ikke først på det.'),
      s('A 41,1', 'Højresving', 'Farligt sving til højre.', 'En undertavle kan vise den fart, svinget kan tages i.'),
      s('A 43,1', 'Indsnævret vej', 'Vejen bliver smallere.', 'En undertavle kan vise den frie bredde.'),
      s('A 72', 'Jernbaneoverkørsel uden bomme', 'Jernbaneoverkørsel uden bomme.', 'Ingen bomme betyder, at du selv skal kigge efter tog.'),
      s('A 73', 'Jernbaneoverkørsel med bomme', 'Jernbaneoverkørsel med bomme.', 'En undertavle kan advare om strømførende ledninger i overkørslen.'),
      s('A 74,1', 'Krydsmærke for enkeltsporet jernbaneoverkørsel', 'Står lige foran en jernbaneoverkørsel med ét spor.', 'Står der B 13 Stop under krydsmærket, skal du standse helt.'),
      s('A 99', 'Anden fare', 'Der er en fare, som tavlen under forklarer.', 'Faren står på tavlen under. Læs den.')
    ],
    situations: [
      { text: 'Du kører forbi en skole, og børn færdes ved vejen. Hvilken tavle har advaret dig?', answer: 'A 22', others: ['A 21', 'A 17', 'A 23'] },
      { text: 'Du kører mod en jernbaneoverkørsel med bomme. Hvilken advarselstavle ser du før overkørslen?', answer: 'A 73', others: ['A 72', 'A 74,1', 'A 99'] },
      { text: 'Faren forude passer ikke på nogen fast tavle. En tavle under forklarer den. Hvilken tavle står øverst?', answer: 'A 99', others: ['A 31', 'A 36', 'A 11'] },
      { text: 'Der ligger hastighedsdæmpende bump på vejen foran dig. Hvilken tavle advarer?', answer: 'A 36', others: ['A 31', 'A 99', 'A 43,1'] },
      { text: 'Du kommer til et farligt kryds, hvor trafikken fra siderne skal vige for dig. Hvilken tavle?', answer: 'A 11', others: ['A 16', 'A 19', 'A 17'] },
      { text: 'Cyklister kører ud på vejen foran dig. Hvilken tavle har advaret?', answer: 'A 21', others: ['A 22', 'A 23', 'A 17'] },
      { text: 'Du skal ind i en rundkørsel om lidt. Hvilken advarselstavle står før den?', answer: 'A 16', others: ['A 11', 'A 19', 'A 18'] }
    ],
    facts: [
      { q: 'Hvor langt før farestedet står advarselstavler normalt uden for tættere bebygget område?', options: ['5 til 10 meter', '50 til 100 meter', '150 til 250 meter', '500 til 800 meter'], answer: 2, explain: 'Uden for tættere bebygget område står de normalt 150 til 250 m før farestedet (§ 12).' },
      { q: 'Hvordan ser en advarselstavle normalt ud?', options: ['Rund med blå bund', 'Trekant med spidsen opad, rød kant og sort tegn', 'Trekant med spidsen nedad', 'Firkant med rød kant'], answer: 1, explain: 'Advarselstavler er trekantede med spidsen opad, rød rand og hvidt felt med sort symbol (§ 10).' },
      { q: 'Hvornår sættes en advarselstavle normalt op?', options: ['Ved alle kryds', 'Hvor faren er svær at se på forhånd eller er væsentlig', 'Kun i byer', 'Kun ved skoler'], answer: 1, explain: 'Advarselstavler sættes i almindelighed kun op, hvor faren vanskeligt kan forudses (§ 4).' },
      { q: 'Hvad skal du være ekstra opmærksom på ved A 72 Jernbaneoverkørsel uden bomme?', options: ['Der er ingen bomme, så du selv skal kigge efter tog', 'Toget standser altid', 'Du har fortrinsret over toget', 'Du må ikke bremse'], answer: 0, explain: 'Uden bomme er overkørslen kun sikret ved afmærkning. Undertavlen "Se efter tog" siger netop det.' }
    ]
  },
  {
    id: 'vigepligt', title: 'Vigepligtstavler', letter: 'B', kind: 'Vigepligtstavle',
    look: 'Hver tavle har sin egen form.', says: 'Hvem skal vige for hvem.',
    lead: 'Vigepligtstavler viser, hvem der skal vige. De har hver deres form: omvendt trekant, ottekant, gul rude og pile.',
    source: { para: '§ 14-16', note: 'BEK 425/2023 § 14-16 (vigepligtstavler B). B 11 sammen med vigelinjen S 11 (§ 59).' },
    signs: [
      s('B 11', 'Ubetinget vigepligt', 'Du skal vige for al kørende færdsel fra begge sider.', 'B 11 betyder ikke fuldt stop. Det gør B 13. Tavlen bruges normalt sammen med vigelinjen.'),
      s('B 13', 'Stop', 'Du skal standse helt, før du kører frem, og vige for alle.', 'Du har stadig ubetinget vigepligt bagefter. Cyklister på cykelsti må dog svinge til højre uden at stoppe, hvis det kan ske uden ulempe.'),
      s('B 15', 'Sammenfletning', 'Kørebaner løber sammen. I skal lette sammenfletningen.', 'Ingen har fortrin. Alle tager gensidigt hensyn.'),
      s('B 16', 'Hovedvej', 'Du kører på hovedvej. Trafik fra sidevejene skal vige for dig.', 'Uden for tættere bebygget område er parkering på kørebanen forbudt. Gælder ikke, hvis B 11, B 13 eller B 15 står på hovedvejen.'),
      s('B 17', 'Hovedvej ophører', 'Du kører ikke længere på hovedvej.', 'Tjek de næste tavler og afmærkninger. Fortrinsretten er væk.'),
      s('B 18', 'Hold tilbage for modkørende', 'Du må kun køre ind, hvis du ikke tvinger modkørende til at standse.', 'Den røde pil er dig. Den sorte pil, den modkørende, har fortrin.'),
      s('B 19', 'Modkørende færdsel skal holde tilbage', 'Du har ret til at køre først. Den modkørende skal vige.', 'Den røde pil er den modkørende, ikke dig.'),
      s('UB 11,1', 'Forvarsling for stop', 'Et STOP-kryds kommer om den afstand, der står på tavlen.', 'Sidder under B 11. Afstanden til krydset står på undertavlen.', { kind: 'Undertavle' })
    ],
    situations: [
      { text: 'Du skal standse helt før krydset og vige for alle. Hvilken tavle står der?', answer: 'B 13', others: ['B 11', 'B 16', 'B 15'] },
      { text: 'Du skal vige for trafik fra begge sider, men behøver ikke standse, hvis der er frit. Hvilken tavle?', answer: 'B 11', others: ['B 13', 'B 16', 'B 19'] },
      { text: 'Du kører på en vej, hvor trafikken fra sidevejene skal vige for dig. Hvilken tavle?', answer: 'B 16', others: ['B 17', 'B 11', 'B 19'] },
      { text: 'To kørebaner løber sammen foran dig, og I skal hjælpe hinanden ind. Hvilken tavle?', answer: 'B 15', others: ['B 11', 'B 18', 'B 19'] },
      { text: 'Den modkørende har fortrin på en smal strækning. Du må kun køre ind, hvis du kan komme igennem uden at stoppe den modkørende. Hvilken tavle?', answer: 'B 18', others: ['B 19', 'B 13', 'B 15'] },
      { text: 'På en smal strækning skal den modkørende holde tilbage for dig. Hvilken tavle?', answer: 'B 19', others: ['B 18', 'B 11', 'B 16'] }
    ],
    facts: [
      { q: 'Hvad kræver B 11 Ubetinget vigepligt af dig?', options: ['Du skal altid standse helt', 'Du skal vige for kørende fra begge sider, men må køre, hvis det er frit', 'Du har fortrinsret', 'Du skal kun vige for cyklister'], answer: 1, explain: 'B 11 giver ubetinget vigepligt, men ikke fuld standsning. Det kræver B 13 Stop.' },
      { q: 'Hvad gælder der efter, du har standset ved B 13 Stop?', options: ['Du har fortrinsret', 'Du har stadig ubetinget vigepligt', 'Du må køre uden at kigge', 'Vigepligten ophører'], answer: 1, explain: 'Efter stoppet består den ubetingede vigepligt. Du skal vurdere udsyn og trafik på ny.' },
      { q: 'Hvad gælder der uden for by på en vej med B 16 Hovedvej?', options: ['Parkering på kørebanen er forbudt', 'Man må parkere frit', 'Fart over 80 km/t er tilladt', 'Der er altid motorvejsregler'], answer: 0, explain: 'B 16 betyder også, at parkering på kørebanen er forbudt uden for tættere bebygget område (§ 16).' },
      { q: 'Vigelinjen S 11 har trekanter. Hvem har ubetinget vigepligt?', options: ['De, som trekanternes spids peger mod', 'De, som trekanternes bund vender mod', 'Alle på vejen', 'Ingen'], answer: 0, explain: 'Kørende fra den side, hvor trekanternes spids vender hen, har ubetinget vigepligt (§ 59).' }
    ]
  },
  {
    id: 'paabud', title: 'Påbudstavler', letter: 'D', kind: 'Påbudstavle',
    look: 'Rund. Blå bund. Hvidt tegn.', says: 'Du skal.',
    lead: 'Påbudstavler er runde med blå bund og hvidt tegn. De viser noget, du skal gøre, fx følge en retning.',
    source: { para: '§ 20-23', note: 'BEK 425/2023 § 20-23 (påbudstavler D).' },
    signs: [
      s('D 11', 'Påbudt kørselsretning', 'Du skal køre i pilens retning.', 'Der er flere varianter. Følg pilen, ikke vejens forløb.', { wide: true }),
      s('D 12', 'Påbudt kørselsretning i rundkørsel', 'I rundkørslen skal du følge pilene rundt.', 'Står ofte under B 11 ved indkørslen til rundkørslen.'),
      s('D 15', 'Påbudt passage', 'Du skal passere tavlen på den side, pilen peger mod.', 'Gælder ikke kørsel til stoppested, i busbane eller parkeringsbane.', { wide: true }),
      s('D 21', 'Cykelsti', 'Banen er til cyklister og lille knallert. Kun dem.', 'En undertavle kan sige, at lille knallert skal føres på kørebanen.'),
      s('D 22', 'Gangsti', 'Banen er kun til gående.', 'Cykler må ikke bruge den.'),
      s('D 55', 'Mindste hastighed', 'Du skal mindst køre så hurtigt som tallet.', 'Gælder ikke cyklister og lille knallert. Gælder, til D 56 eller en afstand på undertavle ophæver den.'),
      s('D 56', 'Ophør af mindste hastighed', 'Påbuddet om mindste hastighed er slut.', 'Det er ikke et forbud mod at køre hurtigt.')
    ],
    situations: [
      { text: 'Du kommer ind i en rundkørsel. Hvilken tavle påbyder dig at følge pilene rundt?', answer: 'D 12', others: ['D 21', 'D 55', 'D 22'] },
      { text: 'Hvilken tavle viser en bane, der kun er til cyklister og lille knallert?', answer: 'D 21', others: ['D 22', 'D 12', 'D 55'] },
      { text: 'Hvilken tavle viser en bane, der kun er til gående?', answer: 'D 22', others: ['D 21', 'D 56', 'D 12'] },
      { text: 'Du skal køre mindst 50 km/t på en strækning. Hvilken tavle påbyder det?', answer: 'D 55', others: ['D 56', 'D 21', 'D 12'] }
    ],
    facts: [
      { q: 'Hvordan ser en påbudstavle normalt ud?', options: ['Rund med blå bund og hvidt tegn', 'Rund med rød kant', 'Firkantet med blå bund', 'Trekant med blå kant'], answer: 0, explain: 'Påbudstavler er cirkelformede med blå bund og hvidt symbol (§ 20).' },
      { q: 'D 55 Mindste hastighed gælder ikke for en bestemt gruppe. Hvem?', options: ['Lastbiler', 'Cyklister og lille knallert', 'Motorcykler', 'Busser'], answer: 1, explain: 'Påbuddet gælder kørende bortset fra cyklister og lille knallert (§ 23).' },
      { q: 'Hvem må bruge en bane med D 21 Cykelsti?', options: ['Cyklister og lille knallert', 'Alle køretøjer', 'Kun motorcykler', 'Kun gående'], answer: 0, explain: 'Banen skal bruges af cyklister og lille knallert og må kun bruges af dem (§ 23).' }
    ]
  },
  {
    id: 'oplysning', title: 'Oplysningstavler', letter: 'E', kind: 'Oplysningstavle',
    look: 'Rektangel. Blå bund.', says: 'Her er noget, du skal vide.',
    lead: 'Oplysningstavler er rektangulære, mest med blå bund og hvidt tegn eller tekst. De fortæller, hvor du er, og hvilke regler der gælder. Motorvej er grøn.',
    source: { para: '§ 24-27', note: 'BEK 425/2023 § 24-27 (oplysningstavler E).' },
    signs: [
      s('E 17', 'Fodgængerfelt', 'Her er et fodgængerfelt.', 'E 17 står ved selve feltet. Advarselstavlen A 17 står før.'),
      s('E 18', 'Blind vej', 'Vejen ender blindt.', 'En tynd hvid streg kan vise, at vejen fortsætter som sti.'),
      s('E 19', 'Ensrettet færdsel', 'Kun kørsel i pilens retning.', 'Sammenlign med C 19: den forbyder indkørsel, E 19 viser retningen.'),
      s('E 21,1', 'Anbefalet rute for cyklister', 'Anbefalet cykelrute.', 'En anbefaling, ikke et påbud. På dele af ruten kan lille knallert være forbudt.'),
      s('E 31', 'Busholdeplads', 'Her må kun busser i rutekørsel standse.', 'Pladsen må kun bruges af busser i almindelig rutekørsel.'),
      s('E 33', 'Parkering', 'Her kan du parkere.', 'Undertavler kan sætte grænser for tid og retning. Læs dem.'),
      s('E 34', 'Nødplads', 'Plads til nødstop.', 'Kun til nødstilfælde.'),
      s('E 39', 'Anbefalet hastighed', 'Vejen egner sig ikke til højere fart end tallet.', 'Det er en anbefaling og ikke en grænse som C 55. Gælder til E 40 eller en afstand på undertavle.'),
      s('E 42', 'Motorvej', 'Her gælder motorvejsreglerne.', 'Motorvej er grøn. Motortrafikvej (E 43) er blå.'),
      s('E 43', 'Motortrafikvej', 'Her gælder reglerne for motortrafikvej.', 'Andre regler end motorvej, se færdselslovens § 48.'),
      s('E 44', 'Motorvej ophører', 'Slut på motorvejsreglerne.', 'Tavlen bruges normalt ikke, hvor frakørslen går til det almindelige vejnet.'),
      s('E 47', 'Cykelgade', 'Kørebanen er reserveret til cykel og lille knallert.', 'Andre køretøjer må kun køre ind, hvis en undertavle tillader det. Fart normalt under 30 km/t.'),
      s('E 49', 'Gågade', 'Området er reserveret til gående.', 'Kørsel kun med tilladelse, normalt under 15 km/t. Ubetinget vigepligt, når du kører ud af en gågade.'),
      s('E 51', 'Opholds- og legeområde', 'Her må man opholde sig og lege på hele vejen.', 'Fart normalt under 15 km/t. Ubetinget vigepligt, når du kører ud af området.'),
      s('E 53', 'Område med fartdæmpning', 'Vejen er bygget til lav fart, ikke højere end tallet.', 'Det er vejens indretning, der holder farten nede. Tallet er det, vejen er bygget til.'),
      s('E 55', 'Tættere bebygget område', 'Du kører ind i et område med byregler.', 'Det er byskiltet. Det kan også stå som undertavle under C 56.'),
      s('E 56', 'Ophør af tættere bebygget område', 'Du kører ud af byen.', 'Reglerne uden for tættere bebygget område gælder nu.')
    ],
    situations: [
      { text: 'Du kommer ind i et område, hvor børn må lege på hele vejen, og du skal køre meget langsomt. Hvilken tavle?', answer: 'E 51', others: ['E 49', 'E 47', 'E 53'] },
      { text: 'Du kører ind på en vej, der er reserveret til gående. Hvilken tavle?', answer: 'E 49', others: ['E 51', 'E 47', 'E 17'] },
      { text: 'Pladsen foran dig er kun til busser i rutekørsel. Hvilken tavle?', answer: 'E 31', others: ['E 33', 'E 34', 'E 19'] },
      { text: 'Vejen foran dig ender blindt. Hvilken tavle?', answer: 'E 18', others: ['E 19', 'E 44', 'E 17'] },
      { text: 'Du kører op på en vej, hvor motorvejsreglerne gælder. Hvilken tavle?', answer: 'E 42', others: ['E 43', 'E 44', 'E 39'] },
      { text: 'Du kører ud af byen. Hvilken tavle viser det?', answer: 'E 56', others: ['E 55', 'E 44', 'E 53'] },
      { text: 'Hvilken tavle viser, at der kun må køres i pilens retning?', answer: 'E 19', others: ['E 18', 'E 21,1', 'E 31'] }
    ],
    facts: [
      { q: 'Hvordan ser oplysningstavler normalt ud?', options: ['Runde med rød kant', 'Rektangulære med blå bund', 'Trekantede med gul bund', 'Ottekantede'], answer: 1, explain: 'Oplysningstavler er rektangulære med blå bund og hvidt symbol eller tekst, med få undtagelser (§ 24).' },
      { q: 'Hvilken fart er normal i en gågade (E 49) og i et opholds- og legeområde (E 51)?', options: ['Under 15 km/t', 'Under 30 km/t', 'Under 50 km/t', 'Fri fart'], answer: 0, explain: 'I begge områder må der kun køres med meget lav hastighed, normalt under 15 km/t (§ 27).' },
      { q: 'E 39 Anbefalet hastighed viser 60. Hvad betyder det?', options: ['Du må højst køre 60', 'Vejen egner sig ikke til højere fart end 60', 'Du skal mindst køre 60', 'Det gælder kun lastbiler'], answer: 1, explain: 'E 39 er en anbefaling. Hastighedsforbud kommer fra C 55 (§ 27).' },
      { q: 'Du kører ud af en gågade eller et opholds- og legeområde. Hvad gælder?', options: ['Du har fortrinsret', 'Du har ubetinget vigepligt', 'Højre vigepligt', 'Ingen regler'], answer: 1, explain: 'Kørende har ubetinget vigepligt ved udkørsel fra gågade og opholds- og legeområde (§ 27).' }
    ]
  },
  {
    id: 'undertavler', title: 'Undertavler', letter: 'U', kind: 'Undertavle',
    look: 'Lille rektangel under en tavle.', says: 'Ændrer, hvad tavlen betyder.',
    lead: 'En undertavle sidder under en hovedtavle. Den kan præcisere, begrænse eller udvide tavlens betydning med tekst, tal eller symbol. Under advarsels-, vigepligts- og forbudstavler er den hvid, under påbuds- og oplysningstavler blå.',
    source: { para: '§ 9 og § 18 stk. 3', note: 'BEK 425/2023 § 9 (undertavler U) og § 18 stk. 3 (faste ord på undertavler).' },
    signs: [
      s('U 1', 'Afstanden til stedet, hvorfra hovedtavlens angivelse gælder', 'Tallet viser afstanden til stedet, hvor reglen gælder.', 'Bruges ofte som forvarsling, fx under B 11.'),
      s('U 2', 'Hovedtavlens angivelse gælder for en vejstrækning', 'Reglen gælder for en strækning. Tallene viser afstand fra tavlen til start og slut.', 'Det er afstand fra tavlen, ikke strækningens længde.'),
      s('U 3', 'Hovedtavlens angivelse gælder kun i bestemte tider', 'Reglen gælder kun i de viste tidsrum.', 'Sort eller hvid tid er hverdage (ikke lørdag). Tid i parentes er lørdage. Rød tid er søn- og helligdage.'),
      s('U 4', 'Hovedtavlens angivelse gælder kun for bestemte færdselsarter', 'Reglen gælder kun for dem, symbolet viser.', 'Alle andre er ikke omfattet.'),
      s('U 5', 'Hovedtavlens angivelse gælder ikke for den angivne færdselsart', 'Reglen gælder ikke for dem, symbolet viser.', 'Symbolet står ofte med ordet "undtaget".'),
      s('US 2', 'Lastbil samt eventuelt tilkoblet påhængskøretøj', 'Symbol: lastbil, også med påhængskøretøj.', 'Lastbilvogntog er et særskilt symbol.'),
      s('US 8', 'Cykel og lille knallert', 'Symbol: cykel og lille knallert.', 'Symbolet dækker både cykel og lille knallert.')
    ],
    situations: [
      { text: 'Tavlen viser, at reglen først gælder om 500 meter. Hvilken undertavle viser en afstand til stedet?', answer: 'U 1', others: ['U 2', 'U 3', 'U 5'] },
      { text: 'Reglen gælder kun i bestemte tidsrum og på bestemte dage. Hvilken undertavle?', answer: 'U 3', others: ['U 1', 'U 4', 'U 5'] },
      { text: 'Reglen gælder ikke for cyklister. Hvilken undertavle viser en undtagelse?', answer: 'U 5', others: ['U 4', 'U 3', 'U 1'] },
      { text: 'Reglen gælder kun for bestemte køretøjer. Hvilken undertavle viser det?', answer: 'U 4', others: ['U 5', 'U 3', 'U 2'] }
    ],
    facts: [
      { q: 'En undertavle har klokkeslæt i parentes. Hvornår gælder hovedtavlen?', options: ['Hverdage undtagen lørdage', 'Lørdage', 'Søn- og helligdage', 'Hver dag'], answer: 1, explain: 'Klokkeslæt i parentes gælder lørdage (§ 9, U 3).' },
      { q: 'En undertavle har klokkeslæt i rødt. Hvornår gælder hovedtavlen?', options: ['Hverdage', 'Lørdage', 'Søn- og helligdage', 'Aldrig'], answer: 2, explain: 'Klokkeslæt med rødt gælder søn- og helligdage (§ 9, U 3).' },
      { q: 'Hvilken farve har undertavlen under en forbudstavle?', options: ['Hvid', 'Blå', 'Gul', 'Rød'], answer: 0, explain: 'Undertavler til advarsels-, vigepligts- og forbudstavler er hvide. Under påbuds- og oplysningstavler er de blå (§ 9).' },
      { q: 'Hvad betyder "Ærindekørsel tilladt" under en forbudstavle?', options: ['Kørsel i forbindelse med aflevering, afhentning, arbejde, indkøb eller gæstebud er tilladt', 'Alle må køre igennem', 'Kun beboere må køre', 'Kun varebiler må køre'], answer: 0, explain: 'Ærindekørsel er kørsel i forbindelse med aflevering, afhentning, arbejde, indkøb, gæstebud og lignende, og kørsel til og fra egen bolig (§ 18 stk. 3).' },
      { q: 'Hvad betyder "Gælder kun gennemkørsel"?', options: ['Du må ikke bruge vejen uden ærinde', 'Du må ikke parkere', 'Kun lastbiler er forbudt', 'Vejen er ensrettet'], answer: 0, explain: 'Det indebærer, at passage af vejen uden ærinde er ulovligt (§ 18 stk. 3).' },
      { q: 'Hvad betyder "Beboerkørsel tilladt"?', options: ['Kørsel for dem, der har bolig eller virksomhed på strækningen', 'Kun busser må køre', 'Alle må køre', 'Kun cyklister må køre'], answer: 0, explain: 'Beboerkørsel er kørsel, hvor føreren eller en passager har egen bolig eller virksomhed på strækningen (§ 18 stk. 3).' }
    ]
  },
  {
    id: 'lyssignaler', title: 'Lyssignaler', letter: 'X', kind: 'Lyssignal',
    look: 'Lys: rødt, gult, grønt.', says: 'Stop eller kør.',
    lead: 'Lyssignaler styrer trafikken i kryds og over fodgængerfelter. Signalfølgen er rødt, rødt og gult, grønt, gult, rødt. Vognbanesignaler (Y) hænger over den enkelte vognbane.',
    source: { para: '§ 62-68', note: 'BEK 425/2023 § 65-66 (lyssignaler X) og § 68 (vognbanesignaler Y).' },
    signs: [
      s('X 11', 'Hovedsignal', 'Rødt, rødt og gult, grønt og gult. Fire visninger.', 'Rødt og gult samtidig betyder stadig stop. Næste lys er grønt.'),
      s('X 12', 'Pilsignal', 'Pilen gælder for dem, der vil køre i pilens retning.', 'Almindeligvis sidder pilsignalet sammen med hovedsignalet.'),
      s('X 16', 'Cyklistsignal', 'Signalet gælder for cyklister.', 'Har en lille cykeltavle over den røde åbning. Gælder også lille knallert på samme areal.'),
      s('X 18', 'Fodgængersignal', 'Rød stående person: stop. Grøn gående: gå.', 'Hvor der er flere signaler i din retning, gælder det nærmeste.'),
      s('X 19', 'Bus- og letbanesignal samt signal for nulemissionsbil', 'Hvide lys i åbningerne svarer til de almindelige farver: rødt, rødt og gult, grønt.', 'Gælder busser i rutekørsel, letbanekøretøjer og nulemissionsbiler.'),
      s('Y 17', 'Vognbanesignal', 'Rødt kryds: vognbanen er lukket. Grøn pil: åben. Gul pil blinker: skift vognbane.', 'Hænger over den vognbane, signalet gælder for.')
    ],
    situations: [
      { text: 'Over din vognbane hænger et rødt kryds. Hvilket signal er det?', answer: 'Y 17', others: ['X 11', 'X 12', 'X 19'] },
      { text: 'Du er buschauffør i rutekørsel og ser hvidt lys i alle åbninger. Hvilket signal?', answer: 'X 19', others: ['X 11', 'X 16', 'X 18'] },
      { text: 'Du går mod fodgængerfeltet og ser en rød stående person. Hvilket signal?', answer: 'X 18', others: ['X 16', 'X 11', 'Y 17'] },
      { text: 'Du kører bil og venter ved et kryds. Hvilket signal viser rødt, rødt og gult, grønt og gult?', answer: 'X 11', others: ['X 12', 'X 16', 'X 18'] }
    ],
    facts: [
      { q: 'Rødt og gult lys vises samtidig. Hvad betyder det?', options: ['Kør', 'Stop. Signalet skifter snart til grønt', 'Sæt farten ned og kør', 'Stop. Signalet skifter til rødt'], answer: 1, explain: 'Rødt og gult samtidig har samme betydning som rødt, men viser, at grønt kommer (§ 65).' },
      { q: 'Signalet skifter fra grønt til gult, da du er tæt på stoplinjen. Hvad gør du?', options: ['Standser altid, uanset hvad', 'Standser ikke, hvis standsning vil medføre fare', 'Speeder op', 'Kører videre og kigger ikke'], answer: 1, explain: 'Gult betyder stop, men du skal ikke standse, hvis standsning ville medføre fare (§ 65).' },
      { q: 'Hvad betyder rødt lys?', options: ['Stop før stoplinjen. Er der ingen, så i betryggende afstand før krydset', 'Sæt farten ned', 'Kør forsigtigt', 'Skift vognbane'], answer: 0, explain: 'Du skal standse før stoplinjen, eller i betryggende afstand før krydset (§ 65).' },
      { q: 'Hvad betyder en gul blinkende diagonal pil på et Y 17 Vognbanesignal?', options: ['Vognbanen er åben', 'Du skal snarest køre over i vognbanen, pilen peger mod', 'Vognbanen er lukket for altid', 'Du skal sætte farten ned til 30'], answer: 1, explain: 'Trafikanter i vognbanen skal snarest køre over i den vognbane, pilen peger mod (§ 68).' }
    ]
  },
  {
    id: 'afmaerkning', title: 'Afmærkning på vejen', letter: 'Q', kind: 'Afmærkning',
    look: 'Hvid maling på vejen.', says: 'Linjer og pile viser, hvor du kører.',
    lead: 'Afmærkning på kørebanen er hvid. Gul bruges kun til midlertidig regulering, fx vejarbejde. Længdelinjer deler vognbaner, pile viser retning, og tværlinjer viser, hvor du skal holde tilbage eller stoppe.',
    source: { para: '§ 53-59', note: 'BEK 425/2023 § 53-59 (afmærkning på kørebanen: længdeafmærkning Q, pile R, tværafmærkning S).' },
    signs: [
      s('Q 41', 'Vognbanelinje', 'Smal punkteret linje: kort streg, langt mellemrum.', 'Du må krydse den, hvis det kan ske uden fare eller unødig ulempe for andre.'),
      s('Q 42', 'Varslingslinje', 'Smal punkteret linje: lang streg, kort mellemrum.', 'Varsler en spærrelinje. Vær ekstra opmærksom, hvis du krydser den.'),
      s('Q 44', 'Spærrelinje', 'Smal ubrudt linje.', 'Må ikke overskrides, heller ikke ved vending eller svingning. Kun ved særlige forhold og med særlig agtpågivenhed.'),
      s('Q 45', 'Spærreflade', 'Skraveret eller helt hvidt areal. Ingen kørsel, standsning eller parkering.', 'Skal passeres på den side, hvor skraveringen peger fremad.'),
      s('Q 46', 'Ubrudt kantlinje', 'Linjen begrænser den del af vejen, motorkøretøjer skal bruge.', 'Må kun krydses i få tilfælde, fx ved standsning eller parkering.'),
      s('Q 47', 'Punkteret kantlinje', 'Her må du krydse kantlinjen, hvis det ikke strider mod andre regler.', 'Forskellen på Q 46 er, at den ubrudte må du ikke krydse.'),
      s('R 11', 'Vognbanepile', 'Pile foran kryds: du skal køre i den viste retning.', 'Gælder, når du kører ind i krydset fra den vognbane.'),
      s('S 11', 'Vigelinje', 'Trekanter på tværs. De, som spidsen peger mod, har ubetinget vigepligt.', 'Bruges normalt sammen med B 11.'),
      s('S 13', 'Stoplinje', 'Bred ubrudt linje på tværs. Her skal du stoppe.', 'Gælder ved B 13, rødt eller gult trafiksignal og rødt blinksignal.'),
      s('S 17', 'Fodgængerfelt', 'Brede striber på tværs. Her går de gående over.', 'Det er den del af vejen, der er bestemt for gående.')
    ],
    situations: [
      { text: 'En ubrudt linje midt på vejen. Du må ikke krydse den, heller ikke for at vende. Hvilken afmærkning?', answer: 'Q 44', others: ['Q 41', 'Q 42', 'Q 47'] },
      { text: 'Et skraveret område på vejen foran dig. Du må ikke køre på det. Hvilken afmærkning?', answer: 'Q 45', others: ['Q 44', 'Q 46', 'S 17'] },
      { text: 'Trekanter på tværs af din vej, spidsen peger mod dig. Hvilken afmærkning?', answer: 'S 11', others: ['S 13', 'S 17', 'Q 44'] },
      { text: 'Du holder for rødt og skal stoppe bag en bred ubrudt linje på tværs. Hvilken afmærkning?', answer: 'S 13', others: ['S 11', 'S 17', 'Q 46'] },
      { text: 'Linjen i vejkanten er punkteret. Hvilken afmærkning er det?', answer: 'Q 47', others: ['Q 46', 'Q 44', 'Q 41'] }
    ],
    facts: [
      { q: 'Hvilken farve har afmærkning på kørebanen normalt?', options: ['Hvid', 'Gul', 'Rød', 'Blå'], answer: 0, explain: 'Afmærkning på kørebane og cykelsti er hvid. Gul bruges til midlertidig regulering (§ 54).' },
      { q: 'Må du krydse en Q 44 Spærrelinje?', options: ['Nej, ikke engang for at vende', 'Ja, når der er frit', 'Kun ved vending', 'Kun uden for by'], answer: 0, explain: 'Spærrelinjen må ikke overskrides eller krydses, heller ikke ved vending, svingning i kryds eller indkørsel til ejendom (§ 55).' },
      { q: 'Du kører over en skraveret spærreflade (Q 45). Hvilken side skal du passere på?', options: ['Den side, hvor skraveringen peger fremad', 'Den side, hvor skraveringen peger bagud', 'Midt på fladen', 'Hvilken som helst'], answer: 0, explain: 'Skraveret spærreflade skal passeres af motorkøretøjer på den side, hvor skraveringen peger fremad (§ 55).' },
      { q: 'Hvad er forskellen på Q 46 og Q 47?', options: ['Q 46 er ubrudt og må ikke krydses, Q 47 er punkteret og må krydses', 'Q 46 er punkteret og må krydses', 'Ingen forskel', 'Q 47 er altid forbudt'], answer: 0, explain: 'Q 47 Punkteret kantlinje anvendes i stedet for Q 46 for at vise, at linjen må krydses (§ 55).' }
    ]
  }
];

export const GROUP_BY_ID = Object.fromEntries(GROUPS.map(g => [g.id, g]));
export const SIGN_BY_CODE = Object.fromEntries(GROUPS.flatMap(g => g.signs.map(sign => [sign.code, { ...sign, group: g.id }])));
export const MAIN_GROUPS = ['advarsel', 'vigepligt', 'forbud', 'paabud', 'oplysning'];
