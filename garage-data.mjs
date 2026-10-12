const counts = {
  '1.1.1': 6, '1.1.2': 3, '1.1.3': 7, '1.1.4': 7, '1.1.5': 5, '1.1.6': 6,
  '1.2.1': 4, '1.2.2': 12, '1.2.3': 23, '1.2.4': 20, '1.2.5': 13,
  '1.2.6': 29, '1.2.7': 18, '1.2.8': 3, '1.2.9': 13, '1.2.10': 1, '1.3.1': 6
};
export const GARAGE_INVENTORY = Object.fromEntries(Object.entries(counts).map(([area, count]) => [area,
  Array.from({ length: count }, (_, index) => `${area}.${index + 1}`)
    .flatMap(ref => ref === '1.1.6.3' ? 'abcdefgh'.split('').map(letter => ref + letter) : [ref])
]));
export const PHYSICAL_REQUIREMENTS = ['udpege', 'aflæse og forstå', 'kontrollere'];

export function validateGarage(data) {
  const errors = [];
  const add = (condition, message) => { if (!condition) errors.push(message); };
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const topics = data?.topics;
  if (!Array.isArray(topics)) return ['topics skal være en liste'];
  add(topics.length === 17, 'Planens kapitel 1 skal indeholde 17 underområder');
  add(new Set(topics.map(topic => topic.id)).size === topics.length, 'Emne-id skal være unikke');
  add(new Set(topics.map(topic => topic.pointRef)).size === topics.length, 'Planområder skal være unikke');
  for (const topic of topics) {
    const label = topic.pointRef || topic.id || '?';
    add(/^[a-z][a-z0-9-]+$/.test(topic.id), `${label}: ugyldigt id`);
    add(['cockpit', 'powertrain', 'exterior', 'documents'].includes(topic.zone), `${label}: ukendt zone`);
    add(text(topic.title) && text(topic.lead), `${label}: titel/indledning mangler`);
    const objectives = Array.isArray(topic.objectives) ? topic.objectives : [];
    const actual = objectives.map(item => item.ref).sort();
    const expected = GARAGE_INVENTORY[label];
    add(!!expected && JSON.stringify(actual) === JSON.stringify([...expected].sort()), `${label}: delmålslisten afviger fra planens nummererede inventar`);
    const refs = new Set(actual);
    for (const objective of objectives) {
      add(['viden', 'angive', ...PHYSICAL_REQUIREMENTS].includes(objective.requirement), `${objective.ref}: ukendt præstationskrav`);
      add(text(objective.summary), `${objective.ref}: forklaring mangler`);
    }
    const cards = Array.isArray(topic.cards) ? topic.cards : [];
    const practical = Array.isArray(topic.practical) ? topic.practical : [];
    const options = topic.case?.options;
    add(cards.length >= 3 && cards.length <= 10, `${label}: forventer 3–10 forklaringskort`);
    add(Array.isArray(options) && options.length === 3 && options.filter(option => option.correct === true).length === 1, `${label}: forventer 3 muligheder og ét korrekt svar`);
    add(Array.isArray(options) && new Set(options.map(option => option.id)).size === 3, `${label}: svar-id er ikke unikke`);
    add(text(topic.case?.context) && text(topic.recall?.prompt) && text(topic.recall?.answer), `${label}: case/genkaldelse mangler`);
    const pieces = [...cards, ...practical, ...(options || []), topic.recall].filter(Boolean);
    for (const piece of pieces) {
      add(Array.isArray(piece.refs) && piece.refs.length > 0 && piece.refs.every(ref => refs.has(ref)), `${label}: ukendt eller tom kildehenvisning i ${piece.title || piece.text || 'genkaldelse'}`);
    }
    for (const card of cards) {
      const words = text(card.body) ? card.body.trim().split(/\s+/).length : 0;
      add(text(card.title) && words >= 30 && words <= 65, `${label}: korttekst skal være 30–65 ord`);
    }
    for (const option of options || []) add(text(option.text) && text(option.why) && typeof option.correct === 'boolean', `${label}: mangelfuld svarmulighed`);
    for (const step of practical) add(text(step.title) && text(step.action), `${label}: mangelfuld opgave i bilen`);
    const teachingRefs = new Set([...cards, ...practical].flatMap(piece => piece.refs || []));
    const practicalRefs = new Set(practical.flatMap(piece => piece.refs || []));
    for (const objective of objectives) {
      add(teachingRefs.has(objective.ref), `${objective.ref}: mangler forklaring eller opgave`);
      if (PHYSICAL_REQUIREMENTS.includes(objective.requirement)) add(practicalRefs.has(objective.ref), `${objective.ref}: fysisk krav mangler opgave i bilen`);
    }
  }
  for (const area of Object.keys(GARAGE_INVENTORY)) add(topics.some(topic => topic.pointRef === area), `${area}: underområde mangler`);
  return errors;
}
