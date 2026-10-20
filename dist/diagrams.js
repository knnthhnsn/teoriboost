// Original inline SVG support diagrams for NATKØRSEL question situations.
// The question text remains authoritative; these diagrams never encode the answer.

const C = Object.freeze({
  bg: '#101923', panel: '#172532', road: '#263642', road2: '#334754',
  mint: '#9ae6b4', coral: '#ff8178', white: '#f4f6ef', muted: '#9fb0bd',
  yellow: '#f4cd63', blue: '#70b7e8', red: '#e85b65', dark: '#0b1219',
});

const TYPE_BY_ID = Object.freeze({
  'q-001':'cockpit-fit', 'q-002':'assist-speed', 'q-003':'brake-check',
  'q-004':'tyre-light-check', 'q-005':'oil-warning', 'q-006':'curb-start-bike',
  'q-007':'training-cone', 'q-008':'driveway-reverse', 'q-009':'door-bike',
  'q-010':'motorway-exit', 'q-011':'blind-spot', 'q-012':'truck-turn',
  'q-013':'night-motorcycle', 'q-014':'bike-approach', 'q-015':'cargo',
  'q-016':'hidden-ball', 'q-017':'phone-traffic', 'q-018':'fatigue',
  'q-019':'party-plan', 'q-020':'wet-tailgater', 'q-021':'icy-bridge',
  'q-022':'rain-lights', 'q-023':'blind-crest', 'q-024':'school-edge',
  'q-025':'railway-queue', 'q-026':'police-signal', 'q-027':'blocked-junction',
  'q-028':'indicator-uncertain', 'q-029':'ambulance-crossing', 'q-030':'crash-site',
  'q-031':'forecourt-yield', 'q-032':'stop-clear', 'q-033':'right-priority',
  'q-034':'right-turn-bike', 'q-035':'roundabout-exit', 'q-036':'wet-speed',
  'q-037':'lane-change', 'q-038':'narrow-obstacle', 'q-039':'overtaken',
  'q-040':'motorway-puncture', 'q-041':'eco-load', 'q-042':'blind-bend',
  'q-043':'wet-braking', 'q-044':'leaf-bend', 'q-045':'child-seat',
  'q-046':'home-study', 'q-047':'exam-format', 'q-048':'exam-review',
  'q-049':'clock-trip', 'q-050':'new-driver', 'q-051':'crossroad-6m',
  'q-052':'crosswalk-3m', 'q-053':'two-minute-stop', 'q-054':'boarding-four',
  'q-055':'parking-disc', 'q-056':'footway-cycleway', 'q-057':'accessible-bay',
  'q-058':'yield-clear', 'q-059':'stop-line', 'q-060':'speed-60-wet',
  'q-061':'island-left', 'q-062':'roadworks-yellow', 'q-063':'rear-lights-rain',
  'q-064':'stop-hidden-view', 'q-065':'yield-cyclist', 'q-066':'bike-alongside',
  'q-067':'t-junction-right', 'q-068':'crosswalk-person', 'q-069':'clock-0500',
  'q-070':'clock-2000', 'q-071':'farm-yield', 'q-072':'forward-curb-practice',
  'q-073':'parallel-30cm', 'q-074':'living-street-child', 'q-075':'cycle-street-bump',
  'q-076':'left-turn-motorcycle', 'q-077':'left-turn-two-way-cycle',
  'q-078':'light-rail-red', 'q-079':'light-rail-classroom',
  'q-080':'lesson-goal-reflection', 'q-081':'gps-late-lane',
  'q-082':'high-edge-recovery', 'q-083':'public-road-edge-plan',
});

const LABEL_BY_TYPE = Object.freeze({
  'cockpit-fit':'Indstil bil og sikr løs bagage',
  'assist-speed':'Synligt vejarbejdsskilt og assistentvisning',
  'brake-check':'Bremsepedal synker under fast tryk',
  'tyre-light-check':'Dæk og blinklys ved morgenkontrol',
  'oil-warning':'Rød olietrykslampe under kørsel',
  'curb-start-bike':'Igangsætning fra kant med cyklist',
  'training-cone':'Skarpt sving på lukket plads',
  'driveway-reverse':'Bakning over fortov ved hæk',
  'door-bike':'Bildør åbnes mod cykelsti',
  'motorway-exit':'Misset afkørsel på motorvej',
  'blind-spot':'Motorcykel i venstre blinde vinkel',
  'truck-turn':'Lang lastbil drejer skarpt højre',
  'night-motorcycle':'Ét modkørende lys i mørket',
  'bike-approach':'Elcyklist nærmer sig højresving',
  'cargo':'Tung løs last i bagagerum',
  'hidden-ball':'Bold kommer mellem parkerede biler',
  'phone-traffic':'Telefonbesked i tæt trafik',
  'fatigue':'Træt fører efter søvnløs nat',
  'party-plan':'Bil og alkohol kræver plan',
  'wet-tailgater':'Tæt bagvedkørende på våd vej',
  'icy-bridge':'Skyggefuld bro i frostvejr',
  'rain-lights':'Kort sigt og slukkede baglygter',
  'blind-crest':'Bakketop skjuler modkørende bane',
  'school-edge':'Skjult fortov ved skole',
  'railway-queue':'Ingen plads efter jernbanesporet',
  'police-signal':'Grønt lys og politiets stoptegn',
  'blocked-junction':'Grønt lys men blokeret kryds',
  'indicator-uncertain':'Blinklys uden bekræftet bevægelse',
  'ambulance-crossing':'Ambulance bagfra ved rødt',
  'crash-site':'Uheld på mørk landevej',
  'forecourt-yield':'Udkørsel over fortov og cykelsti',
  'stop-clear':'STOP ved tomt overskueligt kryds',
  'right-priority':'Bil kommer fra højre',
  'right-turn-bike':'Cyklist ved siden af højresving',
  'roundabout-exit':'Gående og cyklist ved udkørsel',
  'wet-speed':'Våd vej og kort sigt',
  'lane-change':'Bil ligger i venstre målbane',
  'narrow-obstacle':'Varebil spærrer egen side',
  'overtaken':'Bagvedkørende har trukket ud',
  'motorway-puncture':'Punktering og sikkert nødspor',
  'eco-load':'Tom tagboks og lavt dæktryk',
  'blind-bend':'Uoverskueligt sving forude',
  'wet-braking':'Kø opdages tidligt på våd vej',
  'leaf-bend':'Løse blade i skarpt sving',
  'child-seat':'Barn 120 cm uden passende stol',
  'home-study':'Hjemmetræning uden lærerregistrering',
  'exam-format':'Digital prøve med 25 situationer',
  'exam-review':'Markeret situation med tid tilbage',
  'clock-trip':'Solotur krydser klokken 20.00',
  'new-driver':'Første kørekort er ét år gammelt',
  'crossroad-6m':'Bil holder 6 m fra krydset',
  'crosswalk-3m':'Bil standser 3 m før felt',
  'two-minute-stop':'To minutters ventetid ved kanten',
  'boarding-four':'Sammenhængende påstigning i fire minutter',
  'parking-disc':'Onsdag 10.00 med P-skive',
  'footway-cycleway':'Bil på fortov og cykelsti',
  'accessible-bay':'Reserveret bås uden parkeringskort',
  'yield-clear':'B 11 ved tomt kryds',
  'stop-line':'B 13 med godt udsyn',
  'speed-60-wet':'C 55 med 60 i regn',
  'island-left':'Påbudt passage venstre om helle',
  'roadworks-yellow':'Gule linjer leder forbi arbejde',
  'rear-lights-rain':'Dagsregn med slukkede baglygter',
  'stop-hidden-view':'STOP-linje før skjult udsyn',
  'yield-cyclist':'Cyklist fra højre ved hajtænder',
  'bike-alongside':'Cyklist når op langs højre side',
  't-junction-right':'Ureguleret T-kryds fra højre',
  'crosswalk-person':'Gående på vej ud i felt',
  'clock-0500':'Solokørsel præcis klokken 05.00',
  'clock-2000':'Ledsagerkrav præcis klokken 20.00',
  'farm-yield':'Privat gårdudkørsel over fortov',
  'forward-curb-practice':'Forlæns parkering på lukket plads',
  'parallel-30cm':'Parallel bil 30 cm fra højre kant',
  'living-street-child':'Barn i opholds- og legeområde',
  'cycle-street-bump':'To cyklister og bump i cykelgade',
  'left-turn-motorcycle':'Venstresving med modkørende motorcykel',
  'left-turn-two-way-cycle':'Venstresving over dobbeltrettet cykelsti',
  'light-rail-red':'Rødt signal ved letbanespor',
  'light-rail-classroom':'Letbaneundervisning uden mulig køretur',
  'lesson-goal-reflection':'Praktisk lektion med mål og refleksion',
  'gps-late-lane':'GPS foreslår sent vognbaneskift',
  'high-edge-recovery':'Højre hjul langs høj vejkant',
  'public-road-edge-plan':'Tom offentlig vej uden kørelærer',
});

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function safeId(value) {
  return String(value || 'question').replace(/[^a-zA-Z0-9_-]/g, '-');
}

