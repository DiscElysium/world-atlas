import * as THREE from './vendor/three.module.js';
import {renderStyleProgress} from './render-style-progress.mjs?v=03bcba9148dc';
import {GOLDFISH_SPLIT_GLSL} from './goldfish-split.js?v=03bcba9148dc';
import {BAYER_GLSL,bayerPixelSize} from './liars-mask/bayer.js?v=03bcba9148dc';
import {UnrealBloomPass} from './vendor/addons/postprocessing/UnrealBloomPass.js';
import {configureJourneyMaterial} from './journey-boundary.js?v=03bcba9148dc';
import {bindJourneyTone} from './journey-tone.js?v=03bcba9148dc';

// Normal scene materials feed color, normal/depth and content-coverage buffers.
// Ink, continuous spectrum and ordered dither share the single world render.
export class RenderStyles{
 constructor(renderer){
  this.renderer=renderer;this.enabled=true;this.maskItems=[];this.riseNormals=new WeakMap();this.ownedNormals=[];
  this.color=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});this.color.samples=2;
  this.color.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
  this.normals=new THREE.WebGLRenderTarget(1,1);this.normals.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
  this.mask=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false});
  this.normalMaterial=new THREE.MeshNormalMaterial({side:THREE.DoubleSide});this.normalMaterial.toneMapped=false;
  this.bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.28,.34,1.7);
  this.maskScene=new THREE.Scene();this.outputScene=new THREE.Scene();this.outputCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  this.uniforms={tColor:{value:this.color.texture},tNormal:{value:this.normals.texture},tDepth:{value:this.normals.depthTexture},tStyleDepth:{value:this.color.depthTexture},tMask:{value:this.mask.texture},uPixel:{value:new THREE.Vector2(1,1)},uDitherSize:{value:1},uNear:{value:1},uFar:{value:500},uDepthCurve:{value:new THREE.Vector4()},uDisplayColor:{value:0},uDistance:{value:70},uInk:{value:1},uSpatialInk:{value:0},uInkBoundary:{value:new THREE.Vector2()},uWorldFromClip:{value:new THREE.Matrix4()},uGoldfish:{value:0},uBayer:{value:0},uStyleCenters:{value:new THREE.Vector2()},uChapterSpan:{value:1}};
  this.outputMaterial=new THREE.ShaderMaterial({uniforms:this.uniforms,depthTest:false,depthWrite:false,
   vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`,
   fragmentShader:`
    uniform sampler2D tColor,tNormal,tDepth,tStyleDepth,tMask;
    uniform vec2 uPixel;
    uniform float uNear,uFar,uDistance,uInk,uGoldfish,uBayer,uDitherSize,uSpatialInk;
    uniform vec2 uInkBoundary;
    uniform vec2 uStyleCenters;
    uniform float uChapterSpan;
    uniform mat4 uWorldFromClip;
    uniform vec4 uDepthCurve;
    uniform float uDisplayColor;
    varying vec2 vUv;
    float linearDepth(vec2 uv){float z=texture2D(tDepth,uv).r*2.-1.;return -(uDepthCurve.y-z*uDepthCurve.w)/(z*uDepthCurve.z-uDepthCurve.x);}
    vec3 normalAt(vec2 uv){return texture2D(tNormal,uv).rgb*2.0-1.0;}
    float imageLuma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
    float chapterCoverage(vec2 uv,float center){
     float depth=texture2D(tStyleDepth,uv).r;if(depth>.999999)return 1.;
     vec4 projected=uWorldFromClip*vec4(uv*2.-1.,depth*2.-1.,1.);vec3 world=projected.xyz/projected.w;
     float wave=uChapterSpan*.05*(.65*sin(world.x*.21)+.3*sin(world.x*.49+1.1));
     float start=world.z-(center-uChapterSpan*.5)-wave,end=center+uChapterSpan*.5+wave-world.z;
     return smoothstep(0.,uChapterSpan*.055,min(start,end));
    }
    ${GOLDFISH_SPLIT_GLSL}
    ${BAYER_GLSL}
    void main(){
     vec2 uv=vUv;
     vec3 source=texture2D(tColor,uv).rgb;
     vec3 color=source;
     if(uDisplayColor<.5){
      gl_FragColor=vec4(source,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      color=gl_FragColor.rgb;
     }
     if(uInk>.001){
      vec2 px=uPixel*1.05;vec3 n=normalAt(uv);float d=linearDepth(uv),ne=0.0,de=0.0;
      ne=max(ne,length(n-normalAt(uv+vec2(px.x,0.0))));ne=max(ne,length(n-normalAt(uv-vec2(px.x,0.0))));
      ne=max(ne,length(n-normalAt(uv+vec2(0.0,px.y))));ne=max(ne,length(n-normalAt(uv-vec2(0.0,px.y))));
      de=max(de,abs(d-linearDepth(uv+vec2(px.x,0.0))));de=max(de,abs(d-linearDepth(uv-vec2(px.x,0.0))));
      de=max(de,abs(d-linearDepth(uv+vec2(0.0,px.y))));de=max(de,abs(d-linearDepth(uv-vec2(0.0,px.y))));
      float normalEdge=smoothstep(.026,.23,ne),depthEdge=smoothstep(.0009,.007,de/max(d,1.0));
      float fade=mix(.28,1.0,1.0-smoothstep(uDistance*.88,uDistance*1.25,d));
      float edge=max(normalEdge,depthEdge)*fade;
      vec3 coverage=texture2D(tMask,uv).rgb;float light=imageLuma(color);
      vec3 ink=vec3(.018+.025*light+edge*.89);
      ink=mix(ink,vec3(.94),coverage.r);ink=mix(ink,vec3(light),coverage.g);
      float buttonEdge=0.0;
      buttonEdge=max(buttonEdge,abs(coverage.b-texture2D(tMask,uv+vec2(px.x,0.0)).b));
      buttonEdge=max(buttonEdge,abs(coverage.b-texture2D(tMask,uv-vec2(px.x,0.0)).b));
      buttonEdge=max(buttonEdge,abs(coverage.b-texture2D(tMask,uv+vec2(0.0,px.y)).b));
      buttonEdge=max(buttonEdge,abs(coverage.b-texture2D(tMask,uv-vec2(0.0,px.y)).b));
      ink=mix(ink,vec3(.02+.94*smoothstep(.60,.95,light)),coverage.b);ink=max(ink,vec3(buttonEdge*.88));
      float inkAmount=uInk;
      if(uSpatialInk>.5){
       vec4 world=uWorldFromClip*vec4(uv*2.-1.,texture2D(tDepth,uv).r*2.-1.,1.);
       inkAmount*=smoothstep(uInkBoundary.x,uInkBoundary.y,world.z/world.w);
      }
      color=mix(color,ink,inkAmount);
     }
     if(uBayer>.001){
      vec2 cell=floor(gl_FragCoord.xy/uDitherSize),sampleUV=(cell+.5)*uDitherSize*uPixel;
      gl_FragColor=vec4(texture2D(tColor,sampleUV).rgb,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      color=mix(color,liarsMaskBayer(gl_FragColor.rgb,cell,1.82,-.16),uBayer*chapterCoverage(uv,uStyleCenters.y));
     }
     // Transform the finished frame. Textures, light, shadows and background
     // all share this pass; it never selects or changes an object's material.
     if(uGoldfish>.001&&uv.x>=.5)color=mix(color,goldfishRemap(color),uGoldfish*chapterCoverage(uv,uStyleCenters.x));
     gl_FragColor=vec4(clamp(color,0.0,1.0),1.0);
    }`
  });
  bindJourneyTone(this.outputMaterial);
  this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.outputMaterial);this.outputScene.add(this.quad);
 }
 resize(width,height){const ratio=this.renderer.getPixelRatio(),size=this.renderer.getDrawingBufferSize(new THREE.Vector2()),w=size.x,h=size.y;for(const target of [this.color,this.normals,this.mask])target.setSize(w,h);this.bloom.setSize(w,h);this.uniforms.uPixel.value.set(1/w,1/h);this.uniforms.uDitherSize.value=bayerPixelSize(ratio);}
 scenePoint(x,y){return{x,y};}
 rebuild(entries){
  this.ownedNormals.forEach(m=>m.dispose());this.ownedNormals=[];this.riseNormals=new WeakMap();
  for(const item of this.maskItems){this.maskScene.remove(item.clone);item.clone.material.dispose();}this.maskItems=[];
  for(const entry of entries)entry.content.root.traverse(mesh=>{
   if(!mesh.isMesh||!mesh.material.map)return;
   const channel=mesh.name==='project-copy'||mesh.name==='art-caption'?[1,0,0]:mesh.name==='project-art'?[0,1,0]:mesh.name==='project-button'?[0,0,1]:null;if(!channel)return;
   const material=new THREE.ShaderMaterial({uniforms:{tMap:{value:mesh.material.map},uChannel:{value:new THREE.Vector3(...channel)}},side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform sampler2D tMap;uniform vec3 uChannel;varying vec2 vUv;void main(){float a=texture2D(tMap,vUv).a;if(a<.025)discard;gl_FragColor=vec4(uChannel*a,1.0);}`});
   const clone=new THREE.Mesh(mesh.geometry,material);clone.matrixAutoUpdate=false;this.maskScene.add(clone);this.maskItems.push({source:mesh,clone,entry});
  });
 }
 render(scene,camera,state){
  const r=this.renderer,u=this.uniforms,amounts=renderStyleProgress(state.z,state.depth,state.goldfishCenter,state.liarsMaskCenter);
  u.tColor.value=state.displayColor||this.color.texture;u.uDisplayColor.value=state.displayColor?1:0;
  u.uInk.value=this.enabled?(state.ink??amounts.ink):0;u.uGoldfish.value=this.enabled?amounts.swap:0;u.uBayer.value=this.enabled?amounts.bayer:0;u.uNear.value=camera.near;u.uFar.value=camera.far;u.uDistance.value=state.distance;
  u.uSpatialInk.value=state.inkBoundary?1:0;
  u.uStyleCenters.value.set(state.goldfishCenter??1e6,state.liarsMaskCenter??1e6);u.uChapterSpan.value=state.span;
  const projection=camera.projectionMatrix.elements;u.uDepthCurve.value.set(projection[10],projection[14],projection[11],projection[15]);
  u.uWorldFromClip.value.multiplyMatrices(camera.matrixWorld,camera.projectionMatrixInverse);
  if(state.inkBoundary)u.uInkBoundary.value.fromArray(state.inkBoundary);
  r.domElement.dataset.ink=String(u.uInk.value);r.domElement.dataset.crt='0';r.domElement.dataset.goldfishSplit=String(u.uGoldfish.value);r.domElement.dataset.goldfishSplitBoundary='screen-center';r.domElement.dataset.goldfishSplitMode='final-frame';r.domElement.dataset.goldfishColorModel='continuous-oklab';
  r.domElement.dataset.bayer=String(u.uBayer.value);r.domElement.dataset.bayerModel='liars-mask-8x8-aligned';r.domElement.dataset.bayerCell=String(u.uDitherSize.value);
  r.domElement.dataset.chapterEffects='physical-depth-boundaries';
  const bloom=this.enabled?(state.spaceAmount||0):0;
  // Keep the same color buffer for Goldfish with the effect on or off, so the
  // original left half has identical antialiasing and color conversion.
  if(amounts.swap<.001&&u.uInk.value<.001&&u.uBayer.value<.001&&bloom<.001){r.setRenderTarget(null);r.render(scene,camera);return;}
  if(!state.displayColor){r.setRenderTarget(this.color);r.render(scene,camera);}
  if(bloom>.001){this.bloom.strength=.28*bloom;this.bloom.render(r,null,this.color,0,false);}
  if(u.uInk.value>.001){
   const hidden=[],swapped=[],background=scene.background,override=scene.overrideMaterial,shadow=r.shadowMap.autoUpdate,clear=r.getClearColor(new THREE.Color()),alpha=r.getClearAlpha();
   try{
    scene.traverse(o=>{if(o.visible&&(o.isLine||o.isSprite||o.name==='Portfolio content · real scene surfaces')){hidden.push(o);o.visible=false;}});
    scene.traverse(o=>{if(!o.isMesh)return;let normal=this.normalMaterial;
     const sourceMaterial=Array.isArray(o.material)?o.material[0]:o.material;
     if(o.customDepthMaterial||sourceMaterial.userData.journeyBounds||sourceMaterial.clippingPlanes?.length){normal=this.riseNormals.get(o);if(!normal){normal=this.normalMaterial.clone();if(o.customDepthMaterial){normal.onBeforeCompile=o.customDepthMaterial.userData.journeyBeforeCompile||o.customDepthMaterial.onBeforeCompile;normal.customProgramCacheKey=()=>normal.onBeforeCompile.toString();}if(sourceMaterial.userData.journeyBounds)configureJourneyMaterial(normal,sourceMaterial.userData.journeyBounds);normal.clippingPlanes=sourceMaterial.clippingPlanes;this.riseNormals.set(o,normal);this.ownedNormals.push(normal);}}
     swapped.push([o,o.material]);o.material=normal;
    });
    scene.background=null;scene.overrideMaterial=null;r.shadowMap.autoUpdate=false;r.setClearColor(0x808080,1);r.setRenderTarget(this.normals);r.render(scene,camera);
   }finally{for(const [o,material] of swapped)o.material=material;for(const o of hidden)o.visible=true;scene.background=background;scene.overrideMaterial=override;r.shadowMap.autoUpdate=shadow;r.setClearColor(clear,alpha);}
   scene.updateMatrixWorld(true);
   for(const item of this.maskItems){item.clone.matrix.copy(item.source.matrixWorld);item.clone.visible=item.entry.root.visible&&item.entry.content.root.visible&&item.source.visible;}
   r.setClearColor(0x000000,1);r.setRenderTarget(this.mask);r.render(this.maskScene,camera);r.setClearColor(clear,alpha);
  }
  r.setRenderTarget(null);r.render(this.outputScene,this.outputCamera);
 }
 dispose(){for(const target of [this.color,this.normals,this.mask])target.dispose();this.bloom.dispose();this.ownedNormals.forEach(m=>m.dispose());this.normalMaterial.dispose();this.outputMaterial.dispose();this.quad.geometry.dispose();for(const item of this.maskItems)item.clone.material.dispose();}
}
