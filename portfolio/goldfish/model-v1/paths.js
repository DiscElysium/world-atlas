import * as THREE from '../../vendor/three.module.js';
import {C,hash,goldfishHeight,inside,stairContains} from './plan.mjs';
function fittedStone(f,p,g,x,z,w,d,angle,colour){
 const corners=[[-w/2,-d/2],[-w/2,d/2],[w/2,d/2],[w/2,-d/2]],points=[];
 for(const [u,v] of corners){const xx=x+u*Math.cos(angle)+v*Math.sin(angle),zz=z-u*Math.sin(angle)+v*Math.cos(angle);points.push([xx,goldfishHeight(xx,zz,p)+.022,zz]);}
 if(p.stairs.some(q=>[[x,0,z],...points].some(v=>stairContains(v[0],v[2],q,.05))))return null;
 const center=[x,goldfishHeight(x,z,p)+.022,z],positions=[];
 for(let i=0;i<4;i++){const a=points[i],b=points[(i+1)%4],a0=[a[0],a[1]-.065,a[2]],b0=[b[0],b[1]-.065,b[2]];positions.push(...center,...a,...b,...a,...a0,...b,...b,...a0,...b0);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();const m=f.mesh(geo,colour,g);m.name='Limestone paving fitted to the ground';return m;
}
export function buildPaths(f,p){
 const g=f.group('05 · Pale reading court, connected paths and fitted steps'),colours=['#efe2c9','#eadcc2','#f2e7d2','#e9dbc0'];
 for(let row=0;row<Math.ceil((p.mobile?16:12)/.65);row++)for(let col=0;col<22;col++){
  const x=-6.9+(col+.5)*.72+(row%2)*.36,z=-1+(row+.5)*.65;if(!inside(x,z,p.reading))continue;
  fittedStone(f,p,g,x,z,.69,.62,(hash(col,row)-.5)*.035,colours[(row+col)%4]);
 }
 for(const [a,b,width] of p.routes){
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(length/.55),angle=Math.atan2(b[0]-a[0],b[1]-a[1]);
  for(let j=0;j<n;j++)for(let side=0;side<3;side++){const t=(j+.5)/n,offset=(side-1)*width/3,x=a[0]+(b[0]-a[0])*t+Math.cos(angle)*offset,z=a[1]+(b[1]-a[1])*t-Math.sin(angle)*offset;if(inside(x,z,p.reading))continue;fittedStone(f,p,g,x,z,width/3-.022,length/n-.022,angle,colours[(j+side)%4]);}
 }
 // Structural treads live in the foundation module. Thin nosings emphasize
 // their real risers without creating another floating staircase.
 for(const q of p.stairs)for(let i=0;i<q.steps;i++){const along=(i+1)*q.run/q.steps-.025,x=q.start[0]+q.direction[0]*along,z=q.start[1]+q.direction[1]*along,y=q.high-(q.high-q.low)*(i+1)/q.steps;f.box('Limestone stair nosing · '+q.id,q.direction[0]?[.065,.035,q.width]:[q.width,.035,.065],[x,y+.006,z],'#f0e5d0',g,{bevel:false});}
 const pink=f.material(C.flower);
 for(let i=0;i<38;i++){const a=hash(i,11)*Math.PI*2,r=5.5+hash(i,12)*1.5,x=Math.cos(a)*r,z=4.2+Math.sin(a)*r*.63;if(p.mobile&&Math.abs(x)<3.5&&z>1)continue;const m=f.ball('Fallen flower petal',[.065,.017,.11],[x,goldfishHeight(x,z,p)+.048,z],pink,g);m.rotation.y=a;}
 // The open coastal fence draws the edge of the whole landscape. The two
 // runs leave a generous break at the beach stairs and boardwalk entrance.
 for(const line of p.coastalVerge){const posts=[];
  for(let i=0;i<line.length-1;i++){const a=line[i],b=line[i+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.6);for(let j=0;j<n;j++)posts.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);}posts.push(line.at(-1));
  const tops=posts.map(([x,z])=>{const y=goldfishHeight(x,z,p);f.beam('Coastal fence post rooted in slope',[x,y-.10,z],[x,y+.76,z],.07,C.wood,g,.06,6);return[x,y+.66,z];});
  for(let i=1;i<tops.length;i++)for(const offset of [0,-.27]){const a=tops[i-1],b=tops[i],pts=Array.from({length:4},(_,j)=>{const t=j/3;return new THREE.Vector3(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+offset-Math.sin(t*Math.PI)*.09,a[2]+(b[2]-a[2])*t);}),geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),6,.018,4,false);f.mesh(geo,'#ac9270',g).name='Sagging rope along coastal slope';}
 }
 return g;
}
export function buildBoardwalk(f,p){
 const g=f.group('06 · Six-post timber boardwalk'),q=p.boardwalk,a=new THREE.Vector3(...q.start),b=new THREE.Vector3(...q.end),length=Math.hypot(b.x-a.x,b.z-a.z),angle=Math.atan2(b.x-a.x,b.z-a.z);
 a.y=Math.max(a.y,goldfishHeight(a.x,a.z,p)+.13);b.y=Math.max(b.y,goldfishHeight(b.x,b.z,p)+.13);
 // Clear every plank corner, including the coarser mobile terrain triangles.
 let lift=0;
 for(let j=0;j<=q.planks*2;j++)for(const side of [-.5,0,.5]){const t=j/(q.planks*2),x=a.x+(b.x-a.x)*t+Math.cos(angle)*side*q.width,z=a.z+(b.z-a.z)*t-Math.sin(angle)*side*q.width;lift=Math.max(lift,goldfishHeight(x,z,p)+.07-(a.y+(b.y-a.y)*t));}a.y+=lift;b.y+=lift;
 const local=f.group('Boardwalk across the same shore',g);local.position.copy(a);local.rotation.y=angle;const deckY=t=>(b.y-a.y)*t;
 for(let j=0;j<q.planks;j++){const t=(j+.5)/q.planks,m=f.box('Individual boardwalk plank '+(j+1),[q.width,.09,length/q.planks-.035],[0,deckY(t),t*length],j%3?'#b48f66':'#a37a53',local);m.rotation.x=-Math.atan2(b.y-a.y,length);}
 for(const x of [-q.width*.32,q.width*.32])f.beam('Longitudinal support beam',[x,-.13,0],[x,b.y-a.y-.13,length],.07,C.woodDark,local);
 for(const t of [.16,.83])for(const side of [-1,1]){const x=a.x+(b.x-a.x)*t+Math.cos(angle)*side*q.width*.34,z=a.z+(b.z-a.z)*t-Math.sin(angle)*side*q.width*.34,ground=goldfishHeight(x,z,p),height=Math.max(.15,a.y+deckY(t)-ground+.15);f.box('Grounded boardwalk foot',[.19,height,.19],[side*q.width*.34,deckY(t)-height/2,t*length],C.woodDark,local);}
 for(const side of [-1,1]){
  for(const t of [0,.5,1])f.box('Rope railing post',[.16,1.0,.16],[side*q.width*.53,deckY(t)+.44,t*length],C.wood,local);
  for(const start of [0,.5]){const points=[];for(let k=0;k<=6;k++){const t=start+k/12,drop=Math.sin(k/6*Math.PI)*.12;points.push([side*q.width*.53,deckY(t)+.77-drop,t*length]);}f.ribbon('Natural rope between posts',points,'#d4c5a5',.027,local);}
 }
 g.userData.planks=q.planks;g.userData.posts=q.posts;return g;
}
