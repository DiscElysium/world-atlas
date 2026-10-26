import * as THREE from '../../vendor/three.module.js';
import {seatedBody,maskShell,eyeSockets,eyeWalls} from './source-models.js';
import {mergeMeshes} from '../geometry.js';
import {buildChair} from '../04-table/index.js';
import {SEATS} from '../layout.mjs';

function sourceGeometry(positions){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;}
const bodyGeo=sourceGeometry(seatedBody),maskGeo=sourceGeometry(maskShell),socketGeo=sourceGeometry(eyeSockets),wallGeo=sourceGeometry(eyeWalls);
// Keep the original sitting topology and contact points, but give its upper
// silhouette the broad, carved-statue proportions of the approved composition.
const shapedBody=bodyGeo.clone();const bodyPosition=shapedBody.attributes.position;
for(let i=0;i<bodyPosition.count;i++){const y=bodyPosition.getY(i),hip=88,head=Math.max(0,Math.min(1,(y-185)/12));bodyPosition.setXYZ(i,bodyPosition.getX(i)*1.70,y>hip?hip+(y-hip)*1.40:y,bodyPosition.getZ(i)-20*head);}shapedBody.computeVertexNormals();
function flatShape(forms,parent,points,color,position){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const m=forms.mesh(parent,new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false}),color,position);m.rotation.y=Math.PI;return m;}
export function buildMask(forms,parent,{kind='moustache',position=[0,0,0],yaw=0}={}){
 const root=forms.group(kind+' mask',parent,position);root.rotation.y=yaw;
 const shell=forms.mesh(root,maskGeo,'#e6decd',[0,0,0],[.032,.040,.034],'original game mask shell');shell.rotation.y=Math.PI;
 const eye=forms.mesh(root,socketGeo,'#2c2014',[0,0,0],[.032,.040,.034],'recesses aligned to original eye holes');eye.rotation.y=Math.PI;eye.castShadow=false;
 const walls=forms.mesh(root,wallGeo,'#d9d0bd',[0,0,0],[.032,.040,.034],'actual eye-opening inner walls');walls.rotation.y=Math.PI;
 if(kind==='monocle'){
  forms.mesh(root,new THREE.TorusGeometry(.095,.018,5,12),'#473421',[-.1785,.220,-.055]);
  forms.beam(root,'#473421',[-.265,.20,-.055],[-.265,-.10,-.055],.012,5);
 }else if(kind==='tear'){
  flatShape(forms,root,[[.16,.04],[.12,-.12],[.14,-.20],[.20,-.20],[.23,-.13]],'#3a2718',[0,.18,-.070]);
 }else{
  flatShape(forms,root,[[-.27,-.14],[-.20,-.21],[-.08,-.15],[0,-.18],[.08,-.15],[.20,-.21],[.27,-.14],[.23,-.26],[.10,-.27],[0,-.23],[-.10,-.27],[-.23,-.26]],'#382416',[0,0,-.085]);
 }
 root.userData.kind=kind;return root;
}
export function buildActor(forms,parent,{position=[0,0,0],yaw=0,kind='moustache',chair=false}={}){
 const root=forms.group('seated opponent · '+kind,parent,position);root.rotation.y=yaw;
 const body=forms.mesh(root,shapedBody,'#b9ad96',[.015,.025,-.80],[.015,.015,.015],'adapted original faceted seated body');body.rotation.y=Math.PI;
 const mask=buildMask(forms,root,{kind,position:[0,3.43,-.50]});mask.scale.setScalar(1.35);
 if(chair){const seat=buildChair(forms,root,{name:'gallery chair'});seat.scale.set(1.28,1,1.12);}
 root.userData.kind=kind;root.userData.height=4.06;return root;
}
export function buildActors(forms,{gallery=false,maskOnly=false}={}){
 const root=forms.group(gallery?'05 · character gallery':'05 · three seated opponents');root.userData.moduleId=gallery?(maskOnly?'mask-kit':'actor-kit'):'actors';
 const kinds=['moustache','monocle','tear'];
 if(gallery){kinds.forEach((kind,i)=>{if(maskOnly){const m=buildMask(forms,root,{kind,position:[(i-1)*1.75,.65,0],yaw:Math.PI});m.scale.setScalar(1.6);}else buildActor(forms,root,{kind,position:[(i-1)*3.3,0,0],yaw:Math.PI,chair:true});});}
 else {
  const seats=SEATS.slice(0,3);
  seats.forEach((seat,i)=>buildActor(forms,root,{...seat,kind:kinds[i]}));
 }
 root.userData.actorCount=3;root.userData.maskKinds=kinds;root.userData.originalTopology=true;mergeMeshes(root,'actor assembly');return root;
}
