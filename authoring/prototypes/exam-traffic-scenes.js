// Procedural Three.js traffic situations for NATKØRSEL.
// Geometry is deliberately self-contained: the hosted build only needs window.THREE.

const DETAIL_IDS = new Set([
  'q-001','q-003','q-004','q-005','q-015','q-017','q-018','q-019','q-041','q-045','q-046','q-047',
  'q-048','q-049','q-050','q-053','q-054','q-055','q-057','q-069','q-070','q-079','q-080',
]);

const ALL_IDS = Array.from({length: 83}, (_, i) => `q-${String(i + 1).padStart(3, '0')}`);
export const TRAFFIC_SCENE_IDS = Object.freeze(ALL_IDS.filter(id => !DETAIL_IDS.has(id)));

const P = Object.freeze({
  sky: 0xb8d6e7, haze: 0xdce7e9, asphalt: 0x45494b, asphaltWet: 0x252c31,
  marking: 0xf5f3e8, kerb: 0xc9c5b8, pavement: 0xa7a39a, grass: 0x67865a,
  hedge: 0x315f43, leaf: 0x527f48, trunk: 0x6b4c35, brick: 0xa45e4e,
  plaster: 0xe5d6bd, roof: 0x6d4a43, glass: 0x8fb7c5, darkGlass: 0x294653,
  ego: 0x2e6f88, blue: 0x285e93, red: 0xb83e3e, yellow: 0xf1bd3d, white: 0xf3f1e9,
  black: 0x171b1d, orange: 0xe78330, skin: 0xd89f78, denim: 0x31577d,
});

function mat(T, color, roughness=.72, metalness=.03, extra={}) {
  return new T.MeshStandardMaterial({color, roughness, metalness, ...extra});
}
function mesh(T, geometry, material, x=0, y=0, z=0, cast=true, receive=true) {
  const out = new T.Mesh(geometry, material);
  out.position.set(x,y,z); out.castShadow=cast; out.receiveShadow=receive; return out;
}
function box(T, parent, size, pos, color, opts={}) {
  const m=mesh(T,new T.BoxGeometry(...size),mat(T,color,opts.roughness??.75,opts.metalness??.02,opts.material||{}),...pos,opts.cast!==false,opts.receive!==false);
  if(opts.rot) m.rotation.set(...opts.rot); parent.add(m); return m;
}
function cylinder(T,parent,r1,r2,h,pos,color,rot=[0,0,0],segments=20,opts={}) {
  const m=mesh(T,new T.CylinderGeometry(r1,r2,h,segments),mat(T,color,opts.roughness??.72,opts.metalness??.03,opts.material||{}),...pos,opts.cast!==false,opts.receive!==false);
  m.rotation.set(...rot); parent.add(m); return m;
}
function sphere(T,parent,r,pos,color,scale=[1,1,1],opts={}) {
  const m=mesh(T,new T.SphereGeometry(r,20,12),mat(T,color,opts.roughness??.7,opts.metalness??.02,opts.material||{}),...pos,opts.cast!==false,opts.receive!==false);
  m.scale.set(...scale); parent.add(m); return m;
}
function cylBetween(T,parent,a,b,r,color,opts={}) {
  const av=new T.Vector3(...a), bv=new T.Vector3(...b), delta=bv.clone().sub(av);
  const m=mesh(T,new T.CylinderGeometry(r,r,delta.length(),opts.segments||10),mat(T,color,opts.roughness??.72,opts.metalness??.02),0,0,0,true,true);
  m.position.copy(av.clone().add(bv).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()); parent.add(m); return m;
}

function addEnvironment(T, scene, mode='city', weather='clear') {
  const night=weather==='night', foggy=weather==='fog';
  scene.background=new T.Color(night?0x101a2a:foggy?0xc3c9c7:P.sky);
  scene.fog=new T.Fog(scene.background, foggy?18:night?32:55, foggy?58:night?90:150);
  const hemi=new T.HemisphereLight(night?0x6a84a8:0xeaf6ff,night?0x15202a:0x667455,night?.58:1.15); scene.add(hemi);
  const sun=new T.DirectionalLight(night?0x9bb8df:0xfff1d0,night?.65:1.65); sun.position.set(-18,28,16); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-28; sun.shadow.camera.right=28; sun.shadow.camera.top=32; sun.shadow.camera.bottom=-22; scene.add(sun);
  box(T,scene,[130,.18,150],[0,-.14,-25],mode==='country'?0x668357:0x718765,{cast:false});
  if(mode==='city') {
    addBuildingRow(T,scene,-12,-18,1); addBuildingRow(T,scene,12,-20,-1);
  } else if(mode==='country') {
    for(let z=-15;z>-78;z-=10){ addTree(T,scene,-10+(z%3),z,1.0); addTree(T,scene,11-(z%4),z-4,.85); }
  }
  if(weather==='rain') addRain(T,scene);
  if(weather==='frost') addFrost(T,scene);
}

function addBuildingRow(T,scene,x,z,side) {
  const tones=[P.brick,P.plaster,0xc7b49a,0x8e665b];
  for(let i=0;i<4;i++){
    const w=6+(i%2)*1.5,h=5.2+(i%3)*.8,d=8;
    const g=new T.Group(); g.position.set(x+side*(i%2)*1.1,0,z-i*12);
    box(T,g,[w,h,d],[0,h/2,0],tones[i],{roughness:.92});
    const roof=mesh(T,new T.ConeGeometry(w*.72,2,4),mat(T,P.roof,.9),0,h+1,0); roof.rotation.y=Math.PI/4; roof.scale.z=d/w; g.add(roof);
    for(const zz of [-2.2,2.2]) for(const yy of [1.7,3.5]) box(T,g,[.09,.9,1.05],[side*(w/2+.05),yy,zz],P.darkGlass,{roughness:.2,material:{emissive:0x0c171b,emissiveIntensity:.12}});
    for(const yy of [1.65,3.35]) for(const xx of [-1.55,0,1.55]) if(Math.abs(xx)<w/2-.35){
      box(T,g,[.9,1.05,.08],[xx,yy,d/2+.05],0xe8ded0,{roughness:.8});
      box(T,g,[.68,.81,.09],[xx,yy,d/2+.1],P.darkGlass,{roughness:.16,material:{emissive:0x10242b,emissiveIntensity:.16}});
      box(T,g,[.055,.83,.11],[xx,yy,d/2+.16],0xece7dc,{roughness:.8});
    }
    box(T,g,[1.05,2.05,.1],[0,1.02,d/2+.08],0x4d382d,{roughness:.8});
    box(T,g,[.08,2,1.05],[side*(w/2+.06),1,0],0x4d382d,{roughness:.8});g.userData.isBuilding=true;scene.add(g);
  }
}

function addTree(T,parent,x,z,s=1) {
  const g=new T.Group(); g.position.set(x,0,z); g.scale.setScalar(s);
  cylinder(T,g,.23,.34,3.5,[0,1.75,0],P.trunk,[0,0,0],12);
  sphere(T,g,1.45,[0,4.05,0],P.leaf,[1,.95,1]); sphere(T,g,1.0,[-.8,3.75,.1],0x446d42,[1,.9,1]); sphere(T,g,.95,[.8,3.7,.15],0x608d50,[1,.9,1]); parent.add(g); return g;
}

function addRain(T,scene) {
  const positions=[];
  for(let i=0;i<520;i++){ const x=((i*37)%101)/101*38-19,y=((i*67)%97)/97*15+1,z=-((i*53)%211)/211*85+8; positions.push(x,y,z,x-.12,y-.5,z+.08); }
  const geo=new T.BufferGeometry(); geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  const lines=new T.LineSegments(geo,new T.LineBasicMaterial({color:0xcde1eb,transparent:true,opacity:.38})); scene.add(lines);
}
function addFrost(T,scene){
  const patch=mesh(T,new T.PlaneGeometry(10,22),mat(T,0xb8d7dd,.28,.08,{transparent:true,opacity:.38}),0,.018,-38,false,true); patch.rotation.x=-Math.PI/2; scene.add(patch);
}

