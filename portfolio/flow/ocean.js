import * as THREE from '../vendor/three.module.js';
import {FLOW_COLORS as C} from './palette.mjs?v=eed7fff475f6';
import {seaDepth,shoreDistance} from './plan.mjs?v=eed7fff475f6';
// Island II's ocean principles at the portfolio's scale: bathymetry absorption,
// shore-attenuated swell, wind micro-normals and restrained moving foam.
export function buildFlowOcean(root,plan,animate){
 const group=new THREE.Group();group.name='FLOW · 开放海面';group.userData={moduleId:'ocean',name:'开放海面'};root.add(group);
 const nx=74,nz=Math.max(64,Math.round(plan.span/.40)),p=[],field=[],uv=[],faces=[];
 for(let j=0;j<=nz;j++){const z=plan.bounds.top+j/nz*plan.span,start=plan.coastX(z)-.08;for(let i=0;i<=nx;i++){const x=start+(33-start)*i/nx;p.push(x,plan.blueprint?.10:.12,z);field.push(seaDepth(x,z,plan),shoreDistance(x,z,plan));uv.push(x*.33,z*.33);}}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;faces.push(a,c,b,b,c,d);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setAttribute('aSeaField',new THREE.Float32BufferAttribute(field,2));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(faces);geometry.computeVertexNormals();
 const t={value:0},shallow={value:new THREE.Color(C.shallow)},deep={value:new THREE.Color(C.deep)},foam={value:new THREE.Color(C.foam)};
 const material=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.87,metalness:0,side:THREE.DoubleSide});material.defines={USE_UV:''};
 material.onBeforeCompile=s=>{
 s.uniforms.uSeaTime=t;s.uniforms.uShallow=shallow;s.uniforms.uDeep=deep;s.uniforms.uFoam=foam;
 s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 aSeaField; varying vec2 vSeaField; varying vec2 vSeaXZ; uniform float uSeaTime;');
 s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSeaField=aSeaField;vSeaXZ=position.xz;float seaAtten=smoothstep(.03,.80,aSeaField.x);float phase=dot(position.xz,vec2(.88,.47))*1.36-uSeaTime*.54;float phase2=dot(position.xz,vec2(-.42,.91))*2.18-uSeaTime*.71;transformed.y+=seaAtten*(.028*sin(phase)+.011*sin(phase2));');
 s.vertexShader=s.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nfloat a=smoothstep(.03,.80,aSeaField.x);vec2 grad=a*(.028*1.36*cos(dot(position.xz,vec2(.88,.47))*1.36-uSeaTime*.54)*vec2(.88,.47)+.011*2.18*cos(dot(position.xz,vec2(-.42,.91))*2.18-uSeaTime*.71)*vec2(-.42,.91));objectNormal=normalize(vec3(-grad.x,1.,-grad.y));');
 s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform float uSeaTime;uniform vec3 uShallow,uDeep,uFoam;varying vec2 vSeaField;varying vec2 vSeaXZ;');
 s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat broad=sin(vSeaXZ.x*.73+sin(vSeaXZ.y*.64)*1.2)*cos(vSeaXZ.y*.91+sin(vSeaXZ.x*.47));float depthMix=1.-exp(-max(0.,vSeaField.x)*1.65);diffuseColor.rgb=mix(uShallow,uDeep,clamp(depthMix+broad*.055,0.,1.));float coast=max(0.,-vSeaField.y);float shoreBand=(1.-smoothstep(.18,.65,coast))*smoothstep(.01,.09,coast);float foamPhase=sin(coast*14.-uSeaTime*.61+sin(vSeaXZ.y*1.6)*1.9);float shoreFoam=pow(max(0.,foamPhase),8.)*shoreBand*.17;float ribbon=pow(max(0.,sin(dot(vSeaXZ,vec2(.38,.88))*13.-uSeaTime*.36+sin(vSeaXZ.x*.74)*.28)),38.);diffuseColor.rgb=mix(diffuseColor.rgb,uFoam,shoreFoam+ribbon*.003);');
 s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nfloat windA=sin(dot(vSeaXZ,vec2(11.7,5.9))-uSeaTime*.43);float windB=cos(dot(vSeaXZ,vec2(-5.6,14.1))-uSeaTime*.31);normal=normalize(normal+vec3(windA*.028,windB*.021,0.));');
 };
 material.customProgramCacheKey=()=> 'flow-bathymetric-ocean-v7';
 const mesh=new THREE.Mesh(geometry,material);mesh.name='Depth-absorbing sea · shore field and wind texture';mesh.receiveShadow=true;group.add(mesh);
 animate(time=>t.value=time);group.userData.modeledParts=1;group.userData.bathymetry=true;group.userData.sourcePrinciples='Island II OceanProfile';group.userData.seaLevel=plan.blueprint?.10:.12;return group;
}


