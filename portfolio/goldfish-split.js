// Oklab conversion matrices by Bjorn Ottosson (public domain / MIT):
// https://bottosson.github.io/posts/oklab/
// One continuous spectrum transform, applied to the finished display image.
// Perceived lightness stays fixed; only hue, chroma and a subtle neutral tint change.
const RGB_TO_LMS=[
 [.4122214708,.5363325363,.0514459929],
 [.2119034982,.6806995451,.1073969566],
 [.0883024619,.2817188376,.6299787005]
];
const LMS_TO_LAB=[
 [.2104542553,.7936177850,-.0040720468],
 [1.9779984951,-2.4285922050,.4505937099],
 [.0259040371,.7827717662,-.8086757660]
];
const LAB_TO_LMS=[
 [1,.3963377774,.2158037573],
 [1,-.1055613458,-.0638541728],
 [1,-.0894841775,-1.2914855480]
];
const LMS_TO_RGB=[
 [4.0767416621,-3.3077115913,.2309699292],
 [-1.2684380046,2.6097574011,-.3413193965],
 [-.0041960863,-.7034186147,1.7076147010]
];
const clamp=v=>Math.max(0,Math.min(1,v)),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),mul=(m,c)=>m.map(row=>dot(row,c));
const decode=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
const encode=c=>c<=.0031308?c*12.92:1.055*c**(1/2.4)-.055;
export const GOLD_COLOR_TRANSFORM={rotation:133*Math.PI/180,warp:40*Math.PI/180,blueCenter:246*Math.PI/180,neutralTint:[-.009,-.008],gamutSteps:8};
export function srgbToOklab(rgb){return mul(LMS_TO_LAB,mul(RGB_TO_LMS,rgb.map(v=>decode(clamp(v)))).map(Math.cbrt));}
function labToLinear(lab){return mul(LMS_TO_RGB,mul(LAB_TO_LMS,lab).map(v=>v*v*v));}
export function oklabToSrgb(lab){return labToLinear(lab).map(v=>encode(clamp(v)));}
const gamutError=rgb=>Math.max(-Math.min(...rgb),Math.max(...rgb)-1);
export function remapGoldfishColor(rgb){
 const lab=srgbToOklab(rgb),L=clamp(lab[0]),C=Math.hypot(lab[1],lab[2]),h=Math.atan2(lab[2],lab[1]+1e-10),p=GOLD_COLOR_TRANSFORM;
 // The derivative remains positive: blue/cyan hues compress smoothly into
 // reds while every other hue also receives a continuous, nonzero rotation.
 const hue=h+p.rotation-p.warp*Math.sin(h-p.blueCenter),tint=4*L*(1-L)*Math.exp(-35*C);
 const ab=[C*Math.cos(hue)+p.neutralTint[0]*tint,C*Math.sin(hue)+p.neutralTint[1]*tint];
 const at=t=>labToLinear([L,ab[0]*t,ab[1]*t]);let result=at(1);
 if(gamutError(result)>0){
  let low=0,high=1;
  for(let i=0;i<p.gamutSteps;i++){const mid=(low+high)/2;if(gamutError(at(mid))>0)high=mid;else low=mid;}
  // Interpolate within the final bracket to avoid visible chroma steps.
  const a=gamutError(at(low)),b=gamutError(at(high)),f=clamp(a/(a-b-1e-20));
  result=at((low+(high-low)*f)*(1-1e-6));
 }
 return result.map(v=>encode(clamp(v)));
}
const number=v=>Number(v).toFixed(10),vec=v=>'vec3('+v.map(number).join(',')+')';
const matExpr=(m,c)=>'vec3('+m.map(row=>'dot('+c+','+vec(row)+')').join(',')+')';
const p=GOLD_COLOR_TRANSFORM;
export const GOLDFISH_SPLIT_GLSL=`
 vec3 gfDecode(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(vec3(.04045),c));}
 vec3 gfEncode(vec3 c){c=clamp(c,0.,1.);return mix(12.92*c,1.055*pow(c,vec3(1./2.4))-.055,step(vec3(.0031308),c));}
 vec3 gfToLab(vec3 c){c=gfDecode(clamp(c,0.,1.));vec3 lms=pow(max(${matExpr(RGB_TO_LMS,'c')},vec3(0.)),vec3(1./3.));return ${matExpr(LMS_TO_LAB,'lms')};}
 vec3 gfToLinear(vec3 lab){vec3 lms=${matExpr(LAB_TO_LMS,'lab')};lms=lms*lms*lms;return ${matExpr(LMS_TO_RGB,'lms')};}
 float gfGamutError(vec3 c){return max(-min(c.r,min(c.g,c.b)),max(c.r,max(c.g,c.b))-1.);}
 vec3 goldfishRemap(vec3 color){
  vec3 lab=gfToLab(color);float L=clamp(lab.x,0.,1.),C=length(lab.yz),h=atan(lab.z,lab.y+1.e-10);
  float hue=h+${number(p.rotation)}-${number(p.warp)}*sin(h-${number(p.blueCenter)});
  float tint=4.*L*(1.-L)*exp(-35.*C);
  vec2 ab=C*vec2(cos(hue),sin(hue))+vec2(${p.neutralTint.map(number).join(',')})*tint;
  vec3 result=gfToLinear(vec3(L,ab));
  if(gfGamutError(result)>0.){
   float low=0.,high=1.;
   for(int i=0;i<${p.gamutSteps};i++){float mid=(low+high)*.5;if(gfGamutError(gfToLinear(vec3(L,ab*mid)))>0.)high=mid;else low=mid;}
   float a=gfGamutError(gfToLinear(vec3(L,ab*low))),b=gfGamutError(gfToLinear(vec3(L,ab*high)));
   float f=clamp(a/(a-b-1.e-20),0.,1.);result=gfToLinear(vec3(L,ab*mix(low,high,f)*(1.-1.e-6)));
  }
  return gfEncode(result);
 }`;
