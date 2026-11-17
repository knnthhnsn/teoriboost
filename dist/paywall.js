import { createEntitlementClient, loadPremiumConfig, gatesEnabled, contentAccess, createPracticeQuota, createExamQuota } from './entitlements.js';
import { createReferral } from './referral.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const IMMEDIATE_ACCESS_TEXT = 'Jeg anmoder om, at leveringen af det digitale indhold begynder straks inden udløbet af fortrydelsesfristen, og jeg anerkender, at jeg mister min fortrydelsesret, når leveringen begynder.';
export const TERMS_TEXT = 'Jeg accepterer handelsbetingelserne.';
export function priceText(amount) {
  return Number.isFinite(amount) && amount > 0 ? new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 2 }).format(amount) : 'Pris kommer';
}

export function createPaywall({ account, chapters = [], questions = [], fetcher = globalThis.fetch, config: providedConfig, document: doc = globalThis.document, win = globalThis.window, onAccessChange = () => {}, currentExamId = () => '' }) {
  const client = createEntitlementClient({ account, fetcher });
  const quota = createPracticeQuota({ owner: () => client.view().uid || 'device' });
  const exams = createExamQuota({ owner: () => client.view().uid || 'device' });
  const freeExams = () => Number.isSafeInteger(config?.free?.fullExams) && config.free.fullExams > 0 ? config.free.fullExams : 0;
  // One full practice exam is free (Founder test, 13 Nov 2026). The exam the learner started free may be resumed and reviewed.
  function examAllowed(id = currentExamId()) { return !gatesEnabled(config) || isPremium() || exams.allows(freeExams(), id); }
  let config = providedConfig || null, configError = '', selected = '30-days', busy = false, returnFocus, pendingRoute = '', closed = false;
  let sheet, message, mode = 'offer', expiryTimer, referral;

  function isPremium() { return client.view().premium; }
  function chapterNumber(id) {
    const index = chapters.findIndex(chapter => chapter.id === id || chapter.sections?.some(section => section.id === id));
    return index < 0 ? null : index + 1;
  }
  function allowChapter(id) { return contentAccess(config, isPremium(), 'chapter', chapterNumber(id)); }
  function notify(text, isError = false) {
    if (!message) return;
    message.textContent = text;
    message.setAttribute('role', isError ? 'alert' : 'status');
    message.dataset.error = String(isError);
  }
  function loginMarkup(describe = false) {
    const status = account.status(), id = describe ? ' id="tb-pw-description"' : '';
    if (status.state === 'user') return '<p' + id + ' class="pw-fine pw-account">Adgangen bliver knyttet til ' + esc(status.email || 'din konto') + '.</p>';
    if (['off', 'local'].includes(status.state)) return '<p' + id + ' class="pw-fine">Login er ikke tilgængeligt her endnu. Køb og koder kræver en konto.</p>';
    return '<div' + id + ' class="pw-login"><p>Log ind, så adgangen følger din konto på tværs af enheder.</p><button type="button" data-pw="google">Fortsæt med Google</button><button type="button" data-pw="email">Brug et e-maillink</button></div>';
  }
  function planMarkup() {
    return '<fieldset class="pw-plans"><legend class="pw-sr">Vælg din adgang</legend>' + (config?.plans || []).map(plan =>
      '<label class="pw-plan"><input type="radio" name="premium-plan" value="' + esc(plan.id) + '"' + (plan.id === selected ? ' checked' : '') + '><span class="pw-plan-name">' + esc(plan.label) + '</span><span class="pw-plan-price">' + esc(priceText(purchasePrice(plan.amountDkk))) + '</span></label>'
    ).join('') + '</fieldset>';
  }
  const buyLabel = plan => 'Køb ' + plan.label + ' – ' + priceText(purchasePrice(plan.amountDkk));
  function purchasePrice(amount) {
    const percent = referral?.discountPercent() || 0;
    return Number.isFinite(amount) ? Math.round(amount * 100 * (100 - percent) / 100) / 100 : amount;
  }
  function render() {
    if (!sheet) return;
    const plan = config?.plans?.find(item => item.id === selected);
    const available = gatesEnabled(config) && Number.isFinite(plan?.amountDkk) && plan.amountDkk > 0;
    const premium = isPremium();
    const X = '<button type="button" class="pw-x" data-pw="close" aria-label="Luk"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg></button>';
    const title = premium ? 'Din premiumadgang' : mode === 'code' ? 'Har du en kode?' : 'Én regel ad gangen. Hele vejen til prøven.';
    const codeForm = '<form class="pw-code" data-pw-code><label for="tb-pw-code-input">Din adgangskode</label><input id="tb-pw-code-input" name="code" type="text" maxlength="128" autocomplete="off" autocapitalize="characters" spellcheck="false" required autofocus><button type="submit" class="pw-cta">Brug kode</button></form>';
    const signedIn = account.status().state === 'user';
    let body;
    if (premium) {
      body = '<p id="tb-pw-description" class="pw-lead">' + (client.view().entitlement.expiresAt ? 'Adgang til ' + esc(new Date(client.view().entitlement.expiresAt).toLocaleString('da-DK', { dateStyle: 'long', timeStyle: 'short' })) + '.' : 'Din adgang har ingen udløbsdato.') + '</p>' +
        (mode === 'code' ? codeForm : '<button class="pw-cta" type="button" data-pw="close">Tilbage til appen</button>');
    } else if (mode === 'code') {
      body = (signedIn ? '' : loginMarkup(true)) + codeForm + (signedIn ? loginMarkup(true) : '') +
        '<p class="pw-links"><button type="button" class="pw-link" data-pw="open">Se priser</button></p>';
    } else {
      body = '<ul id="tb-pw-description" class="pw-benefits"><li>Alle emner, én regel ad gangen</li><li>Forklaring på hver fejl</li><li>Øveprøver som den rigtige, plus hjælp fra Sneglen</li></ul>' + planMarkup() +
        // BILLING HOOK: consent and card entry belong to our own payment page.
        '<button class="pw-cta" type="button" data-pw="buy">' + (available ? esc(buyLabel(plan)) : 'Se betalingsside') + '</button>' +
        '<p class="pw-fine">' + (available ? 'Engangskøb. Samlet pris inklusive moms. Ingen automatisk fornyelse.' : config?.price?.confirmed ? 'Priser inklusive moms. Ingen automatisk fornyelse. Køb er ikke åbnet endnu.' : 'Priserne er ikke fastlagt endnu. Køb er ikke åbnet.') + ' <a href="handelsbetingelser.html" target="_blank" rel="noopener">Handelsbetingelser</a></p>' +
        (referral?.discountPercent() ? '<p class="pw-fine">De viste priser inkluderer din vens rabat på ' + esc(referral.discountPercent()) + ' % på dit første pas.</p>' : '') +
        loginMarkup() +
        '<p class="pw-links"><button type="button" class="pw-link" data-pw="code">Har du en kode?</button><button type="button" class="pw-link" data-pw="restore">Gendan køb</button></p>';
    }
    sheet.innerHTML = '<div class="pw-body"><header class="pw-head"><h2 id="tb-pw-title">' + esc(title) + '</h2>' + X + '</header>' + body + '<p class="tb-pw-message" aria-live="polite" role="status"></p></div>';
    message = sheet.querySelector('.tb-pw-message');
    if (configError) notify(configError, true);
    if (mode === 'code') sheet.querySelector('input[name=code]')?.focus();
  }
  function close() {
    sheet?.close();
    if (returnFocus?.isConnected) returnFocus.focus();
  }
  function open(nextMode = 'offer', target = '') {
    mode = nextMode; pendingRoute = target || pendingRoute;
    const wasOpen = sheet.open;
    if (!wasOpen) returnFocus = doc.activeElement;
    // Never stack two blocking modal dialogs.
    doc.querySelector('#modal[open]')?.close();
    render();
    if (!wasOpen) sheet.showModal();
    else if (nextMode === 'offer') sheet.querySelector('.pw-plan input:checked')?.focus();
  }
  function requireAccess(kind, value, target = '') {
    if (contentAccess(config, isPremium(), kind, value)) return true;
    open('offer', target); return false;
  }
  function allowRoute(route, arg) {
    // Config is loaded before the first route. A failed config never unlocks content.
    if (!config) { open(); return false; }
    if (!gatesEnabled(config) || isPremium()) return true;
    if (['chapter', 'lesson', 'learn', 'journey'].includes(route)) {
      if (allowChapter(arg)) return true;
      open('offer', win.location.hash); return false;
    }
    if (route === 'garage' || route === 'garage-zone') return requireAccess('chapter', 1, win.location.hash);
    if (route === 'exam' && examAllowed()) return true;
    if (route === 'exam-result' && exams.used() > 0) return true;
    if (['theory', 'exam', 'exam-result', 'trafiklab', 'order', 'drive'].includes(route)) return requireAccess('premium', null, win.location.hash);
    if (route === 'judge') return requireAccess('game', 1, win.location.hash);
    if (['mission', 'review'].includes(route) && !quota.allows(config.free.practiceQuestionsPerDay, 'new')) {
      open('offer', win.location.hash); return false;
    }
    return true;
  }
  function requireExam(id) {
    if (!config) { open(); return false; }
    if (examAllowed(id)) return true;
    open('offer', win.location.hash); return false;
  }
  function recordExam(id) { if (gatesEnabled(config) && !isPremium()) exams.record(id); }
  function practiceAllowed(attempt) {
    if (!gatesEnabled(config) || isPremium() || quota.allows(config.free.practiceQuestionsPerDay, attempt)) return true;
    open(); return false;
  }
  function recordPractice(attempt) {
    if (gatesEnabled(config) && !isPremium()) quota.record(attempt);
  }
  function settingsMarkup() {
    return '<section class="tb-premium-settings" data-premium-settings aria-label="Premium"><h3>Din adgang</h3><p>' + (isPremium() ? 'Premium er aktiv på din konto.' : 'Se premiumadgang, eller brug en kode.') + '</p><button type="button" data-pw="open">Se premium</button><button type="button" data-pw="code">Har du en kode?</button><button type="button" data-pw="restore">Gendan køb</button></section>' + (referral?.markup() || '');
  }
  function decorate() {
    const host = doc.querySelector('.profile');
    if (host && !host.querySelector('.tb-premium-settings')) host.insertAdjacentHTML('beforeend', settingsMarkup());
    referral?.decorate();
  }
  async function chatHeaders() {
    const token = await account.idToken?.();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }
  async function action(fn, success) {
    if (busy) return;
    busy = true; sheet?.setAttribute('aria-busy', 'true');
    sheet?.querySelectorAll('button,input').forEach(node => node.disabled = true);
    try {
      const result = await fn();
      render(); notify(typeof success === 'function' ? success(result) : success || 'Din premiumadgang er klar.');
      if (isPremium()) {
        decorate(); onAccessChange();
        if (pendingRoute) { const target = pendingRoute; pendingRoute = ''; win.location.hash = target; }
      }
    } catch (error) { render(); notify(error.message, true); }
    finally { busy = false; sheet?.removeAttribute('aria-busy'); }
  }
  async function click(event) {
    const target = event.target.closest('[data-pw]');
    if (!target) return;
    event.preventDefault();
    switch (target.dataset.pw) {
      case 'close': close(); break;
      case 'open': open(); break;
      case 'code': open('code'); break;
      case 'profile': close(); win.location.hash = 'profil'; break;
      case 'google': await action(() => account.signInGoogle(), 'Kontrollér din konto, og prøv igen.'); break;
      case 'email': close(); account.setUi('email'); win.location.hash = 'profil'; break;
      case 'restore':
        if (!sheet.open) open();
        await action(() => client.restore(), 'Køb kontrolleret. ' + (isPremium() ? 'Premium er aktiv.' : 'Se din aktuelle adgang her.')); break;
      case 'buy': {
        const url = new URL('betaling.html', win.location.href);
        url.searchParams.set('plan', selected);
        win.location.assign(url.href);
        break;
      }
    }
  }
  const unsubscribe = client.subscribe(() => {
    clearTimeout(expiryTimer);
    const expiresAt = client.view().entitlement.expiresAt;
    if (expiresAt && isPremium()) expiryTimer = setTimeout(() => { void client.refresh(); onAccessChange(); }, Math.min(2147483647, Math.max(0, Date.parse(expiresAt) - Date.now() + 50)));
    if (sheet?.open && !busy) render();
    doc.querySelectorAll('[data-premium-settings]').forEach(node => {
      node.parentElement?.querySelectorAll('[data-referral-card]').forEach(card => card.remove());
      node.outerHTML = settingsMarkup();
    });
  });
  const visibility = () => { if (!doc.hidden) void client.refresh(); };
  const ready = (async () => {
    if (!config) {
      try { config = await loadPremiumConfig(fetcher); }
      catch (error) { configError = error.message; }
    }
    if (closed) return;
    referral = createReferral({ account, config, questions, firstSectionId: chapters[0]?.sections?.[0]?.id, firstSectionTitle: chapters[0]?.sections?.[0]?.title, fetcher, doc, win,
      onLogin: () => { close(); win.location.hash = 'profil'; },
      onOpenLesson: sectionId => { close(); doc.querySelector('#modal[open]')?.close(); win.location.hash = 'journey:' + sectionId; },
      onChange: () => { if (sheet?.open && !busy) render(); doc.dispatchEvent(new CustomEvent('teoriboost:referral-change')); } });
    sheet = doc.createElement('dialog');
    sheet.className = 'tb-paywall'; sheet.id = 'tb-paywall';
    sheet.setAttribute('aria-labelledby', 'tb-pw-title');
    sheet.setAttribute('aria-describedby', 'tb-pw-description');
    doc.body.append(sheet);
    sheet.addEventListener('cancel', event => { event.preventDefault(); close(); });
    const outside = event => { const r = sheet.getBoundingClientRect(); return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom; };
    let pressedBackdrop = false;
    sheet.addEventListener('pointerdown', event => { pressedBackdrop = outside(event); });
    sheet.addEventListener('click', event => { if (pressedBackdrop && outside(event)) close(); pressedBackdrop = false; });
    sheet.addEventListener('change', event => {
      if (event.target.name !== 'premium-plan') return;
      selected = event.target.value;
      const plan = config.plans.find(item => item.id === selected), button = sheet.querySelector('[data-pw=buy]');
      if (button && gatesEnabled(config) && Number.isFinite(plan?.amountDkk) && plan.amountDkk > 0) {
        button.textContent = buyLabel(plan);
      }
    });
    sheet.addEventListener('submit', event => {
      if (!event.target.matches('[data-pw-code]')) return;
      event.preventDefault();
      const code = event.target.elements.code.value;
      void action(async () => {
        const result = await client.redeem(code);
        if (result.referral) await referral.refresh();
        return result;
      }, result => result.referral ? 'Din vens kode er gemt. Se Inviter en ven for rabat og velkomstbelønning.' : 'Koden er aktiveret. Du har nu fuld premiumadgang på din konto.');
    });
    doc.addEventListener('click', click);
    doc.addEventListener('visibilitychange', visibility);
    await client.refresh();
    // The return URL is a refresh trigger only. It cannot mint access.
    const result = new URL(win.location.href).searchParams.get('billing');
    if (result) { open(); notify(result === 'cancelled' ? 'Købet blev afbrudt. Du er ikke blevet opkrævet her.' : 'Betalingen kontrolleres. Brug Gendan køb, hvis adgangen ikke er klar endnu.'); }
  })();
  return {
    ready, client, open, close, allowRoute, requireAccess, requireExam, recordExam, practiceAllowed, recordPractice, settingsMarkup, decorate, chatHeaders,
    config: () => config,
    recordReferralAssessment: (question, answers) => referral?.recordAssessment(question, answers),
    completeReferralLesson: (evidence, session) => referral?.completeLesson(evidence, session),
    referralGarage: garage => ({ ...garage, referralBonus: referral?.boosterTotal() || 0 }),
    dispose() { closed = true; clearTimeout(expiryTimer); unsubscribe(); client.dispose(); referral?.dispose(); sheet?.remove(); doc.removeEventListener('click', click); doc.removeEventListener('visibilitychange', visibility); }
  };
}
