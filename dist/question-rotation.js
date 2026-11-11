// Keeps practice from turning into recognition: learners in the target group remembered the picture and
// the position of each answer instead of the rule. So the next question from a rule is the one seen longest
// ago, and the four statements change order every time one is shown.
// "Seen" has its own key because restoreState drops unknown fields from the learning profile.
export const SEEN_KEY = 'teoriboost.seen.v1';
const defaultStorage = () => { try { return globalThis.localStorage; } catch { return null; } };

export function readSeen(storage = defaultStorage()) {
  try {
    const parsed = JSON.parse(storage.getItem(SEEN_KEY) || 'null');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
}

export function markSeen(ids, { storage = defaultStorage(), now = Date.now() } = {}) {
  try {
    const seen = readSeen(storage);
    for (const id of [].concat(ids)) seen[id] = now;
    storage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch { /* the question still works when the browser refuses to store this */ }
}

// The question seen longest ago; never-seen ones come first, and ties are random.
export function pickFresh(candidates, seen = {}, random = Math.random) {
  let oldest = Infinity, best = [];
  for (const question of candidates) {
    const at = Number(seen[question.id]) || 0;
    if (at < oldest) { oldest = at; best = [question]; }
    else if (at === oldest) best.push(question);
  }
  return best.length ? best[Math.floor(random() * best.length)] : null;
}

// The order the four statements are shown in. The same seed always gives the same order, so a redraw or a
// resumed exam keeps its rows in place. Answers stay stored by the statement's own index.
export function statementOrder(seed) {
  let hash = 2166136261;
  for (const char of String(seed)) hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
  const next = () => {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822519);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489917);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 4294967296;
  };
  const order = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return order;
}
