// Three.js scene and motion controller for the playable driving-instructor mode.
// UI flow and case copy remain in judge.js.

export function createJudgeWorld(canvas, fallback, initialMotion=true, initialCase) {
  const T = window.THREE;
  if (!T) {
    fallback.hidden = false;
    fallback.textContent = '3D-scenen kunne ikke indlæses. Opgavens tekst og knapper kan stadig bruges.';
    return { setCase(c){ fallback.textContent=c.setup; }, replay(){}, replayCorrected(){}, snapshot(){return '';}, place(){return 0;}, bindHotspots(){}, clearHotspots(){}, setMotion(){}, dispose(){} };
  }
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias:true, alpha:false, powerPreference:'low-power', preserveDrawingBuffer:true });
  } catch {
    fallback.hidden = false;
    fallback.textContent = '3D-visningen er ikke tilgængelig. Opgavens tekst og knapper kan stadig bruges.';
    return { setCase(c){ fallback.textContent=c.setup; }, replay(){}, replayCorrected(){}, snapshot(){return '';}, place(){return 0;}, bindHotspots(){}, clearHotspots(){}, setMotion(){}, dispose(){} };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .86;
  const scene = new T.Scene();
  scene.background = new T.Color(0x02060c);
  scene.fog = new T.Fog(0x040a12, 29, 52);
  const camera = new T.OrthographicCamera(-11.8,11.8,6.65,-6.65,.1,80);
  camera.position.set(9,19,12);
  camera.lookAt(0,0,0);
  scene.add(new T.HemisphereLight(0x526b87,0x07110f,.16));
  const moon = new T.DirectionalLight(0x8faed2,.28); moon.position.set(-8,18,10); scene.add(moon);

  const mats = new Set(), geos = new Set(), textures = new Set();
  const mat = (color,extra={}) => { const m=new T.MeshStandardMaterial({color,roughness:.72,metalness:.04,...extra}); mats.add(m); return m; };
  const glow = color => { const m=new T.MeshBasicMaterial({color,toneMapped:false}); mats.add(m); return m; };
  const add = (mesh,x=0,y=0,z=0,parent=scene) => { mesh.position.set(x,y,z); parent.add(mesh); return mesh; };
  const box = (w,h,d,color,x=0,y=0,z=0,parent=scene,extra={}) => { const g=new T.BoxGeometry(w,h,d); geos.add(g); return add(new T.Mesh(g,typeof color==='number'?mat(color,extra):color),x,y,z,parent); };
  const plane = (w,d,color,x=0,z=0,y=.01,parent=scene) => { const g=new T.PlaneGeometry(w,d); geos.add(g); const mesh=new T.Mesh(g,typeof color==='number'?mat(color):color); mesh.rotation.x=-Math.PI/2; return add(mesh,x,y,z,parent); };
  const cylinder = (rt,rb,h,color,x,y,z,parent=scene,segments=18) => { const g=new T.CylinderGeometry(rt,rb,h,segments); geos.add(g); return add(new T.Mesh(g,mat(color)),x,y,z,parent); };
  const makeCanvasTexture = draw => { const c=document.createElement('canvas'); c.width=256;c.height=256; const g=c.getContext('2d');draw(g,c);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;textures.add(tx);return tx; };

  plane(40,40,0x07131b,0,0,0);
  plane(8,40,0x3b505a,0,0,.02);
  plane(40,8,0x3b505a,0,0,.021);
  plane(2.15,40,0x26343e,-5.15,0,.023);
  plane(2.15,40,0x26343e,7.55,0,.023);
  plane(40,2.15,0x26343e,0,-5.15,.024);
  plane(40,2.15,0x26343e,0,5.15,.024);
  for (const side of [-1,1]) {
    box(.16,.16,14,0x788588,-4.15,.09,side*11.2);
    box(.16,.16,14,0x788588,6.55,.09,side*11.2);
    box(14,.16,.16,0x788588,-11.2,.09,side*4.15);
    box(11.7,.16,.16,0x788588,12.4,.09,side*4.15);
  }
  for(let z=-18;z<=18;z+=4){ if(Math.abs(z)>4.5) plane(.12,2.1,glow(0xf4f6ef),0,z,.035); }
  for(let x=-18;x<=18;x+=4){ if(Math.abs(x)>4.5) plane(2.1,.12,glow(0xf4f6ef),x,0,.036); }
  plane(2.3,40,0x102934,5.2,0,.025);
  plane(.1,40,glow(0xf4f6ef),4.05,0,.04);
  plane(.1,40,glow(0xf4f6ef),6.35,0,.04);

  function shopSign(text,color){
    const tx=makeCanvasTexture(g=>{g.fillStyle='#10202a';g.fillRect(0,0,256,256);g.fillStyle=color;g.font='800 34px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,128,230);});
    const material=new T.MeshBasicMaterial({map:tx,side:T.DoubleSide,toneMapped:false});mats.add(material);const geo=new T.PlaneGeometry(2.6,.72);geos.add(geo);return new T.Mesh(geo,material);
  }
  for(const side of [-1,1]) for(let i=0;i<4;i++){
    const z=-15+i*9+(side>0?1.5:0), h=2.35+(i%3)*.55, width=4.6, centerX=side*11.5, innerX=centerX-side*(width/2+.03);
    box(width,h,5.2,[0x17242d,0x1c2b3c,0x342635,0x223b32][i],centerX,h/2,z);
    for(let row=0;row<2;row++) for(let col=0;col<2;col++){
      const lit=(i+row+col)%3!==0,color=lit?0xffc77d:0x28414a;
      box(.04,.62,.82,color,innerX,1+row*.86,z-1.25+col*2.15,scene,lit?{emissive:color,emissiveIntensity:.72}:{});
    }
    if(i===1){const signMesh=shopSign(side<0?'NATKIOSK':'DØGNMARKED',side<0?'#9ae6b4':'#ffc97d');signMesh.rotation.y=-side*Math.PI/2;add(signMesh,innerX,1.85,z,scene);}
  }
  function lamp(x,z){
    cylinder(.07,.09,5.2,0x66727b,x,2.6,z);
    box(.8,.08,.2,0x66727b,x-Math.sign(x)*.35,5.15,z);
    box(.32,.08,.3,0xffd789,x-Math.sign(x)*.72,5.08,z);
    const lx=x-Math.sign(x)*.72;
    const poolTexture=makeCanvasTexture(g=>{
      const gradient=g.createRadialGradient(128,128,0,128,128,124);
      gradient.addColorStop(0,'rgba(255,190,112,.22)');gradient.addColorStop(.45,'rgba(255,174,92,.09)');gradient.addColorStop(1,'rgba(255,174,92,0)');
      g.clearRect(0,0,256,256);g.fillStyle=gradient;g.fillRect(0,0,256,256);
    });
    const poolMat=new T.MeshBasicMaterial({map:poolTexture,transparent:true,opacity:.72,depthWrite:false,toneMapped:false});mats.add(poolMat);
    const poolGeo=new T.PlaneGeometry(8.6,8.6);geos.add(poolGeo);const pool=new T.Mesh(poolGeo,poolMat);pool.rotation.x=-Math.PI/2;add(pool,lx,.045,z);
    const light=new T.PointLight(0xffbd72,1.1,11,2);add(light,lx,4.9,z);
  }
  lamp(-5.1,5.8); lamp(5.1,-5.8);

  const OWN_CAR_COLOR=0x4f8fe8;
  function makeCar(color=OWN_CAR_COLOR){
    const g=new T.Group();
    box(1.65,.55,3.2,color,0,.48,0,g,{emissive:color,emissiveIntensity:.13});box(1.38,.52,1.55,0x18313d,0,.93,-.1,g,{roughness:.18,metalness:.3});
    box(1.42,.08,1.58,glow(color),0,1.22,-.1,g);
    for(const x of [-.88,.88]) for(const z of [-1.05,1.05]){
      const geo=new T.CylinderGeometry(.28,.28,.18,16); geos.add(geo); const wheel=new T.Mesh(geo,mat(0x0c1116));wheel.rotation.z=Math.PI/2;add(wheel,x,.3,z,g);
    }
    for(const x of [-.48,.48]){box(.25,.1,.03,glow(0xf4f6d5),x,.55,-1.62,g);box(.3,.09,.03,glow(0xff8178),x,.57,1.62,g);}
    return g;
  }
  function makeCyclist(){
    const g=new T.Group();
    for(const z of [-.48,.48]){const geo=new T.TorusGeometry(.34,.035,8,24);geos.add(geo);const wheel=new T.Mesh(geo,mat(0x111820));wheel.rotation.y=Math.PI/2;add(wheel,0,.38,z,g);}
    box(.08,.55,.75,0xff8178,0,.72,0,g);box(.24,.5,.18,0xe97168,0,1.08,.03,g);cylinder(.14,.14,.25,0xd6a982,0,1.48,-.03,g,14);
    return g;
  }
  function makeWalker(){
    const g=new T.Group();box(.3,.75,.24,0xff8178,0,1,0,g);cylinder(.16,.16,.28,0xd6a982,0,1.55,0,g,14);
    box(.12,.65,.14,0x243545,-.1,.36,0,g);box(.12,.65,.14,0x243545,.1,.36,0,g);return g;
  }
  function signFace(draw,scale=1){
    const tx=makeCanvasTexture(draw);const material=new T.SpriteMaterial({map:tx,transparent:true,depthTest:true,toneMapped:false});mats.add(material);
    const sprite=new T.Sprite(material);sprite.scale.set(1.35*scale,1.35*scale,1);return sprite;
  }
  function drawStop(g){
    const octagon=(radius,color)=>{g.beginPath();for(let i=0;i<8;i++){const a=(22.5+i*45)*Math.PI/180,x=128+radius*Math.cos(a),y=128+radius*Math.sin(a);i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fillStyle=color;g.fill();};
    g.clearRect(0,0,256,256);octagon(119,'#f4f6ef');octagon(105,'#d8434f');g.fillStyle='#fff';g.font='800 57px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('STOP',128,132);
  }
  function drawYield(g){
    g.clearRect(0,0,256,256);g.beginPath();g.moveTo(128,245);g.lineTo(7,18);g.lineTo(249,18);g.closePath();g.fillStyle='#e34d59';g.fill();g.beginPath();g.moveTo(128,202);g.lineTo(43,43);g.lineTo(213,43);g.closePath();g.fillStyle='#f4f6ef';g.fill();
  }
  function makeSign(kind){
    const g=new T.Group();box(.09,2.6,.09,0x7d8d92,0,1.25,0,g);const face=signFace(kind==='stop'?drawStop:drawYield,1.15);add(face,0,2.42,0,g);return g;
  }
  function faceCameraY(object){
    object.rotation.y=Math.atan2(camera.position.x-object.position.x,camera.position.z-object.position.z);
  }
  function makePlaque(text,color=0xffd789){
    const banner=document.createElement('canvas');banner.width=512;banner.height=112;
    const g=banner.getContext('2d');g.fillStyle='rgba(7,16,26,.94)';g.fillRect(2,2,508,108);
    g.strokeStyle='#ffd789';g.lineWidth=4;g.strokeRect(5,5,502,102);
    g.fillStyle=`#${color.toString(16).padStart(6,'0')}`;g.font='800 34px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,57,476);
    const tx=new T.CanvasTexture(banner);tx.encoding=T.sRGBEncoding;textures.add(tx);
    const material=new T.SpriteMaterial({map:tx,transparent:true,toneMapped:false});mats.add(material);
    const sprite=new T.Sprite(material);sprite.scale.set(4.8,1.05,1);return sprite;
  }

  const dynamic=new T.Group();scene.add(dynamic);
  let current=initialCase, own, other, cyclist, walker, sign, ghost, safeLine, correctionPlaque, start=0, playing=false, placing=null, placedTarget=null, corrected=null, motion=!!initialMotion, disposed=false, raf=0, hotspotBindings=[], connectorLayer=null;
  function clearDynamic(){
    while(dynamic.children.length) dynamic.remove(dynamic.children[0]);
    own=other=cyclist=walker=sign=ghost=safeLine=correctionPlaque=null;placing=placedTarget=corrected=null;delete canvas.dataset.replayPhase;
  }
  function stopLine(){ box(3.7,.055,.38,glow(0xf4f6ef),2,.058,4.15,dynamic); }
  function teeth(){
    // S11: spidsen vender mod den vigepligtige bil på tilgangssiden (+z).
    for(let x=.3;x<=3.8;x+=.7){const shape=new T.Shape();shape.moveTo(-.23,0);shape.lineTo(.23,0);shape.lineTo(0,-.55);shape.closePath();const geo=new T.ShapeGeometry(shape);geos.add(geo);const m=new T.Mesh(geo,glow(0xf4f6ef));m.rotation.x=-Math.PI/2;add(m,x,.057,4.05,dynamic);}
  }
  function crosswalk(){ for(let x=-3.6;x<=3.6;x+=.7) plane(.38,2.5,glow(0xf4f6ef),x,1.1,.056,dynamic); }
  function configure(c){
    current=c;clearDynamic();
    own=makeCar();dynamic.add(own);own.rotation.y=0;
    if(c.scene==='stop'){
      stopLine(); sign=makeSign('stop');add(sign,4.6,0,4.35,dynamic);faceCameraY(sign);own.position.set(2,0,8.2);
    } else if(c.scene==='yield'){
      teeth();sign=makeSign('yield');add(sign,4.6,0,4.35,dynamic);faceCameraY(sign);own.position.set(2,0,8.2);other=makeCar(0xff8178);add(other,-8.5,0,1.7,dynamic);other.rotation.y=-Math.PI/2;
    } else if(c.scene==='bike'){
      own.position.set(2,0,8);cyclist=makeCyclist();add(cyclist,5.2,0,6.2,dynamic);own.rotation.y=0;
    } else {
      crosswalk();own.position.set(2,0,8.2);walker=makeWalker();add(walker,5.2,0,1.1,dynamic);walker.rotation.y=-Math.PI/2;
    }
    setProgress(1);
  }
  function setProgress(p){
    if(!own)return;
    own.position.x=2;
    if(current.scene==='stop') own.position.z=8.2+(2.85-8.2)*p;
    else if(current.scene==='yield'){
      own.position.z=8.2+(2.55-8.2)*p;
      if(other) other.position.x=-8.5+5.5*p;
    } else if(current.scene==='bike'){
      own.position.z=8+(2.25-8)*p;own.position.x=2+1.15*p;own.rotation.y=-.28*p;
      if(cyclist) cyclist.position.z=6.2+(1.75-6.2)*p;
    } else {
      own.position.z=8.2+(3.4-8.2)*p;
      if(walker) walker.position.x=5.2+(1.55-5.2)*p;
    }
  }
  function clearPlacementGuides(){
    if(ghost){dynamic.remove(ghost);ghost=null;}
    if(safeLine){dynamic.remove(safeLine);safeLine=null;}
    if(correctionPlaque){dynamic.remove(correctionPlaque);correctionPlaque=null;}
    placing=null;placedTarget=null;corrected=null;delete canvas.dataset.replayPhase;
  }
  function replay(){ clearPlacementGuides();start=performance.now();playing=motion;if(!motion)setProgress(1);else setProgress(0); }
  const clamp01=value=>Math.max(0,Math.min(1,value));
  const mix=(from,to,p)=>from+(to-from)*clamp01(p);
  function addMistakeGhost(){
    ghost=makeCar(0x667681);ghost.position.copy(own.position);ghost.rotation.copy(own.rotation);
    if(current.scene==='yield') ghost.position.z=4.55;
    else if(current.scene==='bike'){ghost.position.x=2.7;ghost.position.z=3.45;ghost.rotation.y=-.16;}
    else if(current.scene==='pedestrian') ghost.position.z=4;
    ghost.traverse(node=>{if(node.material){node.material.transparent=true;node.material.opacity=.3;node.material.depthWrite=false;}});dynamic.add(ghost);
  }
  function correctedProgress(value){
    if(!own)return;
    const p=clamp01(value),approachEnd=.27,waitEnd=.64;
    const replayPhase=p<approachEnd?'approach':p<waitEnd?'waiting':'continue';
    canvas.dataset.replayPhase=replayPhase;
    canvas.setAttribute('aria-label',`Korrekt forløb: ${replayPhase==='approach'?'bilen nærmer sig':replayPhase==='waiting'?'bilen holder tilbage før konfliktpunktet':'bilen fortsætter, efter passagen er fri'}.`);
    const approach=clamp01(p/approachEnd),waiting=clamp01((p-approachEnd)/(waitEnd-approachEnd)),leave=clamp01((p-waitEnd)/(1-waitEnd));
    own.position.x=2;own.rotation.y=0;
    if(correctionPlaque) correctionPlaque.visible=p>=approachEnd&&p<=waitEnd;
    if(current.scene==='stop'){
      own.position.z=p<approachEnd?mix(8.2,6.1,approach):p<waitEnd?6.1:mix(6.1,-4.2,leave);
    } else if(current.scene==='yield'){
      own.position.z=p<approachEnd?mix(8.2,6,approach):p<waitEnd?6:mix(6,-4.2,leave);
      if(other) other.position.x=p<approachEnd?mix(-8.5,-5,approach):p<waitEnd?mix(-5,7.4,waiting):mix(7.4,9.5,leave);
    } else if(current.scene==='bike'){
      own.position.z=p<approachEnd?mix(8,5.9,approach):p<waitEnd?5.9:mix(5.9,leave<.48?1.65:1.65,clamp01(leave/.48));
      if(p>=waitEnd){
        const turn=clamp01((leave-.42)/.58);own.position.x=mix(2,8,turn);own.rotation.y=mix(0,-Math.PI/2,turn);
      }
      if(cyclist) cyclist.position.z=p<approachEnd?mix(6.2,4.8,approach):p<waitEnd?mix(4.8,-4.3,waiting):mix(-4.3,-6,leave);
    } else {
      own.position.z=p<approachEnd?mix(8.2,4.5,approach):p<waitEnd?4.5:mix(4.5,-4.2,leave);
      if(walker) walker.position.x=p<approachEnd?mix(5.2,4.2,approach):p<waitEnd?mix(4.2,-4.5,waiting):mix(-4.5,-5.4,leave);
    }
  }
  function replayCorrected(){
    clearPlacementGuides();playing=false;placing=null;setProgress(1);addMistakeGhost();
    corrected={start:performance.now(),playing:motion,duration:7600};
    correctedProgress(motion?0:.46);
    return motion?corrected.duration:0;
  }
  function place(choiceId){
    const targets={
        'before-line':{x:2,z:6.1,r:0}, 'behind-teeth':{x:2,z:6,r:0},
      'before-cycleway':{x:2,z:5.9,r:0}, 'before-crossing':{x:2,z:4.5,r:0},
    };
    const target=targets[choiceId];if(!target||!own)return 0;
    playing=false;setProgress(1);
    const from={x:own.position.x,z:own.position.z,r:own.rotation.y};
    ghost=makeCar(0x61727d);ghost.position.copy(own.position);ghost.rotation.copy(own.rotation);ghost.traverse(node=>{if(node.material){node.material.transparent=true;node.material.opacity=.24;node.material.depthWrite=false;}});dynamic.add(ghost);
    const geo=new T.BufferGeometry().setFromPoints([new T.Vector3(from.x,.1,from.z),new T.Vector3(target.x,.1,target.z)]);geos.add(geo);
    const lm=new T.LineDashedMaterial({color:0xf4cd63,dashSize:.3,gapSize:.2,transparent:true,opacity:.9});mats.add(lm);safeLine=new T.Line(geo,lm);safeLine.computeLineDistances();dynamic.add(safeLine);
    placedTarget=target;
    if(!motion){own.position.set(target.x,0,target.z);own.rotation.y=target.r;return 0;}
    placing={from,target,start:performance.now(),duration:720};return 720;
  }
  function snapshot(){
    if(disposed||!renderer||!canvas)return '';
    if(placing&&placedTarget){placing=null;own.position.set(placedTarget.x,0,placedTarget.z);own.rotation.y=placedTarget.r;}
    const overlays=[ghost,safeLine].filter(Boolean),visibility=overlays.map(item=>item.visible);overlays.forEach(item=>{item.visible=false;});
    try { renderer.render(scene,camera);return canvas.toDataURL('image/jpeg',.84); }
    catch { return ''; }
    finally { overlays.forEach((item,index)=>{item.visible=visibility[index];}); }
  }
  function resize(){
    const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);
    const aspect=r.width/r.height, halfH=Math.max(6.65,8.2/aspect);camera.left=-halfH*aspect;camera.right=halfH*aspect;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();
    updateHotspots();
  }
  function hotspotPoint(item){
    const anchored=item.anchor&&({own,other,cyclist,walker,sign}[item.anchor]);
    if(anchored){
      const y=item.anchor==='own'||item.anchor==='other'?1.35:1.55;
      return new T.Vector3(anchored.position.x,anchored.position.y+y,anchored.position.z);
    }
    return Array.isArray(item.world)?new T.Vector3(item.world[0],item.world[1],item.world[2]):null;
  }
  function updateHotspots(){
    camera.updateMatrixWorld(true);
    const stageWidth=canvas.clientWidth,stageHeight=canvas.clientHeight;
    if(connectorLayer&&stageWidth&&stageHeight){connectorLayer.setAttribute('viewBox',`0 0 ${stageWidth} ${stageHeight}`);connectorLayer.setAttribute('preserveAspectRatio','none');}
    for(const binding of hotspotBindings){
      const point=hotspotPoint(binding.item);if(!point)continue;
      point.project(camera);
      const visible=point.z>=-1&&point.z<=1&&point.x>=-1.05&&point.x<=1.05&&point.y>=-1.05&&point.y<=1.05;
      binding.button.hidden=!visible;
      const originX=(point.x+1)*stageWidth/2,originY=(1-point.y)*stageHeight/2;
      const rawOffset=Array.isArray(binding.item.offset)?binding.item.offset:[0,0];
      const dx=Math.max(-.35,Math.min(.35,Number(rawOffset[0])||0));
      const dy=Math.max(-.35,Math.min(.35,Number(rawOffset[1])||0));
      const markerX=Math.max(22,Math.min(stageWidth-22,originX+dx*stageWidth));
      const markerY=Math.max(22,Math.min(stageHeight-22,originY+dy*stageHeight));
      binding.button.style.setProperty('--x',`${stageWidth?markerX/stageWidth*100:50}%`);
      binding.button.style.setProperty('--y',`${stageHeight?markerY/stageHeight*100:50}%`);
      if(binding.connector){
        binding.connector.style.display=!visible||(!dx&&!dy)?'none':'';
        binding.connector.setAttribute('x1',String(originX));binding.connector.setAttribute('y1',String(originY));
        binding.connector.setAttribute('x2',String(markerX));binding.connector.setAttribute('y2',String(markerY));
      }
      const label=binding.button.querySelector('span');
      if(label){
        const x=markerX,y=markerY;
        const halfLabel=label.offsetWidth/2,margin=8;
        const labelCenter=Math.max(margin+halfLabel,Math.min(stageWidth-margin-halfLabel,x));
        binding.button.style.setProperty('--label-offset-x',`${labelCenter-x}px`);
        const labelAbove=y+31+label.offsetHeight>stageHeight-margin;
        binding.button.style.setProperty('--label-top',labelAbove?'-8px':'calc(100% + 8px)');
        binding.button.style.setProperty('--label-shift-y',labelAbove?'-100%':'0px');
      }
    }
  }
  function bindHotspots(items,buttons){
    clearHotspots();
    const host=buttons.find(Boolean)?.parentElement;
    if(host){
      connectorLayer=document.createElementNS('http://www.w3.org/2000/svg','svg');
      connectorLayer.setAttribute('aria-hidden','true');connectorLayer.setAttribute('focusable','false');
      connectorLayer.setAttribute('class','judge__hotspot-connectors');
      Object.assign(connectorLayer.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',overflow:'visible'});
      host.prepend(connectorLayer);
    }
    hotspotBindings=items.map((item,index)=>{
      let connector=null;
      if(connectorLayer&&Array.isArray(item.offset)&&(Number(item.offset[0])||Number(item.offset[1]))){
        connector=document.createElementNS('http://www.w3.org/2000/svg','line');
        connector.setAttribute('stroke','#f4cd63');connector.setAttribute('stroke-width','1.5');connector.setAttribute('stroke-opacity','.8');
        connector.setAttribute('vector-effect','non-scaling-stroke');connectorLayer.append(connector);
      }
      return {item,button:buttons[index],connector};
    }).filter(binding=>binding.button);
    updateHotspots();
  }
  function clearHotspots(){hotspotBindings=[];connectorLayer?.remove();connectorLayer=null;}
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  function frame(now){
    if(disposed)return;
    if(playing){const p=Math.min(1,(now-start)/5500);const eased=1-Math.pow(1-p,3);setProgress(eased);if(p>=1)playing=false;}
    if(corrected?.playing){const p=Math.min(1,(now-corrected.start)/corrected.duration);correctedProgress(p);if(p>=1)corrected.playing=false;}
    if(placing){const p=Math.min(1,(now-placing.start)/placing.duration),eased=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;own.position.x=placing.from.x+(placing.target.x-placing.from.x)*eased;own.position.z=placing.from.z+(placing.target.z-placing.from.z)*eased;own.rotation.y=placing.from.r+(placing.target.r-placing.from.r)*eased;if(p>=1)placing=null;}
    updateHotspots();
    renderer.render(scene,camera);raf=requestAnimationFrame(frame);
  }
  configure(current);setProgress(0);resize();raf=requestAnimationFrame(frame);
  return {
    setCase(c,autoplay=true){configure(c);if(autoplay)replay();else{playing=false;setProgress(0);}}, replay, replayCorrected, snapshot,
    place, bindHotspots, clearHotspots,
    setMotion(value){
      const hadCorrected=!!corrected;motion=!!value;
      if(hadCorrected){if(!motion){corrected.playing=false;correctedProgress(.46);}else replayCorrected();return;}
      if(!motion){playing=false;if(placedTarget){placing=null;own.position.set(placedTarget.x,0,placedTarget.z);own.rotation.y=placedTarget.r;}else setProgress(1);}else if(!placedTarget)replay();
    },
    dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();clearHotspots();for(const g of geos)g.dispose();for(const m of mats)m.dispose();for(const t of textures)t.dispose();renderer.dispose();renderer.forceContextLoss();},
  };
}


