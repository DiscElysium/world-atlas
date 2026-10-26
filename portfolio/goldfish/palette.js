// Only named game colour sources opt into this effect. Terrain never uses it.
export const PALETTE_CHANNELS={redBlue:[1,0,0],cyanPink:[0,1,0],yellowPurple:[0,0,1],painting:[1,0,0]};
export function swappedHue(h,s,v,channels,{water=false,sky=false}={}){
 if(s<.22||v<.34)return h;
 if(channels[1]&&h>=.79&&h<=.985)return .52;
 if(channels[1]&&h>=.47&&h<=.57)return .91;
 if(channels[2]&&h>=.115&&h<=.215)return .755;
 if(channels[2]&&h>=.69&&h<=.83)return .155;
 if(channels[0]&&h>=(water?.47:.55)&&h<=.72&&(!sky||v>.44))return .985;
 if(channels[0]&&(h>=.985||(h<=.10&&s>.58))&&!sky)return .60;
 return h;
}
export function swapRgb(rgb,channels,options={}){
 const [r,g,b]=rgb,max=Math.max(...rgb),min=Math.min(...rgb),d=max-min,s=max?d/max:0;
 let h=0;if(d){h=max===r?((g-b)/d+(g<b?6:0)):max===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
 const next=swappedHue(h,s,max,channels,options);if(next===h)return [...rgb];
 const i=Math.floor(next*6),f=next*6-i,p=max*(1-s),q=max*(1-f*s),t=max*(1-(1-f)*s);
 return [[max,t,p],[q,max,p],[p,max,t],[p,q,max],[t,p,max],[max,p,q]][i%6];
}
const colorCode=`
vec3 gfRgbHsv(vec3 c){vec4 K=vec4(0.,-1./3.,2./3.,-1.);vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));float d=q.x-min(q.w,q.y);return vec3(abs(q.z+(q.w-q.y)/(6.*d+1.e-10)),d/(q.x+1.e-10),q.x);}
vec3 gfHsvRgb(vec3 c){vec3 p=abs(fract(c.xxx+vec3(0.,2./3.,1./3.))*6.-3.);return c.z*mix(vec3(1.),clamp(p-1.,0.,1.),c.y);}
vec3 gfToSrgb(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.)),vec3(1./2.4))-.055,step(vec3(.0031308),c));}
vec3 gfToLinear(vec3 c){return mix(c/12.92,pow((max(c,vec3(0.))+.055)/1.055,vec3(2.4)),step(vec3(.04045),c));}
vec3 gfSwap(vec3 linearColor){
 vec3 c=gfRgbHsv(gfToSrgb(linearColor));float h=c.x,original=h;
 if(c.y<.22||c.z<.34)return linearColor;
 if(gfChannels.y>.5&&h>=.79&&h<=.985)h=.52;
 else if(gfChannels.y>.5&&h>=.47&&h<=.57)h=.91;
 else if(gfChannels.z>.5&&h>=.115&&h<=.215)h=.755;
 else if(gfChannels.z>.5&&h>=.69&&h<=.83)h=.155;
 else if(gfChannels.x>.5&&h>=(gfWater>.5?.47:.55)&&h<=.72&&(gfSky<.5||c.z>.44))h=.985;
 else if(gfChannels.x>.5&&(h>=.985||(h<=.10&&c.y>.58))&&gfSky<.5)h=.60;
 if(h==original)return linearColor;return gfToLinear(gfHsvRgb(vec3(h,c.y,c.z)));
}`;
export function collageMaterial(material,{channels=[0,0,0],swapped=false,worldBoundary=false,water=false,sky=false,atlas=null,ripple=false}={},animate=()=>{}){
 const time={value:0};
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,{gfChannels:{value:channels},gfWater:{value:water?1:0},gfSky:{value:sky?1:0},gfTime:time});
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 gfPoint;uniform float gfTime;').replace('#include <begin_vertex>','#include <begin_vertex>\ngfPoint=position.xz;'+(ripple?'\ntransformed.y+=.026*sin(position.x*.8+position.z*.55+gfTime*.48);':''));
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 gfPoint;uniform vec3 gfChannels;uniform float gfWater;uniform float gfSky;uniform float gfTime;\n'+colorCode);
  if(atlas!==null){const offset=atlas==='water'?.505:.005;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP\nvec2 gfUv=1.-abs(mod(vMapUv${ripple?'+vec2(.003*sin(gfTime*.22),gfTime*.002)':''},2.)-1.);gfUv.x=${offset}+.490*gfUv.x;vec4 sampledDiffuseColor=texture2D(map,gfUv);diffuseColor*=sampledDiffuseColor;\n#endif`);}
  if(swapped||worldBoundary)shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+(worldBoundary?'if(gfPoint.x>1.25+.13*sin(gfPoint.y*.45))':'')+'{diffuseColor.rgb=gfSwap(diffuseColor.rgb);}');
 };
 material.customProgramCacheKey=()=>JSON.stringify({channels,swapped,worldBoundary,water,sky,atlas,ripple});
 if(ripple)animate(t=>time.value=t);
 material.userData.goldfishPalette={channels,swapped,worldBoundary,water,sky,atlas};
 return material;
}
