import * as THREE from '../vendor/three.module.js';
import {GAME_PAPERS} from './assets.js?v=eed7fff475f6';
import {collageMaterial,PALETTE_CHANNELS} from './palette.js?v=eed7fff475f6';
import {goldfishHeight,coastX} from './plan.mjs?v=eed7fff475f6';
function paper(f,parent,kind,textures,width,swapped){
 const q=GAME_PAPERS[kind],height=width*(q.crop[3]-q.crop[1])/(q.crop[2]-q.crop[0]);
 const m=f.printed('Original game paper / '+kind+' / '+(swapped?'replaced':'normal'),textures.collage?.[kind]||null,width,height,parent,{color:'#ffffff',transparent:false,alphaTest:.12,emissiveIntensity:0});
 const uv=m.geometry.attributes.uv,[x0,y0,x1,y1]=q.crop,[w,h]=q.size;
 for(let i=0;i<uv.count;i++)uv.setXY(i,(x0+uv.getX(i)*(x1-x0))/w,1-(y1-uv.getY(i)*(y1-y0))/h);
 collageMaterial(m.material,{channels:PALETTE_CHANNELS[q.channel],swapped,sky:kind==='window'});
 m.userData.dynamic=true;m.userData.gamePaper={kind,swapped,source:q.source};return{m,height};
}
export function buildGoldfishCollage(f,p,textures,parent){
 const root=f.group('Original game collage / paired characteristic colours',parent),pairs=[];
 // These lie around the white reading plateau, clear of type and seated figures.
 const placements=[
  ['fish',[[-12.3,1.0],[21.0,3.3]],3.1,1.39],
  ['flower',[[-18.3,3.6],[13.7,-.9]],2.75,1.10],
  ['window',[[-4.5,-5.4],[9.0,-5.2]],4.65,1.43],
  ['painting',[[-19.0,8.0],[9.8,10.2]],3.65,1.45]
 ];
 for(const [kind,anchors,width,lean] of placements){
  const objects=[];
  for(const [i,[x,z]] of anchors.entries()){
   const g=f.group('Paired '+kind+' '+(i?'replaced':'normal'),root),{m,height}=paper(f,g,kind,textures,width,!!i);
   let y=x>coastX(z)?p.seaY+.17:goldfishHeight(x,z,p)+.12;
   // Sample each paper's footprint so printed imagery cannot sink into ridges.
   for(const dx of [-width*.45,0,width*.45])for(const dz of [0,-height*.45*Math.sin(lean),-height*.85*Math.sin(lean)])y=Math.max(y,goldfishHeight(x+dx,z+dz,p)+.14);
   g.position.set(x,y,z);g.rotation.y=i?-.15:.13;m.rotation.x=-lean;m.rotation.z=kind==='fish'?(i?-.24:.20):kind==='painting'?(i?-.18:.12):0;m.position.set(0,height*.5*Math.cos(lean)+.10,-height*.5*Math.sin(lean));objects.push({x,z,swapped:!!i});
  }pairs.push({kind,objects});
 }
 for(const [i,[x,z]] of [[-18.1,-1.4],[4.7,-8.9]].entries()){
  const g=f.group('Game sunflower / '+(i?'purple':'yellow'),root);let y=goldfishHeight(x,z,p)+.20;for(const dx of [-1.5,0,1.5])for(const dz of [-1.5,0,1.5])y=Math.max(y,goldfishHeight(x+dx,z+dz,p)+.15);g.position.set(x,y,z);g.rotation.set(-1.38,0,i?-.28:.21);
  for(let j=0;j<8;j++){const a=j*Math.PI/4,{m}=paper(f,g,'sunPetal',textures,1.10,!!i);m.position.set(Math.cos(a)*1.02,Math.sin(a)*1.02,0);m.rotation.z=a;}
  const {m}=paper(f,g,'sunCenter',textures,1.55,!!i);m.position.z=.04;
 }pairs.push({kind:'sunflower',objects:[{x:-18.1,z:-1.4,swapped:false},{x:4.7,z:-8.9,swapped:true}]});
 root.userData.colourPairs=pairs;return root;
}
