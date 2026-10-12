// Original, static product and cabin scenes. Conditions come from q.context.
export const DETAIL_SCENE_IDS = Object.freeze(['q-001','q-003','q-004','q-005','q-015','q-017','q-018','q-019','q-041','q-045','q-046','q-047','q-048','q-049','q-050','q-053','q-054','q-055','q-057','q-069','q-070','q-079','q-080']);

export function buildDetailScene(T,q) {
  if(!DETAIL_SCENE_IDS.includes(q?.id)) return null;
  const scene=new T.Scene();scene.background=new T.Color('#cbd8dd');
  const camera=new T.PerspectiveCamera(42,1,.05,90);
  const materials=new Map();
  const mat=(color,roughness=.55,metalness=.05)=>{const key=[color,roughness,metalness].join('|');if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness,metalness}));return materials.get(key);};
  const put=(geo,material,x=0,y=0,z=0,parent=scene)=>{const m=new T.Mesh(geo,typeof material==='string'||typeof material==='number'?mat(material):material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const box=(w,h,d,c,x,y,z,p=scene)=>put(new T.BoxGeometry(w,h,d),c,x,y,z,p);
  const round=(w,h,d,c,x,y,z,r=.08,p=scene)=>{
    const shape=new T.Shape(),a=-w/2,b=-h/2,rr=Math.min(r,w/4,h/4,d/3);
    shape.moveTo(a+rr,b);shape.lineTo(a+w-rr,b);shape.quadraticCurveTo(a+w,b,a+w,b+rr);shape.lineTo(a+w,b+h-rr);shape.quadraticCurveTo(a+w,b+h,a+w-rr,b+h);shape.lineTo(a+rr,b+h);shape.quadraticCurveTo(a,b+h,a,b+h-rr);shape.lineTo(a,b+rr);shape.quadraticCurveTo(a,b,a+rr,b);
    const geo=new T.ExtrudeGeometry(shape,{depth:Math.max(.005,d-2*rr),bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:rr,bevelThickness:rr,curveSegments:8});geo.translate(0,0,-d/2+rr);return put(geo,c,x,y,z,p);
  };
  const cyl=(r,h,c,x,y,z,p=scene)=>put(new T.CylinderGeometry(r,r,h,48),c,x,y,z,p);
  const sphere=(r,c,x,y,z,p=scene)=>put(new T.SphereGeometry(r,24,18),c,x,y,z,p);
  const rod=(a,b,r,c,p=scene)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),m=put(new T.CylinderGeometry(r,r,av.distanceTo(bv),12),c,0,0,0,p);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...b).sub(new T.Vector3(...a)).normalize());return m;};
  const text=(lines,w=2,h=.9,bg='#102d3a',fg='#f5fcff',size=54)=>{const cv=document.createElement('canvas');cv.width=1024;cv.height=Math.round(1024*h/w);const g=cv.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,cv.width,cv.height);g.textAlign='center';g.textBaseline='middle';const rows=Array.isArray(lines)?lines:[lines];g.font=`600 ${size}px system-ui,sans-serif`;g.fillStyle=fg;rows.forEach((s,i)=>g.fillText(s,512,cv.height*(i+1)/(rows.length+1),950));const tx=new T.CanvasTexture(cv);tx.encoding=T.sRGBEncoding;const m=new T.MeshBasicMaterial({map:tx});return new T.Mesh(new T.PlaneGeometry(w,h),m);};
  const label=(lines,w,h,x,y,z,bg,fg,size)=>{const m=text(lines,w,h,bg,fg,size);m.position.set(x,y,z);scene.add(m);return m;};
  const face=(pos,look,fov=42)=>{camera.fov=fov;camera.position.set(...pos);camera.lookAt(new T.Vector3(...look));};
  const hemi=new T.HemisphereLight(0xf4fbff,0x657a80,.9);scene.add(hemi);
  const key=new T.DirectionalLight(0xfff2da,2.5);key.position.set(-4,8,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:35});key.shadow.normalBias=.018;scene.add(key);
  const rim=new T.DirectionalLight(0xbbe8ff,.7);rim.position.set(5,4,-4);scene.add(rim);
  box(60,.12,60,mat('#bbc9ce',.93),0,-.13,0);
  const rubber=mat('#171d21',.94),steel=mat('#bcc8cb',.26,.8),glass=mat('#28424c',.14,.32),teal=mat('#557c83',.3,.5),leather=mat('#35434a',.86);

  function wheel(x,y,z,r=.72,p=scene){
    const g=new T.Group();g.position.set(x,y,z);p.add(g);
    const outer=put(new T.TorusGeometry(r*.77,r*.23,14,72),rubber,0,0,0,g);outer.rotation.y=Math.PI/2;
    const side=put(new T.CylinderGeometry(r*.73,r*.73,r*.32,64),rubber,0,0,0,g);side.rotation.z=Math.PI/2;
    const rim=put(new T.CylinderGeometry(r*.49,r*.49,r*.34,48),steel,0,0,0,g);rim.rotation.z=Math.PI/2;
    for(const side of [-1,1]){const cap=put(new T.CylinderGeometry(r*.18,r*.18,.02,32),mat('#67787e',.3,.6),side*r*.18,0,0,g);cap.rotation.z=Math.PI/2;for(let k=0;k<5;k++){const a=k*Math.PI*.4;rod([side*r*.185,Math.cos(a)*r*.18,Math.sin(a)*r*.18],[side*r*.185,Math.cos(a)*r*.46,Math.sin(a)*r*.46],r*.037,steel,g);}}
    for(const ax of [-.11,0,.11]){const groove=put(new T.TorusGeometry(r*.993,.015,6,72),mat('#060d10',1),ax,0,0,g);groove.rotation.y=Math.PI/2;}
    for(let i=0;i<52;i++){const a=i/52*Math.PI*2;const tread=box(r*.36,.024,.037,mat('#31393b',1),0,Math.cos(a)*r,Math.sin(a)*r,g);tread.rotation.x=a;}
    return g;
  }
  function vehicle(x=0,z=0,p=scene){
    const g=new T.Group();g.position.set(x,0,z);p.add(g);
    round(1.9,.53,4.05,teal,0,.69,0,.12,g);round(1.86,.22,1.1,teal,0,.98,-1.43,.09,g);
    round(1.61,.77,1.85,glass,0,1.21,.06,.12,g);round(1.67,.1,1.57,teal,0,1.61,.12,.04,g);
    for(const xx of [-.98,.98]){wheel(xx,.44,-1.3,.43,g);wheel(xx,.44,1.3,.43,g);round(.055,.045,.23,steel,xx,.98,.34,.01,g);}
    round(.7,.18,.04,'#fafcf9',0,.65,-2.055,.015,g);round(.7,.18,.04,'#fafcf9',0,.65,2.055,.015,g);
    for(const xx of [-.66,.66]){round(.38,.13,.055,'#e8efe2',xx,.82,-2.055,.02,g);round(.38,.12,.055,'#c13a39',xx,.84,2.055,.02,g);}
    return g;
  }
  function seat(x,z){const g=new T.Group();scene.add(g);round(.87,.24,.92,leather,x,.49,z,.07,g);const back=round(.85,1.08,.2,leather,x,1.12,z+.39,.07,g);back.rotation.x=-.12;round(.46,.3,.19,leather,x,1.81,z+.49,.06,g);for(const off of [-.32,.32])rod([x+off,.53,z-.2],[x+off,1.56,z+.31],.018,mat('#6a777a'),g);return g;}
  function cabin(){box(3.3,.16,3.8,'#28393e',0,.1,0);round(3.25,.57,.76,leather,0,.84,-1.48,.1);round(2.3,.13,.3,'#18272c',0,1.2,-1.5,.025);seat(-.82,.32);seat(.82,.32);const steering=put(new T.TorusGeometry(.37,.038,12,48),rubber,-.82,1.22,-1.05);steering.rotation.x=.25;rod([-.82,1.22,-1.08],[-.82,.85,-1.7],.055,steel);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;rod([-.82,1.22,-1.05],[-.82+Math.sin(a)*.32,1.22+Math.cos(a)*.32,-1.05],.035,rubber);}round(.5,.18,.08,glass,0,2.13,-1.8,.03);rod([0,2.13,-1.85],[0,2.44,-1.87],.018,steel);box(.28,.48,1.3,'#24363c',0,.45,0);}
  function desktop(){round(5,.16,2.6,mat('#9b7960',.62),0,.8,0,.05);for(const x of [-2,2])for(const z of [-.85,.85])rod([x,0,z],[x,.8,z],.07,steel);const tablet=round(2.95,1.77,.13,'#28363c',0,1.9,-.4,.045);tablet.rotation.x=-.12;const scr=label(['NATKØRSEL','Din træning'],2.7,1.5,0,1.9,-.31,'#142c38','#e4f2ee',66);scr.rotation.x=-.12;round(2.1,.035,.67,'#dde7e6',0,.95,.58,.01);for(let row=0;row<4;row++)for(let col=0;col<11;col++)box(.14,.015,.085,'#809498',-.84+col*.17,.98,.34+row*.13);cyl(.21,.44,'#f0e5d1',1.92,1.1,.33);const handle=put(new T.TorusGeometry(.13,.035,8,24),mat('#f0e5d1'),2.13,1.09,.33);handle.rotation.y=Math.PI/2;face([4,3.05,5.45],[0,1.1,0]);return {tablet,scr};}
  function curb(){box(12,.025,20,'#657175',0,0,-4);box(2.2,.19,20,'#b7b5ac',4.15,.1,-4);box(.18,.22,20,'#dee0d7',2.96,.11,-4);for(let z=-10;z<6;z+=3)box(.08,.03,1.4,'#efeede',0,.04,z);}
  function parkingSign(kind,sub=''){const g=new T.Group();scene.add(g);rod([2.95,0,-2],[2.95,3.4,-2],.035,steel,g);const sign=text(kind==='accessible'?['P','♿']:kind==='no-parking'?'╱':'P',.78,.85,kind==='no-parking'?'#1d53a0':'#235b95','#fff',180);sign.position.set(2.95,3,-1.95);g.add(sign);if(kind==='no-parking'){const ring=put(new T.TorusGeometry(.37,.043,8,48),mat('#cf3b3f'),2.95,3,-1.91,g);rod([2.7,2.7,-1.87],[3.2,3.3,-1.87],.04,mat('#cf3b3f'),g);}if(sub){const m=text(sub,.98,.64,'#f2f0e5','#152029',75);m.position.set(2.95,2.22,-1.94);g.add(m);}return g;}
  let title='',viewLabel='Detaljevisning',facts=[];
  switch(q.id){
    case 'q-004': {
      wheel(0,1.28,0,1.22);const damage=new T.CatmullRomCurve3([new T.Vector3(.285,1.94,.58),new T.Vector3(.29,1.8,.47),new T.Vector3(.292,1.62,.59),new T.Vector3(.29,1.43,.49)]);put(new T.TubeGeometry(damage,16,.026,8,false),mat('#030405'));const gauge=new T.Group();scene.add(gauge);round(.86,.32,.18,mat('#d5dbd6',.3,.5),.18,2.79,.24,.045,gauge);rod([.18,2.71,.24],[.18,2.47,.24],.017,steel,gauge);const reading=text('1,3 mm',.67,.2,'#bcd3bc','#122d23',115);reading.position.set(.18,2.8,.345);gauge.add(reading);round(.75,.2,.12,'#e1e1d8',1.48,.22,.38,.03);for(let i=0;i<4;i++)round(.15,.13,.03,mat('#f8b437',.2),1.2+i*.16,.24,.45,.015);face([4,2.65,4.3],[.12,1.43,0],40);title='Morgenkontrol af dæk og blinklys';facts=['Mønster: 1,3 mm','Skade i siden','Hurtigt højre blink'];break;
    }
    case 'q-003': {
      box(3,.06,2.4,'#273137',0,0,0);for(let i=0;i<12;i++)box(2.8,.013,.05,'#39434a',0,.04,-1.1+i*.19);box(3,1.25,.1,'#344047',0,.64,-1.13);rod([-.24,.98,-1.03],[-.24,.24,.05],.048,steel);const pedal=round(.63,.29,.14,rubber,-.24,.23,.12,.035);pedal.rotation.x=-.58;for(let i=0;i<5;i++)box(.5,.025,.02,'#737b7d',-.24,.13+i*.045,.19);round(.18,.55,.11,rubber,.75,.3,-.16,.03);face([2,1.52,2.4],[0,.35,-.08],38);title='Bremsepedalen under fast tryk';facts=['Bilen holder parkeret','Pedalen synker langsomt'];break;
    }
    case 'q-005': {
      round(5,1.9,.7,leather,0,1.04,0,.18);round(3.7,1.32,.035,'#091921',0,1.12,.4,.1);for(const x of [-1.25,1.25]){const ring=put(new T.TorusGeometry(.48,.025,8,64),steel,x,1.22,.46);for(let k=0;k<12;k++){const a=k/12*4.4-2.2;rod([x+Math.sin(a)*.39,1.22+Math.cos(a)*.39,.48],[x+Math.sin(a)*.44,1.22+Math.cos(a)*.44,.48],.009,'#c6d8d7');}}
      const cv=document.createElement('canvas');cv.width=512;cv.height=320;const g=cv.getContext('2d');g.fillStyle='#091921';g.fillRect(0,0,512,320);g.strokeStyle='#ff544b';g.lineWidth=13;g.lineJoin='round';g.beginPath();g.moveTo(120,100);g.lineTo(180,100);g.lineTo(190,180);g.lineTo(325,180);g.lineTo(340,115);g.lineTo(380,98);g.moveTo(205,110);g.lineTo(270,110);g.lineTo(270,78);g.lineTo(215,78);g.closePath();g.stroke();g.beginPath();g.moveTo(394,121);g.quadraticCurveTo(370,153,394,163);g.quadraticCurveTo(418,153,394,121);g.fillStyle='#ff544b';g.fill();const tx=new T.CanvasTexture(cv);tx.encoding=T.sRGBEncoding;put(new T.PlaneGeometry(1.12,.7),new T.MeshBasicMaterial({map:tx}),0,1.2,.48);face([.35,1.72,4.7],[0,1.03,0],38);title='Rød lampe for olietryk';facts=['Motoren lyder usædvanligt','Sikker holdeplads er mulig'];break;
    }
    case 'q-001': {
      cabin();round(3,.25,.9,leather,0,.69,1.61,.08);const bottle=cyl(.12,.68,steel,.72,1.07,1.67);bottle.rotation.z=Math.PI/2;cyl(.09,.1,'#718081',1.08,1.07,1.67).rotation.z=Math.PI/2;round(.39,.24,.06,glass,-1.84,1.26,-1.55,.035).rotation.y=.32;face([4.35,3.7,4.4],[0,.9,0],44);title='Indstilling af den lånte bil';facts=['Sædet står langt tilbage','Spejlet viser mest himmel','Løs metalflaske'];break;
    }
    case 'q-015': {
      round(3.8,.52,2.7,'#4c6670',0,.4,0,.12);round(3.36,1.3,.14,leather,0,1.15,-1.22,.05);for(const x of [-1.65,1.65])round(.24,1.3,2.6,leather,x,1.02,0,.04);for(const [x,z,h,c] of [[-.8,-.48,.47,'#8c9a84'],[.63,-.49,.62,'#ad8972'],[-.8,.63,.59,'#a59a84'],[.68,.61,.58,'#818f98']]){round(1.1,h,.8,c,x,.72+h/2,z,.05);rod([x-.42,.74+h,z],[x+.42,.74+h,z],.025,'#31464c');}round(1.7,.55,.88,mat('#bf784e',.35,.45),.19,1.76,.1,.06);rod([-.25,2.05,.1],[.65,2.05,.1],.06,rubber);for(const x of [-.38,.8])box(.1,.18,.04,steel,x,1.76,.58);face([4.2,3.6,5],[0,1.12,0],40);title='En tung kasse oven på lasten';facts=['Værktøjskassen står løst øverst','Bilen føles tungere'];break;
    }
    case 'q-017': case 'q-018': {
      cabin();if(q.id==='q-017'){const phone=round(.65,1.24,.085,'#17232b',.37,1.35,-1.09,.05);phone.rotation.y=-.13;const screen=text(['NY BESKED','Tryk for at læse'],.56,1.03,'#d6e4e9','#193744',78);screen.position.set(.37,1.35,-1.025);screen.rotation.y=-.13;scene.add(screen);round(.73,.08,.1,rubber,.37,1.1,-1.03,.02);round(4.8,.03,8,'#6b787e',0,.08,-6,.01);vehicle(-.6,-4.4);face([-.9,2.52,2.65],[.08,1.1,-1.48],48);title='En besked i tæt trafik';facts=['Flere tryk er nødvendige'];}else{const cushion=round(.54,.51,.22,'#d1b7a0',-.82,1.73,.29,.1);const eyes=label('SØVNLØS NAT',2.32,.43,0,2.6,-1.5,'#354851','#f4e8de',118);face([3.2,3.3,4.2],[0,1,0],44);title='Føreren har ikke sovet';facts=['Konstant gaben','Kortvarigt tab af fokus'];}break;
    }
    case 'q-019': case 'q-050': {
      vehicle(-.9,-.4);const podium=cyl(.61,.1,'#7e9299',1.55,.04,.95);if(q.id==='q-019'){const stem=rod([1.55,.1,.95],[1.55,.48,.95],.025,steel);const cup=put(new T.CylinderGeometry(.21,.095,.45,40,1,true),mat('#e1eee8',.18,.24),1.55,.69,.95);cyl(.19,.08,'#bc695a',1.55,.84,.95);title='Bil og en fest uden en plan';facts=['Ny bilist','Du ved endnu ikke, om du vil drikke'];}else{round(1.18,.72,.035,'#e6ece7',1.55,.66,1.06,.015);label(['32 år','Første B-kørekort: 1 år'],1.05,.59,1.55,.66,1.091,'#e6ece7','#254348',82);title='Det første kørekort';facts=['Første B-kørekort er ét år gammelt'];}face([5.4,3.1,6],[.25,.7,0],42);break;
    }
    case 'q-041': {
      const car=vehicle();round(1.28,.47,2.3,'#d6dfe0',0,2.02,.12,.15,car);for(const x of [-.52,.52])box(.07,.08,1.7,'#48565e',x,1.72,.13,car);const open=round(1.28,.08,2.3,'#d6dfe0',0,2.48,.12,.028,car);open.rotation.z=-.18;round(1.08,.04,2.06,'#2d3c41',0,2.25,.12,.01,car);face([4.6,3.8,5.7],[0,1.11,0],41);title='Tom tagboks og for lidt luft';facts=['Tom tagboks','Dækkene mangler luft','Gentagne accelerationer og opbremsninger'];break;
    }
    case 'q-045': {
      seat(-.28,.2);round(1.3,.17,.9,leather,1.22,.48,.2,.06);round(1.3,.95,.16,leather,1.22,1.03,.66,.05);const child=new T.Group();scene.add(child);sphere(.2,'#ddb99a',-.27,1.27,.18,child);round(.32,.38,.2,'#b06d58',-.27,.97,.16,.07,child);rod([-.4,.8,.13],[-.45,.5,-.14],.07,'#58707e',child);rod([-.16,.8,.13],[-.09,.5,-.14],.07,'#58707e',child);rod([-.48,1.03,.13],[-.65,.82,-.03],.04,'#ddb99a',child);rod([-.05,1.03,.13],[.1,.82,-.03],.04,'#ddb99a',child);rod([-.99,.05,-.25],[-.99,1.5,-.25],.018,steel);label('120 cm',.85,.34,-1.12,1.71,-.25,'#cbd8dd','#25424d',136);face([3,2.5,4.4],[0,.88,0],40);title='Barnets passende stol står i en anden bil';facts=['Barn: 120 cm','Passende barnestol mangler i bilen'];break;
    }
    case 'q-049': case 'q-069': case 'q-070': {
      cabin();const times=q.id==='q-049'?['19.45 → 20.10']:q.id==='q-069'?['04.59 → 05.00']:['19.59 → 20.00'];round(2.7,1.03,.12,'#263a44',0,1.73,-1.61,.06);label(times,2.5,.84,0,1.73,-1.53,'#10232c','#e7f2df',134);face([.35,3.45,3.8],[0,1.08,-.2],42);title='Tidspunktet på turen';facts=['17 år','Danmark','Ingen ledsager'];break;
    }
    case 'q-053': case 'q-054': case 'q-055': case 'q-057': {
      curb();vehicle(1.88,.2);viewLabel='Kant og parkeringsområde';
      if(q.id==='q-054'){parkingSign('no-parking');const g=new T.Group();g.position.set(3.2,0,.7);scene.add(g);sphere(.15,'#dab598',0,1.49,0,g);round(.39,.51,.2,'#b19178',0,1.1,0,.06,g);for(const x of [-.1,.1])rod([x,.89,0],[x,.13,0],.067,'#435660',g);rod([-.2,1.15,0],[-.5,.88,.01],.055,'#dab598',g);rod([-.5,.88,.01],[-.55,.08,.01],.025,steel,g);title='Sammenhængende påstigning';facts=['4 minutter','C 62: parkering forbudt'];}
      else if(q.id==='q-055'){parkingSign('p',['2 timer · P-skive','hverdage 8–18']);round(1.44,.9,.09,'#255688',-.34,.52,2.62,.025);label(['P-SKIVE','Onsdag · 10.00'],1.23,.67,-.34,.53,2.681,'#255688','#fff',104);title='Båsen med P-skive';facts=['Onsdag kl. 10.00','2 timer · hverdage 8–18'];}
      else if(q.id==='q-057'){parkingSign('accessible');box(2.48,.025,5.12,'#7395a3',1.72,.04,.2);for(const x of [.35,3.04])box(.085,.03,5.15,'#ecece1',x,.06,.2);const icon=text('♿',1.2,1.1,'#7395a3','#fff',300);icon.rotation.x=-Math.PI/2;icon.position.set(1.78,.07,-1.08);scene.add(icon);title='Den reserverede bås';facts=['Intet gyldigt parkeringskort','Planlagt ophold: 2 minutter'];}
      else {title='Ventetid ved en lovlig vejkant';facts=['2 minutter','Ingen tavler eller andre forbud'];}
      face([7.3,4.4,8],[1.55,1,-.6],42);break;
    }
    default: {
      const desk=desktop();scene.remove(desk.scr);let rows;
      if(q.id==='q-046'){rows=['NATKØRSEL','Hjemmetræning'];title='Selvstændig træning hjemme';facts=['Ikke planlagt eller registreret af kørelærer'];}
      else if(q.id==='q-047'){rows=['ØVEPRØVE','Kategori B · 25 situationer'];title='Det digitale prøveformat';facts=['Digital øveprøve til kategori B'];}
      else if(q.id==='q-048'){rows=['SITUATION 8','Markér til gennemgang'];title='En situation til gennemgang';facts=['Tid tilbage','Markering og navigation er mulig'];}
      else if(q.id==='q-079'){rows=['AFSNIT 7.21','Letbaneområdet kan ikke nås'];title='Planlægning af letbaneundervisning';facts=['Mindst 45 minutters praktisk lektion'];}
      else {rows=['AFSNIT 7.22','Ruten er valgt'];title='Planen for den afsluttende lektion';facts=['Intet konkret læringsmål aftalt','Opfølgning er ikke planlagt'];}
      const scr=label(rows,2.7,1.5,0,1.9,-.31,'#142c38','#e4f2ee',q.id==='q-079'?56:64);scr.rotation.x=-.12;break;
    }
  }
  return {scene,camera,title,viewLabel,facts};
}
