// Pulls all CVR units with branche 855300 (Drift af koereskoler) from Datafordeler CVR GraphQL v2 (CC BY 4.0, credit: Det Centrale Virksomhedsregister).
// Key comes from the environment and is never logged or stored. Raw responses go to data/raw/cvr-*.json.
import fs from 'node:fs';import {execSync} from 'node:child_process';
const key=process.env.DATAFORDELER_API_KEY||execSync('powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable(\'DATAFORDELER_API_KEY\',\'User\')"').toString().trim();
const URL='https://graphql.datafordeler.dk/CVR/v2?apiKey='+encodeURIComponent(key),V=new Date().toISOString();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function gql(query,vars={}){for(let i=0;i<4;i++){const r=await fetch(URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query,variables:vars}),signal:AbortSignal.timeout(90000)});const t=await r.text();let j;try{j=JSON.parse(t)}catch{j=null}
 if(r.status===200&&j&&!j.errors)return j.data;console.error('retry',i,r.status,(j?.errors?.[0]?.message||t).slice(0,200));await sleep(3000*(i+1));}throw new Error('gql failed');}
const out='data/raw/';const branche=[];let after=null;
for(;;){const d=await gql(`query($after:String,$v:DafDateTime){CVR_Branche(first:100,after:$after,virkningstid:$v,where:{vaerdi:{eq:"855300"}}){pageInfo{hasNextPage endCursor} nodes{CVREnhedsId vaerdi vaerdiTekst sekvens virkningFra virkningTil}}}`,{after,v:V});
 const c=d.CVR_Branche;branche.push(...c.nodes);console.log('branche',branche.length);if(!c.pageInfo.hasNextPage)break;after=c.pageInfo.endCursor;await sleep(800);}
fs.writeFileSync(out+'cvr-branche-855300.json',JSON.stringify({fetchedAt:V,nodes:branche},null,1));
const ids=[...new Set(branche.map(b=>b.CVREnhedsId))];console.log('units',ids.length);
const all={virksomhed:[],navn:[],adr:[],reklame:[]};
async function* pageAll(name,fields,filterKey,chunk){let a=null;for(;;){const d=await gql(`query($a:String,$v:DafDateTime,$ids:[String!]){${name}(first:100,after:$a,virkningstid:$v,where:{${filterKey}:{in:$ids}}){pageInfo{hasNextPage endCursor} nodes{${fields}}}}`,{a,v:V,ids:chunk});const c=d[name];const n=c.nodes;if(!n.length&&!c.pageInfo.hasNextPage)break;yield n;if(!c.pageInfo.hasNextPage)break;a=c.pageInfo.endCursor;await sleep(500);}}
for(let i=0;i<ids.length;i+=100){const ch=ids.slice(i,i+100);
 for(const [key2,name,fields,fk] of [['virksomhed','CVR_Virksomhed','id CVRNummer status virksomhedStartdato virksomhedOphoersdato virkningTil','id'],['navn','CVR_Navn','CVREnhedsId vaerdi sekvens virkningTil','CVREnhedsId'],['adr','CVR_Adressering','CVREnhedsId AdresseringAnvendelse Adresse coNavn CVRAdresse_vejnavn CVRAdresse_husnummerFra CVRAdresse_husnummerTil CVRAdresse_etagebetegnelse CVRAdresse_doerbetegnelse CVRAdresse_postnummer CVRAdresse_postdistrikt CVRAdresse_kommunekode CVRAdresse_kommunenavn CVRAdresse_postboks virkningTil','CVREnhedsId'],['reklame','CVR_Reklamebeskyttelse','CVREnhedsId vaerdi virkningTil','CVREnhedsId']]){
  for await(const n of pageAll(name,fields,fk,ch))all[key2].push(...n);await sleep(500);}
 console.log('chunk',i,Object.fromEntries(Object.entries(all).map(([k,v])=>[k,v.length])));}
fs.writeFileSync(out+'cvr-855300-details.json',JSON.stringify({fetchedAt:V,source:'Det Centrale Virksomhedsregister (CVR) via Datafordeler GraphQL v2, CC BY 4.0',...all},null,1));
