import {ApiError} from './_core.mjs';
import {firebaseIdentityConfigured} from './_firebase-config.mjs';

const unavailable=()=>new ApiError(503,'AUTH_UNAVAILABLE','Konto og adgang er ikke aktiveret endnu.');

/** One renewable identity shared by Firebase Auth and the Firestore server client. */
export async function createFirebaseIdentity(env=process.env,dependencies={}){
  const projectId=env.FIREBASE_PROJECT_ID;
  if(!firebaseIdentityConfigured(env))throw unavailable();

  // Local developer ADC is supported. Vercel never silently falls back to ADC or a key.
  if(env.VERCEL!=='1'&&!env.VERCEL_ENV){
    const {applicationDefault}=dependencies.adminApp||await import('firebase-admin/app');
    return {mode:'local-adc',credential:applicationDefault(),firestoreOptions:{projectId}};
  }

  const audience=env.FIREBASE_WIF_AUDIENCE,email=env.FIREBASE_SERVICE_ACCOUNT_EMAIL;
  const {ExternalAccountClient}=dependencies.googleAuth||await import('google-auth-library');
  // @vercel/oidc is the current package; @vercel/functions/oidc is deprecated.
  const {getVercelOidcToken}=dependencies.vercelOidc||await import('@vercel/oidc');
  const client=ExternalAccountClient.fromJSON({
    type:'external_account',audience,
    subject_token_type:'urn:ietf:params:oauth:token-type:jwt',
    token_url:'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url:'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/'+email+':generateAccessToken',
    scopes:['https://www.googleapis.com/auth/cloud-platform'],
    subject_token_supplier:{async getSubjectToken(){
      // Read at each Google refresh; the Vercel SDK handles its rotating token source.
      try{const token=await getVercelOidcToken();if(typeof token!=='string'||!token.trim()||token.length>32768)throw unavailable();return token;}
      catch{throw unavailable();}
    }}
  });
  if(!client)throw unavailable();
  const now=dependencies.now||Date.now;
  const credential={async getAccessToken(){
    try{
      const {token}=await client.getAccessToken();
      const expiresIn=Math.floor((client.credentials?.expiry_date-now())/1000);
      if(typeof token!=='string'||!token||!Number.isFinite(expiresIn)||expiresIn<=0)throw unavailable();
      return {access_token:token,expires_in:expiresIn};
    }catch{throw unavailable();}
  }};
  // firebase-admin/getFirestore rejects custom Credential objects. The native
  // Firestore client accepts this exact authClient, avoiding accidental ADC use.
  return {mode:'vercel-wif',credential,firestoreOptions:{projectId,authClient:client,preferRest:true}};
}
