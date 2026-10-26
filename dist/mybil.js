/**
 * "Min bil": personal vehicle customisation paid with Boosters.
 * Boosters are earned only by learning and are derived from the progress the app already stores
 * (journey events and exam history), so they cannot be farmed or bought. Only spending is stored here.
 * A vehicle is a base image plus transparent part layers on one shared canvas (generated with Codex, see
 * docs/redesign/garage-v5). Paint, stripes and window tint are white masks the app colours freely.
 */
import { ico } from './ui-icons.js';
import { SLOTS, PARTS, BASES } from './mybil-catalog.js';

export { SLOTS, PARTS, BASES };
export const BOOSTER_RATES = Object.freeze({ lesson: 1000, dailyGoal: 1500, examPass: 5000 });
// Extras that are not image parts: unlocked once per vehicle, then free to change.
export const EXTRAS = Object.freeze({ neon: { name: 'Neon under bilen', price: 4000 }, lower: { name: 'Sænkning', price: 5000 } });
/** "Bland min bil": rolls a new look from what you already own. Bought once, for every vehicle. */
export const SHUFFLE = Object.freeze({ key: 'garage:shuffle', name: 'Bland min bil', price: 3000 });
export const COLOR_PRESETS = Object.freeze(['#FF3CC8', '#14E0F0', '#D5FF62', '#FF4B4B', '#FF9600', '#FFD23F', '#58CC02', '#1CB0F6', '#8A5CF6', '#1F2328', '#FFFFFF', '#9AA3AD']);
const DEFAULT_COLORS = { paint: '#FF3CC8', stripe: '#FFFFFF', windows: '#1F2328', neon: '#B66DFF' };
const STORE_KEY = 'teoriboost.mybil.v1';
const ROOT = 'assets/mybil/';

const partById = id => PARTS.find(part => part.id === id);
const baseById = id => BASES.find(base => base.id === id);
const slotOf = id => SLOTS.find(s => s.id === partById(id)?.slot);
export const partSrc = (baseId, partId) => `${ROOT}${baseId}/${partId}.webp`;
export const baseSrc = baseId => `${ROOT}${baseId}/base.webp`;
export const partsFor = baseId => (baseById(baseId)?.parts || []).map(partById).filter(Boolean);

/** Boosters earned from stored progress. */
export function boostersEarned({ journey, history } = {}) {
  const events = Array.isArray(journey?.events) ? journey.events : [];
  const goal = Math.max(1, Number(journey?.dailyGoal) || 1);
  const lessons = new Set(events.filter(e => e?.kind === 'lesson' && e.sectionId && e.day).map(e => `${e.sectionId}|${e.day}`)).size;
  const perDay = {};
  for (const e of events) if (e?.day) perDay[e.day] = (perDay[e.day] || 0) + 1;
  const goalDays = Object.values(perDay).filter(count => count >= goal).length;
  // Exam entries count unanswered situations as errors; within the app's limit means at most 5.
  const passes = new Set((Array.isArray(history) ? history : []).filter(h => Number.isFinite(h?.errors) && h.errors <= 5).map(h => h.id)).size;
  return lessons * BOOSTER_RATES.lesson + goalDays * BOOSTER_RATES.dailyGoal + passes * BOOSTER_RATES.examPass;
}

