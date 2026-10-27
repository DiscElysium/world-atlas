import * as THREE from './vendor/three.module.js';
import {screenPoint,seeded} from './map-model.mjs?v=03bcba9148dc';
import {tennisHeight,tennisTerrainColor} from './tennis-layout.mjs?v=03bcba9148dc';
import {tennisMaterial} from './tennis-materials.js?v=03bcba9148dc';

export function buildTennisGround(L){
 const nx=70,nz=68,random=seeded(831),points=[],positions=[],colors=[];
 for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++){
  const px=-28+x/nx*56+(x>0&&x<nx?(random()-.5)*.85:0),pz=(z/nz-.5)*L.depth*1.65+(z>0&&z<nz?(random()-.5)*.52:0);
  const q=screenPoint(px,.17,pz,L),sample=tennisHeight(q.u,q.v,L);points.push({x:px,y:sample.baseHeight,z:pz,u:q.u,v:q.v});
 }
 const triangle=(a,b,c)=>{const ps=[points[a],points[b],points[c]],u=ps.reduce((s,p)=>s+p.u,0)/3,v=ps.reduce((s,p)=>s+p.v,0)/3,h=ps.reduce((s,p)=>s+p.y,0)/3,col=new THREE.Color(tennisTerrainColor(u,v,h,L));col.multiplyScalar(.985+random()*.025);for(const p of ps){positions.push(p.x,p.y,p.z);colors.push(col.r,col.g,col.b)}};
 for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const a=z*(nx+1)+x,b=a+1,c=a+nx+1,d=c+1;if((x+z)%2){triangle(a,c,b);triangle(b,c,d)}else{triangle(a,c,d);triangle(a,d,b)}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,tennisMaterial('#ffffff',{vertexColors:true,surface:'chalk'}));mesh.name='TennisAtom · Continuous faceted terrain';mesh.receiveShadow=true;mesh.castShadow=true;return mesh;
}
