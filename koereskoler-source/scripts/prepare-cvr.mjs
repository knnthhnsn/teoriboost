// Normalises the CVR extract into data/cvr-units.json under the privacy rule:
// full address only for NOT advertising-protected companies (ApS, A/S, ...); everyone else: name + kommune only.
import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('data/raw/cvr-855300-details.json','utf8'));
const schools=JSON.parse(fs.readFileSync('data/schools.json','utf8'));
const osmCvr=new Set(schools.map(s=>s.fields.cvr.value).filter(Boolean).map(String));
const rk=new Map(d.reklame.map(r=>[r.CVREnhedsId,r.vaerdi]));
const adr=new Map(d.adr.filter(a=>a.AdresseringAnvendelse==='beliggenhedsadresse'&&!a.virkningTil).map(a=>[a.CVREnhedsId,a]));
const nm=new Map(d.navn.filter(n=>!n.virkningTil).sort((a,b)=>a.sekvens-b.sekvens).map(n=>[n.CVREnhedsId,n.vaerdi]));
const company=/\b(ApS|A\/S|I\/S|K\/S|P\/S|IVS|A\.m\.b\.a\.?|F\.m\.b\.a\.?|S\.m\.b\.a\.?)\s*$/i;
const nonSchool=/\b(FDM|Færdselsstyrelsen|Politi|Forsvar|Falck|Dekra|Teknologisk|Scania|Volvo|Academy of|UCL|EUC|VUC|Erhvervsskole)\b/i;
const out=[];
for(const v of d.virksomhed){if(v.status!=='aktiv'||v.virksomhedOphoersdato)continue;const a=adr.get(v.id);if(!a)continue;
 const name=nm.get(v.id);if(!name||nonSchool.test(name))continue;
 const protectedFlag=!!rk.get(v.id),isCompany=company.test(name),full=!protectedFlag&&isCompany;
 const u={cvr:String(v.CVRNummer),name,municipality:a.CVRAdresse_kommunenavn,municipalityCode:a.CVRAdresse_kommunekode,fullAddress:full,inOsm:osmCvr.has(String(v.CVRNummer)),source:'Det Centrale Virksomhedsregister (CVR) via Datafordeler, CC BY 4.0, hentet '+d.fetchedAt.slice(0,10)};
 if(full){const nr=a.CVRAdresse_husnummerFra+(a.CVRAdresse_husnummerTil?'-'+a.CVRAdresse_husnummerTil:'');u.street=[a.CVRAdresse_vejnavn,nr].filter(Boolean).join(' ');u.floor=a.CVRAdresse_etagebetegnelse||null;u.door=a.CVRAdresse_doerbetegnelse||null;u.postcode=a.CVRAdresse_postnummer;u.city=a.CVRAdresse_postdistrikt;}
 out.push(u);}
fs.writeFileSync('data/cvr-units.json',JSON.stringify(out,null,1));
const c=k=>out.filter(k).length;
console.log(JSON.stringify({units:out.length,fullAddress:c(u=>u.fullAddress),minimal:c(u=>!u.fullAddress),fullNotInOsm:c(u=>u.fullAddress&&!u.inOsm),inOsm:c(u=>u.inOsm)}));
