import {createStreetKit, PEOPLE_CSE, STREET_STUDY_SHA256} from './street-kit.js';
import {attachCylindricalBillboard} from './cylindrical-billboard.js';
// The first playable junction uses the approved study in its original metres.
// This adapter makes only the documented gameplay changes in memory; the GLB
// itself and the frozen Blender study remain untouched.
export const JUNCTION_STUDY_SHA256 = '8c21857248bd10487df9305d0f948b0e4b547c6a6297c4676105aa0eb14faa00';
const URL_OF_STUDY = new URL('./assets/environments/study-town-dusk-comparison.glb', import.meta.url).href;
const RELOCATED_RIDERS = Object.freeze([{ id: 'b_cyclist', from: -2, to: -30 }, { id: 'c_cyclist', from: -22, to: -33 }]);

export function junctionCycleHeight(z) {
  if (z >= -4) return .28;
  if (z > -4.9) return .1225 + (z + 4.9) / .9 * .1575;
  if (z >= -13.1) return .1225;
  if (z > -13.8) return .1225 + (-13.1 - z) / .7 * .1575;
  return .28;
}

export function junctionCyclePose(z) {
  const front = junctionCycleHeight(z - .65), rear = junctionCycleHeight(z + .65);
  return { height: (front + rear) / 2, pitch: Math.atan2(front - rear, 1.3) };
}

// Raised grey track, lowered smoothly at the T-junction crossing.
export function transferCycleHeight(variant,z) {
  if(variant!=='review')return .18;
  if(z<=-19.1||z>=-10.9)return .18;
  if(z<-18.1)return .18-(z+19.1)*.118;
  if(z<=-11.9)return .062;
  return .062+(z+11.9)*.118;
}
export function transferCarHeight(variant,x,west,east) {
  const ramp=v=>Math.max(0,Math.min(1,v));
  return (variant==='driveway'?.18:.062)*Math.min(ramp(x-(west-1)),ramp((east+1)-x));
}
export function transferCyclePose(variant,z) {
  const front=transferCycleHeight(variant,z-.65),rear=transferCycleHeight(variant,z+.65);
  return {height:(front+rear)/2,pitch:Math.atan2(front-rear,1.3)};
}

function disposeGraph(group) {
  if (!group) return;
  const geometries = new Set(), materials = new Set(), textures = new Set();
  group.traverse(o => {
    if (o.geometry) geometries.add(o.geometry);
    for (const m of (Array.isArray(o.material) ? o.material : o.material ? [o.material] : [])) {
      materials.add(m);
      for (const value of Object.values(m)) if (value?.isTexture) textures.add(value);
    }
  });
  if (group.parent) group.parent.remove(group);
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
}

function convertMaterials(T, root) {
  const converted = new Map(), missingMaps = [], oldMaterials = new Set();
  root.traverse(o => {
    if (o.isLight) { o.visible = false; return; }
    if (!o.isMesh) return;
    const convert = m => {
      if (!m || converted.has(m)) return converted.get(m) || m;
      const expectsMap = m.name.startsWith('illustrated texture') || m.name.includes('approved CSE person')
        || m.name === 'WEB_FIGMA_ASPHALT_APPROX' || m.name === 'WEB_MULTIPLY_CONTACT'
        || m.name.startsWith('WEB_BAKED_WALL_') || m.name.startsWith('WEB_BAKED_CONTACT_SHADOW')
        || m.name.startsWith('WEB_BAKED_LAMP');
      const imageMap = m.name === 'illustrated texture sky' ? (m.emissiveMap || m.map) : m.map;
      const image = imageMap?.image;
      if (expectsMap && (!image || !(image.naturalWidth || image.width) || !(image.naturalHeight || image.height))) {
        missingMaps.push(m.name);
        const warning = new T.MeshBasicMaterial({ name: 'MISSING_MAP_' + m.name, color: 0xff00ff, side: T.DoubleSide });
        converted.set(m, warning); oldMaterials.add(m); return warning;
      }
      if (imageMap) { imageMap.encoding = T.sRGBEncoding; imageMap.premultiplyAlpha = false; imageMap.needsUpdate = true; }
      let n = m;
      if (m.name.startsWith('WEB_BAKED_TONE') || m.name.startsWith('WEB_FLAT_')) {
        n = new T.MeshBasicMaterial({ name: m.name, color: m.color, map: m.map, vertexColors: m.name.startsWith('WEB_BAKED_TONE'), side: T.DoubleSide });
      } else if (m.name.startsWith('WEB_BAKED_WALL_')) {
        n = new T.MeshBasicMaterial({ name: m.name, map: m.map, color: 0xffffff, side: T.DoubleSide });
      } else if (m.name === 'WEB_FIGMA_ASPHALT_APPROX') {
        n = new T.MeshBasicMaterial({ name: m.name, map: m.map, color: 0x4e5659, side: T.DoubleSide });
      } else if (m.name === 'illustrated texture sky') {
        n = new T.MeshBasicMaterial({ name: m.name, map: m.emissiveMap || m.map, color: 0xffffff, side: T.DoubleSide });
      } else if (m.name === 'shelter glass') {
        n = new T.MeshBasicMaterial({ name: m.name, color: 0x526c70, opacity: .28, transparent: true, depthWrite: false, side: T.DoubleSide });
      } else if (m.name === 'WEB_MULTIPLY_CONTACT') {
        n = new T.MeshBasicMaterial({ name: m.name, map: m.map, transparent: true, depthWrite: false, side: T.DoubleSide,
          premultipliedAlpha: true, blending: T.CustomBlending, blendEquation: T.AddEquation,
          blendSrc: T.DstColorFactor, blendDst: T.OneMinusSrcAlphaFactor });
      } else if (m.name.includes('WEB_BAKED_CONTACT_SHADOW') || m.name.includes('WEB_BAKED_LAMP')) {
        n = new T.MeshBasicMaterial({ name: m.name, map: m.map, transparent: true, depthWrite: false, side: T.DoubleSide });
      } else if (m.name.startsWith('illustrated texture') || m.name.includes('approved CSE person')) {
        n = new T.MeshBasicMaterial({ name: m.name, map: m.map, color: m.name === 'illustrated texture shop' ? 0xffffff : 0x839199,
          alphaTest: .35, side: T.DoubleSide });
      }
      converted.set(m, n); if (n !== m) oldMaterials.add(m); return n;
    };
    o.material = Array.isArray(o.material) ? o.material.map(convert) : convert(o.material);
  });
  oldMaterials.forEach(m => m.dispose());
  if (missingMaps.length) throw new Error('Study image maps missing: ' + [...new Set(missingMaps)].join(', '));
  return { materials: converted.size, missingMaps };
}

