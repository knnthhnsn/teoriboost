import { SOURCES } from './content.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function references(ids, locator) {
  const links = ids.map(id => SOURCES.find(source => source.id === id)).filter(Boolean)
    .map(source => `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${source.id.startsWith('plan-') ? 'Undervisningsplanen' : source.id === 'fl-2026' ? 'Færdselsloven' : 'Myndighedskilde'}</a>`).join('');
  return `<div class="lesson-references">${links}<span>${escape(locator)}</span></div>`;
}

function voiceButton(kind, sectionId, label) {
  return `<button type="button" class="audio-btn voice-read" data-voice-kind="${kind}" data-voice-id="${escape(sectionId)}" aria-pressed="false">${label}</button>`;
}

export function renderLesson(section, lesson) {
  if (!section || !lesson) return '<div class="empty-state"><h1>Forklaringen er ikke klar endnu.</h1><a class="btn btn-primary" href="#theory">Åbn teorien</a></div>';
  return `<article class="lesson-view">
    <div class="screen-head"><a class="back-btn" href="#chapter:${escape(section.chapter.id)}" aria-label="Tilbage til kapitlet">Tilbage</a><div><div class="eyebrow">FORSTÅ <span class="tb-stripes" aria-hidden="true"></span> BRUG <span class="tb-stripes" aria-hidden="true"></span> HUSK</div><h1>${escape(section.title)}</h1></div></div>
    <p class="lesson-lead">${escape(lesson.lead)}</p>
    ${voiceButton('lesson', section.id, 'Lyt til forklaringen')}
    <div class="lesson-cards">${lesson.cards.map((card, index) => `<section class="lesson-card"><span class="lesson-number">${index + 1}</span><div><h2>${escape(card.title)}</h2><p>${escape(card.body)}</p>${references(card.sourceIds, card.sourceLocator)}</div></section>`).join('')}</div>
    <section class="lesson-case"><div class="eyebrow">TAG REGLEN MED UD PÅ VEJEN</div><h2>Hvad gør du her?</h2><p>${escape(lesson.case.context)}</p>${voiceButton('lesson-case', section.id, 'Lyt til situationen')}<details><summary>Tænk først. Se handling og forklaring.</summary><div class="lesson-case-answer"><h3>Dit næste træk</h3><p>${escape(lesson.case.action)}</p><h3>Derfor</h3><p>${escape(lesson.case.why)}</p>${voiceButton('lesson-answer', section.id, 'Lyt til handlingen')}${references(lesson.case.sourceIds, lesson.case.sourceLocator)}</div></details></section>
    <section class="lesson-recall"><div class="eyebrow">HVAD HUSKER DU?</div><h2>${escape(lesson.recall.prompt)}</h2>${voiceButton('lesson-recall', section.id, 'Lyt til spørgsmålet')}<details><summary>Se forklaringen</summary><p>${escape(lesson.recall.answer)}</p>${voiceButton('lesson-recall-answer', section.id, 'Lyt til svaret')}</details><p class="lesson-self-check">Forklar det med dine egne ord. Ingen bedømmer dit svar automatisk.</p></section>
    ${lesson.practicalNote ? `<aside class="lesson-practical"><strong>Prøv det i bilen med din kørelærer</strong><p>${escape(lesson.practicalNote)}</p>${voiceButton('lesson-practical', section.id, 'Lyt til opgaven i bilen')}</aside>` : ''}
    <div class="lesson-actions"><a href="#learn:${escape(section.id)}" class="btn btn-primary">Prøv reglen i en situation</a><a href="#chapter:${escape(section.chapter.id)}" class="text-link">Tilbage til kapitlet</a></div>
  </article>`;
}
