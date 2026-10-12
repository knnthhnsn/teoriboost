import { readFile, writeFile } from 'node:fs/promises';
import { validateGarage } from './garage-data.mjs';

const read = name => readFile(new URL(`authoring/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const [controls, roadworthy] = await Promise.all([read('garage-controls.json'), read('garage-roadworthy.json')]);
const garage = {
  checked: '2026-10-12', sourceId: 'plan-b-1-1',
  scope: 'Kildebaseret læringsindhold for kapitel 1. Tekstlig repræsentation og fysisk øveforberedelse; ingen kompetencegodkendelse.',
  topics: [...controls.topics, ...roadworthy.topics].sort((a, b) => a.pointRef.localeCompare(b.pointRef, 'da', { numeric: true }))
};
const errors = validateGarage(garage);
if (errors.length) throw new Error(errors.join('\n'));
await writeFile(new URL('dist/garage-content.js', import.meta.url), '// Originalt dansk læringsindhold. Genereret fra authoring/garage-*.json.\nexport const GARAGE = ' + JSON.stringify(garage, null, 2) + ';\n');
console.log(`GARAGEN: ${garage.topics.length} underområder, ${garage.topics.reduce((sum, topic) => sum + topic.objectives.length, 0)} delmål, ${garage.topics.reduce((sum, topic) => sum + topic.cards.length, 0)} forklaringskort.`);
