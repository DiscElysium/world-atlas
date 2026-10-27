import * as THREE from '../../vendor/three.module.js';
import {C,hash,coastZ,goldfishHeight,smooth} from './plan.mjs?v=03bcba9148dc';
export function waveHeight(x,depth,time=0){return .014+Math.sin(x*.48+depth*1.6-time*.24)*.028+Math.sin(x*1.3-depth*2.1+time*.18)*.012+Math.exp(-(((depth-1.3)/.42)**2))*.11+Math.exp(-(((depth-3.7)/.60)**2))*.085;}
export function buildCoast(f,p,animate=()=>{}){
 const g=f.group('02 · Continuous sea, breakers and ivory shore'),nx=p.mobile?76:128,nd=p.mobile?34:52,positions=[],colors=[],indices=[],shallow=new THREE.Color('#a4d5ca'),water=new THREE.Color(C.water),deep=new THREE.Color('#347e9c');
 // One shore-to-open-water gradient follows the entire curved bay.
 for(let j=0;j<=nd;j++)for(let i=0;i<=nx;i++){const x=-29+i/nx*58,d=j/nd*30,z=coastZ(x)-d;positions.push(x,waveHeight(x,d),z);const col=shallow.clone().lerp(water,smooth(0,5,d)).lerp(deep,smooth(4,18,d)).multiplyScalar(.985+.03*hash(i,j,7));colors.push(col.r,col.g,col.b);}
 for(let j=0;j<nd;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;indices.push(a,b,c,b,d,c);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();const sea=f.mesh(geo,f.material('#ffffff',{roughness:.57,metalness:.04,flatShading:false,vertexColors:true,bumpScale:.006}),g);sea.name='Continuous turquoise bay with shallow-water gradient';sea.castShadow=false;sea.userData.dynamic=true;sea.userData.sea=true;
 let last=-1;animate(t=>{if(t-last<.06)return;last=t;const a=geo.attributes.position;for(let j=0;j<=nd;j++)for(let i=0;i<=nx;i++){const n=j*(nx+1)+i;a.setY(n,waveHeight(a.getX(n),j/nd*30,t));}a.needsUpdate=true;geo.computeVertexNormals();});
 // Quiet, broken ivory breakers give the beach an identifiable surf line.
 const foamPositions=[];
 for(const depth of [.06,1.3,3.7]){
  const points=[],ix=[];for(let i=0;i<=240;i++){const x=-29+i/240*58,d=depth+Math.sin(x*.8+depth)*.18,width=(depth<.2?.12:.10)*(.7+.3*Math.sin(x*2.7)+.2*Math.sin(x*5.8));for(const side of [-1,1])points.push(x,waveHeight(x,d)+.034,coastZ(x)-d+side*width);if(i<240&&hash(Math.floor(i/3),depth,8)>(depth<.2?.06:.22)){const a=i*2;ix.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const strip=new THREE.BufferGeometry();strip.setAttribute('position',new THREE.Float32BufferAttribute(points,3));strip.setIndex(ix);strip.computeVertexNormals();const m=f.mesh(strip,C.foam,g,{side:THREE.DoubleSide});m.name='Continuous irregular surf crest';m.castShadow=false;
 }
 for(const d of (p.mobile?[.3,6.4]:[.3,6.4,10.2])){
  for(let seg=0;seg<60;seg++){const x=-28+seg*.94;if(hash(seg,d,10)<.64)continue;const ps=[],ix=[];for(let k=0;k<=5;k++){const xx=x+k*.16,depth=d+Math.sin(xx*.8+d)*.18,width=(d<1?.035:.045)*(.3+Math.sin(k/5*Math.PI));for(const side of [-1,1])ps.push(xx,waveHeight(xx,depth)+.028,coastZ(xx)-depth+side*width);if(k<5){const a=k*2;ix.push(a,a+2,a+1,a+1,a+2,a+3);}}const wave=new THREE.BufferGeometry();wave.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));wave.setIndex(ix);wave.computeVertexNormals();const r=f.mesh(wave,C.foam,g,{side:THREE.DoubleSide});r.name='Ivory breaking wave';r.castShadow=false;foamPositions.push(r);}
 }
 for(let i=0;i<(p.mobile?45:85);i++){const x=-20+hash(i,3)*43,d=.08+hash(i,8)*2.1,y=waveHeight(x,d)+.023,m=f.ball('Small foam fleck',[.045+hash(i,7)*.09,.016,.022+hash(i,9)*.04],[x,y,coastZ(x)-d],C.foam,g);m.castShadow=false;}
 for(const [x,z,w,h,d] of p.rocks){const y=goldfishHeight(x,z,p);f.ball('Neutral faceted coastal rock',[w/2,h/2,d/2],[x,y+h*.33,z],C.stone,g);for(let i=0;i<4;i++){const xx=x+(hash(i,x)-.5)*w*1.6,zz=z+(hash(i,z)-.5)*d*1.7;f.ball('Shore pebble',[.16,.13,.12],[xx,goldfishHeight(xx,zz,p)+.07,zz],'#b6afa1',g);}}
 f.beam('Sun-bleached shore driftwood',[13.1,goldfishHeight(13.1,3.5,p)+.16,3.5],[14.8,goldfishHeight(14.8,4.2,p)+.16,4.2],.13,C.woodDark,g,.1);f.beam('Driftwood branch',[14,goldfishHeight(14,3.85,p)+.16,3.85],[14.25,goldfishHeight(14.25,3.2,p)+.24,3.2],.06,C.woodDark,g,.035);
 for(const [x,z] of [[12.8,2.8],[15.7,6.4],[7.8,-3.6]])for(let i=0;i<4;i++){const xx=x+(hash(i,1)-.5)*.65,zz=z+(hash(i,5)-.5)*.65;f.ball('Ivory beach shell',[.12,.045,.085],[xx,goldfishHeight(xx,zz,p)+.05,zz],C.paper,g);}
 g.userData.waveContinuity=true;return g;
}
