import fs from 'node:fs/promises';
import {adaptExtra} from './model.mjs';
const read=async(f,fallback)=>{try{return JSON.parse(await fs.readFile(f,'utf8'));}catch{return fallback;}};
const raw=await read('data/raw/osm-schools.json',{}), fetches=await read('data/raw/fetch-manifest.json',[]), geocodes=await read('data/raw/geocode-manifest.json',[]);
const core=await read('data/verified-core.json',[]), extra=adaptExtra(await read('data/verified-extra.json',[]));
const verified=new Map([...core,...extra].map(s=>[Number(s.osmId),s]));
const fetchedAt=fetches.find(x=>x.id==='osm-schools').fetchedAt;
const src=(id,url,rawFile,date=fetchedAt,evidence,method)=>({sourceId:id,url,rawFile,fetchedAt:date,...(evidence?{evidence}:{}),...(method?{method}:{})});
const field=(value,sources=[],reason)=>({value,sources,...(reason?{reason}:{}),conflict:false,alternatives:[]});
const norm=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9æøå]/g,'');
export const slug=s=>String(s).toLowerCase().replace(/æ/g,'ae').replace(/ø/g,'oe').replace(/å/g,'aa').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function distance(a,b){const r=Math.PI/180,dlat=(b.lat-a.lat)*r,dlon=(b.lon-a.lon)*r;return 6371*2*Math.asin(Math.sqrt(Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlon/2)**2));}
const tests=await read('data/raw/official-fstyr-practical-car-sites.json',{sites:[]});
const exclusions=[], records=[];
for(const s of raw.elements){
 const t=s.tags,id=`${s.type}-${s.id}`,osmurl=`https://www.openstreetmap.org/${s.type}/${s.id}`,osm=src('osm-schools',osmurl,'data/raw/osm-schools.json'),v=verified.get(s.id);
 if(!t.name){exclusions.push({id,reason:'Unnamed object; cannot identify a school'});continue;}
 if(/køreteknisk|køretekniske|scania driver|zealand|sno1-hjem/i.test(t.name)){exclusions.push({id,name:t.name,reason:'Training facility, professional academy or unverified non-school object'});continue;}
 if(/closed|lukket|ophørt/i.test(t.fixme||'')){exclusions.push({id,name:t.name,reason:'OSM flags possible closure; not independently resolved'});continue;}
 const mf=fetches.find(x=>x.id==='school-'+s.id&&x.status===200),own=mf?src(mf.id,mf.finalUrl,mf.file,mf.fetchedAt):null;
 const r={id,fields:{},branches:[],pageEligible:false,sourceObjectIds:[id]};
 for(const [k,val] of Object.entries({name:t.name,location:{lat:(s.center||s).lat,lon:(s.center||s).lon},cvr:t['ref:DK:cvr']||null}))r.fields[k]=field(val,val?[osm]:[]);
 for(const k of ['address','street','postcode','city','municipality','region','phone','website','categories','offerings','note','nearestTestSite'])r.fields[k]=field(null,[],'Not verified');
 const publishedWebsite=t.website||t['contact:website'];
 // A directory domain may have expired or changed purpose; publish a link only after review.
 if(v&&own){
  for(const k of ['name','address','street','postcode','city','phone','cvr','categories','offerings','note']){
   if(v[k]===undefined)continue;
   const previous=r.fields[k];
   r.fields[k]=field(v[k],[{...own,...(v.evidence?.[k]?{evidence:v.evidence[k]}:{}),...(['note'].includes(k)?{method:'Original editorial wording based on source facts'}:{})}]);
   if(previous?.value&&norm(previous.value)!==norm(v[k])){r.fields[k].alternatives.push({value:previous.value,sources:previous.sources});r.fields[k].conflict=true;}
  }
  r.fields.website=field(own.url,[own]);
 }
 const geo=await read(`data/raw/geocode-${s.id}.json`,[]),gm=geocodes.findLast(x=>Number(x.id)===s.id),g=geo.find(g=>g.address?.house_number&&v&&norm(g.address.house_number)===norm((v.street||'').match(/\d+\s*[a-zA-Z]?(?:\s*[a-zA-Z])?$/)?.[0])&&g.address.postcode===v.postcode);
 let context=g;
 const rm=await read('data/raw/osm-reverse-manifest.json',{requests:[]});
 const reverseMeta=rm.requests.findLast(x=>x.schoolId===id&&x.status===200);
 let reverseFile=reverseMeta?.file||`data/raw/osm-reverse-${s.type}-${s.id}.json`;
 const reverse=await read(reverseFile,null);
 if(!context&&reverse?.address)context=reverse;
 if(!context){reverseFile=`data/raw/reverse-${s.id}.json`;const rev=await read(reverseFile,null);if(rev?.address)context=rev;}
 if(context){
  const contextSource=g?src('geocode-'+s.id,gm.url,gm.file,gm.fetchedAt,undefined,'Exact published street number and postcode matched in OSM/Nominatim'):src('reverse-'+s.id,`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${(s.center||s).lat}&lon=${(s.center||s).lon}&zoom=14`,reverseFile,fetchedAt,undefined,'Geographic municipality only; reverse result is not a verified business address');
  const a=context.address;
  for(const [k,val] of Object.entries({municipality:a.municipality,region:a.state}))if(val)r.fields[k]=field(val,[contextSource]);
  if(g){
   const p={lat:Number(g.lat),lon:Number(g.lon)},old=r.fields.location;
   r.fields.location=field(p,[contextSource]);
   if(distance(p,old.value)>.1){r.fields.location.conflict=true;r.fields.location.alternatives=[{value:old.value,sources:old.sources}];r.fields.location.reason='Published business address geocoded; OSM school pin differs by more than 100 m. Both retained.';}
  }
 }
 r.pageEligible=!!(v&&own&&g&&r.fields.name.value&&r.fields.address.value&&r.fields.website.value&&r.fields.categories.value?.length&&r.fields.municipality.value);
 if(r.pageEligible&&tests.sites.length){
  const p=r.fields.location.value, ranked=tests.sites.map(a=>({...a,km:distance(p,{lat:a.latitude,lon:a.longitude})})).sort((a,b)=>a.km-b.km),a=ranked[0];
  r.fields.nearestTestSite=field({name:a.name,address:a.address,location:{lat:a.latitude,lon:a.longitude},distanceKm:Number(a.km.toFixed(1)),category:'B',method:'Haversine, straight-line; not a route or school affiliation'},[src('fstyr-practical-car-sites',tests.sourceUrl,'data/raw/official-fstyr-proever.html','2026-11-10',undefined,'Nearest among 61 practical-car markers in dated official map; no inference of booking site')]);
 }
 r.branches.push({sourceObjectId:id,location:r.fields.location,address:r.fields.address,municipality:r.fields.municipality,region:r.fields.region});
 records.push(r);
}
const schools=[],duplicates=[];
for(const r of records){const cvr=r.fields.cvr.value,key=cvr?'cvr:'+cvr:r.fields.address.value?'name-address:'+norm(r.fields.name.value)+'|'+norm(r.fields.address.value):null;
 const existing=key&&schools.find(s=>s.dedupKey===key);
 if(existing){duplicates.push({kept:existing.id,merged:r.id,key});existing.branches.push(...r.branches);existing.sourceObjectIds.push(...r.sourceObjectIds);if(r.pageEligible&&!existing.pageEligible){existing.fields=r.fields;existing.pageEligible=true;}for(const [k,f] of Object.entries(r.fields)){const ex=existing.fields[k];if(f.value!==null&&JSON.stringify(ex.value)!==JSON.stringify(f.value)){ex.alternatives.push({value:f.value,sources:f.sources});ex.conflict=true;}}}
 else{r.dedupKey=key||'unresolved:'+r.id;schools.push(r);}}
