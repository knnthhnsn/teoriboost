// Fetches the CVR GraphQL schema. Key is read from the environment, never written to disk. Retries because new keys propagate slowly.
import fs from 'node:fs';import {execSync} from 'node:child_process';
const key=process.env.DATAFORDELER_API_KEY||execSync('powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable(\'DATAFORDELER_API_KEY\',\'User\')"').toString().trim();
for(let i=0;i<8;i++){const r=await fetch('https://graphql.datafordeler.dk/CVR/v2/schema?apiKey='+encodeURIComponent(key),{signal:AbortSignal.timeout(60000)});const t=await r.text();console.log(i,r.status,t.length);
 if(r.status===200&&t.length>1000){fs.writeFileSync('data/raw/cvr-schema.graphql',t);break;}await new Promise(r=>setTimeout(r,12000));}
