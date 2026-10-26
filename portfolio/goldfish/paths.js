import {goldfishHeight,GOLD_COLORS as C} from './plan.mjs';

function bridge(f,p,parent,b,index){
 const g=f.group('Footbridge '+index+' / deck, joists, posts, rope rails',parent);g.position.set(b.x,b.y,b.z);g.rotation.y=b.angle;
 const count=Math.ceil(b.length/.28);
 for(let i=0;i<count;i++){const x=-b.length/2+(i+.5)*b.length/count;f.box('Individual bridge plank '+i,[b.length/count-.019,.10,b.width],[x,.07+(i%3)*.007,0],i%3===0?'#bd9a69':'#c7a571',g);}
 for(const side of [-1,1])f.box('Bridge longitudinal beam',[b.length,.15,.10],[0,-.02,side*b.width*.34],'#997b4f',g);
 const xs=[-b.length*.47,-b.length*.23,0,b.length*.23,b.length*.47];
 for(const side of [-1,1]){
  for(let i=0;i<xs.length;i++)f.beam('Bridge railing post '+side+'-'+i,[xs[i],.08,side*b.width*.51],[xs[i],.82,side*b.width*.51],.034,C.wood,g,{},.030);
  for(const h of [.48,.77])f.ribbon('Sagging rope handrail',xs.map((x,i)=>[x,h-(i%2?.04:0),side*b.width*.51]),'#ad976c',.019,g);
 }
 for(const side of [-1,1]){const localX=side*b.length*.40,wx=b.x+Math.cos(b.angle)*localX,wz=b.z-Math.sin(b.angle)*localX,base=goldfishHeight(wx,wz,p)-b.y;for(const edge of [-1,1])f.beam('Bridge grounded support pier',[localX,base,edge*b.width*.33],[localX,-.025,edge*b.width*.33],.060,'#8e724c',g);}
}
function fence(f,parent,name,points){
 const g=f.group(name,parent);
 for(let i=0;i<points.length;i++){const [x,y,z]=points[i];f.beam('Wood fence post '+i,[x,y,z],[x,y+.70,z],.032,'#aa8455',g,{},.028);}
 for(let i=0;i<points.length-1;i++)for(const h of [.39,.65]){const a=points[i],b=points[i+1];f.ribbon('Rope rail '+i+'-'+h,[[a[0],a[1]+h,a[2]],[(a[0]+b[0])/2,(a[1]+b[1])/2+h-.04,(a[2]+b[2])/2],[b[0],b[1]+h,b[2]]],'#bc9e75',.016,g);}
}
export function buildGoldfishPaths(f,p){
 const root=f.group('05 · Stair flights, grounded footbridges and connecting paths');
 for(let i=0;i<p.paths.length;i++){const q=p.paths[i];f.stairs('Stair flight '+(i+1),q.a,q.b,q.width,q.steps,root);}
 p.bridges.forEach((b,i)=>bridge(f,p,root,b,i+1));
 const trail=[[-6.0,8.9],[-3.7,9.5],[-1.3,9.8],[1.2,9.8],[3.9,9.5],[6.4,9.0],[8.6,8.4],[10.1,7.8]];
 for(let i=0;i<trail.length-1;i++){const a=trail[i],b=trail[i+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),g=f.group('Contoured paper footpath '+i,root);g.position.set((a[0]+b[0])/2,goldfishHeight((a[0]+b[0])/2,(a[1]+b[1])/2,p)+.028,(a[1]+b[1])/2);g.rotation.y=Math.atan2(dx,dz);f.box('Path deck',[.73,.045,len+.20],[0,0,0],'#e8dcc4',g);}
 fence(f,root,'Platform-front continuous rope fence',trail.map(([x,z])=>[x,goldfishHeight(x,z,p)+.05,z+.4]));
 fence(f,root,'Left riverbank fence',[[-15.3,.45,3.1],[-15.6,.6,4.6],[-14.7,.72,6.4],[-13.2,1.05,7.7]]);
 root.userData.moduleId='paths';return root;
}
