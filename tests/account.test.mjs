import test from 'node:test';
import assert from 'node:assert/strict';
import { createAccount } from '../dist/account.js';
import { mergeIntro, mergeGarage, mergeOrder, packProgress, unpackProgress } from '../dist/cloud-merge.js';

/* ---------- a small stand-in for the Firebase SDK ---------- */
function fakeFirebase({ docs = new Map(), existing = {} } = {}) {
  const calls = [];
  let listener = null, n = 0;
  const auth = { currentUser: null, languageCode: '', authStateReady: async () => {} };
  const emit = () => listener?.(auth.currentUser);
  const user = (uid, email, provider) => ({ uid, email, isAnonymous: !provider, providerData: provider ? [{ providerId: provider }] : [] });
  const fb = {
    calls, docs, auth,
    initializeApp: cfg => ({ cfg }), getAuth: () => auth, getFirestore: () => ({}),
    onAuthStateChanged: (_, cb) => { listener = cb; cb(auth.currentUser); },
    signInAnonymously: async () => { auth.currentUser = user('anon' + ++n); calls.push('anon'); emit(); },
    GoogleAuthProvider: class {},
    signInWithPopup: async () => { auth.currentUser = existing.google || user('g1', 'elev@gmail.com', 'google.com'); calls.push('google'); emit(); },
    isSignInWithEmailLink: (_, href) => href.includes('oobCode='),
    sendSignInLinkToEmail: async (_, email, settings) => { calls.push(['send', email, settings]); },
    signInWithEmailLink: async (_, email, href) => { calls.push(['emaillink', email, href]); auth.currentUser = user('e1', email, 'password'); emit(); },
    signOut: async () => { calls.push('signout'); auth.currentUser = null; },
    deleteUser: async u => { calls.push(['deleteUser', u.uid]); },
    doc: (_, col, id) => `${col}/${id}`,
    getDoc: async path => ({ exists: () => docs.has(path), data: () => docs.get(path) }),
    setDoc: async (path, data) => { calls.push(['set', path]); docs.set(path, data); },
    deleteDoc: async path => { calls.push(['deleteDoc', path]); docs.delete(path); },
    serverTimestamp: () => 'TS',
  };
  return fb;
}
function memory(init = {}) { const m = new Map(Object.entries(init)); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m }; }
function fakeWindow(href = 'https://teoriboost.vercel.app/') {
  const u = new URL(href);
  const win = {
    reloaded: 0,
    location: { get href() { return u.href; }, origin: u.origin, get pathname() { return u.pathname; }, get hash() { return u.hash; }, set hash(h) { u.hash = h; }, reload() { win.reloaded++; } },
    history: { replaceState: (_, __, url) => { const n = new URL(url, u.origin); u.search = n.search; u.hash = n.hash; u.pathname = n.pathname; } },
    document: { visibilityState: 'visible', addEventListener() {} },
  };
  return win;
}
function device(local) {
  const store = { learning: { version: 1, xp: 0 }, intro: {}, mybil: {}, order: {}, ...local };
  return {
    store, merged: [], cleared: 0,
    read: () => store,
    merge(remote) { this.merged.push(remote); for (const k of Object.keys(remote)) store[k] = { ...remote[k], ...store[k], xp: Math.max(remote[k].xp || 0, store[k]?.xp || 0) }; },
    clear() { this.cleared++; for (const k of Object.keys(store)) store[k] = {}; },
  };
}
const flush = () => new Promise(r => setTimeout(r, 0));
const CONFIG = { apiKey: 'x', projectId: 'teoriboost' };

test('without a Firebase config nothing changes: login is off', async () => {
  let loaded = false;
  const acc = createAccount({ config: null, adapters: device(), load: async () => { loaded = true; } });
  await acc.init();
  assert.equal(acc.status().state, 'off'); assert.equal(loaded, false);
});

test('everyone starts anonymous, and anonymous progress never goes to the cloud', async () => {
  const fb = fakeFirebase(), acc = createAccount({ config: CONFIG, adapters: device(), load: async () => fb, storage: memory(), win: fakeWindow() });
  await acc.init(); await flush();
  assert.equal(acc.status().state, 'anon');
  assert.equal(fb.auth.languageCode, 'da');
  assert.ok(!fb.calls.some(c => Array.isArray(c) && c[0] === 'set'), 'no Firestore writes for an anonymous session');
});

