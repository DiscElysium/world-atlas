import * as THREE from '../../vendor/three.module.js';
import {seeded,smooth,prism,mergeMeshes} from '../geometry.js?v=03bcba9148dc';

export const READING_Y=.65;
export const TABLE_POLYGON=[[-11.3,-9],[1.5,-9],[1.5,-1.4],[.5,1.1],[-8.7,1.1],[-11.3,-1.1]];
export const RUIN_POLYGON=[[6,-9],[17,-9],[17,-3.1],[14,-1.7],[7,-1.7],[6,-4]];
export function inside(x,z,p){let hit=false;for(let i=0;i<p.length;i++){const[a,b]=p[i],[c,d]=p[(i+1)%p.length];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)hit=!hit;}return hit;}
export function floorHeightAt(x,z){return READING_Y-.2*smooth(13,18,Math.abs(z));}
export function surfaceHeightAt(x,z){return inside(x,z,TABLE_POLYGON)?1.35:inside(x,z,RUIN_POLYGON)?1.8:floorHeightAt(x,z);}
function clip(poly,nx,nz,d){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*nx+a[1]*nz-d,db=b[0]*nx+b[1]*nz-d;if(da<=0)out.push(a);if((da>0)!==(db>0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;}
function paving(forms,parent,bounds,y,seed){
 const random=seeded(seed),sites=[],step=2.0;
 for(let z=bounds[2]-.8;z<=bounds[3]+.8;z+=step)for(let x=bounds[0]-.8;x<=bounds[1]+.8;x+=step)sites.push([x+(random()-.5)*1.18,z+(random()-.5)*1.18]);
 let count=0;
 for(const[x,z]of sites){let p=[[bounds[0],bounds[2]],[bounds[1],bounds[2]],[bounds[1],bounds[3]],[bounds[0],bounds[3]]];
  for(const[qx,qz]of sites){const dx=qx-x,dz=qz-z;if(dx*dx+dz*dz<.001||dx*dx+dz*dz>30)continue;p=clip(p,dx,dz,(qx*qx+qz*qz-x*x-z*z)/2);if(p.length<3)break;}
  if(p.length<3)continue;const cx=p.reduce((s,q)=>s+q[0]/p.length,0),cz=p.reduce((s,q)=>s+q[1]/p.length,0);
  if(!bounds.polygon&&(inside(cx,cz,TABLE_POLYGON)||inside(cx,cz,RUIN_POLYGON)))continue;
  if(bounds.polygon){for(let i=0;i<bounds.polygon.length;i++){const a=bounds.polygon[i],b=bounds.polygon[(i+1)%bounds.polygon.length];p=clip(p,b[1]-a[1],a[0]-b[0],(b[1]-a[1])*a[0]+(a[0]-b[0])*a[1]);}}
  if(p.length<3)continue;p=p.map(q=>[cx+(q[0]-cx)*.994,cz+(q[1]-cz)*.994]);
  const top=typeof y==='function'?y(cx,cz):y;
  const colors=['#efe7d7','#f0e9db','#eae3d4','#f3ecdc','#ece3d1'];
  const m=forms.mesh(parent,prism(p,top-.028,top+.007),colors[Math.floor(random()*colors.length)]);m.castShadow=false;count++;
 }
 parent.userData.pavingCells=count;mergeMeshes(parent,'irregular-paving');return count;
}
export function buildFoundation(forms,{mobile=false}={}){
 const root=forms.group('01 · continuous foundation');root.userData.moduleId='foundation';
 const positions=[],nx=48,nz=36;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=i-24,z=j-18;for(const[a,b]of [[x,z],[x,z+1],[x+1,z+1],[x,z],[x+1,z+1],[x+1,z]])positions.push(a,floorHeightAt(a,b)-.028,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();const base=forms.mesh(root,g,'#d6cbb8');base.name='unbroken terrain substrate';base.castShadow=false;
 const floor=forms.group('common polygon stone court',root);paving(forms,floor,[-24,24,-18,18],floorHeightAt,821);
 const tablePolygon=mobile?[[-11.3,-9],[6.5,-9],[6.5,-1.4],[5.5,1.1],[-8.7,1.1],[-11.3,-1.1]]:TABLE_POLYGON;
 const table=forms.group('raised table terrace',root);forms.mesh(table,prism(tablePolygon,.62,1.35),'#dcd4c4');const tb=[-11.3,mobile?6.5:1.5,-9,1.1];tb.polygon=tablePolygon;paving(forms,table,tb,1.35,318);
 const ruin=forms.group('raised ruin terrace',root);forms.mesh(ruin,prism(RUIN_POLYGON,.62,1.8),'#d8d0c0');const rb=[6,17,-9,-1.7];rb.polygon=RUIN_POLYGON;paving(forms,ruin,rb,1.8,917);
 // Local short stairs connect each raised footprint to the shared plaza.
 for(let i=0;i<3;i++){const z=1.1+i*.55,h=(3-i)*.70/3;forms.box(root,'#e6dfd0',[4.1,h,.57],[mobile?-1.2:-6.2,.65+h/2,z+.27],.025,'table stair '+i);}
 for(let i=0;i<5;i++){const h=(5-i)*1.15/5;forms.box(root,'#e2d9c8',[4.7,h,.56],[10.7,.65+h/2,-1.7+i*.54+.27],.035,'portico stair '+i);}
 const connection=forms.group('table-to-portico connecting stair',root);
 if(!mobile)for(let i=0;i<3;i++){const top=1.50+i*.15;forms.box(connection,'#dfd6c4',[1.52,top-.65,3.5],[2.25+i*1.5,.65+(top-.65)/2,-3.9],.018,'cross-court step '+i);}
 root.userData.connectedTerraces=true;
 root.userData.moduleBounds={core:[36,24],continuous:[48,36],readingY:.65,tableY:1.35,ruinY:1.8};return root;
}