function line(x1,y1,x2,y2,stroke=C.white,width=3,dash='') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''} stroke-linecap="round"/>`;
}
function rect(x,y,w,h,fill,rx=0,stroke='',sw=0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${sw}"`:''}/>`;
}
function circle(x,y,r,fill,stroke='',sw=0) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${sw}"`:''}/>`;
}
function path(d,fill='none',stroke=C.white,sw=3,dash='') {
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash?` stroke-dasharray="${dash}"`:''} stroke-linecap="round" stroke-linejoin="round"/>`;
}
function txt(x,y,value,size=13,fill=C.white,anchor='start',weight=600) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Inter,system-ui,sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;
}
function group(content, transform='') { return `<g${transform?` transform="${transform}"`:''}>${content}</g>`; }

function car(x,y,rotation=0,color=C.mint,label='') {
  const g = `${rect(-25,-13,50,26,color,7)}${rect(-14,-19,28,10,color,5)}${rect(-9,-16,18,7,C.road2,2)}`+
    `${circle(-16,14,5,C.dark)}${circle(16,14,5,C.dark)}${label?txt(0,4,label,10,C.dark,'middle',800):''}`;
  return group(g,`translate(${x} ${y}) rotate(${rotation})`);
}
function bicycle(x,y,rotation=0,label='') {
  const g = `${circle(-13,8,11,'none',C.coral,3)}${circle(13,8,11,'none',C.coral,3)}`+
    `${line(-13,8,-2,-6,C.coral,3)}${line(-2,-6,7,8,C.coral,3)}${line(7,8,-13,8,C.coral,3)}`+
    `${line(-2,-6,13,8,C.coral,3)}${circle(-1,-15,5,C.white)}${line(-1,-10,-2,-2,C.white,3)}`+
    `${label?txt(0,31,label,9,C.coral,'middle',700):''}`;
  return group(g,`translate(${x} ${y}) rotate(${rotation})`);
}
function motorcycle(x,y,rotation=0,label='') {
  const g = `${circle(-12,8,9,'none',C.coral,3)}${circle(12,8,9,'none',C.coral,3)}`+
    `${line(-12,8,0,-6,C.coral,3)}${line(0,-6,12,8,C.coral,3)}${rect(-7,-9,17,7,C.coral,3)}`+
    `${circle(0,-17,6,C.white)}${label?txt(0,30,label,9,C.coral,'middle',700):''}`;
  return group(g,`translate(${x} ${y}) rotate(${rotation})`);
}
function tram(x,y,rotation=0,label='LETBANE') {
  const g = `${rect(-60,-22,120,44,C.coral,8,C.white,2)}${rect(-47,-14,25,17,C.dark,3)}${rect(-13,-14,25,17,C.dark,3)}${rect(21,-14,25,17,C.dark,3)}`+
    `${circle(-38,23,6,C.dark)}${circle(38,23,6,C.dark)}${txt(0,14,label,9,C.white,'middle',800)}`;
  return group(g,`translate(${x} ${y}) rotate(${rotation})`);
}
function cone(x,y) {
  return `<g transform="translate(${x} ${y})"><path d="M 0 -18 L -12 15 H 12 Z" fill="${C.coral}"/><rect x="-16" y="15" width="32" height="5" rx="2" fill="${C.white}"/></g>`;
}
function person(x,y,color=C.coral,scale=1) {
  return group(`${circle(0,-17,6,C.white)}${line(0,-10,0,10,color,5)}${line(0,-3,-9,5,color,4)}${line(0,-3,9,5,color,4)}${line(0,10,-7,22,color,4)}${line(0,10,7,22,color,4)}`,`translate(${x} ${y}) scale(${scale})`);
}
function roadHorizontal() {
  return `${rect(0,85,640,210,C.road)}${line(0,190,640,190,C.white,2,'18 18')}${line(0,90,640,90,C.muted,2)}${line(0,290,640,290,C.muted,2)}`;
}
function roadVertical() {
  return `${rect(205,36,230,284,C.road)}${line(320,36,320,320,C.white,2,'16 16')}${line(210,36,210,320,C.muted,2)}${line(430,36,430,320,C.muted,2)}`;
}
function crossRoad() { return `${roadHorizontal()}${roadVertical()}`; }
function zebra(x,y,w=90,h=52,vertical=false) {
  let out='';
  for(let i=0;i<6;i++) out += vertical ? rect(x+i*15,y,8,h,C.white,1) : rect(x,y+i*9,w,5,C.white,1);
  return out;
}
function yieldTeeth(x,y,count=5,approach='bottom') {
  // I SVG-scenerne kommer ego nedefra; S11-spidsen skal derfor pege mod +y.
  const tip=approach==='bottom'?13:-13;
  let s=''; for(let i=0;i<count;i++) s+=`<path d="M ${x+i*18} ${y} l 7 ${tip} l 7 ${-tip} z" fill="${C.white}"/>`;
  return s;
}
function stopSign(x,y,label='STOP') {
  const p='0,-24 17,-17 24,0 17,17 0,24 -17,17 -24,0 -17,-17';
  return group(`<polygon points="${p}" fill="${C.red}" stroke="${C.white}" stroke-width="4"/>${txt(0,5,label,10,C.white,'middle',900)}`,`translate(${x} ${y})`);
}
function yieldSign(x,y) {
  return group(`<path d="M 0 23 L -22 -17 L 22 -17 Z" fill="${C.white}" stroke="${C.red}" stroke-width="6"/>`,`translate(${x} ${y})`);
}
function speedSign(x,y,value) {
  return group(`${circle(0,0,24,C.white,C.red,6)}${txt(0,7,value,18,C.dark,'middle',900)}`,`translate(${x} ${y})`);
}
function signal(x,y,active='green') {
  const colors={red:C.red,yellow:C.yellow,green:'#58d58b'};
  return group(`${rect(-13,-33,26,66,C.dark,6,C.muted,2)}${circle(0,-21,7,active==='red'?colors.red:'#3a4650')}${circle(0,0,7,active==='yellow'?colors.yellow:'#3a4650')}${circle(0,21,7,active==='green'?colors.green:'#3a4650')}`,`translate(${x} ${y})`);
}
function dimension(x1,y1,x2,y2,label) {
  return `${line(x1,y1,x2,y2,C.yellow,2,'5 4')}${line(x1,y1-7,x1,y1+7,C.yellow,2)}${line(x2,y2-7,x2,y2+7,C.yellow,2)}${rect((x1+x2)/2-24,(y1+y2)/2-14,48,20,C.dark,4)}${txt((x1+x2)/2,(y1+y2)/2+1,label,12,C.yellow,'middle',800)}`;
}
function panelCard(x,y,w,h,title,value,color=C.white) {
  return `${rect(x,y,w,h,C.panel,10,C.road2,2)}${txt(x+14,y+22,title,10,C.muted,'start',700)}${txt(x+w/2,y+h/2+15,value,24,color,'middle',850)}`;
}
function rain() { let s=''; for(let x=35;x<625;x+=32)s+=line(x,55,x-9,78,C.blue,2); return s; }
function clock(x,y,value) {
  return `${circle(x,y,47,C.panel,C.white,3)}${txt(x,y+7,value,22,C.white,'middle',850)}`;
}
function dashboardShell() {
  return `${path('M 55 275 Q 90 95 320 80 Q 550 95 585 275',C.panel,C.road2,4)}${circle(320,220,78,C.dark,C.muted,5)}${circle(320,220,48,'none',C.mint,5)}${line(320,220,356,190,C.mint,5)}`;
}
function neutralFrame() {
  return `${rect(35,52,570,238,C.panel,16,C.road2,2)}${line(55,270,585,270,C.road2,2)}`;
}

