import * as THREE from '../vendor/three.module.js';
import {smooth,seeded} from '../map-model.mjs?v=eed7fff475f6';
import {shoreDistance} from './plan.mjs?v=eed7fff475f6';
import {buildFlowOcean} from './ocean.js?v=eed7fff475f6';
import {FLOW_COLORS as C} from './palette.mjs?v=eed7fff475f6';
function part(root,id,name){const g=new THREE.Group();g.name='FLOW · '+name;g.userData={moduleId:id,name};root.add(g);return g;}
export function buildFlowWater(root,plan,animate){
 const river=part(root,'water','连续河流'),head=part(root,'headwater','融水源与细流'),time={value:0};animate(t=>time.value=t);
 const cut=plan.river.findIndex(q=>shoreDistance(q.x,q.z,plan)<-.95),path=cut<0?plan.river:plan.river.slice(0,cut+2),p=[],uv=[],colors=[],coast=[],faces=[],headFaces=[],n=10;
 for(let i=0;i<path.length;i++){
  const a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)],q=path[i],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;
  for(let j=0;j<=n;j++){const t=j/n,k=t*2-1,width=q.width*(.09+.91*smooth(0,.021,q.t))*(1+.07*Math.sin(q.t*39)),x=q.x+dz/l*width*k,z=q.z-dx/l*width*k,bank=smooth(.15,1,Math.abs(k)),d=shoreDistance(x,z,plan),estuary=1-smooth(0,1.8,d),c=new THREE.Color(C.river).lerp(new THREE.Color(C.riverEdge),bank*.70).lerp(new THREE.Color(C.shallow),estuary*.78).multiplyScalar(.99+.012*Math.sin(i*2.3+j));p.push(x,q.y+.013*(1-estuary),z);uv.push(t,q.t);colors.push(c.r,c.g,c.b);coast.push(Math.max(0,-d));}
  if(i<path.length-1)for(let j=0;j<n;j++){const v=i*(n+1)+j,out=q.t<.24?headFaces:faces;out.push(v,v+n+1,v+1,v+1,v+n+1,v+n+2);}
 }
 for(const[group,index,name]of[[river,faces,'Cyan river · shallow angular banks'],[head,headFaces,'Continuous alpine meltwater']]){
  const fp=[],fc=[],fu=[],fs=[],random=seeded(648129);for(let i=0;i<index.length;i+=3){const ids=index.slice(i,i+3),variation=.994+random()*.012,color=[0,1,2].map(k=>ids.reduce((sum,j)=>sum+colors[j*3+k],0)/3*variation);for(const j of ids){fp.push(...p.slice(j*3,j*3+3));fc.push(...color);fu.push(...uv.slice(j*2,j*2+2));fs.push(coast[j]);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(fp,3));g.setAttribute('color',new THREE.Float32BufferAttribute(fc,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(fu,2));g.setAttribute('aRiverSea',new THREE.Float32BufferAttribute(fs,1));g.computeVertexNormals();
  const m=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.94,metalness:0,transparent:true,depthWrite:false,side:THREE.DoubleSide});m.defines={USE_UV:''};m.onBeforeCompile=s=>{s.uniforms.uFlowTime=time;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute float aRiverSea;varying float vRiverSea;').replace('#include <begin_vertex>','#include <begin_vertex>\nvRiverSea=aRiverSea;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform float uFlowTime;varying float vRiverSea;').replace('#include <color_fragment>','#include <color_fragment>\nfloat ripple=pow(max(0.,sin(vUv.y*184.-uFlowTime*.80+vUv.x*11.)),28.);diffuseColor.rgb*=1.-ripple*.018;').replace('#include <alphatest_fragment>','diffuseColor.a*=1.-smoothstep(.14,.85,vRiverSea);\n#include <alphatest_fragment>');};m.customProgramCacheKey=()=> 'flow-water-v8';const mesh=new THREE.Mesh(g,m);mesh.name=name;mesh.receiveShadow=true;mesh.renderOrder=10;group.add(mesh);
 }
 const foam=new THREE.MeshBasicMaterial({color:C.foam,transparent:true,opacity:.34,depthWrite:false,toneMapped:false});
 for(let i=10;i<path.length-5;i+=17){const q=path[i],b=path[i+2],dx=b.x-q.x,dz=b.z-q.z,l=Math.hypot(dx,dz)||1,nx=dz/l,nz=-dx/l,side=i%2?.24:-.29,a=new THREE.Vector3(q.x+nx*q.width*side,q.y+.025,q.z+nz*q.width*side),c=new THREE.Vector3(b.x+nx*b.width*side,b.y+.025,b.z+nz*b.width*side),m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a,c),2,.007,3,false),foam);m.renderOrder=11;(q.t<.24?head:river).add(m);}
 river.userData.monotonicLevels=true;river.userData.modeledParts=river.children.length;head.userData.modeledParts=head.children.length;return[river,head,buildFlowOcean(root,plan,animate)];
}
