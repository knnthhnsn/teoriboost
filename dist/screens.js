import { renderPracticeTabs } from './practice.js';
// The four tabs (Lær, Øv, Prøve, Min bil) plus Alle emner and Profil, after docs/redesign/mockups-v3.
// Short, game-like screens built around one next action. Data comes in from app.js; nothing here mutates state.
import { SEQUENCES } from './sequences.js';

import { ico, flameArt, flameLevel, AVATARS, avatarPref } from './ui-icons.js';
import { themePref, THEME_CHOICES } from './theme.js';
import { renderCast } from './cast.js';
// ACCOUNT CARD: approved asphalt design; existing account actions stay below.
import { renderAccountCard } from './account-card.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = n => Number(n).toLocaleString('da-DK');
const ICON = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4"/></svg>',
  fix: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v6M12 17h.01"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m14 8-4 4 4 4"/></svg>',
  chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m10 8 4 4-4 4"/></svg>',
};

/* ---------------- Lær: the path ---------------- */
const WHEN_DAYS = { '2w': 14, '1m': 30, '3m': 75 };
export function examCountdown(intro, now = Date.now()) {
  const total = WHEN_DAYS[intro?.when]; if (!total || !intro.whenAt) return null;
  return Math.max(0, total - Math.floor((now - intro.whenAt) / 864e5));
}
function nodeState(node, nextId) {
  if (node.id === nextId && !node.lessonComplete) return 'next';
  if (node.status === 'needs-repair') return 'repair';
  if (node.status === 'needs-practice' || node.status === 'review-due') return 'review';
  if (node.lessonComplete) return 'done';
  return 'open';
}
export function renderLearn({ vm, intro, due, unitIndex, ready }) {
  const units = vm.units || [];
  const next = vm.recommendations?.recommended || vm.recommendations?.next || units.flatMap(u => u.nodes || [])[0];
  const unit = units.find(u => u.id === vm.activeUnitId) || units.find(u => (u.nodes || []).some(n => n.id === next?.id)) || units[0];
  if (!unit) return '';
  const nodes = unit.nodes || [];
  const nextInUnit = nodes.find(n => n.id === next?.id) || nodes.find(n => !n.lessonComplete) || nodes[0];
  const done = nodes.filter(n => n.lessonComplete).length;
  const goal = Number(vm.daily?.dailyGoal) || 1, today = Number(vm.daily?.completedSessions) || 0;
  const OFF = [0, 0.9, 1.3, 0.8, -0.1, -0.9, -1.2, -0.6]; // snakes right first, so the guide on the left never covers a node
  const path = nodes.map((n, i) => {
    const st = nodeState(n, nextInUnit?.id), label = st === 'done' ? ICON.check : st === 'review' ? ICON.repeat : st === 'repair' ? ICON.fix : String(i + 1);
    const word = { next: 'næste på ruten', done: 'klaret', review: 'klar til at blive øvet igen', repair: 'skal rettes', open: 'klar til at starte' }[st];
    return `<li class="pn pn--${st}" style="--x:${OFF[i % OFF.length]};--i:${i}">
      ${st === 'next' ? `<span class="pn-start" aria-hidden="true">Start her</span>` : ''}
      <a class="pn-btn" href="#journey:${esc(n.sectionId)}" data-journey-sound="node" aria-label="${i + 1}. ${esc(n.title)}, ${word}">${label}</a>
      <span class="pn-title">${esc(n.title)}</span></li>`;
  }).join('');
  const review = due > 0
    ? `<a class="learn-card learn-card--review" href="#review"><div><strong>${due} ${due === 1 ? 'regel venter' : 'regler venter'} på at blive øvet igen</strong><small>Ca. ${Math.max(2, Math.ceil(due * 1.3))} min</small></div><span class="pill-btn">Øv nu</span></a>`
    : `<div class="learn-card"><div><strong>Dagens mål: ${Math.min(today, goal)}/${goal} ${goal === 1 ? 'lektion' : 'lektioner'}</strong><small>${today >= goal ? 'Nået! +1.500 Boosters er dine.' : '5 minutter holder dig på sporet.'}</small></div><span class="goal-dots" aria-hidden="true">${Array.from({ length: goal }, (_, k) => `<i class="${k < today ? 'on' : ''}"></i>`).join('')}</span></div>`;
  return `<section class="learn" aria-labelledby="learn-title">
    <a class="unit-banner" href="#theory" aria-label="Emne ${unitIndex + 1}: ${esc(unit.title)}. ${done} af ${nodes.length} lektioner klaret. Vis alle emner">
      <span class="unit-num" aria-hidden="true">${unitIndex + 1}</span>
      <span class="unit-text"><span class="unit-kicker">Emne ${unitIndex + 1} af ${units.length}</span><h1 id="learn-title">${esc(unit.title)}</h1></span>
      <span class="unit-all" aria-hidden="true"><span class="unit-all-label">Alle emner</span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m10 8 4 4-4 4"/></svg></span>
      <span class="unit-road" aria-hidden="true">${nodes.map(n => `<i${n.lessonComplete ? ' class="on"' : ''}></i>`).join('')}<b class="unit-count">${done}/${nodes.length}</b></span></a>
    <div class="learn-path-wrap"><span class="learn-poster-word" aria-hidden="true">${esc(unit.title)}</span><div class="learn-guide" aria-hidden="true"></div><ol class="learn-path">${path}</ol></div>
    ${review}
  </section>`;
}

