const figures=[['sneglen','Sneglen',10],['krabbe','Krabbe',15],['blink','Blink',14],['bobbel','Bobbel',11],['daek','Dæk',11],['kegle','Kegle',9]];
const labels={idle:'Rolig',talk:'Taler',react:'Reagerer',glide:'Glider'};
const grid=document.getElementById('cast-grid');
const globalStatus=document.getElementById('global-status');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const instances=new Map();
const cards=new Map();
window.__castParts={instances,cards,errors:[],ready:0};
for(const [id,name,count] of figures){
  const card=document.createElement('article');card.className='card';card.dataset.figure=id;card.dataset.ready='false';
  card.innerHTML=`<div class="card-head"><h2>${name}</h2><span class="parts-count">${count} separate dele</span></div><div class="stage"><img src="assets/rive/cast-parts-${id}.png" alt="${name}, samlet af separate dele"><canvas width="512" height="512" aria-hidden="true"></canvas></div><div class="controls" aria-label="${name} animationer">${Object.entries(labels).map(([key,label])=>`<button type="button" data-action="${key}" disabled>${label}</button>`).join('')}</div><p class="status" role="status">Afventer Rive</p>`;
  grid.append(card);cards.set(id,card);
  card.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
    const inst=instances.get(id);if(!inst)return;
    const trigger=inst.stateMachineInputs('CastParts')?.find(input=>input.name===button.dataset.action);
    if(trigger){trigger.fire();card.querySelector('.status').textContent=`${labels[button.dataset.action]} · Rive-input aktiveret`}
  }));
}
function setStatus(id,message,error=false){const status=cards.get(id).querySelector('.status');status.textContent=message;status.dataset.error=String(error)}
function clearInstances(){for(const inst of instances.values())try{inst.cleanup()}catch{}instances.clear();window.__castParts.ready=0;for(const [id,card] of cards){card.dataset.ready='false';card.querySelectorAll('button').forEach(b=>b.disabled=true);setStatus(id,'Stillbillede · reduceret bevægelse')}}
function start(){
  if(reduced.matches){clearInstances();globalStatus.textContent='Reduceret bevægelse er slået til. Figurerne vises som stillbilleder.';return}
  if(!window.rive?.Rive){globalStatus.textContent='Rive-runtime kunne ikke indlæses. Stillbillederne er tilgængelige.';for(const [id] of cards)setStatus(id,'Stillbillede · Rive utilgængelig',true);return}
  window.rive.RuntimeLoader.setWasmUrl(new URL('assets/rive/rive.wasm',location.href).href);
  globalStatus.textContent='Animationerne indlæses. Brug knapperne til at afprøve figurernes Rive-input.';
  for(const [id] of figures){
    const card=cards.get(id), canvas=card.querySelector('canvas');
    let inst;
    try{inst=new window.rive.Rive({src:new URL('assets/rive/cast-parts.riv',location.href).href,canvas,artboard:`Parts-${id}`,stateMachines:'CastParts',autoplay:true,
      onLoad:()=>{try{if(reduced.matches){inst?.cleanup();return}inst?.resizeDrawingSurfaceToCanvas();const inputs=inst?.stateMachineInputs('CastParts')||[];const inputNames=inputs.map(i=>i.name);if(!['idle','talk','react','glide'].every(x=>inputNames.includes(x)))throw Error('Manglende state-machine inputs');instances.set(id,inst);card.dataset.ready='true';card.querySelectorAll('button').forEach(b=>b.disabled=false);setStatus(id,'Rive · klar');window.__castParts.ready++;if(window.__castParts.ready===6)globalStatus.textContent='Alle seks figurer er indlæst. Vælg en bevægelse på et kort for at se den.'}catch(error){setStatus(id,error.message,true);window.__castParts.errors.push({id,message:error.message})}},
      onLoadError:error=>{setStatus(id,'Stillbillede · Rive-indlæsning fejlede',true);window.__castParts.errors.push({id,message:String(error)})},
    })}catch(error){setStatus(id,'Stillbillede · Rive kunne ikke starte',true);window.__castParts.errors.push({id,message:String(error)})}
  }
}
reduced.addEventListener('change',()=>{if(reduced.matches)clearInstances();else start()});
start();
