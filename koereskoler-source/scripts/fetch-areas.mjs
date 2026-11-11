// Fetch OSM administrative memberships for the already captured schools.
// Responses and this script's manifest stay inside this workspace.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const raw=path.join(root,'data','raw');
// The overpass-api.de queue returned HTTP 502; use the public Private.coffee instance.
const endpoint='https://overpass.kumi.systems/api/interpreter';
const manifestPath=path.join(raw,'areas-manifest.json');
const schools=JSON.parse(await fs.readFile(path.join(raw,'osm-schools.json'),'utf8')).elements;
const batchSize=12;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const sha256=body=>crypto.createHash('sha256').update(body).digest('hex');
const schoolId=e=>`${e.type}-${e.id}`;
const point=e=>({lat:e.lat??e.center?.lat,lon:e.lon??e.center?.lon});
const batches=[];
for(let i=0;i<schools.length;i+=batchSize)batches.push(schools.slice(i,i+batchSize));

const existing=await fs.readFile(manifestPath,'utf8').then(JSON.parse).catch(e=>{
  if(e.code==='ENOENT')return null;
  throw e;
});
const manifest=existing??{source:'OpenStreetMap via Overpass API',endpoint,sourceFile:'data/raw/osm-schools.json',createdAt:new Date().toISOString(),batchSize,schoolCount:schools.length,batches:[],places:null};
if(!Array.isArray(manifest.batches)||manifest.schoolCount!==schools.length||manifest.batchSize!==batchSize)throw Error('Existing areas manifest does not match input; refusing to overwrite');
manifest.endpoint=endpoint;
const saveManifest=async()=>{
  const tmp=manifestPath+'.tmp';
  await fs.writeFile(tmp,JSON.stringify(manifest,null,2)+'\n');
  await fs.rename(tmp,manifestPath);
};
let lastRequestStart=0;
async function fetchCapture(id,query,ids){
  const url=new URL(endpoint);
  url.searchParams.set('data',query);
  if(url.href.length>=6000)throw Error(`${id}: URL too long (${url.href.length})`);
  const wait=Math.max(0,1100-(Date.now()-lastRequestStart));
  if(wait)await pause(wait);
  const fetchedAt=new Date().toISOString();
  lastRequestStart=Date.now();
  const entry={id,schoolIds:ids,url:url.href,query,fetchedAt};
  try{
    const res=await fetch(url,{signal:AbortSignal.timeout(115000),headers:{'User-Agent':'TeoriBoostDirectoryResearch/1.0 (local unpublished research)','Accept':'application/json'}});
    const body=Buffer.from(await res.arrayBuffer());
    let parsed=null;
    try{parsed=JSON.parse(body.toString('utf8'));}catch{}
    const extension=parsed?'.json':'.txt';
    const file=`data/raw/${id}${extension}`;
    await fs.writeFile(path.join(root,file),body,{flag:'wx'});
    Object.assign(entry,{status:res.status,finalUrl:res.url,contentType:res.headers.get('content-type'),file,bytes:body.length,sha256:sha256(body),elementCount:parsed?.elements?.length??null});
    if(parsed?.remark)entry.remark=parsed.remark;
    if(res.ok&&Array.isArray(parsed?.elements)&&ids.length){
      const mappings={};
      let current=null;
      for(const element of parsed.elements){
        if(element.type==='marker'){
          current=element.tags?.schoolid??null;
          if(current)mappings[current]=[];
        }else if(element.type==='area'&&current){
          mappings[current].push({id:element.id,name:element.tags?.name??null,admin_level:element.tags?.admin_level??null,ref:element.tags?.ref??null,'ISO3166-2':element.tags?.['ISO3166-2']??null});
        }
      }
      entry.memberships=mappings;
      entry.markerCount=Object.keys(mappings).length;
      entry.membershipCount=Object.values(mappings).reduce((n,a)=>n+a.length,0);
      entry.missingMarkers=ids.filter(id=>!(id in mappings));
    }
    console.log(`${id}: HTTP ${res.status}, ${body.length} bytes, ${entry.markerCount??0}/${ids.length} markers, ${entry.membershipCount??0} areas`);
  }catch(error){
    entry.error=error.message;
    console.error(`${id}: ${error.message}`);
  }
  return entry;
}

function batchQuery(group){
  let q='[out:json][timeout:100];';
  for(const e of group){
    const id=schoolId(e),{lat,lon}=point(e);
    if(!Number.isFinite(lat)||!Number.isFinite(lon))throw Error(`Missing coordinate: ${id}`);
    q+=`make marker schoolid="${id}";out;is_in(${lat},${lon});area._[boundary=administrative][admin_level~"^(4|7)$"];out tags;`;
  }
  return q;
}

const args=process.argv.slice(2);
if(args[0]==='--probe'&&args.length===1){
  manifest.probes??=[];
  const entry=await fetchCapture(`osm-areas-probe-${manifest.probes.length+1}`,'[out:json][timeout:30];is_in(55.632905,12.5814916);out tags;',[]);
  manifest.probes.push(entry);
  await saveManifest();
  process.exit();
}
if(args.length&&!(args.length===2&&args[0]==='--limit-batches'&&Number.isInteger(Number(args[1]))&&Number(args[1])>0))throw Error('Usage: node scripts/fetch-areas.mjs [--limit-batches N | --probe]');
const limit=args.length?Math.min(batches.length,Number(args[1])):batches.length;
for(let i=0;i<limit;i++){
  const id=`osm-areas-batch-${String(i+1).padStart(2,'0')}`;
  const prior=manifest.batches.find(e=>e.id===id&&e.status===200&&e.markerCount===batches[i].length&&e.membershipCount>=batches[i].length);
  if(prior){
    const body=await fs.readFile(path.join(root,prior.file));
    if(sha256(body)!==prior.sha256)throw Error(`Saved response hash mismatch: ${prior.file}`);
    console.log(`${id}: verified cached response`);
    continue;
  }
  const attempts=manifest.batches.filter(e=>e.id===id).length;
  const captureId=attempts?`${id}-attempt-${attempts+1}`:id;
  const entry=await fetchCapture(captureId,batchQuery(batches[i]),batches[i].map(schoolId));
  // Canonical batch identity is separate from the raw response name on retry.
  entry.id=id;
  manifest.batches.push(entry);
  await saveManifest();
}

if(limit===batches.length&&!manifest.places){
  const query=(await fs.readFile(path.join(raw,'overpass-places-query.txt'),'utf8')).trim();
  manifest.places=await fetchCapture('osm-areas-places',query,[]);
  await saveManifest();
}
const complete=manifest.batches.filter(e=>e.status===200&&e.markerCount===e.schoolIds.length&&e.membershipCount>=e.schoolIds.length);
const unique=new Map(complete.flatMap(e=>Object.entries(e.memberships??{})));
console.log(JSON.stringify({schools:schools.length,batches:batches.length,completeBatches:complete.length,mappedSchools:unique.size,withRegion:[...unique.values()].filter(a=>a.some(x=>x.admin_level==='4')).length,withMunicipality:[...unique.values()].filter(a=>a.some(x=>x.admin_level==='7')).length,placesStatus:manifest.places?.status??null}));
