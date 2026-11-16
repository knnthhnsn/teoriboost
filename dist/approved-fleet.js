// Approved game exports; their original materials are retained.
export const APPROVED_FLEET = Object.freeze({
  sedan: Object.freeze({ lod0: ['sedan-053-lod0.glb','9f5562054effd69b6180e1a1dc7ef7eab2fa6fbbcedb9545bc85c0e2a2a6bf78'], lod1: ['sedan-053-lod1.glb','d9ae06d8fc0e19df96a4345be1b6fd6c5e8281a0f68f95c369ac38ab63e1bc34'] }),
  scooter: Object.freeze({ lod0: ['scooter-048-lod0.glb','0cbe8bfca19b536983ba57839469f930d7c70b2e544a4217daba7d3fe19041dd'], lod1: ['scooter-048-lod1.glb','40f0537f97df9139c80811b9cfea0a0e89a3b41fe5fd368abcf1dc8e4b4e817e'] })
});
// Draft candidates (not approved for Min bil): background traffic in the 3D question situations only.
export const DRAFT_FLEET = Object.freeze({
  hatch: Object.freeze({ lod0: ['hatch-026-lod0.glb','b89a175d42c4d2ef3d9816bd184b64e7e134437b4c2ec2e934c669a4282fbfc7'] })
});
const base = new URL('./assets/models/fleet/', import.meta.url);
const hex = buffer => Array.from(new Uint8Array(buffer), n => n.toString(16).padStart(2,'0')).join('');
export async function loadApprovedFleet(THREE, id, lod='lod0') {
  const entry=(APPROVED_FLEET[id]||DRAFT_FLEET[id])?.[lod];
  if(!entry) throw new Error('Unknown approved vehicle or detail level');
  if(!THREE.GLTFLoader) await import('./assets/GLTFLoader-r128.js');
  const {MeshoptDecoder}=await import('./assets/models/fleet/meshopt_decoder.module.js');
  if(!THREE.GLTFLoader || !MeshoptDecoder.supported) throw new Error('Approved vehicle decoder unavailable');
  const response=await fetch(new URL(entry[0],base));
  if(!response.ok) throw new Error('Approved vehicle unavailable');
  const bytes=await response.arrayBuffer();
  if(hex(await crypto.subtle.digest('SHA-256',bytes))!==entry[1]) throw new Error('Approved vehicle integrity mismatch');
  const loader=new THREE.GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
  return await new Promise((resolve,reject)=>loader.parse(bytes,base.href,resolve,reject));
}

