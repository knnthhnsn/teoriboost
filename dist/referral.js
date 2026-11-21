// Referral rewards are issued on the server. This module never grants cash, refunds or credits.
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const number = value => new Intl.NumberFormat('da-DK').format(value || 0);
const money = ore => new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' }).format((ore || 0) / 100);
const INVITE_KEY = 'teoriboost.pendingInvite.v1';
const PROOF_KEY = 'teoriboost.referralProof.v1.';

export function canonicalReferralAnswers(question, answers, questions) {
  const original = questions.find(item => item.id === question?.id);
  if (!original || !Array.isArray(answers) || answers.length !== original.statements.length || answers.some(item => typeof item !== 'boolean')) return null;
  const canonical = original.statements.map(statement => {
    const index = question.statements.findIndex(item => item.text === statement.text);
    return index < 0 ? null : answers[index];
  });
  if (canonical.some(item => item === null)) return null;
  return { questionId: original.id, answers: canonical };
}

export function referralProgress(stats = {}) {
  const signups = Number(stats.qualifiedSignups) || 0, paid = Number(stats.paidFriends) || 0;
  return number(signups) + (signups === 1 ? ' kvalificeret tilmelding' : ' kvalificerede tilmeldinger') +
    ', ' + number(paid) + ' kvalificerede køb, ' + money(stats.refundTotalOre) + ' tilbage på dit køb' +
    (stats.reviewRequired > 0 ? ', ' + number(stats.reviewRequired) + (stats.reviewRequired === 1 ? ' belønning afventer manuel kontrol' : ' belønninger afventer manuel kontrol') : '');
}

export function referralProofFromSession(session, questions, firstSectionId) {
  if (!session || session.sectionId !== firstSectionId || session.stage !== 'done' || !Number.isFinite(session.finalizedAt)) return null;
  const proofs = new Map();
  function add(questionId, attempts, order) {
    const question = questions.find(item => item.id === questionId && item.sectionId === firstSectionId);
    const attempt = [...(attempts || [])].reverse().find(item => item.correct === true && Array.isArray(item.answers) && item.answers.length === 4 && item.answers.every(answer => typeof answer === 'boolean'));
    if (!question || !attempt) return;
    const answers = [...attempt.answers];
    if (order) {
      if (!Array.isArray(order) || order.length !== 4 || new Set(order).size !== 4 || order.some(index => !Number.isInteger(index) || index < 0 || index > 3)) return;
      order.forEach((originalIndex, displayedIndex) => { answers[originalIndex] = attempt.answers[displayedIndex]; });
    }
    proofs.set(question.id, { questionId: question.id, answers });
  }
  add(session.questionId, session.apply?.attempts);
  add(session.checkpoint?.questionId, session.checkpoint?.attempts, session.checkpoint?.order);
  return proofs.size ? { sectionId: firstSectionId, answers: [...proofs.values()] } : null;
}

