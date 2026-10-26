import * as THREE from '../vendor/three.module.js';

export function seeded(seed=171){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
export const smooth=(a,b,x)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
function startCube(){return[
 [v(-.5,0,-.5),v(-.5,0,.5),v(-.5,1,.5),v(-.5,1,-.5)],
 [v(.5,0,.5),v(.5,0,-.5),v(.5,1,-.5),v(.5,1,.5)],
 [v(-.5,0,-.5),v(.5,0,-.5),v(.5,0,.5),v(-.5,0,.5)],
 [v(-.5,1,.5),v(.5,1,.5),v(.5,1,-.5),v(-.5,1,-.5)],
 [v(.5,0,-.5),v(-.5,0,-.5),v(-.5,1,-.5),v(.5,1,-.5)],
 [v(-.5,0,.5),v(.5,0,.5),v(.5,1,.5),v(-.5,1,.5)]
];}
export function cutSolid(planes){
 let faces=startCube();
 for(const [nx,ny,nz,d] of planes){
  const normal=v(nx,ny,nz),cap=[],next=[];
  for(const face of faces){const out=[];
   for(let i=0;i<face.length;i++){
    const a=face[i],b=face[(i+1)%face.length],da=normal.dot(a)-d,db=normal.dot(b)-d;
    if(da<=.000001)out.push(a.clone());
    if((da>0)!==(db>0)){const p=a.clone().lerp(b,da/(da-db));out.push(p);if(!cap.some(q=>q.distanceToSquared(p)<1e-10))cap.push(p.clone());}
   }
   if(out.length>=3)next.push(out);
  }
  if(cap.length>=3){
   const center=cap.reduce((s,p)=>s.add(p),v(0,0,0)).divideScalar(cap.length),n=normal.clone().normalize();
   const axis=(Math.abs(n.y)<.8?v(0,1,0):v(1,0,0)).cross(n).normalize(),other=n.clone().cross(axis);
   cap.sort((a,b)=>Math.atan2(a.clone().sub(center).dot(other),a.clone().sub(center).dot(axis))-Math.atan2(b.clone().sub(center).dot(other),b.clone().sub(center).dot(axis)));
   next.push(cap);
  }
  faces=next;
 }
 const positions=[],normals=[];
 for(const face of faces){const n=face[1].clone().sub(face[0]).cross(face[2].clone().sub(face[0])).normalize();
  for(let i=1;i<face.length-1;i++)for(const p of [face[0],face[i],face[i+1]]){positions.push(...p.toArray());normals.push(...n.toArray());}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.userData.faceCount=faces.length;g.computeBoundingBox();return g;
}
export function stoneGeometry(kind='boulder',seed=1){
 const r=seeded(seed),planes=[];
 const bevel=kind==='cube'?.12:.22;
 for(const x of [-1,1])for(const z of [-1,1])planes.push([x*(.86+r()*.28),kind==='cube'?0:-.12+r()*.29,z*(.86+r()*.28),1-bevel-r()*.16]);
 if(kind!=='cube')planes.push([1,.12+r()*.2,.07,.61],[-1,.1,-.09,.57],[.09,.23,1,.62],[-.08,.16,-1,.61]);
 if(kind==='slab')planes.push([-.65,1,.20,.84],[.75,1,-.18,.88],[.24,.17,-1,.61]);
 else if(kind==='wedge')planes.push([.85,.8,.1,.86],[-.1,1,.65,.96],[-1,.3,-.2,.66]);
 else if(kind==='outcrop')planes.push([-.35,1,-.35,.84],[.15,1,.65,.91],[.75,.35,.4,.67]);
 else if(kind==='shard')planes.push([.65,.8,.3,.68],[-.3,1,-.4,.72],[-.65,.35,.4,.55]);
 else if(kind==='cube')planes.push([.1,1,-.07,.97],[1,.22,.42,.76],[-.45,.25,-1,.77]);
 else for(const [x,z] of [[1,.3],[-.6,1],[-1,-.3],[.5,-1]])planes.push([x*.46,1,z*.46,.93+r()*.14]);
 return cutSolid(planes);
}
export function prism(polygon,bottom,top){
 const positions=[];const add=(a,b,c)=>positions.push(...a,...b,...c);
 const center=polygon.reduce((s,p)=>[s[0]+p[0]/polygon.length,s[1]+p[1]/polygon.length],[0,0]);
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length];
  add([center[0],top,center[1]],[b[0],top,b[1]],[a[0],top,a[1]]);
  add([a[0],bottom,a[1]],[a[0],top,a[1]],[b[0],top,b[1]]);
  add([a[0],bottom,a[1]],[b[0],top,b[1]],[b[0],bottom,b[1]]);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;
}
export function mergeMeshes(group,name='merged'){
 group.updateMatrixWorld(true);const byMaterial=new Map();
 const origin=group.matrixWorld.clone().invert();
 group.traverse(o=>{if(!o.isMesh||Array.isArray(o.material)||o.userData.noMerge)return;
  const transform=new THREE.Matrix4().multiplyMatrices(origin,o.matrixWorld),g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(transform);
  if(!byMaterial.has(o.material))byMaterial.set(o.material,[]);byMaterial.get(o.material).push({g,o});
 });
 for(const [material,list] of byMaterial){const p=[],n=[];for(const {g,o} of list){p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);o.removeFromParent();g.dispose();}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));const m=new THREE.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;group.add(m);
 }
}
export function createForms(root){
 const materials=new Map(),geometries=new Map();
 function mat(color,options={}){const key=color+JSON.stringify(options);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.94,flatShading:true,...options}));return materials.get(key);}
 function mesh(parent,geo,color,pos=[0,0,0],scale=[1,1,1],name=''){const m=new THREE.Mesh(geo,mat(color));m.position.set(...pos);m.scale.set(...scale);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function group(name,parent=root,pos=[0,0,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);parent.add(g);return g;}
 function box(parent,color,size,pos,bevel=.06,name=''){const key='box'+bevel;if(!geometries.has(key)){const planes=[];for(const x of [-1,1])for(const z of [-1,1])planes.push([x,0,z,1-bevel]);for(const x of [-1,1])planes.push([x,.35,0,.85-bevel]);for(const z of [-1,1])planes.push([0,.35,z,.85-bevel]);geometries.set(key,cutSolid(planes));}return mesh(parent,geometries.get(key),color,[pos[0],pos[1]-size[1]/2,pos[2]],size,name);}
 function beam(parent,color,a,b,radius,segments=6){const av=v(...a),bv=v(...b),d=bv.clone().sub(av),g=new THREE.CylinderGeometry(radius,radius,d.length(),segments);const m=mesh(parent,g,color,av.add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(v(0,1,0),d.normalize());return m;}
 return{root,mat,mesh,box,beam,group,materials,geometries};
}
