import * as T from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';

export function nordicDesign(root,M,box,cyl,ball,furnish){
 const {m,oak,darkwood,metal,white,stone,concrete,fabric,blue,green,soil,glass,black}=M;
 const geoCache=new Map();
 function round(x,y,z,w,h,d,material,r=.06,parent=root){r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);const key=[w,h,d,r].join();if(!geoCache.has(key))geoCache.set(key,new RoundedBoxGeometry(w,h,d,3,Math.max(.001,r)));const o=new T.Mesh(geoCache.get(key),material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function tube(points,r,material,parent=root){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const o=new T.Mesh(new T.TubeGeometry(curve,20,r,7,false),material);o.castShadow=true;parent.add(o);return o;}
 function stem(a,b,r,material,parent=root){const from=new T.Vector3(...a),to=new T.Vector3(...b),dir=to.clone().sub(from);const o=new T.Mesh(new T.CylinderGeometry(r*.65,r,dir.length(),8),material);o.position.copy(from.add(to).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());o.castShadow=true;parent.add(o);return o;}
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');const gradient=ctx.createRadialGradient(32,32,3,32,32,32);gradient.addColorStop(0,'rgba(16,22,18,.25)');gradient.addColorStop(.55,'rgba(16,22,18,.12)');gradient.addColorStop(1,'rgba(16,22,18,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);const aoTexture=new T.CanvasTexture(canvas);const aoMat=new T.MeshBasicMaterial({map:aoTexture,transparent:true,depthWrite:false});
 function contact(x,z,w,d,y=.08){const o=new T.Mesh(new T.PlaneGeometry(w,d),aoMat);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);root.add(o);}
 let seed=42;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 function plant(x,z,s=1,parent=root){const pot=new T.Mesh(new T.CylinderGeometry(.22*s,.16*s,.4*s,32),concrete);pot.position.set(x,.21*s,z);pot.castShadow=true;parent.add(pot);cyl(x,.413*s,z,.195*s,.015,soil,parent);for(let i=0;i<11;i++){const a=i*2.399;const reach=(.2+rand()*.22)*s;const h=(.58+rand()*.65)*s;const px=x+Math.cos(a)*reach,pz=z+Math.sin(a)*reach;stem([x,.35*s,z],[px,h,pz],.009*s,green,parent);const leaf=ball(px,h,pz,1,green,parent);leaf.scale.set(.085*s,.22*s,.014*s);leaf.rotation.set(.4+rand()*.6,a,.35);}if(parent===root)contact(x,z,s*.8,s*.8);}
 function chair(x,z,rotation=0,material=fabric,parent=root){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);round(0,.48,0,.51,.1,.5,material,.045,g);for(const a of [-1,1])for(const b of [-1,1])stem([a*.24,.07,b*.24],[a*.19,.45,b*.18],.022,oak,g);tube([[-.26,.69,.03],[-.23,.84,.21],[0,.87,.25],[.23,.84,.21],[.26,.69,.03]],.032,oak,g);stem([-.18,.48,.17],[-.19,.8,.2],.018,oak,g);stem([.18,.48,.17],[.19,.8,.2],.018,oak,g);contact(x,z,.8,.8);return g;}
 function kitchen(){
  const sage=m('#717e71',{roughness:.58});furnish(-6,.6,()=>{box(-5.43,.17,.9,.82,.13,3.95,black);for(let i=0;i<6;i++)round(-5.43,.57,-.62+i*.57,.88,.72,.555,sage,.016);round(-5.39,.978,.79,1.04,.07,3.92,stone,.025);box(-5.955,1.19,.85,.023,.34,3.98,stone);box(-5.93,1.39,.85,.025,.024,3.95,m('#f6d79e',{emissive:'#ffcf85',emissiveIntensity:.7}));
  box(-5.4,1.021,-.45,.66,.013,.6,black);for(let i=0;i<4;i++){const ring=new T.Mesh(new T.TorusGeometry(.10,.004,5,28),metal);ring.rotation.x=Math.PI/2;ring.position.set(-5.4+(i%2-.5)*.31,1.034,-.45+(Math.floor(i/2)-.5)*.3);root.add(ring);}round(-4.98,.53,-.62,.025,.43,.49,black,.01);box(-4.955,.67,-.62,.026,.019,.39,metal);
  round(-5.45,1.025,1.9,.68,.018,.53,metal,.06);round(-5.43,1.04,1.9,.57,.015,.42,black,.07);tube([[-5.7,1.01,1.92],[-5.7,1.43,1.92],[-5.4,1.43,1.92],[-5.4,1.22,1.92]],.015,metal);
 });furnish(-3.9,-.1,()=>{
  round(-3.55,.56,.05,1.08,.95,2.18,oak,.07);round(-3.55,1.055,.05,1.3,.09,2.4,stone,.045);box(-2.995,.59,.05,.013,.7,2.04,darkwood);for(let i=0;i<33;i++)round(-2.97,.60,-.93+i*.061,.055,.75,.031,oak,.013);contact(-3.5,.05,1.7,2.7);
  for(const z of [-.52,.58]){cyl(-2.5,.66,z,.24,.06,oak);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;stem([-2.5+Math.cos(a)*.21,.1,z+Math.sin(a)*.21],[-2.5+Math.cos(a)*.12,.63,z+Math.sin(a)*.12],.022,metal);}const ring=new T.Mesh(new T.TorusGeometry(.18,.012,6,24),metal);ring.rotation.x=Math.PI/2;ring.position.set(-2.5,.31,z);root.add(ring);}
 });furnish(-6,-1.2,()=>{
  round(-5.48,1.22,-.94,.92,2.22,.43,sage,.012);box(-4.998,1.62,-.95,.018,.025,.36,black);box(-4.998,.74,-.95,.018,.025,.36,black);
 });furnish(-.5,.7,()=>{
  const diningStart=root.children.length;
  const table=cyl(-.77,.79,.12,.83,.075,oak);table.scale.z*=1.15;cyl(-.77,.43,.12,.24,.66,darkwood);contact(-.77,.12,2.3,2.4);// The chair's back is local +Z; aim its front (-Z) at the table centre.
  for(const [x,z]of[[-.77,-1.0],[-.77,1.24],[-1.84,.12],[.29,.12]])chair(x,z,Math.atan2(x+.77,z-.12));
  cyl(-.85,.96,.08,.13,.24,white);for(let i=0;i<4;i++)stem([-.85,1.06,.08],[-.85+Math.sin(i)*.12,1.3+rand()*.1,.08+Math.cos(i)*.12],.006,green);for(const x of [-1.08,-.4]){cyl(x,.84,.42,.17,.008,white);cyl(x,.88,-.23,.07,.09,white);}
  // Keep the northern chair clear of the bathroom wall and doorway.
  for(const object of root.children.slice(diningStart))object.position.z+=.50;});
 }
 function living(){
  round(-2.5,.094,3.7,5.8,.025,3.10,m('#beb8a9',{bumpMap:M.weave,bumpScale:.025}),.01);
  furnish(-5.4,3.6,()=>{
   round(-4.7,.31,3.38,1.0,.30,2.80,fabric,.13);round(-5.16,.67,3.38,.24,.68,2.85,fabric,.1);
   for(const z of [2.01,4.76])round(-4.68,.56,z,1.02,.47,.20,fabric,.09);
   for(let i=0;i<3;i++)round(-4.67,.54,2.46+i*.91,.86,.17,.86,fabric,.07);
   round(-3.94,.31,4.33,1.58,.30,.91,fabric,.11);round(-3.94,.54,4.33,1.58,.17,.84,fabric,.07);
   for(const z of [2.50,3.47]){const p=round(-4.92,.83,z,.20,.44,.46,blue,.075);p.rotation.z=-.2;}
  });
  furnish(-2.65,3.5,()=>{const t=cyl(-2.65,.43,3.5,.68,.09,stone);t.scale.z=.83;cyl(-2.65,.26,3.5,.23,.30,stone);round(-2.74,.49,3.5,.39,.022,.27,white,.006);cyl(-2.41,.53,3.5,.075,.1,white);});
  furnish(-.25,4.55,()=>{const arm=new T.Group();arm.position.set(-.30,0,4.55);arm.rotation.y=-.40;root.add(arm);round(0,.42,0,.72,.23,.75,blue,.09,arm);round(0,.75,.3,.75,.52,.16,blue,.075,arm);for(const x of [-.39,.39]){round(x,.63,.02,.07,.12,.73,oak,.03,arm);for(const z of [-.22,.26])stem([x,.1,z],[x,.64,z],.027,oak,arm);}});
  furnish(1.5,3.7,()=>{box(1.38,1.35,3.7,.08,2.45,2.65,darkwood);for(let i=0;i<39;i++)box(1.325,1.35,2.42+i*.067,.04,2.44,.029,oak);round(1.04,.40,3.7,.52,.30,2.65,oak,.025);box(1.24,1.36,3.7,.04,1.03,1.78,black);box(1.212,1.36,3.7,.013,.95,1.66,m('#263940',{roughness:.15,metalness:.3}));});
  furnish(-5.65,4.9,()=>{cyl(-5.32,.12,4.75,.22,.028,metal);tube([[-5.32,.13,4.75],[-5.32,1.9,4.75],[-4.98,1.98,4.75]],.016,metal);const shade=new T.Mesh(new T.SphereGeometry(.2,24,12,0,Math.PI*2,0,Math.PI/2),white);shade.position.set(-4.98,1.96,4.75);root.add(shade);});
  furnish(.6,5.15,()=>plant(.69,4.95,.8));
 }
 function bed(x,z,w,cover){
  contact(x,z,w+1.3,3.2,.075);round(x,.26,z,w+.05,.3,2.22,fabric,.075);round(x,.49,z,w,.23,2.15,white,.09);round(x,.65,z+.25,w+.01,.17,1.51,cover,.078);round(x,.74,z-.24,w,.045,.36,cover,.022);round(x,.9,z-1.0,w+.36,1.3,.19,fabric,.078);
  for(const dx of w>1.4?[-.43,.43]:[0]){const p=round(x+dx,.72,z-.68,w>1.4?.7:.84,.21,.49,white,.09);p.rotation.x=-.06;}
  for(const dx of [-1,1]){const px=x+dx*(w/2+.42);cyl(px,.36,z-.75,.25,.07,oak);cyl(px,.21,z-.75,.09,.24,metal);cyl(px,.45,z-.75,.075,.14,metal);const shade=new T.Mesh(new T.SphereGeometry(.18,24,12,0,Math.PI*2,0,Math.PI/2),white);shade.position.set(px,.6,z-.75);root.add(shade);}
 }
 function landscape(){
  // Large-format urban paving and a quiet gravel garden replace cartoon hedges.
  box(8,-.225,2.5,3.6,.06,8.7,concrete);for(let i=0;i<5;i++)for(let j=0;j<6;j++)box(6.33+i*.69,-.19,-1.58+j*1.42,.677,.027,1.4,concrete);
  for(const [x,z,w,d]of[[-7.23,-.55,1.65,12.4],[.3,-6.84,14.4,1.42],[9.88,-.45,.62,10.8]]){box(x,-.18,z,w,.10,d,m('#929589',{bumpMap:M.noise,bumpScale:.035}));for(const dx of [-1,1])box(x+dx*w/2,-.11,z,.045,.18,d,metal);}
  const bladeGeometry=new T.ConeGeometry(.027,.58,3);const grassMat=m('#6e755d',{side:T.DoubleSide});const blades=new T.InstancedMesh(bladeGeometry,grassMat,630);const dummy=new T.Object3D();for(let i=0;i<630;i++){const patch=Math.floor(i/35);const px=patch<8?-7.2:patch<12?-4.5+(patch-8)*2.9:9.85;const pz=patch<8?-5.4+patch*1.5:patch<12?-6.8:-4.8+(patch-12)*1.5;dummy.position.set(px+(rand()-.5)*.65,.07+rand()*.08,pz+(rand()-.5)*.65);dummy.scale.set(.8+rand(),.6+rand()*.8,.8+rand());dummy.rotation.set((rand()-.5)*.45,rand()*Math.PI,(rand()-.5)*.45);dummy.updateMatrix();blades.setMatrixAt(i,dummy.matrix);}blades.castShadow=true;root.add(blades);
  function tree(x,z,s){const bark=m('#777367',{bumpMap:M.noise,bumpScale:.04});stem([x,-.15,z],[x+.07*s,2.7*s,z],.06*s,bark);const centers=[];for(let i=0;i<9;i++){const a=i*2.4,h=(1.45+i*.15)*s;const px=x+Math.cos(a)*(.5+rand()*.3)*s,pz=z+Math.sin(a)*(.5+rand()*.3)*s;stem([x,h*.68,z],[px,h+.7*s,pz],.022*s,bark);centers.push([px,h+.58*s,pz]);}const mesh=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),m('#ffffff',{roughness:.95}),540);for(let i=0;i<540;i++){const center=centers[i%centers.length];const theta=rand()*Math.PI*2,rad=Math.sqrt(rand())*.60*s;dummy.position.set(center[0]+Math.cos(theta)*rad,center[1]+(rand()-.5)*.78*s,center[2]+Math.sin(theta)*rad);dummy.scale.set((.08+rand()*.08)*s,(.12+rand()*.15)*s,.035*s);dummy.rotation.set(rand()*2,rand()*6,rand()*2);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color().setHSL(.23+rand()*.04,.12+rand()*.12,.30+rand()*.16).convertSRGBToLinear());}mesh.castShadow=true;root.add(mesh);contact(x,z,2.4*s,2.4*s,-.13);}
  tree(-7.45,-4.6,1.12);tree(7.6,-6.4,1.1);tree(-7.6,6.1,.83);
  // Custom outdoor lounge, low travertine table and dark slatted pergola.
  round(-3.45,.32,7.36,2.7,.29,.82,metal,.07);round(-3.45,.50,7.36,2.56,.12,.76,fabric,.055);round(-3.45,.76,7.73,2.65,.49,.12,fabric,.055);for(const x of [-4.86,-2.04])box(x,.54,7.38,.06,.52,.91,metal);
  const outdoorTable=cyl(-3.45,.4,6.36,.55,.07,stone);outdoorTable.scale.z=.7;cyl(-3.45,.24,6.36,.19,.24,stone);round(-1.25,.39,6.6,.75,.16,.81,fabric,.055);round(-1.25,.66,6.96,.75,.49,.14,fabric,.045);for(const x of [-1.65,-.85])box(x,.43,6.6,.045,.67,.8,metal);plant(1.3,7.12,1.12);plant(-5.4,7.4,.9);
  const pergola=new T.Group();root.add(pergola);for(const x of [-5.85,-.45]){box(x,1.32,7.99,.075,2.82,.075,metal,pergola);box(x,2.76,6.75,.095,.16,2.7,metal,pergola);}box(-3.15,2.76,7.99,5.48,.16,.09,metal,pergola);box(-3.15,2.76,5.51,5.48,.16,.09,metal,pergola);for(let i=0;i<18;i++)box(-5.7+i*.30,2.8,6.75,.08,.09,2.56,oak,pergola);
  const pathLights=[];for(const [x,z]of[[6.8,.8],[6.8,-.8],[-6.35,5.85],[1.8,6.8]]){box(x,.11,z,.09,.54,.09,metal);const glow=box(x,.35,z,.1,.035,.1,m('#f0d49e',{emissive:'#ffcd83',emissiveIntensity:.15}));pathLights.push(glow.material);}
  return {pergola,pathLights};
 }
 function car(){
  const g=new T.Group();g.position.set(8.05,0,3.55);root.add(g);
  const paint=new T.MeshPhysicalMaterial({color:'#d5ddd9',metalness:.62,roughness:.24,clearcoat:1,clearcoatRoughness:.1});
  const glazing=new T.MeshPhysicalMaterial({color:'#17313a',metalness:.48,roughness:.12,clearcoat:1,clearcoatRoughness:.05});
  const alloy=m('#aab8bc',{metalness:1,roughness:.22}),rubber=m('#171d20',{roughness:.88}),trim=m('#303b3e',{metalness:.5,roughness:.3});
  // Continuous bevelled cross-sections form a sculpted fastback body, not stacked boxes.
  function loft(stations,material){const positions=[],indices=[];for(const [z,w,lo,hi]of stations){const bevel=Math.min(.11,(hi-lo)*.28);for(const [x,y]of[[-w*.84,lo],[w*.84,lo],[w,lo+bevel],[w,hi-bevel],[w*.86,hi],[-w*.86,hi],[-w,hi-bevel],[-w,lo+bevel]])positions.push(x,y,z);}
   for(let i=0;i<stations.length-1;i++)for(let j=0;j<8;j++){const a=i*8+j,b=i*8+(j+1)%8,c=b+8,d=a+8;indices.push(a,b,c,a,c,d);}for(const [index,front]of[[0,false],[stations.length-1,true]]){const [z,,lo,hi]=stations[index];const centre=positions.length/3;positions.push(0,(lo+hi)/2,z);for(let j=0;j<8;j++){const a=index*8+j,b=index*8+(j+1)%8;indices.push(...(front?[centre,a,b]:[centre,b,a]));}}
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();const mesh=new T.Mesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;}
  loft([[-2.15,.72,.37,.68],[-1.94,.91,.29,.91],[-1.3,.94,.28,.98],[-.4,.93,.27,.91],[.7,.94,.28,.93],[1.45,.92,.30,.85],[2.07,.82,.36,.72],[2.18,.69,.42,.63]],paint);
  loft([[-1.55,.64,.83,.92],[-1.04,.73,.85,1.33],[-.53,.72,.87,1.46],[.28,.71,.88,1.43],[.98,.75,.84,1.0],[1.13,.73,.82,.88]],glazing);
  // Panoramic roof, body-colour pillars, flush handles and mirrors.
  round(-.02,1.462,-.16,1.16,.023,.65,glazing,.01,g);
  for(const side of [-1,1]){
   tube([[side*.71,.93,.98],[side*.63,1.40,.29],[side*.62,1.43,-.54],[side*.69,1.27,-1.1],[side*.72,.89,-1.55]],.026,paint,g);
   stem([side*.739,.90,-.25],[side*.631,1.43,-.25],.027,trim,g);
   tube([[side*.947,.79,1.02],[side*.953,.83,.2],[side*.953,.82,-.84]],.009,trim,g);
   for(const z of [.40,-.73])round(side*.945,.80,z,.014,.029,.19,trim,.01,g);
   round(side*1.02,1.0,.80,.21,.075,.18,paint,.035,g);stem([side*.78,.94,.78],[side*.97,.97,.80],.022,trim,g);
   round(side*.943,.34,0,.035,.09,2.27,trim,.015,g);
   for(const z of [-1.31,1.32]){const tyre=cyl(side*.925,.25,z,.385,.20,rubber,g);tyre.rotation.z=Math.PI/2;const outer=side*1.031;
    const rim=cyl(outer,.25,z,.287,.015,trim,g);rim.rotation.z=Math.PI/2;const disc=cyl(outer+side*.008,.25,z,.24,.012,alloy,g);disc.rotation.z=Math.PI/2;
    for(let j=0;j<5;j++){const a=j*Math.PI*2/5;const spoke=round(outer+side*.025,.25+Math.cos(a)*.14,z+Math.sin(a)*.14,.018,.26,.052,alloy,.015,g);spoke.rotation.x=a;}
    const hub=cyl(outer+side*.034,.25,z,.072,.02,trim,g);hub.rotation.z=Math.PI/2;
    // Thin arch cladding follows the wheel's upper half.
    const points=[];for(let k=0;k<=20;k++){const a=k*Math.PI/20;points.push([side*.975,.25+Math.sin(a)*.42,z+Math.cos(a)*.42]);}tube(points,.026,trim,g);
   }
  }
  const led=m('#ecf8ff',{emissive:'#b6e0ff',emissiveIntensity:.75}),red=m('#b64040',{emissive:'#d62424',emissiveIntensity:.6});
  tube([[-.70,.68,2.105],[-.36,.70,2.16],[.36,.70,2.16],[.70,.68,2.105]],.013,led,g);
  for(const side of [-1,1]){round(side*.69,.58,2.09,.13,.036,.04,led,.008,g);round(side*.77,.48,2.055,.11,.11,.05,trim,.02,g);}
  round(0,.415,2.13,.91,.055,.035,trim,.016,g);round(0,.53,2.19,.36,.065,.018,white,.008,g);
  tube([[-.80,.82,-2.025],[-.4,.83,-2.08],[.4,.83,-2.08],[.80,.82,-2.025]],.016,red,g);
  round(0,.93,-1.83,1.40,.038,.22,trim,.017,g);round(0,.34,-2.06,1.32,.10,.045,trim,.02,g);
  contact(8.05,3.55,2.8,5.0,-.16);
  box(9.42,.5,2.35,.11,1.4,.14,metal);round(9.42,1.15,2.35,.36,.59,.19,metal,.075);const evLed=box(9.42,1.20,2.452,.075,.22,.012,m('#9ac5b0',{emissive:'#6da98a',emissiveIntensity:.2}));
  const cable=tube([[9.42,1.0,2.45],[9.66,.4,2.7],[9.51,-.1,3.2],[9.01,.65,3.8]],.022,rubber);round(.952,.65,.25,.035,.15,.17,trim,.025,g);return {evLed,cable};
 }
 function facade(roof){
  // Recessed entrance and thermo-ash accents give the flat-roof villa its identity.
  const cladding=new T.Group();roof.add(cladding);box(6.11,1.46,-3.01,.08,2.68,4.5,black,cladding);for(let i=0;i<53;i++)box(6.17,1.46,-5.21+i*.084,.075,2.65,.043,oak,cladding);
  box(3.89,.49,5.62,4.18,.99,.08,black,cladding);for(const x of [1.98,5.66])box(x,1.46,5.62,.40,2.69,.08,black,cladding);for(let i=0;i<50;i++)box(1.82+i*.084,1.46,5.68,.043,2.65,.07,oak,cladding);
  // Large office glazing cuts the timber accent into two slim piers.
  // The screen sits in front of the central slats, which are removed in that zone.
  cladding.children.filter(o=>o.position.z===5.68&&o.position.x>2.18&&o.position.x<5.36).forEach(o=>{o.scale.y=.35;o.position.y=.34;});
  for(const y of [.80,2.60])box(3.75,y,5.731,3.2,.07,.075,metal,cladding);for(const x of [2.18,5.32])box(x,1.70,5.731,.07,1.8,.075,metal,cladding);box(3.75,1.70,5.753,3.02,1.65,.026,glass,cladding);box(3.75,1.70,5.773,.042,1.7,.036,metal,cladding);
  box(6.50,2.56,1.23,1.16,.12,2.28,metal,roof);box(6.15,1.44,.17,.22,2.56,.12,metal,roof);box(6.17,1.38,2.22,.19,2.7,.15,metal,roof);box(6.10,.15,1.22,.24,.10,2.24,metal,roof);
  const numberCanvas=document.createElement('canvas');numberCanvas.width=128;numberCanvas.height=64;const c=numberCanvas.getContext('2d');c.fillStyle='#242d30';c.fillRect(0,0,128,64);c.fillStyle='#d9d4c5';c.font='300 38px Arial';c.textAlign='center';c.fillText('180',64,45);const tex=new T.CanvasTexture(numberCanvas);tex.colorSpace=T.SRGBColorSpace;const number=new T.Mesh(new T.PlaneGeometry(.44,.22),new T.MeshBasicMaterial({map:tex}));number.rotation.y=Math.PI/2;number.position.set(6.205,1.88,2.2);roof.add(number);
 }
 return {round,tube,stem,contact,plant,chair,kitchen,living,bed,landscape,car,facade};
}


