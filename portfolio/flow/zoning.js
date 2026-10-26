import * as THREE from '../vendor/three.module.js';
import {flowSurface,FLOW_ZONES} from './plan.mjs';
// A geometry-derived construction drawing: overlays share the assembled model's exact vertices.
export function buildFlowZoning(scene,terrain,plan){
 const group=new THREE.Group();group.name='FLOW · construction zones';scene.add(group);
 const palette={lowlands:2,massif:0,'north-ridge':1,northeast:1,'east-rim':1,foreland:4,valley:3,coast:5,seabed:6};
 terrain.meshes.forEach((mesh,i)=>{const id=terrain.modules[i].userData.moduleId,zone=FLOW_ZONES[palette[id]];let geometry=mesh.geometry;
 if(id==='lowlands'){const positions=[],p=geometry.attributes.position;for(let j=0;j<p.count;j+=3){const x=(p.getX(j)+p.getX(j+1)+p.getX(j+2))/3,z=(p.getZ(j)+p.getZ(j+1)+p.getZ(j+2))/3;if(flowSurface(x,z,plan).white<.55)continue;for(let k=0;k<3;k++)positions.push(p.getX(j+k),p.getY(j+k),p.getZ(j+k));}geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));}
 const overlay=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:zone.color,transparent:true,opacity:.47,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));overlay.name='Zone '+zone.letter;overlay.position.y=.012;group.add(overlay);});
 const north=plan.geology.find(g=>g.id==='north-ridge'),river=plan.river[Math.floor(plan.river.length*.15)],shelf=plan.forelandLabel,shoreZ=plan.depth*.29;
 const locations=[[plan.massif.x,plan.massif.z],[north.x,north.z],[plan.reading.x,plan.reading.z],[river.x,river.z],[shelf.x,shelf.z],[plan.coastX(shoreZ)-.9,shoreZ],[plan.coastX(shoreZ)+3,shoreZ],[-3.8,-8.8]];
 FLOW_ZONES.forEach((zone,i)=>{const [x,z]=locations[i],canvas=document.createElement('canvas');canvas.width=384;canvas.height=192;const ctx=canvas.getContext('2d');ctx.fillStyle='#fffffff0';ctx.beginPath();ctx.roundRect(5,5,374,182,24);ctx.fill();ctx.fillStyle='#354940';ctx.textAlign='center';ctx.font='600 42px "Noto Sans SC", Arial';ctx.fillText(zone.letter+'  '+zone.name,192,112);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(3.7,1.85),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthTest:false}));label.rotation.x=-Math.PI/2;label.position.set(x,flowSurface(x,z,plan).height+.3,z);label.renderOrder=50;group.add(label);});
 group.visible=false;return group;
}

