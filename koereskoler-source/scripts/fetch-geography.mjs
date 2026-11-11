import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const records=[];
async function save(id,url,options={}){const fetchedAt=new Date().toISOString();try{const r=await fetch(url,{...options,signal:AbortSignal.timeout(170000)});const body=Buffer.from(await r.arrayBuffer());const file=`data/raw/${id}.${(r.headers.get('content-type')||'').includes('json')?'json':'txt'}`;await fs.writeFile(file,body);records.push({id,url,fetchedAt,status:r.status,file,sha256:crypto.createHash('sha256').update(body).digest('hex')});console.log(id,r.status,body.length);}catch(e){records.push({id,url,fetchedAt,error:e.message});console.log(id,e.message);}await fs.writeFile('data/raw/geography-manifest.json',JSON.stringify(records,null,2));}
const q=await fs.readFile('data/raw/overpass-areas-query.txt','utf8');
await save('osm-school-areas-post','https://overpass-api.de/api/interpreter',{method:'POST',body:new URLSearchParams({data:q})});
const places='[out:json][timeout:100];area["ISO3166-1"="DK"][admin_level=2]->.dk;node[place~"^(city|town|village)$"](area.dk);out tags center;';
await fs.writeFile('data/raw/overpass-places-query.txt',places);
await save('osm-places','https://overpass-api.de/api/interpreter',{method:'POST',body:new URLSearchParams({data:places})});
await save('nominatim-policy','https://operations.osmfoundation.org/policies/nominatim/');
await save('openfreemap-terms-current','https://openfreemap.org/terms-of-service/');
await save('maplibre-style','https://tiles.openfreemap.org/styles/positron');
await save('schema-vocabulary','https://schema.org/version/latest/schemaorg-current-https.jsonld');
