/**
 * "Dit hold": race your driving-school class or your friends. Everyone on a team drives on the same road, in the order
 * of today's ranking, and the place you hold boosts the Boosters you earn.
 *
 * The principle:
 *   Dagens point  = 10 per question answered correctly today + 3 per day of your streak (counted up to 30 days).
 *   Holdboost     = placement + vehicle + tuning, at most +75 %, on every Booster you earn while you hold it.
 *     placement   1st +50 %, 2nd +35 %, 3rd +25 %, 4th +15 %, 5th +10 %, further back +5 %
 *     vehicle     scooter 0, small car +5 %, big car +10 %, race car +15 %
 *     tuning      +1 % per part, neon or lowering on the vehicle you drive, at most +10 %
 *   The boost is on once there are two of you on the team and you have answered at least one question correctly today.
 *   The front car always runs nitro; a streak of 7 days or more gives flames too; first place with that streak goes all out.
 *
 * Data (Firestore, see firebase/firestore.rules): teams/{code} { name, kind, owner, members } and
 * teams/{code}/racers/{uid} { name, day, correct, streak, car, boost }. Knowing the code is the invitation; only
 * members read the racers, and everyone writes only their own racer.
 */
import { vehicleLayers, cleanPlate, PARTS, BASES, SLOTS } from './mybil.js';

export const POINTS = Object.freeze({ correct: 10, streakDay: 3, streakCap: 30 });
export const PLACE_BOOST = Object.freeze([50, 35, 25, 15, 10, 5]);
export const CAR_BOOST = Object.freeze({ scooter: 0, smallcar: 5, bigcar: 10, racecar: 15 });
export const TUNING_CAP = 10, BOOST_CAP = 75, HOT_STREAK = 7, MAX_MEMBERS = 40;
export const KINDS = Object.freeze({ skole: 'Køreskolehold', venner: 'Venner' });
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const NAME_KEY = 'teoriboost.team.name', LAST_KEY = 'teoriboost.race.last', BOOST_KEY = 'teoriboost.team.boost';
const BLOCKED = ['FUCK', 'KUSSE', 'PIK', 'LUDER', 'NAZI', 'NEGER', 'HORE', 'PORNO'];
const HEX = /^#[0-9a-f]{6}$/i;

export const dayOf = (now = Date.now()) => new Date(now).toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
const yesterdayOf = now => dayOf(now - 864e5);

/* ---------- the rules (pure) ---------- */

/** Questions answered correctly today: the learning profile rewards each question once per day ("<question>:<day>"). */
export function correctToday(state, now = Date.now()) {
  const day = dayOf(now);
  return (Array.isArray(state?.rewards) ? state.rewards : []).filter(key => typeof key === 'string' && key.endsWith(':' + day)).length;
}
export const points = ({ correct = 0, streak = 0 } = {}) => Math.max(0, correct | 0) * POINTS.correct + Math.min(POINTS.streakCap, Math.max(0, streak | 0)) * POINTS.streakDay;

/** A racer as it counts today: yesterday's answers are not today's, and a streak not kept up since yesterday is over. */
export function asOfToday(racer, now = Date.now()) {
  const day = dayOf(now), live = racer.day === day, kept = live || racer.day === yesterdayOf(now);
  const correct = live ? racer.correct | 0 : 0, streak = kept ? racer.streak | 0 : 0;
  return { ...racer, correct, streak, points: points({ correct, streak }) };
}
/** Today's ranking: most points first; on a tie, the one who got there first (earlier update) stays in front. */
export function rank(racers, now = Date.now()) {
  return racers.map(r => asOfToday(r, now))
    .sort((a, b) => b.points - a.points || (a.at || 0) - (b.at || 0) || String(a.name).localeCompare(String(b.name), 'da'))
    .map((r, i) => ({ ...r, place: i + 1 }));
}
export const placeBoost = place => PLACE_BOOST[Math.min(PLACE_BOOST.length, Math.max(1, place)) - 1];
export function tuningCount(garage) {
  const base = garage?.active, eq = garage?.equipped?.[base] || {}, style = garage?.style?.[base] || {};
  return Object.values(eq).filter(Boolean).length + (style.neonOn ? 1 : 0) + (style.lowered ? 1 : 0);
}
/** Your boost now, and what it is made of. */
export function boostFor({ place, racers, correct, garage }) {
  const on = racers >= 2 && correct >= 1;
  const parts = { place: placeBoost(place), car: CAR_BOOST[garage?.active] || 0, tuning: Math.min(TUNING_CAP, tuningCount(garage)) };
  return { on, parts, pct: on ? Math.min(BOOST_CAP, parts.place + parts.car + parts.tuning) : 0 };
}
/** Flames: the leader runs nitro, a hot streak burns, and the leader with a hot streak goes all out. */
export const fireOf = r => r.place === 1 && r.streak >= HOT_STREAK ? 'mega' : r.place === 1 || r.streak >= HOT_STREAK ? 'nitro' : '';

