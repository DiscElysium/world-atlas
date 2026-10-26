import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from './vendor/addons/loaders/DRACOLoader.js';
import {configurePlanet} from './space/planet-material.mjs';
import {MAP_WIDTH,smooth} from './map-model.mjs';
import {configureJourneyMaterial} from './journey-boundary.js';
import {prepareReferenceLanguage} from './reference-language.js';
import {createOtherworksView} from './otherworks/chapter.js';

export const REFERENCE_IDS=['tennis','engine','otherworks'];
export function emptyReferenceContent(){return{root:new THREE.Group(),zones:[],interactive:[],setHighlight(){},dispose(){}};}
export const cameraInfluence=offset=>1-smooth(.14,.64,Math.abs(offset));

// These are physical chapter boundaries, not opacity masks or screen overlays.
export function clipChapter(entry,span,previous=entry.project,next=entry.project){
 const bounds=new THREE.Vector2(entry.center-span/2,entry.center+span/2);
 const tint={start:new THREE.Color(entry.project.ground).lerp(new THREE.Color(previous.ground),.5),end:new THREE.Color(entry.project.ground).lerp(new THREE.Color(next.ground),.5)};
 entry.root.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  if(materials.some(m=>m.name==='planet_atmosphere'||m.name.startsWith('planet_surface_')))return;
  const ground=entry.terrainMeshes?.includes(mesh)||mesh===entry.land||mesh.userData.component_id==='P01'||/Continuous_white_geological_ground|Terrain_foundations_limestone_atlas/.test(mesh.name);
  for(const material of materials)configureJourneyMaterial(material,bounds,ground?tint:null,entry.project.id==='otherworks');
  if(mesh.customDepthMaterial)configureJourneyMaterial(mesh.customDepthMaterial,bounds,null,entry.project.id==='otherworks');
 });entry.journeyBounds=bounds;
}

