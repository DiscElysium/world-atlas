import * as THREE from './vendor/three.module.js';
import {oblivionTopology} from './oblivion-topology.mjs?v=eed7fff475f6';

export function createOblivionLand(L,span){
 const topology=oblivionTopology(L,span),geometry=new THREE.BufferGeometry(),colors=[];
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(topology.positions,3));
 geometry.setAttribute('aBarycentric',new THREE.Float32BufferAttribute(topology.barycentric,3));
 geometry.setAttribute('aStroke',new THREE.Float32BufferAttribute(topology.strokes,1));
 const grass=new THREE.Color('#abbba5'),rock=new THREE.Color('#939f9f'),clearing=new THREE.Color('#d5ded6');
 for(let i=0;i<topology.positions.length;i+=9){
  const x=(topology.positions[i]+topology.positions[i+3]+topology.positions[i+6])/3,y=(topology.positions[i+1]+topology.positions[i+4]+topology.positions[i+7])/3,z=(topology.positions[i+2]+topology.positions[i+5]+topology.positions[i+8])/3;
  const c=grass.clone().lerp(rock,THREE.MathUtils.smoothstep(y,.8,5)).lerp(clearing,1-THREE.MathUtils.smoothstep(Math.abs(y-.1),.02,.30));
  c.multiplyScalar(.97+.03*Math.sin(x*2+z*3));for(let k=0;k<3;k++)colors.push(c.r,c.g,c.b);
 }
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
 const reveal={value:0},material=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,side:THREE.DoubleSide,shadowSide:THREE.FrontSide});
 const rise=shader=>{shader.uniforms.uReveal=reveal;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uReveal;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y=mix(.1,position.y,uReveal);');};
 material.onBeforeCompile=rise;material.customProgramCacheKey=()=> 'oblivion-normal-stone-terrain';
 const land=new THREE.Mesh(geometry,material);land.name='OBLIVION · irregular faceted terrain';land.castShadow=true;land.receiveShadow=true;
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});depth.onBeforeCompile=rise;land.customDepthMaterial=depth;land.userData.facets=topology.faces.length;
 return{land,revealUniform:reveal,topology};
}
