import * as THREE from './vendor/three.module.js';
import {layout,PITCH,FOV,groundPoint,seeded,screenPoint,whiteMask,smooth} from './map-model.mjs';
import {createPortfolioContent} from './content.js';
import {pickSurface} from './content-layout.mjs';
import {terrainSample,sceneGround,normalizeProjectIndex,riverX} from './terrain.mjs';
import {modelKit} from './model-kit.js';
import {buildOblivion} from './scene-oblivion.js';
import {createOblivionLand} from './oblivion-land.js';
import {buildGoldfish} from './scene-goldfish.js';
import {buildGoldfishContent} from './goldfish/content.js';
import {buildFlow} from './scene-flow.js';
import {buildFlowTerrain} from './flow/terrain.js';
import {FLOW_LIGHT as flowLight} from './flow/palette.mjs';
import {tennisTerrainColor} from './tennis-layout.mjs';
import {tennisMaterial} from './tennis-materials.js';
import {ReferenceScenes,REFERENCE_IDS,emptyReferenceContent,clipChapter} from './reference-scenes.js?v=8f12d970b90a';
import {createJourneyGround} from './journey-ground.js';
import {bindJourneyTone,updateJourneyTone} from './journey-tone.js';
import {applyDaylight} from './daylight-rig.js';
import {STEP} from './projects.mjs?v=8f12d970b90a';
import {RenderStyles} from './render-styles.js';
import {buildLiarsMask} from './scene-liars-mask.js';
import {buildContent as buildLiarsContent} from './liars-mask/06-content/index.js';
const BUILDERS={oblivion:buildOblivion,flow:buildFlow,goldfish:buildGoldfish,'liars-mask':buildLiarsMask};
export class PortfolioWorld{
 constructor(container,projects){
  this.container=container;this.projects=projects;this.scene=new THREE.Scene();this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.CustomToneMapping;this.renderer.toneMappingExposure=1;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.append(this.renderer.domElement);
  this.renderer.localClippingEnabled=true;
  this.camera=new THREE.PerspectiveCamera(FOV,1,.5,500);this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.targetZ=0;this.cameraZ=0;this.clock=0;this.mode='day';this.paused=false;this.entries=[];
  this.sun=new THREE.DirectionalLight('#fff2da',2.5);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);this.sun.shadow.normalBias=.035;this.sun.shadow.bias=-.00016;this.sun.shadow.camera.left=-28;this.sun.shadow.camera.right=28;this.sun.shadow.camera.top=34;this.sun.shadow.camera.bottom=-34;this.sun.shadow.camera.near=.5;this.sun.shadow.camera.far=100;this.scene.add(this.sun,this.sun.target);
  this.sky=new THREE.HemisphereLight('#e4efff','#8f9885',1.5);this.scene.add(this.sky);this.fill=new THREE.DirectionalLight('#bddbfa',.4);this.fill.position.set(15,20,0);this.scene.add(this.fill,this.fill.target);this.scene.background=new THREE.Color('#ffffff');
  this.styles=new RenderStyles(this.renderer);
  this.rim=new THREE.DirectionalLight('#4ca9ff',0);this.scene.add(this.rim,this.rim.target);
  this.references=new ReferenceScenes(this.renderer);
 }
 rebuild(width,height,specs,textures,extraTextures={}){
  this.references.detach();
  // Rebuilding the viewport also replaces framebuffer textures and their
  // compiled screen pass, so no sampler keeps a stale resized normal buffer.
  const effectsEnabled=this.styles.enabled;this.styles.dispose();this.styles=new RenderStyles(this.renderer);this.styles.enabled=effectsEnabled;
  if(this.journeyGround){this.scene.remove(this.journeyGround);this.journeyGround.geometry.dispose();this.journeyGround.material.dispose();}
  for(const entry of this.entries){this.scene.remove(entry.root);entry.content.dispose();const geometries=new Set(),materials=new Set();entry.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));if(o.customDepthMaterial)materials.add(o.customDepthMaterial);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
  const previousDepth=this.L?.depth;this.entries=[];this.L=layout(width,height,[]);if(previousDepth)this.cameraZ*=this.L.depth/previousDepth;this.span=this.L.depth*STEP;this.renderer.setSize(width,height,false);this.camera.aspect=this.L.aspect;this.camera.near=Math.max(.5,this.L.distance*.015);this.camera.far=this.L.distance+this.span*2+160;this.camera.updateProjectionMatrix();
  this.renderer.shadowMap.type=width<700?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;this.sun.shadow.camera.top=Math.max(34,this.L.depth*.6);this.sun.shadow.camera.bottom=-Math.max(34,this.L.depth*.6);this.sun.shadow.camera.updateProjectionMatrix();
  this.projects.forEach((project,i)=>{
   const base=this.L;
   const reference=REFERENCE_IDS.includes(project.id),content=reference?emptyReferenceContent():createPortfolioContent(base,specs[i],textures[i],Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),project),L={...base,zones:content.zones,span:this.span};
   const root=new THREE.Group();root.position.z=i*this.span;this.scene.add(root);root.add(content.root);const objects=new THREE.Group();root.add(objects);const animated=[];
   const entry={project,root,objects,content,L,animated,center:i*this.span,reveal:1};this.entries.push(entry);this.buildTerrain(entry);entry.revealUniform.value=1;
   for(const mesh of entry.terrainMeshes||[entry.land])if(mesh){mesh.material.opacity=1;mesh.material.depthWrite=true;}
   if(reference){this.references.attach(entry);clipChapter(entry,this.span,this.projects[i-1]||project,this.projects[i+1]||project);root.updateMatrixWorld(true);return;}
   const random=seeded(1307+i*1289),kit=modelKit(objects,false);
   const safe=(u,v,padding=.25)=>L.zones.some(z=>u>z.left-padding/40&&u<z.right+padding/40&&v>z.top-padding/L.depth&&v<z.bottom+padding/L.depth);
   const place=(u,v)=>{const p=sceneGround(u,v,L,project);return kit.group(p.x,p.y,p.z)};
   const built=BUILDERS[project.id]?.({kit,L,project,random,safe,place,terrainModules:entry.terrainModules,animate:fn=>animated.push(fn),textures:extraTextures,ground:(u,v)=>sceneGround(u,v,L,project)});
   entry.updateView=built?.updateView;
   if(project.id==='goldfish'){
    root.remove(content.root);content.dispose();
    const scale=40/36,shift=built.plan.mobile?-5.3:-1.1;objects.scale.setScalar(scale);objects.position.z=shift*scale;entry.geometryScaleY=scale;
    entry.content=buildGoldfishContent(built.forms,built.plan,extraTextures,Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),project.language);
    entry.content.root.scale.setScalar(scale);entry.content.root.position.z=shift*scale;root.add(entry.content.root);
    const dispose=entry.content.dispose;entry.content.dispose=()=>{dispose();built.forms.grain.dispose();};
   }
   if(project.id==='liars-mask'){
    root.remove(content.root);content.dispose();entry.geometryScaleY=1;
    entry.content=buildLiarsContent(built.forms,textures[i],{mobile:L.mobile,anisotropy:Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),language:project.language});
    objects.remove(entry.content.root);root.add(entry.content.root);
   }
   clipChapter(entry,this.span,this.projects[i-1]||project,this.projects[i+1]||project);root.updateMatrixWorld(true);
  });
  this.styles.resize(width,height);this.styles.rebuild(this.entries);this.references.resize(width,height);
  this.journeyGround=createJourneyGround(this.projects,this.span);this.scene.add(this.journeyGround);
  this.scene.traverse(mesh=>{if(mesh.material)for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material])bindJourneyTone(material);});
  this.maxZ=(this.projects.length-1)*this.span+this.L.depth*(this.L.mobile?.035:.14);this.ready=true;this.applyCamera();this.renderer.compile(this.scene,this.camera);this.renderFrame();
 }
 buildTerrain(entry){
  if(['goldfish','liars-mask',...REFERENCE_IDS].includes(entry.project.id)){entry.land=null;entry.terrainMeshes=[];entry.revealUniform={value:0};return;}
  if(entry.project.id==='flow'){
   const built=buildFlowTerrain(entry.L),reveal={value:0};entry.root.add(built.root);entry.land=built.root;entry.terrainModules=built.modules;entry.terrainMeshes=built.meshes;entry.revealUniform=reveal;
   for(const mesh of built.meshes){const material=mesh.material;material.transparent=true;material.opacity=0;material.onBeforeCompile=shader=>{shader.uniforms.uReveal=reveal;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uReveal;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y=mix(0.1,position.y,uReveal);');};material.customProgramCacheKey=()=> 'flow-real-heightfield';mesh.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});mesh.customDepthMaterial.onBeforeCompile=material.onBeforeCompile;}
   return;
  }
  if(entry.project.id==='oblivion'){const built=createOblivionLand(entry.L,this.span);entry.land=built.land;entry.revealUniform=built.revealUniform;entry.root.add(built.land);return;}
  const {L,project,root}=entry,nx=project.id==='tennis'?80:L.mobile?42:56,nz=project.id==='tennis'?(L.mobile?112:74):L.mobile?100:44,random=seeded(831),points=[],positions=[],colors=[],groundColor=new THREE.Color(project.ground),palette=project.palette.map(c=>new THREE.Color(c));
  const start=-this.span/2,end=this.span/2;
  for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++){const px=-28+x/nx*56+(x>0&&x<nx?(random()-.5)*.5:0),pz=start+z/nz*(end-start);const screen=screenPoint(px,.17,pz,L);const sample=terrainSample(screen.u,screen.v,L,project);const edge=smooth(.37,.5,Math.abs(pz)/this.span);const common=.11+Math.max(0,Math.abs(px)-14)*.12,baseY=project.id==='tennis'?sample.baseHeight:sample.height;points.push({x:px,z:pz,y:THREE.MathUtils.lerp(baseY,common,edge),u:screen.u,v:screen.v,white:sample.white,river:sample.river});}
  const tri=(a,b,c)=>{
   const ps=[points[a],points[b],points[c]],u=ps.reduce((s,p)=>s+p.u,0)/3,v=ps.reduce((s,p)=>s+p.v,0)/3,w=whiteMask(u,v,L),h=ps.reduce((s,p)=>s+p.y,0)/3,pz=ps.reduce((s,p)=>s+p.z,0)/3;
   const field=.5+.23*Math.sin(u*7+v*4)+.22*Math.cos(u*3-v*9);let col=palette[0].clone().lerp(palette[1],field);
    if(project.id==='flow'){col.lerp(palette[2],smooth(1,3.8,h)*.25);col.lerp(new THREE.Color('#f0f4ef'),smooth(2.9,5.1,h));}
    if(project.id==='tennis')col.set(tennisTerrainColor(u,v,h,L));
    if(project.id==='engine')col.lerp(palette[2],.15+.2*Math.sin(u*3+v*4)**2);
    if(project.id==='goldfish')col.lerp(palette[2],Math.max(0,Math.sin(u*9+v*7))*.23);
    col.multiplyScalar(.97+random()*.055).lerp(groundColor,w);
    if((project.id==='flow'||project.id==='goldfish')&&Math.abs(u-riverX(v,L.mobile))<.022)col.set(project.id==='flow'?'#638f92':'#235ca8');
   col.lerp(new THREE.Color('#ffffff'),smooth(.405,.5,Math.abs(pz)/this.span));
   for(const p of ps){positions.push(p.x,p.y,p.z);colors.push(col.r,col.g,col.b)}
  };
  for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const a=z*(nx+1)+x,b=a+1,c=a+nx+1,d=c+1;if((x+z)%2){tri(a,c,b);tri(b,c,d)}else{tri(a,c,d);tri(a,d,b)}}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();const reveal={value:0};
  const material=project.id==='tennis'?tennisMaterial('#ffffff',{vertexColors:true,surface:'chalk',transparent:true,opacity:0}):new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,transparent:true,opacity:0});
  const surfaceCompile=material.onBeforeCompile;
  material.onBeforeCompile=shader=>{surfaceCompile.call(material,shader);shader.uniforms.uReveal=reveal;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uReveal;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y=mix(0.1,position.y,uReveal);');if(project.id!=='oblivion')shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uReveal;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(vec3(.9),diffuseColor.rgb,.3+.7*uReveal);');};
  material.customProgramCacheKey=()=>project.id==='tennis'?'tennis-mineral-v3-reveal':project.id;const land=new THREE.Mesh(geometry,material);land.receiveShadow=project.id!=='oblivion';land.castShadow=true;
  land.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});land.customDepthMaterial.onBeforeCompile=shader=>{shader.uniforms.uReveal=reveal;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uReveal;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y=mix(0.1,position.y,uReveal);');};root.add(land);entry.revealUniform=reveal;entry.land=land;
 }
 setScroll(scrollPixels){if(this.L)this.targetZ=Math.min(this.maxZ,Math.max(0,scrollPixels/this.L.height*this.L.depth));}
 applyCamera(){
  const gold=this.entries.find(e=>e.project.id==='goldfish'),goldWeight=gold?1-smooth(.18,.73,Math.abs(this.cameraZ-gold.center)/this.L.depth):0;
  const liar=this.entries.find(e=>e.project.id==='liars-mask'),liarWeight=liar?1-smooth(.22,.72,Math.abs(this.cameraZ-liar.center)/this.L.depth):0;
  const pitch=THREE.MathUtils.lerp(THREE.MathUtils.lerp(PITCH,68*Math.PI/180,goldWeight),52*Math.PI/180,liarWeight);
  const d=this.L.distance*(1-(this.L.mobile?.61:0)*goldWeight)*THREE.MathUtils.lerp(1,this.L.mobile?.5:39/40,liarWeight);
  const focus=this.cameraZ+(this.L.mobile?3.5:1.5)*liarWeight,fov=FOV;
  if(Math.abs(this.camera.fov-fov)>.001){this.camera.fov=fov;this.camera.updateProjectionMatrix();}
  this.camera.up.set(0,0,-1);this.camera.position.set(0,Math.sin(pitch)*d,focus+Math.cos(pitch)*d);this.camera.lookAt(0,0,focus);
  this.references.adjustCamera?.(this.camera,this.entries,this.cameraZ,this.L);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
 }
 pick(x,y){const point=this.styles.scenePoint(x,y);if(!point)return null;this.pointer.set(point.x*2-1,1-point.y*2);const nearby=this.entries.filter(e=>Math.abs(e.center-this.cameraZ)<this.L.depth*1.2);return pickSurface(this.raycaster,this.camera,this.pointer,nearby.flatMap(e=>e.content.interactive));}
 setHighlight(action){for(const e of this.entries)e.content.setHighlight(action?.id===e.project.id?action:null);}
 update(time,reduced=false){
  if(!this.ready)return;const elapsed=Math.max(0,(time-(this.lastTime??time-16))/1000),dt=Math.min(.05,elapsed);this.lastTime=time;
  this.cameraZ=reduced?this.targetZ:this.cameraZ+(this.targetZ-this.cameraZ)*(1-Math.exp(-elapsed*9));this.applyCamera();if(!this.paused&&!reduced)this.clock+=dt;
  const index=normalizeProjectIndex(this.cameraZ,this.span,this.entries.length),current=this.entries[index];
  updateJourneyTone(this.entries,this.cameraZ,this.L.depth);applyDaylight(this);
  const p=Math.max(0,Math.min(this.entries.length-1,this.cameraZ/this.span)),a=Math.floor(p),b=Math.min(this.entries.length-1,a+1);
  this.scene.background.set(this.entries[a].project.ground).lerp(new THREE.Color(this.entries[b].project.ground),smooth(.15,.95,p-a));this.renderer.setClearColor(this.scene.background);
  for(const e of this.entries){
   e.reveal=1;e.revealUniform.value=1;
   for(const mesh of e.terrainMeshes||[e.land]){if(mesh){mesh.material.opacity=1;mesh.material.depthWrite=true;}}
   e.objects.scale.y=e.geometryScaleY||1;e.objects.visible=Math.abs(e.center-this.cameraZ)<this.L.depth*1.3;
   if(e.terrainEdges)e.terrainEdges.scale.y=1;
   if(e.project.id==='goldfish')e.content.root.scale.y=e.objects.scale.y;
   e.content.root.visible=true;e.root.visible=Math.abs(e.center-this.cameraZ)<this.L.depth*1.65;
   if(!this.paused&&!reduced&&e.root.visible)e.animated.forEach(fn=>fn(this.clock));
  }
  const liarEntry=this.entries.find(e=>e.project.id==='liars-mask');if(liarEntry)liarEntry.content.root.scale.y=liarEntry.objects.scale.y;
  for(const e of this.entries)e.updateView?.(this.camera,{time:this.clock,scroll:(this.cameraZ-e.center)/this.L.depth,enabled:e.root.visible&&e.project===current.project,reduced:reduced||this.paused});
  this.renderFrame();this.activeIndex=index;return{index,project:current.project,z:this.cameraZ};
 }
 renderFrame(){
  if(!this.L)return;const liar=this.entries.find(e=>e.project.id==='liars-mask');
  updateJourneyTone(this.entries,this.cameraZ,this.L.depth);
  this.references.update(this.entries,this.cameraZ,this.L.depth,this.camera);
  const engine=this.entries.find(e=>e.project.id==='engine'),spaceAmount=engine?1-smooth(.2,.85,Math.abs(this.cameraZ-engine.center)/this.L.depth):0;
  this.styles.render(this.scene,this.camera,{z:this.cameraZ,depth:this.L.depth,span:this.span,distance:this.viewDistance??this.L.distance,goldfishCenter:this.entries.find(e=>e.project.id==='goldfish')?.center??this.span*4,liarsMaskCenter:liar?.center,time:this.clock,spaceAmount,...this.renderStyleExtras});
  const data=this.renderer.domElement?.dataset;if(!data)return;
  data.camera=JSON.stringify({z:this.cameraZ,target:this.targetZ,depth:this.L.depth,center:liar?.center,mobile:this.L.mobile,position:this.camera.position.toArray(),fov:this.camera.fov,aspect:this.camera.aspect,content:liar?.content.root.userData.layout});
  data.reference=JSON.stringify(this.references.diagnostics());
  if(liar)data.actions=JSON.stringify(liar.content.interactive.map(m=>{const p=m.getWorldPosition(new THREE.Vector3()).project(this.camera);return{name:m.name,kind:m.userData.action.kind,x:(p.x+1)*.5*this.L.width,y:(1-p.y)*.5*this.L.height};}));
 }
 setLight(mode){this.mode=mode;}
}




