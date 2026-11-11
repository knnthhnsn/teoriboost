// The situations a tour through the driving lesson can hold. Pure logic and text, no Three.js and no page,
// so every rule can be tested on its own. A run of the lesson is one tour from a shuffled deck, which means
// the same drive cannot be learned by heart: the player has to read each junction.
import { carPoint, headingNorm, onRoute } from './drive-physics.js';

export const SPEED_LIMIT = 50 / 3.6;     // m/s
export const SPEED_GRACE = 3;            // seconds over the limit before it is a fault of its own
export const BLINK_BEFORE = 10;          // metres before the junction edge where the indicator must be on
export const SIDE_ROAD_FINISH = 45;      // a turn tour ends this far along the side road
export const MISSED_TURN = 25;           // metres past the junction before the car is sent back
export const RETRY_DISTANCE = 40;        // metres before the junction where a missed turn starts again

export const TOURS = Object.freeze([
  Object.freeze({ id: 'yield-stop-ped', j1: 'yield', j2: 'stop', ped: true }),
  Object.freeze({ id: 'right-stop-ped', j1: 'right', j2: 'stop', ped: true }),
  Object.freeze({ id: 'yield-left', j1: 'yield', j2: 'left', ped: false }),
  Object.freeze({ id: 'right-right-turn', j1: 'right', j2: 'rightTurn', ped: false }),
  Object.freeze({ id: 'yield-right-turn', j1: 'yield', j2: 'rightTurn', ped: false }),
  Object.freeze({ id: 'right-left', j1: 'right', j2: 'left', ped: false }),
]);

