import fs from 'node:fs/promises';
import crypto from 'node:crypto';
await fs.mkdir('vendor',{recursive:true});
const records=[];
for(const [name,url] of [['maplibre-gl.js','https://unpkg.com/maplibre-gl@5.15.0/dist/maplibre-gl.js'],['maplibre-gl.css','https://unpkg.com/maplibre-gl@5.15.0/dist/maplibre-gl.css'],['LICENSE-maplibre.txt','https://unpkg.com/maplibre-gl@5.15.0/LICENSE.txt']]){
 const r=await fetch(url);if(!r.ok)throw Error(`${url} ${r.status}`);const b=Buffer.from(await r.arrayBuffer());await fs.writeFile('vendor/'+name,b);records.push({file:'vendor/'+name,url,fetchedAt:new Date().toISOString(),sha256:crypto.createHash('sha256').update(b).digest('hex'),license:'BSD-3-Clause'});console.log(name,b.length);
}
await fs.writeFile('vendor/manifest.json',JSON.stringify(records,null,2));
