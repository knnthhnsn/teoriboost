import { renderArt } from './art.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const icon = name => ({
  arrow: '<span aria-hidden="true">↗</span>',
  check: '<span aria-hidden="true">✓</span>',
  dot: '<span aria-hidden="true">•</span>'
}[name] || '');

function nodeLabel(node) {
  if (node?.status === 'needs-repair') return `Reparér ${node.title}`;
  if (node?.status === 'needs-practice') return `Gentag ${node.title}`;
  if (node?.status === 'review-due') return `Gentag ${node.title}`;
  if (node?.lessonComplete) return `Øv ${node.title} igen`;
  return `Start ${node?.title || 'næste lektion'}`;
}

function recommendationWhy(node) {
  if (node?.status === 'needs-repair') return 'fordi du har en fejl at reparere';
  if (node?.status === 'needs-practice') return 'fordi din reparation skal gentages senere';
  if (node?.status === 'review-due') return 'fordi reglen er klar til gentagelse';
  return 'fordi det er næste nye regel på ruten';
}

function nodeStatus(node) {
  if (node?.status === 'needs-repair') return 'Kræver reparation';
  if (node?.status === 'needs-practice') return 'Gentag efter reparation';
  if (node?.status === 'review-due') return 'Gentag nu';
  if (node?.lessonComplete && node?.questionIds?.length === 1) return 'Øvet · ét prøvebillede';
  if (node?.lessonComplete) return node.longTermMastery?.durable ? 'Gentaget over tid' : 'Øvet';
  return 'Næste stop';
}

function routeNode(node, active = false) {
  const label = `${escape(node.title)} — ${nodeStatus(node)}`;
  return `<a class="journey-node journey-node--${escape(node.status || 'ready')} ${active ? 'journey-node--active' : ''}" href="#journey:${escape(node.sectionId)}" aria-label="${label}"${active ? ' aria-current="step"' : ''}>
    <span class="journey-node__ring"><span>${node.lessonComplete ? icon('check') : escape(String((node.routeIndex ?? 0) + 1).padStart(2, '0'))}</span></span>
    <span class="journey-node__copy"><strong>${escape(node.title)}</strong><small>${escape(nodeStatus(node))}</small></span>
  </a>`;
}

function unitSelector(units, activeUnitId) {
  return `<nav class="journey-units" aria-label="Vælg blandt 10 emner"><label class="journey-unit-label" for="journey-unit-select">Vælg blandt 10 emner</label><select id="journey-unit-select" class="journey-unit-select" data-journey-unit aria-label="Vælg blandt 10 emner">${units.map(unit => `<option value="${escape(unit.id)}"${unit.id === activeUnitId ? ' selected' : ''}>${escape(String(unit.chapterIndex + 1).padStart(2, '0'))} · ${escape(unit.title)}</option>`).join('')}</select></nav>`;
}

function weekCalendar(daily) {
  return `<div class="journey-week" aria-label="Din syv-dages øvekalender">${(daily?.week || []).map(day => {
    const date = escape(day.day?.slice(-2) || '');
    const state = day.completed ? 'journey-day--done' : day.today ? 'journey-day--today' : '';
    return `<span class="journey-day ${state}"${day.today ? ' aria-current="date"' : ''}><small>${escape(new Intl.DateTimeFormat('da-DK', { weekday: 'short' }).format(new Date(`${day.day}T12:00:00`)).slice(0, 2))}</small><b>${date}</b></span>`;
  }).join('')}</div>`;
}

function dailyPanel(daily) {
  const goal = Number(daily?.dailyGoal) || 1;
  const done = Number(daily?.completedSessions) || 0;
  const quests = daily?.quests || {};
  const quest = (key, title) => {
    const item = quests[key] || { progress: 0, target: 1, complete: false };
    return `<li class="journey-quest ${item.complete ? 'journey-quest--done' : ''}"><span>${item.complete ? icon('check') : icon('dot')}</span><span>${escape(title)}</span><b>${escape(String(Math.min(item.progress || 0, item.target || 1)))}/${escape(String(item.target || 1))}</b></li>`;
  };
  return `<section class="journey-daily" aria-labelledby="journey-daily-title"><div class="journey-panel-head"><div><span class="journey-kicker">I DAG</span><h2 id="journey-daily-title">Hold rytmen roligt.</h2></div><strong class="journey-streak"><span aria-hidden="true">✦</span> ${escape(String(daily?.currentStreak || 0))}<small> ${Number(daily?.currentStreak) === 1 ? 'dag' : 'dage'}</small></strong></div>
    <div class="journey-goals" role="group" aria-label="Vælg antal øvesessioner pr. dag">${[1, 2, 3].map(value => `<button type="button" class="journey-goal ${value === goal ? 'journey-goal--active' : ''}" data-journey-goal="${value}" aria-pressed="${value === goal}">${value}<small>${value === 1 ? 'øvesession' : 'øvesessioner'}</small></button>`).join('')}</div>
    <p class="journey-daily-copy"><strong>${escape(String(done))}/${escape(String(goal))}</strong> øvesessioner i dag · én session er nok til at holde din række i gang.</p>${weekCalendar(daily)}
    <ul class="journey-quests" aria-label="Dagens quests">${quest('lesson', 'Gennemfør en lektion')}${quest('delayedReview', 'Gentag med lidt afstand')}${quest('repair', 'Reparér en fejl')}</ul>
  </section>`;
}