// Copy only referenced vertices so repeated frontage keeps the study's UVs,
// baked vertex colours and roof/detail geometry without duplicating whole meshes.
function compactWorldSubset(T, object, selected) {
  const source = object.geometry, remap = new Map(), originals = [], indices = [];
  for (const id of selected) {
    if (!remap.has(id)) { remap.set(id, originals.length); originals.push(id); }
    indices.push(remap.get(id));
  }
  const geometry = new T.BufferGeometry();
  for (const [name, attr] of Object.entries(source.attributes)) {
    if (attr.isInterleavedBufferAttribute) throw new Error('Unexpected interleaved study geometry');
    const copy = new attr.array.constructor(originals.length * attr.itemSize);
    originals.forEach((id, i) => { for (let j = 0; j < attr.itemSize; j += 1) copy[i * attr.itemSize + j] = attr.array[id * attr.itemSize + j]; });
    geometry.setAttribute(name, new T.BufferAttribute(copy, attr.itemSize, attr.normalized));
  }
  geometry.setIndex(indices); geometry.applyMatrix4(object.matrixWorld); geometry.computeBoundingSphere();
  return geometry;
}

// Batch only opaque, unskinned study meshes with the *same material object*
// and rendering flags. Transparency/cutouts retain their original draw order.
// Rear instances are expanded in near-first order; their existing shoulder
// selection becomes an index draw range and overhead keeps every instance.
function batchOpaque(T, parent, candidates, rear = false) {
  parent.updateWorldMatrix(true,true);
  const groups=new Map(),inverse=new T.Matrix4().copy(parent.matrixWorld).invert(),removed=new Set(),metrics=[];
  for(const object of candidates){
    const material=object?.material,geometry=object?.geometry;
    if(!object?.isMesh||!object.visible||object.isSkinnedMesh||object.instanceColor||Array.isArray(material)||!material||!geometry?.attributes?.position
      ||material.transparent||material.alphaTest>0||material.opacity!==1||!material.depthWrite||material.blending!==T.NormalBlending
      ||Object.keys(geometry.morphAttributes||{}).length||geometry.attributes.position.isInterleavedBufferAttribute)continue;
    // These source transforms produced measurable edge-pixel differences in
    // matched-view QA. Leave them as the original drawables.
    if((!rear&&material.name==='WEB_BAKED_TONE_APPROX')
      ||(!rear&&material.name==='WEB_FIGMA_ASPHALT_APPROX'&&object.name==='WEB_GROUP_001')
      ||(rear&&material.name==='WEB_BAKED_TONE_APPROX'&&object.name.startsWith('FUNCTIONAL_REAR_CREAM_'))
      // The small symbol has many triangles but is often outside the camera.
      // Keeping it separate retains its own frustum culling.
      ||(rear&&object.name==='FUNCTIONAL_REAR_CYCLE_SYMBOL'))continue;
    const key=[material.uuid,object.renderOrder,object.castShadow,object.receiveShadow,object.layers.mask].join(':');
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(object);
  }
  const selectedIndices=geometry=>{
    const count=geometry.index?.count??geometry.attributes.position.count,start=Math.max(0,geometry.drawRange.start||0);
    const length=Math.max(0,Math.min(count-start,Number.isFinite(geometry.drawRange.count)?geometry.drawRange.count:count));
    if(length%3)throw new Error('Non-triangle draw range');
    return Array.from({length},(_,i)=>geometry.index?geometry.index.getX(start+i):start+i);
  };
  const part=(object,matrix)=>{
    const source=object.geometry,selected=selectedIndices(source),remap=new Map(),vertices=[],indices=[];
    for(const id of selected){if(!remap.has(id)){remap.set(id,vertices.length);vertices.push(id);}indices.push(remap.get(id));}
    const geometry=new T.BufferGeometry();
    for(const [name,attr] of Object.entries(source.attributes)){
      if(attr.isInterleavedBufferAttribute||attr.count!==source.attributes.position.count)throw new Error('Unsupported attribute layout');
      const values=new attr.array.constructor(vertices.length*attr.itemSize);
      vertices.forEach((id,i)=>{for(let j=0;j<attr.itemSize;j+=1)values[i*attr.itemSize+j]=attr.array[id*attr.itemSize+j];});
      geometry.setAttribute(name,new T.BufferAttribute(values,attr.itemSize,attr.normalized));
    }
    geometry.setIndex(indices);geometry.applyMatrix4(matrix);return geometry;
  };
  const combine=parts=>{
    const specs=new Map();let vertices=0,indices=0;
    for(const p of parts){vertices+=p.attributes.position.count;indices+=p.index.count;
      for(const [name,a] of Object.entries(p.attributes)){const s=specs.get(name),next={size:a.itemSize,normalized:a.normalized,ctor:a.array.constructor};
        if(s&&(s.size!==next.size||s.normalized!==next.normalized||s.ctor!==next.ctor))throw new Error('Incompatible attribute formats');if(!s)specs.set(name,next);}}
    // Avoid requiring the optional WebGL1 32-bit-index extension on phones.
    if(vertices>65535)throw new Error('Batch would need 32-bit indices');
    const geometry=new T.BufferGeometry();
    for(const [name,s] of specs){const values=new s.ctor(vertices*s.size);let offset=0;
      for(const p of parts){const a=p.attributes[name],n=p.attributes.position.count;
        if(a)values.set(a.array,offset*s.size);
        else if(name==='color'){const white=s.normalized&&s.ctor!==Float32Array?(s.ctor===Uint8Array?255:65535):1;values.fill(white,offset*s.size,(offset+n)*s.size);}
        else if(name==='normal')for(let i=0;i<n;i+=1)values[(offset+i)*s.size+1]=1;
        offset+=n;}
      geometry.setAttribute(name,new T.BufferAttribute(values,s.size,s.normalized));}
    const merged=new Uint16Array(indices);let vo=0,io=0;
    for(const p of parts){for(let i=0;i<p.index.count;i+=1)merged[io++]=p.index.getX(i)+vo;vo+=p.attributes.position.count;}
    geometry.setIndex(new T.BufferAttribute(merged,1));geometry.computeBoundingSphere();return geometry;
  };
  for(const objects of groups.values()){
    if(objects.length<2)continue;
    const near=[],far=[];let merged=null;
    try{
      for(const object of objects){
        const relative=new T.Matrix4().multiplyMatrices(inverse,object.matrixWorld),full=object.isInstancedMesh?(object.userData.fullCount??object.count):1;
        const shoulder=rear&&object.isInstancedMesh?(object.userData.shoulderCount??full):full;
        for(let i=0;i<full;i+=1){const matrix=relative.clone();if(object.isInstancedMesh){const instance=new T.Matrix4();object.getMatrixAt(i,instance);matrix.multiply(instance);}
          (i<shoulder?near:far).push(part(object,matrix));}
      }
      const nearIndices=near.reduce((n,p)=>n+p.index.count,0);merged=combine([...near,...far]);
      const first=objects[0],mesh=new T.Mesh(merged,first.material);mesh.name=first.material.name==='illustrated texture sky'?'WEB_GROUP_026':`BATCHED_${rear?'REAR':'STUDY'}_${first.material.name}`;
      mesh.renderOrder=first.renderOrder;mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;mesh.layers.mask=first.layers.mask;
      mesh.frustumCulled=!rear;mesh.userData.batchShoulderIndices=nearIndices;mesh.userData.batchAllIndices=merged.index.count;
      if(rear)merged.setDrawRange(0,nearIndices);
      parent.add(mesh);
      for(const object of objects){if(object.parent)object.parent.remove(object);removed.add(object.geometry);}
      const bytes=Object.values(merged.attributes).reduce((n,a)=>n+a.array.byteLength,0)+merged.index.array.byteLength;
      metrics.push({material:first.material.name,objects:objects.length,drawables:1,vertices:merged.attributes.position.count,indices:merged.index.count,shoulderIndices:nearIndices,bytes});
    }catch(error){if(merged)merged.dispose();metrics.push({material:objects[0].material.name,objects:objects.length,skipped:String(error?.message||error)});}
    finally{for(const geometry of [...near,...far])geometry.dispose();}
  }
  const live=new Set();parent.traverse(o=>{if(o.geometry)live.add(o.geometry);});for(const geometry of removed)if(!live.has(geometry))geometry.dispose();
  return metrics;
}