test('Google login merges the account into this device, saves the result and removes the anonymous session', async () => {
  const docs = new Map([['users/g1', { v: 1, learning: JSON.stringify({ version: 1, xp: 300 }) }]]);
  const fb = fakeFirebase({ docs }), dev = device({ learning: { version: 1, xp: 120 } });
  const acc = createAccount({ config: CONFIG, adapters: dev, load: async () => fb, storage: memory(), win: fakeWindow() });
  await acc.init(); await flush();
  await acc.signInGoogle(); await flush(); await flush();
  const s = acc.status();
  assert.equal(s.state, 'user'); assert.equal(s.email, 'elev@gmail.com'); assert.equal(s.provider, 'Google');
  assert.deepEqual(dev.merged[0].learning, { version: 1, xp: 300 }, 'the account copy was merged in');
  assert.equal(dev.store.learning.xp, 300);
  const saved = docs.get('users/g1');
  assert.equal(saved.v, 1); assert.equal(saved.updatedAt, 'TS');
  assert.equal(JSON.parse(saved.learning).xp, 300, 'the merged result went back to the account');
  assert.ok(fb.calls.some(c => Array.isArray(c) && c[0] === 'deleteUser' && c[1].startsWith('anon')), 'the anonymous session is cleaned up');
  assert.ok(s.syncedAt);
});

test('saving only writes when something changed', async () => {
  const fb = fakeFirebase(), dev = device();
  const acc = createAccount({ config: CONFIG, adapters: dev, load: async () => fb, storage: memory(), win: fakeWindow() });
  await acc.init(); await acc.signInGoogle(); await flush(); await flush();
  const writes = () => fb.calls.filter(c => Array.isArray(c) && c[0] === 'set').length;
  const before = writes();
  await acc.syncNow(); assert.equal(writes(), before, 'unchanged: no write');
  dev.store.order = { kantsten: { done: true, at: 5 } };
  await acc.syncNow(); assert.equal(writes(), before + 1, 'changed: one write');
});

test('e-mail link: the address is remembered, and opening the link on the same device logs in', async () => {
  const storage = memory(), fb = fakeFirebase();
  const acc = createAccount({ config: CONFIG, adapters: device(), load: async () => fb, storage, win: fakeWindow() });
  await acc.init(); await flush();
  await acc.sendEmailLink(' elev@skole.dk ');
  const [, email, settings] = fb.calls.find(c => Array.isArray(c) && c[0] === 'send');
  assert.equal(email, 'elev@skole.dk'); assert.equal(settings.handleCodeInApp, true);
  assert.equal(settings.url, 'https://teoriboost.vercel.app/?konto=link');
  assert.equal(acc.status().ui, 'sent'); assert.equal(storage.getItem('teoriboost.emailForSignIn'), 'elev@skole.dk');

  // the learner clicks the link in the mail: the app opens with the one-time code in the address
  const fb2 = fakeFirebase(), win = fakeWindow('https://teoriboost.vercel.app/?konto=link&mode=signIn&oobCode=abc');
  const acc2 = createAccount({ config: CONFIG, adapters: device(), load: async () => fb2, storage, win });
  await acc2.init(); await flush(); await flush();
  assert.equal(acc2.status().state, 'user'); assert.equal(acc2.status().provider, 'e-mail');
  assert.ok(fb2.calls.some(c => Array.isArray(c) && c[0] === 'emaillink' && c[1] === 'elev@skole.dk'));
  assert.equal(storage.getItem('teoriboost.emailForSignIn'), null, 'the stored address is removed');
  assert.ok(!win.location.href.includes('oobCode'), 'the one-time code is removed from the address');
  assert.equal(win.location.hash, '#profil');
});

