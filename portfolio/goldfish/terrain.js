import * as THREE from '../vendor/three.module.js';
import {coastX,goldfishHeight,goldfishSurface,hash,READING_CONTOUR,ROOM_CONTOUR,GOLD_COLORS as C} from './plan.mjs';

export function buildGoldfishGround(f,p){
 const root=f.group('01 · Continuous folded-paper terrain'),vertices=[],colours=[],uvs=[],points=[],nx=100,nz=p.mobile?170:72,b=p.bounds;
 for(let iz=0;iz<=nz;iz++)for(let ix=0;ix<=nx;ix++){
  const x=b.left+(b.right-b.left)*ix/nx+(ix>0&&ix<nx?(hash(ix,iz,12)-.5)*.31:0),z=b.back+(b.front-b.back)*iz/nz+(iz>0&&iz<nz?(hash(ix,iz,43)-.5)*.32:0);
  points.push({x,z,y:goldfishHeight(x,z,p)});
 }
 function tri(ai,bi,ci){const ps=[points[ai],points[bi],points[ci]],x=ps.reduce((s,q)=>s+q.x,0)/3,z=ps.reduce((s,q)=>s+q.z,0)/3,h=ps.reduce((s,q)=>s+q.y,0)/3;if(x>coastX(z)+.28)return;const color=new THREE.Color(goldfishSurface(x,z,h,p));color.multiplyScalar(.965+hash(x,z,30)*.06);for(const q of ps){vertices.push(q.x,q.y,q.z);colours.push(color.r,color.g,color.b);uvs.push(q.x/7,q.z/7);}}
 for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){const a=iz*(nx+1)+ix,b=a+1,c=a+nx+1,d=c+1;if((ix+iz)%2){tri(a,c,b);tri(b,c,d);}else{tri(a,c,d);tri(a,d,b);}}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.computeVertexNormals();const ground=f.mesh(geometry,'#ffffff',root,{vertexColors:true,side:THREE.DoubleSide});ground.name='One shared heightfield · 14,400 authored triangles';
 // The plateau has real side faces and strata, not a floating white UI rectangle.
 f.slab('Central paper plateau · lower stratum',p.reading,.115,-1.05,C.edge,root);
 f.slab('Central paper plateau · upper ivory sheet',p.reading,.147,.10,C.white,root);
 f.slab('Studio terrace paper base',p.roomTerrace,3.12,2.76,'#ddc9a6',root);
 root.userData.moduleId='foundation';root.userData.heightfield={columns:nx,rows:nz,bounds:b};root.userData.partNames=['Irregular shared heightfield','White reading plateau','Exposed layered edges','Studio terrace','Riverbed cuts','Curved pale sand coast'];
 return root;
}