function createRearStreet(T, root, asphalt) {
  const group = new T.Group(); group.name = 'FUNCTIONAL_REAR_STREET';
  const theta = -Math.PI / 2;
  const placements = {
    shop: [{x:-1.725,z:6-10.2,yaw:theta},{x:3.725,z:8+10.2,yaw:-theta}, ...[34,60].map(z => ({x:-1.725,z:z-10.2,yaw:theta})), {x:3.725,z:40+10.2,yaw:-theta}],
    red: [{x:-1.725,z:16+10,yaw:theta},{x:3.725,z:18-10,yaw:-theta},{x:-1.725,z:44+10,yaw:theta},{x:3.725,z:49-10,yaw:-theta}],
    cream: [{x:-2.3,z:24+17,yaw:theta},{x:4.3,z:29-17,yaw:-theta},{x:-2.3,z:52+17,yaw:theta}],
    tree: [{x:-4.75,z:12-16,yaw:theta},{x:7,z:7+16,yaw:-theta},{x:7,z:19+16,yaw:-theta}, ...[33,43,54,65].map(z => ({x:-4.75,z:z-16,yaw:theta})), ...[31,43].map(z => ({x:7,z:z+16,yaw:-theta}))]
  };
  const shoulderCounts = { shop:2, red:2, cream:2, tree:3 };
  const ranges = {
    shop: { x: [5.25,15.3], z: [-21.15,-12.35], wall: 'WEB_BAKED_WALL_1', image: 'illustrated texture shop' },
    red: { x: [-15.15,-4.8], z: [-21.15,-12.35], wall: 'WEB_BAKED_WALL_0', image: 'illustrated texture red' },
    cream: { x: [-19.8,-14.3], z: [-20.7,-13.3], wall: 'WEB_BAKED_WALL_2' },
    tree: { x: [14.2,18.2], z: [-18.2,-10.8], image: 'illustrated texture tree-alt' }
  };
  const counts = { shop: 0, red: 0, cream: 0, tree: 0, pavement: 0, kerb: 0, cycleSymbol: 0 };
  let pavingGeometry = null, kerbGeometry = null, pavingMaterial = null, hedgeMaterial = null;
  const near = (v, values) => values.some(x => Math.abs(v - x) < .003);
  const within = (p, r, includeGround) => p.x >= r.x[0] && p.x <= r.x[1] && p.z >= r.z[0] && p.z <= r.z[1] && (includeGround || p.y >= .18);
  const placement = (x, z, yaw = 0) => new T.Matrix4().compose(new T.Vector3(x, 0, z), new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), yaw), new T.Vector3(1, 1, 1));
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isMesh || !o.geometry?.index || !o.geometry.attributes.position) return;
    for (let p = o; p; p = p.parent) if (/^WEB_(ACTOR|CONTACT)_/.test(p.name)) return;
    const material = Array.isArray(o.material) ? null : o.material, name = material?.name || '';
    if (name === 'illustrated texture hedge') hedgeMaterial = material;
    const generic = name === 'WEB_BAKED_TONE_APPROX' || name.startsWith('WEB_FLAT_');
    const candidates = Object.entries(ranges).filter(([id,r]) => generic || name === r.wall || name === r.image).map(([id]) => id);
    const inspectSurface = o.name === 'WEB_GROUP_000' && name === 'WEB_BAKED_TONE_APPROX';
    if (!candidates.length && !inspectSurface) return;
    const source = o.geometry, pos = source.attributes.position, index = source.index;
    const selected = Object.fromEntries(candidates.map(id => [id, []])); const pavement = [], kerb = [], cycleSymbol = [];
    for (let i = 0; i < index.count; i += 3) {
      const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
      const vertices = ids.map(id => new T.Vector3().fromBufferAttribute(pos, id).applyMatrix4(o.matrixWorld));
      for (const id of candidates) {
        const r = ranges[id];
        if (vertices.every(v => within(v, r, name === r.wall))) selected[id].push(...ids);
      }
      if (inspectSurface) {
        if (vertices.every(v => near(v.x,[5.8,7.5]) && near(v.y,[0,.2]) && near(v.z,[-4,20]))) pavement.push(...ids);
        if (vertices.every(v => near(v.x,[4.1,4.24]) && near(v.y,[.1,.3]) && near(v.z,[-4,20]))) kerb.push(...ids);
        if (vertices.every(v => v.x>=4.68 && v.x<=5.32 && v.y>=.124 && v.y<=.176 && v.z>=-8.92 && v.z<=-7.48)) cycleSymbol.push(...ids);
      }
    }
    for (const [id, ids] of Object.entries(selected)) if (ids.length) {
      const geometry = compactWorldSubset(T, o, ids), instances = new T.InstancedMesh(geometry, material, placements[id].length);
      placements[id].forEach((p,i) => instances.setMatrixAt(i, placement(p.x,p.z,p.yaw)));
      instances.userData.fullCount=placements[id].length;instances.userData.shoulderCount=shoulderCounts[id];
      instances.instanceMatrix.needsUpdate = true; instances.frustumCulled = false; instances.name = `FUNCTIONAL_REAR_${id.toUpperCase()}_${o.name}`;
      group.add(instances); counts[id] += ids.length / 3;
    }
    if (pavement.length) { pavingGeometry = compactWorldSubset(T,o,pavement); pavingMaterial = material; counts.pavement += pavement.length / 3; }
    if (kerb.length) { kerbGeometry = compactWorldSubset(T,o,kerb); pavingMaterial = material; counts.kerb += kerb.length / 3; }
    if (cycleSymbol.length) { const symbol = new T.Mesh(compactWorldSubset(T,o,cycleSymbol),material);symbol.position.set(0,.1575,24.7);
      symbol.name='FUNCTIONAL_REAR_CYCLE_SYMBOL';group.add(symbol);counts.cycleSymbol += cycleSymbol.length / 3; }
  });
  if (!pavingGeometry || !kerbGeometry || !hedgeMaterial || counts.pavement !== 12 || counts.kerb !== 12
    || !counts.shop || !counts.red || !counts.cream || !counts.tree || !counts.cycleSymbol) throw new Error('Study street kit missing: ' + JSON.stringify(counts));
  const pavingPlacements = [];
  for (const dz of [24,48]) for (const dx of [0,1.7,3.4,5.1]) pavingPlacements.push({x:dx,z:dz});
  const pavers = new T.InstancedMesh(pavingGeometry, pavingMaterial, pavingPlacements.length);
  pavingPlacements.forEach((p,i) => pavers.setMatrixAt(i,placement(p.x,p.z))); pavers.instanceMatrix.needsUpdate = true; pavers.frustumCulled = false; pavers.name = 'FUNCTIONAL_REAR_PAVEMENT'; group.add(pavers);
  pavers.userData.fullCount=pavingPlacements.length;pavers.userData.shoulderCount=4;
  // A short paved forecourt starts behind the driver so the parked bikes are
  // grounded without repainting the approved forward-facing junction.
  const nearForecourt = pavingGeometry.clone(), pp = nearForecourt.attributes.position;
  for (let i=0;i<pp.count;i+=1) pp.setZ(i, pp.getZ(i)<8 ? 13 : 20);
  pp.needsUpdate = true; nearForecourt.computeBoundingSphere();
  const nearPavers = new T.InstancedMesh(nearForecourt,pavingMaterial,3);
  [1.7,3.4,5.1].forEach((x,i)=>nearPavers.setMatrixAt(i,placement(x,0))); nearPavers.instanceMatrix.needsUpdate = true; nearPavers.frustumCulled = false; nearPavers.name='FUNCTIONAL_REAR_FORECOURT';group.add(nearPavers);
  const kerbs = new T.InstancedMesh(kerbGeometry,pavingMaterial,5);
  [[0,24],[1.63,0],[1.63,24],[0,48],[1.63,48]].forEach(([x,z],i)=>kerbs.setMatrixAt(i,placement(x,z)));
  kerbs.userData.fullCount=5;kerbs.userData.shoulderCount=3;
  kerbs.instanceMatrix.needsUpdate=true;kerbs.frustumCulled=false;kerbs.name='FUNCTIONAL_REAR_KERBS';group.add(kerbs);
  const joints=new T.InstancedMesh(new T.BoxGeometry(5.1,.008,.025),new T.MeshBasicMaterial({color:0x3f4741}),19);
  for(let i=0;i<19;i+=1){const tile=new T.Object3D();tile.position.set(9.15,.204,13.7+i*3);tile.updateMatrix();joints.setMatrixAt(i,tile.matrix);}
  joints.instanceMatrix.needsUpdate=true;joints.frustumCulled=false;joints.name='FUNCTIONAL_REAR_PAVER_JOINTS';group.add(joints);
  joints.userData.fullCount=19;joints.userData.shoulderCount=5;
  // In the side view, retain the same painted asphalt but lift its tone so the
  // raised path is distinguishable from the adjacent motor-vehicle road.
  const cycleGeometry=new T.BufferGeometry(),cyclePoints=[4.2,.283,-4,5.8,.283,-4,5.8,.283,68,4.2,.283,68],cycleUv=[];
  for(let i=0;i<cyclePoints.length;i+=3)cycleUv.push(cyclePoints[i]*.76,1+cyclePoints[i+2]*.76);
  cycleGeometry.setAttribute('position',new T.Float32BufferAttribute(cyclePoints,3));cycleGeometry.setAttribute('uv',new T.Float32BufferAttribute(cycleUv,2));cycleGeometry.setIndex([0,1,2,0,2,3]);
  const cycleMaterial=asphalt.clone();cycleMaterial.name='FUNCTIONAL_RAISED_TRACK_ASPHALT';cycleMaterial.color.setHex(0x667374);
  const cycleTone=new T.Mesh(cycleGeometry,cycleMaterial);cycleTone.name='FUNCTIONAL_RAISED_TRACK_TONE';group.add(cycleTone);

  // The same alpha-cut painted hedge as the approved study fronts a low core.
  const hedgeZ = [12.5,22,33,40,50,59], hedgeX = [9.4,11.0,9.4,9.4,9.4,9.4], hedgeCore = new T.MeshBasicMaterial({color:0x253a2c});
  const hedges = new T.InstancedMesh(new T.BoxGeometry(.5,.75,3.1),hedgeCore,hedgeZ.length);
  const hedgeGeometry=new T.PlaneGeometry(3.25,1.0),huv=hedgeGeometry.attributes.uv;
  for(let i=0;i<huv.count;i+=1)huv.setY(i,.77-huv.getY(i)*.54);
  const cards = new T.InstancedMesh(hedgeGeometry,hedgeMaterial,hedgeZ.length*2);
  hedgeZ.forEach((z,i)=>{const core=new T.Object3D();core.position.set(hedgeX[i],.575,z);core.updateMatrix();hedges.setMatrixAt(i,core.matrix);
    for(const [side,dx] of [-.28,.28].entries()){const card=new T.Object3D();card.position.set(hedgeX[i]+dx,.69,z);card.rotation.y=Math.PI/2;card.updateMatrix();cards.setMatrixAt(i*2+side,card.matrix);}});
  hedges.instanceMatrix.needsUpdate=true;cards.instanceMatrix.needsUpdate=true;hedges.frustumCulled=false;cards.frustumCulled=false;
  hedges.userData.fullCount=hedgeZ.length;hedges.userData.shoulderCount=2;cards.userData.fullCount=hedgeZ.length*2;cards.userData.shoulderCount=4;
  hedges.name='FUNCTIONAL_REAR_HEDGE_CORES';cards.name='FUNCTIONAL_REAR_PAINTED_HEDGES';group.add(hedges,cards);
  const topCards=new T.InstancedMesh(hedgeGeometry,hedgeMaterial,hedgeZ.length),endGeometry=new T.PlaneGeometry(.58,1),endUv=endGeometry.attributes.uv;
  for(let i=0;i<endUv.count;i+=1)endUv.setY(i,.77-endUv.getY(i)*.54);
  const endCards=new T.InstancedMesh(endGeometry,hedgeMaterial,hedgeZ.length*2);
  hedgeZ.forEach((z,i)=>{const top=new T.Object3D();top.position.set(hedgeX[i],.965,z);top.rotation.set(-Math.PI/2,0,Math.PI/2);top.updateMatrix();topCards.setMatrixAt(i,top.matrix);
    for(const [j,dz] of [-1.58,1.58].entries()){const end=new T.Object3D();end.position.set(hedgeX[i],.69,z+dz);end.updateMatrix();endCards.setMatrixAt(i*2+j,end.matrix);}});
  topCards.instanceMatrix.needsUpdate=true;endCards.instanceMatrix.needsUpdate=true;topCards.frustumCulled=false;endCards.frustumCulled=false;
  topCards.userData.fullCount=hedgeZ.length;topCards.userData.shoulderCount=2;endCards.userData.fullCount=hedgeZ.length*2;endCards.userData.shoulderCount=4;
  topCards.name='FUNCTIONAL_REAR_HEDGE_TOPS';endCards.name='FUNCTIONAL_REAR_HEDGE_ENDS';group.add(topCards,endCards);

  root.add(group);
  return { templates: counts, placements, cycleTrack: {x:[4.2,5.8],z:[20,68]}, footway: {x:[5.8,7.5],z:[20,68]},
    frontageWestX:11.5, cameraCorridor:{x:[9.5,10.8],z:[23.6,29]}, hedgeZ, hedgeX, bikes:[], removedUnapprovedBikeProps:2, shoulderInstanceLod:true };
}

