import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from './vendor/addons/utils/BufferGeometryUtils.js';
import {createPortfolioIntro} from './atlas/portfolio-intro.js';
import {applyOblivionInk} from './atlas/oblivion-ink.js';
import {createSurroundingDraft} from './atlas-surroundings.js';
import {bindJourneyTone} from './journey-tone.js';
import {WORKTOP_VIEW,worktopWidth} from './atlas/atelier-composition.js';
import {replaceGroundWordmark} from './space-identity.js';
const smooth=(a,b,x)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

function batch(root){
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),groups=new Map();
 root.traverse(o=>{
  if(!o.isMesh||Array.isArray(o.material)||o.material.transparent||o.material.transmission>0)return;
  const key=o.material.uuid+'|'+Object.keys(o.geometry.attributes).sort().join(',')+'|'+o.castShadow+'|'+o.receiveShadow+'|'+(o.userData.label_role?o.name:'');
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);
 });
 for(const meshes of groups.values()){
  if(meshes.length<2)continue;const geometries=meshes.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));return g;});
  const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!geometry)continue;
  const mesh=new THREE.Mesh(geometry,meshes[0].material);mesh.name='Atelier material batch';mesh.castShadow=meshes[0].castShadow;mesh.receiveShadow=meshes[0].receiveShadow;mesh.userData.surface_marking=meshes[0].userData.surface_marking;root.add(mesh);meshes.forEach(o=>o.removeFromParent());
 }
}
export async function loadAtelier(progress){
 const [asset,catalog]=await Promise.all([
  new GLTFLoader().loadAsync(new URL('../models/scenes/atelier/model.gltf',import.meta.url).href,p=>{if(p.total)progress?.(p.loaded/p.total);}),
  fetch(new URL('../project-catalog.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Atelier catalog unavailable');return r.json();})
 ]);return {root:asset.scene,projects:catalog.projects};
}
export class AtelierChapter{
 constructor(renderer,asset,width,height){
  this.renderer=renderer;this.width=width;this.height=height;this.group=new THREE.Group();this.group.name='Chapter 00 / author worktop';const root=asset.root;this.group.add(root);root.updateMatrixWorld(true);
  this.entries=asset.projects.map((project,index)=>({project,index,groups:[],box:new THREE.Box3()}));
  root.traverse(o=>{
   if(o.isMesh&&o.userData.label_role==='project_title'&&o.userData.label_index===3)replaceGroundWordmark(o,'SPACE');
   if(Number.isInteger(o.userData.project_index))this.entries[o.userData.project_index]?.groups.push(o);
   if(o.isMesh){o.castShadow=!o.userData.surface_marking;o.receiveShadow=!o.userData.surface_marking;
    const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats)if(m.transparent||m.transmission>0){m.depthWrite=false;o.castShadow=false;o.receiveShadow=false;}
   }
  });
  for(const e of this.entries)for(const group of e.groups){e.box.union(new THREE.Box3().setFromObject(group));batch(group);}
  const staticRoots=[];root.traverse(o=>{
   if(!o.userData.asset_id||Number.isInteger(o.userData.project_index))return;
   for(let p=o.parent;p;p=p.parent)if(Number.isInteger(p.userData.project_index))return;
   let contains=false;o.traverse(c=>{if(Number.isInteger(c.userData.project_index))contains=true;});if(!contains)staticRoots.push(o);
  });staticRoots.forEach(batch);applyOblivionInk(this.entries[0]);
  this.originalMaterials=new Set();root.traverse(o=>{if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])this.originalMaterials.add(m);});
  this.homePosition=new THREE.Vector3(...WORKTOP_VIEW.position);this.homeTarget=new THREE.Vector3(...WORKTOP_VIEW.target);this.camera=new THREE.OrthographicCamera(-28,28,16,-16,.1,400);
  const restore=()=>{this.camera.position.copy(this.homePosition);this.camera.up.set(0,1,0);this.camera.lookAt(this.homeTarget);};restore();
  this.intro=createPortfolioIntro({renderer,scene:this.group,root,camera:this.camera,entries:this.entries,homePosition:this.homePosition,homeTarget:this.homeTarget,getHomeWidth:()=>this.homeWidth,getAspect:()=>this.width/this.height,render(){},restoreHome:restore,scrollControlled:true});
  this.intro.seek(this.intro.state().duration);this.surroundings=createSurroundingDraft(this.group,this.draftExtent);this.group.add(this.surroundings.mesh);this.intro.seek(0);
  this.lamp=new THREE.PointLight('#ffe6bc',16,7,2);this.lamp.position.set(17.5,3.9,-9.5);this.group.add(this.lamp);
  this.terrain=[];this.group.traverse(o=>{if(o.isMesh){for(let p=o;p;p=p.parent)if(Number.isInteger(p.userData.project_index))return;if(!o.userData.surface_marking)this.terrain.push(o);}});
  this.resize(width,height);this.phase=-1;
 }
 get homeWidth(){return worktopWidth(this.width,this.height);}
 get frontExtent(){return Math.max(28,this.homeWidth/(2*(this.width/this.height)*.6767)+3);}
 get draftExtent(){return Math.max(150,this.frontExtent*2+12);}
 resize(width,height){
  this.width=width;this.height=height;
  if(this.surroundings&&this.draftExtent>this.surroundings.extent+1){
   const previous=Math.max(0,this.phase??0);this.intro.seek(this.intro.state().duration);
   const old=this.surroundings;old.mesh.removeFromParent();old.mesh.geometry.dispose();old.mesh.material.map.dispose();old.mesh.material.dispose();
   this.surroundings=createSurroundingDraft(this.group,this.draftExtent);this.group.add(this.surroundings.mesh);this.intro.seek(previous*9.4);
  }
  this.phase=-1;this.intro.resize();
 }
 setCenter(z){
  this.center=z;this.group.position.z=z;this.cut=z+this.frontExtent;
  const plane=this.clipPlane??=new THREE.Plane(new THREE.Vector3(0,0,-1),this.cut);plane.constant=this.cut;
  for(const m of this.originalMaterials){m.clippingPlanes=[plane];m.clipShadows=true;bindJourneyTone(m);m.needsUpdate=true;}
  this.group.traverse(o=>{if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.clippingPlanes=[plane];m.clipShadows=true;bindJourneyTone(m);m.needsUpdate=true;}});
  this.group.updateMatrixWorld(true);
 }
 apply(progress){
  if(progress===this.phase)return;this.phase=progress;this.intro.seek(progress*this.intro.state().duration);
  this.surroundings.mesh.material.opacity=smooth(1.55,4.1,progress*9.4);
  this.group.visible=true;
 }
 getPose(){return {position:this.camera.position.clone().add(new THREE.Vector3(0,0,this.center)),quaternion:this.camera.quaternion.clone(),focus:this.homeTarget.clone().add(new THREE.Vector3(0,0,this.center)),width:this.homeWidth,distance:this.homePosition.distanceTo(this.homeTarget)};}
 pick(raycaster){
  const hit=raycaster.intersectObjects(this.entries.flatMap(e=>e.groups),true).find(h=>h.object.isMesh&&!h.object.material?.transparent);
  for(let o=hit?.object;o;o=o.parent)if(Number.isInteger(o.userData.project_index))return this.entries[o.userData.project_index]?.project.id;
  const point=new THREE.Vector3();let selected=null,distance=Infinity;
  for(const entry of this.entries){const bounds=entry.box.clone().translate(this.group.position);if(!raycaster.ray.intersectBox(bounds,point))continue;const d=point.distanceToSquared(raycaster.ray.origin);if(d<distance){selected=entry.project.id;distance=d;}}
  return selected;
 }
 state(){return {...this.intro.state(),surroundingsContours:this.surroundings.contours,center:this.center,cut:this.cut};}
}