function roadPlane(T,parent,{width=8,length=110,x=0,z=-32,wet=false}={}) {
  const road=box(T,parent,[width,.14,length],[x,0,z],wet?P.asphaltWet:P.asphalt,{roughness:wet?.28:.88,metalness:wet?.08:0,cast:false});
  // Raised kerbs and pavements keep the road profile visually legible.
  for(const s of [-1,1]){
    box(T,parent,[.24,.24,length],[x+s*(width/2+.12),.11,z],P.kerb,{roughness:.95});
    box(T,parent,[2.6,.18,length],[x+s*(width/2+1.54),.22,z],P.pavement,{roughness:.96,cast:false});
  }
  return road;
}
function dashedLine(T,parent,x,zStart=-2,zEnd=-85,color=P.marking) {
  for(let z=zStart;z>zEnd;z-=7) box(T,parent,[.11,.025,3],[x,.09,z],color,{cast:false});
}
function solidLine(T,parent,x,z=-40,length=80,color=P.marking,w=.1){ box(T,parent,[w,.025,length],[x,.09,z],color,{cast:false}); }
function straightRoad(T,scene,{wet=false,lanes=2,country=false}={}){
  const width=lanes===4?14:8;
  if(country) box(T,scene,[width,.14,118],[0,0,-38],wet?P.asphaltWet:P.asphalt,{roughness:wet?.28:.88,metalness:wet?.08:0,cast:false}); else roadPlane(T,scene,{width,length:118,z:-38,wet});
  solidLine(T,scene,-width/2+.34,-38,116); solidLine(T,scene,width/2-.34,-38,116);
  if(lanes===2) dashedLine(T,scene,0); else { dashedLine(T,scene,0); dashedLine(T,scene,-3.5); dashedLine(T,scene,3.5); }
}
function crossRoad(T,scene,{wet=false,signal=false,signalState='green',t=false}={}){
  const roadColor=wet?P.asphaltWet:P.asphalt;
  box(T,scene,[8,.14,118],[0,0,-38],roadColor,{roughness:wet?.3:.88,cast:false});
  box(T,scene,[t?30:55,.14,8],[t?15:0,.01,-31],roadColor,{roughness:wet?.3:.88,cast:false});
  for(const segment of [{z:-8.5,l:37},{z:-66.5,l:61}]) for(const s of [-1,1]){
    box(T,scene,[.24,.24,segment.l],[s*4.12,.11,segment.z],P.kerb,{roughness:.95});
    box(T,scene,[2.6,.18,segment.l],[s*5.54,.22,segment.z],P.pavement,{roughness:.96,cast:false});
    box(T,scene,[.1,.025,segment.l],[s*3.66,.09,segment.z],P.marking,{cast:false});
  }
  if(t){box(T,scene,[.24,.24,118],[-4.12,.11,-38],P.kerb,{roughness:.95});box(T,scene,[2.6,.18,118],[-5.54,.22,-38],P.pavement,{roughness:.96,cast:false});box(T,scene,[.1,.025,118],[-3.66,.09,-38],P.marking,{cast:false});}
  dashedLine(T,scene,0,10,-25); dashedLine(T,scene,0,-37,-96);
  const sideSegments=t?[{x:17,l:26}]:[{x:-17,l:26},{x:17,l:26}];
  for(const segment of sideSegments) for(const s of [-1,1]){
    box(T,scene,[segment.l,.24,.24],[segment.x,.11,-31+s*4.12],P.kerb,{roughness:.95});
    box(T,scene,[segment.l,.18,2.6],[segment.x,.22,-31+s*5.54],P.pavement,{roughness:.96,cast:false});
    box(T,scene,[segment.l,.025,.1],[segment.x,.09,-31+s*3.66],P.marking,{cast:false});
  }
  if(t) dashedLineHorizontal(T,scene,4.5,29,-31); else {dashedLineHorizontal(T,scene,-29,-4.5,-31);dashedLineHorizontal(T,scene,4.5,29,-31);}
  if(signal){ addTrafficLight(T,scene,-4.9,-25,signalState); addTrafficLight(T,scene,4.9,-25,signalState); }
  return scene;
}
function dashedLineHorizontal(T,parent,x0,x1,z){ for(let x=x0;x<x1;x+=7) box(T,parent,[3,.025,.11],[x+1.5,.09,z],P.marking,{cast:false}); }
function zebra(T,parent,z,x=0,rotation=0){ const g=new T.Group(); for(let i=-4;i<=4;i++) box(T,g,[.46,.025,3.7],[i*.74,.1,0],P.marking,{cast:false}); g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);return g; }
function yieldTeeth(T,parent,z,x=2,rotation=0){
  const g=new T.Group(); for(let i=-2;i<=2;i++){const sh=new T.Shape();sh.moveTo(-.32,0);sh.lineTo(.32,0);sh.lineTo(0,-.62);sh.closePath();const m=mesh(T,new T.ShapeGeometry(sh),mat(T,P.marking,.9),i*.78,.1,0,false,true);m.rotation.x=-Math.PI/2;g.add(m);} g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);return g;
}

function vehicleBody(T,color) {
  const shape=new T.Shape(); shape.moveTo(-2,0);shape.lineTo(-1.88,.48);shape.quadraticCurveTo(-1.65,.7,-1.25,.74);shape.lineTo(-.75,1.28);shape.quadraticCurveTo(-.52,1.5,-.15,1.52);shape.lineTo(.78,1.48);shape.quadraticCurveTo(1.02,1.42,1.22,1.15);shape.lineTo(1.55,.75);shape.quadraticCurveTo(1.92,.67,2,.38);shape.lineTo(2,0);shape.closePath();
  const geo=new T.ExtrudeGeometry(shape,{depth:1.72,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:3,curveSegments:8}); geo.center();
  const body=mesh(T,geo,mat(T,color,.38,.18),0,.72,0); body.rotation.y=-Math.PI/2; return body;
}
function addCar(T,parent,{x=2,z=-2,heading=0,color=P.red,ego=false,lights=false,indicator='',openDoor=false}={}){
  const g=new T.Group(); g.position.set(x,0,z);g.rotation.y=heading;
  g.add(vehicleBody(T,ego?P.ego:color));
  // Dark inset cabin, separated glass planes, and pillars read as a real car at exam scale.
  box(T,g,[1.54,.72,1.72],[0,1.25,.12],P.darkGlass,{roughness:.18,metalness:.08});
  box(T,g,[1.6,.09,.12],[0,1.25,-.76],ego?P.ego:color); box(T,g,[1.6,.09,.12],[0,1.25,.96],ego?P.ego:color);
  box(T,g,[.1,.68,1.86],[0,1.23,.1],ego?P.ego:color);
  for(const side of [-1,1]) for(const zz of [-1.23,1.22]){
    const tyre=cylinder(T,g,.36,.36,.25,[side*.91,.42,zz],P.black,[0,0,Math.PI/2],20,{roughness:.9});
    cylinder(T,g,.17,.17,.27,[side*.92,.42,zz],0xb8bdbe,[0,0,Math.PI/2],16,{metalness:.65,roughness:.3});
  }
  for(const xx of [-.55,.55]) { box(T,g,[.38,.18,.08],[xx,.66,-2.02],0xf7e1ab,{material:{emissive:lights?0xffd98a:0x261f15,emissiveIntensity:lights?2:.12}}); box(T,g,[.38,.17,.08],[xx,.65,2.02],0xa52323,{material:{emissive:0x4a0808,emissiveIntensity:.5}}); }
  if(indicator){ const side=indicator==='left'?-1:1; box(T,g,[.2,.14,.09],[side*.75,.64,-2.04],P.orange,{material:{emissive:P.orange,emissiveIntensity:2}}); }
  if(openDoor){ const side=openDoor==='right'?1:-1;const door=box(T,g,[.08,.68,1.25],[side*1.02,.94,.35],ego?P.ego:color);door.rotation.y=side*.7;door.position.x=side*1.42; }
  g.userData.sceneSubject=true;g.userData.isEgo=!!ego;parent.add(g);return g;
}

function addTruck(T,parent,{x=2,z=-18,heading=0,color=0x2e6577,indicator='right'}={}){
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=heading;
  box(T,g,[2.45,2.6,6.8],[0,1.55,1.65],0xe8e6df,{roughness:.6});
  box(T,g,[2.4,2.25,2.7],[0,1.34,-3.15],color,{roughness:.4,metalness:.1});
  box(T,g,[2.05,.82,.1],[0,1.82,-4.53],P.darkGlass,{roughness:.15});
  for(const side of [-1,1]) for(const zz of [-3.65,-2.35,.1,2.6,4.05]) { cylinder(T,g,.47,.47,.3,[side*1.16,.48,zz],P.black,[0,0,Math.PI/2],20); cylinder(T,g,.21,.21,.32,[side*1.17,.48,zz],0xb7babc,[0,0,Math.PI/2],14,{metalness:.7}); }
  if(indicator) for(const side of indicator==='right'?[1]:[-1]) box(T,g,[.2,.16,.08],[side*.95,.78,-4.53],P.orange,{material:{emissive:P.orange,emissiveIntensity:2}});
  g.userData.sceneSubject=true;parent.add(g);return g;
}

function addTractor(T,parent,{x=2,z=-20,heading=0}={}){
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=heading;
  box(T,g,[1.85,1.2,2.45],[0,1.05,0],0x406e43,{roughness:.55});box(T,g,[1.55,1.35,1.35],[0,2,.42],P.darkGlass,{roughness:.2});
  for(const s of [-1,1]){cylinder(T,g,.72,.72,.42,[s*1,.72,.66],P.black,[0,0,Math.PI/2],20);cylinder(T,g,.44,.44,.35,[s*.88,.45,-1.05],P.black,[0,0,Math.PI/2],20);} cylinder(T,g,.08,.08,2.4,[0,2.5,-1.1],P.black,[Math.PI/2,0,0],10);g.userData.sceneSubject=true;parent.add(g);return g;
}

