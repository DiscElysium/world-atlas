import * as THREE from './vendor/three.module.js';
import {tennisMaterial} from './tennis-materials.js?v=eed7fff475f6';

export const TENNIS_COLORS={white:'#f7f7f3',stone:'#e2e3dc',orange:'#ed702c',blue:'#235fce',dark:'#3c494d',lime:'#d4e744',skin:'#dcb996'};
export function tennisForms(root){
 const materials=new Map(),geometries=new Map();
 function material(color,options={}){const key=color+JSON.stringify(options);if(!materials.has(key))materials.set(key,tennisMaterial(color,options));return materials.get(key)}
 function group(name,parent=root){const g=new THREE.Group();g.name=name;parent.add(g);return g}
 function mesh(geometry,color,parent=root,options={}){const m=new THREE.Mesh(geometry,material(color,options));m.castShadow=!options.transparent;m.receiveShadow=true;parent.add(m);return m}
 function primitive(kind){if(!geometries.has(kind))geometries.set(kind,kind==='box'?new THREE.BoxGeometry(1,1,1):kind==='ball'?new THREE.IcosahedronGeometry(1,1):kind==='rock'?new THREE.IcosahedronGeometry(1,0):new THREE.CylinderGeometry(1,1,1,8));return geometries.get(kind)}
 function box(size,position,color=TENNIS_COLORS.white,parent=root,options={}){const m=mesh(primitive('box'),color,parent,options);m.scale.set(...size);m.position.set(...position);return m}
 function ball(radius,position,color,parent=root,options={}){const m=mesh(primitive('ball'),color,parent,options);m.scale.setScalar(radius);m.position.set(...position);return m}
 function beam(a,b,r,color,parent=root,options={},endRadius=r){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(from);const m=mesh(new THREE.CylinderGeometry(endRadius,r,d.length(),7),color,parent,options);m.position.copy(from.add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m}
 function slab(points,top,bottom,color,parent=root,options={}){const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));const geometry=new THREE.ExtrudeGeometry(shape,{depth:top-bottom,bevelEnabled:false,curveSegments:1});geometry.rotateX(-Math.PI/2);geometry.translate(0,bottom,0);return mesh(geometry,color,parent,options)}
 function ribbon(points,color,radius=.025,parent=root,options={}){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const meshObject=mesh(new THREE.TubeGeometry(curve,80,radius,5,false),color,parent,options);return {mesh:meshObject,curve}}
 function ring(radius,tube,color,parent=root){const m=mesh(new THREE.TorusGeometry(radius,tube,5,48),color,parent);m.rotation.x=-Math.PI/2;return m}
 function stairs(a,b,width,parent=root,count=12){if(a[1]>b[1])[a,b]=[b,a];const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start),run=Math.hypot(delta.x,delta.z),g=group('Stair flight',parent);g.position.copy(start);g.rotation.y=Math.atan2(delta.x,delta.z);for(let i=0;i<count;i++){const y=delta.y*(i+1)/count;box([width,Math.max(.09,y+.08),run/count+.025],[0,(y-.08)/2,(i+.5)*run/count],TENNIS_COLORS.white,g);box([width,.026,run/count*.82],[0,y+.014,(i+.5)*run/count],TENNIS_COLORS.orange,g);}return g}
 // Bake static pieces by material inside each module; retain module boundaries.
 function compact(parent){
  parent.updateMatrixWorld(true);const inverse=parent.matrixWorld.clone().invert(),sets=new Map(),remove=[];let parts=0;
  parent.traverse(o=>{if(!o.isMesh||o.material.transparent||o.userData.dynamic)return;const matrix=inverse.clone().multiply(o.matrixWorld),normalMatrix=new THREE.Matrix3().getNormalMatrix(matrix),g=o.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;if(!p||Array.isArray(o.material))return;
   const key=o.material.uuid;if(!sets.has(key))sets.set(key,{material:o.material,p:[],n:[],uv:[],col:[]});const s=sets.get(key),v=new THREE.Vector3(),normal=new THREE.Vector3(),index=g.index,col=g.attributes.color;
   for(let j=0;j<(index?.count??p.count);j++){const i=index?index.getX(j):j;v.fromBufferAttribute(p,i).applyMatrix4(matrix);s.p.push(v.x,v.y,v.z);if(n)normal.fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize();else normal.set(0,1,0);s.n.push(normal.x,normal.y,normal.z);s.uv.push(uv?uv.getX(i):0,uv?uv.getY(i):0);s.col.push(col?col.getX(i):1,col?col.getY(i):1,col?col.getZ(i):1)}parts++;remove.push(o);
  });remove.forEach(o=>o.removeFromParent());
  for(const s of sets.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(s.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(s.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(s.uv,2));if(s.material.vertexColors)g.setAttribute('color',new THREE.Float32BufferAttribute(s.col,3));const m=new THREE.Mesh(g,s.material);m.name=parent.name+' · batched geometry';m.castShadow=true;m.receiveShadow=true;parent.add(m)}
  parent.userData.modeledParts=parts;
 }
 return {root,material,group,mesh,box,ball,beam,slab,ribbon,ring,stairs,compact};
}
