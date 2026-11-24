// Ordering exercises. Every sequence is taken from the app's own source-checked rule cards and lessons
// (sectionId points at the card; its sources are shown with the feedback). Nothing here is new content.
export const SEQUENCES = [
  { id: 'saede-spejle', sectionId: 'cockpit', title: 'Før du kører', prompt: 'Du sætter dig i en bil, som en anden har indstillet. Hvad gør du, og i hvilken rækkefølge?',
    steps: ['Indstil sæde og ryglæn', 'Tjek, at pedaler og rat kan betjenes uden at strække kroppen', 'Indstil spejlene fra den færdige siddestilling'],
    explanation: 'Spejlene indstilles fra den færdige siddestilling. Flytter du sædet bagefter, ændrer du også det udsnit, spejlene viser.' },
  { id: 'kantsten', sectionId: 'start-stop', title: 'Sæt i gang fra kantstenen', prompt: 'Du holder ved kantstenen og vil køre ud. Sæt trinene i rækkefølge.',
    steps: ['Orientér dig fremad', 'Kig i spejlene', 'Orientér dig direkte mod de skjulte områder', 'Sæt i gang, når der er et sikkert hul'],
    explanation: 'Vurder ikke kun, om vejen er tom nu, men også om en cyklist eller bil kan nå frem, mens bilen forlader kanten.' },
  { id: 'doeren', sectionId: 'doer-aabning', title: 'Åbn døren mod trafikken', prompt: 'Du holder langs en cykelsti og vil stige ud. Hvordan åbner du døren?',
    steps: ['Tjek i spejlet', 'Tjek direkte bagud', 'Åbn døren en smal sprække', 'Åbn helt, når området er frit'],
    explanation: 'En cyklist kan være tættere på og hurtigere fremme, end spejlbilledet antyder. En smal sprække lader dig stadig opdage ny trafik.' },
  { id: 'stop-tavle', sectionId: 'stop', title: 'STOP med dårligt udsyn', prompt: 'Ved STOP-tavlen skjuler en hæk trafikken. Sæt dine handlinger i rækkefølge.',
    steps: ['Stands helt ved stoplinjen', 'Kør langsomt frem til der, hvor du kan se', 'Stands igen uden at spærre tværtrafikken', 'Kør, når du ikke tvinger andre til at bremse'],
    explanation: 'STOP kræver fuld standsning ved stoplinjen og derefter ubetinget vigepligt. Er udsynet først frit længere fremme, kører du langsomt frem og stopper igen.' },
  { id: 'hajtaender-trin', sectionId: 'ubetinget', title: 'Hajtænder i trin', prompt: 'Du har ubetinget vigepligt og dårligt udsyn. Hvordan kører du frem?',
    steps: ['Stands om nødvendigt ved hajtænderne', 'Kør langsomt frem og vis, at du holder tilbage', 'Stands igen nærmere skæringen, uden at spærre', 'Kør, når ingen tvinges til at bremse eller ændre placering'],
    explanation: 'Dårligt udsyn kan kræve langsom fremkørsel i flere trin. Du skal vælge et ophold, så andre ikke tvinges til at bremse eller ændre placering.' },
  { id: 'hvem-bestemmer', sectionId: 'anvisninger', title: 'Hvem bestemmer?', prompt: 'Sæt det, der bestemmer mest, øverst.',
    steps: ['Politibetjentens anvisning', 'Lyssignaler', 'Færdselstavler', 'Vejafmærkning', 'De almindelige færdselsregler'],
    explanation: 'En politibetjents anvisning går foran signaler, tavler, vejafmærkning og almindelige regler. Et fungerende lyssignal går foran modstridende vigepligtstavler.' },
  { id: 'udrykning', sectionId: 'udrykning', title: 'Udrykning bagfra', prompt: 'Du hører en sirene og ser blåt blink. Hvad gør du i hvilken rækkefølge?',
    steps: ['Find udrykningen, og se hvad andre gør', 'Sæt farten ned, og skab plads tydeligt', 'Når den er forbi: tjek spejle og blinde vinkler', 'Vend tilbage til din normale placering'],
    explanation: 'Pludselig opbremsning eller et uvarslet sideskift kan blokere mere end det hjælper. Flere udrykningskøretøjer kan følge efter.' },
  { id: 'uheld', sectionId: 'uheld', title: 'Ved et færdselsuheld', prompt: 'Du er indblandet i et uheld. Sæt de første handlinger i rækkefølge.',
    steps: ['Stands', 'Vurder og begræns ny fare', 'Hjælp tilskadekomne', 'Tilkald hjælp', 'Opfyld oplysningspligterne'],
    explanation: 'Stands, vurder og begræns ny fare, hjælp tilskadekomne, tilkald hjælp og opfyld oplysningspligterne. Sikr stedet uden at udsætte dig selv for ny risiko.' },
  { id: 'hoej-vejkant', sectionId: 'hoej-vejkant', title: 'Hjulet over en høj kant', prompt: 'Det ene hjul kommer ud over en høj vejkant. Hvad gør du først?',
    steps: ['Hold rattet roligt, og styr langs kanten', 'Brems forsigtigt, så farten bliver lav', 'Styr kontrolleret tilbage over kanten'],
    explanation: 'Målet er først at stabilisere bilen og sænke farten, ikke at komme tilbage med det samme. Et brat ratudslag kan give tab af kontrol. Øvelsen trænes med kørelærer, ikke på offentlig vej.' },
];

/** A shuffled order that is never already correct (and never the exact reverse for 3 items). */
export function shuffled(n, rnd = Math.random) {
  const idx = [...Array(n).keys()];
  for (let tries = 0; tries < 50; tries++) {
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    if (idx.some((v, i) => v !== i)) return idx;
  }
  return idx.reverse();
}
/** Which positions are right, given the order of original step indexes the learner built. */
export function gradeOrder(order) {
  const rows = order.map((step, pos) => step === pos);
  return { rows, right: rows.filter(Boolean).length, all: rows.every(Boolean) };
}
export const sequenceFor = sectionId => SEQUENCES.find(s => s.sectionId === sectionId) || null;
