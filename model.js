import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {devices,categories} from './state.js';
import {icon} from './icons.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {nordicMaterials} from './materials.js';
import {nordicDesign} from './nordic.js';
import {EffectComposer} from './vendor/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/postprocessing/RenderPass.js';
import {SSAOPass} from './vendor/postprocessing/SSAOPass.js';
import {OutputPass} from './vendor/postprocessing/OutputPass.js';

export function createHouse(container,hotspotLayer,onSelect){
 const scene=new T.Scene();
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
 const environmentScene=new RoomEnvironment();const pmrem=new T.PMREMGenerator(renderer);const environment=pmrem.fromScene(environmentScene,.025);scene.environment=environment.texture;scene.environmentIntensity=.42;environmentScene.dispose();pmrem.dispose();
 renderer.domElement.setAttribute('aria-label','3D model kuće. Uređaje možete odabrati na oznakama ili u popisu Svi uređaji.');renderer.domElement.setAttribute('role','img');container.append(renderer.domElement);
 const camera=new T.OrthographicCamera(-16,16,10,-10,.1,140);camera.position.set(20,34,27);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(.5,0,0);controls.enableDamping=true;controls.dampingFactor=.09;controls.minPolarAngle=.05;controls.maxPolarAngle=1.27;controls.minZoom=.65;controls.maxZoom=2.8;controls.enablePan=false;controls.rotateSpeed=.55;controls.zoomSpeed=.75;
 const composer=new EffectComposer(renderer,new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,samples:2}));composer.addPass(new RenderPass(scene,camera));
 const ao=new SSAOPass(scene,camera,1,1,16);ao.kernelRadius=.68;ao.minDistance=.002;ao.maxDistance=.07;ao.ssaoMaterial.defines.PERSPECTIVE_CAMERA=0;ao.depthRenderMaterial.defines.PERSPECTIVE_CAMERA=0;
 const visibility=ao.overrideVisibility.bind(ao);ao.overrideVisibility=()=>{visibility();scene.traverse(o=>{if(o.isMesh&&o.material?.transparent)o.visible=false;});};composer.addPass(ao);const outputPass=new OutputPass();composer.addPass(outputPass);
 const hemi=new T.HemisphereLight(0xe1ebf1,0x707365,1.25);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffedcf,2.8);sun.position.set(-9,18,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:1,far:60});sun.shadow.normalBias=.045;sun.shadow.bias=-.0001;scene.add(sun);
 const fill=new T.DirectionalLight(0xc7dfea,.7);fill.position.set(15,12,-9);scene.add(fill);
 // 180 m² footprint. Architecture expands; furniture retains human dimensions.
 const footprintScale=Math.sqrt(180/132);
 const root=new T.Group();root.scale.set(footprintScale,1,footprintScale);scene.add(root);
 function furnish(x,z,build){const start=root.children.length;const result=build();const group=new T.Group();group.scale.set(1/footprintScale,1,1/footprintScale);group.position.set(x*(1-1/footprintScale),0,z*(1-1/footprintScale));for(const child of root.children.slice(start))group.add(child);root.add(group);return result;}
 const M=nordicMaterials();const mat=M.m;
 const {plaster,cap,oak,darkwood,metal,white,stone,green,soil,glass,fabric,blue,terracotta,black}=M;
 const unitBox=new T.BoxGeometry(1,1,1),cylinderGeometry=new T.CylinderGeometry(1,1,1,28),ballGeometry=new T.SphereGeometry(1,18,12);
 function box(x,y,z,w,h,d,m,parent=root){const o=new T.Mesh(unitBox,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function cyl(x,y,z,r,h,m,parent=root){const o=new T.Mesh(cylinderGeometry,m);o.position.set(x,y,z);o.scale.set(r,h,r);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function ball(x,y,z,r,m,parent=root){const o=new T.Mesh(ballGeometry,m);o.position.set(x,y,z);o.scale.setScalar(r);o.castShadow=true;parent.add(o);return o;}
 function line(points,color,width=1,parent=root){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const l=new T.Line(g,new T.LineBasicMaterial({color,transparent:true,opacity:.55,linewidth:width}));parent.add(l);return l;}
 const design=nordicDesign(root,M,box,cyl,ball,furnish);const {round}=design;const flooring=M.flooring;
 // Raised garden slab, walkway, outdoor deck and carefully furnished rooms.
 box(.8,-.52,0,21,.25,17,mat('#5c6563'));box(.8,-.34,0,20.7,.11,16.7,M.lawn);box(0,-.2,0,12.5,.3,11.5,stone);box(0,-.025,0,12,.09,11,flooring);
 box(-3,.005,-3.4,5.8,.1,4.1,flooring);box(0,.035,-3.4,2.7,.06,4.0,M.concrete);box(4.6,.035,.05,2.5,.06,2.3,M.concrete);
 for(let i=0;i<6;i++)for(let j=0;j<8;j++)box(-1.28+i*.47,.071,-5.34+j*.51,.457,.004,.499,stone);
 const deck=new T.Group();root.add(deck);box(-2,-.12,6.8,8,.12,2.7,oak,deck);for(let i=0;i<32;i++)box(-5.85+i*.25,-.05,6.8,.235,.022,2.7,oak,deck);
 box(8,-.22,2.5,3.5,.04,8.5,mat('#b7bcb8'));for(let i=0;i<5;i++)box(6.95,-.15,1.4-i*.5,1.3,.12,.38,stone);
 // Full-height architecture; an explicit section view is available for exploration.
 const structureStart=root.children.length;const sectionCaps=new T.Group();root.add(sectionCaps);sectionCaps.visible=false;
 function wall(x,z,w,d,h=2.65){if(h>1.45)box(x,1.447,z,w,.025,d,cap,sectionCaps);box(x,h/2+.1,z,w,h,d,plaster);box(x,h+.11,z,w+.035,.035,d+.035,cap);box(x,.19,z,w+.025,.12,d+.025,white);}
 function backWindow(x,w){wall(x,-5.5,w,.18,.72);box(x,2.38,-5.5,w,.32,.18,plaster);box(x,1.55,-5.5,w-.07,1.42,.055,glass);box(x,.85,-5.49,w,.075,.16,metal);box(x,2.23,-5.49,w,.075,.16,metal);for(const a of [-w/2,0,w/2])box(x+a,1.55,-5.49,.045,1.45,.14,metal);}
 wall(-5.75,-5.5,.5,.18,2.55);backWindow(-3.65,3.7);wall(-1.62,-5.5,.35,.18,2.55);backWindow(0,2.85);wall(1.6,-5.5,.35,.18,2.55);backWindow(3.75,3.9);wall(5.85,-5.5,.3,.18,2.55);
 // Continuous exterior walls with one accurately framed entrance on the east.
 wall(-6,-3.35,.18,4.3,2.55);wall(-6,2.15,.18,6.7,.78);
 wall(6,-2.75,.18,5.5,1);wall(6,.425,.18,.85,2.55);wall(6,2.225,.18,.55,2.55);wall(6,4,.18,3,.7);
 wall(-1.5,-3.35,.14,4.3,2.65);wall(1.5,-3.35,.14,4.3,2.65);
 
 // A single opening definition produces both wall segments and a fitted closed door.
 // Solid lintels and full-height leaves belong to the same partition.
 function partitionDoor(axis,fixed,start,end,openingStart,openingEnd){
  const width=openingEnd-openingStart,mid=(openingStart+openingEnd)/2;
  function part(a,b){if(b-a<.02)return;axis==='x'?wall((a+b)/2,fixed,b-a,.14,2.65):wall(fixed,(a+b)/2,.14,b-a,2.65);}
  part(start,openingStart);part(openingEnd,end);
  const g=new T.Group();g.position.set(axis==='x'?mid:fixed,0,axis==='x'?fixed:mid);if(axis==='z')g.rotation.y=-Math.PI/2;root.add(g);
  for(const side of [-1,1])box(side*(width/2-.028),1.17,0,.056,2.14,.205,white,g);
  box(0,1.155,0,width-.112,2.11,.045,oak,g);
  box(0,2.25,0,width+.02,.07,.205,white,g);
  box(0,2.52,0,width,.46,.14,plaster,g);box(0,2.762,0,width,.035,.175,cap,g);
  box(0,.097,0,width,.014,.16,stone,g);
  // Lever handles sit on the latch edge, on both faces of the leaf.
  for(const face of [-1,1]){box(width/2-.18,.96,face*.033,.035,.11,.021,metal,g);box(width/2-.215,.97,face*.062,.12,.024,.028,metal,g);}
 }
 partitionDoor('x',-1.2,-6,-1.5,-2.65,-1.65); // Main bedroom, from the day zone.
 partitionDoor('x',-1.2,-1.5,1.5,.30,1.20); // One bathroom entrance, no second gap.
 partitionDoor('x',-1.2,1.5,6,1.75,2.75); // Child's bedroom, from the hall.
 wall(1.5,3.75,.15,3.5,2.65);
 partitionDoor('x',2,1.5,6,1.75,2.75); // Office, from the entrance hall.
 wall(3.45,-.40,.14,1.60,2.65);
 partitionDoor('x',.40,3.45,6,3.65,4.55); // Technical room opens south onto the entrance hall.
 // Slim terrace glazing and an explicit sliding-door threshold.
 wall(0,5.5,12,.16,.08);const terraceFrames=new T.Group();root.add(terraceFrames);
 box(-2.15,.185,5.5,2.5,.045,.14,metal,terraceFrames);box(-.97,.97,5.56,.023,.24,.028,metal,terraceFrames);
 const frontDoor=box(6,1.16,1.4,.075,2.08,.99,darkwood);
 for(const z of [.86,1.94])box(6,1.17,z,.20,2.17,.07,metal);box(6,2.225,1.4,.20,.08,1.15,metal);box(6,.105,1.4,.24,.055,1.13,stone);
 box(6.06,1.10,1.75,.045,.48,.03,metal);
 const structure=root.children.slice(structureStart).filter(o=>o!==sectionCaps);
 function legs(x,z,w,d,height=.67){for(const a of [-1,1])for(const b of [-1,1])box(x+a*w/2,height/2+.09,z+b*d/2,.07,height,.07,darkwood);}
 const plant=design.plant;
 // Bespoke kitchen, rounded oak dining and bouclé living-room furniture.
 design.kitchen();design.living();
 // Bedrooms: upholstered beds, duvet folds, pillows, side tables, wardrobes.
 const bed=design.bed;
 furnish(-3.65,-5.25,()=>bed(-3.65,-4.22,1.85,mat('#929b8b',{bumpMap:M.weave,bumpScale:.04})));furnish(-6,-3.8,()=>{box(-5.55,1.10,-3.8,.65,2.0,2.8,oak);for(let i=0;i<4;i++)box(-5.205,1.05,-4.82+i*.68,.015,1.81,.015,oak);});furnish(-1.5,-5.2,()=>plant(-2.1,-4.6,.85));
 furnish(4.5,-5.25,()=>bed(4.5,-4.22,1.12,mat('#b4aca0',{bumpMap:M.weave,bumpScale:.04})));furnish(1.9,-5.15,()=>{box(2.18,.78,-4.8,1.05,.08,.55,oak);legs(2.18,-4.8,.86,.4,.69);box(2.18,.45,-4.05,.47,.08,.5,fabric);box(2.18,.7,-3.83,.47,.48,.07,blue);});furnish(5.8,-1.5,()=>{box(5.55,.55,-1.8,.48,1.02,1.05,oak);for(let i=0;i<5;i++)box(5.4,.82,-2.15+i*.14,.14,.37,.09,[terracotta,blue,green][i%3]);cyl(3.2,.11,-2.0,.6,.04,mat('#bda180'));ball(3.4,.3,-1.9,.2,terracotta);});
 // Bathroom: separate wet zone, a west-facing vanity and WC fixed to the west wall.
 furnish(1.4,-5.35,()=>{
  box(.72,.13,-4.72,1.24,.06,1.35,stone);box(.08,1.08,-4.72,.025,1.94,1.35,glass);
  box(.08,2.065,-4.72,.025,.025,1.35,metal);box(.72,.17,-5.26,.60,.012,.025,metal);
  design.tube([[1.05,1.1,-5.30],[1.05,2.13,-5.30],[1.05,2.13,-4.99]],.014,metal);
  cyl(1.05,2.105,-4.95,.15,.03,metal);box(1.05,1.12,-5.33,.20,.06,.025,metal);
 });
 furnish(-1.5,-4.5,()=>{
  round(-1.08,.66,-4.52,.64,.55,1.2,oak,.025);box(-1.08,.96,-4.52,.69,.065,1.26,stone);
  round(-1.07,1.02,-4.52,.46,.10,.64,white,.045);round(-1.03,1.076,-4.52,.31,.008,.47,stone,.035);
  design.tube([[-1.3,1.0,-4.52],[-1.3,1.27,-4.52],[-1.05,1.27,-4.52]],.014,metal);
  box(-1.402,1.61,-4.52,.022,.90,1.13,metal);box(-1.385,1.61,-4.52,.012,.85,1.08,glass);
 });
 furnish(-1.5,-2.52,()=>{
  const wc=new T.Group();wc.position.set(-1.29,0,-2.52);wc.rotation.y=Math.PI/2;root.add(wc);
  // Cistern at the wall, pan and seat projecting into the room (+X).
  round(0,.65,-.055,.40,.98,.18,white,.025,wc);box(0,1.15,-.053,.24,.018,.11,metal,wc);
  round(0,.29,.30,.34,.36,.46,white,.11,wc);round(0,.46,.28,.39,.17,.57,white,.075,wc);
  const seat=new T.Mesh(new T.TorusGeometry(.16,.033,10,40),white);seat.rotation.x=-Math.PI/2;seat.scale.y=1.38;seat.position.set(0,.56,.32);wc.add(seat);
  const bowl=new T.Mesh(new T.CircleGeometry(.139,40),M.m('#8e9b99'));bowl.rotation.x=-Math.PI/2;bowl.scale.y=1.45;bowl.position.set(0,.536,.32);wc.add(bowl);
  box(.40,.78,-.075,.018,.035,.23,metal,wc);const roll=cyl(.40,.78,.02,.068,.12,white,wc);roll.rotation.x=Math.PI/2;
 });
 // Towel rail and clear circulation from the south-east door.
 furnish(1.5,-2.7,()=>{for(const y of [.55,.85,1.15,1.45])box(1.36,y,-2.55,.05,.025,.52,metal);box(1.31,1.02,-2.55,.06,.48,.40,fabric);});
 // Office, bookshelves and working display.
 let screen;furnish(4.4,5.3,()=>{
 round(4.36,.79,4.76,2.1,.07,.71,oak,.034);legs(4.36,4.76,1.8,.5,.72);box(4.34,1.18,4.88,.92,.58,.045,black);screen=box(4.34,1.19,4.849,.83,.49,.01,mat('#749b9f',{emissive:'#426b6e',emissiveIntensity:.2}));box(4.34,.91,4.48,.53,.025,.19,metal);round(4.35,.49,3.94,.57,.1,.55,blue,.045);round(4.35,.78,3.69,.55,.54,.1,blue,.045);cyl(4.35,.29,3.94,.035,.33,metal);for(let i=0;i<5;i++){const a=i*1.257;design.stem([4.35,.11,3.94],[4.35+Math.cos(a)*.33,.07,3.94+Math.sin(a)*.33],.016,metal);}});furnish(1.6,4.25,()=>{box(2.17,.62,4.25,.43,1.1,1.95,oak);for(let j=0;j<3;j++){box(2.17,.28+j*.42,4.25,.5,.06,1.97,white);for(let i=0;i<8;i++)box(2.2,.44+j*.42,3.48+i*.19,.27,.27,.11,[blue,terracotta,green,fabric][(i+j)%4]);}});furnish(5.6,2.3,()=>plant(5.4,2.8,1.05));
 // Technical equipment and local controller.
 furnish(6,-.4,()=>{
 box(5.63,1,-.35,.42,1.75,1.0,white);box(5.38,1.25,-.4,.04,.5,.52,metal);});
 furnish(4.65,-1.2,()=>{box(4.65,1.72,-1.04,.52,.80,.20,white);box(4.65,1.75,-.928,.20,.12,.012,blue);});
 furnish(3.45,-.4,()=>{box(3.77,.78,-.38,.48,.07,.80,oak);box(3.78,.91,-.38,.29,.18,.38,white);box(3.94,.94,-.38,.012,.025,.16,mat('#75b695',{emissive:'#75b695',emissiveIntensity:1}));});
 furnish(6,-1.2,()=>box(5.78,1.6,-1.0,.03,.55,.48,white));
 furnish(4.6,-1.2,()=>{round(4.6,.55,-.70,.67,.90,.67,white,.02);const drum=cyl(4.6,.53,-.35,.22,.026,metal);drum.rotation.x=Math.PI/2;box(4.6,.86,-.355,.41,.05,.012,black);});
 // Modern planting, pergola and a detailed EV replace the original block model.
 const {pergola,pathLights}=design.landscape();const {evLed,cable}=furnish(8.7,3.55,()=>design.car());
 // Distinct physical devices can be clicked in addition to screen-space pins.
 const clickMeshes=[];
 const physical={};for(const d of devices){if(['living','kitchen','bedlight','floor','solar','ev','irrigation','blinds'].includes(d.id))continue;const p=d.pos;const g=new T.Group();g.position.set(...p);const m=mat('#f6f5ee');let o;if(['smoke','motion','air'].includes(d.id))o=cyl(0,0,0,.12,.07,m,g);else o=box(0,0,0,.18,.25,.075,m,g);const led=box(0,.05,.047,.07,.028,.01,mat('#719b87',{emissive:'#719b87',emissiveIntensity:.5}),g);if(['lock','doorbell','air','hub'].includes(d.id))g.rotation.y=Math.PI/2;if(['valve','meter'].includes(d.id))g.rotation.y=-Math.PI/2;if(d.id==='plug')g.rotation.y=Math.PI;g.userData.id=d.id;o.userData.deviceId=d.id;clickMeshes.push(o);physical[d.id]={g,led};root.add(g);}
 // Lighting rings and pools make device state immediately visible.
 const lightCanvas=document.createElement('canvas');lightCanvas.width=lightCanvas.height=64;const lc=lightCanvas.getContext('2d');const lg=lc.createRadialGradient(32,32,1,32,32,32);lg.addColorStop(0,'rgba(255,255,255,1)');lg.addColorStop(.5,'rgba(255,255,255,.25)');lg.addColorStop(1,'rgba(255,255,255,0)');lc.fillStyle=lg;lc.fillRect(0,0,64,64);const lightTexture=new T.CanvasTexture(lightCanvas);
 const pools={},lamps={};for(const [id,x,z,r]of[['living',-3.15,3.6,2.15],['kitchen',-3.8,.2,1.55],['bedlight',-3.7,-3.6,1.5]]){const material=new T.MeshBasicMaterial({color:0xffbf61,map:lightTexture,transparent:true,opacity:.1,depthWrite:false});const mesh=new T.Mesh(new T.PlaneGeometry(r*2,r*2),material);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.13,z);root.add(mesh);pools[id]=mesh;const light=new T.PointLight(0xffc078,0,6,2);light.position.set(x,1.9,z);root.add(light);lamps[id]=light;}
 // Linear pendant with two frosted globes and subtle concealed lighting.
 furnish(-.5,.7,()=>{for(const z of [.06,1.18]){cyl(-.77,2.44,z,.008,.55,metal);ball(-.77,2.05,z,.15,mat('#ebe8df',{emissive:'#ffe1ae',emissiveIntensity:.25}));}box(-.77,2.23,.62,.035,.045,1.42,metal);});
 const accentLeds=[];for(const [anchorX,anchorZ,x,y,z,w,h,d]of[[1.5,3.7,.80,.23,3.7,.025,.02,2.5],[-6,.6,-5.38,.18,.83,.84,.018,3.8],[-3.65,-5.25,-3.65,.19,-4.22,1.73,.015,1.95]]){const lm=mat('#f2d2a0',{emissive:'#ffce83',emissiveIntensity:.25});furnish(anchorX,anchorZ,()=>box(x,y,z,w,h,d,lm));accentLeds.push(lm);}
 const blinds=new T.Group();root.add(blinds);for(let i=0;i<17;i++)box(-2.3,i*.1,5.46,7.1,.068,.07,mat('#bdbaac'),blinds);blinds.position.y=.5;
 const heating=new T.Group();root.add(heating);for(let i=0;i<9;i++){const z=1.8+i*.31;line([[-4.8,.145,z],[.2,.145,z],[.2,.145,z+.15],[-4.8,.145,z+.15]],'#dca264',1,heating);}
 const roof=new T.Group();root.add(roof);box(0,2.9,0,12.65,.22,11.65,metal,roof);box(0,3.04,0,12.25,.08,11.25,M.concrete,roof);for(const x of [-6.22,6.22])box(x,3.13,0,.13,.22,11.45,metal,roof);for(const z of [-5.66,5.66])box(0,3.13,z,12.52,.22,.13,metal,roof);box(0,2.754,0,12.3,.038,11.3,oak,roof);
 const envelope=new T.Group();root.add(envelope);
 // Glazing and facade remain present when the removable roof is lifted.
 box(-2.25,1.43,5.5,7.5,2.5,.04,glass,envelope);for(const x of [-5.97,-3.4,-.9,1.5])box(x,1.43,5.5,.065,2.55,.12,metal,envelope);box(-2.25,2.72,5.5,7.6,.14,.18,plaster,envelope);box(-2.25,.185,5.5,7.5,.055,.12,metal,envelope);box(3.75,.53,5.5,4.5,.87,.18,plaster,envelope);box(3.75,2.52,5.5,4.5,.43,.18,plaster,envelope);box(3.75,1.66,5.5,4.5,1.3,.045,glass,envelope);for(const x of [1.5,3.75,6])box(x,1.66,5.5,.08,1.4,.17,metal,envelope);box(6,1.83,-2.75,.18,1.48,5.48,plaster,envelope);box(6,2.48,3.8,.18,.5,3.4,plaster,envelope);box(6,1.51,3.8,.04,1.42,3.4,glass,envelope);for(const z of [2.1,3.8,5.5])box(6,1.52,z,.15,1.5,.07,metal,envelope);box(6,2.51,1.1,.18,.44,2.5,plaster,envelope);box(-6,1.73,2.15,.18,1.7,6.7,glass,envelope);box(-6,2.68,2.15,.18,.20,6.7,plaster,envelope);for(const z of [-1.2,2.15,5.5])box(-6,1.75,z,.16,1.8,.07,metal,envelope);
 const solar=new T.Group();roof.add(solar);for(let i=0;i<4;i++)for(let j=0;j<2;j++){const g=new T.Group();g.position.set(-4.5+i*1.72,3.16,-3.4+j*2.4);g.rotation.x=-.13;box(0,0,0,1.59,.065,2.15,metal,g);box(0,.04,0,1.48,.018,2.04,mat('#254655',{metalness:.4,roughness:.35}),g);for(let a=0;a<6;a++)box(-.62+a*.25,.055,0,.012,.008,2.02,mat('#718794'),g);for(let a=0;a<9;a++)box(0,.055,-.9+a*.225,1.48,.008,.009,mat('#718794'),g);solar.add(g);}box(4.5,3.18,2.4,1.7,.5,1.1,white,roof);for(let i=0;i<8;i++)box(4.5,3.44,1.96+i*.12,1.5,.02,.02,metal,roof);design.facade(envelope);roof.visible=false;pergola.visible=false;
 const sprinkler=new T.Group();root.add(sprinkler);for(let i=0;i<5;i++){const pts=[];for(let j=0;j<=16;j++){const t=j/16;pts.push([-6.75-Math.sin(i*1.3)*t*1.1,.12+Math.sin(t*Math.PI)*.9,3.5+Math.cos(i*1.3)*t*1.2]);}line(pts,'#7fb9c1',1,sprinkler);}sprinkler.visible=false;
 const cameraCone=new T.Mesh(new T.ConeGeometry(1.0,2.8,28,1,true),new T.MeshBasicMaterial({color:'#87b9c0',transparent:true,opacity:.08,depthWrite:false,side:T.DoubleSide}));cameraCone.position.set(6.9,.8,5.4);cameraCone.rotation.z=.75;cameraCone.rotation.x=-.45;root.add(cameraCone);
 const water=new T.Mesh(new T.CircleGeometry(.82,48),new T.MeshBasicMaterial({color:'#559cae',transparent:true,opacity:.6,depthWrite:false}));water.rotation.x=-Math.PI/2;water.position.set(0,.16,-3.3);root.add(water);water.visible=false;
 // A section clips only architecture, leaving objects and device state intact.
 const sectionPlane=new T.Plane(new T.Vector3(0,-1,0),1.46),architecturalMaterials=[];
 for(const object of [...structure,envelope])object.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.clipShadows=true;architecturalMaterials.push(o.material);}});
 renderer.localClippingEnabled=true;
 let sectionMode=false;
 function applySection(){const cut=sectionMode&&!isRoof;for(const material of architecturalMaterials){material.clippingPlanes=cut?[sectionPlane]:null;material.needsUpdate=true;}sectionCaps.visible=cut;}
 // Subtle, floor-mounted room labels reinforce the cutaway's spatial layout.
 const labels=new T.Group();root.add(labels);function roomLabel(text,x,z,width){const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d');ctx.font='500 27px Arial';ctx.textAlign='center';ctx.fillStyle='#667267';ctx.fillText(text,256,45);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,opacity:.8});const o=new T.Mesh(new T.PlaneGeometry(width,width*80/512),m);o.rotation.x=-Math.PI/2;o.position.set(x,.16,z);labels.add(o);}
 roomLabel('DNEVNI BORAVAK',-2.8,4.87,3.0);roomLabel('KUHINJA',-3.65,-.88,1.8);roomLabel('SPAVAĆA SOBA',-3.55,-1.67,2.5);roomLabel('KUPAONICA',0,-1.65,1.6);roomLabel('DJEČJA SOBA',3.6,-1.57,2.2);roomLabel('RADNA SOBA',3.9,2.55,2.3);roomLabel('ULAZ',4.5,1.30,1.1);
 const selection=new T.Mesh(new T.RingGeometry(.3,.35,48),new T.MeshBasicMaterial({color:'#ec853e',transparent:true,opacity:.9,depthWrite:false,side:T.DoubleSide}));selection.rotation.x=-Math.PI/2;root.add(selection);
 const connections=new T.Group();root.add(connections);const hub=new T.Vector3(...devices.find(d=>d.id==='hub').pos);for(const id of ['living','thermostat','lock','leak','ev','blinds']){const d=devices.find(x=>x.id===id);line([[hub.x,hub.y,hub.z],[hub.x,.25,hub.z],[d.pos[0],.25,d.pos[2]],[...d.pos]],'#a896b2',1,connections);}connections.visible=false;
 const leaderSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');leaderSvg.setAttribute('class','pin-leaders');leaderSvg.setAttribute('aria-hidden','true');hotspotLayer.append(leaderSvg);
 const pins=devices.map(d=>{const el=document.createElement('button');el.className='hotspot';el.dataset.device=d.id;const color=categories.find(c=>c.id===d.cat).color;el.style.setProperty('--cat',color);el.setAttribute('aria-label',d.name+' · '+d.room);el.innerHTML=icon(d.icon)+`<span class="tip">${d.name}</span>`;el.addEventListener('click',()=>onSelect(d.id));hotspotLayer.append(el);const leader=document.createElementNS('http://www.w3.org/2000/svg','line');leader.setAttribute('stroke',color);leader.setAttribute('stroke-width','1');leader.setAttribute('opacity','.65');leaderSvg.append(leader);return {d,el,leader,position:new T.Vector3(...d.pos)};});
 let category='all',selected='living',showAll=false,isRoof=false,nightMode=false,planMode=false,disposed=false,lastTime=0,frame,visible=true;
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;const ratio=w/h;const vertical=Math.max(23,33/ratio);camera.left=-vertical*ratio/2;camera.right=vertical*ratio/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h);ao.enabled=w>500;}
 const observer=new ResizeObserver(resize);observer.observe(container);resize();
 const projected=new T.Vector3();
 function animate(t){if(disposed)return;frame=requestAnimationFrame(animate);if(!visible||document.hidden||t-lastTime<28)return;lastTime=t;controls.update();ao.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);ao.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);composer.render();const placed=[];const w=container.clientWidth,h=container.clientHeight;for(const p of pins){const d=p.d;const allowed=(category==='all'?(showAll||d.featured||d.id===selected):(d.cat===category||d.id===selected))&&(!isRoof||['solar','ev','camera','irrigation','lock','doorbell'].includes(d.id));p.el.hidden=!allowed;p.leader.style.display='none';if(!allowed)continue;projected.copy(p.position);projected.x*=footprintScale;projected.z*=footprintScale;if(d.id==='solar'&&!isRoof)projected.set(-3.8*footprintScale,2.8,-5.45*footprintScale);projected.project(camera);const x=(projected.x*.5+.5)*w,y=(-projected.y*.5+.5)*h;const onscreen=projected.z>=-1&&projected.z<=1&&x>18&&x<w-18&&y>18&&y<h-18;p.el.style.visibility=onscreen?'visible':'hidden';if(!onscreen)continue;let px=x,py=y;for(let n=0;n<150;n++){if(placed.every(q=>Math.hypot(q.x-px,q.y-py)>37))break;const angle=n*2.4,radius=9*Math.sqrt(n+1);px=Math.max(21,Math.min(w-21,x+Math.cos(angle)*radius));py=Math.max(21,Math.min(h-21,y+Math.sin(angle)*radius));}placed.push({x:px,y:py});if(Math.hypot(px-x,py-y)>8){p.leader.style.display='';p.leader.setAttribute('x1',x);p.leader.setAttribute('y1',y);p.leader.setAttribute('x2',px);p.leader.setAttribute('y2',py);}p.el.style.transform=`translate(${px}px,${py}px) translate(-50%,-50%)`;p.el.style.zIndex=d.id===selected?12:2;}}
 const visibleObserver=new IntersectionObserver(e=>{visible=e[0].isIntersecting;});visibleObserver.observe(container);frame=requestAnimationFrame(animate);
 const raycaster=new T.Raycaster(),mouse=new T.Vector2();let start={x:0,y:0};renderer.domElement.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY};});renderer.domElement.addEventListener('pointerup',e=>{if(Math.hypot(start.x-e.clientX,start.y-e.clientY)>6||isRoof)return;const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(clickMeshes)[0];if(hit)onSelect(hit.object.userData.deviceId);});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('loading').hidden=false;document.getElementById('loading').textContent='3D prikaz je pauziran. Osvježite stranicu ili nastavite kroz popis uređaja.';});
 return {
  setCategory(c){category=c;},setLabels(value){showAll=value;},
  select(id){selected=id;const d=devices.find(x=>x.id===id);selection.position.set(d.pos[0],.18,d.pos[2]);selection.visible=id!=='solar'&&!isRoof;connections.visible=id==='hub'&&!isRoof;for(const p of pins){p.el.classList.toggle('selected',p.d.id===id);p.el.setAttribute('aria-pressed',String(p.d.id===id));}},
  roof(value){isRoof=value;roof.visible=value;pergola.visible=value;applySection();labels.visible=!value;selection.visible=!value;connections.visible=selected==='hub'&&!value;},
  section(value){sectionMode=value;applySection();},
  view(plan=false){planMode=plan;camera.position.set(...(plan?[.5,37,.02]:[20,34,27]));controls.target.set(.5,0,0);camera.zoom=1;controls.maxPolarAngle=plan?1.27:1.27;camera.updateProjectionMatrix();controls.update();},
  update(s){nightMode=s.night;const v=s.values;hemi.intensity=s.night?.35:1.25;sun.intensity=s.night?.12:2.8;fill.intensity=s.night?.38:.7;scene.environmentIntensity=s.night?.15:.42;renderer.toneMappingExposure=s.night?1.12:1.02;pathLights.forEach(m=>m.emissiveIntensity=s.night?2:.12);accentLeds.forEach((m,i)=>m.emissiveIntensity=(s.night?1.8:.3)*v[["living","kitchen","bedlight"][i]]/100);for(const id of Object.keys(pools)){pools[id].material.opacity=v[id]/100*(s.night?.32:.06);lamps[id].intensity=v[id]/100*(s.night?55:2);}blinds.visible=v.blinds>0;blinds.scale.y=Math.max(.01,v.blinds/100);blinds.position.y=2.17-1.67*v.blinds/100;heating.visible=v.floor;sprinkler.visible=v.irrigation;cameraCone.visible=v.camera;water.visible=v.leak;evLed.material.emissiveIntensity=v.ev?2:0;screen.material.emissiveIntensity=v.plug?.4:0;screen.material.color.set(v.plug?'#749b9f':'#253033');cable.visible=v.ev;solar.children.forEach(g=>g.children[1].material.color.set(v.solar?'#254655':'#465258'));if(physical.lock)physical.lock.led.material.color.set(v.lock?'#c38565':'#719b87');for(const p of pins)p.el.classList.toggle('off',s.values[p.d.id]===false||s.values[p.d.id]===0);},
  dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();visibleObserver.disconnect();controls.dispose();environment.dispose();ao.dispose();outputPass.dispose();composer.dispose();renderer.dispose();}
 };
}