function adaptGeometry(T, root) {
  root.updateMatrixWorld(true);
  const hiddenGroups = ['WEB_ACTOR_CAR', 'WEB_CONTACT_CAR', 'WEB_ACTOR_FOREGROUND_CYCLIST', 'WEB_CONTACT_FOREGROUND_CYCLIST'];
  for (const name of hiddenGroups) {
    const group = root.getObjectByName(name);
    if (!group || !group.children.length) throw new Error('Required study actor group missing: ' + name);
    group.visible = false;
  }
  const actorCounts = Object.fromEntries(RELOCATED_RIDERS.map(r => [r.id, 0]));
  const shadowCounts = Object.fromEntries(RELOCATED_RIDERS.map(r => [r.id, 0]));
  let asphalt = null, removedTrackTriangles = 0, skyExtension = null;
  root.traverse(o => {
    if (!o.isMesh || !o.geometry?.attributes?.position) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const materialName = mats[0]?.name || '';
    if (materialName === 'illustrated texture sky') {
      const positions = o.geometry.attributes.position, uv = o.geometry.attributes.uv, top = [], bottom = [];
      for (let i = 0; i < positions.count; i += 1) {
        const p = new T.Vector3().fromBufferAttribute(positions, i).applyMatrix4(o.matrixWorld);
        if (p.y > 33.9) top.push({ p, u: uv.getX(i), v: uv.getY(i) });
        if (p.y < -2.9) bottom.push({ p, u: uv.getX(i), v: uv.getY(i) });
      }
      if (top.length !== 2 || bottom.length !== 2) throw new Error('Study sky edge is missing');
      top.sort((a,b)=>a.p.x-b.p.x);bottom.sort((a,b)=>a.p.x-b.p.x);
      const [a,b]=top,[c,d]=bottom;skyExtension=new T.Group();skyExtension.name='FUNCTIONAL_SKY_EXTENSION';
      const quad=(x0,x1,y0,y1,u0,u1,v0,v1)=>{const geometry=new T.BufferGeometry();
        geometry.setAttribute('position',new T.Float32BufferAttribute([x0,y0,a.p.z,x1,y0,a.p.z,x1,y1,a.p.z,x0,y1,a.p.z],3));
        geometry.setAttribute('uv',new T.Float32BufferAttribute([u0,v0,u1,v0,u1,v1,u0,v1],2));geometry.setIndex([0,1,2,0,2,3]);skyExtension.add(new T.Mesh(geometry,mats[0]));};
      // Extend only the image's own boundary pixels. The original sky plane,
      // and hence its exact forward composition, remains unchanged.
      quad(-600,a.p.x,c.p.y,a.p.y,a.u,a.u,c.v,a.v);quad(b.p.x,600,d.p.y,b.p.y,b.u,b.u,d.v,b.v);
      quad(a.p.x,b.p.x,a.p.y,120,a.u,b.u,a.v,b.v);quad(-600,a.p.x,a.p.y,120,a.u,a.u,a.v,a.v);quad(b.p.x,600,b.p.y,120,b.u,b.u,b.v,b.v);
    }
    for (const rider of RELOCATED_RIDERS) if (mats.some(m => m?.name === 'approved CSE person ' + rider.id)) {
      const parent = o.parent, a = parent.worldToLocal(new T.Vector3(0, 0, 0)), b = parent.worldToLocal(new T.Vector3(0, 0, rider.to - rider.from));
      o.position.add(b.sub(a)); actorCounts[rider.id] += 1;
    }
    // The six study people are individual planes whose vertices were exported in
    // scene coordinates. Recenter each on its feet and undo its baked yaw before
    // enabling camera-facing rotation. Their independently baked ground shadows
    // remain in the original, unmoving geometry.
    if (mats.some(m => m?.name?.startsWith('approved CSE person '))) {
      const source=o.geometry, clone=source.clone(), pos=clone.attributes.position;
      clone.computeBoundingBox();const bounds=clone.boundingBox, pivot=new T.Vector3((bounds.min.x+bounds.max.x)/2,bounds.min.y,(bounds.min.z+bounds.max.z)/2);
      let best=-1,dx=0,dz=0;
      for(let i=0;i<pos.count;i++)for(let j=i+1;j<pos.count;j++){
        const x=pos.getX(j)-pos.getX(i),z=pos.getZ(j)-pos.getZ(i),distance=x*x+z*z;
        if(distance>best){best=distance;dx=x;dz=z;}
      }
      if(best<1e-8)throw new Error('Approved person card has no horizontal width');
      let yaw=Math.atan2(-dz,dx);
      clone.translate(-pivot.x,-pivot.y,-pivot.z);clone.rotateY(-yaw);
      // Match the helper's +Z front to the original triangle winding without
      // changing UVs: a half-turn of geometry and pivot cancels in world space.
      const index=clone.index,attribute=clone.attributes.position;
      const a=new T.Vector3().fromBufferAttribute(attribute,index?index.getX(0):0);
      const b=new T.Vector3().fromBufferAttribute(attribute,index?index.getX(1):1);
      const c=new T.Vector3().fromBufferAttribute(attribute,index?index.getX(2):2);
      const front=b.sub(a).cross(c.sub(a)).normalize();
      if(Math.abs(front.z)<.999)throw new Error('Approved person card is not an upright plane');
      if(front.z<0){clone.rotateY(Math.PI);yaw+=Math.PI;}
      o.position.add(pivot);o.rotation.y=yaw;o.geometry=clone;source.dispose();
      attachCylindricalBillboard(T,o);
    }
    if (mats.some(m => m?.name === 'WEB_MULTIPLY_CONTACT' || m?.name === 'WEB_BAKED_CONTACT_SHADOW')
      && !hiddenGroups.some(name => { for (let p = o; p; p = p.parent) if (p.name === name) return true; return false; })) {
      const source = o.geometry, clone = source.clone(), pos = clone.attributes.position;
      const inverse = new T.Matrix4().copy(o.matrixWorld).invert(); let changed = false;
      for (let i = 0; i < pos.count; i += 1) {
        const p = new T.Vector3().fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        const rider = RELOCATED_RIDERS.find(r => p.x >= 4.2 && p.x <= 5.8 && p.y > .27 && Math.abs(p.z - r.from) < 1);
        if (!rider) continue;
        p.z += rider.to - rider.from; p.applyMatrix4(inverse); pos.setXYZ(i, p.x, p.y, p.z);
        shadowCounts[rider.id] += 1; changed = true;
      }
      if (changed) { o.geometry = clone; source.dispose(); pos.needsUpdate = true; clone.computeBoundingSphere(); clone.computeBoundingBox(); }
      else clone.dispose();
    }
    if (!mats.some(m => m?.name === 'WEB_FIGMA_ASPHALT_APPROX') || !o.geometry.index) return;
    const source = o.geometry, pos = source.attributes.position, index = source.index, kept = [];
    for (let i = 0; i < index.count; i += 3) {
      const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
      const vertices = ids.map(id => new T.Vector3().fromBufferAttribute(pos, id).applyMatrix4(o.matrixWorld));
      const oldFarTrack = vertices.every(v => v.x >= 4.19 && v.x <= 5.81 && v.y >= .199 && v.y <= .281 && v.z >= -35.01 && v.z <= -12.99);
      if (oldFarTrack) removedTrackTriangles += 1; else kept.push(...ids);
    }
    if (kept.length !== index.count) {
      const clone = source.clone(); clone.setIndex(kept); o.geometry = clone; source.dispose(); asphalt = mats.find(m => m?.name === 'WEB_FIGMA_ASPHALT_APPROX');
    }
  });
  if (removedTrackTriangles !== 12 || !asphalt || RELOCATED_RIDERS.some(r => actorCounts[r.id] !== 1 || shadowCounts[r.id] !== 12)) {
    throw new Error('Unexpected study layout: ' + JSON.stringify({ removedTrackTriangles, actorCounts, shadowCounts }));
  }
  // Top of each small replacement surface follows the same world-projected
  // asphalt texture as the study. The side faces give the raised path depth.
  function trackSurface(zA, yA, zB, yB) {
    const points = [4.2,yA,zA, 5.8,yA,zA, 5.8,yB,zB, 4.2,yB,zB,
      4.2,.1,zA, 5.8,.1,zA, 5.8,.1,zB, 4.2,.1,zB];
    const uv = []; for (let i = 0; i < points.length; i += 3) uv.push(points[i] * .76, 1 + points[i + 2] * .76);
    const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(points, 3));
    geometry.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geometry.setIndex([0,1,2, 0,2,3, 0,4,5, 0,5,1, 1,5,6, 1,6,2, 2,6,7, 2,7,3, 3,7,4, 3,4,0]); geometry.computeVertexNormals();
    const mesh = new T.Mesh(geometry, asphalt); mesh.name = 'FUNCTIONAL_CYCLE_SURFACE'; root.add(mesh);
  }
  trackSurface(-35, .28, -13.8, .28);
  trackSurface(-13.8, .28, -13.1, .1225);
  trackSurface(-4.9, .1225, -4, .28);
  trackSurface(20, .28, 68, .28);
  if (!skyExtension) throw new Error('Study sky edge could not be reused');
  const rearStreet = createRearStreet(T, root, asphalt);
  root.add(skyExtension);
  root.updateMatrixWorld(true);
  const rearGroup=root.getObjectByName('FUNCTIONAL_REAR_STREET');
  const studyMeshes=[...root.children.filter(o=>o.isMesh),...skyExtension.children.filter(o=>o.isMesh)];
  const batching={study:batchOpaque(T,root,studyMeshes),rear:batchOpaque(T,rearGroup,rearGroup.children.filter(o=>o.isMesh),true)};
  return { hiddenGroups, relocatedRiders: RELOCATED_RIDERS, shadowVerticesMoved: shadowCounts, removedTrackTriangles,
    trackRampBounds: [[-13.8,-13.1],[-4.9,-4]], continuousTrackX: [4.2,5.8], rearStreet, batching };
}

