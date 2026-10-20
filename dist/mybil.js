/**
 * "Min bil": personal vehicle customisation paid with Boosters.
 * Boosters are earned only by learning and are derived from the progress the app already stores
 * (journey events and exam history), so they cannot be farmed or bought. Only spending is stored here.
 * Vehicles are a base image plus transparent part layers on the same canvas (generated with Codex,
 * see docs/redesign/garage-build).
 */
export const BOOSTER_RATES = Object.freeze({ lesson: 1000, dailyGoal: 1500, examPass: 5000 });
const STORE_KEY = 'teoriboost.mybil.v1';
const ROOT = 'assets/mybil/';

export const BASES = Object.freeze([
  { id: 'scooter', name: 'Ødelagt scooter', price: 0 },
  { id: 'smallcar', name: 'Slidt lille bil', price: 25000 },
  { id: 'bigcar', name: 'Stor slidt bil', price: 60000 },
  { id: 'racecar', name: 'Ødelagt racerbil', price: 120000 },
]);

// Slots stack in this order on top of the base.
export const SLOTS = Object.freeze([
  { id: 'paint', name: 'Lak', z: 1 },
  { id: 'decal', name: 'Dekor', z: 2 },
  { id: 'wheels', name: 'Fælge', z: 3 },
  { id: 'front', name: 'Front', z: 4 },
  { id: 'top', name: 'Top', z: 5 },
]);

export const PARTS = Object.freeze([
  { id: 'paint-mint', slot: 'paint', name: 'Mintgrøn', price: 6000 },
  { id: 'paint-pink', slot: 'paint', name: 'Pastelpink', price: 6000 },
  { id: 'paint-black', slot: 'paint', name: 'Mat sort', price: 8000 },
  { id: 'paint-red', slot: 'paint', name: 'Racerrød', price: 8000 },
  { id: 'decal-hearts', slot: 'decal', name: 'Hjerter', price: 2000 },
  { id: 'decal-flames', slot: 'decal', name: 'Flammer', price: 3000 },
  { id: 'decal-stripes', slot: 'decal', name: 'Racerstriber', price: 3000 },
  { id: 'wheels-pastel', slot: 'wheels', name: 'Pastelfælge', price: 4000 },
  { id: 'wheels-sport', slot: 'wheels', name: 'Sportsfælge', price: 5000 },
  { id: 'wheels-chrome', slot: 'wheels', name: 'Kromfælge', price: 7000 },
  { id: 'front-lashes', slot: 'front', name: 'Vipper', price: 2500 },
  { id: 'front-led', slot: 'front', name: 'LED-bryn', price: 3500 },
  { id: 'top-bow', slot: 'top', name: 'Sløjfe', price: 2500 },
  { id: 'top-spoiler', slot: 'top', name: 'Spoiler', price: 5000 },
]);

const partById = id => PARTS.find(part => part.id === id);
const baseById = id => BASES.find(base => base.id === id);
export const partSrc = (baseId, partId) => `${ROOT}${baseId}/${partId}.webp`;
export const baseSrc = baseId => `${ROOT}${baseId}/base.webp`;

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
  return { spent: 0, earnedSeen: 0, owned: [], bases: ['scooter'], active: 'scooter', equipped: {} };
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
  if (!part) return { garage, ok: false, message: 'Ukendt del.' };
  const key = `${garage.active}:${partId}`;
  const slotKey = `${garage.active}`;
  const equipped = { ...garage.equipped, [slotKey]: { ...(garage.equipped[slotKey] || {}) } };
  if (garage.owned.includes(key)) {
    const current = equipped[slotKey][part.slot];
    if (current === partId) delete equipped[slotKey][part.slot]; else equipped[slotKey][part.slot] = partId;
    return { garage: { ...garage, equipped }, ok: true, message: current === partId ? `${part.name} er taget af.` : `${part.name} er monteret.` };
  }
  if (balance(progress, garage) < part.price) return { garage, ok: false, message: 'Du har ikke Boosters nok endnu.' };
  equipped[slotKey][part.slot] = partId;
  return { garage: { ...garage, spent: garage.spent + part.price, owned: [...garage.owned, key], equipped }, ok: true, message: `${part.name} er købt og monteret.` };
}

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => new Intl.NumberFormat('da-DK').format(n);

