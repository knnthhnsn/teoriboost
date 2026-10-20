/**
 * "Min bil": personal vehicle customisation paid with Boosters.
 * Boosters are earned only by learning and are derived from the progress the app already stores
 * (journey events and exam history), so they cannot be farmed or bought. Only spending is stored here.
 * A vehicle is a base image plus transparent part layers on one shared canvas (generated with Codex, see
 * docs/redesign/garage-v5). Paint, stripes and window tint are white masks the app colours freely.
 */
import { SLOTS, PARTS, BASES } from './mybil-catalog.js';

export { SLOTS, PARTS, BASES };
export const BOOSTER_RATES = Object.freeze({ lesson: 1000, dailyGoal: 1500, examPass: 5000 });
// Extras that are not image parts: unlocked once per vehicle, then free to change.
export const EXTRAS = Object.freeze({ neon: { name: 'Neon under bilen', price: 4000 }, lower: { name: 'Sænkning', price: 5000 } });
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
  return `<svg class="booster-icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="#D5FF62" stroke="#1F2328" stroke-width="2"/><path d="M13.5 4.5 7.5 13h4l-1 6.5 6-8.5h-4z" fill="#1F2328"/></svg>`;
}
export function boosterCount(amount) {
  return `${boosterIcon()}<b>${fmt(amount)}</b><span class="sr-only"> Boosters</span>`;
}

/** Layers of the active vehicle, in stacking order. Masks are tinted: a coloured shape plus the grey shading multiplied on top. */
export function vehicleLayers(garage, baseId = garage.active) {
  const base = baseById(baseId);
  const style = { ...styleOf(garage), ...(garage.style?.[baseId] || {}) };
  const equipped = garage.equipped?.[baseId] || {};
  const lowered = style.lowered && base?.split;
  const img = (src, z) => `<img src="${escape(src)}" alt="" style="z-index:${z}">`;
  const tinted = (src, z, color, cls = '') => `<span class="mybil-tint ${cls}" style="z-index:${z};--src:url('${escape(src)}');background:${escape(color)}"></span><img class="mybil-shade ${cls}" src="${escape(src)}" alt="" style="z-index:${z}">`;
  const body = [img(lowered ? `${ROOT}${baseId}/body.webp` : baseSrc(baseId), 0)];
  const wheels = [];
  for (const slot of SLOTS) {
    const id = equipped[slot.id]; const part = id && partById(id);
    if (!part || !(base?.parts || []).includes(id)) continue;
    const src = partSrc(baseId, id);
    const html = part.tint ? tinted(src, slot.z, style[part.tint], part.tint === 'windows' ? 'is-glass' : '') : img(src, slot.z);
    (slot.id === 'wheels' ? wheels : body).push(html);
  }
  if (lowered && !equipped.wheels) wheels.push(img(`${ROOT}${baseId}/wheels.webp`, 14));
  const [x0, , x1, y1] = base?.bbox || [0.1, 0, 0.9, 0.85];
  const neon = style.neonOn ? `<span class="mybil-neon" style="left:${x0 * 100 + 6}%;right:${(1 - x1) * 100 + 6}%;top:${y1 * 100 - 5}%;background:${escape(style.neon)}"></span>` : '';
  const p = base?.plate; const showPlate = p && equipped.plate === 'plate-blank' && style.plate;
  const plate = showPlate ? `<span class="mybil-plate" style="left:${p[0] * 100}%;top:${p[1] * 100}%;width:${(p[2] - p[0]) * 100}%;height:${(p[3] - p[1]) * 100}%;z-index:30;--n:${Math.max(3, [...style.plate].length)}"><b>${escape(style.plate)}</b></span>` : '';
  return `${neon}<div class="mybil-body${lowered ? ' is-lowered' : ''}">${body.join('')}${plate}</div>${wheels.join('')}`;
}

