// A shared plan in metres. X is left/right; negative Z is the back of the map.
// Object anchors, the land mesh, river cuts and coastal water use this same plan.
export const GOLD_COLORS={paper:'#f4ecd9',white:'#faf3e4',edge:'#d7cbb2',stone:'#d9ceb8',wood:'#a97b45',woodLight:'#c79c61',ink:'#40372d',blue:'#2266be',red:'#b82236',green:'#648056',ochre:'#d4b95c',cyan:'#338b96',pink:'#da80b7',purple:'#a786bb'};
export const GOLD_MODULES=[
 {id:'foundation',name:'地形基础'}, {id:'room',name:'创作者房间'},
 {id:'aquarium',name:'鱼缸与植物'}, {id:'water',name:'河流与海滩'},
 {id:'paths',name:'阶梯与桥'}, {id:'ecology',name:'植物与游戏拼贴'},
 {id:'village',name:'山脚小屋'}, {id:'couple',name:'纸片人物'},
 {id:'content',name:'作品平台'}
];
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function smooth(a,b,x){const t=clamp((x-a)/(b-a));return t*t*(3-2*t);}
export function hash(x,z,seed=0){const n=Math.sin(x*127.1+z*311.7+seed*74.31)*43758.5453123;return n-Math.floor(n);}
export function polygonDistance(x,z,points){
 let inside=false,distance=Infinity;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[i],b=points[j];
  if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  const dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz));
  distance=Math.min(distance,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));
 }return inside?-distance:distance;
}
export const READING_CONTOUR=[[-10,-2.3],[-8.5,-4.6],[-5.8,-5.6],[-1.1,-5.55],[3.4,-4.95],[7.6,-3.1],[11.6,-.8],[13.6,2.9],[13.1,5.5],[10.5,7.0],[5.8,8.05],[.3,7.75],[-5.1,6.65],[-8.25,4.6],[-9.9,1.45]];
export const ROOM_CONTOUR=[[-20.0,-12.8],[-17.6,-14.1],[-9.2,-13.45],[-6.9,-11.0],[-7.55,-6.7],[-10,-5.8],[-15.2,-6.25],[-19.5,-8.0]];
const NORTH_RIVER=[{x:-8.1,z:-9.5,y:2.64,w:.75},{x:-7.65,z:-7.8,y:1.95,w:.90},{x:-5.45,z:-6.4,y:.68,w:1.00},{x:-1.0,z:-6.15,y:-.69,w:1.03},{x:3.3,z:-5.9,y:-1.22,w:1.15},{x:7.35,z:-5.3,y:-1.35,w:1.15},{x:10.6,z:-3.6,y:-1.38,w:1.28},{x:17,z:-.25,y:-1.38,w:1.5}];
const WEST_RIVER=[{x:-8.5,z:-7.25,y:1.25,w:.8},{x:-10.5,z:-4.4,y:.40,w:.9},{x:-12.2,z:-1.0,y:-.82,w:1.0},{x:-13.0,z:2.2,y:-1.10,w:1.0},{x:-12.1,z:5.15,y:-1.36,w:1.05},{x:-10.4,z:7.8,y:-1.55,w:1.05},{x:-8.55,z:11,y:-2.05,w:1.0},{x:-7.1,z:16,y:-2.30,w:1.05}];
export function pathSample(x,z,points){
 let best={distance:Infinity};
 for(let i=0;i<points.length-1;i++){
  const a=points[i],b=points[i+1],dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)),px=a.x+t*dx,pz=a.z+t*dz,d=Math.hypot(x-px,z-pz);
  if(d<best.distance)best={distance:d,x:px,z:pz,y:a.y+(b.y-a.y)*t,width:a.w+(b.w-a.w)*t,index:i,t};
 }return best;
}
export function coastX(z){
 const points=[[-24,-1],[-16,.2],[-12,2.6],[-8,7.3],[-4,12.5],[0,15.65],[4,17.15],[8,15.75],[12,13],[16,10.7],[24,7.8]];
 for(let i=0;i<points.length-1;i++)if(z<=points[i+1][0]){const a=points[i],b=points[i+1],t=smooth(a[0],b[0],z);return a[1]+(b[1]-a[1])*t;}return points.at(-1)[1];
}
export function perceptionSide(x,z){return x>1.25+.13*Math.sin(z*.45);}
export function makeGoldfishPlan(options={}){
 const plan={
  bounds:{left:-29,right:36,back:-23,front:22},seaY:-1.39,readingY:.14,
  reading:READING_CONTOUR,roomTerrace:ROOM_CONTOUR.map(([x,z])=>[x,z+1.5]),northRiver:NORTH_RIVER.map((q,i)=>({...q,z:q.z+(i===0?1.5:i===1?1.0:0)})),westRiver:WEST_RIVER.map((q,i)=>({...q,z:q.z+(i===0?1.5:0)})),
  room:{x:-13.95,z:-8.5,y:3.15,width:10.0,depth:6.5},
  aquarium:{x:-10.35,z:-8.95,y:3.15},couple:{x:1.3,z:-1.30,y:.17,width:9.0,height:4.7,lean:.76},
  content:{title:{x:-2.0,z:1.8,width:11.5,depth:2.1},name:{x:-2,z:3.4,width:7,depth:.82},intro:{x:-2,z:4.4,width:10.3,depth:.72},button:{x:-2,z:6.25,width:7.0,depth:1.33},image:{x:8.05,z:3.4,width:9.2,depth:5.25,angle:-.11}},
  bridges:[{x:-12.65,z:3.35,y:.22,length:5.3,width:1.32,angle:.55},{x:-8.5,z:10.25,y:1.10,length:4.45,width:1.08,angle:.58}],
  paths:[
   {a:[-16.8,3.15,-5.35],b:[-10.4,.17,-1.4],width:1.8,steps:14},
   {a:[-8.0,.16,6.30],b:[-5.9,2.1,10.20],width:1.25,steps:10},
   {a:[11.6,.15,5.7],b:[16.0,-.8,8.20],width:1.15,steps:7},
   {a:[-20.0,2.85,6.8],b:[-16.55,.25,1.8],width:1.25,steps:13}
  ],
  trees:[[-21,-10,2.8],[-22,-5,2.1],[-20,-2,2.65],[-21,1,3.1],[-23,4,2.4],[-20.0,6.8,2.2],[-21.4,10,2.6],[-18.4,12,2.9],[-15.6,9.5,2.2],[-14.6,7.5,1.9],[-17.8,4.7,2.2],[-18,-15,2.4],[-14,-15.9,3.5],[-10.5,-16.3,2.4],[-5.9,-12,2.9],[-3.5,-13.6,2.5],[-1.9,-10.9,2.1],[1.8,-10.4,2.1],[4.7,-9.9,2.2],[6.2,-7.8,1.7],[9.8,-6.1,1.7],[12.5,-3,1.2],[14.0,1.5,1.05],[14.6,6.2,1.7],[9.7,10.0,2.2],[5.7,10.65,1.9],[2.4,10.75,2.5],[-.1,11.3,2.3],[-2.85,10.6,2.6]],
  houses:[{x:-21.0,z:10.6,angle:-.23,scale:.9},{x:-18.0,z:12.15,angle:.12,scale:.68}],
  anchors:{room:[-13.95,3.15,-8.5],aquarium:[-10.35,3.15,-8.95],couple:[1.3,.17,-1.3],title:[-2,.2,1.8],image:[8.05,.21,3.4],sea:[23,-1.39,0]}
 };
 if(options.mobile){
  plan.mobile=true;plan.bounds={left:-35,right:40,back:-85,front:85};
  plan.reading=plan.reading.map(([x,z])=>[x,z>4.5?z+2.4:z]);
  plan.content={title:{x:-2,z:1.1,width:13,depth:2.5},name:{x:-2,z:3.25,width:7,depth:1.3},intro:{x:-2,z:4.7,width:10.3,depth:1.2},button:{x:-2,z:7.1,width:9,depth:3.2},image:{x:8.5,z:2.9,width:8.5,depth:5,angle:-.11}};
 }
 return plan;
}
const ridge=(x,z,cx,cz,rx,rz,height)=>height*Math.max(0,1-Math.max(Math.abs((x-cx)/rx),Math.abs((z-cz)/rz)));
export function goldfishHeight(x,z,plan=makeGoldfishPlan()){
 const coast=coastX(z)-x;
 if(coast<0)return plan.seaY-.12;
 let h=.1+ridge(x,z,-24,-9,11,14,4.6)+ridge(x,z,-7,-17,15,7,4.6)+ridge(x,z,-25,12,12,8,4.0)+ridge(x,z,1.5,13.0,10.0,6.8,3.25)+ridge(x,z,7,-11,8,7,2.5);
 const roomDistance=polygonDistance(x,z,plan.roomTerrace),roomWeight=1-smooth(-.10,.65,roomDistance);h=h*(1-roomWeight)+3.15*roomWeight;
 const pd=polygonDistance(x,z,plan.reading),readingWeight=1-smooth(-.05,1.4,pd);h=h*(1-readingWeight)+plan.readingY*readingWeight;
 // A curved normal-coloured beach surrounds the peninsula; no physical centre seam.
 const beachWeight=1-smooth(.05,3.6,coast);h=h*(1-beachWeight)+(-1.30+.35*smooth(0,3.6,coast))*beachWeight;
 const a=pathSample(x,z,plan.northRiver),b=pathSample(x,z,plan.westRiver),river=a.distance/a.width<b.distance/b.width?a:b;
 const cut=1-smooth(.82,1.70,river.distance/river.width);h=h*(1-cut)+(river.y-.14)*cut;
 return h;
}
export function goldfishSurface(x,z,height,plan){
 if(polygonDistance(x,z,plan.reading)<-.12)return GOLD_COLORS.white;
 if(coastX(z)-x<3.6)return '#eee3cf';
 if(polygonDistance(x,z,plan.roomTerrace)<-.25)return '#eee1ca';
 if(height>2.5)return '#e1d7c4';
 return GOLD_COLORS.paper;
}
