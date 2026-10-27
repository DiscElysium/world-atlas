import {journeyTone} from './journey-tone.js?v=eed7fff475f6';
// Match both sides of a terrain join in world coordinates. Nothing dissolves.
export function configureJourneyMaterial(material,bounds,tint=null,openEnd=false){
 const before=material.userData.journeyBeforeCompile??material.onBeforeCompile;
 const key=material.userData.journeyBeforeKey??material.customProgramCacheKey;
 // Three.js can reuse a compiled program after a desktop/mobile resize. Keep
 // its uniform objects alive so every cached variant sees the new map bounds.
 const uniforms=material.userData.journeyUniforms??{bounds:{value:bounds.clone()},start:{value:tint?.start.clone()},end:{value:tint?.end.clone()}};
 uniforms.bounds.value.copy(bounds);
 if(tint){if(uniforms.start.value)uniforms.start.value.copy(tint.start);else uniforms.start.value=tint.start.clone();if(uniforms.end.value)uniforms.end.value.copy(tint.end);else uniforms.end.value=tint.end.clone();}
 material.userData.journeyUniforms=uniforms;
 material.userData.journeyBeforeCompile=before;material.userData.journeyBeforeKey=key;material.userData.journeyBounds=uniforms.bounds.value;
 material.onBeforeCompile=(shader,renderer)=>{
  before.call(material,shader,renderer);
  shader.uniforms.uJourneyTone=journeyTone;
  shader.uniforms.uJourneyBounds=uniforms.bounds;
  const varying='\nvarying vec3 vJourneyPosition;\n';
  shader.vertexShader=varying+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
   vec4 journeyPosition=vec4(transformed,1.0);
   #ifdef USE_BATCHING
    journeyPosition=batchingMatrix*journeyPosition;
   #endif
   #ifdef USE_INSTANCING
    journeyPosition=instanceMatrix*journeyPosition;
   #endif
   vJourneyPosition=(modelMatrix*journeyPosition).xyz;`);
  shader.fragmentShader='uniform vec2 uJourneyBounds;'+varying+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
   float journeyWave=(uJourneyBounds.y-uJourneyBounds.x)*.05*(.65*sin(vJourneyPosition.x*.21)+.3*sin(vJourneyPosition.x*.49+1.1));
   float journeyStart=vJourneyPosition.z-uJourneyBounds.x-journeyWave;
   float journeyEnd=${openEnd?'1.0e6':'uJourneyBounds.y+journeyWave-vJourneyPosition.z'};
   if(min(journeyStart,journeyEnd)<0.0)discard;`);
  if(tint){
   shader.uniforms.uJourneyStartColor=uniforms.start;shader.uniforms.uJourneyEndColor=uniforms.end;
   shader.fragmentShader='uniform vec3 uJourneyStartColor,uJourneyEndColor;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float journeyTint=1.0-smoothstep(0.0,(uJourneyBounds.y-uJourneyBounds.x)*.065,min(journeyStart,journeyEnd));
    vec3 journeyColor=journeyStart<journeyEnd?uJourneyStartColor:uJourneyEndColor;
    diffuseColor.rgb=mix(diffuseColor.rgb,journeyColor,journeyTint*.82);`);
  }
 };
 material.customProgramCacheKey=()=>key.call(material)+'-journey-boundary-'+(tint?'ground':'solid')+(openEnd?'-open-end':'');material.needsUpdate=true;
}
