// Reusable decorative layer. The host owns traffic geometry, actors, sky and lights.
// Positions are in metres: +x east, -z north. No global state or renderer is owned here.
const DEFAULT_GAPS = { junction: [-15.4, -4.6], driveway: [-9.4, -4.6], review: [-18.1, -11.9] };
const PREFABS = ['RedTown', 'ShopTown', 'VillaYellow', 'VillaWood', 'TreeA', 'TreeB', 'Hedge', 'Lamp'];
const clamp = x => Math.min(1, Math.max(0, x));

function placementsFor(variant, lane) {
  const gap = lane?.crossStreet?.bounds || lane?.access?.bounds || lane?.sideStreet?.bounds || DEFAULT_GAPS[variant] || DEFAULT_GAPS.junction;
  const clear = (z, half) => z + half < gap[0] - .4 || z - half > gap[1] + .4;
  const result = [];
  for (const side of [-1, 1]) {
    const houses = variant === 'driveway' ? ['VillaYellow', 'VillaWood'] : ['RedTown', 'ShopTown', 'VillaYellow', 'VillaWood'];
    [-37, -25, 6, 18, 30].forEach((z, i) => {
      if (clear(z, 5.25)) result.push({ key: houses[(i + (side > 0 ? 1 : 0)) % houses.length], x: side * 14.4, z, yaw: side > 0 ? -Math.PI/2 : Math.PI/2 });
    });
    [-43, -31, 12, 24, 36].forEach((z, i) => {
      // Trunks stand beyond the footway; only foliage above head height
      // overhangs it. Trees sit between buildings instead of inside them.
      if (clear(z, 2.4)) result.push({ key: i % 2 ? 'TreeA' : 'TreeB', x: side * 10.6, z, yaw: i * .53 });
    });
    [-38, -25, 2, 15, 28].forEach(z => {
      if (clear(z, 2.2)) result.push({ key: 'Hedge', x: side * 10.35, z, yaw: Math.PI/2 });
    });
    [-34, -21.5, 8, 21].forEach(z => {
      if (clear(z, .9)) result.push({ key: 'Lamp', x: side * 10.35, z, yaw: side > 0 ? 0 : Math.PI });
    });
  }
  return result;
}

function disposeResources(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root.traverse(o => {
    if (o.geometry) geometries.add(o.geometry);
    for (const m of (Array.isArray(o.material) ? o.material : o.material ? [o.material] : [])) {
      materials.add(m);
      for (const v of Object.values(m)) if (v?.isTexture) textures.add(v);
    }
  });
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
}

