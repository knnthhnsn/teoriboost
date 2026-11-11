import {loadRiveRuntime} from './rive-fx.js';

const root = 'assets/approved-cast/';
// src is the registered PNG (scripts/art-provenance.mjs checks it). The app shows display, a WebP made from that PNG
// (quality 95, lossless alpha, about a fifth of the size; tools/art/cast-display-webp.py).
export const APPROVED_CAST_ART = Object.freeze({
  sneglen: Object.freeze({src: root+'sneglen.png', width:1407, height:1118, riv:root+'sneglen.riv', artboard:'RegisteredGuide', stateMachine:'Guide', provenance:'registered-guide/source/registered-source-composite.png'}),
  krabbe: Object.freeze({src: root+'krabbe.png', display: root+'krabbe.webp', width:512, height:512, riv:root+'krabbe.riv', artboard:'Registered-krabbe', stateMachine:'Cast', provenance:'registered-cast/krabbe/frozen-composite.png'}),
  blink: Object.freeze({src: root+'blink.png', display: root+'blink.webp', width:512, height:512, riv:root+'blink.riv', artboard:'Registered-blink', stateMachine:'Cast', provenance:'registered-cast/blink/frozen-composite.png'}),
  bobbel: Object.freeze({src: root+'bobbel.png', display: root+'bobbel.webp', width:512, height:512, riv:root+'bobbel.riv', artboard:'Registered-bobbel', stateMachine:'Cast', provenance:'registered-cast/bobbel/frozen-composite.png'}),
  daek: Object.freeze({src: root+'daek.png', display: root+'daek.webp', width:512, height:512, riv:root+'daek.riv', artboard:'Registered-daek', stateMachine:'Cast', provenance:'registered-cast/daek/frozen-composite.png'}),
  kegle: Object.freeze({src: root+'kegle.png', display: root+'kegle.webp', width:512, height:512, riv:root+'kegle.riv', artboard:'Registered-kegle', stateMachine:'Cast', provenance:'registered-cast/kegle/frozen-composite.png'}),
});
const variants = new Set(['hero','garage','mission','result','reaction']);
const states = new Set(['idle','talk','react','glide']);
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');

export function renderApprovedCast(id,{variant='reaction',label='',state='idle',priority=false,humorOnly=false}={}) {
  const asset=APPROVED_CAST_ART[id]; if(!asset)return '';
  const safeVariant=variants.has(variant)?variant:'reaction', safeState=states.has(state)?state:'idle';
  const classes=`art-asset art-asset--${safeVariant}${humorOnly?' art-asset--humor-only':''}`;
  if(id==='sneglen')return `<span style="display:inline-block;position:relative;line-height:0;max-width:100%"${humorOnly?' data-humor-only="true"':''}><img class="${classes}" style="animation:none!important;transform:none!important" src="assets/cast/sneglen.webp" width="512" height="512" alt="${esc(label)}"${label?'':' aria-hidden="true"'} decoding="async"${priority?' fetchpriority="high"':' loading="lazy"'}></span>`;
  return `<span data-approved-cast="${esc(id)}" data-approved-state="${safeState}" style="display:inline-block;position:relative;line-height:0;max-width:100%"${humorOnly?' data-humor-only="true"':''}><img class="${classes}" src="${asset.display||asset.src}" width="${asset.width}" height="${asset.height}" alt="${esc(label)}"${label?'':' aria-hidden="true"'} decoding="async"${priority?' fetchpriority="high"':' loading="lazy"'}></span>`;
}

// A failed, offscreen, paused or reduced-motion animation always leaves the
// exact registered image available. Call dispose when replacing a view.
export function mountApprovedCast(host) {
  if(!host?.querySelectorAll)return {dispose(){}};
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const entries=new Map(); let disposed=false;
  const still=()=>media.matches||document.body.classList.contains('no-motion');
  const stop=entry=>{entry.generation++; if(entry.instance){try{entry.instance.cleanup()}catch{} entry.instance=null;} entry.canvas?.remove();entry.canvas=null;entry.image.style.visibility='';};
  const start=async entry=>{
    if(disposed||still()||!entry.visible||entry.instance||entry.loading||!entry.el.isConnected)return;
    entry.loading=true;const generation=++entry.generation;let failed=false;
    try {
      const rive=await loadRiveRuntime();
      if(disposed||still()||!entry.visible||!entry.el.isConnected||generation!==entry.generation)return;
      const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';entry.el.append(canvas);entry.canvas=canvas;
      let instance;
      instance=new rive.Rive({src:entry.asset.riv,canvas,artboard:entry.asset.artboard,stateMachines:entry.asset.stateMachine,autoplay:true,
        onLoad:()=>{if(disposed||still()||!entry.visible||!entry.el.isConnected||generation!==entry.generation){try{instance?.cleanup()}catch{}return;}try{instance.resizeDrawingSurfaceToCanvas();const inputs=instance.stateMachineInputs(entry.asset.stateMachine)||[];const find=name=>inputs.find(input=>input.name===name);if(entry.state==='talk'&&find('talk'))find('talk').value=true;if(entry.state==='glide'&&find('moving'))find('moving').value=true;if(entry.state==='react')find('react')?.fire();entry.image.style.visibility='hidden';}catch{stop(entry);}},
        onLoadError:()=>{if(generation===entry.generation)stop(entry);}});
      entry.instance=instance;
    } catch {failed=true;if(generation===entry.generation)stop(entry);} finally {entry.loading=false;if(!failed&&generation!==entry.generation&&!disposed&&entry.visible&&!still())start(entry);}
  };
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(changes=>{for(const change of changes){const entry=entries.get(change.target);if(!entry)continue;entry.visible=change.isIntersecting;if(entry.visible)start(entry);else stop(entry);}}):null;
  const register=el=>{if(entries.has(el)||el.dataset.approvedCast==='sneglen')return;const asset=APPROVED_CAST_ART[el.dataset.approvedCast],image=el.querySelector('img');if(!asset||!image)return;if(getComputedStyle(el).position==='static')el.style.position='relative';const entry={el,image,asset,state:el.dataset.approvedState,visible:!observer,instance:null,canvas:null,generation:0,loading:false};entries.set(el,entry);if(observer)observer.observe(el);else start(entry);};
  const scan=()=>{if(disposed)return;for(const [el,entry] of entries){if(!el.isConnected||!host.contains(el)){observer?.unobserve(el);stop(entry);entries.delete(el);}}if(host.matches?.('[data-approved-cast]'))register(host);for(const el of host.querySelectorAll('[data-approved-cast]'))register(el);};
  scan();
  const contentObserver=typeof MutationObserver==='function'?new MutationObserver(scan):null;
  contentObserver?.observe(host,{childList:true,subtree:true});
  const onMotion=()=>{for(const entry of entries.values())if(still())stop(entry);else start(entry);};
  media.addEventListener?.('change',onMotion);
  const motionObserver=typeof MutationObserver==='function'?new MutationObserver(onMotion):null;
  motionObserver?.observe(document.body,{attributes:true,attributeFilter:['class']});
  const onResize=()=>{for(const entry of entries.values())try{entry.instance?.resizeDrawingSurfaceToCanvas()}catch{stop(entry)}};
  window.addEventListener('resize',onResize);
  return {dispose(){if(disposed)return;disposed=true;observer?.disconnect();contentObserver?.disconnect();motionObserver?.disconnect();window.removeEventListener('resize',onResize);media.removeEventListener?.('change',onMotion);for(const entry of entries.values())stop(entry);entries.clear();}};
}