export function createJunctionEnvironment(T, scene, { onChange = () => {} } = {}) {
  let token = 0, controller = null, model = null, skyTexture = null, disposed = false, selectedView = 'driver', transferKit = null, transferPeople = null, transferShadow = null;
  let state = { variant: null, view: selectedView, status: 'legacy', glbSha256: null, expectedGlbSha256: JUNCTION_STUDY_SHA256, downloadBytes: 0, error: null, metrics: null };
  const emit = patch => { state = { ...state, ...patch }; onChange({ ...state }); };
  const applyView = () => {
    if (!model) return;
    const rear = model.getObjectByName('FUNCTIONAL_REAR_STREET'), sky = model.getObjectByName('WEB_GROUP_026'), extension = model.getObjectByName('FUNCTIONAL_SKY_EXTENSION');
    if (rear) rear.visible = selectedView !== 'driver';
    if (rear) rear.traverse(o=>{
      if(o.isInstancedMesh && Number.isInteger(o.userData.shoulderCount))o.count=selectedView==='shoulder'?o.userData.shoulderCount:o.userData.fullCount;
      if(o.isMesh && Number.isInteger(o.userData.batchShoulderIndices))o.geometry.setDrawRange(0,selectedView==='shoulder'?o.userData.batchShoulderIndices:o.userData.batchAllIndices);
    });
    if (sky) sky.visible = selectedView !== 'shoulder';
    if (extension) extension.visible = selectedView !== 'shoulder';
  };
  const cancel = () => { token += 1; transferKit?.dispose(); transferKit=null; if(transferPeople){disposeGraph(transferPeople);transferPeople=null;} transferShadow?.dispose();transferShadow=null; controller?.abort(); controller = null; if (model) { disposeGraph(model); model = null; } if (skyTexture) skyTexture.dispose(); skyTexture = null; };
  const load = async currentToken => {
    let candidate = null;
    try {
      if (!T.GLTFLoader) await import('./assets/GLTFLoader-r128.js');
      if (disposed || currentToken !== token) return;
      controller = new AbortController();
      const response = await fetch(URL_OF_STUDY, { signal: controller.signal });
      if (!response.ok) throw new Error(`Study download returned ${response.status}`);
      const bytes = await response.arrayBuffer();
      if (!globalThis.crypto?.subtle) throw new Error('Study checksum verification unavailable');
      const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
      if (hash !== JUNCTION_STUDY_SHA256) throw new Error('Study checksum does not match the approved GLB');
      if (disposed || currentToken !== token) return;
      const gltf = await new Promise((resolve, reject) => new T.GLTFLoader().parse(bytes, new URL('.', URL_OF_STUDY).href, resolve, reject));
      candidate = gltf.scene;
      if (disposed || currentToken !== token) { disposeGraph(candidate); return; }
      const materialMetrics = convertMaterials(T, candidate), geometryMetrics = adaptGeometry(T, candidate);
      candidate.traverse(o => { if (o.isMesh && o.material?.name === 'illustrated texture sky') {
        // glTF maps use flipY=false on meshes; a scene background needs the
        // opposite orientation so the horizon remains below the blue sky.
        const source = o.material.map.image, canvas = document.createElement('canvas');
        canvas.width = source.naturalWidth || source.width; canvas.height = source.naturalHeight || source.height;
        const context=canvas.getContext('2d'), horizon=canvas.height*.72;
        context.drawImage(source,0,0,canvas.width,canvas.height,0,0,canvas.width,horizon);
        context.drawImage(source,0,canvas.height-1,canvas.width,1,0,horizon,canvas.width,canvas.height-horizon);
        skyTexture = new T.CanvasTexture(canvas); skyTexture.encoding = T.sRGBEncoding; skyTexture.flipY = true; skyTexture.needsUpdate = true;
      } });
      if (!skyTexture) throw new Error('Study sky texture missing');
      candidate.name = 'APPROVED_STUDY_JUNCTION'; scene.add(candidate); model = candidate; candidate = null; controller = null; applyView();
      emit({ status: 'ready', glbSha256: hash, downloadBytes: bytes.byteLength, error: null,
        metrics: { ...materialMetrics, ...geometryMetrics } });
    } catch (error) {
      if (candidate) disposeGraph(candidate);
      if (!model && skyTexture) { skyTexture.dispose(); skyTexture = null; }
      if (disposed || currentToken !== token || error?.name === 'AbortError') return;
      controller = null; emit({ status: 'fallback', glbSha256: null, error: String(error?.message || error), metrics: null });
    }
  };
  async function loadTransfer(variant,currentToken) {
    let kit=null;
    try {
      if(!T.GLTFLoader)await import('./assets/GLTFLoader-r128.js');
      if(disposed||currentToken!==token)return;
      const driveway=variant==='driveway',cycleX=driveway?6.25:6.45;
      kit=await createStreetKit(T,scene,{family:'town',length:96,roadHalfWidth:driveway?7.2:7.45,zStart:42,people:false,exclusions:[[-22,-2]]});
      transferKit=kit;await kit.ready;
      if(disposed||currentToken!==token){kit.dispose();return;}
      const placements=kit.snapshot().placements;
      for(let i=0;i<placements.length;i++){
        const meta=placements[i],holder=kit.group.children[i];if(!holder)continue;
        const side=meta.x<0?-1:1;holder.position.x=meta.type==='tree'?(side<0?-7.5:10.7):(side<0?-10.6:13.3);
        holder.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(holder);const leftLimit=-6.7,rightLimit=driveway?9.75:10.0;if(side<0&&bounds.max.x>leftLimit)holder.position.x-=bounds.max.x-leftLimit;if(side>0&&bounds.min.x<rightLimit)holder.position.x+=rightLimit-bounds.min.x;
      }
      const original=kit.group.children.find((holder,i)=>placements[i]?.type==='shop'&&placements[i]?.x<0)||kit.group.children.find((holder,i)=>placements[i]?.type!=='tree'&&placements[i]?.x<0);
      if(original){const near=original.clone(true);near.name='TRANSFER_WEST_FRONTAGE';near.position.z=driveway?-12:-15;kit.group.add(near);}
      const adjustedPlacements=kit.group.children.map((holder,i)=>{holder.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(holder);return {type:holder.name==='TRANSFER_WEST_FRONTAGE'?'west-near':placements[i]?.type||'unknown',x:holder.position.x,z:holder.position.z,bounds:{minX:bounds.min.x,maxX:bounds.max.x,minZ:bounds.min.z,maxZ:bounds.max.z}};});
      const people=new T.Group();people.name='APPROVED_TRANSFER_PEOPLE';scene.add(people);transferPeople=people;
      const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,1,32,32,31);gradient.addColorStop(0,'rgba(0,0,0,.35)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
      const shadowTexture=new T.CanvasTexture(canvas);transferShadow=shadowTexture;
      const cyclePositions=[-53,-47,-41,-35],walkPositions=[-29,-23,3,9,15,21,27,33,39];let loaded=0,cycleIndex=0,walkIndex=0;const personPlacements=[];
      PEOPLE_CSE.forEach((url,index)=>{const isCycle=url.includes('cyclist'),z=isCycle?cyclePositions[cycleIndex++]:walkPositions[walkIndex++],x=isCycle?cycleX:(index%2?-5.4:(driveway?8.425:8.675));personPlacements.push({asset:url,x,z,ground:isCycle?.18:.025,kind:isCycle?'cyclist':'pedestrian'});new T.TextureLoader().load(url,texture=>{
        if(disposed||currentToken!==token){texture.dispose();return;}texture.encoding=T.sRGBEncoding;
        const h=url.includes('child')?1.3:1.68,w=h*texture.image.width/texture.image.height;
        const ground=isCycle?.18:.025;const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide});const geometry=new T.PlaneGeometry(w,h);geometry.translate(0,h/2,0);const figure=attachCylindricalBillboard(T,new T.Mesh(geometry,material));figure.name='approved-static-person';figure.position.set(x,ground,z);people.add(figure);
        const shadowGeometry=new T.PlaneGeometry(Math.max(.45,w*.8),.55),shade=new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.7});const shadow=new T.Mesh(shadowGeometry,shade);shadow.rotation.x=-Math.PI/2;shadow.position.set(x,ground+.007,z);shadow.name='approved-person-contact-shadow';people.add(shadow);
        loaded++;state={...state,peopleLoaded:loaded};onChange({...state,peopleUpdate:true});
      });});
      emit({status:'ready',glbSha256:STREET_STUDY_SHA256,downloadBytes:kit.snapshot().sourceBytes||0,error:null,metrics:{...kit.snapshot(),people:'approved-static',peopleExpected:PEOPLE_CSE.length,personPlacements,adjustedPlacements},peopleLoaded:loaded});
    }catch(error){kit?.dispose();if(transferKit===kit)transferKit=null;if(disposed||currentToken!==token)return;emit({status:'fallback',glbSha256:null,error:String(error?.message||error),metrics:null});}
  }
  return {
    setVariant(variant) {
      if (disposed) return; cancel();
      if (variant !== 'junction') { emit({ variant, status: 'loading', glbSha256: null, downloadBytes: 0, error: null, metrics: null, peopleLoaded:0 }); void loadTransfer(variant,token); return; }
      emit({ variant, status: 'loading', glbSha256: null, downloadBytes: 0, error: null, metrics: null });
      void load(token);
    },
    setView(view) { if (disposed || view === selectedView || !['driver','shoulder','overhead'].includes(view)) return; selectedView = view; state = { ...state, view }; applyView(); },
    snapshot() { return { ...state }; },
    skyTexture() { return skyTexture; },
    dispose() { if (disposed) return; disposed = true; cancel(); }
  };
}
