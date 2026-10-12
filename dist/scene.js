// Original procedural street. All geometry, signs and textures are made locally.
// This is a supporting illustration; the question text supplies the scenario.
export function createNightWorld(canvas, { hero=false, motion=true, kind='stop',question=null }={}) {
  const T=window.THREE;
  if(!T)return null;
  let renderer;
  try { renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'}); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.outputEncoding=T.sRGBEncoding;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  const scene=new T.Scene();scene.background=new T.Color(0x152335);scene.fog=new T.FogExp2(0x152335,.013);
  const camera=new T.PerspectiveCamera(48,1,.1,260);
  const targetPosition=new T.Vector3(),targetLook=new T.Vector3(),currentLook=new T.Vector3();
  scene.add(new T.HemisphereLight(0x9acddd,0x254731,.18));
  const moon=new T.DirectionalLight(0xc4d6ff,.34);moon.position.set(-20,50,15);scene.add(moon);
  const glow=c=>new T.MeshBasicMaterial({color:c,toneMapped:false});
  const mat=(c,opt={})=>new T.MeshStandardMaterial({color:c,roughness:.7,metalness:.05,...opt});
  const attach=(mesh,x,y,z,parent=scene)=>{mesh.position.set(x,y,z);parent.add(mesh);return mesh};
  const box=(w,h,d,c,x,y,z,parent)=>attach(new T.Mesh(new T.BoxGeometry(w,h,d),typeof c==='number'?mat(c):c),x,y,z,parent);
  const ground=(w,d,c,x,z,y=.012)=>{const m=new T.Mesh(new T.PlaneGeometry(w,d),typeof c==='number'?mat(c):c);m.rotation.x=-Math.PI/2;return attach(m,x,y,z)};
  const asphalt=mat(0x25363f,{roughness:.3,metalness:.2});
  ground(230,230,0x1b383a,0,-48,0);
  ground(8,210,asphalt,0,-48);ground(150,8,asphalt,0,0,.015);
  for(const x of [-1,1]) {ground(2.2,200,0x5c6e75,x*5.25,-48,.025);box(.2,.16,200,0xadb8b3,x*4.13,.065,-48);}
  const white=glow(0xdbe5c5);
  for(let z=47;z>-146;z-=7)if(Math.abs(z)>6)ground(.13,3,white,0,z,.035);
  for(let x=-70;x<71;x+=7)if(Math.abs(x)>7)ground(3,.13,white,x,0,.036);
  const markings=new T.Group();scene.add(markings);
  const stopLine=ground(3.7,.28,white,2.1,5.3,.05);markings.add(stopLine);
  const zebra=new T.Group();scene.add(zebra);
  for(let x=-3.6;x<4;x+=1.05){const s=ground(.55,3.7,white,x,9.5,.052);zebra.add(s);}
  const teeth=new T.Group();scene.add(teeth);
  // S11-spidserne vender mod den vigepligtige tilgangsside (+z).
  for(let x=.45;x<3.8;x+=.65){const s=new T.Shape();s.moveTo(-.24,0);s.lineTo(.24,0);s.lineTo(0,-.65);s.closePath();const m=new T.Mesh(new T.ShapeGeometry(s),white);m.rotation.x=-Math.PI/2;attach(m,x,.055,5.15,teeth);}
  const makeTexture=(draw,w=512,h=256)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.anisotropy=2;return tx;};
  const label=(text,color,bg='#182730',w=512,h=128)=>makeTexture((g)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=color;g.font=`800 ${Math.floor(h*.53)}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2,w*.93)},w,h);
  const signGroup=new T.Group();scene.add(signGroup);
  box(.075,2.5,.075,0x879891,5.05,1.2,5.4,signGroup);
  const signTx={
    stop:makeTexture((g)=>{g.clearRect(0,0,256,256);g.beginPath();for(let i=0;i<8;i++){const a=(22.5+i*45)*Math.PI/180;const x=128+124*Math.cos(a),y=128+124*Math.sin(a);i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.fillStyle='#f4f5e9';g.fill();g.save();g.translate(128,128);g.scale(.92,.92);g.translate(-128,-128);g.fillStyle='#d83945';g.fill();g.restore();g.fillStyle='#fff';g.font='bold 60px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('STOP',128,130);},256,256),
    yield:makeTexture((g)=>{const poly=(p,c)=>{g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=c;g.fill()};poly([[5,15],[251,15],[128,247]],'#ee4456');poly([[43,39],[213,39],[128,199]],'#f7f6eb')},256,256),
    speed:makeTexture((g)=>{g.beginPath();g.arc(128,128,120,0,Math.PI*2);g.fillStyle='#df3443';g.fill();g.beginPath();g.arc(128,128,93,0,Math.PI*2);g.fillStyle='#fffbe9';g.fill();g.fillStyle='#111';g.font='bold 110px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('50',128,136);},256,256),
    pedestrian:makeTexture((g)=>{g.fillStyle='#215bc8';g.fillRect(5,5,246,246);g.beginPath();g.moveTo(128,23);g.lineTo(235,226);g.lineTo(21,226);g.closePath();g.fillStyle='#fff';g.fill();g.fillStyle='#111';g.beginPath();g.arc(128,97,12,0,Math.PI*2);g.fill();g.strokeStyle='#111';g.lineWidth=14;g.beginPath();g.moveTo(128,113);g.lineTo(115,150);g.lineTo(92,181);g.moveTo(115,150);g.lineTo(142,174);g.lineTo(151,191);g.moveTo(123,120);g.lineTo(151,140);g.stroke();for(let x=47;x<207;x+=26)g.fillRect(x,204,17,9);},256,256)
  };
  const signMaterial=new T.MeshBasicMaterial({map:signTx.stop,transparent:true,side:T.DoubleSide});
  attach(new T.Mesh(new T.PlaneGeometry(1.25,1.25),signMaterial),5.05,2.3,5.43,signGroup);
  // Sodium pools and cyan / pink shop light reflected on the road.
  const poolTx=makeTexture(g=>{const gr=g.createRadialGradient(128,128,1,128,128,126);gr.addColorStop(0,'rgba(255,255,255,.5)');gr.addColorStop(.4,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);},256,256);
  function pool(x,z,color,w=12,d=12){const m=new T.MeshBasicMaterial({map:poolTx,color,transparent:true,opacity:.18,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});ground(w,d,m,x,z,.065);}
  function lamp(x,z){box(.13,5.3,.13,0x566471,x,2.65,z);box(2,.1,.15,0x71858a,x-Math.sign(x)*.95,5.25,z);box(.7,.06,.36,glow(0xffd490),x-Math.sign(x)*1.45,5.19,z);pool(x-Math.sign(x)*1.45,z,0xe1bc76,14,14);}
  for(let z=25;z>-145;z-=21)lamp(z%2?5.7:-5.7,z);
  const win=glow(0xffd5a0),winBlue=glow(0x99e5df),winDark=mat(0x152c38,{roughness:.3});
  let seed=771;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296};
  function building(side,z,i){const h=5+rng()*7,w=7+rng()*3,d=7;const x=side*(9+w/2);const g=new T.Group();scene.add(g);
    const colors=[0x435870,0x5b6b70,0x694d6a,0x726953,0x41716b];box(w,h,d,colors[i%colors.length],x,h/2,z,g);box(w+.25,.3,d+.25,0x32434c,x,h+.05,z,g);
    const rows=Math.floor(h/2.3), cols=Math.floor(w/2);for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const m=new T.Mesh(new T.PlaneGeometry(.9,1.12),rng()>.35?(rng()>.5?win:winBlue):winDark);m.rotation.y=-side*Math.PI/2;attach(m,x-side*(w/2+.02),1.55+row*2.25,z-d/2+1.1+col*1.75,g);}
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const m=new T.Mesh(new T.PlaneGeometry(.9,1.12),rng()>.5?(rng()>.5?win:winBlue):winDark);attach(m,x-w/2+1.2+col*1.8,1.55+row*2.25,z+d/2+.025,g);}
    if(i===1){const tx=label(side>0?'DØGN 24/7':'GRØNT LYS',side>0?'#ff98bc':'#b2ffdd');const m=new T.Mesh(new T.PlaneGeometry(5.5,1.3),new T.MeshBasicMaterial({map:tx,toneMapped:false}));m.rotation.y=-side*Math.PI/2;attach(m,x-side*(w/2+.08),3,z,g);const front=new T.Mesh(new T.PlaneGeometry(5.5,1.2),new T.MeshBasicMaterial({map:tx,toneMapped:false}));attach(front,x,3,z+d/2+.08,g);pool(side*7,z,side>0?0xee679d:0x73eedd,10,12);}
    if(i===2&&side<0){box(w+.2,.14,d+.2,glow(0xa3eaeb),x,h*.65,z,g);pool(-6,z,0x4fdbdc,10,13);}
    for(let k=0;k<2;k++){const tx=x-side*(w/2+.5),tz=z-2.5+k*5;box(.17,1.4,.17,0x465543,tx,.7,tz,g);const tree=attach(new T.Mesh(new T.IcosahedronGeometry(1.3,1),mat(0x285f52)),tx,2.1,tz,g);tree.scale.y=1.35;}
  }
  for(let i=0;i<11;i++){const z=27-i*14;if(Math.abs(z)<11)continue;building(-1,z,i);if(z<10||!hero)building(1,z-2,i);}
  // Distant blocks give the street depth without external models or images.
  for(let i=0;i<25;i++){const x=(rng()-.5)*120,z=-95-rng()*65,h=10+rng()*26;box(6,h,6,0x263a50,x,h/2,z);for(let y=3;y<h;y+=4)box(4,.25,.01,glow(0x668e95),x,y,z+3.01);}
  function car(color){const g=new T.Group();box(1.82,.64,4.05,color,0,.68,0,g);box(1.62,.65,2.0,mat(0x163140,{roughness:.2,metalness:.4}),0,1.26,.06,g);box(1.66,.1,2.05,color,0,1.6,.06,g);
    for(const x of [-.96,.96])for(const z of [-1.3,1.3]){const m=new T.Mesh(new T.CylinderGeometry(.36,.36,.22,16),mat(0x10181d));m.rotation.z=Math.PI/2;attach(m,x,.4,z,g);const hub=new T.Mesh(new T.CylinderGeometry(.2,.2,.225,12),mat(0xa3b7b7,{metalness:.8}));hub.rotation.z=Math.PI/2;attach(hub,x,.4,z,g);}
    for(const x of [-.57,.57]){box(.36,.15,.03,glow(0xe4fbc7),x,.78,-2.04,g);box(.4,.1,.03,glow(0xff5d88),x,.81,2.04,g);}box(.74,.2,.04,0xe1e5cc,0,.6,2.045,g);scene.add(g);return g;}
  const own=car(0xb7df58);own.position.set(2.05,0,13.5);pool(2.05,14.5,0x90e38b,5,9);
  const headbeam=new T.SpotLight(0xffd59b,1.6,38,.48,.6,1);
  headbeam.position.set(2.05,.85,11.35);headbeam.target.position.set(2.05,.1,-8);scene.add(headbeam);scene.add(headbeam.target);
  const cross=car(0xeab181);cross.rotation.y=Math.PI/2;cross.position.set(-3,0,-1.9);
  const ahead=car(0x76c7d4);ahead.position.set(2,0,-18);
  const emergency=car(0xe2ebe7);emergency.position.set(-2,0,-27);box(.75,.15,.32,glow(0x65b9ff),0,1.8,0,emergency);emergency.visible=false;
  const cyclist=new T.Group();scene.add(cyclist);for(const z of [-.5,.5]){const w=new T.Mesh(new T.TorusGeometry(.36,.04,7,22),mat(0x17201f));w.rotation.y=Math.PI/2;attach(w,0,.42,z,cyclist);}box(.1,.85,.6,0xd4ff63,0,.8,0,cyclist);attach(new T.Mesh(new T.SphereGeometry(.15,9,8),mat(0xf0c18f)),0,1.5,-.06,cyclist);box(.25,.55,.2,0xffa1bb,0,1.1,.05,cyclist);cyclist.position.set(3.4,0,2);
  const walker=new T.Group();scene.add(walker);box(.33,.8,.28,0xffbc7a,0,1,0,walker);attach(new T.Mesh(new T.SphereGeometry(.18,10,8),mat(0xdeb39a)),0,1.62,0,walker);for(const x of [-.1,.1])box(.13,.6,.15,0x283849,x,.35,0,walker);walker.position.set(-2,0,9.5);
  const moonDisc=attach(new T.Mesh(new T.SphereGeometry(2.2,18,14),glow(0xe6efce)),-28,33,-104);
  // Tiny moving traffic, never flashing lights. Learning questions pause movement.
  let currentKind=kind, currentQuestion=question, topDown=false, id, disposed=false, animate=motion, start=performance.now(),cameraReady=false;
  function setScene(next){currentKind=next;const k=next==='right'?'right':next;
    signGroup.visible=['stop','yield','pedestrian','speed'].includes(k);signMaterial.map=signTx[k]||signTx.stop;signMaterial.needsUpdate=true;
    stopLine.visible=k==='stop';teeth.visible=k==='yield';zebra.visible=k==='pedestrian';walker.visible=k==='pedestrian';cyclist.visible=k==='bike';emergency.visible=k==='emergency';cross.visible=['yield','stop','right'].includes(k);ahead.visible=['night','weather','speed','motorway'].includes(k);
    if(hero){signGroup.visible=true;signMaterial.map=signTx.stop;stopLine.visible=true;zebra.visible=true;walker.visible=true;cross.visible=true;cyclist.visible=true;ahead.visible=true;}
    if(!hero&&currentQuestion){
      const qid=currentQuestion.id;
      if(['q-032','q-058','q-059'].includes(qid)){cross.visible=false;cyclist.visible=false;walker.visible=false;ahead.visible=false;}
      if(qid==='q-033'){signGroup.visible=false;stopLine.visible=false;teeth.visible=false;cross.visible=true;cross.position.set(10,0,-1.9);}
      if(['q-034','q-066'].includes(qid)){cyclist.position.set(3.5,0,13.4);cross.visible=false;}
      if(qid==='q-068'){walker.position.set(4.15,0,9.5);cross.visible=false;cyclist.visible=false;zebra.visible=true;}
    }
    scene.fog.color.setHex(k==='weather'?0x39515a:0x152335);scene.background.setHex(k==='weather'?0x39515a:0x152335);
  }
  function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.fov=hero&&camera.aspect<1?53:48;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  function frame(now){if(disposed)return;const t=(now-start)/1000;const sway=animate&&hero?Math.sin(t*.14)*2:0;
    if(topDown){targetPosition.set(2,28,18);targetLook.set(0,0,2);}
    else if(hero&&camera.aspect<1){targetPosition.set(10,7,25);targetLook.set(0,1,-15);}
    else if(hero){targetPosition.set(7+sway*.25,5.4,24);targetLook.set(-7,1,-32);}
    else{targetPosition.set(2,4.4,21);targetLook.set(1,0,-2);}
    if(topDown){targetPosition.set(2,28,18);targetLook.set(0,0,2);}
    if(!cameraReady||!animate){camera.position.copy(targetPosition);currentLook.copy(targetLook);cameraReady=true;}else{camera.position.lerp(targetPosition,.08);currentLook.lerp(targetLook,.08);}
    camera.lookAt(currentLook);
    if(hero&&animate){cross.position.x=Math.sin(t*.22)*16;walker.position.x=-1+Math.sin(t*.21)*2;}
    renderer.render(scene,camera);id=requestAnimationFrame(frame);
  }
  setScene(kind);resize();id=requestAnimationFrame(frame);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.dataset.contextLost='true';});
  return {setScene,setQuestion(q){if(!q)return;currentQuestion=q;setScene(q.scene);},setMotion(v){animate=!!v;},toggleView(){topDown=!topDown;return topDown;},setTopDown(v){topDown=!!v;},dispose(){disposed=true;cancelAnimationFrame(id);observer.disconnect();const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material])){materials.add(m);if(m.map)textures.add(m.map);}});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const tx of Object.values(signTx))textures.add(tx);textures.add(poolTx);for(const tx of textures)tx.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
