/** Pure config check; safe for the public readiness route without loading SDKs. */
export function firebaseIdentityConfigured(env){
  const projectId=env.FIREBASE_PROJECT_ID;
  if(typeof projectId!=='string'||! /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId))return false;
  if(env.VERCEL!=='1'&&!env.VERCEL_ENV)return true;
  return env.VERCEL_ENV==='production'
    &&typeof env.FIREBASE_WIF_AUDIENCE==='string'
    &&/^\/\/iam\.googleapis\.com\/projects\/[1-9][0-9]{4,19}\/locations\/global\/workloadIdentityPools\/[a-z0-9-]{1,32}\/providers\/[a-z0-9-]{1,32}$/.test(env.FIREBASE_WIF_AUDIENCE)
    &&typeof env.FIREBASE_SERVICE_ACCOUNT_EMAIL==='string'
    &&new RegExp('^[a-z][a-z0-9-]{4,28}[a-z0-9]@'+projectId+'\\.iam\\.gserviceaccount\\.com$').test(env.FIREBASE_SERVICE_ACCOUNT_EMAIL);
}
