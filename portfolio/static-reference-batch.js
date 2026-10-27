import * as THREE from './vendor/three.module.js';
import {mergeGeometries} from './vendor/addons/utils/BufferGeometryUtils.js';

// Baked reference scenery has no per-object movement. Keep the named controls
// and localization surfaces intact, and combine only compatible opaque meshes.
export function batchStaticReference(root,{preserve=mesh=>mesh.name.startsWith('Button'),partitionQuaternion=new THREE.Quaternion(),bandDepth=Infinity}={}){
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),sets=new Map();let before=0,after=0,trianglesBefore=0,trianglesAfter=0;
 root.traverse(mesh=>{
  if(!mesh.isMesh)return;before++;const g=mesh.geometry;trianglesBefore+=(g.index?.count??g.attributes.position.count)/3;
  const m=mesh.material;if(Array.isArray(m)||m.transparent||mesh.isSkinnedMesh||mesh.isInstancedMesh||Object.keys(g.morphAttributes).length||preserve(mesh))return;
  const attributes=Object.entries(g.attributes).map(([name,a])=>name+':'+a.itemSize+':'+a.normalized+':'+a.array.constructor.name).sort().join('|');
  g.computeBoundingBox();const matrix=inverse.clone().multiply(mesh.matrixWorld),bounds=g.boundingBox.clone().applyMatrix4(matrix).applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(partitionQuaternion));
  // Retain large authored surfaces; partition smaller scenery along the route
  // so a visible corner cannot submit an entire offscreen neighboring chapter.
  if(bounds.max.z-bounds.min.z>bandDepth*1.5)return;
  const band=Number.isFinite(bandDepth)?Math.floor((bounds.min.z+bounds.max.z)*.5/bandDepth):0;
  const key=[m.uuid,attributes,!!g.index,mesh.renderOrder,mesh.layers.mask,mesh.castShadow,mesh.receiveShadow,band].join('/');
  if(!sets.has(key))sets.set(key,[]);sets.get(key).push(mesh);
 });
 let batches=0,combined=0;
 for(const meshes of sets.values()){
  if(meshes.length<2)continue;
  const geometries=meshes.map(mesh=>{const geometry=mesh.geometry.clone();geometry.applyMatrix4(inverse.clone().multiply(mesh.matrixWorld));return geometry;});
  const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!geometry)continue;
  geometry.computeBoundingBox();geometry.computeBoundingSphere();const first=meshes[0],batch=new THREE.Mesh(geometry,first.material);batch.name='Static reference batch · '+first.material.name;batch.renderOrder=first.renderOrder;batch.layers.mask=first.layers.mask;batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;batch.userData.staticReferenceBatch=meshes.length;root.add(batch);
  meshes.forEach(mesh=>mesh.removeFromParent());batches++;combined+=meshes.length;
 }
 root.traverse(mesh=>{if(!mesh.isMesh)return;after++;trianglesAfter+=(mesh.geometry.index?.count??mesh.geometry.attributes.position.count)/3;});
 const audit={before,after,batches,combined,trianglesBefore,trianglesAfter,preservedGeometry:trianglesBefore===trianglesAfter};root.userData.staticBatch=audit;return audit;
}

// Remove only triangles already wholly outside the shader's physical chapter
// clip. Keep source vertices/attributes and the complete index for every resize.
// Intersecting triangles still reach the shader, preserving the curved seam.
export function trimStaticBatchToChapter(mesh,bounds,span){
 const geometry=mesh.geometry,position=geometry.attributes.position;if(!geometry.index)return;
 const source=mesh.userData.sourceBatchIndex??=geometry.index,padding=span*.048,lo=bounds.x-padding,hi=bounds.y+padding,e=mesh.matrixWorld.elements;
 const z=new Float64Array(position.count);for(let i=0;i<position.count;i++)z[i]=e[2]*position.getX(i)+e[6]*position.getY(i)+e[10]*position.getZ(i)+e[14];
 let filtered=mesh.userData.chapterBatchIndex;if(!filtered){filtered=new THREE.BufferAttribute(new source.array.constructor(source.count),1);filtered.setUsage(THREE.DynamicDrawUsage);mesh.userData.chapterBatchIndex=filtered;}
 let count=0;const box=new THREE.Box3(),point=new THREE.Vector3();
 for(let i=0;i<source.count;i+=3){const a=source.getX(i),b=source.getX(i+1),c=source.getX(i+2);if((z[a]<lo&&z[b]<lo&&z[c]<lo)||(z[a]>hi&&z[b]>hi&&z[c]>hi))continue;
  filtered.array[count++]=a;filtered.array[count++]=b;filtered.array[count++]=c;
  for(const index of [a,b,c]){point.fromBufferAttribute(position,index).applyMatrix4(mesh.matrixWorld);box.expandByPoint(point);}
 }
 geometry.setIndex(filtered);geometry.setDrawRange(0,count);filtered.needsUpdate=true;
 if(!box.isEmpty()){box.min.z=Math.max(box.min.z,lo);box.max.z=Math.min(box.max.z,hi);}
 mesh.userData.chapterCullBox=box;mesh.userData.chapterTriangles={source:source.count/3,submitted:count/3};
}
