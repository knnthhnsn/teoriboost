import status from './_status.mjs';
import {createHandler} from './_runtime.mjs';
// One frameworkless Vercel Function serves the existing public billing URLs.
// Preserve exact Stripe webhook bytes; the other handlers already parse JSON streams.
export const config={api:{bodyParser:false},maxDuration:60};
const defaults={status,checkout:createHandler('checkout'),resume:createHandler('resume'),cancel:createHandler('cancel'),entitlement:createHandler('entitlement'),restore:createHandler('restore'),webhook:createHandler('webhook')};
export function createBillingDispatcher({handlers=defaults}={}){return async(req,res)=>{
  let action;try{action=/^\/api\/billing\/(status|checkout|resume|cancel|entitlement|restore|webhook)\/?$/.exec(new URL(req.url,'http://internal.invalid').pathname)?.[1];}catch{}
  if(!action||!Object.hasOwn(handlers,action)){res.statusCode=404;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','private, no-store');res.end(JSON.stringify({error:{code:'NOT_FOUND',message:'Betalingssiden findes ikke.'}}));return;}
  return handlers[action](req,res);
};}
export default createBillingDispatcher();
