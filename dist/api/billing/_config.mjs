import {firebaseIdentityConfigured} from './_firebase-config.mjs';
const PLAN_ENV={'7-days':'STRIPE_PRICE_ID_7_DAYS','30-days':'STRIPE_PRICE_ID','1-year':'STRIPE_PRICE_ID_1_YEAR'};
const DURATIONS={'7-days':{days:7},'30-days':{days:30},'1-year':{years:1}};
export function validAppOrigin(value,env){try{const u=new URL(value);if(u.origin!==value)return false;if(u.protocol==='https:')return true;return env.VERCEL!=='1'&&env.VERCEL_ENV===undefined&&u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)&&u.port==='4242';}catch{return false;}}
export function billingConfigProblem(c,env,{requireFirebase=false}={}){
  if(c?.enabled!==true||env.BILLING_ENABLED!=='true')return 'disabled';
  const validOrigin=validAppOrigin(env.APP_ORIGIN,env);
  if(env.BILLING_LEGAL_APPROVED!=='true'||env.BILLING_WITHDRAWAL_APPROVED!=='true'||!env.LEGAL_BUSINESS_NAME?.trim()||!env.LEGAL_BUSINESS_ADDRESS?.trim()||!env.LEGAL_CONTACT_EMAIL?.includes('@')||!/^\d{8}$/.test(env.LEGAL_CVR||'')
    ||!validOrigin||! /^(sk|rk)_test_[A-Za-z0-9_]+$/.test(env.STRIPE_SECRET_KEY||'')||!/^pk_test_[A-Za-z0-9_]+$/.test(env.STRIPE_PUBLISHABLE_KEY||'')||!env.STRIPE_WEBHOOK_SECRET||(requireFirebase&&!firebaseIdentityConfigured(env))
    ||c.schemaVersion!==1||c.price?.confirmed!==true||c.price.currency!=='dkk'||c.price.includesVat!==true||c.pass?.confirmed!==true||c.pass.autoRenew!==false||c.free?.confirmed!==true
    ||!Array.isArray(c.plans)||c.plans.length!==3||new Set(c.plans.map(p=>p.id)).size!==3||c.plans.some(p=>!Object.hasOwn(DURATIONS,p.id)||JSON.stringify(p.duration)!==JSON.stringify(DURATIONS[p.id])||p.stripePriceEnv!==PLAN_ENV[p.id]||!/^price_[A-Za-z0-9]+$/.test(env[p.stripePriceEnv]||'')||!Number.isFinite(p.amountDkk)||p.amountDkk<=0||!Number.isSafeInteger(p.amountDkk*100))
    ||!Array.isArray(c.free.learnChapters)||!c.free.learnChapters.every(v=>Number.isSafeInteger(v)&&v>0)||!Array.isArray(c.free.gameLevels)||!c.free.gameLevels.every(v=>Number.isSafeInteger(v)&&v>0)||!Number.isSafeInteger(c.free.practiceQuestionsPerDay)||c.free.practiceQuestionsPerDay<0||typeof c.termsVersion!=='string'||!c.termsVersion||c.termsVersion.startsWith('draft-'))return 'not_configured';
  return null;
}
export function publicBillingStatus(c,env){
  const problem=billingConfigProblem(c,env,{requireFirebase:true});
  return {ready:!problem,reason:problem,message:problem?'Betaling er ikke klar endnu.':'Sikker testbetaling er klar.',testMode:true,uiMode:'elements',currency:'dkk',publishableKey:problem?null:env.STRIPE_PUBLISHABLE_KEY,
    plans:Array.isArray(c?.plans)?c.plans.filter(p=>Object.hasOwn(DURATIONS,p.id)).map(p=>({id:p.id,label:p.label,duration:p.duration,amountTotalOre:Number.isSafeInteger(p.amountDkk*100)&&p.amountDkk>0?p.amountDkk*100:null})):[]};
}
