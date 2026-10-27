// Login (Firebase Auth) and keeping progress in sync with Firestore (EU).
// Everyone gets an anonymous session and progress stays on the device, as before. Logging in with Google
// or an e-mail link merges the device's progress into the account and keeps the two in sync from then on.
// The anonymous session never holds cloud data, so "upgrading" is a merge, not an account link: that also
// works when the Google account already exists, and a failed link can't use up a one-time e-mail link.
import { packProgress, unpackProgress } from './cloud-merge.js';

export const SDK_URL = 'https://www.gstatic.com/firebasejs/12.18.0/';
const EMAIL_KEY = 'teoriboost.emailForSignIn';
const PUSH_EVERY = 20000, PULL_AFTER = 60000;

const loadFirebase = () => Promise.all(['app', 'auth', 'firestore'].map(m => import(`${SDK_URL}firebase-${m}.js`)))
  .then(mods => Object.assign({}, ...mods));

const MESSAGES = {
  'auth/popup-blocked': 'Din browser blokerede login-vinduet. Tillad pop op-vinduer for siden, og prøv igen.',
  'auth/network-request-failed': 'Ingen forbindelse. Prøv igen, når du er online.',
  'auth/invalid-email': 'Den e-mailadresse ser ikke rigtig ud.',
  'auth/missing-email': 'Skriv din e-mailadresse.',
  'auth/invalid-action-code': 'Login-linket er udløbet eller allerede brugt. Bed om et nyt.',
  'auth/expired-action-code': 'Login-linket er udløbet. Bed om et nyt.',
  'auth/requires-recent-login': 'Af sikkerhedshensyn skal du logge ud og ind igen, før kontoen kan slettes.',
  'auth/too-many-requests': 'For mange forsøg lige nu. Vent lidt, og prøv igen.',
  'auth/unauthorized-domain': 'Login er ikke slået til for denne adresse endnu.',
  'auth/unauthorized-continue-uri': 'Login er ikke slået til for denne adresse endnu.',
  'auth/operation-not-allowed': 'Den login-metode er ikke slået til endnu.',
};
const CANCELLED = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'];
export const friendly = e => MESSAGES[e?.code] || 'Noget gik galt. Prøv igen om lidt.';

/**
 * adapters: read() -> { learning, intro, mybil, order }; merge(remote) folds the account's copy into this
 * device; clear() removes the learner's data from this device (log out, delete account).
 */
