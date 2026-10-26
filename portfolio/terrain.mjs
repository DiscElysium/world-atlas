import {clamp,smooth,whiteMask,groundPoint} from './map-model.mjs';
import {oblivionHeight} from './oblivion-terrain.mjs';
import {tennisHeight} from './tennis-layout.mjs';
import {flowHeight} from './flow/plan.mjs';
export function riverX(v,mobile=false){return mobile?.065+.016*Math.sin(v*7)+.85*smooth(.90,1.19,v):.43+.09*Math.sin(v*5.1-1.1)+.3*smooth(.63,1.18,v);}
export function terrainSample(u,v,L,project){
 if(project.id==='oblivion')return oblivionHeight(u,v,L);
 if(project.id==='tennis')return tennisHeight(u,v,L);
 if(project.id==='flow')return flowHeight(u,v,L);
 const white=whiteMask(u,v,L),g=(x,y,rx,ry,h)=>Math.exp(-(((u-x)/rx)**2+((v-y)/ry)**2))*h;
 let height=g(.015,.12,.18,.29,5.9)+g(.97,.02,.15,.20,5.5)+g(.04,.97,.22,.20,6.8)+g(1.02,.90,.19,.25,5.4);
 height*=.78+.14*Math.sin(u*31+v*19)+.08*Math.cos(v*32-u*13);
 if(project.id==='flow')height+=g(.31,.04,.2,.13,4.4);
 if(project.id==='tennis'){
  height*=.63;
  const pad=(x,y,rx,ry)=>1-smooth(.86,1.35,Math.max(Math.abs((u-x)/rx),Math.abs((v-y)/ry)));
  height*=1-Math.max(pad(.79,.125,.09,L.mobile?.045:.12),pad(.035,.865,.11,L.mobile?.045:.13));
 }
 if(project.id==='engine')height*=.85;
 if(project.id==='goldfish')height*=.65;
 if(project.id==='goldfish')height*=smooth(.9,1.45,Math.max(Math.abs((u-.16)/.075),Math.abs((v-.13)/(L.mobile?.045:.105))));
 const river=(project.id==='flow'||project.id==='goldfish')?Math.abs(u-riverX(v,L.mobile)):10;
 height*=smooth(.025,.069,river);
 if(project.id==='flow')height+=2.9*(1-smooth(-.06,.20,v))*(1-smooth(.024,.065,river));
 return{height:.10+height*(1-white)**2,white,river};
}
export function sceneGround(u,v,L,project){const p=groundPoint(u,v,L);return{x:p.x,z:p.z,y:terrainSample(u,v,L,project).height};}
export function revealTarget(cameraZ,center,depth){return smooth(-.97,-.23,(cameraZ-center)/depth);}
export function normalizeProjectIndex(z,span,count){return clamp(Math.round(z/span),0,count-1);}
