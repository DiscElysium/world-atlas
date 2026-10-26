import * as THREE from './vendor/three.module.js';

// Terrain and the flat reading area's rim use the same camera/depth falloff.
export const oblivionFadeGLSL=`float oblivionContrast(float viewDepth,float height,float viewDistance){
 float distanceFade=1.0-smoothstep(viewDistance*0.84,viewDistance*1.24,viewDepth);
 float depthFade=smoothstep(-6.4,0.15,height);
 return 0.62*mix(0.12,1.0,distanceFade)*depthFade;
}`;

export function blendedRimMaterial(L){
 const material=new THREE.LineBasicMaterial({color:0xffffff,toneMapped:false,depthWrite:false});
 material.onBeforeCompile=shader=>{
  shader.uniforms.uOblivionDistance={value:L.distance};
  shader.vertexShader=shader.vertexShader
   .replace('#include <common>','#include <common>\nvarying float vOblivionDepth; varying float vOblivionHeight;')
   .replace('#include <project_vertex>','#include <project_vertex>\nvOblivionDepth=-mvPosition.z;vOblivionHeight=(modelMatrix*vec4(transformed,1.0)).y;');
  shader.fragmentShader=shader.fragmentShader
   .replace('#include <common>','#include <common>\nuniform float uOblivionDistance; varying float vOblivionDepth; varying float vOblivionHeight;\n'+oblivionFadeGLSL)
   .replace('#include <colorspace_fragment>','#include <colorspace_fragment>\ngl_FragColor.rgb*=0.22*oblivionContrast(vOblivionDepth,vOblivionHeight,uOblivionDistance);');
 };
 material.customProgramCacheKey=()=> 'oblivion-ground-rim-v1';
 return material;
}
