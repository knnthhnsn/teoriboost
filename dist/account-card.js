import {AVATARS,avatarPref,ico} from './ui-icons.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function portrait(){
  const id=avatarPref(),label=AVATARS.find(([value])=>value===id)?.[1]||'';
  return {src:'assets/nav/profile-'+id+'.webp',label};
}

export function refreshAccountPortraits(doc=globalThis.document){
  if(!doc)return;
  const image=portrait();
  for(const node of doc.querySelectorAll('[data-account-card] [data-account-photo]')){
    node.setAttribute('src',image.src);node.setAttribute('alt',image.label);
  }
}

let listeningDocument;
function installCard(){
  const doc=globalThis.document;
  if(!doc)return;
  if(!doc.querySelector('link[data-account-card-style]')){
    const link=doc.createElement('link');link.rel='stylesheet';link.href=new URL('./account-card.css',import.meta.url).href;
    link.dataset.accountCardStyle='';doc.head.append(link);
  }
  if(listeningDocument===doc)return;
  listeningDocument=doc;
  doc.addEventListener('click',event=>{
    if(!event.target.closest?.('[data-avatar]'))return;
    // The existing picker owns storage; read its result after all click handlers.
    if(globalThis.requestAnimationFrame)globalThis.requestAnimationFrame(()=>refreshAccountPortraits(doc));
    else setTimeout(()=>refreshAccountPortraits(doc),0);
  });
}

/** Account appearance only. Auth, sync and confirmation actions stay in account.js/app.js. */
export function renderAccountCard({state,syncedMarkup,errorMarkup,actionsMarkup,googleG}){
  if(state?.state!=='user')return null;
  installCard();
  const image=portrait(),google=state.provider==='Google';
  const provider=google?googleG+'<span>Logget ind med Google</span>':'<span>via '+esc(state.provider||'')+'</span>';
  const saved=!state.syncing&&!!state.syncedAt;
  const actions=actionsMarkup
    .replace('class="acc-link" data-account="signout"','class="big-btn big-btn--ghost acc-card-signout" data-account="signout"')
    .replace('class="big-btn" data-account="signout-yes"','class="big-btn big-btn--ghost" data-account="signout-yes"');
  return `<section class="panel account-panel acc-card" data-account-card aria-labelledby="acc-title">
    <div class="acc-card-surface">
      <header class="acc-card-header"><h2 id="acc-title">Din konto</h2><span class="tb-stripes" aria-hidden="true"></span></header>
      <div class="acc-card-body">
        <div class="acc-card-photo"><img data-account-photo src="${image.src}" width="320" height="320" alt="${esc(image.label)}" decoding="async"></div>
        <div class="acc-card-identity"><p class="acc-card-email">${esc(state.email||'Logget ind')}</p><p class="acc-card-provider">${provider}</p>
          <p class="acc-sync acc-card-sync" aria-live="polite">${saved?ico('check',{cls:'acc-card-check'}):''}${syncedMarkup}</p>
        </div>
      </div>
    </div>
    <div class="acc-card-footer">${errorMarkup}${actions}</div>
  </section>`;
}
