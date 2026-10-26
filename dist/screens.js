// The four tabs (Lær, Øv, Prøve, Min bil) plus Alle emner and Profil, after docs/redesign/mockups-v3.
// Short, game-like screens built around one next action. Data comes in from app.js; nothing here mutates state.
import { SEQUENCES } from './sequences.js';
import { ico, flameArt, flameLevel, AVATARS, avatarPref } from './ui-icons.js';
import { renderMirrorHero } from './mirror-hero.js';
import { themePref, THEME_CHOICES } from './theme.js';
import { renderCast } from './cast.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = n => Number(n).toLocaleString('da-DK');
const ICON = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4"/></svg>',
  fix: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v6M12 17h.01"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
};

/* ---------------- Lær: the path ---------------- */
const WHEN_DAYS = { '2w': 14, '1m': 30, '3m': 75 };
export function examCountdown(intro, now = Date.now()) {
  const total = WHEN_DAYS[intro?.when]; if (!total || !intro.whenAt) return null;
  return Math.max(0, total - Math.floor((now - intro.whenAt) / 864e5));
}
function nodeState(node, nextId) {
  if (node.id === nextId) return 'next';
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
  const streak = Number(vm.daily?.currentStreak) || 0;
  const days = examCountdown(intro);
  const goal = Number(vm.daily?.dailyGoal) || 1, today = Number(vm.daily?.completedSessions) || 0;
  const OFF = [0, 0.9, 1.3, 0.8, -0.1, -0.9, -1.2, -0.6]; // snakes right first, so the guide on the left never covers a node
  const path = nodes.map((n, i) => {
    const st = nodeState(n, nextInUnit?.id), label = st === 'done' ? ICON.check : st === 'review' ? ICON.repeat : st === 'repair' ? ICON.fix : String(i + 1);
    const word = { next: 'næste lektion', done: 'gennemført', review: 'klar til gentagelse', repair: 'skal repareres', open: 'åben' }[st];
    return `<li class="pn pn--${st}" style="--x:${OFF[i % OFF.length]};--i:${i}">
      ${st === 'next' ? `<span class="pn-start" aria-hidden="true">Start!</span>` : ''}
      <a class="pn-btn" href="#journey:${esc(n.sectionId)}" data-journey-sound="node" aria-label="${i + 1}. ${esc(n.title)}, ${word}">${label}</a>
      <span class="pn-title">${esc(n.title)}</span></li>`;
  }).join('');
  const review = due > 0
    ? `<a class="learn-card learn-card--review" href="#review"><div><strong>${due} ${due === 1 ? 'regel er' : 'regler er'} klar til gentagelse</strong><small>Tager ca. ${Math.max(2, Math.ceil(due * 1.3))} min</small></div><span class="pill-btn">Gentag</span></a>`
    : `<div class="learn-card"><div><strong>Dagens mål: ${Math.min(today, goal)}/${goal} ${goal === 1 ? 'lektion' : 'lektioner'}</strong><small>${today >= goal ? 'Nået. +1.500 Boosters er dine.' : 'Næste lektion tager ca. 5 min.'}</small></div><span class="goal-dots" aria-hidden="true">${Array.from({ length: goal }, (_, k) => `<i class="${k < today ? 'on' : ''}"></i>`).join('')}</span></div>`;
  return `${renderMirrorHero({ streak, days, goal, today, pct: ready?.pct || 0 })}<div id="road-slot" class="road-top"></div><section class="learn" aria-labelledby="learn-title">
    <a class="unit-banner" href="#theory" aria-label="Emne ${unitIndex + 1}: ${esc(unit.title)}. ${done} af ${nodes.length} lektioner. Se alle emner">
      <span class="unit-num" aria-hidden="true">${unitIndex + 1}</span>
      <span class="unit-text"><span class="unit-kicker">Emne ${unitIndex + 1} af ${units.length}</span><h1 id="learn-title">${esc(unit.title)}</h1></span>
      <span class="unit-all" aria-hidden="true"><span class="unit-all-label">Alle emner</span><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></span>
      <span class="unit-road" aria-hidden="true">${nodes.map(n => `<i${n.lessonComplete ? ' class="on"' : ''}></i>`).join('')}<b class="unit-count">${done}/${nodes.length}</b></span></a>
    <div class="learn-path-wrap"><span class="learn-poster-word" aria-hidden="true">${esc(unit.title)}</span><div class="learn-guide" aria-hidden="true">${renderCast(done ? 'sneglen' : 'krabbe', { size: 'sm', priority: true })}</div><ol class="learn-path">${path}</ol></div>
    ${review}
  </section>`;
}

