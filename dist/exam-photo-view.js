import {EXAM_PHOTOS} from './exam-photos.js';
import {EXAM_SCHEMATICS} from './exam-schematics.js';
import {situationFor} from './situation-specs.js';
import {mountSchematic} from './schematic-view.js';
// diagrams.js is 1.8 MB (730 kB sent) and only the schematic questions use it, so it is fetched after the app has
// started, not before its first screen. A question that comes before it has arrived draws its diagram when it does.
let diagrams=null,diagramsLoad=null;
export function loadDiagrams(){return diagramsLoad||=import('./diagrams.js').then(m=>diagrams=m,e=>{diagramsLoad=null;throw e;});}
const idle=globalThis.requestIdleCallback||(f=>setTimeout(f,1200));
const preload=()=>idle(()=>loadDiagrams().catch(()=>{}),{timeout:4000});
if(typeof document!=='undefined'){if(document.readyState==='complete')preload();else addEventListener('load',preload,{once:true});}
// A situation picture for a lesson card: the n-th 3D scene among this section's questions (or none).
// 16 Nov 2026: with the card text as hint it picks the question that shares the card's rarest words (a tyre card gets a tyre scene), and falls back to the n-th one.
export function lessonScene(questions,sectionId,n,hint=''){const list=questions.filter(q=>q.sectionId===sectionId&&EXAM_SCHEMATICS[q.id]&&!situationFor(q).generic);if(!list.length)return null;const words=[...new Set(String(hint).toLowerCase().match(/[a-zæøå]{5,}/g)||[])].map(w=>w.slice(0,6)),texts=list.map(q=>[q.context,q.prompt,...(q.statements||[]).map(s=>s.text)].join(' ').toLowerCase());let best=-1,score=0;texts.forEach((t,i)=>{let s=0;for(const w of words)if(t.includes(w))s+=1/texts.filter(x=>x.includes(w)).length;if(s>score){score=s;best=i;}});return best>=0&&score>=0.5?list[best]:list[n%list.length];}
export const VISUAL_SCENE_IDS=Object.freeze([...Object.keys(EXAM_PHOTOS),...Object.keys(EXAM_SCHEMATICS)]);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderQuestionVisual(q,_unused,{examMode=false,index=0}={}){
  const schematic=EXAM_SCHEMATICS[q.id];
  if(schematic)return `<section class="scene-panel scene-photo scene-schematic" aria-label="Tegning af situationen" data-visual-question="${esc(q.id)}"${examMode?' data-exam-mode':''} data-visual-kind="schematic-diagram" data-visual-status="${diagrams?'ready':'loading'}"><div class="scene-photo-top"><span>${examMode?'SITUATION '+(index+1):'SE SITUATIONEN'}</span><span>Tegning af situationen</span></div><div class="scene-photo-stage"${diagrams?'':' data-diagram-pending'}>${diagrams?diagrams.questionDiagram(q):''}</div><p class="scene-photo-note">Opgaveteksten angiver alle afgørende betingelser.</p></section>`;
  const photo=EXAM_PHOTOS[q.id],media=photo?`<img id="question-visual-photo" src="${photo.src}" width="${photo.width}" height="${photo.height}" alt="${esc(q.context)}" decoding="async" fetchpriority="high" hidden>`:'';
  return `<section class="scene-panel scene-photo" aria-label="Situationsbillede" data-visual-question="${esc(q.id)}"${examMode?' data-exam-mode':''}><div class="scene-photo-top"><span>${examMode?'SITUATION '+(index+1):'SE SITUATIONEN'}</span><span>AI-illustration</span></div><div class="scene-photo-stage">${media}<div class="scene-photo-fallback" ${photo?'hidden':''}><p>Vi kunne ikke vise billedet lige nu.</p><p>Alle betingelser står i situationens tekst.</p><button type="button" data-scene-retry>Hent billedet igen</button></div></div><div class="scene-photo-bottom"><p data-scene-title>${esc(photo?.title||'Situationen')}</p><button type="button" class="scene-expand" aria-haspopup="dialog" data-scene-expand disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>Vis større billede</button></div>${photo?.facts?.length?`<div class="scene-facts">${photo.facts.map(f=>`<span>${esc(f)}</span>`).join('')}</div>`:''}<p class="scene-photo-note">Læs situationens betingelser før du svarer.</p></section>`;
}
function mountBase(host,q,{onOpen=()=>{}}={}){
  if(EXAM_SCHEMATICS[q.id]){
    const pending=host?.querySelector('[data-diagram-pending]');
    if(!pending)return mountSchematic(host);
    let inner=null,gone=false;
    const draw=()=>{if(gone||!pending.isConnected)return;pending.innerHTML=diagrams.questionDiagram(q);pending.removeAttribute('data-diagram-pending');inner=mountSchematic(host);if(!inner)host.dataset.visualStatus='ready';};
    const fail=()=>{if(gone||!pending.isConnected)return;pending.innerHTML='<p class="scene-photo-note">Vi kunne ikke hente tegningen lige nu. Alle betingelser står i situationens tekst.</p>';host.dataset.visualStatus='ready';};
    loadDiagrams().then(draw,fail);
    return {dispose(){gone=true;inner?.dispose();}};
  }
  const photo=EXAM_PHOTOS[q.id],media=host?.querySelector('#question-visual-photo');if(!photo||!media)return null;
  const fallback=host.querySelector('.scene-photo-fallback'),expand=host.querySelector('[data-scene-expand]'),retry=host.querySelector('[data-scene-retry]'),origin=media.parentElement;
  let dialog=null,observer=null,focusBefore=null,disposed=false,zoom=1,loadGeneration=0;
  function setZoom(value,recenter=true){
    zoom=value;if(!dialog?.open)return;const stage=dialog.querySelector('.scene-lightbox-stage'),control=dialog.querySelector('[data-scene-zoom]');
    stage.classList.toggle('is-zoomed',zoom>1);dialog.querySelector('.scene-zoom-hint').hidden=zoom===1;control.textContent=zoom===1?'Forstør 2×':zoom===2?'Forstør 4×':'Vis hele billedet';control.setAttribute('aria-label',zoom===1?'Forstør billedet 2 gange':zoom===2?'Forstør billedet 4 gange':'Vis hele billedet');
    if(zoom===1){media.style.removeProperty('width');media.style.removeProperty('height');media.style.removeProperty('margin-left');stage.scrollLeft=0;stage.scrollTop=0;return;}
    const r=stage.getBoundingClientRect(),ratio=photo.width/photo.height,h=Math.min(r.height,r.width/ratio)*zoom,w=h*ratio;media.style.width=`${w}px`;media.style.height=`${h}px`;media.style.marginLeft=`${Math.max(0,(r.width-w)/2)}px`;
    if(recenter){stage.scrollLeft=Math.max(0,(w-r.width)/2);stage.scrollTop=Math.max(0,(h-r.height)/2);}
  }
  function close(){if(!dialog?.open)return;setZoom(1);dialog.close();origin.append(media);if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true});}
  function open(){
    if(disposed||host.dataset.visualStatus!=='ready')return;onOpen();focusBefore=document.activeElement;
    if(!dialog){dialog=document.createElement('dialog');dialog.className='scene-lightbox';dialog.setAttribute('aria-labelledby',`scene-lightbox-title-${q.id}`);dialog.innerHTML=`<header><div><span class="mono">SITUATIONSBILLEDE</span><h2 id="scene-lightbox-title-${q.id}">${esc(photo.title)}</h2></div><div class="scene-lightbox-controls"><button type="button" class="scene-lightbox-zoom" data-scene-zoom>Forstør 2×</button><button type="button" aria-label="Luk billedet" class="scene-lightbox-close">×</button></div></header><div class="scene-lightbox-stage" tabindex="0" aria-label="Situationsbillede. Ved forstørrelse kan du rulle rundt."></div><p class="scene-zoom-hint" hidden>Rul eller træk i billedet for at se detaljerne.</p><p class="scene-lightbox-context">${esc(q.context)}</p>`;document.body.append(dialog);dialog.querySelector('.scene-lightbox-close').addEventListener('click',close);dialog.querySelector('[data-scene-zoom]').addEventListener('click',()=>setZoom(zoom===1?2:zoom===2?4:1));dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.addEventListener('click',e=>{if(e.target===dialog)close();});observer=new ResizeObserver(()=>{if(dialog.open&&zoom>1)setZoom(zoom,false);});observer.observe(dialog.querySelector('.scene-lightbox-stage'));}
    dialog.querySelector('.scene-lightbox-stage').append(media);dialog.showModal();setZoom(1);dialog.querySelector('.scene-lightbox-close').focus();
  }
  async function ready(){const generation=++loadGeneration,src=media.getAttribute('src');try{await media.decode();}catch{if(!disposed&&generation===loadGeneration)failed();return;}if(disposed||generation!==loadGeneration||src!==media.getAttribute('src'))return;media.hidden=false;fallback.hidden=true;host.dataset.visualStatus='painting';await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));if(disposed||generation!==loadGeneration||src!==media.getAttribute('src'))return;host.dataset.visualStatus='ready';media.dataset.sceneId=q.id;expand.disabled=false;}
  function failed(){if(disposed)return;loadGeneration++;close();media.hidden=true;fallback.hidden=false;host.dataset.visualStatus='fallback';expand.disabled=true;}
  function reload(){if(disposed)return;loadGeneration++;fallback.hidden=true;media.hidden=true;host.dataset.visualStatus='loading';media.src=photo.src+'?retry='+Date.now();}
  media.addEventListener('load',ready);media.addEventListener('error',failed);expand.addEventListener('click',open);retry.addEventListener('click',reload);host.dataset.visualStatus='loading';if(media.complete){if(media.naturalWidth)ready();else failed();}
  return {open,close,dispose(){if(disposed)return;close();disposed=true;loadGeneration++;observer?.disconnect();media.removeEventListener('load',ready);media.removeEventListener('error',failed);expand.removeEventListener('click',open);retry.removeEventListener('click',reload);dialog?.remove();}};
}

