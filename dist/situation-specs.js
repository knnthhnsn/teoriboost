// joke: true on an actor hides it in the Prøve (exam mode), where the picture must stay neutral.
// One entry per question that has a 3D situation. x: across the road (right = +), z: along it (ahead = -). Metres.
// The learner's car is always yellow and drives forwards (-z) in the right-hand lane.
const learner = (z = 0, x = 1.7) => ({ t: 'car', learner: true, x, z });
export const SITUATIONS = Object.freeze({
  // Landevej: one lane each way, cyclist and parked cars on the right, an oncoming car.
  'q-084': { road: 'country', actors: [learner(2), { t: 'cyclist', x: 3.2, z: -7 }, { t: 'parked', x: 4.7, z: -5, color: '#7C8FA0' }, { t: 'parked', kind: 'hatch', x: 4.7, z: -10, color: '#B5543A' }, { t: 'car', kind: 'hatch', x: -1.7, z: -26, dir: 'toward', color: '#5F7F6B' }] },
  // Hovedvej krydset af sidevej: a slower car ahead, yield triangle on the side road.
  'q-127': { road: 'junction', jz: -6, actors: [learner(6), { t: 'car', kind: 'hatch', x: 1.7, z: -0.5, color: '#B5543A' }, { t: 'car', x: 8.4, z: -7.6, dir: 'side', color: '#7C8FA0' }], extras: { yieldSign: true }, cam: { pos: [4.2, 12.5, 19], look: [2.8, 0, -2.5] } },
  // Cyklist lige før krydset, plads og frit udsyn.
  'q-131': { road: 'junction', jz: -22, actors: [learner(4), { t: 'cyclist', x: 3.2, z: -4.5 }] },
  // Jernbaneoverkoersel: roede lys, bomme aabne, tog langt vaek.
  // 22 Nov 2026: the e-cyclist comes from BEHIND on the cycle path while you indicate for the right turn ahead (the auto scene put it in front).
  'q-405': { road: 'junction', jz: -16, actors: [{ ...learner(-2), signal: 'R' }, { t: 'cyclist', x: 4.9, z: 2.6 }], extras: { cyclePath: true } },
  'q-099': { road: 'rail', rz: -16, actors: [learner(2)], extras: { redLights: true, barrier: 'up', train: true }, cam: { pos: [2.6, 5.4, 14.5], look: [0.5, 1.7, -1.5] } }, /* 22 Nov 2026: lower and flatter than the default view, so the painted sky shows above the crossing */
  // Hilse med hornet: vennen paa fortovet, og en anden fodgaenger der ikke er imponeret over dyttet.
  'q-212': { road: 'country', actors: [learner(3), { t: 'person', p: 'phone-walker', x: 5.4, z: -9 }, { t: 'person', p: 'wheelchair-finger', x: 4.7, z: -2.5, joke: true }], extras: { town: true } },
  // Sidevind forbi en lastbil.
  'q-176': { road: 'highway', actors: [learner(1, 1.9), { t: 'car', kind: 'lorry', x: -1.7, z: -3, color: '#C2CCD6' }], extras: { wind: true } },
  // ===== 24 Nov 2026: the photo questions q-001 to q-083 get their own 3D situations (Lær and Øv; the AI photo stays in the Prøve). =====
  // Only the ones the automatic scene got wrong are written out here; the rest come from composeSpec like every other question.
  // view: 'outside' forces the chase camera where the subject is the learner's own car or traffic behind it.
  'q-002': { road: 'country', actors: [learner(2), { t: 'person', p: 'road-worker', x: -3.0, z: -10 }], extras: { roadworks: true, signs: ['C 55:50'] } },
  'q-003': { road: 'country', actors: [learner(2, 3.2)], extras: { town: true }, cam: { pos: [8.4, 1.5, 6.2], look: [3.8, 0.45, 2.6] }, mark: [4.2, 0.4, 3.53] },
  'q-006': { road: 'country', actors: [{ ...learner(2, 3.4), signal: 'L' }, { t: 'cyclist', x: 2.0, z: 10, rear: true }], extras: { town: true }, view: 'driver', mirrors: ['rear', 'left'] },
  'q-008': { road: 'country', actors: [{ t: 'car', learner: true, x: 7.4, z: -4, rot: 0 }, { t: 'person', p: 'kid-ball', x: 6.4, z: -7.4 }, { t: 'parked', kind: 'hatch', x: 4.7, z: 6, color: '#7C8FA0' }], extras: { town: true }, view: 'outside', cam: { pos: [-3.5, 7.5, 6], look: [5.6, 0.4, -4.8] } },
  'q-009': { road: 'country', actors: [learner(2, 3.0), { t: 'cyclist', x: 4.9, z: 11, rear: true }], extras: { cyclePath: true, town: true }, view: 'driver', mirrors: ['rear', 'right'] },
  'q-010': { road: 'highway', actors: [learner(2), { t: 'car', kind: 'hatch', x: 1.7, z: -14, color: '#B5543A' }], extras: {} },
  'q-011': { road: 'country', actors: [learner(2, 3.7), { t: 'car', kind: 'scooter', x: 0.6, z: 4.2, color: '#3F5F73', rear: true }], extras: { lanes: 2, town: true }, view: 'driver', mirrors: ['rear', 'left'] },
  'q-012': { road: 'junction', jz: -16, actors: [learner(4), { t: 'car', kind: 'lorry', x: 0.9, z: -10, color: '#C2CCD6', signal: 'R' }], extras: { town: true } },
  'q-013': { road: 'country', env: 'night', actors: [learner(4), { t: 'car', kind: 'hatch', x: 1.7, z: -6, color: '#7C8FA0' }, { t: 'car', kind: 'scooter', x: -1.7, z: -42, dir: 'toward', color: '#3F5F73' }], extras: {} },
  // q-014: højresving, hvor elcyklisten kommer bagfra på cykelstien. Eleven ser det fra førersædet
  // og skal opdage cyklisten i bakspejlet og højre sidespejl, ligesom i en rigtig bil.
  'q-014': { road: 'junction', jz: -12, actors: [{ ...learner(2), signal: 'R' }, { t: 'cyclist', x: 4.9, z: 7.5, rear: true }], extras: { cyclePath: true }, view: 'driver', mirrors: ['rear', 'right'] },
  'q-016': { road: 'country', actors: [learner(4), { t: 'parked', kind: 'sedan', x: 4.7, z: -5, color: '#7C8FA0' }, { t: 'parked', kind: 'hatch', x: 4.7, z: -12.5, color: '#B5543A' }, { t: 'person', p: 'kid-ball', x: 2.2, z: -8.2 }], extras: { town: true } },
  'q-018': { road: 'country', actors: [{ t: 'car', learner: true, x: -3.6, z: -1.2 }], extras: {}, studio: ['coffee-clock'], cam: { pos: [0.8, 5.8, 12.5], look: [0.8, 1.5, -0.6] } },
  'q-021': { road: 'country', actors: [learner(4)], extras: { bridge: true, bend: 'right' } },
  'q-022': { road: 'country', env: 'rain', actors: [learner(2)], extras: {}, cam: { pos: [5.1, 2.0, 9.0], look: [1.7, 0.8, 3.4] }, mark: [2.5, 0.8, 4.15] },
  'q-024': { road: 'country', actors: [learner(4), { t: 'parked', kind: 'sedan', x: 4.7, z: -6, color: '#7C8FA0' }, { t: 'parked', kind: 'hatch', x: 4.7, z: -12, color: '#B5543A' }, { t: 'person', p: 'dad-shoulders', x: 3.6, z: -9 }], extras: { town: true, school: true } },
  'q-025': { road: 'rail', rz: -14, actors: [learner(2), { t: 'car', kind: 'hatch', x: 1.7, z: -22, color: '#B5543A' }, { t: 'car', kind: 'lorry', x: 1.7, z: -31, color: '#7C8FA0' }], extras: { barrier: 'up' } },
  'q-026': { road: 'junction', jz: -16, actors: [learner(4), { t: 'car', kind: 'police', x: -2.4, z: -13, rot: Math.PI / 2 + 0.5, blink: true, color: '#F4F5F7' }], extras: { trafficLight: 'green' } },
  'q-027': { road: 'junction', jz: -16, actors: [learner(4), { t: 'car', kind: 'hatch', x: 1.7, z: -16, color: '#B5543A' }, { t: 'car', kind: 'sedan', x: 1.7, z: -23, color: '#7C8FA0' }, { t: 'car', kind: 'lorry', x: 1.7, z: -31, color: '#C2CCD6' }], extras: { trafficLight: 'green' } },
  'q-028': { road: 'junction', jz: -14, actors: [learner(4), { t: 'car', kind: 'hatch', x: 5.9, z: -12.4, rot: Math.PI, signal: 'R', color: '#B5543A' }], extras: {} },
  'q-029': { road: 'junction', jz: -14, actors: [learner(2), { t: 'person', p: 'phone-walker', x: -1.2, z: -9.5 }, { t: 'person', p: 'pram-mum', x: 2.6, z: -9.8 }], extras: { trafficLight: 'red', zebra: true, lanes: 2 } },
  'q-031': { road: 'country', actors: [{ t: 'car', learner: true, x: 8.2, z: 0, rot: Math.PI }, { t: 'car', kind: 'hatch', x: 1.7, z: 8, color: '#B5543A' }, { t: 'cyclist', x: 4.9, z: -8, dir: 'toward' }], extras: { cyclePath: true }, view: 'outside', cam: { pos: [-5, 6.5, 12], look: [5, 0.4, -1] } },
  'q-032': { road: 'junction', jz: -14, actors: [learner(4)], extras: { signs: ['B 13'], paint: ['stop'] } },
  'q-033': { road: 'junction', jz: -14, actors: [learner(4), { t: 'car', kind: 'sedan', x: 5.9, z: -12.4, rot: Math.PI, color: '#7C8FA0' }], extras: {} },
  'q-034': { road: 'junction', jz: -12, actors: [{ ...learner(2), signal: 'R' }, { t: 'cyclist', x: 4.9, z: 5.6, rear: true }], extras: { cyclePath: true }, view: 'driver', mirrors: ['right'] },
  'q-036': { road: 'country', env: 'rain', actors: [learner(2)], extras: { signs: ['C 55:80'] } },
  'q-037': { road: 'country', actors: [learner(2, 3.7)], extras: { lanes: 2 }, view: 'driver', mirrors: ['rear', 'left'] },
  'q-038': { road: 'country', actors: [learner(4), { t: 'parked', kind: 'sedan', x: 2.4, z: -9, color: '#F4F5F7' }, { t: 'car', kind: 'hatch', x: -1.5, z: -15, dir: 'toward', color: '#5F7F6B' }], extras: { town: true, narrow: true } },
  'q-043': { road: 'country', env: 'rain', actors: [learner(4), { t: 'car', kind: 'hatch', x: 1.7, z: -40, color: '#B5543A' }, { t: 'car', kind: 'sedan', x: 1.7, z: -47, color: '#7C8FA0' }, { t: 'car', kind: 'lorry', x: 1.7, z: -56, color: '#C2CCD6' }], extras: { lampsOn: true } },
  'q-045': { road: 'country', actors: [learner(2)], extras: { town: true }, cam: { pos: [5.9, 3.4, 6.6], look: [1.7, 1.1, 2.4] }, mark: [2.1, 1.05, 1.85] },
  'q-047': { road: 'country', actors: [{ t: 'car', learner: true, x: -3.6, z: -1.2 }], extras: {}, studio: ['laptop'], cam: { pos: [0.8, 5.8, 12.5], look: [0.8, 1.5, -0.6] } },
  'q-048': { road: 'country', actors: [{ t: 'car', learner: true, x: -3.6, z: -1.2 }], extras: {}, studio: ['laptop', 'coffee-clock'], cam: { pos: [0.8, 5.8, 12.5], look: [0.8, 1.5, -0.6] } },
  'q-051': { road: 'junction', jz: -14, actors: [learner(-0.8, 3.4)], extras: { town: true }, view: 'outside', cam: { pos: [-4.5, 9, 9], look: [3, 0, -6] } },
  'q-052': { road: 'country', actors: [{ ...learner(-1, 3.4), blink: true }, { t: 'person', p: 'phone-walker', x: 5.4, z: -0.4 }], extras: { zebra: true, town: true }, view: 'outside' },
  'q-053': { road: 'country', actors: [learner(0, 3.6)], extras: {}, view: 'outside' },
  'q-054': { road: 'country', actors: [learner(0, 3.4), { t: 'person', p: 'granny-rollator', x: 5.3, z: 0.6 }], extras: { town: true, signs: ['C 62'] }, view: 'outside' },
  'q-055': { road: 'country', actors: [learner(4)], extras: { town: true, bays: true, signs: ['E 33'] } },
  'q-056': { road: 'country', actors: [learner(0, 4.3)], extras: { cyclePath: true, town: true }, view: 'outside' },
  'q-057': { road: 'country', actors: [learner(4), { t: 'person', p: 'wheelchair-cheer', x: 5.6, z: -6 }], extras: { town: true, bays: true, signs: ['E 33'] } },
  'q-059': { road: 'junction', jz: -14, actors: [learner(4)], extras: { signs: ['B 13'], paint: ['stop'] } },
  'q-060': { road: 'country', env: 'rain', actors: [learner(2)], extras: { signs: ['C 55:60'] } },
  'q-061': { road: 'country', actors: [learner(4)], extras: { island: true, signs: ['D 15'] } },
  'q-063': { road: 'country', env: 'rain', actors: [learner(2)], extras: {}, cam: { pos: [5.1, 2.0, 9.0], look: [1.7, 0.8, 3.4] }, mark: [2.5, 0.8, 4.15] },
  'q-064': { road: 'junction', jz: -12, actors: [learner(2)], extras: { town: true, signs: ['B 13'], paint: ['stop'] } },
  'q-065': { road: 'junction', jz: -14, actors: [learner(4), { t: 'cyclist', x: 6.4, z: -15.2, rot: Math.PI }], extras: { sharkTeeth: true } },
  'q-066': { road: 'junction', jz: -12, actors: [{ ...learner(2), signal: 'R' }, { t: 'cyclist', x: 4.9, z: 5.2, rear: true }], extras: { cyclePath: true }, view: 'driver', mirrors: ['rear', 'right'] },
  'q-067': { road: 'junction', jz: -14, actors: [learner(4)], extras: {} },
  'q-070': { road: 'country', actors: [{ t: 'car', learner: true, x: -3.6, z: -1.2 }], extras: {}, studio: ['licence', 'coffee-clock'], cam: { pos: [0.8, 5.8, 12.5], look: [0.8, 1.5, -0.6] } },
  'q-071': { road: 'country', actors: [{ t: 'car', learner: true, x: 8.2, z: 0, rot: Math.PI }, { t: 'cyclist', x: 3.0, z: -9, dir: 'toward' }, { t: 'car', kind: 'sedan', x: -1.7, z: -20, dir: 'toward', color: '#7C8FA0' }], extras: {}, view: 'outside', cam: { pos: [-5, 6.5, 12], look: [5, 0.4, -1] } },
  'q-074': { road: 'country', actors: [learner(4), { t: 'person', p: 'kid-ball', x: 0.6, z: -11 }], extras: { town: true, signs: ['E 51'] } },
  'q-075': { road: 'country', actors: [learner(4), { t: 'cyclist', x: 0.9, z: -7 }, { t: 'cyclist', x: 2.6, z: -7.6 }], extras: { town: true, bumps: true } },
  'q-076': { road: 'junction', jz: -16, actors: [learner(4), { t: 'car', kind: 'hatch', x: 1.7, z: -4, color: '#B5543A', signal: 'L' }, { t: 'car', kind: 'scooter', x: -1.7, z: -30, dir: 'toward', color: '#3F5F73' }], extras: { trafficLight: 'green' } },
  'q-078': { road: 'rail', rz: -14, actors: [learner(2)], extras: { redLights: true, barrier: null, train: true, town: true } },
  'q-082': { road: 'country', actors: [learner(2, 3.3)], extras: {}, view: 'outside', cam: { pos: [-1.2, 2.8, 10.5], look: [3.6, 0.3, 1.2] } },
  'q-083': { road: 'country', actors: [learner(2, 3.3)], extras: {}, view: 'outside', cam: { pos: [-1.2, 2.8, 10.5], look: [3.6, 0.3, 1.2] } },
});

