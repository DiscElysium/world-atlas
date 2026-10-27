import * as THREE from '../../vendor/three.module.js';
import {C,hash} from './plan.mjs?v=eed7fff475f6';
const wallColours=['#eadbc0','#e7d8be','#f0e4cc','#eaddc5'];
function masonry(f,g,w,h,z,open){
 const rows=Math.ceil(h/.43),bw=.73;
 for(let row=0;row<rows;row++)for(let i=0;i<Math.ceil(w/bw)+1;i++){const left=Math.max(-w/2,-w/2+i*bw-(row%2)*bw/2),right=Math.min(w/2,-w/2+(i+1)*bw-(row%2)*bw/2),y=(row+.5)*h/rows;if(right-left<.05)continue;if(open&&left<open.x+open.w/2&&right>open.x-open.w/2&&y>open.bottom&&y<open.top)continue;f.box('Individual cream masonry block',[right-left-.012,h/rows-.012,.18],[(left+right)/2,y,z],wallColours[(i+row)%4],g);}
}
function windowKit(f,g,x,y,z,w=1.1,h=1.35){
 const glass=f.box('Blue glass panes',[w-.09,h-.09,.028],[x,y,z-.02],'#74acc5',g,{roughness:.25,bevel:false});
 for(const dx of [-w/2,0,w/2])f.box('Painted blue window mullion',[.055,h+.13,.10],[x+dx,y,z+.03],'#367ca0',g);
 for(const dy of [-h/2,0,h/2])f.box('Painted blue window transom',[w+.10,.055,.10],[x,y+dy,z+.03],'#367ca0',g);
 f.box('Window limestone sill',[w+.3,.11,.32],[x,y-h/2-.07,z+.08],C.wall,g);
}
function tiledRoof(f,g,w,d,eave,ridge,cutaway=false){
 const slope=(ridge-eave)/(w/2),sides=cutaway?[-1]:[-1,1];
 for(const side of sides){const roofWidth=cutaway?w*.22:w/2,xc=cutaway?-w/2+roofWidth/2:side*w/4;
  const roof=f.box('Roof timber deck',[roofWidth,.12,d+.25],[xc,ridge-Math.abs(xc)*slope,0],C.woodDark,g,{bevel:false});roof.rotation.z=-side*Math.atan(slope);
  for(let x=0;x<Math.ceil(roofWidth/.34);x++)for(let z=0;z<Math.ceil(d/.45);z++){const xx=cutaway?-w/2+(x+.5)*roofWidth/Math.ceil(roofWidth/.34):side*(x+.5)*roofWidth/Math.ceil(roofWidth/.34),zz=-d/2+(z+.5)*d/Math.ceil(d/.45);const tile=f.mesh(new THREE.CylinderGeometry(.115,.125,.47,6,1,true,0,Math.PI),z%3?'#cc815a':'#b96c46',g);tile.name='Overlapping terracotta roof tile';tile.rotation.z=Math.PI/2;tile.rotation.y=Math.PI/2;tile.position.set(xx,ridge-Math.abs(xx)*slope+.11,zz);}
 }
 f.beam('Roof ridge timber',[0,ridge,-d/2],[0,ridge,d/2],.085,C.woodDark,g);
 if(cutaway){for(const z of [-d/2,d/2]){f.beam('Exposed cutaway roof rafter',[-w/2,eave,z],[0,ridge,z],.065,C.woodDark,g);f.beam('Exposed cutaway roof rafter',[0,ridge,z],[w/2,eave,z],.065,C.woodDark,g);}}
 else for(let z=0;z<Math.ceil(d/.44);z++){const m=f.mesh(new THREE.CylinderGeometry(.14,.14,.46,6,1,true,0,Math.PI),C.roof,g);m.name='Rounded ridge cap tile';m.rotation.z=Math.PI/2;m.rotation.y=Math.PI/2;m.position.set(0,ridge+.15,-d/2+(z+.5)*d/Math.ceil(d/.44));}
}
export function buildStudio(f,p){
 const g=f.group('03 · Artist studio: open shell, tiled roof and window'),q=p.room,room=f.group('Studio on its raised foundation',g);room.position.set(q.x,q.y,q.z);
 f.box('Floor beneath fitted planks',[q.width,.13,q.depth],[0,-.065,0],C.woodDark,room);
 for(let i=0;i<22;i++)f.box('Fitted studio floor plank',[q.width/22-.012,.035,q.depth-.05],[-q.width/2+(i+.5)*q.width/22,.018,0],i%3?'#b79168':'#ad8058',room,{bevel:false});
 masonry(f,room,q.width,q.height,-q.depth/2,{x:-.8,w:1.8,bottom:1.15,top:2.7});windowKit(f,room,-.8,1.93,-q.depth/2+.105,1.8,1.52);
 // Left wall protects the room; right and front are cut away for both cameras.
 const left=f.group('Left return wall',room);left.position.set(-q.width/2,0,0);left.rotation.y=Math.PI/2;masonry(f,left,q.depth,q.height,0,{x:.9,w:.8,bottom:1.2,top:2.6});windowKit(f,left,.9,1.9,.10,.8,1.4);
 for(const x of [-q.width/2,q.width/2]){f.box('Front stone jamb',[.38,q.height,.38],[x,q.height/2,q.depth/2],C.wall,room);f.box('Front lintel corbel',[.60,.22,.55],[x,q.height-.12,q.depth/2],C.wall,room);}
 f.box('Wide open studio lintel',[q.width,.20,.24],[0,q.height,q.depth/2],C.woodDark,room);
 for(let row=0;row<2;row++)for(let z=0;z<7;z++)f.box('Camera-facing cutaway low wall',[.18,.27,q.depth/7-.016],[q.width/2,.135+row*.27,-q.depth/2+(z+.5)*q.depth/7],wallColours[z%4],room);
 tiledRoof(f,room,q.width+.35,q.depth+.28,q.height+.16,q.roof+.16,true);
 f.box('Door threshold',[q.width-.6,.12,.52],[0,.015,q.depth/2+.18],C.wall,room);
 g.userData.rootY=q.y;return g;
}
export function buildVillage(f,p){
 const g=f.group('04 · Coastal architecture framing the scene');
 for(const q of p.houses){const house=f.group(q.id,g);house.position.set(q.x,q.y,q.z);house.rotation.y=q.angle;
  const h=q.flat?2.7:q.h;masonry(f,house,q.w,h,q.d/2,{x:-.7,w:1.0,bottom:1.1,top:2.45});windowKit(f,house,-.7,1.77,q.d/2+.105,1,1.35);
  for(const side of [-1,1]){const wall=f.group('Side masonry',house);wall.position.x=side*q.w/2;wall.rotation.y=Math.PI/2;masonry(f,wall,q.d,h,0);}
  f.box('House back wall',[q.w,h,.18],[0,h/2,-q.d/2],C.wall,house,{bevel:false});
  if(q.flat){f.box('Flat terrace stone roof',[q.w+.1,.16,q.d+.12],[0,h+.08,0],C.wall,house);for(const x of [-q.w/2,q.w/2])f.box('Terrace parapet',[.18,.45,q.d],[x,h+.39,0],C.wall,house);for(const z of [-q.d/2,q.d/2])f.box('Terrace parapet',[q.w,.45,.18],[0,h+.39,z],C.wall,house);
   const upper=f.group('Small upper terrace room',house);upper.position.set(-.7,h+.16,-.65);f.box('Upper cream room',[2.4,1.05,2],[0,.525,0],C.wall,upper);windowKit(f,upper,0,.53,1.03,.65,.75);f.box('Upper roof cap',[2.65,.12,2.2],[0,1.12,0],C.wall,upper);
  }else tiledRoof(f,house,q.w+.35,q.d+.4,h+.10,3.5);
 }
 return g;
}
