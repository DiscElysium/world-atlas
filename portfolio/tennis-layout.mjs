import {groundPoint,smooth,whiteMask} from './map-model.mjs?v=eed7fff475f6';
const plans=new WeakMap();
export function tennisLayout(L){
 if(plans.has(L))return plans.get(L);
 const anchor=L.mobile?groundPoint(.77,.115,L):{x:10.25,z:-3.45},scale=L.mobile?.60:1.16;
 const plan={L,scale,court:{x:anchor.x,z:anchor.z,y:2.28,angle:L.mobile?.26:.47,width:9.7*scale,depth:19*scale},
 apron:{width:7.4,depth:15.4},channelZ:x=>L.mobile?L.depth*.425+.085*x:9.5+.20*x+1.6*Math.sin((x+14)*.14),
 reading:{x:L.mobile?0:-9.2,z:L.mobile?L.depth*.03:0,width:L.mobile?31:22,depth:L.mobile?L.depth*.65:17.5},
 readingContour:[[-22,-5.2],[-20,-8.3],[-15,-9],[-9,-9.2],[-4.5,-7.5],[-1.8,-4.7],[.35,-1],[.2,2.8],[-2.3,5.8],[-6.4,7.2],[-12,6.75],[-17.8,5.1],[-21.6,2]],
 landContour:[[-6.15,-12.7],[-4.9,-13.75],[-1.4,-13.6],[3.7,-12.9],[4.8,-10],[4.8,-7.5],[4.55,-2.6],[4.8,3.8],[4.55,7.9],[2.7,9.05],[-.1,9.6],[-3.3,9.15],[-4.7,7.05],[-4.55,2.4],[-4.8,-3.8],[-5.6,-8.6]],
 // Authored landforms: the broad composition exists before props are placed.
 landforms: L.mobile?[]:[
  {id:'north-ridge',top:5.8,bottom:-.4,relief:1.7,ochre:.36,contour:[[-31,-11],[-32,-22],[-24,-27],[-14,-25],[-6,-21],[-3,-17],[-8,-14],[-15,-17],[-20,-14],[-25,-11]]},
  {id:'north-landing',top:3.05,bottom:-.6,relief:.12,ochre:.20,contour:[[-26,-10.4],[-25,-16],[-19,-18],[-11,-17],[-7.3,-12.7],[-9,-10],[-12.6,-9.4],[-13.2,-13.55],[-15.8,-13.55],[-14.7,-9.3],[-20,-9.5]]},
  {id:'east-ridge',top:6.0,bottom:-.5,relief:2.0,ochre:.32,contour:[[20.4,-17.5],[23,-24],[32,-23],[35,-11],[31,1.2],[28,7.4],[24.2,5.4],[21.8,-1],[21.3,-7]]},
  {id:'west-buttress',top:3.4,bottom:-1.2,relief:1.3,ochre:.35,contour:[[-30,-6],[-25,-6.5],[-23,-3.4],[-22.3,.6],[-23.5,4.7],[-26,6.4],[-31,4.5]]},
  {id:'south-west-bank',top:3.2,bottom:-1.45,relief:1.45,ochre:.42,contour:[[-32,11],[-25,8.5],[-21,10.5],[-19,14.5],[-17,18],[-25,24],[-33,23]]},
  {id:'south-spur',top:2.15,bottom:-1.25,relief:.75,ochre:.55,contour:[[-5,15.4],[-2.9,13.7],[1.2,14.1],[5.7,18.3],[5.3,23],[-1,23.7],[-5.5,20]]},
  {id:'south-east-bank',top:4.7,bottom:-1.25,relief:1.7,ochre:.40,contour:[[16.8,14.2],[20,11.9],[25,12.7],[31,17],[33,26],[23,27],[16.4,21.3]]}
 ],
 palette:{chalk:'#f4f2e9',limestone:'#e6e4d8',ochre:'#e57a34',wetStone:'#939f99',water:'#659da8'},
 routes:{upperStair:[[-13,.12,-8.9],[-14,3.05,-13.2]],bridge:{x:-12.5,y:.22,angle:.96,length:7}}
 };
 const entrance=courtPoint(plan,-3.75,0,4.5),low=[entrance[0]-3.2,.14,entrance[2]+1.7];
 plan.routes.courtStair=[low,entrance];plan.routes.lowerPath=[[low[0],low[2]],[low[0]-1.6,low[2]+1],[low[0]-3.2,low[2]+3],[low[0]-4.2,low[2]+4.2]];
 plans.set(L,plan);return plan;
}
export function courtCoordinates(x,z,plan){const dx=x-plan.court.x,dz=z-plan.court.z,a=plan.court.angle;return{x:(Math.cos(a)*dx-Math.sin(a)*dz)/plan.scale,z:(Math.sin(a)*dx+Math.cos(a)*dz)/plan.scale};}
export function courtPoint(plan,x,y,z){const a=plan.court.angle,s=plan.scale;return[plan.court.x+s*(Math.cos(a)*x+Math.sin(a)*z),plan.court.y+s*y,plan.court.z+s*(-Math.sin(a)*x+Math.cos(a)*z)];}
export function polygonDistance(x,z,points){
 let inside=false,dist=1e6;for(let i=0,j=points.length-1;i<points.length;j=i++){
 const a=points[i],b=points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));dist=Math.min(dist,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));
 }return inside?-dist:dist;
}
export function routeDistance(points,x,z){let d=Infinity;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));d=Math.min(d,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));}return d;}
export function tennisWorldHeight(x,z,plan){
 const L=plan.L,bank=Math.abs(z-plan.channelZ(x)),water=1-smooth(1.15,3.0,bank);
 let h=.14+.10*Math.sin(x*.31+z*.23)+.07*Math.cos(z*.42-x*.17);
 if(L.mobile){const edge=smooth(13,28,Math.abs(x));h+=edge*(2.5+1.1*Math.sin(z*.14+x*.3));}
 h=h*(1-water)-1.65*water;let baseHeight=h,occupiedBottom=Infinity;
 for(const form of plan.landforms){const d=polygonDistance(x,z,form.contour);if(d<0){h=Math.max(h,landformHeight(form,x,z));occupiedBottom=Math.min(occupiedBottom,form.bottom+.08);}else if(d<3.2){const foot=.15+(1-smooth(0,3.2,d))*.70;h=Math.max(h,foot);baseHeight=Math.max(baseHeight,foot);}}
 baseHeight=Math.min(baseHeight,occupiedBottom);
 if(!L.mobile){const cut=1-smooth(1.55,2.10,routeDistance(plan.routes.lowerPath,x,z));h=h*(1-cut)+.10*cut;baseHeight=baseHeight*(1-cut)+.10*cut;}
 const q=courtCoordinates(x,z,plan),cd=polygonDistance(q.x,q.z,plan.landContour),court=1-smooth(-.06,.80,cd);h=h*(1-court)+plan.court.y*court;if(court>0)baseHeight=Math.min(baseHeight,.20);
 let flat=0;if(!L.mobile){const rd=polygonDistance(x,z,plan.readingContour);flat=1-smooth(-.04,.65,rd);h=h*(1-flat)+.1*flat;if(flat>0)baseHeight=Math.min(baseHeight,-.7);}
 return{height:h,baseHeight,river:bank,court,white:flat};
}
export function landformHeight(form,x,z){
 if(form.relief<.2)return form.top;
 const inside=-polygonDistance(x,z,form.contour),crest=smooth(0,2.3,inside);
 return form.top+form.relief*(crest*(.55+.30*Math.sin(x*.72+z*.51)+.25*Math.cos(x*.38-z*.94))+.20*Math.sin(x*1.53+z*.82));
}
export function tennisHeight(u,v,L){const plan=tennisLayout(L),p=groundPoint(u,v,L),s=tennisWorldHeight(p.x,p.z,plan),white=whiteMask(u,v,L);return {...s,height:.1+(s.height-.1)*(1-white)**2,baseHeight:Math.min(s.baseHeight,.1+(s.height-.1)*(1-white)**2),white:Math.max(s.white,white)};}
export function tennisTerrainColor(u,v,height,L){const p=groundPoint(u,v,L),plan=tennisLayout(L),s=tennisWorldHeight(p.x,p.z,plan);if(s.river<1.2)return '#829b9b';return height<-.25?'#c2c7bc':plan.palette.chalk;}

