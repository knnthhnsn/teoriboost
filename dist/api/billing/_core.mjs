import {billingConfigProblem,validAppOrigin} from './_config.mjs';
import {makeCheckoutSessions} from './_sessions.mjs';
import {makeReferralService} from '../referral/_service.mjs';
import { createHash, timingSafeEqual, randomUUID, randomBytes } from 'node:crypto';



export class ApiError extends Error {

  constructor(status, code, message) { super(message); Object.assign(this, {status, code}); }

}

const fail = (status, code, message) => { throw new ApiError(status, code, message); };

export const sha256 = value => createHash('sha256').update(value).digest('hex');

const iso = n => new Date(n).toISOString();

const docId = value => sha256(String(value));

export const TERMS_CONSENT = 'Jeg accepterer handelsbetingelserne.';

export const ACCESS_CONSENT = 'Jeg anmoder om, at leveringen af det digitale indhold begynder straks inden udløbet af fortrydelsesfristen, og jeg anerkender, at jeg mister min fortrydelsesret, når leveringen begynder.';

const PLAN_DURATION = {'7-days':{days:7},'30-days':{days:30},'1-year':{years:1}};

const PLAN_ENV = {'7-days':'STRIPE_PRICE_ID_7_DAYS','30-days':'STRIPE_PRICE_ID','1-year':'STRIPE_PRICE_ID_1_YEAR'};

export function expirationFor(value,duration) {

  if(duration.days === 7 || duration.days === 30) return iso(Date.parse(value)+duration.days*86400000);

  if(duration.years === 1) return addCalendarMonths(value,12);

  throw new ApiError(503,'BILLING_DISABLED','Adgangsperioden er ikke bekræftet.');

}

const id = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);

export function addCalendarMonths(value, months) {

  const date = new Date(value), day = date.getUTCDate();

  date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + months);

  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();

  date.setUTCDate(Math.min(day, last)); return date.toISOString();

}

export function summarize(data, now = Date.now()) {

  const grants = Object.values(data?.grants || {}).map(g => ({source:g.source, grantedAt:g.grantedAt, expiresAt:g.expiresAt ?? null, ...(g.revokedAt ? {revokedAt:g.revokedAt} : {})}));

  const active = grants.filter(g => !g.revokedAt && (!g.expiresAt || Date.parse(g.expiresAt) > now));

  return {premium:active.length > 0, expiresAt:active.some(g => !g.expiresAt) ? null : active.map(g => g.expiresAt).sort().at(-1) || null, grants};

}