/* ---------------- Øv: everything to practise in one place ---------------- */
export function renderPractice({ weak, due, missions }) {
  const names = weak.slice(0, 3).map(w => esc(w.title)).join(' · ');
  // the hero is the traffic light: red with many weak rules, amber with a few, green with none
  const [light, still, kicker, title, line, go] = weak.length >= 5 ? [1, 'red', 'Stop op', `Gentag ${weak.length} svage regler`, names, 'Start gentagelsen']
    : weak.length ? [4, 'yellow', 'Pas på', `Gentag ${weak.length} ${weak.length === 1 ? 'svag regel' : 'svage regler'}`, names, 'Start gentagelsen']
    : [3, 'green', 'Kør', 'Ingen svage regler lige nu', `Tag 3 blandede situationer og hold dem varme${due ? ` · ${due} klar` : ''}`, 'Tag 3 situationer'];
  const hero = `<a class="practice-signal practice-signal--${still}" href="#review"><div class="practice-signal-copy"><span class="practice-signal-kicker">${kicker}</span><strong>${title}</strong><small>${line}</small><span class="practice-signal-go">${go}</span></div><span class="practice-signal-light" data-rive="signal:${light}"><img src="assets/traffic/${still}.webp" alt="" decoding="async"></span></a>`;
  const miss = missions.map(m => `<a class="row-card" href="#mission:${esc(m.section)}"><span class="row-ico" style="--c:${m.tint}">${ico(m.icon)}</span><div><strong>${esc(m.title)}</strong><small>3 situationer + genkaldelse</small></div><span class="row-go" aria-hidden="true">${ICON.chev}</span></a>`).join('');
  const games = [['#judge', 'Du er kørelæreren', 'Find fejlen i en elevs kørsel', 'clipboard'], ['#trafiklab', 'Trafiklab', 'Et blink. To baner.', 'light'], ['#drive', 'Gas og bremse', 'Tre situationer, træn timing', 'gauge']]
    .map(([h, t, d, e]) => `<a class="game-card" href="${h}"><span class="game-ico">${ico(e)}</span><strong>${t}</strong><small>${d}</small></a>`).join('');
  return `<section class="practice" aria-labelledby="practice-title"><h1 id="practice-title" class="screen-title">Øv</h1>
    ${hero}
    <h2 class="list-label">KORTE MISSIONER</h2><div class="row-list">${miss}<a class="row-card row-card--plain" href="#missions"><div><strong>Vælg selv et emne</strong><small>Alle 10 emner, 3 situationer ad gangen</small></div><span class="row-go" aria-hidden="true">${ICON.chev}</span></a></div>
    <h2 class="list-label">RÆKKEFØLGE</h2><div class="row-list">${SEQUENCES.slice(0, 3).map(s => `<a class="row-card" href="#order:${s.id}"><span class="row-ico" style="--c:#EDE7FF">${ico('list')}</span><div><strong>${s.title}</strong><small>Sæt ${s.steps.length} trin i rækkefølge</small></div><span class="row-go" aria-hidden="true">${ICON.chev}</span></a>`).join('')}<a class="row-card row-card--plain" href="#order"><div><strong>Alle rækkefølger</strong><small>${SEQUENCES.length} procedurer fra regelkortene</small></div><span class="row-go" aria-hidden="true">${ICON.chev}</span></a></div>
    <h2 class="list-label">SPIL</h2><div class="game-grid">${games}</div></section>`;
}

