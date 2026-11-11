// Merging a learner's progress from two places (this device and their account) without losing any of it.
// The learning profile has its own merge in app.js (mergeState); these cover the smaller stores.

const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const union = (a, b) => [...new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])])];

/** Intro: a finished intro wins over an unfinished one; otherwise this device's choices win. */
export function mergeIntro(remote, local) {
  const r = obj(remote), l = obj(local);
  if (r.done && !l.done) return { ...l, ...r };
  return { ...r, ...l };
}

/** Min bil: keep every part ever bought and the highest spend; the look comes from whichever garage has been used. */
export function mergeGarage(remote, local) {
  const r = obj(remote), l = obj(local);
  const used = g => (Number(g.spent) || 0) > 0 || (Array.isArray(g.owned) && g.owned.length > 0);
  const look = used(l) || !used(r) ? l : r;
  return {
    ...r, ...l,
    spent: Math.max(Number(r.spent) || 0, Number(l.spent) || 0),
    earnedSeen: Math.max(Number(r.earnedSeen) || 0, Number(l.earnedSeen) || 0),
    bonus: Math.max(Number(r.bonus) || 0, Number(l.bonus) || 0),
    ...(Number.isFinite(r.boostBase) || Number.isFinite(l.boostBase) ? { boostBase: Math.max(Number(r.boostBase) || 0, Number(l.boostBase) || 0) } : {}),
    owned: union(r.owned, l.owned),
    bases: union(r.bases, l.bases),
    active: look.active ?? r.active ?? l.active,
    equipped: obj(look.equipped),
    style: obj(look.style),
  };
}

/** Ordering exercises: done anywhere counts as done; keep the latest time. */
export function mergeOrder(remote, local) {
  const r = obj(remote), l = obj(local), out = {};
  for (const id of new Set([...Object.keys(r), ...Object.keys(l)])) {
    const a = obj(r[id]), b = obj(l[id]);
    out[id] = { done: !!(a.done || b.done), at: Math.max(Number(a.at) || 0, Number(b.at) || 0) };
  }
  return out;
}

export const SYNC_KEYS = ['learning', 'intro', 'mybil', 'order'];
const LIMITS = { learning: 700000, intro: 20000, mybil: 50000, order: 20000 }; // same as firebase/firestore.rules

/** Values -> the Firestore document's string fields (JSON keeps nested arrays, which Firestore can't store). */
export function packProgress(values) {
  const out = {};
  for (const k of SYNC_KEYS) {
    if (values?.[k] == null) continue;
    const s = JSON.stringify(values[k]);
    if (s.length <= LIMITS[k]) out[k] = s;
  }
  return out;
}
export function unpackProgress(data) {
  const out = {};
  for (const k of SYNC_KEYS) {
    if (typeof data?.[k] !== 'string') continue;
    try { out[k] = JSON.parse(data[k]); } catch { /* a broken field is skipped, the rest still syncs */ }
  }
  return out;
}
