import {groundPoint,smooth,clamp} from '../map-model.mjs?v=eed7fff475f6';
import {sampleSource,FLOW_SOURCE} from './source-heightfield.mjs?v=eed7fff475f6';
// A single masterplan drives all modules; four transformed patches use the game's real relief.
export const FLOW_ZONES=[
 {id:'massif',letter:'A',name:'雪峰主山',color:'#85969a'},
 {id:'ridge',letter:'B',name:'围合山脊',color:'#8fa98e'},
 {id:'reading',letter:'C',name:'阅读台地',color:'#e5c997'},
 {id:'river',letter:'D',name:'融水河谷',color:'#69babc'},
 {id:'ecology',letter:'E',name:'河岸生态',color:'#578572'},
 {id:'coast',letter:'F',name:'海岸浅滩',color:'#a2bdb2'},
 {id:'ocean',letter:'G',name:'开放海面',color:'#779faf'},
 {id:'air',letter:'H',name:'云与鸟',color:'#acadb7'}
];
export const FLOW_CONTENT={
 desktop:{copy:{left:.61,right:.89,top:.21,bottom:.43},button:{left:.61,right:.76,top:.46,bottom:.53},art:{left:.61,right:.89,top:.56,bottom:.88}},
 mobile:{copy:{left:.13,right:.89,top:.22,bottom:.47},button:{left:.13,right:.68,top:.49,bottom:.56},art:{left:.13,right:.89,top:.59,bottom:.83}}
};
const plans=new WeakMap();
export function flowPlan(L){
 if(plans.has(L))return plans.get(L);
 const depth=L.depth,span=L.span||depth*1.22,mobile=L.mobile;
 const plan={L,depth,span,bounds:{left:-28,right:28,top:-span/2,bottom:span/2},
 massif:{x:mobile?-8.5:-12,z:mobile?-depth*.40:-6.5,extent:mobile?31:42,heightScale:.086},
 reading:{x:mobile?0:10,z:mobile?depth*.055:1.1,width:mobile?30.8:15.5,depth:mobile?depth*.67:18.5},
 coastX:z=>mobile?29-1.12*Math.max(0,z-depth*.30):27.5-1.85*Math.max(0,z-2.1)+.55*Math.sin(z*.57),
 boxes:(L.zones||[]).map(zone=>{const a=groundPoint(zone.left,zone.top,L),b=groundPoint(zone.right,zone.bottom,L);return{x:(a.x+b.x)/2,z:(a.z+b.z)/2,width:Math.abs(b.x-a.x)+.45,depth:Math.abs(b.z-a.z)+.45};})};
 plan.geology=[
 {id:'massif',...plan.massif,extentX:plan.massif.extent,extentZ:plan.massif.extent,angle:0},
 {id:'north-ridge',x:mobile?8:7.5,z:mobile?-depth*.29:-8.9,extentX:mobile?22:37,extentZ:mobile?22:13.5,heightScale:.034,angle:-.13},
 {id:'east-rim',x:mobile?20:17.8,z:mobile?depth*.10:1.5,extentX:mobile?11:13,extentZ:mobile?depth*.78:24,heightScale:.042,angle:.10},
 {id:'foreland',x:mobile?-17:-3,z:mobile?depth*.25:9.9,extentX:mobile?12:29,extentZ:mobile?depth*.48:9.6,heightScale:.024,angle:-.12}
 ];
 plan.nodes=mobile?[[-9.3,-depth*.385,4.7],[-12,-depth*.355,3],[-16.8,-depth*.31,.60],[-18,-depth*.21,.16],[-18,0,.12],[-17.6,depth*.28,.12],[-10,depth*.43,.12],[5,depth*.455,.12],[25,depth*.46,.12]]:
 [[-11.8,-4.9,5.25],[-13.3,-3.25,3.9],[-14.15,-1.1,2.1],[-14.5,1.45,.68],[-13.4,4.1,.20],[-10.6,6.1,.13],[-6,7.4,.12],[.1,8.8,.12],[8,9.4,.12],[16.3,10.3,.12],[25,11,.12]];
 plan.river=[];
 for(let i=0;i<plan.nodes.length-1;i++)for(let j=0;j<20;j++){
 const t=j/20,p0=plan.nodes[Math.max(0,i-1)],p1=plan.nodes[i],p2=plan.nodes[i+1],p3=plan.nodes[Math.min(plan.nodes.length-1,i+2)];
 const cat=axis=>.5*(2*p1[axis]+(-p0[axis]+p2[axis])*t+(2*p0[axis]-5*p1[axis]+4*p2[axis]-p3[axis])*t*t+(-p0[axis]+3*p1[axis]-3*p2[axis]+p3[axis])*t*t*t);
 plan.river.push({x:cat(0),z:cat(1),y:p1[2]+(p2[2]-p1[2])*smooth(0,1,t),width:.23+.61*smooth(1.6,7.2,i+t),t:(i+t)/(plan.nodes.length-1)});
 }
 const end=plan.nodes.at(-1);plan.river.push({x:end[0],z:end[1],y:end[2],width:.86,t:1});
 plan.headwater={x:plan.river[0].x,z:plan.river[0].z,y:plan.river[0].y,rx:.64,rz:.51};
 plan.groves=mobile?[[-15.4,-depth*.24,5],[-16.3,-depth*.04,4],[-15.8,depth*.19,5],[17.5,-depth*.10,5],[17.8,depth*.29,5],[-11.9,depth*.40,4]]:
 [[-18.3,1.8,5],[-11.8,4.5,6],[-8.5,8.8,5],[-1.8,10.7,4],[2.2,-8.2,5],[13.6,-9.1,5],[18.9,-.8,5],[18.7,5.8,4],[13.9,9.1,4]];
 plan.outcrops=mobile?[[-17.2,-depth*.28,1.1],[18.2,-depth*.19,.9],[18.2,depth*.17,.9],[-16,depth*.34,.75]]:
 [[-19.1,-1.5,1.2],[-10.3,3.8,.9],[-5.6,9.6,.9],[4.5,-7.1,1.15],[16.7,-6.2,1],[18.2,3.8,1.1],[14.5,9.2,.85]];
 plan.clouds=mobile?[[-14,-depth*.36,2.8,2.7],[13,-depth*.28,2.5,2.1],[19,depth*.29,2.5,2.1]]:
 [[-17.4,-7.8,3.1,2.6],[-4.1,-8.4,3.5,2.9],[20.5,6,2.8,2.2]];
 plan.flocks=mobile?[[-14.7,-depth*.18,3],[18.5,depth*.24,3]]:[[-6.8,2.8,3],[16.5,-5.7,3],[-2,10.5,2]];
 plan.source=FLOW_SOURCE;plans.set(L,plan);return plan;
}
export function sampleGeology(x,z,p){const dx=x-p.x,dz=z-p.z,c=Math.cos(p.angle||0),s=Math.sin(p.angle||0),u=(dx*c+dz*s)/(p.extentX||p.extent)+.5,v=(-dx*s+dz*c)/(p.extentZ||p.extent)+.5;if(u<0||u>1||v<0||v>1)return 0;return Math.max(0,sampleSource(u,v))*p.heightScale;}
export function sourceMountain(x,z,plan){return sampleGeology(x,z,plan.massif);}
export function riverMetric(x,z,plan){
 let distance=Infinity,near=plan.river[0];
 for(let i=0;i<plan.river.length-1;i++){const a=plan.river[i],b=plan.river[i+1],dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)),px=a.x+dx*t,pz=a.z+dz*t,d=Math.hypot(x-px,z-pz);if(d<distance){distance=d;near={x:px,z:pz,y:a.y+(b.y-a.y)*t,width:a.width+(b.width-a.width)*t,t:a.t+(b.t-a.t)*t};}}
 return {...near,distance};
}
export function readingMask(x,z,plan){
 const r=plan.reading,qx=(x-r.x)/(r.width/2),qz=(z-r.z)/(r.depth/2),angle=Math.atan2(qz,qx),d=(Math.abs(qx)**2.2+Math.abs(qz)**2.2)**(1/2.2),edge=1+.05*Math.sin(angle*5)+.028*Math.cos(angle*9);
 let mask=1-smooth(.88*edge,1.13*edge,d);
 for(const b of plan.boxes){const bx=Math.abs((x-b.x)/(b.width/2)),bz=Math.abs((z-b.z)/(b.depth/2));mask=Math.max(mask,1-smooth(.98,1.16,Math.max(bx,bz)));}return mask;
}
export function shoreDistance(x,z,plan){return(plan.coastX(z)-x)/(plan.L.mobile?1.48:2.10);}
export function seaDepth(x,z,plan){const d=Math.max(0,-shoreDistance(x,z,plan));return .05+.27*d+.055*d*d;}
export function flowSurface(x,z,plan){
 const samples=plan.geology.map(p=>sampleGeology(x,z,p));let dominant=0;for(let i=1;i<samples.length;i++)if(samples[i]>samples[dominant])dominant=i;
 const mountain=samples[0],relief=samples[dominant],r=riverMetric(x,z,plan),flat=readingMask(x,z,plan),shore=shoreDistance(x,z,plan);
 const low=.15+.095*(.5+.5*Math.sin(x*.32+z*.19))*(.5+.5*Math.sin(z*.46-x*.11));let h=low+relief;
 const lake=plan.headwater,basin=Math.hypot((x-lake.x)/lake.rx,(z-lake.z)/lake.rz),channel=1-smooth(r.width*.63,r.width+.52,r.distance),pool=1-smooth(.76,1.36,basin),cut=Math.max(channel,pool),waterY=pool>channel?lake.y:r.y;
 h=h*(1-cut)+(waterY-.22)*cut;
 const bank=1-smooth(r.width+.05,r.width+.65,r.distance),bankHeight=r.y-.22+.36*smooth(r.width*.45,r.width*1.23,r.distance);
 h=Math.max(h,bankHeight*bank+h*(1-bank));h=.10+(h-.10)*(1-flat)**2;
 const ocean=1-smooth(-.12,.65,shore);h=h*(1-ocean)+(.12-seaDepth(x,z,plan))*ocean;
 const join=smooth(.445,.50,Math.abs(z)/plan.span);h=h*(1-join)+.10*join;
 return{height:h,mountain,relief,geology:plan.geology[dominant].id,white:flat,river:r.distance,metric:r,shore,basin,wet:1-smooth(r.width+.25,r.width+1.8,r.distance)};
}
export function flowHeight(u,v,L){const p=groundPoint(u,v,L);return flowSurface(p.x,p.z,flowPlan(L));}






