import * as THREE from '../../vendor/three.module.js';
import {mergeMeshes} from '../geometry.js?v=03bcba9148dc';
import {TABLE,SEATS} from '../layout.mjs?v=03bcba9148dc';

const LIGHT='#e6dfd0',DARK='#b3a58d';
export function buildChair(forms,parent,{position=[0,0,0],yaw=0,name='chair'}={}){
 const root=forms.group(name,parent,position);root.rotation.y=yaw;
 forms.box(root,DARK,[1.48,.20,1.52],[0,1.17,0],.05,'seat');
 for(const x of [-.53,.53])for(const z of [-.52,.52])forms.box(root,DARK,[.19,1.10,.19],[x,.55,z],.02,'leg');
 forms.box(root,'#c6b9a2',[1.50,1.9,.22],[0,1.70,.7],.05,'chair back');forms.box(root,'#d1c4ab',[1.17,1.3,.055],[0,1.83,.565],.035,'back panel');
 for(const x of [-.71,.71]){forms.box(root,DARK,[.17,.87,1.25],[x,1.40,-.02],.04,'arm');forms.box(root,'#c7baa2',[.20,.13,1.40],[x,1.85,-.03],.04,'arm rest');}
 root.userData.seatY=1.27;return root;
}
function lathe(points,segments=16){return new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),segments);}
export function buildCup(forms,parent,position=[0,0,0],{lid=false}={}){
 const root=forms.group('footed shallow dice bowl',parent,position);
 forms.mesh(root,lathe([[0,0],[.43,0],[.47,.055],[.35,.11],[.16,.18],[.10,.35],[.15,.51],[.44,.67],[.61,.78],[.63,.84],[.57,.85],[.51,.72],[.33,.62],[0,.60]]),LIGHT);
 if(lid)buildLid(forms,root,[0,.85,0]);root.userData.component='dice-cup';return root;
}
export function buildLid(forms,parent,position=[0,0,0]){
 const root=forms.group('separate domed lid',parent,position);forms.mesh(root,lathe([[0,.03],[.54,.03],[.57,.08],[.46,.16],[.31,.32],[.13,.40],[.08,.42],[.07,.50],[0,.53]],16),'#e2d9c7');root.userData.component='lid';return root;
}
const PIPS={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[-1,1],[1,-1],[1,1]],5:[[-1,-1],[-1,1],[0,0],[1,-1],[1,1]],6:[[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1]]};
export function buildDie(forms,parent,{position=[0,0,0],edge=.32,special=false,face=5,yaw=0}={}){
 const root=forms.group(special?'special die':'normal die',parent,position);root.rotation.y=yaw;
 forms.box(root,special?'#c4b193':LIGHT,[edge,edge,edge],[0,edge/2,0],.06);
 const dot=new THREE.CircleGeometry(edge*.066,8),topFace=face;
 for(const side of ['top','front','right'])for(const[x,y]of PIPS[side==='top'?topFace:side==='front'?Math.max(1,7-topFace):3]){
  const m=forms.mesh(root,dot,'#3b2e1f');m.castShadow=false;
  if(side==='top'){m.rotation.x=-Math.PI/2;m.position.set(x*edge*.24,edge+.002,y*edge*.24);}
  else if(side==='front')m.position.set(x*edge*.24,edge/2+y*edge*.24,edge/2+.002);
  else{m.rotation.y=Math.PI/2;m.position.set(edge/2+.002,edge/2+y*edge*.24,x*edge*.24);}
 }
 if(special){const line=forms.mat('#56452e');for(const a of [-1,1]){forms.box(root,'#56452e',[edge*.025,.007,edge*.88],[a*edge*.42,edge+.003,0],0);forms.box(root,'#56452e',[edge*.88,.007,edge*.025],[0,edge+.003,a*edge*.42],0);}}
 root.userData.component='die';return root;
}
export function buildBell(forms,parent,position){const root=forms.group('table bell',parent,position);forms.mesh(root,lathe([[0,0],[.43,0],[.47,.07],[.42,.12],[.34,.14],[.27,.35],[.13,.46],[.07,.47],[.06,.58],[.11,.59],[.10,.65],[0,.65]],16),'#82735b');root.userData.component='bell';return root;}
export function buildTable(forms,{kitOnly=false}={}){
 const root=forms.group('04 · dice table and seats');root.userData.moduleId='table';const base=forms.group('four player table',root,TABLE.position);
 forms.box(base,'#c3b69e',[TABLE.width,.23,TABLE.depth],[0,1.56,0],.025,'beveled tabletop');
 for(const x of [-3.5,3.5])for(const z of [-1.35,1.35])forms.box(base,'#b8a98e',[.55,1.45,.55],[x,.72,z],.03,'table leg');
 forms.box(base,'#b5a58b',[7.6,.30,.22],[0,1.32,1.60],.02,'front apron');
 const stations=[[-2.9,-1.1],[2.9,-1.1],[-2.9,1.05],[2.9,1.05]];
 stations.forEach(([x,z],i)=>{buildCup(forms,base,[x,1.68,z],{lid:i===2}).scale.setScalar(.82);if(i!==2)buildLid(forms,base,[x+(i%2?-.78:.78),1.68,z+.18]).scale.setScalar(.82);if(i===0)for(let d=0;d<5;d++)buildDie(forms,base,{position:[x+(d%3-1)*.17,2.175,z+(Math.floor(d/3)-.4)*.20],edge:.14,special:d===4,face:d%6+1,yaw:d*.22});});
 buildBell(forms,base,[.3,1.68,.55]).scale.setScalar(.85);
 for(const[x,z,yaw]of [[-.4,-.4,.4],[.5,-.5,.2],[-.2,.1,-.5]])buildDie(forms,base,{position:[x,1.68,z],edge:.33,face:5,yaw});
 const seats=SEATS;
 seats.forEach(s=>{const chair=buildChair(forms,root,s);chair.scale.set(1.28,1,1.12);});root.userData.stations=stations;root.userData.seats=seats;root.userData.chairCount=4;root.userData.cupCount=4;root.userData.tabletopY=3.03;
 mergeMeshes(root,'table kit parts');return root;
}
