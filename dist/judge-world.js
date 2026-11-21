import {createStreetKit, PEOPLE_CSE} from './street-kit.js';
import {loadApprovedFleet} from './approved-fleet.js';
import {createSeatedOccupants} from './seated-occupants.js';
import {loadApprovedCyclist} from './approved-cyclist-card.js';
import {attachCylindricalBillboard} from './cylindrical-billboard.js';
// Three.js scene and motion controller for the playable driving-instructor mode.
// UI flow and case copy remain in judge.js.
import {getDaylight} from './daylight-cycle.js';

export function createJudgeWorld(canvas, fallback, initialMotion=true, initialCase) {
  const T = window.THREE;
  if (!T) {
    fallback.hidden = false;
    fallback.textContent = 'Vi kunne ikke vise 3D-scenen lige nu. Teksten og knapperne virker stadig.';
    return { setCase(c){ fallback.textContent=c.setup; }, replay(){}, replayCorrected(){}, snapshot(){return '';}, place(){return 0;}, bindHotspots(){}, clearHotspots(){}, setMotion(){}, dispose(){} };
  }
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias:true, alpha:false, powerPreference:'low-power', preserveDrawingBuffer:true });
  } catch {
    fallback.hidden = false;
    fallback.textContent = 'Vi kunne ikke vise 3D-scenen her. Teksten og knapperne virker stadig.';
    return { setCase(c){ fallback.textContent=c.setup; }, replay(){}, replayCorrected(){}, snapshot(){return '';}, place(){return 0;}, bindHotspots(){}, clearHotspots(){}, setMotion(){}, dispose(){} };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .83;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.background = new T.Color(0x203946);
  const camera = new T.OrthographicCamera(-11.8,11.8,6.65,-6.65,.1,80);
  camera.position.set(9,19,12);
  camera.lookAt(0,0,0);
  const ambient=new T.HemisphereLight(0xb7d5df,0x53635d,.72);scene.add(ambient);
  const sun=new T.DirectionalLight(0xb5cfe0,.64);sun.position.set(-8,18,10);sun.castShadow=true;
  sun.shadow.mapSize.set(512,512);sun.shadow.camera.left=-24;sun.shadow.camera.right=24;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;
  sun.shadow.camera.near=.5;sun.shadow.camera.far=65;sun.shadow.bias=-.0002;scene.add(sun);
  const litWindows=[],streetLights=[];

  const mats = new Set(), geos = new Set(), textures = new Set(), pedestrianNightFill = new Set();
  const mat = (color,extra={}) => { const m=new T.MeshStandardMaterial({color,roughness:.72,metalness:.04,...extra}); mats.add(m); return m; };
  const glow = color => { const m=new T.MeshBasicMaterial({color,toneMapped:false}); mats.add(m); return m; };
  const add = (mesh,x=0,y=0,z=0,parent=scene) => { mesh.position.set(x,y,z); parent.add(mesh); return mesh; };
  const box = (w,h,d,color,x=0,y=0,z=0,parent=scene,extra={}) => { const g=new T.BoxGeometry(w,h,d); geos.add(g); return add(new T.Mesh(g,typeof color==='number'?mat(color,extra):color),x,y,z,parent); };
  const plane = (w,d,color,x=0,z=0,y=.01,parent=scene) => {
    const g=new T.PlaneGeometry(w,d);geos.add(g);const mesh=new T.Mesh(g,typeof color==='number'?mat(color):color);
    const tile=mesh.material.map===roadTexture?4:mesh.material.map===pavingTexture?2:0;
    if(tile){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/tile,uv.getY(i)*d/tile);uv.needsUpdate=true;}
    mesh.rotation.x=-Math.PI/2;mesh.receiveShadow=true;return add(mesh,x,y,z,parent);
  };
  const cylinder = (rt,rb,h,color,x,y,z,parent=scene,segments=18) => { const g=new T.CylinderGeometry(rt,rb,h,segments); geos.add(g); return add(new T.Mesh(g,mat(color)),x,y,z,parent); };
  const makeCanvasTexture = draw => { const c=document.createElement('canvas'); c.width=256;c.height=256; const g=c.getContext('2d');draw(g,c);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;textures.add(tx);return tx; };

  // The street and vehicles are deliberately modelled in code: dimensions and paint can be
  // changed without a binary asset, and all road-user positions remain the case's own coordinates.
  const paint = {
    ground: 0x344940, road: 0x59616c, pavement: 0xa8a79c,
    curb: 0xd1cec0, line: 0xf5f2df, cycle: 0x5d7780,
  };
  const roadTexture=makeCanvasTexture(g=>{
    g.fillStyle='#949896';g.fillRect(0,0,256,256);
    let seed=2891;
    for(let i=0;i<5500;i++){
      seed=(seed*1664525+1013904223)>>>0; const x=(seed>>>16)%256;
      seed=(seed*1664525+1013904223)>>>0; const y=(seed>>>16)%256;
      g.fillStyle=i%2?'rgba(25,32,36,.16)':'rgba(225,220,203,.15)';g.fillRect(x,y,i%7===0?2:1,1);
    }
  });
  roadTexture.wrapS=roadTexture.wrapT=T.RepeatWrapping;
  const pavingTexture=makeCanvasTexture(g=>{
    g.fillStyle='#b9b8ad';g.fillRect(0,0,256,256);
    g.strokeStyle='rgba(52,65,64,.34)';g.lineWidth=2;
    for(let y=0;y<=256;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();}
    for(let y=0;y<256;y+=64)for(let x=((y/64)%2)*32;x<=256;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+64);g.stroke();}
    g.strokeStyle='rgba(255,250,229,.18)';g.lineWidth=1;for(let y=2;y<256;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();}
  });
  pavingTexture.wrapS=pavingTexture.wrapT=T.RepeatWrapping;
  const brickTexture=makeCanvasTexture(g=>{
    g.fillStyle='#ac998b';g.fillRect(0,0,256,256);let seed=9831;
    for(let y=0;y<256;y+=16)for(let x=((y/16)%2)*16-32;x<256;x+=32){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      g.fillStyle=seed%3?'rgba(234,204,180,.10)':'rgba(58,44,40,.10)';g.fillRect(x+1,y+1,30,14);
      g.fillStyle='rgba(246,220,194,.06)';g.fillRect(x+2,y+2,28,1);
    }
    g.strokeStyle='rgba(65,52,47,.26)';g.lineWidth=1;
    for(let y=0;y<256;y+=16){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();for(let x=((y/16)%2)*16;x<256;x+=32){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+16);g.stroke();}}
  });
  brickTexture.wrapS=brickTexture.wrapT=T.RepeatWrapping;brickTexture.repeat.set(2,2);
  const roofTexture=makeCanvasTexture(g=>{
    g.fillStyle='#829194';g.fillRect(0,0,256,256);g.strokeStyle='rgba(27,39,44,.4)';g.lineWidth=2;
    for(let y=0;y<256;y+=18){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();for(let x=((y/18|0)%2)*16;x<256;x+=32){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+18);g.stroke();}}
  });
  roofTexture.wrapS=roofTexture.wrapT=T.RepeatWrapping;roofTexture.repeat.set(3,3);
  const road=mat(paint.road,{map:roadTexture,roughness:1,metalness:0});
  const marking=mat(paint.line,{roughness:1,metalness:0});
  new T.TextureLoader().load('assets/figma-road/aerial.webp',texture=>{
    if(disposed){texture.dispose();return;}texture.encoding=T.sRGBEncoding;texture.wrapS=texture.wrapT=T.RepeatWrapping;textures.add(texture);road.map=texture;road.needsUpdate=true;canvas.dataset.judgeRoadTexture='figma-aerial';
  },undefined,()=>{canvas.dataset.judgeRoadTexture='fallback';});
  const pavement=mat(paint.pavement,{map:pavingTexture,roughness:1,metalness:0});
  const curb=mat(paint.curb,{roughness:1,metalness:0});
  const pavingJoint=mat(0x919e94,{roughness:1,metalness:0});
  plane(40,40,paint.ground,0,0,0);
  plane(8,40,road,0,0,.02);
  const crossRoad=plane(40,8,road,0,0,.021);crossRoad.name='judge-crossroad';
  // Footpaths stop at the junction; no decorative object occupies the cycle path.
  for(const side of [-1,1]){
    plane(2.15,14,pavement,-5.15,side*11.2,.023);
    plane(2.15,14,pavement,7.55,side*11.2,.023);
    plane(14,2.15,pavement,side*11.2,-5.15,.024);
    plane(14,2.15,pavement,side*11.2,5.15,.024);
    box(.16,.16,14,curb,-4.15,.09,side*11.2);
    box(.16,.16,14,curb,6.55,.09,side*11.2);
    box(14,.16,.16,curb,side*11.2,.09,-4.15);
    box(14,.16,.16,curb,side*11.2,.09,4.15);
    for(let n=5.5;n<18;n+=1.8){
      plane(2.0,.025,pavingJoint,-5.15,side*n,.035);
      plane(2.0,.025,pavingJoint,7.55,side*n,.035);
      plane(.025,2.0,pavingJoint,side*n,-5.15,.035);
      plane(.025,2.0,pavingJoint,side*n,5.15,.035);
    }
  }
  for(let z=-18;z<=18;z+=4){if(Math.abs(z)>4.5)plane(.12,2.1,marking,0,z,.035);}
  const crossRoadMarks=[];
  for(let x=-18;x<=18;x+=4){if(Math.abs(x)>4.5)crossRoadMarks.push(plane(2.1,.12,marking,x,0,.036));}
  // A visually distinct cycle crossing continues the right-hand path across the junction.
  const cycleSurface=mat(0x8a9692,{map:roadTexture,roughness:1,metalness:0});
  plane(2.3,40,cycleSurface,5.2,0,.025);
  const cycleCrossing=plane(2.3,8,paint.cycle,5.2,0,.027);cycleCrossing.name='judge-cycle-crossing';
  const crossingDashes=[];
  for(const x of [4.05,6.35]){
    plane(.08,15.9,marking,x,-12.05,.04);plane(.08,15.9,marking,x,12.05,.04);
    for(let z=-3.5;z<4;z+=1.35)crossingDashes.push(plane(.08,.7,marking,x,z,.041));
  }
  // The pedestrian exercise takes place on a straight street, with a real
  // pavement beyond the cycle track, rather than in the middle of a side road.
  const pedestrianStreet=new T.Group();pedestrianStreet.name='judge-pedestrian-street';scene.add(pedestrianStreet);pedestrianStreet.visible=false;
  plane(2.15,8.2,pavement,-5.15,0,.025,pedestrianStreet);
  const crossingPavement=plane(2.15,8.2,pavement,7.55,0,.025,pedestrianStreet);crossingPavement.name='judge-crossing-pavement';
  box(.16,.16,8.2,curb,-4.15,.09,0,pedestrianStreet);
  box(.16,.16,8.2,curb,6.55,.09,0,pedestrianStreet);
  for(const x of [4.05,6.35])plane(.08,8.0,marking,x,0,.04,pedestrianStreet);
  function quad(points,material,parent){
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
    geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));
    geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();geos.add(geo);
    const mesh=new T.Mesh(geo,material);parent.add(mesh);return mesh;
  }
  function triangle(points,material,parent){
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
    geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,.5,1],2));geo.setIndex([0,1,2]);geo.computeVertexNormals();geos.add(geo);
    const mesh=new T.Mesh(geo,material);parent.add(mesh);return mesh;
  }
  function shopSign(text,color){
    const tx=makeCanvasTexture(g=>{g.fillStyle='#354b47';g.fillRect(0,0,256,256);g.fillStyle=color;g.font='800 34px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,128,230);});
    const material=new T.MeshBasicMaterial({map:tx,side:T.DoubleSide,toneMapped:false});mats.add(material);const geo=new T.PlaneGeometry(2.5,.62);geos.add(geo);return new T.Mesh(geo,material);
  }
  // Buildings remain behind the pavements. Shared instances retain crisp
  // windows and trim without a draw call for every pane.
  function instanceBoxes(material,items,cast=false){
    if(!items.length)return null;const geometry=new T.BoxGeometry(1,1,1);geos.add(geometry);
    const mesh=new T.InstancedMesh(geometry,material,items.length),placement=new T.Object3D();
    items.forEach((v,i)=>{placement.position.set(v[0],v[1],v[2]);placement.scale.set(v[3],v[4],v[5]);placement.updateMatrix();mesh.setMatrixAt(i,placement.matrix);});
    mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;mesh.castShadow=cast;mesh.receiveShadow=true;scene.add(mesh);return mesh;
  }
  const backdropBefore=new Set(scene.children);
  const facades=[0x9c7562,0xb4aa99,0x8f7d72,0xb9a594].map(color=>mat(color,{map:brickTexture,roughness:.95}));
  const roof=mat(0x43535a,{map:roofTexture,side:T.DoubleSide,roughness:1});
  const frameMat=mat(0x34454b,{roughness:.74}),sillMat=mat(0xc4b7a4,{roughness:.96});
  const glassDark=mat(0x4b666c,{roughness:.4,metalness:.12});
  const glassWarm=mat(0xd5b78b,{roughness:.42,metalness:.08,emissive:0xe5b66f,emissiveIntensity:.25});litWindows.push(glassWarm);
  const doorMat=mat(0x364c50,{roughness:.75}),railMat=mat(0x536367,{metalness:.25,roughness:.58});
  const frames=[],warmPanes=[],darkPanes=[],sills=[],mullions=[],doors=[],balconies=[];
  for(const side of [-1,1]) for(let i=0;i<4;i++){
    // Keep the building footprints beyond both crossing streets and pavements.
    const z=[-16,-9,9,16][i]+(side>0?.25:0), h=[4.35,5.45,4.65,5.0][i], width=4.1, centerX=side*11.7, innerX=centerX-side*(width/2+.03);
    const facade=box(width,h,5.0,facades[i],centerX,h/2,z);facade.castShadow=true;facade.receiveShadow=true;
    const eave=h+.06,ridge=h+.72,edge=width/2+.08;
    const a=quad([[centerX-edge,eave,z-2.58],[centerX-edge,eave,z+2.58],[centerX,ridge,z+2.58],[centerX,ridge,z-2.58]],roof,scene);
    const b=quad([[centerX,ridge,z-2.58],[centerX,ridge,z+2.58],[centerX+edge,eave,z+2.58],[centerX+edge,eave,z-2.58]],roof,scene);a.castShadow=b.castShadow=true;
    const frontGable=triangle([[centerX-edge,eave,z+2.51],[centerX+edge,eave,z+2.51],[centerX,ridge,z+2.51]],facades[i],scene);
    const backGable=triangle([[centerX+edge,eave,z-2.51],[centerX-edge,eave,z-2.51],[centerX,ridge,z-2.51]],facades[i],scene);frontGable.castShadow=backGable.castShadow=true;
    const rows=Math.floor((h-.65)/1.03);
    for(let row=0;row<rows;row++)for(let col=0;col<2;col++){
      if(row===0&&col===0)continue;
      const wy=.82+row*1.03,wz=z-1.15+col*2.2;
      frames.push([innerX,wy,wz,.065,.76,.91]);
      ((i+row+col)%3===0?darkPanes:warmPanes).push([innerX-side*.046,wy,wz,.045,.62,.75]);
      sills.push([innerX-side*.11,wy-.405,wz,.23,.075,1.00]);
      mullions.push([innerX-side*.078,wy,wz,.042,.64,.035]);
      mullions.push([innerX-side*.078,wy,wz,.042,.035,.76]);
    }
    // Windows on the gable-facing side keep close views from becoming blank walls.
    for(let row=0;row<rows;row++)for(let col=0;col<2;col++){
      const wy=.82+row*1.03,wx=centerX-.96+col*1.92,front=z+2.535;
      frames.push([wx,wy,front,.91,.76,.065]);
      ((i+row+col+1)%3===0?darkPanes:warmPanes).push([wx,wy,front+.04,.75,.62,.045]);
      sills.push([wx,wy-.405,front+.10,1.00,.075,.22]);
      mullions.push([wx,wy,front+.067,.035,.64,.042]);mullions.push([wx,wy,front+.067,.76,.035,.042]);
    }
    const entrance=z-1.15;
    frames.push([innerX,.99,entrance,.10,1.98,1.05]);doors.push([innerX-side*.065,.98,entrance,.06,1.78,.82]);
    warmPanes.push([innerX-side*.103,1.37,entrance,.035,.43,.65]);
    sills.push([innerX-side*.17,.07,entrance,.40,.12,1.25]);
    if(i%2===0){
      balconies.push([innerX-side*.26,2.40,z+.95,.55,.10,1.66]);
      balconies.push([innerX-side*.51,2.75,z+.95,.035,.70,1.66]);
      for(const dz of [-.72,-.36,0,.36,.72])balconies.push([innerX-side*.51,2.75,z+.95+dz,.045,.68,.045]);
    }
    if(i===1){const face=shopSign(side<0?'KIOSK':'VÆRKSTED','#f4e8c7');face.rotation.y=-side*Math.PI/2;add(face,innerX-side*.12,2.1,z+.7);}
  }
  instanceBoxes(frameMat,frames,true);instanceBoxes(glassWarm,warmPanes);instanceBoxes(glassDark,darkPanes);
  instanceBoxes(sillMat,sills,true);instanceBoxes(frameMat,mullions);instanceBoxes(doorMat,doors);instanceBoxes(railMat,balconies,true);
  const foliageGeometry=new T.IcosahedronGeometry(1,1);geos.add(foliageGeometry);
  const foliage=[mat(0x385d46,{roughness:1,flatShading:true}),mat(0x507052,{roughness:1,flatShading:true}),mat(0x718160,{roughness:1,flatShading:true})];
  const foliageItems=[[],[],[]];
  function tree(x,z,scale=1){
    const trunk=cylinder(.09*scale,.14*scale,1.70*scale,0x5d5549,x,.85*scale,z,scene,10);trunk.castShadow=true;
    const offset=(Math.abs(Math.round(z))%3-1)*.12;
    for(const [dx,dy,dz,size,index] of [[-.14,2.31,.02,.54,0],[.37,2.14,-.12,.48,1],[-.44,2.02,-.18,.47,2],
      [.51,1.94,.15,.43,0],[-.05,1.94,.42,.47,1],[.04,1.92,-.43,.44,0],[-.50,1.80,.22,.36,1]])
      foliageItems[index].push([x+(dx+offset)*scale,dy*scale,z+dz*scale,size*scale,size*scale*.92,size*scale]);
  }
  for(const [x,z,s] of [[-8.8,-8.8,1],[-8.8,9.8,.92],[9.6,-9.2,1],[9.7,9.6,1.02],[-9.4,-15,.82],[9.6,15.4,.83],[9.5,5.8,.80],[-9.3,5.8,.82]])tree(x,z,s);
  for(const [index,items] of foliageItems.entries()){
    const clusters=new T.InstancedMesh(foliageGeometry,foliage[index],items.length),placement=new T.Object3D();
    items.forEach((v,i)=>{placement.position.set(v[0],v[1],v[2]);placement.scale.set(v[3],v[4],v[5]);placement.rotation.y=i*.63;placement.updateMatrix();clusters.setMatrixAt(i,placement.matrix);});
    clusters.instanceMatrix.needsUpdate=true;clusters.frustumCulled=false;clusters.castShadow=true;scene.add(clusters);
  }
  const hedge=mat(0x42634b,{roughness:1}),hedgeTop=mat(0x5c7956,{roughness:1});
  for(const side of [-1,1])for(const z of [-13,13]){
    const planting=box(.85,.62,4.3,hedge,side*9.6,.31,z);planting.castShadow=true;
    box(.88,.08,4.35,hedgeTop,side*9.6,.64,z);
  }
  // Small planted beds and kerb grates add scale without entering either lane.
  const planter=mat(0x8b8b7f,{roughness:1}),soil=mat(0x424d40,{roughness:1}),metal=mat(0x4e5d5c,{roughness:.84,metalness:.18});
  for(const side of [-1,1])for(const z of [-6.4,6.7]){
    box(.72,.28,1.32,planter,side*9.45,.14,z);box(.58,.05,1.18,soil,side*9.45,.30,z);
    for(const dz of [-.38,0,.38]){const bush=add(new T.Mesh(foliageGeometry,foliage[(dz===0)?1:0]),side*9.45,.44,z+dz);bush.scale.set(.24,.18,.25);bush.castShadow=true;}
  }
  for(const z of [-13,-7.2,8.5,15])for(const x of [-3.86,3.86]){
    plane(.32,.64,metal,x,z,.047);for(let slot=-2;slot<=2;slot++)plane(.22,.026,0x273538,x,z+slot*.105,.049);
  }
  function lamp(x,z){
    const pole=mat(0x66776f),glass=glow(0xffd487);
    cylinder(.06,.08,4.3,0x66776f,x,2.15,z);
    box(.7,.08,.16,pole,x-Math.sign(x)*.28,4.25,z);
    box(.22,.08,.22,glass,x-Math.sign(x)*.59,4.19,z);
    const warm=new T.PointLight(0xffca87,.9,11,2);add(warm,x-Math.sign(x)*.59,4.05,z);
    const poolTexture=makeCanvasTexture((ctx)=>{const grad=ctx.createRadialGradient(128,128,0,128,128,124);grad.addColorStop(0,'rgba(255,210,151,.23)');grad.addColorStop(.52,'rgba(255,207,145,.09)');grad.addColorStop(1,'rgba(255,207,145,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);});
    const poolMat=new T.MeshBasicMaterial({map:poolTexture,transparent:true,opacity:.72,depthWrite:false,toneMapped:false});mats.add(poolMat);
    const poolGeo=new T.PlaneGeometry(7,7);geos.add(poolGeo);const pool=new T.Mesh(poolGeo,poolMat);pool.rotation.x=-Math.PI/2;add(pool,x-Math.sign(x)*.59,.045,z);
    streetLights.push({warm,poolMat,glass});
  }
  lamp(-5.15,5.8);lamp(7.4,-5.8);
  const legacyBackdrop=scene.children.filter(node=>!backdropBefore.has(node));
  let streetKit=null;
  async function mountTown(){
    try { if(!T.GLTFLoader)await import('./assets/GLTFLoader-r128.js'); if(disposed)return;
      const kit=await createStreetKit(T,scene,{family:'town',length:70,roadHalfWidth:3.5,zStart:24,people:false,exclusions:[[-6,6]]});
      streetKit=kit; await kit.ready; if(disposed){kit.dispose();return;}
      for(const object of legacyBackdrop)object.visible=false;
      // Foreground frontage would cover the teaching road from this elevated camera.
      for(const object of kit.group.children)if(object.position.x>0)object.visible=false;
      const backdrop=kit.group.children.find(object=>object.position.x<0);
      if(backdrop){backdrop.position.set(-8,0,-7);backdrop.scale.setScalar(.55);}
      canvas.dataset.judgeEnvironment='approved-town';
    }catch(error){if(!disposed){canvas.dataset.judgeEnvironment='fallback';console.warn('Town fallback:',error?.message||error);}}
  }

  function segment(a,b,r,material,parent){
    const start=new T.Vector3(...a),end=new T.Vector3(...b),direction=end.clone().sub(start);
    const geo=new T.CylinderGeometry(r,r,direction.length(),8);geos.add(geo);
    const part=new T.Mesh(geo,material);part.position.copy(start.add(end).multiplyScalar(.5));
    part.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());parent.add(part);return part;
  }
  function sphere(r,material,x,y,z,parent){
    const geo=new T.SphereGeometry(r,12,8);geos.add(geo);return add(new T.Mesh(geo,material),x,y,z,parent);
  }
  const actorShadowTexture=makeCanvasTexture(g=>{
    const gradient=g.createRadialGradient(128,128,2,128,128,126);
    gradient.addColorStop(0,'rgba(13,23,25,.66)');gradient.addColorStop(.48,'rgba(13,23,25,.25)');gradient.addColorStop(1,'rgba(13,23,25,0)');
    g.fillStyle=gradient;g.fillRect(0,0,256,256);
  });
  function contactShadow(parent,w,d){
    const geo=new T.PlaneGeometry(w*2,d*2);geos.add(geo);
    const shade=new T.MeshBasicMaterial({map:actorShadowTexture,transparent:true,opacity:.8,depthWrite:false,toneMapped:false});mats.add(shade);
    const mesh=new T.Mesh(geo,shade);mesh.rotation.x=-Math.PI/2;add(mesh,0,.062,0,parent);
  }
  const OWN_CAR_COLOR=0x327bd3;
  function makeProceduralCar(color=OWN_CAR_COLOR){
    const g=new T.Group();contactShadow(g,1.18,2.05);
    const body=mat(color,{roughness:.48,metalness:.08}), trim=mat(0x26383a), glass=mat(0x496b72,{roughness:.25,metalness:.1,side:T.DoubleSide});
    const roof=mat(color,{roughness:.53,metalness:.05,side:T.DoubleSide}), rubber=mat(0x202b2b), hub=mat(0xb7c6bd,{metalness:.2});
    box(1.58,.40,3.04,body,0,.49,0,g);
    box(1.46,.09,.78,body,0,.735,-1.08,g);
    box(1.46,.09,.48,body,0,.735,1.26,g);
    // Sloping windows give a recognizable car silhouette without changing its footprint.
    quad([[-.62,.72,-.73],[.62,.72,-.73],[.56,1.12,-.26],[-.56,1.12,-.26]],glass,g);
    quad([[-.56,1.12,.55],[.56,1.12,.55],[.62,.72,1.02],[-.62,.72,1.02]],glass,g);
    quad([[-.56,1.12,-.26],[.56,1.12,-.26],[.56,1.12,.55],[-.56,1.12,.55]],roof,g);
    for(const x of [-1,1]){
      quad([[x*.63,.72,-.71],[x*.63,.72,.98],[x*.56,1.12,.55],[x*.56,1.12,-.26]],glass,g);
      segment([x*.61,.72,.14],[x*.56,1.12,.14],.045,trim,g);
      for(const z of [-1.0,1.0]){
        const tyreGeo=new T.CylinderGeometry(.28,.28,.18,16);geos.add(tyreGeo);const tyre=new T.Mesh(tyreGeo,rubber);tyre.rotation.z=Math.PI/2;add(tyre,x*.81,.29,z,g);
        const hubGeo=new T.CylinderGeometry(.14,.14,.19,12);geos.add(hubGeo);const rim=new T.Mesh(hubGeo,hub);rim.rotation.z=Math.PI/2;add(rim,x*.82,.29,z,g);
      }
      box(.17,.08,.03,glow(0xfff4cd),x*.53,.55,-1.535,g);
      box(.21,.085,.03,glow(0xd75e54),x*.52,.57,1.535,g);
      box(.14,.07,.25,trim,x*.84,.74,-.43,g);
    }
    box(.8,.09,.035,trim,0,.41,-1.535,g);box(.7,.07,.035,trim,0,.41,1.535,g);
    return g;
  }
  // Approved still cut-outs stay on the pavements, or on the cycle track for cyclists.
  function addApprovedBystanders(){
    let loaded=0;canvas.dataset.judgeBystanders='0';
    const zValues=[-8,-10,-12];
    [PEOPLE_CSE[0],PEOPLE_CSE[3],PEOPLE_CSE[2]].forEach((url,index)=>{
      const cyclist=url.includes('cyclist'),side=index%2?1:-1,z=zValues[index],x=cyclist?5.2:(side<0?-5.15:7.55);
      new T.TextureLoader().load(url,texture=>{
        if(disposed){texture.dispose();return;}texture.encoding=T.sRGBEncoding;textures.add(texture);
        const h=url.includes('child')?1.3:1.68,w=h*texture.image.width/texture.image.height;
        const actor=new T.Group();actor.name='approved-static-bystander';actor.position.set(x,0,z);scene.add(actor);contactShadow(actor,.4,.32);
        const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide});mats.add(material);
        const geometry=new T.PlaneGeometry(w,h);geometry.translate(0,h/2,0);geos.add(geometry);
        const figure=attachCylindricalBillboard(T,new T.Mesh(geometry,material));figure.name='approved-cse-bystander';actor.add(figure);canvas.dataset.judgeBystanders=String(++loaded);
      });
    });
  }
  function signFace(draw,dimension){
    const tx=makeCanvasTexture(draw),material=new T.MeshBasicMaterial({map:tx,transparent:true,side:T.DoubleSide,toneMapped:false});mats.add(material);
    const geometry=new T.PlaneGeometry(dimension,dimension);geos.add(geometry);return new T.Mesh(geometry,material);
  }
  function drawStop(g){
    const octagon=(radius,color)=>{g.beginPath();for(let i=0;i<8;i++){const a=(22.5+i*45)*Math.PI/180,x=128+radius*Math.cos(a),y=128+radius*Math.sin(a);i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fillStyle=color;g.fill();};
    g.clearRect(0,0,256,256);octagon(119,'#f4f6ef');octagon(105,'#d8434f');g.fillStyle='#fff';g.font='800 57px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('STOP',128,132);
  }
  function drawYield(g){
    g.clearRect(0,0,256,256);g.beginPath();g.moveTo(128,239);g.lineTo(7,29);g.lineTo(249,29);g.closePath();g.fillStyle='#e34d59';g.fill();g.beginPath();g.moveTo(128,197);g.lineTo(43,49);g.lineTo(213,49);g.closePath();g.fillStyle='#f4f6ef';g.fill();
  }
  function makeSign(kind){
    const g=new T.Group(),stop=kind==='stop';
    // 50 km/h urban examples: a 0.70 m sign and approximately 2.20 m to its lower edge.
    box(.09,2.9,.09,0x7d8d92,0,1.45,0,g);
    const face=signFace(stop?drawStop:drawYield,stop ? .815 : .741);face.name='judge-sign-face';add(face,0,stop?2.55:2.521,0,g);return g;
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
  const pendingSurfaceImages=new Set();
  function requestSurfaceStudies(){
    function load(texture,file,paintImage){
      const image=new Image();pendingSurfaceImages.add(image);
      image.onload=()=>{pendingSurfaceImages.delete(image);if(disposed)return;
        const surface=texture.image,context=surface.getContext('2d');context.save();paintImage(context,image,surface);context.restore();texture.needsUpdate=true;};
      image.onerror=()=>{pendingSurfaceImages.delete(image);};
      image.src=new URL(file,import.meta.url).href;
    }
    load(roadTexture,'./assets/textures/asphalt-study-v1.webp',(g,image,surface)=>{
      g.globalAlpha=.18;g.drawImage(image,0,0,surface.width,surface.height);
    });
    load(brickTexture,'./assets/textures/brick-study-v1.webp',(g,image,surface)=>{
      // One photographically detailed brick course replaces the procedural
      // courses; a light base prevents darkening the building at night.
      g.fillStyle='#d5ccc2';g.fillRect(0,0,surface.width,surface.height);
      g.globalAlpha=.35;g.drawImage(image,0,0,surface.width,surface.height);brickTexture.repeat.set(1,2);
    });
  }
  // Optional local Blender assets. The procedural actors are already on screen before
  // these load and stay available for offline operation or any loader/model failure.
  const details={car:null,traffic:null,cyclist:null,pedestrian:null};
  let trafficOccupants=null;
  let pedestrianRequested=false, cyclistStatus='idle', walkerStatus='idle';
  const detailStatus=(kind,status)=>{const key=kind==='car'?'judgeCarModel':kind==='traffic'?'judgeTrafficFleet':kind==='cyclist'?'judgeCyclistModel':'judgePedestrianModel';canvas.dataset[key]=status;};
  function disposeAsset(root){
    const geometry=new Set(),materials=new Set(),maps=new Set();
    root.traverse(node=>{
      if(node.geometry)geometry.add(node.geometry);
      for(const material of (Array.isArray(node.material)?node.material:node.material?[node.material]:[])){
        materials.add(material);for(const value of Object.values(material))if(value&&value.isTexture)maps.add(value);
      }
    });
    for(const item of geometry)item.dispose();for(const item of materials)item.dispose();for(const item of maps)item.dispose();
  }
  function exactBounds(root){
    root.updateMatrixWorld(true);
    const bounds=new T.Box3().makeEmpty(),point=new T.Vector3();let count=0;
    root.traverse(node=>{
      const positions=node.isMesh&&node.geometry?.attributes?.position;if(!positions)return;
      for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(node.matrixWorld);bounds.expandByPoint(point);count++;}
    });
    if(!count)throw new Error('Model contains no visible geometry');
    return bounds;
  }
  function fittedModel(source,kind){
    const rotation=new T.Group();rotation.rotation.y=(kind==='car'||kind==='traffic')?Math.PI/2:kind==='pedestrian'?Math.PI:0;rotation.add(source);
    const bounds=exactBounds(rotation),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
    if(![size.x,size.y,size.z,center.x,center.z,bounds.min.y].every(Number.isFinite)||Math.min(size.x,size.y,size.z)<.01)throw new Error('Invalid model bounds');
    // The pedestrian's inner half-turn keeps its existing outer actor rotation
    // and makes the model face the direction of the unchanged crossing path.
    // All assets fit within their established actor and hotspot envelopes.
    const limits=(kind==='car'||kind==='traffic')?{width:1.72,height:1.18,length:3.05}:kind==='cyclist'?{width:.46,height:1.70,length:1.64}:{width:.56,height:1.68,length:.44};
    rotation.position.set(-center.x,-bounds.min.y,-center.z);
    const pivot=new T.Group();if(kind==='traffic')pivot.scale.setScalar(limits.length/size.z);else pivot.scale.set(limits.width/size.x,limits.height/size.y,limits.length/size.z);pivot.add(rotation);
    const fitted=exactBounds(pivot),actual=fitted.getSize(new T.Vector3());
    if(actual.x>limits.width+.001||actual.y>limits.height+.001||actual.z>limits.length+.001)throw new Error('Model exceeds actor envelope');
    return pivot;
  }
  function setOpacity(root,opacity){
    if(opacity>=1)return;
    root.traverse(node=>{for(const item of (Array.isArray(node.material)?node.material:node.material?[node.material]:[])){
      item.transparent=true;item.opacity=opacity;item.depthWrite=false;
    }});
  }
  function installDetailed(actor){
    const kind=actor.userData.visualKind||actor.userData.visualAssetKind,source=details[kind];
    if(!source||actor.userData.detailed||disposed)return;
    let clone;const copiedGeometry=new Map(),copiedMaterials=new Map();
    try{
      clone=source.clone(true);
      clone.traverse(node=>{
        if(node.geometry){
          if(!copiedGeometry.has(node.geometry)){const copy=node.geometry.clone();copiedGeometry.set(node.geometry,copy);geos.add(copy);}
          node.geometry=copiedGeometry.get(node.geometry);
          if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}
        }
        if(node.material){
          const copyMaterial=item=>{
            if(!copiedMaterials.has(item)){
              const copy=item.clone();
              if(kind==='car'&&/^paint_PBR(?:\.|$)/i.test(copy.name))copy.color.setHex(actor.userData.visualColor);
              if(kind==='pedestrian'&&copy.emissive&&copy.color){copy.emissive.copy(copy.color);copy.emissiveIntensity=0;pedestrianNightFill.add(copy);}
              copiedMaterials.set(item,copy);mats.add(copy);
            }
            return copiedMaterials.get(item);
          };
          node.material=Array.isArray(node.material)?node.material.map(copyMaterial):copyMaterial(node.material);
        }
      });
      if(kind==='traffic' && trafficOccupants){const raw=clone.children[0]?.children[0];if(!raw)throw Error('Missing traffic vehicle root');const driver=trafficOccupants.create({identity:0,width:.55,height:.66});driver.userData.occupantRole='driver';driver.position.set(2.5,.83,-.43);raw.add(driver);}
      setOpacity(clone,actor.userData.visualOpacity);
      actor.add(clone);actor.userData.detailed=clone;
      // Keep the contact shadow while replacing the rest of the procedural mesh.
      actor.userData.procedural.children.forEach((child,index)=>{child.visible=index===0;});
    }catch{
      if(clone?.parent)clone.parent.remove(clone);
      for(const geometry of copiedGeometry.values()){geometry.dispose();geos.delete(geometry);}
      for(const material of copiedMaterials.values()){material.dispose();mats.delete(material);pedestrianNightFill.delete(material);}
      // A failed clone never hides the already usable fallback.
    }
  }
  function makeVisual(kind,procedural,color,opacity){
    const actor=new T.Group();if(kind==='pedestrian')actor.userData.visualAssetKind=kind;else actor.userData.visualKind=kind;actor.userData.visualColor=color;
    actor.userData.visualOpacity=opacity;actor.userData.procedural=procedural;
    setOpacity(procedural,opacity);actor.add(procedural);installDetailed(actor);return actor;
  }
  function makeCar(color=OWN_CAR_COLOR,opacity=1){return makeVisual('car',makeProceduralCar(color),color,opacity);}
  function makeTrafficCar(){const placeholder=new T.Group();contactShadow(placeholder,1.18,2.05);return makeVisual('traffic',placeholder,null,1);}
  function makeCyclist(){
    const g=new T.Group();contactShadow(g,.48,.95);cyclistStatus='loading';canvas.dataset.judgeCyclistModel='loading';
    loadApprovedCyclist(T).then(figure=>{if(disposed||!g.parent){figure.userData.disposeApprovedCyclist();return;}g.add(figure);cyclistStatus='ready';canvas.dataset.judgeCyclistModel='approved-static';applySceneAvailability();}).catch(()=>{if(disposed||!g.parent)return;cyclistStatus='unavailable';canvas.dataset.judgeCyclistModel='unavailable';applySceneAvailability();});
    return g;
  }
  function makeWalker(){
    const g=new T.Group();contactShadow(g,.38,.32);walkerStatus='loading';canvas.dataset.judgePedestrianModel='loading';
    new T.TextureLoader().load('assets/people-cse/a_adult.png',texture=>{
      if(disposed||!g.parent){texture.dispose();return;}texture.encoding=T.sRGBEncoding;textures.add(texture);
      const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide});mats.add(material);
      const geometry=new T.PlaneGeometry(1.68*229/558,1.68);geometry.translate(0,.84,0);geos.add(geometry);
      const figure=attachCylindricalBillboard(T,new T.Mesh(geometry,material));figure.name='approved-cse-pedestrian';g.add(figure);walkerStatus='ready';canvas.dataset.judgePedestrianModel='approved-static';applySceneAvailability();
    },undefined,()=>{if(disposed||!g.parent)return;walkerStatus='unavailable';canvas.dataset.judgePedestrianModel='unavailable';applySceneAvailability();});
    return g;
  }
  function applySceneAvailability(){
    const state=current?.scene==='yield' ? (details.traffic?'ready':canvas.dataset.judgeTrafficFleet) : current?.scene==='bike'?cyclistStatus:current?.scene==='pedestrian'?walkerStatus:'ready';
    if(state==='ready'){canvas.hidden=false;fallback.hidden=true;resize();return;}
    canvas.hidden=true;fallback.hidden=false;fallback.textContent=state==='unavailable'?'Vi kunne ikke hente situationen lige nu. Brug teksten og knapperne.':'Henter situationen …';
  }
  async function requestModel(kind,file){
    detailStatus(kind,'loading');let loaded=null;
    try{
      if(!T.GLTFLoader)await import('./assets/GLTFLoader-r128.js');
      if(disposed)return;
      const result=kind==='traffic'?await loadApprovedFleet(T,'sedan','lod1'):await new T.GLTFLoader().loadAsync(new URL(file,import.meta.url).href);loaded=result.scene;
      if(disposed){disposeAsset(loaded);loaded=null;return;}
      if(kind==='traffic'){trafficOccupants=await createSeatedOccupants(T);if(disposed){trafficOccupants.dispose();trafficOccupants=null;disposeAsset(loaded);loaded=null;return;}}
      const fitted=fittedModel(loaded,kind);loaded=null;details[kind]=fitted;if(kind==='traffic'){canvas.dataset.judgeTrafficFleet='approved-sedan-053';applySceneAvailability();}else detailStatus(kind,'ready');
      // A case may have changed while the request was in flight: only attach to
      // the current actors, never to groups removed by a previous case.
      for(const actor of dynamic.children)if((actor.userData.visualKind||actor.userData.visualAssetKind)===kind)installDetailed(actor);
    }catch{
      if(loaded)disposeAsset(loaded);
      if(kind==='traffic'){trafficOccupants?.dispose();trafficOccupants=null;}
      if(!disposed){if(kind==='traffic'){canvas.dataset.judgeTrafficFleet='unavailable';applySceneAvailability();}else detailStatus(kind,'fallback');}
    }
  }
  function discardDynamic(object){
    const geometries=new Set(), materials=new Set();
    object.traverse(node=>{if(node.name==='seated-occupant-review'){node.dispose?.();return;}if(node.userData.disposeApprovedCyclist){node.userData.disposeApprovedCyclist();return;}if(node.geometry)geometries.add(node.geometry);if(node.material){for(const material of (Array.isArray(node.material)?node.material:[node.material]))materials.add(material);}});
    for(const geometry of geometries){geometry.dispose();geos.delete(geometry);}
    for(const material of materials){if(material.map&&material.map!==actorShadowTexture&&textures.has(material.map)){material.map.dispose();textures.delete(material.map);}material.dispose();mats.delete(material);pedestrianNightFill.delete(material);}
    if(object.parent)object.parent.remove(object);
  }
  function clearDynamic(){
    while(dynamic.children.length) discardDynamic(dynamic.children[0]);
    own=other=cyclist=walker=sign=ghost=safeLine=correctionPlaque=null;placing=placedTarget=corrected=null;delete canvas.dataset.replayPhase;
  }
  function stopLine(){const line=box(3.7,.055,.30,glow(0xf4f6ef),2,.058,4.15,dynamic);line.name='judge-stop-line';}
  function teeth(){
    // S11: spidsen vender mod den vigepligtige bil på tilgangssiden (+z).
    for(let x=.45;x<=3.6;x+=.9){const shape=new T.Shape();shape.moveTo(-.25,0);shape.lineTo(.25,0);shape.lineTo(0,-.60);shape.closePath();const geo=new T.ShapeGeometry(shape);geos.add(geo);const m=new T.Mesh(geo,glow(0xf4f6ef));m.name='judge-yield-tooth';m.rotation.x=-Math.PI/2;add(m,x,.057,4.05,dynamic);}
  }
  function crosswalk(){for(let x=-3.5;x<=3.5;x+=1){const bar=plane(.5,4,glow(0xf4f6ef),x,.45,.056,dynamic);bar.name='judge-crosswalk-bar';}}
  function configure(c){
    current=c;clearDynamic();
    const pedestrian=c.scene==='pedestrian';pedestrianStreet.visible=pedestrian;crossRoad.visible=!pedestrian;cycleCrossing.visible=!pedestrian;
    for(const part of [...crossRoadMarks,...crossingDashes])part.visible=!pedestrian;
    own=makeCar();dynamic.add(own);own.rotation.y=0;
    if(c.scene==='stop'){
      stopLine(); sign=makeSign('stop');sign.name='judge-sign';add(sign,7.0,0,4.55,dynamic);faceCameraY(sign);own.position.set(2,0,8.2);
    } else if(c.scene==='yield'){
      teeth();sign=makeSign('yield');sign.name='judge-sign';add(sign,7.0,0,4.55,dynamic);faceCameraY(sign);own.position.set(2,0,8.2);other=makeTrafficCar();add(other,-8.5,0,1.7,dynamic);other.rotation.y=-Math.PI/2;
    } else if(c.scene==='bike'){
      own.position.set(2,0,8);cyclist=makeCyclist();add(cyclist,5.2,0,6.2,dynamic);own.rotation.y=0;
    } else {
      crosswalk();own.position.set(2,0,8.2);walker=makeWalker();walker.name='judge-pedestrian';add(walker,7.2,0,1.1,dynamic);walker.rotation.y=-Math.PI/2;

    }
    applySceneAvailability();setProgress(1);resize();
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
      if(walker) walker.position.x=7.2+(1.55-7.2)*p;
    }
  }
  function clearPlacementGuides(){
    if(ghost){discardDynamic(ghost);ghost=null;}
    if(safeLine){discardDynamic(safeLine);safeLine=null;}
    if(correctionPlaque){discardDynamic(correctionPlaque);correctionPlaque=null;}
    placing=null;placedTarget=null;corrected=null;delete canvas.dataset.replayPhase;
  }
  function replay(){ clearPlacementGuides();start=performance.now();playing=motion;if(!motion)setProgress(1);else setProgress(0); }
  const clamp01=value=>Math.max(0,Math.min(1,value));
  const mix=(from,to,p)=>from+(to-from)*clamp01(p);
  function addMistakeGhost(){
    ghost=makeCar(0x667681,.3);ghost.position.copy(own.position);ghost.rotation.copy(own.rotation);
    if(current.scene==='yield') ghost.position.z=4.55;
    else if(current.scene==='bike'){ghost.position.x=2.7;ghost.position.z=3.45;ghost.rotation.y=-.16;}
    else if(current.scene==='pedestrian') ghost.position.z=4;
    dynamic.add(ghost);
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
      if(walker) walker.position.x=p<approachEnd?mix(7.2,6.8,approach):p<waitEnd?mix(6.8,-4.5,waiting):mix(-4.5,-5.4,leave);
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
    clearPlacementGuides();playing=false;setProgress(1);
    const from={x:own.position.x,z:own.position.z,r:own.rotation.y};
    ghost=makeCar(0x61727d,.24);ghost.position.copy(own.position);ghost.rotation.copy(own.rotation);dynamic.add(ghost);
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
    try { frameCamera();renderer.render(scene,camera);return canvas.toDataURL('image/jpeg',.84); }
    catch { return ''; }
    finally { overlays.forEach((item,index)=>{item.visible=visibility[index];}); }
  }
  function resize(){
    const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);
    frameCamera();updateHotspots();
  }
  function frameCamera(){
    const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height||!own)return;
    const aspect=width/height,isPedestrian=current?.scene==='pedestrian';
    const dx=isPedestrian?-9:9,dy=isPedestrian?10:13,dz=12;
    camera.position.set(dx,dy,dz);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
    const elements=camera.matrixWorld.elements;
    const right=new T.Vector3(elements[0],elements[1],elements[2]);
    const up=new T.Vector3(elements[4],elements[5],elements[6]);
    const points=[];
    function envelope(object,w,d,h){
      if(!object)return;object.updateMatrixWorld(true);
      for(const x of [-w,w])for(const y of [0,h])for(const z of [-d,d])points.push(new T.Vector3(x,y,z).applyMatrix4(object.matrixWorld));
    }
    envelope(own,.86,1.525,1.18);envelope(other,.86,1.525,1.18);
    envelope(cyclist,.23,.82,1.70);envelope(walker,.28,.22,1.72);envelope(sign,.41,.08,2.90);
    envelope(ghost,.86,1.525,1.18);
    // Keep the relevant markings in view even when the actor starts moving away.
    if(current.scene==='stop'||current.scene==='yield')points.push(new T.Vector3(.45,.05,4.15),new T.Vector3(3.55,.05,4.15));
    else if(current.scene==='bike')points.push(new T.Vector3(5.2,.05,-1.5),new T.Vector3(5.2,.05,2));
    else points.push(new T.Vector3(-3.5,.05,.45),new T.Vector3(3.5,.05,.45));
    if(streetKit && canvas.dataset.judgeEnvironment==='approved-town' && !isPedestrian)points.push(new T.Vector3(-5.5,1.4,-5.5));
    for(const binding of hotspotBindings){const point=hotspotPoint(binding.item);if(point)points.push(point);}
    let minR=Infinity,maxR=-Infinity,minU=Infinity,maxU=-Infinity;
    for(const point of points){const r=point.dot(right),u=point.dot(up);minR=Math.min(minR,r);maxR=Math.max(maxR,r);minU=Math.min(minU,u);maxU=Math.max(maxU,u);}
    const centreR=(minR+maxR)/2,centreU=(minU+maxU)/2,det=right.x*up.z-right.z*up.x;
    const focusX=(centreR*up.z-right.z*centreU)/det,focusZ=(right.x*centreU-centreR*up.x)/det;
    const minimum={stop:3.45,yield:3.8,bike:3.55,pedestrian:3.65}[current.scene]||3.65;
    const halfH=Math.max(minimum,(maxU-minU)/2+.85,((maxR-minR)/2+.85)/aspect);
    camera.position.set(focusX+dx,dy,focusZ+dz);camera.lookAt(focusX,0,focusZ);
    camera.left=-halfH*aspect;camera.right=halfH*aspect;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();
  }
  function hotspotPoint(item){
    const anchored=item.anchor&&({own,other,cyclist,walker,sign}[item.anchor]);
    if(anchored){
      const y=item.anchor==='own'||item.anchor==='other'?1.35:1.55;
      return new T.Vector3(anchored.position.x,anchored.position.y+y,anchored.position.z);
    }
    return Array.isArray(item.world)?new T.Vector3(item.world[0],item.world[1],item.world[2]):null;
  }
  // Keep touch targets clear of moving road users and each other without using
  // any correctness metadata. Connectors continue to the actual world positions.
  function compactObstacles(width,height){
    const result=[],point=new T.Vector3();
    function envelope(object,halfWidth,halfLength,upper){
      if(!object)return;object.updateMatrixWorld(true);
      let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
      for(const x of [-halfWidth,halfWidth])for(const y of [0,upper])for(const z of [-halfLength,halfLength]){
        point.set(x,y,z).applyMatrix4(object.matrixWorld).project(camera);
        const px=(point.x+1)*width/2,py=(1-point.y)*height/2;
        left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
      }
      if(right>=0&&left<=width&&bottom>=0&&top<=height)result.push({left:left-4,right:right+4,top:top-4,bottom:bottom+4});
    }
    envelope(own,.86,1.525,1.18);envelope(other,.86,1.525,1.18);
    envelope(cyclist,.23,.82,1.70);envelope(walker,.28,.22,1.72);envelope(sign,.41,.08,2.9);
    const canvasRect=canvas.getBoundingClientRect();
    for(const element of canvas.parentElement.querySelectorAll('.judge__clip-label,.judge__replay')){
      const rect=element.getBoundingClientRect();if(!rect.width||!rect.height)continue;
      result.push({left:rect.left-canvasRect.left-3,right:rect.right-canvasRect.left+3,top:rect.top-canvasRect.top-3,bottom:rect.bottom-canvasRect.top+3});
    }
    return result;
  }
  function compactMarker(binding,index,width,height,occupied){
    const preferred=binding.mobileMarker||{x:width*(index+1)/(hotspotBindings.length+1),y:76};
    const candidates=[preferred];
    for(let y=76;y<=height-26;y+=48){
      for(let x=32;x<=width-32;x+=48)candidates.push({x,y});
      candidates.push({x:width-32,y});
    }
    let best=null,bestScore=Infinity;
    for(const candidate of candidates){
      const x=Math.max(32,Math.min(width-32,candidate.x)),y=Math.max(28,Math.min(height-28,candidate.y));
      const rect={left:x-26,right:x+26,top:y-26,bottom:y+26};let overlap=0;
      for(const other of occupied)overlap+=Math.max(0,Math.min(rect.right,other.right)-Math.max(rect.left,other.left))*Math.max(0,Math.min(rect.bottom,other.bottom)-Math.max(rect.top,other.top));
      const distance=(x-preferred.x)**2+(y-preferred.y)**2,score=overlap*100000+distance;
      if(score<bestScore){bestScore=score;best={x,y,rect};if(score===0)break;}
    }
    binding.mobileMarker={x:best.x,y:best.y};occupied.push(best.rect);return best;
  }
  function updateHotspots(){
    camera.updateMatrixWorld(true);
    const stageWidth=canvas.clientWidth,stageHeight=canvas.clientHeight,compact=stageWidth<480;
    if(!stageWidth||!stageHeight)return;
    if(connectorLayer){connectorLayer.setAttribute('viewBox',`0 0 ${stageWidth} ${stageHeight}`);connectorLayer.setAttribute('preserveAspectRatio','none');}
    const occupied=compact?compactObstacles(stageWidth,stageHeight):[];
    for(const [index,binding] of hotspotBindings.entries()){
      const point=hotspotPoint(binding.item);if(!point)continue;
      point.project(camera);
      // Keep every answer available while the camera follows moving traffic.
      // An anchored point can briefly leave the frame during a resize or
      // replay; its connector ends at the edge instead of hiding its button.
      const visible=Number.isFinite(point.x)&&Number.isFinite(point.y)&&Number.isFinite(point.z);
      binding.button.hidden=!visible;
      const originX=Math.max(0,Math.min(stageWidth,(point.x+1)*stageWidth/2));
      const originY=Math.max(0,Math.min(stageHeight,(1-point.y)*stageHeight/2));
      const rawOffset=Array.isArray(binding.item.offset)?binding.item.offset:[0,0];
      const dx=Math.max(-.35,Math.min(.35,Number(rawOffset[0])||0));
      const dy=Math.max(-.35,Math.min(.35,Number(rawOffset[1])||0));
      const chosen=compact?compactMarker(binding,index,stageWidth,stageHeight,occupied):null;
      const markerX=compact?chosen.x:Math.max(22,Math.min(stageWidth-22,originX+dx*stageWidth));
      const markerY=compact?chosen.y:Math.max(22,Math.min(stageHeight-22,originY+dy*stageHeight));
      binding.button.style.setProperty('--x',`${markerX/stageWidth*100}%`);
      binding.button.style.setProperty('--y',`${markerY/stageHeight*100}%`);
      if(binding.connector){
        binding.connector.style.display=!visible||(!compact&&!dx&&!dy)?'none':'';
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
      if(connectorLayer){
        connector=document.createElementNS('http://www.w3.org/2000/svg','line');
        connector.setAttribute('stroke','#f4cd63');connector.setAttribute('stroke-width','1.5');connector.setAttribute('stroke-opacity','.8');
        connector.setAttribute('vector-effect','non-scaling-stroke');connectorLayer.append(connector);
      }
      if(buttons[index]){buttons[index].style.minWidth='44px';buttons[index].style.minHeight='44px';}
      return {item,button:buttons[index],connector};
    }).filter(binding=>binding.button);
    updateHotspots();
  }
  function clearHotspots(){hotspotBindings=[];connectorLayer?.remove();connectorLayer=null;}
  // Copenhagen's approximate local sun changes slowly, with no location request or network.
  // Smooth transitions keep the exercise and its markings readable at every time of day.
  const colorNightSky=new T.Color(0x203442),colorDaySky=new T.Color(0x9cb3bb);
  const colorNightAmbient=new T.Color(0x9ab6ca),colorDayAmbient=new T.Color(0xe1e9e2),colorTwilight=new T.Color(0xf2be8e);
  const colorNightGround=new T.Color(0x4b5c60),colorDayGround=new T.Color(0x89938b);
  const colorNightSun=new T.Color(0x93b1ca),colorDaySun=new T.Color(0xffe6c1);
  const colorDayWindow=new T.Color(0x718b8c),colorNightWindow=new T.Color(0xf2c985);
  const colorUnlitLamp=new T.Color(0x9b9e92),colorLitLamp=new T.Color(0xffd487);
  let illumination=null,lightTarget=null,lastLightSample=-Infinity,lastLightFrame=0;
  function updateIllumination(now){
    if(!lightTarget||now-lastLightSample>=30000){lightTarget=getDaylight();lastLightSample=now;}
    if(!illumination){illumination={...lightTarget};lastLightFrame=now;}
    const dt=Math.min(1000,Math.max(0,now-lastLightFrame));lastLightFrame=now;
    const easing=motion?1-Math.exp(-dt/3000):1;
    for(const key of ['day','twilight','altitude'])illumination[key]+=(lightTarget[key]-illumination[key])*easing;
    const delta=((lightTarget.azimuth-illumination.azimuth+Math.PI*3)%(Math.PI*2))-Math.PI;
    illumination.azimuth+=delta*easing;
    const day=Math.max(0,Math.min(1,illumination.day)),night=1-day,twilight=Math.max(0,Math.min(1,illumination.twilight));
    scene.background.copy(colorNightSky).lerp(colorDaySky,day).lerp(colorTwilight,twilight*.1);
    ambient.color.copy(colorNightAmbient).lerp(colorDayAmbient,day).lerp(colorTwilight,twilight*.12);
    ambient.groundColor.copy(colorNightGround).lerp(colorDayGround,day);ambient.intensity=.64+day*.36;
    sun.color.copy(colorNightSun).lerp(colorDaySun,day).lerp(colorTwilight,twilight*.22);sun.intensity=.38+day*.44;
    const altitude=illumination.altitude*Math.PI/180,horizontal=Math.cos(altitude),height=Math.max(.22,Math.sin(altitude));
    sun.position.set(Math.sin(illumination.azimuth)*horizontal*18,height*18,-Math.cos(illumination.azimuth)*horizontal*18);
    renderer.toneMappingExposure=.90+day*.02;
    for(const window of litWindows){window.color.copy(colorDayWindow).lerp(colorNightWindow,night);window.emissiveIntensity=.02+night*.75;}
    for(const lamp of streetLights){lamp.warm.intensity=.08+night*.95;lamp.poolMat.opacity=night*.72;lamp.glass.color.copy(colorUnlitLamp).lerp(colorLitLamp,night);}
    for(const material of pedestrianNightFill)material.emissiveIntensity=.12*night;
    canvas.dataset.judgeDaylight=day.toFixed(3);
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  function frame(now){
    if(disposed)return;
    if(playing){const p=clamp01((now-start)/5500);const eased=1-Math.pow(1-p,3);setProgress(eased);if(p>=1)playing=false;}
    if(corrected?.playing){const p=Math.min(1,(now-corrected.start)/corrected.duration);correctedProgress(p);if(p>=1)corrected.playing=false;}
    if(placing){const p=clamp01((now-placing.start)/placing.duration),eased=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;own.position.x=placing.from.x+(placing.target.x-placing.from.x)*eased;own.position.z=placing.from.z+(placing.target.z-placing.from.z)*eased;own.rotation.y=placing.from.r+(placing.target.r-placing.from.r)*eased;if(p>=1)placing=null;}
    frameCamera();updateHotspots();updateIllumination(now);
    renderer.render(scene,camera);raf=requestAnimationFrame(frame);
  }
  configure(current);setProgress(0);resize();updateIllumination(performance.now());
  requestSurfaceStudies();
  void mountTown();
  addApprovedBystanders();
  void requestModel('car','./assets/models/trafiklab-hatch-lite.glb');
  void requestModel('traffic');
  raf=requestAnimationFrame(frame);
  return {
    setCase(c,autoplay=true){configure(c);if(autoplay)replay();else{playing=false;setProgress(0);}}, replay, replayCorrected, snapshot,
    place, bindHotspots, clearHotspots,
    setMotion(value){
      const hadCorrected=!!corrected;motion=!!value;
      if(hadCorrected){if(!motion){corrected.playing=false;correctedProgress(.46);}else replayCorrected();return;}
      if(!motion){playing=false;if(placedTarget){placing=null;own.position.set(placedTarget.x,0,placedTarget.z);own.rotation.y=placedTarget.r;}else setProgress(1);}else if(!placedTarget)replay();
    },
    dispose(){if(disposed)return;disposed=true;streetKit?.dispose();trafficOccupants?.dispose();trafficOccupants=null;cancelAnimationFrame(raf);observer.disconnect();clearHotspots();for(const image of pendingSurfaceImages){image.onload=null;image.onerror=null;}pendingSurfaceImages.clear();for(const g of geos)g.dispose();for(const m of mats)m.dispose();for(const t of textures)t.dispose();for(const asset of Object.values(details))if(asset)disposeAsset(asset);pedestrianNightFill.clear();sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();},
  };
}