export function createAtelierConnector(chapter,first,span){
 const start=chapter.cut-.12,end=-span*.5+Math.min(5,span*.12),nx=40,nz=10,positions=[],colours=[],points=[],ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
 const previous=chapter.phase;chapter.apply(1);
 chapter.group.updateMatrixWorld(true);first.root.updateMatrixWorld(true);
 const land=[];first.land?.traverse(o=>{if(o.isMesh)land.push(o);});
 const height=(objects,x,z,fallback)=>{ray.set(new THREE.Vector3(x,50,z),down);return ray.intersectObjects(objects,false)[0]?.point.y??fallback;};
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  const t=j/nz,edge=j===0||j===nz,x=-64+i/nx*128+(edge?0:Math.sin(i*12.53+j*4.71)*.9),z=THREE.MathUtils.lerp(start,end,t)+(edge?0:Math.sin(i*5.13+j*8.1)*.21);
  const a=height(chapter.terrain,x,start,.05),b=height(land,x,end,.05+Math.max(0,Math.abs(x)-16)*.10);
  const ridge=Math.max(0,Math.abs(x)-8)*.12*(.65+.35*Math.sin(x*.63+t*4));
  const y=THREE.MathUtils.lerp(a,b,smooth(0,1,t))+Math.sin(Math.PI*t)*ridge;
  const c=new THREE.Color('#f4f1e8').lerp(new THREE.Color('#b1bbb1'),smooth(.12,.94,t));points.push({x,y,z,c});
 }
 function tri(a,b,c){for(const p of [points[a],points[b],points[c]]){positions.push(p.x,p.y,p.z);colours.push(p.c.r,p.c.g,p.c.b);}}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;if((i+j)%2){tri(a,c,b);tri(b,c,d);}else{tri(a,c,d);tri(a,d,b);}}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide});bindJourneyTone(material);
 const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=true;mesh.name='Continuous land / atelier to Oblivion';
 chapter.apply(Math.max(0,previous));
 mesh.userData.connector={start,end,width:128,triangles:nx*nz*2};return mesh;
}
