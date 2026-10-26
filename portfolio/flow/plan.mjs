import {groundPoint,smooth,clamp,seeded} from '../map-model.mjs';
import {sampleFitzRoyElevation,FITZ_ROY_REFERENCE_SIZE} from './measured-geology.mjs';
const FLOW_SOURCE={size:FITZ_ROY_REFERENCE_SIZE,source:'Measured Fitz Roy bedrock / Island II',mainPeakUV:[122/256,133/256],version:8};

// V08: one dominant sculpted massif, measured erosion and connected foothills.
// Reference landmarks are unprojected at their real elevation, never used as a height map.
export const FLOW_CONTENT={desktop:{copy:{left:.635,right:.90,top:.265,bottom:.38},button:{left:.635,right:.785,top:.399,bottom:.465},art:{left:.635,right:.886,top:.478,bottom:.699}},mobile:{copy:{left:.13,right:.89,top:.22,bottom:.47},button:{left:.13,right:.68,top:.49,bottom:.56},art:{left:.13,right:.89,top:.59,bottom:.83}}};
export const FLOW_ZONES=[
 {id:'massif',letter:'A',name:'主雪峰与肩脊',color:'#b8bfbd'},
 {id:'ridge',letter:'B',name:'围合山脊',color:'#b9c7ab'},
 {id:'reading',letter:'E',name:'浅色阅读台地',color:'#efeade'},
 {id:'river',letter:'D',name:'融水河谷',color:'#75d6df'},
 {id:'ecology',letter:'C',name:'层叠低丘',color:'#c4d0ae'},
 {id:'coast',letter:'F',name:'石滩与岸线',color:'#d7d9c7'},
 {id:'ocean',letter:'G',name:'开放海面',color:'#498ca5'},
 {id:'air',letter:'H',name:'薄云与飞鸟',color:'#f6f8f4'}
];
const plans=new WeakMap();
export function raisedPoint(u,v,h,L){const k=(1-2*v)*L.tanFov,z=(L.cosPitch*h-k*(L.distance-L.sinPitch*h))/(L.sinPitch-k*L.cosPitch),d=L.distance-L.sinPitch*h-L.cosPitch*z;return{x:(2*u-1)*d*L.tanFov*L.aspect,z};}
function measuredPatch(L,id,u,v,height,ex,ez,angle=0,reference=[122/256,133/256,1,1],base=700){
 const peak=raisedPoint(u,v,height,L),c=Math.cos(angle),s=Math.sin(angle);
 return{id,x:peak.x,z:peak.z,extentX:ex,extentZ:ez,height,angle,reference,base,referencePeak:sampleFitzRoyElevation(reference[0],reference[1]),heightScale:height/(sampleFitzRoyElevation(reference[0],reference[1])-base)};
}
function measuredSample(x,z,p){
 const dx=x-p.x,dz=z-p.z,c=Math.cos(p.angle),s=Math.sin(p.angle),u=(dx*c+dz*s)/p.extentX+.5,v=(-dx*s+dz*c)/p.extentZ+.5;
 if(u<=0||u>=1||v<=0||v>=1)return {height:0,weight:0};
 const [cu,cv,su,sv]=p.reference,ru=cu+(u-.5)*su,rv=cv+(v-.5)*sv,meters=sampleFitzRoyElevation(ru,rv),r=Math.max(0,meters-p.base)/(p.referencePeak-p.base);
 const weight=smooth(0,.19,Math.min(u,v,1-u,1-v));
 if(p.hero){
  // The approved composition needs one dominant apex, not an unedited DEM plateau.
  // Broad geological ribs establish its silhouette; measured curvature supplies erosion.
  const qx=(dx*c+dz*s)/(p.extentX*.48),qz=(-dx*s+dz*c)/(p.extentZ*.48),a=Math.atan2(qz,qx),rib=.12*Math.cos(a*5+.7*Math.sin(a*2))+.065*Math.sin(a*8+.4),radius=Math.hypot(qx,qz)/(1+rib*smooth(.08,.5,Math.hypot(qx,qz))),fall=Math.max(0,1-radius),macro=p.height*Math.pow(fall,1.45);
  const coarse=(sampleFitzRoyElevation(ru+.026,rv)+sampleFitzRoyElevation(ru-.026,rv)+sampleFitzRoyElevation(ru,rv+.026)+sampleFitzRoyElevation(ru,rv-.026))/4;
  const erosion=Math.tanh((meters-coarse)/160)*.45*(p.height/6.8)*smooth(.025,.19,radius)*smooth(0,.28,fall),bedrock=Math.pow(r,1.8)*p.height*weight;
  return{height:Math.max(0,macro*.93+bedrock*.07+erosion),weight:1};
 }
 return{height:Math.pow(r,p.id==='massif'?1.8:1.18)*p.height,weight};
}
export function sampleGeology(x,z,p){const s=measuredSample(x,z,p);return s.height*s.weight;}
export function sourceMountain(x,z,p){return sampleGeology(x,z,p.massif);}
function surfaceAnchor(u,v,p){let h=.13,q;for(let i=0;i<12;i++){q=raisedPoint(u,v,h,p.L);h=h*.35+flowSurface(q.x,q.z,p,false).height*.65;}return raisedPoint(u,v,h,p.L);}
function cat(a,b,c,d,t){return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);}
export function flowPlan(L){
 if(plans.has(L))return plans.get(L);
 const mobile=L.mobile,depth=L.depth,span=L.span||depth*1.22,p={L,depth,span,blueprint:true,version:8,source:FLOW_SOURCE,bounds:{left:-28,right:28,top:-span/2,bottom:span/2}};
 p.geology=mobile?[
  measuredPatch(L,'massif',.20,.11,6.8,28,Math.min(31,depth*.50),.28,[122/256,133/256,.58,.62],850),
  measuredPatch(L,'north-ridge',.77,.15,2.8,16,depth*.19,.15,[.152,.293,.38,.30],850),
  measuredPatch(L,'northeast',.96,.06,3.1,14,depth*.17,-.3,[.52,.605,.42,.34],950),
  measuredPatch(L,'east-rim',1.10,.54,1.5,12,depth*.42,-.3,[.152,.293,.34,.52],850),
  measuredPatch(L,'foreland',-.1,.78,1.5,17,depth*.3,.4,[.152,.293,.45,.32],900)
 ]:[
  measuredPatch(L,'massif',.178,.055,6.8,28,29,.28,[122/256,133/256,.58,.62],850),
  measuredPatch(L,'massif',.028,.44,2.8,14,24,.13,[.152,.293,.38,.51],950),
  measuredPatch(L,'north-ridge',.56,.075,2.8,18,11,-.22,[.152,.293,.42,.32],850),
  measuredPatch(L,'northeast',.865,.014,2.65,17,14,.12,[.52,.605,.45,.40],1000),
  measuredPatch(L,'east-rim',.977,.432,2.2,10,19,-.18,[.152,.293,.29,.51],850),
  measuredPatch(L,'foreland',.08,.775,1.7,21,17,.26,[.152,.293,.52,.37],1100)
 ];
 p.massif=p.geology[0];
 p.geology.forEach(g=>g.hero=true);
 // No line-ridges: connected bedrock is blended with a smooth fourth-power union.
 p.ridges=[];
 p.boxes=(L.zones||Object.values(FLOW_CONTENT[mobile?'mobile':'desktop'])).map(b=>{const qs=[[b.left,b.top],[b.right,b.top],[b.left,b.bottom],[b.right,b.bottom]].map(([u,v])=>groundPoint(u,v,L)),xs=qs.map(q=>q.x),zs=qs.map(q=>q.z),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...zs),bottom=Math.max(...zs);return{x:(left+right)/2,z:(top+bottom)/2,width:right-left+1.0,depth:bottom-top+1.0};});
 const center=groundPoint(mobile?.50:.765,mobile?.52:.49,L);p.reading={...center,width:mobile?39:23.5,depth:depth*(mobile?.91:1.03)};
 p.readingBoundary=(mobile?[[.12,.18],[.83,.18],[.93,.31],[.94,.87],[.74,.90],[.20,.86],[.09,.65]]:[[.585,.22],[.71,.185],[.94,.21],[.938,.36],[.926,.54],[.944,.705],[.87,.78],[.64,.765],[.48,.69],[.36,.60],[.49,.515],[.53,.38]]).map(([u,v])=>raisedPoint(u,v,.13,L));
 const anchors=mobile?[[.10,.22,1.1,.25],[.075,.35,.32,.31],[.07,.53,.13,.34],[.075,.76,.12,.41],[.25,.905,.12,.48],[.6,.96,.12,.6],[1.03,1.02,.12,.8]]:
 [[.169,.322,2.1,.24],[.185,.42,1.15,.40],[.239,.586,.35,.60],[.307,.763,.13,.68],[.367,.835,.12,.65],[.467,.815,.12,.63],[.565,.919,.12,.66],[.671,.899,.12,.66],[.77,.949,.12,.76],[.879,.925,.12,.85],[.98,.90,.12,1.06]];
 p.nodes=anchors.map(([u,v,y,w])=>({...raisedPoint(u,v,y,L),y,width:w}));p.river=[];
 for(let i=0;i<p.nodes.length-1;i++)for(let j=0;j<18;j++){const t=j/18,a=p.nodes[Math.max(0,i-1)],b=p.nodes[i],c=p.nodes[i+1],d=p.nodes[Math.min(p.nodes.length-1,i+2)];p.river.push({x:cat(a.x,b.x,c.x,d.x,t),z:cat(a.z,b.z,c.z,d.z,t),y:b.y+(c.y-b.y)*smooth(0,1,t),width:b.width+(c.width-b.width)*t,t:(i+t)/(p.nodes.length-1)});}p.river.push({...p.nodes.at(-1),t:1});
 const first=p.river[0];p.headwater={...first,rx:.23,rz:.30};
 const upper=raisedPoint(mobile?.22:.192,mobile?.17:.175,4.7,L);p.upperValley=[{...upper,y:4.7,width:.14,t:-.1},first];
 const shore=mobile?[[1.09,.24],[1.11,.68],[.96,.84],[.91,1.04]]:[[1.07,.40],[.986,.63],[.951,.72],[.90,.83],[.855,.92],[.82,1.08]];
 p.shore=shore.map(([u,v])=>raisedPoint(u,v,.12,L)).sort((a,b)=>a.z-b.z);
 p.coastX=z=>{let i=0;while(i<p.shore.length-2&&z>p.shore[i+1].z)i++;const a=p.shore[i],b=p.shore[i+1];return a.x+(b.x-a.x)*(z-a.z)/(b.z-a.z)+.12*Math.sin(z*2.4);};
 p.forelandLabel=groundPoint(mobile?.06:.22,mobile?.76:.85,L);
 const random=seeded(64707);p.props=[];
 const groves=mobile?[[.04,.28,5],[.96,.36,4],[.94,.78,5],[.18,.88,5]]:[[.18,.51,6],[.205,.67,7],[.30,.67,5],[.42,.37,6],[.51,.17,5],[.67,.06,5],[.91,.12,6],[.96,.27,7],[.975,.52,5],[.94,.60,7],[.865,.77,6],[.74,.845,5],[.585,.925,7],[.386,.905,6],[.475,.755,5],[.655,.765,4]];
 for(const [u,v,n] of groves){const q=surfaceAnchor(u,v,p);for(let i=0;i<n;i++)p.props.push({kind:'pine'+(1+i%3),x:q.x+(random()-.5)*1.55,z:q.z+(random()-.5)*1.2,scale:.55+random()*.50,rotation:random()*6.28});}
 const outcrops=mobile?[[.035,.42,.55],[.96,.29,.6],[.96,.65,.7],[.21,.89,.4]]:[[.435,.72,.87],[.55,.79,.61],[.50,.915,.93],[.96,.41,.83],[.983,.48,.75],[.895,.43,.48],[.89,.11,.43],[.40,.40,.50],[.17,.79,.38],[.885,.895,.62],[.845,.925,.6]];
 for(const [u,v,scale] of outcrops){const q=surfaceAnchor(u,v,p);p.props.push({...q,kind:'outcrop',scale,rotation:random()*6.28});}
 // Stones trace shoulders and banks, rather than being scattered across the reading area.
 for(let i=0;i<190;i++){const r=p.river[Math.floor(random()*p.river.length*.92)],side=random()<.5?-1:1,x=r.x+side*(r.width+.45+random()*1.35),z=r.z+(random()-.5)*1.4;p.props.push({x,z,kind:'pebble',scale:.045+random()*.11,rotation:random()*6.28});}
 for(const [u,v] of groves){const q=groundPoint(u,v,L);for(let i=0;i<5;i++)p.props.push({kind:'stone',x:q.x+(random()-.5)*3,z:q.z+(random()-.5)*2,scale:.08+random()*.17,rotation:random()*6.28});}
 for(const [u,v] of (mobile?[[.91,.45],[.84,.86],[.16,.58]]:[[.012,.08],[.03,.51],[.038,.79],[.253,.86],[.39,.59],[.53,.405],[.835,.26],[.775,.165],[.84,.80],[.62,.76],[.38,.89]])){const q=groundPoint(u,v,L);p.props.push({...q,kind:'bare-tree',scale:.40+random()*.16,rotation:random()*6.28});}
 p.clouds=(mobile?[[.15,.095,2.9,7.8],[.86,.16,2.8,7.8],[.01,.67,2.6,7.8]]:[[.077,.214,3.1,7.8],[.368,.065,1.9,7.8],[.618,.152,2.2,7.8]]).map(([u,v,w,y])=>({...raisedPoint(u,v,y,L),u,v,y,width:w,depth:w*.22,height:.10,rotation:-.12}));
 p.birds=(mobile?[[.12,.38],[.92,.77]]:[[.277,.672],[.43,.636],[.88,.86]]).flatMap(([u,v],f)=>{const q=groundPoint(u,v,L);return[0,1].map(i=>({...q,x:q.x+i*.34,z:q.z+i*.22,y:.8,scale:.22,phase:f+i}));});
 plans.set(L,p);return p;
}
export function riverMetric(x,z,p){let distance=Infinity,q=p.river[0];for(let i=-1;i<p.river.length-1;i++){const a=i<0?p.upperValley[0]:p.river[i],b=i<0?p.upperValley[1]:p.river[i+1],dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)),d=Math.hypot(x-a.x-dx*t,z-a.z-dz*t);if(d<distance){distance=d;q={x:a.x+dx*t,z:a.z+dz*t,y:a.y+(b.y-a.y)*t,width:a.width+(b.width-a.width)*t,t:a.t+(b.t-a.t)*t};}}return{...q,distance};}
export function readingMask(x,z,p){let inside=false,d=Infinity;const vs=p.readingBoundary;
 for(let i=0,j=vs.length-1;i<vs.length;j=i++){const a=vs[j],b=vs[i],dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)),edge=Math.hypot(x-a.x-dx*t,z-a.z-dz*t);d=Math.min(d,edge);if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;}
 return 1-smooth(-.65,2.5,(inside?-d:d)+.10*Math.sin(x*.81+z*1.31));
}
export function shoreDistance(x,z,p){return p.coastX(z)-x;}
export function seaDepth(x,z,p){const d=Math.max(0,-shoreDistance(x,z,p));return .045+.21*d+.038*d*d;}
export function flowSurface(x,z,p,withRiver=true){
 let sum=0,weight=0,index=0,contribution=0;
 for(let i=0;i<p.geology.length;i++){const s=measuredSample(x,z,p.geology[i]),h=s.height*s.weight;sum+=h**4;weight+=s.weight;if(h>contribution){contribution=h;index=i;}}
 const relief=Math.pow(sum,.25),geology=relief>.25?p.geology[index].id:'lowlands',white=readingMask(x,z,p),shore=shoreDistance(x,z,p),r=riverMetric(x,z,p);
 // Low terraces inherit measured bedrock texture rather than intersecting line-ridges.
 const low=.13+.06*Math.sin(x*.71+z*.36)*Math.cos(z*.55-x*.26),foot=.18*(1-white)*(1-smooth(1.2,3.2,relief))*(.6+.4*Math.sin(x*.43-z*.61));let h=low+relief+foot;
 const summitDistance=Math.hypot(x-p.massif.x,z-p.massif.z),bankWidth=1.5+1.1*smooth(.5,4.0,h)+.23*Math.sin(r.t*16.3)+.11*Math.sin(r.t*43),channel=(1-smooth(r.width*.72,r.width+bankWidth,r.distance))*smooth(1.5,3.0,summitDistance);h=h*(1-channel)+Math.min(h,r.y-.12)*channel;
 const bank=1-smooth(r.width+.08,r.width+1.8,r.distance),wet=1-smooth(r.width+.2,r.width+2.6,r.distance);
 h=h*(1-white)+.13*white;
 const seabed=.12-seaDepth(x,z,p),sea=1-smooth(-.1,.45,shore);h=h*(1-sea)+seabed*sea;
 const join=smooth(.46,.5,Math.abs(z)/p.span);h=h*(1-join)+(shore<0?seabed:.10)*join;
 const block=shore<0?9:shore<.8?8:h>3.5&&geology==='massif'?2:wet>.55?7:({massif:2,'north-ridge':3,northeast:4,'east-rim':5,foreland:6}[geology]||1);
 return{height:h,rawHeight:Math.max(0,h-.13),relief,originalRelief:relief,summitDistance,mountain:sampleGeology(x,z,p.massif),geology,white,shore,wet,bank,block,river:r.distance,metric:r,basin:99};
}
export function flowHeight(u,v,L){const q=groundPoint(u,v,L);return flowSurface(q.x,q.z,flowPlan(L));}