export function createAccount({ config, adapters, load = loadFirebase, storage = globalThis.localStorage, win = globalThis.window, now = () => Date.now() }) {
  let fb, auth, db, uid = null, timer = 0, lastSent = '', lastPull = 0, paused = false, pendingHref = '';
  let status = { state: config ? 'loading' : 'off', email: null, provider: null, syncedAt: null, syncing: false, busy: false, error: null, ui: '', sentTo: null };
  const subs = new Set();
  const set = patch => { status = { ...status, ...patch }; subs.forEach(f => f(status)); };
  const userDoc = id => fb.doc(db, 'users', id);

  /* ---------- sync ---------- */
  async function pull() {
    const snap = await fb.getDoc(userDoc(uid)); lastPull = now();
    if (snap.exists()) adapters.merge(unpackProgress(snap.data()));
  }
  async function push(force = false) {
    if (!uid || paused) return;
    const packed = packProgress(adapters.read()), sig = JSON.stringify(packed);
    if (!force && sig === lastSent) return; // nothing new since the last save
    set({ syncing: true });
    try { await fb.setDoc(userDoc(uid), { ...packed, v: 1, updatedAt: fb.serverTimestamp() }); lastSent = sig; set({ syncing: false, syncedAt: now(), error: null }); }
    catch { set({ syncing: false, error: 'Kunne ikke gemme i din konto lige nu. Det bliver prøvet igen.' }); }
  }
  async function startSync() {
    paused = false; set({ syncing: true });
    try { await pull(); await push(true); }
    catch { set({ syncing: false, error: 'Kunne ikke hente din fremgang lige nu. Det bliver prøvet igen.' }); }
    clearInterval(timer); timer = setInterval(() => void push(), PUSH_EVERY);
    timer?.unref?.(); // (Node, in tests) the save timer must not keep the process alive
  }
  function stopSync() { clearInterval(timer); timer = 0; uid = null; lastSent = ''; }
  function onVisibility() {
    if (!uid) return;
    if (win.document.visibilityState === 'hidden') void push();
    else if (now() - lastPull > PULL_AFTER) pull().then(() => push()).catch(() => {});
  }

  /* ---------- session ---------- */
  function handle(user) {
    if (!user) { stopSync(); set({ state: 'anon', email: null, provider: null }); fb.signInAnonymously(auth).catch(() => set({ state: 'local' })); return; }
    if (user.isAnonymous) { stopSync(); set({ state: 'anon', email: null, provider: null }); return; }
    const provider = user.providerData?.some(p => p.providerId === 'google.com') ? 'Google' : 'e-mail';
    set({ state: 'user', email: user.email, provider, ui: '', busy: false, error: null, sentTo: null });
    if (uid !== user.uid) { uid = user.uid; void startSync(); }
  }
  /** Signs in to a real account and removes the anonymous session it replaces. */
  async function replaceAnonymous(signIn) {
    const prev = auth.currentUser?.isAnonymous ? auth.currentUser : null;
    await signIn();
    if (prev && prev.uid !== auth.currentUser?.uid) fb.deleteUser(prev).catch(() => {});
    handle(auth.currentUser);
  }
  async function finishEmailLink(email) {
    await replaceAnonymous(() => fb.signInWithEmailLink(auth, email, pendingHref));
    storage.removeItem(EMAIL_KEY); pendingHref = '';
    win.history.replaceState(null, '', win.location.pathname); // drop the one-time code from the address
    win.location.hash = 'profil';
  }

  async function init() {
    if (!config) return;
    try {
      fb = await load();
      const app = fb.initializeApp(config);
      auth = fb.getAuth(app); auth.languageCode = 'da';
      db = fb.getFirestore(app);
      win.document.addEventListener('visibilitychange', onVisibility);
      if (fb.isSignInWithEmailLink(auth, win.location.href)) {
        pendingHref = win.location.href;
        await auth.authStateReady();
        const email = storage.getItem(EMAIL_KEY);
        if (email) await finishEmailLink(email).catch(e => set({ error: friendly(e) }));
        else { set({ ui: 'finish' }); win.location.hash = 'profil'; } // opened on another device: ask for the address
      }
      fb.onAuthStateChanged(auth, handle);
    } catch (e) {
      set({ state: 'local' }); console.warn('account: Firebase could not load', e?.message);
    }
  }

  /* ---------- actions ---------- */
  async function signInGoogle() {
    if (!auth) return; set({ error: null });
    try { await replaceAnonymous(() => fb.signInWithPopup(auth, new fb.GoogleAuthProvider())); }
    catch (e) { console.warn('account: Google sign-in ended:', e?.code || e?.message); if (!CANCELLED.includes(e?.code)) set({ error: friendly(e) }); }
  }
  async function sendEmailLink(email) {
    if (!auth) return; email = String(email || '').trim(); set({ error: null, busy: true });
    try {
      await fb.sendSignInLinkToEmail(auth, email, { url: `${win.location.origin}${win.location.pathname}?konto=link`, handleCodeInApp: true });
      storage.setItem(EMAIL_KEY, email); set({ ui: 'sent', sentTo: email, busy: false });
    } catch (e) { set({ error: friendly(e), busy: false }); }
  }
  async function confirmEmail(email) {
    if (!auth || !pendingHref) return; set({ error: null, busy: true });
    try { await finishEmailLink(String(email || '').trim()); } catch (e) { set({ error: friendly(e), busy: false }); }
  }
  async function signOutUser() {
    if (!auth) return; set({ busy: true });
    await push(true).catch(() => {});
    stopSync(); await fb.signOut(auth);
    adapters.clear(); win.location.reload();
  }
  async function deleteAccount() {
    const user = auth?.currentUser; if (!user || user.isAnonymous) return;
    set({ busy: true, error: null }); paused = true; clearInterval(timer);
    try {
      await adapters.beforeDelete?.(); // e.g. leave the team, so nothing of the learner is left behind there
      await fb.deleteDoc(userDoc(user.uid));
      await fb.deleteUser(user);
      adapters.clear(); win.location.reload();
    } catch (e) { set({ busy: false, ui: '', error: friendly(e) }); } // sync stays paused so the document isn't written again
  }

  return {
    init, signInGoogle, sendEmailLink, confirmEmail, signOutUser, deleteAccount,
    status: () => status,
    setUi: ui => set({ ui, error: null }),
    subscribe: fn => { subs.add(fn); return () => subs.delete(fn); },
    syncNow: () => push(),
    /** Firestore for other features (the team race), only while signed in to a real account. */
    firestore: async () => { const u = auth?.currentUser; return u && !u.isAnonymous ? { fb, db, uid: u.uid } : null; },
  };
}
