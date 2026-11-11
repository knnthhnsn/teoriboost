export const PAYMENT_APPEARANCE={
  theme:'flat',variables:{fontFamily:'Atkinson, Arial, sans-serif',fontSizeBase:'16px',colorPrimary:'#1F2328',colorBackground:'#FEFFED',colorText:'#1F2328',colorTextSecondary:'#525C65',colorTextPlaceholder:'#525C65',colorDanger:'#1F2328',colorSuccess:'#1F2328',colorWarning:'#1F2328',borderRadius:'9px',spacingUnit:'4px'},
  rules:{'.Input':{border:'1px solid #C2CCD6',boxShadow:'none'},'.Input:focus':{border:'1px solid #1F2328',boxShadow:'0 0 0 1px #1F2328'},'.Tab':{border:'1px solid #C2CCD6',boxShadow:'none'},'.Tab--selected':{border:'1px solid #1F2328',backgroundColor:'#F4F5F7',boxShadow:'none'},'.Label':{color:'#1F2328'},'.Error':{color:'#1F2328'}}
};
// Presentation only: the iframe receives the same resolved tokens as the app page.
export function paymentAppearanceFromApp(win,root){
  const style=win.getComputedStyle?.(root);
  if(!style)return PAYMENT_APPEARANCE;
  const token=(name,fallback)=>style.getPropertyValue(name).trim()||fallback;
  const ink=token('--ink',PAYMENT_APPEARANCE.variables.colorText),panel=token('--panel',PAYMENT_APPEARANCE.variables.colorBackground),muted=token('--muted',PAYMENT_APPEARANCE.variables.colorTextSecondary),line=token('--line-strong','#C2CCD6');
  return {...PAYMENT_APPEARANCE,variables:{...PAYMENT_APPEARANCE.variables,fontFamily:token('--font-text',PAYMENT_APPEARANCE.variables.fontFamily),colorPrimary:ink,colorBackground:panel,colorText:ink,colorTextSecondary:muted,colorTextPlaceholder:muted,colorDanger:ink,colorSuccess:ink,colorWarning:ink},
    rules:{...PAYMENT_APPEARANCE.rules,'.Input':{border:'1px solid '+line,boxShadow:'none'},'.Input:focus':{border:'1px solid '+ink,boxShadow:'0 0 0 1px '+ink},'.Tab':{border:'1px solid '+line,boxShadow:'none'},'.Tab--selected':{border:'1px solid '+ink,backgroundColor:token('--panel2','#F4F5F7'),boxShadow:'none'},'.Label':{color:ink},'.Error':{color:ink}}};
}
let scriptPromise;
export async function loadStripeFactory({doc=globalThis.document,win=globalThis.window}={}){
  if(win.Stripe)return win.Stripe;
  if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{
    const script=doc.createElement('script');script.src='https://js.stripe.com/endive/stripe.js';script.async=true;
    script.onload=()=>win.Stripe?resolve(win.Stripe):reject(new Error('Betalingsfelterne kunne ikke indlæses.'));
    script.onerror=()=>reject(new Error('Ingen forbindelse til betalingen. Prøv igen, når du er online.'));
    doc.head.append(script);
  }).catch(error=>{scriptPromise=null;throw error;});
  return scriptPromise;
}
export async function mountStripePayment({session,root,win=globalThis.window,stripeLoader=loadStripeFactory,onTotal,onConfirm,onError}){
  if(!/^pk_test_/.test(session.publishableKey||'')||!session.clientSecret||session.uiMode!=='elements')throw new Error('Betaling er ikke åbnet endnu.');
  const factory=await stripeLoader();
  const stripe=factory(session.publishableKey,{locale:'da'});
  const checkout=stripe.initCheckoutElementsSdk({clientSecret:session.clientSecret,elementsOptions:{appearance:paymentAppearanceFromApp(win,root),fonts:[{family:'Atkinson',src:'url('+new URL('assets/fonts/atkinson-400.woff2',win.location.href).href+')',weight:'400'}]}});
  const loaded=await checkout.loadActions();
  if(loaded.type!=='success')throw new Error('Betalingsfelterne kunne ikke indlæses. Prøv igen.');
  const actions=loaded.actions;
  let valid=false,destroyed=false;
  function total(){
    const current=actions.getSession();
    // Stripe requires reading and displaying the current SDK total before confirmation.
    const amount=current.total.total.minorUnitsAmount,currency=current.currency,divisor=current.minorUnitsAmountDivisor;
    valid=current.livemode===false&&currency==='dkk'&&divisor===100&&Number.isSafeInteger(amount)&&amount===session.amountTotalOre;
    if(!valid)throw new Error('Prisen har ændret sig. Vælg dit pas igen, før du betaler.');
    onTotal(amount);return amount;
  }
  try{total();}catch(error){checkout.destroy?.();throw error;}
  checkout.on('change',()=>{if(destroyed)return;try{total();}catch(error){valid=false;onError(error);}});
  const payment=checkout.createPaymentElement({layout:'accordion'});
  payment.mount(root.querySelector('[data-payment-element]'));
  const express=checkout.createExpressCheckoutElement({buttonHeight:48,buttonTheme:{applePay:'black',googlePay:'black'},layout:{maxColumns:1,maxRows:0}});
  express.on('ready',event=>{root.querySelector('[data-payment-express]').hidden=!Object.values(event.availablePaymentMethods||{}).some(Boolean);});
  express.on('confirm',event=>{if(!valid){onError(new Error('Kontrollér prisen, og prøv igen.'));return;}void onConfirm(event);});
  express.mount(root.querySelector('[data-express-element]'));
  return {async confirm({email,expressCheckoutConfirmEvent}={}){if(destroyed||!valid)throw new Error('Vælg dit pas igen for at fortsætte.');total();return actions.confirm({redirect:'if_required',...(email?{email}:{}),...(expressCheckoutConfirmEvent?{expressCheckoutConfirmEvent}:{})});},destroy(){destroyed=true;payment.destroy();express.destroy();checkout.destroy?.();}};
}