/* ---------------- Øv: everything to practise in one place ---------------- */
export function renderPractice(data) {
  return renderPracticeTabs(data);
}

/* ---------------- Missioner: pick what to practise ---------------- */
export function renderMissions({ missions, chapters, practised, due }) {
  const steps = ['Se situationen', 'Vælg dit svar', 'Forstå reglen', 'Hvad husker du?'].map((s, i) => `<li><b>${i + 1}</b>${s}</li>`).join('');
  const featured = missions.map(m => `<a class="feature-card" href="#mission:${esc(m.section)}"><span class="feature-ico" style="--c:${m.tint}">${ico(m.icon)}</span>
      <span class="feature-tag">${esc(m.tag)}</span><strong>${esc(m.title)}</strong><small>${esc(m.description)}</small><span class="feature-meta">3 situationer + husketjek</span></a>`).join('');
  const rows = chapters.map((c, i) => {
    const total = c.sections.length, done = c.sections.filter(s => practised(s.id)).length;
    return `<li class="topic ${done === total ? 'is-done' : ''}"><a href="#mission:${esc(c.sections[0].id)}"><span class="topic-n">${i + 1}</span><div><strong>${esc(c.title)}</strong><span class="topic-bar"><i style="--p:${total ? done / total : 0}"></i></span><small>${esc(c.tagline)} <span class="tb-stripes" aria-hidden="true"></span> ${done}/${total} øvet</small></div></a><a class="topic-cards topic-cards--go" href="#mission:${esc(c.sections[0].id)}" aria-label="Øv ${esc(c.title)}">Øv</a></li>`;
  }).join('');
  return `<section class="missions" aria-labelledby="missions-title"><header class="screen-head"><a class="back-round" href="#practice" aria-label="Tilbage til Øvelser">${ICON.back}</a><h1 id="missions-title">Hvad vil du øve?</h1></header>
    <div class="mission-intro">${renderCast('sneglen', { size: 'sm', priority: true })}<div><strong>Korte runder. Regler, der sidder.</strong><small>Tre situationer, og til sidst „Hvad husker du?“. Forklaringen får du efter hvert svar. Det, du er usikker på, kommer igen senere. Ingen point for fart.</small></div></div>
    <ol class="mission-steps" aria-label="Sådan øver du">${steps}</ol>
    <h2 class="list-label">ANBEFALET</h2><div class="feature-grid">${featured}</div>
    <h2 class="list-label">ALLE EMNER</h2><ol class="topic-list">${rows}</ol>
    <h2 class="list-label">MERE</h2><div class="row-list">
      <a class="row-card" href="#review"><span class="row-ico" style="--c:#F4F5F7">${ico('repeat')}</span><div><strong>Mine gentagelser</strong><small>${due ? `${due} ${due === 1 ? 'regel venter' : 'regler venter'} på at blive øvet igen` : 'Ingen regler venter endnu. Tag en lektion, så samler vi dem her.'}</small></div><span class="row-go" aria-hidden="true">${ICON.chev}</span></a>
      <a class="row-card" href="#drive"><span class="row-ico" style="--c:#FFD60A">${ico('gauge')}</span><div><strong>Gas og bremse</strong><small>Mærk vejen: tre situationer i byen</small></div><span class="row-go" aria-hidden="true">${ICON.chev}</span></a>
    </div></section>`;
}

