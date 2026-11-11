// Checks verified facts (address street, phone digits, CVR, name) against the saved text of each school's own site.
import fs from 'node:fs';
const digits=s=>String(s).replace(/\D/g,''),norm=s=>String(s).toLowerCase().replace(/\s+/g,' ').replace(/[.,]/g,'');
const rec=[...JSON.parse(fs.readFileSync('data/verified-core.json','utf8')),...JSON.parse(fs.readFileSync('data/verified-extra.json','utf8')).records];
const rows=[];
for(const r of rec){const p=`data/review/school-${r.osmId}.txt`;if(!fs.existsSync(p)){rows.push({name:r.name,problem:'no saved page text'});continue;}
 const raw=fs.readFileSync(p,'utf8'),t=norm(raw),d=digits(raw),res={name:r.name,osmId:r.osmId};
 res.street=t.includes(norm(r.address.split(',')[0]));res.phone=r.phone?d.includes(digits(r.phone)):null;res.cvr=r.cvr?d.includes(digits(r.cvr)):null;res.name_on_page=t.includes(norm(r.name).replace(/'/g,''))||t.includes(norm(r.name).split(',')[0].replace(/'/g,''));rows.push(res);}
const fails=rows.filter(r=>r.problem||[r.street,r.phone,r.cvr,r.name_on_page].includes(false));
console.log(JSON.stringify({checked:rows.length,failures:fails.length,fails,rows},null,1));
