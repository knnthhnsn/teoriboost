import {readFile} from 'node:fs/promises';
import {makeService,ApiError} from './_core.mjs';
import {createFirebaseIdentity} from './_firebase-identity.mjs';

let runtime, adminResources;
export function getService() {
  // Initialization never creates an account, key, Firebase project, or Stripe product.
  return runtime ||= initialize().catch(error => {runtime = null; throw error;});
}
export function getAdminResources() {
  return adminResources ||= initializeAdmin().catch(error => {adminResources=null; throw error;});
}
async function initializeAdmin() {
  const env = process.env;
  if (!env.FIREBASE_PROJECT_ID) throw new ApiError(503,'AUTH_UNAVAILABLE','Konto og adgang er ikke aktiveret endnu.');
  const [{getApps,initializeApp},{getAuth},{Firestore},identity] = await Promise.all([
    import('firebase-admin/app'),import('firebase-admin/auth'),import('@google-cloud/firestore'),createFirebaseIdentity(env)
  ]);
  const app = getApps().find(a => a.name === 'teoriboost-billing') || initializeApp({projectId:env.FIREBASE_PROJECT_ID,credential:identity.credential},'teoriboost-billing');
  const db = new Firestore(identity.firestoreOptions);
  const store = {
    async get(path) {const s = await db.doc(path).get(); return s.exists ? s.data() : null;},
    async set(path,data) {await db.doc(path).set(data);},
    async list(collection,{status,eligibleBefore,limit=100}={}) {let query=db.collection(collection);if(status)query=query.where('status','in',status);if(eligibleBefore)query=query.where('eligibleAt','<=',eligibleBefore).orderBy('eligibleAt','asc');const rows=await query.limit(Math.min(limit,100)).get();return rows.docs.map(d=>({id:d.id,...d.data()}));},
    transaction(fn) {return db.runTransaction(tx => fn({
      async get(path) {const s = await tx.get(db.doc(path)); return s.exists ? s.data() : null;},
      set(path,data) {tx.set(db.doc(path),data);}
    }));}
  };
  return {store,verifyToken:(token,checkRevoked)=>getAuth(app).verifyIdToken(token,checkRevoked),getUser:uid=>getAuth(app).getUser(uid)};
}
async function initialize() {
  const env=process.env, {store,verifyToken,getUser}=await getAdminResources();
  let publicConfig = null; try {publicConfig = JSON.parse(await readFile(new URL('../../premium-config.json',import.meta.url),'utf8'));} catch {/* Fail closed. */}
  let stripe = null;
  if (/^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY || '')) {
    const {default:Stripe} = await import('stripe');
    stripe = new Stripe(env.STRIPE_SECRET_KEY,{apiVersion:'2026-09-30.endive',maxNetworkRetries:2});
  }
  return makeService({store,verifyToken,getUser,stripe,env,publicConfig});
}
export async function readRaw(req, max = 65536) {
  if (Buffer.isBuffer(req.body)) {if(req.body.length > max) throw new ApiError(413,'BODY_TOO_LARGE','Anmodningen er for stor.'); return req.body;}
  if (typeof req.body === 'string') {if(Buffer.byteLength(req.body)>max) throw new ApiError(413,'BODY_TOO_LARGE','Anmodningen er for stor.'); return Buffer.from(req.body);}
  if (req.body != null) throw new ApiError(400,'RAW_BODY_REQUIRED','Betalingshændelsen skal modtages uændret.');
  let size=0; const chunks=[];
  for await (const chunk of req) {const bytes=Buffer.from(chunk); size+=bytes.length; if(size>max) throw new ApiError(413,'BODY_TOO_LARGE','Anmodningen er for stor.'); chunks.push(bytes);}
  return Buffer.concat(chunks);
}
export async function readJson(req) {
  let input;
  try {input = req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : JSON.parse((await readRaw(req,4096)).toString() || '{}');}
  catch(e) {if(e instanceof ApiError) throw e; throw new ApiError(400,'INVALID_INPUT','Anmodningen er ikke gyldig.');}
  if (!input || Array.isArray(input) || typeof input !== 'object' || Buffer.byteLength(JSON.stringify(input))>4096) throw new ApiError(400,'INVALID_INPUT','Anmodningen er ikke gyldig.');
  return input;
}
export function requestIp(req,env) {
  // Only Vercel's overwritten, platform-specific header is trusted on Vercel.
  const value = env.VERCEL === '1' ? req.headers?.['x-vercel-forwarded-for'] : req.socket?.remoteAddress;
  return typeof value === 'string' && value.length <= 128 ? value.split(',')[0].trim() : 'unknown';
}
export function createHandler(action,{serviceProvider=getService,env=process.env} = {}) {
  return async (req,res) => {
    res.setHeader('Content-Type','application/json; charset=utf-8'); res.setHeader('Cache-Control','private, no-store'); res.setHeader('X-Content-Type-Options','nosniff');
    try {
      const method = action === 'entitlement' ? 'GET' : 'POST';
      if(req.method !== method) {res.setHeader('Allow',method); throw new ApiError(405,'METHOD_NOT_ALLOWED','Metoden er ikke tilladt.');}
      // Never trust the Host header for payment redirects or accept a different origin.
      if(action !== 'webhook' && req.headers?.origin && req.headers.origin !== env.APP_ORIGIN) throw new ApiError(403,'ORIGIN_INVALID','Anmodningen kommer fra en ukendt side.');
      if(action !== 'webhook' && method === 'POST' && (!env.APP_ORIGIN || req.headers?.origin !== env.APP_ORIGIN)) throw new ApiError(403,'ORIGIN_INVALID','Åbn TeoriBoost for at fortsætte.');
      const service=await serviceProvider(); let result;
      if(action === 'webhook') result = await service.webhook(await readRaw(req),req.headers?.['stripe-signature']);
      else {
        const match=/^Bearer ([A-Za-z0-9._-]{1,8192})$/.exec(req.headers?.authorization || '');
        const uid=await service.authenticate(match?.[1]);
        if(action==='entitlement' || action==='restore') result=await service[action](uid);
        else {const input=await readJson(req);result=action==='promo'&&typeof input.code==='string'&&input.code.trim().toUpperCase().startsWith('TEO-')?{referral:true,binding:await service.referral.bind(uid,input)}:await service[action](uid,requestIp(req,env),input);}
      }
      res.statusCode=200; res.end(JSON.stringify(result));
    } catch(error) {
      const safe=error instanceof ApiError;
      res.statusCode=safe ? error.status : 503;
      res.end(JSON.stringify({error:{code:safe ? error.code : 'SERVICE_UNAVAILABLE',message:safe ? error.message : 'Tjenesten er ikke klar lige nu. Prøv igen senere.'}}));
    }
  };
}