// Lightweight, fully procedural painted substitute while loading or offline.
// It uses real roofs and trunks; drawings are local canvases rather than a panorama.
function makeFallback(T, placement) {
  const root = new T.Group(); root.name = 'illustrated-environment-fallback';
  const colors = { RedTown: '#9e6856', ShopTown: '#b9a278', VillaYellow: '#b9a278', VillaWood: '#60564c' };
  const mats = new Map();
  const mat = (key, color) => {
    if (!mats.has(key)) mats.set(key, new T.MeshStandardMaterial({ color, roughness: .93 }));
    return mats.get(key);
  };
  function faceTexture(color, villa) {
    const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=256;
    const ctx=canvas.getContext('2d'); ctx.fillStyle=color; ctx.fillRect(0,0,512,256);
    ctx.strokeStyle='rgba(45,43,38,.22)'; ctx.lineWidth=1;
    for(let y=0;y<256;y+=12){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();
      for(let x=(y/12%2)*16;x<512;x+=32){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+12);ctx.stroke();}}
    const cols=villa?3:4; for(let row=0;row<(villa?1:2);row++) for(let col=0;col<cols;col++){
      const x=25+col*(460/cols),y=28+row*112,w=68,h=75;
      ctx.fillStyle='#343d3a';ctx.fillRect(x-3,y-3,w+6,h+6);ctx.fillStyle='#879895';ctx.fillRect(x,y,w,h);
      ctx.strokeStyle='#ded6bd';ctx.lineWidth=5;ctx.strokeRect(x,y,w,h);ctx.beginPath();ctx.moveTo(x+w/2,y);ctx.lineTo(x+w/2,y+h);ctx.moveTo(x,y+26);ctx.lineTo(x+w,y+26);ctx.stroke();
      ctx.fillStyle='#c3b9a6';ctx.fillRect(x-6,y+h+2,w+12,7);
    }
    const t=new T.CanvasTexture(canvas); t.encoding=T.sRGBEncoding; return t;
  }
  const facade={}; for (const [key,color] of Object.entries(colors)) facade[key]=new T.MeshStandardMaterial({ map:faceTexture(color,key.startsWith('Villa')), roughness:.95, side:T.DoubleSide });
  const foliage=document.createElement('canvas'); foliage.width=foliage.height=256; const c=foliage.getContext('2d');
  let seed=12; const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<150;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*.85, x=128+Math.cos(a)*106*r,y=128+Math.sin(a)*86*r;
    c.fillStyle=['#53644e','#6c7b5e','#87906e','#717f60'][Math.floor(rand()*4)];c.beginPath();c.ellipse(x,y,10+rand()*24,8+rand()*16,rand(),0,Math.PI*2);c.fill();}
  const leafTex=new T.CanvasTexture(foliage);leafTex.encoding=T.sRGBEncoding;
  const leaf=new T.MeshStandardMaterial({map:leafTex,alphaTest:.4,side:T.DoubleSide,roughness:1});
  const box=(g,w,h,d,m,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;};
  for(const p of placement){
    const g=new T.Group();g.position.set(p.x,0,p.z);g.rotation.y=p.yaw;root.add(g);
    if (colors[p.key]) {
      const villa=p.key.startsWith('Villa'), w=villa?8.5:p.key==='ShopTown'?10:9, h=villa?3.5:6.4, d=6.8, rise=villa?1.3:1.5;
      box(g,w,h,d,mat(p.key,colors[p.key]),0,h/2,0);
      const front=new T.Mesh(new T.PlaneGeometry(w,h-.1),facade[p.key]);front.position.set(0,h/2,d/2+.02);g.add(front);
      for(const side of [-1,1]){const end=new T.Mesh(new T.PlaneGeometry(d,h-.1),facade[p.key]);end.position.set(side*(w/2+.02),h/2,0);end.rotation.y=side*Math.PI/2;g.add(end);}
      const roof=new T.BufferGeometry();roof.setAttribute('position',new T.Float32BufferAttribute([
        -w/2-.2,h,-d/2-.2,w/2+.2,h,-d/2-.2,w/2+.2,h+rise,0, -w/2-.2,h,-d/2-.2,w/2+.2,h+rise,0,-w/2-.2,h+rise,0,
        -w/2-.2,h+rise,0,w/2+.2,h+rise,0,w/2+.2,h,d/2+.2, -w/2-.2,h+rise,0,w/2+.2,h,d/2+.2,-w/2-.2,h,d/2+.2],3));roof.computeVertexNormals();
      g.add(new T.Mesh(roof,mat('roof',0x665a50)));
      box(g,w+.4,.09,.10,mat('ink',0x343a36),0,h,d/2+.12);
    } else if (p.key.startsWith('Tree')) {
      box(g,.24,3.1,.24,mat('bark',0x62574a),0,1.55,0);
      for(const a of [0,Math.PI/3,2*Math.PI/3]){const crown=new T.Mesh(new T.PlaneGeometry(4.5,3.15),leaf);crown.rotation.y=a;crown.position.y=4.4;g.add(crown);}
    } else if(p.key==='Hedge'){
      box(g,4,.65,.58,mat('hedge',0x61735b),0,.32,0);
    } else {
      box(g,.15,4.35,.15,mat('ink',0x343a36),0,2.175,0);box(g,.8,.1,.12,mat('ink',0x343a36),.4,4.3,0);
      box(g,.48,.14,.3,mat('ink',0x343a36),.83,4.25,0);box(g,.36,.04,.2,mat('lamp',0xeac78e),.83,4.15,0);
    }
  }
  return root;
}