/* ---------------- Prøve: start + your history ---------------- */
function when(at, now = Date.now()) {
  const d = new Date(at), n = new Date(now), day = 864e5;
  const diff = Math.floor((new Date(n.toDateString()) - new Date(d.toDateString())) / day);
  if (diff <= 0) return 'I dag'; if (diff === 1) return 'I går';
  if (diff < 7) return d.toLocaleDateString('da-DK', { weekday: 'long' }).replace(/^./, c => c.toUpperCase());
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}
/** where the learner stands, as the manual's three-step traffic light: red not started, amber under way, green ready */
function examSignal(history, limit) {
  const last = history.at(-1);
  const [light, still, title, line] = !last ? [1, 'red', 'Ikke startet endnu','Tag din første øveprøve, så ved du, hvor du står.']
    : last.errors <= limit ? [3, 'green', 'Klar', `Godt kørt! ${last.errors} fejl, og grænsen er ${limit}.`]
    : [4, 'yellow', 'På vej', `Din seneste prøve havde ${last.errors} fejl. Grænsen er ${limit}. Øv videre, så sidder reglerne.`];
  return `<div class="exam-signal exam-signal--${still}"><span class="exam-signal-light" data-rive="signal:${light}"><img src="assets/traffic/${still}.webp" alt="" decoding="async"></span><div><span class="exam-signal-kicker">Din status</span><strong>${title}</strong><small>${line}</small></div></div>`;
}
export function renderExamStart({ history, saved, total = 25, minutes = 25, limit = 5, sourcesHtml = '', extraHtml = '' }) {
  const rows = [...history].reverse().slice(0, 8).map(h => {
    const ok = h.errors <= limit, near = !ok && h.errors <= limit + 3;
    return `<li class="exam-row ${ok ? 'is-ok' : near ? 'is-near' : 'is-off'}"><span class="exam-badge">${h.errors}</span><div><strong>${ok ? 'Inden for grænsen' : near ? 'Tæt på grænsen' : 'Øv videre'}</strong><small>${when(h.at)} <span class="tb-stripes" aria-hidden="true"></span> ${Math.max(0, (h.ids?.length || total) - h.errors)} rigtige</small></div></li>`;
  }).join('');
  return `<section class="exam-start" aria-labelledby="exam-title">
    <div class="road-poster"><span class="road-poster-band" aria-hidden="true" data-rive="road"><img class="road-poster-car" src="assets/road/smallcar-top.webp" alt="" decoding="async"></span><p class="road-poster-words"><span>Retning</span> <span class="road-poster-mark">er vigtigere</span> <span>end fart.</span></p></div>
    ${examSignal(history, limit)}
    <div class="exam-talk">${renderCast('daek', { size: 'sm', priority: true })}<p class="talk-bubble"><span class="cast-name">Dæk</span>Ro på. ${total} situationer, én ad gangen.</p></div>
    <h1 id="exam-title" class="sr-only">Øveprøve</h1>
    <div class="exam-facts"><div><b>${total}</b><small>situationer</small></div><div><b>${minutes} min</b><small>tid</small></div><div><b>≤ ${limit}</b><small>fejl</small></div></div>
    <button class="big-btn" data-action="start-exam">Start øveprøve</button>
    ${saved ? '<button class="big-btn big-btn--ghost" data-action="resume-exam">Fortsæt din gemte prøve</button>' : ''}
    ${extraHtml}
    <h2 class="list-label">DINE PRØVER</h2>
    ${rows ? `<ol class="exam-list">${rows}</ol>` : '<p class="empty-note">Ingen prøver endnu. Tag din første øveprøve, så ser du den her.</p>'}
    <details class="fine-details"><summary>Sådan bedømmer vi</summary><p>Hver situation har fire udsagn, du svarer ja eller nej til. Én forkert eller ubesvaret vurdering tæller som én fejl. Formatet bygger på myndighedens offentlige oplysninger. Scener, spørgsmål og bedømmelse er vores egne. Det er en øvebedømmelse, ikke en garanti.</p>${sourcesHtml}</details>
  </section>`;
}