// Every other schematic question gets a scene from its own context sentence: a road kind plus only the road users the sentence names.
// No road word, no scene: the old schematic stays. Order matters: the first matching road kind wins.
const ROADS = [[/rødt kryds|lysende kryds|vognbaneskift|skifte vognbane|to vognbaner|tre vognbaner|vognbaner løber/i, 'country'], [/jernbane|andreaskors|hvidt kryds|A 7[0-9]|overkørsel|\btog\b|togbane/i, 'rail'], [/motorvej|motortrafikvej/i, 'highway'], [/kryds|vigepligt|sidevej|tilkørsel|rundkørsel|fodgængerovergang|lyskryds/i, 'junction'], [/landevej|vej\b|vejen|gade|bane\b|vognbane|kørebane|spor\b|by\b|byen|bolig/i, 'country']];
// Which road-side person a sentence names; anyone else gets a different everyday walker chosen from the question id, so the same face does not repeat.
const PEOPLE_BY_WORD = [[/børnehave|børnegruppe|skolebørn|tur med børn/i, 'kindergarten-group'], [/kørestol|handicap/i, 'wheelchair-cheer'], [/blind|hvid stok|synshandicap/i, 'white-cane'], [/rollator|ældre|gangbesvær/i, 'granny-rollator'], [/vejarbejde|vejarbejder|flagmand/i, 'road-worker'], [/løbehjul|el-løbehjul/i, 'scooter-teen'], [/klapvogn|barnevogn/i, 'pram-mum'], [/jogger|motionist/i, 'jogger-headphones'], [/barn\b|dreng|pige|bold/i, 'kid-ball']];
const DEER = ['deer-startled', 'deer-fawn'], DOGS = ['dog-stick', 'dog-dachshund'];
const EVERYDAY = ['phone-walker', 'dad-shoulders', 'pram-mum', 'jogger-headphones'];
const personFor = (text, id = '') => PEOPLE_BY_WORD.find(([re]) => re.test(text))?.[1] || EVERYDAY[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % EVERYDAY.length];
export function autoSpec(q) {
  const t = `${q.context || ''} ${q.prompt || ''}`;
  const road = ROADS.find(([re]) => re.test(q.context || ''))?.[1] || 'country'; // no road word: a plain country road, the road users named still appear
  const has = re => re.test(q.context || '');
  const actors = [learner(road === 'junction' ? 4 : 2)];
  const seed = [...q.id].reduce((n, c) => n + c.charCodeAt(0), 0);
  // Other traffic: mostly the Nordic GT in other colours, sometimes the Rally Hatch; scooters for mopeds and motorbikes. (There is no 3D race car yet.)
  const KINDS = ['sedan', 'hatch', 'sedan', 'hatch', 'sedan'], pick = i => KINDS[(seed + i) % KINDS.length];
  if (has(/cyklist|cykel/i)) actors.push({ t: 'cyclist', x: 3.2, z: -6 });
  if (has(/knallert|scooter|motorcykel|\bmc\b/i)) actors.push({ t: 'car', kind: 'scooter', x: 3.0, z: -7, color: '#3F5F73' });
  if (has(/overhale.{0,20}vogntog/i) && !actors.some(x => x.kind === 'lorry')) actors.push({ t: 'car', kind: 'lorry', x: -1.7, z: -4, color: '#C2CCD6' });
  if (/tre lastbiler|flere lastbiler/i.test(t)) { const lx0 = /kører bag/i.test(t) ? 1.7 : -1.7, z0 = lx0 > 0 ? -12 : -4; actors.push({ t: 'car', kind: 'lorry', x: lx0, z: z0, color: '#C2CCD6' }, { t: 'car', kind: 'lorry', x: lx0, z: z0 - 18, color: '#3F5F73' }, { t: 'car', kind: 'lorry', x: lx0, z: z0 - 36, color: '#C2CCD6' }); }
  else if (/særtransport|ledsagebil/i.test(t)) { actors.push({ t: 'car', kind: 'lorry', x: -0.2, z: -9, dir: 'toward', color: '#C2CCD6' }, { t: 'car', kind: 'hatch', x: -1.7, z: -18, dir: 'toward', color: '#E8B400', blink: true }); }
  if (has(/lastbil|sættevogn/i) && !actors.some(x => x.kind === 'lorry')) actors.push(has(/bag (en |den )?(tom |tung )?lastbil|kører bag/i) ? { t: 'car', kind: 'lorry', x: 1.7, z: -12, color: '#C2CCD6' } : { t: 'car', kind: 'lorry', x: -1.7, z: -4, color: '#C2CCD6' });
  if (has(/bus\b|busser|bussen/i)) {
    const stopped = has(/holder|holde|standset|stoppested|vejkanten|blinklys|skolebus/i);
    // A bus that is stopped stands on the verge with its hazard lights; otherwise it comes the other way.
    actors.push(stopped ? { t: 'car', kind: 'bus', x: 4.9, z: -9, blink: true, color: '#B5543A' } : has(/minibus/i) ? { t: 'car', kind: 'bus', x: 1.7, z: -10, color: '#B5543A' } : { t: 'car', kind: 'bus', x: -1.2, z: -8, dir: 'toward', color: '#B5543A' });
    if (has(/skolebus|børn|skole/i)) actors.push({ t: 'person', p: 'kindergarten-group', x: 6.8, z: -2.5 });
  }
  if (has(/traktor/i)) actors.push({ t: 'car', kind: 'tractor', x: 1.7, z: -8, color: '#4F7A47' });
  if (has(/ambulance|udrykning|redningskøretøj|blåt lys|blålys|sirene|rednings/i)) actors.push({ t: 'car', kind: 'ambulance', x: -1.7, z: -9, dir: 'toward', color: '#F4F5F7' });
  if (has(/politi|betjent/i) && !has(/ingen betjent|ingen politi/i)) actors.push({ t: 'car', kind: 'police', x: 1.7, z: -9, color: '#F4F5F7' });
  if (has(/parkerede|holdende|parkeret/i)) actors.push({ t: 'parked', kind: pick(0), x: 4.7, z: -5, color: '#7C8FA0' }, { t: 'parked', kind: pick(1), x: 4.7, z: -10, color: '#B5543A' });
  if (has(/modkørende|kommer imod|imod dig|mødende/i)) actors.push({ t: 'car', kind: pick(2), x: -1.7, z: -26, dir: 'toward', color: '#5F7F6B' });
  if (has(/foran dig|bag en|op bag|overhal/i) && !has(/cyklist|cykel|lastbil|traktor|\bbus\b|politi|ambulance/i)) actors.push({ t: 'car', kind: pick(3), x: 1.7, z: -8, color: '#B5543A' });
  if (!/passager|bagsæde|forsæde/i.test(t) && has(/(?<![a-zæøå])(fodgænger[a-zæøå]*|gående|barn|børn[a-zæøå]*|kørestol[a-zæøå]*|handicap[a-zæøå]*|blind(?!e vinkel)[a-zæøå]*|rollator|ældre|(?:el)?løbehjul|klapvogn|jogger[a-zæøå]*|motionist[a-zæøå]*)(?![a-zæøå])/i)) actors.push({ t: 'person', p: personFor(q.context || '', q.id), x: 5.2, z: -9 });
  if (has(/rådyr|vildt|hjort|vildtvarsl|dyr på vejen|dyr krydser/i)) actors.push({ t: 'person', p: DEER[[...q.id].reduce((n, c) => n + c.charCodeAt(0), 0) % 2], x: 0.9, z: -11 });
  else if (has(/\bhund|kæledyr|hunde\b/i)) actors.push({ t: 'person', p: DOGS[[...q.id].reduce((n, c) => n + c.charCodeAt(0), 0) % 2], x: 5.0, z: -7 });
  // Animals appear only when the question names them (rådyr, hund ...): the picture must never add anything the learner could take for part of the situation.
  const extras = {};
  if (road === 'rail') Object.assign(extras, { redLights: has(/røde lys|blinker/i), barrier: has(/bomme.*nede|sænk/i) ? null : 'up', train: has(/tog/i) });
  if (road === 'junction' && has(/ubetinget vigepligt/i)) extras.yieldSign = true;
  if (has(/(?<![a-zæøå])vind(?![a-zæøå])|blæser/i)) extras.wind = true;
  if (has(/\bby\b|byen|bolig|gade\b/i)) extras.town = true;
  return { road, jz: -16, rz: -16, actors, extras };
}
// Every schematic question gets a scene. autoSpec gives the road situation when the sentence names a road; otherwise the learner's car stands in a
// plain setting, and the words in the sentence add what they name: weather and light, a trailer or caravan, cargo, a breakdown, parked cars.
const ENV_WORDS = [[/mørke|mørkt|(?<![a-zæøå])mørk(?![a-zæøå])|uoplyst|gadelys|\bnat\b|natten|aften|dæmring|nærlys|fjernlys|blænd/i, 'night'], [/tåge|\bdis\b|tågelys/i, 'fog'], [/\bsne\b|sneen|sneet|\bis\b|glat|rim\b|slud|isslag/i, 'snow'], [/regn|byge|vådt|(?<![a-zæøå])våd(?![a-zæøå])|våde|aquaplan|oversvøm/i, 'rain'], [/lav sol|solen|solskin|stærk sol/i, 'sun']];
export function composeSpec(q) {
  const t = q.context || '';
  const base = autoSpec(q) || { road: 'country', jz: -16, rz: -16, actors: [learner(2)], extras: {} };
  const has = re => re.test(t), ex = { ...base.extras };
  // weather words that the sentence denies ("uden tåge", "ingen regn") do not count
  const tEnv = t.replace(/(uden|ingen|ikke|hverken)\s+(?:(?:tåge|dis|regn|sne|mørke|glat|is)(?![a-zæøå])(?:,\s*|\s+eller\s+|\s+og\s+)?)+/gi, ' ');
  const env = ENV_WORDS.find(([re]) => re.test(tEnv))?.[1];
  // Ambient animals belong in clear daylight only: not in snow, fog, rain or the dark.
  const actors = base.actors.filter(a => !a.ambient || !env || env === 'sun');
  const tTr = t.replace(/(?:bag|efter|overhale|møder|foran)[^.]{0,30}?(?:bil|personbil|varebil|traktor|lastbil)\s+med\s+(?:(?:en|et|to|tre|stor|lille)\s+)*(?:trailer|campingvogn|anhænger|påhæng)/gi, ' ').replace(/(uden|ingen|intet|ikke)\s+(?:en\s+|et\s+)?(?:campingvogn|trailer|anhænger|påhæng)/gi, ' ');
  if (/campingvogn/i.test(tTr)) ex.trailer = 'caravan'; else if (/trailer|anhænger|påhæng/i.test(tTr)) ex.trailer = 'trailer';
  const tCg = t.replace(/(?:traktor|knallert\w*|motorcykel|lastbil|cyklist|varebil)\s+med\s+[^.,]{0,30}/gi, ' ');
  if (/bagagerum|tagboks|cykelstativ|\blæs(?![a-zæøå])|læsset|læsning|\blast\b|fragt|havemøbler|sofa|værktøjskasse/i.test(tCg)) ex.cargo = true;
  if (/(?<![a-zæøå])(?:trafik|færdsels)?ulykke(?![a-zæøå])|uheld(?![a-zæøå])|forulykket|alarmcentral|(?<![0-9])112(?![0-9])|(?<![a-zæøå])brand(?![a-zæøå])/i.test(t) && !/ulykkesmønster|ulykkestype|ulykkesrisiko|ulykkestal|ulykkesstatistik/i.test(t)) {
    // A crash scene: two wrecks across the road with smoke, your car parked on the verge with hazard lights, a warning triangle in front of you and help on the way.
    ex.accident = true;
    actors.length = 0;
    const lorryCrash = /lastbil/i.test(t), fireOnly = /(?<![a-zæøå])brand(?![a-zæøå])/i.test(t) && !/ulykke|uheld|forulykket/i.test(t);
    actors.push({ t: 'car', learner: true, x: 3.7, z: 5, rot: Math.PI / 2 - 0.12, blink: true },
      lorryCrash ? { t: 'car', kind: 'lorry', x: 0.4, z: -8, rot: 1.1, tilt: 0.06, color: '#C2CCD6', blink: true, smoke: 'plume', fire: 'small' } : { t: 'car', kind: 'hatch', x: 0.2, z: -5, rot: 0.9, tilt: 0.12, color: '#B5543A', blink: true, smoke: 'plume', fire: fireOnly ? 'big' : 'small' },
      ...(lorryCrash || fireOnly ? [] : [{ t: 'car', kind: 'sedan', x: 3.4, z: -9.5, rot: -0.6, tilt: -0.1, color: '#7C8FA0', blink: true, smoke: 'steam' }]),
      { t: 'car', kind: 'ambulance', x: -1.7, z: -26, dir: 'toward', color: '#F4F5F7' });
    if (!fireOnly) actors.push({ t: 'person', p: 'phone-walker', x: 5.2, z: 3 });
    ex.triangle = { x: 1.6, z: 0.5 };
    if (/tunnel/i.test(t)) ex.tunnel = true;
  } else if (/havari(?!blink)|motorstop|advarselstrekant|nødspor|nødsituation|(du|bilen|dækket) (er|har) punkteret|blevet punkteret|er punkteret på (motorvejen|landevejen)/i.test(t)) {
    // A breakdown: your car stopped with hazard lights and a warning triangle behind it; no wreck, no help.
    ex.triangle = { x: 3.2, z: 9.5 };
    for (const x of actors) if (x.learner) { x.blink = true; x.x = /nødspor/i.test(t) ? 4.9 /* on the hard shoulder, wholly right of the edge line */ : 3.4; x.z = 4; }
    if (/nødspor/i.test(t)) ex.cam = { pos: [4.6, 8.4, 16.5], look: [2.6, 0.2, 0.5] };
    if (/nødspor|motorvej/i.test(t)) base.road = 'highway';
  }
  if (/(?<![a-zæøå])barn(?![a-zæøå])|børn|baby|lillebror|din ven|vennen|venner/i.test(t) && !actors.some(a => a.t === 'person')) actors.push({ t: 'person', p: /baby|klapvogn/i.test(t) ? 'pram-mum' : /børn|barn|lillebror/i.test(t) ? 'dad-shoulders' : 'phone-walker', x: 5.3, z: -3 });
  if (/parker|holder (ved|på|langs|i|helt|ude)|holdende|standser|(?<![a-zæøå])kø(?![a-zæøå])|stoppested|indkørsel|vejkant/i.test(t) && !/holder på sidearmen/i.test(t) && !actors.some(a => a.t === 'parked') && !actors.some(a => a.kind === 'bus')) actors.push({ t: 'parked', kind: 'sedan', x: 4.7, z: -6, color: '#7C8FA0' }, { t: 'parked', kind: 'hatch', x: 4.7, z: -11, color: '#B5543A' });
  if (/\bby\b|byen|bolig|gade\b|parker|stoppested|indkørsel|indkøb/i.test(t)) ex.town = true;
  if (/(?<![a-zæøå])vind(?![a-zæøå])|blæser|blæst/i.test(t)) ex.wind = true;
  // Road layouts (zebra, tunnel, bus lane, island, hatched area, road works, bays, car park, one-way, turn lane, overtaking).
  if (/vejbump|hastighedsdæmper|fartdæmper|bump(?![a-zæøå])/i.test(t)) ex.bumps = true;
  if (/fodgængerfelt|fodgængerovergang|overgang for/i.test(t)) { ex.zebra = true; if (!actors.some(x => x.t === 'person')) actors.push({ t: 'person', p: 'phone-walker', x: -2.6, z: -7 }); }
  if (/tunnel/i.test(t)) ex.tunnel = true;
  if (/busbane/i.test(t)) { ex.busLane = true; if (!actors.some(x => x.kind === 'bus')) actors.push({ t: 'car', kind: 'bus', x: 2.0, z: -8, color: '#B5543A' }); }
  if (/helle/i.test(t)) ex.island = true;
  if (/spærreflade|skraveret/i.test(t)) ex.hatch = true;
  if (/vejarbejde|vejarbejder/i.test(t) && !/(ingen|uden|ikke)\s+(\w+\s+)?vejarbejde/i.test(t)) { ex.roadworks = true; if (!actors.some(x => x.t === 'person')) actors.push({ t: 'person', p: 'road-worker', x: -3.0, z: -10 }); }
  if (/parkeringshus/i.test(t)) ex.garage = true; else if (/parker|p-skive|parkering/i.test(t)) ex.bays = true;
  if (/ensretning|ensrettet/i.test(t)) ex.oneway = true;
  if (/svingbane/i.test(t)) { ex.lanes = 2; ex.turnLane = true; }
  if (/krybespor/i.test(t)) { ex.lanes = 2; if (!actors.some(x => x.kind === 'lorry' || x.kind === 'tractor')) actors.push({ t: 'car', kind: 'lorry', x: 4.1, z: -9, color: '#C2CCD6' }); }
  if (/overhaler dig|overhale dig|overhalet dig|overhaler mig|overhalet af/i.test(t)) {
    // Being overtaken: you keep your lane, the other car passes on your left.
    ex.overtaken = true;
    actors.push({ t: 'car', kind: 'hatch', x: -1.7, z: 4.2, color: '#B5543A' });
  } else if (/overhal/i.test(t) && !ex.roadworks) {
    ex.overtake = true;
    for (const x of actors) if (x.learner) { x.x = -1.7; x.z = 6; }
    if (!actors.some(x => x.t === 'car' && !x.learner && x.dir !== 'toward')) actors.push({ t: 'car', kind: 'hatch', x: 1.7, z: 0, color: '#B5543A' });
    if (!actors.some(x => x.dir === 'toward')) actors.push({ t: 'car', kind: 'sedan', x: -1.7, z: -28, dir: 'toward', color: '#5F7F6B' });
  }
  // Bends and hills, bridges, gravel, leaves, shiny asphalt, footbridge, school.
  if (/sving|kurve|bue|skridning/i.test(t) && base.road === 'country' && !ex.lanes) ex.bend = /skarpt|pludselig/i.test(t) ? (/venstre/i.test(t) ? 'sharpLeft' : 'sharpRight') : /venstre/i.test(t) ? 'left' : 'right';
  if (/bakketop/i.test(t)) ex.hill = 'crest'; else if (/ned ad|nedkørsel|nedad/i.test(t) && /bakke/i.test(t)) ex.hill = 'down'; else if (/bakke|stigning|stejl/i.test(t)) ex.hill = 'up';
  if (ex.bend && ex.hill) delete ex.hill;
  if (/autoværn/i.test(t)) ex.guardrail = true;
  if (/gangbro/i.test(t)) ex.footbridge = true;
  if (/bro over|en bro|broen/i.test(t) && !ex.footbridge) ex.bridge = true;
  if (/grusvej/i.test(t)) ex.gravel = true;
  if (/blade/i.test(t)) ex.leaves = true;
  if (/blank|hedebølge/i.test(t)) ex.shine = true;
  if (/skolepatrulje|skole(?![a-zæøå])|elever/i.test(t)) { ex.school = true; if (!actors.some(x => x.t === 'person')) actors.push({ t: 'person', p: /skolepatrulje/i.test(t) ? 'road-worker' : 'kid-ball', x: 4.6, z: -5 }); }
  if (/landsby/i.test(t)) { ex.town = true; if (!actors.some(x => x.t === 'person')) actors.push({ t: 'person', p: 'phone-walker', x: 4.8, z: -6 }, { t: 'person', p: 'granny-rollator', x: 6.1, z: -7 }); }
  if (/kontrol(?![a-zæøå])/i.test(t) && /standset|standser|bliver standset/i.test(t)) { actors.push({ t: 'car', kind: 'police', x: 3.9, z: -8, blink: true, color: '#F4F5F7' }, { t: 'person', p: 'road-worker', x: 2.2, z: -4 }); }
  // Technical and cargo questions: a close view of the part with a marker ring (the learner's car stands at x 1.7, z 2, nose towards -z).
  const L = actors.find(x => x.learner);
  if (L && !ex.accident && actors.every(x => x.learner) && !Object.keys(ex).some(k => !['cargo', 'trailer', 'town', 'wind'].includes(k))) {
    const cx = L.x, cz = L.z;
    const NOFOCUS = /kørekort|førerret|totalvægt|kode 96|prøve(?![a-zæøå])|prøven|promille|sammenligner|klip|forsikring|MitID|app(?![a-zæøå])/i.test(t);
    if (NOFOCUS) { /* a law or licence question: no part to point at */ }
    else if (/(?<![a-zæøå])(abs|esp)(?![a-zæøå])|nødbremse|bremser|opbremsning|hjulblokering|skrid/i.test(t)) { ex.lampsOn = true; /* braking: tail lights burn, no part to point at */ }
    else if (/dæk(?![a-zæøå]*ket)|dæktryk|ser på dækket|mønsterdybde|reservehjul|forhjul|baghjul/i.test(t)) { ex.cam = { pos: [cx + 5.2, 1.5, cz + 4.2], look: [cx + 0.6, 0.45, cz + 0.6] }; ex.mark = [cx + 1.0, 0.4, cz + 1.53]; }
    else if (/nærlys|fjernlys|tågelys|tågebaglygte|havariblink|baglygte|bremselys|kørelys|parkeringslys|stoplygter|lygter|pære|lygteglas/i.test(t)) { ex.lampsOn = true; ex.cam = { pos: [cx - 4.2, 1.6, cz - 6.5], look: [cx, 0.8, cz - 1.2] }; ex.mark = [cx - 0.8, 0.72, cz - 2.15]; }
    else if (/spejl(?!l)|blinde vinkel|hættetrøje/i.test(t)) { ex.cam = { pos: [cx + 4.8, 2.2, cz + 3.8], look: [cx + 0.9, 1.1, cz - 0.6] }; ex.mark = [cx + 1.1, 1.2, cz - 0.6]; }
    else if (/bagagerum|læsset|læsse|tagboks|cykelstativ|havemøbler|sofa|værktøjskasse/i.test(t)) { ex.cargo = true; ex.cam = { pos: [cx + 3.4, 3.0, cz + 7.4], look: [cx, 1.0, cz + 1.2] }; ex.mark = [cx, 1.9, cz + 1.0]; }
    else if (/sele(?![a-zæøå])|seler(?![a-zæøå])|selebrug|barnestol|airbag|nakkestøtte|sædet|bagsædet|forsædet|hattehylde/i.test(t)) { ex.cam = { pos: [cx + 4.2, 3.4, cz + 4.6], look: [cx, 1.1, cz + 0.4] }; ex.mark = [cx + 0.4, 1.05, cz - 0.15]; }
    else if (/bremsen før kørsel|bremsepedal|bremserne ved lav fart|bremsen\b/i.test(t) && !/bremsevæske|bremsesystem|bremseklodser/i.test(t)) { ex.cam = { pos: [cx + 5.2, 1.5, cz + 4.2], look: [cx + 0.6, 0.45, cz + 0.6] }; ex.mark = [cx + 1.0, 0.4, cz + 1.53]; }
    else if (/forlygte|blinklys/i.test(t) && !/venstre|højre|skifte vognbane|skifte kørefelt|overhale|vognbane/i.test(t)) { ex.lampsOn = true; ex.cam = { pos: [cx - 4.2, 1.6, cz - 6.5], look: [cx, 0.8, cz - 1.2] }; ex.mark = [cx - 0.8, 0.72, cz - 2.15]; }
    else if (/vinduesvisker|viskere|forruden|duggede|bagruden/i.test(t)) { ex.cam = { pos: [cx - 3.4, 3.2, cz - 5.2], look: [cx, 1.0, cz - 0.9] }; ex.mark = [cx, 1.3, cz - 0.9]; }
    else if (/reflekser|advarselstrekant|sikkerhedsudstyr|krævede udstyr|bagklappen|reol|udstyr i bilen/i.test(t)) { ex.cargo = /bagklappen|reol/i.test(t); ex.cam = { pos: [cx + 3.4, 2.6, cz + 7.0], look: [cx, 0.9, cz + 1.4] }; /* 16 Nov 2026: the ring sat on the plate and logo for every equipment card; now only on a visible part */ if (/reflekser/i.test(t)) ex.mark = [cx + 0.87, 0.42, cz + 2.1]; else if (ex.cargo) ex.mark = [cx, 1.35, cz + 2.0]; }
    else if (/hornet|(?<![a-zæøå])horn(?![a-zæøå])|instrument|kontrollampe|advarselslampe|servostyring|ratbevægelse|styringen/i.test(t)) { ex.cam = { pos: [cx - 3.0, 3.4, cz - 4.2], look: [cx, 0.9, cz - 0.2] }; ex.mark = [cx - 0.38, 1.0, cz - 0.5]; }
    else if (/olie|motorrum|motorlampe|kølevæske|batteri|bremsevæske|bremseklodser|bremseskiver|bremsesystem|ruderens|vinduesvisker|instrument|kontrollampe|advarselslampe|servostyring/i.test(t)) { ex.cam = { pos: [cx - 3.6, 3.0, cz - 5.4], look: [cx, 0.8, cz - 1.0] }; ex.mark = [cx, 0.95, cz - 1.7]; }
  }
  // Traffic lights: lyskryds / rødt lys / grønt lys / gult lys / signal.
  if (/lyskryds|lyssignal|rødt lys|grønt lys|gult lys|lyset skifter|lyset er (?:rødt|grønt|gult)|signalet|(?<![a-zæøå])signal(?![a-zæøå])/i.test(t) && !/ingen signal|uden signal|uden lyssignal|uden lyskryds|ikke signalreguleret|ingen lyssignal/i.test(t) && (base.road === 'junction' || /kryds|lyset (?:skifter|er )/i.test(t))) { ex.trafficLight = /slukket|ude af drift|strømsvigt/i.test(t) ? 'off' : /grønt/i.test(t) ? 'green' : /gult/i.test(t) ? 'yellow' : 'red'; if (base.road === 'country') { base.road = 'junction'; base.jz = -14; } }
  // Painted marks before a junction (arrows, STOP, big triangle).
  if (base.road === 'junction' || /kryds/i.test(t)) {
    const paint = [];
    if (/stop malet|STOP malet|malet.{0,12}stop/i.test(t)) paint.push('stop');
    if (/trekantsymbol|hvidt trekant|stort hvidt/i.test(t)) paint.push('triangle');
    if (/samlet pil|højre og ligeud|ligeud og til højre|ligeud og højre/i.test(t)) paint.push('arrow-both');
    else if (/pil(?![a-zæøå])|vognbanepil|pileafmærk|pilene/i.test(t)) paint.push(/venstre/i.test(t) && !/højre/i.test(t) ? 'arrow-left' : /højre/i.test(t) && !/venstre/i.test(t) ? 'arrow-right' : 'arrow-straight');
    if (paint.length) { ex.paint = paint; if (base.road !== 'junction') { base.road = 'junction'; base.jz = -14; } }
  }
  // Roundabout, cycle path / lane / street.
  if (/rundkørsel/i.test(t)) { base.road = 'roundabout'; base.rz = -14; ex.cam = { pos: [3.4, 12.5, 21], look: [1.8, 0, -8] }; }
  if (/cykelsti/i.test(t)) ex.cyclePath = true; else if (/cykelbane|cykelstribe/i.test(t)) ex.cycleLane = true;
  if (ex.cyclePath || ex.cycleLane) for (const x of actors) if (x.t === 'cyclist') x.x = ex.cyclePath ? 4.9 : 2.9;
  // Road markings and lanes named by the sentence, and the official signs listed on the question.
  if (/ubrudt midterlinje|spærrelinje|ubrudt linje i midten/i.test(t)) ex.centre = 'solid';
  else if (/dobbelt.*(linje|midterlinje)/i.test(t)) ex.centre = 'double';
  else if (/varslingslinje|lange streger med korte mellemrum/i.test(t)) ex.centre = 'warning';
  else if (/punkteret (midter)?linje|stiplet|punkteret/i.test(t)) ex.centre = 'dashed';
  if (/punkteret kantlinje|punkteret linje.*kant/i.test(t)) ex.edge = 'dashed'; else if (/kantlinje/i.test(t)) ex.edge = 'solid';
  if (/gul[a-zæøå]*\s+(?:ubrudt\s+)?(?:linje|kantsten|streg)|kantsten[^.]*\bgul/i.test(t)) ex.kerbYellow = true;
  // 16 Nov 2026: a bare "spor" also matched jernbanesporet, nødsporet and særtransport and drew 4 lanes on those roads.
  if (/to vognbaner|tre vognbaner|flere vognbaner|vognbaner|skifte vognbane|vognbaneskift|kørespor/i.test(t) && !/(en|én) vognbane/i.test(t)) ex.lanes = 2;
  const signs = EXAM_SCHEMATICS[q.id]?.officialSigns || [];
  if (signs.length) ex.signs = signs.slice(0, 3);
  // Snow: a snowman by the road (unless the road already has a person there).
  if (env === 'snow' && /(?<![a-zæøå])sne(?![a-zæøå])|sneen|sneet|sner(?![a-zæøå])/i.test(t)) actors.push({ t: 'person', p: ['snowman-cool', 'snowman-melting'][[...q.id].reduce((n, c) => n + c.charCodeAt(0), 0) % 2], x: [5.4, -5.4][[...q.id].reduce((n, c) => n + c.charCodeAt(0), 0) % 2], z: -2 });
  // generic: nothing but your own car on a plain road. Such a picture says less than the old schematic, so the app keeps the schematic for it.
  // Things the diorama cannot show yet keep the old schematic: roundabouts, tunnels, car parks, bus lanes, cycle paths, lane-narrowing and other lane layouts.
  // Two lanes becoming one: a third lane is drawn and the right one ends in a wedge. Your own lane ends when the sentence says so.
  if (/sammenflet|løber sammen|bliver til én|flette ind|vognbane ophører|vognbanen ophører|sammenløb/i.test(t) && !/hovedvej ophører|motorvej ophører|krybespor|tilkørselsbane/i.test(t)) {
    ex.lanes = ex.lanes || 3; ex.merge = true; ex.centre = 'dashed';
    for (const x of actors) if (x.learner) x.x = /din vognbane|dit spor/i.test(t) ? 3.7 : 0;
  }
  if (/øvelsesplads|øvelsesbane|øvelsesstrækning/i.test(t) && !ex.lanes) ex.yard = /u-vending|vende(?![a-zæøå])/i.test(t) ? 'uturn' : /bakke ligeud|ligeud/i.test(t) ? 'straight' : /parker|lomme/i.test(t) ? 'bay' : 'corner';
  // Details for the questions that had only a plain road: ramp, overhanging load, tow rope, narrowing, car close behind, side road, other drivers' gear.
  {
    const Lr = actors.find(x => x.learner), lx = Lr ? Lr.x : 3.4, lz = Lr ? Lr.z : 4;
    if (base.road === 'rail' && /i stå på (?:en )?jernbaneoverkørsel|holder på (?:en )?jernbaneoverkørsel|står på sporet/i.test(t) && Lr) { Lr.z = base.rz ?? -16; Lr.x = 1.7; ex.redLights = true; ex.barrier = 'up'; }
    if (/passager|bagsæde|forsæde/i.test(t)) for (let i = actors.length - 1; i >= 0; i--) if (actors[i].t === 'person') actors.splice(i, 1);
    if (/passager|bagsæde|forsæde/i.test(t) && !ex.cam && actors.every(x => x.learner)) { ex.cam = { pos: [lx + 4.2, 3.4, lz + 4.6], look: [lx, 1.1, lz + 0.4] }; ex.mark = [lx + 0.4, 1.05, lz - 0.15]; }
    if (/tilkørselsbane/i.test(t) && !/krybespor/i.test(t) && !ex.merge) {
      ex.ramp = true; base.road = 'highway'; ex.cam = { pos: [6.4, 10.5, 19], look: [3.0, 0, -5] };
      const onRamp = /(?:du|dig)[^.]*(?:er|kører) på (?:en )?tilkørselsbane/i.test(t);
      if (onRamp) {
        if (Lr) { Lr.x = 5.3; Lr.z = 4; Lr.rot = Math.PI / 2; }
        if (/bilen foran/i.test(t)) { for (let i = actors.length - 1; i >= 0; i--) if (!actors[i].learner) actors.splice(i, 1); actors.push({ t: 'car', x: 5.3, z: -3.5, rot: Math.PI / 2, color: '#B5543A' }); ex.lampsOn = true; }
        else if (/hul|110 km/i.test(t)) { for (const [x, z] of [[1.7, -6], [1.7, -30], [-1.7, -14]]) actors.push({ t: 'car', x, z, rot: Math.PI / 2, color: z === -30 ? '#7C8FA0' : '#B5543A' }); }
      } else { const lorry = actors.find(x => x.kind === 'lorry' && !x.learner); if (lorry) { lorry.x = 5.3; lorry.z = -4; lorry.rot = Math.PI / 2; delete lorry.dir; } else actors.push({ t: 'car', kind: 'hatch', x: 5.3, z: -3, rot: Math.PI / 2, color: '#B5543A' }); }
    }
    if (/rager\s+(?:\d[\d,.]*\s*(?:meter|m)\s+)?ud over|fastgjort (?:stige|bræt)|stige\s+\d/i.test(t) && !/sofa/i.test(t)) ex.overhang = true;
    if (/slæb|(?<![a-zæøå])tov(?![a-zæøå])/i.test(t) && /bil/i.test(t) && !ex.tow) /* 24 Nov 2026: whole word only, "fortov" drew a tow rope */ { ex.tow = { x: lx, z1: lz - 2.4, z2: lz - 6.4 }; actors.push({ t: 'car', kind: 'sedan', x: lx, z: lz - 9, color: '#7C8FA0', blink: true }); }
    if (/(?:rød )?trekant bagpå/i.test(t) && !actors.some(x => x.kind === 'tractor')) actors.push({ t: 'car', kind: 'tractor', x: 1.7, z: -8, color: '#4F7A47' });
    if (/pludseligt? smallere/i.test(t)) { ex.narrow = true; actors.push({ t: 'car', kind: 'sedan', x: -1.4, z: -10, dir: 'toward', color: '#7C8FA0' }); }
    if (/tæt bag bilen foran/i.test(t) && !actors.some(x => !x.learner && x.t === 'car')) actors.push({ t: 'car', x: lx, z: lz - 7.5, color: '#B5543A' });
    const side = /(?:nærmer sig|bil(?: kommer)?) fra (højre|venstre)/i.exec(t);
    if (side && /bil/i.test(t) && (base.road === 'country' || base.road === 'junction') && !actors.some(x => !x.learner && x.t === 'car')) { if (base.road === 'country') { base.road = 'junction'; base.jz = -14; } actors.push({ t: 'car', x: side[1].toLowerCase() === 'højre' ? 5.6 : -5.6, z: base.jz ?? -14, rot: side[1].toLowerCase() === 'højre' ? Math.PI : 0, color: '#B5543A' }); }
    if (/småsten|løse sten|grus(?![a-zæøå])/i.test(t)) ex.gravel = true;
    if (/vende på en smal vej|u-vending fra midten/i.test(t) && Lr) { Lr.x = 1.6; Lr.rot = Math.PI / 2 + 0.95; Lr.z = 0; ex.uturn = true; }
    if (/bilist kører[^.]*km\/t i en \d+-zone/i.test(t) && !actors.some(x => !x.learner && x.t === 'car')) { actors.push({ t: 'car', x: lx, z: lz - 9, color: '#B5543A' }); ex.signs = ['C 55:' + /i en (\d+)-zone/i.exec(t)[1]]; }
    if (/stillestående kø forude/i.test(t)) { for (let i = actors.length - 1; i >= 0; i--) if (actors[i].t === 'parked') actors.splice(i, 1); actors.push({ t: 'car', x: lx, z: lz - 9, color: '#B5543A' }, { t: 'car', kind: 'lorry', x: lx, z: lz - 17, color: '#7C8FA0' }); }
    if (/vognbaneassistent|tre baner i din retning|skifte fra højre til venstre vognbane/i.test(t) && !ex.lanes) { ex.lanes = 3; if (Lr) Lr.x = base.road === 'highway' ? 3.3 : 3.7; if (/skifte fra højre til venstre/i.test(t) && Lr) Lr.signal = 'L'; }
  }
  if (/nødtelefon/i.test(t)) { ex.sos = true; base.road = 'highway'; }
  /* 24 Nov 2026: shark teeth belong at a junction (they were painted across a straight road), and "uden ... hajtænder" means none */
  if (/hvide vinkler|hajtænder|hajtand/i.test(t) && !/(uden|ingen|ikke)[^.]{0,60}(hajtænder|hajtand|hvide vinkler)/i.test(t)) { ex.sharkTeeth = true; delete ex.signs; if (base.road === 'country') { base.road = 'junction'; base.jz = -14; } }
  const unsupported = false; // every layout the questions name now has a scene
  const generic = unsupported || ((base.road === 'country' || base.road === 'highway') && actors.every(x => x.learner) && !Object.keys(ex).length && (!env || env === 'day'));
  // Studio props for the abstract questions (licence, exam, drink, pills, tiredness, electric car ...), only when nothing else shows the situation.
  const STUDIO = [[/kørekort|førerret|kode 96|udstedelse|dispensation|ansøg/i, 'licence'], [/ved hvert billede|ordblind|specialprøve|teoriprøve|(?<![a-zæøå])teori(?![a-zæøå])|digitale/i, 'laptop'], [/modul|køreundervisning|udstyr til prøven|praktisk|køreprøve|prøvesagkyndig|køretime|kørelærer|skolevogn/i, 'clipboard'], [/(?<![a-zæøå])mobil|(?<![a-zæøå])telefon|mitid|besked|skærm|musik|(?<![a-zæøå])app(?![a-zæøå])/i, 'phone'], [/alkohol|promille|(?<![a-zæøå])øl(?![a-zæøå])|vin(?![a-zæøå])|genstand|spiritus|drukket|fest/i, 'drinks'], [/medicin|piller|stof|narkotika|kokain|cannabis|amfetamin|sovemedicin|hash/i, 'pills'], [/træt|søvn|sovet|nattevagt|influenza|ked af|dårlig besked|køre længe|lang tur/i, 'coffee-clock'], [/elbil|el-godsbil|batteri|opladning|plug-in|rækkevidde|one pedal/i, 'charger'], [/bøde|sanktion|(?<![a-zæøå])dom(?![a-zæøå])|klip|kørselsforbud|frakend/i, 'fine'], [/forsikring|regres|registrering|papirer|(?<![a-zæøå])ejer(?![a-zæøå])/i, 'documents'], [/låne|lånt|køber|nøglestyret|aldrig (?:har )?kørt før/i, 'keys'], [/manuelt gear|(?<![a-zæøå])gear|servostyring|styring|(?<![a-zæøå])ratt/i, 'steering']];
  const studio = []; for (const [re, name] of STUDIO) if (re.test(t) && !studio.includes(name) && studio.length < 3) studio.push(name);
  const plainRoad = generic && studio.length === 0 && /motorvej|landevej|tilkørsel|vogntog|dagslys|livreddende/i.test(t) && !/sammenlign|risikotal|risiko|ulykkestype/i.test(t);
  const useStudio = generic && studio.length > 0;
  // Indicators: the road user the sentence says is signalling gets one amber lamp on that side only.
  if (/blinklys/i.test(t) && /skifte vognbane|skifte kørefelt/i.test(t) && !/venstre|højre/i.test(t)) { ex.lanes = ex.lanes || 2; const L0 = actors.find(x => x.learner); if (L0) L0.signal = 'L'; }
  const sig = /(?<![a-zæøå])blinker (?:med )?(?:til )?(venstre|højre)|blinklys(?:et)? (?:til )?(venstre|højre)|(venstre|højre)\s*blinklys/i.exec(t);
  if (sig) { const side = (sig[1] || sig[2] || sig[3]).toLowerCase() === 'venstre' ? 'L' : 'R'; const own = /(dit|mit) blinklys|du blinker|(?<![a-zæøå])(venstre|højre) blinklys/i.test(t); const tgt = own ? actors.find(x => x.learner) : actors.find(x => x.t === 'car' && !x.learner); if (tgt) { tgt.signal = side; if (tgt.blink) tgt.blink = false; } }
  if (useStudio) for (const x of actors) if (x.learner) { x.x = -3.6; x.z = -1.2; }
  return { ...base, env: env || 'day', actors, extras: ex, cam: ex.cam, mark: ex.mark, studio: useStudio ? studio : undefined, cam: useStudio ? { pos: [0.8, 5.8, 12.5], look: [0.8, 1.5, -0.6] } : ex.cam, generic: generic && !useStudio && !plainRoad && !actors.some(x => x.signal) };
}
import { EXAM_SCHEMATICS } from './exam-schematics.js';