test('an e-mail link opened on another device asks for the address first', async () => {
  const fb = fakeFirebase(), win = fakeWindow('https://teoriboost.vercel.app/?konto=link&oobCode=abc');
  const acc = createAccount({ config: CONFIG, adapters: device(), load: async () => fb, storage: memory(), win });
  await acc.init(); await flush();
  assert.equal(acc.status().ui, 'finish'); assert.equal(win.location.hash, '#profil');
  await acc.confirmEmail('elev@skole.dk'); await flush();
  assert.equal(acc.status().state, 'user');
});

test('log out saves first, then clears this device and starts over', async () => {
  const fb = fakeFirebase(), dev = device(), win = fakeWindow();
  const acc = createAccount({ config: CONFIG, adapters: dev, load: async () => fb, storage: memory(), win });
  await acc.init(); await acc.signInGoogle(); await flush(); await flush();
  await acc.signOutUser();
  assert.ok(fb.calls.includes('signout')); assert.equal(dev.cleared, 1); assert.equal(win.reloaded, 1);
});

test('delete account removes the cloud copy and the login, then this device', async () => {
  const docs = new Map(), fb = fakeFirebase({ docs }), dev = device(), win = fakeWindow();
  const acc = createAccount({ config: CONFIG, adapters: dev, load: async () => fb, storage: memory(), win });
  await acc.init(); await acc.signInGoogle(); await flush(); await flush();
  assert.ok(docs.has('users/g1'));
  await acc.deleteAccount();
  assert.ok(!docs.has('users/g1')); assert.ok(fb.calls.some(c => Array.isArray(c) && c[0] === 'deleteUser' && c[1] === 'g1'));
  assert.equal(dev.cleared, 1); assert.equal(win.reloaded, 1);
});

test('a closed Google window is not an error; a blocked one explains what to do', async () => {
  const fb = fakeFirebase(), acc = createAccount({ config: CONFIG, adapters: device(), load: async () => fb, storage: memory(), win: fakeWindow() });
  await acc.init(); await flush();
  fb.signInWithPopup = async () => { throw Object.assign(new Error(), { code: 'auth/popup-closed-by-user' }); };
  await acc.signInGoogle(); assert.equal(acc.status().error, null);
  fb.signInWithPopup = async () => { throw Object.assign(new Error(), { code: 'auth/popup-blocked' }); };
  await acc.signInGoogle(); assert.match(acc.status().error, /pop op/);
});

/* ---------- merging ---------- */
test('merging keeps progress from both places', () => {
  assert.deepEqual(mergeIntro({ done: true, when: '1m' }, { done: false }), { done: true, when: '1m' });
  assert.deepEqual(mergeIntro({ done: true, when: '1m' }, { done: true, when: '2w' }).when, '2w', 'this device wins when both are done');
  const g = mergeGarage({ spent: 900, owned: ['scooter:paint-red'], bases: ['scooter', 'smallcar'], active: 'smallcar', equipped: { paint: 'red' } },
    { spent: 0, owned: [], bases: ['scooter'], active: 'scooter', equipped: {} });
  assert.equal(g.spent, 900); assert.deepEqual([...g.bases].sort(), ['scooter', 'smallcar']); assert.deepEqual(g.owned, ['scooter:paint-red']);
  assert.equal(g.active, 'smallcar', 'an unused garage takes the look of the used one');
  assert.deepEqual(mergeOrder({ a: { done: true, at: 1 } }, { a: { done: false, at: 9 }, b: { done: false, at: 2 } }), { a: { done: true, at: 9 }, b: { done: false, at: 2 } });
});

test('progress is stored as JSON strings and survives the round trip', () => {
  const values = { learning: { version: 1, history: [[1, 2], [3]] }, intro: { done: true }, mybil: { owned: [] }, order: {} };
  const packed = packProgress(values);
  assert.equal(typeof packed.learning, 'string', 'nested arrays are fine as JSON');
  assert.deepEqual(unpackProgress(packed), values);
  assert.deepEqual(unpackProgress({ learning: '{broken', intro: '{"done":true}' }), { intro: { done: true } });
  assert.equal(packProgress({ learning: { big: 'x'.repeat(800000) } }).learning, undefined, 'too big for the rules: skipped, not rejected');
});
