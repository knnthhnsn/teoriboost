// Geocodes the full-address CVR companies with Nominatim: cached, one request per 1.2 s, structured query, no key.
import fs from 'node:fs';
const units=JSON.parse(fs.readFileSync('data/cvr-units.json','utf8')).filter(u=>u.fullAddress&&!u.inOsm);
const file='data/raw/cvr-geocode.json';const cache=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
for(const u of units){if(u.cvr in cache)continue;
 const url='https://nominatim.openstreetmap.org/search?'+new URLSearchParams({format:'jsonv2',street:u.street,postalcode:u.postcode,country:'Denmark',countrycodes:'dk',limit:'1'});
 try{const r=await fetch(url,{headers:{'User-Agent':'TeoriBoostDirectory/1.0 (unpublished school directory research; https://teoriboost.dk)'},signal:AbortSignal.timeout(25000)});const j=r.status===200?await r.json():[];cache[u.cvr]={status:r.status,lat:j[0]?Number(j[0].lat):null,lon:j[0]?Number(j[0].lon):null,fetchedAt:new Date().toISOString()};}catch(e){cache[u.cvr]={status:0,lat:null,lon:null};}
 fs.writeFileSync(file,JSON.stringify(cache));await new Promise(r=>setTimeout(r,1200));}
console.log('done',Object.keys(cache).length,Object.values(cache).filter(c=>c.lat).length);
