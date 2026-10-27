// One sampled landscape for the sea floor, sand slopes, inland relief and
// inhabited clearings. Props query the same triangles that are rendered.
import {coastDistance,polygonDistance,smooth,clamp,hash,stairHeight} from './plan.mjs?v=03bcba9148dc';

const fields=new WeakMap();
function rectangleDistance(x,z,q){
 const a=q.angle||0,dx=x-q.x,dz=z-q.z,u=dx*Math.cos(a)-dz*Math.sin(a),v=dx*Math.sin(a)+dz*Math.cos(a);
 return Math.max(Math.abs(u)-q.w/2,Math.abs(v)-q.d/2);
}
export function routeDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
function raisedOval(x,z,q){const [cx,cz,rx,rz,h]=q,r=Math.hypot((x-cx)/rx,(z-cz)/rz);return r<1?h*(1-smooth(.12,1,r)):0;}

export function designHeight(x,z,p){
 const d=coastDistance(x,z);
 if(d<0)return -.025-Math.min(1.4,-d*.10);
 const level=p.levels;
 if(d<.8)return level.wetSand*smooth(0,.8,d);
 let y=level.wetSand+(level.drySand-level.wetSand)*smooth(.8,2.25,d);
 // The shore is a broad inclined strip, rising into a inhabited inland ridge.
 y+=(level.reading-level.drySand)*smooth(2.8,5.6,d);
 y+=(level.terrace-level.reading)*smooth(7,20,-x)*smooth(1.5,5.0,d);
 for(const q of p.landforms.ridges)y+=raisedOval(x,z,q)*smooth(1.1,3,d);
 // Small dune shoulders follow the coast; no colour-dependent geometry.
 for(const q of p.landforms.dunes)y+=raisedOval(x,z,q);
 const grain=(Math.sin(x*.71+z*.29)*Math.sin(z*.81-x*.23)+Math.sin(x*1.31-z*.74)*.3)*.055;
 y+=grain*smooth(1,3,d)*2;y=Math.min(level.terrace,y);
 // Only the occupied footprints are level. Their surroundings remain sloped.
 for(const [a,b,width] of p.routes){const weight=1-smooth(width/2+.20,width/2+1.15,routeDistance(x,z,a,b));y+=(level.reading-y)*weight;}
 const readingWeight=1-smooth(.65,2.1,polygonDistance(x,z,p.reading));y+=(level.reading-y)*readingWeight;
 const seatDist=rectangleDistance(x,z,{x:0,z:-1.7,w:6.0,d:2.6});y+=(level.reading-y)*(1-smooth(.35,1.3,seatDist));
 for(const q of p.landforms.pads){const r=rectangleDistance(x,z,q),weight=1-smooth(.35,q.blend,r);y+=(q.y-y)*weight;}
 // A dry landing meets the boardwalk without a detached platform.
 const start=p.boardwalk.start,r=Math.hypot((x-start[0])/.65,(z-start[2])/.7);y+=(level.drySand-y)*(1-smooth(.7,1.8,r));
 // A sandy access cut passes through the dune bank beneath the timber deck.
 const end=p.boardwalk.end,dx=end[0]-start[0],dz=end[2]-start[2],t=clamp(((x-start[0])*dx+(z-start[2])*dz)/(dx*dx+dz*dz)),access=routeDistance(x,z,[start[0],start[2]],[end[0],end[2]]);
 y+=((start[1]+(end[1]-start[1])*t)-y)*(1-smooth(p.boardwalk.width*.55,p.boardwalk.width*.55+.9,access));
 for(const q of [{...p.room,w:p.room.width,d:p.room.depth},...p.houses]){const r=rectangleDistance(x,z,q);y+=(q.y-y)*(1-smooth(.16,.38,r));}
 // Landings and the banks are shaped together. The renderer removes every
 // triangle inside the exact stair aperture; no hillside runs through treads.
 for(const q of p.stairs){
  const dx=x-q.start[0],dz=z-q.start[1],along=dx*q.direction[0]+dz*q.direction[1],across=Math.abs(dx*q.direction[1]-dz*q.direction[0]),edge=across-q.width/2;
  if(along>=-.75&&along<=q.run+.75&&edge<.85){
   const target=along<0?q.high:along>q.run?q.low:q.high+(q.low-q.high)*along/q.run,weight=(1-smooth(.10,.85,edge))*(1-smooth(.45,.75,Math.max(-along,along-q.run)));
   y+=(target-y)*weight;
  }
 }
 return y;
}