/* ---------------- Alle emner (Atlas) ---------------- */
export function renderTopics({ units, chapters, activeUnitId }) {
  const items = units.map((u, i) => {
    const nodes = u.nodes || [], done = nodes.filter(n => n.lessonComplete).length, p = nodes.length ? done / nodes.length : 0;
    const ch = chapters.find(c => c.id === u.id);
    return `<li class="topic ${u.id === activeUnitId ? 'is-active' : ''} ${p === 1 ? 'is-done' : ''}"><a href="#home:${esc(u.id)}" data-journey-sound="node"><span class="topic-n">${i + 1}</span><div><strong>${esc(u.title)}</strong><span class="topic-bar"><i style="--p:${p}"></i></span><small>${done}/${nodes.length} lektioner${ch ? ` <span class="tb-stripes" aria-hidden="true"></span> <span class="topic-read">${ch.sections.length} regelkort</span>` : ''}</small></div></a>${ch ? `<a class="topic-cards" href="#chapter:${esc(ch.id)}" aria-label="Læs regelkortene for ${esc(u.title)}">Læs</a>` : ''}</li>`;
  }).join('');
  return `<section class="topics" aria-labelledby="topics-title"><header class="screen-head"><a class="back-round" href="#home" aria-label="Tilbage til din rute">${ICON.back}</a><h1 id="topics-title">Alle emner</h1></header>
    <div class="search-box">${'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'}<input id="theory-search" type="search" autocomplete="off" placeholder="Søg fx STOP, vigepligt eller dæk" aria-label="Søg i alle regelkort"></div>
    <div id="theory-results"><ol class="topic-list">${items}</ol></div></section>`;
}

/* ---------------- Profil ---------------- */
const WHEN_TEXT = { '2w': 'Inden for 2 uger', '1m': 'Om ca. 1 måned', '3m': 'Om 2–3 måneder', '?': 'Ingen dato endnu' };
// Google's own "G" (their sign-in button guidelines ask for it) and a line envelope
const GOOGLE_G = '<svg class="acc-g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
const MAIL = '<svg class="acc-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7.5 8 6 8-6"/></svg>';

/** "Gem din fremgang" / "Din konto" on the profile. Empty while login is not set up. */
export function renderAccountPanel(s) {
  if (!s || s.state === 'off') return '';
  const err = s.error ? `<p class="acc-error" role="alert">${esc(s.error)}</p>` : '';
  if (s.state === 'user') {
    const synced = s.syncing ? 'Gemmer din fremgang … <span class="tb-stripes" aria-hidden="true"></span>' : s.syncedAt ? `Gemt i din konto kl. ${new Date(s.syncedAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}` : 'Forbinder til din konto … <span class="tb-stripes" aria-hidden="true"></span>';
    const confirm = s.ui === 'signout'
      ? `<div class="acc-confirm"><p>Din fremgang ligger stadig i kontoen. Den fjernes fra denne enhed.</p><div class="acc-actions"><button type="button" class="big-btn" data-account="signout-yes"${s.busy ? ' disabled' : ''}>Ja, log ud</button><button type="button" class="big-btn big-btn--ghost" data-account="cancel">Fortryd</button></div></div>`
      : s.ui === 'delete'
        ? `<div class="acc-confirm acc-confirm--danger"><p>Din konto og al gemt fremgang slettes for altid, også på denne enhed.</p><div class="acc-actions"><button type="button" class="big-btn acc-danger" data-account="delete-yes"${s.busy ? ' disabled' : ''}>Slet for altid</button><button type="button" class="big-btn big-btn--ghost" data-account="cancel">Fortryd</button></div></div>`
        : `<div class="acc-links"><button type="button" class="acc-link" data-account="signout">Log ud</button><button type="button" class="acc-link acc-link--danger" data-account="delete">Slet konto</button></div>`;
    return renderAccountCard({state:s,syncedMarkup:synced,errorMarkup:err,actionsMarkup:confirm,googleG:GOOGLE_G});
  }
  return `<section class="panel account-panel" aria-labelledby="acc-title"><h2 id="acc-title">Gem din fremgang</h2>
    <p class="acc-lead">Lige nu er din fremgang kun på denne enhed. Log ind, så kan du bruge appen på både telefon og computer.</p>${renderAccountActions(s)}
    <p class="acc-fine">Når du logger ind, gemmes din fremgang i din konto på Googles servere i EU. Chatten gemmes kun på enheden. Dine spørgsmål sendes til vores AI-tjeneste for at få svar.</p></section>`;
}

