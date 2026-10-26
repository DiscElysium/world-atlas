export const PITCH=Math.PI*65/180;
export const FOV=40;
export const CONTENT_HEIGHT=.17;
export const MAP_WIDTH=40;
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
export function seeded(seed=7291){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
export function layout(width,height,zones,pitch=PITCH){const aspect=width/height,visibleHeight=MAP_WIDTH/aspect,sinPitch=Math.sin(pitch),cosPitch=Math.cos(pitch),tanFov=Math.tan(FOV*Math.PI/360);return{width,height,aspect,pitch,depth:visibleHeight/sinPitch,visibleHeight,distance:MAP_WIDTH/(2*tanFov*aspect),sinPitch,cosPitch,tanFov,mobile:width<=700,zones}}
// Lay out the flat content in screen space, then intersect its rays with the map.
export function groundPoint(u,v,L){const k=(1-2*v)*L.tanFov,z=(L.cosPitch*CONTENT_HEIGHT-k*(L.distance-L.sinPitch*CONTENT_HEIGHT))/(L.sinPitch-k*L.cosPitch),depth=L.distance-L.sinPitch*CONTENT_HEIGHT-L.cosPitch*z;return{x:(2*u-1)*depth*L.tanFov*L.aspect,z}}
export function screenPoint(x,y,z,L,focusZ=0){const depth=L.distance-L.sinPitch*y-L.cosPitch*(z-focusZ);return{u:.5+x/(2*depth*L.tanFov*L.aspect),v:.5-(L.cosPitch*y-L.sinPitch*(z-focusZ))/(2*depth*L.tanFov)}}
export function whiteDistance(u,v,L){let distance=10;for(const z of L.zones){const cx=(z.left+z.right)/2,cy=(z.top+z.bottom)/2;const rx=(z.right-z.left)/2+.031,ry=(z.bottom-z.top)/2+.035;const qx=Math.abs(u-cx)/rx,qy=Math.abs(v-cy)/ry;const d=(Math.pow(Math.pow(qx,5)+Math.pow(qy,5),1/5)-1)*Math.min(rx,ry);distance=Math.min(distance,d)}return distance}
export function whiteMask(u,v,L){const d=whiteDistance(u,v,L);const wobble=(Math.sin(u*34+v*15)+Math.sin(v*29-u*16))*.003;return 1-smooth(-.007,.034,d+wobble)}
export function hills(u,v){const g=(x,y,rx,ry,h)=>Math.exp(-(((u-x)/rx)**2+((v-y)/ry)**2))*h;return g(.04,.98,.19,.17,6.4)+g(.025,.04,.18,.18,5.1)+g(.97,.02,.19,.19,4.3)+g(1.055,1.0,.20,.18,4.9)+g(.58,.09,.13,.10,.7)}
export function heightAt(u,v,L,riverDistance=10){const white=whiteMask(u,v,L);const n=.82+.13*Math.sin(u*15+v*9)+.05*Math.cos(v*18-u*12);const hill=hills(u,v)*n*(1-white)**2;const bank=smooth(.012,.035,riverDistance);return .04+(.13+hill)*bank}
export function riverPoints(mobile){return mobile?[[.02,-.1],[.08,.12],[.14,.27],[.06,.43],[.10,.64],[.26,.80],[.63,.93],[1.1,1.04]]:[[.13,-.12],[.12,.06],[.25,.16],[.394,.21],[.423,.34],[.431,.5],[.432,.68],[.485,.82],[.70,.89],[1.10,1.04]]}
export function scrollView(L,offset){const travel=Math.max(0,offset);return{offset:travel,pitch:PITCH,zoom:1,focusZ:L.depth*travel/L.height}}