function makeField(p){
 const densityX=p.mobile?48:72,densityZ=p.mobile?42:60,w=p.extent.width,d=p.extent.depth,vertices=[],indices=[],fixedX=new Set([-w/2,w/2]),fixedZ=new Set([-d/2,d/2]);
 for(const q of p.landforms.pads)for(const sx of [-1,1])for(const sz of [-1,1]){const a=q.angle||0,u=sx*(q.w/2+.1),v=sz*(q.d/2+.1);fixedX.add(q.x+u*Math.cos(a)+v*Math.sin(a));fixedZ.add(q.z-u*Math.sin(a)+v*Math.cos(a));}
 for(const q of [{...p.room,w:p.room.width,d:p.room.depth},...p.houses])for(const sx of [-1,1])for(const sz of [-1,1]){const a=q.angle||0,u=sx*q.w/2,v=sz*q.d/2;fixedX.add(q.x+u*Math.cos(a)+v*Math.sin(a));fixedZ.add(q.z-u*Math.sin(a)+v*Math.cos(a));}
 for(const q of p.stairs)for(const t of [-.45,0,q.run,q.run+.45])for(const s of [-1,1]){fixedX.add(q.start[0]+q.direction[0]*t+q.direction[1]*s*q.width/2);fixedZ.add(q.start[1]+q.direction[1]*t-q.direction[0]*s*q.width/2);}
 const axis=(size,n,fixed)=>[...fixed,...Array.from({length:n-1},(_,i)=>-size/2+(i+1)*size/n).filter(v=>![...fixed].some(k=>Math.abs(k-v)<.15))].sort((a,b)=>a-b),xs=axis(w,densityX,fixedX),zs=axis(d,densityZ,fixedZ),nx=xs.length-1,nz=zs.length-1;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  const dx=i>0&&i<nx?Math.min(xs[i]-xs[i-1],xs[i+1]-xs[i]):0,dz=j>0&&j<nz?Math.min(zs[j]-zs[j-1],zs[j+1]-zs[j]):0;
  const x=xs[i]+(!fixedX.has(xs[i])?(hash(i,j,31)-.5)*dx*.30:0),z=zs[j]+(!fixedZ.has(zs[j])?(hash(i,j,42)-.5)*dz*.30:0);vertices.push([x,designHeight(x,z,p),z]);
 }
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const a=j*(nx+1)+i,b=a+1,c=a+nx+1,e=c+1;
  if((i+j)%2)indices.push(a,c,b,b,c,e);else indices.push(a,c,e,a,e,b);
 }
 return{vertices,indices,nx,nz,w,d,xs,zs};
}
export function terrainField(p){if(!fields.has(p))fields.set(p,makeField(p));return fields.get(p);}
export function meshHeight(x,z,p){
 const field=terrainField(p),{vertices,indices,nx,nz,xs,zs}=field;
 const cell=(axis,v)=>{let a=0,b=axis.length-1;while(b-a>1){const mid=(a+b)>>1;if(axis[mid]>v)b=mid;else a=mid;}return a;},ix=cell(xs,x),iz=cell(zs,z);
 for(let j=Math.max(0,iz-1);j<=Math.min(nz-1,iz+1);j++)for(let i=Math.max(0,ix-1);i<=Math.min(nx-1,ix+1);i++)for(let k=0;k<2;k++){
  const at=(j*nx+i)*6+k*3,a=vertices[indices[at]],b=vertices[indices[at+1]],c=vertices[indices[at+2]],den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]),u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den;
  if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)return u*a[1]+v*b[1]+(1-u-v)*c[1];
 }
 return designHeight(x,z,p);
}
export function groundHeight(x,z,p){for(const q of p.stairs){const y=stairHeight(x,z,q);if(y!==null)return y;}return meshHeight(x,z,p);}
