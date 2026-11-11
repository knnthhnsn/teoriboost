import {readFile} from 'node:fs/promises';
import {publicBillingStatus} from './_config.mjs';
export function createStatusHandler({env=process.env,configProvider=async()=>JSON.parse(await readFile(new URL('../../premium-config.json',import.meta.url),'utf8'))}={}){return async(req,res)=>{
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'){res.statusCode=405;res.setHeader('Allow','GET');res.end(JSON.stringify({error:{code:'METHOD_NOT_ALLOWED',message:'Metoden er ikke tilladt.'}}));return;}
  let c=null;try{c=await configProvider();}catch{}res.statusCode=200;res.end(JSON.stringify(publicBillingStatus(c,env)));
};}
export default createStatusHandler();