export function makeService({store, verifyToken, getUser, stripe, env = {}, publicConfig, now = Date.now}) {

  const referral=makeReferralService({store,getUser,stripe,env,publicConfig,now});
  const checkoutSessions=makeCheckoutSessions({store,stripe,env,now,referral});
  async function authenticate(token) {

    if (typeof token !== 'string' || !token || token.length > 8192) fail(401,'AUTH_REQUIRED','Log ind for at fortsætte.');

    let user; try { user = await verifyToken(token, true); } catch(error) {
      // Missing federation/Google permissions are server configuration failures,
      // not bad user logins. Firebase wraps credential failures as app/* errors.
      if(error instanceof ApiError&&error.code==='AUTH_UNAVAILABLE')throw error;
      if(error?.code?.startsWith('app/')||['auth/insufficient-permission','auth/invalid-credential','auth/internal-error','auth/project-not-found'].includes(error?.code))fail(503,'AUTH_UNAVAILABLE','Konto og adgang er ikke aktiveret endnu.');
      fail(401,'AUTH_INVALID','Log ind igen for at fortsætte.');
    }

    if (!id(user?.uid) || !user.firebase?.sign_in_provider || user.firebase.sign_in_provider === 'anonymous') fail(403,'ACCOUNT_REQUIRED','Brug en rigtig konto for at fortsætte.');

    return user.uid;

  }

  async function entitlement(uid) { return {entitlement:summarize(await store.get(`entitlements/${uid}`), now())}; }

  async function limit(uid, ip, scope = 'promo') {

    const stamp = now(), windowMs = 15 * 60 * 1000;

    await store.transaction(async tx => {

      const paths = [`billingLimits/${scope}_u_${docId(uid)}`, `billingLimits/${scope}_i_${docId(ip)}`];

      const rows = await Promise.all(paths.map(p => tx.get(p)));

      const limits = scope === 'promo' ? [5,20] : [10,40];

      const next = rows.map(r => r && stamp < r.until ? {...r,count:r.count+1} : {count:1,until:stamp+windowMs});

      if (next.some((r,i) => r.count > limits[i])) fail(429,'RATE_LIMITED','For mange forsøg. Prøv igen om 15 minutter.');

      paths.forEach((p,i) => tx.set(p,next[i]));

    });

  }

  async function promo(uid, ip, input) {

    if (env.PROMO_ENABLED !== 'true' || !/^[a-f0-9]{64}$/i.test(env.PROMO_CODE_HASH || '')) fail(503,'PROMO_DISABLED','Rabatkoder er ikke aktiveret endnu.');

    await limit(uid,ip);

    const code = typeof input?.code === 'string' ? input.code.trim().toUpperCase() : '';

    const hash = Buffer.from(sha256(code));

    if (code.length > 64 || !timingSafeEqual(hash,Buffer.from(env.PROMO_CODE_HASH.toLowerCase()))) fail(400,'PROMO_INVALID','Koden er ikke gyldig.');

    const stamp = now(), grantedAt = iso(stamp);

    await store.transaction(async tx => {

      const path = `entitlements/${uid}`, data = await tx.get(path) || {grants:{}};

      const stats = await tx.get('billingPromoStats/turbo') || {uniqueUses:0};
      const referralBinding=await tx.get(`referralBindings/${uid}`);
      if(referralBinding) fail(409,'PROMO_REFERRAL_EXCLUSIVE','TURBO kan ikke kombineres med en invitation.');

      // Replays retain the original grant and do not consume the unique-use cap.

      if (data.grants?.promo_turbo) return;

      if (env.PROMO_EXPIRES_AT && (!Number.isFinite(Date.parse(env.PROMO_EXPIRES_AT)) || stamp >= Date.parse(env.PROMO_EXPIRES_AT))) fail(410,'PROMO_EXPIRED','Koden er udløbet.');

      // Kenneth, 2 Nov 2026: 20 people, permanent access.
      // A missing environment cap must not accidentally create an unlimited code.
      const maxUses=env.PROMO_MAX_USES??'20';
      if (!/^\d+$/.test(maxUses) || !Number.isSafeInteger(Number(maxUses)) || stats.uniqueUses >= Number(maxUses)) fail(410,'PROMO_EXHAUSTED','Koden er brugt op.');

      tx.set(path,{...data,grants:{...data.grants,promo_turbo:{source:'promo:TURBO',grantedAt,expiresAt:null}},updatedAt:grantedAt});

      tx.set('billingPromoStats/turbo',{uniqueUses:stats.uniqueUses+1,updatedAt:grantedAt});

    });

    return entitlement(uid);

  }

  function billingConfig(){if(billingConfigProblem(publicConfig,env))fail(503,'BILLING_DISABLED','Betaling er ikke aktiveret endnu.');return publicConfig;}

  function stripeReady() {

    if (!stripe || !/^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY || '')) fail(503,'BILLING_DISABLED','Betaling er ikke aktiveret endnu.');

  }

  function priceValid(p,snapshot) {

    if (!p || p.id !== snapshot.priceId || p.livemode !== false || p.active !== true || p.type !== 'one_time' || p.currency !== 'dkk' || p.unit_amount !== snapshot.amountTotal || p.tax_behavior !== 'inclusive') fail(503,'PRICE_MISMATCH','Prisen kan ikke bekræftes lige nu.');

  }

  async function checkout(uid,ip,input) {

    const c = billingConfig(); stripeReady();

    const plan = c.plans.find(p=>p.id===input?.planId);

    if(!plan) fail(400,'PLAN_INVALID','Vælg en adgangsperiode.');

    if(!/^price_[A-Za-z0-9]+$/.test(env[plan.stripePriceEnv] || '')) fail(503,'BILLING_DISABLED','Betaling er ikke aktiveret endnu.');

    if (input?.immediateAccessConsent !== true || input?.termsAccepted !== true) fail(400,'CONSENT_REQUIRED','Accepter vilkårene og giv udtrykkeligt samtykke til adgang med det samme.');

    let origin; try { origin = new URL(env.APP_ORIGIN); if (!validAppOrigin(env.APP_ORIGIN,env)) throw Error(); } catch { fail(503,'BILLING_DISABLED','Betaling er ikke aktiveret endnu.'); }

    await limit(uid,ip,'checkout');
    const resume=await checkoutSessions.recover(uid,plan.id);if(resume)return resume;

    const snapshot = {priceId:env[plan.stripePriceEnv],planId:plan.id,duration:plan.duration,amountTotal:plan.amountDkk*100,currency:'dkk',includesVat:true,autoRenew:false,termsVersion:c.termsVersion,

      businessName:env.LEGAL_BUSINESS_NAME,address:env.LEGAL_BUSINESS_ADDRESS,contactEmail:env.LEGAL_CONTACT_EMAIL,cvr:env.LEGAL_CVR,

      immediateAccessConsent:true,termsAccepted:true,termsConsentText:TERMS_CONSENT,accessConsentText:ACCESS_CONSENT,termsUrl:`${origin.origin}/handelsbetingelser.html`,consentedAt:iso(now())};

    const orderId=randomUUID(), price=await stripe.prices.retrieve(snapshot.priceId);
    priceValid(price,snapshot);
    const discount=await referral.checkoutDiscount(uid,orderId,price);
    if(discount){snapshot.amountBeforeDiscount=snapshot.amountTotal;snapshot.amountTotal=Math.round(snapshot.amountTotal*(100-discount.discountPercent)/100);snapshot.referral=discount;}

    const snapshotHash = sha256(JSON.stringify(snapshot));

    const metadata = {orderId,uid,planId:plan.id,termsVersion:snapshot.termsVersion,snapshotHash};

    const checkoutRequest={ui_mode:'elements',mode:'payment',...(snapshot.referral?{discounts:[{coupon:snapshot.referral.couponId}]}:{}),line_items:[{price:snapshot.priceId,quantity:1}],client_reference_id:uid,metadata,

      payment_intent_data:{metadata,description:`TeoriBoost ${plan.label}. ${TERMS_CONSENT} ${ACCESS_CONSENT} Vilkår: ${snapshot.termsUrl} (${snapshot.termsVersion}). Samtykke: ${snapshot.consentedAt}`},return_url:`${origin.origin}/betaling.html?session_id={CHECKOUT_SESSION_ID}`,locale:'da',

      integration_identifier:`teoriboost_${Array.from(randomBytes(8),b=>String.fromCharCode(97+b%26)).join('')}`};
    if(getUser){const user=await getUser(uid);if(!user.disabled&&user.emailVerified&&typeof user.email==='string'&&user.email.length<=254&&!/[\r\n]/.test(user.email))checkoutRequest.customer_email=user.email;}
    try{await store.set(`billingOrders/${orderId}`,{uid,snapshot,snapshotHash,checkoutRequest,createdAt:iso(now()),sessionId:null});}
    catch(error){await referral.releaseClaim(uid,orderId);throw error;}
    const remembered=await checkoutSessions.remember(uid,orderId);if(remembered!==orderId){await referral.releaseClaim(uid,orderId);return checkoutSessions.recover(uid,plan.id);}
    await referral.beforeProvider(uid,orderId);
    let session;try{session=await stripe.checkout.sessions.create(checkoutRequest,{idempotencyKey:orderId});}
    catch(error){if(error?.type==='StripeInvalidRequestError'&&error.statusCode===400){await referral.releaseClaim(uid,orderId,true);await checkoutSessions.clearState(uid,orderId);}throw error;}

    const savedOrder=await store.get(`billingOrders/${orderId}`);
    const result=checkoutSessions.payload(session,savedOrder,uid);
    try{await checkoutSessions.bind(session,orderId,uid);}catch(error){if(error instanceof ApiError)throw error;}
    return result;
  }
  async function resume(uid,ip,input){billingConfig();stripeReady();await limit(uid,ip,'checkout');return checkoutSessions.resume(uid,input);}
  async function cancel(uid,ip,input){billingConfig();stripeReady();await limit(uid,ip,'checkout');return checkoutSessions.cancel(uid,input);}

  async function complete(event) {

    const session = await stripe.checkout.sessions.retrieve(event.data.object.id,{expand:['line_items.data.price','payment_intent.latest_charge','discounts.coupon']});

    if (session.livemode !== false || session.mode !== 'payment' || session.payment_status !== 'paid') return;

    const metadata = session.metadata || {}, orderPath = `billingOrders/${metadata.orderId}`;

    if (!id(metadata.orderId)) fail(400,'EVENT_INVALID','Betalingshændelsen kunne ikke bekræftes.');

    const order = await store.get(orderPath), s = order?.snapshot;

    if (!order || !id(order.uid) || session.client_reference_id !== order.uid || metadata.uid !== order.uid || metadata.snapshotHash !== order.snapshotHash || metadata.termsVersion !== s?.termsVersion || metadata.planId !== s?.planId

      || sha256(JSON.stringify(s)) !== order.snapshotHash || (order.sessionId && order.sessionId !== session.id) || session.currency !== 'dkk' || session.amount_total !== s.amountTotal

      || session.line_items?.has_more !== false || session.line_items.data.length !== 1 || session.line_items.data[0].quantity !== 1) fail(400,'EVENT_INVALID','Betalingshændelsen kunne ikke bekræftes.');

    priceValid(session.line_items.data[0].price,{...s,amountTotal:s.amountBeforeDiscount??s.amountTotal});
    await referral.couponValid(session,s);

    const pi = session.payment_intent;

    if (!pi || !id(pi.id) || pi.livemode !== false || pi.status !== 'succeeded' || pi.amount_received !== s.amountTotal || pi.currency !== 'dkk' || Object.entries(metadata).some(([k,v]) => pi.metadata?.[k] !== v)) fail(400,'EVENT_INVALID','Betalingshændelsen kunne ikke bekræftes.');

    const fullOrdinaryRefund=pi.latest_charge?.refunded===true && await referral.ordinaryRefundAmount(pi.latest_charge)>=pi.latest_charge.amount;
    const grantKey = `stripe_${session.id}`, stamp = iso(now()), eventPath = `billingEvents/${event.id}`;

    await store.transaction(async tx => {

      const checkoutState=await tx.get(`billingCheckoutState/${order.uid}`);
      const binding = await tx.get(orderPath), previous = await tx.get(eventPath), data = await tx.get(`entitlements/${order.uid}`) || {grants:{}}, reversal = await tx.get(`billingReversals/${pi.id}`);
      if (!binding || binding.snapshotHash !== order.snapshotHash || binding.uid !== order.uid || (binding.sessionId && binding.sessionId !== session.id)) fail(409,'ORDER_CONFLICT','Betalingshændelsen kunne ikke knyttes til ordren.');

      if (previous) return;

      const persistPayment=await referral.recordPaid(tx,{uid:order.uid,pi,snapshot:s,paidAt:iso(event.created*1000)});
      const old = data.grants?.[grantKey], grantedAt = old?.grantedAt || iso(event.created*1000);

      const refunded = fullOrdinaryRefund;

      const grant = old || {source:`stripe:${session.id}`,grantedAt,expiresAt:expirationFor(grantedAt,s.duration)};

      if ((reversal || refunded) && !grant.revokedAt) Object.assign(grant,{revokedAt:reversal?.revokedAt || stamp,revocationReason:reversal?.reason || 'refund'});
      if(checkoutState?.orderId===metadata.orderId)tx.set(`billingCheckoutState/${order.uid}`,{orderId:null,updatedAt:stamp});
      tx.set(orderPath,{...binding,sessionId:session.id});

      tx.set(`entitlements/${order.uid}`,{...data,grants:{...data.grants,[grantKey]:grant},updatedAt:stamp});

      tx.set(`billingPayments/${pi.id}`,{uid:order.uid,grantKey,sessionId:session.id,amountTotal:s.amountTotal,currency:'dkk'});

      persistPayment();
      tx.set(eventPath,{type:event.type,processedAt:stamp});

    });

  }

  async function reverse(event) {

    const object = event.data.object;

    const charge = event.type === 'charge.refunded' ? await stripe.charges.retrieve(object.id) : await stripe.charges.retrieve(typeof object.charge === 'string' ? object.charge : object.charge?.id);

    if (charge.livemode !== false || charge.currency !== 'dkk' || !id(typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id)) fail(400,'EVENT_INVALID','Betalingshændelsen kunne ikke bekræftes.');

    if (event.type === 'charge.refunded' && !(charge.refunded === true && charge.amount_refunded >= charge.amount)) return;

    if(event.type==='charge.refunded' && await referral.ordinaryRefundAmount(charge)<charge.amount)return;
    if (event.type.startsWith('charge.dispute.') && !['needs_response','under_review','lost','warning_needs_response','warning_under_review'].includes(object.status)) return;

    const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent.id, stamp = iso(now());

    await store.transaction(async tx => {

      const seen = await tx.get(`billingEvents/${event.id}`), mapping = await tx.get(`billingPayments/${pi}`), old = await tx.get(`billingReversals/${pi}`);

      const data = mapping ? await tx.get(`entitlements/${mapping.uid}`) : null;

      if (seen) return;

      const reason = event.type === 'charge.refunded' ? 'refund' : 'dispute';

      tx.set(`billingReversals/${pi}`,old || {revokedAt:stamp,reason});

      if (mapping && data?.grants?.[mapping.grantKey]) {

        const grants = {...data.grants,[mapping.grantKey]:{...data.grants[mapping.grantKey],revokedAt:old?.revokedAt || stamp,revocationReason:old?.reason || reason}};

        tx.set(`entitlements/${mapping.uid}`,{...data,grants,updatedAt:stamp});

      }

      tx.set(`billingEvents/${event.id}`,{type:event.type,processedAt:stamp});

    });

  }

  async function webhook(raw,signature) {

    stripeReady();

    if (!env.STRIPE_WEBHOOK_SECRET) fail(503,'BILLING_DISABLED','Betaling er ikke aktiveret endnu.');

    let event; try { event = stripe.webhooks.constructEvent(raw,signature,env.STRIPE_WEBHOOK_SECRET); } catch { fail(400,'SIGNATURE_INVALID','Ugyldig signatur.'); }

    if (!id(event.id) || event.livemode !== false || !Number.isSafeInteger(event.created)) fail(400,'EVENT_INVALID','Betalingshændelsen kunne ikke bekræftes.');

    if (['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)) await complete(event);

    else if (['charge.refunded','charge.dispute.created','charge.dispute.updated','charge.dispute.closed'].includes(event.type)) await reverse(event);
    else if(event.type==='checkout.session.expired')await referral.expireSession(await stripe.checkout.sessions.retrieve(event.data.object.id));

    return {received:true};

  }

  return {authenticate,entitlement,promo,checkout,resume,cancel,restore:entitlement,webhook,referral};

}

