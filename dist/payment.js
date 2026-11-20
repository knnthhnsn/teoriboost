import {createEntitlementClient,loadPremiumConfig,gatesEnabled} from './entitlements.js';
import {IMMEDIATE_ACCESS_TEXT} from './paywall.js';
import {mountStripePayment} from './payment-stripe.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money=ore=>new Intl.NumberFormat('da-DK',{style:'currency',currency:'DKK',minimumFractionDigits:ore%100===0?0:2,maximumFractionDigits:2}).format(ore/100);
export function paymentError(error){
  const code=error?.code||error?.type;
  if(code==='LOGIN_REQUIRED')return 'Log ind på din konto, før du bruger en kode.';
  if(code==='paymentFailed')return error.paymentFailed?.declineCode?'Betalingen blev afvist. Tjek oplysningerne, eller vælg en anden betalingsmetode. Din adgang er ikke aktiveret endnu.':'Betalingen blev ikke godkendt. Prøv igen, eller vælg en anden betalingsmetode.';
  if(['card_declined','insufficient_funds','expired_card','incorrect_cvc','incorrect_number'].includes(code))return 'Kortet blev afvist. Tjek oplysningerne, eller prøv et andet kort. Din adgang er ikke aktiveret endnu.';
  if(['api_connection_error','network_error','fetch_error'].includes(code)||error instanceof TypeError)return 'Forbindelsen blev afbrudt. Tjek din forbindelse, og prøv igen. Hvis du allerede har godkendt betalingen, så vælg Kontrollér adgang først.';
  if(code==='validation_error')return 'Tjek betalingsoplysningerne i felterne, og prøv igen.';
  if(['card_error','api_error','invalid_request_error'].includes(error?.type))return 'Betalingen kunne ikke godkendes. Tjek oplysningerne, eller prøv igen om lidt.';
  if(error?.code===null)return 'Betalingen kunne ikke gennemføres. Tjek oplysningerne og din forbindelse, og prøv igen.';
  return error?.message||'Betalingen kunne ikke gennemføres. Prøv igen om lidt.';
}

