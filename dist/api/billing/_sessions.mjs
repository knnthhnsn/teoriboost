import {ApiError,sha256,TERMS_CONSENT,ACCESS_CONSENT} from './_core.mjs';
const fail=(status,code,message)=>{throw new ApiError(status,code,message);};
const validId=value=>typeof value==='string'&&/^cs_test_[A-Za-z0-9_]{1,180}$/.test(value);
export function makeCheckoutSessions({store,stripe,env,now=Date.now,referral}){
  function validate(session,order,uid){const s=order?.snapshot,m=session?.metadata;
    if(!order||order.uid!==uid||m?.uid!==uid||session.client_reference_id!==uid)fail(403,'SESSION_NOT_OWNED','Denne betaling tilhører ikke din konto.');
    if(!validId(session.id)||session.livemode!==false||session.mode!=='payment'||session.ui_mode!=='elements'||order.checkoutRequest?.ui_mode!=='elements'||!['open','complete','expired'].includes(session.status)
      ||m.orderId!==order.checkoutRequest.metadata.orderId||m.planId!==s.planId||m.termsVersion!==s.termsVersion||m.snapshotHash!==order.snapshotHash||sha256(JSON.stringify(s))!==order.snapshotHash||(order.sessionId&&order.sessionId!==session.id)
      ||s.termsAccepted!==true||s.immediateAccessConsent!==true||s.termsConsentText!==TERMS_CONSENT||s.accessConsentText!==ACCESS_CONSENT||!Number.isFinite(Date.parse(s.consentedAt))
      ||session.currency!=='dkk'||session.amount_total!==s.amountTotal)fail(409,'SESSION_INVALID','Betalingen kunne ikke bekræftes. Start betalingen igen.');
    if(session.status==='open'&&(typeof session.client_secret!=='string'||session.client_secret.length>1024||!session.client_secret.startsWith(session.id+'_secret_')||!/^[A-Za-z0-9_-]+$/.test(session.client_secret)))fail(502,'CHECKOUT_FAILED','Betalingen kunne ikke åbnes. Prøv igen.');
    if(session.status==='open'&&session.payment_status!=='unpaid')fail(409,'PAYMENT_PROCESSING','Betalingen behandles allerede. Afvent bekræftelsen.');
  }
  function payload(session,order,uid){validate(session,order,uid);const s=order.snapshot,base=s.amountBeforeDiscount??s.amountTotal;return {sessionId:session.id,status:session.status,clientSecret:session.status==='open'?session.client_secret:null,publishableKey:env.STRIPE_PUBLISHABLE_KEY,uiMode:'elements',planId:s.planId,amountTotalOre:s.amountTotal,amountBeforeDiscountOre:base,discountAmountOre:base-s.amountTotal,currency:'dkk',includesVat:true,termsVersion:s.termsVersion};}
  async function bind(session,orderId,uid){await store.transaction(async tx=>{const p=`billingOrders/${orderId}`,order=await tx.get(p);validate(session,order,uid);tx.set(p,{...order,sessionId:session.id});});}
  async function load(sessionId,uid){if(!validId(sessionId))fail(400,'SESSION_INVALID','Betalingsnummeret er ikke gyldigt.');const session=await stripe.checkout.sessions.retrieve(sessionId);const orderId=session?.metadata?.orderId;
    if(typeof orderId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(orderId))fail(403,'SESSION_NOT_OWNED','Denne betaling tilhører ikke din konto.');const order=await store.get(`billingOrders/${orderId}`);validate(session,order,uid);return {session,order,orderId};}
  async function clearState(uid,orderId){await store.transaction(async tx=>{const path=`billingCheckoutState/${uid}`,state=await tx.get(path);if(state?.orderId===orderId)tx.set(path,{orderId:null,updatedAt:new Date(now()).toISOString()});});}
  async function remember(uid,orderId){return store.transaction(async tx=>{const p=`billingCheckoutState/${uid}`,state=await tx.get(p);if(state?.orderId&&state.orderId!==orderId)return state.orderId;tx.set(p,{orderId,updatedAt:new Date(now()).toISOString()});return orderId;});}
  async function recover(uid,planId){const state=await store.get(`billingCheckoutState/${uid}`),b=await store.get(`referralBindings/${uid}`),orderId=state?.orderId||(!b?.paidPaymentIntent&&b?.discountOrderId);if(!orderId)return null;const order=await store.get(`billingOrders/${orderId}`);
    if(!order){await referral.releaseClaim(uid,orderId);await clearState(uid,orderId);return null;}
    if(order.uid!==uid)fail(403,'SESSION_NOT_OWNED','Denne betaling tilhører ikke din konto.');if(order.snapshot.planId!==planId)fail(409,'ORDER_PENDING_PLAN','Du har en betaling for en anden adgangsperiode. Luk den eksisterende betaling først.');
    if(order.checkoutRequest?.ui_mode!=='elements')fail(409,'CHECKOUT_RESTART_REQUIRED','En tidligere betaling kræver kontrol, før du kan starte igen.');
    let session;if(order.sessionId)session=await stripe.checkout.sessions.retrieve(order.sessionId);else{
      if(now()-Date.parse(order.createdAt)>20*3600000)fail(409,'CHECKOUT_REVIEW_REQUIRED','Din tidligere betaling kræver manuel kontrol.');
      await referral.beforeProvider(uid,orderId);session=await stripe.checkout.sessions.create(order.checkoutRequest,{idempotencyKey:orderId});await bind(session,orderId,uid);
    }
    validate(session,order,uid);if(session.status==='expired'){await referral.expireSession(session);await clearState(uid,orderId);return null;}return payload(session,order,uid);
  }
  async function resume(uid,input){const {session,order,orderId}=await load(input?.sessionId,uid);if(!order.sessionId)await bind(session,orderId,uid);return payload(session,order,uid);}
  async function cancel(uid,input){const {session,order,orderId}=await load(input?.sessionId,uid);if(session.status==='complete')return payload(session,order,uid);let current=session;
    if(current.status==='open'){
      try{current=await stripe.checkout.sessions.expire(session.id);}catch(error){const latest=await stripe.checkout.sessions.retrieve(session.id);validate(latest,order,uid);if(latest.status==='complete')return payload(latest,order,uid);if(latest.status!=='expired')throw error;current=latest;}
      validate(current,order,uid);if(current.status!=='expired')fail(409,'PAYMENT_PROCESSING','Betalingen kunne ikke lukkes endnu.');
    }
    await referral.expireSession(current);await clearState(uid,orderId);return payload(current,order,uid);
  }
  return {payload,bind,remember,recover,resume,cancel,clearState};
}
