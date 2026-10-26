import * as THREE from '../vendor/three.module.js';

export const BAYER8=(()=>{let a=[[0]];for(let n=1;n<8;n*=2){const b=Array.from({length:n*2},()=>Array(n*2));for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=a[y][x]*4;b[y][x]=k;b[y][x+n]=k+2;b[y+n][x]=k+3;b[y+n][x+n]=k+1;}a=b;}return a;})();
export const BAYER_PIXEL_CSS=1.25;
export const bayerPixelSize=ratio=>Math.max(1,Math.round(ratio*BAYER_PIXEL_CSS));
export function bayerGridSample(x,y,width,height,size){const cell=[Math.floor(x/size),Math.floor(y/size)];return{cell,uv:[Math.min(1,(cell[0]+.5)*size/width),Math.min(1,(cell[1]+.5)*size/height)]};}
export const BAYER_GLSL=`
 float bayer2(vec2 p){p=mod(floor(p),2.0);return p.x*2.0+p.y*3.0-p.x*p.y*4.0;}
 float bayer8(vec2 p){return (16.0*bayer2(p)+4.0*bayer2(floor(p/2.0))+bayer2(floor(p/4.0))+.5)/64.0;}
 vec3 liarsMaskBayer(vec3 displayColor,vec2 pixel,float contrast,float brightness){
  float l=dot(displayColor,vec3(.2126,.7152,.0722));
  l=clamp((l-.50)*contrast+.50+brightness,0.0,1.0);
  float bit=step(bayer8(pixel),l);
  return mix(vec3(73.0,34.0,13.0)/255.0,vec3(255.0,249.0,238.0)/255.0,bit);
 }`;
// One ordinary lit render plus a full-frame two-ink ordered dither pass.
// Source luminance and the threshold matrix use the same integer pixel cell.
export class BayerPass{
 constructor(renderer){
  this.renderer=renderer;this.enabled=true;this.target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});
  this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  this.uniforms={tColor:{value:this.target.texture},uResolution:{value:new THREE.Vector2(1,1)},uStrength:{value:1},uContrast:{value:1.82},uBrightness:{value:-.16},uPixelSize:{value:1}};
  this.material=new THREE.ShaderMaterial({uniforms:this.uniforms,depthTest:false,depthWrite:false,
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
   fragmentShader:`uniform sampler2D tColor;uniform float uStrength,uContrast,uBrightness,uPixelSize;varying vec2 vUv;${BAYER_GLSL}
    uniform vec2 uResolution;
    void main(){vec2 cell=floor(gl_FragCoord.xy/uPixelSize),sampleUV=(cell+.5)*uPixelSize/uResolution;
     gl_FragColor=vec4(texture2D(tColor,sampleUV).rgb,1.0);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
     vec3 original=gl_FragColor.rgb;vec3 ink=liarsMaskBayer(original,cell,uContrast,uBrightness);
     gl_FragColor=vec4(mix(original,ink,uStrength),1.0);
    }`});
  this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.material);this.scene.add(this.quad);
 }
 resize(){const size=this.renderer.getDrawingBufferSize(new THREE.Vector2());this.target.setSize(size.x,size.y);this.uniforms.uResolution.value.copy(size);this.uniforms.uPixelSize.value=bayerPixelSize(this.renderer.getPixelRatio());}
 render(scene,camera){const r=this.renderer;this.uniforms.uStrength.value=this.enabled?1:0;r.setRenderTarget(this.target);r.render(scene,camera);r.setRenderTarget(null);r.render(this.scene,this.camera);}
 dispose(){this.target.dispose();this.material.dispose();this.quad.geometry.dispose();}
}
