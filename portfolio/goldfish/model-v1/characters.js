import * as THREE from '../../vendor/three.module.js';
import {C} from './plan.mjs?v=03bcba9148dc';
import {PAPER_SILHOUETTES} from './paper-silhouettes.mjs?v=03bcba9148dc';
export function buildCouple(f,p,textures={}){
 const g=f.group('09 · Two paper protagonists on one common stone seat'),q=p.seat;
 for(let i=0;i<3;i++)f.box('Common seat base stone',[q.w/3-.025,q.h-.10,q.d],[q.x-q.w/2+(i+.5)*q.w/3,q.y+(q.h-.10)/2,q.z],i%2?'#d2c4ab':'#dcd0b9',g);
 f.box('One continuous stone seat cap',[q.w+.08,.10,q.d+.07],[q.x,q.y+q.h-.05,q.z],'#e7dbc5',g);if(!textures.couple)return g;
 const tilt=-(90-q.pitch)*Math.PI/180,height=2.8,width=2.67;
 for(const [index,[name,x,u0,u1]] of [['Male paper / artist',-1.30,.045,.515],['Female paper / partner',1.30,.515,.970]].entries()){
  const piece=f.group(name,g);piece.position.set(x,q.y+q.h,q.z+.18);piece.rotation.x=tilt;
  const loops=PAPER_SILHOUETTES[index].map(loop=>loop.map(([u,v])=>new THREE.Vector2((u-.5)*width,v*height))),shape=new THREE.Shape(loops[0]);for(const hole of loops.slice(1))shape.holes.push(new THREE.Path(hole));const geo=new THREE.ExtrudeGeometry(shape,{depth:q.thickness,bevelEnabled:false,curveSegments:1});const backing=f.mesh(geo,C.paper,piece);backing.name='Alpha-traced thin paper silhouette';backing.position.z=-q.thickness;
  const m=f.printed(name+' · original line art',textures.couple,width,height,piece,{alphaTest:.25,emissiveIntensity:.1});m.position.set(0,height/2,.003);const uv=m.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,u0+uv.getX(i)*(u1-u0),.055+uv.getY(i)*.875);uv.needsUpdate=true;m.userData.paper={pitchAboveGround:q.pitch,thickness:q.thickness,source:'seated-couple.png'};
  f.beam('Folded paper support behind upright silhouette',[x,q.y+q.h,q.z-.34],[x,q.y+q.h+.80,q.z+.15],.022,C.paper,g);
  f.box('Paper support foot',[.46,.018,.48],[x,q.y+q.h+.009,q.z-.1],C.paper,g,{bevel:false});
 }return g;
}
