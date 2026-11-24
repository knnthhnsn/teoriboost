// Login before exercises (Founder test, 13 Nov 2026): onboarding first, then sign-up, then the first answer.
// Only blocks when a real login is possible. Without Firebase (state 'off') or when it failed ('local'),
// everything stays open, so a broken config never locks learners out.
import { renderAccountActions } from './screens.js';
import { renderCast } from './cast.js';

// Routes that record answers. Hubs (home, practice, theory, profil, garage, chat, start) stay open.
export const LOGIN_ROUTES = ['journey', 'learn', 'lesson', 'mission', 'review', 'exam', 'exam-result', 'drive', 'trafiklab', 'judge'];
// The team's open copies (16 Nov 2026): login works there but is never required.
const OPEN_HOST = ['teoriboost.vercel.app', 'teoriboost-team.web.app', 'teoriboost-team.firebaseapp.com'].includes(globalThis.location?.hostname);
const RETURN_KEY = 'teoriboost.loginReturn.v1';
const RETURN_TTL = 24 * 60 * 60 * 1000;

export function needsLogin(state, route, arg = '') {
  if (OPEN_HOST) return false;
  const gated = LOGIN_ROUTES.includes(route) || (route === 'order' && !!arg);
  return gated && (state === 'anon' || state === 'loading');
}

export function createLoginGate({ account, route, doc = globalThis.document, win = globalThis.window, storage = globalThis.localStorage, now = () => Date.now() }) {
  let last = account.status().state;
  const remember = hash => { try { storage.setItem(RETURN_KEY, JSON.stringify({ hash, at: now() })); } catch {} };
  const takeReturn = () => {
    try {
      const saved = JSON.parse(storage.getItem(RETURN_KEY) || 'null');
      storage.removeItem(RETURN_KEY);
      return saved && now() - saved.at < RETURN_TTL && /^#[a-z-]+(:[\w.-]*)?$/.test(saved.hash) ? saved.hash : '';
    } catch { return ''; }
  };
  const onGate = () => !!doc.querySelector('[data-login-gate]');
  account.subscribe(s => {
    const body = doc.querySelector('[data-login-body]');
    if (body) body.innerHTML = renderAccountActions(s);
    if (s.state === last) return;
    const was = last; last = s.state;
    if (s.state !== 'user') { if (onGate()) route(); return; }
    // The e-mail link lands on #profil after its own redirect, so wait one tick before going back.
    const target = takeReturn();
    win.setTimeout(() => {
      if (target && win.location.hash !== target) win.location.hash = target;
      else if (onGate() || was === 'loading') route();
    }, 0);
  });
  return {
    blocks(r, arg) { return needsLogin(account.status().state, r, arg); },
    view() {
      remember(win.location.hash || '#home');
      const s = account.status();
      return `<section class="login-gate" data-login-gate aria-labelledby="login-gate-title">
        <div class="login-gate__cast">${renderCast('sneglen', { size: 'md', priority: true })}</div>
        <h1 id="login-gate-title">Gem din fremgang, før du går i gang</h1>
        <p class="login-gate__lead">Log ind, så gemmes dine svar, dine fejl og din bil i din konto. Så fortsætter du på telefon og computer, og intet går tabt.</p>
        <div class="login-gate__actions" data-login-body>${renderAccountActions(s)}</div>
        <p class="login-gate__fine">Din fremgang gemmes på Googles servere i EU. <a href="#home">Tilbage til Lær</a></p>
      </section>`;
    },
    accountActions: () => renderAccountActions(account.status()),
    remember
  };
}
