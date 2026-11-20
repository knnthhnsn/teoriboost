// Premium is read from the authenticated server, never from progress or browser storage.
export const EMPTY_ENTITLEMENT = Object.freeze({ premium: false, expiresAt: null, grants: [] });

export function gatesEnabled(config) {
  return config?.schemaVersion === 1 && config.enabled === true &&
    config.free?.confirmed === true && config.price?.confirmed === true &&
    config.pass?.confirmed === true && config.pass.autoRenew === false;
}

export function hasPremium(entitlement, now = Date.now()) {
  return entitlement?.premium === true && (entitlement.expiresAt === null ||
    (typeof entitlement.expiresAt === 'string' && Date.parse(entitlement.expiresAt) > now));
}

export async function loadPremiumConfig(fetcher = globalThis.fetch) {
  const response = await fetcher('./premium-config.json', { cache: 'no-store', credentials: 'same-origin' });
  if (!response.ok) throw new Error('Vi kunne ikke hente din adgang lige nu. Prøv igen om lidt.');
  const config = await response.json();
  if (config.schemaVersion !== 1 || !Array.isArray(config.plans) || !config.free) {
    throw new Error('Vi kunne ikke hente din adgang lige nu. Prøv igen om lidt.');
  }
  return config;
}

export function createEntitlementClient({ account, fetcher = globalThis.fetch, now = () => Date.now() }) {
  let entitlement = EMPTY_ENTITLEMENT, uid = null, identityUid = null, context = null, generation = 0, pending = null, disposed = false;
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => fn(view()));
  const activeUser = () => context?.fb.getAuth().currentUser;
  const view = () => {
    const user = activeUser();
    const matches = account.status().state === 'user' && user && !user.isAnonymous && uid === user.uid;
    return { uid: account.status().state === 'user' && user && !user.isAnonymous ? user.uid : null,
      entitlement: matches ? entitlement : EMPTY_ENTITLEMENT, premium: !!matches && hasPremium(entitlement, now()) };
  };

  async function identity() {
    if (account.status().state !== 'user') throw Object.assign(new Error('Log ind, før du køber eller bruger en kode.'), { code: 'LOGIN_REQUIRED' });
    const nextContext = await account.firestore();
    const user = nextContext?.fb.getAuth().currentUser;
    if (!user || user.isAnonymous || nextContext.uid !== user.uid || account.status().state !== 'user') throw Object.assign(new Error('Log ind igen for at fortsætte.'), { code: 'LOGIN_REQUIRED' });
    context = nextContext;
    if (identityUid !== user.uid) {
      identityUid = user.uid; uid = null; generation++; entitlement = EMPTY_ENTITLEMENT; emit();
    }
    return { uid: user.uid, token: await user.getIdToken() };
  }

  async function request(path, body) {
    const who = await identity(), started = generation;
    const response = await fetcher(path, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin', cache: 'no-store',
      headers: { Authorization: 'Bearer ' + who.token, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.error?.message || 'Det kunne ikke gennemføres. Prøv igen om lidt.'), { code: data.error?.code || 'REQUEST_FAILED' });
    const current = await identity();
    if (disposed || started !== generation || current.uid !== who.uid) throw new Error('Din konto blev ændret. Prøv igen.');
    if (data.entitlement) {
      uid = who.uid;
      entitlement = { ...EMPTY_ENTITLEMENT, ...data.entitlement };
      emit();
    }
    return data;
  }

  async function refresh() {
    if (account.status().state !== 'user') { uid = null; identityUid = null; generation++; entitlement = EMPTY_ENTITLEMENT; emit(); return view(); }
    try { await identity(); } catch { uid = null; entitlement = EMPTY_ENTITLEMENT; emit(); return view(); }
    const started = generation;
    if (pending?.generation === started) return pending.promise;
    const promise = (async () => {
      try { await request('/api/billing/entitlement'); }
      catch { if (started === generation) { entitlement = EMPTY_ENTITLEMENT; emit(); } }
      return view();
    })();
    pending = { generation: started, promise };
    try { return await promise; } finally { if (pending?.promise === promise) pending = null; }
  }

  let lastState = account.status().state;
  const unsubscribe = account.subscribe(status => {
    if (status.state !== lastState) {
      lastState = status.state; generation++; pending = null; uid = null; identityUid = null; entitlement = EMPTY_ENTITLEMENT; emit();
    }
    if (status.state === 'user') void refresh();
  });
  return {
    view, refresh,
    redeem: code => request('/api/promo', { code: String(code || '').trim() }),
    restore: () => request('/api/billing/restore', {}),
    checkout: (planId, consent) => request('/api/billing/checkout', { planId, ...consent }),
    // BILLING HOOK: only session IDs travel through this page; secrets stay in memory.
    resume: sessionId => request('/api/billing/resume', { sessionId }),
    cancel: sessionId => request('/api/billing/cancel', { sessionId }),
    referralProfile: () => request('/api/referral/profile'),
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    dispose() { disposed = true; generation++; unsubscribe(); listeners.clear(); entitlement = EMPTY_ENTITLEMENT; uid = null; identityUid = null; context = null; }
  };
}

export function copenhagenDay(time = Date.now()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Copenhagen', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(time));
}

// Anonymous practice is a device quota, not a fraud-resistant server limit.
// No premium flag or promotional code is ever stored here.
export function createPracticeQuota({ storage = globalThis.localStorage, now = () => Date.now(), owner = () => 'device' } = {}) {
  const memory = new Map();
  const key = () => 'teoriboost.practiceQuota.v1.' + owner();
  function read() {
    let data;
    try { data = JSON.parse(storage.getItem(key()) || 'null'); } catch {}
    data ||= memory.get(key());
    const day = copenhagenDay(now());
    return data?.day === day && Array.isArray(data.attempts) ? data : { day, attempts: [] };
  }
  return {
    used: () => read().attempts.length,
    allows(limit, attempt) { const data = read(); return data.attempts.includes(attempt) || data.attempts.length < limit; },
    record(attempt) {
      const data = read();
      if (!data.attempts.includes(attempt)) data.attempts.push(attempt);
      memory.set(key(), data);
      try { storage.setItem(key(), JSON.stringify(data)); } catch {}
    }
  };
}

// The free full practice exams (config.free.fullExams), counted per owner for good, not per day.
// Like the practice quota this is a device convenience, not a fraud-resistant limit: the questions ship to the browser anyway.
export function createExamQuota({ storage = globalThis.localStorage, owner = () => 'device' } = {}) {
  const memory = new Map();
  const key = () => 'teoriboost.freeExams.v1.' + owner();
  function read() {
    let ids;
    try { ids = JSON.parse(storage.getItem(key()) || 'null'); } catch {}
    ids ||= memory.get(key());
    return Array.isArray(ids) ? ids.filter(id => typeof id === 'string').slice(0, 20) : [];
  }
  return {
    used: () => read().length,
    // An exam already counted may always be resumed and its result opened.
    allows(limit, id = '') { const ids = read(); return (!!id && ids.includes(id)) || ids.length < limit; },
    record(id) {
      const ids = read();
      if (!id || ids.includes(id)) return;
      ids.push(id); memory.set(key(), ids);
      try { storage.setItem(key(), JSON.stringify(ids)); } catch {}
    }
  };
}

export function contentAccess(config, premium, kind, value) {
  if (!gatesEnabled(config) || premium) return true;
  if (kind === 'chapter') return config.free.learnChapters.includes(Number(value));
  if (kind === 'game') return config.free.gameLevels.includes(Number(value));
  return false;
}