/** Adds the boost to what was just earned. Only Boosters earned after joining count (boostBase), and each Booster is
 *  boosted once, at the boost you had when you earned it. */
export function withBoost(garage, earned, pct) {
  const base = Number.isFinite(garage?.boostBase) ? garage.boostBase : earned;
  if (earned <= base) return garage.boostBase === base ? garage : { ...garage, boostBase: base };
  const add = Math.round((earned - base) * Math.max(0, Math.min(BOOST_CAP, pct)) / 100);
  return { ...garage, boostBase: earned, bonus: (garage.bonus || 0) + add, lastBonus: add };
}

export function makeCode(random = Math.random) {
  let s = ''; for (let i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(random() * CODE_CHARS.length) % CODE_CHARS.length];
  return s;
}
export const cleanCode = text => String(text || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
export const validCode = code => /^[A-HJ-NP-Z2-9]{6}$/.test(code);
/** User names: 2 to 16 letters, digits, space, dot, dash or underscore; a few words are not allowed. */
export function cleanName(text) {
  const t = String(text || '').normalize('NFC').replace(/[^\p{L}\p{N} ._-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 16);
  if (t.length < 2) return '';
  return BLOCKED.some(w => t.toUpperCase().replace(/[^A-ZÆØÅ]/g, '').includes(w)) ? '' : t;
}
export const cleanTeamName = text => String(text || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 30);

/** The look others see: only the vehicle you drive, and only values the catalogue knows. */
export function publicCar(garage) {
  const base = BASES.some(b => b.id === garage?.active) ? garage.active : 'scooter';
  const eq = garage?.equipped?.[base] || {}, st = garage?.style?.[base] || {};
  const equipped = {};
  for (const slot of SLOTS) { const id = eq[slot.id]; if (id && PARTS.some(p => p.id === id && p.slot === slot.id)) equipped[slot.id] = id; }
  const style = {};
  for (const k of ['paint', 'stripe', 'windows', 'neon']) if (HEX.test(st[k] || '')) style[k] = st[k].toUpperCase();
  if (st.neonOn) style.neonOn = true;
  if (st.lowered) style.lowered = true;
  const plate = cleanPlate(st.plate); if (plate) style.plate = plate;
  return { base, equipped, style };
}
/** Someone else's car, as a garage vehicleLayers can draw. Everything is checked again: it came over the network. */
export function carGarage(json) {
  let car = {}; try { car = typeof json === 'string' ? JSON.parse(json) : json || {}; } catch { /* drawn as a scooter */ }
  const clean = publicCar({ active: car.base, equipped: { [car.base]: car.equipped || {} }, style: { [car.base]: car.style || {} } });
  return { active: clean.base, bases: [clean.base], owned: [], equipped: { [clean.base]: clean.equipped }, style: { [clean.base]: clean.style } };
}

/* ---------- names and memory on this device ---------- */

const read = (store, key) => { try { return store?.getItem(key) || ''; } catch { return ''; } };
const write = (store, key, value) => { try { store?.setItem(key, value); } catch { /* blocked: lasts this visit */ } };
export const savedName = (store = globalThis.localStorage) => cleanName(read(store, NAME_KEY));
/** The boost is remembered with the day it was worked out for, so it is not used again tomorrow before the race loads. */
export function savedBoost(store = globalThis.localStorage, now = Date.now()) {
  try { const b = JSON.parse(read(store, BOOST_KEY) || 'null'); return b && b.day === dayOf(now) ? b.pct | 0 : 0; } catch { return 0; }
}
const lastOrder = (store, code) => { try { return JSON.parse(read(store, LAST_KEY) || '{}')[code] || {}; } catch { return {}; } };

/* ---------- Firestore ---------- */

/** The team service. db() resolves to { fb, db, uid } when signed in to a real account, or null. */
export function createTeam({ db, store = globalThis.localStorage, now = () => Date.now(), random = Math.random }) {
  let team = null, racers = [], unsub = null, lastSent = '', status = 'idle', error = '', uid = null, confirm = false;
  const subs = new Set();
  const emit = () => subs.forEach(f => f(view()));
  const view = () => ({ status, error, team, racers, uid, confirm });
  const fail = (e, msg) => { console.warn('team:', e?.code || e?.message); error = e?.code === 'permission-denied' ? 'Holdene er ikke slået til endnu. Prøv igen senere.' : msg; status = team ? 'in' : 'out'; emit(); };

  function listen(c) {
    unsub?.(); unsub = null;
    unsub = c.fb.onSnapshot(c.fb.collection(c.db, 'teams', team.code, 'racers'), snap => {
      racers = snap.docs.map(d => ({ uid: d.id, ...d.data(), at: d.data().updatedAt?.toMillis?.() || 0 })); emit();
    }, e => fail(e, 'Kunne ikke hente holdet lige nu.'));
  }
  async function load() {
    const c = await db(); if (!c) { unsub?.(); unsub = null; team = null; racers = []; uid = null; status = 'signedout'; emit(); return; }
    uid = c.uid;
    status = 'loading'; emit();
    try {
      const q = c.fb.query(c.fb.collection(c.db, 'teams'), c.fb.where('members', 'array-contains', c.uid));
      const found = (await c.fb.getDocs(q)).docs[0];
      team = found ? { code: found.id, ...found.data() } : null; status = team ? 'in' : 'out'; error = '';
      if (team) listen(c); else { unsub?.(); unsub = null; racers = []; }
      emit();
    } catch (e) { fail(e, 'Kunne ikke hente dit hold lige nu.'); }
  }
  async function create(name, kind) {
    const c = await db(); if (!c) return;
    name = cleanTeamName(name); if (!name) { error = 'Giv holdet et navn.'; emit(); return; }
    status = 'busy'; error = ''; emit();
    try {
      let code = makeCode(random);
      for (let i = 0; i < 5 && (await c.fb.getDoc(c.fb.doc(c.db, 'teams', code))).exists(); i++) code = makeCode(random);
      await c.fb.setDoc(c.fb.doc(c.db, 'teams', code), { name, kind: KINDS[kind] ? kind : 'venner', owner: c.uid, members: [c.uid], createdAt: c.fb.serverTimestamp() });
      await load();
    } catch (e) { fail(e, 'Kunne ikke oprette holdet. Prøv igen.'); }
  }
  async function join(text) {
    const c = await db(); if (!c) return;
    const code = cleanCode(text);
    if (!validCode(code)) { error = 'Koden er 6 tegn, fx K7M2QX.'; emit(); return; }
    status = 'busy'; error = ''; emit();
    try {
      const snap = await c.fb.getDoc(c.fb.doc(c.db, 'teams', code));
      if (!snap.exists()) { error = 'Der findes ikke et hold med den kode.'; status = 'out'; emit(); return; }
      if ((snap.data().members || []).includes(c.uid)) { await load(); return; }
      if ((snap.data().members || []).length >= MAX_MEMBERS) { error = `Holdet er fuldt (${MAX_MEMBERS} på et hold).`; status = 'out'; emit(); return; }
      await c.fb.updateDoc(c.fb.doc(c.db, 'teams', code), { members: c.fb.arrayUnion(c.uid) });
      await load();
    } catch (e) { fail(e, 'Kunne ikke komme med på holdet. Prøv igen.'); }
  }
  async function leave() {
    const c = await db(); if (!c || !team) return;
    status = 'busy'; emit();
    try {
      await c.fb.deleteDoc(c.fb.doc(c.db, 'teams', team.code, 'racers', c.uid));
      await c.fb.updateDoc(c.fb.doc(c.db, 'teams', team.code), { members: c.fb.arrayRemove(c.uid) });
      unsub?.(); unsub = null; team = null; racers = []; lastSent = ''; confirm = false; status = 'out'; emit();
    } catch (e) { fail(e, 'Kunne ikke forlade holdet. Prøv igen.'); }
  }
  /** Your racer: name, today's answers, streak, the car you drive and your boost. Sent only when something changed. */
  async function publish(me) {
    const c = await db(); if (!c || !team) return;
    const name = cleanName(me.name); if (!name) return;
    const doc = { name, day: dayOf(now()), correct: Math.min(1000, me.correct | 0), streak: Math.min(5000, me.streak | 0), car: JSON.stringify(publicCar(me.garage)), boost: Math.min(BOOST_CAP, me.boost | 0) };
    const sig = JSON.stringify(doc); if (sig === lastSent) return;
    try { await c.fb.setDoc(c.fb.doc(c.db, 'teams', team.code, 'racers', c.uid), { ...doc, updatedAt: c.fb.serverTimestamp() }); lastSent = sig; }
    catch (e) { console.warn('team: could not send your racer', e?.code || e?.message); }
  }
  return {
    load, create, join, leave, publish, view,
    me: async () => (await db())?.uid || null,
    setName: name => { const n = cleanName(name); if (n) { write(store, NAME_KEY, n); lastSent = ''; } return n; },
    rememberBoost: pct => write(store, BOOST_KEY, JSON.stringify({ day: dayOf(now()), pct })),
    rememberOrder: order => { try { const all = JSON.parse(read(store, LAST_KEY) || '{}'); all[team?.code || '-'] = order; write(store, LAST_KEY, JSON.stringify(all)); } catch { /* fine */ } },
    lastOrder: () => lastOrder(store, team?.code || '-'),
    subscribe: fn => { subs.add(fn); return () => subs.delete(fn); },
    stop: () => { unsub?.(); unsub = null; },
    setConfirm: on => { confirm = !!on; emit(); },
  };
}

/* ---------- drawing ---------- */

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => new Intl.NumberFormat('da-DK').format(n);
/** Where the exhaust sits on each vehicle's square canvas (its tail lamp, see LAMPS in mybil.js). */
const TAIL = { scooter: [0.13, 0.62], smallcar: [0.09, 0.62], bigcar: [0.1, 0.6], racecar: [0.12, 0.6] };

/** Who is on the road: the leader, you, and those around you, up to `max`, front first. */
export function onRoad(ranked, meId, max = 5) {
  if (ranked.length <= max) return ranked;
  const mine = Math.max(0, ranked.findIndex(r => r.uid === meId));
  const pick = new Set([0, mine]);
  for (let d = 1; pick.size < max; d++) { if (mine - d > 0) pick.add(mine - d); if (pick.size < max && mine + d < ranked.length) pick.add(mine + d); if (mine - d <= 0 && mine + d >= ranked.length) break; }
  return [...pick].sort((a, b) => a - b).map(i => ranked[i]);
}
/** Each car's spot on the road: the leader furthest ahead, the lanes taking turns. */
export function spots(n) {
  return Array.from({ length: n }, (_, i) => ({ x: n === 1 ? 50 : 84 - i * (68 / Math.max(1, n - 1)), lane: i % 2 }));
}
function fire(kind, base) {
  if (!kind) return '';
  const [x, y] = TAIL[base] || TAIL.smallcar;
  return `<span class="race-fire race-fire--${kind}" style="right:${((1 - x) * 100).toFixed(1)}%;top:${(y * 100).toFixed(1)}%" aria-hidden="true"><i></i></span>${kind === 'mega' ? '<span class="race-wind" aria-hidden="true"></span>' : ''}`;
}
function car(r, spot, me, i) {
  const g = carGarage(r.car);
  return `<span class="race-car race-${g.active} race-lane-${spot.lane}${r.uid === me ? ' is-me' : ''}${r.fire ? ` is-${r.fire}` : ''}" data-racer="${esc(r.uid)}" style="--x:${spot.x.toFixed(2)}%;--i:${i}">`
    + `<span class="race-tag"><b>${r.place}</b>${esc(r.uid === me ? `${r.name} (dig)` : r.name)}</span>`
    + `<span class="race-rig">${fire(r.fire || 'pass', g.active)}${vehicleLayers(g)}</span></span>`;
}
/** The race on the home road: everyone's own car in today's order, names over them. */
export function renderRace({ ranked, me, team, max = 5, href = '#hold' }) {
  const shown = onRoad(ranked.map(r => ({ ...r, fire: fireOf(r) })), me, max);
  const at = spots(shown.length);
  const mine = ranked.find(r => r.uid === me);
  const lead = ranked[0];
  const label = mine ? `${team.name}. Du ligger nummer ${mine.place} af ${ranked.length}${lead && lead.uid !== me ? `, ${lead.name} fører` : ''}. Åbn ranglisten` : `${team.name}. Åbn ranglisten`;
  return `<a class="road-loop is-race" href="${href}" aria-label="${esc(label)}">`
    + '<span class="road-dusk" aria-hidden="true"></span><span class="road-night" aria-hidden="true"></span><span class="road-stars" aria-hidden="true"></span>'
    + '<span class="road-sun" aria-hidden="true"></span><span class="road-moon" aria-hidden="true"></span><span class="road-clouds" aria-hidden="true"></span>'
    + '<span class="road-hills road-hills--far" aria-hidden="true"></span><span class="road-hills road-hills--near" aria-hidden="true"></span>'
    + '<span class="road-trees" aria-hidden="true"></span><span class="road-asphalt" aria-hidden="true"><span class="road-dashes"></span></span>'
    + `<span class="race-pack" aria-hidden="true">${shown.map((r, i) => car(r, at[i], me, i)).join('')}</span><span class="race-call" aria-live="polite"></span>`
    + `<span class="road-label"><small>${esc(team.name)}</small><strong>${mine ? `Nr. ${mine.place} af ${ranked.length}` : 'Ranglisten'}</strong>${mine?.boostPct ? `<span class="race-boost">+${mine.boostPct} % Boosters</span>` : ''}</span></a>`;
}

/**
 * Brings the race to life: cars that moved up since you last looked overtake, the others drop back.
 * prev: { uid: place } from the last time; returns the overtakes it played.
 */
export function mountRace(el, { prev = {}, me, motion = true, onOvertake } = {}) {
  if (!el) return { dispose() {}, overtakes: [] };
  const cars = [...el.querySelectorAll('.race-car')];
  const place = c => Number(c.querySelector('.race-tag b')?.textContent) || 0;
  const names = Object.fromEntries(cars.map(c => [c.dataset.racer, c.querySelector('.race-tag')?.lastChild?.textContent || '']));
  const overtakes = [];
  for (const c of cars) {
    const was = prev[c.dataset.racer], now = place(c);
    if (was && now < was) {
      const passed = cars.find(o => o !== c && prev[o.dataset.racer] && prev[o.dataset.racer] < was && prev[o.dataset.racer] >= now);
      overtakes.push({ uid: c.dataset.racer, name: names[c.dataset.racer], passed: passed ? names[passed.dataset.racer] : '' });
    }
  }
  const anims = [];
  if (motion && overtakes.length && el.animate) {
    const pack = el.querySelector('.race-pack'), w = pack?.clientWidth || 1;
    const xOf = c => parseFloat(c.style.getPropertyValue('--x')) / 100 * w;
    const byPlace = Object.fromEntries(cars.map(c => [place(c), c]));
    for (const c of cars) {
      const was = prev[c.dataset.racer], now = place(c);
      if (!was || was === now) continue;
      // start where it was: on the spot of the car now holding its old place (or off the back of the road)
      const from = byPlace[was] ? xOf(byPlace[was]) - xOf(c) : -xOf(c) - 120;
      const up = now < was, lane = c.classList.contains('race-lane-0') ? -1 : 1; // pull out towards the other lane to pass
      const a = c.animate(up
        ? [{ translate: `${from}px 0`, offset: 0 }, { translate: `${from * .55}px ${lane * 16}px`, offset: .35 }, { translate: `${from * .15}px ${lane * 16}px`, offset: .7 }, { translate: '0 0', offset: 1 }]
        : [{ translate: `${from}px 0` }, { translate: '0 0' }],
        { duration: up ? 1900 : 2100, delay: 500, easing: up ? 'cubic-bezier(.3,0,.25,1)' : 'cubic-bezier(.5,0,.4,1)', fill: 'backwards' });
      anims.push(a);
      if (up) {
        c.classList.add('is-passing'); a.finished.then(() => c.classList.remove('is-passing'), () => {});
      }
    }
    const call = el.querySelector('.race-call'), o = overtakes[0];
    if (call && o) {
      call.textContent = o.uid === me ? (o.passed ? `Du overhalede ${o.passed}!` : 'Du rykkede frem!') : o.passed ? `${o.name} overhalede ${o.passed}` : `${o.name} rykkede frem`;
      call.classList.add('is-on'); setTimeout(() => call.classList.remove('is-on'), 3600);
    }
    onOvertake?.(overtakes);
  }
  return { overtakes, dispose() { anims.forEach(a => a.cancel()); } };
}

/** The team page (#hold). */
export function renderTeamPage({ view, account, me, ranked, boost, name, garage }) {
  const head = '<header class="screen-head"><a class="back-round" href="#minbil" aria-label="Tilbage til Min bil"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></a><h1 id="team-title">Dit hold</h1></header>';
  const how = `<details class="panel team-how"><summary>Sådan virker kapløbet</summary>
    <p><b>Dagens point:</b> ${POINTS.correct} for hvert spørgsmål, du svarer rigtigt på i dag, og ${POINTS.streakDay} for hver dag i din streak (op til ${POINTS.streakCap} dage). Ranglisten starter forfra hver nat.</p>
    <p><b>Holdboost:</b> Så længe du ligger på ranglisten og har svaret rigtigt i dag, får du ekstra Boosters på alt, du tjener: 1. plads +50 %, 2. plads +35 %, 3. plads +25 %, 4. plads +15 %, 5. plads +10 %, længere tilbage +5 %. En bedre bil giver op til +15 % ekstra, og hver del, du har monteret, +1 % (op til +10 %). Højst +${BOOST_CAP} % i alt.</p>
    <p><b>Ild:</b> Den forreste kører på nitro. Har du ${HOT_STREAK} dage eller flere i træk, brænder din udstødning også, og er du forrest med den streak, går den helt amok.</p></details>`;
  const privacy = '<p class="team-fine">Dem på holdet kan se dit brugernavn, din bil og dine point i dag. Din e-mail vises aldrig.</p>';
  if (!account || account.state === 'off' || account.state === 'local') return `<section class="team" aria-labelledby="team-title">${head}<div class="panel"><p>Holdene kræver forbindelse til din konto, og den kan ikke startes her lige nu.</p></div>${how}</section>`;
  if (account.state !== 'user') return `<section class="team" aria-labelledby="team-title">${head}<div class="panel team-intro"><h2>Kør om kap med dit hold</h2><p>Saml din køreskoles hold eller dine venner på én vej. Den, der svarer rigtigt på flest spørgsmål i dag, kører forrest og får mest ekstra Boosters.</p><p>Log ind først, så holdet kan finde dig igen på alle dine enheder.</p><div class="acc-actions acc-actions--stack"><button type="button" class="big-btn" data-account="google">Fortsæt med Google</button><a class="big-btn big-btn--ghost" href="#profil">Log ind med e-mail på Din profil</a></div></div>${how}</section>`;
  const err = view.error ? `<p class="acc-error" role="alert">${esc(view.error)}</p>` : '';
  if (view.status === 'loading' || view.status === 'idle') return `<section class="team" aria-labelledby="team-title">${head}<div class="panel"><p class="acc-sync">Henter dit hold <span class="tb-stripes" aria-hidden="true"></span></p></div></section>`;
  const nameForm = `<form class="team-form" data-team-form="name"><label for="team-name">Dit brugernavn på holdet</label><div class="acc-row"><input id="team-name" name="name" maxlength="16" autocomplete="nickname" required value="${esc(name)}" placeholder="fx Kenneth_K"><button type="submit" class="big-btn">Gem</button></div></form>`;
  if (!view.team) {
    return `<section class="team" aria-labelledby="team-title">${head}${err}
      <div class="panel team-intro"><h2>Kør om kap med dit hold</h2><p>Saml din køreskoles hold eller dine venner på én vej. Alle kører i deres egen bil, og den, der svarer rigtigt på flest spørgsmål i dag, kører forrest.</p>${name ? '' : nameForm}</div>
      <div class="team-split">
        <form class="panel team-form" data-team-form="join"><h2>Har du en kode?</h2><label for="team-code">Holdkode</label><div class="acc-row"><input id="team-code" name="code" maxlength="7" autocomplete="off" autocapitalize="characters" spellcheck="false" required placeholder="K7M2QX" class="team-code-input"><button type="submit" class="big-btn"${name ? '' : ' disabled'}>Kør med</button></div></form>
        <form class="panel team-form" data-team-form="create"><h2>Start et hold</h2><label for="team-new">Holdets navn</label><input id="team-new" name="team" maxlength="30" required placeholder="fx Hold 3, Aarhus Køreskole">
          <fieldset class="team-kind"><legend>Hvem kører med?</legend>${Object.entries(KINDS).map(([id, label], i) => `<label><input type="radio" name="kind" value="${id}"${i === 0 ? ' checked' : ''}><span>${label}</span></label>`).join('')}</fieldset>
          <button type="submit" class="big-btn"${name ? '' : ' disabled'}>Opret holdet</button></form>
      </div>${name ? '' : '<p class="team-fine">Vælg dit brugernavn først.</p>'}${how}${privacy}</section>`;
  }
  const t = view.team, mine = ranked.find(r => r.uid === me);
  const rows = ranked.map(r => `<li class="team-row${r.uid === me ? ' is-me' : ''}"><b class="team-place">${r.place}</b><span class="team-thumb" aria-hidden="true">${vehicleLayers(carGarage(r.car))}</span><span class="team-who"><strong>${esc(r.name)}${r.uid === me ? ' <small>(dig)</small>' : ''}</strong><small>${r.correct} rigtige i dag <span class="tb-stripes" aria-hidden="true"></span> ${r.streak} ${r.streak === 1 ? 'dag' : 'dage'} i træk</small></span><span class="team-pts"><b>${fmt(r.points)}</b><small>point</small></span></li>`).join('');
  const parts = boost?.parts || { place: 0, car: 0, tuning: 0 };
  const boostCard = `<div class="panel team-boost${boost?.on ? ' is-on' : ''}"><div class="team-boost-big"><small>Din holdboost</small><strong>+${boost?.pct || 0} %</strong><span>på de Boosters, du tjener nu</span></div>
    <ul class="team-boost-parts"><li><span>${mine ? `${mine.place}. plads` : 'Placering'}</span><b>+${parts.place} %</b></li><li><span>Din bil</span><b>+${parts.car} %</b></li><li><span>Tuning</span><b>+${parts.tuning} %</b></li></ul>
    ${boost?.on ? '' : `<p class="team-fine">${ranked.length < 2 ? 'Boosten starter, når én mere er med på holdet.' : 'Svar rigtigt på et spørgsmål i dag, så starter din boost.'}</p>`}
    ${garage?.lastBonus ? `<p class="team-fine">Seneste boost: +${fmt(garage.lastBonus)} Boosters.</p>` : ''}</div>`;
  return `<section class="team" aria-labelledby="team-title">${head}${err}
    <div id="team-race" class="team-race"></div>
    ${boostCard}
    <div class="panel team-board"><h2>${esc(t.name)} <small>${esc(KINDS[t.kind] || '')} <span class="tb-stripes" aria-hidden="true"></span> ${ranked.length} ${ranked.length === 1 ? 'kører' : 'kører'}</small></h2><ol class="team-list">${rows || '<li class="empty-note">Holdet er klar. Svar på et spørgsmål, så kører du ud på vejen.</li>'}</ol></div>
    <div class="panel team-invite"><h2>Inviter flere</h2><p>Del koden med dit hold. Op til ${MAX_MEMBERS} kan køre med.</p><div class="team-code"><b>${esc(t.code)}</b><button type="button" class="big-btn" data-team="share" data-code="${esc(t.code)}" data-name="${esc(t.name)}">Del koden</button></div></div>
    <div class="panel">${nameForm}</div>
    ${how}${privacy}
    <div class="team-leave">${view.confirm ? `<p>Vil du forlade ${esc(t.name)}? Dine point på holdet forsvinder.</p><div class="acc-actions"><button type="button" class="big-btn acc-danger" data-team="leave-yes">Forlad holdet</button><button type="button" class="big-btn big-btn--ghost" data-team="cancel">Bliv</button></div>` : '<button type="button" class="acc-link acc-link--danger" data-team="leave">Forlad holdet</button>'}</div>
  </section>`;
}

/* ---------- a stand-in for Firestore (tests, and the local race preview on a development host) ---------- */
export function memoryFirestore(uid, seed = {}) {
  const docs = new Map(Object.entries(seed)), listeners = new Set();
  const path = (...p) => p.join('/');
  const snapOf = p => ({ id: p.split('/').pop(), exists: () => docs.has(p), data: () => docs.get(p) });
  const notify = () => listeners.forEach(l => l());
  const fb = {
    doc: (_, ...p) => ({ p: path(...p) }), collection: (_, ...p) => ({ p: path(...p) }),
    where: (field, op, value) => ({ field, value }), query: (col, w) => ({ ...col, w }),
    getDoc: async ref => snapOf(ref.p),
    getDocs: async q => ({ docs: [...docs.keys()].filter(k => k.startsWith(q.p + '/') && k.split('/').length === q.p.split('/').length + 1 && (!q.w || (docs.get(k)[q.w.field] || []).includes(q.w.value))).map(snapOf) }),
    setDoc: async (ref, data) => { docs.set(ref.p, { ...data, updatedAt: { toMillis: () => Date.now() } }); notify(); },
    updateDoc: async (ref, patch) => { const d = { ...docs.get(ref.p) }; for (const [k, v] of Object.entries(patch)) d[k] = v?.union ? [...new Set([...(d[k] || []), v.union])] : v?.remove ? (d[k] || []).filter(x => x !== v.remove) : v; docs.set(ref.p, d); notify(); },
    deleteDoc: async ref => { docs.delete(ref.p); notify(); },
    onSnapshot: (col, next) => { const run = () => next({ docs: [...docs.keys()].filter(k => k.startsWith(col.p + '/')).map(snapOf) }); listeners.add(run); run(); return () => listeners.delete(run); },
    arrayUnion: union => ({ union }), arrayRemove: remove => ({ remove }), serverTimestamp: () => null,
  };
  return { fb, db: {}, uid, docs };
}
