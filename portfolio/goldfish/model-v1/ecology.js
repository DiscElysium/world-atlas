import * as THREE from '../../vendor/three.module.js';
import {C,hash,goldfishHeight,polygonDistance,stairContains} from './plan.mjs?v=eed7fff475f6';
export function plantKit(f){
 const leaf=f.material(C.leaf),light=f.material('#98b477'),dark=f.material('#52764d'),petal=f.material(C.flower),yellow=f.material(C.yellow);
 const petalGeometry=new THREE.OctahedronGeometry(1,0);
 function leaves(g,x,y,z,r=.35,count=7){for(let i=0;i<count;i++){const a=i/count*Math.PI*2+.3,l=r*(1.05+hash(i,x)*1.2),bend=r*(.45+hash(i,z)*.65),w=r*.16,ps=[],ix=[];for(let j=0;j<4;j++){const t=j/3,ww=w*Math.sin((t*.88+.10)*Math.PI)*(1-t*.75);ps.push(bend*t*t,l*t,-ww,bend*t*t-.02*r,l*t+.055*r,0,bend*t*t,l*t,ww);if(j<3){const n=j*3;ix.push(n,n+3,n+1,n+1,n+3,n+4,n+1,n+4,n+2,n+2,n+4,n+5);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));geo.setIndex(ix);geo.computeVertexNormals();const mat=(i%3?leaf:light);mat.side=THREE.DoubleSide;const m=f.mesh(geo,mat,g);m.name='Folded pointed leaf';m.position.set(x,y,z);m.rotation.y=a;}}
 function flower(g,x,y,z,size=.13,sun=false){f.beam('Flower stem',[x,y,z],[x,y+.32,z],.016,dark,g,.009,5);for(let j=0;j<5;j++){const a=j/5*Math.PI*2,m=f.mesh(petalGeometry,sun?yellow:petal,g);m.name='Five-petal flower';m.scale.set(size*.63,.035,size*.95);m.position.set(x+Math.cos(a)*size*.74,y+.33,z+Math.sin(a)*size*.74);m.rotation.y=-a+Math.PI/2;}f.ball('Neutral flower centre',[size*.38,.045,size*.38],[x,y+.355,z],sun?'#825d39':'#f1dfad',g);}
 function pot(g,x,y,z,s=.55){const m=f.mesh(new THREE.CylinderGeometry(s*.42,s*.32,s*.63,8),C.roof,g);m.name='Terracotta flower pot';m.position.set(x,y+s*.315,z);const rim=f.mesh(new THREE.CylinderGeometry(s*.46,s*.46,s*.10,8),C.roof,g);rim.name='Thick pot rim';rim.position.set(x,y+s*.66,z);f.ball('Dark soil',[s*.37,.025,s*.37],[x,y+s*.72,z],'#655345',g);leaves(g,x,y+s*.71,z,s*.7);for(let i=0;i<3;i++)flower(g,x+(i-1)*s*.17,y+s*.82,z+(hash(i,x)-.5)*s*.3,s*.17);}
 return{leaf,light,dark,petal,yellow,leaves,flower,pot};
}
export function buildEcology(f,p){
 const g=f.group('07 · Coastal trees, dune planting and garden flowers'),k=plantKit(f);
 const onStair=(x,z)=>p.stairs.some(q=>stairContains(x,z,q,.35));
 for(const [index,q] of p.trees.entries()){const [x,z,r,h]=q;if(p.mobile&&x>0&&z>6&&x<9)continue;const y=goldfishHeight(x,z,p),tree=f.group('T'+String(index+1).padStart(2,'0')+' · grounded branching tree',g);tree.position.set(x,y,z);
  f.beam('Tapered tree trunk',[0,-.07,0],[.05,h*.67,.025],.13,C.woodDark,tree,.065);
  for(let j=0;j<5;j++){const a=j*2.399+index*.4,bx=Math.cos(a)*r*.65,bz=Math.sin(a)*r*.65,by=h*(.57+hash(j,index)*.23);f.beam('Visible tapered branch',[.02,h*.33,0],[bx,by,bz],.07,C.woodDark,tree,.027);
   for(let c=0;c<3;c++){const cx=bx+(hash(c,j,1)-.5)*r*.8,cz=bz+(hash(c,j,2)-.5)*r*.8,cy=by+(hash(c,j,3)-.1)*r*.55;const crown=f.ball('Angular leaf crown',[r*(.40+hash(j,c)*.18),r*(.38+hash(c,j)*.20),r*(.38+hash(j,c,3)*.20)],[cx,cy,cz],c===0?k.dark:c===1?k.leaf:k.light,tree);crown.rotation.set(hash(j,c)*.4,hash(c,j)*3,.2);}
  }f.ball('Faceted tree crown tip',[r*.45,r*.5,r*.44],[.02,h-r*.30,.01],k.light,tree);
  for(let j=0;j<(p.mobile?4:7);j++){const a=j*2.399,rr=r*(.55+hash(j,index)*.42),xx=x+Math.cos(a)*rr,zz=z+Math.sin(a)*rr;if(polygonDistance(xx,zz,p.reading)<-.25||onStair(xx,zz))continue;const yy=goldfishHeight(xx,zz,p);k.leaves(g,xx,yy,zz,.23,4);k.flower(g,xx,yy+.05,zz,.12,j===0);}
 }
 for(const [i,[x,z]] of p.shrubs.entries()){if(onStair(x,z)||(p.mobile&&polygonDistance(x,z,p.reading)<0))continue;const y=goldfishHeight(x,z,p),r=.35+(i%3)*.1;for(let j=0;j<6;j++){const a=j*2.399;f.ball('Low angular shrub',[r*.58,.20+hash(i,j)*.14,r*.58],[x+Math.cos(a)*r*.6,y+.19,z+Math.sin(a)*r*.6],j%2?k.leaf:k.light,g);}for(let j=0;j<4;j++)k.flower(g,x+(hash(i,j)-.5)*r*1.6,y+.14,z+(hash(j,i)-.5)*r*1.6,.10);}
 for(const [i,[x,z]] of p.grass.entries())if(!onStair(x,z))k.leaves(g,x,goldfishHeight(x,z,p),z,.38+(i%3)*.08,7);
 // Low plant banks follow the landform instead of painting the sand green.
 // Their edge separates the inhabited clearing from the open, pale beach.
 for(const [bank,line] of p.coastalVerge.entries())for(let j=0;j<line.length-1;j++){
  const a=line[j],b=line[j+1],n=p.mobile?3:5;
  for(let i=0;i<n;i++){if(hash(i,j,bank+19)<.38)continue;const t=(i+.4)/n,x=a[0]+(b[0]-a[0])*t+.32+(hash(i,j,bank)-.5)*.35,z=a[1]+(b[1]-a[1])*t-.32,y=goldfishHeight(x,z,p),r=.19+hash(i,j+6)*.16;if(onStair(x,z))continue;
   for(let c=0;c<3;c++)f.ball('Coastal groundcover bank',[r,.17+hash(c,i)*.12,r*.8],[x+(c-1)*r*.65,y+.13,z+(hash(c,j)-.5)*r],c===1?k.dark:k.leaf,g);
   if(i%2===0)k.leaves(g,x,y+.12,z,.27,4);
  }
 }
 for(const line of p.flowers)for(let s=0;s<line.length-1;s++){const a=line[s],b=line[s+1],count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/(p.mobile?.65:.36));for(let i=0;i<count;i++){const t=i/count,x=a[0]+(b[0]-a[0])*t+(hash(i,s)-.5)*.25,z=a[1]+(b[1]-a[1])*t+(hash(s,i)-.5)*.25;if(onStair(x,z)||(p.mobile&&polygonDistance(x,z,p.reading)<-.4&&z>0))continue;k.flower(g,x,goldfishHeight(x,z,p)+.08,z,.10+hash(i,s,3)*.035,i%9===0);if(i%3===0)k.leaves(g,x,goldfishHeight(x,z,p),z,.22,4);}}
 // Vines climb cream walls without recolouring the stone behind them.
 for(const [x,y,z] of [[-14.7,p.room.y+3.05,-2.15],[-9.22,p.room.y+.95,-.4],[-15.65,p.houses[1].y+2.9,p.houses[1].z-1.4],[-10.7,p.houses[0].y+2.9,-4.7]]){
  for(let j=0;j<18;j++){const xx=x+(hash(j,1)-.5)*.9,yy=y-j*.10,zz=z+(hash(j,2)-.5)*.45;f.ball('Trailing wall vine leaf',[.15,.08,.13],[xx,yy,zz],j%3?k.leaf:k.light,g);if(j%3===0)k.flower(g,xx,yy-.18,zz,.08);}
 }
 const roofY=p.houses[0].y+2.86;k.pot(g,-11.5,roofY,-5.0,.65);k.pot(g,-14.6,roofY,-7.65,.65);k.pot(g,-9.2,p.room.y,1.9,.66);k.pot(g,-14.45,p.room.y,2.1,.6);
 return g;
}