function colorPicker(kind, value) {
  return `<div class="mybil-colors" role="group" aria-label="Vælg farve">${COLOR_PRESETS.map(c => `<button type="button" class="mybil-swatch${c === value ? ' is-on' : ''}" style="background:${c}" data-mybil-color="${kind}" data-value="${c}" aria-label="Farve ${c}" aria-pressed="${c === value}"></button>`).join('')}<label class="mybil-custom"><input type="color" value="${escape(value)}" data-mybil-color-input="${kind}" aria-label="Vælg din egen farve"><span>Egen farve</span></label></div>`;
}

export function renderMyCar({ garage, progress, slot = 'paint', message = '' }) {
  const coins = balance(progress, garage);
  const active = baseById(garage.active);
  const equipped = garage.equipped?.[garage.active] || {};
  const style = styleOf(garage);
  const available = partsFor(garage.active);
  const usedSlots = SLOTS.filter(s => available.some(p => p.slot === s.id));
  const tabs = [...usedSlots.map(s => [s.id, s.name]), ['extra', 'Ekstra']]
    .map(([id, name]) => `<button type="button" role="tab" class="mybil-tab ${id === slot ? 'is-active' : ''}" data-mybil-slot="${id}" aria-selected="${id === slot}">${escape(name)}</button>`).join('');
  const price = n => `${boosterIcon(14)} ${fmt(n)}`;
  let panel;
  if (slot === 'extra') {
    const extra = id => {
      const e = EXTRAS[id], has = owns(garage, `extra-${id}`), on = id === 'neon' ? style.neonOn : style.lowered;
      const disabled = id === 'lower' && !active.split;
      return `<button type="button" class="mybil-item mybil-extra ${on ? 'is-on' : ''}" data-mybil-extra="${id}" aria-pressed="${on}" ${disabled ? 'disabled' : ''}><span class="mybil-item-name">${escape(e.name)}</span><small>${has ? (on ? 'Slået til' : 'Slået fra') : price(e.price)}</small></button>`;
    };
    panel = `<div class="mybil-grid">${extra('neon')}${extra('lower')}</div>${owns(garage, 'extra-neon') ? `<h3 class="mybil-subtitle">Neonfarve</h3>${colorPicker('neon', style.neon)}` : ''}`;
  } else {
    const items = available.filter(p => p.slot === slot).map(part => {
      const has = owns(garage, part.id), on = equipped[part.slot] === part.id;
      const thumb = part.tint ? `<span class="mybil-tint" style="--src:url('${partSrc(garage.active, part.id)}');background:${style[part.tint]}"></span><img class="mybil-shade" src="${partSrc(garage.active, part.id)}" alt="" loading="lazy">` : `<img src="${partSrc(garage.active, part.id)}" alt="" loading="lazy">`;
      return `<button type="button" class="mybil-item ${on ? 'is-on' : ''} ${!has && coins < part.price ? 'is-short' : ''}" data-mybil-part="${part.id}" aria-pressed="${on}"><span class="mybil-thumb"><img src="${baseSrc(garage.active)}" alt="" loading="lazy">${thumb}</span><span class="mybil-item-name">${escape(part.name)}</span><small>${on ? 'Monteret' : has ? 'Montér' : price(part.price)}</small></button>`;
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
    <header class="mybil-head"><div><span class="eyebrow">MIN BIL</span><h1 id="mybil-title">${escape(active.name)}</h1></div><div class="booster-chip booster-chip--big">${boosterCount(coins)}</div></header>
    <div class="mybil-stage" role="img" aria-label="${escape(active.name)} med dine valg">${vehicleLayers(garage)}</div>
    <p class="mybil-message" role="status">${escape(message)}</p>
    <div class="mybil-tabs" role="tablist" aria-label="Tuning">${tabs}</div>
    ${panel}
    <h2 class="mybil-subtitle">Dine køretøjer</h2>
    <div class="mybil-bases">${bases}</div>
    <p class="mybil-earn">Boosters tjenes kun ved at lære: ${fmt(BOOSTER_RATES.lesson)} pr. lektion, ${fmt(BOOSTER_RATES.dailyGoal)} for dagens mål og ${fmt(BOOSTER_RATES.examPass)} for en bestået øveprøve.</p>
  </section>`;
}
