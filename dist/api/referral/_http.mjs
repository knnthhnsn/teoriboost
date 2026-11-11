import {readFile} from 'node:fs/promises';
import {ApiError} from '../billing/_core.mjs';
import {getService,readJson} from '../billing/_runtime.mjs';
import {timingSafeEqual} from 'node:crypto';
let cachedConfig;
const configProvider=()=>cachedConfig ||=readFile(new URL('../../premium-config.json',import.meta.url),'utf8').then(JSON.parse).catch(()=>null);
export function createReferralHandler(action,{serviceProvider=getService,publicConfigProvider=configProvider,env=process.env}={}){return async(req,res)=>{
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
  try{
    const allowed=action==='process'?['GET','POST']:action==='profile'?['GET']:['POST'];if(!allowed.includes(req.method)){res.setHeader('Allow',allowed.join(', '));throw new ApiError(405,'METHOD_NOT_ALLOWED','Metoden er ikke tilladt.');}
    if(action==='process'){
      const actual=typeof req.headers?.authorization==='string'?req.headers.authorization:'',expected=env.CRON_SECRET&&`Bearer ${env.CRON_SECRET}`;
      if(!env.CRON_SECRET||env.CRON_SECRET.length<24)throw new ApiError(503,'CRON_DISABLED','Belønningskørslen er ikke aktiveret.');
      if(Buffer.byteLength(actual)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))throw new ApiError(401,'CRON_AUTH_INVALID','Ugyldig adgang.');
    }
    const c=await publicConfigProvider();let result;
    if(c?.enabled!==true||c?.referral?.enabled!==true||c.referral.confirmed!==true||env.REFERRAL_LEGAL_APPROVED!=='true'){
      if(action==='process')result={processed:0,disabled:true};else throw new ApiError(503,'REFERRAL_DISABLED','Invitér en ven er ikke aktiveret endnu.');
    }else{
      if(action!=='process'&&(req.headers?.origin&&req.headers.origin!==env.APP_ORIGIN||req.method==='POST'&&(!env.APP_ORIGIN||req.headers?.origin!==env.APP_ORIGIN)))throw new ApiError(403,'ORIGIN_INVALID','Åbn TeoriBoost for at fortsætte.');
      const service=await serviceProvider();if(action==='process')result=await service.referral.process();else{const token=/^Bearer ([A-Za-z0-9._-]{1,8192})$/.exec(req.headers?.authorization||'')?.[1];const uid=await service.authenticate(token);result=action==='profile'?await service.referral.profile(uid):await service.referral[action](uid,await readJson(req));}
    }
    res.statusCode=200;res.end(JSON.stringify(result));
  }catch(e){const safe=e instanceof ApiError;res.statusCode=safe?e.status:503;res.end(JSON.stringify({error:{code:safe?e.code:'REFERRAL_UNAVAILABLE',message:safe?e.message:'Invitationen kunne ikke behandles lige nu.'}}));}
};}