export function emptyGarage() {
  return { spent: 0, earnedSeen: 0, owned: [], bases: ['scooter'], active: 'scooter', equipped: {}, style: {} };
}
export function loadGarage(storage = globalThis.localStorage) {
  try {
    const raw = JSON.parse(storage?.getItem(STORE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return emptyGarage();
    const g = emptyGarage();
    g.spent = Math.max(0, Number(raw.spent) || 0);
    g.earnedSeen = Math.max(0, Number(raw.earnedSeen) || 0);
    g.owned = Array.isArray(raw.owned) ? raw.owned.filter(id => typeof id === 'string' && id.includes(':')) : [];
    g.bases = Array.isArray(raw.bases) ? [...new Set(['scooter', ...raw.bases.filter(id => baseById(id))])] : ['scooter'];
    g.active = g.bases.includes(raw.active) ? raw.active : 'scooter';
    g.equipped = raw.equipped && typeof raw.equipped === 'object' ? raw.equipped : {};
    g.style = raw.style && typeof raw.style === 'object' ? raw.style : {};
    return g;
  } catch { return emptyGarage(); }
}
export function saveGarage(garage, storage = globalThis.localStorage) {
  try { storage?.setItem(STORE_KEY, JSON.stringify(garage)); } catch { /* storage full or blocked: keep in memory */ }
}

// The app keeps only the last 30 exams, so earnings are remembered as a high-water mark: never lost.
export const totalEarned = (progress, garage) => Math.max(boostersEarned(progress), garage?.earnedSeen || 0);
export const balance = (progress, garage) => Math.max(0, totalEarned(progress, garage) - (garage?.spent || 0));
export const withEarnings = (garage, progress) => ({ ...garage, earnedSeen: totalEarned(progress, garage) });
const owns = (garage, key) => garage.owned.includes(`${garage.active}:${key}`);
const styleOf = garage => ({ ...DEFAULT_COLORS, plate: '', neonOn: false, lowered: false, ...(garage.style?.[garage.active] || {}) });

/** Pure state transitions; each returns { garage, ok, message }. */
export function buyBase(garage, progress, baseId) {
  const base = baseById(baseId);
  if (!base) return { garage, ok: false, message: 'Ukendt køretøj.' };
  if (garage.bases.includes(baseId)) return { garage: { ...garage, active: baseId }, ok: true, message: `${base.name} er valgt.` };
  if (balance(progress, garage) < base.price) return { garage, ok: false, message: 'Du har ikke Boosters nok endnu.' };
  return { garage: { ...garage, spent: garage.spent + base.price, bases: [...garage.bases, baseId], active: baseId }, ok: true, message: `${base.name} er din!` };
}
export function buyOrEquipPart(garage, progress, partId) {
  const part = partById(partId);
  if (!part || !partsFor(garage.active).includes(part)) return { garage, ok: false, message: 'Den del passer ikke til dette køretøj.' };
  const slotKey = garage.active;
  const equipped = { ...garage.equipped, [slotKey]: { ...(garage.equipped[slotKey] || {}) } };
  if (owns(garage, partId)) {
    const current = equipped[slotKey][part.slot];
    if (current === partId) delete equipped[slotKey][part.slot]; else equipped[slotKey][part.slot] = partId;
    return { garage: { ...garage, equipped }, ok: true, message: current === partId ? `${part.name} er taget af.` : `${part.name} er monteret.` };
  }
  if (balance(progress, garage) < part.price) return { garage, ok: false, message: 'Du har ikke Boosters nok endnu.' };
  equipped[slotKey][part.slot] = partId;
  return { garage: { ...garage, spent: garage.spent + part.price, owned: [...garage.owned, `${slotKey}:${partId}`], equipped }, ok: true, message: `${part.name} er købt og monteret.` };
}
/** Take one part off. It stays owned, so putting it back on is free. */
export function unequipSlot(garage, slot) {
  const eq = { ...(garage.equipped?.[garage.active] || {}) };
  const id = eq[slot];
  if (!id) return { garage, ok: true, message: '' };
  delete eq[slot];
  return { garage: { ...garage, equipped: { ...garage.equipped, [garage.active]: eq } }, ok: true, message: `${partById(id)?.name || 'Delen'} er taget af. Den ligger klar i garagen.` };
}
/** Back to stock: every part off, neon off, raised again. Parts and colours are kept. */
export function unequipAll(garage) {
  const style = { ...(garage.style?.[garage.active] || {}), neonOn: false, lowered: false };
  return { garage: { ...garage, equipped: { ...garage.equipped, [garage.active]: {} }, style: { ...garage.style, [garage.active]: style } }, ok: true, message: 'Al tuning er taget af. Dine dele og farver ligger klar i garagen.' };
}
export function buyOrToggleExtra(garage, progress, extraId) {
  const extra = EXTRAS[extraId];
  if (!extra) return { garage, ok: false, message: 'Ukendt ekstraudstyr.' };
  if (extraId === 'lower' && !baseById(garage.active)?.split) return { garage, ok: false, message: 'Dette køretøj kan ikke sænkes endnu.' };
  const key = `extra-${extraId}`, flag = extraId === 'neon' ? 'neonOn' : 'lowered';
  const style = { ...styleOf(garage) };
  if (owns(garage, key)) {
    style[flag] = !style[flag];
    return { garage: { ...garage, style: { ...garage.style, [garage.active]: style } }, ok: true, message: `${extra.name} er ${style[flag] ? 'slået til' : 'slået fra'}.` };
  }
  if (balance(progress, garage) < extra.price) return { garage, ok: false, message: 'Du har ikke Boosters nok endnu.' };
  style[flag] = true;
  return { garage: { ...garage, spent: garage.spent + extra.price, owned: [...garage.owned, `${garage.active}:${key}`], style: { ...garage.style, [garage.active]: style } }, ok: true, message: `${extra.name} er købt.` };
}

const HEX = /^#[0-9a-f]{6}$/i;
/** Free colour choice for paint, stripes, windows and neon. Changing colour is free once unlocked. */
export function setColor(garage, kind, color) {
  if (!['paint', 'stripe', 'windows', 'neon'].includes(kind) || !HEX.test(color)) return { garage, ok: false, message: 'Ugyldig farve.' };
  const style = { ...styleOf(garage), [kind]: color.toUpperCase() };
  return { garage: { ...garage, style: { ...garage.style, [garage.active]: style } }, ok: true, message: '' };
}

const BLOCKED = ['FUCK', 'KUSSE', 'PIK', 'LUDER', 'NAZI', 'NEGER', 'HORE', 'SEX', 'PORNO', 'SS'];
/** Try-on: what the vehicle would look like with a part or an extra you do not own yet. Nothing is bought or saved;
 *  returns the garage to draw, or the garage itself when there is nothing to try. */
export function withTryOn(garage, tryOn) {
  if (!tryOn || tryOn.base !== garage.active) return garage;
  if (tryOn.extra) {
    const flag = tryOn.extra === 'neon' ? 'neonOn' : 'lowered';
    return { ...garage, style: { ...garage.style, [garage.active]: { ...styleOf(garage), [flag]: true } } };
  }
  const part = partById(tryOn.part);
  if (!part || !partsFor(garage.active).includes(part)) return garage;
  return { ...garage, equipped: { ...garage.equipped, [garage.active]: { ...(garage.equipped[garage.active] || {}), [part.slot]: part.id } } };
}
export const ownsShuffle = garage => garage.owned.includes(SHUFFLE.key);
export function buyShuffle(garage, progress) {
  if (ownsShuffle(garage)) return { garage, ok: true, message: '' };
  if (balance(progress, garage) < SHUFFLE.price) return { garage, ok: false, message: 'Du har ikke Boosters nok endnu.' };
  return { garage: { ...garage, spent: garage.spent + SHUFFLE.price, owned: [...garage.owned, SHUFFLE.key] }, ok: true, message: 'Bland min bil er låst op. Tryk igen for at slå terningerne.' };
}
/** A random new look from the parts, colours and extras you own for the active vehicle (free once unlocked). Each slot
 *  you own something for gets one of your parts, or now and then stock; colours come from the presets. */
export function shuffleLook(garage, random = Math.random) {
  if (!ownsShuffle(garage)) return { garage, ok: false, message: 'Lås Bland min bil op først.' };
  const base = garage.active, mine = partsFor(base).filter(p => owns(garage, p.id));
  const extras = Object.keys(EXTRAS).filter(id => owns(garage, `extra-${id}`) && (id !== 'lower' || baseById(base)?.split));
  if (mine.length + extras.length < 2) return { garage, ok: false, message: 'Køb mindst to ting, så er der noget at blande.' };
  const pick = list => list[Math.floor(random() * list.length) % list.length];
  const roll = () => {
    const equipped = {};
    for (const slot of new Set(mine.map(p => p.slot))) { if (random() < .8) equipped[slot] = pick(mine.filter(p => p.slot === slot)).id; }
    const style = { ...styleOf(garage) };
    for (const kind of new Set(mine.map(p => p.tint).filter(Boolean))) style[kind] = pick(COLOR_PRESETS);
    if (extras.includes('neon')) { style.neonOn = random() < .6; style.neon = pick(COLOR_PRESETS); }
    if (extras.includes('lower')) style.lowered = random() < .5;
    return { equipped, style };
  };
  const now = JSON.stringify({ e: garage.equipped?.[base] || {}, s: styleOf(garage) });
  let look = roll();
  for (let i = 0; i < 6 && JSON.stringify({ e: look.equipped, s: look.style }) === now; i++) look = roll();
  return { garage: { ...garage, equipped: { ...garage.equipped, [base]: look.equipped }, style: { ...garage.style, [base]: look.style } }, ok: true, message: 'Nyt look! Tryk igen for et andet.' };
}

/** Licence plate text: letters, digits and space, max 7, a small list of words not allowed. */
export function cleanPlate(text) {
  const t = String(text || '').toUpperCase().replace(/[^A-ZÆØÅ0-9 ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 7);
  return BLOCKED.some(w => t.replace(/ /g, '').includes(w)) ? '' : t;
}
export function setPlate(garage, text) {
  const plate = cleanPlate(text);
  if (text && !plate) return { garage, ok: false, message: 'Den tekst kan ikke bruges på pladen.' };
  const style = { ...styleOf(garage), plate };
  return { garage: { ...garage, style: { ...garage.style, [garage.active]: style } }, ok: true, message: plate ? `Pladen siger ${plate}.` : '' };
}

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => new Intl.NumberFormat('da-DK').format(n);

/** The Booster icon: a lime coin with a bolt. Only the icon and the count are ever shown. */
export function boosterIcon(size = 20) {
  return `<svg class="booster-icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="#FFD60A" stroke="#1F2328" stroke-width="2"/><path d="M13.5 4.5 7.5 13h4l-1 6.5 6-8.5h-4z" fill="#1F2328"/></svg>`;
}
export function boosterCount(amount, rive = '') {
  return `${rive ? `<span class="bolt-rive" data-rive="${rive}">${boosterIcon()}</span>` : boosterIcon()}<b>${fmt(amount)}</b><span class="sr-only"> Boosters</span>`;
}

/** Layers of the active vehicle, in stacking order. Masks are tinted: a coloured shape plus the grey shading multiplied on top. */
export function vehicleLayers(garage, baseId = garage.active) {
  const base = baseById(baseId);
  const style = { ...styleOf(garage), ...(garage.style?.[baseId] || {}) };
  const equipped = garage.equipped?.[baseId] || {};
  const lowered = style.lowered && base?.split;
  const img = (src, z, id = '') => `<img src="${escape(src)}" alt="" style="z-index:${z}"${id ? ` data-layer="${escape(id)}"` : ''}>`;
  const tinted = (src, z, color, cls = '', id = '') => `<span class="mybil-tint ${cls}" data-layer="${escape(id)}" style="z-index:${z};--src:url('${escape(src)}');background:${escape(color)}"></span><img class="mybil-shade ${cls}" src="${escape(src)}" alt="" style="z-index:${z}">`;
  const split = !!base?.split;
  const body = [img(split ? `${ROOT}${baseId}/body.webp` : baseSrc(baseId), 0)];
  const wheels = [];
  for (const slot of SLOTS) {
    const id = equipped[slot.id]; const part = id && partById(id);
    if (!part || !(base?.parts || []).includes(id)) continue;
    const src = partSrc(baseId, id);
    const html = part.tint ? tinted(src, slot.z, style[part.tint], part.tint === 'windows' ? 'is-glass' : '', id) : img(src, slot.z, id);
    (slot.id === 'wheels' ? wheels : body).push(html);
  }
  if (split && !equipped.wheels) wheels.push(img(`${ROOT}${baseId}/wheels.webp`, 14));
  const [x0, , x1, y1] = base?.bbox || [0.1, 0, 0.9, 0.85];
  const neon = style.neonOn ? `<span class="mybil-neon" style="left:${x0 * 100 + 6}%;right:${(1 - x1) * 100 + 6}%;top:${y1 * 100 - 5}%;background:${escape(style.neon)}"></span>` : '';
  const p = base?.plate; const showPlate = p && equipped.plate === 'plate-blank' && style.plate;
  const plate = showPlate ? `<span class="mybil-plate" style="left:${p[0] * 100}%;top:${p[1] * 100}%;width:${(p[2] - p[0]) * 100}%;height:${(p[3] - p[1]) * 100}%;z-index:30;--n:${Math.max(3, [...style.plate].length)}"><b>${escape(style.plate)}</b></span>` : '';
  return `<span class="mybil-rig">${neon}<span class="mybil-body${lowered ? ' is-lowered' : ''}${split ? ' is-sprung' : ''}">${body.join('')}${plate}</span><span class="mybil-wheels">${wheels.join('')}</span></span>`;
}

function colorPicker(kind, value) {
  return `<div class="mybil-colors" role="group" aria-label="Vælg farve">${COLOR_PRESETS.map(c => `<button type="button" class="mybil-swatch${c === value ? ' is-on' : ''}" style="background:${c}" data-mybil-color="${kind}" data-value="${c}" aria-label="Farve ${c}" aria-pressed="${c === value}"></button>`).join('')}<label class="mybil-custom"><input type="color" value="${escape(value)}" data-mybil-color-input="${kind}" aria-label="Vælg din egen farve"><span>Egen farve</span></label></div>`;
}

export function renderMyCar({ garage, progress, slot = '', message = '', tryOn = null }) {
  const coins = balance(progress, garage);
  const active = baseById(garage.active);
  const equipped = garage.equipped?.[garage.active] || {};
  const style = styleOf(garage);
  const available = partsFor(garage.active);
  const usedSlots = SLOTS.filter(s => available.some(p => p.slot === s.id));
  // open on the vehicle's first step (the scooter starts with its restoration), or keep the chosen tab if this vehicle has it
  if (slot !== 'extra' && !usedSlots.some(s => s.id === slot)) slot = usedSlots[0]?.id || 'extra';
  const tabs = [...usedSlots.map(s => [s.id, s.name]), ['extra', 'Ekstra']]
    .map(([id, name]) => `<button type="button" role="tab" class="mybil-tab ${id === slot ? 'is-active' : ''}" data-mybil-slot="${id}" aria-selected="${id === slot}">${escape(name)}</button>`).join('');
  const price = n => `${boosterIcon(14)} ${fmt(n)}`;
  let panel;
  if (slot === 'extra') {
    const extra = id => {
      const e = EXTRAS[id], has = owns(garage, `extra-${id}`), on = id === 'neon' ? style.neonOn : style.lowered, trying = tryOn?.extra === id;
      const disabled = id === 'lower' && !active.split;
      return `<button type="button" class="mybil-item mybil-extra ${on ? 'is-on' : ''} ${trying ? 'is-trying' : ''}" data-mybil-extra="${id}" aria-pressed="${on || trying}" ${disabled ? 'disabled' : ''}><span class="mybil-item-name">${escape(e.name)}</span><small>${has ? (on ? 'Slået til' : 'Slået fra') : trying ? 'Prøver nu' : price(e.price)}</small></button>`;
    };
    panel = `<div class="mybil-grid">${extra('neon')}${extra('lower')}</div>${owns(garage, 'extra-neon') ? `<h3 class="mybil-subtitle">Neonfarve</h3>${colorPicker('neon', style.neon)}` : ''}`;
  } else {
    const stockOn = !equipped[slot];
    const stock = `<button type="button" class="mybil-item mybil-stock ${stockOn ? 'is-on' : ''}" data-mybil-unequip="${slot}" aria-pressed="${stockOn}"><span class="mybil-thumb"><img src="${baseSrc(garage.active)}" alt="" loading="lazy"></span><span class="mybil-item-name">${slot === 'restore' ? 'Som den er' : 'Standard'}</span><small>${stockOn ? 'Valgt' : 'Tag af'}</small></button>`;
    const items = stock + available.filter(p => p.slot === slot).map(part => {
      const has = owns(garage, part.id), on = equipped[part.slot] === part.id, trying = tryOn?.part === part.id;
      const thumb = part.tint ? `<span class="mybil-tint" style="--src:url('${partSrc(garage.active, part.id)}');background:${style[part.tint]}"></span><img class="mybil-shade" src="${partSrc(garage.active, part.id)}" alt="" loading="lazy">` : `<img src="${partSrc(garage.active, part.id)}" alt="" loading="lazy">`;
      return `<button type="button" class="mybil-item ${on ? 'is-on' : ''} ${trying ? 'is-trying' : ''} ${!has && coins < part.price ? 'is-short' : ''}" data-mybil-part="${part.id}" aria-pressed="${on || trying}"><span class="mybil-thumb"><img src="${baseSrc(garage.active)}" alt="" loading="lazy">${thumb}</span><span class="mybil-item-name">${escape(part.name)}</span><small>${on ? 'Monteret · tag af' : has ? 'Montér' : trying ? 'Prøver nu' : price(part.price)}</small></button>`;
    }).join('');
    const tintKind = available.find(p => p.slot === slot && p.tint)?.tint;
    const tintOwned = tintKind && available.some(p => p.slot === slot && p.tint && owns(garage, p.id));
    const plateOwned = slot === 'plate' && owns(garage, 'plate-blank');
    panel = `<div class="mybil-grid">${items}</div>`
      + (tintOwned ? `<h3 class="mybil-subtitle">Vælg farve</h3>${colorPicker(tintKind, style[tintKind])}` : '')
      + (plateOwned ? `<label class="mybil-plate-input"><span>Din tekst (op til 7 tegn)</span><input type="text" maxlength="7" value="${escape(style.plate)}" data-mybil-plate autocomplete="off" spellcheck="false"></label>` : '');
  }
  const bases = BASES.map(base => {
    const owned = garage.bases.includes(base.id);
    return `<button type="button" class="mybil-base ${base.id === garage.active ? 'is-active' : ''} ${owned ? '' : 'is-locked'}" data-mybil-base="${base.id}" aria-pressed="${base.id === garage.active}"><img src="${baseSrc(base.id)}" alt="" loading="lazy"><span>${escape(base.name)}</span><small>${owned ? (base.id === garage.active ? 'Valgt' : 'Vælg') : price(base.price)}</small></button>`;
  }).join('');
  return `<section class="mybil" aria-labelledby="mybil-title">
    <header class="mybil-head"><img class="mybil-head-tyre" src="assets/road/tyre.webp" alt="" decoding="async"><div><span class="eyebrow">MIN BIL</span><h1 id="mybil-title">${escape(active.name)}</h1></div><div class="booster-chip booster-chip--big">${boosterCount(coins)}</div></header>
    <button type="button" class="mybil-stage" data-mybil-rev data-base="${escape(garage.active)}" aria-label="${escape(active.name)} med dine valg. Tryk for at give gas"><span class="mybil-floor" aria-hidden="true"></span>${vehicleLayers(withTryOn(garage, tryOn))}<span class="mybil-sheen" aria-hidden="true" style="--src:url('${baseSrc(garage.active)}')"></span></button>
    ${installedRow(garage, equipped, style, active)}
    ${tryBar(garage, coins, tryOn)}
    ${shuffleButton(garage, coins)}
    <p class="mybil-message" role="status">${escape(message)}</p>
    <div class="mybil-tabs" role="tablist" aria-label="Tuning">${tabs}</div>
    ${panel}
    <h2 class="mybil-subtitle">Dine køretøjer</h2>
    <div class="mybil-bases">${bases}</div>
    <p class="mybil-earn">Boosters tjenes kun ved at lære: ${fmt(BOOSTER_RATES.lesson)} pr. lektion, ${fmt(BOOSTER_RATES.dailyGoal)} for dagens mål og ${fmt(BOOSTER_RATES.examPass)} for en bestået øveprøve.</p>
  </section>`;
}

/** Home loop: your own tuned vehicle out on a sunny road, scenery scrolling past in parallax. */
/** Where each vehicle's lamps sit, as fractions of its square layer canvas (measured on base.webp). */
const LAMPS = {
  scooter: { head: [[0.717, 0.319]], tail: [0.121, 0.473] },
  smallcar: { head: [[0.695, 0.604], [0.893, 0.586]], tail: [0.107, 0.54] },
  bigcar: { head: [[0.674, 0.58], [0.906, 0.58]], tail: [0.113, 0.528] },
  racecar: { head: [[0.698, 0.578], [0.852, 0.556]], tail: [0.151, 0.515] },
};
function roadLamps(garage, base) {
  const L = LAMPS[base.id]; if (!L) return '';
  const drop = styleOf(garage).lowered && base.split ? 2.2 : 0;
  const at = ([x, y], cls) => `<i class="${cls}" style="left:${(x * 100).toFixed(1)}%;top:${(y * 100 + drop).toFixed(1)}%"></i>`;
  return `<span class="road-lamps">${L.head.map(h => at(h, 'rl-beam')).join('')}${L.head.map(h => at(h, 'rl-head')).join('')}${at(L.tail, 'rl-tail')}</span>`;
}

/** Home loop: your own vehicle on a sunny road. Scrolling down turns day into night (see motion.js). */
export function renderRoadLoop(garage, progress) {
  const base = baseById(garage.active);
  if (!base) return '';
  return `<a class="road-loop" href="#minbil" aria-label="${escape(base.name)}. Åbn Min bil">`
    + '<span class="road-dusk" aria-hidden="true"></span><span class="road-night" aria-hidden="true"></span><span class="road-stars" aria-hidden="true"></span>'
    + '<span class="road-sun" aria-hidden="true"></span><span class="road-moon" aria-hidden="true"></span><span class="road-clouds" aria-hidden="true"></span>'
    + '<span class="road-hills road-hills--far" aria-hidden="true"></span><span class="road-hills road-hills--near" aria-hidden="true"></span>'
    + '<span class="road-trees" aria-hidden="true"></span><span class="road-asphalt" aria-hidden="true"><span class="road-dashes"></span></span>'
    + `<span class="road-car" aria-hidden="true">${vehicleLayers(garage)}${roadLamps(garage, base)}</span><span class="road-speed" aria-hidden="true"></span>`
    + `<span class="road-label"><small>DIN BIL</small><strong>${escape(base.name)}</strong><span class="booster-chip-mini">${boosterCount(balance(progress, garage))}</span></span></a>`;
}

/** Under the stage while you try something on: what it is, and buy it or put it back. */
function tryBar(garage, coins, tryOn) {
  if (!tryOn || tryOn.base !== garage.active) return '';
  const item = tryOn.extra ? EXTRAS[tryOn.extra] : partById(tryOn.part);
  if (!item) return '';
  const short = coins < item.price, attr = tryOn.extra ? `data-mybil-buy-extra="${tryOn.extra}"` : `data-mybil-buy="${item.id}"`;
  return `<div class="mybil-try" role="group" aria-label="Prøv før du køber"><span class="mybil-try-text"><small>Prøver</small><strong>${escape(item.name)}</strong></span><button type="button" class="mybil-try-buy" ${attr} ${short ? 'disabled' : ''}>${short ? `Mangler ${boosterIcon(16)} ${fmt(item.price - coins)}` : `Køb ${boosterIcon(16)} ${fmt(item.price)}`}</button><button type="button" class="mybil-try-off" data-mybil-try-off aria-label="Fjern det, du prøver">${ico('x')}</button></div>`;
}
/** "Bland min bil": dice in an ink coin. Locked it shows its price; once bought it rolls a new look. */
function shuffleButton(garage, coins) {
  const dice = '<span class="mybil-dream-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><circle class="s" cx="9" cy="9" r="1.6"/><circle class="s" cx="15" cy="15" r="1.6"/><circle class="s" cx="15" cy="9" r="1.6"/><circle class="s" cx="9" cy="15" r="1.6"/><circle class="s" cx="12" cy="12" r="1.6"/></svg></span>';
  if (ownsShuffle(garage)) return `<button type="button" class="mybil-dream" data-mybil-shuffle>${dice}${escape(SHUFFLE.name)}</button>`;
  return `<button type="button" class="mybil-dream is-locked" data-mybil-shuffle-buy ${coins < SHUFFLE.price ? 'disabled' : ''}>${dice}<span>Lås op: ${escape(SHUFFLE.name)}<small>${boosterIcon(14)} ${fmt(SHUFFLE.price)} · bland det, du har låst op</small></span></button>`;
}

function installedRow(garage, equipped, style, base) {
  const chips = SLOTS.filter(s => equipped[s.id] && partById(equipped[s.id])).map(s => {
    const name = partById(equipped[s.id]).name;
    return `<button type="button" class="on-chip" data-mybil-unequip="${s.id}" aria-label="Tag ${escape(name)} af">${escape(name)}<i aria-hidden="true">${ico('x')}</i></button>`;
  });
  if (style.neonOn && owns(garage, 'extra-neon')) chips.push('<button type="button" class="on-chip" data-mybil-extra="neon" aria-label="Sluk neon">Neon<i aria-hidden="true">' + ico('x') + '</i></button>');
  if (style.lowered && base?.split && owns(garage, 'extra-lower')) chips.push('<button type="button" class="on-chip" data-mybil-extra="lower" aria-label="Hæv køretøjet igen">Sænket<i aria-hidden="true">' + ico('x') + '</i></button>');
  return `<div class="mybil-on" role="group" aria-label="Monteret nu"><span class="mybil-on-label">Monteret nu</span>${chips.length ? chips.join('') + '<button type="button" class="on-clear" data-mybil-unequip-all>Fjern al tuning</button>' : '<span class="mybil-on-empty">Ingen tuning endnu</span>'}</div>`;
}
