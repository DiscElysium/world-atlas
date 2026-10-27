import * as THREE from './vendor/three.module.js';
import {screenPoint} from './map-model.mjs?v=03bcba9148dc';

export function buildViaduct(f,c){
 const mobile=c.L.mobile,A=c.ground(mobile?.94:.53,mobile?.86:.79),B=c.ground(mobile?.94:.875,mobile?.20:.35);
 const dx=B.x-A.x,dz=B.z-A.z,length=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx);
 const bridge=f.group('OBLIVION · Pointed-arch viaduct');bridge.position.set(A.x,0,A.z);bridge.rotation.y=yaw;
 const count=mobile?15:8,span=length/count,width=mobile?1.15:1.6,deck=t=>.92+t*1.63;
 const groundAt=x=>{const u=screenPoint(A.x+dx*x/length,.17,A.z+dz*x/length,c.L);return c.ground(u.u,u.v).y};
 for(let i=0;i<count;i++){
  if(i===Math.floor(count*.55))continue;
  const x=(i+.5)*span,t=x/length,y=deck(t),floor=Math.min(groundAt(i*span),groundAt((i+1)*span))-.22;
  const road=f.box([span+.035,.24,width],[x,y,0],bridge,.83);road.rotation.z=Math.atan2(1.63,length);
  for(const z of [-width/2,width/2]){
   f.beam([i*span,deck(i/count)+.27,z],[(i+1)*span,deck((i+1)/count)+.27,z],.11,.12,bridge,.74);
   f.beam([i*span,deck(i/count)+.63,z],[(i+1)*span,deck((i+1)/count)+.63,z],.065,.08,bridge,.65);
  }
  const arch=f.pointed(span+.14,Math.max(.5,y-.12-floor),width*.87,.16,bridge,.7);arch.position.set(x,floor,-width*.435);
  // The masonry has its own sparse coursing, independent of the terrain edges.
  for(const yy of [y-.42,y-.79])f.segment([i*span+.18,yy,width*.375],[(i+1)*span-.18,yy,width*.375],bridge,.24);
 }
 for(let i=0;i<=count;i++){
  const x=i*span,y=deck(i/count),floor=Math.min(groundAt(x),y-.5),h=y-floor;
  f.box([.44,h+.12,width*.89],[x,floor+h/2,0],bridge,.54);
  f.box([.7,.21,width*1.11],[x,floor+.11,0],bridge,.45);
  f.box([.64,.15,width+.1],[x,y-.13,0],bridge,.65);
  for(const z of [-width/2,width/2]){f.box([.15,.9,.17],[x,y+.46,z],bridge,.82);f.box([.23,.07,.25],[x,y+.95,z],bridge,.65)}
 }
 const mirrors=f.group('OBLIVION · Twin Gothic mirrors',bridge);
 function mirror(t){
  const m=f.group('Gothic mirror · nested spatial echo',mirrors);m.position.set(length*t,deck(t)+.15,0);m.rotation.order='YXZ';m.rotation.y=t<.5?Math.PI/2:-Math.PI/2;m.rotation.x=-.67;
  const panel=f.extrude(f.pointedShape(1.66,3.02),.09,m,.4);panel.position.z=-.04;
  const frame=f.pointed(1.87,3.22,.19,.105,m,.95);frame.position.z=-.025;
  for(const x of [-1.0,1.0]){f.box([.14,3.0,.23],[x,1.5,.035],m,.78);f.box([.28,.17,.31],[x,.07,.035],m,.8);const crown=f.gable(.26,.5,.29,m,.8);crown.position.set(x,2.98,-.11)}
  for(let i=0;i<4;i++){
   const scale=1-i*.17,w=1.38*scale,h=2.32*scale,bottom=.36+i*.16;
   const path=[[-w/2,bottom,.065],[-w/2,bottom+h*.58,.065],[-w*.31,bottom+h*.83,.065],[0,bottom+h,.065],[w*.31,bottom+h*.83,.065],[w/2,bottom+h*.58,.065],[w/2,bottom,.065]];
   f.polyline(path,m,.3+i*.1);f.segment([-w/2,bottom,.065],[w/2,bottom,.065],m,.38);
  }
  f.box([2.25,.18,1.16],[0,-.05,0],m,.75);
 }
 mirror(mobile?.15:.10);mirror(mobile?.84:.90);
 const fragments=f.group('OBLIVION · Dissolving bridge fragments');fragments.position.copy(bridge.position);fragments.rotation.y=yaw;
 const gap=(Math.floor(count*.55)+.5)*span;
 for(let i=0;i<34;i++){
  const x=gap+(c.random()-.5)*span*1.65,y=deck(gap/length)-.3-c.random()*3.4,z=(c.random()-.5)*width*1.8,s=.055+c.random()*.1;
  const piece=f.mesh(new THREE.IcosahedronGeometry(s,0),fragments,.65);piece.position.set(x,y,z);piece.rotation.set(c.random(),c.random(),c.random());
  const initial=piece.position.clone(),angle=piece.rotation.y;c.animate(t=>{piece.position.y=initial.y+Math.sin(t*.65+i)*.06;piece.rotation.y=angle+Math.sin(t*.3+i)*.16});
 }
 return{bridge,A,B,deck};
}
