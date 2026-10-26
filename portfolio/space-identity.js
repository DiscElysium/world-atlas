import * as THREE from './vendor/three.module.js';

// Replace a flat printed word using the existing label's own local bounds.
// The parent transformation, paper location and fixed camera stay authored.
export function replaceGroundWordmark(mesh,text,color='#174d94'){
 mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox,size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const axes=['x','y','z'].sort((a,b)=>size[a]-size[b]),normal=axes[0],horizontal=normal==='x'?'z':'x',vertical=normal==='z'?'y':'z';
 const c=document.createElement('canvas');c.width=2048;c.height=Math.max(128,Math.round(2048*size[vertical]/size[horizontal]));
 const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='700 256px Arial, sans-serif';const metrics=ctx.measureText(text),inkHeight=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
 ctx.setTransform(c.width*.98/metrics.width,0,0,c.height*.96/inkHeight,c.width*.01,c.height*.02);ctx.fillText(text,0,metrics.actualBoundingBoxAscent);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
 const geometry=new THREE.PlaneGeometry(size[horizontal],size[vertical]);if(normal==='y')geometry.rotateX(-Math.PI/2);if(normal==='x')geometry.rotateY(Math.PI/2);center[normal]=box.max[normal]+.002;geometry.translate(center.x,center.y,center.z);
 mesh.geometry=geometry;mesh.material=new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.025,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});mesh.castShadow=false;mesh.receiveShadow=false;mesh.userData.displayTitle=text;
}

export function removePrintedRegion(mesh,inverseFrame,region){
 if(!mesh?.isMesh)return 0;
 const geometry=mesh.geometry,positions=geometry.attributes.position,index=geometry.index,indices=[],matrix=new THREE.Matrix4().multiplyMatrices(inverseFrame,mesh.matrixWorld),point=new THREE.Vector3(),center=new THREE.Vector3();let removed=0;
 for(let i=0;i<(index?index.count:positions.count);i+=3){center.set(0,0,0);for(let j=0;j<3;j++)center.add(point.fromBufferAttribute(positions,index?index.getX(i+j):i+j).applyMatrix4(matrix));center.divideScalar(3);
  if(['x','y','z'].every(k=>center[k]>=region[k][0]&&center[k]<=region[k][1])){removed++;continue;}
  for(let j=0;j<3;j++)indices.push(index?index.getX(i+j):i+j);
 }
 const next=geometry.clone();next.setIndex(indices);mesh.geometry=next;return removed;
}
