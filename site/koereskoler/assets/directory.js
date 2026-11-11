/* Local first: no map or geolocation requests before the controls need them. */
(() => {
 'use strict';
 const config=JSON.parse(document.getElementById('directory-config').textContent);
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const folded=s=>String(s||'').toLocaleLowerCase('da').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/æ/g,'ae').replace(/ø/g,'oe').replace(/å/g,'aa');
 const km=(a,b)=>{const r=Math.PI/180,dlat=(b.lat-a.lat)*r,dlon=(b.lon-a.lon)*r;return 12742*Math.asin(Math.sqrt(Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlon/2)**2));};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let map, mapPromise, mapReady=false, schoolMode=config.kind==='school', selected=null, origin=null, region='',onlyVerified=false, boundsActive=false,shown=[],busy=false;
 const schools=schoolMode?[config.school]:config.schools||[];
 const announce=t=>{if($('#result-count'))$('#result-count').textContent=t;};
 const errorHint=t=>{if($('#search-hint'))$('#search-hint').textContent=t;};
 function available(){return schools.filter(s=>(!region||s.region===region)&&(!onlyVerified||s.verified));}
 function current(){let rows=available();if(mapReady&&boundsActive){const b=map.getBounds();rows=rows.filter(s=>b.contains([s.lon,s.lat]));}return rows.sort((a,b)=>origin?km(origin,a)-km(origin,b):a.name.localeCompare(b.name,'da'));}
 function paintRows(){if(schoolMode)return;shown=current();const list=$('#results');const focusId=document.activeElement?.closest('[data-id]')?.dataset.id;
  list.innerHTML=shown.length?shown.map((s,i)=>`<li class="result${s.id===selected?' selected':''}" data-id="${s.id}"><span class="ordinal" aria-hidden="true">${i+1}</span><button type="button" class="pick" aria-label="${esc(s.name)}, vis og markér på kort" aria-pressed="${s.id===selected}"><strong>${esc(s.name)}</strong><span class="address">${esc(s.address||s.town+' · adresse ikke verificeret')}</span></button><div class="result-meta"><span class="badge">${s.verified?'Oplysninger fra skolen':s.src==='cvr'?'Adresse fra CVR':'Kortpunkt fra OSM'}</span>${origin?`<span class="small">${km(origin,s).toLocaleString('da-DK',{maximumFractionDigits:1})} km i luftlinje</span>`:''}${s.path?`<a href="${s.path}">Se skolen</a>`:`<a href="${s.townPath}">Se området</a>`}</div></li>`).join(''):'<li class="empty"><h3>Ingen skoler i dette udsnit</h3><p>Zoom ud, flyt kortet, eller vælg et større område. Kortet dækker ikke alle skoler i Danmark.</p></li>';
  const p=origin?' · nærmeste først':'';announce(`${shown.length} ${shown.length===1?'skole':'skoler'}${boundsActive?' i kortudsnittet':' i oversigten'}${p}`);
  if(focusId)list.querySelector(`[data-id="${focusId}"] .pick`)?.focus({preventScroll:true});
 }
 function select(id,fromMap=false){const s=schools.find(x=>x.id===id);if(!s)return;selected=id;
  if(!fromMap&&mapReady){boundsActive=true;map.easeTo({center:[s.lon,s.lat],zoom:Math.max(map.getZoom(),13),duration:reduced?0:450});}
  if(mapReady)map.setFilter('selected-school',['==',['get','id'],id]);
  paintRows();
  if(fromMap){const row=$(`[data-id="${id}"]`);row?.scrollIntoView({block:'nearest',behavior:'instant'});}
  const detail=$('#map-selection');if(detail){detail.hidden=false;detail.innerHTML=`<button type="button" aria-label="Luk valgt skole">×</button><strong>${esc(s.name)}</strong><p>${esc(s.address||s.town+' · adresse ikke verificeret')}</p><a href="${s.path||s.townPath}">${s.path?'Se skole og kontakt':'Se skoler i området'}</a>`;detail.querySelector('button').onclick=()=>{detail.hidden=true;selected=null;mapReady&&map.setFilter('selected-school',['==',['get','id'],'']);paintRows();};}
 }
 function features(rows){return {type:'FeatureCollection',features:rows.map(s=>({type:'Feature',properties:{id:s.id,name:s.name},geometry:{type:'Point',coordinates:[s.lon,s.lat]}}))};}
 function updateSource(){if(mapReady){map.getSource('schools').setData(features(available()));if(selected&&!available().some(s=>s.id===selected)){selected=null;$('#map-selection')?.setAttribute('hidden','');map.setFilter('selected-school',['==',['get','id'],'']);}}paintRows();}
 function fit(rows){if(!mapReady||!rows.length)return;const bounds=new maplibregl.LngLatBounds();rows.forEach(s=>bounds.extend([s.lon,s.lat]));map.fitBounds(bounds,{padding:schoolMode?60:55,maxZoom:schoolMode?15:12,duration:reduced?0:450});}
 async function loadMap(){if(mapPromise)return mapPromise;
  mapPromise=(async()=>{const loading=$('#map-loading');if(!$('#school-map'))return;
   try{
    if(!window.maplibregl){await new Promise((resolve,reject)=>{const css=document.createElement('link');css.rel='stylesheet';css.href='/koereskoler/assets/vendor/maplibre-gl.css';document.head.append(css);const s=document.createElement('script');s.src='/koereskoler/assets/vendor/maplibre-gl.js';s.onload=resolve;s.onerror=reject;document.head.append(s);});}
    if(typeof maplibregl.supported==='function'&&!maplibregl.supported())throw Error('WebGL er ikke understøttet');
    map=new maplibregl.Map({container:'school-map',style:'/koereskoler/assets/map-style.json',center:schoolMode?[schools[0].lon,schools[0].lat]:[10.7,56.0],zoom:schoolMode?14:5.8,maxZoom:18,minZoom:4,attributionControl:false,cooperativeGestures:true,locale:{'Map.Title':'Kort','NavigationControl.ZoomIn':'Zoom ind','NavigationControl.ZoomOut':'Zoom ud','AttributionControl.ToggleAttribution':'Vis kortkilder','CooperativeGesturesHandler.WindowsHelpText':'Hold Ctrl nede, og rul for at zoome','CooperativeGesturesHandler.MacHelpText':'Hold ⌘ nede, og rul for at zoome','CooperativeGesturesHandler.MobileHelpText':'Brug to fingre til at flytte kortet'}});
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
    map.addControl(new maplibregl.AttributionControl({compact:true,customAttribution:'<a href="https://openfreemap.org/">OpenFreeMap</a> · <a href="https://openmaptiles.org/">© OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap, ODbL</a>'}));
    map.getCanvas().setAttribute('aria-label',schoolMode?'Skolens offentliggjorte adresse på kort':'Kort med køreskoler. Brug piletaster til at flytte og plus eller minus til at zoome. Vælg også skole i listen.');
    let timeout=setTimeout(()=>{if(!mapReady&&loading){loading.hidden=false;loading.innerHTML='<strong>Kortet svarer langsomt</strong><p>Du kan stadig bruge skolernes adresser og hele listen.</p>'; }},18000);
    map.on('load',()=>{map.resize();new ResizeObserver(()=>map.resize()).observe($('#school-map'));clearTimeout(timeout);mapReady=true;loading.hidden=true;
     map.addSource('schools',{type:'geojson',data:features(available()),cluster:!schoolMode,clusterMaxZoom:12,clusterRadius:48});
     map.addLayer({id:'school-clusters',type:'circle',source:'schools',filter:['has','point_count'],paint:{'circle-color':'#FFD60A','circle-radius':['step',['get','point_count'],22,10,27,30,31],'circle-stroke-color':'#1F2328','circle-stroke-width':2}});
     map.addLayer({id:'cluster-count',type:'symbol',source:'schools',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-font':['Noto Sans Regular'],'text-size':14},paint:{'text-color':'#1F2328'}});
     map.addLayer({id:'school-points',type:'circle',source:'schools',filter:['!',['has','point_count']],paint:{'circle-color':'#FFD60A','circle-radius':9,'circle-stroke-color':'#1F2328','circle-stroke-width':2}});
     map.addLayer({id:'selected-school',type:'circle',source:'schools',filter:['==',['get','id'],selected||''],paint:{'circle-radius':15,'circle-color':'#FFD60A','circle-stroke-color':'#1F2328','circle-stroke-width':5}});
     map.on('click','school-clusters',async event=>{const f=map.queryRenderedFeatures(event.point,{layers:['school-clusters']})[0];try{const zoom=await map.getSource('schools').getClusterExpansionZoom(f.properties.cluster_id);map.easeTo({center:f.geometry.coordinates,zoom,duration:reduced?0:350});}catch{}});
     map.on('click','school-points',event=>{if(!schoolMode)select(event.features[0].properties.id,true);});
     for(const layer of ['school-clusters','school-points']){map.on('mouseenter',layer,()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave',layer,()=>map.getCanvas().style.cursor='');}
     map.on('movestart',event=>{if(event.originalEvent)boundsActive=true;});map.on('moveend',()=>{if(!schoolMode)paintRows();});
     if(schoolMode)fit(schools);else if(origin){map.jumpTo({center:[origin.lon,origin.lat],zoom:11});boundsActive=true;paintRows();}else fit(available());
    });
    map.on('error',event=>{if(!mapReady&&loading){loading.hidden=false;loading.innerHTML='<strong>Kortet kunne ikke hentes</strong><p>Brug listen og de oplyste adresser. Prøv igen senere.</p>';}});
   }catch(err){mapPromise=null;document.documentElement.dataset.mapError=err.message;$('#map-caption')?.setAttribute('hidden','');if(loading){loading.hidden=false;loading.innerHTML='<strong>Brug listen lige her</strong><p>Enheden eller forbindelsen kunne ikke åbne kortet. Skolernes oplysninger er stadig tilgængelige.</p><button type="button" class="button" id="retry-map">Prøv kortet igen</button>';$('#retry-map').onclick=()=>loadMap();}}
  })();return mapPromise;
 }
 function deferMap(){const container=$('#school-map');if(!container)return;
  $('#load-map')?.addEventListener('click',loadMap);
  const observer=new IntersectionObserver(entries=>{if(entries.some(en=>en.isIntersecting)){observer.disconnect();requestAnimationFrame(()=>requestAnimationFrame(()=>{const run=()=>loadMap();'requestIdleCallback'in window?requestIdleCallback(run,{timeout:1800}):setTimeout(run,300);}));}},{rootMargin:'0px'});observer.observe(container);
 }
 if(config.kind==='index'){
  let activeOption=-1,suggestionRows=[],latestSearch=0,abortController,remoteId=0;
  const input=$('#place'),box=$('#suggestions');
  function closeSuggestions(){box.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');activeOption=-1;}
  function showSuggestions(rows){suggestionRows=rows;activeOption=-1;box.innerHTML=rows.map((s,i)=>`<li role="option" aria-selected="false" id="suggestion-${i}" data-option="${i}">${esc(s.label)}</li>`).join('');box.hidden=!rows.length;input.setAttribute('aria-expanded',String(!!rows.length));input.removeAttribute('aria-activedescendant');}
  function local(q){const query=folded(q);return config.choices.filter(c=>folded(c.label).includes(query)||folded(c.query).includes(query)).slice(0,7);}
  function choose(p){origin={lat:p.lat,lon:p.lon};input.value=p.query||p.label;closeSuggestions();boundsActive=false;errorHint('Afstande er i luftlinje. Kortdata dækker ikke alle køreskoler.');paintRows();if(mapReady){boundsActive=true;map.easeTo({center:[p.lon,p.lat],zoom:p.type==='municipality'?10:12,duration:reduced?0:450});}else if(matchMedia('(min-width:601px)').matches)loadMap();}
  input.addEventListener('input',()=>{remoteId++;abortController?.abort();if(input.value.trim().length<2)closeSuggestions();else showSuggestions(local(input.value.trim()));});
  input.addEventListener('keydown',event=>{if(event.key==='Escape'){closeSuggestions();return;}if(!box.hidden&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();activeOption=(activeOption+(event.key==='ArrowDown'?1:-1)+suggestionRows.length)%suggestionRows.length;box.querySelectorAll('[role=option]').forEach((el,i)=>el.setAttribute('aria-selected',String(i===activeOption)));input.setAttribute('aria-activedescendant','suggestion-'+activeOption);box.children[activeOption]?.scrollIntoView({block:'nearest'});}else if(event.key==='Enter'&&activeOption>=0&&!box.hidden){event.preventDefault();choose(suggestionRows[activeOption]);}});
  box.addEventListener('click',event=>{const el=event.target.closest('[data-option]');if(el)choose(suggestionRows[Number(el.dataset.option)]);});
  document.addEventListener('click',event=>{if(!event.target.closest('.input-wrap'))closeSuggestions();});
  $('#search-form').addEventListener('submit',async event=>{event.preventDefault();const q=input.value.trim();if(q.length<2){errorHint('Skriv mindst to tegn, for eksempel en by eller et postnummer.');input.focus();return;}
   const rows=local(q),exact=rows.find(r=>folded(r.query)===folded(q));if(exact){choose(exact);return;}
   if(Date.now()-latestSearch<1200||busy)return;latestSearch=Date.now();const myId=++remoteId;busy=true;abortController?.abort();abortController=new AbortController();const timer=setTimeout(()=>abortController.abort(),10000);input.setAttribute('aria-busy','true');errorHint('Søger efter stedet hos Photon / OpenStreetMap …');
   try{const r=await fetch('https://photon.komoot.io/api/?'+new URLSearchParams({q,limit:'7',bbox:'7.8,54.4,15.3,57.9'}),{signal:abortController.signal,referrerPolicy:'origin'});if(!r.ok)throw Error('Search');const data=await r.json();if(myId!==remoteId)return;const matches=data.features.filter(f=>String(f.properties.countrycode||'').toUpperCase()==='DK').map(f=>{const p=f.properties,c=f.geometry.coordinates;return {label:[p.street&&p.housenumber?p.street+' '+p.housenumber:p.name,p.postcode,p.city||p.town||p.county].filter(Boolean).join(', '),query:q,lat:c[1],lon:c[0],type:'address'};});showSuggestions(matches.length?matches:rows);errorHint(matches.length?'Vælg et sted fra forslagene. OSM-adresser kan være ufuldstændige.':'Ingen sikre adresseforslag. Prøv et postnummer, en by eller Find nær mig.');input.focus();}
   catch(err){if(myId===remoteId){showSuggestions(rows);errorHint('Adressesøgningen svarer ikke. Brug et lokalt byforslag, et kendt postnummer eller Find nær mig.');}}
   finally{clearTimeout(timer);busy=false;input.removeAttribute('aria-busy');}
  });
  $('#locate').addEventListener('click',()=>{if(!navigator.geolocation){errorHint('Denne browser kan ikke finde din placering. Søg på en by eller adresse.');return;}const button=$('#locate');button.disabled=true;button.textContent='Finder placering …';navigator.geolocation.getCurrentPosition(pos=>{button.disabled=false;button.textContent='Find nær mig';choose({lat:pos.coords.latitude,lon:pos.coords.longitude,label:'Min placering',query:'Min placering',type:'location'});},err=>{button.disabled=false;button.textContent='Find nær mig';errorHint(err.code===1?'Placering er ikke tilladt. Du kan stadig søge på by, postnummer eller adresse.':'Placeringen kunne ikke findes. Prøv en by eller adresse.');},{enableHighAccuracy:false,timeout:10000,maximumAge:60000});});
  $('#region').addEventListener('change',event=>{region=event.target.value;boundsActive=false;origin=null;input.value='';updateSource();if(mapReady)fit(available());});
  for(const [id,on]of [['#all-filter',false],['#verified-filter',true]])$(id).addEventListener('click',()=>{onlyVerified=on;$('#all-filter').setAttribute('aria-pressed',String(!on));$('#verified-filter').setAttribute('aria-pressed',String(on));updateSource();});
  $('#results').addEventListener('click',event=>{const row=event.target.closest('[data-id]');if(row&&event.target.closest('.pick'))select(row.dataset.id);});
  $('#reset').addEventListener('click',()=>{origin=null;region='';onlyVerified=false;boundsActive=false;selected=null;$('#region').value='';input.value='';$('#map-selection').hidden=true;$('#all-filter').setAttribute('aria-pressed','true');$('#verified-filter').setAttribute('aria-pressed','false');updateSource();if(mapReady)fit(available());errorHint('Lokale forslag mens du skriver. Tryk Søg for flere adresser via Photon / OpenStreetMap.');});
  $$('[data-view]').filter(e=>e.tagName==='BUTTON').forEach(button=>button.addEventListener('click',()=>{const view=button.dataset.view;$('.workspace').dataset.view=view;$$('.view-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));if(view==='map'){loadMap();requestAnimationFrame(()=>map?.resize());}else $('#results .pick')?.focus({preventScroll:true});}));
  paintRows();document.documentElement.classList.add('enhanced');
  const query=new URLSearchParams(location.search).get('sted');if(query){const found=config.choices.find(c=>folded(c.query)===folded(query));if(found)choose(found);}
  if(location.hash){const id=location.hash.slice(1);if(schools.some(s=>s.id===id)){select(id);$('#results')?.scrollIntoView({block:'center'});}}
 }
 if(schoolMode||config.kind==='index')deferMap();
})();