/** The Booster icon: a lime coin with a bolt. Only the icon and the count are ever shown. */
export function boosterIcon(size = 20) {
  return `<svg class="booster-icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="#D5FF62" stroke="#1F2328" stroke-width="2"/><path d="M13.5 4.5 7.5 13h4l-1 6.5 6-8.5h-4z" fill="#1F2328"/></svg>`;
}
export function boosterCount(amount) {
  return `${boosterIcon()}<b>${fmt(amount)}</b><span class="sr-only"> Boosters</span>`;
}

export function vehicleLayers(garage, baseId = garage.active) {
  const equipped = garage.equipped?.[baseId] || {};
  const parts = SLOTS.map(slot => equipped[slot.id]).filter(Boolean);
  return [`<img src="${baseSrc(baseId)}" alt="" style="z-index:0">`,
    ...parts.map(id => `<img src="${partSrc(baseId, id)}" alt="" style="z-index:${SLOTS.find(s => s.id === partById(id).slot).z}">`)].join('');
}

export function renderMyCar({ garage, progress, slot = 'paint', message = '' }) {
  const coins = balance(progress, garage);
  const active = baseById(garage.active);
  const equipped = garage.equipped?.[garage.active] || {};
  const bases = BASES.map(base => {
    const owned = garage.bases.includes(base.id);
    const label = owned ? (base.id === garage.active ? 'Valgt' : 'Vælg') : `${boosterIcon(16)} ${fmt(base.price)}`;
    return `<button type="button" class="mybil-base ${base.id === garage.active ? 'is-active' : ''} ${owned ? '' : 'is-locked'}" data-mybil-base="${base.id}" aria-pressed="${base.id === garage.active}"><img src="${baseSrc(base.id)}" alt="" loading="lazy"><span>${escape(base.name)}</span><small>${label}</small></button>`;
  }).join('');
  const tabs = SLOTS.map(s => `<button type="button" role="tab" class="mybil-tab ${s.id === slot ? 'is-active' : ''}" data-mybil-slot="${s.id}" aria-selected="${s.id === slot}">${escape(s.name)}</button>`).join('');
  const items = PARTS.filter(p => p.slot === slot).map(part => {
    const owned = garage.owned.includes(`${garage.active}:${part.id}`);
    const on = equipped[part.slot] === part.id;
    const affordable = coins >= part.price;
    const label = on ? 'Monteret' : owned ? 'Montér' : `${boosterIcon(16)} ${fmt(part.price)}`;
    return `<button type="button" class="mybil-item ${on ? 'is-on' : ''} ${!owned && !affordable ? 'is-short' : ''}" data-mybil-part="${part.id}" aria-pressed="${on}"><span class="mybil-thumb"><img src="${baseSrc(garage.active)}" alt="" loading="lazy"><img src="${partSrc(garage.active, part.id)}" alt="" loading="lazy"></span><span class="mybil-item-name">${escape(part.name)}</span><small>${label}</small></button>`;
  }).join('');
  return `<section class="mybil" aria-labelledby="mybil-title">
    <header class="mybil-head"><div><span class="eyebrow">MIN BIL</span><h1 id="mybil-title">${escape(active.name)}</h1></div><div class="booster-chip booster-chip--big">${boosterCount(coins)}</div></header>
    <div class="mybil-stage" role="img" aria-label="${escape(active.name)} med dine dele">${vehicleLayers(garage)}</div>
    ${message ? `<p class="mybil-message" role="status">${escape(message)}</p>` : '<p class="mybil-message" role="status"></p>'}
    <div class="mybil-tabs" role="tablist" aria-label="Dele">${tabs}</div>
    <div class="mybil-grid">${items}</div>
    <h2 class="mybil-subtitle">Dine køretøjer</h2>
    <div class="mybil-bases">${bases}</div>
    <p class="mybil-earn">Boosters tjenes kun ved at lære: ${fmt(BOOSTER_RATES.lesson)} pr. lektion, ${fmt(BOOSTER_RATES.dailyGoal)} for dagens mål og ${fmt(BOOSTER_RATES.examPass)} for en bestået øveprøve.</p>
  </section>`;
}
