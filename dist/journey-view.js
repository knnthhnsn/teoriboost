import { flameArt, flameLevel } from './ui-icons.js';
import { renderArt } from './art.js';
import { renderCast, castLine } from './cast.js';
/** the streak flame character at the streak's level, dancing when Rive runs */
const streakFlame = streak => `<span class="streak-flame" data-rive="flame:${flameLevel(Number(streak) || 0)}">${flameArt(flameLevel(Number(streak) || 0))}</span>`;

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const svgGlyph = (path, label = '') => `<svg class="journey-glyph" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false"><path d="${path}"${label ? ` aria-label="${label}"` : ''}/></svg>`;
const icon = name => ({ arrow: svgGlyph('M6 16h18M17 8l8 8-8 8'), check: svgGlyph('M6 17l6 7L26 8'), repair: svgGlyph('M24 12a9 9 0 1 0 1 9M25 7v6h-6'), review: svgGlyph('M16 5v8l5 4') }[name] || '');
function nodeStatus(node) {
  if (node?.status === 'needs-repair') return 'Kræver reparation';
  if (node?.status === 'needs-practice') return 'Gentag efter reparation';
  if (node?.status === 'review-due') return 'Gentag nu';
  if (node?.lessonComplete && node?.questionIds?.length === 1) return 'Øvet · ét prøvebillede';
  if (node?.lessonComplete) return node.longTermMastery?.durable ? 'Gentaget over tid' : 'Øvet';
  return 'Næste stop';
}
function recommendationWhy(node) {
  if (node?.status === 'needs-repair') return 'En fejl venter på reparation.';
  if (node?.status === 'needs-practice') return 'Hent reparationen frem igen.';
  if (node?.status === 'review-due') return 'Reglen er klar til gentagelse.';
  return 'Din næste nye regel på ruten.';
}
function nodeLabel(node) {
  if (!node) return 'Åbn teorien';
  if (node.status === 'needs-repair') return `Reparér ${node.title}`;
  if (node.status === 'needs-practice' || node.status === 'review-due') return `Gentag ${node.title}`;
  if (node.lessonComplete) return `Øv ${node.title} igen`;
  return `Start ${node.title}`;
}
function unitSelector(units, activeUnitId) {
  return `<label class="journey-unit-control"><span>Emne</span><select data-journey-unit aria-label="Vælg blandt 10 emner">${units.map(unit => `<option value="${escape(unit.id)}"${unit.id === activeUnitId ? ' selected' : ''}>${escape(String(unit.chapterIndex + 1))} · ${escape(unit.title)}</option>`).join('')}</select></label>`;
}
function calendar(daily) {
  return `<div class="journey-week" aria-label="Din syv-dages øvekalender">${(daily?.week || []).map(day => { const label = escape(day.day?.slice(-2) || ''); const state = day.completed ? 'journey-day--done' : day.today ? 'journey-day--today' : ''; return `<span class="journey-day ${state}"${day.today ? ' aria-current="date"' : ''}><small>${escape(new Intl.DateTimeFormat('da-DK', { weekday: 'short' }).format(new Date(`${day.day}T12:00:00`)).slice(0, 2))}</small><b>${label}</b></span>`; }).join('')}</div>`;
}
function dailyDetails(daily) {
  const goal = Number(daily?.dailyGoal) || 1; const quests = daily?.quests || {};
  const quest = (key, title) => { const item = quests[key] || { progress: 0, target: 1, complete: false }; return `<li class="journey-quest ${item.complete ? 'journey-quest--done' : ''}"><span>${item.complete ? icon('check') : '•'}</span><span>${escape(title)}</span><b>${Math.min(item.progress || 0, item.target || 1)}/${item.target || 1}</b></li>`; };
  return `<details class="journey-details"><summary>Indstil mål og se kalender</summary><div class="journey-details-body"><div class="journey-goals" role="group" aria-label="Vælg antal øvesessioner pr. dag">${[1, 2, 3].map(value => `<button type="button" class="journey-goal ${value === goal ? 'journey-goal--active' : ''}" data-journey-goal="${value}" aria-pressed="${value === goal}">${value}<small>${value === 1 ? 'øvesession' : 'øvesessioner'}</small></button>`).join('')}</div>${calendar(daily)}<ul class="journey-quests" aria-label="Dagens små mål">${quest('lesson', 'Gennemfør en lektion')}${quest('delayedReview', 'Gentag med lidt afstand')}${quest('repair', 'Reparér en fejl')}</ul></div></details>`;
}
function moreLinks() { return `<details class="journey-details"><summary>Flere øveveje</summary><nav class="journey-links" aria-label="Flere øveveje"><a href="#trafiklab">Trafiklab: Et blink. To baner. ${icon('arrow')}</a><a href="#judge">Beslutningskørsel ${icon('arrow')}</a><a href="#theory">Teoriatlas ${icon('arrow')}</a><a href="#garage">Garagen ${icon('arrow')}</a><a href="#exam">Øveprøve ${icon('arrow')}</a></nav></details>`; }
function glyph(node, completed) { if (completed) return icon('check'); if (node.status === 'needs-repair') return icon('repair'); if (node.status === 'needs-practice' || node.status === 'review-due') return icon('review'); return escape(String((node.routeIndex ?? 0) + 1)); }
function routeNode(node, active, index, humor) {
  const completed = node.lessonComplete; const state = node.status || (completed ? 'lesson-complete' : 'ready'); const label = `${escape(node.title)} — ${nodeStatus(node)}`;
  const coach = active ? `<aside class="journey-coach" aria-label="Din næste anbefaling"><span>${escape(recommendationWhy(node))}</span></aside>` : '';
  const action = state === 'needs-repair' ? 'Reparér reglen' : ['needs-practice','review-due'].includes(state) || completed ? 'Gentag reglen' : 'Start lektionen';
  return `<div class="journey-step journey-step--${escape(state)} ${active ? 'journey-step--active' : ''}" role="listitem"><a class="journey-node" href="#journey:${escape(node.sectionId)}" aria-label="${label}"${active ? ' aria-current="step"' : ''} data-journey-sound="node"><span class="journey-node__circle">${glyph(node, completed)}</span><span class="journey-node__title"><strong>${escape(node.title)}</strong><small>${escape(active ? `Næste · ${action}` : nodeStatus(node))}</small></span></a>${coach}</div>`;
}
function path(units, activeUnitId, activeNodeId, humor) {
  const unit = units.find(item => item.id === activeUnitId) || units[0]; if (!unit) return '<p class="journey-empty">Ruten er ikke klar endnu.</p>';
  return `<section class="journey-path" aria-labelledby="journey-path-title"><header class="journey-path-head"><div><span class="journey-kicker">EMNE</span><h2 id="journey-path-title">${escape(unit.title)}</h2><p>${escape(unit.tagline || 'En kort strækning ad gangen.')}</p></div><span class="journey-path-count">${unit.nodes.filter(node => node.lessonComplete).length}/${unit.nodes.length} forløb gennemført</span></header><div class="journey-road" role="list">${unit.nodes.map((node, index) => routeNode(node, node.id === activeNodeId, index, humor)).join('')}</div></section>`;
}
// Redesign: one greeting, honest progress (guided lessons done, not a pass prediction) and one next action.
function homeHello({ units, daily, next }) {
  const nodes = units.flatMap(unit => unit.nodes || []);
  const done = nodes.filter(node => node.lessonComplete).length;
  const percent = nodes.length ? Math.round(done / nodes.length * 100) : 0;
  const streak = Number(daily?.currentStreak) || 0;
  const returning = done > 0 && streak === 0;
  const greeting = renderCast(returning ? 'krabbe' : 'sneglen', { size: 'lg', priority: true, line: castLine(returning ? 'comeback' : 'home', String(daily?.today || done)) });
  const cta = next
    ? `<a class="home-cta" href="#journey:${escape(next.sectionId)}" data-journey-sound="node"><span><small>${escape(recommendationWhy(next))}</small><strong>${escape(nodeLabel(next))}</strong></span><b class="cta-go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m10 6.5 5.5 5.5-5.5 5.5"/></svg></b></a>`
    : `<a class="home-cta" href="#theory"><span><small>Vælg en rolig start.</small><strong>Åbn teorien</strong></span><b class="cta-go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m10 6.5 5.5 5.5-5.5 5.5"/></svg></b></a>`;
  return `<section class="home-hello" aria-label="Din status i dag">${greeting}<div class="home-stats"><div class="home-ring" style="--p:${percent}" role="img" aria-label="${percent}% af de guidede lektioner gennemført"><span>${percent}%</span></div><div class="home-ring-label">${done}/${nodes.length} lektioner</div><div class="home-chip">${streakFlame(streak)}<b>${streak}</b> ${streak === 1 ? 'dag' : 'dage'} i træk</div></div></section>${cta}`;
}
export function renderJourneyHome({ units = [], daily = {}, recommendations = {}, humor = true, activeUnitId } = {}) {
  const globalNext = recommendations?.recommended || recommendations?.next || units.flatMap(unit => unit.nodes || [])[0];
  const recommendationUnit = globalNext ? units.find(unit => (unit.nodes || []).some(node => node.id === globalNext.id || node.sectionId === globalNext.sectionId)) : null;
  const selected = activeUnitId || recommendationUnit?.id || units[0]?.id;
  const chosenUnit = units.find(unit => unit.id === selected) || units[0];
  const chosenNodes = chosenUnit?.nodes || [];
  const chosenNext = (globalNext && chosenNodes.some(node => node.id === globalNext.id || node.sectionId === globalNext.sectionId))
    ? globalNext
    : chosenNodes.find(node => node.longTermMastery?.hasError)
      || chosenNodes.filter(node => node.longTermMastery?.due).sort((a,b) => (a.longTermMastery.dueAt || 0) - (b.longTermMastery.dueAt || 0))[0]
      || chosenNodes.find(node => !node.lessonComplete && node.lessonAvailable && node.questionIds?.length)
      || chosenNodes[0];
  const goal = Number(daily?.dailyGoal) || 1; const done = Number(daily?.completedSessions) || 0; const percentage = Math.min(100, Math.round((done / goal) * 100));
  const jump = chosenNext && chosenNodes.findIndex(node=>node.sectionId===chosenNext.sectionId)>1 ? `<a class="journey-jump" href="#journey:${escape(chosenNext.sectionId)}" data-journey-sound="node"><span><small>NÆSTE</small><strong>${escape(nodeLabel(chosenNext))}</strong></span><b class="cta-go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m10 6.5 5.5 5.5-5.5 5.5"/></svg></b></a>` : '';
  return `<div class="journey-shell journey-home">${homeHello({ units, daily, next: chosenNext })}<header class="journey-home-top"><div><span class="journey-kicker">TEORIBOOST / DIN RUTE</span><h1>Dit næste træk</h1></div><div class="journey-streak">${streakFlame(daily?.currentStreak || 0)}<strong>${escape(String(daily?.currentStreak || 0))}</strong><small>${Number(daily?.currentStreak) === 1 ? 'dag' : 'dage'} i træk</small></div></header><section class="journey-daily-bar" aria-label="Dagens øvemål"><strong>${escape(String(done))}/${escape(String(goal))}</strong><span>øvesessioner i dag</span><div class="journey-progress-meter" role="img" aria-label="${escape(String(percentage))}% af dagens mål"><i style="width:${percentage}%"></i></div></section>${jump}<div class="journey-route-first"><div>${unitSelector(units, selected)}${path(units, selected, chosenNext?.sectionId, humor)}</div><aside class="journey-secondary"><a class="journey-next-copy" href="${chosenNext ? '#journey:'+escape(chosenNext.sectionId) : '#theory'}" data-journey-sound="node"><span class="journey-kicker">NÆSTE GODE TRÆK</span><strong>${escape(chosenNext ? nodeLabel(chosenNext) : 'Åbn teorien')}</strong><small>${escape(chosenNext ? recommendationWhy(chosenNext) : 'Vælg en rolig start.')}</small></a>${dailyDetails(daily)}${moreLinks()}</aside></div></div>`;
}
export function renderJourneyProgress({ units = [], daily = {}, recommendations = {}, humor = true, activeUnitId } = {}) {
  const completed = units.flatMap(unit => unit.nodes || []).filter(node => node.lessonComplete).length; const total = units.flatMap(unit => unit.nodes || []).length;
  return `<div class="journey-shell journey-progress"><header class="journey-progress-head"><div><span class="journey-kicker">DIN FREMDRIFT</span><h1>${escape(String(completed))}<small>/${escape(String(total))}</small> guidede forløb gennemført.</h1><p>Gentagelser over tid gør ruten mere din.</p></div>${humor ? renderArt('natmobil', { variant: 'garage', humorOnly: true }) : ''}</header>${renderJourneyHome({ units, daily, recommendations, humor: false, activeUnitId })}</div>`;
}