for(const s of schools){const m=s.fields.municipality.value;s.municipalitySlug=m?slug(m.replace(/^Københavns Kommune$/,'København Kommune').replace(/ Kommune$/,'')):'sted-ikke-afklaret';s.slug=slug(s.fields.name.value);s.path=s.pageEligible?`/koereskoler/${s.municipalitySlug}/${s.slug}/`:null;}
schools.sort((a,b)=>a.fields.name.value.localeCompare(b.fields.name.value,'da'));
const stats={fetchedAt,osmSourceTimestamp:raw.osm3s?.timestamp_osm_base,rawObjects:raw.elements.length,excluded:exclusions.length,beforeDedup:records.length,mergedObjects:duplicates.length,schools:schools.length,verifiedSchools:[...verified.keys()].filter(id=>records.some(r=>r.id.endsWith('-'+id))).length,schoolPages:schools.filter(s=>s.pageEligible).length,municipalities:new Set(schools.map(s=>s.fields.municipality.value).filter(Boolean)).size,unknownMunicipality:schools.filter(s=>!s.fields.municipality.value).length,conflicts:schools.filter(s=>Object.values(s.fields).some(f=>f.conflict)).length,fieldCoverage:Object.fromEntries(['address','website','phone','categories','cvr','municipality','region'].map(k=>[k,schools.filter(s=>s.fields[k].value!==null).length])),coverage:'Partial OpenStreetMap directory, NOT all Danish driving schools',licence:'ODbL-1.0; original editorial prose separately © TeoriBoost'};
await fs.writeFile('data/schools.json',JSON.stringify(schools,null,2));await fs.writeFile('data/stats.json',JSON.stringify(stats,null,2));await fs.writeFile('data/exclusions.json',JSON.stringify(exclusions,null,2));await fs.writeFile('data/deduplication.json',JSON.stringify(duplicates,null,2));
const manifests=['fetch-manifest.json','geography-manifest.json','geocode-manifest.json'];let sources=[];for(const m of manifests)sources.push(...await read('data/raw/'+m,[]));
const officialMap={'official-fstyr-robots.txt':'https://www.fstyr.dk/robots.txt','official-fstyr-proever.html':tests.sourceUrl,'official-fstyr-koereproeve.html':'https://www.fstyr.dk/privat/koerekort/proever/koereproeve','official-fstyr-tag-koerekort.html':'https://www.fstyr.dk/privat/koerekort/dit-foerste-koerekort/tag-koerekort-saadan-goer-du','official-fstyr-booking.html':'https://www.fstyr.dk/erhverv/koereskoler-og-koerelaerere/frigivelse-og-afholdelse-af-proever'};
let sourceText='# Sources and reuse\n\nFetched 2026-11-10. Raw captures are internal research evidence, not a publishable website bundle. Never publish data/raw/ or data/review/. No accounts, private API keys, paid services or prohibited directories were used.\n\nSchool data derived from © OpenStreetMap contributors is offered under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/), including the adapted database in schools.json. A download and attribution must accompany public use. The source database is incomplete and may contain stale entries. School websites: no general reproduction licence established; only non-copyright business facts are extracted and all descriptions are newly written. No source prose, photos, reviews or prices are republished. Færdselsstyrelsen: no blanket content licence established; only individual public practical-B place facts and independently worded process facts are used with attribution. The full 61-marker extraction stays internal. Nominatim: ODbL; cached, single-thread, small one-time geocoding job, no autocomplete API use.\n\n## Captured requests\n\n| Source/file | Fetch date | HTTP | Licence/reuse | URL |\n|---|---|---|---|---|\n';
for(const x of sources){let licence=String(x.id||'').startsWith('school-')?'School-owned facts only; robots checked; raw private':/osm|geocode|odbl|nominatim/.test(x.id||'')?'ODbL 1.0 / linked policy':/schema/.test(x.id||'')?'Schema.org CC BY-SA 3.0 vocabulary':'Provider documentation; no prose republished';sourceText+=`| ${x.file||x.id} | ${x.fetchedAt||'2026-11-10'} | ${x.status||x.error} | ${licence} | ${x.url} |\n`;}
sourceText+='\n## Official reference snapshots\n\nSee [official context](../docs/official-context.md) for exact URLs, terms and limitations of each official-* file, including KDS replacement documentation, Datafordeler CVR licence (CC BY 4.0; no CVR records fetched) and DST industry classification.\n\n';for(const [file,url] of Object.entries(officialMap))sourceText+=`- ${file}: 2026-11-10; official public facts only; ${url}\n`;
sourceText+='\n## Additional geography and libraries\n\nThe full per-request reverse-geography provenance is in data/raw/reverse-manifest.json (or geography agent manifest); those requests are OSM/Nominatim ODbL, not authoritative DAR business addresses. Overpass membership attempts and cache timestamps are preserved in areas-manifest.json, including unsuccessful results. MapLibre GL JS 5.15.0 is vendored under BSD-3-Clause; vendor/manifest.json records source URLs, hashes and dates. OpenFreeMap permits free commercial usage with OpenMapTiles/OpenStreetMap attribution, no key, and no SLA; current terms link is captured from its homepage. See vendor licence and map attribution.\n';
await fs.writeFile('data/SOURCES.md',sourceText);
await fs.writeFile('REPORT.md','# Køreskoler: local review handoff\n\nData gathered and cleaned before page generation. No deployment, commit, push, accounts, email or contact.\n\n```json\n'+JSON.stringify(stats,null,2)+'\n```\n\nThis is a partial national OSM snapshot, not an exhaustive Danish driving-school register. A credential-free CVR 855300 bulk route was not established; DAWA returns HTTP 410. Schools without verified school-published address, offerings and working contact/website receive no standalone page. Unknown values remain unknown. No category/language filters until coverage supports them.\n\nCounts and QA findings will be completed after the vertical slice and full generation.\n\nOpen for Kenneth: KONTAKT_TODO correction contact; whether to publish one-person-school pages using their own published teaching/business addresses; coverage and refresh strategy. Claude reviews and releases.\n');
console.log(stats);