export function createReferral({ account, config, questions = [], firstSectionId, firstSectionTitle = 'den første lektion', fetcher = globalThis.fetch, doc = globalThis.document, win = globalThis.window, onChange = () => {}, onLogin = () => {}, onOpenLesson = () => {} }) {
  let profile = null, profileUid = null, context = null, pending = null, generation = 0, busy = false, dead = false, message = '', error = false, invite = '';
  const assessments = new Map();
  let completedProof = null, proofOwner = null, proofPending = null;
  const settings = config?.referral;
  const enabled = () => settings?.enabled === true && settings.confirmed === true;
  const currentUser = () => context?.fb.getAuth().currentUser;
  function view() {
    const user = currentUser();
    return account.status().state === 'user' && user && !user.isAnonymous && user.uid === profileUid ? profile : null;
  }
  try {
    const candidate = new URL(win.location.href).searchParams.get('invite') || win.sessionStorage.getItem(INVITE_KEY) || '';
    if (/^TEO-[A-HJ-NP-Z2-9]{4,12}$/i.test(candidate)) {
      invite = candidate.toUpperCase();
      win.sessionStorage.setItem(INVITE_KEY, invite);
    }
  } catch {}
  async function identity() {
    if (account.status().state !== 'user') throw new Error('Log ind for at bruge en henvisningskode.');
    context = await account.firestore();
    const user = currentUser();
    if (!user || user.isAnonymous || context.uid !== user.uid) throw new Error('Log ind igen for at fortsætte.');
    return { uid: user.uid, token: await user.getIdToken() };
  }
  async function request(path, body) {
    const who = await identity(), started = generation;
    const response = await fetcher('/api/referral/' + path, {
      method: body === undefined ? 'GET' : 'POST', cache: 'no-store', credentials: 'same-origin',
      headers: { Authorization: 'Bearer ' + who.token, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.error?.message || 'Vi kunne ikke gennemføre henvisningen lige nu. Prøv igen om lidt.'), { code: data.error?.code });
    if (dead || started !== generation || currentUser()?.uid !== who.uid || account.status().state !== 'user') throw new Error('Du skiftede konto undervejs. Prøv igen.');
    return { data, uid: who.uid };
  }
  function paint() {
    if (dead) return;
    doc.querySelectorAll('[data-referral-card]').forEach(node => {
      const focused = node.contains(doc.activeElement), name = doc.activeElement?.getAttribute('data-ref');
      node.outerHTML = markup();
      if (focused && name) doc.querySelector('[data-referral-card] [data-ref="' + name + '"]')?.focus();
    });
  }
  function setMessage(value, isError = false) { message = value; error = isError; paint(); }
  async function refresh() {
    if (!enabled() || account.status().state !== 'user') { profile = null; profileUid = null; paint(); return null; }
    const user = await identity().catch(() => null);
    if (!user) return null;
    const started = generation;
    if (pending?.uid === user.uid && pending.generation === started) return pending.promise;
    const promise = (async () => {
      const result = await request('profile');
      let data = result.data;
      if (!data.code) {
        await request('code', { regenerate: false });
        data = (await request('profile')).data;
      }
      if (started !== generation) return null;
      const previous = JSON.stringify(view());
      profile = data; profileUid = result.uid; paint();
      if (JSON.stringify(profile) !== previous) onChange();
      return profile;
    })();
    pending = { uid: user.uid, generation: started, promise };
    try { return await promise; }
    catch (exception) { if (started === generation) setMessage(exception.message, true); return null; }
    finally { if (pending?.promise === promise) pending = null; }
  }
  async function bind(code) {
    const result = await request('bind', { code: String(code || '').trim().toUpperCase() });
    invite = '';
    try { win.sessionStorage.removeItem(INVITE_KEY); } catch {}
    await refresh();
    return result.data;
  }
  async function autoBind() {
    if (!enabled() || !invite || account.status().state !== 'user') return;
    try { await bind(invite); setMessage('Din vens kode er gemt. Se betingelserne for rabat og velkomstbelønning.'); }
    catch (exception) { setMessage(exception.message, true); }
  }
  function markup() {
    if (!settings) return '';
    const data = view(), signup = settings.signup, payment = settings.payment, signedIn = account.status().state === 'user';
    if (!enabled()) return ''; // was a visible 'Kommer snart' card (test finding F17)
    if (false) return '<section class="tb-referral-card" data-referral-card aria-label="Inviter en ven"><div class="tb-referral-heading"><span>TEORIBOOST</span><h3>Inviter en ven</h3></div><p class="tb-referral-status">Kommer snart.</p></section>';
    return '<section class="tb-referral-card" data-referral-card aria-label="Inviter en ven">' +
      '<div class="tb-referral-heading"><span>TEORIBOOST</span><h3>Inviter en ven</h3></div>' +
      (!enabled() ? '<p class="tb-referral-status">Programmet er ikke åbnet endnu. ' + (settings.amountsConfirmed ? 'Belønninger og lofter er godkendt, men de øvrige betingelser afventer afklaring.' : 'Belønningerne herunder er forslag.') + '</p>' :
        !signedIn ? '<p>Log ind for at få din egen kode og knytte belønningerne til din konto.</p>' : '') +
      '<p>Du får ' + number(signup.referrerBoosters) + ' Boosters, når en ny ven opretter en verificeret konto og gennemfører den første lektion. Din ven får ' + number(signup.friendBoosters) + ' Boosters.</p>' +
      (data?.code ? '<label class="tb-referral-code-label">Din personlige kode<input data-ref="code" readonly value="' + esc(data.code) + '"></label>' +
        '<div class="tb-referral-actions"><button type="button" data-ref="share">Del kode</button><button type="button" data-ref="copy">Kopiér kode</button></div>' +
        '<p class="tb-referral-progress">' + esc(referralProgress(data.stats)) + '</p>' +
        '<details><summary>Skift kode</summary><p>Den gamle kode virker ikke for nye invitationer bagefter. Allerede gemte henvisninger bevares.</p><button type="button" data-ref="regenerate">Opret ny kode</button></details>' :
        signedIn && enabled() ? '<p>Henter din personlige kode <span class="tb-stripes" aria-hidden="true"></span></p>' : '') +
      (!signedIn && enabled() ? '<button type="button" data-ref="login">Log ind</button>' : '') +
      (enabled() && !data?.binding?.bound ? '<form data-referral-form><label>Har du fået en vens kode? Knyt den til din konto senest 72 timer efter oprettelsen.<input name="referralCode" placeholder="TEO-ABCD2345" maxlength="20" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(invite) + '" required></label><button type="submit">Gem vennens kode</button></form>' : '') +
      (data?.binding?.bound ? '<p>Din vens kode er knyttet til kontoen.' + (data.binding.qualified ? ' Velkomstbelønningen er registreret.' : ' Gennemfør ' + esc(firstSectionTitle) + ' for at kvalificere henvisningen.') + '</p>' + (!data.binding.qualified ? '<button type="button" data-ref="lesson">Åbn ' + esc(firstSectionTitle) + '</button>' : '') : '') +
      '<details class="tb-referral-rules"><summary>Sådan virker Inviter en ven</summary>' +
      '<p>Din ven får ' + number(settings.discountPercent) + ' % rabat på sit første pas med en gyldig henvisning. Henvisningskode og global gratis-kode kan ikke kombineres.</p>' +
      '<p>Efter ' + number(payment.holdDays) + ' dage uden refundering eller betalingsindsigelse kan et køb udløse en belønning. Har du selv betalt, kan ' + number(payment.refundPercent) + ' % af vennens faktiske betaling føres tilbage på dit eget oprindelige køb. Du kan højst få dit eget betalte beløb tilbage. Det er ikke en udbetaling af vennens penge til dig.</p>' +
      '<p>Belønninger ved MobilePay eller andre betalinger uden et kontrollerbart kortaftryk kræver manuel kontrol og behandles ikke automatisk.</p>' +
      '<p>Har du ikke selv betalt, gives i stedet ' + number(payment.unpaidReferrerDays) + ' dages premium pr. kvalificeret køb, op til ' + number(payment.maxUnpaidRewardMonths) + ' måneder i alt. En eksisterende adgang uden udløb bliver ved med at være uden udløb.</p>' +
      '<p>Højst ' + number(signup.maxPerReferrerPerMonth) + ' nye venner kan udløse Boosters til dig pr. måned. Selvhenvisning, tidligere konti og fælles betalingskort er ikke berettiget.</p>' +
      '<p>En personlig kode skal knyttes til en ny konto senest ' + number(signup.maxAccountAgeHours) + ' timer efter oprettelsen.</p>' +
      '<p>Boosters er virtuelle og har ingen kontantværdi. Del kun markedsføring gennem en kanal og til modtagere, hvor det er lovligt og tilladt. Appen sender ingen beskeder for dig.</p>' +
      '<p><a href="handelsbetingelser.html#henvisningsprogram" target="_blank" rel="noopener">Læs de fulde regler i handelsbetingelserne</a>.</p></details>' +
      '<p class="tb-referral-message" role="' + (error ? 'alert' : 'status') + '" aria-live="polite">' + esc(message) + '</p></section>';
  }
  function decorate() {
    const host = doc.querySelector('#view .mybil') || doc.querySelector('#view .profile');
    if (host && !host.querySelector('[data-referral-card]')) host.insertAdjacentHTML('beforeend', markup());
  }
  async function click(event) {
    const button = event.target.closest('[data-referral-card] [data-ref]');
    if (!button || button.tagName !== 'BUTTON') return;
    event.preventDefault();
    if (button.dataset.ref === 'login') { onLogin(); return; }
    if (button.dataset.ref === 'lesson') { onOpenLesson(firstSectionId); return; }
    const data = view();
    if (!data?.code) return;
    const url = new URL(win.location.pathname, win.location.origin);
    url.searchParams.set('invite', data.code);
    if (button.dataset.ref === 'share') {
      try {
        if (win.navigator.share) await win.navigator.share({ title: 'TeoriBoost', text: 'Prøv TeoriBoost med min kode ' + data.code + '. Læs reglerne og vilkårene, før du bruger den.', url: url.href });
        else { await win.navigator.clipboard.writeText(url.href); setMessage('Invitationslinket er kopieret.'); }
      } catch (exception) { if (exception.name !== 'AbortError') setMessage('Vi kunne ikke åbne delingen. Brug Kopiér kode.', true); }
      return;
    }
    if (button.dataset.ref === 'copy') {
      try { await win.navigator.clipboard.writeText(data.code); setMessage('Din kode er kopieret.'); }
      catch { button.closest('[data-referral-card]').querySelector('[data-ref=code]')?.select(); setMessage('Markér koden, og kopiér den selv.'); }
      return;
    }
    if (button.dataset.ref === 'regenerate' && !busy) {
      busy = true; button.disabled = true;
      try { await request('code', { regenerate: true }); await refresh(); setMessage('Din nye kode er klar. Den gamle virker ikke for nye invitationer.'); }
      catch (exception) { setMessage(exception.message, true); }
      finally { busy = false; }
    }
  }
  async function submit(event) {
    if (!event.target.matches('[data-referral-form]')) return;
    event.preventDefault();
    const code = event.target.elements.referralCode.value;
    if (account.status().state !== 'user') {
      invite = code.trim().toUpperCase();
      try { win.sessionStorage.setItem(INVITE_KEY, invite); } catch {}
      onLogin(); return;
    }
    try { await bind(code); setMessage('Din vens kode er gemt.'); }
    catch (exception) { setMessage(exception.message, true); }
  }
  function recordAssessment(question, answers) {
    if (!enabled() || question?.sectionId !== firstSectionId) return;
    const proof = canonicalReferralAnswers(question, answers, questions);
    if (proof) assessments.set(proof.questionId, proof);
  }
  async function flushProof() {
    if (!enabled() || account.status().state !== 'user') return;
    const who = await identity().catch(() => null);
    if (!who) return;
    let queued = proofOwner === who.uid ? completedProof : null;
    if (!queued) {
      try {
        const stored = JSON.parse(win.sessionStorage.getItem(PROOF_KEY + who.uid) || 'null');
        if (stored?.uid === who.uid && stored.proof?.sectionId === firstSectionId && Array.isArray(stored.proof.answers)) queued = stored.proof;
      } catch {}
    }
    if (!queued || proofPending?.uid === who.uid) return proofPending?.promise;
    const promise = (async () => {
      try {
        await request('lesson', queued);
        if (currentUser()?.uid !== who.uid) return;
        completedProof = null; proofOwner = null;
        try { win.sessionStorage.removeItem(PROOF_KEY + who.uid); } catch {}
        await refresh(); setMessage('Din gennemførte lektion er registreret til henvisningen.');
      } catch (exception) { setMessage(exception.message, true); }
    })();
    proofPending = { uid: who.uid, promise };
    try { await promise; } finally { if (proofPending?.promise === promise) proofPending = null; }
  }
  async function completeLesson(evidence, session) {
    if (!enabled() || evidence?.sectionId !== firstSectionId || account.status().state !== 'user') return;
    const who = await identity().catch(() => null);
    if (!who) return;
    completedProof = referralProofFromSession(session, questions, firstSectionId) || { sectionId: firstSectionId, answers: [...assessments.values()] };
    if (!completedProof.answers.length) return;
    proofOwner = who.uid;
    try { win.sessionStorage.setItem(PROOF_KEY + who.uid, JSON.stringify({ uid: who.uid, proof: completedProof })); } catch {}
    await flushProof();
  }
  const unsubscribe = account.subscribe(status => {
    if (status.state !== 'user' || currentUser()?.uid !== profileUid) {
      const oldOwner = proofOwner || profileUid, hadProfile = !!profile;
      if (oldOwner && (status.state !== 'user' || currentUser()?.uid !== oldOwner)) {
        try { win.sessionStorage.removeItem(PROOF_KEY + oldOwner); } catch {}
      }
      generation++; profile = null; profileUid = null; pending = null; completedProof = null; proofOwner = null; assessments.clear(); paint();
      if (hadProfile) onChange();
    }
    if (status.state === 'user' && enabled()) void refresh().then(autoBind).then(flushProof);
  });
  const visibility = () => { if (!doc.hidden && enabled()) void refresh().then(flushProof); };
  doc.addEventListener('click', click);
  doc.addEventListener('submit', submit);
  doc.addEventListener('visibilitychange', visibility);
  const ready = enabled() && account.status().state === 'user' ? refresh().then(autoBind).then(flushProof) : Promise.resolve();
  return {
    ready, refresh, bind, decorate, markup, recordAssessment, completeLesson, retryProof: flushProof,
    boosterTotal: () => Number(view()?.balance?.boosters) || 0,
    discountPercent: () => view()?.binding?.bound && !view()?.binding?.discountUsed ? settings.discountPercent : 0,
    dispose() { dead = true; generation++; unsubscribe(); doc.removeEventListener('click', click); doc.removeEventListener('submit', submit); doc.removeEventListener('visibilitychange', visibility); profile = null; assessments.clear(); }
  };
}