function quickLinks() {
  return `<nav class="journey-links" aria-label="Flere øveveje"><a href="#judge"><span class="journey-link-icon">◉</span><span><strong>Beslutningskørsel</strong><small>Læs vejen. Vælg roligt.</small></span>${icon('arrow')}</a><a href="#theory"><span class="journey-link-icon">▤</span><span><strong>Teoriatlas</strong><small>Find reglen bag situationen.</small></span>${icon('arrow')}</a><a href="#garage"><span class="journey-link-icon">⌂</span><span><strong>Garagen</strong><small>Se bilen før turen.</small></span>${icon('arrow')}</a><a href="#exam"><span class="journey-link-icon">✓</span><span><strong>Øveprøve</strong><small>Prøv formatet i ro.</small></span>${icon('arrow')}</a></nav>`;
}

function path(units, activeUnitId, activeNodeId) {
  const unit = units.find(item => item.id === activeUnitId) || units[0];
  if (!unit) return '<p class="journey-empty">Ruten er ikke klar endnu.</p>';
  return `<section class="journey-path" aria-labelledby="journey-path-title"><div class="journey-path-head"><div><span class="journey-kicker">${escape(String(unit.chapterIndex + 1).padStart(2, '0'))} / EMNE</span><h2 id="journey-path-title">${escape(unit.title)}</h2><p>${escape(unit.tagline || 'En kort strækning ad gangen.')}</p></div><span class="journey-path-count">${unit.nodes.filter(node => node.lessonComplete).length}/${unit.nodes.length} øvet</span></div><div class="journey-road" role="list">${unit.nodes.map(node => `<div role="listitem">${routeNode(node, node.id === activeNodeId)}</div>`).join('')}</div></section>`;
}

export function renderJourneyHome({ units = [], daily = {}, recommendations = {}, humor = true, activeUnitId } = {}) {
  const next = recommendations?.recommended || recommendations?.next || units.flatMap(unit => unit.nodes || [])[0];
  const recommendationUnit = next ? units.find(unit => (unit.nodes || []).some(node => node.id === next.id || node.sectionId === next.sectionId)) : null;
  const selected = activeUnitId || recommendationUnit?.id || units[0]?.id;
  const nextHref = next ? `#journey:${escape(next.sectionId)}` : '#theory';
  const humorArt = humor ? renderArt('koerelys-brain', { variant: 'hero', humorOnly: true }) : '';
  return `<div class="journey-shell journey-home">
    <header class="journey-hero"><div class="journey-hero-copy"><span class="journey-kicker">NATKØRSEL / DIN LÆRINGSRUTE</span><h1>Én beslutning<br><em>ad gangen.</em></h1><p>Se situationen. Vælg dit næste træk. Gentag reglen, så den kan sidde fast over tid.</p><a class="journey-cta" href="${nextHref}">${escape(next ? nodeLabel(next) : 'Åbn teorien')} ${icon('arrow')}</a>${next ? `<small class="journey-hero-reason">${escape(recommendationWhy(next))}</small>` : ''}<small class="journey-hero-note">Ingen point for fart · alle øveveje er åbne</small></div><div class="journey-night-road" aria-hidden="true"><span class="journey-lamp journey-lamp--one"></span><span class="journey-lamp journey-lamp--two"></span><span class="journey-road-line"></span><span class="journey-coordinate">56°09′ N<br>10°12′ E</span>${humorArt}</div></header>
    <div class="journey-main-grid"><div>${unitSelector(units, selected)}${path(units, selected, next?.sectionId)}</div><aside>${dailyPanel(daily)}${quickLinks()}</aside></div>
  </div>`;
}

export function renderJourneyProgress({ units = [], daily = {}, recommendations = {}, humor = true, activeUnitId } = {}) {
  const completed = units.flatMap(unit => unit.nodes || []).filter(node => node.lessonComplete).length;
  const total = units.flatMap(unit => unit.nodes || []).length;
  return `<div class="journey-shell journey-progress"><header class="journey-progress-head"><div><span class="journey-kicker">DIN FREMDRIFT</span><h1>Ruten bliver<br><em>mere din.</em></h1><p>${escape(String(completed))} af ${escape(String(total))} regelkort er øvet. Hold øje med det, du kan hente frem igen.</p></div>${humor ? renderArt('natmobil', { variant: 'garage', humorOnly: true }) : ''}</header>${renderJourneyHome({ units, daily, recommendations, humor: false, activeUnitId })}</div>`;
}
