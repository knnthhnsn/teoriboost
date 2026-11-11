import {attachCylindricalBillboard} from './cylindrical-billboard.js';
// Approved CSE cyclist cut-out. Plane origin is at ground level; callers own the shadow.
export function loadApprovedCyclist(THREE,{height=1.7}={}) {
  return new Promise((resolve,reject)=>new THREE.TextureLoader().load(new URL('./assets/people-cse/a_cyclist.png',import.meta.url).href,texture=>{
    texture.encoding=THREE.sRGBEncoding;
    const geometry=new THREE.PlaneGeometry(height*texture.image.width/texture.image.height,height);geometry.translate(0,height/2,0);
    const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.05,depthWrite:false,side:THREE.DoubleSide});
    const mesh=attachCylindricalBillboard(THREE,new THREE.Mesh(geometry,material));mesh.name='approved-cse-cyclist';
    mesh.userData.disposeApprovedCyclist=()=>{geometry.dispose();material.dispose();texture.dispose();};resolve(mesh);
  },undefined,()=>reject(new Error('Approved cyclist image unavailable'))));
}