/* ===== Camera: driver's view or outside view (17 Nov 2026) =====
   view 'driver': the camera sits in the learner's seat (eye 1.2 m, a little of the bonnet in the bottom of the picture) and
   looks along the road, with a small head turn towards whatever the question is about. view 'outside': the old chase camera
   (spec.cam, else the default one behind and above) or, for a car part, the close-up on spec.mark.
   OUTSIDE when one of these rules hits (first match is reported in viewWhy), DRIVER otherwise:
     1 mark      the question is about a part of the car (tyre, lamp, mirror, seat, bonnet, cargo): close-up on the part
     2 studio    no road in the picture (licence, exam, drink, tiredness ...)
     3 load      trailer, caravan, overhang, roof or boot cargo, tow rope: length and load are only visible from outside
     4 own-car   the learner's own car is the subject: hazards or breakdown (blink outside a crash), own indicator, u-turn, yard,
                 acceleration lane (needs the overview of the lane and the traffic beside it)
     5 train     a train crossing from the side is not in the windscreen
     6 not-ahead a road user is behind the seat or more than 25 degrees off the line of sight even after the head turn (overtaken ...)
   Every other traffic situation is a driver view: junctions, roundabouts, overtaking, motorway, pedestrians, cyclists, signs,
   lights, weather, night, hills, bends, tunnels, crash scenes. Both takes of a question (V) stay driver views. */
