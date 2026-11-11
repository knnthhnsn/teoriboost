// A driver's right-side observation view. This module deliberately installs
// no input listeners or animation loop: the lesson owns interaction and render.
const MODES = new Set(['window', 'mirror', 'shoulder']);

export function createDriverRightView({ T, scene, camera, renderer, getPose, getCyclist,
  onChange = () => {}, beforeCameraRender = () => {}, palette = {} }) {
  if (!T || !scene || !camera || !renderer || typeof getPose !== 'function' || typeof getCyclist !== 'function') {
    throw new TypeError('The right-side view needs the live scene, camera, renderer and actor getters');
  }
  const canvas = renderer.domElement;
  const target = new T.WebGLRenderTarget(256, 160, { minFilter:T.LinearFilter, magFilter:T.LinearFilter,
    format:T.RGBAFormat, type:T.UnsignedByteType, depthBuffer:true, stencilBuffer:false });
  target.texture.name = 'DRIVER_RIGHT_MIRROR'; target.texture.encoding = T.sRGBEncoding; target.texture.generateMipmaps = false;
  const mirrorCamera = new T.PerspectiveCamera(56, 256 / 160, .08, 400);
  const overlay = new T.Group(); overlay.name = 'DRIVER_RIGHT_WINDOW_FRAME'; overlay.visible = false; camera.add(overlay);
  const mirror = new T.Group(); mirror.name = 'DRIVER_RIGHT_WING_MIRROR'; overlay.add(mirror);
  const color = value => new T.Color(value).convertSRGBToLinear();
  // Rally-hatch placeholder: oxide-red exterior, cream interior and dark seals.
  // A future vehicle can supply matching colours without changing geometry.
  const flat = value => new T.MeshBasicMaterial({color:color(value),transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
  const shellMat=flat(palette.body??0x8f493f),highlightMat=flat(palette.bodyHighlight??0xbb7462),edgeMat=flat(palette.edge??0x172124),
    trimMat=flat(palette.trim??0xc0b299),trimShadowMat=flat(palette.trimShadow??0x8d8271),headrestMat=flat(palette.headrest??0x827b6c);
  const glassMat = new T.MeshBasicMaterial({ map:target.texture, side:T.DoubleSide, transparent:true,depthTest:false, depthWrite:false, toneMapped:false });
  function rounded(width,height,radius) {
    const x=-width/2,y=-height/2,w=width,h=height,r=radius,s=new T.Shape();
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);
    s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
  }
  const outer = new T.Mesh(new T.ShapeGeometry(rounded(1,1,.28),6),edgeMat);outer.name='DRIVER_MIRROR_OUTLINE';outer.renderOrder=1004;mirror.add(outer);
  const housing = new T.Mesh(new T.ShapeGeometry(rounded(.96,.94,.25),6),shellMat);housing.name='DRIVER_MIRROR_HOUSING';housing.renderOrder=1005;mirror.add(housing);
  const gasket = new T.Mesh(new T.ShapeGeometry(rounded(.88,.82,.21),6),edgeMat);gasket.name='DRIVER_MIRROR_GASKET';gasket.renderOrder=1006;mirror.add(gasket);
  const innerGeometry = new T.ShapeGeometry(rounded(.82,.72,.18),6), positions=innerGeometry.attributes.position, uv=innerGeometry.attributes.uv;
  for(let i=0;i<positions.count;i+=1)uv.setXY(i,1-(positions.getX(i)/.82+.5),positions.getY(i)/.72+.5);
  const glass = new T.Mesh(innerGeometry,glassMat);glass.name='DRIVER_MIRROR_GLASS';glass.position.z=.002;glass.renderOrder=1007;mirror.add(glass);
  const stripGeometry = new T.PlaneGeometry(1,1);
  const mirrorHighlight=new T.Mesh(stripGeometry,highlightMat);mirrorHighlight.name='DRIVER_MIRROR_PAINT_HIGHLIGHT';mirrorHighlight.position.set(-.10,.435,.003);mirrorHighlight.scale.set(.38,.025,1);mirrorHighlight.renderOrder=1006;mirror.add(mirrorHighlight);
  const belt=new T.Mesh(stripGeometry,trimMat),beltLine=new T.Mesh(stripGeometry,edgeMat),top=new T.Mesh(stripGeometry,edgeMat),
    aOuter=new T.Mesh(stripGeometry,edgeMat),aInner=new T.Mesh(stripGeometry,trimMat),mountOutline=new T.Mesh(stripGeometry,edgeMat),mountBody=new T.Mesh(stripGeometry,shellMat),
    bOuter=new T.Mesh(stripGeometry,edgeMat),bInner=new T.Mesh(stripGeometry,trimMat),cOuter=new T.Mesh(stripGeometry,edgeMat),cInner=new T.Mesh(stripGeometry,trimShadowMat);
  belt.name='DRIVER_RIGHT_DOOR_BELT';beltLine.name='DRIVER_RIGHT_DOOR_EDGE';top.name='DRIVER_RIGHT_WINDOW_TOP';aOuter.name='DRIVER_RIGHT_A_PILLAR';
  bOuter.name='DRIVER_RIGHT_B_PILLAR';cOuter.name='DRIVER_RIGHT_C_PILLAR';mountBody.name='DRIVER_RIGHT_MIRROR_STALK';
  for(const o of [belt,beltLine,top,aOuter,aInner,mountOutline,mountBody,bOuter,bInner,cOuter,cInner]){o.renderOrder=1001;overlay.add(o);}
  mountOutline.renderOrder=1002;mountBody.renderOrder=1003;
  const headrest = new T.Group();headrest.name='DRIVER_RIGHT_HEADREST_EDGE';overlay.add(headrest);
  const headrestOutline=new T.Mesh(new T.ShapeGeometry(rounded(1,1,.22),6),edgeMat),headrestFace=new T.Mesh(new T.ShapeGeometry(rounded(.83,.87,.17),6),headrestMat);
  headrestOutline.renderOrder=1002;headrestFace.renderOrder=1003;headrest.add(headrestOutline,headrestFace);
  let active=false,disposed=false,mode='window',mirrorChecks=0,shoulderChecks=0,mirrorFrames=0,lastMirrorMs=-Infinity,dirty=true,intersecting=true;
  let mirrorRect=null,lastLayout='',lastError=null;
  let observer=null;
  if(typeof IntersectionObserver!=='undefined'&&canvas){observer=new IntersectionObserver(entries=>{const entry=entries.at(-1);if(entry){intersecting=entry.isIntersecting;if(intersecting)dirty=true;}});observer.observe(canvas);}
  const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
  const poseData=()=>{const data=getPose()||{};return {car:data.car||data,cyclist:data.cyclist||null};};
  const groundOf=car=>Number.isFinite(car.y)?car.y:0;
  function actorPosition(fallback) {
    const object=getCyclist();
    if(object?.isObject3D){object.updateWorldMatrix?.(true,false);return object.getWorldPosition(new T.Vector3());}
    if(fallback && Number.isFinite(fallback.x)&&Number.isFinite(fallback.z))return new T.Vector3(fallback.x,Number(fallback.y)||0,fallback.z);
    return null;
  }
  function layout() {
    const r=canvas?.getBoundingClientRect?.();if(!r||!(r.width>0&&r.height>0))return false;
    const width=r.width,height=r.height,d=.65,halfY=Math.tan(camera.fov*Math.PI/360)*d,halfX=halfY*camera.aspect;
    const sx=2*halfX/width,sy=2*halfY/height,beltPx=Math.max(12,Math.min(20,height*.06));
    const size=mode==='mirror'?Math.min(width*.76,height*1.52,320):Math.min(112,width*.36);
    const mw=Math.max(56,size),mh=Math.max(56,mw*160/256),left=mode==='mirror'?(width-mw)/2:width-mw-23,
      topPx=mode==='mirror'?(height-mh)/2:height-mh-beltPx-4;
    const cx=-halfX+(left+mw/2)*sx,cy=halfY-(topPx+mh/2)*sy;
    mirror.position.set(cx,cy,-d);mirror.scale.set(mw*sx,mh*sy,1);mirror.visible=active&&mode!=='shoulder';
    belt.position.set(0,-halfY+beltPx*sy/2,-d);belt.scale.set(2*halfX,beltPx*sy,1);
    beltLine.position.set(0,-halfY+beltPx*sy,-d+.001);beltLine.scale.set(2*halfX,3*sy,1);
    top.position.set(0,halfY-3*sy,-d);top.scale.set(2*halfX,6*sy,1);
    const placeStrip=(object,x0,y0,x1,y1,thickness)=>{const ax=-halfX+x0*sx,ay=halfY-y0*sy,bx=-halfX+x1*sx,by=halfY-y1*sy,dx=bx-ax,dy=by-ay;
      object.position.set((ax+bx)/2,(ay+by)/2,-d+.001);object.rotation.z=Math.atan2(dy,dx);object.scale.set(Math.hypot(dx,dy),thickness*sy,1);};
    const rear=mode==='shoulder';aOuter.visible=aInner.visible=!rear;bOuter.visible=bInner.visible=cOuter.visible=cInner.visible=headrest.visible=rear;
    mountOutline.visible=mountBody.visible=!rear&&mode!=='mirror';
    if(!rear){
      placeStrip(aOuter,width-8,-8,width-43,height-beltPx+8,32);placeStrip(aInner,width-8,-8,width-43,height-beltPx+8,20);
      placeStrip(mountOutline,left+mw*.79,topPx+mh*.78,width-43,height-beltPx+2,13);
      placeStrip(mountBody,left+mw*.79,topPx+mh*.78,width-43,height-beltPx+2,8);
    }else{
      placeStrip(bOuter,-5,-8,24,height-beltPx+8,31);placeStrip(bInner,-5,-8,24,height-beltPx+8,20);
      placeStrip(cOuter,width-5,-8,width-25,height-beltPx+8,29);placeStrip(cInner,width-5,-8,width-25,height-beltPx+8,18);
      const hw=Math.max(58,Math.min(78,width*.16)),hh=Math.max(76,Math.min(100,height*.36));
      headrest.position.set(-halfX+12*sx,halfY-(height-beltPx-hh*.48)*sy,-d+.002);headrest.scale.set(hw*sx,hh*sy,1);
    }
    mirrorRect={left:r.left+left,top:r.top+topPx,width:mw,height:mh,
      lens:{left:r.left+left+mw*.09,top:r.top+topPx+mh*.14,width:mw*.82,height:mh*.72}};
    const key=[width,height,camera.fov,camera.aspect,mode].join(':');if(key!==lastLayout){dirty=true;lastLayout=key;}
    return true;
  }
  function updateCamera() {
    if(!active||disposed)return false;
    const {car,cyclist}=poseData();if(!Number.isFinite(car?.x)||!Number.isFinite(car?.z))return false;
    const heading=Number(car.heading)||0,baseY=groundOf(car),forward=new T.Vector3(-Math.sin(heading),0,-Math.cos(heading)),right=new T.Vector3(Math.cos(heading),0,-Math.sin(heading));
    const eye=new T.Vector3(car.x,baseY+1.75,car.z).addScaledVector(right,.2);
    camera.position.copy(eye);camera.fov=mode==='shoulder'?32:42;
    if(mode==='shoulder'){
      const rider=actorPosition(cyclist);let targetPoint;
      if(rider&&rider.clone().sub(eye).dot(forward)<-.05){targetPoint=rider.clone();targetPoint.y+=1.05;}
      else targetPoint=eye.clone().addScaledVector(forward,-7).addScaledVector(right,3).setY(baseY+1.1);
      camera.lookAt(targetPoint);
    }else{
      const targetPoint=eye.clone().addScaledVector(right,2.8).addScaledVector(forward,19).setY(baseY+1.05);camera.lookAt(targetPoint);
    }
    camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
    const mirrorEye=new T.Vector3(car.x,baseY+1.25,car.z).addScaledVector(right,1.0).addScaledVector(forward,.45);
    const mirrorLook=mirrorEye.clone().addScaledVector(forward,-13).addScaledVector(right,1.35).setY(baseY+1.05);
    mirrorCamera.position.copy(mirrorEye);mirrorCamera.lookAt(mirrorLook);mirrorCamera.updateProjectionMatrix();mirrorCamera.updateMatrixWorld(true);
    return layout();
  }
  function renderMirror({force=false, time=now()}={}) {
    if(disposed||!active||mode==='shoulder'||!intersecting||(typeof document!=='undefined'&&document.hidden))return false;
    if(!force&&!dirty&&time-lastMirrorMs<1000/12)return false;
    if(!updateCamera())return false;
    const previousTarget=renderer.getRenderTarget(),viewport=renderer.getViewport(new T.Vector4()),scissor=renderer.getScissor(new T.Vector4()),scissorTest=renderer.getScissorTest();
    const xr=renderer.xr?.enabled,shadowAuto=renderer.shadowMap.autoUpdate,children=camera.children.map(child=>[child,child.visible]);
    try{
      if(renderer.xr)renderer.xr.enabled=false;
      renderer.shadowMap.autoUpdate=false;
      for(const [child] of children)child.visible=false;
      beforeCameraRender(mirrorCamera);
      renderer.setRenderTarget(target);renderer.setViewport(0,0,256,160);renderer.setScissor(0,0,256,160);renderer.setScissorTest(false);
      renderer.render(scene,mirrorCamera);lastMirrorMs=time;mirrorFrames+=1;dirty=false;lastError=null;return true;
    }catch(error){lastError=String(error?.message||error);dirty=true;return false;}
    finally{
      renderer.setRenderTarget(previousTarget);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);
      if(renderer.xr)renderer.xr.enabled=xr;renderer.shadowMap.autoUpdate=shadowAuto;for(const [child,visible] of children)child.visible=visible;
      try{beforeCameraRender(camera);}catch(error){lastError=String(error?.message||error);}
    }
  }
  function hitTestMirror(clientX,clientY) {
    if(disposed||!active||mode==='shoulder'||!mirrorRect||!Number.isFinite(clientX)||!Number.isFinite(clientY))return null;
    const r=mirrorRect;if(clientX<r.left||clientX>r.left+r.width||clientY<r.top||clientY>r.top+r.height)return null;
    const lens=r.lens,u=Math.max(0,Math.min(1,(clientX-lens.left)/lens.width)),v=Math.max(0,Math.min(1,(clientY-lens.top)/lens.height));
    const uv={x:1-u,y:1-v},raycaster=new T.Raycaster();raycaster.setFromCamera(new T.Vector2(uv.x*2-1,uv.y*2-1),mirrorCamera);
    return {region:'mirror',uv,insideLens:clientX>=lens.left&&clientX<=lens.left+lens.width&&clientY>=lens.top&&clientY<=lens.top+lens.height,
      ray:{origin:raycaster.ray.origin.toArray(),direction:raycaster.ray.direction.toArray()}};
  }
  function projectCyclistInMirror() {
    const object=getCyclist();if(!object?.isObject3D||!mirrorRect||!active||mode==='shoulder')return null;
    try{
      beforeCameraRender(mirrorCamera);object.updateWorldMatrix?.(true,true);const bounds=new T.Box3().setFromObject(object);if(bounds.isEmpty())return null;
      const centre=bounds.getCenter(new T.Vector3()),forward=new T.Vector3();mirrorCamera.getWorldDirection(forward);
      if(centre.clone().sub(mirrorCamera.position).dot(forward)<=0)return null;
      const samples=[];for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])samples.push(new T.Vector3(x,y,z).project(mirrorCamera));
      const lens=mirrorRect.lens,xs=samples.map(p=>lens.left+(1-(p.x+1)/2)*lens.width),ys=samples.map(p=>lens.top+(1-(p.y+1)/2)*lens.height);
      return {left:Math.min(...xs),top:Math.min(...ys),right:Math.max(...xs),bottom:Math.max(...ys)};
    }finally{beforeCameraRender(camera);}
  }
  function snapshot(){return {active,disposed,mode,mirrorChecks,shoulderChecks,mirrorFrames,mirrorSize:[256,160],mirrorRect:mirrorRect?{...mirrorRect,lens:{...mirrorRect.lens}}:null,
    offscreen:!intersecting,mirrorError:lastError,eye:active?camera.position.toArray():null};}
  return {
    setActive(value){const next=!!value;if(disposed||next===active)return active;active=next;overlay.visible=active;dirty=true;if(!active){mode='window';mirrorRect=null;}else updateCamera();onChange(snapshot());return active;},
    setMode(next,{record=true}={}){if(disposed||!MODES.has(next)||next===mode)return mode;mode=next;if(record&&next==='mirror')mirrorChecks+=1;if(record&&next==='shoulder')shoulderChecks+=1;dirty=true;if(active)updateCamera();onChange(snapshot());return mode;},
    updateCamera,renderMirror,hitTestMirror,projectCyclistInMirror,snapshot,
    resetChecks(){mirrorChecks=0;shoulderChecks=0;onChange(snapshot());},
    dispose(){if(disposed)return;disposed=true;active=false;observer?.disconnect();camera.remove(overlay);stripGeometry.dispose();outer.geometry.dispose();housing.geometry.dispose();gasket.geometry.dispose();innerGeometry.dispose();headrestOutline.geometry.dispose();headrestFace.geometry.dispose();
      shellMat.dispose();highlightMat.dispose();edgeMat.dispose();trimMat.dispose();trimShadowMat.dispose();headrestMat.dispose();glassMat.dispose();target.dispose();mirrorRect=null;}
  };
}
