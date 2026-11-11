import { attachCylindricalBillboard } from './cylindrical-billboard.js';

// Review prototype: the atlas remains byte-identical to the supplied sheet.
// Car local +X is the provisional forward axis; the caller owns seat placement.
export async function createSeatedOccupants(THREE, { atlasUrl = new URL('./assets/people-cse/seated-four-views-v3-wheelless.png', import.meta.url).href, passengerAtlasUrl = new URL('./assets/people-cse/passenger-lap-v1.png', import.meta.url).href } = {}) {
  const load=url=>new Promise((resolve,reject)=>new THREE.TextureLoader().load(url,resolve,undefined,reject));
  const texture=await load(atlasUrl); let passengerTexture;
  try { passengerTexture=await load(passengerAtlasUrl); } catch (error) {texture.dispose();throw error;}
  texture.encoding=passengerTexture.encoding=THREE.sRGBEncoding;
  function makeMaterial(role) {
    const selectedTexture=role==='passenger'?passengerTexture:texture;
    const material = new THREE.MeshBasicMaterial({map:selectedTexture, transparent:false, alphaTest:.5, side:THREE.DoubleSide, depthWrite:true});
    const frameUniform={value:new THREE.Vector4(0,0,.25,.25)}, flipUniform={value:0};
    const handA={value:new THREE.Vector3()},handB={value:new THREE.Vector3()},handUvA={value:new THREE.Vector2()},handUvB={value:new THREE.Vector2()};
    material.onBeforeCompile = shader => {
    shader.uniforms.seatedFrame=frameUniform; shader.uniforms.seatedFlip=flipUniform;
    if(role==='driver'){shader.uniforms.handA=handA;shader.uniforms.handB=handB;shader.uniforms.handUvA=handUvA;shader.uniforms.handUvB=handUvB;shader.vertexShader='uniform vec3 handA; uniform vec3 handB; uniform vec2 handUvA; uniform vec2 handUvB;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat wa=1.0-smoothstep(.09,.23,distance(uv,handUvA));\nfloat wb=1.0-smoothstep(.09,.23,distance(uv,handUvB));\ntransformed+=wa*handA+wb*handB;');}
    shader.fragmentShader='uniform vec4 seatedFrame; uniform float seatedFlip;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', '#ifdef USE_MAP\nvec2 suv=vec2(mix(vUv.x,1.0-vUv.x,seatedFlip),vUv.y);\nvec4 sampledDiffuseColor=texture2D(map,seatedFrame.xy+suv*seatedFrame.zw);\nsampledDiffuseColor=mapTexelToLinear(sampledDiffuseColor);\ndiffuseColor *= sampledDiffuseColor;\n#endif');
    const token = '#include <alphatest_fragment>';
    if (!shader.fragmentShader.includes(token)) throw new Error('Seated occupant alpha-test shader chunk unavailable');
    shader.fragmentShader = shader.fragmentShader.replace(token, token + '\n diffuseColor.a = 1.0;');
  };
    material.customProgramCacheKey = () => role==='driver'?'seated-occupant-contact-v1':'seated-occupant-opaque-mask-v1';
    return {material,frameUniform,flipUniform,handA,handB,handUvA,handUvB};
  }
  const objects = new Set(), direction = new THREE.Vector3(), cameraPosition = new THREE.Vector3(), cardPosition = new THREE.Vector3(), parentQ = new THREE.Quaternion();
  const handAnchors=[[[.238,.132],[.744,.133]],[[.226,.109],[.764,.111]],[[.259,.162],[.736,.146]],[[.24,.13],[.75,.13]]];
  const quarterAnchors=[[[.378,.124],[.858,.142]],[[.398,.093],[.871,.134]],[[.348,.128],[.792,.150]],[[.38,.13],[.84,.14]]];
  const yEdges=[0,324,630,922,1254];
  function create({identity=0, role='driver', width=.9, height=.9}={}) {
    if(role!=='driver'&&role!=='passenger')throw new RangeError('role must be driver or passenger');
    if (!Number.isInteger(identity) || identity<0 || identity>3) throw new RangeError('identity must be 0–3');
    const {material,frameUniform,flipUniform,handA,handB,handUvA,handUvB}=makeMaterial(role);
    const geometry = new THREE.PlaneGeometry(width,height,role==='driver'?64:1,role==='driver'?28:1);
    if(role==='driver'){
      // Rows 0..27 preserve the original 1/64 UV grid; the remaining top is flat.
      const uv=geometry.attributes.uv,pos=geometry.attributes.position;
      for(let row=0;row<=28;row++){
        const v=row===0?1:(28-row)/64;
        for(let col=0;col<=64;col++){const i=row*65+col;uv.setY(i,v);pos.setY(i,(v-.5)*height);}
      }
      uv.needsUpdate=true;pos.needsUpdate=true;
    }
    geometry.translate(0,height/2,0);
    if(role==='driver'){geometry.boundingBox=new THREE.Box3(new THREE.Vector3(-1,-1,-1),new THREE.Vector3(1,height+1,1));geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,height/2,0),2);}
    const gripA=new THREE.Vector3(),gripB=new THREE.Vector3(),anchorA=new THREE.Vector2(),anchorB=new THREE.Vector2();
    const mesh = attachCylindricalBillboard(THREE,new THREE.Mesh(geometry,material));
    mesh.name='seated-occupant-review'; mesh.userData.identity=identity; mesh.userData.occupantRole=role;mesh.userData.handContact={active:false,uvs:[handUvA.value,handUvB.value],offsets:[handA.value,handB.value]};
    const orient=mesh.onBeforeRender;
    mesh.onBeforeRender=function(renderer,scene,camera,...rest) {
      orient.call(this,renderer,scene,camera,...rest);
      camera.getWorldPosition(cameraPosition); this.getWorldPosition(cardPosition); direction.copy(cameraPosition).sub(cardPosition);
      if(this.parent){this.parent.getWorldQuaternion(parentQ);direction.applyQuaternion(parentQ.invert());}
      const angle=Math.atan2(direction.z,direction.x), degrees=Math.abs(angle)*180/Math.PI;
      const column=degrees<22.5?0:degrees<67.5?1:degrees<112.5?2:3, flip=column>0&&angle<0;
      const x0=Math.round(column*1254/4),x1=Math.round((column+1)*1254/4),y0=yEdges[identity],y1=yEdges[identity+1],u0=(x0+.5)/1254,u1=(x1-.5)/1254,v0=1-(y1-.5)/1254,v1=1-(y0+.5)/1254;
      frameUniform.value.set(u0,v0,u1-u0,v1-v0); flipUniform.value=flip?1:0;
      const frame=this.userData.frame||(this.userData.frame={identity,column,flip});frame.identity=identity;frame.column=column;frame.flip=flip;
      handA.value.set(0,0,0);handB.value.set(0,0,0);
      if(role==='driver' && column<=1 && this.parent){
        this.updateMatrixWorld(true);
        const data=(column===0?handAnchors:quarterAnchors)[identity];
        anchorA.set(Math.round((flip?1-data[0][0]:data[0][0])*64)/64,Math.round(data[0][1]*64)/64);
        anchorB.set(Math.round((flip?1-data[1][0]:data[1][0])*64)/64,Math.round(data[1][1]*64)/64);
        if(anchorA.x>anchorB.x){const x=anchorA.x,y=anchorA.y;anchorA.copy(anchorB);anchorB.set(x,y);}
        gripA.set(2.91,1.10,-.28);gripB.set(2.91,1.10,-.58);
        this.worldToLocal(this.parent.localToWorld(gripA));this.worldToLocal(this.parent.localToWorld(gripB));
        if(gripA.x>gripB.x){const x=gripA.x,y=gripA.y,z=gripA.z;gripA.copy(gripB);gripB.set(x,y,z);}
        handUvA.value.copy(anchorA);handUvB.value.copy(anchorB);
        handA.value.set(gripA.x-(anchorA.x-.5)*width,gripA.y-anchorA.y*height,gripA.z);
        handB.value.set(gripB.x-(anchorB.x-.5)*width,gripB.y-anchorB.y*height,gripB.z);
        this.userData.handContact.active=true;
      }else this.userData.handContact.active=false;
    };
    mesh.dispose=()=>{objects.delete(mesh);geometry.dispose();material.dispose();}; objects.add(mesh);return mesh;
  }
  return {create,texture,passengerTexture,dispose(){for(const mesh of [...objects])mesh.dispose();texture.dispose();passengerTexture.dispose();}};
}
