import {groundHeight} from './landform.mjs';
export const GOLD_MODULES=[['foundation','01 地形'],['water','02 海岸与浪'],['room','03 画室'],['village','04 建筑'],['paths','05 石径'],['boardwalk','06 木栈道'],['ecology','07 植被'],['props','08 画室道具'],['couple','09 纸片人物'],['content','10 作品内容']].map(([id,name])=>({id,name}));
export const C={sand:'#f1e4ca',wet:'#cfbfa4',paper:'#f5efe2',stone:'#a29d93',wood:'#aa8058',woodDark:'#735539',wall:'#eee2c8',roof:'#c47752',foam:'#faf6e9',ink:'#3f3025',leaf:'#72965c',flower:'#dd98ad',yellow:'#e7c968',water:'#439db1',fish:'#e87b3e'};
export const hash=(x,z,s=1)=>{const a=Math.sin(x*127.1+z*311.7+s*74.7)*43758.5453;return a-Math.floor(a);};
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
export const COAST=[[-18,-11],[-9,-11.5],[-2,-10],[5,-7],[11,-1],[16,5],[18,7]];
export function coastZ(x){for(let i=1;i<COAST.length;i++){const a=COAST[i-1],b=COAST[i];if(x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return 7+(x-18)*.82;}
export function coastDistance(x,z){const slope=(coastZ(x+.01)-coastZ(x-.01))/.02;return (z-coastZ(x))/Math.sqrt(1+slope*slope);}
export function inside(x,z,points){let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
export function polygonDistance(x,z,points){let d=Infinity;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],vx=b[0]-a[0],vz=b[1]-a[1],t=clamp(((x-a[0])*vx+(z-a[1])*vz)/(vx*vx+vz*vz));d=Math.min(d,Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t));}return inside(x,z,points)?-d:d;}
export function makeGoldfishPlan({mobile=false}={}){
 const reading=mobile?[[-5,-.2],[-3,-1],[4,-1],[6,2],[6,14],[-5,14],[-6,6]]:[[-6,1],[-4,-.2],[3,-.8],[7,1],[9.35,5],[7.5,9],[1,10.5],[-4.5,9],[-5.5,6]];
 const levels={sea:0,wetSand:.14,drySand:.45,reading:1.8,studio:3.5,upper:4.8,terrace:5.4};
 const landforms={
  ridges:[[-18,-5,6.5,7,.82],[-18,7,6,5,.60],[-7.6,-7.8,4,3,.755],[-7.5,12.8,4,3,.75]],
  dunes:[[4.8,-5.1,3.1,1.5,.34],[8.6,-1.7,2.8,1.35,.38],[12.2,4.7,2.5,1.45,.39],[12.0,9.0,3.2,2.2,.41]],
  pads:[{x:-12,z:0,w:6.5,d:5.7,y:levels.studio,blend:1.9},{x:-13,z:-6.5,w:5.8,d:5.1,y:levels.upper,blend:2.0},{x:-13,z:10.9,w:5.9,d:5.1,y:levels.reading,blend:2.1,angle:-10*Math.PI/180}]
 };
 const stairs=[
  {id:'studio',start:[-12,2.9],direction:[0,1],width:3.5,run:3.6,high:levels.studio,low:levels.reading,steps:7},
  {id:'upper',start:[-9.7,-5.4],direction:[1,0],width:1.9,run:4.9,high:levels.upper,low:levels.reading,steps:11},
  {id:'beach',start:[4.4,-.6],direction:[1,0],width:1.9,run:3.4,high:levels.reading,low:levels.drySand,steps:6}
 ];
 const routes=[[[-12,6.9],[-5.8,3.0],1.8],[[-5.8,2.0],[-3,-1.1],1.5],[[-3,-1.1],[4.15,-.6],1.5],[[-4.4,-5.4],[-3,-1.3],1.5]];
 const coastalVerge=[[[-9.2,-9.0],[-5.7,-7.2],[-2.4,-5.4],[1.2,-3.4],[4.7,-1.9]],[[7.4,1.4],[9.4,3.6],[10.4,6.1],[10.9,8.8],[10.2,11.7]]];
 const content=mobile?{title:{x:0,z:3,width:7.2,depth:1.25},name:{x:0,z:4.35,width:2.4,depth:.7},intro:{x:0,z:5.4,width:5.6,depth:.60},button:{x:0,z:12,width:6,depth:1.65},image:{x:0,z:8.5,width:6.6,depth:4.2,angle:-.04}}:{title:{x:-.8,z:4.3,width:7.6,depth:1.45},name:{x:-.8,z:5.6,width:2.0,depth:.63},intro:{x:-.8,z:6.45,width:4.8,depth:.48},button:{x:-.8,z:7.75,width:4.8,depth:1.15},image:{x:6,z:5.5,width:4.2,depth:3.0,angle:-10*Math.PI/180}};
 return{version:'natural-coast-v5',mobile,levels,landforms,stairs,routes,coastalVerge,extent:{width:56,depth:48},core:{width:36,depth:24},seaY:levels.sea,reading,content,room:{x:-12,y:levels.studio,z:0,width:5.6,depth:4.8,height:3.1,roof:4},houses:[{id:'Back terrace house',x:-13,y:levels.upper,z:-6.5,w:5,d:4.4,h:3.8,angle:0,flat:true},{id:'Foreground tile-roof house',x:-13,y:levels.reading,z:10.9,w:5.2,d:4.4,h:2.8,angle:-10*Math.PI/180,flat:false}],seat:{x:0,y:levels.reading,z:-1.7,w:4.6,d:.9,h:.5,pitch:90,thickness:.015},boardwalk:{start:[8.7,levels.drySand,-.6],end:[13,.15,3],width:1.6,planks:16,posts:6},trees:[[-16,-9,.85,2.8],[-9,-8.6,1,3.2],[-7.7,-7.7,1.25,3.5],[-16,3.4,.9,2.6],[-7.5,9.4,1.1,3],[3.5,-5.3,1.05,3.1],[5.7,-3.8,.82,2.5],[11.8,6.9,1.1,3.0],[7.7,10.1,1.0,2.8]],shrubs:[[-16.3,-5],[-8.1,-7.9],[-8,-3.3],[-8,.7],[-7,3.8],[-5.8,8.4],[-2.7,-1.8],[2.7,-1.8],[3.9,-4.1],[5.6,-3.0],[10.6,6.7],[11.5,7.6],[9.1,8.1],[3.5,10.3]],grass:[[8.8,-1.6],[10.7,.8],[12.2,3.4],[14.1,5.6],[9.7,7.2],[-8.8,-8.8],[-7.2,-6.3],[-16,5.7]],flowers:[[[-8,-2.6],[-7.8,-1.3]],[[-7,3.3],[-6.8,4.7]],[[-3.1,-2.2],[-2.3,-2.3]],[[2.4,-2.2],[3.2,-2.4]],[[4.2,-4.1],[5.5,-3.4]],[[10.6,6.8],[11.2,7.7]],[[-5.6,8.2],[-4.4,9.0]],[[1.0,10.7],[2.6,10.5]],[[5.4,10.0],[6.4,9.7]]],rocks:[[-10,-10.5,1.8,1.2,1.5],[-3.5,-9.5,1.5,.95,1.1],[4.6,-6.5,1.2,.7,1],[10,-1.8,1.6,1,1.3],[15,5.6,1.2,.8,1]]};
}
export function beachHeight(x,z){
 const d=coastDistance(x,z);
 if(d<0)return -.025-Math.min(1.3,-d*.085);
 if(d<.75)return .12*smooth(0,.75,d);
 return .12+.23*smooth(.75,2.3,d);
}
export function stairContains(x,z,q,padding=0){const dx=x-q.start[0],dz=z-q.start[1],along=dx*q.direction[0]+dz*q.direction[1],across=dx*q.direction[1]-dz*q.direction[0];return along>=-padding&&along<=q.run+padding&&Math.abs(across)<=q.width/2+padding;}
export function stairHeight(x,z,q){const dx=x-q.start[0],dz=z-q.start[1],along=dx*q.direction[0]+dz*q.direction[1],across=dx*q.direction[1]-dz*q.direction[0];if(along<0||along>q.run||Math.abs(across)>q.width/2)return null;const step=Math.min(q.steps-1,Math.floor(along/q.run*q.steps));return q.high-(q.high-q.low)*(step+1)/q.steps;}
export function goldfishHeight(x,z,p){return groundHeight(x,z,p);}