function addBicycle(T,parent,{x=3.3,z=-4,heading=0,color=0xb53838,rider=true}={}){
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=heading;
  for(const zz of [-.78,.78]) { const wh=mesh(T,new T.TorusGeometry(.43,.055,9,24),mat(T,P.black,.88),0,.48,zz); wh.rotation.y=Math.PI/2;g.add(wh); }
  cylBetween(T,g,[0,.48,-.78],[0,.62,.18],.045,color);cylBetween(T,g,[0,.48,.78],[0,.62,.18],.045,color);cylBetween(T,g,[0,.48,-.78],[0,.9,.18],.045,color);cylBetween(T,g,[0,.9,.18],[0,.48,.78],.045,color);cylBetween(T,g,[0,.62,.18],[0,.9,.18],.045,color);cylBetween(T,g,[0,.48,-.78],[0,.98,-.62],.035,color);
  box(T,g,[.35,.06,.18],[0,.95,.24],P.black);
  if(rider){ sphere(T,g,.18,[0,2.12,.1],P.skin);cylinder(T,g,.2,.25,.72,[0,1.58,.08],0x456b89,[0,0,0],12);cylBetween(T,g,[-.09,1.22,.08],[-.05,.66,.38],.08,P.denim);cylBetween(T,g,[.09,1.22,.08],[.08,.62,-.12],.08,P.denim);cylBetween(T,g,[-.16,1.7,.04],[-.08,1.05,-.52],.07,P.skin);cylBetween(T,g,[.16,1.7,.04],[.08,1.05,-.52],.07,P.skin); }
  g.userData.sceneSubject=true;parent.add(g);return g;
}

function addMotorcycle(T,parent,{x=0,z=-12,heading=Math.PI,color=0x33383d,light=true}={}){
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=heading;
  for(const zz of [-.78,.78]){const wh=mesh(T,new T.TorusGeometry(.38,.09,10,24),mat(T,P.black,.86),0,.43,zz);wh.rotation.y=Math.PI/2;g.add(wh);} cylBetween(T,g,[0,.43,-.78],[0,.7,.1],.09,color);cylBetween(T,g,[0,.43,.78],[0,.7,.1],.09,color);box(T,g,[.48,.35,.9],[0,.72,.05],color,{metalness:.28,roughness:.35});sphere(T,g,.22,[0,1.75,.12],P.black);cylinder(T,g,.22,.28,.7,[0,1.27,.12],0x303a4b,[0,0,0],12);sphere(T,g,.12,[0,.82,-.68],light?0xffefc2:0x777777,[1,1,.35],{material:{emissive:light?0xffcf78:0,emissiveIntensity:light?3:0}});g.userData.sceneSubject=true;parent.add(g);return g;
}

function addPerson(T,parent,{x=0,z=0,heading=0,coat=0xc74d45,child=false,police=false,arm='down'}={}){
  const g=new T.Group();const s=child?.68:1;g.position.set(x,0,z);g.rotation.y=heading;g.scale.setScalar(s);
  sphere(T,g,.22,[0,1.75,0],P.skin);cylinder(T,g,.22,.32,.82,[0,1.17,0],police?0x244b75:coat,[0,0,0],14);cylinder(T,g,.12,.14,.72,[-.16,.48,0],0x253343,[0,0,.08],12);cylinder(T,g,.12,.14,.72,[.16,.48,0],0x253343,[0,0,-.08],12);
  if(arm==='stop'){cylBetween(T,g,[-.2,1.45,0],[-.75,1.7,0],.09,police?0x244b75:coat);cylBetween(T,g,[.2,1.45,0],[.45,.8,0],.09,police?0x244b75:coat);} else {cylBetween(T,g,[-.2,1.45,0],[-.36,.85,0],.09,police?0x244b75:coat);cylBetween(T,g,[.2,1.45,0],[.36,.85,0],.09,police?0x244b75:coat);}
  if(police){cylinder(T,g,.25,.2,.13,[0,2.02,0],0x173354);box(T,g,[.38,.08,.08],[0,1.43,-.28],0xe4e6df);}
  g.userData.sceneSubject=true;parent.add(g);return g;
}
function addSeatedPerson(T,parent,{x=0,y=0,z=0,heading=0,coat=0xc78335}={}){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=heading;sphere(T,g,.22,[0,1.25,0],P.skin);cylinder(T,g,.22,.3,.65,[0,.78,0],coat,[0,0,0],14);cylBetween(T,g,[-.16,.55,0],[-.35,.22,-.38],.11,0x29394a);cylBetween(T,g,[.16,.55,0],[.35,.22,-.38],.11,0x29394a);cylBetween(T,g,[-.2,.95,0],[-.48,.4,-.16],.08,coat);cylBetween(T,g,[.2,.95,0],[.48,.4,-.16],.08,coat);g.userData.sceneSubject=true;parent.add(g);return g;}

