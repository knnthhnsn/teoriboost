const KEY='teoriboost.save-progress.v1';
export const SAVE_PROGRESS_SNOOZE_MS=3*24*60*60*1000;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function readSavePrompt(storage=globalThis.localStorage){
  try{const value=JSON.parse(storage.getItem(KEY)||'null');return {snoozedUntil:Number.isFinite(value?.snoozedUntil)?value.snoozedUntil:0};}catch{return{snoozedUntil:0};}
}
export function snoozeSavePrompt(storage=globalThis.localStorage,now=Date.now()){
  const value={snoozedUntil:now+SAVE_PROGRESS_SNOOZE_MS};try{storage.setItem(KEY,JSON.stringify(value));}catch{}return value;
}
export function shouldShowSavePrompt({status,kind,completionId,completedCount},saved={},now=Date.now()){
  return status?.state==='anon'&&['lesson','exam'].includes(kind)&&typeof completionId==='string'&&!!completionId&&completedCount===2&&!(saved.snoozedUntil>now);
}
/** A non-blocking account offer; existing account methods own all authentication. */
export function mountSaveProgressPrompt(host,{account,kind,completionId,completedCount,storage=globalThis.localStorage,win=globalThis.window,now=()=>Date.now()}){
  if(!host||!account)return()=>{};
  let disposed=false,pending=false,draft='',node=null,saved=readSavePrompt(storage);
  function render(){
    if(disposed)return;
    const status=account.status();
    if(!shouldShowSavePrompt({status,kind,completionId,completedCount},saved,now())){node?.remove();node=null;return;}
    if(!node){node=host.ownerDocument.createElement('section');node.className='save-progress';node.setAttribute('aria-label','Gem din fremgang');host.append(node);}
    const email=status.ui==='email',sent=status.ui==='sent';
    node.innerHTML='<div class="save-progress__intro"><img src="assets/cast/sneglen-face.webp" alt="" width="64" height="64" decoding="async"><div><h2>Gem din fremgang</h2><p>Så fortsætter du på telefon og computer, og din streak er sikker.</p></div></div>'+
      (sent?'<p class="save-progress__notice" role="status">Vi har sendt et login-link til '+escape(status.sentTo)+'. Åbn linket i din e-mail.</p>':
      email?'<form data-save-email><label for="save-progress-email">Din e-mailadresse</label><input id="save-progress-email" name="email" type="email" autocomplete="email" inputmode="email" required value="'+escape(draft)+'"'+(status.busy?' disabled':'')+'><button type="submit" class="save-progress__google"'+(status.busy?' disabled':'')+'>'+(status.busy?'Sender link …':'Send login-link')+'</button></form>':
      '<div class="save-progress__actions"><button type="button" data-save-login="google" class="save-progress__google"'+(pending?' disabled':'')+'>Fortsæt med Google</button><button type="button" data-save-login="email" class="save-progress__email"'+(pending?' disabled':'')+'>Få et login-link på e-mail</button></div>')+
      (status.error?'<p class="save-progress__error" role="alert">'+escape(status.error)+'</p>':'')+
      '<button type="button" data-save-dismiss class="save-progress__dismiss">Ikke nu</button>';
  }
  async function click(event){
    if(!node?.contains(event.target))return;
    if(event.target.closest('[data-save-dismiss]')){saved=snoozeSavePrompt(storage,now());render();return;}
    const action=event.target.closest('[data-save-login]')?.dataset.saveLogin;
    if(action==='email'){account.setUi('email');node?.querySelector('input')?.focus();return;}
    if(action==='google'&&!pending){pending=true;render();try{await account.signInGoogle();}finally{pending=false;render();}}
  }
  function input(event){if(event.target.matches?.('[data-save-email] input'))draft=event.target.value;}
  function submit(event){if(!node?.contains(event.target)||!event.target.matches('[data-save-email]'))return;event.preventDefault();draft=event.target.elements.email.value;void account.sendEmailLink(draft);}
  function storageChanged(event){if(event.key===KEY){saved=readSavePrompt(storage);render();}}
  host.addEventListener('click',click);host.addEventListener('input',input);host.addEventListener('submit',submit);
  win?.addEventListener('storage',storageChanged);
  const unsubscribe=account.subscribe(render);render();
  return()=>{disposed=true;unsubscribe?.();host.removeEventListener('click',click);host.removeEventListener('input',input);host.removeEventListener('submit',submit);win?.removeEventListener('storage',storageChanged);node?.remove();};
}

