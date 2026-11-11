import {loadRiveRuntime,loadRiveFile} from './rive-fx.js';
/** Decorative reaction: never intercept input; wait until visible before its brief display. */
export function mountWildlife(host,{animal='deer',state='shock',reducedMotion=false}={}){
 if(!host)return {dispose(){},react(){}};
 animal=animal==='hare'?'hare':'deer';let mood=state==='smug'?'smug':'shock',disposed=false,visible=false,instance=null,loading=false,ready=false,expired=false,token=0,timer=0,watchdog=0;
 const wrap=document.createElement('span');wrap.setAttribute('aria-hidden','true');wrap.dataset.wildlife=animal;Object.assign(wrap.style,{display:'inline-block',position:'relative',verticalAlign:'middle',width:animal==='deer'?'90px':'64px',height:animal==='deer'?'90px':'64px',pointerEvents:'none',flex:'none'});
 const img=document.createElement('img');Object.assign(img.style,{width:'100%',height:'100%',objectFit:'contain'});img.alt='';wrap.append(img);host.append(wrap);
 const update=()=>{img.src=`assets/rive/wildlife/${animal}${mood==='shock'?'-shock':''}.png`;};update();
 const clearTimer=()=>{clearTimeout(timer);timer=0;};
 const beginCountdown=()=>{if(disposed||!visible||document.hidden||expired||timer)return;timer=setTimeout(()=>{timer=0;expired=true;wrap.style.display='none';clear();},1800);};
 function clear(){token++;loading=false;ready=false;clearTimeout(watchdog);instance?.cleanup();instance=null;wrap.querySelector('canvas')?.remove();img.hidden=false;}
 const still=()=>reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('no-motion');
 async function start(){
  if(disposed||!visible||document.hidden||expired)return;
  if(still()){beginCountdown();return;}if(loading||instance)return;
  loading=true;const own=++token;watchdog=setTimeout(()=>{if(!disposed&&own===token){clear();beginCountdown();}},5000);
  try{
   const r=await loadRiveRuntime(),bytes=await loadRiveFile(`wildlife/${animal}.riv`);
   if(disposed||own!==token||!visible||document.hidden||expired)return;
   const canvas=document.createElement('canvas');Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%'});canvas.setAttribute('aria-hidden','true');wrap.append(canvas);
   const created=new r.Rive({buffer:bytes.slice(0),canvas,artboard:`Wildlife-${animal}`,stateMachines:'Wildlife',autoplay:true,layout:new r.Layout({fit:r.Fit.Contain,alignment:r.Alignment.Center}),onLoad(){
    if(disposed||own!==token||!visible||document.hidden){created.cleanup();canvas.remove();return;}
    canvas.width=animal==='deer'?180:128;canvas.height=animal==='deer'?180:128;created.resizeToCanvas();created.stateMachineInputs('Wildlife')?.find(x=>x.name===mood)?.fire();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(disposed||own!==token||!visible||document.hidden)return;clearTimeout(watchdog);loading=false;ready=true;img.hidden=true;beginCountdown();}));
   },onLoadError(){if(own===token){clear();beginCountdown();}}});instance=created;
  }catch{if(own===token){clear();beginCountdown();}}
 }
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries.some(x=>x.isIntersecting);if(visible)void start();else{clearTimer();clear();}}):null;observer?.observe(wrap);if(!observer){visible=true;void start();}
 const visibility=()=>{if(document.hidden){clearTimer();clear();}else void start();};document.addEventListener('visibilitychange',visibility);
 function react(next){mood=next==='smug'?'smug':'shock';expired=false;wrap.style.display='inline-block';update();clearTimer();if(ready){instance?.stateMachineInputs('Wildlife')?.find(x=>x.name===mood)?.fire();beginCountdown();}else void start();}
 react(mood);return {react,dispose(){if(disposed)return;disposed=true;clearTimer();observer?.disconnect();document.removeEventListener('visibilitychange',visibility);clear();wrap.remove();}};
}
