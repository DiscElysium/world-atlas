import * as THREE from './vendor/three.module.js';
import {FLOW_LIGHT} from './flow/palette.mjs';

const smoother=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*x*(x*(x*6-15)+10);};
export const ATELIER_DAYLIGHT={sun:5.1,sky:.82,fill:.35,sunColor:'#fff9f0',skyColor:'#f2f6fa',groundColor:'#a0a6ac',fillColor:'#e4edfa'};
const base={sun:2.5,sky:1.5,fill:.4,sunColor:'#fff2da',skyColor:'#e4efff',groundColor:'#8f9885',fillColor:'#bddbfa',sunPosition:[-18,30,-18],fillPosition:[15,20,15],normalBias:.035,bias:-.00016,rim:0,exposure:1};
const profiles={
 oblivion:{...base,normalBias:.14,bias:-.0008},
 tennis:{...base,normalBias:.08,bias:-.0004,exposure:1.12},
 engine:{...base,sky:.95,fill:1.25,sunColor:'#e3efff',skyColor:'#a6c7f8',groundColor:'#192540',fillColor:'#92baff',sunPosition:[-12,24,-9],fillPosition:[14,20,4],rim:1.45,exposure:.9},
 flow:{...base,sun:FLOW_LIGHT.sunIntensity,sky:FLOW_LIGHT.skyIntensity,fill:FLOW_LIGHT.fillIntensity,sunColor:FLOW_LIGHT.sun,skyColor:FLOW_LIGHT.sky,groundColor:FLOW_LIGHT.ground,fillColor:FLOW_LIGHT.fill,sunPosition:FLOW_LIGHT.sunPosition,fillPosition:FLOW_LIGHT.fillPosition,exposure:FLOW_LIGHT.exposure},
 goldfish:{...base,sun:2.65,sky:1.15,skyColor:'#fff4e1',groundColor:'#978368'},
 'liars-mask':{...base,sun:3.1,sky:.28,fill:1.3,sunColor:'#fff9ef',skyColor:'#fff5e6',groundColor:'#5d4d37',fillColor:'#fff2db',sunPosition:[14,24,-12],fillPosition:[-8,5,24]},
 otherworks:{...base,...ATELIER_DAYLIGHT,sunPosition:[-22,40,-14],normalBias:.04,bias:-.00035,exposure:1.02}
};
const scalars=['sun','sky','fill','normalBias','bias','rim','exposure'],colors=['sunColor','skyColor','groundColor','fillColor'],vectors=['sunPosition','fillPosition'];
export function sampleDaylight(entries,z,depth,mode='day'){
 let i=0;while(i<entries.length-1&&entries[i+1].center<=z)i++;
 const left=entries[i],right=entries[Math.min(i+1,entries.length-1)],a=profiles[left.project.id]||base,b=profiles[right.project.id]||base;
 // A quiet area around each work and one C2 curve across each join. Every
 // lighting property uses this curve; navigation's nearest index is irrelevant.
 const t=left===right?0:smoother((z-left.center-depth*.26)/(right.center-left.center-depth*.52));
 const result={from:left.project.id,to:right.project.id,amount:t};
 for(const k of scalars)result[k]=THREE.MathUtils.lerp(a[k],b[k],t);
 for(const k of colors)result[k]=new THREE.Color(a[k]).lerp(new THREE.Color(b[k]),t);
 for(const k of vectors)result[k]=new THREE.Vector3(...a[k]).lerp(new THREE.Vector3(...b[k]),t);
 if(mode==='golden'){result.sunColor.lerp(new THREE.Color('#ffca99'),.6);result.sunPosition.y*=.8;}
 return result;
}
export function applyDaylight(world){
 const p=sampleDaylight(world.entries,world.cameraZ,world.L.depth,world.mode);world.lightState=p;
 world.sun.intensity=p.sun;world.sky.intensity=p.sky;world.fill.intensity=p.fill;
 world.sun.color.copy(p.sunColor);world.sky.color.copy(p.skyColor);world.sky.groundColor.copy(p.groundColor);world.fill.color.copy(p.fillColor);
 world.sun.position.copy(p.sunPosition);world.sun.position.z+=world.cameraZ;world.sun.target.position.set(0,0,world.cameraZ);
 world.fill.position.copy(p.fillPosition);world.fill.position.z+=world.cameraZ;world.fill.target.position.set(0,0,world.cameraZ);
 world.sun.target.updateMatrixWorld();world.fill.target.updateMatrixWorld();
 world.sun.shadow.normalBias=p.normalBias;world.sun.shadow.bias=p.bias;world.renderer.toneMappingExposure=p.exposure;
 if(world.rim){world.rim.intensity=p.rim;world.rim.position.set(8,12,world.cameraZ-18);world.rim.target.position.set(0,0,world.cameraZ);world.rim.target.updateMatrixWorld();}
}
