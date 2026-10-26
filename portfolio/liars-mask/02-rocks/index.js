import {stoneGeometry,seeded,mergeMeshes} from '../geometry.js';
import {floorHeightAt,surfaceHeightAt} from '../01-foundation/index.js';

// Authored silhouettes: the master image has tall fractured slabs behind the
// table and low cropped front outcrops, not a ring of uniform pebble spheres.
export const ROCK_LAYOUT=[
 ['slab',-19,-10,4.8,5.3,3.8,.2],['boulder',-16.6,-12.9,5.1,4.8,4.3,-.35],['slab',-12.4,-12.2,4.3,6.2,3.7,.42],
 ['wedge',-8.0,-13.3,4.9,5.4,3.3,-.15],['slab',-3.2,-12.9,4.7,5.7,3.1,.18],['boulder',1.6,-13,4.3,4.4,3.5,.22],
 ['slab',-16,-6.8,3.0,4.1,3.7,-.18],['boulder',-18.8,-4.0,3.8,3.4,4.0,.45],['wedge',-15.5,-1.5,3.0,2.9,2.8,.2],
 ['cube',-12.5,-4.8,1.5,1.5,1.8,.33],['boulder',-12.6,-8.3,2.1,2.3,2.7,-.18],
 ['wedge',4.3,-11.9,3.2,3.7,3.2,-.3],['boulder',8.2,-13.2,4.1,4.9,4.2,.19],['slab',13.4,-13.7,3.8,5.1,3.6,.6],
 ['slab',19.0,-9.8,4.3,5.4,3.8,-.6],['boulder',20.2,-4.1,3.8,3.5,4.0,-.1],['wedge',18.9,1.0,3.3,2.5,2.9,.32],
 ['outcrop',-19,8.9,7.0,4.0,5.7,-.35],['slab',-15.4,8.8,2.6,3.1,2.5,-.6],['wedge',-18.1,13,3.6,3.5,3.5,.2],
 ['boulder',-11.5,13.9,3.7,2.3,3.8,-.32],['outcrop',-6.3,15.9,4.9,2.5,3.4,.5],
 ['outcrop',17.6,11.7,5.4,2.5,4.1,.35],['wedge',14.7,11.9,2.2,2.3,2.5,-.5],['slab',20.0,8.1,2.8,3.8,3.5,.2],
 ['boulder',19.5,15.7,4.1,3.4,4.7,-.3]
];
export function buildRocks(forms,{gallery=false}={}){
 const root=forms.group('02 · large faceted rocks');root.userData.moduleId='rocks';const random=seeded(781),geometries=[];
 const shapes=[['slab',2.4,3.6,1.9],['boulder',3.2,2.4,2.7],['wedge',2.5,3.1,2.2],['cube',2.4,2.4,2.4],['outcrop',3.8,1.6,2.3],['shard',1.8,2.7,1.7]];
 const items=gallery?shapes.map(([k,w,h,d],i)=>[k,(i%3-1)*5,Math.floor(i/3)*5,w,h,d,-.16]):ROCK_LAYOUT;
 for(let i=0;i<items.length;i++){
  const[k,x,z,w,h,d,yaw]=items[i],g=stoneGeometry(k,901+i*43);geometries.push(g);
  const m=forms.mesh(root,g,['#d5cebe','#e0d9ca','#c9c3b4','#e4ddce'][i%4],[x,gallery?0:floorHeightAt(x,z)-.08,z],[w,h,d],k+'-'+i);m.rotation.y=yaw;
 }
 if(!gallery){
  for(let i=0;i<100;i++){
   const x=-22+random()*44,z=-15+random()*31;
   const nearRear=z<-9||x<-13||x>17||(z>11&&Math.abs(x)>10);
   if(!nearRear||(x>-11.5&&x<13.5&&z>1&&z<12))continue;
   const size=.26+random()*.6,g=stoneGeometry(i%3?'cube':'shard',197+i);
   const m=forms.mesh(root,g,'#dad3c2',[x,surfaceHeightAt(x,z)-.04,z],[size,size*(.6+random()),size*.9],'rubble-'+i);m.rotation.y=random()*Math.PI;geometries.push(g);
  }
  mergeMeshes(root,'authored rock masses');geometries.forEach(g=>g.dispose());
 }
 root.userData.authoredRocks=items.length;root.userData.forms=['slab','boulder','wedge','cube','outcrop','shard'];return root;
}
