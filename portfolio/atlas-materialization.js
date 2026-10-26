import * as THREE from './vendor/three.module.js';

// Both images come from this same scene, paper and camera. Copying the finished
// framebuffer preserves unlit pencil colours and each material's tone mapping;
// models and their shadows join the drawing with the identical coverage.
export class AtlasMaterialization{
 constructor(renderer){
  this.renderer=renderer;this.size=new THREE.Vector2();this.camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);this.scene=new THREE.Scene();
  this.material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{tPaper:{value:null},tModel:{value:null},uAmount:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform sampler2D tPaper,tModel;uniform float uAmount;varying vec2 vUv;void main(){gl_FragColor=vec4(mix(texture2D(tPaper,vUv).rgb,texture2D(tModel,vUv).rgb,uAmount),1.);}'});
  this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.material));
 }
 resize(){
  const next=this.renderer.getDrawingBufferSize(new THREE.Vector2());if(next.equals(this.size))return;
  this.paper?.dispose();this.model?.dispose();this.size.copy(next);this.paper=new THREE.FramebufferTexture(next.x,next.y);this.model=new THREE.FramebufferTexture(next.x,next.y);this.material.uniforms.tPaper.value=this.paper;this.material.uniforms.tModel.value=this.model;
 }
 render(scene,camera,intro){
  const r=this.renderer;this.capture(scene,camera);
  intro.withDraftOnly(()=>{const shadowUpdate=r.shadowMap.needsUpdate;r.shadowMap.needsUpdate=false;try{r.render(scene,camera);r.copyFramebufferToTexture(this.paper);}finally{r.shadowMap.needsUpdate=shadowUpdate;}});
  this.material.uniforms.uAmount.value=intro.materialization;r.render(this.scene,this.camera);
 }
 capture(scene,camera){const r=this.renderer;this.resize();r.setRenderTarget(null);r.render(scene,camera);r.copyFramebufferToTexture(this.model);return this.model;}
 dispose(){this.paper?.dispose();this.model?.dispose();this.material.dispose();this.scene.children[0].geometry.dispose();}
}
