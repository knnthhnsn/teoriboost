import {buildTrafficScene,TRAFFIC_SCENE_IDS} from './exam-traffic-scenes.js';
import {buildDetailScene,DETAIL_SCENE_IDS} from './exam-detail-scenes.js';
import {EXAM_PHOTOS} from './exam-photos.js';
export const VISUAL_SCENE_IDS=Object.freeze([...TRAFFIC_SCENE_IDS,...DETAIL_SCENE_IDS]);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderQuestionVisual(q,diagram,{examMode=false,index=0}={}){
  const photo=EXAM_PHOTOS[q.id];
  const media=photo?`<img id="question-visual-photo" src="${photo.src}" width="${photo.width}" height="${photo.height}" alt="${esc(q.context)}" decoding="async" fetchpriority="high">`:`<canvas id="question-visual" hidden role="img" aria-label="${esc(q.context)}"></canvas>`;
  return `<section class="scene-panel scene-photo" aria-label="Situationsbillede" data-visual-question="${esc(q.id)}"><div class="scene-photo-top"><span>${examMode?'SITUATION '+(index+1):'SE SITUATIONEN'}</span><span data-scene-view-label>Illustration</span></div><div class="scene-photo-stage">${media}<div class="question-diagram scene-photo-fallback" id="question-diagram" ${photo?'hidden':''}>${diagram}</div></div><div class="scene-photo-bottom"><p data-scene-title>Situationen</p><button type="button" class="scene-expand" aria-haspopup="dialog" data-scene-expand disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>Større billede</button></div><div class="scene-facts" data-scene-facts hidden></div><p class="scene-photo-note">Original illustration · læs situationens betingelser</p></section>`;
}

// One static render, repeated only on resize. No idle animation loop or network assets.
export function mountQuestionVisual(host,q){
  const canvas=host?.querySelector('#question-visual,#question-visual-photo'),fallback=host?.querySelector('#question-diagram'),photo=EXAM_PHOTOS[q.id];
  const T=window.THREE;if(!canvas||(!photo&&!T))return null;
  let renderer,built,observer,dialog,origin=canvas.parentElement,focusBefore=null,disposed=false;
  const disposeScene=scene=>{if(!scene)return;const geo=new Set(),mats=new Set(),tx=new Set();scene.traverse(o=>{if(o.geometry)geo.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){mats.add(m);for(const v of Object.values(m))if(v?.isTexture)tx.add(v);}if(o.isLight&&o.shadow?.map)tx.add(o.shadow.map.texture);});for(const g of geo)g.dispose();for(const t of tx)t.dispose();for(const m of mats)m.dispose();};
  const resize=()=>{if(disposed||!renderer||!built)return;const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);built.camera.aspect=r.width/r.height;built.camera.updateProjectionMatrix();renderer.render(built.scene,built.camera);};
  const showFallback=()=>{canvas.hidden=true;fallback.hidden=false;host.dataset.visualStatus='fallback';host.querySelector('[data-scene-expand]').disabled=true;};
  function close(){if(!dialog?.open)return;dialog.close();origin.append(canvas);resize();if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true});}
  function open(){if(disposed||!built||canvas.hidden)return;focusBefore=document.activeElement;if(!dialog){dialog=document.createElement('dialog');dialog.className='scene-lightbox';dialog.setAttribute('aria-labelledby','scene-lightbox-title');dialog.innerHTML=`<header><div><span class="mono">SITUATIONSBILLEDE</span><h2 id="scene-lightbox-title">${esc(built.title)}</h2></div><button type="button" aria-label="Luk større billede" class="scene-lightbox-close">×</button></header><div class="scene-lightbox-stage"></div><p class="scene-lightbox-context">${esc(q.context)}</p>`;document.body.append(dialog);dialog.querySelector('button').addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.addEventListener('click',e=>{if(e.target===dialog)close();});}dialog.querySelector('.scene-lightbox-stage').append(canvas);dialog.showModal();resize();dialog.querySelector('button').focus();}
  function lost(e){e.preventDefault();close();showFallback();}
  const expand=host.querySelector('[data-scene-expand]');
  function ready(){if(disposed)return;canvas.hidden=false;fallback.hidden=true;host.dataset.visualStatus='ready';canvas.dataset.sceneId=q.id;expand.disabled=false;}
  function failed(){if(disposed)return;close();showFallback();}
  try{
    built=photo||buildDetailScene(T,q)||buildTrafficScene(T,q);if(!built)return null;
    // Bundled r128 predates automatic sRGB input conversion. Authoring palettes
    // use display colours; convert each shared material once before lighting.
    if(!photo){const converted=new Set();built.scene.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){if(converted.has(m))continue;converted.add(m);m.color?.convertSRGBToLinear();m.emissive?.convertSRGBToLinear();}});
    renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;}
    host.querySelector('[data-scene-title]').textContent=built.title;
    host.querySelector('[data-scene-view-label]').textContent=built.viewLabel;
    const facts=host.querySelector('[data-scene-facts]');if(built.facts?.length){facts.innerHTML=built.facts.map(f=>`<span>${esc(f)}</span>`).join('');facts.hidden=false;}
    expand.addEventListener('click',open);
    if(photo){canvas.addEventListener('load',ready);canvas.addEventListener('error',failed);host.dataset.visualStatus='loading';if(canvas.complete){if(canvas.naturalWidth)ready();else failed();}}
    else{ready();canvas.addEventListener('webglcontextlost',lost);observer=new ResizeObserver(resize);observer.observe(canvas);resize();}
  }catch(error){disposeScene(built?.scene);renderer?.dispose();showFallback();return null;}
  return {open,close,resize,dispose(){if(disposed)return;close();disposed=true;observer?.disconnect();expand.removeEventListener('click',open);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('load',ready);canvas.removeEventListener('error',failed);dialog?.remove();disposeScene(built.scene);renderer?.dispose();renderer?.forceContextLoss();}};
}
