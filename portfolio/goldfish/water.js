import * as THREE from '../vendor/three.module.js';
import {coastX,goldfishHeight} from './plan.mjs?v=03bcba9148dc';
import {collageMaterial,PALETTE_CHANNELS} from './palette.js?v=03bcba9148dc';
function surface(parent,name,positions,uvs,texture,options,animate){
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.computeVertexNormals();
 const mat=collageMaterial(new THREE.MeshStandardMaterial({map:texture,color:'#ffffff',roughness:options.atlas==='water'?.77:1,side:THREE.DoubleSide}),options,animate);
 const mesh=new THREE.Mesh(geo,mat);mesh.name=name;mesh.castShadow=false;mesh.receiveShadow=true;mesh.userData.dynamic=true;parent.add(mesh);return mesh;
}
function channelMesh(f,parent,name,points,texture){
 const samples=[];
 for(let i=0;i<points.length-1;i++)for(let j=0;j<8;j++){
  const a=points[i],b=points[i+1],t=j/8,dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
  samples.push({x:a.x+dx*t,z:a.z+dz*t,y:a.y+(b.y-a.y)*t,width:a.w+(b.w-a.w)*t,nx:-dz/d,nz:dx/d});
 }
 const a=points.at(-2),b=points.at(-1),d=Math.hypot(b.x-a.x,b.z-a.z);samples.push({...b,width:b.w,nx:-(b.z-a.z)/d,nz:(b.x-a.x)/d});
 const positions=[],uvs=[],left=[],right=[];
 for(let i=0;i<samples.length-1;i++){
  const a=samples[i],b=samples[i+1],q=[[-1,a],[1,a],[-1,b],[1,b]].map(([side,s])=>[s.x+s.nx*s.width*side,s.y+.017,s.z+s.nz*s.width*side]);
  for(const k of [0,2,1,1,2,3]){const v=q[k];positions.push(...v);uvs.push(v[0]/5,v[2]/7);}
  if(i%2===0){left.push([q[0][0],q[0][1]+.025,q[0][2]]);right.push([q[1][0],q[1][1]+.025,q[1][2]]);}
 }
 surface(parent,name,positions,uvs,texture,{atlas:'water',channels:PALETTE_CHANNELS.redBlue,water:true,worldBoundary:true});
 for(const [edge,points] of [['left',left],['right',right]])f.ribbon(name+' / pale bank '+edge,points,'#f3eee3',.028,parent);
}
export function buildGoldfishWater(f,p,animate=()=>{},textures={}){
 const root=f.group('04 · Sand coastline, breaking surf and connected rivers'),atlas=textures.collage?.coastAtlas||null;
 channelMesh(f,root,'Original blue river / printed currents',p.westRiver,atlas);
 channelMesh(f,root,'One river / selective blue-to-red perception',p.northRiver,atlas);
 const positions=[],uvs=[],verts=[],nz=p.mobile?190:90,nx=46;
 for(let iz=0;iz<=nz;iz++){
  const z=p.bounds.back+(p.bounds.front-p.bounds.back)*iz/nz,left=coastX(z)-.02;
  for(let ix=0;ix<=nx;ix++){const t=ix/nx,x=left+(p.bounds.right-left)*t,y=p.seaY+Math.min(1,t*15)*(.025*Math.sin(x*.8+z*.73));verts.push({x,y,z});}
 }
 const triangle=(a,b,c)=>{for(const q of [verts[a],verts[b],verts[c]]){positions.push(q.x,q.y,q.z);uvs.push(q.x/11,q.z/16);}};
 for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){const a=iz*(nx+1)+ix,b=a+1,c=a+nx+1,d=c+1;triangle(a,c,b);triangle(b,c,d);}
 const sea=surface(root,'Photographic paper waves / white foam stays white',positions,uvs,atlas,{atlas:'water',channels:PALETTE_CHANNELS.redBlue,water:true,worldBoundary:true,ripple:true},animate);
 sea.userData.coastline=true;
 const sand=[],sandUv=[],rows=180,columns=10;
 const point=(j,i)=>{const z=p.bounds.back+(p.bounds.front-p.bounds.back)*j/rows,x=coastX(z)-.08-i/columns*3.50;return[x,goldfishHeight(x,z,p)+.046,z];};
 for(let j=0;j<rows;j++)for(let i=0;i<columns;i++){
  const q=[point(j,i),point(j+1,i),point(j,i+1),point(j+1,i+1)];
  for(const k of [0,2,1,1,2,3]){sand.push(...q[k]);sandUv.push(q[k][0]/5,q[k][2]/8);}
 }
 const beach=surface(root,'Warm ivory sand texture / never colour-swapped',sand,sandUv,atlas,{atlas:'sand'});beach.userData.beach=true;
 const foam=[],steps=360;
 for(let j=0;j<steps;j++){
  const z=p.bounds.back+(p.bounds.front-p.bounds.back)*j/steps,next=z+(p.bounds.front-p.bounds.back)/steps;
  const q=t=>{const x=coastX(t)+.10+.12*Math.sin(t*2.3),w=.19+.17*(.5+.5*Math.sin(t*3.2));return[[x,p.seaY+.083,t],[x+w,p.seaY+.10,t]];},a=q(z),b=q(next);
  for(const v of [a[0],b[0],a[1],a[1],b[0],b[1]])foam.push(...v);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(foam,3));geo.computeVertexNormals();const white=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#fffdf2',roughness:1,side:THREE.DoubleSide}));white.name='White breaking surf at the sand-water edge';white.castShadow=false;root.add(white);
 for(let j=0;j<16;j++){
  const z=-19+j*2.5,row=[];for(let i=0;i<=8;i++){const t=z+i*.15;row.push([coastX(t)+.65+.10*Math.sin(t*2),p.seaY+.10,t]);}f.ribbon('Secondary white wave crest '+j,row,'#fffdf2',.031,root);
 }
 root.userData.moduleId='water';return root;
}
