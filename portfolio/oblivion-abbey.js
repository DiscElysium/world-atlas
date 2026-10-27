import * as THREE from './vendor/three.module.js';
import {PITCH} from './map-model.mjs?v=03bcba9148dc';

export function buildAbbey(f,c,viaduct){
 const p=c.ground(.80,c.L.mobile?.18:.30),abbey=f.group('OBLIVION · Ruined abbey');abbey.position.set(p.x,p.y,p.z);abbey.rotation.y=-.2;abbey.scale.setScalar(c.L.mobile?.60:.68);
 f.box([4.8,.36,6.5],[0,.18,0],abbey,.6);f.box([4.35,.15,6.07],[0,.43,0],abbey,.67);
 const y=.5,nave=f.group('Abbey · nave with open windows and exposed roof ribs',abbey);nave.position.y=y;
 for(const side of [-1,1]){
  const shape=new THREE.Shape();shape.moveTo(-2.6,0);shape.lineTo(2.6,0);shape.lineTo(2.6,2.6);shape.lineTo(-2.6,2.6);shape.closePath();
  for(const x of [-1.7,0,1.7]){const hole=new THREE.Path(f.pointedShape(.81,1.77).getPoints(16).reverse().map(v=>new THREE.Vector2(v.x+x,v.y+.55)));shape.holes.push(hole)}
  const wall=f.extrude(shape,.2,nave,.72);wall.rotation.y=Math.PI/2;wall.position.set(side*1.72,0,0);
  for(const z of [-2.48,-.85,.85,2.48]){
   const buttress=new THREE.Shape();buttress.moveTo(0,0);buttress.lineTo(.68,0);buttress.lineTo(.45,1.43);buttress.lineTo(.19,2.63);buttress.lineTo(0,2.63);buttress.closePath();
   const b=f.extrude(buttress,.34,nave,.63);b.position.set(side*1.74,0,z-.17);if(side<0)b.rotation.y=Math.PI;
   f.box([.32,.12,.47],[side*1.82,2.65,z],nave,.6);
  }
  for(const h of [.55,1.15,1.95,2.55])f.segment([side*1.955,h,-2.5],[side*1.955,h,2.5],nave,.21);
 }
 // The rear roof survives. The front half exposes the building's structural frame.
 const roof=f.gable(3.87,1.57,2.16,nave,.63);roof.position.y=2.6;roof.position.z=-2.5;
 for(const z of [-.3,.62,1.56,2.5]){
  f.beam([-1.87,2.6,z],[0,4.17,z],.085,.085,nave,.79);f.beam([0,4.17,z],[1.87,2.6,z],.085,.085,nave,.79);
  f.beam([-1.5,2.75,z],[0,3.9,z],.045,.045,nave,.48);f.beam([0,3.9,z],[1.5,2.75,z],.045,.045,nave,.48);
 }
 f.beam([0,4.17,-2.5],[0,4.17,2.5],.065,.08,nave,.65);
 const front=f.pointed(2.95,3.45,.25,.18,nave,.81);front.position.set(0,0,2.38);
 for(const x of [-1.56,1.56]){f.box([.34,3.18,.33],[x,1.59,2.48],nave,.77);f.box([.46,.14,.45],[x,3.21,2.48],nave,.6);const cap=f.gable(.39,.6,.37,nave,.7);cap.position.set(x,3.25,2.3)}
 const tower=f.group('Abbey · bell tower and broken spire',abbey);tower.position.set(-1.05,y,2.45);
 f.box([1.37,3.52,1.49],[0,1.76,0],tower,.74);
 f.box([1.26,1.6,1.39],[0,4.33,0],tower,.72);
 for(const h of [.18,2.1,3.55,5.16])f.box([1.56,.15,1.67],[0,h,0],tower,.86);
 for(const face of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  const facade=f.group('Bell tower · Gothic openings',tower);facade.rotation.y=face;
  for(const h of [.57,2.25,3.85]){const opening=f.pointed(.79,h===3.85?1.06:1.16,.09,.055,facade,.77);opening.position.set(0,h,.76);f.segment([0,h+.06,.866],[0,h+.81,.866],facade,.55)}
  for(const x of [-.61,.61])f.box([.1,4.97,.14],[x,2.51,.78],facade,.48);
 }
 const spire=f.mesh(new THREE.ConeGeometry(.82,1.72,4,1,true),tower,.65);spire.position.y=6.13;spire.rotation.y=Math.PI/4;
 for(const x of [-.56,.56])f.beam([x,5.24,.52],[x*.23,6.83,.15],.055,.06,tower,.7);
 f.beam([0,6.5,0],[.16,7.07,.03],.05,.05,tower,.7);
 const terrace=f.group('OBLIVION · Abbey retaining terrace');
 // Broad polygonal walls anchor the abbey into its shelf.
 f.box([3.96,1.15,5.8],[p.x,p.y-.44,p.z],terrace,.35);
 const approach=c.ground(.82,c.L.mobile?.22:.385);
 f.stairs([viaduct.B.x,2.55,viaduct.B.z],[approach.x,p.y+.08,approach.z],1.28,terrace,9);
 f.stairs([approach.x,p.y+.08,approach.z],[p.x,p.y+.5,p.z+2.3],1.55,terrace,6);
 const ascent=f.group('OBLIVION · Mountain ascent');
 const path=[[.81,.22],[.84,.14],[.81,.085],[.84,.02],[.78,-.035]].map(([u,v])=>c.ground(u,v));
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1];f.stairs([a.x,a.y+.13,a.z],[b.x,b.y+.13,b.z],.64,ascent,9);
  for(const point of [a,b])f.box([.15,.47,.16],[point.x,point.y+.25,point.z],ascent,.53);
 }
 const eclipse=f.group('OBLIVION · Eclipse rim');const e=c.ground(.705,.16);eclipse.position.set(e.x,e.y+1.4,e.z);eclipse.rotation.x=-PITCH;
 const disk=new THREE.Mesh(new THREE.CircleGeometry(1.3,72),f.stone);eclipse.add(disk);
 f.polyline(Array.from({length:96},(_,i)=>{const a=i/96*Math.PI*2;return[Math.cos(a)*1.3,Math.sin(a)*1.3,.008]}),eclipse,.85,true);
 // An incomplete inner rim makes the eclipse a restrained spatial accent.
 f.polyline(Array.from({length:28},(_,i)=>{const a=-.52+i/27*1.25;return[Math.cos(a)*1.25,Math.sin(a)*1.25,.012]}),eclipse,.42);
 return abbey;
}
