import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {adaptExtra} from './model.mjs';
let records=[];try{records=JSON.parse(await fs.readFile('data/raw/geocode-manifest.json','utf8'));}catch{}
let input=JSON.parse(await fs.readFile('data/verified-core.json','utf8'));
try{input.push(...adaptExtra(JSON.parse(await fs.readFile('data/verified-extra.json','utf8'))));}catch{}
for(const s of input){
 const id=s.osmId;const file=`data/raw/geocode-${id}.json`;
 try{if(JSON.parse(await fs.readFile(file,'utf8')).length){console.log(id,'cached');continue;}}catch{}
 const url='https://nominatim.openstreetmap.org/search?'+new URLSearchParams({format:'jsonv2',street:s.street||s.address,postalcode:s.postcode||'',country:'Denmark',countrycodes:'dk',addressdetails:'1',limit:'3'});
 try{const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'TeoriBoostDirectory/1.0 (unpublished local school directory research; https://teoriboost.dk)'}});const b=Buffer.from(await r.arrayBuffer());await fs.writeFile(file,b);records.push({id,url,status:r.status,file,fetchedAt:new Date().toISOString(),sha256:crypto.createHash('sha256').update(b).digest('hex')});console.log(id,r.status,b.toString().slice(0,150));}catch(e){records.push({id,url,error:e.message});console.log(id,e.message);}
 await new Promise(r=>setTimeout(r,1200));
}
await fs.writeFile('data/raw/geocode-manifest.json',JSON.stringify(records,null,2));