export const POV_EYE = Object.freeze({ x: 0.1, y: 1.28, z: -0.43 }); /* in the learner car's own frame: nose +x, right +z, x measured from the model's middle */
const DECOR_PEOPLE = /^(snowman|deer-fawn)/;
const roadWidth = s => { const ex = s.extras || {}; return s.road === 'highway' && !s.studio ? (ex.lanes >= 3 ? 10.5 : 7) : ex.lanes ? 11.2 : 7; };
/* Where the eye is and where it looks, for take V (0 or 1). Pure maths, so the check script can use it too. */
export function povPose(spec, V = 0) {
  const L = (spec.actors || []).find(a => a.learner); if (!L) return null;
  const ex = spec.extras || {}, rot = L.rot ?? Math.PI / 2, c = Math.cos(rot), sn = Math.sin(rot);
  const f = [c, -sn], r = [sn, c]; /* forward and right on the ground */
  const back = V && !ex.accident && spec.road !== 'rail' ? 2.5 : 0; /* take 2: the car stands 2.5 m further back on the road (not where the question fixes the spot) */
  const lx = L.x - f[0] * back, lz = L.z - f[1] * back;
  const eye = [lx + POV_EYE.x * f[0] + POV_EYE.z * r[0], (V ? POV_EYE.y - 0.07 : POV_EYE.y), lz + POV_EYE.x * f[1] + POV_EYE.z * r[1]];
  /* the things the question is about, as ground points: other road users, people, the signs and the light */
  const W = roadWidth(spec), pts = [];
  for (const a of spec.actors || []) {
    if (a.learner || a.rear || a.t === 'parked' || (a.t === 'person' && (ex.accident || DECOR_PEOPLE.test(a.p || '')))) continue; /* at a crash the bystander is beside the car: the wrecks and the triangle are the subject */
    if (typeof a.x === 'number' && typeof a.z === 'number') pts.push([a.x, a.z]);
  }
  if (ex.signs) ex.signs.slice(0, 3).forEach((_, i) => pts.push([W / 2 + 1.5, eye[2] - 11 - i * 6.5]));
  if (ex.yieldSign) { const jz = spec.jz ?? -16; pts.push([6.3, jz - 4.4], [4.9, jz + 8]); }
  if (ex.trafficLight) pts.push([W / 2 + 0.8, (spec.jz ?? spec.rz ?? -14) + 6]);
  const bearings = []; let behind = false;
  for (const [x, z] of pts) {
    const dx = x - eye[0], dz = z - eye[2], ahead = dx * f[0] + dz * f[1], side = dx * r[0] + dz * r[1];
    if (ahead < 1.5) { behind = true; continue; }
    bearings.push(Math.atan2(side, ahead));
  }
  let yaw = bearings.length ? Math.max(-0.38, Math.min(0.38, 0.8 * bearings.reduce((s, b) => s + b, 0) / bearings.length)) : 0;
  if (V) yaw += yaw > 0.04 ? -0.07 : 0.07; /* take 2: the head is turned a little the other way */
  const worst = bearings.reduce((m, b) => Math.max(m, Math.abs(b - yaw)), 0);
  return { eye, yaw, f, r, back, behind, worst, pitch: 0 };
}
export function viewFor(s) {
  const ex = s.extras || {}, L = (s.actors || []).find(a => a.learner);
  const why = s.mark ? 'mark' : s.studio ? 'studio' : !L ? 'no-learner'
    : (ex.trailer || ex.overhang || ex.cargo || ex.tow) ? 'load'
    : ((L.blink && !ex.accident) || L.signal || ex.uturn || ex.yard || ex.ramp) ? 'own-car'
    : ex.train ? 'train'
    : [0, 1].some(V => { const p = povPose(s, V); return p.behind || p.worst > 0.44; }) ? 'not-ahead'
    : null;
  return why ? { view: 'outside', viewWhy: why } : { view: 'driver', viewWhy: 'traffic situation' };
}
/* ===== Rear-view mirror (17 Nov 2026) =====
   Only driver views where the traffic behind you is part of the answer get the mirror (and its extra render); every other scene has none.
   First match wins; each rule also puts the road user it talks about behind you (actor.rear: seen only in the mirror, left out of povPose):
     followed   a car close behind you ("tæt bag dig", "tæt bagved", "bagvedkørende"): a car 7.5 m behind, same lane
     emergency  an ambulance coming from behind: the ambulance moves from in front of you to 11 m behind, same lane
     lane-chg   you change lane with a car behind in the lane you want (multi-lane roads only): a car 8 m behind in that lane
   Not covered: reversing (no reversing scene is a driver view with traffic behind), cyclists or motorcycles from behind (their
   pictures are drawn from the back only), being overtaken (outside view, rule 6). */
