# Claude-sparring: faktisk V5-skærmreview

Kilde: brugerens Claude-chat, svar efter tre egne skærmbilleder. Scope: billedkritik plus QA-fakta fortalt af os, ikke hands-on eller kørelærergodkendelse.

Kort dom: flowet hænger sammen nu. Det, der står tilbage, er aflæsning og finish. “Bevist” betyder, at det kan ses på billederne; “hypotese” betyder, at det skal afprøves.

P1 · Scenen skiller ikke vej fra omgivelser

Bevist: asfalt og bygningsblokke er næsten samme mørke blå. Den krydsende vej kan kun aflæses på de tynde hvide streger, både på desktop og i mobilintroen.
Hypotese: førstegangsbrugere bruger tid på at finde ud af, hvilken vej der er sidevejen, før de kan se fejlen. Det rammer netop observationstrinnet.
Ret: lysere asfalt end blokkene, synlige kantsten og lyspøler på vejen frem for på tagene.

P2 · Genafspilningen forklarer sig selv to steder og det forkerte sted

Bevist: “0 KM/T · FULDT STOP” står både som chip og som skilt i scenen.
Bevist: forklaringen “Blå bil: din rettelse. Grå spøgelsesbil: fejlklippet.” står nederst i højre spalte, langt fra bilerne. Under scenen på desktop er der en stor tom flade.
Ret: én etiket og en lille farveforklaring i scenens hjørne.

P2 · Humoren modsiger sig selv

Bevist: Rune Rulle er “Stop & Søns bogholder” og kommer med undskyldningen, men Stop & Søn afviser den bagefter på kvitteringen. Kvitteringen hedder “Rolig rettelse”, mens brainrot står på ON. “SIKKER OMKAMP · 0 KR” er uklart.
Ret: gør Rune til føreren, lad Stop & Søn være den, der afviser, og lad etiketten følge den valgte tilstand.

P3 · Mobilintroen

Bevist: introteksten står direkte på scenen uden mørk baggrund, og hvide vejstriber krydser bag den. Øverst til venstre i scenen er der en tom, afrundet boks.
Hypotese: introen viser allerede den blå bil holdende ved linjen. Det kan afsløre, hvad man skal lede efter, før klippet er set.

Blocker for privat afprøvning med mennesker: jeg ser ingen. P1 er netop det, en afprøvning bør måle: tid til første tryk i fejlspot, og om testpersonen kan pege på sidevejen uden hjælp.

Billederne viser hverken blandingen af svarpositioner, at indstillingerne gemmes, eller at resultatet er det samme efter genindlæsning. Det hviler på jeres QA.

## Implementeret efter review

Lysere asfalt, mørkere bygninger, kantsten med fri åbning ved kryds/cykelsti; én replay-etiket og farveforklaring i scenen; Rune er fører, Stop & Søn udsteder kvitteringen; intro får mørk tekstflade og ingen tom chip. Introen står før fejlklippets begyndelse; start genafspiller klippet. Ændringerne kræver efterfølgende faktisk pixel- og browserkontrol.