/** The sign-in buttons and e-mail form on their own: the profile panel, the intro's last step and the login gate share them. */
export function renderAccountActions(s) {
  if (!s || s.state === 'off' || s.state === 'user') return '';
  const err = s.error ? `<p class="acc-error" role="alert">${esc(s.error)}</p>` : '';
  const body = s.state === 'loading' ? '<p class="acc-sync">Forbinder til din konto … <span class="tb-stripes" aria-hidden="true"></span></p>'
    : s.ui === 'sent' ? `<p class="acc-note" role="status">Tjek din indbakke. Linket til at logge ind er sendt til <b>${esc(s.sentTo)}</b>. Åbn det på denne enhed.</p><button type="button" class="acc-link" data-account="email">Send et nyt link</button>`
    : s.ui === 'email' || s.ui === 'finish'
      ? `<form class="acc-form" data-account-form="${s.ui === 'finish' ? 'finish' : 'send'}" novalidate><label for="acc-email">${s.ui === 'finish' ? 'Skriv den e-mail, du fik linket på' : 'Din e-mail'}</label>
          <div class="acc-row"><input id="acc-email" name="email" type="email" autocomplete="email" inputmode="email" required placeholder="navn@eksempel.dk"><button type="submit" class="big-btn"${s.busy ? ' disabled' : ''}>${s.ui === 'finish' ? 'Log ind' : 'Send link'}</button></div>
          ${s.ui === 'email' ? '<button type="button" class="acc-link" data-account="cancel">Fortryd</button>' : ''}</form>`
      : `<div class="acc-actions acc-actions--stack"><button type="button" class="big-btn big-btn--ghost acc-google" data-account="google">${GOOGLE_G}<span>Fortsæt med Google</span></button><button type="button" class="big-btn big-btn--ghost" data-account="email">${MAIL}<span>Log ind med et link på e-mail</span></button></div>`;
  return err + body;
}

