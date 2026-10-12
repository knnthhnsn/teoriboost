import {readFile,writeFile} from 'node:fs/promises';
let html=await readFile(new URL('reference/claude-original.html',import.meta.url),'utf8');
html=html.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]+>/,'');
html=html.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','assets/three.min.js');
html=html.replace('<title>Køreskoleteori Natkørsel</title>','<title>NATKØRSEL — kør en tur</title>');
html=html.replace('</head>',`<style>
@font-face{font-family:Barlow;src:url('assets/fonts/heading-bold.ttf')}
@font-face{font-family:DM;src:url('assets/fonts/body-regular.ttf')}
:root{--asphalt:#111b20;--dash:#18252a;--seam:#42574b;--sodium:#d5ff62;--mist:#b2c5c2}
body{font-family:DM,sans-serif;color:#f1f4e8}h1,h2,.go,.pedal{font-family:Barlow,Impact,sans-serif!important}.card{border-radius:10px!important;background:#172329f2!important}.go{background:#d5ff62!important;color:#172112!important;border-radius:5px}.rule{border-color:#78b8a0!important}.penalty{color:#ffb48d!important;font-size:11px!important}#frame{border-color:#3c514d!important}#radio{color:#d4e3df!important}.held{box-shadow:inset 0 0 0 2px #d5ff62!important}
</style></head>`);
html=html.replace('+12 sek. straf','NYT MOVE · SAMME REGEL');
html=html.replace('Køretime 01 gennemført','Tre situationer gennemført');
html=html.replace('Konceptudkast. Regeltekster og kilder skal afstemmes med den kontrollerede tekst i appen, før de bruges.','Selvstændig timing-simulation. Ingen fartscore eller XP. Øv og genkald reglerne i missionerne; faglig og visuel kørelærergennemgang udestår.');
html=html.replace(/const rows = \[\['Køretid'[\s\S]*?top > 53 \? 'bad' : 'ok'\]\];/,`const rows = [['Rene situationer', clean + ' af 3', clean === 3 ? 'ok' : 'bad'], ['Regler at øve', String(S.errors), S.errors ? 'bad' : 'ok'], ['Fartgrænse', '50 km/t', ''], ['Belønning', 'Korrekte beslutninger', 'ok']];`);
html=html.replace('j.shift = j.lead;','j.shift = j.lead + Math.random() * 3;');
html=html.replace('S.v < 0.25','S.v === 0');
html=html.replace('front >= STOP_LINE - 0.05 && front <= STOP_LINE + 5','front >= STOP_LINE && front <= STOP_LINE + 1');
html=html.replace('Koncept · three.js · ét forløb','Gas og bremse · tre situationer');
html=html.replaceAll('vigepligt for færdsel fra begge sider','vigepligt for kørende trafik fra begge sider');
html=html.replace('Vi tager den lige ovenfra.','Vi tager den ovenfra. Reglen er din næste genvej.');
html=html.replace('Fog =','Fog =');
html=html.replace('0x151d31','0x172637');
await writeFile(new URL('dist/driving.html',import.meta.url),html);
console.log('Standalone driving reference adapted; local assets; time-score removed.');
