import fs from 'node:fs';
import {QUESTIONS} from './dist/content.js';
import {questionDiagram} from './dist/diagrams.js';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const selected=QUESTIONS.filter(q=>Number(q.id.slice(2))>=72);
const html=`<!doctype html><html lang="da"><meta charset="utf-8"><title>QA: nye teoriillustrationer</title><style>body{margin:0;padding:18px;background:#111923;color:#eaf3ee;font:16px/1.45 Arial}h1{font-size:24px;margin:0 0 16px}main{display:grid;grid-template-columns:1fr 1fr;gap:14px}article{border:1px solid #415261;border-radius:10px;overflow:hidden}svg{display:block;width:100%;height:240px;background:#0b1219}h2{font-size:18px;margin:10px 14px 0}p{margin:8px 14px 14px;min-height:69px}article:nth-of-type(4n){scroll-margin-top:18px}</style><h1>QA · q-072 til q-083 · tekst og geometri</h1><main>${selected.map(q=>`<article id="${q.id}">${questionDiagram(q)}<h2>${esc(q.id)} · ${esc(q.prompt)}</h2><p>${esc(q.context)}</p></article>`).join('')}</main></html>`;
fs.writeFileSync('dist/qa-gallery.html',html);