function canvasTexture(T,draw,size=256){const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');draw(ctx,size);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.anisotropy=4;return tx;}
function addSign(T,parent,{kind='speed',value='50',x=4.9,z=-16,heading=0,temporary=false}={}){
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=heading;
  cylinder(T,g,.055,.055,2.8,[0,1.4,0],0x777b79,[0,0,0],10,{metalness:.65,roughness:.35});
  const tex=canvasTexture(T,(c,s)=>{c.clearRect(0,0,s,s);c.textAlign='center';c.textBaseline='middle';
    if(kind==='motorway'){c.fillStyle='#176a48';c.fillRect(5,35,s-10,s-70);c.strokeStyle='#fff';c.lineWidth=7;c.strokeRect(12,42,s-24,s-84);c.fillStyle='#fff';c.font='bold 27px sans-serif';c.fillText('NÆSTE AFKØRSEL',s/2,102);c.font='bold 48px sans-serif';c.fillText('5 km',s/2,158);}
    else if(kind==='yield'){c.beginPath();c.moveTo(s*.5,s*.88);c.lineTo(s*.12,s*.18);c.lineTo(s*.88,s*.18);c.closePath();c.fillStyle='#fff';c.fill();c.lineWidth=22;c.strokeStyle='#cf272d';c.stroke();}
    else if(kind==='stop'){const pts=8;c.beginPath();for(let i=0;i<pts;i++){const a=Math.PI/8+i*Math.PI/4,x=s/2+Math.cos(a)*s*.39,y=s/2+Math.sin(a)*s*.39;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fillStyle='#bd2630';c.fill();c.lineWidth=8;c.strokeStyle='#fff';c.stroke();c.fillStyle='#fff';c.font='bold 52px sans-serif';c.fillText('STOP',s/2,s/2+4);}
    else if(kind==='island'){c.beginPath();c.arc(s/2,s/2,s*.42,0,Math.PI*2);c.fillStyle='#1765ad';c.fill();c.strokeStyle='#fff';c.lineWidth=7;c.stroke();c.strokeStyle='#fff';c.lineWidth=24;c.lineCap='round';c.beginPath();c.moveTo(s*.68,s*.27);c.lineTo(s*.34,s*.66);c.lineTo(s*.34,s*.48);c.stroke();}
    else if(kind==='play'){c.fillStyle='#1c70b8';c.fillRect(20,20,s-40,s-40);c.strokeStyle='#fff';c.lineWidth=8;c.strokeRect(20,20,s-40,s-40);c.fillStyle='#fff';c.beginPath();c.arc(105,85,18,0,Math.PI*2);c.fill();c.fillRect(94,103,22,60);c.fillRect(58,155,135,18);}
    else if(kind==='cycle'){c.fillStyle='#1c70b8';c.fillRect(16,34,s-32,s-68);c.strokeStyle='#fff';c.lineWidth=7;c.strokeRect(16,34,s-32,s-68);c.strokeStyle='#fff';c.lineWidth=11;for(const xx of [85,172]){c.beginPath();c.arc(xx,150,34,0,Math.PI*2);c.stroke();}c.beginPath();c.moveTo(85,150);c.lineTo(124,100);c.lineTo(172,150);c.lineTo(85,150);c.stroke();}
    else {c.beginPath();c.arc(s/2,s/2,s*.4,0,Math.PI*2);c.fillStyle=temporary?'#ffe95b':'#fff';c.fill();c.lineWidth=19;c.strokeStyle='#d52b32';c.stroke();c.fillStyle='#15191c';c.font='bold 78px sans-serif';c.fillText(value,s/2,s/2+7);}
  });
  const sign=mesh(T,new T.PlaneGeometry(kind==='motorway'?2.3:kind==='stop'?1.15:1.18,kind==='motorway'?1.25:1.18),new T.MeshBasicMaterial({map:tex,transparent:true,side:T.DoubleSide}),0,2.85,0);g.add(sign);g.userData.sceneSubject=true;parent.add(g);return g;
}

function addTrafficLight(T,parent,x,z,state='red',heading=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=heading;cylinder(T,g,.07,.07,4.2,[0,2.1,0],0x303638,[0,0,0],10);box(T,g,[.62,1.55,.38],[0,3.65,0],0x202527,{roughness:.65});['red','yellow','green'].forEach((k,i)=>sphere(T,g,.19,[0,4.1-i*.48,.2],k==='red'?P.red:k==='yellow'?P.yellow:0x3d9a56,[1,1,.3],{material:{emissive:k===state?(k==='red'?P.red:k==='yellow'?P.yellow:0x2ab65d):0x060606,emissiveIntensity:k===state?2.5:.05}}));g.userData.sceneSubject=true;parent.add(g);return g;}

function addCone(T,parent,x,z){const g=new T.Group();g.position.set(x,0,z);cylinder(T,g,.32,.07,.85,[0,.43,0],P.orange,[0,0,0],18);box(T,g,[.8,.08,.8],[0,.04,0],P.black);box(T,g,[.42,.13,.42],[0,.43,0],P.white);g.userData.sceneSubject=true;parent.add(g);return g;}
function addRoadBarrier(T,parent,x,z,heading=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=heading;for(const s of [-1,1]){cylinder(T,g,.06,.08,1.15,[s*1.25,.58,0],0x55585a);box(T,g,[.55,.08,.7],[s*1.25,.05,0],0x444748);}box(T,g,[3.2,.48,.16],[0,.88,0],P.white,{roughness:.75});for(let xx=-1.25;xx<=1.25;xx+=.62)box(T,g,[.28,.5,.18],[xx,.88,-.02],P.red,{rot:[0,0,-.48]});g.userData.sceneSubject=true;parent.add(g);return g;}
function addBall(T,parent,x,z){const b=sphere(T,parent,.28,[x,.29,z],0xe9c434,[1,1,1],{roughness:.6});b.userData.sceneSubject=true;return b;}

function makeCamera(T,view='driver'){
  const c=new T.PerspectiveCamera(view==='overhead'?50:58,16/10,.1,220);c.userData.view=view;
  if(view==='driver'){c.position.set(2,1.58,-14);c.lookAt(2,.3,-29);} else if(view==='rear'){c.position.set(2,5.5,-15);c.lookAt(2,.7,5);} else if(view==='overhead'){c.position.set(14,18,-3);c.lookAt(0,.4,-23);} else if(view==='side'){c.position.set(15,7,-5);c.lookAt(0,1,-23);} else {c.position.set(11,8,-2);c.lookAt(0,1,-24);} return c;
}
function finish(scene,camera,title,viewLabel,facts){
  if(camera.userData.view==='driver') scene.traverse(o=>{if(o.userData?.isEgo)o.visible=false;});
  scene.updateMatrixWorld(true);
  if(camera.userData.view==='overhead'){
    const points=[];scene.traverse(o=>{if(o.userData?.sceneSubject&&o.visible){const p=new camera.position.constructor();o.getWorldPosition(p);points.push(p);}});
    if(points.length){const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minZ=Math.min(...points.map(p=>p.z)),maxZ=Math.max(...points.map(p=>p.z));const cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,span=Math.max(10,maxX-minX+8,maxZ-minZ+9);camera.position.set(cx+span*.5,Math.max(13,span*.68),cz+span*.58);camera.lookAt(cx,.4,cz);}
  }
  if(camera.userData.view==='rear'){
    const points=[];scene.traverse(o=>{if(o.userData?.sceneSubject&&o.visible){const p=new camera.position.constructor();o.getWorldPosition(p);points.push(p);}});
    if(points.length){const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minZ=Math.min(...points.map(p=>p.z)),maxZ=Math.max(...points.map(p=>p.z)),cx=(minX+maxX)/2,span=Math.max(5,maxZ-minZ);camera.position.set(cx,Math.max(4.8,span*.42),minZ-7);camera.lookAt(cx,.7,maxZ+5);}
  }
  camera.updateProjectionMatrix();return {scene,camera,title,viewLabel,...(facts?.length?{facts}: {})};
}

function baseScene(T,{mode='city',weather='clear',road='straight',view='driver',wet=false,signalState='green',title='',label='Førerens udsyn'}={}){
  const scene=new T.Scene();addEnvironment(T,scene,mode,weather);
  if(road==='cross'||road==='signal'||road==='t') for(const child of [...scene.children]) if(child.userData?.isBuilding&&Math.abs(child.position.z+30)<6)scene.remove(child);
  if(road==='straight')straightRoad(T,scene,{wet,lanes:2,country:mode==='country'});else if(road==='four')straightRoad(T,scene,{wet,lanes:4});else if(road==='cross')crossRoad(T,scene,{wet});else if(road==='signal')crossRoad(T,scene,{wet,signal:true,signalState});else if(road==='t')crossRoad(T,scene,{wet,t:true});const camera=makeCamera(T,view);return {scene,camera,title,viewLabel:label};
}

// First production prototype: curb start with a fast, recognizable cyclist approaching from behind.
function scene006(T,q){const b=baseScene(T,{road:'straight',view:'rear',title:'Igangsætning fra kantsten',label:'Skråt bagfra · højre side'});addCar(T,b.scene,{x:3.3,z:-6,heading:0,ego:true,indicator:'left'});addBicycle(T,b.scene,{x:3.25,z:-1.4,heading:0,color:0xa92e35});return finish(b.scene,b.camera,b.title,b.viewLabel,['Cyklisten kommer bagfra','Fri bane bag cyklisten']);}

function addVan(T,parent,o={}){const g=addCar(T,parent,{...o,color:o.color||0xe7e0ce});g.children[0].scale.set(1.08,1.08,1.28);box(T,g,[1.78,1.35,2.1],[0,1.42,.72],o.color||0xe7e0ce,{roughness:.45});box(T,g,[1.58,.62,.08],[0,1.66,-.39],P.darkGlass,{roughness:.18});return g;}
function addAmbulance(T,parent,o={}){const g=addVan(T,parent,{...o,color:0xf1eee4});for(const side of [-1,1])box(T,g,[.18,.1,.6],[side*.62,2.16,.66],0x297ad1,{material:{emissive:0x227bdc,emissiveIntensity:3}});box(T,g,[1.45,.08,.3],[0,1.18,2.39],0xf0ca2e);box(T,g,[.12,.52,.08],[0,1.42,2.44],P.red);box(T,g,[.52,.12,.08],[0,1.42,2.44],P.red);return g;}
function addWall(T,parent,x,z,w=7,h=3,heading=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=heading;for(let yy=.22;yy<h;yy+=.44)for(let xx=-w/2+.35;xx<w/2;xx+=.72){const off=((Math.round(yy/.44)%2)*.34);box(T,g,[.66,.38,.32],[xx+off,yy,0],0x93634f,{roughness:.96});}parent.add(g);return g;}
function addHedge(T,parent,x,z,length=7,heading=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=heading;box(T,g,[length,1.7,.85],[0,.85,0],P.hedge,{roughness:1});for(let xx=-length/2+.5;xx<length/2;xx+=1)sphere(T,g,.65,[xx,1.45,0],0x426e48,[1,.8,.8]);parent.add(g);return g;}
function addPuddle(T,parent,x,z,w=1.6,l=5){const p=mesh(T,new T.PlaneGeometry(w,l),mat(T,0x7999a5,.08,.2,{transparent:true,opacity:.52}),x,.105,z,false,false);p.rotation.x=-Math.PI/2;parent.add(p);return p;}
function addLeaves(T,parent,x,z,count=34){for(let i=0;i<count;i++){const sh=new T.Shape();sh.ellipse(0,0,.08,.16,0,Math.PI*2,false,0);const m=mesh(T,new T.ShapeGeometry(sh),mat(T,i%3===0?0xb26b2d:i%3===1?0xd09b35:0x8b512d,1),x+((i*37)%29)/29*4-2,.115,z+((i*53)%31)/31*8-4,false,true);m.rotation.x=-Math.PI/2;m.rotation.z=i*.8;m.userData.sceneSubject=true;parent.add(m);}}
function addGuardrail(T,parent,x,z,length=65){for(let zz=z-length/2;zz<=z+length/2;zz+=3)cylinder(T,parent,.05,.05,1,[x,.5,zz],0x989c9b);box(T,parent,[.14,.38,length],[x,.82,z],0xadb0af,{metalness:.55,roughness:.4});}
function motorway(T,scene,{wet=false}={}){box(T,scene,[15,.14,130],[0,0,-43],wet?P.asphaltWet:P.asphalt,{roughness:wet?.28:.88,metalness:wet?.08:0,cast:false});solidLine(T,scene,-7.15,-43,128);solidLine(T,scene,3.8,-43,128);solidLine(T,scene,7.15,-43,128);dashedLine(T,scene,-1.7);addGuardrail(T,scene,-8,-43,125);addGuardrail(T,scene,8,-43,125);}
function addRailway(T,parent,z=-31,{barrier=false}={}){for(const dz of [-.58,.58])box(T,parent,[13,.12,.12],[0,.17,z+dz],0x8b8780,{metalness:.65,roughness:.3});for(let x=-6.5;x<6.5;x+=.65)box(T,parent,[.42,.08,1.7],[x,.1,z],0x5b4436,{roughness:.94});if(barrier){for(const x of [-4.9,4.9]){cylinder(T,parent,.08,.08,3.2,[x,1.6,z+2.2],0x55595a);box(T,parent,[.13,.13,3.2],[x,3.1,z+2.2],0xf0ede6,{rot:[0,0,x<0?-.18:.18]});for(let y=1.9;y<4.5;y+=.7)box(T,parent,[.17,.34,.2],[x+(x<0?-.13:.13)*(y-1.8),y,z+2.08],P.red,{rot:[0,0,x<0?-.18:.18]});sphere(T,parent,.18,[x,2.5,z+2.05],0x5d1b1b,[1,1,.3]);}}}
function addTram(T,parent,{x=0,z=-36,heading=Math.PI}={}){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=heading;box(T,g,[2.5,2.8,8],[0,1.6,0],0xd8d8d1,{roughness:.42,metalness:.14});box(T,g,[2.22,1.08,.08],[0,2.1,-4.02],P.darkGlass,{roughness:.12});for(const zz of [-2.5,0,2.5])for(const side of [-1,1])box(T,g,[.08,.9,1.5],[side*1.27,2,zz],P.darkGlass,{roughness:.16});for(const xx of [-.72,.72])sphere(T,g,.16,[xx,1.15,-4.07],0xffedb6,[1,1,.28],{material:{emissive:0xffd57a,emissiveIntensity:3}});for(const zz of [-2.6,2.6])for(const side of [-1,1])cylinder(T,g,.32,.32,.25,[side*.92,.35,zz],P.black,[0,0,Math.PI/2],18);cylBetween(T,g,[-.4,3.1,0],[0,4.2,.5],.04,0x555555);cylBetween(T,g,[.4,3.1,0],[0,4.2,.5],.04,0x555555);g.userData.sceneSubject=true;parent.add(g);return g;}
function addParkingBay(T,parent,x,z,w=2.7,l=5.3){solidLine(T,parent,x-w/2,z,l,P.marking,.08);solidLine(T,parent,x+w/2,z,l,P.marking,.08);box(T,parent,[w,.025,.08],[x,.1,z-l/2],P.marking,{cast:false});}
function addBump(T,parent,z,x=2){const m=mesh(T,new T.CylinderGeometry(.35,.35,7.8,20,1,false,0,Math.PI),mat(T,0x565b5b,.86),x,.12,z);m.rotation.z=Math.PI/2;m.rotation.x=Math.PI/2;parent.add(m);for(let xx=-1.2;xx<=1.2;xx+=.8)box(T,parent,[.38,.03,.7],[x+xx,.45,z],P.white,{rot:[0,0,.25],cast:false});return m;}
function addRoadArrow(T,parent,x,z,dir='left',color=P.yellow){const g=new T.Group();box(T,g,[.16,.02,3],[0,.1,0],color,{cast:false});const sh=new T.Shape();sh.moveTo(-.75,.7);sh.lineTo(0,-.65);sh.lineTo(.75,.7);sh.lineTo(.28,.7);sh.lineTo(0,.15);sh.lineTo(-.28,.7);sh.closePath();const a=mesh(T,new T.ShapeGeometry(sh),mat(T,color,.9),0,.115,-1.65,false,true);a.rotation.x=-Math.PI/2;g.add(a);g.position.set(x,0,z);g.rotation.y=dir==='left'?-Math.PI/4:dir==='right'?Math.PI/4:0;parent.add(g);return g;}

function scene002(T){const b=baseScene(T,{view:'overhead',title:'Midlertidig hastighed ved vejarbejde',label:'Skråt ovenfra · passeret tavle'});addCar(T,b.scene,{x:2,z:-10,ego:true});addSign(T,b.scene,{kind:'speed',value:'50',x:4.8,z:-4,temporary:true});for(let i=0;i<6;i++)addCone(T,b.scene,3.6-i*.35,-21-i*3);return finish(b.scene,b.camera,b.title,b.viewLabel,['Klart vejr','Midlertidig 50-tavle er passeret']);}
function scene007(T){const scene=new T.Scene();addEnvironment(T,scene,'country','clear');box(T,scene,[25,.16,48],[0,0,-16],P.asphalt,{cast:false});for(let i=0;i<8;i++)addCone(T,scene,4-Math.sin(i*.45)*5,-2-i*4.2);addCar(T,scene,{x:1.8,z:-7,heading:-.32,ego:true});const camera=makeCamera(T,'overhead');camera.position.set(16,20,11);camera.lookAt(0,0,-16);return finish(scene,camera,'Skarpt sving på lukket øvelsesplads','Skråt ovenfra · øvelsesplads',['Lukket øvelsesplads','Kegle ved bilens højre hjørne']);}
function scene008(T){const b=baseScene(T,{view:'side',title:'Bakning over fortov ved hæk',label:'Skråt fra siden · indkørsel'});box(T,b.scene,[5,.14,15],[7.2,.02,-8],P.asphalt,{cast:false});addHedge(T,b.scene,8.9,-7,8,Math.PI/2);const car=addCar(T,b.scene,{x:7,z:-5,heading:Math.PI,ego:true});addPerson(T,b.scene,{x:5.2,z:-11,child:true,coat:P.yellow});return finish(b.scene,b.camera,b.title,b.viewLabel,['Barn ved hækken','Bilen bakker over fortovet']);}
function scene009(T){const b=baseScene(T,{view:'rear',title:'Bildør mod cykelsti',label:'Skråt bagfra · cykelsti'});solidLine(T,b.scene,3.8,-38,116);addCar(T,b.scene,{x:3.15,z:-8,ego:true,openDoor:'right'});addBicycle(T,b.scene,{x:4.35,z:-2.8,heading:0});return finish(b.scene,b.camera,b.title,b.viewLabel,['Passagerdør åbner mod cykelstien','Cyklisten nærmer sig bagfra']);}
function scene010(T){const scene=new T.Scene();addEnvironment(T,scene,'country','clear');motorway(T,scene);addCar(T,scene,{x:1,z:-2,ego:true});addSign(T,scene,{kind:'motorway',x:6.1,z:-24});const camera=makeCamera(T,'driver');return finish(scene,camera,'Misset afkørsel på motorvej','Førerens udsyn',['Næste afkørsel er fem kilometer væk','Nødsporet er tomt']);}
function scene011(T){const b=baseScene(T,{road:'four',view:'overhead',title:'Motorcykel i venstre blinde vinkel',label:'Skråt ovenfra · vognbaner'});addCar(T,b.scene,{x:2,z:-5,ego:true,indicator:'left'});addMotorcycle(T,b.scene,{x:-1.25,z:-1.5,heading:0,light:false});return finish(b.scene,b.camera,b.title,b.viewLabel,['Spejlene viser fri bane','Motorcykel kan ligge i venstre blinde vinkel']);}
function scene012(T){const b=baseScene(T,{road:'cross',view:'overhead',title:'Lang lastbil ved snævert højresving',label:'Skråt ovenfra · hjørnet'});addTruck(T,b.scene,{x:1,z:-24,heading:-.28,indicator:'right'});addCar(T,b.scene,{x:2,z:-4,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Lastbilen ligger lidt mod venstre','Lastbilen blinker til højre']);}
function scene013(T){const b=baseScene(T,{mode:'country',weather:'night',title:'Ét modkørende lys i mørket'});addCar(T,b.scene,{x:2,z:-3,ego:true,lights:true});addCar(T,b.scene,{x:2,z:-23,color:0x86725f});addMotorcycle(T,b.scene,{x:-2,z:-48,heading:Math.PI,light:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Langsom bil foran','Ét modkørende motorcykellys langt fremme']);}
function scene014(T){const b=baseScene(T,{road:'cross',view:'overhead',title:'Elcyklist før højresving',label:'Skråt ovenfra · cyklist bag bilen'});solidLine(T,b.scene,3.8,-24,38);addCar(T,b.scene,{x:2,z:-24,ego:true,indicator:'right'});addBicycle(T,b.scene,{x:4.25,z:-19,heading:0,color:0x2b7891});return finish(b.scene,b.camera,b.title,b.viewLabel,['Hurtig elcyklist kommer bagfra','Bilen vil dreje til højre']);}
function scene016(T){const b=baseScene(T,{title:'Bold mellem parkerede biler'});addCar(T,b.scene,{x:-2.8,z:-19,color:0xa85a46});addCar(T,b.scene,{x:-2.8,z:-26,color:0x5a6f83});addBall(T,b.scene,-1.1,-22.8);addCar(T,b.scene,{x:2,z:-2,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bolden triller ud mellem parkerede biler','Personen bag bilerne kan ikke ses']);}
function scene020(T){const b=baseScene(T,{mode:'country',weather:'rain',wet:true,view:'rear',title:'Tæt bagvedkørende på våd landevej',label:'Skråt bagfra · landevej'});addCar(T,b.scene,{x:2,z:-10,ego:true,lights:true});addCar(T,b.scene,{x:2,z:-4.8,color:0xa9443d,lights:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Smal våd landevej','Bilisten bagved ligger tæt']);}
function scene021(T){const b=baseScene(T,{mode:'country',weather:'frost',title:'Skyggefuld bro i frostvejr'});for(const s of [-1,1]){addGuardrail(T,b.scene,s*4.2,-32,25);box(T,b.scene,[.7,4,25],[s*5.1,-1.8,-32],0x84817a);}addCar(T,b.scene,{x:2,z:-3,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Det fryser','Broen ligger i skygge','Sving efter broen']);}
function scene022(T){const b=baseScene(T,{weather:'rain',wet:true,title:'Tæt regn og kort sigt'});addCar(T,b.scene,{x:2,z:-3,ego:true,lights:true});addCar(T,b.scene,{x:2,z:-20,color:0x77624e,lights:true});addCar(T,b.scene,{x:-2,z:-34,heading:Math.PI,color:0x506171,lights:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Tæt dagsregn','Kort sigt','Trafikken bevæger sig langsommere']);}
function scene023(T){const b=baseScene(T,{mode:'country',view:'side',title:'Traktor før skjult bakketop',label:'Skråt fra siden · vejprofil'});const hill=mesh(T,new T.SphereGeometry(45,48,16,0,Math.PI*2,0,Math.PI*.34),mat(T,P.asphalt,.88),0,-13,-59);hill.scale.set(.25,1,.7);b.scene.add(hill);addTractor(T,b.scene,{x:2,z:-17});addCar(T,b.scene,{x:2,z:-6,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Traktor foran','Bakketoppen skjuler vejforløbet']);}
function scene024(T){const b=baseScene(T,{title:'Skole med skjult fortov'});addWall(T,b.scene,-8,-28,9,3,Math.PI/2);for(const z of [-15,-22,-29])addCar(T,b.scene,{x:-3,z,color:z===-22?0xb14b42:0x566f78,openDoor:z===-22});addPerson(T,b.scene,{x:-5.1,z:-23,coat:0xc49a31});addPerson(T,b.scene,{x:-4.5,z:-26,child:true,coat:0xd24a43});addCar(T,b.scene,{x:2,z:-2,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Parkerede biler skjuler fortovet','Forælder står ved åben bildør']);}
function scene025(T){const b=baseScene(T,{view:'overhead',title:'Jernbaneoverkørsel med kø',label:'Skråt ovenfra · spor og kø'});addRailway(T,b.scene,-31,{barrier:true});for(const z of [-38,-45,-52])addCar(T,b.scene,{x:2,z,color:0x856252});addCar(T,b.scene,{x:2,z:-20,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bommen er oppe','Der er ikke plads til hele bilen efter sporet']);}
function scene026(T){const b=baseScene(T,{road:'signal',title:'Politiets stoptegn ved grønt lys'});addPerson(T,b.scene,{x:1,z:-27,heading:Math.PI,police:true,arm:'stop'});addCar(T,b.scene,{x:2,z:-5,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Lyset viser grønt','Politibetjenten viser tydeligt stop']);}
function scene027(T){const b=baseScene(T,{road:'signal',title:'Grønt lys og blokeret kryds'});for(let x=-3;x<9;x+=3.3)addCar(T,b.scene,{x,z:-31,heading:Math.PI/2,color:x%2?0x975348:0x566f7c});addCar(T,b.scene,{x:2,z:-5,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Lyset viser grønt','Køen fylder krydset']);}
function scene028(T){const b=baseScene(T,{road:'t',view:'overhead',title:'Blinklys uden bekræftet bevægelse',label:'Skråt ovenfra · sidevej'});addCar(T,b.scene,{x:8,z:-31,heading:Math.PI/2,color:0x9b4a42,indicator:'right'});addCar(T,b.scene,{x:2,z:-4,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bilen holder stille ved sidevejen','Højre blinklys er tændt']);}
function scene029(T){const b=baseScene(T,{road:'signal',signalState:'red',view:'overhead',title:'Ambulance bagfra ved rødt',label:'Skråt ovenfra · hele konfliktrummet'});addCar(T,b.scene,{x:2,z:-20,ego:true});addAmbulance(T,b.scene,{x:2,z:-9,heading:0});zebra(T,b.scene,-29);addPerson(T,b.scene,{x:-1,z:-29,heading:Math.PI/2});addPerson(T,b.scene,{x:1,z:-29,heading:Math.PI/2,coat:0x4c718a});return finish(b.scene,b.camera,b.title,b.viewLabel,['Rødt lys','Ambulance med blå blink og sirene bagfra','Fodgængere i krydset']);}
function scene030(T){const b=baseScene(T,{mode:'country',weather:'night',view:'side',title:'Frisk uheld på mørk landevej',label:'Skråt fra siden · uheldssted'});box(T,b.scene,[2.6,.18,34],[6.1,-.22,-27],0x294f38,{roughness:1,cast:false});box(T,b.scene,[1.2,.2,34],[4.9,-.05,-27],0x486d43,{rot:[0,0,-.22],cast:false});addCar(T,b.scene,{x:1.2,z:-25,heading:.32,color:0x8d493f,lights:true});addSeatedPerson(T,b.scene,{x:6.1,y:-.18,z:-27});addCone(T,b.scene,1.8,-17);addCone(T,b.scene,-.8,-19);addCar(T,b.scene,{x:2,z:-4,ego:true,lights:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bil står delvist på kørebanen','Person sidder i grøften']);}
function scene031(T){const b=baseScene(T,{view:'overhead',title:'Udkørsel fra tankstation',label:'Skråt ovenfra · fortov og cykelsti'});box(T,b.scene,[8,.14,18],[8,.02,-12],P.asphalt,{cast:false});solidLine(T,b.scene,4.2,-38,116);addCar(T,b.scene,{x:7,z:-12,heading:Math.PI/2,ego:true});addCar(T,b.scene,{x:2,z:-3,heading:0,color:0x6f5549});addBicycle(T,b.scene,{x:4.2,z:-21,heading:Math.PI});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bilen kommer fra tankstation','Udkørsel krydser fortov og cykelsti','Bil fra venstre og cyklist fra højre']);}
function scene032(T){const b=baseScene(T,{road:'cross',title:'STOP ved tomt kryds'});addSign(T,b.scene,{kind:'stop',x:4.9,z:-24});box(T,b.scene,[3.6,.03,.16],[2,.11,-25.2],P.marking,{cast:false});addCar(T,b.scene,{x:2,z:-8,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Tydelig stoplinje','Frit udsyn','Ingen anden trafik']);}
function scene033(T){const b=baseScene(T,{road:'cross',view:'overhead',title:'Ureguleret kryds · bil fra højre',label:'Skråt ovenfra · højre vigepligt'});addCar(T,b.scene,{x:2,z:-8,ego:true});addCar(T,b.scene,{x:10,z:-31,heading:Math.PI/2,color:0x9d4d43});return finish(b.scene,b.camera,b.title,b.viewLabel,['Ingen signaler, tavler eller hajtænder','Bil kommer fra højre']);}
function scene034(T){const b=baseScene(T,{road:'cross',view:'overhead',title:'Højresving over cykelsti',label:'Skråt ovenfra · højre side'});solidLine(T,b.scene,3.8,-24,38);addCar(T,b.scene,{x:2,z:-23,ego:true,indicator:'right'});addBicycle(T,b.scene,{x:4.15,z:-23,heading:0});return finish(b.scene,b.camera,b.title,b.viewLabel,['Cyklisten fortsætter ligeud ved siden af bilen','Bilen vil dreje til højre']);}
function scene035(T){const scene=new T.Scene();addEnvironment(T,scene,'city','clear');const ring=mesh(T,new T.RingGeometry(5.5,10,56),mat(T,P.asphalt,.88),0,.04,-26);ring.rotation.x=-Math.PI/2;scene.add(ring);cylinder(T,scene,5.4,5.4,.25,[0,.08,-26],P.grass);box(T,scene,[24,.14,7],[9,.01,-26],P.asphalt,{cast:false});zebra(T,scene,-26,10,Math.PI/2);addCar(T,scene,{x:4.5,z:-22.5,heading:-1.05,ego:true,indicator:'right'});addBicycle(T,scene,{x:5.8,z:-30,heading:-.8});addPerson(T,scene,{x:10,z:-23,heading:0});const camera=makeCamera(T,'overhead');return finish(scene,camera,'Udkørsel fra rundkørsel','Skråt ovenfra · udkørsel',['Gående på vej ud i fodgængerfeltet','Cyklist fortsætter langs rundkørslen']);}
function scene036(T){const b=baseScene(T,{mode:'country',weather:'rain',wet:true,title:'80-zone i kraftig regn'});addSign(T,b.scene,{kind:'speed',value:'80',x:4.9,z:-23});addPuddle(T,b.scene,2,-27,1.3,8);addPuddle(T,b.scene,-2,-39,1.1,7);addCar(T,b.scene,{x:2,z:-2,ego:true,lights:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Tavlen viser 80','Kraftig regn og kort sigt','Vand i hjulsporene']);}
function scene037(T){const b=baseScene(T,{road:'four',view:'overhead',title:'Vognbaneskift med bil til venstre',label:'Skråt ovenfra · fire vognbaner'});addCar(T,b.scene,{x:2,z:-5,ego:true,indicator:'left'});addCar(T,b.scene,{x:-1.5,z:-1.5,color:0xa54d42});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bil lidt bagved i venstre vognbane','Ingen sammenfletning eller ophørende striber']);}
function scene038(T){const b=baseScene(T,{mode:'city',view:'overhead',title:'Indsnævring ved parkeret varebil',label:'Skråt ovenfra · smal vej'});addVan(T,b.scene,{x:2.8,z:-20,color:0xe3dfd2});addCar(T,b.scene,{x:-2,z:-27,heading:Math.PI,color:0x9f4a41});addCar(T,b.scene,{x:2,z:-5,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Varebil spærrer egen side','Modkørende er tæt på indsnævringen']);}
function scene039(T){const b=baseScene(T,{mode:'country',view:'rear',title:'Bagvedkørende har trukket ud',label:'Skråt bagfra · landevej'});addCar(T,b.scene,{x:2,z:-15,ego:true,indicator:'left'});addCar(T,b.scene,{x:-2,z:-8,color:0xa14d43});return finish(b.scene,b.camera,b.title,b.viewLabel,['Frit udsyn fremad','Bil bagfra er allerede i venstre bane']);}
function scene040(T){const scene=new T.Scene();addEnvironment(T,scene,'country','clear');motorway(T,scene);const ego=addCar(T,scene,{x:5.4,z:-17,ego:true,indicator:'right'});ego.children.filter(c=>c.geometry?.type==='CylinderGeometry')[2]?.scale.set(.65,.65,.65);const camera=makeCamera(T,'overhead');camera.position.set(18,18,12);camera.lookAt(1,0,-24);return finish(scene,camera,'Punktering på motorvej','Skråt ovenfra · nødspor',['Bilen kan styres ud i nødsporet','Frakørslen er langt væk']);}
function scene042(T){const b=baseScene(T,{mode:'country',view:'overhead',title:'Uoverskueligt sving forude',label:'Skråt ovenfra · kurve'});const curve=mesh(T,new T.TorusGeometry(23,4,8,48,Math.PI*.55),mat(T,P.asphalt,.88),0,.04,-35);curve.rotation.x=-Math.PI/2;curve.rotation.z=.2;curve.userData.sceneSubject=true;b.scene.add(curve);for(let i=0;i<7;i++)addTree(T,b.scene,-5-i*.4,-23-i*4,.9);addCar(T,b.scene,{x:2,z:-5,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bilen er stadig på den lige strækning','Vejforløbet i svinget kan ikke ses']);}
function scene043(T){const b=baseScene(T,{mode:'country',weather:'rain',wet:true,title:'Kø opdaget tidligt på våd vej'});for(const z of [-33,-40,-47])addCar(T,b.scene,{x:2,z,color:0x76584e,lights:true});addCar(T,b.scene,{x:2,z:-2,ego:true,lights:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Våd vej','Kø langt fremme','God afstand']);}
function scene044(T){const b=baseScene(T,{mode:'country',view:'overhead',title:'Løse blade i skarpt sving',label:'Skråt ovenfra · svinget'});addLeaves(T,b.scene,1.4,-27,52);addCar(T,b.scene,{x:2,z:-4,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Løse blade i svinget','Bladene kan ses i god tid','Fri bane bag bilen']);}
function scene051(T){const b=baseScene(T,{road:'cross',view:'overhead',title:'Parkering seks meter fra kryds',label:'Skråt ovenfra · afstand til tværvej'});addCar(T,b.scene,{x:3.15,z:-22,color:0x486d7b});addCar(T,b.scene,{x:2,z:-4,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bilen holder 6 m fra tværgående kørebane','Ingen parkeringsbås eller særregel']);}
function scene052(T){const b=baseScene(T,{view:'overhead',title:'Standsning tre meter før fodgængerfelt',label:'Skråt ovenfra · fodgængerfelt'});zebra(T,b.scene,-28);addCar(T,b.scene,{x:3.1,z:-23,color:0x4f6d7a});addPerson(T,b.scene,{x:-5,z:-28,heading:Math.PI/2});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bilen vil standse 3 m før feltet','Voksen passager skal sættes af','Ingen særlig tilladelse']);}
function scene056(T){const b=baseScene(T,{view:'side',title:'Bil på fortov og cykelsti',label:'Skråt fra siden · højre kant'});solidLine(T,b.scene,3.8,-38,116);const car=addCar(T,b.scene,{x:4.25,z:-17,color:0x586f78});car.rotation.z=-.08;return finish(b.scene,b.camera,b.title,b.viewLabel,['Højre hjul står på fortovet','Bilen står delvist på cykelstien','Ingen bås eller tilladende tavle']);}
function scene058(T){const b=baseScene(T,{road:'cross',title:'B 11 ved overskueligt kryds'});addSign(T,b.scene,{kind:'yield',x:4.9,z:-24});yieldTeeth(T,b.scene,-25.2,2);addCar(T,b.scene,{x:2,z:-7,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['B 11 og hajtænder','Krydset er overskueligt','Ingen trafik på den anden vej']);}
function scene059(T){const b=baseScene(T,{road:'cross',title:'B 13 Stop med godt udsyn'});addSign(T,b.scene,{kind:'stop',x:4.9,z:-24});box(T,b.scene,[3.6,.03,.16],[2,.11,-25.2],P.marking,{cast:false});addCar(T,b.scene,{x:2,z:-7,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['B 13 og stoplinje','Krydset ser tomt ud','Godt udsyn fra linjen']);}
function scene060(T){const b=baseScene(T,{mode:'country',weather:'rain',wet:true,title:'C 55 med 60 i regn'});addSign(T,b.scene,{kind:'speed',value:'60',x:4.9,z:-23});addCar(T,b.scene,{x:2,z:-2,ego:true,lights:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['C 55 viser 60','Våd vej','Kortere sigt end normalt']);}
function scene061(T){const b=baseScene(T,{view:'overhead',title:'Påbudt passage venstre om helle',label:'Skråt ovenfra · helle'});box(T,b.scene,[1.3,.28,4],[1.8,.15,-25],P.kerb,{roughness:.94});cylinder(T,b.scene,.65,.65,.28,[1.8,.15,-23],P.kerb);cylinder(T,b.scene,.65,.65,.28,[1.8,.15,-27],P.kerb);addSign(T,b.scene,{kind:'island',x:1.8,z:-22.8});addCar(T,b.scene,{x:2,z:-4,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['D 15-pil peger skråt ned mod venstre','Kørebanen til venstre er åben']);}
function scene062(T){const b=baseScene(T,{view:'overhead',title:'Gule linjer ved vejarbejde',label:'Skråt ovenfra · midlertidig linjeføring'});for(let i=0;i<8;i++)box(T,b.scene,[.13,.025,3],[1.7-i*.34,.11,-12-i*5],P.yellow,{rot:[0,-.13,0],cast:false});addRoadArrow(T,b.scene,2,-25,'straight',P.marking);for(let i=0;i<5;i++)addCone(T,b.scene,2.8+i*.45,-28-i*3);addRoadBarrier(T,b.scene,3.1,-39,.05);addRoadBarrier(T,b.scene,3.1,-43,-.04);addPerson(T,b.scene,{x:4.7,z:-42,coat:P.orange});addCar(T,b.scene,{x:2,z:-3,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Gule linjer leder mod venstre','Gamle hvide linjer fortsætter mod afspærring','Vejarbejder i området']);}
function scene063(T){const b=baseScene(T,{weather:'rain',wet:true,view:'rear',title:'Dagsregn med slukkede baglygter',label:'Skråt bagfra · bilens lys'});const ego=addCar(T,b.scene,{x:2,z:-11,ego:true,lights:true});for(const child of ego.children){if(child.material?.color?.getHex()===0xa52323){child.material.emissive?.setHex(0);child.material.emissiveIntensity=0;}}addCar(T,b.scene,{x:2,z:-3,color:0x6d594a,lights:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Kraftig regn om dagen','Kørelys foran er tændt','Baglygterne er slukket']);}
function scene064(T){const b=baseScene(T,{road:'cross',view:'overhead',title:'STOP-linje før skjult udsyn',label:'Skråt ovenfra · mur ved hjørnet'});addSign(T,b.scene,{kind:'stop',x:4.9,z:-24});box(T,b.scene,[3.6,.03,.16],[2,.11,-25.2],P.marking,{cast:false});addWall(T,b.scene,5.2,-30,9,3.6,Math.PI/2);addCar(T,b.scene,{x:2,z:-23,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bilen er standset ved stoplinjen','Muren spærrer udsynet fra linjen']);}
function scene065(T){const b=baseScene(T,{road:'cross',view:'overhead',title:'Cyklist fra højre ved hajtænder',label:'Skråt ovenfra · kryds'});yieldTeeth(T,b.scene,-25.2,2);addBicycle(T,b.scene,{x:10,z:-31,heading:Math.PI/2});addCar(T,b.scene,{x:2,z:-8,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Hajtænder foran bilen','Cyklisten kommer fra højre og fortsætter ligeud']);}
function scene066(T){const b=baseScene(T,{road:'cross',view:'overhead',title:'Cyklist når op langs højre side',label:'Skråt ovenfra · lige før højresving'});solidLine(T,b.scene,3.8,-24,38);addCar(T,b.scene,{x:2,z:-23,ego:true,indicator:'right'});addBicycle(T,b.scene,{x:4.1,z:-22,heading:0});return finish(b.scene,b.camera,b.title,b.viewLabel,['Cyklisten var bag bilen ved første spejlkig','Cyklisten er nu langs højre side']);}
function scene067(T){const b=baseScene(T,{road:'t',view:'overhead',title:'Ureguleret T-kryds fra højre',label:'Skråt ovenfra · T-kryds'});addCar(T,b.scene,{x:2,z:-8,ego:true});addCar(T,b.scene,{x:10,z:-31,heading:Math.PI/2,color:0x9b4b42});return finish(b.scene,b.camera,b.title,b.viewLabel,['Lige så lille vej munder ud fra højre','Ingen tavler, hajtænder eller særlig udformning']);}
function scene068(T){const b=baseScene(T,{title:'Gående ved ureguleret fodgængerfelt'});zebra(T,b.scene,-27);addPerson(T,b.scene,{x:4.5,z:-27,heading:-Math.PI/2,coat:0xb64d46});addCar(T,b.scene,{x:2,z:-5,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Ureguleret fodgængerfelt','Gående er tydeligt på vej ud']);}
function scene071(T){const b=baseScene(T,{mode:'country',view:'overhead',title:'Privat gårdudkørsel over fortov',label:'Skråt ovenfra · gårdudkørsel'});box(T,b.scene,[8,.14,18],[8,.02,-16],0x85745f,{cast:false});addCar(T,b.scene,{x:8,z:-16,heading:Math.PI/2,ego:true});addCar(T,b.scene,{x:2,z:-7,heading:0,color:0x85604d});addBicycle(T,b.scene,{x:3.5,z:-25,heading:Math.PI});return finish(b.scene,b.camera,b.title,b.viewLabel,['Bilen kommer fra privat gård','Udkørsel krydser fortov','Cyklist og bil nærmer sig']);}
function scene072(T){const scene=new T.Scene();addEnvironment(T,scene,'country','clear');box(T,scene,[22,.14,45],[0,0,-18],P.asphalt,{cast:false});for(let z=-12;z>-35;z-=7)addParkingBay(T,scene,5,z);addCar(T,scene,{x:1,z:-3,ego:true,indicator:'right'});for(let i=0;i<5;i++)addCone(T,scene,-8+i*4.2,-40);const camera=makeCamera(T,'overhead');return finish(scene,camera,'Forlæns parkering på lukket plads','Skråt ovenfra · afmærket område',['Lukket øvelsesplads','God plads til første øvelse','Kørelærer ved siden af']);}
function scene073(T){const scene=new T.Scene();addEnvironment(T,scene,'country','clear');box(T,scene,[18,.14,45],[0,0,-18],P.asphalt,{cast:false});box(T,scene,[.25,.24,45],[5.2,.12,-18],P.kerb);addCar(T,scene,{x:3.85,z:-18,ego:true});const camera=makeCamera(T,'overhead');camera.position.set(14,18,6);camera.lookAt(2.8,0,-18);return finish(scene,camera,'Parallel bil 30 cm fra højre kant','Skråt ovenfra · slutstilling',['Bilen står parallelt','Højre hjul er 30 cm fra kanten']);}
function scene074(T){const b=baseScene(T,{title:'Opholds- og legeområde'});addSign(T,b.scene,{kind:'play',x:4.9,z:-13});addPerson(T,b.scene,{x:1,z:-25,child:true,coat:0xd1a22f});addBall(T,b.scene,2.2,-24.2);addCar(T,b.scene,{x:2,z:-3,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['E 51 ved indkørslen','Barn leger på kørearealet','Ingen afmærkede parkeringspladser']);}
function scene075(T){const b=baseScene(T,{title:'Cykelgade med cyklister og bump'});addSign(T,b.scene,{kind:'cycle',x:4.9,z:-13});addBicycle(T,b.scene,{x:1.3,z:-21,heading:0,color:0x9d383d});addBicycle(T,b.scene,{x:2.8,z:-21.4,heading:0,color:0x356f86});addBump(T,b.scene,-32);addCar(T,b.scene,{x:2,z:-4,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Skiltet cykelgade','To cyklister kører side om side','Bump længere fremme']);}
function scene076(T){const b=baseScene(T,{road:'signal',view:'overhead',title:'Venstresving med modkørende motorcykel',label:'Skråt ovenfra · signalreguleret kryds'});addCar(T,b.scene,{x:2,z:-18,ego:true,indicator:'left'});addCar(T,b.scene,{x:1.4,z:-26,color:0x6a554b});addMotorcycle(T,b.scene,{x:-2,z:-39,heading:Math.PI,light:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Grønt lys uden grøn venstrepil','Modkørende motorcykel fortsætter ligeud','Bil foran spærrer noget af udsynet']);}
function scene077(T){const b=baseScene(T,{road:'cross',view:'overhead',title:'Venstresving over dobbeltrettet cykelsti',label:'Skråt ovenfra · gående og cykelsti'});solidLine(T,b.scene,4.5,-31,18);solidLine(T,b.scene,6,-31,18);zebra(T,b.scene,-31,9,Math.PI/2);addCar(T,b.scene,{x:1,z:-24,heading:-.7,ego:true,indicator:'left'});addPerson(T,b.scene,{x:9,z:-30,heading:Math.PI/2});addBicycle(T,b.scene,{x:9,z:-33,heading:Math.PI/2});return finish(b.scene,b.camera,b.title,b.viewLabel,['Modkørende er passeret','Gående krydser vejen','Cyklist kommer fra højre på dobbeltrettet cykelsti']);}
function scene078(T){const b=baseScene(T,{road:'signal',signalState:'red',view:'overhead',title:'Rødt signal ved letbanespor',label:'Skråt ovenfra · spor og signal'});addRailway(T,b.scene,-31);addTram(T,b.scene,{x:-8,z:-31,heading:-Math.PI/2});addCar(T,b.scene,{x:2,z:-8,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Rødt signal for bilen','Letbanetog nærmer sig','Plads på den anden side']);}
function scene081(T){const b=baseScene(T,{road:'four',view:'overhead',title:'Sen GPS-manøvre i tæt trafik',label:'Skråt ovenfra · fire vognbaner'});addCar(T,b.scene,{x:2,z:-5,ego:true,indicator:'left'});for(const p of [[-1.5,-3],[-1.5,-12],[2,-16],[-1.5,-23]])addCar(T,b.scene,{x:p[0],z:p[1],color:0x72584d});return finish(b.scene,b.camera,b.title,b.viewLabel,['GPS foreslår sent vognbaneskift','Tæt trafik gør manøvren usikker']);}
function scene082(T){const scene=new T.Scene();addEnvironment(T,scene,'country','clear');roadPlane(T,scene,{width:8,length:85,z:-27});box(T,scene,[.45,.8,85],[4.25,.33,-27],0x8d8a82,{roughness:.95});const ego=addCar(T,scene,{x:3.85,z:-9,ego:true});ego.rotation.z=-.11;for(let i=0;i<7;i++)addCone(T,scene,-3.3+i,10);const camera=makeCamera(T,'side');camera.position.set(15,6,2);camera.lookAt(2,0,-13);return finish(scene,camera,'Højre hjul langs høj vejkant','Skråt fra siden · køreteknisk anlæg',['Godkendt køreteknisk anlæg','Højre hjul er over høj kant','Farten er stadig for høj']);}
function scene083(T){const b=baseScene(T,{mode:'country',view:'side',title:'Tom offentlig vej med høj rabatkant',label:'Skråt fra siden · landevejskant'});box(T,b.scene,[.5,.78,112],[4.25,.34,-38],0x8c8980,{roughness:.96});addCar(T,b.scene,{x:2,z:-8,ego:true});return finish(b.scene,b.camera,b.title,b.viewLabel,['Offentlig landevej','Høj rabatkant','Ingen kørelærer eller afspærring']);}

const BUILDERS = Object.freeze({
  'q-002':scene002,'q-006':scene006,'q-007':scene007,'q-008':scene008,'q-009':scene009,'q-010':scene010,
  'q-011':scene011,'q-012':scene012,'q-013':scene013,'q-014':scene014,'q-016':scene016,'q-020':scene020,
  'q-021':scene021,'q-022':scene022,'q-023':scene023,'q-024':scene024,'q-025':scene025,'q-026':scene026,
  'q-027':scene027,'q-028':scene028,'q-029':scene029,'q-030':scene030,'q-031':scene031,'q-032':scene032,
  'q-033':scene033,'q-034':scene034,'q-035':scene035,'q-036':scene036,'q-037':scene037,'q-038':scene038,
  'q-039':scene039,'q-040':scene040,'q-042':scene042,'q-043':scene043,'q-044':scene044,'q-051':scene051,
  'q-052':scene052,'q-056':scene056,'q-058':scene058,'q-059':scene059,'q-060':scene060,'q-061':scene061,
  'q-062':scene062,'q-063':scene063,'q-064':scene064,'q-065':scene065,'q-066':scene066,'q-067':scene067,
  'q-068':scene068,'q-071':scene071,'q-072':scene072,'q-073':scene073,'q-074':scene074,'q-075':scene075,
  'q-076':scene076,'q-077':scene077,'q-078':scene078,'q-081':scene081,'q-082':scene082,'q-083':scene083,
});

export function buildTrafficScene(T,q){
  if(!T || !q || !TRAFFIC_SCENE_IDS.includes(q.id)) return null;
  const build=BUILDERS[q.id]; return build ? build(T,q) : null;
}

