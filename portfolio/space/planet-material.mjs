import * as THREE from 'three';

// The .blend has the same limb effect as a shader-node atmosphere.
// glTF carries the sphere geometry; this material restores its view-dependent glow.
export function configurePlanet(mesh){
 const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];
 if(mats.some(m=>m.name==='planet_atmosphere')){
  mesh.castShadow=false;mesh.receiveShadow=false;
  mesh.material=new THREE.ShaderMaterial({
   name:'planet_atmosphere',transparent:true,depthWrite:false,side:THREE.FrontSide,
   uniforms:{glowColor:{value:new THREE.Color('#56c9ff')},sunDirection:{value:new THREE.Vector3(-.83,.18,-.48).normalize()}},
   vertexShader:`varying vec3 viewNormal; varying vec3 viewDirection; varying vec3 worldNormal;
    void main(){vec4 v=modelViewMatrix*vec4(position,1.0);viewNormal=normalize(normalMatrix*normal);worldNormal=normalize(mat3(modelMatrix)*normal);viewDirection=-v.xyz;gl_Position=projectionMatrix*v;}`,
   fragmentShader:`uniform vec3 glowColor; uniform vec3 sunDirection; varying vec3 viewNormal; varying vec3 viewDirection; varying vec3 worldNormal;
    void main(){float facing=abs(dot(normalize(viewNormal),normalize(viewDirection)));float rim=pow(1.0-facing,3.8);float sunlight=.25+.75*max(dot(normalize(worldNormal),sunDirection),0.0);gl_FragColor=vec4(glowColor*2.4,rim*.85*sunlight);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`
  });
  mesh.renderOrder=1;
 }else if(mats.some(m=>m.name.startsWith('planet_surface_'))){
  mesh.castShadow=false;mesh.receiveShadow=false;
  const surface=mats.map(m=>new THREE.MeshBasicMaterial({name:m.name,color:m.color.clone()}));
  mesh.material=Array.isArray(mesh.material)?surface:surface[0];
 }
}
