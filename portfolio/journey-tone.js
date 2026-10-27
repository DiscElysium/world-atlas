import * as THREE from './vendor/three.module.js';
import {smooth} from './map-model.mjs?v=03bcba9148dc';

// Blend color grading on the shared world image, without switching renderers
// or blending separate scene images at the chapter midpoint.
export const journeyTone={value:new THREE.Vector2()};
const original='vec3 CustomToneMapping( vec3 color ) { return color; }';
if(THREE.ShaderChunk.tonemapping_pars_fragment.includes(original)){
 THREE.ShaderChunk.tonemapping_pars_fragment=THREE.ShaderChunk.tonemapping_pars_fragment.replace(original,`
  uniform vec2 uJourneyTone;
  vec3 CustomToneMapping(vec3 color){
   if(uJourneyTone.x>.999)return NeutralToneMapping(color);
   if(uJourneyTone.y>.999)return color;
   vec3 result=ACESFilmicToneMapping(color);
   if(uJourneyTone.x>.001)result=mix(result,NeutralToneMapping(color),uJourneyTone.x);
   if(uJourneyTone.y>.001)result=mix(result,color,uJourneyTone.y);
   return result;
  }`);
}

export function journeyToneWeights(entries,z,depth){
 const weight=id=>{const entry=entries.find(e=>e.project.id===id);return entry?1-smooth(.14,.84,Math.abs(z-entry.center)/depth):0;};
 return{tennis:weight('tennis'),flow:weight('flow'),engine:weight('engine'),otherworks:weight('otherworks')};
}
export function updateJourneyTone(entries,z,depth){
 const weights=journeyToneWeights(entries,z,depth);journeyTone.value.set(weights.tennis,weights.flow);return weights;
}
export function bindJourneyTone(material){
 if(!material.toneMapped||material.userData.journeyBounds||material.userData.journeyToneBound)return;
 const before=material.onBeforeCompile,key=material.customProgramCacheKey;
 material.onBeforeCompile=(shader,renderer)=>{before.call(material,shader,renderer);shader.uniforms.uJourneyTone=journeyTone;};
 material.customProgramCacheKey=()=>key.call(material)+'-continuous-tone';material.userData.journeyToneBound=true;material.needsUpdate=true;
}
