import * as THREE from './vendor/three.module.js';
import {TENNIS_COLORS as C} from './tennis-forms.js?v=03bcba9148dc';

function wovenFence(f,parent,width,height,step=.22){
 const positions=[];
 const segment=(a,b)=>positions.push(...a,...b);
 for(let x=-width/2;x<=width/2+.001;x+=step){segment([x,0,0],[x,height,0]);}
 for(let y=0;y<=height+.001;y+=step)segment([-width/2,y,0],[width/2,y,0]);
 const mesh=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(positions,3)),new THREE.LineBasicMaterial({color:'#778588',transparent:true,opacity:.4}));parent.add(mesh);return mesh;
}
export function buildTennisCourt(f,plan){
 const g=f.group('TennisAtom · Court and equipment');g.position.set(plan.court.x,plan.court.y,plan.court.z);g.rotation.y=plan.court.angle;g.scale.setScalar(plan.scale);
 f.box([plan.apron.width,.10,plan.apron.depth],[0,.05,0],C.orange,g,{surface:'sport'});
 const w=10.97*.52,d=23.77*.52,singles=8.23*.52,service=6.4*.52,paint=.045,y=.128;
 f.box([w+.16,.018,d+.16],[0,.115,0],C.blue,g,{surface:'sport'});
 for(const x of [-w/2,w/2,-singles/2,singles/2])f.box([paint,.012,d],[x,y,0],C.white,g);
 for(const z of [-d/2,d/2])f.box([w,.012,paint],[0,y,z],C.white,g);
 for(const z of [-service,service])f.box([singles,.012,paint],[0,y,z],C.white,g);
 f.box([paint,.012,2*service],[0,y,0],C.white,g);
 for(const z of [-d/2,d/2])f.box([paint,.012,.12],[0,y,z-Math.sign(z)*.10],C.white,g);
 const net=f.group('Taut woven tennis net',g),netWidth=w+.7;
 const positions=[];
 for(let x=-netWidth/2;x<=netWidth/2;x+=.095){const h=.78+.15*(x/(netWidth/2))**2;positions.push(x,.26,0,x,h+.20,0);}
 for(let i=0;i<9;i++){for(let j=0;j<32;j++){const x=-netWidth/2+j/32*netWidth,nx=x+netWidth/32;const a=.26+i*.085+.15*(x/(netWidth/2))**2,b=.26+i*.085+.15*(nx/(netWidth/2))**2;positions.push(x,a,0,nx,b,0)}}
 const wire=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(positions,3)),new THREE.LineBasicMaterial({color:'#344c60',transparent:true,opacity:.82}));net.add(wire);
 f.ribbon(Array.from({length:13},(_,i)=>{const x=-netWidth/2+i/12*netWidth;return[x,.98+.15*(x/(netWidth/2))**2,0]}),C.white,.033,net);
 for(const x of [-netWidth/2,netWidth/2]){f.beam([x,.18,0],[x,1.19,0],.045,C.dark,net);f.ball(.066,[x,1.2,0],C.dark,net);f.box([.15,.03,.15],[x,.195,0],C.white,net)}
 for(const side of [-1,1]){
  const fence=f.group('Side perimeter fence',g);fence.position.set(side*3.60,.13,-2.2);fence.rotation.y=Math.PI/2;
  wovenFence(f,fence,10.3,1.35);for(let i=0;i<=4;i++)f.beam([-5.15+i*2.575,0,0],[-5.15+i*2.575,1.4,0],.025,C.dark,fence);f.beam([-5.15,1.35,0],[5.15,1.35,0],.025,C.dark,fence);
 }
 const far=f.group('Far perimeter fence',g);far.position.set(0,.13,-7.48);wovenFence(f,far,7.2,1.35);for(const x of [-3.6,-1.8,0,1.8,3.6])f.beam([x,0,0],[x,1.4,0],.025,C.dark,far);
 for(const [x,z] of [[-3.5,-6.4],[3.5,-6.4],[-3.5,6.4],[3.5,6.4]]){
  const lamp=f.group('Twin-headed floodlight',g);lamp.position.set(x,.19,z);
  f.box([.30,.08,.30],[0,.04,0],C.white,lamp);f.beam([0,.08,0],[0,3.2,0],.045,C.dark,lamp);
  f.box([.75,.10,.12],[0,3.15,0],C.dark,lamp);for(const dx of [-.26,.26]){f.box([.25,.12,.19],[dx,3.20,0],C.dark,lamp);f.box([.20,.014,.13],[dx,3.13,0],C.white,lamp);}
 }
 const basket=f.group('Ball basket and racket',g);basket.position.set(3.25,.10,1.8);f.box([.46,.30,.38],[0,.51,0],'#a6b1ac',basket,{transparent:true,opacity:.6});
 for(const x of [-.20,.20])for(const z of [-.15,.15])f.beam([x,0,z],[x,.70,z],.018,C.dark,basket);
 for(let i=0;i<14;i++)f.ball(.06,[(i%4)*.095-.15,.6+Math.floor(i/8)*.06,Math.floor(i/4)%2*.11-.05],C.lime,basket);
 for(const side of [-1,1]){const b=f.group('Courtside bench',g);b.position.set(side*3.33,.10,3.8);f.box([.34,.07,1.35],[0,.45,0],C.white,b);for(const z of [-.50,.50])f.box([.27,.45,.07],[0,.22,z],C.dark,b);f.box([.055,.27,1.35],[side*.14,.62,0],C.white,b)}
 g.userData.courtDimensions={width:w,length:d,singlesWidth:singles,serviceDistance:service};return g;
}
