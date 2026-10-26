import * as THREE from '../vendor/three.module.js';
import {goldfishHeight,perceptionSide,polygonDistance,pathSample,coastX,hash,GOLD_COLORS as C} from './plan.mjs';
import {buildGoldfishCollage} from './collage.js';

function cypress(f,parent,x,y,z,height,swapped,index){
 const g=f.group('Paper cypress '+index,parent);g.position.set(x,y,z);
 f.beam('Cypress trunk',[0,0,0],[0,height*.70,0],.037,'#7d6949',g);
 const positions=[],colours=[],layers=7,sides=7,color=new THREE.Color('#355a3e');
 const ring=(layer,i)=>{const t=layer/layers,a=i/sides*Math.PI*2+.23*Math.sin(layer),r=height*.19*Math.sin(Math.PI*t)**.62*(.91+.12*hash(i,layer,index));return[Math.cos(a)*r,height*(.13+.85*t),Math.sin(a)*r];};
 for(let j=0;j<layers;j++)for(let i=0;i<sides;i++){const a=ring(j,i),b=ring(j,(i+1)%sides),c=ring(j+1,i),d=ring(j+1,(i+1)%sides),col=color.clone().multiplyScalar(.86+.24*hash(i,j,index));for(const v of [a,c,b,b,c,d]){positions.push(...v);colours.push(col.r,col.g,col.b);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geo.computeVertexNormals();const m=f.mesh(geo,'#ffffff',g,{vertexColors:true});m.name='Irregular tapered seven-ring canopy';return g;
}
function shrub(f,parent,x,y,z,size,color,index){const g=f.group('Faceted shrub '+index,parent);g.position.set(x,y,z);for(let i=0;i<7;i++){const a=i*2.399,r=size*.36;f.ball('Leaf cluster '+i,[size*.29,size*.30,size*.29],[Math.cos(a)*r,size*(.18+(i%3)*.12),Math.sin(a)*r],color,g);}return g;}
export function buildGoldfishEcology(f,p,textures={}){
 const root=f.group('06 · Individually placed paper vegetation and coastal rocks');
 p.trees.forEach(([x,z,h],i)=>cypress(f,root,x,goldfishHeight(x,z,p),z,h,perceptionSide(x,z),i));
 const shrubs=[[-22,-8,1.1],[-19,-5,.8],[-17,-4,.7],[-11,-12,.75],[-9,-13,.8],[-6,-9,.7],[-1,-10,.8],[3,-10,.75],[5.5,-7.7,.6],[9,-5.7,.7],[12,-3.8,.5],[14,.1,.5],[14,4.9,.7],[11,8.8,.9],[7,10.1,.8],[3,11,.9],[-3,10.8,.7],[-19,10,.8],[-19,3,.9],[-16,5,.75]];
 shrubs.forEach(([x,z,s],i)=>shrub(f,root,x,goldfishHeight(x,z,p),z,s,i%2?'#799254':'#627b46',i));
 // Small flower patches follow real banks and avoid the reading area and room.
 let n=0;for(let i=0;i<48;i++){
  const x=-25+hash(i,8,43)*41,z=-17+hash(i,19,98)*33;
  if(polygonDistance(x,z,p.reading)<.5||polygonDistance(x,z,p.roomTerrace)<-.2||x>coastX(z)-1.4)continue;
  const stream=Math.min(pathSample(x,z,p.westRiver).distance,pathSample(x,z,p.northRiver).distance);if(stream<1.2)continue;
  const y=goldfishHeight(x,z,p),swapped=perceptionSide(x,z),g=f.group('Grounded flower patch '+n++,root);g.position.set(x,y,z);
  for(let j=0;j<3;j++){const a=j*2.399,r=.14+.07*hash(i,j),h=.11+.09*hash(j,i);f.beam('Fine flower stem',[Math.cos(a)*r,0,Math.sin(a)*r],[Math.cos(a)*r,h,Math.sin(a)*r],.006,'#799159',g);f.ball('Paper flower head',[.066,.037,.066],[Math.cos(a)*r,h,Math.sin(a)*r],'#eee9dc',g);}
 }
 const rocks=[[-10.6,-5.3,.5],[-13.4,-2.4,.8],[-11.2,1.1,.62],[-14.0,3.7,.5],[-11.8,6.5,.6],[-7.7,12.4,.9],[-22.5,12,.8],[-23.3,-8,1.0],[1,-11,.8],[5.1,-10,.7],[8.8,-7.2,.8],[12.6,-4.0,.55],[16.2,-3.0,.8],[18,.8,.7],[18.1,5.4,.7],[17.2,9.1,.8],[9,12,1.1],[1,13.1,.9]];
 rocks.forEach(([x,z,r],i)=>{const y=x>coastX(z)?p.seaY-.08:goldfishHeight(x,z,p);const m=f.mesh(new THREE.IcosahedronGeometry(1,0),i%3?'#e0d4bc':'#cfbea2',root);m.name='Grounded angular rock '+i;m.position.set(x,y+r*.30,z);m.scale.set(r*.85,r*.65,r);m.rotation.y=i*.83;});
 buildGoldfishCollage(f,p,textures,root);
 root.userData.moduleId='ecology';return root;
}
export function buildGoldfishVillage(f,p){
 const root=f.group('07 · Two small hillside houses');
 for(const [i,h] of p.houses.entries()){
  const g=f.group('Hillside cottage '+(i+1),root);g.position.set(h.x,goldfishHeight(h.x,h.z,p),h.z);g.rotation.y=h.angle;g.scale.setScalar(h.scale);
  f.box('Plaster house body',[1.47,1.4,1.73],[0,.72,0],'#f0e7d2',g);
  const roof=new THREE.BufferGeometry();const pos=[-.86,1.42,-1,-.86,1.42,1,0,2.13,1,-.86,1.42,-1,0,2.13,1,0,2.13,-1,0,2.13,-1,0,2.13,1,.86,1.42,1,0,2.13,-1,.86,1.42,1,.86,1.42,-1];roof.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));roof.computeVertexNormals();f.mesh(roof,'#bd7049',g,{side:THREE.DoubleSide}).name='Two-sloped terracotta roof';
  for(let j=0;j<8;j++)f.beam('Roof tile course',[-.88,1.43,-.95+j*.27],[0,2.135,-.95+j*.27],.012,'#d1935e',g);
  f.box('Cottage chimney',[.25,.53,.28],[.42,1.90,-.48],'#ded3b9',g);
  f.box('Door',[.37,.75,.035],[-.30,.45,.885],'#916f4f',g);
  for(const x of [.29,-.45]){f.box('Window frame',[.36,.42,.038],[x,1.10,.89],'#d0ba94',g);f.box('Window glass',[.26,.31,.042],[x,1.10,.915],'#708a8a',g);f.box('Window mullion',[.024,.31,.014],[x,1.10,.942],'#e8d8b8',g);}
 }
 root.userData.moduleId='village';return root;
}