export function createPaymentPage({account,fetcher=globalThis.fetch,doc=globalThis.document,win=globalThis.window,config:providedConfig,mountPayment=mountStripePayment,pollMs=2000,maxPolls=20}={}){
  const root=doc.querySelector('#payment-main'),client=createEntitlementClient({account,fetcher});
  let config=providedConfig,status=null,selected=new URL(win.location.href).searchParams.get('plan')||'30-days';
  let stage='choose',busy=false,session=null,payment=null,discountPercent=0,message='',error=false,generation=0,disposed=false,pollTimer,polls=0;
  let lastIdentity='',initializing=true;
  const chosen=()=>config?.plans?.find(p=>p.id===selected);
  const available=()=>status?.ready===true&&gatesEnabled(config);
  const amount=p=>Math.round(p.amountDkk*100*(100-discountPercent)/100);
  const setMessage=(text,isError=false)=>{message=text;error=isError;const node=root.querySelector('[data-payment-message]');if(node){node.textContent=text;node.dataset.error=String(isError);node.setAttribute('role',isError?'alert':'status');}};
  function rememberSession(id){const url=new URL(win.location.href);if(id)url.searchParams.set('session_id',id);else url.searchParams.delete('session_id');win.history.replaceState(null,'',url.pathname+url.search+url.hash);}
  function cleanPayment(){payment?.destroy();payment=null;clearTimeout(pollTimer);}
  function plans(){return '<fieldset class="payment-plans"'+(stage!=='choose'?' disabled':'')+'><legend>Vælg dit pas</legend><div class="step-options payment-plan-grid">'+(config?.plans||[]).map(p=>'<label class="step-option payment-plan'+(selected===p.id?' is-on':'')+'"><input type="radio" name="plan" value="'+esc(p.id)+'"'+(selected===p.id?' checked':'')+'><strong>'+esc(p.label)+'</strong><b>'+esc(money(amount(p)))+'</b><small>inkl. moms</small></label>').join('')+'</div></fieldset><p class="payment-no-renew">Ét køb. Ingen automatisk fornyelse.</p>';}
  function accountMarkup(){const a=account.status();return '<div class="payment-account">'+(a.state==='user'?'<p>Adgang og kvittering til <b>'+esc(a.email||'din konto')+'</b>.</p>':a.state==='loading'?'<p>Kontrollerer din konto …</p>':['off','local'].includes(a.state)?'<p>Login og køb er ikke åbnet endnu. Du kan stadig øve gratis.</p>':'<p>Log ind, så adgangen følger din konto.</p><button type="button" data-action="google">Fortsæt med Google</button><br><a href="/?betaling=login#profil">Brug et e-maillink i din profil</a>')+'</div>';}
  function intro(){return '<section class="payment-intro"><div class="payment-hero"><div class="payment-heading"><p class="eyebrow payment-kicker">TeoriBoost Premium</p><h1>Én regel ad gangen.</h1></div><figure class="payment-guide" aria-hidden="true"><img src="assets/approved-cast/sneglen.png" width="1407" height="1118" alt="" decoding="async" fetchpriority="high"></figure><p class="payment-lead">Korte lektioner, rigtige trafiksituationer og forklaringen hver gang. Vælg den periode, der passer til din prøvedato.</p></div>'+plans()+'<ul class="payment-benefits"><li><span class="tb-stripes" aria-hidden="true"></span><span><b>Forklaringen hver gang</b><small>Også når du svarer forkert. Det, der driller, kommer igen.</small></span></li><li><span class="tb-stripes" aria-hidden="true"></span><span><b>Øveprøver som den rigtige</b><small>25 situationer, 25 minutter, højst 5 fejl. Alle emner.</small></span></li><li><span class="tb-stripes" aria-hidden="true"></span><span><b>Spil og hjælp fra Sneglen</b><small>Alle spilniveauer og AI-hjælp til teorien.</small></span></li><li><span class="tb-stripes" aria-hidden="true"></span><span><b>Din adgang følger dig</b><small>Log ind på din konto på en anden enhed.</small></span></li></ul>'+accountMarkup()+'</section>';}
  function order(){const p=chosen();if(!p)return '';const total=session?.amountTotalOre??amount(p),before=session?.amountBeforeDiscountOre??Math.round(p.amountDkk*100),discount=session?.discountAmountOre??before-total;return '<h2>Din bestilling</h2><dl class="payment-order"><dt>Premium · <span data-summary-plan>'+esc(p.label)+'</span></dt><dd>'+esc(money(before))+'</dd>'+(discount>0?'<dt>Din vens rabat</dt><dd>−'+esc(money(discount))+'</dd>':'')+'<dt class="payment-order-total">I alt i dag</dt><dd class="payment-order-total" data-summary-total>'+esc(money(total))+'</dd></dl><p class="payment-vat">Inklusive moms. Ingen automatisk fornyelse.</p>';}
  function promo(){return '<details class="payment-code"><summary>Har du en kode?</summary><form data-code-form><label for="payment-code">Din kode</label><div class="payment-code-row"><input id="payment-code" name="code" maxlength="128" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Skriv din kode" required><button class="btn-secondary payment-secondary" type="submit">Brug kode</button></div><p class="payment-message" data-code-message role="status" aria-live="polite"></p><p class="payment-note">Adgangskoder og personlige vennekoder knyttes til din konto. En personlig TEO-kode skal knyttes til kontoen senest 72 timer efter oprettelsen.</p></form></details>';}
  function consents(){return '<div class="payment-consents"><label><input type="checkbox" name="termsAccepted"><span>Jeg accepterer <a href="handelsbetingelser.html" target="_blank" rel="noopener">handelsbetingelserne</a>.</span></label><label><input type="checkbox" name="immediateAccessConsent"><span>'+esc(IMMEDIATE_ACCESS_TEXT)+'</span></label></div><p class="payment-note">Du vælger selv, om du vil have adgang med det samme. Du kan altid fortsætte gratis.</p>';}
  function footer(){return '<div class="payment-foot"><a href="handelsbetingelser.html" target="_blank" rel="noopener">Handelsbetingelser</a><a href="/#profil">Din konto</a><button type="button" class="payment-link-button" data-action="restore">Gendan køb</button></div>';}
  function resultMarkup(){const premium=client.view().premium;return '<section class="payment-panel payment-state-panel" aria-labelledby="payment-state-title">'+(stage==='success'?'<p class="eyebrow payment-kicker">Din konto er klar</p><div class="payment-stage"><span class="tb-stripes payment-stage-symbol" aria-hidden="true"></span><h2 id="payment-state-title">Du har adgang.</h2><p>Premium er aktiv på din konto. Hele TeoriBoost er klar til dig.</p>'+(premium&&client.view().entitlement.expiresAt?'<p>Adgang til '+esc(new Date(client.view().entitlement.expiresAt).toLocaleDateString('da-DK',{dateStyle:'long'}))+'.</p>':'')+'<a class="btn big-btn payment-primary" href="/">Fortsæt til TeoriBoost</a></div>':'<p class="eyebrow payment-kicker">Et øjeblik</p><div class="payment-stage"><h2 id="payment-state-title">Vi kontrollerer din adgang.</h2><p>Din betaling og konto skal være bekræftet, før vi åbner premium. Du behøver ikke betale igen.</p><button type="button" class="btn-secondary payment-secondary" data-action="check">Kontrollér adgang</button><a href="/">Fortsæt i appen imens</a></div>')+'<p class="payment-message" data-payment-message role="status" aria-live="polite"></p>'+footer()+'</section>';}
  function render(){
    if(disposed)return;
    if(!config?.plans?.length){root.innerHTML='<section class="payment-panel"><h1>Betaling åbner snart</h1><p class="payment-note">Prisoversigten kunne ikke hentes lige nu. Du kan fortsætte gratis.</p><a class="btn big-btn payment-primary" href="/">Til TeoriBoost</a></section>';root.removeAttribute('aria-busy');return;}
    let panel;
    if(['waiting','success'].includes(stage))panel=resultMarkup();
    else panel='<section class="payment-panel" aria-label="Din betaling">'+(available()?'<p class="payment-test-label">Testbetaling. Ingen penge trækkes.</p>':'')+order()+(!available()?'<div class="payment-soon"><h3>Betaling åbner snart</h3><p>Vi gør betalingen klar. Du kan se priserne her og fortsætte gratis i appen imens.</p></div>'+promo()+'<button class="btn big-btn payment-primary" disabled>Betaling åbner snart</button>':stage==='choose'?promo()+'<form data-payment-form><div class="payment-form-section"><h3>Adgang med det samme</h3>'+consents()+'</div><button class="btn big-btn payment-primary" type="submit">Fortsæt til betaling</button></form>':'<div class="payment-form-section"><h3>Vælg betalingsmetode</h3><p class="payment-note">Dit samtykke er gemt til denne bestilling.</p><div class="payment-stage" data-stripe-host><div class="payment-express" data-payment-express hidden><p class="payment-express-label">Hurtig betaling</p><div data-express-element></div></div><div data-payment-element></div></div><p class="payment-method-note">Kort og MobilePay vises, når de er tilgængelige. Hurtigbetaling afhænger også af din enhed.</p><button class="btn big-btn payment-primary" type="button" data-action="pay">Betal '+esc(money(session.amountTotalOre))+'</button><button class="payment-link-button" type="button" data-action="check">Kontrollér adgang eller genindlæs felter</button><br><button class="payment-link-button" type="button" data-action="change">Skift pas eller kode</button></div>')+'<p class="payment-message" data-payment-message role="status" aria-live="polite"></p>'+footer()+'</section>';
    root.innerHTML=intro()+panel;root.removeAttribute('aria-busy');root.dataset.stage=stage;
    setMessage(message,error);
  }
  function setBusy(value){busy=value;root.setAttribute('aria-busy',String(value));root.querySelectorAll('button').forEach(node=>node.disabled=value||(!available()&&node.classList.contains('payment-primary')));root.querySelectorAll('input').forEach(node=>node.disabled=value||stage!=='choose');}
  async function referralDiscount(){discountPercent=0;if(config?.referral?.enabled!==true||config.referral.confirmed!==true||account.status().state!=='user')return;try{const profile=await client.referralProfile();if(profile.binding?.bound&&!profile.binding.discountUsed)discountPercent=config.referral.discountPercent||0;}catch{/* Never invent a discount on failure. */}}
  async function poll(){
    clearTimeout(pollTimer);const started=generation;
    const view=await client.refresh();if(disposed||started!==generation||stage!=='waiting')return;
    if(view.premium){stage='success';message='';render();return;}
    if(++polls<maxPolls)pollTimer=setTimeout(()=>void poll(),pollMs);
    else setMessage('Adgangen er ikke bekræftet endnu. Vælg Kontrollér adgang om lidt. Gennemfør ikke en ny betaling.');
  }
  function waitForAccess(){cleanPayment();stage='waiting';polls=0;message='';render();void poll();}
  async function attach(data,started){
    cleanPayment();
    session=data;selected=data.planId;
    if(data.status==='complete'){rememberSession(data.sessionId);waitForAccess();return;}
    if(data.status!=='open'||!data.clientSecret){stage='choose';session=null;rememberSession(null);message='Betalingssessionen er udløbet. Vælg dit pas igen.';error=true;render();return;}
    rememberSession(data.sessionId);stage='payment';message='';error=false;render();
    const host=root.querySelector('[data-stripe-host]');
    const mounted=await mountPayment({session:data,root:host,win,onTotal:total=>{if(started!==generation)return;const n=root.querySelector('[data-summary-total]');if(n)n.textContent=money(total);},onConfirm:event=>confirm(event),onError:e=>{if(started!==generation)return;setMessage(paymentError(e),true);const button=root.querySelector('[data-action=pay]');if(button)button.disabled=true;}});
    if(disposed||generation!==started){mounted.destroy();return;}
    payment=mounted;
  }
  async function confirm(expressCheckoutConfirmEvent){
    if(busy||!payment||stage!=='payment')return;
    setBusy(true);setMessage('Godkend betalingen. Luk ikke siden, mens din bank svarer.');const started=generation;
    try{const result=await payment.confirm({email:account.status().email,expressCheckoutConfirmEvent});if(started!==generation||disposed)return;
      if(result?.type==='error'||result?.error){setMessage(paymentError(result.error||result),true);return;}
      waitForAccess();
    }catch(e){if(started===generation)setMessage(paymentError(e),true);}
    finally{if(started===generation)setBusy(false);}
  }
  async function action(fn,onError=e=>setMessage(paymentError(e),true)){if(busy)return;setBusy(true);const started=generation;try{await fn(started);}catch(e){if(started===generation)onError(e);}finally{if(started===generation)setBusy(false);}}
  async function recover(id,started){const data=await client.resume(id);if(started!==generation)return;await attach(data,started);}
  const submit=event=>{
    if(event.target.matches('[data-code-form]')){event.preventDefault();const code=event.target.elements.code.value;const feedback=event.target.querySelector('[data-code-message]');feedback.textContent='';feedback.setAttribute('role','status');void action(async started=>{const result=await client.redeem(code);if(started!==generation)return;if(result.referral){await referralDiscount();render();setMessage('Din vens kode er gemt. Rabatten er med i din bestilling.');}else if(client.view().premium){stage='success';message='';render();}else waitForAccess();},e=>{feedback.textContent=paymentError(e);feedback.setAttribute('role','alert');});}
    if(event.target.matches('[data-payment-form]')){event.preventDefault();if(!available())return;const termsAccepted=!!event.target.elements.termsAccepted.checked,immediateAccessConsent=!!event.target.elements.immediateAccessConsent.checked;
      if(!termsAccepted||!immediateAccessConsent){setMessage('Læs og vælg begge felter, hvis du vil købe med adgang med det samme.',true);return;}
      void action(async started=>{const data=await client.checkout(selected,{termsAccepted,immediateAccessConsent});if(started!==generation)return;await attach(data,started);});}
  };
  const click=event=>{const target=event.target.closest('[data-action]');if(!target)return;event.preventDefault();
    switch(target.dataset.action){
      case 'pay':void confirm();break;
      case 'google':void action(()=>account.signInGoogle());break;
      case 'restore':void action(async()=>{await client.restore();if(client.view().premium){cleanPayment();stage='success';message='';render();}else setMessage('Ingen aktiv premiumadgang blev fundet på denne konto.');});break;
      case 'check':if(stage==='waiting'){polls=0;void poll();}else if(session)void action(started=>recover(session.sessionId,started));break;
      case 'change':void action(async()=>{const data=await client.cancel(session.sessionId);if(data.status==='complete'){waitForAccess();return;}cleanPayment();session=null;stage='choose';message='';error=false;rememberSession(null);render();});break;
    }
  };
  root.addEventListener('submit',submit);root.addEventListener('click',click);
  root.addEventListener('change',event=>{if(event.target.name==='plan'&&stage==='choose'){selected=event.target.value;message='';error=false;render();root.querySelector('input[name=plan]:checked')?.focus();}});
  const unsubscribe=account.subscribe(()=>{if(initializing||disposed)return;void identityChanged();});
  async function identityChanged(){const ctx=await account.firestore(),identity=account.status().state+':'+(ctx?.uid||'');if(identity===lastIdentity)return;lastIdentity=identity;generation++;busy=false;cleanPayment();session=null;stage='choose';message='';error=false;await referralDiscount();if(disposed)return;render();const id=new URL(win.location.href).searchParams.get('session_id');if(id&&account.status().state==='user'&&available())void action(started=>recover(id,started));}
  const ready=(async()=>{
    try{
      const results=await Promise.all([providedConfig?Promise.resolve(providedConfig):loadPremiumConfig(fetcher),fetcher('/api/billing/status',{cache:'no-store',credentials:'same-origin'}).then(async r=>{if(!r.ok)throw Error();return r.json();}).catch(()=>({ready:false})),account.ready]);
      config=results[0];status=results[1];if(!chosen())selected=config.plans.find(p=>p.id==='30-days')?.id||config.plans[0].id;
      await client.refresh();await referralDiscount();initializing=false;
      const ctx=await account.firestore();lastIdentity=account.status().state+':'+(ctx?.uid||'');render();
      const id=new URL(win.location.href).searchParams.get('session_id');if(id&&account.status().state==='user'&&available())await action(started=>recover(id,started));
    }catch{initializing=false;render();}
  })();
  return {ready,client,dispose(){disposed=true;generation++;cleanPayment();unsubscribe();client.dispose();root.removeEventListener('submit',submit);root.removeEventListener('click',click);}};
}