function diagramBody(type, q, uid) {
  switch(type) {
    case 'cockpit-fit':
      return `${dashboardShell()}${rect(82,114,76,100,C.road2,14)}${line(96,128,145,128,C.muted,4)}${line(96,148,140,148,C.muted,4)}${txt(120,232,'Sæde',11,C.muted,'middle')}${rect(474,91,74,42,C.road2,5)}${line(480,103,540,96,C.blue,3)}${circle(498,212,13,C.muted)}${rect(486,220,28,45,C.coral,5)}${txt(500,282,'Løs flaske',10,C.coral,'middle')}`;
    case 'assist-speed':
      return `${dashboardShell()}${panelCard(92,110,130,82,'ASSISTENT','80',C.blue)}${speedSign(492,150,'50')}${rect(450,193,85,14,C.yellow,2)}${line(460,207,450,245,C.yellow,4)}${line(525,207,535,245,C.yellow,4)}${txt(492,266,'Vejarbejde',11,C.yellow,'middle')}`;
    case 'brake-check':
      return `${neutralFrame()}${rect(235,82,170,160,C.dark,18)}${rect(273,101,94,34,C.muted,8)}${line(320,135,320,211,C.yellow,4,'6 5')}<path d="M 310 200 l 10 14 l 10 -14" fill="none" stroke="${C.yellow}" stroke-width="4"/>${txt(320,258,'Fast tryk',13,C.white,'middle')}`;
    case 'tyre-light-check':
      return `${neutralFrame()}${circle(190,169,70,C.dark,C.muted,18)}${path('M 157 122 l 18 18 l -12 20', 'none',C.coral,5)}${dimension(153,241,227,241,'1,3 mm')}${panelCard(370,102,150,110,'HØJRE BLINK','hurtigt',C.yellow)}${line(390,230,500,230,C.yellow,5,'4 8')}`;
    case 'oil-warning':
      return `${dashboardShell()}${circle(320,144,28,C.red)}${path('M 302 145 h 28 v 16 h -28 z M 330 149 l 13 -9',C.red,C.white,3)}${circle(347,160,4,C.red)}${txt(320,292,'Sikker holdeplads',11,C.muted,'middle')}`;
    case 'curb-start-bike':
      return `${roadHorizontal()}${rect(0,82,640,24,C.panel)}${line(0,107,640,107,C.white,3)}${car(250,235,0,C.mint,'EGO')}${bicycle(170,138,0)}${path('M 270 215 Q 280 165 240 145','none',C.yellow,3,'7 5')}${txt(190,72,'Kantsten',10,C.muted,'middle')}${txt(123,155,'Bagfra',10,C.coral,'middle')}`;
    case 'training-cone':
      return `${rect(35,55,570,225,C.road,18)}${path('M 90 235 Q 260 65 535 215','none',C.white,3,'18 14')}${car(287,157,-28,C.mint,'EGO')}<path d="M 395 193 l 14 35 h -28 z" fill="${C.coral}"/>${line(409,228,381,228,C.white,3)}${path('M 294 145 Q 350 160 391 194','none',C.yellow,3,'5 5')}`;
    case 'driveway-reverse':
      return `${roadHorizontal()}${rect(390,35,165,95,C.road2)}${line(390,120,555,120,C.white,3)}${car(470,112,90,C.mint,'EGO')}${rect(550,55,35,120,'#355c4a',6)}${person(538,158,C.coral,.8)}${path('M 457 138 Q 420 165 390 180','none',C.yellow,3,'6 5')}${txt(475,72,'Indkørsel',10,C.muted,'middle')}`;
    case 'door-bike':
      return `${roadHorizontal()}${rect(0,88,640,48,C.panel)}${line(0,136,640,136,C.white,3)}${car(330,238,0,C.mint,'EGO')}${line(355,224,383,205,C.mint,6)}${bicycle(250,145,0)}${path('M 250 172 Q 290 185 350 194','none',C.coral,3,'7 5')}${txt(333,104,'Cykelsti',11,C.muted,'middle')}`;
    case 'motorway-exit':
      return `${rect(0,55,640,240,C.road)}${line(213,55,213,295,C.white,2,'16 15')}${line(426,55,426,295,C.white,2,'16 15')}${line(548,55,610,126,C.white,3)}${car(320,230,0,C.mint,'EGO')}${rect(462,72,120,42,'#286d55',5,C.white,2)}${txt(522,98,'NÆSTE 5 km',13,C.white,'middle',800)}${txt(563,158,'Nødspor',10,C.muted,'middle')}`;
    case 'blind-spot':
      return `${roadHorizontal()}${line(320,90,320,290,C.white,2,'16 14')}${car(395,225,0,C.mint,'EGO')}${bicycle(318,174,0)}${path('M 380 205 Q 345 160 310 155','none',C.yellow,3,'5 5')}${rect(455,120,75,35,C.panel,6,C.muted,2)}${txt(492,142,'Spejl',10,C.muted,'middle')}`;
    case 'truck-turn':
      return `${crossRoad()}${group(`${rect(-55,-18,110,36,C.coral,6)}${rect(35,-15,34,30,C.coral,5)}${circle(-35,21,6,C.dark)}${circle(28,21,6,C.dark)}${circle(54,18,6,C.dark)}`,'translate(330 165) rotate(-18)')}${car(220,246,0,C.mint,'EGO')}${path('M 390 165 Q 435 180 430 238','none',C.yellow,4,'8 5')}`;
    case 'night-motorcycle':
      return `${roadHorizontal()}${car(210,230,0,C.mint,'EGO')}${car(325,230,0,C.coral,'LANGSOM')}${circle(516,144,7,C.white)}${path('M 516 151 l -38 58 h 76 z','rgba(244,246,239,.08)','none',0)}${txt(516,126,'Ét lys',10,C.white,'middle')}`;
    case 'bike-approach':
      return `${roadHorizontal()}${rect(0,88,640,48,C.panel)}${line(0,136,640,136,C.white,3)}${car(340,226,0,C.mint,'EGO')}${bicycle(255,145,0)}${path('M 250 169 Q 300 185 340 185','none',C.coral,3,'6 5')}${path('M 340 208 Q 385 178 404 142','none',C.yellow,4,'7 5')}`;
    case 'cargo':
      return `${neutralFrame()}${path('M 145 230 L 170 105 H 470 L 500 230 Z',C.road2,C.muted,3)}${rect(215,145,210,75,C.dark,7)}${rect(320,112,82,54,C.coral,5)}${txt(361,143,'TUNG',12,C.white,'middle',850)}${path('M 360 105 q 22 -22 44 0','none',C.yellow,3,'5 5')}`;
    case 'hidden-ball':
      return `${roadHorizontal()}${car(205,170,0,C.coral)}${car(360,170,0,C.coral)}${circle(287,235,10,C.yellow,C.white,2)}${path('M 290 225 Q 305 196 320 182','none',C.yellow,2,'5 5')}${rect(255,105,72,22,C.panel,5)}${txt(291,120,'Skjult område',9,C.muted,'middle')}`;
    case 'phone-traffic':
      return `${dashboardShell()}${rect(455,102,78,128,C.dark,11,C.muted,3)}${rect(464,116,60,78,C.panel,5)}${circle(494,211,5,C.muted)}${txt(494,145,'BESKED',10,C.white,'middle')}${car(220,128,0,C.coral)}${car(405,128,0,C.coral)}`;
    case 'fatigue':
      return `${dashboardShell()}${circle(320,134,26,C.white)}${path('M 307 134 q 7 7 14 0 M 326 134 q 7 7 14 0','none',C.dark,3)}${path('M 315 149 q 6 7 12 0','none',C.dark,3)}${txt(320,292,'Søvnløs nat',12,C.muted,'middle')}`;
    case 'party-plan':
      return `${neutralFrame()}${car(180,180,0,C.mint,'BIL')}${line(300,100,300,235,C.road2,3)}${path('M 405 110 h 52 l -8 70 h -36 z',C.panel,C.white,3)}${line(416,145,447,145,C.coral,5)}${circle(431,203,24,C.panel,C.muted,2)}${txt(431,209,'?',20,C.white,'middle',850)}`;
    case 'wet-tailgater':
      return `${roadHorizontal()}${rain()}${car(385,205,0,C.mint,'EGO')}${car(285,205,0,C.coral)}${dimension(309,270,359,270,'tæt')}`;
    case 'icy-bridge':
      return `${roadHorizontal()}${rect(145,83,350,214,'rgba(112,183,232,.14)',8)}${line(145,87,145,294,C.blue,5)}${line(495,87,495,294,C.blue,5)}${car(280,220,0,C.mint,'EGO')}${txt(320,121,'SKYGGE · FROST',13,C.blue,'middle',800)}${path('M 420 190 Q 490 155 550 190','none',C.white,3,'10 8')}`;
    case 'rain-lights':
      return `${roadHorizontal()}${rain()}${car(310,210,0,C.mint,'EGO')}${circle(280,210,5,C.white)}${circle(340,210,5,C.white)}${rect(410,120,130,64,C.panel,7)}${txt(475,144,'BAGLYS',10,C.muted,'middle')}${txt(475,169,'SLUKKET',15,C.coral,'middle',850)}`;
    case 'blind-crest':
      return `${path('M 0 256 Q 250 250 370 125 Q 480 72 640 190 L 640 310 L 0 310 Z',C.road,C.muted,2)}${path('M 0 270 Q 250 265 370 142 Q 480 90 640 205','none',C.white,2,'18 14')}${car(225,225,-12,C.mint,'EGO')}${group(`${rect(-40,-14,80,28,C.coral,5)}${circle(-24,16,5,C.dark)}${circle(24,16,5,C.dark)}`,'translate(310 185) rotate(-22)')}${txt(450,91,'Udsyn skjult',11,C.muted,'middle')}`;
    case 'school-edge':
      return `${roadHorizontal()}${rect(0,40,640,50,C.panel)}${txt(82,72,'SKOLE',14,C.white,'middle',850)}${car(210,150,0,C.coral)}${car(350,150,0,C.coral)}${line(375,136,398,113,C.coral,5)}${person(285,122,C.coral,.65)}${rect(250,105,75,27,'rgba(16,25,35,.8)',5)}${txt(287,123,'skjult',9,C.muted,'middle')}`;
    case 'railway-queue':
      return `${roadVertical()}${line(165,145,475,145,C.muted,7)}${line(165,178,475,178,C.muted,7)}${line(180,133,180,190,C.white,3)}${line(215,133,215,190,C.white,3)}${line(425,133,425,190,C.white,3)}${line(460,133,460,190,C.white,3)}${line(170,96,235,138,C.white,7)}${circle(166,92,7,C.red)}${car(375,246,90,C.mint,'EGO')}${car(375,101,90,C.coral)}${car(375,58,90,C.coral)}${txt(515,166,'SPOR',11,C.muted,'middle')}`;
    case 'police-signal':
      return `${crossRoad()}${signal(490,91,'green')}${person(365,142,C.blue,1.1)}${line(365,139,342,117,C.white,5)}${rect(330,100,24,20,C.red,4)}${car(375,250,90,C.mint,'EGO')}`;
    case 'blocked-junction':
      return `${crossRoad()}${signal(490,91,'green')}${car(375,253,90,C.mint,'EGO')}${car(250,165,0,C.coral)}${car(330,165,0,C.coral)}${car(410,165,0,C.coral)}${line(323,276,427,276,C.yellow,4)}`;
    case 'indicator-uncertain':
      return `${crossRoad()}${car(405,140,0,C.coral)}${circle(378,139,6,C.yellow)}${path('M 377 118 h -28 l 9 -9 M 349 118 l 9 9','none',C.yellow,3)}${txt(405,211,'Hjul står stille',10,C.muted,'middle')}${car(375,250,90,C.mint,'EGO')}`;
    case 'ambulance-crossing':
      return `${crossRoad()}${signal(487,92,'red')}${car(375,255,90,C.mint,'EGO')}${car(375,305,90,C.white,'112')}${circle(360,286,5,C.blue)}${circle(390,286,5,C.blue)}${person(255,164,C.coral,.8)}${person(285,164,C.coral,.8)}`;
    case 'crash-site':
      return `${roadHorizontal()}${car(380,175,-18,C.coral)}${person(485,240,C.coral,.8)}${car(175,250,0,C.mint,'EGO')}${line(420,118,420,258,C.yellow,2,'6 7')}${txt(470,275,'Grøft',10,C.muted,'middle')}`;
    case 'forecourt-yield':
    case 'farm-yield':
      return `${roadHorizontal()}${rect(235,35,170,100,C.road2)}${line(235,133,405,133,C.white,3)}${car(320,115,90,C.mint,'EGO')}${bicycle(240,168,0)}${car(450,225,0,C.coral)}${txt(320,70,type==='farm-yield'?'PRIVAT GÅRD':'TANKSTATION',11,C.white,'middle',800)}`;
    case 'stop-clear':
      return `${crossRoad()}${stopSign(472,247)}${line(323,238,427,238,C.white,7)}${car(375,273,90,C.mint,'EGO')}${txt(320,116,'Frit udsyn · tomt kryds',11,C.muted,'middle')}`;
    case 'right-priority':
    case 't-junction-right':
      return `${type==='t-junction-right'?`${roadVertical()}${rect(320,95,320,150,C.road)}${line(320,170,640,170,C.white,2,'16 14')}`:crossRoad()}${car(375,255,90,C.mint,'EGO')}${car(448,type==='t-junction-right'?135:140,180,C.coral)}${txt(470,105,'Fra højre',10,C.coral,'middle')}`;
    case 'right-turn-bike':
    case 'bike-alongside':
      return `${crossRoad()}${rect(398,185,34,135,C.panel)}${line(398,185,398,320,C.white,3)}${car(365,235,90,C.mint,'EGO')}${bicycle(415,type==='bike-alongside'?230:218,-90)}${path('M 365 205 Q 370 165 430 160','none',C.yellow,4,'7 5')}${txt(414,292,'Cykelsti',10,C.muted,'middle')}`;
    case 'roundabout-exit':
      return `${circle(250,175,95,C.road,C.muted,3)}${circle(250,175,45,C.panel)}${rect(250,130,390,90,C.road)}${zebra(438,130,58,90,true)}${car(330,174,0,C.mint,'EGO')}${bicycle(286,254,-35)}${person(475,105,C.coral,.8)}`;
    case 'wet-speed':
    case 'speed-60-wet':
      return `${roadHorizontal()}${rain()}${speedSign(500,125,type==='wet-speed'?'80':'60')}${car(275,220,0,C.mint,'EGO')}${txt(490,262,'Kort sigt',11,C.muted,'middle')}`;
    case 'lane-change':
      return `${roadHorizontal()}${line(320,90,320,290,C.white,2,'16 14')}${car(410,215,0,C.mint,'EGO')}${car(345,160,0,C.coral)}${path('M 408 195 Q 385 170 360 166','none',C.yellow,3,'7 5')}`;
    case 'narrow-obstacle':
      return `${roadHorizontal()}${group(`${rect(-42,-15,84,30,C.coral,5)}${circle(-25,18,5,C.dark)}${circle(25,18,5,C.dark)}`,'translate(410 230)')}${car(255,220,0,C.mint,'EGO')}${car(355,147,180,C.coral)}${txt(420,267,'Egen side',10,C.muted,'middle')}`;
    case 'overtaken':
      return `${roadHorizontal()}${line(320,90,320,290,C.white,2,'18 16')}${car(405,220,0,C.mint,'EGO')}${car(280,175,0,C.coral)}${path('M 284 205 Q 300 178 320 170','none',C.coral,3,'6 5')}${txt(245,139,'Allerede trukket ud',10,C.coral,'middle')}`;
    case 'motorway-puncture':
      return `${rect(0,55,640,240,C.road)}${line(180,55,180,295,C.white,2,'18 16')}${line(420,55,420,295,C.white,3)}${rect(425,55,175,240,C.road2)}${car(510,205,0,C.mint,'EGO')}${circle(490,220,9,C.dark,C.coral,4)}${txt(510,270,'Nødspor',10,C.muted,'middle')}`;
    case 'eco-load':
      return `${neutralFrame()}${car(200,185,0,C.mint,'EGO')}${rect(160,142,80,20,C.coral,10)}${txt(200,133,'Tom tagboks',10,C.muted,'middle')}${circle(410,165,54,C.dark,C.muted,14)}${txt(410,238,'Lavt tryk',11,C.coral,'middle')}`;
    case 'blind-bend':
      return `${rect(0,55,640,240,C.road)}${path('M 75 275 C 210 110 360 295 570 95','none',C.white,3,'17 15')}${path('M 10 265 C 205 55 365 260 520 55','none',C.muted,3)}${path('M 140 315 C 250 175 375 330 635 160','none',C.muted,3)}${car(166,235,-36,C.mint,'EGO')}${rect(405,75,130,30,C.panel,6)}${txt(470,95,'Uoverskueligt',10,C.muted,'middle')}`;
    case 'wet-braking':
      return `${roadHorizontal()}${rain()}${car(180,220,0,C.mint,'EGO')}${car(440,220,0,C.coral)}${car(510,220,0,C.coral)}${dimension(220,267,400,267,'god afstand')}${txt(475,135,'KØ',12,C.coral,'middle',850)}`;
    case 'leaf-bend':
      return `${rect(0,55,640,240,C.road)}${path('M 70 280 C 200 90 420 300 575 95','none',C.white,3,'18 15')}${car(175,230,-34,C.mint,'EGO')}${circle(360,193,7,'#c68e52')}${circle(385,210,6,'#a36f43')}${circle(410,180,8,'#c79d4c')}${circle(435,202,6,'#9d7445')}${txt(400,246,'Løse blade',10,C.yellow,'middle')}`;
    case 'child-seat':
      return `${neutralFrame()}${person(205,165,C.coral,1.3)}${dimension(145,236,265,236,'120 cm')}${rect(378,103,100,132,C.road2,16,C.muted,3)}${path('M 392 127 h 72 v 92 h -72 z','none',C.muted,4)}${txt(428,258,'Stol i anden bil',10,C.muted,'middle')}`;
    case 'home-study':
      return `${neutralFrame()}${rect(105,90,220,145,C.dark,10,C.muted,3)}${txt(215,120,'TEORIBOOST',14,C.mint,'middle',850)}${rect(130,145,170,12,C.road2,6)}${rect(130,145,170,12,C.mint,6)}${txt(215,188,'Kapitler gennemført',11,C.white,'middle')}${panelCard(375,105,145,100,'KØRELÆRER','ikke registreret',C.coral)}`;
    case 'exam-format':
      return `${neutralFrame()}${rect(90,82,460,155,C.dark,10,C.muted,3)}${txt(125,112,'KATEGORI B',11,C.mint)}${txt(500,112,'25',22,C.white,'end',850)}${txt(505,112,' situationer',10,C.muted)}${rect(125,135,340,15,C.road2,5)}${rect(125,165,340,15,C.road2,5)}${rect(125,195,340,15,C.road2,5)}${circle(490,142,7,C.white)}${circle(490,172,7,C.white)}${circle(490,202,7,C.white)}`;
    case 'exam-review':
      return `${neutralFrame()}${rect(88,82,464,160,C.dark,10,C.muted,3)}${txt(120,113,'TEORIBOOST · SITUATION 8',12,C.white)}${rect(120,135,180,18,C.road2,5)}${rect(120,165,180,18,C.road2,5)}${rect(120,195,180,18,C.road2,5)}${rect(360,132,145,34,C.yellow,7)}${txt(432,154,'MARKERET',11,C.dark,'middle',850)}${txt(432,204,'Tid tilbage',11,C.mint,'middle')}`;
    case 'clock-trip':
      return `${neutralFrame()}${clock(205,163,'19.45')}${path('M 270 163 H 370','none',C.yellow,4,'8 6')}<path d="M 370 163 l -12 -8 v 16 z" fill="${C.yellow}"/>${clock(435,163,'20.10')}${txt(320,245,'Ingen ledsager',11,C.coral,'middle')}`;
    case 'new-driver':
      return `${neutralFrame()}${panelCard(95,102,190,105,'ALDER','32 år',C.white)}${panelCard(355,102,190,105,'FØRSTE B-KØREKORT','1 år',C.mint)}${txt(320,248,'På vej til middag',11,C.muted,'middle')}`;
    case 'crossroad-6m':
      return `${crossRoad()}${car(150,244,0,C.mint,'EGO')}${dimension(176,275,205,275,'6 m')}${line(205,238,205,292,C.yellow,2)}${txt(205,224,'Krydskant',9,C.muted,'middle')}`;
    case 'crosswalk-3m':
      return `${roadHorizontal()}${zebra(405,113,70,150,true)}${car(270,225,0,C.mint,'EGO')}${dimension(295,275,405,275,'3 m')}${person(215,142,C.coral,.75)}`;
    case 'two-minute-stop':
      return `${roadHorizontal()}${car(315,225,0,C.mint,'EGO')}${clock(470,160,'2 min')}${txt(315,270,'Lovlig vejkant',10,C.muted,'middle')}`;
    case 'boarding-four':
      return `${roadHorizontal()}${car(300,225,0,C.mint,'EGO')}${person(375,195,C.coral,.85)}${clock(475,145,'4 min')}${rect(90,105,74,78,C.blue,7,C.white,2)}${txt(127,133,'C 62',13,C.white,'middle',850)}${txt(127,157,'P forbudt',9,C.white,'middle')}`;
    case 'parking-disc':
      return `${neutralFrame()}${rect(90,95,170,120,C.blue,8,C.white,3)}${txt(175,126,'E 33',16,C.white,'middle',850)}${txt(175,151,'2 timer · P-skive',11,C.white,'middle')}${txt(175,176,'hverdage 8–18',11,C.white,'middle')}${clock(440,155,'10.00')}${txt(440,225,'Onsdag',11,C.muted,'middle')}`;
    case 'footway-cycleway':
      return `${roadHorizontal()}${rect(0,70,640,64,C.panel)}${rect(0,134,640,42,C.road2)}${line(0,134,640,134,C.white,3)}${car(325,150,0,C.mint,'EGO')}${txt(110,108,'FORTOV',10,C.muted,'middle')}${txt(110,160,'CYKELSTI',10,C.muted,'middle')}`;
    case 'accessible-bay':
      return `${rect(155,65,330,215,C.road,8,C.white,4)}${circle(320,145,29,'none',C.blue,6)}${circle(320,107,8,C.blue)}${path('M 320 124 v 56 h 44 l 18 33 M 320 157 l -32 37','none',C.blue,7)}${clock(510,135,'2 min')}${txt(320,261,'Intet parkeringskort',11,C.coral,'middle')}`;
    case 'yield-clear':
      return `${crossRoad()}${yieldSign(473,247)}${yieldTeeth(330,236,5,'bottom')}${car(375,275,90,C.mint,'EGO')}${txt(320,116,'Overskueligt · ingen trafik',11,C.muted,'middle')}`;
    case 'stop-line':
      return `${crossRoad()}${stopSign(473,247)}${line(323,238,427,238,C.white,7)}${car(375,275,90,C.mint,'EGO')}${txt(320,116,'Godt udsyn · tomt kryds',11,C.muted,'middle')}`;
    case 'island-left':
      return `${roadVertical()}${rect(282,118,76,105,C.panel,38,C.muted,3)}${circle(320,150,28,C.blue,C.white,3)}${path('M 332 137 l -22 25 M 310 162 h 18','none',C.white,5)}${car(250,260,90,C.mint,'EGO')}${path('M 280 255 Q 235 220 240 165','none',C.yellow,4,'7 5')}`;
    case 'roadworks-yellow':
      return `${rect(0,55,640,240,C.road)}${path('M 315 295 Q 315 190 205 65','none',C.yellow,5)}${line(400,295,400,65,C.white,3,'18 14')}${rect(390,65,185,170,'rgba(232,91,101,.15)',5)}${rect(420,92,100,12,C.coral,2)}${line(430,104,420,145,C.coral,4)}${line(510,104,520,145,C.coral,4)}${person(470,190,C.coral,.75)}${car(315,260,90,C.mint,'EGO')}`;
    case 'rear-lights-rain':
      return `${roadHorizontal()}${rain()}${car(320,210,0,C.mint,'EGO')}${circle(295,212,7,C.dark,C.muted,2)}${circle(345,212,7,C.dark,C.muted,2)}${txt(320,265,'Baglygter slukket',11,C.coral,'middle')}${txt(520,115,'DAG',12,C.white,'middle',850)}`;
    case 'stop-hidden-view':
      return `${crossRoad()}${stopSign(474,250)}${line(323,240,427,240,C.white,7)}${rect(435,73,95,145,'#4c5961',3)}${car(375,276,90,C.mint,'EGO')}${path('M 375 244 Q 390 214 416 197','none',C.yellow,3,'7 5')}${txt(483,66,'Mur spærrer udsyn',10,C.muted,'middle')}`;
    case 'yield-cyclist':
      return `${crossRoad()}${yieldTeeth(330,237,5,'bottom')}${car(375,276,90,C.mint,'EGO')}${bicycle(430,140,180)}${path('M 430 165 H 365','none',C.coral,3,'6 5')}${txt(455,103,'Fra højre',10,C.coral,'middle')}`;
    case 'crosswalk-person':
      return `${roadHorizontal()}${zebra(370,112,72,155,true)}${person(405,90,C.coral,.8)}${car(245,220,0,C.mint,'EGO')}${path('M 405 117 v 30','none',C.coral,3,'5 4')}`;
    case 'clock-0500':
      return `${dashboardShell()}${clock(320,154,'05.00')}${txt(320,282,'17 år · ingen ledsager · Danmark',11,C.muted,'middle')}`;
    case 'clock-2000':
      return `${dashboardShell()}${clock(320,154,'20.00')}${txt(320,282,'17 år · bilen holder · Danmark',11,C.muted,'middle')}`;
    case 'forward-curb-practice':
      return `${rect(120,55,400,240,C.road,14,C.muted,2)}${line(430,55,430,295,C.white,6)}${line(465,55,465,295,C.road2,2)}`+
        `${cone(370,92)}${cone(370,258)}${cone(420,92)}${cone(420,258)}${car(300,245,90,C.mint,'EGO')}`+
        `${path('M 300 215 Q 305 150 385 145','none',C.yellow,4,'8 6')}<path d="M 385 145 l -13 -7 l 2 15 z" fill="${C.yellow}"/>`+
        `${txt(462,179,'Højre kant',10,C.muted,'middle')}${txt(205,86,'Lukket øvelsesplads',11,C.white,'middle',800)}`;
    case 'parallel-30cm':
      return `${rect(115,55,410,240,C.road,14,C.muted,2)}${line(438,55,438,295,C.white,7)}${rect(446,55,79,240,C.panel)}`+
        `${car(385,172,90,C.mint,'EGO')}${dimension(402,262,438,262,'30 cm')}${cone(312,91)}${cone(312,257)}`+
        `${txt(472,178,'Kant',10,C.muted,'middle')}${txt(214,87,'Parallel slutstilling',11,C.white,'middle',800)}`;
    case 'living-street-child':
      return `${rect(0,72,640,220,C.road)}${rect(0,72,640,42,C.road2)}${rect(40,85,88,46,C.panel,4,C.muted,2)}${txt(84,112,'BOLIG',11,C.white,'middle',850)}`+
        `${rect(500,62,70,70,C.blue,4,C.white,3)}${person(526,95,C.white,.52)}${circle(550,112,6,C.yellow)}${txt(535,150,'E 51',10,C.muted,'middle')}`+
        `${car(210,230,0,C.mint,'EGO')}${person(392,207,C.coral,.9)}${circle(425,235,9,C.yellow,C.white,2)}`+
        `${path('M 380 255 Q 415 245 438 222','none',C.coral,3,'6 5')}${txt(360,92,'Opholds- og legeområde',11,C.white,'middle',800)}`;
    case 'cycle-street-bump':
      return `${roadHorizontal()}${rect(72,104,82,50,C.blue,5,C.white,2)}${bicycle(112,122,0)}${txt(113,170,'Cykelgade',9,C.muted,'middle')}`+
        `${car(180,238,0,C.mint,'EGO')}${bicycle(375,215,0)}${bicycle(375,255,0)}`+
        `${rect(515,198,28,82,C.road2,4,C.white,2)}${line(521,203,521,275,C.yellow,3,'6 5')}${line(537,203,537,275,C.yellow,3,'6 5')}${txt(529,180,'Bump',10,C.yellow,'middle')}`+
        `${path('M 215 238 H 292','none',C.yellow,3,'8 6')}<path d="M 292 238 l -12 -7 v 14 z" fill="${C.yellow}"/>`+
        `${path('M 405 215 H 451 M 405 255 H 451','none',C.coral,3,'7 5')}<path d="M 451 215 l -11 -6 v 12 z M 451 255 l -11 -6 v 12 z" fill="${C.coral}"/>`;
    case 'left-turn-motorcycle':
      return `${crossRoad()}${signal(510,76,'green')}${car(375,267,90,C.mint,'EGO')}${car(375,199,90,C.coral,'FORAN')}`+
        `${motorcycle(265,91,90,'MODKØRENDE')}${path('M 265 117 V 159','none',C.coral,4,'7 5')}<path d="M 265 159 l -7 -12 h 14 z" fill="${C.coral}"/>`+
        `${path('M 375 240 Q 375 186 304 163 H 247','none',C.yellow,4,'8 6')}<path d="M 247 163 l 12 -7 v 14 z" fill="${C.yellow}"/>`+
        `${path('M 353 218 L 292 112 L 311 215 Z','rgba(16,25,35,.52)','none',0)}${rect(346,117,108,25,C.panel,5)}${txt(400,134,'Udsyn delvist skjult',9,C.muted,'middle')}`;
    case 'left-turn-two-way-cycle':
      return `${rect(0,85,640,150,C.road)}${line(0,160,640,160,C.white,2,'18 18')}${line(0,90,640,90,C.muted,2)}${roadVertical()}`+
        `${rect(0,235,640,35,C.panel)}${line(0,235,640,235,C.white,2)}${line(0,270,640,270,C.white,2)}`+
        `${car(375,302,90,C.mint,'EGO')}${path('M 375 276 V 207 Q 375 159 304 137 H 246','none',C.yellow,4,'8 6')}<path d="M 246 137 l 12 -7 v 14 z" fill="${C.yellow}"/>`+
        `${bicycle(510,253,180)}${path('M 485 253 H 438','none',C.coral,3,'6 5')}<path d="M 438 253 l 11 -6 v 12 z" fill="${C.coral}"/>`+
        `${path('M 75 245 H 110 M 110 261 H 75','none',C.muted,2,'5 4')}<path d="M 110 245 l -9 -5 v 10 z M 75 261 l 9 -5 v 10 z" fill="${C.muted}"/>`+
        `${zebra(120,88,74,147,true)}${person(158,145,C.coral,.82)}${txt(536,222,'Dobbeltrettet cykelsti',9,C.muted,'middle')}`;
    case 'light-rail-red':
      return `${roadVertical()}${line(88,130,552,130,C.muted,6)}${line(88,181,552,181,C.muted,6)}`+
        `${line(110,118,110,194,C.white,2)}${line(155,118,155,194,C.white,2)}${line(485,118,485,194,C.white,2)}${line(530,118,530,194,C.white,2)}`+
        `${tram(205,155,0)}${path('M 265 155 H 304','none',C.coral,4,'7 5')}<path d="M 304 155 l -11 -7 v 14 z" fill="${C.coral}"/>`+
        `${line(323,233,427,233,C.white,7)}${car(375,271,90,C.mint,'EGO')}${signal(462,234,'red')}${txt(536,218,'Eget signal',9,C.muted,'middle')}`;
    case 'light-rail-classroom':
      return `${rect(54,62,532,216,C.panel,14,C.road2,2)}${rect(84,88,255,158,C.dark,7,C.muted,2)}`+
        `${path('M 112 211 Q 162 122 226 170 T 315 112','none',C.blue,4,'8 5')}${circle(112,211,7,C.mint)}${circle(315,112,7,C.coral)}`+
        `${txt(210,232,'Rute kan ikke nå letbanen',10,C.muted,'middle')}${clock(450,132,'45 min')}`+
        `${rect(383,194,140,38,C.road2,6,C.muted,2)}${txt(453,218,'PLAN 7.21',11,C.white,'middle',850)}`;
    case 'lesson-goal-reflection':
      return `${rect(45,60,550,220,C.panel,14,C.road2,2)}${person(116,178,C.blue,.95)}${person(525,178,C.mint,.95)}`+
        `${rect(175,82,290,146,C.dark,10,C.muted,2)}${txt(205,112,'FØR',10,C.muted)}${txt(205,139,'Mål: ikke aftalt',14,C.white)}`+
        `${path('M 205 164 H 430','none',C.yellow,3,'9 6')}<path d="M 430 164 l -11 -7 v 14 z" fill="${C.yellow}"/>`+
        `${txt(205,195,'EFTER',10,C.muted)}${txt(270,195,'Opfølgning: ikke planlagt',13,C.coral)}`+
        `${txt(116,231,'Kørelærer',10,C.muted,'middle')}${txt(525,231,'Elev',10,C.muted,'middle')}`;
    case 'gps-late-lane':
      return `${roadHorizontal()}${line(320,90,320,290,C.white,2,'18 14')}${car(205,235,0,C.mint,'EGO')}`+
        `${car(372,155,0,C.coral)}${car(455,155,0,C.coral)}${car(535,155,0,C.coral)}`+
        `${rect(70,105,95,78,C.dark,8,C.muted,2)}${path('M 92 158 H 125 V 125','none',C.blue,5)}<path d="M 125 125 l -8 12 h 16 z" fill="${C.blue}"/>${txt(117,174,'GPS',9,C.muted,'middle')}`+
        `${path('M 232 218 Q 278 183 335 171','none',C.yellow,3,'7 5')}${txt(420,120,'Tæt trafik i målbanen',10,C.coral,'middle')}`;
    case 'high-edge-recovery':
      return `${rect(0,70,640,155,C.road)}${line(0,225,640,225,C.white,7)}${rect(0,232,640,63,'#293e36')}`+
        `${car(315,222,0,C.mint,'EGO')}${rect(135,99,188,28,C.panel,5)}${txt(229,118,'For høj fart til direkte retur',10,C.yellow,'middle',800)}`+
        `${line(120,238,530,238,C.coral,3,'7 6')}${txt(320,266,'Høj vejkant · højre hjul udenfor',11,C.muted,'middle')}${txt(490,102,'Køreteknisk anlæg',10,C.white,'middle',800)}`;
    case 'public-road-edge-plan':
      return `${path('M 0 255 Q 195 170 640 95 L 640 235 Q 225 292 0 330 Z',C.road,C.muted,2)}`+
        `${path('M 0 292 Q 220 208 640 132','none',C.white,2,'18 15')}${path('M 0 330 Q 225 292 640 235','none',C.coral,5)}`+
        `${car(310,229,-12,C.mint,'EGO')}${rect(72,80,156,39,C.panel,6,C.muted,2)}${txt(150,105,'OFFENTLIG LANDEVEJ',10,C.white,'middle',850)}`+
        `${txt(502,276,'Høj rabatkant',10,C.muted,'middle')}${txt(151,137,'Ingen lærer · ingen afspærring',9,C.coral,'middle')}`;
    default:
      return `${neutralFrame()}${panelCard(115,105,170,105,'SCENE',q.sectionId||'situation',C.mint)}${panelCard(355,105,170,105,'STATUS','se teksten',C.white)}`;
  }
}

