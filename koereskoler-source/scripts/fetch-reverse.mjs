// One-time, single-thread reverse lookup of existing OSM driving-school points.
// Follow https://operations.osmfoundation.org/policies/nominatim/: <1 request/s,
// identify this research task, cache every response, and never use a query grid.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const raw=path.join(root,'data','raw');
const input=path.join(raw,'osm-schools.json');
const manifestPath=path.join(raw,'osm-reverse-manifest.json');
const schools=JSON.parse(await fs.readFile(input,'utf8')).elements;
const sha256=body=>crypto.createHash('sha256').update(body).digest('hex');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const schoolId=e=>`${e.type}-${e.id}`;
const args=process.argv.slice(2);
if(args.length&&!(args.length===2&&args[0]==='--limit'&&Number.isInteger(Number(args[1]))&&Number(args[1])>0))throw Error('Usage: node scripts/fetch-reverse.mjs [--limit N]');
const limit=args.length?Math.min(schools.length,Number(args[1])):schools.length;
const existing=await fs.readFile(manifestPath,'utf8').then(JSON.parse).catch(error=>{
  if(error.code==='ENOENT')return null;
  throw error;
});
const manifest=existing??{
  source:'OpenStreetMap via Nominatim reverse geocoding',
  policy:'https://operations.osmfoundation.org/policies/nominatim/',
  sourceFile:'data/raw/osm-schools.json',
  createdAt:new Date().toISOString(),
  schoolCount:schools.length,
  requests:[]
};
if(manifest.schoolCount!==schools.length||!Array.isArray(manifest.requests))throw Error('Existing reverse manifest does not match school input; refusing to overwrite');
async function saveManifest(){
  const temp=manifestPath+'.tmp';
  await fs.writeFile(temp,JSON.stringify(manifest,null,2)+'\n');
  await fs.rename(temp,manifestPath);
}
const previousBySchool=new Map(manifest.requests.map(request=>[request.schoolId,request]));
const attemptCounts=new Map();
for(const request of manifest.requests)attemptCounts.set(request.schoolId,(attemptCounts.get(request.schoolId)??0)+1);
let lastRequestStart=0;
for(let i=0;i<limit;i++){
  const school=schools[i],id=schoolId(school);
  const lat=school.lat??school.center?.lat,lon=school.lon??school.center?.lon;
  if(!Number.isFinite(lat)||!Number.isFinite(lon))throw Error(`Missing coordinate: ${id}`);
  const previous=previousBySchool.get(id);
  if(previous?.status===200&&previous?.file){
    const saved=await fs.readFile(path.join(root,previous.file));
    if(sha256(saved)!==previous.sha256)throw Error(`Cached response hash mismatch: ${previous.file}`);
    console.log(`${i+1}/${schools.length} ${id}: verified cache`);
    continue;
  }
  const attempt=(attemptCounts.get(id)??0)+1;
  if(previous&&(![503,502,504].includes(previous.status)||attempt>3))throw Error(`${id}: previous attempt is incomplete; review manifest before retrying`);
  const url=new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format','jsonv2');
  url.searchParams.set('lat',String(lat));
  url.searchParams.set('lon',String(lon));
  url.searchParams.set('zoom','14');
  url.searchParams.set('addressdetails','1');
  url.searchParams.set('accept-language','da');
  const wait=Math.max(0,1250-(Date.now()-lastRequestStart));
  if(wait)await pause(wait);
  const fetchedAt=new Date().toISOString();
  lastRequestStart=Date.now();
  const record={schoolId:id,coordinate:{lat,lon},url:url.href,fetchedAt};
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(35000),headers:{
      'User-Agent':'TeoriBoostDirectoryResearch/1.0 (+https://teoriboost.dk/; unpublished one-time research)',
      'Referer':'https://teoriboost.dk/',
      'Accept':'application/json'
    }});
    const body=Buffer.from(await response.arrayBuffer());
    const suffix=attempt>1?`-attempt-${attempt}`:'';
    const file=`data/raw/osm-reverse-${id}${suffix}.${(response.headers.get('content-type')??'').includes('json')?'json':'txt'}`;
    await fs.writeFile(path.join(root,file),body,{flag:'wx'});
    Object.assign(record,{status:response.status,finalUrl:response.url,contentType:response.headers.get('content-type'),file,bytes:body.length,sha256:sha256(body)});
    if(response.ok){
      try{
        const parsed=JSON.parse(body.toString('utf8'));
        const address=parsed.address??{};
        record.area={municipality:address.municipality??null,state:address.state??null,county:address.county??null,city:address.city??null,town:address.town??null,village:address.village??null};
      }catch(error){record.parseError=error.message;}
    }
  }catch(error){record.error=error.message;}
  manifest.requests.push(record);
  previousBySchool.set(id,record);
  attemptCounts.set(id,attempt);
  await saveManifest();
  console.log(`${i+1}/${schools.length} ${id}: ${record.status??record.error}; ${record.area?.municipality??'no municipality'}; ${record.area?.state??'no region'}`);
  if(record.status!==200||record.parseError){
    if([502,503,504].includes(record.status)&&attempt<3){
      await pause(15000*attempt);
      i--;
      continue;
    }
    console.error('Stopped after an incomplete response; inspect raw evidence before resuming.');
    process.exitCode=1;
    break;
  }
}
const latest=[...new Map(manifest.requests.map(request=>[request.schoolId,request])).values()];
const good=latest.filter(request=>request.status===200&&!request.parseError);
console.log(JSON.stringify({requests:manifest.requests.length,schoolsAttempted:latest.length,successful:good.length,withMunicipality:good.filter(request=>request.area?.municipality).length,withRegion:good.filter(request=>request.area?.state).length,schools:schools.length}));
