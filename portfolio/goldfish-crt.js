// Port of Goldfish's UI/CRTOverlay, using sha.mat from its active scene.
// Source: project1/art_work/Assets/Shaders/CRTOverlay.shader
// The Unity CRT RawImage is scaled to 1.1, so its visible pattern UVs
// do not reach the material's black corners. Keep the same overscan here.
export const GOLDFISH_CRT=Object.freeze({
 patternCurvatureX:12,patternCurvatureY:6,overlayScale:1.1,
 scanlineIntensity:.3,scanlineCount:240,scanlineSpeed:.05,
 grilleIntensity:.2,grilleCount:640,vignetteStrength:1,brightness:1,
 glitchIntensity:.03,glitchSpeed:3,glitchBlockDensity:8.1,
 glitchColorStrength:.981,glitchEdgeBias:2,
 // The original overlay curves its pattern only. Add a separate, gentle
 // image lens; overscan keeps the map flush with the viewport edges.
 lensX:.008,lensY:.012
});
const f=value=>value.toFixed(6),s=GOLDFISH_CRT;
export const goldfishCrtShader=`
 vec2 goldfishPatternUV(vec2 uv){
  vec2 p=(uv-.5)*2.0/${f(s.overlayScale)};
  vec2 offset=abs(p.yx)/vec2(${f(s.patternCurvatureX)},${f(s.patternCurvatureY)});
  return (p+p*offset*offset)*.5+.5;
 }
 float goldfishGlitchHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 vec3 goldfishCrtMultiplier(vec2 uv,float time,float scanCount,float grilleCount){
  vec2 cuv=goldfishPatternUV(uv);
  float sc=cos(3.14159265*(cuv.y+${f(s.scanlineSpeed)}*time)*scanCount);
  float scanline=1.0-${f(s.scanlineIntensity)}*.5*(1.0-sc);
  float gr=clamp(1.5*cos(3.14159265*cuv.x*grilleCount),0.0,1.0);
  float grille=1.0-${f(s.grilleIntensity)}*(1.0-gr);
  vec2 vu=clamp(cuv,0.0,1.0);
  float v=vu.x*vu.y*(1.0-vu.x)*(1.0-vu.y);
  v=clamp(pow(max(16.0*v,0.0),.3),0.0,1.0);
  float vig=mix(1.0,v,${f(s.vignetteStrength)});
  float factor=scanline*grille*vig*${f(s.brightness)};

  // Preserve the game's sparse, edge-biased fault blocks and colored dots.
  vec2 cellUV=fract(cuv*${f(s.glitchBlockDensity)});
  vec2 cellBase=floor(cuv*${f(s.glitchBlockDensity)});
  float cellRand=goldfishGlitchHash(cellBase);
  vec2 cellCenter=(cellBase+.5)/${f(s.glitchBlockDensity)};
  vec2 toEdge=min(cellCenter,1.0-cellCenter);
  float edgeProximity=1.0-clamp(min(toEdge.x,toEdge.y)*4.0,0.0,1.0);
  float spatialScale=1.0+edgeProximity*${f(s.glitchEdgeBias)}*2.0;
  float glitchFactor=1.0;vec3 colorDot=vec3(0.0);
  if(cellRand<${f(s.glitchIntensity)}*.65*spatialScale){
   float rLeft=goldfishGlitchHash(cellBase+.17),rBottom=goldfishGlitchHash(cellBase+.33);
   float rWidth=goldfishGlitchHash(cellBase+.51),rHeight=goldfishGlitchHash(cellBase+.69);
   float blockScale=.15+${f(s.glitchIntensity)}*.70;
   float bw=.1+rWidth*blockScale,bh=.1+rHeight*blockScale;
   float bl=rLeft*(1.0-bw),bb=rBottom*(1.0-bh);
   if(cellUV.x>=bl&&cellUV.x<=bl+bw&&cellUV.y>=bb&&cellUV.y<=bb+bh){
    glitchFactor=.08;
    vec2 dotId=floor(cellUV*8.0);float dotT=time*${f(s.glitchSpeed)};
    float dotFlicker=sin(dotT*5.0+cellRand*dotId.x*3.7+dotId.y*7.1);
    float dotRand=goldfishGlitchHash(cellBase+.83+vec2(dotId.x*.374,dotId.y*.618)+dotT*.043);
    if(dotFlicker>=.15&&dotRand<.18*${f(s.glitchIntensity)}){
     float channel=goldfishGlitchHash(cellBase+.91+vec2(dotId.x*.213,dotId.y*.891)+dotT*.071);
     if(channel<.25)colorDot=vec3(${f(s.glitchColorStrength)},0.0,0.0);
     else if(channel<.50)colorDot=vec3(0.0,${f(s.glitchColorStrength)},0.0);
     else if(channel<.75)colorDot=vec3(0.0,0.0,${f(s.glitchColorStrength)});
     else colorDot=vec3(${f(s.glitchColorStrength)}*.5);
    }
   }
  }
  return vec3(factor*glitchFactor)+colorDot*(1.0-factor*glitchFactor);
 }
`;