function legend() {
  return `${rect(22,330,11,11,C.mint,2)}${txt(39,340,'Egen bil',10,C.muted)}${rect(112,330,11,11,C.coral,2)}${txt(129,340,'Anden trafik',10,C.muted)}${txt(618,340,'Støtteillustration · teksten afgør vilkårene',10,C.muted,'end',600)}`;
}

export function questionDiagram(q) {
  const question = q && typeof q === 'object' ? q : {};
  const type = TYPE_BY_ID[question.id] || 'neutral-context';
  const uid = `nat-${safeId(question.id)}-${safeId(question.sectionId)}`;
  const label = LABEL_BY_TYPE[type] || 'Situationen vises skematisk';
  const aria = `Støtteillustration til ${question.id || 'spørgsmålet'}: ${question.context || label}. Opgaveteksten angiver alle afgørende betingelser.`;
  const body = diagramBody(type, question, uid);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="${esc(aria)}" data-question="${esc(question.id || '')}" data-diagram="${esc(type)}">`+
    `<title>${esc(label)}</title><desc>${esc('Skematisk støtteillustration. Opgaveteksten er afgørende.')}</desc>`+
    `<defs><linearGradient id="${uid}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bg}"/><stop offset="1" stop-color="#0b1219"/></linearGradient></defs>`+
    `${rect(0,0,640,360,`url(#${uid}-bg)`)}`+
    `${rect(18,14,604,28,'rgba(23,37,50,.94)',7)}${txt(32,33,label,12,C.white,'start',750)}`+
    `<g aria-hidden="true">${body}</g>${legend()}</svg>`;
}