/** Din profil: pick your profile picture */
function avatarPicker() {
  const now = avatarPref();
  return `<div class="panel avatar-panel"><h2 id="avatar-title">Dit profilbillede</h2><div class="avatar-pick" role="radiogroup" aria-labelledby="avatar-title">${AVATARS.map(([id, name]) =>
    `<button type="button" role="radio" class="avatar-opt${id === now ? ' is-on' : ''}" data-avatar="${id}" aria-checked="${id === now}"><img src="assets/nav/profile-${id}.webp" alt="" decoding="async"><span>${esc(name)}</span></button>`).join('')}</div></div>`;
}
/** De tre afsnit, flest svarer forkert i ved den digitale teoriprøve, og hvor mange af elevens regelkort i dem der sidder. */
function hardAfsnit(list) {
  if (!list?.length) return '';
  return `<div class="hard-afsnit"><h3>Prøvens svære afsnit</h3><ul>${list.map(a => `<li><span><b>Afsnit ${a.nr}</b> ${a.name}</span><small>${a.ok} af ${a.total} regelkort sidder · ${a.correct} % svarer rigtigt ved prøven</small><span class="ready-bar" role="img" aria-label="${a.ok} af ${a.total} regelkort sidder"><i style="--p:${a.total ? a.ok / a.total : 0}"></i></span></li>`).join('')}</ul>
    <p class="hard-afsnit-note">Andel rigtige svar ved den digitale teoriprøve fra januar 2024 på 15 prøvesteder (Færdselsstyrelsen, 29. april 2025). Øv tager afsnit 1 og 8 først.</p></div>`;
}
export function renderProfile({ daily, lessonsDone, lessonsTotal, strengths, intro, settings, examDays, ready, account }) {
  const week = (daily?.week || []).map(d => `<li class="${d.completed ? 'on' : ''} ${d.today ? 'today' : ''}"><small>${['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'][(new Date(d.day + 'T12:00').getDay() + 6) % 7]}</small><i role="img" aria-label="${d.completed ? 'øvet' : 'ikke øvet'}${d.today ? ', i dag' : ''}"></i></li>`).join('');
  const bars = strengths.length
    ? strengths.map(s => `<li><span>${esc(s.title)}</span><span class="sw-bar ${s.score >= .6 ? 'good' : 'weak'}"><i style="--p:${s.score.toFixed(2)}"></i></span></li>`).join('')
    : '<li class="empty-note">Ingen styrker eller svagheder endnu. Øv et par emner først.</li>';
  const toggle = (key, title) => `<label class="set-row"><span>${title}</span><input type="checkbox" role="switch" data-setting="${key}" ${(key === 'haptics' ? settings[key] !== false : settings[key]) ? 'checked' : ''}><i aria-hidden="true"></i></label>`;
  return `<section class="profile" aria-labelledby="profile-title"><header class="screen-head"><a class="back-round" href="#home" aria-label="Tilbage">${ICON.back}</a><h1 id="profile-title">Din profil</h1></header>
    ${avatarPicker()}
    <a class="panel team-link" href="#hold"><img src="assets/nav/car.webp" alt="" decoding="async"><span><strong>Dit hold</strong><small>Kør om kap med din køreskole eller dine venner, og få ekstra Boosters.</small></span></a>
    ${renderAccountPanel(account)}
    <div class="tile-row"><div class="tile"><b class="tile-fire"><span class="chip-ico" data-rive="flame:${flameLevel(daily?.currentStreak || 0)}">${flameArt(flameLevel(daily?.currentStreak || 0))}</span>${daily?.currentStreak || 0}</b><small>${daily?.currentStreak === 1 ? 'dag' : 'dage'} i træk</small></div><div class="tile"><b>${lessonsDone}/${lessonsTotal}</b><small>lektioner</small></div></div>
    ${ready ? `<div class="panel ready-panel"><h2>Hvor klar er du?</h2><div class="ready-row"><span class="ready-gauge" data-rive="gauge:${ready.pct}" aria-hidden="true"></span>${ready.pct > 0 && ready.pct < 10 ? '<b class="ready-early">Lige startet</b>' : `<b>${ready.pct} %</b>`}<span class="ready-bar" role="img" aria-label="${ready.pct} procent klar"><i style="--p:${ready.pct / 100}"></i></span></div>
      <p>${ready.ok} af ${ready.total} regelkort sidder: dit seneste svar på dem var rigtigt. ${ready.passes >= 2 ? 'Og mindst 2 af dine 3 seneste øveprøver er bestået.' : 'Få 2 af dine 3 seneste øveprøver bestået, så er du også klar til prøveformatet.'}</p><small>Appens egen vurdering, ikke en garanti for den rigtige prøve.</small>${hardAfsnit(ready.afsnit)}</div>` : ''}
    <div class="panel"><h2>Denne uge</h2><ol class="week">${week}</ol></div>
    <div class="panel"><h2>Styrker og svagheder</h2><ul class="sw">${bars}</ul></div>
    <a class="set-row set-row--link" href="#start:1"><span>Prøvedato</span><small>${esc(WHEN_TEXT[intro?.when] || 'Vælg')}${examDays !== null ? ` <span class="tb-stripes" aria-hidden="true"></span> ${examDays} dage` : ''}</small></a>
    ${toggle('sound', 'Lyd og oplæsning')}${toggle('haptics', 'Vibration')}${toggle('humor', 'Humor i forklaringer')}${toggle('motion', 'Bevægelse og animationer')}
    <a class="set-row set-row--link" href="#sytten"><span>Kørekort som 17-årig</span></a>
    <a class="set-row set-row--link" href="#start"><span>Se introen og opstarten igen</span></a>
    <button class="set-row set-row--link" type="button" data-action="tour"><span>Vis rundvisning med Sneglen</span></button>
    <div class="set-row set-row--theme" role="radiogroup" aria-labelledby="theme-label"><span id="theme-label">Udseende</span><span class="seg">${THEME_CHOICES.map(([v, label]) => `<label><input type="radio" name="theme" value="${v}" ${themePref() === v ? 'checked' : ''}><span>${label}</span></label>`).join('')}</span></div>
    <h2 class="list-label">Privatliv og vilkår</h2>
    <a class="set-row set-row--link" href="https://teoriboost.dk/privatliv/" rel="noopener noreferrer"><span>Privatlivspolitik</span></a>
    <a class="set-row set-row--link" href="https://teoriboost.dk/cookies/" rel="noopener noreferrer"><span>Cookiepolitik</span></a>
    <a class="set-row set-row--link" href="https://teoriboost.dk/vilkaar/" rel="noopener noreferrer"><span>Vilkår for TeoriBoost</span></a>
    <a class="set-row set-row--link" href="https://teoriboost.dk/spoerg-ai/" rel="noopener noreferrer"><span>Om Spørg AI</span></a>
    <a class="set-row set-row--link" href="#progress"><span>Dine prøver og vurderinger</span><small>${ICON.chev}</small></a>
    <a class="set-row set-row--link" href="#start"><span>Se introen igen</span><small>${ICON.chev}</small></a>
    <button class="set-row set-row--link" data-action="sources"><span>Kilder og faglig status</span><small>${ICON.chev}</small></button>
  </section>`;
}
