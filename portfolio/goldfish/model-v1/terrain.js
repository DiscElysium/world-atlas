import * as THREE from '../../vendor/three.module.js';
import {C,hash,coastZ,coastDistance,goldfishHeight,smooth,polygonDistance,stairContains} from './plan.mjs?v=eed7fff475f6';
import {terrainField,routeDistance} from './landform.mjs?v=eed7fff475f6';

export function buildGround(f,p){
 const g=f.group('01 · Continuous coastal landscape'),field=terrainField(p),positions=[],colours=[];
 const sand=new THREE.Color(C.sand),wet=new THREE.Color('#c7b69b'),limestone=new THREE.Color('#e6ddc8'),rock=new THREE.Color('#b9b2a0');
 for(let k=0;k<field.indices.length;k+=3){
  const v=field.indices.slice(k,k+3).map(i=>field.vertices[i]),x=(v[0][0]+v[1][0]+v[2][0])/3,z=(v[0][2]+v[1][2]+v[2][2])/3,y=(v[0][1]+v[1][1]+v[2][1])/3,d=coastDistance(x,z);
  if(p.stairs.some(q=>stairContains(x,z,q)))continue;
  const a=new THREE.Vector3(...v[0]),b=new THREE.Vector3(...v[1]),c=new THREE.Vector3(...v[2]),normal=b.sub(a).cross(c.sub(a)).normalize(),slope=1-Math.abs(normal.y);
  const colour=sand.clone().lerp(wet,1-smooth(.25,2.1,d)).lerp(limestone,smooth(.5,1.25,y)*.7).lerp(rock,smooth(.025,.24,slope)*.72);
  const variation=(polygonDistance(x,z,p.reading)<0?.016:.052);colour.multiplyScalar(1+(hash(x,z,16)-.5)*variation);
  for(const q of v){positions.push(...q);colours.push(colour.r,colour.g,colour.b);}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geo.computeVertexNormals();
 const land=f.mesh(geo,'#ffffff',g,{vertexColors:true,name:'goldfish continuous landform'});land.name='Shared faceted upland, clearing, dunes, wet shore and seabed';land.userData.terrainSurface=true;
 // These structural stairs sit inside excavated slopes, with no raised
 // polygon pedestal surrounding the reading area.
 for(const q of p.stairs){
  const steps=f.group(q.id+' · hillside staircase',g),length=q.run/q.steps;
  for(let i=0;i<q.steps;i++){const top=q.high-(q.high-q.low)*(i+1)/q.steps+.002,along=(i+.5)*length,x=q.start[0]+q.direction[0]*along,z=q.start[1]+q.direction[1]*along,bottom=q.low-.09,size=q.direction[0]?[length,top-bottom,q.width]:[q.width,top-bottom,length];f.box('Structural '+q.id+' step '+(i+1),size,[x,(top+bottom)/2,z],'#e2d6bf',steps,{bevel:false});}
 }
 // Stepped retaining cheeks expose the stair cut and follow each tread.
 // They are structural sides, not a flat cap over the staircase.
 for(const q of p.stairs)for(let i=0;i<q.steps;i++)for(const side of [-1,1]){
  const along=(i+.5)*q.run/q.steps,cross=side*(q.width/2+.12),x=q.start[0]+q.direction[0]*along+q.direction[1]*cross,z=q.start[1]+q.direction[1]*along-q.direction[0]*cross,top=q.high-(q.high-q.low)*(i+1)/q.steps+.23,bottom=q.low-.14,h=top-bottom;
  const block=f.box('Stepped retaining cheek · '+q.id,[.24,h,q.run/q.steps-.014],[x,bottom+h/2,z],i%2?'#d6c7ae':'#e6d9c0',g,{bevel:false});block.rotation.y=Math.atan2(q.direction[0],q.direction[1]);
  const cap=f.box('Stone stair side coping · '+q.id,[.29,.07,q.run/q.steps+.005],[x,top+.035,z],'#eee2cb',g,{bevel:false});cap.rotation.y=block.rotation.y;
 }
 // Embedded rock shoulders and gravel anchor the landforms at scene scale.
 const outcrops=[[-18.6,-4.5,2.5,.65],[-17.1,5.1,2.1,.62],[-8.1,-6.9,1.6,.42],[-6.3,11.5,1.8,.42],[9.7,8.1,1.45,.35],[13.2,6.5,1.8,.42]];
 for(const [n,[x,z,w,h]] of outcrops.entries())for(let j=0;j<5;j++){const xx=x+(hash(n,j,8)-.5)*w,zz=z+(hash(j,n,9)-.5)*w*.72,s=.35+hash(j,n,12)*.45,yy=goldfishHeight(xx,zz,p);if(p.stairs.some(q=>stairContains(xx,zz,q,w*s*.48+.15)))continue;const b=f.ball('Embedded angular rock shoulder',[w*s*.46,h*(.6+hash(n,j)),w*s*.37],[xx,yy+h*.20,zz],j%2?'#bcb4a5':'#aaa394',g);b.rotation.y=hash(j,n,6)*3;}
 const gravelCount=p.mobile?44:86;
 for(let i=0;i<gravelCount;i++){const x=-17+hash(i,23)*36,z=coastZ(x)+.8+hash(i,27)*2.6,s=.08+Math.pow(hash(i,32),3)*.42,y=goldfishHeight(x,z,p);if(p.stairs.some(q=>stairContains(x,z,q,s*1.3+.12)))continue;if(routeDistance(x,z,[p.boardwalk.start[0],p.boardwalk.start[2]],[p.boardwalk.end[0],p.boardwalk.end[2]])<p.boardwalk.width/2+s+.12)continue;const rock=f.ball('Embedded coastal scree',[s*1.25,s*.65,s],[x,y+s*.23,z],i%3?'#bcb4a5':'#aaa394',g);rock.rotation.y=hash(i,28)*Math.PI;}
 g.userData.heightField='shared';g.userData.elevations={...p.levels};g.userData.continuousLandscape=true;return g;
}
