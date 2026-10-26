import * as THREE from './vendor/three.module.js';
import {smooth} from './map-model.mjs';

// Close small terrestrial gaps with a shared physical foundation. Space stays open.
export function createJourneyGround(projects,span){
 const positions=[],colors=[],width=56,steps=12;
 function colorAt(z){
  const p=Math.max(0,Math.min(projects.length-1,z/span)),a=Math.floor(p),b=Math.min(projects.length-1,a+1);
  return new THREE.Color(projects[a].ground).lerp(new THREE.Color(projects[b].ground),smooth(.38,.62,p-a));
 }
 function vertex(x,z){const c=colorAt(z);positions.push(x,-.18,z);colors.push(c.r,c.g,c.b);}
 for(let chapter=0;chapter<projects.length-1;chapter++){
  if(projects[chapter].id==='engine'||projects[chapter+1].id==='engine')continue;
  const seam=(chapter+.5)*span;
  for(let i=0;i<steps;i++){
   const a=seam-span*.055+i/steps*span*.11,b=seam-span*.055+(i+1)/steps*span*.11;
   vertex(-width/2,a);vertex(-width/2,b);vertex(width/2,a);vertex(width/2,a);vertex(-width/2,b);vertex(width/2,b);
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
 const ground=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));
 ground.name='Continuous journey foundation';ground.receiveShadow=true;return ground;
}
