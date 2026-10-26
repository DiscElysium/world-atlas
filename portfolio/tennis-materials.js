import * as THREE from './vendor/three.module.js';

// Shared, generated mineral grain. No image asset or UV atlas is needed: all
// landscape meshes use the same world-space triplanar material, including batches.
let mineral;
function hash(x,y){let n=Math.imul(x,374761393)^Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),a=x-ix,b=y-iy,u=a*a*(3-2*a),v=b*b*(3-2*b);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),u),THREE.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),u),v);}
function mineralTexture(){
 if(mineral)return mineral;const n=512,data=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const i=(y*n+x)*4,grain=noise(x*.61,y*.61)*.52+noise(x*.17,y*.17)*.30+hash(x,y)*.18;
  const broad=noise(x*.035,y*.035)*.65+noise(x*.091,y*.091)*.35;
  const vein=Math.abs(noise(x*.019,y*.019)-.50),crack=Math.exp(-vein*110)*.28;
  data[i]=Math.round(255*grain);data[i+1]=Math.round(255*Math.max(0,broad-crack));data[i+2]=Math.round(255*broad);data[i+3]=255;
 }
 mineral=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);mineral.wrapS=mineral.wrapT=THREE.RepeatWrapping;mineral.magFilter=THREE.LinearFilter;mineral.minFilter=THREE.LinearMipmapLinearFilter;mineral.generateMipmaps=true;mineral.needsUpdate=true;mineral.name='TennisAtom · generated mineral grain';return mineral;
}
const surfaces={
 limestone:{roughness:.96,grain:.15,scale:.35,bump:.002,vein:.085},
 chalk:{roughness:.94,grain:.07,scale:.30,bump:.001,vein:.045},
 ochre:{roughness:.91,grain:.13,scale:.42,bump:.002,vein:.065},
 concrete:{roughness:.86,grain:.08,scale:.48,bump:.001,vein:.02},
 sport:{roughness:.80,grain:.20,scale:.65,bump:.001,vein:.07},
 water:{roughness:.30,grain:.02,scale:.11,bump:.008,vein:.01},
 gravel:{roughness:1,grain:.18,scale:.70,bump:.003,vein:.06}
};
export function tennisMaterial(color,options={}){
 const {surface,...rest}=options,settings=surfaces[surface];
 const material=new THREE.MeshStandardMaterial({color,roughness:settings?.roughness??.83,flatShading:true,...rest});
 if(!settings)return material;
 material.userData.surface=surface;
 material.onBeforeCompile=shader=>{
  shader.uniforms.tennisMineral={value:mineralTexture()};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vTennisWorld;\nvarying vec3 vTennisNormal;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvTennisWorld=(modelMatrix*vec4(transformed,1.0)).xyz;\nvTennisNormal=normalize(mat3(modelMatrix)*objectNormal);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   uniform sampler2D tennisMineral;
   varying vec3 vTennisWorld;
   varying vec3 vTennisNormal;
   vec3 tennisTri(vec3 p,vec3 weights){
    return texture2D(tennisMineral,p.yz).rgb*weights.x+texture2D(tennisMineral,p.xz).rgb*weights.y+texture2D(tennisMineral,p.xy).rgb*weights.z;
   }
   vec3 tennisBump(vec3 n,vec3 p,float h){
    vec3 dx=dFdx(p),dy=dFdy(p),a=cross(dy,n),b=cross(n,dx);
    float det=dot(dx,a);return normalize(abs(det)*n-sign(det)*(dFdx(h)*a+dFdy(h)*b));
   }
   float tennisJoint(vec2 p){
    vec2 cell=floor(p),part=fract(p);float first=10.0,second=10.0;
    for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
     vec2 offset=vec2(float(x),float(y)),id=cell+offset;
     vec2 seed=fract(sin(vec2(dot(id,vec2(127.1,311.7)),dot(id,vec2(269.5,183.3))))*43758.5453);
     float d=length(offset+seed-part);if(d<first){second=first;first=d;}else second=min(second,d);
    }return 1.0-smoothstep(.008,.035,second-first);
   }`).replace('#include <color_fragment>',`#include <color_fragment>
    vec3 tennisWeights=pow(abs(normalize(vTennisNormal)),vec3(4.0));tennisWeights/=max(.001,tennisWeights.x+tennisWeights.y+tennisWeights.z);
    vec3 tennisStone=tennisTri(vTennisWorld*${settings.scale.toFixed(3)},tennisWeights);
    float tennisFine=tennisTri(vTennisWorld*${(settings.scale*5.7).toFixed(3)},tennisWeights).r;
    float tennisWeather=tennisTri(vTennisWorld*.045,tennisWeights).b;
    diffuseColor.rgb*=1.0+(tennisFine-.5)*${settings.grain.toFixed(3)}+(tennisStone.g-.5)*${settings.vein.toFixed(3)}+(tennisWeather-.5)*${surface==='sport'?'.55':surface==='limestone'?'.10':'.08'};
    ${surface==='chalk'?'diffuseColor.rgb*=1.0-.036*tennisJoint(vTennisWorld.xz*1.2);':''}
    float tennisMicroHeight=${surface==='water'?'(sin(vTennisWorld.x*3.3+vTennisWorld.z*.8)*.5+sin(vTennisWorld.z*4.1-vTennisWorld.x*.6)*.5)':'(tennisFine*.6+tennisStone.g*.4)'}*${settings.bump.toFixed(3)};
   `).replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=tennisBump(normal,-vViewPosition,tennisMicroHeight);').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor*(.95+.1*tennisStone.r),.2,1.0);');
 };
 material.customProgramCacheKey=()=>`tennis-mineral-v3-${surface}`;return material;
}