export class ReferenceScenes{
 constructor(renderer){this.renderer=renderer;this.views=new Map();this.active=null;}
 async load(){
  const draco=new DRACOLoader();draco.setDecoderPath(new URL('./vendor/draco/',import.meta.url).href);draco.setWorkerLimit(2);
  const loader=new GLTFLoader();loader.setDRACOLoader(draco);
  try{
   const [tennis,space,otherworks,motion,portraitMotion,spaceArtwork]=await Promise.all([
    loader.loadAsync(new URL('./tennisatom/assets/tennisatom.gltf',import.meta.url).href),
    loader.loadAsync(new URL('./space/engine-assembled.glb',import.meta.url).href),
    loader.loadAsync(new URL('./otherworks/otherworks.glb',import.meta.url).href),
    fetch(new URL('./otherworks/rigid-body-motion.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Photo motion unavailable');return r.json();}),
    fetch(new URL('./otherworks/portrait-motion.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Portrait photo motion unavailable');return r.json();}),
    new THREE.TextureLoader().loadAsync(new URL('./assets/projects/space-overview.webp',import.meta.url).href)
   ]);this.createTennis(tennis);this.createSpace(space,spaceArtwork);this.views.set('otherworks',createOtherworksView(otherworks,motion,portraitMotion));
  }finally{draco.dispose();}
 }
 createTennis(gltf){
  const camera=gltf.cameras.find(c=>c.name==='CAM_Reference_Locked')||gltf.cameras[0];
  if(!camera)throw new Error('TennisAtom reference camera missing');camera.updateMatrixWorld(true);
  const direction=camera.getWorldDirection(new THREE.Vector3()),origin=camera.getWorldPosition(new THREE.Vector3());
  const focus=origin.clone().addScaledVector(direction,-origin.y/direction.y),distance=origin.distanceTo(focus);
  const yaw=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ').y;
  const alignment=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-yaw);
  const group=new THREE.Group();group.name='TennisAtom · long-map chapter';group.add(gltf.scene);
  const view={id:'tennis',group,model:gltf.scene,focus,yaw,scale:MAP_WIDTH/(2*distance*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*(1672/941)),
   fov:camera.fov,pitch:Math.asin(-direction.y),orientation:alignment.clone().multiply(camera.quaternion),interactive:[],dark:{value:0},palette:'blue'};
  gltf.scene.traverse(mesh=>{
   if(!mesh.isMesh)return;mesh.castShadow=false;mesh.receiveShadow=false;
   for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
    material.side=THREE.DoubleSide;if(material.map)material.map.anisotropy=this.renderer.capabilities.getMaxAnisotropy();material.userData.base=material.color.clone();
    if(material.name==='Terrain_daylight'){
     material.onBeforeCompile=shader=>{
      shader.uniforms.uDark=view.dark;shader.fragmentShader='uniform float uDark;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat blueMask=smoothstep(.025,.15,diffuseColor.b-diffuseColor.r);\ndiffuseColor.rgb*=mix(vec3(1.),vec3(.24,.27,.30),uDark*blueMask);');
     };material.customProgramCacheKey=()=> 'terrain-palette-v1';
    }
   }
   if(mesh.name==='Button_VIEW_PROJECT'){mesh.userData.action={id:'tennis',kind:'project'};view.interactive.push(mesh);}
  });this.views.set('tennis',view);
 }
 createSpace(gltf,spaceArtwork){
  const group=new THREE.Group();group.name='Space · long-map chapter';group.add(gltf.scene);
  gltf.scene.traverse(mesh=>{
   // Move the complete foreground outcrop together, including its crystals.
   if(mesh.userData.asset_id==='09_foreground_asteroid')mesh.position.x+=2.5;
   if(!mesh.isMesh)return;mesh.castShadow=!mesh.name.startsWith('07_starfield');mesh.receiveShadow=mesh.castShadow;
   if(mesh.name.includes('Information_Wing__navy'))mesh.castShadow=mesh.receiveShadow=false;
   for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
    if(material.map)material.map.anisotropy=Math.min(this.renderer.capabilities.getMaxAnisotropy(),8);
    if(material.name.includes('project_art'))material.roughness=.88;
   }configurePlanet(mesh);
  });
  const button=new THREE.Mesh(new THREE.BoxGeometry(7.2,.32,1.24),new THREE.MeshBasicMaterial({visible:false}));
  const a=-.05,x=-1.65,y=-2.6;
  button.position.set(-8.65+x*Math.cos(a)-y*Math.sin(a),.55+.535,-(-.7+x*Math.sin(a)+y*Math.cos(a)));
  button.rotation.y=a;button.name='Engine project button';button.userData.action={id:'engine',kind:'project'};group.add(button);
  const art=gltf.scene.getObjectByName('Artwork_Display__project_art');if(art)art.userData.action={id:'engine',kind:'art'};
  if(art&&spaceArtwork){
   spaceArtwork.colorSpace=THREE.SRGBColorSpace;spaceArtwork.flipY=false;spaceArtwork.anisotropy=8;art.material=art.material.clone();art.material.map=spaceArtwork;art.material.color.set('#ffffff');art.material.userData.displayArtwork='space-overview.webp';
   const fit=(15.9/8.92)/(spaceArtwork.image.width/spaceArtwork.image.height);
   art.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`\n#ifdef USE_MAP\nvec2 spacePrintUV=vMapUv;spacePrintUV.y=(spacePrintUV.y-.5)/${fit.toFixed(8)}+.5;vec4 spacePrint=texture2D(map,spacePrintUV);float inside=step(0.,spacePrintUV.y)*step(spacePrintUV.y,1.);diffuseColor*=mix(vec4(.002,.004,.014,1.),spacePrint,inside);\n#endif\n`);};
   art.material.customProgramCacheKey=()=> 'space-poster-contain-v1';art.material.userData.artworkFit='contain';
  }
  const pitch=Math.atan2(1,.155),camera=new THREE.PerspectiveCamera(32,1,.5,340);camera.up.set(0,0,-1);camera.position.set(0,Math.sin(pitch),Math.cos(pitch));camera.lookAt(0,0,0);
  this.views.set('engine',{id:'engine',group,model:gltf.scene,focus:new THREE.Vector3(),yaw:0,scale:MAP_WIDTH/40.4,fov:32,pitch,orientation:camera.quaternion.clone(),interactive:[button,...(art?[art]:[])]});
 }
 detach(){for(const view of this.views.values())view.group.removeFromParent();}
 attach(entry){
  const view=this.views.get(entry.project.id);if(!view)throw new Error('Reference chapter not loaded: '+entry.project.id);
  view.configure?.(entry.L);if(view.update)entry.updateView=(camera,state)=>view.update(state);
  view.setLanguage??=prepareReferenceLanguage(view);view.setLanguage(entry.project.language||'zh');
  view.group.scale.setScalar(view.scale);view.group.rotation.set(0,-view.yaw,0);
  view.group.position.copy(view.focus).multiplyScalar(-view.scale).applyQuaternion(view.group.quaternion);
  entry.objects.add(view.group);entry.reference=view;entry.content.interactive=view.interactive;entry.reveal=1;entry.revealUniform.value=1;
 }
 resize(width,height){this.width=width;this.height=height;}
 adjustCamera(camera,entries,z,L){
  // Adjacent imported chapters have slightly overlapping influence tails.
  // Blend both tails continuously instead of switching at the first match.
  for(const entry of entries){
   if(!entry.reference)continue;
   const view=entry.reference,weight=cameraInfluence((z-entry.center)/L.depth);if(weight<=0)continue;
   const distance=(view.cameraWidth??MAP_WIDTH)/(2*Math.tan(THREE.MathUtils.degToRad(view.fov)/2)*L.aspect);
   const offset=view.cameraDirection?view.cameraDirection.clone().multiplyScalar(distance).add(new THREE.Vector3(0,0,z)):new THREE.Vector3(0,Math.sin(view.pitch)*distance,z+Math.cos(view.pitch)*distance);
   camera.position.lerp(offset,weight);
   camera.quaternion.slerp(view.orientation,weight);camera.fov=THREE.MathUtils.lerp(camera.fov,view.fov,weight);
  }
 }
 update(entries,z,depth,camera){
  this.active=entries.filter(e=>e.reference&&Math.abs(z-e.center)<depth*.75).sort((a,b)=>Math.abs(z-a.center)-Math.abs(z-b.center))[0]??null;
  this.camera=camera;this.visible=entries.filter(e=>e.root.visible).map(e=>e.project.id);
 }
 togglePalette(){
  const view=this.views.get('tennis');if(!view)return false;view.palette=view.palette==='blue'?'black':'blue';view.dark.value=view.palette==='black'?1:0;
  view.model.traverse(mesh=>{if(!mesh.isMesh)return;for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
   if(!material.userData.base)continue;material.color.copy(material.userData.base);
   if(view.palette==='black'&&/Light_(leaf_|grass|blue)/.test(material.name))material.color.multiply(new THREE.Color(.32,.35,.38));
  }});return view.palette==='black';
 }
 diagnostics(){
  const view=this.active?.reference;return{mode:'continuous-map',visible:this.visible,id:view?.id,sharedCamera:true,
   actions:view?view.interactive.map(mesh=>{const p=new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3()).project(this.camera);return{kind:mesh.userData.action.kind,x:(p.x+1)*.5*this.width,y:(1-p.y)*.5*this.height};}):[]};
 }
}