/* ---------------- Missioner: pick what to practise ---------------- */
export function renderMissions({ missions, chapters, practised, due }) {
  const steps = ['Se situationen', 'Vælg dit svar', 'Forstå reglen', 'Husk den senere'].map((s, i) => `<li><b>${i + 1}</b>${s}</li>`).join('');
  const featured = missions.map(m => `<a class="feature-card" href="#mission:${esc(m.section)}"><span class="feature-ico" style="--c:${m.tint}">${ico(m.icon)}</span>
      <span class="feature-tag">${esc(m.tag)}</span><strong>${esc(m.title)}</strong><small>${esc(m.description)}</small><span class="feature-meta">3 situationer + genkaldelse</span></a>`).join('');
  const rows = chapters.map((c, i) => {
    const total = c.sections.length, done = c.sections.filter(s => practised(s.id)).length;
    return `<li class="topic ${done === total ? 'is-done' : ''}"><a href="#mission:${esc(c.sections[0].id)}"><span class="topic-n">${i + 1}</span><div><strong>${esc(c.title)}</strong><span class="topic-bar"><i style="--p:${total ? done / total : 0}"></i></span><small>${esc(c.tagline)} · ${done}/${total} øvet</small></div></a><a class="topic-cards topic-cards--go" href="#mission:${esc(c.sections[0].id)}" aria-label="Øv ${esc(c.title)}">Øv</a></li>`;
  }).join('');
  return `<section class="missions" aria-labelledby="missions-title"><header class="screen-head"><a class="back-round" href="#practice" aria-label="Tilbage til Øv">${ICON.back}</a><h1 id="missions-title">Vælg en mission</h1></header>
    <div class="mission-intro">${renderCast('blink', { size: 'sm', priority: true })}<div><strong>Korte runder. Lange eftervirkninger.</strong><small>Hver mission er tre situationer og én genkaldelse. Du får forklaringen efter hvert svar, og det, du er usikker på, kommer igen senere. Ingen point for fart.</small></div></div>
    <ol class="mission-steps" aria-label="Sådan virker en mission">${steps}</ol>
    <h2 class="list-label">ANBEFALET</h2><div class="feature-grid">${featured}</div>
    <h2 class="list-label">ALLE EMNER</h2><ol class="topic-list">${rows}</ol>
    <h2 class="list-label">MERE</h2><div class="row-list">
      <a class="row-card" href="#review"><span class="row-ico" style="--c:#EDE7FF">${ico('repeat')}</span><div><strong>Mine gentagelser</strong><small>${due ? `${due} ${due === 1 ? 'regel er' : 'regler er'} klar til at blive gentaget` : 'Ingen regler venter lige nu'}</small></div><span class="row-go" aria-hidden="true">${ICON.chev}</span></a>
      <a class="row-card" href="#drive"><span class="row-ico" style="--c:#FFF1D6">${ico('gauge')}</span><div><strong>Gas og bremse</strong><small>Mærk vejen: tre situationer i nattebyen</small></div><span class="row-go" aria-hidden="true">${ICON.chev}</span></a>
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
  const [light, still, title, line] = !last ? [1, 'red', 'Ikke startet', 'Tag din første øveprøve, så ved du, hvor du står.']
    : last.errors <= limit ? [3, 'green', 'Klar', `Din seneste prøve havde ${last.errors} fejl. Grænsen er ${limit}.`]
    : [4, 'yellow', 'I gang', `Din seneste prøve havde ${last.errors} fejl. Grænsen er ${limit}.`];
  return `<div class="exam-signal exam-signal--${still}"><span class="exam-signal-light" data-rive="signal:${light}"><img src="assets/traffic/${still}.webp" alt="" decoding="async"></span><div><span class="exam-signal-kicker">Din status</span><strong>${title}</strong><small>${line}</small></div></div>`;
}
export function renderExamStart({ history, saved, total = 25, minutes = 25, limit = 5, sourcesHtml = '' }) {
  const rows = [...history].reverse().slice(0, 8).map(h => {
    const ok = h.errors <= limit, near = !ok && h.errors <= limit + 3;
    return `<li class="exam-row ${ok ? 'is-ok' : near ? 'is-near' : 'is-off'}"><span class="exam-badge">${h.errors}</span><div><strong>${ok ? 'Inden for grænsen' : near ? 'Næsten' : 'Øv videre'}</strong><small>${when(h.at)} · ${Math.max(0, (h.ids?.length || total) - h.errors)} rigtige</small></div></li>`;
  }).join('');
  return `<section class="exam-start" aria-labelledby="exam-title">
    <div class="road-poster"><span class="road-poster-band" aria-hidden="true" data-rive="road"><img class="road-poster-car" src="assets/road/smallcar-top.webp" alt="" decoding="async"></span><p class="road-poster-words"><span>Retning</span> <span class="road-poster-mark">er vigtigere</span> <span>end fart.</span></p></div>
    ${examSignal(history, limit)}
    <div class="exam-talk">${renderCast('daek', { size: 'sm', priority: true })}<p class="talk-bubble"><span class="cast-name">Dæk</span>Ro på. ${total} situationer, én ad gangen.</p></div>
    <h1 id="exam-title" class="sr-only">Øveprøve</h1>
    <div class="exam-facts"><div><b>${total}</b><small>situationer</small></div><div><b>${minutes} min</b><small>tid</small></div><div><b>≤ ${limit}</b><small>fejl</small></div></div>
    <button class="big-btn" data-action="start-exam">Start øveprøve</button>
    ${saved ? '<button class="big-btn big-btn--ghost" data-action="resume-exam">Fortsæt din gemte prøve</button>' : ''}
    <h2 class="list-label">DINE PRØVER</h2>
    ${rows ? `<ol class="exam-list">${rows}</ol>` : '<p class="empty-note">Din første prøve dukker op her. Du kan gå tilbage, ændre svar og markere spørgsmål undervejs.</p>'}
    <details class="fine-details"><summary>Sådan bedømmer vi</summary><p>Hver situation har fire udsagn med ja eller nej. Én forkert eller ubesvaret vurdering tæller som én fejl. Formatet er baseret på myndighedens offentlige oplysninger; scener, spørgsmål og bedømmelse er vores egne, og det er en øvebedømmelse, ikke en garanti.</p>${sourcesHtml}</details>
  </section>`;
}

/* ---------------- Alle emner (Atlas) ---------------- */
export function renderTopics({ units, chapters, activeUnitId }) {
  const items = units.map((u, i) => {
    const nodes = u.nodes || [], done = nodes.filter(n => n.lessonComplete).length, p = nodes.length ? done / nodes.length : 0;
    const ch = chapters.find(c => c.id === u.id);
    return `<li class="topic ${u.id === activeUnitId ? 'is-active' : ''} ${p === 1 ? 'is-done' : ''}"><a href="#home:${esc(u.id)}" data-journey-sound="node"><span class="topic-n">${i + 1}</span><div><strong>${esc(u.title)}</strong><span class="topic-bar"><i style="--p:${p}"></i></span><small>${done}/${nodes.length} lektioner${ch ? ` · <span class="topic-read">${ch.sections.length} regelkort</span>` : ''}</small></div></a>${ch ? `<a class="topic-cards" href="#chapter:${esc(ch.id)}" aria-label="Læs regelkortene i ${esc(u.title)}">Læs</a>` : ''}</li>`;
  }).join('');
  return `<section class="topics" aria-labelledby="topics-title"><header class="screen-head"><a class="back-round" href="#home" aria-label="Tilbage til stien">${ICON.back}</a><h1 id="topics-title">Alle emner</h1></header>
    <div class="search-box">${'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'}<input id="theory-search" type="search" autocomplete="off" placeholder="Søg fx STOP, vigepligt eller dæk" aria-label="Søg i alle regelkort"></div>
    <div id="theory-results"><ol class="topic-list">${items}</ol></div></section>`;
}

/* ---------------- Profil ---------------- */
const WHEN_TEXT = { '2w': 'Inden for 2 uger', '1m': 'Om ca. 1 måned', '3m': 'Om 2–3 måneder', '?': 'Ikke valgt' };
// Google's own "G" (their sign-in button guidelines ask for it) and a line envelope
const GOOGLE_G = '<svg class="acc-g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
const MAIL = '<svg class="acc-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7.5 8 6 8-6"/></svg>';

/** "Gem din fremgang" / "Din konto" on the profile. Empty while login is not set up. */
export function renderAccountPanel(s) {
  if (!s || s.state === 'off') return '';
  const err = s.error ? `<p class="acc-error" role="alert">${esc(s.error)}</p>` : '';
  if (s.state === 'user') {
    const synced = s.syncing ? 'Gemmer …' : s.syncedAt ? `Gemt i din konto kl. ${new Date(s.syncedAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}` : 'Forbinder …';
    const confirm = s.ui === 'signout'
      ? `<div class="acc-confirm"><p>Din fremgang ligger i kontoen og fjernes fra denne enhed.</p><div class="acc-actions"><button type="button" class="big-btn" data-account="signout-yes"${s.busy ? ' disabled' : ''}>Log ud</button><button type="button" class="big-btn big-btn--ghost" data-account="cancel">Annullér</button></div></div>`
      : s.ui === 'delete'
        ? `<div class="acc-confirm acc-confirm--danger"><p>Kontoen og al gemt fremgang slettes for altid, også på denne enhed.</p><div class="acc-actions"><button type="button" class="big-btn acc-danger" data-account="delete-yes"${s.busy ? ' disabled' : ''}>Slet for altid</button><button type="button" class="big-btn big-btn--ghost" data-account="cancel">Annullér</button></div></div>`
        : `<div class="acc-links"><button type="button" class="acc-link" data-account="signout">Log ud</button><button type="button" class="acc-link acc-link--danger" data-account="delete">Slet konto</button></div>`;
    return `<section class="panel account-panel" aria-labelledby="acc-title"><h2 id="acc-title">Din konto</h2>
      <p class="acc-who"><b>${esc(s.email || 'Logget ind')}</b><small>via ${esc(s.provider || '')}</small></p>
      <p class="acc-sync" aria-live="polite">${synced}</p>${err}${confirm}</section>`;
  }
  const body = s.state === 'loading' ? '<p class="acc-sync">Forbinder …</p>'
    : s.ui === 'sent' ? `<p class="acc-note" role="status">Tjek din indbakke. Vi har sendt et login-link til <b>${esc(s.sentTo)}</b>. Åbn linket på denne enhed.</p><button type="button" class="acc-link" data-account="email">Send et nyt link</button>`
    : s.ui === 'email' || s.ui === 'finish'
      ? `<form class="acc-form" data-account-form="${s.ui === 'finish' ? 'finish' : 'send'}" novalidate><label for="acc-email">${s.ui === 'finish' ? 'Skriv den e-mail, du fik linket på' : 'Din e-mail'}</label>
          <div class="acc-row"><input id="acc-email" name="email" type="email" autocomplete="email" inputmode="email" required placeholder="navn@eksempel.dk"><button type="submit" class="big-btn"${s.busy ? ' disabled' : ''}>${s.ui === 'finish' ? 'Log ind' : 'Send link'}</button></div>
          ${s.ui === 'email' ? '<button type="button" class="acc-link" data-account="cancel">Annullér</button>' : ''}</form>`
      : `<div class="acc-actions acc-actions--stack"><button type="button" class="big-btn big-btn--ghost acc-google" data-account="google">${GOOGLE_G}<span>Fortsæt med Google</span></button><button type="button" class="big-btn big-btn--ghost" data-account="email">${MAIL}<span>Få et login-link på e-mail</span></button></div>`;
  return `<section class="panel account-panel" aria-labelledby="acc-title"><h2 id="acc-title">Gem din fremgang</h2>
    <p class="acc-lead">Lige nu gemmes alt kun på denne enhed. Log ind, så kan du fortsætte på både telefon og computer.</p>${err}${body}
    <p class="acc-fine">Logger du ind, gemmes din fremgang i din konto hos Google Firebase (database i EU). Chatten med Sneglen bliver på enheden.</p></section>`;
}

/** Din profil: pick your profile picture */
function avatarPicker() {
  const now = avatarPref();
  return `<div class="panel avatar-panel"><h2 id="avatar-title">Dit profilbillede</h2><div class="avatar-pick" role="radiogroup" aria-labelledby="avatar-title">${AVATARS.map(([id, name]) =>
    `<button type="button" role="radio" class="avatar-opt${id === now ? ' is-on' : ''}" data-avatar="${id}" aria-checked="${id === now}"><img src="assets/nav/profile-${id}.webp" alt="" decoding="async"><span>${esc(name)}</span></button>`).join('')}</div></div>`;
}
export function renderProfile({ daily, lessonsDone, lessonsTotal, strengths, intro, settings, examDays, ready, account }) {
  const week = (daily?.week || []).map(d => `<li class="${d.completed ? 'on' : ''} ${d.today ? 'today' : ''}"><small>${['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'][(new Date(d.day + 'T12:00').getDay() + 6) % 7]}</small><i role="img" aria-label="${d.completed ? 'øvet' : 'ikke øvet'}${d.today ? ', i dag' : ''}"></i></li>`).join('');
  const bars = strengths.length
    ? strengths.map(s => `<li><span>${esc(s.title)}</span><span class="sw-bar ${s.score >= .6 ? 'good' : 'weak'}"><i style="--p:${s.score.toFixed(2)}"></i></span></li>`).join('')
    : '<li class="empty-note">Kommer, når du har øvet et par emner.</li>';
  const toggle = (key, title) => `<label class="set-row"><span>${title}</span><input type="checkbox" role="switch" data-setting="${key}" ${settings[key] ? 'checked' : ''}><i aria-hidden="true"></i></label>`;
  return `<section class="profile" aria-labelledby="profile-title"><header class="screen-head"><a class="back-round" href="#home" aria-label="Tilbage">${ICON.back}</a><h1 id="profile-title">Din profil</h1></header>
    ${avatarPicker()}
    ${renderAccountPanel(account)}
    <div class="tile-row"><div class="tile"><b class="tile-fire"><span class="chip-ico" data-rive="flame:${flameLevel(daily?.currentStreak || 0)}">${flameArt(flameLevel(daily?.currentStreak || 0))}</span>${daily?.currentStreak || 0}</b><small>dage i træk</small></div><div class="tile"><b>${lessonsDone}/${lessonsTotal}</b><small>lektioner</small></div></div>
    ${ready ? `<div class="panel ready-panel"><h2>Hvor klar er du?</h2><div class="ready-row"><span class="ready-gauge" data-rive="gauge:${ready.pct}" aria-hidden="true"></span><b>${ready.pct} %</b><span class="ready-bar" role="img" aria-label="${ready.pct} procent klar"><i style="--p:${ready.pct / 100}"></i></span></div>
      <p>${ready.ok} af ${ready.total} regelkort sidder: dit seneste svar på dem var rigtigt. ${ready.passes >= 2 ? 'Og du har bestået mindst 2 af dine 3 seneste øveprøver.' : 'Bestå 2 af 3 øveprøver i træk, så er du også klar til prøveformatet.'}</p><small>Appens egen vurdering, ikke en garanti for den rigtige prøve.</small></div>` : ''}
    <div class="panel"><h2>Denne uge</h2><ol class="week">${week}</ol></div>
    <div class="panel"><h2>Styrker og svagheder</h2><ul class="sw">${bars}</ul></div>
    <a class="set-row set-row--link" href="#start:1"><span>Prøvedato</span><small>${esc(WHEN_TEXT[intro?.when] || 'Vælg')}${examDays !== null ? ` · ${examDays} dage` : ''}</small></a>
    ${toggle('sound', 'Lyd og oplæsning')}${toggle('humor', 'Humor i forklaringer')}${toggle('motion', 'Bevægelse og animationer')}
    <div class="set-row set-row--theme" role="radiogroup" aria-labelledby="theme-label"><span id="theme-label">Udseende</span><span class="seg">${THEME_CHOICES.map(([v, label]) => `<label><input type="radio" name="theme" value="${v}" ${themePref() === v ? 'checked' : ''}><span>${label}</span></label>`).join('')}</span></div>
    <a class="set-row set-row--link" href="#progress"><span>Alle vurderinger og prøver</span><small>${ICON.chev}</small></a>
    <a class="set-row set-row--link" href="#start"><span>Se introen igen</span><small>${ICON.chev}</small></a>
    <button class="set-row set-row--link" data-action="sources"><span>Kilder og faglig status</span><small>${ICON.chev}</small></button>
  </section>`;
}
