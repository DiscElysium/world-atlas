import * as THREE from '../vendor/three.module.js';
import {smooth} from '../map-model.mjs';
import {createPhotoDraft} from './draft.js';

// The desktop and portrait paths are separately baked Bullet simulations.
// Scroll samples positions/quaternions; idle time never advances the pile.
export function createOtherworksView(gltf,motion,portraitMotion){
 const model=gltf.scene,group=new THREE.Group(),scaffold=new THREE.Group(),photos=[],interactive=[];
 group.name='Other Works · photographic drafting atelier';scaffold.name='Other Works · terrain, board, lettering and tools';model.add(scaffold);
 for(const object of [...model.children]){
  if(object===scaffold)continue;
  if(object.userData.photo_id){photos.push(object);object.traverse(mesh=>{if(mesh.isMesh){mesh.userData.action={id:'otherworks',kind:'project'};interactive.push(mesh);}});}
  else scaffold.add(object);
 }
 if(photos.length!==19)throw Error('The photo atelier must contain all 19 physical prints');
 model.traverse(mesh=>{
  if(!mesh.isMesh)return;mesh.castShadow=!mesh.userData.label_role;mesh.receiveShadow=true;
  // Keep the author's printed image colors and charcoal lettering faithful.
  // The surrounding cardstock, frame bevels and terrain remain fully lit.
  if(mesh.name.startsWith('PRINT_')||mesh.name.startsWith('CAPTION_')||mesh.userData.component_id==='P05'){
   const source=mesh.material;mesh.material=new THREE.MeshBasicMaterial({map:source.map??null,color:source.map?'#ffffff':source.color,side:THREE.DoubleSide,toneMapped:false});mesh.castShadow=false;mesh.receiveShadow=false;
  }
  if(mesh.userData.label_role==='otherworks_title'||/P05.*link.label/i.test(mesh.name)){mesh.userData.action={id:'otherworks',kind:'project'};interactive.push(mesh);}
  for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){if(material.map)material.map.anisotropy=8;material.roughness=Math.max(material.roughness??.8,.65);if(material.transparent)material.depthWrite=false;}
 });
 // A heading is one link, including spaces and letter counters. A physical
 // invisible proxy gives mouse and touch the full typographic hit area.
 let heading;model.traverse(o=>{if(o.userData.label_role==='otherworks_title')heading=o;});
 heading.geometry.computeBoundingBox();const bounds=heading.geometry.boundingBox,size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const headingLink=new THREE.Mesh(new THREE.BoxGeometry(size.x+.4,.01,size.z+1.5),new THREE.MeshBasicMaterial({visible:false}));headingLink.name='Other Works heading link area';headingLink.position.copy(center);headingLink.position.y+=.015;headingLink.userData.action={id:'otherworks',kind:'project'};heading.add(headingLink);interactive.push(headingLink);
 group.add(model);
 const drafting=createPhotoDraft();model.add(drafting.mesh);
 const lettering=[];scaffold.traverse(mesh=>{if(mesh.userData.component_id==='P05')lettering.push({mesh,scale:mesh.scale.clone(),position:mesh.position.clone()});});
 const view={id:'otherworks',group,model,focus:new THREE.Vector3(),yaw:0,scale:40/49,fov:20,pitch:0,orientation:new THREE.Quaternion(),interactive,mobile:false,lastSample:null};
 const position=new THREE.Vector3(),qa=new THREE.Quaternion(),qb=new THREE.Quaternion();
 view.configure=L=>{
  view.mobile=L.mobile;scaffold.scale.set(L.mobile?.62:1,1,L.mobile?2.2:1);
  drafting.configure(L.mobile,L.mobile?portraitMotion:motion,photos);
  for(const {mesh,scale,position} of lettering){mesh.scale.copy(scale);mesh.position.copy(position);if(L.mobile){mesh.scale.z*=.62/2.2;if(mesh.userData.label_role==='otherworks_title'){mesh.scale.x*=.97/.62;mesh.scale.z=scale.z*.97/2.2;}if(/seven.explorations/i.test(mesh.name))mesh.position.x=14.5;}}
  const camera=new THREE.PerspectiveCamera();camera.up.set(0,1,0);camera.position.set(...(L.mobile?[0,Math.sin(62*Math.PI/180),Math.cos(62*Math.PI/180)]:[-5,51,36]));
  view.cameraDirection=camera.position.clone().normalize();view.pitch=Math.asin(view.cameraDirection.y);camera.lookAt(0,0,0);view.orientation.copy(camera.quaternion);view.cameraWidth=L.mobile?28:Math.max(40,40*L.aspect/(1664/944));view.lastSample=null;
 };
 view.update=({scroll,reduced})=>{
  const data=view.mobile?portraitMotion:motion,amount=reduced?1:smooth(-.88,-.04,scroll),frame=amount*(data.sample_frames.length-1),low=Math.floor(frame),high=Math.min(data.sample_frames.length-1,low+1),mix=frame-low;
  if(view.lastSample===frame)return;view.lastSample=frame;
  for(const photo of photos){
   const track=data.tracks[photo.name];if(!track)throw Error('Missing rigid-body track: '+photo.name);
   const a=track[low],b=track[high];position.fromArray(a.p).lerp(new THREE.Vector3().fromArray(b.p),mix);photo.position.copy(position);qa.fromArray(a.q).normalize();qb.fromArray(b.q).normalize();photo.quaternion.copy(qa.slerp(qb,mix));
   photo.scale.fromArray(data.scales?.[photo.name]??[1,1,1]);
  }
  view.progress=amount;view.frame=frame;view.group.updateMatrixWorld(true);
 };
 view.diagnostics=()=>({id:view.id,prints:photos.length,physicalEngine:motion.engine,portraitPhysicalEngine:portraitMotion.engine,progress:view.progress,frame:view.frame,mobile:view.mobile,title:'other works',thicknesses:[...new Set(photos.map(o=>o.userData.paper_thickness))]});
 return view;
}
