import * as THREE from '../vendor/three.module.js';
import {GOLD_COLORS as C} from './plan.mjs?v=03bcba9148dc';

export function goldfishModel(f,parent,position,scale=1,color='#eb7627'){
 const root=f.group('Goldfish · body, tail, fins and eyes',parent);root.position.set(...position);root.scale.setScalar(scale);
 f.ball('Fish faceted body',[.36,.15,.15],[0,0,0],color,root);
 f.ball('Fish head',[.15,.14,.13],[.27,.013,0],color,root);
 const shape=new THREE.Shape();shape.moveTo(-.24,-.018);shape.lineTo(-.62,.21);shape.quadraticCurveTo(-.72,.03,-.54,-.055);shape.quadraticCurveTo(-.76,-.15,-.68,-.28);shape.lineTo(-.23,-.07);const geo=new THREE.ExtrudeGeometry(shape,{depth:.024,bevelEnabled:false});
 const tail=f.mesh(geo,color,root,{side:THREE.DoubleSide});tail.name='Fan-shaped tail';tail.position.z=-.012;
 f.ball('Back dorsal fin',[.18,.045,.055],[-.03,.15,0],'#e9a441',root);
 for(const side of [-1,1]){f.ball('Fish eye',[.036,.04,.009],[.32,.035,side*.12],'#282927',root);f.ball('Fish fin',[.115,.035,.072],[-.07,-.06,side*.11],'#f2b457',root);}
 return root;
}
function leaf(f,parent,name,position,width,height,angle,roll=0,color='#477d44'){
 const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-width*.58,height*.15,-width*.55,height*.60,0,height);shape.bezierCurveTo(width*.55,height*.60,width*.58,height*.15,0,0);
 const geo=new THREE.ShapeGeometry(shape,3),g=f.group(name,parent);g.position.set(...position);g.rotation.y=angle;g.rotation.z=roll;g.rotation.x=-.42;const m=f.mesh(geo,color,g,{side:THREE.DoubleSide});m.name='Paper leaf lamina';f.beam('Leaf vein',[0,0,.009],[0,height*.89,.009],.009,'#799551',g);return g;
}
export function buildGoldfishAquarium(f,p){
 const root=f.group('03 · Aquarium and room plants'),g=f.group('Aquarium cabinet',root);g.position.set(p.aquarium.x,p.aquarium.y,p.aquarium.z);
 f.box('Aquarium cabinet top',[2.16,.10,1.35],[0,.91,0],'#af8045',g);
 f.box('Cabinet body',[1.94,.77,1.20],[0,.47,0],'#b28755',g);
 for(const x of [-.94,.94])for(const z of [-.55,.55])f.box('Cabinet foot',[.08,.28,.08],[x,.13,z],'#916b3b',g);
 for(const x of [-.48,.48]){f.box('Cabinet door',[.87,.59,.04],[x,.51,.626],'#bd965f',g);f.box('Cabinet handle',[.04,.20,.035],[x+(x<0?.23:-.23),.51,.662],'#765839',g);}
 const tank=f.group('Clear glass aquarium with physical contents',g);tank.position.y=1.01;
 f.box('Tank base',[2.08,.065,1.23],[0,.026,0],'#acc1bc',tank);
 f.box('Tank sand',[1.98,.07,1.12],[0,.082,0],'#cfbc81',tank);
 const glassOptions={transparent:true,opacity:.15,roughness:.12,metalness:0,depthWrite:false};
 for(const side of [-1,1]){f.box('Side glass panel',[.027,1.17,1.20],[side*1.02,.63,0],'#b4e3e1',tank,glassOptions);f.box('Front/back glass panel',[2.04,1.17,.025],[0,.63,side*.59],'#c1e5df',tank,glassOptions);}
 f.box('Contained water volume',[1.97,.88,1.12],[0,.565,0],'#42a5bd',tank,{transparent:true,opacity:.13,depthWrite:false,roughness:.20});
 for(const z of [-.61,.61])f.beam('Top tank rim',[-1.06,1.235,z],[1.06,1.235,z],.013,'#d4eee7',tank,{roughness:.12});
 for(const x of [-1.055,1.055])f.beam('Top tank cross rim',[x,1.235,-.61],[x,1.235,.61],.013,'#d4eee7',tank,{roughness:.12});
 f.box('Calm aquarium water surface',[1.98,.008,1.15],[0,1.005,0],'#85cada',tank,{transparent:true,opacity:.35,roughness:.18,depthWrite:false});
 goldfishModel(f,tank,[.36,.64,.15],.87);
 for(let i=0;i<8;i++){const x=-.81+(i%4)*.21,z=-.32+Math.floor(i/4)*.20,height=.47+(i%3)*.18;f.beam('Water plant stem',[x,.10,z],[x+.08,height,z],.011,'#416e3c',tank);leaf(f,tank,'Aquatic leaf',[x,.20,z],.15,height*.78,i*.73,((i%3)-1)*.26,'#72a047');}
 for(const [x,z] of [[-.35,.25],[.75,-.19],[-.77,.35]])f.ball('Aquarium pebble',[.14,.045,.10],[x,.15,z],'#dfd2a6',tank);
 const plant=f.group('Tall studio plant / pot and individual leaves',root);plant.position.set(p.room.x+4.13,p.room.y+.13,p.room.z-2.55);
 const pot=f.mesh(new THREE.CylinderGeometry(.41,.31,.53,10),'#d8c59d',plant);pot.name='Tapered ceramic pot';pot.position.y=.265;
 const soil=f.mesh(new THREE.CylinderGeometry(.38,.38,.045,10),'#6d6043',plant);soil.name='Pot soil';soil.position.y=.53;
 for(let i=0;i<9;i++){const a=i*2.399,height=1.15+(i%4)*.32,r=.20+(i%3)*.12,x=Math.cos(a)*r,z=Math.sin(a)*r;f.beam('Plant stem '+i,[0,.52,0],[x,height,z],.015,'#627948',plant);leaf(f,plant,'Broad leaf '+i,[x,height-.12,z],.70,.80,a,Math.sin(i)*.6,i%2?'#477547':'#6b904d');}
 root.userData.moduleId='aquarium';return root;
}
