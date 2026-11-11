import fs from 'node:fs/promises';
import crypto from 'node:crypto';
await fs.mkdir('data/raw',{recursive:true});
const manifest=[];
export async function capture(id,url,options={}) {
  const at=new Date().toISOString();
  try {
    const res=await fetch(url,{...options,signal:AbortSignal.timeout(180000),headers:{'User-Agent':'TeoriBoostDirectoryResearch/1.0 (local unpublished research)',...(options.headers||{})}});
    const body=Buffer.from(await res.arrayBuffer());
    const ext=(res.headers.get('content-type')||'').includes('json')?'json':(res.headers.get('content-type')||'').includes('html')?'html':'txt';
    const file=`data/raw/${id}.${ext}`;
    await fs.writeFile(file,body);
    const meta={id,url,finalUrl:res.url,fetchedAt:at,status:res.status,file,sha256:crypto.createHash('sha256').update(body).digest('hex')};
    manifest.push(meta);await fs.writeFile('data/raw/fetch-manifest.json',JSON.stringify(manifest,null,2));
    console.log(id,res.status,body.length);
    return {meta,body:body.toString('utf8')};
  } catch(e){manifest.push({id,url,fetchedAt:at,error:e.message});await fs.writeFile('data/raw/fetch-manifest.json',JSON.stringify(manifest,null,2));console.log(id,e.message);return null;}
}
const query='[out:json][timeout:150];area["ISO3166-1"="DK"][admin_level=2]->.dk;nwr[amenity=driving_school](area.dk);out center tags meta;';
await fs.writeFile('data/raw/overpass-query.txt',query);
await capture('osm-schools','https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query));
await capture('osm-copyright','https://www.openstreetmap.org/copyright');
await capture('odbl','https://opendatacommons.org/licenses/odbl/1-0/');
await capture('openfreemap-terms','https://openfreemap.org/terms/');
await capture('openfreemap','https://openfreemap.org/');
await capture('dawa-probe','https://api.dataforsyningen.dk/postnumre?nr=8000');