// Hver gang et spørgsmål vises, skifter billedet (tælleren gemmes pr. spørgsmål), så eleven lærer at aflæse situationen
// i stedet for at genkende ét bestemt billede. peek=true læser tælleren uden at tælle op: øveprøven holder det samme billede,
// mens eleven går frem og tilbage i den.
function nextSceneCount(id,peek=false){try{const k='teoriboost.scenevar.v1',m=JSON.parse(localStorage.getItem(k)||'{}'),n=(m[id]|0)+(peek?0:1);if(!peek){m[id]=n;localStorage.setItem(k,JSON.stringify(m));}return n;}catch{return 0;}}
// The 3D diorama (situation-3d.js) is drawn over the schematic stage when the browser can do WebGL; otherwise the schematic stays.
export function mountQuestionVisual(host,q,opts){
  const base=mountBase(host,q,opts);const exam=!!(host?.matches?.('[data-exam-mode]')||host?.querySelector?.('[data-exam-mode]'));
  /* 26. nov. 2026: spørgsmål q-001 til q-083 har både en tegnet illustration og en 3D-situation i to vinkler. De skiftes efter tur,
     også i øveprøven: tegningen, 3D vinkel 1, 3D vinkel 2. Tegningen er det billede, mountBase allerede har vist. */
  const spec0=(EXAM_SCHEMATICS[q.id]||EXAM_PHOTOS[q.id])&&situationFor(q);if(!spec0||spec0.generic||!host)return base;
  const n=nextSceneCount(q.id,exam);if(EXAM_PHOTOS[q.id]&&n%3===0)return base;
  const spec={...spec0,variant:EXAM_PHOTOS[q.id]?(n%3)-1:n%2};
  let gone=false,three=null;
  // 16 Nov 2026: a loading skeleton while the 3D scene loads; the schematic only shows when 3D cannot be drawn (no WebGL, error).
  const stage=host.querySelector('.scene-photo-stage'),settle=()=>stage?.classList.remove('is-sit3d-loading');stage?.classList.add('is-sit3d-loading');
  import('./situation-3d.js').then(m=>m.mountSituation3d(stage,host.hasAttribute('data-exam-mode')?{...spec,actors:spec.actors.filter(a=>!a.joke)}:spec)).then(h=>{settle();if(gone){h?.dispose();return;}three=h;if(h){host.querySelector('.scene-photo-top span:last-child')?.replaceChildren('3D-situation');host.querySelector('[data-scene-expand]')?.setAttribute('hidden','');}},settle);
  return {...(base||{}),dispose(){gone=true;three?.dispose();base?.dispose?.();}};
}
