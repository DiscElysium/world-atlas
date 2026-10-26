import {smooth,whiteMask} from './map-model.mjs';
// The reading shelf moves down and slightly left with the picture and copy.
export const OBLIVION_PLATEAU=[[.02,.535],[.06,.315],[.21,.255],[.41,.265],[.61,.295],[.68,.415],[.665,.615],[.545,.79],[.29,.825],[.075,.775]];
export function plateauMask(u,v){
 let inside=false,distance=10;
 for(let i=0,j=OBLIVION_PLATEAU.length-1;i<OBLIVION_PLATEAU.length;j=i++){
  const a=OBLIVION_PLATEAU[j],b=OBLIVION_PLATEAU[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((u-a[0])*dx+(v-a[1])*dy)/(dx*dx+dy*dy)));
  distance=Math.min(distance,Math.hypot(u-a[0]-t*dx,v-a[1]-t*dy));
  if((a[1]>v)!==(b[1]>v)&&u<(b[0]-a[0])*(v-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside?1:1-smooth(0,.016,distance);
}
export function oblivionHeight(u,v,L){
 const ridge=(x,y,rx,ry,h)=>Math.max(0,1-Math.max(Math.abs((u-x)/rx),Math.abs((v-y)/ry)))*h;
 let height=.1+ridge(-.02,.12,.30,.34,7.1)+ridge(.35,-.06,.34,.25,4.8)+ridge(1.03,.13,.26,.38,11)+ridge(.88,-.06,.2,.3,9)+ridge(-.06,1.03,.26,.27,5.6)+ridge(1.04,.99,.22,.25,7.5);
 const canyonX=.66+.39*(.62-v),distance=Math.abs(u-canyonX);
 const cut=(1-smooth(.105,.26,distance))*smooth(.20,.40,v)*(1-smooth(1.05,1.26,v));
 // A shallow open ravine reads as terrain beneath the bridge, rather than a pit.
 height-=cut*(3.2+.35*Math.sin(v*9));
 if(height>1)height=.1+Math.floor(height/1.15)*1.15;
 const courtyard=1-smooth(.86,1.35,Math.max(Math.abs((u-.155)/.115),Math.abs((v-.84)/(L.mobile?.042:.125))));
 height=height*(1-courtyard)+.1*courtyard;
 const abbey=1-smooth(.75,1.3,Math.max(Math.abs((u-.80)/.08),Math.abs((v-(L.mobile?.18:.30))/(L.mobile?.04:.11))));
 height=height*(1-abbey)+2.55*abbey;
 const white=Math.max(whiteMask(u,v,L),L.mobile?0:plateauMask(u,v));
 return{height:.1+(height-.1)*(1-white)**2,white,river:10};
}