export function createIllustratedEnvironment(T, scene, { variant = 'junction', laneProfile = null, assetUrl = new URL('./assets/environments/danish-illustrated-kit.glb', import.meta.url).href, lodDistance = 40 } = {}) {
  if (!T || !scene) throw new TypeError('Three.js and a parent scene/group are required');
  let disposed=false, source=null, fallback=null, variantName=variant, profile=laneProfile, daylight={day:1}, lastCamera=null, batches=[];
  const parent=new T.Group(); parent.name='illustrated-environment'; scene.add(parent);
  const metrics={ status:'loading', variant:variantName, placements:0, instanceBatches:0, detailDistance:lodDistance, error:null };
  const clearParent=()=>{while(parent.children.length)parent.remove(parent.children[0]);batches=[];};
  const installFallback=()=>{clearParent();if(fallback)disposeResources(fallback);const list=placementsFor(variantName,profile);fallback=makeFallback(T,list);parent.add(fallback);metrics.placements=list.length;metrics.instanceBatches=0;};
  function updateDaylight(state={}) {
    daylight=state; const night=1-clamp(Number.isFinite(state.day)?state.day:1);
    source?.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:o.material?[o.material]:[])){
      if(m.name?.includes('KIT_WINDOW_GLOW')){m.transparent=true;m.depthWrite=false;m.opacity=night*.20;m.emissive?.setHex(0xe8a557);m.emissiveIntensity=.42*night;m.needsUpdate=true;}
      if(m.name?.includes('KIT_LAMP_GLOW')){m.emissive?.setHex(0xffc877);m.emissiveIntensity=1.6*night;m.color?.setHex(night>.2?0xffd898:0xb8beb5);}
    }});
    return night;
  }
  function update(camera) {
    if(disposed || !camera || !source)return;
    lastCamera=camera;camera.updateMatrixWorld();parent.updateMatrixWorld();
    const cp=new T.Vector3();camera.getWorldPosition(cp); const local=new T.Vector3();
    for(const batch of batches) {
      if(!batch.detail)continue;
      batch.items.forEach((p,i)=>{
        local.set(p.x,0,p.z);parent.localToWorld(local);
        const far=Math.hypot(cp.x-local.x,cp.z-local.z)>lodDistance;
        batch.mesh.setMatrixAt(i,far?batch.hidden:batch.matrices[i]);
      });
      batch.mesh.instanceMatrix.needsUpdate=true;
    }
  }
  function installSource() {
    clearParent(); if(fallback){disposeResources(fallback);fallback=null;}
    const list=placementsFor(variantName,profile);metrics.placements=list.length;
    source.updateMatrixWorld(true);
    for(const key of PREFABS){
      const prefab=source.getObjectByName(key); if(!prefab)throw new Error(`Missing environment prefab: ${key}`);
      const items=list.filter(p=>p.key===key); if(!items.length)continue;
      const inverse=new T.Matrix4().copy(prefab.matrixWorld).invert();
      prefab.traverse(child=>{
        if(!child.isMesh)return;
        for(const m of (Array.isArray(child.material)?child.material:[child.material])) if(m.name?.includes('_ALPHA')){
          m.alphaTest=.4;m.transparent=false;m.depthWrite=true;m.side=T.DoubleSide;m.needsUpdate=true;
        }
        const relative=new T.Matrix4().multiplyMatrices(inverse,child.matrixWorld);
        const mesh=new T.InstancedMesh(child.geometry,child.material,items.length); mesh.name=`environment-${key}-${child.name}`;
        mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=true;
        const matrices=items.map((p,i)=>{
          const transform=new T.Matrix4().compose(new T.Vector3(p.x,0,p.z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),p.yaw),new T.Vector3(1,1,1)).multiply(relative);
          mesh.setMatrixAt(i,transform);return transform;
        });
        mesh.instanceMatrix.needsUpdate=true;parent.add(mesh);
        batches.push({mesh,items,matrices,detail:child.name.startsWith('DETAIL'),hidden:new T.Matrix4().makeScale(0,0,0)});
      });
    }
    metrics.instanceBatches=batches.length;updateDaylight(daylight);if(lastCamera)update(lastCamera);
  }
  installFallback();
  const ready=new Promise(resolve=>{
    const load=async()=>{
      if(disposed){resolve({status:'disposed'});return;}
      try {
        if(!T.GLTFLoader)await import('./assets/GLTFLoader-r128.js');
        if(!T.GLTFLoader)throw new Error('GLTFLoader unavailable');
        const loaded=await new T.GLTFLoader().loadAsync(assetUrl);
        if(disposed){disposeResources(loaded.scene);resolve({status:'disposed'});return;}
        source=loaded.scene; installSource();metrics.status='loaded';resolve({status:'loaded'});
      } catch(error) {
        if(source){disposeResources(source);source=null;}
        if(!disposed){installFallback();metrics.status='fallback';metrics.error=String(error?.message||error);}
        resolve({status:disposed?'disposed':'fallback',error:metrics.error});
      }
    };
    // Yield once so the host can show the scene before requesting the optional kit.
    setTimeout(load,0);
  });
  return {
    ready, metrics, update, updateDaylight,
    setVariant(next, lane){if(disposed)return variantName;variantName=DEFAULT_GAPS[next]?next:'junction';profile=lane||null;metrics.variant=variantName;if(source)installSource();else installFallback();return variantName;},
    dispose(){if(disposed)return;disposed=true;metrics.status='disposed';clearParent();scene.remove(parent);if(fallback)disposeResources(fallback);if(source)disposeResources(source);fallback=null;source=null;}
  };
}