// Every entry comes once before any comes again, and the same entry never comes twice in a row.
function shuffledDeck(entries, key, random) {
  let deck = [], last = null;
  return {
    next() {
      if (!deck.length) {
        deck = [...entries];
        for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
        if (last && key(deck[deck.length - 1]) === key(last)) [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
      }
      last = deck.pop();
      return last;
    },
  };
}
export const createTourDeck = (random = Math.random) => shuffledDeck(TOURS, tour => tour.id, random);

// The stretch before junction 1 holds one more situation, drawn from its own deck, so it does not
// line up with the junctions: parked cars with oncoming traffic, a child after a ball, the phone, or a start
// from the kerb behind which a car comes and then drives ahead, brakes and pulls in.
export const STRETCHES = Object.freeze(['meet', 'child', 'phone', 'follow']);
export const createStretchDeck = (random = Math.random) => shuffledDeck(STRETCHES, stretch => stretch, random);
export const composeTour = (tour, stretch) => Object.freeze({ ...tour, stretch });

export const turnSide = tour => tour.j2 === 'left' ? -1 : tour.j2 === 'rightTurn' ? 1 : 0;

export function newSituations(tour) {
  const sit = { [tour.j1]: { status: 'pending' }, [tour.j2]: { status: 'pending' }, speed: { status: 'pending' }, lane: { status: 'pending' } };
  if (STRETCHES.includes(tour.stretch)) sit[tour.stretch] = { status: 'pending' };
  if (tour.stretch === 'follow') sit.kerb = { status: 'pending' };
  if (tour.ped) sit.park = { status: 'pending' };
  if (bikeTour(tour)) sit.bike = { status: 'pending' };
  if (tour.j2 === 'stop') sit.stop.stopped = false;
  if (tour.ped) sit.ped = { status: 'pending' };
  if (turnSide(tour)) sit.blink = { status: 'pending' };
  return sit;
}

// The places on the route that must be passed before the tour can end. Speed, blink, lane and phone never hold it up.
export const tourZones = tour => [...(tour.stretch === 'meet' || tour.stretch === 'child' ? [tour.stretch] : []), ...(tour.stretch === 'follow' ? ['kerb', 'follow'] : []), tour.j1, tour.j2, ...(tour.ped ? ['ped'] : [])];

const LAW_AND_PLAN = 'Færdselsloven, LBK nr. 118 af 12. januar 2026 · Undervisningsplan for kategori B, version 1.1';
export const SITUATION_TEXT = Object.freeze({
  yield: { kicker: 'Ubetinget vigepligt', place: 'Krydset ved Lindevej',
    rule: 'Ved hajtænder eller vigepligtstavle har du ubetinget vigepligt for kørende trafik fra begge sider. Vis det tydeligt ved at sænke farten i god tid eller standse. Kør først frem, når det kan ske uden fare eller ulempe for andre.',
    source: 'Færdselsloven § 26, stk. 2 og 5' },
  stop: { kicker: 'Stoptavle', place: 'Krydset ved Egevej',
    rule: 'Ved stoptavle skal du standse helt ved stoplinjen. Er der ingen linje, standser du umiddelbart før den krydsende vej. Derefter har du ubetinget vigepligt for kørende trafik fra begge sider.',
    source: 'Stoptavle B 13 · færdselsloven § 26, stk. 2' },
  ped: { kicker: 'Fodgængerfelt', place: 'Feltet ved skolen',
    rule: 'Nærmer du dig et fodgængerfelt uden signal, skal du afpasse farten, så gående i feltet eller på vej ud i det ikke udsættes for fare eller ulempe. Om nødvendigt standser du og lader dem passere.',
    source: 'Færdselsloven § 27, stk. 7' },
  right: { kicker: 'Højre vigepligt', place: 'Krydset ved Lindevej',
    rule: 'Hvor ingen har ubetinget vigepligt, skal du som udgangspunkt holde tilbage for kørende fra højre. Kontrollér samtidig, om andre faktisk overholder deres pligt.',
    source: LAW_AND_PLAN },
  left: { kicker: 'Venstresving', place: 'Krydset ved Egevej',
    rule: 'Før venstresving skal du orientere dig efter modkørende og give tegn i god tid. Du skal holde tilbage for modkørende, der fortsætter ligeud eller svinger til højre. Vent på et ophold, der gør hele svinget forsvarligt.',
    source: LAW_AND_PLAN },
  rightTurn: { kicker: 'Højresving', place: 'Krydset ved Egevej',
    rule: 'Ved højresving skal du holde tilbage for cyklister og andre, der fortsætter ligeud langs vejen. Orientér dig tidligt og igen lige før svinget, fordi en cyklist kan være kommet frem.',
    source: LAW_AND_PLAN },
  blink: { kicker: 'Blink før sving', place: 'Krydset ved Egevej',
    rule: 'Tegn skal gives tydeligt og i god tid, når andre har gavn af det. Blinklys giver information; det giver ikke i sig selv ret til at køre først.',
    source: LAW_AND_PLAN },
  speed: { kicker: 'Fart i byzone', place: 'Lindevej',
    rule: 'I tættere bebygget område er hastighedsgrænsen 50 km/t. Det er en øvre grænse, og du skal køre langsommere, hvis forholdene kræver det.',
    source: LAW_AND_PLAN },
  meet: { kicker: 'Forhindring i din side', place: 'Lindevej',
    rule: 'Holder der parkerede biler eller en anden forhindring i din side af vejen, skal du lade modkørende passere først. Sænk farten i god tid, og vent før forhindringen, til der er plads til hele passagen.',
    source: LAW_AND_PLAN },
  child: { kicker: 'Bold på vejen', place: 'Lindevej',
    rule: 'Triller en bold ud mellem parkerede biler, så regn med, at et barn følger efter. Sænk straks farten og vær klar til at standse. Børn kan løbe ud uden at se sig for.',
    source: LAW_AND_PLAN },
  phone: { kicker: 'Telefon', place: 'Lindevej',
    rule: 'Du må ikke bruge en håndholdt mobiltelefon under kørsel, heller ikke når du holder stille i trafikken. En telefon i holder tager også blikket fra vejen. Lad beskeden vente, til du holder lovligt parkeret.',
    source: LAW_AND_PLAN },
  kerb: { kicker: 'Igangsætning', place: 'Lindevej',
    rule: 'Før du kører ud fra kantstenen, giver du tegn til venstre, ser i spejlet og over venstre skulder og holder tilbage for trafikken bagfra. Kør først, når det kan ske uden fare eller ulempe, og sluk blinket, når du er ude.',
    source: LAW_AND_PLAN },
  follow: { kicker: 'Afstand', place: 'Lindevej',
    rule: 'Hold så stor afstand til bilen foran, at du kan standse, hvis den bremser. En tommelfingerregel er mindst 2 sekunder. Når bilen foran blinker og holder ind, så sæt farten ned og giv den plads.',
    source: LAW_AND_PLAN },
  park: { kicker: 'Parkering', place: 'Lindevej',
    rule: 'Du må ikke parkere ud for en indkørsel, langs en gul ubrudt kantlinje eller nærmere end 12 m fra tavlen ved et busstoppested. Parkér i højre side, tæt ind til kantstenen.',
    source: LAW_AND_PLAN },
  bike: { kicker: 'Cyklist foran', place: 'Lindevej',
    rule: 'Når du kører forbi en cyklist, holder du god sideafstand, fordi cykler kan slingre, især ved lav fart. Er der ikke plads til det, venter du bag cyklisten.',
    source: LAW_AND_PLAN },
  lane: { kicker: 'Placering', place: 'Lindevej',
    rule: 'Kør i højre side af vejen. Over midterlinjen må du kun, når du skal forbi en forhindring eller svinge, og kun når det kan ske uden fare for modkørende.',
    source: LAW_AND_PLAN },
});

/* ---------- turning ---------- */
export const hasTurned = (pose, side, K) => side * pose.x > K.HALF + 1 && Math.abs(headingNorm(pose.heading - side * Math.PI / 2)) < .6;

// Straight on past the junction, or down the wrong side road.
export const missedTurn = (pose, side, K) =>
  (Math.abs(pose.x) <= K.HALF && pose.z < K.J2 - K.HALF - MISSED_TURN) || side * pose.x < -(K.HALF + MISSED_TURN);

export function onTourRoute(pose, tour, K) {
  if (onRoute(pose)) return true;
  if (passingWindow(pose, obstacleZone(tour), K)) return true;
  const side = turnSide(tour);
  if (!side) return false;
  const inJunction = Math.abs(pose.z - K.J2) <= K.HALF + 8 && Math.abs(pose.x) <= K.HALF + 2;
  const onSideRoad = side * pose.x >= K.HALF && Math.abs(pose.z - K.J2) <= K.HALF;
  return inJunction || onSideRoad;
}

/* ---------- oncoming cars for a left turn ---------- */
// A short platoon, then a long gap. The platoon stays between the crossing and junction 1, so it never
// drives through anything else on the road.
export const ONCOMING = Object.freeze({ speed: 11, offsets: Object.freeze([0, 2.6, 5.4]), period: 30, x: -1.625, zMin: -340, zMax: -130, armAt: 80, clearAfterFault: 12 });

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// When the first car reaches the junction: about when the player does, so the platoon cannot be skipped by driving fast.
export const oncomingPhase = (clock, distance, v) => clock + clamp(distance / Math.max(v, 5), 3, 9);

// Seconds since each car reached the junction centre; negative means it is still coming.
export function oncomingTaus(clock, phase) {
  return ONCOMING.offsets.map(offset => {
    let tau = (clock - phase - offset) % ONCOMING.period;
    if (tau < -ONCOMING.period / 2) tau += ONCOMING.period;
    else if (tau >= ONCOMING.period / 2) tau -= ONCOMING.period;
    return tau;
  });
}
export const oncomingZ = (tau, j2) => j2 + ONCOMING.speed * tau;
export const oncomingActive = z => z >= ONCOMING.zMin && z <= ONCOMING.zMax;

export const timeToClearOncoming = v => 1.2 + 7.5 / Math.max(v, 3);
export const leftTurnConflict = (taus, need) => taus.some(tau => tau > -need && tau < .7);

// The car's front left corner has crossed the middle of the road inside the junction.
export function enteredOncoming(pose, K) {
  const corner = carPoint(pose, 2.1, -.9);
  return corner.x < 0 && Math.abs(corner.z - K.J2) <= K.HALF + 3;
}

/* ---------- the cyclist on a right turn ---------- */
// x is close to the kerb at 3.25, leaving room beside a car in the middle of its lane. A car further right
// than blockEdge leaves no room, so the rider stays behind it, as the rule about hugging the kerb intends.
export const RIDER = Object.freeze({ x: 2.95, speed: 5.5, spawnAt: 70, blockEdge: 2.65, headway: 2.6, goneAfter: 40 });

const carCorners = pose => [[2.1, .9], [2.1, -.9], [-2.1, .9], [-2.1, -.9]].map(([along, across]) => carPoint(pose, along, across));

// Timed from the player's arrival at the corner, so a fast driver meets the rider too.
export function riderStartZ(carZ, distance, v, K) {
  const corner = K.J2 + K.HALF, eta = clamp(distance / Math.max(v, 5) + .4, 3, 12);
  const z = corner + RIDER.speed * eta;
  return Math.abs(z - carZ) < 6 ? carZ + 8 : z;
}

export function stepRider(rider, dt, pose, carSpeed, K) {
  if (!rider.active) return rider;
  const corners = carCorners(pose), leftEdge = Math.min(...corners.map(c => c.x)), rear = Math.max(...corners.map(c => c.z)), byKerb = pose.x + .9 > RIDER.blockEdge;
  // Only a car already placed by the kerb holds the rider back. A car swinging right from the middle of the
  // lane has not left the rider room to stop, which is the fault itself.
  const straight = Math.abs(pose.heading) < .12;
  if (rider.following) { if (rider.z <= rear || leftEdge >= RIDER.x + .3 || (straight && !byKerb)) rider.following = false; }
  else if (straight && byKerb && rider.z > rear) rider.following = true;
  let v = RIDER.speed;
  if (rider.following) {
    const gap = rider.z - rear - RIDER.headway;
    v = gap <= 0 ? Math.min(RIDER.speed, carSpeed) : clamp(gap / .6, Math.min(RIDER.speed, carSpeed), RIDER.speed);
  }
  rider.v = v;
  rider.z -= v * dt;
  if (rider.z < K.J2 - K.HALF - RIDER.goneAfter) { rider.active = false; rider.done = true; }
  return rider;
}

// The car's front right corner reaches the rider's line near the corner, on its way into the turn.
export function cutsAcrossRider(pose, K) {
  const corner = carPoint(pose, 2.1, .9);
  return pose.heading > .12 && corner.x >= RIDER.x - .45 && Math.abs(corner.z - K.J2) < K.HALF + 5;
}

export function rightTurnConflict(rider, pose) {
  if (!rider.active || rider.following) return false;
  const eta = (rider.z - carPoint(pose, 2.1, .9).z) / RIDER.speed;
  return eta > -1 && eta < 3;
}

export function riderHitsCar(rider, pose, margin = .3) {
  const dx = RIDER.x - pose.x, dz = rider.z - pose.z, s = Math.sin(pose.heading), c = Math.cos(pose.heading);
  const along = dx * s - dz * c, across = dx * c + dz * s;
  return Math.abs(along) <= 2.1 + margin && Math.abs(across) <= .9 + margin;
}

/* ---------- a box test for two rectangles on the road ---------- */
// rect: x, z, heading, hl (half length), hw (half width).
export function boxesOverlap(a, b) {
  const axes = r => [{ x: Math.sin(r.heading), z: -Math.cos(r.heading) }, { x: Math.cos(r.heading), z: Math.sin(r.heading) }];
  const aa = axes(a), ba = axes(b), d = { x: b.x - a.x, z: b.z - a.z }, dot = (u, v) => u.x * v.x + u.z * v.z;
  return [...aa, ...ba].every(axis => Math.abs(dot(d, axis)) <= a.hl * Math.abs(dot(aa[0], axis)) + a.hw * Math.abs(dot(aa[1], axis)) + b.hl * Math.abs(dot(ba[0], axis)) + b.hw * Math.abs(dot(ba[1], axis)));
}
const playerBox = (pose, margin = 0) => ({ x: pose.x, z: pose.z, heading: pose.heading, hl: 2.1 + margin, hw: .9 + margin });

/* ---------- parked cars on the stretch before junction 1 ---------- */
// The row ends more than 40 m before junction 1, so the player is back in lane for the junction checks.
export const PARKED_X = 2.2;
const PARKED_ROWS = Object.freeze({ meet: Object.freeze([-44, -49.6, -55.2]), child: Object.freeze([-44, -51.2, -56.8]) });
export const parkedCars = tour => (PARKED_ROWS[tour.stretch] || []).map(z => ({ x: PARKED_X, z, heading: 0 }));
export function obstacleZone(tour) {
  // On a follow tour the obstacle is the car ahead, once it has pulled in at the kerb.
  if (tour.stretch === 'follow') return { near: LEAD.parkZ + 2.1, far: LEAD.parkZ - 2.1 };
  const cars = parkedCars(tour);
  return cars.length ? { near: Math.max(...cars.map(c => c.z)) + 2.1, far: Math.min(...cars.map(c => c.z)) - 2.1 } : null;
}
export const hitsParkedCar = (pose, tour) => parkedCars(tour).some(car => boxesOverlap(playerBox(pose), { ...car, hl: 2.1, hw: .9 }));
// A driver may move out well before the row to see past it, and needs a few metres after it to get back in lane.
const inObstacleStretch = (pose, zone) => Boolean(zone) && pose.z <= zone.near + 30 && pose.z >= zone.far - 10;
// Driving past the row on the left side of the road still counts as the route.
export const passingWindow = (pose, zone, K) => inObstacleStretch(pose, zone) && Math.abs(pose.x) <= K.HALF - .7 && Math.cos(pose.heading) > .8;

/* ---------- oncoming traffic at the parked cars ---------- */
// It comes out of junction 1 and is launched when the player is about as far from the row as it is,
// so it cannot be skipped by driving fast. The scooter has a role here: it is often the one coming.
export const MEET = Object.freeze({ speed: 11, brake: 6, accel: 2.5, stopGap: 3, x: -1.625, spacing: 2.4, goneBehind: 60,
  lineups: Object.freeze([Object.freeze(['scooter', 'car']), Object.freeze(['car', 'scooter']), Object.freeze(['scooter'])]) });
export const MEET_SIZE = Object.freeze({ car: Object.freeze({ hl: 2.1, hw: .9 }), scooter: Object.freeze({ hl: .95, hw: .42 }) });
export const meetSpawnZ = K => K.J1 + K.HALF + 3;
export const newMeet = (random = Math.random) => ({ launched: false, done: false, out: false, lineup: MEET.lineups[Math.floor(random() * MEET.lineups.length)], vehicles: [] });
export function shouldLaunchMeet(meet, front, v, zone, K) {
  if (meet.launched || meet.done) return false;
  const d = front - zone.near, travel = (zone.near - meetSpawnZ(K)) / MEET.speed;
  return d <= 12 || d / Math.max(v, 3) <= travel;
}
export function launchMeet(meet, K) {
  const z0 = meetSpawnZ(K);
  meet.launched = true;
  meet.vehicles = meet.lineup.map((kind, i) => ({ kind, z: z0 - i * MEET.speed * MEET.spacing, v: MEET.speed, active: true }));
  return meet;
}
// Shown only once it has come out of the junction.
export const meetVisible = (vehicle, K) => vehicle.active && vehicle.z >= meetSpawnZ(K) - .01;
export const meetBox = vehicle => ({ x: MEET.x, z: vehicle.z, heading: Math.PI, ...MEET_SIZE[vehicle.kind] });

// The oncoming vehicles brake for a car in their lane and for each other. They never drive through the player.
export function stepMeet(meet, dt, pose) {
  const corners = carCorners(pose), leftEdge = Math.min(...corners.map(c => c.x)), nearest = Math.min(...corners.map(c => c.z));
  meet.vehicles.forEach((vehicle, i) => {
    if (!vehicle.active) return;
    const size = MEET_SIZE[vehicle.kind];
    let limit = MEET.speed;
    if (leftEdge < MEET.x + size.hw + .25 && pose.z > vehicle.z) limit = Math.min(limit, Math.sqrt(2 * MEET.brake * Math.max(0, nearest - (vehicle.z + size.hl) - MEET.stopGap)));
    const lead = meet.vehicles[i - 1];
    if (lead?.active) limit = Math.min(limit, Math.sqrt(2 * MEET.brake * Math.max(0, (lead.z - MEET_SIZE[lead.kind].hl) - (vehicle.z + size.hl) - MEET.stopGap)));
    vehicle.v = vehicle.v > limit ? Math.max(limit, vehicle.v - MEET.brake * dt) : Math.min(limit, vehicle.v + MEET.accel * dt);
    vehicle.z += vehicle.v * dt;
    if (vehicle.z > pose.z + MEET.goneBehind || vehicle.z > 40) vehicle.active = false;
  });
  if (meet.launched && meet.vehicles.every(vehicle => !vehicle.active)) meet.done = true;
  return meet;
}

// The player has moved over the middle of the road beside or just before the parked cars.
export const pulledOut = (pose, zone) => pose.x < .6 && pose.z - 2.1 <= zone.near + 4 && pose.z + 2.1 >= zone.far && Math.cos(pose.heading) > .5;

// The first oncoming vehicle that has not passed the player and reaches the end of the row before the player is clear of it.
export function meetConflict(meet, pose, v, zone) {
  if (!meet.launched) return null;
  const front = pose.z - 2.1, rear = pose.z + 2.1, need = (front - zone.far + 4.2 + 1.5) / Math.max(v, 3) + .6;
  return meet.vehicles.find(vehicle => {
    if (!vehicle.active) return false;
    const size = MEET_SIZE[vehicle.kind];
    if (vehicle.z - size.hl >= rear) return false;
    return (zone.far - (vehicle.z + size.hl)) / MEET.speed < need;
  }) || null;
}
export const meetHit = (meet, pose) => meet.vehicles.find(vehicle => vehicle.active && boxesOverlap(playerBox(pose), meetBox(vehicle))) || null;

/* ---------- a child after a ball between the parked cars ---------- */
// The ball comes out about three seconds ahead of the player, so a driver who reacts to the ball stops in time.
export const CHILD = Object.freeze({ gapZ: -47.6, fromX: 4.2, toX: -.35, runSpeed: 2.6, walkSpeed: 1.5, delay: 1.1, stay: 1.8,
  ballFromX: 3.3, ballToX: -.9, ballSpeed: 3.4, triggerTime: 3, minTrigger: 16, half: .28 });
export const newChild = () => ({ phase: 'wait', t: 0, x: CHILD.fromX, ballX: CHILD.ballFromX, ball: false });
export const childTrigger = (front, v) => front - CHILD.gapZ <= Math.max(CHILD.minTrigger, v * CHILD.triggerTime);
export function startChild(child) { Object.assign(child, { phase: 'ball', t: 0, x: CHILD.fromX, ballX: CHILD.ballFromX, ball: true }); return child; }
// A car standing across the gap stops the child beside it.
function childStop(pose) {
  const corners = carCorners(pose), zs = corners.map(c => c.z);
  if (Math.min(...zs) - .4 > CHILD.gapZ || Math.max(...zs) + .4 < CHILD.gapZ) return CHILD.toX;
  return Math.max(CHILD.toX, Math.max(...corners.map(c => c.x)) + .35 + CHILD.half);
}
export function stepChild(child, dt, pose) {
  if (child.phase === 'wait' || child.phase === 'done') return child;
  child.t += dt;
  if (child.ball) child.ballX = Math.max(CHILD.ballToX, child.ballX - CHILD.ballSpeed * dt);
  if (child.phase === 'ball' && child.t >= CHILD.delay) { child.phase = 'out'; child.t = 0; }
  if (child.phase === 'out') {
    const stop = childStop(pose);
    child.x = Math.max(stop, child.x - CHILD.runSpeed * dt);
    if (child.x <= stop + 1e-6) { child.phase = 'stay'; child.t = 0; if (Math.abs(child.ballX - child.x) < 1) child.ball = false; }
  } else if (child.phase === 'stay') {
    if (child.t >= CHILD.stay) { child.phase = 'back'; child.t = 0; }
  } else if (child.phase === 'back') {
    child.x = Math.min(CHILD.fromX, child.x + CHILD.walkSpeed * dt);
    if (child.x >= CHILD.fromX) child.phase = 'done';
  }
  return child;
}
export const childOnRoad = child => ['out', 'stay', 'back'].includes(child.phase) && child.x < 3.25;
export const childHitsCar = (child, pose) => childOnRoad(child) && boxesOverlap(playerBox(pose, .25), { x: child.x, z: CHILD.gapZ, heading: 0, hl: CHILD.half, hw: CHILD.half });

/* ---------- the phone ---------- */
// It lights up once on the stretch before junction 1. Opening it costs two seconds with the eyes off the road.
export const PHONE = Object.freeze({ window: 6, look: 2, minSpeed: 3, lastZ: -70 });
export const newPhone = (random = Math.random) => ({ state: 'idle', appearZ: -6 - random() * 16, t: 0, lookT: 0, lookFrom: 0, lookV: 0 });
export function stepPhone(phone, dt, front, v) {
  if (phone.state === 'idle' && front <= phone.appearZ && v >= PHONE.minSpeed) { phone.state = 'ring'; phone.t = 0; }
  else if (phone.state === 'ring') { phone.t += dt; if (phone.t >= PHONE.window || front <= PHONE.lastZ) phone.state = 'gone'; }
  else if (phone.state === 'look') { phone.lookT += dt; if (phone.lookT >= PHONE.look) phone.state = 'read'; }
  return phone;
}
export function openPhone(phone, z, v) {
  if (phone.state !== 'ring') return false;
  Object.assign(phone, { state: 'look', lookT: 0, lookFrom: z, lookV: v });
  return true;
}

/* ---------- placement in the lane ---------- */
// Over the middle of the road for a few seconds with no reason is a fault of its own, once per tour.
export const LANE_RULE = Object.freeze({ maxX: -.15, grace: 2.5, minSpeed: 2 });
export function laneExempt(pose, tour, K) {
  if (Math.abs(pose.x) > K.HALF || Math.cos(pose.heading) < .85) return true;
  if (Math.abs(pose.z - K.J1) < K.HALF + 10 || Math.abs(pose.z - K.J2) < K.HALF + 16) return true;
  return inObstacleStretch(pose, obstacleZone(tour));
}
export const leftOfCentre = pose => pose.x < LANE_RULE.maxX;

/* ---------- starting from the kerb, and the car ahead ---------- */
// The tour starts parked by the kerb, 45 cm out so the car can turn away from it. A car comes from behind about three seconds later, so pulling out before it
// has passed is always in its way. It then drives ahead, brakes and pulls in at the kerb before junction 1.
export const KERB = Object.freeze({ x: 1.9, z: 26, behind: 33, look: .9, lookWithin: 4, need: 4, blinkOffZ: -10 });
export const LEAD = Object.freeze({ speed: 11, laneX: 1.625, passX: -.1, brakeAt: -44, parkZ: -60, parkX: 2.2, brake: 4.5, hardBrake: 6, accel: 2.5, stopGap: 3, close: 1, closeFor: 3, minSpeed: 5 });
export const newKerb = () => ({ moved: false, started: false, lookedAt: -Infinity });
export const newLead = () => ({ state: 'waiting', z: 0, x: LEAD.laneX, v: 0 });
export function sendLead(lead) { Object.assign(lead, { state: 'coming', z: KERB.z + KERB.behind, x: LEAD.laneX, v: LEAD.speed }); return lead; }
export const leadBox = lead => ({ x: lead.x, z: lead.z, heading: 0, hl: 2.1, hw: .9 });
export const leadOnRoad = lead => lead.state !== 'waiting';

// Where the car runs: out round the player's car while it still stands at the kerb, then back in its lane,
// and in to the kerb when it pulls in.
function leadLine(lead, pose) {
  if (lead.state === 'braking' || lead.state === 'parked') {
    const t = clamp((LEAD.brakeAt - 4 - lead.z) / (LEAD.brakeAt - 4 - LEAD.parkZ), 0, 1);
    return LEAD.laneX + (LEAD.parkX - LEAD.laneX) * t;
  }
  if (lead.state !== 'coming' || pose.x < 1.7) return LEAD.laneX;
  const d = Math.abs(lead.z - pose.z);
  return d < 10 ? LEAD.passX : d < 18 ? LEAD.passX + (LEAD.laneX - LEAD.passX) * (d - 10) / 8 : LEAD.laneX;
}

export function stepLead(lead, dt, pose) {
  if (lead.state === 'waiting' || lead.state === 'parked') return lead;
  const corners = carCorners(pose), playerRear = Math.max(...corners.map(c => c.z));
  let limit = LEAD.speed;
  // A car in its way: brake behind it. It never drives through the player.
  if (pose.z < lead.z && Math.abs(pose.x - lead.x) < 1.9) limit = Math.min(limit, Math.sqrt(2 * LEAD.hardBrake * Math.max(0, (lead.z - 2.1) - playerRear - LEAD.stopGap)));
  if (lead.state === 'ahead' && lead.z <= LEAD.brakeAt) lead.state = 'braking';
  if (lead.state === 'braking') limit = Math.min(limit, Math.sqrt(2 * LEAD.brake * Math.max(0, lead.z - LEAD.parkZ)));
  const decel = lead.state === 'braking' && limit > .01 ? LEAD.brake : LEAD.hardBrake;
  lead.v = lead.v > limit ? Math.max(limit, lead.v - decel * dt) : Math.min(limit, lead.v + LEAD.accel * dt);
  lead.z -= lead.v * dt;
  lead.x += (leadLine(lead, pose) - lead.x) * Math.min(1, dt * 3);
  if (lead.state === 'coming' && lead.z < pose.z - 4.5) lead.state = 'ahead';
  if (lead.state === 'braking' && lead.z - LEAD.parkZ < .3 && lead.v < .05) Object.assign(lead, { state: 'parked', v: 0, z: LEAD.parkZ, x: LEAD.parkX });
  return lead;
}
export const leadHit = (lead, pose) => leadOnRoad(lead) && boxesOverlap(playerBox(pose), leadBox(lead));

// Pulling out is judged at the first movement forward: the blink, a look over the left shoulder, and the car from behind.
export function kerbStartFaults(pose, indicator, lookedAt, clock, lead) {
  const faults = [];
  if (indicator !== -1) faults.push('blink');
  if (clock - lookedAt > KERB.lookWithin) faults.push('look');
  if (lead.state === 'waiting' || (lead.state === 'coming' && ((lead.z - 2.1) - (pose.z + 2.1)) / LEAD.speed < KERB.need && lead.z > pose.z - 4.2)) faults.push('traffic');
  return faults;
}

// Closer than about one second behind the moving car ahead, in its lane.
export function tooClose(lead, pose, v) {
  if (!['ahead', 'braking'].includes(lead.state) || lead.v < .5 || v < LEAD.minSpeed) return false;
  if (Math.abs(pose.x - lead.x) > 1.6 || pose.z < lead.z) return false;
  return (pose.z - 2.1) - (lead.z + 2.1) < v * LEAD.close;
}
// Done once the player is past the car, parked or still moving.
export const passedLead = (lead, pose) => leadOnRoad(lead) && lead.state !== 'coming' && pose.z + 2.1 < lead.z - 2.1 - 1;

/* ---------- parking at the end of a straight tour ---------- */
// After the crossing the player parks at the kerb. Each tour moves the bus stop, the yellow kerb line and the
// driveway, so the legal places are never the same twice in a row. Distances from the question bank (q-183, q-184, q-188).
export const PARKING = Object.freeze({ from: -357, to: -472, kerbGap: .35, still: 1, busClear: 12,
  layouts: Object.freeze([
    Object.freeze({ bus: -380, yellow: Object.freeze([-425, -405]), drive: Object.freeze([-441, -436]) }),
    Object.freeze({ bus: -440, yellow: Object.freeze([-372, -357]), drive: Object.freeze([-400, -395]) }),
    Object.freeze({ bus: -405, yellow: Object.freeze([-462, -447]), drive: Object.freeze([-372, -367]) }),
  ]) });
export const newParking = (random = Math.random) => ({ layout: Math.floor(random() * PARKING.layouts.length), still: 0 });
export const parkingLayout = parking => PARKING.layouts[parking.layout];
export const atKerb = (pose, K) => pose.x + .9 >= K.HALF - PARKING.kerbGap && Math.abs(headingNorm(pose.heading)) < .12;
export const inParkingStrip = pose => pose.z <= PARKING.from && pose.z >= PARKING.to;
// The first reason the car may not stand here, or null.
export function parkingFault(pose, layout) {
  const lo = pose.z - 2.1, hi = pose.z + 2.1, over = ([a, b]) => hi > a && lo < b;
  if (over([layout.bus - PARKING.busClear, layout.bus + PARKING.busClear])) return 'bus';
  if (over(layout.yellow)) return 'yellow';
  if (over(layout.drive)) return 'drive';
  return null;
}
// A legal place to stand, for the browser checks.
export function legalParkingZ(layout) {
  for (let z = PARKING.from - 2.2; z >= PARKING.to + 2.2; z -= .5) if (!parkingFault({ z }, layout)) return z;
  return null;
}

/* ---------- a cyclist ahead between the junctions, on a stop tour ---------- */
// The cyclist rides near the kerb and gets off at a house before junction 2. Passing needs good side distance:
// the question bank says "god afstand" and "ekstra sideafstand", so the game asks for a metre.
export const BIKE = Object.freeze({ x: 2.6, speed: 4.5, half: .35, spawnAhead: 28, startAfter: 8, stopAt: -204, parkX: 4.1, clearance: 1, minRelative: 1, near: 20 });
export const bikeTour = tour => tour.j2 === 'stop';
export const newBike = () => ({ state: 'wait', z: 0, x: BIKE.x, v: 0 });
export const bikeShouldStart = (bike, front, K) => bike.state === 'wait' && front <= K.J1 - K.HALF - BIKE.startAfter;
export function startBike(bike, pose) { Object.assign(bike, { state: 'riding', z: pose.z - BIKE.spawnAhead, x: BIKE.x, v: BIKE.speed }); return bike; }
export function stepBike(bike, dt) {
  if (bike.state === 'riding') { bike.z -= bike.v * dt; if (bike.z <= BIKE.stopAt) bike.state = 'stopping'; }
  else if (bike.state === 'stopping') {
    bike.v = Math.max(0, bike.v - 2 * dt); bike.z -= bike.v * dt; bike.x = Math.min(BIKE.parkX, bike.x + .8 * dt);
    if (bike.v === 0 && bike.x >= BIKE.parkX) bike.state = 'parked';
  }
  return bike;
}
const bikeOnRoad = bike => bike.state === 'riding' || bike.state === 'stopping';
// Metres between the car's right side and the cyclist while the car is beside it, or null.
export function bikeSideGap(bike, pose) {
  if (!bikeOnRoad(bike)) return null;
  const corners = carCorners(pose), zs = corners.map(c => c.z);
  if (Math.min(...zs) > bike.z + .9 || Math.max(...zs) < bike.z - .9) return null;
  return (bike.x - BIKE.half) - Math.max(...corners.map(c => c.x));
}
export const bikeHit = (bike, pose) => bikeOnRoad(bike) && boxesOverlap(playerBox(pose), { x: bike.x, z: bike.z, heading: 0, hl: .9, hw: BIKE.half });
export const passedBike = (bike, pose) => bike.state !== 'wait' && pose.z + 2.1 < bike.z - .9;
// Moving out to give the cyclist room is a reason to be near the middle of the road.
// Only until the car is past the cyclist: after that it belongs back in its lane.
export const bikeNear = (bike, pose) => Boolean(bike) && bikeOnRoad(bike) && pose.z - bike.z < BIKE.near && pose.z - 2.1 > bike.z - 6;
