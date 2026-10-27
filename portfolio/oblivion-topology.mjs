import {groundPoint,screenPoint,seeded,smooth,whiteMask} from './map-model.mjs?v=03bcba9148dc';
import {oblivionHeight,OBLIVION_PLATEAU,plateauMask} from './oblivion-terrain.mjs?v=03bcba9148dc';

// An irregular triangle network follows the plateau rim, ridges and gorge floor.
export function oblivionTopology(L,span){
 const points=[],keys=new Set(),random=seeded(58291),nx=L.mobile?22:28,nz=Math.max(16,Math.round(span/56*nx));
 function add(x,z){
  if(x<-28||x>28||z<-span/2||z>span/2)return;
  const key=Math.round(x*10000)+':'+Math.round(z*10000);if(keys.has(key))return;keys.add(key);
  const uv=screenPoint(x,.17,z,L),sample=oblivionHeight(uv.u,uv.v,L),seam=smooth(.37,.5,Math.abs(z)/span),common=.11+Math.max(0,Math.abs(x)-14)*.12;
  points.push({x,z,y:sample.height*(1-seam)+common*seam,u:uv.u,v:uv.v});
 }
 function uvPoint(u,v){const p=groundPoint(u,v,L);add(p.x,p.z)}
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  const boundary=i===0||i===nx||j===0||j===nz;
  add(-28+i/nx*56+(boundary?0:(random()-.5)*56/nx*.82),-span/2+j/nz*span+(boundary?0:(random()-.5)*span/nz*.82));
 }
 if(!L.mobile){
  for(let i=0;i<OBLIVION_PLATEAU.length;i++){
   const a=OBLIVION_PLATEAU[i],b=OBLIVION_PLATEAU[(i+1)%OBLIVION_PLATEAU.length];
   for(let t=0;t<1;t+=.25){const u=a[0]+(b[0]-a[0])*t,v=a[1]+(b[1]-a[1])*t;uvPoint(u,v);if(i>=4&&i<=6){uvPoint(u+.022,v+.01);uvPoint(u+.055,v+.018)}}
  }
 }
 // Sampling the spine gives each mountain a deliberate silhouette.
 for(const path of [[[.01,.02],[.035,.15],[.08,.23]],[[.30,-.055],[.43,.01],[.52,.105]],[[.83,.035],[.91,.11],[1.01,.19]],[[.005,.84],[.025,.96],[.11,1.04]]]){
  for(let i=0;i<path.length-1;i++)for(let t=0;t<1;t+=.25)uvPoint(path[i][0]+(path[i+1][0]-path[i][0])*t,path[i][1]+(path[i+1][1]-path[i][1])*t);
 }
 for(let v=.41;v<=1.15;v+=.055){const u=.66+.39*(.62-v);uvPoint(u,v);uvPoint(u+.075,v+.016)}
 const count=points.length,R=Math.max(56,span)*4,sites=[...points,{x:-R,z:-R/2},{x:R,z:-R/2},{x:0,z:R}];
 function triangle(a,b,c){
  const A=sites[a],B=sites[b],C=sites[c],d=2*(A.x*(B.z-C.z)+B.x*(C.z-A.z)+C.x*(A.z-B.z));
  if(Math.abs(d)<1e-9)return null;
  const aa=A.x*A.x+A.z*A.z,bb=B.x*B.x+B.z*B.z,cc=C.x*C.x+C.z*C.z;
  const x=(aa*(B.z-C.z)+bb*(C.z-A.z)+cc*(A.z-B.z))/d,z=(aa*(C.x-B.x)+bb*(A.x-C.x)+cc*(B.x-A.x))/d;
  return{a,b,c,x,z,r2:(A.x-x)**2+(A.z-z)**2};
 }
 let triangles=[triangle(count,count+1,count+2)];
 for(let p=0;p<count;p++){
  const point=sites[p],boundary=new Map(),good=[];
  for(const t of triangles){
   if((point.x-t.x)**2+(point.z-t.z)**2>t.r2+1e-7){good.push(t);continue}
   for(const [a,b] of [[t.a,t.b],[t.b,t.c],[t.c,t.a]]){const key=Math.min(a,b)+':'+Math.max(a,b);if(boundary.has(key))boundary.delete(key);else boundary.set(key,[a,b])}
  }
  for(const [a,b] of boundary.values()){const t=triangle(a,b,p);if(t)good.push(t)}triangles=good;
 }
 const faces=triangles.filter(t=>t.a<count&&t.b<count&&t.c<count).map(t=>[t.a,t.b,t.c]);
 const positions=[],barycentric=[],strokes=[];
 for(const face of faces){
  const vertices=face.map(i=>points[i]),u=vertices.reduce((s,p)=>s+p.u,0)/3,v=vertices.reduce((s,p)=>s+p.v,0)/3;
  const heights=vertices.map(p=>p.y),spread=Math.max(...heights)-Math.min(...heights),mean=heights.reduce((s,h)=>s+h,0)/3;
  const quiet=Math.max(whiteMask(u,v,L),L.mobile?0:plateauMask(u,v));
  const seam=smooth(.405,.49,Math.abs(vertices.reduce((s,p)=>s+p.z,0)/3)/span);
  const strength=(spread>2.5?.78:spread>.35||Math.abs(mean)>1?.60:.34)*(1-quiet*.64)*(1-seam);
  vertices.forEach((p,i)=>{positions.push(p.x,p.y,p.z);barycentric.push(i===0?1:0,i===1?1:0,i===2?1:0);strokes.push(strength)});
 }
 return{positions,barycentric,strokes,points,faces};
}