const REAR_RULES = [
  ['followed', /tæt bag dig|tæt bagved|bagvedkørende/i, /ingen kører tæt bag dig/i],
  ['emergency', /(?:ambulance|brandbil|politibil|udrykning)[^.]*bagfra/i],
  ['lane-chg', /skifte (?:vogn|kørefelt)|skifter (?:vogn|kørefelt)|fra højre til venstre (?:vogn)?bane|ligger lidt bag dig i (?:venstre|højre)/i],
];
export function withRearMirror(s, t) {
  if (s.view !== 'driver') return s;
  const L = s.actors.find(a => a.learner), ex = s.extras || {};
  for (const [why, re, not] of REAR_RULES) {
    if (!re.test(t) || (not && not.test(t))) continue;
    const rot = L.rot ?? Math.PI / 2, f = [Math.cos(rot), -Math.sin(rot)], r = [Math.sin(rot), Math.cos(rot)], at = (back, side) => ({ x: L.x - f[0] * back + r[0] * side, z: L.z - f[1] * back + r[1] * side, ...(L.rot === undefined ? {} : { rot }) }); /* no rot when the learner has none: the renderer then also applies the model's nose flip */
    let actors = s.actors;
    if (why === 'followed') actors = [...actors, { t: 'car', kind: 'hatch', color: '#B5543A', rear: true, ...at(7.5, 0) }];
    else if (why === 'emergency') actors = [...actors.filter(a => a.kind !== 'ambulance'), { t: 'car', kind: 'ambulance', color: '#F4F5F7', rear: true, ...at(11, 0) }];
    else { if (!(ex.lanes >= 2)) continue; const side = /højre (?:vogn)?bane|til højre/i.test(t) && !/til venstre|venstre (?:vogn)?bane/i.test(t) ? 3.7 : -3.7; actors = [...actors, { t: 'car', kind: 'sedan', color: '#7C8FA0', rear: true, ...at(8, side) }]; }
    return { ...s, actors, rearMirror: why };
  }
  return s;
}
export const situationFor = q => { const s = SITUATIONS[q.id] ? { ...SITUATIONS[q.id], generic: false } : composeSpec(q); return withRearMirror({ ...s, ...viewFor(s), ...(s.view ? { view: s.view, viewWhy: 'set by hand' } : {}) }, q.context || ''); }; /* 24 Nov 2026: a hand-written spec may fix the view */
