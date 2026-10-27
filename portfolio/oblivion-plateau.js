import * as THREE from './vendor/three.module.js';
import {OBLIVION_PLATEAU} from './oblivion-terrain.mjs?v=eed7fff475f6';
export function buildPlateau(f,c){
 if(c.L.mobile)return;
 const plateau=f.group('OBLIVION · Unbroken reading plateau');
 // The flat reading area is the actual terrain, without an overlapping slab.
 // Preserve this material when architecture is batched into outline groups.
 plateau.userData.groundBlended=true;
 const ring=OBLIVION_PLATEAU.map(([u,v])=>{const p=c.ground(u,v);return new THREE.Vector3(p.x,.102,p.z)});
 const geometry=new THREE.BufferGeometry().setFromPoints(ring);
 plateau.add(new THREE.LineLoop(geometry,new THREE.LineBasicMaterial({color:'#647570',transparent:true,opacity:.2,depthWrite:false})));
 return plateau;
}
