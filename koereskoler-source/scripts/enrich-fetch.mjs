import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const manifest=JSON.parse(await fs.readFile('data/raw/fetch-manifest.json','utf8'));
async function get(id,url){
 const fetchedAt=new Date().toISOString();
 try{const r=await fetch(url,{signal:AbortSignal.timeout(150000),headers:{'User-Agent':'TeoriBoostDirectoryResearch/1.0 (local unpublished research)'}});const body=Buffer.from(await r.arrayBuffer());const file=`data/raw/${id}.${(r.headers.get('content-type')||'').includes('json')?'json':(r.headers.get('content-type')||'').includes('html')?'html':'txt'}`;await fs.writeFile(file,body);manifest.push({id,url,finalUrl:r.url,fetchedAt,status:r.status,file,sha256:crypto.createHash('sha256').update(body).digest('hex')});await fs.writeFile('data/raw/fetch-manifest.json',JSON.stringify(manifest,null,2));console.log(id,r.status,body.length);return r.ok?body.toString():null;}catch(e){manifest.push({id,url,fetchedAt,error:e.message});await fs.writeFile('data/raw/fetch-manifest.json',JSON.stringify(manifest,null,2));console.log(id,e.message);return null;}
}
const schools=JSON.parse(await fs.readFile('data/raw/osm-schools.json','utf8')).elements;
const q='[out:json][timeout:140];'+schools.map(s=>{const p=s.center||s;return `make marker schoolid="${s.type}-${s.id}";out;is_in(${p.lat},${p.lon});area._[boundary=administrative][admin_level~"^(4|7)$"];out tags;`;}).join('');
await fs.writeFile('data/raw/overpass-areas-query.txt',q);
await get('osm-school-areas','https://overpass-api.de/api/interpreter?data='+encodeURIComponent(q));
// Read each school's robots file before retrieving a public page. Hosts are sequential.
const done=new Set();
for(const s of schools){
 const website=s.tags.website||s.tags['contact:website'];if(!website)continue;
 let u;try{u=new URL(website);}catch{continue;}if(!['http:','https:'].includes(u.protocol)||!u.hostname.includes('.')||/facebook|instagram|google|trustpilot|krak|degulesider/i.test(u.hostname))continue;
 if(done.has(u.hostname))continue;done.add(u.hostname);
 const id='school-'+s.id;
 const robots=await get(id+'-robots',u.origin+'/robots.txt');
 await new Promise(r=>setTimeout(r,1100));
 // Conservative parser: any applicable blanket ban skips host. Path disallows are checked too.
 let applies=false,blocked=false;
 if(robots){for(const line of robots.split(/\r?\n/)){const m=line.replace(/#.*/,'').trim().match(/^([^:]+):\s*(.*)$/);if(!m)continue;if(m[1].toLowerCase()==='user-agent')applies=m[2]==='*'||/teoriboost/i.test(m[2]);if(applies&&m[1].toLowerCase()==='disallow'&&m[2]&&u.pathname.startsWith(m[2].replace(/\*.*$/,'')))blocked=true;}}
 if(blocked){console.log('robots disallowed',u.hostname);continue;}
 await get(id,website);await new Promise(r=>setTimeout(r,1100));
}
